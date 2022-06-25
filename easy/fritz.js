
function fritz() {
	function state_info(dParent) { fritz_state_info(dParent); }
	function setup(players, options) {
		let fen = { players: {}, plorder: jsCopy(players), history: [], cycles: 0 };

		//calc how many decks are needed (basically 1 suit per person, plus 1 for the deck)
		let n = players.length;
		fen.num_decks = n == 2 ? 1 : 2 + (n > 5 ? Math.ceil((n - 5) / 2) : 0); //<=5?2:Math.max(2,Math.ceil(players.length/3));

		fritz_new_table(fen, options);
		let deck = fen.deck;

		shuffle(fen.plorder);
		let starter = fen.starter = fen.plorder[0];
		//console.log('options', options);
		let handsize = valf(Number(options.handsize), 11);
		for (const plname of players) {
			let pl = fen.players[plname] = {
				hand: deck_deal(deck, plname == starter ? handsize + 1 : handsize),
				loosecards: [],
				time_left: options.seconds_per_game * 1000, //seconds
				score: 0,
				name: plname,
				color: get_user_color(plname),
			};
		}
		[fen.phase, fen.stage, fen.turn] = ['', 'card_selection', [starter]];
		return fen;
	}
	function present(z, dParent, uplayer) { fritz_present_new(z, dParent, uplayer); }
	function check_gameover() { return isdef(Z.fen.winners) ? Z.fen.winners : false; }
	function activate_ui() { fritz_activate_ui(); }
	return { state_info, setup, present, check_gameover, activate_ui };
}

function fritz_present_new(z, dParent, uplayer) {

	let [fen, ui, stage] = [z.fen, UI, z.stage];
	let [dOben, dOpenTable, dMiddle, dRechts] = tableLayoutMR(dParent, 5, 1); mFlexWrap(dOpenTable)
	Config.ui.card.h = 130;
	Config.ui.container.h = Config.ui.card.h + 30;

	//let deck = ui.deck = ui_type_deck(fen.deck, dOpenTable, { maleft: 12 }, 'deck', 'deck', fritz_get_card);
	if (isEmpty(fen.deck_discard)) {
		mText('discard empty', dOpenTable);
		ui.deck_discard = { items: [] }
	} else {
		let deck_discard = ui.deck_discard = ui_type_hand(fen.deck_discard, dOpenTable, { maright: 25 }, 'deck_discard', 'discard', fritz_get_card, true);
		let i = 0; deck_discard.items.map(x => { x.source = 'discard'; x.index = i++ });
	}
	mLinebreak(dOpenTable);


	let ddarea = UI.ddarea = mDiv(dOpenTable, { border: 'dashed 1px black', bg: '#eeeeee80', box: true, padding: '5px 50px 5px 5px', margin: 5 });
	mDroppable(ddarea, drop_card_fritz); ddarea.id = 'dOpenTable'; Items[ddarea.id] = ddarea;
	mFlexWrap(ddarea)

	fritz_stats_new(z, dRechts);

	show_history(fen, dRechts);

	DA.TJ = [];
	//journeys become groups
	//fen.journeys = [['QHn', 'KHn', 'AHn'], ['QCn', 'QHn', 'QDn']];
	for (const j of fen.journeys) {
		let cards = j.map(x => fritz_get_card(x));
		frnew(cards[0], { target: 'hallo' });
		for (let i = 1; i < cards.length; i++) { fradd(cards[i], Items[cards[0].groupid]); }

	}
	//loose cards of fen and other players become groups. own loose cards will go to player area
	let loosecards = ui.loosecards = jsCopy(fen.loosecards).map(c => fritz_get_card(c));
	for (const plname of fen.plorder) {
		let cards = fen.players[plname].loosecards.map(c => fritz_get_card(c));
		cards.map(x => x.owner = plname);
		// if (plname == uplayer) { ui.ploosecards = cards; } else { loosecards = loosecards.concat(cards); }
		if (plname != uplayer) { loosecards = loosecards.concat(cards); }
	}
	for (const looseui of loosecards) {
		//console.log('looseui', looseui);
		let card = looseui;
		frnew(card, { target: 'hallo' });
	}

	//all cards in drop area are droppable
	for (const group of DA.TJ) {
		let d = iDiv(group);
		//console.log('d',d);
		let ch = arrChildren(iDiv(group));
		let cards = ch.map(x => Items[x.id]);
		//console.log('cards', cards);
		cards.map(x => mDroppable(iDiv(x), drop_card_fritz));
	}

	ui.players = {};
	let uname_plays = fen.plorder.includes(Z.uname);
	let plmain = uname_plays && Z.mode == 'multi' ? Z.uname : uplayer;
	fritz_present_player(plmain, dMiddle);

	if (TESTING) {
		for (const plname of arrMinus(fen.plorder, plmain)) {
			fritz_present_player(plname, dMiddle);
		}
	}


}
function fritz_present_player(playername, dMiddle) {
	let [fen, ui, stage] = [Z.fen, UI, Z.stage];
	let pl = fen.players[playername];
	let playerstyles = { w: '100%', bg: '#ffffff80', fg: 'black', padding: 4, margin: 4, rounding: 10, border: `2px ${get_user_color(playername)} solid` };
	let d = mDiv(dMiddle, playerstyles, null, get_user_pic_html(playername, 25)); mFlexWrap(d); mLinebreak(d, 10);
	if (isdef(pl.handsorting)) {
		let bysuit = pl.handsorting.by == 'suit';
		let [arr1, arr2] = arrSplitAtIndex(pl.hand, pl.handsorting.n - 1);
		pl.hand = sort_cards(arr1, bysuit, 'CDSH', true, '23456789TJQKA*').concat(arr2);
	}
	let upl = ui.players[playername] = { div: d };
	upl.hand = ui_type_hand(pl.hand, d, {}, `players.${playername}.hand`, 'hand', fritz_get_card);
	upl.hand.items.map(x => x.source = 'hand');

	let ploose = pl.loosecards;
	if (!isEmpty(ploose)) {
		//console.log('ploosecards', ploose);
		upl.loose = ui_type_market(ploose, d, {}, `players.${playername}.loose`, 'untouchables', fritz_get_card);
		upl.loose.items.map(x => x.source = 'loose');
	} else {
		//console.log('player has no loose cards',pl);
	}
}
function fritz_stats_new(z, dParent) {
	let player_stat_items = UI.player_stat_items = ui_player_info(z, dParent);
	let fen = z.fen;
	for (const uname of fen.plorder) {
		let pl = fen.players[uname];
		let item = player_stat_items[uname];
		let d = iDiv(item); mCenterFlex(d); mLinebreak(d);

		player_stat_count('hand with fingers splayed', calc_hand_value(pl.hand, fritz_get_card), d);
		player_stat_count('star', pl.score, d);

		if (fen.turn.includes(uname)) { show_hourglass(uname, d, 30, { left: -3, top: 0 }); }
	}
}
function fritz_state_info(dParent) {
	let user_html = get_user_pic_html(Z.uplayer, 30);
	dParent.innerHTML = `Round ${Z.round}:&nbsp;player: ${user_html} `;
}
function get_mouse_pos(ev) { return ({ x: ev.clientX, y: ev.clientY }); }

