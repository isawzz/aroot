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








