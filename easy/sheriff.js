function sheriff() {
	
	function sheriff_activate() {
		sheriff_pre_action();
	}
	function sheriff_check_gameover(z) {
		let [fen,round] = [z.fen,z.round];
		if (round <= z.rounds) return false;
		return arr_get_max(fen.plorder,x=>fen.players[x].score);
	}
	function sheriff_setup(players, options) {
		let fen = { players: {}, plorder: jsCopy(players), history: [] };

		//es soll apple, choose, chicken und bread cards geben!
		// wie mach ich erstmal die cards?
		let di = SHERIFF.cards;
		let deck = fen.deck = [];

		deck.push(...Array(48).fill('apples'));
		deck.push(...Array(36).fill('cheese'));
		deck.push(...Array(24).fill('pineapple'));
		deck.push(...Array(36).fill('bread'));
		deck.push(...Array(22).fill('pepper'));
		deck.push(...Array(21).fill('mead'));
		deck.push(...Array(12).fill('silk'));
		deck.push(...Array(5).fill('crossbow'));
		for(const name of ['chestnut','pear','pie','baguette','cherries'])	deck.push(...Array(2).fill(name));
		for(const name of ['pretzel','grapes'])	deck.push(name);

		shuffle(deck);
		console.log('deck',deck);

		//was brauch ich ausser dem deck?
		//each player gets 6 cards
		for (const plname of players) {
			let pl = fen.players[plname] = {
				hand: deck_deal(deck, 6),
				coins: 50,
				vps: 0,
				score: 0,
				color: get_user_color(plname),
			};
		}

		console.log('fen',fen)
		fen.phase = 'market';
		fen.stage = 1;
		fen.turn = [fen.plorder[0]];
		return fen;

	}
	function sheriff_present(z, dParent, uplayer) {

		let [fen, ui] = [z.fen, UI];
		let [dOben, dOpenTable, dMiddle, dRechts] = tableLayoutMR(dParent);

		ari_player_stats(z, dRechts);

		show_history(fen, dRechts);

		//let h=ARI.hcontainer;
		let deck = ui.deck = ui_type_deck(fen.deck, dOpenTable, { maleft: 12 }, 'deck', 'deck', ari_get_card);
		let market = ui.market = ui_type_market(fen.market, dOpenTable, { maleft: 12 }, 'market', 'market', ari_get_card, true);
		let open_discard = ui.open_discard = ui_type_market(fen.open_discard, dOpenTable, { maleft: 12 }, 'open_discard', 'discard', ari_get_card);
		let deck_discard = ui.deck_discard = ui_type_deck(fen.deck_discard, dOpenTable, { maleft: 12 }, 'deck_discard', '', ari_get_card);

		if (exp_commissions(z.options)) {
			let open_commissions = ui.open_commissions = ui_type_market(fen.open_commissions, dOpenTable, { maleft: 12 }, 'open_commissions', 'bank', ari_get_card);
			mMagnifyOnHoverControlPopup(ui.open_commissions.cardcontainer);
			let deck_commission = ui.deck_commission = ui_type_deck(fen.deck_commission, dOpenTable, { maleft: 4 }, 'deck_commission', '', ari_get_card);
			// let commissioned = ui.commissioned = ui_type_list(fen.commissioned, ['rank','count'], dOpenTable, {h:130}, 'commissioned', 'commissioned');
			let comm = ui.commissioned = ui_type_rank_count(fen.commissioned, dOpenTable, {}, 'commissioned', 'sentiment', ari_get_card);
			if (comm.items.length > 0) { let isent = arrLast(comm.items); let dsent = iDiv(isent); set_card_border(dsent, 15, 'green'); }
		}

		let order = [uplayer].concat(fen.plorder.filter(x => x != uplayer));
		for (const plname of order) {
			let pl = fen.players[plname];

			// let playerstyles =  { w: '100%', bg: pl.color, fg: colorIdealText(pl.color), padding: 10 };
			// let d = mDiv(dMiddle, playerstyles, null, plname);

			let playerstyles = { w: '100%', bg: '#ffffff80', fg: 'black', padding: 4, margin: 4, rounding: 10, border: `2px ${get_user_color(plname)} solid` };
			let d = mDiv(dMiddle, playerstyles, null, get_user_pic_html(plname, 25));

			mFlexWrap(d);
			mLinebreak(d, 10);
			//R.add_ui_node(d, getUID('u'), uplayer);
			ari_present_player(z, plname, d, plname != uplayer);
		}


		if (isdef(fen.winners)) ari_reveal_all_buildings(fen);

	}
	function ari_present_player(g, plname, d, ishidden = false) {
		let fen = g.fen;
		let pl = fen.players[plname];
		let ui = UI.players[plname] = {};

		pl.hand = fen.stage == '1' ? sort_cards(pl.hand, true, 'CDSH', true, 'A23456789TJQK') : sort_cards(pl.hand, false, null, true, 'A23456789TJQK'); //pl.hand.sort(); GEHT!
		//lookupSetOverride(pl,['hand'],sorted);
		//console.log('ari_present: hand', jsCopy(pl.hand));
		let hand = ui.hand = ui_type_hand(pl.hand, d, {}, `players.${plname}.hand`, 'hand', ari_get_card);
		if (ishidden) { hand.items.map(x => face_down(x)); }

		let stall = ui.stall = ui_type_market(pl.stall, d, { maleft: 12 }, `players.${plname}.stall`, 'stall', ari_get_card);
		if (fen.stage < 5 && ishidden) { stall.items.map(x => face_down(x)); }

		ui.buildinglist = [];
		for (const k in pl.buildings) {
			let i = 0;
			for (const b of pl.buildings[k]) {
				let type = k;
				//let name = type + ' ' + (b.list[0][0] == 'T' ? '10' : b.list[0][0]);
				let b_ui = ui_type_building(b, d, { maleft: 8 }, `players.${plname}.buildings.${k}.${i}`, type, ari_get_card);
				b_ui.type = k;
				ui.buildinglist.push(b_ui);

				lookupAddToList(ui, ['buildings', k], b_ui); //GEHT!!!!!!!!!!!!!!!!!!!!!
				i += 1;
				//console.log('bui eingetragener path ist',b_ui.path)
			}
		}
		//console.log('buildingslist',plname,ui.buildinglist.map(x=>x.type)); // correct!
		//console.log('ui_buildings',ui.buildings);

		//present commissions
		if (exp_commissions(g.options) && (!ishidden || isdef(fen.winners))) {
			pl.commissions.sort();
			ui.commissions = ui_type_market(pl.commissions, d, { maleft: 12 }, `players.${plname}.commissions`, 'commissions', ari_get_card);
			//console.log('MMM', ui.commissions.cardcontainer);
			mMagnifyOnHoverControlPopup(ui.commissions.cardcontainer);
			//if (ishidden) { commissions.items.map(x => face_down(x)); }
		}


		ui.journeys = [];
		let i = 0;
		for (const j of pl.journeys) {
			let jui = ui_type_hand(j, d, { maleft: 12 }, `players.${plname}.journeys.${i}`, '', ari_get_card);//list, dParent, path, title, get_card_func
			//jui.path = `players.${uplayer}.journeys.${i}`;
			i += 1;
			ui.journeys.push(jui);
		}

	}
	function ari_player_stats(z, dParent) {

		let player_stat_items = UI.player_stat_items = ui_player_info(z, dParent); //fen.plorder.map(x => fen.players[x]));
		let fen = z.fen;
		let herald = fen.heraldorder[0];
		for (const uname of fen.plorder) {
			let pl = fen.players[uname];
			let item = player_stat_items[uname];
			let d = iDiv(item); mCenterFlex(d); mLinebreak(d);
			if (uname == herald) {
				//console.log('d', d, d.children[0]); let img = d.children[0];
				mSym('tied-scroll', d, { fg: 'gold', fz: 24, padding: 4 }, 'TR');
			}
			// if (pl.playmode == 'bot') {
			// 	//console.log('d', d, d.children[0]); let img = d.children[0];
			// 	let d1 = mText('bot', d, { bg: pl.color, fg: 'contrast', fz: 16 });
			// 	mPlace(d1, 'TR')
			// }
			player_stat_count('coin', pl.coins, d);
			if (!isEmpty(fen.players[uname].stall) && fen.stage >= 5 && fen.stage <= 6) {
				player_stat_count('shinto shrine', !fen.actionsCompleted.includes(uname) || fen.stage < 6 ? calc_stall_value(fen, uname) : '_', d);
			}
			player_stat_count('star', uname == U.name || isdef(fen.winners) ? ari_calc_real_vps(fen, uname) : ari_calc_fictive_vps(fen, uname), d);

			if (fen.turn.includes(uname)) {
				show_hourglass(uname, d, 30, { left: 10, top: 'calc( 50% - 36px )' });
				// let html = get_waiting_html();
				// mStyle(d, { position: 'relative' });
				// let dw = mDiv(d, { position: 'absolute', right: 10, top: 'calc( 50% - 35px )' }, null, html);
				//mPlace(dw,'lc');
			}
		}
	}
	function sheriff_state(dParent) {
		function get_phase_html() {
			if (isEmpty(Z.phase) || Z.phase == 'over') return null; //capitalize(Z.friendly);
			let rank = Z.phase[0].toUpperCase();
			let card = ari_get_card(rank + 'Hn', 40);
			let d = iDiv(card);
			mClassRemove(d.firstChild, 'card');
			return iDiv(card).outerHTML;
		}

		let user_html = get_user_pic_html(Z.uplayer, 30);
		let phase_html = get_phase_html();
		if (phase_html) dParent.innerHTML = `${Z.phase}:&nbsp;${phase_html}&nbsp;player: ${user_html} `;

	}

	return { state_info: sheriff_state, setup: sheriff_setup, present: sheriff_present, present_player: ari_present_player, check_gameover: sheriff_check_gameover, stats: ari_player_stats, activate_ui: sheriff_activate };
}

