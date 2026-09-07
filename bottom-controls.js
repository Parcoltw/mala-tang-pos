(()=>{
  const summary=document.querySelector('.summary');
  const add=document.getElementById('addBowlBtn');
  const set=document.getElementById('setOptionsBtn');
  const remove=document.getElementById('removeBowlBtn');
  if(!summary||!add||!set||!remove)return;

  const oldRow=add.closest('.toolRow');
  let row=document.getElementById('bottomBowlActions');
  if(!row){
    row=document.createElement('div');
    row.id='bottomBowlActions';
    row.className='bowlActions';
    summary.insertBefore(row,summary.firstChild);
  }

  add.textContent='＋ 新增一碗';
  set.textContent='設定本碗';
  remove.textContent='刪除本碗';
  row.append(add,set,remove);
  if(oldRow&&oldRow!==row&&oldRow.children.length===0)oldRow.remove();

  const style=document.createElement('style');
  style.textContent=`
    .summary{background:#fff;position:sticky;bottom:0;z-index:4}
    .bowlActions{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-bottom:10px}
    .bowlActions button{padding:11px 6px;font-size:14px;min-height:44px}
  `;
  document.head.appendChild(style);
})();