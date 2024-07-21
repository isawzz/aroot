//#region assets
function ensure_assets() {
	where([...arguments]);
	const asset_names = {
		'Syms': 'allSyms',
		'users': 'db_users',
		'games': 'db_games',
		'tables': 'db_tables',

	}
	//console.log('ensure_assets arguments',[...arguments])
	let list = [];
	for (const k of [...arguments]) {
		if (isdef(window[k]) || isdef(DB[k])) continue;
		let assetname = valf(asset_names[k], k);
		list.push(assetname);
	}
	//console.log('list',list);
	if (isEmpty(list)) {
		console.log('list is empty!');
		danext();

	} else assets_get(...list);
}
function reload_assets() {
	const asset_names = {
		'Syms': 'allSyms',
		'users': 'db_users',
		'games': 'db_games',
		'tables': 'db_tables',

	}
	assets_get(arguments);
}
function assets_get() {
	//console.log('assets_get arguments',[...arguments])
	where([...arguments]);
	to_server([...arguments], 'assets');
}
function assets_parse(o) {
	where(o);

	for (const k in o) {
		let text = o[k]; //supposedly just file contents as string
		//console.log('k', k);
		if (k == 'allSyms') {
			//reading Syms!
			symbolDict = Syms = jsyaml.load(text);
			SymKeys = Object.keys(Syms);
		} else if (k == 'symGSG') {
			ByGroupSubgroup = jsyaml.load(text);
		} else if (k == 'allWP') {
			WordP = jsyaml.load(text);
		} else if (k == 'fens') {
			FenPositionList = csv2list(text);
		} else if (startsWith(k, 'db_')) {
			let okey = stringAfter(k, '_');
			//console.log('DB',DB,k);
			DB[okey] = jsyaml.load(text);
			//window[capitalize(k)] = jsyaml.load(text); //default is yaml style content that translates to capitalized name as global asset
		} else {
			window[capitalize(k)] = jsyaml.load(text); //default is yaml style content that translates to capitalized name as global asset
		}
	}

	if (nundef(KeySets) && isdef(o.symGSG)) { KeySets = getKeySets(); }
}
//#endregion

//#region drag drop
function drag(e) {
	where();
	let newUsername = e.target.parentNode.getAttribute('username');
	//console.log('drag', newUsername);
	e.dataTransfer.setData("username", newUsername);
}
function handle_drag_and_drop(e) {
	//return;
	if (e.type == "dragover") {
		e.preventDefault();
		mClass(e.target, "dragging");
	} else if (e.type == "dragleave") {
		mClassRemove(e.target, "dragging");
	} else if (e.type == "drop") {
		let target = e.target;
		let id = target.id;
		mClassRemove(e.target, "dragging");
		if (id == 'profile_image') {
			let uname = e.dataTransfer.getData('username');
			load_user(uname); //to_server({ user: uname }, 'user_info', false);
			//this is coming from contacts!
			get_contacts();
		} else {
			//changing user image
			console.log('===>dropped on target:', e.target);
			e.preventDefault();
			DA.imageChanged = true;
			mClassRemove(e.target, "dragging");
			mDropImage(e, e.target);
		}
	} else {
		mClassRemove(e.target, "dragging");
	}
}
//#endregion

//#region misc helpers
function generate_table_id(gamename) {
	//wie macht man einen timestamp?
	return gamename + '_' + get_timestamp();
}
function get_image_path(userdata) {
	let p = '../base/assets/images/';
	if (userdata.image) p += userdata.name; else p += 'unknown_user';
	p += '.jpg';
	if (is_online()) p += '?=' + Date.now();
	//console.log('image path', p);
	return p;
}
function get_timestamp() { return new Date().getTime(); }


function where(o) {
	let fname = getFunctionsNameThatCalledThisFunction();
	//if (fname.includes('asset')) console.log(':',fname,isdef(o)?o:'(no data)');
	//if (fname.includes('server')) console.log(':',fname,isdef(o)?o:'(no data)');
	//if (fname.includes('user')) console.log(':',fname,isdef(o)?o:'(no data)');
	//if (fname.includes('drag')) console.log(':',fname,isdef(o)?o:'(no data)');
}
//#endregion

