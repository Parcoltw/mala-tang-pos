(()=>{
// 避免誤按：移除「恢復預設菜單」
const resetBtn=document.getElementById('resetMenuBtn');
if(resetBtn)resetBtn.remove();

// 把內用/外帶改成整張單只選一次。
const bowlTabs=document.getElementById('bowlTabs');
if(bowlTabs && !document.getElementById('serviceRow')){
  const row=document.createElement('div');
  row.id='serviceRow';
  row.className='toolRow';
  row.innerHTML='<b style="align-self:center">整單用餐：</b><button id="serviceInBtn" class="ghost">內用</button><button id="serviceOutBtn" class="ghost">外帶</button>';
  bowlTabs.parentNode.insertBefore(row,bowlTabs);
}

function renderServiceOnce(){
  const a=document.getElementById('serviceInBtn'),b=document.getElementById('serviceOutBtn');
  if(!a||!b)return;
  a.className=orderService==='內用'?'dark':'ghost';
  b.className=orderService==='外帶'?'dark':'ghost';
}

const inBtn=document.getElementById('serviceInBtn');
const outBtn=document.getElementById('serviceOutBtn');
if(inBtn)inBtn.onclick=()=>{orderService='內用';renderServiceOnce();if(typeof renderMeta==='function')renderMeta()};
if(outBtn)outBtn.onclick=()=>{orderService='外帶';renderServiceOnce();if(typeof renderMeta==='function')renderMeta()};

// 從每碗選項視窗移除內用/外帶，只保留辣度與其他需求。
const dlg=document.getElementById('optionsDlg');
if(dlg){
  const serviceInput=dlg.querySelector('input[name="service"]');
  if(serviceInput){
    const section=serviceInput.closest('.section');
    if(section)section.remove();
  }
  const small=dlg.querySelector('.small');
  if(small)small.textContent='辣度與其他需求只套用目前這一碗；內用/外帶請在主畫面上方選一次即可。';
}

// 重新定義每碗選項：不再要求每碗選內用/外帶。
window.openOptions=function(){
  const bowl=bowls[currentBowlIndex];
  document.querySelectorAll('input[name="spice"],input[name="quick"]').forEach(x=>x.checked=false);
  if(bowl.spice){const s=document.querySelector(`input[name="spice"][value="${bowl.spice}"]`);if(s)s.checked=true}
  (bowl.extras||[]).forEach(v=>{const q=document.querySelector(`input[name="quick"][value="${v}"]`);if(q)q.checked=true});
  const h=dlg&&dlg.querySelector('h2');if(h)h.textContent=`第 ${currentBowlIndex+1} 碗選項`;
  const save=document.getElementById('optionsSave');if(save)save.textContent='儲存本碗';
  if(dlg)dlg.showModal();
};
window.saveCurrentBowlOptions=function(){
  const bowl=bowls[currentBowlIndex];
  const e=document.querySelector('input[name="spice"]:checked');
  const spice=e?e.value:'';
  if(!spice){alert('請選擇辣度');return false}
  bowl.spice=spice;
  bowl.extras=[...document.querySelectorAll('input[name="quick"]:checked')].map(x=>x.value);
  if(typeof renderCart==='function')renderCart();
  if(dlg)dlg.close();
  return true;
};
const saveBtn=document.getElementById('optionsSave');if(saveBtn)saveBtn.onclick=window.saveCurrentBowlOptions;

// 結帳時若尚未選整單用餐方式，只提示去主畫面選，不再打開每碗選項。
window.ensureAllBowlsReady=function(){
  const filled=validBowls();
  if(!filled.length){alert('目前沒有商品');return false}
  if(!orderService){alert('請先在主畫面上方選擇整張單是內用或外帶');return false}
  for(let i=0;i<filled.length;i++){
    const b=filled[i];
    if(!b.spice){
      currentBowlIndex=bowls.indexOf(b);
      if(typeof renderBowlTabs==='function')renderBowlTabs();
      if(typeof renderCart==='function')renderCart();
      alert(`第 ${i+1} 碗尚未設定辣度`);
      window.openOptions();
      return false;
    }
  }
  return true;
};

renderServiceOnce();
})();