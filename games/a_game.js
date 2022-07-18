var AGAME={
	stage:	{

	}
};
function a_game() {
	function state_info(dParent) { } //console.log('fen',Z.fen); }
	function setup(players, options) {
		let fen = { players: {}, plorder: jsCopy(players), history: [] };
		shuffle(fen.plorder);
		let starter = fen.starter = fen.plorder[0];
		let cards_needed = players.length*options.handsize * 1.4;
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
	function activate_ui() { onclick=()=>console.log('clicked') }
	return { state_info, setup, present, check_gameover, activate_ui };
}

function present_a_game(){
	let [fen,uplayer,pl]=[Z.fen,Z.uplayer,Z.pl];

	UI.hand = ui_type_hand(pl.hand,dTable,{margin:20});
	UI.button = mButton('single turn move',agmove_single,dTable,{margin:20});
}

function agmove_single(){
	let [fen,uplayer,pl]=[Z.fen,Z.uplayer,Z.pl];
	removeInPlace(pl.hand,rChoose(pl.hand));
	console.log('move_data',Z.move_data);

	take_turn_single();
	
}















