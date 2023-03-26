
function show_role_accuse() {
	let d = mBy('dAdminMiddle');
	clearElement(d);
	let [role, pldata, stage, fen, phase, uplayer, turn, uname, host, mode] = [Z.role, Z.playerdata, Z.stage, Z.fen, Z.phase, Z.uplayer, Z.turn, Z.uname, Z.host, Z.mode];
	let styles, text;
	let boldstyle = { fg: 'red', weight: 'bold', fz: 20 };
	let normalstyle = { fg: 'black', weight: null, fz: null };
	if (mode == 'hotseat') {
		// let dpics = mDiv(d,{gap:10}); mCenterCenterFlex(dpics);
		// let pic = get_user_pic(uplayer, sz = 30, border = 'solid medium white');
		// mStyle(pic, { cursor: 'pointer' });
		text = `hotseat: <span style='color:${get_user_color(uplayer)}'>${uplayer}</span>`;
		styles = boldstyle;
		styles.wmin=220;
		// let d1=mDiv(dpics,styles,text); mCenterCenterFlex(d1);
		d.innerHTML = text; mStyle(d, styles);
		// mAppend(dpics, pic);
	} else if (role == 'spectator') {
		styles = normalstyle;
		text = `(spectating)`;
		d.innerHTML = text; mStyle(d, styles);
	} else if (role == 'inactive' && !DA.showTestButtons) {
		styles = normalstyle;
		text = `(${turn[0]}'s turn)`;
		d.innerHTML = text; mStyle(d, styles);
	} else if (role == 'active' && turn.length > 1 && !has_player_state(uplayer)) {
		styles = boldstyle;
		text = `It's your turn!!!`;
		d.innerHTML = text; mStyle(d, styles);
	} else if (role == 'active' && turn.length == 1) {
		styles = boldstyle;
		text = `It's your turn!!!`;
		d.innerHTML = text; mStyle(d, styles);
	} else if (DA.showTestButtons) {
		let pls = turn.filter(x => x != uname && !has_player_state(x));
		if (isEmpty(pls)) pls = [host];
		let dpics = mDiv(d,{gap:10}); mCenterCenterFlex(dpics);
		//console.log('host is',host, 'pls is',pls)
		for (const plname of pls) {
			let pic = get_user_pic(plname, sz = 30, border = 'solid medium white');
			mStyle(pic, { cursor: 'pointer' })
			pic.onclick = () => transferToPlayer(plname);
			mAppend(dpics, pic);
		}
	} else {
		styles = normalstyle;
		text = `(waiting for other players)`;
		d.innerHTML = text; mStyle(d, styles);
	}
}
function rest_show_role() {
	let hotseatplayer = Z.uname != Z.uplayer && Z.mode == 'hotseat' && Z.host == Z.uname;

	let styles, text;
	let boldstyle = { fg: 'red', weight: 'bold', fz: 20 };
	let normalstyle = { fg: 'black', weight: null, fz: null };
	let location = ''; //`<span style="color:dimgray;font-family:Algerian">${Z.friendly}  </span>`; // `in ${stringAfter(Z.friendly,'of ')}`;
	if (hotseatplayer) {
		styles = boldstyle;
		text = `your turn for ${Z.uplayer}`;
		// text = `your turn for ${Z.uplayer} ${location}`;
	} else if (Z.role == 'spectator') {
		styles = normalstyle;
		text = `(spectating)`;
		//text = `(spectating  ${location})`;
	} else if (Z.role == 'active') {
		styles = boldstyle;
		text = `It's your turn!!!`;
		//text = `It's your turn  ${location}!`;
	} else if (Z.role == 'waiting') {
		text = `waiting for players to complete their moves...`;
		//text = `waiting for players to complete their moves ${location}...`;
	} else {
		assertion(Z.role == 'inactive', 'role is not active or inactive or spectating ' + Z.role);
		styles = normalstyle;
		text = `(${Z.turn[0]}'s turn)`;
	}
	d.innerHTML = text;
	mStyle(d, styles);
}

