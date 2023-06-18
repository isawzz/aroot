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
