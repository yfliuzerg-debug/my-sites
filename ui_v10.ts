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
const S={cust:"",bu:"",q:"",sc:1,tab:"cap",fv:"chase",thr:500,open:new Set()};
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
// 建议分配：每个 CP 的余额按各池本季度承载占比分下去，100 元取整，不超过承载
function allocMap(i){const by=new Map();D.pools.filter(p=>p.plannable).forEach(p=>{const x=by.get(p.cp)||{bal:Math.max(0,p.cpBalance),ps:[]};x.ps.push(p);by.set(p.cp,x)});
  const m=new Map();by.forEach(x=>{const tot=x.ps.reduce((s,p)=>s+Math.max(0,rowQ(p,i)),0);const r=tot>0?Math.min(1,x.bal/tot):0;x.ps.forEach(p=>m.set(p.id,Math.floor(Math.max(0,rowQ(p,i))*r/100)*100))});return m}
// CP 还能接住多少回流 = 这个 CP 下所有客户本季度承载 − CP 现有余额（基准档）
function absorb(cp){const ps=D.pools.filter(p=>p.cp===cp);if(!ps.length)return null;return ps.reduce((s,p)=>s+rowQ(p,1),0)-Math.max(0,ps[0].cpBalance)}
function destOf(cp,skip){const agg=new Map();D.pools.filter(p=>p.cp===cp&&p.name!==skip).forEach(p=>{const k=p.name+'|'+p.channel;agg.set(k,{name:p.name,ch:p.channel,v:(agg.get(k)?agg.get(k).v:0)+rowQ(p,1)})});return [...agg.values()].filter(d=>d.v>=100).sort((a,b)=>b.v-a.v)}
const short=n=>String(n||'').replace(/有限(责任)?公司$/,'').replace(/^(深圳市|东莞市|广州市?)/,'');
// 同一 CP 的余额在全部客户之间共用：合计时按 CP 封顶
function capped(ps,i){const by=new Map();ps.forEach(p=>{const x=by.get(p.cp)||{v:0,b:p.cpBalance};x.v+=rowQ(p,i);by.set(p.cp,x)});let t=0;by.forEach(x=>t+=Math.min(x.v,Math.max(0,x.b)));return t}

