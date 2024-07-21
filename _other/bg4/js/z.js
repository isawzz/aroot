
class GSpotitMulti extends GSpotit {
	constructor(name, o) { super(name, o); }
	make_players(table) {
		let players = this.players = {};
		for (const plname of table.players) {
			players[plname] = { name: plname, color: getColorDictColor(DB.users[plname].color), imgPath: `../base/assets/images/${plname}.jpg`, score: 0 };
		}
		this.player = Session.cur_user;
		this.me = players[this.player];
		this.others = Object.values(players).filter(x => x.name != this.player);
	}
	startGame() {
		resetState();
		this.successFunc = successPictureGoal;
		this.failFunc = failPictureGoal;
		this.correctionFunc = showCorrectUis;
		this.numCards = 2;
		this.colarr = _calc_hex_col_array(this.rows, this.cols);
		let perCard = arrSum(this.colarr);
		this.nShared = (this.numCards * (this.numCards - 1)) / 2;
		this.nUnique = perCard - this.numCards + 1;
		this.numKeysNeeded = this.nShared + this.numCards * this.nUnique;
		this.keys = setKeysG(this, (_, x) => !x.includes(' '), this.numKeysNeeded + 1);
		resetRound(); //hier passiert clear table!
		uiActivated = false;
		QContextCounter += 1;
		showStats(false);
		this.update_status(); //ueber den cards soll ein panel sein mit all den spielern
		show_title(Session.table.friendly);
		this.trialNumber = 0;
		hide('sidebar');
		this.trials = 1;
		this.startTime = get_timestamp();
		mLinebreak(dTable, 25);
		let infos = this.deal(); //backend
		let items = this.items = [];
		for (const info of infos) {
			let item = spotitCard(info, dTable, { margin: 10 }, this.interact.bind(this));
			items.push(item);
		}
		Selected = null;
		uiActivated = true;
	}
	update_status() {
		let d = dTitle;
		clearElement(d);
		let d1 = mDiv(d, { display: 'flex', 'justify-content': 'center' });
		for (const plname in this.players) {
			let pl = this.players[plname];
			//let d2=mDiv(d1,{margin:10},null,`${pl}:${this.players[pl].score}`);
			let d2 = mDiv(d1, { vmargin: 10, hmargin: 20, align: 'center' }, null, `<img src='${pl.imgPath}' style="display:block" class='img_person' width=50 height=50>${pl.score}`);
		}
	}
	evaluate() {
		if (!canAct()) return;
		uiActivated = false; clearTimeouts();
		IsAnswerCorrect = Selected.isCorrect;
		this.me.score += IsAnswerCorrect ? 1 : 0;
		user_game_status();
	}

