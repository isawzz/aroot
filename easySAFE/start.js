onload = start; var FirstLoad = true;

function start() { let uname = localStorage.getItem('uname'); if (isdef(uname)) U = { name: uname }; phpPost({ app: 'simple' }, 'assets'); }
//function start() { let uname = null; if (isdef(uname)) U = { name: uname }; phpPost({ app: 'simple' }, 'assets'); }
function start_with_assets() {

	show_home_logo();
	if (nundef(U)) { show_users(); return; } show_username();

	//if (FirstLoad) setTimeout(() => { phpPost({ friendly: 'duel of Banjul' }, 'table'); FirstLoad = false; }, 800);
	//startgame('ferro'); 
	//#region TESTING
	//test11_cardcoloring();
	//testKartePositionSuit();
	//test10_verrueckt();	
	//setTimeout(() => onclick_table('battle of Kabul'), 1000);
	//onclick_table('battle of Kabul');
	//setTimeout(() => onclick_table('war of San Juan'), 1000);
	//test4_direct_login_onclick_user(); 
	//test2_onclick_user(); //test3_show_tables(); //test1_show_users(); //test0_aristo_setup();
	//#endregion
}

function startgame(game, players, options = {}) {
	//game ... name of game
	//players ... list of {name:x,playmode:y}
	//options ... {some or all poss options}
	if (nundef(game)) game = 'spotit';

	//console.log('..........players',players)

	if (nundef(players)) players = rChoose(Serverdata.users, 2).map(x => ({ name: x.name, playmode: 'human' }));
	let playernames = players.map(x => x.name);

	let default_options = {}; for (const k in Config.games[game].options) default_options[k] = arrLast(Config.games[game].options[k].split(','));
	//console.log('default_options',default_options);
	//console.log('options',jsCopy(options))
	addKeys(default_options, options);
	//if (nundef(options)) { options = {};  }
	//console.log('options',jsCopy(options))

	let fen = window[game]().setup(playernames, options);

	//hier muss ich die playmodes setzen!!!!
	players.map(x => fen.players[x.name].playmode = x.playmode);
	//correct playmode settings for solo mode: host is human, all others are bots!
	if (options.mode == 'solo') {
		let me = isdef(U) && isdef(fen.players[U.name]) ? U.name : rChoose(playernames);
		for (const plname of playernames) {
			if (plname == me) continue;
			fen.players[plname].playmode = 'bot';
		}
		options.mode = 'hotseat';
	}

	//transform number options
	for (const k in options) { if (isNumber(options[k])) options[k] = parseInt(options[k]); }

	let expected = {}; fen.turn.map(x => expected[x] = { stage: fen.stage, step: 0 });
	let o = {
		friendly: generate_table_name(players.length), game: game, host: playernames[0], players: playernames,
		phase: fen.phase, stage: fen.stage, step: 0, round: valf(fen.round, 1), fen: fen, expected: expected, options: options
	};

	//console.log('sending startgame', o)
	ensure_polling();
	phpPost(o, 'startgame');
}
function gamestep() {

	//notes: once this is set by player, will NOT be erased!
	//how to clear notes????
	//if (isdef(Z.prev.notes[uplayer])) Z.notes[uplayer]=Z.prev.notes[uplayer];
	//game specific buttons hide or show
	for(const id of ['bSpotitStart','bClearAck','bRandomMove','bSkipPlayer']) hide(id);
	if (Z.game == 'spotit' && Z.uname == Z.host && Z.stage == 'init') show('bSpotitStart');
	else if (Z.game == 'bluff' && Z.uname == Z.host && Z.stage == 1) show('bClearAck');
	else if (Z.game == 'ferro' && Z.uname == Z.host && Z.stage == 'buy_or_pass') show('bClearAck');
	else if (['ferro','bluff','aristo'].includes(Z.game)) {
		//console.log('random should show because game is', Z.game)
		show('bRandomMove');
	}



	DA.running = true; clear_screen();
	dTable = mBy('dTable'); mFall(dTable); mClass('dTexture', 'wood');

	//console.log('Z',Z)
	if (Z.uname == Z.host) show('dHostButtons'); else hide('dHostButtons');

	shield_off();
	show_title();
	show_role();
	Z.func.present(Z, dTable, Z.uplayer);	// *** Z.uname und Z.uplayer ist IMMER da! ***

	//console.log('_____uname:'+Z.uname,'role:'+Z.role,'player:'+Z.uplayer,'host:'+Z.host,'curplayer:'+Z.turn[0],'bot?',is_current_player_bot()?'YES':'no');
	if (isdef(Z.scoring.winners)) { show_winners(); }
	else if (Z.func.check_gameover(Z)) {
		let winners = show_winners();
		Z.scoring = { winners: winners }
		sendgameover(winners[0], Z.friendly, Z.fen, Z.scoring);
	} else if (is_shield_mode()) {
		if (!DA.no_shield == true) { hide('bRestartMove'); shield_on(); } //mShield(dTable.firstChild.childNodes[1])} //if (isdef(Z.fen.shield)) mShield(dTable);  }
		autopoll();
	} else {
		Z.A = { level: 0, di: {}, ll: [], items: [], selected: [], tree: null, breadcrumbs: [], sib: [], command: null, autosubmit:Config.autosubmit };
		copyKeys(jsCopy(Z.fen), Z);
		copyKeys(UI, Z);
		activate_ui(Z); //console.log('uiActivated',uiActivated?'true':'false');
		Z.func.activate_ui();
		if (Z.options.zen_mode != 'yes') autopoll();
	}

	//landing();

}

