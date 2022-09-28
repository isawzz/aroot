function onclick_test(){
	hide('dIntro');
	mBy('inner_left_panel').innerHTML = '<div id="test_area"></div>';
	dTable = document.getElementById('test_area');
	console.log('hallo!!!!!!!!!!!!!!!!!!!!!!!!!!!!!',dTable)
	
	//testKarte3_svg();
	mStyle(dTable, { gap: 10 }); 
	let card;

	//card = cBlankSvg(dTable);
	//immer noch brauch ich die Jack,King,Queen,back,Joker vielleicht
	//console.log('card', card);

	card = cBlankSvg(dTable);

	console.log('card', card); //mClass(iDiv(card),'hoverScale')
	let g = iG(card); console.log('g', g);

	//1 produce
	let x = mgSuit('Pik'); console.log('x', x);
	//2 attach
	//mAppend(iG(card),x);
	//3 size
	mgSize(x, 200 / 2);
	//4 position
	mgPos(card, x); //,50,50);
}


function onclick_reload_state() { get_user_tables(); }
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

//#region test buttons (status area)
function onclick_delete_table() { stop_game(); if (isdef(Session.cur_tid)) { delete_current_table(); } }
function onclick_reset_tables() { stop_game(); DA.next = get_games;  to_server({}, 'reset_tables'); }
function onclick_test_create1() { create_new_table_and_join_all(); }
function onclick_reset_user() { reset_game_values_for_user(Session.cur_user); db_save(); }
function onclick_reset_db() { reset_db_values(); db_save(); }
function onclick_log_session() { log_object(Session); }

function onclick_user(ev) { let name = ev.target.innerHTML; load_user(name); get_user_tables(); }

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

		//console.log('key',key);
		let widget = mBy(`d_${key}`);
		if (nundef(widget)) { console.log('skipping key', key); continue; }
		let children = widget.getElementsByTagName('input');
		let widget_type = isString(val) ? 'radio' : 'checkbox'; //for now only user radio!!!!
		if (widget_type == 'radio') {
			for (const ch of children) {
				//console.log('===>ch',ch,ch.checked); //,ch.firstChild);
				if (ch.checked) go[key] = ch.value;
			}
		}
	}
	//console.log('go',go);

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
function onclick_user_login(e) {
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
function onclick_games() { if (!menu_enabled('games')) return; stop_game(); get_games(); }//console.log('menu',getFunctionCallerName());}
function onclick_play() { if (!menu_enabled('play')) return; stop_game(); get_play(); }//console.log('menu',getFunctionCallerName());}
function onclick_account() { if (!menu_enabled('account')) return; stop_game(); get_account(); }//console.log('menu',getFunctionCallerName());}
function onclick_login() { if (!menu_enabled('login')) return; stop_game(); get_login(); }//console.log('menu',getFunctionCallerName());}

function onclick_status_message(ev) {

	evNoBubble(ev); hide('dMessage');

	if (isdef(DA.after_status_message)) {
		let func = DA.after_status_message;
		DA.after_status_message = null;
		func();
	}

}
function onclick_user_in_intro(e) {
	e.preventDefault(); e.cancelBubble = true;
	var username = e.target.getAttribute("username");
	if (e.target.id == "") {
		username = e.target.parentNode.getAttribute("username");
	}
	load_user(username);

	show_user_intro_screen();

	// to_server(username, 'poll_table_started');
	//hier soll long poll gestartet werden mit message: waiting for mimi to start the game...
}
