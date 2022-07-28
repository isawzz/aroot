
function ferro_change_to_buy_pass() {
	let [plorder, stage, A, fen, uplayer] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer];

	//multi data: fen.canbuy, fen.trigger, fen.buyer, fen.nextturn (und playerdata natuerlich!)
	let nextplayer = get_next_player(Z, uplayer); //player after buy_or_pass round

	//newturn is list of players starting with nextplayer
	let newturn = jsCopy(plorder); while (newturn[0] != nextplayer) { newturn = arrCycle(newturn, 1); } //console.log('newturn', newturn);
	fen.canbuy = newturn.filter(x => x != uplayer && fen.players[x].coins > 0); //fen.canbuy list ist angeordnet nach reihenfolge der frage
	fen.trigger = uplayer;
	fen.buyer = null;
	fen.nextturn = [nextplayer];

	[Z.stage, Z.turn] = ['buy_or_pass', fen.canbuy];
	take_turn_init_multi('turn');
}
function ferro_ack_uplayer() {
	let [A, fen, stage, uplayer] = [Z.A, Z.fen, Z.stage, Z.uplayer];
	//console.log('A.selected', A.selected)

	stopPolling();

	// update Z.playerstate (fuer resolve check!) and set Z.state
	let o_pldata = Z.playerdata.find(x => x.name == uplayer);
	Z.state = o_pldata.state = { buy: !isEmpty(A.selected) && A.selected[0] == 0 };

	console.log('playerdata', Z.playerdata);

	//NEIN!FORCE_REDRAW = true; //brauch ich damit ui fuer diesen player weggeht

	//console.log('<===write_player', uplayer, Z.state);

	//hier muss ich checken ob eh schon genug info habe fuer can_resolve!
	let can_resolve = ferro_check_resolve();
	//console.log('===>can_resolve', can_resolve);
	if (can_resolve) {
		assertion(Z.stage == 'buy_or_pass', 'stage is not buy_or_pass when checking can_resolve!');
		console.log('====>buyer found!', fen.buyer);
		Z.stage = 'can_resolve';
		[Z.turn, Z.stage] = [[get_multi_trigger()], 'can_resolve'];
		take_turn_multi_plus_lock();
	} else {
		take_turn_multi();
	}
	//Z.func.state_info(mBy('dTitleLeft')); //rem cons
}
function ferro_check_resolve() {
	let [pldata, stage, A, fen, plorder, uplayer, deck, turn] = [Z.playerdata, Z.stage, Z.A, Z.fen, Z.plorder, Z.uplayer, Z.deck, Z.turn];
	let pl = fen.players[uplayer];

	assertion(stage == 'buy_or_pass', "check_resolve NOT IN buy_or_pass stage!!!!!!!!!");
	assertion(isdef(pldata), "no playerdata in buy_or_pass stage!!!!!!!!!!!!!!!!!!!!!!!");

	let done = true;
	for (const plname of turn) {
		let data = firstCond(pldata, x => x.name == plname);
		assertion(isdef(data), 'no pldata for', plname);
		let state = data.state;

		//console.log('state', plname, state);
		if (isEmpty(state)) done = false;
		else if (state.buy == true) fen.buyer = plname;
		else continue;

		break;
	}
	return done;
}
function ferro_change_to_card_selection() {
	//console.log('ferro_change_to_turn_round_', getFunctionsNameThatCalledThisFunction()); 
	let [pldata, z, fen, stage, uplayer, ui] = [Z.playerdata, Z, Z.fen, Z.stage, Z.uplayer, UI];
	assertion(stage != 'card_selection', "ALREADY IN TURN ROUND!!!!!!!!!!!!!!!!!!!!!!");
	assertion(stage == 'can_resolve', "chenge to card_selection: NOT IN can_resolve stage!!!!!!!!!!!!!!!!!!!!!!");

	// if buyer, buys
	if (isdef(fen.buyer)) {
		let plname = fen.buyer;
		let pl = fen.players[plname];
		let card = fen.deck_discard.shift();
		pl.hand.push(card);
		console.log('buyer', plname, 'should get', card);
		lookupAddToList(pl, ['newcards'], card);
		deck_deal_safe_ferro(fen, plname, 1);
		pl.coins -= 1; //pay
		ari_history_list([`${plname} bought ${card}`], 'buy');
	} else {
		console.log('no buyer...');
	}

	//nextplayer draws
	let nextplayer = fen.nextturn[0];
	deck_deal_safe_ferro(fen, nextplayer, 1);

	Z.turn = fen.nextturn;
	Z.stage = 'card_selection';

	for (const k of ['buyer', 'canbuy', 'nextturn', 'trigger']) delete fen[k];//cleanup buy_or_pass multi-turn!!!!!!!!!!!!!

	clear_transaction();
	take_turn_end_multi();
}










