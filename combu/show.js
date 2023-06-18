function showError(msg){ mFleet(msg,dError,2000);}
function mFleet(msg,d,ms=2000){
  let d1=mDiv(d,{bg:'inherit',fg:'inherit'},null,msg);
  let a=mAnimate(d1, 'opacity', [1, 0], () => { mRemove(d1);  }, ms); 
}
function mFleetHoldSpace(msg,d,ms=2000){mFleetHold(msg,d,ms,'&nbsp;');}
function mFleetHold(msg,d,ms=2000,leave='&nbsp;'){
  let d1=mDiv(d,{},null,msg);
  let a=mAnimate(d1, 'opacity', [1, 0], () => { mRemove(d1);  }, ms); 
}
function showEssay(dParent,title){
  mClear(dParent);  
  let text = Essays[title];
  let paras = text.split('<br>');
  mDom(dParent,{hpadding:20},{tag:'h1',html:title});
  //mDiv(dParent,{hpadding:20,box:true},null,`<h1>${title}</h1>`);
  for(const para of paras){
    mDom(dParent,{hpadding:20},{tag:'p',html:para});
  }
}
function showQuery(d,verbose=true){
  if (!verbose){
    var query = window.location.search.substring(1);
    d.innerHTML = `querystring: ${query}`;
    return;
  }
  let di = queryDict();
  let html = '';
  for(const k in di) html+=`${k}=${di[k]}<br>`;
  d.innerHTML = html;
  return;

  //console.log(isdef(undefined));
  //mButton('Welcome!',phpPost)
  //phpStart('index')
  turnOffAutocomplete();
  //mBy('dMain').innerHTML = 'HELLO!!! ' + location.search;
  //window.location.href = `../comm/logout.php`;
}