function toggle_mode(){
	let mode = valf(Clientdata.mode,Z.mode);
	let newmode = mode == 'multi'?'hotseat':'multi';
	let b=mBy('dAdvancedUI').children[1];
	if (newmode == 'multi'){b.innerHTML = 'M';mStyle(b,{fg:'blue'})}
	else{b.innerHTML = 'H';mStyle(b,{fg:'red'})}
	return newmode;

}
function toggle_visibility(elem) {
	//returns new visibility (true or false)
	elem = toElem(elem);
	if (nundef(elem)) return;
	let vis = elem.style.display;
	if (vis == 'none') { show(elem); return true; } else { hide(elem); return false; }
}
function get_advanced_menu_buttons() {
	// let html = `<a id="aAdvancedMenu" href="javascript:onclick_advanced_menu()">≡</a>`;
	let html = `<a href="javascript:onclick_advanced_test()">T</a>`;
	let btest = mCreateFrom(html);
	let mode = 'multi';
	html = `<a href="javascript:onclick_advanced_mode()">${mode[0].toUpperCase()}</a>`;
	let bmode = mCreateFrom(html);
	let d=mCreate('div');
	mAppend(d,btest);
	mAppend(d,bmode);
	let styles = { bg: 'silver', wmin:25,h:25,rounding:'50%', maright: 10, align:'center' };
	mStyle(btest,styles);
	mStyle(bmode,styles);
	//mStyle(b, { bg: 'silver', hpadding: 6, maright: 10, rounding: 4 });
	// mStyle(b, { bg: 'silver', hpadding: 6, maright: 10, rounding: 4 });
	mClass(btest, 'hop1')
	mClass(bmode, 'hop1')
	return d;
}
function add_advanced_ui(dParent) {
	mDiv(dParent,{},'dAdvancedUI');
	show_advanced_ui_buttons();
}
function show_advanced_ui_buttons(){
	let dParent = mBy('dAdvancedUI');
	//if (nundef(dParent)) return;
	mClear(dParent)
	let sz=20;
	let styles = { bg: 'silver', wmin:sz,h:sz,rounding:'50%', maright: 10, align:'center' };
	mButton(' ',onclick_advanced_test,dParent,styles,'enabled');
	style_advanced_button();
	//let mode = Z.mode;
	//mButton(mode[0].toUpperCase(),onclick_advanced_mode,dParent,styles,'enabled');
}
function restrest(){
	console.log('Z',Z)
	console.log('mode',isdef(Z)?Z.mode:'no Z available!'); //valf(Z.mode,Cliendata.mode,''));
	return;
	// let html = `<a id="aAdvancedMenu" href="javascript:onclick_advanced_menu()">≡</a>`;
	let html = `<a href="javascript:onclick_advanced_test()">T</a>`;
	let btest = mCreateFrom(html);
	let mode = 'multi';
	html = `<a href="javascript:onclick_advanced_mode()">${mode[0].toUpperCase()}</a>`;
	let bmode = mCreateFrom(html);
	let d=mCreate('div');
	mAppend(d,btest);
	mAppend(d,bmode);
	mStyle(btest,styles);
	mStyle(bmode,styles);
	//mStyle(b, { bg: 'silver', hpadding: 6, maright: 10, rounding: 4 });
	// mStyle(b, { bg: 'silver', hpadding: 6, maright: 10, rounding: 4 });
	mClass(btest, 'hop1')
	mClass(bmode, 'hop1')
	return d;
}
function get_advanced_menu_button() {
	// let html = `<a id="aAdvancedMenu" href="javascript:onclick_advanced_menu()">≡</a>`;
	let html = `<a id="aAdvancedMenu" href="javascript:onclick_advanced_menu()">T</a>`;
	let b = mCreateFrom(html);
	mStyle(b, { bg: 'silver', hpadding: 6, maright: 10, rounding: 4 });
	mStyle(b, { bg: 'silver', hpadding: 6, maright: 10, rounding: 4 });
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
			histest.push(`${plname} ${DA.showTestButtons ? card : ''}`); //TODO:KEEP secret!!!!!!!!!!!!!!!!!!!!!!
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





















