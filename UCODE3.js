
function show_polling_signal() {

	let url = window.location.href;
	//console.log('url', url, typeof(url));
	let loc = url.includes('telecave') ? 'tele' : 'local';
	document.title = `${loc}:${DA.pollCounter} ${Config.games[Z.game].friendly}`;


	// let d1 = mDiv(mBy('dAdmin'), { position: 'fixed', top: 10, left: 73, width: 20, height: 20, bg: valf(DA.reloadColor, 'green'), rounding: 10 });
	// mFadeRemove(d1, 1000);
}

function gamestep() {

	show_admin_ui();

	DA.running = true; clear_screen();
	dTable = mBy('dTable'); mFall(dTable); mClass('dTexture', 'wood');

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
		Z.A = { level: 0, di: {}, ll: [], items: [], selected: [], tree: null, breadcrumbs: [], sib: [], command: null, autosubmit: Config.autosubmit };
		copyKeys(jsCopy(Z.fen), Z);
		copyKeys(UI, Z);
		activate_ui(Z); //console.log('uiActivated',uiActivated?'true':'false');
		Z.func.activate_ui();
		//if (Z.options.zen_mode != 'yes' && Z.mode != 'hotseat' && !DA.simulate) autopoll();
		if (Z.options.zen_mode != 'yes' && Z.mode != 'hotseat' && Z.fen.keeppolling) autopoll();
		//  (Z.turn.length > 1 || Z.stage == 'can_resolve' && get_multi_trigger() != 'mimi' || Z.game == 'bluff')) autopoll();
		//  (Z.turn.length > 1 || Z.stage == 'can_resolve' || Z.game == 'bluff' && Z.stage == 1)) autopoll();

		//let favicon = document.querySelector('[rel=icon]'); favicon.href = "../base/assets/images/icons/yourturn.gif";

	}

	//landing();

}

//#region comm pass trial 1
function ari_transfer_commission_cards_to_di(){
	let [fen, A, uplayer, plorder] = [Z.fen, Z.A, Z.uplayer, Z.plorder];

	//console.log('we are in stage ' + Z.stage);

	let items = A.selected.map(x => A.items[x]);
	let next = get_next_player(Z, uplayer);
	let receiver = next;
	let giver = uplayer;
	let keys = items.map(x => x.key);
	fen.players[giver].commissions = arrMinus(fen.players[giver].commissions, keys);
	if (nundef(fen.comm_setup_di)) fen.comm_setup_di = {};
	fen.comm_setup_di[receiver] = keys;
}
function process_comm_setup() {

	let [fen, A, uplayer, plorder] = [Z.fen, Z.A, Z.uplayer, Z.plorder];

	//console.log('we are in stage ' + Z.stage);

	ari_transfer_commission_cards_to_di();

	if (is_commission_stage_complete(fen)) {
		//transfer cards from di to each player's commision cards
		for (const plname of plorder) {
			if (isdef(fen.comm_setup_di[plname])) {
				fen.players[plname].commissions = arrPlus(fen.players[plname].commissions, fen.comm_setup_di[plname]);
			}
		}

		// 
	}
}
function old_process_comm_setup(){
	if (is_setup_commissions_complete()) {
		for (const plname of plorder) {
			let pl = fen.players[plname];
			assertion(isdef(fen.comm_setup_di[plname]), 'no commission setup for ' + plname);
			pl.commissions = pl.commissions.concat(fen.comm_setup_di[plname]);
		}
		delete fen.comm_setup_di;
		delete fen.comm_setup_num;

		ari_history_list([`commission trading ends`], 'commissions');

		if (exp_rumors) { 
			[Z.stage, Z.turn] = [24, [plorder[0]]]; 
			ari_history_list([`gossiping starts`], 'rumors');
		
		}else { [Z.stage, Z.turn] = set_journey_or_stall_stage(fen, Z.options, fen.phase); }

	} else if (next == plorder[0]) {
		//next commission round starts
		for (const plname of plorder) {
			let pl = fen.players[plname];
			assertion(isdef(fen.comm_setup_di[plname]), 'no commission setup for ' + plname);
			pl.commissions = pl.commissions.concat(fen.comm_setup_di[plname]);
		}
		fen.comm_setup_num -= 1;
		Z.turn = [plorder[0]]
	} else {
		Z.turn = [next];
	}
	take_turn_fen();

}





