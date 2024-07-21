function set_start_data_from_fen(fen, game) {
	let parts = fen.split(',');
	for (const p of parts) {
		let [name, startlevel, lang] = p.split(':');
		startlevel = Number(startlevel);
		set_startlevel(name, game, startlevel);
		set_preferred_lang(name, lang);
		//console.log('reading player', name, startlevel, lang);
	}
}






//#region get.js
//route: non_admin
//1. player clicks on link:
function get_intro() { to_server(Session.cur_user, "intro"); }
function got_intro(obj) {
	Session.users = obj.users;
	Session.users_by_name = {};
	for (const u of Session.users) {
		Session.users_by_name[u.username] = u;
		if (isdef(DB.users[u.username])) { copyKeys(DB.users[u.username], u); }
	}
	present_intro();
}
function present_intro() { param_present_contacts(Session, mBy('dIntro'), 'onclick_user_in_intro'); }

//2. clicks user in intro: onclick_user_in_intro: load all tables for that user
function get_user_in_intro_screen(username) {
	load_user(username);
	get_dictionary();
	got_user_in_intro_screen();
}
function get_dictionary(){
	let u = DB.users[Session.cur_user];
	let lang = valf(u.lang,'E');
	//console.log('user',u,lang);
	if (isdef(Dictionary) && isdef(Dictionary[lang])) return;
	to_server(lang,'dictionary');
}
function got_dictionary(obj){

	let lang = obj.lang;
	let x=obj.dict;
	Dictionary[lang] = to_words(x);
	//console.log('Dictionary',Dictionary);

	return;

	let keys = get_keys(obj).filter(x=>endsWith(x,'dict'));
	console.log('keys',keys)
	if (isEmpty(keys)) return;
	if (nundef(Dictionary)) Dictionary = {};
	let l = obj.lang;
	for(const k of keys){
		//let l=k[0].toUpperCase();
		if (nundef(Dictionary[l])){
			Dictionary[l] = to_words(obj[k]);
		}
	}

}
function to_words(x){
	//console.log(x);
	let list = x.split('\n');
	//console.log(list);
	let di = {};
	list.map(x=>di[x.toLowerCase()]=x);
	return di;
}
function got_user_in_intro_screen(){
	//for now just present that user passively then think what comes next! (statt show_user_intro_screen(); )
	show('dIntro'); clearElement('dIntro');
	intro_show_user_image(Session.cur_user);

	present_wait_for_table_to_start();
}

function get_non_admin_reload() { to_server(Session.cur_user, 'non_admin_reload'); }
function got_non_admin_reload(obj) {
	//let previous_cur_tid = Session.cur_tid; ne, doch nicht
	in_game_off();
	in_game_open_prompt_off();
	console.log('got_non_admin reload: obj',obj)
	set_tables_by_game(obj);

	tables = obj.tables;
	//console.log('tables for',Session.cur_user,tables);
	if (isEmpty(tables)) {
		console.assert(nundef(Session.cur_tid), 'reload no table still cur_tid!!!!!')
		get_user_in_intro_screen();
		//present_wait_for_table_to_start_after_reload();

	} else {
		get_play_start();
	}
}


//route: games
function get_games() { Session.cur_menu = 'games'; to_server(Session.cur_user, "games"); }
function got_games(obj) {
	let tables = obj.tables;

	//einteilen in tables by game
	let bygame = set_tables_by_game(obj, false);
	set_most_recent_table_as_cur_tid(tables);

	//game menu anzeigen
	present_games();

	//was wuerde passieren wenn er jetzt play clickt? was soll er dann starten?
	//er sollte most recent game play starten if any oder garnix machen
}
function present_games() {
	Session.cur_menu = 'games';
	let all = dict2list(DB.games);
	//all = is_admin()? all : all.filter(x=>x.stage!='testing');
	mBy('inner_left_panel').innerHTML = createGamesContent(all, Session.tables_by_game);
	mCenterCenterFlex(mBy('game_menu'));
}

//route: modify_table
function get_modify_table() {

	let uname = Session.cur_user;

	let table = Session.cur_table;
	if (nundef(table)) {alert('no table available!');return;}

	let game = Session.cur_game = table.game;
	let tid = Session.cur_tid = table.id;

	Session.scoring_complete = false;
	let t = {};
	t.id = Session.cur_tid;
	//t.friendly = generate_friendly_table_name();
	//t.game = Session.cur_game;
	//t.host = Session.cur_user;
	//t.players = valf(lookup(Session, ['game_options', 'players']), get_def_players_for_user(Session.cur_user));
	t.players = valf(lookup(Session, ['game_options', 'players']),table.players);	
	t.options = valf(lookup(Session, ['game_options', 'game']), {});
	t.player_init = {};
	//jeder bekommt seine settings als fen!
	t.fen = get_start_data_fen(table.players, game);
	to_server(t, 'modify_table');
}
function got_modify_table(obj) { Session.cur_tid = obj.table.id; Session.cur_table = obj.table; present_table(obj); }

//route: create_table
function get_create_table(user, game) {
	Session.cur_tid = Session.cur_table = null;
	Session.scoring_complete = false;
	let t = {};
	t.friendly = generate_friendly_table_name();
	t.game = Session.cur_game;
	t.host = Session.cur_user;
	t.players = valf(lookup(Session, ['game_options', 'players']), get_def_players_for_user(Session.cur_user));
	t.fen = 'noneed';
	t.options = valf(lookup(Session, ['game_options', 'game']), {});
	t.status = 'started'; // created
	t.host_status = 'joined'; // joined
	t.player_status = 'joined'; // join
	t.player_init = {};
	//jeder bekommt seine settings als fen!
	t.fen = get_start_data_fen(t.players, t.game);
	to_server(t, 'create_table_and_start');
}
function got_create_table(obj) { Session.cur_tid = obj.table.id; Session.cur_table = obj.table; present_table(obj); }

//route: play
function get_play() { Session.cur_menu = 'play'; to_server({ uname: Session.cur_user, tid: Session.cur_tid }, 'play'); }
function got_play(obj) { present_table(obj); }

//route: play_start
function get_play_start() { Session.cur_menu = 'play'; to_server({ uname: Session.cur_user, tid: Session.cur_tid }, 'play_start'); }
function got_play_start(obj) { 
	console.log('got_play_start',obj);
	let table = obj.table;
	console.log('fen',table.fen);

	let lang = get_preferred_lang(Session.cur_user);
	set_start_data_from_fen(obj.table.fen,obj.table.game);

	let lang2 = get_preferred_lang(Session.cur_user);
	if (lang != lang2) get_dictionary();

	present_table(obj); 
}

//route: send_move
function get_send_move() {
	let me = Session.cur_players[Session.cur_user];
	let o = { tid: Session.cur_tid, player_status: me.player_status, score: me.score, state: me.state, uname: me.name };
	to_server(o, 'send_move');
}
function get_send_move_old() {
	let me = Session.cur_players[Session.cur_user];
	if (me.player_status == 'lamov') me.player_status = 'done'; //in lamov gilt der letzte punkt nicht mehr!
	let o = { tid: Session.cur_tid, player_status: me.player_status, score: me.score, state: me.state, uname: me.name };
	//console.log('sending send_move', o);
	to_server(o, 'send_move');
}
function got_send_move(obj) { present_table(obj); }

function present_table(obj) {
	Session.cur_menu = 'play';

	console.assert(isdef(obj.table), 'present_table without obj.table!!!!!!!!!!!!!!');
	update_session(obj); // updates Session.cur_table, Session.cur_players/me/others
	let table_status = Session.cur_table.status;
	let my_status = Session.cur_me.player_status;
	let have_another_move = my_status == 'joined';

	//console.log('______________', Session.cur_user, 'game update:\ntable status', Session.cur_table.status, '\nmy status', Session.cur_me.player_status);

	if (table_status == 'deleted') { in_game_off(); in_game_open_prompt_off(); status_message_off(); get_games(); return; }

	if (!in_game()) { open_game_ui(); in_game_on(); }

	let d = mBy('table'); d.animate([{ opacity: 0, transform: 'translateY(50px)' }, { opacity: 1, transform: 'translateY(0px)' },], { fill: 'both', duration: 1000, easing: 'ease' });

	if (!have_another_move) { reload_last_game_state(); }
	else if (!in_game_open_prompt()) { open_prompt(); in_game_open_prompt_on(); }
	else { uiActivated = true; }

	update_game_status(Session.cur_players); //ueber den cards soll ein panel sein mit all den spielern

	if (table_status == 'over') {
		stop_game();
		// 	status_message(`Game over! gathering information...`, { top: 220, classname: 'slow_gradient_blink' });
		// 	poll_for_table_show();
		// } else if (table_status == 'show') {
		let winners = Session.winners = race_check_endcondition();
		//console.log('winners', winners);
		if (!isEmpty(winners)) {
			stop_game();
			DA.after_status_message = onclick_gameover_screen;
			show_gameover(winners);
		}
	}

}

//route: get_tables
function get_tables() { to_server(Session.cur_user, "get_tables"); }
function got_tables(obj) {
	set_tables_by_game(obj);
	if (isdef(Session.cur_tid)) { get_play(); } else get_games();
}










//#endregion

//#region guest.js
function present_wait_for_table_to_start(){
	status_message(`hi, ${capitalize(Session.cur_user)}, a game is starting soon...`, { top: 330, classname: 'slow_gradient_blink' });	
	poll_for_table_started();
}
function present_wait_for_table_to_start_after_reload(){
	status_message(`table has been canceled by host, new game starting soon...`, { top: 330, classname: 'slow_gradient_blink' });	
	poll_for_table_started();
}

function intro_create_score_table(fen, title) {
	let dParent = mBy('dIntro');
	let d = mDiv(dParent, { margin: 'auto', wmin: 300, wmax: 500 }); //, bg:'red'});

	html = `<div style='text-align:center;margin-top:100px'>
	<h1>${title}</h1>
	<table id='customers'><tr><th>player</th><th>score</th></tr>
	`;
	let plparts = fen.split(',');
	for (const pl of plparts) {
		html += `<tr><td>${stringBefore(pl, ':')}</td><td>${stringAfter(pl, ':')}</td></tr>`
	}
	html += '</table></div>';
	d.innerHTML = html;

}
function intro_show_user_image(uname) {
	let dParent = mBy('dIntro');
	let d = mDiv(dParent, { margin: 'auto', w: 300 });
	let html = `
	<div style='text-align:center;margin-top:100px'>
		<img src='../base/assets/images/${uname}.jpg' class="img_person" height=200 />
		<div>${uname}</div>
	</div>
	`;
	d.innerHTML = html;

}
function create_score_table() {
	//customers	
	let t = Session.cur_table;
	let fen = t.fen;
	let dParent = mBy('dIntro');
	let d = mDiv(dParent, { margin: 'auto', w: 300, bg: 'red' });

	html = `<div style='text-align:center;margin-top:200px'>
	<table id='customers'><tr><th>player</th><th>score</th></tr>
	`;
	let plparts = fen.split(',');
	for (const pl of plparts) {
		html += `<tr><td>${stringBefore(pl, ':')}</td><td>${stringAfter(pl, ':')}</td></tr>`
	}
	html += '</table></div>';
	d.innerHTML = html;

}
function show_guest_screen() { get_intro(); }
function show_user_intro_screen(is_show_ranking = false, is_start_poll = true) {
	show('dIntro'); clearElement('dIntro');

	intro_show_user_image(Session.cur_user);

	status_message(`hi, ${capitalize(Session.cur_user)}, a game is starting soon...`, { top: 330, classname: 'slow_gradient_blink' });

	if (is_show_ranking) {
		let t = Session.cur_table;
		let fen = t.status == 'past' ? t.fen : get_score_fen_from_cur_players();

		intro_create_score_table(fen, t.friendly);
	}
	if (is_start_poll) poll_for_table_started();

}

//#endregion

//#region onclick.js

function onclick_reload_state() { if (is_admin()) get_tables(); else get_non_admin_reload(); }
function onclick_stop_polling(){ stop_polling(); }
function onclick_toggle_polling(){ toggle_polling_status(); }
function onclick_gameover_screen() {
	let game = Session.cur_game;
	let winners = Session.winners;
	if (!Session.scoring_complete) {
		console.log('scoring...')
		decrease_handicap_if_winstreak(winners, game);
		increase_handicap_if_losestreak();
		Session.scoring_complete = true;
	}
	if (is_admin()) {
		let txt = jsyaml.dump(DB);
		DA.next = get_games;

		//brauch die fen = ranking
		let fen = get_score_fen_from_cur_players();

		to_server({ tid: Session.cur_tid, fen: fen, uname: Session.cur_user, db: txt }, 'save_and_delete');

		//get_games(); 
	}else {
		get_got_user_in_intro_screen();
		let t = Session.cur_table;
		let fen = t.status == 'past' ? t.fen : get_score_fen_from_cur_players();

		intro_create_score_table(fen, t.friendly);

	}
	//to_server({ tid: Session.cur_tid, uname: Session.cur_user }, 'seen');
}
function onclick_settings(){if (Session.cur_menu != 'play') return; present_resume_game_options();}
function onclick_resume_game_button(){
	console.assert(is_admin(), 'non admin is creating game!!!!!!!!!!!');
	collect_game_options();
	get_modify_table();
}

function onclick_game_in_games_menu(ev) {
	Session.cur_game = ev_to_gname(ev);

	set_cur_tid_for_game();

	if (nundef(Session.cur_tid) && is_admin()) { present_game_options(Session.cur_game); }
	else if (isdef(Session.cur_tid)) get_play();
}
function onclick_create_game_button() {

	console.assert(is_admin(), 'non admin is creating game!!!!!!!!!!!');

	collect_game_options();

	get_create_table();
}
function onclick_play() {
	if (!menu_enabled('play')) return;
	stop_game();
	let tid = Session.cur_tid;
	if (isdef(tid)) get_play();
	else if (is_admin()) get_games();
	else show_user_intro_screen();
	//can I assume that tables_by_game exists?
	//graceful behavior:
	//was soll passieren wenn es ueberhaupt keine table gibt?
	//was soll passieren wenn keine table fuer cur_game habe aber schon irgendeine most_recent table?
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
	let words = splitAtAnyOf(text, ', \n');
	//console.log('text', text, 'words', words);

	//provide for startlevel

	let names = [];
	let levels = {};
	for (const w of words) {
		if (w.indexOf('(') < 0) { names.push(w); continue; }
		let name = stringBefore(w, '(');
		let level = firstNumber(w);
		//console.log('name', name, 'level', level);
		levels[name] = level;
		names.push(name);
	}
	console.log('levels', levels, 'names', names);
	if (!isEmpty(get_keys(levels))) {
		for (const n in levels) {
			lookupSetOverride(DB.users, [n, 'games', Session.cur_game, 'startlevel'], levels[n]);
		}
		db_save();
	}

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

	let final_players = get_def_players_for_user(Session.cur_user, names);
	populate_players(final_players);
}
function onclick_user(ev) { let name = ev.target.innerHTML; load_user(name); get_tables(); }

