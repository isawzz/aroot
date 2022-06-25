function onclick_cancelmenu() { hide('dMenu'); }
function onclick_game_menu_item(ev) {
	let gamename = ev_to_gname(ev);
	stopgame();
	show('dMenu');
	let form = mBy('fMenuInput');
	let d = mBy('dMenuInput');
	clearElement(d);
	mCenterFlex(d);
	let dParent = mDiv(d, { gap: 6 });
	mCenterFlex(dParent);
	DA.playerlist = [];

	//show players
	for (const u of Serverdata.users) {
		let d = get_user_pic(u.name, dParent, 30); //,'onclick_user'); //mAppend(dParent, elem);
		let item = { uname: u.name, div: d, isSelected: false };
		if (isdef(U) && u.name == U.name) { toggleSelectionOfPicture(item, DA.playerlist, 'framedPicture3'); }
		d.onclick = () => toggleSelectionOfPicture(item, DA.playerlist, 'framedPicture3');
		mStyle(d, { cursor: 'pointer' });
	}
	mLinebreak(d, 10);
	show_game_options(d, gamename);

	form.onsubmit = () => {
		let players = DA.playerlist.map(x => x.uname); // get_checked_radios(fsPlayers);
		let game = gamename; //get_checked_radios(fsGames)[0];
		let options = collect_game_specific_options(game);
		//console.log('game', game, 'players', players, 'options', options);
		startgame(game, players, options);
		hide('dMenu');
	};
}
function onclick_game_in_gametable(tablename) {
	if (DA.simple){show_table_simple(tablename); return; }
	stopgame();
	let table = firstCond(Serverdata.tables, x => x.friendly == tablename);
	ensure_polling();
	phpPost({ friendly: tablename }, 'table');
}
function onclick_home() { window.location = SERVER; }
function onclick_lamp() {
	DA.simple = !DA.simple;
	if (DA.simple) show_simple_ui(); else show_advanced_ui();
	if (isVisible('dTables')) onclick_tables();
}
function onclick_player_in_gametable(uname, tablename, rid) {

	stopgame();
	U = firstCond(Serverdata.users, x => x.name == uname);
	phpPost({ friendly: tablename }, 'table');
}
function onclick_pause_continue() {

	let b = mBy('bPauseContinue');
	clearTimeout(TO.ai);
	onclick_stoppolling();
	show_status('game is paused', true);
	mStyle(b, { fg: 'grey' });
	//hide(b)

}
function onclick_reload() {
	if (isdef(G)) {
		let friendly = G.friendly;
		//force redraw 
		G.friendly = null;
		phpPost({ friendly: friendly }, 'table');
		//show('bPauseContinue')
		mStyle(mBy('bPauseContinue'), { fg: 'red' });
		//G.friendly = null;
	} else {
		onclick_tables();
	} //else onclick_home(); 
}

function onclick_reset_all() { stopgame(); phpPost({ app: 'simple' }, 'delete_tables'); }
function onclick_reset_past() { stopgame(); phpPost({ app: 'simple' }, 'delete_past'); }

function onclick_tables() { phpPost({ app: 'simple' }, 'tables'); }
function onclick_toggle_games() {
	// console.log('dUsers visible?',isVisible('dUsers'));
	if (isVisible('dGames')) { toggle_games_off(); }
	else { show_games(); toggle_games_on(); }
}
function onclick_toggle_tables() {
	// console.log('dUsers visible?',isVisible('dUsers'));
	if (isVisible('dTables')) { toggle_tables_off(); }
	else { phpPost({ app: 'simple' }, 'tables'); toggle_tables_on(); }
}
function onclick_toggle_users() {
	// console.log('dUsers visible?',isVisible('dUsers'));
	if (isVisible('dUsers')) { toggle_users_off(); }
	else { phpPost({ app: 'simple' }, 'users'); toggle_users_on(); }
}
function onclick_user(name) {
	if (DA.simple) { show_simple_ui(name);
	} else {
		//if (isdef(G) && G.mode == 'hotseat' && !G.turn.includes(name)) { show_status('cannot switch user in hotseat game!'); return; }
		U = firstCond(Serverdata.users, x => x.name == name);
		show_user();
		onclick_reload();
	}
}
function onclick_users() { phpPost({ app: 'simple' }, 'users'); }





