function bluff() {
	function bluff_clear_ack() { if (Z.stage == 1) bluff_change_to_turn_round(); }
	function bluff_check_gameover(Z) { let pls = get_keys(Z.fen.players); if (pls.length < 2) Z.fen.winners = pls; return valf(Z.fen.winners, false); }
	function bluff_setup(players, options) {
		let fen = { players: {}, plorder: jsCopy(players), history: {}, stage: 'move', phase: '' };

		//how many decks? 
		//for each player there must be enough cards for maxsize: 
		let num_cards_needed = players.length * options.max_handsize;

		let num_decks_needed = fen.num_decks = Math.ceil(num_cards_needed / 52);
		//console.log('need', num_decks_needed, 'decks for', players.length, 'players with max_handsize', options.max_handsize);
		//let deckletters = 'brgopy'.substring(0, num_decks_needed);
		let deck = fen.deck = create_fen_deck('n', num_decks_needed);
		shuffle(deck);
		//console.log('vor shuffle',jsCopy(fen.plorder));
		shuffle(fen.plorder);
		//console.log('nach shuffle',jsCopy(fen.plorder));
		fen.turn = [fen.plorder[0]];
		for (const plname of fen.plorder) {
			let handsize = options.min_handsize;
			fen.players[plname] = {
				hand: deck_deal(deck, handsize),
				handsize: handsize,
				name: plname,
				color: get_user_color(plname),
			};
		}

		//console.log('fen', fen)
		fen.stage = 0;
		return fen;
	}

	function bluff_activate() { bluff_activate_new(); }
	function bluff_present(Z, dParent, uplayer) { bluff_present_new(dParent); }
	function bluff_stats(Z, dParent) { bluff_stats_new(dParent); }
	function bluff_state(dParent) { bluff_state_new(dParent); }

	return { clear_ack: bluff_clear_ack, state_info: bluff_state, setup: bluff_setup, present: bluff_present, check_gameover: bluff_check_gameover, stats: bluff_stats, activate_ui: bluff_activate };

}

function bluff_present_new(dParent) {
	let [dOben, dOpenTable, dMiddle, dRechts] = tableLayoutMR(dParent, 1, 0); ///tableLayoutOMR(dParent, 5, 1);
	let [fen, uplayer, ui, stage, dt] = [Z.fen, Z.uplayer, UI, Z.stage, dOpenTable];
	clearElement(dt); mCenterFlex(dt);

	//state update
	if (stage == 1) { DA.no_shield = true; } else { DA.ack = {}; DA.no_shield = false; }

	bluff_stats_new(dt);

	mLinebreak(dt, 10);

	bluff_show_cards(dt);

	mLinebreak(dt, 4);

	let item = ui.currentBidItem = bluff_show_current_bid(dt);
	//console.log('button',item.button)
	hide(item.button);

	mLinebreak(dt, 10);

	if (stage == 1) {

		let loser = fen.loser;
		let msg1 = fen.war_drin ? 'war drin!' : 'war NICHT drin!!!';
		let msg2 = isdef(fen.players[loser]) ? `${capitalize(loser)} will get ${fen.players[loser].handsize} cards!` : `${capitalize(loser)} is out!`;
		mText(`<span style="color:red">${msg1} ${msg2}</span>`, dt, { fz: 22 });
		mLinebreak(dt, 4);
	}
}
function bluff_activate_new() {
	let [z, A, fen, stage, uplayer, ui, dt] = [Z, Z.A, Z.fen, Z.stage, Z.uplayer, UI, UI.dOpenTable];
	if (stage == 1) bluff_activate_stage1(); else { bluff_activate_stage0(); if (is_ai_player()) ai_move(); }
}
function bluff_stats_new(dParent) {
	let player_stat_items = UI.player_stat_items = ui_player_info(Z, dParent, {}, { 'border-width': 1, margin: 10, wmax: 180 });
	let fen = Z.fen;
	for (const uname of fen.plorder) {
		let pl = fen.players[uname];
		let item = player_stat_items[uname];
		let d = iDiv(item); mCenterFlex(d); mLinebreak(d);
		if (fen.turn.includes(uname)) {
			let dh = show_hourglass(uname, d, 20, { left: -4, top: 0 });
		}
		let dhz = mDiv(d, { fg: pl.handsize == Z.options.max_handsize ? 'yellow' : 'white' }, null, `hand: ${pl.handsize}`); mLinebreak(d);
		if (uname == fen.loser) UI.dHandsize = dhz;
		let elem = mDiv(d, { fg: uname == fen.lastbidder ? 'red' : 'white' }, null, `${valf(pl.lastbid, ['_']).join(' ')}`);
		let szhand = getSizeNeeded(dhz);
		let sz = getSizeNeeded(elem);
		let w = Math.max(szhand.w + 20, sz.w + 20, 80);
		mStyle(d, { w: w }); //, bg: 'blue' });
		//mDiv(d, { fg: 'white' }, null, `bid: ${valf(pl.lastbid, ['_']).join(' ')}`); 
		mLinebreak(d);
	}
	return player_stat_items[Z.uplayer];
}
function bluff_state_new(dParent) {
	let user_html = get_user_pic_html(Z.uplayer, 30);
	dParent.innerHTML = `Round ${Z.round}:&nbsp;player: ${user_html} `;
	//dParent.innerHTML = `Round ${Z.round}`; 

}

