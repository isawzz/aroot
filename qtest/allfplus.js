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
function handleAddEvent(obj){
  Config.events.push(obj.event); 
  localStorage.setItem('events', JSON.stringify(Config.events));
  //downloadAsYaml(Config.events,'events'); //testing

}
function handleLogin(o) {
  if (o.status == 'loggedin') {
    //console.log('o',o)
    showSuccessMessage('login successful!');
    showLoggedin(o);
    startLoggedIn(o);
  } else if (o.status == 'wrong_pwd') {
    showError('wrong password!!!');
  } else if (o.status == 'not_registered') {
    showError(`user ${o.id} not registered!!!`);
    showPopupRegister();
  }
}
function handleLogout(o) {
  //console.log('handleLogout',o)
  showLogin();
}
function handleRegister(o) {
  //console.log('got register result!!!',o)
  if (o.status == 'registered') {
    showSuccessMessage('new registration successful!');
    mBy('dRegister').remove();

  } else if (o.status == 'duplicate') {
    showError('username already registered!!!');
  } else if (o.status == 'pwds_dont_match') {
    showError(`passwords do not match!!!`);
  }

}
function handleResult(result, cmd) {
  //console.log('result',result);//return;
  let obj = isEmptyOrWhiteSpace(result) ? { a: 1 } : JSON.parse(result);
  //dates should be converted to dates, numbers should be converted to numbers
  DA.result = jsCopy(obj);
  switch (cmd) {
    case "login": handleLogin(obj); break;
    case "logout": handleLogout(obj); break;
    case "register": handleRegister(obj); break;
    case "assets": loadAssetsPhp(obj); startWithAssets(); break;
    case "addEvent": handleAddEvent(obj); break;
    default:
      for (const k in obj) {
        console.log(k, obj[k], typeof obj[k])
      }
  }
}
async function loadAll() {
  detectSessionType();
  if (DA.sessionType == 'live') {
    //load assets the live way form localhost
    await loadAssetsLive('../qtest/');
    let events = DB.events = DB.events.map(x => x.date = new Date(x.date));
    //console.log('users', DB.users)
    //console.log('events', events)
    //console.log('subscribed', DB.subscribed)
    startWithAssets();
  } else {
    phpPost({}, 'assets');
  }
}
async function loadAssetsLive(projectPath, basepath = '../base/') {
  let path = basepath + 'assets/';
  Config = DB = await route_path_yaml_dict(projectPath + 'config.yaml');

  localStorage.clear();
  let events = localStorage.getItem('events');
  Config.events = events ? JSON.parse(events) : [];
  console.log('events',Config.events)
  let users = localStorage.getItem('users');
  Config.users = users ? JSON.parse(users) : [];
  let subscribed = localStorage.getItem('subscribed');
  Config.subscribed = subscribed ? JSON.parse(subscribed) : [];
  Syms = await route_path_yaml_dict(path + 'allSyms.yaml');
  SymKeys = Object.keys(Syms);
  ByGroupSubgroup = await route_path_yaml_dict(path + 'symGSG.yaml');
  C52 = await route_path_yaml_dict(path + 'c52.yaml');
  Cinno = await route_path_yaml_dict(path + 'fe/inno.yaml');
  Info = await route_path_yaml_dict(path + 'lists/info.yaml');
  create_card_assets_c52();
  KeySets = getKeySets();
  // console.assert(isdef(Config), 'NO Config!!!!!!!!!!!!!!!!!!!!!!!!');
  // return { users: dict2list(DB.users, 'name'), games: dict2list(Config.games, 'name'), tables: [] };
}
function loadAssetsPhp(obj) {
  console.log('obj', obj)
  Config = jsyaml.load(obj.config);
  Config.events = obj.events;
  Config.users = obj.users;
  Config.subscribed = obj.subscribed;
  console.log('Config',Config)
  Syms = jsyaml.load(obj.syms);
  SymKeys = Object.keys(Syms);
  ByGroupSubgroup = jsyaml.load(obj.symGSG);
  C52 = jsyaml.load(obj.c52);
  Cinno = jsyaml.load(obj.cinno);
  Info = jsyaml.load(obj.info);
  Sayings = jsyaml.load(obj.sayings);
  create_card_assets_c52();
  KeySets = getKeySets();
  //console.log('Sayings',Sayings);
  // assertion(isdef(Config), 'NO Config!!!!!!!!!!!!!!!!!!!!!!!!');
}
function maButton(caption, handler, dParent, styles, classes) {
  let a = mLink("javascript:void(0)", dParent, styles, null, caption, classes);
  a.onclick = handler;
  if (isdef(styles)) mStyle(a, styles);
  return a;
}
function mFlexLine(d, bg = 'white', fg = 'contrast') {
  //console.log('h',d.clientHeight,d.innerHTML,d.offsetHeight);
  mStyle(d, { bg: bg, fg: fg, display: 'flex', valign: 'center', hmin: measureHeight(d) });
  mDiv(d, { fg: 'transparent' }, null, '|')
}
function measureHeight(d) {
  let d2 = mDiv(d, { opacity: 0 }, null, 'HALLO');
  return d2.clientHeight;
}
function phpPost(data, cmd) { if (DA.sessionType != 'live') { _phpPost(data, cmd); } else { phpSim(data, cmd); } }
function _phpPost(data, cmd) {
  var o = {};
  o.data = valf(data, {});
  o.cmd = cmd;
  o = JSON.stringify(o);

  var xml = new XMLHttpRequest();
  xml.onload = function () {
    if (xml.readyState == 4 || xml.status == 200) {
      handleResult(xml.responseText, cmd);
    } else { console.log('WTF?????') }
  }
  xml.open("POST", "php/api.php", true);
  xml.send(o);
}
function queryDict() {
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  let di = {};
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    if (isdef(pair[1])) di[pair[0]] = pair[1];
  }
  return di;
}









