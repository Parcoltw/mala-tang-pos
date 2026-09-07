(()=>{
const dayKey=(value)=>{
  const d=value instanceof Date?value:new Date(value);
  return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
};
const dayLabel=(key)=>key.replaceAll('-','/');
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[m]));

function normalizeOrderNumbers(){
  const groups={};records.forEach(r=>{const k=dayKey(r.time);(groups[k]??=[]).push(r)});let changed=false;
  Object.values(groups).forEach(rs=>{rs.sort((a,b)=>new Date(a.time)-new Date(b.time));rs.forEach((r,i)=>{const no=i+1;if(Number(r.orderNo)!==no){r.orderNo=no;changed=true}})});
  if(changed)saveRecords();
}
function nextOrderNo(){normalizeOrderNumbers();const today=dayKey(new Date());return records.filter(r=>dayKey(r.time)===today).length+1}
function currentLines(){return Object.entries(cart).filter(([,q])=>q>0).map(([i,q])=>({name:items[i][1],qty:Number(q),price:Number(items[i][2]),subtotal:Number(items[i][2])*Number(q)}))}
function fallbackLines(r){if(Array.isArray(r.lines)&&r.lines.length)return r.lines;return String(r.items||'').split('、').filter(Boolean).map(x=>{const m=x.match(/^(.*)×(\d+)$/);return{name:m?m[1]:x,qty:m?Number(m[2]):1,subtotal:null}})}

