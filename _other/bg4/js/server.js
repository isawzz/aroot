function from_server(result, type) {
	//if (type == "poll_table_show") { console.log('______from server:', type, '\nresult:', result); } //return; }
	//console.log('______from server:',type,'\nresult:', result); return;

	if (result.trim() == "") return;
	var obj = JSON.parse(result);
	//console.log('obj',obj);

	convert_from_server(obj); //number strings => number, players => list, string starting with '{'=:JSON.parse

	switch (type) {
		case 'send_move':
		case "play": present_table(obj); break;
		case 'seen': poll_for_table_seen_or_deleted(); break;
		case 'create_table_and_start': Session.cur_tid = obj.table.id; Session.cur_table = obj.table; present_table(obj); break;

		case 'standard_assets':
		case 'assets': assets_parse(obj.response); break;

		case "games": present_games(obj); break;

		case "get_user_tables": set_user_tables_by_game(obj); if (isdef(Session.cur_tid)) get_play(); else get_games(); break;
		case "poll_table_started": check_poll_table_started(obj); break;
		case "poll_table_show": check_poll_table_show(obj); break;
		case "poll_table_seen": check_poll_table_seen(obj); break;
		case "get_past_tables": test_user_endscreen(obj); break;

		case "contacts": present_contacts(obj); break;
		case "intro": present_intro(obj); break;
		case "login_new": present_login_new(obj); break;

		case "dbsave": break; //console.log('dbsave', obj); break;
		case 'delete_table': get_games(obj); break;
		case 'save_and_delete': alert(`${obj.message}, ranking:${obj.fen}`);
			console.assert(is_admin(),'SAVE_AND_DELETE NOT SENT BEI ADMIN!!!!');
			break;

		//***************** work bis hier ************************ */
		case 'ticker_status_send_receive': on_ticker_status(obj); break;

		//#region sequence if dont join players automatically
		case 'create_table':
			Session.cur_tid = obj.table.id;
			Session.cur_table = obj.table;
			//update_cur_table(obj);
			break;
		case "join_table":
			status_message('You have joined the game! Wait for the host to start it!');
			update_cur_table(obj, 'red');
			//need to update DA[Session.cur_user].tables_by_game und tables_by_id
			//joined_table(obj.table);

			//long_polling_shield_on();

			break;
		case "toggle_join":
			let t = obj.table;
			let st = obj.player_status;
			update_cur_table(obj, st == 'joined' ? 'red' : 'orange');
			status_message(`You have ${st == 'joined' ? 'joined' : 'left'} the game! Wait for the host to start it!`);
			// mStyle(mBy(`rk_${obj.table.id}`), { bg: st == 'joined' ? 'red' : 'orange' }); //table status has changed!
			//joined_table(obj.table);
			break;
		case "start_table":
			update_cur_table(obj, 'green');
			// mStyle(mBy(`rk_${obj.table.id}`), { bg: 'green' }); //table status has changed!
			status_message('You have started the game! ', obj.table.status);
			break;
		//#endregion

		//***************** DONE bis hier ************************ */
		case 'gameover': console.log('GAMEOVER!!! obj', obj);
			show_game_ending(obj);
			break;

		//#region ********* NOT IMPLEMENTED: ELIMINATE!!!
		case 'move':
			//hier muss jetzt der next step ausgeloest werden!
			present_table(obj);
			break;
		case 'old_api': console.log('obj', obj); break;
		case 'play_old':
			//console.log('from server:', obj.response);
			//in der response sind die updated moves drin! auch von den anderen spielern!
			update_table(obj.response);
			break;
		case 'table': console.log('response', obj.response); break;
		case 'complete_players_for_table': break;
		case 'all_tables': let arr = obj.response; arr.map(x => convert_from_row(x)); Session.all_tables = arr; break;
		case "table_status":
			//this is a long polling event!
			console.log('table status abfrage: obj', obj);
			report_poll(obj);

		//#endregion
		default: break;

	}
	danext();
}

//#region send to server 

function to_server(req, type, to_php = true) {
	console.log('...to_server:', type, type == 'send_move' ? req.player_status : '');
	where(type);
	if (!to_php) {
		server_offline(req, type);
	} else if (is_online()) {
		server_online(req, type);
	} else {
		if (type == 'chat') { alert('no internet!'); mClassReplace(mBy("label_chat"), 'enabled', 'disabled'); }
		server_offline(req, type);
	}
}
function server_online(req, type) {
	//handled by apisi ... ends up in from_server
	//console.log('php server requesting:', req, type)
	var xml = new XMLHttpRequest();
	var loader_holder = mBy("loader_holder");
	loader_holder.className = "loader_on";

	xml.onload = function () {
		if (xml.readyState == 4 || xml.status == 200) {
			loader_holder.className = "loader_off";
			//if (type == 'games' || startsWith(type,'play')) console.log('xml.responseText', xml.responseText);
			from_server(xml.responseText, type);
		}
	}
	var data = { req: req, type: type };
	data = JSON.stringify(data);
	xml.open("POST", "./server/apisi.php", true);
	xml.send(data);
}
function server_offline(req, type) {
	// handled on client just using DB and Session
	if (type == 'user_info') console.log('_______to server offline!', 'req', req, 'type', type, 'Session.cur_user', Session.cur_user);
	let response = {};
	switch (type) {
		case 'user_info':
		case 'account':
			if (nundef(req.user)) req.user = Session.cur_user;
			let u = response.message = DB.users[req.user];
			console.log('udata', u);
			response.name = u.name;
			break;

		case 'contacts':
			//get all users except Session.cur_user
			let usernames = get_user_names().filter(x => x != Session.cur_user);
			//console.log('usernames', usernames);
			response.myusers = usernames.map(x => DB.users[x]);
			break;

	}
	response.type = type;
	from_server(JSON.stringify(response), type);

}
//#endregion

//#region old_api get_data 
function get_data(find, type) {
	if (is_online()) { get_data_online(find, type); }
	else {
		if (type == 'chat') { alert('no internet!'); mClassReplace(mBy("label_chat"), 'enabled', 'disabled'); }
		get_data_offline(find, type);
	}
}
function get_data_online(find, type) { //genau gleich wie chatas api.js get_data
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
function get_data_offline(find, type) {
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

//#endregion

function handle_result(result, type) {
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

		//********************************************************************************** */
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
			console.log('CURRENT_CHAT_USER', Session.cur_chatter);
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


