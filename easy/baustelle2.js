
function is_in_middle_of_church(){
	let [fen, A, uplayer, plorder] = [Z.fen, Z.A, Z.uplayer, Z.plorder];
	return isdef(fen.players[uplayer].tides);
}

function post_tide() {
	let [fen, A, uplayer, plorder] = [Z.fen, Z.A, Z.uplayer, Z.plorder];
	let items = A.selected.map(x => A.items[x]);

	if (items.length == 0) { select_error('No cards selected!'); return; }

	//calc value of cards in items
	let st = items.map(x => ({ key: x.key, path: x.path }));
	let val = arrSum(st.map(x => ari_get_card(x.key).val));

	//console.log('player', uplayer, 'tides', st, 'value', val);
	lookupSet(fen, ['players', uplayer, 'tides'], { keys: st, val: val });

	remove_tides_from_play(fen, uplayer);

	//calc tide minimum so far
	let pldone = plorder.filter(x => isdef(fen.players[x].tides));
	let minplayers = arrMin(pldone, x => fen.players[x].tides.val);
	let minplayer = isList(minplayers) ? minplayers[0] : minplayers;
	let minval = fen.tidemin = fen.players[minplayer].tides.val;

	let next = get_next_in_list(uplayer, fen.church_order);
	if (next == fen.church_order[0]) {
		//this stage is done! ALL PLAYERS HAVE TIDED!!!
		//goto church_tide_eval stage (18)
		//console.log('CHURCH TIDYING DONE!!! minplayers', minplayers);
		assertion(sameList(pldone, plorder), 'NOT all players have tides!!!!!!!', pldone);

		//tided cards have to be removed!
		//for (const plname of pldone) { remove_tides_from_play(fen, plname); }

		if (minplayers.length > 1) { proceed_to_newcards_selection(); return; }
		else {
			//there is a minplayer, this player has to tide at least as much as next higher player!
			//remove minplayer from pldone
			pldone = pldone.filter(x => x != minplayer);
			//sort pldone by tide value
			let sorted = sortBy(pldone, x => fen.players[x].tides.val);
			let second_min = sorted[0];
			fen.tide_minimum = fen.players[second_min].tides.val - minval;

			//hier kann ich eigentlich schon checken ob der minplayer ueberhaupt genug hat!
			//dann kann ich gleich entscheiden ob er zu downgrad muss oder zu additional_tides_to_play
			//#region check if minplayer has enough

			let pl = fen.players[minplayer];
			let hst = pl.hand.concat(pl.stall);
			let vals = hst.map(x => ari_get_card(x).val);
			let sum = arrSum(vals);
			//console.log('gesamtes minplayer blatt + stall', sum);
			let min = fen.tide_minimum;
			if (sum < min) {
				//jetzt gibt es ein problem! player muss ein building downgraden!
				//fahre fort wie bei downgrade!
				//aber danach muss ich wieder zurueck zu church!!!

				//uplayer looses all hand and stall cards!!!
				pl.hand = [];
				pl.stall = [];

				ari_history_list([`${minplayer} must downgrade a building to tide ${min}!`], 'tide_minplayer_tide');
				Z.stage = 22;
						

				//
			} else {
				//must select more cards to tide!
				ari_history_list([`${minplayer} must tide more cards to reach ${min}!`], 'tide_minplayer_tide');
				Z.stage = 21;
				//
			}


			//#endregion


			//Z.stage = 18;
			Z.turn = [minplayer];
		}

	} else {
		Z.turn = [next];

	}
	turn_send_move_update();


}

















