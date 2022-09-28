function test_start_ferro(mode = 'multi') {
	let game = 'ferro';
	// let playernames = ['felix', 'lauren', 'mimi'];
	let playernames = ['mimi', 'lauren', 'felix'];
	let playmodes = ['human', 'human', 'human'];
	let strategies = ['random', 'random', 'random'];
	let i = 0; let players = playernames.map(x => ({ name: x, strategy: strategies[i], playmode: playmodes[i++] }));
	// let i = 0; let players = playernames.map(x => ({ name: x, playmode: playmodes[i++] }));
	let options = { mode: mode, thinking_time: 20 };
	startgame(game, players, options);
}
function test_start_aristo(n = 3, mode = 'multi') {
	let game = 'aristo';
	// let playernames = ['felix', 'lauren', 'mimi'];
	let playernames = arrTake(['mimi', 'felix', 'amanda', 'lauren', 'gul', 'nasi'], n);
	let playmodes = ['human', 'human', 'human', 'human', 'human', 'human'];
	let strategies = ['random', 'random', 'random', 'random', 'random', 'random', 'random'];
	let i = 0; let players = playernames.map(x => ({ name: x, strategy: strategies[i], playmode: playmodes[i++] }));
	// let i = 0; let players = playernames.map(x => ({ name: x, playmode: playmodes[i++] }));
	let options = { mode: mode, commission: 'no' };
	startgame(game, players, options);
}

function onclick_ack() {
	if (nundef(Z) || nundef(Z.func.clear_ack)) return;

	Z.func.clear_ack();
	//if (!is_sending) take_turn_single();
}
function onclick_by_rank() {

	//console.log('onclick_by_rank');

	let [plorder, stage, A, fen, uplayer, pl] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer, Z.fen.players[Z.uplayer]];
	//console.log('sorting for', uplayer);
	let items = ui_get_hand_items(uplayer).map(x => x.o);
	let h = UI.players[uplayer].hand;
	pl.handsorting = 'rank'; //{ n: items.length, by: 'rank' };
	//lookupSetOverride(Clientdata,['handsorting',uplayer],pl.handsorting);
	Clientdata.handsorting = pl.handsorting;
	localStorage.setItem('handsorting', Clientdata.handsorting);
	//console.log('h ui', h);
	//console.log('items', items);
	let cardcont = h.cardcontainer;
	let ch = arrChildren(cardcont);
	ch.map(x => x.remove());

	//console.log('rankstr', Z.func.rankstr);//console.log('rankstr',Z.func.rankstr);
	let sorted = sortCardItemsByRank(items, Z.func.rankstr); //window[Z.game.toUpperCase()].rankstr); //'23456789TJQKA*');
	h.sortedBy = 'rank';
	for (const item of sorted) {
		mAppend(cardcont, iDiv(item));
	}
	//let sorted = items.sort((a, b) => a.o.rank - b.o.rank);
}
function onclick_by_suit() {
	let [plorder, stage, A, fen, uplayer, pl] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer, Z.fen.players[Z.uplayer]];
	let items = ui_get_hand_items(uplayer).map(x => x.o);
	let h = UI.players[uplayer].hand;
	Clientdata.handsorting = pl.handsorting = 'suit'; //{ n: items.length, by: 'suit' };
	localStorage.setItem('handsorting', Clientdata.handsorting);
	//console.log('h ui', h);
	let cardcont = h.cardcontainer;
	let ch = arrChildren(cardcont);
	ch.map(x => x.remove());
	let sorted = sortCardItemsByRank(items, Z.func.rankstr); //'23456789TJQKA*');
	sorted = sortCardItemsBySuit(sorted);
	h.sortedBy = 'suit';
	for (const item of sorted) {
		mAppend(cardcont, iDiv(item));
	}
	//let sorted = items.sort((a, b) => a.o.rank - b.o.rank);
}
function onclick_cancelmenu() { hide('dMenu'); }
function onclick_game_menu_item(ev) {
	let gamename = ev_to_gname(ev);
	stopgame();
	show('dMenu'); mClear('dMenu');
	let dMenu = mBy('dMenu');

	let dForm = mDiv(dMenu, { align: 'center' }, 'fMenuInput');
	let dInputs = mDiv(dForm, {}, 'dMenuInput');
	let dButtons = mDiv(dForm, {}, 'dMenuButtons');
	let bstart = mButton('start', () => {
		let players = DA.playerlist.map(x => ({ name: x.uname, playmode: x.playmode }));
		//console.log('players are', players);
		let game = gamename;
		let options = collect_game_specific_options(game);
		for (const pl of players) { if (isEmpty(pl.strategy)) pl.strategy = valf(options.strategy, 'random'); }
		//console.log('options nach collect',options)
		startgame(game, players, options); hide('dMenu');
	}, dButtons, {}, 'button');
	let bcancel = mButton('cancel', () => { hide('dMenu'); }, dButtons, {}, 'button');

	let d = dInputs; mClear(d); mCenterFlex(d);
	let dParent = mDiv(d, { gap: 6 });
	mCenterFlex(dParent);
	DA.playerlist = [];

	//show players
	DA.playerlist = [];
	let params = [gamename, DA.playerlist];
	let funcs = [style_not_playing, style_playing_as_human, style_playing_as_bot];
	for (const u of Serverdata.users) {
		if (['ally', 'bob', 'leo'].includes(u.name)) continue; //lass die aus!!!!
		let d = get_user_pic_and_name(u.name, dParent, 40); mStyle(d, { w: 60 })
		let item = { uname: u.name, div: d, state: 0, strategy: '', inlist: false, isSelected: false };

		//host spielt als human mit per default
		if (isdef(U) && u.name == U.name) { toggle_select(item, funcs, gamename, DA.playerlist); }

		//katzen sind bots per default! (select twice!)
		// if (['nimble', 'guest', 'minnow', 'buddy'].includes(u.name)) { toggle_select(item, funcs, gamename, DA.playerlist); toggle_select(item, funcs, gamename, DA.playerlist); }

		d.onclick = () => toggle_select(item, funcs, gamename, DA.playerlist);
		mStyle(d, { cursor: 'pointer' });
	}
	mLinebreak(d, 10);
	show_game_options(d, gamename);

	mFall('dMenu');
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
	//console.log('====>onclick_random');
	if (uiActivated && !DA.ai_is_moving) ai_move(300);
	else if (!uiActivated) console.log('NOP: ui not activated...');
	else if (DA.ai_is_moving) console.log('NOP: ai is (or was already) moving...');
	else console.log('NOP: unknown...');
}
//function onclick_random() { bluff_ai();}
function onclick_reload_after_switching() { DA.pollCounter = 0; DA.reloadColor = rColor(); onclick_reload(); }

