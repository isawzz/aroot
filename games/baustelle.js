
function eval_consensus(votes,color){
	let [stage, A, fen, phase, uplayer, turn, uname, host] = [Z.stage, Z.A, Z.fen, Z.phase, Z.uplayer, Z.turn, Z.uname, Z.host];
	
	//check ob es eindeutiges maximum rank gibt
	let vsorted = sortByFunc(votes,x=>fen.ranks.indexOf(x.card[0]));
	console.log(vsorted.map(x=>x.card));


	console.log('...CONSENSUS!!!!!!!!!!!!!', color, votes);
	ari_history_list(`consensus on ${color}!`, 'session ends');
	accuse_score_update(color);
	Z.turn = jsCopy(Z.plorder);
	Z.stage = 'round';
	take_turn_fen_clear();
}
function eval_empty_votes(votes) {
	let [stage, A, fen, phase, uplayer, turn, uname, host] = [Z.stage, Z.A, Z.fen, Z.phase, Z.uplayer, Z.turn, Z.uname, Z.host];
	console.log('EMPTY VOTES!!!!!!!!!!!!!');
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
		console.log('enough policies',end)
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
	console.log('...turn',Z.turn)
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