//#region ack::: rem cons nach bluff check!!!!!!!!!!!!!
function start_simple_ack_round(ackstage, ack_players, nextplayer, callbackname_after_ack, keeppolling = false) {

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
function ack_player(plname) {
	let [fen, uplayer, pl] = [Z.fen, Z.uplayer, Z.fen.players[Z.uplayer]];

	//console.log('ack_player','plname',plname,'uplayer',uplayer,'pl',pl,'Z.turn',Z.turn,'Z.stage',Z.stage);
	assertion(sameList(Z.turn, [plname]), "ack_player: wrong turn");

	if (plname == fen.lastplayer || fen.players[uplayer].buy == true) {
		let func = window[fen.callbackname_after_ack];
		if (isdef(func)) func();
	} else {
		Z.turn = [get_next_in_list(plname, fen.ack_players)];
	}
	//console.log('ack_player','plname',plname,'uplayer',uplayer,'pl',pl,'Z.turn',Z.turn,'Z.stage',Z.stage);
	take_turn_fen();
}
function clear_ack_variables() {
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


function bluff_ack_uplayer() {
	let [A, fen, stage, uplayer] = [Z.A, Z.fen, Z.stage, Z.uplayer];
	fen.players[uplayer].ack = true;
	//DA.ack[uplayer] = true;
	ack_player(uplayer);
}

function new_cards_animation(n = 2) {
	let [stage, A, fen, plorder, uplayer, deck] = [Z.stage, Z.A, Z.fen, Z.plorder, Z.uplayer, Z.deck];
	let pl = fen.players[uplayer];
	if (stage == 'card_selection' && !isEmpty(Clientdata.newcards)) {
		let anim_elems = [];
		for (const key of Clientdata.newcards) {
			let ui = lastCond(UI.players[uplayer].hand.items, x => x.key == key);
			ui = iDiv(ui);
			anim_elems.push(ui);
		}
		delete Clientdata.newcards;
		anim_elems.map(x => mPulse(x, n * 1000));
	}
}

function new_cards_animation(n = 2) {
	let [stage, A, fen, plorder, uplayer, deck] = [Z.stage, Z.A, Z.fen, Z.plorder, Z.uplayer, Z.deck];
	let pl = fen.players[uplayer];
	if (stage == 'card_selection' && !isEmpty(pl.newcards)) {
		let anim_elems = [];

		//console.log('player', uplayer, 'newcards', jsCopy(pl.newcards));
		for (const key of pl.newcards) {
			let ui = lastCond(UI.players[uplayer].hand.items, x => x.key == key);
			ui = iDiv(ui);
			anim_elems.push(ui);
		}
		delete pl.newcards;
		//console.log('player', uplayer, 'newcards deleted:', pl.newcards);

		//animate newcards!
		anim_elems.map(x => mPulse(x, n * 1000));
		// setTimeout(ferro_pre_action,1000);
	}
}

function turn_send_move_update(action_star = false) {
	take_turn_fen(); 
}


//#region ferro multi zeug!

function ferro_start_buy_or_pass() {

	let fen = Z.fen;
	//fen.canbuy =, fen.trigger, fen.buyer, fen.nextturn (und playerdata natuerlich!)
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
function ferro_simple_ack_player(plname) {
	let [fen, uplayer, pl] = [Z.fen, Z.uplayer, Z.fen.players[Z.uplayer]];

	//console.log('ack_player','plname',plname,'uplayer',uplayer,'pl',pl,'Z.turn',Z.turn,'Z.stage',Z.stage);
	assertion(sameList(Z.turn, [plname]), "ack_player: wrong turn");

	if (plname == fen.lastplayer || fen.players[uplayer].buy == true) {
		let func = window[fen.callbackname_after_ack];
		if (isdef(func)) func();
	} else {
		Z.turn = [get_next_in_list(plname, fen.ack_players)];
	}
	//console.log('ack_player','plname',plname,'uplayer',uplayer,'pl',pl,'Z.turn',Z.turn,'Z.stage',Z.stage);
	take_turn_fen();
}
function ferro_clear_ack_variables() {
	let [fen, uplayer, pl] = [Z.fen, Z.uplayer, Z.fen.players[Z.uplayer]];
	delete fen.ack_players;
	delete fen.lastplayer;
	delete fen.nextplayer;
	delete fen.turn_after_ack;
	delete fen.ackstage;
	delete fen.callbackname_after_ack;
	delete fen.keeppolling;

}





function take_turn_lock_multi() { take_turn(true, false, true, 'lock'); }
function take_turn_end_multi() { take_turn(true, false, true); }



//#region take_turn old mit notes...

function take_turn_single() { take_turn(); }

function take_turn_spotit() { take_turn(true, true); }

function take_turn_init_multi(endcond = 'turn') { take_turn(true, false, false, `indiv_${endcond}`, true); }

function take_turn_lock_multi() { take_turn(true, false, true, 'lock'); }

function take_turn_multi_plus_lock() { take_turn(true, true, false, 'lock'); }

function take_turn_end_multi() { take_turn(true, false, false, '', true); }

function take_turn_multi() { if (isdef(Z.state)) take_turn(false, true); else take_turn(false, false, true); }


function take_turn(write_fen = true, write_player = false, read_players = false, write_notes = null, clear_players = false) {
	prep_move();
	let o = { uname: Z.uplayer, friendly: Z.friendly };
	if (isdef(Z.fen)) o.fen = Z.fen;
	if (write_fen) o.write_fen = true;
	if (isdef(write_notes)) { o.write_notes = write_notes; } //console.log('JA');}
	if (write_player) { o.write_player = true; o.state = Z.state; }
	if (read_players) o.read_players = true;
	if (clear_players) o.clear_players = true;

	//console.log('sending', o);
	let cmd = 'table';
	send_or_sim(o, cmd);
}

function prep_move() {
	let [fen, uplayer, pl] = [Z.fen, Z.uplayer, Z.pl];
	for (const k of ['round', 'phase', 'stage', 'step', 'turn']) { fen[k] = Z[k]; }
	deactivate_ui();
	clear_timeouts();
}
function send_or_sim(o, cmd) {
	Counter.server += 1;
	if (nundef(Z) || is_multi_stage()) o.read_players = true;
	if (DA.simulate) phpPostSimulate(o, cmd); else phpPost(o, cmd);
}

//#endregion

function sendmove(plname, friendly, fen, action, expected, phase, round, step, stage, notes, scoring = {}) {
	deactivate_ui();
	clear_timeouts();

	let o = { uname: plname, friendly: friendly, fen: fen, action: action, expected: expected, phase: phase, round: round, step: step, stage: stage, notes: notes, scoring: scoring };
	//console.log('sendmove: turn',fen.turn)

	//console.log(`sendmove: simulated: ${DA.simulate}`);
	if (DA.simulate) phpPostSimulate(o, 'move'); else phpPost(o, 'move');
}

function turn_send_move_update(action_star = false) {
	take_turn_single(); return;
	let [fen, uplayer] = [Z.fen, Z.uplayer];	//console.log('sending move:Z',Z); //return;

	//console.log('uplayer', uplayer, 'action_star', action_star);

	[fen.stage, fen.phase, fen.turn] = [Z.stage, Z.phase, Z.turn];

	//ACHTUNG!!!!
	assertion(!isEmpty(fen.turn), 'ACHTUNG!!!!!!!!!!! TURN IST EMPTY in take_turn_single!!!!!!!!!!!!!', Z.turn);
	//if (isEmpty(fen.turn)) { fen.turn = Z.turn = [Z.host]; console.log('SETTING HOST TURN BECAUSE TURN EMPTY AT SEND!!!!!!!') }

	let action = action_star ? { stage: '*', step: '*' } : Z.expected[uplayer];
	let expected = {}; fen.turn.map(x => expected[x] = { stage: fen.stage, step: Z.step });
	//console.log(':::take_turn_single: action', action, 'expected', expected, 'Z.step', Z.step, 'Z.turn', Z.turn);

	//console.log('in',getFunctionsNameThatCalledThisFunction(),'fen.turn', fen.turn);
	sendmove(Z.uplayer, Z.friendly, Z.fen, action, expected, Z.phase, Z.round, Z.step, Z.stage, Z.notes, Z.scoring);
}


function spotit_clear_score() {
	assertion(isdef(Z.notes), 'Z.notes not defined');
	Z.notes = {};
	//ensure_score();
	//for (const plname in Z.fen.players) { Z.notes[plname].score = 0; }
}
function _spotit_move(uplayer, success) {
	//console.log('g',g,'uname',uname,'success',success)
	if (success) {
		//console.log('success!',jsCopy(g.expected));
		inc_player_score(uplayer);
		Z.action = { stage: 'move', step: Z.options.zen_mode == 'yes' ? '*' : Z.step };
		for (const plname in Z.expected) { Z.expected[plname].step += 1 }
		Z.step += 1; Z.round += 1;
		//console.log('sending',jsCopy(g.expected));
		Z.fen.items = spotit_item_fen(Z.options);
		//Clientdata.iwin = true;
		sendmove(uplayer, Z.friendly, Z.fen, Z.action, Z.expected, Z.phase, Z.round, Z.step, Z.stage, Z.notes)
	} else {
		let d = mShield(dTable, { bg: '#000000aa', fg: 'red', fz: 60, align: 'center' });
		d.innerHTML = 'NOPE!!! try again!';
		TO.spotit_penalty = setTimeout(() => d.remove(), 2000);
	}
}


function ferro_ack_uplayer_lean() {
	let [A, uplayer] = [Z.A, Z.uplayer];
	stopPolling();
	let o_pldata = Z.playerdata.find(x => x.name == uplayer);
	Z.state = o_pldata.state = { buy: !isEmpty(A.selected) && A.selected[0] == 0 };
	let can_resolve = ferro_check_resolve();
	if (can_resolve) {
		assertion(Z.stage == 'buy_or_pass', 'stage is not buy_or_pass when checking can_resolve!');
		Z.stage = 'can_resolve';
		[Z.turn, Z.stage] = [[get_multi_trigger()], 'can_resolve'];
		take_turn_multi_plus_lock();
	} else { take_turn_multi(); }
}

function ferro_ack_uplayer() {
	let [A, fen, stage, uplayer] = [Z.A, Z.fen, Z.stage, Z.uplayer];
	//console.log('A.selected', A.selected)

	stopPolling();

	// update Z.playerstate (fuer resolve check!) and set Z.state
	let o_pldata = Z.playerdata.find(x => x.name == uplayer);
	Z.state = o_pldata.state = { buy: !isEmpty(A.selected) && A.selected[0] == 0 };

	//console.log('====>ack_player:playerdata', Z.playerdata);

	//NEIN!FORCE_REDRAW = true; //brauch ich damit ui fuer diesen player weggeht

	//console.log('<===write_player', uplayer, Z.state);

	//hier muss ich checken ob eh schon genug info habe fuer can_resolve!
	let can_resolve = ferro_check_resolve();
	//console.log('===>can_resolve', can_resolve);
	if (can_resolve) {
		assertion(Z.stage == 'buy_or_pass', 'stage is not buy_or_pass when checking can_resolve!');
		//console.log('====>buyer found!', fen.buyer);
		Z.stage = 'can_resolve';
		[Z.turn, Z.stage] = [[get_multi_trigger()], 'can_resolve'];
		take_turn_multi_plus_lock();
	} else {
		// if (Z.mode == 'hotseat') {
		// 	let next = get_next_in_list(fen.canbuy, uplayer);
		// 	assertion(next != fen.canbuy[0], 'sollte schon laengst can_resolve sein!!!!!!!!!!!!!!!!!')
		// 	Z.turn = [next];
		// }
		take_turn_multi();
	}
	//Z.func.state_info(mBy('dTitleLeft')); //rem cons
}


function handle_result(result, cmd) {

	//if (cmd == 'table') {console.log('result', result); } //return;}

	if (verbose) console.log('cmd', cmd, '\nresult', result); //return;
	if (result.trim() == "") return;
	let obj;
	try { obj = JSON.parse(result); } catch { console.log('ERROR:', result); }

	if (verbose) console.log('HANDLERESULT bekommt', jsCopy(obj));
	processServerdata(obj, cmd);

	// console.log('obj.fen', obj.fen,'obj.turn', obj.turn, 'obj.a', obj.a, 'obj.b', obj.b);
	//console.log('obj.fen', obj.fen,'obj.turn', obj.turn, 'obj.a', obj.a, 'obj.b', obj.b);

	switch (cmd) {
		case "assets": load_assets(obj); start_with_assets(); break;
		case "users": show_users(); break;
		case "tables": show_tables(); break;
		case "delete_table":
		case "delete_tables": show_tables(); break;
		//************************* table *************************** */
		case "gameover":
		//case "clear":
		case "table":
		case "startgame":
			update_table();

			//console.log('===>turn', Z.turn);
			// console.log(`_________ ${Counter.server} apiserver cmd`,cmd,Z.turn);
			// console.log('<===request', obj.status);
			// console.log('===>stage', Z.stage);
			// console.log('===>notes', Z.notes);
			// console.log('===>fen.multi', Z.fen.multi); //return;
			// console.log('===>playerdata', Z.playerdata); //return;

			//handle multi stage
			if (is_multi_stage()) {
				//check if is already in can_resolve stage
				if (Z.stage == 'can_resolve') {
					//trigger soll jetzt mal manually ACK clicken
					//console.log('triggering manual ACK to resolve');
					if (is_multi_trigger(Z.uplayer)) {
						//for now do NOT goto gamestep but just show Clear Ack button
						show('bClearAck');
						Z.func.state_info(mBy('dTitleLeft'));
						return;
					}
				}

				assertion(Z.stage != 'can_resolve', "WTF!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");	//I am NOT in can_resolve stage yet!!!!

				//check if can be resolved
				let can_resolve = Z.func.check_resolve();
				if (can_resolve) {
					[Z.turn, Z.stage] = [[get_multi_trigger()], 'can_resolve'];
					Z.func.state_info(mBy('dTitleLeft'));
					take_turn_lock_multi();
					//return;
				} else if (is_multi_trigger()) {
					//update turn to only those players with empty playerdata
				}
			}

			if (Z.skip_presentation) { Z.func.state_info(mBy('dTitleLeft')); autopoll(); return; }
			console.log('===>turn', Z.turn);
			clear_timeouts();
			gamestep();
			break;

	}
}

// ferro vor change of clear_ack
function clear_ack() {
	if (Z.stage == 'buy_or_pass') {
		//ferro_change_to_turn_round();
		if (isList(Z.playerdata) && lookup(Z.fen, ['multi', 'trigger']) == Z.uplayer) ferro_force_resolve(true);
		else {
			ferro_change_to_card_selection();
			prep_move();
			let o = { uname: Z.uplayer, friendly: Z.friendly, fen: Z.fen, write_fen: true, write_notes: '' };
			let cmd = 'table';
			send_or_sim(o, cmd);

		}
	}
	else if (Z.stage == 'round_end') start_new_round_ferro();
}

function ferro() {
	function clear_ack() {
		if (Z.stage == 'buy_or_pass') {
			//ferro_change_to_turn_round();
			if (isList(Z.playerdata) && lookup(Z.fen, ['multi', 'trigger']) == Z.uplayer) ferro_force_resolve(true);
			else {
				ferro_change_to_card_selection();
				prep_move();
				let o = { uname: Z.uplayer, friendly: Z.friendly, fen: Z.fen, write_fen: true, write_notes: '' };
				let cmd = 'table';
				send_or_sim(o, cmd);

			}
		}
		else if (Z.stage == 'round_end') start_new_round_ferro();
	}
	function state_info(dParent) { ferro_state_new(dParent); }
	function setup(players, options) {
		let fen = { players: {}, plorder: jsCopy(players), history: [] };

		//calc how many decks are needed (basically 1 suit per person, plus 1 for the deck)
		let n = players.length;
		let num_decks = fen.num_decks = 2 + (n >= 9 ? 2 : n >= 7 ? 1 : 0); // 2 + (n > 5 ? Math.ceil((n - 5) / 2) : 0); //<=5?2:Math.max(2,Math.ceil(players.length/3));
		//console.log('num_decks', num_decks);
		let deck = fen.deck = create_fen_deck('n', num_decks, 4 * num_decks);
		let deck_discard = fen.deck_discard = [];
		shuffle(deck);
		if (DA.TEST0 != true) shuffle(fen.plorder);
		let starter = fen.plorder[0];
		//console.log('options', options);
		let handsize = valf(Number(options.handsize), 11);
		for (const plname of players) {
			let pl = fen.players[plname] = {
				hand: deck_deal(deck, plname == starter ? handsize + 1 : handsize),
				journeys: [],
				coins: 10,
				vps: 0,
				score: 0,
				name: plname,
				color: get_user_color(plname),
			};
			pl.goals = { 3: 0, 33: 0, 4: 0, 44: 0, 5: 0, 55: 0, '7R': 0 };

			if (plname == starter) {
				pl.hand = ['AHn', 'AHn', 'AHn', 'AHn'];
			}
			//for(const goal of Config.games.ferro.options.goals) pl.goals[goal]=0;
		}
		fen.phase = ''; //TODO: king !!!!!!!
		[fen.stage, fen.turn] = ['card_selection', [starter]];
		return fen;
	}
	function present(z, dParent, uplayer) { ferro_present_new(z, dParent, uplayer); }
	function present_player(g, plname, d, ishidden = false) { ferro_present_player_new(g, plname, d, ishidden = false) }
	function check_gameover() { return isdef(Z.fen.winners) ? Z.fen.winners : false; }
	function stats(Z, dParent) { ferro_stats_new(dParent); }
	function activate_ui() { ferro_activate_ui(); }
	function check_resolve() { return ferro_check_resolve(); }
	function resolve() { ferro_resolve(); }
	return { check_resolve, resolve, clear_ack, state_info, setup, present, present_player, check_gameover, stats, activate_ui };
}

function playerstate_check() {
	//returns true if automessage has been sent by trigger
	//this function sends a write_fen message and return true if playerdata can be resolved!
	//otherwise returns false (will result in Z.skip_presentation if not resolve)

	//is this a turn that collects individual playerdata?
	//how to handle spotit this time?
	let trigger = lookup(Z, ['fen', 'multi', 'trigger']);
	if (!trigger) return false;
	let [uplayer, fen, stage, pldata] = [Z.uplayer, Z.fen, Z.stage, Z.playerdata];

	//case1: stage != can_resolve
	if (stage != 'can_resolve') {
		let can_resolve = Z.func.check_resolve();
		if (can_resolve) {
			[Z.turn, Z.stage] = [[trigger], 'can_resolve'];
			take_turn_lock_multi();
			return true;
		} else return false;
	} else if (uplayer == trigger) {
		//case2: uplayer == trigger
		//das ist der der resolven koennte! NUR trigger kann fen aendern!!!!!!
		//es wird resolved!
		Z.func.resolve();
		// console.log('buy process done ... resolving');
		// ferro_change_to_card_selection(); //das soll durch resolve ersetzt werden
		// prep_move();
		// let o = { uname: Z.uplayer, friendly: Z.friendly, fen: Z.fen, write_fen: true, write_notes: '' };
		// let cmd = 'table';
		// send_or_sim(o, cmd);

		return true;
	} else return false;

}


//#region ferro last version vor standard take_turn!
function ferro_change_to_buy_pass() {
	let [plorder, stage, A, fen, uplayer] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer];
	let nextplayer = get_next_player(Z, uplayer); //player after buy_or_pass round

	//newturn is list of players starting with nextplayer
	let newturn = jsCopy(plorder); while (newturn[0] != nextplayer) { newturn = arrCycle(newturn, 1); } //console.log('newturn', newturn);
	let buyerlist = fen.canbuy = []; //fen.canbuy list ist angeordnet nach reihenfolge der frage
	for (const plname of newturn) {
		let pl = fen.players[plname];
		if (plname != uplayer && pl.coins > 0) { pl.buy = false; buyerlist.push(plname); }
		//if (plname == uplayer) { pl.buy = false; buyerlist.push(plname); } else if (pl.coins > 0) { pl.buy = false; buyerlist.push(plname); }
	}


	fen.multi = {
		//turn: buyerlist,
		//stage: 'buy_or_pass',
		trigger: uplayer,  //Z.host, //uplayer, host geht nicht weil der ja dann nicht buy or pass kann!!!
		endcond: 'turn',
		turn_after_ack: [nextplayer],
		callbackname_after_ack: 'ferro_change_to_card_selection',
		next_stage: 'card_selection',

	};
	[Z.stage, Z.turn] = ['buy_or_pass', buyerlist];
	console.log('sending turn', Z.turn);
	//take_turn_init_multi('turn');
	prep_move();
	let o = { uname: Z.uplayer, friendly: Z.friendly, clear_players: buyerlist, write_notes: 'indiv_turn', fen: Z.fen, write_fen: true };
	//console.log('sending to server', o);
	let cmd = 'table';
	send_or_sim(o, cmd);

	//log_object(fen, 'buyers', 'nextplayer canbuy');

	//start_indiv_ack_round('buy_or_pass', buyerlist, nextplayer, 'ferro_change_to_turn_round');

}
function ferro_ack_uplayer() {
	let [A, fen, stage, uplayer] = [Z.A, Z.fen, Z.stage, Z.uplayer];
	//console.log('A.selected', A.selected)
	Z.state = { buy: !isEmpty(A.selected) && A.selected[0] == 0 };
	//Z.state = Clientdata.playerstate = { buy: !isEmpty(A.selected) && A.selected[0] == 0 };
	//Clientdata._playerdata_set = true;
	FORCE_REDRAW = true;

	console.log('<===write_player', uplayer, Z.state)
	prep_move();
	let o = { uname: Z.uplayer, friendly: Z.friendly, fen: Z.fen, state: Z.state, write_player: true };
	let cmd = 'table';
	send_or_sim(o, cmd);
}
function ferro_change_to_card_selection() {
	//console.log('ferro_change_to_turn_round_', getFunctionsNameThatCalledThisFunction()); 
	let [z, fen, stage, uplayer, ui] = [Z, Z.fen, Z.stage, Z.uplayer, UI];
	assertion(stage != 'card_selection', "ALREADY IN TURN ROUND!!!!!!!!!!!!!!!!!!!!!!");

	for (const plname of fen.canbuy) {
		let pl = fen.players[plname];
		if (pl.buy == true) {
			let card = fen.deck_discard.shift();
			pl.hand.push(card);
			deck_deal_safe_ferro(fen, plname, 1);
			pl.coins -= 1; //pay
			ari_history_list([`${plname} bought ${card}`], 'buy');
			break;
		}
	}
	let nextplayer = fen.multi.turn_after_ack[0];
	deck_deal_safe_ferro(fen, nextplayer, 1); //nextplayer draws

	//console.log('multi',fen.multi);
	Z.turn = fen.multi.turn_after_ack;
	Z.stage = 'card_selection';

	clear_ack_variables();
	delete fen.multi;

	for (const k of ['canbuy']) delete fen[k];
	for (const plname of fen.plorder) { delete fen.players[plname].buy; }
	clear_transaction();
}
function ferro_check_resolve() {
	let [pldata, stage, A, fen, plorder, uplayer, deck, turn] = [Z.playerdata, Z.stage, Z.A, Z.fen, Z.plorder, Z.uplayer, Z.deck, Z.turn];
	let pl = fen.players[uplayer];

	if (stage != 'buy_or_pass') return false;
	for (const plname of turn) {
		let data = firstCond(pldata, x => x.name == plname);
		assertion(isdef(data), 'no pldata for', plname);
		let state = data.state;

		console.log('state', plname, state);
		if (isEmpty(state)) done = false;
		else if (state.buy == true) buyer = plname;
		else continue;

		break;
	}
	return done;
}
function ferro_resolve() {
	console.log('buy process done, buyer', buyer);
	ferro_change_to_card_selection();
	prep_move();
	let o = { uname: Z.uplayer, friendly: Z.friendly, fen: Z.fen, write_fen: true, write_notes: '' };
	let cmd = 'table';
	send_or_sim(o, cmd);
}
//#endregion ===========================

function take_turn_spotit() {
	prep_move();
	let o = { uname: Z.uplayer, friendly: Z.friendly, fen: Z.fen, state: Z.state, write_player: true, write_fen: true };
	let cmd = 'table';
	send_or_sim(o, cmd);
}

function query_status() {
	prep_move();
	let o = { uname: Z.uname, friendly: Z.friendly };
	let cmd = 'collect_status';
	send_or_sim(o, cmd);
}

function trigger_check_is_sending(trigger) {
	//this function seends a write_fen message and return true if playerdata can be resolved!
	//otherwise returns false (will result in Z.skip_presentation if not resolve)

	if (!trigger) return false;
	let [uplayer, fen, stage, pldata] = [Z.uplayer, Z.fen, Z.stage, Z.playerdata];

	//case1: stage != can_resolve
	if (stage != 'can_resolve') {
		let can_resolve = Z.func.check_resolve();
		if (can_resolve) {
			[Z.turn, Z.stage] = [[trigger], 'can_resolve'];
			prep_move();
			let o = { uname: Z.uplayer, friendly: Z.friendly, fen: Z.fen, write_fen: true, write_notes: 'lock' };
			let cmd = 'table';
			send_or_sim(o, cmd);

			return true;
		} else return false;
	} else if (uplayer == trigger) {
		//case2: uplayer == trigger
		//das ist der der resolven koennte! NUR trigger kann fen aendern!!!!!!
		//es wird resolved!
		Z.func.resolve();
		// console.log('buy process done ... resolving');
		// ferro_change_to_card_selection(); //das soll durch resolve ersetzt werden
		// prep_move();
		// let o = { uname: Z.uplayer, friendly: Z.friendly, fen: Z.fen, write_fen: true, write_notes: '' };
		// let cmd = 'table';
		// send_or_sim(o, cmd);

		return true;
	} else return false;

}

function check_collect(obj) {
	//erwarte dass obj ein collect_complete und ein too_late hat!
	//console.log('notes', Z.notes)
	if (nundef(obj.collect_complete)) return false;
	if (Z.mode != 'multi') { console.log('COLLECT NUR IN MULTI PLAYER MODE!!!!!!'); return false; }
	if (!startsWith(Z.notes, 'indiv') && Z.notes != 'lock') { return false; } //console.log('!!!notes is NOT indiv or lock'); return false; }
	assertion(isdef(obj.playerdata), 'no playerdata but collect_complete');

	let collect_complete = obj.collect_complete;
	let too_late = obj.too_late;
	//console.log('notes', Z.notes)
	//console.log('collect_open', collect_complete, 'too_late', too_late);

	if (i_am_acting_host() && collect_complete) {

		//console.log('collect_open: i am host, collect_complete, was nun???');
		assertion(obj.table.fen.turn.length == 1 && obj.table.fen.turn[0] == U.name && U.name == obj.table.fen.acting_host, 'collect_open: acting host is NOT the one in turn!');
		assertion(isdef(Z.func.post_collect), 'post_collect not defined for game ' + obj.table.game);

		//Z.playerdata = obj.playerdata;
		//console.log('playerdata vorher', Z.playerdata);
		if (Z.fen.end_cond == 'all') for (const p of Z.playerdata) { p.state = JSON.parse(p.state); }
		else if (Z.fen.end_cond == 'first') {
			for (const p of Z.playerdata) {
				if (isdef(p.state)) {
					p.state = JSON.parse(p.state);
					//console.log('*** winning player is', p.name, p.state);
				}

			}
			//console.log('playerdata nachher', Z.playerdata);
		}
		Z.func.post_collect();


	} else if (collect_complete && (Z.turn.length > 1 || Z.turn[0] != Z.fen.acting_host)) {
		Z.turn = [Z.fen.acting_host];
		take_turn_single();
		//console.log('collect_open: collect_complete, bin aber nicht der host! was nun???');

	} else if (i_am_acting_host()) {
		//console.log('collect_open: i am host, bin aber nicht collect_complete, was nun???');
		//autopoll();
		return false;

	} else {
		//console.log('collect_open: bin nicht der host, bin nicht collect_complete, was nun???');
		//autopoll();
		return false;

	}
	return true;

}

function MUELL() {
	if (Z.stage == 'can_resolve') {
		assertion(trigger, 'no trigger and can_resolve!!!');
	}

	//first check if resolve condition is met!
	let resolve = Z.func.check_resolve();

	if (Z.stage == 'can_resolve' && uplayer == trigger) {
		//das ist der der resolven koennte! NUR trigger kann fen aendern!!!!!!
		//es wird resolved!
	} else if (resolve) {
		[Z.turn, Z.stage] = [[trigger], 'can_resolve'];

	} else return false;

	//das ist nur prototyping!!!!!!!!!!!!!!!!!
	if (Z.game == 'ferro' && Z.stage == 'buy_or_pass') {
		let [pldata, multi, turn, done, buyer] = [Z.playerdata, Z.fen.multi, Z.turn, true, null];
		console.log(':::trigger check!', turn);
		//console.log('..............pldata', pldata);

		for (const plname of turn) {
			let data = firstCond(Z.playerdata, x => x.name == plname);
			assertion(isdef(data), 'no pldata for', plname);
			let state = data.state;

			console.log('state', plname, state);
			if (isEmpty(state)) done = false;
			else if (state.buy == true) buyer = plname;
			else continue;

			break;
		}
		if (done) {
			console.log('buy process done, buyer', buyer);
			ferro_change_to_card_selection();
			prep_move();
			let o = { uname: Z.uplayer, friendly: Z.friendly, fen: Z.fen, write_fen: true, write_notes: '' };
			let cmd = 'table';
			send_or_sim(o, cmd);

			return true;
		}
	}
	return false;

}

function ferro_force_resolve(by_ack_button = false) {
	assertion(isdef(Z.playerdata) || by_ack_button, 'no playerdata in force_resolve by trigger!!!!');
	// for(const data of Z.playerdata){
	// 	let pl = fen.players[data.name];
	// 	if (isEmpty(data.state)) pl.buy = false; else	pl.buy = data.state.buy;
	// }
	ferro_call_resolve();

}
function ferro_call_resolve() {
	//expects a function fen.multi.callbackname_after_ack

	assertion(Z.stage == 'buy_or_pass', 'no buy_or_pass in call_resolve');

	let [fen, stage, uplayer] = [Z.fen, Z.stage, Z.uplayer];
	let callbackname = fen.multi.callbackname_after_ack;
	// console.log('===>RESOLVE',Z.uplayer); 
	// console.log('fen.multi', fen.multi); //return;

	for (const data of Z.playerdata) {
		let pl = fen.players[data.name];
		if (isEmpty(data.state)) pl.buy = false; else pl.buy = data.state.buy;
	}

	if (isdef(callbackname)) {
		let f = window[callbackname];
		if (isdef(f)) {
			f();
		}
	}
	prep_move();
	let o = { uname: Z.uplayer, friendly: Z.friendly, fen: Z.fen, write_fen: true, write_notes: '' };
	let cmd = 'table';
	send_or_sim(o, cmd);
}
function ferro_clear_playerdata() { if (isdef(Clientdata._playerdata_set)) { delete Clientdata._playerdata_set; } }

function ferro_handle_buy_or_pass() {
	let [fen, stage, uplayer] = [Z.fen, Z.stage, Z.uplayer];
	// if (uplayer == fen.multi.trigger) {
	// 	//hier muss der trigger checken fuer early break up von buy_or_pass
	// 	console.log('HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHAAAAAAAAAAAAALLLLLLLLLLLLOOOOOOOOOOOOO')
	// 	let pldata = Z.playerdata;
	// 	console.log('..............pldata', pldata);
	// }else	
	if (uplayer == lookup(fen, ['multi', 'trigger'])) {
		//select_timer(6000, ferro_force_resolve);
	} else if (nundef(Clientdata.playerdata_set)) {
		select_add_items(ui_get_buy_or_pass_items(), ferro_ack_uplayer, 'may click top discard to buy or pass', 1, 1);
		//select_timer(5000, ferro_ack_uplayer);
	}
}



//#region ferro ack NEW!
function ferro_change_to_ack_round() {
	let [plorder, stage, A, fen, uplayer] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer];
	let nextplayer = get_next_player(Z, uplayer); //player after buy_or_pass round

	//newturn is list of players starting with nextplayer
	let newturn = jsCopy(plorder); while (newturn[0] != nextplayer) { newturn = arrCycle(newturn, 1); } //console.log('newturn', newturn);
	let buyerlist = fen.canbuy = []; //fen.canbuy list ist angeordnet nach reihenfolge der frage
	for (const plname of newturn) {
		let pl = fen.players[plname];
		if (plname == uplayer) { pl.buy = false; continue; }
		else if (pl.coins > 0) { pl.buy = false; buyerlist.push(plname); }
	}
	//log_object(fen, 'buyers', 'nextplayer canbuy');

	start_simple_ack_round('buy_or_pass', buyerlist, nextplayer, 'ferro_change_to_turn_round');
}
function ferro_change_to_turn_round() {
	//console.log('ferro_change_to_turn_round_', getFunctionsNameThatCalledThisFunction()); 
	let [z, A, fen, stage, uplayer, ui] = [Z, Z.A, Z.fen, Z.stage, Z.uplayer, UI];
	assertion(stage != 'card_selection', "ALREADY IN TURN ROUND!!!!!!!!!!!!!!!!!!!!!!");

	for (const plname of fen.canbuy) {
		let pl = fen.players[plname];
		if (pl.buy == true) {
			let card = fen.deck_discard.shift();
			pl.hand.push(card);
			deck_deal_safe_ferro(fen, plname, 1);
			pl.coins -= 1; //pay
			ari_history_list([`${plname} bought ${card}`], 'buy');
			break;
		}
	}
	deck_deal_safe_ferro(fen, fen.nextplayer, 1); //nextplayer draws

	console.log('multi', fen.multi);
	Z.turn = fen.multi.turn_after_ack;
	Z.stage = 'card_selection';

	clear_ack_variables();
	for (const k of ['canbuy']) delete fen[k];
	for (const plname of fen.plorder) { delete fen.players[plname].buy; }
	clear_transaction();
}
function _ferro_ack_uplayer() {
	let [A, fen, stage, uplayer] = [Z.A, Z.fen, Z.stage, Z.uplayer];
	fen.players[uplayer].buy = A.selected[0] == 0;

	ack_player(uplayer);
}

//#endregion


function start_indiv_ack_round(ackstage, ack_players, nextplayer, callbackname_after_ack) {

	let fen = Z.fen;
	//each player except uplayer will get opportunity to buy top discard - nextplayer will draw if passing
	fen.acting_host = Z.uplayer;
	fen.ack_players = ack_players;
	fen.lastplayer = arrLast(ack_players);
	fen.nextplayer = nextplayer; //next player after ack!
	fen.turn_after_ack = [nextplayer];
	fen.callbackname_after_ack = callbackname_after_ack;

	Z.stage = ackstage;
	Z.turn = jsCopy(ack_players);

}

function old_ensure_buttons_visible_ferro() {
	if (isdef(mBy('dbPlayer'))) return;
	let [plorder, stage, A, fen, uplayer, pl] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer, Z.fen.players[Z.uplayer]];
	if (fen.players[uplayer].hand.length <= 1) return; // only display for hand size > 1
	let d = iDiv(UI.players[uplayer]);
	mStyle(d, { position: 'relative' })
	//console.log('d', d);
	let dbPlayer = mDiv(d, { position: 'absolute', bottom: 2, left: 100, height: 25 }, 'dbPlayer');
	let styles = { rounding: 6, bg: 'silver', fg: 'black', border: 0, maleft: 10 };
	let bByRank = mButton('by rank', onclick_by_rank_ferro, dbPlayer, styles, 'enabled');
	let bBySuit = mButton('by suit', onclick_by_suit_ferro, dbPlayer, styles, 'enabled');
	if (Z.game == 'ferro') {
		let b = mButton('clear selection', onclick_clear_selection_ferro, dbPlayer, styles, 'enabled', 'bClearSelection'); //isEmpty(A.selected)?'disabled':'enabled');
		if (isEmpty(A.selected)) hide(b);
	}

}

