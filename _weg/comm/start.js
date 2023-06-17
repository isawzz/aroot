
async function start(){
  [dStatus,dHeader,dTable,dFooter]=rowLayout('dMain','auto auto 1fr auto');
  showQuery(dStatus,false);

  

  
  // if (getQuerystring('loggedin')){

  // }
}
function rowLayout(dParent,s){
  dParent = toElem(dParent);
  let rows=s.split(' ');
  let numRows=rows.length;
  mStyle(dParent,{display:'grid',})
  dParent.style.gridTemplateRows = s; //'repeat(' + rows + ',1fr)';
  let res = [];
  for(const i of range(numRows)){
    let d=mDiv(dParent,{bg:rColor()},null,'hallo');
    res.push(d)
  }
  return res;
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

















