
function close_image(e) {
	e.target.className = "image_off";
}
function collect_data() {
	//var save_account_button = mBy("save_account_button");
	//save_account_button.disabled = true;
	//save_account_button.value = "Loading...Please wait..";
	var myform = mBy("myform");
	var inputs = myform.getElementsByTagName("INPUT");
	var data = {};
	for (var i = inputs.length - 1; i >= 0; i--) {
		var key = inputs[i].name;
		switch (key) {
			case "username":
				let uname = inputs[i].value;
				console.log('username in input is',uname);
				uname = replaceAllSpecialChars(uname, ' ', '_');
				uname = replaceAllSpecialChars(uname, '&', '_');
				uname = replaceAllSpecialChars(uname, '+', '_');
				uname = replaceAllSpecialChars(uname, '?', '_');
				uname = replaceAllSpecialChars(uname, '=', '_');
				uname = replaceAllSpecialChars(uname, '+', '_');
				uname = replaceAllSpecialChars(uname, '/', '_');
				uname = replaceAllSpecialChars(uname, '\\', '_');
				data.username = uname.toLowerCase();
				break;
			case "email":
				data.email = inputs[i].value;
				break;
			case "password":
				data.password = inputs[i].value;
				break;
			case "password2":
				data.password2 = inputs[i].value;
				break;
		}
	}
	if (data.username == Username && DA.colorChanged) {
		U.settings.userColor = DA.newColor;
		DA.colorChanged = false;
		save_user();
	}
	if (data.username != Username) {
		//console.log('submitting', data);
		//return;
		window.location = "index.html?user=" + data.username;
	} else if (DA.imageChanged) {
		//do the same as I did before!
		sendHtml('imgPreview', Username);
		DA.imageChanged = false;
	} else {
		get_contacts();
	}

}
function db_save() {
	let txt = jsyaml.dump(DB);

	//console.log('saving db!', txt.substring(0, 100));
	get_data({ db: txt }, 'dbsave');
}
function delete_message(e) {
	if (confirm("Are you sure you want to delete this message??")) {
		var msgid = e.target.getAttribute("msgid");
		get_data({
			rowid: msgid
		}, "delete_message");
		get_data({
			username: CURRENT_CHAT_USER,
			seen: SEEN_STATUS
		}, "chats_refresh");
	}
}
function delete_thread(e) {
	if (confirm("Are you sure you want to delete this whole thread??")) {
		get_data({
			username: CURRENT_CHAT_USER
		}, "delete_thread");
		get_data({
			username: CURRENT_CHAT_USER,
			seen: SEEN_STATUS
		}, "chats_refresh");
	}
}
function drag(e) {
	let newUsername = e.target.parentNode.getAttribute('username');
	e.dataTransfer.setData("username", newUsername);
}
function enter_pressed(e) { if (e.keyCode == 13) { send_message(e); } set_seen(); }
function ensure_assets(obj) {
	if (nundef(DB)) {
		//console.log('obj',obj)
		DB = jsyaml.load(obj.db);
		symbolDict = Syms = jsyaml.load(obj.syms);
		SymKeys = Object.keys(Syms);
		ByGroupSubgroup = jsyaml.load(obj.symGSG);
		WordP = jsyaml.load(obj.allWP);
		C52 = jsyaml.load(obj.c52);
		Cinno = jsyaml.load(obj.cinno);
		FenPositionList = csv2list(obj.fens);
		//console.log('FenPositionList',FenPositionList);
		KeySets = getKeySets();
	}
	console.assert(isdef(DB), 'NO DB!!!!!!!!!!!!!!!!!!!!!!!!!!!');
}
function get_account() { get_data({}, "account"); }
function get_contacts(e) { get_data({}, "contacts"); }
function get_chat(e) { get_data({ username: CURRENT_CHAT_USER }, "chats"); }
function get_play(e) {
	get_data({ username: Username, gamename: CURRENT_GAME, assets: nundef(Syms) }, "play");
	//console.log('supposedly getting game data!'); 
}
function get_data(find, type) {
	var xml = new XMLHttpRequest();
	var loader_holder = mBy("loader_holder");
	loader_holder.className = "loader_on";
	xml.onload = function () {
		if (xml.readyState == 4 || xml.status == 200) {
			loader_holder.className = "loader_off";
			handle_result(xml.responseText, type);
		}
	}
	var data = {};
	data.find = find;
	data.data_type = type;
	data = JSON.stringify(data);
	xml.open("POST", "server/api.php", true);
	//if (type == 'user_info') xml.setRequestHeader("Cache-Control", "no-cache, no-store, max-age=0");
	//xml.setRequestHeader("Cache-Control", "no-cache, no-store, must-revalidate");
	xml.send(data);
}
function get_games() {
	//console.log('supposedly loading games!');
	let d = mBy('inner_left_panel');
	d.innerHTML = "GAMES ARE DISPLAYED HERE!";
	get_data({ assets: nundef(Syms) }, 'games');
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
		if (id == 'profile_image') {
			let uname = e.dataTransfer.getData('username');
			console.log('username', uname);
			window.location = "index.html?user=" + uname;
			return;
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
function handle_result(result, type) {
	//console.log('type', type, '\nresult', result); //return;
	if (result.trim() == "") return;

	var obj = JSON.parse(result);
	console.log('obj',obj);

	switch (obj.data_type) {
		case "user_info":
			ensure_assets(obj);
			obj = obj.message;
			var username = mBy("username");
			Username = username.innerHTML = mBy('mini_username').innerHTML = obj.username;
			var email = mBy("email");
			email.innerHTML = obj.email;
			var profile_image = mBy("profile_image");
			profile_image.src = mBy('mini_profile_img').src = obj.imagePath + '?=' + Date.now();

			loadUFromDB(Username);

			//console.log('NOW!!!');
			let StartIn = Session.currentMenu; window['get_' + StartIn](); mBy("radio_" + StartIn).checked = true;
			//get_data({}, "contacts"); mBy("radio_contacts").checked = true;	// get_play(); mBy("radio_play").checked = true;
			console.assert(isdef(U) && isdef(U.settings.userColor), 'U not defined after loading user!');

			break;
		case "contacts":
			console.log('\nobj', obj);
			var inner_left_panel = mBy("inner_left_panel");
			//inner_left_panel.innerHTML = obj.message;
			inner_left_panel.innerHTML = createContactsContent(obj.myusers, obj.msgs);
			break;
		case "games":
			ensure_assets(obj);
			//console.log('DB', DB);
			//console.log('Syms', Syms);
			mBy('inner_left_panel').innerHTML = createGamesContent(dict2list(DB.games), obj.tables);
			mCenterCenterFlex(mBy('game_menu'));
			break;
		case "chats":
			if (isEmpty(CURRENT_CHAT_USER)) CURRENT_CHAT_USER = obj.other.username;
			console.log('CURRENT_CHAT_USER',CURRENT_CHAT_USER);
			SEEN_STATUS = false;
			var inner_left_panel = mBy("inner_left_panel");
			inner_left_panel.innerHTML = obj.mydata;
			inner_left_panel.innerHTML = createMessageContent(obj.messages, obj.me, obj.other);//***** */
			var messages_holder = mBy("messages_holder");
			setTimeout(function () {
				messages_holder.scrollTo(0, messages_holder.scrollHeight);
				var message_text = mBy("message_text");
				message_text.focus();
			}, 100);
			break;
		case "send_message":
			sent_audio.play();
			get_chat();
			break;
		case "play":
			ensure_assets(obj);
			//console.log('NOW IN PLAY!');
			game_resume_or_start();
			break;
		case 'account':
			//createAccountContent1(obj.message);
			mBy("inner_left_panel").innerHTML = createAccountContent(obj.message);
			break;
		case "dbsave":
			//console.log('...db saved');
			break;
		//*********** UNUSED AB HIER!!! ************ */
		case "send_image":
			alert(obj.message);
			get_chat();
			break;
		case "chats_refresh":
			SEEN_STATUS = false;
			var messages_holder = mBy("messages_holder");
			messages_holder.innerHTML = obj.messages;
			if (typeof obj.new_message != 'undefined') {
				if (obj.new_message) {
					received_audio.play();
					setTimeout(function () {
						messages_holder.scrollTo(0, messages_holder.scrollHeight);
						var message_text = mBy("message_text");
						message_text.focus();
					}, 100);
				}
			}
			break;
		case 'save_account':
			throw ("NEEEEEEEEEEEEEEEEEIIIIIIIIIIIIIIIIIIIIIIIIIN");
			if (obj.changed) window.location = "index.html?user=" + obj.message.username;
			else console.log('STILL SAME USERNAME', obj.message.username);
			break;

	}
}
function image_show(e) {
	var image = e.target.src;
	var image_viewer = mBy("image_viewer");
	image_viewer.innerHTML = "<img src='" + image + "' style='width:100%' />";
	image_viewer.className = "image_on";
}
function queryStringToJson() {
	let q = window.location.search;
	//console.log('query string:', q);
	if (isEmpty(q)) return {};
	q = q.substring(1);
	let result = {};
	let parts = q.split('&');
	for (const p of parts) {
		let key = stringBefore(p, '=');
		let val = stringAfter(p, '=');
		result[key] = val;
	}
	return result;

}
function reload() {
	console.log('reload chat contacts games play!!!');
	if (radio_contacts.checked == true) get_contacts();
	else if (radio_chat.checked == true) get_chat();
	else if (radio_games.checked == true) get_games();
	else if (radio_play.checked == true) get_play();

}
function send_message(e) {
	e.cancelBubble = true;
	var message_text = mBy("message_text");
	if (message_text.value.trim() == "") {
		alert("please type something to send");
		return;
	}
	console.log('CURRENT_CHAT_USER',CURRENT_CHAT_USER);
	get_data({
		message: message_text.value.trim(),
		username: CURRENT_CHAT_USER
	}, "send_message");
}
function sendHtml(id, filename) {
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
				console.log('RESPONSE IMAGE UPLOAD!!!!!!!', this.responseText);
				window.location.replace('index.html');
			}
		};
	});
}
function send_image(files) {
	console.log('files', files);
	var filename = files[0].name;
	var ext_start = filename.lastIndexOf(".");
	var ext = filename.substr(ext_start + 1, 3);
	if (!(ext == "jpg" || ext == "JPG")) {
		alert("This file type is not allowed");
		return;
	}
	var xml = new XMLHttpRequest();
	xml.onload = function () {
		if (xml.readyState == 4 || xml.status == 200) {
			handle_result(xml.responseText, "send_image");
		}
	}
	//let data = {file:files[0],data_type:'send_image',username:CURRENT_CHAT_USER};

	let data = new FormData();
	data.append('file', files[0]);
	data.append('data_type', "send_image");
	data.append('sender', Username);
	data.append('receiver', CURRENT_CHAT_USER);
	//console.log('sending file:',data.file.name);
	//return;
	xml.open("POST", "uploader.php", true);
	xml.send(data);
}
function set_seen(e) { SEEN_STATUS = true; }
function start_chat(e) {
	e.preventDefault(); e.cancelBubble = true;
	var username = e.target.getAttribute("username");
	if (e.target.id == "") {
		username = e.target.parentNode.getAttribute("username");
	}
	CURRENT_CHAT_USER = username;
	get_chat();
	mBy("radio_chat").checked = true;
	// get_data({ username: CURRENT_CHAT_USER }, "chats");
}
function start_game(e) {
	e.preventDefault(); e.cancelBubble = true;
	var gamename = e.target.getAttribute("gamename");
	if (nundef(gamename)) { gamename = e.target.parentNode.getAttribute("gamename"); }
	CURRENT_GAME = gamename;
	console.assert(!isEmpty(gamename), "CANNOT LOAD GAMENAME FROM GAMES MENU!!!!!!!!! " + gamename);
	//console.log('haaaaaaaaaaaaaaaaaaalllllllllllllloooooooo',CURRENT_GAME,'gamename',gamename);
	mBy("radio_play").checked = true;
	get_play();
}
function toggleSidebar(ev, k, key) {
	//console.log('ev',ev);
	if (ev.path[0].id != 'left_panel' && ev.path[0].id != 'header') return;
	if (nundef(DA.countKey)) { DA.countKey = {}; }
	if (nundef(DA.countKey[k])) { DA.countKey[k] = 0; }
	DA.countKey[k]++;
	let isOdd = DA.countKey[k] % 2 == 1;
	if (key == 'Escape' || ev.ctrlKey && k == 122) {
		if (isOdd) { //hide sidebar! 
			mBy('left_panel').style.flex = 0;
			setTimeout(() => {
				show('mini_profile_img');
				show('mini_username');
				// show('bSidebarHer');
			}, 500)




			//show mini_menu left and right!!!!
			//mBy('header').style.display = 'none';
			// mBy('left_panel').style.display = 'none';
			//hide('bSidebarWeg');
			//mBy('mini_menu_left').style.display = 'flex';
			mBy('mini_menu_right').style.display = 'flex';
			//mClassRemove(mBy('mini_menu_left'),'invisible');
			// let dParent = mBy('header');
			// let img = mBy('profile_image');
			// mStyle(img,{w:40,h:40});
			// mAppend(dParent,img);
			// mAppend(dParent,mBy('username'));

		} else {  //show sidebar
			mBy('left_panel').style.flex = 1;
			hide('mini_profile_img');
			hide('mini_username');
			// hide('bSidebarHer');

			//hide mini_menu left and right!!!!
			//mBy('header').style.display = 'block';
			// mBy('left_panel').style.display = 'block';
			//show('bSidebarWeg');
			//mBy('mini_menu_left').style.display = 'none';
			mBy('mini_menu_right').style.display = 'none';
			//mClass(mBy('mini_menu_left'),'invisible');
		}
	}

	console.log('sidebar is',isVisible('left_panel')?'open':'closed');
}
function setFullscreenKey() {
	//window.ondblclick = (ev) => {ev.preventDefault();ev.StopPropagation();toggleSidebar(ev, 122, 'Escape');};
	addKeyup('F11', (ev) => {
		//console.log('F11 handler!', ev.key, ev.key == 'Escape')
		let k = ev.keyCode;
		let key = ev.key;
		toggleSidebar(ev, k, key);
	});

}
function setReloadOnClick() {
	window.onclick = (ev) => {
		//console.log('click target ',ev.target.id);
		if (!['dStatusLine', 'header', 'inner_left_panel', 'left_panel'].includes(ev.target.id)) return;
		//console.log('click window',ev);
		//return;
		reload();
		mBy('dStatusLine').innerHTML = 'last reload: ' + formatNow();
	};
}

















