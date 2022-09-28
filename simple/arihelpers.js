//#region expansions
function exp_commissions(options) { return options.commission == 'yes'; }
function exp_journeys(options) { return options.journey == 'yes'; }
//#endregion

//#region actions
function ari_get_actions(uname) {
	let fen = z.fen;
	//actions include market card exchange
	let actions = ['trade', 'exchange', 'build', 'upgrade', 'downgrade', 'buy', 'visit', 'harvest', 'pickup', 'sell', 'tide', 'commission', 'pass'];
	let avail_actions = [];
	for (const a of actions) {
		//check if this action is possible for uname
		let avail = ari_check_action_available(a, fen, uname);
		if (avail) avail_actions.push(a);
	}
	return avail_actions;

}
function ari_check_action_available(a, fen, uname) {
	let cards;
	let pl = fen.players[uname];
	if (a == 'trade') {
		//there must be 2 cards visible in stalls & market
		cards = ari_get_all_trading_cards(fen);
		//console.log('trade', cards);
		return cards.length >= 2 && pl.stall.length > 0;
	} else if (a == 'exchange') {
		cards = ari_get_all_wrong_building_cards(fen, uname);
		return cards.length > 0 && (pl.hand.length + pl.stall.length > 0);
	} else if (a == 'build') {
		//this player needs to have at least 4 cards in total (stall+hand)
		let res = ari_get_player_hand_and_stall(fen, uname);
		if (res.length < 4) return false;
		//it has to be a king phase and player has money
		let has_a_king = firstCond(res, x => x[0] == 'K');
		if (pl.coins < 1 && !has_a_king) return false;
		//or player needs a king in addition to 4 cards
		if (fen.phase != 'king' && !has_a_king) return false;
		if (pl.coin == 0 && res.length < 5) return false;
		return true;
	} else if (a == 'upgrade') {
		//player has to have at least 1 farm or estate
		if (isEmpty(pl.buildings.farm) && isEmpty(pl.buildings.estate)) return false;
		//it has to be a king phase and player has money
		let res = ari_get_player_hand_and_stall(fen, uname);
		if (isEmpty(res)) return false;
		let has_a_king = firstCond(res, x => x[0] == 'K');
		if (pl.coins < 1 && !has_a_king) return false;
		//or player needs a king in addition to 4 cards
		if (fen.phase != 'king' && !has_a_king) return false;
		if (pl.coin == 0 && res.length < 2) return false;
		return true;
	} else if (a == 'downgrade') {
		//this player needs to have at least 1 estate or chateau
		//if (isEmpty(pl.buildings.chateau) && isEmpty(pl.buildings.estate)) return false;
		//or: this player needs to have at least 1 building
		if (isEmpty(pl.buildings.chateau) && isEmpty(pl.buildings.estate)) return false;
		return true;
	} else if (a == 'buy') {
		//there has to be some card in open_discard
		if (fen.open_discard.length == 0) return false;
		//player needs to have a jack or coin>0 and jack phase
		let res = ari_get_player_hand_and_stall(fen, uname);
		let has_a_jack = firstCond(res, x => x[0] == 'J');
		if (pl.coins < 1 && !has_a_jack) return false;
		if (fen.phase != 'jack' && !has_a_jack) return false;
		return true;
	} else if (a == 'visit') {
		//there has to be some building in any other player
		let others = fen.plorder.filter(x => x != uname);
		let n = 0;
		for (const plname of others) {
			for (const k in fen.players[plname].buildings) {
				n += fen.players[plname].buildings[k].length;
			}
		}
		if (n == 0) return false;
		//player needs to have a jack or coin>0 and jack phase
		let res = ari_get_player_hand_and_stall(fen, uname);
		let has_a_queen = firstCond(res, x => x[0] == 'Q');
		if (pl.coins < 1 && !has_a_queen) return false;
		if (fen.phase != 'queen' && !has_a_queen) return false;
		return true;
	} else if (a == 'harvest') {
		//there has to be some harvest card
		let harvests = ari_get_all_building_harvest_cards(fen, uname);
		return !isEmpty(harvests);
	} else if (a == 'pickup') {
		//there has to be some card in stall
		return !isEmpty(pl.stall);
	} else if (a == 'sell') {
		//there has to be at least 2 cards in stall
		return pl.stall.length >= 2;
	} else if (a == 'pass') {
		//there has to be at least 2 cards in stall
		return true;
	} else if (a == 'commission') {
		//muss dieselbe rank in pl.commissions und pl.hand or pl.stall haben!
		for (const c of pl.commissions) {
			let rank = c[0];
			if (firstCond(pl.hand, x => x[0] == rank) || firstCond(pl.stall, x => x[0] == rank)) return true;
		}
		return false;
	}
}
function ari_get_all_building_harvest_cards(fen, uname) {
	//let fen = z.fen;
	let res = [];
	let pl = fen.players[uname];
	for (const b of pl.buildings.farm) {
		if (b.h) res.push({ b: b, h: b.h });
	}
	return res;
}
function ari_get_all_wrong_building_cards(fen, uname) {
	//let fen = z.fen;
	//console.log('fen', fen, 'uname', uname, fen.players[uname]);
	let res = [];
	let pl = fen.players[uname];
	for (const k in pl.buildings) {
		for (const b of pl.buildings[k]) {
			let bcards = b.list;
			let lead = bcards[0];
			let [rank, suit] = [lead[0], lead[1]];
			for (let i = 1; i < bcards.length; i++) {
				if (bcards[i][0] != rank) res.push({ c: bcards[i], building: b });
			}
		}
	}
	return res;
}
function ari_get_all_trading_cards(fen) {
	//each co_action is of the form {ckey,path} path is path in G and otree
	//let fen = z.fen;
	let res = [];
	fen.market.map(c => res.push({ key: c, path: 'market' }));

	for (const uname of fen.plorder) {
		let pl = fen.players[uname];
		//console.log('uname',uname,'pl',pl)
		let stall = pl.stall;
		//console.log('stall',stall);
		stall.map(x => res.push({ key: x, path: `players.${uname}.stall` }));
	}
	// let plcardlists = otree.plorder.map(x => otree[x].stall);
	// plcardlists.map(x => x.map(c => res.push[{ c: c, path: `${x}.stall` }]));
	return res;
}
function ari_get_player_hand_and_stall(fen, uname) {
	//let [fen, uname] = [z.fen, z.uname];
	//let fen = z.fen;
	let res = [];
	res = res.concat(fen.players[uname].hand);
	res = res.concat(fen.players[uname].stall);
	return res;
}
function process_command() {
	let [A, fen, uname] = [z.A, z.fen, z.uname];
	// let id = evToId(ev);
	// let a = A.di[id];
	// A.selected = [a.index];
	//console.log('process_command',A.selected,getFunctionsNameThatCalledThisFunction())
	if (isEmpty(A.selected)) A.selected = [A.items.length-1];
	let a = A.items[A.selected[0]]; //A.items[a.index].key;
	A.selected_key = a.key;
	mStyle(mBy(a.idButton), { bg: 'yellow' });
	if (isdef(a.idCard)) mClass(mBy(a.idCard), 'card_selected');
	ari_pre_action();
}
function ari_next_action() {
	let [fen, uname] = [z.fen, z.uname];
	uiActivated = false;

	console.assert(isdef(z.num_actions));
	//if (nundef(fen.num_actions)) fen.num_actions = 0;
	//console.log('ari_next', fen.num_actions);
	fen.num_actions -= 1;
	fen.action_number += 1;

	if (fen.num_actions <= 0) {
		//console.log('NO MORE ACTIONS FOR!!!!!!', uname);
		fen.total_pl_actions = 0;

		lookupAddIfToList(fen, ['actionsCompleted'], uname);
		//fen.actionsCompleted.push(uname);
		let next = ari_select_next_player_according_to_stall_value(fen);

		if (!next) {
			ari_next_phase();
		} else {
			z.turn = [next];
		}
	} else {
		z.stage = 5;
	}
	turn_send_move_update();

}
//#endregion

