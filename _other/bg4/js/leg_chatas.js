
//#region api.js

function close_image(e) {
	e.target.className = "image_off";
}

function delete_message(e) {
	if (confirm("Are you sure you want to delete this message??")) {
		var msgid = e.target.getAttribute("msgid");
		get_data({
			rowid: msgid
		}, "delete_message");
		get_data({
			username: Session.cur_chatter,
			seen: SEEN_STATUS
		}, "chats_refresh");
	}
}
function delete_thread(e) {
	if (confirm("Are you sure you want to delete this whole thread??")) {
		get_data({
			username: Session.cur_chatter
		}, "delete_thread");
		get_data({
			username: Session.cur_chatter,
			seen: SEEN_STATUS
		}, "chats_refresh");
	}
}
function enter_pressed(e) { if (e.keyCode == 13) { send_message(e); } set_seen(); }
function ensure_assets_old(obj) {
//	if (nundef(DB)) {
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
//	}
	console.assert(isdef(DB), 'NO DB!!!!!!!!!!!!!!!!!!!!!!!!!!!');
}
function get_account_dep() { get_data({}, "account"); }
function get_contacts_dep(e) { get_data({}, "contacts"); }
function get_chat(e) { get_data({ username: Session.cur_chatter }, "chats"); }
function get_play_dep(e) {
	get_data({ username: Session.cur_user, gamename: Session.cur_game, assets: nundef(Syms) }, "play");
	//console.log('supposedly getting game data!'); 
}
function get_games_dep() {
	//console.log('supposedly loading games!');
	let d = mBy('inner_left_panel');
	d.innerHTML = "GAMES ARE DISPLAYED HERE!";
	get_data({ assets: nundef(Syms) }, 'games');
}
function get_user(name) {
	if (nundef(name)) { get_data(queryStringToJson(), 'user_info'); }
	else { get_data({ user: name }, 'user_info'); }
}
function get_data_orig(find, type) {
	//console.log('find', find, 'type', type)
	if (is_online()) {
		get_data_online(find, type);

		//if (type == 'contacts') update_online_status(false); //testing offline data fetch: remove in production!

	} else {
		if (type == 'chat') {
			alert('no internet!');
			mClassReplace(mBy("label_chat"), 'enabled', 'disabled');
		}
		get_data_offline(find, type);
	}
}
function get_data_online_orig(find, type) { //genau gleich wie chatas api.js get_data
	//console.log('_______online!', 'find', find, 'type', type);
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
	xml.send(data);
}
function get_data_offline_orig(find, type) {
	//console.log('_______offline!', 'find', find, 'type', type, 'Session.cur_user', Session.cur_user);
	let response = {};
	switch (type) {
		case 'user_info':
		case 'account':
			if (nundef(find.user)) find.user = Session.cur_user;
			//console.log('Session.cur_user',Session.cur_user);
			let u = response.message = DB.users[find.user];
			//console.log('u',u,u.username);
			response.name = u.username;
			break;

		case 'contacts':
			//get all users except Session.cur_user
			let usernames = Object.keys(DB.users).filter(x => x != Session.cur_user);
			response.myusers = usernames.map(x => DB.users[x]);
			break;

	}
	response.data_type = type;
	handle_result(JSON.stringify(response), type);

}
function handle_result_orig(result, type) {
	//console.log('type', type, '\nresult', result); //return;
	if (result.trim() == "") return;

	var obj = JSON.parse(result);
	//console.log('type',type)
	if ('contacts chats games play account'.includes(type)) Session.cur_menu = type; //remember current menu!

	switch (obj.data_type) {
		case "user_info":
			//console.log('obj',obj);
			ensure_assets_old(obj);

			start_with_basic_assets();

			break;
		case "contacts":
			//console.log('\nresult', obj.messagesInOrder);
			var inner_left_panel = mBy("inner_left_panel");
			//inner_left_panel.innerHTML = obj.message;
			inner_left_panel.innerHTML = createContactsContent(obj.myusers, obj.msgs);
			Session.others = obj.myusers.map(x => x.id);
			for (const u of obj.myusers) { add_live_user(u); }
			break;
		case "games":
			ensure_assets(obj);
			//console.log('DB', DB);
			//console.log('Syms', Syms);
			mBy('inner_left_panel').innerHTML = createGamesContent(dict2list(DB.games), obj.tables);
			mCenterCenterFlex(mBy('game_menu'));
			break;
		case "chats":
			if (isEmpty(Session.cur_chatter)) Session.cur_chatter = obj.other.username;
			console.log('CURRENT_CHAT_USER',Session.cur_chatter);
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
		case "play":
			ensure_assets(obj);
			//console.log('NOW IN PLAY!');
			game_resume_or_start();
			break;
		case 'account':
			//createAccountContent1(obj.message);
			mBy("inner_left_panel").innerHTML = is_online() ? createAccountContent(obj.message) : createAccountContentNoDD(obj.message);
			break;
		case "send_message":
			sent_audio.play();
			get_chat();
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
	get_data({
		message: message_text.value.trim(),
		username: Session.cur_chatter
	}, "send_message");
}
function sendHtml_dep(id, filename) {
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
	//let data = {file:files[0],data_type:'send_image',username:Session.cur_chatter};

	let data = new FormData();
	data.append('file', files[0]);
	data.append('data_type', "send_image");
	data.append('sender', Session.cur_user);
	data.append('receiver', Session.cur_chatter);
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
	Session.cur_chatter = username;
	get_chat();
	mBy("radio_chat").checked = true;
	// get_data({ username: Session.cur_chatter }, "chats");
}
function start_game(e) {
	e.preventDefault(); e.cancelBubble = true;
	var gamename = e.target.getAttribute("gamename");
	if (nundef(gamename)) { gamename = e.target.parentNode.getAttribute("gamename"); }
	Session.cur_game = gamename;
	console.assert(!isEmpty(gamename), "CANNOT LOAD GAMENAME FROM GAMES MENU!!!!!!!!! " + gamename);
	//console.log('haaaaaaaaaaaaaaaaaaalllllllllllllloooooooo',Session.cur_game,'gamename',gamename);
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

	console.log('sidebar is', isVisible('left_panel') ? 'open' : 'closed');
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



//#region test_ui_helpers.js
//misc helpers =>integrate with base eventually!
function ipaddX(elem, role) {
	//role can be source,target,both,
	let isSource = role != 'target';
	let isTarget = role != 'source';
	if (isSource) elem.setAttribute('draggable', true);

	function OnDragOver(ev) {
		elem.setAttribute('DragOver', true);
		ev.stopPropagation();    //  let child accept and don't pass up to parent element
		ev.preventDefault();     //  ios to accept drop
		ev.dataTransfer.dropEffect = 'copy';//   move has no icon? adding copy shows +
	}
	function OnDragLeave(ev) {
		elem.removeAttribute('DragOver');
	}
	function OnDrop(ev) {
		elem.removeAttribute('DragOver');
		ev.preventDefault();     //  dont let page attempt to load our data
		ev.stopPropagation();
		// elem.innerHTML = ev.dataTransfer.getData('text/plain');
		//console.log('drop');
		if (isTarget) elem.innerHTML = ev.dataTransfer.getData('text/plain');
	}
	function OnDragStart(ev) {
		//console.log('insane!!!');
		//ev.preventDefault();
		ev.stopPropagation(); // let child take the drag
		ev.dataTransfer.dropEffect = 'move';
		ev.dataTransfer.setData('text/plain', this.innerHTML);
	}
	function OnClickClick(ev) {
		ev.preventDefault();     //  dont let page attempt to load our data
		ev.stopPropagation(); // let child take the drag
		//console.log('click', elem); //ev.target); return;
		//let el=ev.target;
		let aname = 'data_transport'; //hallo hallo hallo
		let source = DA[aname];
		if (nundef(source) && isSource) { //this is the first click: determine new source click on drag source
			toggleSelectionOfPicture(elem);
			DA[aname] = elem;
		} else if (isdef(source)) {
			if (isTarget) { elem.innerHTML = source.innerHTML; toggleSelectionOfPicture(source); DA[aname] = null; }
			else if (isSource) {
				toggleSelectionOfPicture(source);
				if (source != elem) { toggleSelectionOfPicture(elem); DA[aname] = elem; }
				else { DA[aname] = null; }
			}
		}
	}
	if (isSource) elem.addEventListener('dragstart', OnDragStart);
	elem.addEventListener('dragover', OnDragOver);
	elem.addEventListener('dragleave', OnDragLeave);
	elem.addEventListener('drop', OnDrop);
	elem.onclick = OnClickClick;
	DA.data_transport = null;
}


function ipadd(elem) {
	elem.setAttribute('draggable', true);

	function OnDragOver(ev) {
		elem.setAttribute('DragOver', true);
		ev.stopPropagation();    //  let child accept and don't pass up to parent element
		ev.preventDefault();     //  ios to accept drop
		ev.dataTransfer.dropEffect = 'copy';//   move has no icon? adding copy shows +
	}
	function OnDragLeave(ev) {
		elem.removeAttribute('DragOver');
	}
	function OnDrop(ev) {
		elem.removeAttribute('DragOver');
		ev.preventDefault();     //  dont let page attempt to load our data
		ev.stopPropagation();
		// elem.innerHTML = ev.dataTransfer.getData('text/plain');
		//console.log('drop');
		elem.innerHTML = ev.dataTransfer.getData('text/plain');
	}
	function OnDragStart(ev) {
		console.log('insane!!!');
		//ev.preventDefault();
		ev.stopPropagation(); // let child take the drag
		ev.dataTransfer.dropEffect = 'move';
		ev.dataTransfer.setData('text/plain', this.innerHTML);
	}
	function OnClickClick(ev) {
		ev.preventDefault();     //  dont let page attempt to load our data
		ev.stopPropagation(); // let child take the drag
		//console.log('click', elem); //ev.target); return;
		//let el=ev.target;
		let aname = 'data_transport'; //hallo hallo hallo
		let source = DA[aname];
		if (isdef(source)) {
			//this is the second click!
			//console.log('click! WHAT THE FUCK??????????????????????????????');
			elem.innerHTML = source.innerHTML;
			toggleSelectionOfPicture(source);
			DA[aname] = null;
		} else {
			toggleSelectionOfPicture(elem);
			DA[aname] = elem;
		}
	}
	elem.addEventListener('dragstart', OnDragStart);
	elem.addEventListener('dragover', OnDragOver);
	elem.addEventListener('dragleave', OnDragLeave);
	elem.addEventListener('drop', OnDrop);
	elem.onclick = OnClickClick;
	DA.data_transport = null;
}

//chats 
function createMessageContent(messages, me, other) {
	let result = `<div id='messages_holder_parent' onclick='set_seen(event)' style='background:silver;height:680px;'>
	<div id='messages_holder' style='box-sizing:border-box;height:580px;padding:10px;margin-bottom:10px;overflow-y:auto;'>`;

	//result += `<div>start of chat with<img src="${other.imagePath} height=30 /></div><br>`;
	// result += `start of chat with ${other.username}<br>`;
	// result += `start of chat with ${other.imagePath}<br>`;
	result += `start of chat with ${other.username} <img src="${other.imagePath}" style="margin-left:10px;display:inline;height:30px;"/><br><br>`;

	for (const m of messages) {
		if (m.sender == me.username) { result += message_right(m, me); } else { result += message_left(m, other); }
	}
	result += message_controls(); //`</div></div>`;
	return result;
}
function message_left(msg, sender) {
	image = sender.imagePath;
	$a = `
	<div id='message_left'>
	<div></div>
		<img  id='prof_img' src='${image}' class='img_person sz50' style='float: left;margin:2px;'>
		<b>${sender.username}</b><br>
		${msg.message}<br><br>`;

	if (msg.files != "") {
		$a += `<img src='${msg.files}' style='margin:30px;cursor:pointer;' onclick='image_show(event)' /> <br>`;
	}
	$a += `<span style='font-size:11px;color:white;'>${msg.date}<span>
	<img id='trash' src='../base/assets/images/icons/trash.png' onclick='delete_message(event)' msgid='${msg.id}' />
	</div>`;

	return $a;
}
function message_right(msg, sender) {
	image = sender.imagePath;
	//console.log('imagePath',image)
	$a = `
	<div id='message_right'>

	<div>`;

	if (msg.seen) {
		$a += "<img src='../base/assets/images/tick.png' style=''/>";
	} else if (msg.received) {
		$a += "<img src='../base/assets/images/tick_grey.png' style=''/>";
	}

	$a += `</div>

		<img id='prof_img' src='${image}' style='float:right;margin:2px;' class='img_person sz50'>
		<b>${sender.username}</b><br>
		${msg.message}<br><br>`;

	if (msg.files != "") {
		$a += `<img src='${msg.files}' style='margin:30px;cursor:pointer;' onclick='image_show(event)' /> <br>`;
	}
	$a += `<span style='font-size:11px;color:#888;'>${msg.date}<span>

		<img id='trash' src='../base/assets/images/icons/trash.png' onclick='delete_message(event)' msgid='${msg.id}' />
	</div>`;

	return $a;
}
function message_controls() {

	return `
	</div>
	<div style='display:flex;gap:10px;padding:10px;box-sizing:border-box;width:100%;height:60px;'>
		<label for='message_file'><img src='../base/assets/images/icons/clip.png' style='opacity:0.8;width:30px;cursor:pointer;' ></label>
		<input type='file' id='message_file' name='file' style='display:none' onchange='send_image(this.files)' />
		<input id='message_text' onkeyup='enter_pressed(event)' style='flex:6;border:solid thin #ccc;border-bottom:none;font-size:14px;padding:4px;outline:none;' type='text' placeHolder='type your message'/>
		<input style='flex:1;cursor:pointer;outline:none;' type='button' value='send' onclick='send_message(event)'/>
	</div>
	<span onclick='delete_thread(event)' style='color:white;cursor:pointer;'>Delete this thread </span>
	</div>`;
}


//games

//#endregion