function onclick_user_login(e) {
	e.preventDefault(); e.cancelBubble = true;
	var username = e.target.getAttribute("username");
	if (e.target.id == "") {
		username = e.target.parentNode.getAttribute("username");
	}
	load_user(username);

	get_tables();

}

function onclick_delete_table() { stop_game(); if (isdef(Session.cur_tid)) { delete_current_table(); } }
function onclick_reset_tables() { stop_game(); DA.next = get_games; to_server({}, 'reset_tables'); }
function onclick_test_create1() { get_create_table(); }
function onclick_reset_user() { reset_game_values_for_user(Session.cur_user); db_save(); }
function onclick_reset_db() { reset_db_values(); db_save(); }
function onclick_log_session() { log_object(Session); }

function onclick_header(ev) { if (!is_admin() && ev.path[0].id != 'header') return; open_sidebar(); close_mini_user_info(); }
function onclick_left_panel(ev) { if (ev.path[0].id != 'left_panel') return; close_sidebar(); open_mini_user_info(); }
function onclick_toggle_sidebar(ev) { evNoBubble(ev); toggle_sidebar(); toggle_mini_user_info(); }
function onclick_internet() { toogle_internet_status(); }
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


//#endregion

//#region polling.js

IS_POLLING_ALLOWED = true;
function allow_polling() { IS_POLLING_ALLOWED = true;if (isdef(DA.poll)) poll(); }
function is_polling_on() { return IS_POLLING_ALLOWED; }
function stop_polling() { clearTimeout(TOTicker); IS_POLLING_ALLOWED = false; console.log('polling is OFF'); }
function start_polling(data, type, onsuccess, ms = 5000) {
	DA.poll = {
		data: data,
		type: type,
		onsuccess: onsuccess,
		ms: ms,
	};

	poll();
}
function poll() { if (IS_POLLING_ALLOWED) to_server(DA.poll.data, DA.poll.type); else console.log('polling OFF!') }

function poll_for_table_started() {
	//let username = Session.cur_user;
	start_polling(Session.cur_user, 'poll_table_started', on_poll_table_started, 3000); //, 5000); //check_table_exists, 5000);
}
function poll_for_table_show() {
	//let username = Session.cur_user;
	start_polling({ uname: Session.cur_user, tid: Session.cur_tid }, 'poll_table_show', on_poll_table_show, 3000); //, 5000); //check_table_exists, 5000);
}
function poll_for_table_seen_or_deleted() {
	//let username = Session.cur_user;
	start_polling({ uname: Session.cur_user, tid: Session.cur_tid }, 'poll_table_seen', on_poll_table_seen, 3000); //, 5000); //check_table_exists, 5000);
}

// poll_table_started:
function check_poll_table_started(obj) {
	console.log('obj', obj);
	if (isdef(obj) && !isEmpty(obj.tables)) {
		DA.poll.onsuccess(obj);
	} else {
		TOTicker = setTimeout(poll, DA.poll.ms);
	}
}
function on_poll_table_started(obj) {

	//the first table contains user start data in fen!
	//t.players.map(x=>`${x}:${get_startlevel(x,t.game)}:${get_preferred_lang(x)}`).join(',');
	let t = obj.tables[0];
	set_start_data_from_fen(t.fen,t.game);
	Session.cur_tid = t.id;
	Session.cur_game = t.game;

	delete DA.poll;
	status_message_off();
	clearElement('dIntro');
	hide('dIntro');
	close_sidebar();
	mBy('user_info_mini').style.display = 'flex';

	//load_user();
	get_play();

}

// poll_table_show:
function check_poll_table_show(obj) {
	//console.log('obj', obj);
	if (isdef(obj) && !isEmpty(obj.table) && obj.table.status == 'show') {
		DA.poll.onsuccess(obj);
	} else {
		TOTicker = setTimeout(poll, DA.poll.ms);
	}
}
function on_poll_table_show(obj) {
	delete DA.poll;
	status_message_off();
	present_table(obj);

}

// poll_table_seen:
function check_poll_table_seen(obj) {
	console.assert(isdef(obj.table), 'check_poll_table_seen NO TABLE!!!!');

	let t = obj.table;
	if (t.status == 'seen' || t.status == 'past') {
		DA.poll.onsuccess(obj);
	} else {
		TOTicker = setTimeout(poll, DA.poll.ms);
	}
}
function on_poll_table_seen(obj) {
	delete DA.poll;

	update_session(obj); //updates cur_table and cur_players,cur_others,cur_me
	if (is_game_host()) {
		//first save and then delete this table!
		//console.log('host is', Session.cur_user, 'save db...');
		let txt = jsyaml.dump(DB);
		DA.next = get_games;

		//brauch die fen = ranking
		let fen = get_score_fen_from_cur_players();

		to_server({ tid: Session.cur_tid, fen: fen, uname: Session.cur_user, db: txt }, 'save_and_delete');
		//remove all db save and delete table from work! and from server.js

	} else {

		show_user_intro_screen(true);
	}

}



//#endregion

//#region server.js
function from_server(result, type) {
	if (type == "modify_table") { console.log('______from server:', type, '\nresult:', result); }// return; }
	//console.log('______from server:',type,'\nresult:', result); return;

	if (result.trim() == "") return;
	//console.log('result size',result.length);
	var obj = JSON.parse(result);
	//console.log('obj',obj);

	convert_from_server(obj); //number strings => number, players => list, string starting with '{'=:JSON.parse

	switch (type) {
		//non_admin routes:
		case "intro": got_intro(obj); break;

		case 'non_admin_reload': got_non_admin_reload(obj); break;

		case "games": got_games(obj); break;
		case "play_start": got_play_start(obj); break;
		case "play": got_play(obj); break;

		case 'modify_table': got_modify_table(obj); break;
		case 'create_table_and_start': got_create_table(obj);break;
		
		case 'send_move': got_send_move(obj); break;

		case 'seen': poll_for_table_seen_or_deleted(); break;
		case 'standard_assets':
		case 'assets': assets_parse(obj.response); break;
		case 'dictionary': got_dictionary(obj); break;

		case "get_tables": got_tables(obj); break;
		case "get_user_game_tables": got_user_game_tables(obj); break;
		case "poll_table_started": check_poll_table_started(obj); break;


		case "poll_table_show": check_poll_table_show(obj); break;
		case "poll_table_seen": check_poll_table_seen(obj); break;
		case "get_past_tables": test_user_endscreen(obj); break;

		case "contacts": present_contacts(obj); break;
		case "login": present_login(obj); break;

		case "dbsave": console.log('db has been saved to server:'); break; //,obj.message,obj.data)console.log('dbsave', obj); break;
		case 'delete_table': get_games(obj); break;
		case 'save_and_delete': alert(`${obj.message}, ranking:${obj.fen}`);
			console.assert(is_admin(), 'SAVE_AND_DELETE NOT SENT BEI ADMIN!!!!');

			get_games();
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
	//console.log('...to_server:', type, type == 'send_move' ? req.player_status : ''); //, '\nreq', req);
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
			response.users = usernames.map(x => DB.users[x]);
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
		case "user_info": ensure_assets_old(obj); start(); break;
		// case "user_info": ensure_assets_old(obj); start_with_basic_assets(); break;
		default: alert('handle_result with type == ' + obj.data_type); break;
	}
}
//#endregion



//#endregion

//#region settings.js
function populate_game_settings(dParent) {
	//console.log('HALLO!!!!!!!!!!!!!');
	Session.game_options.game = {};

	//wo find ich possible settings?
	let poss = DB.games[Session.cur_game].options;
	if (nundef(poss)) return;

	for (const p in poss) {



		//p is the name of the variable
		//poss[p] are possible values
		//can be string of strings or numbers =>convert to string list or number list and make it a radio
		//can be true or false => make it a checkbox
		//=>todo: could be a range as well
		let key = p;
		let val = poss[p];
		if (isString(val)) {
			// make a list 
			let list = val.split(','); //besser!!!

			let fs = mRadioGroup(dParent, {}, `d_${key}`, key);
			let checkfirst = true;
			for (const v of list) {
				let d = mRadio(v, isNumber(v) ? Number(v) : v, fs, { cursor: 'pointer' }, null, key);
				if (checkfirst) {
					//let el = mBy(`i_mode_${mode}`).checked = true;
					let inp = d.firstChild;//.firstchild.checked=true;checkfirst = false;
					inp.setAttribute('checked', true); // = true;
					//console.log('should be input',inp);
					checkfirst = false;
				}
			}

			measure_fieldset(fs);

		} else if (val === true || val === false) {
			//wie mach ich eine checkbox?
			// NOT IMPLEMENTED!!!
			console.log('should make a checkbox for', key);
		}
	}

}
function populate_playmode(d, modes) {
	//only multi is enabled right now!!!!
	let group = mRadioGroup(d, {}, 'd_mode', 'play mode');

	modes = modes.split(',');
	//console.log('modes', modes);
	for (const m of modes) {
		let name = m == 'pp' ? 'pass&play' : m == 'multi' ? 'multiplayer' : m;
		//let d = mRadio(name, m, group, {cursor:'pointer'}, v => { Session.game_options.mode = v; populate_players(v); }, 'mode'); //{h:40,w:150,bg:'red'},'mode');
		let d = mRadio(name, m, group, { cursor: 'default' }, null, 'mode');
		let inp = d.firstChild;
		inp.setAttribute('disabled', true);
		if (m != 'multi') mClass(d, 'disabled');
		//let d = mRadioAttrappe(name, m, group, {});
		//for(el of [d,d.firstChild,d.children[1]])		mClass(el,m=='multi'?'enabled':'disabled');
	}

	measure_fieldset(group);

	//at population, set first option or param defaultMode
	let mode = Session.game_options.mode = modes.includes(Session.def_playmode) ? Session.def_playmode : modes[0];
	let el = mBy(`i_mode_${mode}`).checked = true;

}
function populate_players(list) {
	let d = mBy('d_players');
	if (nundef(d)) return;
	mRemoveChildrenFromIndex(d, 1);
	Session.game_options.players = [];

	//multi mode: TODO select/add/remove players for now: fixed Session.def_players
	for (const name of list) {
		Session.game_options.players.push(name); //initially all default players are in list

		let d1 = mDiv(d,{},'dpl_'+name);
		let b=mButton('edit',ev=>open_player_editor(ev),d1);

		//host cannot be removed from player list!
		let label = `${name} (${get_startlevel(name,Session.cur_game)} ${get_preferred_lang(name)})`;
		if (name == Session.cur_user) { let el = mToggle(label, name, d1,{display:'inline'}); el.firstChild.setAttribute('disabled', true); }
		else { mToggle(label, name, d1, { cursor: 'pointer',display:'inline' }); }

	}

	measure_fieldset(d);

	let styles = { fz: 14, wmin: '90%',matop:8 };
	mButton('clear all', clear_all_players, d_players, styles, null, 'b_clear_players');
	mButton('add players', add_players, d_players, styles, null, 'b_add_players');
	mButton('hand select', hand_select, d_players, styles, null, 'b_select_players');
	mButton('reduce', reduce_to_current_players, d_players, styles, null, 'b_reduce_players');
	mButton('show all', show_all_players, d_players, styles, null, 'b_show_all_players');


	// d_players.innerHTML += '<br>';
	// mTextArea(3, 20, d_players, { fz: 16, display: 'none', resize: 'none', border: 'none', outline: 'none' }, 'ta_edit_players');
	// d_players.innerHTML += '<br>';
	// //mLinebreak(d_players,0);

	// mButton('edit', onclick_edit_players, d_players, { fz: 14, wmin: '90%' }, null, 'b_edit_players');

}

