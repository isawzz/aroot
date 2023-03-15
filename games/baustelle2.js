

function accuse_evaluate_votes() {
	let [stage, A, fen, phase, uplayer, turn, uname, host] = [Z.stage, Z.A, Z.fen, Z.phase, Z.uplayer, Z.turn, Z.uname, Z.host];
	assertion(uplayer == host && fen.cardsrevealed, 'NOT THE STARTER WHO COMPLETES THE STAGE!!!')
	let votes = [];
	for (const pldata of Z.playerdata) {
		let plname = pldata.name;
		let card = pldata.state.card;
		if (!isEmpty(card)) votes.push({ plname: plname, card: card });
		else removeInPlace(fen.validvoters, plname);
	}
	ari_history_list(votes.map(x => `${x.plname} ${x.card}`), 'poll');

	//resolve votes
	//0. check if unsuccessful (no votes)
	if (isEmpty(votes)) { eval_empty_votes(votes); return; }

	//1. check if all votes same color (consensus)
	let color = arrSame(votes, x => get_color_of_card(x.card));
	if (color) { eval_consensus(votes, color); return; }

	//2. check single winner if any (presidency)
	//sort votes by rank
	let ranks = 'KQJT98765432A';
	let vsorted = sortByFunc(votes, x => ranks.indexOf(x.card[0]));
	//schau ob eindeutig!
	let winning_vote = vsorted[0];
	if (votes.length > 1 && vsorted[1].card[0] == vsorted[0].card[0]) {
		winning_vote = null;
	}
	if (winning_vote) {
		let plwinner = winning_vote.plname;
		console.log('...WINNER PRESIDENT!!!!!!!!!!!!!', plwinner, winning_vote.card);
		//return all pending cards (from previous votes) to resp hands
		for (const plname in fen.players) {
			let pl = fen.players[plname];
			if (!isEmpty(pl.pending)) pl.pending.map(x => pl.hand.push(x));
			delete pl.pending;
		}
		//discard winning vote
		removeInPlace(fen.players[plwinner].hand, winning_vote.card);
		fen.deck_discard.push(winning_vote.card);
		fen.president = plwinner;
		fen.isprovisional = false;
		ari_history_list(`${plwinner} wins presidency!`, 'president');
		Z.turn = [plwinner];
		Z.stage = 'president';
		take_turn_fen_clear();
		return;
	}

	// console.log('STOP! Tie!!!!!!!!!!!!!', vsorted); return;
	//console.log('Tie!!!!!!!!!!!!!', vsorted);
	ari_history_list(`tie!`, 'new poll round');
	//played cards go into pending
	for (const v of vsorted) {
		let plname = v.plname;
		let pl = fen.players[plname];
		lookupAddToList(pl, ['pending'], v.card)
		removeInPlace(pl.hand, v.card);
	}
	//stage goes to hand
	Z.turn = get_valid_voters(); //vsorted.map(x => x.plname); //only active voters remain in poll
	Z.stage = 'hand';
	fen.cardsrevealed = false;
	take_turn_fen_clear();


}

function accuse_show_selected_state(state) {
	let [fen, uplayer, stage] = [Z.fen, Z.uplayer, Z.stage];
	let mystate = state.card;
	if (!isEmpty(mystate)) {
		let handui = lookup(UI, ['players', uplayer, 'hand']);
		let items = handui.items;
		let cardui = items.find(x => x.key == mystate)
		if (stage == 'hand' && isdef(cardui)) make_card_selected(cardui);
		else if (stage == 'membership' && isdef(cardui)) make_card_selected(cardui);
		else mDiv(dTable, {}, null, 'WAITING FOR PLAYERS TO COMPLETE....');
	}
}














