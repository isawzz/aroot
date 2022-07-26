
function take_turn_single() {
	prep_move();
	let o = { uname: Z.uplayer, friendly: Z.friendly, fen: Z.fen, write_fen: true };
	//console.log('sending', o);
	let cmd = 'table';
	send_or_sim(o, cmd);
}
function take_turn_spotit() {
	prep_move();
	let o = { uname: Z.uplayer, friendly: Z.friendly, fen: Z.fen, state: Z.state, write_player: true, write_fen: true };
	let cmd = 'table';
	send_or_sim(o, cmd);
}

function query_status() {
	prep_move();
	let o = { uname: Z.uname, friendly: Z.friendly };
	let cmd = 'collect_status';
	send_or_sim(o, cmd);
}
function prep_move() {
	let [fen, uplayer, pl] = [Z.fen, Z.uplayer, Z.pl];
	for (const k of ['round', 'phase', 'stage', 'step', 'turn']) { fen[k] = Z[k]; }
	deactivate_ui();
	clear_timeouts();
}
function send_or_sim(o, cmd) {
	Counter.server += 1;
	//console.log(`send_or_sim ${Counter.server} apiserver`, getFunctionsNameThatCalledThisFunction(), o);

	//assertion(isdef(Z), "Z is undefined in send_or_sim!!!!!!!"); //NEIN weil kann ja first load table aus tables
	//if (nundef(Z) || Z.turn.length > 1) {o.read_players = true; console.log('added read_players'); }

	// if (isdef(Z)) {
	// 	assertion(isdef(Z.fen) && isdef(Z.uplayer), 'send_or_sim: fen and uplayer must be defined');
	// 	if (lookup(Z.fen, ['multi', 'trigger']) == Z.uplayer) {
	// 		//console.log('YEAHHHHHHHHHHHHHHHHHHHHH');
	// 		o.read_players = true;
	// 	}
	// }


	if (DA.simulate) phpPostSimulate(o, cmd); else phpPost(o, cmd);
}





