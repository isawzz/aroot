function loginCheck(o){
	if (o.status == 'loggedin'){
		startLoggedIn(o);
	}else if (o.status == 'wrong_pwd'){
		showError('wrong password!!!');
	}else if (o.status == 'not_registered'){
		showError(`user ${o.id} not registered!!!`);
	}
}
function handleResult(result, cmd) {
	if (result.trim() == "") return;
	let obj;
	try { obj = JSON.parse(result); } catch { console.log('ERROR:', result); }
	DA.result = jsCopy(obj);
	switch (cmd) {
		case "login": loginCheck(obj); break;
	}
}

function phpPost(data, cmd) {
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







