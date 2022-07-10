function onclick_ack() {
	if (nundef(Z) || nundef(Z.func.clear_ack)) return;

	Z.func.clear_ack();
	turn_send_move_update(true);
}
function onclick_cancelmenu() { hide('dMenu'); }
function onclick_game_menu_item(ev) {
	let gamename = ev_to_gname(ev);
	stopgame();
	show('dMenu'); mClear('dMenu');
	let html = `
	<form id="fMenuInput" style="text-align: center" action="javascript:void(0);">
		<div id="dMenuInput">hallo</div>
		<div style="width: 100%">
			<input type="submit" class="button" value="start" />
			<input type="button" onclick="onclick_cancelmenu()" class="button" value="cancel" />
		</div>
	</form>
	`;
	let form = mCreateFrom(html); //mBy('fMenuInput');
	mAppend('dMenu', form);
	let d = form.children[0]; mClear(d); mCenterFlex(d);
	let dParent = mDiv(d, { gap: 6 });
	mCenterFlex(dParent);
	DA.playerlist = [];

	//show players
	DA.playerlist = [];
	let params = [gamename, DA.playerlist];
	let funcs = [style_not_playing, style_playing_as_human, style_playing_as_bot];
	for (const u of Serverdata.users) {
		let d = get_user_pic_and_name(u.name, dParent, 40); mStyle(d, { w: 60 })
		let item = { uname: u.name, div: d, state: 0, inlist: false, isSelected: false };

		//host spielt als human mit per default
		if (isdef(U) && u.name == U.name) { toggle_select(item, funcs, gamename, DA.playerlist); }

		//katzen sind bots per default! (select twice!)
		// if (['nimble', 'guest', 'minnow', 'buddy'].includes(u.name)) { toggle_select(item, funcs, gamename, DA.playerlist); toggle_select(item, funcs, gamename, DA.playerlist); }

		d.onclick = () => toggle_select(item, funcs, gamename, DA.playerlist);
		mStyle(d, { cursor: 'pointer' });
	}
	mLinebreak(d, 10);
	show_game_options(d, gamename);

	form.onsubmit = () => {
		let players = DA.playerlist.map(x => ({ name: x.uname, playmode: x.playmode }));
		//console.log('players are', players);
		let game = gamename;
		let options = collect_game_specific_options(game);
		//console.log('options nach collect',options)
		startgame(game, players, options); hide('dMenu');
	};

	mFall('dMenu')
}
function onclick_home() { stopgame(); start_with_assets(); }
function onclick_logout() {
	mFadeClearShow('dAdminRight', 300);
	mClear('dAdminMiddle');
	stopgame();
	clear_screen();
	U = null;
	show_users();
}
function onclick_random() {
	if (uiActivated && !DA.ai_is_moving) ai_move(300);
	else if (!uiActivated) console.log('ui not activated...');
	else if (DA.ai_is_moving) console.log('ai is moving...');
}
function onclick_reload() {
	if (isdef(Z)) {
		// bei einem timed game mit schachuhr, muss ich die zeit abziehen!!!
		if (Z.game == 'fritz' && nundef(Z.fen.winners)) {
			console.log(Z);
			Z.fen.players[Z.uplayer].time_left = stop_timer();
			turn_send_move_update();

		} else {
			FORCE_REDRAW = true; phpPost({ friendly: Z.friendly }, 'table');
		}

	} else if (U) { onclick_tables(); }
	else { show_users(); }
}
function onclick_remove_host() {
	let [role, host, game, fen, uplayer, turn, stage] = [Z.role, Z.host, Z.game, Z.fen, Z.uplayer, Z.turn, Z.stage];

	//im notfall koennte auch host wandern lassen zu anderem player?
	//if ()
	// if host 's
	//if ()
}
function onclick_restart_long() {
	//new code: startgame mit selben players und options
	let game = Z.game;
	let playernames = [Z.host].concat(Z.plorder.filter(x => x != Z.host));
	let playermodes = playernames.map(x => Z.fen.players[x].playmode);
	let i = 0; let players = playernames.map(x => ({ name: x, playmode: playermodes[i++] }));
	let options = Z.options;
	stopgame();
	startgame(game, players, options);
}
function onclick_restart() {
	//old code: nur die fen wird resettet
	let [game, fen, plorder, host] = [Z.game, Z.fen, Z.plorder, Z.host];
	Z.scoring = {};
	if (nundef(fen.original_players)) fen.original_players = fen.players;
	//if (isdef(fen.original_players)) plorder=fen.original_players;
	let playernames = [host].concat(get_keys(fen.original_players).filter(x => x != host));
	let playermodes = playernames.map(x => fen.original_players[x].playmode);

	let default_options = {}; for (const k in Config.games[game].options) default_options[k] = arrLast(Config.games[game].options[k].split(','));
	addKeys(default_options, Z.options);

	//console.log('playernames',playernames,'playermodes',playermodes)
	fen = Z.fen = Z.func.setup(playernames, Z.options);
	[Z.stage, Z.turn, Z.round, Z.step, Z.phase] = [fen.stage, fen.turn, 1, 1, fen.phase];
	let i = 0; playernames.map(x => fen.players[x].playmode = playermodes[i++]); //restore playmode
	if (Z.game == 'spotit') spotit_clear_score();
	//console.log('neue fen',Z.fen.plorder.map(x=>fen.players[x].time_left))
	turn_send_move_update(true);
}
function onclick_restart_move() {
	if (isdef(Clientdata.snapshot)) {
		Z.fen = Clientdata.snapshot;
		clear_transaction();
		turn_send_move_update();
	} else {
		onclick_reload();
	}
}
function onclick_reset_all() { stopgame(); phpPost({ app: 'simple' }, 'delete_tables'); }
function onclick_skip() {
	//removeInPlace(Z.turn,Z.uplayer);
	let [game, fen, uplayer, turn, stage] = [Z.game, Z.fen, Z.uplayer, Z.turn, Z.stage];
	if (game == 'spotit') return;
	else if (game == 'bluff' && stage == 1 || game == 'ferro' && stage == 'auto_ack') { onclick_ack(); }
	else if (game == 'aristo') {
		Z.uplayer = Z.turn[0];
		Z.A = { level: 0, di: {}, ll: [], items: [], selected: [], tree: null, breadcrumbs: [], sib: [], command: null };
		copyKeys(jsCopy(Z.fen), Z);
		copyKeys(UI, Z);
		activate_ui(Z);
		Z.func.activate_ui();
		ai_move();
	} else {
		let plskip = Z.turn[0];
		Z.turn = [get_next_player(Z, plskip)];
		Z.uplayer = plskip;
		turn_send_move_update();
	}
}
function onclick_start_spotit() {
	let [game, fen, uplayer, turn, stage] = [Z.game, Z.fen, Z.uplayer, Z.turn, Z.stage];
	Z.stage = 'move';
	Z.turn = jsCopy(Z.plorder);
	turn_send_move_update();

}
function onclick_table(tablename) {
	//console.log('onclick_table', tablename);
	ensure_polling();
	phpPost({ friendly: tablename }, 'table');
}
function onclick_user(uname) {
	//console.log('onclick_user',uname);
	U = firstCond(Serverdata.users, x => x.name == uname);
	localStorage.setItem('uname', U.name);
	let elem = firstCond(arrChildren('dUsers'), x => x.getAttribute('username') == uname);
	let img = elem.children[0];

	mShrinkTranslate(img, .75, 'dAdminRight', 400, show_username);
	mFadeClear('dUsers', 300);

}
function onclick_tables() { phpPost({ app: 'simple' }, 'tables'); }
function onclick_tide_all() {	

	//each player must get tides={val:x};
	let [game, fen, uplayer, turn, stage] = [Z.game, Z.fen, Z.uplayer, Z.turn, Z.stage];
	for(const plname in fen.players) {
		let pl = fen.players[plname];
		if (isdef(pl.tides)) { continue; }
		pl.tides = { val: rNumber(8,10) };
	}

	proceed_to_newcards_selection();
}