//#region auction / buy
function process_auction() {
	let [fen, A, uname] = [z.fen, z.A, z.uname];
	//console.log('A', A)
	if (isEmpty(A.selected)) A.selected = [0];
	let playerbid = Number(valf(A.items[A.selected[0]].a, '0')); //A.selected.map(x => A.items[x]); 

	//console.log('player', uname, 'bids', playerbid);
	lookupSet(fen, ['auction', uname], playerbid);
	//console.log('fen.auction', fen.auction);

	let iturn = fen.plorder.indexOf(uname) + 1;
	if (iturn >= fen.plorder.length) {
		//console.log('auction over!');
		//find out max and second max investment
		let list = dict2list(fen.auction, 'uname');
		//list.map(x => { x.amount = x.value; });
		list = sortByDescending(list, 'value');
		//console.log('===>auction as list', list);//.map(x=>x.amount));

		//otree.auction = list;

		let max = list[0].value;
		let second = fen.second_most = list[1].value;

		//all players with max amount have the right to buy a market card for second coins
		z.stage = 13;
		let maxplayers = fen.maxplayers = list.filter(x => x.value == max).map(x => x.uname);
		//fen.round = arrMinus(fen.plorder, maxplayers);
		z.turn = [maxplayers[0]];
		//iturn = fen.plorder.indexOf(maxplayers[0]);
	} else {
		z.turn = [fen.plorder[iturn]];
	}
	//console.log('next player is', z.turn[0]);
	turn_send_move_update(); //wenn send mache muss ich die ui nicht korrigieren!
}
function post_auction() {
	console.assert(z.stage == 13, 'WRONG STAGE IN POST AUCTION ' + z.stage);
	let [fen, A, uname] = [z.fen, z.A, z.uname];
	let item = A.selected.map(x => A.items[x])[0]; // A.items.filter(x => A.selected.includes(x.index)).map(x => x.key);

	lookupSet(fen, ['buy', uname], item);

	for (const plname of fen.maxplayers) {
		if (!lookup(fen, ['buy', plname])) {
			//let iturn = fen.plorder.indexOf(uname);
			z.turn = [plname]; //fen.plorder[iturn];
			turn_send_move_update(); //wenn send mache muss ich die ui nicht korrigieren!
			return;
		}
	}
	//arriving here, everyone has determined what to buy
	//the choices are in fen.buy[plname]

	//if 2 or more players selected the same card, this card is discarded
	//otherwise the player buys the card
	let buylist = dict2list(fen.buy);
	//console.log('buylist', buylist);

	let discardlist = [];
	for (const plname of fen.maxplayers) {
		let choice = fen.buy[plname];
		//console.log('choice of', uname, 'was', choice)

		let is_unique = !firstCond(buylist, x => x.id != plname && x.value == choice);
		if (is_unique) {
			fen.players[plname].coins -= fen.second_most;
			elem_from_to(choice.key, fen.market, fen.players[plname].hand);
		} else {
			addIf(discardlist, choice);
			delete fen.buy[plname];
		}
	}

	//console.log('discardlist', discardlist);
	for (const choice of discardlist) {
		elem_from_to(choice.key, fen.market, fen.deck_discard);
		ari_reorg_discard(fen);
	}

	ari_history_list(get_auction_history(fen), 'auction');

	delete fen.second_most;
	delete fen.maxplayers;
	delete fen.buy;
	delete fen.auction;
	z.stage = 4;
	z.turn = [fen.plorder[0]];
	//ari_next_action();
	turn_send_move_update(); //wenn send mache muss ich die ui nicht korrigieren!


}
function get_auction_history(fen) {
	let lines = [];
	let revorder = jsCopy(fen.plorder).reverse();
	for (const uname of revorder) {
		if (nundef(fen.buy[uname])) continue;
		lines.push(`${uname} buys ${fen.buy[uname].a} for ${fen.second_most}`);
	}
	lines.push(`auction winner${fen.maxplayers.length > 1 ? 's' : ''}: ${fen.maxplayers.join(', ')}`);
	for (const uname of revorder) {
		lines.push(`${uname} bids ${fen.auction[uname]}`);
	}
	return lines;
}
function post_buy() {

	let [fen, A, uname] = [z.fen, z.A, z.uname];
	let item = A.items[A.selected[0]];

	//console.log('buy item',item)
	process_payment();

	elem_from_to(item.key, fen.open_discard, fen.players[uname].hand);
	ari_history_list([`${uname} buys ${item.key}`], 'buy')
	ari_reorg_discard();
	ari_next_action();

}
//#endregion

//#region ball
function post_ball() {
	let [stage, A, fen, uname] = [z.stage, z.A, z.fen, z.uname];

	let keys = A.selected.map(x => A.items[x]).map(x => x.key);

	//console.log('keys', keys)

	keys.map(x => lookupAddIfToList(fen, ['ball', uname], x));
	//console.log('ball', fen.ball);
	keys.map(x => removeInPlace(fen.players[uname].hand, x));

	let iturn = fen.plorder.indexOf(uname) + 1;
	if (iturn >= fen.plorder.length) { //alle sind durch ball selection
		//distribute ball cards according to what each player gave for ball!
		//console.log('TODO: distribute all cards from', otree.ball);
		//console.log('ball over!');
		if (isdef(fen.ball)) {
			let all = [];
			for (const c of fen.market) all.push(c);
			for (const uname in fen.ball) for (const c of fen.ball[uname]) all.push(c);
			//console.log('all ball cards', all);
			shuffle(all);
			//give 2 cards from all to market
			fen.market = [];
			for (let i = 0; i < 2; i++) top_elem_from_to(all, fen.market);
			for (const uname in fen.ball) for (let i = 0; i < fen.ball[uname].length; i++) top_elem_from_to(all, fen.players[uname].hand);
			delete fen.ball;
		} //else { console.log('empty ball!!!'); }

		iturn = 0;
		z.stage = 4;
		console.assert(fen.phase == 'queen', 'wie bitte noch nicht in queen phase?!!!!!!!!!!!');
	}
	z.turn = [fen.plorder[iturn]];
	//console.log('turn', z.turn);
	ari_history_list([`${uname} added ${keys.length} card${plural(keys.length)} to ball!`], 'ball');
	turn_send_move_update(); //wenn send mache muss ich die ui nicht korrigieren!


}
//#endregion

//#region build
function post_build() {
	let [fen, A, uname] = [z.fen, z.A, z.uname];
	if (A.selected.length < 4 || A.selected.length > 6) {
		output_error('select 4, 5, or 6 cards to build!');
		return;
	}
	let building_items = A.selected.map(x => A.items[x]); //A.building_items;

	//console.log('building items', building_items);

	let building_type = building_items.length == 4 ? 'farm' : building_items.length == '5' ? 'estate' : 'chateau';
	//console.log('===>player', uname, 'building a', building_type);


	fen.players[uname].buildings[building_type].push({ list: building_items.map(x => x.key), h: null });

	//remove building_items from hand/stall
	for (const item of building_items) {
		let source = lookup(fen, item.path.split('.'));
		//console.log('item.path', item.path);
		//console.log('source', source);
		removeInPlace(source, item.key);
	}
	process_payment();

	ari_history_list([`${uname} builds a ${building_type}`], 'build');
	ari_next_action(fen, uname);
}
//#endregion

//#region commission
function process_commission() {
	let [fen, A, uname] = [z.fen, z.A, z.uname];

	console.log('process_commission:', z.A.items[z.A.selected[0]]);

	//was muss jetzt passieren?
	//1. frage den player was er auswaehlen wird?
	A.commission = A.items[A.selected[0]];
	z.stage = 16;
	ari_pre_action();
}
function post_commission() {
	let [fen, A, uname] = [z.fen, z.A, z.uname];

	let comm_selected = A.items[A.selected[0]];
	//console.log('process_commission:', comm_selected);

	//1. berechne wieviel der player bekommt!
	//first check N1 = wie oft im fen.commissioned der rank von A.commission schon vorkommt
	//fen.commissioned koennte einfach sein: array of {rank:rank,count:count} und sorted by latest
	let rank = A.commission.key[0];
	if (nundef(fen.commissioned)) fen.commissioned = [];
	let x = firstCond(fen.commissioned, x => x.rank == rank);
	if (x) { removeInPlace(fen.commissioned, x); }
	else { x = { rank: rank, count: 0 }; }

	//console.log('x', x)

	x.count += 1;

	//is the rank >= that the rank of the topmost commissioned card
	let pl = fen.players[uname];
	let top = isEmpty(fen.commissioned) ? null : arrLast(fen.commissioned);
	let rankstr = 'A23456789TJQK';
	let points = !top || get_rank_index(rank, rankstr) >= get_rank_index(top.rank, rankstr) ? 1 : 0;
	points += Number(x.count);
	pl.coins += points;
	fen.commissioned.push(x);

	let key = A.commission.similar.key;
	if (pl.hand.includes(key)) removeInPlace(pl.hand, key); else removeInPlace(pl.stall, key);

	if (comm_selected.path == 'open_commissions') {
		//top comm deck card goes to open commissions
		removeInPlace(fen.open_commissions, comm_selected.key);
		top_elem_from_to(fen.deck_commission, fen.open_commissions);
	} else {
		removeInPlace(fen.deck_commission, comm_selected.key);
	}

	//console.log('pl', pl, pl.commissions);
	arrReplace(pl.commissions, [A.commission.key], [comm_selected.key]);

	ari_history_list([`${uname} replaced commission card ${A.commission.key} by ${comm_selected.key}`, `${uname} gets ${points} for commissioning ${A.commission.key}`], 'commission');

	ari_next_action();
}

//#endregion

//#region downgrade
function process_downgrade() {
	let [fen, A, uname] = [z.fen, z.A, z.uname];
	A.building = A.items[A.selected[0]];
	console.log('A.building is', A.building, 'A.selected', A.selected);
	//next have to select 1 or more cards to take into hands from building
	fen.stage = z.stage = 103;

	let items = ui_get_hidden_building_items(A.building.o);
	//console.log('items to select:',items);
	items.map(x => face_up(x.o));
	A.possible_downgrade_cards = items;
	ari_pre_action();

}
function post_downgrade() {
	let [fen, A, uname] = [z.fen, z.A, z.uname];

	A.downgrade_cards = A.selected.map(x => A.items[x]); //
	//console.log('A.candidates',A.possible_downgrade_cards);
	//console.log('selected indices',A.selected);
	//console.log('selected these cards to downgrade:',A.downgrade_cards);

	let obuilding = lookup(fen, A.building.path.split('.'));

	//get number of cards in this building
	let n = obuilding.list.length;
	let nremove = A.downgrade_cards.length;
	let nfinal = n - nremove;

	//remove this building from its list
	let type = A.building.o.type;
	let list = fen.players[uname].buildings[type];
	removeInPlace(list, obuilding);
	let cards = A.downgrade_cards.map(x => x.key);

	if (nfinal < 4) {
		//entire building take to hand
		fen.players[uname].hand = fen.players[uname].hand.concat(obuilding.list);
	} else if (nfinal == 4) {
		//add the building to farm
		fen.players[uname].buildings.farm.push(obuilding);
		fen.players[uname].hand = fen.players[uname].hand.concat(cards);
	} else if (nfinal == 5) {
		//add the building to estate
		fen.players[uname].buildings.estate.push(obuilding);
		fen.players[uname].hand = fen.players[uname].hand.concat(cards);
	} else if (nfinal == 6) {
		//add the building to chateau
		fen.players[uname].buildings.chateau.push(obuilding);
		fen.players[uname].hand = fen.players[uname].hand.concat(cards);
	}
	A.downgrade_cards.map(x => removeInPlace(obuilding.list, x.key));

	//process_payment(); //kostet downgrade was? NEIN! uncomment falls was kostet!

	ari_history_list([`${uname} downgrades a ${ari_get_building_type(obuilding)}`], 'downgrade');

	ari_next_action(fen, uname);
}
//#endregion

