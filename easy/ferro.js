function ferro() {
	function state_info(dParent) { ferro_state_new(dParent); }
	function setup(players, options) {
		let fen = { players: {}, plorder: jsCopy(players), history: [] };

		//calc how many decks are needed (basically 1 suit per person, plus 1 for the deck)
		let n = players.length;
		let num_decks = fen.num_decks = 2 + (n >= 9 ? 2 : n >= 7 ? 1 : 0); // 2 + (n > 5 ? Math.ceil((n - 5) / 2) : 0); //<=5?2:Math.max(2,Math.ceil(players.length/3));
		console.log('num_decks', num_decks);
		let deck = fen.deck = create_fen_deck('n', num_decks, 4 * num_decks);
		let deck_discard = fen.deck_discard = [];
		shuffle(deck);
		shuffle(fen.plorder);
		let starter = fen.plorder[0];
		//console.log('options', options);
		let handsize = valf(Number(options.handsize), 11);
		for (const plname of players) {
			let pl = fen.players[plname] = {
				hand: deck_deal(deck, plname == starter ? handsize + 1 : handsize),
				journeys: [],
				coins: 10,
				vps: 0,
				score: 0,
				name: plname,
				color: get_user_color(plname),
			};
			pl.goals = { 3: 0, 33: 0, 4: 0, 44: 0, 5: 0, 55: 0, '7R': 0 };
			//for(const goal of Config.games.ferro.options.goals) pl.goals[goal]=0;
		}
		fen.phase = ''; //TODO: king !!!!!!!
		[fen.stage, fen.turn] = ['card_selection', [starter]];
		return fen;
	}
	function present(z, dParent, uplayer) { ferro_present_new(z, dParent, uplayer); }
	function present_player(g, plname, d, ishidden = false) { ferro_present_player_new(g, plname, d, ishidden = false) }
	function check_gameover() { return isdef(Z.fen.winners) ? Z.fen.winners : false; }
	function stats(Z, dParent) { ferro_stats_new(dParent); }
	function activate_ui() { ferro_activate_ui(); }
	return { state_info, setup, present, present_player, check_gameover, stats, activate_ui };
}

function ferro_pre_action() {
	let [stage, A, fen, plorder, uplayer, deck] = [Z.stage, Z.A, Z.fen, Z.plorder, Z.uplayer, Z.deck];
	//log_object(fen, 'fen', 'stage turn players');	//console.log('__________stage', stage, 'uplayer', uplayer, '\nDA', get_keys(DA));	//console.log('fen',fen,fen.players[uplayer]);
	switch (stage) {
		case 'buy_or_pass': select_add_items(ui_get_buy_or_pass_items(), ferro_ack_uplayer, 'may click top discard to buy or pass', 1, 1); break;
		case 'card_selection': select_add_items(ui_get_ferro_items(uplayer), fp_card_selection, 'must select one or more cards', 1, 100); break;
		default: console.log('stage is', stage); break;
	}
	ensure_buttons_visible_ferro();
}

