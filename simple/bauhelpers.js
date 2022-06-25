
function set_journey_or_stall_stage(fen, options, phase) {
	//check if any player has a potential journey!
	let pljourney = options.journey == 'yes' ? find_players_with_potential_journey(fen) : [];
	console.log('________ any journey?', pljourney)
	if (isEmpty(pljourney)) {
		z.turn = fen.turn = [fen.plorder[0]];
		ari_ensure_deck(fen, phase == 'jack' ? 3 : 2);
		fen.stage = 3;
	} else {
		z.turn = fen.turn = [pljourney[0]];
		fen.stage = 1;
		//fen.players[fen.plorder[0]].hand.push('JSo');		//fen.players[fen.plorder[0]].hand.push('5Co');
	}
	//if (isdef(z)) z.turn = fen.turn;
	z.stage = fen.stage;
	return fen.stage;
}




























