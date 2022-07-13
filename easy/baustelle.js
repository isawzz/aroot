function ari_pre_action() {
	let [stage, A, fen, phase, uplayer, deck, market] = [Z.stage, Z.A, Z.fen, Z.phase, Z.uplayer, Z.deck, Z.market];

	if (Z.num_actions > 0) fen.progress = `(action ${Z.action_number} of ${Z.total_pl_actions})`; else delete fen.progress;

	show_stage();
	switch (ARI.stage[stage]) {
		case 'comm_weitergeben': select_add_items(ui_get_all_commission_items(uplayer), process_comm_setup, `must select ${fen.comm_setup_num} card${fen.comm_setup_num > 1 ? 's' : ''} to discard`, fen.comm_setup_num, fen.comm_setup_num); break;
		case 'rumors_weitergeben': select_add_items(ui_get_rumors_and_players_items(uplayer), process_rumors_setup, `must select a player and a rumor to pass on`, 2, 2); break;
		case 'rumor': select_add_items(ui_get_other_buildings_and_rumors(uplayer), process_rumor, 'must select a building and a rumor card to place', 2, 2); break;
		case 'buy rumor': select_add_items(ui_get_top_rumors(), post_buy_rumor, 'must select one of the cards', 1, 1); break;
		case 'rumor discard': select_add_items(ui_get_rumors_items(uplayer), process_rumor_discard, 'must select a rumor card to discard', 1, 1); break;
		case 'rumor_both': select_add_items(ui_get_top_rumors(), post_rumor_both, 'must select one of the cards', 1, 1); break;
		case 'blackmail': select_add_items(ui_get_other_buildings_with_rumors(uplayer), process_blackmail, 'must select a building to blackmail', 1, 1); break;
		case 'blackmail_owner': select_add_items(ui_get_blackmailed_items(), being_blackmailed, 'must react to BLACKMAIL!!!', 1, 1); break; //console.log('YOU ARE BEING BLACKMAILED!!!',uplayer); break;
		case 'accept_blackmail': select_add_items(ui_get_stall_items(uplayer), post_accept_blackmail, 'must select a card to pay off blackmailer', 1, 1); break;
		case 'blackmail_complete': post_blackmail(); break;
		case 'journey': select_add_items(ui_get_hand_and_journey_items(uplayer), process_journey, 'may form new journey or add cards to existing one'); break;
		case 'add new journey': post_new_journey(); break;
		case 'auto market': ari_open_market(fen, phase, deck, market); break;
		case 'TEST_starts_in_stall_selection_complete':
			if (is_stall_selection_complete()) {
				delete fen.stallSelected;
				fen.actionsCompleted = [];
				if (check_if_church()) ari_start_church_stage(); else ari_start_action_stage();
			} else select_add_items(ui_get_hand_items(uplayer), post_stall_selected, 'must select your stall'); break;
		case 'stall selection': select_add_items(ui_get_hand_items(uplayer), post_stall_selected, 'must select cards for stall'); break;
		case 'church': select_add_items(ui_get_hand_and_stall_items(uplayer), post_tide, `must select cards to tide ${isdef(fen.tidemin) ? `(current minimum is ${fen.tidemin})` : ''}`, 1, 100); break;
		case 'church_minplayer_tide_add': select_add_items(ui_get_hand_and_stall_items(uplayer), post_tide_minimum, `must select cards to reach at least ${fen.tide_minimum}`, 1, 100); break;
		case 'church_minplayer_tide_downgrade': select_add_items(ui_get_building_items(uplayer, A.payment), process_downgrade, 'must select a building to downgrade', 1, 1); break;
		case 'church_minplayer_tide': console.log('NOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO');
			//fen.tide_minimum is what fen.minplayer (=uplayer) must reach to tide
			//first compute if hand and stall cards can get up to minimum
			//console.log('church_minplayer_tide!', Z.stage, fen.stage);
			let pl = fen.players[uplayer];
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

				ari_history_list([`${uplayer} must downgrade a building to tide ${min}!`], 'downgrade');
				select_add_items(ui_get_building_items(uplayer, A.payment), process_downgrade, 'must select a building to downgrade', 1, 1);
			} else {
				//must select more cards to tide!
				ari_history_list([`${uplayer} must tide more cards to reach ${min}!`], 'tide');
				select_add_items(ui_get_hand_and_stall_items(uplayer), post_tide_minimum, `must select cards to reach at least ${fen.tide_minimum}`, 1, 100);
			}


			break;
		case 'church_newcards':
			//console.log('church_newcards!', Z.stage, fen.stage);
			reveal_church_cards();
			let items = ui_get_church_items(uplayer);
			let num_select = items.length == fen.church.length ? 1 : 2;
			let instr = num_select == 1 ? `must select a card for ${fen.candidates[0]}` : 'must select card and player';
			select_add_items(items, post_church, instr, num_select, num_select);
			break;
		case 'complementing_market_after_church':
			select_add_items(ui_get_hand_items(uplayer), post_complementing_market_after_church, 'may complement stall'); break;
		case 'action: command': Z.stage = 6; select_add_items(ui_get_commands(uplayer), process_command, 'must select an action', 1, 1); break; //5
		case 'tax': let n = fen.pl_tax[uplayer]; select_add_items(ui_get_hand_items(uplayer), post_tax, 'must pay tax', n, n); break;
		case 'action step 2':
			switch (A.command) {
				case 'trade': select_add_items(ui_get_trade_items(uplayer), post_trade, 'must select 2 cards to trade', 2, 2); break;
				case 'build': select_add_items(ui_get_payment_items('K'), payment_complete, 'must select payment for building', 1, 1); break;
				case 'upgrade': select_add_items(ui_get_payment_items('K'), payment_complete, 'must select payment for upgrade', 1, 1); break;
				case 'downgrade': select_add_items(ui_get_building_items(uplayer, A.payment), process_downgrade, 'must select a building to downgrade', 1, 1); break;
				case 'pickup': select_add_items(ui_get_stall_items(uplayer), post_pickup, 'must select a stall card to take into your hand', 1, 1); break;
				case 'harvest': select_add_items(ui_get_harvest_items(uplayer), post_harvest, 'must select a farm to harvest from', 1, 1); break;
				case 'sell': select_add_items(ui_get_stall_items(uplayer), post_sell, 'must select 2 stall cards to sell', 2, 2); break;
				case 'buy': select_add_items(ui_get_payment_items('J'), payment_complete, 'must select payment option', 1, 1); break;
				case 'buy rumor': ari_open_rumors(); break;
				case 'exchange': select_add_items(ui_get_exchange_items(uplayer), post_exchange, 'must select cards to exchange', 2, 2); break;
				case 'visit': select_add_items(ui_get_payment_items('Q'), payment_complete, 'must select payment for visiting', 1, 1); break;

				case 'rumor': select_add_items(ui_get_payment_items('Q'), payment_complete, 'must select payment for placing a rumor', 1, 1); break;
				case 'inspect': select_add_items(ui_get_other_buildings(uplayer), post_inspect, 'must select building to visit', 1, 1); break;
				case 'blackmail': select_add_items(ui_get_payment_items('Q'), payment_complete, 'must select payment for blackmailing', 1, 1); break;

				case 'commission': select_add_items(ui_get_commission_items(uplayer), process_commission, 'must select a card to commission', 1, 1); break;
				case 'pass': post_pass(); break;
			}
			break;
		case 'build': select_add_items(ui_get_build_items(uplayer, A.payment), post_build, 'must select cards to build (first card determines rank)', 4, 6); break;
		case 'commission new': select_add_items(ui_get_commission_new_items(uplayer), post_commission, 'must select a new commission', 1, 1); break;
		case 'upgrade': select_add_items(ui_get_build_items(uplayer, A.payment), process_upgrade, 'must select card(s) to upgrade a building', 1); break;
		case 'select building to upgrade': select_add_items(ui_get_farms_estates_items(uplayer), post_upgrade, 'must select a building', 1, 1); break;
		case 'select downgrade cards': select_add_items(A.possible_downgrade_cards, post_downgrade, 'must select card(s) to downgrade a building', 1, is_in_middle_of_church() ? 1 : 100); break;
		case 'buy': select_add_items(ui_get_open_discard_items(uplayer, A.payment), post_buy, 'must select a card to buy', 1, 1); break;
		case 'visit': select_add_items(ui_get_other_buildings(uplayer, A.payment), process_visit, 'must select a building to visit', 1, 1); break;
		case 'visit destroy': select_add_items(ui_get_string_items(['destroy', 'get cash']), post_visit, 'must destroy the building or select the cash', 1, 1); break;
		case 'ball': select_add_items(ui_get_hand_items(uplayer), post_ball, 'may add cards to the ball'); break;
		case 'auction: bid': select_add_items(ui_get_coin_amounts(uplayer), process_auction, 'must bid for the auction', 1, 1); break;
		case 'auction: buy': select_add_items(ui_get_market_items(), post_auction, 'must buy a card', 1, 1); break;
		case 'end game?': select_add_items(ui_get_endgame(uplayer), post_endgame, 'may end the game here and now or go on!', 1, 1); break;
		case 'pick luxury or journey cards': select_add_items(ui_get_string_items(['luxury cards', 'journey cards']), post_luxury_or_journey_cards, 'must select luxury cards or getting cards from the other end of the journey', 1, 1); break;
		default: console.log('stage is', stage); break;
	}

}







