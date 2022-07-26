
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









