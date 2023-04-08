var AGAME = {
	stage: {

	}
};
function a_game() {
	function state_info(dParent) { dParent.innerHTML = `turn: ${Z.turn}, stage:${Z.stage}`; } //console.log('fen',Z.fen); }
	function setup(players, options) {
		let fen = { players: {}, plorder: jsCopy(players), history: [] };
		shuffle(fen.plorder);
		let starter = fen.starter = fen.plorder[0];
		let cards_needed = players.length * options.handsize * 1.4;
		fen.num_decks = Math.ceil(cards_needed / 52); //console.log('num_decks', fen.num_decks);
		fen.deck = create_fen_deck('n', fen.num_decks, 0);
		shuffle(fen.deck);
		let [i, n, diff] = [0, players.length, get_slot_diff(fen)];
		for (const plname of players) {
			let pl = fen.players[plname] = {
				hand: deck_deal(fen.deck, options.handsize),
				score: 0,
				name: plname,
				color: get_user_color(plname),
				slot: diff * i,
			};
			i++;
		}
		[fen.phase, fen.stage, fen.step, fen.turn] = ['', 'click', 0, [starter]];
		return fen;
	}
	function present() { present_a_game(); } //console.log('present fen',Z.fen); }
	function check_gameover() { return false; }
	function activate_ui() {
		activate_a_game();
	}
	function post_collect() { agmove_resolve(); } //console.log('YEAH!!!! post_collect',Z); ag_post_collect(); }
	return { post_collect, state_info, setup, present, check_gameover, activate_ui };
}

function present_a_game() {
	let [fen, uplayer, pl] = [Z.fen, Z.uplayer, Z.pl];

	UI.hand = ui_type_hand(pl.hand, dTable, { margin: 20 });
}
function activate_a_game() {
	if (Z.stage == 'click') {
		show_MMM('back to normal!!!!');
		mButton('single turn move', agmove_single, dTable, { margin: 20 });
		mButton('clear players', agmove_clear_all, dTable, { margin: 20 });
		mButton('clear first', agmove_clear_first, dTable, { margin: 20 });
	} else if (Z.stage == 'clear') {
		agmove_startmulti();
	} else {
		//mButton('start multi turn', agmove_startmulti, dTable, { margin: 20 });
		//console.log('stage', Z.stage);
		mButton('indiv move', agmove_indiv, dTable, { margin: 20 });

		//felix_sends_timed_move_at_mimi_slot();
	}

}

function autosend(plname, slot) {
	Z.uplayer = plname;
	take_turn_collect_open();
}
function felix_sends_timed_move_at_mimi_slot() {
	let [fen, pl] = [Z.fen, Z.pl];
	let slot = fen.players.mimi.slot;
	slot = busy_wait_until_slot(slot);
	//console.log('felix will be sending at time',slot, Date.now());
}

function agmove_single() {
	if (Z.pl.hand.length > 2) removeInPlace(Z.pl.hand, Z.pl.hand[0]);
	Z.turn = [get_next_player(Z, Z.uplayer)];
	take_turn_fen();
}
function agmove_startmulti() { Z.stage = 'multi'; Z.turn = Z.plorder;[Z.fen.stage_after_multi, Z.fen.turn_after_multi] = ['click', [rChoose(Z.plorder)]]; take_turn_fen(); }
function agmove_indiv(plname, slot) {
	if (isDict(plname) && Z.uplayer != 'mimi') return; // only mimi can actually click button!!!

	if (isString(plname)) Z.uplayer = plname;
	console.log('sender:', Z.uplayer);

	let pl = Z.fen.players[Z.uplayer];
	Z.state = { val: pl.hand[0] };

	if (nundef(slot)) slot = busy_wait_until_slot(pl.slot);
	console.log('time sending:', slot, Date.now());

	take_turn_collect_open();

	if (plname != 'felix') agmove_indiv('felix', pl.slot);
	//autosend('felix');
}
function agmove_resolve() {

	console.log('---------------------- RESOLVE ----------------------');
	assertion(isdef(Z.playerdata), 'no playerdata');
	assertion(Z.uplayer == Z.fen.acting_host, 'wrong player resolves!!!!', Z.uplayer);

	let [fen, uplayer, pl, pldata] = [Z.fen, Z.uplayer, Z.pl, Z.playerdata];

	//blablabl game specific code
	fen.collection = [];
	for (const data of pldata) {
		fen.collection.push({ name: data.name, state: data.state });
	}
	console.log('players selected the following cards:', fen.collection);

	//common code for resolve!!!
	[Z.stage, Z.turn] = [Z.fen.stage_after_multi, Z.fen.turn_after_multi];
	take_turn_resolve('single');
}

function busy_wait_until_slot(slot) {
	let diff = get_slot_diff(Z.fen);
	let dd;
	do {
		dd = last_n_digits(Date.now(), 2);
		if (dd >= slot && dd <= slot + diff) { break; }

	} while (true);
	return dd;
}
function last_n_digits(number, n = 2) {
	return number % Math.pow(10, n);
}
function get_now_milliseconds() {
	return Date.now();
}
function get_slot_diff(fen) { return Math.floor(100 / fen.plorder.length); }



//#region removed from necessity!!!!!!!!
function agmove_clear_all() { Z.stage = 'clear'; Z.fen.endcond = 'all'; Z.fen.acting_host = Z.uplayer; Z.turn = [Z.uplayer]; take_turn_clear(); }
function agmove_clear_first() { Z.stage = 'clear'; Z.fen.endcond = 'first'; Z.fen.acting_host = Z.uplayer; Z.turn = [Z.uplayer]; take_turn_clear(); }
function agmove_clear_turn() { Z.stage = 'clear'; Z.fen.endcond = 'turn'; Z.fen.acting_host = Z.uplayer; Z.turn = [Z.uplayer]; take_turn_clear(); }

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
	let o = { uname: Z.uplayer, friendly: Z.friendly, fen: Z.fen, write_fen: true, write_notes: notes };
	let cmd = 'table';
	send_or_sim(o, cmd);
}
function take_turn_ack() {
	prep_move();
	let o = { uname: Z.uplayer, friendly: Z.friendly, fen: Z.fen, state: { ack: true }, write_player: true };
	let cmd = 'table';
	send_or_sim(o, cmd);
}