function onclick_reload() {
	//console.log('onclick_reload')
	if (isdef(Z)) {
		// bei einem timed game mit schachuhr, muss ich die zeit abziehen!!!
		if (Z.game == 'fritz' && nundef(Z.fen.winners)) {
			console.log(Z);
			Z.fen.players[Z.uplayer].time_left = stop_timer();
			take_turn_fen();

		} else {
			FORCE_REDRAW = true; send_or_sim({ friendly: Z.friendly, uname: Z.uplayer, auto: false }, 'table');
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
function onclick_restart() {
	//old code: nur die fen wird resettet
	let [game, fen, plorder, host] = [Z.game, Z.fen, Z.plorder, Z.host];
	Z.scoring = {};
	if (nundef(fen.original_players)) fen.original_players = fen.players;
	//if (isdef(fen.original_players)) plorder=fen.original_players;
	let playernames = [host].concat(get_keys(fen.original_players).filter(x => x != host));
	let playmodes = playernames.map(x => fen.original_players[x].playmode);
	let strategies = playernames.map(x => fen.original_players[x].strategy);

	let default_options = {}; for (const k in Config.games[game].options) default_options[k] = arrLast(Config.games[game].options[k].split(','));
	addKeys(default_options, Z.options);

	//console.log('playernames',playernames,'playmodes',playmodes)
	fen = Z.fen = Z.func.setup(playernames, Z.options);
	[Z.plorder, Z.stage, Z.turn, Z.round, Z.step, Z.phase] = [fen.plorder, fen.stage, fen.turn, 1, 1, fen.phase];

	if (DA.TESTSTART1) Z.turn = fen.turn = Z.host;

	let i = 0; playernames.map(x => { let pl = fen.players[x]; pl.name = x; pl.strategy = strategies[i]; pl.playmode = playmodes[i++]; });
	// let i = 0; let players = playernames.map(x => ({ name: x, strategy: strategies[i], playmode: playmodes[i++] }));
	// let i = 0; playernames.map(x => fen.players[x].playmode = playmodes[i++]); //restore playmode
	//if (Z.game == 'spotit') spotit_clear_score();
	//console.log('neue fen',Z.fen.plorder.map(x=>fen.players[x].time_left))
	take_turn_fen_clear();
}
function onclick_restart_move() { clear_transaction(); onclick_reload(); }
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
		take_turn_fen();
	}
}
function onclick_start_spotit() {
	let [game, fen, uplayer, turn, stage] = [Z.game, Z.fen, Z.uplayer, Z.turn, Z.stage];
	Z.stage = 'move';
	Z.turn = jsCopy(Z.plorder);
	take_turn_fen();

}
function onclick_status() { query_status(); }
function onclick_table(tablename) {
	//console.log('onclick_table', tablename);
	//ensure_polling();
	send_or_sim({ friendly: tablename, uname: U.name }, 'table');
}
function onclick_tables() { phpPost({ app: 'simple' }, 'tables'); }
function onclick_tithe_all() {

	//each player must get tithes={val:x};
	let [game, fen, uplayer, turn, stage] = [Z.game, Z.fen, Z.uplayer, Z.turn, Z.stage];
	for (const plname in fen.players) {
		let pl = fen.players[plname];
		if (isdef(pl.tithes)) { continue; }
		pl.tithes = { val: rNumber(8, 10) };
	}

	proceed_to_newcards_selection();
}
function onclick_user(uname) {
	//console.log('onclick_user',uname);
	U = firstCond(Serverdata.users, x => x.name == uname);
	localStorage.setItem('uname', U.name);
	DA.secretuser = U.name;
	let elem = firstCond(arrChildren('dUsers'), x => x.getAttribute('username') == uname);
	let img = elem.children[0];

	mShrinkTranslate(img, .75, 'dAdminRight', 400, show_username);
	mFadeClear('dUsers', 300);

}
function onclick_view_buildings(){
	let [game, fen, uplayer, turn, stage] = [Z.game, Z.fen, Z.uplayer, Z.turn, Z.stage];
	let buildings = UI.players[uplayer].buildinglist;

	for(const b of buildings) b.items.map(x=>face_up(x));
	TO.buildings = setTimeout(hide_buildings,5000);
	//console.log('buildings',buildings);
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













