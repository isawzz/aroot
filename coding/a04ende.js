//#region functions U V W X Y Z
function ui_add_cards_to_card_container(cont, items, list) {
	if (nundef(list)) list = items.map(x => x.key);
	for (const item of items) {
		mAppend(cont, iDiv(item));
	}
}
function ui_add_cards_to_deck_container(cont, items, list) {
	if (nundef(list)) list = items.map(x => x.key);
	for (const item of items) {
		mAppend(cont, iDiv(item));
		mItemSplay(item, list, 4, Card.ovdeck);
		face_down(item);
	}
	return items[0];
}
function ui_add_cards_to_hand_container(cont, items, list) {
	if (nundef(list)) list = items.map(x => x.key);
	for (const item of items) {
		mAppend(cont, iDiv(item));
		mItemSplay(item, list, 2, Card.ovw);
	}
}
function ui_add_container_title(title, cont, items, show_if_empty) {
	if (isdef(title) && (!isEmpty(items) || show_if_empty)) {
		let st = get_containertitle_styles();
		let stmeasure = jsCopy(st); delete stmeasure.position;
		let elem = mText(title, cont, stmeasure);
		let sz = getSizeNeeded(elem);
		let offsetx = valf(st.left, 0);
		let cont_wmin = mGetStyle(cont, 'wmin');
		let my_min = sz.w + offsetx * 1.5;
		let wmin = !isNumber(cont_wmin) ? my_min : Math.max(valf(cont_wmin, 0), my_min);
		mStyle(cont, { wmin: wmin });
		mStyle(elem, st);
	}
}
function ui_from_deck_to_hand(el, deck, hand) {
	let topmost = deck.items.shift();
	console.assert(el == topmost, 'top deck elem is NOT correct!!!!')
	face_up(topmost);
	let dtop = iDiv(topmost);
	deck.list = deck.items.map(x => x.key);
	deck.topmost = deck.items[0];
	dtop.remove();
	dtop.style.position = 'static';
	hand.items.push(topmost);
	hand.list = hand.items.map(x => x.key);
	mAppend(hand.container, dtop);
	mContainerSplay(hand.container, 2, CWIDTH, CHEIGHT, hand.list.length, OVW);
	mItemSplay(topmost, hand.list, 2, OVW);
}
function ui_game_menu_item(g, g_tables = []) {
	function runderkreis(color, id) {
		return `<div id=${id} style='width:20px;height:20px;border-radius:50%;background-color:${color};color:white;position:absolute;left:0px;top:0px;'>` + '' + "</div>";
	}
	let [sym, bg, color, id] = [Syms[g.logo], g.color, null, getUID()];
	if (!isEmpty(g_tables)) {
		let t = g_tables[0];
		let have_another_move = t.player_status == 'joined';
		color = have_another_move ? 'green' : 'red';
		id = `rk_${t.id}`;
	}
	return `
		<div onclick="onclick_game_menu_item(event)" gamename=${g.id} style='cursor:pointer;border-radius:10px;margin:10px;padding:5px;padding-top:15px;width:120px;height:90px;display:inline-block;background:${bg};position:relative;'>
		${nundef(color) ? '' : runderkreis(color, id)}
		<span style='font-size:50px;font-family:${sym.family}'>${sym.text}</span><br>${g.friendly.toString()}</div>
		`;
}
function ui_game_stats(players) {
	let d = dTitle;
	clearElement(d);
	let d1 = mDiv(d, { display: 'flex', 'justify-content': 'center', 'align-items': 'space-evenly' });
	for (const plname in players) {
		let pl = players[plname];
		let d2 = mDiv(d1, { margin: 4, align: 'center' }, null, `<img src='${pl.imgPath}' style="display:block" class='img_person' width=50 height=50>${pl.score}`);
	}
}
function ui_get_all_commission_items(uplayer) {
	let items = [], i = 0;
	let comm = UI.players[uplayer].commissions;
	for (const o of comm.items) {
		let item = { o: o, a: o.key, key: o.key, friendly: o.short, path: comm.path, index: i };
		i++;
		items.push(item);
	}
	return items;
}
function ui_get_all_hidden_building_items(uplayer) {
	let items = [];
	for (const gb of UI.players[uplayer].buildinglist) {
		items = items.concat(ui_get_hidden_building_items(gb));
	}
	reindex_items(items);
	return items;
}
function ui_get_blackmailed_items() {
	let [fen, uplayer] = [Z.fen, Z.uplayer];
	let commands = ['accept', 'reject'];
	let rumors = fen.players[uplayer].rumors;
	let b = path2fen(fen, fen.blackmail.building_path);
	if (nundef(b.lead)) b.lead = b.list[0];
	if (isList(rumors) && firstCond(rumors, x => x[0] == b.lead[0])) {
		commands.push('defend');
	}
	return ui_get_string_items(commands);
}
function ui_get_bluff_inputs(strings) {
	let uplayer = Z.uplayer;
	let items = ui_get_string_items(uplayer, strings);
	console.log('items', items)
	return items;
}
function ui_get_build_items(uplayer, except) {
	let items = ui_get_hand_and_stall_items(uplayer);
	if (is_card(except)) items = items.filter(x => x.key != except.key);
	reindex_items(items);
	return items;
}
function ui_get_building_items(uplayer) {
	let gblist = UI.players[uplayer].buildinglist;
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
function ui_get_building_items_of_type(uplayer, types = ['farm', 'estate', 'chateau']) {
	let gblist = UI.players[uplayer].buildinglist.filter(x => types.includes(x.type));
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
function ui_get_buy_or_pass_items() {
	let items = [], i = 0;
	if (!isEmpty(UI.deck_discard.items)) items.push(ui_get_deck_item(UI.deck_discard));
	items = items.concat(ui_get_string_items(['pass']));
	reindex_items(items);
	return items;
}
function ui_get_card_items(cards) {
	let items = [], i = 0;
	for (const o of cards) {
		let item = { o: o, a: o.key, key: o.key, friendly: o.short, path: ``, index: i };
		i++;
		items.push(item);
	}
	return items;
}
function ui_get_church_items(uplayer) {
	let fen = Z.fen;
	let items = [], i = 0;
	let church = UI.church;
	for (const o of church.items) {
		let item = { o: o, a: o.key, key: o.key, friendly: o.short, path: church.path, index: i };
		i++;
		items.push(item);
	}
	let candidates = fen.candidates = arrMinus(fen.toBeSelected, uplayer);
	if (candidates.length > 1) {
		let player_items = ui_get_string_items(candidates);
		items = items.concat(player_items);
		reindex_items(items);
	}
	return items;
}
function ui_get_coin_amounts(uplayer) {
	let items = [];
	for (let i = 0; i <= Z.fen.players[uplayer].coins; i++) {
		let cmd = '' + i;
		let item = { o: null, a: cmd, key: cmd, friendly: cmd, path: null, index: i };
		items.push(item);
	}
	return items;
}
function ui_get_commands(uplayer) {
	let avail = ari_get_actions(uplayer);
	let items = [], i = 0;
	for (const cmd of avail) {
		let item = { o: null, a: cmd, key: cmd, friendly: cmd, path: null, index: i };
		i++;
		items.push(item);
	}
	return items;
}
function ui_get_commission_items(uplayer) {
	let items = [], i = 0;
	let comm = UI.players[uplayer].commissions;
	let stall = ui_get_stall_items(uplayer);
	for (const o of comm.items) {
		let rank = o.key[0];
		let similar = firstCond(stall, x => x.key[0] == rank);
		if (!similar) continue;
		let item = { o: o, a: o.key, key: o.key, friendly: o.short, path: comm.path, index: i, similar: stall.filter(x => x.key[0] == rank) };
		i++;
		items.push(item);
	}
	return items;
}
function ui_get_commission_new_items(uplayer) {
	let items = [], i = 0;
	let comm = UI.open_commissions;
	for (const o of comm.items) {
		let item = { o: o, a: o.key, key: o.key, friendly: o.short, path: comm.path, index: i };
		i++;
		items.push(item);
	}
	let topdeck = UI.deck_commission.get_topcard();
	items.push({ o: topdeck, a: topdeck.key, key: topdeck.key, friendly: topdeck.short, path: 'deck_commission', index: i });
	return items;
}
function ui_get_commission_stall_items() {
	let [A, fen, uplayer] = [Z.A, Z.fen, Z.uplayer];
	console.log('ui_get_commission_stall_items similar', A.commission.similar);
	let items = A.commission.similar;
	reindex_items(items);
	return items;
}
function ui_get_deck_item(uideck) {
	let topdeck = uideck.get_topcard();
	let item = { o: topdeck, a: topdeck.key, key: topdeck.key, friendly: topdeck.short, path: uideck.path, index: 0 };
	return item;
}
function ui_get_endgame(uplayer) { return ui_get_string_items(['end game', 'go on']); }
function ui_get_estates_chateaus_items(uplayer) { return ui_get_building_items_of_type(uplayer, ['estate', 'chateau']); }
function ui_get_exchange_items(uplayer) {
	let ihand = ui_get_hand_items(uplayer);
	let istall = ui_get_stall_items(uplayer);
	let irepair = ui_get_all_hidden_building_items(uplayer);
	irepair.map(x => face_up(x.o));
	let items = ihand.concat(istall).concat(irepair);
	reindex_items(items);
	return items;
}
function ui_get_farms_estates_items(uplayer) { return ui_get_building_items_of_type(uplayer, ['farm', 'estate']); }
function ui_get_ferro_items() {
	let [plorder, stage, A, fen, uplayer, pl] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer, Z.fen.players[Z.uplayer]];
	let items = ui_get_hand_items(uplayer);
	for (const plname of plorder) {
		let jlist = UI.players[plname].journeys;
		for (const jitem of jlist) {
			for (const o of jitem.items) {
				if (!is_joker(o)) { continue; }
				let item = { o: o, a: o.key, key: o.key, friendly: o.short, path: jitem.path, index: 0 };
				items.push(item);
			}
		}
	}
	for (const plname of plorder) {
		let jlist = UI.players[plname].journeys;
		for (const jitem of jlist) {
			let o = jitem.items[0];
			let item = { o: o, a: o.key, key: o.key, friendly: o.short, path: jitem.path, index: 0 };
			items.push(item);
		}
	}
	let cmds = ui_get_submit_items(['discard', 'auflegen', 'jolly', 'anlegen']);
	items = items.concat(cmds);
	reindex_items(items);
	return items;
}
function ui_get_hand_and_journey_items(uplayer) {
	let items = ui_get_hand_items(uplayer);
	let matching = [];
	for (const plname of Z.plorder) {
		let jitems = ui_get_journey_items(plname);
		for (const j of jitems) {
			for (const card of items) {
				if (matches_on_either_end(card, j)) { matching.push(j); break; }
			}
		}
	}
	items = items.concat(matching);
	reindex_items(items);
	return items;
}
function ui_get_hand_and_stall_items(uplayer) {
	let items = ui_get_hand_items(uplayer);
	items = items.concat(ui_get_stall_items(uplayer));
	reindex_items(items);
	return items;
}
function ui_get_hand_items(uplayer) {
	let items = [], i = 0;
	let hand = UI.players[uplayer].hand;
	for (const o of hand.items) {
		o.index = i;
		let item = { o: o, a: o.key, key: o.key, friendly: o.short, path: hand.path, index: i };
		i++;
		items.push(item);
	}
	return items;
}
function ui_get_hand_items_minus(uplayer, cardlist) {
	if (!isList(cardlist)) cardlist = [cardlist];
	let items = [], i = 0;
	let hand = UI.players[uplayer].hand;
	for (const o of hand.items) {
		if (cardlist.includes(o)) continue;
		let item = { o: o, a: o.key, key: o.key, friendly: o.short, path: hand.path, index: i };
		i++;
		items.push(item);
	}
	return items;
}
function ui_get_harvest_items(uplayer) {
	let items = []; let i = 0;
	for (const gb of UI.players[uplayer].buildinglist) {
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
function ui_get_hidden_building_items(uibuilding) {
	let items = [];
	for (let i = 1; i < uibuilding.items.length; i++) {
		let o = uibuilding.items[i];
		o.index = i;
		let item = { o: o, a: o.key, key: o.key, friendly: o.short, path: uibuilding.path, index: i - 1 };
		items.push(item);
	}
	return items;
}
function ui_get_journey_items(plname) {
	let gblist = UI.players[plname].journeys;
	let items = [], i = 0;
	for (const o of gblist) {
		let name = `${plname}_j${i}`;
		o.div = o.container;
		let item = { o: o, a: name, key: o.list[0], friendly: name, path: o.path, index: i, ui: o.container };
		i++;
		items.push(item);
	}
	return items;
}
function ui_get_market_items() {
	let items = [], i = 0;
	for (const o of UI.market.items) {
		o.index = i;
		let item = { o: o, a: o.key, key: o.key, friendly: o.short, path: `market`, index: i };
		i++;
		items.push(item);
	}
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
function ui_get_other_buildings(uplayer) {
	let items = [];
	for (const plname of Z.plorder) {
		if (plname == uplayer) continue;
		items = items.concat(ui_get_buildings(UI.players[plname].buildinglist));
	}
	reindex_items(items);
	return items;
}
function ui_get_other_buildings_and_rumors(uplayer) {
	let items = ui_get_other_buildings(uplayer);
	items = items.concat(ui_get_rumors_items(uplayer));
	reindex_items(items);
	return items;
}
function ui_get_other_buildings_with_rumors(uplayer) {
	let items = [];
	for (const plname of Z.plorder) {
		if (plname == uplayer) continue;
		items = items.concat(ui_get_buildings(UI.players[plname].buildinglist.filter(x => !isEmpty(x.rumors))));
	}
	reindex_items(items);
	return items;
}
function ui_get_payment_items(pay_letter) {
	let [fen, A, uplayer] = [Z.fen, Z.A, Z.uplayer];
	let items = ui_get_hand_and_stall_items(uplayer);
	let n = items.length;
	items = items.filter(x => x.key[0] == pay_letter);
	if (n == 4 && A.command == 'build') items = [];
	if (n == 1 && A.command == 'upgrade') items = [];
	if (fen.players[uplayer].coins > 0 && fen.phase[0].toUpperCase() == pay_letter) {
		items.push({ o: null, a: 'coin', key: 'coin', friendly: 'coin', path: null });
	}
	let i = 0; items.map(x => { x.index = i; i++; });
	return items;
}
function ui_get_rumors_and_players_items(uplayer) {
	let items = [], i = 0;
	let comm = UI.players[uplayer].rumors;
	let [data, pl] = [Z.uplayer_data, Z.pl];
	assertion(isdef(data), 'no data for player ' + uplayer);
	if (!isDict(data.state)) data.state = { remaining: jsCopy(pl.rumors), receivers: [], di: {} };
	let rem = data.state.remaining;
	for (const k of rem) {
		let o = firstCond(comm.items, x => x.key == k);
		let item = { o: o, a: o.key, key: o.key, friendly: o.short, path: comm.path, index: i };
		i++;
		items.push(item);
	}
	let players = [];
	let receivers = data.state.receivers;
	for (const plname in UI.players) {
		if (plname == uplayer || receivers.includes(plname)) continue;
		players.push(plname);
	}
	items = items.concat(ui_get_string_items(players));
	reindex_items(items);
	return items;
}
function ui_get_rumors_items(uplayer) {
	let items = [], i = 0;
	let rum = UI.players[uplayer].rumors;
	for (const o of rum.items) {
		let item = { o: o, a: o.key, key: o.key, friendly: o.short, path: rum.path, index: i };
		i++;
		items.push(item);
	}
	return items;
}
function ui_get_schweine_candidates(uibuilding) {
	let items = ui_get_hidden_building_items(uibuilding);
	items = items.filter(x => x.o.key[0] != uibuilding.keycard.key[0]);
	reindex_items(items);
	return items;
}
function ui_get_stall_items(uplayer) {
	let items = [], i = 0;
	let stall = UI.players[uplayer].stall;
	for (const o of stall.items) {
		o.index = i;
		let item = { o: o, a: o.key, key: o.key, friendly: o.short, path: stall.path, index: i };
		i++;
		items.push(item);
	}
	return items;
}
function ui_get_string_items(commands) {
	let items = [], i = 0;
	for (const cmd of commands) {
		let item = { o: null, a: cmd, key: cmd, friendly: cmd, path: null, index: i };
		i++;
		items.push(item);
	}
	return items;
}
function ui_get_submit_items(commands) {
	let items = [], i = 0;
	for (const cmd of commands) {
		let item = { o: null, a: cmd, key: cmd, friendly: cmd, path: null, index: i, submit_on_click: true, itemtype: 'submit' };
		i++;
		items.push(item);
	}
	return items;
}
function ui_get_top_rumors() {
	let items = [], i = 0;
	for (const o of UI.rumor_top.items) {
		let item = { o: o, a: o.key, key: o.key, friendly: o.short, path: `rumor_top`, index: i };
		i++;
		items.push(item);
	}
	return items;
}
function ui_get_trade_items(uplayer) {
	let items = ui_get_market_items(uplayer);
	items = items.concat(ui_get_stall_items(uplayer));
	for (const plname of Z.fen.plorder) {
		if (plname != uplayer) items = items.concat(ui_get_stall_items(plname));
	}
	reindex_items(items);
	return items;
}
function ui_ground_zero() {
	STOPAUS = true;
	uiActivated = aiActivated = false;
	clearTimeouts();
	if (isdef(G) && isdef(G.clear)) G.clear();
	if (isdef(GC) && isdef(GC.clear)) GC.clear();
	TOMan.clear();
	clearMarkers();
	resetUIDs();
	Items = {};
}
function ui_make_card_container(n, dParent, styles = { bg: 'random', padding: 10 }) {
	let id = getUID('u');
	let d = mDiv(dParent, styles, id);
	return d;
}
function ui_make_container(dParent, styles = { bg: 'random', padding: 10 }) {
	let id = getUID('u');
	let d = mDiv(dParent, styles, id);
	return d;
}
function ui_make_deck_container(list, dParent, styles = { bg: 'random', padding: 10 }, get_card_func) {
	let id = getUID('u');
	let d = mDiv(dParent, styles, id);
	if (isEmpty(list)) return d;
	let c = get_card_func(list[0]);
	mContainerSplay(d, 4, c.w, c.h, n, 0);
	return d;
}
function ui_make_hand_container(items, dParent, styles = { bg: 'random', padding: 10 }) {
	let id = getUID('u');
	let d = mDiv(dParent, styles, id);
	if (!isEmpty(items)) {
		let card = items[0];
		mContainerSplay(d, 2, card.w, card.h, items.length, card.ov * card.w);
	}
	return d;
}
function ui_make_player(otree, uname, dParent) {
	let id = getUID('u');
	let bg = otree[uname].color;
	let styles = { bg: bg, fg: 'contrast', w: '100%' };
	d = mDiv(dParent, styles, id, uname);
	return d;
}
function ui_make_random_deck(n = 10) {
	let list = choose(get_keys(Aristocards), n);
	let cont = ui_make_deck_container(n, dTable, { bg: 'random', padding: 4 });
	let items = list.map(x => ari_get_card(x));
	let topmost = ui_add_cards_to_deck_container(cont, items, list);
	return {
		list: list,
		container: cont,
		items: items,
		topmost: topmost,
	};
}
function ui_make_random_hand(n = 1) {
	let list = choose(get_keys(Aristocards), n);
	let cont = ui_make_hand_container(n, dTable, { bg: 'random', padding: 4 });
	let items = list.map(x => ari_get_card(x));
	ui_add_cards_to_hand_container(cont, items, list);
	return {
		list: list,
		container: cont,
		items: items,
	};
}
function ui_make_random_market(n = 1) {
	let cont = ui_make_card_container(n, dTable, { bg: 'random', padding: 4, display: 'flex' });
	let list = choose(get_keys(Aristocards), n);
	let items = list.map(x => ari_get_card(x));
	if (n > 0) ui_add_cards_to_card_container(cont, items, list);
	return {
		list: list,
		container: cont,
		items: items,
	};
}
function ui_make_table() {
	let d = mBy('inner_left_panel'); clearElement(d);
	let dou = mDiv100(d, { display: 'flex' });
	dTable = mDiv(dou, { flex: 5, display: 'flex' });
	return dTable;
}
function ui_player_info(dParent, outerStyles = { dir: 'column' }, innerStyles = {}) {
	let fen = Z.fen;
	if (nundef(outerStyles.display)) outerStyles.display = 'flex';
	mStyle(dParent, outerStyles);
	let items = {};
	let styles = jsCopy(innerStyles); addKeys({ rounding: 10, bg: '#00000050', margin: 4, padding: 4, patop: 12, box: true, 'border-style': 'solid', 'border-width': 6 }, styles);
	let order = get_present_order();
	for (const plname of order) {
		let pl = fen.players[plname];
		let uname = pl.name;
		let imgPath = `../base/assets/users/${uname}.jpg`;
		styles['border-color'] = get_user_color(uname);
		let item = mDivItem(dParent, styles, name2id(uname));
		let d = iDiv(item);
		let picstyle = { w: 50, h: 50, box: true };
		let ucolor = get_user_color(uname);
		if (pl.playmode == 'bot') {
			copyKeys({ rounding: 0, border: `double 6px ${ucolor}` }, picstyle);
		} else {
			copyKeys({ rounding: '50%', border: `solid 2px white` }, picstyle);
		}
		let img = mImage(imgPath, d, picstyle, 'img_person');
		items[uname] = item;
	}
	if (DA.SIMSIM || is_advanced_user()) activate_playerstats(items)
	return items;
}
function ui_present_stats(otree) {
	let players = otree.player_names;
	let items = ui_player_info(players.map(x => otree[x]));
	for (const uname of players) {
		let pl = otree[uname];
		let totals = inno_calc_visible_syms(pl.board, pl.splays);
		pl.totals = totals;
		let item = items[uname];
		let d = iDiv(item); mCenterFlex(d); mLinebreak(d);
		for (const r in totals) {
			inno_stat_sym(r, totals[r], d, 20);
		}
	}
	return items;
}
function ui_present_table(r, dParent) {
	let g = Session;
	let uitree = r.uiNodes = {};
	if (g.cur_game == 'gPreinno') inno_create_ui_tree(R.root, dParent, r);
	else if (g.cur_game == 'gAristo') ari_create_ui_tree(R.root, dParent, r);
	return uitree;
}
function ui_table_actions_stats() {
	let d = mBy('inner_left_panel'); clearElement(d);
	let dou = mDiv100(d, { display: 'flex' });
	dTable = mDiv(dou, { flex: 5, display: 'flex', overflow: 'auto', position: 'relative' });
	mCenterFlex(dTable, false);
	dTable.animate([{ opacity: 0, transform: 'translateY(50px)' }, { opacity: 1, transform: 'translateY(0px)' },], { fill: 'both', duration: 1000, easing: 'ease' });
	dTop = mDiv(dTable, { bg: '#00000040', fg: 'white', w: '100%' }, 'dOben', 'hallo');
	dTop.innerHTML = '';
	dOben = mDiv(dTable, { bg: '#ffffff40', w: '100%' }, 'dOben', 'hallo');
	dOben.innerHTML = '';
	dActions = mDiv(dOben, { w: '100%' });
	for (let i = 0; i <= 5; i++) {
		window[`dActions${i}`] = mDiv(dActions, { w: '100%' });
	}
	dError = mDiv(dOben, { w: '100%', bg: 'red', fg: 'yellow' });
	dPlayerStats = dRechts = mDiv(dou, { flex: 1 }, 'dRechts', 'hallo');
}
function ui_type_building(b, dParent, styles = {}, path = 'farm', title = '', get_card_func = ari_get_card, separate_lead = false, ishidden = false) {
	let cont = ui_make_container(dParent, get_container_styles(styles));
	let cardcont = mDiv(cont);
	let list = b.list;
	let d = mDiv(dParent);
	let items = list.map(x => get_card_func(x));
	reindex_items(items);
	let d_harvest = null;
	if (isdef(b.h)) {
		let keycard = items[0];
		let d = iDiv(keycard);
		mStyle(d, { position: 'relative' });
		d_harvest = mDiv(d, { position: 'absolute', w: 20, h: 20, bg: 'orange', opacity: .5, fg: 'black', top: '45%', left: -10, rounding: '50%', align: 'center' }, null, 'H');
	}
	let d_rumors = null, rumorItems = [];
	if (!isEmpty(b.rumors)) {
		let d = cont;
		mStyle(d, { position: 'relative' });
		d_rumors = mDiv(d, { display: 'flex', gap: 2, position: 'absolute', h: 30, bottom: 0, right: 0 });
		for (const rumor of b.rumors) {
			let dr = mDiv(d_rumors, { h: 24, w: 16, vmargin: 3, align: 'center', bg: 'dimgray', rounding: 2 }, null, 'R');
			rumorItems.push({ div: dr, key: rumor });
		}
	}
	let card = isEmpty(items) ? { w: 1, h: 100, ov: 0 } : items[0];
	let [ov, splay] = separate_lead ? [card.ov * 1.5, 5] : [card.ov, 2];
	mContainerSplay(cardcont, 5, card.w, card.h, items.length, card.ov * 1.5 * card.w);
	ui_add_cards_to_hand_container(cardcont, items, list);
	ui_add_container_title(title, cont, items);
	let uischweine = [];
	for (let i = 1; i < items.length; i++) {
		let item = items[i];
		if (!b.schweine.includes(i)) face_down(item); else add_ui_schwein(item, uischweine);
	}
	return {
		ctype: 'hand',
		list: list,
		path: path,
		container: cont,
		cardcontainer: cardcont,
		items: items,
		schweine: uischweine,
		harvest: d_harvest,
		rumors: rumorItems,
		keycard: items[0],
	};
}
function ui_type_church(list, dParent, styles = {}, path = 'trick', title = '', get_card_func = ari_get_card, show_if_empty = false) {
	let cont = ui_make_container(dParent, get_container_styles(styles));
	let cardcont = mDiv(cont, { display: 'flex' });
	let items = [];
	let n = Z.plorder.length;
	let inc = 90;
	let rotation = n % 2 ? 0 : 90;
	for (const ckey of list) {
		let d = mDiv(cardcont, { origin: 'center', transform: `rotate( ${rotation}deg )`, position: 'absolute', left: 8 });
		let c = get_card_func(ckey);
		if (ckey != arrLast(list)) face_down(c);
		mAppend(d, iDiv(c));
		remove_card_shadow(c);
		let item = { card: c, div: d };
		items.push(item);
		rotation += inc;
	}
	ui_add_container_title(title, cont, items, show_if_empty);
	return {
		list: list,
		path: path,
		container: cont,
		cardcontainer: cardcont,
		items: items,
	}
}
function ui_type_deck(list, dParent, styles = {}, path = 'deck', title = 'deck', get_card_func = ari_get_card, show_if_empty = false) {
	let cont = ui_make_container(dParent, get_container_styles(styles));
	let cardcont = mDiv(cont);
	let items = [];
	ensure_ui(list, cardcont, items, get_card_func);
	ui_add_container_title(title, cont, items, show_if_empty);
	function get_topcard() { return isEmpty(list) ? null : items[0]; }
	function get_bottomcard() { return isEmpty(list) ? null : arrLast(items); }
	function ensure_ui(list, cardcont, items, get_card_func) {
		clearElement(cardcont); arrClear(items); if (isEmpty(list)) return;
		let n = Math.min(2, list.length); let ct = get_card_func(list[0]); items.push(ct); if (n > 1) { let cb = get_card_func(arrLast(list)); items.push(cb); }
		mStyle(cardcont, { position: 'relative', wmin: ct.w + 8, hmin: ct.h });
		for (let i = items.length - 1; i >= 0; i--) { let x = items[i]; face_down(x); mAppend(cardcont, iDiv(x)); mStyle(iDiv(x), { position: 'absolute', top: 0, left: 0 }) }
		mText(list.length, iDiv(ct), { position: 'absolute', left: list.length >= 100 ? '10%' : '25%', top: 10, fz: ct.h / 3 });
	}
	return {
		ctype: 'deck',
		container: cont,
		cardcontainer: cardcont,
		items: items,
		list: list,
		title: title,
		path: path,
		func: get_card_func,
		get_topcard: get_topcard,
		get_bottomcard: get_bottomcard,
		get_card_func: get_card_func,
		renew: ensure_ui,
	};
}
function ui_type_hand(list, dParent, styles = {}, path = 'hand', title = 'hand', get_card_func = ari_get_card, show_if_empty = false) {
	let cont = ui_make_container(dParent, get_container_styles(styles));
	let items = list.map(x => get_card_func(x));
	let cardcont = mDiv(cont);
	let card = isEmpty(items) ? { w: 1, h: Config.ui.card.h, ov: 0 } : items[0];
	let splay = 2;
	mContainerSplay(cardcont, splay, card.w, card.h, items.length, card.ov * card.w);
	ui_add_cards_to_hand_container(cardcont, items, list);
	ui_add_container_title(title, cont, items, show_if_empty);
	return {
		ctype: 'hand',
		list: list,
		path: path,
		container: cont,
		cardcontainer: cardcont,
		splay: splay,
		items: items,
	};
}
function ui_type_item(dParent, item, styles = {}, handler = null, show_key = null) {
	addKeys({ align: 'center', overflow: 'hidden', cursor: 'pointer', rounding: 10, margin: 10, padding: 5, w: 120, wmin: 90, display: 'inline-block', bg: 'random', fg: 'contrast' }, styles);
	let d = mDiv(dParent, styles);
	if (!isEmptyOrWhiteSpace(item.text)) mSpan(d, { family: item.family, fz: 50 }, item.text);
	if (show_key) {
		mSpan(d, { family: 'opensans' }, '<br>' + show_key);
	}
	if (isdef(handler)) d.onclick = handler;
	return d;
}
function ui_type_item_line(dParent, item, styles = {}, handler = null, props = []) {
	let d = mDiv(dParent, styles, `d_${item.key}`); mFlex(d);
	for (const p of props) {
		let family = p == 'text' ? item.family : 'arial';
		let fz = p == 'text' ? 40 : 20;
		mDiv(d, { family: family, fz: fz, bg: styles.bg, fg: styles.fg }, null, item[p]);
	}
	if (isdef(handler)) { d.onclick = handler; d.setAttribute('item', JSON.stringify(item)); }
	return d;
}
function ui_type_lead_hand(list, dParent, styles = {}, path = 'hand', title = 'hand', get_card_func = ari_get_card, show_if_empty = false) {
	let hcard = isdef(styles.h) ? styles.h - 30 : Config.ui.card.h;
	addKeys(get_container_styles(styles), styles);
	let cont = ui_make_container(dParent, styles);
	let items = list.map(x => get_card_func(x, hcard));
	let cardcont = mDiv(cont);
	let card = isEmpty(items) ? { w: 1, h: hcard, ov: 0 } : items[0];
	let splay = 5;
	mContainerSplay(cardcont, splay, card.w, card.h, items.length, card.ov * card.w);
	ui_add_cards_to_hand_container(cardcont, items, list);
	ui_add_container_title(title, cont, items, show_if_empty);
	return {
		ctype: 'hand',
		list: list,
		path: path,
		container: cont,
		cardcontainer: cardcont,
		splay: splay,
		items: items,
	};
}
function ui_type_market(list, dParent, styles = {}, path = 'market', title = 'market', get_card_func = ari_get_card, show_if_empty = false) {
	let cont = ui_make_container(dParent, get_container_styles(styles));
	let cardcont = mDiv(cont, { display: 'flex', gap: 2 });
	let items = list.map(x => get_card_func(x));
	items.map(x => mAppend(cardcont, iDiv(x)));
	ui_add_container_title(title, cont, items, show_if_empty);
	return {
		ctype: 'market',
		list: list,
		path: path,
		container: cont,
		cardcontainer: cardcont,
		items: items,
	};
}
function ui_type_rank_count(list, dParent, styles, path, title, get_card_func, show_if_empty = false) {
	let cont = ui_make_container(dParent, get_container_styles(styles));
	let cardcont = mDiv(cont, { display: 'flex' });
	let items = [];
	for (const o of list) {
		let d = mDiv(cardcont, { display: 'flex', dir: 'c', padding: 1, fz: 12, align: 'center', position: 'relative' });
		let c = get_card_func(o.key);
		mAppend(d, iDiv(c));
		remove_card_shadow(c);
		d.innerHTML += `<span style="font-weight:bold">${o.count}</span>`;
		let item = { card: c, count: o.count, div: d };
		items.push(item);
	}
	ui_add_container_title(title, cont, items, show_if_empty);
	return {
		list: list,
		path: path,
		container: cont,
		cardcontainer: cardcont,
		items: items,
	}
}
function ui_type_sym_text_line(dParent, item, styles = {}, handler = null) {
	let d = mDiv(dParent, styles, `d_${item.key}`); mFlex(d);
	let sym = valf(item.sym, Syms[item.key]);
	mDiv(d, { family: sym.family, fz: 40 }, null, sym.text);
	mDiv(d, { family: 'opensans', fz: 20 }, null, item.text);
	if (isdef(handler)) { d.onclick = handler; d.setAttribute('item', JSON.stringify(item)); }
	return d;
}
function ui_type_tile(ga, d, styles, classes) {
	let item = {};
	copyKeys(ga, item);
	let [sym, bg, id] = [Syms[ga.logo], ga.color, getUID()];
	item.id = id; item.isOpen = true;
	function open() {
		let item = Items[id];
		if (item.isOpen) return; item.isOpen = true;
		let d1 = iDiv(item); iClear(d1);
		let d2 = mDiv(d1, { position: 'absolute', top: 2, left: 2, display: 'flex', gap: 2 });
		let sz = 20;
		mDiv(d2, { fz: sz, family: sym.family, 'line-height': sz }, null, sym.text);
		mDiv(d2, { fz: sz - 5, 'line-height': sz }, null, item.friendly);
		console.log('item.name', item.name)
		let f = window[item.name + '_open']; if (isdef(f)) f(item);
	}
	function close(trigger = true) {
		let item = Items[id];
		if (!item.isOpen) return; item.isOpen = false;
		let d1 = iDiv(item); iClear(d1);
		mDiv(d1, { fz: 50, family: sym.family, 'line-height': 55 }, null, sym.text);
		mLinebreak(d1, 4);
		mDiv(d1, { fz: 18, align: 'center' }, null, item.friendly);
		if (!trigger) return;
		let f = window[item.name + '_close']; if (isdef(f)) f(item);
	}
	function toggle(ev) {
		evNoBubble(ev);
		let item = Items[id];
		if (item.isOpen) close(); else open();
	}
	let d1 = mDiv(d, { cursor: 'pointer', 'user-select': 'none', rounding: 10, margin: 10, vpadding: 15, hmin: 90, wmin: 140, bg: bg, position: 'relative' }, id, null, 'hop1');
	d1.setAttribute('name', ga.name);
	mCenterFlex(d1);
	iReg(item, { div: d1 });
	d1.onclick = toggle;
	close(false);
	return {
		item: item,
		open: open,
		close: close,
		toggle: toggle,
	}
}
function uid() {
	UID += 1;
	return 'a' + UID;
}
function uidHelpers() {
	UIDHelpers += 1;
	return 'id' + UIDHelpers;
}
function uiGetContact(row, msgs = {}) {
	let image = get_image_path(row);
	let mydata = `
						<div class='contact' style='position:relative;text-align:center;margin-bottom:18px;' username='${row.name}' onclick='start_chat(event)'>
								<img src='${image}' draggable='true' ondragstart='drag(event)' class='img_person sz100' style='margin:0;'/>
								<br>${row.name}`;
	if (isdef(msgs[row.username])) {
		mydata += `<div style='width:20px;height:20px;border-radius:50%;background-color:orange;color:white;position:absolute;left:0px;top:0px;'>` + msgs[row.username] + "</div>";
	}
	mydata += "</div>";
	return mydata;
}
function uiGetContacts(myusers, msgs) {
	mydata = '';
	for (const r of myusers) {
		row = r;
		mydata += uiGetContact(row, msgs);
	}
	return mydata;
}
function uiGetContactStylesAndStart() {
	let mydata = `
		<style>
				@keyframes appear{
						0%{opacity:0;transform: translateY(50px)}
						100%{opacity:1;transform: translateY(0px)}
					}
					.contact{
							cursor:pointer;
							transition: all .5s cubic-bezier(0.68, -2, 0.265, 1.55);
					}
					.contact:hover{
							transform: scale(1.1);
					}
		</style>
		<div style="text-align: center; animation: appear 1s ease both">
		`;
	return mydata;
}
function uiGetGame(gi, tables = []) {
	let sym = Syms[gi.logo];
	let bg = getColorDictColor(gi.color);
	let gname = gi.id;
	let uname = Session.cur_user;
	let color = null, id = getUID();
	if (!isEmpty(tables)) {
		let t = tables[0];
		let table_status = t.status;
		let my_status = t.player_status;
		let have_another_move = my_status == 'joined' || my_status == 'lamov';
		color = have_another_move ? 'green'
			: t.player_status == 'join' ? 'orange'
				: t.host == uname && t.status == 'ready' ? 'yellow'
					: table_status == 'show' || t.status == 'seen' ? 'blue'
						: t.status == 'ending' ? 'red' : 'black';
		id = `rk_${t.id}`;
	}
	return `
		<div onclick="onclick_game_in_games_menu(event)" gamename=${gi.id} style='cursor:pointer;border-radius:10px;margin:10px;padding:5px;padding-top:15px;width:120px;height:90px;display:inline-block;background:${bg};position:relative;'>
		${nundef(color) ? '' : runderkreis(color, id)}
		<span style='font-size:50px;font-family:${sym.family}'>${sym.text}</span><br>${gi.friendly}</div>
		`;
}
function uiGetGames(mygames, tables) {
	mydata = '';
	for (const r of mygames) {
		row = r;
		mydata += uiGetGame(row, tables[r.id]);
	}
	return mydata;
}
function uiGetGamesStylesAndStart() {
	let mydata = `
		<style>
					.contact{
							cursor:pointer;
							transition: all .5s cubic-bezier(0.68, -2, 0.265, 1.55);
					}
					.contact:hover{
							transform: scale(1.1);
					}
		</style>
		<div id='game_menu' style="text-align: center; animation: appear 1s ease both">
		`;
	return mydata;
}
function uiGetLoginNew(row, msgs = {}) {
	let image = get_image_path(row);
	let mydata = `
						<div class='contact' style='position:relative;text-align:center;margin-bottom:18px;' username='${row.name}' 
								onclick='onclick_user_login_new(event)'>
								<img src='${image}' draggable='true' ondragstart='drag(event)' class='img_person sz100' style='margin:0;'/>
								<br>${row.name}`;
	if (isdef(msgs[row.username])) {
		mydata += `<div style='width:20px;height:20px;border-radius:50%;background-color:orange;color:white;position:absolute;left:0px;top:0px;'>` + msgs[row.username] + "</div>";
	}
	mydata += "</div>";
	return mydata;
}
function uiGetLoginNewList(myusers, msgs) {
	mydata = '';
	for (const r of myusers) {
		row = r;
		mydata += uiGetLoginNew(row, msgs);
	}
	return mydata;
}
function uiGetLoginNewStylesAndStart() {
	let mydata = `
		<style>
				@keyframes appear{
						0%{opacity:0;transform: translateY(50px)}
						100%{opacity:1;transform: translateY(0px)}
					}
					.contact{
							cursor:pointer;
							transition: all .5s cubic-bezier(0.68, -2, 0.265, 1.55);
					}
					.contact:hover{
							transform: scale(1.1);
					}
		</style>
		<div style="text-align: center; animation: appear 1s ease both">
		`;
	return mydata;
}
function uiNodesToUiTree(R) {
	let uiTree = {};
	for (const k in R.uiNodes) {
		let n = R.uiNodes[k];
		uiTree[k] = jsCopyMinus(n, 'act', 'ui', 'defParams', 'params');
	}
	return uiTree;
}
function unCamel(s) { return separateAtCapitals(s); }
function unCamelCase(s) { return separateAtCapitals(s); }
function uncheckAvailable(i) {
	id = getidAvailable(i); document.getElementById(id).checked = false;
}
function uncheckPlayer(i) {
	id = getidNum(i); document.getElementById(id).checked = false;
}
function uncollapseAll() {
	let coll = document.getElementsByClassName("collapsible");
	for (let i = 0; i < coll.length; i++) {
		let elem = coll[i];
		if (!isVisible(getLinkContainerId(elem.id))) fireClick(elem);
	}
}
function unfillChar(inp) { unfillCharInput(inp); }
function unfillCharInput(inp) {
	let d = iDiv(inp);
	d.innerHTML = '_';
	mClass(d, 'blink');
	inp.isBlank = true;
}
function unfillWord(winp) { winp.charInputs.map(x => unfillCharInput(x)); }
function unfocusOnEnter(ev) {
	if (ev.key === 'Enter') {
		ev.preventDefault();
		mBy('dummy').focus();
	}
}
function unfreezeUI() {
	if (!frozen) return;
	frozen = false;
	hide('tempFreezer');
}
function unhighAll(oid) { mapSafe('unhigh', getVisuals, oid); }
function unhighAux(oid) { mapSafe('unhigh', getAuxVisuals, oid); }
function unhighlightBoat() {
	if (boatHighlighted) {
		unhighlightMsAndRelatives(null, boatHighlighted);
		closeInfoboxesForBoatOids(boatHighlighted);
		boatHighlighted = null;
	}
}
function unhighlightContentIds(b) {
	let s = b.innerHTML;
	let ids = s.split(/[ ,:;]+/);
	for (const id of ids) {
		if (id == '_') continue;
		let msList = getVisuals(id);
		if (!msList) continue;
		for (const ms of msList) ms.unhigh();
	}
}
function unhighlightMsAndRelatives(ev, mobj, partName) {
	let id = mobj.id;
	mobj.unhigh(partName);
	let relativeIds = id2uids[id];
	if (nundef(relativeIds)) return;
	for (const idRel of relativeIds) {
		let msRel = UIS[idRel];
		msRel.unhigh('title');
	}
}
function unhighMain(oid) { mapSafe('unhigh', getVisual, oid); }
function unhighSelfAndRelatives(uid, R) {
	for (const oid of R.uid2oids[uid]) {
		for (const uid1 of R.oid2uids[oid]) {
			let ui = R.getUI(uid1);
			mUnhigh(ui);
		}
	}
	let n = R.uiNodes[uid];
	if (n.potentialOverlap) {
		let ui = R.getUI(uid);
		sendToBack(ui);
	}
}
function uniformSizeToContent(uid) {
	let n = R.uiNodes[uid];
	if (nundef(n.children)) return { w: 0, h: 0 }
	parentPadding = isdef(n.params.paddingAroundChildren) ? n.params.paddingAroundChildren : DEFS.defaultPadding;
	childMargin = isdef(n.params.gapBetweenChildren) ? n.params.gapBetweenChildren : DEFS.defaultGap;
	let or = n.params.orientation;
	let rows = cols = 1;
	if (or == 'w') { rows = n.params.rows; cols = n.params.cols; }
	let bl = n.params.baseline;
	let [y0, wTitle] = calcParentContentYOffsetAndWidth(n, parentPadding);
	let children = n.children.map(x => R.uiNodes[x]);
	if (or == 'w') {
		let wchi = Math.max(...children.map(x => x.size.w));
		let hchi = Math.max(...children.map(x => x.size.h));
		let wpar = 2 * parentPadding + wchi * cols + (cols - 1) * childMargin;
		let hpar = y0 + parentPadding + hchi * rows + (rows - 1) * childMargin;
		let xoff = (wTitle > wpar) ? (wTitle - wpar) / 2 : 0;
		let x = xoff + parentPadding;
		let y = y0;
		let i = 0;
		for (let r = 0; r < rows; r++) {
			for (let c = 0; c < cols; c++) {
				let ch = children[i];
				i += 1;
				ch.params.size = { w: wchi, h: hchi };
				ch.params.pos = { x: x, y: y };
				x += wchi + childMargin;
				setFixedSizeAndPos(ch);
			}
			x = xoff + parentPadding;
			y += hchi + childMargin;
		}
		return { w: wpar, h: hpar };
	}
	let axMain, ax2;
	if (or == 'v') { axMain = 'h'; ax2 = 'w'; }
	else if (or == 'h') { axMain = 'w'; ax2 = 'h'; }
	let ax2Max = Math.max(...children.map(x => x.size[ax2]));
	let axMainSum = children.reduce((a, b) => a + (b.size[axMain] || 0), 0);
	axMainSum += childMargin * (children.length - 1);
	let wmax = (or == 'v' ? ax2Max : axMainSum);
	let xoff = 0;
	if (wTitle > wmax) xoff = (wTitle - wmax) / 2;
	let x0 = parentPadding + xoff;
	let x = x0;
	let y = y0;
	let lastChild = R.uiNodes[n.children[n.children.length - 1]];
	for (const n1 of children) {
		if (or == 'v') {
			switch (bl) {
				case 'start': x = x0; break;
				case 'end': x = x0 + ax2Max - n1.size[ax2]; break;
				case 'centered': x = x0 + (ax2Max - n1.size[ax2]) / 2; break;
				case 'stretch':
					x = x0;
					if (n1.size.w < ax2Max) {
						n1.size.w = ax2Max;
						n1.ui.style.minWidth = n1.size.w + 'px';
					}
					break;
				default: x = x0 + (ax2Max - n1.size[ax2]) / 2; break;
			}
			n1.pos = { x: x, y: y, cx: x + n1.size.w / 2, cy: y + n1.size.h / 2 };
			y += n1.size[axMain];
			if (n1 != lastChild) y += childMargin;
		} else {
			switch (bl) {
				case 'start': y = y0; break;
				case 'end': y = y0 + ax2Max - n1.size[ax2]; break;
				case 'centered': y = y0 + (ax2Max - n1.size[ax2]) / 2; break;
				case 'stretch':
					y = y0;
					if (n1.size.h < ax2Max) {
						n1.size.h = ax2Max;
						n1.ui.style.minHeight = n1.size.h + 'px';
					}
					break;
				default: y = y0 + (ax2Max - n1.size[ax2]) / 2; break;
			}
			n1.pos = { x: x, y: y, cx: x + n1.size.w / 2, cy: y + n1.size.h / 2 };
			x += n1.size.w;
			if (n1 != lastChild) x += childMargin;
		}
		n1.ui.style.left = n1.pos.x + 'px';
		n1.ui.style.top = n1.pos.y + 'px';
	}
	let wParent, hParent;
	if (or == 'h') {
		wParent = Math.max(wTitle + parentPadding * 2, x + parentPadding);
		hParent = y0 + ax2Max + parentPadding;
	} else {
		wParent = Math.max(wTitle + parentPadding * 2, ax2Max + 2 * x0);
		hParent = y0 + axMainSum + parentPadding;
	}
	return { w: wParent, h: hParent };
}
function union(lst1, lst2) {
	return [...new Set([...lst1, ...lst2])];
}
function uniqueFirstLetters(arr) {
	let res = [];
	for (const s of arr) {
		if (s.length > 0) {
			addIf_dep(s[0], res);
		}
	}
	return res;
}
function unitTest8() {
	if (execOptions.activatedTests.includes('8699')) console.log(...arguments);
}
function unitTestAutoplay() {
	if (execOptions.activatedTests.includes('autoplay')) console.log(...arguments);
}
function unitTestBattle() {
	if (execOptions.activatedTests.includes('battle')) console.log(...arguments);
}
function unitTestBuildUnit() {
	if (execOptions.activatedTests.includes('buildUnit')) console.log(...arguments);
}
function unitTestCard() {
	if (execOptions.activatedTests.includes('card')) console.log(...arguments);
}
function unitTestCards() {
	if (execOptions.activatedTests.includes('cards')) console.log(...arguments);
}
function unitTestCardsNew() {
	if (execOptions.activatedTests.includes('cardsNew')) console.log(...arguments);
}
function unitTestChoice() {
	if (execOptions.activatedTests.includes('choice')) console.log(...arguments);
}
function unitTestChoicemin() {
	if (execOptions.activatedTests.includes('choice') || execOptions.activatedTests.includes('choicemin')) console.log(...arguments);
}
function unitTestCombat() {
	if (execOptions.activatedTests.includes('combat')) console.log(...arguments);
}
function unitTestCombatStage() {
	if (execOptions.activatedTests.includes('combatStage')) console.log(...arguments);
}
function unitTestConflict() {
	if (execOptions.activatedTests.includes('conflicts')) console.log(...arguments);
}
function unitTestControl() {
	if (execOptions.activatedTests.includes('control')) console.log(...arguments);
}
function unitTestConvoy() {
	if (execOptions.activatedTests.includes('convoy')) console.log(...arguments);
}
function unitTestDecision() {
	if (execOptions.activatedTests.includes('decision')) console.log(...arguments);
}
function unitTestDiplomacy() {
	if (execOptions.activatedTests.includes('diplomacy')) console.log(...arguments);
}
function unitTestFilter() {
	if (execOptions.activatedTests.includes('filter')) console.log(...arguments);
}
function unitTestFilterByType() {
	if (execOptions.activatedTests.includes('filterByType')) console.log(...arguments);
}
function unitTestFilterNation() {
	if (execOptions.activatedTests.includes('filterNation')) console.log(...arguments);
}
function unitTestGameloop() {
	if (execOptions.activatedTests.includes('gameloop')) console.log(...arguments);
}
function unitTestHover() {
	if (execOptions.activatedTests.includes('hover')) console.log(...arguments);
}
function unitTestInit() {
	if (execOptions.activatedTests.includes('init')) console.log(...arguments);
}
function unitTestLoad() {
	if (execOptions.activatedTests.includes('load')) console.log(...arguments);
}
function unitTestLog() {
	if (execOptions.activatedTests.includes('log')) console.log(...arguments);
}
function unitTestMap() {
	if (execOptions.activatedTests.includes('map')) console.log(...arguments);
}
function unitTestMatch() {
	if (execOptions.activatedTests.includes('match')) console.log(...arguments);
}
function unitTestMirrorBattle() {
	if (execOptions.activatedTests.includes('mirror')) console.log(...arguments);
}
function unitTestMovement() {
	if (execOptions.activatedTests.includes('movement')) console.log(...arguments);
}
function unitTestMoving() {
	if (execOptions.activatedTests.includes('moving')) console.log(...arguments);
}
function unitTestMS() {
	if (execOptions.activatedTests.includes('ms')) console.log(...arguments);
}
function unitTestPlayer() {
	if (execOptions.activatedTests.includes('player')) console.log(...arguments);
}
function unitTestRandom() {
	if (execOptions.activatedTests.includes('random')) console.log(...arguments);
}
function unitTestRemove() {
	if (execOptions.activatedTests.includes('remove')) console.log(...arguments);
}
function unitTestRemoved() {
	if (execOptions.activatedTests.includes('removed')) console.log(...arguments);
}
function unitTestRemovedCheck(data) {
	return execOptions.activatedTests.includes('removed') && 'removed' in data && !empty(Object.keys(data.removed));
}
function unitTestRequest() {
	if (execOptions.activatedTests.includes('request')) console.log(...arguments);
}
function unitTestResnail() {
	if (execOptions.activatedTests.includes('resnail')) console.log(...arguments);
}
function unitTestResponse() {
	if (execOptions.activatedTests.includes('response')) console.log(...arguments);
}
function unitTestSave() {
	if (execOptions.activatedTests.includes('save')) console.log(...arguments);
}
function unitTestScenario() {
	if (execOptions.activatedTests.includes('scenario')) console.log(...arguments);
}
function unitTestScenarioMin() {
	if (execOptions.activatedTests.includes('scenarioMin')) console.log(...arguments);
}
function unitTestScenarioWar() {
	if (execOptions.activatedTests.includes('scenarioWar')) console.log(...arguments);
}
function unitTestSeason() {
	if (execOptions.activatedTests.includes('season')) console.log(...arguments);
}
function unitTestSender() {
	if (execOptions.activatedTests.includes('sender')) console.log(...arguments);
}
function unitTestServer() {
	if (execOptions.activatedTests.includes('server')) console.log(...arguments);
}
function unitTestSkip() {
	if (execOptions.activatedTests.includes('skip')) console.log(...arguments);
}
function unitTestStage() {
	if (execOptions.activatedTests.includes('stage')) console.log(...arguments);
}
function unitTestStrategy() {
	if (execOptions.activatedTests.includes('strategy')) console.log(...arguments);
}
function unitTestUnits() {
	if (execOptions.activatedTests.includes('units')) console.log(...arguments);
}
function unitTestUnitVisibility() {
	if (execOptions.activatedTests.includes('visible')) console.log(...arguments);
}
function unitTestUpgradeUnit() {
	if (execOptions.activatedTests.includes('upgradeUnit')) console.log(...arguments);
}
function unitTimeUp() { return (Settings.minutesPerUnit * 60000 - getTimeElapsed()) <= 0; }
function unlink(id) {
	let oids = id2oids[id];
	let uids = id2uids[id];
	if (isdef(uids)) for (const uid of uids) removeInPlace(id2uids[uid], id);
	if (isdef(oids)) for (const oid of oids) removeInPlace(oid2ids[oid], id);
	delete id2uids[id];
	delete id2oids[id];
}
function unpack_table(table) {
	for (const k of ['players', 'fen', 'options', 'scoring']) {
		let val = table[k];
		if (isdef(table[k])) table[k] = if_stringified(val); if (nundef(table[k])) table[k] = {};
	}
	if (isdef(table.modified)) { table.modified = Number(table.modified); table.timestamp = new Date(table.modified); table.stime = stringBeforeLast(table.timestamp.toString(), 'G').trim(); }
	assertion(isdef(window[table.game]), 'game function for ' + table.game + ' not defined in window');
	if (isdef(table.game)) { table.func = window[table.game](); }
	if (isdef(table.options.mode)) { table.mode = table.options.mode; }
	delete table.action; delete table.expected;
	return table;
}
function untie_card(card) {
	remove_from_selection(card);
	clear_selection();
	let oldgroupid = card.groupid;
	if (isdef(oldgroupid)) delete card.owner;
	let oldgroup = Items[oldgroupid];
	let oldindex = isdef(oldgroup) ? oldgroup.ids.indexOf(card.id) : null;
	if (isdef(oldgroup)) removeInPlace(oldgroup.ids, card.id);
	return [oldgroup, oldindex];
}
function update_car(canvas, item) {
	let di = { ArrowUp: canvas.math ? 90 : 270, ArrowDown: canvas.math ? 270 : 90, ArrowLeft: 180, ArrowRight: 0 };
	for (const key in di) {
		if (is_key_down(key)) {
			item.v.a = di[key];
			update_position(item);
			return true;
		}
	}
	return false;
}
function update_cur_table(obj, color) {
	let t = Session.cur_table;
	let tnew = obj.table;
	if (isdef(obj.player_record)) copyKeys(obj.player_record, tnew);
	copyKeys(tnew, t);
	if (isdef(color)) {
		let d = mBy(`rk_${obj.table.id}`);
		if (isdef(d)) mStyle(d, { bg: color });
	}
}
function update_current_table() {
	let o = Serverdata.table;
	assertion(isdef(U), 'NO USER LOGGED IN WHEN GETTING TABLE FROM SERVER!!!!!!!!!!!!!!!!!!!!', U, o);
	if (nundef(Z) || nundef(Z.prev)) Z = { prev: {} };
	assertion(isdef(Z), 'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ', Z);
	set_user(U.name);
	for (const wichtig of ['notes', 'uplayer', 'friendly', 'step', 'round', 'phase', 'stage', 'timestamp', 'modified', 'stime', 'mode', 'scoring']) {
		if (isdef(Z[wichtig])) Z.prev[wichtig] = jsCopy(Z[wichtig]);
	}
	Z.prev.turn = Clientdata.last_turn;
	copyKeys(o, Z, { uname: true });
	let [mode, turn, uname, plorder, fen, host] = [Z.mode, Z.turn, Z.uname, Z.plorder, Z.fen, Z.host];
	assertion(!isEmpty(turn), 'turn empty!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!', turn, fen, plorder);
	Z.role = !plorder.includes(uname) ? 'spectator' : turn.includes(uname) ? 'active' : 'inactive';
	if (Z.game == 'fritz' && Z.role == 'spectator' && isdef(Z.fen.roundorder) && Z.fen.roundorder.includes(uname)) {
		Z.role = 'inactive';
	}
	let upl = Z.role == 'active' ? uname : turn[0];
	if (mode == 'hotseat' && turn.length > 1) { let next = get_next_human_player(Z.prev.uplayer); if (next) upl = next; }
	if (mode == 'multi' && Z.role == 'inactive' && (uname != host || is_human_player(upl))) {
		upl = uname;
	}
	set_player(upl, fen);
	let [uplayer, pl] = [Z.uplayer, Z.pl];
	Z.playmode = pl.playmode;
	if (Z.playmode != 'human') Z.strategy = pl.strategy;
	let [friendly, modified] = [Z.friendly, Z.modified];
	Z.skip_presentation = !FORCE_REDRAW && friendly == Z.prev.friendly && modified <= Z.prev.modified && uplayer == Z.prev.uplayer;
	FORCE_REDRAW = false;
	if (Z.skip_presentation) {
		show_status(`nothing new in ${Z.friendly}`);
		const STOP_POLLING_AFTER = 30000;
		if (nundef(DA.noshow)) DA.noshow = 1; else DA.noshow++; if (DA.noshow >= STOP_POLLING_AFTER) onclick_stoppolling();
		autopoll();
	} else {
		DA.noshow = 0;
		delete DA.sperre;
		clear_timeouts();
	}
}
function update_db_user_from_pl_options(fen, game) {
	let parts = fen.split(',');
	for (const p of parts) {
		let [name, startlevel, lang] = p.split(':');
		startlevel = Number(startlevel);
		set_startlevel(name, game, startlevel);
		set_preferred_lang(name, lang);
	}
}
function update_draw_items() {
	for (const item of get_values(Items)) {
		if (isdef(item.update)) item.update(item);
		if (isdef(item.draw)) item.draw(item);
	}
}
function update_func(canvas, item) {
	let [cv, ctx, ia, ib, ifunc, axes] = [canvas.cv, canvas.cx, item.ia, item.ib, item.ifunc, item.axes];
	cClear(cv, ctx);
	showAxes(ctx, axes);
	let [la, lb, lf] = [[1, 2, 3, 4, 5, 5, 5, 4, 3, 2], [0, .5, 1, 1.5, 2, 2.5, 2.5, 2.5, 2, 1.5, 1, .5], ['sin', 'cos']];
	let [a, b, f] = [la[ia], lb[ib], lf[ifunc]];
	[item.ia, item.ib, item.ifunc] = [(ia + 1) % la.length, (ib + 1) % lb.length, (ifunc + 1) % lf.length];
	funGraph(ctx, axes, x => Math[f](a * x), "rgb(11,153,11)", 1);
	return false;
}
function update_game_status(players) {
	let d = dTitle;
	clearElement(d);
	let d1 = mDiv(d, { display: 'flex', 'justify-content': 'center', 'align-items': 'space-evenly' });
	for (const plname in players) {
		let pl = players[plname];
		let d2 = mDiv(d1, { margin: 4, align: 'center' }, null, `<img src='${pl.imgPath}' style="display:block" class='img_person' width=50 height=50>${pl.score}`);
	}
}
function update_game_values() {
	let game = Session.cur_game;
	let uname = Session.cur_user;
	let g = Session;
	let basevals = lookup(DB.games, [game]); if (basevals) copyKeys(basevals, g);
	for (const k in g.options) { g[k] = get_game_or_user_option(g, k); }
	let uservals = lookup(DB.users, [uname, 'games', game]); if (uservals) copyKeys(uservals, g);
	let levels = lookup(DB.games, [game, 'levels']);
	g.maxlevel = valf(get_keys(levels).length, 0) - 1;
	g.color = getColorDictColor(g.color);
	let level = g.level = nundef(g.level_setting) || g.level_setting == 'player' ? valf(g.startlevel, g.def_startlevel)
		: g.level_setting == 'min' ? 0 : g.level_setting == 'max' ? g.maxlevel : g.def_startlevel;
	if (levels) copyKeys(levels[level], g);
	delete g.levels;
	return g;
}
function update_language_choices(g) {
	let langs = g.availableLanguages;
	let language_holder = mBy('language_holder');
	clearElement(language_holder);
	let friendly = { E: 'english', D: 'german', S: 'spanish', F: 'french', C: 'mandarin' };
	if (isdef(language_holder) && isdef(langs) && langs.length > 1) {
		let avail = toLetterList(langs);
		let labels = avail.map(x => friendly[x]);
		let esel = mSelect(language_holder, avail, friendly, valf(g.lang, 'E'), (ev) => {
			let sel = ev.target;
			let val = sel.value;
			console.log('selected language', val)
			set_language(val, false);
		});
		mClass(esel.firstChild, 'statusselect');
	} else if (isdef(language_holder)) {
		mDiv(language_holder, { patop: 6 }, null, friendly[g.lang], 'statusselect');
	}
}
function update_move(canvas, item) {
	item.y += 1;
	item.y = cycle(item.y, canvas.miny, canvas.maxy);
	return true;
}
function update_my_score(inc) {
	let me = Session.cur_players[Session.cur_user];
	me.score += inc;
	return me.score;
}
function update_otree_from_ui(otree, objects) {
	for (const k in objects) {
		otree[k] = objects[k].list;
	}
	qanim();
}
function update_position(item) {
	let [a1, a2] = [item.a, item.v.a];
	let diff = Math.abs(a2 - a1);
	let inc = valf(item.turn_inc, 0);
	if (inc && diff > inc) {
		let cclock = is_turn_counter_clockwise(a1, a2);
		if (cclock) inc = -inc;
		let anew = a1 + inc;
		anew = (anew + 360) % 360;
		item.a = anew;
	} else {
		item.a = a2 % 360;
		let angle = toRadian(item.a);
		item.x += Math.cos(angle) * item.v.mag;
		item.y += Math.sin(angle) * item.v.mag;
	}
}
function update_session(obj) {
	for (const k in obj) { if (isdef(Session[k])) copyKeys(obj[k], Session[k]); else Session[k] = obj[k]; }
	if (isdef(obj.table)) {
		Session.cur_table = Session.table;
		Session.cur_funcs = window[Session.cur_game]();
		if (!isEmpty(obj.playerdata)) make_players(Session.table.players);
		console.assert(isdef(Session.cur_user) && Session.cur_game == Session.table.game && Session.cur_tid == Session.table.id, "SESSION MISMATCH IN GAME_OPEN_FOR_MOVE!!!!!!!!!!!!!!!!!!!!!");
	}
	if (isdef(obj.playerdata)) {
		let o = Session.cur_players;
		for (const rec of obj.playerdata) {
			if (rec.state == 'null') rec.state = null;
			copyKeys(rec, o[rec.name]);
		}
	}
}
function update_settings() {
	for (const k in settings) {
		let lower = k.toLowerCase();
		let inp = mBy(`i_${lower}`);
		if (isdef(inp)) {
			let value = Number(inp.innerHTML);
			if (isNumber(value)) settings[k] = value;
		}
	}
	socket.emit('settings', JSON.stringify(settings));
}
function update_table() {
	assertion(isdef(U), 'NO USER LOGGED IN WHEN GETTING TABLE FROM SERVER!!!!!!!!!!!!!!!!!!!!', U);
	if (nundef(Z) || nundef(Z.prev)) Z = { prev: {} };
	for (const wichtig of ['playerdata', 'notes', 'uplayer', 'uname', 'friendly', 'step', 'round', 'phase', 'stage', 'timestamp', 'modified', 'stime', 'mode', 'scoring']) {
		if (isdef(Z[wichtig])) Z.prev[wichtig] = jsCopy(Z[wichtig]);
	}
	Z.prev.turn = Clientdata.last_turn = Clientdata.this_turn;
	copyKeys(Serverdata, Z);
	if (isdef(Serverdata.table)) { copyKeys(Serverdata.table, Z); Z.playerlist = Z.players; copyKeys(Serverdata.table.fen, Z); }
	assertion(isdef(Z.fen), 'no fen in Z bei cmd=table or startgame!!!', Serverdata);
	Clientdata.this_turn = Z.turn;
	set_user(U.name);
	assertion(!isEmpty(Z.turn), 'turn empty!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!', Z.turn);
	let fen = Z.fen;
	Z.role = !is_playing(Z.uname, fen) ? 'spectator' : fen.turn.includes(Z.uname) ? 'active' : 'inactive';
	let [uname, turn, mode, host] = [Z.uname, fen.turn, Z.mode, Z.host];
	let upl = Z.role == 'active' ? uname : turn[0];
	if (mode == 'hotseat' && turn.length > 1) { let next = get_next_human_player(Z.prev.uplayer); if (next) upl = next; }
	if (mode == 'multi' && Z.role == 'inactive' && (uname != host || is_human_player(upl))) { upl = uname; }
	set_player(upl, fen);
	let pl = Z.pl;
	Z.playmode = pl.playmode;
	Z.strategy = uname == pl.name ? valf(Clientdata.strategy, pl.strategy) : pl.strategy;
	let [uplayer, friendly, modified] = [Z.uplayer, Z.friendly, Z.modified];
	Z.uplayer_data = firstCond(Z.playerdata, x => x.name == Z.uplayer);
	let sametable = !FORCE_REDRAW && friendly == Z.prev.friendly && modified <= Z.prev.modified && uplayer == Z.prev.uplayer;
	let sameplayerdata = isEmpty(Z.playerdata_changed_for);
	let myplayerdatachanged = Z.playerdata_changed_for.includes(Z.uplayer);
	let specialcase = !i_am_host() && !i_am_acting_host() && !i_am_trigger() && !myplayerdatachanged;
	Z.skip_presentation = sametable && (sameplayerdata || specialcase);
	if (DA.TEST0 && (!sametable || !sameplayerdata)) {
		console.log('======>Z.skip_presentation', Z.skip_presentation, '\nplayerdata_changed_for', Z.playerdata_changed_for);
		console.log('_______ *** THE END *** ___________')
	}
	FORCE_REDRAW = false;
}
function update_table_options_for_user(uname, table_options, game) {
	let lang = get_preferred_lang(uname);
	update_db_user_from_pl_options(table_options, game);
	let lang2 = get_preferred_lang(uname);
	if (lang != lang2) get_dictionary();
}
function updateBindings(supd, R) {
	for (const oid in supd) {
		for (const upd of supd[oid]) {
			let ukind = upd.ukind;
			if (ukind == 'valueChange') {
				let propUpdated = upd.prop;
				let skeys = R.getR(oid);
				let akku = [];
				recCollect(R.ROOT, x => { return x.oid == oid }, akku, true);
				for (const n of akku) {
					updateNode(n, upd, R);
				}
			}
		}
	}
}
function updateBubbleColors(e) {
	const w = window.innerWidth / 255;
	const h = window.innerHeight / 255;
	const x = parseInt(e.pageX / w, 10);
	const y = parseInt(e.pageY / h, 10);
	const r = x;
	const g = (y - 255) * -1;
	const b = x <= y ? y - x : 0;
	container.style.setProperty('--colorEnd', `rgb(${r},${g},${b})`);
}
function updateCollections() {
	S.settings.collectionTypes = { playerProps: ['hand', 'devcards'], objectProps: ['neutral'] };
	_updateCollections(G.playersUpdated, G.playersAugmented, S.settings.collectionTypes.playerProps);
	_updateCollections(G.tableUpdated, G.table, S.settings.collectionTypes.objectProps);
}
function updateColors(o) {
	let pal = S.pals[o.iPalette];
	let bg = pal[o.ipal];
	o.setBg(bg);
	if (o.strInfo && o.strInfo.ipals) {
		let ipals = o.strInfo.ipals;
		for (const id of o.ids) {
			let o = getVisual(id);
			if (o.isManual) continue;
			let info = o.memInfo;
			if (info && info.isPal) {
				let ipal = ipals[info.memType == 'field' ? 0 : info.memType == 'corner' ? 1 : 2];
				o.setBg(pal[ipal], false);
			}
		}
	}
}
function updateCreatedBindings(sCreated, R) {
	for (const oid in sCreated) {
		R.addObject(oid, o);
		for (const sp in R.getSpec()) {
		}
		for (const upd of sCreated[oid]) {
			let ukind = upd.ukind;
			if (ukind == 'valueChange') {
				let propUpdated = upd.prop;
				let skeys = R.getR(oid);
				let akku = [];
				recCollect(R.ROOT, x => { return x.oid == oid }, akku, true);
				for (const n of akku) {
					updateNode(n, upd, R);
				}
			}
		}
	}
}
function UpdateDOMStats() {
	var scoreText = "Score: " + (domUpdate_score / 100).toFixed(2);
	if (Math.abs(domUpdate_score) > MATE - MAXDEPTH) {
		scoreText = "Score: " + "Mate In " + (MATE - Math.abs(domUpdate_score)) + " moves";
	}
	$("#OrderingOut").text("Ordering: " + domUpdate_ordering + "%");
	$("#DepthOut").text("Depth: " + domUpdate_depth);
	$("#ScoreOut").text(scoreText);
	$("#NodesOut").text("Nodes: " + domUpdate_nodes);
	$("#TimeOut").text("Time: " + (($.now() - srch_start) / 1000).toFixed(1) + "s");
}
function updateGameArea() {
	var x, height, gap, minHeight, maxHeight, minGap, maxGap;
	for (i = 0; i < obstacles.length; i += 1) {
		if (meme.crashWith(obstacles[i])) {
			return;
		}
	}
	myGameArea.clear();
	myGameArea.frameNo += 1;
	if (myGameArea.frameNo == 1 || everyinterval(150)) {
		x = myGameArea.canvas.width;
		minHeight = 20;
		maxHeight = 200;
		height = Math.floor(Math.random() * (maxHeight - minHeight + 1) + minHeight);
		minGap = 50;
		maxGap = 200;
		gap = Math.floor(Math.random() * (maxGap - minGap + 1) + minGap);
		obstacles.push(new component(10, height, 'green', x, 0));
		obstacles.push(new component(10, x - height - gap, 'green', x, height + gap));
	}
	for (i = 0; i < obstacles.length; i += 1) {
		obstacles[i].x += -1;
		obstacles[i].draw();
	}
	score.text = 'SCORE: ' + myGameArea.frameNo;
	score.draw();
	meme.newPos();
	meme.draw();
}
function updateGamename(gamename) {
	currentGamename = gamename;
	let gi = allGames[gamename];
	currentPlayersById = {};
	plidByIndex = gi.player_names;
	for (const plid of gi.player_names) {
		currentPlayersById[plid] = {};
	}
	numPlayersMin = arrMin(gi.num_players);
	numPlayersMax = arrMax(gi.num_players);
}
function updateGamenameUi(id, color) {
	let uiName = 'spGame';
	let ui = mBy(uiName);
	if (nundef(ui)) {
		ui = mEditableOnEdited(uiName, dLineTopMiddle, 'game: ', '', changeGameTo, () => {
			console.log('Games', getGames());
		});
	}
	ui.innerHTML = id;
	mStyleX(ui, { fg: color });
}
function updateGameplayerCardCollections(pid, oPlayer) {
	let msPlayerArea = getPlayerArea(pid);
	for (const propName in oPlayer) {
		let plColls = getCollections(pid, propName);
		if (nundef(plColls)) continue;
		for (const key in plColls) {
			let coll = plColls[key];
			if (!coll.tbd) continue;
			let idCollection = getCollectionArea(key, msPlayerArea);
			showCollection(coll, idCollection);
			coll.tbd = null;
		}
	}
}
async function updateGroupInfo() {
	let syms20 = await route_path_yaml_dict('../assets/speech/syms2020.yaml');
	console.log(syms20);
	console.log(KeySets);
	for (const k in syms20) {
		KeySets.all.push(k);
		KeySets.huge.push(k);
		let info = syms20[k];
		if (isdef(info.ngroup)) {
			for (const n of [25, 50, 100]) {
				if (info.ngroup <= n) KeySets['best' + n].push(k);
			}
		}
		if (info.group != 'smileys-emotion') { KeySets.nemo.push(k); if (isdef(info.ngroup)) KeySets.nemo100.push(k); }
		switch (info.group) {
			case 'object': KeySets.object.push(k); KeySets.object50.push(k); KeySets.objectPlus.push(k); break;
			case 'animal': KeySets.life.push(k); KeySets.life50.push(k); KeySets.lifePlus.push(k); break;
			case 'fruit': KeySets.life.push(k); KeySets.life50.push(k); KeySets.lifePlus.push(k); break;
			case 'food': KeySets.life.push(k); KeySets.life50.push(k); KeySets.lifePlus.push(k); break;
			case 'drink': KeySets.life.push(k); KeySets.life50.push(k); KeySets.lifePlus.push(k); break;
			case 'vegetable': KeySets.life.push(k); KeySets.life50.push(k); KeySets.lifePlus.push(k); break;
			case 'smileys-emotion': KeySets.emo.push(k); break;
			case 'people-body': break;
			default: console.log('forgot group', info.group); break;
		}
	}
	addCatsToKeys();
}
function updateKeySettings(nMin) {
	if (nundef(G)) return;
	G.keys = setKeys({ nMin, lang: Settings.language, keysets: KeySets, key: Settings.vocab });
}
function updateLabelSettings() {
	console.assert(isdef(Score.labels), 'Score not set!!!!!')
	if (Settings.showLabels == 'toggle') Settings.labels = Score.labels == true;
	else Settings.labels = (Settings.showLabels == 'always');
}
function UpdateListsMaterial() {
	var piece, sq, index, colour;
	for (index = 0; index < BRD_SQ_NUM; ++index) {
		sq = index;
		piece = brd_pieces[index];
		if (piece != PIECES.OFFBOARD && piece != PIECES.EMPTY) {
			colour = PieceCol[piece];
			brd_material[colour] += PieceVal[piece];
			brd_pList[PCEINDEX(piece, brd_pceNum[piece])] = sq;
			brd_pceNum[piece]++;
		}
	}
}
function updateLoginHeader() { document.getElementById('hUsername').innerHTML = 'logged in as <b>' + clientData.name + '</b>'; }
function updateNode(n, upd, R) {
	let oid = upd.oid;
	let o = R.getO(upd.oid);
	if (upd.ukind == 'valueChange') {
		let prop = upd.prop;
		let oldval = o[prop];
		o[prop] = upd.newval;
		let f = RUPDATE[n.type];
		if (isdef(f)) {
			let ui = n.ui;
			let data = n.data;
			if (data == '.' + upd.prop) {
				n.content = calcContentFromData(oid, o, n.data, R);
			}
			f(ui, n.content);
		}
	}
}
function updateOutput(R) {
	for (const area of ['spec', 'uiTree', 'rTree', 'oidNodes', 'dicts', 'refsIds']) { //'channelsStatic', 'channelsLive' 
		clearElement(area);
	}
	if (SHOW_SPEC) { presentNodes(R.lastSpec, 'spec'); }
	if (SHOW_UITREE) {
		presentDictTree(R.uiNodes, R.tree.uid, 'uiTree', 'children', R,
			['children'],
			null,
			['ui', 'act', 'params', 'defParams', 'cssParams', 'typParams', 'stdParams'],
			{ 'max-width': '35%', font: '14px arial' });
	}
	if (SHOW_RTREE) {
		presentDictTree(R.rNodes, R.tree.uid, 'rTree', 'children', R,
			['children'], null, null, { 'max-width': '35%', font: '14px arial' });
	}
	if (SHOW_OIDNODES) { presentOidNodes(R, 'oidNodes'); }
	if (SHOW_DICTIONARIES) {
		mDictionary(R.rNodesOidKey, { dParent: mBy('dicts'), title: 'rNodesOidKey ' + Object.keys(R.rNodesOidKey).length });
		mDictionary(R.Locations, { dParent: mBy('dicts'), title: 'locations ' + Object.keys(R.Locations).length });
	}
	if (SHOW_IDS_REFS) {
		mDictionary(R.places, { dParent: mBy('refsIds'), title: 'places ' + Object.keys(R.places).length });
		mDictionary(R.refs, { dParent: mBy('refsIds'), title: 'refs ' + Object.keys(R.refs).length });
	}
	if (nundef(R.rNodes)) return;
	let numRTree = Object.keys(R.rNodes).length;
	let numUiNodes = nundef(R.uiNodes) ? 0 : Object.keys(R.uiNodes).length;
	let handCounted = R.ROOT.data;
	console.assert(numRTree == numUiNodes, '!!!FEHLCOUNT!!! #rtree=' + numRTree + ', #uiNodes=' + numUiNodes);
}
function updateOutput_dep(R) {
	for (const area of ['spec', 'uiTree', 'rTree', 'oidNodes', 'dicts']) {
		clearElement(area);
	}
	if (SHOW_SPEC) { presentNodes(R.lastSpec, 'spec'); }
	if (SHOW_UITREE) {
		presentDictTree(R.uiNodes, R.tree.uid, 'uiTree', 'children', R,
			['children'],
			['uid', 'adirty', 'type', 'data', 'content', 'uiType', 'oid', 'key', 'boardType'],
			null,
			{ 'max-width': '35%', font: '14px arial' });
	}
	if (SHOW_RTREE) {
		presentDictTree(R.rNodes, R.tree.uid, 'rTree', 'children', R,
			['children'], null, null, { 'max-width': '35%', font: '14px arial' });
	}
	if (SHOW_OIDNODES) { presentOidNodes(R, 'oidNodes'); }
	if (SHOW_DICTIONARIES) {
		mDictionary(R.rNodesOidKey, { dParent: mBy('dicts'), title: 'rNodesOidKey ' + Object.keys(R.rNodesOidKey).length });
		mDictionary(R.Locations, { dParent: mBy('dicts'), title: 'locations ' + Object.keys(R.Locations).length });
	}
	let numRTree = Object.keys(R.rNodes).length;
	let numUiNodes = nundef(R.uiNodes) ? 0 : Object.keys(R.uiNodes).length;
	let handCounted = R.ROOT.data;
	console.assert(numRTree == numUiNodes, '!!!FEHLCOUNT!!! #rtree=' + numRTree + ', #uiNodes=' + numUiNodes);
}
function updatePlayerConfig() {
	let keysPlayerColors = Object.keys(PLAYER_COLORS);
	let iColor = 0;
	for (const id in serverData.players) {
		let pl = serverData.players[id];
		let colorName = isdef(pl.color) ? pl.color : keysPlayerColors[iColor];
		colorName = colorName.toLowerCase();
		let altName = capitalize(colorName);
		let color = isdef(PLAYER_COLORS[colorName]) ? PLAYER_COLORS[colorName] : colorName;
		playerConfig[GAME].players[id].color = color;
		iColor += 1;
	}
}
function updatePlayersForGame() {
	currentNumPlayers = 0;
	for (let i = 1; i <= MAX_PLAYERS_AVAILABLE; i += 1) {
		if (i <= numPlayersMin) { currentNumPlayers += 1; showPlayer(i); checkPlayer(i); makePlayerReadOnly(i); }
		else if (i <= numPlayersMax) { showPlayer(i); uncheckPlayer(i); }
		else { hidePlayer(i); }
	}
}
function updatePlayersForMode() {
	let mode = currentPlaymode;
	let val = 'me';
	let n = MAX_PLAYERS_AVAILABLE;
	for (let i = 1; i <= n; i += 1) {
		let id = getidType(i);
		if (!isVisible(id)) continue;
		if (mode == 'solo') { populateSelect(i, soloTypes, val); val = 'AI regular'; }
		else if (mode == 'hotseat' || mode == 'passplay') { populateSelect(i, soloTypes, val); }
		else {
			populateSelect(i, allPlayerTypes, val);
			val = PLAYER_CONFIG_FOR_MULTIPLAYER.length > i ? PLAYER_CONFIG_FOR_MULTIPLAYER[i] : 'human';
		}
	}
}
function updatePlaymode(mode) {
	currentPlaymode = mode;
	makePlayermodeReadOnly('multiplayer');
}
function updatePreviewImage(dParent, file, sz = 768) {
	const url = URL.createObjectURL(file);
	dParent.innerHTML = `<img src="${url}" height=${sz}/>`;
}
function updatePreviewImages(dParent, files) {
	for (const f of files) {
		let sz = 200;
		let d = mDiv(dParent, { display: 'inline', w: sz, h: sz });
		updatePreviewImage(d, f, sz);
	}
}
function updateSettings() {
	appSpecificSettings();
	for (const k in SettingTypesCommon) {
		if (SettingTypesCommon[k]) {
			lookupSetOverride(U, ['settings', k], Settings[k]);
		} else {
			if (isdef(G.id)) lookupSetOverride(U, ['games', G.id, 'settings', k], Settings[k]);
		}
	}
}
function updateSizes(nuiBoard) {
	let szOrig = nuiBoard.params.sizes.f;
	let szNew = szOrig;
	let cSizeOrig = nuiBoard.params.sizes.c;
	let cSizeNew = cSizeOrig;
	let eSizeOrig = nuiBoard.params.sizes.e;
	let eSizeNew = eSizeOrig;
	if (nundef(nuiBoard.resizeInfo)) nuiBoard.resizeInfo = {};
	if (isdef(nuiBoard.resizeInfo.fields)) {
		szNew = nuiBoard.resizeInfo.fields;
	}
	if (isdef(nuiBoard.resizeInfo.corners)) {
		cSizeNew = nuiBoard.resizeInfo.corners;
	}
	szNew = Math.max(szNew, cSizeNew);
	if (isdef(nuiBoard.resizeInfo.edges)) {
		eSizeNew = nuiBoard.resizeInfo.edges;
	}
	szNew = Math.max(szNew, eSizeNew);
	return { sOrig: { f: szOrig, c: cSizeOrig, e: eSizeOrig }, sNew: { f: szNew, c: cSizeNew, e: eSizeNew } };
}
function updateSpeakmodeSettings() {
	if (Settings.silentMode && Settings.spokenFeedback) Settings.spokenFeedback = false;
}
function updateStartLevelForUser(game, level, msg) {
	lookupSetOverride(U.games, [game, 'startLevel'], level);
	saveUser();
}
async function updateSymbolDict() {
	let snew = await route_path_yaml_dict('../assets/syms.yaml');
	let sold = await route_path_yaml_dict('../assets/symbolDict.yaml');
	let soldlc = {};
	for (const k in sold) {
		let klc = k.toLowerCase();
		let o = soldlc[klc] = sold[k];
		o.key = klc;
	}
	for (const k in snew) {
		if (nundef(soldlc[k])) {
			soldlc[k] = snew[k];
			console.log('new key added to symbolDict', k)
		} else {
			let onew = snew[k];
			let oold = soldlc[k];
			if (onew.type != oold.type) {
				soldlc[k] = onew;
				console.log('symbolDict key updated', k)
			}
		}
	}
	downloadAsYaml(soldlc, 'symbolDict_upd');
}
async function updateSymbolDictFromDictionaries() {
	[EdDict, DeDict] = await loadGerman();
	let ekeys = Object.keys(EdDict);
	let lowerEKeys = ekeys.map(x => x.toLowerCase());
	console.log('dict e=>d', ekeys);
	ensureSymByType();
	let keys = symKeysByType['icon'];
	console.log('keys', keys);
	let inter = intersection(keys, lowerEKeys);
	console.log('intersection:', inter);
	for (const k of inter) {
		let entry = lookup(EdDict, [k, 'd']);
		if (nundef(entry)) {
			console.log('gibt es nicht!', k)
		} else {
			console.log('entry', entry)
			console.log('JA!', k, entry.join('|'));
			symbolDict[k].D = entry.join('|').toLowerCase();
			symbolDict[k].E = k;
		}
	}
	downloadAsYaml(symbolDict, 'symbolDict');
}
function updateTableCardCollections() {
	let msTableArea = getTabletopCardsArea();
	for (const oid in collections) {
		if (nundef(G.table[oid])) continue;
		let o = G.table[oid];
		for (const propName in o) {
			let colls = getCollections(oid, propName);
			if (nundef(colls)) continue;
			for (const key in colls) {
				let coll = colls[key];
				if (!coll.tbd) continue;
				let idCollection = getCollectionArea(key, msTableArea);
				showCollection(coll, idCollection);
				coll.tbd = null;
			}
		}
	}
}
function updateTableCardCollections_COPY(oid) {
	if (nundef(collections[oid])) return;
	let msArea = getTabletopCardsArea();
	if (isEmpty(collections)) {
		return;
	}
	for (const propName of G.tableUpdated[oid].summary) {
		let o = G.table[propName];
		let plColl = getTableCollections(oid, propName);
		if (isdef(plColl)) {
			for (const key in plColl) {
				let ha = plColl[key];
				let idCollection = getCollectionArea(key, msArea);
				let divHand = UIS[idCollection].elem;
				divHand.style.position = null;
				getSimpleSetElements(ha.hand)
				showPlayerHandNew(ha.name, ha.arr, key);
			}
		}
	}
}
function updateTablenameUi(id, color) {
	let uiName = 'spTable';
	let ui = mBy(uiName);
	if (nundef(ui)) {
		ui = mEditableOnEdited(uiName, dLineTopRight, 'table: ', '', changeTableTo, () => {
			console.log('Tables', getTables());
		});
	}
	ui.innerHTML = id;
	mStyleX(ui, { fg: color });
}
function updateTestInput(index) {
	let elem = mBy('iTestCase');
	if (isdef(elem)) {
		elem.max = Object.keys(testEngine.specs).length - 1;
		elem.min = 0;
		elem.value = index;
	}
}
function updateTimeSettings() {
	let timeElem = mBy('time');
	if (Settings.showTime) { show(timeElem); startTime(timeElem); }
	else hide(timeElem);
}
function updateTooltipContent(oid) {
	let pool = findPool(oid);
	let o = pool[oid];
	ttTitle(oid, o);
	ttBody(oid, o);
}
function updateTooltipContent_hallo(id) {
	let oid = getOidForMainId(id);
	let pool = findPool(id);
	let o = pool[id];
	console.log('tt', id, oid, o)
	return;
	ttTitle(id, o);
	ttBody(id, o);
}
function updateUsernameUi(id, color) {
	let uiName = 'spUser';
	let ui = mBy(uiName);
	if (nundef(ui)) {
		ui = mEditableOnEdited(uiName, dLineTopLeft, 'user: ', '', changeUserTo, () => {
			console.log('Users', getUsers());
		});
	}
	ui.innerHTML = id;
	mStyleX(ui, { fg: color });
}
function updateUserScore() {
	if (nundef(Score.nTotal) || Score.nTotal <= 0) return;
	let sc = { nTotal: Score.nTotal, nCorrect: Score.nCorrect, nCorrect1: Score.nCorrect1, nWins: Score.nWins, nLoses: Score.nLoses, nTied: Score.nTied };
	let g = G.id;
	let recOld = lookupSet(U, ['games', g], { startLevel: 0, nTotal: 0, nCorrect: 0, nCorrect1: 0, nWins: 0, nLoses: 0, nTied: 0 });
	let recSession = lookupSet(U, ['session', g], { startLevel: 0, nTotal: 0, nCorrect: 0, nCorrect1: 0, nWins: 0, nLoses: 0, nTied: 0 });
	addByKey(sc, recSession);
	let counts = DB.games[g].controllerType == 'solo' ? recSession.nWins : recSession.nCorrect;
	recSession.percentage = Math.round(100 * counts / recSession.nTotal);
	addByKey(sc, recOld);
	counts = DB.games[g].controllerType == 'solo' ? recOld.nWins : recOld.nCorrect;
	recOld.percentage = Math.round(100 * recOld.nCorrect / recOld.nTotal);
	Score.nTotal = Score.nCorrect = Score.nCorrect1 = 0;
	saveUser();
}
function upgradeToSimpleGraph(g, dParent, styles = {}) {
	g.id = nundef(dParent.id) ? getUID() : dParent.id;
	let styleDict = {
		node: { 'width': 25, 'height': 25, 'background-color': 'red', "color": "#fff", 'label': 'data(id)', "text-valign": "center", "text-halign": "center", },
		edge: { 'width': 2, 'line-color': 'silver', 'curve-style': 'haystack', },
		'node.highlight': { 'background-color': 'yellow' },
		'node.trans': { 'opacity': '0.5' },
	}
	for (const ks of ['node', 'edge', 'node.highlight', 'node.trans']) {
		if (isdef(styles[ks])) {
			for (const k in styles[ks]) {
				let [prop, val] = translateToCssStyle(k, styles[ks][k], false);
				styleDict[ks][prop] = val;
			}
		}
	}
	let cyStyle = [];
	for (const k in styleDict) { cyStyle.push({ selector: k, style: styleDict[k] }); }
	let size = getSize(dParent);
	let d1 = mDiv(dParent, { position: 'relative', bg: 'green', w: size.w - 80, left: 40, top: 0, h: size.h, align: 'left' });
	g.cy.mount(d1);
	g.cy.style(cyStyle);
	g.enablePanZoom();
	iAdd(g, { div: dParent, dCy: d1 });
}
function uploadImgData(imgFile) {
	let pack = {};
	let data = imgFile.data;
	let filename = imgFile.name; console.log('filename', filename);
	let key = stringBefore(filename, '.');
	pack[key] = { data: data, name: key, filename: filename, type: 'imageData' };
	Socket.emit('generalImages', { pack: pack });
	console.log('uploading pack', pack);
}
function user_already_loaded(name) { return isdef(name && name == Session.cur_user); }
function userUpdate(proplist, val) {
	lookupSetOverride(U, proplist, val);
	saveUser();
}
function useSymbolElemNO(key = 'Treff', h = 50, x = 0, y = 0) {
	return mCreateFrom(`<use xlink:href="#${key}" height="${h}" x="${x}" y="${y}"></use>`);
}
function utter(text, r = .5, p = .8, v = .5, voiceDesc, callback = null) {
	let [voiceKey, voice] = findSuitableVoice(text, voiceDesc);
	utterance.text = sepWords(text, voiceKey);
	utterance.rate = r;
	utterance.pitch = p;
	utterance.volume = v;
	utterance.voice = voice;
	utterance.onend = callback;
	synth.onend
	if (isdef(timeout2)) { clearTimeout(timeout2); }
	timeout2 = setTimeout(() => {
		if (!isINTERRUPT) {
			isSpeakerRunning = true;
		}
		synth.speak(utterance); focus(mBy(defaultFocusElement));
	}, 200);
}
function valf() {
	for (const arg of arguments) if (isdef(arg)) return arg;
	return null;
}
function valfi() {
	for (const arg of arguments) {
		if (isdef(arg)) return arg;
	}
	return null;
}
function valnwhite() {
	for (const arg of arguments) if (isdef(arg) && !isEmptyOrWhiteSpace(arg)) return arg;
	return null;
}
function valToString(n) { if (isFractionType(n)) return getTextForFractionX(n.n, n.d); else return n; }
function valueOfElement(id) {
	return document.getElementById(id).value;
}
function verify_min_req() {
	let [fen, uplayer] = [Z.fen, Z.uplayer];
	let pl = fen.players[uplayer];
	let jsorted = jsCopy(pl.journeys).sort((a, b) => b.length - a.length);
	let di = {
		'3': jsorted.length > 0 && is_group(jsorted[0]) && jsorted[0].length >= 3,
		'33': jsorted.length > 1 && is_group(jsorted[0]) && jsorted[0].length >= 3
			&& is_group(jsorted[1]) && jsorted[1].length >= 3,
		'4': jsorted.length > 0 && is_group(jsorted[0]) && jsorted[0].length >= 4,
		'44': jsorted.length > 1 && is_group(jsorted[0]) && jsorted[0].length >= 4
			&& is_group(jsorted[1]) && jsorted[1].length >= 4,
		'5': jsorted.length > 0 && is_group(jsorted[0]) && jsorted[0].length >= 5,
		'55': jsorted.length > 1 && is_group(jsorted[0]) && jsorted[0].length >= 5
			&& is_group(jsorted[1]) && jsorted[1].length >= 5,
		'7R': jsorted.length > 0 && is_sequence(jsorted[0]) && jsorted[0].length >= 7,
	};
	let goals = is_fixed_goal() ? [get_round_goal()] : get_available_goals(uplayer);
	for (const g of goals) {
		if (di[g] == true) { return true; }
	}
	return false;
}
function verify_unit_test(otree) {
	if (isdef(DA.verify) && ITER == DA.iter_verify) {
		TestRunning = false;
		let res = DA.verify(otree);
		console.log('***UNIT TEST ' + TestNumber, res ? 'passed...' : 'FAILED!!!!!!!!!!!!!!!!');
		console.assert(res, '*** STOP TEST FAIL ***')
		if (TestSuiteRunning) test_engine_run_next(TestList);
	}
	return true;
}
async function verifySequence(indexFrom, indexTo, saveOnCompleted = false) {
	show('btnStop');
	console.log('______________ verify from', indexFrom, 'to', indexTo, 'save', saveOnCompleted);
	testEngine.autosave = true;
	clearElement(mBy('table'));
	let series = testEngine.series;
	let maxIndex = indexTo;
	let index = indexFrom;
	await testEngine.loadTestCase(series, index);
	await rParse(RSG_SOURCE, { defs: testEngine.defs, spec: testEngine.spec, sdata: testEngine.sdata });
	setTimeout(async () => { await verNext(series, index + 1, maxIndex, saveOnCompleted); }, 1000);
}
async function verNext(series, index, maxIndex, saveOnCompleted = false) {
	await testEngine.loadTestCase(series, index);
	await rParse(RSG_SOURCE, { defs: testEngine.defs, spec: testEngine.spec, sdata: testEngine.sdata });
	let timeOUT = 500;
	if (index < maxIndex && !STOP) setTimeout(async () => { await verNext(series, index + 1, maxIndex, saveOnCompleted); }, timeOUT);
	else {
		isTraceOn = SHOW_TRACE;
		STOP = false;
		hide('btnStop');
		if (saveOnCompleted) saveSolutions(series, testEngine.Dict[series].solutions);
	}
}
function visNumber(n, dParent, color, or = 'h', asNumber = [0]) {
	if (!isNumber(n) || asNumber.includes(n)) return zText('' + n, dParent, { fg: 'white', fz: 64 });
	return _visualizeNumber(n, dParent, color, or);
}
function visOperation(op, a, b, dParent, symResult) {
	switch (op) {
		case 'plus':
		case 'minus': return _visualizeAritOp(op, a, b, dParent, symResult); break;
		case 'mult': return _visualizeMult(a, b, dParent, symResult); break;
	}
}
function visOperator(s, dParent, styles = { fg: 'white', fz: 64 }) {
	zText(s, dParent, styles);
}
function visual(shape, { ipal, fill, x, y, w, h, sPoints, border, thickness, rounding, path, txt, fz, sz }, overlay = true, draw = true) {
	let ms = new MS(uid(), 'g');
	let options = {};
	if (ipal) fill = getpal(ipal);
	if (fill) options.fill = fill;
	if (x) options.x = x;
	if (y) options.y = y;
	if (w) options.w = w;
	if (h) options.h = h;
	if (txt) options.txt = txt;
	if (fz) options.fz = fz;
	if (sz) options.sz = sz;
	if (sPoints) options.sPoints = sPoints;
	if (border) options.border = border;
	if (thickness) options.thickness = thickness;
	if (rounding) options.rounding = rounding;
	if (path) options.path = './assets/images/transpng/' + path + '.png';
	switch (shape) {
		case 'circle':
			ms.circle(options);
			break;
		case 'hex':
			ms.hex(options);
			break;
		case 'rect':
			ms.rect(options);
			break;
		case 'poly':
			ms.poly(options);
			break;
		case 'image':
			ms.image(options);
			break;
		case 'text':
			ms.text(options);
			break;
		default:
			return null;
	}
	if (overlay) {
		overlayOptions = jsCopy(options);
		overlayOptions.className = 'overlay';
		delete overlayOptions.fill;
		delete overlayOptions.path;
		switch (shape) {
			case 'circle':
				ms.circle(overlayOptions);
				break;
			case 'hex':
				ms.hex(overlayOptions);
				break;
			case 'rect':
				ms.rect(overlayOptions);
				break;
			case 'poly':
				ms.poly(overlayOptions);
				break;
			case 'image':
				ms.rect(overlayOptions);
				break;
			case 'text':
				ms.text(overlayOptions);
				break;
			default:
				return null;
		}
	}
	if (draw) ms.draw();
	return ms;
}
function visualAttributeSetter(c) {
	let props = 'innerHTML onclick';
	for (const k of props.split(' ')) {
		propertyGiver(c, k, x => c.visual[k] = x, () => c.visual[k]);
	}
}
function visualPropertySetter(c) {
	let props = 'bg fg h w background color height width rounding padding fz font align';
	for (const k of props.split(' ')) {
		propertyGiver(c, k,
			x => { let styles = {}; styles[k] = x; mStyle(c.visual, styles); },
			() => { return mGetStyle(c.visual, k); }
		);
	}
}
function waitForLogin() {
	initDom();
	openTabTesting('Seattle');
}
async function wegMitwh() {
	let syms = await route_path_yaml_dict('../assets/syms.yaml');
	let newSyms = {};
	for (const k in syms) {
		let info = jsCopy(syms[k]);
		info.w = info.w[0];
		info.h = info.h[0];
		newSyms[k] = info;
	}
	downloadAsYaml(newSyms, 'syms');
}
function weiter_process_inspect() {
	let [stage, A, fen, uplayer] = [Z.stage, Z.A, Z.fen, Z.uplayer];
	let item = A.items[A.selected[0]];
	let uibuilding = A.uibuilding = item.o;
	let fenbuilding = A.fenbuilding = lookup(fen, uibuilding.path.split('.'));
	let key = uibuilding.keycard.key;
	let cards = uibuilding.items;
	let schweine_cand = [];
	for (let i = 1; i < cards.length; i++) {
		if (fenbuilding.schweine.includes(i)) continue;
		let card = cards[i];
		if (card.key == key) continue;
		assertion(i == card.index, 'wrong card index!!!!')
		schweine_cand.push(card);
	}
	if (schweine_cand.length > 1) {
		Z.stage = 38;
		ari_pre_action();
	} else if (schweine_cand.length == 1) {
		setTimeout(() => turn_new_schwein_up(schweine_cand[0], fenbuilding, uibuilding), 3000);
	} else if (isEmpty(fenbuilding.schweine)) {
		Z.stage = 29;
		ari_history_list([`${uplayer} inspects a correct building`], 'inspect');
		show_instruction('the building is CORRECT - You loose 1 rumor')
		setTimeout(ari_pre_action, 2000);
	} else {
		let rumor = fen.deck_rumors[0]; fen.deck_rumors.shift();
		fen.players[uplayer].rumors.push(rumor);
		show_instruction('no additional schwein has been found - you gain 1 rumor')
		ari_history_list([`${uplayer} inspects a schweine!`], 'inspect');
		setTimeout(ari_next_action, 2000);
	}
}
function whenSoundPaused() {
	_sndPlayer = null;
	_sndPlayerIdle = true;
	_loaded = false;
	if (!isEmpty(_qSound)) { _deqSound(); } else { _idleSound = true; }
}
function where(o) {
	let fname = getFunctionsNameThatCalledThisFunction();
}
function whichGame(callback) { let route = '/game/info'; _sendRouteJS(route, callback); }
function whoAmI() {
	let gc = S.gameConfig;
	return { username: USERNAME, playerOnTurn: G.player, myPlayers: [S.gameConfi] }
}
function wise() {
	function state_info(dParent) { return; }
	function setup(players, options) {
		let fen = { players: {}, plorder: jsCopy(players), history: [], num: options.num };
		let starter = fen.starter = fen.plorder[0];
		Sayings = shuffle(Sayings);
		fen.index = 0;
		fen.saying = Sayings[fen.index];
		for (const plname of players) {
			let pl = fen.players[plname] = {
				score: 0,
				name: plname,
				color: get_user_color(plname),
			};
		}
		[fen.phase, fen.stage, fen.step, fen.turn] = ['one', 'write', 0, jsCopy(fen.plorder)];
		return fen;
	}
	function check_gameover() {
		let winners = [];
		for (const plname of Z.plorder) {
			let cond = get_player_score(plname) >= Z.options.winning_score;
			if (cond) { winners.push(plname); }
		}
		if (!isEmpty(winners)) Z.fen.winners = winners;
		return isEmpty(winners) ? false : Z.fen.winners;
	}
	function post_collect() { agmove_resolve(); }
	return { post_collect, state_info, setup, present: wise_present, check_gameover, activate_ui: wise_activate };
}
function wise_activate() {
	let [pldata, stage, A, fen, phase, uplayer] = [Z.playerdata, Z.stage, Z.A, Z.fen, Z.phase, Z.uplayer];
	let donelist = Z.playerdata.filter(x => isDict(x.state));
	let complete = donelist.length == Z.plorder.length;
	let resolvable = uplayer == fen.starter && complete;
	let waiting = !resolvable && isdef(donelist.find(x => x.name == uplayer));
	console.log(uplayer, stage, 'done', donelist, 'complete', complete, 'waiting', waiting);
	Z.isWaiting = false;
	if (waiting) {
		mDiv(dTable, {}, null, 'WAITING FOR PLAYERS TO COMPLETE....');
		if (complete) {
			Z.turn = [fen.starter];
			if (Z.mode != 'multi') take_turn_waiting();
		}
		Z.isWaiting = true;
		autopoll();
	} else if (stage == 'write' && resolvable) {
		assertion(uplayer == fen.starter, 'NOT THE STARTER WHO COMPLETES THE STAGE!!!')
		let start = fen.saying.start.toLowerCase();
		let sentences = [];
		for (const pldata of Z.playerdata) {
			let plname = pldata.name;
			let text = start + ' ' + pldata.state.text;
			sentences.push({ plname: plname, text: text.toLowerCase() });
		}
		sentences.push({ plname: '', text: start + ' ' + fen.saying.end.toLowerCase() });
		fen.sentences = shuffle(sentences);
		Z.turn = jsCopy(Z.plorder);
		Z.stage = 'select';
		take_turn_fen_clear();
	} else if (stage == 'write') {
		let d = mCreate('form');
		let dt = dTable;
		mAppend(dt, d);
		d.autocomplete = "off";
		d.action = "javascript:void(0);";
		mDiv(d, { fz: 20 }, 'dForm', fen.saying.start.toLowerCase() + '...');
		Z.form = d;
		mLinebreak(d, 10);
		mInput(d, { wmin: 600 }, 'i_end', 'enter ending');
		d.onsubmit = wise_submit_text;
	} else if (stage == 'select' && resolvable) {
		assertion(uplayer == fen.starter, 'NOT THE STARTER WHO COMPLETES THE STAGE!!!')
		let d = mDiv(dTable, {});
		fen.result = {};
		for (const pldata of Z.playerdata) {
			let selecting = pldata.name;
			let selected = pldata.state.plname;
			let text = pldata.state.text;
			if (isEmpty(selected)) {
				console.log('REINGEGANGEN!!!!!!!!!!!!!!')
				fen.players[selecting].score += 1;
				selected = 'correct';
			} else if (selecting != selected) {
				fen.players[selected].score += 1;
			}
			fen.result[selecting] = { plname: selected, text: text };
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
			d1.onclick = wise_select_sentence;
		}
	} else if (stage == 'round' && resolvable) {
		assertion(uplayer == fen.starter, 'NOT THE STARTER WHO COMPLETES THE STAGE!!!')
		delete fen.result;
		Z.turn = jsCopy(Z.plorder);
		fen.index++;
		fen.saying = Sayings[fen.index];
		Z.stage = 'write';
		take_turn_fen_clear();
	} else if (stage == 'round') {
		let d = mDiv(dTable, {});
		for (const plname in fen.result) {
			let o = fen.result[plname];
			let d1 = mDiv(d, { fz: 20, hline: 30 }, null, `${plname} selected ${o.plname}: ${o.text}`);
		}
		mLinebreak(dTable, 12)
		mButton('WEITER', wise_onclick_weiter, dTable, {}, ['donebutton', 'enabled']);
	} else {
		console.log('Z', Z)
		alert('PROBLEM!!!')
	}
}
function wise_onclick_weiter() {
	Z.state = { plname: Z.uplayer };
	take_turn_multi();
}
function wise_present(dParent) {
	let [fen, ui, stage, uplayer] = [Z.fen, UI, Z.stage, Z.uplayer];
	let [dOben, dOpenTable, dMiddle, dRechts] = tableLayoutMR(dParent, 1, 0);
	let dt = dTable = dOpenTable; clearElement(dt); mCenterFlex(dt);
	wise_stats(dt);
	mLinebreak(dt, 10);
}
function wise_select_sentence(ev) {
	if (!uiActivated) return;
	let text = ev.target.innerHTML;
	let plname = stringAfter(ev.target.id, 'dsent_')
	Z.state = { plname: plname, text: text };
	take_turn_multi();
}
function wise_stats(d) {
	let players = Z.fen.players;
	let d1 = mDiv(d, { display: 'flex', 'justify-content': 'center', 'align-items': 'space-evenly' });
	for (const plname of get_present_order()) {
		let pl = players[plname];
		let onturn = Z.turn.includes(plname);
		let sz = 50;
		let bcolor = plname == Z.uplayer ? 'lime' : 'silver';
		let border = pl.playmode == 'bot' ? `double 5px ${bcolor}` : `solid 5px ${bcolor}`;
		let rounding = pl.playmode == 'bot' ? '0px' : '50%';
		let d2 = mDiv(d1, { margin: 4, align: 'center' }, null, `<img src='../base/assets/images/${plname}.jpg' style="border-radius:${rounding};display:block;border:${border};box-sizing:border-box" class='img_person' width=${sz} height=${sz}>${get_player_score(plname)}`);
	}
}
function wise_submit_text(ev) { ev.preventDefault(); let text = mBy('i_end').value; Z.state = { text: text }; take_turn_multi(); }
function without(arr, elementToRemove) {
	return arr.filter(function (el) {
		return el !== elementToRemove;
	});
}
function wlog() {
	let s = '';
	for (const a of arguments) {
		s += a + ' ';
	}
	console.log(s);
}
function wordCorrectionFactor(text, styles, w, h, fz) {
	styles.fz = fz;
	let size = getSizeWithStyles(text, styles);
	let hFactor = 1; let wFactor = 1;
	if (size.h > h - 1) { hFactor = size.h / h; }
	if (size.w > w - 1) { wFactor = size.w / w; }
	if (size.w < w && size.h < h) return 0;
	else return Math.max(hFactor, wFactor);
}
function wordsFromToText(i, n = 300) {
	let list = [];
	for (const k in symbolDict) {
		let info = symbolDict[k];
		if (nundef(info.bestE) || !isString(info.bestE) || info.bestE.length < 2) continue;
		addIf(list, info.bestE);
	}
	let sfromi = arrFromIndex(list, i);
	s300 = arrTake(sfromi, n);
	let s = s300.join('\n');
	console.log(s);
	downloadTextFile(s, 'words_' + i);
}
function wordsOfLanguage(key, language) {
	let y = symbolDict[key];
	let w = y[language];
	let wlist = w.split('|');
	return wlist.map(x => x.trim());
}
function worldMap(loc) {
	let html =
		`<div id="map_area" class="grid_div" style="width:340px;height:220px;background-color:rgba(86, 182, 222);">
						<svg width="100%" height="100%" viewBox="0 0 3400 2200" style="box-sizing:border-box;">
								<g id="mapG" >
										<image id="imgMap" href="/assets/tnt/TTmap.jpg" />
								</g>
						</svg>
				</div>`;
	let d = mBy(loc);
	d.innerHTML = html;
}
function wrapLayoutColarr(num) {
	const arr = [[0], [1], [2], [1, 2], [2, 2], [2, 3], [3, 3], [2, 3, 2], [2, 3, 3], [3, 3, 3], [3, 4, 3], [3, 4, 4], [4, 4, 4]];
	return num < arr.length ? arr[num] : [num];
}
function wrapLayoutPosition(nBoard, tile, R) {
	let margin = 2;
	let uids = tile.children;
	let colarr = wrapLayoutColarr(uids.length);
	let rows = colarr.length;
	let iNode = 0;
	let nChild = R.uiNodes[uids[0]];
	let size0 = R.uiNodes[uids[0]].size;
	let wChild = getBounds(nChild.ui).width;
	let xOffset = nBoard.size.w / 2 + tile.pos.x - size0.w / 2;
	let yOffset = nBoard.size.h / 2 + tile.pos.y - size0.h / 2;
	let x = 0;
	let y = 0;
	let dx = size0.w + margin;
	let dy = size0.h + margin;
	for (let r = 0; r < rows; r++) {
		x = 0;
		y = r * dy - (rows * dy - dy) / 2;
		let wrow = colarr[r] * dx - dx;
		for (let c = 0; c < colarr[r]; c++) {
			let robber = R.uiNodes[uids[iNode]];
			let ui = robber.ui;
			ui.style.position = 'absolute';
			ui.style.display = 'inline-block';
			ui.style.boxSizing = 'border-box'
			let xPos = x + xOffset - wrow / 2;
			let yPos = y + yOffset;
			robber.pos = { x: xPos, y: yPos };
			ui.style.left = xPos + 'px';
			ui.style.top = yPos + 'px';
			ui.style.margin = '0px';
			x += dx;
			iNode += 1;
		}
	}
}
function wrapLayoutSizeNeeded(uids, R) {
	const arr = [[0], [1], [2], [1, 2], [2, 2], [2, 3], [3, 3], [2, 3, 2], [2, 3, 3], [3, 3, 3], [3, 4, 3], [3, 4, 4], [4, 4, 4]];
	let colarr = wrapLayoutColarr(uids.length);
	let rows = colarr.length;
	let iNode = 0;
	let wmax = 0;
	let maxNumPerRow = 0;
	let htot = 0;
	for (let r = 0; r < rows; r++) {
		let hmax = 0;
		let wtot = 0;
		for (let c = 0; c < colarr[r]; c++) {
			let n = R.uiNodes[uids[iNode]];
			let h = n.size.h;
			let w = n.size.w;
			hmax = Math.max(hmax, h);
			wtot += w;
			maxNumPerRow = Math.max(maxNumPerRow, c);
		}
		wmax = Math.max(wmax, wtot);
		htot += hmax;
	}
	let margin = 2;
	let wNeeded = wmax + margin * (maxNumPerRow + 1);
	let hNeeded = htot + margin * (rows + 1);
	return { w: wNeeded, h: hNeeded };
}
function write() { if (verbose) console.log(...arguments); }
function writeComments(pre) {
	console.log('NEEEEEEEEEEEEEEEEEEEEIIIIIIIIIIIIIIIIIN', getFunctionsNameThatCalledThisFunction())
	if (ROUND_OUTPUT) {
		console.log('...' + currentGame.substring(1), pre + ' currentLevel:' + currentLevel, 'pics:' + NumPics,
			'labels:' + NumLabels,
			'\nkeys:' + currentKeys.length, 'minlen:' + MinWordLength, 'maxlen:' + MaxWordLength, 'trials#:' + MaxNumTrials);
	}
}
function writeExp() { }
function writeSound() { return; console.log('calling playSound'); }
function yesNo() { return tossCoin(50); }
function yPics(ifs, options) {
	let keys = choose(SymKeys, n);
	console.log(keys)
	showPicsS(keys);
}
function yRandomPic(ifs, options) {
}
function zoom(factor) {
	bodyZoom = factor;
	if (Math.abs(bodyZoom - 1) < .2) bodyZoom = 1;
	document.body.style.transformOrigin = '0% 0%';
	document.body.style.transform = 'scale(' + bodyZoom + ')';
	localStorage.setItem('bodyZoom', bodyZoom);
}
function zoom_on_resize(referenceDivId) {
	if (!window.onresize) {
		window.onresize = () => {
			let newBrowserZoom = Math.round(window.devicePixelRatio * 100);
			if (isdef(browserZoom) && browserZoom != newBrowserZoom) { browserZoom = newBrowserZoom; return; }
			if (nundef(browserZoom) || browserZoom == newBrowserZoom) {
				let wNeeded = document.getElementById(referenceDivId).getBoundingClientRect().width;
				let wNeededReally = wNeeded / bodyZoom;
				let wHave = window.innerWidth;
				let zn = wHave / wNeeded;
				let znr = wHave / wNeededReally;
				if (Math.abs(znr - bodyZoom) > .01) zoom(znr);
			}
			browserZoom = newBrowserZoom;
		};
	}
}
function zoom_on_wheel_alt() {
	if (!window.onwheel) {
		window.addEventListener("wheel", ev => {
			if (!ev.altKey || ev.ctrlKey) return;
			ev.preventDefault();
			if (ev.deltaY > 0) { zoomOut(); } else if (ev.deltaY < 0) zoomIn();
		}, { passive: false });
	}
}
function zoomBy(x) { if (nundef(bodyZoom)) bodyZoom = 1; zoom(bodyZoom * x); }
function zoomIn() { zoomBy(1.5); }
function zoomOut() { zoomBy(.7); }
function zPicS(item, dParent, styles = {}) {
	let w = styles.w, h = styles.h, padding = styles.padding, hpadding = styles.hpadding, wpadding = styles.wpadding;
	if (isdef(styles.sz)) {
		if (nundef(w)) w = styles.sz;
		if (nundef(h)) h = styles.sz;
	}
	let stylesNew = jsCopy(styles);
	if (isdef(w)) {
		if (isdef(padding)) { w -= 2 * padding; }
		else if (isdef(wpadding)) { w -= 2 * wpadding; }
		stylesNew.w = w;
	}
	if (isdef(h)) {
		if (isdef(padding)) { h -= 2 * padding; }
		else if (isdef(hpadding)) { h -= 2 * hpadding; }
		stylesNew.h = h;
	}
	return _zPicS(item, dParent, stylesNew);
}
function zRepeatEachItem(items, repeat, shufflePositions = false) {
	let orig = items;
	let itRepeat = items;
	for (let i = 1; i < repeat; i++) { itRepeat = itRepeat.concat(orig.map(x => registeredItemCopy(x))); }
	if (shufflePositions) { shuffle(itRepeat); }
	let labelRepeat = {};
	let idx = 0;
	for (const item of itRepeat) {
		let iRepeat = labelRepeat[item.label];
		if (nundef(iRepeat)) iRepeat = 1; else iRepeat += 1;
		item.iRepeat = iRepeat;
		item.index = idx; idx += 1;
		labelRepeat[item.label] = iRepeat;
	}
	return itRepeat;
}
function zRepeatInColorEachItem(items, colorKeys) {
	let itColors = [];
	for (let i = 0; i < colorKeys.length; i++) {
		let newItems;
		if (i > 0) { newItems = jsCopy(items); newItems.map(x => registerAsNewItem(x)); }
		else newItems = items;
		itColors = itColors.concat(newItems);
	}
	for (let i = 0; i < colorKeys.length; i++) {
		let colorKey = colorKeys[i];
		let textShadowColor = ColorDict[colorKey].c;
		for (let j = 0; j < items.length; j++) {
			let index = i * items.length + j;
			let x = itColors[index];
			x.index = index;
			x.textShadowColor = textShadowColor;
			x.color = ColorDict[colorKey];
			x.colorKey = colorKey;
		}
	}
	return itColors;
}
function zText(text, dParent, textStyles, hText, vCenter = false) {
	let tSize = getSizeWithStyles(text, textStyles);
	let extra = 0, lines = 1;
	if (isdef(hText)) {
		extra = hText - tSize.h;
		if (textStyles.fz) lines = Math.floor(tSize.h / textStyles.fz);
	}
	let dText = isdef(text) ? mText(text, dParent, textStyles) : mDiv(dParent);
	if (extra > 0 && vCenter) {
		dText.style.paddingTop = (extra / 2) + 'px';
		dText.style.paddingBottom = (extra / 2) + 'px';
	}
	return { text: text, div: dText, extra: extra, lines: lines, h: tSize.h, w: tSize.w, fz: textStyles.fz };
}
//#endregion

const RUPDATE = {
	info: mNodeChangeContent,
};
const RCREATE = {
	card52: mCard52,
	card: mCard,
	hand: mHand,
	grid: mGrid,
	info: mInfo,
	invisible: mInvisible,
	panel: mPanel,
	picto: mPicto,
	manual00: mManual00,
}
const GFUNC = {
	gTouchPic: {
		startGame: startGameTP, startLevel: startLevelTP, startRound: startRoundTP, trialPrompt: trialPromptTP, prompt: promptTP, activate: activateTP, eval: evalTP
	},
	gTouchColors: {
		startGame: startGameTC, startLevel: startLevelTC, startRound: startRoundTC, trialPrompt: trialPromptTC, prompt: promptTC, activate: activateTC, eval: evalTC
	},
	gWritePic: {
		startGame: startGameWP, startLevel: startLevelWP, startRound: startRoundWP, trialPrompt: trialPromptWP, prompt: promptWP, activate: activateWP, eval: evalWP
	},
	gMissingLetter: {
		startGame: startGameML, startLevel: startLevelML, startRound: startRoundML, trialPrompt: trialPromptML, prompt: promptML, activate: activateML, eval: evalML
	},
	gSayPic: {
		startGame: startGameSP, startLevel: startLevelSP, startRound: startRoundSP, trialPrompt: trialPromptSP, prompt: promptSP, activate: activateSP, eval: evalSP
	},
	gSayPicAuto: {
		startGame: startGameSPA, startLevel: startLevelSPA, startRound: startRoundSPA, trialPrompt: trialPromptSPA, prompt: promptSPA, activate: activateSPA, eval: evalSPA
	},
}
const CRIMSON = colorDarker('crimson', .25);
const ALLTESTS = {
	0: {
		0: {
			fStruct: makeRoot, options: {
				presentationStrategy: 'rec', autoType: 'cssEmpty',
				params: { _1: { width: 40, height: 40, color: 'red', 'background-color': 'blue' } }
			}
		},
	},
	1: {
		0: { fStruct: makeSimplestTree, options: { params: { '_1': { height: 120 } } } },
		1: { fStruct: makeSimplestTree, options: { params: { '_1': { width: 100, height: 120 } } } },
		2: { fStruct: makeSimpleTree, options: { params: { '_1': { width: 100, height: 120 } } } },
		3: { fStruct: makeSimpleTree, options: { params: { '_1': { orientation: 'v', width: 100, height: 120 } } } },
		4: { fStruct: makeTree33, options: { params: { '_1': { orientation: 'v' }, '_4': { orientation: 'v' } } } },
		5: { fStruct: makeTree332x2, options: { params: { '_1': { orientation: 'v' } } } },
		6: { fStruct: makeTree332x2, options: { params: { '_4': { orientation: 'v' } } } },
	},
	2: {
		0: { fStruct: makeTree33, options: { params: { '_4': { fg: 'red', orientation: 'v' } } } },
		1: { fStruct: makeTree33, options: { params: { '_4': { orientation: 'v' } } } },
		2: { fStruct: makeTree33, options: { params: { '_1': { orientation: 'v' } } } },
		3: { fStruct: makeTree33, options: { params: { '_1': { orientation: 'v' } } } },
		4: { fStruct: makeTree33, options: { params: { '_1': { orientation: 'v' }, '_4': { orientation: 'v' } } } },
		5: { fStruct: makeTree332x2, options: { params: { '_1': { orientation: 'v' } } } },
		6: { fStruct: makeTree332x2, options: { params: { '_4': { orientation: 'v' } } } },
		7: { fStruct: makeTree332x2, options: { params: { '_7': { orientation: 'v' } } } },
	},
	3: {
		0: { fStruct: makeTree33, options: { params: { '_4': { fg: 'red', orientation: 'v' } } } },
		1: { fStruct: makeTree33, options: { params: { '_4': { orientation: 'v' } } } },
		2: { fStruct: makeTree33, options: { params: { '_1': { orientation: 'v' } } } },
		3: { fStruct: makeTree33, options: { params: { '_1': { orientation: 'v' } } } },
		4: { fStruct: makeTree33, options: { params: { '_1': { orientation: 'v' }, '_4': { orientation: 'v' } } } },
		5: { fStruct: makeTree332x2, options: { params: { '_1': { orientation: 'v' } } } },
		6: { fStruct: makeTree332x2, options: { params: { '_4': { orientation: 'v' } } } },
		7: { fStruct: makeTree332x2, options: { params: { '_7': { orientation: 'v' } } } },
		8: { fStruct: makeTree332x2, options: { params: { '_4': { orientation: 'v' }, '_7': { orientation: 'v' } } } },
		9: { fStruct: makeSimplestTree, options: undefined },
		10: { fStruct: makeSimplestTree, options: { fContent: contentNoRootContent } },
		11: { fStruct: makeSimpleTree, options: undefined },
		12: { fStruct: makeSimpleTree, options: { params: { '_1': { orientation: 'v' } } } },
		13: { fStruct: makeSimpleTree, options: { fContent: contentNoRootContent } },
		14: { fStruct: makeTree33, options: { fContent: contentNoRootContent } },
		15: { fStruct: makeTree332x2, options: undefined },
		16: { fStruct: makeTree332x2, options: { fContent: contentNoRootContent } },
		17: { fStruct: () => makeSimpleTree(20), options: { fContent: contentNoRootContent } },
		18: { fStruct: makeSimplestTree, options: { fContent: contentRootExtralong } },
		19: { fStruct: makeTree33, options: { fContent: contentRootExtralong } },
		20: { fStruct: () => makeSimpleTree(3), options: { fContent: contentRootExtralong } },
		21: {
			fStruct: makeTree33, options: {
				params: {
					'_1': { bg: 'black', orientation: 'v' },
					'_4': { bg: 'inherit', orientation: 'v' }
				}
			}
		},
		22: { fStruct: makeTree33, options: { fContent: contentRootExtralong, params: { '_1': { orientation: 'v' } } } },
		23: { fStruct: makeTree33, options: { fContent: contentRootExtralong, params: { '_4': { orientation: 'v' } } } },
	},
	4: {
		0: { fStruct: makeSimplestTree, options: { fContent: n => n.uid == '_1' ? 'random' : n.uid, positioning: 'random' } },
		1: { fStruct: makeSimpleTree, options: { fContent: n => n.uid == '_1' ? 'random' : n.uid, positioning: 'random' } },
		2: { fStruct: () => makeSimpleTree(10), options: { fContent: n => n.uid == '_1' ? 'random' : n.uid, positioning: 'random' } },
		3: { fStruct: makeTree33, options: { fContent: n => n.uid == '_1' ? 'random' : n.uid, positioning: 'random' } },
	},
	5: {
		0: { fStruct: makeSimplestTree, options: { fContent: n => n.uid == '_1' ? 'hallo' : n.uid, params: { '_1': { height: 120 } } } },
		1: {
			fStruct: makeSimplestTree, options: {
				fContent: n => n.uid == '_1' ? { first: '1', uid: n.uid } : n.uid,
				params: { '_1': { bg: 'blue', 'text-align': 'center', width: 100, height: 120 } }
			}
		},
	},
	6: {
		41: {
			fStruct: () => makeTreeNNEach(2, 4), options: {
				params: {
					'_1': { orientation: 'h' },
					'_2': { orientation: 'w', rows: 2, cols: 2 },
					'_7': { orientation: 'w', rows: 2, cols: 2 }
				}
			}
		},
		40: {
			fStruct: () => makeTreeNNEach(1, 4),
			options: {
				params:
				{
					'_2': { orientation: 'w', rows: 2, cols: 2 }
				}
			}
		},
		39: {
			fStruct: () => makeTreeNNEach(2, 2), options: {
				params: {
					'_2': { orientation: 'w', rows: 1, cols: 2 },
					'_5': { orientation: 'w', rows: 1, cols: 2 }
				}
			}
		},
		38: {
			fStruct: () => makeTreeNNEach(2, 4), options: {
				params: {
					'_2': { orientation: 'w', rows: 2, cols: 2 },
					'_7': { orientation: 'w', rows: 2, cols: 2 }
				}
			}
		},
		37: { fStruct: makeSimpleTree, options: { fType: typePanelInfo, fContent: contentHallo } },
		36: { fStruct: makeSimpleTree, options: { fType: typePanelInfo, fContent: contentHallo, presentationStrategy: 'new' } },
		35: { fStruct: () => makeTreeNN(2, 2), options: { fType: typeEmpty, presentationStrategy: 'new' } },
		34: { fStruct: makeTree33, options: { fType: typeEmpty, presentationStrategy: 'new' } },
		33: { fStruct: makeTree33, options: { fType: typeEmpty, presentationStrategy: 'new', params: { '_1': { orientation: 'v' } } } },
		32: { fStruct: makeTree33, options: { presentationStrategy: 'orig', params: { '_1': { orientation: 'v' } } } },
		31: {
			fStruct: makeTree33, options: {
				fType: typePanelInfo,
				presentationStrategy: 'new',
				params: { '_1': { orientation: 'v' } }
			}
		},
		30: {
			fStruct: makeTree33, options: {
				fType: typeEmpty,
				presentationStrategy: 'rec',
				params: { '_1': { orientation: 'h' } }
			}
		},
		29: { fStruct: makeTree33, options: { params: { '_1': { orientation: 'v' } } } },
		28: { fStruct: () => makeSimpleTree(8), options: { presentationStrategy: 'new', fType: type00flex } },
		27: { fStruct: makeSimplestTree, options: { presentationStrategy: 'new', fType: type00flex } },
		26: { fStruct: makeSimplestTree, options: { presentationStrategy: 'new', fType: typeEmpty } },
		25: { fStruct: makeSimplestTree, options: { presentationStrategy: 'new' } },
		24: { fStruct: makeSimplestTree, options: undefined },
		23: { fStruct: makeSimplestTree, options: { presentationStrategy: 'orig' } },
		22: { fStruct: makeSimplestTree, options: { fType: typeEmpty } },
		21: { fStruct: () => makeHugeBoardInBoardOld(25, 5), options: { fContent: contentNoParentContent } },
		20: { fStruct: () => makeHugeBoardInBoard(25, 5), options: { fContent: contentNoParentContent } },
		19: { fStruct: () => makeHugeBoardInBoard(40, 5), options: { fContent: contentNoParentContent } },
		18: { fStruct: () => makeHugeBoardInBoard(4, 2), options: { fContent: contentNoParentContent } },
		17: { fStruct: () => makeTreeNNEach(2, 4), options: { fContent: contentNoParentContent, params: { '_1': { orientation: 'w', rows: 1, cols: 2 }, '_2': { contentwalign: 'center', contenthalign: 'center' }, '_7': { contentwalign: 'center', orientation: 'w', rows: 2, cols: 2 } } } },
		16: {
			fStruct: () => makeTreeNNEach(2, 4), options: {
				fContent: contentRootExtralong,
				params: {
					'_1': { orientation: 'w', rows: 1, cols: 2 },
					'_2': { contenthalign: 'center' },
					'_7': { contentwalign: 'center', orientation: 'w', rows: 2, cols: 2 }
				}
			}
		},
		15: {
			fStruct: () => makeTreeNNEach(2, 4), options: {
				params: {
					'_1': { orientation: 'w', rows: 1, cols: 2 },
					'_7': { orientation: 'w', rows: 2, cols: 2 }
				}
			}
		},
		14: { fStruct: () => makeTreeNN(2, 4), options: { fContent: contentNoParentContentRootExtralong, params: { '_1': { orientation: 'w', rows: 1, cols: 2 }, '_2': { orientation: 'w', rows: 2, cols: 2 } } } },
		13: { fStruct: () => makeTreeNN(2, 4), options: { params: { '_1': { orientation: 'w', rows: 1, cols: 2 }, '_2': { orientation: 'w', rows: 2, cols: 2 } } } },
		12: { fStruct: () => makeTreeNN(2, 4), options: { fContent: contentNoParentContent, params: { '_1': { orientation: 'w', rows: 1, cols: 2 }, '_2': { orientation: 'w', rows: 2, cols: 2 } } } },
		11: { fStruct: () => makeSimpleTree(3), options: { fContent: contentRootExtralong, params: { '_1': { orientation: 'w', rows: 3, cols: 1 } } } },
		10: { fStruct: () => makeSimpleTree(3), options: { params: { '_1': { orientation: 'w', rows: 3, cols: 1 } } } },
		9: { fStruct: () => makeSimpleTree(3), options: { fContent: contentNoParentContent, params: { '_1': { orientation: 'w', rows: 3, cols: 1 } } } },
		8: { fStruct: () => makeSimpleTree(2), options: { fContent: contentRootExtralong, params: { '_1': { orientation: 'w', rows: 2, cols: 1 } } } },
		7: { fStruct: () => makeSimpleTree(2), options: { params: { '_1': { orientation: 'w', rows: 2, cols: 1 } } } },
		6: { fStruct: () => makeSimpleTree(2), options: { fContent: contentNoParentContent, params: { '_1': { orientation: 'w', rows: 2, cols: 1 } } } },
		5: { fStruct: () => makeSimpleTree(4), options: { fContent: contentRootExtralong, params: { '_1': { orientation: 'w', rows: 2, cols: 2 } } } },
		4: { fStruct: () => makeSimpleTree(4), options: { params: { '_1': { orientation: 'w', rows: 2, cols: 2 } } } },
		3: { fStruct: () => makeSimpleTree(2), options: { fContent: contentRootExtralong } },
		2: { fStruct: () => makeSimpleTree(2), options: { positioning: 'regular', fContent: contentRootExtralong } },
		1: { fStruct: () => makeSimpleTree(20), options: { positioning: 'regular' } },
		0: { fStruct: () => makeSimpleTree(4), options: { fContent: n => n.uid == '_1' ? 'board' : n.uid, positioning: 'regular' } },
	},
	7: {
		0: { fStruct: makeSimpleTree, options: { autoType: 'cssEmpty', fContent: contentNoParentContent } },
	},
};
const ALLTESTSOLUTIONS = {
	0: {},
	1: { "0": { "_1": { "w": 23, "h": 120 }, "_2": { "w": 19, "h": 19 } }, "1": { "_1": { "w": 104, "h": 120 }, "_2": { "w": 19, "h": 19 } }, "2": { "_1": { "w": 104, "h": 120 }, "_2": { "w": 19, "h": 19 }, "_3": { "w": 19, "h": 19 } }, "3": { "_1": { "w": 104, "h": 120 }, "_2": { "w": 19, "h": 19 }, "_3": { "w": 19, "h": 19 } }, "4": { "_1": { "w": 27, "h": 145 }, "_2": { "w": 23, "h": 19 }, "_3": { "w": 23, "h": 19 }, "_4": { "w": 23, "h": 82 }, "_5": { "w": 19, "h": 19 }, "_6": { "w": 19, "h": 19 }, "_7": { "w": 19, "h": 19 } }, "5": { "_1": { "w": 130, "h": 124 }, "_2": { "w": 126, "h": 19 }, "_3": { "w": 126, "h": 19 }, "_4": { "w": 126, "h": 61 }, "_5": { "w": 44, "h": 40 }, "_8": { "w": 19, "h": 19 }, "_9": { "w": 19, "h": 19 }, "_6": { "w": 19, "h": 40 }, "_7": { "w": 54, "h": 40 }, "_10": { "w": 24, "h": 19 }, "_11": { "w": 23, "h": 19 } }, "6": { "_1": { "w": 104, "h": 145 }, "_2": { "w": 19, "h": 124 }, "_3": { "w": 19, "h": 124 }, "_4": { "w": 58, "h": 124 }, "_5": { "w": 54, "h": 40 }, "_8": { "w": 19, "h": 19 }, "_9": { "w": 19, "h": 19 }, "_6": { "w": 54, "h": 19 }, "_7": { "w": 54, "h": 40 }, "_10": { "w": 24, "h": 19 }, "_11": { "w": 23, "h": 19 } } },
	2: { "0": { "_1": { "w": 69, "h": 103 }, "_2": { "w": 19, "h": 82 }, "_3": { "w": 19, "h": 82 }, "_4": { "w": 23, "h": 82 }, "_5": { "w": 19, "h": 19 }, "_6": { "w": 19, "h": 19 }, "_7": { "w": 19, "h": 19 } }, "1": { "_1": { "w": 69, "h": 103 }, "_2": { "w": 19, "h": 82 }, "_3": { "w": 19, "h": 82 }, "_4": { "w": 23, "h": 82 }, "_5": { "w": 19, "h": 19 }, "_6": { "w": 19, "h": 19 }, "_7": { "w": 19, "h": 19 } }, "2": { "_1": { "w": 69, "h": 103 }, "_2": { "w": 65, "h": 19 }, "_3": { "w": 65, "h": 19 }, "_4": { "w": 65, "h": 40 }, "_5": { "w": 19, "h": 19 }, "_6": { "w": 19, "h": 19 }, "_7": { "w": 19, "h": 19 } }, "3": { "_1": { "w": 69, "h": 103 }, "_2": { "w": 65, "h": 19 }, "_3": { "w": 65, "h": 19 }, "_4": { "w": 65, "h": 40 }, "_5": { "w": 19, "h": 19 }, "_6": { "w": 19, "h": 19 }, "_7": { "w": 19, "h": 19 } }, "4": { "_1": { "w": 27, "h": 145 }, "_2": { "w": 23, "h": 19 }, "_3": { "w": 23, "h": 19 }, "_4": { "w": 23, "h": 82 }, "_5": { "w": 19, "h": 19 }, "_6": { "w": 19, "h": 19 }, "_7": { "w": 19, "h": 19 } }, "5": { "_1": { "w": 130, "h": 124 }, "_2": { "w": 126, "h": 19 }, "_3": { "w": 126, "h": 19 }, "_4": { "w": 126, "h": 61 }, "_5": { "w": 44, "h": 40 }, "_8": { "w": 19, "h": 19 }, "_9": { "w": 19, "h": 19 }, "_6": { "w": 19, "h": 40 }, "_7": { "w": 54, "h": 40 }, "_10": { "w": 24, "h": 19 }, "_11": { "w": 23, "h": 19 } }, "6": { "_1": { "w": 104, "h": 145 }, "_2": { "w": 19, "h": 124 }, "_3": { "w": 19, "h": 124 }, "_4": { "w": 58, "h": 124 }, "_5": { "w": 54, "h": 40 }, "_8": { "w": 19, "h": 19 }, "_9": { "w": 19, "h": 19 }, "_6": { "w": 54, "h": 19 }, "_7": { "w": 54, "h": 40 }, "_10": { "w": 24, "h": 19 }, "_11": { "w": 23, "h": 19 } }, "7": { "_1": { "w": 146, "h": 103 }, "_2": { "w": 19, "h": 82 }, "_3": { "w": 19, "h": 82 }, "_4": { "w": 100, "h": 82 }, "_5": { "w": 44, "h": 61 }, "_8": { "w": 19, "h": 19 }, "_9": { "w": 19, "h": 19 }, "_6": { "w": 19, "h": 61 }, "_7": { "w": 28, "h": 61 }, "_10": { "w": 24, "h": 19 }, "_11": { "w": 24, "h": 19 } } },
	3: { "0": { "_1": { "w": 69, "h": 103 }, "_2": { "w": 19, "h": 82 }, "_3": { "w": 19, "h": 82 }, "_4": { "w": 23, "h": 82 }, "_5": { "w": 19, "h": 19 }, "_6": { "w": 19, "h": 19 }, "_7": { "w": 19, "h": 19 } }, "1": { "_1": { "w": 69, "h": 103 }, "_2": { "w": 19, "h": 82 }, "_3": { "w": 19, "h": 82 }, "_4": { "w": 23, "h": 82 }, "_5": { "w": 19, "h": 19 }, "_6": { "w": 19, "h": 19 }, "_7": { "w": 19, "h": 19 } }, "2": { "_1": { "w": 69, "h": 103 }, "_2": { "w": 65, "h": 19 }, "_3": { "w": 65, "h": 19 }, "_4": { "w": 65, "h": 40 }, "_5": { "w": 19, "h": 19 }, "_6": { "w": 19, "h": 19 }, "_7": { "w": 19, "h": 19 } }, "3": { "_1": { "w": 69, "h": 103 }, "_2": { "w": 65, "h": 19 }, "_3": { "w": 65, "h": 19 }, "_4": { "w": 65, "h": 40 }, "_5": { "w": 19, "h": 19 }, "_6": { "w": 19, "h": 19 }, "_7": { "w": 19, "h": 19 } }, "4": { "_1": { "w": 27, "h": 145 }, "_2": { "w": 23, "h": 19 }, "_3": { "w": 23, "h": 19 }, "_4": { "w": 23, "h": 82 }, "_5": { "w": 19, "h": 19 }, "_6": { "w": 19, "h": 19 }, "_7": { "w": 19, "h": 19 } }, "5": { "_1": { "w": 130, "h": 124 }, "_2": { "w": 126, "h": 19 }, "_3": { "w": 126, "h": 19 }, "_4": { "w": 126, "h": 61 }, "_5": { "w": 44, "h": 40 }, "_8": { "w": 19, "h": 19 }, "_9": { "w": 19, "h": 19 }, "_6": { "w": 19, "h": 40 }, "_7": { "w": 54, "h": 40 }, "_10": { "w": 24, "h": 19 }, "_11": { "w": 23, "h": 19 } }, "6": { "_1": { "w": 104, "h": 145 }, "_2": { "w": 19, "h": 124 }, "_3": { "w": 19, "h": 124 }, "_4": { "w": 58, "h": 124 }, "_5": { "w": 54, "h": 40 }, "_8": { "w": 19, "h": 19 }, "_9": { "w": 19, "h": 19 }, "_6": { "w": 54, "h": 19 }, "_7": { "w": 54, "h": 40 }, "_10": { "w": 24, "h": 19 }, "_11": { "w": 23, "h": 19 } }, "7": { "_1": { "w": 146, "h": 103 }, "_2": { "w": 19, "h": 82 }, "_3": { "w": 19, "h": 82 }, "_4": { "w": 100, "h": 82 }, "_5": { "w": 44, "h": 61 }, "_8": { "w": 19, "h": 19 }, "_9": { "w": 19, "h": 19 }, "_6": { "w": 19, "h": 61 }, "_7": { "w": 28, "h": 61 }, "_10": { "w": 24, "h": 19 }, "_11": { "w": 24, "h": 19 } }, "8": { "_1": { "w": 94, "h": 166 }, "_2": { "w": 19, "h": 145 }, "_3": { "w": 19, "h": 145 }, "_4": { "w": 48, "h": 145 }, "_5": { "w": 44, "h": 40 }, "_8": { "w": 19, "h": 19 }, "_9": { "w": 19, "h": 19 }, "_6": { "w": 44, "h": 19 }, "_7": { "w": 44, "h": 61 }, "_10": { "w": 24, "h": 19 }, "_11": { "w": 24, "h": 19 } }, "9": { "_1": { "w": 23, "h": 40 }, "_2": { "w": 19, "h": 19 } }, "10": { "_1": { "w": 23, "h": 23 }, "_2": { "w": 19, "h": 19 } }, "11": { "_1": { "w": 44, "h": 40 }, "_2": { "w": 19, "h": 19 }, "_3": { "w": 19, "h": 19 } }, "12": { "_1": { "w": 23, "h": 61 }, "_2": { "w": 19, "h": 19 }, "_3": { "w": 19, "h": 19 } }, "13": { "_1": { "w": 44, "h": 23 }, "_2": { "w": 19, "h": 19 }, "_3": { "w": 19, "h": 19 } }, "14": { "_1": { "w": 111, "h": 44 }, "_2": { "w": 19, "h": 40 }, "_3": { "w": 19, "h": 40 }, "_4": { "w": 65, "h": 40 }, "_5": { "w": 19, "h": 19 }, "_6": { "w": 19, "h": 19 }, "_7": { "w": 19, "h": 19 } }, "15": { "_1": { "w": 172, "h": 82 }, "_2": { "w": 19, "h": 61 }, "_3": { "w": 19, "h": 61 }, "_4": { "w": 126, "h": 61 }, "_5": { "w": 44, "h": 40 }, "_8": { "w": 19, "h": 19 }, "_9": { "w": 19, "h": 19 }, "_6": { "w": 19, "h": 40 }, "_7": { "w": 54, "h": 40 }, "_10": { "w": 24, "h": 19 }, "_11": { "w": 23, "h": 19 } }, "16": { "_1": { "w": 172, "h": 65 }, "_2": { "w": 19, "h": 61 }, "_3": { "w": 19, "h": 61 }, "_4": { "w": 126, "h": 61 }, "_5": { "w": 44, "h": 40 }, "_8": { "w": 19, "h": 19 }, "_9": { "w": 19, "h": 19 }, "_6": { "w": 19, "h": 40 }, "_7": { "w": 54, "h": 40 }, "_10": { "w": 24, "h": 19 }, "_11": { "w": 23, "h": 19 } }, "17": { "_1": { "w": 490, "h": 23 }, "_2": { "w": 19, "h": 19 }, "_3": { "w": 19, "h": 19 }, "_4": { "w": 19, "h": 19 }, "_5": { "w": 19, "h": 19 }, "_6": { "w": 19, "h": 19 }, "_7": { "w": 19, "h": 19 }, "_8": { "w": 19, "h": 19 }, "_9": { "w": 19, "h": 19 }, "_10": { "w": 24, "h": 19 }, "_11": { "w": 23, "h": 19 }, "_12": { "w": 24, "h": 19 }, "_13": { "w": 24, "h": 19 }, "_14": { "w": 24, "h": 19 }, "_15": { "w": 24, "h": 19 }, "_16": { "w": 24, "h": 19 }, "_17": { "w": 24, "h": 19 }, "_18": { "w": 24, "h": 19 }, "_19": { "w": 24, "h": 19 }, "_20": { "w": 24, "h": 19 }, "_21": { "w": 24, "h": 19 } }, "18": { "_1": { "w": 196, "h": 40 }, "_2": { "w": 19, "h": 19 } }, "19": { "_1": { "w": 196, "h": 61 }, "_2": { "w": 19, "h": 40 }, "_3": { "w": 19, "h": 40 }, "_4": { "w": 65, "h": 40 }, "_5": { "w": 19, "h": 19 }, "_6": { "w": 19, "h": 19 }, "_7": { "w": 19, "h": 19 } }, "20": { "_1": { "w": 196, "h": 40 }, "_2": { "w": 19, "h": 19 }, "_3": { "w": 19, "h": 19 }, "_4": { "w": 19, "h": 19 } }, "21": { "_1": { "w": 27, "h": 145 }, "_2": { "w": 23, "h": 19 }, "_3": { "w": 23, "h": 19 }, "_4": { "w": 23, "h": 82 }, "_5": { "w": 19, "h": 19 }, "_6": { "w": 19, "h": 19 }, "_7": { "w": 19, "h": 19 } }, "22": { "_1": { "w": 196, "h": 103 }, "_2": { "w": 65, "h": 19 }, "_3": { "w": 65, "h": 19 }, "_4": { "w": 65, "h": 40 }, "_5": { "w": 19, "h": 19 }, "_6": { "w": 19, "h": 19 }, "_7": { "w": 19, "h": 19 } }, "23": { "_1": { "w": 196, "h": 103 }, "_2": { "w": 19, "h": 82 }, "_3": { "w": 19, "h": 82 }, "_4": { "w": 23, "h": 82 }, "_5": { "w": 19, "h": 19 }, "_6": { "w": 19, "h": 19 }, "_7": { "w": 19, "h": 19 } } },
	4: {},
	5: { "0": { "_1": { "w": 33, "h": 120 }, "_2": { "w": 19, "h": 19 } }, "1": { "_1": { "w": 104, "h": 120 }, "_2": { "w": 19, "h": 19 } } },
	6: {},
	7: { "0": { "_1": { "w": 22, "h": 46 }, "_2": { "w": 22, "h": 23 }, "_3": { "w": 22, "h": 23 } } },
};
const DIBOA = {
	home: { link: "../rechnung/index.html", img: 'home.png', align: 'left', pop: false },
	bill: { link: "../rechnung/index.html", img: 'bill.png', align: 'left', pop: false },
	boa: { link: "", img: 'boa.png', align: 'left', pop: false },
	bw: { link: "../rechnung/bwindex.html", img: 'bwicon.png', align: 'right', pop: true },
	authenticator: { link: "../rechnung/boaa.html", img: 'authenticator.png', align: 'right', pop: true },
	authy: { link: "../rechnung/boaa.html", img: 'authy.png', align: 'right', pop: true },
	onedrive: { link: "../rechnung/boaa.html", img: 'onedrive.png', align: 'right', pop: true },
	skype: {
		link: "../rechnung/boaa.html", img: 'skype.png', align: 'right', pop: false,
		contacts: {
			'Julia Oasis': { date: 'Wed', msg: 'Wow', color: BLUEGREEN },
			'+14778991960': { date: 'Thu', msg: 'Missed Call', color: ORANGE },
		}
	},
	bw_info: {
		boa: { userid: 'gleem@gmail.com', pwd: rPassword(20) },
		authy: { userid: 'gleem@gmail.com', pwd: rPassword(20) },
	},
	boa_data: {
		'AAA-MBNA 5464 3332 3333 5555': { sub: '*5555', logo: 'boa.png' },
		'AMERICAN EXPRESS': { sub: '*4554', logo: 'amex.png' },
		'AT&T Mobility': { sub: '*1331', logo: 'att.png' },
		'AT&T Mobility{AT&T WA}': { sub: '*7575', logo: 'att.png' },
		'AT&T Mobility': { sub: '*8585', logo: 'att.png' },
		'Bank Of Amerika Credit Card': { sub: '*1212', logo: 'boa.png', 'Last Payment': '5-25 $1150.41', brand: 'BofA_rgb' },
		'Bank Of Amerika': { sub: '*0898', logo: 'boa.png' },
		'Bank Of Amerika Mail-in1': { sub: '*6565', logo: 'boa.png' },
		'Bel-Red Oral': { sub: '*2432' },
		'Bellevue Kendo Club': { sub: '*hallo' },
		'CapitalOne': { sub: '*1324', logo: 'capitalOne.png' },
		'CapitalOneVenture': { sub: '*6456', logo: 'capitalOne.png' },
		'CapitalOneVentureF': { sub: '*9789', logo: 'capitalOne.png' },
		'Chase': { sub: '*3131', logo: 'chase.png' },
		'Chase Amazon': { sub: '*0898', 'Last Payment': '5-25 $1150.41', logo: 'chase.png', brand: 'prime' },
		'Chase Card': { sub: '*1432', logo: 'chase.png' },
		'CHASE MANHATTAN BANK-MC': { sub: '*0797', 'Last Payment': '5-25 $110.99', logo: 'chase.png', brand: 'chase_bank' },
		'Chase Sapphire': { sub: '*5132', logo: 'chase.png' },
		'Chase Sapphire': { sub: '*8679', logo: 'chase.png' },
		'City Cards': { sub: '*3124', logo: 'citi.png' },
		'City Cards Divident': { sub: '*9678', logo: 'citi.png' },
		'CITY CARDS Points': { sub: '*7678', logo: 'citi.png' },
		'Citi Costco': { sub: '*8768', 'Last Payment': '6-17 $506.14', logo: 'citi.png', brand: 'citibank' },
		'Citi Costco gu': { sub: '*0890', 'Last Payment': '6-6 $228.92', logo: 'citi.png', brand: 'citibank' },
		'CITI DIVIDENT Platinum': { sub: '*3454', logo: 'citi.png' },
		'CITIBANK VISA NV': { sub: '*7566', logo: 'citi.png' },
		'City of Redmond': { sub: '*4998' },
		'City of Redmond WA': { sub: '*2887', 'Last Payment': '5-17 $214.94', brand: 'redmond' },
		'Comcast': { sub: '*7676', logo: 'comcast.png' },
		'Comcast Perrigo': { sub: '*1324', 'Last Payment': '6-21 $89.44', logo: 'comcast.png', brand: 'comcast' },
		'ComCast WA': { sub: '*6456', logo: 'comcast.png' },
		'DISCOVER CARD SERVICES': { sub: '*8678' },
		'Dr. Ellie Tabaraie': { sub: '*hallo' },
		'Fastenerz.com': { sub: '*000' },
		'Fibonacci': { sub: '*6666' },
		'Fleet Credit Card Service': { sub: '*8798' },
		'FLEET CREDIT CARD0MC/VS (32)': { sub: '*8799' },
		'Frontier': { sub: '*05-5' },
		'Frontier2': { sub: '*5366' },
		'GoodToGo': { sub: '*7767' },
		'Hardford Mutual Funds Inc.': { sub: '*8878' },
		'King County Treasury': { sub: '*0-02' },
		'King County Treasury': { sub: '*0-03' },
		'LabCorp': { sub: '*8899' },
		'Landover Mortgage': { sub: '*hallo' },
		'Lauren Magada': { sub: 'Lauren boa' },
		'Lederman&Pulman': { sub: '*9988' },
		'Liberty Mutual Group': { sub: '*-660' },
		'Liberty Mutual Group': { sub: '*-768' },
		'Liberty Mutual Group': { sub: '*-760' },
		"Macy's Star Rewards": { sub: '*23-0', logo: 'macys.png' },
		'MBNA': { sub: '*3444' },
		'MBNA 6455 6677 7924 5555': { sub: '*5555' },
		'Oachita': { sub: '*6556' },
		'Oasis Condominium CA': { sub: '*889' },
		'Oasis Condominium CA': { sub: '*1889', 'Last Payment': '5-31 $581.54', brand: 'oasis' },
		'Orthodontics Roos': { sub: '*1111' },
		'Overcast Law Office, PS': { sub: '*4423' },
		'Overlake Medical Center': { sub: '*hallo' },
		'Pediatric Associates Inc': { sub: '*8383' },
		'Perrigo Heights HOA': { sub: '*t#98' },
		'Premier Periodontics': { sub: '*9494' },
		'PreventionMD': { sub: '*9566' },
		'Prime Trust LLC': { sub: '*8788' },
		'ProSport': { sub: '*1233' },
		'PSE - Puget Sound Energy': { sub: '*3444', 'Last Payment': '5-25 $70.59', brand: 'PSE' },
		'Puget Sound Energy': { sub: '*66-9' },
		'Real Property Management Eclipse': { sub: '*asss' },
		'Remadina Ridge Family Dentistry': { sub: '*6656' },
		'Sewage Capacity Charge': { sub: '*7575' },
		'Silkroad': { sub: '*788-1' },
		'Suhrco': { sub: '*899' },
		'Target': { sub: '*9789' },
		'Target National Bank': { sub: '*1432' },
		'Univerity Of WA Medical Center': { sub: '*1543' },
		'US Bank Credit Card FlexPerks': { sub: '*0789', 'Last Payment': '5-20 $11.13', brand: 'usbank' },
		'USBank': { sub: '*7567' },
		'USBank-CashPlus': { sub: '*3123' },
		'USBank-FlexPerks': { sub: '*1321' },
		'Verizon': { sub: '*7567' },
		'Waste Management': { sub: '*87-1' },
		'Waste Management': { sub: '*23-9' },
		'Wells Fargo Home Mortgage': { sub: '*1333', 'Last Payment': '6-10 $1625.06', logo: 'wellsfargo.png', brand: 'wellsfargo' },
		'Wells Fargo Mortgage': { sub: '*2444', logo: 'wellsfargo.png' },
		'Williams-Sonoma': { sub: '*9888' },
		'WINDERMERE PROPERTY MGMT/EASTSID': { sub: '*8766' },
		'Windermere Real Estate/East': { sub: '*ntal' },
	}
};
var BG_CARD_BACK = randomColor();
var dSettings = mBy('dSettings');
const SHAPEFUNCS = { 'circle': agCircle, 'hex': agHex, 'rect': agRect, };


