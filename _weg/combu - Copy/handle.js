function handleLogin(o){
	if (o.status == 'loggedin'){
		//console.log('o',o)
    showSuccessMessage('login successful!');
    showLoggedin(o);
		startLoggedIn(o);
	}else if (o.status == 'wrong_pwd'){
		showError('wrong password!!!');
	}else if (o.status == 'not_registered'){
		showError(`user ${o.id} not registered!!!`);
    showPopupRegister();
	}
}
function handleLogout(o){
  //console.log('handleLogout',o)
	showLogin();
}
function handleRegister(o){
  //console.log('got register result!!!',o)
	if (o.status == 'registered'){
    showSuccessMessage('new registration successful!');
    mBy('dRegister').remove();

	}else if (o.status == 'duplicate'){
		showError('username already registered!!!');
	}else if (o.status == 'pwds_dont_match'){
		showError(`passwords do not match!!!`);
	}

}
function handleResult(result, cmd) {
  //console.log('result',result)
  let obj = isEmptyOrWhiteSpace(result)?{a:1}:JSON.parse(result); 
  DA.result = jsCopy(obj);
  switch (cmd) {
    case "login": handleLogin(obj); break;
    case "logout": handleLogout(obj); break;
    case "register": handleRegister(obj); break;
  }
}