function ferro_present_new(z, dParent, uplayer) {

	//DA.no_shield = true;
	let [fen, ui, stage] = [z.fen, UI, z.stage];
	let [dOben, dOpenTable, dMiddle, dRechts] = tableLayoutMR(dParent, 5, 1);

	ferro_stats_new(z, dRechts);

	show_history(fen, dRechts);

	let deck = ui.deck = ui_type_deck(fen.deck, dOpenTable, { maleft: 12 }, 'deck', 'deck', ferro_get_card);
	let deck_discard = ui.deck_discard = ui_type_deck(fen.deck_discard, dOpenTable, { maleft: 12 }, 'deck_discard', '', ferro_get_card);
	//console.log('deck_discard',deck_discard);
	if (!isEmpty(deck_discard.items)) face_up(deck_discard.get_topcard());

	let uname_plays = fen.plorder.includes(Z.uname);
	let show_first = uname_plays && Z.mode == 'multi' ? Z.uname : uplayer;
	//let order = TESTING ? fen.plorder : [show_first].concat(fen.plorder.filter(x => x != show_first));
	order = arrCycle(fen.plorder, fen.plorder.indexOf(show_first));
	for (const plname of order) {
		let pl = fen.players[plname];

		let playerstyles = { w: '100%', bg: '#ffffff80', fg: 'black', padding: 4, margin: 4, rounding: 10, border: `2px ${get_user_color(plname)} solid` };
		let d = mDiv(dMiddle, playerstyles, null, get_user_pic_html(plname, 25));

		mFlexWrap(d);
		mLinebreak(d, 10);

		if (isdef(fen.winners)) hidden = false;
		else if (Z.role == 'spectator') hidden = plname != uplayer;
		else if (Z.mode == 'hotseat') hidden = (pl.playmode == 'bot' || plname != uplayer);
		else hidden = plname != Z.uname;

		ferro_present_player_new(z, plname, d, hidden);
	}

}
function ferro_present_player_new(g, plname, d, ishidden = false) {
	let fen = g.fen;
	let pl = fen.players[plname];
	let ui = UI.players[plname] = { div: d };
	Config.ui.card.h = ishidden ? 100 : 150;
	Config.ui.container.h = Config.ui.card.h + 30;

	// no presorting!!! pl.hand = sort_cards(pl.hand, false, null, true, '23456789TJQKA*');
	//if (!TESTING) pl.hand = sort_cards(pl.hand, false, null, true, '23456789TJQKA*');
	if (isdef(pl.handsorting)) {
		let bysuit = pl.handsorting.by == 'suit';
		let [arr1, arr2] = arrSplitAtIndex(pl.hand, pl.handsorting.n - 1);
		pl.hand = sort_cards(arr1, bysuit, 'CDSH', true, '23456789TJQKA*').concat(arr2);
	}
	let hand = ui.hand = ui_type_hand(pl.hand, d, {}, `players.${plname}.hand`, 'hand', ferro_get_card);
	if (ishidden) { hand.items.map(x => face_down(x)); }
	else {
		//mStyle(d,{transform:'scale(2)'}); } 
		//hand.items.map(x=>mStyle(iDiv(x),{h:200,w:100})); 
		ensure_buttons_visible_for(Z.mode == 'hotseat' ? Z.uplayer : Z.uname);

	}

	ui.journeys = [];
	let i = 0;
	for (const j of pl.journeys) {
		let jui = ui_type_lead_hand(j, d, { maleft: 12, h: 130 }, `players.${plname}.journeys.${i}`, '', ferro_get_card);//list, dParent, path, title, get_card_func
		//jui.path = `players.${uplayer}.journeys.${i}`;
		i += 1;
		ui.journeys.push(jui);
	}

}
function ferro_activate_ui() {
	//first animations!!!!
	let [stage, A, fen, plorder, uplayer, deck] = [Z.stage, Z.A, Z.fen, Z.plorder, Z.uplayer, Z.deck];
	let pl = fen.players[uplayer];

	new_cards_animation();
	round_change_animation();

	ferro_pre_action();
}
function ferro_state_new(dParent) {
	if (is_fixed_goal()) {
		let goal = get_round_goal();
		//console.log('goal', goal);
		let goal_html = `<div style="font-weight:bold;border-radius:50%;background:white;color:red;line-height:100%;padding:4px 8px">${goal}</div>`;
		dParent.innerHTML = `Round ${Z.round}:&nbsp;&nbsp;minimum:&nbsp;${goal_html}`;
	} else {
		let user_html = get_user_pic_html(Z.uplayer, 30);
		dParent.innerHTML = `Round ${Z.round}:&nbsp;player: ${user_html} `;
	}
}
function ferro_stats_new(z, dParent) {
	let player_stat_items = UI.player_stat_items = ui_player_info(z, dParent);
	let fen = z.fen;
	for (const uname of fen.plorder) {
		let pl = fen.players[uname];
		let item = player_stat_items[uname];
		let d = iDiv(item); mCenterFlex(d); mLinebreak(d);
		player_stat_count('coin', pl.coins, d);
		// player_stat_count('hand with fingers splayed', pl.hand.length, d);
		//console.log('pl.hand', pl.hand);
		player_stat_count('pinching hand', pl.hand.length, d);
		player_stat_count('hand with fingers splayed', calc_hand_value(pl.hand), d);
		player_stat_count('star', pl.score, d);

		mLinebreak(d, 4);
		//console.log('is fixed goal', is_fixed_goal());
		if (!is_fixed_goal()) {
			let d2 = mDiv(d, { padding: 4, display: 'flex' }, `d_${uname}_goals`);
			let sz = 16;
			let styles_done = { h: sz, fz: sz, maleft: 6, fg: 'grey', 'text-decoration': 'line-through green', weight: 'bold' };
			let styles_todo = { h: sz, fz: sz, maleft: 6, border: 'red', weight: 'bold', padding: 4, 'line-height': sz }; // 'text-decoration': 'underline red', 
			for (const k in pl.goals) {
				mText(k, d2, pl.goals[k] ? styles_done : styles_todo);
			}
		}

		if (fen.turn.includes(uname)) { show_hourglass(uname, d, 30, { left: -3, top: 0 }); }
	}
}
function fp_card_selection() {
	let [plorder, stage, A, fen, uplayer, pl] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer, Z.fen.players[Z.uplayer]];

	let selitems = A.selectedCards = A.selected.map(x => A.items[x]);
	let cards = selitems.map(x => x.o);
	let cmd = A.last_selected.key;

	if (cmd == 'discard') {
		//if only 1 card selected, discard it
		//first deal with error cases!
		if (selitems.length != 1) { select_error('select exactly 1 hand card to discard!'); return; }

		let item = selitems[0];
		if (!item.path.includes(`${uplayer}.hand`)) { select_error('select a hand card to discard!', () => { ari_make_unselected(item); A.selected = []; }); return; }

		//here I have to check for transaction and commit or rollback
		//if transactionlist is non-empty, check if player's minimum req has been fullfilled
		//console.log('discard', DA.transactionlist);
		assertion(DA.transactionlist.length == 0 || DA.simulate, '!!!!!!!!!!!!!!!!transactionlist is not empty!');
		if (DA.transactionlist.length > 0) {
			//console.log('VERIFYING TRANSACTION............')
			//console.log('DA.transactionlist', jsCopy(DA.transactionlist));
			let legal = verify_min_req();
			clear_transaction();
			if (legal) {
				ferro_process_discard(); //discard selected card
				turn_send_move_update();
			} else {
				rollback();
				ferro_transaction_error(DA.min_goals, DA.transactionlist, 'turn_send_move_update');

				// let msg_min_req = `You need to fulfill the minimum requirement of ${DA.min_goals.join(' or ')}!`;
				// let l = DA.transactionlist;
				// let [jolly,auflegen,anlegen]=[l.includes('jolly'),l.includes('auflegen'),l.includes('anlegen')];
				// let msg_action = anlegen?'anlegen requires auflegen von minimum first!':
				// 'jolly'?'to exchange a jolly you need to be able to auflegen!':
				// 'your sets are not good enough!';

				// select_error(`your transaction was ILLEGAL!!! ${msg_min_req} ${msg_action} ...performing rollback...`,turn_send_move_update,true);

			}
		} else {
			//console.log('should process discard!!!')
			ferro_process_discard(); //discard selected card
			turn_send_move_update();
		}
	} else if (cmd == 'jolly') {

		//first, error cases: have to select exactly 2 cards
		if (selitems.length != 2) { select_error('select a hand card and the jolly you want!'); return; }
		//one card has to be hand, the other jolly from a group
		let handcard = selitems.find(x => !is_joker(x.o) && x.path.includes(`${uplayer}.hand`));
		let jolly = selitems.find(x => is_joker(x.o) && !x.path.includes(`${uplayer}.hand`));
		if (!isdef(handcard) || !isdef(jolly)) { select_error('select a hand card and the jolly you want!'); return; }

		let key = handcard.key;
		let j = path2fen(fen, jolly.path);
		if (!jolly_matches(key, j)) { select_error('your card does not match jolly!'); return; }

		//if player has not yet played a set, simulate transaction!!!!
		if (pl.journeys.length == 0) { add_transaction(cmd); }
		ferro_process_jolly(key, j);
		turn_send_move_update();

	} else if (cmd == 'auflegen') {

		if (selitems.length < 3) { select_error('select cards to form a group!'); return; }
		// console.log('HAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', cards.map(x=>x.key))
		let newset = ferro_is_set(cards, Z.options.jokers_per_group);

		//console.log('nach is_set', newset);

		//console.log('is_set', is_set);
		if (!newset) { select_error('this is NOT a valid set!'); return; }

		//special case fuer 7R: geht nur in 7R round wenn fixed order
		let is_illegal = is_correct_group_illegal(cards);
		//console.log('is_legal', is_legal);

		if (is_illegal) { select_error(is_illegal); return; }

		if (pl.journeys.length == 0) { add_transaction(cmd); }
		let keys = newset; //cards.map(x => x.key);
		ferro_process_set(keys);
		turn_send_move_update();

	} else if (cmd == 'anlegen') {

		if (selitems.length < 1) { select_error('select at least 1 hand card and the first card of a group!'); return; }

		let handcards = selitems.filter(x => !is_joker(x.o) && x.path.includes(`${uplayer}.hand`));
		let groupcard = selitems.find(x => !is_joker(x.o) && !x.path.includes(`${uplayer}.hand`));
		if (isEmpty(handcards) || !isdef(groupcard)) { select_error('select 1 or more hand cards and the first card of a group!'); return; }

		//test try_anlegen for all handcards
		//if more than one handcard, test if all have the same rank
		let hand_rank = handcards[0].key[0];
		let handcards_same_rank = handcards.every(x => x.key[0] == hand_rank);
		let j = path2fen(fen, groupcard.path);

		if (is_group(j)) {
			if (!handcards_same_rank) { select_error('all hand cards must have the same rank!'); return; }

			let group_rank = groupcard.key[0];
			if (group_rank == hand_rank) {
				//console.log('anlegen is legal');

				for (const h of handcards) {
					elem_from_to(h.key, fen.players[uplayer].hand, j);
				}
				turn_send_move_update();
				return;
			} else {
				select_error('hand cards do not match the group!');
				return;
			}
		} else { //its a sequence!
			//sort hand cards
			//more than 1 hand_card!
			let suit = get_sequence_suit(j);
			let handkeys = handcards.map(x => x.key); //console.log('suit',suit,'keys', keys);
			if (firstCond(handkeys, x => x[1] != suit)) { select_error('hand card suit does not match the group!'); return; }

			//look if first key is a jolly
			let ij = j.findIndex(x => is_jolly(x));
			let j_has_jolly = ij > -1;
			let rank_to_be_relaced_by_jolly = j_has_jolly ? find_jolly_rank(j) : null;

			let r = rank_to_be_relaced_by_jolly;
			if (r) {
				j[ij] = r + suit + 'n';
			}

			//now should have a seequence without jolly!
			keys = handkeys.concat(j);
			let allcards = keys.map(x => ferro_get_card(x)); // handcards.concat(j.map(x=>ferro_get_card(x)));
			let jneeded = sortCardItemsToSequence(allcards, undefined, 0);

			//now replace back if r != null
			//console.log('new sequence', allcards.map(x => x.key), 'jneeded', jneeded);
			if (jneeded == 0) {
				//if r != null need to replace r key by * in final sequence
				let seq = allcards.map(x => x.key);
				if (r) { arrReplace1(seq, r + suit + 'n', '*Hn'); }
				//console.log('new sequence', seq);
				j.length = 0;
				j.push(...seq);
				for (const k of handkeys) { removeInPlace(fen.players[uplayer].hand, k); }
				turn_send_move_update();
				//console.log('YES!');

			} else {
				if (r != null) { j[ij] = '*Hn'; }
				select_error('hand cards cannot be added to sequence!');
				return;
			}
		}
	}
}