//region show contacts
function get_contacts(php = true) { Session.cur_menu = 'contacts'; to_server(Session.cur_user, "contacts", php); }
function present_contacts(obj) {

	let others = sync_users(obj.myusers);//after this DB.users is up-to-date![others,has_changed]

	//let hasChangedothers = Object.values(DB.users).filter(x=>x.name!=Session.cur_user);
	//console.log('others',others)
	Session.others = others.map(x => x.name);

	var inner_left_panel = mBy("inner_left_panel");
	inner_left_panel.innerHTML = createContactsContent(others, obj.msgs);
}
function createContactsContent(myusers, msgs) {
	let mydata = uiGetContactStylesAndStart();
	//console.log('\nmsgs', msgs);

	mydata += uiGetContacts(myusers, msgs);
	return mydata;
}
function uiGetContactStylesAndStart() {
	let mydata = `
	<style>
		@keyframes appear{

			0%{opacity:0;transform: translateY(50px)}
			100%{opacity:1;transform: translateY(0px)}
 		}

 		.contact{
 			cursor:pointer;
 			transition: all .5s cubic-bezier(0.68, -2, 0.265, 1.55);
	 	}

	 	.contact:hover{
	 		transform: scale(1.1);
	 	}

	</style>
	<div style="text-align: center; animation: appear 1s ease both">
  `;
	return mydata;
}
function uiGetContacts(myusers, msgs) {
	//console.log('\nmsgs', msgs);
	mydata = '';
	for (const r of myusers) {
		row = r;
		mydata += uiGetContact(row, msgs);
	}
	return mydata;
}
function uiGetContact(row, msgs = {}) {
	let image = get_image_path(row); // `../base/assets/images/${row.image ? row.name : 'unknown_user'}.jpg`;
	let mydata = `
      <div class='contact' style='position:relative;text-align:center;margin-bottom:18px;' username='${row.name}' onclick='start_chat(event)'>
        <img src='${image}' draggable='true' ondragstart='drag(event)' class='img_person sz100' style='margin:0;'/>
        <br>${row.name}`;

	if (isdef(msgs[row.username])) {
		mydata += `<div style='width:20px;height:20px;border-radius:50%;background-color:orange;color:white;position:absolute;left:0px;top:0px;'>` + msgs[row.username] + "</div>";
	}

	mydata += "</div>";
	return mydata;

}
//#endregion

