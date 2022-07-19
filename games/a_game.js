var AGAME = {
	stage: {

	}
};
function a_game() {
	function state_info(dParent) { dParent.innerHTML = `turn: ${Z.turn}`; } //console.log('fen',Z.fen); }
	function setup(players, options) {
		let fen = { players: {}, plorder: jsCopy(players), history: [] };
		shuffle(fen.plorder);
		let starter = fen.starter = fen.plorder[0];
		let cards_needed = players.length * options.handsize * 1.4;
		fen.num_decks = Math.ceil(cards_needed / 52); //console.log('num_decks', fen.num_decks);
		fen.deck = create_fen_deck('n', fen.num_decks, 0);
		shuffle(fen.deck);

		for (const plname of players) {
			let pl = fen.players[plname] = {
				hand: deck_deal(fen.deck, options.handsize),
				score: 0,
				name: plname,
				color: get_user_color(plname),
			};
		}
		[fen.phase, fen.stage, fen.step, fen.turn] = ['', 'click', 0, [starter]];
		return fen;
	}
	function present() { present_a_game(); } //console.log('present fen',Z.fen); }
	function check_gameover() { return false; }
	function activate_ui() {
		if (Z.stage == 'click') {
			show_MMM('back to normal!!!!');
			mButton('single turn move', agmove_single, dTable, { margin: 20 });
			mButton('clear players', agmove_clear, dTable, { margin: 20 });
		} else if (Z.stage == 'clear') {
			agmove_startmulti();
		} else {
			//mButton('start multi turn', agmove_startmulti, dTable, { margin: 20 });
			console.log('stage', Z.stage);
			mButton('indiv move', agmove_indiv, dTable, { margin: 20 });
			//mButton('resolve', agmove_resolve, dTable, { margin: 20 });
		}

	}
	function post_collect() { agmove_resolve(); } //console.log('YEAH!!!! post_collect',Z); ag_post_collect(); }
	return { post_collect, state_info, setup, present, check_gameover, activate_ui };
}

function present_a_game() {
	let [fen, uplayer, pl] = [Z.fen, Z.uplayer, Z.pl];

	UI.hand = ui_type_hand(pl.hand, dTable, { margin: 20 });
}

function agmove_single() { removeInPlace(Z.pl.hand, rChoose(Z.pl.hand)); Z.turn = [get_next_player(Z, Z.uplayer)]; take_turn_single(); }
function agmove_clear() { Z.stage = 'clear'; Z.fen.acting_host = Z.uplayer; Z.turn = [Z.uplayer]; take_turn_switch_to_host(); }
function agmove_startmulti() { Z.stage = 'multi'; Z.turn = Z.plorder;[Z.fen.stage_after_collect, Z.fen.turn_after_collect] = ['click', [rChoose(Z.plorder)]]; take_turn_start_multi(); }
function agmove_indiv() { Z.state = Z.pl.hand[0]; take_turn_collect_open(); }
function agmove_resolve() {

	console.log('---------------------- RESOLVE ----------------------');

	let [fen, uplayer, pl, pldata] = [Z.fen, Z.uplayer, Z.pl, Z.playerdata];

	assertion(isdef(Z.playerdata), 'no playerdata');

	fen.collection = [];
	for (const data of pldata) {
		fen.collection.push({ name: data.name, state: data.state });
	}

	console.log('players selected the following cards:', fen.collection);


	[Z.stage, Z.turn] = [Z.fen.stage_after_collect, Z.fen.turn_after_collect];
	take_turn_single();
}














