onload = start;

// function show_username(load_most_recent_table = false) {
// 	let uname = U.name;
// 	let dpic = get_user_pic(uname, 30);
// 	let d = mBy('dAdminRight');
// 	mClear(d);
// 	if (['felix', 'mimi', 'lauren', 'amanda'].includes(uname)) {
// 		add_advanced_ui(d);
// 		show('dAdvancedButtons')
// 	} else {
// 		hide('dAdvancedButtons')
// 	}
// 	mAppend(d, get_logout_button());
// 	mAppend(d, dpic);
// 	if (!load_most_recent_table) phpPost({ app: 'easy' }, 'tables');
// 	else if (!isEmpty(Serverdata.tables)) { onclick_table(Serverdata.tables[0].friendly); }
// }

// function __gamestep() {

// 	let table = Serverdata.table;
// 	//for (const k of ['fen', 'options', 'players']) { table[k] = if_stringified(table[k]); }

// 	//console.log('table', table.fen);
// 	//let fen=JSON.parse(table.fen);
// 	//console.log(fen)
// 	let result = {};
// 	for (const k of ['players', 'fen', 'options', 'scoring']) {
// 		try {
// 			result[k] = JSON.parse(table[k]);
// 		} catch {
// 			result[k] = table[k];
// 		}
// 	}
// 	console.log('result', result)

// }
// function start() {
// 	DA.isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1; if (DA.isFirefox) console.log('using Firefox!')
// 	let uname = DA.secretuser = localStorage.getItem('uname'); if (isdef(uname)) U = { name: uname }; console.log('U', U);
// 	phpPost(null, 'assets');
// }
// function start_with_assets(load_last_table = false) {
// 	show_home_logo();
// 	// U=null;
// 	// load_last_table = DA.showTestButtons;
// 	if (nundef(U)) show_users(); else show_username(load_last_table);
// 	if (DA.showTestButtons) show('dTestButtons');
// }
// function startgame(game, players, options = {}) {
// 	//ensure game and options
// 	if (nundef(game)) game = 'accuse';
// 	let default_options = {}; for (const k in Config.games[game].options) default_options[k] = arrLast(Config.games[game].options[k].split(','));
// 	addKeys(default_options, options);

// 	//ensure players & playernames
// 	if (nundef(players)) players = rChoose(Serverdata.users, 2).map(x => ({ name: x.name })); //, playmode: 'human', strategy:valf(options.strategy,'random') })); //ensure players
// 	let playernames = players.map(x => x.name);

// 	// *** setup ***
// 	let fen = window[game]().setup(playernames, options);

// 	//add fen defaults
// 	if (nundef(fen.round)) fen.round = 1;
// 	if (nundef(fen.phase)) fen.phase = '';
// 	if (nundef(fen.stage)) fen.stage = 0;
// 	if (nundef(fen.step)) fen.step = 0;
// 	if (nundef(fen.turn)) fen.turn = [fen.plorder[0]]; else if (DA.TESTSTART1 && fen.turn.length == 1) fen.turn = [playernames[0]];

// 	//ensure playmode and strategy for each player in fen.players (players abandoned here!!!)
// 	players.map(x => { let pl = fen.players[x.name]; pl.playmode = valf(x.playmode, 'human'); pl.strategy = valf(x.strategy, valf(options.strategy, 'random')); });

// 	//correct playmode settings for solo mode: host is human, all others are bots!
// 	if (options.mode == 'solo') {
// 		let me = isdef(U) && isdef(fen.players[U.name]) ? U.name : rChoose(playernames);
// 		for (const plname of playernames) {
// 			if (plname == me) continue;
// 			fen.players[plname].playmode = 'bot';
// 		}
// 		options.mode = 'hotseat';
// 	}

// 	//transform number options
// 	for (const k in options) { if (isNumber(options[k])) options[k] = parseInt(options[k]); }

// 	let o = {
// 		friendly: generate_table_name(players.length), game: game, host: playernames[0], players: playernames,
// 		fen: fen, options: options
// 	};

// 	ensure_polling(); // macht einfach nur Pollmode = 'auto'
// 	phpPost(o, 'startgame');
// }
// function start_game_with_players(n, game = 'accuse', opts = {}) {
// 	let numplayers = n;
// 	let list = jsCopy(Serverdata.users).map(x => x.name);
// 	removeInPlace(list, 'mimi');
// 	removeInPlace(list, 'felix');
// 	let playernames = rChoose(list, numplayers - 2);
// 	playernames = ['mimi', 'felix'].concat(playernames);

// 	//need to place actual host first!!!!
// 	let uname = U.name;
// 	removeInPlace(playernames, uname);
// 	playernames.unshift(uname);

// 	let playmodes = playernames.map(x => 'human');
// 	let players = [];
// 	for (let i = 0; i < n; i++) players.push({ name: playernames[i], playmode: playmodes[i] });
// 	addKeys({ mode: 'multi' }, opts);
// 	startgame(game, players, opts);
// }

