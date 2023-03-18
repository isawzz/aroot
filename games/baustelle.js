

function start_new_generation(fen, players) {
	let deck_discard = fen.deck_discard = [];
	//let deck_ballots = create_fen_deck('n'); shuffle(deck_ballots);
	let ranks = fen.ranks; // 'KQJT98765432A';
	let tb = {
		5: ['4', 'T', 6, 2, 1],
		6: ['2', 'T', 6, 0, 1],
		7: ['A', 'T', 6, 2, 1],
		8: ['2', 'K', 6, 0, 1],
		9: ['A', 'K', 6, 0, 1],
		10: ['2', 'K', 5, 2, 1],
		11: ['A', 'K', 5, 3, 1],
		12: ['2', '8', 5, 4, 2],
		13: ['2', '9', 5, 2, 2],
		14: ['2', '9', 5, 2, 2], //add 4 10s
	};
	if (nundef(players)) players = get_keys(fen.players);
	let N = players.length;

	let deck_ballots = [];
	let [r0, r1, handsize, jo, numdecks] = tb[N];

	for (let i = ranks.indexOf(r0); i <= ranks.indexOf(r1); i++) {
		for (let nd = 0; nd < numdecks; nd++) {
			let c = ranks[i];
			for (const suit of 'SHDC') { deck_ballots.push(c + suit + 'n'); }
		}
	}
	if (N == 14) { for (const suit of 'SHDC') { deck_ballots.push('T' + suit + 'n'); } }
	for (let i = 0; i < jo; i++) { deck_ballots.push('A' + (i % 2 ? 'H' : 'S') + 'n'); }  //'' + (i%2) + 'J' + 'n');

	console.log('deck', deck_ballots);

	//#region old
	// let [rmax, rmin, handsize] = isdef(tb[N]) ? tb[N] : ['A', 'K', Math.min(8, Math.floor(52 / N))];

	// //modiy handsize options.handsize
	// //handsize += Number(fen.inc_handsize_by);

	// let [imin, imax] = [ranks.indexOf(rmin), ranks.indexOf(rmax)];
	// //console.log('N',players.length,'minrank',imin,'maxrank',imax)
	// deck_ballots = deck_ballots.filter(x => {
	// 	let i = ranks.indexOf(x[0])
	// 	return i >= imin && i <= imax;
	// });
	//#endregion

	fen.deck_ballots = deck_ballots;
	fen.handsize = handsize;
	//console.log('deck_ballots:::',deck_ballots.length);
	for (const plname in fen.players) {
		let pl = fen.players[plname];
		pl.hand = deck_deal(deck_ballots, handsize);
		//hzcontrol(pl.hz=handsize;
	}
	fen.policies = [];
	fen.validvoters = jsCopy(players)
	delete fen.president;
	delete fen.newpresident;
	delete fen.isprovisional;
	delete fen.player_cards;
	delete fen.accused;
	delete fen.dominance;

	//ari_history_list(`*** generation ${fen.phase} starts ***`,'',fen)

}
function start_new_poll() {
	Z.stage = 'hand';
	Z.fen.cardsrevealed = false;
	Z.fen.crisis = 0;
	Z.turn = get_valid_voters();
	//console.log('...turn', Z.turn)
	take_turn_fen_clear();

}


