function handle_result(result, cmd) {
	//if (verbose) console.log('cmd', cmd, '\nresult', result); //return;
	if (result.trim() == "") return;
	let obj;
	try { obj = JSON.parse(result); } catch { console.log('ERROR:', result); }

	if (verbose) console.log('HANDLERESULT bekommt', jsCopy(obj));
	processServerdata(obj, cmd);

	switch (cmd) {
		case "assets": load_assets(obj); start_with_assets(); break;
		case "users": show_users(); break;
		case "tables": show_tables(); break;
		case "delete_table":
		case "delete_tables": show_tables(); break;
		case "collect_status":
			//console.log('collect_status', obj);
			//update_playerdata(obj);
			update_table();
			//console.log('Z.stage', Z.stage);
			if (!is_collect_mode()) {
				show_status(`waiting for ${Z.turn.join(', ')}`);

			} else if (obj.collect_complete == false) {
				let pls = obj.playerstates;
				let waiting_for = [];
				for (const val of pls) {
					let state = !isEmpty(val.state) ? JSON.parse(val.state) : null;
					//console.log('val', val, 'state', state);
					if (isEmpty(state)) { waiting_for.push(val.name); }
				}
				show_status(`waiting for ${waiting_for.join(', ')}`);
			} else { show_status('COMPLETE!'); }
			break;

		case "collect_open":
			//erwarte dass obj ein collect_complete und ein too_late hat!
			let collect_complete = obj.collect_complete;
			let too_late = obj.too_late;
			console.log('collect_open', collect_complete, 'too_late', too_late);

			if (Z.mode != 'multi') { console.log('COLLECT NUR IN MULTI PLAYER MODE!!!!!!'); return; }

			//do I have obj.table?
			if (isdef(obj.table)) {
				let me = U.name; //console.log('me', me);
				//console.log('obj.table', obj.table); // table ist eh schon unpacked! war ja in processServerdata!!!!!!!
				let fen = obj.table.fen;
				let turn = fen.turn;
				console.log('me', me, 'turn', turn);
			}
			if (isdef(obj.playerdata)) {
				let playerdata = obj.playerdata;
				console.log('playerdata', playerdata);
			} else {
				console.log('playerdata nicht da');
			}


			if (i_am_acting_host() && collect_complete) {

				console.log('collect_open: i am host, collect_complete, was nun???');

				assertion(obj.table.fen.turn.length == 1 && obj.table.fen.turn[0] == U.name && U.name == obj.table.fen.acting_host, 'collect_open: acting host is NOT the one in turn!');
				//integrate all player indiv moves into fen
				let fen = obj.table.fen;
				//console.log('YES!')

				update_table(); pollStop();
				assertion(isdef(Z.func.post_collect), 'post_collect not defined for game ' + obj.table.game);
				console.log('playerdata', Z.playerdata)
				for (const p of Z.playerdata) {
					p.state = JSON.parse(p.state);
				}
				console.log('playerdata', Z.playerdata)
				Z.func.post_collect();
				return;


			} else if (collect_complete) {
				console.log('collect_open: collect_complete, bin aber nicht der host! was nun???');

			} else if (i_am_acting_host()) {
				console.log('collect_open: i am host, bin aber nicht collect_complete, was nun???');

			} else {
				console.log('collect_open: bin nicht der host, bin nicht collect_complete, was nun???');

			}
			autopoll();
			// if (collect_complete) {
			// 	update_table();
			// 	autopoll();
			// 	// if (Z.skip_presentation) {
			// 	// 	console.log('presentation is skipped!!!')
			// 	// 	return;
			// 	// }
			// 	// // //console.log('obj has keys', Object.keys(obj));
			// 	// // for (const k in obj) {
			// 	// // 	if (['table', 'tables', 'users'].includes(k)) continue;
			// 	// // 	//console.log('k', k, typeof obj[k], obj[k]);
			// 	// // }
			// 	// gamestep();
			// }				//for (const k in obj) { console.log('k', k, typeof obj[k], obj[k]); }
			break;

		case "gameover":
		case "clear":
		case "table":
		case "startgame":
			update_table();
			let is_collect = check_collect(obj);

			if (is_collect) { pollStop(); console.log('WAS NUN?????'); return; }

			if (Z.skip_presentation) { pollStop(); console.log('not presenting!'); return; }

			console.log('WILL PRESENT! obj has keys', Object.keys(obj));
			//for (const k in obj) { if (['table', 'tables', 'users'].includes(k)) continue; console.log('k', k, typeof obj[k], obj[k]); }

			gamestep(); break;

		// case "table":
		// case "startgame":

		// 	//console.log('Serverdata', Serverdata);
		// 	update_table(); 
		// 	//console.log('will present',!Z.skip_presentation);
		// 	if (!Z.skip_presentation) {
		// 		let [fen,uname,role,uplayer,playmode]=[Z.fen,Z.uname,Z.role,Z.uplayer,Z.playmode]
		// 		console.log('______present',Z.friendly, fen.turn);
		// 		console.log('uname',uname,role);
		// 		console.log('uplayer',uplayer,playmode);
		// 	}else{console.log('not presenting');}
		// 	break; // console.log('Z', Z); //if (!Z.skip_presentation) gamestep(); break;
	}
}
function _show_history(fen, dParent) {
	if (!isEmpty(fen.history)) {
		let html = '';
		for (const arr of jsCopy(fen.history).reverse()) {
			html += arr;//html+=`<h1>${k}</h1>`;
			//for (const line of arr) { html += `<p>${line}</p>`; }
		}
		// let dHistory =  mDiv(dParent, { padding: 6, margin: 4, bg: '#ffffff80', fg: 'black', hmax: 400, 'overflow-y': 'auto', wmin: 240, rounding: 12 }, null, html); //JSON.stringify(fen.history));
		let dHistory = mDiv(dParent, { paleft: 12, bg: colorLight('#EDC690', .5), box: true, matop: 10, patop: 10, w: '100%', hmax: `calc( 100vh - 250px )`, 'overflow-y': 'auto', wmin: 260 }, null, html); //JSON.stringify(fen.history));
		// let dHistory =  mDiv(dParent, { padding: 6, margin: 4, bg: '#ffffff80', fg: 'black', hmax: 400, 'overflow-y': 'auto', wmin: 240, rounding: 12 }, null, html); //JSON.stringify(fen.history));
		//mNode(fen.history, dHistory, 'history');
		UI.dHistoryParent = dParent;
		UI.dHistory = dHistory;
		console.log('dHistory', dHistory);
	}

}

