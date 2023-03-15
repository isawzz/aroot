const TESTHISTORY = true;
DA.HOSTAKEOVER = true;
DA.omnipower = false;
var firsttime = false;
function accuse() {
	function state_info(dParent) {
		let histinfo = !isEmpty(Z.fen.sessions) ? '(' + Z.fen.sessions.map(x => x.color == 'white' ? '_' : x.color).join(', ') + ')' : '';
		//console.log('sessions', histinfo);
		dParent.innerHTML = `Session ${Z.fen.phase} ${histinfo}`; //`phase: ${Z.phase}, turn: ${Z.turn}, stage:${Z.stage}`; 
		return false;
	}
	function setup(players, options) {
		//console.log('SETUP!!!!!!!!!!!!!!!!!!!')
		//console.log('players', players, 'options', options)
		let fen = { players: {}, plorder: jsCopy(players), history: [{ title: '*** game start ***', lines: [] }], rounds: options.rounds, policies_needed: options.policies_needed };
		//console.log(options)
		//fen.inc_handsize_by=options.handsize=="default"?0:Number(options.handsize);
		//console.log('increment handsize by',fen.inc_handsize_by)
		shuffle(fen.plorder);
		let plorder = fen.plorder;
		let num = Math.ceil(players.length / 2)
		let deck_identities = fen.deck_identities = [];
		let ranks = 'KQJT98765432A';
		for (let i = 0; i < num; i++) { deck_identities.push(ranks[i] + 'Hh'); deck_identities.push(ranks[i] + 'Sh'); }
		shuffle(deck_identities);

		//console.log('plorder', plorder)
		for (const plname of plorder) {
			//console.log('plname', plname)
			let pl = fen.players[plname] = {
				score: 0,
				name: plname,
				idleft: deck_deal(deck_identities, 1)[0],
				color: get_user_color(plname),
			};
		}

		//each player gets idright = idleft of next player
		for (let i = 0; i < plorder.length; i++) {
			let j = (i + 1) % plorder.length;
			fen.players[plorder[i]].idright = fen.players[plorder[j]].idleft;
		}

		[fen.phase, fen.stage, fen.step, fen.turn] = ['1', 'membership', 0, jsCopy(fen.plorder)];
		accuse_new_session(fen);

		//show_sitting_order
		accuse_show_sitting_order(fen);

		return fen;
	}
	function check_gameover() {
		if (Z.phase <= Z.fen.rounds) return false;

		//end reached: final scoring:
		let [fen, num] = [Z.fen, Z.fen.rounds];
		for (const plname in fen.players) {
			let pl = fen.players[plname];
			let cleft = get_color_of_card(pl.idleft);
			let cright = get_color_of_card(pl.idright);
			for (const sess of fen.sessions) {
				if (sess.color == cleft) pl.score += 1;
				if (sess.color == cright) pl.score += 1;
			}
			//if ( == color) pl.score += num;
			//if (get_color_of_card(pl.idright) == color) pl.score += num;
		}

		let playerlist = dict2list(fen.players, 'name');
		let sorted = sortByDescending(playerlist, 'score');
		//console.log('scores', sorted.map(x => `${x.name}:${x.score}`));
		let max_score = sorted[0].score;
		let all_winners = sorted.filter(x => x.score == max_score);
		fen.winners = all_winners.map(x => x.name);
		//console.log('sessions:', fen.sessions)
		return fen.winners;
	}
	return { state_info, setup, present: accuse_present, check_gameover, activate_ui: accuse_activate };
}