//#region ack NEW!
function ferro_change_to_ack_round() {
	let [plorder, stage, A, fen, uplayer] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer];
	let nextplayer = get_next_player(Z, uplayer); //player after buy_or_pass round

	//newturn is list of players starting with nextplayer
	let newturn = jsCopy(plorder); while (newturn[0] != nextplayer) { newturn = arrCycle(newturn, 1); } //console.log('newturn', newturn);
	let buyerlist = fen.canbuy = []; //fen.canbuy list ist angeordnet nach reihenfolge der frage
	for (const plname of newturn) {
		let pl = fen.players[plname];
		if (plname == uplayer) { pl.buy = false; continue; }
		else if (pl.coins > 0) { pl.buy = false; buyerlist.push(plname); }
	}
	//log_object(fen, 'buyers', 'nextplayer canbuy');

	start_simple_ack_round('buy_or_pass', buyerlist, nextplayer, 'ferro_change_to_turn_round');
}
function ferro_change_to_turn_round() {
	//console.log('ferro_change_to_turn_round_', getFunctionsNameThatCalledThisFunction()); 
	let [z, A, fen, stage, uplayer, ui] = [Z, Z.A, Z.fen, Z.stage, Z.uplayer, UI];
	assertion(stage == 'buy_or_pass', "ALREADY IN TURN ROUND!!!!!!!!!!!!!!!!!!!!!!");

	for (const plname of fen.canbuy) {
		let pl = fen.players[plname];
		if (pl.buy) {
			let card = fen.deck_discard.shift();
			pl.hand.push(card);
			deck_deal_safe_ferro(fen, plname, 1);
			pl.coins -= 1; //pay
			ari_history_list([`${plname} bought ${card}`], 'buy');
			break;
		}
	}
	deck_deal_safe_ferro(fen, fen.nextplayer, 1); //nextplayer draws

	Z.turn = fen.turn_after_ack;
	Z.stage = 'card_selection';

	clear_ack_variables();
	for (const k of ['canbuy']) delete fen[k];
	for (const plname of fen.plorder) { delete fen.players[plname].buy; }
	clear_transaction();
}
function ferro_ack_uplayer() {
	let [A, fen, stage, uplayer] = [Z.A, Z.fen, Z.stage, Z.uplayer];
	fen.players[uplayer].buy = A.selected[0] == 0;
	ack_player(uplayer);
}