function fritz_activate_ui() {
	//return;
	let [plorder, stage, A, fen, uplayer, pl] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer, Z.fen.players[Z.uplayer]];
	A.autosubmit = false;

	new_cards_animation(1);
	round_change_animation(1);

	//UI.players[uplayer].hand.items.map(x=>iDiv(x).onclick=()=>onclick_fritz_discard(x));
	select_add_items(ui_get_hand_items(uplayer), end_of_turn_fritz, 'must drag drop cards to assemble groups, then discard 1 hand card', 0, 1);

	A.items.map(x => iDiv(x).onclick = ev => {
		let card = Items[x.id];
		let item = x;
		clear_quick_buttons();
		select_last(item, select_toggle, ev);
		if (item.index == A.selected[0]) {
			//mach so einen button dorthin wo die mouse ist!
			let pos = get_mouse_pos(ev);
			console.log('mouse pos', pos);
			let b = DA.bQuick = mButton('discard', ev => {
				b.remove();
				end_of_turn_fritz();
			}, document.body, { position: 'absolute', left: pos.x - 40, top: pos.y - 10 }, 'selectbutton');

		}
		console.log('clicked card', card, '\nitem', item);
		//output mouse position on page

	});

	UI.timer = select_timer(0, end_of_turn_fritz);

	ensure_buttons_visible_ferro();

}