//#region endgame
function ari_reveal_all_buildings(fen) {
	for (const uname of fen.plorder) {
		let gbs = UI.players[uname].buildings;
		for (const gb of gbs) {
			gb.items.map(x => face_up(x));
			//console.log('gb',gb);
		}
	}

}
function post_endgame() {
	let [fen, A, uname] = [z.fen, z.A, z.uname];
	//console.log('A', A, 'uname', uname, 'fen', fen); console.log('was soll jetzt passieren?')
	console.log('post_endgame...................................?', A.selected[0])
	if (A.selected[0] == 0) {

		console.log('GAMEOVER!!!!!!!!!!!!!!!!!!!');

		//berechne fuer jeden real vps!
		for (const plname of fen.plorder) {
			//let [bcorrect, realvps] = ari_get_correct_buildings(fen.players[plname].buildings);
			fen.players[plname].score = ari_get_real_vps(fen, plname); //realvps;
			console.log('real vps of', plname, fen.players[plname].score);
		}
		//make a list of player name, realvps
		let scores = fen.plorder.map(x => ({ name: x, vps: fen.players[x].score }));
		let sorted = sortByDescending(scores, 'vps');
		//announce the winner!
		console.log('THE WINNER IS', sorted[0].name, sorted);

		//reveal all player buildings!
		//console.log('reveal buildings')
		ari_reveal_all_buildings(fen);
		//turn_send_move_update(otree, plturn); //wenn send mache muss ich die ui nicht korrigieren!
		//da brauch ich irgend so ein gameover message!!!!
		fen.winner = sorted[0].name;
		turn_send_move_update(); //wenn send mache muss ich die ui nicht korrigieren!

	} else { 
		// *** this potential winner chose go on! ***
		let iturn = fen.pl_gameover.indexOf(uname) + 1;
		//console.log('pl_gameover', otree.pl_gameover)
		if (iturn >= fen.pl_gameover.length) { //niemand wollte beenden: move to queen phase!
			delete fen.pl_gameover;
			z.turn = [fen.plorder[0]];
			z.phase = 'queen';
			z.stage = set_journey_or_stall_stage(fen,z.options,z.phase);
			turn_send_move_update(); //wenn send mache muss ich die ui nicht korrigieren!

		} else {
			z.turn = [fen.pl_gameover[iturn]];
			turn_send_move_update(); //wenn send mache muss ich die ui nicht korrigieren!
		}
	}

}
//#endregion

//#region exchange
function ai_pick_legal_exchange() {
	//mach einfach alle pairs von legal trades
	let [A, fen, uname, items] = [z.A, z.fen, z.uname, z.A.items];

	//console.log('A',A);

	let firstPick = rChoose(items, 1, x => x.path.includes('building'));
	let secondPick = rChoose(items, 1, x => !x.path.includes('building'));

	return [firstPick, secondPick];

}

function post_exchange() {
	let [fen, A, uname] = [z.fen, z.A, z.uname];
	//there should be exactly 2 selected actions and they should be in different groups
	//the 2 actions correspond to the 2 legal cards to trade!
	if (A.selected.length != 2) {
		output_error('please, select exactly 2 cards!');
		return;
	}
	let i0 = A.items[A.selected[0]];
	let i1 = A.items[A.selected[1]];
	//one of the cards has to be from a building
	let [p0, p1] = [i0.path, i1.path];
	if (p0.includes('build') == p1.includes('build')) {
		output_error('select exactly one building card and one of your hand or stall cards!');
		return;
	}

	exchange_items_in_fen(fen, i0, i1); //replace cards in otree
	//the repaired building loses its schwein if any!
	//console.log('exchange items', i0, i1);

	let ibuilding = p0.includes('build') ? i0 : i1;
	let obuilding = lookup(fen, stringBeforeLast(ibuilding.path, '.').split('.'));
	//console.log('obuilding', obuilding);
	obuilding.schwein = null;

	ari_history_list([`${uname} exchanges card in ${ari_get_building_type(obuilding)}`], 'exchange');
	ari_next_action();
}
//#endregion