function reduce_to_current_players(){
	let d = mBy('d_players');
	let checkboxes = d.getElementsByTagName('input');
	let list = [];
	for (const chk of checkboxes) {
		if (chk.checked) {
			//console.log('player',chk.value,'is in game');
			list.push(chk.value);
		}
	}
	populate_players(list);
}
function show_all_players(){	populate_players(get_def_players_for_user(Session.cur_user));}
function present_resume_game_options() {
	let gname = Session.cur_game;
	let g = DB.games[gname];
	Session.game_options = {};

	let d = mBy('inner_left_panel');
	let game = DB.games[Session.cur_game];
	let html = `
	<div id="lobby_holder" class="layout_lobby">
		<div id="lobby_header"><div class='logo'>⛱</div>Settings for ${game.friendly}</div>

		<div id="lobby_main">
				<div id='d_game_options' class='vCenterChildren'>
				</div>
				<div class="button_wrapper">
					<button id='bJoinGame' class='button' style='display:none'>join game</button>
					<button id='bCreateGame' class='button' onclick='onclick_create_game_button()' style='display:none'>create game</button>
					<button id='bResumeGame' class='button' onclick='onclick_resume_game_button()'>resume game</button>
					<button id='bLobbyOk' class='button' onclick='onClickCreateGameOk()' style='display:none'>Ok</button>
					<button id='bLobbyCancel' class='button' onclick='onClickCreateGameCancel()' style='display:none'>Cancel</button>
					<button id='bLobbyJoinOk' class='button' onclick='onClickJoinGameOk()' style='display:none'>Ok</button>
					<button id='bLobbyJoinCancel' class='button' onclick='onClickJoinGameCancel()' style='display:none'>Cancel</button>
				</div>
			</div>
		</div>

	`;
	d.innerHTML = html;
	let d1 = mBy('d_game_options');

	group = mRadioGroup(d1, { wmin: 190 }, 'd_players', 'players'); //create another fieldset with legend players

	populate_game_settings(d1);

	populate_playmode(d1, g.av_modes);
	populate_players(get_def_players_for_user(Session.cur_user));


}
function close_game_options() { mBy('inner_left_panel').innerHTML = ''; }
function extract_game_options() {
	//hier werden die options in game menu eingelesen
	let opt = Session.game_options;
	//players: TODO!!!
	//opt.players = Session.def_players;
	//mode: automatically set in options menu
	//at the end of this, Session.game_options should be up-to-date!
	return Session.game_options;
}
function get_lobby() {
	let game = DB.games[Session.cur_game];
	let html = `
	<div id="lobby_holder" class="layout_lobby">
		<div id="lobby_header"><div class='logo'>⛱</div>Settings for ${game.friendly}</div>

		<div id="lobby_main">
				<div id='d_game_options' class='vCenterChildren'>
				</div>
				<div class="button_wrapper">
					<button id='bJoinGame' class='button' style='display:none'>join game</button>
					<button id='bCreateGame' class='button' onclick='onclick_create_game_button()'>create game</button>
					<button id='bResumeGame' class='button' onclick='onclick_resume_game_button()' style='display:none'>resume game</button>
					<button id='bLobbyOk' class='button' onclick='onClickCreateGameOk()' style='display:none'>Ok</button>
					<button id='bLobbyCancel' class='button' onclick='onClickCreateGameCancel()' style='display:none'>Cancel</button>
					<button id='bLobbyJoinOk' class='button' onclick='onClickJoinGameOk()' style='display:none'>Ok</button>
					<button id='bLobbyJoinCancel' class='button' onclick='onClickJoinGameCancel()' style='display:none'>Cancel</button>
				</div>
			</div>
		</div>

	`;
	return html;// createElementFromHTML(html);
}
function present_game_options() {
	let gname = Session.cur_game;
	let g = DB.games[gname];
	Session.game_options = {};

	let d = mBy('inner_left_panel');
	d.innerHTML = get_lobby();
	let d1 = mBy('d_game_options');

	group = mRadioGroup(d1, { wmin: 190 }, 'd_players', 'players'); //create another fieldset with legend players

	populate_game_settings(d1);

	populate_playmode(d1, g.av_modes);
	populate_players(get_def_players_for_user(Session.cur_user));


}
function mTextArea(rows, cols, dParent, styles = {}, id) {
	let html = `<textarea id="${id}" rows="${rows}" cols="${cols}" wrap="hard"></textarea>`;
	let t = createElementFromHTML(html);
	mAppend(dParent, t);
	mStyle(t, styles);
	return t;
}
function clear_all_players(){
	console.log('trying to clear!!!')
	let d=mBy('d_players');
	let children = d.getElementsByTagName('input');
	console.log('children',children);
	
	for(const ch of children){if (!ch.getAttribute('disabled')) ch.checked=false;}
	//Session.game_options.players = [];
}
function open_player_editor(ev){
	console.log('ev',ev)
	let id = evToId(ev);
	console.log('open player editor for player ',id);
	let uname = id.substring(4);
	let game = Session.cur_game;
	console.log('player is',uname);
	let res = prompt(`enter [level lang] for player ${uname}: `);
	console.log('user entered',res);
	let parts = splitAtAnyOf(res,' ,');
	let level='none',lang='none';
	if (parts.length >=1) {level=set_startlevel(uname,game,Number(parts[0]));}
	if (parts.length >=2) {lang=set_preferred_lang(uname,parts[1]); }
	console.log('selected language',lang,'and level',level);
	console.log('should save DB',DB.users[uname]);
	if (isdef(DB.users[uname])) db_save();
	populate_players(Session.game_options.players);
	//let d=mDiv(ev.target,{position:'absolute',top:10,left:10})
}
function add_players(){
	//open selection of contacts and let them be clicked then DONE
	//the resulting players are added to the list
	let res = prompt('enter player names to be added: ');
	let parts = splitAtAnyOf(res,' ,');
	let list = Session.game_options.players.slice(1); //removing mimi
	for(const p of parts) {
		let name = p.toLowerCase().trim();
		if (isdef(DB.users[name])) addIf(list,name);
	}
	list.sort();list.unshift(Session.cur_user);
	populate_players(list);
}
function hand_select(){
	//open selection of contacts and let them be clicked then DONE
	//the resulting players are the only ones on the list + mimi natuerlich!
	let res = prompt('enter player names: ');
	let parts = splitAtAnyOf(res,' ,');
	let list = [];
	for(const p of parts) {
		let name = p.toLowerCase().trim();
		if (isdef(DB.users[name])) addIf(list,name);
	}
	list.sort();list.unshift(Session.cur_user);
	populate_players(list);
}

function populate_players_v0(list) {
	let d = mBy('d_players');
	if (nundef(d)) return;
	mRemoveChildrenFromIndex(d, 1);
	Session.game_options.players = [];

	//multi mode: TODO select/add/remove players for now: fixed Session.def_players
	for (const name of list) {
		Session.game_options.players.push(name); //initially all default players are in list

		//host cannot be removed from player list!
		if (name == Session.cur_user) { let el = mToggle(name, name, d); el.firstChild.setAttribute('disabled', true); }
		else { mToggle(name, name, d, { cursor: 'pointer' }); }

	}

	d_players.innerHTML += '<br>';
	mTextArea(3, 20, d_players, { fz: 16, display: 'none', resize: 'none', border: 'none', outline: 'none' }, 'ta_edit_players');
	d_players.innerHTML += '<br>';
	//mLinebreak(d_players,0);

	measure_fieldset(d);

	mButton('edit', onclick_edit_players, d_players, { fz: 14, wmin: '90%' }, null, 'b_edit_players');

}



//#endregion

//#region start.js 
function start_prelims() {
	Speech = new Speaker('E'); 
	TOMan = new TimeoutManager();
	ColorThiefObject = new ColorThief();
	init_internet();
	init_keyhandlers();

	mBy('label_games').onclick = onclick_games;
	mBy('label_play').onclick = onclick_play;
	mBy('label_account').onclick = onclick_account;
	mBy('label_login').onclick = onclick_login;
	mBy('label_settings').onclick = onclick_settings;

	//set globals here to avoid override by saved or other
	Session.cur_user = valf(queryStringToJson().user, 'guest');
	Session.cur_menu = 'games'; 
	Session.cur_game = 'gSpotit'; 
	Session.def_playmode = 'multi'; 
	Session.def_players = ['mimi', 'felix']; 
	Session.def_players = ['mimi','afia','amanda','annabel','blade','felix','gul','lauren','mac','nasi','sarah','valerie']; 
	Session.cur_chatter = 'gul'; 

	go_online(); // nur LG simulate internet - lassen denn es stoert ueberhaupt nicht!
	get_data(queryStringToJson(), 'user_info'); //NOTFALLS! old api habs nicht geschafft das mit new api zu machen!
	//=>wird in start_with_base_assets starten!
}
function start_with_basic_assets() {
	//hier ist user name entweder unknown oder vom queryString!
	//wenn mit https://www.telecave.net/aroot/bg gestartet wird, ist man hier ein guest!
	//guest screen bedeutet: NUR ein screen auf dem die contacts sind!!!
	if (is_admin()) {
		hide('dIntro');
		let user = load_user(Session.cur_user); //queryStringToJson().user); //test0_load_user();
		loader_off();
		DA.next = get_dictionary();
		get_games();
		show('b_polling');

	}else{
		close_sidebar();
		mBy('user_info_mini').style.display = 'flex';
		mBy('b_toggle_sidebar').style.display = 'none';
		show('dIntro');
		get_intro();
	}
}

//#endregion

//#region work_game.js 

function race_update_my_score(inc) {
	let me = Session.cur_me;
	me.score += inc;
	if (me.score >= Session.winning_score) me.player_status = 'done'; //*** player winning ****/

}
function race_check_endcondition() {
	let players = get_values(Session.cur_players);
	//console.log(players.map(x=>'score:'+x.score));
	//console.log('')
	let winners = players.filter(x => x.score >= Session.winning_score).map(x => x.name); //allCondDict(players, x => x.score >= Session.winning_score);

	return winners;

}
function race_set_fen() {
	let me = Session.cur_players[Session.cur_user];

	let fen = Session.cur_funcs.fen();
	//console.log('fen',fen);
	me.state = fen;

}

function gSpotit() {
	function spotit_card(info, dParent, cardStyles, onClickSym) {
		copyKeys({ w: CSZ, h: CSZ }, cardStyles);

		// //let card_container = mDiv(dParent,{padding:20});
		// mStyle(dParent,{bg:'red',hmin:CSZ+50});
		// let x = mDiv(dParent,{margin:20, w:200,h:200, bg:'white',fg:'black'},getUID(),'hallo','card',false);
		// return x;	

		let card = cRound(dParent, cardStyles, info.id);
		// return card;

		addKeys(info, card);

		let d = iDiv(card);
		card.pattern = fillColarr(card.colarr, card.keys);

		//could make each pattern be object {key:card.key,scale:card.scale}
		//instead of line above do this to include scale in pattern!
		let zipped = [];
		//console.log(card.scales);
		for (let i = 0; i < card.keys.length; i++) {
			zipped.push({ key: card.keys[i], scale: card.scales[i] });
		}
		card.pattern = fillColarr(card.colarr, zipped);

		// symSize: abhaengig von rows
		let symStyles = { sz: CSZ / (card.rows + 1), fg: 'random', hmargin: 8, vmargin: 4, cursor: 'pointer' };
		//console.log('sz',symStyles.sz,info.rows,info.cols);

		let syms = [];
		mRowsX(iDiv(card), card.pattern, symStyles, { 'justify-content': 'center' }, { 'justify-content': 'center' }, syms);
		for (let i = 0; i < info.keys.length; i++) {
			let key = card.keys[i];
			let sym = syms[i];
			card.live[key] = sym;
			sym.setAttribute('key', key);
			sym.onclick = onClickSym;
		}

		return card;
	}
	function spotit_deal(numCards, rows, cols, vocab, lang, min_scale, max_scale, fen) {
		lang = valf(lang, 'E');
		let colarr = _calc_hex_col_array(rows, cols);

		console.log('scales',min_scale,max_scale);

		//correction for certain perCard outcomes:
		if (rows == 3 && cols == 1) { colarr = [1, 3, 1]; }
		else if (rows == 2 && cols == 1) { colarr = [1, 2]; }
		else if (rows == 4 && cols == 1) { rows = 3; colarr = [2, 3, 1]; }
		else if (rows == 5 && cols == 1) { rows = 4; cols = 1; colarr = [1, 3, 3, 1]; }
		else if (rows == 5 && cols == 3) { rows = 5; cols = 1; colarr = [1, 3, 4, 3, 1]; }
		else if (rows == 6 && cols == 2) { rows = 5.5; colarr = [2, 4, 5, 4, 2]; }

		//from here on, rows ONLY determines symbol size! colarr is used for placing elements

		let perCard = arrSum(colarr);
		let nShared = (numCards * (numCards - 1)) / 2;
		let nUnique = perCard - numCards + 1;
		let numKeysNeeded = nShared + numCards * nUnique;
		let nMin = numKeysNeeded + 3;
		let keypool = setKeys({ nMin: nMin, lang: valf(lang, 'E'), key: valf(vocab, 'animals'), keySets: KeySets, filterFunc: (_, x) => !x.includes(' ') });
		//console.log('keys', keypool);

		let keys = choose(keypool, numKeysNeeded);
		let dupls = keys.slice(0, nShared); //these keys are shared: cards 1 and 2 share the first one, 1 and 3 the second one,...
		let uniqs = keys.slice(nShared);
		//console.log('numCards', numCards, '\nperCard', perCard, '\ntotal', keys.length, '\ndupls', dupls, '\nuniqs', uniqs);

		let infos = [];
		for (let i = 0; i < numCards; i++) {
			let keylist = uniqs.slice(i * nUnique, (i + 1) * nUnique);
			//console.log('card unique keys:',card.keys);
			let info = { id: getUID(), shares: {}, keys: keylist, rows: rows, cols: cols, colarr: colarr, num_syms: perCard };
			infos.push(info);
		}

		let iShared = 0;
		for (let i = 0; i < numCards; i++) {
			for (let j = i + 1; j < numCards; j++) {
				let c1 = infos[i];
				let c2 = infos[j];
				let dupl = dupls[iShared++];
				c1.keys.push(dupl);
				c1.shares[c2.id] = dupl;
				c2.shares[c1.id] = dupl;
				c2.keys.push(dupl);
				//each gets a shared card
			}
		}

		for (const info of infos) { shuffle(info.keys); }

		//for each key make a scale factor
		//console.log('min_scale',min_scale,'max_scale',max_scale);
		for (const info of infos) {

			// info.scales = info.keys.map(x => randomNumber(min_scale * 100, max_scale * 100) / 100);
			info.scales = info.keys.map(x => chooseRandom([.5, .75, 1, 1.25]));

			//chooseRandom([.5, .75, 1, 1.25]);
			//info.scales = info.scales.map(x=>coin()?x:-x);
		}

		//spotit fen muss ein string sein!
		if (!isEmpty(fen)) {
			let ks_for_cards = fen.split(',');
			for (let i = 0; i < infos.length; i++) {
				let info = infos[i];
				//console.log('vorher', jsCopy(info.keys), jsCopy(info.scales));
				let ks_list = ks_for_cards[i].split(' ');
				info.keys = ks_list.map(x => stringBefore(x, ':'));
				info.scales = ks_list.map(x => stringAfter(x, ':')).map(x => Number(x));
				//console.log('nachher', info.keys, info.scales);
			}
		}


		let items = [];
		for (const info of infos) {
			let item = spotit_card(info, dTable, { margin: 20 }, spotit_interact);
			//mStyle(iDiv(item), { animation: 'appear 1s ease' });
			items.push(item);
		}

		return items;

	}
	function spotit_prompt(g, fen) {
		return spotit_deal(g.num_cards, g.rows, g.cols, g.vocab, g.lang, g.min_scale, g.max_scale, fen);
	}
	function spotit_evaluate() {
		//console.log('evaluating move: was soll geschehen?')
		if (!canAct()) return;
		uiActivated = false; clear_timeouts();
		IsAnswerCorrect = Selected.isCorrect;

		race_set_fen();
		race_update_my_score(IsAnswerCorrect ? 1 : 0);

		//console.log('move ist correct?', IsAnswerCorrect ? 'JA!' : 'nope');
		let delay = show_feedback(IsAnswerCorrect);

		setTimeout(() => {
			in_game_open_prompt_off();
			clear_table_events();
			get_send_move();
		}, delay);

	}
	function spotit_interact(ev) {
		ev.cancelBubble = true;
		if (!canAct()) { console.log('no act'); return; }

		let keyClicked = evToProp(ev, 'key');
		let id = evToId(ev);

		if (isdef(keyClicked) && isdef(Items[id])) {
			let item = Items[id];
			//console.log('clicked key', keyClicked, 'of card', id, item);
			if (Object.values(item.shares).includes(keyClicked)) {
				let otherCard = spotitFindCardSharingSymbol(item, keyClicked);
				//console.log('otherCard', otherCard);
				let cardSymbol = ev.target;
				let otherSymbol = spotitFindSymbol(otherCard, keyClicked);
				//console.log('otherSymbol', otherSymbol);
				//mach die success markers auf die 2 symbols!
				Selected = { isCorrect: true, feedbackUI: [cardSymbol, otherSymbol] };

			} else {
				//console.log('fail!!!!!!!!'); //fail
				let cardSymbol = ev.target;
				Selected = { isCorrect: false, feedbackUI: [cardSymbol], correctUis: spotit_get_shared_symbols(), correctionDelay: Session.items.length * 1500 };

			}
			spotit_evaluate();
		}
	}
	function spotit_get_shared_symbols() {
		let result = [];
		for (const item of Session.items) {
			for (const id in item.shares) {
				let k = item.shares[id];
				let ui = iGetl(item, k);
				result.push(ui);
			}
		}
		return result;
	}
	function spotit_fen() {
		let items = Session.items;

		//state in spotit game is just 'key key..., key key...'
		let fen = items.map(x => x.keys.join(' ')).join(',');

		//neu: 'k:s k:s...,k:s k:s...
		let item_fens = [];
		for (const item of items) {
			let arr = arrFlatten(item.pattern);
			let ifen = arr.map(x => `${x.key}:${x.scale}`).join(' ');
			item_fens.push(ifen);
		}

		fen = item_fens.join(',');
		return fen;
	}
	return {
		prompt: spotit_prompt,
		fen: spotit_fen,
	}
}

