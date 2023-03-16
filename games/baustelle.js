
function consensus_vote_payer() {
	let [A, uplayer, fen] = [Z.A, Z.uplayer, Z.fen];
	let plname = A.items[A.selected[0]].a;
	console.log('player', Z.uplayer, 'selects', plname);
	Z.state = { item: plname };
	ari_history_list(`${uplayer} selects ${plname}`, 'consensus tie');
	take_turn_multi();

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
		let end = check_enough_policies();
		//console.log('enough policies', end)
		if (!end) { start_new_poll(); }
	} else if (opt == "coupdetat") {
		let ace_present = vsorted.find(x => is_ace(x.card));
		console.log('ace_present', ace_present);
		if (isdef(ace_present)) {
			ari_history_list(`coup d'etat succeeded! session to ${color}!`, 'session ends');
			accuse_score_update(color);
			Z.turn = jsCopy(Z.plorder);
			Z.stage = 'round';
			take_turn_fen_clear();
		} else { //just add a policy
			fen.policies.push(color == 'red' ? 'QDn' : 'QSn'); 
			fen.validvoters = jsCopy(Z.plorder);
			let end = check_enough_policies();
			if (!end) { start_new_poll(); }
		}
	} else if (opt == 'session') {
		ari_history_list(`consensus on ${color}!`, 'session ends');
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
			let end = check_enough_policies();
			//console.log('enough policies', end)
			if (!end) { start_new_poll(); }
		}
	}
}

function eval_empty_votes(votes) {
	let [stage, A, fen, phase, uplayer, turn, uname, host] = [Z.stage, Z.A, Z.fen, Z.phase, Z.uplayer, Z.turn, Z.uname, Z.host];
	//console.log('pldata', Z.playerdata.map(x => x.state))
	//console.log('EMPTY VOTES!!!!!!!!!!!!!');
	let opt = valf(Z.options.empty_vote, 'add policy');
	if (opt == 'blank' || isEmpty(fen.policies)) {
		ari_history_list(`no votes!`, 'session ends blank');
		accuse_score_update('white')
		Z.turn = jsCopy(Z.plorder);
		Z.stage = 'round';
		take_turn_fen_clear();
	} else if (opt == 'add policy') {
		let last_policy = arrLast(fen.policies);
		console.log('add policy, last:', last_policy)
		fen.policies.push(last_policy);
		fen.validvoters = jsCopy(Z.plorder);
		let end = check_enough_policies();
		console.log('enough policies', end)
		if (!end) { start_new_poll(); }
	} else { //session end: last policy color wins!
		let color = get_color_of_card(arrLast(fen.policies))
		ari_history_list(`no votes!`, `session ends ${color}`);
		accuse_score_update(color)
		Z.turn = jsCopy(Z.plorder);
		Z.stage = 'round';
		take_turn_fen_clear();
	}

}
function start_new_poll() {
	Z.stage = 'hand';
	Z.fen.cardsrevealed = false;
	Z.turn = get_valid_voters();
	//console.log('...turn', Z.turn)
	take_turn_fen_clear();

}
function check_enough_policies() {
	let [stage, A, fen, phase, uplayer, turn, uname, host] = [Z.stage, Z.A, Z.fen, Z.phase, Z.uplayer, Z.turn, Z.uname, Z.host];
	//look if last X policies are same color =>dominance
	let arr = arrTakeLast(fen.policies, fen.policies_needed);
	let color = arrAllSame(arr, get_color_of_card);
	if (color && arr.length >= fen.policies_needed) {
		//session ends here!!! 
		fen.dominance = true;
		ari_history_list(`${color} dominance reached!`, 'session ends')

		//update score
		accuse_score_update(color);
		Z.turn = jsCopy(Z.plorder);
		//Z.phase += 1
		Z.stage = 'round';
		take_turn_fen_clear();
		return true;

	} else {
		return false;
	}

}