//#region general helpers
function aggregate_player(fen, prop) {
	let res = [];
	for (const uname in fen.players) {
		let list = fen.players[uname][prop];
		res = res.concat(list);
	}
	return res;
}
function ari_add_hand_card() {
	//distribute cards
	let fen = z.fen;
	for (const uname of fen.plorder) {
		ari_ensure_deck(fen, 1);
		top_elem_from_to(fen.deck, fen.players[uname].hand);
	}
}
function ari_add_harvest_cards(fen) {
	//console.log('deck', jsCopy(otree.deck));
	for (const uname of fen.plorder) {
		for (const f of fen.players[uname].buildings.farm) {
			if (nundef(f.h)) {
				//what is run out of cards!!!
				let list = [];
				ari_ensure_deck(fen, 1);
				top_elem_from_to(fen.deck, list);
				//let ckey = otree.deck.shift();
				f.h = list[0];
				//console.log('adding harvest key', f.h, jsCopy(otree.deck));
			}
		}
	}
}
function ari_check_end_condition(blist) {
	let nchateau = blist.chateau.length;
	let nfarm = blist.farm.length;
	let nestate = blist.estate.length;
	if (nchateau >= 2 || nchateau >= 1 && nfarm >= 3 || nchateau >= 1 && nestate >= 2) {
		return true;
	}
	return false;

}
function ari_deck_deal_safe(fen, n) {
	ari_ensure_deck(fen, n);
	deck_deal(fen.deck, n);
}
function ari_ensure_deck(fen, n) {
	if (fen.deck.length < n) { ari_refill_deck(fen); }

}
function ari_get_real_vps(fen, uname) {
	let pl = fen.players[uname];
	let bs = ari_get_correct_buildings(pl.buildings);
	let vps = calc_building_vps(bs);
	for (const btype in bs) {
		let blist = bs[btype];
		for (const b of blist) {
			let lead = b.list[0];
			if (firstCond(pl.commissions, x => x[0] == lead[0])) vps += 1;
		}
	}
	return vps;
}
function ari_get_fictive_vps(fen, uname) {
	let pl = fen.players[uname];
	let bs = pl.buildings;
	let vps = calc_building_vps(bs);
	return vps;
}
function ari_get_building_type(obuilding) { let n = obuilding.list.length; return n == 4 ? 'farm' : n == 5 ? 'estate' : 'chateau'; }
function ari_get_correct_buildings(buildings) {
	let bcorrect = { farm: [], estate: [], chateau: [] };
	//let realvps = 0;
	for (const type in buildings) {
		for (const b of buildings[type]) {
			let list = b.list;
			//console.log('list', list)
			let lead = list[0];
			let iscorrect = true;
			for (const key of arrFromIndex(list, 1)) {
				if (key[0] != lead[0]) { iscorrect = false; continue; }//schweine building wird nicht gerechnet!
			}
			//console.log('building',list,'is',iscorrect?'correct':'schwein!')
			if (iscorrect) {
				//console.log('type',type)
				//realvps += (type == 'farm' ? 1 : type == 'estate' ? 2 : 3);
				lookupAddIfToList(bcorrect, [type], b);
			}
		}
	}
	//console.log('realvps',realvps,'bcorrect',bcorrect);
	return bcorrect; // [bcorrect, realvps];
}
function ari_history_list(lines, title = 'unknown') {
	let fen = z.fen;
	if (nundef(fen.history)) fen.history = [];
	fen.history.push(lines);
	//lookupSetOverride(z.fen,['history',title],lines);
	//console.log('____history', fen.history);
}
function ari_move_herald(fen) {
	// let cur_herald = fen.plorder[0];
	// let next_herald = fen.plorder[1];
	fen.plorder = arrCycle(fen.plorder, 1);
	ari_history_list([`*** new herald: ${fen.plorder[0]} ***`], 'herald');
	return fen.plorder[0];
}
function ari_move_market_to_discard() {
	let fen = z.fen;
	while (fen.market.length > 0) {
		elem_from_to_top(fen.market[0], fen.market, fen.deck_discard);
	}
	ari_reorg_discard();
}
function ari_move_stalls_to_hands() {
	let fen = z.fen;
	for (const uname of fen.plorder) {
		fen.players[uname].hand = fen.players[uname].hand.concat(fen.players[uname].stall);
		fen.players[uname].stall = [];
	}
}
function ari_next_phase() {
	let [fen, uname] = [z.fen, z.uname];
	ari_move_market_to_discard();
	ari_move_stalls_to_hands();
	ari_add_hand_card();
	delete fen.actionsCompleted;
	delete fen.stallSelected;
	z.turn = [fen.plorder[0]];
	if (z.stage == 10) {
		//nach ende von king phase!
		z.phase = 'queen';
		z.stage = set_journey_or_stall_stage(fen, z.options, z.phase);
	} else if (fen.phase == 'king') {
		//geh nur in stage 10 wenn irgendwer meets endconditions!!!
		fen.pl_gameover = [];
		for (const plname of fen.plorder) {
			//let [bcorrect, realvps] = ari_get_correct_buildings(fen.players[plname].buildings);
			//console.log('player', plname, bcorrect, '\nVP', realvps);
			let bcorrect = ari_get_correct_buildings(fen.players[plname].buildings);
			let can_end = ari_check_end_condition(bcorrect);
			//console.log('end cond met:', can_end ? 'yes' : 'no');
			if (can_end) fen.pl_gameover.push(plname);
		}

		if (!isEmpty(fen.pl_gameover)) {
			z.stage = 10;
			//console.log('plorder',otree.plorder,'pl_gameover',otree.pl_gameover,'iturn',otree.iturn);
			z.turn = [fen.pl_gameover[0]];
		} else {
			z.phase = 'queen';
			z.stage = set_journey_or_stall_stage(fen, z.options, z.phase);
		}
	} else if (fen.phase == 'queen') {

		//distribute coins
		for (const uname of fen.plorder) {
			//console.log('buildings of', uname, otree.players[uname].buildings)
			for (const k in fen.players[uname].buildings) {
				if (k == 'farm') continue;

				let n = fen.players[uname].buildings[k].length;
				fen.players[uname].coins += n;
				if (n > 0) ari_history_list([`${uname} gets ${n} coins for ${k} buildings`]);
			}
		}

		z.phase = 'jack';
		z.stage = set_journey_or_stall_stage(fen, z.options, z.phase);
	} else {
		//gesamte runde fertig: herald moves!
		fen.herald = ari_move_herald(fen, uname); //fen.plorder changed in there!
		ari_add_harvest_cards(fen);
		z.phase = 'king';
		let taxneeded = ari_tax_phase_needed(fen);
		z.turn = taxneeded ? fen.turn : [fen.herald];
		// if (taxneeded) z.stage = 2; else z.stage = set_journey_or_stall_stage(fen, z.options, z.phase);
		// z.stage = taxneeded ? 2 : 3;
		z.stage = taxneeded ? 2 : set_journey_or_stall_stage(fen, z.options, z.phase);
	}

	return z.stage;

}
function ari_reorg_discard() {
	let fen = z.fen;
	//organize open_discard: if < 4, add cards from bottom of deck_discard to open_discard
	while (fen.deck_discard.length > 0 && fen.open_discard.length < 4) {
		bottom_elem_from_to(fen.deck_discard, fen.open_discard);
	}
}
function ari_refill_deck(fen) {
	fen.deck = fen.deck.concat(fen.open_discard).concat(fen.deck_discard);
	shuffle(fen.deck);
	fen.open_discard = [];
	fen.deck_discard = [];
	console.log('deck refilled: contains', fen.deck.length, 'cards');
}
function calc_building_vps(bs) {
	//let bs = fen.players[uname].buildings;
	let res = 0;
	res += bs.farm.length;
	res += bs.estate.length * 2;
	res += bs.chateau.length * 3;
	return res;

}
function calc_stall_value(fen, uname) { let st = fen.players[uname].stall; if (isEmpty(st)) return 0; else return arrSum(st.map(x => Aristocards[x].val)); }
function exchange_items_in_fen(fen, o0, o1) {
	//let fen = z.fen;
	let p0 = o0.path.split('.'); if (isdef(fen.players[p0[0]])) p0.unshift('players');
	let p1 = o1.path.split('.'); if (isdef(fen.players[p1[0]])) p1.unshift('players');
	let list0 = lookup(fen, p0);
	//console.log('o0.path',o0.path);
	//console.log('p0',p0);
	//console.log('list0',list0)
	let list1 = lookup(fen, p1); //['players'].concat(o1.path.split('.')));
	//console.log('list1',list1)
	elem_from_to(o0.key, list0, list1);
	elem_from_to(o1.key, list1, list0);
}
function find_sequences(blatt, n = 2, rankstr = '23456789TJQKA', allow_cycle = false) {
	//a sequence is several cards in a row of the same suit
	//algo!
	//let ranks = toLetters(rankstr);	//1. sort blatt into suitlists
	let suitlists = get_suitlists_sorted_by_rank(blatt, true); //true...remove_duplicates
	//console.log('suitlists', suitlists);
	let seqs = [];
	//2. foreach list:
	for (const lst of get_values(suitlists)) {
		let len = lst.length;
		if (len < n) continue;
		let l = allow_cycle ? lst.concat(lst) : lst;
		//console.log('lst',lst,'l',l);
		//console.log('len',len);
		for (let istart = 0; istart < len; istart++) {
			let seq = [l[istart]];
			let i = istart;
			//console.log(follows_in_rank(l[i], l[i + 1],rankstr));
			while (i + 1 < l.length && follows_in_rank(l[i], l[i + 1], rankstr)) {
				seq.push(l[i + 1]);
				//console.log('seq',seq);
				i++;
			}
			//console.log('seq',seq,'n',n,seq.length>=n);
			if (seq.length >= n) seqs.push(seq);
		}
	}
	//console.log('seqs', seqs);
	return seqs;
}
function follows_in_rank(c1, c2, ranks) {
	//console.log('follows_in_rank:',c1,c2)
	let i1 = ranks.indexOf(c1[0]);
	let i2 = ranks.indexOf(c2[0]);
	//console.log('follows?',c1,i1,c2,i2,i2-i1)
	return ranks.indexOf(c2[0]) - ranks.indexOf(c1[0]) == 1;
}
function get_rank_index(ckey, rankstr = '23456789TJQKA') { return rankstr.indexOf(ckey[0]); }
function get_suitlists_sorted_by_rank(blatt, remove_duplicates = false) {
	let di = {};
	for (const k of blatt) {
		let suit = k[1];
		if (nundef(di[suit])) di[suit] = [];
		if (remove_duplicates) addIf(di[suit], k); else di[suit].push(k);
	}
	//let di_sorted = {};
	for (const s in di) {
		sortByRank(di[s]);
	}
	return di;
}
function player_stat_count(key, n, dParent, styles = {}) {
	let sz = valf(styles.sz, 16);
	let d = mDiv(dParent, { display: 'flex', dir: 'c', fz: sz, align: 'center' });
	let s = mSym(key, d, { h: sz, fz: sz }); //, fg: INNO.sym[key].fg });
	//mText(n,d,{w:'100%'})
	d.innerHTML += `<span>${n}</span>`;
	return d;
}
function reindex_items(items) { let i = 0; items.map(x => { x.index = i; i++; }); }
function remove_hover_ui(b) { b.onmouseenter = null; b.onmouseleave = null; }
function set_hover_ui(b, item) {
	let isCard = isdef(item.c52key);

	let d = iDiv(item);

	b.onmouseenter = () => {
		if (isCard) {
			let rs = Array.from(d.getElementsByTagName('rect'));
			//provision for rs is building (not a card)
			let r = arrLast(rs);
			//console.log('r', r);
			let fill = b.fill = r.getAttribute('fill');
			r.setAttribute('fill', 'silver');
		} else {
			let hallo = mGetStyle(d, 'bg');
			//console.log('hallo',hallo,nundef(hallo),isString(hallo));
			let bg = isEmpty(hallo) ? 'transparent' : valf(mGetStyle(d, 'bg'), 'transparent');
			d.setAttribute('bg', bg);
			//console.log('..................................style bg is',bg);
			mStyle(d, { bg: 'silver' });

		}
	}
	b.onmouseleave = () => {
		if (isCard) {
			let rs = Array.from(d.getElementsByTagName('rect'));
			//provision for rs is building (not a card)
			let r = arrLast(rs);
			//console.log('r', r);
			r.setAttribute('fill', b.fill);
		} else {
			let bg = d.getAttribute('bg');
			//console.log('d.bg',bg)
			mStyle(d, { bg: bg });
		}
	}
}
function sortByRank(cards, rankstr = '23456789TJQKA') {
	let ranks = toLetters(rankstr);
	cards.sort((a, b) => ranks.indexOf(a[0]) - ranks.indexOf(b[0]));

}
//#endregion

//#region get ui items for various object groups
function ui_get_commission_items(uname) {
	//console.log('uname',uname,UI.players[uname])
	let items = [], i = 0;
	let comm = UI.players[uname].commissions;
	let hand_and_stall = ui_get_hand_and_stall_items(uname);
	for (const o of comm.items) {
		let rank = o.key[0];
		let similar = firstCond(hand_and_stall, x => x.key[0] == rank);
		if (!similar) continue;
		//console.log('path', hand.path);
		//console.log(UI.players[uname].hand.path);
		let item = { o: o, a: o.key, key: o.key, friendly: o.short, path: comm.path, index: i, similar: similar };
		i++;
		items.push(item);
	}
	return items;
}
function ui_get_commission_new_items(uname) {
	//console.log('uname',uname,UI.players[uname])
	//das muss sein fen.open_commissions oder deck
	let items = [], i = 0;
	let comm = UI.open_commissions;
	for (const o of comm.items) {
		let item = { o: o, a: o.key, key: o.key, friendly: o.short, path: comm.path, index: i };
		i++;
		items.push(item);
	}
	//let topdeck=UI.deck_commission.topmost;
	items = items.concat(ui_get_string_items(uname, ['surprise']));
	let ideck = arrLast(items);
	ideck.idCard = UI.deck_commission.topmost.div.id;
	ideck.o = UI.deck_commission.topmost;
	ideck.uids = [ideck.idButton, ideck.idCard];
	//items.push({ o: topdeck, a: topdeck.key, key: topdeck.key, friendly: topdeck.short, path: 'deck_commission.topmost', index: i });
	console.log('choose among:', items)
	return items;
}
function ui_get_building_items(uname) {
	let gblist = UI.players[uname].buildings;
	let items = [], i = 0;
	for (const o of gblist) {
		let name = o.type + ' ' + (o.list[0][0] == 'T' ? '10' : o.list[0][0]);
		o.div = o.container;
		let item = { o: o, a: name, key: o.list[0], friendly: name, path: o.path, index: i, ui: o.container };
		i++;
		items.push(item);
	}
	console.log('________building items', items)
	return items;
}
function ui_get_farms_estates_items(uname) { return ui_get_building_items_of_type(uname, ['farm', 'estate']); }
function ui_get_estates_chateaus_items(uname) { return ui_get_building_items_of_type(uname, ['estate', 'chateau']); }