function gMaze() {
	function clear_graph() { if (nundef(Goal)) return; let cy = lookup(Goal, ['maze', 'cy']); if (cy) cy.destroy(); }

	function maze_prompt(g, fen) {
		let [rows, cols, sz, gap] = [g.rows, g.cols, g.sz, g.gap];

		clear_graph();
		//console.log('rows',rows,'cols',cols);
		let maze = new MazeGraph(dTable, rows, cols, sz, gap);
		//console.log('maze', maze);
		setRectInt(maze.dGraph);

		mLinebreak(dTable, 12);

		//set content of start and goal cells
		let cellStart = maze.getTopLeftCell();
		mCellContent(iDiv(cellStart), { w: '60%', h: '60%', fz: '50%', padding: '5%', bg: 'green', fg: 'white', rounding: '50%' }, 'A');
		let cellGoal = maze.getBottomRightCell();
		mCellContent(iDiv(cellGoal), { w: '60%', h: '60%', fz: '50%', padding: '5%', bg: 'red', fg: 'white', rounding: '50%' }, 'B');

		let [roomFrom, roomTo] = [cellStart.nodeId, cellGoal.nodeId];

		if (isdef(fen)) {
			let instruction = mText('game over!', dTable, { fz: 24, display: 'inline-block' });
			return;
		}


		let instruction = mText('is there a path from A to B?', dTable, { fz: 24, display: 'inline-block' });
		mLinebreak(dTable);

		let path = maze.getShortestPathFromTo(roomFrom, roomTo);

		console.assert(path.length < Infinity, 'WAAAAAAAAAAAAAAS?');
		if (coin()) maze.cutPath(path, .5, .75);
		let len = maze.getLengthOfShortestPath(roomFrom, roomTo); //verify that no longer a path!!!!!

		let is_yes = len != Infinity;

		let byes = mButton('yes', (ev) => maze_eval(is_yes, ev), dTable, { fz: 20 }, ['donebutton', 'buttonClass']);
		let bno = mButton('no', (ev) => maze_eval(!is_yes, ev), dTable, { fz: 20 }, ['donebutton', 'buttonClass']);

		if (is_yes) { Goal = { b_correct: byes, b_wrong: bno, is_yes: true, maze: maze, path: path }; }
		else { Goal = { b_correct: bno, b_wrong: byes, is_yes: false, maze: maze, path: path }; }
		animatePropertyX(dTable, 'opacity', [0, 0, 1], 500, 'both', 'ease', 0);
	}

	function maze_fen() {		return 'nix';	}
	function maze_eval(is_correct, ev) {

		if (!canAct()) return;
		uiActivated = false; clear_timeouts();
		let button_clicked = ev.target;
		//console.log(is_correct ? 'correct' : 'WRONG');

		race_set_fen();
		race_update_my_score(is_correct ? 1 : -1);

		let delay = maze_feedback(is_correct, button_clicked);
		setTimeout(() => {
			in_game_open_prompt_off();
			clear_table_events();
			get_send_move();
		}, delay);

	}
	function maze_feedback(is_correct, button_clicked, show_feedback = true) {
		let delay = !is_correct && show_feedback ? 1000 : 100;
		if (!is_correct) {
			mStyle(Goal.b_correct, { bg: 'green' });
			animate(Goal.b_correct, 'komisch', 1000);
			if (Goal.is_yes) Goal.maze.breadCrumbs(Goal.path); else Goal.maze.colorComponents();

		}
		if (is_correct) { mStyle(button_clicked, { bg: 'green' }); mCheckit(button_clicked, 100); }
		else { mXit(button_clicked); }

		return delay;
	}

	return {
		prompt: maze_prompt,
		fen: maze_fen, //function that again presents last game state! needed when game is over
	}
}

function gAnagram() {
	function anagram_prompt(g, fen) {

		//console.log('fen',fen);
		let [vocab, lang, min, max] = [g.vocab, isdef(fen) ? fen.lang : g.lang, g.minWordLength, g.maxWordLength];

		let keypool = KeySets[vocab];
		keypool = keypool.filter(x => { let w = Syms[x][lang]; let l = w.length; return w.indexOf(' ') < 0 && l >= min && l <= max; });

		//console.log('keypool', k1.map(x => Syms[x][lang])); console.log('lang', lang); return; //jeder hat jetzt sein language!

		let key = isdef(fen) ? fen.key : chooseRandom(keypool); //'carpentry saw'; 
		let pic = mSym(key, dTable, { fz: 100, opacity: g.hidden ? 0 : 1 });
		//console.log('pic', pic);
		if (g.hidden) {
			let d = pic;
			let r = getRect(d, dTable);
			let dHint = mDiv(dTable, { opacity: 0, position: 'absolute', align: 'center', left: 0, w: '100%', top: r.t + r.h / 2 }, null, 'category: ' + Syms[key].subgroup);
			animatePropertyX(dHint, 'opacity', [0, 0, 1], 2000, 'both', 'ease-in', 6000);
			//animatePropertyX(d,'opacity',[0,1],8000,'forwards','ease-out',16000);
		}

		let word = Syms[key][lang].toUpperCase();
		Goal = { div: pic, key: key, word: word, lang: lang };

		mLinebreak(dTable, 12);

		let wTotal = getRect(mBy('table')).w;
		Goal.inputs = show_letter_inputs(word, dTable, wTotal);

		mLinebreak(dTable, 12);
		Goal.letters = show_dd_click_letters(word, dTable, wTotal);

		if (isdef(fen) && isdef(fen.inputs)) {
			distribute_innerHTML(Goal.inputs, fen.inputs, ':');
			distribute_innerHTML(Goal.letters, fen.letters, ':');
		} else {
			mLinebreak(dTable, 12);
			Goal.bDone = mButton('Done!', anagram_eval, dTable, { fz: 28, matop: 10, rounding: 10, hpadding: 16, border: 8 }, ['buttonClass']);
		}

		//add double click feature



		//testing: already fill inputs correctly:
		//zweiter param muss so aussehen wie fen! 
		//let wfen=toLetters(Goal.word).join(':');
		//distribute_innerHTML(Goal.inputs, wfen,':'); //coin()?Goal.word:'ha');
	}

	function anagram_fen() {
		return { key: Goal.key, lang: Goal.lang, inputs: collect_innerHTML(Goal.inputs, ':'), letters: collect_innerHTML(Goal.letters, ':') };
	}
	function anagram_eval() {

		if (!canAct()) return;
		uiActivated = false; clear_timeouts();

		let answer = collect_innerHTML(Goal.inputs);
		let is_correct = answer == Goal.word;

		let is_word;
		if (!is_correct && answer.length == Goal.word.length && is_a_word(answer.toLowerCase(), Session.lang)) is_word = true;

		Selected = { answer: answer, reqAnswer: Goal.word, feedbackUI: Goal.inputs.map(x => iDiv(x)) };

		race_set_fen();
		race_update_my_score(is_correct ? 1 : is_word ? 0 : -1);

		let delay = anagram_feedback(is_correct, is_word);
		setTimeout(() => {
			in_game_open_prompt_off();
			clear_table_events();
			get_send_move();
		}, delay);

	}
	function anagram_feedback(is_correct, is_word, show_feedback = true) {
		let delay = !is_correct && show_feedback ? 1000 : 300;
		let d = iDiv(Goal);
		mStyle(d, { opacity: 1 });
		if (!is_correct) {
			for (let i = 0; i < Goal.word.length; i++) {

				let ch = Goal.word[i];

				let dl = iDiv(Goal.letters[i]);
				dl.innerHTML = ch;
				animate(dl, 'onPulse1', 600);

				if (!is_word) {
					let dwrong = iDiv(Goal.inputs[i]);
					if (dwrong.innerHTML != ch) { mXit(dwrong, 90); }
				}
			}
		} else {
			mCheckit(d, 100);
		}
		return delay;
	}

	return {
		prompt: anagram_prompt,
		fen: anagram_fen, //function that again presents last game state! needed when game is over
	}
}


