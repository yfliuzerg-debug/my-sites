// 费用规划助手 v10 页面：上传页 + 结果页（能做多少费用 / 在途计划·督促出货 / 数据说明）
const esc = (v: unknown) => String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const CSS = `
:root{--bg:#f5f6f8;--card:#fff;--ink:#16202e;--muted:#6b7686;--line:#e3e7ee;--brand:#1d5bd6;--brand-soft:#e9f0ff;
--red:#c8341f;--red-soft:#fdecea;--amber:#a86200;--amber-soft:#fff4e0;--green:#18794e;--green-soft:#e6f6ee;--gray-soft:#eef0f3}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:14px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif}
a{color:var(--brand);text-decoration:none}
.top{position:sticky;top:0;z-index:20;background:#fff;border-bottom:1px solid var(--line)}
.top .in{max-width:1280px;margin:0 auto;padding:10px 16px;display:flex;gap:12px;align-items:center;flex-wrap:wrap}
.top h1{font-size:16px;margin:0;font-weight:700}.top .meta{color:var(--muted);font-size:12px}
.top .sp{flex:1}.btn{border:1px solid var(--line);background:#fff;color:var(--ink);padding:6px 12px;border-radius:8px;cursor:pointer;font-size:13px}
.btn.primary{background:var(--brand);border-color:var(--brand);color:#fff}.btn:hover{filter:brightness(.97)}
.wrap{max-width:1280px;margin:0 auto;padding:16px}
.tabs{display:flex;gap:4px;border-bottom:1px solid var(--line);margin:0 0 14px}
.tab{padding:10px 14px;cursor:pointer;color:var(--muted);border-bottom:2px solid transparent;font-weight:600}
.tab.on{color:var(--ink);border-bottom-color:var(--brand)}.tab .n{display:inline-block;margin-left:6px;background:var(--red);color:#fff;border-radius:10px;padding:0 7px;font-size:12px}
.bar{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:12px}
.bar select,.bar input[type=search],.bar input[type=number]{padding:6px 9px;border:1px solid var(--line);border-radius:8px;background:#fff;font-size:13px}
.seg{display:inline-flex;border:1px solid var(--line);border-radius:8px;overflow:hidden;background:#fff}
.seg button{border:0;background:none;padding:6px 11px;cursor:pointer;font-size:13px;color:var(--muted)}
.seg button.on{background:var(--brand-soft);color:var(--brand);font-weight:600}
.kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:10px;margin-bottom:14px}
.kpi{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:12px 14px}
.kpi .l{color:var(--muted);font-size:12px}.kpi .v{font-size:22px;font-weight:700;margin-top:2px}.kpi .s{font-size:12px;color:var(--muted)}
.kpi.red .v{color:var(--red)}.kpi.amber .v{color:var(--amber)}
.card{background:var(--card);border:1px solid var(--line);border-radius:12px;overflow:hidden;margin-bottom:12px}
.grp{display:flex;align-items:center;gap:10px;padding:10px 14px;background:#fafbfc;border-bottom:1px solid var(--line);cursor:pointer}
.grp .t{font-weight:700}.grp .code{color:var(--muted);font-size:12px}.grp .sp{flex:1}.grp .sum{font-size:13px}
table{width:100%;border-collapse:collapse}th,td{padding:8px 10px;border-bottom:1px solid var(--line);text-align:left;vertical-align:top}
th{font-size:12px;color:var(--muted);font-weight:600;background:#fff;white-space:nowrap}
td.n,th.n{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}
tr.row{cursor:pointer}tr.row:hover td{background:#fafcff}
.sub{color:var(--muted);font-size:12px}.neg{color:var(--red)}.pos{color:var(--green)}.zero{color:#b4bcc8}
.chip{display:inline-block;padding:1px 8px;border-radius:10px;font-size:12px;font-weight:600;white-space:nowrap}
.chip.lost{background:var(--red-soft);color:var(--red)}.chip.risk{background:var(--red-soft);color:var(--red)}
.chip.follow{background:var(--amber-soft);color:var(--amber)}.chip.ok{background:var(--green-soft);color:var(--green)}.chip.nodata{background:var(--gray-soft);color:var(--muted)}
.cov{position:relative;height:6px;background:var(--gray-soft);border-radius:3px;margin-top:4px;min-width:90px}
.cov i{position:absolute;left:0;top:0;bottom:0;border-radius:3px;background:var(--green)}.cov.bad i{background:var(--red)}.cov.mid i{background:#e09a1a}
.detail td{background:#fbfcfe;padding:12px 14px}
.dgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:14px}
.dbox h4{margin:0 0 6px;font-size:13px}.dbox table th,.dbox table td{padding:5px 8px;font-size:12.5px}
details{margin-top:10px}summary{cursor:pointer;color:var(--brand);font-weight:600;font-size:13px}
.note{font-size:12px;color:var(--muted);margin-top:6px}
.empty{padding:30px;text-align:center;color:var(--muted)}
.checks li{margin:6px 0}.checks .warn{color:var(--amber)}
.help{background:#fff;border:1px solid var(--line);border-radius:10px;padding:8px 12px;margin:0 0 12px;font-size:12.5px;color:var(--muted)}
.help summary{color:var(--ink);font-weight:600;font-size:13px}.help ul{margin:6px 0 2px;padding-left:18px}.help li{margin:3px 0;line-height:1.6}.help b{color:var(--ink)}
.toast{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#16202e;color:#fff;padding:8px 16px;border-radius:8px;font-size:13px;opacity:0;transition:.2s;pointer-events:none}
.toast.on{opacity:1}
.upl{max-width:720px;margin:28px auto;background:#fff;border:1px solid var(--line);border-radius:14px;padding:22px}
.upl h2{margin:0 0 4px}.upl .f{display:grid;grid-template-columns:140px 1fr;gap:10px;align-items:center;margin:12px 0}
.upl input[type=file]{padding:8px;border:1px dashed #c6cfdd;border-radius:9px;width:100%;background:#fafbfd}
.upl input[type=date],.upl input[type=number]{padding:7px 9px;border:1px solid var(--line);border-radius:8px}
.loading{display:none;position:fixed;inset:0;background:rgba(255,255,255,.85);z-index:50;align-items:center;justify-content:center;flex-direction:column;gap:8px;font-weight:600}
.loading.on{display:flex}.spin{width:34px;height:34px;border:3px solid var(--brand-soft);border-top-color:var(--brand);border-radius:50%;animation:s 1s linear infinite}@keyframes s{to{transform:rotate(360deg)}}

.wb-wrap{overflow-x:auto;background:#fff;border:1px solid var(--line);border-radius:12px;margin-bottom:12px}
.wb-tbl{width:100%;border-collapse:collapse;font-size:12.5px}
.wb-tbl th,.wb-tbl td{padding:6px 8px;border:1px solid #ebeff5;vertical-align:top}
.wb-tbl th{background:#f8fafc;position:sticky;top:0;z-index:2}
.wb-tbl th.fix,.wb-tbl td.fix{position:sticky;left:0;background:#fff;z-index:1;min-width:190px;max-width:230px}
.wb-tbl th.fix{background:#f8fafc;z-index:3}
.wb-in{width:86px;padding:4px 6px;border:1px solid #cfd8e6;border-radius:6px;text-align:right;font-size:12.5px;font-variant-numeric:tabular-nums}
.wb-in.over{border-color:var(--red);background:var(--red-soft);color:var(--red);font-weight:700}
.wb-in.add{width:76px;border-style:dashed;background:#fffdf5}
.wb-cap{font-size:11px;color:var(--muted);margin-top:2px;display:flex;align-items:center;justify-content:space-between;gap:4px;white-space:nowrap}
.wb-cap .fill{cursor:pointer;text-decoration:underline dotted}.wb-cap .fill:hover{color:var(--brand)}
.wb-cap .chbtn{border:1px solid var(--line);background:#fafbfd;border-radius:5px;padding:0 5px;font-size:11px;cursor:pointer;color:var(--ink)}
.wb-cap .chbtn:hover{border-color:var(--brand);color:var(--brand)}
.wb-colh{min-width:128px}.wb-colh .nm{font-weight:700;display:flex;align-items:center;justify-content:space-between;gap:4px}
.wb-colh .ops button{border:0;background:none;cursor:pointer;color:var(--muted);padding:0 3px;font-size:12px}.wb-colh .ops button:hover{color:var(--red)}
.wb-ms{display:flex;flex-wrap:wrap;gap:2px;margin-top:4px}
.wb-ms button{border:1px solid var(--line);background:#fff;border-radius:4px;padding:0 4px;font-size:10.5px;cursor:pointer;color:var(--muted)}
.wb-ms button.on{background:var(--brand-soft);border-color:#9dbcf8;color:var(--brand);font-weight:600}
.wb-ms button.hist.on{background:var(--amber-soft);border-color:#e5bd78;color:var(--amber)}
.wb-rem.done{color:var(--green);font-weight:700}.wb-rem.over{color:var(--red);font-weight:700}
.wb-warn{font-size:10.5px;color:var(--amber);background:var(--amber-soft);border-radius:4px;padding:1px 4px;margin-top:2px;line-height:1.3}
.kac-box{display:inline-flex;align-items:center;gap:6px;padding:4px 9px;border:1px solid var(--line);border-radius:8px;background:#fff;font-size:12.5px}
.kac-box.on{border-color:#9dbcf8;background:var(--brand-soft)}
.kac-box input[type=number]{width:52px;padding:2px 5px;border:1px solid var(--line);border-radius:6px;font-size:12px}
.modal-bg{position:fixed;inset:0;background:rgba(15,23,42,.42);z-index:60;display:none;align-items:center;justify-content:center;padding:16px}
.modal-bg.on{display:flex}
.modal{background:#fff;border-radius:12px;max-width:520px;width:100%;max-height:82vh;overflow:auto;padding:16px 18px;box-shadow:0 12px 32px rgba(0,0,0,.18)}
.modal h3{margin:0 0 8px;font-size:15px}.modal .m-row{display:flex;align-items:center;justify-content:space-between;padding:5px 0;border-bottom:1px solid #f0f2f6;font-size:13px}
.modal .m-row label{display:flex;align-items:center;gap:6px;cursor:pointer;flex:1}
.modal .m-sec{font-size:12px;font-weight:700;color:var(--muted);margin:10px 0 4px}
@media (max-width:760px){.hide-m{display:none}.kpis{grid-template-columns:1fr 1fr}.kpi .v{font-size:18px}.upl .f{grid-template-columns:1fr}}
`;