//#region ferro ausmisten
function matches_on_either_end_new(key, j, rankstr = 'A23456789TJQKA') {
	let jfirst = arrFirst(j.o.list);
	let jlast = arrLast(j.o.list);
	for (let i = 0; i < rankstr.length - 1; i++) { let r = rankstr[i]; if (jfirst[0] == rankstr[i + 1]) return true; }
	for (let i = rankstr.length - 1; i > 0; i--) { let r = rankstr[i]; if (jlast[0] == rankstr[i - 1]) return true; }
	return false;
}
function get_all_journeys() {
	let [plorder, stage, A, fen, uplayer] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer];
	let sets = [];
	for (const plname of plorder) {
		let pl = fen.players[plname];
		let i = 0;
		for (const j of pl.journeys) {
			sets.push({ plname: plname, j: j, jnew: jsCopy(j), index: i });
			i++;
		}
	}
	return sets;
}

function try_add_to_group(key, j, addkey = true) {
	if (is_group(j)) {
		if (key[0] == find_group_rank(j)) { if (addkey) j.push(key); return true; }
	} else {
		if (matches_on_either_end_new(key, j)) { if (addkey) j.push(key); return true; }
	}
	return false;
}
function try_replace_jolly(key, j, replace = true) {
	let jolly_idx = find_index_of_jolly(j);
	if (jolly_idx == -1) return false;

	if (is_group(j)) {
		let r = find_group_rank(j);
		if (key[0] == r) { if (replace) j[jolly_idx] = key; return true; }
	} else if (jolly_idx > 0) {
		let rank_before_index = j[jolly_idx - 1][0];
		let rankstr = 'A23456789TJQKA';
		let rank_needed = rankstr[rankstr.indexOf(rank_before_index) + 1];
		if (key[0] == rank_needed) { if (replace) j[jolly_idx] = key; return true; }
	} else {
		let rank_after_index = j[jolly_idx + 1][0];
		let rankstr = 'A23456789TJQKA';
		let rank_needed = rank_after_index == 'A' ? 'K' : rankstr[rankstr.indexOf(rank_after_index) - 1];
		if (key[0] == rank_needed) { if (replace) j[jolly_idx] = key; return true; }
	}
	return false;
}
function get_journeys_with_jolly_for_key(key) {
	let [plorder, stage, A, fen, uplayer] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer];
	let sets = [];
	for (const plname of plorder) {
		let pl = fen.players[plname];
		let i = 0;
		for (const j of pl.journeys) {
			if (try_replace_jolly(key, j, false)) sets.push({ plname: plname, j: j, index: i });
			i++;
		}
	}
	return sets;
}
function ui_get_jolly_items() {
	//find journey items that contain a jolly replaceable by A.selectedCards[0].key
	let items = [], i = 0;
	let sets = Z.A.jollySets;
	//console.log('...sets', sets);
	for (const s of sets) {
		let o = UI.players[s.plname].journeys[s.index];
		let name = `${s.plname}_j${i}`;
		o.div = o.container;
		let item = { o: o, a: name, key: o.list[0], friendly: name, path: o.path, index: i, ui: o.container };
		i++;
		items.push(item);

	}
	return items;

}

