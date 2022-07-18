

function take_turn_single() {
	//simplest form: player has modified fen and sends fen to server
	//server updates table
	prep_move();
	let o = { uname: Z.uplayer, friendly: Z.friendly, fen: Z.fen }; //, notes: notes, scoring: scoring };
	let cmd = 'single';
	send_or_sim(o, cmd);
}


function prep_move() {
	let [fen, uplayer, pl] = [Z.fen, Z.uplayer, Z.pl];
	for (const k of ['round', 'phase', 'stage', 'step', 'turn']) { fen[k] = Z[k]; }
	deactivate_ui();
	clear_timeouts();
}
function send_or_sim(o, cmd) { if (DA.simulate) phpPostSimulate(o, cmd); else phpPost(o, cmd); }







