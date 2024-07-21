var BG_CARD_BACK = randomColor();

function cardZone(dParent, o, flex = 1, hmin = 170) {
	let dOuter = mDiv(dParent, { bg: o.color, fg: 'contrast', flex: flex, hmin: hmin }, 'd' + o.name, o.name);
	let dInner = mDiv(dOuter);
	mFlex(dInner); dInner.style.alignContent = 'flex-start';
	return dInner;
}
function gameItem(name, color) { return mItem(name2id(name), null, { color: isdef(color) ? color : randomColor(), name: name },false); }
function id2name(id) { id.substring(1).split('_').join(' '); }
function name2id(name) { return 'd' + name.split(' ').join('_'); }

function aristoUi(dParent, g) {
	clearTable();
	let d1 = mDiv(dParent, { w: '100%' }); mFlex(d1, 'v');
	let dWorld = mDiv(d1, { bg: 'random', hmin: 170, flex: 1 });
	mFlex(dWorld);
	iAdd(g.me, { div: cardZone(d1, g.me, 2) });

	let others = g.others;
	//console.log('others', others);
	for (let i = 0; i < others.length; i++) {
		let pl = others[i];
		iAdd(pl, { div: cardZone(d1, pl) });
	}

	for (const o of [g.draw_pile, g.market, g.buy_cards, g.discard_pile]) { iAdd(o, { div: cardZone(dWorld, o) }); }

	//was hab ich hier? for each player, have d[NAME] thaths all
	//was will ich jetzt?
	for (const name of ['draw_pile', 'market', 'buy_cards', 'discard_pile']) { g[name + 'Items'] = showCards(g[name]); }

	//g.me.handItems = showCards({ div: iDiv(g.me), type: 'hand', cards: g.me.hand });

	for (const pl of g.allPlayers) {
		pl.handItems = showCards({ div: iDiv(pl), type: pl==g.me?'hand':'handHidden', cards: pl.hand });
		if (isdef(pl.stall)) pl.stallItems = showCards({ div: iDiv(pl), type: g.stallsHidden ? 'cardsHidden' : 'cards', cards: pl.stall });
		if (isdef(pl.buildings)){
			for(const building of pl.buildings){
				let bItem = showCards({ div: iDiv(pl), type: 'hand', cards: building });
				// let bItem = showCards({ div: iDiv(pl), type: pl==g.me?'hand':'handHidden', cards: building });
				lookupAddToList(pl,['buildingItems'],bItem);
			}
		}
	}
}

function showCards(o, type) {
	//in ddraw_pile, present draw_pile (arr of numbers 0 to 103)
	let d2 = iDiv(o);
	if (nundef(type)) type = isdef(o.type) ? o.type : 'hand';
	let arr = type == 'deck' ? o.deck.cards() : o.cards;
	let cont = type == 'deck' ? stdDeckContainer(d2, arr.length) : startsWith(type, 'cards') ? stdCardsContainer(d2, arr.length) : stdHandContainer(d2, arr.length);
	let items = arr.map(x => Card52.getItem(x % 52));
	if (endsWith(type,'Hidden') || type == 'deck') items.map(x=>Card52.turnFaceDown(x,BG_CARD_BACK));
	items.map(x=>mAppend(cont,iDiv(x)));
	return items;
}

function stdRowOverlapContainer(dParent, n, wGrid, wCell, styles) {
	addKeys({
		w: wGrid,
		gap: 0,
		display: 'inline-grid',
		'grid-template-columns': `repeat(${n}, ${wCell}px)`
	}, styles);
	return mDiv(dParent, styles);
}
function stdDeckContainer(dParent, n, ov = .25, styles = {}) { return stdRowOverlapContainer(dParent, n, 140, ov, addKeys({ padding: 10 }, styles)); }
function stdCardsContainer(dParent, n, ov = 80, styles = {}) { return stdRowOverlapContainer(dParent, n, n * ov + 22, ov, addKeys({ paleft: 20, patop: 10 }, styles)); }
function stdHandContainer(dParent, n, ov = 20, styles = {}) { return stdRowOverlapContainer(dParent, n, 76 + n * ov + 22, ov, addKeys({ padding: 10 }, styles)); }



function stdGridContainer(dParent, wCell, styles = {}) {
	addKeys({
		wmax: 500,
		margin: 'auto',
		padding: 10,
		gap: 0,
		display: 'grid',
		bg: 'green',
		'grid-template-columns': `repeat(${20}, ${wCell}px)`
	}, styles);
	return mDiv(dParent, styles);
}