//#endregion

// ferro helpers
function calc_ferro_score(roundwinner) {
	let [round, plorder, stage, A, fen, uplayer] = [Z.round, Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer];
	assertion(roundwinner == uplayer, 'calc_ferro_score: roundwinner != uplayer');
	for (const plname of plorder) {
		let pl = fen.players[plname];
		if (nundef(pl.score)) pl.score = 0;
		if (uplayer == plname) pl.score -= round * 5;
		else pl.score += calc_hand_value(pl.hand);
	}
}
function calc_ferro_highest_goal_achieved(pl) {
	let di = {
		'3': pl.journeys.length > 0 && is_group(pl.journeys[0]) && pl.journeys[0].length >= 3,
		'33': pl.journeys.length > 1 && is_group(pl.journeys[0]) && pl.journeys[0].length >= 3
			&& is_group(pl.journeys[1]) && pl.journeys[1].length >= 3,
		'4': pl.journeys.length > 0 && is_group(pl.journeys[0]) && pl.journeys[0].length >= 4,
		'44': pl.journeys.length > 1 && is_group(pl.journeys[0]) && pl.journeys[0].length >= 4
			&& is_group(pl.journeys[1]) && pl.journeys[1].length >= 4,
		'5': pl.journeys.length > 0 && is_group(pl.journeys[0]) && pl.journeys[0].length >= 5,
		'55': pl.journeys.length > 1 && is_group(pl.journeys[0]) && pl.journeys[0].length >= 5
			&& is_group(pl.journeys[1]) && pl.journeys[1].length >= 5,
		'7R': pl.journeys.length > 0 && is_sequence(pl.journeys[0]) && pl.journeys[0].length >= 7,
	};

	for (const k of ['7R', '55', '5', '44', '4', '33', '3']) {
		if (pl.goals[k]) {
			console.log('player', pl.name, 'already achieved goal', k);
			continue;
		}
		if (di[k]) {
			console.log('goal', k, 'available to', pl.name);
			return k;
		}
	}
	//console.log('no goal is available that matches the revealed sets! THIS SHOULD BE IMPOSSIBLE!!!!!!');
	return null;
}
function deck_deal_safe_ferro(fen, plname, n) {
	if (fen.deck.length < n) {
		fen.deck = fen.deck.concat(fen.deck_discard.reverse());
		fen.deck_discard = [];
	}
	let newcards = deck_deal(fen.deck, n);
	fen.players[plname].hand.push(...newcards);
	newcards.map(x => lookupAddToList(fen.players[plname], ['newcards'], x));
	return newcards;
}
function end_of_round_ferro() {
	let [plorder, stage, A, fen, uplayer] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer];
	let pl = fen.players[uplayer];
	//score all players
	calc_ferro_score(uplayer);
	ari_history_list([`${uplayer} wins the round`], 'action');
	Z.stage = 'card_selection';
	fen.round_winner = uplayer;
	fen.plorder = arrCycle(plorder, 1);
	let starter = fen.plorder[0];
	Z.turn = fen.turn = [starter];
	let deck = fen.deck = create_fen_deck('n', fen.num_decks, fen.num_decks * 4);
	let deck_discard = fen.deck_discard = [];
	shuffle(deck);
	shuffle(fen.plorder);
	let handsize = valf(Number(Z.options.handsize), 11);
	for (const plname of fen.plorder) {
		let pl = fen.players[plname];
		pl.hand = deck_deal(deck, plname == starter ? handsize + 1 : handsize);
		pl.journeys = [];
		pl.roundgoal = false;
		pl.roundchange = true;
		delete pl.handsorting;
	}
	Z.round += 1;
	//console.log('starter',starter,'turn',Z.turn,'round',Z.round);
	if (Z.round > Z.options.maxrounds) {
		ari_history_list([`game over`], 'action');
		Z.stage = 'game_over';
		fen.winners = find_players_with_min_score();
	}

}
function old_ensure_buttons_visible_ferro() {
	if (isdef(mBy('dbPlayer'))) return;
	let [plorder, stage, A, fen, uplayer, pl] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer, Z.fen.players[Z.uplayer]];
	if (fen.players[uplayer].hand.length <= 1) return; // only display for hand size > 1
	let d = iDiv(UI.players[uplayer]);
	mStyle(d, { position: 'relative' })
	//console.log('d', d);
	let dbPlayer = mDiv(d, { position: 'absolute', bottom: 2, left: 100, height: 25 }, 'dbPlayer');
	let styles = { rounding: 6, bg: 'silver', fg: 'black', border: 0, maleft: 10 };
	let bByRank = mButton('by rank', onclick_by_rank_ferro, dbPlayer, styles, 'enabled');
	let bBySuit = mButton('by suit', onclick_by_suit_ferro, dbPlayer, styles, 'enabled');
	if (Z.game == 'ferro') {
		let b = mButton('clear selection', onclick_clear_selection_ferro, dbPlayer, styles, 'enabled', 'bClearSelection'); //isEmpty(A.selected)?'disabled':'enabled');
		if (isEmpty(A.selected)) hide(b);
	}

}
function ensure_buttons_visible_ferro() {
	let [plorder, stage, A, fen, uplayer, pl] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer, Z.fen.players[Z.uplayer]];
	if (fen.players[uplayer].hand.length <= 1) return; // only display for hand size > 1
	let dbPlayer = mBy('dbPlayer');
	if (nundef(dbPlayer)) {
		let d = iDiv(UI.players[uplayer]);
		mStyle(d, { position: 'relative' })
		dbPlayer = mDiv(d, { position: 'absolute', bottom: 2, left: 100, height: 25 }, 'dbPlayer');
	}
	let styles = { rounding: 6, bg: 'silver', fg: 'black', border: 0, maleft: 10 };
	// let bByRank = mButton('by rank', onclick_by_rank_ferro, dbPlayer, styles, 'enabled');
	// let bBySuit = mButton('by suit', onclick_by_suit_ferro, dbPlayer, styles, 'enabled');
	if (Z.game == 'ferro') {
		let b = mButton('clear selection', onclick_clear_selection_ferro, dbPlayer, styles, 'enabled', 'bClearSelection'); //isEmpty(A.selected)?'disabled':'enabled');
		if (isEmpty(A.selected)) hide(b);
	}

}
function ensure_buttons_visible_for(plname) {
	if (Z.role == 'spectator' || isdef(mBy('dbPlayer'))) return;

	let fen = Z.fen;
	let pl = fen.players[plname];
	let plui = UI.players[plname];
	console.log('plui', plui);
	if (pl.hand.length <= 1) return; // only display for hand size > 1
	let d = iDiv(plui);
	mStyle(d, { position: 'relative' })
	//console.log('d', d);
	let dbPlayer = mDiv(d, { position: 'absolute', bottom: 2, left: 100, height: 25 }, 'dbPlayer');
	let styles = { rounding: 6, bg: 'silver', fg: 'black', border: 0, maleft: 10 };
	let bByRank = mButton('by rank', onclick_by_rank_ferro, dbPlayer, styles, 'enabled');
	let bBySuit = mButton('by suit', onclick_by_suit_ferro, dbPlayer, styles, 'enabled');
	// if (Z.game == 'ferro' && plname == uplayer) {
	// 	let b = mButton('clear selection', onclick_clear_selection_ferro, dbPlayer, styles, 'enabled', 'bClearSelection'); //isEmpty(A.selected)?'disabled':'enabled');
	// 	if (isEmpty(A.selected)) hide(b);
	// }

}
function ferro_is_set(cards, max_jollies_allowed = 1, seqlen = 7, group_same_suit_allowed = true) {
	//let [plorder, stage, A, fen, uplayer] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer];

	if (cards.length < 3) return false;
	let num_jollies_in_cards = cards.filter(x => is_joker(x)).length;
	if (num_jollies_in_cards > max_jollies_allowed) return false;

	cards = sortCardItemsByRank(cards.map(x => x), rankstr = '23456789TJQKA*');

	let rank = cards[0].rank;
	let isgroup = cards.every(x => x.rank == rank || is_joker(x));

	//check if all cards have either different suit or are jolly
	//check for duplicate suits in cards
	let suits = cards.filter(x => !is_joker(x)).map(x => x.suit);
	let num_duplicate_suits = suits.filter(x => suits.filter(y => y == x).length > 1).length;
	if (isgroup && !group_same_suit_allowed && num_duplicate_suits > 0) return false;
	else if (isgroup) return cards.map(x => x.key);

	let suit = cards[0].suit;
	if (!cards.every(x => is_jolly(x.key) || x.suit == suit)) return false;

	//if duplicate keys in cards, then it's not a set
	let keys = cards.map(x => x.key);
	if (keys.length != new Set(keys).size) return false;

	//console.log('checking for sequence!!!!!!!!!!!!!!!!!!!!!')
	let at_most_jollies = Math.min(num_jollies_in_cards, max_jollies_allowed);
	let num_jolly = sortCardItemsToSequence(cards, rankstr = '23456789TJQKA', at_most_jollies);
	//console.log('num_jolly', num_jolly);
	let cond1 = num_jolly <= at_most_jollies; //this sequence does not need more jollies than it should
	let cond2 = cards.length >= seqlen; //console.log('cond2', cond2);
	//console.log('cards', cards);
	if (cond1 && cond2) return cards.map(x => x.key); else return false;
}
function ferro_process_discard() {
	let [plorder, stage, A, fen, uplayer] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer];
	let pl = fen.players[uplayer];

	//discard is imminent! check if roundgoal has changed!
	if (!isEmpty(pl.journeys) && !pl.roundgoal) {
		//calculate highest available goal and set it true
		//roundgoal has been reached!
		if (is_fixed_goal()) {
			let goal = get_round_goal();
			pl.roundgoal = goal;
			pl.goals[goal] = true;
		} else {
			//calc highest goal achieved by this player OUT OF AVAILABLE goals!!
			let goal = calc_ferro_highest_goal_achieved(pl);
			pl.roundgoal = goal;
			pl.goals[goal] = true;
			ari_history_list([`${pl.name} achieved goal ${goal}`], 'achieve');
			//da muss ich zu verify_goals machen!

		}
	}

	let c = A.selectedCards[0].key;
	elem_from_to_top(c, fen.players[uplayer].hand, fen.deck_discard);
	ari_history_list([`${uplayer} discards ${c}`], 'discard');

	if (fen.players[uplayer].hand.length == 0) { end_of_round_ferro(); } else ferro_change_to_ack_round();

}
function ferro_process_set(keys) {
	//console.log('ferro_process_set', keys);
	let [plorder, stage, A, fen, uplayer, pl] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer, Z.fen.players[Z.uplayer]];
	//console.log('group', jsCopy(keys)); //schon falsch!!!


	if (is_group(keys)) {
		//console.log('group', keys);
		keys = sort_cards(keys, true, 'CDSH', true, '23456789TJQKA*');
	}
	let j = [];
	keys.map(x => elem_from_to(x, fen.players[uplayer].hand, j));
	fen.players[uplayer].journeys.push(j);

	//console.log('journey is finally', j)

	ari_history_list([`${uplayer} reveals ${j.join(', ')}`], 'action');
	Z.stage = 'card_selection';

}
function ferro_process_jolly(key, j) {
	let [plorder, stage, A, fen, uplayer] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer];
	//console.log('jolly', jsCopy(j));
	let a = key;
	let b = j.find(x => x[0] == '*');
	//console.log(`${a} replaced by ${b}`);
	arrReplace1(fen.players[uplayer].hand, a, b);
	replace_jolly(key, j);
	ari_history_list([`${uplayer} replaces for jolly`], 'action');
	Z.stage = 'card_selection';
}
function ferro_transaction_error(goals, transactions, callbackname) {
	let di = {
		'3': 'one set of 3',
		'33': 'two sets of 3',
		'4': 'one set of 4',
		'44': 'two sets of 4',
		'5': 'one set of 5',
		'55': 'two sets of 5',
		'7R': 'a sequence of 7',
	};

	//let goals = ['44', '5', '55', '7R'];

	let alternatives = [];
	let singles = goals.filter(x => x.length == 1).sort();
	let doubles = goals.filter(x => x != '7R' && x.length == 2).sort();
	let s7 = goals.filter(x => x == '7R');

	if (!isEmpty(singles)) alternatives.push(di[singles[0]]);
	if (!isEmpty(doubles) && (isEmpty(singles) || Number(singles[0][0]) > Number(doubles[0][0]))) alternatives.push(di[doubles[0]]);
	if (!isEmpty(s7)) alternatives.push(di[s7[0]]);

	// let min_els = find_minimum_by_func(DA.min_goals,x=>x[0]);
	// let min_numsets = (min_els.length == 2)?find_minimum_by_func(DA.min_goals,x=>length[x]):1;
	// let can_do_7R = DA.min_goals.includes('7R');

	//lowestNumber = DA.min_goals.find(x=>)
	let msg_min_req = `You need to fulfill the minimum requirement of ${alternatives.join(' or ')}!`;
	let l = transactions; //['jolly']; // DA.transactionlist;
	let [jolly, auflegen, anlegen] = [l.includes('jolly'), l.includes('auflegen'), l.includes('anlegen')];
	let msg_action = anlegen ? 'Anlegen requires auflegen von minimum first!' :
		'jolly' ? 'To exchange a jolly you need to be able to auflegen!' :
			'Your sets are not good enough!';

	let dError = mBy('dError');
	dError.innerHTML = `<h2>Impossible Transaction!</h2><p>${msg_min_req}</p><p>${msg_action}</p><div style="text-align:center">...performing rollback...</div>`;
	dError.innerHTML += `<div style="text-align:center"><button class="donebutton" onclick="${callbackname}()">CLICK TO CONTINUE</button></div>`;

}
function find_players_with_max_score() {
	let [plorder, stage, A, fen, uplayer] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer];
	let maxscore = -Infinity;
	let maxscorepls = [];
	for (const plname of plorder) {
		let pl = fen.players[plname];
		if (pl.score > maxscore) { maxscore = pl.score; maxscorepls = [plname]; }
		else if (pl.score == maxscore) maxscorepls.push(plname);
	}
	return maxscorepls;
}
function find_players_with_min_score() {
	let [plorder, stage, A, fen, uplayer] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer];
	let minscore = Infinity;
	let minscorepls = [];
	for (const plname of plorder) {
		let pl = fen.players[plname];
		if (pl.score < minscore) { minscore = pl.score; minscorepls = [plname]; }
		else if (pl.score == minscore) minscorepls.push(plname);
	}
	return minscorepls;

}
function get_available_goals(plname) {
	return ['3', '33', '4', '44', '5', '55', '7R'].filter(x => !Z.fen.players[plname].goals[x]);
}
function get_round_goal() { return get_keys(Z.fen.players[Z.uplayer].goals).sort()[Z.round - 1]; }
function is_correct_group(j, n = 3) { let r = j[0][0]; return j.length >= n && has_at_most_n_jolly(j, Z.options.jokers_per_group) && j.every(x => is_jolly(x) || x[0] == r); }
function is_fixed_goal() { return Z.options.phase_order == 'fixed'; }
function is_group(j) {
	if (j.length < 3) return false;
	let rank = firstCond(j, x => !is_jolly(x))[0];
	return j.every(x => is_jolly(x) || x[0] == rank);
}
function is_sequence(j) { return !is_group(j); }
function is_correct_group_illegal(cards) {
	//assumes that if this is a sequence, the sequence is correct!
	//this just tests whether the player is allowed to put down a 7sequence at this time

	//console.log('is_correct_group_illegal', cards);

	let keys = cards.map(x => x.key);
	let isgroup = is_group(keys);
	if (isgroup) return false;

	if (is_fixed_goal() && get_round_goal() != '7R') {
		//console.log('DESHALB!!!')
		return `the goal for this round is ${get_round_goal()}!`;
	}
	let [fen, uplayer] = [Z.fen, Z.uplayer];
	let pl = fen.players[uplayer];
	if (!is_fixed_goal() && pl.goals['7R'] == true) return `you can only have one sequence of 7!`;

	if (pl.journeys.find(x => is_sequence(x))) return `you can only have one sequence of 7!`;

	return false;

}
function is_legal_if_7R(cards) {
	//assumes that if this is a sequence, the sequence is legal,
	//this just tests whether the layer is allowed to put down a 7sequence at this time

	//console.log('is_legal_if_7R', cards);

	let keys = cards.map(x => x.key);
	let isgroup = is_group(keys);
	if (isgroup) return true;
	if (is_fixed_goal() && get_round_goal() != '7R') {
		//console.log('DESHALB!!!')
		return false;
	}
	let [fen, uplayer] = [Z.fen, Z.uplayer];
	let pl = fen.players[uplayer];
	if (!is_fixed_goal() && pl.goals['7R'] == true) return false;

	if (pl.journeys.find(x => is_sequence(x))) return false;

	return true;

}
function onclick_by_rank_ferro() {
	let [plorder, stage, A, fen, uplayer, pl] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer, Z.fen.players[Z.uplayer]];
	let items = ui_get_hand_items(uplayer).map(x => x.o);
	let h = UI.players[uplayer].hand;
	pl.handsorting = { n: items.length, by: 'rank' };
	//console.log('h ui', h);
	//console.log('items', items);
	let cardcont = h.cardcontainer;
	let ch = arrChildren(cardcont);
	ch.map(x => x.remove());
	let sorted = sortCardItemsByRank(items, '23456789TJQKA*');
	h.sortedBy = 'rank';
	for (const item of sorted) {
		mAppend(cardcont, iDiv(item));
	}
	//let sorted = items.sort((a, b) => a.o.rank - b.o.rank);
}
function onclick_by_suit_ferro() {
	let [plorder, stage, A, fen, uplayer, pl] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer, Z.fen.players[Z.uplayer]];
	let items = ui_get_hand_items(uplayer).map(x => x.o);
	let h = UI.players[uplayer].hand;
	pl.handsorting = { n: items.length, by: 'suit' };
	//console.log('h ui', h);
	let cardcont = h.cardcontainer;
	let ch = arrChildren(cardcont);
	ch.map(x => x.remove());
	let sorted = sortCardItemsByRank(items, '23456789TJQKA*');
	sorted = sortCardItemsBySuit(sorted);
	h.sortedBy = 'suit';
	for (const item of sorted) {
		mAppend(cardcont, iDiv(item));
	}
	//let sorted = items.sort((a, b) => a.o.rank - b.o.rank);
}
function onclick_clear_selection_ferro() { clear_selection(); }

