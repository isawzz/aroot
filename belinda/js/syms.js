async function initSyms() {

	console.log('haloooooooooooooooo');

	//symbolDict = Syms = await localOrRoute('syms', 'test1.yml');

	// C52 = await localOrRoute('C52', '../assets/c52.yaml');
	// symbolDict = Syms = await localOrRoute('syms', '../assets/allSyms.yaml');
	// SymKeys = Object.keys(Syms);
	// ByGroupSubgroup = await localOrRoute('gsg', '../assets/symGSG.yaml');

	// DB = await route_path_yaml_dict('./DB.yaml');
	// console.assert(isdef(DB));

	// DA = {}; Items = {};
	// Speech = new SpeechAPI('E');
	// KeySets = getKeySets();
	// TOMan = new TimeoutManager();

}

//#region syms item + div + dPic + dLabel
function addLabels(items, lang = 'E', luc = 'c') {
	for (const item of items) {
		let label = item.info[lang];
		item.label = luc == 'c' ? toNoun(label) : luc == 'l' ? label : label.toUpperCase();
	}
}
function addRepeatInfo(dPic, iRepeat, wpic) {
	//console.log(dPic,iRepeat,szPic)
	let szi = Math.max(Math.floor(wpic / 8), 8);
	//console.log(szi);
	dPic.style.position = 'relative';
	let d2 = mText('' + iRepeat, dPic, { fz: szi, weight: 'bold', fg: 'contrast', position: 'absolute', left: szi / 2, top: szi / 2 - 2 });
	// let d3 = mText('col:' + col, dPic, { fz: szi, color: 'black', position: 'absolute', left: szi, top: (szi / 2 + szi + 2) })
	return d2;
}
function applyColorkey(item) {
	//console.log('halllllllllllll')
	let l = item.live;
	let sShade = '0 0 0 ' + item.textShadowColor;
	item.shadeStyles = { 'text-shadow': sShade, fg: anyColorToStandardString('black', l.options.contrast) };
	let ui = l.options.showPic ? l.dPic : l.dLabel;
	mStyle(ui, item.shadeStyles);
}
function _calcFontPicFromText(options, overrideExisting = true) {
	if (nundef(options.fzPic) || overrideExisting) options.fzPic = Math.floor(options.fzText * 4 * (options.luc == 'u' ? .7 : .6)); //taking 4 as min word length
	return options.fzPic;
}
function _extendOptions(options, defOptions, createArea = true) {
	defOptions = {
		wper: 96, hper: 96, dParent: dTable,
		showPic: true, szPic: { w: 120, h: 120 }, bg: 'random', fg: 'white', margin: 4, rounding: 6,
		showLabels: true, luc: 'l', labelPos: 'bottom', lang: 'E', keySet: 'all',
		fzText: 20, fzPic: 60,
		padding: .025, gap: .1, isUniform: true, isRegular: false, fillArea: true,
		shufflePositions: false, sameBackground: true, showRepeat: false, repeat: 1,
		contrast: .32,
		ifs: {},
		handler: _standardHandler,
	};

	addKeys(defOptions, options);

	if (createArea && nundef(options.dArea)) {
		if (isdef(options.wArea) && isdef(options.hArea)) {
			options.dArea = getMainArea(options.dParent, { w: options.wArea, h: options.hArea });
		} else if (isdef(options.areaPadding)) {
			options.dArea = getMainAreaPadding(options.dParent, padding = options.areaPadding);
		} else options.dArea = getMainAreaPercent(options.dParent, null, options.wper, options.hper, getUID());
		options.area = getRect(options.dArea);
		options.idArea = options.dArea.id;
		options.aRatio = options.area.w / options.area.h;
		options.containerShape = options.area.w > options.area.h ? 'L' : 'P';
	}

	if (options.repeat > 1 && nundef(options.ifs.bg)) {
		let bg = isdef(options.colorKeys) ? 'white' : (i) => options.sameBackground ? computeColor('random') : 'random';
		let fg = isdef(options.colorKeys) ? 'black' : 'white';
		options.ifs.bg = bg;
		options.ifs.fg = fg;
	}

	_calcFontPicFromText(options, false);

	if (nundef(options.labelStyles)) options.labelStyles = {};

	if (options.showLabels) {
		if (options.labelPos == 'bottom') options.labelBottom = true; else options.labelTop = true;
		options.labelStyles.fz = options.fzText;
	}

	options.picStyles = { fz: options.fzPic };

	let [w, h] = [options.szPic.w, options.szPic.h];
	options.outerStyles = {
		w: w, h: h, bg: options.bg, fg: options.fg,
		display: 'inline-flex', 'flex-direction': 'column',
		'justify-content': 'center', 'align-items': 'center', 'vertical-align': 'top',
		//'place-content': 'center',
		padding: 0, box: true, margin: options.margin, rounding: options.rounding,
	};

	return options;
}
function _extendItemsAndOptions(items, options) {
	//relevant props are: luc, numRepeat, colorKeys, ifs + item.label
	//ifs:
	// => alle ifs props werden in items copiert vordem items mit numRepeat und colorKeys expanded werden!
	// => ifs kann bg, fg, ... auch als func(index,item,options,items) (index,items sind input param)
	options.longestLabel = findLongestWord(items.map(x => x.label));
	options.wLongest = extendWidth(options.longestLabel);

	//hier koennt ich die ifs machen!
	let ifs = options.ifs;
	for (let i = 0; i < items.length; i++) {
		let item = items[i];
		item.index = i;
		//item.ifs = jsCopy(options.ifs);
		let val;
		for (const propName in ifs) {
			let prop = ifs[propName];
			//console.log('___________',ifs[propName])
			//console.log('TYPE OF', propName, 'IS', typeof prop, prop, isLiteral(prop))
			if (isLiteral(prop)) val = prop;
			else if (isList(prop)) val = prop[i % prop.length];
			else if (typeof (prop) == 'function') val = prop(i, item, options, items);
			else val = null;
			if (isdef(val)) item[propName] = val;
			//console.log('ifs prop:',propName,item[propName]);
		}
	}
	//console.log('haaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',items.map(x=>x.label))

	if (options.numRepeat > 1) { items = zRepeatEachItem(items, options.numRepeat, options.shufflePositions); }
	if (isdef(options.colorKeys)) items = zRepeatInColorEachItem(items, options.colorKeys);

	options.N = items.length;
	//console.log(items)
	//console.log('haaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',items.map(x=>x.label))
	return items;
}
function evToItem(ev) { let id = evToClosestId(ev); return isdef(id) ? Items[id] : null; }
function evToItemC(ev) { ev.cancelBubble = true; return evToItem(ev); }
function findItemFromEvent(items, ev) { return evToItemC(ev); }
function findItemFromElem(items, elem) { let item = firstCond(items, x => iDiv(x) == elem); return item; }
function findItemFromKey(items, key) { return firstCond(items, x => x.key == key); }
function findKeys(s) { return SymKeys.filter(x => contains(x, s) || contains(Syms[x].E, s)); }

