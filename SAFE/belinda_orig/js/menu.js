function createMenuUiNew(dParent, keys, clickMenuHandler, outerStyles = {},picStyles={}, labelStyles={}, hTotal = 600) {
	//console.log('BASE.features.menu: dParent', dParent)
	clearElement(dParent);
	mCenterFlex(dParent);
	mAppend(dParent, createElementFromHTML(`<h1>Choose Game:</h1>`));
	mLinebreak(dParent);
	let dMenuItems = mDiv(dParent, { w: '90%', h: hTotal });
	// mCenterFlex(dMenuItems);

	let games = keys; //isdef(keys)? keys : isdef(U)? jsCopy(U.avGames) : choose(Object.keys(DB.games),10); 
	if (!navigator.onLine) { removeInPlace(games, 'gSayPic'); }

	let items = [];
	let defaultOuterStyles = {
		display: 'inline-flex', 'flex-direction': 'column',
		'justify-content': 'center', 'align-items': 'center', 'vertical-align': 'top',
		wmin: hTotal/4, hmin: hTotal/6, margin: 8, rounding: 6
	};
	addKeys(defaultOuterStyles, outerStyles);
	let defaultPicStyles = {fz:hTotal/10,'line-height':hTotal/10 + 'px'};
	addKeys(defaultPicStyles,picStyles);
	//if (!DA.menuHasBeenShuffled) {shuffle(games); DA.menuHasBeenShuffled = true;}
	for (const g of games) {
		let item = { o: DB.games[g], id: g }; iRegister(item, g);
		item.bg = getColorDictColor(item.o.color);
		item.label = capitalize(item.o.friendly);
		item.info = Syms[item.o.logo];
		
		let d = makeItemDiv(item, {
			outerStyles: outerStyles, ifs: { bg: true },
			picStyles: picStyles,
			labelStyles: labelStyles,
			showPic: true, showLabels: true, labelBottom: true, handler: clickMenuHandler
		});
		iAdd(item, { div: d });
		mAppend(dMenuItems, d);
		items.push(item);
	}
	//MenuItems = items;
	// let list = games.map(x => { let item = DB.games[x]; item.id = x; return item; });	//console.log('', games, list, '\n_______________')
	// MenuItems = menu(dMenuItems, list, onClickMenuItem);	//console.log('MenuItems', MenuItems)

	if (nundef(G)) return;

	//select the current game
	SelectedMenuKey = G.id;
	//console.log(MenuItems)
	let selItem = Items[SelectedMenuKey]; //SelectedMenuItem = firstCond(MenuItems, x => x.id == SelectedMenuKey);	//console.log(selItem)
	toggleItemSelection(selItem);
}

function createMenuUi(dParent, keys, clickMenuHandler, itemStyles = {}, hTotal = 600) {
	//console.log('BASE.features.menu: dParent', dParent)
	clearElement(dParent);
	mCenterFlex(dParent);
	mAppend(dParent, createElementFromHTML(`<h1>Choose Game:</h1>`));
	mLinebreak(dParent);
	let dMenuItems = mDiv(dParent, { w: '90%', h: hTotal });
	// mCenterFlex(dMenuItems);

	let games = keys; //isdef(keys)? keys : isdef(U)? jsCopy(U.avGames) : choose(Object.keys(DB.games),10); 
	if (!navigator.onLine) { removeInPlace(games, 'gSayPic'); }

	let items = [];
	let outerStyles = {
		display: 'inline-flex', 'flex-direction': 'column',
		'justify-content': 'center', 'align-items': 'center', 'vertical-align': 'top',
		wmin: 140, hmin: 110, margin: 8, rounding: 6
	};
	copyKeys(itemStyles, outerStyles);
	//if (!DA.menuHasBeenShuffled) {shuffle(games); DA.menuHasBeenShuffled = true;}
	for (const g of games) {
		let item = { o: DB.games[g], id: g }; iRegister(item, g);
		item.bg = getColorDictColor(item.o.color);
		item.label = capitalize(item.o.friendly);
		item.info = Syms[item.o.logo];
		let d = makeItemDiv(item, {
			outerStyles: outerStyles, ifs: { bg: true },
			picStyles: { fz: 60 },
			showPic: true, showLabels: true, labelBottom: true, handler: clickMenuHandler
		});
		iAdd(item, { div: d });
		mAppend(dMenuItems, d);
		items.push(item);
	}
	//MenuItems = items;
	// let list = games.map(x => { let item = DB.games[x]; item.id = x; return item; });	//console.log('', games, list, '\n_______________')
	// MenuItems = menu(dMenuItems, list, onClickMenuItem);	//console.log('MenuItems', MenuItems)

	if (nundef(G)) return;

	//select the current game
	SelectedMenuKey = G.id;
	//console.log(MenuItems)
	let selItem = Items[SelectedMenuKey]; //SelectedMenuItem = firstCond(MenuItems, x => x.id == SelectedMenuKey);	//console.log(selItem)
	toggleItemSelection(selItem);
}