//#region ack_ NEW!
function bluff_change_to_ack_round(fen, nextplayer) {
	start_simple_ack_round(1, jsCopy(fen.plorder), nextplayer, 'bluff_change_to_turn_round', true);	//_bluff_change_to_ack_round();
}
function bluff_change_to_turn_round() {
	let [z, A, fen, stage, uplayer, ui] = [Z, Z.A, Z.fen, Z.stage, Z.uplayer, UI];
	assertion(stage == 1, "ALREADY IN TURN ROUND!!!!!!!!!!!!!!!!!!!!!!")
	Z.turn = fen.turn_after_ack;
	//console.log('bluff_change_to_turn_round', Z.turn);
	Z.round += 1;
	Z.stage = 0;
	for (const k of ['bidder', 'loser', 'aufheber', 'lastbid', 'lastbidder']) delete fen[k];
	for (const plname of fen.plorder) { delete fen.players[plname].lastbid; }
	clear_ack_variables();
}
function bluff_ack_uplayer() {
	let [A, fen, stage, uplayer] = [Z.A, Z.fen, Z.stage, Z.uplayer];
	fen.players[uplayer].ack = true;
	//DA.ack[uplayer] = true;
	ack_player(uplayer);
}

//#endregion


//#region helpers
function aggregate_player_hands_by_rank(fen) {
	let di_ranks = {};
	let akku = [];
	for (const uname in fen.players) {
		let pl = fen.players[uname];
		let hand = pl.hand;
		for (const c of hand) {
			akku.push(c);
			let r = c[0];
			if (isdef(di_ranks[r])) di_ranks[r] += 1; else di_ranks[r] = 1;
		}
	}
	//console.log('di_ranks', di_ranks);
	fen.akku = akku;
	return di_ranks;
}
function apply_skin1(item) {
	let d = item.container; mCenterFlex(d); mStyle(d, { position: 'relative', w: 400 }); //,bg:'pink'});
	mText(`${item.label}: <span style="font-size:20px;margin:10px;color:red">${item.content}</span>`, d);
	let b = mButton(item.caption, item.handler, d, { position: 'absolute', right: 0, top: 'calc( 50% - 12px )', h: 24 }, ['selectbutton', 'enabled']);
	console.log('button', b)
}
function apply_skin2(item) {
	let d = item.container; mCenterFlex(d); mStyle(d, { position: 'relative', w: 400 }); //,bg:'pink'});
	let h = 24;
	let top = `calc( 50% - ${h / 2}px )`
	mText(item.label + ':', d, { position: 'absolute', left: 0, top: top, h: h });
	mText(`<span style="font-size:20px;margin:10px;color:red">${item.content}</span>`, d);
	item.button = mButton(item.caption, item.handler, d, { position: 'absolute', right: 0, top: top, h: h, w: 80 }, ['selectbutton', 'enabled']);
	//console.log('button', item.button)
}
function apply_skin3(item) {
	let d = item.container; mCenterCenterFlex(d); mStyle(d, { position: 'relative', w: 400 }); //,bg:'pink'});
	let h = 24;
	let top = `calc( 50% - ${h / 2}px )`
	mText(item.label + ':', d, { position: 'absolute', left: 0, top: top, h: h });

	// let panel = UI.dAnzeige=item.panel=mDiv(d,{bg:'rgb(240, 165, 85)',padding:'6px 12px',w:200,align:'center',rounding:8});
	let panel = UI.dAnzeige = item.panel = mDiv(d, { bg: '#ffffff80', padding: '4px 12px', w: 200, align: 'center', rounding: 8 });
	let words = toWords(item.content)
	let panelitems = UI.panelItems = item.panelitems = [];
	for (let i = 0; i < 4; i++) {
		let text = valf(words[i], '');
		let dw = mDiv(panel, { hpadding: 4, display: 'inline', fz: 22, weight: 'bold', fg: 'red' }, `dbid_${i}`, text);
		//dw.onclick = () => selectText(dw);
		panelitems.push({ div: dw, index: i, initial: text, state: 'unselected' })
	}
	// item.buttonX = mButtonX(d,'tr',bluff_clear_panel,null,12);
	let b = item.buttonX = mDiv(panel, { fz: 10, hpadding: 4, bg: 'white' }, null, 'CLR', 'enabled'); mPlace(b, 'tr', 2)
	b.onclick = bluff_clear_panel;

	//mText(`<span style="font-size:20px;margin:10px;color:red">${item.content}</span>`, d);
	item.button = mButton(item.caption, item.handler, d, { position: 'absolute', right: 0, top: top, h: h, w: 80 }, ['selectbutton', 'enabled']);
	//console.log('button', item.button)
}
function bid_to_string(bid) { return bid.join(' '); }
function bluff_activate_stage0() {
	let [z, A, fen, stage, uplayer, ui, dt] = [Z, Z.A, Z.fen, Z.stage, Z.uplayer, UI, UI.dOpenTable];
	//console.log('lastbid',fen.lastbid)
	if (isdef(fen.lastbid)) show(ui.currentBidItem.button);
	bluff_show_new_bid(dt);
	mLinebreak(dt, 10);
	bluff_button_panel1(dt, fen.newbid, 50);
}
function bluff_activate_stage1() {
	let [z, A, fen, stage, uplayer, ui, dt] = [Z, Z.A, Z.fen, Z.stage, Z.uplayer, UI, UI.dOpenTable];

	if (isdef(DA.ack) && isdef(DA.ack[uplayer])) { console.log('DA.ack', DA.ack); mText('...waiting for ack', dt); return; }

	mPulse(ui.dHandsize, 2000);
	mButton('WEITER', () => {
		bluff_ack_uplayer();
		if (isEmpty(Z.turn) || Z.mode == 'hotseat') { bluff_change_to_turn_round(); turn_send_move_update(); }

	}, dt, { fz: 22 }, ['donebutton']);
}
function bluff_button_panel1(dt, bid, sz) {
	let n = bid[0] == '_' ? 1 : Number(bid[0]);
	let arr1 = arrRange(n, n + 5);
	let arr2 = toLetters('3456789TJQKA');
	let arr3 = arrRange(0, 5);
	let arr4 = toLetters('3456789TJQKA');

	// bluff_rows(dt, sz, arr1, arr2, arr3, arr4);
	let dPanel = mDiv(dt, { gap: 5 });
	[d1, d2, d3, d4] = mColFlex(dPanel, [1, 2, 1, 2]);//,[YELLOW,ORANGE,RED,BLUE]);
	UI.dn1 = create_bluff_input1(d1, arr1, 1, sz, 0); d1.onmouseenter = () => iHigh(UI.panelItems[0]); d1.onmouseleave = () => iUnhigh(UI.panelItems[0]);
	UI.dr1 = create_bluff_input1(d2, arr2, 2, sz, 1); d2.onmouseenter = () => iHigh(UI.panelItems[1]); d2.onmouseleave = () => iUnhigh(UI.panelItems[1]);
	UI.dn2 = create_bluff_input1(d3, arr3, 1, sz, 2); d3.onmouseenter = () => iHigh(UI.panelItems[2]); d3.onmouseleave = () => iUnhigh(UI.panelItems[2]);
	UI.dr2 = create_bluff_input1(d4, arr4, 2, sz, 3); d4.onmouseenter = () => iHigh(UI.panelItems[3]); d4.onmouseleave = () => iUnhigh(UI.panelItems[3]);

}
function bluff_clear_panel() {
	for (const item of UI.panelItems) {
		let d = iDiv(item);
		d.innerHTML = '_';
	}
	Z.fen.newbid = ['_', '_', '_', '_'];
}
function bluff_generate_random_bid() {
	let [A, fen, uplayer] = [Z.A, Z.fen, Z.uplayer];
	const di2 = { _: '_', three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 'T', jack: 'J', queen: 'Q', king: 'K', ace: 'A' };
	//const di2 = { three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 'T', jack: 'J', queen: 'Q', king: 'K', ace: 'A' };
	let words = get_keys(di2).slice(1);

	let b = isdef(fen.lastbid) ? jsCopy(fen.lastbid) : null;
	//console.log('last bid:', isdef(b) ? b : 'null');
	if (isdef(b)) {
		assertion(b[0] >= (b[2] == '_' ? 0 : b[2]), 'bluff_generate_random_bid: bid not formatted correctly!!!!!!!', b)
		//console.log('existing bid is', b);
		if (b[3] == '_') { b[2] = 1; b[3] = rChoose(words, 1, x => x != b[1]); }
		else if (b[0] > b[2]) { b[2] += 1; } //console.log('new bid is now:', b); }
		else { b[0] += coin() ? 1 : 2; if (coin()) b[2] = b[3] = '_'; }
	} else {
		//let words = get_keys(di2); //!!!!!!!!!!!!!!!!!!!!!!!!!!NOOOOOOOOOOOOOOOOOOO
		b = [rChoose([1, 2, 3, 4]), rChoose(words), rChoose([1, 2]), rChoose(words)];
		if (b[1] == b[3]) b[3] = rChoose(words, 1, x => x != b[1]);
		if (coin()) b[2] = b[3] = '_';
	}
	fen.newbid = b;
	//console.log('new bid:', b);
	UI.dAnzeige.innerHTML = bid_to_string(b);

}
function bluff_reset_to_current_bid() { onclick_reload(); }