// ───────── 能做多少费用 ─────────
function renderCap(){
  const el=document.getElementById("v-cap");const i=S.sc;
  let rows=D.pools.filter(p=>p.plannable&&match(p,poolText(p)));
  const all=rows.length;
  rows=rows.filter(p=>rowQ(p,1)+rowN(p,1)>=S.thr||p.months[D.cur].gap[1]<-0.5);
  const sum=k=>rows.reduce((s,p)=>s+k(p),0);
  const AL=[0,1,2].map(j=>allocMap(j));const al=AL[i];
  const k3=[0,1,2].map(j=>rows.reduce((s,p)=>s+(AL[j].get(p.id)||0),0)), raw3=[0,1,2].map(j=>sum(p=>rowQ(p,j)));
  const over=rows.filter(p=>p.months[D.cur].gap[1]<-0.5);
  let html='<div class="kpis">'+
   '<div class="kpi"><div class="l">建议分配合计（到'+mlabel(D.qEnd)+'，按 CP 余额封顶）</div><div class="v">'+wan(k3[i])+'</div><div class="s">保守 '+wan(k3[0])+' · 基准 '+wan(k3[1])+' · 乐观 '+wan(k3[2])+'</div></div>'+
   '<div class="kpi"><div class="l">本季度出货承载空间（未封顶）</div><div class="v">'+wan(raw3[i])+'</div><div class="s">保守 '+wan(raw3[0])+' · 乐观 '+wan(raw3[2])+'；超出余额部分需要新预算</div></div>'+
   [D.cur,D.m1,D.m2].map(m=>'<div class="kpi"><div class="l">'+mlabel(m)+(m>D.qEnd?'（下季度）':m===D.cur?'（本月，含已发生）':'')+'</div><div class="v">'+wan(sum(p=>feeOf(p,m,i)))+'</div><div class="s">保守 '+wan(sum(p=>feeOf(p,m,0)))+' · 乐观 '+wan(sum(p=>feeOf(p,m,2)))+'</div></div>').join("")+
   (over.length?'<div class="kpi red"><div class="l">本月计划超出货（单月计划，下月补不上）</div><div class="v">'+over.length+' 个池</div><div class="s">合计差 '+wan(-over.reduce((s,p)=>s+p.months[D.cur].gap[i],0))+' 出货，见"在途计划"</div></div>':'')+
   '</div>';
  html+='<div class="bar" style="margin-top:-4px"><span class="sub">显示可做费用 ≥</span><input type="number" id="thr" value="'+S.thr+'" step="100" min="0" style="width:90px"><span class="sub">元的 '+rows.length+' / '+all+' 个核销池（客户 × CP × 渠道）。点任意一行看预估依据、产品明细和历史回溯。</span></div>';
  const by=new Map();rows.forEach(p=>{const k=p.name;if(!by.has(k))by.set(k,[]);by.get(k).push(p)});
  const groups=[...by.entries()].sort((a,b)=>b[1].reduce((s,p)=>s+rowQ(p,i),0)-a[1].reduce((s,p)=>s+rowQ(p,i),0));
  if(!groups.length)html+='<div class="card"><div class="empty">当前筛选下没有可做费用的核销池</div></div>';
  for(const [name,ps] of groups){
    ps.sort((a,b)=>rowQ(b,i)-rowQ(a,i));
    const tq=ps.reduce((s,p)=>s+rowQ(p,i),0);
    html+='<div class="card"><div class="grp"><span class="t">'+h(name)+'</span><span class="code">'+h([...new Set(ps.map(p=>p.code))].join(" / "))+'</span><span class="sp"></span><span class="sum">本季度承载 '+money(tq)+' · 建议分配 <b>'+money(ps.reduce((s,p)=>s+(al.get(p.id)||0),0))+'</b> 元</span></div>';
    html+='<table><thead><tr><th>活动</th><th>渠道</th><th class="n hide-m">费率</th>'+[D.cur,D.m1,D.m2].map(m=>'<th class="n">'+mlabel(m)+(m>D.qEnd?'<span class="sub">·下季</span>':'')+'</th>').join("")+'<th class="n">本季度承载</th><th class="n">建议分配</th><th class="n hide-m">CP余额</th></tr></thead><tbody>';
    for(const p of ps){
      const c=p.months[D.cur];const g=c.gap[i];
      html+='<tr class="row" data-id="'+h(p.id)+'"><td><div>'+h(p.cpDesc)+(p.bucket?' <span class="chip nodata">'+h(p.bucket)+'</span>':'')+(g<-0.5?' <span class="chip risk" title="本月这个池里已排的计划进货金额，超过本月预计出货；跨月计划可由下月补的部分已结转，不算在内">本月计划超出货 '+money(-g)+'</span>':'')+'</div><div class="sub">'+(new Set(ps.map(x=>x.code)).size>1?h(p.code)+' · ':'')+h(p.cp)+' · '+h(p.scope)+(p.regional?' · <span class="chip follow">区域自主·已扣其他CP</span>':p.broad?' · <span class="chip nodata">宽口径·可兼做陈列/上市</span>':'')+'</div>'+(p.recommend&&p.recommend.length?'<div class="sub">推荐：'+p.recommend.slice(0,2).map(g=>h(g.group)+' '+money(g.fee)).join(' · ')+'</div>':'')+'</td><td>'+h(p.channel)+'</td><td class="n hide-m">'+(c.rate==null?'<span class="neg">待定</span>':pct(c.rate))+'</td>'+
       [D.cur,D.m1,D.m2].map(m=>{const v=feeOf(p,m,i);return '<td class="n '+(p.months[m].inCP?cls(v):'zero')+'">'+(p.months[m].inCP?money(v):'<span class="sub">CP已结束</span>')+'</td>'}).join("")+
       '<td class="n"><b>'+money(rowQ(p,i))+'</b><div class="sub">'+money(rowQ(p,0))+' – '+money(rowQ(p,2))+'</div></td><td class="n"><b class="pos">'+money(al.get(p.id)||0)+'</b></td><td class="n hide-m">'+money(p.cpBalance)+(rowQ(p,i)>p.cpBalance+0.5?'<div class="sub neg">余额不够</div>':'')+'</td></tr>';
      if(S.open.has(p.id))html+='<tr class="detail"><td colspan="10">'+capDetail(p)+'</td></tr>';
    }
    html+='</tbody></table></div>';
  }
  html+='<div class="note">月份列和"本季度承载"是按出货测算的费用空间；"建议分配"把每个 CP 的余额按各客户承载占比分下去（100 元取整，不超过承载）。"推荐"按近 4 个月净出货 × 费率排序，供选产品组和代表 SKU。</div>';
  el.innerHTML=html;
  const t=document.getElementById("thr");t.onchange=()=>{S.thr=Math.max(0,+t.value||0);renderCap()};
  el.querySelectorAll("tr.row").forEach(r=>r.onclick=()=>{const id=r.dataset.id;S.open.has(id)?S.open.delete(id):S.open.add(id);renderCap()});
}
function capDetail(p){
  const M=[D.cur,D.m1,D.m2];const f=p.forecast;
  let a='<div class="dgrid"><div class="dbox"><h4>三档预估（元）</h4><table><thead><tr><th>档位</th>'+M.map(m=>'<th class="n">'+mlabel(m)+'</th>').join("")+'</tr></thead><tbody>';
  D.scenarios.forEach((s,j)=>{a+='<tr><td><b>'+h(s.label)+'</b><div class="sub">预计出货 / 已排计划 / 可做费用</div></td>'+M.map(m=>{const c=p.months[m];return '<td class="n">'+money(c.so[j])+'<div class="sub">− '+money(c.occ)+(c.carryIn&&c.carryIn[j]>0.5?' − 上月结转 '+money(c.carryIn[j]):'')+(c.wall>0.5?' · 费用再扣其他CP '+money(c.wall):'')+'</div><b class="'+cls(c.fee[j])+'">'+money(c.fee[j])+'</b></td>'}).join("")+'</tr>'});
  a+='</tbody></table><div class="note">本月 = 已发生 '+money(f.mtd)+' + 剩余 '+D.remainDays+' 天预测 '+money(f.remain)+'（档位只乘在预测部分）。下月/下下月 = 近3个完整月均值 '+money(f.base)+' × 季节系数 '+f.s1.toFixed(2)+' / '+f.s2.toFixed(2)+'。</div></div>';
  a+='<div class="dbox"><h4>预估依据</h4><table><tbody><tr><td>近 3 个完整月净出货</td><td class="n">'+f.last3.slice().reverse().map(money).join(' / ')+'</td></tr><tr><td>去年同期（'+M.map(mlabel).join('/')+'）</td><td class="n">'+f.ly.map(money).join(' / ')+'</td></tr><tr><td>池内库存（估）</td><td class="n">'+money(f.stock)+'</td></tr>'+(p.timedNote?'<tr><td>机制排除</td><td>'+h(p.timedNote)+'</td></tr>':'')+'<tr><td>同池已排计划</td><td class="n">'+p.plans.length+' 条</td></tr></tbody></table></div></div>';
  if(p.recommend&&p.recommend.length)a+='<div class="dbox" style="margin-top:12px"><h4>推荐产品组（按可做费用排序）</h4><table><thead><tr><th>产品组</th><th class="n">近4月净出货</th><th class="n">可做费用</th><th>代表 SKU（出货最大）</th></tr></thead><tbody>'+p.recommend.map(g=>'<tr><td><b>'+h(g.group)+'</b></td><td class="n">'+money(g.so)+'</td><td class="n">'+money(g.fee)+'</td><td>'+h(g.top.name)+'<div class="sub">'+h(g.top.sku)+'</div></td></tr>').join("")+'</tbody></table></div>';
  if(p.regional){const w=M.flatMap(m=>(p.months[m].wallItems||[]).map(x=>({m,...x})));if(w.length)a+='<div class="dbox" style="margin-top:12px"><h4>CP 墙：已扣其他 CP 占用</h4><table><tbody>'+w.map(x=>'<tr><td>'+mlabel(x.m)+'</td><td>'+h(x.pl)+'<div class="sub">'+h(x.cp)+'</div></td><td class="n neg">− '+money(x.fee)+'</td></tr>').join("")+'</tbody></table></div>'}
  a+='<div class="dbox" style="margin-top:12px"><h4>产品明细（净出货，含退货）</h4><table><thead><tr><th>SKU</th><th class="hide-m">层级</th>'+p.recentMonths.map(m=>'<th class="n">'+mlabel(m)+'</th>').join("")+'</tr></thead><tbody>'+
   p.skuRows.map(r=>'<tr><td>'+h(r.name)+'<div class="sub">'+h(r.sku)+'</div></td><td class="hide-m sub">'+h([r.brand,r.s1,r.s2].filter(Boolean).join(' · '))+'</td>'+r.v.map(v=>'<td class="n '+cls(v)+'">'+money(v)+'</td>').join("")+'</tr>').join("")+'</tbody></table></div>';
  if(p.hist.length){a+='<details><summary>历史回溯（'+p.hist.length+' 个月，仅供参考）</summary><table><thead><tr><th>月份</th><th class="n">净出货</th><th class="n">其中退货</th><th class="n">已排计划</th><th class="n">剩余</th><th class="n">可回溯费用</th></tr></thead><tbody>'+
   p.hist.slice().reverse().map(x=>'<tr><td>'+mlabel(x.mm)+' <span class="sub">'+x.mm.slice(0,4)+'</span></td><td class="n '+cls(x.actual)+'">'+money(x.actual)+'</td><td class="n '+cls(x.neg)+'">'+money(x.neg)+'</td><td class="n">'+money(x.occ)+'</td><td class="n '+cls(x.rem)+'">'+money(x.rem)+'</td><td class="n">'+(x.fee==null?'-':money(x.fee))+'</td></tr>').join("")+'</tbody></table></details>'}
  return a;
}