//#region account && login
function get_account() {
	let udata = get_current_userdata();
	mBy("inner_left_panel").innerHTML = createAccountContent(udata);
	// to_server(Session.cur_user, "contacts", php); 
}
function get_login() {
	let udata = get_current_userdata();
	mBy("inner_left_panel").innerHTML = createLoginContent(udata);
	// to_server(Session.cur_user, "contacts", php); 
}
function addColorPicker() {
	//if (DA.colorPickerLoaded) return;
	//DA.colorPickerLoaded=true;
	let form = mBy('myform');
	let img = mBy('imgPreview');
	let picker = mColorPickerBehavior(get_user_color(), img, form,
		(a) => { console.log('new color is', a); DA.newColor = a; DA.colorChanged = true; },//d.style.background = a;DA.UserColor = a; }, 
		{ w: 322, h: 45, bg: 'green', rounding: 6, margin: 'auto', align: 'center' });

	if (is_online()) {
		img.ondragover = img.ondrop = img.ondragleave = handle_drag_and_drop;
		//hier brauch noch das drag to change image!
	}
	mBy('img_dd_instruction').style.opacity = is_online() ? 1 : 0;
	img.onload = null;
}
function collect_data() {
	var myform = mBy("myform");
	var inputs = myform.getElementsByTagName("INPUT");
	var data = {};
	for (var i = inputs.length - 1; i >= 0; i--) {
		var key = inputs[i].name;
		switch (key) {
			case "username":
			case "name":
				let uname = inputs[i].value;
				console.log(`${key} in input is`, uname);
				uname = replaceAllSpecialChars(uname, ' ', '_');
				uname = replaceAllSpecialChars(uname, '&', '_');
				uname = replaceAllSpecialChars(uname, '+', '_');
				uname = replaceAllSpecialChars(uname, '?', '_');
				uname = replaceAllSpecialChars(uname, '=', '_');
				uname = replaceAllSpecialChars(uname, '+', '_');
				uname = replaceAllSpecialChars(uname, '/', '_');
				uname = replaceAllSpecialChars(uname, '\\', '_');
				data[key] = uname.toLowerCase();
				break;
			case "motto":
				data[key] = inputs[i].value.toLowerCase();
		}
	}
	//login option
	if (isdef(data.username)) {
		if (data.username != Session.cur_user) {
			load_user(data.username);
			get_contacts();
		}
	} else if (DA.imageChanged) {
		//do the same as I did before!
		sendHtml('imgPreview', Session.cur_user);
		//DA.imageChanged = false;
	} else {
		let udata = get_current_userdata();
		let changed = false;
		if (DA.colorChanged) { udata.color = DA.newColor; changed = true; }// DA.colorChanged = false;}
		if (data.motto != udata.motto) {
			changed = true;
			udata.motto = data.motto;
			mBy('motto').innerHTML = udata.motto;
		}
		if (changed) {
			console.log('changed!');
			DA.next = get_contacts;
			db_save(); //save_users();

		}

	}


}
function createAccountContent(userdata) {
	DA.imageChanged = DA.colorChanged = false; //DA.colorPickerLoaded = false;
	//console.log('userdata', userdata);
	return `
	<div id="dAccount" style="max-width=500px; margin-top:10px; display:flex; animation: appear1 1s ease;justify-content:center; align-content:center">
		<div id="error">some text</div>
		<div style='text-align:center'>
			<form id="myform" onload='addColorPicker();' autocomplete="off" style='text-align:center;background:${userdata.color}'>
				<span id='img_dd_instruction' style="font-size:11px;">drag and drop an image to change</span><br>
				<img id="imgPreview" src='${get_image_path(userdata)}' ondragover="handle_drag_and_drop(event)" ondrop="handle_drag_and_drop(event)" ondragleave="handle_drag_and_drop(event)"
					style="height:200px;margin:10px;" />
				<input id='iUsername' type="text" name="motto" placeholder='motto' value="${userdata.motto}" autofocus
					onkeydown="if (event.keyCode === 13){event.preventDefault();collect_data(event);}" />
				<br />
				<input id='save_settings_button' type="button" value="Submit" onclick="collect_data(event)" ><br>
			</form>
	</div></div>
	`; //onload='addColorPicker(${userdata.color})' 
}

function createLoginContent(userdata) {
	//console.log('login: userdata', userdata);
	return `
	<div id="dAccount" style="max-width=500px; margin-top:10px; display:flex; animation: appear1 1s ease;justify-content:center; align-content:center">
		<div id="error">some text</div>
		<div style='text-align:center'>
			<form id="myform" autocomplete="off" style='text-align:center;background:${userdata.color}'>
				<img id="imgPreview" src='${get_image_path(userdata)}' style="height:200px;margin:10px;" />
				<input id='iUsername' type="text" name="username" placeholder='username' value="${userdata.name}" autofocus
					onkeydown="if (event.keyCode === 13){event.preventDefault();console.log('WTF!!!!!!!!!!!!!!!!!!!!!!!!!!!!');collect_data(event);}" />
				<br />
				<input id='save_settings_button' type="button" value="Submit" onclick="collect_data(event)" ><br>
			</form>
	</div></div>
	`;
}
function sendHtml(id, filename) {
	//console.log('_______________HALLO!!!!')
	window.scrollTo(0, 0);
	html2canvas(document.getElementById(id)).then(function (canvas) {
		let imgData = canvas.toDataURL("image/jpeg", 0.9);
		var profile_image = mBy("profile_image");
		profile_image.src = imgData;
		mBy('imgPreview').src = imgData;
		var ajax = new XMLHttpRequest();
		ajax.open("POST", "server/save_url_encoded_image.php", true);
		ajax.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		//ajax.setRequestHeader("Cache-Control", "no-cache"); das ist es nicht!!!!!!!!!!!!!!!!!!!
		ajax.send("image=" + canvas.toDataURL("image/jpeg", 0.9) + "&filename=" + filename + ".jpg");
		ajax.onreadystatechange = function () {
			if (this.readyState == 4 && this.status == 200) {
				//console.log('RESPONSE IMAGE UPLOAD!!!!!!!', this.responseText);
				let udata = get_current_userdata();
				if (!udata.image) { udata.image = true; db_save(); } //save_users(); }
				get_contacts();
				//window.location.replace('index.html');
			}
		};
	});
}
//#endregion

