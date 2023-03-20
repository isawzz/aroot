
function eval_tie(max_votes,votes){
	let [stage, A, fen, phase, uplayer, turn, uname, host] = [Z.stage, Z.A, Z.fen, Z.phase, Z.uplayer, Z.turn, Z.uname, Z.host];

	//console.log('Tie!!!!!!!!!!!!!', vsorted);
	ari_history_list('tie! new poll round','poll');

	//played cards go into pending
	for (const v of votes) {
		let plname = v.plname;
		let pl = fen.players[plname];
		lookupAddToList(pl, ['pending'], v.card)
		removeInPlace(pl.hand, v.card);
	}
	start_new_poll();

}
function eval_president(winning_vote){
	let [stage, A, fen, phase, uplayer, turn, uname, host] = [Z.stage, Z.A, Z.fen, Z.phase, Z.uplayer, Z.turn, Z.uname, Z.host];

	let plwinner = winning_vote.plname;
	//console.log('...WINNER PRESIDENT!!!!!!!!!!!!!', plwinner, winning_vote.card);
	//return all pending cards (from previous votes) to resp hands
	for (const plname in fen.players) {
		let pl = fen.players[plname];
		if (isdef(pl.pending) && !isEmpty(pl.pending)) pl.pending.map(x => pl.hand.push(x));
		delete pl.pending;
	}
	//discard winning vote
	removeInPlace(fen.players[plwinner].hand, winning_vote.card);
	fen.deck_discard.push(winning_vote.card);
	fen.president = plwinner;
	fen.players[plwinner].experience+=1;
	fen.isprovisional = false;
	ari_history_list(`${plwinner} wins presidency!`, 'president');
	Z.turn = [plwinner];
	Z.stage = 'president';
	take_turn_fen_clear();
}
function eval_consensus(votes, color) {
	let [stage, A, fen, phase, uplayer, turn, uname, host] = [Z.stage, Z.A, Z.fen, Z.phase, Z.uplayer, Z.turn, Z.uname, Z.host];

	//check ob es eindeutiges maximum rank gibt
	let vsorted = sortCardObjectsByRankDesc(votes, fen.ranks, 'card');
	//console.log(vsorted.map(x => x.card));
	//console.log('...CONSENSUS!!!!!!!!!!!!!', color, votes);

	let opt = valf(Z.options.consensus, 'policy');

	if (opt == 'policy') {
		fen.policies.push(color == 'red' ? 'QDn' : 'QSn'); //last_policy);
		fen.validvoters = jsCopy(Z.plorder);
		check_enough_policies_or_start_new_poll(`consensus on ${color}`);
		// let end = check_enough_policies();
		// //console.log('enough policies', end)
		// if (!end) { start_new_poll(); }
	} else if (opt == "coupdetat") {
		let ace_present = vsorted.find(x => is_ace(x.card));
		//console.log('ace_present', ace_present);
		if (isdef(ace_present)) {
			ari_history_list(`coup succeeded! ${color} wins!`, 'generation ends');
			accuse_score_update(color);
			Z.turn = jsCopy(Z.plorder);
			Z.stage = 'round';
			take_turn_fen_clear();
		} else { //just add a policy
			fen.policies.push(color == 'red' ? 'QDn' : 'QSn');
			fen.validvoters = jsCopy(Z.plorder);
			check_enough_policies_or_start_new_poll(`consensus on ${color}`);
			// let end = check_enough_policies();
			// if (!end) { start_new_poll(); }
		}
	} else if (opt == 'generation') {
		ari_history_list(`consensus on ${color}!`, 'generation ends');
		accuse_score_update(color);
		Z.turn = jsCopy(Z.plorder);
		Z.stage = 'round';
		take_turn_fen_clear();
	} else if (opt == 'playerpolicy') { // opt == 'policy'
		//what if there is a tie?
		let tie = vsorted.length > 1 && getRankOf(vsorted[0].card) == getRankOf(vsorted[1].card);
		if (tie) {
			//need to go into a dialogue: each of the tied players must select a victim (tied player) who will pay!
			let maxrank = getRankOf(vsorted[0].card);
			let tied_votes = arrTakeWhile(vsorted, x => getRankOf(x.card) == maxrank);
			let tied_players = tied_votes.map(x => x.plname);
			console.log('tied', tied_votes, tied_players);
			Z.turn = tied_players;
			Z.stage = 'tied_consensus';
			fen.tied_votes = tied_votes;
			take_turn_fen_clear();
		} else {
			let winner = vsorted[0];
			//remove winning vote from player hand and add it to policies!
			fen.policies.push(winner.card);
			removeInPlace(fen.players[winner.plname].hand, winner.card);
			fen.validvoters = jsCopy(Z.plorder);
			check_enough_policies_or_start_new_poll(`consensus on ${color}`);
			// let end = check_enough_policies();
			// //console.log('enough policies', end)
			// if (!end) { start_new_poll(); }
		}
	}
}