function accuse_present(dParent) {

	mStyle(mBy('dTitle'), { display: 'grid', 'grid-template-columns': 'auto 1fr auto' });

	DA.no_shield = true;
	let [fen, ui, stage, uplayer] = [Z.fen, UI, Z.stage, Z.uplayer];
	if (firsttime) { fen = Z.fen = getfen1(); firsttime = false; }
	let [dOben, dOpenTable, dMiddle, dRechts] = tableLayoutMR(dParent, 1, 0);
	let dt = dTable = dOpenTable; clearElement(dt); mCenterFlex(dt); mStyle(dt, { hmin: 700 })

	show_history(fen, dRechts);
	if (isdef(fen.msg)) {show_message(fen.msg,true);}

	let [hlg, hsm] = [80, 50];
	let [hpolcard, hvotecard, himg, hstatfz, hnetcard, hhandcard, gap] = [hsm, hlg, 50, 8, hsm, hlg, 4];
	let [hpol, hstat, hhand] = [hpolcard + 30, hvotecard + himg + hstatfz * 3 + gap * 2, hhandcard + 30];
	let [d1, d2, d3, d4, d5] = [mDiv(dt), mDiv(dt), mDiv(dt), mDiv(dt), mDiv(dt)];
	//for (const d of [d1, d2, d3, d4, d5]) { mCenterCenterFlex(d); mStyle(d, { gap:10, w: '100%', hmin: h }) }

	// *** test example ***
	//fen.policies = ['QHn','QSn','AHn','2Dn'];
	// fen.players[uplayer].membership='QSn'


	// *** d1 policies ***
	let [color, n] = get_policies_to_win();
	//if (isEmpty(fen.policies))
	UI.policies = ui_type_accuse_hand(fen.policies, d1, { h: hpol }, '', 'policies', accuse_get_card_func(hsm, GREEN), false);
	//console.log(UI.policies);
	mStyle(d1, { h: isEmpty(fen.policies) ? 40 : hpol, w: '90%', display: 'flex', gap: 12 })
	let msg = color == 'any' ? `${n} policies are needed to win!` : `${capitalize(color)} needs ${n} more policies`
	let x = mDiv(d1, { h: isEmpty(fen.policies) ? 40 : hpolcard }, null, msg); mCenterCenterFlex(x)

	// *** d2 players ***
	let wgap = 20;
	let players = fen.players;
	//console.log('himg',himg)
	let wneeded = (himg + wgap) * fen.plorder.length + wgap;
	//console.log('wneeded',wneeded)
	let wouter = '95%';
	mStyle(d2, { hmin: hstat, w: wouter }); mCenterFlex(d2);
	// mStyle(d2, { hmin: hstat, w: wouter, bg:GREEN }); mCenterFlex(d2);
	//let dstats = mDiv(d2, { display: 'flex', 'justify-content': 'space-between', 'align-items': 'space-evenly',gap:20, w: 'auto' });
	//let dstats = mGrid(1,fen.plorder-1,d2,{display:'inline-grid',w:wneeded}); //, { display: 'flex', 'justify-content': 'space-between', 'align-items': 'space-evenly',gap:20, w: 'auto' });
	let dstats = mDiv(d2, { w: wneeded }); //, bg:'lime'});
	dstats.style.gridTemplateColumns = 'repeat(' + (fen.plorder.length - 1) + ',1fr)';
	dstats.style.display = 'inline-grid';
	dstats.style.padding = dstats.style.gap = `${wgap}px`;
	let order = get_present_order();
	let me = order[0];
	//console.log(`me:${me} uplayer:${uplayer}`)
	assertion(me==uplayer,"MEEEEEEEEEEEEEEE")
	//assertion(me == uplayer,'order wrong!!!!!!!!')
	//console.log('order',order)
	// for(const plname of order){
	// 	let cleft = fen.players[plname].idleft;
	// 	//console.log(get_color_of_card(cleft),cleft);
	// 	//console.log(plname);
	// 	let cright = fen.players[plname].idright;
	// 	//console.log(get_color_of_card(cright),cright);
	// }
	for (const plname of order.slice(1)) { accuse_player_stat(dstats, plname, hvotecard, himg, hstatfz, gap); }
	mLinebreak(d2)

	// *** d3 me ***
	//mStyle(d3, { hmin: hstat, wmax: wneeded, bg:ORANGE })
	mStyle(d3, { hmin: hstat, w: wouter }); mCenterFlex(d3);
	// mStyle(d3, { hmin: hstat, w: wouter, bg:RED }); mCenterFlex(d3);
	//let dnet = mDiv(d3, { display: 'inline-flex', 'justify-content': 'space-between', 'align-items': 'space-evenly', w: wneeded });
	let dnet = mDiv(d3, { w: wneeded }); //, bg:'orange'});
	let wrest = wneeded - 2 * himg;
	//console.log('wrest',wrest)
	// dnet.style.gridTemplateColumns = `${himg}px ${wrest}px ${himg}px`; // 'repeat(' + 3 + ',1fr)';
	//dnet.style.gridTemplateColumns = `${hnetcard*.7}px 1fr ${hnetcard*.7}px`; // 'repeat(' + 3 + ',1fr)';
	dnet.style.gridTemplateColumns = `64px 1fr 64px`; // 'repeat(' + 3 + ',1fr)';
	dnet.style.display = 'inline-grid';
	dnet.style.padding = `${wgap}px`; // = dstats.style.gap = `${wgap}px`;

	let pl = fen.players[me];

	let par = (64 - hnetcard * .7) / 2;
	let d_idright = mDiv(dnet, { w: 64, padding: par }); //align:'center'}); //let d_idleft = mDiv(dnet,{align:'left'})
	let idright = get_color_card(pl.idright, hnetcard); mAppend(d_idright, iDiv(idright))

	let dme_stats = mDiv(dnet, { display: 'flex', 'justify-content': 'center', 'align-items': 'space-evenly' });//, w: 200 });
	let dx = accuse_player_stat(dme_stats, me, hvotecard, himg, hstatfz, gap);
	if (isdef(pl.membership)) {
		let c = get_color_of_card(pl.membership);
		mStyle(dx.dcombi, { bg: c, rounding: hnetcard / 10 });//, patop: 4 })
		mStyle(dx.dstats, { bg: c, fg: 'white' });
		dx.dimg.firstChild.width = dx.dimg.firstChild.height = himg - 10;
	}
	//mStyle(dx.dcombi,{bg:isdef(pl.membership)?get_color_of_card(pl.membership):'transparent'});
	//let membership = get_color_card(pl.membership, hnet); mAppend(dme_stats, iDiv(membership))

	// let d_idright = mDiv(dnet,{paright:align:'center'}); //'right'})
	let d_idleft = mDiv(dnet, { w: 64, padding: par }); //align:'center'}); //let d_idleft = mDiv(dnet,{align:'left'})
	let idleft = get_color_card(pl.idleft, hnetcard); mAppend(d_idleft, iDiv(idleft))

	// *** d4 hand ***
	mStyle(d4, { matop: 10, h: hhand, w: '90%' }); mCenterFlex(d4);
	let handui = ui_type_accuse_hand(pl.hand, d4, {}, `players.${uplayer}.hand`, 'hand', accuse_get_card_func(hhandcard));
	//mStyle(handui.container,{wmax:300})
	lookupSetOverride(ui, ['players', uplayer, 'hand'], handui);

	presentcards(hvotecard);
}

