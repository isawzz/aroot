
function take_turn_single() { take_turn(); }

function take_turn_spotit() { take_turn(true, true); }

function take_turn_init_multi(endcond = 'turn') { take_turn(true, false, false, `indiv_${endcond}`, true); }

function take_turn_lock_multi() { take_turn(true, false, true, 'lock'); }

function take_turn_multi_plus_lock() { take_turn(true, true, false, 'lock'); }

function take_turn_end_multi() { take_turn(true, false, false, '', true); }

function take_turn_multi() { if (isdef(Z.state)) take_turn(false, true); else take_turn(false, false, true); }


function take_turn(write_fen = true, write_player = false, read_players = false, write_notes = null, clear_players = false) {
	prep_move();
	let o = { uname: Z.uplayer, friendly: Z.friendly };
	if (isdef(Z.fen)) o.fen = Z.fen;
	if (write_fen) o.write_fen = true;
	if (isdef(write_notes)) { o.write_notes = write_notes;console.log('JA');}
	if (write_player) { o.write_player = true; o.state = Z.state; }
	if (read_players) o.read_players = true;
	if (clear_players) o.clear_players = true;

	//console.log('sending', o);
	let cmd = 'table';
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
	if (nundef(Z) || is_multi_stage()) o.read_players = true;
	if (DA.simulate) phpPostSimulate(o, cmd); else phpPost(o, cmd);
}