// #region fritz helpers
function add_card_to_group(card, group) {
	card.groupid = group.id;

	//hier muss card von UI hand entfernen wenn source == 'hand'
	if (card.source == 'hand') {
		let hand = UI.players[Z.uplayer].hand;
		removeInPlace(hand.items, card);
	}

	card.source = 'group';
	mDroppable(iDiv(card), drop_card_fritz);
	group.ids.push(card.id);
	mAppend(iDiv(group), iDiv(card));
	resplay_container(group);
}
function allowDrop(ev) {	ev.preventDefault();}
function calc_fritz_score() {
	let [round, plorder, stage, A, fen, uplayer] = [Z.round, Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer];
	for (const plname of plorder) {
		let pl = fen.players[plname];
		if (nundef(pl.score)) pl.score = 0;
		else pl.score += calc_hand_value(pl.hand.concat(pl.loosecards), fritz_get_card);
	}
}
function clear_quick_buttons() {
	if (isdef(DA.bQuick)) { DA.bQuick.remove(); delete DA.bQuick; }
}
function cleanup_or_resplay(oldgroup) {
	if (isdef(oldgroup) && isEmpty(oldgroup.ids)) {
		let oldgroupid = oldgroup.id;
		//console.log('delete group', oldgroupid);
		mRemove(iDiv(oldgroup));
		removeInPlace(DA.TJ, oldgroup);
		delete Items[oldgroupid];
	} else if (isdef(oldgroup)) { resplay_container(oldgroup) }
}
function deck_deal_safe_fritz(fen, plname, n = 1) {
	if (fen.deck.length < n) {
		fen.deck = create_fen_deck('n');
		fen.loosecards.push('*Hn'); //1 jolly kommt dazu!
	}
	let newcards = deck_deal(fen.deck, n);
	fen.players[plname].hand.push(...newcards);
	newcards.map(x => lookupAddToList(fen.players[plname], ['newcards'], x));
	return newcards;
}
function drag(ev) {	clear_quick_buttons();	ev.dataTransfer.setData("text", ev.target.id); }
function drop_card_fritz(ev) {
	ev.preventDefault();
	evNoBubble(ev);
	var data = ev.dataTransfer.getData("text");
	//console.log('data',data);
	let card = Items[data];

	//console.log('dropped',data,card,'to',ev.target);
	let target_id = evToClosestId(ev);
	if (card.source == 'discard') {
		//console.log('drop', card.index + '-th', 'from', card.source, 'to', target_id);

		let [discard, loose] = arrSplitAtIndex(UI.deck_discard.items, card.index);
		//console.log('discard', discard.map(x => x.key), 'loose', loose.map(x => x.key));
		c=loose[0];
		loose = loose.slice(1);
		assertion(c == card,'NEEEEEEEE');
		for(const c of loose){
			console.log('card',c.key,'source',c.source)
			if (c.source == 'discard') frnew(c,{target:'dummy'});
		}

	}


	if (target_id == 'dOpenTable') {
		//mach eine neue journey
		//console.log('table-dropped',data);
		frnew(card, ev);

	} else if (isdef(Items[target_id])) {
		let targetcard = Items[target_id];
		//console.log('dropped',data,'to card',target_id);
		//console.log('targetcard',targetcard);
		let targetgroup = Items[targetcard.groupid];
		fradd(card, targetgroup);
	} else {
		//console.log('ERROR IMPOSSIBLE!!!! dropped',data,card,'to',target_id);
	}
	//ev.target.appendChild(document.getElementById(data));
}
function end_of_round_fritz(plname) {

	//console.log('fritz_round_over', plname);

	let [A, fen, uplayer, plorder] = [Z.A, Z.fen, Z.uplayer, Z.plorder];
	let pl = fen.players[uplayer];

	calc_fritz_score();
	ari_history_list([`${plname} wins the round`], 'action');
	fen.round_winner = plname;
	if (uplayer == arrLast(plorder)) {
		//cycle plorder by 1 and start next round with plorder[0]
		fen.plorder = arrCycle(fen.plorder, 1);
		let newStarter = fen.plorder[0];
		fen.cycles += 1;
		if (fen.cycles >= Z.options.cycles) {
			fen.winners = find_players_with_min_score();
			ari_history_list([`game over: ${fen.winners.join(', ')} win${fen.winners.length == 1 ? 's' : ''}`], 'action');
			Z.stage = 'game_over';
		} else fen.turn = Z.turn = [newStarter];

	} else {
		Z.turn = [get_next_player(Z, uplayer)];
	}

	//dann muss noch deal new deck
	if (isdef(fen.winners)) return;

	Z.round += 1;
	fritz_new_table(fen, Z.options);
	fritz_new_player_hands(fen, Z.turn[0], Z.options);
}
function end_of_turn_fritz() {
	//console.log('A', Z.A)
	//console.log('time is up!!!', getFunctionsNameThatCalledThisFunction());
	let [A, fen, uplayer, plorder] = [Z.A, Z.fen, Z.uplayer, Z.plorder];
	let pl = fen.players[uplayer];
	//console.log('__________________________');

	clear_quick_buttons();

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

	//check gameover!!!!
	if (isEmpty(fenhand) && isEmpty(fen.players[uplayer].loosecards)) {
		end_of_round_fritz(uplayer);

	} else {
		Z.turn = [get_next_player(Z, uplayer)];
		deck_deal_safe_fritz(fen, Z.turn[0]);
	}
	//console.log('==>fen.loosecards', fen.loosecards); //, fen.players[uplayer].loosecards); //, fen.players);
	let ms = fen.players[uplayer].time_left = stop_user_timer();

	//console.log('fritz_turn_ends', 'ms', ms);
	if (ms <= 0) {
		console.log('time is up!!!');
		//this player needs to be removed!
		if (Z.turn[0] == uplayer) Z.turn = [get_next_player(Z, uplayer)];
		//if only 1 player in plorder, that player wins
		remove_player(fen, uplayer);
		if (plorder.length == 1) { end_of_round_fritz(plorder[0]); }
	}

	turn_send_move_update();

}
function frnew(card, ev) {
	let oldgroup = untie_card(card);

	//making a new group in TJ
	let id = getUID('g');
	let d = mDiv(Items.dOpenTable, { bg: 'random', display: 'grid', margin: 10 }, id);
	let group = { div: d, id: id, ids: [] };
	assertion(isdef(DA.TJ), 'DA.TJ undefined in frnew!!!');
	DA.TJ.push(group);
	Items[id] = group;

	add_card_to_group(card, group);
	cleanup_or_resplay(oldgroup);
	// console.log('groups', DA.TJ);
}
function fradd(card, targetgroup) {
	let oldgroup = untie_card(card);
	add_card_to_group(card, targetgroup);
	cleanup_or_resplay(oldgroup);
	//console.log('groups', DA.TJ);
}
function fritz_get_card(ckey, h, w, ov = .25) {
	//joker is represented as '*Hn' where second letter is digit 0..9 (up to 9 jokers in play!)
	// H suit damit er beim sortieren immer rechts aufscheint!
	let type = ckey[2];
	// let info = type == 'n' ? to_aristocard(ckey) : type == 'l' ? to_luxurycard(ckey) : to_commissioncard(ckey);
	//den joker gibt es NICHT!!!!
	//console.log('ckey',ckey)
	let info = ckey[0] == '*' ? get_joker_info() : jsCopy(C52Cards[ckey.substring(0, 2)]);
	info.key = ckey;
	info.cardtype = ckey[2]; //n,l,c=mini...
	let [r, s] = [info.rank, info.suit];
	info.val = r == '*' ? 25 : r == 'A' ? 1 : 'TJQK'.includes(r) ? 10 : Number(r);
	//console.log('r',r,'val',info.val)
	info.color = RED;
	info.sz = info.h = valf(h, Config.ui.card.h);
	info.w = valf(w, info.sz * .7);
	info.irank = '23456789TJQKA*'.indexOf(r);
	info.isuit = 'SHCDJ'.indexOf(s);
	info.isort = info.isuit * 14 + info.irank;
	let card = cardFromInfo(info, h, w, ov);
	card.id = iDiv(card).id = getUID('c');
	Items[card.id] = card;

	//make each card ui draggable
	mDraggable(card);
	//mDroppable(card, drop_card_fritz);

	return card;
}
function fritz_new_table(fen, options) {
	fen.deck = create_fen_deck('n', fen.num_decks, 0);
	fen.deck_discard = [];
	fen.journeys = [];
	fen.loosecards = ['*Hn'];
	shuffle(fen.deck);
}
function fritz_new_player_hands(fen, starter, options) {
	let handsize = options.handsize;
	let deck = fen.deck;

	for (const plname of fen.plorder) {
		let pl = fen.players[plname];
		pl.hand = deck_deal(deck, plname == starter ? handsize + 1 : handsize);
		pl.loosecards = [];
		pl.time_left = options.seconds_per_game * 1000; //seconds
		pl.roundchange = true;
		delete pl.handsorting;

	}
}
function resplay_container(targetgroup) {
	let d = iDiv(targetgroup);
	let card = Items[targetgroup.ids[0]];
	mContainerSplay(d, 2, card.w, card.h, arrChildren(d).length, .25 * card.w);
	let items = arrChildren(d).map(x => Items[x.id]);
	ui_add_cards_to_hand_container(d, items);
}
function untie_card(card) {
	remove_from_selection(card);
	clear_selection();

	let oldgroupid = card.groupid;
	if (isdef(oldgroupid)) delete card.owner;

	let oldgroup = Items[oldgroupid];
	if (isdef(oldgroup)) removeInPlace(oldgroup.ids, card.id);
	return oldgroup;
}

