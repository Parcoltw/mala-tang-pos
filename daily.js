(()=>{
const dayKey=(value)=>{
  const d=value instanceof Date?value:new Date(value);
  return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
};
const dayLabel=(key)=>key.replaceAll('-','/');

// 每日流水號：內用、外帶完全共用同一組號碼。
// 每天都依實際結帳時間重新編成 001、002、003...
function normalizeOrderNumbers(){
  const groups={};
  records.forEach(r=>{
    const k=dayKey(r.time);
    (groups[k]??=[]).push(r);
  });
  let changed=false;
  Object.values(groups).forEach(rs=>{
    rs.sort((a,b)=>new Date(a.time)-new Date(b.time));
    rs.forEach((r,i)=>{
      const no=i+1;
      if(Number(r.orderNo)!==no){r.orderNo=no;changed=true;}
    });
  });
  if(changed)saveRecords();
}

function nextOrderNo(){
  normalizeOrderNumbers();
  const today=dayKey(new Date());
  return records.filter(r=>dayKey(r.time)===today).length+1;
}

normalizeOrderNumbers();

const checkout=document.getElementById('checkout');
checkout.onclick=()=>{
  if(!Object.keys(cart).length){alert('目前沒有商品');return}
  const c=Number(cash.value||0);
  if(c&&c<total()){alert('收款金額不足');return}
  if(!pendingOptions){openOptions();return}

  const no=nextOrderNo();
  const rec={
    id:Date.now(),
    orderNo:no,
    time:new Date().toISOString(),
    amount:total(),
    service:pendingOptions.service,
    spice:pendingOptions.spice,
    oil:pendingOptions.oil||'',
    bowl:pendingOptions.bowl||'',
    utensils:pendingOptions.utensils||'',
    items:cartText()
  };

  records.unshift(rec);
  saveRecords();
  alert(`結帳完成\n今日單號：${String(no).padStart(3,'0')}\n${rec.service}\n總計：$${rec.amount}${c?`\n找零：$${c-rec.amount}`:''}`);
  cart={};cash.value='';pendingOptions=null;renderCart();
};

window.renderHistory=()=>{
  normalizeOrderNumbers();
  document.getElementById('statCount').textContent=records.length;
  document.getElementById('statRevenue').textContent='$'+records.reduce((s,r)=>s+Number(r.amount||0),0);

  const list=document.getElementById('historyList');
  list.innerHTML='';
  if(!records.length){
    list.innerHTML='<div class="empty">尚無結帳紀錄</div>';
    return;
  }

  const groups={};
  records.forEach(r=>{
    const k=dayKey(r.time);
    (groups[k]??=[]).push(r);
  });

  Object.keys(groups).sort().reverse().forEach(k=>{
    const rs=groups[k].sort((a,b)=>new Date(b.time)-new Date(a.time));
    const dailyTotal=rs.reduce((s,r)=>s+Number(r.amount||0),0);
    const section=document.createElement('section');
    section.style.cssText='margin:14px 0 18px';
    section.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:end;border-bottom:2px solid #111;padding:7px 2px;font-weight:900"><span>${dayLabel(k)}</span><span>${rs.length} 筆・$${dailyTotal}</span></div>`;

    rs.forEach(r=>{
      const d=document.createElement('div');
      d.className='record';
      d.innerHTML=`<div class="recordHead"><span>#${String(r.orderNo||0).padStart(3,'0')}　${r.service}・${r.spice}</span><span>$${r.amount}</span></div><div class="recordMeta">${localTime(r.time)}${r.oil?'・'+r.oil:''}${r.bowl?'・'+r.bowl:''}${r.utensils?'・'+r.utensils:''}</div><div class="recordItems">${r.items||''}</div><div class="recordBtns"><button class="ghost" data-edit>修改</button><button class="ghost" data-del>刪除</button></div>`;
      d.querySelector('[data-edit]').onclick=()=>openEdit(r.id);
      d.querySelector('[data-del]').onclick=()=>{
        if(confirm('確定刪除這筆結帳紀錄？')){
          records=records.filter(x=>x.id!==r.id);
          normalizeOrderNumbers();
          saveRecords();
          renderHistory();
        }
      };
      section.appendChild(d);
    });
    list.appendChild(section);
  });
};

document.getElementById('historyBtn').onclick=()=>{
  renderHistory();
  document.getElementById('historyDlg').showModal();
};
})();