function bluff_show_cards(dt) {
	let [fen, ui, stage, uplayer] = [Z.fen, UI, Z.stage, Z.uplayer];
	let pl = fen.players[uplayer], upl = ui.players[uplayer] = {};

	mText(stage == 1 ? "all players' cards: " : "player's hand: ", dt); mLinebreak(dt, 2);
	let cards = stage == 1 ? fen.akku : pl.hand;

	//pl.hand = ['QHn','QCn','2Hn','3Sn','AHn','5Cn','5Sn']
	cards = sort_cards(cards, false, 'CDSH', true, '3456789TJQKA2');
	let hand = upl.hand = ui_type_hand(cards, dt, { hmin: 160 }, null, '', ckey => ari_get_card(ckey, 150));

	let uname_plays = isdef(fen.players[Z.uname]);;//Z.turn.includes(Z.uname);
	let ishidden = stage == 0 && uname_plays && uplayer != Z.uname && Z.mode != 'hotseat';

	if (ishidden) { hand.items.map(x => face_down(x)); }
	//mStyle(hand.container, { h: 110 });
}
function bluff_show_current_bid(dt) {
	let fen = Z.fen;
	let bid = fen.oldbid = valf(fen.lastbid, ['_', '_', '_', '_']);
	//bid = fen.oldbid = ['4', 'queen', '3', 'jack'];

	let d = mDiv(dt);
	let content = `${bid_to_string(bid)}`;
	let item = { container: d, label: 'current bid', content: content, caption: 'geht hoch!', handler: handle_gehtHoch };
	apply_skin2(item);
	return item;
}
function bluff_show_new_bid(dt) {
	let fen = Z.fen;
	let bid = fen.oldbid = valf(fen.lastbid, ['_', '_', '_', '_']);
	fen.newbid = jsCopy(bid); // ['4', 'queen', '3', 'jack'];

	let d = mDiv(dt);
	let content = `${bid_to_string(bid)}`;
	let item = { container: d, label: 'YOUR bid', content: content, caption: 'BID', handler: handle_bid };
	apply_skin3(item);
}
function calc_bid_minus_cards(fen, bid) {
	//console.log('bid',bid)

	let di2 = { _: '_', three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 'T', jack: 'J', queen: 'Q', king: 'K', ace: 'A' };
	let di_ranks = aggregate_player_hands_by_rank(fen);
	//console.log('all hands:', di_ranks);

	let [brauch1, r1, brauch2, r2] = bid;
	[r1, r2] = [di2[r1], di2[r2]];
	if (brauch1 == '_') brauch1 = 0;
	if (brauch2 == '_') brauch2 = 0;

	let hab1 = valf(di_ranks[r1], 0);
	let hab2 = valf(di_ranks[r2], 0);
	let wildcards = valf(di_ranks['2'], 0);

	//console.log('cards contain:', c1, 'of', r1, ',', c2, 'of', r2, 'and', wildcards, '2er');
	//console.log('bid', bid);

	// if (hab1 < brauch1) { let diff1 = brauch1 - hab1; if (wildcards < diff1) return false; wildcards -= diff1; }
	// if (hab2 < brauch2) { let diff2 = brauch2 - hab2; if (wildcards < diff2) return false; wildcards -= diff2; }

	let diff1 = Math.max(0, brauch1 - hab1);
	let diff2 = Math.max(0, brauch2 - hab2);
	return diff1 + diff2 - wildcards;
}
function create_bluff_input1(dParent, arr, units = 1, sz, index) {
	let d = mDiv(dParent, { gap: 5, w: units * sz * 1.35 }); mCenterFlex(d);
	for (const a of arr) {
		let da = mDiv(d, { align: 'center', wmin: 20, padding: 4, cursor: 'pointer', rounding: 4, bg: units == 1 ? '#e4914b' : 'sienna', fg: 'contrast' }, null, a == 'T' ? '10' : a); //units == 1?a:di[a]);
		da.onclick = () => input_to_anzeige1(a, index);

	}
	return d;
}
function handle_gehtHoch() {
	let [A, fen, uplayer] = [Z.A, Z.fen, Z.uplayer];
	let [bid, bidder] = [fen.lastbid, fen.lastbidder];

	let diff = calc_bid_minus_cards(fen, bid); // hier wird schon der akku gemacht!!! ich kann also jetzt die cards renewen!!!
	let aufheber = uplayer;
	let loser = diff > 0 ? bidder : aufheber;

	let war_drin = fen.war_drin = diff <= 0;

	let loser_handsize = inc_handsize(fen, loser);
	new_deal(fen);

	//determine next player
	let nextplayer;
	if (loser_handsize > Z.options.max_handsize) {
		nextplayer = get_next_player(Z, loser)
		let plorder = fen.plorder = remove_player(fen, loser);
	} else {
		nextplayer = loser;
	}
	fen.loser = loser; fen.bidder = bidder; fen.aufheber = aufheber;

	bluff_change_to_ack_round(fen, nextplayer);

	turn_send_move_update();
}
function handle_bid() {
	let [z, A, fen, uplayer, ui] = [Z, Z.A, Z.fen, Z.uplayer, UI];

	let oldbid = jsCopy(fen.oldbid);
	let bid = jsCopy(fen.newbid);
	//console.log('oldbid', jsCopy(oldbid), '\nnewbid', jsCopy(bid));

	//first sort new bid so that the higher number component is first
	let ranks = '23456789TJQKA';
	let need_to_sort = bid[0] == '_' && bid[2] != '_'
		|| bid[2] != '_' && bid[2] > bid[0]
		|| bid[2] == bid[0] && is_higher_ranked_name(bid[3], bid[1]);

	if (need_to_sort) {
		//console.log('need_to_sort', need_to_sort);
		let [h0, h1] = [bid[0], bid[1]];
		[bid[0], bid[1]] = [bid[2], bid[3]];
		[bid[2], bid[3]] = [h0, h1];
		//console.log('bid sorted:', bid);
	}

	//replace all _ by 0
	if (bid[0] == '_') bid[0] = 0;
	if (bid[2] == '_') bid[2] = 0;
	if (oldbid[0] == '_') oldbid[0] = 0;
	if (oldbid[2] == '_') oldbid[2] = 0;

	//check if newbid is higher than old bid
	let higher = bid[0] > oldbid[0]
		|| bid[0] == oldbid[0] && is_higher_ranked_name(bid[1], oldbid[1])
		|| bid[0] == oldbid[0] && bid[1] == oldbid[1] && bid[2] > oldbid[2]
		|| bid[0] == oldbid[0] && bid[1] == oldbid[1] && bid[2] == oldbid[2] && is_higher_ranked_name(bid[3], oldbid[3]);
	//console.log('YES, new bid is higher!!!');

	//set fen.lastbid
	if (!higher) {
		select_error('the bid you entered is not high enough!');
		//console.log('oldbid', oldbid, '\nnewbid', bid)
	} else {
		//set lastbid
		//convert 0 back to '_'
		if (bid[2] == 0) bid[2] = '_';
		fen.lastbid = fen.players[uplayer].lastbid = bid; //fen.newbid;
		fen.lastbidder = uplayer;
		delete fen.oldbid; delete fen.newbid;
		Z.turn = [get_next_player(Z, uplayer)];
		turn_send_move_update();
		//next person's turn
	}
}
function iHigh(item) { let d = iDiv(item); mStyle(d, { bg: 'darkgray' }); } //mClass(d, 'highbg'); }
function iUnhigh(item) { let d = iDiv(item); mStyle(d, { bg: 'transparent' }); } //mClassRemove(d, 'silver'); }
function inc_handsize(fen, uname) {
	let pl = fen.players[uname];
	//console.log('handsize',pl.handsize,typeof pl.handsize)
	// deck_add(fen.deck,1,pl.hand);
	pl.handsize += 1;
	// pl.handsize = pl.hand.length;
	return pl.handsize;
	// let sz = .handsize;
	// fen.players[uname].handsize = sz + 1;
	// return sz + 1;
}
function input_to_anzeige1(caption, index) {

	//console.log('click!!!!!!!!!!!!!!!!!!!!!!!!!!!', caption, index)
	let [A, fen, uplayer] = [Z.A, Z.fen, Z.uplayer];
	const di = { '3': 'three', '4': 'four', '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine', T: 'ten', J: 'jack', Q: 'queen', K: 'king', A: 'ace' };

	let bid = fen.newbid;

	if (index == 0) {
		bid[0] = Number(caption);
		if (bid[0] == 0) {
			bid[0] = '_'; bid[1] = '_';
		} else if (bid[1] == '_') {
			let hand = fen.players[uplayer].hand;
			let c1 = arrLast(hand); //highest
			let r = c1[0];
			if (r == '2') r = bid[3] == 'ace' ? 'K' : 'A';
			if (di[r] == bid[3]) bid[1] = bid[3] == 'three' ? 'four' : 'three'; else bid[1] = di[r];
		}
	} else if (index == 1) {
		bid[1] = di[caption];
		if (bid[0] == '_') bid[0] = 1;
		if (bid[3] == bid[1]) { bid[0] = bid[0] + bid[2]; bid[2] = bid[3] = '_'; }
	} else if (index == 2) {
		bid[2] = Number(caption);
		if (bid[2] == 0) {
			bid[2] = '_'; bid[3] = '_';
		} else if (bid[3] == '_') {
			let hand = fen.players[uplayer].hand;
			let c1 = hand[0];
			let r = c1[0];
			if (r == '2') r = bid[1] == 'ace' ? 'K' : 'A';
			if (di[r] == bid[1]) bid[3] = bid[1] == 'three' ? 'four' : 'three'; else bid[3] = di[r];
		}
	} else {
		bid[3] = di[caption];
		if (bid[2] == '_') bid[2] = 1;
		if (bid[3] == bid[1]) { bid[0] = bid[0] + bid[2]; bid[1] = bid[3]; bid[2] = bid[3] = '_'; }
	}

	//console.log('newbid array is now', fen.newbid);
	//UI.dAnzeige.innerHTML = bid_to_string(bid);
	//iDiv(UI.panelItems[index]).innerHTML = bid[index];
	for (let i = 0; i < 4; i++)	iDiv(UI.panelItems[i]).innerHTML = bid[i];
}

function is_higher_ranked_name(f1, f2) {
	// let di2 = { _: 0, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 'T', jack: 'J', queen: 'Q', king: 'K', ace: 'A' };
	let di2 = { _: 0, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, jack: 11, queen: 12, king: 13, ace: 14 };
	return di2[f1] > di2[f2];
}
function new_deal(fen) {
	//console.log('new deal!!!!!!!!!!!!!', Z.uplayer)
	let deck = fen.deck = create_fen_deck('n', fen.num_decks);
	shuffle(deck);
	for (const plname in fen.players) {
		let pl = fen.players[plname];
		let handsize = pl.handsize;
		pl.hand = deck_deal(deck, handsize);
	}
}




















