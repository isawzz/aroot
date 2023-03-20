
function accuse_ai_move(bot) {
	let [pl, fen, stage] = [Z.fen.players[bot], Z.fen, Z.stage];
	if (stage == 'hand') {
		//this is where hand card or empty can be played
		pl.move = { state: { item: '' } }
	} else if (stage == 'membership') {
		//this is where a membership card has to be chosen
	}
}
function accuse_evaluate_votes() {
	let [stage, A, fen, phase, uplayer, turn, uname, host] = [Z.stage, Z.A, Z.fen, Z.phase, Z.uplayer, Z.turn, Z.uname, Z.host];
	assertion(uplayer == host && fen.cardsrevealed, 'NOT THE STARTER WHO COMPLETES THE STAGE!!!')
	let votes = [];
	for (const pldata of fen.pldata) { //Z.playerdata) {
		let plname = pldata.name;
		let card = pldata.state.item;
		if (!isEmpty(card)) votes.push({ plname: plname, card: card });
		else removeInPlace(fen.validvoters, plname);
	}
	ari_history_list(votes.map(x => `${x.plname} ${x.card}`), 'votes');

	//resolve votes
	//0. check if unsuccessful (no votes)
	if (isEmpty(votes)) { eval_empty_votes(votes); return; }

	//1. check if all votes same color (consensus)
	let color = arrSame(votes, x => get_color_of_card(x.card));
	if (color) { eval_consensus(votes, color); return; }

	//2. check single winner if any (presidency)
	let max_votes = get_max_votes(votes);
	if (max_votes.length == 1) { eval_president(max_votes[0]); }
	else { eval_tie(max_votes, votes); }


}
function accuse_player_stat(dParent, plname, hvotecard, himg, hstatfz, gap) {
	let players = Z.fen.players;
	let pl = players[plname];
	//console.log('plname',plname,pl)
	//console.log()
	let onturn = Z.turn.includes(plname);
	let sz = himg; //onturn?100:50;
	let bcolor = plname == Z.uplayer ? 'lime' : 'silver';
	let border = pl.playmode == 'bot' ? `double 5px ${bcolor}` : `solid 5px ${bcolor}`;
	let rounding = pl.playmode == 'bot' ? '0px' : '50%';
	let d = mDiv(dParent, { align: 'center' });
	//let d = mDiv(dParent); mCenterFlex(d); //, { margin: 4, align: 'center' });
	let card = mDiv(d, { hmin: hvotecard + gap, bg: 'transparent', mabottom: gap, paright: 4 }); mCenterFlex(card);

	let wstats=sz*1.3;
	let dcombine = mDiv(d, { w: wstats, margin: 'auto' }); //,{padding:6});

	let dimg = mDiv(dcombine, { padding: 0 }, null, `<img src='../base/assets/images/${plname}.jpg' style="border-radius:${rounding};border:${border};box-sizing:border-box" width=${sz} height=${sz}>`); mCenterFlex(dimg);
	let stats = mDiv(dcombine, { align: 'center', w: wstats, bg: 'silver', rounding: 10 }); mCenterFlex(stats);
	let x = lookupSetOverride(UI, ['stats', plname], { douter: d, dcombi: dcombine, dstats: stats, dimg: dimg, dcard: card });
	let numcols=3;
	accuse_player_stat_count('star', pl.score, stats, { sz: hstatfz },numcols);
	accuse_player_stat_count('hand with fingers splayed', pl.hand.length, stats, { sz: hstatfz },numcols);
	accuse_player_stat_count('eye', pl.experience, stats, { sz: hstatfz },numcols);

	return x;
}
function accuse_player_stat_count(key, n, dParent, styles = {},numcols) {
	//mStyle(dParent,{align:'center'});
	let sz = valf(styles.sz, 8);
	let d = mDiv(dParent, { w: `${100/numcols}%`, align: 'center' });
	let dsym;
	if (isdef(Syms[key])) dsym = mSym(key, d, { h: sz, 'line-height': sz, w: '100%' });
	else dsym = mText(key, d, { h: sz, fz: sz, w: '100%' });
	//console.log('hallo!!!')

	//if (nundef(styles.wmax)) styles.wmax = sz;
	//addKeys({ display: 'flex', margin: 4, dir: 'column', hmax: 2 * sz, 'align-content': 'start', fz: sz, align: 'center' }, styles);

	let dn = mDiv(d, { fz: 2 * sz, weight: 'bold' }, null, n);
	return d;
}
function accuse_show_selected_state(state) {
	let [fen, uplayer, stage] = [Z.fen, Z.uplayer, Z.stage];
	let mystate = state.item;
	if (!isEmpty(mystate)) {
		let handui = lookup(UI, ['players', uplayer, 'hand']);
		let items = handui.items;
		let cardui = items.find(x => x.key == mystate)
		if (stage == 'hand' && isdef(cardui)) make_card_selected(cardui);
		else if (stage == 'membership' && isdef(cardui)) make_card_selected(cardui);
		else mDiv(dTable, {}, null, 'WAITING FOR PLAYERS TO COMPLETE....');
	}
}
function accuse_show_sitting_order(fen) {
	if (nundef(fen)) fen = Z.fen;

	//ist der turn immer wie der sitting order?
	//console.log('turn');
	for (const plname of fen.turn) {
		let pl = fen.players[plname];
		//console.log(pl.idleft,plname,pl.idright)
	}

	//console.log('plorder');
	for (const plname of fen.plorder) {
		let pl = fen.players[plname];
		//console.log(pl.idleft,plname,pl.idright)
	}

}
function arrSame(arr, func) {
	if (isEmpty(arr)) return true;
	let x = func(arr[0]);
	for (let i = 1; i < arr.length; i++) {
		if (func(arr[i]) != x) return false;
	}
	return x;
}
function check_enough_policies() {
	let [stage, A, fen, phase, uplayer, turn, uname, host] = [Z.stage, Z.A, Z.fen, Z.phase, Z.uplayer, Z.turn, Z.uname, Z.host];
	//look if last X policies are same color =>dominance
	let arr = arrTakeLast(fen.policies, fen.stability - fen.crisis);
	let color = arrAllSame(arr, get_color_of_card);
	if (color && arr.length >= fen.stability) {
		//generation ends here!!! 
		fen.dominance = true;
		ari_history_list(`${color} dominance reached!`, 'generation ends')

		//update score
		accuse_score_update(color);
		Z.turn = jsCopy(Z.plorder);
		//Z.phase += 1
		Z.stage = 'round';
		take_turn_fen_clear();
		return true;

	} else {
		return false;
	}

}
function eval_empty_votes(votes) {
	let [stage, A, fen, phase, uplayer, turn, uname, host] = [Z.stage, Z.A, Z.fen, Z.phase, Z.uplayer, Z.turn, Z.uname, Z.host];
	let last_policy = arrLast(fen.policies);
	if (last_policy) {
		// console.log('add policy, last:', last_policy)
		fen.policies.push(last_policy);
	}
	fen.validvoters = jsCopy(Z.plorder);
	check_enough_policies_or_start_new_poll(`no one voted: policy repeat`);
}
function get_bots_on_turn() {
	let players = Z.turn;
	return players.filter(x => Z.fen.players[x].playmode != 'human');
}
function get_color_card(ckey, h, opts = {}) {
	//console.log('ckey', ckey);
	let color;
	if (nundef(ckey)) color = 'transparent'; else color = get_color_of_card(ckey);
	let type = 'color';
	let info = { friendly: color, color: valf(opts.bg, BLUE) }
	info.ckey = color;
	let el = mDiv(null, { bg: color == 'black' ? '#222' : color, rounding: h / 10 });
	h = valf(h, valf(info.h, 100));
	w = valf(opts.w, h * .7);
	mSize(el, w, h);
	let card = {};
	copyKeys(info, card);
	copyKeys({ sz: h, w: w, h: h, faceUp: true, div: el }, card);
	card.ov = valf(opts.ov, .3);

	return card;
}
function get_policies_to_win() {
	let fen = Z.fen;

	if (isEmpty(fen.policies)) return ['any', fen.stability]; //`${fen.stability} policies of the same color needed!`]
	//let color = get_color_of_card(arrLast(fen.policies));
	let revlist = jsCopy(fen.policies).reverse();
	//console.log('revlist',revlist);
	let color = get_color_of_card(revlist[0]);
	let samecolorlist = arrTakeWhile(revlist, x => get_color_of_card(x) == color);
	//console.log('samecolorlist',samecolorlist)
	//while()
	return [color, Math.max(0, fen.stability - samecolorlist.length)];
}
function get_player_data(plname) { return firstCond(Z.playerdata, x => x.name == plname); }
function get_player_state(plname) { let pld = get_player_data(plname); return pld ? pld.state : null; }
function get_player_card(plname) { let pld = get_player_data(plname); return pld ? pld.state.item : null; }
function get_other_players(){return get_keys(Z.fen.players).filter(x=>x!=Z.uplayer);}
function getRankOf(ckey, ranks) {
	if (is_nc_card(ckey)) return Number(stringBefore(x, '_'));
	if (nundef(ranks)) ranks = valf(lookup(Z, ['fen', 'ranks']), 'A23456789TJQK');
	return ckey[0];
}
function has_player_state(plname) { let pld = get_player_data(plname); return pld ? pld.state : false; }
function is_ace(ckey) { return ckey[0] == 'A' || firstNumber(ckey) == 1; }
function is_nc_card(ckey) { return ckey.includes('_'); }
function show_takeover_ui() {

	DA.omnipower = true;
	let [pldata, stage, A, fen, phase, uplayer, turn, uname, host, mode] = [Z.playerdata, Z.stage, Z.A, Z.fen, Z.phase, Z.uplayer, Z.turn, Z.uname, Z.host, Z.mode];

	//entweder zeigen wenn uname not in turn
	//oder wenn uname in turn aber schon gespielt hat
	if (mode != 'multi') return;

	if (turn.length > 1 && turn.includes(uname) && !has_player_state(uname)) return;

	if (turn.length == 1 && turn[0] == uplayer) return;

	let dTakeover = mBy('dTakeover'); show(dTakeover); mClear(dTakeover);
	dTakeover.innerHTML = '' + stage + ': ';
	let pls = turn.filter(x => x != uname && !has_player_state(x));
	if (isEmpty(pls)) pls = [host];
	//console.log('host is',host, 'pls is',pls)
	for (const plname of pls) {
		let pic = get_user_pic(plname, sz = 35, border = 'solid medium white');
		mStyle(pic, { cursor: 'pointer' })
		pic.onclick = () => transferToPlayer(plname);
		mAppend(dTakeover, pic);
	}
}
function sortCardsByRank(arr, ranks) {
	if (isEmpty(arr)) return [];
	if (is_nc_card(arr[0])) return sortByFunc(arr, x => Number(stringBefore(x, '_')));
	if (nundef(ranks)) ranks = valf(lookup(Z, ['fen', 'ranks']), 'A23456789TJQK');
	return sortByFunc(arr, x => ranks.indexOf(x[0]));
}
function sortCardsByRankDesc(arr, ranks) {
	let res = sortCardsByRank(arr, ranks);
	return arrReverse(res);
}
function sortCardObjectsByRank(arr, ranks, ckeyprop) {
	if (isEmpty(arr)) return [];
	if (is_nc_card(arr[0][ckeyprop])) return sortByFunc(arr, x => Number(stringBefore(x[ckeyprop], '_')));
	if (nundef(ranks)) ranks = valf(lookup(Z, ['fen', 'ranks']), 'A23456789TJQK');
	return sortByFunc(arr, x => ranks.indexOf(x[ckeyprop][0]));
}
function sortCardObjectsByRankDesc(arr, ranks, ckeyprop) {
	let res = sortCardObjectsByRank(arr, ranks, ckeyprop);
	return arrReverse(res);
}
function there_are_bots() {
	let players = get_values(Z.fen.players);
	return firstCond(players, x => x.playmode != 'human');

}
function transferToPlayer(plname) {
	stopgame();
	clear_screen();
	set_user(plname);	//U = firstCond(Serverdata.users, x => x.name == plname);	//localStorage.setItem('uname', U.name); DA.secretuser = U.name;
	assertion(U.name == plname, 'set_user nicht geklappt!!!!!!!')
	show_username(true);
}
function turn_has_bots_that_must_move() {
	let [turn, pldata] = [Z.turn, Z.playerdata];

	if (isEmpty(pldata)) return [];
	let pldata_dict = list2dict(pldata, 'name');

	let bots_on_turn = turn.filter(x => Z.fen.players[x].playmode != 'human');
	//console.log('bots_on_turn',bots_on_turn)

	for (const bot of bots_on_turn) {
		//console.log(bot,pldata_dict[bot])
	}

	let no_pldata = bots_on_turn.filter(x => !isDict(pldata_dict[x].state));
	let is_bot_turn = turn.length == bots_on_turn.length;
	if (is_bot_turn && turn.length == 1) return [turn];
	//is_bot_turn.map(x=>addIf(no_pldata,x));

	return no_pldata;

}
function ui_add_accuse_container_title(title, cont, items, show_if_empty) {
	if (isdef(title) && (!isEmpty(items) || show_if_empty)) {
		let elem = mText(title, cont, { margin: 3 });
		return elem;
	}
	return null;
}
function ui_get_player_items(playernames) {
	let items = [], i = 0;
	for (const plname of playernames) {
		let plui = UI.stats[plname];
		plui.div = plui.dimg;
		plui.itemtype = 'player';
		let item = { o: plui, a: plname, key: plname, friendly: plname, path: `stats.${plname}`, index: i };
		i++;
		items.push(item);
	}
	return items;
}
function ui_type_accuse_hand(list, dParent, styles = {}, path = 'hand', title = 'hand', get_card_func = ari_get_card, show_if_empty = false) {

	//copyKeys({wmin:500,bg:'red'},styles); //testing wmin
	let cont = ui_make_container(dParent, styles); //get_container_styles(styles));

	//mStyle(cont,{bg:'lime'})

	let items = list.map(x => get_card_func(x));

	let cardcont = mDiv(cont);
	//if (!isEmpty(items)) {
	let card = isEmpty(items) ? { w: 1, h: Config.ui.card.h, ov: 0 } : items[0];
	//console.log('card',card)
	let splay = 2;
	mContainerSplay(cardcont, splay, card.w, card.h, items.length, card.ov * card.w);
	ui_add_cards_to_hand_container(cardcont, items, list);
	//}
	let dtitle = ui_add_accuse_container_title(title, cont, items, show_if_empty);

	//console.log('hand container',cont, cardcont)

	return {
		ctype: 'hand',
		list: list,
		path: path,
		container: cont,
		cardcontainer: cardcont,
		splay: splay,
		items: items,
		dtitle: dtitle,
	};
}