function sheriff_pre_action() {
	let [stage, A, fen, phase, uplayer, deck, market] = [Z.stage, Z.A, Z.fen, Z.phase, Z.uplayer, Z.deck, Z.market];

	if (Z.num_actions > 0) fen.progress = `(action ${Z.action_number} of ${Z.total_pl_actions})`; else delete fen.progress;

	//show_stage();
	switch (ARI.stage[stage]) {
		case 'journey': select_add_items(ui_get_hand_and_journey_items(uplayer), process_journey, 'may form new journey or add cards to existing one'); break;
		case 'add new journey': post_new_journey(); break;
		case 'auto market': ari_open_market(fen, phase, deck, market); break;
		case 'stall selection': select_add_items(ui_get_hand_items(uplayer), post_stall_selected, 'must select your stall'); break;
		case 'action: command': Z.stage = 6; select_add_items(ui_get_commands(uplayer), process_command, 'must select an action', 1, 1); break;
		// ***************** da bin ich ***********************************************************************
		case 'tax': let n = fen.pl_tax[uplayer]; select_add_items(ui_get_hand_items(uplayer), post_tax, 'must pay tax', n, n); break;
		case 'action step 2':
			switch (A.command) {
				case 'trade': select_add_items(ui_get_trade_items(uplayer), post_trade, 'must select 2 cards to trade',2,2); break;
				case 'build': select_add_items(ui_get_payment_items('K'), payment_complete, 'must select payment for building', 1, 1); break;
				case 'upgrade': select_add_items(ui_get_payment_items('K'), payment_complete, 'must select payment for upgrade', 1, 1); break;
				case 'downgrade': select_add_items(ui_get_building_items(uplayer, A.payment), process_downgrade, 'must select a building to downgrade', 1, 1); break;
				case 'pickup': select_add_items(ui_get_stall_items(uplayer), post_pickup, 'must select a stall card to take into your hand', 1, 1); break;
				case 'harvest': select_add_items(ui_get_harvest_items(uplayer), post_harvest, 'must select a farm to harvest from', 1, 1); break;
				case 'sell': select_add_items(ui_get_stall_items(uplayer), post_sell, 'must select 2 stall cards to sell', 2, 2); break;
				case 'buy': select_add_items(ui_get_payment_items('J'), payment_complete, 'must select payment option', 1, 1); break;
				case 'exchange': select_add_items(ui_get_exchange_items(uplayer), post_exchange, 'must select cards to exchange',2,2); break;
				case 'visit': select_add_items(ui_get_payment_items('Q'), payment_complete, 'must select payment for visiting', 1, 1); break;
				case 'commission': select_add_items(ui_get_commission_items(uplayer), process_commission, 'must select a card to commission', 1, 1); break;
				case 'pass': post_pass();break;
			}
			break;
		case 'build': select_add_items(ui_get_build_items(uplayer, A.payment), post_build, 'must select cards to build (first card determines rank)', 4, 6); break;
		case 'commission new': select_add_items(ui_get_commission_new_items(uplayer), post_commission, 'must select a new commission', 1, 1); break;
		case 'upgrade': select_add_items(ui_get_build_items(uplayer, A.payment), process_upgrade, 'must select card(s) to upgrade a building', 1); break;
		case 'select building to upgrade': select_add_items(ui_get_farms_estates_items(uplayer), post_upgrade, 'must select a building', 1, 1); break;
		case 'select downgrade cards': select_add_items(A.possible_downgrade_cards, post_downgrade, 'must select card(s) to downgrade a building', 1); break;
		case 'buy': select_add_items(ui_get_open_discard_items(uplayer, A.payment), post_buy, 'must select a card to buy', 1, 1); break;
		case 'visit': select_add_items(ui_get_other_buildings(uplayer, A.payment), process_visit, 'must select a farm to visit', 1, 1); break;
		case 'visit destroy': select_add_items(ui_get_string_items( ['destroy', 'get cash']), post_visit, 'must destroy the building or select the cash', 1, 1); break;
		case 'ball': select_add_items(ui_get_hand_items(uplayer), post_ball, 'may add cards to the ball'); break;
		case 'auction: bid': select_add_items(ui_get_coin_amounts(uplayer), process_auction, 'must bid for the auction', 1, 1); break;
		case 'auction: buy': select_add_items(ui_get_market_items(), post_auction, 'must buy a card', 1, 1); break;
		case 'end game?': select_add_items(ui_get_endgame(uplayer), post_endgame, 'may end the game here and now or go on!', 1, 1); break;
		case 'pick luxury or journey cards': select_add_items(ui_get_string_items( ['luxury cards', 'journey cards']), post_luxury_or_journey_cards, 'must select luxury cards or getting cards from the other end of the journey', 1, 1); break;
		default: console.log('stage is', stage); break;
	}

}