export function uploadPage(defaultDate: string, message = "") {
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>费用规划助手</title><style>${CSS}</style></head><body>
<div class="top"><div class="in"><h1>费用规划助手 v10</h1><span class="meta">还能做多少费用 · 催出货 · 核不掉的钱转给谁</span><span class="sp"></span><a class="btn" href="/legacy">旧版</a><a class="btn" href="/logout">退出</a></div></div>
<form class="upl" action="/v10/analyze" method="post" enctype="multipart/form-data" onsubmit="document.getElementById('ld').classList.add('on')">
<h2>上传三份文件</h2><div class="sub">BI 出货库存表、TTS 计划大表、CP 预算表。文件只用来算这一次，不会保存。</div>
${message ? `<div class="chip risk" style="margin-top:10px">${esc(message)}</div>` : ""}
<div class="f"><label>BI 文件</label><input type="file" name="bi" accept=".xlsx,.xlsm" required></div>
<div class="f"><label>TTS 计划</label><input type="file" name="tts" accept=".xlsx,.xlsm" required></div>
<div class="f"><label>CP 预算</label><input type="file" name="cp" accept=".xlsx,.xlsm" required></div>
<div class="f"><label>BI 数据截至</label><div><input type="date" name="dataDate" value="${esc(defaultDate)}" required> <span class="sub">BI 里本月出货算到哪一天（用来估本月剩下几天还能出多少）</span></div></div>
<div class="f"><label>预算余额至少</label><div><input type="number" name="minBalance" value="100" min="0" step="100"> <span class="sub">元，剩余预算低于这个数的活动不列入"还能做多少费用"</span></div></div>
<button class="btn primary" type="submit" style="width:100%;padding:10px;margin-top:6px">开始计算</button>
</form>
<div class="loading" id="ld"><div class="spin"></div><div>正在计算，约 30–60 秒…</div></div>
</body></html>`;
}

export function resultPage(data: unknown) {
  // 数字取整（费率等小数保留 4 位），页面体积约减半
  const json = JSON.stringify(data, (_k, v) => (typeof v === "number" && Number.isFinite(v) ? (Math.abs(v) >= 10 ? Math.round(v) : Math.round(v * 10000) / 10000) : v)).replace(/</g, "\\u003c").replace(new RegExp("\\u2028", "g"), "\\u2028").replace(new RegExp("\\u2029", "g"), "\\u2029");
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>费用规划助手 · 结果</title><style>${CSS}</style></head><body>
<div class="top"><div class="in"><h1>费用规划助手 v10</h1><span class="meta" id="meta"></span><span class="sp"></span>
<button class="btn" id="exp">导出 Excel</button><a class="btn" href="/workspace">重新上传</a><a class="btn" href="/legacy">旧版</a></div></div>
<div class="wrap">
<div class="tabs"><div class="tab on" data-t="wb">费用分配台</div><div class="tab" data-t="cap">还能做多少费用</div><div class="tab" data-t="flt">催出货<span class="n" id="redN"></span></div><div class="tab" data-t="chk">数据说明</div></div>
<div class="bar">
<select id="fCust"><option value="">全部客户</option></select>
<select id="fCP" style="max-width:260px"><option value="">全部活动（CP）</option></select>
<div class="seg" id="fBU"><button data-v="" class="on">全部</button><button data-v="dairy">奶品</button><button data-v="coffee">咖啡</button><button data-v="confectionery">糖果</button></div>
<input type="search" id="fQ" placeholder="搜活动名 / CP 号 / PL 号 / 产品" style="min-width:220px">
<span class="sp" style="flex:1"></span>
<label class="kac-box" id="kacBox" title="开启后并入 BI-SO(折扣)-KAC 独立 LKA 通道（不与 SM/MM 互斥），默认按 30% 控制占比"><input type="checkbox" id="kacOn"><span>LKA/KAC通道</span><span id="kacCtrl" style="display:none"><button type="button" class="btn" data-kr="30" style="padding:2px 6px;font-size:11.5px">30%</button> <button type="button" class="btn" data-kr="50" style="padding:2px 6px;font-size:11.5px">50%</button> <input type="number" id="kacPct" value="30" min="1" max="100" step="5">%</span></label>
<span class="sub" id="scLbl">按哪种情况估</span><div class="seg" id="fSc"><button data-v="0">保守 85%</button><button data-v="1" class="on">基准 100%</button><button data-v="2">乐观 120%</button></div>
</div>
<div id="v-wb"></div><div id="v-cap" style="display:none"></div><div id="v-flt" style="display:none"></div><div id="v-chk" style="display:none"></div><div class="modal-bg" id="wbModal"><div class="modal" id="wbModalIn"></div></div>
</div>
<div class="toast" id="toast"></div>
<script>
const D=${json};
const S={cust:"",cp:"",bu:"",q:"",sc:1,tab:"wb",fv:"chase",thr:500,open:new Set(),pf:{brand:"",s1:"",s2:"",s3:"",sku:""},kacOn:false,kacRate:0.3,wbType:"all"};
const PM=D.prod||[];// [SKU,名称,Brand,S1,S2,S3]
D.pools.forEach(p=>{p.skuRows=(p.sr||[]).map(a=>({sku:PM[a[0]][0],name:PM[a[0]][1],brand:PM[a[0]][2],s1:PM[a[0]][3],s2:PM[a[0]][4],v:a.slice(1)}));p.px=p.px||[]});
const fmt=new Intl.NumberFormat("zh-CN",{maximumFractionDigits:0});
const money=v=>{const r=Math.round(Number(v)||0);return fmt.format(r===0?0:r)};
const wan=v=>{v=Number(v)||0;return Math.abs(v)>=10000?(v/10000).toFixed(1)+"万":money(v)};
const cls=v=>v<-0.5?"neg":Math.abs(v)<0.5?"zero":"";
const h=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const mlabel=mm=>(+mm.slice(4))+"月";
const addM=(mm,n)=>{const d=new Date(+mm.slice(0,4),+mm.slice(4)-1+n,1);return d.getFullYear()+String(d.getMonth()+1).padStart(2,"0")};
const pct=v=>{const x=Math.round(v*1000)/10;return (x%1?x.toFixed(1):String(x))+"%"};
const rng=a=>{a=a.filter(v=>v>=0);if(!a.length)return '-';const lo=Math.min(...a),hi=Math.max(...a);return lo===hi?pct(lo):pct(lo)+'–'+pct(hi)};
const grpOf=i=>PM[i][4]||PM[i][3]||PM[i][2]||'其他';
const BU={dairy:"奶品",coffee:"咖啡",confectionery:"糖果"};
const LV={lost:["已过期","lost"],risk:["跟不上","risk"],follow:["跟得上","follow"],ok:["货已够","ok"],nodata:["没数据","nodata"]};
const qMonths=[D.cur,D.m1,D.m2].filter(m=>m<=D.qEnd), nMonths=[D.cur,D.m1,D.m2].filter(m=>m>D.qEnd);
document.getElementById("meta").textContent="出货数据截至 "+D.dataDate+" · 本季度到 "+mlabel(D.qEnd)+"底";
const custs=[...new Map([...D.pools,...D.open].map(x=>[x.name,x.name])).keys()].sort((a,b)=>a.localeCompare(b,"zh-CN"));
document.getElementById("fCust").insertAdjacentHTML("beforeend",custs.map(c=>'<option>'+h(c)+'</option>').join(""));
function toast(t){const e=document.getElementById("toast");e.textContent=t;e.classList.add("on");setTimeout(()=>e.classList.remove("on"),1600)}
function match(x,text){if(S.cust&&x.name!==S.cust)return false;if(S.cp&&x.cp!==S.cp)return false;if(S.bu&&x.bu&&x.bu!==S.bu)return false;if(S.q){const q=S.q.toLowerCase();if(!text.toLowerCase().includes(q))return false}return true}
function poolText(p){return [p.name,p.code,p.cp,p.cpDesc,p.channel,p.bucket,...p.skuRows.map(r=>r.name+" "+r.sku)].join(" ")}
function planText(o){return [o.name,o.code,o.pl,o.cp,o.cpDesc,o.channel,o.skuName,o.sku].join(" ")}
function poolBU(p){return p.bu}
D.open.forEach(o=>{const p=D.pools.find(x=>x.cp===o.cp);o.bu=p?p.bu:(o.cp.startsWith("DA")?"dairy":o.cp.startsWith("CO")?"coffee":o.cp.startsWith("CF")?"confectionery":"")});
function feeOf(p,mm,i){const c=p.months[mm];return c?c.fee[i]:0}
function rowQ(p,i){return qMonths.reduce((s,m)=>s+feeOf(p,m,i),0)}
function rowN(p,i){return nMonths.reduce((s,m)=>s+feeOf(p,m,i),0)}
// 建议分配：每个 CP 的余额按各池本季度承载占比分下去，100 元取整，不超过承载
function allocMap(i){const by=new Map();D.pools.filter(p=>p.plannable).forEach(p=>{const x=by.get(p.cp)||{bal:Math.max(0,p.cpBalance),ps:[]};x.ps.push(p);by.set(p.cp,x)});
  const m=new Map();by.forEach(x=>{const tot=x.ps.reduce((s,p)=>s+Math.max(0,rowQ(p,i)),0);const r=tot>0?Math.min(1,x.bal/tot):0;x.ps.forEach(p=>m.set(p.id,Math.floor(Math.max(0,rowQ(p,i))*r/100)*100))});return m}
// CP 还能接住多少回流 = 这个 CP 下所有客户本季度承载 − CP 现有余额（基准档）
function absorb(cp){const ps=D.pools.filter(p=>p.cp===cp);if(!ps.length)return null;return ps.reduce((s,p)=>s+rowQ(p,1),0)-Math.max(0,ps[0].cpBalance)}
function destOf(cp,skip){const agg=new Map();D.pools.filter(p=>p.cp===cp&&p.name!==skip).forEach(p=>{const k=p.name+'|'+p.channel;agg.set(k,{name:p.name,ch:p.channel,v:(agg.get(k)?agg.get(k).v:0)+rowQ(p,1)})});return [...agg.values()].filter(d=>d.v>=100).sort((a,b)=>b.v-a.v)}
const short=n=>String(n||'').replace(/有限(责任)?公司$/,'').replace(/^(深圳市|东莞市|广州市?)/,'');
// 同一 CP 的余额在全部客户之间共用：合计时按 CP 封顶
function capped(ps,i){const by=new Map();ps.forEach(p=>{const x=by.get(p.cp)||{v:0,b:p.cpBalance};x.v+=rowQ(p,i);by.set(p.cp,x)});let t=0;by.forEach(x=>t+=Math.min(x.v,Math.max(0,x.b)));return t}

// ───────── 按产品逐级筛选（Brand → S1 → S2 → S3 → SKU） ─────────
const PL=[["brand","Brand",2],["s1","S1",3],["s2","S2",4],["s3","S3",5],["sku","SKU",0]];
function pfOn(){return PL.some(([k])=>S.pf[k])}
function pfHit(i,upto){const m=PM[i];for(const [k,,c] of PL){if(upto&&k===upto)break;if(S.pf[k]&&m[c]!==S.pf[k])return false}return true}
// 选中产品占这个池能做费用的比例 = 选中 SKU 的（近 4 个月净出货 × 费率）÷ 全池同口径合计
function share(p){if(!pfOn())return 1;let a=0,t=0;for(const [i,so,rt] of p.px){const v=Math.max(0,so)*rt;t+=v;if(pfHit(i))a+=v}return t>0?a/t:0}
function pfBar(cands){
  const opts=k=>{const c=PL.find(x=>x[0]===k)[2];const m=new Map();cands.forEach(p=>p.px.forEach(([i])=>{if(!pfHit(i,k))return;const key=PM[i][c];if(!key)return;m.set(key,k==="sku"?PM[i][0]+' '+PM[i][1]:key)}));return [...m.entries()].sort((a,b)=>a[1].localeCompare(b[1],"zh-CN"))};
  return '<div class="bar pfbar"><span class="sub">按产品看：</span>'+PL.map(([k,lab])=>'<select data-pf="'+k+'" style="max-width:'+(k==="sku"?260:170)+'px"><option value="">'+lab+'（全部）</option>'+opts(k).map(([v,t])=>'<option value="'+h(v)+'"'+(S.pf[k]===v?' selected':'')+'>'+h(t)+'</option>').join("")+'</select>').join("")+(pfOn()?'<button class="btn" id="pfClr">清除</button><span class="sub">只算选中产品能做的部分</span>':'')+'</div>';
}
// ───────── 能做多少费用 ─────────
function renderCap(){
  const el=document.getElementById("v-cap");const i=S.sc;
  const cands=[...D.pools,...(S.kacOn?kacCapPools():[])].filter(p=>p.plannable&&match(p,poolText(p)));
  const SH=new Map(cands.map(p=>[p.id,share(p)]));const sh=p=>SH.has(p.id)?SH.get(p.id):share(p);
  const rq=(p,j)=>rowQ(p,j)*sh(p),rn=(p,j)=>rowN(p,j)*sh(p),fo=(p,m,j)=>feeOf(p,m,j)*sh(p);
  let rows=cands.filter(p=>!pfOn()||sh(p)>0);
  const all=rows.length;
  rows=rows.filter(p=>rq(p,1)+rn(p,1)>=S.thr||(!pfOn()&&p.months[D.cur].gap[1]<-0.5));
  const sum=k=>rows.reduce((s,p)=>s+k(p),0);
  const AL=[0,1,2].map(j=>allocMap(j));
  // 选了产品时，建议做 = 不超过这个产品能做的部分
  const alj=(p,j)=>pfOn()?Math.min(AL[j].get(p.id)||0,Math.floor(rq(p,j)/100)*100):(AL[j].get(p.id)||0);const AP=new Map(rows.map(p=>[p.id,p]));const al={get:id=>AP.has(id)?alj(AP.get(id),i):0};
  const k3=[0,1,2].map(j=>rows.reduce((s,p)=>s+alj(p,j),0)), raw3=[0,1,2].map(j=>sum(p=>rq(p,j)));
  const over=pfOn()?[]:rows.filter(p=>p.months[D.cur].gap[1]<-0.5);
  let html=helpCap()+pfBar(cands)+'<div class="kpis">'+
   '<div class="kpi"><div class="l">本季度建议做的费用</div><div class="v">'+wan(k3[i])+'</div><div class="s">剩余预算能用掉的部分 · 保守 '+wan(k3[0])+' / 乐观 '+wan(k3[2])+'</div></div>'+
   '<div class="kpi"><div class="l">按出货算，本季度最多能做</div><div class="v">'+wan(raw3[i])+'</div><div class="s">比预算多出来的，要找 CDT 加预算</div></div>'+
   [D.cur,D.m1,D.m2].map(m=>'<div class="kpi"><div class="l">'+mlabel(m)+'最多能做'+(m>D.qEnd?'（下季度）':'')+'</div><div class="v">'+wan(sum(p=>fo(p,m,i)))+'</div><div class="s">保守 '+wan(sum(p=>fo(p,m,0)))+' · 乐观 '+wan(sum(p=>fo(p,m,2)))+'</div></div>').join("")+
   (over.length?'<div class="kpi red"><div class="l">本月计划做多了</div><div class="v">'+over.length+' 处</div><div class="s">本月货差 '+wan(-over.reduce((s,p)=>s+p.months[D.cur].gap[i],0))+'，去"催出货"看</div></div>':'')+
   '</div>';
  html+='<div class="bar" style="margin-top:-4px"><span class="sub">只看能做 ≥</span><input type="number" id="thr" value="'+S.thr+'" step="100" min="0" style="width:90px"><span class="sub">元的（'+rows.length+' / '+all+' 项）· 点一行看是怎么算出来的</span></div>';
  const by=new Map();rows.forEach(p=>{const k=p.name;if(!by.has(k))by.set(k,[]);by.get(k).push(p)});
  const groups=[...by.entries()].sort((a,b)=>b[1].reduce((s,p)=>s+rq(p,i),0)-a[1].reduce((s,p)=>s+rq(p,i),0));
  if(!groups.length)html+='<div class="card"><div class="empty">当前筛选下没有能做费用的活动</div></div>';
  for(const [name,ps] of groups){
    ps.sort((a,b)=>rq(b,i)-rq(a,i));
    const tq=ps.reduce((s,p)=>s+rq(p,i),0);
    html+='<div class="card"><div class="grp"><span class="t">'+h(name)+'</span><span class="code">'+h([...new Set(ps.map(p=>p.code))].join(" / "))+'</span><span class="sp"></span><span class="sum">本季度最多 '+money(tq)+' · 建议做 <b>'+money(ps.reduce((s,p)=>s+(al.get(p.id)||0),0))+'</b> 元</span></div>';
    html+='<table><thead><tr><th>活动</th><th>渠道</th><th class="n hide-m" title="按各产品出货加权的平均点数，不是单品上限；单品点数看导出的产品明细">平均费率</th>'+[D.cur,D.m1,D.m2].map(m=>'<th class="n">'+mlabel(m)+(m>D.qEnd?'<span class="sub">·下季</span>':'')+'</th>').join("")+'<th class="n">本季度最多</th><th class="n">建议做</th><th class="n hide-m">预算余额</th></tr></thead><tbody>';
    for(const p of ps){
      const c=p.months[D.cur];const g=c.gap[i];
      html+='<tr class="row" data-id="'+h(p.id)+'"><td><div>'+h(p.cpDesc)+(p.bucket?' <span class="chip nodata">'+h(p.bucket)+'</span>':'')+(g<-0.5?' <span class="chip risk" title="这个客户这个活动本月已做的计划，要的货比本月预计能出的多；跨月计划下月能补的部分不算">本月计划多了，货差 '+money(-g)+'</span>':'')+'</div><div class="sub">'+(new Set(ps.map(x=>x.code)).size>1?h(p.code)+' · ':'')+h(p.cp)+' · '+h(p.scope)+(p.regional?' · <span class="chip follow">区域自主·已扣其他活动</span>':p.broad?' · <span class="chip nodata">通用预算·也能做陈列/上市</span>':'')+'</div>'+(pfOn()?'<div class="sub"><span class="chip follow">选中产品占这个池 '+Math.round(sh(p)*100)+'%</span></div>':'')+(p.recommend&&p.recommend.length?'<div class="sub">建议做在：'+p.recommend.slice(0,2).map(g=>h(g.group)+' '+money(g.fee)).join(' · ')+'</div>':'')+'</td><td>'+h(p.channel)+'</td><td class="n hide-m">'+(c.rate==null?'<span class="neg">待定</span>':pct(c.rate))+'</td>'+
       [D.cur,D.m1,D.m2].map(m=>{const v=fo(p,m,i);return '<td class="n '+(p.months[m].inCP?cls(v):'zero')+'">'+(p.months[m].inCP?money(v):'<span class="sub">活动已结束</span>')+'</td>'}).join("")+
       '<td class="n"><b>'+money(rq(p,i))+'</b><div class="sub">'+money(rq(p,0))+' – '+money(rq(p,2))+'</div></td><td class="n"><b class="pos">'+money(al.get(p.id)||0)+'</b></td><td class="n hide-m">'+money(p.cpBalance)+(rq(p,i)>p.cpBalance+0.5?'<div class="sub neg">预算不够</div>':'')+'</td></tr>';
      if(S.open.has(p.id))html+='<tr class="detail"><td colspan="10">'+capDetail(p)+'</td></tr>';
    }
    html+='</tbody></table></div>';
  }

  el.innerHTML=html;
  el.querySelectorAll("select[data-pf]").forEach(x=>x.onchange=()=>{const k=x.dataset.pf;S.pf[k]=x.value;let after=false;PL.forEach(([kk])=>{if(after)S.pf[kk]="";if(kk===k)after=true});renderCap()});
  const clr=document.getElementById("pfClr");if(clr)clr.onclick=()=>{PL.forEach(([k])=>S.pf[k]="");renderCap()};
  const t=document.getElementById("thr");t.onchange=()=>{S.thr=Math.max(0,+t.value||0);renderCap()};
  el.querySelectorAll("tr.row").forEach(r=>r.onclick=()=>{const id=r.dataset.id;S.open.has(id)?S.open.delete(id):S.open.add(id);renderCap()});
}
function capDetail(p){
  const M=[D.cur,D.m1,D.m2];const f=p.forecast;
  let a='<div class="dgrid"><div class="dbox" style="grid-column:1/-1"><h4>三种情况下能做多少（元）</h4><table><thead><tr><th>情况</th>'+M.map(m=>'<th class="n">'+mlabel(m)+'</th>').join("")+'</tr></thead><tbody>';
  D.scenarios.forEach((s,j)=>{a+='<tr><td><b>'+h(s.label)+'</b><div class="sub">预计出货<br>− 已做计划要的货<br>= 能做费用（× 费率）</div></td>'+M.map(m=>{const c=p.months[m];return '<td class="n">'+money(c.so[j])+'<div class="sub">− '+money(c.occ)+(c.occN?'<br>（'+c.occN+' 条计划，费用 '+money(c.occFee)+'）':'')+(c.carryIn&&c.carryIn[j]>0.5?'<br>− 上月没出够要补 '+money(c.carryIn[j]):'')+(c.wall>0.5?'<br>费用再扣其他活动 '+money(c.wall):'')+'</div><b class="'+cls(c.fee[j])+'">'+money(c.fee[j])+'</b></td>'}).join("")+'</tr>'});
  a+='</tbody></table><div class="note">本月出货 = 已经出了 '+money(f.mtd)+' + 剩下 '+D.remainDays+' 天预计 '+money(f.remain)+'。下月、下下月 = 前 3 个月平均 '+money(f.base)+' × 季节调整 '+f.s1.toFixed(2)+' / '+f.s2.toFixed(2)+'，下月再 × 库存调整 '+f.invF.toFixed(2)+'。保守/乐观只对"还没出的货"打 85 折或放大 1.2 倍。</div></div>';
  a+='<div class="dbox"><h4>是怎么估的</h4><table><tbody><tr><td>前 3 个月实际出货（已扣退货）</td><td class="n">'+f.last3.slice().reverse().map((v,k)=>mlabel(addM(D.cur,k-3))+' '+money(v)).join(' / ')+'</td></tr><tr><td>去年同月出货（'+M.map(mlabel).join('/')+'）</td><td class="n">'+f.ly.map(money).join(' / ')+'</td></tr><tr><td>客户库存（估）</td><td class="n">'+money(f.stock)+'<div class="sub">'+(f.weeks==null?'没有库存数据，下月不调整':'够卖 '+f.weeks.toFixed(1)+' 周 → 下月预计 × '+f.invF.toFixed(2))+'</div></td></tr>'+(p.timedNote?'<tr><td>活动规则排除</td><td>'+h(p.timedNote)+'</td></tr>':'')+'<tr><td>本季度已做的计划</td><td class="n">'+(()=>{const n=new Set();let fee=0;M.forEach(m=>{fee+=p.months[m].occFee||0});return '费用 '+money(fee)})()+'<div class="sub">要出 '+money(M.reduce((s,m)=>s+p.months[m].occ,0))+' 的货才能核销</div></td></tr></tbody></table></div></div>';
  if(p.recommend&&p.recommend.length)a+='<div class="dbox" style="margin-top:12px"><h4>建议做在哪些产品上（能做的费用从高到低）</h4><table><thead><tr><th>产品组</th><th class="n">近 4 个月出货</th><th class="n">能做费用</th><th class="n">占这个池 / 累计</th><th class="n">单品点数</th><th>上传时用的产品（卖得最多）</th></tr></thead><tbody>'+(()=>{const tot=p.px.reduce((x,a)=>x+Math.max(0,a[1])*a[2],0)||1;let cum=0;return p.recommend.map(g=>{cum+=g.fee;return '<tr><td><b>'+h(g.group)+'</b></td><td class="n">'+money(g.so)+'</td><td class="n">'+money(g.fee)+'</td><td class="n">'+Math.round(g.fee/tot*100)+'% / <b>'+Math.round(cum/tot*100)+'%</b></td><td class="n">'+rng(p.px.filter(a=>grpOf(a[0])===g.group).map(a=>a[2]))+'</td><td>'+h(g.top.name)+'<div class="sub">'+h(g.top.sku)+'</div></td></tr>'}).join("")})()+'</tbody></table><div class="note">累计到 80%～90% 的产品组通常就够了，尾部产品不用拉进计划；但计划备注写窄后，核销只看这些产品，退货也只算它们的。</div></div>';
  if(p.excl&&(p.excl.same.length||p.excl.other.length))a+='<div class="dbox" style="margin-top:12px"><h4>写新计划备注时要排除的 PL</h4><table><tbody>'+(p.excl.same.length?'<tr><td>同活动已有计划</td><td style="user-select:all">'+h(p.excl.same.join('、'))+'</td></tr>':'')+(p.excl.other.length?'<tr><td>其他活动、产品有重叠</td><td style="user-select:all">'+h(p.excl.other.map(x=>x[0]).join('、'))+'<div class="sub">'+h([...new Set(p.excl.other.map(x=>x[1]))].join(' / '))+'</div></td></tr>':'')+'</tbody></table><div class="note">本月到后两个月里，同客户同渠道已经占货的计划。点一下整行选中可复制。</div></div>';
  if(p.regional){const w=M.flatMap(m=>(p.months[m].wallItems||[]).map(x=>({m,...x})));if(w.length)a+='<div class="dbox" style="margin-top:12px"><h4>区域自主要先扣掉的其他活动费用</h4><table><tbody>'+w.map(x=>'<tr><td>'+mlabel(x.m)+'</td><td>'+h(x.pl)+'<div class="sub">'+h(x.cp)+'</div></td><td class="n neg">− '+money(x.fee)+'</td></tr>').join("")+'</tbody></table></div>'}
  a+='<div class="dbox" style="margin-top:12px"><h4>每个产品的出货（负数 = 退货）</h4><table><thead><tr><th>产品</th><th class="hide-m">分类</th>'+p.recentMonths.map(m=>'<th class="n">'+mlabel(m)+'</th>').join("")+'</tr></thead><tbody>'+
   p.skuRows.map(r=>'<tr><td>'+h(r.name)+'<div class="sub">'+h(r.sku)+'</div></td><td class="hide-m sub">'+h([r.brand,r.s1,r.s2].filter(Boolean).join(' · '))+'</td>'+r.v.map(v=>'<td class="n '+cls(v)+'">'+money(v)+'</td>').join("")+'</tr>').join("")+'</tbody></table></div>';
  if(p.hist.length){a+='<details><summary>以前月份（'+p.hist.length+' 个月，按新规不能回补，只作参考）</summary><table><thead><tr><th>月份</th><th class="n">出货</th><th class="n">其中退货</th><th class="n">计划要的货</th><th class="n">剩下的货</th><th class="n">当时可做费用</th></tr></thead><tbody>'+
   p.hist.slice().reverse().map(x=>'<tr><td>'+mlabel(x.mm)+' <span class="sub">'+x.mm.slice(0,4)+'</span></td><td class="n '+cls(x.actual)+'">'+money(x.actual)+'</td><td class="n '+cls(x.neg)+'">'+money(x.neg)+'</td><td class="n">'+money(x.occ)+'</td><td class="n '+cls(x.rem)+'">'+money(x.rem)+'</td><td class="n">'+(x.fee==null?'-':money(x.fee))+'</td></tr>').join("")+'</tbody></table></details>'}
  return a;
}

// ───────── 在途计划 · 督促出货 ─────────
const DD=new Date(D.dataDate+"T00:00:00");
function daysLeft(o){return Math.max(0,Math.round((new Date(o.deadline+"T00:00:00")-DD)/864e5))}
// 提前关闭建议：钱退回来还有时间、有地方再投才值得关
function closeAdvice(o){
  if(o.level!=="risk"||o.lossFee<300)return null;
  if(o.regional)return {kind:"next",text:'下次申请前减掉 '+money(o.lossFee)+' 元（区域自主退回后要重新审批）'};
  const live=o.cpEnd&&o.cpEnd.slice(0,7).replace('-','')>=D.cur;const ab=absorb(o.cp);
  if(live&&ab!=null&&ab>500){
    const n=daysLeft(o);
    if(n>15){const r=new Date(new Date(o.deadline+"T00:00:00").getTime()-15*864e5);return {kind:"watch",text:'先追，'+(r.getMonth()+1)+'/'+r.getDate()+' 还不够再退钱'}}
    const d=destOf(o.cp,o.name)[0];return {kind:"close",text:'建议提前退回 '+money(Math.min(o.lossFee,ab))+' 元'+(d?'，转给 '+short(d.name)+' '+d.ch:'')}}
  return {kind:"keep",text:live?'退回来也用不掉，继续追':'活动已结束，继续追'};
}
function pace(o){ // 需日均 / 当前日均
  const n=daysLeft(o);const need=n>0?o.shortNow/n:o.shortNow;
  // 现在每天：照现在速度，这条计划往后每天能分到的货（同活动里点数高的计划先分）
  const pm=(o.perMonth||[]).find(x=>x.mm===D.cur);const now=o.projBasis==="pace"&&n>0?Math.max(0,o.fcst)/n:(pm&&D.doneDays>0?Math.max(0,pm.avail)/D.doneDays:null);
  return {n,need,now,x:now>0?need/now:null};
}
const FV={chase:{label:"还能追",lv:["risk","follow"]},lost:{label:"已过期",lv:["lost"]},ok:{label:"货已够",lv:["ok"]},nodata:{label:"没数据",lv:["nodata"]}};
function renderFlt(){
  const el=document.getElementById("v-flt");
  const rows=D.open.filter(o=>match(o,planText(o)));
  const cnt=k=>rows.filter(o=>FV[k].lv.includes(o.level)).length;
  const shown=rows.filter(o=>FV[S.fv].lv.includes(o.level));
  const sum=(a,k)=>a.reduce((s,o)=>s+k(o),0);
  let html=helpFlt()+'<div class="bar"><div class="seg" id="fFv">'+Object.keys(FV).filter(k=>k==="chase"||k==="lost"||cnt(k)).map(k=>'<button data-v="'+k+'" class="'+(S.fv===k?'on':'')+'">'+FV[k].label+' '+cnt(k)+'</button>').join("")+'</div><span class="sub">'+
   (S.fv==="chase"?'计划还没到期，现在催出货来得及。':S.fv==="lost"?'计划已到期，差的货补不回来了；核不掉的钱可以转给别的客户。':S.fv==="ok"?'出货已经够核销，下面看还能不能加做。':'这些客户不在本次 BI 里，没法判断。')+'</span></div>';
  if(S.fv==="chase"){
    const risk=shown.filter(o=>o.level==="risk");
    html+='<div class="kpis">'+
     '<div class="kpi amber"><div class="l">还差多少货</div><div class="v">'+wan(sum(shown,o=>o.shortNow))+'</div><div class="s">'+shown.length+' 条计划 · 最快 '+(shown.length?Math.min(...shown.map(daysLeft))+' 天后到期':'-')+'</div></div>'+
     '<div class="kpi red"><div class="l">照现在的速度，到期还差</div><div class="v">'+wan(sum(risk,o=>o.shortFinal))+'</div><div class="s">'+risk.length+' 条跟不上 · 会少核 '+wan(sum(risk,o=>o.lossFee))+'</div></div>'+
     '<div class="kpi"><div class="l">照现在的速度能补上</div><div class="v">'+wan(sum(shown.filter(o=>o.level==="follow"),o=>o.shortNow))+'</div><div class="s">'+shown.filter(o=>o.level==="follow").length+' 条 · 别掉速就行</div></div>'+
     (()=>{const ad=shown.map(o=>[o,closeAdvice(o)]).filter(x=>x[1]&&(x[1].kind==="close"||x[1].kind==="next"));return '<div class="kpi"><div class="l">建议提前退回的钱</div><div class="v">'+wan(ad.reduce((s,x)=>s+x[0].lossFee,0))+'</div><div class="s">'+ad.length+' 条 · 到期前 15 天内才建议</div></div>'})()+
     '<div class="kpi"><div class="l">退货（直接抵扣出货）</div><div class="v neg">'+wan(sum(shown,o=>o.returns))+'</div><div class="s">少退货和多出货一样重要</div></div></div>';
  }else if(S.fv==="lost"){
    html+='<div class="kpis">'+
     '<div class="kpi red"><div class="l">核不掉的钱</div><div class="v">'+wan(sum(shown,o=>o.lossFee))+'</div><div class="s">'+shown.length+' 条计划</div></div>'+
     '<div class="kpi"><div class="l">差的货</div><div class="v">'+wan(sum(shown,o=>o.shortNow))+'</div><div class="s">计划要 '+wan(sum(shown,o=>o.need))+'</div></div>'+
     '<div class="kpi"><div class="l">退货</div><div class="v neg">'+wan(sum(shown,o=>o.returns))+'</div><div class="s">复盘用：点开看哪些产品在退</div></div></div>';
    html+=reflowCard(shown);
  }
  const by=new Map();shown.forEach(o=>{if(!by.has(o.name))by.set(o.name,[]);by.get(o.name).push(o)});
  const groups=[...by.entries()].sort((a,b)=>S.fv==="lost"?sum(b[1],o=>o.lossFee)-sum(a[1],o=>o.lossFee):sum(b[1],o=>o.shortNow)-sum(a[1],o=>o.shortNow));
  if(!groups.length)html+='<div class="card"><div class="empty">当前筛选下没有'+FV[S.fv].label+'的计划</div></div>';
  for(const [name,os] of groups){
    if(S.fv==="chase")os.sort((a,b)=>daysLeft(a)-daysLeft(b)||b.shortNow-a.shortNow);else os.sort((a,b)=>b.lossFee-a.lossFee||b.shortNow-a.shortNow);
    html+='<div class="card"><div class="grp"><span class="t">'+h(name)+'</span><span class="code">'+h(os[0].code)+'</span><span class="sp"></span><span class="sum">'+
      (S.fv==="lost"?'核不掉 <b class="neg">'+money(sum(os,o=>o.lossFee))+'</b>':S.fv==="ok"?'':'还差货 <b>'+money(sum(os,o=>o.shortNow))+'</b>'+(S.fv==="chase"?' · 照现在速度会少核 <b class="neg">'+money(sum(os,o=>o.lossFee))+'</b>':''))+'</span>'+
      (S.fv==="chase"?'<button class="btn copy" data-c="'+h(name)+'">复制催货消息</button>':'')+'</div>';
    const chase=S.fv==="chase",okv=S.fv==="ok";
    html+='<table><thead><tr>'+(chase?'<th>状态</th>':'')+'<th>计划</th><th class="hide-m">渠道 · 活动日期</th>'+(chase?'<th class="n">到期</th>':'')+'<th class="n">计划要的货</th><th class="n">已出货</th>'+
      (okv?'<th class="n">还能加做</th><th class="n">建议做</th>':'<th class="n">还差</th>'+(chase?'<th class="n hide-m">每天要出 / 现在每天</th>':'<th class="n hide-m">退货</th>')+'<th class="n">'+(chase?'照现在速度会少核':'核不掉')+'</th>')+'</tr></thead><tbody>';
    for(const o of os){
      const r=o.need>0?Math.max(0,Math.min(1,o.avail/o.need)):0;const pc=pace(o);const ad=chase?closeAdvice(o):null;
      html+='<tr class="row" data-id="'+h(o.pl)+'">'+(chase?'<td><span class="chip '+LV[o.level][1]+'">'+LV[o.level][0]+'</span></td>':'')+'<td><div>'+h(o.cpDesc)+'</div><div class="sub">'+h(o.pl)+' · '+pct(o.rate)+(o.packN>1?' · 同活动 '+o.packN+' 条，点数排第 '+o.packRank:'')+'</div></td><td class="hide-m">'+h(o.channel)+'<div class="sub">'+o.start.slice(5)+' ~ '+o.end.slice(5)+(o.remarkDates?'（按备注日期）':'')+'</div></td>'+
       (chase?'<td class="n"><b class="'+(pc.n<=7?'neg':'')+'">还剩 '+pc.n+' 天</b><div class="sub">'+o.deadline.slice(5)+' 截止</div></td>':'')+
       '<td class="n">'+money(o.need)+'</td><td class="n">'+money(o.avail)+'<div class="cov '+(r>=1?'':r>=0.8?'mid':'bad')+'"><i style="width:'+(r*100).toFixed(0)+'%"></i></div><div class="sub">'+(r*100).toFixed(0)+'%</div></td>';
      if(okv){
        const ps=D.pools.filter(p=>p.cp===o.cp&&o.chans.includes(p.channel)&&(p.code===o.code||p.name===o.name));const q=ps.reduce((s,p)=>s+rowQ(p,1),0);const AL1=allocMap(1);const al1=ps.reduce((s,p)=>s+(AL1.get(p.id)||0),0);
        html+=o.closed?'<td class="n zero" colspan="2"><span class="sub">已过的月份，按新规不能再补</span></td>':'<td class="n">'+money(q)+'<div class="sub">同客户同活动本季度</div></td><td class="n pos"><b>'+money(al1)+'</b><div class="sub">按剩余预算</div></td>';
      }else{
        html+='<td class="n '+(o.shortNow>0.5?(chase?'':'neg'):'zero')+'"><b>'+money(o.shortNow)+'</b>'+(chase&&o.shortNow>0.5?'<div class="sub">照现在速度到期还差 '+money(o.shortFinal)+'</div>':'')+'</td>'+
         (chase?'<td class="n hide-m">'+money(pc.need)+' / '+(pc.now==null?'<span class="sub">还没开始</span>':money(pc.now))+(pc.x!=null&&pc.x>1.05?'<div class="sub neg">要快 '+pc.x.toFixed(1)+' 倍</div>':pc.x!=null?'<div class="sub pos">速度够</div>':'')+'</td>':'<td class="n hide-m '+cls(o.returns)+'">'+money(o.returns)+'</td>')+
         '<td class="n '+cls(-o.lossFee)+'">'+money(o.lossFee)+(ad?'<div class="sub '+(ad.kind==="close"||ad.kind==="next"?'neg':'')+'" style="white-space:normal;max-width:220px;margin-left:auto">'+h(ad.text)+'</div>':'')+'</td>';
      }
      html+='</tr>';
      if(S.open.has(o.pl))html+='<tr class="detail"><td colspan="9">'+fltDetail(o)+'</td></tr>';
    }
    html+='</tbody></table></div>';
  }
  el.innerHTML=html;
  el.querySelectorAll("#fFv button").forEach(b=>b.onclick=()=>{S.fv=b.dataset.v;renderFlt()});
  el.querySelectorAll("tr.row").forEach(r=>r.onclick=()=>{const id=r.dataset.id;S.open.has(id)?S.open.delete(id):S.open.add(id);renderFlt()});
  el.querySelectorAll("button.copy").forEach(b=>b.onclick=e=>{e.stopPropagation();copyMsg(b.dataset.c)});
}
// 回流去向：已到期少核费用按 CP 汇总；同 CP 还有出货承载的客户可直接改投，没有的需与 CDT 置换到其他 CP
function reflowCard(lost){
  const by=new Map();lost.forEach(o=>{if(o.lossFee<1)return;const x=by.get(o.cp)||{cp:o.cp,desc:o.cpDesc,end:o.cpEnd,fee:0,n:0};x.fee+=o.lossFee;x.n++;by.set(o.cp,x)});
  const list=[...by.values()].sort((a,b)=>b.fee-a.fee);
  if(!list.length)return '';
  const swap=D.pools.filter(p=>p.plannable&&rowQ(p,1)>p.cpBalance+500).sort((a,b)=>(rowQ(b,1)-b.cpBalance)-(rowQ(a,1)-a.cpBalance)).slice(0,5);
  let t='<div class="card"><div class="grp" style="cursor:default"><span class="t">核不掉的钱可以转给谁</span><span class="sp"></span><span class="sub">0 核销关掉计划，钱马上回到原活动；区域自主要等下个月重新审批</span></div><table><thead><tr><th>活动</th><th class="n">退回来的钱</th><th class="n">这个活动还用得掉</th><th>可以转给（本季度还能做）</th></tr></thead><tbody>';
  for(const x of list){
    const dest=destOf(x.cp,null).slice(0,3);const ab=absorb(x.cp);const reg=/区域自主/.test(x.desc);
    const ended=!!x.end&&x.end.slice(0,7).replace('-','')<D.cur;
    t+='<tr><td>'+h(x.desc)+'<div class="sub">'+h(x.cp)+' · '+x.n+' 条计划'+(ended?' · 活动已于 '+x.end+' 结束':'')+''+(reg?' · 退回后要下月重新审批':'')+'</div></td><td class="n neg"><b>'+money(x.fee)+'</b></td><td class="n '+(ab==null||ab<=0?'neg':'pos')+'">'+(ab==null?'-':money(ab))+(ab!=null&&ab<x.fee?'<div class="sub">用不完</div>':'')+'</td><td>'+(dest.length&&!ended?dest.map(d=>h(d.name.replace(/有限(责任)?公司$/,''))+' '+h(d.ch)+' <b>'+money(d.v)+'</b>').join('<br>'):'<span class="sub">'+(ended?'活动已结束':'这个活动没有客户还能做')+' → 要找 CDT 换到别的活动</span>')+'</td></tr>';
  }
  t+='</tbody></table><div class="note" style="padding:0 14px">「这个活动还用得掉」= 所有客户本季度还能做的 − 活动现在的剩余预算。是负数说明现有预算都花不完，退回的钱只能找 CDT 换活动。</div>'+(swap.length?'<div class="note" style="padding:0 14px 12px">预算不够、值得换钱进来的（能做的比预算多）：'+swap.map(p=>h(p.name.replace(/有限(责任)?公司$/,''))+'·'+h(p.cpDesc)+'·'+h(p.channel)+' 多 '+money(rowQ(p,1)-p.cpBalance)).join('；')+'</div>':'')+'</div>';
  return t;
}
function fltDetail(o){
  let a='<div class="dgrid"><div class="dbox"><h4>这条计划是怎么算的</h4><table><tbody>'+
   '<tr><td>算哪些货</td><td>'+h(o.channel)+' 渠道（BI 里的 '+h(o.chans.join('+'))+'）· '+h(o.scopeNote)+' · 共 '+o.scopeSize+' 个产品</td></tr>'+
   '<tr><td>算哪几个月</td><td>'+o.months.map(mlabel).join('、')+' · '+o.deadline+' 截止</td></tr>'+
   '<tr><td>这些货已经出了（扣了退货）</td><td class="n">'+money(o.gross)+'</td></tr>'+
   (o.packN>1?'<tr><td>同活动的几条计划</td><td>共 '+o.packN+' 条（'+o.packRates.map(pct).join('、')+'），货可以互相挪，先给点数高的。这条排第 '+o.packRank+'</td></tr>':'')+
   (o.peerDone?'<tr><td>减：点数更高的计划或已核销的计划先用掉的货</td><td class="n neg">− '+money(o.peerDone)+'</td></tr>':'')+
   
   '<tr><td>算给这条计划的货</td><td class="n"><b>'+money(o.avail)+'</b></td></tr>'+
   (!o.closed?'<tr><td>到期前预计还能出</td><td class="n">'+money(o.fcst)+'<div class="sub">'+(o.projBasis==="pace"?'按本月每天 '+money(o.paceDaily)+' 的速度算':'按以前月份平均算')+'</div></td></tr>':'')+
   (o.perMonth&&o.perMonth.length>1?'<tr><td>每个月（计划要 / 已出）</td><td class="n">'+o.perMonth.map(x=>mlabel(x.mm)+' '+money(x.need)+' / '+money(x.avail)).join('<br>')+'</td></tr>':'')+
   '<tr><td>计划费用 / 已核销的</td><td class="n">'+money(o.budget)+' / '+money(o.verified)+'</td></tr>'+
   '</tbody></table>'+(o.remarks?'<div class="note">计划备注：'+h(o.remarks)+'</div>':'')+'</div>';
  a+='<div class="dbox"><h4>退货的产品（直接抵扣出货）</h4>'+(o.returnSkus.length?'<table><tbody>'+o.returnSkus.map(r=>'<tr><td>'+h(r.name)+'<div class="sub">'+h(r.sku)+'</div></td><td class="n neg">'+money(r.v)+'</td></tr>').join("")+'</tbody></table>':'<div class="sub">这几个月没有退货</div>')+'</div></div>';
  return a;
}
function copyMsg(name){
  const os=D.open.filter(o=>o.name===name&&(o.level==="risk"||o.level==="follow")&&o.shortNow>0.5).sort((a,b)=>daysLeft(a)-daysLeft(b));
  if(!os.length){toast("这个客户没有需要催的计划");return}
  let t='【核销提醒】'+name+'（BI 截至 '+D.dataDate+'）\\n';
  os.forEach((o,k)=>{const pc=pace(o);t+=(k+1)+'. '+o.cpDesc+'｜'+o.channel+'｜'+o.start.slice(5)+'~'+o.end.slice(5)+'：计划要出货 '+wan(o.need)+'，已出 '+wan(o.avail)+'，'+o.deadline.slice(5)+' 前还要出 '+wan(o.shortNow)+'（还剩 '+pc.n+' 天，每天要出 '+wan(pc.need)+(pc.now!=null?'，现在每天出 '+wan(pc.now):'')+'）'+(o.returns<-0.5?'；退货 '+wan(-o.returns)+(o.returnSkus[0]?'（主要：'+o.returnSkus.slice(0,2).map(r=>r.name.replace(/^雀巢/,'').slice(0,14)).join('、')+'）':''):'')+'\\n'});
  t+='提醒：财务按整个渠道、整个产品组、整月拉出货来核销，退货会直接抵扣，请尽快出货、少退货。';
  navigator.clipboard?navigator.clipboard.writeText(t).then(()=>toast("已复制，可直接粘贴到微信"),()=>prompt("复制以下内容",t)):prompt("复制以下内容",t);
}
// ───────── 小字说明（默认收起） ─────────
function helpCap(){return '<details class="help"><summary>这页怎么看？</summary><ul>'+
 '<li><b>能做费用</b> = （预计出货 − 已做计划要的货）× 费率。货是"弹药"，计划已经占掉的货不能再用。</li>'+
 '<li><b>已做计划要的货</b>：TTS 上的"计划进货金额"，财务要看到这么多出货才能全额核销。它是<b>货的金额，不是费用</b>。跨月的计划按天数分到每个月。</li>'+
 '<li><b>预计出货</b>：本月 = 已经出的 + 剩下几天按现在速度估；下个月起 = 前 3 个月平均 × 季节调整，下个月再看库存调整。</li>'+
 '<li><b>保守 / 基准 / 乐观</b>：只对"还没出的货"打 85 折、照算、放大 1.2 倍，已经出的货不变。</li>'+
 '<li><b>季节调整</b>：去年这个月比去年平时多卖还是少卖，按比例调，最多调到 0.7～1.3 倍。<b>库存调整</b>：客户库存够卖 4 周算正常，多了下月多估、少了少估，同样限 0.7～1.3 倍。</li>'+
 '<li><b>建议做</b>：活动剩余预算，按各客户"最多能做"的比例分下去，按 100 元取整。<b>预算不够</b>：这个客户能做的比活动剩余预算还多，要找 CDT 加预算。</li>'+
 '<li><b>建议做在</b>：哪些产品组近 4 个月卖得多、费率高，就优先做在上面；点开能看到上传用哪个产品。</li>'+
 '<li><b>通用预算</b>（MT TT、区域自主）：也能做陈列、上市，这里只算折扣部分。<b>区域自主</b>不能和其他活动用同一批货，已经先扣掉。</li>'+
 '<li><b>咖啡零食渠道（SCD）</b>：CDT 只批 2% 的计划，所以这页按 2% 估能做多少；7+2 装不算。这是 CDT 定的规划上限，审核销时按计划点数核（见"催出货"页说明）。</li>'+
 '<li><b>产品范围</b>：TT、WS、Sub-D 活动按本 BU 全品类算（预算导出会丢掉只有代码的品牌，如 OSW 新西兰乳粉、OS6 N3）；其他活动仍按 CP 导出的促销品牌算，有丢失的在"数据说明"里提醒，宁少不多。</li>'+
 '<li><b>平均费率 ≠ 单品上限</b>：表里的费率是这个池各产品按出货加权的平均点数；每个产品自己的点数看导出"产品明细"的 SKURate（折扣率上限表）和本池计算费率。</li>'+
 '<li><b>备注排除 PL</b>：点开一行能看到同客户同渠道本月到后两月已占货的计划号，写新计划备注时直接排除，导出表里也有。</li>'+
 '<li><b>点数从哪来</b>：活动机制写了具体点数就按机制；写"不超过折扣率上限"的，按 TTS 折扣率上限表（只看 DT 那行，批发渠道看批发那行）。</li></ul></details>'}
function helpFlt(){return '<details class="help"><summary>这页怎么看？</summary><ul>'+
 '<li><b>同一个活动的几条计划</b>（同客户、同 CP 号）：货可以互相挪，按<b>计划点数</b>核（不看单个产品的点数）。核销同事会先把货填进点数最高的那条，货不够时先放弃点数低的。网站也按这个顺序分货，所以同一个活动的几条计划进度会不一样。这是现行做法，财务如果收紧会再改。</li>'+
 '<li><b>财务怎么核销</b>：按"同一个客户 + 同一个活动 + 同一个渠道 + 活动允许的所有产品"拉出整月出货，<b>退货会直接抵扣</b>。加起来够计划要的货才能全额核销，不够就按比例少核或被退单。</li>'+
 '<li><b>到期</b>：计划最后一个月的月底（财务按整月拉数）。<b>还剩几天</b>从 BI 数据日期算起。</li>'+
 '<li><b>照现在的速度</b>：本月每天实际出了多少，照这个速度一直出到到期日。本月刚过不到 7 天、或计划还没开始时，改用以前月份的平均来估。</li>'+
 '<li><b>跟不上</b>：照现在速度到期还不够，要催。<b>跟得上</b>：照现在速度能补上，别掉速就行。</li>'+
 '<li><b>每天要出 / 现在每天</b>：还差的货 ÷ 剩下天数，和照现在速度这条计划每天能分到的货比（同活动里点数高的计划先分），<b>要快几倍</b>一眼看出。</li>'+
 '<li><b>建议提前退回</b>：到期前 15 天内还跟不上，而且这个活动还没结束、钱退回来还有客户能用，就建议 0 核销关掉，把钱转给别的客户；区域自主要等下次申请。</li>'+
 '<li><b>核不掉的钱可以转给谁</b>（在"已过期"里）：按活动汇总退回来的钱，列出同一个活动里本季度还能做的客户。</li></ul></details>'}
// ───────── 数据说明 ─────────
function renderChk(){
  document.getElementById("v-chk").innerHTML='<div class="card" style="padding:14px 18px"><h3 style="margin:0 0 8px">数据检查和算法说明</h3><ul class="checks">'+D.checks.map(c=>'<li class="'+c.level+'">'+(c.level==="warn"?"⚠️ ":"")+h(c.text)+'</li>').join("")+'</ul>'+
  '<div class="sub">文件概况：BI-SO '+D.files.soRows+' 行（月份 '+D.files.months[0]+'–'+D.files.months[D.files.months.length-1]+'）· TTS 计划 '+D.files.plans+' 条 · CP '+D.files.cps+' 个 · 生成于 '+new Date(D.generatedAt).toLocaleString("zh-CN")+'</div></div>';
}
// CP 下拉：只列当前客户/BU 下有的活动，选中的不在范围内就清掉
function cpOpts(){const m=new Map();[...D.pools.filter(p=>p.plannable),...D.open].forEach(x=>{if(S.cust&&x.name!==S.cust)return;if(S.bu&&x.bu&&x.bu!==S.bu)return;if(!m.has(x.cp))m.set(x.cp,x.cpDesc||"")});
  if(S.cp&&!m.has(S.cp))S.cp="";const el=document.getElementById("fCP");
  el.innerHTML='<option value="">全部活动（CP）</option>'+[...m.entries()].sort((a,b)=>a[0].localeCompare(b[0])).map(([c,d])=>'<option value="'+h(c)+'"'+(S.cp===c?' selected':'')+'>'+h(c+' '+d)+'</option>').join("")}

// ───────── LKA/KAC 独立通道（默认关闭，开后按 S.kacRate 折算并过滤 <500 碎 KAC） ─────────
function kacCapPools(){
  const raw=(D.kacPools||[]).filter(k=>k.plannable);
  const by=new Map();
  const r=S.kacRate;
  raw.forEach(k=>{
    const q1=qMonths.reduce((s,m)=>s+((k.months[m]&&k.months[m].fee[1])||0)*r,0);
    if(q1<500)return;
    const key=k.code+'|'+k.cp+'|'+k.bucket;
    let g=by.get(key);
    if(!g){
      g={id:'LKA|'+key,code:k.code,name:k.name,cp:k.cp,cpDesc:k.cpDesc,cpBalance:k.cpBalance,cpEnd:k.cpEnd,bu:k.bu,
        channel:'LKA(KAC聚合)',bucket:k.bucket,scope:k.scope,broad:k.broad,regional:k.regional,plannable:true,
        kacItems:[],skuRows:[],px:[],recommend:[],hist:[],excl:{same:[],other:[]},
        forecast:{mtd:0,remain:0,base:0,s1:1,s2:1,invF:1,last3:[0,0,0],ly:[0,0,0],stock:0,weeks:null},
        recentMonths:[addM(D.cur,-3),addM(D.cur,-2),addM(D.cur,-1),D.cur],
        months:Object.fromEntries([D.cur,D.m1,D.m2].map(m=>[m,{inCP:k.months[m].inCP,rate:k.months[m].rate,actual:0,occ:0,occFee:0,occN:0,carryIn:[0,0,0],so:[0,0,0],rem:[0,0,0],fee:[0,0,0],gap:[0,0,0],carryOut:[0,0,0],wall:0,wallItems:[]}]))};
      by.set(key,g);
    }
    g.kacItems.push({kacName:k.kacName,fee:q1});
    [D.cur,D.m1,D.m2].forEach(m=>{
      const km=k.months[m],gm=g.months[m];
      if(!km)return;
      gm.actual+=km.actual||0;gm.occ+=km.occ||0;gm.occFee+=km.occFee||0;gm.occN+=km.occN||0;
      for(let j=0;j<3;j++){gm.so[j]+=km.so[j];gm.rem[j]+=km.rem[j];gm.fee[j]+=km.fee[j]*r}
    });
  });
  return [...by.values()].map(g=>{
    g.channel='LKA('+(g.kacItems.length)+'个KAC·'+Math.round(r*100)+'%)';
    g.recommend=g.kacItems.sort((a,b)=>b.fee-a.fee).slice(0,5).map(x=>({group:x.kacName,so:0,fee:x.fee,top:{sku:'',name:x.kacName,so:0}}));
    return g;
  });
}

// ───────── 费用分配台（矩阵工作台 + 陈列一鱼双吃 + 渠道/KAC勾选 + 临时追加 + 批次隔离草稿 + AI导出包） ─────────
const WB_PREF_KEY='ep_v10_wb_prefs_v1';
const WB_DRAFT_KEY='ep_v10_wb_draft_'+(D.batchKey||D.dataDate);
const ALL_CUSTS=(()=>{
  const by=new Map();
  (D.custRank||[]).forEach(c=>{if(c.code&&!by.has(c.code))by.set(c.code,{code:c.code,name:c.name,histFee:c.fee||0})});
  (D.pools||[]).forEach(p=>{if(p.code&&!by.has(p.code))by.set(p.code,{code:p.code,name:p.name,histFee:0})});
  return [...by.values()].sort((a,b)=>b.histFee-a.histFee||a.name.localeCompare(b.name,'zh-CN'));
})();
const HIST_MONTHS=(()=>{
  const s=new Set();
  (D.pools||[]).forEach(p=>(p.hist||[]).forEach(x=>s.add(x.mm)));
  return [...s].sort();
})();
const FUT_MONTHS=[D.cur,D.m1,D.m2];
const DEFAULT_MONTHS=FUT_MONTHS.filter(m=>m<=D.qEnd);

function loadJSON(k,def){try{const v=localStorage.getItem(k);return v?JSON.parse(v):def}catch(_){return def}}
function saveJSON(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(_){}}

const WBP=loadJSON(WB_PREF_KEY,null)||{cols:ALL_CUSTS.slice(0,8).map(c=>({id:c.code,code:c.code,label:short(c.name),name:c.name,sub:''}))};
// 确保至少有列
if(!WBP.cols||!WBP.cols.length)WBP.cols=ALL_CUSTS.slice(0,8).map(c=>({id:c.code,code:c.code,label:short(c.name),name:c.name,sub:''}));

const WBD=loadJSON(WB_DRAFT_KEY,null)||{
  alloc:{},      // "cp|colId" -> number
  add:{},        // cp -> number (临时追加)
  extraCps:[],   // 调入的0余额CP code[]
  months:{},     // colId -> string[] (勾选的月份)
  chSel:{},      // "cp|colId" -> { [poolId]: boolean } (渠道/KAC自定义勾选覆盖)
};
function saveWBP(){saveJSON(WB_PREF_KEY,WBP)}
function saveWBD(){saveJSON(WB_DRAFT_KEY,WBD)}
function colMonths(colId){return WBD.months[colId]&&WBD.months[colId].length?WBD.months[colId]:DEFAULT_MONTHS}

// 计算某 (cp, col) 下所有可用渠道 & KAC 通道的金额明细
function cellBreakdown(cpCode,col){
  const ms=colMonths(col.id);
  const sc=S.sc;
  const ov=WBD.chSel[cpCode+'|'+col.id]||{};
  const chs=[];
  D.pools.filter(p=>p.cp===cpCode&&p.code===col.code).forEach(p=>{
    const perM={};let tot=0;
    ms.forEach(mm=>{
      let f=0;
      if(mm<D.cur){const hx=(p.hist||[]).find(x=>x.mm===mm);f=hx&&hx.fee!=null?Math.max(0,hx.fee):0}
      else{const cm=p.months&&p.months[mm];f=cm&&cm.inCP?Math.max(0,cm.fee[sc]||0):0}
      if(f>0){perM[mm]=f;tot+=f}
    });
    if(tot<1)return;
    const checked=ov[p.id]!=null?!!ov[p.id]:tot>=500;
    chs.push({id:p.id,kind:'ch',label:p.channel+(p.bucket?'·'+p.bucket:''),channel:p.channel,bucket:p.bucket||'',fee:tot,perM,checked,pool:p});
  });
  const kacs=[];
  if(S.kacOn){
    const r=S.kacRate;
    (D.kacPools||[]).filter(k=>k.cp===cpCode&&k.code===col.code).forEach(k=>{
      const perM={};let tot=0;
      ms.forEach(mm=>{
        let f=0;
        if(mm<D.cur){const hx=(k.hist||[]).find(x=>x.mm===mm);f=hx&&hx.fee!=null?Math.max(0,hx.fee)*r:0}
        else{const cm=k.months&&k.months[mm];f=cm&&cm.inCP?Math.max(0,cm.fee[sc]||0)*r:0}
        if(f>0){perM[mm]=f;tot+=f}
      });
      if(tot<1)return;
      const checked=ov[k.id]!=null?!!ov[k.id]:tot>=500;
      kacs.push({id:k.id,kind:'kac',label:k.kacName+(k.bucket?'·'+k.bucket:''),kacName:k.kacName,bucket:k.bucket||'',fee:tot,perM,checked,kac:k});
    });
  }
  chs.sort((a,b)=>b.fee-a.fee);
  kacs.sort((a,b)=>b.fee-a.fee);
  const capCh=chs.filter(x=>x.checked).reduce((s,x)=>s+x.fee,0);
  const capKac=kacs.filter(x=>x.checked).reduce((s,x)=>s+x.fee,0);
  return {chs,kacs,cap:capCh+capKac,capCh,capKac};
}

function wbRows(){
  const all=D.allCps||[];
  const extra=new Set(WBD.extraCps||[]);
  return all.filter(c=>{
    if(S.bu&&c.bu!==S.bu)return false;
    if(S.wbType==='disc'&&!c.isDiscount)return false;
    if(S.wbType==='disp'&&c.isDiscount)return false;
    if(S.cp&&c.code!==S.cp)return false;
    if(S.q&&!(c.code+' '+c.desc+' '+c.mech).toLowerCase().includes(S.q.toLowerCase()))return false;
    return c.balance>=D.minBalance||extra.has(c.code)||(Number(WBD.add[c.code])||0)>0;
  });
}

function renderWb(){
  const el=document.getElementById("v-wb");
  const cps=wbRows();
  const cols=WBP.cols;
  const activeCodes=new Set(cols.map(c=>c.id));
  const addableCusts=ALL_CUSTS.filter(c=>!cols.some(x=>x.id===c.code));
  const zeroCps=(D.allCps||[]).filter(c=>c.balance<D.minBalance&&!(WBD.extraCps||[]).includes(c.code)&&(!S.bu||c.bu===S.bu));

  // 统计每个客户本轮在非区域自主折扣 CP 上分配的总额（用于区域自主软提醒）
  const nonRegByCust=new Map();
  (D.allCps||[]).forEach(c=>{
    if(!c.isDiscount||c.regional)return;
    cols.forEach(col=>{
      const v=Number(WBD.alloc[c.code+'|'+col.id])||0;
      if(v>0)nonRegByCust.set(col.code,(nonRegByCust.get(col.code)||0)+v);
    });
  });

  // KPI 汇总
  let totPool=0,totAdd=0,totUsed=0;
  cps.forEach(c=>{
    const addV=Number(WBD.add[c.code])||0;
    totPool+=Math.max(0,c.balance);totAdd+=addV;
    cols.forEach(col=>totUsed+=Number(WBD.alloc[c.code+'|'+col.id])||0);
  });
  const totRem=totPool+totAdd-totUsed;

  let html='<div class="kpis">'+
    '<div class="kpi"><div class="l">当前实有预算池</div><div class="v">'+wan(totPool)+'</div><div class="s">'+cps.length+' 个活动（含折扣与陈列）</div></div>'+
    '<div class="kpi"><div class="l">临时追加预分配</div><div class="v">'+wan(totAdd)+'</div><div class="s">总池 '+wan(totPool+totAdd)+' 元</div></div>'+
    '<div class="kpi"><div class="l">本轮已分配</div><div class="v">'+wan(totUsed)+'</div><div class="s">占总池 '+(totPool+totAdd>0?Math.round(totUsed/(totPool+totAdd)*100):0)+'%</div></div>'+
    '<div class="kpi '+(totRem<-0.5?'red':Math.abs(totRem)<1?'':'amber')+'"><div class="l">剩余未分配</div><div class="v">'+wan(totRem)+'</div><div class="s">'+(Math.abs(totRem)<1?'已全部分完':totRem<0?'超额分配，请调减':'点击格子「上限」可一键填满')+'</div></div></div>';

  // 工具条
  html+='<div class="bar">'+
    '<div class="seg" id="wbType"><button data-v="all" class="'+(S.wbType==='all'?'on':'')+'">全部</button><button data-v="disc" class="'+(S.wbType==='disc'?'on':'')+'">仅折扣</button><button data-v="disp" class="'+(S.wbType==='disp'?'on':'')+'">仅陈列/上市</button></div>'+
    '<select id="wbAddCust" style="max-width:190px"><option value="">+ 移入客户列…</option>'+addableCusts.map(c=>'<option value="'+h(c.code)+'">'+h(short(c.name))+' ('+wan(c.histFee)+')</option>').join('')+'</select>'+
    '<button class="btn" id="wbAddSub">+ 添加对账子列</button>'+
    '<select id="wbAddZero" style="max-width:220px"><option value="">+ 调入0余额常见CP…</option>'+zeroCps.slice(0,40).map(c=>'<option value="'+h(c.code)+'">'+h(c.code+' '+c.desc)+(c.histBudget?' · 历史'+wan(c.histBudget):'')+'</option>').join('')+'</select>'+
    '<span class="sp" style="flex:1"></span>'+
    '<button class="btn primary" id="wbExpCsv">导出分配包 (AI填表CSV)</button>'+
    '<button class="btn" id="wbExpJson">存草稿</button>'+
    '<button class="btn" id="wbImpJson">读草稿</button>'+
    '<button class="btn" id="wbReset">清空</button>'+
    '<input type="file" id="wbJsonFile" accept=".json" style="display:none"></div>';

  // 矩阵表
  html+='<div class="wb-wrap"><table class="wb-tbl"><thead><tr>'+
    '<th class="fix">活动（CP）</th><th class="n">现有余额</th><th class="n">临时追加</th><th class="n">未分配</th>';
  cols.forEach((col,idx)=>{
    const ms=colMonths(col.id);
    const allM=[...HIST_MONTHS,...FUT_MONTHS];
    html+='<th class="wb-colh"><div class="nm"><span>'+h(col.label)+(col.sub?' <span class="chip nodata">子列</span>':'')+'</span><span class="ops">'+
      (idx>0?'<button data-mv="'+idx+'" data-d="-1" title="左移">‹</button>':'')+
      (idx<cols.length-1?'<button data-mv="'+idx+'" data-d="1" title="右移">›</button>':'')+
      '<button data-rm="'+h(col.id)+'" title="移出本轮">×</button></span></div>'+
      '<div class="wb-ms">'+allM.map(mm=>{
        const isH=mm<D.cur,on=ms.includes(mm);
        return '<button class="'+(on?'on ':'')+(isH?'hist':'')+'" data-col="'+h(col.id)+'" data-mm="'+mm+'" title="'+(isH?'历史回溯(按100%实际)':'当月/未来(随保守/基准/乐观)')+'">'+(+mm.slice(4))+'月</button>';
      }).join('')+'</div></th>';
  });
  html+='</tr></thead><tbody>';

  const colSums=Object.fromEntries(cols.map(c=>[c.id,0]));
  for(const cp of cps){
    const addV=Number(WBD.add[cp.code])||0;
    const poolTot=Math.max(0,cp.balance)+addV;
    let rowUsed=0;
    cols.forEach(col=>{const v=Number(WBD.alloc[cp.code+'|'+col.id])||0;rowUsed+=v;colSums[col.id]+=v});
    const rem=poolTot-rowUsed;
    const remCls=rem<-0.5?'over':Math.abs(rem)<1&&poolTot>0?'done':'';
    const tag=cp.isDiscount?(cp.regional?'<span class="chip follow">区域自主</span>':cp.broad?'<span class="chip nodata">宽口径</span>':'<span class="chip ok">折扣</span>'):'<span class="chip" style="background:#f1e8ff;color:#6d28d9">陈列/上市</span>';
    html+='<tr><td class="fix"><div><b>'+h(cp.desc)+'</b> '+tag+'</div><div class="sub">'+h(cp.code)+' · '+(BU[cp.bu]||cp.bu)+' · 止 '+cp.end.slice(5)+'</div></td>'+
      '<td class="n">'+money(cp.balance)+'</td>'+
      '<td class="n"><input class="wb-in add" type="number" step="100" min="0" data-add="'+h(cp.code)+'" value="'+(addV||'')+'" placeholder="0"></td>'+
      '<td class="n wb-rem '+remCls+'">'+(Math.abs(rem)<1&&poolTot>0?'已分配':money(rem))+'</td>';

    for(const col of cols){
      const key=cp.code+'|'+col.id;
      const val=Number(WBD.alloc[key])||0;
      if(!cp.isDiscount){
        html+='<td><input class="wb-in" type="number" step="100" min="0" data-alloc="'+h(key)+'" value="'+(val||'')+'" placeholder="0"><div class="wb-cap"><span>陈列不限出货</span></div></td>';
      }else{
        const bd=cellBreakdown(cp.code,col);
        const over=val>bd.cap+0.5;
        const nCh=bd.chs.filter(x=>x.checked).length;
        const nKac=bd.kacs.filter(x=>x.checked).length;
        const otherUsed=cp.regional?(nonRegByCust.get(col.code)||0):0;
        html+='<td><input class="wb-in '+(over?'over':'')+'" type="number" step="100" min="0" data-alloc="'+h(key)+'" value="'+(val||'')+'" placeholder="0">'+
          '<div class="wb-cap"><span class="fill" data-fill="'+h(key)+'" data-cap="'+Math.round(bd.cap)+'" data-rem="'+Math.round(rem+val)+'" title="点击一键填满（取上限与CP剩余的较小值）">上限 '+money(bd.cap)+'</span>'+
          (bd.chs.length+bd.kacs.length?'<button class="chbtn" data-ch="'+h(key)+'" title="勾选渠道/KAC（已选 '+nCh+' 渠道'+(S.kacOn?' + '+nKac+' KAC':'')+'）">渠道 '+(nCh+nKac)+'/'+(bd.chs.length+bd.kacs.length)+'</button>':'')+'</div>'+
          (otherUsed>0?'<div class="wb-warn">另分'+wan(otherUsed)+'·先批区域自主</div>':'')+'</td>';
      }
    }
    html+='</tr>';
  }
  // 合计行
  html+='<tr style="background:#f8fafc;font-weight:700"><td class="fix">合计</td><td class="n">'+money(totPool)+'</td><td class="n">'+money(totAdd)+'</td><td class="n wb-rem '+(totRem<-0.5?'over':Math.abs(totRem)<1?'done':'')+'">'+money(totRem)+'</td>'+
    cols.map(c=>'<td class="n">'+money(colSums[c.id])+'</td>').join('')+'</tr>';
  html+='</tbody></table></div>';
  html+='<div class="note">批次指纹：'+h(D.batchKey||D.dataDate)+'（同一批三件套自动保留草稿；上传新三件套自动重新开始，客户列偏好保留）。</div>';
  el.innerHTML=html;

  // 事件绑定
  el.querySelectorAll('#wbType button').forEach(b=>b.onclick=()=>{S.wbType=b.dataset.v;renderWb()});
  el.querySelector('#wbAddCust').onchange=e=>{
    const code=e.target.value;if(!code)return;
    const c=ALL_CUSTS.find(x=>x.code===code);if(!c)return;
    WBP.cols.push({id:c.code,code:c.code,label:short(c.name),name:c.name,sub:''});
    saveWBP();renderWb();
  };
  el.querySelector('#wbAddSub').onclick=()=>{
    const baseCode=prompt('输入要拆子列的客户简称（如 东方）：','东方');
    if(!baseCode)return;
    const base=ALL_CUSTS.find(c=>c.name.includes(baseCode)||short(c.name).includes(baseCode));
    if(!base){toast('未找到匹配客户：'+baseCode);return}
    const sub=prompt('输入子列对账名（如 东方-嘉荣）：',short(base.name)+'-嘉荣');
    if(!sub||!sub.trim())return;
    const id=base.code+'__'+Date.now().toString(36);
    const idx=WBP.cols.findIndex(c=>c.code===base.code);
    const item={id,code:base.code,label:sub.trim(),name:base.name,sub:sub.trim()};
    if(idx>=0)WBP.cols.splice(idx+1,0,item);else WBP.cols.push(item);
    saveWBP();renderWb();
  };
  el.querySelector('#wbAddZero').onchange=e=>{
    const code=e.target.value;if(!code)return;
    if(!(WBD.extraCps||[]).includes(code)){(WBD.extraCps||=[]).push(code);saveWBD();renderWb()}
  };
  el.querySelectorAll('button[data-mv]').forEach(b=>b.onclick=()=>{
    const i=+b.dataset.mv,d=+b.dataset.d,j=i+d;
    if(j<0||j>=WBP.cols.length)return;
    const tmp=WBP.cols[i];WBP.cols[i]=WBP.cols[j];WBP.cols[j]=tmp;
    saveWBP();renderWb();
  });
  el.querySelectorAll('button[data-rm]').forEach(b=>b.onclick=()=>{
    WBP.cols=WBP.cols.filter(c=>c.id!==b.dataset.rm);saveWBP();renderWb();
  });
  el.querySelectorAll('.wb-ms button').forEach(b=>b.onclick=()=>{
    const cid=b.dataset.col,mm=b.dataset.mm;
    const curM=[...colMonths(cid)];
    const i=curM.indexOf(mm);
    if(i>=0){if(curM.length>1)curM.splice(i,1)}else curM.push(mm);
    curM.sort();WBD.months[cid]=curM;saveWBD();renderWb();
  });
  el.querySelectorAll('input[data-add]').forEach(inp=>inp.onchange=()=>{
    const v=Math.max(0,Number(inp.value)||0);
    if(v>0)WBD.add[inp.dataset.add]=v;else delete WBD.add[inp.dataset.add];
    saveWBD();renderWb();
  });
  el.querySelectorAll('input[data-alloc]').forEach(inp=>inp.onchange=()=>{
    const v=Math.max(0,Number(inp.value)||0);
    if(v>0)WBD.alloc[inp.dataset.alloc]=v;else delete WBD.alloc[inp.dataset.alloc];
    saveWBD();renderWb();
  });
  el.querySelectorAll('.fill[data-fill]').forEach(sp=>sp.onclick=()=>{
    const cap=+sp.dataset.cap||0,rem=+sp.dataset.rem||0;
    const best=Math.max(0,Math.floor(Math.min(cap,rem)/100)*100);
    if(best>0)WBD.alloc[sp.dataset.fill]=best;else delete WBD.alloc[sp.dataset.fill];
    saveWBD();renderWb();
  });
  el.querySelectorAll('.chbtn[data-ch]').forEach(b=>b.onclick=()=>openChModal(b.dataset.ch));
  el.querySelector('#wbExpCsv').onclick=exportWbCsv;
  el.querySelector('#wbExpJson').onclick=()=>{
    const blob=new Blob([JSON.stringify({batchKey:D.batchKey,prefs:WBP,draft:WBD},null,2)],{type:'application/json'});
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='费用分配草稿_'+D.dataDate+'.json';a.click();
  };
  el.querySelector('#wbImpJson').onclick=()=>el.querySelector('#wbJsonFile').click();
  el.querySelector('#wbJsonFile').onchange=async e=>{
    const f=e.target.files&&e.target.files[0];if(!f)return;
    try{
      const j=JSON.parse(await f.text());
      if(j.prefs&&j.prefs.cols){WBP.cols=j.prefs.cols;saveWBP()}
      if(j.draft){Object.assign(WBD,j.draft);saveWBD()}
      toast('已恢复草稿');renderWb();
    }catch(_){toast('草稿文件格式无效')}
  };
  el.querySelector('#wbReset').onclick=()=>{
    if(!confirm('确认清空本轮已填的分配金额与临时追加？'))return;
    WBD.alloc={};WBD.add={};WBD.extraCps=[];WBD.chSel={};saveWBD();renderWb();
  };
}

function openChModal(key){
  const [cpCode,colId]=key.split('|');
  const col=WBP.cols.find(c=>c.id===colId);
  const cp=(D.allCps||[]).find(c=>c.code===cpCode);
  if(!col||!cp)return;
  const bd=cellBreakdown(cpCode,col);
  const bg=document.getElementById('wbModal'),box=document.getElementById('wbModalIn');
  let html='<h3>'+h(col.label)+' · '+h(cp.code+' '+cp.desc)+'</h3><div class="sub">勾选月份：'+colMonths(col.id).map(mlabel).join('、')+'（低于 500 元默认不勾，可按需勾入凑整）</div>';
  if(bd.chs.length){
    html+='<div class="m-sec">常规渠道（合计 '+money(bd.capCh)+' 元）</div>';
    bd.chs.forEach(x=>{html+='<div class="m-row"><label><input type="checkbox" data-pid="'+h(x.id)+'"'+(x.checked?' checked':'')+'><span>'+h(x.label)+(x.fee<500?' <span class="sub">(碎渠道)</span>':'')+'</span></label><b>'+money(x.fee)+' 元</b></div>'});
  }
  if(S.kacOn&&bd.kacs.length){
    html+='<div class="m-sec">LKA/KAC 独立通道（按 '+Math.round(S.kacRate*100)+'% 折算，合计 '+money(bd.capKac)+' 元）</div>';
    bd.kacs.forEach(x=>{html+='<div class="m-row"><label><input type="checkbox" data-pid="'+h(x.id)+'"'+(x.checked?' checked':'')+'><span>'+h(x.label)+(x.fee<500?' <span class="sub">(<500)</span>':'')+'</span></label><b>'+money(x.fee)+' 元</b></div>'});
  }
  html+='<div class="bar" style="justify-content:flex-end;margin:12px 0 0"><button class="btn primary" id="mClose">完成</button></div>';
  box.innerHTML=html;bg.classList.add('on');
  box.querySelectorAll('input[data-pid]').forEach(cb=>cb.onchange=()=>{
    WBD.chSel[key]=WBD.chSel[key]||{};WBD.chSel[key][cb.dataset.pid]=cb.checked;saveWBD();renderWb();openChModal(key);
  });
  box.querySelector('#mClose').onclick=()=>bg.classList.remove('on');
  bg.onclick=e=>{if(e.target===bg)bg.classList.remove('on')};
}

function csvCell(v){const s=String(v??'').replace(/"/g,'""');return /[",\\n\\r]/.test(s)?'"'+s+'"':s}
function exportWbCsv(){
  const headers=['客户编码','客户名称','对账子列','CP号','活动名','BU','活动类型','资金来源','渠道','归属月份','拟分金额(元)','费率','对应需出货(元)','主推SKU','主推产品名','推荐产品组','需排除PL','活动日期','适用渠道(CP)','促销品牌(MG1)','活动机制','备注草稿'];
  const rows=[];
  const cps=D.allCps||[];
  for(const cp of cps){
    const addV=Number(WBD.add[cp.code])||0;
    const srcTag=cp.balance<D.minBalance?'预追加':addV>0?'实有+预追加':'实有预算';
    for(const col of WBP.cols){
      const key=cp.code+'|'+col.id;
      const amt=Number(WBD.alloc[key])||0;
      if(amt<=0)continue;
      if(!cp.isDiscount){
        rows.push([col.code,col.name,col.sub||'',cp.code,cp.desc,BU[cp.bu]||cp.bu,cp.type||'陈列/上市',srcTag,'',colMonths(col.id).map(mlabel).join('/'),amt,'','','','','','',cp.start+'~'+cp.end,cp.sub,cp.mg1,cp.mech,col.sub?'对账归属：'+col.sub:'']);
        continue;
      }
      const bd=cellBreakdown(cp.code,col);
      const selCh=bd.chs.filter(x=>x.checked);
      const selKac=bd.kacs.filter(x=>x.checked);
      const totCap=bd.cap||0;
      const parts=[];
      // 常规渠道按月拆行
      selCh.forEach(x=>{
        Object.entries(x.perM).forEach(([mm,f])=>{
          const share=totCap>0?f/totCap:0;
          const a=Math.round(amt*share);
          if(a<=0)return;
          const p=x.pool;
          const rt=mm<D.cur?((p.hist.find(z=>z.mm===mm)||{}).rate):(p.months[mm]&&p.months[mm].rate);
          const top=(p.recommend&&p.recommend[0]&&p.recommend[0].top)||{};
          const excl=[...(p.excl?p.excl.same:[]),...(p.excl?p.excl.other.map(z=>z[0]):[])];
          const note=(col.sub?'客户组/对账：'+col.sub+'；':'')+(mm<D.cur?'历史回溯月；':'')+(excl.length?'不得与以下PL重复：'+excl.join('、'):'');
          parts.push([col.code,col.name,col.sub||'',cp.code,cp.desc,BU[cp.bu]||cp.bu,'价格折扣',srcTag,x.channel,mm,a,rt!=null?pct(rt):'',rt?Math.round(a/rt):'',top.sku||'',top.name||'',(p.recommend||[]).slice(0,3).map(g=>g.group).join('、'),excl.join('、'),cp.start+'~'+cp.end,cp.sub,cp.mg1,cp.mech,note]);
        });
      });
      // LKA/KAC 通道：若全选了所有 >=500 的 KAC，合并为简洁 LKA Others；否则写具体客户组
      if(selKac.length){
        const allBigKac=bd.kacs.filter(x=>x.fee>=500);
        const isGeneric=allBigKac.length>0&&selKac.length===allBigKac.length&&allBigKac.every(x=>x.checked);
        const byM={};
        selKac.forEach(x=>Object.entries(x.perM).forEach(([mm,f])=>byM[mm]=(byM[mm]||0)+f));
        Object.entries(byM).forEach(([mm,f])=>{
          const a=Math.round(amt*(totCap>0?f/totCap:0));
          if(a<=0)return;
          const k0=selKac[0].kac;
          const rt=mm<D.cur?((k0.hist.find(z=>z.mm===mm)||{}).rate):(k0.months[mm]&&k0.months[mm].rate);
          const kacNote=isGeneric?'LKA聚合('+selKac.length+'个KAC·'+Math.round(S.kacRate*100)+'%)':'客户组：'+selKac.map(x=>x.kacName).join('、')+'（'+Math.round(S.kacRate*100)+'%）';
          parts.push([col.code,col.name,col.sub||'',cp.code,cp.desc,BU[cp.bu]||cp.bu,'价格折扣(LKA)',srcTag,'LKA Others',mm,a,rt!=null?pct(rt):'',rt?Math.round(a/rt):'',k0.topSku||'',k0.topSkuName||'',selKac.map(x=>x.kacName).join('、'),(k0.exclSame||[]).join('、'),cp.start+'~'+cp.end,cp.sub,cp.mg1,cp.mech,kacNote]);
        });
      }
      if(!parts.length){
        rows.push([col.code,col.name,col.sub||'',cp.code,cp.desc,BU[cp.bu]||cp.bu,'价格折扣',srcTag,'待定',colMonths(col.id).join('/'),amt,'','','','','','',cp.start+'~'+cp.end,cp.sub,cp.mg1,cp.mech,col.sub?'对账归属：'+col.sub:'']);
      }else rows.push(...parts);
    }
  }
  if(!rows.length){toast('还没有填写任何分配金额');return}
  const csv='\\uFEFF'+[headers,...rows].map(r=>r.map(csvCell).join(',')).join('\\r\\n');
  const blob=new Blob([csv],{type:'text/csv;charset=utf-8'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='费用分配包_AI填表_'+D.dataDate+'.csv';a.click();
  toast('已导出 '+rows.length+' 条分配明细');
}

function render(){cpOpts();document.getElementById("redN").textContent=D.open.filter(o=>o.level==="risk"&&match(o,planText(o))).length||"";
  const showSc=S.tab==="cap"||S.tab==="wb";
  document.getElementById("fSc").style.visibility=showSc?"visible":"hidden";document.getElementById("scLbl").style.visibility=showSc?"visible":"hidden";
  document.getElementById("kacBox").style.display=showSc&&(D.kacPools||[]).length?"inline-flex":"none";
  if(S.tab==="wb")renderWb();else if(S.tab==="cap")renderCap();else if(S.tab==="flt")renderFlt();else renderChk()}
document.querySelectorAll(".tab").forEach(t=>t.onclick=()=>{document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("on",x===t));S.tab=t.dataset.t;["wb","cap","flt","chk"].forEach(k=>document.getElementById("v-"+k).style.display=k===S.tab?"":"none");render()});
document.getElementById("kacOn").onchange=e=>{S.kacOn=e.target.checked;document.getElementById("kacBox").classList.toggle("on",S.kacOn);document.getElementById("kacCtrl").style.display=S.kacOn?"inline":"none";render()};
document.querySelectorAll("#kacCtrl button[data-kr]").forEach(b=>b.onclick=()=>{const v=+b.dataset.kr;S.kacRate=v/100;document.getElementById("kacPct").value=v;render()});
document.getElementById("kacPct").onchange=e=>{const v=Math.min(100,Math.max(1,Number(e.target.value)||30));e.target.value=v;S.kacRate=v/100;render()};
document.getElementById("fCust").onchange=e=>{S.cust=e.target.value;render()};
document.getElementById("fCP").onchange=e=>{S.cp=e.target.value;render()};
document.getElementById("fQ").oninput=e=>{S.q=e.target.value.trim();render()};
document.querySelectorAll("#fBU button").forEach(b=>b.onclick=()=>{document.querySelectorAll("#fBU button").forEach(x=>x.classList.toggle("on",x===b));S.bu=b.dataset.v;render()});
document.querySelectorAll("#fSc button").forEach(b=>b.onclick=()=>{document.querySelectorAll("#fSc button").forEach(x=>x.classList.toggle("on",x===b));S.sc=+b.dataset.v;render()});
document.getElementById("exp").onclick=async()=>{
  const M=[D.cur,D.m1,D.m2];
  const cap=D.pools.filter(p=>p.plannable&&match(p,poolText(p))).map(p=>{const o={"客户":p.name,"客户编码":p.code,"BU":BU[p.bu]||p.bu,"CP":p.cp,"活动":p.cpDesc,"渠道":p.channel,"机制桶":p.bucket,"产品范围":p.scope,"池平均费率(按出货加权,非单品上限)":p.months[D.cur].rate,"本池单品费率区间":rng(p.px.map(a=>a[2])),"SKURate区间(折扣率上限表)":rng(p.px.map(a=>a[3]??-1)),"CP余额":Math.round(p.cpBalance),"备注排除PL_同活动":(p.excl?p.excl.same:[]).join("、"),"备注排除PL_其他活动产品重叠":(p.excl?p.excl.other.map(x=>x[0]+"("+x[1]+")"):[]).join("、")};
    D.scenarios.forEach((s,j)=>{M.forEach(m=>o[mlabel(m)+"可做_"+s.label]=Math.round(feeOf(p,m,j)));o["本季度合计_"+s.label]=Math.round(rowQ(p,j))});
    o["建议分配_基准"]=allocMap(1).get(p.id)||0;if(pfOn())o["选中产品占比"]=+share(p).toFixed(4);o["推荐产品组"]=(p.recommend||[]).map(g=>g.group+"("+Math.round(g.fee)+")").join("、");M.forEach(m=>{o[mlabel(m)+"已排计划出货"]=Math.round(p.months[m].occ);o[mlabel(m)+"已扣其他CP"]=Math.round(p.months[m].wall||0)});o["近3月均值"]=Math.round(p.forecast.base);o["本月已发生"]=Math.round(p.forecast.mtd);return o});
  const flt=D.open.filter(o=>match(o,planText(o))).map(o=>({"状态":LV[o.level][0],"客户":o.name,"客户编码":o.code,"PL":o.pl,"CP":o.cp,"活动":o.cpDesc,"渠道":o.channel,"开始":o.start,"结束":o.end,"备注日期":o.remarkDates?"是":"","计划费率":o.rate,"计划进货":Math.round(o.need),"池内净出货":Math.round(o.gross),"被点数更高计划先用的货":Math.round(o.peerDone),"同活动计划数":o.packN||1,"点数排第":o.packRank||1,"本计划可用净出货":Math.round(o.avail),"覆盖率":o.need?+(o.avail/o.need).toFixed(4):0,"还需出货":Math.round(o.shortNow),"截止":o.deadline,"剩余天数":o.closed?0:daysLeft(o),"按趋势到截止仍差":Math.round(o.shortFinal),"池内退货":Math.round(o.returns),"计划费用":Math.round(o.budget),"已核销":Math.round(o.verified),"预计少核":Math.round(o.lossFee),"建议":(closeAdvice(o)||{}).text||"","余量出货":Math.round(o.surplus||0),"取数范围":o.scopeNote,"计划备注":o.remarks}));
  const ret=[];D.open.filter(o=>match(o,planText(o))).forEach(o=>o.returnSkus.forEach(r=>ret.push({"客户":o.name,"PL":o.pl,"活动":o.cpDesc,"渠道":o.channel,"SKU":r.sku,"产品":r.name,"退货净额":Math.round(r.v)})));
  const hist=[];D.pools.filter(p=>p.plannable&&match(p,poolText(p))).forEach(p=>p.hist.forEach(x=>hist.push({"客户":p.name,"CP":p.cp,"活动":p.cpDesc,"渠道":p.channel,"月份":x.mm,"净出货":Math.round(x.actual),"其中退货":Math.round(x.neg),"已排计划":Math.round(x.occ),"剩余":Math.round(x.rem),"可回溯费用":x.fee==null?null:Math.round(x.fee)})));
  const note=D.checks.map(c=>({"类型":c.level==="warn"?"注意":"说明","内容":c.text}));
  // 产品明细：每个池下每个 SKU 的近 4 个月出货、费率、占这个池能做费用的比例（选了产品就只导出选中的）
  const AL1=allocMap(1);const prod=[];
  D.pools.filter(p=>p.plannable&&match(p,poolText(p))).forEach(p=>{const tot=p.px.reduce((x,a)=>x+Math.max(0,a[1])*a[2],0);const q=rowQ(p,1),al=AL1.get(p.id)||0;
    p.px.forEach(([i,so,rt,skr])=>{if(pfOn()&&!pfHit(i))return;const m=PM[i];const sh=tot>0?Math.max(0,so)*rt/tot:0;
      prod.push({"客户":p.name,"客户编码":p.code,"BU":BU[p.bu]||p.bu,"CP":p.cp,"活动":p.cpDesc,"渠道":p.channel,"Brand":m[2],"S1":m[3],"S2":m[4],"S3":m[5],"SKU":m[0],"产品":m[1],"近4个月净出货":Math.round(so),"SKURate(折扣率上限表)":skr==null||skr<0?"":skr,"本池计算费率":rt,"占这个池能做费用":+sh.toFixed(4),"本季度能做_基准":Math.round(q*sh),"建议做_基准(按占比)":Math.round(al*sh)})})});
  const box=document.createElement("div");box.innerHTML=helpCap()+helpFlt();
  const rules=[...box.querySelectorAll("li")].map((li,k)=>({"序号":k+1,"规则":li.textContent})).concat(D.checks.filter(c=>c.level==="info").map(c=>({"序号":"","规则":c.text})));
  const res=await fetch("/v10/export",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({cap,flt,ret,hist,note,prod,rules,cur:D.cur})});
  if(!res.ok){toast("导出失败："+res.status);return}
  const b=await res.blob();const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download="费用规划_"+D.dataDate+".xlsx";a.click();
};
render();
</script></body></html>`;
}
