

function contacts_2handleResult(result) {
	let d = mBy('dContacts');
	mCenterCenterFlex(d);
	d.innerHTML = JSON.parse(result).message;
}

function presentInContactMenu(result,d1){
	let d2 = mDiv(d1,{position:'relative'},null,null,'contact'); 
	d2.setAttribute('username',result.username);
	let dir = '../base/assets/images/';
	let path = dir + (result.hasImage ? result.username : 'unknown_user') + '.jpg';
	let img = mImg(path, d2, {});
	let name  = mText(result.username,d2);
	return d2;
}
