
function take_turn_single() {
	prep_move();
	let o = { uname: Z.uplayer, friendly: Z.friendly, fen: Z.fen, write_fen:true }; 
	//console.log('sending', o);
	let cmd = 'table';
	send_or_sim(o, cmd);
}
function take_turn_clear() {
	prep_move();
	let o = { uname: Z.uplayer, friendly: Z.friendly, fen: Z.fen, players: Z.playerlist }; 
	let cmd = 'clear';
	send_or_sim(o, cmd);
}
function take_turn_collect_open() {
	prep_move();
	let o = { uname: Z.uplayer, friendly: Z.friendly, fen: Z.fen, state: Z.state, write_player: true }; 
	let cmd = 'table';
	send_or_sim(o, cmd);
}
function take_turn_resolve(notes) {
	prep_move();
	let o = { uname: Z.uplayer, friendly: Z.friendly, fen: Z.fen, write_fen:true, write_notes:notes }; 
	let cmd = 'table';
	send_or_sim(o, cmd);
}
function take_turn_spotit() {
	prep_move();
	//console.log('take_turn_spotit','should be writing',Z.state,'for',Z.uplayer);
	let o = { uname: Z.uplayer, friendly: Z.friendly, fen: Z.fen, state: Z.state, write_player: true, write_fen: true }; 
	let cmd = 'table';
	send_or_sim(o, cmd);
}
function take_turn_ack() {
	prep_move();
	//console.log('take_turn_spotit','should be writing',Z.state,'for',Z.uplayer);
	let o = { uname: Z.uplayer, friendly: Z.friendly, fen: Z.fen, state: {ack:true}, write_player: true }; 
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
function send_or_sim(o, cmd) { if (DA.simulate) phpPostSimulate(o, cmd); else phpPost(o, cmd); }