// function autopoll(ms) { TO.poll = setTimeout(_poll, valf(ms, valf(Z.options.poll, 2000))); }
// function get_in_game_buttons() {
// 	return ['bRestartMove', 'bExperience', 'bRandomMove', 'bSpotitStart', 'bRestartGame', 'bClearAck', 'dAccuseTestButtons']
// }
// function __handle_result(result, cmd) {
// 	if (Clientdata.AUTORESET) { Clientdata.AUTORESET = false; if (result.auto == true) { console.log('message bounced'); return; } }
// 	let obj; try { obj = JSON.parse(result); } catch { console.log('ERROR:', result); }
// 	processServerdata(obj, cmd);
// 	switch (cmd) {
// 		case "table":
// 		case "startgame":
// 		case "gameover":
// 			update_table();
// 			if (Z.skip_presentation) { Z.func.state_info(mBy('dTitleLeft')); autopoll(); return; }
// 			clear_timeouts();
// 			gamestep();
// 			break;
// 		case "assets": load_assets(obj); Serverdata = { tables: obj.tables, users: obj.users }; start_with_assets(); break;
// 		case "users": show_users(); break;
// 		case "tables": show_tables(); break;
// 		case "delete_table":
// 		case "delete_tables": show_tables(); break;
// 		default: console.log('unknown result');
// 	}
// }
// function load_assets(obj) {
// 	Config = jsyaml.load(obj.config);
// 	Syms = jsyaml.load(obj.syms);
// 	SymKeys = Object.keys(Syms);
// 	ByGroupSubgroup = jsyaml.load(obj.symGSG);
// 	C52 = jsyaml.load(obj.c52);
// 	Cinno = jsyaml.load(obj.cinno);
// 	Info = jsyaml.load(obj.info);
// 	Sayings = jsyaml.load(obj.sayings);
// 	create_card_assets_c52();
// 	KeySets = getKeySets();

// 	assertion(isdef(Config), 'NO Config!!!!!!!!!!!!!!!!!!!!!!!!');

// }
// function onclick_table(tablename) { phpPost({ friendly: tablename, uname: U.name }, 'table'); }
// function onclick_reset_all() { stopgame(); phpPost(null, 'delete_tables'); }
// function onclick_user(uname) {
// 	U = firstCond(Serverdata.users, x => x.name == uname);
// 	localStorage.setItem('uname', U.name);
// 	DA.secretuser = U.name;
// 	let elem = firstCond(arrChildren('dUsers'), x => x.getAttribute('username') == uname);
// 	let img = elem.children[0];
// 	mShrinkTranslate(img, .75, 'dAdminRight', 400, show_username);
// 	mFadeClear('dUsers', 300);
// }
// function phpPost(data, cmd) {
// 	pollStop();

// 	var o = JSON.stringify({ data: valf(data, {}), cmd: cmd });

// 	var xml = new XMLHttpRequest();
// 	loader_on();
// 	xml.onload = function () {
// 		if (xml.readyState == 4 || xml.status == 200) {
// 			loader_off();
// 			handle_result(xml.responseText, cmd);
// 		} else { console.log('WTF?????') }
// 	}
// 	xml.open("POST", "api.php", true);
// 	xml.send(o);
// }
// function pollStop() { clearTimeout(TO.poll); Clientdata.AUTORESET = true; }
// function _poll() {
// 	assertion(isdef(U) && isdef(Z) && isdef(Z.friendly), 'poll without U or Z!!!', U, Z);
// 	console.log('polling');
// 	phpPost({ friendly: Z.friendly, uname: Z.uplayer, auto: true }, 'table');
// }
// function show_advanced_ui(dParent) {
// 	let d = mDiv(dParent, {}, 'dAdvancedUI');
// 	let sz = 20;
// 	let styles = { bg: 'silver', wmin: sz, h: sz, rounding: '50%', maright: 10, align: 'center' };
// 	mButton(' ', onclick_advanced_test, d, styles, 'enabled');
// 	style_advanced_button();

// 	show('dAdvancedButtons')
// }
// function show_tables(ms = 500) {

// 	clear_screen();
// 	let dParent = mBy('dTables');
// 	mClear(dParent);

// 	show_games();

// 	let tables = Serverdata.tables;
// 	if (isEmpty(tables)) { mText('no active game tables', dParent); return []; }

// 	tables.map(x => x.game_friendly = Config.games[x.game].friendly);
// 	mText(`<h2>game tables</h2>`, dParent, { maleft: 12 })
// 	let t = mDataTable(tables, dParent, null, ['friendly', 'game_friendly', 'players'], 'tables', false);

// 	mTableCommandify(t.rowitems, {
// 		0: (item, val) => hFunc(val, 'onclick_table', val, item.id),
// 	});

// 	for (const ri of t.rowitems) {
// 		let r = iDiv(ri);
// 		let h = hFunc('delete', 'delete_table', ri.o.friendly);
// 		c = mAppend(r, mCreate('td'));
// 		c.innerHTML = h;
// 	}
// }
// function show_username(load_recent_table = false) {
// 	let uname = U.name;
// 	let dpic = get_user_pic(uname, 30);
// 	let d = mBy('dAdminRight');
// 	mClear(d);
// 	if (['felix', 'mimi', 'lauren', 'amanda'].includes(uname)) show_advanced_ui(d); //mAppend(d, get_advanced_menu_buttons());
// 	mAppend(d, get_logout_button());
// 	mAppend(d, dpic);
// 	console.log('load_recent_table',load_recent_table)
// 	if (!load_recent_table) phpPost(null, 'tables');
// 	else if (!isEmpty(Serverdata.tables)) { console.log('!!!'); onclick_table(Serverdata.tables[0].friendly); }
// }
// function show_users(ms = 300) {
// 	let dParent = mBy('dUsers');
// 	mClear(dParent);
// 	for (const u of Serverdata.users) {
// 		if (['ally', 'bob', 'leo'].includes(u.name)) continue;
// 		//console.log('u',u)
// 		let d = get_user_pic_and_name(u.name, dParent);
// 		d.onclick = () => onclick_user(u.name);
// 		mStyle(d, { cursor: 'pointer' });
// 	}
// 	mFall(dParent, ms);
// }
// function stopgame() {
// 	clear_timeouts();
// 	pollStop();
// 	get_in_game_buttons().map(x => hide(x));
// 	mClear('dAdminMiddle');
// 	mClear('dTablename');
// 	delete Serverdata.table; delete Serverdata.playerdata; Clientdata = {}; Z = null;
// 	staticTitle();
// }