function toggle_select(item, funcs) {
	let params = [...arguments];
	//console.log('pic', item, 'list', params[2]);
	let ifunc = (valf(item.ifunc, 0) + 1) % funcs.length; let f = funcs[ifunc]; f(item, ...params.slice(2));
}
function style_not_playing(item, game, list) {
	console.log('item', item, 'game', game, 'list', list)
	let ui = iDiv(item); let uname = ui.getAttribute('username');
	mStyle(ui, { bg: 'transparent', fg: 'black' });
	arrLast(arrChildren(ui)).innerHTML = uname;
	item.ifunc = 0; item.playmode = 'none'; removeInPlace(list, item);
}
function style_playing_as_human(item, game, list) {
	//console.log('item', item, 'game', game, 'list', list)
	let ui = iDiv(item); let uname = ui.getAttribute('username');
	mStyle(ui, { bg: get_user_color(uname), fg: colorIdealText(get_user_color(uname)) });
	arrLast(arrChildren(ui)).innerHTML = uname;
	item.ifunc = 1; item.playmode = 'human'; list.push(item);
}
function style_playing_as_bot(item, game, list) {
	//console.log('item', item, 'game', game, 'list', list)
	let ui = iDiv(item); let uname = ui.getAttribute('username'); let bg = get_game_color(game);
	mStyle(ui, { bg: bg, fg: colorIdealText(bg) });
	arrLast(arrChildren(ui)).innerHTML = uname.substring(0, 3) + 'bot';
	item.ifunc = 2; item.playmode = 'bot';
}













