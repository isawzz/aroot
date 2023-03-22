
function accuse_ai_move(bot) {
	let [pl, fen, stage] = [Z.fen.players[bot], Z.fen, Z.stage];
	if (stage == 'hand') {
		//this is where hand card or empty can be played
		pl.move = { state: { item: '' } }
	} else if (stage == 'membership') {
		//this is where a membership card has to be chosen
	}
}