function registeredItemCopy(orig) { let item = jsCopy(orig); item.id = iRegister(item); return item; }
function registerAsNewItem(item) { item.id = iRegister(item); return item; }

function genItems(n, options) { let keys = genKeys(n, options); let items = genItemsFromKeys(keys, options); return items; }
function genItemsFromKeys(keys, options = {}) {
	//console.log('keys',keys)
	let items = [];
	for (const k of keys) {
		console.assert(isdef(Syms[k]), 'key not found: ' + k);
		let info = Syms[k];
		let item = infoToItem(info);
		items.push(item);
	}
	//let items = keys.map(x => infoToItem(Syms[x]));

	//console.log(options.language,options.luc)
	addLabels(items, options.language, options.luc);

	//console.log('items',items)
	//console.log('haaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',items.map(x=>x.label))

	items = _extendItemsAndOptions(items, options);
	return items;
}
function genItemsFromObjects(list, keyProp, labelProp, options) {
	//console.log('list',list)
	let keys = [];
	for (const l of list) keys.push(l[keyProp]);
	let items = list.map(x => infoToItem(Syms[x[keyProp]]));
	let i = 0, luc = options.luc;
	for (const item of items) {
		let label = list[i][labelProp];
		//console.log(label);
		item.o = list[i];
		//console.log('item.o',list[i])
		item.label = luc == 'c' ? toNoun(label) : luc == 'l' ? label : label.toUpperCase();
		i += 1;
	}
	//console.log(items)
	items = _extendItemsAndOptions(items, options);
	return items;
}
function genKeys(n, options) {
	let [maxlen, lang, keySet] = [options.maxlen, valf(options.language, 'E'), valf(options.keySet, 'all')];
	let cond = isdef(maxlen) ? ((x) => x[lang].length <= maxlen) : null;
	let keys = _getKeysCond(n, cond, keySet);
	return keys;
}
function _getKeysCond(n, cond, keySet = 'all') {
	//console.log('n', n, 'cond', cond, 'keySet', keySet)
	if (isString(keySet)) keySet = KeySets[keySet];
	let keys = isdef(cond) ? isString(cond) ?
		isdef(KeySets[cond]) ? KeySets[cond] : keySet.filter(x => x.includes(cond))
		: keySet.filter(x => cond(Syms[x])) : keySet;
	keys = n >= keys.length ? keys : choose(keys, n);
	return keys;
}
function getItem(k) { return infoToItem(Syms[k]); }
function getAllItems(cond, keySet = 'all') { return getItems(10000, cond, keySet); }
function getItems(n, cond, keySet = 'all') {
	//n ... number, key list, info list or item list
	//cond ... undefined, string(KeySet or search SymKeys) or function(filter SymKeys)
	if (isNumber(n)) { n = _getKeysCond(n, cond, keySet); }

	//n is now list of keys! here i can 
	if (isString(n[0])) n = n.map(x => Syms[x]);
	if (nundef(n[0].info)) n = n.map(x => infoToItem(x));
	return n;
}
function getItemsMaxLen(n, len, keySet = 'all', lang = 'E', luc = 'c') { return getItemsMaxWordLength(...arguments); }
function getItemsMaxWordLength(n, len, keySet = 'all', lang = 'E', luc = 'c') {
	//assumes adding the labels in that language!
	let items = getItems(n, x => x[lang].length <= len, keySet); // cond is on Syms object!!!
	addLabels(items, lang, luc);
	return items;
}
function getMainAreaPercent(dParent, bg = 'grey', wPercent = 94, hPercent = 96, id) {
	//console.log('clearing parent',dParent)
	clearElement(dParent);
	let aTable = percentOf(dParent, wPercent, hPercent); //getRect(dTable);
	let dArea = getArea(dParent, { w: aTable.w, h: aTable.h, layout: 'hcc', bg: bg }, id);
	return dArea;

}
function getArea(dParent, styles, id) {
	let defStyles = { display: 'inline-block' };
	styles = mergeOverride(defStyles, styles);
	let d = mDiv(dParent, styles, id);

	return d;
}
function getNItemsPerKeylist(n, keylists, options = {}) {
	let items = [];
	// let nRandom = nTotal - (keylists.length*n);
	// let indices = range(0,keylists.length-1);
	// shuffle(indices);
	// console.log('indices',indices);
	// for(const i of indices){
	// 	let list = keylists[i];
	// 	options.keySet = list.keys;
	// 	let cat = list.cat;
	// 	//console.log('list',list)
	// 	let newItems = genItems(n, options);
	// 	newItems.map(x => {x.cat=cat;items.push(x)});
	// }
	// return items;
	for (const list of keylists) {
		options.keySet = list.keys;
		let cat = list.cat;
		//console.log('list',list)
		let newItems = genItems(n, options);
		newItems.map(x => { x.cat = cat; items.push(x) });

	}
	return items;
}
function modifyColorkey(item) {
	let colorkey = chooseRandom(Object.keys(ColorDict));
	let textShadowColor = ColorDict[colorkey].c;
	item.textShadowColor = textShadowColor;
	item.color = ColorDict[colorkey];
	item.colorKey = colorkey;
	//console.log('colorkey', colorkey)
	applyColorkey(item);
}
function makeItemDivs(items, options) { for (let i = 0; i < items.length; i++) { makeItemDiv(items[i], options) } }
function makeItemHintable(item) {
	let d = iDiv(item);
	let dov = mDiv100(d);
	let rect = getRect(d);
	mStyle(dov, { position: 'absolute', w: rect.w, h: rect.h })
	iAdd(item, { overlay: dov });
	dov.style.userSelect = 'none';
}
function makeItemDiv(item, options) {

	//console.log('item',item,'options',options)


	if (isdef(options.outerStyles) && isdef(options.ifs)) copyKeys(item, options.outerStyles, {}, Object.keys(options.ifs)); //options.ifs contains per item dynamic styles!!!!!
	//console.log('item.id',item.id,item)
	let dOuter = mCreate('div', options.outerStyles, item.id);

	if (isdef(item.textShadowColor)) {
		let sShade = '0 0 0 ' + item.textShadowColor;
		if (options.showPic) {
			options.picStyles['text-shadow'] = sShade;
			options.picStyles.fg = anyColorToStandardString('black', options.contrast); //'#00000080' '#00000030' 
		} else {
			options.labelStyles['text-shadow'] = sShade;
			options.labelStyles.fg = anyColorToStandardString('black', options.contrast); //'#00000080' '#00000030' 
		}
	}

	let dLabel;
	if (options.showLabels && options.labelTop == true) { dLabel = mText(item.label, dOuter, options.labelStyles); }

	let dPic;
	if (options.showPic) {
		dPic = mDiv(dOuter, { family: item.info.family });
		dPic.innerHTML = item.info.text;
		if (isdef(options.picStyles)) mStyle(dPic, options.picStyles);
	}

	if (options.showLabels && options.labelBottom == true) { dLabel = mText(item.label, dOuter, options.labelStyles); }

	if (isdef(options.handler)) dOuter.onclick = options.handler;

	iAdd(item, { options: options, div: dOuter, dLabel: dLabel, dPic: dPic });

	if (isdef(item.textShadowColor)) { applyColorkey(item, options); }
	return dOuter;

}
function newItemSelection(item, items, onSelectSelected = null) {

	console.log('===>', item, items)
	let selectedItem = firstCond(items, x => x.isSelected);
	if (selectedItem && selectedItem != item) toggleItemSelection(selectedItem);
	else if (onSelectSelected && selectedItem) { onSelectSelected(item); }
	toggleItemSelection(item);
}
function modLabel(item, newLabel, styles) {
	//assumes that this item already has a label!
	let dLabel = iLabel(item);
	//console.log(dLabel,newLabel,styles)
	dLabel.innerHTML = newLabel;
	mStyle(dLabel, styles);
	item.label = newLabel;
	return dLabel;
}
function addLabel(item, label, styles) {
	item.label = label;
	let div = iDiv(item);
	//console.log(item,label,div)
	if (isdef(item.live.dLabel)) mRemove(item.live.dLabel);
	let dLabel = item.live.dLabel = mDiv(div, styles, null, label);
	mCenterFlex(div, true, true);
	mStyle(div, { 'vertical-align': 'top' });
	return dLabel;
}
function addLabel1(item, label, replaceOld = true) {
	let div = iDiv(item);
	mStyle(div, { 'vertical-align': 'top' });
	//console.log('div', div);
	if (isdef(item.live.dLabel)) mRemove(item.live.dLabel);
	let dLabel = item.live.dLabel = mDiv(div, { fz: 20 }, null, label);

	return div;
}
function removeLabel(item) {
	//console.log('old item',item);
	if (isdef(item.live.dLabel)) {
		item.live.dLabel.remove();
		delete item.live.dLabel;
		// let div = iDiv(item);
		// let rect = getRect(div);
		// //wie wird
		// let fzPic = getStandardFzPic(rect.w, rect.h, false);
		// mStyle(item.live.dPic, { fz, fPic });
	}
	return item;
}
function _standardHandler(handler) {
	let f = isdef(handler) ?
		ev => { ev.cancelBubble = true; let res = handler(ev, evToItem(ev)); } //console.log('clicked', evToItem(ev).key, 'res', res); }
		: ev => { ev.cancelBubble = true; console.log('clicked on', evToClosestId(ev), evToLive(ev), evToItem(ev)); };
	return f;
}
function toggleItemSelection(item, selectedItems) {
	//console.log('===>',item)
	let ui = iDiv(item);
	item.isSelected = nundef(item.isSelected) ? true : !item.isSelected;
	if (item.isSelected) mClass(ui, 'framedPicture'); else mRemoveClass(ui, 'framedPicture');

	//if piclist is given, add or remove pic according to selection state
	if (isdef(selectedItems)) {
		if (item.isSelected) {
			console.assert(!selectedItems.includes(item), 'UNSELECTED PIC IN PICLIST!!!!!!!!!!!!')
			selectedItems.push(item);
		} else {
			console.assert(selectedItems.includes(item), 'PIC NOT IN PICLIST BUT HAS BEEN SELECTED!!!!!!!!!!!!')
			removeInPlace(selectedItems, item);
		}
	}
}
function zRepeatEachItem(items, repeat, shufflePositions = false) {
	//repeat items: repeat & shufflePositions
	let orig = items;
	let itRepeat = items;
	for (let i = 1; i < repeat; i++) { itRepeat = itRepeat.concat(orig.map(x => registeredItemCopy(x))); }
	if (shufflePositions) { shuffle(itRepeat); }
	//weil die items schon geshuffled wurden muss ich iRepeat neu setzen in den reihenfolge in der sie in itRepeat vorkommen!
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
	//colorKeys: copy colorKeys.length times into different colors
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
			//console.log('schau', index, colorKey);
			let x = itColors[index];
			x.index = index;
			x.textShadowColor = textShadowColor;
			x.color = ColorDict[colorKey];
			x.colorKey = colorKey;
		}
		//newItems.map(x => { x.textShadowColor = textShadowColor; x.color = ColorDict[colorKey]; x.colorKey = colorKey; });
	}
	//for (let i = 0; i < itColors.length; i++) itColors[i].index = i;
	//console.log(itColors[0])
	return itColors;
}

