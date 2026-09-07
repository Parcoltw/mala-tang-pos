(()=>{
try{
  if(typeof items!=='undefined' && Array.isArray(DEFAULT_ITEMS) && (!Array.isArray(items) || items.length===0)){
    items=DEFAULT_ITEMS.map(x=>[...x]);
    localStorage.setItem('posItems',JSON.stringify(items));
    if(typeof renderCats==='function')renderCats();
    if(typeof renderGrid==='function')renderGrid();
  }
}catch(e){console.error('menu restore failed',e)}
})();