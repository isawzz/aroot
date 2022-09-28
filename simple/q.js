
function qanim() {
	if (!isEmpty(DA.qanim)) {
		let [f, params] = DA.qanim.shift();
		f(...params);
	} //else console.log('...anim q done!')
}

//#region animated changes w/ callback qanim
function qanim_flip_topmost(deck, ms = 400) {
	qanim_flip(deck.topmost, ms);
}
function qanim_flip(card, ms = 400) {
	mAnimate(iDiv(card), 'transform', [`scale(1,1)`, `scale(0,1)`],
		() => {
			if (card.faceUp) face_down(card); else face_up(card);
			mAnimate(iDiv(card), 'transform', [`scale(0,1)`, `scale(1,1)`], qanim, ms / 2, 'ease-in', 0, 'both');
		},
		ms / 2, 'ease-out', 0, 'both');
}
function qanim_move_topmost(uifrom, uito, ms = 400) {
	let card = uifrom.topmost;
	qanim_move(card, uifrom, uito, ms);
}
function qanim_move(card, uifrom, uito, ms = 400) {
	let dfrom = iDiv(card);
	let dto = isEmpty(uito.items) ? uito.container : iDiv(arrLast(uito.items));
	let dParent = find_common_ancestor(dfrom, dto);
	let rfrom = getRect(dfrom, dParent);
	let rto = getRect(dto, dParent);
	dfrom.style.zIndex = 100;
	let [offx, offy] = isEmpty(uito.items) ? [4, 4] : [card.w, 0];

	// let a = aTranslateByEase(dfrom, offx + rto.l - rfrom.l, offy + rto.t - rfrom.t, 500, 'ease');
	let a = mAnimate(dfrom, 'transform',
		[`translate(${offx + rto.l - rfrom.l}px, ${offy + rto.t - rfrom.t}px)`], qanim,
		ms, 'ease');
}

//#changes on ui (z props) w/o animations, and mirrorring ui to fen z[prop]=>fen[prop]
function q_move_topmost(uideck, uito) {
	//assume: ui1 has topmost property! (eg., _ui_type_deck)
	let topmost = uideck.items.shift();
	uideck.list = uideck.items.map(x => x.key);
	uideck.topmost = uideck.items[0];

	let dfrom = iDiv(topmost);
	dfrom.remove();
	dfrom.style.position = 'static';
	dfrom.style.zIndex = 0;
	uito.items.push(topmost);
	uito.list = uito.items.map(x => x.key);
	mAppend(uito.container, dfrom);
	qanim();
}
function q_mirror_fen() {
	let fen = z.fen;
	for (const prop of arguments) {
		let ui = z[prop];
		fen[prop] = ui.list;
	}
	//console.log('fen', fen);
	qanim();
}
