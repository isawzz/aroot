


function onclick_reload_state() {
	//Session.cur_tid = null;
	get_user_tables();
	//if (!is_admin()) window.location = `../bg4/index.html?user=${Session.cur_user};screen=admin`; 
}
function onclick_edit_players() {
	let ta = mBy('ta_edit_players');
	show(ta);
	let button = mBy('b_edit_players');
	button.innerHTML = 'submit';
	button.onclick = onclick_modify_def_players;
	ta.onkeyup = ev => {
		if (ev.key === "Enter") {
			ev.preventDefault();
			//mBy('dummy').focus();
			ev.cancelBubble = true;
			onclick_modify_def_players(ev);
		}
	};
	ta.focus();
}
function onclick_modify_def_players(ev) {
	let ta = mBy('ta_edit_players');
	let text = ta.value;
	let names = splitAtAnyOf(text, ', \n');
	console.log('text', text, 'names', names);

	//hier kann ich bereits checken to make sure all players exist!
	let non_existent = names.filter(x => nundef(DB.users[x]));
	//remove non-existent players from the list and show an alert!
	if (!isEmpty(non_existent)) {
		status_message('the following players will be discarded because they dont exist: ' + non_existent.join(', '));
		names = arrMinus(names, non_existent);
		if (names.length < 2) {
			//add a random player
			let plname = chooseRandom(get_keys(DB.users), x => x != Session.cur_user);
			names.push(plname);
		}
	}

	populate_players(get_def_players_for_user(Session.cur_user, names));
}
function modify_def_players(list) {
	console.log('list', list);
	return;
	let uname = Session.cur_user;
	Session.def_players = list;
	newlist = get_def_players_for_user(uname);
	populate_players(newlist);
	// setTimeout(() => {
	// 	// let ta = mBy('ta_edit_players');
	// 	// hide(ta);
	// 	let button = mBy('b_edit_players');
	// 	button.innerHTML = 'edit';
	// }, 100);

}

//#region test buttons (status area)
function onclick_delete_table() { if (isdef(Session.cur_tid)) { delete_current_table(); } }
function onclick_reset_tables() { DA.next = get_games; to_server({}, 'reset_tables'); }
function onclick_test_create1() { create_new_table_and_join_all(); }
function onclick_reset_user() { reset_game_values_for_user(Session.cur_user); db_save(); }
function onclick_reset_db() { reset_db_values(); db_save(); }
function onclick_log_session() { log_object(Session); }

function onclick_user(ev) { let name = ev.target.innerHTML; load_user(name); get_user_tables(); }


// function onclick_mimi() { load_user('mimi'); get_user_tables(); }
// function onclick_felix() { load_user('felix'); get_user_tables(); }
// function onclick_gul() { load_user('gul'); get_user_tables(); }

function on_ticker_status(obj) {
	console.log('status:', TCount);
	if (in_game_open_prompt()) {
		update_session(obj);
		update_game_status(Session.cur_players);
		TOTicker = setTimeout(send_timer_ticker, 3000);
	}
}

function onclick_create_game_button() {
	//extract options
	//players are all the toggles that are checked
	let d = mBy('d_players');
	let checkboxes = d.getElementsByTagName('input');
	Session.game_options.players = [];
	for (const chk of checkboxes) {
		if (chk.checked) {
			//console.log('player',chk.value,'is in game');
			Session.game_options.players.push(chk.value);
		}
	}

	//retrieve game options from settings window
	let go = Session.game_options.game = {};

	//wo find ich possible settings?
	let poss = DB.games[Session.cur_game].options;
	if (nundef(poss)) return;

	for (const p in poss) {
		let key = p;
		let val = poss[key];

		console.log('key',key);
		let widget = mBy(`d_${key}`);
		if (nundef(widget)) {console.log('skipping key',key); continue;}
		let children = widget.getElementsByTagName('input');
		let widget_type = isString(val) ? 'radio' : 'checkbox'; //for now only user radio!!!!
		if (widget_type == 'radio') {
			for (const ch of children) {
				console.log('===>ch',ch,ch.checked); //,ch.firstChild);
				if (ch.checked) go[key] = ch.value;
			}
		}
	}
	console.log('go',go);

	onclick_test_create1();
}
function onclick_game_in_games_menu(ev) {
	evNoBubble(ev);
	let gname = Session.cur_game = evToTargetAttribute(ev, 'gamename');
	let uname = Session.cur_user;
	//console.log('uname',Session.cur_user);
	if (!is_admin()) get_user_tables();
	else {
		//console.log('ADMIN!!!!!!!')
		let t = lookup(Session, ['user_tables_by_game', gname]);
		if (t) { t = t[0]; Session.cur_tid = t.id; }
		if (nundef(t)) { open_game_options(gname); }
		else if (t.player_status == 'join') { join_table(uname, t.id); }
		else if (t.host == uname && t.status == 'ready') { start_table(uname, t.id); }
		else get_play();
	}
}
function onclick_user_login_new(e) {
	e.preventDefault(); e.cancelBubble = true;
	var username = e.target.getAttribute("username");
	if (e.target.id == "") {
		username = e.target.parentNode.getAttribute("username");
	}
	load_user(username);

	get_user_tables();

}
function onclick_header(ev) { if (ev.path[0].id != 'header') return; open_sidebar(); close_mini_user_info(); }
function onclick_left_panel(ev) { if (ev.path[0].id != 'left_panel') return; close_sidebar(); open_mini_user_info(); }
function onclick_toggle_sidebar() { toggle_sidebar(); toggle_mini_user_info(); }
function onclick_internet() { toogle_internet_status(); }
function onclick_contacts() { if (!menu_enabled('contacts')) return; game_interrupt(); get_contacts(); }//console.log('menu',getFunctionCallerName());}
function onclick_chat() { if (!menu_enabled('chat')) return; game_interrupt(); get_chat(); }//console.log('menu',getFunctionCallerName());}
function onclick_games() { if (!menu_enabled('games')) return; game_interrupt(); get_games(); }//console.log('menu',getFunctionCallerName());}
function onclick_play() { if (!menu_enabled('play')) return; game_interrupt(); get_play(); }//console.log('menu',getFunctionCallerName());}
function onclick_account() { if (!menu_enabled('account')) return; game_interrupt(); get_account(); }//console.log('menu',getFunctionCallerName());}
function onclick_login() { if (!menu_enabled('login')) return; game_interrupt(); get_login(); }//console.log('menu',getFunctionCallerName());}
function onclick_login_new() { if (!menu_enabled('login')) return; game_interrupt(); get_login_new(); }//console.log('menu',getFunctionCallerName());}

function onclick_status_message(ev) {

	evNoBubble(ev); hide('dMessage');

	if (isdef(DA.after_status_message)) {
		let func = DA.after_status_message;
		DA.after_status_message = null;
		func();
	}

}