function accuse_activate() {
	let [pldata, stage, A, fen, phase, uplayer, turn, uname, host] = [Z.playerdata, Z.stage, Z.A, Z.fen, Z.phase, Z.uplayer, Z.turn, Z.uname, Z.host];

	let donelist = Z.playerdata.filter(x => isDict(x.state) && isdef(x.state.card));
	let complete = ['hand', 'membership'].includes(stage) && donelist.length >= turn.length || stage == 'round' && firstCond(pldata, x => isDict(x));
	if (complete && !sameList(turn, [Z.host])) {
		//console.log('complete', turn, sameList(turn, [Z.host]), 'uplayer', uplayer);
		Z.turn = [Z.host];
		if (stage == 'hand') fen.cardsrevealed = true;
		Z.stage = Z.stage + 'resolve';
		take_turn_fen();
		return;
	}
	//if still here and multiturn: it cannot be complete or Z.host is only player on turn now!
	let waiting = isdef(donelist.find(x => x.name == uplayer)) && turn.length > 1;
	assertion(!complete || sameList(turn, [Z.host]), 'complete hat nicht zu host uebergeben!!!!!!!!!!')
	assertion(!complete || !waiting, 'ERROR WAITING WHEN COMPLETE!!!')
	Z.isWaiting = waiting; //das ist nur fuer page tab title animated vs static
	if (waiting) {
		//console.log('WAITING!!', stage, uplayer);
		accuse_show_selected_state(donelist.find(x => x.name == uplayer).state);
		if (Z.mode != 'multi') { take_turn_waiting(); return; }
		autopoll();
	} else if (stage == 'handresolve') {
		assertion(uplayer == Z.host && fen.cardsrevealed, 'NOT THE STARTER WHO COMPLETES THE STAGE!!!')
		//console.log('RESOLVING votes on click!!!!!!!!!!!!!')
		DA.gobutton = mButton('evaluate cards', accuse_evaluate_votes, dTable, { w: 300 }); // () => { Z.stage = 'handresolve_weiter'; take_turn_fen(); }, dTable, { w: 300 });
	} else if (stage == 'membershipresolve') {
		assertion(uplayer == Z.host, 'NOT THE STARTER WHO COMPLETES THE STAGE!!!')
		//console.log('RESOLVING membership!!!!!!!!!!!!!')
		let histest = [];
		for (const pldata of Z.playerdata) {
			let plname = pldata.name;
			let card = pldata.state.card;
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
		//console.log('RESOLVING round => new session!!!!!!!!!!!!!')
		Z.turn = jsCopy(Z.plorder);
		Z.phase = Number(Z.phase) + 1;
		Z.stage = 'membership';
		for (const pl in fen.players) { delete fen.players[pl].membership; }
		accuse_new_session(fen);
		take_turn_fen_clear();
	} else if (stage == 'president') {
		let accuse_action_available = !fen.isprovisional || fen.players[uplayer].hand.length >= 1;
		let parlay_action_available = get_others_with_at_least_one_hand_card().length >= 1;
		let actions = ['defect', 'resign'];
		if (parlay_action_available) actions.unshift('parlay');
		if (accuse_action_available) actions.unshift('accuse');
		select_add_items(ui_get_string_items(actions), president_action, 'must select action to play', 1, 1);
	} else if (stage == 'pay_for_accuse') {
		select_add_items(ui_get_hand_items(uplayer), pay_for_accuse_action, 'must pay a card for accuse action', 1, 1);
	} else if (stage == 'accuse_action_select_player') {
		let plnames = get_keys(fen.players);
		let validplayers = plnames.filter(x => fen.players[x].hand.length >= 1 && x != uplayer);
		select_add_items(ui_get_player_items(validplayers), accuse_submit_accused, 'must select player name', 1, 1);
	} else if (stage == 'accuse_action_select_color') {
		select_add_items(ui_get_string_items(['red', 'black']), accuse_submit_accused_color, 'must select color', 1, 1);
	} else if (stage == 'accuse_action_entlarvt') {
		select_add_items(ui_get_hand_items(uplayer), accuse_replaced_membership, 'must select new alliance', 1, 1);
	} else if (stage == 'accuse_action_provisional') {
		select_add_items(ui_get_hand_items(uplayer), accuse_replaced_membership, 'must select new alliance', 1, 1);
	} else if (stage == 'accuse_action_policy') {
		select_add_items(ui_get_hand_items(uplayer), accuse_enact_policy, 'may enact a policy', 0, 1);
	} else if (stage == 'accuse_action_new_president') {
		set_new_president();
	} else if (stage == 'parlay_select_player') {
		let players = get_others_with_at_least_one_hand_card();
		select_add_items(ui_get_player_items(players), parlay_player_selected, 'must select player to exchange cards with', 1, 1);
	} else if (stage == 'parlay_select_cards') {
		select_add_items(ui_get_hand_items(uplayer), parlay_cards_selected, 'may select cards to exchange', 0, fen.maxcards);
	} else if (stage == 'parlay_opponent_selects') {
		let n = fen.player_cards.length;
		select_add_items(ui_get_hand_items(uplayer), parlay_opponent_selected, `must select ${n} cards`, n, n);
	} else if (stage == 'defect_membership') {
		select_add_items(ui_get_hand_items(uplayer), defect_resolve, 'may replace your alliance', 0, 1);
	} else if (stage == 'membership') {
		select_add_items(ui_get_hand_items(uplayer), accuse_submit_membership, 'must select your alliance', 1, 1);
	} else if (stage == 'hand') {
		select_add_items(ui_get_hand_items(uplayer), accuse_submit_card, 'may select card to play', 0, 1);
	} else if (stage == 'round') {
		//let d = mDiv(dTable, {}, null, `Session end! ${fen.sessions[fen.phase - 1].color} wins`);
		show_special_message(`Session end! ${fen.sessions[fen.phase - 1].color} wins`, false, 3000, 0, { top: 67 })
		if (is_ai_player(uplayer)) accuse_onclick_weiter();
		else {
			mLinebreak(dTable, 12)
			mButton('WEITER', accuse_onclick_weiter, dTable, {}, ['donebutton', 'enabled']);
		}
	} else {
		//console.log('Z',Z)
		alert('PROBLEM!!!')
	}
}

//#region president sequence of actions
function president_action() {
	let [A, uplayer, fen] = [Z.A, Z.uplayer, Z.fen];
	let action = A.items[A.selected[0]].a;
	//console.log('president', Z.uplayer, 'selects action', action)

	if (action == 'accuse') {
		Z.stage = fen.isprovisional ? 'pay_for_accuse' : 'accuse_action_select_player';
		accuse_activate();

	} else if (action == 'parlay') {
		Z.stage = 'parlay_select_player';
		accuse_activate();

	} else if (action == 'defect') {
		Z.stage = 'defect_membership';
		accuse_activate();

	} else if (action == 'resign') {
		ari_history_list(`${uplayer} resigns as president`, 'resign')
		president_end();
	}
}

function pay_for_accuse_action() {
	let [A, uplayer, fen] = [Z.A, Z.uplayer, Z.fen];
	let card = A.items[A.selected[0]].a;
	removeInPlace(fen.players[uplayer].hand, card); accuse_discard(card)
	redraw_hand();
	Z.stage = 'accuse_action_select_player';
	ari_history_list(`${uplayer} pays for accuse action`, 'accuse')
	accuse_activate();
}
function accuse_submit_accused() {
	let [A, uplayer, fen] = [Z.A, Z.uplayer, Z.fen];
	let plname = A.items[A.selected[0]].a;
	//console.log('president', Z.uplayer, 'accuses', plname);
	fen.accused = plname;
	Z.stage = 'accuse_action_select_color';
	ari_history_list(`${uplayer} accuses ${plname}`, 'accuse')
	accuse_activate();
}
function accuse_submit_accused_color() {
	let [A, uplayer, fen, accused] = [Z.A, Z.uplayer, Z.fen, Z.fen.accused];
	let color = A.items[A.selected[0]].a;


	//console.log('president', uplayer, 'accused', accused, 'of being', color);

	//now check the color
	let card = fen.players[accused].membership;
	let real_color = get_color_of_card(card);
	ari_history_list(`${uplayer} guesses ${color == real_color ? 'CORRECT' : 'WRONG'} (${color})`, 'accuse')
	console.log(`PRESIDENT GUESSES ${color == real_color ? 'CORRECT' : 'WRONG!!!'}!!!`);
	fen.msg = `PRESIDENT GUESSES ${color == real_color ? 'CORRECT' : 'WRONG!!!'}!!!`;
	if (color == real_color) {
		//guess was correct!
		//president keeps membership card
		//accused needs to replace membership card
		//console.log('PRESIDENT GUESSES CORRECTLY!!!')
		Z.turn = [accused];
		//console.log(fen.players[uplayer], fen.players[uplayer].hand, card)
		fen.players[uplayer].hand.push(card);
		delete fen.players[accused].membership;
		Z.stage = 'accuse_action_entlarvt';
		take_turn_fen();
	} else {
		//console.log('PRESIDENT GUESSES WRONG!!!!!!!!!!!!');
		Z.turn = [accused];
		fen.players[accused].hand.push(card);
		//fen.president = accused;
		//fen.isprovisional = true;
		delete fen.players[accused].membership;
		Z.stage = 'accuse_action_provisional';
		take_turn_fen();

	}

}
function accuse_replaced_membership() {
	let [A, uplayer, fen, accused] = [Z.A, Z.uplayer, Z.fen, Z.fen.accused];

	assertion(accused == uplayer, "accuse_replace_membership: WRONG PLAYER!!!!")
	let card = A.items[A.selected[0]].a;
	//remove from hand, set membership
	let pl = fen.players[uplayer];
	accuse_discard(pl.membership)
	pl.membership = card;
	removeInPlace(pl.hand, card);
	fen.newpresident = Z.stage == 'accuse_action_entlarvt' ? null : accused;
	Z.turn = [fen.president];
	Z.stage = Z.stage == 'accuse_action_entlarvt' ? 'accuse_action_policy' : 'accuse_action_new_president';
	ari_history_list(`${accused} chooses new membership` + (TESTHISTORY ? ` ${card}` : ''), 'accuse');
	take_turn_fen();

}
function accuse_enact_policy() {
	let [A, uplayer, fen, accused] = [Z.A, Z.uplayer, Z.fen, Z.fen.accused];
	let card = isEmpty(A.selected) ? '' : A.items[A.selected[0]].a;

	//this card is chosen as a policy
	if (!isEmpty(card)) {
		lookupAddToList(fen, ['policies'], card);
		removeInPlace(fen.players[uplayer].hand, card);
		ari_history_list(`${uplayer} enacts a ${get_color_of_card(card)} policy`, 'policy')

		//look if last X policies are same color =>dominance
		let arr = arrTakeLast(fen.policies, fen.policies_needed);
		let color = arrAllSame(arr, get_color_of_card);
		if (color && arr.length >= fen.policies_needed) {
			//session ends here!!! 
			fen.dominance = true;
			ari_history_list(`${color} dominance reached!`, 'session ends')

			//update score
			accuse_score_update(color);
			Z.turn = jsCopy(Z.plorder);
			//Z.phase += 1
			Z.stage = 'round';
			take_turn_fen_clear();


		} else {
			president_end();
		}


	} else {
		president_end();
	}
}
function set_new_president() {
	let fen = Z.fen;
	fen.president = fen.newpresident;
	delete fen.newpresident;
	fen.isprovisional = true;
	Z.stage = 'president';
	Z.turn = [fen.president];
	ari_history_list(`new president is ${fen.president}`, 'provisional president')
	take_turn_fen();
}


function parlay_player_selected() {
	let [A, uplayer, fen] = [Z.A, Z.uplayer, Z.fen];
	let other = fen.other = A.items[A.selected[0]].a;
	fen.maxcards = Math.max(fen.players[other].hand.length, fen.players[uplayer].hand.length);
	Z.stage = 'parlay_select_cards'
	accuse_activate();
}
function parlay_cards_selected() {
	let [A, uplayer, fen] = [Z.A, Z.uplayer, Z.fen];
	let player_cards = fen.player_cards = A.selected.map(x => A.items[x].a);
	Z.turn = [fen.other];
	Z.stage = 'parlay_opponent_selects';
	take_turn_fen();
}
function parlay_opponent_selected() {
	let [A, uplayer, fen] = [Z.A, Z.uplayer, Z.fen];
	let opp_cards = A.selected.map(x => A.items[x].a);
	//resolve!
	let pl1 = fen.players[fen.president];
	let pl2 = fen.players[uplayer];
	fen.player_cards.map(x => removeInPlace(pl1.hand, x))
	fen.player_cards.map(x => pl2.hand.push(x));
	opp_cards.map(x => removeInPlace(pl2.hand, x))
	opp_cards.map(x => pl1.hand.push(x));

	ari_history_list(`president ${fen.president} exchanged ${opp_cards.length} cards with ${uplayer}`, 'parlay')

	president_end();
}

function defect_resolve() {
	let [A, uplayer, fen] = [Z.A, Z.uplayer, Z.fen];
	let card = A.items[A.selected[0]].a;
	let pl = fen.players[uplayer];
	let mem = pl.membership;
	pl.membership = card;
	removeInPlace(pl.hand, card);

	let def = Z.options.defected;
	console.log('defected', def);
	if (def == 'remove') accuse_discard(mem);
	else if (def == 'exchange') pl.hand.push(mem);
	else if (def == 'draw') pl.hand.push(fen.deck_discard.shift())

	ari_history_list(`${uplayer} replaces membership`, 'defect')
	president_end();
}

function president_end() {
	let fen = Z.fen;

	fen.validvoters = jsCopy(fen.plorder)
	Z.turn = get_valid_voters();
	Z.stage = 'hand';

	fen.cardsrevealed = false;

	delete fen.president;
	delete fen.newpresident;
	delete fen.isprovisional;
	delete fen.player_cards;
	delete fen.accused;
	delete fen.msg;
	//console.log('...end of president', get_keys(fen));
	take_turn_fen_clear();
}
//#__endregion

//#region helpers
function accuse_discard(card) { Z.fen.deck_discard.push(card) }
function accuse_new_session(fen, players) {
	let deck_discard = fen.deck_discard = [];
	let deck_ballots = create_fen_deck('n'); shuffle(deck_ballots);
	let ranks = 'KQJT98765432A';
	let tb = {
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
	if (nundef(players)) players = get_keys(fen.players);
	let N = players.length;
	let [rmax, rmin, handsize] = isdef(tb[N]) ? tb[N] : ['A', 'K', Math.min(8, Math.floor(52 / N))];

	//modiy handsize options.handsize
	//handsize += Number(fen.inc_handsize_by);

	let [imin, imax] = [ranks.indexOf(rmin), ranks.indexOf(rmax)];
	//console.log('N',players.length,'minrank',imin,'maxrank',imax)
	deck_ballots = deck_ballots.filter(x => {
		let i = ranks.indexOf(x[0])
		return i >= imin && i <= imax;
	});
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

	//ari_history_list(`*** session ${fen.phase} starts ***`,'',fen)

}
function accuse_onclick_weiter() {
	Z.state = { plname: Z.uplayer };
	take_turn_multi();
}
function accuse_score_update(color) {
	let [fen] = [Z.fen];

	let session_entry = { color: color };
	let plsession = session_entry.players = {};

	for (const plname in fen.players) {
		let pl = fen.players[plname];

		plsession[plname] = get_color_of_card(pl.membership); // { left: get_color_of_card(pl.idleft), middle: get_color_of_card(pl.membership), right: get_color_of_card(pl.idright) };

		//if (get_color_of_card(pl.idleft) == color) pl.score += 1;
		//if (get_color_of_card(pl.idright) == color) pl.score += 1;
		if (get_color_of_card(pl.membership) == color) pl.score += 1;
	}

	lookupAddToList(fen, ['sessions'], session_entry);
	//console.log('SCORE UPDATE!!!', fen.phase, color, '\nentry', session_entry);


}
function accuse_submit_card() {
	//console.log('A',Z.A);
	let A = Z.A;
	let card = isEmpty(A.selected) ? '' : A.items[A.selected[0]].a;
	Z.state = { card: card };
	take_turn_multi();
}
function accuse_submit_membership() {
	//console.log('A',Z.A);
	let A = Z.A;
	let card = A.items[A.selected[0]].a;
	//console.log('player',Z.uplayer,'selectes membership',card,Z.fen.players[Z.uplayer].hand)
	Z.state = { card: card };
	take_turn_multi();
}
function arrAllSame(arr, func) {
	let arr1 = arr.map(x => func(x));
	let sample = arr1[0];
	for (let i = 1; i < arr1.length; i++) if (arr1[i] != sample) return false;
	return sample;
}
function get_valid_voters() {
	return Z.fen.validvoters.filter(x => Z.fen.players[x].hand.length >= 1);
}
function get_players_with_at_least_one_hand_card() {
	return get_keys(Z.fen.players).filter(x => Z.fen.players[x].hand.length >= 1);
}
function get_others_with_at_least_one_hand_card() {
	//console.log('uplayer',Z.uplayer)
	return get_keys(Z.fen.players).filter(x => x != Z.uplayer && Z.fen.players[x].hand.length >= 1);
}
function presentcards(h) {
	if (startsWith(Z.stage, 'hand')) {
		let donelist = Z.playerdata.filter(x => isDict(x.state) && isdef(x.state.card));
		//let reveal = donelist.length >= turn.length
		for (const pld of donelist) {
			let plname = pld.name;
			let plui = lookup(UI, ['stats', plname]);
			let dcard = plui.dcard;

			if (isEmpty(arrChildren(dcard))) {
				// console.log('dcard',dcard)
				let card = pld.state.card;
				let actualcard = plui.actualcard = !isEmpty(card)
				let card1 = plui.card = ari_get_card(actualcard ? card : 'AHn', h)
				mAppend(dcard, iDiv(card1));
			}
			if (!Z.fen.cardsrevealed || !plui.actualcard) face_down(plui.card);
		}
	}
}
function redraw_hand() {
	let [uplayer, fen, ui, dt] = [Z.uplayer, Z.fen, UI, dTable];
	let ch = arrChildren(dt);
	let handui = UI.players[uplayer].hand.container;
	handui.remove();
	//dt.lastchild.remove();
	let pl = fen.players[uplayer];
	lookupSetOverride(ui, ['players', uplayer, 'hand'], ui_type_hand(pl.hand, dt, { paleft: 25 }, `players.${uplayer}.hand`));


}







