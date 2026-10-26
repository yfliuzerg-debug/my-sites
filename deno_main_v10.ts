// 费用规划助手 v10 入口：新版页面接管 /workspace，旧版完整保留在 /legacy（旧版接口 /analyze 等不变）。
import { Buffer } from "node:buffer";
import * as XLSX from "xlsx";
import { analyze, readWorkbook } from "./planner_v10.ts";
import { resultPage, uploadPage } from "./ui_v10.ts";

(globalThis as any).Buffer = Buffer;

let legacy: ((req: Request) => Response | Promise<Response>) | null = null;
const originalServe = Deno.serve.bind(Deno);
(Deno as any).serve = (handler: (req: Request) => Response | Promise<Response>) => {
  legacy = handler;
  return { finished: Promise.resolve(), shutdown() {} };
};
await import("./deno_main_v9.ts");
(Deno as any).serve = originalServe;
if (!legacy) throw new Error("未捕获 v9 HTTP handler");

// 与旧版共用同一个登录 Cookie（deno_main.ts 的签名方式）
const COOKIE = "expense_planner_auth";
const env = (name: string) => Deno.env.get(name) || "";
async function hmac(value: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(env("AUTH_SECRET")), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
async function isAuthorized(req: Request) {
  if (!env("AUTH_SECRET") || !env("SHARED_PASSWORD")) return false;
  const m = (req.headers.get("cookie") || "").match(new RegExp(`(?:^|;\\s*)${COOKIE}=([^;]+)`));
  if (!m) return false;
  const [expText, sig] = m[1].split(".");
  const exp = Number(expText);
  if (!Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000) || !sig) return false;
  return sig === await hmac(expText);
}

// 北京时间"今天"和默认 BI 截至日（昨天）
function chinaToday() {
  const t = new Date(Date.now() + 8 * 3600e3);
  return new Date(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate());
}
const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const html = (body: string, status = 200) => new Response(body, { status, headers: { "content-type": "text/html;charset=utf-8", "cache-control": "no-store" } });

function sheet(wb: any, name: string, rows: any[]) {
  const ws = XLSX.utils.json_to_sheet(rows.length ? rows : [{ 说明: "无数据" }]);
  const keys = Object.keys(rows[0] || { 说明: "" });
  ws["!cols"] = keys.map((k) => ({ wch: Math.min(40, Math.max(8, k.length * 2 + 2)) }));
  XLSX.utils.book_append_sheet(wb, ws, name);
}

Deno.serve(async (req: Request) => {
  const url = new URL(req.url);
  const path = url.pathname;

  if (path === "/legacy" && req.method === "GET") {
    const u = new URL(req.url);
    u.pathname = "/workspace";
    return legacy!(new Request(u.toString(), { method: "GET", headers: req.headers }));
  }

  if (path === "/workspace" && req.method === "GET") {
    if (!(await isAuthorized(req))) return new Response(null, { status: 303, headers: { location: "/" } });
    const y = chinaToday();
    y.setDate(y.getDate() - 1);
    return html(uploadPage(fmt(y)));
  }

  if (path === "/v10/analyze" && req.method === "POST") {
    if (!(await isAuthorized(req))) return new Response(null, { status: 303, headers: { location: "/" } });
    try {
      const f = await req.formData();
      const bi = f.get("bi"), tts = f.get("tts"), cp = f.get("cp");
      if (!(bi instanceof File) || !(tts instanceof File) || !(cp instanceof File)) {
        const y = chinaToday();
        y.setDate(y.getDate() - 1);
        return html(uploadPage(fmt(y), "三个文件都需要上传"), 400);
      }
      const today = chinaToday();
      const dd = String(f.get("dataDate") ?? "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
      const dataDate = dd ? new Date(+dd[1], +dd[2] - 1, +dd[3]) : new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
      const minBalance = Math.max(0, Number(f.get("minBalance") ?? 100) || 0);
      const [biAB, ttsAB, cpAB] = await Promise.all([bi.arrayBuffer(), tts.arrayBuffer(), cp.arrayBuffer()]);
      const result = analyze({ biWb: readWorkbook(biAB), ttsWb: readWorkbook(ttsAB), cpWb: readWorkbook(cpAB), today, dataDate, minBalance });
      return html(resultPage(result));
    } catch (e) {
      const y = chinaToday();
      y.setDate(y.getDate() - 1);
      return html(uploadPage(fmt(y), `计算失败：${e instanceof Error ? e.message : String(e)}`), 500);
    }
  }

  if (path === "/v10/export" && req.method === "POST") {
    if (!(await isAuthorized(req))) return new Response("未登录", { status: 401 });
    try {
      const p = await req.json();
      const wb = XLSX.utils.book_new();
      sheet(wb, "能做多少费用", p.cap || []);
      sheet(wb, "在途计划核销", p.flt || []);
      sheet(wb, "退货明细", p.ret || []);
      sheet(wb, "产品明细", p.prod || []);
      sheet(wb, "历史回溯", p.hist || []);
      sheet(wb, "算法说明", p.rules || []);
      sheet(wb, "说明", p.note || []);
      const bytes = XLSX.write(wb, { type: "array", bookType: "xlsx", compression: true });
      return new Response(bytes, {
        headers: {
          "content-type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "content-disposition": `attachment; filename*=UTF-8''${encodeURIComponent("费用规划.xlsx")}`,
          "cache-control": "no-store",
        },
      });
    } catch (e) {
      return new Response(`导出失败：${e instanceof Error ? e.message : String(e)}`, { status: 500 });
    }
  }

  return legacy!(req);
});