function ui_get_building_items_of_type(uname, types = ['farm', 'estate', 'chateau']) {
	let gblist = UI.players[uname].buildings.filter(x => types.includes(x.type));
	//console.log('gblist', gblist);
	let items = [], i = 0;
	for (const o of gblist) {
		let name = o.type + ' ' + (o.list[0][0] == 'T' ? '10' : o.list[0][0]);
		o.div = o.container;
		let item = { o: o, a: name, key: o.list[0], friendly: name, path: o.path, index: i, ui: o.container };
		i++;
		items.push(item);
	}
	return items;
}
function ui_get_buildings(gblist) {
	let items = [], i = 0;
	for (const o of gblist) {
		let name = o.type + ' ' + (o.list[0][0] == 'T' ? '10' : o.list[0][0]);
		o.div = o.container;
		let item = { o: o, a: name, key: o.list[0], friendly: name, path: o.path, index: i, ui: o.container };
		i++;
		items.push(item);
	}
	return items;
}
function ui_get_other_buildings(uname) {
	let items = [];
	for (const plname of z.plorder) {
		if (plname == uname) continue;
		items = items.concat(ui_get_buildings(UI.players[plname].buildings));
	}
	reindex_items(items);
	return items;
}
function ui_get_hidden_building_items(b) {
	let items = [];
	for (let i = 1; i < b.items.length; i++) {
		let o = b.items[i];
		//console.log('o',o);
		let item = { o: o, a: o.key, key: o.key, friendly: o.short, path: b.path + '.list', index: i - 1 };
		items.push(item);
	}
	return items;
}
function ui_get_all_hidden_building_items(uname) {
	let items = [];
	for (const gb of UI.players[uname].buildings) {
		items = items.concat(ui_get_hidden_building_items(gb));
	}
	reindex_items(items);
	return items;
}
function ui_get_hand_items(uname) {
	//console.log('uname',uname,UI.players[uname])
	let items = [], i = 0;
	let hand = UI.players[uname].hand;
	for (const o of hand.items) {
		//console.log('path', hand.path);
		//console.log(UI.players[uname].hand.path);
		let item = { o: o, a: o.key, key: o.key, friendly: o.short, path: hand.path, index: i };
		i++;
		items.push(item);
	}
	return items;
}
function ui_get_stall_items(uname) {
	let items = [], i = 0;
	let stall = UI.players[uname].stall;
	for (const o of stall.items) {
		let item = { o: o, a: o.key, key: o.key, friendly: o.short, path: stall.path, index: i };
		i++;
		items.push(item);
	}
	return items;
}
function ui_get_harvest_items(uname) {
	let items = []; let i = 0;
	for (const gb of UI.players[uname].buildings) {
		//console.log('gbuilding', gb);
		if (isdef(gb.harvest)) {
			let d = gb.harvest;
			mStyle(d, { cursor: 'pointer', opacity: 1 });
			gb.div = d;
			let name = 'H' + i + ':' + (gb.list[0][0] == 'T' ? '10' : gb.list[0][0]);
			let item = { o: gb, a: name, key: name, friendly: name, path: gb.path, index: i };
			i++;
			items.push(item);
		}
	}
	return items;
}
function ui_get_journey_items(uname) {
	let gblist = UI.players[uname].journeys;
	let items = [], i = 0;
	for (const o of gblist) {
		let name = `${uname}_j${i}`;
		o.div = o.container;
		let item = { o: o, a: name, key: o.list[0], friendly: name, path: o.path, index: i, ui: o.container };
		i++;
		items.push(item);
	}
	return items;
}
function ui_get_payment_items(pay_letter) {
	let [fen, A, uname] = [z.fen, z.A, z.uname];
	let items = ui_get_hand_and_stall_items(uname); //gets all hand and stall cards

	let n = items.length;

	items = items.filter(x => x.key[0] == pay_letter);

	if (n == 4 && A.command == 'build') items = []; //das ist damit min building items gewahrt bleibt!

	if (fen.players[uname].coins > 0 && fen.phase[0].toUpperCase() == pay_letter) {
		items.push({ o: null, a: 'coin', key: 'coin', friendly: 'coin', path: null });
	}
	let i = 0; items.map(x => { x.index = i; i++; }); //need to reindex when concat!!!
	return items;
}
function ui_get_open_discard_items() {
	let items = [], i = 0;
	for (const o of UI.open_discard.items) {
		let item = { o: o, a: o.key, key: o.key, friendly: o.short, path: `open_discard`, index: i };
		i++;
		items.push(item);
	}
	return items;
}
function ui_get_market_items() {
	let items = [], i = 0;
	for (const o of UI.market.items) {
		let item = { o: o, a: o.key, key: o.key, friendly: o.short, path: `market`, index: i };
		i++;
		items.push(item);
	}
	return items;
}
function ui_get_commands(uname) {

	let avail = ari_get_actions(uname);
	let items = [], i = 0;
	for (const cmd of avail) { //just strings!
		let item = { o: null, a: cmd, key: cmd, friendly: cmd, path: null, index: i };
		i++;
		items.push(item);
	}
	//console.log('available commands', items);
	return items;
}
function ui_get_string_items(uname, commands) {
	let items = [], i = 0;
	for (const cmd of commands) { //just strings!
		let item = { o: null, a: cmd, key: cmd, friendly: cmd, path: null, index: i };
		i++;
		items.push(item);
	}
	//console.log('available commands', items);
	return items;
}
function ui_get_endgame(uname) { return ui_get_string_items(uname, ['end game', 'go on']); }
function ui_get_coin_amounts(uname) {
	let items = [];
	for (let i = 0; i <= z.fen.players[uname].coins; i++) {
		let cmd = '' + i;
		let item = { o: null, a: cmd, key: cmd, friendly: cmd, path: null, index: i };
		items.push(item);
	}
	return items;
}
//concatenating primitive lists of items:
function ui_get_trade_items(uname) {
	let items = ui_get_market_items(uname);
	items = items.concat(ui_get_stall_items(uname));//zuerst eigene!
	for (const plname of z.fen.plorder) {
		if (plname != uname) items = items.concat(ui_get_stall_items(plname));
	}
	reindex_items(items);
	return items;
}
function ui_get_hand_and_stall_items(uname) {
	let items = ui_get_hand_items(uname);
	items = items.concat(ui_get_stall_items(uname));

	reindex_items(items);
	return items;
}
function ui_get_hand_and_journey_items(uname) {
	let items = ui_get_hand_items(uname);

	let matching = [];
	for (const plname of z.plorder) {
		//items = items.concat(ui_get_journey_items(plname)); 

		//ne, das muss besser werden!
		//nur die journeys zu denen ich potentially anlegen kann sollen geadded werden!

		let jitems = ui_get_journey_items(plname);
		for (const j of jitems) {
			for (const card of items) {
				if (matches_on_either_end(card, j)) { matching.push(j); break; }
			}
		}
	}

	items = items.concat(matching).concat(ui_get_string_items(uname, ['pass']));

	reindex_items(items);
	return items;
}
function ui_get_build_items(uname, except) {
	let items = ui_get_hand_and_stall_items(uname);
	if (is_card(except)) items = items.filter(x => x.key != except.key);
	//console.log('__________build items:', items)
	reindex_items(items);
	return items;
}
function ui_get_exchange_items(uname) {
	//all hand items
	let ihand = ui_get_hand_items(uname);
	//all stall items
	let istall = ui_get_stall_items(uname);
	//all invisible (1+) building items
	let irepair = ui_get_all_hidden_building_items(uname);
	irepair.map(x => face_up(x.o));
	let items = ihand.concat(istall).concat(irepair);
	reindex_items(items);

	//console.log('exchange items',items)
	return items;
}
//#endregion

//#region harvest
function post_harvest() {
	let [A, fen, uname] = [z.A, z.fen, z.uname];
	let item = A.items[A.selected[0]];
	//console.log('harvesting from farm', item.path, item);

	//harvest card ist removed
	let obuilding = lookup(fen, item.path.split('.'));
	//console.log('obuilding', obuilding);
	//add the harvest card to hand
	fen.players[uname].hand.push(obuilding.h);
	obuilding.h = null;
	ari_history_list([`${uname} harvests`], 'harvest');
	ari_next_action();

}
//#endregion

//#region hack
function find_common_ancestor(d1, d2) { return dTable; }
//#endregion

//#region market and stalls
function ari_open_market(fen, phase, deck, market) {
	//let [fen, phase, deck, market] = [z.fen, z.phase, z.deck, z.market];
	console.log('*** MARKET OPENS!!! ***')

	DA.qanim = [];
	let n_market = phase == 'jack' ? 3 : 2;
	fen.stage = z.stage = phase == 'jack' ? 12 : phase == 'queen' ? 11 : 4;
	fen.stallSelected = [];

	// ari_ensure_deck(fen,n_market); //nein es hat ja mit ui zu tun!!! muss es schon bei deck present machen!!!

	for (let i = 0; i < n_market; i++) {
		DA.qanim.push([qanim_flip_topmost, [deck]]);
		DA.qanim.push([qanim_move_topmost, [deck, market]]);
		DA.qanim.push([q_move_topmost, [deck, market]]);
	}
	DA.qanim.push([q_mirror_fen, ['deck', 'market']]);
	DA.qanim.push([ari_pre_action, []]);
	qanim();
}
function ari_select_next_player_according_to_stall_value() {
	//all players have selected their stalls and now need to calc stall values and set turn order accordingly!
	let [stage, A, fen, uname] = [z.stage, z.A, z.fen, z.uname];

	z.stage = 5;
	let minval = 100000;
	let minplayer = null;

	for (const uname of fen.plorder) {
		if (fen.actionsCompleted.includes(uname)) continue;
		let stall = fen.players[uname].stall;
		if (isEmpty(stall)) { fen.actionsCompleted.push(uname); continue; }
		//console.log('Aristocards', Aristocards);
		let val = fen.players[uname].stall_value = arrSum(stall.map(x => Aristocards[x].val));
		if (val < minval) { minval = val; minplayer = uname; }

	}
	if (!minplayer) {
		//maybe all players have empty stall,
		return null;
	} else {
		z.turn = fen.turn = [minplayer];
		fen.num_actions = fen.total_pl_actions = fen.players[minplayer].stall.length;
		fen.action_number = 1;
		return minplayer;
	}

}
function is_stall_selection_complete() { return z.fen.stallSelected.length == z.fen.plorder.length; }
function post_stall_selected() {

	let [stage, A, fen, uname] = [z.stage, z.A, z.fen, z.uname];

	//move selected keys from hand to stall
	let selectedKeys = A.selected.map(i => A.items[i].key);
	for (const ckey of selectedKeys) {
		elem_from_to(ckey, fen.players[uname].hand, fen.players[uname].stall);
	}
	fen.stallSelected.push(uname);

	//if all players have selected, calc stall values and set uname to player with minimum
	if (is_stall_selection_complete()) {
		//console.log('stall selection complete!');
		delete fen.stallSelected;
		fen.actionsCompleted = [];
		let next = ari_select_next_player_according_to_stall_value();
		console.assert(next, 'NOBODY PUT UP A STALL!!!!!!!');

		if (!next) { ari_next_phase(); }
	} else {
		z.turn = [get_next_player(z, uname)];
	}


	ari_history_list([`${uname} puts up a stall for ${selectedKeys.length} action${plural(selectedKeys.length)}`], 'stall');

	turn_send_move_update();
}
//#endregion