//#region ack
function start_simple_ack_round(ackstage,ack_players,nextplayer,callbackname_after_ack,keeppolling=false) {

	let fen = Z.fen;
	//each player except uplayer will get opportunity to buy top discard - nextplayer will draw if passing
	fen.ack_players = ack_players;
	fen.lastplayer = arrLast(ack_players);
	fen.nextplayer = nextplayer; //next player after ack!
	fen.turn_after_ack = [nextplayer];
	fen.callbackname_after_ack = callbackname_after_ack;
	fen.keeppolling = keeppolling;

	Z.stage = ackstage;
	Z.turn = [ack_players[0]];

}
function ack_player(plname){
	let [fen, uplayer, pl] = [Z.fen, Z.uplayer, Z.fen.players[Z.uplayer]];

	//console.log('ack_player','plname',plname,'uplayer',uplayer,'pl',pl,'Z.turn',Z.turn,'Z.stage',Z.stage);
	assertion(sameList(Z.turn,[plname]), "ack_player: wrong turn");
	
	if (plname == fen.lastplayer || fen.players[uplayer].buy==true){
		let func = window[fen.callbackname_after_ack];
		if (isdef(func)) func();
	} else{
		Z.turn = [get_next_in_list(plname,fen.ack_players)];
	}
	//console.log('ack_player','plname',plname,'uplayer',uplayer,'pl',pl,'Z.turn',Z.turn,'Z.stage',Z.stage);
	turn_send_move_update();
}
function clear_ack_variables(){
	let [fen, uplayer, pl] = [Z.fen, Z.uplayer, Z.fen.players[Z.uplayer]];
	delete fen.ack_players;
	delete fen.lastplayer;
	delete fen.nextplayer;
	delete fen.turn_after_ack;
	delete fen.ackstage;
	delete fen.callbackname_after_ack;
	delete fen.keeppolling;

}
//#endregion

//#region helpers
function ai_move(ms = 100) {

	//mFade(dTable,100); //mAnimateTo(dTable, 'opacity', .2, 100); //irgendwie muss ich table hiden!

	DA.ai_is_moving = true;
	let [A, fen] = [valf(Z.A,{}), Z.fen];
	let selitems;

	if (Z.game == 'ferro') {
		//console.log('ferro ai_move', A.items);
		if (Z.stage == 'card_selection') {
			let uplayer = Z.uplayer;
			let i1 = firstCond(A.items, x => x.path.includes(`${uplayer}.hand`));
			let i2 = firstCond(A.items, x => x.key == 'discard');
			selitems = [i1, i2];

		} else {
			selitems = [A.items[1]]; //waehlt immer pass
		}
		//console.log('A', A)

	} else if (Z.game == 'bluff') {
		//weil impl manual (no use of select!), fake selection
		//geht hoch available?
		selitems = [];
		if (isdef(fen.lastbid)) {
			if (coin(30)) A.callback = handle_gehtHoch; else { bluff_generate_random_bid(); A.callback = handle_bid; }
			//have 2 choices: bid or gehthoch
			//assertion(A.items.length == 2, "ai_move bluff: items wrong!!!", A.items)
			// let is_gehthoch = rChoose([0, 1]);
			// if (is_gehthoch) selitems = [A.items[1]]; else { bluff_generate_random_bid(); selitems = [A.items[0]]; }

		} else {
			//assertion(A.items.length == 1, "ai_move bluff: items wrong!!!", A.items)
			bluff_generate_random_bid();
			A.callback = handle_bid;
			//selitems = [A.items[0]];
		}

	} else if (A.command == 'trade') {
		selitems = ai_pick_legal_trade();
	} else if (A.command == 'exchange') {
		selitems = ai_pick_legal_exchange();
	} else if (A.command == 'upgrade') {
		selitems = [rChoose(A.items)];
	} else if (A.command == 'rumor') {
		selitems = [];
		let buildings = A.items.filter(x => x.path.includes('building'));
		let rumors = A.items.filter(x => !x.path.includes('building'));
		selitems = [rChoose(buildings),rChoose(rumors)];
	} else if (ARI.stage[Z.stage] == 'rumors_weitergeben') {
		let players = A.items.filter(x => Z.plorder.includes(x.key))
		let rumors = A.items.filter(x => !Z.plorder.includes(x.key))
		selitems = [rChoose(players),rChoose(rumors)];
	} else if (ARI.stage[Z.stage] == 'journey') {
		//console.log('bot should be picking a correct journey!!!! wie geht das?');
		selitems = []; // always pass!
	} else {
		let items = A.items;
		//console.log('items',items);
		let nmin = A.minselected;
		let nmax = Math.min(A.maxselected, items.length);
		let nselect = rNumber(nmin, nmax);
		selitems = rChoose(items, nselect); if (!isList(selitems)) selitems = [selitems];

	}

	for (const item of selitems) {
		select_last(item, select_toggle);

		//submit on enter item muss als letztes ausgewahehlt werden, und nach dem select_toggle aus A.selected entfernt werden!!!
		//da submit on enter sowieso A.callback aufruft => verify! JA
		if (isdef(item.submit_on_click)) A.selected.pop();
	}
	clearTimeout(TO.ai);
	loader_on();
	TO.ai = setTimeout(() => { if (isdef(A.callback)) A.callback(); loader_off(); }, ms);
}
function ai_schummler() { }

