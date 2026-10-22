// 费用规划助手 v10 引擎：按"核销池"计算可做费用与在途计划覆盖。
// 核销池 = 客户编码 × CP × BI渠道(Outlet Channel) × 机制桶；池内含 CP 机制允许的全部 Brand / Segment 产品，正负 SO 一起取净额。
// 业务口径来源：2026-10 NBS 核销规则变化（不得只取正数产品；按计划渠道整渠道 + CP 产品范围取数）。
import * as XLSX from "xlsx";

// ───────────────────────── 可调参数（集中维护） ─────────────────────────
export const CONFIG = {
  // CP 促销品牌惯称 → BI 品牌编码/品牌名（CP 里写惯称、BI 里写正式名时在这里补）
  brandAliases: {
    // 用户确认 O6K；CF202602002 限定"酥脆饼干/薄脆饼干"而 MG1 只写 SHARKWICH，故 OSA 饼干也归 SHARKWICH（推断，待确认）
    sharkwich: ["o6k", "cnnestleccsuncoatedwafer", "osa", "cnnestleccsbiscuit"],
  } as Record<string, string[]>,
  // 三档预估系数：只作用于尚未发生的部分（本月剩余天数、下月、下下月）
  scenarios: [
    { key: "low", label: "保守 85%", k: 0.85 },
    { key: "base", label: "基准 100%", k: 1 },
    { key: "high", label: "乐观 120%", k: 1.2 },
  ],
  seasonClamp: [0.7, 1.3] as [number, number],
  invFactorClamp: [0.7, 1.3] as [number, number], // 下月库存系数上下限（2026-10-22 用户确认）
  // 咖啡 SCD（零食渠道）特例（2026-10-22 用户与刘芸确认）：GPR 后整池费率锁 2%；7ct+2 不准出货核销
  scdCoffee: { channel: "scd", bu: "coffee", rateCap: 0.02, excludeS2: ["7ct+2"] },
  stockWeeks: 4, // 4 周库存 ≈ 1 个月正常销量
  stockWeight: (day: number) => (day <= 10 ? 0.1 : day <= 20 ? 0.2 : 0.3),
  targetBU: new Set(["dairy", "coffee", "confectionery"]),
  dairyExcludeSKUs: new Set(["12187803", "12585787", "12598186", "12611209"]),
  clientRestrict: { DA202601011TT: ["天虹", "东方"] } as Record<string, string[]>,
  gpr55Customers: ["天虹数科商业股份有限公司", "东莞市糖酒集团东方配销有限公司"],
  gpr55Segments: ["Senior Blue", "Senior Green"],
};

// ───────────────────────── 通用工具 ─────────────────────────
export const norm = (v: unknown) =>
  String(v ?? "").replace(/&amp;/g, "&").replace(/\s+/g, "").replace(/有限责任公司$/, "有限公司").toLowerCase();
