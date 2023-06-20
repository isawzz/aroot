function uiColLayout(dParent,s){
  dParent = toElem(dParent);
  mClear(dParent)
  let rows=s.split(' ');
  let numRows=rows.length;
  mStyle(dParent,{display:'grid'})
  dParent.style.gridTemplateColumns = s; //'repeat(' + rows + ',1fr)';
  let res = [];
  for(const i of range(numRows)){
    let d=mDiv(dParent); //,{},null,'COL'); //,{bg:rColor(),fg:'contrast'});
    res.push(d)
  }
  //console.log('res',res)
  return res;
}
function uiRowLayout(dParent,s){
  dParent = toElem(dParent);
  mClear(dParent)
  let rows=s.split(' ');
  let numRows=rows.length;
  mStyle(dParent,{display:'grid'})
  dParent.style.gridTemplateRows = s; //'repeat(' + rows + ',1fr)';
  let res = [];
  for(const i of range(numRows)){
    let d=mDiv(dParent); //,{},null,'ROW'); //,{bg:rColor(),fg:'contrast'},null,'ROW');
    res.push(d)
  }
  return res;
}
