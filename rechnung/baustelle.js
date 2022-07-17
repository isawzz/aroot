
function focusNextSiblingOrSubmitOnEnter(ev, id) {
	if (ev.key === 'Enter') {
		ev.preventDefault();
		let el = mBy(id); let tag = el.tagName.toLowerCase();
		//console.log('enter', mBy(id), mBy(id).tagName);
		if (tag == 'input') el.focus();
		else if (tag == 'form') {
			//console.log('should submit!!!!');
			el.submit();
		}
	}
}
function bw_set_new_password_popup() {
	let w = 200;
	let html = `
		<div id="dBw" class="mystyle" style="background:silver;padding:12px">
		<h2 style="text-align:center">Set New Master Password</h2>
		<div id="dBWLogin" style="text-align:right">
				<form action="javascript:bw_master_password_renew()" id="fBitwarden">
					<label for="inputPassword">New Password:</label>
					<input style="width:${w}px" type="password" id="inputPassword" placeholder="" onkeydown="focusNextSiblingOrSubmitOnEnter(event,'inputPassword2')" />
					<br><br><label for="inputPassword2">Repeat Password:</label>
					<input style="width:${w}px" type="password" id="inputPassword2" placeholder="" onkeydown="focusNextSiblingOrSubmitOnEnter(event,'fBitwarden')" />
					<br>
					<div id="dError" style="color:yellow;background:red;text-align:center;margin-top:4px;padding:0px 10px;box-sizing:border-box"></div>
					<br><button onclick="bw_master_password_renew()" >Submit</button>
				</form>
			</div>
		</div>
	`;
	let d = mCreateFrom(html);
	let dParent = mBy('dPopup');
	show(dParent);
	mClear(dParent);
	mStyle(dParent, { top: 50, right: 10 });
	mAppend(dParent, d);
	document.getElementById("inputPassword").focus();
}













