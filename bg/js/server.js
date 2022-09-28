function from_server(result, type) {
	//if (type == "login") { console.log('______from server:', type, '\nresult:', result); } //return; }
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
		case "login": present_login(obj); break;

		case "dbsave": break; //console.log('dbsave', obj); break;
		case 'delete_table': get_games(obj); break;
		case 'save_and_delete': alert(`${obj.message}, ranking:${obj.fen}`);
			console.assert(is_admin(), 'SAVE_AND_DELETE NOT SENT BEI ADMIN!!!!');
			break;

		// ************************** unused ******************
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

		default: break;

	}
	danext();
}

//#region send to server 

function to_server(req, type, to_php = true) {
	//console.log('...to_server:', type, type == 'send_move' ? req.player_status : '');
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
function get_data(find, type) { //genau gleich wie chatas api.js get_data
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
function handle_result(result, type) {
	//console.log('type', type, '\nresult', result); //return;
	if (result.trim() == "") return;
	var obj = JSON.parse(result);
	switch (obj.data_type) {
		case "user_info": ensure_assets_old(obj); start_with_basic_assets(); break;
		default: alert('handle_result with type == ' + obj.data_type); break;
	}
}


