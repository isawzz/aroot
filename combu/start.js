
async function start(){
  bisJetzt(); 


}
function onclickLogin(){

}
function bisJetzt(){
  //mStyle('dMain',{box:true,padding:12})
  let dp=mDiv('dMain');
  [dStatus,dHeader,dTable,dFooter]=rowLayout(dp,'auto auto 1fr auto');
  [dLogo,dTop,dLogin]=colLayout(dHeader,'auto 1fr auto');
  showQuery(dStatus,false);

  if (!getQuerystring('id')){
    showEssay(dTable,'The necessity of community');
    mButton(dLogin,)
  }

  mStyle('dMain',{xover:'hidden'});
  //setTimeout(remremrem,10);
}
function remremrem(){
  mStyle('dMain',{xover:'hidden'});
  return;
  let tags = ['div']; // ['h1','grid','div','p','br'];
  for(const tag of tags){
    let divs = document.getElementsByTagName(tag);
    for(const div of divs){
      console.log('div',div)
      mStyle(div,{xover:'hidden'});
      //if (tag == 'div') mStyle(div,{wmax:'90%'})
    }
    
  }


}
function rowLayout(dParent,s){
  dParent = toElem(dParent);
  let rows=s.split(' ');
  let numRows=rows.length;
  mStyle(dParent,{display:'grid'})
  dParent.style.gridTemplateRows = s; //'repeat(' + rows + ',1fr)';
  let res = [];
  for(const i of range(numRows)){
    let d=mDiv(dParent,{bg:rColor(),fg:'contrast'},null,'hallo');
    res.push(d)
  }
  return res;
}
function colLayout(dParent,s){
  dParent = toElem(dParent);
  let rows=s.split(' ');
  let numRows=rows.length;
  mStyle(dParent,{display:'grid'})
  dParent.style.gridTemplateColumns = s; //'repeat(' + rows + ',1fr)';
  let res = [];
  for(const i of range(numRows)){
    let d=mDiv(dParent,{bg:rColor(),fg:'contrast'},null,'hallo');
    res.push(d)
  }
  return res;
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
function turnOffAutocomplete(){
  let fields = location.search;
  mBy('dMain').innerHTML += '<br>HELLO!!! ' + location.search;
}
function getQuerystring(key) {
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    if (pair[0] == key) {
      return pair[1];
    }
  }
  return null;
}
function queryDict() {
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  let di={};
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    if (isdef(pair[1])) di[pair[0]]=pair[1];
  }
  return di;
}

















