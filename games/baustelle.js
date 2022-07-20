
function take_turn_single() {
	//simplest form: player has modified fen and sends fen to server
	//server updates table
	prep_move();
	let o = { uname: Z.uplayer, friendly: Z.friendly, fen: Z.fen, write_fen:true }; //, notes: notes, scoring: scoring };
	let cmd = 'table';
	send_or_sim(o, cmd);
}
function take_turn_switch_to_host() {
	//fen remains unchanged except for turn and stage, which switches to host
	//server updates table and clears all players data
	prep_move();
	let o = { uname: Z.uplayer, friendly: Z.friendly, fen: Z.fen, players: Z.playerlist }; //, notes: notes, scoring: scoring };
	let cmd = 'clear';
	send_or_sim(o, cmd);
}
function take_turn_start_multi() { take_turn_single(); }
function take_turn_collect_open() {
	//simplest form: player has modified fen and sends fen to server
	//server updates table
	prep_move();
	let o = { uname: Z.uplayer, friendly: Z.friendly, fen: Z.fen, state: Z.state }; 
	let cmd = 'collect_open';
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
function send_or_sim(o, cmd) { if (DA.simulate) phpPostSimulate(o, cmd); else phpPost(o, cmd); }







