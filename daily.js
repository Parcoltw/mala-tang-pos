(()=>{
const STORE_NAME='辣極麻辣燙永和店';
const QUICK_OPTIONS=['湯少','湯多','去油','盒裝湯裡','不要碗','不要餐具','麵分開','辣另包','水煮','自備碗','湯料分開','麵放一起','辣油各半'];
const CONFLICTS={
  '湯少':['湯多'],'湯多':['湯少'],
  '麵分開':['麵放一起'],'麵放一起':['麵分開'],
  '盒裝湯裡':['湯料分開'],'湯料分開':['盒裝湯裡'],
  '辣另包':['辣油各半'],'辣油各半':['辣另包'],
  '不要碗':['自備碗'],'自備碗':['不要碗']
};
const dayKey=(value)=>{const d=value instanceof Date?value:new Date(value);return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')};
const dayLabel=key=>key.replaceAll('-','/');
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

document.title=STORE_NAME;
const pageTitle=document.querySelector('header h1');if(pageTitle)pageTitle.textContent=STORE_NAME;

const style=document.createElement('style');
style.textContent=`
#optionsDlg{width:min(96vw,680px)}
#optionsDlg .modal{padding:14px}
.optionGrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
.optionGrid.spiceGrid{grid-template-columns:repeat(4,minmax(0,1fr))}
.optionGrid label{position:relative;display:flex;align-items:center;justify-content:center;text-align:center;min-height:52px;border:1.5px solid #bbb;border-radius:10px;background:#fff;font-weight:900;padding:8px;cursor:pointer;user-select:none}
.optionGrid label:has(input:checked){background:#111;color:#fff;border-color:#111}
.optionGrid input{position:absolute;opacity:0;pointer-events:none}
@media(max-width:600px){#optionsDlg .modal{padding:11px}.optionGrid,.optionGrid.spiceGrid{grid-template-columns:repeat(3,minmax(0,1fr))}.optionGrid label{min-height:50px;padding:6px;font-size:14px}}
`;
document.head.appendChild(style);

function normalizeOrderNumbers(){const groups={};records.forEach(r=>{const k=dayKey(r.time);(groups[k]??=[]).push(r)});let changed=false;Object.values(groups).forEach(rs=>{rs.sort((a,b)=>new Date(a.time)-new Date(b.time));rs.forEach((r,i)=>{const no=i+1;if(Number(r.orderNo)!==no){r.orderNo=no;changed=true}})});if(changed)saveRecords()}
function nextOrderNo(){normalizeOrderNumbers();const today=dayKey(new Date());return records.filter(r=>dayKey(r.time)===today).length+1}
function currentLines(){return Object.entries(cart).filter(([,q])=>q>0).map(([i,q])=>({name:items[i][1],qty:Number(q),price:Number(items[i][2]),subtotal:Number(items[i][2])*Number(q)}))}
function fallbackLines(r){if(Array.isArray(r.lines)&&r.lines.length)return r.lines;return String(r.items||'').split('、').filter(Boolean).map(x=>{const m=x.match(/^(.*)×(\d+)$/);return{name:m?m[1]:x,qty:m?Number(m[2]):1,subtotal:null}})}
function recordExtras(r){if(Array.isArray(r.extras))return r.extras.filter(Boolean);const a=[];if(r.oil==='去油')a.push('去油');if(r.bowl==='不要碗')a.push('不要碗');if(r.utensils==='不要餐具')a.push('不要餐具');return a}

function printReceipt(r){
  const no=String(r.orderNo||0).padStart(3,'0'),dt=new Date(r.time),date=dt.toLocaleDateString('zh-TW'),time=dt.toLocaleTimeString('zh-TW',{hour:'2-digit',minute:'2-digit',hour12:false});
  const itemRows=fallbackLines(r).map(x=>`<div class="item"><span>${esc(x.name)}</span><span class="qty">×${x.qty}</span><span class="money">${x.subtotal==null?'':'$'+x.subtotal}</span></div>`).join('');
  const extras=recordExtras(r);
  const opts=[['辣度',r.spice],...extras.map(x=>['需求',x])].filter(([,v])=>v).map(([k,v])=>`<div class="opt"><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join('');
  const paid=r.cash?`<div class="sumrow"><span>收現</span><b>$${r.cash}</b></div><div class="sumrow"><span>找零</span><b>$${r.change||0}</b></div>`:'';
  const w=window.open('','_blank','width=420,height=760');if(!w){alert('請允許此網站開啟彈出式視窗，才能列印出單。');return}
  w.document.write(`<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${STORE_NAME} #${no}</title><style>@page{size:80mm auto;margin:2.5mm}*{box-sizing:border-box}html,body{margin:0;padding:0;background:#fff;color:#000;font-family:-apple-system,BlinkMacSystemFont,"Noto Sans TC",sans-serif}.r{width:75mm;margin:0 auto;font-size:14px;line-height:1.35}.shop{text-align:center;font-size:23px;font-weight:900}.service{text-align:center;font-size:22px;font-weight:900;border:2px solid #000;padding:2mm;margin:2mm 0}.no{text-align:center;font-size:40px;font-weight:950;letter-spacing:2px}.dt{display:flex;justify-content:space-between;font-size:12px;margin:2mm 0}.dash{border-top:1px dashed #000;margin:2mm 0}.head,.item{display:grid;grid-template-columns:1fr 11mm 17mm;gap:1mm}.head{font-weight:900;font-size:12px}.item{padding:1.4mm 0;border-bottom:1px dotted #bbb}.qty{text-align:center}.money{text-align:right;font-weight:800}.opt,.sumrow,.grand{display:flex;justify-content:space-between}.opt{font-size:16px;padding:1mm 0}.sumrow{font-size:16px;padding:.8mm 0}.grand{font-size:25px;font-weight:950}.foot{text-align:center;font-size:11px;margin-top:4mm}</style></head><body><div class="r"><div class="shop">${STORE_NAME}</div><div class="service">${esc(r.service||'訂單')}</div><div class="no">${no}</div><div class="dt"><span>${date}</span><span>${time}</span></div><div class="dash"></div><div class="head"><span>品項</span><span style="text-align:center">數量</span><span style="text-align:right">小計</span></div>${itemRows}<div class="dash"></div>${opts}<div class="dash"></div><div class="grand"><span>總計</span><span>$${Number(r.amount||0)}</span></div>${paid}<div class="foot">請依單號取餐・謝謝光臨</div></div><script>window.onload=()=>setTimeout(()=>window.print(),250)<\/script></body></html>`);w.document.close();
}
window.printReceipt=printReceipt;normalizeOrderNumbers();

let checkoutIntent=false;
const optionsDlg=document.getElementById('optionsDlg');
optionsDlg.innerHTML=`<div class="modal"><h2 id="optionsTitle">結帳選項</h2>
<div class="section"><div class="sectionTitle">用餐方式</div><div class="optionGrid"><label><input type="radio" name="service2" value="內用">內用</label><label><input type="radio" name="service2" value="外帶">外帶</label></div></div>
<div class="section"><div class="sectionTitle">辣度</div><div class="optionGrid spiceGrid" id="spiceChoices2"></div></div>
<div class="section"><div class="sectionTitle">其他需求（可複選）</div><div class="optionGrid" id="quickChoices"></div></div>
<div class="modalFoot"><button id="optionsCancel2" class="ghost">取消</button><button id="optionsSave2" class="dark">確認</button></div></div>`;
const spiceBox=document.getElementById('spiceChoices2');
SPICES.forEach(s=>{const l=document.createElement('label');l.innerHTML=`<input type="radio" name="spice2" value="${s}">${s}`;spiceBox.appendChild(l)});
const quickBox=document.getElementById('quickChoices');
QUICK_OPTIONS.forEach(v=>{const l=document.createElement('label');l.innerHTML=`<input type="checkbox" name="quick2" value="${v}">${v}`;quickBox.appendChild(l)});
quickBox.addEventListener('change',e=>{const t=e.target;if(!t.matches('input[type="checkbox"]')||!t.checked)return;(CONFLICTS[t.value]||[]).forEach(v=>{const q=quickBox.querySelector(`input[value="${v}"]`);if(q)q.checked=false})});
function pick(name){const e=document.querySelector(`input[name="${name}"]:checked`);return e?e.value:null}
function quickSelected(){return [...document.querySelectorAll('input[name="quick2"]:checked')].map(x=>x.value)}
function renderMetaNew(){if(!pendingOptions){document.getElementById('orderMeta').textContent='尚未設定內用/外帶與辣度';return}const parts=[pendingOptions.service,pendingOptions.spice,...(pendingOptions.extras||[])];document.getElementById('orderMeta').textContent=parts.filter(Boolean).join('・')}
window.renderMeta=renderMetaNew;
function openOptionsNew(){
  document.querySelectorAll('input[name="service2"],input[name="spice2"],input[name="quick2"]').forEach(x=>x.checked=false);
  if(pendingOptions){const s=document.querySelector(`input[name="service2"][value="${pendingOptions.service}"]`);const p=document.querySelector(`input[name="spice2"][value="${pendingOptions.spice}"]`);if(s)s.checked=true;if(p)p.checked=true;(pendingOptions.extras||[]).forEach(v=>{const e=quickBox.querySelector(`input[value="${v}"]`);if(e)e.checked=true})}
  document.getElementById('optionsSave2').textContent=checkoutIntent?'確認並結帳':'儲存選項';
  optionsDlg.showModal();
}
window.openOptions=openOptionsNew;

function finishCheckout(){
  if(!Object.keys(cart).length){alert('目前沒有商品');return false}
  const c=Number(cash.value||0),t=total();if(c&&c<t){alert('收款金額不足');return false}if(!pendingOptions)return false;
  const no=nextOrderNo(),extras=pendingOptions.extras||[];
  const rec={id:Date.now(),orderNo:no,time:new Date().toISOString(),amount:t,service:pendingOptions.service,spice:pendingOptions.spice,extras,oil:extras.includes('去油')?'去油':'',bowl:extras.includes('不要碗')?'不要碗':'',utensils:extras.includes('不要餐具')?'不要餐具':'',items:cartText(),lines:currentLines(),cash:c||0,change:c?c-t:0};
  records.unshift(rec);saveRecords();printReceipt(rec);cart={};cash.value='';pendingOptions=null;renderCart();return true
}

const checkout=document.getElementById('checkout');
checkout.onclick=()=>{if(!Object.keys(cart).length){alert('目前沒有商品');return}const c=Number(cash.value||0);if(c&&c<total()){alert('收款金額不足');return}if(!pendingOptions){checkoutIntent=true;openOptionsNew();return}checkoutIntent=false;finishCheckout()};
const orderMeta=document.getElementById('orderMeta');if(orderMeta)orderMeta.onclick=()=>{checkoutIntent=false;openOptionsNew()};
document.getElementById('optionsCancel2').onclick=()=>{checkoutIntent=false;optionsDlg.close()};
document.getElementById('optionsSave2').onclick=()=>{const service=pick('service2'),spice=pick('spice2');if(!service||!spice){alert('請選擇內用/外帶與辣度');return}pendingOptions={service,spice,extras:quickSelected()};renderMetaNew();optionsDlg.close();if(checkoutIntent){checkoutIntent=false;finishCheckout()}};

window.renderHistory=()=>{
  normalizeOrderNumbers();document.getElementById('statCount').textContent=records.length;document.getElementById('statRevenue').textContent='$'+records.reduce((s,r)=>s+Number(r.amount||0),0);const list=document.getElementById('historyList');list.innerHTML='';if(!records.length){list.innerHTML='<div class="empty">尚無結帳紀錄</div>';return}
  const groups={};records.forEach(r=>{const k=dayKey(r.time);(groups[k]??=[]).push(r)});Object.keys(groups).sort().reverse().forEach(k=>{const rs=groups[k].sort((a,b)=>new Date(b.time)-new Date(a.time)),dailyTotal=rs.reduce((s,r)=>s+Number(r.amount||0),0),section=document.createElement('section');section.style.cssText='margin:14px 0 18px';section.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:end;border-bottom:2px solid #111;padding:7px 2px;font-weight:900"><span>${dayLabel(k)}</span><span>${rs.length} 筆・$${dailyTotal}</span></div>`;
    rs.forEach(r=>{const extras=recordExtras(r);const d=document.createElement('div');d.className='record';d.innerHTML=`<div class="recordHead"><span>#${String(r.orderNo||0).padStart(3,'0')}　${esc(r.service)}・${esc(r.spice)}</span><span>$${r.amount}</span></div><div class="recordMeta">${localTime(r.time)}${extras.length?'・'+extras.map(esc).join('・'):''}</div><div class="recordItems">${esc(r.items||'')}</div><div class="recordBtns"><button class="dark" data-print>重印</button><button class="ghost" data-edit>修改</button><button class="ghost" data-del>刪除</button></div>`;d.querySelector('[data-print]').onclick=()=>printReceipt(r);d.querySelector('[data-edit]').onclick=()=>openEdit(r.id);d.querySelector('[data-del]').onclick=()=>{if(confirm('確定刪除這筆結帳紀錄？')){records=records.filter(x=>x.id!==r.id);normalizeOrderNumbers();saveRecords();renderHistory()}};section.appendChild(d)});list.appendChild(section)})
};
document.getElementById('historyBtn').onclick=()=>{renderHistory();document.getElementById('historyDlg').showModal()};
})();