//#region journey
function check_correct_journey(A, fen, uname) {
	let items = A.selected.map(x => A.items[x]);
	if (items.length < 2) {
		output_error('please select at least 2 items!'); return [null, null, null];//a total of at least 2 items must be selected
	}
	let carditems = items.filter(x => is_card(x));
	if (isEmpty(carditems)) {
		output_error('please select at least 1 card!'); return [null, null, null];//at least one hand card must be selected
	} else if (items.length - carditems.length > 1) {
		output_error('please select no more than 1 journey!'); return [null, null, null];//at most one journey must be selected
	}

	//legal selection ONLY IF IT FITS!!!
	//make a flat list of cards and check if this is a journey indeed
	let journeyitem = firstCond(items, x => !is_card(x));
	let cards = journeyitem ? jsCopy(journeyitem.o.list) : [];
	cards = cards.concat(carditems.map(x => x.o.key));

	//console.log('cards are:', cards);
	let jlegal = is_journey(cards);
	if (!jlegal || jlegal.length != cards.length) {
		output_error('this is not a legal journey!!'); return [null, null, null];//is this a legal journey?
	}

	return [carditems, journeyitem, jlegal];
}
function find_players_with_potential_journey(fen) {
	let res = [];
	//console.log('plorder',fen.plorder)
	for (const uname of fen.plorder) {
		if (isdef(fen.passed) && fen.passed.includes(uname)) continue;
		let j = find_journeys(fen, uname);
		//console.log('uname',uname,'journeys',j);
		if (!isEmpty(j)) res.push(uname);
	}
	//console.log('res',res)
	return res;
}
function find_journeys(fen, uname) {
	//zuerst finde alle sequences von mindestens 2 in player's hand
	let h = fen.players[uname].hand;
	let seqs = find_sequences(h, 2, 'A23456789TJQK');
	//console.log('seqs',seqs);
	if (!isEmpty(seqs)) return seqs;
	//danach aggregate all existing journeys and find all cards that fit any end of any journey
	let existing_journeys = aggregate_player(fen, 'journeys');
	for (const j of existing_journeys) {
		let h1 = j.concat(h);
		let seqs1 = find_sequences(h1, j.length + 1, 'A23456789TJQK');
		if (!isEmpty(seqs1)) return seqs1;
		//if (!isEmpty(seqs1)) seqs = seqs.concat(seqs1);
	}
	//console.log('seqs',seqs);
	return seqs;
}
function is_journey(cards) {
	let jlist = find_sequences(cards, cards.length, 'A23456789TJQK');
	//console.log('jlist',jlist);
	let j = firstCond(jlist, x => x.length == cards.length);
	//console.log('jlegal',j);
	return j;
	// if (!isEmpty(jlist)) [0]; else return false;
}
function matches_on_either_end(card, j) {
	//console.log('card',card,'j',j);

	let key = card.key;
	let jfirst = arrFirst(j.o.list);
	let jlast = arrLast(j.o.list);
	rankstr = '23456789TJQKA';

	let [s, s1, s2] = [key[1], jfirst[1], jlast[1]];

	let anfang = s == s1 && follows_in_rank(key, jfirst, rankstr);
	let ende = s == s2 && follows_in_rank(jlast, key, rankstr);
	if (anfang) console.log('match anfang:', key, jfirst);
	if (ende) console.log('match ende:', jlast, key);
	return anfang || ende; // follows_in_rank(rcard,rjfirst,rankstr) || follows_in_rank(rjlast, rcard, rankstr);
}
function post_luxury_or_journey_cards() {
	let [A, fen, uname] = [z.A, z.fen, z.uname];
	let luxury_selected = A.selected[0] == 0;
	console.log('carditems', A.carditems);
	let n = A.carditems.length;
	if (luxury_selected) {
		let cardstoreplace = A.carditems.map(x => x.key); //add n luxury cards to player hand
		arrReplace(fen.players[uname].hand, cardstoreplace, deck_deal(fen.deck_luxury, n));
	} else {
		//need to remove n cards from the otherr side of journey and give them to player hand
		let len = A.jlegal.length;
		let handcards = firstCond(A.carditems, x => A.jlegal[0] == x.key) ? arrFromIndex(A.jlegal, len - n) : A.jlegal.slice(0, n);
		console.log('handcards', handcards);
		arrExtend(fen.players[uname].hand, handcards);
		A.jlegal = arrMinus(A.jlegal, handcards);
		let cardstoremove = A.carditems.map(x => x.key);
		arrRemove(fen.players[uname].hand, cardstoremove);
	}
	//journey is replaced by jlegal
	let path = A.journeyitem.path;
	let parts = path.split('.');
	let owner = parts[1];
	console.log('path', path, 'parts', parts, 'owner', owner)
	fen.players[owner].journeys.splice(Number(parts[3]), 1, A.jlegal);
	set_journey_or_stall_stage(fen, z.options, z.phase); //set_nextplayer_after_journey();
	ari_history_list([`${uname} added to existing journey and takes ${luxury_selected ? 'luxury cards' : 'journey cards'}`], 'journey');
	turn_send_move_update();
}
function post_new_journey() {
	let [stage, A, fen, uname] = [z.stage, z.A, z.fen, z.uname];
	fen.players[uname].journeys.push(A.jlegal);
	arrReplace(fen.players[uname].hand, A.jlegal, deck_deal(fen.deck_luxury, A.jlegal.length));
	//console.log('...new hand', fen.players[uname].hand, '\n...new journey', A.jlegal);
	ari_history_list([`${uname} added journey`], 'journey');
	set_journey_or_stall_stage(fen, z.options, z.phase); //set_nextplayer_after_journey();
	turn_send_move_update();
}
function process_journey() {
	let [A, fen, uname] = [z.A, z.fen, z.uname];

	if (isEmpty(A.selected)) A.selected = [A.items.length-1];

	let sel = A.selected.map(x => A.items[x].key);
	//console.log('sel', sel); //.map(x=>x.key));

	//check if passed!
	if (sel.includes('pass')) {
		//console.log('hhhhhhhhhhhhhhhhhhhhhhhhh')
		if (nundef(fen.passed)) fen.passed = []; fen.passed.push(uname);
		set_journey_or_stall_stage(fen, z.options, z.phase); //set_nextplayer_after_journey();
		turn_send_move_update();
		return;
	}

	//check if selection legal!
	let [carditems, journeyitem, jlegal] = check_correct_journey(A, fen, uname);
	if (!carditems) return;

	delete fen.passed; //at this point, a player has selected successful journey so all players can enter journey round again!
	[A.carditems, A.journeyitem, A.jlegal] = [carditems, journeyitem, jlegal];
	z.stage = A.journeyitem ? 30 : 31;
	ari_pre_action();
}
//#endregion

//#region payment
function payment_complete() {
	let [fen, A, uname] = [z.fen, z.A, z.uname];
	A.payment = A.items[A.selected[0]];
	let nextstage = z.stage = ARI.stage[A.command];
	//console.log('........paying with:', A.payment);
	//console.log('need to go back to stage', ARI.stage[nextstage]);
	ari_pre_action();
}
function process_payment() {

	let [fen, A, uname] = [z.fen, z.A, z.uname];
	//pay with card or coin
	let item = A.payment;
	if (isdef(item.o)) a2_pay_with_card(item); else a2_pay_with_coin(uname);

	ari_history_list(get_pay_history(isdef(item.o) ? item.o.key : 'coin', uname), 'payment');

	A.payment_complete = true;
}
function get_pay_history(payment, uname) { return [`${uname} pays with ${payment}`]; }
function a2_pay_with_card(item) {
	let fen = z.fen;
	let source = lookup(fen, item.path.split('.'));
	elem_from_to_top(item.key, source, fen.deck_discard);
	ari_reorg_discard(fen);
}
function a2_pay_with_coin(uname) {
	let fen = z.fen;
	fen.players[uname].coins -= 1;
	//ari_redo_player_stats(otree, uname);
}
//#endregion

//#region pass
function post_pass() {
	let [fen, uname] = [z.fen, z.uname];
	let n = fen.total_pl_actions - fen.num_actions;
	ari_history_list([`${uname} passes after ${n} action${plural(n)}`], 'pass');
	fen.num_actions = 0;
	ari_next_action();
}
//#endregion

