function accuse() {
	function state_info(dParent) { dParent.innerHTML = `phase: ${Z.phase}, turn: ${Z.turn}, stage:${Z.stage}`; }
	function setup(players, options) {
		//console.log('SETUP!!!!!!!!!!!!!!!!!!!')
		let fen = { players: {}, plorder: jsCopy(players), history: [], num: options.num };
		//shuffle(fen.plorder);
		let starter = fen.starter = fen.plorder[0];
		let num = Math.ceil(players.length / 2)
		let deck_identities = fen.deck_identities = [];
		let ranks = 'KQJT98765432A';
		for (let i = 0; i < num; i++) { deck_identities.push(ranks[i] + 'Hh'); deck_identities.push(ranks[i] + 'Sh'); }
		shuffle(deck_identities);


		for (const plname of players) {
			let pl = fen.players[plname] = {
				score: 0,
				name: plname,
				idright: deck_deal(deck_identities, 1)[0],
				color: get_user_color(plname),
			};
		}

		//each player gets idright = idleft of next player
		for (let i = 0; i < players.length; i++) {
			let j = (i + 1) % players.length;
			fen.players[players[i]].idleft = fen.players[players[j]].idright;
		}

		accuse_new_session(fen);

		[fen.phase, fen.stage, fen.step, fen.turn] = ['1', 'membership', 0, jsCopy(fen.plorder)];
		return fen;
	}
	function check_gameover() { return false; }
	return { state_info, setup, present: accuse_present, check_gameover, activate_ui: accuse_activate };
}

function accuse_present(dParent) {
	let [fen, ui, stage, uplayer] = [Z.fen, UI, Z.stage, Z.uplayer];
	let [dOben, dOpenTable, dMiddle, dRechts] = tableLayoutMR(dParent, 1, 0); ///tableLayoutOMR(dParent, 5, 1);
	let dt = dTable = dOpenTable; clearElement(dt); mCenterFlex(dt);

	// *** player stats ***
	accuse_stats(dt);
	mLinebreak(dt, 10)

	// *** policies ***
	if (nundef(fen.policies)) fen.policies = [];
	UI.policies = ui_type_hand(fen.policies,dt,{hmin:120},'','policies',ari_get_card,false);
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
	lookupSetOverride(ui, ['players', uplayer, 'hand'], ui_type_hand(pl.hand, dt, { pleft: 25 }, `players.${uplayer}.hand`));

}