//#region aristo rumors
function path2fen(path) {
	let [fen, uplayer] = [Z.fen, Z.uplayer];
	let res = lookup(fen, path.split('.'));
	//console.log('res',res);
	return res;
}
function mStamp(d1, text) {
	mStyle(d1, { position: 'relative' });
	//let stamp = mDiv(d1, { family:'tahoma', fz:16, weight:'bold', position:'absolute', top:'25%',left:'10%',transform:'rotate(35deg)', w: '80%', h: 24 },null,`blackmail!`,'rubberstamp');
	//let stamp = mDiv(d1, { position:'absolute',top:30,left:0,transform:'rotate( 35deg )' },null,`blackmail!`,'rubberp');
	// mDiv(d1,{position:'absolute',top:30,left:0,},null,`<span class="stamp is-approved">BLACKMAIL!</span>`);
	// mDiv(d1,{position:'absolute',top:30,left:0,},null,`<span class="stamp1">BLACKMAIL!</span>`);
	//mDiv(d1, { position: 'absolute', top: 25, left: 5, weight: 700, fg: 'black', border: '2px solid black', padding: 2 }, null, `BLACKMAIL`, 'stamp1');

	let r = getRect(d1);
	let [w, h] = [r.w, r.h];
	let sz = r.h / 7;
	console.log('r', r, 'sz', sz);
	//let [border,rounding,angle]=[sz*.08,sz/3,-14];
	let [padding, border, rounding, angle] = [sz / 10, sz / 6, sz / 8, rNumber(-25, 25)];
	mDiv(d1, {
		opacity: 0.9,
		position: 'absolute', top: 25, left: 5, //weight: 700, fg: 'black', border: '2px solid black', padding: 2,
		transform: `rotate(${angle}deg)`,
		fz: sz,
		//'line-height':sz,
		// border:`${border}px solid black`,
		border: `${border}px solid black`,
		hpadding: 2, //padding,
		vpadding: 0,
		// vpadding: border,
		// hpadding: rounding,
		rounding: rounding,
		// 'background-image': `url('https://s3-us-west-2.amazonaws.com/s.cdpn.io/8399/grunge.png')`,
		// 'background-size': `${300*sz}px ${200*sz}px`,
		// 'background-position': `${4*sz}px ${2*sz}px`,
		// 'background-image': 'url(../base/assets/images/textures/stamp.jpg)',
		// 'background-size': `${300*sz}px ${200*sz}px`,
		// 'background-position': `${4*sz}px ${2*sz}px`,

		'-webkit-mask-size': `${w}px ${h}px`,
		'-webkit-mask-position': `50% 50%`,
		//'-webkit-mask-image': `url('https://s3-us-west-2.amazonaws.com/s.cdpn.io/8399/grunge.png')`,
		'-webkit-mask-image': 'url("../base/assets/images/textures/grunge.png")',

		// '-webkit-mask-size': `311px 200px`,
		// '-webkit-mask-position': `4rem 2rem`,
		// '-webkit-mask-image': `url('https://s3-us-west-2.amazonaws.com/s.cdpn.io/8399/grunge.png')`,

		weight: 400, //700,
		display: 'inline-block',
		'text-transform': 'uppercase',
		family: "black ops one", //'Courier', //'courier new',
		'mix-blend-mode': 'multiply'
	}, null, text);

}


//#region aristo rumors
function ui_get_top_rumors() {
	//let cards = ari_open_rumors();
	return ui_get_card_items(cards);
	let items = [], i = 0;
	let comm = UI.deck_rumors;
	for (const o of comm.items) {
		let item = { o: o, a: o.key, key: o.key, friendly: o.short, path: comm.path, index: i };
		i++;
		items.push(item);
	}
	let topdeck = UI.deck_commission.get_topcard();
	items.push({ o: topdeck, a: topdeck.key, key: topdeck.key, friendly: topdeck.short, path: 'deck_commission', index: i });
	//console.log('choose among:', items)
	return items;
}
function post_rumor() {

	let [fen, A, uplayer, building, obuilding, owner] = [Z.fen, Z.A, Z.uplayer, Z.A.building, Z.A.obuilding, Z.A.buildingowner];
	let buildingtype = Z.A.building.o.type;
	//console.log('====>buildingtype',buildingtype);
	let res = A.selected[0] == 0; //confirm('destroy the building?'); //TODO das muss besser werden!!!!!!!
	if (!res) {
		if (fen.players[owner].coins > 0) {
			//console.log('player', owner, 'pays to', uplayer, fen.players[owner].coins, fen.players[uplayer].coins);
			fen.players[owner].coins -= 1;
			fen.players[uplayer].coins += 1;
			//console.log('after payment:', fen.players[owner].coins, fen.players[uplayer].coins)
		}
	} else {
		let list = obuilding.list;
		//console.log('!!!!!!!!!!!!!building', obuilding, 'DESTROY!!!!!!!!!!!!!!!!', '\nlist', list);
		let correct_key = list[0];
		let rank = correct_key[0];
		//console.log('rank is', rank);
		//console.log('building destruction: ', correct_key);
		while (list.length > 0) {
			let ckey = list[0];
			//console.log('card rank is', ckey[0])
			if (ckey[0] != rank) {
				elem_from_to_top(ckey, list, fen.deck_discard);
				//console.log('discard',otree.deck_discard);
			} else {
				elem_from_to(ckey, list, fen.players[owner].hand);
			}
		}
		//console.log('building after removing cards', list, obuilding)
		if (isdef(obuilding.harvest)) {
			fen.deck_discard.unshift(obuilding.harvest);
		}
		ari_reorg_discard(fen);


		let blist = lookup(fen, stringBeforeLast(building.path, '.').split('.')); //building.path.split('.')); //stringBeforeLast(ibuilding.path, '.').split('.'));, stringBeforeLast(building.path, '.').split('.'));

		//console.log('===>remove',obuilding,'from',blist);
		removeInPlace(blist, obuilding);

		//console.log('player', owner, 'after building destruction', otree[owner])
	}
	ari_history_list([`${uplayer} rumored ${buildingtype} of ${owner} resulting in ${res ? 'destruction' : 'payoff'}`,], 'rumor');

	ari_next_action(fen, uplayer);


}
function rest() {

	if (isdef(obuilding.schwein)) {

		Z.stage = 46;
		A.building = item;
		A.obuilding = obuilding;
		A.buildingowner = owner;
		ari_pre_action();
		return;

	} else {

		//this building is revealed
		let cards = item.o.items;
		let key = cards[0].rank;
		let schweine = false;
		let schwein = null;
		for (const c of cards) {
			if (c.rank != key) { schweine = true; schwein = c.key; face_up(c); break; }
		}
		if (schweine) {
			if (fen.players[owner].coins > 0) {
				fen.players[owner].coins--;
				fen.players[uplayer].coins++;
			}
			let b = lookup(fen, item.path.split('.'));
			b.schwein = schwein;
		}

		ari_history_list([
			`${uplayer} rumored ${ari_get_building_type(obuilding)} of ${owner} resulting in ${schweine ? 'schweine' : 'ok'} ${ari_get_building_type(obuilding)}`,
		], 'rumor');

		ari_next_action(fen, uplayer);
	}


}

function ui_type_building(b, dParent, styles = {}, path = 'farm', title = '', get_card_func = ari_get_card) {

	let cont = ui_make_container(dParent, get_container_styles(styles));
	let cardcont = mDiv(cont);

	let list = b.list;
	//console.log('list', list)
	//let n = list.length;
	let d = mDiv(dParent);
	let items = list.map(x => get_card_func(x));
	// let cont = ui_make_hand_container(items, d, { maleft: 12, padding: 4 });

	let schwein = null;
	for (let i = 1; i < items.length; i++) {
		let item = items[i];
		if (b.schwein != item.key) face_down(item); else schwein = item;
	}

	let d_harvest = null;
	if (isdef(b.h)) {
		let keycard = items[0];
		let d = iDiv(keycard);
		mStyle(d, { position: 'relative' });
		d_harvest = mDiv(d, { position: 'absolute', w: 20, h: 20, bg: 'orange', opacity: .5, fg: 'black', top: '45%', left: -10, rounding: '50%', align: 'center' }, null, 'H');
	}

	let card = isEmpty(items) ? { w: 1, h: 100, ov: 0 } : items[0];
	//console.log('card',card)
	mContainerSplay(cardcont, 2, card.w, card.h, items.length, card.ov * card.w);
	ui_add_cards_to_hand_container(cardcont, items, list);

	ui_add_container_title(title, cont, items);

	// if (isdef(title) && !isEmpty(items)) { mText(title, d); }

	return {
		ctype: 'hand',
		list: list,
		path: path,
		container: cont,
		cardcontainer: cardcont,
		items: items,
		schwein: schwein,
		harvest: d_harvest,
		keycard: items[0],

	};
}


//#region fritz

function _show_special_message(msg, stay = false) {
	let dParent = mBy('dBandMessage');
	console.log('dBandMessage', mBy('dBandMessage'))
	if (nundef(dParent)) dParent = mDiv(document.body, {}, 'dBandMessage');
	console.log('dParent', dParent)
	show(dParent);
	clearElement(dParent);
	mStyle(dParent, { position: 'absolute', top: 200, bg: 'green', wmin: '100vw' });
	let d = mDiv(dParent, { margin: 0 });
	let styles = { classname: 'slow_gradient_blink', vpadding: 10, align: 'center', position: 'absolute', fg: 'white', fz: 24, w: '100vw' };
	let dContent = mDiv(d, styles, null, msg);
	mFadeClear(dParent, 3000);
}