//#region pickup
function post_pickup() {
	let [A, fen, uname] = [z.A, z.fen, z.uname];
	//pickup A.selected_key
	//console.log('pickup', A.selected_key, A.items, A.selected);
	let item = A.items[A.selected[0]];
	//move elem item.a from mimi.stall to mimi.hand
	elem_from_to(item.key, fen.players[uname].stall, fen.players[uname].hand);
	//turn_send_move_update();
	ari_history_list([`${uname} picks up ${item.key}`], 'pickup');
	ari_next_action();
}
//#endregion

//#region select/toggle selection
function select_add_items(items, callback = null, label = null, min = 0, max = 100) {
	//have to select at least min and at most max items
	let A = z.A;
	select_clear_previous_level();
	A.level++;
	A.items = items;
	A.callback = callback;
	A.selected = [];
	A.minselected = min;
	A.maxselected = max;

	//foreach item mache eine ui und/oder activate current ui
	let show_submit_button = true; //min > 1 || min != max;
	let dParent = window[`dActions${A.level}`];
	//console.log('items', items);
	for (const item of items) {
		//mach einen button
		let a = item.a;
		let idButton = getUID('b'); item.idButton = idButton; A.di[idButton] = item; item.uids = [idButton];
		//let idButton = `b_${a}`; item.idButton = idButton; A.di[idButton] = item; item.uids = [idButton];
		let b = mButton(a, show_submit_button ? select_toggle : select_finalize, dParent, { fz: 13 }, ['donebutton', 'enabled'], idButton);

		//if a game object for this action exists, activate it
		//console.log('item.o', item.o)
		if (isdef(item.o)) {
			// { o: o, a: o.key, key: o.key, friendly: o.short, path: `${uname}.hand`, index: i };
			let go = item.o;
			//console.log('go', go)
			let d = iDiv(go);
			go.id = d.id = getUID();
			mClass(d, 'hoverScale');
			d.onclick = show_submit_button ? select_toggle : select_finalize;
			let idCard = d.id; item.idCard = idCard; A.di[idCard] = item; item.uids.push(idCard);

			set_hover_ui(b, go);

		}
	}


	clearElement(z.dSubmitOrRestart);
	if (show_submit_button) { mButton('submit', callback, z.dSubmitOrRestart, { fz: 13, bg: 'red', fg: 'silver' }, ['donebutton', 'enabled'], 'b_submit'); }
	mButton('restart action', onclick_reload, z.dSubmitOrRestart, { fz: 13, bg: 'red', fg: 'silver' }, ['donebutton', 'enabled'], 'b_restart_action');
	//#region submit restart buttons OLD!
	// if (show_submit_button) {
	// 	if (isdef(mBy('b_submit'))) { let b = mBy('b_submit'); mAppend(dParent, b); }
	// 	else mButton('submit', callback, dParent, { fz: 13, bg: 'red', fg: 'silver' }, ['donebutton', 'enabled'], 'b_submit');
	// }
	// if (isdef(mBy('b_restart_action'))) { let b = mBy('b_restart_action'); mAppend(dParent, b); }
	// else mButton('restart action', onclick_reload, dParent, { fz: 13, bg: 'red', fg: 'silver' }, ['donebutton', 'enabled'], 'b_restart_action');
	//#endregion

	if (items.length <= min && !is_ai_player()) {
		//all items are selected and directly goto post or pre
		//was ist wenn es 0 sind? sollte gehen eigentlich!
		uiActivated = false;
		for (let i = 0; i < items.length; i++) {
			A.selected.push(i);
			let a = items[i];
			mStyle(mBy(a.idButton), { bg: 'yellow' });
			if (isdef(a.idCard)) mClass(mBy(a.idCard), 'card_selected');
		}
		setTimeout(() => { if (callback) callback(); }, 500);
	} else if (is_ai_player()) {
		ai_move();
	} else if (DA.testing) {
		let movekey = z.uname + '_' + DA.test.iter;
		let selection_list = DA.auto_moves[movekey];
		if (nundef(selection_list)) selection_list = DA.auto_moves[DA.test.iter];
		if (isEmpty(selection_list)) { uiActivated = true; return; }

		uiActivated = false;
		let selection = selection_list.shift();

		let numbers = [];
		for (const el of selection) {
			if (el == 'last') {
				numbers.push(A.items.length - 1);
			} else if (isString(el)) {
				//this is a command!
				let commands = A.items.map(x => x.key);
				let idx = commands.indexOf(el);
				//console.log('idx of', el, 'is', idx)
				numbers.push(idx);
			} else numbers.push(el);
		}
		selection = numbers;
		//console.log('got selection for', movekey, selection, '\nrest', DA.auto_moves[movekey]);
		setTimeout(() => {
			A.selected = selection;
			if (selection.length == 1) A.selected_key = A.items[A.selected[0]].key;
			select_highlight();
			if (A.callback) A.callback();
		}, 1000);
	} else uiActivated = true;

}
function select_finalize(ev) {
	if (!uiActivated) { console.log('ui is deactivated!!!'); return; }
	let A = z.A;
	let id = evToId(ev);
	let a = A.di[id];
	A.selected = [a.index];
	A.selected_key = A.items[a.index].key;
	mStyle(mBy(a.idButton), { bg: 'yellow' });
	if (isdef(a.idCard)) mClass(mBy(a.idCard), 'card_selected');
	if (A.callback) A.callback();
}
function select_clear_previous_level() {
	//if there was a previous level, all its items
	//console.log('items', items);
	let A = z.A;
	if (!isEmpty(A.items)) {
		console.assert(A.level >= 1, 'have items but level is ' + A.level);
		//console.log('previous level items',A.items);
		//console.log('previous selected idx', A.selected);
		A.ll.push({ items: A.items, selected: A.selected });
		//let dParent = window[`dActions${A.level}`];
		//let children = arrChildren(dParent);
		for (const item of A.items) {

			//es kann sein dass er garkeine buttons hat, wenn das letzte level weniger options als min hatte!
			//console.log('item from last level', item);
			//console.log('idButton', item.idButton, 'idCard', item.idCard, 'ui', iDiv(item));
			//if (isdef(item.idButton)) {
			let bui = mBy(item.idButton);
			remove_hover_ui(bui);
			//console.log('bui', bui)
			item.idButton = bui.id = getUID();
			let uid = item.idCard;
			let cui = isdef(uid) ? mBy(uid) : null;
			//console.log('bui');
			if (A.selected.includes(item.index)) {
				bui.onclick = null;
				if (cui) { mClassRemove(cui, 'hoverScale'); cui.onclick = null; }
				mAppend(mBy(`dSelections${A.level}`), bui); //TODO: move this button to dSelections[A.level]
			} else {
				bui.style.opacity = 0;
				bui.remove();	//TODO: remove this button
				if (cui) { mClassRemove(cui, 'hoverScale'); cui.onclick = null; }
			}
		}
	}

}
function select_highlight() {
	let A = z.A;

	for (const i of A.selected) {
		let a = A.items[i];
		mStyle(mBy(a.idButton), { bg: 'yellow' });
		if (isdef(a.idCard)) mClass(mBy(a.idCard), 'card_selected');

	}
}
function select_toggle(ev) {
	if (!uiActivated) { console.log('ui is deactivated!!!'); return; }
	let A = z.A;
	let id = evToId(ev);
	let a = A.di[id];
	let unselectedcolor = 'silver'; // grey
	//console.log('clicked action ', a.key)
	//console.log('a',a)
	//console.log('HAAAAAAAAAAAAA',mBy(a.idButton))
	if (A.selected.includes(a.index)) {
		// console.log('remove action');
		removeInPlace(A.selected, a.index);
		mStyle(mBy(a.idButton), { bg: unselectedcolor });
		// console.log('idCard',a.idCard);
		if (isdef(a.idCard)) mClassRemove(mBy(a.idCard), 'card_selected');
	} else {
		// console.log('add action', a.index);
		if (A.maxselected == 1 && !isEmpty(A.selected)) {
			let itemselected = A.items[A.selected[0]];
			let idButton = itemselected.idButton;
			mStyle(mBy(idButton), { bg: unselectedcolor });
			if (isdef(itemselected.idCard)) mClassRemove(mBy(itemselected.idCard), 'card_selected');
			A.selected = [a.index];
		} else A.selected.push(a.index);
		mStyle(mBy(a.idButton), { bg: 'yellow' });
		if (isdef(a.idCard)) mClass(mBy(a.idCard), 'card_selected');
	}
}
function select_goto_post() {
	if (!uiActivated) { console.log('ui is deactivated!!!'); return; }
	ari_post_action();
}
function select_goto_pre() {
	if (!uiActivated) { console.log('ui is deactivated!!!'); return; }
	ari_pre_action();
}
//#endregion

//#region sell
function post_sell() {
	let [stage, A, fen, uname] = [z.stage, z.A, z.fen, z.uname];
	//there should exactly 2 selected cards
	//console.log('YEAHHHHHHHHHHHHHHHHHHHHH', 'sell!', A.selected);
	if (A.selected.length != 2) {
		output_error('select exactly 2 cards to sell!');
		return;
	}
	for (const i of A.selected) {
		let c = A.items[i].key;
		elem_from_to(c, fen.players[uname].stall, fen.deck_discard);
	}
	ari_reorg_discard();
	fen.players[uname].coins += 1;

	let [i1, i2] = A.selected.map(x => A.items[x].key)
	ari_history_list([`${uname} sells ${i1} and ${i2}`], 'sell');
	ari_next_action(fen, uname);

}


//#endregion

//#region show
function show_stage() {
	//for(const v of ['dTop','dOben','dActions']) console.log(v,z[v]);
	clearElement(z.dTop);
	//console.log('	hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh')
	let txt_numactions = z.num_actions > 0 ? `(${z.action_number}/${z.total_pl_actions})` : '';
	let txt_stage = isdef(z.A) && isdef(z.A.command) ? z.A.command : ARI.stage[z.stage];
	//console.log('command',z.A.command,'txt',txt_stage);
	mText(`${z.phase}: ${txt_stage} ${txt_numactions}`, z.dTop, { fz: 22, hmargin: 10 });
}
//#endregion

