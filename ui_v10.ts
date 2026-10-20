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
.toast{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#16202e;color:#fff;padding:8px 16px;border-radius:8px;font-size:13px;opacity:0;transition:.2s;pointer-events:none}
.toast.on{opacity:1}
.upl{max-width:720px;margin:28px auto;background:#fff;border:1px solid var(--line);border-radius:14px;padding:22px}
.upl h2{margin:0 0 4px}.upl .f{display:grid;grid-template-columns:140px 1fr;gap:10px;align-items:center;margin:12px 0}
.upl input[type=file]{padding:8px;border:1px dashed #c6cfdd;border-radius:9px;width:100%;background:#fafbfd}
.upl input[type=date],.upl input[type=number]{padding:7px 9px;border:1px solid var(--line);border-radius:8px}
.loading{display:none;position:fixed;inset:0;background:rgba(255,255,255,.85);z-index:50;align-items:center;justify-content:center;flex-direction:column;gap:8px;font-weight:600}
.loading.on{display:flex}.spin{width:34px;height:34px;border:3px solid var(--brand-soft);border-top-color:var(--brand);border-radius:50%;animation:s 1s linear infinite}@keyframes s{to{transform:rotate(360deg)}}
@media (max-width:760px){.hide-m{display:none}.kpis{grid-template-columns:1fr 1fr}.kpi .v{font-size:18px}.upl .f{grid-template-columns:1fr}}
`;

export function uploadPage(defaultDate: string, message = "") {
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>费用规划助手</title><style>${CSS}</style></head><body>
<div class="top"><div class="in"><h1>费用规划助手 v10</h1><span class="meta">预测能做多少费用 · 督促出货 · 预警核销落差</span><span class="sp"></span><a class="btn" href="/legacy">旧版</a><a class="btn" href="/logout">退出</a></div></div>
<form class="upl" action="/v10/analyze" method="post" enctype="multipart/form-data" onsubmit="document.getElementById('ld').classList.add('on')">
<h2>上传三份文件</h2><div class="sub">BI（含 BI-SO(折扣)、BI-Stock、产品目录、SKURate）、TTS 计划大表、CP 预算。文件只用于本次计算，不保存。</div>
${message ? `<div class="chip risk" style="margin-top:10px">${esc(message)}</div>` : ""}
<div class="f"><label>BI 文件</label><input type="file" name="bi" accept=".xlsx,.xlsm" required></div>
<div class="f"><label>TTS 计划</label><input type="file" name="tts" accept=".xlsx,.xlsm" required></div>
<div class="f"><label>CP 预算</label><input type="file" name="cp" accept=".xlsx,.xlsm" required></div>
<div class="f"><label>BI 数据截至</label><div><input type="date" name="dataDate" value="${esc(defaultDate)}" required> <span class="sub">BI 里本月出货统计到哪一天（用于本月剩余天数的预测）</span></div></div>
<div class="f"><label>CP 最低余额</label><div><input type="number" name="minBalance" value="100" min="0" step="100"> <span class="sub">元，余额低于此值的 CP 不进入"能做多少费用"</span></div></div>
<button class="btn primary" type="submit" style="width:100%;padding:10px;margin-top:6px">开始计算</button>
</form>
<div class="loading" id="ld"><div class="spin"></div><div>正在计算，约 30–60 秒…</div></div>
</body></html>`;
}

export function resultPage(data: unknown) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c").replace(new RegExp("\\u2028", "g"), "\\u2028").replace(new RegExp("\\u2029", "g"), "\\u2029");
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>费用规划助手 · 结果</title><style>${CSS}</style></head><body>
<div class="top"><div class="in"><h1>费用规划助手 v10</h1><span class="meta" id="meta"></span><span class="sp"></span>
<button class="btn" id="exp">导出 Excel</button><a class="btn" href="/workspace">重新上传</a><a class="btn" href="/legacy">旧版</a></div></div>
<div class="wrap">
<div class="tabs"><div class="tab on" data-t="cap">能做多少费用</div><div class="tab" data-t="flt">在途计划 · 督促出货<span class="n" id="redN"></span></div><div class="tab" data-t="chk">数据说明</div></div>
<div class="bar">
<select id="fCust"><option value="">全部客户</option></select>
<div class="seg" id="fBU"><button data-v="" class="on">全部</button><button data-v="dairy">奶品</button><button data-v="coffee">咖啡</button><button data-v="confectionery">糖果</button></div>
<input type="search" id="fQ" placeholder="搜索 CP / 活动 / PL / 产品" style="min-width:220px">
<span class="sp" style="flex:1"></span>
<span class="sub" id="scLbl">预估档位</span><div class="seg" id="fSc"><button data-v="0">保守 85%</button><button data-v="1" class="on">基准 100%</button><button data-v="2">乐观 120%</button></div>
</div>
<div id="v-cap"></div><div id="v-flt" style="display:none"></div><div id="v-chk" style="display:none"></div>
</div>
<div class="toast" id="toast"></div>
<script>
const D=${json};
const S={cust:"",bu:"",q:"",sc:1,tab:"cap",lv:"",thr:500,open:new Set()};
const fmt=new Intl.NumberFormat("zh-CN",{maximumFractionDigits:0});
const money=v=>{const r=Math.round(Number(v)||0);return fmt.format(r===0?0:r)};
const wan=v=>{v=Number(v)||0;return Math.abs(v)>=10000?(v/10000).toFixed(1)+"万":money(v)};
const cls=v=>v<-0.5?"neg":Math.abs(v)<0.5?"zero":"";
const h=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const mlabel=mm=>(+mm.slice(4))+"月";
const pct=v=>{const x=Math.round(v*1000)/10;return (x%1?x.toFixed(1):String(x))+"%"};
const BU={dairy:"奶品",coffee:"咖啡",confectionery:"糖果"};
const LV={lost:["已无法补","lost"],risk:["预警","risk"],follow:["需跟进","follow"],ok:["已覆盖","ok"],nodata:["BI无数据","nodata"]};
const qMonths=[D.cur,D.m1,D.m2].filter(m=>m<=D.qEnd), nMonths=[D.cur,D.m1,D.m2].filter(m=>m>D.qEnd);
document.getElementById("meta").textContent="本月 "+mlabel(D.cur)+" · BI 截至 "+D.dataDate+" · 本季度到 "+mlabel(D.qEnd);
const custs=[...new Map([...D.pools,...D.open].map(x=>[x.name,x.name])).keys()].sort((a,b)=>a.localeCompare(b,"zh-CN"));
document.getElementById("fCust").insertAdjacentHTML("beforeend",custs.map(c=>'<option>'+h(c)+'</option>').join(""));
function toast(t){const e=document.getElementById("toast");e.textContent=t;e.classList.add("on");setTimeout(()=>e.classList.remove("on"),1600)}
function match(x,text){if(S.cust&&x.name!==S.cust)return false;if(S.bu&&x.bu&&x.bu!==S.bu)return false;if(S.q){const q=S.q.toLowerCase();if(!text.toLowerCase().includes(q))return false}return true}
function poolText(p){return [p.name,p.code,p.cp,p.cpDesc,p.channel,p.bucket,...p.skuRows.map(r=>r.name+" "+r.sku)].join(" ")}
function planText(o){return [o.name,o.code,o.pl,o.cp,o.cpDesc,o.channel,o.skuName,o.sku].join(" ")}
function poolBU(p){return p.bu}
D.open.forEach(o=>{const p=D.pools.find(x=>x.cp===o.cp);o.bu=p?p.bu:(o.cp.startsWith("DA")?"dairy":o.cp.startsWith("CO")?"coffee":o.cp.startsWith("CF")?"confectionery":"")});
function feeOf(p,mm,i){const c=p.months[mm];return c?c.fee[i]:0}
function rowQ(p,i){return qMonths.reduce((s,m)=>s+feeOf(p,m,i),0)}
function rowN(p,i){return nMonths.reduce((s,m)=>s+feeOf(p,m,i),0)}
// 同一 CP 的余额在全部客户之间共用：合计时按 CP 封顶
function capped(ps,i){const by=new Map();ps.forEach(p=>{const x=by.get(p.cp)||{v:0,b:p.cpBalance};x.v+=rowQ(p,i);by.set(p.cp,x)});let t=0;by.forEach(x=>t+=Math.min(x.v,Math.max(0,x.b)));return t}

// ───────── 能做多少费用 ─────────
function renderCap(){
  const el=document.getElementById("v-cap");const i=S.sc;
  let rows=D.pools.filter(p=>match(p,poolText(p)));
  const all=rows.length;
  rows=rows.filter(p=>rowQ(p,1)+rowN(p,1)>=S.thr||p.months[D.cur].gap[1]<-0.5);
  const sum=k=>rows.reduce((s,p)=>s+k(p),0);
  const k3=[0,1,2].map(j=>capped(rows,j)), raw3=[0,1,2].map(j=>sum(p=>rowQ(p,j)));
  const over=rows.filter(p=>p.months[D.cur].gap[1]<-0.5);
  let html='<div class="kpis">'+
   '<div class="kpi"><div class="l">本季度还能做的费用（到'+mlabel(D.qEnd)+'，已按 CP 余额封顶）</div><div class="v">'+wan(k3[i])+'</div><div class="s">保守 '+wan(k3[0])+' · 基准 '+wan(k3[1])+' · 乐观 '+wan(k3[2])+'</div></div>'+
   '<div class="kpi"><div class="l">本季度出货承载空间（未封顶）</div><div class="v">'+wan(raw3[i])+'</div><div class="s">保守 '+wan(raw3[0])+' · 乐观 '+wan(raw3[2])+'；超出余额部分需要新预算</div></div>'+
   [D.cur,D.m1,D.m2].map(m=>'<div class="kpi"><div class="l">'+mlabel(m)+(m>D.qEnd?'（下季度）':m===D.cur?'（本月，含已发生）':'')+'</div><div class="v">'+wan(sum(p=>feeOf(p,m,i)))+'</div><div class="s">保守 '+wan(sum(p=>feeOf(p,m,0)))+' · 乐观 '+wan(sum(p=>feeOf(p,m,2)))+'</div></div>').join("")+
   (over.length?'<div class="kpi red"><div class="l">本月已排计划超出预计出货</div><div class="v">'+over.length+' 个</div><div class="s">合计超 '+wan(-over.reduce((s,p)=>s+p.months[D.cur].gap[1],0))+' 出货额</div></div>':'')+
   '</div>';
  html+='<div class="bar" style="margin-top:-4px"><span class="sub">显示可做费用 ≥</span><input type="number" id="thr" value="'+S.thr+'" step="100" min="0" style="width:90px"><span class="sub">元的 '+rows.length+' / '+all+' 个核销池（客户 × CP × 渠道）。点任意一行看预估依据、产品明细和历史回溯。</span></div>';
  const by=new Map();rows.forEach(p=>{const k=p.name;if(!by.has(k))by.set(k,[]);by.get(k).push(p)});
  const groups=[...by.entries()].sort((a,b)=>b[1].reduce((s,p)=>s+rowQ(p,i),0)-a[1].reduce((s,p)=>s+rowQ(p,i),0));
  if(!groups.length)html+='<div class="card"><div class="empty">当前筛选下没有可做费用的核销池</div></div>';
  for(const [name,ps] of groups){
    ps.sort((a,b)=>rowQ(b,i)-rowQ(a,i));
    const tq=ps.reduce((s,p)=>s+rowQ(p,i),0);
    html+='<div class="card"><div class="grp"><span class="t">'+h(name)+'</span><span class="code">'+h([...new Set(ps.map(p=>p.code))].join(" / "))+'</span><span class="sp"></span><span class="sum">本季度承载 '+money(tq)+' · 按余额可做 <b>'+money(capped(ps,i))+'</b> 元</span></div>';
    html+='<table><thead><tr><th>活动</th><th>渠道</th><th class="n hide-m">费率</th>'+[D.cur,D.m1,D.m2].map(m=>'<th class="n">'+mlabel(m)+(m>D.qEnd?'<span class="sub">·下季</span>':'')+'</th>').join("")+'<th class="n">本季度承载</th><th class="n">CP余额</th></tr></thead><tbody>';
    for(const p of ps){
      const c=p.months[D.cur];const g=c.gap[i];
      html+='<tr class="row" data-id="'+h(p.id)+'"><td><div>'+h(p.cpDesc)+(p.bucket?' <span class="chip nodata">'+h(p.bucket)+'</span>':'')+(g<-0.5?' <span class="chip risk">本月已超 '+money(-g)+'</span>':'')+'</div><div class="sub">'+h(p.cp)+' · '+h(p.scope)+'</div></td><td>'+h(p.channel)+'</td><td class="n hide-m">'+(c.rate==null?'<span class="neg">待定</span>':pct(c.rate))+'</td>'+
       [D.cur,D.m1,D.m2].map(m=>{const v=feeOf(p,m,i);return '<td class="n '+(p.months[m].inCP?cls(v):'zero')+'">'+(p.months[m].inCP?money(v):'<span class="sub">CP已结束</span>')+'</td>'}).join("")+
       '<td class="n"><b>'+money(rowQ(p,i))+'</b><div class="sub">'+money(rowQ(p,0))+' – '+money(rowQ(p,2))+'</div></td><td class="n">'+money(p.cpBalance)+(rowQ(p,i)>p.cpBalance+0.5?'<div class="sub neg">余额不够</div>':'')+'</td></tr>';
      if(S.open.has(p.id))html+='<tr class="detail"><td colspan="9">'+capDetail(p)+'</td></tr>';
    }
    html+='</tbody></table></div>';
  }
  html+='<div class="note">月份列和"本季度承载"是按出货测算的费用空间；CP 余额由全部客户共用，上方"还能做的费用"已按每个 CP 的余额封顶。</div>';
  el.innerHTML=html;
  const t=document.getElementById("thr");t.onchange=()=>{S.thr=Math.max(0,+t.value||0);renderCap()};
  el.querySelectorAll("tr.row").forEach(r=>r.onclick=()=>{const id=r.dataset.id;S.open.has(id)?S.open.delete(id):S.open.add(id);renderCap()});
}
function capDetail(p){
  const M=[D.cur,D.m1,D.m2];const f=p.forecast;
  let a='<div class="dgrid"><div class="dbox"><h4>三档预估（元）</h4><table><thead><tr><th>档位</th>'+M.map(m=>'<th class="n">'+mlabel(m)+'</th>').join("")+'</tr></thead><tbody>';
  D.scenarios.forEach((s,j)=>{a+='<tr><td><b>'+h(s.label)+'</b><div class="sub">预计出货 / 已排计划 / 可做费用</div></td>'+M.map(m=>{const c=p.months[m];return '<td class="n">'+money(c.so[j])+'<div class="sub">− '+money(c.occ)+'</div><b class="'+cls(c.fee[j])+'">'+money(c.fee[j])+'</b></td>'}).join("")+'</tr>'});
  a+='</tbody></table><div class="note">本月 = 已发生 '+money(f.mtd)+' + 剩余 '+D.remainDays+' 天预测 '+money(f.remain)+'（档位只乘在预测部分）。下月/下下月 = 近3个完整月均值 '+money(f.base)+' × 季节系数 '+f.s1.toFixed(2)+' / '+f.s2.toFixed(2)+'。</div></div>';
  a+='<div class="dbox"><h4>预估依据</h4><table><tbody><tr><td>近 3 个完整月净出货</td><td class="n">'+f.last3.slice().reverse().map(money).join(' / ')+'</td></tr><tr><td>去年同期（'+M.map(mlabel).join('/')+'）</td><td class="n">'+f.ly.map(money).join(' / ')+'</td></tr><tr><td>池内库存（估）</td><td class="n">'+money(f.stock)+'</td></tr>'+(p.timedNote?'<tr><td>机制排除</td><td>'+h(p.timedNote)+'</td></tr>':'')+'<tr><td>同池已排计划</td><td class="n">'+p.plans.length+' 条</td></tr></tbody></table></div></div>';
  a+='<div class="dbox" style="margin-top:12px"><h4>产品明细（净出货，含退货）</h4><table><thead><tr><th>SKU</th><th class="hide-m">层级</th>'+p.recentMonths.map(m=>'<th class="n">'+mlabel(m)+'</th>').join("")+'</tr></thead><tbody>'+
   p.skuRows.map(r=>'<tr><td>'+h(r.name)+'<div class="sub">'+h(r.sku)+'</div></td><td class="hide-m sub">'+h([r.brand,r.s1,r.s2].filter(Boolean).join(' · '))+'</td>'+r.v.map(v=>'<td class="n '+cls(v)+'">'+money(v)+'</td>').join("")+'</tr>').join("")+'</tbody></table></div>';
  if(p.hist.length){a+='<details><summary>历史回溯（'+p.hist.length+' 个月，仅供参考）</summary><table><thead><tr><th>月份</th><th class="n">净出货</th><th class="n">其中退货</th><th class="n">已排计划</th><th class="n">剩余</th><th class="n">可回溯费用</th></tr></thead><tbody>'+
   p.hist.slice().reverse().map(x=>'<tr><td>'+mlabel(x.mm)+' <span class="sub">'+x.mm.slice(0,4)+'</span></td><td class="n '+cls(x.actual)+'">'+money(x.actual)+'</td><td class="n '+cls(x.neg)+'">'+money(x.neg)+'</td><td class="n">'+money(x.occ)+'</td><td class="n '+cls(x.rem)+'">'+money(x.rem)+'</td><td class="n">'+(x.fee==null?'-':money(x.fee))+'</td></tr>').join("")+'</tbody></table></details>'}
  return a;
}

// ───────── 在途计划 · 督促出货 ─────────
function renderFlt(){
  const el=document.getElementById("v-flt");
  let rows=D.open.filter(o=>match(o,planText(o)));
  const cnt={};rows.forEach(o=>cnt[o.level]=(cnt[o.level]||0)+1);
  const shown=S.lv?rows.filter(o=>o.level===S.lv):rows;
  const live=rows.filter(o=>!o.closed&&o.level!=="nodata");
  const sum=(a,k)=>a.reduce((s,o)=>s+k(o),0);
  let html='<div class="kpis">'+
   '<div class="kpi"><div class="l">在途未核销计划</div><div class="v">'+rows.length+' 条</div><div class="s">计划进货 '+wan(sum(rows,o=>o.need))+' · 费用 '+wan(sum(rows,o=>o.budget-o.verified))+'</div></div>'+
   '<div class="kpi amber"><div class="l">还能补出货的计划还需出货</div><div class="v">'+wan(sum(live,o=>o.shortNow))+'</div><div class="s">'+live.filter(o=>o.shortNow>0.5).length+' 条 · 按趋势月底仍差 '+wan(sum(live,o=>o.shortFinal))+'</div></div>'+
   '<div class="kpi red"><div class="l">预计少核费用</div><div class="v">'+wan(sum(rows.filter(o=>o.level!=="nodata"),o=>o.lossFee))+'</div><div class="s">其中已过期无法补 '+wan(sum(rows.filter(o=>o.level==="lost"),o=>o.lossFee))+'</div></div>'+
   '<div class="kpi"><div class="l">池内退货（冲减核销）</div><div class="v neg">'+wan(sum(rows,o=>o.returns))+'</div><div class="s">退货直接从核销池里扣</div></div></div>';
  html+='<div class="bar"><div class="seg" id="fLv"><button data-v="" class="'+(S.lv?'':'on')+'">全部 '+rows.length+'</button>'+["lost","risk","follow","ok","nodata"].filter(k=>cnt[k]).map(k=>'<button data-v="'+k+'" class="'+(S.lv===k?'on':'')+'">'+LV[k][0]+' '+cnt[k]+'</button>').join("")+'</div><span class="sub">已过期 = 计划月份已结束，缺口无法再补；预警 = 按当前趋势到月底仍不够；需跟进 = 还差但趋势能补上。</span></div>';
  const by=new Map();shown.forEach(o=>{if(!by.has(o.name))by.set(o.name,[]);by.get(o.name).push(o)});
  const order={lost:0,risk:1,follow:2,ok:3,nodata:4};
  const groups=[...by.entries()].sort((a,b)=>sum(b[1],o=>o.lossFee+o.shortNow/100)-sum(a[1],o=>o.lossFee+o.shortNow/100));
  if(!groups.length)html+='<div class="card"><div class="empty">当前筛选下没有在途计划</div></div>';
  for(const [name,os] of groups){
    os.sort((a,b)=>order[a.level]-order[b.level]||b.lossFee-a.lossFee);
    const need=os.filter(o=>o.shortNow>0.5&&!o.closed&&o.level!=="nodata");
    html+='<div class="card"><div class="grp"><span class="t">'+h(name)+'</span><span class="code">'+h(os[0].code)+'</span><span class="sp"></span><span class="sum">还需出货 <b>'+money(sum(need,o=>o.shortNow))+'</b> · 预计少核 <b class="neg">'+money(sum(os.filter(o=>o.level!=="nodata"),o=>o.lossFee))+'</b></span><button class="btn copy" data-c="'+h(name)+'">复制催货消息</button></div>';
    html+='<table><thead><tr><th>状态</th><th>计划</th><th class="hide-m">渠道 · 期间</th><th class="n">计划进货</th><th class="n">已出净额</th><th class="n">还需出货</th><th class="n hide-m">池内退货</th><th class="n">预计少核</th></tr></thead><tbody>';
    for(const o of os){
      const r=o.need>0?Math.max(0,Math.min(1,o.avail/o.need)):0;
      html+='<tr class="row" data-id="'+h(o.pl)+'"><td><span class="chip '+LV[o.level][1]+'">'+LV[o.level][0]+'</span></td><td><div>'+h(o.cpDesc)+'</div><div class="sub">'+h(o.pl)+' · '+pct(o.rate)+'</div></td><td class="hide-m">'+h(o.channel)+'<div class="sub">'+o.start.slice(5)+' ~ '+o.end.slice(5)+(o.remarkDates?'（备注日期）':'')+'</div></td>'+
       '<td class="n">'+money(o.need)+'</td><td class="n">'+money(o.avail)+'<div class="cov '+(r>=1?'':r>=0.8?'mid':'bad')+'"><i style="width:'+(r*100).toFixed(0)+'%"></i></div><div class="sub">'+(r*100).toFixed(0)+'%</div></td>'+
       '<td class="n '+(o.shortNow>0.5?(o.closed?'neg':''):'zero')+'"><b>'+money(o.shortNow)+'</b>'+(!o.closed&&o.shortNow>0.5?'<div class="sub">月底预计差 '+money(o.shortFinal)+'</div>':'')+'</td><td class="n hide-m '+cls(o.returns)+'">'+money(o.returns)+'</td><td class="n '+cls(-o.lossFee)+'">'+money(o.lossFee)+'</td></tr>';
      if(S.open.has(o.pl))html+='<tr class="detail"><td colspan="8">'+fltDetail(o)+'</td></tr>';
    }
    html+='</tbody></table></div>';
  }
  el.innerHTML=html;
  el.querySelectorAll("#fLv button").forEach(b=>b.onclick=()=>{S.lv=b.dataset.v;renderFlt()});
  el.querySelectorAll("tr.row").forEach(r=>r.onclick=()=>{const id=r.dataset.id;S.open.has(id)?S.open.delete(id):S.open.add(id);renderFlt()});
  el.querySelectorAll("button.copy").forEach(b=>b.onclick=e=>{e.stopPropagation();copyMsg(b.dataset.c)});
}
function fltDetail(o){
  let a='<div class="dgrid"><div class="dbox"><h4>核销池怎么算的</h4><table><tbody>'+
   '<tr><td>取数范围</td><td>'+h(o.channel)+' 渠道（BI：'+h(o.chans.join('+'))+'）· '+h(o.scopeNote)+' · '+o.scopeSize+' 个 SKU</td></tr>'+
   '<tr><td>计划月份</td><td>'+o.months.map(mlabel).join('、')+'</td></tr>'+
   '<tr><td>池内净出货（正负合计）</td><td class="n">'+money(o.gross)+'</td></tr>'+
   (o.peerDone?'<tr><td>减：同池已核销/指定排除的计划</td><td class="n neg">− '+money(o.peerDone)+'</td></tr>':'')+
   (o.sharedWith?'<tr><td>与同池其他在途计划按金额分摊</td><td class="n">'+o.sharedWith+' 处</td></tr>':'')+
   '<tr><td>本计划可用净出货</td><td class="n"><b>'+money(o.avail)+'</b></td></tr>'+
   (!o.closed?'<tr><td>剩余天数预计还能出</td><td class="n">'+money(o.fcst)+'</td></tr>':'')+
   '<tr><td>计划费用 / 已核销</td><td class="n">'+money(o.budget)+' / '+money(o.verified)+'</td></tr>'+
   '</tbody></table>'+(o.remarks?'<div class="note">计划备注：'+h(o.remarks)+'</div>':'')+'</div>';
  a+='<div class="dbox"><h4>拉低核销的退货 SKU</h4>'+(o.returnSkus.length?'<table><tbody>'+o.returnSkus.map(r=>'<tr><td>'+h(r.name)+'<div class="sub">'+h(r.sku)+'</div></td><td class="n neg">'+money(r.v)+'</td></tr>').join("")+'</tbody></table>':'<div class="sub">计划月份内池里没有退货</div>')+'</div></div>';
  return a;
}
function copyMsg(name){
  const os=D.open.filter(o=>o.name===name&&o.level!=="ok"&&o.level!=="nodata");
  if(!os.length){toast("这个客户没有需要催的计划");return}
  const live=os.filter(o=>!o.closed),dead=os.filter(o=>o.closed);
  let t='【核销提醒】'+name+'（BI 截至 '+D.dataDate+'）\\n';
  live.forEach((o,k)=>{t+=(k+1)+'. '+o.cpDesc+'｜'+o.channel+'｜'+o.start.slice(5)+'~'+o.end.slice(5)+'：计划进货 '+wan(o.need)+'，目前净出货 '+wan(o.avail)+'，还需出货 '+wan(o.shortNow)+(o.returns<-0.5?'；退货 '+wan(-o.returns)+(o.returnSkus[0]?'（主要：'+o.returnSkus.slice(0,2).map(r=>r.name.replace(/^雀巢/,'').slice(0,14)).join('、')+'）':''):'')+'\\n'});
  if(dead.length){t+='已过期、无法再补（共预计少核 '+money(dead.reduce((x,o)=>x+o.lossFee,0))+' 元）：\\n'+dead.map(o=>'· '+o.cpDesc+'｜'+o.channel+'｜'+o.start.slice(5)+'~'+o.end.slice(5)+'：差 '+wan(o.shortNow)+' 出货，少核 '+money(o.lossFee)+' 元').join('\\n')+'\\n'}
  t+='提醒：财务按计划渠道 + 产品组整体取数，退货会直接冲减核销，请尽快安排出货、控制退货。';
  navigator.clipboard?navigator.clipboard.writeText(t).then(()=>toast("已复制，可直接粘贴到微信"),()=>prompt("复制以下内容",t)):prompt("复制以下内容",t);
}
// ───────── 数据说明 ─────────
function renderChk(){
  document.getElementById("v-chk").innerHTML='<div class="card" style="padding:14px 18px"><h3 style="margin:0 0 8px">数据检查与口径</h3><ul class="checks">'+D.checks.map(c=>'<li class="'+c.level+'">'+(c.level==="warn"?"⚠️ ":"")+h(c.text)+'</li>').join("")+'</ul>'+
  '<div class="sub">文件概况：BI-SO '+D.files.soRows+' 行（月份 '+D.files.months[0]+'–'+D.files.months[D.files.months.length-1]+'）· TTS 计划 '+D.files.plans+' 条 · CP '+D.files.cps+' 个 · 生成于 '+new Date(D.generatedAt).toLocaleString("zh-CN")+'</div></div>';
}
function render(){document.getElementById("redN").textContent=D.open.filter(o=>(o.level==="lost"||o.level==="risk")&&match(o,planText(o))).length||"";
  document.getElementById("fSc").style.visibility=S.tab==="cap"?"visible":"hidden";document.getElementById("scLbl").style.visibility=S.tab==="cap"?"visible":"hidden";
  if(S.tab==="cap")renderCap();else if(S.tab==="flt")renderFlt();else renderChk()}
document.querySelectorAll(".tab").forEach(t=>t.onclick=()=>{document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("on",x===t));S.tab=t.dataset.t;["cap","flt","chk"].forEach(k=>document.getElementById("v-"+k).style.display=k===S.tab?"":"none");render()});
document.getElementById("fCust").onchange=e=>{S.cust=e.target.value;render()};
document.getElementById("fQ").oninput=e=>{S.q=e.target.value.trim();render()};
document.querySelectorAll("#fBU button").forEach(b=>b.onclick=()=>{document.querySelectorAll("#fBU button").forEach(x=>x.classList.toggle("on",x===b));S.bu=b.dataset.v;render()});
document.querySelectorAll("#fSc button").forEach(b=>b.onclick=()=>{document.querySelectorAll("#fSc button").forEach(x=>x.classList.toggle("on",x===b));S.sc=+b.dataset.v;render()});
document.getElementById("exp").onclick=async()=>{
  const M=[D.cur,D.m1,D.m2];
  const cap=D.pools.filter(p=>match(p,poolText(p))).map(p=>{const o={"客户":p.name,"客户编码":p.code,"BU":BU[p.bu]||p.bu,"CP":p.cp,"活动":p.cpDesc,"渠道":p.channel,"机制桶":p.bucket,"产品范围":p.scope,"费率":p.months[D.cur].rate,"CP余额":Math.round(p.cpBalance)};
    D.scenarios.forEach((s,j)=>{M.forEach(m=>o[mlabel(m)+"可做_"+s.label]=Math.round(feeOf(p,m,j)));o["本季度合计_"+s.label]=Math.round(rowQ(p,j))});
    M.forEach(m=>{o[mlabel(m)+"已排计划出货"]=Math.round(p.months[m].occ)});o["近3月均值"]=Math.round(p.forecast.base);o["本月已发生"]=Math.round(p.forecast.mtd);return o});
  const flt=D.open.filter(o=>match(o,planText(o))).map(o=>({"状态":LV[o.level][0],"客户":o.name,"客户编码":o.code,"PL":o.pl,"CP":o.cp,"活动":o.cpDesc,"渠道":o.channel,"开始":o.start,"结束":o.end,"备注日期":o.remarkDates?"是":"","费率":o.rate,"计划进货":Math.round(o.need),"池内净出货":Math.round(o.gross),"同池已核销扣减":Math.round(o.peerDone),"本计划可用净出货":Math.round(o.avail),"覆盖率":o.need?+(o.avail/o.need).toFixed(4):0,"还需出货":Math.round(o.shortNow),"月底预计缺口":Math.round(o.shortFinal),"池内退货":Math.round(o.returns),"计划费用":Math.round(o.budget),"已核销":Math.round(o.verified),"预计少核":Math.round(o.lossFee),"取数范围":o.scopeNote,"计划备注":o.remarks}));
  const ret=[];D.open.filter(o=>match(o,planText(o))).forEach(o=>o.returnSkus.forEach(r=>ret.push({"客户":o.name,"PL":o.pl,"活动":o.cpDesc,"渠道":o.channel,"SKU":r.sku,"产品":r.name,"退货净额":Math.round(r.v)})));
  const hist=[];D.pools.filter(p=>match(p,poolText(p))).forEach(p=>p.hist.forEach(x=>hist.push({"客户":p.name,"CP":p.cp,"活动":p.cpDesc,"渠道":p.channel,"月份":x.mm,"净出货":Math.round(x.actual),"其中退货":Math.round(x.neg),"已排计划":Math.round(x.occ),"剩余":Math.round(x.rem),"可回溯费用":x.fee==null?null:Math.round(x.fee)})));
  const note=D.checks.map(c=>({"类型":c.level==="warn"?"注意":"说明","内容":c.text}));
  const res=await fetch("/v10/export",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({cap,flt,ret,hist,note,cur:D.cur})});
  if(!res.ok){toast("导出失败："+res.status);return}
  const b=await res.blob();const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="费用规划_"+D.dataDate+".xlsx";a.click();
};
render();
</script></body></html>`;
}