const num = (v: unknown) => {
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
};
const list = (v: unknown) => String(v ?? "").split(/[,，;]/).map((x) => x.trim()).filter(Boolean);
export const ym = (d: Date) => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}`;
export const addMonth = (mm: string, n: number) => {
  const d = new Date(+mm.slice(0, 4), +mm.slice(4, 6) - 1 + n, 1);
  return ym(d);
};
const daysIn = (mm: string) => new Date(+mm.slice(0, 4), +mm.slice(4, 6), 0).getDate();
const monthStart = (mm: string) => new Date(+mm.slice(0, 4), +mm.slice(4, 6) - 1, 1);
const monthEnd = (mm: string) => new Date(+mm.slice(0, 4), +mm.slice(4, 6), 0);
export const quarterEnd = (mm: string) => {
  const m = +mm.slice(4, 6);
  return `${mm.slice(0, 4)}${String(Math.ceil(m / 3) * 3).padStart(2, "0")}`;
};

function parseDate(v: unknown): Date | null {
  if (!v) return null;
  if (v instanceof Date && !Number.isNaN(v.getTime())) return new Date(v.getFullYear(), v.getMonth(), v.getDate());
  if (typeof v === "number") {
    const o = XLSX.SSF.parse_date_code(v);
    return o ? new Date(o.y, o.m - 1, o.d) : null;
  }
  const s = String(v).trim();
  let m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) return new Date(+m[3], +m[1] - 1, +m[2]);
  m = s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
  return null;
}
function parseRate(v: unknown) {
  if (typeof v === "string" && v.includes("%")) return parseFloat(v) / 100;
  const x = num(v);
  return x > 1 ? x / 100 : x;
}
function expandRef(ws: any) {
  let maxR = 0, maxC = 0, seen = false;
  for (const k of Object.keys(ws || {})) {
    if (k.startsWith("!")) continue;
    const m = k.match(/^([A-Z]+)(\d+)$/);
    if (!m) continue;
    maxC = Math.max(maxC, XLSX.utils.decode_col(m[1]));
    maxR = Math.max(maxR, +m[2] - 1);
    seen = true;
  }
  if (seen) ws["!ref"] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: maxR, c: maxC } });
}
function sheetRows(wb: any, name?: string): any[][] {
  const sn = name && wb.SheetNames.includes(name) ? name : wb.SheetNames[0];
  const ws = wb.Sheets[sn];
  if (!ws) return [];
  expandRef(ws);
  return XLSX.utils.sheet_to_json(ws, { header: 1, defval: null, raw: true }) as any[][];
}
function findHeader(rs: any[][], need: string[], limit = 40) {
  for (let i = 0; i < Math.min(rs.length, limit); i++) {
    const a = (rs[i] || []).map((v) => String(v ?? "").trim());
    if (need.every((k) => a.includes(k))) return i;
  }
  return -1;
}
function hmap(h: any[]) {
  const out: Record<string, number> = {};
  h.forEach((v, i) => {
    const k = String(v ?? "").trim();
    if (k && out[k] == null) out[k] = i;
  });
  return out;
}
const cell = (r: any[], i: number | undefined) => (i == null || i < 0 ? null : r[i]);
const str = (r: any[], i: number | undefined) => String(cell(r, i) ?? "").trim();
function monthKey(v: unknown) {
  if (typeof v === "number" && Number.isFinite(v)) return /^20\d{4}$/.test(String(Math.round(v))) ? String(Math.round(v)) : "";
  const s = String(v ?? "").trim().replace(/\.0+$/, "");
  return /^20\d{4}$/.test(s) ? s : "";
}
function buKey(v: unknown) {
  const s = String(v ?? "").trim().toLowerCase();
  if (!s) return "";
  if (s.includes("dairy") || s === "奶品") return "dairy";
  if (s.includes("coffee") || s.includes("咖啡")) return "coffee";
  if (s.includes("confection") || s.includes("糖果")) return "confectionery";
  if (s === "rtd" || s.includes("ready to drink")) return "rtd";
  return s;
}

// ───────────────────────── 数据结构 ─────────────────────────
type Meta = {
  sku: string; bu: string; brandCode: string; brand: string; s1: string; s2: string; s3: string; name: string;
  aliases: Set<string>;
};
type SORow = { channel: string; code: string; name: string; sku: string; months: Record<string, number> };
type CP = {
  code: string; start: Date; end: Date; desc: string; mech: string; bu: string; mg1: string[]; sub: string;
  balance: number; type: string; isDiscount: boolean; broad: boolean; regional: boolean;
};
type Plan = {
  pl: string; code: string; name: string; channel: string; cp: string; mg1: string; skus: string[]; skuNames: string[];
  start: Date; end: Date; promoStart: Date | null; promoEnd: Date | null; remarkDates: boolean;
  orderAmount: number; rate: number; budget: number; balance: number; status: string; started: boolean;
  done: boolean; cancelled: boolean; productRemark: string; remarks: string; bu: string;
};
type RateRow = { sku: string; start: Date; end: Date; rate: number };

// ───────────────────────── 解析 ─────────────────────────
function emptyMeta(sku: string): Meta {
  return { sku, bu: "", brandCode: "", brand: "", s1: "", s2: "", s3: "", name: "", aliases: new Set() };
}
function fill(m: Meta, p: Partial<Meta>, alias?: string) {
  for (const k of ["bu", "brandCode", "brand", "s1", "s2", "s3", "name"] as const) {
    if (!m[k] && p[k]) (m as any)[k] = p[k];
  }
  if (p.brand) m.aliases.add(norm(p.brand));
  if (p.brandCode) m.aliases.add(norm(p.brandCode));
  if (alias) m.aliases.add(norm(alias));
}

function parseBI(wb: any) {
  const meta = new Map<string, Meta>();
  const get = (sku: string) => {
    let m = meta.get(sku);
    if (!m) meta.set(sku, (m = emptyMeta(sku)));
    return m;
  };
  // 产品目录：Brand / Segment 层级正本
  if (wb.SheetNames.includes("产品目录")) {
    const rs = sheetRows(wb, "产品目录");
    const hi = findHeader(rs, ["SKU", "SKU Name CN"]);
    if (hi >= 0) {
      const x = hmap(rs[hi]);
      for (const r of rs.slice(hi + 1)) {
        const sku = str(r, x["SKU"]);
        if (!sku) continue;
        fill(get(sku), {
          bu: buKey(cell(r, x["BU"])), brandCode: str(r, x["Brand"]), brand: str(r, x["Brand Name"]),
          s1: str(r, x["PH5 Segment1_MKT"]), s2: str(r, x["PH5 Segment2_Detail"]), s3: str(r, x["PH5 Segment3_Detail"]),
          name: str(r, x["SKU Name CN"]),
        });
      }
    }
  }
  // BI-SO：出货净额（千元 → 元）
  const so: SORow[] = [];
  const months: string[] = [];
  if (!wb.SheetNames.includes("BI-SO(折扣)")) throw new Error("BI 文件缺少 BI-SO(折扣) Sheet");
  {
    const rs = sheetRows(wb, "BI-SO(折扣)");
    const hi = findHeader(rs, ["Outlet Channel", "Customer Code", "SKU"]);
    if (hi < 0) throw new Error("BI-SO(折扣) 未找到 Outlet Channel / Customer Code / SKU 表头");
    const h = rs[hi];
    const x = hmap(h);
    const mc: [string, number][] = [];
    h.forEach((v, i) => {
      const k = monthKey(v);
      if (k) mc.push([k, i]);
    });
    for (const [k] of mc) months.push(k);
    for (const r of rs.slice(hi + 1)) {
      const sku = str(r, x["SKU"]);
      const code = str(r, x["Customer Code"]);
      const name = str(r, x["Customer Name"]);
      if (!sku || !name || /汇总|总计/.test(code + name)) continue;
      fill(get(sku), {
        brandCode: str(r, x["Brand"]), brand: str(r, x["Brand Name"]), s1: str(r, x["PH5 Segment1_MKT"]),
        s2: str(r, x["PH5 Segment2_Detail"]), name: str(r, x["SKU Name CN"]),
      });
      const mv: Record<string, number> = {};
      for (const [k, i] of mc) {
        const v = num(r[i]) * 1000;
        if (v) mv[k] = v;
      }
      so.push({ channel: str(r, x["Outlet Channel"]), code, name, sku, months: mv });
    }
  }
  // BI-Stock：库存金额（SOH (Good) 千元 → 元）
  const stock = new Map<string, number>();
  let stockMonth = "";
  if (wb.SheetNames.includes("BI-Stock")) {
    const rs = sheetRows(wb, "BI-Stock");
    for (const r of rs.slice(0, 8)) if (String(r?.[0] ?? "").trim() === "Order Year Month") stockMonth = monthKey(r[1]);
    const hi = findHeader(rs, ["Customer Code", "SKU", "SOH (Good)"]);
    if (hi >= 0) {
      const x = hmap(rs[hi]);
      for (const r of rs.slice(hi + 1)) {
        const sku = str(r, x["SKU"]), code = str(r, x["Customer Code"]);
        if (!sku || !code) continue;
        fill(get(sku), {
          bu: buKey(cell(r, x["BU"])), brandCode: str(r, x["Brand"]), brand: str(r, x["Brand Name"]),
          s1: str(r, x["PH5 Segment1_MKT"]), s2: str(r, x["PH5 Segment2_Detail"]), s3: str(r, x["PH5 Segment3_Detail"]),
          name: str(r, x["SKU Name CN"]),
        });
        const k = `${code}|${sku}`;
        stock.set(k, (stock.get(k) || 0) + num(cell(r, x["SOH (Good)"])) * 1000);
      }
    }
  }
  // SKURate：单品费率上限 + MG1 名称别名
  const rates: RateRow[] = [];
  if (wb.SheetNames.includes("SKURate")) {
    const rs = sheetRows(wb, "SKURate");
    const hi = findHeader(rs, ["SKUCode", "StartDate", "EndDate", "Rate"]);
    if (hi >= 0) {
      const x = hmap(rs[hi]);
      for (const r of rs.slice(hi + 1)) {
        const sku = str(r, x["SKUCode"]);
        if (!sku) continue;
        const m = meta.get(sku);
        if (m) fill(m, { bu: buKey(cell(r, x["BUName"])), name: str(r, x["SKUName"]) }, str(r, x["MG1Name"]));
        const start = parseDate(cell(r, x["StartDate"])), end = parseDate(cell(r, x["EndDate"]));
        const rate = parseRate(cell(r, x["_RateValue"]) ?? cell(r, x["Rate"]));
        if (start && end && rate > 0) rates.push({ sku, start, end, rate });
      }
    }
  }
  // 惯称别名：CP 写 SHARKWICH，BI 写 O6K / CN Nestle CCS Uncoated Wafer
  for (const m of meta.values()) {
    for (const [alias, targets] of Object.entries(CONFIG.brandAliases)) {
      if (targets.some((t) => m.aliases.has(norm(t)))) m.aliases.add(norm(alias));
    }
  }
  months.sort();
  return { meta, so, stock, stockMonth, rates, months };
}

const CPA = {
  code: ["Activity Code", "活动编码"], start: ["Activity Start Date", "活动开始日期"], end: ["Activity End Date", "活动结束日期"],
  desc: ["Activity Description", "活动描述"], mech: ["Activity Mechanism", "活动机制"], bu: ["BU", "业务单元"],
  mg1: ["MG1", "促销品牌"], sub: ["SubChannel", "渠道"], bal: ["Balance Amount", "CG可使用预算金额"],
  type: ["PromotionType", "模板类型"],
};
function aliasIdx(h: any[], names: string[]) {
  const a = h.map((v) => String(v ?? "").trim());
  for (const n of names) {
    const i = a.indexOf(n);
    if (i >= 0) return i;
  }
  return -1;
}
function parseCP(wb: any): CP[] {
  const sn = wb.SheetNames.includes("CPCenturyBigTableByCGAmount") ? "CPCenturyBigTableByCGAmount" : undefined;
  const rs = sheetRows(wb, sn);
  let hi = -1;
  for (let i = 0; i < Math.min(rs.length, 12); i++) {
    if (aliasIdx(rs[i], CPA.code) >= 0 && aliasIdx(rs[i], CPA.start) >= 0 && aliasIdx(rs[i], CPA.bal) >= 0) { hi = i; break; }
  }
  if (hi < 0) throw new Error("CP预算未识别到活动编码 / 开始日期 / 可用余额字段");
  const h = rs[hi];
  const ix = Object.fromEntries(Object.entries(CPA).map(([k, v]) => [k, aliasIdx(h, v)])) as Record<keyof typeof CPA, number>;
  const out: CP[] = [];
  for (const r of rs.slice(hi + 1)) {
    const code = str(r, ix.code);
    const start = parseDate(cell(r, ix.start)), end = parseDate(cell(r, ix.end));
    if (!code || !start || !end) continue;
    const type = str(r, ix.type);
    const mech = str(r, ix.mech);
    out.push({
      code, start, end, desc: str(r, ix.desc), mech, bu: buKey(cell(r, ix.bu)), mg1: list(cell(r, ix.mg1)).map(norm),
      sub: str(r, ix.sub), balance: num(cell(r, ix.bal)), type,
      isDiscount: type ? /价格折扣|Price Promotion|折扣/i.test(type) : !/^\s*display/i.test(mech),
      // 自定义类 CP（MT TT、区域自主）是宽口径预算池：可做折扣/陈列/上市，网站只算折扣部分
      broad: /自定义/.test(type), regional: /区域自主/.test(str(r, ix.desc)),
    });
  }
  return out;
}

function parseTTS(wb: any): Plan[] {
  const sn = wb.SheetNames.includes("PPCenturyBigTable") ? "PPCenturyBigTable" : undefined;
  const rs = sheetRows(wb, sn);
  const hi = findHeader(rs, ["PPCode", "Distributor Name", "Activity Code in Cycle Plan"]);
  if (hi < 0) throw new Error("TTS 未找到 PPCode / Distributor Name / Activity Code in Cycle Plan 表头");
  const x = hmap(rs[hi]);
  const by = new Map<string, Plan>();
  for (const r of rs.slice(hi + 1)) {
    const pl = str(r, x["PPCode"]);
    if (!pl) continue;
    const ps = parseDate(cell(r, x["Promotion Start Date"])), pe = parseDate(cell(r, x["Promotion End Date"]));
    const rsd = parseDate(cell(r, x["RemarkStartDate"])), red = parseDate(cell(r, x["RemarkEndDate"]));
    const start = rsd || ps, end = red || pe;
    if (!start || !end) continue;
    const status = str(r, x["Status"]);
    let p = by.get(pl);
    if (!p) {
      p = {
        pl, code: str(r, x["Distributor Code"]), name: str(r, x["Distributor Name"]), channel: str(r, x["Channel"]),
        cp: str(r, x["Activity Code in Cycle Plan"]), mg1: str(r, x["MG1"]), skus: [], skuNames: [],
        start, end, promoStart: ps, promoEnd: pe, remarkDates: !!(rsd && red),
        orderAmount: 0, rate: parseRate(cell(r, x["Disc.Rate"])), budget: 0, balance: 0, status,
        started: str(r, x["Whether to start off"]) === "是", done: /核销已完成/.test(status), cancelled: /撤销/.test(status),
        productRemark: str(r, x["Product Remark"]), remarks: str(r, x["Remarks"]), bu: buKey(cell(r, x["Business Name"])),
      };
      by.set(pl, p);
    }
    const sku = str(r, x["Product Code"]);
    if (sku && !p.skus.includes(sku)) { p.skus.push(sku); p.skuNames.push(str(r, x["Product Description"])); }
    p.orderAmount += num(cell(r, x["Order Amount"]));
    p.budget += num(cell(r, x["Total Budget"]));
    p.balance += num(cell(r, x["Balance Amount"]));
  }
  return [...by.values()];
}

// ───────────────────────── 渠道映射 ─────────────────────────
// BI Outlet Channel → CP / TTS 渠道写法里的关键词
function channelTokens(bi: string) {
  const a: Record<string, string[]> = {
    sm: ["hyper&super", "lkagroup", "lkaothers"], hm: ["hyper&super"], ws: ["wholesale"],
    "mm-a": ["mm-a"], "mm-b": ["mm-b"], "mm-c": ["mm-c"], speciality: ["specialty"], ss_kiosks: ["smallstore"],
    sd1: ["sd1", "sub-d"], scd: ["scd"], cgp: ["cgp"], b2b: ["b2b"], b2c: ["b2c"], cvs: ["cvs"],
  };
  const k = norm(bi);
  return a[k] || [k];
}
const channelMatches = (text: string, bi: string) => {
  const t = norm(text);
  return !!t && channelTokens(bi).some((v) => t.includes(v));
};

// ───────────────────────── CP 产品范围 ─────────────────────────
function escRe(v: string) {
  return v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function isNegativeToken(text: string, token: string) {
  const t = String(token || "").trim();
  if (t.length < 2) return false;
  const e = escRe(t);
  const tok = `(?:^|[^A-Za-z0-9])${e}(?=$|[^A-Za-z0-9])`;
  return new RegExp(`${tok}.{0,12}(?:无折扣|不支持|不可核销|不可使用|不得核销|不得使用)`, "is").test(text) ||
    new RegExp(`(?:不含|排除).{0,12}${tok}`, "is").test(text);
}
// "仅限制…不超过x%" 是费率上限，不是产品限定；只有"限定产品 / 仅限(非'仅限制') / 只限"才收窄产品
const STRONG = /限定产品|仅限(?!制)|只限/;

function buildScope(cp: CP, pool: Meta[]) {
  const text = `${cp.desc} ${cp.mech}`;
  let labels: Set<string> | null = null;
  let itemMatch: ((m: Meta) => boolean) | null = null;
  let itemLabel = "", itemMiss = "";
  let rule = "";
  if (cp.bu === "confectionery") {
    if (/pnm[-－]coated/i.test(text)) rule = "pnm-coated";
    else if (/ip口味/i.test(text)) rule = "ip";
    else if (STRONG.test(text)) {
      // "限定产品：32ct\24ct\Bowl_212.5g\Uncoated_14ct\Gifting Box全系列" → 逐项匹配 Segment（下划线 = 同时满足）
      const phrase = (text.match(/(?:限定产品|仅限(?!制)|只限)[：:]?\s*([^。；;]+?)(?:全系列|，其他|,其他|其他|。|；|$)/) || [])[1] || "";
      const items = phrase.replace(/gifting\s*box/ig, "GB").split(/[\\/、,，]/).map((x) => x.trim()).filter(Boolean)
        .map((it) => it.split("_").map((p) => norm(p)).filter(Boolean));
      const segTokens = (m: Meta) => [m.s1, m.s2, m.s3].flatMap((v) => [norm(v), ...String(v || "").toLowerCase().split(/\s+/).filter(Boolean)]);
      const hit = (m: Meta) => items.some((parts) => parts.every((p) => segTokens(m).includes(p) || norm(m.name).includes(p)));
      if (items.length && pool.some(hit)) { itemMatch = hit; itemLabel = phrase.trim(); }
      else if (items.length) itemMiss = phrase.trim();
    }
  }
  const dairyExplicit: string[] = [];
  if (cp.bu === "dairy") {
    if (/新西兰/.test(cp.mech)) dairyExplicit.push("新西兰");
    if (/全脂375g/.test(cp.mech)) dairyExplicit.push("全脂375g");
    if (/甜奶粉/.test(cp.mech)) dairyExplicit.push("甜奶粉300g");
  }
  const timed: { from: string; channel: string; label: string }[] = [];
  for (const m of text.matchAll(/(\d{1,2})月(\d{1,2})日起[^。；;]*?(SM|HM|WS|MM)门店不得核销\s*([0-9A-Za-z_.\-]+)/g)) {
    timed.push({ from: `${cp.start.getFullYear()}${String(+m[1]).padStart(2, "0")}`, channel: norm(m[3]), label: norm(m[4]) });
  }
  const allows = (m: Meta) => {
    for (const tok of [m.sku, m.s1, m.s2, m.s3]) if (isNegativeToken(text, tok)) return false;
    if (rule === "pnm-coated") return norm(m.s1) === "pnm" && norm(m.s2 || m.s3) === "coated";
    if (rule === "ip") return norm(m.s3) === "ip";
    if (itemMatch) return itemMatch(m);
    if (labels) return [m.s1, m.s2, m.s3].some((v) => labels!.has(norm(v)));
    if (dairyExplicit.length) return dairyExplicit.some((v) => m.s3.includes(v));
    return true;
  };
  const timedOut = (m: Meta, channel: string, mm: string) =>
    timed.some((t) => t.channel === norm(channel) && mm >= t.from && [m.sku, m.s1, m.s2, m.s3].some((v) => norm(v) === t.label));
  const scopeLabel = rule === "pnm-coated" ? "PNM-Coated" : rule === "ip" ? "IP口味" : itemMatch ? `限定：${itemLabel}` : labels ? `限定：${[...labels].join("/")}` : dairyExplicit.length ? `限定：${dairyExplicit.join("/")}` : "CP 全部品牌";
  return { allows, timedOut, scopeLabel, itemMiss, timedNote: timed.map((t) => `${t.from.slice(4)}月起${t.channel.toUpperCase()}不含${t.label}`).join("；") };
}

// ───────────────────────── 费率 ─────────────────────────
function mechKind(cp: CP, m: Meta): { kind: string; rate: number | null } {
  const t = (cp.desc + " " + cp.mech).replace(/：/g, ":");
  const s = (m.s1 + " " + m.s2 + " " + m.s3 + " " + m.name).toLowerCase();
  const tests: [RegExp, string][] = [
    [/中老年[^%]{0,40}?(\d+(?:\.\d+)?)%/i, "senior"],
    [/N3[^%]{0,40}?(\d+(?:\.\d+)?)%/i, "n3"],
    [/全家[^%]{0,40}?(\d+(?:\.\d+)?)%/i, "family"],
  ];
  const hits = tests.filter(([q]) => q.test(t));
  if (hits.length >= 2) {
    for (const [q, k] of hits) if (s.includes(k)) return { kind: k, rate: Number(t.match(q)![1]) / 100 };
  }
  const all = [...new Set([...t.matchAll(/(\d+(?:\.\d+)?)\s*%/g)].map((x) => Number(x[1]) / 100))];
  return { kind: "", rate: all.length === 1 ? all[0] : null };
}
const BUCKET_LABEL: Record<string, string> = { senior: "中老年", n3: "N3", family: "全家", "": "" };

// ───────────────────────── 主计算 ─────────────────────────
export type AnalyzeArgs = { biWb: any; ttsWb: any; cpWb: any; today: Date; dataDate: Date; minBalance: number };

export function analyze(a: AnalyzeArgs) {
  const bi = parseBI(a.biWb);
  const cps = parseCP(a.cpWb);
  const plans = parseTTS(a.ttsWb);
  const cur = ym(a.today);
  const m1 = addMonth(cur, 1), m2 = addMonth(cur, 2);
  const qEnd = quarterEnd(cur);
  const dataInCur = ym(a.dataDate) === cur;
  const doneDays = dataInCur ? a.dataDate.getDate() : 0;
  const remainDays = daysIn(cur) - doneDays;
  const stockW = CONFIG.stockWeight(doneDays || 1);
  const warnings: string[] = [];

  // 宽口径 CP：TTS 里有带折扣率的计划，就按折扣池计算
  for (const c of cps) if (c.broad && plans.some((p) => p.cp === c.code && p.rate > 0 && !p.cancelled)) c.isDiscount = true;
  const cpBy = new Map(cps.map((c) => [c.code, c]));
  const ttsRateByCP = new Map<string, number | null>();
  for (const c of cps) {
    const u = [...new Set(plans.filter((p) => p.cp === c.code && p.rate > 0).map((p) => +p.rate.toFixed(6)))];
    ttsRateByCP.set(c.code, u.length === 1 ? u[0] : null);
  }
  const gprSet = new Set(CONFIG.gpr55Customers.map(norm));
  const gprSeg = new Set(CONFIG.gpr55Segments.map(norm));
  const skuRate = (sku: string, mm: string) => {
    const s = monthStart(mm), e = monthEnd(mm);
    const v = [...new Set(bi.rates.filter((r) => r.sku === sku && r.start <= e && r.end >= s).map((r) => +r.rate.toFixed(6)))];
    return v.length === 1 ? v[0] : null;
  };
  const rateFor = (cp: CP, m: Meta, name: string, mm: string, channel = "") => {
    const r0 = rateBase(cp, m, name, mm);
    if (channel && isScdCoffee(cp.bu, channel)) return Math.min(r0 ?? CONFIG.scdCoffee.rateCap, CONFIG.scdCoffee.rateCap);
    return r0;
  };
  const rateBase = (cp: CP, m: Meta, name: string, mm: string) => {
    const mk = mechKind(cp, m).rate;
    const sr = skuRate(m.sku, mm);
    const tr = ttsRateByCP.get(cp.code) ?? null;
    const isGpr = gprSet.has(norm(name)) && gprSeg.has(norm(m.s2));
    if (cp.broad) {
      // 宽口径 CP 机制里没有费率：按单品最高核销率（SKURate）计算
      const g = sr ?? mk;
      return g == null ? null : isGpr ? Math.max(0, g - 0.055) : g;
    }
    if (isGpr) {
      const g = mk ?? sr;
      if (g != null) return Math.max(0, g - 0.055);
      return tr;
    }
    return tr ?? mk ?? sr;
  };

  // 每个 CP 的候选产品池
  const metaList = [...bi.meta.values()];
  const cpInfo = new Map<string, ReturnType<typeof buildScope> & { skus: Set<string>; unmatched: string[] }>();
  for (const cp of cps) {
    if (!CONFIG.targetBU.has(cp.bu)) continue;
    const base = metaList.filter((m) => m.bu === cp.bu && (!cp.mg1.length || cp.mg1.some((g) => m.aliases.has(g))));
    const sc = buildScope(cp, base);
    const skus = new Set(base.filter((m) => sc.allows(m) && !(cp.bu === "dairy" && CONFIG.dairyExcludeSKUs.has(m.sku))).map((m) => m.sku));
    const unmatched = cp.mg1.filter((g) => !metaList.some((m) => m.bu === cp.bu && m.aliases.has(g)));
    cpInfo.set(cp.code, { ...sc, skus, unmatched });
  }
  const clientOK = (cp: CP, name: string) => {
    const r = CONFIG.clientRestrict[cp.code];
    return !r || r.some((k) => name.includes(k));
  };
  const SC = CONFIG.scdCoffee;
  const isScdCoffee = (bu: string, channel: string) => bu === SC.bu && norm(channel) === SC.channel;
  // SCD 渠道不纳入核销池的咖啡产品（7ct+2）
  const scdExcluded = (sku: string, channel: string) => {
    const m = bi.meta.get(sku);
    return !!m && isScdCoffee(m.bu, channel) && SC.excludeS2.some((x) => norm(x) === norm(m.s2));
  };

  // 核销池
  type Cell = { actual: number; neg: number; occDone: number; occOpen: number; occCross: number; fee: number; feeW: number };
  type Pool = {
    id: string; code: string; name: string; cp: string; channel: string; bucket: string;
    skus: Map<string, Record<string, number>>; cells: Record<string, Cell>; stock: number; stockKnown: boolean; rate: Record<string, number | null>;
    occFee: Record<string, number>; occPlans: Record<string, Set<string>>;
    plans: string[];
  };
  const pools = new Map<string, Pool>();
  const getPool = (code: string, name: string, cp: string, channel: string, bucket: string) => {
    const id = `${code}|${cp}|${channel}|${bucket}`;
    let p = pools.get(id);
    if (!p) pools.set(id, (p = { id, code, name, cp, channel, bucket, skus: new Map(), cells: {}, stock: 0, stockKnown: false, rate: {}, plans: [], occFee: {}, occPlans: {} }));
    return p;
  };
  const cellOf = (p: Pool, mm: string) => (p.cells[mm] ||= { actual: 0, neg: 0, occDone: 0, occOpen: 0, occCross: 0, fee: 0, feeW: 0 });

  // 库存按渠道分摊：同一客户×SKU 在各渠道的近期正出货占比
  const posRecent = (r: SORow) => [cur, addMonth(cur, -1), addMonth(cur, -2), addMonth(cur, -3)].reduce((s, mm) => s + Math.max(0, r.months[mm] || 0), 0);
  const skuChannelTotal = new Map<string, number>();
  const skuChannelCount = new Map<string, number>();
  for (const r of bi.so) {
    const k = `${r.code}|${r.sku}`;
    skuChannelTotal.set(k, (skuChannelTotal.get(k) || 0) + posRecent(r));
    skuChannelCount.set(k, (skuChannelCount.get(k) || 0) + 1);
  }

  // 换编码客户：同名下只有一个编码近两个月有出货时，把停用编码的历史并入现行编码（只用于"能做多少费用"，在途计划仍按计划编码核对）
  const codeAlias = new Map<string, string>();
  {
    const act = new Map<string, number>();
    const byName = new Map<string, Set<string>>();
    for (const r of bi.so) {
      act.set(r.code, (act.get(r.code) || 0) + Math.abs(r.months[cur] || 0) + Math.abs(r.months[addMonth(cur, -1)] || 0));
      const k = norm(r.name);
      if (!byName.has(k)) byName.set(k, new Set());
      byName.get(k)!.add(r.code);
    }
    for (const codes of byName.values()) {
      if (codes.size < 2) continue;
      // 现行编码 = 近两个月出货（绝对值）占同名合计 ≥ 5% 的编码；只剩一个时其余视为停用
      const tot = [...codes].reduce((x, c) => x + (act.get(c) || 0), 0);
      const live = [...codes].filter((c) => (act.get(c) || 0) >= Math.max(1, tot * 0.05));
      if (live.length !== 1) continue;
      for (const c of codes) if (c !== live[0]) codeAlias.set(c, live[0]);
    }
  }
  const capCode = (c: string) => codeAlias.get(c) || c;

  // BI-Stock 里出现过的客户编码：没出现的视为库存数据缺失（下月库存系数回落 1.00），出现过但该池为 0 视为真实无库存
  const stockCodes = new Set([...bi.stock.keys()].map((k) => k.split("|")[0]));
  const monthsAll = [...new Set([...bi.months, cur, m1, m2])].sort();
  for (const cp of cps) {
    const info = cpInfo.get(cp.code);
    if (!info) continue;
    for (const r of bi.so) {
      if (!info.skus.has(r.sku) || !clientOK(cp, r.name) || !channelMatches(cp.sub, r.channel) || scdExcluded(r.sku, r.channel)) continue;
      const m = bi.meta.get(r.sku)!;
      const bucket = mechKind(cp, m).kind;
      const p = getPool(capCode(r.code), r.name, cp.code, r.channel, bucket);
      const vals: Record<string, number> = {};
      for (const mm of monthsAll) {
        const v = info.timedOut(m, r.channel, mm) ? 0 : (r.months[mm] || 0);
        if (!v) continue;
        vals[mm] = v;
        const c = cellOf(p, mm);
        c.actual += v;
        if (v < 0) c.neg += v;
        const rt = rateFor(cp, m, r.name, mm, r.channel);
        if (rt != null) { const w = Math.max(Math.abs(v), 1); c.fee += rt * w; c.feeW += w; }
      }
      const prev = p.skus.get(r.sku) || {};
      for (const [mm, v] of Object.entries(vals)) prev[mm] = (prev[mm] || 0) + v;
      p.skus.set(r.sku, prev);
      const k = `${r.code}|${r.sku}`;
      const tot = skuChannelTotal.get(k) || 0;
      const share = tot > 0 ? posRecent(r) / tot : 1 / (skuChannelCount.get(k) || 1);
      p.stock += (bi.stock.get(k) || 0) * share;
      if (stockCodes.has(r.code)) p.stockKnown = true;
    }
  }

  // 已有计划占用：按计划进货金额、按天数分摊到月份
  const biChannels = [...new Set(bi.so.map((r) => r.channel))];
  const planRows: any[] = [];
  const skippedRTD = plans.filter((p) => p.bu === "rtd" && !p.done && !p.cancelled).length;
  for (const pl of plans) {
    if (pl.cancelled || pl.orderAmount <= 0 || pl.rate <= 0) continue;
    if (pl.bu && !CONFIG.targetBU.has(pl.bu)) continue;
    const cp = cpBy.get(pl.cp);
    const info = cpInfo.get(pl.cp);
    const chans = biChannels.filter((c) => channelMatches(pl.channel, c));
    const m = bi.meta.get(pl.skus[0] || "") || emptyMeta(pl.skus[0] || "");
    const bucket = cp ? mechKind(cp, m).kind : "";
    const totalDays = Math.max(1, Math.round((pl.end.getTime() - pl.start.getTime()) / 864e5) + 1);
    const split: { mm: string; amount: number; parts: { pool: string; amount: number }[] }[] = [];
    let d = new Date(pl.start.getFullYear(), pl.start.getMonth(), 1);
    while (d <= pl.end) {
      const mm = ym(d);
      const s = new Date(Math.max(pl.start.getTime(), monthStart(mm).getTime()));
      const e = new Date(Math.min(pl.end.getTime(), monthEnd(mm).getTime()));
      const days = Math.round((e.getTime() - s.getTime()) / 864e5) + 1;
      const amt = pl.orderAmount * days / totalDays;
      const cands = chans.map((c) => pools.get(`${capCode(pl.code)}|${pl.cp}|${c}|${bucket}`)).filter(Boolean) as Pool[];
      const parts: { pool: string; amount: number }[] = [];
      if (cp && info) {
        let targets = cands;
        if (!targets.length) {
          const ch = chans[0] || pl.channel || "未匹配渠道";
          targets = [getPool(capCode(pl.code), pl.name, pl.cp, ch, bucket)];
        }
        const weights = targets.map((p) => Math.max(0, p.cells[mm]?.actual || 0));
        const wsum = weights.reduce((x, y) => x + y, 0);
        targets.forEach((p, i) => {
          const share = wsum > 0 ? weights[i] / wsum : (i === 0 ? 1 : 0);
          if (!share) return;
          const c = cellOf(p, mm);
          if (pl.done) c.occDone += amt * share; else c.occOpen += amt * share;
          if (!pl.done && ym(pl.end) > mm) c.occCross += amt * share;
          if (!p.plans.includes(pl.pl)) p.plans.push(pl.pl);
          p.occFee[mm] = (p.occFee[mm] || 0) + amt * share * pl.rate;
          (p.occPlans[mm] ||= new Set()).add(pl.pl);
          parts.push({ pool: p.id, amount: amt * share });
        });
      }
      split.push({ mm, amount: amt, parts });
      d = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    }
    planRows.push({ pl, split, cpFound: !!cp });
  }

  // 池费率（按月）
  const poolRate = (p: Pool, mm: string) => {
    const c = p.cells[mm];
    if (c && c.feeW > 0) return c.fee / c.feeW;
    // 无出货月份：沿用最近有费率的月份
    for (let i = 1; i <= 6; i++) {
      const cc = p.cells[addMonth(mm, -i)];
      if (cc && cc.feeW > 0) return cc.fee / cc.feeW;
    }
    const cp = cpBy.get(p.cp);
    if (!cp) return null;
    const rs = [...p.skus.keys()].map((sku) => rateFor(cp, bi.meta.get(sku) || emptyMeta(sku), p.name, mm, p.channel)).filter((v) => v != null) as number[];
    return rs.length ? rs.reduce((x, y) => x + y, 0) / rs.length : null;
  };

  // 预测：已发生不动；本月剩余 = 趋势(+库存)；下月/下下月 = 近3个完整月均值 × 季节系数
  const forecastSeries = (A: (mm: string) => number, stock: number, stockKnown = true) => {
    const last3 = [addMonth(cur, -1), addMonth(cur, -2), addMonth(cur, -3)];
    const base = Math.max(0, last3.reduce((s, mm) => s + A(mm), 0) / 3);
    const lyAvg = last3.map((x) => A(addMonth(x, -12))).reduce((s, v) => s + v, 0) / 3;
    const season = (mm: string) => {
      const ly = A(addMonth(mm, -12));
      if (ly > 0 && lyAvg > 0) return Math.min(CONFIG.seasonClamp[1], Math.max(CONFIG.seasonClamp[0], ly / lyAvg));
      return 1;
    };
    const fut = (mm: string) => base * season(mm);
    // 下月库存系数：库存周数 ÷ 4（4 周 ≈ 1 个月正常出货），限 0.7–1.3；只作用于下月，体现经销商承接能力
    const weeks = base > 0 ? Math.max(0, stock) / base * 4 : null;
    const invF = !stockKnown || weeks == null ? 1 : Math.min(CONFIG.invFactorClamp[1], Math.max(CONFIG.invFactorClamp[0], weeks / 4));
    const mtd = A(cur);
    let remain: number;
    if (doneDays > 0) {
      const trend = Math.max(0, mtd / doneDays * remainDays);
      const inv = Math.max(0, stock) / CONFIG.stockWeeks * (remainDays / 7);
      remain = stock > 0 ? trend * (1 - stockW) + inv * stockW : trend;
    } else remain = fut(cur);
    return { base, mtd, remain, m1: fut(m1) * invF, m2: fut(m2), s1: season(m1), s2: season(m2), last3: last3.map(A), ly: [A(addMonth(cur, -12)), A(addMonth(m1, -12)), A(addMonth(m2, -12))], stock, weeks: stockKnown ? weeks : null, invF };
  };
  const forecastOf = (p: Pool) => forecastSeries((mm) => p.cells[mm]?.actual || 0, p.stock, p.stockKnown);

  // 在途计划核销体检：每条计划按"计划渠道 + 产品范围"取净出货；备注指定了产品时按备注范围，否则按 CP 全范围
  const soByCC = new Map<string, SORow[]>();
  for (const r of bi.so) {
    const k = `${r.code}|${r.channel}`;
    const arr = soByCC.get(k);
    if (arr) arr.push(r); else soByCC.set(k, [r]);
  }
  const stockShareOf = (r: SORow) => {
    const k = `${r.code}|${r.sku}`;
    const tot = skuChannelTotal.get(k) || 0;
    return (bi.stock.get(k) || 0) * (tot > 0 ? posRecent(r) / tot : 1 / (skuChannelCount.get(k) || 1));
  };
  type PS = {
    pl: Plan; cp: CP; info: NonNullable<ReturnType<typeof cpInfo.get>>; scope: Set<string>; chans: string[];
    amt: Record<string, number>; scopeNote: string; excl: string[];
  };
  const psList: PS[] = [];
  const psByCode = new Map<string, PS[]>();
  const remarkNotes: string[] = [];
  for (const row of planRows) {
    const pl: Plan = row.pl;
    const cp = cpBy.get(pl.cp);
    const info = cpInfo.get(pl.cp);
    if (!cp || !info) continue;
    const cpSkus = [...info.skus].map((k) => bi.meta.get(k)!).filter(Boolean);
    const rs = remarkScope(pl.remarks, cpSkus, pl.rate);
    let scope: Set<string>;
    let scopeNote: string;
    if (rs.skus) { scope = rs.skus; scopeNote = `按备注：${rs.text}`; }
    else {
      const m0 = bi.meta.get(pl.skus[0] || "");
      const kind = m0 ? mechKind(cp, m0).kind : "";
      scope = new Set(kind ? cpSkus.filter((m) => mechKind(cp, m).kind === kind).map((m) => m.sku) : info.skus);
      scopeNote = rs.text ? `备注范围未识别（${rs.text}），按 CP 全范围` : `CP 全范围（${info.scopeLabel}${kind ? "·" + BUCKET_LABEL[kind] : ""}）`;
      if (rs.text && !pl.done) remarkNotes.push(pl.pl);
    }
    if (rs.group) scopeNote += `；备注限定客户组「${rs.group}」，BI 无客户组拆分，按整个客户计`;
    const amt: Record<string, number> = {};
    for (const sp of row.split) amt[sp.mm] = (amt[sp.mm] || 0) + sp.amount;
    const excl = [...pl.remarks.matchAll(/PL\d{6}-\d{2}-[A-Z]+-\d+/g)].map((m) => m[0]);
    const ps: PS = { pl, cp, info, scope, chans: biChannels.filter((c) => channelMatches(pl.channel, c)), amt, scopeNote, excl };
    psList.push(ps);
    const arr = psByCode.get(pl.code);
    if (arr) arr.push(ps); else psByCode.set(pl.code, [ps]);
  }
  // 区域自主 CP 墙：同客户×同渠道×同月×同 SKU 范围内，其他 CP 已做计划的费用要先扣掉
  const psByCap = new Map<string, PS[]>();
  for (const Q of psList) {
    const k = capCode(Q.pl.code);
    const arr = psByCap.get(k);
    if (arr) arr.push(Q); else psByCap.set(k, [Q]);
  }
  const wallFee = (p: Pool, mm: string) => {
    let w = 0;
    const items: { pl: string; cp: string; fee: number }[] = [];
    for (const Q of psByCap.get(p.code) || []) {
      if (Q.cp.code === p.cp || !Q.chans.includes(p.channel) || Q.pl.rate <= 0) continue;
      const qa = Q.amt[mm] || 0;
      if (!qa) continue;
      let ov = 0, tot = 0;
      for (const ch of Q.chans) for (const r of soByCC.get(`${Q.pl.code}|${ch}`) || []) {
        if (!Q.scope.has(r.sku) || scdExcluded(r.sku, ch)) continue;
        const v = Math.max(0, r.months[mm] || 0);
        tot += v;
        if (ch === p.channel && p.skus.has(r.sku)) ov += v;
      }
      let frac: number;
      if (tot > 0) frac = ov / tot;
      else {
        const n = [...Q.scope].filter((k) => p.skus.has(k)).length;
        frac = Q.scope.size ? n / Q.scope.size / Math.max(1, Q.chans.length) : 0;
      }
      const fee = qa * Q.pl.rate * Math.min(1, Math.max(0, frac));
      if (fee >= 1) { w += fee; items.push({ pl: Q.pl.pl, cp: Q.cp.code, fee }); }
    }
    return { w, items };
  };

  const scen = CONFIG.scenarios;
  const poolOut: any[] = [];
  for (const p of pools.values()) {
    const cp = cpBy.get(p.cp)!;
    const info = cpInfo.get(p.cp)!;
    if (!cp.isDiscount || ym(cp.end) < cur) continue;
    const f = forecastOf(p);
    const inCP = (mm: string) => mm >= ym(cp.start) && mm <= ym(cp.end);
    const occ = (mm: string) => (p.cells[mm]?.occDone || 0) + (p.cells[mm]?.occOpen || 0);
    const months: Record<string, any> = {};
    const futureMonths = [cur, m1, m2];
    // 跨月计划：本月出货不够的部分由下月出货接着覆盖（NBS 按整个计划期取数），只把这部分结转到下月扣减
    let carryIn = scen.map(() => 0);
    for (const mm of futureMonths) {
      const rate = poolRate(p, mm);
      const so = scen.map((s) => (mm === cur ? f.mtd + f.remain * s.k : (mm === m1 ? f.m1 : f.m2) * s.k));
      const rem = so.map((v, j) => v - occ(mm) - carryIn[j]);
      const cross = p.cells[mm]?.occCross || 0;
      const wall = cp.regional ? wallFee(p, mm) : { w: 0, items: [] as any[] };
      const carryOut = rem.map((v) => (v < 0 ? Math.min(-v, cross) : 0));
      months[mm] = {
        inCP: inCP(mm), rate, actual: p.cells[mm]?.actual || 0, occ: occ(mm), occFee: p.occFee[mm] || 0, occN: p.occPlans[mm]?.size || 0, carryIn: [...carryIn], so, rem,
        fee: rem.map((v) => (inCP(mm) && rate != null ? Math.max(0, Math.max(0, v) * rate - wall.w) : 0)),
        gap: rem.map((v, j) => (v < 0 ? v + carryOut[j] : 0)),
        carryOut, wall: wall.w, wallItems: wall.items.sort((x, y) => y.fee - x.fee).slice(0, 6),
      };
      carryIn = carryOut;
    }
    const hist: any[] = [];
    for (const mm of monthsAll.filter((x) => x < cur && x >= ym(cp.start) && x <= ym(cp.end))) {
      const rate = poolRate(p, mm);
      const actual = p.cells[mm]?.actual || 0;
      const rem = actual - occ(mm);
      hist.push({ mm, actual, neg: p.cells[mm]?.neg || 0, occ: occ(mm), rem, rate, fee: rate != null ? Math.max(0, rem) * rate : null });
    }
    const quarter = scen.map((_, i) => futureMonths.filter((mm) => mm <= qEnd).reduce((s, mm) => s + months[mm].fee[i], 0));
    const nextQ = scen.map((_, i) => futureMonths.filter((mm) => mm > qEnd).reduce((s, mm) => s + months[mm].fee[i], 0));
    const recentMonths = [addMonth(cur, -3), addMonth(cur, -2), addMonth(cur, -1), cur];
    const skuRows = [...p.skus.entries()].map(([sku, mv]) => {
      const m = bi.meta.get(sku)!;
      return { sku, name: m?.name || sku, s1: m?.s1 || "", s2: m?.s2 || "", brand: m?.brand || "", v: recentMonths.map((mm) => mv[mm] || 0) };
    }).filter((r) => r.v.some((x) => Math.abs(x) >= 1)).sort((x, y) => Math.abs(y.v[3]) + Math.abs(y.v[2]) - Math.abs(x.v[3]) - Math.abs(x.v[2])).slice(0, 40);
    // 推荐产品组：按近 3 个完整月 + 本月净出货 × 费率（可做费用）高低排
    const win = [addMonth(cur, -3), addMonth(cur, -2), addMonth(cur, -1), cur];
    const grp = new Map<string, { group: string; so: number; fee: number; top: { sku: string; name: string; so: number } }>();
    for (const [sku, mv] of p.skus) {
      const m = bi.meta.get(sku);
      if (!m) continue;
      const so = win.reduce((x, mm) => x + (mv[mm] || 0), 0);
      const rt = rateFor(cp, m, p.name, cur, p.channel) ?? poolRate(p, cur) ?? 0;
      const g = m.s2 || m.s1 || m.brand || "其他";
      const x = grp.get(g) || { group: g, so: 0, fee: 0, top: { sku, name: m.name, so: -Infinity } };
      x.so += so;
      x.fee += Math.max(0, so) * rt;
      if (so > x.top.so) x.top = { sku, name: m.name, so };
      grp.set(g, x);
    }
    const recommend = [...grp.values()].filter((x) => x.fee > 0).sort((x, y) => y.fee - x.fee).slice(0, 5);
    poolOut.push({
      id: p.id, broad: cp.broad, regional: cp.regional, recommend, code: p.code, name: p.name, cp: p.cp, cpDesc: cp.desc, cpBalance: cp.balance, cpEnd: ym(cp.end), bu: cp.bu,
      channel: p.channel, bucket: BUCKET_LABEL[p.bucket] ?? p.bucket, scope: info.scopeLabel, timedNote: info.timedNote,
      stock: p.stock, forecast: f, months, hist, quarter, nextQ, plans: p.plans, recentMonths, skuRows,
      plannable: cp.balance >= a.minBalance && cp.isDiscount,
    });
  }

  // 每条计划：渠道内各 SKU 每月出货（缓存，避免重复扫描）
  const skuMonthCache = new Map<PS, Map<string, Record<string, number>>>();
  const skuMonths = (ps: PS) => {
    let c = skuMonthCache.get(ps);
    if (c) return c;
    c = new Map();
    for (const ch of ps.chans) for (const r of soByCC.get(`${ps.pl.code}|${ch}`) || []) {
      if ((!ps.info.skus.has(r.sku) && !ps.scope.has(r.sku)) || scdExcluded(r.sku, ch)) continue;
      const m = bi.meta.get(r.sku);
      const rec = c.get(r.sku) || {};
      for (const [mm, v] of Object.entries(r.months)) {
        if (m && ps.info.timedOut(m, ch, mm)) continue;
        rec[mm] = (rec[mm] || 0) + v;
      }
      c.set(r.sku, rec);
    }
    skuMonthCache.set(ps, c);
    return c;
  };
  const series = (ps: PS, skus: Set<string>, mm: string) => {
    let v = 0;
    for (const [sku, rec] of skuMonths(ps)) if (skus.has(sku)) v += rec[mm] || 0;
    return v;
  };
  const scopeStock = (ps: PS) => {
    let v = 0;
    for (const ch of ps.chans) for (const r of soByCC.get(`${ps.pl.code}|${ch}`) || []) if (ps.scope.has(r.sku) && !scdExcluded(r.sku, ch)) v += stockShareOf(r);
    return v;
  };
  const biCodes = new Set(bi.so.map((r) => r.code));
  const open: any[] = [];
  for (const P of psList) {
    if (P.pl.done) continue;
    const peers = (psByCode.get(P.pl.code) || []).filter((Q) => Q !== P && (Q.cp.code === P.cp.code || P.excl.includes(Q.pl.pl)) && Q.chans.some((c) => P.chans.includes(c)));
    const fc = forecastSeries((mm) => series(P, P.scope, mm), scopeStock(P), stockCodes.has(P.pl.code));
    let avail = 0, fcst = 0, returns = 0, gross = 0, peerDone = 0;
    const returnSkus = new Map<string, number>();
    const monthsList = Object.keys(P.amt).sort();
    let sharedWith = 0;
    const perMonth: { mm: string; need: number; avail: number; fcst: number }[] = [];
    for (const mm of monthsList) {
      const S = series(P, P.scope, mm);
      let doneDeduct = 0, openW = P.amt[mm];
      for (const Q of peers) {
        const qa = Q.amt[mm] || 0;
        if (!qa) continue;
        const ov = new Set([...P.scope].filter((k) => Q.scope.has(k)));
        if (!ov.size) continue;
        const den = series(Q, Q.scope, mm);
        const frac = den > 0 ? Math.min(1, Math.max(0, series(Q, ov, mm) / den)) : ov.size / Q.scope.size;
        if (Q.pl.done || P.excl.includes(Q.pl.pl)) doneDeduct += qa * frac;
        else { openW += qa * frac; sharedWith++; }
      }
      const share = openW > 0 ? P.amt[mm] / openW : 1;
      gross += S;
      peerDone += doneDeduct;
      avail += (S - doneDeduct) * share;
      for (const ch of P.chans) for (const r of soByCC.get(`${P.pl.code}|${ch}`) || []) {
        if (!P.scope.has(r.sku) || scdExcluded(r.sku, ch)) continue;
        const v = r.months[mm] || 0;
        if (v < 0) { returns += v * share; returnSkus.set(r.sku, (returnSkus.get(r.sku) || 0) + v * share); }
      }
      const mf = mm === cur ? fc.remain * share : mm === m1 ? fc.m1 * share : mm === m2 ? fc.m2 * share : 0;
      fcst += mf;
      perMonth.push({ mm, need: P.amt[mm], avail: (S - doneDeduct) * share, fcst: mf });
    }
    const pl = P.pl;
    const need = pl.orderAmount;
    const lastMonth = monthsList[monthsList.length - 1] || cur;
    const closed = lastMonth < cur;
    const shortNow = Math.max(0, need - avail);
    // "照现在速度"：本月已过 ≥7 天且计划含本月时，用本月每天实际出货 × 到截止剩余天数；否则用历史预计（2026-10-22 用户确认）
    const daysToDeadline = Math.max(0, Math.round((monthEnd(lastMonth).getTime() - a.dataDate.getTime()) / 864e5));
    const pmCur = perMonth.find((x) => x.mm === cur);
    const usePace = !closed && !!pmCur && doneDays >= 7;
    const paceDaily = pmCur && doneDays > 0 ? Math.max(0, pmCur.avail) / doneDays : 0;
    const proj = closed ? 0 : usePace ? paceDaily * daysToDeadline : fcst;
    const expected = avail + proj;
    const shortFinal = Math.max(0, need - expected);
    const verified = pl.started ? Math.max(0, pl.budget - pl.balance) : 0;
    const coveredFee = Math.min(pl.budget, Math.max(0, Math.min(need, expected)) * pl.rate);
    // 已核销部分不会退回；剩余可核 = 预计可核 − 已核销
    const lossFee = Math.max(0, (pl.budget - verified) - Math.max(0, coveredFee - verified));
    let level: string;
    if (!biCodes.has(pl.code)) level = "nodata";
    else if (shortNow <= 0.5) level = "ok";
    else if (closed) level = "lost";
    else if (shortFinal > 0.5) level = "risk";
    else level = "follow";
    open.push({
      pl: pl.pl, code: pl.code, name: pl.name, channel: pl.channel.replace(/&amp;/g, "&"), cp: pl.cp, cpDesc: P.cp.desc, cpEnd: fmtD(P.cp.end),
      sku: pl.skus[0] || "", skuName: pl.skuNames[0] || "", start: fmtD(pl.start), end: fmtD(pl.end), remarkDates: pl.remarkDates,
      months: monthsList, need, gross, peerDone, avail, fcst: proj, fcstHist: closed ? 0 : fcst, projBasis: usePace ? "pace" : "forecast", paceDaily, shortNow, shortFinal, returns, rate: pl.rate,
      budget: pl.budget, balance: pl.balance, verified, coveredFee, lossFee, level, closed, sharedWith,
      scopeNote: P.scopeNote, scopeSize: P.scope.size, chans: P.chans, perMonth, deadline: fmtD(monthEnd(lastMonth)),
      regional: P.cp.regional, broad: P.cp.broad, surplus: closed ? 0 : Math.max(0, expected - need),
      returnSkus: [...returnSkus.entries()].sort((x, y) => x[1] - y[1]).slice(0, 8).map(([sku, v]) => ({ sku, name: bi.meta.get(sku)?.name || sku, v })),
      status: pl.status, remarks: pl.remarks,
    });
  }
  const missingCP = planRows.filter((r: any) => !r.pl.done && !cpBy.get(r.pl.cp)).map((r: any) => `${r.pl.pl}(${r.pl.cp})`);
  const levelOrder = { lost: 0, risk: 1, follow: 2, ok: 3, nodata: 4 } as Record<string, number>;
  open.sort((x, y) => levelOrder[x.level] - levelOrder[y.level] || y.shortNow - x.shortNow);

  // 数据检查
  const checks: { level: string; text: string }[] = [];
  checks.push({ level: "info", text: `本月 ${cur.slice(4)} 月；BI 数据截至 ${fmtD(a.dataDate)}（本月已过 ${doneDays} 天，剩余 ${remainDays} 天按趋势${doneDays ? "+库存" : "（月初无数据，用下月基准）"}预测）。` });
  if (bi.stockMonth) checks.push({ level: bi.stockMonth < addMonth(cur, -1) ? "warn" : "info", text: `BI-Stock 库存快照月份：${bi.stockMonth}。` });
  for (const cp of cps) {
    const info = cpInfo.get(cp.code);
    if (info?.itemMiss && cp.balance >= a.minBalance) checks.push({ level: "warn", text: `${cp.code}｜${cp.desc}：机制写了限定产品「${info.itemMiss}」，但在产品目录里没对上，暂按 CP 全部品牌计算。` });
    if (info?.unmatched.length && cp.balance >= a.minBalance) checks.push({ level: "warn", text: `${cp.code}｜${cp.desc}：促销品牌「${info.unmatched.join("、")}」在 BI 产品目录找不到对应品牌，这部分产品未进入核销池。` });
  }
  const broadCPs = cps.filter((c) => c.broad && c.isDiscount && c.balance >= a.minBalance);
  if (broadCPs.length) checks.push({ level: "info", text: `宽口径 CP（${broadCPs.map((c) => `${c.code} ${c.desc}`).join("、")}）：可兼做陈列/上市，网站只算折扣部分；费率按单品最高核销率（SKURate）。区域自主有 CP 墙：同客户×同渠道×同月×同 SKU 范围内先扣掉其他 CP 已做计划的费用；MT TT 按总部 CP，不扣其他 CP。` });
  checks.push({ level: "info", text: "咖啡 SCD（零食渠道）特例：GPR 后整池费率锁 2%（1+2 与醇品/深黑共享一个核销池，以 CP 促销品牌为准）；7ct+2 不纳入核销池。其他渠道照常。同一批 SCD 出货按总部 CP 规则可被多个 CP 各自按 2% 使用（不设 CP 墙）。" });
  if (codeAlias.size) checks.push({ level: "info", text: `换编码客户：${[...codeAlias.entries()].map(([o, n]) => `${o}→${n}（${bi.so.find((r) => r.code === n)?.name.slice(0, 8) || ""}）`).join("、")}，旧编码历史已并入现行编码做预测；在途计划仍按计划上的编码核对。` });
  if (skippedRTD) checks.push({ level: "info", text: `TTS 中 ${skippedRTD} 条 RTD 在途计划未纳入（RTD 不在本工具范围）。` });
  if (missingCP.length) checks.push({ level: "warn", text: `${missingCP.length} 条在途计划的 CP 不在本次 CP 预算文件里，未做核销体检：${missingCP.slice(0, 6).join("、")}` });
  if (remarkNotes.length) checks.push({ level: "warn", text: `${remarkNotes.length} 条计划备注写了产品但未能识别成 SKU，按 CP 全范围计算：${remarkNotes.slice(0, 6).join("、")}` });
  const noData = open.filter((o) => o.level === "nodata");
  if (noData.length) checks.push({ level: "warn", text: `${noData.length} 条在途计划的客户编码不在本次 BI 里（如 NKA 客户），未判断覆盖：${noData.slice(0, 6).map((o) => `${o.pl}(${o.name.slice(0, 6)})`).join("、")}` });
  const zero = open.filter((o) => o.level !== "nodata" && o.gross === 0 && o.fcst === 0);
  if (zero.length) checks.push({ level: "warn", text: `${zero.length} 条在途计划在计划渠道+产品范围内 BI 出货为 0，请确认是真实未出货还是渠道/编码对不上：${zero.slice(0, 6).map((o) => o.pl).join("、")}` });
  const noRate = poolOut.filter((p) => p.plannable && p.months[cur].rate == null && p.months[cur].so[1] > 0);
  if (noRate.length) checks.push({ level: "warn", text: `${noRate.length} 个核销池费率无法唯一确定（CP 机制有多个费率且无 TTS 先例），可做费用按 0 显示：${noRate.slice(0, 5).map((p) => `${p.name.slice(0, 6)}/${p.cp}`).join("、")}` });
  checks.push({ level: "info", text: "核销池口径：客户编码 × CP × BI 渠道；池内含 CP 机制允许的全部品牌/Segment 产品，正负出货一起算净额。同 CP 已有计划按计划进货金额扣占用（按活动天数分摊到月份）。不同 CP 之间不互相扣。" });
  checks.push({ level: "info", text: "下月/下下月预测 = 近 3 个完整月净出货均值 × 季节系数（去年同月 ÷ 去年同期 3 个月均值，限制在 0.7–1.3）；下月再乘库存系数（库存周数 ÷ 4，限制在 0.7–1.3，客户无库存数据时按 1.00）。三档系数只乘在尚未发生的部分。" });

  return {
    version: "v10", generatedAt: new Date().toISOString(), cur, m1, m2, qEnd, dataDate: fmtD(a.dataDate), doneDays, remainDays,
    scenarios: scen.map((s) => ({ key: s.key, label: s.label, k: s.k })), minBalance: a.minBalance,
    pools: poolOut, open, checks,
    files: { soRows: bi.so.length, plans: plans.length, cps: cps.length, months: bi.months },
  };
}

// ───────────────────────── 备注产品范围 ─────────────────────────
// 备注写了"Product：蓝850g、675g中老年单听…"时，核销池按备注产品取；写"该BU所有SKU/奶品（不含白罐）"等视为 CP 全范围。
const REMARK_WHOLE = /该BU所有|BU所有产品|MG1所有产品|所有SKU|奶品[（(]不含白罐[)）]/;
const KW: [RegExp, (h: string, m: Meta) => boolean][] = [
  [/蓝绿/, (_h, m) => ["seniorblue", "seniorgreen"].includes(norm(m.s2))],
  [/蓝(?!绿)/, (_h, m) => norm(m.s2) === "seniorblue"],
  [/(?<!蓝)绿/, (_h, m) => norm(m.s2) === "seniorgreen"],
  [/中老年/, (h) => h.includes("senior") || h.includes("中老年") || h.includes("怡养")],
  [/N3/i, (h) => h.includes("n3")],
  [/全家/, (h) => h.includes("family") || h.includes("全家")],
  [/新西兰/, (h) => h.includes("新西兰")],
  [/全脂/, (h) => h.includes("全脂")],
  [/甜奶粉/, (h) => h.includes("甜奶粉")],
  [/炼奶/, (h) => h.includes("炼奶")],
  [/支装/, (h) => h.includes("支装")],
  [/原味/, (h) => h.includes("原味")],
  [/乳铁/, (h) => h.includes("乳铁")],
  [/金装|金听/, (h) => h.includes("金装")],
  [/健心/, (h) => h.includes("健心")],
  [/糖律/, (h) => h.includes("糖律") || h.includes("gicontrol") || h.includes("控糖")],
  [/羊/, (h) => h.includes("羊")],
  [/高钙/, (h) => h.includes("高钙")],
  [/礼盒|双听/, (h) => h.includes("礼盒") || h.includes("双听")],
  [/单听/, (h) => !(h.includes("礼盒") || h.includes("双听"))],
];
function remarkScope(remarks: string, pool: Meta[], rate = 0): { skus: Set<string> | null; text: string; group: string } {
  const r = String(remarks || "").replace(/&amp;/g, "&");
  const group = (r.match(/客户组[：:]\s*([^；;，,]+)/) || [])[1] || "";
  if (!r.trim() || REMARK_WHOLE.test(r)) return { skus: null, text: "", group };
  // 取"Product："之后的产品段；多费率备注（中老年10%；N3 7%）只取与本计划费率一致的那段
  let t = "";
  const rest = (r.match(/(?:Product|产品)\s*[：:]\s*([\s\S]+)/i) || [])[1] || "";
  if (rest) {
    const segs = rest.split(/[；;]/).map((x) => x.trim()).filter((x) => x && !/客户组|不得|重复|按财务要求|备注/.test(x));
    const rated = segs.filter((x) => /\d+(?:\.\d+)?\s*%/.test(x));
    let pick = segs;
    if (rated.length >= 2 && rate > 0) {
      const hit = rated.filter((x) => [...x.matchAll(/(\d+(?:\.\d+)?)\s*%/g)].some((m) => Math.abs(+m[1] / 100 - rate) < 0.0005));
      if (hit.length) pick = hit;
    }
    t = pick.join("、");
  }
  if (!t) {
    const first = r.split(/[；;]/)[0];
    if (/蓝|绿|系列|炼奶|新西兰|全脂|甜奶粉|乳铁|金装|中老年|N3/i.test(first)) t = first;
  }
  if (!t) return { skus: null, text: "", group };
  t = t.replace(/[（(][^）)]*[）)]/g, "").replace(/[：:]?\s*\d+(?:\.\d+)?\s*%/g, "").trim();
  const tokens = t.split(/[、，,/／＋+]|及|和/).map((x) => x.trim()).filter(Boolean);
  const out = new Set<string>();
  let prev: ((h: string, m: Meta) => boolean)[] = [];
  for (const tok of tokens) {
    let preds = KW.filter(([re]) => re.test(tok)).map(([, f]) => f);
    const sizes = [...tok.matchAll(/(\d+(?:\.\d+)?)\s*(kg|g)?/gi)].map((m) => `${m[1]}${(m[2] || "g").toLowerCase()}`).filter((v) => parseFloat(v) >= 1);
    if (!preds.length && sizes.length) preds = prev;
    if (!preds.length) continue;
    prev = preds;
    const hay = (m: Meta) => `${m.name} ${m.s1} ${m.s2} ${m.s3} ${m.brand}`.toLowerCase();
    const base = pool.filter((m) => preds.every((f) => f(hay(m), m)));
    const sized = sizes.length ? base.filter((m) => sizes.some((z) => hay(m).replace(/\s/g, "").includes(z))) : base;
    for (const m of (sized.length ? sized : base)) out.add(m.sku);
  }
  return { skus: out.size ? out : null, text: t, group };
}

function fmtD(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function readWorkbook(ab: ArrayBuffer) {
  return XLSX.read(new Uint8Array(ab), { type: "array", cellDates: true, raw: true });
}
