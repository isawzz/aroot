function end_of_turn_fritz() {

	//#region prelim
	let [A, fen, uplayer, plorder] = [Z.A, Z.fen, Z.uplayer, Z.plorder];
	let pl = fen.players[uplayer];
	//console.log('__________________________');

	clear_quick_buttons();
	let ms = fen.players[uplayer].time_left = stop_timer();

	//#endregion

	//#region TJ group processing

	//all TJ groups must be checked and loose cards placed in loosecards
	let ploose = {};
	fen.journeys = [];
	fen.loosecards = [];
	for (const plname in fen.players) { fen.players[plname].loosecards = []; }
	for (const group of DA.TJ) {
		let ch = arrChildren(iDiv(group));
		let cards = ch.map(x => Items[x.id]);
		//find out if is a set
		//console.log('cards', cards);
		let set = ferro_is_set(cards, Z.options.jokers_per_group, 3);
		//console.log('set', set);
		if (!set) {
			//dann kommen die Karten in die Loosecards
			for (const card of cards) {
				if (is_joker(card)) {
					//console.log('pushing joker', card.key);
					fen.loosecards.push(card.key);
					continue;
				}
				let owner = valf(card.owner, uplayer);
				lookupAddToList(ploose, [owner], card.key);
				//console.log('add card', card.key, 'to', owner);
			}
			//console.log('NOT A SET', cards);
		} else {
			let j = set; //[];
			//for (const card of cards) { delete card.owner; j.push(card.key); }
			fen.journeys.push(j);
			//console.log('YES!!!', 'adding journey', j);
		}
	}
	for (const plname in ploose) {
		fen.players[plname].loosecards = ploose[plname];
	}

	//console.log('_____\npublic loosecards', fen.loosecards);
	//console.log('journeys:', fen.journeys);
	//for (const plname in fen.players) { console.log('loosecards', plname, fen.players[plname].loosecards); }

	//discard pile must be reduced by all cards that do not have source = 'discard'
	let discard = UI.deck_discard.items.filter(x => x.source == 'discard');
	fen.deck_discard = discard.map(x => x.key);

	if (!isEmpty(A.selected)) {
		//console.log('selected', A.selected);
		let ui_discarded_card = A.selected.map(x => A.items[x].o)[0];

		removeInPlace(UI.players[uplayer].hand.items, ui_discarded_card);
		ckey = ui_discarded_card.key;
		//console.log('discard', discard);
		elem_from_to(ckey, fen.players[uplayer].hand, fen.deck_discard);
		//ari_history_list([`${uplayer} discards ${c}`], 'discard');

	}

	//all UI.hand cards that do NOT have source=hand must be removed from player hands
	let uihand = UI.players[uplayer].hand.items; //.filter(x => x.source == 'hand');
	let fenhand_vorher = fen.players[uplayer].hand;
	let fenhand = fen.players[uplayer].hand = uihand.filter(x => x.source == 'hand').map(x => x.key);
	//console.log('hand', uihand, 'fenhand vorher:', fenhand_vorher, 'fenhand', fenhand);

	//#endregion

	console.log('________ plorder', fen.plorder, 'turn', Z.turn);

	//check round end
	if (isEmpty(fenhand) && isEmpty(fen.players[uplayer].loosecards)) {
		end_of_round_fritz(uplayer);
	} else if (ms <= 100) {
		console.log(`time is up for ${uplayer}!!!`);
		ari_history_list([`${uplayer} runs out of time`], 'action');
		if (fen.plorder.length <= 1) { end_of_round_fritz(uplayer); }
		else { Z.turn = [get_next_player(Z, uplayer)]; deck_deal_safe_fritz(fen, Z.turn[0]); removeInPlace(fen.plorder, uplayer); }
	} else { Z.turn = [get_next_player(Z, uplayer)]; deck_deal_safe_fritz(fen, Z.turn[0]); }

	console.log('...plorder', fen.plorder, 'turn', Z.turn); output_scores();
	turn_send_move_update();

}
function output_scores() {
	let fen = Z.fen;
	for (const plname in fen.players) {
		let pl = fen.players[plname];
		console.log('score', plname, pl.score);
		//let score = pl.score; let score_str = score.toString(); let score_elem = iDiv(`score_${plname}`); score_elem.innerHTML = score_str;
	}
}















