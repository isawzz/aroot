function set_card_style(c,styles,className){
	let d=iDiv(c);
	mStyle(d,styles);
	d.firstChild.setAttribute('class',className);
}


function ui_type_building(b, dParent, path, title) {
	let list = b.list;
	let n = list.length;
	let d = mDiv(dParent);
	let cont = ui_make_hand_container(n, d, { maleft: 12, padding: 4 });

	let items = list.map(x => ari_get_card(x));
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

	ui_add_cards_to_hand_container(cont, items, list);

	if (isdef(title) && !isEmpty(items)) { mText(title, d); }

	return {
		list: list,
		path: path,
		container: cont,
		items: items,
		schwein: schwein,
		harvest: d_harvest,
		keycard: items[0],

	};
}
function ui_type_deck(list, dParent, path, title) {
	let n = list.length;
	let cont = ui_make_deck_container(n, dParent, { maleft: 25, padding: 14 });
	let items = list.map(x => ari_get_card(x));
	let topmost = ui_add_cards_to_deck_container(cont, items, list);

	if (isdef(title) && !isEmpty(items)) { mStyle(cont, { position: 'relative' }); mText(title, cont, { position: 'absolute', bottom: 4, left: 4 }); }

	return {
		type: 'deck',
		list: list,
		path: path,
		container: cont,
		items: items,
		topmost: topmost,
	};
}
function ui_type_hand(list, dParent, path, title) {
	let n = list.length;
	let d = mDiv(dParent);
	let cont = ui_make_hand_container(n, d, { padding: 4 });

	let items = list.map(x => ari_get_card(x));

	ui_add_cards_to_hand_container(cont, items, list);

	if (isdef(title) && !isEmpty(items)) { mText(title, d); }

	return {
		list: list,
		path: path,
		container: cont,
		items: items,
	};
}
function ui_type_market(list, dParent, path, title) {
	let n = list.length;
	let cont = ui_make_container(dParent, { padding: 4, display: 'flex' });
	let items = list.map(x => ari_get_card(x));
	if (n > 0) ui_add_cards_to_card_container(cont, items, list);

	if (isdef(title) && !isEmpty(items)) { mStyle(cont, { position: 'relative', hmin: 130 }); mText(title, cont, { position: 'absolute', bottom: 8, left: 4 }); }

	return {
		list: list,
		path: path,
		container: cont,
		items: items,
	};
}
function ui_type_rank_count(list, dParent, path, title) {

	let hItem = Card.sz;
	let hCont = hItem;
	let cont = mDiv(dParent,{h:hCont,gap:4,display:'flex'}); //mCenterFlex(cont);

	let items = [];// arrZip(cards,list);
	for(const o of list){
		let d =mDiv(dParent, { display: 'flex', dir: 'c', fz: 12, align: 'center', position: 'relative' }); 
		let c = ari_get_card(o.rank + 'S' + 'p'); //, 50,35);
		set_card_style(c,{border:'2px solid grey',rounding:4,h:45,w:28},null);
		mAppend(d,iDiv(c));
		d.innerHTML += `<span>${o.count}</span>`;

		let item = {card:c,count:o.count,div:d};

		items.push(item);
	}

	items.map(x=>mAppend(cont,iDiv(x)));

	if (isdef(title) && !isEmpty(items)) { mStyle(cont, { position: 'relative', hmin: hCont }); mText(title, cont, { position: 'absolute', bottom: 8, left: 4 }); }

	return {
		list: list,
		path: path,
		container: cont,
		items: items,
	}
}


function ui_make_container(dParent, styles = { bg: 'random', padding: 10 }) {
	let id = getUID('u');
	let d = mDiv(dParent, styles, id);
	return d;
}
function ui_make_deck_container(n, dParent, styles = { bg: 'random', padding: 10 }) {
	let id = getUID('u'); // 'deck_cont'; //getUID('u');
	let d = mDiv(dParent, styles, id);
	mContainerSplay(d, 4, Card.w, Card.h, n, Card.ovdeck);

	return d;
}
function ui_make_hand_container(n, dParent, styles = { bg: 'random', padding: 10 }) {
	let id = getUID('u');
	let d = mDiv(dParent, styles, id);
	mContainerSplay(d, 2, Card.w, Card.h, n, Card.ovw);
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


	// wie kann ich verify that top most deck card is items[0]?
	//let x = items[0];	face_up(x);

	return items[0];

}
function ui_add_cards_to_hand_container(cont, items, list) {
	//make 1 card
	if (nundef(list)) list = items.map(x => x.key);
	for (const item of items) {
		mAppend(cont, iDiv(item));
		mItemSplay(item, list, 2, Card.ovw);
	}
}
function ui_add_cards_to_card_container(cont, items, list) {
	//make 1 card
	if (nundef(list)) list = items.map(x => x.key);
	for (const item of items) {
		mAppend(cont, iDiv(item));
		// mItemSplay(item, list, 2, Card.ovw);
	}
}























