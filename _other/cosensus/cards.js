
function ari_get_card(ckey, h, w, ov = .2) {
	let type = ckey[2];

	let info = type == 'n' ? to_aristocard(ckey) : type == 'l' ? to_luxurycard(ckey) : to_commissioncard(ckey); // ari_get_cardinfo(ckey);
	//console.log('ckey', ckey, info, get_keys(C52));
	let svgCode = C52[info.c52key]; //C52 is cached asset loaded in _start
	// console.log(cardKey, C52[cardKey])
	svgCode = '<div>' + svgCode + '</div>';
	let el = mCreateFrom(svgCode);
	//console.log('el',el)
	h = valf(h, valf(info.h, 100));
	w = valf(w, h * .7);
	//[w, h] = [isdef(w) ? w : isdef(info.w) ? info.w : Card.w, isdef(h) ? h : isdef(info.h) ? info.h : Card.sz];
	mSize(el, w, h);
	let res = {};
	copyKeys(info, res);
	copyKeys({ w: w, h: h, faceUp: true, div: el }, res);
	if (isdef(ov)) res.ov = ov;
	return res;

}
function create_card_assets_c52() {
	let ranknames = { A: 'Ace', K: 'King', T: '10', J: 'Jack', Q: 'Queen' };
	let suitnames = { S: 'Spades', H: 'Hearts', C: 'Clubs', D: 'Diamonds' };
	let rankstr = '23456789TJQKA';
	let suitstr = 'SHDC';
	sz = 100;
	let di = {};
	for (const r of toLetters(rankstr)) {
		for (const s of toLetters(suitstr)) {
			let k = r + s;
			let info = di[k] = { key: k, val: 1, irank: rankstr.indexOf(r), isuit: suitstr.indexOf(s), rank: r, suit: s, color: RED, c52key: 'card_' + r + s, w: sz * .7, h: sz, sz: sz, ov: .25, friendly: `${isNumber(r) ? r : ranknames[r]} of ${suitnames[s]}`, short: `${r}${s}` };
			info.isort = info.isuit * 13 + info.irank;
		}
	}
	C52Cards = di;
	return di;
}
function ui_type_building(b, dParent, styles = {}, path = 'farm', title = '', get_card_func = ari_get_card) {

	let cont = ui_make_container(dParent, get_container_styles(styles));
	let cardcont = mDiv(cont);

	let list = b.list;
	//console.log('list', list)
	//let n = list.length;
	let d = mDiv(dParent);
	let items = list.map(x => get_card_func(x));
	// let cont = ui_make_hand_container(items, d, { maleft: 12, padding: 4 });

	let schwein = null;
	for (let i = 1; i < items.length; i++) {
		let item = items[i];
		if (b.schwein != item.key) face_down(item); else schwein = item;
	}

	let d_harvest = null;
	if (isdef(b.h)) {
		let keycard = items[0];
		let d = iDiv(keycard);
		mStyle(d, { position: 'relative' });
		d_harvest = mDiv(d, { position: 'absolute', w: 20, h: 20, bg: 'orange', opacity: .5, fg: 'black', top: '45%', left: -10, rounding: '50%', align: 'center' }, null, 'H');
	}

	let card = isEmpty(items) ? { w: 1, h: 100, ov: 0 } : items[0];
	//console.log('card',card)
	mContainerSplay(cardcont, 2, card.w, card.h, items.length, card.ov * card.w);
	ui_add_cards_to_hand_container(cardcont, items, list);

	ui_add_container_title(title, cont, items);

	// if (isdef(title) && !isEmpty(items)) { mText(title, d); }

	return {
		ctype: 'hand',
		list: list,
		path: path,
		container: cont,
		cardcontainer: cardcont,
		items: items,
		schwein: schwein,
		harvest: d_harvest,
		keycard: items[0],

	};
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

		//make items
		let n = Math.min(2, list.length); let ct = get_card_func(list[0]); items.push(ct); if (n > 1) { let cb = get_card_func(arrLast(list)); items.push(cb); }
		mStyle(cardcont, { position: 'relative', wmin: ct.w + 8 });

		//append in umgekehrter reihenfolge!?
		for (let i = items.length - 1; i >= 0; i--) { let x = items[i]; face_down(x); mAppend(cardcont, iDiv(x)); mStyle(iDiv(x), { position: 'absolute', top: 0, left: 0 }) }
		// (old code) mContainerSplay(cont, 4, ct.w, ct.h, list.length, 0); // ui_add_cards_to_deck_container(cont, items);
		mText(list.length, iDiv(ct), { position: 'absolute', left: '25%', top: 10, fz: ct.h / 3 }); //add number of cards in deck to top card
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

	//copyKeys({wmin:500,bg:'red'},styles); //testing wmin
	let cont = ui_make_container(dParent, get_container_styles(styles));

	//mStyle(cont,{bg:'lime'})

	let items = list.map(x => get_card_func(x));

	let cardcont = mDiv(cont);
	//if (!isEmpty(items)) {
	let card = isEmpty(items) ? { w: 1, h: 100, ov: 0 } : items[0];
	//console.log('card',card)
	mContainerSplay(cardcont, 2, card.w, card.h, items.length, card.ov * card.w);
	ui_add_cards_to_hand_container(cardcont, items, list);
	//}
	ui_add_container_title(title, cont, items, show_if_empty);

	//console.log('hand container',cont, cardcont)

	return {
		ctype: 'hand',
		list: list,
		path: path,
		container: cont,
		cardcontainer: cardcont,
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

	//styles.padding = 25;
	let cont = ui_make_container(dParent, get_container_styles(styles));
	let cardcont = mDiv(cont, { display: 'flex' });

	let items = [];
	for (const o of list) {
		let d = mDiv(cardcont, { display: 'flex', dir: 'c', padding: 1, fz: 12, align: 'center', position: 'relative' });
		let c = get_card_func(o.key);
		mAppend(d, iDiv(c));
		remove_card_shadow(c);
		//set_card_style(c, { shadow:'blue' });  //bg: 'orange', fg:'red' }, null);
		// set_card_style(c, { border: '2px solid grey', rounding: 4, h: 25, w: 12 }, null);
		d.innerHTML += `<span style="font-weight:bold">${o.count}</span>`;
		let item = { card: c, count: o.count, div: d };
		items.push(item);
	}

	//items.map(x => mAppend(cardcont, iDiv(x)));
	ui_add_container_title(title, cont, items, show_if_empty);

	return {
		list: list,
		path: path,
		container: cont,
		cardcontainer: cardcont,
		items: items,
	}
}

//#region helpers
function add_a_correct_building_to(fen, uname, type) {
	let ranks = lookupSet(DA, ['test', 'extra', 'ranks'], 'A23456789TJQK');
	if (ranks.length <= 0) {
		console.log('===>ranks empty!', ranks)
		ranks = lookupSetOverride(DA, ['test', 'extra', 'ranks'], 'A23456789TJQK');
	}
	let r = ranks[0]; lookupSetOverride(DA, ['test', 'extra', 'ranks'], ranks.substring(1));
	let keys = [`${r}Sn`, `${r}Hn`, `${r}Cn`, `${r}Dn`];
	if (type != 'farm') keys.push(`${r}Cn`); if (type == 'chateau') keys.push(`${r}Hn`);
	fen.players[uname].buildings[type].push({ list: keys, h: null });

	//console.log('keys', keys);
}
function add_a_schwein(fen, uname) {
	let type = rChoose(['farm', 'estate', 'chateau']);
	let keys = deck_deal(fen.deck, type[0] == 'f' ? 4 : type[0] == 'e' ? 5 : 6);
	fen.players[uname].buildings[type].push({ list: keys, h: null });
}
function get_container_styles(styles = {}) { let defaults = valf(Config.ui.container, {}); defaults.position = 'relative'; addKeys(defaults, styles); return styles; }
function get_containertitle_styles(styles = {}) { let defaults = valf(Config.ui.containertitle, {}); defaults.position = 'absolute'; addKeys(defaults, styles); return styles; }
function pop_top(o) {
	if (isEmpty(o.list)) return null;
	let t = o.get_topcard();	//console.log('===>get_topcard:',t.key)
	o.list.shift();
	o.renew(o.list, o.cardcontainer, o.items, o.get_card_func);
	return t;
}
function remove_card_shadow(c) { iDiv(c).firstChild.setAttribute('class', null); }
function set_card_border(item, thickness = 1, color = 'black') {
	//console.log('set_card_border', item, thickness, color);
	let d = iDiv(item);
	let rect = lastDescendantOfType('rect', d);
	assertion(rect, 'NO RECT FOUND IN ELEM', d);
	if (rect) {
		rect.setAttribute('stroke-width', thickness);
		rect.setAttribute('stroke', color);
	}
}
function set_card_style(item, styles = {}, className) {
	//console.log('set_card_border', item, thickness, color);
	let d = iDiv(item);
	let svg = findDescendantOfType('svg', d);
	let rect = findDescendantOfType('rect', svg);

	//shadow style will be applied to svg!
	if (isdef(styles.shadow)) {
		let shadow = styles.shadow;
		delete styles.shadow;
		let hexcolor = colorFrom(styles.shadow);
		svg.style.filter = `drop-shadow(4px 5px 2px ${hexcolor})`;
	}
	if (isdef(styles.bg)) {

	}

	assertion(rect, 'NO RECT FOUND IN ELEM', d);
	mStyle(d, styles);
	if (isdef(className)) mClass(svg, className);
}
function set_card_style_works(c, styles, className) {
	let d = iDiv(c);
	mStyle(d, styles);
	d.firstChild.setAttribute('class', className);
}
function sort_cards(hand, bySuit = true, suits = 'CDHS', byRank = true, rankstr = '23456789TJQKA') {
	if (bySuit && byRank) {
		let buckets = arrBuckets(hand,x=>x[1],suits);
		//console.log('buckets',buckets);
		for(const b of buckets){sort_cards(b.list,false,null,true,rankstr);} //sort each bucket by rank!
		hand.length = 0;	buckets.map(x=>x.list.map(y=>hand.push(y))); //aggregate buckets to form hand
	} else if (bySuit) hand.sort((a, b) => suits.indexOf(a[1]) - suits.indexOf(b[1])); //.charCodeAt(1)-b.charCodeAt(1)); 
	else if (byRank) hand.sort((a, b) => rankstr.indexOf(a[0]) - rankstr.indexOf(b[0]));
	return hand;
}
function spread_hand(path, ov) {
	//console.log('path',path)
	let hand = lookup(UI, path.split('.')); 
	//if (hand && isdef(hand.list)) hand = hand.list;
	//console.log('hand',hand)

	assertion(hand, 'hand does NOT exist', path);
	if (hand.ctype != 'hand') return;
	if (isEmpty(hand.items)) return;

	//console.log('hand UI', hand);
	let card = hand.items[0];
	if (nundef(ov)) ov = card.ov;
	if (hand.ov == ov) return;
	hand.ov = ov;
	let cont = hand.cardcontainer;
	let items = hand.items;
	mContainerSplay(cont, 2, card.w, card.h, items.length, ov * card.w);

	//clearElement(container);
	//items.map(x => ui_add_cards_to_hand_container(container, items));
}
function to_aristocard(ckey, color = RED, sz = 100, w) {
	let info = jsCopy(C52Cards[ckey.substring(0, 2)]);
	info.key = ckey;
	info.cardtype = ckey[2];
	let [r, s] = [info.rank, info.suit];
	info.val = r == 'A' ? 1 : 'TJQK'.includes(r) ? 10 : Number(r);
	info.color = color;
	info.sz = info.h = sz;
	info.w = valf(w, sz * .7);
	info.irank = 'A23456789TJQK'.indexOf(r);
	info.isuit = 'SHCD'.indexOf(s);
	info.isort = info.isuit * 13 + info.irank;
	return info;
}
function to_luxurycard(ckey, color = 'gold', sz = 100, w) { return to_aristocard(ckey, color); }
function to_commissioncard(ckey, color = GREEN, sz = 40, w) { return to_aristocard(ckey, color, sz); }
function ui_add_container_title(title, cont, items, show_if_empty) {
	if (isdef(title) && (!isEmpty(items) || show_if_empty)) {
		//size container at least as wide as title needs!
		let st = get_containertitle_styles();
		let stmeasure = jsCopy(st); delete stmeasure.position;

		let elem = mText(title, cont, stmeasure);
		let sz = getSizeNeeded(elem);

		//if (show_if_empty) console.log('*** szNeeded=', title, sz);

		let offsetx = valf(st.left, 0);
		let cont_wmin = mGetStyle(cont, 'wmin');
		let my_min = sz.w + offsetx * 1.5;
		//console.log('container min-width:', cont_wmin);
		let wmin = !isNumber(cont_wmin) ? my_min : Math.max(valf(cont_wmin, 0), my_min);

		//console.log('offsetx',offsetx,st.left,sz.w,cont_wmin);
		//if (show_if_empty) console.log('*** wmin=', wmin);

		mStyle(cont, { wmin: wmin });
		mStyle(elem, st);
	}

}
function ui_make_container(dParent, styles = { bg: 'random', padding: 10 }) {
	let id = getUID('u');
	let d = mDiv(dParent, styles, id);
	return d;
}
function ui_make_hand_container(items, dParent, styles = { bg: 'random', padding: 10 }) {
	let id = getUID('u');
	let d = mDiv(dParent, styles, id);
	if (!isEmpty(items)) {
		let card = items[0];
		//console.log('card',card)
		mContainerSplay(d, 2, card.w, card.h, items.length, card.ov * card.w);
	}

	return d;
}
function ui_add_cards_to_hand_container(cont, items, list) {
	//make 1 card
	if (nundef(list)) list = items.map(x => x.key);
	for (const item of items) {
		mAppend(cont, iDiv(item));
		mItemSplay(item, list, 2, Card.ovw);
	}
}
function ui_make_deck_container(list, dParent, styles = { bg: 'random', padding: 10 }, get_card_func) {
	let id = getUID('u'); // 'deck_cont'; //getUID('u');
	let d = mDiv(dParent, styles, id);
	if (isEmpty(list)) return d;
	let c = get_card_func(list[0]);
	mContainerSplay(d, 4, c.w, c.h, n, 0);

	return d;
}
function ui_add_cards_to_deck_container(cont, items, list) {
	//make 1 card
	if (nundef(list)) list = items.map(x => x.key);
	for (const item of items) {
		mAppend(cont, iDiv(item));
		mItemSplay(item, list, 4, Card.ovdeck);
		face_down(item);
	}
	return items[0];
}






















