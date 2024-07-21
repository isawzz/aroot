function bw_master_password_check() {
	//console.log('bw_master_password_check!!!!!!!!!!!!!!!!!',S);
	let pw = mBy('inputPassword').value;
	//console.log('entered password:', pw);
	if (pw == S.master_password) {
		//user entered master password
		//set_boa_score(1);
		S.bw_state = 'loggedin';
		toggle_bw_symbol();
		hide('dPopup');
		//console.log('DA',DA.challenge,DA.name)
		if (DA.name == 'Password') { 
			//console.log('sollte show!!!!!!!!!!!!!!!!!!');
			show_eval_message(true); DA.name=DA.challenge = null;
		}

		//change to other symbol!!!
		//soll ich den bw_state saven? erst bei langem pwd

	} else if (DA.name == 'Password') { 
		//failed Password challenge!
		//set_boa_score(-1);
		DA.name=DA.challenge = null;
		show_eval_message(false,`Fail! the password is ${S.master_password}`); 
		mBy('inputPassword').value = '';
		hide('dPopup');
		//hide('dPopup');
	} else {
		//set_boa_score(-1);
		let d = mBy('bw_login_status');
		d.innerHTML = 'Incorrect Master Password';
		
	}


}


function bw_master_password_renew() {
	//console.log('bw_master_password_renew');

	let [inp1, inp2] = [document.getElementById('inputPassword'), document.getElementById('inputPassword2')];
	let pw = inp1.value;
	let pw2 = inp2.value;
	let letters = toLetters(pw);
	let minlen = 8;
	let correct = false;
	let d = mBy('dError');
	if (pw.length < minlen) {
		d.innerHTML = `password needs to be at least ${minlen} long!`;
	} else if (!letters.find(x => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.includes(x))) {
		d.innerHTML = 'password needs to contain at least 1 uppercase letter!';
	} else if (!letters.find(x => '0123456789'.includes(x))) {
		d.innerHTML = 'password needs to contain at least 1 digit!';
	} else if (isAlphaNum(pw)) {
		d.innerHTML = 'password needs to contain at least 1 special symbol!';
	} else if (pw !== pw2) {
		d.innerHTML = 'passwords do not match';
	} else correct = true;
	if (correct) {
		console.log('new password has been set!', pw);
		S.master_password = pw;
		boa_save();
		hide('dPopup');
		show_eval_message(true,`Password has been set to ${pw}`);	DA.challenge = DA.name = null;

		//toggle_bw_symbol();
	}else{
		//console.log('WRONG!!!!!!!!!!!!!!!!!!!!!!!!!!')
		inp1.value = inp2.value = '';
		inp1.focus();
	}

}