function ui_get_buy_or_pass_items() {
	//console.log('uplayer',uplayer,UI.players[uplayer])
	let items = [], i = 0;
	items.push(ui_get_deck_item(UI.deck_discard));

	items = items.concat(ui_get_string_items(['pass']));

	reindex_items(items);
	return items;
}
function ui_get_ferro_items() {
	let [plorder, stage, A, fen, uplayer, pl] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer, Z.fen.players[Z.uplayer]];
	let items = ui_get_hand_items(uplayer);	//hand items

	//dazu alle aufgelegten jollys
	for (const plname of plorder) {
		let jlist = UI.players[plname].journeys;
		for (const jitem of jlist) {
			for (const o of jitem.items) {
				if (!is_joker(o)) { continue; }
				//console.log('card', o, jitem);
				let item = { o: o, a: o.key, key: o.key, friendly: o.short, path: jitem.path, index: 0 };
				items.push(item);
			}
		}
	}

	//dazu alle lead cards von aufgelegten groups
	for (const plname of plorder) {
		let jlist = UI.players[plname].journeys;
		for (const jitem of jlist) {
			let o = jitem.items[0]; // lead card
			let item = { o: o, a: o.key, key: o.key, friendly: o.short, path: jitem.path, index: 0 };
			items.push(item);
		}
	}

	//dazu die commands
	let cmds = ui_get_submit_items(['discard', 'auflegen', 'jolly', 'anlegen']);
	items = items.concat(cmds);

	reindex_items(items);
	return items;
}
function ui_get_submit_items(commands) {
	let items = [], i = 0;
	for (const cmd of commands) { //just strings!
		let item = { o: null, a: cmd, key: cmd, friendly: cmd, path: null, index: i, submit_on_click: true, itemtype: 'submit' };
		i++;
		items.push(item);
	}
	//console.log('available commands', items);
	return items;
}
function verify_min_req() {
	//verifies existence of groups but not correctness of each group, which is done when auflegen!
	let [fen, uplayer] = [Z.fen, Z.uplayer];
	let pl = fen.players[uplayer];

	let di = {
		'3': pl.journeys.length > 0 && is_group(pl.journeys[0]) && pl.journeys[0].length >= 3,
		'33': pl.journeys.length > 1 && is_group(pl.journeys[0]) && pl.journeys[0].length >= 3
			&& is_group(pl.journeys[1]) && pl.journeys[1].length >= 3,
		'4': pl.journeys.length > 0 && is_group(pl.journeys[0]) && pl.journeys[0].length >= 4,
		'44': pl.journeys.length > 1 && is_group(pl.journeys[0]) && pl.journeys[0].length >= 4
			&& is_group(pl.journeys[1]) && pl.journeys[1].length >= 4,
		'5': pl.journeys.length > 0 && is_group(pl.journeys[0]) && pl.journeys[0].length >= 5,
		'55': pl.journeys.length > 1 && is_group(pl.journeys[0]) && pl.journeys[0].length >= 5
			&& is_group(pl.journeys[1]) && pl.journeys[1].length >= 5,
		'7R': pl.journeys.length > 0 && is_sequence(pl.journeys[0]) && pl.journeys[0].length >= 7,
	};

	let goals = is_fixed_goal() ? [get_round_goal()] : get_available_goals(uplayer);
	//console.log('goals', goals, 'di', di, 'pl.journeys', pl.journeys);

	for (const g of goals) {
		if (di[g] == true) return true;
	}
	DA.min_goals = goals;
	return false;
}