//#region NEW login

function get_login_new(php = true) { to_server(Session.cur_user, "login_new", php); }
function present_login_new(obj) {

	let others = sync_users(obj.myusers);//after this DB.users is up-to-date![others,has_changed]

	//let hasChangedothers = Object.values(DB.users).filter(x=>x.name!=Session.cur_user);
	//console.log('others',others)
	Session.others = others.map(x => x.name);

	var inner_left_panel = mBy("inner_left_panel");
	inner_left_panel.innerHTML = createLoginNewContent(others, obj.msgs);
}
function createLoginNewContent(myusers, msgs) {
	let mydata = uiGetLoginNewStylesAndStart();
	//console.log('\nmsgs', msgs);

	mydata += uiGetLoginNewList(myusers, msgs);
	return mydata;
}
function uiGetLoginNewStylesAndStart() {
	let mydata = `
	<style>
		@keyframes appear{

			0%{opacity:0;transform: translateY(50px)}
			100%{opacity:1;transform: translateY(0px)}
 		}

 		.contact{
 			cursor:pointer;
 			transition: all .5s cubic-bezier(0.68, -2, 0.265, 1.55);
	 	}

	 	.contact:hover{
	 		transform: scale(1.1);
	 	}

	</style>
	<div style="text-align: center; animation: appear 1s ease both">
  `;
	return mydata;
}
function uiGetLoginNewList(myusers, msgs) {
	//console.log('\nmsgs', msgs);
	mydata = '';
	for (const r of myusers) {
		row = r;
		mydata += uiGetLoginNew(row, msgs);
	}
	return mydata;
}
function uiGetLoginNew(row, msgs = {}) {
	let image = get_image_path(row); // `../base/assets/images/${row.image ? row.name : 'unknown_user'}.jpg`;
	let mydata = `
      <div class='contact' style='position:relative;text-align:center;margin-bottom:18px;' username='${row.name}' 
				onclick='onclick_user_login_new(event)'>
        <img src='${image}' draggable='true' ondragstart='drag(event)' class='img_person sz100' style='margin:0;'/>
        <br>${row.name}`;

	if (isdef(msgs[row.username])) {
		mydata += `<div style='width:20px;height:20px;border-radius:50%;background-color:orange;color:white;position:absolute;left:0px;top:0px;'>` + msgs[row.username] + "</div>";
	}

	mydata += "</div>";
	return mydata;

}

//#endregion


//#region intro

function param_present_contacts(obj, dParent, onclick_func_name) {
	let others = sync_users(obj.myusers);//after this DB.users is up-to-date![others,has_changed]
	Session.others = others.map(x => x.name);
	let msgs = valf(obj.msgs, {});
	let mydata = `
	<style>
		@keyframes appear{

			0%{opacity:0;transform: translateY(50px)}
			100%{opacity:1;transform: translateY(0px)}
 		}

 		.contact{
 			cursor:pointer;
 			transition: all .5s cubic-bezier(0.68, -2, 0.265, 1.55);
	 	}

	 	.contact:hover{
	 		transform: scale(1.1);
	 	}

	</style>
	<div style="text-align: center; animation: appear 1s ease both">
  `;

	let mydata_list = '';
	for (const r of others) {
		row = r;
		let image = get_image_path(row); // `../base/assets/images/${row.image ? row.name : 'unknown_user'}.jpg`;
		let mydata_element = `
				<div class='contact' style='position:relative;text-align:center;margin-bottom:18px;' username='${row.name}' 
					onclick='${onclick_func_name}(event)'>
					<img src='${image}' draggable='true' ondragstart='drag(event)' class='img_person sz100' style='margin:0;'/>
					<br>${row.name}`;

		if (isdef(msgs[row.username])) {
			mydata_element += `<div style='width:20px;height:20px;border-radius:50%;background-color:orange;color:white;position:absolute;left:0px;top:0px;'>` + msgs[row.username] + "</div>";
		}

		mydata_element += "</div>";
		mydata_list += mydata_element;
	}

	mydata += mydata_list;
	dParent.innerHTML = mydata;
}
//#endregion