function end_of_turn_fritz() {
	//console.log('A', Z.A)
	//console.log('time is up!!!', getFunctionsNameThatCalledThisFunction());
	let [A, fen, uplayer, plorder] = [Z.A, Z.fen, Z.uplayer, Z.plorder];
	let pl = fen.players[uplayer];
	//console.log('__________________________');

	clear_quick_buttons();

	//all TJ groups must be checked and loose cards placed in loosecards
	let ploose = {};
	fen.journeys = [];
	fen.loosecards = [];
	for (const plname in fen.players) { fen.players[plname].loosecards = []; }
	for (const group of DA.TJ) {
		let ch = arrChildren(iDiv(group));
		let cards = ch.map(x => Items[x.id]);
		//find out if is a set
		//console.log('cards', cards);
		let set = ferro_is_set(cards, Z.options.jokers_per_group, 3);
		//console.log('set', set);
		if (!set) {
			//dann kommen die Karten in die Loosecards
			for (const card of cards) {
				if (is_joker(card)) {
					//console.log('pushing joker', card.key);
					fen.loosecards.push(card.key);
					continue;
				}
				let owner = valf(card.owner, uplayer);
				lookupAddToList(ploose, [owner], card.key);
				//console.log('add card', card.key, 'to', owner);
			}
			//console.log('NOT A SET', cards);
		} else {
			let j = set; //[];
			//for (const card of cards) { delete card.owner; j.push(card.key); }
			fen.journeys.push(j);
			//console.log('YES!!!', 'adding journey', j);
		}
	}
	for (const plname in ploose) {
		fen.players[plname].loosecards = ploose[plname];
	}

	//console.log('_____\npublic loosecards', fen.loosecards);
	//console.log('journeys:', fen.journeys);
	//for (const plname in fen.players) { console.log('loosecards', plname, fen.players[plname].loosecards); }

	//discard pile must be reduced by all cards that do not have source = 'discard'
	let discard = UI.deck_discard.items.filter(x => x.source == 'discard');
	fen.deck_discard = discard.map(x => x.key);

	if (!isEmpty(A.selected)) {
		//console.log('selected', A.selected);
		let ui_discarded_card = A.selected.map(x => A.items[x].o)[0];

		removeInPlace(UI.players[uplayer].hand.items, ui_discarded_card);
		ckey = ui_discarded_card.key;
		//console.log('discard', discard);
		elem_from_to(ckey, fen.players[uplayer].hand, fen.deck_discard);
		//ari_history_list([`${uplayer} discards ${c}`], 'discard');

	}

	//all UI.hand cards that do NOT have source=hand must be removed from player hands

	let uihand = UI.players[uplayer].hand.items; //.filter(x => x.source == 'hand');
	let fenhand_vorher = fen.players[uplayer].hand;
	let fenhand = fen.players[uplayer].hand = uihand.filter(x => x.source == 'hand').map(x => x.key);
	//console.log('hand', uihand, 'fenhand vorher:', fenhand_vorher, 'fenhand', fenhand);

	//check gameover!!!!
	if (isEmpty(fenhand) && isEmpty(fen.players[uplayer].loosecards)) {
		end_of_round_fritz(uplayer);

	} else {
		Z.turn = [get_next_player(Z, uplayer)];
		deck_deal_safe_fritz(fen, Z.turn[0]);
	}
	//console.log('==>fen.loosecards', fen.loosecards); //, fen.players[uplayer].loosecards); //, fen.players);
	let ms = fen.players[uplayer].time_left = stop_user_timer();

	//console.log('fritz_turn_ends', 'ms', ms);
	if (ms <= 0) {
		console.log('time is up!!!');
		//this player needs to be removed!
		if (Z.turn[0] == uplayer) Z.turn = [get_next_player(Z, uplayer)];
		//if only 1 player in plorder, that player wins
		remove_player(fen, uplayer);
		if (plorder.length == 1) { end_of_round_fritz(plorder[0]); }
	}

	turn_send_move_update();

}


function fritz_present_new(z, dParent, uplayer) {

	let [fen, ui, stage] = [z.fen, UI, z.stage];
	let [dOben, dOpenTable, dMiddle, dRechts] = tableLayoutMR(dParent, 5, 1); mFlexWrap(dOpenTable)
	Config.ui.card.h = 130;
	Config.ui.container.h = Config.ui.card.h + 30;

	//let deck = ui.deck = ui_type_deck(fen.deck, dOpenTable, { maleft: 12 }, 'deck', 'deck', fritz_get_card);
	if (isEmpty(fen.deck_discard)) {
		mText('discard empty', dOpenTable);
		ui.deck_discard = { items: [] }
	} else {
		let deck_discard = ui.deck_discard = ui_type_hand(fen.deck_discard, dOpenTable, { maright: 25 }, 'deck_discard', 'discard', fritz_get_card, true);
		let i = 0; deck_discard.items.map(x => { x.source = 'discard'; x.index = i++ });
	}
	mLinebreak(dOpenTable);


	let ddarea = UI.ddarea = mDiv(dOpenTable, { border: 'dashed 1px black', bg: '#eeeeee80', box: true, wmin: 245, padding: '5px 50px 5px 5px', margin: 5 });
	mDroppable(ddarea, drop_card_fritz); ddarea.id = 'dOpenTable'; Items[ddarea.id] = ddarea;
	mFlexWrap(ddarea)

	fritz_stats_new(z, dRechts);

	show_history(fen, dRechts);

	DA.TJ = [];
	//journeys become groups
	//fen.journeys = [['QHn', 'KHn', 'AHn'], ['QCn', 'QHn', 'QDn']];
	for (const j of fen.journeys) {
		let cards = j.map(x => fritz_get_card(x));
		frnew(cards[0], { target: 'hallo' });
		for (let i = 1; i < cards.length; i++) { fradd(cards[i], Items[cards[0].groupid]); }

	}
	//loose cards of fen and other players become groups. own loose cards will ALSO go to player area
	let loosecards = ui.loosecards = jsCopy(fen.loosecards).map(c => fritz_get_card(c));
	for (const plname of fen.plorder) {
		let cards = fen.players[plname].loosecards.map(c => fritz_get_card(c));
		cards.map(x => x.owner = plname);
		// if (plname == uplayer) { ui.ploosecards = cards; } else { loosecards = loosecards.concat(cards); }
		if (plname != uplayer) { loosecards = loosecards.concat(cards); }
		//loosecards = loosecards.concat(cards);
	}
	for (const looseui of loosecards) {
		//console.log('looseui', looseui);
		let card = looseui;
		frnew(card, { target: 'hallo' });
	}

	//all cards in drop area are droppable
	for (const group of DA.TJ) {
		let d = iDiv(group);
		//console.log('d',d);
		let ch = arrChildren(iDiv(group));
		let cards = ch.map(x => Items[x.id]);
		//console.log('cards', cards);
		cards.map(x => mDroppable(iDiv(x), drop_card_fritz));
	}

	//if ddarea is empty, write drag and drop hint
	if (arrChildren(ddarea).length == 0) {
		let d = mDiv(ddarea, { 'pointer-events': 'none', maleft: 45, align: 'center', hmin: 40, w: '100%', fz: 12, fg: 'dimgray' }, 'ddhint', 'drag and drop cards here');
		//setRect(ddarea)
		//mPlace(d,'cc')

	}

	ui.players = {};
	let uname_plays = fen.plorder.includes(Z.uname);
	let plmain = uname_plays && Z.mode == 'multi' ? Z.uname : uplayer;
	fritz_present_player(plmain, dMiddle);

	if (TESTING) {
		for (const plname of arrMinus(fen.plorder, plmain)) {
			fritz_present_player(plname, dMiddle);
		}
	}


}



