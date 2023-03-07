const TESTHISTORY = true;
function accuse() {
	function state_info(dParent) { dParent.innerHTML = `phase: ${Z.phase}, turn: ${Z.turn}, stage:${Z.stage}`; }
	function setup(players, options) {
		//console.log('SETUP!!!!!!!!!!!!!!!!!!!')
		let fen = { players: {}, plorder: jsCopy(players), history: [{ title: '*** game start ***', lines: [] }], rounds: options.rounds,policies_needed: options.policies_needed };
		shuffle(fen.plorder);
		let starter = fen.starter = fen.plorder[0];
		let num = Math.ceil(players.length / 2)
		let deck_identities = fen.deck_identities = [];
		let ranks = 'KQJT98765432A';
		for (let i = 0; i < num; i++) { deck_identities.push(ranks[i] + 'Hh'); deck_identities.push(ranks[i] + 'Sh'); }
		shuffle(deck_identities);

		let plorder = fen.plorder;
		for (const plname of plorder) {
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
		let fen = Z.fen;
		let playerlist = dict2list(fen.players, 'name');
		let sorted = sortByDescending(playerlist, 'score');
		//console.log('scores', sorted.map(x => `${x.name}:${x.score}`));
		let max_score = sorted[0].score;
		let all_winners = sorted.filter(x => x.score == max_score);
		fen.winners = all_winners.map(x => x.name);
		console.log('sessions:',fen.sessions)
		return fen.winners;
	}
	return { state_info, setup, present: accuse_present, check_gameover, activate_ui: accuse_activate };
}

function accuse_present(dParent) {
	let [fen, ui, stage, uplayer] = [Z.fen, UI, Z.stage, Z.uplayer];
	let [dOben, dOpenTable, dMiddle, dRechts] = tableLayoutMR(dParent, 1, 0); ///tableLayoutOMR(dParent, 5, 1);
	//dHistory = mDiv(dOben,{},'dHistory','history: '+ arrLast(fen.history));
	let dt = dTable = dOpenTable; clearElement(dt); mCenterFlex(dt);

	//mStyle(dRechts,{wmin:265,bg:'#00000080'});
	show_history(fen, dRechts);

	// *** player stats ***
	accuse_stats(dt);
	mLinebreak(dt, 10)

	// *** policies ***
	if (nundef(fen.policies)) fen.policies = [];
	UI.policies = ui_type_hand(fen.policies, dt, { hmin: 120 }, '', 'policies', ari_get_card, false);
	mLinebreak(dt, 10)

	// *** player membership cards ***
	let pl = fen.players[uplayer];
	let d = mDiv(dt)
	let idleft = ari_get_card(pl.idleft, 100); //ui.idleft = ui_type_market([pl.idleft], dt, { maleft: 12 }, `players.${uplayer}.idleft`, 'id', ari_get_card);
	let idright = ari_get_card(pl.idright, 100); //ui.idleft = ui_type_market([pl.idleft], dt, { maleft: 12 }, `players.${uplayer}.idleft`, 'id', ari_get_card);
	mAppend(dt, iDiv(idleft))
	let membership = ui_type_market(isdef(pl.membership) ? [pl.membership] : [], dt, { hmargin: 120 }, '', 'alliance')
	mAppend(dt, iDiv(idright))
	mLinebreak(dt, 10);

	// *** player hand ***
	lookupSetOverride(ui, ['players', uplayer, 'hand'], ui_type_hand(pl.hand, dt, { paleft: 25 }, `players.${uplayer}.hand`));

}

function accuse_activate() {
	let [pldata, stage, A, fen, phase, uplayer, turn] = [Z.playerdata, Z.stage, Z.A, Z.fen, Z.phase, Z.uplayer, Z.turn];

	//mBy('dSpecial').innerHTML = pldata.filter(x => ['felix', 'mimi'].includes(x.name)).map(x => `${x.name}:${isEmpty(x.state) ? '()' : x.state.card}`).join(',');
	console.log(pldata.filter(x => ['felix', 'mimi'].includes(x.name)).map(x => `${x.name}:${isEmpty(x.state) ? '()' : x.state.card}`).join(','));

	let donelist = Z.playerdata.filter(x => isDict(x.state) && isdef(x.state.card));
	//let complete = turn.length == 1 || donelist.length >= turn.length;
	// let complete = ['hand', 'membership'].includes(stage) && donelist.length >= turn.length  && turn.length >= 1;
	// complete = complete || stage == 'round' && !firstCond(pldata,x=>!isDict(x));

	let complete = ['hand', 'membership'].includes(stage) && donelist.length >= turn.length || stage == 'round' && firstCond(pldata, x => isDict(x));

	let resolvable = uplayer == fen.starter && complete;
	let waiting = !resolvable && isdef(donelist.find(x => x.name == uplayer));
	//console.log('pl', uplayer, 'stage', stage, 'on turn', turn.length, '\ndonelist', donelist, 'complete', complete, 'waiting', waiting);
	if (complete) console.log('complete!'); //mBy('dSpecial').innerHTML += ' complete';
	if (resolvable) console.log('resolvable!'); //mBy('dSpecial').innerHTML += ' + resolvable';

	Z.isWaiting = false;
	if (stage == 'impossible') {
		console.log('impossible stage!!!!!!!!!!!!')
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
		select_add_items(ui_get_string_items(validplayers), accuse_submit_accused, 'must select player name', 1, 1);
	} else if (stage == 'accuse_action_select_color') {
		select_add_items(ui_get_string_items(['red', 'black']), accuse_submit_accused_color, 'must select color', 1, 1);
	} else if (stage == 'accuse_action_entlarvt') {
		select_add_items(ui_get_hand_items(uplayer), accuse_replaced_membership, 'must select your alliance', 1, 1);
	} else if (stage == 'accuse_action_provisional') {
		select_add_items(ui_get_hand_items(uplayer), accuse_replaced_membership, 'must select your alliance', 1, 1);
	} else if (stage == 'accuse_action_policy') {
		select_add_items(ui_get_hand_items(uplayer), accuse_enact_policy, 'may enact a policy', 0, 1);
	} else if (stage == 'accuse_action_new_president') {
		set_new_president();
	} else if (stage == 'parlay_select_player') {
		let players = get_others_with_at_least_one_hand_card();
		select_add_items(ui_get_string_items(players), parlay_player_selected, 'must select player to exchange cards with', 1, 1);
	} else if (stage == 'parlay_select_cards') {
		select_add_items(ui_get_hand_items(uplayer), parlay_cards_selected, 'may select cards to exchange', 0, fen.maxcards);
	} else if (stage == 'parlay_opponent_selects') {
		let n = fen.player_cards.length;
		select_add_items(ui_get_hand_items(uplayer), parlay_opponent_selected, `must select ${n} cards`, n, n);
	} else if (stage == 'defect_membership') {
		select_add_items(ui_get_hand_items(uplayer), defect_resolve, 'may replace your alliance', 0, 1);
	} else if (waiting && stage != 'handresolve') {
		//console.log('WAITING!!!!!!!!!', stage, uplayer);
		//either results are not all in or am NOT the starter (=admin)
		let mystate = donelist.find(x => x.name == uplayer).state.card;
		if (!isEmpty(mystate)) {
			let handui = lookup(UI, ['players', uplayer, 'hand']);
			//console.log('handui',handui)
			let items = handui.items;
			let cardui = items.find(x => x.key == mystate)

			//.items.find(item=>item.a == mystate);
			//console.log('mystate',mystate,cardui)
			if (stage == 'hand' && isdef(cardui)) make_card_selected(cardui);
			else if (stage == 'membership' && isdef(cardui)) make_card_selected(cardui);
			else mDiv(dTable, {}, null, 'WAITING FOR PLAYERS TO COMPLETE....');
		}
		//mDiv(dTable, {}, null, 'WAITING FOR PLAYERS TO COMPLETE....');
		if (complete) {
			//turn is transferred to starter
			Z.turn = [fen.starter];
			if (Z.mode != 'multi') { take_turn_waiting(); return; }
		}
		Z.isWaiting = true;
		autopoll();
	} else if (stage == 'membership' && resolvable) {
		assertion(uplayer == fen.starter, 'NOT THE STARTER WHO COMPLETES THE STAGE!!!')
		console.log('RESOLVING membership!!!!!!!!!!!!!')
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
		//test_history(histest)

		Z.stage = 'hand';
		Z.turn = get_valid_voters();
		take_turn_fen_clear();

	} else if (stage == 'membership') {
		select_add_items(ui_get_hand_items(uplayer), accuse_submit_membership, 'must select your alliance', 1, 1);
	} else if (stage == 'hand' && resolvable) {
		assertion(uplayer == fen.starter, 'NOT THE STARTER WHO COMPLETES THE STAGE!!!')

		//console.log('STOP: RESOLVING HAND!!!!!!!!!!!!!', Z.playerdata.map(x => x.state.card));
		DA.gobutton = mButton('GO!!!!!', () => { Z.stage = 'handresolve'; accuse_activate(); }, dTable);
		//Z.stage = 'handresolve'; accuse_activate();
		return;
	} else if (stage == 'handresolve') {
		//console.log('RESOLVING HAND!!!!!!!!!!!!!', Z.playerdata.map(x => x.state.card));
		DA.gobutton.remove();
		let votes = [];
		for (const pldata of Z.playerdata) {
			let plname = pldata.name;
			let card = pldata.state.card;
			if (!isEmpty(card)) votes.push({ plname: plname, card: card });
			else removeInPlace(fen.validvoters, plname);
		}

		ari_history_list(votes.map(x => `${x.plname} ${x.card}`), 'poll');

		//resolve votes
		//0. check if unsuccessful (no votes)
		if (isEmpty(votes)) {
			//console.log('STOP! EMPTY VOTES!!!!!!!!!!!!!'); return;
			//console.log('EMPTY VOTES!!!!!!!!!!!!!');
			ari_history_list(`no votes!`, 'session ends');
			accuse_score_update('white')

			Z.turn = jsCopy(Z.plorder);
			Z.stage = 'round';
			take_turn_fen_clear();

			// fen.validvoters = jsCopy(fen.plorder);
			// Z.turn = get_valid_voters();
			// Z.stage = 'hand';
			// ari_history_list('empty votes: restart poll!', 'poll')
			// take_turn_fen_clear();
			return;
		}
		//1. check if all votes same color
		let color = get_color_of_card(votes[0].card); //['H', 'D'].includes(votes[0].card[1]) ? 'red' : 'black';
		let allsame = true;
		for (const v of votes) {
			let c1 = get_color_of_card(v.card); //['H', 'D'].includes(v.card[1]) ? 'red' : 'black';
			if (c1 != color) { allsame = false; break; }
		}
		if (allsame) {
			//session ends! consensus
			//console.log('STOP! CONSENSUS!!!!!!!!!!!!!',color);return;
			//console.log('...CONSENSUS!!!!!!!!!!!!!', color, votes);
			ari_history_list(`consensus on ${color}!`, 'session ends');

			//update score
			accuse_score_update(color);

			Z.turn = jsCopy(Z.plorder);
			//Z.phase += 1
			Z.stage = 'round';
			take_turn_fen_clear();
			return;

		}
		//ermittle winner if any
		//sort votes by rank
		let ranks = 'KQJT98765432A';
		let vsorted = sortByFunc(votes, x => ranks.indexOf(x.card[0]));
		let best = vsorted[0];
		//schau ob eindeutig!
		let winning_vote = vsorted[0];
		if (votes.length > 1 && vsorted[1].card[0] == vsorted[0].card[0]) {
			winning_vote = null;
		}
		if (winning_vote) {
			let plwinner = winning_vote.plname
			//console.log('STOP! WINNER PRESIDENT!!!!!!!!!!!!!',plwinner,winning_vote.card); return;
			//console.log('...WINNER PRESIDENT!!!!!!!!!!!!!', plwinner, winning_vote.card);
			Z.turn = [plwinner];
			Z.stage = 'president';
			//return all non-winning votes zu player hands: done
			//return all pending cards (from previous votes) to resp hands
			for (const plname in fen.players) {
				let pl = fen.players[plname];
				if (!isEmpty(pl.pending)) pl.pending.map(x => pl.hand.push(x));
				delete pl.pending;
			}
			//discard winning vote
			removeInPlace(fen.players[plwinner].hand, winning_vote.card);
			fen.deck_discard.push(winning_vote.card);
			fen.president = plwinner;
			fen.isprovisional = false;
			ari_history_list(`${plwinner} wins presidency!`, 'president');
			take_turn_fen_clear();
			return;
		}

		// console.log('STOP! Tie!!!!!!!!!!!!!', vsorted); return;
		//console.log('Tie!!!!!!!!!!!!!', vsorted);
		ari_history_list(`tie!`, 'new poll round');
		//played cards go into pending
		for (const v of vsorted) {
			let plname = v.plname;
			let pl = fen.players[plname];
			lookupAddToList(pl, ['pending'], v.card)
			removeInPlace(pl.hand, v.card);
		}
		//stage goes to hand
		Z.turn = vsorted.map(x => x.plname); //only active voters remain in poll
		Z.stage = 'hand';
		take_turn_fen_clear();

	} else if (stage == 'hand') {
		select_add_items(ui_get_hand_items(uplayer), accuse_submit_card, 'may select card to play', 0, 1);
	} else if (stage == 'round' && resolvable) {
		assertion(uplayer == fen.starter, 'NOT THE STARTER WHO COMPLETES THE STAGE!!!')
		//new session starts here!!!!!
		Z.turn = jsCopy(Z.plorder);
		Z.phase = Number(Z.phase) + 1;
		Z.stage = 'membership';
		console.log('REMOVING MEMBERSHIP!!!! SCORING SHOULD BE DONE BY NOW!!!!!')
		for (const pl in fen.players) { delete fen.players[pl].membership; }
		accuse_new_session(fen);
		take_turn_fen_clear();
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

function accuse_onclick_weiter() {
	Z.state = { plname: Z.uplayer };
	take_turn_multi();
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

	Z.state = { card: card };
	take_turn_multi();
}
function accuse_stats(d) {
	let players = Z.fen.players;
	//console.log('uplayer',Z.uplayer)
	let d1 = mDiv(d, { display: 'flex', 'justify-content': 'center', 'align-items': 'space-evenly' });
	for (const plname of get_present_order()) {
		let pl = players[plname];
		let onturn = Z.turn.includes(plname);
		let sz = 50; //onturn?100:50;
		let bcolor = plname == Z.uplayer ? 'lime' : 'silver';
		let border = pl.playmode == 'bot' ? `double 5px ${bcolor}` : `solid 5px ${bcolor}`;
		let rounding = pl.playmode == 'bot' ? '0px' : '50%';
		let d2 = mDiv(d1, { margin: 4, align: 'center' }, null, `<img src='../base/assets/images/${plname}.jpg' style="border-radius:${rounding};display:block;border:${border};box-sizing:border-box" class='img_person' width=${sz} height=${sz}>${get_player_score(plname)}`);
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
		ari_history_list(`${uplayer} resigns as president`,'resign')
		president_end();
	}
}

function pay_for_accuse_action() {
	let [A, uplayer, fen] = [Z.A, Z.uplayer, Z.fen];
	let card = A.items[A.selected[0]].a;
	removeInPlace(fen.players[uplayer].hand, card);
	redraw_hand();
	Z.stage = 'accuse_action_select_player';
	ari_history_list(`${uplayer} pays for accuse action`,'accuse')
	accuse_activate();
}
function accuse_submit_accused() {
	let [A, uplayer, fen] = [Z.A, Z.uplayer, Z.fen];
	let plname = A.items[A.selected[0]].a;
	//console.log('president', Z.uplayer, 'accuses', plname);
	fen.accused = plname;
	Z.stage = 'accuse_action_select_color';
	accuse_activate();
}
function accuse_submit_accused_color() {
	let [A, uplayer, fen, accused] = [Z.A, Z.uplayer, Z.fen, Z.fen.accused];
	let color = A.items[A.selected[0]].a;


	//console.log('president', uplayer, 'accused', accused, 'of being', color);

	//now check the color
	let card = fen.players[accused].membership;
	let real_color = get_color_of_card(card);
	ari_history_list(`${uplayer} guesses ${color}, ${accused} is ${real_color}`,'accuse')
	if (color == real_color) {
		//guess was correct!
		//president keeps membership card
		//accused needs to replace membership card
		console.log('PRESIDENT GUESSES CORRECTLY!!!')
		Z.turn = [accused];
		console.log(fen.players[uplayer], fen.players[uplayer].hand, card)
		fen.players[uplayer].hand.push(card);
		delete fen.players[accused].membership;
		Z.stage = 'accuse_action_entlarvt';
		take_turn_fen();
	} else {
		console.log('PRESIDENT GUESSES WRONG!!!!!!!!!!!!');
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

	assertion(accused == uplayer,"accuse_replace_membership: WRONG PLAYER!!!!")
	let card = A.items[A.selected[0]].a;
	//remove from hand, set membership
	let pl = fen.players[uplayer];
	pl.membership = card;
	removeInPlace(pl.hand, card);
	fen.newpresident = Z.stage == 'accuse_action_entlarvt' ? null : accused;
	Z.turn = [fen.president];
	Z.stage = Z.stage == 'accuse_action_entlarvt' ? 'accuse_action_policy' : 'accuse_action_new_president';
	ari_history_list(`accused ${accused} chooses new membership`+(TESTHISTORY?` ${card}`:''),'accuse');
	take_turn_fen();

}
function accuse_enact_policy() {
	let [A, uplayer, fen, accused] = [Z.A, Z.uplayer, Z.fen, Z.fen.accused];
	let card = isEmpty(A.selected) ? '' : A.items[A.selected[0]].a;

	//this card is chosen as a policy
	if (!isEmpty(card)) {
		lookupAddToList(fen, ['policies'], card);
		removeInPlace(fen.players[uplayer].hand, card);
		ari_history_list(`${uplayer} enacts a ${get_color_of_card(card)} policy`,'policy')

		//look if last 5 policies are same color =>dominance
		let arr = arrTakeLast(fen.policies, fen.policies_needed);
		let color = arrAllSame(arr, get_color_of_card);
		if (color && arr.length >= fen.policies_needed) {
			//session ends here!!! 
			fen.dominance = true;
			ari_history_list(`${color} dominance reached!`,'session ends')

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
function set_new_president(){
	let fen = Z.fen;
	fen.president = fen.newpresident;		
	delete fen.newpresident;
	fen.isprovisional = true;
	Z.stage = 'president';
	Z.turn = [fen.president];
	ari_history_list(`new president is ${fen.president}`,'provisional president')
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

	ari_history_list(`president ${fen.president} exchanged ${opp_cards.length} cards with ${uplayer}`,'parlay')

	president_end();
}

function defect_resolve(){
	let [A, uplayer, fen] = [Z.A, Z.uplayer, Z.fen];
	let card = A.items[A.selected[0]].a;
	let pl = fen.players[uplayer];
	pl.membership = card;
	removeInPlace(pl.hand, card);
	president_end();
}

function president_end() {
	Z.turn = get_valid_voters();
	//console.log('president_end: voters',Z.turn)
	Z.stage = 'hand';
	let fen = Z.fen;
	delete fen.president;
	delete fen.newpresident;
	delete fen.isprovisional;
	delete fen.player_cards;
	delete fen.accused;
	//console.log('...end of president', get_keys(fen));
	take_turn_fen_clear();
}
//#endregion

//#region helpers
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
	let [rmax, rmin, handsize] = tb[players.length];
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
function accuse_score_update(color){
	let [fen] = [Z.fen];

	let session_entry = {color:color};
	let plsession=session_entry.players={};

	for (const plname in fen.players) {
		let pl = fen.players[plname];

		plsession[plname]={left:get_color_of_card(pl.idleft),middle:get_color_of_card(pl.membership),right:get_color_of_card(pl.idright)};

		if (get_color_of_card(pl.idleft) == color) pl.score += 1;
		if (get_color_of_card(pl.idright) == color) pl.score += 1;
		if (get_color_of_card(pl.membership) == color) pl.score += 1;
	}

	lookupAddToList(fen, ['sessions'], session_entry);
	console.log('SCORE UPDATE!!!',fen.phase,color,'\nentry',session_entry);


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
	return get_keys(Z.fen.players).filter(x => x.name != Z.uplayer && Z.fen.players[x].hand.length >= 1);
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