//from game.js aus chatas: TODO: streamline code! was fuer eine API will ich?
function collect_innerHTML(arr, sep = '') { return arr.map(x => iDiv(x).innerHTML).join(sep); }
function distribute_innerHTML(arr, s, sep = '') {
	let letters = s.split(sep);
	for (let i = 0; i < letters.length; i++) {
		let d = iDiv(arr[i]);
		//console.log('d',d);
		let l = letters[i];
		if (l.length > 1) {
			//console.log('ja, letter ist mehr als 1 lang!!!');
			//unicode
			//l=`\u00c4`; //geht
			//l=`\u` + `${l.substring(1)}`; //geht nicht weil ich '\u' nicht in code schreiben kann!!!!!
			l = '&#x' + l.substring(3) + ';'; // geht!!!!
		}
		d.innerHTML = l; //etters[i];
	}
	return;

	let i = 0; arr.map(x => { iDiv(x).innerHTML = s[i]; if (i < s.length - 1) i++; });
}
function createLetterInputsX(s, dParent, style, idForContainerDiv) {
	let d = mDiv(dParent);
	if (isdef(idForContainerDiv)) d.id = idForContainerDiv;
	inputs = [];
	for (let i = 0; i < s.length; i++) {
		let d1 = mDiv(d);
		d1.innerHTML = s[i];
		mStyle(d1, style);
	}
	return d;
}
function blankInputs(d, ilist, blink = true) {
	let inputs = [];
	for (const idx of ilist) {
		let inp = d.children[idx];
		inp.innerHTML = '_';
		if (blink) mClass(inp, 'blink');
		inputs.push({ letter: Goal.word[idx].toUpperCase(), div: inp, index: idx });
	}
	return inputs;
}
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
		if (nundef(source) && isSource) { //first click: determine new source click on drag source
			toggleSelectionOfPicture(elem);
			DA[aname] = elem;
		} else if (isdef(source)) {
			//second click
			if (isTarget) {
				if (source == elem) {
					console.log('INPUT');
					elem.innerHTML = '_';
				} else {
					elem.innerHTML = source.innerHTML;
				}

				toggleSelectionOfPicture(source);
				DA[aname] = null;
			}
			else if (isSource) {
				toggleSelectionOfPicture(source);
				if (source != elem) { toggleSelectionOfPicture(elem); DA[aname] = elem; }
				else {
					//if this is a letter
					//console.log('HAAAAAAAAAAAAAAAAAAAAAALLLLLLLLLLLLOOOOOOOOOOOO')
					let is_letter = !isTarget;
					if (is_letter) {
						//console.log('LETTER');
						let l = elem.innerHTML;
						//find first available empty input element
						let inp_empty;
						for (const inp of Goal.inputs) {
							//console.log('inp', inp);
							let di = iDiv(inp);
							let inner = di.innerHTML;
							//console.log('inner', inner)
							if (iDiv(inp).innerHTML == '_') { inp_empty = inp; break; }
						}
						if (isdef(inp_empty)) iDiv(inp_empty).innerHTML = l;
					}
					DA[aname] = null;
				}
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

function ipaddX_v1(elem, role) {
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
		if (nundef(source) && isSource) { //first click: determine new source click on drag source
			toggleSelectionOfPicture(elem);
			DA[aname] = elem;
		} else if (isdef(source)) {
			//second click
			if (isTarget) {
				if (source == elem) {
					console.log('INPUT');
					elem.innerHTML = '_';
				} else {
					elem.innerHTML = source.innerHTML;
				}

				toggleSelectionOfPicture(source);
				DA[aname] = null;
			}
			else if (isSource) {
				toggleSelectionOfPicture(source);
				if (source != elem) { toggleSelectionOfPicture(elem); DA[aname] = elem; }
				else {
					//if this is a letter
					//console.log('HAAAAAAAAAAAAAAAAAAAAAALLLLLLLLLLLLOOOOOOOOOOOO')
					let is_letter = !isTarget;
					if (is_letter) {
						//console.log('LETTER');
						let l = elem.innerHTML;
						//find first available empty input element
						let inp_empty;
						for (const inp of Goal.inputs) {
							//console.log('inp', inp);
							let di = iDiv(inp);
							let inner = di.innerHTML;
							//console.log('inner', inner)
							if (iDiv(inp).innerHTML == '_') { inp_empty = inp; break; }
						}
						if (isdef(inp_empty)) iDiv(inp_empty).innerHTML = l;
					}
					DA[aname] = null;
				}
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
function ipaddX_orig(elem, role) {
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
		if (nundef(source) && isSource) { //first click: determine new source click on drag source
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
function toggleSelectionOfPicture(pic, selectedPics) {

	//	console.log(pic)

	let ui = iDiv(pic);
	//if (pic.isSelected){pic.isSelected=false;mRemoveClass(ui,)}
	//console.log('pic selected?',pic.isSelected);
	pic.isSelected = !pic.isSelected;
	if (pic.isSelected) mClass(ui, 'framedPicture'); else mRemoveClass(ui, 'framedPicture');

	//if piclist is given, add or remove pic according to selection state
	if (isdef(selectedPics)) {
		if (pic.isSelected) {
			console.assert(!selectedPics.includes(pic), 'UNSELECTED PIC IN PICLIST!!!!!!!!!!!!')
			selectedPics.push(pic);
		} else {
			console.assert(selectedPics.includes(pic), 'PIC NOT IN PICLIST BUT HAS BEEN SELECTED!!!!!!!!!!!!')
			removeInPlace(selectedPics, pic);
		}
	}
}
function show_dd_click_letters(word, dTable, wTotal, gap = 4) {
	let wmax = wTotal / word.length;
	let fzMax = wmax - 3 * gap;
	fz = Math.min(60, fzMax);
	let dp = createLetterInputsX(word, dTable, { bg: 'silver', display: 'inline-block', fz: fz, w: fz, h: fz * 1.1, margin: 4 }); //,w:40,h:80,margin:10});
	shuffle_children(dp);
	let letters = Array.from(dp.children);
	for (let i = 0; i < letters.length; i++) {
		let l = letters[i];
		l.setAttribute('draggable', true);
		ipaddX(l, 'source');
		l.id = 'letter' + i;
	}
	return letters;
}
function show_letter_inputs(word, dTable, wTotal, gap = 4) {
	let fzMax = wTotal / word.length - 3 * gap;
	let fz = Math.min(70, fzMax);
	let dpEmpty = createLetterInputsX(word, dTable, { pabottom: 5, bg: 'grey', display: 'inline-block', fz: fz, w: fz, h: fz * 1.1, margin: gap }); //,w:40,h:80,margin:10});
	let inputs = blankInputs(dpEmpty, range(0, word.length - 1), false);
	for (let i = 0; i < inputs.length; i++) {
		let l = iDiv(inputs[i]);
		ipaddX(l, 'both');
		mClass(l, 'dropzone');
		l.id = 'input' + i;
	}
	return inputs;
}



//#endregion

//#region work_help.js 
//#region account
function get_account() {
	let udata = get_current_userdata();
	mBy("inner_left_panel").innerHTML = createAccountContent(udata);
	// to_server(Session.cur_user, "contacts", php); 
}
function addColorPicker(c) {
	//console.log('addColorPicker geht!',c);
	//if (DA.colorPickerLoaded) return;
	//DA.colorPickerLoaded=true;
	let form = mBy('myform');
	let img = mBy('imgPreview');
	//let c = Session.cur_me.color; //get_user_color()
	let picker = mColorPickerBehavior(anyColorToStandardString(c), img, form,
		(a) => { DA.newColor = a; DA.colorChanged = true; },
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
	if (DA.imageChanged) {
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
			//console.log('changed!');
			DA.next = get_login;
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
			<form id="myform" autocomplete="off" style='text-align:center;background:${userdata.color}'>
				<span id='img_dd_instruction' style="font-size:11px;">drag and drop an image to change</span><br>
				<img id="imgPreview" onload='addColorPicker("${userdata.color}");' src='${get_image_path(userdata)}' ondragover="handle_drag_and_drop(event)" ondrop="handle_drag_and_drop(event)" ondragleave="handle_drag_and_drop(event)"
					style="height:200px;margin:10px;" />
				<input id='iUsername' type="text" name="motto" placeholder='motto' value="${userdata.motto}" autofocus
					onkeydown="if (event.keyCode === 13){event.preventDefault();collect_data(event);}" />
				<br />
				<input id='save_settings_button' type="button" value="Submit" onclick="collect_data(event)" ><br>
			</form>
	</div></div>
	`; //onload='addColorPicker(${userdata.color})' 
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
				get_login();
				//window.location.replace('index.html');
			}
		};
	});
}
//#endregion

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
function ensure_assets_old(obj) {
	DB = jsyaml.load(obj.db);
	symbolDict = Syms = jsyaml.load(obj.syms);
	SymKeys = Object.keys(Syms);
	ByGroupSubgroup = jsyaml.load(obj.symGSG);
	WordP = jsyaml.load(obj.allWP);
	C52 = jsyaml.load(obj.c52);
	Cinno = jsyaml.load(obj.cinno);
	FenPositionList = csv2list(obj.fens);
	KeySets = getKeySets();
	if (isdef(obj.edict)) { Dictionary = { E: to_words(obj.edict), S: to_words(obj.sdict), F: to_words(obj.fdict), D: to_words(obj.ddict) } };
	console.assert(isdef(DB), 'NO DB!!!!!!!!!!!!!!!!!!!!!!!!!!!');
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
		//changing user image
		console.log('===>dropped on target:', e.target);
		e.preventDefault();
		DA.imageChanged = true;
		mClassRemove(e.target, "dragging");
		mDropImage(e, e.target);
	} else {
		mClassRemove(e.target, "dragging");
	}
}
//#endregion

//#region games menu
function present_games_dep(obj) {
	bygame = set_tables_by_game(obj);
	Session.cur_tid = !isEmpty(obj.tables) ? obj.tables[0].id : null;
	mBy('inner_left_panel').innerHTML = createGamesContent(dict2list(DB.games), bygame);
	mCenterCenterFlex(mBy('game_menu'));
}
function createGamesContent(mygames, tables = {}) {
	let mydata = uiGetGamesStylesAndStart();
	mydata += uiGetGames(mygames, tables);
	return mydata;
}
function uiGetGamesStylesAndStart() {
	let mydata = `
	<style>

 		.contact{
 			cursor:pointer;
 			transition: all .5s cubic-bezier(0.68, -2, 0.265, 1.55);
	 	}

	 	.contact:hover{
	 		transform: scale(1.1);
	 	}

	</style>
	<div id='game_menu' style="text-align: center; animation: appear 1s ease both">
  `;
	return mydata;
}
function uiGetGames(mygames, tables) {
	mydata = '';
	for (const r of mygames) {
		row = r;
		mydata += uiGetGame(row, tables[r.id]);
	}
	return mydata;
}
function uiGetGame(gi, tables = []) {
	//tables is: tables of that game! gi.id
	//console.log('* gi.id * tables', tables);
	let sym = Syms[gi.logo];
	let bg = getColorDictColor(gi.color);
	let gname = gi.id;
	let uname = Session.cur_user;
	let color = null, id = getUID();
	if (!isEmpty(tables)) { //!isEmpty(tables)) {
		let t = tables[0];
		//for color look at first of tables (=most recent!)

		let table_status = t.status;
		let my_status = t.player_status;
		let have_another_move = my_status == 'joined';

		// color = have_another_move ? 'green' //lookup(Session,['t_play',gname])?'green'
		// 	: t.player_status == 'join' ? 'orange'
		// 		: t.host == uname && t.status == 'ready' ? 'yellow'
		// 			: table_status == 'show' || t.status == 'seen' ? 'blue'
		// 				: t.status == 'ending' ? 'red' : 'black';
		color = have_another_move ? 'green' //lookup(Session,['t_play',gname])?'green'
			: t.player_status == 'join' ? 'orange'
				: t.host == uname && t.status == 'ready' ? 'yellow'
					: table_status != 'past' ? 'red' : 'black';
		id = `rk_${t.id}`;
		//console.log(':::Scolor is', color ? color : 'null');
	}
	return `
	<div onclick="onclick_game_in_games_menu(event)" gamename=${gi.id} style='cursor:pointer;border-radius:10px;margin:10px;padding:5px;padding-top:15px;width:120px;height:90px;display:inline-block;background:${bg};position:relative;'>
	${nundef(color) ? '' : runderkreis(color, id)}
	<span style='font-size:50px;font-family:${sym.family}'>${sym.text}</span><br>${gi.friendly}</div>
	`;
}
function runderkreis(color, id) {
	//console.log('color', color);
	return `<div id=${id} style='width:20px;height:20px;border-radius:50%;background-color:${color};color:white;position:absolute;left:0px;top:0px;'>` + '' + "</div>";
}
//#endregion

//#region login
function get_login(php = true) { to_server(Session.cur_user, "login", php); }
function present_login(obj) { param_present_contacts(obj, mBy('inner_left_panel'), 'onclick_user_login'); }
//#endregion

//#region table start and end
function compute_elo_ranking(players, game) {
	//brauch ein ELO ranking! ranking ist: wer am oeftesten gewonnen hat
	//for each player in Session.cur_players
	players = sortBy(players, 'score');

	//jetzt mach ich aus den players buckets von gleichen scores
	let buckets = {};
	for (const pl of players) {
		let sc = pl.score;
		if (nundef(buckets[sc])) buckets[sc] = [];
		buckets[sc].push(pl.name);
	}
	//wieviele buckets gibt es?
	let nBuckets = get_keys(buckets).length;
	let elopart = 2 / (nBuckets - 1);
	let val = -1;
	for (const b in buckets) {
		for (const name of buckets[b]) {
			let elo = get_elo(name, game);
			set_elo(name, game, elo + val);
			console.log('user', name, 'with score', b, 'gets', val, 'added to elo!');
		}
		val += elopart;
	}
}
function delete_current_table() {
	if (nundef(Session.cur_tid)) return;

	to_server(Session.cur_tid, 'delete_table');
	Session.cur_tid = null;
	Session.cur_table = null;
}
function decrease_handicap_if_winstreak(winners, game) {
	console.log('winners', winners);
	for (const w of winners) {
		let o = lookupSet(DB.users, [w, 'games', game], {});
		o.winstreak = DB.users[w].games[game].winstreak = isdef(o.winstreak) ? o.winstreak + 1 : 1;



		if (o.winstreak >= 1) {
			//this player will get his handicap decreased!!!!
			let currentlevel = get_startlevel(w, game);
			console.log('current level for', w, currentlevel);
			lookupSetOverride(DB.users, [w, 'games', game, 'startlevel'], Math.min(currentlevel + 1, Session.maxlevel));
			delete o.winstreak;
			console.log('...startlevel of', w, 'is increased to', get_startlevel(w, game));
		}
		//console.log('user', w, 'db entry', o);
	}
}
function increase_handicap_if_losestreak() {
	let players = get_values(Session.cur_players);
	let scores = players.map(x => x.score);
	let min = arrMin(scores);
	let losers = players.filter(x => x.score == min).map(x => x.name);
	let game = Session.cur_game;
	console.log('losers', losers, 'game', game);

	for (const w of losers) {
		let o = lookupSet(DB.users, [w, 'games', game], {});
		o.losestreak = DB.users[w].games[game].losestreak = isdef(o.losestreak) ? o.losestreak + 1 : 1;
		if (o.losestreak >= 1) {
			//this player will get his handicap increased!!!!
			let currentlevel = get_startlevel(w, game);
			console.log('current level for', w, currentlevel);
			lookupSetOverride(DB.users, [w, 'games', game, 'startlevel'], Math.max(currentlevel - 1, 0));
			delete o.losestreak;
			console.log('...startlevel of', w, 'is decreased to', get_startlevel(w, game));
		}
	}
}
function record_winners(winners, game) { ensure_winnerlist(game).push(winners); } // lookupAddToList(DB.games, [game, 'winnerlist'], winners); }

//#endregion
function animate(elem, aniclass, timeoutms) {
	mClass(elem, aniclass);
	TOMan.TO.anim = setTimeout(() => mRemoveClass(elem, aniclass), timeoutms);
}
function canAct() { return (aiActivated || uiActivated) && !auxOpen; }
function clear_table_all() {
	clear_table_events();
	if (isdef(mBy('table'))) clearTable();
	resetUIDs(); //sicherheitshalber!
	Items = {};
}
function clear_table_events() {
	clear_timeouts();
	STOPAUS = true;
	pauseSound();
	DELAY = 1000;
	uiActivated = aiActivated = false;
	onclick = null;
	clearMarkers();
}
function clearTable() {
	clearElement(dLineTableMiddle); clearElement(dLineTitleMiddle); removeMarkers();
}
function clear_timeouts() {
	clearTimeout(TOMain); TOMain = null;
	clearTimeout(TOTicker); TOTicker = null;
	clearTimeout(TOFleetingMessage); TOFleetingMessage = null;
	clearTimeout(TOTrial); TOTrial = null;
	if (isdef(TOList)) { for (const k in TOList) { TOList[k].map(x => clearTimeout(x)); } TOList = {}; }
	if (isdef(TOMan)) TOMan.clear();
}
function collect_game_options() {
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

}
function convert_from_row(row) {
	//row is modified!
	for (const k in row) {
		let val = row[k];
		if (isNumber(val)) row[k] = Number(val);
		if (isString(val) && val[0] == '{') row[k] = JSON.parse(val);
		if (k == 'players' && isString(row[k])) row[k] = val.split(',');
	}

}
function convert_from_server(obj) {
	//console.log('obj',obj)
	if (isdef(obj.table)) convert_from_row(obj.table);
	if (isdef(obj.playerdata)) {
		for (const row of obj.playerdata) {
			convert_from_row(row);
		}
	}
	if (isdef(obj.moves)) {
		for (const row of obj.moves) {
			convert_from_row(row);
		}
	}
}
function danext() { if (isdef(DA.next)) { let f = DA.next; DA.next = null; f(); } }
function db_save() {
	//console.log('_____db_save: InternetStatus:', is_online() ? 'online' : 'OFFLINE', '\nuser', DB.users[Session.cur_user]);
	if (!is_online()) { console.log('not saving! (no internet)'); return; }
	let txt = jsyaml.dump(DB);
	to_server({ db: txt }, 'dbsave');
}
function ev_to_gname(ev) { evNoBubble(ev); return evToTargetAttribute(ev, 'gamename'); }
function generate_friendly_table_name(game, players) {
	//list of places
	const europe_capitals = 'Amsterdam,	Ankara,	Astana,	Athens,	Baku,	Belgrade,	Berlin,	Bern,	Bratislava,	Brussels,	Bucharest,	Budapest,	Chisinau,	Copenhagen,	Dublin,	Helsinki,	Kiev,	Lisbon,	Ljubljana,	London,	Luxembourg,	Madrid,	Minsk,	Monaco,	Moscow,	Nicosia,	Oslo,	Paris,	Podgorica,	Prague,	Reykjavík,	Riga,	Rome,	San Marino,	Sarajevo,	Skopje,	Sofia,	Stockholm,	Tallinn,	Tbilisi,	Tirana,	Vaduz,	Valletta,	Vatican City,	Vienna,	Vilnius,	Warsaw,	Yerevan,	Zagreb';
	const asia_capitals = 'Abu Dhabi,	Amman,	Ankara,	Ashgabat,	Astana,	Baghdad,	Baku,	Bandar Seri Begawan,	Bangkok,	Beijing,	Beirut,	Bishkek,	Cairo,	Colombo,	Damascus,	Dhaka,	Dili,	Doha,	Dushanbe,	Hanoi,	Islamabad,	Jakarta,	Jerusalem,	Kabul,	Kathmandu,	Kuala Lumpur,	Kuwait City,	Malé,	Manama,	Manila,	Moscow,	Muscat,	Naypyidaw,	New Delhi,	Nicosia,	Phnom Penh,	Pyongyang,	Ramallah,	Riyadh,	Sana’a,	Seoul,	Singapore,	Taipei,	Tashkent,	Tbilisi,	Tehran,	Thimphu,	Tokyo,	Ulaanbaatar,	Vientiane,	Yerevan';

	//let list = europe_capitals.split(',\t');
	//console.log('list',list);
	return 'Battle of ' + chooseRandom(coin() ? europe_capitals.split(',\t') : asia_capitals.split(',\t'));
}
function generate_table_id(gamename) {
	//wie macht man einen timestamp?
	return gamename + '_' + get_timestamp();
}
function get_cur_menu() { if (isdef(Session.cur_menu)) window['get_' + Session.cur_menu](); }
function get_score_fen_from_cur_players() {
	let players = get_values(Session.cur_players);
	let sorted = sortByDescending(players, 'score');
	let list = sorted.map(x => `${x.name}:${x.score}`);
	let fen = list.join(',');
	return fen;
}
function get_game_option(g, key) {
	let set_option = lookup(Session, ['cur_table', 'options', key]);
	if (set_option) return set_option;
	let opts = g.options[key];
	let defval = opts.split(',')[0];
	return defval;
}
function get_game_or_user_option(g, key) {
	let opts = g.options[key].split(',');
	let defval = opts[0];
	let userval = lookup(DB.users, [Session.cur_user, key]);
	let set_option = lookup(Session, ['cur_table', 'options', key]);
	if (userval && opts.includes(userval)) return userval;
	else if (set_option) return set_option;
	else return defval;
}
function get_user_game_tables() { to_server({ uname: Session.cur_user, game: Session.cur_game }, "get_user_game_tables"); }
function get_image_path(userdata) {
	let p = '../base/assets/images/';
	if (userdata.image) p += userdata.name; else p += 'unknown_user';
	p += '.jpg';
	if (is_online()) p += '?=' + Date.now();
	//console.log('image path', p);
	return p;
}
function get_start_data_fen(players, game) { return players.map(x => `${x}:${get_startlevel(x, game)}:${get_preferred_lang(x)}`).join(','); }
function got_user_game_tables(obj) {
	let tables = obj.tables;
	if (!isEmpty(tables)) { Session.cur_tid = tables[0].id; Session.cur_table = tables[0]; }

}
function in_game() { return isdef(mBy('table')) && Session.in_game == `${Session.cur_user} ${Session.cur_tid}`; }
function in_game_on() { Session.in_game = `${Session.cur_user} ${Session.cur_tid}`; }
function in_game_off() { Session.in_game = null; }
function in_game_open_prompt() { return uiActivated && Session.in_prompt == `${Session.cur_user} ${Session.cur_tid}`; }
function in_game_open_prompt_on() { Session.in_prompt = `${Session.cur_user} ${Session.cur_tid}`; }
function in_game_open_prompt_off() { Session.in_prompt = null; }
function is_admin(name) { return ['mimi'].includes(isdef(name) ? name : Session.cur_user); }
function is_game_host() { return Session.cur_table.host == Session.cur_user; }
function is_a_word(w,lang){return lookup(Dictionary,[lang,w]) != null;}
function log_object(o) { let keys = get_keys(o); keys.sort(); for (const k of keys) { console.log('', k + ':', o[k]); } }
function make_players(playernames) {
	let o = Session.cur_players = {};

	for (const plname of playernames) {
		o[plname] = { name: plname, color: getColorDictColor(DB.users[plname].color), imgPath: `../base/assets/images/${plname}.jpg`, score: 0 };
	}

	Session.cur_me = o[Session.cur_user];
	Session.cur_others = get_values(o).filter(x => x.name != Session.cur_user);

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
function open_game_ui() {

	clear_table_all();

	let hmin = firstNumber(getCssVar('--inner_left_panel_height'));

	//console.log('hmin', hmin);

	mBy("inner_left_panel").innerHTML = `<div style='min-height:${hmin}px'>
	<div id="md" style="display: flex;min-height:${hmin}px">
		<div id="sidebar"  style="align-self: stretch;min-height:${hmin}px"></div>
		<div id="rightSide" style='min-height:${hmin}px'>
			<div id="table" class="flexWrap"></div>
		</div>
	</div></div>`;

	initTable();
	badges_off(); //badges_on | badges_off ==>dann geht setBadgeLevel automatisch!
	//initAux();
}
function open_prompt(fen) {
	// ich weiss ja welche table, welches game, welcher user.....
	console.assert(!uiActivated, 'open_prompt with uiActivated ON !!!!!!!!!!!!!!!!!!!!!!!!!!');
	let game = Session.cur_game;
	let uname = Session.cur_user;
	let g = Session;

	let next = lookup(DB.games, [game]); if (next) copyKeys(next, g); //g = mergeOverride(g, next);
	next = lookup(DB.users, [uname, 'games', game]); if (next) copyKeys(next, g); //g = mergeOverride(g, next);

	let level = g.level = valf(g.startlevel, g.def_startlevel);
	//if (TESTING) { level = g.level = 0; }

	lookupSet(DB.users, [uname, 'games', game, 'startlevel'], level);

	next = lookup(DB.games, [game, 'levels']);
	if (next) copyKeys(next[level], g);
	g.maxlevel = valf(get_keys(next).length, 0) - 1;
	g.color = getColorDictColor(g.color);
	for (const k in g.options) {
		g[k] = get_game_or_user_option(g, k); //get_game_option(g, k); //'winning_score'); 
		//console.log('g.' + k, g[k]);
	}

	delete g.levels;

	clearTable(); set_background_color(g.color); //reset state
	QContextCounter += 1;


	//if (TESTING) { g.winning_score = 1; }

	show_game_name(g.friendly);
	show_title(g.table.friendly);
	show_level(g.level, g.maxlevel);
	//console.log('game',Session.cur_game,'badges:',Session.is_badges?'yes':'no');
	if (Session.is_badges) g.level = setBadgeLevel(g.level, Session.cur_user, Session.cur_game, g.maxlevel);

	g.startTime = get_timestamp();
	mLinebreak(dTable, 15);

	let items = g.items = Session.cur_funcs.prompt(g, fen);

	Selected = null;
	if (nundef(fen)) uiActivated = true;

}
function param_present_contacts(obj, dParent, onclick_func_name) {
	let others = sync_users(obj.users);//after this DB.users is up-to-date![others,has_changed]
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
function reload_last_game_state() { if (!in_game_open_prompt()) open_prompt(Session.cur_me.state); }
function send_timer_ticker() {
	let me = Session.cur_players[Session.cur_user];
	to_server({ tid: Session.cur_tid, score: me.score, state: me.state, uname: me.name }, 'ticker_status_send_receive');
}
function set_background_color(color, elem) { if (nundef(elem)) elem = mBy('md').parentNode; mStyle(elem, { bg: getColorDictColor(color) }); }
function set_cur_tid_for_game() {
	console.assert(isdef(Session.tables_by_game) && isdef(Session.cur_game), "set_cur_tid_for_game");
	let tables = Session.tables_by_game;
	let game = Session.cur_game;
	if (!isEmpty(tables[game])) Session.cur_tid = tables[game][0].id;
	else Session.cur_tid = null;

}
function set_most_recent_table_as_cur_tid(tables) { if (!isEmpty(tables)) Session.cur_tid = tables[0].id; }
function set_tables_by_game(obj, is_set_cur_id = true) {
	//console.log('set_tables_by_game: obj', obj);
	let tables = Session.tables = obj.tables;
	//tables.map(x => console.log('table:', x));

	//what if tables is empty?
	let bygame = Session.tables_by_game = {};

	if (isEmpty(tables)) {
		Session.cur_tid = null;
		Session.tables_by_game = {};
	} else {
		//got tables sorted by most recent first
		if (is_set_cur_id) {
			let t = tables[0];
			Session.cur_tid = t.id; //this would be the most recent table
			Session.cur_game = t.game;
		}
		for (const t of tables) { lookupAddToList(bygame, [t.game], t); }
	}
	return bygame;
}
function show_feedback(is_correct, correction = true) {
	function success() {
		if (isdef(Selected) && isdef(Selected.feedbackUI)) {
			let uilist;
			if (isdef(Selected.positiveFeedbackUI)) uilist = [Selected.positiveFeedbackUI];
			else uilist = isList(Selected.feedbackUI) ? Selected.feedbackUI : [Selected.feedbackUI];
			let sz = getRect(uilist[0]).h;
			//console.log('in der succesfunc!!!!!!!', uilist)
			for (const ui of uilist) {

				//mpOverImage(createSuccessMarker(sz), ui, sz);
				//mpOverImage(markerSuccess(), ui, sz);
				mpOver(markerSuccess(), ui, sz, 'green', 'segoeBlack'); //, 'openMojiTextBlack'); //WORKS!!!


				//show_checkmark(ui); NO

				//let d = create_marker('A');	mp_over(d, ui, sz * (4 / 5), 'limegreen', 'segoeBlack'); NO

				//let d = markerSuccess();
				//console.log('sz',sz,'ui',ui,'\nmarker',d);
				//mpOver(d, ui, sz * (4 / 5), 'limegreen', 'segoeBlack'); //no:segoe,openmo,orig: 'segoeBlack');
				// mpOver(d, ui, Math.max(sz,40), 'limegreen', 'none'); //no:segoe,openmo,orig: 'segoeBlack');
			}
		}
		return 500;
	}
	function fail() {
		if (isdef(Selected) && isdef(Selected.feedbackUI)) {
			let uilist = isList(Selected.feedbackUI) ? Selected.feedbackUI : [Selected.feedbackUI];
			//console.log('fail',uilist)
			let sz = getRect(uilist[0]).h;
			//console.log('failFunc:',uilist,sz)
			for (const ui of uilist) {

				//console.log('hallo!!!')
				// mpOver(markerFail(), ui, sz * (1 / 2), 'red', 'segoeBlack'); //, 'openMojiTextBlack');
				mpOver(markerFail(), ui, sz, 'red', 'segoeBlack'); //, 'openMojiTextBlack');
			}
		}
		return 1000;
	}
	if (is_correct) { return success(); }
	else {
		if (correction) {
			//console.log('CORRECTION!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!', Selected.correctUis)
			let anim = 'onPulse5';
			for (const ui of Selected.correctUis) { mClass(ui, anim); }
		}
		return fail();
	}
}
function show_level(level, maxlevel) {
	//console.log('level', level, 'maxlevel', maxlevel);
	let handicap = maxlevel - level;
	dLevel.innerHTML = `handicap: ${handicap}`;
	mStyle(dLevel, { fg: handicap <= 1 ? get_user_color() : 'white' });
}
function show_title(title) { mBy('dScore').innerHTML = title; }
function show_my_score() { let me = Session.cur_players[Session.cur_user]; console.log('my', me.name, 'score is', me.score); }
function show_game_name(gname) { dGameTitle.innerHTML = gname; }
function show_gameover(winners) {//,handler) {
	//winners: non-empty list of names!
	//console.log('winners', winners)
	let pl = Session.cur_players[winners[0]];
	let styles = { bg: pl.color, fg: 'contrast', top: 220, };
	if (winners.length > 1) {
		status_message(`GAME OVER - The winners are ${winners.join(', ')}!!!`, styles);//, handler);
	} else {
		status_message(`GAME OVER - The winner is ${winners[0]}!!!`, styles);//, handler);
	}
}
function stop_game() { clear_table_events(); }
function toogle_internet_status() {
	if (is_online()) {
		go_offline();
		//menu_disable('chat');
		let b = mBy('b_internet');
		b.className = 'statusbutton enabled off';
		b.innerHTML = 'offline';
	} else {
		go_online();
		//menu_enable('chat');
		db_save();
		let b = mBy('b_internet');
		b.className = 'statusbutton enabled on';
		b.innerHTML = 'online';
	}
	console.log('InternetStatus:', is_online() ? 'online' : 'OFFLINE');
}
function toggle_polling_status() {
	if (is_polling_on()) {
		stop_polling();
		let b = mBy('b_polling');
		b.className = 'buttonClass donebutton enabled off';
		b.innerHTML = 'polling off';
	} else {
		allow_polling();
		let b = mBy('b_polling');
		b.className = 'buttonClass donebutton enabled on';
		b.innerHTML = 'polling on';
	}
	console.log('Polling Status:', is_polling_on() ? 'ON' : 'OFF');
}
function try_find_username(ev) {
	evNoBubble(ev);
	let username = findAttributeInAncestors(ev.target, 'username');
	//console.log('found username in ancestor:',username);
	if (nundef(Session.users_by_name[username])) { alert('ERROR username!'); return null; }
	return username;


}
function update_game_status(players) {
	let d = dTitle;
	clearElement(d);
	let d1 = mDiv(d, { display: 'flex', 'justify-content': 'center', 'align-items': 'space-evenly' });
	for (const plname in players) {
		let pl = players[plname];
		//let d2=mDiv(d1,{margin:10},null,`${pl}:${this.players[pl].score}`);
		let d2 = mDiv(d1, { margin: 4, align: 'center' }, null, `<img src='${pl.imgPath}' style="display:block" class='img_person' width=50 height=50>${pl.score}`);
	}
}
function update_session(obj) {
	// console.log('obj', obj)
	for (const k in obj) { if (isdef(Session[k])) copyKeys(obj[k], Session[k]); else Session[k] = obj[k]; }
	if (isdef(obj.table)) {
		Session.cur_table = Session.table;

		Session.cur_funcs = window[Session.cur_game]();
		if (!isEmpty(obj.playerdata)) make_players(Session.table.players);
		console.assert(isdef(Session.cur_user) && Session.cur_game == Session.table.game && Session.cur_tid == Session.table.id, "SESSION MISMATCH IN GAME_OPEN_FOR_MOVE!!!!!!!!!!!!!!!!!!!!!");
	}
	if (isdef(obj.playerdata)) {
		let o = Session.cur_players;
		for (const rec of obj.playerdata) {

			//console.log('score', rec.name, rec.score, o[rec.name].score);
			copyKeys(rec, o[rec.name]);
		}
	}
}
function where(o) {
	let fname = getFunctionsNameThatCalledThisFunction();
	//if (fname.includes('asset')) console.log(':',fname,isdef(o)?o:'(no data)');
	//if (fname.includes('server')) console.log(':',fname,isdef(o)?o:'(no data)');
	//if (fname.includes('user')) console.log(':',fname,isdef(o)?o:'(no data)');
	//if (fname.includes('drag')) console.log(':',fname,isdef(o)?o:'(no data)');
}


//#endregion

//#region dictionaries
async function create_pic_dicts(list = ['e', 'd', 'f', 's']) {
	let syms = await route_path_yaml_dict('../base/assets/allSyms.yaml');
	for (const l of list) {
		let di = await create_pic_dict(l, syms);
		downloadAsYaml(di, l + 'picdict');
	}
	loader_off();
}
async function create_pic_dict(l, syms) {
	//first need to get dicts in asset loading!
	//wo werden assets geladen?
	//kann ich txt file mit einfachem ajax holen?
	let edict = await route_path_text(`../base/assets/words/${l}dict.txt`);
	console.log('dict', edict);
	let lang = l.toUpperCase();

	let words = l == 'e' ? edict.split('\r\n') : edict.split('\n');

	console.log('words', words);
	console.log('syms', syms);

	let wdi = {};
	for (const w of words) {
		let w1 = w.trim().toLowerCase();
		if (isEmpty(w1)) continue;
		//console.assert(w1 == w1.toLowerCase(),'not in lower case:',l,w1);
		wdi[w1] = true;
	}

	let slist = [];
	for (const skey in syms) {
		let e = syms[skey][lang];
		if (nundef(e)) continue;
		e = e.trim().toLowerCase();
		slist.push({ key: skey, w: e });
	}
	slist_sorted = sortBy(slist, 'w');
	console.log('slist sorted', slist_sorted);

	console.log(wdi);
	let edi = {};
	for (const o of slist_sorted) {
		let [e, skey] = [o.w, o.key];
		if (e in wdi) edi[e] = skey;
		else console.log('word', e, 'from syms not in dict!!!');

	}
	console.log('result', edi, Object.keys(edi).length);
	return edi;

	return;

	for (const skey in syms) {
		let e = syms[skey][lang];
		if (nundef(e)) continue;
		e = e.trim().toLowerCase();
		console.assert(isdef(e) && e == e.toLowerCase(), 'word in syms not lowercasse:' + e);
		if (e in wdi) edi[e] = skey;
		else console.log('word', e, 'from syms not in dict!!!');

	}
	console.log('result', edi, Object.keys(edi).length);
	return edi;
}
function ensureDictionary() {
	if (nundef(Dictionary)) { Dictionary = { E: {}, S: {}, F: {}, C: {}, D: {} } };
	for (const k in Syms) {
		for (const lang of ['E', 'D', 'F', 'C', 'S']) {
			let w = Syms[k][lang];
			if (nundef(w)) continue;
			Dictionary[lang][w.toLowerCase()] = Dictionary[lang][w.toUpperCase()] = k;
		}
	}
}


//#endregion

//#region fleetingMessage
var TOFleetingMessage;
function clearFleetingMessage() {
	//console.log('HIER!');//, getFunctionsNameThatCalledThisFunction());
	clearTimeout(TOFleetingMessage);
	clearElement(dLineBottom);
}
function showActiveMessage(msg, handler, styles = {}, fade = false) {

	let defStyles = { fz: 22, rounding: 10, vpadding: 12, hpadding: 0, matop: 50 };
	styles = mergeOverride(defStyles, styles);
	if (nundef(styles.fg)) styles.fg = colorIdealText(Session.color);

	clearFleetingMessage();
	let d = fleetingMessage(msg, styles, fade);
	d.onclick = handler;

}
function showFleetingMessage(msg, msDelay, styles = {}, fade = false, ms = 3000) {

	let defStyles = { fz: 22, rounding: 10, padding: '2px 12px', matop: 50 };
	styles = mergeOverride(defStyles, styles);

	//console.log('bg is', Session.color, '\n', styles, arguments)
	if (nundef(styles.fg)) styles.fg = colorIdealText(Session.color);

	clearFleetingMessage();
	if (msDelay) {
		TOFleetingMessage = setTimeout(() => fleetingMessage(msg, styles, fade, ms), msDelay);
	} else {
		fleetingMessage(msg, styles, fade, ms);
	}
}
function fleetingMessage(msg, styles, fade = false, ms = 3000) {
	let d = mDiv(dLineBottom);
	if (isString(msg)) {
		d.innerHTML = msg;
		mStyle(d, styles)
	} else {
		mAppend(d, msg);
	}
	if (fade) animateProperty(dLineBottom, 'opacity', 1, .4, 0, ms);
	return d;
}
//#endregion fleetingMessage

//#region keys.js
//prep key sets at start of prog
function getKeySets() {
	//let ks = localStorage.getItem('KeySets');

	makeCategories();	//console.log('Categories',Categories)

	//if (isdef(ks)) { return JSON.parse(ks); }

	//console.log('hallo'); return [];
	let res = {};
	for (const k in Syms) {
		let info = Syms[k];
		if (nundef(info.cats)) continue;
		for (const ksk of info.cats) {
			//console.log('ksk',ksk,'k',k);
			lookupAddIfToList(res, [ksk], k);
		}
	}
	res.animals = getAnimals();
	res.nature = getNature();
	localStorage.setItem('KeySets', JSON.stringify(res));
	return res;

}
function getAnimals() {
	let gr = 'Animals & Nature';
	let result = [];
	for (const sg in ByGroupSubgroup[gr]) {
		if (startsWith(sg, 'anim')) result = result.concat(ByGroupSubgroup[gr][sg]);
	}
	return result;
}
function getNature() {
	let gr = 'Animals & Nature';
	let result = [];
	for (const sg in ByGroupSubgroup[gr]) {
		result = result.concat(ByGroupSubgroup[gr][sg]);
	}
	return result;
}
function getGSGElements(gCond, sCond) {
	let keys = [];
	let byg = ByGroupSubgroup;
	for (const gKey in byg) {
		if (!gCond(gKey)) continue;

		for (const sKey in byg[gKey]) {
			if (!sCond(sKey)) continue;

			keys = keys.concat(byg[gKey][sKey]);
		}
	}
	return keys.sort();
}
function makeCategories() {
	//console.log(ByGroupSubgroup);
	let keys = Categories = {
		animal: getGSGElements(g => g == 'Animals & Nature', s => startsWith(s, 'animal')),
		clothing: getGSGElements(g => g == 'Objects', s => s == 'clothing'),
		emotion: getGSGElements(g => g == 'Smileys & Emotion', s => startsWith(s, 'face') && !['face-costume', 'face-hat'].includes(s)),
		food: getGSGElements(g => g == 'Food & Drink', s => startsWith(s, 'food')),
		'game/toy': (['sparkler', 'firecracker', 'artist palette', 'balloon', 'confetti ball'].concat(ByGroupSubgroup['Activities']['game'])).sort(),
		gesture: getGSGElements(g => g == 'People & Body', s => startsWith(s, 'hand')),
		job: ByGroupSubgroup['People & Body']['job'],
		mammal: ByGroupSubgroup['Animals & Nature']['animal-mammal'],
		music: getGSGElements(g => g == 'Objects', s => startsWith(s, 'musi')),
		object: getGSGElements(g => g == 'Objects', s => true),
		place: getGSGElements(g => g == 'Travel & Places', s => startsWith(s, 'place')),
		plant: getGSGElements(g => g == 'Animals & Nature' || g == 'Food & Drink', s => startsWith(s, 'plant') || s == 'food-vegetable' || s == 'food-fruit'),
		sport: ByGroupSubgroup['Activities']['sport'],
		tool: getGSGElements(g => g == 'Objects', s => s == 'tool'),
		transport: getGSGElements(g => g == 'Travel & Places', s => startsWith(s, 'transport')),
	};

	let incompatible = Daat.incompatibleCats = {
		animal: ['mammal'],
		clothing: ['object'],
		emotion: ['gesture'],
		food: ['plant', 'animal'],
		'game/toy': ['object', 'music'],
		gesture: ['emotion'],
		job: ['sport'],
		mammal: ['animal'],
		music: ['object', 'game/toy'],
		object: ['music', 'clothing', 'game/toy', 'tool'],
		place: [],
		plant: ['food'],
		sport: ['job'],
		tool: ['object'],
		transport: [],
	}
	//console.log('categories', keys);

}

//keys and categories
function genCats(n) {
	//console.log('???????',Daat.incompatibleCats)
	let di = {};
	let cats = Object.keys(Categories);
	//console.log('cats available:',cats)
	for (let i = 0; i < n; i++) {
		let cat = chooseRandom(cats);
		let incompat = Daat.incompatibleCats[cat];
		//console.log('cats',cats,'\ncat',cat,'\nincompat',incompat)
		cats = arrMinus(cats, incompat);
		removeInPlace(cats, cat);
		//console.log('cats after minus',cats);
		di[cat] = Categories[cat];
	}
	return di;
}
function oneWordKeys(keys) { return keys.filter(x => !x.includes(' ')); }

function removeDuplicates(keys, prop) {
	let di = {};
	let res = [];
	let items = keys.map(x => Syms[x]);
	for (const item of items) {
		// if (item.key.includes('key')) console.log('hallo',item)
		// if (isdef(di[item.best])) {console.log('dupl:',item.key); continue;}
		if (isdef(di[item.best])) { continue; }
		res.push(item);
		di[item.key] = true;
	}
	return res.map(x => x.key);
}
function setKeys({ allowDuplicates, nMin = 25, lang, key, keySets, filterFunc, param, confidence, sortByFunc } = {}) {
	let keys = jsCopy(keySets[key]);

	if (isdef(nMin)) {
		let diff = nMin - keys.length;
		let additionalSet = diff > 0 ? nMin > 100 ? firstCondDictKeys(keySets, k => k != key && keySets[k].length > diff) : 'best100' : null;

		//console.log('diff', diff, additionalSet, keys)
		if (additionalSet) KeySets[additionalSet].map(x => addIf(keys, x)); //
		//if (additionalSet) keys = keys.concat(keySets[additionalSet]);
		//console.log(keys)
	}

	let primary = [];
	let spare = [];
	for (const k of keys) {
		let info = Syms[k];

		//console.log('info',info);
		info.best = info[lang];
		//console.log(info.best)

		if (nundef(info.best)) {
			let ersatzLang = (lang == 'D' ? 'D' : 'E');
			let klang = 'best' + ersatzLang;
			//console.log(k,lang,klang)
			if (nundef(info[klang])) info[klang] = lastOfLanguage(k, ersatzLang);
		}
		//console.log(k,lang,lastOfLanguage(k,lang),info.best,info)
		let isMatch = true;
		//if (isdef(filterFunc)) console.log(filterFunc,filterFunc(k,info.best))
		if (isdef(filterFunc)) isMatch = isMatch && filterFunc(param, k, info.best);
		if (isdef(confidence)) isMatch = info[klang + 'Conf'] >= confidence;
		if (isMatch) { primary.push(k); } else { spare.push(k); }
	}

	if (isdef(nMin)) {
		//if result does not have enough elements, take randomly from other
		let len = primary.length;
		let nMissing = nMin - len;
		if (nMissing > 0) { let list = choose(spare, nMissing); spare = arrMinus(spare, list); primary = primary.concat(list); }
	}

	if (isdef(sortByFunc)) { sortBy(primary, sortByFunc); }

	if (isdef(nMin)) console.assert(primary.length >= nMin);
	//console.log(primary)
	if (nundef(allowDuplicates)) {
		//console.log('hhhhhhhhhhhhhhh',primary.length)
		primary = removeDuplicates(primary);
	}
	return primary;
}

//#endregion

//#region loader and switches
function loader_on() { mBy('loader_holder').className = 'loader_on'; }
function loader_off() { mBy('loader_holder').className = 'loader_off'; }
function click_shield_on(msg) { show_shield(msg); }
function click_shield_off() { mBy('dShield').style.display = 'none'; }
function show_shield(msg) {
	mBy('dShield').style.display = 'block';
	mBy('dShield').innerHTML = msg;
}
function polling_shield_on(msg) {
	let d = mBy('dPollingShield');
	d.style.display = 'block';
	d.innerHTML = msg;
}
function polling_shield_off() { mBy('dPollingShield').style.display = 'none'; }
function just_message(msg, styles = {}) {//,handler) {
	alert(msg);
	// let d = mBy('dMessage1');
	// show(d);
	// clearElement(d);
	// let def_styles = { padding: 20, align: 'center', position: 'absolute', fg: 'contrast', fz: 24, bg: 'silver', w: '100vw' };
	// copyKeys(styles, def_styles);
	// let dContent = mDiv(d, def_styles, null, msg);
}
function status_message(msg, styles = {}) {//,handler) {
	let d = mBy('dMessage');
	show(d);
	clearElement(d);
	// let bg = 'transparent'; // colorTrans('silver', .25);
	let def_styles = { padding: 20, align: 'center', position: 'absolute', fg: 'contrast', fz: 24, w: '100vw' };
	copyKeys(styles, def_styles);
	let dContent = mDiv(d, def_styles, null, msg);
	if (is_admin() || !isVisible('dIntro')) {
		mLinebreak(dContent);
		mButton('click to close',status_message_off,dContent,{fz:20},['buttonClass', 'donebutton']);
	}

	//let d = mScreen(mBy('dMessage'), { bg: bg, display: 'flex', layout: 'fvcc' });
	//let dContent = mDiv(d, { display: 'flex', layout: 'fvcs', fg: 'contrast', fz: 24, bg: 'silver', patop: 50, pabottom: 50, matop: -50, w: '100vw' },null,msg);

	//onclick = (ev) => { evNoBubble(ev); hide('dMessage'); onclick = null; if (isdef(handler)) {handler(); }};

}
function status_message_off() {
	let d = mBy('dMessage');
	clearElement(d);
	hide(d);
	onclick = null;
}
function badges_on() {
	if (!isdef(mBy('dLeiste'))) initSidebar();
	Session.is_badges = true;
	badges = [];
}
function badges_off() {
	hide('sidebar');
	delete Session.is_badges;
	badges = [];
}

//#endregion

//#region initTable
function initTable() {
	let table = mBy('table');
	clearElement(table);
	mStyle(table, { overflow: 'hidden' });

	initLineTop();
	initLineTitle();
	initLineTable();
	initLineBottom();

	dTable = dLineTableMiddle;
	dTitle = dLineTitleMiddle;
	//console.log(dTable,dTitle)
}
function initSidebar() {
	let dParent = mBy('sidebar');
	clearElement(dParent);
	//console.log('dLeiste wird angelegt!!!!!!!')
	dLeiste = mDiv(dParent);
	mStyle(dLeiste, { 'min-width': 70, 'max-height': '100vh', display: 'flex', 'flex-flow': 'column wrap' });
}
function initAux() {
	dAux = mBy('dAux');
}
function initLineTop() {
	dLineTopOuter = mDiv(table); dLineTopOuter.id = 'lineTopOuter';
	dLineTop = mDiv(dLineTopOuter); dLineTop.id = 'lineTop';
	dLineTopLeft = mDiv(dLineTop); dLineTopLeft.id = 'lineTopLeft';
	dLineTopRight = mDiv(dLineTop); dLineTopRight.id = 'lineTopRight';
	dLineTopMiddle = mDiv(dLineTop); dLineTopMiddle.id = 'lineTopMiddle';

	dScore = mDiv(dLineTopMiddle);
	dScore.id = 'dScore';

	dLevel = mDiv(dLineTopLeft);
	dLevel.id = 'dLevel';

	dGameTitle = mDiv(dLineTopRight);
	dGameTitle.id = 'dGameTitle';
	let d = mDiv(dLineTopRight);
	d.id = 'time';

	mLinebreak(table);
}
function initLineTitle() {
	dLineTitleOuter = mDiv(table); dLineTitleOuter.id = 'lineTitleOuter';
	dLineTitle = mDiv(dLineTitleOuter); dLineTitle.id = 'lineTitle';
	if (PROJECTNAME != 'belinda') mStyle(dLineTitle, { matop: 5 });
	dLineTitleLeft = mDiv(dLineTitle); dLineTitleLeft.id = 'lineTitleLeft';
	dLineTitleRight = mDiv(dLineTitle); dLineTitleRight.id = 'lineTitleRight';
	dLineTitleMiddle = mDiv(dLineTitle); dLineTitleMiddle.id = 'lineTitleMiddle';

	mLinebreak(table);
}
function initLineTable() {
	dLineTableOuter = mDiv(table); dLineTableOuter.id = 'lineTableOuter';
	dLineTable = mDiv(dLineTableOuter); dLineTable.id = 'lineTable';
	dLineTableLeft = mDiv(dLineTable); dLineTableLeft.id = 'lineTableLeft';
	dLineTableMiddle = mDiv(dLineTable); dLineTableMiddle.id = 'lineTableMiddle';
	mClass(dLineTableMiddle, 'flexWrap');
	dLineTableRight = mDiv(dLineTable); dLineTableRight.id = 'lineTableRight';

	mLinebreak(table);
}
function initLineBottom() {
	dLineBottomOuter = mDiv(table); dLineBottomOuter.id = 'lineBottomOuter';
	dLineBottom = mDiv(dLineBottomOuter); dLineBottom.id = 'lineBottom';
	dLineBottomLeft = mDiv(dLineBottom); dLineBottomLeft.id = 'lineBottomLeft';
	dLineBottomRight = mDiv(dLineBottom); dLineBottomRight.id = 'lineBottomRight';
	dLineBottom = mDiv(dLineBottom); dLineBottom.id = 'lineBottomMiddle';

	mLinebreak(table);
}
//#endregion

//#region internet
function init_internet() { DA.internet = navigator.onLine; } //if (is_really_online()) go_online();}
function go_online() { DA.internet = true; }//lookupSet(DA, ['internet'], true); }
function go_offline() { DA.internet = false; }//lookupSet(DA, ['internet'], false); }
function is_online() { return lookup(DA, ['internet']); }
function is_really_online() { return navigator.onLine; }
//#endregion

//#region menu (enabling and disabling any element by key) requires: key must be unique system-wide!!!!
function register_menu_item(elem, key, handler) { }
function menu_find_elem(key, elem) {
	//id could be label_key or Items[key]
	elem = isdef(elem) ? elem : isdef(mBy('label_' + key)) ? mBy('label_' + key) : isdef(mBy(key)) ? mBy(key) : isdef(Items[key]) ? iDiv(Items[key]) : null;
	if (nundef(elem)) { console.log('no menu with key', key); return null; }
	return elem;
}
function menu_enable(key, elem) {
	let d = menu_find_elem(key, elem);
	if (d) {
		mClassRemove(d, 'disabled');
		mClass(d, 'enabled');
		d.setAttribute('enabled', true);
	}
}
function menu_disable(key, elem) {
	let d = menu_find_elem(key, elem);
	if (d) {
		mClassRemove(d, 'enabled');
		mClass(d, 'disabled');
		d.setAttribute('enabled', false);
	}
}
function menu_enabled(key, elem) {
	let d = menu_find_elem(key, elem);
	return d ? mHasClass(d, 'enabled') : false;
}

//#endregion

//#region sidebar
function disable_sidebar(){
	close_sidebar();
	
}
function close_sidebar() {
	mBy('left_panel').style.flex = 0;
	DA.sidebar = 'closed';
}
function open_sidebar() {
	DA.sidebar = 'open';
	mBy('left_panel').style.flex = 1;
}
function toggle_sidebar() {
	// console.log('DA.sidebar:',DA.sidebar);
	if (nundef(DA.sidebar) || DA.sidebar == 'open') close_sidebar(); else open_sidebar();
}

//#endregion

//#region user
function add_new_user(udata, save = true) {
	alert('add_new_user!!!! ' + udata.name);

	DB.users[udata.name] = udata;
	if (save) db_save();
	return udata;
}
async function add_users_to_sql_db(not_in_sql_db) { to_server(not_in_sql_db, 'add_users'); }
function ensure_winnerlist(game) { return lookupSet(DB.games, [game, 'winnerlist'], []); }
function get_def_players_for_user(uname, list) {
	if (nundef(list)) list = Session.def_players;
	removeInPlace(list, uname);
	list.unshift(uname);
	Session.def_players = list;
	return list;
}
function get_user_color() { return get_current_userdata().color; }
function get_user_names() { return Object.keys(DB.users); }
function get_current_userdata() { return DB.users[Session.cur_user]; }
function get_preferred_lang(uname) { return lookup(DB.users, [uname, 'lang']) ?? 'E'; }
function get_startlevel(user, game) { return lookup(DB.users, [user, 'games', game, 'startlevel']) ?? lookup(DB.games, [game, 'def_startlevel']) ?? 0; }
function set_preferred_lang(uname, val) { val = val.toUpperCase(); if ('EDSFC'.indexOf(val)>=0) return lookupSetOverride(DB.users, [uname, 'lang'], val); }
function set_startlevel(user, game, val) { return lookupSetOverride(DB.users, [user, 'games', game, 'startlevel'], val); }
function get_elo(user, game) { return lookup(DB.users, [user, 'games', game, 'elo']) ?? 100; }
function get_winnerlist(game) { return lookupSet(DB.games, [game, 'winnerlist'], []); }
function set_elo(user, game, val) { lookupSetOverride(DB.users, [user, 'games', game, 'elo'], val); }
function reset_elo(user, game) { set_elo(user, game, 100); }
function reset_game_values_for_user(user) {
	let defaults = {
		'gul': { gSpotit: { startlevel: 0 }, gMaze: { startlevel: 0 }, gAnagram: { startlevel: 0 } },
		'nasi': { gSpotit: { startlevel: 0 }, gMaze: { startlevel: 0 }, gAnagram: { startlevel: 0 } },
		'felix': { gSpotit: { startlevel: 5 }, gMaze: { startlevel: 5 }, gAnagram: { startlevel: 3 } },
		'lauren': { gSpotit: { startlevel: 5 }, gMaze: { startlevel: 5 }, gAnagram: { startlevel: 5 } },
		'mimi': { gSpotit: { startlevel: 2 }, gMaze: { startlevel: 2 }, gAnagram: { startlevel: 2 } },
	};

	let norm = {};
	for (const g in DB.games) {
		norm[g] = { startlevel: DB.games[g].def_startlevel };
	}
	lookupSetOverride(DB.users, [user, 'games'], valf(defaults[user], norm));
}
function reset_game_values_for_all_users() { for (const uname in DB.users) { reset_game_values_for_user(uname); } }
function reset_winnerlist_for_game(game) { lookupSetOverride(DB.games, [game, 'winnerlist'], []); }
function reset_winnerlist_for_all_games() { for (const gname in DB.games) { reset_winnerlist_for_game(gname); } }
function reset_db_values() {
	reset_winnerlist_for_all_games();
	reset_game_values_for_all_users();
}
function load_user(name, display_ui = true) {
	//sets Session.cur_user and adds user if DB.users[name] does not exist
	//if show, also show_user() on screen
	//console.log('load_user',getFunctionsNameThatCalledThisFunction(),name);

	if (user_already_loaded()) return DB.users[name];

	if (nundef(name)) name = localStorage.getItem('user') ?? 'guest';

	// make sure there are data in DB.users
	let udata = lookup(DB, ['users', name]);
	//console.log('udata for',name,udata);
	if (!udata) udata = add_new_user({ name: name, color: randomColor(), motto: random_motto(), image: false, games: {}, tables: {} });

	Session.cur_user = name;
	localStorage.setItem('user', name);
	if (display_ui) show_user(udata);

	//if (name == 'mimi') show('dAdminButtons'); else hide('dAdminButtons');

	return udata;
}
//function save_users() { save_db('users'); }
//function save_tables() { save_db('tables'); }
// function save_db(key) {
// 	let txt = jsyaml.dump(DB[key]);
// 	to_server(txt, `save_${key}`);
// }

function sync_users(php_users) {
	//changes php_users in order to fit DB.users style (id=>name,hasImage=>image,motto needs to be added)
	let result = [];
	let changed = false;
	for (const udata of php_users) {
		if (nundef(udata.id)) return php_users;
		let name = udata.username;
		let u = DB.users[name];
		if (nundef(u)) {
			changed = true;
			let db_user = { name: name, color: randomColor(), motto: random_motto(), image: startsWith(udata.image, name), games: {}, tables: {}, };
			add_new_user(db_user, false);
			result.push(db_user);
		} else result.push(u)
	}
	if (changed) db_save(); //save_users();
	if (!is_online()) return result; 

	//jetzt noch das umgekehrte: falls in db wer ist der NICHT in php_users ist, muss den zu sql db adden!

	let di = {}; php_users.map(x => di[x.username] = x);
	//console.log('di', di);
	let not_in_sql_db = [];
	for (const name in DB.users) {
		let u = DB.users[name];
		if (nundef(di[name]) && name != Session.cur_user) { not_in_sql_db.push(name); addIf(result, u); }
	}
	//console.log('not in sql', not_in_sql_db);
	if (!isEmpty(not_in_sql_db)) add_users_to_sql_db(not_in_sql_db);

	//console.log('result', result);
	return result;
}
function user_already_loaded(name) { return isdef(name && name == Session.cur_user); }

function close_mini_user_info() {
	//console.log('haaaaaaaaaaaaaaloooooooooooooo')
	setTimeout(() => {
		mBy('user_info_mini').style.display = 'none';
	}, 500);
	//mBy('mini_profile_img').style.visibility = 'hidden';
}
function open_mini_user_info() {
	//console.log('haaaaaaaaaaaaaaloooooooooooooo')
	setTimeout(() => {
		mBy('user_info_mini').style.display = 'flex';
	}, 500);

	//mBy('mini_profile_img').style.visibility = 'visible';

}
function toggle_mini_user_info() {
	//console.log('DA.sidebar:',DA.sidebar);
	if (nundef(DA.sidebar) || DA.sidebar == 'open') close_mini_user_info(); else open_mini_user_info();
}

//#endregion user