//#region rechnung
function boamain_start() {
	//console.log('haaaaaaaaaaaaaaaaa');
	S.boa_state = 'authorized';

	//hier start timer that will reset boa_state to null
	if (DA.challenge == 1) {
		TO.boa = setTimeout(() => {
			S.boa_state = null;
			let msg = DA.challenge == 1 ? 'CONGRATULATIONS!!!! YOU SUCCEEDED IN LOGGING IN TO BOA' : 'Session timed out!';
			show_eval_message(true);
			//alert(msg);
			//boa_start();
		}, 3000);
	}

	show_correct_location('boa');  //das ist um alle anderen screens zu loeschen!
	let dParent = mBy('dBoa'); mClear(dParent);

	let d0 = mDiv(dParent, { align: 'center' }, 'dBoaMain'); mCenterFlex(d0);
	// let d0 = mDiv(d, { align:'center', display: 'grid', 'grid-template-columns': '2', gap:20 }, 'dBoaMain');
	//let d0 = mDiv(d, { display: 'flex', 'justify-content': 'center', gap:20 }, 'dBoaMain');

	let [wtotal, wleft, wright] = [972, 972 - 298, 292];

	let d = mDiv(d0, { w: wtotal, hmin: 500 }); mAppend(d, createImage('boamain_header.png', { h: 111 }));
	//return;

	// let d0 = mDiv(d);
	//let d1 = mDiv(d0, { align: 'center' });

	// let d2 = mDiv(d);
	// let d3 = mDiv(d2, { display: 'flex', 'justify-content': 'center' }, 'dBoaMain');

	// d = mDiv(d3, { w: wtotal, hmin: 500 });
	let dl = mDiv(d, { float: 'left', w: wleft, hmin: 400 });
	let dr = mDiv(d, { float: 'right', hmin: 400, w: wright });

	mDiv(dr, { h: 100 });
	mAppend(dr, createImage('boamain_rechts.png', { w: 292 }));

	mAppend(dl, createImage('boamain_left_top.jpg', { matop: 50, maleft: -20 }));
	//mDiv(dl, { family:'connectionsregular,Verdana,Geneva,Arial,Helvetica,sans-serif', fz: 18, weight: 500, 'line-height':70, fg:'#524940' }, null, 'Payment Center');

	mDiv(dl, { bg: '#857363', fg: 'white', fz: 15 }, null, '&nbsp;&nbsp;<i class="fa fa-caret-down"></i>&nbsp;&nbsp;Default Group<div style="float:right;">Sort&nbsp;&nbsp;</div>');

	let boadata = get_fake_boa_data_list();
	let color_alt = '#F9F7F4';
	let i = 0;
	//let sortedkeys = get_keys(boadata);	sortedkeys.sort();
	for (const o of boadata) {
		let k = o.key;
		o.index = i;
		//console.log('key',k,'index',i);
		let logo = valf(o.logo, 'defaultacct.jpg');
		let path = `${logo}`;
		let [sz, bg] = [25, i % 2 ? 'white' : color_alt];

		let dall = mDiv(dl, { bg: bg, fg: '#FCFCFC', 'border-bottom': '1px dotted silver' }, `dAccount${i}`);
		let da = mDiv(dall);
		mFlexLR(da);

		let img = createImage(path, { h: sz, margin: 10 });

		let da1 = mDiv(da);
		mAppend(da1, img);
		let dtext = mDiv(da1, { align: 'left', display: 'inline-block', fg: '#FCFCFC', fz: 14 });
		mAppend(dtext, mCreateFrom(`<a>${k}</a>`));
		let dsub = mDiv(dtext, { fg: 'dimgray', fz: 12 }, null, o.sub);

		let da2 = mDiv(da); mFlex(da2);
		let da21 = mDiv(da2, { w: 100, hmargin: 20, mabottom: 20 });
		let padinput = 7;
		mDiv(da21, { fg: 'black', fz: 12, weight: 'bold' }, null, 'Amount');
		mDiv(da21, { w: 100 }, null, `<input onfocus="add_make_payments_button(event)" style="color:dimgray;font-size:14px;border:1px dotted silver;padding:${padinput}px;width:85px" id="inp${i}" name="authocode" value="$" type="text" />`);

		let da22 = mDiv(da2, { maright: 10 });
		mDiv(da22, { fg: 'black', fz: 12, weight: 'bold' }, null, 'Deliver By');
		mDiv(da22, {}, null, `<input style="color:dimgray;font-size:12px;border:1px dotted silver;padding:${padinput}px" id="inpAuthocode" name="authocode" value="" type="date" />`);

		// mDiv(dall,{fz:12,fg:'blue',maleft:400,mabottom:25},null,'hallo');
		let dabot = mDiv(dall);
		mFlexLR(dabot);
		let lastpayment = isdef(o['Last Payment']) ? `Last Payment: ${o['Last Payment']}` : ' ';
		mDiv(dabot, { fz: 12, fg: '#303030', maleft: 10, mabottom: 25 }, null, `${lastpayment}`);
		mDiv(dabot, { fz: 12, fg: 'blue', maright: 90, mabottom: 25 }, null, `<a>Activity</a>&nbsp;&nbsp;&nbsp;<a>Reminders</a>&nbsp;&nbsp;&nbsp;<a>AutoPay</a>`);

		mDiv(dall);
		//let dadummy = mDiv(dall, {margin:500 },null,`<a>Activity</a><a>Reminders</a><a>AutoPay</a>`); //;'border-bottom':'1px solid black'});

		i++;
	}


	//mDiv(dl, { hmin: 400, bg: 'orange' });
	//for (let j = 0; j < i; j++) { let inp = document.getElementById(`inp${j}`); inp.addEventListener('keyup', unfocusOnEnter); }

}
function _boamain_start() {
	//console.log('haaaaaaaaaaaaaaaaa');
	S.boa_state = 'authorized';

	//hier start timer that will reset boa_state to null
	if (DA.challenge == 1) {
		TO.boa = setTimeout(() => {
			S.boa_state = null;
			let msg = DA.challenge == 1 ? 'CONGRATULATIONS!!!! YOU SUCCEEDED IN LOGGING IN TO BOA' : 'Session timed out!';
			alert(msg);
			boa_start();
		}, 3000);
	}

	show_correct_location('boa');  //das ist um alle anderen screens zu loeschen!
	let d = mBy('dBoa'); mClear(d);

	let d0 = mDiv(d);
	let d1 = mDiv(d0, { align: 'center' });
	mAppend(d1, createImage('boamain_header.png', { h: 111 }));

	let d2 = mDiv(d);
	let d3 = mDiv(d2, { display: 'flex', 'justify-content': 'center' }, 'dBoaMain');

	let [wtotal, wleft, wright] = [972, 972 - 298, 292];
	d = mDiv(d3, { w: wtotal, hmin: 500 });
	let dl = mDiv(d, { float: 'left', w: wleft, hmin: 400 });
	let dr = mDiv(d, { float: 'right', hmin: 400, w: wright });

	mDiv(dr, { h: 100 });
	mAppend(dr, createImage('boamain_rechts.png', { w: 292 }));

	mAppend(dl, createImage('boamain_left_top.jpg', { matop: 50, maleft: -20 }));
	//mDiv(dl, { family:'connectionsregular,Verdana,Geneva,Arial,Helvetica,sans-serif', fz: 18, weight: 500, 'line-height':70, fg:'#524940' }, null, 'Payment Center');

	mDiv(dl, { bg: '#857363', fg: 'white', fz: 15 }, null, '&nbsp;&nbsp;<i class="fa fa-caret-down"></i>&nbsp;&nbsp;Default Group<div style="float:right;">Sort&nbsp;&nbsp;</div>');

	let boadata = get_fake_boa_data();
	let color_alt = '#F9F7F4';
	let i = 0;
	for (const k in boadata) {
		let o = boadata[k];
		//console.log('o', o);
		let logo = valf(o.logo, 'defaultacct.jpg');
		let path = `${logo}`;
		let [sz, bg] = [25, i % 2 ? 'white' : color_alt];

		let dall = mDiv(dl, { bg: bg, fg: '#FCFCFC', 'border-bottom': '1px dotted silver' });
		let da = mDiv(dall);
		mFlexLR(da);

		let img = createImage(path, { h: sz, margin: 10 });

		let da1 = mDiv(da);
		mAppend(da1, img);
		let dtext = mDiv(da1, { display: 'inline-block', fg: '#FCFCFC', fz: 14 });
		mAppend(dtext, mCreateFrom(`<a>${k}</a>`));
		let dsub = mDiv(dtext, { fg: 'dimgray', fz: 12 }, null, o.sub);

		let da2 = mDiv(da); mFlex(da2);
		let da21 = mDiv(da2, { w: 100, hmargin: 20, mabottom: 20 });
		let padinput = 7;
		mDiv(da21, { fg: 'black', fz: 12, weight: 'bold' }, null, 'Amount');
		mDiv(da21, { w: 100 }, null, `<input style="color:dimgray;font-size:14px;border:1px dotted silver;padding:${padinput}px;width:85px" id="inpAuthocode" name="authocode" value="$" type="text" />`);

		let da22 = mDiv(da2, { maright: 10 });
		mDiv(da22, { fg: 'black', fz: 12, weight: 'bold' }, null, 'Deliver By');
		mDiv(da22, {}, null, `<input style="color:dimgray;font-size:12px;border:1px dotted silver;padding:${padinput}px" id="inpAuthocode" name="authocode" value="" type="date" />`);

		// mDiv(dall,{fz:12,fg:'blue',maleft:400,mabottom:25},null,'hallo');
		let dabot = mDiv(dall);
		mFlexLR(dabot);
		let lastpayment = isdef(o['Last Payment']) ? `Last Payment: ${o['Last Payment']}` : ' ';
		mDiv(dabot, { fz: 12, fg: '#303030', maleft: 10, mabottom: 25 }, null, `${lastpayment}`);
		mDiv(dabot, { fz: 12, fg: 'blue', maright: 90, mabottom: 25 }, null, `<a>Activity</a>&nbsp;&nbsp;&nbsp;<a>Reminders</a>&nbsp;&nbsp;&nbsp;<a>AutoPay</a>`);
		//let dadummy = mDiv(dall, {margin:500 },null,`<a>Activity</a><a>Reminders</a><a>AutoPay</a>`); //;'border-bottom':'1px solid black'});

		i++;
	}

	//mDiv(dl, { hmin: 400, bg: 'orange' });

}

function restrest() {
	let d1 = mDiv(d0, { align: 'center' });
	mAppend(d1, createImage('boamain_header.png', { h: 111 }));

	let d2 = mDiv(d);
	let d3 = mDiv(d2, { display: 'flex', 'justify-content': 'center' });

	let [wtotal, wleft, wright] = [972, 972 - 298, 292];
	d = mDiv(d3, { w: wtotal, hmin: 500 });
	let dl = mDiv(d, { float: 'left', w: wleft, hmin: 400 });
	let dr = mDiv(d, { float: 'right', hmin: 400, w: wright });

	mDiv(dr, { h: 100 });
	mAppend(dr, createImage('boamain_rechts.png', { w: 292 }));

	mAppend(dl, createImage('boamain_left_top.jpg', { matop: 50, maleft: -20 }));
	//mDiv(dl, { family:'connectionsregular,Verdana,Geneva,Arial,Helvetica,sans-serif', fz: 18, weight: 500, 'line-height':70, fg:'#524940' }, null, 'Payment Center');

	mDiv(dl, { bg: '#857363', fg: 'white', fz: 15 }, null, '&nbsp;&nbsp;<i class="fa fa-caret-down"></i>&nbsp;&nbsp;Default Group<div style="float:right;">Sort&nbsp;&nbsp;</div>');

	let boadata = get_fake_boa_data();
	let color_alt = '#F9F7F4';
	let i = 0;
	for (const k in boadata) {
		let o = boadata[k];
		//console.log('o', o);
		let logo = valf(o.logo, 'defaultacct.jpg');
		let path = `${logo}`;
		let [sz, bg] = [25, i % 2 ? 'white' : color_alt];

		let dall = mDiv(dl, { bg: bg, fg: '#FCFCFC', 'border-bottom': '1px dotted silver' });
		let da = mDiv(dall);
		mFlexLR(da);

		let img = createImage(path, { h: sz, margin: 10 });

		let da1 = mDiv(da);
		mAppend(da1, img);
		let dtext = mDiv(da1, { display: 'inline-block', fg: '#FCFCFC', fz: 14 });
		mAppend(dtext, mCreateFrom(`<a>${k}</a>`));
		let dsub = mDiv(dtext, { fg: 'dimgray', fz: 12 }, null, o.sub);

		let da2 = mDiv(da); mFlex(da2);
		let da21 = mDiv(da2, { w: 100, hmargin: 20, mabottom: 20 });
		let padinput = 7;
		mDiv(da21, { fg: 'black', fz: 12, weight: 'bold' }, null, 'Amount');
		mDiv(da21, { w: 100 }, null, `<input style="color:dimgray;font-size:14px;border:1px dotted silver;padding:${padinput}px;width:85px" id="inpAuthocode" name="authocode" value="$" type="text" />`);

		let da22 = mDiv(da2, { maright: 10 });
		mDiv(da22, { fg: 'black', fz: 12, weight: 'bold' }, null, 'Deliver By');
		mDiv(da22, {}, null, `<input style="color:dimgray;font-size:12px;border:1px dotted silver;padding:${padinput}px" id="inpAuthocode" name="authocode" value="" type="date" />`);

		// mDiv(dall,{fz:12,fg:'blue',maleft:400,mabottom:25},null,'hallo');
		let dabot = mDiv(dall);
		mFlexLR(dabot);
		let lastpayment = isdef(o['Last Payment']) ? `Last Payment: ${o['Last Payment']}` : ' ';
		mDiv(dabot, { fz: 12, fg: '#303030', maleft: 10, mabottom: 25 }, null, `${lastpayment}`);
		mDiv(dabot, { fz: 12, fg: 'blue', maright: 90, mabottom: 25 }, null, `<a>Activity</a>&nbsp;&nbsp;&nbsp;<a>Reminders</a>&nbsp;&nbsp;&nbsp;<a>AutoPay</a>`);
		//let dadummy = mDiv(dall, {margin:500 },null,`<a>Activity</a><a>Reminders</a><a>AutoPay</a>`); //;'border-bottom':'1px solid black'});

		i++;
	}



	//mDiv(dl, { hmin: 400, bg: 'orange' });

}
function _bw_widget_popup() {
	let dpop = mBy('dPopup');
	show(dpop); mClear(dpop)
	mStyle(dpop, { top: 50, right: 10 }); let prefix = 'boa';
	let d = mDiv(dpop, { wmin: 200, hmin: 200, padding: 0 }, 'dBw');
	let d2 = mDiv(d, { padding: 0, h: 30 }, null, `<img width='100%' src='../rechnung/images/bwsearch.jpg'>`);
	//let d2 = mDiv(d, { bg: 'dodgerblue', fg: 'white' }, null, 'your bitwarden vault');

	let d3 = mDiv(d, { bg: '#eee', fg: 'dimgray', padding: 8, matop: 8 }, null, 'LOGINS');
	let d4 = mDiv(d, { bg: 'white', fg: 'black' });
	let d5 = mDiv(d4, { display: 'flex' });
	let dimg = mDiv(d5, { bg: 'white', fg: 'black' }, null, `<img src='../rechnung/images/boa.png' height=14 style="margin:8px">`);
	// let dtext = mDiv(d5, {}, null, `<div>boa</div><div style="font-size:12px;color:gray">gleeb69</div>`);
	let dtext = mDiv(d5, { cursor: 'pointer' }, null, `<div>boa</div><div style="font-size:12px;color:gray">gleeb69</div>`);
	dtext.onclick = () => onclick_bw_symbol(prefix)
	let d6 = mDiv(d4, { display: 'flex', padding: 2 });
	let disyms = {
		bwtext: { postfix: 'userid', matop: 2, maright: 0, mabottom: 0, maleft: 0, sz: 27 },
		bwcross: { postfix: 'cross', matop: 2, maright: 0, mabottom: 0, maleft: -13, sz: 25 },
		bwkey: { postfix: 'pwd', matop: 0, maright: 0, mabottom: 0, maleft: -12, sz: 27 },
		bwclock: { postfix: 'clock', matop: 0, maright: 0, mabottom: 0, maleft: 0, sz: 25 },
	}
	for (const k of ['bwtext', 'bwcross', 'bwkey']) { //,'bwclock']) {
		let o = disyms[k];
		let [filename, styles] = [k, disyms[k]];
		let path = `../rechnung/images/${filename}.png`;
		let [sz, ma] = [styles.sz, `${styles.matop}px ${styles.maright}px ${styles.mabottom}px ${styles.maleft}px`];
		//console.log('ma', ma);
		let img = mDiv(d6, { paright: 16 }, null, `<img src='${path}' height=${sz} style="margin:${ma}">`);
		if (k != 'bwcross') {
			mStyle(img, { cursor: 'pointer' });
			img.onclick = () => onclick_bw_symbol(prefix, o.postfix);
		}
	}
	mFlexSpacebetween(d4);
	let d7 = mDiv(d, { bg: '#eee', fg: 'dimgray', padding: 7 }, null, 'CARDS');
	//let d8 = mDiv(d, { fg: 'white' }, null, `<img width='100%' src='../rechnung/images/rest_bw.jpg'>`);

}