function printReceipt(r){
  const no=String(r.orderNo||0).padStart(3,'0'),dt=new Date(r.time),date=dt.toLocaleDateString('zh-TW'),time=dt.toLocaleTimeString('zh-TW',{hour:'2-digit',minute:'2-digit',hour12:false});
  const itemRows=fallbackLines(r).map(x=>`<div class="item"><span>${esc(x.name)}</span><span class="qty">×${x.qty}</span><span class="money">${x.subtotal==null?'':'$'+x.subtotal}</span></div>`).join('');
  const opts=[['辣度',r.spice],r.oil?['去油',r.oil]:null,r.service==='外帶'&&r.bowl?['碗',r.bowl]:null,r.service==='外帶'&&r.utensils?['餐具',r.utensils]:null].filter(Boolean).map(([k,v])=>`<div class="opt"><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join('');
  const paid=r.cash?`<div class="sumrow"><span>收現</span><b>$${r.cash}</b></div><div class="sumrow"><span>找零</span><b>$${r.change||0}</b></div>`:'';
  const w=window.open('','_blank','width=420,height=760');if(!w){alert('請允許此網站開啟彈出式視窗，才能列印出單。');return}
  w.document.write(`<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>辣極麻辣燙 #${no}</title><style>@page{size:80mm auto;margin:2.5mm}*{box-sizing:border-box}html,body{margin:0;padding:0;background:#fff;color:#000;font-family:-apple-system,BlinkMacSystemFont,"Noto Sans TC",sans-serif}.r{width:75mm;margin:0 auto;font-size:14px;line-height:1.35}.shop{text-align:center;font-size:25px;font-weight:900}.service{text-align:center;font-size:22px;font-weight:900;border:2px solid #000;padding:2mm;margin:2mm 0}.no{text-align:center;font-size:40px;font-weight:950;letter-spacing:2px}.dt{display:flex;justify-content:space-between;font-size:12px;margin:2mm 0}.dash{border-top:1px dashed #000;margin:2mm 0}.head,.item{display:grid;grid-template-columns:1fr 11mm 17mm;gap:1mm}.head{font-weight:900;font-size:12px}.item{padding:1.4mm 0;border-bottom:1px dotted #bbb}.qty{text-align:center}.money{text-align:right;font-weight:800}.opt,.sumrow,.grand{display:flex;justify-content:space-between}.opt{font-size:16px;padding:1mm 0}.sumrow{font-size:16px;padding:.8mm 0}.grand{font-size:25px;font-weight:950}.foot{text-align:center;font-size:11px;margin-top:4mm}</style></head><body><div class="r"><div class="shop">辣極麻辣燙</div><div class="service">${esc(r.service||'訂單')}</div><div class="no">${no}</div><div class="dt"><span>${date}</span><span>${time}</span></div><div class="dash"></div><div class="head"><span>品項</span><span style="text-align:center">數量</span><span style="text-align:right">小計</span></div>${itemRows}<div class="dash"></div>${opts}<div class="dash"></div><div class="grand"><span>總計</span><span>$${Number(r.amount||0)}</span></div>${paid}<div class="foot">請依單號取餐・謝謝光臨</div></div><script>window.onload=()=>setTimeout(()=>window.print(),250)<\/script></body></html>`);w.document.close();
}
window.printReceipt=printReceipt;normalizeOrderNumbers();

const checkout=document.getElementById('checkout');
checkout.onclick=()=>{
  if(!Object.keys(cart).length){alert('目前沒有商品');return}const c=Number(cash.value||0);if(c&&c<total()){alert('收款金額不足');return}if(!pendingOptions){openOptions();return}
  const no=nextOrderNo(),t=total();const rec={id:Date.now(),orderNo:no,time:new Date().toISOString(),amount:t,service:pendingOptions.service,spice:pendingOptions.spice,oil:pendingOptions.oil||'',bowl:pendingOptions.bowl||'',utensils:pendingOptions.utensils||'',items:cartText(),lines:currentLines(),cash:c||0,change:c?c-t:0};records.unshift(rec);saveRecords();printReceipt(rec);cart={};cash.value='';pendingOptions=null;renderCart();
};

window.renderHistory=()=>{
  normalizeOrderNumbers();document.getElementById('statCount').textContent=records.length;document.getElementById('statRevenue').textContent='$'+records.reduce((s,r)=>s+Number(r.amount||0),0);const list=document.getElementById('historyList');list.innerHTML='';if(!records.length){list.innerHTML='<div class="empty">尚無結帳紀錄</div>';return}
  const groups={};records.forEach(r=>{const k=dayKey(r.time);(groups[k]??=[]).push(r)});Object.keys(groups).sort().reverse().forEach(k=>{const rs=groups[k].sort((a,b)=>new Date(b.time)-new Date(a.time)),dailyTotal=rs.reduce((s,r)=>s+Number(r.amount||0),0),section=document.createElement('section');section.style.cssText='margin:14px 0 18px';section.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:end;border-bottom:2px solid #111;padding:7px 2px;font-weight:900"><span>${dayLabel(k)}</span><span>${rs.length} 筆・$${dailyTotal}</span></div>`;
    rs.forEach(r=>{const d=document.createElement('div');d.className='record';d.innerHTML=`<div class="recordHead"><span>#${String(r.orderNo||0).padStart(3,'0')}　${esc(r.service)}・${esc(r.spice)}</span><span>$${r.amount}</span></div><div class="recordMeta">${localTime(r.time)}${r.oil?'・'+esc(r.oil):''}${r.bowl?'・'+esc(r.bowl):''}${r.utensils?'・'+esc(r.utensils):''}</div><div class="recordItems">${esc(r.items||'')}</div><div class="recordBtns"><button class="dark" data-print>重印</button><button class="ghost" data-edit>修改</button><button class="ghost" data-del>刪除</button></div>`;d.querySelector('[data-print]').onclick=()=>printReceipt(r);d.querySelector('[data-edit]').onclick=()=>openEdit(r.id);d.querySelector('[data-del]').onclick=()=>{if(confirm('確定刪除這筆結帳紀錄？')){records=records.filter(x=>x.id!==r.id);normalizeOrderNumbers();saveRecords();renderHistory()}};section.appendChild(d)});list.appendChild(section)})
};
document.getElementById('historyBtn').onclick=()=>{renderHistory();document.getElementById('historyDlg').showModal()};
})();