function show_account() {
	if (isdef(mBy('dAccount').firstChild)) {console.log('NOPE!'); return;}
	DA.imageChanged = false;
	let dParent = mBy('dAccount');
	clearElement(dParent);
	let d = mDiv(dParent,{matop:20});

	let dir = '../base/assets/images/';
	let imagePath = dir + (Userdata.hasImage ? Username : 'unknown_user') + '.jpg';

	d.append(createElementFromHtml(`
	<div class="wrapper" style="margin-top:5%; animation: appear 4s ease;">
	<div id="error">some text</div>
	<form id="myform" autocomplete="off" action="index.php" method="POST">
		<div id='dImage'>
			<span style="font-size:11px;">drag and drop an image to change</span><br>
			<img id="imgPreview" src='${imagePath}' ondragover="handle_drag_and_drop(event)" ondrop="handle_drag_and_drop(event)" ondragleave="handle_drag_and_drop(event)"
				style="height:200px;margin:10px;" />
		</div>
		<input id='iUsername' type="text" name="username" placeholder='username' value="${Username}" autofocus />
		<br />
		<!-- <input type="password" name="password" />
		<br /> -->
		<input type="submit" />
	</form>
	</div>
	`));
	var form = document.getElementById('myform');
	form.onsubmit = e => {
		e.preventDefault();
		let el = document.getElementById('iUsername');
		let val = el.value;
		//console.log('username is now', val, el);
		if (Username != val) {
			//console.log('username has been changed to',val);
			onClickSubmitUsernameChange(val);
		} else if (DA.imageChanged) {
			onClickSubmitImageChange();
		}
	};
}