function clear_screen() { mShieldsOff(); clear_status(); clear_title(); for (const ch of arrChildren('dScreen')) mClear(ch); mClassRemove('dTexture', 'wood'); mStyle(document.body, { bg: 'white', fg: 'black' }); }
function clear_timeouts() {
	//clear ALL timeouts!
	for (const k in TO) clearTimeout(TO[k]);
	stop_simple_timer();
}

function is_ai_player(plname) {
	let [fen, name] = [Z.fen, valf(plname,Z.uplayer)];
	return lookup(fen, ['players', name, 'playmode']) == 'bot';
}
function is_human_player(plname) {
	let [fen, name] = [Z.fen, valf(plname,Z.uplayer)];
	return lookup(fen, ['players', name, 'playmode']) == 'human';
}
function is_current_player_bot() {
	let [fen, uplayer, turn] = [Z.fen, Z.uplayer, Z.turn];
	let curplayer = Z.turn[0];
	if (fen.players[curplayer].playmode == 'bot') return true; else return false;
}
function sendgameover(plname, friendly, fen, scoring) {
	let o = { winners: plname, friendly: friendly, fen: fen, scoring: scoring };
	phpPost(o, 'gameover');
}
function sendmove(plname, friendly, fen, action, expected, phase, round, step, stage, notes, scoring = {}) {
	deactivate_ui();
	clear_timeouts();

	let o = { uname: plname, friendly: friendly, fen: fen, action: action, expected: expected, phase: phase, round: round, step: step, stage: stage, notes: notes, scoring: scoring };
	//console.log('sendmove: turn',fen.turn)

	//console.log(`sendmove: simulated: ${DA.simulate}`);
	if (DA.simulate) phpPostSimulate(o, 'move'); else phpPost(o, 'move');
}
function STOPP() { stopgame(); clear_screen(); assertion(Z == null, "ZZZZZZZZZZ NOT NULL") }
function stopgame() {
	if (!DA.running) return;
	DA.running = false;
	DA.noshow = 0;
	//console.log('STOPGAME',getFunctionsNameThatCalledThisFunction());
	clear_timeouts();
	hide('bRestartMove');
	hide('dHostButtons');
	mStyle('dAdmin',{bg:'white'});
	mClear('dAdminMiddle')
	for(const id of ['bSpotitStart','bClearAck','bRandomMove','bSkipPlayer']) hide(id);

	pollStop();
	//clear_table();
	Z = null;
}

function turn_send_move_update(action_star = false) {
	let [fen, uplayer] = [Z.fen, Z.uplayer];	//console.log('sending move:Z',Z); //return;

	//console.log('uplayer', uplayer, 'action_star', action_star);

	[fen.stage, fen.phase, fen.turn] = [Z.stage, Z.phase, Z.turn];

	//ACHTUNG!!!!
	assertion(!isEmpty(fen.turn), 'ACHTUNG!!!!!!!!!!! TURN IST EMPTY in turn_send_move_update!!!!!!!!!!!!!', Z.turn);
	//if (isEmpty(fen.turn)) { fen.turn = Z.turn = [Z.host]; console.log('SETTING HOST TURN BECAUSE TURN EMPTY AT SEND!!!!!!!') }

	let action = action_star ? { stage: '*', step: '*' } : Z.expected[uplayer];
	let expected = {}; fen.turn.map(x => expected[x] = { stage: fen.stage, step: Z.step });
	//console.log(':::turn_send_move_update: action', action, 'expected', expected, 'Z.step', Z.step, 'Z.turn', Z.turn);

	//console.log('in',getFunctionsNameThatCalledThisFunction(),'fen.turn', fen.turn);
	sendmove(Z.uplayer, Z.friendly, Z.fen, action, expected, Z.phase, Z.round, Z.step, Z.stage, Z.notes, Z.scoring);
}






