
function toggle_visibility(elem) {
	//returns new visibility (true or false)
	elem = toElem(elem);
	if (nundef(elem)) return;
	let vis = elem.style.display;
	if (vis == 'none') { show(elem); return true; } else { hide(elem); return false; }
}
function get_advanced_menu_button() {
	let html = `<a id="aAdvancedMenu" href="javascript:onclick_advanced_menu()">≡</a>`;
	let b = mCreateFrom(html);
	mStyle(b, { bg: 'silver', hpadding: 10, maright: 10, rounding: 4 });
	mClass(b, 'hop1')
	return b;
}

function accuse_activate() {
	let [pldata, stage, A, fen, phase, uplayer, turn, uname, host] = [Z.playerdata, Z.stage, Z.A, Z.fen, Z.phase, Z.uplayer, Z.turn, Z.uname, Z.host];
	let donelist = Z.playerdata.filter(x => isDict(x.state) && isdef(x.state.item));
	//if (!isEmpty(donelist)) console.log('.................donelist',donelist)
	let complete = ['hand', 'membership', 'tied_consensus'].includes(stage) && donelist.length >= turn.length || stage == 'round' && firstCond(pldata, x => isDict(x.state));
	if (complete && !sameList(turn, [Z.host])) {
		//console.log('COMPLETE! donelist', donelist)
		relegate_to_host(donelist);
		return;
	}
	//if still here and multiturn: it cannot be complete or Z.host is only player on turn now!
	let waiting = isdef(donelist.find(x => x.name == uplayer)) && turn.length > 1;
	assertion(!complete || sameList(turn, [Z.host]), 'complete hat nicht zu host uebergeben!!!!!!!!!!')
	assertion(!complete || !waiting, 'ERROR WAITING WHEN COMPLETE!!!')
	Z.isWaiting = waiting; //das ist nur fuer page tab title animated vs static

	assertion(turn.length == 1 || ['membership', 'hand', 'round'].includes(stage), "FALSCHE ASSUMPTION!!!!!!!!!!!!!");
	if (turn.length == 1) check_experience_states();

	if (waiting) {
		//console.log('WAITING!!', stage, uplayer);
		accuse_show_selected_state(donelist.find(x => x.name == uplayer).state);
		if (Z.mode != 'multi') { take_turn_waiting(); return; }
		autopoll();
	} else if (stage == 'handresolve') {
		assertion(uplayer == Z.host && fen.cardsrevealed, 'NOT THE STARTER WHO COMPLETES THE STAGE!!!')
		//console.log('RESOLVING votes on click!!!!!!!!!!!!!')
		DA.gobutton = mButton('evaluate cards', accuse_evaluate_votes, dTable, {}, ['donebutton', 'enabled']);
	} else if (stage == 'membershipresolve') {
		assertion(uplayer == Z.host, 'NOT THE STARTER WHO COMPLETES THE STAGE!!!')
		//console.log('RESOLVING membership!!!!!!!!!!!!!')
		let histest = [];
		for (const pldata of fen.pldata) { //Z.playerdata) {
			let plname = pldata.name;
			let card = pldata.state.item;
			assertion(!isEmpty(card), "INVALID MEMBERSHIP SELECTION!!!!!!!!!!!!", uplayer)
			//selected card goes from hand to membership
			let pl = fen.players[plname];
			pl.membership = card;
			removeInPlace(pl.hand, card);
			histest.push(`${plname} ${TESTHISTORY ? card : ''}`); //TODO:KEEP secret!!!!!!!!!!!!!!!!!!!!!!
		}
		ari_history_list(histest, 'membership');
		start_new_poll();
	} else if (stage == 'roundresolve') {
		assertion(uplayer == Z.host, 'NOT THE STARTER WHO COMPLETES THE STAGE!!!')
		//console.log('RESOLVING round => new generation!!!!!!!!!!!!!')
		Z.turn = jsCopy(Z.plorder);
		Z.phase = Number(Z.phase) + 1;
		stage = Z.stage = Z.phase > fen.rounds ? 'gameover' : 'membership';

		if (stage == 'membership') {
			for (const pl in fen.players) { delete fen.players[pl].membership; }
			start_new_generation(fen, Z.plorder, Z.options);
		}
		take_turn_fen_clear();
	} else if (stage == 'president') {
		let parley_action_available = get_others_with_at_least_one_hand_card().length >= 1;
		addIf(fen.presidents_poll, fen.president);
		if (parley_action_available) {
			select_add_items(ui_get_string_items(['parley']), president_parley, 'may parley cards', 0, 1);
		} else {
			//proceed to president_2
			Z.stage = 'president_2';
			accuse_activate();
		}
	} else if (stage == 'president_2') {
		let accuse_action_available = !fen.isprovisional || fen.players[uplayer].hand.length >= 1;
		let actions = ['defect', 'resign'];
		if (accuse_action_available) actions.unshift('accuse');
		select_add_items(ui_get_string_items(actions), president_action, 'must select action to play', 1, 1);
	} else if (stage == 'pay_for_accuse') {
		select_add_items(ui_get_hand_items(uplayer), pay_for_accuse_action, 'must pay a card for accuse action', 1, 1);
	} else if (stage == 'accuse_action_select_player') {
		let plnames = get_keys(fen.players);
		let validplayers = plnames.filter(x => fen.players[x].hand.length >= 1 && x != uplayer && !fen.presidents_poll.includes(x));
		select_add_items(ui_get_player_items(validplayers), accuse_submit_accused, 'must select player name', 1, 1);
	} else if (stage == 'accuse_action_select_color') {
		select_add_items(ui_get_string_items(fen.colors), accuse_submit_accused_color, 'must select color', 1, 1);
	} else if (stage == 'accuse_action_entlarvt') {
		select_add_items(ui_get_hand_items(uplayer), accuse_replaced_membership, 'must select new alliance', 1, 1);
	} else if (stage == 'accuse_action_provisional') {
		select_add_items(ui_get_hand_items(uplayer), accuse_replaced_membership, 'must select new alliance', 1, 1);
	} else if (stage == 'accuse_action_policy') {
		select_add_items(ui_get_hand_items(uplayer), accuse_enact_policy, 'may enact a policy', 0, 1);
	} else if (stage == 'accuse_action_new_president') {
		set_new_president();
	} else if (stage == 'parley_select_player') {
		let players = get_others_with_at_least_one_hand_card();
		select_add_items(ui_get_player_items(players), parley_player_selected, 'must select player to exchange cards with', 1, 1);
	} else if (stage == 'parley_select_cards') {
		select_add_items(ui_get_hand_items(uplayer), parley_cards_selected, 'may select cards to exchange', 0, fen.maxcards);
	} else if (stage == 'parley_opponent_selects') {
		let n = fen.player_cards.length;
		select_add_items(ui_get_hand_items(uplayer), parley_opponent_selected, `must select ${n} cards`, n, n);
	} else if (stage == 'defect_membership') {
		select_add_items(ui_get_hand_items(uplayer), defect_resolve, 'may replace your alliance', 0, 1);
	} else if (stage == 'membership') {
		select_add_items(ui_get_hand_items(uplayer), accuse_submit_membership, 'must select your alliance', 1, 1);
	} else if (stage == 'hand') {
		select_add_items(ui_get_hand_items(uplayer), accuse_submit_card, 'may select card to play', 0, 1);
	} else if (stage == 'round') {
		//let d = mDiv(dTable, {}, null, `generation end! ${fen.generations[fen.phase - 1].color} wins`);
		show_special_message(`generation end! ${fen.generations[fen.phase - 1].color} wins`, false, 3000, 0, { top: 67 })
		if (is_ai_player(uplayer)) accuse_onclick_weiter();
		else {
			mLinebreak(dTable, 12)
			mButton('WEITER', accuse_onclick_weiter, dTable, {}, ['donebutton', 'enabled']);
		}
	} else {
		//console.log('Z',Z)
		alert(`PROBLEM!!! unknown stage ${stage}`)
	}
}





