//#region tax
function post_tax() {
	let [fen, A, uname] = [z.fen, z.A, z.uname];
	let items = A.selected.map(x => A.items[x]);
	let n = fen.pl_tax[uname];
	if (items.length != n) {
		output_error(`please select exactly ${n} cards`);
		return;
	}

	for (const item of items) {
		elem_from_to_top(item.key, fen.players[uname].hand, fen.deck_discard);
	}
	ari_reorg_discard();
	ari_history_list([`${uname} pays tax: ${fen.pl_tax[uname]}`], 'tax');
	fen.pl_tax[uname] = 0;

	//market existiert in diesem stage nicht!!!
	//daher kann kein ari_next_action machen!!!
	let iturn = fen.plorder.indexOf(uname);
	let plnext = ari_get_tax_payer(fen, fen.pl_tax, iturn + 1);
	//console.log('====>get tax payer: plnext', plnext);
	if (plnext == null) {
		z.stage = set_journey_or_stall_stage(fen,z.options,'king');

		delete fen.pl_tax;

	} else {
		z.turn = [plnext];
	}

	turn_send_move_update(fen, uname);

}
function get_tax_history(tax) {
	let hlines = [];
	console.log('tax', tax);
	for (const uname in tax) {
		hlines.push(`player ${uname} paid ${tax[uname]} in tax`);
	}
	return hlines;
}

function ari_get_tax_payer(fen, pl_tax, ifrom = 0) {
	//console.log('pl_tax', pl_tax, 'ifrom', ifrom, getFunctionsNameThatCalledThisFunction());
	let iturn = ifrom;

	let uname = fen.plorder[iturn];
	if (nundef(uname)) return null;
	//console.log('uname',uname,'tax',pl_tax[uname]);
	while (pl_tax[uname] <= 0) {
		//fen.round.push(uname);
		iturn++;
		if (iturn >= fen.plorder.length) return null;
		//console.assert(iturn<otree.plorder.length,'DOCH NIEMAND IN TAX>!>!>!>!>');
		uname = fen.plorder[iturn];
		//console.log('uname',uname,'tax',pl_tax[uname]);
	}
	return uname;

}
function ari_get_first_tax_payer(fen, pl_tax) { return ari_get_tax_payer(fen, pl_tax, 0); }
function ari_tax_phase_needed(fen) {
	//if any player has more cards in hand than he is allowed to, need to have a tax stage else stage 3
	let pl_tax = {};
	let need_tax_phase = false;
	for (const uname of fen.plorder) {
		let hsz = fen.players[uname].hand.length;
		let nchateaus = fen.players[uname].buildings.chateau.length;
		let allowed = ARI.sz_hand + nchateaus;
		let diff = hsz - allowed;
		if (diff > 0) need_tax_phase = true;
		pl_tax[uname] = diff;
	}

	if (need_tax_phase) {
		fen.turn = [ari_get_first_tax_payer(fen, pl_tax)];
		fen.pl_tax = pl_tax;
		fen.stage = 2;
		return true;
	} else {
		fen.stage = 3;
		return false;
	}

}
//#endregion

//#region trade
function ai_pick_legal_trade() {
	//mach einfach alle pairs von legal trades
	let [A, fen, uname, items] = [z.A, z.fen, z.uname, z.A.items];

	let stall = fen.players[uname].stall;
	let firstPick = rChoose(items, 1, x => stall.includes(x.key));
	let secondPick = rChoose(items, 1, x => !stall.includes(x.key));

	//A.selected = [items.indexOf(firstPick), items.indexOf(secondPick)];
	return [firstPick, secondPick];

}
function post_trade() {
	let [stage, A, fen, uname] = [z.stage, z.A, z.fen, z.uname];

	if (A.selected.length != 2) {
		output_error('please, select exactly 2 cards!');
		return;
	}
	let i0 = A.items[A.selected[0]];
	let i1 = A.items[A.selected[1]];
	//console.log('trading!',i0,i1)
	if (i0.path == i1.path) {
		output_error('you cannot trade cards from the same group');
		return;
	} else {
		exchange_items_in_fen(fen, i0, i1); //replace cards in otree

		ari_history_list(get_trade_history(uname, i0, i1), 'trade');

		ari_next_action();
	}


}
function get_trade_history(uname, i0, i1) {
	//console.log('i0', i0, 'i1', i1);

	if (i1.path.includes(uname)) { let h = i0; i0 = i1; i1 = h; }

	return [`${uname} trades ${i0.key} (from own stall) for ${i1.key} (from ${i1.path == 'market' ? 'market' : stringBetween(i1.path, '.', '.')})`];
}
//#endregion

//#region visit
function process_visit() {
	process_payment();
	let [fen, A, uname] = [z.fen, z.A, z.uname];
	let item = A.items[A.selected[0]];
	let obuilding = lookup(fen, item.path.split('.'));
	let parts = item.path.split('.');
	let owner = parts[1];

	if (isdef(obuilding.schwein)) {

		z.stage = 46;
		A.building = item;
		A.obuilding = obuilding;
		A.buildingowner = owner;
		ari_pre_action();
		return;

	} else {

		//this building is revealed
		let cards = item.o.items;
		let key = cards[0].rank;
		let schweine = false;
		let schwein = null;
		for (const c of cards) {
			if (c.rank != key) { schweine = true; schwein = c.key; face_up(c); break; }
		}
		if (schweine) {
			if (fen.players[owner].coins > 0) {
				fen.players[owner].coins--;
				fen.players[uname].coins++;
			}
			let b = lookup(fen, item.path.split('.'));
			b.schwein = schwein;
		}

		ari_history_list([
			`${uname} visited ${ari_get_building_type(obuilding)} of ${owner} resulting in ${schweine ? 'schweine' : 'ok'} ${ari_get_building_type(obuilding)}`,
		], 'visit');

		ari_next_action(fen, uname);
	}


}
function post_visit() {

	let [fen, A, uname, building, obuilding, owner] = [z.fen, z.A, z.uname, z.A.building, z.A.obuilding, z.A.buildingowner];
	let res = A.selected[0] == 0; //confirm('destroy the building?'); //TODO das muss besser werden!!!!!!!
	if (!res) {
		if (fen.players[owner].coins > 0) {
			console.log('player', owner, 'pays to', uname, fen.players[owner].coins, fen.players[uname].coins);
			fen.players[owner].coins -= 1;
			fen.players[uname].coins += 1;
			console.log('after payment:', fen.players[owner].coins, fen.players[uname].coins)
		}
	} else {
		let list = obuilding.list;
		console.log('!!!!!!!!!!!!!building', obuilding, 'DESTROY!!!!!!!!!!!!!!!!', '\nlist', list);
		let correct_key = list[0];
		let rank = correct_key[0];
		//console.log('rank is', rank);
		//console.log('building destruction: ', correct_key);
		while (list.length > 0) {
			let ckey = list[0];
			//console.log('card rank is', ckey[0])
			if (ckey[0] != rank) {
				elem_from_to_top(ckey, list, fen.deck_discard);
				//console.log('discard',otree.deck_discard);
			} else {
				elem_from_to(ckey, list, fen.players[owner].hand);
			}
		}
		//console.log('building after removing cards', list, obuilding)
		if (isdef(obuilding.harvest)) {
			fen.deck_discard.unshift(obuilding.harvest);
		}
		ari_reorg_discard(fen);

		let blist = lookup(fen, stringBeforeLast(building.path, '.').split('.'));
		//console.log('===>remove',obuilding,'from',blist);
		removeInPlace(blist, obuilding);

		//console.log('player', owner, 'after building destruction', otree[owner])
	}
	ari_history_list([`${uname} visited ${ari_get_building_type(obuilding)} of ${owner} resulting in ${res ? 'destruction' : 'payoff'}`,], 'visit');

	ari_next_action(fen, uname);


}
//#endregion

//#region upgrade
function process_upgrade() {
	let [fen, A, uname] = [z.fen, z.A, z.uname];
	let n = A.selected.length;
	if (n > 2 || n == 2 && !has_farm(uname)) {
		output_error('too many cards selected!');
		return;
	} else if (n == 0) {
		output_error('please select hand or stall card(s) to upgrade!');
		return;
	}

	//ok also die cards wurden correct selected
	A.upgrade_cards = A.selected.map(x => A.items[x]);
	//next ist selection of building to upgrade
	z.stage = fen.stage = 102;
	ari_pre_action();
}
function post_upgrade() {
	let [fen, A, uname] = [z.fen, z.A, z.uname];
	A.building = A.items[A.selected[0]];
	let gb = A.building;
	//console.log('gb', gb)
	let b = lookup(fen, gb.path.split('.'));
	//console.log('real building:', b);
	let n = A.upgrade_cards.length;
	let type0 = gb.o.type;
	let len = gb.o.list.length + n;
	let type1 = len == 5 ? 'estate' : 'chateau';
	let target = lookup(fen, gb.path.split('.'));
	for (const o of A.upgrade_cards) {
		let source = lookup(fen, o.path.split('.'));
		//console.log('target',target,'elem',o.key,'source',source);
		elem_from_to(o.key, source, target.list);

		//also need to move the entire building to either estate or chateau
		//if this was a farm and 
	}
	//wie krieg ich das gesamte building?
	let bres = target; //lookup(otree,target);
	bres.harvest = null;
	//console.log('target',target);
	removeInPlace(fen.players[uname].buildings[type0], bres);
	fen.players[uname].buildings[type1].push(bres);

	process_payment();
	ari_history_list([`${uname} upgrades a ${type0}`], 'upgrade');

	ari_next_action(fen, uname);
}
//#endregion