function accuse_activate() {
	let [pldata, stage, A, fen, phase, uplayer, turn] = [Z.playerdata, Z.stage, Z.A, Z.fen, Z.phase, Z.uplayer, Z.turn];

	let donelist = Z.playerdata.filter(x => isDict(x.state));
	let complete = turn.length == 1 || donelist.length >= turn.length;
	let resolvable = uplayer == fen.starter && complete;
	let waiting = !resolvable && isdef(donelist.find(x => x.name == uplayer));
	//console.log('pl', uplayer, 'stage', stage, 'on turn', turn.length, '\ndonelist', donelist, 'complete', complete, 'waiting', waiting);

	Z.isWaiting = false;
	if (stage == 'president_accuse') {
		let plnames = get_keys(fen.players);
		let validplayers = plnames.filter(x => fen.players[x].hand.length >= 1 && x != uplayer);
		select_add_items(ui_get_string_items(validplayers), accuse_submit_accused, 'must select player name', 1, 1);

	} else if (stage == 'president_cleanup') {
		select_add_items(ui_get_hand_items(uplayer), accuse_enact_policy, 'may enact a policy', 0, 1);
	} else if (stage == 'select_accused_color') {
		select_add_items(ui_get_string_items(['red', 'black']), accuse_submit_accused_color, 'must select color', 1, 1);
	} else if (stage == 'replace_membership_entlarvt') {
		select_add_items(ui_get_hand_items(uplayer), accuse_replaced_membership, 'must select your alliance', 1, 1);
	} else if (stage == 'replace_membership_provisional') {
		select_add_items(ui_get_hand_items(uplayer), accuse_replaced_membership, 'must select your alliance', 1, 1);
	} else if (waiting) {
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
			if (Z.mode != 'multi') take_turn_waiting();
		}
		Z.isWaiting = true;
		autopoll();
	} else if (stage == 'membership' && resolvable) {
		assertion(uplayer == fen.starter, 'NOT THE STARTER WHO COMPLETES THE STAGE!!!')
		console.log('RESOLVING membership!!!!!!!!!!!!!')
		for (const pldata of Z.playerdata) {
			let plname = pldata.name;
			let card = pldata.state.card;
			assertion(!isEmpty(card), "INVALID MEMBERSHIP SELECTION!!!!!!!!!!!!", uplayer)

			//selected card goes from hand to membership
			let pl = fen.players[plname];
			pl.membership = card;
			removeInPlace(pl.hand, card);
		}
		Z.stage = 'hand';
		Z.turn = jsCopy(Z.plorder);
		take_turn_fen_clear();

	} else if (stage == 'membership') {
		select_add_items(ui_get_hand_items(uplayer), accuse_submit_membership, 'must select your alliance', 1, 1);
	} else if (stage == 'hand' && resolvable) {
		assertion(uplayer == fen.starter, 'NOT THE STARTER WHO COMPLETES THE STAGE!!!')
		//console.log('RESOLVING HAND!!!!!!!!!!!!!', Z.playerdata.map(x => x.state.card));
		let votes = [];
		let outofpoll = [];
		for (const pldata of Z.playerdata) {
			let plname = pldata.name;
			let card = pldata.state.card;
			if (!isEmpty(card)) votes.push({ plname: plname, card: card });
			else outofpoll.push(plname);
		}

		//resolve votes
		//0. check if unsuccessful (no votes)
		if (isEmpty(votes)) {
			//nothing has changed
			//restart session
			console.log('STOP! EMPTY VOTES!!!!!!!!!!!!!'); return;
			Z.turn = jsCopy(Z.plorder);
			Z.stage = 'hand';
			take_turn_fen_clear();
			return;
		}
		//1. check if all votes same color
		let color = get_color_of_card(votes[0].card); //['H', 'D'].includes(votes[0].card[1]) ? 'red' : 'black';
		let allsame = true;
		for (const v of votes) {
			let c1 = get_color_of_card(v.card[1]); //['H', 'D'].includes(v.card[1]) ? 'red' : 'black';
			if (c1 != color) { allsame = false; break; }
		}
		if (allsame) {
			//session ends! consensus
			//console.log('STOP! CONSENSUS!!!!!!!!!!!!!',color);return;
			console.log('...CONSENSUS!!!!!!!!!!!!!', color);
			lookupAddToList(fen, ['sessions'], color);

			//update score
			for (const plname in fen.players) {
				let pl = fen.players[plname];

				if (get_color_of_card(pl.idleft) == color) pl.score += 1;
				if (get_color_of_card(pl.idright) == color) pl.score += 1;
				if (get_color_of_card(pl.membership) == color) pl.score += 1;
			}

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
			console.log('...WINNER PRESIDENT!!!!!!!!!!!!!', plwinner, winning_vote.card);
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
			take_turn_fen_clear();
			return;
		}

		console.log('STOP! Tie!!!!!!!!!!!!!', vsorted); return;
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
	} else if (stage == 'president') {
		let accuse_action_available = !fen.isprovisional || fen.players[uplayer].hand.length >= 1;
		let actions = ['parlay', 'defect', 'resign'];
		if (accuse_action_available) actions.unshift('accuse');
		select_add_items(ui_get_string_items(actions), accuse_submit_president, 'must select action to play', 1, 1);
	} else if (stage == 'select' && resolvable) {
		assertion(uplayer == fen.starter, 'NOT THE STARTER WHO COMPLETES THE STAGE!!!')
		let d = mDiv(dTable, {});
		fen.result = {};
		for (const pldata of Z.playerdata) {
			let selecting = pldata.name;
			let selected = pldata.state.plname;
			let text = pldata.state.text;
			//console.log('selected',selected, typeof selected);
			if (isEmpty(selected)) { //} || selected === null || !selected || nundef(selected)){ // nundef(selected)) {
				console.log('REINGEGANGEN!!!!!!!!!!!!!!')
				fen.players[selecting].score += 1;
				selected = 'correct';
			} else if (selecting != selected) {
				//console.log('selecting', selecting, 'selected', selected ?? 'null')
				fen.players[selected].score += 1;
			}
			fen.result[selecting] = { plname: selected, text: text };
			//that player gets a point
			//selections.push({ plname: plname, text: text.toLowerCase() });

		}
		delete fen.sentences;
		Z.turn = jsCopy(Z.plorder);
		Z.stage = 'round';
		take_turn_fen_clear();
	} else if (stage == 'select') {
		let d = mDiv(dTable, {});
		let i = 1;
		for (const s of fen.sentences) {
			let d1 = mDiv(d, { fz: 20, hline: 30 }, `dsent_${s.plname}`, '' + (i++) + ') ' + s.text, 'hop1');
			d1.onclick = accuse_select_sentence;
		}
	} else if (stage == 'round' && resolvable) {
		assertion(uplayer == fen.starter, 'NOT THE STARTER WHO COMPLETES THE STAGE!!!')
		//new session starts here!!!!!
		Z.turn = jsCopy(Z.plorder);
		Z.phase = Number(Z.phase) + 1;
		Z.stage = 'membership';
		for (const pl in fen.players) { delete fen.players[pl].membership; }
		accuse_new_session(fen);

		take_turn_fen_clear();
	} else if (stage == 'round') {
		let d = mDiv(dTable, {}, null, `Session end! ${fen.sessions[fen.phase - 1]} wins`);
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
function accuse_select_sentence(ev) {
	if (!uiActivated) return;
	let text = ev.target.innerHTML;
	let plname = stringAfter(ev.target.id, 'dsent_')
	//console.log('player', Z.uplayer, 'prefers', text, '(' + plname + ')');

	Z.state = { plname: plname, text: text };
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

function post_select() { console.log('post_select...') }
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