//#region iconviewer
var IconSet, lastIndex;

function iconViewerTestKeysets() {
	let allKeys = symKeysBySet.nosymbols;
	let keys = allKeys.filter(x => isdef(symbolDict[x].best100));
	let keys1 = allKeys.filter(x => isdef(symbolDict[x].best100) && isdef(symbolDict[x].bestE));
	let keys2 = allKeys.filter(x => isdef(symbolDict[x].best50));
	let keys3 = allKeys.filter(x => isdef(symbolDict[x].best25));
	console.log(keys3);
	iconViewer(keys3);

}

function iconViewer(keys) {
	console.log('hallo!!!')
	onclick = show100;
	IconSet = isdef(keys) ? keys : symKeysBySet['nosymbols'];
	lastIndex = 0;
	Pictures = [];

	show100();

}
function downloadKeySet() {
	let keys = Pictures.filter(x => x.isSelected).map(x => x.info.key);
	downloadAsYaml(keys, 'keyset');
}
function show100() {
	//assumes a div id='table'
	console.log('hallo!!!')
	let table = mBy('table');
	clearElement(table);

	mButton('download key set', downloadKeySet, table, { fz: 30 });
	mButton('next 100', () => show100(), table, { fz: 30 });
	mLinebreak(table);

	let N = 150; //100
	let keys = takeFromTo(IconSet, lastIndex, lastIndex + N);//chooseRandom() ['keycap: 0', 'keycap: 1', 'keycap: #', 'keycap: *'];
	lastIndex += N;

	//gridLabeled(keys);
	//let d = mGrid(10, 10, table);
	for (const k of keys) {
		let item = mPic(k, table, { margin: 8, w: 50, h: 70, bg: 'dimgray', fz: 30 });
		addLabel(item, k, { fz: 12 })
		item.onclick = toggleSelectionOfPicture;
	}

}


//#endregion