//#endregion

//#region ack OLD
function ferro_update_ack() {
	//should return true if need to resend!
	let [fen, stage, uplayer] = [Z.fen, Z.stage, Z.uplayer];

	//console.log('___________notes', jsCopy(Z.notes));

	if (Z.notes.resolve == true && uplayer == Z.host) { ferro_change_to_turn_round(); return true; }

	//update turn from notes
	let updated = false;
	for (const k in Z.notes) {
		if (k == 'akku') continue;
		if (!Z.turn.includes(k)) continue;
		updated = true;
		removeInPlace(Z.turn, k);
		console.log('removing player', k, 'from turn', Z.turn);
	}
	//console.log('Z.turn is now:', jsCopy(Z.turn));
	fen.turn = Z.turn;

	if (!isEmpty(Z.turn)) return updated;

	//ab hier is Z.turn EMPTY da heisst akku ist voll!!!!
	else if (uplayer == Z.host) { ferro_change_to_turn_round(); return true; }
	else { Z.turn = fen.turn = [Z.host]; Z.notes.resolve = true; return true; } //hier sollte resolve flag setzen!!!
}
function ferro_change_to_ack_round() {
	let [plorder, stage, A, fen, uplayer] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer];
	let nextplayer = get_next_player(Z, uplayer);

	//console.log('nextplayer should be', nextplayer)

	//newturn is list of players starting with nextplayer
	let newturn = jsCopy(plorder); while (newturn[0] != nextplayer) { newturn = arrCycle(newturn, 1); }

	//each player except uplayer will get opportunity to buy top discard - nextplayer will draw if passing
	fen.lastplayer = uplayer;
	fen.nextplayer = nextplayer;
	fen.turn_after_ack = [nextplayer];
	fen.nextstage = 'card_selection';
	let buyerlist = fen.canbuy = [];
	//console.log('newturn', newturn);
	for (const plname of newturn) {
		let pl = fen.players[plname];
		if (plname == uplayer) { pl.buy = false; continue; }
		//if (plname == nextplayer) { pl.buy = false; buyerlist.push(plname); }
		else if (pl.coins > 0) { pl.buy = false; buyerlist.push(plname); }
	}
	//log_object(fen, 'buyers', 'nextplayer canbuy');

	Z.stage = 'buy_or_pass';
	Z.turn = buyerlist;
	//console.log('Z.turn', Z.turn);
	Z.notes = { akku: true };
}
function ferro_change_to_turn_round() {
	//console.log('ferro_change_to_turn_round', getFunctionsNameThatCalledThisFunction()); 
	let [z, A, fen, stage, uplayer, ui] = [Z, Z.A, Z.fen, Z.stage, Z.uplayer, UI];
	assertion(stage == 'buy_or_pass', "ALREADY IN TURN ROUND!!!!!!!!!!!!!!!!!!!!!!")
	Z.turn = fen.turn_after_ack;
	//console.log('fen.canbuy', fen.canbuy);
	//console.log('next player will be', Z.turn);

	//resolve buy or pass round!
	//if any player has bought, he will get top discard
	for (const plname of fen.canbuy) {
		let pl = fen.players[plname];
		//console.log('pl',pl);
		if (pl.buy) {
			let card = fen.deck_discard.shift();
			//console.log('card',card,jsCopy(pl.hand));
			pl.hand.push(card);
			//also pl gets 2 top cards from deck
			//console.log('card',card,pl.hand);
			pl.hand.push(fen.deck.shift()); //get 1 extra card from deck
			pl.coins -= 1; //pay
			fen.player_bought = plname;
			ari_history_list([`${plname} bought ${card}`], 'buy');
			//console.log(plname, 'bought', card, 'for', 1, 'coins');
			break;
		}
	}
	fen.players[fen.nextplayer].hand.push(fen.deck.shift());//nextplayer draws
	Z.stage = fen.nextstage;
	//cleanup buy_or_pass variables
	for (const k of ['player_bought', 'nextplayer', 'nextstage', 'canbuy', 'turn_after_ack', 'akku']) delete fen[k];
	for (const plname of fen.plorder) { delete fen.players[plname].buy; }
	Z.notes = {};
	clear_transaction();

	//hier kann ich turn snapshot machen

}
function ferro_ack_uplayer() {
	let [A, fen, stage, uplayer] = [Z.A, Z.fen, Z.stage, Z.uplayer];
	removeInPlace(Z.turn, uplayer);
	if (A.selected[0] == 0) {
		Z.notes[uplayer] = { buy: true };
		fen.players[uplayer].buy = true;
	} else {
		Z.notes[uplayer] = { buy: false };
		fen.players[uplayer].buy = false;
	}

	if (isEmpty(Z.turn)) { ferro_change_to_turn_round(); }
	turn_send_move_update();
}
//#endregion



function ui_get_bluff_inputs(strings) {
	let uplayer = Z.uplayer;
	let items = ui_get_string_items(strings);
	console.log('items', items)
	return items;
	//hier koennt ich die ergebnis inputs dazugeben!
}


function ui_get_ferro_action_items() {
	let [plorder, stage, A, fen, uplayer, pl] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer, Z.fen.players[Z.uplayer]];

	let items = ui_get_hand_items(uplayer);
	let actions = ['discard', 'auflegen', 'anlegen', 'jolly'];
	items = items.concat(ui_get_string_items(actions));
	reindex_items(items);
	return items;
}
function ferro_process_action() {
	let [plorder, stage, A, fen, uplayer, pl] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer, Z.fen.players[Z.uplayer]];

	let selitems = A.selected.map(x => A.items[x]);
	console.log('selitems:', selitems);
	let cards = selitems.filter(x => x.itemtype == 'card');
	let actions = selitems.filter(x => x.itemtype == 'string');
	if (actions.length == 0) { select_error('select an action!'); selitems.map(x => ari_make_unselected(x)); A.selected = []; return; }
	let cmd = actions[0].a;
	switch (cmd) {
		case 'discard': ferro_process_discard(); break;
		case 'auflegen': ferro_process_group(); break;
		case 'anlegen': ferro_process_anlegen(); break;
		case 'jolly': ferro_process_jolly(); break;
		default: console.log('unknown command: ' + cmd);
	}
}
function ferro_process_action_() {
	let [plorder, stage, A, fen, uplayer, pl] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer, Z.fen.players[Z.uplayer]];

	//player has selected 1 card

	//need to find out what can do with that card?
	//commands will be: discard group sequence anlegen jolly
	A.initialItem = A.items[A.selected[0]];
	Z.stage = 'commands';
	ferro_pre_action();
}
function ferro_process_command_() {

	let [plorder, stage, A, fen, uplayer, pl] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer, Z.fen.players[Z.uplayer]];

	//player has selected 1 card
	let cmd = A.items[A.selected[0]].a;
	switch (cmd) {
		case 'discard': ferro_process_discard(); break;
		case 'group': ferro_prep_group(); break;
		default: console.log('unknown command: ' + cmd);
	}
}
function ferro_prep_group() {
	let [plorder, stage, A, fen, uplayer] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer];

	A.command = 'group';
	Z.stage = 'group';
	ferro_pre_action();

}
function ferro_get_actions(uplayer) {
	let fen = Z.fen;
	//actions include market card exchange
	let actions = ['discard', 'group', 'sequence', 'anlegen', 'jolly'];
	//if (Config.autosubmit) actions.push('pass'); ////, 'pass'];
	let avail_actions = [];
	for (const a of actions) {
		//check if this action is possible for uplayer
		let avail = ferro_check_action_available(a, fen, uplayer);
		if (avail) avail_actions.push(a);
	}
	return avail_actions;

}
function ferro_check_action_available(a, fen, uplayer) {
	let card = Z.A.initialItem.o;
	let pl = fen.players[uplayer];
	if (a == 'discard') { return true; }
	else if (a == 'group') {

		//check if player can build a group of 3 cards with rank = card.rank
		let rank = card.rank;
		let hand = pl.hand;
		//hand needs to have at least 3 cards of rank rank
		let group = hand.filter(x => x[0] == rank);

		//find a card in hand that has rank '*'
		let wildcard = hand.find(x => x[0] == '*');
		//console.log('wildcard', wildcard?'yes':'no');
		let n = group.length + (isdef(wildcard) ? 1 : 0);
		console.log('can build group of', n)
		return n >= 3;

	} else return false;
}
function ui_get_group_items() {
	let [plorder, stage, A, fen, uplayer] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer];
	let rank = A.initialItem.o.rank;
	let items = ui_get_hand_items(uplayer);
	console.log('items', items, 'rank', rank);

	items = items.filter(x => x.key[0] == rank || x.key[0] == '*');
	console.log('items', items);
	reindex_items(items);
	return items;
}
function ui_get_ferro_commands() {

	let avail = ferro_get_actions(Z.uplayer);
	let items = [], i = 0;
	for (const cmd of avail) { //just strings!
		let item = { o: null, a: cmd, key: cmd, friendly: cmd, path: null, index: i };
		i++;
		items.push(item);
	}
	//console.log('available commands', items);
	return items;
}
function ferro_pre_action_() {
	let [stage, A, fen, plorder, uplayer, deck] = [Z.stage, Z.A, Z.fen, Z.plorder, Z.uplayer, Z.deck];
	//log_object(fen, 'fen', 'stage turn players');	//console.log('__________stage', stage, 'uplayer', uplayer, '\nDA', get_keys(DA));	//console.log('fen',fen,fen.players[uplayer]);
	switch (stage) {
		case 'throw': select_add_items(ui_get_hand_items(uplayer), ferro_post_discard, 'must discard', 1, 1); break;
		case 'buy_or_pass': select_add_items(ui_get_buy_or_pass_items(), ferro_ack_uplayer, 'may click top discard to buy or pass', 1, 1); break;
		case 'card_selection': select_add_items(ui_get_ferro_action_items(), ferro_process_action, 'must discard or play a set', 1, 100); break;
		// case 'commands': select_add_items(ui_get_string_items(['discard', 'group', 'sequence', 'anlegen', 'jolly']), ferro_process_command, 'must select an action', 1, 1); break;
		case 'commands': select_add_items(ui_get_ferro_commands(), ferro_process_command, 'must select an action', 1, 1); break;
		case 'group': select_add_items(ui_get_group_items(), ferro_process_group, 'must select cards to reveal', 3, 100); break;

		default: console.log('stage is', stage); break;
	}
}




















