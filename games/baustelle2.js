
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

	if (Z.mode == 'multi') { [Z.stage, Z.turn] = ['buy_or_pass', fen.canbuy]; take_turn_init_multi('turn'); }
	else {
		fen.canbuy.map(x => fen.players[x].buy = 'unset');
		fen.lastplayer = arrLast(fen.canbuy);
		[Z.stage, Z.turn] = ['buy_or_pass', [fen.canbuy[0]]];
		take_turn_single();
	}
}
function ferro_ack_uplayer() { if (Z.mode == 'multi') { ferro_ack_uplayer_multi(); } else { ferro_ack_uplayer_hotseat(); } }
function ferro_ack_uplayer_multi() {
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
function ferro_ack_uplayer_hotseat() {
	let [A, fen, uplayer] = [Z.A, Z.fen, Z.uplayer];
	let buy = !isEmpty(A.selected) && A.selected[0] == 0;
	if (buy) { fen.buyer = uplayer; [Z.turn, Z.stage] = [[get_multi_trigger()], 'can_resolve']; }
	if (uplayer == fen.lastplayer) { [Z.turn, Z.stage] = [[get_multi_trigger()], 'can_resolve']; }
	else { Z.turn = [get_next_in_list(uplayer, fen.canbuy)]; }
	take_turn_single();
}
function ferro_change_to_card_selection() {
	let [fen, stage] = [Z.fen, Z.stage];
	assertion(stage != 'card_selection', "ALREADY IN TURN ROUND!!!!!!!!!!!!!!!!!!!!!!");
	assertion(stage == 'can_resolve', "chenge to card_selection: NOT IN can_resolve stage!!!!!!!!!!!!!!!!!!!!!!");

	// if buyer, buys
	if (isdef(fen.buyer)) {
		let plname = fen.buyer;
		let pl = fen.players[plname];
		let card = fen.deck_discard.shift();
		pl.hand.push(card);
		//console.log('buyer', plname, 'should get', card);
		lookupAddToList(pl, ['newcards'], card);
		deck_deal_safe_ferro(fen, plname, 1);
		pl.coins -= 1; //pay
		ari_history_list([`${plname} bought ${card}`], 'buy');
	} 

	//nextplayer draws
	let nextplayer = fen.nextturn[0];	deck_deal_safe_ferro(fen, nextplayer, 1);

	Z.turn = fen.nextturn;
	Z.stage = 'card_selection';

	for (const k of ['buyer', 'canbuy', 'nextturn', 'trigger', 'lastplayer']) delete fen[k];//cleanup buy_or_pass multi-turn!!!!!!!!!!!!!

	clear_transaction();
	if (Z.mode == 'multi') take_turn_end_multi(); else take_turn_single();
}










