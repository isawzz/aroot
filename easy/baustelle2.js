
function end_of_round_fritz(plname) {
	//console.log('fritz_round_over', plname);
	let [A, fen, uplayer, plorder] = [Z.A, Z.fen, Z.uplayer, Z.plorder];
	let pl = fen.players[uplayer];

	calc_fritz_score();
	ari_history_list([`${plname} wins the round`], 'action');
	fen.round_winner = plname;

	plorder = fen.plorder = jsCopy(fen.roundorder); //restore fen.plorder to contain all players
	Z.round += 1;

	if (Z.round > fen.maxrounds) {
		//game end!
		fen.winners = find_players_with_min_score();
		ari_history_list([`game over: ${fen.winners.join(', ')} win${fen.winners.length == 1 ? 's' : ''}`], 'action');
		Z.stage = 'game_over';
		console.log('end of game: stage', Z.stage, '\nplorder', fen.plorder, '\nturn', Z.turn);
	} else {
		//next round
		let starter = fen.starter = get_next_in_list(fen.starter, plorder);
		console.log('starter', starter);
		Z.turn = [starter];
		fritz_new_table(fen, Z.options);
		fritz_new_player_hands(fen, Z.turn[0], Z.options);
	}
}

