// ───────── 在途计划 · 督促出货 ─────────
const DD=new Date(D.dataDate+"T00:00:00");
function daysLeft(o){return Math.max(0,Math.round((new Date(o.deadline+"T00:00:00")-DD)/864e5))}
// 提前关闭建议：钱退回来还有时间、有地方再投才值得关
function closeAdvice(o){
  if(o.level!=="risk"||o.lossFee<300)return null;
  if(o.regional)return {kind:"next",text:'下次申请前减额 '+money(o.lossFee)+'（区域自主回流需重新审批）'};
  const live=o.cpEnd&&o.cpEnd.slice(0,7).replace('-','')>=D.cur;const ab=absorb(o.cp);
  if(live&&ab!=null&&ab>500){
    const n=daysLeft(o);
    if(n>15){const r=new Date(new Date(o.deadline+"T00:00:00").getTime()-15*864e5);return {kind:"watch",text:'先追；'+(r.getMonth()+1)+'/'+r.getDate()+' 仍差就减额回流'}}
    const d=destOf(o.cp,o.name)[0];return {kind:"close",text:'建议提前减额 '+money(Math.min(o.lossFee,ab))+(d?' → 回流给 '+short(d.name)+' '+d.ch:'')}}
  return {kind:"keep",text:live?'CP 接不住回流，继续追':'CP 已结束，继续追'};
}
function pace(o){ // 需日均 / 当前日均
  const n=daysLeft(o);const need=n>0?o.shortNow/n:o.shortNow;
  const pm=(o.perMonth||[]).find(x=>x.mm===D.cur);const now=pm&&D.doneDays>0?Math.max(0,pm.avail)/D.doneDays:null;
  return {n,need,now,x:now>0?need/now:null};
}
const FV={chase:{label:"还能追",lv:["risk","follow"]},lost:{label:"已到期",lv:["lost"]},ok:{label:"已覆盖",lv:["ok"]},nodata:{label:"BI无数据",lv:["nodata"]}};
function renderFlt(){
  const el=document.getElementById("v-flt");
  const rows=D.open.filter(o=>match(o,planText(o)));
  const cnt=k=>rows.filter(o=>FV[k].lv.includes(o.level)).length;
  const shown=rows.filter(o=>FV[S.fv].lv.includes(o.level));
  const sum=(a,k)=>a.reduce((s,o)=>s+k(o),0);
  let html='<div class="bar"><div class="seg" id="fFv">'+Object.keys(FV).filter(k=>k==="chase"||k==="lost"||cnt(k)).map(k=>'<button data-v="'+k+'" class="'+(S.fv===k?'on':'')+'">'+FV[k].label+' '+cnt(k)+'</button>').join("")+'</div><span class="sub">'+
   (S.fv==="chase"?'计划月份还没结束，现在催出货还来得及。截止 = 计划最后一个月的月底（NBS 按整月取数）。':S.fv==="lost"?'计划月份已结束，缺口补不回来；少核的费用可以考虑回流再投放。':'')+'</span></div>';
  if(S.fv==="chase"){
    const risk=shown.filter(o=>o.level==="risk");
    html+='<div class="kpis">'+
     '<div class="kpi amber"><div class="l">还能追的计划还需出货</div><div class="v">'+wan(sum(shown,o=>o.shortNow))+'</div><div class="s">'+shown.length+' 条 · 最近截止 '+(shown.length?Math.min(...shown.map(daysLeft))+' 天后':'-')+'</div></div>'+
     '<div class="kpi red"><div class="l">按当前趋势仍差（预警）</div><div class="v">'+wan(sum(risk,o=>o.shortFinal))+'</div><div class="s">'+risk.length+' 条 · 不追的话预计少核 '+wan(sum(risk,o=>o.lossFee))+'</div></div>'+
     '<div class="kpi"><div class="l">需跟进（趋势能补上）</div><div class="v">'+wan(sum(shown.filter(o=>o.level==="follow"),o=>o.shortNow))+'</div><div class="s">'+shown.filter(o=>o.level==="follow").length+' 条 · 盯住别掉速</div></div>'+
     (()=>{const ad=shown.map(o=>[o,closeAdvice(o)]).filter(x=>x[1]&&(x[1].kind==="close"||x[1].kind==="next"));return '<div class="kpi"><div class="l">建议提前减额回流</div><div class="v">'+wan(ad.reduce((s,x)=>s+x[0].lossFee,0))+'</div><div class="s">'+ad.length+' 条（截止前 15 天内才建议）· 关掉后钱回原 CP 再投</div></div>'})()+
     '<div class="kpi"><div class="l">池内退货（冲减核销）</div><div class="v neg">'+wan(sum(shown,o=>o.returns))+'</div><div class="s">控制退货和催出货同样重要</div></div></div>';
  }else if(S.fv==="lost"){
    html+='<div class="kpis">'+
     '<div class="kpi red"><div class="l">已到期少核费用</div><div class="v">'+wan(sum(shown,o=>o.lossFee))+'</div><div class="s">'+shown.length+' 条计划</div></div>'+
     '<div class="kpi"><div class="l">缺口出货</div><div class="v">'+wan(sum(shown,o=>o.shortNow))+'</div><div class="s">计划进货 '+wan(sum(shown,o=>o.need))+'</div></div>'+
     '<div class="kpi"><div class="l">池内退货</div><div class="v neg">'+wan(sum(shown,o=>o.returns))+'</div><div class="s">复盘：哪些产品在退</div></div></div>';
    html+=reflowCard(shown);
  }
  const by=new Map();shown.forEach(o=>{if(!by.has(o.name))by.set(o.name,[]);by.get(o.name).push(o)});
  const groups=[...by.entries()].sort((a,b)=>S.fv==="lost"?sum(b[1],o=>o.lossFee)-sum(a[1],o=>o.lossFee):sum(b[1],o=>o.shortNow)-sum(a[1],o=>o.shortNow));
  if(!groups.length)html+='<div class="card"><div class="empty">当前筛选下没有'+FV[S.fv].label+'的计划</div></div>';
  for(const [name,os] of groups){
    if(S.fv==="chase")os.sort((a,b)=>daysLeft(a)-daysLeft(b)||b.shortNow-a.shortNow);else os.sort((a,b)=>b.lossFee-a.lossFee||b.shortNow-a.shortNow);
    html+='<div class="card"><div class="grp"><span class="t">'+h(name)+'</span><span class="code">'+h(os[0].code)+'</span><span class="sp"></span><span class="sum">'+
      (S.fv==="lost"?'少核 <b class="neg">'+money(sum(os,o=>o.lossFee))+'</b>':'还需出货 <b>'+money(sum(os,o=>o.shortNow))+'</b>'+(S.fv==="chase"?' · 不追预计少核 <b class="neg">'+money(sum(os,o=>o.lossFee))+'</b>':''))+'</span>'+
      (S.fv==="chase"?'<button class="btn copy" data-c="'+h(name)+'">复制催货消息</button>':'')+'</div>';
    const chase=S.fv==="chase",okv=S.fv==="ok";
    html+='<table><thead><tr>'+(chase?'<th>状态</th>':'')+'<th>计划</th><th class="hide-m">渠道 · 期间</th>'+(chase?'<th class="n">截止</th>':'')+'<th class="n">计划进货</th><th class="n">已出净额</th>'+
      (okv?'<th class="n">还可加做费用</th><th class="n">建议分配</th>':'<th class="n">'+(chase?'还需出货':'缺口')+'</th>'+(chase?'<th class="n hide-m">需日均 / 现日均</th>':'<th class="n hide-m">池内退货</th>')+'<th class="n">'+(chase?'不追预计少核':'少核')+'</th>')+'</tr></thead><tbody>';
    for(const o of os){
      const r=o.need>0?Math.max(0,Math.min(1,o.avail/o.need)):0;const pc=pace(o);const ad=chase?closeAdvice(o):null;
      html+='<tr class="row" data-id="'+h(o.pl)+'">'+(chase?'<td><span class="chip '+LV[o.level][1]+'">'+LV[o.level][0]+'</span></td>':'')+'<td><div>'+h(o.cpDesc)+'</div><div class="sub">'+h(o.pl)+' · '+pct(o.rate)+'</div></td><td class="hide-m">'+h(o.channel)+'<div class="sub">'+o.start.slice(5)+' ~ '+o.end.slice(5)+(o.remarkDates?'（备注日期）':'')+'</div></td>'+
       (chase?'<td class="n"><b class="'+(pc.n<=7?'neg':'')+'">'+pc.n+' 天</b><div class="sub">'+o.deadline.slice(5)+'</div></td>':'')+
       '<td class="n">'+money(o.need)+'</td><td class="n">'+money(o.avail)+'<div class="cov '+(r>=1?'':r>=0.8?'mid':'bad')+'"><i style="width:'+(r*100).toFixed(0)+'%"></i></div><div class="sub">'+(r*100).toFixed(0)+'%</div></td>';
      if(okv){
        const ps=D.pools.filter(p=>p.cp===o.cp&&o.chans.includes(p.channel)&&(p.code===o.code||p.name===o.name));const q=ps.reduce((s,p)=>s+rowQ(p,1),0);const AL1=allocMap(1);const al1=ps.reduce((s,p)=>s+(AL1.get(p.id)||0),0);
        html+=o.closed?'<td class="n zero" colspan="2"><span class="sub">历史月份，按新规不能回补</span></td>':'<td class="n">'+money(q)+'<div class="sub">同池本季度承载</div></td><td class="n pos"><b>'+money(al1)+'</b><div class="sub">按 CP 余额建议</div></td>';
      }else{
        html+='<td class="n '+(o.shortNow>0.5?(chase?'':'neg'):'zero')+'"><b>'+money(o.shortNow)+'</b>'+(chase&&o.shortNow>0.5?'<div class="sub">按趋势到截止仍差 '+money(o.shortFinal)+'</div>':'')+'</td>'+
         (chase?'<td class="n hide-m">'+money(pc.need)+' / '+(pc.now==null?'<span class="sub">未开始</span>':money(pc.now))+(pc.x!=null&&pc.x>1.05?'<div class="sub neg">需提速 ×'+pc.x.toFixed(1)+'</div>':pc.x!=null?'<div class="sub pos">节奏够</div>':'')+'</td>':'<td class="n hide-m '+cls(o.returns)+'">'+money(o.returns)+'</td>')+
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
  let t='<div class="card"><div class="grp" style="cursor:default"><span class="t">回流去向（按 CP）</span><span class="sp"></span><span class="sub">普通 CP 0 核销关闭后秒回原 CP；区域自主回流后需下月重新审批</span></div><table><thead><tr><th>CP</th><th class="n">少核费用</th><th class="n">CP 还能接住</th><th>同 CP 本季度还有承载的客户（基准档）</th></tr></thead><tbody>';
  for(const x of list){
    const dest=destOf(x.cp,null).slice(0,3);const ab=absorb(x.cp);const reg=/区域自主/.test(x.desc);
    const ended=!!x.end&&x.end.slice(0,7).replace('-','')<D.cur;
    t+='<tr><td>'+h(x.desc)+'<div class="sub">'+h(x.cp)+' · '+x.n+' 条计划'+(ended?' · CP 已于 '+x.end+' 结束':'')+''+(reg?' · 回流后需下月重新审批':'')+'</div></td><td class="n neg"><b>'+money(x.fee)+'</b></td><td class="n '+(ab==null||ab<=0?'neg':'pos')+'">'+(ab==null?'-':money(ab))+(ab!=null&&ab<x.fee?'<div class="sub">接不完</div>':'')+'</td><td>'+(dest.length&&!ended?dest.map(d=>h(d.name.replace(/有限(责任)?公司$/,''))+' '+h(d.ch)+' <b>'+money(d.v)+'</b>').join('<br>'):'<span class="sub">'+(ended?'CP 已结束':'同 CP 没有可承载的客户')+' → 需与 CDT 置换到其他 CP</span>')+'</td></tr>';
  }
  t+='</tbody></table><div class="note" style="padding:0 14px">CP 还能接住 = 这个 CP 下所有客户本季度承载 − CP 现有余额；为负表示现有余额都投不完，回流的钱只能找 CDT 置换。</div>'+(swap.length?'<div class="note" style="padding:0 14px 12px">缺预算、适合置换进来的池（出货承载 > CP 余额）：'+swap.map(p=>h(p.name.replace(/有限(责任)?公司$/,''))+'·'+h(p.cpDesc)+'·'+h(p.channel)+' 多 '+money(rowQ(p,1)-p.cpBalance)).join('；')+'</div>':'')+'</div>';
  return t;
}
function fltDetail(o){
  let a='<div class="dgrid"><div class="dbox"><h4>核销池怎么算的</h4><table><tbody>'+
   '<tr><td>取数范围</td><td>'+h(o.channel)+' 渠道（BI：'+h(o.chans.join('+'))+'）· '+h(o.scopeNote)+' · '+o.scopeSize+' 个 SKU</td></tr>'+
   '<tr><td>计划月份</td><td>'+o.months.map(mlabel).join('、')+' · 截止 '+o.deadline+'</td></tr>'+
   '<tr><td>池内净出货（正负合计）</td><td class="n">'+money(o.gross)+'</td></tr>'+
   (o.peerDone?'<tr><td>减：同池已核销/指定排除的计划</td><td class="n neg">− '+money(o.peerDone)+'</td></tr>':'')+
   (o.sharedWith?'<tr><td>与同池其他在途计划按金额分摊</td><td class="n">'+o.sharedWith+' 处</td></tr>':'')+
   '<tr><td>本计划可用净出货</td><td class="n"><b>'+money(o.avail)+'</b></td></tr>'+
   (!o.closed?'<tr><td>到截止预计还能出</td><td class="n">'+money(o.fcst)+'</td></tr>':'')+
   (o.perMonth&&o.perMonth.length>1?'<tr><td>分月（计划 / 已出 / 预计）</td><td class="n">'+o.perMonth.map(x=>mlabel(x.mm)+' '+money(x.need)+' / '+money(x.avail)+' / '+money(x.fcst)).join('<br>')+'</td></tr>':'')+
   '<tr><td>计划费用 / 已核销</td><td class="n">'+money(o.budget)+' / '+money(o.verified)+'</td></tr>'+
   '</tbody></table>'+(o.remarks?'<div class="note">计划备注：'+h(o.remarks)+'</div>':'')+'</div>';
  a+='<div class="dbox"><h4>拉低核销的退货 SKU</h4>'+(o.returnSkus.length?'<table><tbody>'+o.returnSkus.map(r=>'<tr><td>'+h(r.name)+'<div class="sub">'+h(r.sku)+'</div></td><td class="n neg">'+money(r.v)+'</td></tr>').join("")+'</tbody></table>':'<div class="sub">计划月份内池里没有退货</div>')+'</div></div>';
  return a;
}
function copyMsg(name){
  const os=D.open.filter(o=>o.name===name&&(o.level==="risk"||o.level==="follow")&&o.shortNow>0.5).sort((a,b)=>daysLeft(a)-daysLeft(b));
  if(!os.length){toast("这个客户没有需要催的计划");return}
  let t='【核销提醒】'+name+'（BI 截至 '+D.dataDate+'）\\n';
  os.forEach((o,k)=>{const pc=pace(o);t+=(k+1)+'. '+o.cpDesc+'｜'+o.channel+'｜'+o.start.slice(5)+'~'+o.end.slice(5)+'：计划进货 '+wan(o.need)+'，目前净出货 '+wan(o.avail)+'，'+o.deadline.slice(5)+' 前还需出货 '+wan(o.shortNow)+'（剩 '+pc.n+' 天，日均需 '+wan(pc.need)+(pc.now!=null?'，目前日均 '+wan(pc.now):'')+'）'+(o.returns<-0.5?'；退货 '+wan(-o.returns)+(o.returnSkus[0]?'（主要：'+o.returnSkus.slice(0,2).map(r=>r.name.replace(/^雀巢/,'').slice(0,14)).join('、')+'）':''):'')+'\\n'});
  t+='提醒：财务按计划渠道 + 产品组整月整体取数，退货会直接冲减核销，请尽快安排出货、控制退货。';
  navigator.clipboard?navigator.clipboard.writeText(t).then(()=>toast("已复制，可直接粘贴到微信"),()=>prompt("复制以下内容",t)):prompt("复制以下内容",t);
}
// ───────── 数据说明 ─────────
function renderChk(){
  document.getElementById("v-chk").innerHTML='<div class="card" style="padding:14px 18px"><h3 style="margin:0 0 8px">数据检查与口径</h3><ul class="checks">'+D.checks.map(c=>'<li class="'+c.level+'">'+(c.level==="warn"?"⚠️ ":"")+h(c.text)+'</li>').join("")+'</ul>'+
  '<div class="sub">文件概况：BI-SO '+D.files.soRows+' 行（月份 '+D.files.months[0]+'–'+D.files.months[D.files.months.length-1]+'）· TTS 计划 '+D.files.plans+' 条 · CP '+D.files.cps+' 个 · 生成于 '+new Date(D.generatedAt).toLocaleString("zh-CN")+'</div></div>';
}
function render(){document.getElementById("redN").textContent=D.open.filter(o=>o.level==="risk"&&match(o,planText(o))).length||"";
  document.getElementById("fSc").style.visibility=S.tab==="cap"?"visible":"hidden";document.getElementById("scLbl").style.visibility=S.tab==="cap"?"visible":"hidden";
  if(S.tab==="cap")renderCap();else if(S.tab==="flt")renderFlt();else renderChk()}
document.querySelectorAll(".tab").forEach(t=>t.onclick=()=>{document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("on",x===t));S.tab=t.dataset.t;["cap","flt","chk"].forEach(k=>document.getElementById("v-"+k).style.display=k===S.tab?"":"none");render()});
document.getElementById("fCust").onchange=e=>{S.cust=e.target.value;render()};
document.getElementById("fQ").oninput=e=>{S.q=e.target.value.trim();render()};
document.querySelectorAll("#fBU button").forEach(b=>b.onclick=()=>{document.querySelectorAll("#fBU button").forEach(x=>x.classList.toggle("on",x===b));S.bu=b.dataset.v;render()});
document.querySelectorAll("#fSc button").forEach(b=>b.onclick=()=>{document.querySelectorAll("#fSc button").forEach(x=>x.classList.toggle("on",x===b));S.sc=+b.dataset.v;render()});
document.getElementById("exp").onclick=async()=>{
  const M=[D.cur,D.m1,D.m2];
  const cap=D.pools.filter(p=>p.plannable&&match(p,poolText(p))).map(p=>{const o={"客户":p.name,"客户编码":p.code,"BU":BU[p.bu]||p.bu,"CP":p.cp,"活动":p.cpDesc,"渠道":p.channel,"机制桶":p.bucket,"产品范围":p.scope,"费率":p.months[D.cur].rate,"CP余额":Math.round(p.cpBalance)};
    D.scenarios.forEach((s,j)=>{M.forEach(m=>o[mlabel(m)+"可做_"+s.label]=Math.round(feeOf(p,m,j)));o["本季度合计_"+s.label]=Math.round(rowQ(p,j))});
    o["建议分配_基准"]=allocMap(1).get(p.id)||0;o["推荐产品组"]=(p.recommend||[]).map(g=>g.group+"("+Math.round(g.fee)+")").join("、");M.forEach(m=>{o[mlabel(m)+"已排计划出货"]=Math.round(p.months[m].occ);o[mlabel(m)+"已扣其他CP"]=Math.round(p.months[m].wall||0)});o["近3月均值"]=Math.round(p.forecast.base);o["本月已发生"]=Math.round(p.forecast.mtd);return o});
  const flt=D.open.filter(o=>match(o,planText(o))).map(o=>({"状态":LV[o.level][0],"客户":o.name,"客户编码":o.code,"PL":o.pl,"CP":o.cp,"活动":o.cpDesc,"渠道":o.channel,"开始":o.start,"结束":o.end,"备注日期":o.remarkDates?"是":"","费率":o.rate,"计划进货":Math.round(o.need),"池内净出货":Math.round(o.gross),"同池已核销扣减":Math.round(o.peerDone),"本计划可用净出货":Math.round(o.avail),"覆盖率":o.need?+(o.avail/o.need).toFixed(4):0,"还需出货":Math.round(o.shortNow),"截止":o.deadline,"剩余天数":o.closed?0:daysLeft(o),"按趋势到截止仍差":Math.round(o.shortFinal),"池内退货":Math.round(o.returns),"计划费用":Math.round(o.budget),"已核销":Math.round(o.verified),"预计少核":Math.round(o.lossFee),"建议":(closeAdvice(o)||{}).text||"","余量出货":Math.round(o.surplus||0),"取数范围":o.scopeNote,"计划备注":o.remarks}));
  const ret=[];D.open.filter(o=>match(o,planText(o))).forEach(o=>o.returnSkus.forEach(r=>ret.push({"客户":o.name,"PL":o.pl,"活动":o.cpDesc,"渠道":o.channel,"SKU":r.sku,"产品":r.name,"退货净额":Math.round(r.v)})));
  const hist=[];D.pools.filter(p=>p.plannable&&match(p,poolText(p))).forEach(p=>p.hist.forEach(x=>hist.push({"客户":p.name,"CP":p.cp,"活动":p.cpDesc,"渠道":p.channel,"月份":x.mm,"净出货":Math.round(x.actual),"其中退货":Math.round(x.neg),"已排计划":Math.round(x.occ),"剩余":Math.round(x.rem),"可回溯费用":x.fee==null?null:Math.round(x.fee)})));
  const note=D.checks.map(c=>({"类型":c.level==="warn"?"注意":"说明","内容":c.text}));
  const res=await fetch("/v10/export",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({cap,flt,ret,hist,note,cur:D.cur})});
  if(!res.ok){toast("导出失败："+res.status);return}
  const b=await res.blob();const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="费用规划_"+D.dataDate+".xlsx";a.click();
};
render();
</script></body></html>`;
}