	//#region spotit
	interact(ev) {
		ev.cancelBubble = true;
		if (!canAct()) { console.log('no act'); return; }

		let keyClicked = evToProp(ev, 'key');
		let id = evToId(ev);

		if (isdef(keyClicked) && isdef(Items[id])) {
			this.pause();
			let item = Items[id];
			//console.log('clicked key', keyClicked, 'of card', id, item);
			if (Object.values(item.shares).includes(keyClicked)) {
				//console.log('success!!!');//success!
				//find the card that shares this symbol!
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
				Selected = { isCorrect: false, feedbackUI: [cardSymbol], correctUis: this.getSharedSymbols(), correctionDelay: this.items.length * 1500 };

			}
			this.evaluate.bind(this)();
		}
	}
	deal() {
		let keys = choose(this.keys, this.numKeysNeeded);
		let dupls = keys.slice(0, this.nShared); //these keys are shared: cards 1 and 2 share the first one, 1 and 3 the second one,...
		let uniqs = keys.slice(this.nShared);
		//console.log('numCards', numCards, '\nperCard', perCard, '\ntotal', keys.length, '\ndupls', dupls, '\nuniqs', uniqs);

		let infos = [];
		for (let i = 0; i < this.numCards; i++) {
			let keylist = uniqs.slice(i * this.nUnique, (i + 1) * this.nUnique);
			//console.log('card unique keys:',card.keys);
			let info = { id: getUID(), shares: {}, keys: keylist, rows: this.rows, cols: this.cols, colarr: this.colarr };
			infos.push(info);
		}

		let iShared = 0;
		for (let i = 0; i < this.numCards; i++) {
			for (let j = i + 1; j < this.numCards; j++) {
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
		return infos;
	}
	getSharedSymbols() {
		let result = [];
		for (const item of this.items) {
			for (const id in item.shares) {
				let k = item.shares[id];
				let ui = iGetl(item, k);
				result.push(ui);
			}
		}
		return result;
	}
	//#endregion
}




















class GSpotitMulti_mess extends GSpotit {
	constructor(name, o) { super(name, o); }
	static start_fen(players) { let fen = {}; for (const pl of players) { fen[pl] = 0; } return fen; }
	fen_to_state(fen) {
		console.log('fen', fen);
		this.playerscores = isDict(fen) ? fen : JSON.parse(fen);
		for (const plname in this.players) { let pl = this.players[plname]; pl.score = this.playerscores[plname]; }
		console.log('players', this.players);
	}
	make_players(table) {
		let players = this.players = {};
		for (const plname of table.players) {
			players[plname] = { name: plname, color: getColorDictColor(DB.users[plname].color), imgPath: `../base/assets/images/${plname}.jpg`, score: 0 };
		}
		this.player = Session.cur_user;
		this.me = players[this.player];
		this.others = Object.values(players).filter(x => x.name != this.player);
	}
	make_fen_vor_move(table, moves = []) { return table.fen; }
	make_fen_after_move() {
		this.me.score += IsAnswerCorrect ? 1 : 0;
		let fen = {};
		for (const plname in this.players) {
			let pl = this.players[plname];
			fen[plname] = pl.score;
		}
		return fen;
	}
	startGame(fen) {
		//controller.start_game + this.start_game:
		resetState();
		this.successFunc = successPictureGoal;
		this.failFunc = failPictureGoal;
		this.correctionFunc = showCorrectUis;
		//controller start_level + this.start_level
		console.log(this.player);
		Settings.updateGameValues(this.player, this);
		super.start_level();
		this.numCards = 2;
		this.colarr = _calc_hex_col_array(this.rows, this.cols);
		let perCard = arrSum(this.colarr);
		this.nShared = (this.numCards * (this.numCards - 1)) / 2;
		this.nUnique = perCard - this.numCards + 1;
		this.numKeysNeeded = this.nShared + this.numCards * this.nUnique;
		this.keys = setKeysG(this, (_, x) => !x.includes(' '), this.numKeysNeeded + 1);

		this.fen_to_state(fen);

		//controller.startAction() + this.startAction;
		resetRound(); //hier passiert clear table!
		uiActivated = false;
		TOMain = setTimeout(() => this.prompt(), 300);
	}
	update_status() {
		let d = dTitle;
		clearElement(d);
		let d1 = mDiv(d, { display: 'flex', 'justify-content': 'center' });
		for (const plname in this.players) {
			let pl = this.players[plname];
			//let d2=mDiv(d1,{margin:10},null,`${pl}:${this.players[pl].score}`);
			let d2 = mDiv(d1, { vmargin: 10, hmargin: 20, align: 'center' }, null, `<img src='${pl.imgPath}' style="display:block" class='img_person' width=50 height=50>${pl.score}`);
		}
	}
	prompt() {
		//controller.prompt + this.prompt;
		QContextCounter += 1;
		showStats(false);

		this.update_status(); //ueber den cards soll ein panel sein mit all den spielern

		show_title(Session.table.friendly);
		this.trialNumber = 0;

		hide('sidebar');
		this.trials = 1;
		//show_instruction('find common symbol', dTitle);

		//this.makeTimer();
		this.startTime = get_timestamp();

		mLinebreak(dTable, 25);

		let infos = this.deal(); //backend

		//frontend
		let items = this.items = [];
		for (const info of infos) {
			let item = spotitCard(info, dTable, { margin: 10 }, this.interact.bind(this));
			items.push(item);
		}

		this.activateUi.bind(this)();
	}
	activateUi() {
		Selected = null;
		uiActivated = true;
		this.activate(); //das ist in GameTimed (classes.js)
	}
	deal() {
		let keys = choose(this.keys, this.numKeysNeeded);
		let dupls = keys.slice(0, this.nShared); //these keys are shared: cards 1 and 2 share the first one, 1 and 3 the second one,...
		let uniqs = keys.slice(this.nShared);
		//console.log('numCards', numCards, '\nperCard', perCard, '\ntotal', keys.length, '\ndupls', dupls, '\nuniqs', uniqs);

		let infos = [];
		for (let i = 0; i < this.numCards; i++) {
			let keylist = uniqs.slice(i * this.nUnique, (i + 1) * this.nUnique);
			//console.log('card unique keys:',card.keys);
			let info = { id: getUID(), shares: {}, keys: keylist, rows: this.rows, cols: this.cols, colarr: this.colarr };
			infos.push(info);
		}

		let iShared = 0;
		for (let i = 0; i < this.numCards; i++) {
			for (let j = i + 1; j < this.numCards; j++) {
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
		return infos;
	}
	interact(ev) {
		ev.cancelBubble = true;
		if (!canAct()) { console.log('no act'); return; }

		let keyClicked = evToProp(ev, 'key');
		let id = evToId(ev);

		if (isdef(keyClicked) && isdef(Items[id])) {
			this.pause();
			let item = Items[id];
			//console.log('clicked key', keyClicked, 'of card', id, item);
			if (Object.values(item.shares).includes(keyClicked)) {
				//console.log('success!!!');//success!
				//find the card that shares this symbol!
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
				Selected = { isCorrect: false, feedbackUI: [cardSymbol], correctUis: this.getSharedSymbols(), correctionDelay: this.items.length * 1500 };

			}
			this.evaluate.bind(this)();
		}
	}
	evaluate() {
		if (!canAct()) return;
		uiActivated = false; clearTimeouts();
		IsAnswerCorrect = Selected.isCorrect;

		this.me.score += IsAnswerCorrect ? 1 : 0;
		user_game_status();

		//let msTotal = this.msTotal = get_timestamp() - this.startTime;
		//let uname = Session.cur_user;
		//let game = Session.cur_game;
		//let move = this.to_move(IsAnswerCorrect, msTotal)

		//let fen = this.make_fen_after_move();
		//console.log('nach move fen', fen, 'move', move);
		//to_server({ fen: fen, game: game, user: uname, tid: Session.cur_tid, data: move, step: DA.step[uname] }, 'move');
		//DA.step[uname]++;
	}
	getSharedSymbols() {
		let result = [];
		for (const item of this.items) {
			for (const id in item.shares) {
				let k = item.shares[id];
				let ui = iGetl(item, k);
				result.push(ui);
			}
		}
		return result;
	}
	to_move(is_correct, ms_total) { return '' + (is_correct ? 1 : 0) + ' ' + ms_total; }
	from_move(data) { return { is_correct: (data[0] == '1' ? true : false), ms_total: stringAfter(data, ' ') }; }
	onTimeup() {
		Selected = { isCorrect: false, correctUis: this.getSharedSymbols(), correctionDelay: this.items.length * 2000 };
		this.evaluate.bind(this)();
	}
}




//#region work 1
function long_polling_shield_on() {

	DA.long_polling = { type: 'table_status', data: Session.cur_tid, tid: Session.cur_tid, table: Session.cur_table, polling: true, waiting_for_prop: 'status', waiting_for_val: 'started' };
	polling_shield_on('waiting for host to start game...');
	TOMain = setTimeout(() => {
		check_poll_orig();
	}, 5000);

}
function check_poll_orig() {
	let p = DA.long_polling;
	if (nundef(p)) { console.log('no polling is active!'); return; }
	to_server(p.data, p.type);
}
function report_poll(obj) {
	//console.log('@polling! server answer:', obj.table.status);
	polling_shield_off();
	update_cur_table(obj);
	status_message_off();
	get_games();
}
function update_cur_table(obj, color) {
	let t = Session.cur_table;
	let tnew = obj.table;
	if (isdef(obj.player_record)) copyKeys(obj.player_record, tnew);
	//console.log('tnew', tnew, '\nt', t);
	copyKeys(tnew, t);

	if (isdef(color)) {
		// console.log('table', obj.table);
		let d = mBy(`rk_${obj.table.id}`);
		// console.log('rundkreis', d);
		if (isdef(d)) mStyle(d, { bg: color }); //table status has changed!
	}


	//console.log('TABLE UPDATE:', t);

}
function analyse_tables(user_tables) {
	user_tables.map(x => console.log('table:', x));

	//classify per game: for each game get tables for that game
	let bygame = {}, bytid = {};
	for (const t of user_tables) {
		lookupAddToList(bygame, [t.game], t);
		lookupSet(bytid, [t.id], t);
	}
	if (!isEmpty(user_tables)) {
		Session.cur_table = user_tables[0];
		Session.cur_tid = Session.cur_table.id;
	} else {
		Session.cur_table = null;
		Session.cur_tid = undefined;
	}
	lookupSetOverride(DA, [Session.cur_user, 'tables_by_game'], bygame);
	lookupSetOverride(DA, [Session.cur_user, 'tables_by_tid'], bytid);
	//console.log('DA', DA);
	return bygame;
	//Session.tables_by_game=di;
}
function create_new_table(user, game) {
	user = valf(user, Session.cur_user);
	game = valf(game, Session.cur_game);
	//die options sind das was im open_game_menu drinsteht!
	let opt = extract_game_options();

	//was muss geschehen?
	//mach einen neuen table record
	let t = {};
	t.friendly = generate_friendly_table_name();
	t.game = Session.cur_game;
	//created and modified must be set at server!
	t.host = user;
	t.players = opt.players;
	t.fen = GSpotitMulti.start_fen(t.players);
	t.status = 'created';
	t.player_init = '';
	DA.next = get_games;
	to_server(t, 'create_table');
	//dann wenn ich die id bekomme, add this table to Session.tables
}
function join_table(user, tid) { to_server({ uname: user, tid: tid }, 'join_table'); }

function start_table(uname, tid) {
	to_server({ uname: uname, tid: tid }, 'start_table');
	//console.log('host is starting the game!');
	//how is host starting the game?

}

//#region table NEW temp done

//#endregion

//#region old stuff (move)

function send_move_dep(game, uname, tid, step, move) {
	Session.cur_menu = 'games';
	let data = { game: game, uname: uname, tid: tid, step: step, move: move };
	to_server(data, "send_move");
	//console.log('supposedly getting game data!'); 
}
function get_play_NOP(step, move) {
	Session.cur_menu = 'games';
	let data = { uname: Session.cur_user, tid: Session.cur_tid };
	if (isdef(step) && isdef(move)) { data.step = step; data.move = move; }
	to_server(data, "play");
	//console.log('supposedly getting game data!'); 
}
function update_table(moves) {
	console.log('________update table', Session.cur_tid);

	let t = DB.tables[Session.cur_tid];
	let fen = t.fen;
	//console.log('moves', moves, 'fen', fen);

	//das muss das spiel machen! numPlayers numRounds curRound:pl1_state,pl2_state
	let [pre, pls] = fen.split(':');
	let [numPlayers, numRounds, curRound] = allIntegers(pre);
	let players = t.players;
	let nums = allIntegers(pls);
	for (let i = 0; i < numPlayers; i++) {
		players[i].msecs = nums[i * 2];
		players[i].score = nums[i * 2 + 1];
	}
	let i = 0;
	while (i < Object.values(moves).length) {

		for (const pl of t.players) {

		}

		i++;

	}
	//console.log('common move', i, moves);
}
function open_table_dep(tid) {
	let t = DB.tables[tid];
	Session.cur_tid = tid;
	//console.log('opening table ', t);
	makemove();
}
function makemove(t) {
	//console.log('moves', t.moves);
	let myMoves = t.moves[Session.cur_user];
	Session.cur_step = myMoves.length + 1;
	myMoves.push(randomNumber(1000, 2000)); //measured time for 1 spotit card
	Session.cur_move = arrLast(myMoves);
	DA.next = get_play_dep(Session.cur_step, Session.cur_move);
	save_tables();
}
function start_table_dep(tid) {
	let t = DB.tables[tid];
	Session.cur_tid = tid;
	t.status = 'started';
	//console.log('the game described by table', tid, 'is started by', Session.cur_user, t);
	t.moves = {};
	//console.log('t.players', t.players);
	t.players.map(x => t.moves[x] = []);
	makemove(t);
}

//#endregion

//#endregion





function simplest_game_open_for_move_dep(obj) {
	//vom server bekommt man den state: obj

	//Session is updated: 
	for (const k in obj) { if (isdef(Session[k])) copyKeys(obj[k], Session[k]); else Session[k] = obj[k]; }
	Session.cur_table = Session.table;

	//console.log('Session',Session)
	//console.log('obj', obj, '\nSession', Session);

	console.assert(isdef(Session.cur_user) && Session.cur_game == Session.table.game && Session.cur_tid == Session.table.id, "SESSION MISMATCH IN GAME_OPEN_FOR_MOVE!!!!!!!!!!!!!!!!!!!!!");

	open_game_ui();

	G = open_game(Session.cur_user, Session.cur_game); //macht ein new game!

	//Session.cur_fen = G.make_fen_vor_move(Session.table, Session.moves);
	G.make_players(Session.table);
	G.startGame(Session.cur_fen);

	//create a fen
	//present fen

}

//#region helpers
function open_game(uname, game, fen) {
	U = {};
	copyKeys(DB.users[uname], U);
	U.session = {}; //used for score!???
	G = new (classByName(capitalize(game) + 'Multi'))(game, DB.games[game]);
	Settings = new SettingsClass(G, dAux);
	if (nundef(U.games[game])) {
		if (G.controllerType == 'solitaire') { U.games[game] = { nTotal: 0, nCorrect: 0, nCorrect1: 0, startlevel: 0 }; }
		else U.games[game] = {};
	}
	if (isdef(G.maxlevel)) G.level = Math.min(getUserStartLevel(game), G.maxlevel);
	if (G.id != 'gAristo') Settings.updateGameValues(U, G); //hier werden die belinda settings geadded
	showGameTitle();
	return G;
}
function parse_fen(fen) {
	//opt:glob:pl1:pl2:...
	let parts = fen.split(':');
	let opt = parts[0];
	let glob = parts.length > 1 ? parts[1] : null;
	let pls = [];
	for (let i = 2; i < parts.length; i++) {
		pls.push(parts[i]);
	}
	return { opt: opt, glob: glob, pls: pls };
}
function ui_ground_zero() {
	STOPAUS = true;
	uiActivated = aiActivated = false;
	clearTimeouts(); //legacy
	if (isdef(G) && isdef(G.clear)) G.clear();
	if (isdef(GC) && isdef(GC.clear)) GC.clear();
	TOMan.clear();
	clearMarkers();
	resetUIDs(); //sicherheitshalber!
	Items = {};

}

