function accuse() {
	function state_info() { return; }
	function setup(players, options) {
		console.log('SETUP!!!!!!!!!!!!!!!!!!!')
		let fen = { players: {}, plorder: jsCopy(players), history: [], num: options.num };
		//shuffle(fen.plorder);
		let starter = fen.starter = fen.plorder[0];
		let deck_ballots = create_fen_deck('n'); shuffle(deck_ballots);
		let num = Math.ceil(players.length / 2)
		let deck_identities = fen.deck_identities = [];
		let ranks = 'KQJT98765432A';
		for (let i = 0; i < num; i++) { deck_identities.push(ranks[i] + 'Hl'); deck_identities.push(ranks[i] + 'Sl'); }
		shuffle(deck_identities);

		tb = {
			5: ['2', 'T', 7],
			6: ['A', 'T', 6],
			7: ['A', 'T', 5],
			8: ['A', 'T', 5],
			9: ['A', 'K', 5],
			10: ['A', 'K', 5],
			11: ['A', 'K', 4],
			12: ['A', 'K', 4],
			13: ['A', 'K', 4],
		};
		let [rmax, rmin, handsize] = tb[players.length];
		let [imin, imax] = [ranks.indexOf(rmin), ranks.indexOf(rmax)];
		console.log('N',players.length,'minrank',imin,'maxrank',imax)
		deck_ballots = deck_ballots.filter(x => {
			let i = ranks.indexOf(x[0])
			return i>=imin && i<=imax;
		});
		fen.deck_ballots=deck_ballots;
		fen.handsize = handsize;
		console.log('deck_ballots:::',deck_ballots.length);

		for (const plname of players) {
			let pl = fen.players[plname] = {
				score: 0,
				name: plname,
				idright: deck_deal(deck_identities, 1)[0],
				hand: deck_deal(deck_ballots, handsize),
				color: get_user_color(plname),
			};
		}

		//each player gets idright = idleft of next player
		for (let i = 0; i < players.length; i++) {
			let j = (i + 1) % players.length;
			fen.players[players[i]].idleft = fen.players[players[j]].idright;
		}

		[fen.phase, fen.stage, fen.step, fen.turn] = ['one', 'write', 0, jsCopy(fen.plorder)];
		return fen;
	}
	function check_gameover() { return false; }
	return { state_info, setup, present: accuse_present, check_gameover, activate_ui: accuse_activate };
}

function accuse_present(dParent) {
	let [fen, ui, stage, uplayer] = [Z.fen, UI, Z.stage, Z.uplayer];
	let [dOben, dOpenTable, dMiddle, dRechts] = tableLayoutMR(dParent, 1, 0); ///tableLayoutOMR(dParent, 5, 1);
	let dt = dTable = dOpenTable; clearElement(dt); mCenterFlex(dt);

	let pl = fen.players[uplayer];
	console.log('pl', pl)
	let d = mDiv(dt)
	let idleft = ari_get_card(pl.idleft, 100); //ui.idleft = ui_type_market([pl.idleft], dt, { maleft: 12 }, `players.${uplayer}.idleft`, 'id', ari_get_card);
	let idright = ari_get_card(pl.idright, 100); //ui.idleft = ui_type_market([pl.idleft], dt, { maleft: 12 }, `players.${uplayer}.idleft`, 'id', ari_get_card);
	console.log('idleft', idleft)
	//mDiv(dt,{wmin:12})
	mAppend(dt, iDiv(idleft))
	mDiv(dt,{wmin:24})
	let hand = ui_type_hand(pl.hand,dt)
	mDiv(dt,{wmin:12})
	mAppend(dt, iDiv(idright))

	mLinebreak(dt, 10);
}
function accuse_activate() {
	console.log('activating for', Z.uplayer)
}
