
function parlay_player_selected() {
	let [A, uplayer, fen] = [Z.A, Z.uplayer, Z.fen];
	let other = fen.other = A.items[A.selected[0]].a;
	fen.maxcards = Math.max(fen.players[other].hand.length, fen.players[uplayer].hand.length);
	Z.stage = 'parlay_select_cards'
	accuse_activate();
}
function parlay_cards_selected() {
	let [A, uplayer, fen] = [Z.A, Z.uplayer, Z.fen];
	let player_cards = fen.player_cards = A.selected.map(x => A.items[x]);
	Z.turn = [fen.other];
	Z.stage = 'parlay_opponent_selects';
	take_turn_fen();
}
function opponent_selected(){
	let opp_cards = A.selected.map(x => A.items[x]);
	//resolve!
	let pl1=fen.players[fen.president];
	let pl2=fen.players[uplayer];
	fen.player_cards.map(x=>removeInPlace(pl1.hand,x))
	fen.player_cards.map(x=>pl2.hand.push(x)); 
	opp_cards.map(x=>removeInPlace(pl2.hand,x))
	opp_cards.map(x=>pl1.hand.push(x)); 
	


}

function accuse_submit_president() {
	let [A, uplayer, fen] = [Z.A, Z.uplayer, Z.fen];
	let action = A.items[A.selected[0]].a;
	//console.log('president', Z.uplayer, 'selects action', action)

	if (action == 'accuse') {
		Z.stage = 'president_accuse';
		accuse_activate();

	} else if (action == 'parlay') {
		Z.stage = 'parlay_select_player';
		accuse_activate();
	}
}
function accuse_submit_accused() {
	let [A, uplayer, fen] = [Z.A, Z.uplayer, Z.fen];
	let plname = A.items[A.selected[0]].a;
	//console.log('president', Z.uplayer, 'accuses', plname);
	fen.accused = plname;
	Z.stage = 'select_accused_color';
	accuse_activate();
}
function accuse_submit_accused_color() {
	let [A, uplayer, fen, accused] = [Z.A, Z.uplayer, Z.fen, Z.fen.accused];
	let color = A.items[A.selected[0]].a;


	//console.log('president', uplayer, 'accused', accused, 'of being', color);

	//now check the color
	let card = fen.players[accused].membership;
	let real_color = get_color_of_card(card);
	if (color == real_color) {
		//guess was correct!
		//president keeps membership card
		//accused needs to replace membership card
		console.log('PRESIDENT GUESSES CORRECTLY!!!')
		Z.turn = [accused];
		console.log(fen.players[uplayer], fen.players[uplayer].hand, card)
		fen.players[uplayer].hand.push(card);
		delete fen.players[accused].membership;
		Z.stage = 'replace_membership_entlarvt';
		take_turn_fen();
	} else {
		console.log('PRESIDENT GUESSES WRONG!!!!!!!!!!!!');
		Z.turn = [accused];
		fen.players[accused].hand.push(card);
		fen.president = accused;
		fen.isprovisional = true;
		delete fen.players[accused].membership;
		Z.stage = 'replace_membership_provisional';
		take_turn_fen();

	}

}
function accuse_replaced_membership() {
	let [A, uplayer, fen, accused] = [Z.A, Z.uplayer, Z.fen, Z.fen.accused];
	let card = A.items[A.selected[0]].a;
	//remove from hand, set membership
	let pl = fen.players[uplayer];
	pl.membership = card;
	removeInPlace(pl.hand, card);
	Z.turn = [fen.president];
	Z.stage = Z.stage == 'replace_membership_entlarvt' ? 'president_cleanup' : 'president';
	take_turn_fen();

}
function accuse_new_session(fen, players) {
	let deck_discard = fen.deck_discard = [];
	let deck_ballots = create_fen_deck('n'); shuffle(deck_ballots);
	let ranks = 'KQJT98765432A';
	let tb = {
		5: ['2', 'T', 7],
		6: ['A', 'T', 6],
		7: ['A', 'T', 5],
		8: ['A', 'T', 5],
		9: ['A', 'K', 5],
		10: ['A', 'K', 5],
		11: ['A', 'K', 4],
		12: ['A', 'K', 4],
		13: ['A', 'K', 4],
	};
	if (nundef(players)) players = get_keys(fen.players);
	let [rmax, rmin, handsize] = tb[players.length];
	let [imin, imax] = [ranks.indexOf(rmin), ranks.indexOf(rmax)];
	//console.log('N',players.length,'minrank',imin,'maxrank',imax)
	deck_ballots = deck_ballots.filter(x => {
		let i = ranks.indexOf(x[0])
		return i >= imin && i <= imax;
	});
	fen.deck_ballots = deck_ballots;
	fen.handsize = handsize;
	//console.log('deck_ballots:::',deck_ballots.length);
	for (const plname in fen.players) {
		let pl = fen.players[plname];
		pl.hand = deck_deal(deck_ballots, handsize);
	}
	fen.policies = [];

}
function accuse_enact_policy() {
	let [A, uplayer, fen, accused] = [Z.A, Z.uplayer, Z.fen, Z.fen.accused];
	let card = isEmpty(A.selected) ? '' : A.items[A.selected[0]].a;

	//this card is chosen as a policy
	if (!isEmpty(card)) {
		lookupAddToList(fen, ['policies'], card);
		removeInPlace(fen.players[uplayer].hand, card);

		//look if last 5 policies are same color =>dominance
		let arr = arrTakeLast(fen.policies, 5);
		let color = arrAllSame(arr, get_color_of_card);
		if (color && arr.length == 5) {
			//session ends here!!! 
			fen.dominance = true;
			lookupAddToList(fen, ['sessions'], color);

			//update score
			for (const plname in fen.players) {
				let pl = fen.players[plname];

				if (get_color_of_card(pl.idleft) == color) pl.score += 1;
				if (get_color_of_card(pl.idright) == color) pl.score += 1;
				if (get_color_of_card(pl.membership) == color) pl.score += 1;
			}

			Z.turn = jsCopy(Z.plorder);
			//Z.phase += 1
			Z.stage = 'round';
			take_turn_fen_clear();


		} else {
			//new poll starts
			//es sollte kein pending geben
			for (const s of ['president', 'isprovisional', 'accused']) delete fen[s];
			Z.stage = 'hand';
			Z.turn = get_players_with_at_least_one_hand_card();//all players that have at least one handcard
			take_turn_fen();
		}


	} else {
		//president die not issue a policy
		//new poll starts
		//es sollte kein pending geben
		for (const s of ['president', 'isprovisional', 'accused']) delete fen[s];
		Z.stage = 'hand';
		Z.turn = get_players_with_at_least_one_hand_card();//all players that have at least one handcard
		take_turn_fen();
	}
}
function get_players_with_at_least_one_hand_card() {
	return get_keys(Z.fen.players).filter(x => Z.fen.players[x].hand.length >= 1);
}
function get_others_with_at_least_one_hand_card() {
	return get_keys(Z.fen.players).filter(x => x.name != Z.uplayer && Z.fen.players[x].hand.length >= 1);
}
function arrAllSame(arr, func) {
	let arr1 = arr.map(x => func(x));
	let sample = arr1[0];
	for (let i = 1; i < arr1.length; i++) if (arr1[i] != sample) return false;
	return sample;
}





















