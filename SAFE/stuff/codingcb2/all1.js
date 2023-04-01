//#region functions _
function __pictoG(key, x, y, w, h, fg, bg) {
	let ch = iconChars[key];
	let family = (ch[0] == 'f' || ch[0] == 'F') ? 'pictoFa' : 'pictoGame';
	let text = String.fromCharCode('0x' + ch);
}
async function __start() {
	set_run_state_no_server();
	onpagedeactivated(() => { fiddleSave(); dbSave(); });
	await load_syms();
	await load_db();
	let dicode = CODE.di = await route_path_yaml_dict('../basejs/z_all.yaml');
	let dijustcode = CODE.justcode = await route_path_yaml_dict('../basejs/z_allcode.yaml');
	dTable = mSection({ h: window.innerHeight - 68 }, 'dTable');
	computeClosure();
}
function _addFilterHighlight(mobj) { mobj.highC('green'); }
function _addOnelineVars(superdi, o) {
	let [code, type] = [o.code, o.type];
	let crn = (code.match(/\r\n/g) || []).length;
	let oneliner = crn == 1;
	//let specialword = 'Counter'; //'PORT';
	if (oneliner && type == 'var' && code.includes(',') && !code.includes('[') && !code.includes('{ ')) {
		let othervars = stringAfter(code, 'var').trim().split(',');
		othervars = othervars.map(x => firstWord(x, true));
		othervars.shift();
		for (const v of othervars) {
			let o1 = jsCopy(o);
			o1.lead = o.key;
			o1.key = v;
			o1.code = '';
			o1.sig = `var ${v};`;
			if (isNumber(v)) { continue; }
			lookupSetOverride(superdi, [type, v], o1);
		}
	}
}
function _addPicto(dParent, key) {
	let pic = picto(key, 0, 0, 50, 50, 'red', 'black');
	dParent.appendChild(pic);
	return pic;
}
function _addRelatives(id, oid) {
	if (isdef(oid2ids[oid])) {
		for (const idOther of oid2ids[oid]) {
			if (idOther == id) {
				console.log('object', id, 'already exists in oid2ids[', oid, ']');
				continue;
			}
			listKey(id2uids, id, idOther);
			listKey(id2uids, idOther, id);
		}
	}
}
function _addShape(mobj, w, h, color, shape, { dx = 0, dy = 0, x1, y1, x2, y2, border, thickness, alpha, n = 6, path, idx, rounding } = {}) {
	let r = mobj['_' + shape]();
	mobj.shape = shape;
	if (alpha) color = colorFrom(color, alpha);
	mobj.elem.setAttribute('fill', color);
	if (this.isLine) {
		dx = isdef(dx) ? dx + this.x : this.x;
		dy = isdef(dy) ? dy + this.y : this.y;
	}
	let t = getTypeOf(r);
	if (t == 'rect') { _setRectDims(r, w, h, dx, dy); }
	else if (t == 'ellipse') { _setEllipseDims(r, w, h, dx, dy); }
	else if (t == 'polygon') {
		let pts;
		if (shape == 'hex') { if (h <= 0) { h = (2 * w) / 1.73; } pts = size2hex(w, h, dx, dy); }
		else if (shape == 'triangle') { pts = size2triup(w, h, dx, dy); }
		else if (shape == 'triangleDown') { pts = size2tridown(w, h, dx, dy); }
		else if (shape == 'star') {
			h = h == 0 ? w : h;
			let rad = w / 2;
			let pOuter = getCirclePoints(rad, n);
			let pInner = getCirclePoints(rad / 2, n, 180 / n);
			let points = [];
			for (let i = 0; i < n; i++) {
				points.push(pOuter[i]);
				points.push(pInner[i]);
			}
			for (let i = 0; i < points.length; i++) {
				points[i].X = (points[i].X + w / 2) / w;
				points[i].Y = (points[i].Y + h / 2) / h;
			}
			pts = polyPointsFrom(w, h, dx, dy, points);
		}
		r.setAttribute('points', pts);
	} else if (t == 'image') { _setRectDims(r, w, h, dx, dy); r.setAttribute('href', path); }
	else if (t == 'line') { _setLineDims(r, x1, y1, x2, y2) }
	if (thickness) {
		r.setAttribute('stroke-width', thickness);
		r.setAttribute('stroke', border ? border : mobj.fg);
	}
	if (rounding) {
		r.setAttribute('rx', rounding);
		r.setAttribute('ry', rounding);
	}
	if (isdef(idx) && mobj.elem.childNodes.length > idx) {
		mobj.elem.insertBefore(r, mobj.elem.childNodes[idx]);
	} else {
		mobj.elem.appendChild(r);
	}
	return r;
}
function _addStandardInteraction(id) {
	let mobj = UIS[id];
	switch (id[2]) {
		case 'a':
			mobj.addClickHandler('elem', onClickSelectTuple);
			mobj.addMouseEnterHandler('title', highlightMsAndRelatives);
			mobj.addMouseLeaveHandler('title', unhighlightMsAndRelatives);
			break;
		case 'l':
		case 'r':
			mobj.addMouseEnterHandler('title', highlightMsAndRelatives);
			mobj.addMouseLeaveHandler('title', unhighlightMsAndRelatives);
			break;
		case 't':
			if (id[0] == 'm') {
				mobj.addClickHandler('elem', onClickFilterOrInfobox);
				if (mobj.isa.card) {
					mobj.addMouseEnterHandler('title', _highlightAndMagnify);
					mobj.addMouseLeaveHandler('title', _unhighlightAndMinify);
				} else {
					mobj.addMouseEnterHandler('title', highlightMsAndRelatives);
					mobj.addMouseLeaveHandler('title', unhighlightMsAndRelatives);
				}
			} else {
				mobj.addClickHandler('elem', onClickFilterTuples);
				mobj.addMouseEnterHandler('title', highlightMsAndRelatives);
				mobj.addMouseLeaveHandler('title', unhighlightMsAndRelatives);
			}
			break;
		default:
			mobj.addClickHandler('elem', onClickFilterTuples);
			mobj.addMouseEnterHandler('title', highlightMsAndRelatives);
			mobj.addMouseLeaveHandler('title', unhighlightMsAndRelatives);
			break;
	}
}
function _bestRowsColsFill(items, options) {
	let combis = _getSLCombis(items.length, options.isRegular);
	let wa = options.area.w, ha = options.area.h, wp = options.szPic.w, hp = options.szPic.h;
	let rows, cols;
	cols = wa / wp;
	rows = ha / hp;
	let aRatio = cols < rows ? cols / rows : rows / cols;
	options.or = cols < rows ? 'P' : 'L';
	let rmin = 20000, best;
	for (const r of combis) {
		let rnew = Math.abs(aRatio - r.s / r.l);
		if (rnew < rmin) { rmin = rnew; best = r; }
	}
	if (options.or == 'P') { rows = best.l; cols = best.s; } else { rows = best.s; cols = best.l; }
	let [w, h] = [options.szPic.w, options.szPic.h] = [wa / cols, ha / rows];
	return [rows, cols, w, h, options.or];
}
function _bestRowsColsSize(items, options) {
	let combis = _getSLCombis(items.length, options.isRegular, true);
	options.szPicTest = { w: options.szPic.w, h: options.szPic.h };
	let bestCombi = safeLoop(_findBestCombiOrShrink, [items, options, combis]);
	let [rows, cols, w, h] = [bestCombi.rows, bestCombi.cols, options.szPicTest.w, options.szPicTest.h]
	delete options.szPicTest;
	return [rows, cols, w, h, rows < cols ? 'L' : 'P'];
}
function _bestRowsColsSizeWH(items, wTotal, hTotal, options) {
	let combis = _getSLCombis(items.length, options.isRegular, true);
	options.szPicTest = { w: options.szPic.w, h: options.szPic.h };
	let bestCombi = safeLoop(_findBestCombiOrShrinkWH, [items, wTotal, hTotal, options, combis]);
	let [rows, cols, w, h] = [bestCombi.rows, bestCombi.cols, options.szPicTest.w, options.szPicTest.h]
	delete options.szPicTest;
	return [rows, cols, w, h, rows < cols ? 'L' : 'P'];
}
function _bringCardToFront(id) { let elem = document.getElementById(id); maxZIndex += 1; elem.style.zIndex = maxZIndex; }
function _calc_hex_col_array(rows, cols) {
	let colarr = [];
	let even = rows % 2 == 0;
	for (let i = 0; i < rows; i++) {
		colarr[i] = cols;
		if (even && i < (rows / 2) - 1) cols += 1;
		else if (even && i > rows / 2) cols -= 1;
		else if (!even && i < (rows - 1) / 2) cols += 1;
		else if (!even || i >= (rows - 1) / 2) cols -= 1;
	}
	return colarr;
}
function _calc_hex_col_array_old(rows, cols) {
	let colarr = [];
	for (let i = 0; i < rows; i++) {
		colarr[i] = cols;
		if (i < (rows - 1) / 2) cols += 1;
		else cols -= 1;
	}
	return colarr;
}
function _calcFontPicFromText(options, overrideExisting = true) {
	if (nundef(options.fzPic) || overrideExisting) options.fzPic = Math.floor(options.fzText * 4 * (options.luc == 'u' ? .7 : .6));
	return options.fzPic;
}
function _calcPadGap(p, w, h) {
	if (isString(p)) {
		let pad = Math.min(w, h) * firstNumber(p) / 100;
		console.log('pad', padding);
		return pad;
	} else if (p > 0 && p < 1) return Math.min(w, h) * p;
	else return p;
}
function _centerGridVerticallyWithinArea(items, options) {
	let dGrid = mBy(options.idGrid);
	let dArea = mBy(options.idArea);
	let gRect = getRect(dGrid);
	let aRect = getRect(dArea);
	let itemRect = getRect(lDiv(items[0]));
	let [gsz, asz, itemsz] = [rectToSize(gRect), rectToSize(aRect), rectToSize(itemRect)]
	let extra = options.area.h - gRect.h;
	let pv = valf(options.percentVertical, 50);
	let matop = extra * pv / 100;
	mStyleX(dGrid, { matop: matop });
	mReveal(dMain);
}
function _chainExRec(akku, taskChain, onComplete) {
	if (CancelChain) {
		clearTimeout(ChainTimeout);
		BlockChain = false;
		console.log('chain canceled!');
		return akku;
	} else if (isEmpty(taskChain)) {
		BlockChain = false;
		if (onComplete) onComplete(akku);
		else console.log('akku', akku, '\nBlockChain', BlockChain, '\nCancelChain', CancelChain)
	} else {
		let task = taskChain[0], f = task.f, parr = isdef(task.parr) ? task.parr : [], t = task.msecs, waitCond = task.waitCond, tWait = task.tWait;
		if (isdef(waitCond) && !waitCond()) {
			if (nundef(tWait)) tWait = 300;
			ChainTimeout = setTimeout(() => _chainExRec(akku, taskChain, onComplete), tWait);
		} else {
			for (let i = 0; i < parr.length; i++) {
				let para = parr[i];
				if (para == '_last') parr[i] = arrLast(akku);
				else if (para == '_all' || para == '_list') parr[i] = akku;
				else if (para == '_first') parr[i] = akku[0];
			}
			let result = f(...parr);
			if (isdef(result)) akku.push(result);
			if (isdef(t)) {
				ChainTimeout = setTimeout(() => _chainExRec(akku, taskChain.slice(1), onComplete), t);
			} else {
				_chainExRec(akku, taskChain.slice(1), onComplete);
			}
		}
	}
}
function _checkOverflow(items, options, dGrid) {
	console.log('exec...')
	if (isOverflown(dGrid)) { _sizeByFactor(items, options, dGrid, .99); }
}
function _checkOverflowPixel(items, options, dGrid) {
	console.log('exec...')
	if (isOverflown(dGrid)) { _sizeByPixel(items, options, dGrid, -1); }
}
function _clearHand(idHand, subArea) {
	let hand = UIS[idHand];
	if (hand.cards) {
		while (!isEmpty(hand.cards)) {
			removeCardFromHand(hand.cards[0], hand, subArea);
		}
	}
}
function _cloneIfNecessary(value, optionsArgument) {
	var clone = optionsArgument && optionsArgument.clone === true
	return (clone && _isMergeableObject(value)) ? deepmerge(_emptyTarget(value), value, optionsArgument) : value
}
function _closeInfoboxesForBoatOids(boat) {
	let oids = boat.o.oids;
	for (const oid of oids) hideInfobox(oid);
}
function _computeClosure(symlist) {
	let keys = {};
	for (const k in CODE.di) { for (const k1 in CODE.di[k]) keys[k1] = CODE.di[k][k1]; }
	CODE.all = keys;
	CODE.keylist = Object.keys(keys)
	let inter = intersection(Object.keys(keys), Object.keys(window));
	let done = {};
	let tbd = valf(symlist, ['_start']);
	let MAX = 1007, i = 0;
	let alltext = '';
	while (!isEmpty(tbd)) {
		if (++i > MAX) break;
		let sym = tbd[0];
		let o = CODE.all[sym];
		if (nundef(o)) o = getObjectFromWindow(sym);
		if (o.type != 'func' && o.type != 'cla') { tbd.shift(); lookupSet(done, [o.type, sym], o); continue; }
		let olive = window[sym];
		if (nundef(olive)) { tbd.shift(); lookupSet(done, [o.type, sym], o); continue; }
		let text = olive.toString();
		if (!isEmpty(text)) alltext += text + '\r\n';
		let words = toWords(text, true);
		for (const w of words) {
			if (nundef(done[w]) && w != sym && isdef(CODE.all[w])) addIf(tbd, w);
		}
		tbd.shift();
		lookupSet(done, [o.type, sym], o);
	}
	let tres = '';
	for (const k of ['const', 'var', 'cla', 'func']) {
		console.log('done', k, done[k])
		let o = done[k]; if (nundef(o)) continue;
		let klist = get_keys(o);
		if (k == 'func') klist = sortCaseInsensitive(klist);
		else if (k == 'cla') klist = sortClassKeys(done);
		else if (k == 'const') klist = sortConstKeys(done).map(x => x.key);
		for (const k1 of klist) {
			let code = CODE.justcode[k1];
			if (!isEmptyOrWhiteSpace(code)) tres += code + '\r\n';
		}
	}
	return done;
}
function _createDeck({ hasJokers = false } = {}) {
	let deck = null;
	if (hasJokers) { deck = DeckA(true); }
	else { deck = DeckA(); }
	deck.isFaceDown = true;
	return deck;
}
function _createDivs(items, ifs, options) {
	if (nundef(options.textPos)) options.textPos = 'none';
	let w = isdef(options.w) ? options.w : options.sz;
	let h = isdef(options.h) ? options.h : options.sz;
	let padding = (isdef(ifs.padding) ? ifs.padding : 1);
	let bo = ifs.border;
	bo = isdef(bo) ? isString(bo) ? firstNumber(bo) : bo : 0;
	let wNet = w - 2 * padding - 2 * bo;
	let hNet = h - 2 * padding - 2 * bo;
	let pictureSize = wNet;
	options.center = true;
	let picStyles = { w: wNet, h: isdef(options.center) ? hNet : hNet + padding };
	let textStyles, hText;
	if (options.showLabels) {
		let longestLabel = findLongestLabel(items);
		let oneWord = longestLabel.label.replace(' ', '_');
		let maxTextHeight = options.showPics ? hNet / 2 : hNet;
		textStyles = idealFontsize(oneWord, hNet, maxTextHeight, 22, 8);
		hText = textStyles.h;
		pictureSize = hNet - hText;
		picStyles = { w: pictureSize, h: pictureSize };
		delete textStyles.h;
		delete textStyles.w;
	}
	let outerStyles = { rounding: 10, margin: w / 12, display: 'inline-block', w: w, h: h, padding: padding, bg: 'white', align: 'center', 'box-sizing': 'border-box' };
	if (options.showLabels == true && options.textPos == 'none' && nundef(options.h)) delete outerStyles.h;
	outerStyles = deepmergeOverride(outerStyles, ifs);
	let pic, text;
	for (let i = 0; i < items.length; i++) {
		let item = items[i];
		let k = item.key;
		let d = mDiv();
		if (isdef(item.textShadowColor)) {
			let sShade = '0 0 0 ' + item.textShadowColor;
			if (options.showPics) {
				picStyles['text-shadow'] = sShade;
				picStyles.fg = colorFrom('black', item.contrast); //'#00000080' '#00000030' 
			} else {
				textStyles['text-shadow'] = sShade;
				textStyles.fg = colorFrom('black', item.contrast); //'#00000080' '#00000030' 
			}
		}
		if (options.showPics) {
			pic = zPic(k, null, picStyles, true, false);
			delete pic.info;
			mAppend(d, pic.div);
		}
		if (options.showLabels) {
			textStyles.fg = item.fg;
			text = zText1Line(item.label, null, textStyles, hText);
			mAppend(d, text.div);
		}
		outerStyles.bg = item.bg;
		outerStyles.fg = item.fg;
		mStyleX(d, outerStyles);
		d.id = getUID();
		d.onclick = options.onclick;
		item.id = d.id;
		item.row = Math.floor(item.index / options.cols);
		item.col = item.index % options.cols;
		item.div = d;
		if (isdef(pic)) { item.pic = pic; item.fzPic = pic.innerDims.fz; }
		if (isdef(text)) item.text = text;
		item.isSelected = false;
		item.isLabelVisible = options.showLabels;
		item.dims = parseDims(w, w, d.style.padding);
		if (options.showRepeat) addRepeatInfo(d, item.iRepeat, w);
	}
}
function _createDivsS(items, ifs, options) {
	if (nundef(options.textPos)) options.textPos = 'none';
	let w = isdef(options.w) ? options.w : options.sz;
	let h = isdef(options.h) ? options.h : options.sz;
	let padding = (isdef(ifs.padding) ? ifs.padding : 1);
	let bo = ifs.border;
	bo = isdef(bo) ? isString(bo) ? firstNumber(bo) : bo : 0;
	let wNet = w - 2 * padding - 2 * bo;
	let hNet = h - 2 * padding - 2 * bo;
	let pictureSize = wNet;
	options.center = true;
	let picStyles = { w: wNet, h: isdef(options.center) ? hNet : hNet + padding };
	let textStyles, hText;
	if (options.showLabels) {
		let longestLabel = findLongestLabel(items);
		let oneWord = longestLabel.label.replace(' ', '_');
		let maxTextHeight = options.showPics ? hNet / 2 : hNet;
		textStyles = idealFontsize(oneWord, hNet, maxTextHeight, 22, 8);
		hText = textStyles.h;
		pictureSize = hNet - hText;
		picStyles = { w: pictureSize, h: pictureSize };
		delete textStyles.h;
		delete textStyles.w;
	}
	let outerStyles = { rounding: 10, margin: w / 12, display: 'inline-block', w: w, h: h, padding: padding, bg: 'white', align: 'center', 'box-sizing': 'border-box' };
	if (options.showLabels == true && options.textPos == 'none' && nundef(options.h)) delete outerStyles.h;
	outerStyles = deepmergeOverride(outerStyles, ifs);
	let pic, text;
	for (let i = 0; i < items.length; i++) {
		let item = items[i];
		let k = item.key;
		let d = mDiv();
		if (isdef(item.textShadowColor)) {
			let sShade = '0 0 0 ' + item.textShadowColor;
			if (options.showPics) {
				picStyles['text-shadow'] = sShade;
				picStyles.fg = colorFrom('black', item.contrast); //'#00000080' '#00000030' 
			} else {
				textStyles['text-shadow'] = sShade;
				textStyles.fg = colorFrom('black', item.contrast); //'#00000080' '#00000030' 
			}
		}
		if (options.showPics) {
			pic = zPicS(item, null, picStyles, true, false);
			delete pic.info;
			mAppend(d, pic.div);
		}
		if (options.showLabels) {
			textStyles.fg = item.fg;
			text = zText1Line(item.label, null, textStyles, hText);
			mAppend(d, text.div);
		}
		outerStyles.bg = item.bg;
		outerStyles.fg = item.fg;
		mStyleX(d, outerStyles);
		d.id = getUID();
		d.onclick = options.onclick;
		item.id = d.id;
		item.row = Math.floor(item.index / options.cols);
		item.col = item.index % options.cols;
		item.div = d;
		if (isdef(pic)) { item.pic = pic; item.fzPic = pic.innerDims.fz; }
		if (isdef(text)) item.text = text;
		item.isSelected = false;
		item.isLabelVisible = options.showLabels;
		item.dims = parseDims(w, w, d.style.padding);
		if (options.showRepeat) addRepeatInfo(d, item.iRepeat, w);
	}
}
function _createDom(domType) {
}
async function _dbInitX(dir = '../DATA/') {
	let users = await route_path_yaml_dict(dir + 'users.yaml');
	let settings = await route_path_yaml_dict(dir + 'settings.yaml');
	let addons = await route_path_yaml_dict(dir + 'addons.yaml');
	let games = await route_path_yaml_dict(dir + 'games.yaml');
	let tables = await route_path_yaml_dict(dir + 'tables.yaml');
	DB = {
		id: 'boardGames',
		users: users,
		settings: settings,
		games: games,
		tables: tables,
		addons: addons,
	};
	dbSaveX();
}
async function _dbLoadX(callback) {
	let path = './DB.yaml';
	DB = await route_path_yaml_dict(path);
	if (isdef(callback)) callback();
}
function _deepMerge(target, source, optionsArgument) {
	var array = Array.isArray(source);
	var options = optionsArgument || { arrayMerge: _defaultArrayMerge }
	var arrayMerge = options.arrayMerge || _defaultArrayMerge
	if (array) {
		return Array.isArray(target) ? arrayMerge(target, source, optionsArgument) : _cloneIfNecessary(source, optionsArgument)
	} else {
		return _mergeObject(target, source, optionsArgument)
	}
}
function _defaultArrayMerge(target, source, optionsArgument) {
	var destination = target.slice()
	source.forEach(function (e, i) {
		if (typeof destination[i] === 'undefined') {
			destination[i] = _cloneIfNecessary(e, optionsArgument)
		} else if (_isMergeableObject(e)) {
			destination[i] = deepmerge(target[i], e, optionsArgument)
		} else if (target.indexOf(e) === -1) {
			destination.push(_cloneIfNecessary(e, optionsArgument))
		}
	})
	return destination
}
function _deleteFromOwnerList(id) { let owner = IdOwner[id[2]]; if (isdef(owner)) removeInPlace(owner, id); }
function _deqSound() {
	let key = _qSound.shift();
	let url = _audioSources[key];
	_sndPlayer = new Audio(url);
	_sndPlayer.onended = _whenSoundPaused;
	_sndPlayer.onloadeddata = () => { _loaded = true; _sndPlayer.play(); };
	_sndPlayer.load();
}
function _emptyTarget(val) {
	return Array.isArray(val) ? [] : {}
}
function _enqSound(key) { if (nundef(_qSound)) _qSound = []; _qSound.push(key); }
function _evToClass(ev, className) {
	let elem = findParentWithClass(ev.target, className);
	return elem;
}
async function _experimental() {
	t01_fractions();
}
function _extendItemsAndOptions(items, options) {
	options.longestLabel = findLongestWord(items.map(x => x.label));
	options.wLongest = extendWidth(options.longestLabel);
	let ifs = options.ifs;
	for (let i = 0; i < items.length; i++) {
		let item = items[i];
		item.index = i;
		let val;
		for (const propName in ifs) {
			let prop = ifs[propName];
			if (isLiteral(prop)) val = prop;
			else if (isList(prop)) val = prop[i % prop.length];
			else if (typeof (prop) == 'function') val = prop(i, item, options, items);
			else val = null;
			if (isdef(val)) item[propName] = val;
		}
	}
	if (options.numRepeat > 1) { items = zRepeatEachItem(items, options.numRepeat, options.shufflePositions); }
	if (isdef(options.colorKeys)) items = zRepeatInColorEachItem(items, options.colorKeys);
	options.N = items.length;
	return items;
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
function _extendOptions_0(dArea, options, defOptions) {
	defOptions = {
		szPic: { w: 100, h: 100 },
		showLabels: true, maxlen: 25, luc: 'c', labelPos: 'bottom', lang: 'D',
		fzText: 20, fzPic: 60,
		padding: .025, gap: .1, isUniform: true, isRegular: true, fillArea: false,
		shufflePositions: false, sameBackground: true, showRepeat: false, repeat: 1,
		contrast: .32,
		ifs: {},
		handler: _standardHandler,
	};
	addKeys(defOptions, options);
	if (options.repeat > 1 && nundef(options.ifs.bg)) {
		let bg = isdef(options.colorKeys) ? 'white' : (i) => options.sameBackground ? computeColor('random') : 'random';
		options.ifs.bg = bg;
	}
	_calcFontPicFromText(options, false);
	options.area = getRect(dArea);
	options.idArea = dArea.id;
	options.aRatio = options.area.w / options.area.h;
	options.containerShape = options.area.w > options.area.h ? 'L' : 'P';
	if (nundef(options.labelStyles)) options.labelStyles = {};
	if (options.showLabels) {
		if (options.labelPos == 'bottom') options.labelBottom = true; else options.labelTop = true;
		options.labelStyles.fz = options.fzText;
	}
	options.picStyles = { fz: options.fzPic };
	options.outerStyles = {
		bg: 'blue', fg: 'contrast',
		display: 'inline-flex', 'flex-direction': 'column', 'place-content': 'center',
		padding: 0, box: true, rounding: 6,
	};
	return options;
}
function _extendOptionsFillArea(dArea, options) {
	defOptions = {
		szPic: { w: 100, h: 100 },
		showLabels: true, maxlen: 25, padding: .025, gap: .1,
		isUniform: true, fillArea: true,
		fzText: 8, luc: 'c', labelPos: 'bottom', lang: 'E',
	};
	if (nundef(options.fzPic)) options.fzPic = Math.floor(options.fzText * 4 * (options.luc == 'u' ? .7 : .6));
	_extendOptions_0(dArea, options, defOptions);
}
function _findBestCombiOrShrink(items, options, combis) {
	bestCombi = firstCond(combis, x => options.area.w / x.cols > options.szPicTest.w && options.area.h / x.rows > options.szPicTest.h);
	if (isdef(bestCombi)) return bestCombi;
	options.szPicTest = { w: .9 * options.szPicTest.w, h: .9 * options.szPicTest.h };
	return null;
}
function _findBestCombiOrShrinkWH(items, wTotal, hTotal, options, combis) {
	bestCombi = firstCond(combis, x => wTotal / x.cols > options.szPicTest.w && hTotal / x.rows > options.szPicTest.h);
	if (isdef(bestCombi)) return bestCombi;
	options.szPicTest = { w: .9 * options.szPicTest.w, h: .9 * options.szPicTest.h };
	return null;
}
function _findCollections(key, o) {
	let sets = [];
	_recFindCollections(key, o, sets);
	return sets;
}
function _gCreate(tag) { return document.createElementNS('http:/' + '/www.w3.org/2000/svg', tag); }
function _genOptions(opt = {}) {
	let defOptions = {
		szPic: { w: 100, h: 100 }, wper: 80, hper: 80, n: 20,
		showLabels: true, maxlen: 25, luc: 'c', labelPos: 'bottom', lang: 'D',
		fzText: 20, fzPic: 60,
		padding: .025, gap: .1, isUniform: true, isRegular: true, fillArea: false,
	};
	addKeys(defOptions, opt);
	if (nundef(opt.dArea)) opt.dArea = getMainAreaPercent(dTable, YELLOW, opt.wper, opt.hper, 'dArea');
	if (nundef(opt.items)) opt.items = genItems(opt.n, opt);
	_calcFontPicFromText(opt, false);
	opt.area = getRect(opt.dArea);
	opt.aRatio = opt.area.w / opt.area.h;
	opt.containerShape = opt.area.w > opt.area.h ? 'L' : 'P';
	if (nundef(opt.labelStyles)) opt.labelStyles = {};
	if (opt.showLabels) {
		if (opt.labelPos == 'bottom') opt.labelBottom = true; else opt.labelTop = true;
		opt.labelStyles.fz = opt.fzText;
	}
	opt.picStyles = { fz: opt.fzPic };
	opt.outerStyles = {
		bg: 'random', display: 'inline-flex', 'flex-direction': 'column', 'place-content': 'center',
		padding: 0, box: true, rounding: 6,
	};
	return opt;
}
function _get_layer(key, options) {
	let o = Geo.layerInfo[key];
	if (nundef(o)) o = Geo.layerInfo.empty;
	copyKeys(options, o.options);
	return L.tileLayer(o.url, o.options);
}
function _getChildrenOf(id) { let ui = UIS[id]; return ui.children; }
function _getCollectionType(o) {
	if (nundef(o)) return false;
	if (nundef(o._set) && !isList(o)) return false;
	let arr;
	if (isdef(o._set)) arr = o._set; else arr = o;
	if (!isList(arr) || isEmpty(arr)) return false;
	let type = null;
	let generic_type = null;
	for (const el of arr) {
		if (nundef(el)) return false;
		if (isdef(el._obj)) {
			if (type && type != '_obj') return false;
			type = '_obj';
			let oEl = G.table[el._obj];
			if (nundef(oEl)) return false;
			if (isdef(oEl.generic_type)) {
				if (!generic_type) generic_type = oEl.generic_type;
				if (generic_type != oEl.generic_type) return false;
			}
		} else {
			if (type == '_obj') return false;
			if (!type) type = generic_type = 'string';
		}
	}
	return { type: type, generic_type: generic_type };
}
function _getKeysCond(n, cond, keySet = 'all') {
	if (isString(keySet)) keySet = KeySets[keySet];
	let keys = isdef(cond) ? isString(cond) ?
		isdef(KeySets[cond]) ? KeySets[cond] : keySet.filter(x => x.includes(cond))
		: keySet.filter(x => cond(Syms[x])) : keySet;
	keys = n >= keys.length ? keys : choose(keys, n);
	return keys;
}
function _getRandomRegularN(from = 2, to = 100) {
	const arr = [2, 3, 4, 6, 8, 9, 12, 15, 16, 20, 24, 30, 36, 40, 42, 44, 48, 56, 64, 72, 84, 96, 100];
	return chooseRandom(arr.filter(x => x >= from && x <= to));
}
function _getRegularN(from = 2, to = 100) {
	const arr = [2, 3, 4, 6, 8, 9, 12, 15, 16, 20, 24, 30, 36, 40, 42, 44, 48, 56, 64, 72, 84, 96, 100];
	return arr.filter(x => x >= from && x <= to);
}
function _getSLCombis(n, onlyRegular = false, addColsRows_cr = false) {
	let sq = Math.ceil(Math.sqrt(n));
	let res = [];
	for (let i = 1; i <= sq; i++) {
		let s = i;
		let l = Math.ceil(n / s);
		if (s <= l && s * l >= n) res.push({ s: s, l: l });
	}
	if (onlyRegular) res = res.filter(x => x.s * x.l == n);
	if (addColsRows_cr) {
		let resX = [];
		for (const res1 of res) {
			resX.push({ rows: res1.s, cols: res1.l, s: res1.s, l: res1.l, sum: res1.s + res1.l });
			if (res1.s != res1.l) resX.push({ rows: res1.l, cols: res1.s, s: res1.s, l: res1.l, sum: res1.s + res1.l });
		}
		sortBy(resX, 'rows');
		sortBy(resX, 'sum');
		return resX;
	}
	return res;
}
function _getSymbolKey(name) { return name.replace(new RegExp(' ', 'g'), '_').toLowerCase(); }
function _getTestPathForPlayerNum() { return GAME + (USE_MAX_PLAYER_NUM ? '_max' : ''); }
function _getTransformInfoDOM(d) {
	let t = d.style.transform;
	console.log(t)
	getTranslateX(d);
}
function _gSizeToContent(svg) {
	var bbox = svg.getBBox();
	svg.setAttribute("width", bbox.x + bbox.width + bbox.x);
	svg.setAttribute("height", bbox.y + bbox.height + bbox.y);
}
function _handChanged(oids, area) {
	let idHand = area;
	let hand = UIS[idHand];
	if (nundef(hand)) return false;
	let cards = hand.cards;
	if (nundef(cards) && isEmpty(oids)) return false;
	if (isdef(hand) && isdef(hand.cards)) return !sameList(oids, hand.cards);
	else return true;
}
function _handleEvent(ev) { ev.cancelBubble = true; return evToItem(ev); }
function _handleTextTooSmall(fz, fzPic, wn, hn, options) {
	console.log('???????fzText too small!!!', fz, 'fzPic', fzPic, 'N=', options.N, !options.isUniform);
	fz = Math.ceil(fz + 2);
	fzPic = Math.floor(Math.min(hn - fz * 1.5, fz * 3));
	options.fzPic = options.picStyles.fz = fzPic;
	options.fzText = options.labelStyles.fz = fz;
}
function _hexGrid(loc, idBoard, sBoard, soDict) {
	let board = createGrid(loc, idBoard, sBoard, soDict, 'hex');
	addVisuals(board);
	return board;
}
function _hideBoat(id) { let mobj = UIS[id]; mobj.hide(); mobj.o.weg = true; }
function _highlightAndMagnify(ev, mobj, partName) {
	magnifyFront(mobj.id);
	highlightMsAndRelatives(ev, mobj, partName);
}
function _highlightBoat(id) {
	if (id === null) return;
	if (boatHighlighted) {
		if (boatHighlighted.id == id) return;
		else _unhighlightBoat();
	}
	boatHighlighted = UIS[id];
	boatHighlighted.elem.scrollIntoView(false);
	highlightMsAndRelatives(null, boatHighlighted);
	_openInfoboxesForBoatOids(boatHighlighted);
}
function _highlightNextBoat() {
	if (!boatHighlighted) _highlightBoat(getFirstBoatId());
	else {
		let idx = boatHighlighted.o.iTuple + 1;
		_highlightBoat(getBoatIdByIdx(boatHighlighted.o.iTuple + 1));
	}
}
function _highlightPrevBoat() {
	if (!boatHighlighted) _highlightBoat(getLastBoatId()); else _highlightBoat(getBoatIdByIdx(boatHighlighted.o.iTuple - 1));
}
function _initAutoplayToActionButtons() {
	let d = document.getElementById('a_d_autoplay_buttons');
	let buttons = [...d.children];
	let defaultIds = ['c_b_NextPlayer', 'c_b_NextTurn', 'c_b_NextPhase'];
	let kws = lookup(S.settings, ['dev', 'run_to_buttons']);
	if (!kws) kws = {};
	let kwKeys = getKeys(kws);
	let requiredButtonIds = kwKeys.map(x => 'c_b_RTA_' + x).concat(defaultIds);
	let actualButtons = buttons.filter(x => x.id).map(x => x.id);
	for (const id of arrMinus(actualButtons, requiredButtonIds)) $('#' + id).remove();
	for (const id of arrMinus(requiredButtonIds, actualButtons)) {
		let b = document.createElement('button');
		let key = id.substring(8);
		b.innerHTML = kws[key];
		b.id = id;
		b.onclick = () => onClickRunToAction(key);
		d.appendChild(b);
	}
}
function _initCheatButtons() {
	let areaName = 'a_d_cheat_buttons';
	let kws = lookup(S.settings, ['dev', 'cheat_buttons']);
	if (!kws) { hide(areaName); return; }
	show(areaName);
	let d = document.getElementById(areaName);
	let buttons = [...d.children];
	let kwKeys = getKeys(kws);
	let requiredButtonIds = kwKeys.map(x => 'c_b_CHT_' + x);
	let actualButtons = buttons.filter(x => x.id).map(x => x.id);
	for (const id of arrMinus(actualButtons, requiredButtonIds)) $('#' + id).remove();
	for (const id of arrMinus(requiredButtonIds, actualButtons)) {
		let b = document.createElement('button');
		let key = id.substring(8);
		b.innerHTML = kws[key];
		b.id = id;
		b.onclick = () => onClickCheat(key);
		d.appendChild(b);
	}
}
function _initGameGlobals() {
	S.user = {};
	G = { table: {}, players: {} };
	UIS = {};
	IdOwner = {};
	id2oids = {};
	oid2ids = {};
	id2uids = {};
}
function _initPlayers() {
	S.players = {};
	G.players = {};
	let ckeys = Object.keys(playerColors);
	let i = 0;
	for (const id in G.serverData.players) {
		let pl = G.serverData.players[id];
		let colorName = isdef(pl.color) ? pl.color : ckeys[i];
		colorName = colorName.toLowerCase();
		let altName = capitalize(colorName);
		let color = isdef(playerColors[colorName]) ? playerColors[colorName] : colorName;
		let plInfo = firstCond(S.gameConfig.players, x => x.id == id);
		S.players[id] = { username: plInfo.username, playerType: plInfo.playerType, agentType: plInfo.agentType, id: id, color: color, altName: altName, index: plInfo.index };
		i += 1;
	}
}
function _initScenarioButtons() {
	let areaName = 'a_d_scenario_buttons';
	let kws = lookup(S.settings, ['dev', 'scenario_buttons']);
	if (!kws) { hide(areaName); return; }
	show(areaName);
	let d = document.getElementById(areaName);
	let buttons = [...d.children];
	let kwKeys = getKeys(kws);
	let requiredButtonIds = kwKeys.map(x => 'c_b_SCE_' + x);
	let actualButtons = buttons.filter(x => x.id).map(x => x.id);
	for (const id of arrMinus(actualButtons, requiredButtonIds)) $('#' + id).remove();
	for (const id of arrMinus(requiredButtonIds, actualButtons)) {
		let b = document.createElement('button');
		let key = id.substring(8);
		let caption = kws[key];
		b.innerHTML = caption;
		b.id = id;
		b.onclick = () => onClickPushScenario(stringBefore(caption, ' '), stringAfter(caption, ' '));
		d.appendChild(b);
	}
}
function _initServer(callbacks = []) {
	S = { path: {}, user: {}, settings: {}, vars: {} };
	counters = { msg: 0, click: 0, mouseenter: 0, mouseleave: 0, events: 0 };
	setDefaultSettings();
	if (!isEmpty(callbacks)) callbacks[0](arrFromIndex(callbacks, 1));
}
function _isInHand(oidCard, idHand) {
	let hand = UIS[idHand];
	let cards = hand.cards;
	return isdef(cards) && cards.includes(oidCard);
}
function _isMergeableObject(val) {
	var nonNullObject = val && typeof val === 'object'
	return nonNullObject
		&& Object.prototype.toString.call(val) !== '[object RegExp]'
		&& Object.prototype.toString.call(val) !== '[object Date]'
}
async function _loader() {
	Daat = {};
	if (CLEAR_LOCAL_STORAGE) localStorage.clear();
	C52 = await localOrRoute('C52', '../assets/c52.yaml');
	symbolDict = Syms = await localOrRoute('syms', '../assets/allSyms.yaml');
	SymKeys = Object.keys(Syms);
	ByGroupSubgroup = await localOrRoute('gsg', '../assets/symGSG.yaml');
	WordP = await route_path_yaml_dict('../assets/math/allWP.yaml');
	DB = await route_path_yaml_dict('./DB.yaml');
	console.assert(isdef(DB));
	DA = {}; Items = {};
	Speech = new SpeechAPI('E');
	KeySets = getKeySets();
	TOMan = new TimeoutManager();
	_start();
}
async function _loader_dep() {
	Daat = {};
	if (CLEAR_LOCAL_STORAGE) localStorage.clear();
	C52 = await localOrRoute('C52', '../assets/c52.yaml');
	symbolDict = Syms = await localOrRoute('syms', '../assets/allSyms.yaml');
	SymKeys = Object.keys(Syms);
	ByGroupSubgroup = await localOrRoute('gsg', '../assets/symGSG.yaml');
	WordP = await route_path_yaml_dict('../assets/math/allWP.yaml');
	if (BROADCAST_SETTINGS) {
		await _dbInitX();
		_start0();
	} else { dbLoadX(_start0); }
}
function _makeCardDivAristocracy(oid, o) {
	let elem = document.createElement('div');
	let faceElem = document.createElement('div');
	let backElem = document.createElement('div');
	faceElem.classList.add('face');
	backElem.classList.add('back');
	let cardName = isdef(o.name) ? o.name : 'King';
	let rank = cards52GetRankFromName(cardName);
	let suit = 0;
	elem.faceElem = faceElem;
	elem.backElem = backElem;
	elem.isCard = true;
	elem.suit = suit;
	elem.rank = rank;
	setSide(elem, 'front');
	return elem;
}
function _makeCardDivCatan(oid, o) {
	let symbolKeyPropName = 'name';
	let key = _getSymbolKey(o[symbolKeyPropName]);
	let symbol = symbols[key];
	let color = symbolColors[key];
	let d = document.createElement('div');
	$(d).on("mouseenter", function () { magnifyFront(this.id); });
	$(d).on("mouseleave", function () { minifyBack(this.id); });
	d.innerHTML = 'hallo';
	d.style.position = 'absolute';
	let dx = 0;
	d.style.left = '' + dx + 'px';
	d.style.top = '0px';
	let ch = iconChars[symbol];
	let text = String.fromCharCode('0x' + ch);
	let family = (ch[0] == 'f' || ch[0] == 'F') ? 'pictoFa' : 'pictoGame';
	d.innerHTML = `
				<div class="cardCatan">
						<p style='font-size:22px;'>${o.name}</p>
						<div class="cardCenter">
								<div class="circular" style='background:${color}'><span style='color:white;font-size:70px;font-weight:900;font-family:${family}'>${text}</span></div>
						</div>
						<hr>
						<p style='font-size:20px;'>${o.desc}</p>
						<div style='color:${color};position:absolute;left:8px;top:8px;width:35px;height:35px'>
								<span style='font-family:${family}'>${text}</span>
						</div>
				</div>
		`;
	return d;
}
function _makeCardDivDefault(oid, o) {
	let symbolKeyPropName = 'name';
	let key = _getSymbolKey(o[symbolKeyPropName]);
	let symbol = symbols[key];
	let color = symbolColors[key];
	let d = document.createElement('div');
	$(d).on("mouseenter", function () { magnifyFront(this.id); });
	$(d).on("mouseleave", function () { minifyBack(this.id); });
	d.innerHTML = 'hallo';
	d.style.position = 'absolute';
	let dx = 0;
	d.style.left = '' + dx + 'px';
	d.style.top = '0px';
	let ch = iconChars[symbol];
	let text = String.fromCharCode('0x' + ch);
	let family = (ch[0] == 'f' || ch[0] == 'F') ? 'pictoFa' : 'pictoGame';
	d.innerHTML = `
				<div class="cardCatan">
						<p style='font-size:22px;'>${o.name}</p>
						<div class="cardCenter">
								<div class="circular" style='background:${color}'><span style='color:white;font-size:70px;font-weight:900;font-family:${family}'>${text}</span></div>
						</div>
						<hr>
						<p style='font-size:20px;'>${o.desc}</p>
						<div style='color:${color};position:absolute;left:8px;top:8px;width:35px;height:35px'>
								<span style='font-family:${family}'>${text}</span>
						</div>
				</div>
		`;
	return d;
}
function _makeDefault(id, oid, o, areaName, title) {
	if (isdef(UIS[id])) { error('CANNOT create ' + id + ' TWICE!!!!!!!!!'); return; }
	let mobj = new MOBJ();
	mobj.id = id;
	let domel = document.createElement('div');
	domel.style.cursor = 'default';
	mobj.elem = domel;
	mobj.parts.elem = mobj.elem;
	mobj.domType = getTypeOf(domel);
	mobj.cat = DOMCATS[mobj.domType];
	let idParent = areaName;
	mobj.idParent = idParent;
	let parent = UIS[idParent];
	parent.children.push(id);
	let sTitle = title;
	mobj.title(sTitle);
	mobj.o = o;
	mobj.isa[o.obj_type] = true;
	linkObjects(id, oid);
	listKey(IdOwner, id[2], id);
	UIS[id] = mobj;
	mobj.attach();
	return mobj;
}
function _makeGameplayerArea(plAreaName, areaName) {
	let deckArea = getMainArea(defaultDeckAreaName);
	let parentArea = UIS[areaName];
	if (isdef(deckArea)) {
		let x = deckArea.w;
		let h = parentArea.h / 2;
		let y = h;
		let w = parentArea.w - deckArea.w;
		let mobj = makeArea(plAreaName, areaName);
		mobj.setBg('seagreen');
		mobj.setBounds(x, y, w, h, 'px');
		mobj.nextCoords = { x: 0, y: 0 };
		mobj.elem.classList.add('flexWrap');
		return mobj;
	}
}
function _makeGridGrid(items, options, dGrid, showBorder = false) {
	let wcol = options.isUniform ? '1fr' : 'auto';
	let display = options.fillArea ? 'grid' : 'inline-grid';
	mStyleX(dGrid, {
		display: display,
		'grid-template-columns': `repeat(${options.cols}, ${wcol})`,
		gap: options.gap,
		box: true
	});
	if (showBorder) mStyleX(dGrid, { border: '5px solid yellow' });
}
function _makeGroundShape(mobj, x, y, w, h, color, shape, { dx = 0, dy = 0, x1, y1, x2, y2, overlay, scale, scaleX, scaleY, rot, color2, setFg, border, thickness, alpha, idx, rounding } = {}) {
	let r = _addShape(mobj, w, h, color, shape, { dx: dx, dy: dy, x1: x1, y1: y1, x2: x2, y2: y2, border: border, thickness: thickness, alpha: alpha, idx: idx, rounding: rounding })
	mobj.orig.shape = shape;
	let ov = overlay ? mobj['_' + shape]() : null;
	if (ov) ov.setAttribute('class', 'overlay');
	let t = getTypeOf(r);
	if (ov) {
		if (t == 'rect' || t == 'image') { _setRectDims(ov, w, h, dx, dy); }
		else if (t == 'ellipse') { _setEllipseDims(ov, w, h, dx, dy); }
		else if (t == 'polygon') { let pts = r.getAttribute('points'); ov.setAttribute('points', pts); }
		else if (t == 'line') { _setLineDims(r, x1, y1, x2, y2) }
		if (rounding) {
			ov.setAttribute('rx', rounding);
			ov.setAttribute('ry', rounding);
		}
		mobj.elem.appendChild(ov);
		mobj.overlay = ov;
	}
	mobj.bg = mobj.orig.bg = color;
	if (setFg || color2) mobj.fg = mobj.orig.fg = color2 ? color2 : colorIdealText(color);
	mobj.orig.w = mobj.w = w;
	mobj.orig.h = mobj.h = h;
	mobj.orig.x = mobj.x = x;
	mobj.orig.y = mobj.y = y;
	if (isdef(scale)) { scaleX = scaleY = scale; }
	mobj.orig.scaleX = mobj.scaleX = scaleX ? scaleX : 1;
	mobj.orig.scaleY = mobj.scaleY = scaleY ? scaleY : 1;
	mobj.orig.scale = mobj.scale = scale ? scale : 1;
	mobj.orig.rot = mobj.rot = rot ? rot : 0;
	if (isdef(scaleX) || isdef(scaleX) || isdef(rot)) mobj._setTransform(mobj.elem, { x: x, y: y, scaleX: scaleX, scaleY: scaleY, rotDeg: rot });
	else mobj.setPos(x, y);
	mobj.ground = r;
	return mobj;
}
function _makeHandArea(key, handAreaName, parentAreaId) {
	let parentArea = UIS[parentAreaId];
	if (isdef(parentArea)) {
		let mobj = makeArea(handAreaName, parentAreaId);
		mobj.setBg(randomColor());
		mobj.title(stringAfter(key, '.'));
		let bTitle = getBounds(mobj.parts.title);
		mobj.parts['title'].fontSize = '12px';
		mobj.elem.style.minWidth = bTitle.width + 'px'; //'90px';
		mobj.elem.style.minHeight = '160px';
		mobj.body('hand');
		let div = mobj.parts['hand'];
		div.style.position = 'relative';
		div.style.left = '10px';
		div.style.top = '10px';
		div.style.width = 'auto';
		div.style.height = 'auto';
		return mobj;
	}
}
function _makeNoneGrid(items, options, dGrid) {
	options.szPic = { w: options.area.w / options.cols, h: options.area.h / options.rows };
	_setRowsColsSize(options);
	for (const item of items) {
		let live = item.live;
		if (options.isUniform) {
			mStyleX(live.div, { w: options.szPic.w, h: options.szPic.h, margin: options.gap / 2, padding: options.padding / 2 });
		} else {
			mStyleX(live.div, { margin: options.gap / 2, padding: options.padding });
		}
		mStyleX(live.dLabel, { fz: options.fzText });
		mStyleX(live.dPic, { fz: options.fzPic });
	}
	mStyleX(dGrid, { padding: 0, border: '5px solid blue', box: true })
	let ov = getVerticalOverflow(dGrid);
	if (Math.floor(ov) == 0 && !options.isUniform) {
		_tryGrow(items, options);
	}
	if (ov > 0) {
		options.fzPic = options.picStyles.fz = options.fzPic * .9;
		for (const it of items) { mStyleX(lGet(it).dPic, { fz: options.fzPic }); }
		ov = getVerticalOverflow(dGrid);
		let newGap = Math.ceil(options.gap / 2);
		while (ov > 0) {
			for (const it of items) { mStyleX(lDiv(it), { fz: 4, margin: newGap, padding: newGap / 2, rounding: 0 }); }
			ov = getVerticalOverflow(dGrid);
			if (ov && newGap == 1) {
				for (const it of items) { mStyleX(lDiv(it), { margin: 0, padding: 0 }); }
				break;
			}
			newGap = Math.ceil(newGap / 2);
		}
	}
}
function _makeTabletopCardsArea(areaName) {
	let deckArea = getMainArea(defaultDeckAreaName);
	let parentArea = UIS[areaName];
	if (isdef(deckArea)) {
		let x = deckArea.w;
		let h = parentArea.h / 2;
		let y = 0;
		let w = parentArea.w - deckArea.w;
		let id = 'tabletopCardsArea';
		let mobj = makeArea(id, areaName);
		mobj.setBg('seagreen');
		mobj.setBounds(x, y, w, h, 'px');
		mobj.nextCoords = { x: 0, y: 0 };
		mobj.elem.classList.add('flexWrap');
		return mobj;
	}
}
function _mergeObject(target, source, optionsArgument) {
	var destination = {}
	if (_isMergeableObject(target)) {
		Object.keys(target).forEach(function (key) {
			destination[key] = _cloneIfNecessary(target[key], optionsArgument)
		})
	}
	Object.keys(source).forEach(function (key) {
		if (!_isMergeableObject(source[key]) || !target[key]) {
			destination[key] = _cloneIfNecessary(source[key], optionsArgument)
		} else {
			destination[key] = _deepMerge(target[key], source[key], optionsArgument)
		}
	})
	return destination;
}
function _mergeOptions() {
	if (isdef(S.user.spec) && isdef(S.user.spec.SETTINGS)) {
		for (const k in S.user.spec.SETTINGS) {
			if (isdef(S.settings[k])) {
				S.settings[k] = deepmerge(S.settings[k], S.user.spec.SETTINGS[k], { arrayMerge: overwriteMerge });
			} else {
				S.settings[k] = S.user.spec.SETTINGS[k];
			}
		}
	}
}
function _mPlayPause(dParent, styles = {}, handler = null) {
	if (!handler) handler = audio_onclick_pp;
	let html = `
				<section id="dButtons">
						<a id="bPlay" href="#" }">
								<i class="fa fa-play fa-2x"></i>
						</a>
						<a id="bPause" href="#" style="display: none">
								<i class="fa fa-pause fa-2x"></i>
						</a>
				</section>
		`;
	let pp = mCreateFrom(html);
	mAppend(dParent, pp);
	mStyle(pp, styles);
	mBy('bPlay').onclick = () => { hide0('bPlay'); show0('bPause'); handler(); }
	mBy('bPause').onclick = () => { hide0('bPause'); show0('bPlay'); handler(); }
	return { button: pp, show_play: () => { hide0('bPause'); show0('bPlay'); }, show_pause: () => { hide0('bPlay'); show0('bPause'); } };
}
function _mStamp(d1, text, color, sz) {
	mStyle(d1, { position: 'relative' });
	let r = getRect(d1);
	let [w, h] = [r.w, r.h];
	color = ['green', 'red', 'blue'].includes(color) ? color : 'black';
	sz = valf(sz, r.h / 7);
	console.log('r', r, 'sz', sz);
	let [padding, border, rounding, angle] = [sz / 10, sz / 6, sz / 8, rNumber(-25, 25)];
	let d2 = mDiv(d1, {
		fg: color,
		position: 'absolute', top: 25, left: 5,
		transform: `rotate(${angle}deg)`,
		fz: sz,
		hpadding: 2,
		vpadding: 0,
		rounding: rounding,
		weight: 400,
		display: 'inline-block',
		'text-transform': 'uppercase',
		family: 'fredericka',
		'mix-blend-mode': 'multiply',
	}, null, text);
	mClass(d2, `${color}stamp`);
}
function _mtest() {
	MSInit();
}
function _onPlayerChange(pid) {
	if (isPlain()) return;
	if (!G.playerChanged || pid != G.player) return;
	let o = G.playersAugmented[pid];
	_updatePageHeader(pid);
	if (G.previousPlayer) _updateLogArea(G.previousPlayer, pid);
	let mobj = getVisual(pid);
	if (mobj) {
	}
	let msDef = getDefVisual(pid);
	if (msDef) {
		let msParentId = msDef.parentId;
		let msParent = UIS[msParentId];
		var target = msDef.elem;
		target.parentNode.scrollTop = target.offsetTop;
	}
}
function _openInfoboxesForBoatOids(boat) {
	let oids = boat.o.oids;
	let mainIds = oids.map(x => getMainId(x));
	for (const id of mainIds) {
		let mobj = UIS[id];
		openInfobox(null, mobj);
	}
}
function _paramsQ(parr) {
	parr = isdef(parr) ? parr : [];
	for (let i = 0; i < parr.length; i++) {
		let para = parr[i];
		if (para == '_last') parr[i] = arrLast(AkQ);
		else if (para == '_all' || para == '_list') parr[i] = AkQ;
		else if (para == '_first') parr[i] = AkQ[0];
	}
	return parr;
}
function _pickStringForAction(x) {
	if (x.type == 'fixed') return x.val;
	if (x.type == 'obj') return x.ID;
	if (x.type == 'player') return x.val;
}
function _playersCreateNew() {
	for (const pid of G.playersCreated) {
		if (!defaultVisualExists(pid) && S.settings.player.createDefault)
			makeDefaultPlayer(pid, G.playersAugmented[pid], S.settings.player.defaultArea);
		if (mainVisualExists(pid)) continue;
		let updatedVisuals;
		if (S.settings.userBehaviors) {
			updatedVisuals = runBehaviors(pid, G.playersAugmented, PLAYER_CREATE);
		}
		if (nundef(updatedVisuals) || !updatedVisuals.includes(pid)) {
			if (isPlain()) {
				let mobj = makeMainPlayer(pid, G.playersAugmented[pid], S.settings.player.defaultMainArea);
				if (mobj === null && !defaultVisualExists(pid) && S.settings.table.createDefault != false) {
					makeDefaultObject(pid, G.playersAugmented[pid], S.settings.table.defaultArea);
				}
			}
		}
	}
}
function _playersUpdate() {
	for (const pid in G.playersUpdated) {
		let pl = G.playersAugmented[pid];
		let updatedVisuals = {};
		if (S.settings.userBehaviors) {
			updatedVisuals = runBehaviors(pid, G.playersAugmented, PLAYER_UPDATE);
			runBindings(pid, G.playersAugmented)
		}
		let mobj = getVisual(pid);
		if (!updatedVisuals[pid] && isdef(mobj)) {
			presentMainPlayer(pid, mobj, G.playersAugmented, false);
		}
		if (!isPlain() && !updatedVisuals[pid] && S.settings.hasCards) {
			if (G.player == pid) {
				if (G.playerChanged) {
					switchPlayerArea();
				}
				updateGameplayerCardCollections(pid, pl);
			}
		}
		if (!S.settings.player.createDefault || mobj && S.settings.player.createDefault != true) continue;
		let plms = presentDefault(pid, pl, false);
		_onPlayerChange(pid);
	}
}
function _poll() {
	if (nundef(U) || nundef(Z) || nundef(Z.friendly)) { console.log('poll without U or Z!!!', U, Z); return; }
	show_polling_signal();
	if (nundef(DA.pollCounter)) DA.pollCounter = 0; DA.pollCounter++; console.log('polling');
	if (Z.game == 'feedback' && i_am_host()) {
		send_or_sim({ friendly: Z.friendly, uname: Z.uplayer, fen: Z.fen, write_fen: true, auto: true }, 'table');
	} else send_or_sim({ friendly: Z.friendly, uname: Z.uplayer, auto: true }, 'table');
}
async function _preloader() {
	timit = new TimeIt('timit', EXPERIMENTAL);
	if (FASTSTART) {
		let syms = localStorage.getItem('syms');
		if (isdef(syms)) {
			console.log('from local');
			Syms = JSON.parse(syms);
		} else {
			Syms = await route_path_yaml_dict('../assets/syms.yaml');
			localStorage.setItem('syms', JSON.stringify(Syms));
		}
		SymKeys = Object.keys(Syms);
		dTable = mBy('table');
		mText('hallo', dTable, { fz: 100 });
		timit.show('DONE')
	} else _loader();
}
function _prepText1_dep(items, ifs, options) {
	//#region phase2: prepare items for container
	options.showLabels = true;
	let sz = options.sz;
	let padding = (isdef(ifs.padding) ? ifs.padding : 1);
	let bo = ifs.border;
	bo = isdef(bo) ? isString(bo) ? firstNumber(bo) : bo : 0;
	let szNet = sz - 2 * padding - 2 * bo;
	let textStyles, hText;
	if (options.showLabels) {
		let longestLabel = findLongestLabel(items);
		let oneWord = longestLabel.label.replace(' ', '_');
		textStyles = idealFontsize(oneWord, szNet, szNet, 22, 8);
		hText = textStyles.h;
		delete textStyles.h;
		delete textStyles.w;
	}
	let outerStyles = { rounding: 10, margin: sz / 12, display: 'inline-block', w: sz, padding: padding, bg: 'white', align: 'center', 'box-sizing': 'border-box' };
	outerStyles = deepmergeOverride(outerStyles, ifs);
	let pic, text;
	for (let i = 0; i < items.length; i++) {
		let item = items[i];
		let k = item.key;
		let d = mDiv();
		if (isdef(item.textShadowColor)) {
			let sShade = '0 0 0 ' + item.textShadowColor;
			textStyles['text-shadow'] = sShade;
			textStyles.fg = colorFrom('black', item.contrast); //'#00000080' '#00000030' 
		}
		if (options.showLabels) {
			textStyles.fg = item.fg;
			text = zText1Line(item.label, null, textStyles, hText);
			mAppend(d, text.div);
		}
		outerStyles.bg = item.bg;
		outerStyles.fg = item.fg;
		mStyleX(d, outerStyles);
		d.id = getUID();
		d.onclick = options.onclick;
		item.id = d.id;
		item.row = Math.floor(item.index / options.cols);
		item.col = item.index % options.cols;
		item.div = d;
		item.pic = null;
		item.isSelected = false;
		item.isLabelVisible = options.showLabels;
		item.dims = parseDims(sz, sz, d.style.padding);
		if (options.showRepeat) addRepeatInfo(d, item.iRepeat, sz);
		item.fzPic = 0;
	}
	//#endregion
}
function _preselectFirstVisualsForBoats() {
	let oidlist = [];
	for (const id of getBoatIds()) {
		let oids = id2oids[id];
		if (isdef(oids)) oids.map(x => addIf(oidlist, x))
	}
	let vislist = oidlist.map(x => getMainId(x)).filter(x => x !== null);
	vislist = vislist.concat(oidlist.map(x => getDefId(x)));
	vislist.map(id => UIS[id].highFrame());
}
function _presentLocationChange(oid, mobj) {
	if (G.table[oid].obj_type == 'robber') {
		let o = G.table[oid];
		let changedProps = G.tableUpdated[oid];
		if (changedProps.summary.includes('loc')) {
			let oidLoc = o.loc._obj;
			let visLoc = getVisual(oidLoc);
			mobj.setPos(visLoc.x, visLoc.y);
		}
	}
}
function _quadGrid(loc, idBoard, sBoard, soDict) {
	let board = createGrid(loc, idBoard, sBoard, soDict, 'quad');
	addVisuals(board);
	return board;
}
function _rChoose(arr, n = 1, func = null, exceptIndices = null) {
	let arr1 = jsCopy(arr);
	if (isdef(exceptIndices)) {
		for (const i of exceptIndices) removeInPlace(arr1, arr[i]);
	}
	if (isdef(func)) arr1 = arr1.filter(func);
	if (n == 1) {
		let idx = Math.floor(Math.random() * arr1.length);
		return arr1[idx];
	}
	arrShufflip(arr1);
	return arr1.slice(0, n);
}
function _recFindCollections(key, o, sets) {
	let tt = _getCollectionType(o);
	if (tt) {
		sets.push({ name: key, key: key, type: tt.type, generic_type: tt.generic_type, hand: o, arr: getSimpleSetElements(o) });
	} else if (isDict(o)) {
		for (const k in o) {
			let newSets = [];
			_recFindCollections(key + '.' + k, o[k], newSets);
			for (const s of newSets) {
				sets.push(s);
			}
		}
	} else if (isList(o)) {
		let i = 0;
		for (const cand of o) {
			let k = key + '_' + i;
			i += 1;
			let newSets = [];
			_recFindCollections(k, cand, newSets);
			for (const s of newSets) {
				sets.push(s);
			}
		}
	}
}
function _reduceFontsBy(tx, px, items, options) {
	fz = options.fzText - tx;
	fzPic = options.fzPic - px;
	options.fzPic = options.picStyles.fz = fzPic;
	options.fzText = options.labelStyles.fz = fz;
	for (const item of items) {
		let ui = item.live;
		if (tx != 0) mStyleX(ui.dLabel, { fz: fz });
		if (px != 0) mStyleX(ui.dPic, { fz: fzPic });
	}
}
function _reduceSizeBy(tx, px, items, options) {
	w = options.szPic.w - tx;
	h = options.szPic.h - tx;
	fz = options.fzText - tx;
	fzPic = options.fzPic - px;
	options.fzPic = options.picStyles.fz = fzPic;
	options.fzText = options.labelStyles.fz = fz;
	options.szPic = { w: w, h: h };
	for (const item of items) {
		let ui = item.live;
		if (tx != 0) {
			mStyleX(ui.dLabel, { fz: fz }); mStyleX(ui.div, { w: w, h: h });
		}
		if (px != 0) mStyleX(ui.dPic, { fz: fzPic });
	}
	console.log('fonts set to', fz, fzPic);
}
function _register(o, keyword, func) {
	if (nundef(S.registry[keyword])) S.registry[keyword] = {};
	S.registry[keyword][o.id] = func;
}
function _removeAllHighlighting(id) { let mobj = UIS[id]; mobj.unhighAll(); }
function _removeClickHandler(id) { let mobj = UIS[id]; mobj.removeClickHandler(); }
function _removeFilterHighlight(mobj) { mobj.unhighC(); }
function _removeHoverHandlers(id) { let mobj = UIS[id]; mobj.removeHoverHandlers(); }
function _removeInteraction(id) { let mobj = UIS[id]; mobj.removeHandlers(); mobj.unhighAll(); }
function _repositionCards(msHand) {
	if (msHand.numCards == 0) return;
	let dTitle = msHand.parts.title;
	let dBody = msHand.parts.hand;
	let dHand = msHand.elem;
	let bTitle = getBounds(dTitle);
	let bBody = getBounds(dBody, true);
	let bHand = getBounds(dHand);
	let yBody = bTitle.height;
	let hHand = msHand.hHand;
	let hAvailable = hHand - yBody;
	let wHand = bHand.width;
	let W = wHand;
	let H = hHand;
	let w = msHand.wCard;
	let h = msHand.hCard;
	let n = msHand.numCards;
	let x, y, dx, padding;
	let offset = { x: 0, y: 0 };
	if (msHand.adjustSize) {
		W = w + (n) * w / 4;
		H = h;
		padding = 0;
		msHand.setSize(W + 2 * padding + yBody, H);
		x = padding + offset.x;
		y = padding + offset.y;
	} else {
		padding = x = y = 0;
	}
	dx = n > 1 ? (W - w) / (n - 1) : 0;
	if (dx > w) dx = w;
	let i = 0;
	for (const oidCard of msHand.cards) {
		let id = getMainId(oidCard);
		let c = UIS[id];
		c.zIndex = c.elem.style.zIndex = i;
		i += 1;
		c.setPos(x, y);
		x += dx;
	}
}
function _runQ() {
	QCounter += 1; console.log('===>run', QCounter, Q);
	if (isEmpty(Q)) { console.log('Q empty!', AkQ); return; }
	let task = Q.shift();
	let f = task.f;
	let parr = _paramsQ(task.parr);
	console.log('task:', f.name, 'params', parr)
	let result = f(...parr);
	if (isdef(result)) AkQ.push(result);
	if (!isEmpty(Q)) runQ();
}
function _runRegistry(keyword) {
	if (nundef(S.registry[keyword])) return;
	for (const id in S.registry[keyword]) {
		S.registry[keyword][id](getVisual(id));
	}
}
function _saveAll() {
	saveUser();
	dbSave('boardGames');
}
function _selectText(el) {
	var sel, range;
	if (window.getSelection && document.createRange) {
		sel = window.getSelection();
		if (sel.toString() == '') {
			window.setTimeout(function () {
				range = document.createRange();
				range.selectNodeContents(el);
				sel.removeAllRanges();
				sel.addRange(range);
			}, 1);
		}
	} else if (document.selection) {
		sel = document.selection.createRange();
		if (sel.text == '') {
			range = document.body.createTextRange();
			range.moveToElementText(el);
			range.select();
		}
	}
}
function _sendCardToBack(id) { let c = UIS[id]; let elem = document.getElementById(id); elem.style.zIndex = c.zIndex; }
function _setEllipseDims(r, w, h, dx, dy) {
	r.setAttribute('rx', w / 2);
	r.setAttribute('ry', h / 2);
	r.setAttribute('cx', dx);
	r.setAttribute('cy', dy);
}
function _setIsa(ms, o) {
	listKey(ms, 'isa', o.obj_type);
	for (const d in isa) {
		if (d == 'id') { continue; }
		ms[d] = isa[d];
	}
}
function _setLineDims(r, x1, y1, x2, y2) {
	r.setAttribute('x1', x1);
	r.setAttribute('y1', y1);
	r.setAttribute('x2', x2);
	r.setAttribute('y2', y2);
}
function _setRectDims(r, w, h, dx, dy) {
	r.setAttribute('width', w);
	r.setAttribute('height', h);
	r.setAttribute('x', -w / 2 + dx);
	r.setAttribute('y', -h / 2 + dy);
}
function _setRowsColsSize(options) {
	let [rows, cols, wb, hb] = [options.rows, options.cols, options.szPic.w, options.szPic.h];
	options.or = rows < cols ? 'L' : 'P'
	let gap = options.gap = _calcPadGap(options.gap, wb, hb);
	let [wOffset, hOffset] = [gap / cols, gap / rows];
	let offset = Math.max(wOffset, hOffset, gap * .25);
	let w = wb - gap - offset, h = hb - gap - offset;
	options.szPic.w = w;
	options.szPic.h = h;
	options.padding = _calcPadGap(options.padding, w, h);
	options.outerStyles.padding = options.padding;
	let wn = w - options.padding * 2;
	let hn = h - options.padding * 2;
	let fz = options.showLabels == true ? (wn / options.longestLabelLen) * (options.luc != 'u' ? 1.9 : 1.7) : 0;
	let fzPic = Math.min(wn / 1.3, (hn - fz * 1.2) / 1.3);
	if (fzPic < fz * 2) { fz = Math.floor(hn / 4); fzPic = fz * 2; }
	let fzTest = Math.min(hn / 3, idealFontDims(options.longestLabel, wn, hn - fzPic, fz, 4).fz);
	options.fzPic = options.picStyles.fz = Math.floor(fzPic)
	options.fzText = options.labelStyles.fz = options.isUniform ? Math.min(Math.floor(fz), Math.floor(fzTest)) : Math.floor(fz);
	if (!options.isUniform && fz < 6 && fz * 4 < fzPic) { _handleTextTooSmall(fz, fzPic, wn, hn, options); }
}
function _setTextFont(items, options, fz) {
	options.fzText = options.labelStyles.fz = fz;
	console.log('items', items)
	items.map(x => { let dl = x.live.dLabel; if (isdef(dl)) dl.style.fontSize = fz + 'px'; });
}
function _setToList(oval) { if (typeof oval == 'object' && '_set' in oval) return oval._set; else return oval; }
function _show_history_popup() {
	if (isdef(mBy('dHistoryPopup')) || isEmpty(Z.fen.history)) return;
	let dpop = mPopup('', dTable, { fz: 16, bg: colorLight('#EDC690', .5), rounding: 8, fg: 'dimgray', top: 0, right: 0, border: 'white' }, 'dHistoryPopup');
	mAppend(dpop, UI.dHistory);
	mInsert(dpop, mCreateFrom(`<div style="margin-left:10px;text-align:left;width:100%;font-family:Algerian;font-size:22px;">${Config.games[Z.game].friendly}</div>`));
	let bclose = mButtonX(dpop, hide_history_popup, 'tr', 25, 'dimgray');
}
function _showBoat(id) { let mobj = UIS[id]; mobj.show(); mobj.o.weg = false; }
function _showHand(oids, idArea) {
	let idHand = idArea;
	let hand = UIS[idArea];
	let areaName = getAreaName(idArea);
	for (const oid of oids) {
		let mobj = getVisual(oid);
		if (nundef(mobj)) {
			mobj = makeCard(oid, G.table[oid], idHand);
		}
		if (!_isInHand(oid, idHand)) {
			addCardToHand(oid, idArea);
		}
	}
}
function _showPassToNextPlayer(plWaitingFor) {
	unfreezeUI();
	let d = document.getElementById('passToNextPlayerUI');
	let color = getPlayerColor(plWaitingFor);
	d.style.backgroundColor = color;
	let button = document.getElementById('c_b_passToNextPlayer');
	button.textContent = 'PASS TO ' + plWaitingFor;
	show('passToNextPlayerUI');
	WAITINGFORPLAYER = plWaitingFor;
}
function _simpleOptions(options = {}, defsOuter = {}) {
	options.showPic = valf(options.showPic, isdef(options.fzPic));
	options.showLabels = isdef(options.fz);
	options.szPic = { w: options.w, h: options.h };
	options.fzText = options.fz;
	if (nundef(options.rounding)) options.rounding = 4;
	if (nundef(options.margin)) options.margin = 4;
	if (nundef(options.padding)) options.padding = 0;
	if (nundef(options.labelStyles)) options.labelStyles = {};
	if (options.showLabels) { if (nundef(options.labelPos)) options.labelBottom = true; options.labelStyles.fz = options.fzText; }
	options.picStyles = { fz: options.fzPic };
	let [w, h] = [options.szPic.w, options.szPic.h];
	options.outerStyles = {
		w: w, h: h, bg: options.bg, fg: options.fg,
		display: 'inline-flex', 'flex-direction': 'column',
		'justify-content': 'center', 'align-items': 'center', 'vertical-align': 'top',
		padding: 0, box: true, margin: options.margin, rounding: options.rounding,
	};
	if (isdef(defsOuter)) addKeys(defsOuter, options.outerStyles);
	return options;
}
function _singleThreadedChainExRec(akku, onComplete) {
	if (CancelChain) {
		clearTimeout(ChainTimeout);
		BlockChain = false;
		console.log('chain canceled!', akku);
	} else if (isEmpty(TaskChain)) {
		BlockChain = false;
		onComplete(akku);
	} else {
		let task = TaskChain[0], f = task.f, parr = isdef(task.parr) ? task.parr : [], t = task.msecs, waitCond = task.waitCond, tWait = task.tWait;
		console.log('task:', f.name, 't', t)
		if (isdef(waitCond) && !waitCond()) {
			if (nundef(tWait)) tWait = 300;
			ChainTimeout = setTimeout(() => _singleThreadedChainExRec(akku, onComplete), tWait);
		} else {
			for (let i = 0; i < parr.length; i++) {
				let para = parr[i];
				if (para == '_last') parr[i] = arrLast(akku);
				else if (para == '_all' || para == '_list') parr[i] = akku;
				else if (para == '_first') parr[i] = akku[0];
			}
			let result = f(...parr);
			if (isdef(result)) akku.push(result);
			TaskChain = TaskChain.slice(1);
			if (isdef(t)) {
				ChainTimeout = setTimeout(() => _singleThreadedChainExRec(akku, onComplete), t);
			} else {
				_chainExRec(akku, onComplete);
			}
		}
	}
}
function _sizeByFactor(items, options, dGrid, factor = .9) {
	console.log('vorher', options.szPic, options.fzText, options.fzPic, options.padding, options.gap);
	w = options.szPic.w * factor;
	h = options.szPic.h * factor;
	fz = options.fzText;
	fzPic = options.fzPic * factor;
	options.fzPic = options.picStyles.fz = fzPic;
	options.fzText = options.labelStyles.fz = fz;
	options.szPic = { w: w, h: h };
	options.padding *= factor;
	options.gap *= factor;
	mStyleX(dGrid, { gap: options.gap / 2 });
	for (const item of items) { let ui = item.live; mStyleX(ui.dLabel, { fz: fz }); mStyleX(ui.div, { padding: options.padding, w: w, h: h }); mStyleX(ui.dPic, { fz: fzPic }); }
	console.log('fonts set to', fz, fzPic);
	console.log('...nachher', options.szPic, options.fzText, options.fzPic, options.padding, options.gap);
}
function _sizeByPixel(items, options, dGrid, factor = -1) {
	console.log('vorher', options.szPic, options.fzText, options.fzPic, options.padding, options.gap);
	w = options.szPic.w + factor;
	h = options.szPic.h + factor;
	fz = options.fzText + factor;
	fzPic = options.fzPic + factor;
	options.fzPic = options.picStyles.fz = fzPic;
	options.fzText = options.labelStyles.fz = fz;
	options.szPic = { w: w, h: h };
	options.padding += factor;
	options.gap += factor;
	mStyleX(dGrid, { gap: options.gap / 2 });
	for (const item of items) { let ui = item.live; mStyleX(ui.dLabel, { fz: fz }); mStyleX(ui.div, { padding: options.padding, w: w, h: h }); mStyleX(ui.dPic, { fz: fzPic }); }
	console.log('fonts set to', fz, fzPic);
	console.log('...nachher', options.szPic, options.fzText, options.fzPic, options.padding, options.gap);
}
function _spgameStart() {
	console.assert(isdef(DB));
	initLive();
	initTable();
	initSidebar();
	initAux();
	initScore();
	Speech = new SpeechAPI('E');
	console.log('Syms', Syms)
	KeySets = getKeySetsX();
	Settings = { language: 'E' }
	test04_textItems();
}
function _standardHandler(handler) {
	let f = isdef(handler) ?
		ev => { ev.cancelBubble = true; let res = handler(ev, evToItem(ev)); }
		: ev => { ev.cancelBubble = true; console.log('clicked on', evToClosestId(ev), evToLive(ev), evToItem(ev)); };
	return f;
}
async function _start() {
	set_run_state_no_server();
	onpagedeactivated(() => { saveEnv(); dbSave(); });
	await load_syms();
	await load_db();
	let dicode = CODE.di = await route_path_yaml_dict('../y/z_all.yaml');
	let kwindow = get_keys(window);
	test100();
}
function _start_game(gamename, players, options) {
}
async function _start_old() {
	//#region prelim timit set_run_state onpagedeactivated load:syms db codebase
	let timit = new TimeIt('* using timit *');
	set_run_state_vps();
	onpagedeactivated(save_all);
	await load_syms();
	await load_db();
	await load_codebase();
	timit.show();
	//#endregion
	//#region db tests
	function test_random_update() {
		let n = rNumber();
		let i = rNumber(0, DB.appdata.howto.length - 1);
		let rec = { kw: 'k' + n, c: 'hallo' + (n + i) };
		db_update('howto', i, rec);
	}
	//#endregion
	//#region other tests
	//#endregion
}
async function _start0() {
	console.assert(isdef(DB));
	DA = {}; Items = {};
	Speech = new SpeechAPI('E');
	KeySets = getKeySets();
	TOMan = new TimeoutManager();
	_start();
}
async function _start1() {
	set_run_state_no_server();
	onpagedeactivated(() => { fiddleSave(); dbSave(); });
	await load_syms();
	await load_db();
	let dicode = CODE.di = await route_path_yaml_dict('../basejs/z_all.yaml');
	let dijustcode = CODE.justcode = await route_path_yaml_dict('../basejs/z_allcode.yaml');
	computeClosure(['_start1']);
}
function _startHotseat() {
	timit.start_of_cycle(getFunctionCallerName());
	S.vars.switchedGame = true;
	S.settings.game = GAME;
	checkCleanup();
	S.user = {};
	G = { table: {}, players: {} };
	UIS = {};
	IdOwner = {};
	id2oids = {};
	oid2ids = {};
	id2uids = {};
	if (S.settings.useSpec) loadUserSpec([loadUserCode, sendInitNewGame]); else sendInitNewGame();
}
function _startLobby() { lobbyView(); }
function _startLogin() { loginView(); }
function _startMultiplayer() {
	whichGame(onWhichGame);
}
async function _startNewGame(role = 'starter') {
	gameView();
	S.settings.game = GAME;
	flags.specAndDOM = true;
	checkCleanup_III();
	S.user = {};
	G = { table: {}, players: {}, signals: {} };
	UIS = {};
	IdOwner = {};
	id2oids = {};
	oid2ids = {};
	id2uids = {};
	let initFunc = (role == 'starter') ? sendInitNewGame : sendStatusNewGame;
	await loadSpecAndCode();
	if (TESTING) stubSendInitNewGame(role == 'starter');
	else initFunc();
}
function _startRestartSame() {
	checkCleanup_I();
	sendRestartGame(USERNAME, SEED, [gameStep]);
}
async function _startSession() {
	timit = new TimeIt(getFunctionCallerName(), TIMIT_SHOW);
	await loadAssets();
	_initServer([ensureAllGames, () => {
		console.log('allGames', allGames)
		timit.showTime('nach loadAllGames_dep+loadIcons')
		gcsAuto();
		S.gameConfig = gcs[GAME];
		_startNewGame('starter');
		//#region earlier tests and starts:
		//#endregion
	}]);
}
function _startShort() {
	timit.start_of_cycle(getFunctionCallerName());
	if (isdef(UIS)) {
		stopInteraction();
		clearLog();
	}
	_sendRoute('/begin/1', d6 => {
		let user = isdef(S.gameInfo.userList) ? S.gameInfo.userList[0] : USERNAME;
		timit.showTime('sending status');
		_sendRoute('/status/' + user, d7 => {
			let data = JSON.parse(d7);
			timit.showTime('start processing');
			processData(data);
			gameStep();
		});
	});
}
function _startTest() {
	test03_2Hands();
}
function _startTest01() {
	console.log('HALLOOOOO');
	atest01();
}
function _syncUsernameOfSender(username) {
	if (nundef(username)) username = Username; else Username = username;
	plidSentStatus = getPlidForUsername(username);
}
function _SYS_START() {
	if (nundef(S) || nundef(S.vars)) {
		addEventListener('keyup', keyUpHandler);
		addEventListener('keydown', keyDownHandler);
	} else { checkCleanup(); }
	timit = new TimeIt(getFunctionCallerName());
	timit.tacit();
	S = { path: {}, user: {}, settings: {}, vars: { firstTime: true } };
	counters = { msg: 0, click: 0, mouseenter: 0, mouseleave: 0, events: 0 };
	DELETED_IDS = [];
	if (S.vars.firstTime) setDefaultSettings();
	console.log('playMode:', S.settings.playMode, 'PLAYMODE', PLAYMODE, 'S.playModeChanged', S.playModeChanged)
	S.vars.switchedGame = true;
	S.vars.firstTime = false;
	_initGameGlobals();
	presentMainMenu();
}
function _tableCreateNew() {
	for (const oid of G.tableCreated) {
		let o = G.table[oid];
		if (!defaultVisualExists(oid) && S.settings.table.createDefault == true) {
			makeDefaultObject(oid, G.table[oid], S.settings.table.defaultArea);
		}
		if (S.settings.table.ignoreTypes.includes(o.obj_type)
			|| mainVisualExists(oid)
			|| !S.settings.boardDetection && !S.settings.deckDetection && !S.settings.userStructures) {
			continue;
		}
		let updatedVisuals;
		let mobj;
		if (S.settings.userBehaviors) {
			updatedVisuals = runBehaviors(oid, G.table, TABLE_CREATE);
		}
		if (nundef(updatedVisuals) || !updatedVisuals.includes(oid)) {
			if ('loc' in o && isBoardElement(o.loc._obj)) mobj = makeMainBoardElementVisual(oid, G.table[oid]);
			if (mobj === null && !defaultVisualExists(oid) && S.settings.table.createDefault != false) {
				makeDefaultObject(oid, G.table[oid], S.settings.table.defaultArea);
			}
		}
	}
}
function _tableCreateNewSimple() {
	for (const oid of G.tableCreated) {
		let o = G.table[oid];
		if (S.settings.table.ignoreTypes.includes(o.obj_type)) continue;
		console.assert(!defaultVisualExists(oid), 'DEFAULT VISUAL EXISTS FOR ' + oid, o);
		let updatedVisuals = runBehaviors(oid, G.table, TABLE_CREATE);
		if (!updatedVisuals.includes(oid) && !mainVisualExists(oid)) {
			makeDefaultObject(oid, G.table[oid], S.settings.table.defaultArea);
		} else {
			console.log(updatedVisuals.includes(oid) ? 'created ' + oid : 'exists:' + oid);
		}
	}
}
function _tableRemove() {
	for (const oid of G.tableRemoved) {
		deleteOid(oid);
	}
}
function _tableRemoveSimple() {
	for (const oid of G.tableRemoved) {
		deleteOid(oid);
	}
}
function _tableUpdate() {
	for (const oid in G.tableUpdated) {
		let o = G.table[oid];
		if (nundef(o)) {
			continue;
		}
		if (isStructuralElement(oid)) {
			continue;
		}
		let changedProps = G.tableUpdated[oid].summary;
		let mobj = getVisual(oid);
		let updatedVisuals;
		if (!isDeckObject(o) && mobj) {
			if (S.settings.userBehaviors) {
				updatedVisuals = runBehaviors(oid, G.table, TABLE_UPDATE);
			}
			if (nundef(updatedVisuals) || !updatedVisuals.includes(oid)) {
				if (changedProps.includes('loc')) _presentLocationChange(oid, mobj);
				presentMain(oid, mobj, G.table);
			}
		}
		if (!S.settings.table.createDefault || mobj && S.settings.table.createDefault == 'miss') continue;
		presentDefault(oid, G.table[oid]);
	}
	if (S.settings.hasCards && !isPlain()) {
		for (const oid in G.table) {
			updateTableCardCollections(oid);
		}
	}
}
function _tableUpdateSimple() {
	for (const oid in G.tableUpdated) {
		let o = G.table[oid];
		if (nundef(o)) continue;
		let mobj = getVisual(oid);
		let updatedVisuals = runBehaviors(oid, G.table, TABLE_UPDATE);
		presentDefault(oid, G.table[oid]);
	}
}
function _test() {
	let o1 = {
		"_set": [
			{
				"_tuple": [
					{
						"_set": [
							{ "ID": "91", "val": "Corner[91]", "type": "obj" },
							{ "ID": "92", "val": "Corner[92]", "type": "obj" },
							{ "ID": "93", "val": "Corner[93]", "type": "obj" },
						]
					}
				]
			}
		]
	};
	let o3 = {
		"_set": [
			{
				"_tuple": [
					{
						"_set": [
							{ "ID": "1", "val": "Corner[1]", "type": "obj" },
							{ "ID": "2", "val": "Corner[2]", "type": "obj" },
						]
					},
					{
						"_set": [
							{ "ID": "3", "val": "Corner[3]", "type": "obj" },
						]
					},
				]
			}
		]
	};
	let o4 = {
		"_tuple": [
			{
				"_set": [
					{ "ID": "1", "val": "Corner[1]", "type": "obj" },
					{ "ID": "2", "val": "Corner[2]", "type": "obj" },
				]
			},
			{
				"_set": [
					{ "ID": "3", "val": "Corner[3]", "type": "obj" },
				]
			},
			{
				"_set": [
					{ "ID": "4", "val": "Corner[3]", "type": "obj" },
					{ "ID": "5", "val": "Corner[3]", "type": "obj" },
				]
			},
		]
	};
	let o2 = {
		"_set": [
			{ "ID": "1", "val": "Corner[1]", "type": "obj" },
			{ "ID": "2", "val": "Corner[2]", "type": "obj" },
			{ "ID": "3", "val": "Corner[2]", "type": "obj" },
		]
	};
	let o5 = {
		"_set": [
			{
				"_tuple": [
					{
						"_set": [
							{ "ID": "1", "val": "Corner[1]", "type": "obj" },
							{ "ID": "2", "val": "Corner[2]", "type": "obj" },
						]
					},
					{
						"_set": [
							{ "ID": "3", "val": "Corner[3]", "type": "obj" },
						]
					},
				]
			},
			{
				"_tuple": [
					{
						"_set": [
							{ "ID": "4", "val": "Corner[1]", "type": "obj" },
							{ "ID": "5", "val": "Corner[2]", "type": "obj" },
						]
					},
					{
						"_set": [
							{ "ID": "6", "val": "Corner[3]", "type": "obj" },
						]
					},
				]
			}
		]
	};
	let o6 = {
		"_tuple": [
			{
				"_set": [
					{ "ID": "4", "val": "Corner[1]", "type": "obj" },
					{ "ID": "5", "val": "Corner[2]", "type": "obj" },
				]
			},
			{
				"_set": [
					{ "ID": "6", "val": "Corner[3]", "type": "obj" },
				]
			},
		]
	};
	let o7 = {
		"_tuple": [
			{
				"_set": [
					{ "ID": "1", "val": "Corner[1]", "type": "obj" },
					{ "ID": "2", "val": "Corner[2]", "type": "obj" },
				]
			},
			{
				"_set": [
					{ "ID": "3", "val": "Corner[3]", "type": "obj" },
				]
			},
		]
	};
	let o = o5;
	console.log('output', exp(o) ? tsRec(exp(o)) : 'undefined');
}
function _test01_load_game_info() {
	timit = new TimeIt('*');
	timit.showTime('hallo');
	ensureAllGames([() => timit.showTime('done')]);
}
async function _testing() {
	Items = {};
	iTest00();
}
function _testTable() {
	initRSGData(); hideLobby(); hideLogin(); showGame(); initDom();
	let gplayers = {
		White: {
			altName: "White",
			buildings: {
				city: { _set: [] },
				road: { _set: [{ _obj: "149" }] },
				settlement: { _set: [{ _obj: "148" }, { _obj: "158" }] },
			},
			color: "white",
			devcards: { _set: [] },
			id: { _player: "White" },
			opps: [{ _player: "Red" }, { _player: "Blue" }],
			opps2: { _set: ["White", "Red", "Blue"] },
			opps3: { _set: [{ _player: "Red" }, { _player: "Blue" }] },
			index: 0,
			name: "White",
			num_res: 3,
			obj_type: "GamePlayer",
			past_devcards: { _set: [] },
			reserve: { road: 14, settlement: 3, city: 4 },
			resources: { wood: 1, brick: 0, sheep: 1, ore: 0, wheat: 1 },
			username: "felix",
		},
		Red: {
			altName: "Red",
			buildings: {
				city: { _set: [] },
				road: { _set: [{ _obj: "149" }] },
				settlement: { _set: [{ _obj: "148" }, { _obj: "158" }] },
			},
			color: "Red",
			devcards: { _set: [] },
			id: "Red",
			index: 0,
			name: "Red",
			num_res: 3,
			past_devcards: { _set: [] },
			reserve: { road: 14, settlement: 3, city: 4 },
			resources: { wood: 1, brick: 0, sheep: 1, ore: 0, wheat: 1 },
			username: "maus",
		}
	};
	let gtable = {
		2: {
			col: 6,
			corners: [{ _obj: "101" }, { _obj: "102" }, { _obj: "103" }, { _obj: "104" }, { _obj: "99" }, { _obj: "98" }],
			edges: [{ _obj: "27" }, { _obj: "26" }, { _obj: "25" }, { _obj: "24" }, { _obj: "23" }, { _obj: "22" }],
			neighbors: [null, null, { _obj: "78" }, { _obj: "79" }, { _obj: "70" }, null],
			num: 11,
			obj_type: "hex",
			res: "ore",
			row: 0,
			visible: { _set: ["White", "Red", "Blue"] }
		},
		148: {
			loc: { _obj: "131" },
			obj_type: "settlement",
			player: {
				_player: "White"
			},
			opps: { opp1: { _player: "Red" }, opp2: { _player: "Blue" } },
			visible: {
				_set: [{ _player: "Red" }, { _player: "Blue" }]
			},
		},
		149: {
			loc: { _obj: "138" },
			obj_type: "settlement",
			player: {
				_player: "White"
			},
			visible: {
				_set: ["White", "Red", "Blue"]
			},
		},
		158: {
			loc: { _obj: "134" },
			obj_type: "road",
			player: {
				_player: "Red"
			},
			visible: { _set: ["White", "Red", "Blue"] },
		},
		145: {
			cols: 9,
			corners: { _set: [{ _obj: "101" }, { _obj: "102" }, { _obj: "103" },] },
			edges: { _set: [{ _obj: "101" }, { _obj: "102" }, { _obj: "103" },] },
			fields: { _set: [{ _obj: "101" }, { _obj: "102" }, { _obj: "103" },] },
			map: {
				_ndarray: [
					[null, { _obj: "3" }, null, { _obj: "4" }],
					[{ _obj: "5" }, null, { _obj: "6" }, null, { _obj: "7" }],
					[null, { _obj: "8" }, null],
				]
			},
			obj_type: "board",
			rows: 5,
			visible: { _set: ["White", "Red", "Blue"] }
		}
	};
	console.log('gplayers', gplayers);
	console.log('gtable', gtable);
	addTableToArea(gtable[145], 'a_d_game');
	addTableToArea(gtable[148], 'a_d_game');
	addTableToArea(gplayers.White, 'a_d_objects');
}
function _tryGrow(items, options) {
	let again = false;
	let lastItem = items[items.length - 1];
	let rect = getRect(lDiv(lastItem));
	let bottom = rect.y + rect.h;
	let hArea = options.area.h;
	if (hArea > rect.h + 2 * options.gap) {
		fz = options.fzText + 1;
		fzPic = options.fzPic + 2;
		options.fzPic = options.picStyles.fz = fzPic;
		options.fzText = options.labelStyles.fz = fz;
		for (const item of items) {
			let live = item.live;
			mStyleX(live.dLabel, { fz: options.fzText });
			mStyleX(live.dPic, { fz: options.fzPic });
		}
		let ov = getVerticalOverflow(mBy(options.idGrid));
		if (Math.floor(ov) <= 0) again = true; else again = false;
	}
	if (again) _tryGrow(items, options);
	else {
		fz = options.fzText - 1;
		fzPic = options.fzPic - 2;
		options.fzPic = options.picStyles.fz = fzPic;
		options.fzText = options.labelStyles.fz = fz;
		for (const item of items) {
			let live = item.live;
			mStyleX(live.dLabel, { fz: options.fzText });
			mStyleX(live.dPic, { fz: options.fzPic });
		}
	}
}
function _ui_game_menu_item(g, g_tables = []) {
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
		<div onclick="onclick_game_menu_item(event)" gamename=${g.id} style='cursor:pointer;border-radius:10px;margin:10px;padding:5px;padding-top:15px;min-width:120px;height:90px;display:inline-block;background:${bg};position:relative;'>
		${nundef(color) ? '' : runderkreis(color, id)}
		<span style='font-size:50px;font-family:${sym.family}'>${sym.text}</span><br>${g.friendly.toString()}</div>
		`;
}
function _unfocusOnEnter(ev) { if (ev.key === 'Enter') { ev.preventDefault(); mBy('dummy').focus(); } }
function _unhighlightAndMinify(ev, mobj, partName) {
	minifyBack(mobj.id);
	unhighlightMsAndRelatives(ev, mobj, partName);
}
function _unhighlightBoat() {
	if (boatHighlighted) {
		unhighlightMsAndRelatives(null, boatHighlighted);
		_closeInfoboxesForBoatOids(boatHighlighted);
		boatHighlighted = null;
	}
}
function _updateCollections(propChanges, pool, propNames) {
	for (const oid in propChanges) {
		let o = pool[oid];
		if (!o || isBoardElementObject(o) || isBoardObject(o) || isDeckObject(o)) continue;
		for (const propName of propChanges[oid].summary) {
			if (!propNames.includes(propName)) continue;
			let o = pool[oid][propName];
			if (isSimple(o) || (isDict(o) && isdef(o.generic_type))) continue;
			let cLast = getCollections(oid, propName);
			let cCurrent = _findCollections(oid + '.' + propName, o);
			if (isEmpty(cCurrent) && isEmpty(cLast)) continue;
			let currentKeys = cCurrent.map(x => x.name);
			for (const c of cCurrent) {
				if (cLast && c.name in cLast) {
					if (nundef(collections[oid])) collections[oid] = {};
					if (nundef(collections[oid][propName])) collections[oid][propName] = {};
					collections[oid][propName][c.name] = c;
					c.tbd = 'update';
				} else {
					if (nundef(collections[oid])) collections[oid] = {};
					if (nundef(collections[oid][propName])) collections[oid][propName] = {};
					collections[oid][propName][c.name] = c;
					c.tbd = 'add';
				}
			}
			if (!cLast) continue;
			for (const k in cLast) {
				if (!(currentKeys.includes(k))) {
					collections[oid][propName][k].tbd = 'remove';
				}
			}
		}
	}
}
function _updateLogArea(prevPlid, plid) {
	if (prevPlid) hide('a_d_log_' + prevPlid);
	let id = 'a_d_log_' + plid;
	if (UIS[id]) show(id);
}
function _updatePageHeader(pid) {
	let mobj;
	for (const pl of S.gameConfig.players) {
		mobj = getPageHeaderDivForPlayer(pl.id);
		mobj.classList.remove('gamePlayer');
	}
	mobj = getPageHeaderDivForPlayer(pid);
	mobj.classList.add('gamePlayer');
}
function _valf(val, def) { return isdef(val) ? val : def; }
function _visualizeAritOp(op, a, b, dParent, symResult) {
	op = isString(op) ? OPS[op] : op;
	let dx = mDiv(dParent); mFlex(dx); mStyleX(dx, { 'align-items': 'center', gap: 16 });
	let d1 = visNumber(a, dx, 'blue');
	let d2 = visOperator(op.wr, dx);
	let d3 = visNumber(b, dx, 'green');
	let d4 = visOperator('=', dx);
	let result = isdef(symResult) ? symResult : op.f(a, b);
	let d5 = visNumber(result, dx, 'red');
	return dx;
}
function _visualizeMult(a, b, dParent, symResult) {
	op = OPS.mult;
	let dx = mDiv(dParent); mFlex(dx); mStyleX(dx, { 'align-items': 'center', gap: 16 });
	visNumber(a, dx, 'blue', 'v');
	for (let i = 1; i < b; i++) {
		let d2 = visOperator('+', dx);
		visNumber(a, dx, 'blue', 'v');
	}
	let d4 = visOperator('=', dx);
	let result = isdef(symResult) ? symResult : op.f(a, b);
	let d5 = visNumber(result, dx, 'red');
	return dx;
}
function _visualizeNumber(n, dParent, color, or = 'h') {
	let root = Math.sqrt(n);
	let rows = Math.floor(root);
	let cols = Math.ceil(root);
	if (or == 'v') { let h = rows; rows = cols; cols = h; }
	let dArea = mDiv(dParent, { display: 'inline-grid', 'grid-template-columns': `repeat(${cols}, 1fr)`, bg: 'white', fg: color });
	for (let i = 0; i < n; i++) {
		let item = getItem('plain-circle');
		let d = miPic(item, dArea, { fz: 12, margin: 6 });
		iAdd(item, { div: d });
		mAppend(dArea, d);
	}
	return dArea;
}
function _whenSoundPaused() {
	_sndPlayer = null;
	_sndPlayerIdle = true;
	_loaded = false;
	if (!isEmpty(_qSound)) { _deqSound(); } else { _idleSound = true; }
}
function _zoomIfNeeded(arr) {
	let wTotalNeeded = 0;
	for (const dName of arr) {
		let n = isNumber(dName) ? dName * bodyZoom : getBounds(dName).width;
		wTotalNeeded += n;
	}
	let wWindow = window.innerWidth;
	let newBodyZoom = (wWindow * bodyZoom / wTotalNeeded).toFixed(2);
	if (newBodyZoom == bodyZoom || newBodyZoom > 1 && bodyZoom == 1.0) return;
	if (Math.abs(newBodyZoom - 1.0) <= .03) {
		newBodyZoom = 1.0;
	}
	bodyZoom = Math.min(1.0, newBodyZoom);
	document.body.style.transformOrigin = '0% 0%';
	if (bodyZoom == 1.0) document.body.style.transform = 'none';
	else document.body.style.transform = 'scale(' + bodyZoom + ')';
}
function _zPicS(itemInfoKey, dParent, styles = {}) {
	let [item, info, key] = detectItemInfoKey(itemInfoKey);
	let outerStyles = isdef(styles) ? jsCopy(styles) : {};
	outerStyles.display = 'inline-block';
	let family = info.family;
	let wInfo = info.w;
	let hInfo = info.h; if (info.type == 'icon' && hInfo == 133) hInfo = 110;
	info.fz = 100;
	let innerStyles = { family: family };
	let [padw, padh] = isdef(styles.padding) ? [styles.padding, styles.padding] : [0, 0];
	let dOuter = isdef(dParent) ? mDiv(dParent) : mDiv();
	let d = mDiv(dOuter);
	d.innerHTML = info.text;
	let wdes, hdes, fzdes, wreal, hreal, fzreal, f;
	if (isdef(styles.w) && isdef(styles.h) && isdef(styles.fz)) {
		[wdes, hdes, fzdes] = [styles.w, styles.h, styles.fz];
		let fw = wdes / wInfo;
		let fh = hdes / hInfo;
		let ffz = fzdes / info.fz;
		f = Math.min(fw, fh, ffz);
	} else if (isdef(styles.w) && isdef(styles.h)) {
		[wdes, hdes] = [styles.w, styles.h];
		let fw = wdes / wInfo;
		let fh = hdes / hInfo;
		f = Math.min(fw, fh);
	} else if (isdef(styles.w) && isdef(styles.fz)) {
		[wdes, fzdes] = [styles.w, styles.fz];
		let fw = wdes / wInfo;
		let ffz = fzdes / info.fz;
		f = Math.min(fw, ffz);
	} else if (isdef(styles.h) && isdef(styles.fz)) {
		[hdes, fzdes] = [styles.h, styles.fz];
		let fh = hdes / hInfo;
		let ffz = fzdes / info.fz;
		f = Math.min(fh, ffz);
	} else if (isdef(styles.h)) {
		hdes = styles.h;
		f = hdes / hInfo;
	} else if (isdef(styles.w)) {
		wdes = styles.w;
		f = wdes / wInfo;
	} else {
		mStyleX(d, innerStyles);
		mStyleX(dOuter, outerStyles);
		return dOuter;
	}
	fzreal = Math.floor(f * info.fz);
	wreal = Math.round(f * wInfo);
	hreal = Math.round(f * hInfo);
	wdes = Math.round(wdes);
	hdes = Math.round(hdes);
	padw += isdef(styles.w) ? (wdes - wreal) / 2 : 0;
	padh += isdef(styles.h) ? (hdes - hreal) / 2 : 0;
	if (!(padw >= 0 && padh >= 0)) {
		console.log(info)
		console.log('\nstyles.w', styles.w, '\nstyles.h', styles.h, '\nstyles.fz', styles.fz, '\nstyles.padding', styles.padding, '\nwInfo', wInfo, '\nhInfo', hInfo, '\nfzreal', fzreal, '\nwreal', wreal, '\nhreal', hreal, '\npadw', padw, '\npadh', padh);
	}
	innerStyles.fz = fzreal;
	innerStyles.weight = 900;
	innerStyles.w = wreal;
	innerStyles.h = hreal;
	mStyleX(d, innerStyles);
	outerStyles.padding = '' + padh + 'px ' + padw + 'px';
	outerStyles.w = wreal;
	outerStyles.h = hreal;
	mStyleX(dOuter, outerStyles);
	return {
		info: info, key: info.key, div: dOuter, outerDims: { w: wdes, h: hdes, hpadding: padh, wpadding: padw },
		innerDims: { w: wreal, h: hreal, fz: fzreal }, bg: dOuter.style.backgroundColor, fg: dOuter.style.color
	};
}
//#endregion

//#region functions A
function a_game() {
	function state_info(dParent) { dParent.innerHTML = `turn: ${Z.turn}, stage:${Z.stage}`; }
	function setup(players, options) {
		let fen = { players: {}, plorder: jsCopy(players), history: [] };
		shuffle(fen.plorder);
		let starter = fen.starter = fen.plorder[0];
		let cards_needed = players.length * options.handsize * 1.4;
		fen.num_decks = Math.ceil(cards_needed / 52);
		fen.deck = create_fen_deck('n', fen.num_decks, 0);
		shuffle(fen.deck);
		let [i, n, diff] = [0, players.length, get_slot_diff(fen)];
		for (const plname of players) {
			let pl = fen.players[plname] = {
				hand: deck_deal(fen.deck, options.handsize),
				score: 0,
				name: plname,
				color: get_user_color(plname),
				slot: diff * i,
			};
			i++;
		}
		[fen.phase, fen.stage, fen.step, fen.turn] = ['', 'click', 0, [starter]];
		return fen;
	}
	function present() { present_a_game(); }
	function check_gameover() { return false; }
	function activate_ui() {
		activate_a_game();
	}
	function post_collect() { agmove_resolve(); }
	return { post_collect, state_info, setup, present, check_gameover, activate_ui };
}
function a0(ev) {
	toggle_select(evToItem(ev), G.selist);
	toolbar_check();
}
function a0_functions() {
}
function a1(ev) { a0(ev); }
function a2_add_selection(items, label, min = 0, max = 100, goto_post = true) {
	clear_previous_level();
	A.level++;
	A.items = items;
	A.goto_post = goto_post;
	A.selected = [];
	let show_submit_button = min > 1 || min != max;
	let dParent = window[`dActions${A.level}`];
	for (const item of items) {
		let a = item.a;
		let idButton = getUID('b'); item.idButton = idButton; A.di[idButton] = item; item.uids = [idButton];
		let b = mButton(a, show_submit_button ? a2_toggle_selection : a2_select, dParent, { fz: 13 }, ['donebutton', 'enabled'], idButton);
		if (isdef(item.o)) {
			let go = item.o;
			let d = iDiv(go);
			go.id = d.id = getUID();
			mClass(d, 'hoverScale');
			d.onclick = show_submit_button ? a2_toggle_selection : a2_select;
			let idCard = d.id; item.idCard = idCard; A.di[idCard] = item; item.uids.push(idCard);
			set_hover_ui(b, go);
		}
	}
	if (show_submit_button) {
		if (isdef(mBy('b_submit'))) { let b = mBy('b_submit'); mAppend(dParent, b); }
		else mButton('submit', goto_post ? a2_post_if_uiActivated : a2_pre_if_uiActivated, dParent, { fz: 13, bg: 'red', fg: 'silver' }, ['donebutton', 'enabled'], 'b_submit');
	}
	if (isdef(mBy('b_restart_action'))) { let b = mBy('b_restart_action'); mAppend(dParent, b); }
	else mButton('restart action', () => turn_send_reload(G.otree.plturn), dParent, { fz: 13, bg: 'red', fg: 'silver' }, ['donebutton', 'enabled'], 'b_restart_action');
	if (items.length <= min) {
		uiActivated = false;
		for (let i = 0; i < items.length; i++) {
			A.selected.push(i);
			let a = items[i];
			mStyle(mBy(a.idButton), { bg: 'yellow' });
			if (isdef(a.idCard)) mClass(mBy(a.idCard), 'card_selected');
		}
		setTimeout(() => { if (goto_post) { ari_post_action(); } else { ari_pre_action(); } }, 500);
	} else if (is_admin()) {
		let movekey = G.otree.plturn + '_' + ITER;
		let selection_list = DA.auto_moves[movekey];
		if (nundef(selection_list)) selection_list = DA.auto_moves[ITER];
		if (isEmpty(selection_list)) return;
		uiActivated = false;
		let selection = selection_list.shift();
		let numbers = [];
		for (const el of selection) {
			if (el == 'last') {
				numbers.push(A.items.length - 1);
			} else if (isString(el)) {
				let commands = A.items.map(x => x.key);
				let idx = commands.indexOf(el);
				numbers.push(idx);
			} else numbers.push(el);
		}
		selection = numbers;
		setTimeout(() => {
			A.selected = selection;
			if (selection.length == 1) A.selected_key = A.items[A.selected[0]].key;
			a2_highlight_selected_items();
			if (A.goto_post) { ari_post_action(); } else { ari_pre_action(); }
		}, 1000);
	}
}
function a2_exchange_items(otree, o0, o1) {
	elem_from_to(o0.key, lookup(otree, o0.path.split('.')), lookup(otree, o1.path.split('.')));
	elem_from_to(o1.key, lookup(otree, o1.path.split('.')), lookup(otree, o0.path.split('.')));
}
function a2_get_all_hidden_building_items(uname) {
	let items = [];
	for (const gb of G[uname].buildings) {
		items = items.concat(a2_get_hidden_building_items(gb));
	}
	a2_reindex(items);
	return items;
}
function a2_get_build_items(uname) { return a2_get_hand_and_stall_items(uname); }
function a2_get_building_items(uname) {
	let gblist = G[uname].buildings;
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
function a2_get_building_items_of_type(uname, types = ['farms', 'estates', 'chateaus']) {
	let gblist = G[uname].buildings.filter(x => types.includes(x.type));
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
function a2_get_buildings(gblist) {
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
function a2_get_coin_amounts(plturn) {
	let items = [];
	for (let i = 0; i <= G.otree[plturn].coins; i++) {
		let cmd = '' + i;
		let item = { o: null, a: cmd, key: cmd, friendly: cmd, path: null, index: i };
		items.push(item);
	}
	return items;
}
function a2_get_commands(plturn) {
	let avail = ari_get_actions(G.otree, plturn);
	let items = [], i = 0;
	for (const cmd of avail) {
		let item = { o: null, a: cmd, key: cmd, friendly: cmd, path: null, index: i };
		i++;
		items.push(item);
	}
	return items;
}
function a2_get_endgame(plturn) {
	let items = [], i = 0;
	for (const cmd of ['end game', 'go on']) {
		let item = { o: null, a: cmd, key: cmd, friendly: cmd, path: null, index: i };
		i++;
		items.push(item);
	}
	return items;
}
function a2_get_estates_chateaus_items(uname) { return a2_get_building_items_of_type(uname, ['estates', 'chateaus']); }
function a2_get_farms_estates_items(uname) { return a2_get_building_items_of_type(uname, ['farms', 'estates']); }
function a2_get_hand_and_stall_items(uname) {
	let items = a2_get_hand_items(uname);
	items = items.concat(a2_get_stall_items(uname));
	a2_reindex(items);
	return items;
}
function a2_get_hand_items(uname) {
	let items = [], i = 0;
	for (const o of G[uname].hand.items) {
		let item = { o: o, a: o.key, key: o.key, friendly: o.short, path: `${uname}.hand`, index: i };
		i++;
		items.push(item);
	}
	return items;
}
function a2_get_harvest_items(uname) {
	let items = []; let i = 0;
	for (const gb of G[uname].buildings) {
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
function a2_get_hidden_building_items(b) {
	let items = [];
	for (let i = 1; i < b.items.length; i++) {
		let o = b.items[i];
		let item = { o: o, a: o.key, key: o.key, friendly: o.short, path: b.path + '.list', index: i - 1 };
		items.push(item);
	}
	return items;
}
function a2_get_market_items() {
	let items = [], i = 0;
	for (const o of G.market.items) {
		let item = { o: o, a: o.key, key: o.key, friendly: o.short, path: `market`, index: i };
		i++;
		items.push(item);
	}
	return items;
}
function a2_get_open_discard_items() {
	let items = [], i = 0;
	for (const o of G.open_discard.items) {
		let item = { o: o, a: o.key, key: o.key, friendly: o.short, path: `open_discard`, index: i };
		i++;
		items.push(item);
	}
	return items;
}
function a2_get_other_buildings(plturn) {
	let items = [], i = 0;
	for (const uname of G.otree.plorder) {
		if (uname == plturn) continue;
		items = items.concat(a2_get_buildings(G[uname].buildings));
	}
	a2_reindex(items);
	return items;
}
function a2_get_repair_items(uname) {
	let ihand = a2_get_hand_items(uname);
	let istall = a2_get_stall_items(uname);
	let irepair = a2_get_all_hidden_building_items(uname);
	irepair.map(x => face_up(x.o));
	let items = ihand.concat(istall).concat(irepair);
	a2_reindex(items);
	return items;
}
function a2_get_stall_items(uname) {
	let items = [], i = 0;
	for (const o of G[uname].stall.items) {
		let item = { o: o, a: o.key, key: o.key, friendly: o.short, path: `${uname}.stall`, index: i };
		i++;
		items.push(item);
	}
	return items;
}
function a2_get_trade_items(uname) {
	let items = a2_get_market_items(uname);
	items = items.concat(a2_get_stall_items(uname));
	for (const plname of G.otree.plorder) {
		if (plname != uname) items = items.concat(a2_get_stall_items(plname));
	}
	a2_reindex(items);
	return items;
}
function a2_highlight_selected_items() {
	for (const i of A.selected) {
		let a = A.items[i];
		mStyle(mBy(a.idButton), { bg: 'yellow' });
		if (isdef(a.idCard)) mClass(mBy(a.idCard), 'card_selected');
	}
}
function a2_pay_with_card(item) {
	let fen = Z.fen;
	let source = lookup(fen, item.path.split('.'));
	elem_from_to_top(item.key, source, fen.deck_discard);
	ari_reorg_discard(fen);
}
function a2_pay_with_coin(uplayer) {
	let fen = Z.fen;
	fen.players[uplayer].coins -= 1;
}
function a2_post_if_uiActivated() {
	if (!uiActivated) { console.log('ui is deactivated!!!'); return; }
	ari_post_action();
}
function a2_pre_if_uiActivated() {
	if (!uiActivated) { console.log('ui is deactivated!!!'); return; }
	ari_pre_action();
}
function a2_reindex(items) { let i = 0; items.map(x => { x.index = i; i++; }); }
function a2_select(ev) {
	if (!uiActivated) { console.log('ui is deactivated!!!'); return; }
	let id = evToId(ev);
	let a = A.di[id];
	A.selected = [a.index];
	A.selected_key = A.items[a.index].key;
	mStyle(mBy(a.idButton), { bg: 'yellow' });
	if (isdef(a.idCard)) mClass(mBy(a.idCard), 'card_selected');
	if (A.goto_post) ari_post_action(); else ari_pre_action();
}
function a2_toggle_selection(ev) {
	if (!uiActivated) { console.log('ui is deactivated!!!'); return; }
	let id = evToId(ev);
	let a = A.di[id];
	if (A.selected.includes(a.index)) {
		removeInPlace(A.selected, a.index);
		mStyle(mBy(a.idButton), { bg: 'grey' });
		if (isdef(a.idCard)) mClassRemove(mBy(a.idCard), 'card_selected');
	} else {
		A.selected.push(a.index);
		mStyle(mBy(a.idButton), { bg: 'yellow' });
		if (isdef(a.idCard)) mClass(mBy(a.idCard), 'card_selected');
	}
}
function Accel() {
	var ax;
	var ay;
	var az;
	var rotX;
	var rotY;
	var rotZ;
	if (window.DeviceMotionEvent == undefined) {
		console.log("This program requires an accelerometer");
	} else {
		window.ondevicemotion = function (event) {
			this.ax = event.accelerationIncludingGravity.x;
			this.ay = event.accelerationIncludingGravity.y;
			this.az = event.accelerationIncludingGravity.z;
			rotation = event.rotationRate;
			if (rotation != null) {
				this.rotX = Math.round(rotation.alpha);
				this.rotY = Math.round(rotation.beta);
				this.rotZ = Math.round(rotation.gamma);
			}
		}
	}
	this.getAX = function () {
		if (window.ax == null) {
			window.ax = 0;
		}
		return window.ax;
	}
	this.getAY = function () {
		if (window.ay == null) {
			window.ay = 0;
		}
		return window.ay;
	}
	this.getAZ = function () {
		if (window.az == null) {
			window.az = 0;
		}
		return window.az;
	}
	this.getRotX = function () { return rotX; }
	this.getRotY = function () { return rotY; }
	this.getRotZ = function () { return rotZ; }
}
function accelerate(n) {
	meme.gravity = n;
}
function ack_player(plname) {
	let [fen, uplayer, pl] = [Z.fen, Z.uplayer, Z.fen.players[Z.uplayer]];
	assertion(sameList(Z.turn, [plname]), "ack_player: wrong turn");
	if (plname == fen.lastplayer || fen.players[uplayer].buy == true) {
		let func = window[fen.callbackname_after_ack];
		if (isdef(func)) func();
	} else {
		Z.turn = [get_next_in_list(plname, fen.ack_players)];
	}
	turn_send_move_update();
}
function action_close(item) {
	console.log('HALLO CLOSE!!!!!!!!!!!!!!!')
	let o = fromLocalStorage('app');
	let duration = get_now() - o.tStart;
	let factor = valf(item.val, 3);
	let secs = Math.round(duration / 1000);
	let mins = Math.round(secs / 60);
	let res = mins;
	let points = Math.round(res * factor / 5); if (points == 0) points = 1;
	let t = new Date(o.tStart).toTimeString().substring(0, 5);
	let s = `a:${t},${res},${points}`;
	console.log('string:', s);
	setTimeout(() => navigator.clipboard.writeText(s), 100)
}
function action_open(item) {
	console.log('HALLO OPEN!!!!!!!!!!!!!!!')
	let o = { tStart: get_now(), app: 'action' };
	toLocalStorage(o, 'app');
	let d = iDiv(item);
	let d1 = mDiv(d, { fz: 15, position: 'absolute', top: 2, right: 4 }, null, new Date(o.tStart).toTimeString().substring(0, 5));
	let d2 = mGrid(3, 3, d, { gap: 3, matop: 12 });
	for (const n of [.5, 1, 2, 3, 5, 8, 12, 20, 50]) {
		let b = mButton(n, () => item.val = n, d2, { cursor: 'pointer' });
	}
}
function actionOrWaiting(player, dAction, callback) {
	if ('actions' in dAction) {
		unitTestSender('found actions for', player);
		dAction.info.game.player = player;
		callback(dAction);
	} else if ('waiting_for' in dAction) {
		let waiting = getSet(dAction, 'waiting_for');
		unitTestSender('NEED PLAYER CHANGE!!!!!!!!!!!!', waiting);
		if (!empty(waiting)) {
			let newPlayer = waiting[0];
			sender.send('status_test/' + newPlayer, dNewPlayer => {
				dAction = extend(true, dAction, dNewPlayer);
				unitTestSender('action+status data for', newPlayer, dAction);
				dAction.info.game.player = newPlayer;
				callback(dAction);
			});
		} else {
			alert('empty waiting_for and no actions!!!');
		}
	} else {
		unitTestSender('NEED TO SEND EMPTY ACTION!!!!!!!!!!!!!', player);
		alert('sending empty action!!!', player);
		sendAction(player, ['pass'], dEMpty => {
			dAction = extend(true, dAction, dEmpty);
			callback(dAction);
		});
	}
}
function actions_off() {
	hide('dLeftSide');
	delete Session.is_actions;
	Actions = [];
}
function actions_on() {
	if (!isdef(mBy('dLeiste'))) initActionPanel();
	Session.is_actions = true;
	Actions = [];
}
function activate_a_game() {
	if (Z.stage == 'click') {
		show_MMM('back to normal!!!!');
		mButton('single turn move', agmove_single, dTable, { margin: 20 });
		mButton('clear players', agmove_clear_all, dTable, { margin: 20 });
		mButton('clear first', agmove_clear_first, dTable, { margin: 20 });
	} else if (Z.stage == 'clear') {
		agmove_startmulti();
	} else {
		mButton('indiv move', agmove_indiv, dTable, { margin: 20 });
	}
}
function activate_actions(r, uname) {
	console.log('actions', r.actions);
	if (!isEmpty(DA.staged_moves)) {
		dastaged(r, uname, 500);
	} else if (r.actions.length == 1) {
		autoselect_action(r, r.actions[0], uname);
	} else {
		for (const a of r.actions) {
			if (isdef(Items[a])) {
				let item = R.get_item(a);
				let d = iDiv(item);
				mStyle(d, { cursor: 'pointer' });
				d.onclick = ev => onselect_action(ev, r, a, uname);
			} else if (a == 'pass') {
				activate_pass_button(a, uname);
			} else if (startsWith(a, 'draw')) {
				let path = stringAfter(a, '.');
				let item = R.get_item(path);
				let d = iDiv(item);
				mStyle(d, { cursor: 'pointer' });
				d.onclick = ev => onselect_action(ev, r, a, uname);
				activate_draw_button(r, a, uname);
			}
		}
		highlight_player(uname);
		uiActivated = true;
	}
}
function activate_draw_button(r, action, uname) {
	mButton('draw', ev => select_action(r, action, uname), dActions, { fz: 13 }, ['donebutton', 'enabled'], 'd_draw');
}
function activate_pass_button(r, action, uname) {
	mButton('pass', ev => select_action(r, action, uname), dActions, { fz: 13 }, ['donebutton', 'enabled'], 'd_pass');
}
function activate_playerstats(items) {
	let fen = Z.fen;
	for (const plname in fen.players) {
		let ui = items[plname];
		let d = iDiv(ui);
		d.onclick = () => { switch_uname(plname); onclick_reload(); }
	}
}
function activate_ui() {
	if (uiActivated) { DA.ai_is_moving = false; return; }
	uiActivated = true; DA.ai_is_moving = false;
}
function activateChat(username) {
	if (DA.activeChat == username) { console.log('already active:', username); return; }
	if (isdef(DA.activeChat) && DA.activeChat != username) deactivateChat(DA.activeChat);
	DA.activeChat = username;
	let active = ActiveChats[username];
	let othername = username;
	let mename = Username;
	let other = active.userdata;
	let me = Userdata;
	if (nundef(active.div)) {
		let dcontactlist = mBy('dChat');
		other.bg = randomColor();
		other.fg = colorIdealText(other.bg);
		let dContact = presentInChatList(other, dcontactlist);
		active.div = dContact;
		mStyle(dContact, { bg: other.bg, fg: other.fg });
		dContact.onclick = () => activateChat(username);
	} else {
		console.log('es gibt schon ein entry fuer', username, 'in chat menu', iDiv(active), '\nactive', active)
	}
	mClass(active.div, 'activeChat');
	let d = showChatWindow();
	clearElement(d);
	console.log('add title to chatWindow!');
	for (const msg of active.messages) {
		let className = msg.sender == othername ? 'message_left' : 'message_right';
		let path = getProfileImagePath(msg.sender == othername ? other : me);
		let d1 = mDiv(d);
		if (msg.sender == othername) mStyle(d1, { bg: other.bg, fg: other.fg });
		let dImg = mImg(path, d1, { w: 40, h: 40, rounding: '50%' }, 'profile_img');
		let dtext = mText(msg.message, d1, {});
		mStyle(d1, { 'box-shadow': '0px 0px 10px #aaa', rounding: 10, padding: 10, matop: 10, display: 'flex', gap: 10, float: msg.sender == othername ? 'left' : 'right', w: '60%' });
	}
}
function ActivateChessWidgets() {
	StopThinking();
	$("#SetFen").click(function () {
		var fenStr = $("#fenIn").val();
		ParseFen(fenStr);
		PrintBoard();
		SetInitialBoardPieces();
		GameController.PlayerSide = brd_side;
		CheckAndSet();
		EvalPosition();
		NewGameAjax();
	});
	$("#UndoButton").click(function () {
		console.log('Undo request... brd_hisPly:' + brd_hisPly);
		if (brd_hisPly > 0) {
			TakeMove(); if (brd_hisPly > 0) TakeMove();
			brd_ply = 0;
			SetInitialBoardPieces();
			$("#currentFenSpan").text(BoardToFen());
		}
	});
	$("#HintButton").click(function () {
		FLAG_HINT_ONLY = true;
		let move = PreSearch();
	});
	$("#SearchButton").click(function () {
		GameController.PlayerSide = brd_side ^ 1;
		PreSearch();
	});
	$("#FlipButton").click(function () {
		GameController.BoardFlipped ^= 1;
		console.log("Flipped:" + GameController.BoardFlipped);
		SetInitialBoardPieces();
	});
	$("#EndGameButton").click(function () {
		let fen = chooseRandom(FenPositionList).FEN;
		console.log('fen', fen)
		NewGame(fen);
		NewGameAjax();
	});
	$("#NewGameButton").click(function () {
		NewGame();
		NewGameAjax();
	});
}
function activateFocusGroup(iFocus) {
	if (isdef(iFocus)) Goal.iFocus = iFocus;
	if (Goal.iFocus === null) {
		console.log('nothing to activate');
		return;
	}
	let g = Goal.words[Goal.iFocus];
	g.div.style.backgroundColor = 'black';
}
function activateML() {
	onkeypress = ev => {
		clearFleetingMessage();
		if (uiPaused || ev.ctrlKey || ev.altKey) return;
		let charEntered = ev.key.toString();
		if (!isAlphaNum(charEntered)) return;
		Selected = { lastLetterEntered: charEntered.toUpperCase() };
		if (nMissing == 1) {
			let d = Selected.feedbackUI = inputs[0].div;
			Selected.lastIndexEntered = inputs[0].index;
			Selected.inp = inputs[0];
			d.innerHTML = Selected.lastLetterEntered;
			mRemoveClass(d, 'blink');
			let result = buildWordFromLetters(mParent(d));
			evaluate(result);
		} else {
			let ch = charEntered.toUpperCase();
			for (const inp of inputs) {
				if (inp.letter == ch) {
					Selected.lastIndexEntered = inp.index;
					Selected.inp = inp;
					let d = Selected.feedbackUI = inp.div;
					d.innerHTML = ch;
					mRemoveClass(d, 'blink');
					removeInPlace(inputs, inp);
					nMissing -= 1;
					break;
				}
			}
			if (nundef(Selected.lastIndexEntered)) {
				showFleetingMessage('you entered ' + Selected.lastLetterEntered)
				say('this letter does NOT belong to the word!')
			}
			showFleetingMessage(composeFleetingMessage(), 3000);
		}
	}
}
function activateOn(item, event, handler) {
	let d = item.div;
	mStyleX(d, { cursor: 'pointer' });
	d[event] = ev => { handler(ev); evaluate() };
	item.isActive = true;
}
async function activateSP() {
	if (isSpeakerRunning) {
		setTimeout(activateSP, 300);
	} else {
		setTimeout(() => record(currentLanguage, bestWord), 100);
	}
}
async function activateSPA() {
	OnMicrophoneReady = setTimeout(() => {
		say(bestWord, .7, 1, 1, false, 'random');
	}, DELAY_BETWEEN_MIKE_AND_SPEECH);
	setTimeout(() => record(currentLanguage, bestWord), 100);
}
function activateTC() {
	uiActivatedTC = true;
}
function activateTests(commaSepString) {
	addIfComma(commaSepString, activatedTests);
}
function activateTooltips() {
	for (const oid in G.table) {
		if (isdef(getFirstVisual(oid))) createTooltip(oid);
	}
	for (const oid in G.players) {
		if (isdef(getFirstVisual(oid))) createTooltip(oid);
	}
}
function activateTooltips_hallo() {
	for (const oid in G.table) {
		if (isdef(getVisual(oid))) createTooltip(oid);
	}
	for (const oid in G.players) {
		if (isdef(getVisual(oid))) createTooltip(oid);
	}
}
function activateTP() {
	uiActivated = true;
}
function activateUi() {
	Selected = null;
	uiActivated = true;
	G.instance.activate();
}
function activateUis(R) {
	for (const uid in R.uiNodes) {
		let n = R.uiNodes[uid];
		if (isdef(n.oid) && isdef(n.ui)) {
			n.act.activate(highSelfAndRelatives, unhighSelfAndRelatives, selectUid);
		}
	}
	R.isUiActive = true;
}
function activateUserSelection() {
	hide(document.getElementById('dFrozen'));
	show(document.getElementById('dActive'));
	hide(document.getElementById('bNextPlayer'));
	show(document.getElementById('uiActiveButtons'));
	show(document.getElementById('ui2Buttons'));
	show(document.getElementById('uiEditButtons'));
}
function activateWaitingForServer() {
	show(document.getElementById('dFrozen'));
	hide(document.getElementById('dActive'));
	hide(document.getElementById('bNextPlayer'));
	hide(document.getElementById('uiActiveButtons'));
	hide(document.getElementById('ui2Buttons'));
	hide(document.getElementById('uiEditButtons'));
}
function activateWP() {
	inputBox.onkeyup = ev => {
		if (ev.ctrlKey || uiPaused) return;
		if (ev.key === "Enter") {
			ev.cancelBubble = true;
			evaluate(ev);
		}
	};
	inputBox.focus();
}
function activationUI() { uiPaused &= ~beforeActivationMask; }
function actualCenter(elem, relToParent = false, elRelTo) {
	let b = getBounds(elem, relToParent, elRelTo);
	return { x: Math.round(b.left + b.width / 2), y: Math.round(b.top + b.height / 2) };
}
function actualHeight(elem) { return Math.round(getBounds(elem).height); }
function actualLeft(elem, relToParent = false, elRelTo) { return Math.round(getBounds(elem, relToParent, elRelTo).left); }
function actualTop(elem, relToParent = false, elRelTo) { return Math.round(getBounds(elem, relToParent, elRelTo).top); }
function actualWidth(elem) { return Math.round(getBounds(elem).width); }
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
}
function add_a_schwein(fen, uname) {
	let type = rChoose(['farm', 'estate', 'chateau']);
	let keys = deck_deal(fen.deck, type[0] == 'f' ? 4 : type[0] == 'e' ? 5 : 6);
	fen.players[uname].buildings[type].push({ list: keys, h: null });
}
function add_agent_at(map, p1) {
	if (M.state != 'a') { console.log('wrong state!', M.state); return; }
	let a = new Agent(map, .0001, false, null, p1);
	lookupAddToList(M, ['agents'], a);
	console.log("adding agent at", p1);
}
function add_auction_history() {
	let [fen, plorder] = [Z.fen, Z.plorder];
	for (const plname of fen.plorder) {
		if (nundef(fen.buy[plname])) continue;
		ari_history_list([`${plname} buys ${fen.buy[plname].a} for ${fen.second_most}`], 'auction');
	}
}
function add_card_to_group(card, oldgroup, oldindex, targetcard, targetgroup) {
	card.groupid = targetgroup.id;
	if (card.source == 'hand') {
		let hand = UI.players[Z.uplayer].hand;
		removeInPlace(hand.items, card);
	}
	card.source = 'group';
	mDroppable(iDiv(card), drop_card_fritz, dragover_fritz);
	if (nundef(targetcard)) {
		targetgroup.ids.push(card.id);
		mAppend(iDiv(targetgroup), iDiv(card));
	} else {
		let index = targetgroup.ids.indexOf(targetcard.id) + 1;
		targetgroup.ids.splice(index, 0, card.id);
		mClear(iDiv(targetgroup));
		for (let i = 0; i < targetgroup.ids.length; i++) {
			let c = Items[targetgroup.ids[i]];
			mAppend(iDiv(targetgroup), iDiv(c));
		}
	}
	resplay_container(targetgroup);
}
function add_click_set_agent() { M.state = 'a'; M.map.on('click', e => { add_agent_at(M.map, [e.latlng.lat, e.latlng.lng]) }); }
function add_edit(x, y, text = '', bg = 'random') {
	let d = mDiv(dTable, { bg: bg, fg: 'contrast', x: x, y: y, position: 'absolute', padding: 10, wmin: 10, }, getUID(), text);
	DA.edits.push(d);
	add_interaction(d);
}
function add_element(f) {
	if (tree.length == 0) { addlayer(); return; }
	let root = firstCond(tree, x => !x.finished);
	if (!root) {
		console.log('tree is finished!');
		return;
	}
	if (root) f(root);
}
function add_havecode_content(dParent) {
	let d1 = mDiv(dParent);
	let [dl, dr] = mColFlex(d1, [4, 1]);
	dr.innerHTML = img_html('verify_right.jpg');
	let d2 = mDiv(dl, { w: '100%', padding: 12, box: true });
	let d3 = mDiv(d2, { fz: 22, weight: 900, rounding: 4, hmin: 50, border: 'none' }, null, 'Enter Authorization Code');
	let d4 = mDiv(dl, { w: '100%', padding: 12, box: true, fz: 14, family: 'Verdana' }, null, 'An authorization code was sent to your phone');
	let d5 = mDiv(dl, { w: '100%', matop: 12, mabottom: 20, hpadding: 12, box: true, fz: 14, family: 'Verdana' }, null, 'XXX-XXX-0297');
	let html = `
				<div>
						<form action="javascript:onclick_boa_submit_code();">
								<div>
										<label for="inpAuthocode">Authorization code</label><br>
										<input style="border:1px dotted silver;padding:4px" id="inpAuthocode" name="authocode" value="XXXXXX" type="text" />
										<div class="clearboth"></div>
								</div>
								<div style="font-size:12px;margin:30px 0px">The code expires 10 minutes after you request it.</div>
								<a style="font-size:12px;">Request another authorization code</a>
								<div style="margin-top:30px"><button id='bSubmit'>SUBMIT</button><button id='bCancel'>CANCEL</button></div>
						</form>
				</div>
		`;
	let d6 = mDiv(dl, { w: '100%', matop: 12, hpadding: 12, box: true, fz: 14, family: 'Verdana' }, null, html);
	let bSubmit = document.getElementById('bSubmit');
	let bStyle = { vpadding: 6, hpadding: 20, fz: 20, rounding: 6, maright: 25, weight: 'bold' };
	mStyle(bSubmit, bStyle);
	mStyle(bCancel, bStyle); mStyle(bCancel, { fg: 'grey', border: 'grey' })
	mClass(bSubmit, 'btn-bofa-blue');
	bCancel.onclick = onclick_boa_cancel;
}
function add_interaction(d) {
	d.setAttribute('contentEditable', true);
	d.style.outline = 'none';
	d.onkeydown = function (e) {
		DA.tabKeyPressed = e.keyCode == 9;
		if (DA.tabKeyPressed) {
			e.preventDefault();
			return;
		} else {
		}
	};
	d.onkeyup = function (e) {
		if (DA.tabKeyPressed) {
			let idx = DA.edits.indexOf(e.target);
			let next = (idx + 1) % DA.edits.length;
			if (next != idx) DA.edits[next].focus();
			e.preventDefault();
			return;
		}
	};
	d.onfocus = e => {
		if (DA.focusElement != e.target && isdef(DA.focusElement)) {
			let el = DA.focusElement;
			if (isEmpty(el.innerHTML)) {
				removeInPlace(DA.edits, el);
				el.remove();
			}
		}
		DA.focusElement = e.target;
	};
	d.focus();
}
function add_make_payments_button(ev) {
	let id = evToClosestId(ev);
	let inp = mBy(id);
	if (isdef(DA.prevHidden)) { mClear(DA.prevHidden); }
	let dHidden = inp.parentNode.parentNode.parentNode.parentNode.parentNode.lastChild;
	mClear(dHidden);
	let d1 = mCard(dHidden, { w: '90%', padding: 10, box: true });
	let el = mDiv(d1, { cursor: 'pointer' }, null, `<span class="btn-bofa btn-bofa-blue btn-bofa-blue-lock">Make Payments</span>`);
	el.onclick = () => make_payments_challenge_eval(inp);
	DA.prevHidden = dHidden;
}
function add_new_user(udata, save = true) {
	console.log('WILL NOT ADD NEW USERS AT THIS TIME!!!', udata); return;
	console.assert(isDict(udata) && isdef(udata.name) && isString(udata.name) && udata.name.length < 50, 'CANNOT ADD THIS WEIRED USER ' + udata.name);
	DB.users[udata.name] = udata;
	if (save) db_save();
	return udata;
}
function add_players() {
	let res = prompt('enter player names to be added: ');
	let parts = splitAtAnyOf(res, ' ,');
	let list = Session.game_options.players.slice(1);
	for (const p of parts) {
		let name = p.toLowerCase().trim();
		if (isdef(DB.users[name])) addIf(list, name);
	}
	list.sort(); list.unshift(Session.cur_user);
	populate_players(list);
}
function add_rumors_to_buildings(o) {
	fen = o.fen;
	for (const plname of fen.plorder) {
		let buildings = fen.players[plname].buildings;
		for (const type in buildings) {
			for (const b of buildings[type]) {
				if (type == 'farm') b.h = rCard('n');
				b.rumors = arrFunc(2, () => rCard('r'));
			}
		}
	}
}
function add_schwein(card, fenbuilding, uibuilding) {
	if (isdef(uibuilding)) add_ui_schwein(card, uibuilding.schweine);
	let ckey = isString(card) ? card : card.key;
	let index = isString(card) ? fenbuilding.list.indexOf(ckey) : card.index;
	fenbuilding.schweine.push(index);
	console.log('fen schweine', fenbuilding.schweine);
}
function add_to_chain(list) { DA.chain = DA.chain.concat(list); }
function add_transaction(cmd) {
	if (!DA.simulate) start_transaction();
	DA.transactionlist.push(cmd);
}
function add_ui_schwein(item, uischweine) {
	uischweine.push(item);
	mStyle(iDiv(item), { position: 'relative' });
	miPic('pig', iDiv(item), { position: 'absolute', top: 30, left: 0, fz: 30 });
	face_up(item);
}
async function add_users_to_sql_db(not_in_sql_db) { to_server(not_in_sql_db, 'add_users'); }
function add_verify_content(dParent) {
	let d1 = mDiv(dParent);
	let [dl, dr] = mColFlex(d1, [4, 1]);
	dr.innerHTML = img_html('verify_right.jpg');
	let d2 = mDiv(dl, { w: '100%', padding: 12, box: true });
	let d3 = mDiv(d2, { fz: 22, weight: 900, rounding: 4, hmin: 50, border: '3px solid black' }, null, 'Request Authorization Code');
	let d4 = mDiv(dl, { w: '100%', padding: 12, box: true, fz: 14, family: 'Verdana' }, null, 'To verify your identity, we need to send you an authorization code');
	let d5 = mDiv(dl, { w: '100%', matop: 12, hpadding: 12, box: true, fz: 14, family: 'Verdana' }, null, 'Select a Phone Number');
	let st1 = `padding:12px;font-size:18px;`;
	let stradio = `margin:5px 10px;color:black`;
	let html = `
				<div id='dPhoneContact' style="${st1}">
						<fieldset>
								<div style="${stradio}">
										<div>
												<input class="multipleContact" id="tlpvt-text1" name="phoneContact" value="text_1" type="radio" />
												<label for="tlpvt-text1">XXX-XXX-7382</label>
												<div class="clearboth"></div>
										</div>
								</div>
								<div style="${stradio}">
										<div class="phone-num">
												<input class="multipleContact" id="tlpvt-text2" name="phoneContact" value="text_2" type="radio" />
												<label class="TL_NPI_L1" for="tlpvt-text2">XXX-XXX-9671</label>
												<div class="clearboth"></div>
										</div>
								</div>
								<div style="${stradio}">
										<div class="phone-num">
												<input class="multipleContact" id="tlpvt-text3" name="phoneContact" value="text_3" type="radio" />
												<label class="TL_NPI_L1" for="tlpvt-text3">XXX-XXX-0297</label>
												<div class="clearboth"></div>
										</div>
								</div>
						</fieldset>
				</div>
		`;
	mAppend(dl, mCreateFrom(html));
	let d7 = mDiv(dl, { w: '100%', matop: 12, hpadding: 12, box: true, fz: 14, family: 'Verdana' }, null, 'How would you like to receive it?');
	html = `
				<div id='dTextOrPhone' style="${st1}">
						<fieldset>
								<div style="${stradio}">
										<div>
												<input class="multipleContact" id="tph-text1" name="textorphone" value="text_1" type="radio" checked />
												<label for="tph-text1">Text message</label>
												<div class="clearboth"></div>
										</div>
								</div>
								<div style="${stradio}">
										<div class="phone-num">
												<input class="multipleContact" id="tph-text2" name="textorphone" value="text_2" type="radio" />
												<label class="TL_NPI_L1" for="tph-text2">Phone call</label>
												<div class="clearboth"></div>
										</div>
								</div>
						</fieldset>
				</div>
		`;
	mAppend(dl, mCreateFrom(html));
	let d9 = mDiv(dl, { w: '100%', matop: 12, hpadding: 12, box: true, fz: 14, family: 'Verdana' }, null, 'The code expires 10 minutes after you request it');
	let d10 = mDiv(dl, { w: '100%', matop: 12, hpadding: 12, box: true, fz: 14, family: 'Verdana' }, null, '<a>Having trouble receiving you code by phone?</a>');
	let d11 = mDiv(dl, { w: '100%', matop: 12, hpadding: 12, box: true, fz: 14, family: 'Verdana' }, null, 'You are consenting to be contacted at the phone number selected for the purpose of receiving an authorization code. If you selected text message, Wireless and text message fees may apply from you carrier.<br>Supported carriers include AT&T, Sprint, T-Mobile, US Cellular, Verizon, or any other branded wireless operator.');
	let d12 = mDiv(dl, { hpadding: 12, matop: 24, gap: 12 }); mFlex(d12);
	let bstyle = { vpadding: 12, hpadding: 20, fz: 20, fg: 'grey', rounding: 6, maright: 25, weight: 'bold' };
	mButton('SEND CODE', onclick_boa_sendcode, d12, bstyle);
	mButton('CANCEL', onclick_boa_cancel, d12, bstyle);
}
function addAdjacencyFromTo(r1, r2, dir, rect) {
	let house = Items[r1.house];
	if (!r2) rect = rrto(rect, house.rect);
	lookupAddToList(r1, ['walls', dir], { rect: rect, dir: dir, room: r2 ? r2.id : r2, door: null });
	let dir2 = r2 ? getOppDir(dir) : dir;
	lookupAddToList(r2 ? r2 : Items[r1.house], ['walls', dir2], { rect: rect, dir: dir2, room: r1.id, door: null });
}
function addAll(akku, other) {
	for (const el of other) {
		akku.push(el);
	}
	return akku;
}
function addAREA(id, o) {
	if (AREAS[id]) {
		error('AREAS ' + id + ' exists already!!! ');
		error(o);
		return;
	}
	AREAS[id] = o;
}
function addAsSoundToDatabase(info, answer) {
}
function addBadge(dParent, level, clickHandler, animateRubberband = false) {
	let fg = '#00000080';
	let textColor = 'white';
	let isText = true; let isOmoji = false;
	let i = level - 1;
	let key = levelKeys[i];
	let k = replaceAll(key, ' ', '-');
	let item = getItem(k);
	let label = item.label = "level " + i;
	let h = window.innerHeight;
	let sz = h / 14;
	let options = _simpleOptions({ w: sz, h: sz, fz: sz / 4, fzPic: sz / 2, bg: levelColors[i], fg: textColor });
	options.handler = clickHandler;
	let d = makeItemDiv(item, options);
	mAppend(dParent, d);
	item.index = i;
	badges.push(item);
	return arrLast(badges);
}
function AddBlackPawnCaptureMove(from, to, cap) {
	if (RanksBrd[from] == RANKS.RANK_2) {
		AddCaptureMove(MOVE(from, to, cap, PIECES.bQ, 0));
		AddCaptureMove(MOVE(from, to, cap, PIECES.bR, 0));
		AddCaptureMove(MOVE(from, to, cap, PIECES.bB, 0));
		AddCaptureMove(MOVE(from, to, cap, PIECES.bN, 0));
	} else {
		AddCaptureMove(MOVE(from, to, cap, PIECES.EMPTY, 0));
	}
}
function AddBlackPawnQuietMove(from, to) {
	if (RanksBrd[from] == RANKS.RANK_2) {
		AddQuietMove(MOVE(from, to, PIECES.EMPTY, PIECES.bQ, 0));
		AddQuietMove(MOVE(from, to, PIECES.EMPTY, PIECES.bR, 0));
		AddQuietMove(MOVE(from, to, PIECES.EMPTY, PIECES.bB, 0));
		AddQuietMove(MOVE(from, to, PIECES.EMPTY, PIECES.bN, 0));
	} else {
		AddQuietMove(MOVE(from, to, PIECES.EMPTY, PIECES.EMPTY, 0));
	}
}
function addBoard(R) { R.initRound(); reAddServerObject('board'); }
function addBoatInteraction(id) {
	let mobj = UIS[id];
	mobj.addClickHandler('elem', onClickSelectTuple);
	mobj.addMouseEnterHandler('title', (x, pName) => x.high(pName));
	mobj.addMouseLeaveHandler('title', (x, pName) => x.unhigh(pName));
}
function addBorder(elem, color, thickness) {
	elem.style.border = color + ' ' + thickness + 'px solid';
	elem.style.boxSizing = 'border-box';
}
function addByKey(oNew, oOld, except) {
	for (const k in oNew) {
		let val = oNew[k];
		if (isdef(except) && except.includes(k) || !isNumber(val)) continue;
		oOld[k] = isdef(oOld[k]) ? oOld[k] + val : val;
	}
}
function AddCaptureMove(move) {
	brd_moveList[brd_moveListStart[brd_ply + 1]] = move;
	brd_moveScores[brd_moveListStart[brd_ply + 1]++] = MvvLvaScores[CAPTURED(move) * 14 + brd_pieces[FROMSQ(move)]] + 1000000;
}
function addCard(c, deck, top = true) { top ? deck.push(c) : deck.unshift(c); }
function addCardsToMainPlayer(n = 1) {
	if (GAME != 'catan') return;
	for (const plid in serverData.players) {
		let res = [];
		for (let i = 0; i < n; i++) {
			let card = {
				id: getUID(),
				short_name: 'K',
				obj_type: 'card',
				generic_type: 'card'
			};
			res.push({ _obj: card.id });
			serverData.table[card.id] = card;
		}
		let pl = serverData.players[plid];
		res = GAME == 'catan' ? pl.devcards._set.concat(res) : pl.hand._set.concat(res);
		if (GAME == 'catan') pl.devcards = { _set: res }; else pl.hand = { _set: res };
		break;
	}
}
function addCardsToPlayers(n = 1) {
	for (const plid in serverData.players) {
		let res = [];
		for (let i = 0; i < n; i++) {
			let card = {
				id: getUID(),
				short_name: 'K',
				obj_type: 'card',
				generic_type: 'card'
			};
			res.push({ _obj: card.id });
			serverData.table[card.id] = card;
		}
		let pl = serverData.players[plid];
		res = GAME == 'catan' ? pl.devcards._set.concat(res) : pl.hand._set.concat(res);
		if (GAME == 'catan') pl.devcards = { _set: res }; else pl.hand = { _set: res };
	}
}
function addCardTo(d) {
}
function addCardToCollectionArea(oid, collectionAreaName) {
	let idCollection = getIdArea(collectionAreaName);
	let isCard = getMainId(oid);
	let msCard = UIS[isCard];
	let msCollection = UIS[idCollection];
	msCard.hand = idCollection;
	msCard.collectionKey = msCollection.collectionKey;
	if (nundef(msCollection.numCards)) {
		msCollection.numCards = 1;
		msCollection.dx = 0;
		msCollection.cards = [oid];
	} else {
		msCollection.numCards += 1;
		msCollection.cards.push(oid);
	}
	let n = msCollection.numCards;
	msCard.zIndex = n;
	msCard.attach('hand');
	let hCard = msCard.elem.offsetHeight;
	let bounds = getBounds(msCard.elem);
	let hCard1 = bounds.height;
	let hHand = getBounds(msCollection.elem).height;
	let partHand = msCollection.parts['hand'];
	if (isdef(partHand)) hHand -= getBounds(partHand, true).y;
	msCollection.hHand = hHand;
	let wCard = msCard.elem.offsetWidth;
	let scale = 1;
	if (hCard >= hHand) {
		scale = hHand / hCard;
		msCard.elem.style.transform = `scale(${scale})`;
		msCard.elem.style.transformOrigin = '0% 0%';
	}
	msCollection.scale = scale;
	wCard = msCard.elem.offsetWidth;
	let wReal = wCard * scale;
	let hReal = hCard * scale;
	msCollection.wCard = wReal;
	msCollection.hCard = hReal;
	repositionCards(msCollection);
}
function addCardToHand(oid, areaName) {
	let idHandMS = getIdArea(areaName);
	let idCardMS = getMainId(oid);
	let mobj = UIS[idCardMS];
	let msHand = UIS[idHandMS];
	mobj.hand = idHandMS;
	if (nundef(msHand.numCards)) {
		msHand.numCards = 1;
		msHand.dx = 0;
		msHand.cards = [oid];
	} else {
		msHand.numCards += 1;
		msHand.cards.push(oid);
	}
	let n = msHand.numCards;
	mobj.zIndex = n;
	mobj.attach('hand');
	let hCard = mobj.elem.offsetHeight;
	let bounds = getBounds(mobj.elem);
	let hCard1 = bounds.height;
	let hHand = getBounds(msHand.elem).height;
	let partHand = msHand.parts['hand'];
	if (isdef(partHand)) hHand -= getBounds(partHand, true).y;
	msHand.hHand = hHand;
	let wCard = mobj.elem.offsetWidth;
	let scale = 1;
	if (hCard >= hHand) {
		scale = hHand / hCard;
		mobj.elem.style.transform = `scale(${scale})`;
		mobj.elem.style.transformOrigin = '0% 0%';
	}
	msHand.scale = scale;
	wCard = mobj.elem.offsetWidth;
	let wReal = wCard * scale;
	let hReal = hCard * scale;
	msHand.wCard = wReal;
	msHand.hCard = hReal;
	_repositionCards(msHand);
}
function addCatsToKeys() {
	console.log('Syms', Syms);
	for (const ksk in KeySets) {
		for (const k of KeySets[ksk]) {
			let info = Syms[k]
			lookupAddIfToList(info, ['cats'], ksk);
		}
	}
	downloadAsYaml(Syms, 'symsWithCats');
}
function addChat(msg) { addListItem('chatEvent', msg); }
function addClass(el, clName) { if (!el) return; el.classList.add(clName); }
function addClassInfo(ui, n) {
	if (isdef(ui.firstChild)) {
		let cl1 = Array.from(ui.firstChild.classList); cl1 = isEmpty(cl1) ? cl1 : cl1.join(',');
		let cl = Array.from(ui.classList); cl = isEmpty(cl) ? cl : cl.join(',');
		n.class = { pre: cl1, top: cl };
	} else {
		let cl = Array.from(ui.classList); cl = isEmpty(cl) ? cl : cl.join(',');
		n.class = cl;
	}
}
function addColorPicker(c) {
	let form = mBy('myform');
	let img = mBy('imgPreview');
	let picker = mColorPickerBehavior(colorFrom(c), img, form,
		(a) => { DA.newColor = a; DA.colorChanged = true; },
		{ w: 322, h: 45, bg: 'green', rounding: 6, margin: 'auto', align: 'center' });
	if (is_online()) {
		img.ondragover = img.ondrop = img.ondragleave = handle_drag_and_drop;
	}
	mBy('img_dd_instruction').style.opacity = is_online() ? 1 : 0;
	img.onload = null;
}
function addColumn(dParent, o, keys) {
	console.log('addColumn', dParent)
	let d = getFloatLeftDiv();
	console.log('d', d)
	let t = tableElem(o, keys);
	d.appendChild(t);
	dParent.appendChild(d);
	dParent.style.backgroundColor = 'dimgray';
	return [d, t];
}
function addComment(s, dParent) { return mMultiline(s, 2, dParent); }
function addCSSClass(className, text) {
	sheet.insertRule('.' + className + ' { ' + text + ' }', 0);
}
function addDDSource(source, isCopy = true, clearTarget = false) {
	DDInfo.sources.push(source);
	let d = iDiv(source);
	d.onmousedown = (ev) => ddStart(ev, source, isCopy, clearTarget);
}
function addDDTarget(target, isCopy = true, clearTarget = false) {
	DDInfo.targets.push(target);
	target.isCopy = isCopy;
	target.clearTarget = clearTarget;
}
function addDeckTo(deck, domel, id, flip = false, drag = false) {
	if (nundef(id)) id = getUID();
	clearElement(domel);
	let mobj = new DeckMS(id, deck);
	mobj.attachTo(domel);
	if (flip) enableFlipForDeck(mobj.o);
	if (drag) enableDragForDeck(mobj.o);
	return mobj;
}
function addDiv(dParent, { html, w = '100%', h = '100%', bg, fg, border, rounding, margin, padding, float, position, x, y, textAlign, fontSize }) {
	return addDivU({ dParent: dParent, html: html, w: w, h: h, bg: bg, fg: fg, border: border, rounding: rounding, margin: margin, padding: padding, float: float, position: position, x: x, y: y, textAlign: textAlign, fz: fontSize });
}
function addDivClass(dParent, id, className) { return addDivU({ dParent: dParent, id: id, className: className }); }
function addDivFill(id, dParent) { return addDivU({ dParent: dParent, id: id, w: '100%', h: '100%' }); }
function addDivFullClass(dParent, id, className) { return addDivU({ dParent: dParent, id: id, w: '100%', h: '100%', className: className }); }
function addDivPos(dParent, x, y, w, h, { gap, bg, fg, border, rounding, textAlign, fontSize } = {}) {
	if (gap > 0) {
		let wCont = dParent.offsetWidth;
		let isRight = x + w >= wCont;
		let hCont = dParent.offsetHeight;
		let isBottom = y + h >= hCont;
		x += gap;
		y += gap;
		w -= (isRight ? 2 : 1) * gap;
		h -= (isBottom ? 2 : 1) * gap;
	}
	return addDiv(dParent, { position: 'absolute', x: x, y: y, w: w, h: h, bg, fg, border, rounding, textAlign, fontSize });
}
function addDivPosGap(dParent, x, y, w, h, { gap, bg, fg, border, rounding, textAlign, fontSize, position = 'absolute' } = {}) {
	return addDivU({ dParent: dParent, x: x, y: y, w: w, h: h, gap: gap, bg: bg, fg: fg, border: border, textAlign: textAlign, fz: fontSize, position: position });
}
function addDivPosTo(dParent, x = 0, y = 0, w = 100, h = 100, unit = '%', bg = 'blue', position = 'absolute') {
	return addDivU({ dParent: dParent, x: x, y: y, w: w, h: h, unit: unit, position: position, bg: bg });
}
function addDivTo(dParent, w = 100, h = 100, unit = '%', bg = 'blue') { return addDivU({ dParent: dParent, w: w, h: h, unit: unit, bg: bg }); }
function addDivToBody(w = 100, h = 100, unit = '%', bg = 'blue') { return addDivU({ dParent: document.body, w: w, h: h, unit: unit, bg: bg }); }
function addDivU({ id, dParent, w, h, unit, fg, bg, position, x, y, html, className, styleStr, border, rounding, gap, margin, padding, float, textAlign, fz }) {
	let d1 = document.createElement('div');
	if (isdef(dParent)) dParent.appendChild(d1); else dParent = null;
	if (isdef(id)) d1.id = id;
	if (isdef(fg)) d1.style.setProperty('color', fg);
	if (isdef(bg)) d1.style.setProperty('background-color', bg);
	if (isdef(html)) d1.innerHTML = html;
	if (gap > 0 && (unit == '%' || dParent && isdef(dParent.offsetWidth) && isdef(dParent.offsetHeight))) {
		let wCont = unit == '%' ? 100 : dParent.offsetWidth;
		let isRight = x + w >= wCont;
		let hCont = unit == '%' ? 100 : dParent.offsetHeight;
		let isBottom = y + h >= hCont;
		x += gap;
		y += gap;
		w -= (isRight ? 2 : 1) * gap;
		h -= (isBottom ? 2 : 1) * gap;
	}
	if (nundef(unit)) unit = '%';
	if (isdef(w)) d1.style.setProperty('width', makeUnitString(w, unit));
	if (isdef(h)) d1.style.setProperty('height', makeUnitString(h, unit));
	if (isdef(x) || isdef(y)) { posXY(d1, dParent, x, y, unit, position); }
	if (isdef(className)) d1.classList.add(className);
	if (isdef(styleStr)) d1.style.cssText += styleStr;
	if (isdef(border)) {
		d1.style.border = border;
		if (isdef(rounding)) d1.style.borderRadius = rounding;
	}
	if (isdef(margin)) d1.style.setProperty('margin', makeUnitString(margin, 'px'));
	if (isdef(padding)) d1.style.setProperty('padding', makeUnitString(padding, 'px'));
	if (float) d1.style.setProperty('float', float);
	if (textAlign) d1.style.textAlign = textAlign;
	if (isdef(fz)) d1.style.setProperty('fontSize', makeUnitString(fz, 'px'));
	return d1;
}
function addDummy(dParent) {
	let b = mButton('', null, dParent, { opacity: 0, h: 0, w: 0, padding: 0, margin: 0, outline: 'none', border: 'none', bg: 'transparent' });
	b.id = 'dummy';
}
function addEdges(board, bid, gName, streets) {
	board.edges = [];
	board.edgesByStartRowCol = [];
	for (const fid of board.fields) {
		let f = EID[fid];
		let nodelist = Object.values(f.nodes);
		for (let k = 0; k < nodelist.length; k++) {
			let n1 = EID[nodelist[k]];
			let n2 = k == nodelist.length - 1 ? EID[nodelist[0]] : EID[nodelist[k + 1]];
			let smaller = n1;
			let bigger = n2;
			if (n1.x > n2.x) {
				smaller = n2;
				bigger = n1;
			} else if (n1.x == n2.x) {
				if (n1.y > n2.y) {
					smaller = n2;
					bigger = n1;
				}
			}
			let xEdge = (smaller.x + bigger.x) / 2;
			let yEdge = (smaller.y + bigger.y) / 2;
			let edge = byPos1(xEdge, yEdge);
			streets.border = 'green';
			if (!edge) {
				edge = makeElemY('edge', bid, gName, streets.level, {
					row: smaller.row,
					col: smaller.col,
					x: xEdge,
					y: yEdge,
					x1: smaller.x,
					y1: smaller.y,
					x2: bigger.x,
					y2: bigger.y,
					ipal: streets.ipal,
					bg: streets.bg,
					fg: streets.fg,
					shape: streets.shape,
					border: streets.border,
					thickness: streets.thickness
				});
				board.edges.push(edge.id);
				if (!(edge.row in board.edgesByStartRowCol)) board.edgesByStartRowCol[edge.row] = [];
				board.edgesByStartRowCol[edge.row][edge.col] = edge.id;
				edge.source = smaller.id;
				edge.dest = bigger.id;
				smaller.edges.push(edge.id);
				bigger.edges.push(edge.id);
				edge.nodes = [smaller.id, bigger.id];
				edge.fields = [];
			}
			f.edges.push(edge.id);
			edge.fields.push(f.id);
		}
	}
}
function addEndHandler() {
	recognition.onend = function () {
		if (!isGameWithSpeechRecognition()) return;
		isRunning = false;
		if (recordCallback) {
			if (RecogOutput) console.log('* recog.onend: recordCallback NON_EMPTY!', recordCallback);
			recordCallback();
			return;
		}
		MicrophoneHide();
		if (hasGotResult && !hasGotFinalResult) {
			if (RecogOutput) console.log('* recog.onend: EVAL interim', interim_transcript);
			setSpeechResult(interim_transcript, interim_confidence, interim_confidence2);
			evaluate(interim_transcript);
		} else if (!hasGotResult) {
			if (RecogOutput) console.log('* recog.onend: never got result!!!');
			if (OnMicrophoneProblem) OnMicrophoneProblem();
			else evaluate('');
		} else {
			if (RecogOutput) console.log('* recog.onend final DONE!', final_transcript);
		}
	};
}
function AddEnPassantMove(move) {
	brd_moveList[brd_moveListStart[brd_ply + 1]] = move;
	brd_moveScores[brd_moveListStart[brd_ply + 1]++] = 105 + 1000000;
}
function addErrorHandler() {
	recognition.onerror = function (event) {
		if (!isGameWithSpeechRecognition()) return;
		isRunning = false;
		if (RecogOutput) console.error(event);
		if (OnMicrophoneProblem) OnMicrophoneProblem();
		if (recordCallback) recordCallback();
	};
}
function addFilterHighlight(ms) { ms.highC('green'); }
function addFlexGridDiv(dParent) { return addDivU({ dParent: dParent, className: 'flex-grid' }); }
function addfork(root) {
	for (const a of [PI / 4, -PI / 6]) {
		let b = root.branch(a);
		root.children.push(b);
		tree.push(b);
	}
	root.finished = true;
}
function addGameViewHandlers() { addEventListener('keyup', keyUpHandler); addEventListener('keydown', keyDownHandler); }
function addGArea(gName, areaName = 'a_d_game', x = 0, y = 0, clearFirst = true) {
	let d = document.getElementById(areaName);
	if (clearFirst) {
		clearElement(d);
	}
	console.log(d, d.childNodes, d.firstChild);
	let container = d.firstChild ? d.firstChild : addDiv(d, { position: 'relative' });
	let w = container.offsetWidth;
	let h = container.offsetHeight;
	console.log('w', w, 'h', h);
	console.log(container);
	let dNew = addDiv(container, { position: 'absolute', x: x, y: y, w: w, h: h, bg: 'slategray', gap: 0 });
	let g = addSvgg(dNew, gName);
	g.classList.add('gCentered');
	return dNew;
}
function addGFill(id, dParent) {
	let res = addSvgg(dParent, id, { originInCenter: true });
	return res;
}
function addGrid9To(d, centerW, centerH, gap = '2px') {
	return makeGrid9(d, centerW, centerH, gap);
}
function addGridTo(d, rows, cols, gap = '2px') {
	console.log(d, rows, cols, gap);
	d.classList.add('gridContainer');
	d.style.setProperty('--grid-rows', rows);
	d.style.setProperty('--grid-cols', cols);
	d.style.setProperty('--grid-gap', gap);
	let cells = [];
	for (let r = 0; r < rows; r++) {
		cells[r] = [];
		for (let c = 0; c < cols; c++) {
			let cell = document.createElement("div");
			console.log(cell)
			cell.innerText = (r + ',' + c);
			d.appendChild(cell).className = "grid-item";
			cells[r].push(cell);
		}
	}
	return cells;
}
function addGridToBody(rows, cols) {
	let d = addDivToBody();
	d.classList.add('gridContainer');
	makeRows(d, rows, cols);
	return d;
}
async function addGroupInfo() {
	let symbolDict = SymbolDict = await localOrRoute('symbolDict', '../assets/symbolDict.yaml');
	let sInfo = SInfo = await localOrRoute('sInfo', '../assets/s_info.yaml');
	for (const k in Syms) {
		let old = symbolDict[k];
		let info = sInfo[k];
		if (isdef(old) && isdef(old.group)) {
			Syms[k].group = old.group;
			Syms[k].subgroup = old.subgroups;
		} else {
			Syms[k].subgroup = info.subgroup;
			Syms[k].group = info.group;
		}
	}
	for (const k in Syms) {
		if (nundef(Syms[k].group) || nundef(Syms[k].subgroup)) {
			console.log('IMMER NOCH KEIN GROUP INFO!!!!', k, Syms[k], sInfo[k], symbolDict[k]);
		}
	}
}
function AddGUIPiece(sq, pce) {
	var rank = RanksBrd[sq];
	var file = FilesBrd[sq];
	var rankName = "rank" + (rank + 1);
	var fileName = "file" + (file + 1);
	pieceFileName = "../base/assets/images/chess/" + SideChar[PieceCol[pce]] + PceChar[pce].toUpperCase() + ".png";
	imageString = "<image src=\"" + pieceFileName + "\" class=\"Piece clickElement " + rankName + " " + fileName + "\"/>";
	$("#ChessBoard").append(imageString);
}
function addHandTo(d) {
}
function addIdentityInformation() {
	if (nundef(S.gameConfig)) S.gameConfig = {};
	let gc = S.gameConfig;
	gc.username = USERNAME;
	let myPlayers = [];
	if (gc.gameConfig.players) {
		gc.gameStarter = gc.players[0];
		for (const pl of gc.players) {
			if (startsWith(pl.username, USERNAME)) myPlayers.push(pl);
		}
	}
}
function addIf(arr, el) { if (!arr.includes(el)) arr.push(el); }
function addIf_dep(el, arr) {
	if (!arr.includes(el)) arr.push(el);
}
function addIf_depComma(csv, arr) {
	let strings = csv.split(',');
	for (const s of strings) {
		addIf_dep(s.trim(), arr);
	}
}
function addIf_depDict(key, val, dict) {
	if (!(key in dict)) {
		dict[key] = [val];
	} else {
		addIf_dep(val, dict[key]);
	}
}
function addIf_depKeys(dict, keys, val) {
	let d = dict;
	keysCopy = jsCopy(keys);
	let lastKey = keysCopy.pop();
	for (const k of keysCopy) {
		if (!(k in d)) {
			d[k] = {};
		}
		d = d[k];
	}
	if (!(lastKey in d)) d[lastKey] = val;
	return d[lastKey];
}
function addIfComma(csv, arr) {
	let strings = csv.split(',');
	for (const s of strings) {
		addIf_dep(s.trim(), arr);
	}
}
function addIfDict(key, val, dict) {
	if (!(key in dict)) {
		dict[key] = [val];
	} else {
		addIf_dep(val, dict[key]);
	}
}
function addIfKeys(dict, keys, val) {
	let d = dict;
	keysCopy = jsCopy(keys);
	let lastKey = keysCopy.pop();
	for (const k of keysCopy) {
		if (!(k in d)) {
			d[k] = {};
		}
		d = d[k];
	}
	if (!(lastKey in d)) d[lastKey] = val;
	return d[lastKey];
}
function addItem(owner, key, val) {
	let o = owner[key] = val;
	Items.push(o);
}
function addKeydown(k, f) { if (nundef(DA.keydown)) DA.keydown = {}; DA.keydown[k] = f; }
function addKeys(ofrom, oto) { for (const k in ofrom) if (nundef(oto[k])) oto[k] = ofrom[k]; return oto; }
function addKeyup(k, f) {
	if (nundef(DA.keyup)) DA.keyup = {};
	DA.keyup[k] = f;
}
function addLabel(item, label, styles) {
	item.label = label;
	let div = iDiv(item);
	if (isdef(item.live.dLabel)) mRemove(item.live.dLabel);
	let dLabel = item.live.dLabel = mDiv(div, styles, null, label);
	mCenterFlex(div, true, true);
	mStyleX(div, { 'vertical-align': 'top' });
	return dLabel;
}
function addLabel1(item, label, replaceOld = true) {
	let div = iDiv(item);
	mStyleX(div, { 'vertical-align': 'top' });
	if (isdef(item.live.dLabel)) mRemove(item.live.dLabel);
	let dLabel = item.live.dLabel = mDiv(div, { fz: 20 }, null, label);
	return div;
}
function addLabels(items, lang = 'E', luc = 'c') {
	for (const item of items) {
		let label = item.info[lang];
		item.label = luc == 'c' ? toNoun(label) : luc == 'l' ? label : label.toUpperCase();
	}
}
function addlayer() {
	if (tree.length == 0) {
		let a = createVector(width / 2, height);
		let b = createVector(width / 2, height - 100);
		let root = tree[0] = new Branch(a, b);
	} else if (numlayers === 6) {
		for (let i = tree.length - 1; i >= 0; i--) {
			if (!tree[i].finished) addleaf(tree[i]);
		}
		clearInterval(interval_id);
	} else {
		for (let i = tree.length - 1; i >= 0; i--) {
			if (!tree[i].finished) addfork(tree[i]);
		}
		numlayers++;
	}
}
function addleaf(root) {
	let leaf = { current: root.get_healthy_end().copy(), orig: root.get_healthy_end().copy() };
	leaves.push(leaf);
	root.finished = true;
}
function addListItem(idParent, text) {
	const parent = document.getElementById(idParent);
	const el = document.createElement('li');
	el.innerHTML = text;
	parent.appendChild(el);
	parent.scrollTop = el.offsetTop;
}
function addLobbyViewHandlers() {
	document.getElementById('bLogout').addEventListener('click', onClickLogout);
	if (USE_SOCKETIO) document.getElementById('chat_form').addEventListener('submit', onChatSubmitted);
	document.getElementById('bJoinGame').addEventListener('click', onClickJoinGameLobby);
	document.getElementById('bCreateGame').addEventListener('click', onClickCreateGameLobby);
	document.getElementById('bResumeGame').addEventListener('click', onClickResumeGameLobby);
}
function addLoginViewHandlers() { document.getElementById('login_form').addEventListener('submit', onLoginSubmitted); }
function addManual00Node(nParent, R, funcContent) {
	let uidParent = nParent ? nParent.uid : null;
	let nChild = { uidParent: uidParent, idUiParent: uidParent, uid: getUID(), type: 'manual00', content: randomLetter() };
	nChild.content = isdef(funcContent) ? funcContent(nChild) : nChild.uid;
	if (nParent) {
		if (nundef(nParent.children)) nParent.children = [];
		nParent.children.push(nChild.uid);
	} else {
	}
	R.rNodes[nChild.uid] = nChild;
	return nChild;
}
function addManualCircle(g) {
	let circle = new MMS({ parent: g, type: 'ellipse' }).attach();
	let r = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
	r.setAttribute('rx', 35);
	r.setAttribute('ry', 45);
	r.setAttribute('cx', 0);
	r.setAttribute('cy', 0);
	r.setAttribute('fill', 'yellow');
	g.elem.appendChild(r);
	return r;
}
function addMessage(msg) {
	setMessage(msg);
	addListItem('events', msg);
}
function addModuleExports(list) {
	let txt =
		`if (this && typeof module == "object" && module.exports && this === module.exports) {\r\n`
		+ `  module.exports = {\r\n`;
	for (const s of list) {
		txt += `    ${s},\r\n`
	};
	txt += '  }\r\n}';
	return txt;
}
function addMonthToDate(date, months) {
	let d = new Date(date);
	d.setMonth(d.getMonth() + months);
	return d;
}
function addMSContainer(dParent, gid, { w = '100%', h = '100%', margin = 'auto' }) {
	let d1 = addDiv(dParent, { w: w, h: h, margin: margin });
	d1.style.position = 'relative';
	let g1 = addSvgg(d1, gid);
	return { div: d1, g: g1 };
}
function addNewlyCreatedServerObjects(sdata, R) {
	for (const oid in sdata) { R.addObject(oid, sdata[oid]); R.addRForObject(oid); }
	for (const oid in sdata) {
		let o = sdata[oid];
		if (isdef(o.loc)) { continue; }
		let success = einhaengen(oid, o, R);
	}
	sieveLocOids(R);
}
function addNewObjectToSourcesAndPools(o, R) {
	let sp = R.getSpec();
	let missing = [];
	for (const k in sp) {
		let n = sp[k];
		if (nundef(n._source)) {
			n.source = R.defSource;
			pools[k] = n.pool = makePool(n.cond, n.source, R);
			n.pool.map(x => R.addR(x, k));
		} else missing.push(k);
	}
	while (missing.length > 0) {
		let done = null;
		for (const k of missing) {
			let n = sp[k];
			let sourceNode = sp[n._source];
			if (nundef(sourceNode.pool)) continue;
			n.source = sourceNode.pool;
			pools[k] = n.pool = makePool(n.cond, n.source, R);
			n.pool.map(x => R.addR(x, k));
			done = k;
			break;
		}
		removeInPlace(missing, done);
	}
	return [sp, pools];
}
function addNewServerObjectToRsg(oid, o, R, skipEinhaengen = false) {
	R.addObject(oid, o);
	addRForObject(oid, R);
	if (skipEinhaengen) { return; } else { einhaengen(oid, o, R); }
}
function addNodes(board, bid, gName, cities) {
	let wNode = board.hField / 8;
	let hNode = board.hField / 8;
	board.vertices = correctPolys(board.fields.map(fid => EID[fid].poly), wNode, board.hField / 12);
	board.nodes = [];
	board.nodesByRowCol = [];
	for (const fid of board.fields) {
		let f = EID[fid];
		let poly = f.poly;
		for (const pt of poly) {
			let node = byPos1(pt.x, pt.y, x => x.type == 'node');
			if (!node) {
				node = makeElemY('node', bid, gName, cities.level, {
					row: pt.y < f.y ? f.row - 1 : f.row,
					col: pt.x < f.x ? f.col - 1 : f.col,
					w: wNode,
					h: hNode,
					x: pt.x,
					y: pt.y,
					ipal: cities.ipal,
					bg: cities.bg,
					fg: cities.fg,
					shape: cities.shape,
					border: cities.border,
					thickness: cities.thickness
				});
				board.nodes.push(node.id);
				if (!(node.row in board.nodesByRowCol)) board.nodesByRowCol[node.row] = [];
				board.nodesByRowCol[node.row][node.col] = node.id;
				node.edges = [];
				node.fields = [];
				node.nodes = [];
			}
			node.fields.push(fid);
			f.nodes.push(node.id);
		}
	}
}
function addNthInputElement(dParent, n) {
	mLinebreak(dParent, 10);
	let d = mDiv(dParent);
	let dInp = mCreate('input');
	dInp.type = "text"; dInp.autocomplete = "off";
	dInp.style.margin = '10px;'
	dInp.id = 'inputBox' + n;
	dInp.style.fontSize = '20pt';
	mAppend(d, dInp);
	return dInp;
}
function addOidByLocProperty(oid, key, R) {
	let o = R.getO(oid);
	let oidParent = o.loc;
	let parents = R.oid2uids[oidParent];
	if (isEmpty(parents)) { return []; }
	let topUids = [];
	for (const uidParent of parents) {
		if (parentHasThisChildAlready(uidParent, oid) || !parentHasChannelForThisOid(R.rNodes[uidParent], oid)) continue;
		let n1 = instantOidKey(oid, key, uidParent, R);
		topUids.push({ uid: n1.uid, uidParent: uidParent });
	}
	return topUids;
}
function addOidByParentKeyLocation(oid, key, R) {
	let parents = R.Locations[key];
	if (nundef(parents)) {
		if (oid == '146') console.log('not added!!!', oid, key)
		return;
	}
	let topUids = [];
	for (const uidParent of parents) {
		if (parentHasThisChildAlready(uidParent, oid)) continue;
		let n1 = instantOidKey(oid, key, uidParent, R);
		topUids.push({ uid: n1.uid, uidParent: uidParent });
	}
	return topUids;
}
function addOnelineVars(superdi, o) {
	let [code, type] = [o.code, o.type];
	let crn = (code.match(/\r\n/g) || []).length;
	let oneliner = crn == 1;
	//let specialword = 'Counter'; //'PORT';
	let signal = false;
	if (oneliner && type == 'var' && code.includes(',') && !code.includes('[') && !code.includes('{ ')) {
		let othervars = stringAfter(code, 'var').trim().split(',');
		let varkeys = othervars.map(x => firstWord(x, true));
		assertion(varkeys[0] == o.name, `WTF?!?! ${varkeys[0]} ### ${o.name}?!?!?!?!????????????? addOnelinerVars`);
		o.code = stringBefore(code, ',') + ';'
		othervars.shift();
		if (signal) console.log('othervars', othervars, varkeys)
		for (const vcode of othervars) {
			let o1 = jsCopy(o);
			let code1 = vcode.trim();
			if (!code1.endsWith(';')) code1 += ';';
			if (signal) console.log('code1', code1);
			let k1 = o1.name = firstWord(code1, true);
			if (signal) console.log('k1', k1);
			o1.code = 'var ' + code1; // + code1.endsWith(';')?'':';'; //'\r\n':';\r\n';
			o1.sig = `var ${k1};`;
			if (isNumber(k1)) { continue; }
			if (signal) console.log('trage ein', k1, o1)
			lookupSetOverride(superdi, [type, k1], o1);
		}
	}
}
function addonFeatureInit() {
	ADS = null;
	if (USE_ADDONS == true) {
		ADS = jsCopy(lookup(DB, ['addons']));
		let di = {
			aPasscode: APasscode, aAddress: AAddress, aPassword: APassword,
			aExercise: APasscode, aMeditation: APasscode,
		};
		for (const k in ADS) { ADS[k].cl = di[k]; }
	}
}
function addPanel(areaName, oid) {
	let id = getDynId(areaName, oid);
	let color = randomColor();
	let parent = mBy(areaName);
	let ui = mDiv100(parent); ui.id = id; mColor(ui, color);
	let n = { type: 'panel', id: id, color: color, ui: ui };
	AREAS[areaName].panels.push(n);
	addAREA(id, n);
}
function addPara(div, s, margin = '0px', fontSize = '10px', color = 'green') {
	let p = getPara(s);
	div.appendChild(p);
	return p;
}
function addPara_tnt(div, s, margin = '0px', fontSize = '10px', color = 'green') {
	let p = document.createElement('p');
	p.id = uidHelpers();
	div.appendChild(p);
	$(p.id).css('background-color', 'violet');
	p.textContent = s;
	return p;
}
function addPeepToCrowd() {
	const peep = removeRandomFromArray(availablePeeps)
	const walk = getRandomFromArray(walks)({
		peep,
		props: resetPeep({
			peep,
			stage,
		})
	}).eventCallback('onComplete', () => {
		removePeepFromCrowd(peep)
		addPeepToCrowd()
	})
	peep.walk = walk
	crowd.push(peep)
	crowd.sort((a, b) => a.anchorY - b.anchorY)
	return peep
}
function addPic(item, key) {
	let div = item.div;
	let newItem = getPic(key, item.sz, item.bg, item.label);
	clearElement(div);
	mAppend(div, newItem.div.children[0]);
	mAppend(div, newItem.div.children[0]);
	item.pic = newItem.pic;
	item.text = newItem.text;
}
function addPicto(IdBoard, key, sz, x, y) {
	let mobj = makeDrawingElement(getUID(), 'board');
	let ch;
	try {
		ch = iconChars.get(key);
		if (!ch) {
			key = iconChars.getRandomKey();
			console.log(key)
			ch = iconChars.get(key);
		}
	} catch {
		ch = iconChars[key];
	}
	console.log('in addPicto got key', key, ch);
	mobj._pictoFromChar(ch, x, y, sz, sz, randomColor());
	mobj.attach();
}
function addPicto_dep(IdBoard, key, sz, x, y) {
	if (!(key in iconChars)) key = 'crow';
	console.log('found key:', key);
	let mobj = makeDrawingElement(getUID(), 'board');
	mobj._picto(key, x, y, sz, sz, randomColor());
	mobj.attach();
}
function addPictoDiv(key, area, color = 'blue', w = 50, h = 0) {
	let d = pictoDiv(key, color, w, h ? h : w);
	mAppend(area, d);
	return d;
}
function addPictoFromChar(IdBoard, ch, sz, x, y) {
	let mobj = makeDrawingElement(getUID(), 'board');
	mobj._pictoFromChar(ch, x, y, sz, sz, randomColor());
	mobj.attach();
}
function AddPiece(sq, pce) {
	var col = PieceCol[pce];
	HASH_PCE(pce, sq);
	brd_pieces[sq] = pce;
	brd_material[col] += PieceVal[pce];
	brd_pList[PCEINDEX(pce, brd_pceNum[pce])] = sq;
	brd_pceNum[pce]++;
}
function addPlayer(playerId, callback) {
	let username = USERNAME;
	if (nundef(S.plAddedByMe)) S.plAddedByMe = {};
	else {
		let up = S.plAddedByMe;
		let unames = Object.values(up);
		let plids = Object.keys(up);
		let i = plids.length;
		username = i == 0 ? USERNAME : USERNAME + i;
	}
	S.plAddedByMe[playerId] = username;
	pageHeaderAddPlayer(username, playerId, inferPlayerColorFromNameOrInit(playerId, S.gameInfo.player_names.indexOf(playerId)));
	let route = '/add/player/' + username + '/' + playerId; _sendRouteJS(route, callback);
}
function AddQuietMove(move) {
	brd_moveList[brd_moveListStart[brd_ply + 1]] = move;
	if (brd_searchKillers[brd_ply] == move) {
		brd_moveScores[brd_moveListStart[brd_ply + 1]] = 900000;
	} else if (brd_searchKillers[MAXDEPTH + brd_ply] == move) {
		brd_moveScores[brd_moveListStart[brd_ply + 1]] = 800000;
	} else {
		brd_moveScores[brd_moveListStart[brd_ply + 1]] = brd_searchHistory[brd_pieces[FROMSQ(move)] * BRD_SQ_NUM + TOSQ(move)];
	}
	brd_moveListStart[brd_ply + 1]++;
}
function addRandomChildren(n, R) {
	let num = randomNumber(1, 4);
	for (let i = 0; i < num; i++) {
		addManual00Node(n, R);
	}
	return n;
}
function addRandomContentToSidebarOrTable() {
	console.log('clicked!');
	let content = randomContent();
	console.log('content is type', type, '=>', content);
	let d = chooseRandom([mBy('dLeft'), mBy('dRight'), dTable]);
	mAddContentAndMeasureW(dTable, content);
}
function addRelatives(id, oid) {
	if (isdef(oid2ids[oid])) {
		for (const idOther of oid2ids[oid]) {
			if (idOther == id) {
				continue;
			}
			listKey(id2uids, id, idOther);
			listKey(id2uids, idOther, id);
		}
	}
}
function addRepeatInfo(dPic, iRepeat, wpic) {
	let szi = Math.max(Math.floor(wpic / 8), 8);
	dPic.style.position = 'relative';
	let d2 = mText('' + iRepeat, dPic, { fz: szi, weight: 'bold', fg: 'contrast', position: 'absolute', left: szi / 2, top: szi / 2 - 2 });
	return d2;
}
function addResizeInfo(nBoard, nMember, sizeNeeded) {
	let szNeeded = Math.max(sizeNeeded.w, sizeNeeded.h);
	if (nMember.info.size < szNeeded) {
		let memType = nMember.info.memType;
		let newSize = Math.max(sizeNeeded.w, sizeNeeded.h);
		newSize = Math.ceil(newSize / 4);
		newSize *= 4;
		if (newSize % 4 != 0) newSize += 4;
		let key = memType + 's';
		if (memType == 'edge') {
			newSize *= 2;
			memType = 'field';
			key = 'fields';
		}
		if (nundef(nBoard.resizeInfo)) nBoard.resizeInfo = {};
		if (nundef(nBoard.resizeInfo[key]) || nBoard.resizeInfo[key] < newSize) {
			nBoard.resizeInfo[key] = newSize;
			nMember.sizeNeeded = { w: newSize, h: newSize }
			if (key == 'corners') {
				let fSize = isdef(nBoard.resizeInfo.fields);
				if (nundef(fSize)) {
					let f0 = R.uiNodes[nBoard.children[0]];
					fSize = f0.info.size;
				}
				if (fSize < newSize * 3) {
					nBoard.resizeInfo.fields = newSize * 3;
				}
			}
		}
		nBoard.adirty = nMember.adirty = true;
	}
}
function addResultHandler() {
	recognition.onresult = function (event) {
		if (!isGameWithSpeechRecognition()) {
			if (RecogOutput) console.log('*event recog.onresult triggered but not a game with speech recog!!!')
			return;
		}
		hasGotResult = true;
		for (var i = event.resultIndex; i < event.results.length; ++i) {
			if (event.results[i].isFinal) {
				final_transcript += event.results[i][0].transcript;
				final_confidence_sum += event.results[i][0].confidence;
				final_num += 1;
			} else {
				interim_transcript += event.results[i][0].transcript;
				interim_confidence_sum += event.results[i][0].confidence;
				interim_num += 1;
			}
		}
		if (isdef(final_transcript) && !isEmpty(final_transcript)) {
			final_confidence = Goal.confidence = event.results[0][0].confidence;
			final_confidence2 = final_confidence_sum / final_num;
			hasGotFinalResult = true;
			final_confidence = event.results[0][0].confidence;
			recognition.stop();
			setSpeechResult(final_transcript, final_confidence, final_confidence2, true);
			evaluate(final_transcript);
		} else if (isdef(interim_transcript) && !isEmpty(interim_transcript)) {
			interim_confidence = event.results[0][0].confidence;
			interim_confidence2 = interim_confidence_sum / interim_num;
		} else {
			if (RecogOutput) console.log('* got result but final and interim are empty!')
		}
	};
}
function addRForObject(oid, R) {
	let o = R.getO(oid);
	let sp = R.getSpec();
	for (const k in sp) {
		let n = sp[k];
		if (nundef(n.cond)) continue;
		if (n.cond == 'all' || evalConds(o, n.cond)) { R.addR(oid, k); }
	}
	if (isEmpty(R.getR(oid))) {
		for (const k in sp) {
			let n = sp[k];
			if (nundef(n.cond)) continue;
			let keys = Object.keys(n.cond);
			if (!keys.includes('no_spec')) continue;
			let condCopy = jsCopy(n.cond);
			delete condCopy['no_spec'];
			if (evalConds(o, condCopy)) { R.addR(oid, k); }
		}
	}
	createPrototypesForOid(oid, o, R);
}
function addRobber(R) { R.initRound(); reAddServerObject('robber'); }
function addRowColInfo(dPic, row, col, szPic) {
	let szi = Math.max(Math.floor(szPic / 12), 8);
	console.log(szi);
	dPic.style.position = 'relative';
	let d2 = mText('row:' + row, dPic, { fz: szi, color: 'black', position: 'absolute', left: szi, top: szi / 2 })
	let d3 = mText('col:' + col, dPic, { fz: szi, color: 'black', position: 'absolute', left: szi, top: (szi / 2 + szi + 2) })
}
function addRowsCols(items) {
	let byrc = {};
	let byx = sortBy(items, 'x');
	let c = 0, x = byx[0].x;
	for (let i = 0; i < byx.length; i++) {
		let item = byx[i];
		if (!isCloseTo(item.x, x, 2)) { c += 1; x = item.x; }
		item.col = c;
	}
	let byy = sortBy(items, 'y');
	let r = 0, y = byy[0].y;
	for (let i = 0; i < byy.length; i++) {
		let item = byy[i];
		if (!isCloseTo(item.y, y, 2)) { r += 1; y = item.y; }
		item.row = r;
		lookupSet(byrc, [item.row, item.col], item);
	}
	return byrc;
}
function addScoreToUserSession() {
	let sc = { nTotal: Score.nTotal, nCorrect: Score.nCorrect, nCorrect1: Score.nCorrect1 };
	let game = G.id;
	let level = G.level;
	let session = U.session;
	if (nundef(session)) {
		console.log('THERE WAS NO USER SESSION IN _addScoreToUserSession!!!!!!!!!!!!!!!!!!!!!')
		U.session = {};
	}
	let sGame = session[game];
	if (nundef(sGame)) {
		sGame = session[game] = jsCopy(sc);
		sGame.byLevel = {};
		sGame.byLevel[level] = jsCopy(sc);
	} else {
		addByKey(sc, sGame);
		let byLevel = lookupSet(sGame, ['byLevel', level], {});
		addByKey(sc, byLevel);
	}
	sGame.percentage = Math.round(100 * sGame.nCorrect / sGame.nTotal);
	saveUser();
}
function addServerObject(oid, o, R) {
	if (!serverData.table) serverData.table = {};
	serverData.table[oid] = o;
	sData[oid] = jsCopy(o);
	addSO(oid, o, R);
	recAdjustDirtyContainers(R.tree.uid, R, true);
	updateOutput(R);
}
function addSessionToUserGames() {
	if (!isEmpty(U.session)) {
		for (const g in U.session) {
			let recOld = lookup(U, ['games', g]);
			let recNew = U.session[g];
			addByKey(recNew, recOld);
			recOld.percentage = Math.round(100 * recOld.nCorrect / recOld.nTotal);
			if (nundef(recOld.byLevel)) recOld.byLevel = {};
			for (const l in recNew.byLevel) {
				if (nundef(recOld.byLevel[l])) recOld.byLevel[l] = jsCopy(recNew.byLevel[l]);
				else addByKey(recNew.byLevel[l], recOld.byLevel[l]);
			}
		}
	}
	U.session = {};
}
function addSimpleProps(ofrom, oto = {}) { for (const k in ofrom) { if (nundef(oto[k]) && isLiteral(k)) oto[k] = ofrom[k]; } return oto; }
function addSO(oid, o, R) { let sd = {}; sd[oid] = o; addNewlyCreatedServerObjects(sd, R); }
function addSourcesAndPools(R) {
	let sp = jsCopy(R.getSpec());
	let pools = {};
	let missing = [];
	for (const k in sp) {
		let n = sp[k];
		if (nundef(n._source)) {
			n.source = R.defSource;
			pools[k] = n.pool = makePool(n.cond, n.source, R);
			n.pool.map(x => R.addR(x, k));
		} else missing.push(k);
	}
	while (missing.length > 0) {
		let done = null;
		for (const k of missing) {
			let n = sp[k];
			let sourceNode = sp[n._source];
			if (nundef(sourceNode.pool)) continue;
			n.source = sourceNode.pool;
			pools[k] = n.pool = makePool(n.cond, n.source, R);
			n.pool.map(x => R.addR(x, k));
			done = k;
			break;
		}
		removeInPlace(missing, done);
	}
	return [sp, pools];
}
function addSpanColor(dParent, id, bg, fg) {
	let d = document.createElement('span');
	dParent.appendChild(d);
	d.id = id;
	d.style.color = fg;
	d.style.backgroundColor = bg;
	return d;
}
function addStandardInteraction(id) {
	let ms = UIS[id];
	switch (id[2]) {
		case 'a': ms.addClickHandler('elem', onClickSelectTuple); break;
		case 'l': break;
		case 'r': break;
		case 't':
			if (id[0] == 'm') {
				ms.addClickHandler('elem', onClickFilterAndInfobox)
			} else {
				ms.addClickHandler('elem', onClickFilterTuples);
			}
			break;
		default: ms.addClickHandler('elem', onClickFilterTuples); break;
	}
	ms.addMouseEnterHandler('title', highlightMsAndRelatives);
	ms.addMouseLeaveHandler('title', unhighlightMsAndRelatives);
}
function addStartHandler() {
	recognition.onstart = function () {
		if (RecogOutput) console.log('* recog.onstart')
		interim_transcript = '';
		final_transcript = '';
		final_confidence = final_confidence2 = final_confidence_sum = final_num = 0;
		interim_confidence = interim_confidence2 = interim_confidence_sum = interim_num = 0;
		hasGotResult = hasGotFinalResult = false;
		recordCallback = null;
		if (!isGameWithSpeechRecognition()) return;
		isRunning = true;
		MicrophoneStart();
	};
}
function addStateToHistory(prefix = 'auto') {
	if (!isEmpty(prefix)) {
		let pack = packageState();
		HistoryOfStates[prefix] = pack;
		localStorage.setItem('history', JSON.stringify(HistoryOfStates));
		console.log('saved state', prefix, 'freeForm', pack.settings.freeForm, 'board', pack.settings.boardFilename)
	}
}
function addStyledDiv(dParent, id, html, styleString) { return addDivU({ dParent: dParent, id: id, html: html, styleStr: styleString }); }
function addSvgg(dParent, gid, { w = '100%', h = '100%', bg, fg, originInCenter = false } = {}) {
	let svg1 = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	if (!dParent.style.width || !dParent.style.height) {
		let pBounds = getBounds(dParent);
		w = pBounds.width + 'px';
		h = pBounds.height + 'px';
		if (pBounds.width == 0) {
			w = '100%';
			h = '100%';
		}
	}
	if (!dParent.style.position) dParent.style.position = 'relative';
	svg1.setAttribute('width', w);
	svg1.setAttribute('height', h);
	let style = 'margin:0;padding:0;position:absolute;top:0px;left:0px;';
	if (bg) style += 'background-color:' + bg;
	svg1.setAttribute('style', style);
	dParent.appendChild(svg1);
	let g1 = document.createElementNS('http://www.w3.org/2000/svg', 'g');
	if (gid) g1.id = gid;
	svg1.appendChild(g1);
	if (originInCenter) { g1.style.transform = "translate(50%, 50%)"; }
	return g1;
}
function addSvggViewbox(dParent, gid, { w = '100%', h = '100%', bg, fg, originInCenter = false } = {}) {
	let svg1 = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	if (!dParent.style.width || !dParent.style.height) {
		let pBounds = getBounds(dParent);
		w = pBounds.width + 'px';
		h = pBounds.height + 'px';
	}
	if (!dParent.style.position) dParent.style.position = 'relative';
	svg1.setAttribute('width', w);
	svg1.setAttribute('height', h);
	svg1.setAttribute('viewBox', "0 0 433 375");
	let style = 'margin:0;padding:0;position:absolute;top:0px;left:0px;';
	if (bg) style += 'background-color:' + bg;
	svg1.setAttribute('style', style);
	dParent.appendChild(svg1);
	let g1 = document.createElementNS('http://www.w3.org/2000/svg', 'g');
	if (gid) g1.id = gid;
	svg1.appendChild(g1);
	if (originInCenter) { g1.style.transform = "translate(50%, 50%)"; }
	return g1;
}
function addTableTo(table) {
	let div = document.getElementById('slideInAvailableCadres');
	div.appendChild(table);
}
function addTableToArea(o, areaName) {
	let d = UIS[areaName].elem;
	let t = tableElemX(o);
	console.log('d', d)
	console.log('t', t.table)
	d.appendChild(t.table)
	d.appendChild(document.createElement('hr'));
}
function addTask(task) {
	if (!CancelChain) TaskChain.push(task);
}
function addTestInteraction(id) {
	let mobj = UIS[id];
	mobj.addClickHandler('title', onClickGetUIS);
	mobj.addMouseEnterHandler('title', (x, pName) => x.high(pName));
	mobj.addMouseLeaveHandler('title', (x, pName) => x.unhigh(pName));
}
function addTestInteraction1(id) {
	let mobj = UIS[id];
	mobj.addClickHandler('', onClick1);
}
function addTitleLine(dParent, left, center, right) {
	let dt = document.createElement('div');
	dt.style.textAlign = 'center';
	dt.classList.add('ttdiv')
	let pl = getPara(left, 'left');
	let pr = getPara(right, 'right');
	let pCenter = getPara(center);
	dt.appendChild(pl);
	dt.appendChild(pr);
	dt.appendChild(pCenter);
	dParent.appendChild(dt);
	return [dt, dt.offsetWidth, dt.offsetHeight, dParent.offsetWidth, dParent.offsetHeight];
}
function addTitleToGrid(n, d) {
	if (n.content && n.params.padding) {
		let d1 = mText(n.content, d);
		d1.style.display = 'block';
		d1.style.backgroundColor = 'black';
		d1.style.position = 'absolute';
		d1.style.width = '100%';
	}
}
function addToPool(pool, poolArr, perle, index) {
	let p = pool[index] = { key: perle.key, index: index };
	poolArr.push(index);
	return p;
}
function addUserAsFirstAvailablePlayer() {
	let nextPlayer = S.availablePlayers[0];
	addPlayer(nextPlayer, onPlayerAdded);
}
function addVisuals(board, { f2nRatio = 4, opt = 'fitRatio', gap = 4, margin = 20, edgeColor, fieldColor, nodeColor, iPalette = 1, nodeShape = 'circle', factors, w, h } = {}) {
	let area = UIS[board.idParent];
	w = area.w;
	h = area.h;
	let isPalField, isPalCorner, isPalEdge = [false, false, false];
	let pal = S.settings.palette;
	[fieldColor, nodeColor, edgeColor] = [pal[2], pal[3], pal[4]];
	let [fw, fh, nw, nh, ew] = getBoardScaleFactors(board, { factors: factors, opt: opt, f2nRatio: f2nRatio, w: w, h: h, margin: margin });
	for (const id of board.structInfo.fields) {
		let o = getVisual(id);
		makeVisual(o, o.memInfo.x * fw, o.memInfo.y * fh, board.structInfo.wdef * fw - gap, board.structInfo.hdef * fh - gap, fieldColor, o.memInfo.shape);
		o.memInfo.isPal = isPalField;
		o.attach();
	}
	if (isdef(board.structInfo.corners)) {
		for (const id of board.structInfo.corners) {
			let mobj = getVisual(id);
			mobj.memInfo.isPal = isPalCorner;
			makeVisual(mobj, mobj.memInfo.x * fw, mobj.memInfo.y * fh, Math.max(board.structInfo.wdef * nw, ew), Math.max(board.structInfo.hdef * nh, ew), nodeColor, nodeShape);
		}
	}
	if (isdef(board.structInfo.edges)) {
		let nodeSize = getVisual(board.structInfo.corners[0]).w;
		for (const id of board.structInfo.edges) {
			let mobj = getVisual(id);
			mobj.memInfo.isPal = isPalEdge;
			makeVisual(mobj, mobj.memInfo.x * fw, mobj.memInfo.y * fh, mobj.memInfo.thickness * ew, 0, edgeColor, 'line', { x1: mobj.memInfo.x1 * fw, y1: mobj.memInfo.y1 * fh, x2: mobj.memInfo.x2 * fw, y2: mobj.memInfo.y2 * fh });
			mobj.length = mobj.h = mobj.distance - nodeSize;
			mobj.attach();
		}
	}
	if (isdef(board.structInfo.corners)) {
		for (const id of board.structInfo.corners) getVisual(id).attach();
	}
}
async function addVocabTo2020Syms() {
	let syms20 = await route_path_yaml_dict('../assets/syms2020.yaml');
	let etext = await route_path_text('../assets/speech/w2020/w20_E.txt');
	let ew = etext.split('\n');
	let dtext = await route_path_text('../assets/speech/w2020/w20_D.txt');
	let ftext = await route_path_text('../assets/speech/w2020/w20_F.txt');
	let stext = await route_path_text('../assets/speech/w2020/w20_S.txt');
	let ctext = await route_path_text('../assets/speech/w2020/w20_C.txt');
	let dw = dtext.split('\n');
	let fw = ftext.split('\n');
	let sw = stext.split('\n');
	let cw = ctext.split('\n');
	let edict = {};
	for (let i = 0; i < ew.length; i++) {
		let ek = ew[i].toLowerCase().trim();
		if (isEmpty(ek)) continue;
		edict[ek] = { E: ek, D: dw[i].toLowerCase().trim(), F: fw[i].toLowerCase().trim(), S: sw[i].toLowerCase().trim(), C: cw[i].trim() };
	}
	console.log(edict);
	let edlist = dict2list(edict, 'key');
	for (const k in syms20) {
		console.log('k=' + k, edict[k]);
		let e = firstCond(edlist, x => k.includes(x.key.toLowerCase()) || k.includes('pinch') && x.key.toLowerCase().includes('pinch'));
		console.log('entry for', k, 'is', e);
		if (isdef(e)) {
			let info = syms20[k];
			info.E = e.E;
			info.D = e.D;
			info.F = e.F;
			info.S = e.S;
			info.C = e.C;
		}
	}
	downloadAsYaml(syms20, 'syms20');
}
function addWeekToDate(date, weeks) {
	let d = new Date(date);
	d.setDate(d.getDate() + (weeks * 7));
	return d;
}
function AddWhitePawnCaptureMove(from, to, cap) {
	if (RanksBrd[from] == RANKS.RANK_7) {
		AddCaptureMove(MOVE(from, to, cap, PIECES.wQ, 0));
		AddCaptureMove(MOVE(from, to, cap, PIECES.wR, 0));
		AddCaptureMove(MOVE(from, to, cap, PIECES.wB, 0));
		AddCaptureMove(MOVE(from, to, cap, PIECES.wN, 0));
	} else {
		AddCaptureMove(MOVE(from, to, cap, PIECES.EMPTY, 0));
	}
}
function AddWhitePawnQuietMove(from, to) {
	if (RanksBrd[from] == RANKS.RANK_7) {
		AddQuietMove(MOVE(from, to, PIECES.EMPTY, PIECES.wQ, 0));
		AddQuietMove(MOVE(from, to, PIECES.EMPTY, PIECES.wR, 0));
		AddQuietMove(MOVE(from, to, PIECES.EMPTY, PIECES.wB, 0));
		AddQuietMove(MOVE(from, to, PIECES.EMPTY, PIECES.wN, 0));
	} else {
		AddQuietMove(MOVE(from, to, PIECES.EMPTY, PIECES.EMPTY, 0));
	}
}
function adjacency_init(items) {
	let last = arrLast(items);
	let [rows, cols] = [last.iy + 1, last.ix + 1];
	console.log('there are', rows, 'rows', cols, 'cols')
}
function adjustContainerLayout(n, R) {
	console.log('...........adjustContainer____________', n.uid);
	n.adirty = false;
	if (n.type == 'grid') {
		resizeBoard(n, R);
		return;
	}
	if (n.type == 'hand') { layoutHand(n); return; }
	if (n.uid && isBoardMember(n.uid, R)) {
		adjustLayoutForBoardMember(n, R);
	}
	let params = n.params;
	let num = n.children.length;
	let or = params.orientation ? params.orientation : DEF_ORIENTATION;
	mFlex(n.ui, or);
	let split = params.split ? params.split : DEF_SPLIT;
	if (split == 'min') return;
	let reverseSplit = false;
	if (split == 'equal') split = (1 / num);
	else if (isNumber(split)) reverseSplit = true;
	for (let i = 0; i < num; i++) {
		let d = R.uiNodes[n.children[i]].ui;
		mFlexChildSplit(d, split);
		if (reverseSplit) { split = 1 - split; }
	}
}
function adjustLayoutForBoardMember(n, R) {
	console.log('adjust layout for', n.uid);
	let ch = n.children[0];
	let n1 = R.uiNodes[ch];
	console.log('id_divParent', n1.idUiParent, 'id_directParent', n1.uidParent)
	let divParent = mBy(n1.idUiParent);
	let directParent = mBy(n1.uidParent);
	let ui = n1.ui;
	let nuiBoard = R.uiNodes[n.uidParent];
	console.log(nuiBoard)
	let bmk = getBounds(directParent, false, divParent);
	let arr;
	let [wTotal, hTotal, wBoard, hBoard, fw, fh, fSpacing, fSize, gap] =
		[nuiBoard.wTotal, nuiBoard.hTotal, nuiBoard.wBoard, nuiBoard.hBoard, nuiBoard.fw, nuiBoard.fh, nuiBoard.fSpacing, nuiBoard.fSize, nuiBoard.gap];
	console.log('wTotal', wTotal, 'hTotal', hTotal, 'wBoard', wBoard,
		'hBoard', hBoard, 'fw', fw, 'fh', fh, 'fSpacing', fSpacing, 'fSize', fSize, 'gap', gap)
	let bdiv = getBounds(divParent);
	divParent.style.backgroundColor = 'yellow';
	ui.style.position = 'absolute';
	ui.style.display = 'inline-block';
	let bel = getBounds(ui);
	let x = 0;
	let y = 0;
	ui.style.left = x + 'px';
	ui.style.top = y + 'px';
	ui.style.margin = '0px';
	console.log('x', x, '\nbdiv left', bdiv.left, 'w', bdiv.width, '\nbmk left', bmk.left, 'w', bmk.width, '\nbel left', bel.left, 'w', bel.width);
	n.sizeNeeded = { w: Math.max(bmk.width, bel.width), h: Math.max(bmk.height, bel.height) };
	if (bmk.width < bel.width || bmk.height < bel.height) {
		let nBoard = R.uiNodes[n.uidParent];
		nBoard.adirty = true;
		let memType = n.info.memType;
		let curSize = n.typParams.size;
		let newSize = Math.max(bel.width, bel.height);
		newSize = Math.ceil(newSize / 4);
		newSize *= 4;
		if (newSize % 4 != 0) newSize += 4;
		if (nundef(nBoard.resizeInfo)) nBoard.resizeInfo = {};
		nBoard.resizeInfo[memType + 's'] = newSize;
	}
	n.uiType = 'childOfBoardElement';
	n.potentialOverlap = true;
}
function adjustPlayerAreaWise() {
	let areaName = S.settings.present.player.defaultArea;
	let msArea = UIS[areaName];
	let wArea = msArea.w;
	let minWidth = S.vars.wDefaultPlayer + 10;
	if (wArea < minWidth) {
		let diff = S.vars.wDefaultPlayer + 10 - wArea;
		setCSSVariable('--wPlayers', minWidth)
	}
}
function adjustTableSize(R) {
	let d = mBy('table');
	let root = R.root;
	let b = getBounds(root.ui, true)
	if (!isdef(root.size)) {
		setSP(root);
	} else {
	}
	d.style.minWidth = root.size.w + 'px';
	d.style.minHeight = (root.size.h + 4) + 'px';
}
function ADMinusKeys(ad1, ad2) {
	let arr1 = ad1;
	let arr2 = ad2;
	if (!Array.isArray(ad1)) {
		console.log('ad1 not an array:', typeof ad1, ad1);
		arr1 = getKeys(ad1);
	}
	if (!Array.isArray(ad2)) {
		console.log('ad2 not an array:', typeof ad2, ad2);
		arr1 = getKeys(ad2);
	}
	return arrMinus(arr1, arr2);
}
function aFlip(d, ms = 300) {
	return anime({ targets: d, scaleX: -1, duration: ms, easing: 'easeInOutSine' });
}
function agCircle(g, sz) { let r = gEllipse(sz, sz); g.appendChild(r); return r; }
function agColoredShape(g, shape, w, h, color) {
	SHAPEFUNCS[shape](g, w, h);
	gBg(g, color);
}
function agEllipse(g, w, h) { let r = gEllipse(w, h); g.appendChild(r); return r; }
function agG(g) { let g1 = gG(); g.appendChild(g1); return g1; }
function aggregate_elements(list_of_object, propname) {
	let result = [];
	for (let i = 0; i < list_of_object.length; i++) {
		let obj = list_of_object[i];
		let arr = obj[propname];
		for (let j = 0; j < arr.length; j++) {
			result.push(arr[j]);
		}
	}
	return result;
}
function aggregate_player(fen, prop) {
	let res = [];
	for (const uplayer in fen.players) {
		let list = fen.players[uplayer][prop];
		res = res.concat(list);
	}
	return res;
}
function aggregate_player_hands_by_rank(fen) {
	let di_ranks = {};
	let akku = [];
	for (const uname in fen.players) {
		let pl = fen.players[uname];
		let hand = pl.hand;
		for (const c of hand) {
			akku.push(c);
			let r = c[0];
			if (isdef(di_ranks[r])) di_ranks[r] += 1; else di_ranks[r] = 1;
		}
	}
	fen.akku = akku;
	return di_ranks;
}
function agHex(g, w, h) { let pts = size2hex(w, h); return agPoly(g, pts); }
function agLine(g, x1, y1, x2, y2) { let r = gLine(x1, y1, x2, y2); g.appendChild(r); return r; }
function agmove_clear_all() { Z.stage = 'clear'; Z.fen.endcond = 'all'; Z.fen.acting_host = Z.uplayer; Z.turn = [Z.uplayer]; take_turn_clear(); }
function agmove_clear_first() { Z.stage = 'clear'; Z.fen.endcond = 'first'; Z.fen.acting_host = Z.uplayer; Z.turn = [Z.uplayer]; take_turn_clear(); }
function agmove_clear_turn() { Z.stage = 'clear'; Z.fen.endcond = 'turn'; Z.fen.acting_host = Z.uplayer; Z.turn = [Z.uplayer]; take_turn_clear(); }
function agmove_indiv(plname, slot) {
	if (isDict(plname) && Z.uplayer != 'mimi') return;
	if (isString(plname)) Z.uplayer = plname;
	console.log('sender:', Z.uplayer);
	let pl = Z.fen.players[Z.uplayer];
	Z.state = { val: pl.hand[0] };
	if (nundef(slot)) slot = busy_wait_until_slot(pl.slot);
	console.log('time sending:', slot, Date.now());
	take_turn_collect_open();
	if (plname != 'felix') agmove_indiv('felix', pl.slot);
}
function agmove_resolve() {
	console.log('---------------------- RESOLVE ----------------------');
	assertion(isdef(Z.playerdata), 'no playerdata');
	assertion(Z.uplayer == Z.fen.acting_host, 'wrong player resolves!!!!', Z.uplayer);
	let [fen, uplayer, pl, pldata] = [Z.fen, Z.uplayer, Z.pl, Z.playerdata];
	fen.collection = [];
	for (const data of pldata) {
		fen.collection.push({ name: data.name, state: data.state });
	}
	console.log('players selected the following cards:', fen.collection);
	[Z.stage, Z.turn] = [Z.fen.stage_after_multi, Z.fen.turn_after_multi];
	take_turn_resolve('single');
}
function agmove_single() {
	if (Z.pl.hand.length > 2) removeInPlace(Z.pl.hand, Z.pl.hand[0]);
	Z.turn = [get_next_player(Z, Z.uplayer)];
	take_turn_fen();
}
function agmove_startmulti() { Z.stage = 'multi'; Z.turn = Z.plorder;[Z.fen.stage_after_multi, Z.fen.turn_after_multi] = ['click', [rChoose(Z.plorder)]]; take_turn_fen(); }
function agPoly(g, pts) { let r = gPoly(pts); g.appendChild(r); return r; }
function agRect(g, w, h) { let r = gRect(w, h); g.appendChild(r); return r; }
function agShape(g, shape, w, h, color, rounding) {
	let sh = gShape(shape, w, h, color, rounding);
	g.appendChild(sh);
	return sh;
}
function agText(g, txt, fg, bg, font) {
	let res = new gText(g);
	res.text({ txt: txt, fill: fg, bgText: bg, font: font });
	return res;
}
function AI(playerToControl) {
	var ctl = playerToControl;
	var State = {
		WAITING: 0,
		FOLLOWING: 1,
		AIMING: 2
	}
	var currentState = State.FOLLOWING;
	function repeat(cb, cbFinal, interval, count) {
		var timeout = function () {
			repeat(cb, cbFinal, interval, count - 1);
		}
		if (count <= 0) {
			cbFinal();
		} else {
			cb();
			setTimeout(function () {
				repeat(cb, cbFinal, interval, count - 1);
			}, interval);
		}
	}
	function aimAndFire() {
		var numRepeats = Math.floor(5 + Math.random() * 5);
		function randomMove() {
			if (Math.random() > .5) {
				ctl.move(-distance);
			} else {
				ctl.move(distance);
			}
		}
		function randomAimAndFire() {
			var d = Math.floor(Math.random() * 3 - 1);
			opponent.setAim(d);
			opponent.fire();
			currentState = State.FOLLOWING;
		}
		repeat(randomMove, randomAimAndFire, 250, numRepeats);
	}
	function moveTowardsBall() {
		if (ball.getPosition()[1] >= ctl.getPosition()[1] + ctl.getSize() / 2) {
			ctl.move(distance);
		} else {
			ctl.move(-distance);
		}
		setTimeout(function () {
			currentState = State.FOLLOWING;
		}, 400);
	}
	function update() {
		switch (currentState) {
			case State.FOLLOWING:
				if (ball.getOwner() === ctl) {
					currentState = State.AIMING;
					aimAndFire();
				} else {
					moveTowardsBall();
					currentState = State.WAITING;
				}
			case State.WAITING:
				break;
			case State.AIMING:
				break;
		}
	}
	return {
		update: update
	}
}
function ai_move(ms = 100) {
	DA.ai_is_moving = true;
	let [A, fen] = [valf(Z.A, {}), Z.fen];
	let selitems;
	if (Z.game == 'ferro') {
		if (Z.stage == 'card_selection') {
			let uplayer = Z.uplayer;
			let i1 = firstCond(A.items, x => x.path.includes(`${uplayer}.hand`));
			let i2 = firstCond(A.items, x => x.key == 'discard');
			selitems = [i1, i2];
		} else if (Z.stage == 'buy_or_pass') {
			selitems = [A.items[1]];
		} else selitems = [A.items[0]];
	} else if (Z.game == 'bluff') {
		let [newbid, handler] = bluff_ai();
		if (newbid) { fen.newbid = newbid; UI.dAnzeige.innerHTML = bid_to_string(newbid); }
		else if (handler != handle_gehtHoch) { bluff_generate_random_bid(); }
		A.callback = handler;
		selitems = [];
	} else if (A.command == 'trade') {
		selitems = ai_pick_legal_trade();
	} else if (A.command == 'exchange') {
		selitems = ai_pick_legal_exchange();
	} else if (A.command == 'upgrade') {
		selitems = [rChoose(A.items)];
	} else if (A.command == 'rumor') {
		selitems = [];
		let buildings = A.items.filter(x => x.path.includes('building'));
		let rumors = A.items.filter(x => !x.path.includes('building'));
		selitems = [rChoose(buildings), rChoose(rumors)];
	} else if (ARI.stage[Z.stage] == 'rumors_weitergeben') {
		let players = A.items.filter(x => Z.plorder.includes(x.key))
		let rumors = A.items.filter(x => !Z.plorder.includes(x.key))
		selitems = [rChoose(players), rChoose(rumors)];
	} else if (ARI.stage[Z.stage] == 'journey') {
		selitems = [];
	} else {
		let items = A.items;
		let nmin = A.minselected;
		let nmax = Math.min(A.maxselected, items.length);
		let nselect = rNumber(nmin, nmax);
		selitems = rChoose(items, nselect); if (!isList(selitems)) selitems = [selitems];
	}
	for (const item of selitems) {
		select_last(item, select_toggle);
		if (isdef(item.submit_on_click)) A.selected.pop();
	}
	clearTimeout(TO.ai);
	loader_on();
	TO.ai = setTimeout(() => { if (isdef(A.callback)) A.callback(); loader_off(); }, ms);
}
function ai_pick_legal_exchange() {
	let [A, fen, uplayer, items] = [Z.A, Z.fen, Z.uplayer, Z.A.items];
	let firstPick = rChoose(items, 1, x => x.path.includes('building'));
	let secondPick = rChoose(items, 1, x => !x.path.includes('building'));
	return [firstPick, secondPick];
}
function ai_pick_legal_trade() {
	let [A, fen, uplayer, items] = [Z.A, Z.fen, Z.uplayer, Z.A.items];
	let stall = fen.players[uplayer].stall;
	let firstPick = rChoose(items, 1, x => x.path.includes(uplayer));
	let secondPick = rChoose(items, 1, x => !x.path.includes(uplayer));
	return [firstPick, secondPick];
}
function ai_schummler() { }
function AIMinimax(g, callback) {
	let state = g.getState();
	state = boardToNode(state);
	F_END = g.evalState;
	F_HEURISTIC = g.heuristic;
	F_MOVES = g.getAvailableMoves;
	F_APPLYMOVE = g.applyMove;
	F_UNDOMOVE = g.undoMove;
	MAXIMIZER = g.plTurn;
	MINIMIZER = g.plOpp;
	SelectedMove = null;
	let algorithm = g.copyState == true ? minimaxCopy : myMinimax;
	let val = algorithm(state, 0, -Infinity, Infinity, g.searchDepth, true);
	CCC = 0;
	callback(SelectedMove);
}
async function ajaxPostCors(url, data, type, handle_result) {
	data.data_type = type;
	var formData = new FormData();
	for (const k in data) {
		formData.append(k, data[k]);
	}
	let h = new Headers();
	h.append('Accept', 'application/text');
	var resp = await fetch(url, {
		method: 'POST',
		mode: 'cors',
		headers: h,
		body: formData,
	});
	let result = await resp.text();
	try {
		let jsonResult = JSON.parse(result);
		if (isdef(handle_result)) handle_result(jsonResult);
	} catch {
		if (isdef(handle_result)) handle_result({ message: result });
	}
}
function ajaxSimple(method, url, callback) {
	var ajax = new XMLHttpRequest();
	ajax.onload = () => {
		if (ajax.status == 200 || ajax.readyState == 4) {
			if (isdef(callback)) callback(ajax);
		}
	}
	ajax.open(method, url, true);
	ajax.send();
}
function aJumpby(elem, h = 40, ms = 1000) {
	anime({
		targets: elem,
		keyframes: [
			{ translateY: 2, scaleX: 1.05, scaleY: .95 },
			{ translateY: 2, scaleX: 1.05, scaleY: .95 },
			{ translateY: -h, scaleX: .9, scaleY: 1.1 },
			{ translateY: -h, scaleX: .9, scaleY: 1.1 },
			{ translateY: 0, scaleX: 1, scaleY: 1 },
			{ translateY: -7, scaleX: 1, scaleY: 1 },
			{ translateY: 0, scaleX: 1, scaleY: 1 },
			{ translateY: 0, scaleX: 1, scaleY: 1 },
			{ translateY: 0, scaleX: 1, scaleY: 1 },
			{ translateY: 0, scaleX: 1, scaleY: 1 },
		],
		duration: 1000,
		easing: 'easeInOutSine', //'easeOutElastic(1, .8)',
	});
}
function all2DigitFractions() {
	let fr = {
		1: [2, 3, 4, 5, 6, 7, 8, 9],
		2: [3, 5, 7, 9],
		3: [2, 4, 5, 7, 8],
		4: [3, 5, 7, 9],
		5: [2, 3, 4, 6, 7, 8, 9],
		6: [5, 7],
		7: [2, 3, 4, 5, 6, 8, 9],
		8: [3, 5, 7, 9],
		9: [2, 4, 5, 7, 8],
	};
	return fr;
}
function all2DigitFractionsExpanded() {
	let f = all2DigitFractions();
	let res = [];
	for (const i in f) {
		for (const j of f[i]) {
			res.push({ numer: i, denom: j });
		}
	}
	return res;
}
function all2DigitFractionsUnder1() {
	let fr = {
		1: [2, 3, 4, 5, 6, 7, 8, 9],
		2: [3, 5, 7, 9],
		3: [4, 5, 7, 8],
		4: [5, 7, 9],
		5: [6, 7, 8, 9],
		6: [7],
		7: [8, 9],
		8: [9],
	};
	return fr;
}
function all2DigitFractionsUnder1Expanded() {
	let f = all2DigitFractionsUnder1();
	let res = [];
	for (const i in f) {
		for (const j of f[i]) {
			res.push({ numer: i, denom: j });
		}
	}
	return res;
}
function allCond(arr, cond) { return forAll(arr, cond); }
function allCondDict(d, func) {
	let res = [];
	for (const k in d) { if (func(d[k])) res.push(k); }
	return res;
}
function allCondDictKV(d, func) {
	let res = [];
	for (const k in d) { if (func(k, d[k])) res.push(k); }
	return res;
}
function allCondX(ad, func) {
	let res = [];
	if (nundef(ad)) return res;
	else if (isDict(ad)) {
		for (const k in ad) {
			let v = ad[k];
			if (func(v)) { if (nundef(v.key)) v.key = k; res.push(v); }
		}
	} else {
		for (const a of ad) { if (func(a)) res.push(a) }
	}
	return res;
}
function allElementsFromPoint(x, y) {
	var element, elements = [];
	var old_visibility = [];
	while (true) {
		element = document.elementFromPoint(x, y);
		if (!element || element === document.documentElement) {
			break;
		}
		elements.push(element);
		old_visibility.push(element.style.visibility);
		element.style.visibility = 'hidden';
	}
	for (var k = 0; k < elements.length; k++) {
		elements[k].style.visibility = old_visibility[k];
	}
	elements.reverse();
	return elements;
}
function allIntegers(s) {
	return s.match(/\d+\.\d+|\d+\b|\d+(?=\w)/g).map(v => {
		return +v;
	});
}
function allLettersContained(sFull, sPart) {
	for (const ch of sPart) {
		if (!(sFull.includes(ch))) return false;
	}
	return true;
}
function allNumbers(s) {
	let m = s.match(/\-.\d+|\-\d+|\.\d+|\d+\.\d+|\d+\b|\d+(?=\w)/g);
	if (m) return m.map(v => +v); else return null;
}
function allNumbers_dep(s) {
	return s.match(/\d+\.\d+|\d+\b|\d+(?=\w)/g).map(v => {
		return +v;
	});
}
function allow_polling() { IS_POLLING_ALLOWED = true; if (isdef(DA.poll)) poll(); }
function allowDrop(ev) { ev.preventDefault(); }
function allowDropKey(ev) {
	ev.stopPropagation();
	let dragged = ev.toElement;
	let target = ev.target;
	if (nundef(key) || key == ev.target.dd) {
		ev.preventDefault();
		console.log(ev, '\nkey:', key, dragged.id, dragged.dd, target.dd)
	}
}
function allWordsAndKeysLowerCase() {
	let newSyms = {};
	for (const k in Syms) {
		let info = Syms[k];
		let inew = jsCopy(info);
		for (const x of ['E', 'D', 'F', 'S']) {
			if (isdef(info[x])) {
				console.log(info[x])
				inew[x] = info[x].toLowerCase();
			}
		}
		newSyms[k.toLowerCase()] = inew;
	}
	downloadAsYaml(newSyms, 'syms1');
}
function allWordsContainedInKeys(dict, keywords) {
	let res = [];
	for (const k in dict) {
		let isMatch = true;
		for (const w of keywords) {
			if (!k.includes(w)) { isMatch = false; break; }
		}
		if (isMatch) res.push(dict[k]);
	}
	return res;
}
function allWordsContainedInKeysAsWord(dict, keywords) {
	let res = [];
	for (const k in dict) {
		let isMatch = true;
		let wordsInKey = splitAtWhiteSpace(k);
		for (const w of keywords) {
			if (!wordsInKey.includes(w)) { isMatch = false; break; }
		}
		if (isMatch) res.push(dict[k]);
	}
	return res;
}
function allWordsContainedInProps(dict, keywords, props) {
	let res = [];
	for (const k in dict) {
		let isMatch = true;
		let propString = '';
		for (const p of props) {
			propString += dict[k][p] + ' ';
		}
		for (const w of keywords) {
			if (!propString.includes(w)) { isMatch = false; break; }
		}
		if (isMatch) {
			res.push(dict[k]);
		}
	}
	return res;
}
function allWordsContainedInPropsAsWord(dict, keywords, props) {
	let res = [];
	for (const k in dict) {
		let isMatch = true;
		let keywordList = [];
		for (const p of props) {
			if (nundef(dict[k][p])) continue;
			let wordsInKey = splitAtWhiteSpace(dict[k][p]);
			keywordList = keywordList.concat(wordsInKey);
		}
		for (const w of keywords) {
			if (!keywordList.includes(w)) { isMatch = false; break; }
		}
		if (isMatch) res.push(dict[k]);
	}
	return res;
}
function AlphaBeta(alpha, beta, depth, DoNull) {
	if (depth <= 0) {
		return Quiescence(alpha, beta);
	}
	if ((srch_nodes & 2047) == 0) CheckUp();
	srch_nodes++;
	if ((IsRepetition() || brd_fiftyMove >= 100) && brd_ply != 0) {
		return 0;
	}
	if (brd_ply > MAXDEPTH - 1) {
		return EvalPosition(pos);
	}
	var InCheck = SqAttacked(brd_pList[PCEINDEX(Kings[brd_side], 0)], brd_side ^ 1);
	if (InCheck == BOOL.TRUE) {
		depth++;
	}
	var Score = -INFINITE;
	if (DoNull == BOOL.TRUE && BOOL.FALSE == InCheck &&
		brd_ply != 0 && (brd_material[brd_side] > 50200) && depth >= 4) {
		var ePStore = brd_enPas;
		if (brd_enPas != SQUARES.NO_SQ) HASH_EP();
		brd_side ^= 1;
		HASH_SIDE();
		brd_enPas = SQUARES.NO_SQ;
		Score = -AlphaBeta(-beta, -beta + 1, depth - 4, BOOL.FALSE);
		brd_side ^= 1;
		HASH_SIDE();
		brd_enPas = ePStore;
		if (brd_enPas != SQUARES.NO_SQ) HASH_EP();
		if (srch_stop == BOOL.TRUE) return 0;
		if (Score >= beta) {
			return beta;
		}
	}
	GenerateMoves();
	var MoveNum = 0;
	var Legal = 0;
	var OldAlpha = alpha;
	var BestMove = NOMOVE;
	Score = -INFINITE;
	var PvMove = ProbePvTable();
	if (PvMove != NOMOVE) {
		for (MoveNum = brd_moveListStart[brd_ply]; MoveNum < brd_moveListStart[brd_ply + 1]; ++MoveNum) {
			if (brd_moveList[MoveNum] == PvMove) {
				brd_moveScores[MoveNum].score = 2000000;
				break;
			}
		}
	}
	for (MoveNum = brd_moveListStart[brd_ply]; MoveNum < brd_moveListStart[brd_ply + 1]; ++MoveNum) {
		PickNextMove(MoveNum);
		if (MakeMove(brd_moveList[MoveNum]) == BOOL.FALSE) {
			continue;
		}
		Legal++;
		Score = -AlphaBeta(-beta, -alpha, depth - 1, BOOL.TRUE);
		TakeMove();
		if (srch_stop == BOOL.TRUE) return 0;
		if (Score > alpha) {
			if (Score >= beta) {
				if (Legal == 1) {
					srch_fhf++;
				}
				srch_fh++;
				if ((brd_moveList[MoveNum] & MFLAGCAP) == 0) {
					brd_searchKillers[MAXDEPTH + brd_ply] = brd_searchKillers[brd_ply];
					brd_searchKillers[brd_ply] = brd_moveList[MoveNum];
				}
				return beta;
			}
			alpha = Score;
			BestMove = brd_moveList[MoveNum];
			if ((BestMove & MFLAGCAP) == 0) {
				brd_searchHistory[brd_pieces[FROMSQ(BestMove)] * BRD_SQ_NUM + TOSQ(BestMove)] += depth;
			}
		}
	}
	if (Legal == 0) {
		if (InCheck) {
			return -MATE + brd_ply;
		} else {
			return 0;
		}
	}
	if (alpha != OldAlpha) {
		StorePvMove(BestMove);
	}
	return alpha;
}
function alphaToHex(zero1) {
	zero1 = Math.round(zero1 * 100) / 100;
	var alpha = Math.round(zero1 * 255);
	var hex = (alpha + 0x10000)
		.toString(16)
		.slice(-2)
		.toUpperCase();
	var perc = Math.round(zero1 * 100);
	return hex;
}
function aMove(d, dSource, dTarget, callback, offset, ms, easing, fade) {
	let b1 = getRect(dSource);
	let b2 = getRect(dTarget);
	if (nundef(offset)) offset = { x: 0, y: 0 };
	let dist = { x: b2.x - b1.x + offset.x, y: b2.y - b1.y + offset.y };
	d.style.zIndex = 100;
	let a = d.animate({ opacity: valf(fade, 1), transform: `translate(${dist.x}px,${dist.y}px)` }, { easing: valf(easing, 'EASE'), duration: ms });
	a.onfinish = () => { d.style.zIndex = iZMax(); if (isdef(callback)) callback(); };
}
function aMoveTo(d, dTarget, x, y, ms) {
	let bi = iTableBounds(d);
	let b1 = iTableBounds(d.parentNode);
	let b2 = iTableBounds(dTarget);
	d.animate([
		{ position: 'absolute', left: `${bi.x}px`, top: `${bi.y}px` },
		{ position: 'absolute', left: `${x + b2.x}px`, top: `${y + b2.y}px` },
	], {
		duration: ms,
		fill: 'forwards'
	});
}
function analyse_tables(user_tables) {
	user_tables.map(x => console.log('table:', x));
	let bygame = {}, bytid = {};
	for (const t of user_tables) {
		lookupAddToList(bygame, [t.game], t);
		lookupSet(bytid, [t.id], t);
	}
	if (!isEmpty(user_tables)) {
		Session.cur_table = user_tables[0];
		Session.cur_tid = Session.cur_table.id;
	} else {
		Session.cur_table = null;
		Session.cur_tid = undefined;
	}
	lookupSetOverride(DA, [Session.cur_user, 'tables_by_game'], bygame);
	lookupSetOverride(DA, [Session.cur_user, 'tables_by_tid'], bytid);
	return bygame;
}
function ani_say(d, fSpeak) {
	if (isdef(fSpeak)) fSpeak();
	mClass(d, 'onPulse');
	setTimeout(() => mRemoveClass(d, 'onPulse'), 500);
}
function aniFadeIn(elem, secs) {
	elem.style.opacity = 0;
	setTimeout(() => { mRemoveClass(elem, 'transopaOff'); mClass(elem, 'transopaOn'); }, secs * 1000);
}
function aniFadeInOut(elem, secs) {
	mClass(elem, 'transopaOn');
	setTimeout(() => { mRemoveClass(elem, 'transopaOn'); mClass(elem, 'transopaOff'); }, secs * 1000);
}
function aniFadeInOut_new(elem, msDuration) {
	elem.animate()
	mClass(elem, 'transopaOn');
	return setTimeout(() => { mRemoveClass(elem, 'transopaOn'); mClass(elem, 'transopaOff'); }, secs * 1000);
}
function aniGameOver(msg, silent = false) {
	if (!silent && !G.silentMode) { writeSound(); playSound('goodBye'); }
	interrupt();
	show('freezer2');
	let dComment = mBy('dCommentFreezer2');
	let dMessage = mBy('dMessageFreezer2');
	let d = mBy('dContentFreezer2');
	clearElement(d);
	mStyleX(d, { fz: 20, matop: 40, bg: 'silver', fg: 'indigo', rounding: 20, padding: 25 })
	let style = { matop: 4 };
	dComment.innerHTML = 'Great Job!';
	dMessage.innerHTML = isdef(msg) ? msg : 'Time for a Break...';
	d.style.textAlign = 'center';
	mText('Unit Score:', d, { fz: 22 });
	for (const gname in U.session) {
		let sc = U.session[gname];
		if (sc.nTotal == 0) continue;
		if (DB.games[gname].controllerType == 'solitaire') mText(`${DB.games[gname].friendly}: ${sc.nCorrect}/${sc.nTotal} correct answers (${sc.percentage}%) `, d, style);
		else if (DB.games[gname].controllerType == 'solo') {
			mText(`${DB.games[gname].friendly}: Won:${sc.nWins}, Lost:${sc.nLoses}, Tied:${sc.nTied} `, d, style);
		}
	}
	mClass(mBy('freezer2'), 'aniSlowlyAppear');
}
function aniInstruction(spoken) {
	if (isdef(spoken)) sayRandomVoice(spoken);
	mClass(dInstruction, 'onPulse');
	setTimeout(() => mRemoveClass(dInstruction, 'onPulse'), 500);
}
function anim_face_down(item, ms = 300, callback = null) { face_up(item); anim_toggle_face(item, callback); }
function anim_face_up(item, ms = 300, callback = null) { face_down(item); anim_toggle_face(item, callback); }
function anim_from_deck_to_hand(el, deck, hand) {
	let topmost = deck.items.shift();
	console.assert(el == topmost, 'top deck elem is NOT correct!!!!')
	face_up(topmost);
	let dfrom = iDiv(topmost);
	deck.list = deck.items.map(x => x.key);
	deck.topmost = deck.items[0];
	let dto = iDiv(arrLast(hand.items));
	let rfrom = getRect(dfrom, mBy('inner_left_panel'));
	let rto = getRect(dto, mBy('inner_left_panel'));
	dfrom.style.xIndex = 100;
	let [offx, offy] = [OVW, 0]
	let a = aTranslateByEase(dfrom, offx + rto.l - rfrom.l, offy + rto.t - rfrom.t, 500, 'ease');
	a.onfinish = () => {
		dfrom.remove();
		dfrom.style.position = 'static';
		hand.items.push(topmost);
		hand.list = hand.items.map(x => x.key);
		mAppend(hand.container, dfrom);
		mContainerSplay(hand.container, 2, CWIDTH, CHEIGHT, hand.list.length, OVW);
		mItemSplay(topmost, hand.list, 2, OVW);
	};
}
function anim_from_deck_to_handX(el, deck, hand) {
	anim_turn_top_card(el, () => anim_move_top_card(el, deck, hand));
}
function anim_from_deck_to_marketX(deck, market) {
	anim_turn_top_cardX(deck, () => anim_move_top_card_marketX(deck, market));
}
function anim_from_deck_to_marketX_orig(el, deck, market) {
	anim_turn_top_card(el, () => anim_move_top_card_market(el, deck, market));
}
function anim_move_top_card(el, deck, hand) {
	let topmost = deck.items.shift();
	console.assert(el == topmost, 'top deck elem is NOT correct!!!!')
	let dfrom = iDiv(topmost);
	deck.list = deck.items.map(x => x.key);
	deck.topmost = deck.items[0];
	let dto = iDiv(arrLast(hand.items));
	let rfrom = getRect(dfrom, mBy('inner_left_panel'));
	let rto = getRect(dto, mBy('inner_left_panel'));
	dfrom.style.xIndex = 100;
	let [offx, offy] = [OVW, 0]
	let a = aTranslateByEase(dfrom, offx + rto.l - rfrom.l, offy + rto.t - rfrom.t, 500, 'ease');
	a.onfinish = () => {
		dfrom.remove();
		dfrom.style.position = 'static';
		hand.items.push(topmost);
		hand.list = hand.items.map(x => x.key);
		mAppend(hand.container, dfrom);
		mContainerSplay(hand.container, 2, CWIDTH, CHEIGHT, hand.list.length, OVW);
		mItemSplay(topmost, hand.list, 2, OVW);
		qanim();
	};
}
function anim_move_top_card_market(deck, market) {
	let topmost = deck.items.shift();
	let dfrom = iDiv(topmost);
	deck.list = deck.items.map(x => x.key);
	deck.topmost = deck.items[0];
	let dto = isEmpty(market.items) ? market.container : iDiv(arrLast(market.items));
	let rfrom = getRect(dfrom, mBy('inner_left_panel'));
	let rto = getRect(dto, mBy('inner_left_panel'));
	dfrom.style.xIndex = 100;
	let [offx, offy] = isEmpty(market.items) ? [4, 4] : [topmost.w, 0];
	let a = aTranslateByEase(dfrom, offx + rto.l - rfrom.l, offy + rto.t - rfrom.t, 500, 'ease');
	a.onfinish = () => {
		dfrom.remove();
		dfrom.style.position = 'static';
		dfrom.style.zIndex = 0;
		market.items.push(topmost);
		market.list = market.items.map(x => x.key);
		mAppend(market.container, dfrom);
		qanim();
	};
}
function anim_move_top_card_marketX(deck, market) {
	let topmost = deck.items.shift();
	let dfrom = iDiv(topmost);
	deck.list = deck.items.map(x => x.key);
	deck.topmost = deck.items[0];
	let dto = isEmpty(market.items) ? market.container : iDiv(arrLast(market.items));
	let rfrom = getRect(dfrom, mBy('inner_left_panel'));
	let rto = getRect(dto, mBy('inner_left_panel'));
	dfrom.style.xIndex = 100;
	let [offx, offy] = isEmpty(market.items) ? [4, 4] : [topmost.w, 0];
	let a = aTranslateByEase(dfrom, offx + rto.l - rfrom.l, offy + rto.t - rfrom.t, 500, 'ease');
	a.onfinish = () => {
		dfrom.remove();
		dfrom.style.position = 'static';
		dfrom.style.zIndex = 0;
		market.items.push(topmost);
		market.list = market.items.map(x => x.key);
		mAppend(market.container, dfrom);
		qanim();
	};
}
function anim_move_top_cardX(deck, hand) {
	let topmost = deck.items.shift();
	let dfrom = iDiv(topmost);
	deck.list = deck.items.map(x => x.key);
	deck.topmost = deck.items[0];
	let dto = iDiv(arrLast(hand.items));
	let rfrom = getRect(dfrom, mBy('inner_left_panel'));
	let rto = getRect(dto, mBy('inner_left_panel'));
	dfrom.style.xIndex = 100;
	let [offx, offy] = [OVW, 0]
	let a = aTranslateByEase(dfrom, offx + rto.l - rfrom.l, offy + rto.t - rfrom.t, 500, 'ease');
	a.onfinish = () => {
		dfrom.remove();
		dfrom.style.position = 'static';
		hand.items.push(topmost);
		hand.list = hand.items.map(x => x.key);
		mAppend(hand.container, dfrom);
		mContainerSplay(hand.container, 2, CWIDTH, CHEIGHT, hand.list.length, OVW);
		mItemSplay(topmost, hand.list, 2, OVW);
		qanim();
	};
}
function anim_toggle_face(item, ms = 300, callback = null) {
	let d = iDiv(item);
	mClass(d, 'aniflip');
	TO.anim = setTimeout(() => {
		if (item.faceUp) face_down(item); else face_up(item); mClassRemove(d, 'aniflip');
		if (isdef(callback)) callback();
	}, ms);
}
function anim_toggle_face_orig(item, callback) {
	let d = iDiv(item);
	mClass(d, 'aniflip');
	TO.anim = setTimeout(() => {
		if (item.faceUp) face_down(item); else face_up(item); mClassRemove(d, 'aniflip');
		if (isdef(callback)) callback();
	}, 300);
}
function anim_turn_top_card(el, callback) {
	anim_toggle_face(el, callback);
}
function anim_turn_top_cardX(deck, callback) { anim_toggle_face(deck.topmost, callback); }
function anim1(elem, prop, from, to, ms) {
	if (prop == 'left') elem.style.position = 'absolute';
	if (isNumber(from)) from = '' + from + 'px';
	if (isNumber(to)) to = '' + to + 'px';
}
function animate(elem, aniclass, timeoutms) {
	mClass(elem, aniclass);
	TOMan.TO.anim = setTimeout(() => mRemoveClass(elem, aniclass), timeoutms);
}
function animate_card_approx(card, goal, ms, callback) {
	let d = iDiv(card);
	let dgoal = iDiv(goal);
	let r = getRect(d);
	let rgoal = getRect(dgoal);
	let c = { x: r.x + r.w / 2, y: r.y + r.h / 2 };
	let cgoal = { x: rgoal.x + rgoal.w / 2, y: rgoal.y + rgoal.h / 2 };
	let v = { x: cgoal.x - c.x, y: cgoal.y - c.y };
	mAnimateList(d, { transform: `translateX(${v.x}px) translateY(${v.y}px)`, opacity: 0 }, callback, ms, 'linear');
}
function animate_card_exchange(i0, i1, callback) {
	ari_make_unselectable(i0);
	ari_make_unselectable(i1);
	let d0 = iDiv(i0.o);
	let d1 = iDiv(i1.o);
	let r0 = getRect(d0);
	let r1 = getRect(d1);
	let c0 = { x: r0.x + r0.w / 2, y: r0.y + r0.h / 2 };
	let c1 = { x: r1.x + r1.w / 2, y: r1.y + r1.h / 2 };
	let v = { x: c1.x - c0.x, y: c1.y - c0.y };
	mTranslateBy(d0, v.x, v.y);
	mTranslateBy(d1, -v.x, -v.y, 700, callback);
}
function animate_card_transfer(card, goal, callback) {
	let d = iDiv(card);
	let dgoal = iDiv(goal);
	let r = getRect(d);
	let rgoal = getRect(dgoal);
	let c = { x: r.x + r.w / 2, y: r.y + r.h / 2 };
	let cgoal = { x: rgoal.x + rgoal.w / 2, y: rgoal.y + rgoal.h / 2 };
	let v = { x: cgoal.x - c.x, y: cgoal.y - c.y };
	mTranslateBy(d, v.x, v.y, 700, callback);
}
function animate_title() {
	var rev = "fwd";
	function titlebar(val) {
		var msg = "Hallodi!";
		var res = " ";
		var speed = 100;
		var pos = val;
		msg = "   |-" + msg + "-|";
		var le = msg.length;
		if (rev == "fwd") {
			if (pos < le) {
				pos = pos + 1;
				scroll = msg.substr(0, pos);
				document.title = scroll;
				timer = window.setTimeout("titlebar(" + pos + ")", speed);
			}
			else {
				rev = "bwd";
				timer = window.setTimeout("titlebar(" + pos + ")", speed);
			}
		}
		else {
			if (pos > 0) {
				pos = pos - 1;
				var ale = le - pos;
				scrol = msg.substr(ale, le);
				document.title = scrol;
				timer = window.setTimeout("titlebar(" + pos + ")", speed);
			}
			else {
				rev = "fwd";
				timer = window.setTimeout("titlebar(" + pos + ")", speed);
			}
		}
	}
	titlebar(0);
}
function animateColor(elem, from, to, classes, ms) {
	elem.style.backgroundColor = from;
	setTimeout(() => animate(elem, classes, ms), 10);
}
function animateColorScale(elem, color = 'green', scale = 1.5, timeoutms = 2000, aniClass = 'scaleInColor') {
	setCSSVariable('--aniColor', color);
	setCSSVariable('--aniScale', scale);
	mClass(elem, aniClass);
	setTimeout(() => mRemoveClass(elem, aniClass), timeoutms);
}
function animatedTitle(msg = 'DU BIST DRAN!!!!!') {
	TO.titleInterval = setInterval(() => {
		let corner = CORNERS[WhichCorner++ % CORNERS.length];
		document.title = `${corner} ${msg}`; //'⌞&amp;21543;    U+231E \0xE2Fo\u0027o Bar';
	}, 1000);
}
function animateProperty(elem, prop, start, middle, end, msDuration, forwards) {
	let kflist = [];
	for (const v of [start, middle, end]) {
		let o = {};
		o[prop] = isString(v) || prop == 'opacity' ? v : '' + v + 'px';
		kflist.push(o);
	}
	let opts = { duration: msDuration };
	if (isdef(forwards)) opts.fill = forwards;
	elem.animate(kflist, opts);
}
function animatePropertyX(elem, prop, start_middle_end, msDuration, forwards, easing, delay) {
	let kflist = [];
	for (const perc in start_middle_end) {
		let o = {};
		let val = start_middle_end[perc];
		o[prop] = isString(val) || prop == 'opacity' ? val : '' + val + 'px';
		kflist.push(o);
	}
	let opts = { duration: msDuration, fill: valf(forwards, 'none'), easing: valf(easing, 'ease-it-out'), delay: valf(delay, 0) };
	elem.animate(kflist, opts);
}
function animateStyles(d, styles1, styles2, ms) {
	d.style.transition = `${ms}ms`;
	mStyle(d, styles2);
}
function Animation(spriteSheet, imgWidth, imgHeight, cellWidth, cellHeight) {
	this.sheet = spriteSheet;
	this.imgWidth = imgWidth;
	this.imgHeight = imgHeight;
	this.cellWidth = cellWidth;
	this.cellHeight = cellHeight;
	this.animationLength = 1000;
	this.changeLength = false;
	this.cycles = new Array();
	this.currentCycleName = "";
	this.currentCycle = null;
	this.cyclePlaySettings = new Array(PLAY_LOOP, PLAY_LOOP, PLAY_LOOP, PLAY_LOOP);
	this.changeAnimation = false;
	this.timer = new Timer();
	this.framesPerRow = 0;
	this.framesPerColumn = 0;
	this.totalCycleTime = 0;
	this.fps = 0;
	this.isPaused = false;
	this.setup = function () {
		this.timer.start();
		this.framesPerRow = this.imgWidth / this.cellWidth;
		this.framesPerColumn = this.imgHeight / this.cellHeight;
	}
	this.addCycle = function (cycleName, startingCell, frames) {
		cycle = new Array(cycleName, startingCell, frames);
		this.cycles.push(cycle);
	}
	this.drawFrame = function (ctx) {
		this.fps += 1;
		if (!this.isPaused) { this.totalCycleTime += this.timer.getTimeElapsed(); }
		if (this.changeAnimation == true) {
			for (i = 0; i < this.cycles.length; i++) {
				if (this.cycles[i][0] == this.currentCycleName) {
					this.currentCycle = this.cycles[i];
				}
			}
		}
		if (this.changeAnimation || this.changeLength) {
			this.frameDelta = this.animationLength / this.currentCycle[2];
			this.changeAnimation = false;
			this.changeLength = false;
			this.fps = 0;
		}
		currentFrame = Math.floor((this.totalCycleTime % this.animationLength) / this.frameDelta);
		document.getElementById("FPS").innerHTML = this.animationLength;
		row = Math.floor((this.currentCycle[1] + currentFrame) / this.framesPerRow);
		col = (this.currentCycle[1] + currentFrame) - (row * Math.floor(this.imgWidth / this.cellWidth));
		frameY = row * this.cellHeight;
		frameX = col * this.cellWidth;
		ctx.drawImage(this.sheet, frameX, frameY, this.cellWidth, this.cellHeight, 0 - (this.cellWidth / 2), 0 - (this.cellHeight / 2), this.cellWidth, this.cellHeight);
	}
	this.setCycle = function (cycleName) {
		this.currentCycleName = cycleName;
		this.changeAnimation = true;
		this.totalCycleTime = 0;
	}
	this.renameCycles = function (cycleNames) {
		for (i = 0; i < cycleNames.length; i++) {
			number = parseInt(this.cycles[i][0].slice(5));
			if (this.currentCycleName == this.cycles[i][0]) { this.currentCycleName = cycleNames[number - 1]; }
			this.cycles[i][0] = cycleNames[number - 1];
		}
	}
	this.play = function () {
		this.isPaused = false;
		this.timer.reset();
	}
	this.pause = function () {
		this.isPaused = true;
	}
	this.reset = function () {
		this.totalCycleTime = 0;
		this.timer.reset();
	}
	this.setAnimationSpeed = function (animLength) {
		if (animLength <= 50) { animLength = 50; }
		this.animationLength = animLength;
		this.changeLength = true;
	}
}
function animationCallback(secs, callback, removeBg = false) {
	for (const p of Pictures) { slowlyTurnFaceDown(p, secs - 1, removeBg); }
	TOMain = setTimeout(() => {
		callback();
	}, secs * 1000);
}
function animbuilding(ui_building, ms = 800, callback = null) {
	let d = ui_building.cardcontainer;
	let ani = [{ transform: 'scale(1)' }, { transform: 'scale(1.5)' }, { transform: 'scale(1)' }];
	let options = {
		duration: ms,
		iterations: 1,
		easing: 'ease-out',
	};
	let a = d.animate(ani, options);
	a.onfinish = callback;
}
function animcoin(plname, ms = 800, callback = null) {
	let d = UI.player_stat_items[plname].dCoin;
	let ani = [{ transform: 'scale(1)' }, { transform: 'scale(3)' }, { transform: 'scale(1)' }];
	let options = {
		duration: ms,
		iterations: 1,
		easing: 'ease-out',
	};
	let a = d.animate(ani, options);
	a.onfinish = () => {
		let uplayer = Z.uplayer;
		let dAmount = UI.player_stat_items[uplayer].dAmount;
		dAmount.innerHTML = Z.fen.players[uplayer].coins;
		mStyle(dAmount, { fg: 'red' });
		if (callback) callback();
	};
}
function animtest(d, ms = 1000, callback) {
	let spinAway = [
		{ transform: 'rotate(0) scale(1)' },
		{ transform: 'rotate(360deg) scale(0)' }
	];
	spinAway = [
		{ transform: 'rotate(0) scale(1)' },
		{ transform: 'rotate(180deg) scale(0)' },
		{ transform: 'rotate(360deg) scale(2)' }
	];
	spinAway = [
		{ transform: 'scale(1)' },
		{ transform: 'scale(3)' },
		{ transform: 'scale(1)' }
	];
	let options = {
		duration: ms,
		iterations: 1,
		easing: 'ease-out', //'cubic-bezier(.24,.65,.78,.03)',
		//easing: 'cubic-bezier(.89,.31,.67,1.05)', // 'cubic-bezier(.55,.22,.52,.98)' //'cubic-bezier(1,-0.03,.86,.68)'
	}
	d.addEventListener('click', (ev) => {
		evNoBubble(ev);
		let a = d.animate(spinAway, options);
		a.onfinish = callback;
	});
}
function aniPulse(elem, ms) { animate(elem, 'onPulse', ms); }
function anipulse(d, ms = 3000, callback) {
	let a = d.animate(
		[{
			'background-color': '#2ba805',
			'box-shadow': '0 0 3px #2ba805'
		},
		{
			'background-color': `#49e819`,
			'box-shadow': `0 0 10px #49e819`,
		},
		{
			'background-color': `#2ba805`,
			'box-shadow': `0 0 3px #2ba805`
		}], { fill: 'both', duration: ms, easing: 'ease', delay: 1000 });
	a.onfinish = callback;
	return a;
}
function aniSequence() {
}
function aniSuper(elem, name, duration, easing, delay, iterations, direction, before_after, playstate) {
}
function annotate(sp) {
	for (const k in sp) {
		let node = sp[k];
		node.pool = [];
		let pool = makePool(node);
		for (const oid in pool) {
			let o = pool[oid];
			if (!evalCond(o, node)) continue;
			if (nundef(o.RSG)) o.RSG = {};
			let rsg = o.RSG;
			rsg[k] = true;
			node.pool.push(oid);
		}
	}
}
function any(arr, cond) {
	return !isEmpty(arr.filter(cond));
}
function anyStartsWith(arr, prefix) {
	return any(arr, el => startsWith(el, prefix));
}
function anyString(x, indent = 0, ifDict = 'entries') {
	if (isLiteral(x)) return x;
	else if (isListOfLiterals(x)) return x.join(' ');
	else if (isEmpty(x)) return x;
	else if (isList(x)) { return x.map(el => anyString(el, indent + 1, ifDict)).join(' '); }
	else if (isDict(x)) {
		let s = '';
		for (const k in x) { s += '\n' + ' '.repeat(indent) + k + ': ' + anyString(x[k], indent + 1, ifDict); }
		return s;
	}
}
function anyString2(x, indent = 0, proplist, include = true, toplevelOnly = false) {
	if (isLiteral(x)) return x;
	else if (isListOfLiterals(x)) return x.join(' ');
	else if (isEmpty(x)) return x;
	else if (isList(x)) {
		if (toplevelOnly) proplist = null;
		return x.map(el => anyString2(el, indent + 1, proplist, include)).join(' ');
	}
	else if (isDict(x)) {
		let plist = proplist;
		if (toplevelOnly) proplist = null;
		let s = '';
		if (isdef(plist)) {
			if (include) {
				for (const k of plist) {
					if (nundef(x[k])) { console.log('continue', x, k); continue; }
					s += '\n' + ' '.repeat(indent) + k + ': ' + anyString2(x[k], indent + 1, proplist, include);
				}
			} else {
				for (const k of plist) {
					if (isdef(x[k])) continue;
					s += '\n' + ' '.repeat(indent) + k + ': ' + anyString2(x[k], indent + 1, proplist, include);
				}
			}
		} else {
			for (const k in x) { s += '\n' + ' '.repeat(indent) + k + ': ' + anyString2(x[k], indent + 1, proplist, include); }
		}
		return s;
	}
}
function anyString3(x, indent = 0, proplist = null, include = true, guard = ['specKey', 'label', 'pool', 'el', 'sub', 'elm', 'cond', 'info', 'o', 'ui', 'source', 'bi']) {
	if (isLiteral(x)) return x;
	else if (isListOfLiterals(x)) return x.join(' ');
	else if (isEmpty(x)) return x;
	else if (isList(x)) {
		return x.map(el => anyString3(el, indent + 1, proplist, include)).join(' ');
	}
	else if (isDict(x)) {
		let s = '';
		for (const k in x) {
			if (guard.includes(k)) continue;
			if (isdef(proplist) && !include && proplist.includes(k)) continue;
			else if (isdef(proplist) && include && !proplist.includes(k)) continue;
			s += '\n' + ' '.repeat(indent) + k + ': ' + anyString3(x[k], indent + 1, proplist, include);
		}
		return s;
	}
}
function anyToString1(x, indent = 0, ifDict = 'entries') {
	if (isList(x) && !isEmpty(x)) { return x.join(' '); }
	else if (isDict(x)) {
		return ifDict == 'keys' ? Object.keys(x).join(' ')
			: ifDict == 'entries' ? Object.entries(x).map(([k, v]) => k + ': ' + dictOrListToString(v, 'ifDict', indent + 2)).join('\n')
				: Object.entries(x).join(' ');
	}
	else return x;
}
function anyWordContainedInKeys(dict, keywords) {
	let res = [];
	for (const k in dict) {
		let isMatch = false;
		for (const w of keywords) {
			if (k.includes(w)) { isMatch = true; break; }
		}
		if (isMatch) res.push(dict[k]);
	}
	return res;
}
function anyWordContainedInKeysAsWord(dict, keywords) {
	let res = [];
	for (const k in dict) {
		let isMatch = false;
		let wordsInKey = splitAtWhiteSpace(k);
		for (const w of keywords) {
			if (wordsInKey.includes(w)) { isMatch = true; break; }
		}
		if (isMatch) res.push(dict[k]);
	}
	return res;
}
function anyWordContainedInProps(dict, keywords, props) {
	let res = [];
	for (const k in dict) {
		let isMatch = false;
		let propString = '';
		for (const p of props) { propString += dict[k][p]; }
		for (const w of keywords) {
			if (propString.includes(w)) { isMatch = true; break; }
		}
		if (isMatch) res.push(dict[k]);
	}
	return res;
}
function anyWordContainedInPropsAsWord(dict, keywords, props) {
	let res = [];
	for (const k in dict) {
		let isMatch = false;
		let keywordList = [];
		for (const p of props) {
			if (nundef(dict[k][p])) continue;
			let wordsInKey = splitAtWhiteSpace(dict[k][p]);
			keywordList = keywordList.concat(wordsInKey);
		}
		for (const w of keywords) {
			if (keywordList.includes(w)) { isMatch = true; break; }
		}
		if (isMatch) res.push(dict[k]);
	}
	return res;
}
function apiphp(o, saveFromZ = false) {
	let [data, cmd] = [o.data, o.cmd];
	let result = {}, friendly, uname, state, player_status, fen;
	if (saveFromZ && isdef(data.friendly) && !db_table_exists(data.friendly)) {
		let res = db_new_table(data.friendly, Z.game, Z.host, jsCopy(Z.playerlist), jsCopy(Z.fen), jsCopy(Z.options));
		if (isdef(Z.playerdata)) res.playerdata = jsCopy(Z.playerdata);
	}
	if (cmd == 'table') {
		if (isdef(data.auto)) result.auto = data.auto;
		friendly = data.friendly;
		uname = data.uname;
		result.status = "table";
		if (isdef(data.clear_players)) {
			result.playerdata = db_clear_players(friendly);
			result.status = "clear_players";
		} else if (isdef(data.write_player) && isdef(data.state)) {
			player_status = isdef(data.player_status) ? data.player_status : '';
			result.playerdata = db_write_player(friendly, uname, data.state, player_status);
			result.status = "write_player";
		} else {
			result.playerdata = db_read_playerdata(friendly);
		}
		if (isdef(data.write_fen)) {
			result.table = db_write_fen(friendly, data.fen);
			result.status += " write_fen";
		} else {
			result.table = db_read_table(friendly);
		}
	} else if (cmd == 'startgame') {
		let res = db_new_table(data.friendly, data.game, data.host, data.players, data.fen, data.options);
		result.table = res.table;
		result.playerdata = res.playerdata;
		result.status = `startgame ${data.friendly}`;
	} else if (cmd == 'tables') {
		result.tables = dict2list(GT, 'friendly').map(x => x.table);
		result.status = "tables";
	} else if (cmd == 'gameover') {
		result.table = db_write_fen(data.friendly, data.fen, data.scoring);
		result.status = `scored table ${data.friendly}`;
	}
	return result;
}
function appears_once_only(board, possibilities, segment, r, c) {
	let updated = false
	for (i = 0; i < possibilities.length; i++) {
		let possibility = possibilities[i]
		let counter = 0
		segment.forEach(cell => {
			if (Array.isArray(cell)) {
				if (cell.includes(possibility)) {
					counter++
				}
			} else {
				if (cell == possibility) {
					counter++
				}
			}
		})
		if (counter == 1) {
			board[r][c] = possibility
			updated = true
			break
		}
	}
	return updated
}
function apply_skin1(item) {
	let d = item.container; mCenterFlex(d); mStyle(d, { position: 'relative', w: 400 });
	mText(`${item.label}: <span style="font-size:20px;margin:10px;color:red">${item.content}</span>`, d);
	let b = mButton(item.caption, item.handler, d, { position: 'absolute', right: 0, top: 'calc( 50% - 12px )', h: 24 }, ['selectbutton', 'enabled']);
	console.log('button', b)
}
function apply_skin2(item) {
	let d = item.container; mCenterFlex(d); mStyle(d, { position: 'relative', w: 400 });
	let h = 24;
	let top = `calc( 50% - ${h / 2}px )`
	mText(item.label + ':', d, { position: 'absolute', left: 0, top: top, h: h });
	mText(`<span style="font-size:20px;margin:10px;color:red">${item.content}</span>`, d);
	item.button = mButton(item.caption, item.handler, d, { position: 'absolute', right: 0, top: top, h: h, w: 80 }, ['selectbutton', 'enabled']);
}
function apply_skin3(item) {
	let d = item.container; mCenterCenterFlex(d); mStyle(d, { position: 'relative', w: 400 });
	let h = 24;
	let top = `calc( 50% - ${h / 2}px )`
	mText(item.label + ':', d, { position: 'absolute', left: 0, top: top, h: h });
	let panel = UI.dAnzeige = item.panel = mDiv(d, { bg: '#ffffff80', padding: '4px 12px', w: 200, align: 'center', rounding: 8 });
	let words = toWords(item.content)
	let panelitems = UI.panelItems = item.panelitems = [];
	for (let i = 0; i < 4; i++) {
		let text = valf(words[i], '');
		let dw = mDiv(panel, { hpadding: 4, display: 'inline', fz: 22, weight: 'bold', fg: 'red' }, `dbid_${i}`, text);
		panelitems.push({ div: dw, index: i, initial: text, state: 'unselected' })
	}
	let b = item.buttonX = mDiv(panel, { fz: 10, hpadding: 4, bg: 'white' }, null, 'CLR', 'enabled'); mPlace(b, 'tr', 2)
	b.onclick = bluff_clear_panel;
	item.button = mButton(item.caption, item.handler, d, { position: 'absolute', right: 0, top: top, h: h, w: 80 }, ['selectbutton', 'enabled']);
}
function applyColorkey(item) {
	let l = item.live;
	let sShade = '0 0 0 ' + item.textShadowColor;
	item.shadeStyles = { 'text-shadow': sShade, fg: colorFrom('black', l.options.contrast) };
	let ui = l.options.showPic ? l.dPic : l.dLabel;
	mStyleX(ui, item.shadeStyles);
}
function applyCssStyles(ui, params) {
	let domType = getTypeOf(ui);
	if (domType == 'g') {
		mStyle(ui, params);
	} else {
		mStyle(ui, params);
	}
}
function applySettings(b, s, h = 768, topFrame = 0) {
	let isRealBoard = topFrame == 0;
	let hBoard = h, wBoard = 2 * h;
	let scale = hBoard / valf(s.hBoard, 768);
	calcLayoutParameters(s, b, scale);
	clearElement(b.dOuter);
	b.fields = null;
	createFields(s, b, scale);
	console.log('applySettings: baseColor', s.baseColor);
	if (isRealBoard) setNewBackgroundColor(s.baseColor);
	return b;
}
function applyStandard(dParent, s, h = 768, topFrame = 0) {
	let isRealBoard = topFrame == 0;
	let b = { boardFilename: s.boardFilename };
	let hBoard = h, wBoard = 2 * h;
	let scale = hBoard / valf(s.hBoard, 768);
	calcLayoutParameters(s, b, scale);
	let d0;
	if (isRealBoard) {
		d0 = b.d0 = mDiv(dParent, { h: hBoard });
	} else {
		d0 = b.d0 = mDiv(dParent, { w: wBoard + 100, h: hBoard + topFrame }, 'd0_' + b.boardFilename);
	}
	mCenterCenterFlex(d0);
	let dOuter = b.dOuter = mDiv(d0, {}, 'dOuter_' + b.boardFilename);
	mCenterCenterFlex(dOuter);
	loadBoardImage(dParent, s, b, scale, topFrame != 0);
	console.log('applyStandard: baseColor', s.baseColor);
	if (isRealBoard) setNewBackgroundColor(s.baseColor);
	createFields(s, b, scale);
	return b;
}
function applyStyles(g, id, styles) { g.mStyle(id, styles, isdef(g.getNode(id)) ? 'node' : 'edge'); }
function appSpecificSettings() {
	updateLabelSettings();
	updateTimeSettings();
	updateKeySettings();
	updateSpeakmodeSettings();
}
function areaBlink(id) {
	let area = UIS[id];
	if (area) area.elem.classList.add('blink');
}
function areaRows(soDict, loc) {
	let area = getVisual(loc);
	let [w, areaH] = area.getSize();
	let keys = getKeys(soDict);
	let n = keys.length;
	let h = Math.floor(areaH / n);
	let extra = areaH - n * h;
	let x = 0;
	let y = 0;
	let [iPalette, ipal] = area.getColorInfo();
	let pal = S.pals[iPalette];
	ipal = n <= pal.length - ipal ? ipal : n <= pal.length ? pal.length - n : ipal;
	let i = 0;
	for (const k in soDict) {
		let id = k;
		i += 1;
		let o = createMainDiv(id, loc);
		let h1 = i == n - 1 ? h + extra : h;
		o.setBounds(x, y, w, h1);
		o.setPalette(iPalette, ipal);
		y += h1;
		ipal = (ipal + 1) % pal.length;
	}
}
function areNeighbors(r1, r2) {
	let res = firstCond(r1.doors, x => x.includes(r1.id) && x.includes(r2.id));
	return res != null;
}
function aRestore(elem) { elem.style.transform = ''; }
function ari_action_round_over(otree, plturn) {
	ari_move_market_to_discard(otree);
	ari_move_stalls_to_hands(otree);
	ari_add_hand_card(otree);
	otree.round = [];
	otree.iturn = 0;
	if (otree.stage == 10) {
		otree.phase = 'queen';
		otree.stage = 3;
	} else if (otree.phase == 'king') {
		otree.pl_gameover = [];
		for (const uname of otree.plorder) {
			let [bcorrect, realvps] = ari_get_correct_buildings(otree[uname].buildings);
			let can_end = ari_check_end_condition(bcorrect);
			if (can_end) otree.pl_gameover.push(uname);
		}
		if (!isEmpty(otree.pl_gameover)) {
			otree.stage = 10;
			otree.iturn = otree.plorder.indexOf(otree.pl_gameover[0]);
		} else {
			otree.phase = 'queen';
			otree.stage = 3;
		}
	} else if (otree.phase == 'queen') {
		for (const uname of otree.plorder) {
			for (const k in otree[uname].buildings) {
				if (k == 'farms') continue;
				let n = otree[uname].buildings[k].length;
				otree[uname].coins += n;
			}
		}
		otree.phase = 'jack';
		otree.stage = 3;
	} else {
		ari_move_herald(otree, plturn);
		ari_add_harvest_cards(otree);
		otree.phase = 'king';
		ari_tax_phase_needed(otree, plturn);
	}
}
function ari_activate_ui() { ari_pre_action(); }
function ari_add_hand_card() {
	let fen = Z.fen;
	for (const uplayer of fen.plorder) {
		ari_ensure_deck(fen, 1);
		top_elem_from_to(fen.deck, fen.players[uplayer].hand);
	}
}
function ari_add_harvest_cards(fen) {
	for (const plname of fen.plorder) {
		for (const f of fen.players[plname].buildings.farm) {
			if (nundef(f.h)) {
				let list = [];
				ari_ensure_deck(fen, 1);
				top_elem_from_to(fen.deck, list);
				f.h = list[0];
			}
		}
	}
}
function ari_add_rumor(fenbuilding, key) {
	if (nundef(fenbuilding.rumors)) fenbuilding.rumors = [];
	fenbuilding.rumors.push(key);
}
function ari_branch(obj, otree, rtree) {
	verify_unit_test(otree);
	ari_player_stats(otree);
	G.plprev = G.plturn;
	let plturn = G.plturn = otree.plturn;
	let turn_changed = G.plprev != G.plturn;
	let my_turn = G.plturn == G.cur_user;
	console.assert(otree.plturn == otree.plorder[otree.iturn], 'TURN MIXUP!');
	if (TESTING) console.log('___ ITER:' + ITER, plturn, turn_changed ? '(changed)' : '', my_turn ? 'ME!' : '', isdef(otree.num_actions) ? 'actions:' + otree.num_actions : '');
	ari_present(otree, plturn);
	A = { level: 0, di: {}, ll: [], items: [], selected: [], tree: null, breadcrumbs: [], sib: [], command: null };
	console.assert(G.otree == otree, 'OTREE FAIL!!!!!!!!!!!');
	table_shield_off();
	if (isdef(otree.winner)) {
		stop_game();
		ari_reveal_all_buildings(otree);
		if (!TestRunning) turn_show_gameover(otree);
	} else if (G.cur_user == plturn || is_admin(G.cur_user)) {
		ari_pre_action(otree, plturn);
	} else {
		let txt = otree.num_actions > 0 ? ('(' + otree.action_number + '/' + otree.total_pl_actions + ')') : '';
		dTop.innerHTML =
			`<div style='padding:4px 10px;font-size:20px;display:flex;justify-content:space-between'>
						<div>${G.table.friendly.toLowerCase()}</div>
						<div>${plturn} ${txt} ${ARI.stage[otree.stage]}</div>
						<div>phase: ${otree.phase.toUpperCase()}</div>
				</div>`;
		table_shield_on();
	}
}
function ari_calc_fictive_vps(fen, plname) {
	let pl = fen.players[plname];
	let bs = pl.buildings;
	let vps = calc_building_vps(bs);
	return vps;
}
function ari_calc_real_vps(fen, plname) {
	let pl = fen.players[plname];
	let bs = ari_get_correct_buildings(pl.buildings);
	let vps = calc_building_vps(bs);
	for (const btype in bs) {
		let blist = bs[btype];
		for (const b of blist) {
			let lead = b.list[0];
			if (firstCond(pl.commissions, x => x[0] == lead[0])) {
				vps += 1;
			}
		}
	}
	return vps;
}
function ari_check_action_available(a, fen, uplayer) {
	let cards;
	let pl = fen.players[uplayer];
	if (a == 'trade') {
		cards = ari_get_all_trading_cards(fen);
		let not_pl_stall = cards.filter(x => !pl.stall.includes(x.key));
		return cards.length >= 2 && pl.stall.length > 0 && not_pl_stall.length > 0;
	} else if (a == 'exchange') {
		cards = ari_get_all_wrong_building_cards(fen, uplayer);
		return cards.length > 0 && (pl.hand.length + pl.stall.length > 0);
	} else if (a == 'build') {
		let res = ari_get_player_hand_and_stall(fen, uplayer);
		if (res.length < 4) return false;
		let has_a_king = firstCond(res, x => x[0] == 'K');
		if (pl.coins < 1 && !has_a_king) return false;
		if (fen.phase != 'king' && (!has_a_king || res.length < 5)) return false;
		if (pl.coin == 0 && res.length < 5) return false;
		return true;
	} else if (a == 'upgrade') {
		if (isEmpty(pl.buildings.farm) && isEmpty(pl.buildings.estate)) return false;
		let res = ari_get_player_hand_and_stall(fen, uplayer);
		if (isEmpty(res)) return false;
		let has_a_king = firstCond(res, x => x[0] == 'K');
		if (pl.coins < 1 && !has_a_king) return false;
		if (fen.phase != 'king' && !has_a_king) return false;
		if (pl.coin == 0 && res.length < 2) return false;
		return true;
	} else if (a == 'downgrade') {
		if (isEmpty(pl.buildings.chateau) && isEmpty(pl.buildings.estate)) return false;
		return true;
	} else if (a == 'buy') {
		if (fen.open_discard.length == 0) return false;
		let res = ari_get_player_hand_and_stall(fen, uplayer);
		let has_a_jack = firstCond(res, x => x[0] == 'J');
		if (pl.coins < 1 && !has_a_jack) return false;
		if (fen.phase != 'jack' && !has_a_jack) return false;
		return true;
	} else if (a == 'visit') {
		let others = fen.plorder.filter(x => x != uplayer);
		let n = 0;
		for (const plname of others) {
			for (const k in fen.players[plname].buildings) {
				n += fen.players[plname].buildings[k].length;
			}
		}
		if (n == 0) return false;
		let res = ari_get_player_hand_and_stall(fen, uplayer);
		let has_a_queen = firstCond(res, x => x[0] == 'Q');
		if (pl.coins < 1 && !has_a_queen) return false;
		if (fen.phase != 'queen' && !has_a_queen) return false;
		return true;
	} else if (a == 'harvest') {
		let harvests = ari_get_all_building_harvest_cards(fen, uplayer);
		return !isEmpty(harvests);
	} else if (a == 'pickup') {
		return !isEmpty(pl.stall);
	} else if (a == 'sell') {
		return pl.stall.length >= 2;
	} else if (a == 'pass') {
		return true;
	} else if (a == 'commission') {
		for (const c of pl.commissions) {
			let rank = c[0];
			if (firstCond(pl.stall, x => x[0] == rank)) return true;
		}
		return false;
	} else if (a == 'rumor') {
		if (isEmpty(pl.rumors)) return false;
		let others = fen.plorder.filter(x => x != uplayer);
		let n = 0;
		for (const plname of others) {
			for (const k in fen.players[plname].buildings) {
				n += fen.players[plname].buildings[k].length;
			}
		}
		if (n == 0) return false;
		return true;
	} else if (a == 'inspect') {
		if (isEmpty(pl.rumors)) return false;
		let others = fen.plorder.filter(x => x != uplayer);
		let n = 0;
		for (const plname of others) {
			for (const k in fen.players[plname].buildings) {
				n += fen.players[plname].buildings[k].length;
			}
		}
		return n > 0;
	} else if (a == 'blackmail') {
		let others = fen.plorder.filter(x => x != uplayer);
		let n = 0;
		for (const plname of others) {
			for (const k in fen.players[plname].buildings) {
				let list = fen.players[plname].buildings[k];
				let building_with_rumor = firstCond(list, x => !isEmpty(x.rumors));
				if (building_with_rumor) n++;
			}
		}
		if (n == 0) return false;
		let res = ari_get_player_hand_and_stall(fen, uplayer);
		let has_a_queen = firstCond(res, x => x[0] == 'Q');
		if (pl.coins < 1 && !has_a_queen) return false;
		if (fen.phase != 'queen' && !has_a_queen) return false;
		return true;
	} else if (a == 'buy rumor') {
		if (fen.deck_rumors.length == 0) return false;
		if (pl.coins < 1) return false;
		return true;
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
function ari_clear_church() {
	let [fen, A, uplayer] = [Z.fen, Z.A, Z.uplayer];
	for (const prop of ['church', 'church_order', 'selorder', 'tithemin', 'tithe_minimum', 'toBeSelected', 'candidates']) delete fen[prop];
	for (const plname in fen.players) {
		delete fen.players[plname].tithes;
	}
	fen.church = ari_deck_deal_safe(fen, Z.plorder.length);
}
function ari_complete_building() {
	let [otree, plturn] = [G.otree, G.otree.plturn];
	let building_items = A.selected.map(x => A.items[x]);
	let building_type = building_items.length == 4 ? 'farms' : building_items.length == '5' ? 'estates' : 'chateaus';
	console.log('...building a', building_type);
	otree[plturn].buildings[building_type].push({ list: building_items.map(x => x.key), h: null });
	for (const item of building_items) {
		let source = lookup(otree, item.path.split('.'));
		removeInPlace(source, item.key);
	}
	ari_redo_player_ui(otree, plturn);
	ari_next_action(otree, plturn);
}
function ari_complete_upgrade() {
	let [otree, plturn] = [G.otree, G.otree.plturn];
	let gb = A.building;
	let b = lookup(otree, gb.path.split('.'));
	let n = A.upgrade_cards.length;
	let type0 = gb.o.type;
	let len = gb.o.list.length + n;
	let type1 = len == 5 ? 'estates' : 'chateaus';
	let target = lookup(otree, gb.path.split('.'));
	for (const o of A.upgrade_cards) {
		let source = lookup(otree, o.path.split('.'));
		elem_from_to(o.key, source, target.list);
	}
	let bres = target;
	bres.harvest = null;
	removeInPlace(otree[plturn].buildings[type0], bres);
	otree[plturn].buildings[type1].push(bres);
	ari_redo_player_ui(otree, plturn);
	ari_next_action(otree, plturn);
}
function ari_create_card_assets(scolors) {
	let sz = 100;
	set_card_constants(sz * .7, sz, 'A23456789TJQK', 'SHDC', scolors);
	let colors = { r: RED, b: BLUE, g: GREEN, p: PURPLE, y: YELLOW, o: ORANGE };
	let ranknames = { A: 'Ace', K: 'King', T: '10', J: 'Jack', Q: 'Queen' };
	let suitnames = { S: 'Spades', H: 'Hearts', C: 'Clubs', D: 'Diamonds' };
	let di = {};
	for (const r of Card.ranks) {
		for (const s of Card.suits) {
			for (const c of Card.decks) {
				let k = r + s + c;
				di[k] = { key: k, val: r == 'A' ? 1 : 'TJQK'.includes(r) ? 10 : Number(r), rank: r, suit: s, color: colors[c], c52key: 'card_' + r + s, w: sz * .7, h: sz, sz: sz, ov: Card.ovw, friendly: `${isNumber(r) ? r : ranknames[r]} of ${suitnames[s]}`, short: `${r}${s}` };
			}
		}
	}
	Aristocards = di;
	return di;
}
function ari_create_ui_tree(n, dParent, r) {
	let d = null;
	if (n.oid == 'o_1') {
		d = mDiv(dParent, { w: '100%' }, getUID('u'));
	} else if (startsWith(n.path, 'deck')) {
		let deck = G[n.path] = ui_type_deck(n.content);
		d = deck.container;
	} else if (r.otree.player_names.includes(n.content)) {
		d = ui_make_player(Session.otree, n.content, dParent);
	} else if (n.type == 'cardlist') {
		d = ari_make_cardlist(n.content, 2, dParent);
	} else if (n.type == 'card') {
		return;
	} else if (n.type == 'string') {
		let id = getUID('u');
		d = mDiv(dParent, { bg: 'inherit' }, id, n.content);
	}
	if (nundef(d)) return; else r.add_ui_node(d, d.id, n.oid);
	for (const ch of n.children) {
		ari_create_ui_tree(r.nodes[ch], d, r);
	}
}
function ari_deck_add_safe(otree, n, arr) {
	ari_ensure_deck(otree, n);
	deck_add(otree.deck, n, arr);
}
function ari_deck_deal_safe(fen, n) { ari_ensure_deck(fen, n); return deck_deal(fen.deck, n); }
function ari_ensure_deck(fen, n) {
	if (fen.deck.length < n) { ari_refill_deck(fen); }
}
function ari_get_actions(uplayer) {
	let fen = Z.fen;
	let actions = exp_rumors(Z.options) ? ['trade', 'exchange', 'build', 'upgrade', 'downgrade', 'buy', 'buy rumor', 'rumor', 'inspect', 'blackmail', 'harvest', 'pickup', 'sell', 'tithe', 'commission']
		: ['trade', 'exchange', 'build', 'upgrade', 'downgrade', 'buy', 'visit', 'harvest', 'pickup', 'sell', 'tithe', 'commission'];
	if (Config.autosubmit) actions.push('pass');
	let avail_actions = [];
	for (const a of actions) {
		let avail = ari_check_action_available(a, fen, uplayer);
		if (avail) avail_actions.push(a);
	}
	return avail_actions;
}
function ari_get_all_building_harvest_cards(fen, uplayer) {
	let res = [];
	let pl = fen.players[uplayer];
	for (const b of pl.buildings.farm) {
		if (b.h) res.push({ b: b, h: b.h });
	}
	return res;
}
function ari_get_all_trading_cards(fen) {
	let res = [];
	fen.market.map(c => res.push({ key: c, path: 'market' }));
	for (const uplayer of fen.plorder) {
		let pl = fen.players[uplayer];
		let stall = pl.stall;
		stall.map(x => res.push({ key: x, path: `players.${uplayer}.stall` }));
	}
	return res;
}
function ari_get_all_trading_cards_orig(otree) {
	let res = [];
	let plcardlists = otree.plorder.map(x => otree[x].stall);
	plcardlists.map(x => x.map(c => res.push[{ c: c, owner: x }]));
	otree.market.map(c => res.push({ c: c, owner: 'market' }));
	return res;
}
function ari_get_all_wrong_building_cards(fen, uplayer) {
	let res = [];
	let pl = fen.players[uplayer];
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
function ari_get_building_type(obuilding) { let n = obuilding.list.length; return n == 4 ? 'farm' : n == 5 ? 'estate' : 'chateau'; }
function ari_get_card(ckey, h, w, ov = .3) {
	let type = ckey[2];
	let sz = { largecard: 100, smallcard: 50 };
	let info = type == 'n' ? to_aristocard(ckey, sz.largecard) : type == 'l' ? to_luxurycard(ckey, sz.largecard) : type == 'r' ? to_rumorcard(ckey, sz.smallcard) : to_commissioncard(ckey, sz.smallcard);
	let card = cardFromInfo(info, h, w, ov);
	if (type == 'l') luxury_card_deco(card);
	return card;
}
function ari_get_card_large(ckey, h, w, ov = .2) {
	let type = ckey[2];
	let sz = { largecard: 120, smallcard: 80 };
	let info = type == 'n' ? to_aristocard(ckey, sz.largecard) : type == 'l' ? to_luxurycard(ckey, sz.largecard) : type == 'r' ? to_rumorcard(ckey, sz.smallcard) : to_commissioncard(ckey, sz.smallcard);
	let card = cardFromInfo(info, h, w, ov);
	if (type == 'l') luxury_card_deco(card);
	return card;
}
function ari_get_cardinfo(ckey) { return Aristocards[ckey]; }
function ari_get_correct_buildings(buildings) {
	let bcorrect = { farm: [], estate: [], chateau: [] };
	for (const type in buildings) {
		for (const b of buildings[type]) {
			let list = b.list;
			let lead = list[0];
			let iscorrect = true;
			for (const key of arrFromIndex(list, 1)) {
				if (key[0] != lead[0]) { iscorrect = false; continue; }
			}
			if (iscorrect) {
				lookupAddIfToList(bcorrect, [type], b);
			}
		}
	}
	return bcorrect;
}
function ari_get_fictive_vps(fen, uname) {
	let pl = fen.players[uname];
	let bs = pl.buildings;
	let vps = calc_building_vps(bs);
	return vps;
}
function ari_get_first_tax_payer(fen, pl_tax) { return ari_get_tax_payer(fen, pl_tax, 0); }
function ari_get_max_journey_length(fen, uplayer) {
	let pl = fen.players[uplayer];
	let sorted_journeys = sortByDescending(pl.journeys.map(x => ({ arr: x, len: x.length })), 'len');
	return isEmpty(pl.journeys) ? 0 : sorted_journeys[0].len;
}
function ari_get_player_hand_and_stall(fen, uplayer) {
	let res = [];
	res = res.concat(fen.players[uplayer].hand);
	res = res.concat(fen.players[uplayer].stall);
	return res;
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
function ari_get_tax_payer(fen, pl_tax, ifrom = 0) {
	let iturn = ifrom;
	let uplayer = fen.plorder[iturn];
	if (nundef(uplayer)) return null;
	while (pl_tax[uplayer] <= 0) {
		iturn++;
		if (iturn >= fen.plorder.length) return null;
		uplayer = fen.plorder[iturn];
	}
	return uplayer;
}
function ari_get_vps(otree, uname) {
	if (uname == otree.plturn) {
		return calc_building_vps(otree, uname);
	} else {
		return calc_building_vps(otree, uname);
	}
}
function ari_globalize(g, uname) {
	DA.uname = uname; DA.g = g;
	z = {};
	z.A = { level: 0, di: {}, ll: [], items: [], selected: [], tree: null, breadcrumbs: [], sib: [], command: null };
	copyKeys(DA.g, z);
	copyKeys(jsCopy(DA.g.fen), z);
	copyKeys(UI, z);
	z.uname = uname;
}
function ari_history_list(lines, title = '', fen) {
	if (nundef(fen)) fen = Z.fen;
	if (nundef(fen.history)) fen.history = [];
	fen.history.push({ title: title, lines: lines });
}
function ari_make_cardlist(list, splay, dParent) {
	let id = getUID('u');
	let d = mDiv(dParent, { bg: 'random', padding: 10 }, id);
	let items = list.map(x => ari_get_card(x));
	let [w, h] = [items[0].w, items[0].h];
	items.map(x => mAppend(d, iDiv(x)));
	mContainerSplay(d, splay, w, h, items.length, 20);
	items.map(x => mItemSplay(x, list, splay));
	return d;
}
function ari_make_selectable(item, dParent, dInstruction) {
	let A = Z.A;
	switch (item.itemtype) {
		case 'card': make_card_selectable(item); break;
		case 'container': make_container_selectable(item); break;
		case 'string': make_string_selectable(item); break;
	}
}
function ari_make_selected(item) {
	let A = Z.A;
	switch (item.itemtype) {
		case 'card': make_card_selected(item); break;
		case 'container': make_container_selected(item); break;
		case 'string': make_string_selected(item); break;
	}
}
function ari_make_unselectable(item) {
	let A = Z.A;
	switch (item.itemtype) {
		case 'card': make_card_unselectable(item); break;
		case 'container': make_container_unselectable(item); break;
		case 'string': make_string_unselectable(item); break;
	}
}
function ari_make_unselected(item) {
	let A = Z.A;
	switch (item.itemtype) {
		case 'card': make_card_unselected(item); break;
		case 'container': make_container_unselected(item); break;
		case 'string': make_string_unselected(item); break;
	}
}
function ari_move_herald(fen) {
	fen.heraldorder = arrCycle(fen.heraldorder, 1);
	ari_history_list([`*** new herald: ${fen.heraldorder[0]} ***`], 'herald');
	return fen.heraldorder[0];
}
function ari_move_market_to_discard() {
	let fen = Z.fen;
	while (fen.market.length > 0) {
		elem_from_to_top(fen.market[0], fen.market, fen.deck_discard);
	}
	ari_reorg_discard();
}
function ari_move_stalls_to_hands() {
	let fen = Z.fen;
	for (const uplayer of fen.plorder) {
		fen.players[uplayer].hand = fen.players[uplayer].hand.concat(fen.players[uplayer].stall);
		fen.players[uplayer].stall = [];
	}
}
function ari_next_action() {
	let [fen, uplayer] = [Z.fen, Z.uplayer];
	deactivate_ui();
	console.assert(isdef(Z.num_actions));
	fen.num_actions -= 1;
	fen.action_number += 1;
	if (fen.num_actions <= 0) {
		fen.total_pl_actions = 0;
		lookupAddIfToList(fen, ['actionsCompleted'], uplayer);
		let next = ari_select_next_player_according_to_stall_value(fen);
		if (!next) {
			ari_next_phase();
		} else {
			Z.turn = [next];
		}
	} else {
		Z.stage = 5;
	}
	take_turn_fen();
}
function ari_next_phase() {
	let [fen, uplayer] = [Z.fen, Z.uplayer];
	ari_move_market_to_discard();
	ari_move_stalls_to_hands();
	ari_add_hand_card();
	delete fen.actionsCompleted;
	delete fen.stallSelected;
	Z.turn = [fen.plorder[0]];
	if (Z.stage == 10) {
		Z.phase = 'queen';
		[Z.stage, Z.turn] = set_journey_or_stall_stage(fen, Z.options, Z.phase);
	} else if (fen.phase == 'king') {
		fen.pl_gameover = [];
		for (const plname of fen.plorder) {
			let bcorrect = ari_get_correct_buildings(fen.players[plname].buildings);
			let can_end = ari_check_end_condition(bcorrect);
			if (can_end) fen.pl_gameover.push(plname);
		}
		if (!isEmpty(fen.pl_gameover)) {
			Z.stage = 10;
			Z.turn = [fen.pl_gameover[0]];
		} else {
			Z.phase = 'queen';
			[Z.stage, Z.turn] = set_journey_or_stall_stage(fen, Z.options, Z.phase);
		}
	} else if (fen.phase == 'queen') {
		for (const uplayer of fen.plorder) {
			for (const k in fen.players[uplayer].buildings) {
				if (k == 'farm') continue;
				let n = fen.players[uplayer].buildings[k].length;
				fen.players[uplayer].coins += n;
				if (n > 0) ari_history_list([`${uplayer} gets ${n} coins for ${k} buildings`], 'payout');
			}
		}
		Z.phase = 'jack';
		[Z.stage, Z.turn] = set_journey_or_stall_stage(fen, Z.options, Z.phase);
	} else {
		fen.herald = ari_move_herald(fen, uplayer);
		fen.plorder = jsCopy(fen.heraldorder);
		ari_add_harvest_cards(fen);
		Z.phase = 'king';
		let taxneeded = ari_tax_phase_needed(fen);
		Z.turn = taxneeded ? fen.turn : [fen.herald];
		if (taxneeded) Z.stage = 2; else[Z.stage, Z.turn] = set_journey_or_stall_stage(fen, Z.options, Z.phase);
	}
	return Z.stage;
}
function ari_open_market(fen, phase, deck, market) {
	DA.qanim = [];
	let n_market = phase == 'jack' ? 3 : 2;
	fen.stage = Z.stage = phase == 'jack' ? 12 : phase == 'queen' ? 11 : 4;
	fen.stallSelected = [];
	delete fen.passed;
	for (let i = 0; i < n_market; i++) {
		DA.qanim.push([qanim_flip_topmost, [deck]]);
		DA.qanim.push([qanim_move_topmost, [deck, market]]);
		DA.qanim.push([q_move_topmost, [deck, market]]);
	}
	DA.qanim.push([q_mirror_fen, ['deck', 'market']]);
	DA.qanim.push([ari_pre_action, []]);
	qanim();
}
function ari_open_rumors(stage = 28) {
	let [fen, deck] = [Z.fen, UI.deck_rumors];
	DA.qanim = [];
	fen.stage = Z.stage = stage;
	let n = Math.min(2, fen.deck_rumors.length);
	let cards = arrTake(fen.deck_rumors, n);
	let uicards = cards.map(x => ari_get_card(x));
	let dest = UI.rumor_top = ui_type_market([], deck.container.parentNode, { maleft: 12 }, `rumor_top`, 'rumor_top', ari_get_card);
	mMagnifyOnHoverControlPopup(dest.cardcontainer);
	for (let i = 0; i < n; i++) {
		DA.qanim.push([qanim_flip_topmost, [deck]]);
		DA.qanim.push([qanim_move_topmost, [deck, dest]]);
		DA.qanim.push([q_move_topmost, [deck, dest]]);
	}
	DA.qanim.push([q_mirror_fen, ['deck_rumors', 'rumor_top']]);
	DA.qanim.push([ari_pre_action, []]);
	qanim();
}
function ari_payment(rank = 'king') {
	if (A.payment_complete == true) return true;
	let [otree, plturn] = [G.otree, G.otree.plturn];
	let items = a2_get_build_items(plturn);
	let pay_letter = rank.toUpperCase()[0];
	let pay_cards = items.filter(x => x.key[0] == pay_letter);
	let has_pay_card = !isEmpty(pay_cards);
	if (has_pay_card && otree[plturn].coins > 0 && otree.phase == rank) {
		otree.stage = 20;
		let items = pay_cards;
		items.push({ o: null, a: 'coin', key: 'coin', friendly: 'coin', path: null });
		let i = 0; items.map(x => { x.index = i; i++; });
		a2_add_selection(items, 'payment', 1, 1, false);
		return false;
	} else if (has_pay_card && pay_cards.length > 1) {
		otree.stage = 20;
		let items = pay_cards;
		let i = 0; items.map(x => { x.index = i; i++; });
		a2_add_selection(items, 'payment', 1, 1, false);
		return false;
	} else if (has_pay_card) {
		console.assert(otree[plturn].coins == 0 || otree.phase != rank, 'HAS A COIN in matching phase!!!!');
		let k = pay_cards[0];
		a2_pay_with_card(k);
		return true;
	} else {
		a2_pay_with_coin(plturn);
		return true;
	}
}
function ari_player_stats(otree) {
	let player_stat_items = G.player_stat_items = ui_player_info(otree.plorder.map(x => otree[x]));
	let herald = otree.plorder[0];
	for (const uname of otree.plorder) {
		let pl = otree[uname];
		let item = player_stat_items[uname];
		let d = iDiv(item); mCenterFlex(d); mLinebreak(d);
		if (uname == herald) {
			mSym('tied-scroll', d, { fg: 'gold', fz: 24 }, 'TL');
		}
		player_stat_count('coin', pl.coins, d);
		if (!isEmpty(otree[uname].stall) && otree.stage >= 5 && otree.stage <= 6) {
			player_stat_count('shinto shrine', !otree.round.includes(uname) || otree.stage < 6 ? calc_stall_value(otree, uname) : '_', d);
		}
		player_stat_count('star', ari_get_vps(otree, uname), d);
	}
}
function ari_post_action() {
	clearElement(dError);
	let otree = G.otree;
	let [step, stage, iturn, round, phase, plturn] = set_state_numbers(otree);
	let [deck, market, discard, open_discard] = [G.deck, G.market, G.deck_discard, G.open_discard];
	if (stage == 2) {
		let items = A.selected.map(x => A.items[x]);
		let n = otree.pl_tax[plturn];
		if (items.length != n) {
			output_error(`please select exactly ${n} cards`);
			return;
		}
		for (const item of items) {
			elem_from_to_top(item.key, otree[plturn].hand, otree.deck_discard);
		}
		ari_reorg_discard(otree);
		let [iturn, plnext] = ari_get_tax_payer(otree, otree.pl_tax, otree.iturn + 1);
		if (iturn == null) {
			otree.stage = 3;
			otree.iturn = 0;
			delete otree.pl_tax;
		} else {
			otree.iturn = iturn;
		}
		otree.plturn = otree.plorder[otree.iturn];
		turn_send_move_update(otree, plturn);
	} else if (stage == 3) {
		console.assert(false, 'NO SHOULD NOT COME TO POST STATE 3');
	} else if (stage == 4) {
		let selectedKeys = A.selected.map(i => A.items[i].key);
		for (const ckey of selectedKeys) {
			elem_from_to(ckey, otree[plturn].hand, otree[plturn].stall);
		}
		otree.round.push(plturn);
		if (is_round_over(otree)) {
			otree.round = [];
			let next = ari_select_next_player_according_to_stall_value(otree);
			if (!next) { ari_next_action(otree, plturn); return; }
		} else {
			otree.iturn++;
		}
		otree.plturn = otree.plorder[otree.iturn];
		turn_send_move_update(otree, plturn);
	} else if (stage == 6 && A.selected_key == 'trade') {
		if (A.selected.length != 2) {
			output_error('please, select exactly 2 cards!');
			return;
		}
		let i0 = A.items[A.selected[0]];
		let i1 = A.items[A.selected[1]];
		if (i0.path == i1.path) {
			output_error('you cannot trade cards from the same group');
			return;
		} else {
			a2_exchange_items(otree, i0, i1);
			ari_next_action(otree, plturn);
		}
	} else if (stage == 6 && A.selected_key == 'repair') {
		if (A.selected.length != 2) {
			output_error('please, select exactly 2 cards!');
			return;
		}
		let i0 = A.items[A.selected[0]];
		let i1 = A.items[A.selected[1]];
		let [p0, p1] = [i0.path, i1.path];
		if (p0.includes('build') == p1.includes('build')) {
			output_error('select exactly one building card and one of your hand or stall cards!');
			return;
		}
		a2_exchange_items(otree, i0, i1);
		console.log('repair items', i0, i1);
		let ibuilding = p0.includes('build') ? i0 : i1;
		let obuilding = lookup(otree, stringBeforeLast(ibuilding.path, '.').split('.'));
		console.log('obuilding', obuilding);
		obuilding.schwein = null;
		ari_next_action(otree, plturn);
	} else if (stage == 6 && A.command == 'build') {
		console.log('should have paid for building!', otree[plturn].coins);
		if (A.selected.length < 4 || A.selected.length > 6) {
			output_error('select 4, 5, or 6 cards to build!');
			return;
		}
		ari_complete_building();
	} else if (stage == 6 && A.command == 'upgrade') {
		let n = A.selected.length;
		if (n > 2 || n == 2 && !has_farm(plturn)) {
			output_error('too many cards selected!');
			return;
		} else if (n == 0) {
			output_error('please select hand or stall card(s) to upgrade!');
			return;
		}
		A.upgrade_cards = A.selected.map(x => A.items[x]);
		otree.stage = 102;
		let b_items = a2_get_farms_estates_items(plturn);
		a2_add_selection(b_items, 'buildings', 1, 1);
	} else if (stage == 102) {
		A.building = A.items[A.selected[0]];
		ari_complete_upgrade();
	} else if (stage == 6 && A.command == 'downgrade') {
		A.building = A.items[A.selected[0]];
		otree.stage = 103;
		let items = a2_get_hidden_building_items(A.building.o);
		items.map(x => face_up(x.o));
		A.possible_downgrade_cards = items;
		a2_add_selection(items, 'downgrade cards');
	} else if (stage == 103) {
		A.downgrade_cards = A.selected.map(x => A.items[x]);
		let obuilding = lookup(otree, A.building.path.split('.'));
		let n = obuilding.list.length;
		let nremove = A.downgrade_cards.length;
		let nfinal = n - nremove;
		let type = A.building.o.type;
		let list = otree[plturn].buildings[type];
		removeInPlace(list, obuilding);
		let cards = A.downgrade_cards.map(x => x.key);
		if (nfinal < 4) {
			otree[plturn].hand = otree[plturn].hand.concat(obuilding.list);
		} else if (nfinal == 4) {
			otree[plturn].buildings.farms.push(obuilding);
			otree[plturn].hand = otree[plturn].hand.concat(cards);
		} else if (nfinal == 5) {
			otree[plturn].buildings.estates.push(obuilding);
			otree[plturn].hand = otree[plturn].hand.concat(cards);
		} else if (nfinal == 6) {
			otree[plturn].buildings.chateaus.push(obuilding);
			otree[plturn].hand = otree[plturn].hand.concat(cards);
		}
		A.downgrade_cards.map(x => removeInPlace(obuilding.list, x.key));
		ari_next_action(otree, plturn);
	} else if (stage == 6 && A.command == 'buy') {
		let item = A.items[A.selected[0]];
		elem_from_to(item.key, otree.open_discard, otree[plturn].hand);
		ari_reorg_discard(otree);
		ari_next_action(otree, plturn);
	} else if (stage == 6 && A.command == 'visit') {
		let item = A.items[A.selected[0]];
		console.log('building to inspect', item);
		let obuilding = lookup(otree, item.path.split('.'));
		let owner = stringBefore(item.path, '.');
		if (isdef(obuilding.schwein)) {
			let res = confirm('destroy the building?');
			if (!res) {
				if (otree[owner].coins > 0) {
					otree[owner].coins -= 1;
					otree[plturn].coins += 1;
				}
			} else {
				let list = obuilding.list;
				console.log('!!!!!!!!!!!!!building', obuilding, 'DESTROY!!!!!!!!!!!!!!!!', '\nlist', list);
				let correct_key = list[0];
				let rank = correct_key[0];
				while (list.length > 0) {
					let ckey = list[0];
					if (ckey[0] != rank) {
						elem_from_to_top(ckey, list, otree.deck_discard);
					} else {
						elem_from_to(ckey, list, otree[owner].hand);
					}
				}
				if (isdef(obuilding.harvest)) {
					otree.deck_discard.unshift(obuilding.harvest);
				}
				ari_reorg_discard(otree);
				let blist = lookup(otree, stringBeforeLast(item.path, '.').split('.'));
				removeInPlace(blist, obuilding);
			}
		} else {
			let cards = item.o.items;
			let key = cards[0].rank;
			let schweine = false;
			let schwein = null;
			for (const c of cards) {
				if (c.rank != key) { schweine = true; schwein = c.key; face_up(c); break; }
			}
			if (schweine) {
				if (otree[owner].coins > 0) {
					otree[owner].coins--;
					otree[plturn].coins++;
				}
				let b = lookup(otree, item.path.split('.'));
				b.schwein = schwein;
			}
		}
		ari_next_action(otree, plturn);
	} else if (stage == 6 && A.selected_key == 'sell') {
		if (A.selected.length != 2) {
			output_error('select exactly 2 cards to sell!');
			return;
		}
		for (const i of A.selected) {
			let c = A.items[i].key;
			elem_from_to(c, otree[plturn].stall, otree.deck_discard);
		}
		ari_reorg_discard(otree);
		otree[plturn].coins += 1;
		ari_next_action(otree, plturn);
	} else if (stage == 6 && A.command == 'harvest') {
		let item = A.items[A.selected[0]];
		let obuilding = lookup(otree, item.path.split('.'));
		otree[plturn].hand.push(obuilding.h);
		obuilding.h = null;
		ari_next_action(otree, plturn);
	} else if (stage == 100) {
		console.log('pickup', A.selected_key, A.items, A.selected);
		let item = A.items[A.selected[0]];
		elem_from_to(item.key, otree[plturn].stall, otree[plturn].hand);
		ari_next_action(otree, plturn);
	} else if (A.selected_key == 'pass') {
		console.log('HAAAAAAAAAAAAAAAAAAAAAAAAAAAALLLLLLLLLLLLLLLLLLLLLLLLLOOOOOOOOOOOOOOOOO')
		otree.num_actions = 0;
		ari_next_action(otree, plturn);
	} else if (stage == 10) {
		if (A.selected_key == 'end game') {
			for (const uname of otree.plorder) {
				let [bcorrect, realvps] = ari_get_correct_buildings(otree[uname].buildings);
				otree[uname].score = realvps;
			}
			let scores = otree.plorder.map(x => ({ name: x, vps: otree[x].realvps }));
			let sorted = sortByDescending(scores, 'vps');
			ari_reveal_all_buildings(otree);
			otree.winner = sorted[0].name;
			turn_send_gameover(otree, plturn);
		} else {
			let iturn = otree.iturn += 1;
			if (iturn >= otree.pl_gameover.length) {
				delete otree.pl_gameover;
				otree.round = [];
				otree.iturn = 0;
				otree.stage = 3;
				otree.phase = 'queen';
				otree.plturn = otree.plorder[otree.iturn];
				turn_send_move_update(otree, plturn);
			} else {
				otree.plturn = otree.plorder[otree.iturn];
				turn_send_move_update(otree, plturn);
			}
		}
	} else if (stage == 11) {
		let keys = A.selected.map(x => A.items[x]).map(x => x.key);
		keys.map(x => lookupAddIfToList(otree, ['ball', plturn], x));
		keys.map(x => removeInPlace(otree[plturn].hand, x));
		let iturn = otree.iturn += 1;
		if (iturn >= otree.plorder.length) {
			if (isdef(otree.ball)) {
				let all = [];
				for (const c of otree.market) all.push(c);
				for (const uname in otree.ball) for (const c of otree.ball[uname]) all.push(c);
				shuffle(all);
				otree.market = [];
				for (let i = 0; i < 2; i++) top_elem_from_to(all, otree.market);
				for (const uname in otree.ball) for (let i = 0; i < otree.ball[uname].length; i++) top_elem_from_to(all, otree[uname].hand);
				delete otree.ball;
			}
			otree.round = [];
			otree.iturn = 0;
			otree.stage = 4;
			otree.phase = 'queen';
		}
		otree.plturn = otree.plorder[otree.iturn];
		turn_send_move_update(otree, plturn);
	} else if (stage == 12) {
		let keys = A.selected.map(x => A.items[x]);
		keys.map(x => lookupAddIfToList(otree, ['auction', plturn], x));
		let iturn = otree.iturn += 1;
		if (iturn >= otree.plorder.length) {
			let list = dict2list(otree.auction);
			list.map(x => { x.uname = x.id; x.item = x.value[0]; x.amount = Number(x.item.a); });
			list = sortByDescending(list, 'amount');
			let max = list[0].amount;
			let second = otree.second_most = list[1].amount;
			otree.stage = 13;
			let maxplayers = otree.maxplayers = list.filter(x => x.amount == max).map(x => x.uname);
			otree.round = arrMinus(otree.plorder, maxplayers);
			otree.iturn = otree.plorder.indexOf(maxplayers[0]);
		}
		otree.plturn = otree.plorder[otree.iturn];
		turn_send_move_update(otree, plturn);
	} else if (stage == 13) {
		let item = A.selected.map(x => A.items[x])[0];
		lookupSet(otree, ['buy', plturn], item);
		for (const uname of otree.maxplayers) {
			if (!lookup(otree, ['buy', uname])) {
				otree.iturn = otree.plorder.indexOf(uname);
				otree.plturn = otree.plorder[otree.iturn];
				turn_send_move_update(otree, plturn);
				return;
			}
		}
		let buylist = dict2list(otree.buy);
		let discardlist = [];
		for (const uname of otree.maxplayers) {
			let choice = otree.buy[uname];
			let is_unique = !firstCond(buylist, x => x.id != uname && x.value == choice);
			if (is_unique) {
				otree[uname].coins -= otree.second_most;
				elem_from_to(choice.key, otree.market, otree[uname].hand);
			} else addIf(discardlist, choice);
		}
		for (const choice of discardlist) {
			elem_from_to(choice.key, otree.market, otree.deck_discard);
			ari_reorg_discard(otree);
		}
		otree.iturn = 0;
		otree.stage = 4;
		otree.round = [];
		otree.plturn = otree.plorder[otree.iturn];
		turn_send_move_update(otree, plturn);
	}
}
function ari_pre_action() {
	let [stage, A, fen, phase, uplayer, deck, market] = [Z.stage, Z.A, Z.fen, Z.phase, Z.uplayer, Z.deck, Z.market];
	if (Z.num_actions > 0) fen.progress = `(action ${Z.action_number} of ${Z.total_pl_actions})`; else delete fen.progress;
	show_stage();
	switch (ARI.stage[stage]) {
		case 'action: command': Z.stage = 6; select_add_items(ui_get_commands(uplayer), process_command, 'must select an action', 1, 1); break;
		case 'action step 2':
			switch (A.command) {
				case 'trade': select_add_items(ui_get_trade_items(uplayer), post_trade, 'must select 2 cards to trade', 2, 2); break;
				case 'build': select_add_items(ui_get_payment_items('K'), payment_complete, 'must select payment for building', 1, 1); break;
				case 'upgrade': select_add_items(ui_get_payment_items('K'), payment_complete, 'must select payment for upgrade', 1, 1); break;
				case 'downgrade': select_add_items(ui_get_building_items(uplayer, A.payment), process_downgrade, 'must select a building to downgrade', 1, 1); break;
				case 'pickup': select_add_items(ui_get_stall_items(uplayer), post_pickup, 'must select a stall card to take into your hand', 1, 1); break;
				case 'harvest': select_add_items(ui_get_harvest_items(uplayer), post_harvest, 'must select a farm to harvest from', 1, 1); break;
				case 'sell': select_add_items(ui_get_stall_items(uplayer), post_sell, 'must select 2 stall cards to sell', 2, 2); break;
				case 'buy': select_add_items(ui_get_payment_items('J'), payment_complete, 'must select payment option', 1, 1); break;
				case 'buy rumor': ari_open_rumors(); break;
				case 'exchange': select_add_items(ui_get_exchange_items(uplayer), post_exchange, 'must select cards to exchange', 2, 2); break;
				case 'visit': select_add_items(ui_get_payment_items('Q'), payment_complete, 'must select payment for visiting', 1, 1); break;
				case 'rumor': select_add_items(ui_get_other_buildings_and_rumors(uplayer), process_rumor, 'must select a building and a rumor card to place', 2, 2); break;
				case 'inspect': select_add_items(ui_get_other_buildings(uplayer), process_inspect, 'must select building to visit', 1, 1); break;
				case 'blackmail': select_add_items(ui_get_payment_items('Q'), payment_complete, 'must select payment for blackmailing', 1, 1); break;
				case 'commission': select_add_items(ui_get_commission_items(uplayer), process_commission, 'must select a card to commission', 1, 1); break;
				case 'pass': post_pass(); break;
			}
			break;
		case 'pick_schwein': select_add_items(ui_get_schweine_candidates(A.uibuilding), post_inspect, 'must select the new schwein', 1, 1); break;
		case 'comm_weitergeben': if (!is_playerdata_set(uplayer)) select_add_items(ui_get_all_commission_items(uplayer), process_comm_setup, `must select ${fen.comm_setup_num} card${fen.comm_setup_num > 1 ? 's' : ''} to discard`, fen.comm_setup_num, fen.comm_setup_num); break;
		case 'rumors_weitergeben':
			let rumitems = ui_get_rumors_and_players_items(uplayer);
			if (isEmpty(rumitems)) {
				show_waiting_message('waiting for other players...');
				Z.state = null;
				let done = rumor_playerdata_complete();
				if (done) {
					Z.turn = [Z.host];
					Z.stage = 105; //'next_rumors_setup_stage';
					clear_transaction();
					take_turn_fen();
				} else autopoll();
			} else select_add_items(rumitems, process_rumors_setup, `must select a player and a rumor to pass on`, 2, 2);
			break;
		case 'next_rumor_setup_stage': post_rumor_setup(); break;
		case 'buy rumor': select_add_items(ui_get_top_rumors(), post_buy_rumor, 'must select one of the new rumor cards', 1, 1); break;
		case 'rumor discard': select_add_items(ui_get_rumors_items(uplayer), process_rumor_discard, 'must select a rumor card to discard', 1, 1); break;
		case 'rumor_both': select_add_items(ui_get_top_rumors(), post_rumor_both, 'must select one of the new rumor cards', 1, 1); break;
		case 'blackmail': select_add_items(ui_get_other_buildings_with_rumors(uplayer), process_blackmail, 'must select a building to blackmail', 1, 1); break;
		case 'blackmail_owner': select_add_items(ui_get_blackmailed_items(), being_blackmailed, 'must react to BLACKMAIL!!!', 1, 1); break;
		case 'accept_blackmail': select_add_items(ui_get_stall_items(uplayer), post_accept_blackmail, 'must select a card to pay off blackmailer', 1, 1); break;
		case 'blackmail_complete': post_blackmail(); break;
		case 'journey': select_add_items(ui_get_hand_and_journey_items(uplayer), process_journey, 'may form new journey or add cards to existing one'); break;
		case 'add new journey': post_new_journey(); break;
		case 'auto market': ari_open_market(fen, phase, deck, market); break;
		case 'TEST_starts_in_stall_selection_complete':
			if (is_stall_selection_complete()) {
				delete fen.stallSelected;
				fen.actionsCompleted = [];
				if (check_if_church()) ari_start_church_stage(); else ari_start_action_stage();
			} else select_add_items(ui_get_hand_items(uplayer), post_stall_selected, 'must select your stall'); break;
		case 'stall selection': select_add_items(ui_get_hand_items(uplayer), post_stall_selected, 'must select cards for stall'); break;
		case 'church': select_add_items(ui_get_hand_and_stall_items(uplayer), post_tithe, `must select cards to tithe ${isdef(fen.tithemin) ? `(current minimum is ${fen.tithemin})` : ''}`, 1, 100); break;
		case 'church_minplayer_tithe_add': select_add_items(ui_get_hand_and_stall_items(uplayer), post_tithe_minimum, `must select cards to reach at least ${fen.tithe_minimum}`, 1, 100); break;
		case 'church_minplayer_tithe_downgrade': select_add_items(ui_get_building_items(uplayer, A.payment), process_downgrade, 'must select a building to downgrade', 1, 1); break;
		case 'church_minplayer_tithe': console.log('NOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO');
			let pl = fen.players[uplayer];
			let hst = pl.hand.concat(pl.stall);
			let vals = hst.map(x => ari_get_card(x).val);
			let sum = arrSum(vals);
			let min = fen.tithe_minimum;
			if (sum < min) {
				ari_history_list([`${uplayer} must downgrade a building to tithe ${min}!`], 'downgrade');
				select_add_items(ui_get_building_items(uplayer, A.payment), process_downgrade, 'must select a building to downgrade', 1, 1);
			} else {
				ari_history_list([`${uplayer} must tithe more cards to reach ${min}!`], 'tithe');
				select_add_items(ui_get_hand_and_stall_items(uplayer), post_tithe_minimum, `must select cards to reach at least ${fen.tithe_minimum}`, 1, 100);
			}
			break;
		case 'church_newcards':
			reveal_church_cards();
			let items = ui_get_church_items(uplayer);
			let num_select = items.length == fen.church.length ? 1 : 2;
			let instr = num_select == 1 ? `must select a card for ${fen.candidates[0]}` : 'must select card and player';
			select_add_items(items, post_church, instr, num_select, num_select);
			break;
		case 'complementing_market_after_church':
			select_add_items(ui_get_hand_items(uplayer), post_complementing_market_after_church, 'may complement stall'); break;
		case 'tax': let n = fen.pl_tax[uplayer]; select_add_items(ui_get_hand_items(uplayer), post_tax, `must pay ${n} card${if_plural(n)} tax`, n, n); break;
		case 'build': select_add_items(ui_get_build_items(uplayer, A.payment), post_build, 'must select cards to build (first card determines rank)', 4, 6, true); break;
		case 'commission_stall': select_add_items(ui_get_commission_stall_items(), process_commission_stall, 'must select matching stall card to discard', 1, 1); break;
		case 'commission new': select_add_items(ui_get_commission_new_items(uplayer), post_commission, 'must select a new commission', 1, 1); break;
		case 'upgrade': select_add_items(ui_get_build_items(uplayer, A.payment), process_upgrade, 'must select card(s) to upgrade a building', 1); break;
		case 'select building to upgrade': select_add_items(ui_get_farms_estates_items(uplayer), post_upgrade, 'must select a building', 1, 1); break;
		case 'select downgrade cards': select_add_items(A.possible_downgrade_cards, post_downgrade, 'must select card(s) to downgrade a building', 1, is_in_middle_of_church() ? 1 : 100); break;
		case 'buy': select_add_items(ui_get_open_discard_items(uplayer, A.payment), post_buy, 'must select a card to buy', 1, 1); break;
		case 'visit': select_add_items(ui_get_other_buildings(uplayer, A.payment), process_visit, 'must select a building to visit', 1, 1); break;
		case 'visit destroy': select_add_items(ui_get_string_items(['destroy', 'get cash']), post_visit, 'must destroy the building or select the cash', 1, 1); break;
		case 'ball': select_add_items(ui_get_hand_items(uplayer), post_ball, 'may add cards to the ball'); break;
		case 'auction: bid': select_add_items(ui_get_coin_amounts(uplayer), process_auction, 'must bid for the auction', 1, 1); break;
		case 'auction: buy': select_add_items(ui_get_market_items(), post_auction, 'must buy a card', 1, 1); break;
		case 'end game?': select_add_items(ui_get_endgame(uplayer), post_endgame, 'may end the game here and now or go on!', 1, 1); break;
		case 'pick luxury or journey cards': select_add_items(ui_get_string_items(['luxury cards', 'journey cards']), post_luxury_or_journey_cards, 'must select luxury cards or getting cards from the other end of the journey', 1, 1); break;
		case 'next_comm_setup_stage': select_confirm_weiter(post_comm_setup_stage); break;
		default: console.log('stage is', stage); break;
	}
}
function ari_present(dParent) {
	let [fen, ui, uplayer, stage, pl] = [Z.fen, UI, Z.uplayer, Z.stage, Z.pl];
	let [dOben, dOpenTable, dMiddle, dRechts] = tableLayoutMR(dParent);
	if (fen.num_actions > 0 && (Z.role == 'active' || Z.mode == 'hotseat')) {
		mStyle(dOben, { hmin: 110 })
	}
	ari_stats(dRechts);
	show_history(fen, dRechts);
	let deck = ui.deck = ui_type_deck(fen.deck, dOpenTable, { maleft: 12 }, 'deck', 'deck', ari_get_card);
	let market = ui.market = ui_type_market(fen.market, dOpenTable, { maleft: 12 }, 'market', 'market', ari_get_card, true);
	let open_discard = ui.open_discard = ui_type_market(fen.open_discard, dOpenTable, { maleft: 12 }, 'open_discard', 'discard', ari_get_card);
	let deck_discard = ui.deck_discard = ui_type_deck(fen.deck_discard, dOpenTable, { maleft: 12 }, 'deck_discard', '', ari_get_card);
	if (exp_commissions(Z.options)) {
		let open_commissions = ui.open_commissions = ui_type_market(fen.open_commissions, dOpenTable, { maleft: 12 }, 'open_commissions', 'bank', ari_get_card);
		mMagnifyOnHoverControlPopup(ui.open_commissions.cardcontainer);
		let deck_commission = ui.deck_commission = ui_type_deck(fen.deck_commission, dOpenTable, { maleft: 4 }, 'deck_commission', '', ari_get_card);
		let comm = ui.commissioned = ui_type_rank_count(fen.commissioned, dOpenTable, {}, 'commissioned', 'sentiment', ari_get_card);
		if (comm.items.length > 0) { let isent = arrLast(comm.items); let dsent = iDiv(isent); set_card_border(dsent, 15, 'green'); }
	}
	if (exp_church(Z.options)) {
		let church = ui.church = ui_type_church(fen.church, dOpenTable, { maleft: 28 }, 'church', 'church', ari_get_card);
	}
	if (exp_rumors(Z.options)) {
		let deck_rumors = ui.deck_rumors = ui_type_deck(fen.deck_rumors, dOpenTable, { maleft: 25 }, 'deck_rumors', 'rumors', ari_get_card);
	}
	let uname_plays = fen.plorder.includes(Z.uname);
	let show_first = uname_plays && Z.mode == 'multi' ? Z.uname : uplayer;
	let order = get_present_order();
	for (const plname of order) {
		let pl = fen.players[plname];
		let playerstyles = { w: '100%', bg: '#ffffff80', fg: 'black', padding: 4, margin: 4, rounding: 9, border: `2px ${get_user_color(plname)} solid` };
		let d = mDiv(dMiddle, playerstyles, null, get_user_pic_html(plname, 25));
		mFlexWrap(d);
		mLinebreak(d, 9);
		let hidden = compute_hidden(plname);
		ari_present_player(plname, d, hidden);
	}
	ari_show_handsorting_buttons_for(Z.mode == 'hotseat' ? Z.uplayer : Z.uname); delete Clientdata.handsorting;
	show_view_buildings_button(uplayer);
	let desc = ARI.stage[Z.stage];
	Z.isWaiting = false;
	if (isdef(fen.winners)) ari_reveal_all_buildings(fen);
	else if (desc == 'comm_weitergeben' && is_playerdata_set(uplayer)) {
		if ((Z.mode == 'hotseat' || Z.host == uplayer) && check_resolve()) {
			Z.turn = [Z.host];
			Z.stage = 104; //'next_comm_setup_stage';
		}
		show_waiting_message(`waiting for other players...`);
		Z.isWaiting = true;
	}
}
function ari_present_player(plname, d, ishidden = false) {
	let fen = Z.fen;
	let pl = fen.players[plname];
	let ui = UI.players[plname] = { div: d };
	let hand = ui.hand = ui_type_hand(pl.hand, d, {}, `players.${plname}.hand`, 'hand', ari_get_card);
	if (ishidden) { hand.items.map(x => face_down(x)); }
	let stall = ui.stall = ui_type_market(pl.stall, d, { maleft: 12 }, `players.${plname}.stall`, 'stall', ari_get_card);
	if (fen.stage < 5 && ishidden) { stall.items.map(x => face_down(x)); }
	if (exp_commissions(Z.options)) {
		if (!ishidden) pl.commissions = correct_handsorting(pl.commissions, plname);
		ui.commissions = ui_type_market(pl.commissions, d, { maleft: 12 }, `players.${plname}.commissions`, 'commissions', Z.stage == 23 ? ari_get_card_large : ari_get_card);
		if (ishidden) { ui.commissions.items.map(x => face_down(x)); }
		else mMagnifyOnHoverControlPopup(ui.commissions.cardcontainer);
	}
	if (exp_rumors(Z.options)) {
		if (!ishidden) pl.rumors = correct_handsorting(pl.rumors, plname);
		ui.rumors = ui_type_market(pl.rumors, d, { maleft: 12 }, `players.${plname}.rumors`, 'rumors', Z.stage == 24 ? ari_get_card_large : ari_get_card);
		if (ishidden) { ui.rumors.items.map(x => face_down(x)); }
		else mMagnifyOnHoverControlPopup(ui.rumors.cardcontainer);
	}
	ui.journeys = [];
	let i = 0;
	for (const j of pl.journeys) {
		let jui = ui_type_hand(j, d, { maleft: 12 }, `players.${plname}.journeys.${i}`, '', ari_get_card);
		i += 1;
		ui.journeys.push(jui);
	}
	mLinebreak(d, 8);
	ui.buildinglist = [];
	ui.indexOfFirstBuilding = arrChildren(d).length;
	for (const k in pl.buildings) {
		let i = 0;
		for (const b of pl.buildings[k]) {
			let type = k;
			let b_ui = ui_type_building(b, d, { maleft: 8 }, `players.${plname}.buildings.${k}.${i}`, type, ari_get_card, true, ishidden);
			b_ui.type = k;
			ui.buildinglist.push(b_ui);
			if (b.isblackmailed) { mStamp(b_ui.cardcontainer, 'blackmail'); }
			lookupAddToList(ui, ['buildings', k], b_ui);
			i += 1;
		}
	}
}
function ari_redo_player_stats(otree, uname) {
	let item = G.player_stat_items[uname];
	let d = iDiv(item);
	let stall_value = otree[uname].stall_value;
	mRemoveChildrenFromIndex(d, otree.herald == uname ? 3 : 2);
	let pl = otree[uname];
	player_stat_count('coin', pl.coins, d);
	if (isdef(stall_value)) { player_stat_count('shinto shrine', stall_value, d); }
	player_stat_count('star', ari_get_vps(otree, uname), d);
}
function ari_redo_player_ui(otree, plturn) {
	let d = G[plturn].hand.container.parentNode;
	d.innerHTML = plturn;
	ari_present_player(otree, plturn, d);
}
function ari_refill_deck(fen) {
	fen.deck = fen.deck.concat(fen.open_discard).concat(fen.deck_discard);
	shuffle(fen.deck);
	fen.open_discard = [];
	fen.deck_discard = [];
	console.log('deck refilled: contains', fen.deck.length, 'cards');
}
function ari_reorg_discard() {
	let fen = Z.fen;
	while (fen.deck_discard.length > 0 && fen.open_discard.length < 4) {
		bottom_elem_from_to(fen.deck_discard, fen.open_discard);
	}
}
function ari_reveal_all_buildings(fen) {
	for (const plname of fen.plorder) {
		let gbs = UI.players[plname].buildinglist;
		for (const gb of gbs) {
			gb.items.map(x => face_up(x));
		}
	}
}
function ari_select_next_player_according_to_stall_value() {
	let [stage, A, fen, uplayer] = [Z.stage, Z.A, Z.fen, Z.uplayer];
	Z.stage = 5;
	let minval = 100000;
	let minplayer = null;
	for (const uname of fen.plorder) {
		if (fen.actionsCompleted.includes(uname)) continue;
		let stall = fen.players[uname].stall;
		if (isEmpty(stall)) { fen.actionsCompleted.push(uname); continue; }
		let val = fen.players[uname].stall_value = arrSum(stall.map(x => ari_get_card(x).val));
		if (val < minval) { minval = val; minplayer = uname; }
	}
	if (!minplayer) {
		return null;
	} else {
		Z.turn = fen.turn = [minplayer];
		fen.num_actions = fen.total_pl_actions = fen.players[minplayer].stall.length;
		fen.action_number = 1;
		return minplayer;
	}
}
function ari_setup(player_names) {
	let pre_fen = {};
	let deck = pre_fen.deck = get_keys(Aristocards).filter(x => 'br'.includes(x[2]));
	shuffle(deck);
	pre_fen.market = [];
	pre_fen.deck_discard = [];
	pre_fen.open_discard = [];
	let pls = pre_fen.players = {};
	for (const plname of player_names) {
		let pl = pls[plname] = {
			hand: deck_deal(deck, 7),
			buildings: { farms: [], estates: [], chateaus: [] },
			stall: [],
			stall_value: 0,
			coins: 3,
			vps: 0,
			score: 0,
		};
	}
	pre_fen.plorder = jsCopy(player_names);
	pre_fen.herald = player_names[0];
	pre_fen.phase = 'king';
	pre_fen.stage = 3;
	pre_fen.iturn = 0;
	pre_fen.plturn = pre_fen.plorder[pre_fen.iturn];
	pre_fen.round = [];
	pre_fen.step = 0;
	let fen = pre_fen;
	return fen;
}
function ari_show_building(otree, uname, building_cards) {
	DA.qanim = [
		[anim_from_deck_to_marketX, [deck, market]],
		[anim_from_deck_to_marketX, [deck, market]],
		[update_otree_from_ui, [otree, { deck: deck, market: market }]],
		[ari_pre_action, []],
	];
	qanim();
}
function ari_show_deck(list, dParent) {
	let id = getUID('u');
	let d = mDiv(dParent, { bg: 'random', padding: 10 }, id);
	console.log('list', list);
	let items = list.map(x => ari_get_card(x));
	let [w, h] = [items[0].w, items[0].h];
	console.log('cards', w, h, items);
	items.map(x => mAppend(d, iDiv(x)));
	mContainerSplay(d, splay, w, h, items.length, 20);
	items.map(x => mItemSplay(x, list, splay));
	return d;
}
function ari_show_handsorting_buttons_for(plname) {
	if (Z.role == 'spectator' || isdef(mBy('dHandButtons'))) return;
	let fen = Z.fen;
	let pl = fen.players[plname];
	if (pl.hand.length <= 1) return;
	let d = UI.players[plname].hand.container; mStyle(d, { position: 'relative' });
	let dHandButtons = mDiv(d, { position: 'absolute', bottom: -2, left: 52, height: 25 }, 'dHandButtons');
	show_player_button('sort', dHandButtons, onclick_by_rank);
}
function ari_start_action_stage() {
	let next = ari_select_next_player_according_to_stall_value();
	if (!next) { ari_next_phase(); }
	take_turn_fen();
}
function ari_start_church_stage() {
	let [fen] = [Z.fen];
	let order = fen.plorder = fen.church_order = determine_church_turn_order();
	[Z.turn, Z.stage] = [[order[0]], 17];
	ari_history_list([`inquisition starts!`], 'church');
	take_turn_fen();
}
function ari_state(dParent) {
	function get_phase_html() {
		if (isEmpty(Z.phase) || Z.phase == 'over') return null;
		let rank = Z.phase[0].toUpperCase();
		let card = ari_get_card(rank + 'Hn', 40);
		let d = iDiv(card);
		mClassRemove(d.firstChild, 'card');
		return iDiv(card).outerHTML;
	}
	if (DA.TEST0 == true) {
		let html = `${Z.stage}`;
		if (isdef(Z.playerdata)) {
			let trigger = get_multi_trigger();
			if (trigger) html += ` trigger:${trigger}`;
			for (const data of Z.playerdata) {
				if (data.name == trigger) continue;
				let name = data.name;
				let state = data.state;
				let s_state = object2string(state);
				html += ` ${name}:'${s_state}'`;
			}
			dParent.innerHTML += ` ${Z.playerdata.map(x => x.name)}`;
		}
		dParent.innerHTML = html;
		return;
	}
	let user_html = get_user_pic_html(Z.uplayer, 30);
	let phase_html = get_phase_html();
	let html = '';
	if (phase_html) html += `${Z.phase}:&nbsp;${phase_html}`;
	if (Z.stage == 17) { html += `&nbsp;&nbsp;CHURCH EVENT!!!`; }
	else if (TESTING) { html += `&nbsp;&nbsp;&nbsp;stage: ${ARI.stage[Z.stage]}`; }
	else html += `&nbsp;player: ${user_html} `;
	dParent.innerHTML = html;
}
function ari_stats(dParent) {
	let player_stat_items = UI.player_stat_items = ui_player_info(dParent);
	let fen = Z.fen;
	let herald = fen.heraldorder[0];
	for (const plname in fen.players) {
		let pl = fen.players[plname];
		let item = player_stat_items[plname];
		let d = iDiv(item); mCenterFlex(d); mLinebreak(d);
		if (plname == herald) {
			mSym('tied-scroll', d, { fg: 'gold', fz: 24, padding: 4 }, 'TR');
		}
		if (exp_church(Z.options)) {
			if (isdef(pl.tithes)) {
				player_stat_count('cross', pl.tithes.val, d);
			}
		}
		let dCoin = player_stat_count('coin', pl.coins, d);
		item.dCoin = dCoin.firstChild;
		item.dAmount = dCoin.children[1];
		let list = pl.hand.concat(pl.stall);
		let list_luxury = list.filter(x => x[2] == 'l');
		player_stat_count('pinching hand', list.length, d);
		let d1 = player_stat_count('hand-holding-usd', list_luxury.length, d);
		mStyle(d1.firstChild, { fg: 'gold', fz: 20 })
		if (!isEmpty(fen.players[plname].stall) && fen.stage >= 5 && fen.stage <= 6) {
			player_stat_count('shinto shrine', !fen.actionsCompleted.includes(plname) || fen.stage < 6 ? calc_stall_value(fen, plname) : '_', d);
		}
		player_stat_count('star', plname == U.name || isdef(fen.winners) ? ari_calc_real_vps(fen, plname) : ari_calc_fictive_vps(fen, plname), d);
		if (fen.turn.includes(plname)) {
			show_hourglass(plname, d, 30, { left: -3, top: 0 }); //'calc( 50% - 36px )' });
		}
	}
}
function ari_tax_phase_needed(fen) {
	let pl_tax = {};
	let need_tax_phase = false;
	for (const uplayer of fen.plorder) {
		let hsz = fen.players[uplayer].hand.length;
		let nchateaus = fen.players[uplayer].buildings.chateau.length;
		let allowed = ARI.sz_hand + nchateaus;
		let diff = hsz - allowed;
		if (diff > 0) need_tax_phase = true;
		pl_tax[uplayer] = diff;
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
function ari_test_hand_to_discard(fen, uname, keep = 0) {
	let list = fen.players[uname].hand;
	while (fen.open_discard.length < 4 && list.length > keep) top_elem_from_to(list, fen.open_discard);
	while (list.length > keep) top_elem_from_to(list, fen.deck_discard);
}
function ari_ui_player(otree, uname, dParent) {
	let dPlayer = ui_make_player(otree, uname, dParent);
	let dHand = ari_make_cardlist(otree[uname].hand, 2, dPlayer);
}
function ari_ut0_create_staged() {
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'leo'];
	let fen = ari_setup(player_names);
	for (const uname in fen.players) {
		let pl = fen.players[uname];
		while (!isEmpty(pl.hand)) last_elem_from_to(pl.hand, fen.deck);
	}
	fen.players.mimi.hand = 'AHb ADb 2Cb 4Cb 6Cb KCb QDb'.split(' ');
	fen.players.leo.hand = 'ACb ASb 2Db 4Db 6Db KDb QSb'.split(' ');
	fen.players.mimi.buildings.farms = [{ list: '4Cr 4Sr 4Sb 4Dr'.split(' '), h: null }, { list: '5Cr 5Sr 5Sb 5Dr'.split(' '), h: null }];
	fen.players.mimi.buildings.estates = [{ list: 'TCr TSr TSb TDr TDb'.split(' '), h: null }];
	DA.staged_moves = [];
	DA.iter = 100;
	return [fen, player_names];
}
function ari_ut1_create_staged() {
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'leo'];
	let fen = ari_setup(player_names);
	top_elem_from_to(fen.deck, fen.market);
	top_elem_from_to(fen.deck, fen.market);
	fen.stage = 4;
	top_elem_from_to(fen.players.mimi.hand, fen.players.mimi.stall);
	top_elem_from_to(fen.players.mimi.hand, fen.players.mimi.stall);
	fen.iturn = 1;
	fen.plturn = 'leo';
	fen.round = ['mimi'];
	DA.staged_moves = [];
	DA.iter = 100;
	return [fen, player_names];
}
function ari_ut10_create_staged() {
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'leo'];
	let fen = ari_setup(player_names);
	DA.staged_moves = [];
	DA.iter = 100;
	return [fen, player_names];
}
function ari_ut100_create_staged() {
	console.log('*** test 100: tax ***');
	TestNumber = 100;
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'amanda', 'felix', 'lauren', 'blade'];
	let fen = ari_setup(player_names);
	ari_test_hand_to_discard(fen, 'mimi');
	deck_add(fen.deck, 3, fen.players.amanda.hand);
	ari_test_hand_to_discard(fen, 'felix', 3);
	deck_add(fen.deck, 1, fen.players.blade.hand);
	let sz = ARI.sz_hand;
	fen.pl_tax = { mimi: -sz, amanda: 3, felix: -sz + 3, lauren: 0, blade: 1 };
	[fen.iturn, fen.plturn] = [1, 'amanda'];
	fen.stage = 2;
	DA.fen0 = fen;
	DA.staged_moves = [];
	DA.iter = 100;
	DA.iter_verify = 3;
	DA.verify = (ot) => {
		let res = forAll(ot.plorder, x => ot[x].hand.length <= sz);
		if (!res) for (const uname of ot.plorder) console.log('pl', uname, 'hand', ot[uname].hand.length, 'should be', Math.min(sz, DA.fen0.players[uname].hand.length));
		return res;
	};
	DA.auto_moves = {
		amanda_1: [[0, 1, 2]],
		blade_2: [[0]],
	}
	return [fen, player_names];
}
function ari_ut101_create_staged() {
	console.log('*** test 101: stall selection 5 players ***');
	TestNumber = 101;
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'amanda', 'felix', 'lauren', 'blade'];
	let fen = ari_setup(player_names);
	ari_test_hand_to_discard(fen, 'mimi');
	ari_test_hand_to_discard(fen, 'felix');
	fen.stage = 3;
	DA.fen0 = fen;
	DA.staged_moves = [];
	DA.iter = 100;
	DA.iter_verify = 6;
	DA.verify = (ot) => {
		let stall_sz = { mimi: 0, amanda: 3, felix: 0, lauren: 1, blade: 2 };
		let res = forAll(ot.plorder, x => ot[x].stall.length == stall_sz[x]);
		if (!res) for (const uname of ot.plorder) console.log('pl', uname, 'stall', ot[uname].stall.length, 'should be', stall_sz[uname]);
		return res;
	};
	DA.auto_moves = {
		amanda_2: [[0, 1, 2]],
		lauren_4: [[0]],
		blade_5: [[0, 1]],
	}
	return [fen, player_names];
}
function ari_ut102_create_staged() {
	console.log('*** test 102: stall selection mimi-leo ***');
	TestNumber = 102;
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'leo'];
	let fen = ari_setup(player_names);
	ari_test_hand_to_discard(fen, 'mimi');
	fen.stage = 3;
	DA.fen0 = fen;
	DA.iter_verify = 3;
	DA.verify = (ot) => {
		let stall_sz = { mimi: 0, leo: 3 };
		let res = forAll(ot.plorder, x => ot[x].stall.length == stall_sz[x]);
		if (!res) for (const uname of ot.plorder) console.log('pl', uname, 'stall', ot[uname].stall.length, 'should be', stall_sz[uname]);
		return res;
	};
	DA.auto_moves = {
		leo_2: [[0, 1, 2]],
	};
	return [fen, player_names];
}
function ari_ut103_create_staged() {
	console.log('*** test 103: trade ***');
	TestNumber = 103;
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'leo'];
	let fen = ari_setup(player_names);
	arisim_stage_3(fen);
	arisim_stage_4_all_mimi_starts(fen, 2);
	DA.fen0 = fen;
	DA.auto_moves = {
		mimi_1: [['trade'], [1, 3]],
		mimi_2: [['pass']],
		leo_3: [['trade'], [1, 3]],
		leo_4: [['pass']],
	};
	DA.iter_verify = 5;
	DA.verify = (ot) => {
		let res = firstCond(ot.mimi.hand, x => x == DA.fen0.market[1]);
		if (!res) console.log('mimi stall does not contain market card from start!!!');
		return res;
	};
	return [fen, player_names];
}
function ari_ut104_create_staged() {
	console.log('*** test 104: downgrade from estate to farm ***');
	TestNumber = 104;
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'leo'];
	let fen = ari_setup(player_names);
	arisim_stage_3(fen);
	arisim_stage_4_all_mimi_starts(fen);
	stage_building(fen, fen.iturn, 'estate');
	DA.fen0 = fen;
	DA.iter_verify = 2;
	DA.verify = (ot) => {
		let stall_sz = { mimi: 0, leo: 3 };
		let res = ot.mimi.buildings.farms.length == 1 && ot.mimi.buildings.estates.length == 0;
		if (!res) console.log('mimi buildings', ot.mimi.buildings);
		return res;
	};
	DA.auto_moves = {
		mimi_1: [['downgrade'], [0]],
	};
	return [fen, player_names];
}
function ari_ut105_create_staged() {
	console.log('*** test 105: visit ***');
	TestNumber = 105;
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'leo', 'meckele'];
	let fen = ari_setup(player_names);
	arisim_stage_3(fen);
	arisim_stage_4_all_mimi_starts(fen);
	stage_replace_hand_cards_by(fen, 'mimi', ['QSy']);
	stage_building(fen, fen.iturn, 'estate');
	stage_building(fen, 1, 'estate');
	stage_building(fen, 2, 'estate');
	fen.phase = 'queen';
	DA.fen0 = fen;
	DA.iter_verify = 2;
	DA.verify = (ot) => {
		let uname_visited = ot.plturn;
		let building = ot[uname_visited].buildings.estates[0];
		let res = ot.mimi.coins == 2 || ot.mimi.coins == 4 || ot.mimi.hand.length + ot.mimi.stall.length == 6;
		if (!res) console.log('mimi visit payment did not work!', building.list);
		return res;
	};
	DA.auto_moves = {
		mimi_1: [['visit'], [0], [0], ['pass']],
	};
	return [fen, player_names];
}
function ari_ut106_create_staged() {
	console.log('*** test 106: double visit ***');
	TestNumber = 106;
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'leo', 'meckele'];
	let fen = ari_setup(player_names);
	arisim_stage_3(fen);
	arisim_stage_4_all_mimi_starts(fen);
	stage_replace_hand_cards_by(fen, 'mimi', ['QSy', 'QSg']);
	stage_building(fen, fen.iturn, 'estate');
	stage_building(fen, 1, 'chateau');
	stage_building(fen, 2, 'chateau');
	fen.phase = 'queen';
	DA.fen0 = fen;
	DA.auto_moves = {
		mimi_1: [['visit'], [0], [0]],
		mimi_2: [['visit'], [0], [0]],
	};
	DA.iter_verify = 3;
	DA.verify = (ot) => {
		let uname_visited = ot.plorder[1];
		let chateaus = ot[uname_visited].buildings.chateaus;
		console.log('chateaus:', uname_visited, chateaus);
		let res = ot.mimi.coins == 5 || ot[uname_visited].buildings.chateaus.length == 0;
		if (!res) console.log('double visit failed or building is correct!!!');
		return res;
	};
	return [fen, player_names];
}
function ari_ut107_create_staged() {
	console.log('*** test 107: end game ***');
	TestNumber = 107;
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'leo'];
	let fen = ari_setup(player_names);
	arisim_stage_3(fen);
	arisim_stage_4_all_mimi_starts(fen);
	stage_correct_buildings(fen, { mimi: { farms: 2, estates: 2, chateaus: 1 }, leo: { farms: 3 } });
	DA.fen0 = fen;
	DA.auto_moves = {
		mimi_1: [['pass']],
		leo_2: [['pass']],
		3: [[0]],
	};
	DA.iter_verify = 4;
	DA.verify = (ot) => {
		let res = ot.winner = 'mimi';
		if (!res) console.log('end game mimi should win didnt work!', ot);
		return res;
	};
	return [fen, player_names];
}
function ari_ut108_create_staged() {
	console.log('*** test 108: buy from open discard ***');
	TestNumber = 108;
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'leo'];
	let fen = ari_setup(player_names);
	fen.open_discard = deck_deal(fen.deck, 4);
	arisim_stage_3(fen);
	arisim_stage_4_all_mimi_starts(fen);
	stage_correct_buildings(fen, { mimi: { farms: 2, estates: 2, chateaus: 1 }, leo: { farms: 3 } });
	fen.phase = 'jack';
	DA.fen0 = fen;
	DA.auto_moves = {
		mimi_1: [['buy'], [0], [0]],
	};
	DA.iter_verify = 2;
	DA.verify = (ot) => {
		let res = ot.open_discard.length == 3 && ot.mimi.hand.length == 5 && ot.mimi.coins == 2
			|| arrLast(ot.open_discard)[0] == 'J' && ot.mimi.hand.length == 4 && ot.mimi.coins == 3;
		if (!res) console.log('buy form discard does not work!', ot.mimi, ot.open_discard);
		return res;
	};
	return [fen, player_names];
}
function ari_ut109_create_staged() {
	console.log('*** test 109: harvest ***');
	TestNumber = 109;
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'leo', 'meckele'];
	let fen = ari_setup(player_names);
	fen.open_discard = deck_deal(fen.deck, 4);
	arisim_stage_3(fen);
	arisim_stage_4_all_mimi_starts(fen);
	stage_correct_buildings(fen, { mimi: { farms: 2, estates: 2 }, leo: { farms: 3 }, meckele: { farms: 2 } });
	fen.phase = 'jack';
	DA.fen0 = fen;
	DA.auto_moves = [
		[[]],
		[['pass']], [['pass']], [['pass']],
		[[0]], [[0]], [[0]],
		[[0, 1]], [[0, 1]], [[0, 1]],
		[['harvest'], [0]],
	];
	DA.iter_verify = 11;
	DA.verify = (ot) => {
		let uname = ot.plturn;
		let res = ot[uname].buildings.farms[0].h == null && ot[uname].hand.length == 6;
		if (!res) console.log('harvest FAIL!', ot[uname]);
		return res;
	};
	return [fen, player_names];
}
function ari_ut11_create_staged() {
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'leo'];
	let fen = ari_setup(player_names);
	let [mimi, leo] = [fen.players.mimi, fen.players.leo];
	mimi.buildings.farms = [{ list: deck_deal(fen.deck, 4), h: null }];
	leo.buildings.farms = [{ list: deck_deal(fen.deck, 4), h: null }];
	fen.open_discard = deck_deal(fen.deck, 4);
	fen.market = deck_deal(fen.deck, 2);
	fen.phase = 'king';
	arisim_stage_4(fen, 3, 3);
	DA.staged_moves = [];
	DA.iter = 100;
	return [fen, player_names];
}
function ari_ut110_create_staged() {
	console.log('*** test 110: end game 2 ***');
	TestNumber = 110;
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'leo'];
	let fen = ari_setup(player_names);
	arisim_stage_3(fen);
	arisim_stage_4_all_mimi_starts(fen);
	fen.open_discard = deck_deal(fen.players.mimi.hand, 2);
	deck_add(fen.players.leo.hand, 2, fen.open_discard);
	stage_correct_buildings(fen, { mimi: { farms: 2, estates: 2, chateaus: 1 }, leo: { farms: 3 } });
	fen.phase = 'jack';
	DA.fen0 = fen;
	DA.auto_moves = [
		[[]],
		[['pass']], [['pass']],
		[[0]], [[0]],
		[['pass']], [['pass']],
		[[1]],
	];
	DA.iter_verify = 8;
	DA.verify = (ot) => {
		let res = ot.stage == 3;
		if (!res) console.log('Not ending game FAIL!', ot.stage);
		return res;
	};
	return [fen, player_names];
}
function ari_ut111_create_staged() {
	console.log('*** test 111: auction payment test ***');
	TestNumber = 111;
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'leo', 'meckele'];
	let fen = ari_setup(player_names);
	arisim_stage_3(fen);
	arisim_stage_4_all_mimi_starts(fen);
	fen.open_discard = deck_deal(fen.players.mimi.hand, 2);
	deck_add(fen.players.leo.hand, 2, fen.open_discard);
	fen.phase = 'queen';
	DA.fen0 = fen;
	DA.auto_moves = {
		1: [['pass']],
		2: [['pass']],
		3: [['pass']],
		4: [[0]],
		5: [[1]],
		6: [[2]],
		7: [[0]],
	};
	DA.iter_verify = 8;
	DA.verify = (ot) => {
		let coins = ot.plorder.map(x => ot[x].coins);
		let sum = arrSum(coins);
		let res = sum == 8;
		if (!res) console.log('payment for auction card wrong', coins, sum);
		return res;
	};
	return [fen, player_names];
}
function ari_ut112_create_staged() {
	console.log('*** test 112: auction payment test 2 ***');
	TestNumber = 112;
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'leo', 'meckele', 'felix', 'amanda'];
	let fen = ari_setup(player_names);
	arisim_stage_3(fen);
	arisim_stage_4_all_mimi_starts(fen);
	fen.phase = 'queen';
	DA.fen0 = fen;
	DA.auto_moves = {
		1: [['pass']],
		2: [['pass']],
		3: [['pass']],
		4: [['pass']],
		5: [['pass']],
		6: [[1]],
		7: [[0]],
		8: [[2]],
		9: [[2]],
		10: [[1]],
		11: [[0]],
		12: [[1]],
	};
	DA.iter_verify = 13;
	DA.verify = (ot) => {
		let coins = ot.plorder.map(x => ot[x].coins);
		let sum = arrSum(coins);
		let res = sum == 11;
		if (!res) console.log('payment for auction card wrong', coins, sum);
		return res;
	};
	return [fen, player_names];
}
function ari_ut113_create_staged() {
	console.log('*** test 113: buy from open discard w/ jack ***');
	TestNumber = 113;
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'leo'];
	let fen = ari_setup(player_names);
	fen.open_discard = deck_deal(fen.deck, 4);
	arisim_stage_3(fen);
	arisim_stage_4_all_mimi_starts(fen);
	stage_replace_hand_cards_by(fen, 'mimi', ['JSy']);
	stage_correct_buildings(fen, { mimi: { farms: 2, estates: 2, chateaus: 1 }, leo: { farms: 3 } });
	fen.phase = 'jack';
	DA.fen0 = fen;
	DA.auto_moves = {
		mimi_1: [['buy'], [0], [0]],
	};
	DA.iter_verify = 2;
	DA.verify = (ot) => {
		let res = ot.open_discard.length == 3 && ot.mimi.hand.length == 5 && ot.mimi.coins == 2
			|| arrLast(ot.open_discard)[0] == 'J' && ot.mimi.hand.length == 4 && ot.mimi.coins == 3;
		if (!res) console.log('buy form discard does not work!', ot.mimi, ot.open_discard);
		return res;
	};
	return [fen, player_names];
}
function ari_ut12_create_staged() {
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'amanda', 'felix', 'lauren', 'blade'];
	let fen = ari_setup(player_names);
	DA.staged_moves = [];
	DA.iter = 100;
	return [fen, player_names];
}
function ari_ut13_create_staged() {
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'amanda', 'felix', 'lauren', 'blade'];
	let fen = ari_setup(player_names);
	ari_test_hand_to_discard(fen, 'mimi');
	ari_test_hand_to_discard(fen, 'lauren');
	console.log('mimi', fen.players.mimi)
	DA.staged_moves = [];
	DA.iter = 100;
	return [fen, player_names];
}
function ari_ut14_create_staged() {
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'amanda', 'felix', 'lauren', 'blade'];
	let fen = ari_setup(player_names);
	DA.fen0 = jsCopy(fen);
	arisim_stage_3(fen);
	arisim_stage_4_all(fen, 1);
	DA.staged_moves = [];
	DA.iter = 100;
	DA.iter_verify = 2;
	DA.verify = (ot) => {
		let plast = arrLast(ot.round);
		let ok = sameList(ot[plast].hand, DA.fen0.players[plast].hand);
		console.log('pl', plast, 'hand', ot[plast].hand, 'should be', DA.fen0.players[plast].hand);
		return ok;
	}
	return [fen, player_names];
}
function ari_ut15_create_staged() {
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'amanda', 'felix', 'lauren', 'blade'];
	let fen = DA.fen0 = ari_setup(player_names);
	ari_test_hand_to_discard(fen, 'mimi');
	ari_test_hand_to_discard(fen, 'amanda');
	ari_test_hand_to_discard(fen, 'lauren');
	ari_test_hand_to_discard(fen, 'blade');
	DA.staged_moves = [];
	DA.iter = 100;
	DA.iter_verify = 3;
	DA.verify = (ot) => ot.plturn == 'felix';
	return [fen, player_names];
}
function ari_ut16_create_staged() {
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'leo'];
	let fen = ari_setup(player_names);
	DA.staged_moves = [];
	DA.iter = 100;
	return [fen, player_names];
}
function ari_ut2_create_staged() {
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'leo'];
	let fen = ari_setup(player_names);
	arisim_stage_3(fen);
	arisim_stage_4(fen);
	DA.staged_moves = [];
	DA.iter = 100;
	return [fen, player_names];
}
function ari_ut206_create_staged() {
	console.log('*** test 206: prep double visit ***');
	TestNumber = 206;
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'leo', 'meckele'];
	let fen = ari_setup(player_names);
	arisim_stage_3(fen);
	arisim_stage_4_all_mimi_starts(fen);
	stage_replace_hand_cards_by(fen, 'mimi', ['QSy', 'QSg']);
	stage_building(fen, fen.iturn, 'estate');
	fen.players.leo.buildings.farms = [{ list: '4Cy 4Sy 4Hy 6Dy'.split(' '), h: null }, { list: '5Cy JSy 5Sy 5Dy'.split(' '), h: null }];
	fen.phase = 'queen';
	DA.fen0 = fen;
	return [fen, player_names];
}
function ari_ut3_create_staged() {
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'leo'];
	let fen = ari_setup(player_names);
	for (const uname in fen.players) {
		let pl = fen.players[uname];
		while (!isEmpty(pl.hand)) last_elem_from_to(pl.hand, fen.deck);
	}
	fen.players.mimi.hand = 'AHb ADb 2Cb 4Cb 6Cb KCb QDb'.split(' ');
	fen.players.leo.hand = 'ACb KDb QSb ASb 2Db 4Db 6Db'.split(' ');
	fen.players.mimi.buildings.farms = [{ list: '4Cr 7Sr 4Sb 4Dr'.split(' '), h: null }];
	fen.players.leo.buildings.estates = [{ list: 'TCr 7Sr TSb TDr TDb'.split(' '), h: null }];
	fen.market = 'KSb 3Sb'.split(' ');
	arisim_stage_4(fen, 3, 2);
	DA.staged_moves = [];
	DA.iter = 100;
	return [fen, player_names];
}
function ari_ut306_create_staged() {
	console.log('*** test 306: prep double visit ***');
	TestNumber = 306;
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'leo', 'meckele'];
	let fen = ari_setup(player_names);
	arisim_stage_3(fen);
	arisim_stage_4_all_mimi_starts(fen);
	stage_replace_hand_cards_by(fen, 'mimi', ['QSy', 'QSg']);
	stage_building(fen, fen.iturn, 'estate');
	fen.players.leo.buildings.farms = [{ list: '4Cy 4Sy 4Hy 6Dy'.split(' '), h: null }, { list: '5Cy JSy 5Sy 5Dy'.split(' '), h: null }];
	fen.phase = 'queen';
	DA.fen0 = fen;
	DA.auto_moves = [[],
	[['visit'], ['last'], [0]],
	[['visit'], ['last'], [1]],
	[['pass']],
	];
	return [fen, player_names];
}
function ari_ut4_create_staged() {
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'leo'];
	let fen = ari_setup(player_names);
	for (const uname in fen.players) {
		let pl = fen.players[uname];
		while (!isEmpty(pl.hand)) last_elem_from_to(pl.hand, fen.deck);
	}
	fen.players.mimi.hand = 'AHb ADb 2Cb 4Cb 6Cb KCb QDb'.split(' ');
	fen.players.leo.hand = 'ACb KDb QSb ASb 2Db 4Db 6Db'.split(' ');
	fen.players.mimi.buildings.farms = [{ list: '4Cr 7Sr 4Sb 4Dr'.split(' '), h: null }];
	fen.players.leo.buildings.estates = [{ list: 'TCr 7Sr TSb TDr TDb'.split(' '), h: null }];
	fen.market = 'KSb 3Sb'.split(' ');
	fen.phase = 'queen';
	fen.stage = 11;
	DA.staged_moves = [];
	DA.iter = 100;
	return [fen, player_names];
}
function ari_ut5_create_staged() {
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'leo'];
	let fen = ari_setup(player_names);
	for (const uname in fen.players) {
		let pl = fen.players[uname];
		while (!isEmpty(pl.hand)) last_elem_from_to(pl.hand, fen.deck);
	}
	fen.players.mimi.hand = 'AHb ADb 2Cb 4Cb 6Cb KCb QDb'.split(' ');
	fen.players.leo.hand = 'ACb KDb QSb ASb 2Db 4Db 6Db'.split(' ');
	fen.players.mimi.buildings.farms = [{ list: '4Cr 7Sr 4Sb 4Dr'.split(' '), h: null }];
	fen.players.leo.buildings.estates = [{ list: 'TCr 7Sr TSb TDr TDb'.split(' '), h: null }];
	fen.phase = 'jack';
	fen.stage = 3;
	DA.staged_moves = [];
	DA.iter = 100;
	return [fen, player_names];
}
function ari_ut6_create_staged() {
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'leo'];
	let fen = ari_setup(player_names);
	for (const uname in fen.players) {
		let pl = fen.players[uname];
		while (!isEmpty(pl.hand)) last_elem_from_to(pl.hand, fen.deck);
	}
	fen.players.mimi.hand = 'AHb ADb 2Cb 4Cb 6Cb KCb QDb'.split(' ');
	fen.players.leo.hand = 'ACb KDb QSb ASb 2Db 4Db 6Db'.split(' ');
	fen.players.mimi.buildings.farms = [{ list: '4Cr 7Sr 4Sb 4Dr'.split(' '), h: null }];
	fen.players.leo.buildings.estates = [{ list: 'TCr 7Sr TSb TDr TDb'.split(' '), h: null }];
	for (let i = 0; i < 3; i++) {
		top_elem_from_to(fen.deck, fen.market);
	}
	fen.phase = 'jack';
	arisim_stage_4(fen);
	DA.staged_moves = [];
	DA.iter = 100;
	return [fen, player_names];
}
function ari_ut7_create_staged() {
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'leo'];
	let fen = ari_setup(player_names);
	for (const uname in fen.players) {
		let pl = fen.players[uname];
		while (!isEmpty(pl.hand)) last_elem_from_to(pl.hand, fen.deck);
	}
	fen.players.mimi.hand = 'AHb ADb 2Cb 4Cb 6Cb QCb QDb'.split(' ');
	fen.players.leo.hand = 'ACb KDb QSb ASb 2Db 4Db 6Db'.split(' ');
	fen.players.mimi.buildings.farms = [{ list: '4Cr 7Sr 4Sb 4Dr'.split(' '), h: null }];
	fen.players.leo.buildings.estates = [{ list: 'TCr 7Sr TSb TDr TDb'.split(' '), h: null }];
	for (let i = 0; i < 3; i++) {
		top_elem_from_to(fen.deck, fen.market);
	}
	fen.phase = 'jack';
	arisim_stage_4(fen);
	DA.staged_moves = [];
	DA.iter = 100;
	return [fen, player_names];
}
function ari_ut8_create_staged() {
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'leo'];
	let fen = ari_setup(player_names);
	deck_add(fen.deck, 1, fen.players.mimi.hand); //'AHb ADb 2Cb 4Cb 6Cb QCb QDb'.split(' ');
	//deck_add(fen.deck, 2, fen.players.leo.hand); //'ACb KDb QSb ASb 2Db 4Db 6Db'.split(' ');
	fen.players.mimi.buildings.farms = [{ list: deck_deal(fen.deck, 4), h: '3Hb' }];
	fen.players.leo.buildings.farms = [{ list: deck_deal(fen.deck, 4), h: null }];
	fen.players.leo.buildings.estates = [{ list: deck_deal(fen.deck, 5), h: null }];
	fen.market = deck_deal(fen.deck, 3);
	fen.phase = 'jack';
	arisim_stage_4(fen);
	DA.staged_moves = [];
	DA.iter = 100;
	return [fen, player_names];
}
function ari_ut9_create_staged() {
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'leo'];
	let fen = ari_setup(player_names);
	for (const uname in fen.players) {
		let pl = fen.players[uname];
		while (!isEmpty(pl.hand)) last_elem_from_to(pl.hand, fen.deck);
	}
	fen.players.mimi.hand = 'AHb ADb 2Cb 4Cb 6Cb QCb QDb'.split(' ');
	fen.players.leo.hand = 'ACb KDb QSb ASb 2Db 4Db 6Db'.split(' ');
	fen.players.mimi.buildings.farms = [{ list: '4Cr 7Sr 4Sb 4Dr'.split(' '), h: '3Hb' }];
	fen.players.leo.buildings.farms = [{ list: 'JCr JSr JSb JDr'.split(' '), h: '3Sr' }];
	fen.players.leo.buildings.estates = [{ list: 'TCr 7Sr TSb TDr TDb'.split(' '), h: null }];
	for (let i = 0; i < 3; i++) {
		top_elem_from_to(fen.deck, fen.market);
	}
	fen.phase = 'king';
	arisim_stage_4(fen);
	DA.staged_moves = [];
	DA.iter = 100;
	return [fen, player_names];
}
function arisim_stage_3(fen) {
	top_elem_from_to(fen.deck, fen.market);
	top_elem_from_to(fen.deck, fen.market);
	if (fen.phase == 'jack') top_elem_from_to(fen.deck, fen.market);
	fen.stage = 4;
}
function arisim_stage_4(fen, n_mimi = 2, n_leo = 3) {
	for (let i = 0; i < n_mimi; i++) top_elem_from_to(fen.players.mimi.hand, fen.players.mimi.stall);
	for (let i = 0; i < n_leo; i++)  top_elem_from_to(fen.players.leo.hand, fen.players.leo.stall);
	fen.stage = 5;
	let valmimi = fen.players.mimi.stall_value = arrSum(fen.players.mimi.stall.map(x => Aristocards[x].val));
	let valleo = fen.players.leo.stall_value = arrSum(fen.players.leo.stall.map(x => Aristocards[x].val));
	let minplayer = valmimi <= valleo ? 'mimi' : 'leo';
	fen.iturn = fen.plorder.indexOf(minplayer); fen.plturn = minplayer;
	fen.num_actions = fen.total_pl_actions = fen.players[minplayer].stall.length;
	fen.action_number = 1;
}
function arisim_stage_4_all(fen, n = 3) {
	for (let i = 0; i < n; i++) top_elem_from_to(fen.players.mimi.hand, fen.players.mimi.stall);
	let others = get_keys(fen.players).filter(x => x != 'mimi');
	for (const uname of others) {
		for (let i = 0; i < n; i++)  top_elem_from_to(fen.players[uname].hand, fen.players[uname].stall);
	}
	let list = [];
	for (const uname of get_keys(fen.players)) {
		fen.players[uname].stall_value = arrSum(fen.players[uname].stall.map(x => Aristocards[x].val));
		list.push({ uname: uname, val: fen.players[uname].stall_value });
	}
	fen.stage = 5;
	list = sortBy(list, 'val');
	let minplayer = list[0].uname;
	fen.iturn = fen.plorder.indexOf(minplayer);
	fen.plturn = minplayer;
	fen.num_actions = fen.total_pl_actions = fen.players[minplayer].stall.length;
	fen.action_number = 1;
}
function arisim_stage_4_all_mimi_starts(fen, n = 3) {
	for (let i = 0; i < n; i++) top_elem_from_to(fen.players.mimi.hand, fen.players.mimi.stall);
	let others = get_keys(fen.players).filter(x => x != 'mimi');
	for (const uname of others) {
		for (let i = 0; i < n; i++)  top_elem_from_to(fen.players[uname].hand, fen.players[uname].stall);
	}
	let list = [];
	for (const uname of get_keys(fen.players)) {
		fen.players[uname].stall_value = arrSum(fen.players[uname].stall.map(x => Aristocards[x].val));
		list.push({ uname: uname, val: fen.players[uname].stall_value });
	}
	fen.stage = 5;
	list = sortBy(list, 'val');
	let minplayer = list[0].uname;
	if (minplayer != 'mimi') {
		console.log('NOT mimi!!! minplayer', minplayer)
		let best_stall = fen.players[minplayer].stall;
		let best_stall_value = fen.players[minplayer].stall_value;
		fen.players[minplayer].stall = fen.players.mimi.stall;
		fen.players[minplayer].stall_value = fen.players.mimi.stall_value;
		fen.players.mimi.stall = best_stall;
		fen.players.mimi.stall_value = best_stall_value;
		minplayer = 'mimi';
	}
	fen.iturn = fen.plorder.indexOf(minplayer);
	fen.plturn = minplayer;
	console.assert(fen.plturn == 'mimi', 'WTF?????????????????');
	fen.num_actions = fen.total_pl_actions = fen.players[minplayer].stall.length;
	fen.action_number = 1;
}
function aristo() {
	const rankstr = 'A23456789TJQK*';
	function setup(players, options) {
		let fen = { players: {}, plorder: jsCopy(players), history: [] };
		let n = players.length;
		let num_decks = fen.num_decks = 2 + (n >= 8 ? 2 : n >= 6 ? 1 : 0);
		let deck = fen.deck = create_fen_deck('n', num_decks);
		shuffle(deck);
		let deck_commission = fen.deck_commission = create_fen_deck('c'); shuffle(deck_commission);
		let deck_luxury = fen.deck_luxury = create_fen_deck('l'); shuffle(deck_luxury);
		let deck_rumors = fen.deck_rumors = exp_rumors(options) ? create_fen_deck('r') : []; shuffle(deck_rumors);
		shuffle(fen.plorder);
		fen.market = [];
		fen.deck_discard = [];
		fen.open_discard = [];
		fen.commissioned = [];
		fen.open_commissions = exp_commissions(options) ? deck_deal(deck_commission, 3) : [];
		fen.church = exp_church(options) ? deck_deal(deck, players.length) : [];
		for (const plname of players) {
			let pl = fen.players[plname] = {
				hand: deck_deal(deck, 7),
				commissions: exp_commissions(options) ? deck_deal(deck_commission, 4) : [],
				rumors: exp_rumors(options) ? deck_deal(deck_rumors, players.length - 1) : [],
				journeys: [],
				buildings: { farm: [], estate: [], chateau: [] },
				stall: [],
				stall_value: 0,
				coins: 3,
				vps: 0,
				score: 0,
				name: plname,
				color: get_user_color(plname),
			};
		}
		fen.phase = 'king';
		fen.num_actions = 0;
		fen.herald = fen.plorder[0];
		fen.heraldorder = jsCopy(fen.plorder);
		if (exp_commissions(options)) {
			ari_history_list([`commission trading starts`], 'commissions', fen);
			[fen.stage, fen.turn] = [23, options.mode == 'hotseat' ? [fen.plorder[0]] : fen.plorder]; fen.comm_setup_num = 3; fen.keeppolling = true;
		} else if (exp_rumors(options) && fen.plorder.length > 2) {
			ari_history_list([`gossiping starts`], 'rumors', fen);
			[fen.stage, fen.turn] = [24, options.mode == 'hotseat' ? [fen.plorder[0]] : fen.plorder];
		} else[fen.stage, fen.turn] = set_journey_or_stall_stage(fen, options, fen.phase);
		return fen;
	}
	function activate_ui() { ari_activate_ui(); }
	function check_gameover(z) { return isdef(z.fen.winners) ? z.fen.winners : false; }
	function present(dParent) { ari_present(dParent); }
	function stats(dParent) { ari_stats(dParent); }
	function state_info(dParent) { ari_state(dParent); }
	function get_selection_color(item) {
		if (Z.stage == 41 && Z.A.selected.length == 1) return 'blue'; return 'red';
	}
	return { get_selection_color, rankstr, setup, activate_ui, check_gameover, present, state_info, stats };
}
function aristoAggregateVisible(g) {
	let result = [];
	let stalls = g.allPlayers.map(x => x.stall);
	result = arrFlatten(stalls).concat(g.market.cards);
	return result;
}
function aristoAIAction(pl, g, key) {
	if (key == 'stall') {
		let deck1 = new Deck(pl.hand);
		pl.stall = deck1.deal(randomNumber(Math.min(2, deck1.count()), Math.min(5, deck1.count())));
		pl.hand = deck1.cards();
	}
}
function aristocracy_activate(fen, plname) {
	console.log('activating for', plname)
}
function aristocracy_present(fen, dParent, plname) {
	console.log('fen', fen);
}
function aristocracy_setup(player_names) {
	let fen = {};
	let deck = fen.deck = get_keys(Aristocards).filter(x => 'br'.includes(x[2]));
	shuffle(deck);
	fen.market = [];
	fen.deck_discard = [];
	fen.open_discard = [];
	let pls = fen.players = {};
	for (const plname of player_names) {
		let pl = pls[plname] = {
			hand: deck_deal(deck, 7),
			buildings: { farms: [], estates: [], chateaus: [] },
			stall: [],
			stall_value: 0,
			coins: 3,
			vps: 0,
			score: 0,
		};
	}
	fen.plorder = rPlayerOrder(player_names);
	fen.iturn = 0;
	fen.plturn = fen.plorder[0];
	fen.turn = [fen.plturn];
	fen.round = [];
	fen.herald = fen.plturn;
	fen.phase = 'king';
	fen.stage = 3;
	fen.step = 0;
	return fen;
}
function aristoExchangeCard() { }
function aristoGame1(g) {
	let phase = g.phase = 'king';
	let players = g.allPlayers;
	let i = 0; players.map(x => x.index = i++);
	let indices = players.map(x => x.index);
	let me = g.me;
	let others = g.others;
	let market = g.market;
	let buy_cards = g.buy_cards;
	let draw_pile = g.draw_pile; draw_pile.type = 'deck';
	let deck = draw_pile.deck = new Deck();
	deck.init52_double();
	let discard_pile = g.discard_pile; discard_pile.type = 'deck';
	let discard = discard_pile.deck = new Deck();
	for (const pl of players) { pl.hand = deck.deal(7); pl.coins = 3; }
	market.cards = deck.deal(3); market.type = 'cards';
	buy_cards.cards = []; buy_cards.type = 'cards';
	let herald = g.herald = players[1];
	let heraldOrder = g.heraldOrder = arrCycle(indices, herald.index);
	g.stallsHidden = true;
	for (const plIndex of heraldOrder) {
		if (plIndex == 0) break;
		let pl = players[plIndex];
		aristoAIAction(pl, g, 'stall');
	}
	aristoUi(dTable, g);
	dLineTopMiddle.innerHTML = 'choose your stall!';
	mButton('submit move', () => aristoUserAction(g, 'stall', aristoGame2), mBy('sidebar').firstChild, { w: 80, bg: g.color }, 'mybutton');
	for (const card of g.me.handItems) {
		let d = iDiv(card);
		d.onclick = () => {
			if (card.isSelected) {
				card.isSelected = false;
				iDiv(card).style.transform = 'unset';
			} else {
				card.isSelected = true;
				iDiv(card).style.transform = 'translateY(-25px)';
			}
		}
	}
}
function aristoGame2(g) {
	let heraldOrder = g.heraldOrder;
	let players = g.allPlayers;
	let me = g.me;
	let iNext = heraldOrder.indexOf(0) + 1;
	for (let i = iNext; i < heraldOrder.length; i++) {
		let plIndex = heraldOrder[i];
		let pl = players[plIndex];
		if (plIndex == 0) break;
		let deck1 = new Deck(pl.hand);
		pl.stall = deck1.deal(randomNumber(Math.min(2, deck1.count()), Math.min(5, deck1.count())));
		pl.hand = deck1.cards();
	}
	g.stallsHidden = false;
	aristoUi(dTable, g);
	setTimeout(() => aristoGame3(g), 2000);
}
function aristoGame3(g) {
	let heraldOrder = g.heraldOrder;
	let players = g.allPlayers;
	let me = g.me;
	let stallOrder = g.stallOrder = calcStallOrder(players);
	players.map(x => x.nActions = x.stall.length);
	for (const plIndex of stallOrder) {
		let pl = players[1];
		console.log('player', pl.name, 'starts with', pl.nActions, 'actions, stall value is', pl.stallValue);
		if (plIndex == 0) break;
		while (pl.nActions > 0) {
			aristoBuild(pl, g);
			break;
		}
		console.log('player', pl.name, 'still has', pl.nActions, 'actions');
	}
	aristoUi(dTable, g);
	return;
	console.log('Game', g);
}
function aristoUi(dParent, g) {
	clearTable();
	let d1 = mDiv(dParent, { w: '100%' }); mFlex(d1, 'v');
	let dWorld = mDiv(d1, { bg: 'random', hmin: 170, flex: 1 });
	mFlex(dWorld);
	iAdd(g.me, { div: cardZone(d1, g.me, 2) });
	let others = g.others;
	for (let i = 0; i < others.length; i++) {
		let pl = others[i];
		iAdd(pl, { div: cardZone(d1, pl) });
	}
	for (const o of [g.draw_pile, g.market, g.buy_cards, g.discard_pile]) { iAdd(o, { div: cardZone(dWorld, o) }); }
	for (const name of ['draw_pile', 'market', 'buy_cards', 'discard_pile']) { g[name + 'Items'] = showCards(g[name]); }
	for (const pl of g.allPlayers) {
		pl.handItems = showCards({ div: iDiv(pl), type: pl == g.me ? 'hand' : 'handHidden', cards: pl.hand });
		if (isdef(pl.stall)) pl.stallItems = showCards({ div: iDiv(pl), type: g.stallsHidden ? 'cardsHidden' : 'cards', cards: pl.stall });
		if (isdef(pl.buildings)) {
			for (const building of pl.buildings) {
				let bItem = showCards({ div: iDiv(pl), type: 'hand', cards: building });
				lookupAddToList(pl, ['buildingItems'], bItem);
			}
		}
	}
}
function aristoUserAction(g, key, followFunc) {
	if (key == 'stall') {
		let me = g.me;
		let indices = arrIndices(me.handItems, x => x.isSelected);
		[me.stall, me.hand] = arrSplitByIndices(me.hand, indices);
		followFunc(g);
	}
}
function aRollby(elem, dx = 100, ms = 3000) {
	anime({ targets: elem, translateX: dx, rotate: '1turn', duration: ms });
}
function aRotate(d, ms = 2000) { return d.animate({ transform: `rotate(360deg)` }, ms); }
function aRotateAccel(d, ms) { return d.animate({ transform: `rotate(1200deg)` }, { easing: 'cubic-bezier(.72, 0, 1, 1)', duration: ms }); }
function arr_count(arr, funcprop) {
	console.log('arr', arr);
	let di = {};
	if (isdef(funcprop) && isString(funcprop)) {
		for (const a of arr) { if (isdef(di[a[funcprop]])) di[a[funcprop]] += 1; else di[a[funcprop]] = 1; }
	} else if (isdef(funcprop)) {
		for (const a of arr) {
			let val = funcprop(a);
			if (isdef(di[val])) di[val] += 1; else di[val] = 1;
		}
	} else {
		for (const a of arr) { if (isdef(di[a])) di[a] += 1; else di[a] = 1; }
	}
	for (const a of arr) {
		a.rank = a.key[0];
		a.count = di[a.rank];
	}
	let sorted = sortByDescending(arr, 'count');
	return sorted;
}
function arr_get_max(arr, func) {
	if (isEmpty(arr)) return null;
	if (nundef(func)) func = x => x;
	let i = 0; let aug = arr.map(x => ({ el: jsCopy(x), val: func(x), i: i++ }));
	sortByDescending(aug, 'val');
	let max = aug[0].val;
	let res = arrTakeWhile(aug, x => x.val == max); return res.map(x => arr[x.i]);
}
function arr_get_min(arr, func) {
	if (isEmpty(arr)) return null;
	if (nundef(func)) func = x => x;
	let i = 0; let aug = arr.map(x => ({ el: jsCopy(x), val: func(x), i: i++ }));
	sortBy(aug, 'val');
	let min = aug[0].val;
	let res = arrTakeWhile(aug, x => x.val == min); return res.map(x => arr[x.i]);
}
function arr_to_dict_by(arr, prop) { let di = {}; for (const a of arr) { lookupAddToList(di, [a[prop]], a); } return di; }
function arr2Set(arr2d, func) {
	for (let i = 0; i < arr2d.length; i++) {
		for (let j = 0; j < arr2d[i].length; j++) {
			let o = arr2d[i][j];
			if (typeof o == 'object') {
				func(o, i, j);
			}
		}
	}
}
function arrAdd(arr1, arr2) {
	let i = 0; return arr1.map(x => x + arr2[i++]);
}
function arrangeChildrenAsCircle(n, R) {
}
function arrangeChildrenAsMatrix(n, R, rows, cols) {
	let children = n.children.map(x => R.uiNodes[x]);
	let num = children.length;
	let size = 20;
	let padding = 4;
	let i = 0;
	for (const n1 of children) {
		let b = getBounds(n1.ui);
		let newMax = Math.max(Math.max(b.width, b.height), size);
		if (newMax > size) {
			size = newMax;
		}
	}
	let [y0, wTitle] = calcParentContentYOffsetAndWidth(n, padding);
	for (let r = 0; r < rows; r++) {
		for (let c = 0; c < cols; c++) {
			let n1 = children[i]; i += 1;
			n1.params.size = { w: size - 1, h: size - 1 };
			n1.params.pos = { x: padding + r * size, y: y0 + c * size };
			n1.params.sizing = 'fixed';
		}
	}
}
function arrangeChildrenAsQuad(n, R) {
	let children = n.children.map(x => R.uiNodes[x]);
	let num = children.length;
	let rows = Math.ceil(Math.sqrt(num));
	let cols = Math.floor(Math.sqrt(num));
	let size = 20;
	let padding = 4;
	let i = 0;
	for (const n1 of children) {
		let b = getBounds(n1.ui);
		let newMax = Math.max(Math.max(b.width, b.height), size);
		if (newMax > size) {
			size = newMax;
		}
	}
	let [y0, wTitle] = calcParentContentYOffsetAndWidth(n, padding);
	for (let r = 0; r < rows; r++) {
		for (let c = 0; c < cols; c++) {
			let n1 = children[i]; i += 1;
			n1.params.size = { w: size - 1, h: size - 1 };
			n1.params.pos = { x: padding + r * size, y: y0 + c * size };
			n1.params.sizing = 'fixed';
		}
	}
}
function arrangeOverride(n, R) {
	if (nundef(n.children)) return { w: 0, h: 0 }
	if (isdef(RLAYOUT[n.type])) {
		return RLAYOUT[n.type](n, R);
	}
	if (n.type == 'grid') {
		console.log('should have been done')
	} else if (n.type == 'hand') {
		console.log('should have been done')
		let szNeeded = handLayout(n, R);
		return szNeeded;
	} else if (n.info) {
		n.sizeNeeded = wrapLayoutSizeNeeded(n.children, R);
		let nBoard = R.uiNodes[n.uidParent];
		addResizeInfo(nBoard, n, n.sizeNeeded);
		return { w: n.sizeNeeded.w, h: n.sizeNeeded.h };
	} else if (n.uiType == 'd') {
		let szNeeded = panelLayout(n, R);
		return szNeeded;
	} else {
		console.log('!!!!!!!!!!case NOT catched in arrangeOverride_!!!!!!!!!!', n);
	}
	return res;
}
function arrAverage(arr, prop) {
	let n = arr.length; if (!n) return 0;
	let sum = arrSum(arr, prop);
	return sum / n;
}
function arrBuckets(arr, func, sortbystr) {
	let di = {};
	for (const a of arr) {
		let val = func(a);
		if (nundef(di[val])) di[val] = { val: val, list: [] };
		di[val].list.push(a);
	}
	let res = []
	let keys = get_keys(di);
	if (isdef(sortbystr)) {
		keys.sort((a, b) => sortbystr.indexOf(a) - sortbystr.indexOf(b));
	}
	return keys.map(x => di[x]);
}
function arrByClassName(classname, d) {
	if (nundef(d)) d = document;
	return Array.from(d.getElementsByClassName(classname));
}
function arrChildren(elem) { return [...toElem(elem).children]; }
function arrClear(arr) { arr.length = 0; }
function arrCount(arr, func) { return arr.filter(func).length; }
function arrCreate(n, func) {
	let res = [];
	for (let i = 0; i < n; i++) {
		res.push(func(i));
	}
	return res;
}
function arrCycle(arr, count) { return arrRotate(arr, count); }
function arrCycleSwap(arr, prop, clockwise = true) {
	let n = arr.length;
	let h = arr[0].prop;
	for (let i = 1; i < n; i++) { arr[i - 1][prop] = arr[i][prop]; }
	arr[n - 1][prop] = h;
}
function arrExcept(arr, el) {
	let res = [];
	for (const a of arr) { if (a != el) res.push(a); }
	return res;
}
function arrExtend(arr, list) { list.map(x => arr.push(x)); return arr; }
function arrFirst(arr) { return arr.length > 0 ? arr[0] : null; }
function arrFirstOfLast(arr) { if (arr.length > 0) { let l = arrLast(arr); return isList(l) ? arrFirst(l) : null; } else return null; }
function arrFlatten(arr) {
	let res = [];
	for (let i = 0; i < arr.length; i++) {
		for (let j = 0; j < arr[i].length; j++) {
			res.push(arr[i][j]);
		}
	}
	return res;
}
function arrFromIndex(arr, i) { return arr.slice(i); }
function arrFromTo(arr, iFrom, iTo) { return takeFromTo(arr, iFrom, iTo); }
function arrFunc(n, func) { let res = []; for (let i = 0; i < n; i++) res.push(func()); return res; }
function arrIndices(arr, func) {
	let indices = [];
	for (let i = 0; i < arr.length; i++) { if (func(arr[i])) indices.push(i); }
	return indices;
}
function arrlast(arr) {
	return arr.length > 0 ? arr[arr.length - 1] : null;
}
function arrLast(arr) { return arr.length > 0 ? arr[arr.length - 1] : null; }
function arrLastOfLast(arr) { if (arr.length > 0) { let l = arrLast(arr); return isList(l) ? arrLast(l) : null; } else return null; }
function arrMax(arr, f) { return arr_get_max(arr, f); }
function arrMin(arr, f) { return arr_get_min(arr, f); }
function arrMinMax(arr, func) {
	if (nundef(func)) func = x => x;
	let min = func(arr[0]), max = func(arr[0]), imin = 0, imax = 0;
	for (let i = 1, len = arr.length; i < len; i++) {
		let v = func(arr[i]);
		if (v < min) {
			min = v; imin = i;
		} else if (v > max) {
			max = v; imax = i;
		}
	}
	return { min: min, imin: imin, max: max, imax: imax, elmin: arr[imin], elmax: arr[imax] };
}
function arrMinus(a, b) { if (isList(b)) return a.filter(x => !b.includes(x)); else return a.filter(x => x != b); }
function arrNext(list, el) {
	let iturn = list.indexOf(el);
	let nextplayer = list[(iturn + 1) % list.length];
	return nextplayer;
}
function arrNoDuplicates(arr) {
	let di = {};
	let arrNew = [];
	for (const el of arr) {
		if (!isLiteral(el)) continue;
		if (isdef(di[el])) continue;
		di[el] = true;
		arrNew.push(el);
	}
	return arrNew;
}
function arrPairs(a) {
	let res = [];
	for (let i = 0; i < a.length; i++) {
		for (let j = i + 1; j < a.length; j++) {
			res.push([a[i], a[j]]);
		}
	}
	return res;
}
function arrPlus(a, b) { b.map(x => a.push(x)); return a; }
function arrPrev(list, el) {
	let iturn = list.indexOf(el);
	if (iturn == 0) iturn = list.length;
	let nextplayer = list[(iturn - 1) % list.length];
	return nextplayer;
}
function arrRange(from = 1, to = 10, step = 1) { let res = []; for (let i = from; i <= to; i += step)res.push(i); return res; }
function arrRemove(arr, listweg) {
	arrReplace(arr, listweg, []);
}
function arrRemoveDuplicates(items, prop) {
	let di = {};
	let res = [];
	for (const item of items) {
		if (isdef(di[item[prop].toLowerCase()])) { continue; }
		res.push(item);
		di[item[prop].toLowerCase()] = true;
	}
	return res;
}
function arrRemoveLast(arr) { arr.length -= 1; }
function arrRemovip(arr, el) {
	let i = arr.indexOf(el);
	if (i > -1) arr.splice(i, 1);
	return i;
}
function arrRepeat(n, el) { let res = []; for (let i = 0; i < n; i++) res.push(el); return res; }
function arrReplace(arr, listweg, listdazu) {
	arrExtend(arr, listdazu);
	listweg.map(x => arrRemovip(arr, x));
	return arr;
}
function arrReplace1(arr, elweg, eldazu) {
	let i = arr.indexOf(elweg);
	arr[i] = eldazu;
	return arr;
}
function arrReplaceAt(arr, index, val, inPlace = true) { return inPlace ? arrReplaceAtInPlace(arr, index, val) : arrReplaceAtCopy(arr, index, val); }
function arrReplaceAtCopy(arr, index, val) {
	let res = new Array();
	for (let i = 0; i < arr.length; i++) {
		if (i == index) res[i] = val; else res[i] = arr[i];
	}
	return res;
}
function arrReplaceAtInPlace(arr, index, val) { arr[index] = val; }
function arrReverse(arr) { return jsCopy(arr).reverse(); }
function arrRotate(arr, count) {
	var unshift = Array.prototype.unshift,
		splice = Array.prototype.splice;
	var len = arr.length >>> 0, count = count >> 0;
	let arr1 = jsCopy(arr);
	unshift.apply(arr1, splice.call(arr1, count % len, len));
	return arr1;
}
function arrShufflip(arr) { if (isEmpty(arr)) return []; else return fisherYates(arr); }
function arrSplitAtIndex(arr, i) {
	return [arr.slice(0, i), arr.slice(i)];
}
function arrSplitByIndices(arr, indices) {
	let [a1, a2] = [[], jsCopy(arr)];
	for (let i = 0; i < indices.length; i++) {
		let el = arr[indices[i]];
		a1.push(el);
		removeInPlace(a2, el);
	}
	return [a1, a2];
}
function arrString(arr, func) {
	if (isEmpty(arr)) return '[]';
	let s = '[';
	for (const el of arr) {
		if (isList(el)) s += arrString(el, func) + ','; else s += (isdef(func) ? func(el) : el) + ',';
	}
	s = s.substring(0, s.length - 1);
	s += ']';
	return s;
}
function arrSum(arr, props) {
	if (nundef(props)) return arr.reduce((a, b) => a + b);
	if (!isList(props)) props = [props];
	return arr.reduce((a, b) => a + (lookup(b, props) || 0), 0);
}
function arrSwap(arr, i, j) { let h = arr[i]; arr[i] = arr[j]; arr[j] = h; }
function arrSwap2d(arr, r1, c1, r2, c2) { let h = arr[r1][c1]; arr[r1][c1] = arr[r2][c2]; arr[r2][c2] = h; }
function arrTail(arr) { return arr.slice(1); }
function arrTake(arr, n = 0, from = 0) {
	if (isDict(arr)) {
		let keys = Object.keys(arr);
		return n > 0 ? keys.slice(from, from + n).map(x => (arr[x])) : keys.slice(from).map(x => (arr[x]));
	} else return n > 0 ? arr.slice(from, from + n) : arr.slice(from);
}
function arrTakeFromEnd(arr, n) {
	if (arr.length <= n) return arr.map(x => x); else return arr.slice(arr.length - n);
}
function arrTakeFromTo(arr, a, b) { return takeFromTo(arr, a, b); }
function arrTakeLast(arr, n, from = 0) {
	let res = [];
	if (isDict(arr)) {
		let keys = Object.keys(arr);
		let ilast = keys.length - 1; for (let i = ilast - from; i >= 0 && i > ilast - from - n; i--) { res.unshift(arr[keys[i]]); }
	} else {
		let ilast = arr.length - 1; for (let i = ilast - from; i >= 0 && i > ilast - from - n; i--) { res.unshift(arr[i]); }
	}
	return res;
}
function arrTakeWhile(arr, func) {
	let res = [];
	for (const a of arr) {
		if (func(a)) res.push(a); else break;
	}
	return res;
}
function arrToFen(board, plStart = 'w') {
	let result = "";
	for (let y = 0; y < board.length; y++) {
		let empty = 0;
		for (let x = 0; x < board[y].length; x++) {
			if (isNumber(board[y][x])) {
				empty += 1; continue;
			}
			let c = board[y][x][0];
			if (c == 'w' || c == 'b') {
				if (empty > 0) {
					result += empty.toString();
					empty = 0;
				}
				if (c == 'w') {
					result += board[y][x][1].toUpperCase();
				} else {
					result += board[y][x][1].toLowerCase();
				}
			} else {
				empty += 1;
			}
		}
		if (empty > 0) {
			result += empty.toString();
		}
		if (y < board.length - 1) {
			result += '/';
		}
	}
	result += ` ${plStart} KQkq - 0 1`;
	return result;
}
function arrToggleMember(arr, el) { if (arr.includes(el)) removeInPlace(arr, el); else arr.push(el); }
function arrToMatrix(arr, rows, cols) {
	let i = 0, res = [];
	for (let r = 0; r < rows; r++) {
		let rarr = [];
		for (let c = 0; c < cols; c++) {
			let a = arr[i]; i++;
			rarr.push(a);
		}
		res.push(rarr);
	}
	return res;
}
function arrWithout(arr, b) { return arrMinus(arr, b); }
function arrZip(arr1, arr2) {
	let res = [];
	for (let i = 0; i < Math.min(arr1, arr2); i++) {
		let o = {};
		addKeys(arr1[i], o);
		addKeys(arr2[i], o);
		res.push(o);
	}
	return res;
}
function asElem(x) { return isString(x) ? mBy(x) : x; }
function asList(x) { return isList(x) ? x : [x]; }
function assertion(cond) {
	if (!cond) {
		let args = [...arguments];
		for (const a of args) {
			console.log('\n', a);
		}
		throw new Error('TERMINATING!!!')
	}
}
function assets_get() {
	where([...arguments]);
	to_server([...arguments], 'assets');
}
function assets_parse(o) {
	where(o);
	for (const k in o) {
		let text = o[k];
		if (k == 'allSyms') {
			symbolDict = Syms = jsyaml.load(text);
			SymKeys = Object.keys(Syms);
		} else if (k == 'symGSG') {
			ByGroupSubgroup = jsyaml.load(text);
		} else if (k == 'allWP') {
			WordP = jsyaml.load(text);
		} else if (k == 'fens') {
			FenPositionList = csv2list(text);
		} else if (startsWith(k, 'db_')) {
			let okey = stringAfter(k, '_');
			DB[okey] = jsyaml.load(text);
		} else {
			window[capitalize(k)] = jsyaml.load(text);
		}
	}
	if (nundef(KeySets) && isdef(o.symGSG)) { KeySets = getKeySets(); }
}
function aSvg(dParent) {
	if (!dParent.style.position) dParent.style.position = 'relative';
	let svg1 = gSvg();
	svg1.setAttribute('width', '100%');
	svg1.setAttribute('height', '100%');
	let style = 'margin:0;padding:0;position:absolute;top:0px;left:0px;';
	svg1.setAttribute('style', style);
	dParent.appendChild(svg1);
	return svg1;
}
function aSvgg(dParent, originInCenter = true) {
	if (!dParent.style.position) dParent.style.position = 'relative';
	let svg1 = gSvg();
	svg1.setAttribute('width', '100%');
	svg1.setAttribute('height', '100%');
	let style = 'margin:0;padding:0;position:absolute;top:0px;left:0px;';
	svg1.setAttribute('style', style);
	dParent.appendChild(svg1);
	let g1 = document.createElementNS('http:/' + '/www.w3.org/2000/svg', 'g');
	svg1.appendChild(g1);
	if (originInCenter) { g1.style.transform = "translate(50%, 50%)"; }
	return g1;
}
async function atest01() {
	let url = '/frontend/static/rsg/assets/gameIconCodes.yml';
	let response = await fetch(url);
	if (response.ok) {
		let t = await response.text();
		let iconDict = jsyaml.load(t);
		timit.showTime('nach atest01')
		console.log(iconDict);
	} else {
		alert("HTTP-Error: " + response.status);
	}
}
async function atest02() {
}
async function atestLoadIcons() {
	timit.showTime('_______start gameIconCode');
	let gaIcons = await route_rsg_asset('gameIconCodes');
	timit.showTime('_______start faIconCodes');
	let faIcons = await route_rsg_asset('faIconCodes');
	timit.showTime('_______start iconTest');
	let smallIcons = await route_rsg_asset('iconTest');
	timit.showTime('nach atestLoadIconst');
	faKeys = [];
	for (const k in gaIcons) {
		if (isdef(faIcons[k])) faKeys.push(k);
	}
	console.log('common keys:', faKeys);
}
function atleastOneElementOfXIsDictWithKey(lst, k) {
	for (const x of lst) { if (!x) continue; if (isDict(x) && k in x) return true; }
	return false;
}
function atleastOneElementOfXIsDictWithKey_obj(lst) {
	for (const x of lst) { if (!x) continue; if (isDict(x) && '_obj' in x) return true; }
	return false;
}
function aTranslateBy(d, x, y, ms) { return d.animate({ transform: `translate(${x}px,${y}px)` }, ms); }
function aTranslateBy_v0(d, x, y, ms) {
	let a = d.animate([
		{ transform: `translate(${x}px,${y}px)` }
	], {
		duration: ms,
	});
	return a;
}
function aTranslateBy_v1(d, x, y, ms) {
	let a = d.animate({ transform: `translate(${x}px,${y}px)` }, ms);
	return a;
}
function aTranslateByEase(d, x, y, ms, easing = 'cubic-bezier(1,-0.03,.27,1)') {
	return d.animate({ transform: `translate(${x}px,${y}px)` }, { easing: easing, duration: ms });
}
function aTranslateFadeBy(d, x, y, ms) { return d.animate({ opacity: .5, transform: `translate(${x}px,${y}px)` }, { easing: MyEasing, duration: ms }); }
function attachTo(div, deck) { deck.mount(div); }
function audio_beep(vol, freq, duration) {
	console.log('sollte beepen!!!');
	if (nundef(_AUDIOCONTEXT)) _AUDIOCONTEXT = new AudioContext();
	let a = _AUDIOCONTEXT;
	v = a.createOscillator()
	u = a.createGain()
	v.connect(u)
	v.frequency.value = freq
	v.type = "square";
	u.connect(a.destination)
	u.gain.value = vol * 0.01
	v.start(a.currentTime)
	v.stop(a.currentTime + duration * 0.001);
}
function audio_onclick_pp() {
	audio_toggle('mozart');
	if (audio_playing()) { hide0('bPlay'); show0('bPause'); } else { hide0('bPause'); show0('bPlay'); }
}
function audio_pause() {
	_qSound = [];
	if (_loaded && isdef(_sndPlayer)) {
		clearTimeout(_TOSound);
		_sndPlayer.onended = null;
		_sndPlayer.onpause = _whenSoundPaused;
		_sndPlayer.pause();
	}
}
function audio_play(key, wait = true) {
	if (!wait) _qSound = [];
	_enqSound(key);
	if (_idleSound) { _idleSound = false; _deqSound(); }
}
function audio_playing() { return DA.isSound; }
function audio_toggle(key) {
	if (DA.isSound == true) { audio_pause(); DA.isSound = false; return; }
	audio_play(key);
	DA.isSound = true;
}
function augment(obj, newobj) {
	return extend(true, obj, newobj);
}
function aushaengen(oid, R) {
	while (true) {
		let uid = firstCondDict(R.rNodes, x => x.oid == oid);
		if (!uid) return;
		let n = R.rNodes[uid];
		let len = Object.keys(R.rNodes).length;
		recRemove(n, R);
		let len2 = Object.keys(R.rNodes).length;
		if (len2 < len) {
		} else {
			console.log('DID NOT REMOVE ANYTHING!!!!', len, len2);
			return;
		}
	}
}
function autocomplete(inp, arr) {
	var currentFocus;
	inp = toElem(inp);
	inp.addEventListener('input', e => {
		var a, b, i, val = this.value;
		autocomplete_closeAllLists();
		if (!val) { return false; }
		currentFocus = -1;
		a = document.createElement('DIV');
		a.setAttribute('id', this.id + 'autocomplete-list');
		a.setAttribute('class', 'autocomplete-items');
		this.parentNode.appendChild(a);
		for (i = 0; i < arr.length; i++) {
			if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
				b = document.createElement('DIV');
				b.innerHTML = '<strong>' + arr[i].substr(0, val.length) + '</strong>';
				b.innerHTML += arr[i].substr(val.length);
				b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
				b.addEventListener('click', e => {
					inp.value = this.getElementsByTagName('input')[0].value;
					autocomplete_closeAllLists();
				});
				a.appendChild(b);
			}
		}
	});
	inp.addEventListener('keydown', e => {
		var x = document.getElementById(this.id + 'autocomplete-list');
		if (x) x = x.getElementsByTagName('div');
		if (e.keyCode == 40) {
			currentFocus++;
			autocomplete_addActive(x);
		} else if (e.keyCode == 38) {
			currentFocus--;
			autocomplete_addActive(x);
		} else if (e.keyCode == 13) {
			e.preventDefault();
			if (currentFocus > -1) {
				if (x) x[currentFocus].click();
			}
		}
	});
	inp.addEventListener('dblclick', e => { evNoBubble(e); });
	document.addEventListener('click', e => {
		autocomplete_closeAllLists(e.target);
	});
}
function autocomplete_addActive(x) {
	if (!x) return false;
	autocomplete_removeActive(x);
	if (currentFocus >= x.length) currentFocus = 0;
	if (currentFocus < 0) currentFocus = x.length - 1;
	x[currentFocus].classList.add('autocomplete-active');
}
function autocomplete_closeAllLists(elmnt) {
	var x = document.getElementsByClassName('autocomplete-items');
	for (var i = 0; i < x.length; i++) {
		if (elmnt != x[i] && elmnt != inp) {
			x[i].parentNode.removeChild(x[i]);
		}
	}
}
function autocomplete_removeActive(x) {
	for (var i = 0; i < x.length; i++) {
		x[i].classList.remove('autocomplete-active');
	}
}
function autoGameScreen() {
}
function autopoll(ms) { TO.poll = setTimeout(_poll, valf(ms, valf(Z.options.poll, 2000))); }
function autoselect_action(r, action, uname, item) { select_action(r, action, uname, item); }
function autosend(plname, slot) {
	Z.uplayer = plname;
	take_turn_collect_open();
}
function autoTestSpeech() {
	ensureSymBySet();
	nextIndex += 1;
	let k = SymKeysBySet['nosymbols'][nextIndex];
	let info = SymbolDict[k];
	let best = stringAfterLast(info.E, '|');
	console.log('best', best, '(key', k, ')');
	record('E', best)
	say(best, .7, 1, .7, false, 'random', () => { console.log('done:', k) });
}
function availableGames(callback) { let route = '/game/available'; _sendRouteJS(route, callback); }
function availablePlayers(callback) { let route = '/game/players'; _sendRouteJS(route, callback); }
//#endregion

//#region functions B
function backtrack_based(orig_board) {
	let board = JSON.parse(JSON.stringify(orig_board));
	for (let r = 0; r < 9; r++) {
		for (let c = 0; c < 9; c++) {
			if (board[r][c] == 0) {
				complete_cell(board, r, c)
				if (is_solved(board)) return board;
				let cell = board[r][c]
				if (Array.isArray(cell)) {
					for (let i = 0; i < cell.length; i++) {
						let board_2 = JSON.parse(JSON.stringify(board));
						board_2[r][c] = cell[i]
						if (completed_board = backtrack_based(board_2)) {
							return completed_board;
						}
					}
					return false
				}
			}
		}
	}
	return false;
}
function badges_off() {
	hide('dLeftSide');
	delete Session.is_badges;
	Badges = [];
}
function badges_on() {
	if (!isdef(mBy('dLeiste'))) initSidebar();
	Session.is_badges = true;
	Badges = [];
}
function bCapturedPieces(plSym, arr, idx, rows, cols, includeDiagonals = true) {
	let res = [];
	let nei = bNei(arr, idx, rows, cols, includeDiagonals);
	for (let dir = 0; dir < 8; dir++) {
		let i = nei[dir];
		if (nundef(i)) continue;
		let el = arr[i];
		if (empty_func(el) || el == plSym) continue;
		let inew = [];
		let MAX = 100, cmax = 0;
		while (isOppPiece(el, plSym)) {
			if (cmax > MAX) break; cmax += 1;
			inew.push(i);
			i = bNeiDir(arr, i, dir, rows, cols);
			if (nundef(i)) break;
			el = arr[i];
		}
		if (el == plSym) {
			res = res.concat(inew);
		}
	}
	return res;
}
function bCheck(r, c, rows, cols) { return r >= 0 && r < rows && c >= 0 && c < cols ? r * cols + c : null; }
function bCreateEmpty(rows, cols) { return new Array(rows * cols).fill(null); }
function beautify_history(lines, title, fen, uplayer) {
	let html = `<div class="history"><span style="color:red;font-weight:bold;">${title}: </span>`;
	for (const l of lines) {
		let words = toWords(l);
		for (const w1 of words) {
			if (is_card_key(w1)) {
				html += mCardText(w1);
				continue;
			}
			w = w1.toLowerCase();
			if (isdef(fen.players[w])) {
				html += `<span style="color:${get_user_color(w)};font-weight:bold"> ${w} </span>`;
			} else html += ` ${w} `;
		}
	}
	html += "</div>";
	return html;
}
function beep(vol, freq, duration) {
	console.log('sollte beepen!!!');
	if (nundef(_AUDIOCONTEXT)) _AUDIOCONTEXT = new AudioContext();
	let a = _AUDIOCONTEXT;
	v = a.createOscillator()
	u = a.createGain()
	v.connect(u)
	v.frequency.value = freq
	v.type = "square";
	u.connect(a.destination)
	u.gain.value = vol * 0.01
	v.start(a.currentTime)
	v.stop(a.currentTime + duration * 0.001);
}
function beforeActivationUI() { uiPaused |= beforeActivationMask; uiPaused &= ~hasClickedMask; }
function being_blackmailed() {
	let [stage, A, fen, uplayer] = [Z.stage, Z.A, Z.fen, Z.uplayer];
	let item = A.items[A.selected[0]];
	let cmd = item.key;
	console.log('selected reaction to blackmail:', item.key);
	if (cmd == 'accept') { Z.stage = 34; ari_pre_action(); }
	else if (cmd == 'reject') { post_reject_blackmail(); }
	else { post_defend_blackmail(); }
}
function bestContrastingColor(color, colorlist) {
	let contrast = 0;
	let result = null;
	let rgb = colorRGB(color, true);
	rgb = [rgb.r, rgb.g, rgb.b];
	for (c1 of colorlist) {
		let x = colorRGB(c1, true)
		x = [x.r, x.g, x.b];
		let c = getContrast(rgb, x);
		if (c > contrast) { contrast = c; result = c1; }
	}
	return result;
}
function bFreeRayDir(arr, idx, dir, rows, cols) {
	let indices = [];
	let i = idx;
	while (i < arr.length) {
		i = bNeiDir(arr, i, dir, rows, cols);
		if (!i || !empty_func(arr[i])) break; else indices.push(i);
	}
	return indices;
}
function bFreeRayDir1(arr, idx, dir, rows, cols) {
	let indices = [];
	let i = idx;
	while (i < arr.length) {
		i = bNeiDir(arr, i, dir, rows, cols);
		if (!i) break;
		else indices.push(i);
		if (!empty_func(arr[i])) break;
	}
	return indices;
}
function bFullCol(arr, icol, rows, cols) {
	let iStart = icol;
	let x = arr[iStart]; if (empty_func(x)) return null;
	for (let i = iStart + cols; i < iStart + (cols * rows); i += cols) if (arr[i] != x) return null;
	return x;
}
function bFullDiag(arr, rows, cols) {
	let iStart = 0;
	let x = arr[iStart]; if (empty_func(x)) return null;
	for (let i = iStart + cols + 1; i < arr.length; i += cols + 1) { if (arr[i] != x) return null; }
	return x;
}
function bFullDiag2(arr, rows, cols) {
	let iStart = cols - 1;
	let x = arr[iStart]; if (empty_func(x)) return null;
	for (let i = iStart + cols - 1; i < arr.length - 1; i += cols - 1) { if (arr[i] != x) return null; }
	return x;
}
function bFullRow(arr, irow, rows, cols) {
	let iStart = irow * cols;
	let x = arr[iStart]; if (empty_func(x)) return null;
	for (let i = iStart + 1; i < iStart + cols; i++) if (arr[i] != x) return null;
	return x;
}
function bGetChunks(arr2d, rowsEach, colsEach) {
	let res = [];
	let [rTotal, cTotal] = [arr2d.length, arr2d[0].length];
	for (let r = 0; r < rTotal; r += rowsEach) {
		let m1 = [];
		for (let c = 0; c < cTotal; c += colsEach) {
			m1 = bGetSubMatrix(arr2d, r, rowsEach, c, colsEach);
			res.push(arrFlatten(m1));
		}
	}
	return res;
}
function bGetChunksWithIndices(arr2d, rowsEach, colsEach) {
	let res = [];
	let [rTotal, cTotal] = [arr2d.length, arr2d[0].length];
	for (let r = 0; r < rTotal; r += rowsEach) {
		let m1 = [];
		for (let c = 0; c < cTotal; c += colsEach) {
			m1 = bGetSubMatrixWithIndices(arr2d, r, rowsEach, c, colsEach);
			res.push(arrFlatten(m1));
		}
	}
	return res;
}
function bGetCol(arr, icol, rows, cols) {
	let iStart = icol;
	let res = [];
	for (let i = iStart; i < iStart + (cols * rows); i += cols) res.push(arr[i]);
	return res;
}
function bGetCols(arr2d) {
	let rows = arr2d.length;
	let cols = arr2d[0].length;
	let res = [];
	for (let c = 0; c < cols; c++) { res.push([]); }
	for (let r = 0; r < rows; r++) {
		for (let c = 0; c < cols; c++) {
			res[c].push(arr2d[r][c]);
		}
	}
	return res;
}
function bGetInitialState() {
}
function bGetRow(arr, irow, rows, cols) {
	let iStart = irow * cols;
	let arrNew = arr.slice(iStart, iStart + cols);
	let res = [];
	for (let i = iStart; i < iStart + cols; i++) res.push(arr[i]);
	console.assert(sameList(arrNew, res), 'NOOOOOO');
	return res;
}
function bGetRows(arr2d) {
	return arr2d;
}
function bGetSubMatrix(arr2d, rFrom, rows, cFrom, cols) {
	let res = []; for (let i = 0; i < rows; i++) res.push([]);
	let [rTotal, cTotal] = [arr2d.length, arr2d[0].length];
	let rIndex = 0;
	for (let r = rFrom; r < rFrom + rows; r++) {
		for (let c = cFrom; c < cFrom + cols; c++) {
			res[rIndex].push(arr2d[r][c]);
		}
		rIndex += 1;
	}
	return res;
}
function bGetSubMatrixWithIndices(arr2d, rFrom, rows, cFrom, cols) {
	let res = []; for (let i = 0; i < rows; i++) res.push([]);
	let [rTotal, cTotal] = [arr2d.length, arr2d[0].length];
	let rIndex = 0;
	for (let r = rFrom; r < rFrom + rows; r++) {
		for (let c = cFrom; c < cFrom + cols; c++) {
			res[rIndex].push({ row: r, col: c, val: arr2d[r][c] });
		}
		rIndex += 1;
	}
	return res;
}
function bgFromPal(ipal_dep, pal) {
	return getpal(ipal_dep, 0, 'b', pal);
}
function bgNum(k, v) {
}
function bid_to_string(bid) { return bid.join(' '); }
function binding01(R) {
	serverData.table.o1.name = 'felix';
	let upd = { oid: 'o1', prop: 'name', ukind: 'valueChange', oldval: 'max', newval: 'felix' };
	let sUpdated = { o1: [upd] };
	updateBindings(sUpdated, R);
}
function binding02(R) {
	let o = serverData.table.o3 = { name: 'ama' };
	let upd = { oid: 'o3', o: o, ukind: 'new' };
	let sCreated = { o3: [upd] };
	updateCreatedBindings(sCreated, R);
}
function blackOrWhite(cssHSLA, maxLumForWhite = 88) {
	let l = getLuminosity(cssHSLA);
	let hue = getHue(cssHSLA);
	if (hue > 40 && hue < 90) maxLumForWhite = 60;
	let result = l <= maxLumForWhite ? 'white' : 'black';
	testHelpers('lum(' + l + '), hue(' + hue + ') : ' + result);
	return result;
}
function blank(card) { clearElement(card.elem); }
function blankExpResult() { }
function blankInputs(d, ilist, blink = true) {
	let inputs = [];
	for (const idx of ilist) {
		let inp = d.children[idx];
		inp.innerHTML = '_';
		if (blink) mClass(inp, 'blink');
		inputs.push({ letter: Goal.word[idx].toUpperCase(), div: inp, index: idx });
	}
	return inputs;
}
function blankOperand2() { }
function blankOperator() { }
function blankWordInputs(wi, n, pos = 'random') {
	let indivInputs = [];
	let remels =
		pos == 'random' ? choose(wi, n)
			: pos == 'notStart' ? arrTake(wi.slice(1, wi.length - 1), n)
				: pos == 'start' ? arrTake(wi, n)
					: takeFromTo(wi, wi.length - n, wi.length);
	for (const el of remels) {
		for (const inp of el.charInputs) { unfillCharInput(inp); }
		indivInputs = indivInputs.concat(el.charInputs);
		el.hasBlanks = true;
		el.nMissing = el.charInputs.length;
		if (n > 1) iDiv(el).onclick = onClickWordInput;
	}
	return { iFocus: null, words: remels, letters: indivInputs };
}
function bluff() {
	const rankstr = '3456789TJQKA2';
	function setup(players, options) {
		let fen = { players: {}, plorder: jsCopy(players), history: {}, stage: 'move', phase: '' };
		let num_cards_needed = players.length * options.max_handsize;
		let num_decks_needed = fen.num_decks = Math.ceil(num_cards_needed / 52);
		let deck = fen.deck = create_fen_deck('n', num_decks_needed);
		shuffle(deck);
		shuffle(fen.plorder);
		fen.turn = [fen.plorder[0]];
		for (const plname of fen.plorder) {
			let handsize = options.min_handsize;
			fen.players[plname] = {
				hand: deck_deal(deck, handsize),
				handsize: handsize,
				name: plname,
				color: get_user_color(plname),
			};
		}
		fen.stage = 0;
		return fen;
	}
	function clear_ack() { if (Z.stage == 1) { bluff_change_to_turn_round(); take_turn_fen(); } }
	function check_gameover(Z) { let pls = get_keys(Z.fen.players); if (pls.length < 2) Z.fen.winners = pls; return valf(Z.fen.winners, false); }
	function activate_ui() { bluff_activate_new(); }
	function present(dParent) { bluff_present(dParent); }
	function stats(dParent) { bluff_stats(dParent); }
	function state_info(dParent) { bluff_state(dParent); }
	return { rankstr, setup, activate_ui, check_gameover, clear_ack, present, state_info, stats };
}
function bluff_ack_uplayer() {
	let [A, fen, stage, uplayer] = [Z.A, Z.fen, Z.stage, Z.uplayer];
	fen.players[uplayer].ack = true;
	ack_player(uplayer);
}
function bluff_activate(fen, plname) {
	console.log('activating for', plname)
}
function bluff_activate_new() {
	let [z, A, fen, stage, uplayer, ui, dt] = [Z, Z.A, Z.fen, Z.stage, Z.uplayer, UI, UI.dOpenTable];
	if (stage == 1) bluff_activate_stage1(); else { bluff_activate_stage0(); if (is_ai_player()) ai_move(1000); }
}
function bluff_activate_stage0() {
	let [z, A, fen, stage, uplayer, ui, dt] = [Z, Z.A, Z.fen, Z.stage, Z.uplayer, UI, UI.dOpenTable];
	if (isdef(fen.lastbid)) show(ui.currentBidItem.button);
	bluff_show_new_bid(dt);
	mLinebreak(dt, 10);
	bluff_button_panel1(dt, fen.newbid, 50);
}
function bluff_activate_stage1() {
	let [z, A, fen, stage, uplayer, ui, dt] = [Z, Z.A, Z.fen, Z.stage, Z.uplayer, UI, UI.dOpenTable];
	if (isdef(DA.ack) && isdef(DA.ack[uplayer])) { console.log('DA.ack', DA.ack); mText('...waiting for ack', dt); return; }
	if (isdef(ui.dHandsize)) mPulse(ui.dHandsize, 2000);
}
function bluff_ai() {
	let [A, fen, uplayer, pl] = [Z.A, Z.fen, Z.uplayer, Z.pl];
	const torank = { _: '_', three: '3', four: '4', five: '5', six: '6', seven: '7', eight: '8', nine: '9', ten: 'T', jack: 'J', queen: 'Q', king: 'K', ace: 'A' };
	const toword = { _: '_', '3': 'three', '4': 'four', '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine', T: 'ten', J: 'jack', Q: 'queen', K: 'king', A: 'ace' };
	let words = get_keys(torank).slice(1);
	let all_hand_cards = aggregate_elements(dict2list(fen.players, 'name'), 'hand');
	let no_twos = all_hand_cards.filter(x => x[0] != '2');
	let rankstr = '3456789TJQKA2';
	sortByRank(all_hand_cards, rankstr);
	let byrank = aggregate_player_hands_by_rank(fen);
	let rank_list = dict2list(byrank, 'rank');
	let unique_ranks = sortByRank(get_keys(byrank));
	let myranks = sortByRank(pl.hand.map(x => x[0]));
	let my_unique = unique_ranks.filter(x => myranks.includes(x));
	rank_list.map(x => { x.mine = myranks.includes(x.rank); x.irank = rankstr.indexOf(x.rank); x.i = x.irank + 100 * x.value; });
	rank_list = rank_list.filter(x => x.rank != '2');
	sortByDescending(rank_list, 'i');
	let maxcount = rank_list[0].value;
	let mymaxcount = rank_list.filter(x => x.mine)[0].value;
	let expected = all_hand_cards.length / 13;
	let nreason = Math.max(1, Math.round(expected * 2));
	let n_twos = all_hand_cards.filter(x => x[0] == '2').length;
	let have2 = firstCond(rank_list, x => x.rank == '2' && x.mine);
	return botbest(rank_list, maxcount, mymaxcount, expected, nreason, n_twos, have2, words, fen);
}
function bluff_button_panel1(dt, bid, sz) {
	let n = bid[0] == '_' ? 1 : Number(bid[0]);
	let arr1 = arrRange(n, n + 5);
	let arr2 = toLetters('3456789TJQKA');
	let arr3 = arrRange(0, 5);
	let arr4 = toLetters('3456789TJQKA');
	let dPanel = mDiv(dt, { gap: 5 });
	[d1, d2, d3, d4] = mColFlex(dPanel, [1, 2, 1, 2]);
	UI.dn1 = create_bluff_input1(d1, arr1, 1, sz, 0); d1.onmouseenter = () => iHigh(UI.panelItems[0]); d1.onmouseleave = () => iUnhigh(UI.panelItems[0]);
	UI.dr1 = create_bluff_input1(d2, arr2, 2, sz, 1); d2.onmouseenter = () => iHigh(UI.panelItems[1]); d2.onmouseleave = () => iUnhigh(UI.panelItems[1]);
	UI.dn2 = create_bluff_input1(d3, arr3, 1, sz, 2); d3.onmouseenter = () => iHigh(UI.panelItems[2]); d3.onmouseleave = () => iUnhigh(UI.panelItems[2]);
	UI.dr2 = create_bluff_input1(d4, arr4, 2, sz, 3); d4.onmouseenter = () => iHigh(UI.panelItems[3]); d4.onmouseleave = () => iUnhigh(UI.panelItems[3]);
}
function bluff_change_to_ack_round(fen, nextplayer) {
	[Z.stage, Z.turn] = [1, [get_admin_player(fen.plorder)]];
	fen.keeppolling = true;
	fen.nextturn = [nextplayer];
}
function bluff_change_to_turn_round() {
	let [fen, stage] = [Z.fen, Z.stage];
	assertion(stage == 1, "ALREADY IN TURN ROUND!!!!!!!!!!!!!!!!!!!!!!");
	Z.stage = 0;
	Z.turn = fen.nextturn;
	Z.round += 1;
	for (const k of ['bidder', 'loser', 'aufheber', 'lastbid', 'lastbidder']) delete fen[k];
	for (const k of ['nextturn', 'keeppolling']) delete fen[k];
	for (const plname of fen.plorder) { delete fen.players[plname].lastbid; }
}
function bluff_clear_panel() {
	for (const item of UI.panelItems) {
		let d = iDiv(item);
		d.innerHTML = '_';
	}
	Z.fen.newbid = ['_', '_', '_', '_'];
}
function bluff_convert2ranks(b) { return [b[0], BLUFF.torank[b[1]], b[2] == '_' ? 0 : b[2], BLUFF.torank[b[3]]]; }
function bluff_convert2words(b) { return [b[0], BLUFF.toword[b[1]], b[2] < 1 ? '_' : b[2], BLUFF.toword[b[3]]]; }
function bluff_generate_random_bid() {
	let [A, fen, uplayer] = [Z.A, Z.fen, Z.uplayer];
	const di2 = { _: '_', three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 'T', jack: 'J', queen: 'Q', king: 'K', ace: 'A' };
	let words = get_keys(di2).slice(1);
	let b = isdef(fen.lastbid) ? jsCopy(fen.lastbid) : null;
	if (isdef(b)) {
		assertion(b[0] >= (b[2] == '_' ? 0 : b[2]), 'bluff_generate_random_bid: bid not formatted correctly!!!!!!!', b)
		let nmax = calc_reasonable_max(fen);
		let n = b[0] == '_' ? 1 : Number(b[0]);
		let done = false;
		if (n > nmax + 1) {
			const di = { '3': 'three', '4': 'four', '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine', T: 'ten', J: 'jack', Q: 'queen', K: 'king', A: 'ace' };
			let rankstr = '3456789TJQKA';
			let w1 = di2[b[1]];
			let idx = isdef(w1) ? rankstr.indexOf(w1) : -1;
			if (idx >= 0 && idx < rankstr.length - 2) {
				let r = rankstr[idx + 1];
				b[1] = di[r];
				done = true;
			}
		}
		if (!done) {
			if (b[3] == '_') { b[2] = 1; b[3] = rChoose(words, 1, x => x != b[1]); }
			else if (b[0] > b[2]) { b[2] += 1; }
			else { b[0] += coin(80) ? 1 : 2; if (coin()) b[2] = b[3] = '_'; }
		}
	} else {
		let nmax = calc_reasonable_max(fen);
		let nmin = Math.max(nmax - 1, 1);
		let arr_nmax = arrRange(1, nmax);
		let arr_nmin = arrRange(1, nmin);
		b = [rChoose(arr_nmax), rChoose(words), rChoose(arr_nmin), rChoose(words)];
		if (b[1] == b[3]) b[3] = rChoose(words, 1, x => x != b[1]);
		if (coin()) b[2] = b[3] = '_';
	}
	fen.newbid = b;
	UI.dAnzeige.innerHTML = bid_to_string(b);
}
function bluff_present(fen, dParent, plname) {
	console.log('fen', fen);
}
function bluff_present_new(dParent) {
	let [dOben, dOpenTable, dMiddle, dRechts] = tableLayoutMR(dParent, 1, 0);
	let [fen, uplayer, ui, stage, dt] = [Z.fen, Z.uplayer, UI, Z.stage, dOpenTable];
	clearElement(dt); mCenterFlex(dt);
	if (stage == 1) { DA.no_shield = true; } else { DA.ack = {}; DA.no_shield = false; }
	bluff_stats_new(dt);
	mLinebreak(dt, 10);
	bluff_show_cards(dt);
	mLinebreak(dt, 4);
	let item = ui.currentBidItem = bluff_show_current_bid(dt);
	hide(item.button);
	mLinebreak(dt, 10);
	if (stage == 1) {
		let loser = fen.loser;
		let msg1 = fen.war_drin ? 'war drin!' : 'war NICHT drin!!!';
		let msg2 = isdef(fen.players[loser]) ? `${capitalize(loser)} will get ${fen.players[loser].handsize} cards!` : `${capitalize(loser)} is out!`;
		mText(`<span style="color:red">${msg1} ${msg2}</span>`, dt, { fz: 22 });
		mLinebreak(dt, 4);
	}
}
function bluff_reset_to_current_bid() { onclick_reload(); }
function bluff_setup(players) {
	let fen = {};
	let deck = fen.deck = get_keys(Aristocards).filter(x => 'r'.includes(x[2]));
	shuffle(deck);
	let pls = fen.players = {};
	for (const uname of players) {
		let pl = pls[uname] = {};
		pl.hand = deck_deal(deck, 2);
	}
	fen.plorder = rPlayerOrder(players);
	fen.turn = [fen.plorder[0]];
	fen.iturn = 0;
	fen.round = [];
	fen.phase = 'create';
	fen.instruction = 'bid!';
	return fen;
}
function bluff_show_cards(dt) {
	let [fen, ui, stage, uplayer] = [Z.fen, UI, Z.stage, Z.uplayer];
	let pl = fen.players[uplayer], upl = ui.players[uplayer] = {};
	mText(stage == 1 ? "all players' cards: " : "player's hand: ", dt); mLinebreak(dt, 2);
	let cards = stage == 1 ? fen.akku : pl.hand;
	cards = sort_cards(cards, false, 'CDSH', true, '3456789TJQKA2');
	let hand = upl.hand = ui_type_hand(cards, dt, { hmin: 160 }, null, '', ckey => ari_get_card(ckey, 150));
	let uname_plays = isdef(fen.players[Z.uname]);;
	let ishidden = stage == 0 && uname_plays && uplayer != Z.uname && Z.mode != 'hotseat';
	if (ishidden) { hand.items.map(x => face_down(x)); }
}
function bluff_show_current_bid(dt) {
	let fen = Z.fen;
	let bid = fen.oldbid = valf(fen.lastbid, ['_', '_', '_', '_']);
	let d = mDiv(dt);
	let content = `${bid_to_string(bid)}`;
	let item = { container: d, label: 'current bid', content: content, caption: 'geht hoch!', handler: handle_gehtHoch };
	apply_skin2(item);
	return item;
}
function bluff_show_new_bid(dt) {
	let fen = Z.fen;
	let bid = fen.oldbid = valf(fen.lastbid, ['_', '_', '_', '_']);
	fen.newbid = jsCopy(bid);
	let d = mDiv(dt);
	let content = `${bid_to_string(bid)}`;
	let item = { container: d, label: 'YOUR bid', content: content, caption: 'BID', handler: handle_bid };
	apply_skin3(item);
}
function bluff_start_bid(o) {
	let ranks = rChoose(BLUFF.rankstr, 2).map(x => BLUFF.toword[x]);
	let b2 = coin(10) ? '_' : rNumber(1, 4);
	o.fen.lastbid = [rNumber(1, 4), ranks[0], b2, b2 == '_' ? '_' : ranks[1]];
}
function bluff_state(dParent) {
	let user_html = get_user_pic_html(Z.uplayer, 30);
	dParent.innerHTML = `Round ${Z.round}:&nbsp;player: ${user_html} `;
}
function bluff_state_new(dParent) {
	let user_html = get_user_pic_html(Z.uplayer, 30);
	dParent.innerHTML = `Round ${Z.round}:&nbsp;player: ${user_html} `;
}
function bluff_stats(dParent) {
	let player_stat_items = UI.player_stat_items = ui_player_info(dParent, {}, { 'border-width': 1, margin: 10, wmax: 180 });
	let fen = Z.fen;
	for (const plname of fen.plorder) {
		let pl = fen.players[plname];
		let item = player_stat_items[plname];
		let d = iDiv(item); mCenterFlex(d); mLinebreak(d);
		if (fen.turn.includes(plname)) {
			let dh = show_hourglass(plname, d, 20, { left: -4, top: 0 });
		}
		let dhz = mDiv(d, { fg: pl.handsize == Z.options.max_handsize ? 'yellow' : 'white' }, null, `hand: ${pl.handsize}`); mLinebreak(d);
		if (plname == fen.loser) UI.dHandsize = dhz;
		let elem = mDiv(d, { fg: plname == fen.lastbidder ? 'red' : 'white' }, null, `${valf(pl.lastbid, ['_']).join(' ')}`);
		let szhand = getSizeNeeded(dhz);
		let sz = getSizeNeeded(elem);
		let w = Math.max(szhand.w + 20, sz.w + 20, 80);
		mStyle(d, { w: w });
		mLinebreak(d);
	}
	return player_stat_items[Z.uplayer];
}
function bluff_stats_new(dParent) {
	let player_stat_items = UI.player_stat_items = ui_player_info(Z, dParent, {}, { 'border-width': 1, margin: 10, wmax: 180 });
	let fen = Z.fen;
	for (const uname of fen.plorder) {
		let pl = fen.players[uname];
		let item = player_stat_items[uname];
		let d = iDiv(item); mCenterFlex(d); mLinebreak(d);
		if (fen.turn.includes(uname)) {
			let dh = show_hourglass(uname, d, 20, { left: -4, top: 0 });
		}
		let dhz = mDiv(d, { fg: pl.handsize == Z.options.max_handsize ? 'yellow' : 'white' }, null, `hand: ${pl.handsize}`); mLinebreak(d);
		if (uname == fen.loser) UI.dHandsize = dhz;
		let elem = mDiv(d, { fg: uname == fen.lastbidder ? 'red' : 'white' }, null, `${valf(pl.lastbid, ['_']).join(' ')}`);
		let szhand = getSizeNeeded(dhz);
		let sz = getSizeNeeded(elem);
		let w = Math.max(szhand.w + 20, sz.w + 20, 80);
		mStyle(d, { w: w });
		mLinebreak(d);
	}
	return player_stat_items[Z.uplayer];
}
function bNei(arr, idx, rows, cols, includeDiagonals = true) {
	let nei = [];
	let [r, c] = iToRowCol(idx, rows, cols);
	if (r > 0) nei.push(idx - cols); else nei.push(null);
	if (r > 0 && c < cols - 1 && includeDiagonals) nei.push(idx - cols + 1); else nei.push(null);
	if (c < cols - 1) nei.push(idx + 1); else nei.push(null);
	if (r < rows - 1 && c < cols - 1 && includeDiagonals) nei.push(idx + cols + 1); else nei.push(null);
	if (r < rows - 1) nei.push(idx + cols); else nei.push(null);
	if (r < rows - 1 && c > 0 && includeDiagonals) nei.push(idx + cols - 1); else nei.push(null);
	if (c > 0) nei.push(idx - 1); else nei.push(null);
	if (r > 0 && c > 0 && includeDiagonals) nei.push(idx - cols - 1); else nei.push(null);
	return nei;
}
function bNeiDir(arr, idx, dir, rows, cols, includeDiagonals = true) {
	let [r, c] = iToRowCol(idx, rows, cols);
	switch (dir) {
		case 0: if (r > 0) return (idx - cols); else return (null);
		case 1: if (r > 0 && c < cols - 1 && includeDiagonals) return (idx - cols + 1); else return (null);
		case 2: if (c < cols - 1) return (idx + 1); else return (null);
		case 3: if (r < rows - 1 && c < cols - 1 && includeDiagonals) return (idx + cols + 1); else return (null);
		case 4: if (r < rows - 1) return (idx + cols); else return (null);
		case 5: if (r < rows - 1 && c > 0 && includeDiagonals) return (idx + cols - 1); else return (null);
		case 6: if (c > 0) return (idx - 1); else return (null);
		case 7: if (r > 0 && c > 0 && includeDiagonals) return (idx - cols - 1); else return (null);
	}
	return null;
}
function boa_save() { localStorage.setItem('boa', JSON.stringify(S)); }
function boa_start() {
	let d = mBy('dBoa');
	mClear(d);
	mAppend(d, get_header_top('Log In'));
	mAppend(d, get_red_header('Mobile and Online Bill Pay', true));
	mAppend(d, get_boa_start_content());
	let footer = mAppend(d, get_boa_footer1());
	mStyle(footer, { matop: 100, hmax: 150 });
	S.boa_loggedin = false;
}
function boahavecode_start() {
	let d = mBy('dBoa');
	mClear(d);
	mAppend(d, get_header_top('Extra Security At Sign-in'));
	mAppend(d, get_red_header('Verify Your Identity'));
	add_havecode_content(d);
	mAppend(d, get_boa_footer2());
	S.boa_state = 'authorization_pending';
	console.log(S.boa_authorization_code);
}
function boalogin_start() {
	console.log('boalogin_start');
	let d = mBy('dBoa');
	mClear(d);
	mAppend(d, get_header_top(''));
	mAppend(d, get_red_header('Log In to Online Banking'));
	mAppend(d, get_boalogin_html());
	mAppend(d, get_boa_footer2());
	S.boa_state = 'loginform';
	let elem = get_boa_userid_input();
	elem.onfocus = () => { bw_symbol_pulse(); S.current_input = get_boa_userid_input(); S.current_label = 'userid'; };
	let elem2 = get_boa_pwd_input();
	elem2.onfocus = () => { bw_symbol_pulse(); S.current_input = get_boa_pwd_input(); S.current_label = 'pwd'; };
}
function boamain_start() {
	S.boa_state = 'authorized';
	if (DA.challenge == 1) {
		TO.boa = setTimeout(() => {
			S.boa_state = null;
			let msg = DA.challenge == 1 ? 'CONGRATULATIONS!!!! YOU SUCCEEDED IN LOGGING IN TO BOA' : 'Session timed out!';
			show_eval_message(true, null, onclick_home);
		}, 1000);
	} else if (DA.challenge == 3) show_bill_button();
	show_correct_location('boa');
	let dParent = mBy('dBoa'); mClear(dParent);
	let d0 = mDiv(dParent, { align: 'center' }, 'dBoaMain'); mCenterFlex(d0);
	let [wtotal, wleft, wright] = [972, 972 - 298, 292];
	let d = mDiv(d0, { w: wtotal, hmin: 500 }); mAppend(d, createImage('boamain_header.png', { h: 111 }));
	let dl = mDiv(d, { float: 'left', w: wleft, hmin: 400 });
	let dr = mDiv(d, { float: 'right', hmin: 400, w: wright });
	mDiv(dr, { h: 100 });
	mAppend(dr, createImage('boamain_rechts.png', { w: 292 }));
	mAppend(dl, createImage('boamain_left_top.jpg', { matop: 50, maleft: -20 }));
	mDiv(dl, { bg: '#857363', fg: 'white', fz: 15 }, null, '&nbsp;&nbsp;<i class="fa fa-caret-down"></i>&nbsp;&nbsp;Default Group<div style="float:right;">Sort&nbsp;&nbsp;</div>');
	let boadata = get_fake_boa_data_list();
	let color_alt = '#F9F7F4';
	let i = 0;
	for (const o of boadata) {
		let k = o.key;
		o.index = i;
		let logo = valf(o.logo, 'defaultacct.jpg');
		let path = `${logo}`;
		let [sz, bg] = [25, i % 2 ? 'white' : color_alt];
		let dall = mDiv(dl, { bg: bg, fg: '#FCFCFC', 'border-bottom': '1px dotted silver' }, `dAccount${i}`);
		let da = mDiv(dall);
		mFlexLR(da);
		let img = createImage(path, { h: sz, margin: 10 });
		let da1 = mDiv(da);
		mAppend(da1, img);
		let dtext = mDiv(da1, { align: 'left', display: 'inline-block', fg: '#FCFCFC', fz: 14 });
		mAppend(dtext, mCreateFrom(`<a>${k}</a>`));
		let dsub = mDiv(dtext, { fg: 'dimgray', fz: 12 }, null, o.sub);
		let da2 = mDiv(da); mFlex(da2);
		let da21 = mDiv(da2, { w: 100, hmargin: 20, mabottom: 20 });
		let padinput = 7;
		mDiv(da21, { fg: 'black', fz: 12, weight: 'bold' }, null, 'Amount');
		mDiv(da21, { w: 100 }, null, `<input onfocus="add_make_payments_button(event)" style="color:dimgray;font-size:14px;border:1px dotted silver;padding:${padinput}px;width:85px" id="inp${i}" name="authocode" value="$" type="text" />`);
		let da22 = mDiv(da2, { maright: 10 });
		mDiv(da22, { fg: 'black', fz: 12, weight: 'bold' }, null, 'Deliver By');
		mDiv(da22, {}, null, `<input style="color:dimgray;font-size:12px;border:1px dotted silver;padding:${padinput}px" id="inpAuthocode" name="authocode" value="" type="date" />`);
		let dabot = mDiv(dall);
		mFlexLR(dabot);
		let lastpayment = isdef(o['Last Payment']) ? `Last Payment: ${o['Last Payment']}` : ' ';
		mDiv(dabot, { fz: 12, fg: '#303030', maleft: 10, mabottom: 25 }, null, `${lastpayment}`);
		mDiv(dabot, { fz: 12, fg: 'blue', maright: 90, mabottom: 25 }, null, `<a>Activity</a>&nbsp;&nbsp;&nbsp;<a>Reminders</a>&nbsp;&nbsp;&nbsp;<a>AutoPay</a>`);
		mDiv(dall);
		i++;
	}
}
function board_to_fen(board) {
	let result = "";
	for (let y = 0; y < board.length; y++) {
		let empty = 0;
		for (let x = 0; x < board[y].length; x++) {
			let c = board[y][x][0];
			if (c == 'w' || c == 'b') {
				if (empty > 0) {
					result += empty.toString();
					empty = 0;
				}
				if (c == 'w') {
					result += board[y][x][1].toUpperCase();
				} else {
					result += board[y][x][1].toLowerCase();
				}
			} else {
				empty += 1;
			}
		}
		if (empty > 0) {
			result += empty.toString();
		}
		if (y < board.length - 1) {
			result += '/';
		}
	}
	result += ' w KQkq - 0 1';
	return result;
}
function boardArrOmitFirstRowCol(boardArr, rows, cols) {
	let res = [];
	for (let r = 1; r < rows; r++) {
		for (let c = 1; c < cols; c++) {
			let i = iFromRowCol(r, c, rows, cols);
			res.push(boardArr[i]);
		}
	}
	return res;
}
function boardArrReduced(boardArr, rows, cols) {
	let res = [];
	for (let r = 1; r < rows; r++) {
		for (let c = 1; c < cols; c++) {
			let i = iFromRowCol(r, c, rows, cols);
			res.push(boardArr[i]);
		}
	}
	return res;
}
function boardTestGetCol() {
	let arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
	let [rows, cols] = [3, 4];
	for (let i = 0; i < cols; i++) {
		let x = bGetCol(arr, i, rows, cols);
		console.log('arr', toBoardString(arr, rows, cols), 'col', i, x);
	}
}
function boardTestGetRow() {
	let arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
	let [rows, cols] = [6, 2];
	for (let i = 0; i < rows; i++) {
		let x = bGetRow(arr, i, rows, cols);
		console.log('arr', toBoardString(arr, rows, cols), 'row', i, x);
	}
}
function BoardToFen() {
	var fenStr = '';
	var rank, file, sq, piece;
	var emptyCount = 0;
	for (rank = RANKS.RANK_8; rank >= RANKS.RANK_1; rank--) {
		emptyCount = 0;
		for (file = FILES.FILE_A; file <= FILES.FILE_H; file++) {
			sq = FR2SQ(file, rank);
			piece = brd_pieces[sq];
			if (piece == PIECES.EMPTY) {
				emptyCount++;
			} else {
				if (emptyCount != 0) {
					fenStr += String.fromCharCode('0'.charCodeAt() + emptyCount);
				}
				emptyCount = 0;
				fenStr += PceChar[piece];
			}
		}
		if (emptyCount != 0) {
			fenStr += String.fromCharCode('0'.charCodeAt() + emptyCount);
		}
		if (rank != RANKS.RANK_1) {
			fenStr += '/'
		} else {
			fenStr += ' ';
		}
	}
	fenStr += SideChar[brd_side] + ' ';
	if (brd_enPas == SQUARES.NO_SQ) {
		fenStr += '- '
	} else {
		fenStr += PrSq(brd_enPas) + ' ';
	}
	if (brd_castlePerm == 0) {
		fenStr += '- '
	} else {
		if (brd_castlePerm & CASTLEBIT.WKCA) fenStr += 'K';
		if (brd_castlePerm & CASTLEBIT.WQCA) fenStr += 'Q';
		if (brd_castlePerm & CASTLEBIT.BKCA) fenStr += 'k';
		if (brd_castlePerm & CASTLEBIT.BQCA) fenStr += 'q';
	}
	fenStr += ' ';
	fenStr += brd_fiftyMove;
	fenStr += ' ';
	var tempHalfMove = brd_hisPly;
	if (brd_side == COLOURS.BLACK) {
		tempHalfMove--;
	}
	fenStr += tempHalfMove / 2;
	return fenStr;
}
function boardToNode(state) {
	let res = new Array();
	for (let i = 0; i < state.length; i++) {
		if (state[i] == null) res[i] = ' ';
		else res[i] = state[i];
	}
	return res;
}
function boaverify_start() {
	let d = mBy('dBoa');
	mClear(d);
	mAppend(d, get_header_top('Extra Security At Sign-in'));
	mAppend(d, get_red_header('Verify Your Identity'));
	add_verify_content(d);
	mAppend(d, get_boa_footer2());
}
function book_animals_1() {
	let pics = {};
	for (const k of KeySets.animals) {
		let item = miPic(k, dContent)
		pics[k] = item;
	}
	return { pics: pics, play: () => { } };
}
function book_blaettern(page) {
	if (DA.currentpage != page && isNumber(DA.currentpage)) mStyleRemove(dFooter.children[DA.currentpage], 'fg');
	mStyle(dFooter.children[page], { fg: 'yellow' });
	DA.currentpage = page;
	dTitle.innerHTML = DA.currentbook.title + ' pg.' + page;
}
function book_cs_1() {
	let o = mCanvas(dContent, { w: 600, h: 300 }, {}, startloop, pauseloop, 'cc');
	o.draw = draw_random_walk;
	return o;
}
function book_cs_2() {
	let o = mCanvas(dContent, { w: 600, h: 300 }, {}, startloop, pauseloop, 'cc');
	o.draw = draw_perlin_x;
	return o;
}
function book_cs_3() {
	let o = mCanvas(dContent, { w: 600, h: 300 }, {}, startloop, pauseloop, 'cc');
	o.draw = draw_perlin_xy;
	return o;
}
function book_cs_4() {
	let o = mCanvas(dContent, { w: 600, h: 300, bg: 'transparent' }, {}, startloop, pauseloop, 'cc');
	o.draw = draw_random_walk;
	return o;
}
function book_get(id) { return jsCopy(DB.appdata.book.find(x => x.id == id)); }
function book_open(item) {
	console.log('BOOK OPEN!!!!!!!!!!!!!!!');
	let d = iDiv(item);
	let dg = mGrid(2, 1, d, { gap: 3, matop: 22 });
	let books = DB.appdata.book;
	for (const book of books) {
		let d1 = mDiv(dg, { fg: rColor(23) }, null, book.title, 'hop1');
		d1.onclick = () => book_open_title(book.id);
	}
}
function book_open_next_page() {
	let page = isNumber(DA.currentpage) ? DA.currentpage + 1 : 1;
	if (page > DA.currentbook.pages) page = 1;
	book_open_page(page);
}
function book_open_page(page) {
	pauseloop(); iClear(dContent);
	book_blaettern(page);
	let book = G = book_get(dContent.getAttribute('book'));
	let func = window[`book_${book.id}_${page}`];
	let o = G.canvas = func();
	iReg(o);
	dButtons = G.canvas.controls;
	addKeys(G, window);
	o.play();
}
function book_open_prev_page() {
	let page = isNumber(DA.currentpage) ? DA.currentpage - 1 : DA.currentbook.pages;
	if (page < 1) page = DA.currentbook.pages;
	book_open_page(page);
}
function book_open_title(id, page) {
	clear_all();
	dTable = mSection({ bg: DB.apps.book.color }, 'dTable', null, null, 'bookgrid');
	let book = DA.currentbook = book_get(id);
	dTitle = mDiv(dTable, {}, null, book.title)
	mButtonX(dTable, () => mClear(dTable), pos = 'tr', sz = 25, color = 'white')
	dContent = mDiv(dTable, {}, 'dContent'); mCenterCenterFlex(dContent);
	dContent.setAttribute('book', id);
	let footer = dFooter = mDiv(dTable, { align: 'center' });
	maButton('<', () => book_open_prev_page(), footer);
	for (const p of range(1, book.pages)) {
		maButton(p, () => book_open_page(p), footer);
	}
	maButton('>', () => book_open_next_page(), footer);
	book_open_page(valf(page, 1));
}
function BookMove() {
	var gameLine = printGameLine();
	var bookMoves = [];
	var lengthOfLineHack = gameLine.length;
	if (gameLine.length == 0) lengthOfLineHack--;
	for (var bookLineNum = 0; bookLineNum < brd_bookLines.length; ++bookLineNum) {
		if (LineMatch(brd_bookLines[bookLineNum], gameLine) == BOOL.TRUE) {
			var move = brd_bookLines[bookLineNum].substr(lengthOfLineHack + 1, 4);
			if (move.length == 4) {
				var from = SqFromAlg(move.substr(0, 2));
				var to = SqFromAlg(move.substr(2, 2));
				varInternalMove = ParseMove(from, to);
				bookMoves.push(varInternalMove);
			}
		}
	}
	console.log("Total + " + bookMoves.length + " moves in array");
	if (bookMoves.length == 0) return NOMOVE;
	var num = Math.floor(Math.random() * bookMoves.length);
	return bookMoves[num];
}
function bot_clairvoyant(list, maxvalue, mmax, exp, nreas, n2, have2, words, fen) {
	let reduced_list = list.filter(x => x.value == list[0].value || x.mine);
	let res = reduced_list.length >= 2 ? rChoose(list, 2) : [reduced_list[0], { value: 0, rank: '_' }];
	let max = res[0].value >= res[1].value ? res[0] : res[1]; let min = res[0].value < res[1].value ? res[0] : res[1];
	let b = [max.value, max.rank, min.value, min.rank];
	if (isdef(fen.lastbid)) {
		let [n1, r1, n2, r2] = bluff_convert2ranks(fen.lastbid);
		if (!is_bid_higher_than(bluff_convert2words(b), fen.lastbid)) {
			return [null, handle_gehtHoch];
		}
	}
	return [bluff_convert2words(b), handle_bid];
}
function bot_perfect(list, max, mmax, exp, nreas, n2, have2, words, fen) {
	let i = 0; while (list[i].rank == '2') i++;
	let b = [list[i].value + n2, list[i].rank, list[i + 1].value, list[i + 1].rank];
	list.map(x => console.log(x));
	console.log('b:', b);
	if (isdef(fen.lastbid)) {
		let [n1, r1, n2, r2] = bluff_convert2ranks(fen.lastbid);
		if (!is_bid_higher_than(bluff_convert2words(b), fen.lastbid)) {
			return [null, handle_gehtHoch];
		}
	}
	return [bluff_convert2words(b), handle_bid];
}
function bot_random(list, max, mmax, exp, nreas, n2, have2, words, fen) {
	let ranks = rChoose('3456789TJQKA', 2);
	let b;
	if (nundef(fen.lastbid)) b = [rNumber(1, nreas), ranks[0], rNumber(1, nreas), ranks[1]];
	else if (fen.lastbid[0] > nreas + 2) {
		return [null, handle_gehtHoch];
	} else {
		[n1, r1, n2, r2] = bluff_convert2ranks(fen.lastbid);
		assertion(isNumber(n1) && n1 > 0 && isNumber(n2), 'bot_random: n1 or n2 is not a number OR n1<=0!!!!!!!', n1, n2);
		if ((n1 + n2) / 2 > nreas && coin(50)) {
			return [null, handle_gehtHoch];
		} else if ((n1 + n2) / 2 <= nreas + 1) b = n1 <= nreas + 1 ? [n1 + 1, r1, n2, r2] : [n1, r1, n2 + 1, r2];
		else {
			let [i1, i2] = [BLUFF.rankstr.indexOf(r1), BLUFF.rankstr.indexOf(r2)];
			let s = '3456789TJQKA';
			let imin = Math.min(i1, i2); let imax = Math.max(i1, i2); let i = imax == i1 ? 1 : 2;
			let [smin, between, smax] = [s.substring(0, imin), s.substring(imin + 1, imax), s.substring(imax + 1, s.length)];
			if (!isEmpty(smax)) { if (i == 1) b = [n1, rChoose(smax), n2, r2]; else b = [n1, r1, n2, rChoose(smax)]; }
			else if (!isEmpty(between)) { if (i == 2) b = [n1, rChoose(between), n2, r2]; else b = [n1, r1, n2, rChoose(between)]; }
			else return [null, handle_gehtHoch];
		}
	}
	return [bluff_convert2words(b), handle_bid];
}
function botbest(list, max, mmax, exp, nreas, n2, have2, words, fen) {
	if (nundef(DA.ctrandom)) DA.ctrandom = 1; console.log(`${DA.ctrandom++}: ${Z.uplayer} using strategy`, Z.strategy)
	let bot = window[`bot_${Z.strategy}`];
	let [b, f] = bot(list, max, mmax, exp, nreas, n2, have2, words, fen);
	assertion(!b || b[2] != 0, 'bot returned bid with n2==0');
	return [b, f];
}
function bottom_elem_from_to(arr1, arr2) { last_elem_from_to(arr1, arr2); }
function bottom_elem_from_to_top(arr1, arr2) { arr2.unshift(arr1.pop()); }
function bPartialCol(arr, icol, rows, cols) {
	let iStart = icol;
	let x = null;
	for (let i = iStart; i < iStart + (cols * rows); i += cols) { if (empty_func(arr[i])) continue; else if (empty_func(x)) x = arr[i]; else if (arr[i] != x) return null; }
	return x;
}
function bPartialDiag(arr, rows, cols) {
	let iStart = 0;
	let x = null;
	for (let i = iStart; i < arr.length; i += cols + 1) { if (empty_func(arr[i])) continue; else if (empty_func(x)) x = arr[i]; else if (arr[i] != x) return null; }
	return x;
}
function bPartialDiag2(arr, rows, cols) {
	let iStart = cols - 1;
	let x = null;
	for (let i = iStart; i < arr.length - 1; i += cols - 1) {
		if (empty_func(arr[i])) continue; else if (empty_func(x)) x = arr[i]; else if (arr[i] != x) return null;
	}
	return x;
}
function bPartialRow(arr, irow, rows, cols) {
	let iStart = irow * cols;
	let x = null;
	for (let i = iStart; i < iStart + cols; i++) {
		if (empty_func(arr[i])) continue;
		else if (empty_func(x)) x = arr[i];
		else if (arr[i] != x) return null;
	}
	return x;
}
function Branch(start, end) {
	this.start = start;
	this.end = end;
	this.init = [start.x, start.y, end.x, end.y];
	this.children = [];
	this.finished = false;
	this.get_healthy_end = () => { return createVector(this.init[2], this.init[3]); }
	this.repair = () => {
		this.start.x = this.init[0];
		this.start.y = this.init[1];
		this.end.x = this.init[2];
		this.end.y = this.init[3];
	}
	this.jitter = () => {
		this.end.x += random(-1, 1);
		this.end.y += random(-1, 1);
	}
	this.show = () => {
		stroke(255);
		line(this.start.x, this.start.y, this.end.x, this.end.y)
	}
	this.branch = (angle, factor = .67) => {
		let dir = p5.Vector.sub(this.end, this.start);
		dir.rotate(angle);
		dir.mult(factor);
		let newend = p5.Vector.add(this.end, dir);
		let b = new Branch(this.end, newend);
		this.children.push(b);
		return b;
	}
}
function branch_draw(o) {
	cStyle({ fg: o.color, thickness: o.thickness, cap: 'round' }, CX);
	if (C.root.jitter) cLine(o.p1.x, o.p1.y, o.p2.x + Math.random() * 2 - 1, o.p2.y + Math.random() * 2 - 1, {}, CX);
	else cLine(o.p1.x, o.p1.y, o.p2.x, o.p2.y, {}, CX);
}
function bRayDir(arr, idx, dir, rows, cols) {
	let indices = [];
	let i = idx;
	while (i < arr.length) {
		let i = bNeiDir(arr, i, dir, rows, cols);
		if (!i) break; else indices.push(i);
	}
	return indices;
}
function bringInfoboxToFront(mobj) {
	mobj.elem.style.zIndex = maxZIndex;
	maxZIndex += 1;
}
function bringToFront(ui) {
	ui.style.zIndex = maxZIndex;
	maxZIndex += 1;
}
async function broadcastSIMA(usersPath = './_users.yaml', settingsPath = './_settings.yaml', gamesPath = './_games.yaml', addonsPath = './_addons.yaml') {
	let users = await loadYamlDict(usersPath);
	let settings = await loadYamlDict(settingsPath);
	let games = await loadYamlDict(gamesPath);
	let addons = await loadYamlDict(addonsPath);
	DB = {
		id: 'speechGames',
		users: users,
		settings: settings,
		games: games,
		addons: addons,
	};
	saveSIMA();
	if (CLEAR_LOCAL_STORAGE) localStorage.clear();
	await loadAssetsSIMA('../assets/');
}
function bStrideCol(arr, icol, rows, cols, stride) {
	for (let i = 0; i <= rows - stride; i++) {
		let ch = bStrideColFrom(arr, i, icol, rows, cols, stride);
		if (ch) return ch;
	}
	return null;
}
function bStrideColFrom(arr, irow, icol, rows, cols, stride) {
	if (rows - irow < stride) return null;
	let iStart = irow * cols + icol;
	let x = arr[iStart];
	if (empty_func(x)) return null;
	for (let i = iStart + cols; i < iStart + cols * stride; i += cols) if (arr[i] != x) return null;
	return x;
}
function bStrideDiag2From(arr, irow, icol, rows, cols, stride) {
	if (rows - irow < stride || icol - stride + 1 < 0) return null;
	let iStart = irow * cols + icol;
	let x = arr[iStart];
	if (empty_func(x)) return null;
	for (let i = iStart + cols - 1; i < iStart + (cols - 1) * stride; i += cols - 1) if (arr[i] != x) return null;
	return x;
}
function bStrideDiagFrom(arr, irow, icol, rows, cols, stride) {
	if (rows - irow < stride || cols - icol < stride) return null;
	let iStart = irow * cols + icol;
	let x = arr[iStart];
	if (empty_func(x)) return null;
	for (let i = iStart + cols + 1; i < iStart + (cols + 1) * stride; i += cols + 1) if (arr[i] != x) return null;
	return x;
}
function bStrideRow(arr, irow, rows, cols, stride) {
	for (let i = 0; i <= cols - stride; i++) {
		let ch = bStrideRowFrom(arr, irow, i, rows, cols, stride);
		if (ch) return ch;
	}
	return null;
}
function bStrideRowFrom(arr, irow, icol, rows, cols, stride) {
	if (cols - icol < stride) return null;
	let iStart = irow * cols + icol;
	let x = arr[iStart];
	if (empty_func(x)) return null;
	for (let i = iStart + 1; i < iStart + stride; i++) if (arr[i] != x) return null;
	return x;
}
function bTest01() {
	let arr = [1, 1, 1, 1, 2, 1, 0, 1, 0], rows = 3, cols = 3, irow = 0;
	console.log(bFullRow(arr, irow, rows, cols));
	console.log('____________')
	arr = [1, 1, 1, 1, 2, 1, 1, 1, 0], rows = 3, cols = 3, irow = 2;
	console.log(bFullRow(arr, irow, rows, cols));
	console.log('____________')
	arr = [1, 1, 1, 1, 2, 1, 1, 1, 0], rows = 3, cols = 3, icol = 0;
	console.log(bFullCol(arr, icol, rows, cols));
	console.log('____________')
	arr = [1, 1, 0, 2, 1, 1, 1, 0, 1], rows = 3, cols = 3;
	console.log(bFullDiag(arr, rows, cols));
	console.log('____________')
	arr = [2, 1, 0, 2, 1, 1, 1, 0, 1], rows = 3, cols = 3;
	console.log(bFullDiag(arr, rows, cols));
	console.log('____________')
	arr = [2, 1, 0, 0, 2, 1, 1, 0, 1], rows = 3, cols = 3;
	console.log(bFullDiag(arr, rows, cols));
	console.log('____________')
	arr = [2, 2, 1, 2, 1, 2, 1, 2, 2], rows = 3, cols = 3;
	console.log(bFullDiag2(arr, rows, cols));
	console.log('____________')
	arr = [2, 1, 0, 0, 0, 1, 0, 0, 1], rows = 3, cols = 3;
	console.log(bFullDiag2(arr, rows, cols));
	console.log('============================')
}
function bTest02() {
	let arr = [1, null, 1, 1, 2, 1, 0, 1, 0], rows = 3, cols = 3, irow = 0;
	console.log(bPartialRow(arr, irow, rows, cols));
	console.log('____________')
	arr = [1, 1, 1, 1, 0, 1, 1, 1, 2], rows = 3, cols = 3, irow = 2;
	console.log(bPartialRow(arr, irow, rows, cols));
	console.log('____________')
	arr = [1, 1, 1, null, 2, 1, 1, 1, 0], rows = 3, cols = 3, icol = 0;
	console.log(bPartialCol(arr, icol, rows, cols));
	console.log('____________')
	arr = [1, 1, 0, 2, null, 1, 1, 0, 1], rows = 3, cols = 3;
	console.log(bPartialDiag(arr, rows, cols));
	console.log('____________')
	arr = [2, 1, 0, 2, 1, 1, 1, 0, 1], rows = 3, cols = 3;
	console.log(bPartialDiag(arr, rows, cols));
	console.log('____________')
	arr = [2, 1, 0, 0, 2, 1, 1, 0, 1], rows = 3, cols = 3;
	console.log(bPartialDiag(arr, rows, cols));
	console.log('____________')
	arr = [2, 2, 1, 2, null, 2, 1, 2, 2], rows = 3, cols = 3;
	console.log(bPartialDiag2(arr, rows, cols));
	console.log('____________')
	arr = [2, 1, 0, 0, 0, 1, 0, 0, 1], rows = 3, cols = 3;
	console.log(bPartialDiag2(arr, rows, cols));
}
function bTest03() {
	let arr = [[0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0],
	['O', 'X', 0, 0, 0, 0, 0],
	['O', 'O', 'O', 'O', 0, 0, 0]]
	let arrf = arrFlatten(arr), rows = 6, cols = 7, irow = 5, stride = 4;
	console.log('arr', arr[5]);
	console.log('stride in row', irow + ':', bStrideRow(arrf, irow, rows, cols, stride));
	console.log('____________');
	arr = [[0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0],
	['O', 'X', 0, 0, 0, 0, 0],
	[0, 0, 0, 'O', 'O', 'O', 0]]
	arrf = arrFlatten(arr), rows = 6, cols = 7, irow = 5, stride = 4;
	console.log('arr', arr[5]);
	console.log('stride in row', irow + ':', bStrideRow(arrf, irow, rows, cols, stride));
	console.log('____________');
	arr = [[0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0],
	['O', 'X', 0, 0, 0, 0, 0],
	[0, 'O', 'O', 'O', 'O', 0, 0]]
	arrf = arrFlatten(arr), rows = 6, cols = 7, irow = 5, stride = 4;
	console.log('arr', arr[5]);
	console.log('stride in row', irow + ':', bStrideRow(arrf, irow, rows, cols, stride));
	console.log('____________');
	arr = [[0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0],
	['O', 'X', 0, 0, 0, 0, 0],
	[0, 0, 0, 'O', 'O', 'O', 'O']]
	arrf = arrFlatten(arr), rows = 6, cols = 7, irow = 5, stride = 4;
	console.log('arr', arr[5]);
	console.log('stride in row', irow + ':', bStrideRow(arrf, irow, rows, cols, stride));
	console.log('____________');
}
function bTest04() {
	let arr = [[0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0],
	['O', 0, 0, 0, 0, 0, 0],
	['O', 0, 0, 0, 0, 0, 0],
	['O', 'X', 0, 0, 0, 0, 0],
	['O', 'O', 'O', 'O', 0, 0, 0]]
	let arrf = arrFlatten(arr), rows = 6, cols = 7, icol = 0, stride = 4;
	console.log('stride in col', icol + ':', bStrideCol(arrf, icol, rows, cols, stride));
	console.log('____________');
	arr = [[0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 'X', 0, 0],
	['O', 0, 0, 0, 'X', 0, 0],
	['O', 0, 0, 0, 'O', 0, 0],
	['O', 'X', 0, 0, 'X', 0, 0],
	['O', 'O', 'O', 'O', 0, 0, 0]]
	arrf = arrFlatten(arr), rows = 6, cols = 7, icol = 4, stride = 4;
	console.log('stride in col', icol + ':', bStrideCol(arrf, icol, rows, cols, stride));
	console.log('____________');
	arr = [[0, 0, 'X', 0, 'X', 0, 0],
	[0, 0, 0, 0, 'X', 0, 0],
	['O', 0, 0, 0, 'X', 0, 0],
	['O', 0, 0, 0, 'X', 0, 0],
	['O', 'X', 0, 0, 'O', 0, 0],
	['O', 'O', 'O', 'O', 0, 0, 0]]
	arrf = arrFlatten(arr), rows = 6, cols = 7, icol = 4, stride = 4;
	console.log('stride in col', icol + ':', bStrideCol(arrf, icol, rows, cols, stride));
	console.log('____________');
}
function bTest05() {
	let arr = [
		[0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0],
		['O', 0, 0, 0, 0, 0, 0],
		[0, 'O', 0, 0, 0, 0, 0],
		['O', 'X', 'O', 0, 0, 0, 0],
		['O', 'O', 'O', 'O', 0, 0, 0]]
	let arrf = arrFlatten(arr), rows = 6, cols = 7, irow = 2, icol = 0, stride = 4;
	console.log('stride in diag', irow, icol + ':', bStrideDiagFrom(arrf, irow, icol, rows, cols, stride));
	console.log('____________');
	arr = [
		[0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 'X', 0],
		['O', 0, 0, 0, 0, 0, 'X'],
		[0, 'O', 0, 0, 0, 0, 0],
		['O', 'X', 'O', 0, 0, 0, 0],
		['O', 'O', 'O', 'O', 0, 0, 0]]
	arrf = arrFlatten(arr), rows = 6, cols = 7, irow = 1, icol = 5, stride = 4;
	console.log('stride in diag', irow, icol + ':', bStrideDiagFrom(arrf, irow, icol, rows, cols, stride));
	console.log('____________');
	arr = [
		[0, 0, 0, 0, 0, 0, 'X'],
		[0, 0, 0, 0, 0, 'X', 0],
		['O', 0, 0, 0, 'X', 0, 'X'],
		[0, 'O', 0, 'X', 0, 0, 0],
		['O', 'X', 'O', 0, 0, 0, 0],
		['O', 'O', 'O', 'O', 0, 0, 0]]
	arrf = arrFlatten(arr), rows = 6, cols = 7, irow = 0, icol = 6, stride = 4;
	console.log('stride in diag2', irow, icol + ':', bStrideDiag2From(arrf, irow, icol, rows, cols, stride));
	console.log('____________');
	arr = [
		[0, 0, 0, 0, 0, 0, 'X'],
		[0, 0, 0, 0, 0, 'X', 0],
		['O', 0, 0, 'O', 'X', 0, 'X'],
		[0, 'O', 'O', 'X', 0, 0, 0],
		['O', 'O', 'O', 0, 0, 0, 0],
		['O', 'O', 'O', 'O', 0, 0, 0]]
	arrf = arrFlatten(arr), rows = 6, cols = 7, irow = 2, icol = 3, stride = 4;
	console.log('stride in diag2', irow, icol + ':', bStrideDiag2From(arrf, irow, icol, rows, cols, stride));
	console.log('____________');
}
function bTest06() {
	let pos = [
		[0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0],
		[0, 'X', 0, 0, 0, 0, 0],
		[0, 'X', 0, 'O', 0, 0, 0],
		['O', 'X', 0, 'O', 0, 0, 0],
		['O', 'X', 0, 'O', 0, 0, 0]];
	let arr = arrFlatten(pos);
	let str = bStrideCol(arr, 1, 6, 7, 4);
	console.log('stride', str)
	let w = checkWinnerC4(arr, 6, 7, 4);
	printState(arr)
	console.log('w', w);
}
function bTest07() {
	let arr = [0, 0, 0, 0, 0, 0, 0, "X", 0, 0, 0, 0, 0, 0, "X", 0, 0, "X", "X", 0, "O", "X", 0, "X", "O", "O", "O", "X", "O", "X", "O", "O", "O", "X", "O", "O", "X", "O", "O", "O", "X", "O"];
	let w = checkWinnerC4(arr, 6, 7, 4);
	printState(arr)
	console.log('w', w);
}
function bTest08() {
	let arr = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, "X", 0, 0, 0, "X", 0, 0, "O", 0, 0, 0, "O", "X", 0, "O", 0, 0, 0, "O", "X", "O", "O", "O", "O", 0];
	let w = checkWinnerC4(arr, 6, 7, 4);
	printState(arr)
	console.log('w', w);
}
function bTest09() {
	let pos = [
		[0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0],
		[0, 'X', 0, 0, 0],
		[0, 'X', 0, 'O', 0],
		['O', 'X', 0, 'O', 0]];
	let arr = arrFlatten(pos);
	let nei = bNei(arr, 6, 5, 5);
	console.log(nei)
	nei = bNei(arr, 0, 5, 5);
	console.log(nei)
	nei = bNei(arr, 24, 5, 5);
	console.log(nei)
}
function bTest10() {
	let pos = [
		[0, 1, 2, 3, 4, 5],
		[6, 7, 8, 9, 10, 11],
		[12, 13, 14, 15, 16, 17],
		[18, 19, 20, 21, 22, 23],
		[24, 25, 26, 27, 28, 29]];
	let arr = arrFlatten(pos);
	printState(arr);
	let nei = bNei(arr, 6, 6, 6);
	console.log(nei);
	nei = bNei(arr, 7, 6, 6);
	console.log(nei);
	nei = bNei(arr, 16, 6, 6);
	console.log(nei);
}
function btest11_fractions() {
	let a = math.fraction(1, 4);
	let b = math.fraction(1, 4);
	let c = math.multiply(a, b);
	console.log(a, b, c);
	let d = math.add(a, b);
	console.log(d)
	let e = math.multiply(2, a);
	console.log(e)
}
function buildChanav(n, rParent) {
	let parentChanav = convertToList(rParent ? rParent.chanav : R.initialChannels);
	let ownChanav = convertToList(n.chanav);
	let res = ownChanav;
	parentChanav.map(x => addIf(res, x));
	return isEmpty(res) ? null : res.length == 1 ? res[0] : res;
}
function building_is_correct(b) {
	let key = b.keycard.key;
	let list = b.list;
	for (let i = 0; i < list.length; i++) { if (list[i][0] != key[0]) return false; }
	return true;
}
function buildNewSyms() {
	let newSyms = {};
	for (const k of KeySets.all) {
		let info = Syms[k];
		console.log(info)
		delete info.w;
		delete info.h;
		let old = symbolDict[k];
		console.log('old symbol:', old);
		if (isdef(old)) {
			addIf(info.cats, old.group);
			addIf(info.cats, old.subgroups);
		}
		newSyms[k] = Syms[k];
	}
	downloadAsYaml(newSyms, 'newSyms')
}
function buildWordFromLetters(dParent) {
	let letters = Array.from(dParent.children);
	let s = letters.map(x => x.innerHTML);
	s = s.join('');
	return s;
}
function busy_wait_until_slot(slot) {
	let diff = get_slot_diff(Z.fen);
	let dd;
	do {
		dd = last_n_digits(Date.now(), 2);
		if (dd >= slot && dd <= slot + diff) { break; }
	} while (true);
	return dd;
}
function bw_list_entry(d, key, loginOrCard = 'login') {
	let logins = loginOrCard == 'login' ? get_fake_bw_logins() : get_fake_bw_cards();
	let login = logins[key];
	let d4 = mDiv(d, { bg: 'white', fg: 'black', 'border-bottom': '1px dotted #ddd' });
	let d5 = mDiv(d4, { display: 'flex' });
	let dimg = mDiv(d5, { bg: 'white', fg: 'black' }, null, `<img src='../rechnung/images/${login.logo}' height=14 style="margin:8px">`);
	let dtext = mDiv(d5, { cursor: 'pointer' }, null, `<div>${key}</div><div style="font-size:12px;color:gray">${login.sub}</div>`);
	dtext.onclick = () => onclick_bw_symbol(key)
	let d6 = mDiv(d4, { display: 'flex', padding: 2 });
	let disyms = {
		bwtext: { postfix: 'userid', matop: 2, maright: 0, mabottom: 0, maleft: 0, sz: 27 },
		bwcross: { postfix: 'cross', matop: 2, maright: 0, mabottom: 0, maleft: -13, sz: 25 },
		bwkey: { postfix: 'pwd', matop: 0, maright: 0, mabottom: 0, maleft: -12, sz: 27 },
		bwclock: { postfix: 'clock', matop: 0, maright: 0, mabottom: 0, maleft: 0, sz: 25 },
	}
	for (const k of ['bwtext', 'bwcross', 'bwkey']) {
		let o = disyms[k];
		let [filename, styles] = [k, disyms[k]];
		let path = `../rechnung/images/${filename}.png`;
		let [sz, ma] = [styles.sz, `${styles.matop}px ${styles.maright}px ${styles.mabottom}px ${styles.maleft}px`];
		let img = mDiv(d6, { paright: 16 }, null, `<img src='${path}' height=${sz} style="margin:${ma}">`);
		if (k != 'bwcross') {
			mStyle(img, { cursor: 'pointer' });
			img.onclick = () => onclick_bw_symbol(key, o.postfix);
		}
	}
	mFlexSpacebetween(d4);
	return d4;
}
function bw_login_popup() {
	let html = `
				<div id="dBw" class="mystyle" style="background:silver;padding:12px">
						<div id="dBWLogin">
								<form action="javascript:bw_master_password_check()" id="fBitwarden">
										<label for="inputPassword">Enter Master Password:</label>
										<input type="password" id="inputPassword" placeholder="" />
								</form>
								<div id="bw_login_status" style="color:red"></div>
						</div>
				</div>
		`;
	let d = mCreateFrom(html);
	let dParent = mBy('dPopup');
	show(dParent);
	mClear(dParent);
	mStyle(dParent, { top: 50, right: 10 });
	mAppend(dParent, d);
	document.getElementById("inputPassword").focus();
}
function bw_master_password_check() {
	let pw = mBy('inputPassword').value;
	if (pw == S.master_password) {
		S.bw_state = 'loggedin';
		toggle_bw_symbol();
		hide('dPopup');
		if (DA.name == 'Password') {
			show_eval_message(true); DA.name = DA.challenge = null;
		}
	} else if (DA.name == 'Password') {
		DA.name = DA.challenge = null;
		show_eval_message(false, `Fail! the password is ${S.master_password}`);
		mBy('inputPassword').value = '';
		hide('dPopup');
	} else {
		let d = mBy('bw_login_status');
		d.innerHTML = 'Incorrect Master Password';
	}
}
function bw_master_password_renew() {
	let [inp1, inp2] = [document.getElementById('inputPassword'), document.getElementById('inputPassword2')];
	let pw = inp1.value;
	let pw2 = inp2.value;
	let letters = toLetters(pw);
	let minlen = 8;
	let correct = false;
	let d = mBy('dError');
	if (pw.length < minlen) {
		d.innerHTML = `password needs to be at least ${minlen} long!`;
	} else if (!letters.find(x => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.includes(x))) {
		d.innerHTML = 'password needs to contain at least 1 uppercase letter!';
	} else if (!letters.find(x => '0123456789'.includes(x))) {
		d.innerHTML = 'password needs to contain at least 1 digit!';
	} else if (isAlphaNum(pw)) {
		d.innerHTML = 'password needs to contain at least 1 special symbol!';
	} else if (pw !== pw2) {
		d.innerHTML = 'passwords do not match';
	} else correct = true;
	if (correct) {
		console.log('new password has been set!', pw);
		S.master_password = pw;
		boa_save();
		hide('dPopup');
		show_eval_message(true, `Password has been set to ${pw}`); DA.challenge = DA.name = null;
	} else {
		inp1.value = inp2.value = '';
		inp1.focus();
	}
}
function bw_set_new_password_popup() {
	let w = 200;
	let html = `
				<div id="dBw" class="mystyle" style="background:silver;padding:12px">
				<h2 style="text-align:center">Set New Master Password</h2>
				<div id="dBWLogin" style="text-align:right">
								<form action="javascript:bw_master_password_renew()" id="fBitwarden">
										<label for="inputPassword">New Password:</label>
										<input style="width:${w}px" type="password" id="inputPassword" placeholder="" onkeydown="focusNextSiblingOrSubmitOnEnter(event,'inputPassword2')" />
										<br><br><label for="inputPassword2">Repeat Password:</label>
										<input style="width:${w}px" type="password" id="inputPassword2" placeholder="" onkeydown="focusNextSiblingOrSubmitOnEnter(event,'fBitwarden')" />
										<br>
										<div id="dError" style="color:yellow;background:red;text-align:center;margin-top:4px;padding:0px 10px;box-sizing:border-box"></div>
										<br><button onclick="bw_master_password_renew()" >Submit</button>
								</form>
						</div>
				</div>
		`;
	let d = mCreateFrom(html);
	let dParent = mBy('dPopup');
	show(dParent);
	mClear(dParent);
	mStyle(dParent, { top: 50, right: 10 });
	mAppend(dParent, d);
	document.getElementById("inputPassword").focus();
}
function bw_symbol_pulse() { let elem = mBy('tbbw'); if (nundef(elem)) return; else { mPulse1(elem); } }
function bw_widget_popup(key = 'boa') {
	let dpop = mBy('dPopup');
	show(dpop); mClear(dpop)
	mStyle(dpop, { top: 50, right: 10, border: 'silver' });
	let prefix = key;
	let douter = mDiv(dpop, { wmin: 200, bg: 'white', fg: 'black', border: '1px single #ccc' }, 'dBw');
	let d2 = mDiv(douter, { padding: 0, h: 30 }, null, `<img width='100%' src='../rechnung/images/bwsearch.jpg'>`);
	let d = mDiv(douter, { padding: 0, hmax: 600, 'overflow-y': 'auto' });
	let dtb = mDiv(douter, { padding: 8 }); mFlexEvenly(dtb);
	let dibuttons = { tab: { top: 2, left: 0 }, vault: { top: 1, left: 3 }, send: { top: 2, left: 3 }, generator: { top: 2, left: 1 }, settings: { top: 4, left: 2 } };
	for (const bname in dibuttons) {
		let path = `../rechnung/images/bw${bname}.jpg`;
		let db = mDiv(dtb, { w: 60 }); mCenterFlex(db);
		let img = mDiv(db, { h: 36, w: 36, bg: 'white', position: 'relative' }, null, `<img style="position:absolute;top:${dibuttons[bname].top}px;left:${dibuttons[bname].left}px" src='${path}'>`);
		mLinebreak(db);
		let txt = mDiv(db, { fz: 12 }, null, capitalize(bname));
	}
	let d3 = mDiv(d, { bg: '#eee', fg: 'dimgray', padding: 8, matop: 8 }, null, 'LOGINS');
	bw_list_entry(d, key);
	let d7 = mDiv(d, { bg: '#eee', fg: 'dimgray', padding: 7 }, null, 'CARDS');
	let data = get_fake_bw_cards();
	let color_alt = '#F9F7F4';
	let i = 0;
	for (const k in data) {
		let dentry = bw_list_entry(d, k, 'cards');
	}
}
function byEndNodeIds(nid1, nid2) {
}
function byId(id) {
	return lookup(EID, [id]);
}
function byPos(x, y, func) {
	let els = lookup(EC, [y]);
	if (els) {
		let lst = lookup(els, [x]);
		if (lst) {
			return func ? lst.filter(x => func(x)) : lst;
		}
	}
}
function byPos1(x, y, func) {
	let els = byPos(x, y, func);
	if (els && els.length > 0) return els[0];
	return null;
}
function byType(type, func) {
	els = lookup(ET, [type]);
	if (els) {
		return func ? els.filter(x => func(x)) : els;
	}
}
function byType1(type, func) {
	let els = byType(type, func);
	if (els && els.length > 0) return els[0];
	return null;
}
//#endregion

//#region functions C
function C_draw() {
	if (!C.changed) return;
	cClear(CV, CX);
	for (const type in C.items) { let f = get_func(type, 'draw'); for (const item of C.items[type]) { f(item); } }
	C.changed = false;
}
function C_update() { C.root.animated = true; get_func(C.name, 'add')(); }
function cal_num_syms_adaptive() {
	let [uplayer, fen] = [Z.uplayer, Z.fen];
	let pl = fen.players[uplayer];
	pl.score = get_player_score(pl.name);
	let by_score = dict2list(fen.players);
	for (const pl of by_score) { pl.score = get_player_score(pl.name); }
	let avg_score = 0;
	for (const pl of by_score) { avg_score += pl.score; }
	avg_score /= by_score.length;
	let di = { nasi: -3, gul: -3, sheeba: -2, mimi: -1, annabel: 1 };
	let baseline = valf(di[uplayer], 0);
	let dn = baseline + Math.floor(pl.score - avg_score);
	let n = Z.options.num_symbols;
	let nfinal = Math.max(4, Math.min(14, dn + n));
	return nfinal;
}
function calc_bid_minus_cards(fen, bid) {
	let di2 = { _: '_', three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 'T', jack: 'J', queen: 'Q', king: 'K', ace: 'A' };
	let di_ranks = aggregate_player_hands_by_rank(fen);
	let [brauch1, r1, brauch2, r2] = bid;
	[r1, r2] = [di2[r1], di2[r2]];
	if (brauch1 == '_') brauch1 = 0;
	if (brauch2 == '_') brauch2 = 0;
	let hab1 = valf(di_ranks[r1], 0);
	let hab2 = valf(di_ranks[r2], 0);
	let wildcards = valf(di_ranks['2'], 0);
	let diff1 = Math.max(0, brauch1 - hab1);
	let diff2 = Math.max(0, brauch2 - hab2);
	return diff1 + diff2 - wildcards;
}
function calc_building_vps(bs) {
	let res = 0;
	res += bs.farm.length;
	res += bs.estate.length * 2;
	res += bs.chateau.length * 3;
	return res;
}
function calc_ferro_highest_goal_achieved(pl) {
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
	for (const k of Z.fen.availableGoals) {
		if (pl.goals[k]) {
			console.log('player', pl.name, 'already achieved goal', k);
			continue;
		}
		let achieved = di[k];
		if (achieved) {
			return k;
		}
	}
	return null;
}
function calc_ferro_score(roundwinner) {
	let [round, plorder, stage, A, fen, uplayer] = [Z.round, Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer];
	assertion(roundwinner == uplayer, '_calc_ferro_score: roundwinner != uplayer');
	for (const plname of plorder) {
		let pl = fen.players[plname];
		pl.newcards = [];
		if (nundef(pl.score)) pl.score = 0;
		if (uplayer == plname) pl.score -= round * 5;
		else pl.score += calc_hand_value(pl.hand);
	}
}
function calc_fritz_score() {
	let [round, plorder, stage, A, fen, uplayer] = [Z.round, Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer];
	for (const plname of fen.roundorder) {
		let pl = fen.players[plname];
		if (nundef(pl.score)) pl.score = 0;
		else pl.score += calc_hand_value(pl.hand.concat(pl.loosecards), fritz_get_card);
	}
}
function calc_hand_value(hand, card_func = ferro_get_card) {
	let vals = hand.map(x => card_func(x).val);
	let sum = vals.reduce((a, b) => a + b, 0);
	return sum;
}
function calc_hex_col_array(rows, cols) {
	let colarr = [];
	for (let i = 0; i < rows; i++) {
		colarr[i] = cols;
		if (i < (rows - 1) / 2) cols += 1;
		else cols -= 1;
	}
	return colarr;
}
function calc_map_dims() {
	let d = M.dims = {
		pixels: get_map_dims_in_pixel(),
		meters: get_map_dims_in_meters(),
		latlng: get_map_dims_in_lat_lng(),
		zoom: M.map.getZoom(),
	};
	let ppm = M.dims.pixels_per_meter = [d.pixels[0] / d.meters[0], d.pixels[1] / d.meters[1]];
	M.dims.meters_per_pixel = [1 / ppm[0], 1 / ppm[1]];
	let ppll = M.dims.pixels_per_ll = [d.pixels[0] / d.latlng[1], d.pixels[1] / d.latlng[0]];
	M.dims.ll_per_pixel = [1 / ppll[0], 1 / ppll[1]];
	let mpll = M.dims.meters_per_ll = [d.meters[0] / d.latlng[1], d.meters[1] / d.latlng[0]];
	M.dims.ll_per_meters = [1 / mpll[1], 1 / mpll[0]];
}
function calc_maxdepth(maxnodes, rules) {
	let laus = rules.map(x => x.aus).join();
	let lwird = rules.map(x => x.wird).join();
	let naus = countAll(laus, 'ABF');
	let nwird = countAll(lwird, 'ABF');
	let ratio = nwird / naus;
	let pow = 2;
	while (Math.pow(ratio, pow) < maxnodes) pow++;
	return pow - 1;
}
function calc_reasonable_max(fen) {
	let allcards = [];
	for (const plname in fen.players) {
		let pl = fen.players[plname];
		allcards = allcards.concat(pl.hand);
	}
	let ncards = allcards.length;
	let nmax = Math.floor(ncards / 13) + 1;
	return nmax;
}
function calc_speed(oldgoal, newgoal) {
	let speed = Math.abs(newgoal - oldgoal) / 10;
	return speed;
}
function calc_stall_value(fen, plname) { let st = fen.players[plname].stall; if (isEmpty(st)) return 0; else return arrSum(st.map(x => ari_get_card(x).val)); }
function calc_syms(numSyms) {
	let n = numSyms, rows, realrows, colarr;
	if (n == 3) { rows = 2; realrows = 1; colarr = [1, 2]; }
	else if (n == 4) { rows = 2; realrows = 2; colarr = [2, 2]; }
	else if (n == 5) { rows = 3; realrows = 3; colarr = [1, 3, 1]; }
	else if (n == 6) { rows = 3.3; realrows = 3; colarr = [2, 3, 1]; }
	else if (n == 7) { rows = 3; realrows = 3; colarr = [2, 3, 2]; }
	else if (n == 8) { rows = 3.8; realrows = 4; colarr = [1, 3, 3, 1]; }
	else if (n == 9) { rows = 4; realrows = 4; colarr = [2, 3, 3, 1]; }
	else if (n == 10) { rows = 4; realrows = 4; colarr = [2, 3, 3, 2]; }
	else if (n == 11) { rows = 4.5; realrows = 4; colarr = [2, 3, 4, 2]; }
	else if (n == 12) { rows = 5; realrows = 5; colarr = [1, 3, 4, 3, 1]; }
	else if (n == 13) { rows = 5; realrows = 5; colarr = [2, 3, 4, 3, 1]; }
	else if (n == 14) { rows = 5; realrows = 5; colarr = [2, 3, 4, 3, 2]; }
	else if (n == 15) { rows = 5.5; realrows = 5; colarr = [2, 3, 5, 3, 2]; }
	else if (n == 16) { rows = 5.5; realrows = 5; colarr = [2, 3, 5, 4, 2]; }
	else if (n == 17) { rows = 5.5; realrows = 5; colarr = [2, 4, 5, 4, 2]; }
	else if (n == 18) { rows = 5.8; realrows = 5; colarr = [2, 4, 5, 4, 3]; }
	return [rows, realrows, colarr];
}
function calcAddressWithin(o, addr, R) {
	if (!o) return addr;
	if (isLiteral(addr)) {
		if (isString(addr)) {
			if (addr[0] != '.') return addr;
			let props = addr.split('.').slice(1);
			if (props.length == 1 && isEmpty(props[0])) {
				console.log('ERROR!!!!!!!! sollte abgefangen werden!!!! props empty!')
				return o;
			} else if (props.length == 1) {
				return { key: props[0], obj: o };
			}
			else {
				let key = arrLast(props);
				let len = props.length;
				let props1 = props.slice(0, len - 1);
				return { key: key, obj: dPP(o, props1, R) };
			}
		} else {
			return addr;
		}
	}
	else if (isDict(addr)) {
		let content = {};
		for (const k in addr) {
			let c = calcAddressWithin(o, addr[k], R);
			if (c) content[k] = c;
		}
		return content;
	} else if (isList(addr)) {
		let content = addr.map(x => calcAddressWithin(o, x, R));
		return content;
	}
	return null;
}
function calcAristoHandValue(cards) {
	let ranks = cards.map(x => x % 13);
	let total = 0;
	for (const rank of ranks) { total += Math.min(10, rank + 1); }
	return total;
}
function calcBoardDimensions(nuiBoard, R) {
	let boardInfo = nuiBoard.bi.board.info;
	let bParams = nuiBoard.params;
	let fSpacing = bParams.field_spacing;
	if (nundef(fSpacing)) nuiBoard.params.field_spacing = fSpacing = 60;
	let margin = isdef(bParams.padding) ? bParams.padding : 0;
	let gap = fSpacing - nuiBoard.params.sizes.f;
	let [fw, fh] = [fSpacing / boardInfo.wdef, fSpacing / boardInfo.hdef];
	let cornerSize = isEmpty(nuiBoard.bi.corners) ? 0 : isdef(bParams.corners) ? bParams.corners.size : 15;
	let [wBoard, hBoard] = [fw * boardInfo.w + cornerSize, fh * boardInfo.h + cornerSize];
	let [wTotal, hTotal] = [wBoard + 2 * margin, hBoard + 2 * margin];
	nuiBoard.wTotal = wTotal;
	nuiBoard.hTotal = hTotal;
	nuiBoard.wBoard = wBoard;
	nuiBoard.hBoard = hBoard;
	nuiBoard.fSpacing = fSpacing;
	nuiBoard.fw = fw;
	nuiBoard.fh = fh;
	nuiBoard.gap = gap;
	nuiBoard.fSize = fSpacing - gap;
}
function calcBoardDimensionsX(nuiBoard, R) {
	let boardInfo = nuiBoard.bi.board.info;
	let bParams = nuiBoard.params;
	let fSpacing = bParams.field_spacing;
	if (nundef(fSpacing)) nuiBoard.params.field_spacing = fSpacing = 60;
	let margin = isdef(bParams.padding) ? bParams.padding : 0;
	let gap = fSpacing - nuiBoard.params.sizes.f;
	let [fw, fh] = [fSpacing / boardInfo.wdef, fSpacing / boardInfo.hdef];
	let cornerSize = isEmpty(nuiBoard.bi.corners) ? 0 : nuiBoard.params.sizes.c;
	let [wBoard, hBoard] = [fw * boardInfo.w + cornerSize, fh * boardInfo.h + cornerSize];
	let [wTotal, hTotal] = [wBoard + 2 * margin, hBoard + 2 * margin];
	nuiBoard.wTotal = wTotal;
	nuiBoard.hTotal = hTotal;
	nuiBoard.wBoard = wBoard;
	nuiBoard.hBoard = hBoard;
	nuiBoard.fSpacing = fSpacing;
	nuiBoard.fw = fw;
	nuiBoard.fh = fh;
	nuiBoard.gap = gap;
	nuiBoard.fSize = fSpacing - gap;
}
function calcContent_dep(oid, o, path) {
	if (isString(path)) {
		if (path[0] != '.') return path;
		let props = path.split('.').slice(1);
		let content = isEmpty(props) ? o.obj_type : lookup(o, props);
		return content;
	} else if (isDict(path)) {
		let content = {};
		for (const k in path) {
			let c = calcContent_dep(oid, o, path[k]);
			if (c) content[k] = c;
		}
		return content;
	}
	return null;
}
function calcContentFromData(oid, o, data, R, default_data) {
	if (!o) return data;
	if (isLiteral(data)) {
		if (isString(data)) {
			if (data[0] != '.') return data;
			let props = data.split('.').slice(1);
			if (props.length == 1 && isEmpty(props[0])) return o;
			else {
				let res = dPP1(o, props, R);
				if (isdef(res)) return res;
			}
		} else {
			return data;
		}
	}
	else if (isDict(data)) {
		let content = {};
		for (const k in data) {
			let c = calcContentFromData(oid, o, data[k], R);
			if (isdef(c)) content[k] = c;
		}
		return content;
	} else if (isList(data)) {
		let content = data.map(x => calcContentFromData(oid, o, x, R));
		return content;
	}
	if (isdef(default_data)) {
		let finalRes = calcContentFromData(oid, o, default_data, R);
		return finalRes;
	} else return null;
}
function calcCycles(R) {
	let oids = jsCopy(R.locOids);
	let cycles = R.partitions = {};
	let oid2partition = R.oid2partition = {};
	let cid;
	while (!isEmpty(oids)) {
		let oid = oids[0];
		cid = getUID();
		let c = cycles[cid] = { isCycle: false, oids: [] };
		while (true) {
			if (c.oids.includes(oid)) {
				c.isCycle = true;
				break;
			}
			if (isdef(oid2partition[oid])) {
				let cid2 = oid2partition[oid];
				let c2 = cycles[cid2];
				c.oids.map(x => oid2partition[x] = cid2);
				c2.oids = c.oids.concat(c2.oids);
				c = c2;
				delete cycles[cid];
				break;
			} else {
				c.oids.push(oid);
				oid2partition[oid] = cid;
			}
			removeInPlace(oids, oid);
			let o = R.getO(oid);
			if (nundef(o.loc)) break;
			oid = o.loc;
		}
	}
	for (const k in R.partitions) {
		let c = R.partitions[k];
		c.oids.reverse();
		let removed;
		if (!c.isCycle) { removed = c.oids.shift(); }
		for (const oid of c.oids) {
			if (nundef(R.getO(oid)).loc) {
				alert('SORT CYCLES SAFETY CHECK FAILED! no loc in ' + oid);
			}
		}
		if (isdef(removed && isdef(R.getO(removed)).loc)) {
			alert('SORT CYCLES SAFETY CHECK FAILED! removed has loc' + removed);
		}
	}
}
function calcDimsAndSize(cols, lines, dParent, wmax, hmax) {
	let ww, wh, hpercent, wpercent;
	if (isdef(dParent)) {
		let b = getBounds(dParent);
		ww = b.width;
		wh = b.height;
		hpercent = .9;
		wpercent = .9;
	} else if (isdef(wmax) && isdef(hmax)) {
		ww = wmax;
		wh = hmax;
		hpercent = .6;
		wpercent = .6;
	} else {
		ww = window.innerWidth;
		wh = window.innerHeight;
		hpercent = .56;
		wpercent = .64;
	}
	let sz, picsPerLine;
	if (lines > 1) {
		let hpic = wh * hpercent / lines;
		let wpic = ww * wpercent / cols;
		sz = Math.min(hpic, wpic);
		picsPerLine = cols;
	} else {
		let dims = calcRowsColsX(cols);
		let hpic = wh * hpercent / dims.rows;
		let wpic = ww * wpercent / dims.cols;
		sz = Math.min(hpic, wpic);
		picsPerLine = dims.cols;
	}
	pictureSize = Math.max(50, Math.min(sz, 200));
	return [pictureSize, picsPerLine];
}
function calcFieldGaps(sz) {
	sz = Number(sz);
	let s = G.settings;
	s.wGap = s.dxCenter - sz;
	s.hGap = s.dyCenter - sz;
	G.clientBoard = applySettings(G.clientBoard, s);
}
function calcIdUiParent(n, R, uidParent) {
	if (uidParent && isBoardMember(uidParent, R)) {
		let divParent = findAncestorElemOfType(mBy(uidParent), 'div');
		n.idUiParent = divParent.id;
	} else {
		n.idUiParent = uidParent;
	}
}
function calcLayoutParameters(s, b, scale = 1) {
	let [layout, horDist, vertDist, rows, cols] = [s.boardLayout, s.dxCenter, s.dyCenter, s.rows, s.cols];
	let isHexLayout = startsWith(layout, 'hex');
	let hline = isHexLayout ? vertDist * .75 : vertDist;
	if (nundef(rows) || layout == 'circle') rows = Math.floor(s.hFieldArea / hline);
	if (nundef(cols) || layout == 'circle') cols = Math.floor(s.wFieldArea / horDist)
	let [centers, wNeeded, hNeeded] = getCentersFromRowsCols(layout, rows, cols, horDist, vertDist);
	s.nFields = centers.length;
	[b.nFields, b.wNeeded, b.hNeeded, b.centers] = [s.nFields, wNeeded, hNeeded, centers];
	[b.layout, b.rows, b.cols, b.dxCenter, b.dyCenter, b.hline] = [s.boardLayout, rows, cols, horDist, vertDist, hline];
	if (scale != 1) {
		for (const c of centers) {
			c.x = c.x * scale;
			c.y = c.y * scale;
		}
		b.wNeeded *= scale;
		b.hNeeded *= scale;
		b.dxCenter *= scale;
		b.dyCenter *= scale;
		b.hline *= scale;
	}
	return s.nFields;
}
function calcMainVisualPosCenterInGameArea(mobj) {
	let area = UIS['a_d_game'];
	let parent = UIS[mobj.idParent];
	if (nundef(parent.x)) parent = UIS[parent.idParent];
	let offX = 0;
	let offY = 0;
	if (mobj.cat == 'g') { offX = parent.w / 2; offY = parent.h / 2; }
	let x = offX + parent.x + mobj.x;
	let y = offY + parent.y + mobj.y;
	return { x: x, y: y };
}
function calcMemorizingTime(numItems, randomGoal = true) {
	let ldep = Math.max(6, randomGoal ? numItems * 2 : numItems);
	return ldep;
}
function calcNFields(s) {
	let [layout, wCell, hCell, rows, cols] = [s.boardLayout, s.dxCenter, s.dyCenter, s.rows, s.cols];
	let boardSize = { w: s.wFieldArea, h: s.hFieldArea };
	let [w, h] = [boardSize.w, boardSize.h];
	if (layout == 'circle') {
		let hline = layout == 'circle' ? hCell * 1.2 : layout == 'hex' ? hCell * .78 : hCell;
		rows = Math.floor(h / hline);
		cols = Math.floor(w / wCell);
	}
	let n;
	if (layout == 'hex1') {
		let colarr = _calc_hex_col_array(rows, cols);
		n = arrSum(colarr);
	} else if (layout == 'quad') {
		n = rows * cols;
	} else if (layout == 'hex') {
		console.log('rows', rows, 'cols', cols)
		let [cs, wn, hn] = hexCenters(rows, cols, wCell, hCell);
		n = cs.length;
	} else if (layout == 'circle') {
		let [cs, wn, hn] = circleCenters(rows, cols, wCell, hCell);
		n = cs.length;
	}
	return n;
}
function calcNumRowsFitting(dParent, maxHeight, html) {
	let sz = getTextSize(html, dParent);
	return maxHeight / (sz.h + 2);
}
function calcParentContentYOffsetAndWidth(n, parentPadding) {
	let y0 = 0;
	let wTitle = 0;
	if (isdef(n.content)) {
		let uiParent = n.ui;
		let cont = uiParent.firstChild;
		let b = getBounds(cont, true);
		wTitle = b.width;
		if (isdef(n.params.padding)) wTitle += 2 * n.params.padding;
		y0 = parentPadding + b.top + b.height + parentPadding;
	} else y0 = parentPadding;
	return [y0, wTitle];
}
function calcRays(n, gParent, R) {
	if (n.params.dray) {
		let ui = n.ui;
		let buid = n.uidParent;
		let b = R.rNodes[buid];
		let bui = R.UIS[buid];
		let size = 20;
		let fsp = bui.params.field_spacing;
		let info = n.info;
		let x = info.x * fsp;
		let y = info.y * fsp;
		let w = size;
		let h = size;
		let D = distance(0, 0, x, y);
		let p = n.params.dray;
		let rel = p.rel;
		let nanc = n;
		if (rel == 'ancestor') {
			console.log('haaaaaaaaaaaaaaaaalllllllllllllllooooooooooooo')
			while (true) {
				nanc = R.rNodes[nanc.uidParent];
				if (nundef(nanc) || nundef(nanc.oid)) { nanc = null; break; }
				let o = R.getO(nanc.oid);
				let conds = p.cond;
				let tf = evalConds(o, conds);
				if (tf) { break; }
			}
		}
		let by = p.by;
		nby = isNumber(by) ? by : firstNumber(by);
		if (isString(by) && by[by.length - 1] == '%') {
			nby = nby * size / 100;
		}
		let elem = isdef(nanc) ? nanc : rel == 'parent' ? gParent : ui;
		let norm = nby / D;
		let xdisp = x * norm;
		let ydisp = y * norm;
		let txt = n.label.texts;
		let el = n.label.texts[0].ui;
		el.setAttribute('x', xdisp);
		el.setAttribute('y', ydisp);
		if (isdef(n.label.textBackground)) {
			if (n.params.bgText) {
				let tb = n.label.textBackground;
				let tbb = getBounds(tb);
				let origX = tb.getAttribute('x');
				let newX = origX + xdisp;
				tb.setAttribute('x', xdisp - tbb.width / 2);
				let origY = tb.getAttribute('y');
				let newY = origY + ydisp;
				tb.setAttribute('y', ydisp - tbb.height * 4 / 5);
			} else {
				n.label.textBackground.remove();
				delete n.label.textBackground;
			}
		}
	}
}
function calcRowsCols(num, rows, cols) {
	let shape = 'rect';
	if (isdef(rows) && isdef(cols)) {
	} else if (isdef(rows)) {
		cols = Math.ceil(num / rows);
	} else if (isdef(cols)) {
		rows = Math.ceil(num / cols);
	} else if (num == 2) {
		rows = 1; cols = 2;
	} else if ([4, 6, 9, 12, 16, 20, 25, 30, 36, 42, 29, 56, 64].includes(num)) {
		rows = Math.floor(Math.sqrt(num));
		cols = Math.ceil(Math.sqrt(num));
	} else if ([3, 8, 15, 24, 35, 48, 63].includes(num)) {
		let lower = Math.floor(Math.sqrt(num));
		console.assert(num == lower * (lower + 2), 'RECHNUNG FALSCH IN calcRowsCols');
		rows = lower;
		cols = lower + 2;
	} else if (num > 1 && num < 10) {
		shape = 'circle';
	} else if (num > 16 && 0 == num % 4) {
		rows = 4; cols = num / 4;
	} else if (num > 9 && 0 == num % 3) {
		rows = 3; cols = num / 3;
	} else if (0 == num % 2) {
		rows = 2; cols = num / 2;
	} else {
		rows = 1; cols = num;
	}
	return { rows: rows, cols: cols, recommendedShape: shape };
}
function calcRowsColsSizeAbWo(n, wmax, hmax, showLabels, wimax = 200, himax = 200, fw = 1, fh = 1) {
	let rows = n > 35 ? 6 : n > 28 ? 5 : n > 24 && !showLabels || n > 21 ? 4 : n > 8 ? 3 : n > 3 ? 2 : 1;
	let cols = Math.ceil(n / rows);
	return calcSizeAbWo(n, rows, cols, wmax, hmax, wimax, himax, fw, fh);
}
function calcRowsColsX(num) {
	const table = {
		2: { rows: 1, cols: 2 },
		5: { rows: 2, cols: 3 },
		7: { rows: 2, cols: 4 },
		11: { rows: 3, cols: 4 },
	};
	if (isdef(table[num])) return table[num]; else return calcRowsCols(num);
}
function calcScreenSizeNeeded() {
	if (nundef(bodyZoom)) bodyZoom = 1.0;
	let wAreas = ['a_d_actions', 'a_d_game', 'a_d_player', 'a_d_log'];
	let wTotal = 0;
	let wTotal2 = 0;
	for (const a of wAreas) {
		let mobj = UIS[a];
		let b = getBounds(mobj.elem);
		let wIst = Math.round(b.width / bodyZoom);
		wTotal2 += wIst;
	}
	let hAreas = ['a_d_header', 'a_d_status', 'a_d_game', 'a_d_buttons'];
	let hTotal = 0;
	let hTotal2 = 0;
	for (const a of hAreas) {
		let mobj = UIS[a];
		let hSoll = mobj.h;
		hTotal += hSoll;
		let b = getBounds(mobj.elem);
		let hIst = Math.round(b.height);
		hTotal2 += hIst;
	}
	return (window.innerWidth * 100) / wTotal2;
}
function calcSizeAbWo(n, rows, cols, wmax, hmax, wimax = 200, himax = 200, fw = 1, fh = 1) {
	if (nundef(cols)) cols = Math.ceil(n / rows); else if (nundef(rows)) rows = Math.ceil(n / cols);
	let wi = wmax * fw / cols;
	let hi = hmax * fh / rows;
	wi = Math.min(wi, wimax);
	hi = Math.min(hi, himax);
	return [wi, hi, rows, cols];
}
function calcSizeMeasured(n, R) {
	if (isdef(n.info)) {
		return { w: n.info.size, h: n.info.size };
	} else if (n.type == 'grid') {
		calcBoardDimensions(n, R);
		return { w: n.wTotal, h: n.hTotal };
	} else if (n.type == 'hand' || n.ui.style.display == 'flex' && isdef(n.children)) {
		return { w: 0, h: 0 };
	} else {
		let b = getBounds(n.ui, true);
		return { w: b.width, h: b.height };
	}
}
function calcSnailPositions(x, y, d, n) {
	let p = { x: x, y: y };
	let res = [p];
	let step = 1;
	let k = 1;
	while (true) {
		for (i = 0; i < step; i++) {
			if (k < n) {
				p = mup(null, p, d);
				res.push(p);
				k += 1;
			} else return res;
		}
		for (i = 0; i < step; i++) {
			if (k < n) {
				p = mri(null, p, d);
				res.push(p);
				k += 1;
			} else return res;
		}
		step += 1;
		for (i = 0; i < step; i++) {
			if (k < n) {
				p = mdo(null, p, d);
				res.push(p);
				k += 1;
			} else return res;
		}
		for (i = 0; i < step; i++) {
			if (k < n) {
				p = mle(null, p, d);
				res.push(p);
				k += 1;
			} else return res;
		}
		step += 1;
	}
}
function calcStallOrder(players) {
	for (const pl of players) {
		pl.stallValue = calcAristoHandValue(pl.stall);
	}
	let stallOrder = players.map(x => ({ stallValue: x.stallValue, index: x.index }));
	let plSorted = sortBy(stallOrder, 'stallValue').map(x => x.index);
	return plSorted;
}
function calcTotalDims(n, uids, R) {
	let hMax = 0;
	let margin = isdef(n.params.margin) ? n.params.margin : 0;
	let wTotal = margin;
	for (const ch of uids) {
		let n1 = R.uiNodes[ch];
		let w = n1.size.w;
		let h = n1.size.h;
		hMax = Math.max(hMax, h);
		wTotal += w + margin;
	}
	return { w: wTotal, h: hMax + 2 * margin, margin: margin };
}
function calculateDaysBetweenDates(begin, end) {
	var oneDay = 24 * 60 * 60 * 1000;
	var firstDate = new Date(begin);
	var secondDate = new Date(end);
	var diffDays = Math.round(Math.abs((firstDate.getTime() - secondDate.getTime()) / (oneDay)));
	return diffDays;
}
function calculateDims(n, sz = 60, minRows = 1) {
	var rows = minRows;
	var cols = Math.ceil(n / rows);
	var gap = 10;
	var padding = 20;
	let w = 9999999;
	testHelpers('calculateDims with:', rows, cols);
	let rOld = 0;
	while (true) {
		rOld = rows;
		for (var i = Math.max(2, rows); i < n / 2; i++) {
			if (n % i == 0) {
				rows = i;
				cols = n / i;
				break;
			}
		}
		w = padding * 2 - gap + (sz + gap) * cols;
		if (w > window.innerWidth) {
			if (rows == rOld) {
				rows += 1;
				cols = Math.ceil(n / rows);
			} else if (gap > 1) gap -= 1;
			else if (padding > 1) padding -= 2;
			else {
				minRows += 1;
				gap = 6;
				padding = 10;
			}
		} else break;
		if (rows == rOld) break;
	}
	return { rows: rows, cols: cols, gap: gap, padding: padding, width: w };
}
function calculateTopLevelGElement(el) {
	while (el && el.parentNode) {
		let t = getTypeOf(el);
		let tParent = getTypeOf(el.parentNode);
		if (tParent == 'svg') break;
		el = el.parentNode;
	}
	return el;
}
function call_answer(i) { call_func('a' + i); }
function call_func(name) { let f = window[name]; f(); }
function call_question(i) { call_func('q' + i); }
function Camera(scene) {
	this.canvas = scene.canvas;
	this.context = this.canvas.getContext("2d");
	this.cHeight = parseInt(this.canvas.height);
	this.cWidth = parseInt(this.canvas.width);
	this.cameraOffsetX = 0;
	this.cameraOffsetY = 0;
	this.target = false;
	this.waitX = 0;
	this.waitY = 0;
	this.focalPointX = 0;
	this.focalPointY = 0;
	this.moveCamera = function (x, y) {
		this.cameraOffsetX += x;
		this.cameraOffsetY += y;
	}
	this.followSprite = function (sprite, waitX, waitY) {
		this.target = sprite;
		if (typeof waitX != "undefined") {
			this.waitX = waitX;
			this.waitY = waitY;
		}
	}
	this.update = function () {
		this.focalPointX = this.cameraOffsetX + this.cWidth / 2;
		this.focalPointY = this.cameraOffsetY + this.cHeight / 2;
		if (this.target && !this.checkFocusBounds()) {
			this.cameraOffsetX = this.target.x + (this.target.width / 2) - (this.cWidth / 2) + this.waitX;
			this.cameraOffsetY = this.target.y + (this.target.height / 2) - (this.cHeight / 2) + this.waitY;
		}
	}
	this.checkFocusBounds = function () {
		centerX = this.target.x + (this.target.width / 2);
		centerY = this.target.y + (this.target.height / 2);
		if (Math.abs(this.focalPointX - centerX) >= this.waitX) { return false; }
		if (Math.abs(this.focalPointY - centerY) >= this.waitY) { return false; }
		else { return true; }
	}
}
function canAct() { return (aiActivated || uiActivated) && !auxOpen; }
function canAIAct() { return aiActivated && !auxOpen; }
function cancel_game() { iClear('dMenu'); }
function cancelDD() {
	DragElem.remove();
	DragElem = DragSource = DragSourceItem = DropZoneItem = null;
}
function canHumanAct() { return uiActivated && !auxOpen; }
function cap_each_word(s) {
	let arr = s.split(' ');
	let res = '';
	for (const a of arr) { res += capitalize(a) + ' '; }
	return res.slice(0, -1);
}
function capitalize(s) {
	if (typeof s !== 'string') return '';
	return s.charAt(0).toUpperCase() + s.slice(1);
}
function capitals_in_red(feature) {
	console.log('feature data', feature.data);
	let type = lookup(feature, ['data', 'type']);
	console.log('city', lookup(feature, ['data', 'name']), ':', type)
	return type == 'capital' ? 'red' : 'yellow';
}
function CAPTURED(m) { return (((m) >> 14) & 0xF); }
function Card(img, bunch, id, reverse) {
	var self = this;
	this.img = img;
	this.bunch = bunch;
	this.id = id;
	this.reverse = reverse;
	this.suit = Math.floor(id / self.bunch.board.deck.cardSuit);
	this.number = Math.floor(id % self.bunch.board.deck.cardSuit) + 1;
	this.color = Math.floor(id / self.bunch.board.deck.cardSuit) % 2;
	this.img.card = self;
	this.onDblClick = function () {
		self.reverse ? self.bunch.onDblClickReverse(self) : self.bunch.onDblClickCard(self);
	}
	this.flip = function () {
		self.reverse = !self.reverse;
		self.img.src = self.bunch.board.deck.cardSrc(self.id, self.reverse);
	}
	this.moveTo = function (bunch) {
		self.bunch = bunch;
		self.img.style.zIndex = self.bunch.cardZIndex();
		self.img.style.left = String(self.bunch.cardLeft()) + "px";
		self.img.style.top = String(self.bunch.cardTop()) + "px";
		self.reverse = self.bunch.cardReverse();
		self.img.src = self.bunch.board.deck.cardSrc(self.id, self.reverse);
	}
}
function card123(oCard, w, h) {
	if (lookup(SPEC, ['typeMappings', 'card'])) {
		for (const k in SPEC.typeMappings.card) {
			oCard[k] = oCard[SPEC.typeMappings.card[k]];
		}
	}
	let el = cardFace(oCard, w, h);
	return el;
}
function card52(irankey, suit, w, h) {
	//#region set rank and suit from inputs
	let rank = irankey;
	if (nundef(irankey) && nundef(suit)) {
		irankey = chooseRandom(Object.keys(c52));
		rank = irankey[5];
		suit = irankey[6];
	} else if (nundef(irankey)) {
		irankey = '2';
		suit = 'B';
	} else if (nundef(suit)) {
		if (isNumber(irankey)) irankey = getC52Key(iramkey);
		rank = irankey[5];
		suit = irankey[6];
	}
	console.log('rank', rank, 'suit', suit);
	if (rank == '10') rank = 'T';
	if (rank == '1') rank = 'A';
	if (nundef(suit)) suit = 'H'; else suit = suit[0].toUpperCase();
	//#endregion
	//#region load svg for card_[rank][suit] (eg. card_2H)
	let cardKey = 'card_' + rank + suit;
	let svgCode = c52[cardKey];
	svgCode = '<div>' + svgCode + '</div>';
	let el = createElementFromHTML(svgCode);
	if (isdef(h) || isdef(w)) { mSize(el, w, h); }
	//#endregion
	return { rank: rank, suit: suit, key: cardKey, div: el };
}
function cardContent(card, { topLeft, topRight, bottomLeft, bottomRight, reverseBottom = false, title, footer, middle, text }) {
	let svg = card.firstChild;
	let div = card;
	card.style.setProperty('position', 'relative');
	card.style.setProperty('font-size', '3mm');
	topLeft = ['A', '2'];
	bottomRight = ['A', 2];
	middle = null;
	let gap = 2; let d;
	let fBL = reverseBottom ? posBLR : posBL;
	let fBR = reverseBottom ? posBRR : posBR;
	if (isdef(topLeft)) { d = mDiv(card); mGap(d, gap); posTL(d); asList(topLeft).map(x => mDiv(d).innerHTML = x); }
	if (isdef(topRight)) { d = mDiv(card); mGap(d, gap); posTR(d); asList(topRight).map(x => mDiv(d).innerHTML = x); }
	if (isdef(bottomLeft)) { d = mDiv(card); mGap(d, gap); fBL(d); asList(bottomLeft).map(x => mDiv(d).innerHTML = x); }
	if (isdef(bottomRight)) { d = mDiv(card); mGap(d, gap); fBR(d); asList(bottomRight).map(x => mDiv(d).innerHTML = x); }
	if (isdef(middle)) {
		d = mDiv(card); mSize(d, 50, 50, '%'); mFont(d, '7mm');
		let dContent = mDiv(d); dContent.innerHTML = middle; if (isdef(text)) posCICT(dContent); else posCIC(dContent);
	}
	if (isdef(text)) {
		d = mDiv(card); mSize(d, 80, 50, '%'); mFont(d, '1.8mm');
		let lines = 4; if (isdef(middle)) { posCICB(d); d.appendChild(document.createElement('hr')); } else { posCIC(d); lines = 8; }
		let dContent = mDiv(d); dContent.innerHTML = text; dContent.classList.add('textEllipsis4Lines'); dContent.style.setProperty('-webkit-line-clamp', lines);
	}
}
function cardFace({ cardKey, rank, suit, key } = {}, w, h) {
	let svgCode;
	if (isdef(cardKey)) {
		cardKey = 'card_' + cardKey;
		svgCode = isdef(c52[cardKey]) ? c52[cardKey] : testCards[cardKey];
		if (!svgCode) svgCode = vidCache.getRandom('c52');
	} else if (isdef(key)) {
		cardKey = key;
		svgCode = testCards[cardKey];
		if (!svgCode) svgCode = vidCache.getRandom('c52');
	} else {
		if (nundef(rank)) { rank = '2'; suit = 'B'; }
		if (rank == '10') rank = 'T';
		if (rank == '1') rank = 'A';
		if (nundef(suit)) suit = 'H';
		cardKey = 'card_' + rank + suit;
		svgCode = c52[cardKey];
	}
	svgCode = '<div>' + svgCode + '</div>';
	let el = createElementFromHTML(svgCode);
	if (isdef(h)) { mSize(el, w, h); }
	return el;
}
function cardFromInfo(info, h, w, ov) {
	let svgCode = C52[info.c52key];
	svgCode = '<div>' + svgCode + '</div>';
	let el = mCreateFrom(svgCode);
	h = valf(h, valf(info.h, 100));
	w = valf(w, h * .7);
	mSize(el, w, h);
	let res = {};
	copyKeys(info, res);
	copyKeys({ w: w, h: h, faceUp: true, div: el }, res);
	if (isdef(ov)) res.ov = ov;
	return res;
}
function cardGameTest01() {
	rAreas();
}
function cardGameTest02() {
	setBackgroundColor(null, 'random');
	mStyle(dTable, { h: 400, bg: 'black', padding: 10 });
	let SPEC = { layout: ['T', 'H A'], showAreaNames: true };
	let s = '';
	let m = [];
	for (const line of SPEC.layout) {
		s += '"' + line + '" ';
		let letters = line.split(' ');
		let arr = [];
		for (const l of letters) { if (!isEmpty(l)) arr.push(l); }
		m.push(arr);
	}
	console.log('m', m, '\ns', s); return;
}
function cardGameTest03_OK() {
	setBackgroundColor(null, 'random');
	mStyle(dTable, { h: 400, bg: 'black', padding: 10 });
	let dGrid = mDiv100(dTable, { display: 'inline-grid' });
	let layout = ['T', 'H A'];
	let x = createGridLayout(dGrid, layout);
	console.log('result', x);
	createAreas(dGrid, x, 'a');
}
function cardGameTest04() {
	setBackgroundColor(null, 'random');
	let dGrid = mDiv(dTable, { bg: 'red', w: '80%', h: 400, padding: 10, display: 'inline-grid', rounding: 10 }, 'dGrid');
	let layout = ['T', 'H A'];
	let x = createGridLayout(dGrid, layout);
	console.log('result', x);
	createAreas(dGrid, x, 'dGrid');
}
function cardGameTest05() {
	setBackgroundColor(null, 'random');
	let dGrid = mDiv(dTable, { gap: 10, bg: 'white', w: '80%', h: 400, padding: 10, display: 'inline-grid', rounding: 10 }, 'dGrid');
	let layout = ['T', 'H A'];
	let areaStyles = { bg: 'random', rounding: 6 };
	let contentStyles = { bg: 'dimgray', lowerRounding: 6 };
	let messageStyles = { bg: 'dimgray', fg: 'yellow' };
	let titleStyles = { family: 'AlgerianRegular', upperRounding: 6 };
	let areas = {
		T: { title: 'table', id: 'dTrick', showTitle: true, messageArea: true, areaStyles: areaStyles, contentStyles: contentStyles, messageStyles: messageStyles, titleStyles: titleStyles },
		H: { title: 'YOU', id: 'dHuman', showTitle: true, messageArea: true, areaStyles: areaStyles, contentStyles: contentStyles, messageStyles: messageStyles, titleStyles: titleStyles },
		A: { title: 'opponent', id: 'dAI', showTitle: true, messageArea: true, areaStyles: areaStyles, contentStyles: contentStyles, messageStyles: messageStyles, titleStyles: titleStyles },
	};
	let x = createGridLayout(dGrid, layout);
	console.log('result', x);
	let items = [];
	for (const k in areas) {
		let item = areas[k];
		item.areaStyles['grid-area'] = k;
		let dCell = mTitledMessageDiv(item.title, dGrid, item.id, item.areaStyles, item.contentStyles, item.titleStyles, item.messageStyles)
		iRegister(item, item.id);
		iAdd(item, { div: dCell, dTitle: dCell.children[0], dMessage: dCell.children[1], dContent: dCell.children[2] });
		items.push(item);
	}
	return items;
}
function cardGameTest06_clean_OK() {
	setBackgroundColor(null, 'random');
	let dGrid = mDiv(dTable, { gap: 10, bg: 'white', w: '90%', hmin: 400, padding: 10, display: 'inline-grid', rounding: 10 }, 'dGrid');
	let layout = ['T', 'H A'];
	let areaStyles = { bg: 'green', rounding: 6 };
	let contentStyles = { lowerRounding: 6 };
	let messageStyles = { fg: 'yellow' };
	let titleStyles = { bg: 'dimgray', family: 'AlgerianRegular', upperRounding: 6 };
	let areas = {
		T: { title: 'table', id: 'dTrick', showTitle: true, messageArea: true, areaStyles: areaStyles, contentStyles: contentStyles, messageStyles: messageStyles, titleStyles: titleStyles },
		H: { title: 'YOU', id: 'dHuman', showTitle: true, messageArea: true, areaStyles: areaStyles, contentStyles: contentStyles, messageStyles: messageStyles, titleStyles: titleStyles },
		A: { title: 'opponent', id: 'dAI', showTitle: true, messageArea: true, areaStyles: areaStyles, contentStyles: contentStyles, messageStyles: messageStyles, titleStyles: titleStyles },
	};
	areas.T.areaStyles.w = '100%';
	let x = createGridLayout(dGrid, layout);
	console.log('result', x);
	let items = [];
	for (const k in areas) {
		let item = areas[k];
		item.areaStyles['grid-area'] = k;
		let dCell = mTitledMessageDiv(item.title, dGrid, item.id, item.areaStyles, item.contentStyles, item.titleStyles, item.messageStyles)
		iRegister(item, item.id);
		iAdd(item, { div: dCell, dTitle: dCell.children[0], dMessage: dCell.children[1], dContent: dCell.children[2] });
		mCenterCenterFlex(diContent(item));
		mStyle(diContent(item), { gap: 10 });
		items.push(item);
	}
	return items;
}
function cardGameTest07() {
	let items = cardGameTest07_helper();
	for (let i = 0; i < 3; i++) {
		let arr = [0, 1, 2, 10, 11].map(x => 1 + (x + i * 13) % 52);
		let d = diContent(items[i]);
		let id = 'h' + i;
		iH00(arr, d, { bg: 'blue' }, id);
	}
}
function cardGameTest07_helper() {
	setBackgroundColor(null, 'random');
	let dGrid = mDiv(dTable, { gap: 10, bg: 'white', w: '90%', padding: 10, display: 'inline-grid', rounding: 10 }, 'dGrid');
	let layout = ['T', 'H A'];
	let areaStyles = { bg: 'green', rounding: 6 };
	let contentStyles = { lowerRounding: 6 };
	let messageStyles = { fg: 'yellow' };
	let titleStyles = { bg: 'dimgray', family: 'AlgerianRegular', upperRounding: 6 };
	let areas = {
		T: { title: 'table', id: 'dTrick', showTitle: true, messageArea: true, areaStyles: areaStyles, contentStyles: contentStyles, messageStyles: messageStyles, titleStyles: titleStyles },
		H: { title: 'YOU', id: 'dHuman', showTitle: true, messageArea: true, areaStyles: areaStyles, contentStyles: contentStyles, messageStyles: messageStyles, titleStyles: titleStyles },
		A: { title: 'opponent', id: 'dAI', showTitle: true, messageArea: true, areaStyles: areaStyles, contentStyles: contentStyles, messageStyles: messageStyles, titleStyles: titleStyles },
	};
	let x = createGridLayout(dGrid, layout);
	console.log('result', x);
	let items = [];
	for (const k in areas) {
		let item = areas[k];
		item.areaStyles['grid-area'] = k;
		let dCell = mTitledMessageDiv(item.title, dGrid, item.id, item.areaStyles, item.contentStyles, item.titleStyles, item.messageStyles)
		iRegister(item, item.id);
		iAdd(item, { div: dCell, dTitle: dCell.children[0], dMessage: dCell.children[1], dContent: dCell.children[2] });
		mCenterCenterFlex(diContent(item));
		mStyle(diContent(item), { gap: 10 });
		items.push(item);
	}
	return items;
}
function cardGameTest08() {
	let state = {
		pl1: { hand: [1, 2, 3, 4, 5], trick: [[6]] },
		pl2: { hand: [11, 12, 13, 14, 15], trick: [[16]] },
	};
	let trick = arrFlatten(state.pl1.trick).concat(arrFlatten(state.pl2.trick));
	let pl1Hand = state.pl1.hand;
	let pl2Hand = state.pl2.hand;
	let arrs = [trick, pl1Hand, pl2Hand];
	let items = makeAreasKrieg(dTable);
	for (let i = 0; i < 3; i++) {
		let arr = arrs[i];
		let item = items[i];
		let d = diContent(item);
		let id = 'h' + i;
		iMessage(item, '');
		iH00(arr, d, { bg: 'blue' }, id);
	}
}
function cardGameTest09() {
	let state = {
		pl1: { hand: [1, 2, 3, 4, 5], trick: [[6], [7, 8, 9]] },
		pl2: { hand: [11, 12, 13, 14, 15], trick: [[16], [17, 18, 19]] },
	};
	let areaItems = makeAreasKrieg(dTable);
	presentState1(state, areaItems);
}
function cardHand(pool, loc, o, oid, path, omap) {
	let size = CARD_SZ;
	let [w, h, gap] = [size * .66, size, 4];
	let olist = mapOMap(omap, pool);
	if (isEmpty(olist)) return null;
	let uis = getUis(olist, sizedCard123(w, h));
	let area = stage2_prepArea(loc);
	let container = stage3_prepContainer(area); mColor(container, 'red')
	stage4_layout(uis, container, w, h, gap, layoutHand);
}
function cardInno(dParent, key) {
	if (nundef(key)) key = chooseRandom(Object.keys(Cinno));
	let cardInfo = Cinno[key];
	cardInfo.key = key;
	let sym = INNO.sym[cardInfo.type];
	let info = Syms[sym.key];
	let card = cBlank(dParent, { fg: 'black', bg: INNO.color[cardInfo.color], w: CSZ, h: CSZ * .65 });
	let [dCard, sz, szTitle, margin] = [iDiv(card), CSZ / 5, CSZ / 8, CSZ / 40];
	let [dTitle, dMain] = cTitleArea(card, szTitle);
	let d = mAddContent(dTitle, key, {
		patop: 4, bg: sym.bg, fg: 'white', h: szTitle, fz: szTitle * .7, align: 'center',
		position: 'relative'
	});
	mAddContent(d, cardInfo.age, { hpadding: szTitle / 4, float: 'right' });
	let s = mSym(sym.key, d, { hpadding: szTitle / 4, h: szTitle * .7, fg: sym.fg, float: 'left' });
	let positions = ['tl', 'bl', 'bc', 'br'];
	for (let i = 0; i < 4; i++) {
		let r = cardInfo.resources[i];
		let pos = positions[i];
		if (r in INNO.sym) { innoSym(r, dMain, sz, pos, margin); }
		else if (r == 'None') { innoAgeNumber(cardInfo.age, dMain, sz, pos, margin); }
		else if (isNumber(r)) { innoBonusNumber(r, dMain, sz, pos, margin); }
		else if (r == 'echo') { innoEcho(cardInfo.echo, dMain, sz, pos, margin); }
	}
	let box = mBoxFromMargins(dMain, 10, margin, sz + margin, sz + 2 * margin);
	mStyle(box, { align: 'left' });
	let text = '';
	for (const dog of cardInfo.dogmas) {
		console.log('text', cardInfo.type, sym);
		let t = startsWith(dog, 'I demand') ? ('I <b>demand</b>' + dog.substring(8)) : dog;
		text += `<span style="color:${sym.bg};font-family:${info.family}">${info.text}</span>` + '&nbsp;' + t + '<br>';
	}
	let t2 = innoText(text);
	box.onclick = (ev) => makeInfobox(ev, box, 2);
	mFillText(t2, box);
}
function cardInno1(key, wCard = 420) {
	if (nundef(key)) key = chooseRandom(Object.keys(Cinno));
	let f = wCard / 420;
	let [w, h, szSym, paSym, fz, pa, bth, vGapTxt, rnd, gap] = [420 * f, 200 * f, 100 * f, 8 * f, 100 * f * .8, 20 * f, 4 * f, 8 * f, 10 * f, 6 * f].map(x => Math.ceil(x));
	let info = Cinno[key];
	info.key = key;
	let cdict = { red: RED, blue: 'royalblue', green: 'green', yellow: 'yelloworange', purple: 'indigo' };
	info.c = getColorDictColor(cdict[info.color]);
	let d = mDiv();
	mSize(d, w, h);
	mStyle(d, { fz: pa, margin: 8, align: 'left', bg: info.c, rounding: rnd, patop: paSym, paright: pa, pabottom: szSym, paleft: szSym + paSym, border: '' + bth + 'px solid silver', position: 'relative' })
	mText(info.key.toUpperCase(), d, { fz: pa, weight: 'bold', margin: 'auto' });
	mLinebreak(d);
	for (const dog of info.dogmas) {
		let text = replaceSymbols(dog);
		let d1 = mText(text, d);
		d1.style.marginBottom = '' + vGapTxt + 'px';
	}
	let syms = []; let d1;
	szSym -= gap;
	let sdict = {
		tower: { k: 'white-tower', bg: 'dimgray' }, clock: { k: 'watch', bg: 'navy' }, crown: { k: 'crown', bg: 'black' },
		tree: { k: 'tree', bg: GREEN },
		bulb: { k: 'lightbulb', bg: 'purple' }, factory: { k: 'factory', bg: 'red' }
	};
	for (const s in sdict) { sdict[s].sym = Syms[sdict[s].k]; }
	for (const sym of info.resources) {
		let isEcho = false;
		if (sym == 'None') {
			d1 = mDiv(d, { fz: fz * .75, fg: 'black', bg: 'white', rounding: '50%', display: 'inline' });
			let d2 = mText('' + info.age, d1, {});
			mClass(d2, 'centerCentered');
		} else if (sym == 'echo') {
			let text = info.echo;
			console.log('info.echo', info.echo);
			if (isList(info.echo)) text = info.echo[0];
			text = replaceSymbols(text);
			wEcho = szSym;
			let [w1, h1, w2, h2] = [wEcho, szSym, wEcho - 8, szSym - 8];
			d1 = mDiv(d, { display: 'inline', fg: 'white', bg: 'dimgray', rounding: 6, h: h1, w: w1 });
			let [bestFont, w3, h3] = fitFont(text, 20, w2, h2);
			let d2 = mDiv(d1, { w: w3, h: h3, fz: bestFont }, null, text);
			mCenterCenterFlex(d1);
			isEcho = true;
		} else if (isNumber(sym)) {
			d1 = mDiv(d, { fz: fz * .75, fg: 'white', bg: 'brown', border: '2px solid black', rounding: '50%', display: 'inline' });
			mCenterCenterFlex(d1);
			let d2 = mText('' + info.age, d1, {});
		} else {
			let key = sdict[sym].k;
			let mi = mPic(key, d, { w: szSym, fz: szSym * .8, bg: sdict[sym].bg, rounding: '10%' });
			d1 = iDiv(mi);
		}
		syms.push({ isEcho: isEcho, div: d1 });
	}
	placeSymbol(syms[0], szSym, gap, { left: 0, top: 0 });
	placeSymbol(syms[1], szSym, gap, { left: 0, bottom: 0 });
	placeSymbol(syms[2], szSym, gap, { left: w / 2, bottom: 0 });
	placeSymbol(syms[3], szSym, gap, { right: 0, bottom: 0 });
	info.div = d;
	return info;
}
function cardInnoSZ(key, wCard = 420) {
	if (nundef(key)) key = chooseRandom(Object.keys(cinno));
	let f = wCard / 420;
	let [w, h, szSym, paSym, fz, pa, bth, vGapTxt, rnd, gap] = [420 * f, 200 * f, 50 * f, 8 * f, 50 * f * .8, 20 * f, 4 * f, 8 * f, 10 * f, 6 * f].map(x => Math.ceil(x));
	let info = cinno[key];
	info.key = key;
	let cdict = { red: 'red1', blue: 'blue1', green: 'green1', yellow: 'yellow1', purple: 'purple' }
	info.c = colorDarker(ColorDict[cdict[info.color]].c, .6);
	let d = mDiv();
	mSize(d, w, h);
	mStyleX(d, { fz: pa, margin: 8, align: 'left', bg: info.c, rounding: rnd, patop: paSym, paright: pa, pabottom: szSym, paleft: szSym + paSym, border: '' + bth + 'px solid silver', position: 'relative' })
	mText(info.key.toUpperCase(), d, { fz: pa, weight: 'bold', margin: 'auto' });
	mLinebreak(d);
	for (const dog of info.dogmas) {
		console.log(dog);
		let d1 = mText(dog, d);
		d1.style.marginBottom = '' + vGapTxt + 'px';
	}
	let syms = []; let d1;
	szSym -= gap;
	let sdict = {
		tower: { k: 'white-tower', bg: 'dimgray' }, clock: { k: 'watch', bg: 'navy' }, crown: { k: 'crown', bg: 'black' },
		tree: { k: 'tree', bg: GREEN },
		bulb: { k: 'lightbulb', bg: 'purple' }, factory: { k: 'factory', bg: 'red' }
	};
	for (const sym of info.resources) {
		console.log(sym)
		if (sym == 'None') {
			console.log('age of card:', info.age)
			d1 = mDiv(d, { fz: fz * .75, fg: 'black', bg: 'white', rounding: '50%', display: 'inline' });
			let d2 = mText('' + info.age, d1, {});
			mClass(d2, 'centerCentered')
		} else if (sym == 'echo') {
		} else {
			console.log('ssssssssssssssssssssssss', sym)
			let key = sdict[sym].k;
			d1 = maPic(key, d, { w: szSym, bg: sdict[sym].bg, rounding: '10%' });
		}
		syms.push(d1);
	}
	mStyleX(syms[0], { position: 'absolute', w: szSym, h: szSym, left: 0, top: 0, margin: gap });
	mStyleX(syms[1], { position: 'absolute', w: szSym, h: szSym, left: 0, bottom: 0, margin: gap });
	mStyleX(syms[2], { position: 'absolute', w: szSym, h: szSym, left: w / 2, bottom: 0, margin: gap });
	mStyleX(syms[3], { position: 'absolute', w: szSym, h: szSym, right: 0, bottom: 0, margin: gap });
	info.div = d;
	return info;
	return 'hallo';
}
function cardInnoz(key, wCard = 420) {
	if (nundef(key)) key = chooseRandom(Object.keys(cinno));
	let f = wCard / 420;
	let [w, h, szSym, paSym, fz, pa, bth, vGapTxt, rnd, gap] = [420 * f, 200 * f, 50 * f, 8 * f, 50 * f * .8, 20 * f, 4 * f, 8 * f, 10 * f, 6 * f].map(x => Math.ceil(x));
	let info = cinno[key]; info.key = key;
	let cdict = { red: 'red1', blue: 'blue1', green: 'green1', yellow: 'yellow1', purple: 'purple' }
	info.c = colorDarker(ColorDict[cdict[info.color]].c, .6);
	let d = mDiv();
	mSize(d, w, h);
	mStyleX(d, { fz: pa, margin: 8, align: 'left', bg: info.c, rounding: rnd, patop: paSym, paright: pa, pabottom: szSym, paleft: szSym + paSym, border: '' + bth + 'px solid silver', position: 'relative' })
	mText(info.key.toUpperCase(), d, { fz: pa, weight: 'bold', margin: 'auto' });
	mLinebreak(d);
	for (const dog of info.dogmas) {
		let d1 = mText(dog, d);
		d1.style.marginBottom = '' + vGapTxt + 'px';
	}
	let syms = []; let d1;
	szSym -= gap;
	let sdict = {
		tower: { k: 'white-tower', bg: 'dimgray' }, clock: { k: 'watch', bg: 'navy' }, crown: { k: 'crown', bg: 'black' },
		tree: { k: 'tree', bg: GREEN },
		bulb: { k: 'lightbulb', bg: 'purple' }, factory: { k: 'factory', bg: 'red' }
	};
	for (const sym of info.resources) {
		if (sym == 'None') {
			d1 = { div: mDiv(d, { fz: fz * .75, w: szSym, h: szSym, fg: 'black', bg: 'white', rounding: '50%', display: 'inline' }) };
			let d2 = mText('' + info.age, d1.div, {});
			mClass(d2, 'centerCentered')
		} else if (sym == 'echo') {
		} else {
			let key = sdict[sym].k;
			d1 = zPic(key, d, { padding: 0, w: szSym, h: szSym, bg: sdict[sym].bg, rounding: '10%' });
		}
		syms.push(d1);
	}
	mStyleX(syms[0].div, { position: 'absolute', left: 0, top: 0, margin: gap });
	mStyleX(syms[1].div, { position: 'absolute', left: 0, bottom: 0, margin: gap });
	mStyleX(syms[2].div, { position: 'absolute', left: w / 2, bottom: 0, margin: gap });
	mStyleX(syms[3].div, { position: 'absolute', right: 0, bottom: 0, margin: gap });
	info.div = d;
	return info;
	return 'hallo';
}
function cardPattern(n, sym) {
	let di = {
		1: [sym],
		2: [[sym], [sym]],
		3: [[sym], [sym], [sym]],
		4: [[sym, sym], [sym, sym]],
		5: [[sym, sym], [sym], [sym, sym]],
		6: [[sym, sym], [sym, sym], [sym, sym]],
		7: [[sym, sym], [sym, sym, sym], [sym, sym]],
		8: [[sym, sym, sym], [sym, sym], [sym, sym, sym]],
		9: [[sym, sym, sym], [sym, sym, sym], [sym, sym, sym]],
		10: [[sym, sym, sym], [sym, sym, sym, sym], [sym, sym, sym]],
		11: [[sym, sym, sym, sym], [sym, sym, sym], [sym, sym, sym, sym]],
		12: [[sym, sym, sym, sym], [sym, sym, sym, sym], [sym, sym, sym, sym]],
		13: [[sym, sym, sym], [sym, sym], [sym, sym, sym], [sym, sym], [sym, sym, sym]],
		14: [[sym, sym, sym, sym], [sym, sym, sym, sym], [sym, sym, sym, sym]],
		15: [[sym, sym, sym, sym], [sym, sym, sym, sym], [sym, sym, sym, sym]],
	};
	return di[n];
}
function cards52GetRankFromName(name) {
	let rank;
	let n = firstNumber(name);
	if (isdef(n) && !isNaN(n)) rank = n;
	else {
		let ch = name.toLowerCase()[0];
		rank = ch == 'k' ? 13 : ch == 'q' ? 12 : 11;
	}
	return rank;
}
function cardZone(dParent, o, flex = 1, hmin = 170) {
	let dOuter = mDiv(dParent, { bg: o.color, fg: 'contrast', flex: flex, hmin: hmin }, 'd' + o.name, o.name);
	let dInner = mDiv(dOuter);
	mFlex(dInner); dInner.style.alignContent = 'flex-start';
	return dInner;
}
function carteset(l1, l2) {
	let res = [];
	for (var el1 of l1) {
		for (var el2 of l2) {
			if (isList(el1)) res.push(el1.concat(el2));
			else res.push([el1].concat(el2));
		}
	}
	return res;
}
function cartesi(l1, l2) {
	let res = [];
	for (var el1 of l1) {
		for (var el2 of l2) {
			res.push(el1.concat(el2));
		}
	}
	return res;
}
function cartesian(s1, s2, sep = '_') {
	let res = [];
	for (const el1 of s1) {
		for (const el2 of s2) {
			res.push(el1 + '_' + el2);
		}
	}
	return res;
}
function cartesianOf(ll) {
	let cart = ll[0];
	for (let i = 1; i < ll.length; i++) {
		cart = cartesian(cart, ll[i]);
	}
	return cart;
}
function catanBoard(dParent, rows, topcols, styles = {}) {
	let g = hex1Board(dParent, rows, topcols, styles);
	hexCornerNodes(g);
}
function catFiltered(cats, name, best) {
	let keys = setCategories(cats);
	let bestName = null;
	let k1 = keys.filter(x => best.includes(x));
	if (k1.length > 80) bestName = name + '100';
	else if (k1.length > 40) bestName = name + '50';
	else if (k1.length > 20) bestName = name + '25';
	let result = {};
	result[name] = keys;
	if (bestName) result[bestName] = k1;
	return result;
}
function cBlank(dParent, styles = {}, id) {
	if (nundef(styles.h)) styles.h = Card.sz;
	if (nundef(styles.w)) styles.w = styles.h * .7;
	if (nundef(styles.bg)) styles.bg = 'white';
	styles.position = 'relative';
	let [w, h, sz] = [styles.w, styles.h, Math.min(styles.w, styles.h)];
	if (nundef(styles.rounding)) styles.rounding = sz * .05;
	let d = mDiv(dParent, styles, id, null, 'card');
	let item = mItem(null, { div: d }, { type: 'card', sz: sz, rounding: styles.rounding });
	copyKeys(styles, item);
	return item;
}
function cBlankSvg(dParent, styles = {}) {
	if (nundef(styles.h)) styles.h = Card.sz;
	if (nundef(styles.w)) styles.w = styles.h * .7;
	if (nundef(styles.bg)) styles.bg = 'white';
	styles.position = 'relative';
	let [w, h, sz] = [styles.w, styles.h, Math.min(styles.w, styles.h)];
	if (nundef(styles.rounding)) styles.rounding = sz * .05;
	let d = mDiv(dParent, styles, null, null, 'card');
	let svg = mgTag('svg', d, { width: '100%', height: '100%' });
	let g = mgTag('g', svg);
	let item = mItem(null, { div: d, svg: svg, g: g }, { type: 'card', sz: sz });
	copyKeys(styles, item);
	return item;
}
function ccanvas(dParent, styles, bstyles, play, pause, origin = 'cc') {
	let o = mCanvas(dParent, styles, bstyles, play, pause);
	[this.cv, this.cx, this.play, this.pause] = [o.cv, o.cx, o.play, o.pause];
	let [w, h] = [this.w, this.h] = [this.cv.width, this.cv.height];
	this.defaultsize = 20;
	this.origin = cv_init_origin(this, origin);
	this.cx.translate(this.origin.x, this.origin.y);
	this.maxx = w - this.origin.x; this.minx = this.maxx - w;
	this.maxy = h - this.origin.y; this.miny = this.maxy - h;
	this.items = [];
}
function cCenterOrigin(cnv, ctx) {
	cSetOrigin(ctx, cnv.width / 2, cnv.height / 2);
}
function cCircle(c, sz, n, disp = -90) {
	let rad = sz / 2;
	centers = getEllipsePoints(rad, rad, n, disp)
	centers = centers.map(pt => ({ x: pt.X + c.x, y: pt.Y + c.y }));
	return centers;
}
function cClear(cnv = null, ctx = null) {
	if (nundef(cnv)) { cnv = CV; ctx = CX; if (!ctx) return; }
	ctx.save();
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	ctx.clearRect(0, 0, cnv.width, cnv.height);
	ctx.restore();
}
function cColor(fill, cvx) { if (nundef(cvx)) cvx = CX; CX.fillStyle = fill; }
function cdf0(x) {
	function normal(x, mu, sigma) {
		return stdNormal((x - mu) / sigma);
	}
	function stdNormal(z) {
		var j, k, kMax, m, values, total, subtotal, item, z2, z4, a, b;
		if (z < -6) { return 0; }
		if (z > 6) { return 1; }
		m = 1;
		b = z;
		z2 = z * z;
		z4 = z2 * z2;
		values = [];
		for (k = 0; k < 100; k += 2) {
			a = 2 * k + 1;
			item = b / (a * m);
			item *= (1 - (a * z2) / ((a + 1) * (a + 2)));
			values.push(item);
			m *= (4 * (k + 1) * (k + 2));
			b *= z4;
		}
		total = 0;
		for (k = 49; k >= 0; k--) {
			total += values[k];
		}
		return 0.5 + 0.3989422804014327 * total;
	}
	return normal(x, 100, 15);
}
function cEllipse(x, y, w, h, styles = null, angle = 0, ctx = null) {
	if (nundef(ctx)) { ctx = CX; if (!ctx) return; }
	if (styles) cStyle(styles, ctx);
	ctx.beginPath();
	ctx.ellipse(x, y, w / 2, h / 2, -angle, 0, 2 * Math.PI);
	if (isdef(styles.bg) || nundef(styles.fg)) ctx.fill();
	if (isdef(styles.fg)) ctx.stroke();
}
function centerFit(d, child) {
	let bChild = getBounds(child);
	let b = getBounds(d);
	let padding = firstNumber(d.style.padding);
	let wdes = b.width;
	let hdes = b.height;
	let wdesChild = wdes - 2 * padding;
	let hdesChild = hdes - 2 * padding;
	let wChild = bChild.width;
	let hChild = bChild.height;
	let padx = Math.floor(padding + (wdesChild - bChild.width) / 2);
	let pady = Math.floor(padding + (hdesChild - bChild.height) / 2);
	d.style.padding = pady + 'px ' + padx + 'px';
}
function cha3(cities) {
	let list = rChoose(cities, 20);
	for (const o of list) {
		map_add_city(o);
	}
	console.log('source', ensure_city_layer().getSource().getFeatures().map(x => x.data.city_ascii));
}
function chainCancel() {
	CancelChain = true;
	clearTimeout(ChainTimeout);
	TaskChain = [];
	setTimeout(() => BlockChain = false, 100);
}
function chainEx(taskChain, onComplete, ifBlocked = 'wait', singleThreaded = true) {
	if (BlockChain) {
		console.log('chain blocked!')
		switch (ifBlocked) {
			case 'interrupt': CancelChain = true; setTimeout(() => chainEx(taskChain, onComplete, 'wait'), 300); break;
			case 'wait': setTimeout(() => chainEx(taskChain, onComplete, 'wait'), 300); break;
			case 'return': default://just drop it
		}
	} else {
		BlockChain = true;
		CancelChain = false;
		let akku = [];
		if (singleThreaded) {
			TaskChain = taskChain;
			_singleThreadedChainExRec(akku, onComplete);
		} else {
			_chainExRec(akku, taskChain, onComplete);
		}
	}
}
function chainSend(msgChain, callback) {
	let akku = [];
	this.chainSendRec(akku, msgChain, callback);
}
function chainSendRec(akku, msgChain, callback) {
	if (msgChain.length > 0) {
		_sendRoute(msgChain[0], d => {
			akku.push(d);
			this.chainSendRec(akku, msgChain.slice(1), callback)
		});
	} else {
		callback(akku);
	}
}
function chall4() {
	let caps = M.capitals;
	let list = caps;
	for (const o of list) {
		map_add_city(o);
		console.log('city', o)
	}
	console.log('source', ensure_city_layer().getSource().getFeatures().map(x => x.data.city_ascii));
}
function challenge0() {
	for (const o of arrTake(cities, 10)) {
		console.log('o', o)
		add_circle(Number(o.lng), Number(o.lat), M.map);
	}
}
async function challenge1() {
	let data = await route_path_json('../base/mapdata/gadm36_AUT_2.json');
	var mapOptions = {
		center: [48.3, 16.3],
		zoom: 10
	}
	var map = new L.map('map', mapOptions);
	var layer = new L.TileLayer(''); //http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
	map.addLayer(layer);
	geojson = L.geoJson(data, {}).addTo(map);
	for (const f of data.features) {
		let name = f.properties.NAME_2;
		let fpoly = single_poly_feature(f);
		let center = get_poly_center(fpoly);
		let p = get_circle(center).addTo(map);
		var marker = L.marker(center, { opacity: 0 });
		marker.addTo(map);
		marker.bindTooltip(f.properties.NAME_2, { direction: 'center', permanent: true, className: 'mylabel', offset: L.point({ x: -30, y: 30 }) });
	}
}
function challenge2() {
	let layer = map_add_layer('city', M.map);
	let feature = map_add_circle_to_layer(16, 48, layer);
	feature.data = { hallo: 'Vienna' };
	console.log('source', layer.getSource().getFeatures());
}
function change(arr, n) {
	for (let i = 0; i < n; i++) {
		let mobj = chooseRandom(arr);
	}
}
function change_parent_type_if_needed(n, R) {
	let uiNode = R.uiNodes[n.uid];
	if (!isContainerType(uiNode.type)) {
		uiNode.type = 'panel';
		uiNode.changing = true;
		let uidParent = n.uidParent;
		let area = uidParent ? uidParent : R.baseArea;
		let uiNew = createUi(uiNode, area, R, uiNode.defParams);
	}
}
function changeGameTo(id) {
	if (isdef(id) && id == Gamename) return;
	if (isdef(T)) { saveTable(); }
	loadGame(id);
	loadTable();
}
function changeTableTo(id) {
	id = id.toLowerCase();
	if (isdef(id) && id == Tablename) return;
	if (id != Tablename && isdef(T)) { saveTable(); }
	loadTable(id);
}
function changeTo(newListName) {
	var x = newListName;
	document.getElementById('List').value = "";
	document.getElementById('List').setAttribute('list', x);
}
function changeToForInput(newListName, elid, defaultVal) {
	var x = newListName;
	document.getElementById(elid).value = '';
	document.getElementById(elid).setAttribute('list', x);
}
function changeUserTo(name) {
	if (name != Username) { saveUser(); }
	mBy('spUser').innerHTML = name;
	loadUser(name);
	startUnit();
}
function chat_2handleResult(result) {
	result = JSON.parse(result);
	console.log('chat result:', result);
	ActiveChats[result.userdata.username] = result;
	activateChat(result.userdata.username);
}
function chatStartOrActivate() {
	if (nundef(DA.currentContact) && nundef(DA.activeChat)) {
		console.log('no current contact!');
	} else if (nundef(DA.currentContact)) {
		console.log('no current contact! - activate activeChat!');
		console.log('(nothing to do!)')
	} else if (DA.currentContact == DA.activeChat) {
		console.log('currentContact is already active', DA.currentContact);
		return;
	} else if (isdef(ActiveChats[DA.currentContact])) {
		console.log('messages have been loaded for', DA.currentContact, '- just activate');
		activateChat(DA.currentContact);
		console.log('if another contact was active, deactivate,');
		console.log('activate this new contact');
	} else {
		console.log('new data for', DA.currentContact, 'have to be requested from phphost!');
		let data = { username: Username, currentContact: DA.currentContact, data_type: 'chat' };
		get_request('chat', data);
	}
}
function cheatDevcard() { sendRoute('/cheat/devcard', runToDevdeckAction); }
function check_complete_set(fenlist) {
	if (fenlist.length != 3) return false;
	let [f1, f2, f3] = fenlist;
	console.log('set clicked', f1, f2, f3)
	for (let i = 0; i < f1.length; i++) {
		let [a, b, c] = [f1[i], f2[i], f3[i]];
		console.log('...set clicked', a, b, c)
		let correct = (a == b && b == c) || (a != b && b != c && a != c);
		if (!correct) return false;
	}
	return true;
}
function check_correct_journey(A, fen, uplayer) {
	let items = A.selected.map(x => A.items[x]);
	if (items.length < 2) {
		select_error('please select at least 2 items!'); return [null, null, null];
	}
	let carditems = items.filter(x => is_card(x));
	if (isEmpty(carditems)) {
		select_error('please select at least 1 card!'); return [null, null, null];
	} else if (items.length - carditems.length > 1) {
		select_error('please select no more than 1 journey!'); return [null, null, null];
	}
	let journeyitem = firstCond(items, x => !is_card(x));
	let cards = journeyitem ? jsCopy(journeyitem.o.list) : [];
	cards = cards.concat(carditems.map(x => x.o.key));
	let jlegal = is_journey(cards);
	if (!jlegal || jlegal.length != cards.length) {
		select_error('this is not a legal journey!!'); return [null, null, null];
	}
	return [carditems, journeyitem, jlegal];
}
function check_for_clicks() {
	let cur = get_bar_values();
	let clicks = get_clicks_from_playerdata();
	let newgoals = jsCopy(Z.fen), changed = false;
	for (const k in cur) {
		if (clicks[k] == 0) continue;
		changed = true;
		let newgoal = cur[k] + clicks[k] * 10;
		newgoals[k] = newgoal;
		set_new_goal(k, newgoal);
	}
	Z.fen = newgoals;
	if (changed) {
		phpPost({ friendly: 'feedback', fen: newgoals, newstate: { green: 0, red: 0 } }, 'update_fen');
	} else {
		autopoll();
	}
}
function check_id(specKey, node, R) {
	let akku = {};
	recFindProp(node, '_id', 'self', akku);
	for (const k in akku) { R.addToPlaces(specKey, akku[k], k); }
}
function check_if_church() {
	let [fen, A, uplayer, plorder] = [Z.fen, Z.A, Z.uplayer, Z.plorder];
	let jacks = fen.market.filter(x => x[0] == 'J');
	let queens = fen.market.filter(x => x[0] == 'Q');
	for (const plname of plorder) {
		let pl = fen.players[plname];
		let pl_jacks = pl.stall.filter(x => x[0] == 'J');
		let pl_queens = pl.stall.filter(x => x[0] == 'Q');
		jacks = jacks.concat(pl_jacks);
		queens = queens.concat(pl_queens);
	}
	let ischurch = false;
	for (const j of jacks) {
		if (firstCond(queens, x => x[1] != j[1])) ischurch = true;
	}
	return ischurch;
}
function check_poll_bot_send_move(obj) {
	console.log('...bot check table status: ', lookup(obj, ['table', 'status']) ?? 'no obj.table.status!!!', obj);
	if (nundef(DA.poll)) return;
	else if (isdef(obj) && isdef(obj.table) && obj.table.status == 'over') {
		DA.poll.onsuccess(obj);
	} else {
		BotTicker = setTimeout(poll, DA.poll.ms);
	}
}
function check_poll_orig() {
	let p = DA.long_polling;
	if (nundef(p)) { console.log('no polling is active!'); return; }
	to_server(p.data, p.type);
}
function check_poll_table_seen(obj) {
	console.assert(isdef(obj.table), 'check_poll_table_seen NO TABLE!!!!');
	let t = obj.table;
	if (t.status == 'seen' || t.status == 'past') {
		DA.poll.onsuccess(obj);
	} else {
		TOTicker = setTimeout(poll, DA.poll.ms);
	}
}
function check_poll_table_show(obj) {
	if (isdef(obj) && !isEmpty(obj.table) && obj.table.status == 'show') {
		DA.poll.onsuccess(obj);
	} else {
		TOTicker = setTimeout(poll, DA.poll.ms);
	}
}
function check_poll_table_started(obj) {
	if (isdef(obj) && !isEmpty(obj.tables)) {
		DA.poll.onsuccess(obj);
	} else {
		let dcheck = document.getElementById('ddd_logout');
		if (!dcheck) {
			present_non_admin_waiting_screen();
		}
		TOTicker = setTimeout(poll, DA.poll.ms);
	}
}
function check_ref(specKey, node, R) {
	let akku = {};
	recFindProp(node, '_ref', 'self', akku);
	for (const k in akku) { R.addToRefs(specKey, akku[k], k); }
}
function check_resolve() {
	let can_resolve = true;
	for (const plname of Z.plorder) {
		let data1 = firstCond(Z.playerdata, x => x.name == plname && !isEmpty(x.state));
		if (nundef(data1)) { can_resolve = false; break; }
	}
	return can_resolve;
}
function CheckAndSet() {
	if (CheckResult() != BOOL.TRUE) {
		GameController.GameOver = BOOL.FALSE;
		$("#GameStatus").text('');
	} else {
		GameController.GameOver = BOOL.TRUE;
		GameController.GameSaved = BOOL.TRUE;
		let win = GameController.winner;
		lookupAddToList(GameController, ['games'], isdef(win) ? win : 0);
	}
	ShowFenPosition();
}
function checkArrowKeys(ev) {
	if (!ev.ctrlKey) return;
	if (ev.keyCode == '13' && boatHighlighted) onClickSelectTuple(null, boatHighlighted);
	else if (ev.keyCode == '38') _highlightPrevBoat();
	else if (ev.keyCode == '40') _highlightNextBoat();
	else if (ev.keyCode == '37') { }
	else if (ev.keyCode == '39') { }
}
function checkAvailable(i) {
	id = getidAvailable(i); document.getElementById(id).checked = true;
}
function CheckBoard() {
	var t_pceNum = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	var t_material = [0, 0];
	var sq64, t_piece, t_pce_num, sq120, colour, pcount;
	for (t_piece = PIECES.wP; t_piece <= PIECES.bK; ++t_piece) {
		for (t_pce_num = 0; t_pce_num < brd_pceNum[t_piece]; ++t_pce_num) {
			sq120 = brd_pList[PCEINDEX(t_piece, t_pce_num)];
			if (brd_pieces[sq120] != t_piece) {
				console.log('Error Pce Lists');
				return BOOL.FALSE;
			}
		}
	}
	for (sq64 = 0; sq64 < 64; ++sq64) {
		sq120 = SQ120(sq64);
		t_piece = brd_pieces[sq120];
		t_pceNum[t_piece]++;
		t_material[PieceCol[t_piece]] += PieceVal[t_piece];
	}
	for (t_piece = PIECES.wP; t_piece <= PIECES.bK; ++t_piece) {
		if (t_pceNum[t_piece] != brd_pceNum[t_piece]) {
			console.log('Error t_pceNum');
			return BOOL.FALSE;
		}
	}
	if (t_material[COLOURS.WHITE] != brd_material[COLOURS.WHITE] || t_material[COLOURS.BLACK] != brd_material[COLOURS.BLACK]) {
		console.log('Error t_material');
		return BOOL.FALSE;
	}
	if (brd_side != COLOURS.WHITE && brd_side != COLOURS.BLACK) {
		console.log('Error brd_side');
		return BOOL.FALSE;
	}
	if (GeneratePosKey() != brd_posKey) {
		console.log('Error brd_posKey');
		return BOOL.FALSE;
	}
	return BOOL.TRUE;
}
function checkBoardEmpty(arr) { for (const x of arr) { if (!empty_func(x)) return false; } return true; }
function checkBoardFull(arr) { for (const x of arr) if (empty_func(x)) return false; return true; }
function checkCleanup() {
	if (!S.vars.firstTime) {
		pageHeaderClearAll();
		restoreBehaviors();
		stopBlinking('a_d_status');
		openTabTesting('London');
		UIS['a_d_status'].clear({ innerHTML: '<div id="c_d_statusText">status</div>' });
		UIS['a_d_actions'].clear({ innerHTML: '<div id="a_d_divSelect" class="sidenav1"></div>' });
		let areaPlayer = isdef(UIS['a_d_player']) ? 'a_d_player' : isdef(UIS['a_d_players']) ? 'a_d_players' : 'a_d_options';
		for (const id of ['a_d_log', 'a_d_objects', areaPlayer, 'a_d_game']) clearElement(id);
		delete S.players;
	} else S.vars.firstTime = false;
}
function checkCleanup_I() {
	if (isdef(UIS)) {
		stopBlinking('a_d_status');
		hide('passToNextPlayerUI');
		hide('freezer');
		stopInteraction();
		clearLog();
		delete G.end;
		delete G.signals.receivedEndMessage;
		delete G.previousPlayer;
		delete G.player;
		collections = {};
		scenarioQ = [];
	}
}
function checkCleanup_II() {
	if (isdef(UIS)) {
		checkCleanup_I();
		pageHeaderClearAll();
		restoreBehaviors();
		openTabTesting('ObjectsTab');
		UIS['a_d_status'].clear({ innerHTML: '<div id="c_d_statusText">status</div>' });
		UIS['a_d_actions'].clear({ innerHTML: '<div id="a_d_divSelect" class="sidenav1"></div>' });
		let areaPlayer = isdef(UIS['a_d_player']) ? 'a_d_player' : isdef(UIS['a_d_players']) ? 'a_d_players' : 'a_d_options';
		for (const id of ['a_d_log', 'a_d_objects', areaPlayer, 'a_d_game']) clearElement(id);
	}
}
function checkCleanup_III() {
	if (isdef(UIS)) {
		checkCleanup_II();
		delete S.players;
	}
}
function checkControlKey(ev) {
	if (ev.key == 'Control') {
		isControlKeyDown = false;
		clearInfoboxes();
	}
}
function checkGameConfigComplete() {
	for (const pl of S.gameConfig.players) {
		if (isEmpty(pl.username)) return false;
	}
	return true;
}
function checkKey(superdi, key, type) {
	let types = ['const', 'var', 'cla', 'func'];
	let itype = types.indexOf(type);
	for (const t in superdi) {
		if (lookup(superdi, [t, key])) {
			let it = types.indexOf(t);
			if (itype > it) { delete superdi[t][key]; return type; }
			else if (it > itype) { return type == 'const' ? t : false; }
			else return type;
		}
	}
	return type;
}
function checkPlayer(i) {
	id = getidNum(i); document.getElementById(id).checked = true;
}
function checkPotentialTTT(arr, rows, cols) { return checkWinnerPossible(arr, rows, cols); }
function CheckResult() {
	if (brd_fiftyMove > 100) {
		$("#GameStatus").text("GAME DRAWN {fifty move rule}");
		return BOOL.TRUE;
	}
	if (ThreeFoldRep() >= 2) {
		$("#GameStatus").text("GAME DRAWN {3-fold repetition}");
		return BOOL.TRUE;
	}
	if (DrawMaterial() == BOOL.TRUE) {
		$("#GameStatus").text("GAME DRAWN {insufficient material to mate}");
		return BOOL.TRUE;
	}
	GenerateMoves();
	var MoveNum = 0;
	var found = 0;
	for (MoveNum = brd_moveListStart[brd_ply]; MoveNum < brd_moveListStart[brd_ply + 1]; ++MoveNum) {
		if (MakeMove(brd_moveList[MoveNum]) == BOOL.FALSE) {
			continue;
		}
		found++;
		TakeMove();
		break;
	}
	$("#currentFenSpan").text(BoardToFen());
	if (found != 0) return BOOL.FALSE;
	var InCheck = SqAttacked(brd_pList[PCEINDEX(Kings[brd_side], 0)], brd_side ^ 1);
	console.log('No Move Found, incheck:' + InCheck);
	if (InCheck == BOOL.TRUE) {
		if (brd_side == COLOURS.WHITE) {
			$("#GameStatus").text("GAME OVER {black mates}");
			GameController.winner = 'black';
			return BOOL.TRUE;
		} else {
			$("#GameStatus").text("GAME OVER {white mates}");
			GameController.winner = 'white';
			return BOOL.TRUE;
		}
	} else {
		$("#GameStatus").text("GAME DRAWN {stalemate}"); return BOOL.TRUE;
	}
	console.log('Returning False');
	return BOOL.FALSE;
}
function checkSudokuRule(matrix) {
	let i = 0;
	for (const arr of matrix) {
		let dd = hasDuplicate(arr);
		if (dd) {
			let err = { type: 'row', row: i, col: dd.i, val: dd.val, info: dd, i: i };
			return err;
		}
		i += 1;
	}
	i = 0;
	for (const arr of bGetCols(matrix)) {
		let dd = hasDuplicate(arr);
		if (dd) {
			let err = { type: 'column', col: i, row: dd.i, val: dd.val, i: i, info: dd };
			return err;
		}
		i += 1;
	}
	let [rows, cols] = [matrix.length, matrix[0].length];
	let rowsEach = rows == 9 ? 3 : 2;
	let colsEach = cols == 4 ? 2 : 3;
	let chunks = bGetChunksWithIndices(matrix, rowsEach, colsEach);
	i = 0;
	for (const arr of chunks) {
		let dd = hasDuplicate(arr);
		if (dd) {
			let val = dd.val;
			let err = { type: 'quadrant', row: val.row, col: val.col, val: val.val, i: i, info: dd };
		}
		i += 1;
	}
	return null;
}
function checkSudokuRule_trial1(matrix) {
	for (const arr of matrix) { let dd = hasDuplicate(arr); if (dd) return { type: 'row', info: dd }; }
	for (const arr of bGetCols(matrix)) { let dd = hasDuplicate(arr); if (dd) return { type: 'column', info: dd }; }
	let chunks = bGetChunks(matrix, 2, 2);
	for (const arr of chunks) { let dd = hasDuplicate(arr); if (dd) return { type: 'quadrant', info: dd }; }
	return null;
}
function checkTimer(G) { if (nundef(GameTimer)) return false; return GameTimer.check(G); }
function CheckUp() {
	if (($.now() - srch_start) > srch_time) srch_stop = BOOL.TRUE;
}
function checkWinner(arr, rows, cols) {
	for (i = 0; i < rows; i++) { let ch = bFullRow(arr, i, rows, cols); if (ch) return ch; }
	for (i = 0; i < cols; i++) { let ch = bFullCol(arr, i, rows, cols); if (ch) return ch; }
	let ch = bFullDiag(arr, rows, cols); if (ch) return ch;
	ch = bFullDiag2(arr, rows, cols); if (ch) return ch;
	return null;
}
function checkWinnerC4(arr, rows = 6, cols = 7, stride = 4) {
	for (i = 0; i < rows; i++) { let ch = bStrideRow(arr, i, rows, cols, stride); if (ch) return ch; }
	for (i = 0; i < cols; i++) { let ch = bStrideCol(arr, i, rows, cols, stride); if (ch) return ch; }
	for (i = 0; i < rows; i++) {
		for (j = 0; j < cols; j++) {
			let ch = bStrideDiagFrom(arr, i, j, rows, cols, stride); if (ch) return ch;
			ch = bStrideDiag2From(arr, i, j, rows, cols, stride); if (ch) return ch;
		}
	}
	return null;
}
function checkWinnerPossible(arr, rows, cols) {
	for (i = 0; i < rows; i++) { let ch = bPartialRow(arr, i, rows, cols); if (ch) return ch; }
	for (i = 0; i < cols; i++) { let ch = bPartialCol(arr, i, rows, cols); if (ch) return ch; }
	let ch = bPartialDiag(arr, rows, cols); if (ch) return ch;
	ch = bPartialDiag2(arr, rows, cols); if (ch) return ch;
	return null;
}
function checkwinners(arr, rows, cols) {
	for (i = 0; i < rows; i++) { let ch = bFullRow(arr, i, rows, cols); if (ch) return ch; }
	for (i = 0; i < cols; i++) { let ch = bFullCol(arr, i, rows, cols); if (ch) return ch; }
	let ch = bFullDiag(arr, rows, cols); if (ch) return ch;
	ch = bFullDiag2(arr, rows, cols); if (ch) return ch;
	return null;
}
function checkwinnersC4(arr, rows = 6, cols = 7, stride = 4) {
	for (i = 0; i < rows; i++) { let ch = bStrideRow(arr, i, rows, cols, stride); if (ch) return ch; }
	for (i = 0; i < cols; i++) { let ch = bStrideCol(arr, i, rows, cols, stride); if (ch) return ch; }
	for (i = 0; i < rows; i++) {
		for (j = 0; j < cols; j++) {
			let ch = bStrideDiagFrom(arr, i, j, rows, cols, stride); if (ch) return ch;
			ch = bStrideDiag2From(arr, i, j, rows, cols, stride); if (ch) return ch;
		}
	}
	return null;
}
function checkwinnersPossible(arr, rows, cols) {
	for (i = 0; i < rows; i++) { let ch = bPartialRow(arr, i, rows, cols); if (ch) return ch; }
	for (i = 0; i < cols; i++) { let ch = bPartialCol(arr, i, rows, cols); if (ch) return ch; }
	let ch = bPartialDiag(arr, rows, cols); if (ch) return ch;
	ch = bPartialDiag2(arr, rows, cols); if (ch) return ch;
	return null;
}
function checkwinnersTTT(arr, rows, cols) { return checkwinners(arr, rows, cols); }
function checkWinnerTTT(arr, rows, cols) { return checkWinner(arr, rows, cols); }
function chessTestPos01() {
	let board = [
		['bk', 'em', 'em', 'em', 'em', 'em', 'em', 'em'],
		['em', 'bn', 'em', 'wr', 'em', 'wp', 'em', 'em'],
		['br', 'em', 'bp', 'em', 'em', 'bn', 'wn', 'em'],
		['em', 'em', 'bp', 'bp', 'bp', 'em', 'wp', 'bp'],
		['bp', 'bp', 'em', 'bp', 'wn', 'em', 'wp', 'em'],
		['em', 'em', 'em', 'em', 'em', 'em', 'em', 'em'],
		['em', 'em', 'em', 'wk', 'em', 'em', 'em', 'em'],
		['em', 'em', 'em', 'em', 'em', 'em', 'em', 'em'],
	];
	console.log(arrToFen(board));
}
function chessTestPos02() {
	let board = [
		['em', 'em', 'em', 'em', 'em', 'em', 'em', 'em'],
		['em', 'em', 'em', 'em', 'em', 'em', 'em', 'em'],
		['em', 'em', 'em', 'em', 'em', 'em', 'em', 'em'],
		['em', 'em', 'em', 'em', 'em', 'em', 'em', 'em'],
		['em', 'em', 'em', 'em', 'em', 'em', 'em', 'em'],
		['em', 'em', 'em', 'em', 'em', 'em', 'em', 'em'],
		['em', 'em', 'em', 'em', 'em', 'em', 'em', 'em'],
		['em', 'em', 'em', 'em', 'em', 'em', 'em', 'em'],
	];
	console.log(arrToFen(board, 'b'));
}
function choose(arr, n, excepti) { return rChoose(arr, n, null, excepti); }
function choose_dep(arr, n) {
	var result = new Array(n);
	var len = arr.length;
	var taken = new Array(len);
	if (n > len) n = len - 1;
	while (n--) {
		var iRandom = Math.floor(Math.random() * len);
		result[n] = arr[iRandom in taken ? taken[iRandom] : iRandom];
		taken[iRandom] = --len in taken ? taken[len] : len;
	}
	return result;
}
function chooseDeterministicOrRandom(n, arr, condFunc = null) {
	if (n < 0) return chooseRandomElement(arr, condFunc);
	if (condFunc) {
		let best = arr.filter(condFunc);
		if (!empty(best)) return best[n % best.length];
	}
	return arr[n % arr.length];
}
function chooseKeys(dict, n, except) { let keys = Object.keys(dict); let ind = except.map(x => keys.indexOf(x)); return choose(keys, n, ind); }
function chooseRandom(arr) { return rChoose(arr); }
function chooseRandomDictKey(dict, condFunc = null) {
	if (isEmpty(dict)) return null;
	let arr = Object.keys(dict);
	let len = arr.length;
	if (condFunc) {
		let best = arr.filter(condFunc);
		if (!isEmpty(best)) return chooseRandom(best);
	}
	let idx = Math.floor(Math.random() * len);
	return arr[idx];
}
function chooseRandomElement(arr, condFunc = null) {
	let len = arr.length;
	if (condFunc) {
		let best = arr.filter(condFunc);
		if (!empty(best)) return chooseRandomElement(best);
	}
	let idx = Math.floor(Math.random() * len);
	return arr[idx];
}
function chooseRandomKey(dict) { return chooseRandom(Object.keys(dict)); }
function circleCenters(rows, cols, wCell, hCell) {
	let [w, h] = [cols * wCell, rows * hCell];
	let cx = w / 2;
	let cy = h / 2;
	let centers = [{ x: cx, y: cy }];
	let rx = cx + wCell / 2; let dradx = rx / wCell;
	let ry = cy + hCell / 2; let drady = ry / hCell;
	let nSchichten = Math.floor(Math.min(dradx, drady));
	for (let i = 1; i < nSchichten; i++) {
		let [newCenters, wsch, hsch] = oneCircleCenters(i * 2 + 1, i * 2 + 1, wCell, hCell);
		for (const nc of newCenters) {
			centers.push({ x: nc.x + cx - wsch / 2, y: nc.y + cy - hsch / 2 });
		}
	}
	return [centers, wCell * cols, hCell * rows];
}
async function cities_from_csv_and_info(min = 25000) {
	let info = await route_path_yaml_dict('../base/assets/lists/info.yaml');
	let text = await route_path_text('../base/mapdata/cities.csv');
	let cities = M.cities = csv2list(text);
	let capitals = [];
	let new_cities = {};
	let num = 0;
	for (const o of cities) {
		let n = o.population;
		if (nundef(n)) continue;
		n = Number(n);
		if (n < min) continue;
		let w1 = o.city_ascii.toLowerCase();
		if (nundef(o.country)) {
			console.log('missing country', o);
			continue;
		}
		num += 1;
		let land1 = o.country.toLowerCase();
		for (const k of info.capital) {
			let w = k.toLowerCase();
			if (w.includes(w1) && w.includes(land1)) {
				capitals.push(o);
				o.capital = 'capital';
			}
			let name = o.name = o.city_ascii;
			if (isdef(new_cities[name]) && new_cities[name].includes('capital')) continue;
			else if (isdef(new_cities[name]) && Number(stringAfterLast(new_cities[name], ',')) > n) continue;
			new_cities[name] = `${o.lng},${o.lat},${o.country},${o.capital},${o.population}`;
		}
	}
	downloadAsYaml(new_cities, 'cities');
	return new_cities;
}
function clamp(x, min, max) { return Math.min(Math.max(x, min), max); }
function cLandscape(dParent, styles = {}, id) {
	if (nundef(styles.w)) styles.w = Card.sz;
	if (nundef(styles.h)) styles.h = styles.w * .65;
	return cBlank(dParent, styles, id);
}
function classByName(name) { return eval(name); }
function cleanup_or_resplay(oldgroup) {
	if (isdef(oldgroup) && isEmpty(oldgroup.ids)) {
		let oldgroupid = oldgroup.id;
		mRemove(iDiv(oldgroup));
		removeInPlace(DA.TJ, oldgroup);
		delete Items[oldgroupid];
	} else if (isdef(oldgroup)) { oldgroup.ov = .3222; resplay_container(oldgroup, .3222) }
}
function cleanupOldGame() {
	updateUserScore();
	if (isdef(G)) { G.clear(); }
	clearTable();
	clearStats();
	clearFleetingMessage();
}
function clear_ack_variables() {
	let [fen, uplayer, pl] = [Z.fen, Z.uplayer, Z.fen.players[Z.uplayer]];
	delete fen.ack_players;
	delete fen.lastplayer;
	delete fen.nextplayer;
	delete fen.turn_after_ack;
	delete fen.ackstage;
	delete fen.callbackname_after_ack;
	delete fen.keeppolling;
}
function clear_agents() {
	for (const a of M.agents) {
		let marker = a.ui;
		M.map.removeLayer(marker);
	}
	M.agents = [];
}
function clear_all() { for (const id of ['dFiddle', 'dMenu', 'dSearch', 'dSearchResult', 'dTable']) iClear(id); console.log('ids', get_keys(Items)) }
function clear_all_players() {
	console.log('trying to clear!!!')
	let d = mBy('d_players');
	let children = d.getElementsByTagName('input');
	console.log('children', children);
	for (const ch of children) { if (!ch.getAttribute('disabled')) ch.checked = false; }
}
function clear_gametable() {
	if (!isEmpty(DA.gameItems)) {
		let t = iDiv(DA.gameItems[0]).parentNode;
		t.remove();
	}
}
function clear_previous_level() {
	if (!isEmpty(A.items)) {
		console.assert(A.level >= 1, 'have items but level is ' + A.level);
		A.ll.push({ items: A.items, selected: A.selected });
		for (const item of A.items) {
			let bui = mBy(item.idButton);
			remove_hover_ui(bui);
			item.idButton = bui.id = getUID();
			let uid = item.idCard;
			let cui = isdef(uid) ? mBy(uid) : null;
			if (A.selected.includes(item.index)) {
				bui.onclick = null;
				if (cui) { mRemoveClass(cui, 'hoverScale'); cui.onclick = null; }
			} else {
				bui.style.opacity = 0;
				if (cui) { mRemoveClass(cui, 'hoverScale'); cui.onclick = null; }
			}
		}
	}
}
function clear_quick_buttons() {
	if (isdef(DA.bQuick)) { DA.bQuick.remove(); delete DA.bQuick; }
}
function clear_router() { M.map.removeControl(M.router); }
function clear_screen() { mShieldsOff(); clear_status(); clear_title(); for (const ch of arrChildren('dScreen')) mClear(ch); mClassRemove('dTexture', 'wood'); mStyle(document.body, { bg: 'white', fg: 'black' }); }
function clear_select(selected, selstyle = 'selected') {
	for (const item of selected) {
		item.isSelected = false;
		let ui = iDiv(item);
		if (isString(selstyle)) {
			mClassRemove(ui, selstyle);
		} else if (isdef(item.style)) {
			mStyle(ui, item.style);
		} else {
			mStyleUndo(ui, selstyle);
		}
	}
	return [];
}
function clear_selection() {
	let [plorder, stage, A, fen, uplayer, pl] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer, Z.fen.players[Z.uplayer]];
	if (nundef(Z.A) || isEmpty(A.selected)) return;
	let selitems = A.selected.map(x => A.items[x]);
	for (const item of selitems) { ari_make_unselected(item); }
	A.selected = [];
}
function clear_status() { if (nundef(mBy('dStatus'))) return; clearTimeout(TO.fleeting); mRemove("dStatus"); }
function clear_table_all() {
	clear_table_events();
	if (isdef(mBy('table'))) clearTable();
	resetUIDs();
	Items = {};
}
function clear_table_events() {
	clear_timeouts();
	STOPAUS = true;
	pauseSound();
	DELAY = 1000;
	uiActivated = aiActivated = false;
	onclick = null;
	clearMarkers();
}
function clear_timeouts() {
	for (const k in TO) clearTimeout(TO[k]);
	stop_simple_timer();
}
function clear_title() { mClear('dTitleMiddle'); mClear('dTitleLeft'); mClear('dTitleRight'); }
function clear_transaction() { DA.simulate = false; DA.transactionlist = []; }
function ClearAllPieces() {
	$(".Piece").remove();
}
function clearBadges() {
	removeBadges(null, 0);
	badges = [];
}
function clearChat() { clearElement(document.getElementById('chatEvent')); }
function clearChatWindow() { clearElement('dChatWindow'); }
function clearDOM() {
}
function clearElement(elem) {
	if (isString(elem)) elem = document.getElementById(elem);
	if (window.jQuery == undefined) { elem.innerHTML = ''; return elem; }
	while (elem.firstChild) {
		$(elem.firstChild).remove();
	}
	return elem;
}
function clearElementFromChildIndex(elem, idx = 0) {
	let charr = arrChildren(elem).slice(idx);
	for (const ch of charr) {
		elem.removeChild(ch);
	}
}
function clearerror() { errormsg(""); }
function clearFleetingMessage() {
	if (isdef(dFleetingMessage)) {
		dFleetingMessage.remove();
		dFleetingMessage = null;
	}
}
function ClearForSearch() {
	var index = 0;
	var index2 = 0;
	for (index = 0; index < 14 * BRD_SQ_NUM; ++index) {
		brd_searchHistory[index] = 0;
	}
	for (index = 0; index < 3 * MAXDEPTH; ++index) {
		brd_searchKillers[index] = 0;
	}
	ClearPvTable();
	brd_ply = 0;
	srch_nodes = 0;
	srch_fh = 0;
	srch_fhf = 0;
	srch_start = $.now();
	srch_stop = BOOL.FALSE;
}
function clearGame() { }
function clearGameTitle() { clearElement(dGameTitle); }
function clearIncludingAttr(elem) {
	if (isString(elem)) elem = document.getElementById(elem);
	elem.innerHTML = '';
	removeAttributes(elem);
	return elem;
}
function clearInfoboxes() {
	let ids = Array.from(getIdsInfobox());
	for (const id of ids) { deleteRSG(id); }
	maxZIndex = 10;
}
function clearInit(elem, startProps = {}) {
	clearElement(elem);
	for (const k in startProps) { elem[k] = startProps[k]; }
}
function clearLevel() { clearElement(dLevel); clearBadges(); }
function clearLog() {
	delete G.log;
	UIS['a_d_log'].clear();
}
function clearMarkers() {
	for (const m of Markers) {
		mRemove(m);
	}
	Markers = [];
}
function clearMessages() { clearElement(document.getElementById('events')); }
function clearPageHeader() {
	UIS['a_d_divPlayerNames'].clear();
}
function ClearPiece(sq) {
	var pce = brd_pieces[sq];
	var col = PieceCol[pce];
	var index = 0;
	var t_pceNum = -1;
	HASH_PCE(pce, sq);
	brd_pieces[sq] = PIECES.EMPTY;
	brd_material[col] -= PieceVal[pce];
	for (index = 0; index < brd_pceNum[pce]; ++index) {
		if (brd_pList[PCEINDEX(pce, index)] == sq) {
			t_pceNum = index;
			break;
		}
	}
	brd_pceNum[pce]--;
	brd_pList[PCEINDEX(pce, t_pceNum)] = brd_pList[PCEINDEX(pce, brd_pceNum[pce])];
}
function ClearPvTable() {
	for (index = 0; index < PVENTRIES; index++) {
		brd_PvTable[index].move = NOMOVE;
		brd_PvTable[index].posKey = 0;
	}
}
function clearScore() { clearElement(dScore) }
function clearStats() {
	clearLevel();
	clearScore();
	clearGameTitle();
}
function clearStatus() { clearFleetingMessage(); }
function clearStep() {
}
function clearTable() {
	clearElement('dTable');
	clearElement('dHistory');
	show_title();
	clearElement('dMessage');
	clearElement('dInstruction');
	clearElement('dTitleRight');
	hide('bPauseContinue');
}
function clearTimeCD() {
	if (nundef(MSTimeTO)) return;
	clearTimeout(MSTimeTO); MSTimeClock = MSTimeDiff = MSTimeStart = MSTimeCallback = MSTimeTO = null;
}
function clearTimeouts() {
	onclick = null;
	clearTimeout(TOMain);
	clearTimeout(TOFleetingMessage);
	clearTimeout(TOTrial);
	if (isdef(TOList)) { for (const k in TOList) { TOList[k].map(x => clearTimeout(x)); } }
}
function clearZones() {
	for (const k in Zones) {
		clearElement(Zones[k].dData);
	}
}
function click_shield_off() { mBy('dShield').style.display = 'none'; }
function click_shield_on(msg) { show_shield(msg); }
function ClickedSquare(pageX, pageY) {
	var position = $("#ChessBoard").position();
	let dBoard = mBy('ChessBoard');
	let rBoard = setRectInt(dBoard);
	let dParent = mBy('ChessBoard').parentNode;
	let r = setRectInt(dParent);
	var workedX = Math.floor(position.left);
	var workedY = Math.floor(position.top);
	var pageX = Math.floor(pageX);
	var pageY = Math.floor(pageY);
	var file = Math.floor((pageX - workedX - r.l) / 60);
	var rank = 7 - Math.floor((pageY - workedY - r.t) / 60);
	var sq = FR2SQ(file, rank);
	if (GameController.BoardFlipped == BOOL.TRUE) {
		sq = MIRROR120(sq);
	}
	SetSqSelected(sq);
	return sq;
}
function cLine(x1, y1, x2, y2, styles = null, ctx = null) {
	if (nundef(ctx)) { ctx = CX; if (!ctx) return; }
	if (styles) cStyle(styles, ctx);
	ctx.beginPath();
	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2)
	ctx.stroke();
}
function cloneIfNecessary(value, optionsArgument) {
	var clone = optionsArgument && optionsArgument.clone === true
	return (clone && isMergeableObject(value)) ? deepmerge(emptyTarget(value), value, optionsArgument) : value
}
function cloneSvg(svg, id) {
	var newPawn = svg.cloneNode(true);
	newPawn.id = id;
	return newPawn;
}
function close_game_options() { mBy('inner_left_panel').innerHTML = ''; }
function close_image(e) {
	e.target.className = "image_off";
}
function close_mini_user_info() {
	setTimeout(() => {
		mBy('user_info_mini').style.display = 'none';
	}, 500);
}
function close_popup() {
	let dpop = mBy('dPopup');
	hide(dpop);
}
function close_sidebar() {
	let d = mBy('left_panel'); d.style.flex = 0;
	DA.left_panel = 'closed';
}
function closeAux() {
	hide(dAux);
	hide('dGo');
	show('dGear');
	show('dTemple');
	if (Settings.hasChanged) { Settings.updateSettings(); dbSaveX(); }
	Settings.hasChanged = false;
	auxOpen = false;
}
function closeGameConfig() {
	hideGameConfig();
	if (USE_SOCKETIO) {
		showEventList();
	}
	setMessage('hi again!');
	show('bJoinGame');
	show('bCreateGame');
	show('bResumeGame');
	hide('bLobbyOk');
	hide('bLobbyCancel');
}
function closeInfoboxesForBoatOids(boat) {
	let oids = boat.o.oids;
	for (const oid of oids) hideInfobox(oid);
}
function closeJoinConfig() {
	hideJoinConfig();
	if (USE_SOCKETIO) {
		showEventList();
	}
	setMessage('hi again!');
	show('bJoinGame');
	show('bCreateGame');
	show('bResumeGame');
	hide('bLobbyJoinOk');
	hide('bLobbyJoinCancel');
}
function closeLeftPane() {
	if (!paneOpen) return 0;
	let right = mBy('dInnerRight');
	mStyle(right, { flex: 2 });
	paneOpen = false;
	return DELAY_PANE;
}
function closeSettings() { setPicsPerLevel(); hide(dSettings); resumeUI(); }
function closeSocket() {
	if (!USE_SOCKETIO) return;
	if (clientData.name !== null && socket !== null) {
		socket.emit('message', clientData.name + ' has left');
		socket.close();
	}
}
function closestParent(elem, selector) {
	for (; elem && elem !== document; elem = elem.parentNode) {
		if (elem.matches(selector)) return elem;
	}
	return null;
}
function cls() {
	clearElement(document.getElementById('g'));
}
function coButtonSidebarDiv_00(dParent, bCaption = '☰', bStyles = { fz: 30 }, sbStyles = { bg: wpink }, divStyles = {}, outerStyles = { matop: 4, bg: wgrey }) {
	let d0 = mDiv100(dParent);
	let b = mButton(bCaption, null, d0, bStyles, 'mybutton');
	outerStyles.position = 'relative';
	let h = getRect(d0).h - (getRect(b).h + outerStyles.matop);
	outerStyles.h = h;
	let d = mDiv(d0, outerStyles);
	let dSide = mDiv(d, sbStyles);
	let dContent = mDiv(d, divStyles);
	let sb = iSidebar(d, dSide, dContent, b, 120, false);
	return { button: b, sidebar: sb, div: dContent };
}
function coin(percent = 50) { return Math.random() * 100 < percent; }
function collapseAll() {
	let coll = document.getElementsByClassName("collapsible");
	for (let i = 0; i < coll.length; i++) {
		let elem = coll[i];
		if (isVisible(getLinkContainerId(elem.id))) fireClick(elem);
	}
}
function collapseSmallLetterAreas(m, d) {
	let rows = m.length;
	let cols = m[0].length;
	let gtc = [];
	for (let c = 0; c < cols; c++) {
		gtc[c] = 'min-content';
		for (let r = 0; r < rows; r++) {
			let sArea = m[r][c];
			if (sArea[0] == sArea[0].toUpperCase()) gtc[c] = 'auto';
		}
	}
	let cres = gtc.join(' ');
	d.style.gridTemplateColumns = gtc.join(' '); //'min-content 1fr 1fr min-content';// 'min-content'.repeat(rows);
	let gtr = [];
	for (let r = 0; r < rows; r++) {
		gtr[r] = 'min-content';
		for (let c = 0; c < cols; c++) {
			let sArea = m[r][c];
			if (sArea[0] == sArea[0].toUpperCase()) gtr[r] = 'auto';
		}
	}
	let rres = gtr.join(' ');
	d.style.gridTemplateRows = gtr.join(' '); //'min-content 1fr 1fr min-content';// 'min-content'.repeat(rows);
}
function collect_data() {
	var myform = mBy("myform");
	var inputs = myform.getElementsByTagName("INPUT");
	var data = {};
	for (var i = inputs.length - 1; i >= 0; i--) {
		var key = inputs[i].name;
		switch (key) {
			case "username":
			case "name":
				let uname = inputs[i].value;
				console.log(`${key} in input is`, uname);
				uname = replaceAllSpecialChars(uname, ' ', '_');
				uname = replaceAllSpecialChars(uname, '&', '_');
				uname = replaceAllSpecialChars(uname, '+', '_');
				uname = replaceAllSpecialChars(uname, '?', '_');
				uname = replaceAllSpecialChars(uname, '=', '_');
				uname = replaceAllSpecialChars(uname, '+', '_');
				uname = replaceAllSpecialChars(uname, '/', '_');
				uname = replaceAllSpecialChars(uname, '\\', '_');
				data[key] = uname.toLowerCase();
				break;
			case "motto":
				data[key] = inputs[i].value.toLowerCase();
		}
	}
	if (DA.imageChanged) {
		sendHtml('imgPreview', Session.cur_user);
	} else {
		let udata = get_current_userdata();
		let changed = false;
		if (DA.colorChanged) { udata.color = DA.newColor; changed = true; }
		if (data.motto != udata.motto) {
			changed = true;
			udata.motto = data.motto;
			mBy('motto').innerHTML = udata.motto;
		}
		if (changed) {
			DA.next = get_login;
			db_save();
		}
	}
}
function collect_game_options() {
	collect_player_list();
	collect_game_specific_options();
}
function collect_game_specific_options(game) {
	let poss = Config.games[game].options;
	if (nundef(poss)) return;
	let di = {};
	for (const p in poss) {
		let fs = mBy(`d_${p}`);
		let val = get_checked_radios(fs)[0];
		di[p] = isNumber(val) ? Number(val) : val;
	}
	return di;
}
function collect_innerHTML(arr, sep = '') { return arr.map(x => iDiv(x).innerHTML).join(sep); }
function collect_player_list() {
	let d = mBy('d_players');
	let checkboxes = d.getElementsByTagName('input');
	Session.game_options.players = [];
	for (const chk of checkboxes) {
		if (chk.checked) {
			Session.game_options.players.push(chk.value);
		}
	}
}
function collectPropFromCss(prop) {
	const styles = document.styleSheets;
	let cssArr = [...styles[0].cssRules].map(x => ({
		class: x.selectorText,
		color: rgbToHex(x.style[prop]),
	}));
	return cssArr;
}
function color_areas(nHues = 2, iButtonHue = 0, areaClass = 'area', gridDiv = 'root') {
	let hue1 = Math.floor(Math.random() * 360);
	let pal = gen_palette(hue1, nHues);
	palette = pal;
	setCSSButtonColors(pal, iButtonHue);
	let areas = document.getElementsByClassName(areaClass);
	let grid = document.getElementById(gridDiv);
	grid.style.backgroundColor = pal[pal.length - 1][0].b;
	idx = 0;
	ihue = 0;
	for (const a of areas) {
		let cb = (a.style.backgroundColor = pal[idx][ihue].b);
		let cf = (a.style.color = pal[idx][ihue].f);
		testHelpers('back', standardize_color(cb));
		let hex = standardize_color(cb);
		let f = complementaryColor(hex);
		a.style.color = f;
		let rgbString = hex2rgb(hex);
		let f2 = getTextColor(rgbString);
		a.style.color = f2;
		let f3 = niceColor(rgbString);
		a.style.color = f3;
		let f4 = blackOrWhite(cb);
		a.style.color = f4;
		let f5 = idealTextColor(hex);
		a.style.color = f5;
		idx += 1;
		if (idx >= pal.length - 2) idx = 0;
		ihue = (ihue + 1) % pal[0].length;
		if (idx % pal[0].length == 0) ihue = (ihue + 1) % pal[0].length;
	}
}
function color2trans(color, alpha = 0.5) {
	let hex = standardize_color(color);
	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	result = result
		? {
			r: parseInt(result[1], 16),
			g: parseInt(result[2], 16),
			b: parseInt(result[3], 16)
		}
		: null;
	if (result) return `rgba(${result.r},${result.g},${result.b},${alpha})`;
	else return 'rgb(0,0,0,0.5)';
}
function colorA(cAny) {
	let rgb = colorRGB(cAny, true);
	return rgb.a;
}
function colorAreas(fromLocalStorage = true, nColors = 2) {
	let key = chooseRandom(Object.keys(modern_palettes));
	let colors = Object.values(modern_palettes[key]);
	colors = choose(colors, nColors + 1);
	shuffle(colors);
	let pals = colors.map(x => getPalette(x));
	setSYS('pals', pals);
	let ihue = 0;
	let idarkness = 1;
	setCSSVariable('--bgBody', pals[0][2]);
	setCSSButtonColors(pals, 0);
	for (const areaName of getSYS('baseAreaNames')) {
		console.log(areaName, ihue, idarkness);
		let areaInfo = getArea(areaName);
		let a = areaInfo.div;
		let bg = pals[ihue][idarkness];
		a.style.backgroundColor = bg;
		areaInfo.bg = bg;
		let fg = colorIdealText(bg);
		a.style.color = fg;
		areaInfo.fg = fg;
		areaInfo.idarkness = idarkness;
		areaInfo.ihue = ihue;
		idarkness += 1;
		if (idarkness >= pals[0].length - 2) idarkness = 1;
		ihue = (ihue + 1) % 2;
	}
}
function colorAreas_dep(hue0 = 260, nHues = 25, areaClass = 'area', root = 'root') {
	let hue1 = nHues;
	let hues = [hue0, hue1];
	let pals = [];
	for (const hue of hues) {
		let c = colorFrom(colorFromHue(hue));
		let pal = colorPalShade(c);
		pals.push(pal);
	}
	let ihue = 0;
	let idarkness = 1;
	setCSSVariable('--bgBody', pals[0][2]);
	setCSSButtonColors(pals, 0);
	let areas = document.getElementsByClassName(areaClass);
	let grid = document.getElementById(root);
	let areaColors = {};
	for (const a of areas) {
		let bg = (a.style.backgroundColor = pals[ihue][idarkness]);
		a.style.color = colorIdealText(bg);
		areaColors[a.id] = { bg: bg, fg: a.style.color, ihue: ihue, idarkness: idarkness };
		idarkness += 1;
		if (idarkness >= pals[0].length - 2) idarkness = 1;
		ihue = (ihue + 1) % pals.length;
	}
	return { hue0: hue0, nHues: nHues, pals: pals, mode: 'shades', areaColors: areaColors };
}
function colorAreas_wild(fromLocalStorage = true, { className = null } = {}) {
	let hues = getRandomHues(fromLocalStorage);
	let pals = getPaletteFromHues(hues);
	setSYS('pals', pals);
	setSYS('hues', hues);
	let ihue = 0;
	let idarkness = 1;
	setCSSVariable('--bgBody', pals[0][2]);
	setCSSButtonColors(pals, 0);
	let areaNames = [];
	if (isdef(className)) {
		let divs = document.getElementsByClassName(className);
		areaNames = divs.map(x => x.id);
		console.log(divs, areaNames);
	} else {
		areaNames = getSYS('baseAreaNames');
	}
	console.log(areaNames);
	for (const areaName of areaNames) {
		if (isdef(className)) {
			let d = document.getElementById(areaName);
			a.style.backgroundColor = randomColor();
			let fg = colorIdealText(bg);
			continue;
		}
		let areaInfo = getArea(areaName);
		let a = areaInfo.div;
		let bg = pals[ihue][idarkness];
		a.style.backgroundColor = bg;
		areaInfo.bg = bg;
		let fg = colorIdealText(bg);
		a.style.color = fg;
		areaInfo.fg = fg;
		areaInfo.idarkness = idarkness;
		areaInfo.ihue = ihue;
		idarkness += 1;
		if (idarkness >= pals[0].length - 2) idarkness = 1;
		ihue = (ihue + 1) % pals.length;
	}
}
function colorAreasBlend(c1, c2, areaClass = 'area', root = 'root') {
	c1 = colorFrom(c1);
	c2 = colorFrom(c2);
	let pb = colorPalBlend(c1, c2);
	let pals = [];
	for (const c of pb) {
		let pal = colorPalShade(c);
		pals.push(pal);
	}
	let ihue = 0;
	let idarkness = 1;
	setCSSButtonColors(pals, 0);
	let areas = document.getElementsByClassName(areaClass);
	let grid = document.getElementById(root);
	grid.style.backgroundColor = pals[pals.length - 1][0];
	for (const a of areas) {
		let bg = (a.style.backgroundColor = pals[ihue][idarkness]);
		a.style.color = colorIdealText(bg);
		idarkness += 1;
		if (idarkness >= pals[0].length - 2) idarkness = 1;
		ihue = (ihue + 4) % pals.length;
	}
	return pals;
}
function colorAreasN(hue0 = 120, nHues = 25, areaClass = 'area', root = 'root') {
	let hues = [];
	let hueDiff = Math.round(360 / nHues);
	let h = hue0;
	for (let i = 0; i < nHues; i++) {
		hues.push(h);
		h += hueDiff;
	}
	let pals = [];
	for (const hue of hues) {
		let c = colorFrom(colorFromHue(hue));
		let pal = colorPalShade(c);
		pals.push(pal);
	}
	let ihue = 0;
	let idarkness = 1;
	setCSSVariable('--bgBody', pals[0][2]);
	setCSSButtonColors(pals, 0);
	let areas = document.getElementsByClassName(areaClass);
	let grid = document.getElementById(root);
	let areaColors = {};
	for (const a of areas) {
		let bg = (a.style.backgroundColor = pals[ihue][idarkness]);
		a.style.color = colorIdealText(bg);
		areaColors[a.id] = { bg: bg, fg: a.style.color, ihue: ihue, idarkness: idarkness };
		idarkness += 1;
		if (idarkness >= pals[0].length - 2) idarkness = 1;
		ihue = (ihue + 1) % pals.length;
	}
	return { hue0: hue0, nHues: nHues, pals: pals, mode: 'shades', areaColors: areaColors };
}
function colorAreasOppositesBlend(hue = 120, areaClass = 'area', root = 'root') {
	let hueOpp = (hue + 180) % 360;
	let c1 = colorFromHue(hue);
	let c2 = colorFromHue(hueOpp);
	colorAreasBlend(c1, c2, areaClass, root);
}
function colorAreasRandomBlend(areaClass = 'area', root = 'root') {
	let c1 = randomColor();
	let c2 = randomColor();
	colorAreasBlend(c1, c2, areaClass, root);
}
function colorArrToString(r, g, b) {
	return 'rgb(' + r + ',' + g + ',' + b + ')';
}
function colorB(cAny) {
	let rgb = colorRGB(cAny, true);
	return rgb.b;
}
function colorBlend(zero1, c0, c1, log = true) {
	c0 = colorFrom(c0);
	c1 = colorFrom(c1);
	return pSBC(zero1, c0, c1, log);
}
function colorBright(c, percent) {
	let hex = colorHex(c);
	hex = hex.replace(/^\s*#|\s*$/g, '');
	if (hex.length == 3) {
		hex = hex.replace(/(.)/g, '$1$1');
	}
	var r = parseInt(hex.substr(0, 2), 16),
		g = parseInt(hex.substr(2, 2), 16),
		b = parseInt(hex.substr(4, 2), 16);
	return '#' +
		((0 | (1 << 8) + r + (256 - r) * percent / 100).toString(16)).substr(1) +
		((0 | (1 << 8) + g + (256 - g) * percent / 100).toString(16)).substr(1) +
		((0 | (1 << 8) + b + (256 - b) * percent / 100).toString(16)).substr(1);
}
function colorChannelMixer(colorChannelA, colorChannelB, amountToMix) {
	var channelA = colorChannelA * amountToMix;
	var channelB = colorChannelB * (1 - amountToMix);
	return parseInt(channelA + channelB);
}
function colorChildren(strid, setFg = true) {
	for (const spid of strid.ids) {
		colorElem(spid, setFg);
	}
}
function colorChrome() {
	let pals = S.pals;
	setCSSVariable('--bgTabs', pals[0][3]);
	setCSSVariable('--bgBody', pals[0][2]);
	setCSSButtonColors(pals, 0);
}
function colorDark(c, percent = 50, log = true) {
	if (nundef(c)) c = rColor(); else c = colorFrom(c);
	let zero1 = -percent / 100;
	return pSBC(zero1, c, undefined, !log);
}
function colorDarker(c, zero1 = .8, log = true) {
	c = colorFrom(c);
	return pSBC(-zero1, c, undefined, !log);
}
function colorElem(id, setFg = true) {
	let spa = getVisual(id);
	if (!('spa' in spa.isa)) return;
	let bg = S.pals[spa.iPalette][spa.ipal];
	let elem = M.uis[id];
	if (isdef(spa.cssColor)) {
		setCSSVariable(spa.cssColor, bg);
	} else {
		elem.style.backgroundColor = fg;
	}
	if (setFg) {
		let fg = colorIdealText(bg);
		elem.style.color = fg;
	}
}
function colorFrom(cAny, a, allowHsl = false) {
	if (isString(cAny)) {
		if (cAny[0] == '#') {
			if (a == undefined) return cAny;
			cAny = cAny.substring(0, 7);
			return cAny + (a == 1 ? '' : alphaToHex(a));
		} else if (isdef(ColorDi) && lookup(ColorDi, [cAny])) {
			let c = ColorDi[cAny].c;
			if (a == undefined) return c;
			c = c.substring(0, 7);
			return c + (a == 1 ? '' : alphaToHex(a));
		} else if (startsWith(cAny, 'rand')) {
			let spec = capitalize(cAny.substring(4));
			if (isdef(window['color' + spec])) {
				c = window['color' + spec]();
			} else c = rColor();
			if (a == undefined) return c;
			return c + (a == 1 ? '' : alphaToHex(a));
		} else if (startsWith(cAny, 'linear')) {
			return cAny;
		} else if (cAny[0] == 'r' && cAny[1] == 'g') {
			if (a == undefined) return cAny;
			if (cAny[3] == 'a') {
				if (a < 1) {
					return stringBeforeLast(cAny, ',') + ',' + a + ')';
				} else {
					let parts = cAny.split(',');
					let r = firstNumber(parts[0]);
					return 'rgb(' + r + ',' + parts[1] + ',' + parts[2] + ')';
				}
			} else {
				if (a < 1) {
					return 'rgba' + cAny.substring(3, cAny.length - 1) + ',' + a + ')';
				} else {
					return cAny;
				}
			}
		} else if (cAny[0] == 'h' && cAny[1] == 's') {
			if (allowHsl) {
				if (a == undefined) return cAny;
				if (cAny[3] == 'a') {
					if (a < 1) {
						return stringBeforeLast(cAny, ',') + ',' + a + ')';
					} else {
						let parts = cAny.split(',');
						let r = firstNumber(parts[0]);
						return 'hsl(' + r + ',' + parts[1] + ',' + parts[2] + ')';
					}
				} else {
					return a == 1 ? cAny : 'hsla' + cAny.substring(3, cAny.length - 1) + ',' + a + ')';
				}
			} else {
				if (cAny[3] == 'a') {
					cAny = HSLAToRGBA(cAny);
				} else {
					cAny = HSLToRGB(cAny);
				}
				return colorFrom(cAny, a, false);
			}
		} else {
			ensureColorDict();
			let c = ColorDi[cAny];
			if (nundef(c)) {
				if (startsWith(cAny, 'rand')) {
					let spec = cAny.substring(4);
					if (isdef(window['color' + spec])) {
						c = window['color' + spec](res);
					} else c = rColor();
				} else {
					console.log('color not available:', cAny);
					throw new Error('color not found: ' + cAny)
					return '#00000000';
				}
			} else c = c.c;
			if (a == undefined) return c;
			c = c.substring(0, 7);
			return c + (a == 1 ? '' : alphaToHex(a));
		}
	} else if (Array.isArray(cAny)) {
		if (cAny.length == 3 && isNumber(cAny[0])) {
			let r = cAny[0];
			let g = cAny[1];
			let b = cAny[2];
			return a == undefined || a == 1 ? `rgb(${r},${g},${b})` : `rgba(${r},${g},${b},${a})`;
		} else {
			return rChoose(cAny);
		}
	} else if (typeof cAny == 'object') {
		if ('h' in cAny) {
			let hslString = '';
			if (a == undefined || a == 1) {
				hslString = `hsl(${cAny.h},${Math.round(cAny.s <= 1.0 ? cAny.s * 100 : cAny.s)}%,${Math.round(cAny.l <= 1.0 ? cAny.l * 100 : cAny.l)}%)`;
			} else {
				hslString = `hsla(${cAny.h},${Math.round(cAny.s <= 1.0 ? cAny.s * 100 : cAny.s)}%,${Math.round(cAny.l <= 1.0 ? cAny.l * 100 : cAny.l)}%,${a})`;
			}
			if (allowHsl) {
				return hslString;
			} else {
				return colorFrom(hslString, a, allowHsl);
			}
		} else if ('r' in cAny) {
			if (a !== undefined && a < 1) {
				return `rgba(${cAny.r},${cAny.g},${cAny.b},${a})`;
			} else {
				return `rgb(${cAny.r},${cAny.g},${cAny.b})`;
			}
		}
	}
}
function colorFromHSL(hue, sat = 100, lum = 50) {
	return hslToHex(valf(hue, rHue()), sat, lum);
}
function colorFromHue(h, s = 100, l = 50, asObject = false) {
	if (asObject) return { h: h, s: s, l: l }; else return `hsl(${h},${s},${l})`;
}
function colorG(cAny) {
	let rgb = colorRGB(cAny, true);
	return rgb.g;
}
function colorHex(cAny) {
	let c = colorFrom(cAny);
	if (c[0] == '#') {
		return c;
	} else {
		let res = pSBC(0, c, 'c');
		return res;
	}
}
function colorHex_RGBAToHex9(cAny) {
	let c = colorFrom(cAny);
	if (c[0] == '#') {
		return c;
	} else if (c[3] == '(') {
		return RGBToHex7(c);
	} else {
		let res = RGBAToHex9(c);
		return res;
	}
}
function colorHSL(cAny, asObject = false) {
	let res = colorFrom(cAny, undefined, true);
	let shsl = res;
	if (res[0] == '#') {
		if (res.length == 9) {
			shsl = hexAToHSLA(res);
		} else if (res.length == 7) {
			shsl = hexToHSL(res);
		}
	} else if (res[0] == 'r') {
		if (res[3] == 'a') {
			shsl = RGBAToHSLA(res);
		} else {
			shsl = RGBToHSL(res);
		}
	}
	let n = allNumbers(shsl);
	if (asObject) {
		return { h: n[0], s: n[1] / 100, l: n[2] / 100, a: n.length > 3 ? n[3] : 1 };
	} else {
		return shsl;
	}
}
function colorHSLBuild(hue, sat = 100, lum = 50) { let result = "hsl(" + hue + ',' + sat + '%,' + lum + '%)'; return result; }
function colorHue(cAny) { let hsl = colorHSL(cAny, true); return hsl.h; }
function colorHueWheel(contrastTo, minDiff = 25, mod = 30, start = 0) {
	let hc = colorHue(contrastTo);
	let wheel = [];
	while (start < 360) {
		let d1 = Math.abs((start + 360) - hc);
		let d2 = Math.abs((start) - hc);
		let d3 = Math.abs((start - 360) - hc);
		let min = Math.min(d1, d2, d3);
		if (min > minDiff) wheel.push(start);
		start += mod;
	}
	return wheel;
}
function colorIdealText(bg, grayPreferred = false) {
	let rgb = colorRGB(bg, true);
	const nThreshold = 105;
	let r = rgb.r;
	let g = rgb.g;
	let b = rgb.b;
	var bgDelta = r * 0.299 + g * 0.587 + b * 0.114;
	var foreColor = 255 - bgDelta < nThreshold ? 'black' : 'white';
	if (grayPreferred) foreColor = 255 - bgDelta < nThreshold ? 'dimgray' : 'snow';
	return foreColor;
}
function colorLabelDiv(size) { return o => labelDiv(o.label, o.color, size, size); }
function colorLabelRow(pool, loc, o, oid, path, omap) {
	let size = LABEL_SZ, gap = 4;
	let olist = mapOMap(omap);
	if (isEmpty(olist)) return;
	olist = olist.map(item => ({ color: convertToColor(item.key), label: convertToLabel(item.value) }));
	let uis = getUis(olist, colorLabelDiv(size));
	let area = stage2_prepArea(loc);
	let container = stage3_prepContainer(area); mColor(container, 'white');
	stage4_layout(uis, container, size, size, gap, layoutRow);
}
function colorLight(c, percent = 20, log = true) {
	if (nundef(c)) {
		return colorFromHSL(rHue(), 100, 85);
	} else c = colorFrom(c);
	let zero1 = percent / 100;
	return pSBC(zero1, c, undefined, !log);
}
function colorLighter(c, zero1 = .2, log = true) {
	c = colorFrom(c);
	return pSBC(zero1, c, undefined, !log);
}
function colorLum(cAny) {
	let hsl = colorHSL(cAny, true);
	return hsl.l;
}
function colorMap(spec) {
	const Colormap = {
		"jet": [{ "index": 0, "rgb": [0, 0, 131] }, { "index": 0.125, "rgb": [0, 60, 170] }, { "index": 0.375, "rgb": [5, 255, 255] }, { "index": 0.625, "rgb": [255, 255, 0] }, { "index": 0.875, "rgb": [250, 0, 0] }, { "index": 1, "rgb": [128, 0, 0] }],
		"hsv": [{ "index": 0, "rgb": [255, 0, 0] }, { "index": 0.169, "rgb": [253, 255, 2] }, { "index": 0.173, "rgb": [247, 255, 2] }, { "index": 0.337, "rgb": [0, 252, 4] }, { "index": 0.341, "rgb": [0, 252, 10] }, { "index": 0.506, "rgb": [1, 249, 255] }, { "index": 0.671, "rgb": [2, 0, 253] }, { "index": 0.675, "rgb": [8, 0, 253] }, { "index": 0.839, "rgb": [255, 0, 251] }, { "index": 0.843, "rgb": [255, 0, 245] }, { "index": 1, "rgb": [255, 0, 6] }],
		"hot": [{ "index": 0, "rgb": [0, 0, 0] }, { "index": 0.3, "rgb": [230, 0, 0] }, { "index": 0.6, "rgb": [255, 210, 0] }, { "index": 1, "rgb": [255, 255, 255] }],
		"spring": [{ "index": 0, "rgb": [255, 0, 255] }, { "index": 1, "rgb": [255, 255, 0] }],
		"summer": [{ "index": 0, "rgb": [0, 128, 102] }, { "index": 1, "rgb": [255, 255, 102] }],
		"autumn": [{ "index": 0, "rgb": [255, 0, 0] }, { "index": 1, "rgb": [255, 255, 0] }],
		"winter": [{ "index": 0, "rgb": [0, 0, 255] }, { "index": 1, "rgb": [0, 255, 128] }],
		"bone": [{ "index": 0, "rgb": [0, 0, 0] }, { "index": 0.376, "rgb": [84, 84, 116] }, { "index": 0.753, "rgb": [169, 200, 200] }, { "index": 1, "rgb": [255, 255, 255] }],
		"copper": [{ "index": 0, "rgb": [0, 0, 0] }, { "index": 0.804, "rgb": [255, 160, 102] }, { "index": 1, "rgb": [255, 199, 127] }],
		"greys": [{ "index": 0, "rgb": [0, 0, 0] }, { "index": 1, "rgb": [255, 255, 255] }],
		"yignbu": [{ "index": 0, "rgb": [8, 29, 88] }, { "index": 0.125, "rgb": [37, 52, 148] }, { "index": 0.25, "rgb": [34, 94, 168] }, { "index": 0.375, "rgb": [29, 145, 192] }, { "index": 0.5, "rgb": [65, 182, 196] }, { "index": 0.625, "rgb": [127, 205, 187] }, { "index": 0.75, "rgb": [199, 233, 180] }, { "index": 0.875, "rgb": [237, 248, 217] }, { "index": 1, "rgb": [255, 255, 217] }],
		"greens": [{ "index": 0, "rgb": [0, 68, 27] }, { "index": 0.125, "rgb": [0, 109, 44] }, { "index": 0.25, "rgb": [35, 139, 69] }, { "index": 0.375, "rgb": [65, 171, 93] }, { "index": 0.5, "rgb": [116, 196, 118] }, { "index": 0.625, "rgb": [161, 217, 155] }, { "index": 0.75, "rgb": [199, 233, 192] }, { "index": 0.875, "rgb": [229, 245, 224] }, { "index": 1, "rgb": [247, 252, 245] }],
		"yiorrd": [{ "index": 0, "rgb": [128, 0, 38] }, { "index": 0.125, "rgb": [189, 0, 38] }, { "index": 0.25, "rgb": [227, 26, 28] }, { "index": 0.375, "rgb": [252, 78, 42] }, { "index": 0.5, "rgb": [253, 141, 60] }, { "index": 0.625, "rgb": [254, 178, 76] }, { "index": 0.75, "rgb": [254, 217, 118] }, { "index": 0.875, "rgb": [255, 237, 160] }, { "index": 1, "rgb": [255, 255, 204] }],
		"bluered": [{ "index": 0, "rgb": [0, 0, 255] }, { "index": 1, "rgb": [255, 0, 0] }],
		"rdbu": [{ "index": 0, "rgb": [5, 10, 172] }, { "index": 0.35, "rgb": [106, 137, 247] }, { "index": 0.5, "rgb": [190, 190, 190] }, { "index": 0.6, "rgb": [220, 170, 132] }, { "index": 0.7, "rgb": [230, 145, 90] }, { "index": 1, "rgb": [178, 10, 28] }],
		"picnic": [{ "index": 0, "rgb": [0, 0, 255] }, { "index": 0.1, "rgb": [51, 153, 255] }, { "index": 0.2, "rgb": [102, 204, 255] }, { "index": 0.3, "rgb": [153, 204, 255] }, { "index": 0.4, "rgb": [204, 204, 255] }, { "index": 0.5, "rgb": [255, 255, 255] }, { "index": 0.6, "rgb": [255, 204, 255] }, { "index": 0.7, "rgb": [255, 153, 255] }, { "index": 0.8, "rgb": [255, 102, 204] }, { "index": 0.9, "rgb": [255, 102, 102] }, { "index": 1, "rgb": [255, 0, 0] }],
		"rainbow": [{ "index": 0, "rgb": [150, 0, 90] }, { "index": 0.125, "rgb": [0, 0, 200] }, { "index": 0.25, "rgb": [0, 25, 255] }, { "index": 0.375, "rgb": [0, 152, 255] }, { "index": 0.5, "rgb": [44, 255, 150] }, { "index": 0.625, "rgb": [151, 255, 0] }, { "index": 0.75, "rgb": [255, 234, 0] }, { "index": 0.875, "rgb": [255, 111, 0] }, { "index": 1, "rgb": [255, 0, 0] }],
		"portland": [{ "index": 0, "rgb": [12, 51, 131] }, { "index": 0.25, "rgb": [10, 136, 186] }, { "index": 0.5, "rgb": [242, 211, 56] }, { "index": 0.75, "rgb": [242, 143, 56] }, { "index": 1, "rgb": [217, 30, 30] }],
		"blackbody": [{ "index": 0, "rgb": [0, 0, 0] }, { "index": 0.2, "rgb": [230, 0, 0] }, { "index": 0.4, "rgb": [230, 210, 0] }, { "index": 0.7, "rgb": [255, 255, 255] }, { "index": 1, "rgb": [160, 200, 255] }],
		"earth": [{ "index": 0, "rgb": [0, 0, 130] }, { "index": 0.1, "rgb": [0, 180, 180] }, { "index": 0.2, "rgb": [40, 210, 40] }, { "index": 0.4, "rgb": [230, 230, 50] }, { "index": 0.6, "rgb": [120, 70, 20] }, { "index": 1, "rgb": [255, 255, 255] }],
		"electric": [{ "index": 0, "rgb": [0, 0, 0] }, { "index": 0.15, "rgb": [30, 0, 100] }, { "index": 0.4, "rgb": [120, 0, 100] }, { "index": 0.6, "rgb": [160, 90, 0] }, { "index": 0.8, "rgb": [230, 200, 0] }, { "index": 1, "rgb": [255, 250, 220] }],
		"alpha": [{ "index": 0, "rgb": [255, 255, 255, 0] }, { "index": 1, "rgb": [255, 255, 255, 1] }],
		"viridis": [{ "index": 0, "rgb": [68, 1, 84] }, { "index": 0.13, "rgb": [71, 44, 122] }, { "index": 0.25, "rgb": [59, 81, 139] }, { "index": 0.38, "rgb": [44, 113, 142] }, { "index": 0.5, "rgb": [33, 144, 141] }, { "index": 0.63, "rgb": [39, 173, 129] }, { "index": 0.75, "rgb": [92, 200, 99] }, { "index": 0.88, "rgb": [170, 220, 50] }, { "index": 1, "rgb": [253, 231, 37] }],
		"inferno": [{ "index": 0, "rgb": [0, 0, 4] }, { "index": 0.13, "rgb": [31, 12, 72] }, { "index": 0.25, "rgb": [85, 15, 109] }, { "index": 0.38, "rgb": [136, 34, 106] }, { "index": 0.5, "rgb": [186, 54, 85] }, { "index": 0.63, "rgb": [227, 89, 51] }, { "index": 0.75, "rgb": [249, 140, 10] }, { "index": 0.88, "rgb": [249, 201, 50] }, { "index": 1, "rgb": [252, 255, 164] }],
		"magma": [{ "index": 0, "rgb": [0, 0, 4] }, { "index": 0.13, "rgb": [28, 16, 68] }, { "index": 0.25, "rgb": [79, 18, 123] }, { "index": 0.38, "rgb": [129, 37, 129] }, { "index": 0.5, "rgb": [181, 54, 122] }, { "index": 0.63, "rgb": [229, 80, 100] }, { "index": 0.75, "rgb": [251, 135, 97] }, { "index": 0.88, "rgb": [254, 194, 135] }, { "index": 1, "rgb": [252, 253, 191] }],
		"plasma": [{ "index": 0, "rgb": [13, 8, 135] }, { "index": 0.13, "rgb": [75, 3, 161] }, { "index": 0.25, "rgb": [125, 3, 168] }, { "index": 0.38, "rgb": [168, 34, 150] }, { "index": 0.5, "rgb": [203, 70, 121] }, { "index": 0.63, "rgb": [229, 107, 93] }, { "index": 0.75, "rgb": [248, 148, 65] }, { "index": 0.88, "rgb": [253, 195, 40] }, { "index": 1, "rgb": [240, 249, 33] }],
		"warm": [{ "index": 0, "rgb": [125, 0, 179] }, { "index": 0.13, "rgb": [172, 0, 187] }, { "index": 0.25, "rgb": [219, 0, 170] }, { "index": 0.38, "rgb": [255, 0, 130] }, { "index": 0.5, "rgb": [255, 63, 74] }, { "index": 0.63, "rgb": [255, 123, 0] }, { "index": 0.75, "rgb": [234, 176, 0] }, { "index": 0.88, "rgb": [190, 228, 0] }, { "index": 1, "rgb": [147, 255, 0] }],
		"cool": [{ "index": 0, "rgb": [125, 0, 179] }, { "index": 0.13, "rgb": [116, 0, 218] }, { "index": 0.25, "rgb": [98, 74, 237] }, { "index": 0.38, "rgb": [68, 146, 231] }, { "index": 0.5, "rgb": [0, 204, 197] }, { "index": 0.63, "rgb": [0, 247, 146] }, { "index": 0.75, "rgb": [0, 255, 88] }, { "index": 0.88, "rgb": [40, 255, 8] }, { "index": 1, "rgb": [147, 255, 0] }],
		"rainbow-soft": [{ "index": 0, "rgb": [125, 0, 179] }, { "index": 0.1, "rgb": [199, 0, 180] }, { "index": 0.2, "rgb": [255, 0, 121] }, { "index": 0.3, "rgb": [255, 108, 0] }, { "index": 0.4, "rgb": [222, 194, 0] }, { "index": 0.5, "rgb": [150, 255, 0] }, { "index": 0.6, "rgb": [0, 255, 55] }, { "index": 0.7, "rgb": [0, 246, 150] }, { "index": 0.8, "rgb": [50, 167, 222] }, { "index": 0.9, "rgb": [103, 51, 235] }, { "index": 1, "rgb": [124, 0, 186] }],
		"bathymetry": [{ "index": 0, "rgb": [40, 26, 44] }, { "index": 0.13, "rgb": [59, 49, 90] }, { "index": 0.25, "rgb": [64, 76, 139] }, { "index": 0.38, "rgb": [63, 110, 151] }, { "index": 0.5, "rgb": [72, 142, 158] }, { "index": 0.63, "rgb": [85, 174, 163] }, { "index": 0.75, "rgb": [120, 206, 163] }, { "index": 0.88, "rgb": [187, 230, 172] }, { "index": 1, "rgb": [253, 254, 204] }],
		"cdom": [{ "index": 0, "rgb": [47, 15, 62] }, { "index": 0.13, "rgb": [87, 23, 86] }, { "index": 0.25, "rgb": [130, 28, 99] }, { "index": 0.38, "rgb": [171, 41, 96] }, { "index": 0.5, "rgb": [206, 67, 86] }, { "index": 0.63, "rgb": [230, 106, 84] }, { "index": 0.75, "rgb": [242, 149, 103] }, { "index": 0.88, "rgb": [249, 193, 135] }, { "index": 1, "rgb": [254, 237, 176] }],
		"chlorophyll": [{ "index": 0, "rgb": [18, 36, 20] }, { "index": 0.13, "rgb": [25, 63, 41] }, { "index": 0.25, "rgb": [24, 91, 59] }, { "index": 0.38, "rgb": [13, 119, 72] }, { "index": 0.5, "rgb": [18, 148, 80] }, { "index": 0.63, "rgb": [80, 173, 89] }, { "index": 0.75, "rgb": [132, 196, 122] }, { "index": 0.88, "rgb": [175, 221, 162] }, { "index": 1, "rgb": [215, 249, 208] }],
		"density": [{ "index": 0, "rgb": [54, 14, 36] }, { "index": 0.13, "rgb": [89, 23, 80] }, { "index": 0.25, "rgb": [110, 45, 132] }, { "index": 0.38, "rgb": [120, 77, 178] }, { "index": 0.5, "rgb": [120, 113, 213] }, { "index": 0.63, "rgb": [115, 151, 228] }, { "index": 0.75, "rgb": [134, 185, 227] }, { "index": 0.88, "rgb": [177, 214, 227] }, { "index": 1, "rgb": [230, 241, 241] }],
		"freesurface-blue": [{ "index": 0, "rgb": [30, 4, 110] }, { "index": 0.13, "rgb": [47, 14, 176] }, { "index": 0.25, "rgb": [41, 45, 236] }, { "index": 0.38, "rgb": [25, 99, 212] }, { "index": 0.5, "rgb": [68, 131, 200] }, { "index": 0.63, "rgb": [114, 156, 197] }, { "index": 0.75, "rgb": [157, 181, 203] }, { "index": 0.88, "rgb": [200, 208, 216] }, { "index": 1, "rgb": [241, 237, 236] }],
		"freesurface-red": [{ "index": 0, "rgb": [60, 9, 18] }, { "index": 0.13, "rgb": [100, 17, 27] }, { "index": 0.25, "rgb": [142, 20, 29] }, { "index": 0.38, "rgb": [177, 43, 27] }, { "index": 0.5, "rgb": [192, 87, 63] }, { "index": 0.63, "rgb": [205, 125, 105] }, { "index": 0.75, "rgb": [216, 162, 148] }, { "index": 0.88, "rgb": [227, 199, 193] }, { "index": 1, "rgb": [241, 237, 236] }],
		"oxygen": [{ "index": 0, "rgb": [64, 5, 5] }, { "index": 0.13, "rgb": [106, 6, 15] }, { "index": 0.25, "rgb": [144, 26, 7] }, { "index": 0.38, "rgb": [168, 64, 3] }, { "index": 0.5, "rgb": [188, 100, 4] }, { "index": 0.63, "rgb": [206, 136, 11] }, { "index": 0.75, "rgb": [220, 174, 25] }, { "index": 0.88, "rgb": [231, 215, 44] }, { "index": 1, "rgb": [248, 254, 105] }],
		"par": [{ "index": 0, "rgb": [51, 20, 24] }, { "index": 0.13, "rgb": [90, 32, 35] }, { "index": 0.25, "rgb": [129, 44, 34] }, { "index": 0.38, "rgb": [159, 68, 25] }, { "index": 0.5, "rgb": [182, 99, 19] }, { "index": 0.63, "rgb": [199, 134, 22] }, { "index": 0.75, "rgb": [212, 171, 35] }, { "index": 0.88, "rgb": [221, 210, 54] }, { "index": 1, "rgb": [225, 253, 75] }],
		"phase": [{ "index": 0, "rgb": [145, 105, 18] }, { "index": 0.13, "rgb": [184, 71, 38] }, { "index": 0.25, "rgb": [186, 58, 115] }, { "index": 0.38, "rgb": [160, 71, 185] }, { "index": 0.5, "rgb": [110, 97, 218] }, { "index": 0.63, "rgb": [50, 123, 164] }, { "index": 0.75, "rgb": [31, 131, 110] }, { "index": 0.88, "rgb": [77, 129, 34] }, { "index": 1, "rgb": [145, 105, 18] }],
		"salinity": [{ "index": 0, "rgb": [42, 24, 108] }, { "index": 0.13, "rgb": [33, 50, 162] }, { "index": 0.25, "rgb": [15, 90, 145] }, { "index": 0.38, "rgb": [40, 118, 137] }, { "index": 0.5, "rgb": [59, 146, 135] }, { "index": 0.63, "rgb": [79, 175, 126] }, { "index": 0.75, "rgb": [120, 203, 104] }, { "index": 0.88, "rgb": [193, 221, 100] }, { "index": 1, "rgb": [253, 239, 154] }],
		"temperature": [{ "index": 0, "rgb": [4, 35, 51] }, { "index": 0.13, "rgb": [23, 51, 122] }, { "index": 0.25, "rgb": [85, 59, 157] }, { "index": 0.38, "rgb": [129, 79, 143] }, { "index": 0.5, "rgb": [175, 95, 130] }, { "index": 0.63, "rgb": [222, 112, 101] }, { "index": 0.75, "rgb": [249, 146, 66] }, { "index": 0.88, "rgb": [249, 196, 65] }, { "index": 1, "rgb": [232, 250, 91] }],
		"turbidity": [{ "index": 0, "rgb": [34, 31, 27] }, { "index": 0.13, "rgb": [65, 50, 41] }, { "index": 0.25, "rgb": [98, 69, 52] }, { "index": 0.38, "rgb": [131, 89, 57] }, { "index": 0.5, "rgb": [161, 112, 59] }, { "index": 0.63, "rgb": [185, 140, 66] }, { "index": 0.75, "rgb": [202, 174, 88] }, { "index": 0.88, "rgb": [216, 209, 126] }, { "index": 1, "rgb": [233, 246, 171] }],
		"velocity-blue": [{ "index": 0, "rgb": [17, 32, 64] }, { "index": 0.13, "rgb": [35, 52, 116] }, { "index": 0.25, "rgb": [29, 81, 156] }, { "index": 0.38, "rgb": [31, 113, 162] }, { "index": 0.5, "rgb": [50, 144, 169] }, { "index": 0.63, "rgb": [87, 173, 176] }, { "index": 0.75, "rgb": [149, 196, 189] }, { "index": 0.88, "rgb": [203, 221, 211] }, { "index": 1, "rgb": [254, 251, 230] }],
		"velocity-green": [{ "index": 0, "rgb": [23, 35, 19] }, { "index": 0.13, "rgb": [24, 64, 38] }, { "index": 0.25, "rgb": [11, 95, 45] }, { "index": 0.38, "rgb": [39, 123, 35] }, { "index": 0.5, "rgb": [95, 146, 12] }, { "index": 0.63, "rgb": [152, 165, 18] }, { "index": 0.75, "rgb": [201, 186, 69] }, { "index": 0.88, "rgb": [233, 216, 137] }, { "index": 1, "rgb": [255, 253, 205] }],
		"cubehelix": [{ "index": 0, "rgb": [0, 0, 0] }, { "index": 0.07, "rgb": [22, 5, 59] }, { "index": 0.13, "rgb": [60, 4, 105] }, { "index": 0.2, "rgb": [109, 1, 135] }, { "index": 0.27, "rgb": [161, 0, 147] }, { "index": 0.33, "rgb": [210, 2, 142] }, { "index": 0.4, "rgb": [251, 11, 123] }, { "index": 0.47, "rgb": [255, 29, 97] }, { "index": 0.53, "rgb": [255, 54, 69] }, { "index": 0.6, "rgb": [255, 85, 46] }, { "index": 0.67, "rgb": [255, 120, 34] }, { "index": 0.73, "rgb": [255, 157, 37] }, { "index": 0.8, "rgb": [241, 191, 57] }, { "index": 0.87, "rgb": [224, 220, 93] }, { "index": 0.93, "rgb": [218, 241, 142] }, { "index": 1, "rgb": [227, 253, 198] }]
	};
	var indicies, fromrgba, torgba, nsteps, cmap, colormap, format, nshades, colors, alpha, i;
	if (!spec) spec = {};
	nshades = (spec.nshades || 72) - 1;
	format = spec.format || 'hex';
	colormap = spec.colormap;
	if (!colormap) colormap = 'jet';
	if (typeof colormap === 'string') {
		colormap = colormap.toLowerCase();
		if (!Colormap[colormap]) {
			throw Error(colormap + ' not a supported colorscale');
		}
		cmap = Colormap[colormap];
	} else if (Array.isArray(colormap)) {
		cmap = colormap.slice();
	} else {
		throw Error('unsupported colormap option', colormap);
	}
	if (cmap.length > nshades + 1) {
		throw new Error(
			colormap + ' map requires nshades to be at least size ' + cmap.length
		);
	}
	if (!Array.isArray(spec.alpha)) {
		if (typeof spec.alpha === 'number') {
			alpha = [spec.alpha, spec.alpha];
		} else {
			alpha = [1, 1];
		}
	} else if (spec.alpha.length !== 2) {
		alpha = [1, 1];
	} else {
		alpha = spec.alpha.slice();
	}
	indicies = cmap.map(c => {
		return Math.round(c.index * nshades);
	});
	alpha[0] = Math.min(Math.max(alpha[0], 0), 1);
	alpha[1] = Math.min(Math.max(alpha[1], 0), 1);
	var steps = cmap.map((c, i) => {
		var index = cmap[i].index
		var rgba = cmap[i].rgb.slice();
		if (rgba.length === 4 && rgba[3] >= 0 && rgba[3] <= 1) {
			return rgba
		}
		rgba[3] = alpha[0] + (alpha[1] - alpha[0]) * index;
		return rgba
	})
	var colors = []
	for (i = 0; i < indicies.length - 1; ++i) {
		nsteps = indicies[i + 1] - indicies[i];
		fromrgba = steps[i];
		torgba = steps[i + 1];
		for (var j = 0; j < nsteps; j++) {
			var amt = j / nsteps
			colors.push([
				Math.round(lerp(fromrgba[0], torgba[0], amt)),
				Math.round(lerp(fromrgba[1], torgba[1], amt)),
				Math.round(lerp(fromrgba[2], torgba[2], amt)),
				lerp(fromrgba[3], torgba[3], amt)
			])
		}
	}
	colors.push(cmap[cmap.length - 1].rgb.concat(alpha[1]))
	if (format === 'hex') colors = colors.map(rgb2hex);
	else if (format === 'rgbaString') colors = colors.map(rgbaStr);
	else if (format === 'float') colors = colors.map(rgb2float);
	return colors;
}
function colorMellow(c, zero1 = .3, factorLum = .5) {
	hsl = colorHSL(c, true);
	let res = colorFromHue(hsl.h, zero1, hsl.l * factorLum);
	return res;
}
function colorMix(c1, c2, percent = 50) {
	return pSBC(percent / 100, colorHex(c1), colorHex(c2), true);
	let o1 = colorRGB(c1, true); let rgbA = [o1.r, o1.g, o1.b];
	let o2 = colorRGB(c2, true); let rgbB = [o2.r, o2.g, o2.b];
	amountToMix = percent / 100;
	var r = colorChannelMixer(rgbA[0], rgbB[0], amountToMix);
	var g = colorChannelMixer(rgbA[1], rgbB[1], amountToMix);
	var b = colorChannelMixer(rgbA[2], rgbB[2], amountToMix);
	return "rgb(" + r + "," + g + "," + b + ")";
}
function colorMixer(rgbA, rgbB, amountToMix) {
	var r = colorChannelMixer(rgbA[0], rgbB[0], amountToMix);
	var g = colorChannelMixer(rgbA[1], rgbB[1], amountToMix);
	var b = colorChannelMixer(rgbA[2], rgbB[2], amountToMix);
	return "rgb(" + r + "," + g + "," + b + ")";
}
function colorNameToHexString(str) {
	var ctx = document.createElement('canvas').getContext('2d');
	ctx.fillStyle = str;
	return ctx.fillStyle;
}
function colorNameToHslaString(str) {
	let hex = colorNameToHexString(str);
	let rgb = hexToRgb(hex);
	let hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
	let hsl = hsvToHsl(hsv.h, hsv.s, hsv.v);
	hsla = hslToHslaString(hsl.h, hsl.s, hsl.l, 1);
	return hsla;
}
function colorNameToRgb(str) {
	let hex = colorNameToHexString(str);
	let rgb = hexToRgb(hex);
	return rgb;
}
function colorPalBlend(c1, c2) {
	let res = [];
	for (let frac = 0.1; frac <= 0.9; frac += 0.1) {
		let c = pSBC(frac, c1, c2, true);
		res.push(c);
	}
	return res;
}
function colorPalette(color, type = 'shade') {
	color = colorFrom(color);
	return colorShades(color);
}
function colorPaletteFromImage(img) {
	if (nundef(ColorThiefObject)) ColorThiefObject = new ColorThief();
	let palette0 = ColorThiefObject.getPalette(img);
	let palette = [];
	for (const pal of palette0) {
		let color = colorFrom(pal);
		palette.push(color);
	}
	return palette;
}
function colorPaletteFromUrl(path) {
	let img = mCreateFrom(`<img src='${path}' />`);
	let pal = colorPaletteFromImage(img);
	return pal;
}
function colorPalSet(chStart, nHues = 2, { ch2, lum = 50, sat = 100, lumSatMode = 1, blendMode = 1, a } = {}) {
	let h1 = chStart;
	let h2 = ch2;
	if (!isNumber(chStart)) {
		let hsl = colorHSL(chStart);
		h1 = hsl.h;
		lum = hsl.l;
		sat = hsl.s;
	}
	if (ch2 !== undefined && !isNumber(ch2)) {
		h2 = colorHue(ch2);
	}
	let palettes = [];
	let hueDiff = Math.floor(360 / nHues);
	let pal;
	for (let i = 0; i < nHues; i++) {
		if (h2 !== undefined) {
			pal = colorPalette(h1, { ch2: h2, lum: lum, sat: sat, a: a });
		} else {
			pal = colorPalette(h1, { ch2: undefined, lum: lum, sat: sat, a: a });
		}
		palettes.push(pal);
		h1 += hueDiff;
	}
	return palettes;
}
function colorPalShade(color) {
	let res = [];
	for (let frac = -0.8; frac <= 0.8; frac += 0.2) {
		let c = pSBC(frac, color, undefined, true);
		res.push(c);
	}
	return res;
}
function colorPalShadeX(color, n) {
	let res = [];
	let step = 1.6 / (n - 1);
	for (let frac = -0.8; frac <= 0.8; frac += step) {
		let c = pSBC(frac, color, undefined, true);
		res.push(c);
	}
	return res;
}
function colorPrepper(val) {
	return `<span style="color:${ColorDict[val].c}">${ColorDict[val][G.language].toUpperCase()}</span>`;
}
function colorR(cAny) {
	let rgb = colorRGB(cAny, true);
	return rgb.r;
}
function colorRGB(cAny, asObject = false) {
	let res = colorFrom(cAny);
	let srgb = res;
	if (res[0] == '#') {
		srgb = pSBC(0, res, 'c');
	}
	let n = allNumbers(srgb);
	if (asObject) {
		return { r: n[0], g: n[1], b: n[2], a: n.length > 3 ? n[3] : 1 };
	} else {
		return srgb;
	}
}
function colorRGBArrToHSLObject(rgbArr) {
	var r1 = Number(rgbArr[0]) / 255,
		g1 = Number(rgbArr[1]) / 255,
		b1 = Number(rgbArr[2]) / 255;
	var maxColor = Math.max(r1, g1, b1),
		minColor = Math.min(r1, g1, b1);
	var L = (maxColor + minColor) / 2,
		s = 0,
		H = 0;
	if (maxColor != minColor) {
		if (L < 0.5) {
			s = (maxColor - minColor) / (maxColor + minColor);
		} else {
			s = (maxColor - minColor) / (2.0 - maxColor - minColor);
		}
		if (r1 == maxColor) {
			H = (g1 - b1) / (maxColor - minColor);
		} else if (g1 == maxColor) {
			H = 2.0 + (b1 - r1) / (maxColor - minColor);
		} else {
			H = 4.0 + (r1 - g1) / (maxColor - minColor);
		}
	}
	L = L * 100;
	s = s * 100;
	H = H * 60;
	if (H < 0) {
		H += 360;
	}
	return { h: H, s: s, l: L };
}
function colorRGBArrToString(r, g, b) {
	return 'rgb(' + r + ',' + g + ',' + b + ')';
}
function colorSat(cAny) {
	let hsl = colorHSL(cAny, true);
	return hsl.s;
}
function colorsFromBFA(bg, fg, alpha) {
	if (fg == 'contrast') {
		if (bg != 'inherit') bg = colorFrom(bg, alpha);
		fg = colorIdealText(bg);
	} else if (bg == 'contrast') {
		fg = colorFrom(fg);
		bg = colorIdealText(fg);
	} else {
		if (isdef(bg) && bg != 'inherit') bg = colorFrom(bg, alpha);
		if (isdef(fg) && fg != 'inherit') fg = colorFrom(fg);
	}
	return [bg, fg];
}
function colorShade(plusMinus1, color, log = true) {
	let c = colorFrom(color);
	return pSBC(plusMinus1, c, undefined, !log);
}
function colorShades(color) {
	let res = [];
	for (let frac = -0.8; frac <= 0.8; frac += 0.2) {
		let c = pSBC(frac, color, undefined, true);
		res.push(c);
	}
	return res;
}
function colorSystem() {
	simpleColors(randomColor());
}
function colorToFillStyle(c) {
	var ctx = document.createElement('canvas').getContext('2d');
	ctx.fillStyle = c;
	return ctx.fillStyle;
}
function colorTrans(cAny, alpha = 0.5) {
	return colorFrom(cAny, alpha);
}
function colorTransPalette(color = '#000000') {
	let res = [];
	for (const alpha of [.0, .1, .2, .3, .4, .5, .6, .7, .8, .9, 1]) res.push(colorTrans(color, alpha));
	return res;
}
function colorWheel(contrastTo, n) {
	let hc = colorHue(contrastTo);
	let wheel = [];
	let start = hc;
	let inc = Math.round(360 / (n + 1));
	start += inc;
	for (let i = 0; i < n; i++) {
		wheel.push(start % 360);
		start += inc;
	}
	return wheel.map(x => colorHSLBuild(x));
}
function combine(combiner, f, g) {
	if (typeof f != 'function') f = x => f;
	if (typeof g != 'function') g = x => g;
	return combiner(f, g);
}
function comp_(...arr) {
	return arr.join('_');
}
function comp_1(id) {
	return stringBefore(id, '_');
}
function comp_2(id) {
	return stringBefore(stringAfter(id, '_'), '_');
}
function comp_last(id) {
	return stringAfterLast(id, '_');
}
function compactObjectString(o) {
	let s = '';
	for (const k in o) {
		if (isSimple(o[k]) && !isComplexColor(o[k])) {
			if (isDict(o[k])) { error('!!!!!!!!!!!!!!!!isDict', o[k]); }
			s += k + ':' + o[k] + ' ';
		}
	}
	return s;
}
function compare(expected, actual) {
	let array1 = expected.slice()
	let array2 = actual.slice()
	return array1.length === array2.length && array1.sort().every(function (value, index) { return value === array2.sort()[index] });
}
function complete_cell(board, r, c) {
	let used = [...get_row(board, r), ...get_column(board, c), ...get_square(board, square_coordinates[r][c])]
	let possibilities = []
	for (let p = 1; p <= 9; p++) {
		if (!used.includes(p)) {
			possibilities.push(p)
		}
	}
	if (possibilities.length == 1) {
		board[r][c] = possibilities[0]
		return true
	} else {
		board[r][c] = possibilities
		return false
	}
}
function completelyRemoveServerObjectFromRsg(oid, R) {
	aushaengen(oid, R);
	R.deleteObject(oid);
}
function complexCompare(obj1, obj2) {
	const obj1Keys = Object.keys(obj1);
	const obj2Keys = Object.keys(obj2);
	if (obj1Keys.length !== obj2Keys.length) {
		return false;
	}
	for (let objKey of obj1Keys) {
		if (obj1[objKey] !== obj2[objKey]) {
			if (typeof obj1[objKey] == "object" && typeof obj2[objKey] == "object") {
				if (!isEqual(obj1[objKey], obj2[objKey])) {
					return false;
				}
			}
			else {
				return false;
			}
		}
	}
	return true;
}
function complus(...arr) {
	return arr.join('+');
}
function complus1(id) {
	return stringBefore(id, '+');
}
function complus2(id) {
	return stringBefore(stringAfter(id, '+'), '+');
}
function compluslast(id) {
	return stringAfterLast(id, '+');
}
function component(width, height, color, x, y, type) {
	this.type = type;
	this.score = 0;
	this.width = width;
	this.height = height;
	this.speedX = 0;
	this.speedY = 0;
	this.x = x;
	this.y = y;
	this.gravity = 0;
	this.gravitySpeed = 0;
	this.draw = function () {
		ctx = myGameArea.context;
		if (this.type == 'text') {
			ctx.font = this.width + ' ' + this.height;
			ctx.fillStyle = color;
			ctx.fillText(this.text, this.x, this.y);
		} else {
			ctx.fillStyle = color;
			ctx.fillRect(this.x, this.y, this.width, this.height);
		}
	};
	this.newPos = function () {
		this.gravitySpeed += this.gravity;
		this.x += this.speedX;
		this.y += this.speedY + this.gravitySpeed;
		this.hitBottom();
	};
	this.hitBottom = function () {
		var rockbottom = myGameArea.canvas.height - this.height;
		if (this.y > rockbottom) {
			this.y = rockbottom;
			this.gravitySpeed = 0;
		}
	};
	this.crashWith = function (otherobj) {
		var myleft = this.x;
		var myright = this.x + this.width;
		var mytop = this.y;
		var mybottom = this.y + this.height;
		var otherleft = otherobj.x;
		var otherright = otherobj.x + otherobj.width;
		var othertop = otherobj.y;
		var otherbottom = otherobj.y + otherobj.height;
		var crash = true;
		if (mybottom < othertop || mytop > otherbottom || myright < otherleft || myleft > otherright) {
			crash = false;
		}
		return crash;
	};
}
function compose(itop, ichild, x, y) {
	mPosAbs()
}
function composeFleetingMessage() {
	let lst = inputs;
	let msg = lst.map(x => x.letter).join(',');
	let edecl = lst.length > 1 ? 's ' : ' ';
	let ddecl = lst.length > 1 ? 'den' : 'die';
	let s = (currentLanguage == 'E' ? 'Type the letter' + edecl : 'Tippe ' + ddecl + ' Buchstaben ');
	return s + msg;
}
function compute_elo_ranking(players, game) {
	players = sortBy(players, 'score');
	let buckets = {};
	for (const pl of players) {
		let sc = pl.score;
		if (nundef(buckets[sc])) buckets[sc] = [];
		buckets[sc].push(pl.name);
	}
	let nBuckets = get_keys(buckets).length;
	let elopart = 2 / (nBuckets - 1);
	let val = -1;
	for (const b in buckets) {
		for (const name of buckets[b]) {
			let elo = get_elo(name, game);
			set_elo(name, game, elo + val);
			console.log('user', name, 'with score', b, 'gets', val, 'added to elo!');
		}
		val += elopart;
	}
}
function compute_hidden(plname) {
	let [fen, uplayer] = [Z.fen, Z.uplayer];
	let pl = fen.players[plname];
	let hidden;
	if (isdef(fen.winners)) hidden = false;
	else if (Z.role == 'spectator') hidden = plname != uplayer;
	else if (Z.mode == 'hotseat') hidden = (pl.playmode == 'bot' || plname != uplayer);
	else hidden = plname != Z.uname;
	return hidden;
}
function computeClosure(symlist) {
	let keys = {};
	for (const k in CODE.di) { for (const k1 in CODE.di[k]) keys[k1] = CODE.di[k][k1]; }
	CODE.all = keys;
	CODE.keylist = Object.keys(keys)
	let inter = intersection(Object.keys(keys), Object.keys(window));
	let done = {};
	let tbd = valf(symlist, ['_start']);
	let MAX = 1007, i = 0;
	let alltext = '';
	while (!isEmpty(tbd)) {
		if (++i > MAX) break;
		let sym = tbd[0];
		let o = CODE.all[sym];
		if (nundef(o)) o = getObjectFromWindow(sym);
		if (o.type == 'var' && !o.name.startsWith('d') && o.name == o.name.toLowerCase()) { tbd.shift(); continue; }
		if (o.type != 'func') { tbd.shift(); lookupSet(done, [o.type, sym], o); continue; }
		let olive = window[sym];
		if (nundef(olive)) { tbd.shift(); lookupSet(done, [o.type, sym], o); continue; }
		let text = olive.toString();
		if (!isEmpty(text)) alltext += text + '\r\n';
		let words = toWords(text, true);
		words = words.filter(x => text.includes(' ' + x));
		for (const w of words) {
			if (nundef(done[w]) && w != sym && isdef(CODE.all[w])) addIf(tbd, w);
		}
		tbd.shift();
		lookupSet(done, [o.type, sym], o);
	}
	let tres = '';
	for (const k of ['const', 'var', 'cla', 'func']) {
		console.log('done', k, done[k])
		let o = done[k]; if (nundef(o)) continue;
		let klist = get_keys(o);
		if (k == 'func') klist = sortCaseInsensitive(klist);
		for (const k1 of klist) {
			let code = CODE.justcode[k1];
			if (!isEmptyOrWhiteSpace(code)) tres += code + '\r\n';
		}
	}
}
function computeColor(c) { return (c == 'random') ? randomColor() : c; }
function computeColorX(c) {
	let res = c;
	if (isList(c)) return chooseRandom(c);
	else if (isString(c) && startsWith(c, 'rand')) {
		res = randomColor();
		let spec = c.substring(4);
		if (isdef(window['color' + spec])) {
			console.log('YES!');
			res = window['color' + spec](res);
		}
	}
	return res;
}
function computePresentedKeys(o, isTableObject) {
	let optin = isTableObject ? S.settings.table.optin : S.settings.player.optin;
	if (optin) return intersection(Object.keys(o), optin);
	let optout;
	if (S.settings.useExtendedOptout) {
		let keys = [];
		optout = S.settings.extendedOptout;
		for (const k in o) { if (optout[k]) continue; keys.push(k); }
		return keys;
	}
	optout = isTableObject ? S.settings.table.optout : S.settings.player.optout;
	for (const k in o) { if (optout[k]) continue; keys.push(k); }
	return keys;
}
function consExpand(o, keys, indent = 0) {
	console.log('.'.repeat(indent), o);
	for (const k in o) {
		if (!keys.includes(k)) continue;
		let oNew = o[k];
		console.log('.'.repeat(indent), k + ':')
		if (isList(oNew)) {
			for (const el of oNew) {
				consExpand(el, keys, indent + 2);
			}
		} else if (isDict(oNew)) {
			consExpand(oNew, keys, indent + 2);
		}
	}
}
function consout() {
	if (isTraceOn) console.log(...arguments);
}
function consOutput() { console.log(...arguments); }
function consoutt() {
	if (isTraceOn) console.log(...arguments, getFunctionsNameThatCalledThisFunction());
}
function contacts_2handleResult(result) {
	let d = mBy('dContacts');
	mCenterCenterFlex(d);
	d.innerHTML = JSON.parse(result).message;
}
function containedInAny(el, ll) {
	for (const lst of ll) {
		if (lst.includes(el)) return true;
	}
	return false;
}
function contains(s, sSub) { return s.toLowerCase().includes(sSub.toLowerCase()); }
function containsAll(arr, lst) {
	for (const el of lst) {
		if (!arr.includes(el)) return false;
	}
	return true;
}
function containsAny(arr, lst) {
	for (const x of lst) {
		if (arr.includes(x)) {
			return true;
		}
	}
	return false;
}
function containsColorWord(s) {
	let colors = ['old', 'blond', 'red', 'blue', 'green', 'purple', 'black', 'brown', 'white', 'grey', 'gray', 'yellow', 'orange'];
	for (const c of colors) {
		if (s.toLowerCase().includes(c)) return false;
	}
	return true;
}
function containsSet(arr, lst) {
	return containsAll(arr, lst);
}
function contentHallo(n, r) { return isdef(n.children) ? null : n.uid == '_2' ? 'HALLO' : 'WELT'; }
function contentNoParentContent(x, R) {
	if (nundef(x.children)) return x.uid; else return null;
}
function contentNoParentContentRootExtralong(x, R) {
	if (nundef(x.children)) return x.uid;
	else if (x.uid == R.tree.uid) return 'hallo das ist ein super super super langer string let it go - unclutch!';
	else return null;
}
function contentNoRootContent(x, R) {
	if (x.uid == R.tree.uid) return null; else return x.uid;
}
function contentRootExtralong(x, R) {
	if (x.uid == R.tree.uid) return 'hallo das ist ein besonders langer string!!!';
	else return x.uid;
}
function contentToElement(cont, styles, keepInLine = true) {
	let elem = cont;
	if (isString(cont)) {
		if (cont[0] === '<') {
			elem = createElementFromHtml(cont);
		} else {
			elem = mText(elem);
		}
	}
	if (keepInLine) styles['white-space'] = 'nowrap';
	mStyleX(elem, styles);
	return elem;
}
function continue_after_error() {
	dError.innerHTML = ''; if (isdef(DA.callback)) { DA.callback(); delete (DA.callback); }
}
function continue_game_ending_process() {
	let game = Session.cur_game;
	let winners = Session.winners;
	if (nundef(Session.cur_table.scoring_complete)) {
		console.log('scoring...')
		decrease_handicap_if_winstreak(winners, game);
		Session.cur_table.scoring_complete = true;
	}
	to_server({ tid: Session.cur_tid, uname: Session.cur_user }, 'seen');
}
function convert_from_row(row) {
	for (const k in row) {
		let val = row[k];
		if (isNumber(val)) row[k] = Number(val);
		if (isString(val) && val[0] == '{') { row[k] = JSON.parse(val); }
		if (val == 'null') row[k] = null;
		if (k == 'players' && isString(row[k])) row[k] = val.split(',');
	}
}
function convert_from_server(obj) {
	if (isdef(obj.table)) convert_from_row(obj.table);
	if (isdef(obj.playerdata)) {
		for (const row of obj.playerdata) {
			convert_from_row(row);
		}
	}
	if (isdef(obj.moves)) {
		for (const row of obj.moves) {
			convert_from_row(row);
		}
	}
}
function convert_to_range(x, min1, max1, min2, max2) {
	return (x - min1) * ((max2 - min2) / (max1 - min1)) + min2;
}
function convertGermanUhrzeitToNumbers(w) {
	console.log('...', w)
	let parts = multiSplit(w, ' :');
	console.log('...parts', parts)
	let res = [];
	for (const p of parts) {
		let p1 = p.trim().toLowerCase();
		if (isNumber(p1)) res.push(Number(p1));
		else if (isdef(germanNumbers[p1])) res.push(germanNumbers[p1]);
	}
	return res;
}
function convertTimesAndNumbersToWords(w) {
	if (w.includes(':')) {
		let h = stringBefore(w, ':');
		let m = stringAfter(w, ':');
		let hn = Number(h);
		let mn = Number(m);
		let xlist = allIntegers(w);
		if (xlist.length == 2) {
			if (xlist[1] == 0) xlist = [xlist[0]];
			xlist = xlist.map(n => n.toString());
			let res1 = xlist.join('');
			w = res1;
		}
	}
	if (isNumber(w)) {
		let res = toWordsSpeechS(w);
		return res;
	}
	return w;
}
function convertTimeStringToNumbers(ts) {
	return allIntegers(ts);
}
function convertToColor(x) {
	let res = SPEC.color[x];
	if (!res) {
		res = SPEC.color[x] = randomColor();
	}
	return res;
}
function convertToGraphElements(g1, house) {
	let vertices = house.rooms.map(x => Items[x]);
	let doors = [];
	for (const v of vertices) {
		v.center = getCenter(v.rect);
		v.center.x += v.rect.l - house.rect.l;
		v.center.y += v.rect.t - house.rect.t;
		g1.addNode(v, v.center);
		doors = union(doors, v.doors);
	}
	let centers = g1.getNodes().map(x => x.data('center'));
	g1.storePositions('prest', centers);
	let edges = doors.map(x => Items[x]).filter(x => x.rooms.length == 2);
	for (const e of edges) {
		if (e.rooms.length < 2) continue;
		e.source = e.rooms[0];
		e.target = e.rooms[1];
		g1.addEdge(e.source, e.target, e);
	}
}
function convertToGraphElements_dep(g1, house) {
	let elements = { nodes: [], edges: [] };
	let vertices = house.rooms.map(x => Items[x]);
	let doors = [];
	for (const v of vertices) {
		v.center = getCenter(v.rect);
		elements.nodes.push({ data: v, position: v.center });
		doors = union(doors, v.doors);
	}
	let edges = doors.map(x => Items[x]).filter(x => x.rooms.length == 2);
	for (const e of edges) {
		if (e.rooms.length < 2) continue;
		e.source = e.rooms[0];
		e.target = e.rooms[1];
		elements.edges.push({ data: e });
	}
	return elements;
}
function convertToLabel(x) {
	let res = lookup(SPEC, ['label', x]);
	return res ? res : x;
}
function convertToList(x) {
	if (isList(x)) return x;
	if (isString(x) && x != '') return [x];
	return [];
}
function convertToMS(p) {
	let res = undefined;
	if (isMS(p)) {
		res = p;
	} else if (isEvent(p)) {
		p = p.target;
		res = findParentWithId(p);
		res = MS.byId[res.id];
	} else if (isString(p)) {
		res = MS.byId[p];
	} else {
	}
	return res;
}
function convertToRgba(cAny, alpha = 1) {
	let a = alpha >= 0 && alpha <= 1 ? alpha : alpha / 100;
	testHelpers('type is', typeof cAny);
	if (isString(cAny)) {
		testHelpers('convertToRgba is a String', cAny);
		if (cAny[0] == '#') {
			let rgbObj = hexToRgb(cAny);
			return `rgba(${rgbObj.r},${rgbObj.g},${rgbObj.b},${a})`;
		} else if (startsWith(cAny, 'hsl') || startsWith(cAny, 'rgb')) {
			testHelpers('hsla or rgba color!', cAny);
			return cAny;
		} else if (cAny == 'transparent') {
			return cAny;
		} else {
			testHelpers('should be a color name!!!', cAny);
			let rgbObj = colorNameToRgb(cAny);
			return `rgba(${rgbObj.r},${rgbObj.g},${rgbObj.b},${a})`;
		}
	} else if (Array.isArray(cAny)) {
		if (cAny.length == 3) {
			let r = cAny[0];
			let g = cAny[1];
			let b = cAny[2];
			return `rgba(${r},${g},${b},${a})`;
		} else {
			testHelpers('convertToRgba: ERROR! NOT A COLOR:', cAny);
			return randomColor(100, 70, a);
		}
	}
}
function convertUmlaute(w) {
	w = replaceAll(w, 'ue', 'ü');
	w = replaceAll(w, 'ae', 'ä');
	w = replaceAll(w, 'oe', 'ö');
	w = replaceAll(w, 'UE', 'Ü');
	w = replaceAll(w, 'AE', 'Ä');
	w = replaceAll(w, 'OE', 'Ö');
	w = replaceAll(w, 'ß', 'ss');
	return w;
}
function copyKeys(ofrom, oto, except = {}, only = null) {
	let keys = isdef(only) ? only : Object.keys(ofrom);
	for (const k of keys) {
		if (isdef(except[k])) continue;
		oto[k] = ofrom[k];
	}
	return oto;
}
function copyLinesFromTo(lines, iStart, iEnd, trimStart, trimEnd) {
	let block = isdef(trimStart) ? stringAfter(lines[iStart], '/*') : lines[iStart];
	iStart += 1;
	while (iStart < iEnd) {
		block += '\n' + lines[iStart];
		iStart += 1;
	}
	if (isdef(trimEnd)) block = stringBefore(block, '*/');
	return block.trim();
}
function copySimpleProps(ofrom, oto = {}) { for (const k in ofrom) { if (isLiteral(k)) oto[k] = ofrom[k]; } return oto; }
function correct_handsorting(hand, plname) {
	let pl = Z.fen.players[plname];
	let [cs, pls, locs] = [Clientdata.handsorting, pl.handsorting, localStorage.getItem('handsorting')];
	let s = cs ?? pls ?? locs ?? Config.games[Z.game].defaulthandsorting;
	hand = sort_cards(hand, s == 'suit', 'CDSH', true, Z.func.rankstr);
	return hand;
}
function correctBlanks() {
	let wrong = getWrongWords();
	if (nundef(TOList)) TOList = {};
	Selected.feedbackUI = wrong.map(x => iDiv(x));
	failPictureGoal();
	let t1 = setTimeout(removeMarkers, 1000);
	let t2 = setTimeout(() => wrong.map(x => { correctWordInput(x); animate(iDiv(x), 'komisch', 1300); }), 1000);
	TOList.correction = [t1, t2];
	return 2500;
}
function correctFuncName(specType) {
	switch (specType) {
		case 'list': specType = 'liste'; break;
		case 'dict': specType = 'dicti'; break;
		case undefined: specType = 'panel'; break;
	}
	return specType;
}
function correctNumbersInString(s, dec) {
	let parts = s.split('_');
	for (let i = 0; i < parts.length; i++) {
		let p = parts[i];
		if (isNumber(p)) {
			let n = Number(p);
			n -= dec;
			parts[i] = '' + n;
		}
	}
	let res = parts.join('_');
	return res;
}
function correctPolys(polys, approx = 10) {
	let clusters = [];
	for (const p of polys) {
		for (const pt of p) {
			let found = false;
			for (const cl of clusters) {
				for (const v of cl) {
					let dx = Math.abs(v.x - pt.x);
					let dy = Math.abs(v.y - pt.y);
					if (dx < approx && dy < approx) {
						cl.push(pt);
						found = true;
						break;
					}
				}
				if (found) break;
			}
			if (!found) {
				clusters.push([pt]);
			}
		}
	}
	let vertices = [];
	for (const cl of clusters) {
		let sumx = 0;
		let sumy = 0;
		let len = cl.length;
		for (const pt of cl) {
			sumx += pt.x;
			sumy += pt.y;
		}
		vertices.push({ x: Math.round(sumx / len), y: Math.round(sumy / len) });
	}
	for (const p of polys) {
		for (const pt of p) {
			let found = false;
			for (const v of vertices) {
				let dx = Math.abs(v.x - pt.x);
				let dy = Math.abs(v.y - pt.y);
				if (dx < approx && dy < approx) {
					if (dx != 0 || dy != 0) {
						pt.x = v.x;
						pt.y = v.y;
					}
					found = true;
				}
				if (found) break;
			}
			if (!found) {
				error('point not found in vertices!!! ' + pt.x + ' ' + pt.y);
			}
		}
	}
	return vertices;
}
function correctWordInput(winp) { winp.charInputs.map(x => refillCharInput(x, x.letter)); }
function countAll(s, scount) {
	let letters = toLetters(scount);
	function counter(total, ch) { if (letters.includes(ch)) return total + 1; else return total; }
	let res = [...s].reduce(counter, 0);
	return res;
}
function countIndent(s, ntab = 2) {
	let i = 0;
	let inc;
	while (!isEmpty(s)) {
		if (startsWith(s, '\t')) { i += ntab; inc = ntab; }
		else if (s[0] == ' ') { i += 1; inc = 1; }
		else break;
		s = s.slice(1);
	}
	return i;
}
function countLetters(s, letter) {
	let n = 0;
	for (const ch of s) {
		if (ch == letter) n++;
	}
	return n;
}
function cPortrait(dParent, styles = {}, id) {
	if (nundef(styles.h)) styles.h = Card.sz;
	if (nundef(styles.w)) styles.w = styles.h * .7;
	return cBlank(dParent, styles, id);
}
function create_agent(where, o = {}) {
	let res;
	if (is_map(where)) {
		res = L.marker(valf(o.center, where.options.center)).addTo(where);
	} else {
		res = mDiv(where, o);
	}
	return res;
}
function create_ai_move(data) {
	let newscore = Math.min(Session.winning_score, data.score + 1);
	console.log('AI score is', newscore);
	let newstate = data.state;
	let newdata = {
		tid: data.tid,
		player_status: newscore >= Session.winning_score ? 'done' : 'joined',
		score: newscore,
		state: newstate,
		uname: data.uname
	};
	return newdata;
}
function create_bluff_input1(dParent, arr, units = 1, sz, index) {
	let d = mDiv(dParent, { gap: 5, w: units * sz * 1.35 }); mCenterFlex(d);
	for (const a of arr) {
		let da = mDiv(d, { align: 'center', wmin: 20, padding: 4, cursor: 'pointer', rounding: 4, bg: units == 1 ? '#e4914b' : 'sienna', fg: 'contrast' }, null, a == 'T' ? '10' : a);
		da.onclick = () => input_to_anzeige1(a, index);
	}
	return d;
}
function create_branch(b, angle, len, color) {
	let root = C.root;
	let x = b.p2.x + Math.cos(angle) * len;
	let y = b.p2.y - Math.sin(angle) * len;
	let age = b.age + 1;
	let o = {
		done: false,
		p1: b.p2,
		p2: { x: x, y: y },
		x: x,
		y: y,
		t: 'branch',
		age: age,
		angle: angle,
		len: len,
		thickness: b.thickness * root.dthickness,
		color: color,
	};
	b.done = true;
	return o;
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
function create_div(where, o = {}) {
	let res;
	if (is_map(where)) {
		let icon = L.divIcon({ className: 'my-div-icon' });
		var greenIcon = L.icon({
			iconUrl: 'leaf-green.png',
			shadowUrl: 'leaf-shadow.png',
			iconSize: [38, 95],
			shadowSize: [50, 64],
			iconAnchor: [22, 94],
			shadowAnchor: [4, 62],
			popupAnchor: [-3, -76]
		});
		res = L.marker(o.center, { icon: greenIcon }).addTo(map);
	} else {
		res = mDiv(where, o);
	}
	return res;
}
function create_div_marker(map, html, center, sz, offset) {
	let res = L.marker(center, { icon: L.divIcon({ iconAnchor: offset, className: `custom-div-icon ${sz}`, html: html }) }).addTo(map);
	return res;
}
function create_fa(map, key, center, styles = {}) {
	addKeys({ fz: 30 }, styles);
	let d = mCreate('i');
	mStyle(d, styles);
	mClass(d, `fa fa-${key}`);
	let dp = mCreate('div');
	mAppend(dp, d);
	let html = dp.innerHTML;
	let offset = [styles.fz / 2, styles.fz / 3];
	let className = `custom-div-icon`;
	let res = L.marker(center, { icon: L.divIcon({ iconAnchor: offset, className: className, html: html }) }).addTo(map);
	return res;
}
function create_fen_deck(cardtype, num_decks = 1, num_jokers = 0) {
	let arr = get_keys(C52Cards).map(x => x + cardtype);
	let newarr = [];
	while (num_decks > 0) { newarr = newarr.concat(arr); num_decks--; }
	while (num_jokers > 0) { newarr.push('*H' + cardtype); num_jokers--; }
	return newarr;
}
function create_flower() {
}
function create_leaf(b, root) {
	let o = {
		done: true,
		p: b.p2,
		x: b.p2.x,
		y: b.p2.y,
		t: 'leaf',
		age: b.age + 1,
		len: b.len * root.dlen,
		angle: b.angle,
		thickness: 20,
		color: 'lawngreen',
	};
	b.done = true;
	return o;
}
function create_map(o = {}) {
	addKeys({ maxBounds: [[-89.98155760646617, -180], [89.99346179538875, 180]], key: 'osm', center: Geo.places.tuerkenschanzpark, zoom: 17, id: 'map' }, o);
	let info = Geo.layerInfo[o.key];
	o.layers = [isdef(info) ? L.tileLayer(info.url, info.options) : L.tileLayer('')];
	let map = L.map(o.id, o);
	return map;
}
function create_marker(text) {
	let d = mCreate('div');
	d.innerHTML = text;
	mStyle(d, { position: 'fixed', fz: 50 });
	document.body.appendChild(d);
	Markers.push(d);
	return d;
}
function create_menu(dParent, dir = 'h') {
	let d;
	if (dir == 'h') {
		d = dMenu = mDiv(dParent, { w: '100%', display: 'flex' });
	} else {
		d = dMenu = mDiv(dParent, { padding: 10, gap: 10, h: '100%', display: 'flex', dir: dir });
	}
	mToolbar(['grow', 'clear'], handle_command, d, {}, { vmargin: 5 });
	mTogglebar({ jitter: false }, flag_toggle, { bg: 'lightgreen' }, { bg: '#eee' }, d);
	mLinebreak(dTable, 10);
}
function create_new_table(user, game) {
	user = valf(user, Session.cur_user);
	game = valf(game, Session.cur_game);
	let opt = extract_game_options();
	let t = {};
	t.friendly = generate_friendly_table_name();
	t.game = Session.cur_game;
	t.host = user;
	t.players = opt.players;
	t.fen = GSpotitMulti.start_fen(t.players);
	t.status = 'created';
	t.player_init = '';
	DA.next = get_games;
	to_server(t, 'create_table');
}
function create_new_table_and_join_all(user, game) {
	Session.cut_tid = Session.cur_table = null;
	let t = {};
	t.friendly = generate_friendly_table_name();
	t.game = 'gSpotit';
	t.host = Session.cur_user;
	t.players = valf(lookup(Session, ['game_options', 'players']), get_def_players_for_user(Session.cur_user));
	t.fen = 'noneed';
	t.options = valf(lookup(Session, ['game_options', 'game']), {});
	t.status = 'started';
	t.host_status = 'joined';
	t.player_status = 'joined';
	t.player_init = {};
	to_server(t, 'create_table_and_start');
}
function create_nodes(r, pad, dmin) {
	let [xstart, ystart, w, h] = [r.x + pad, r.y + pad, r.w, r.h];
	let [x, y] = [xstart, ystart];
	let items = []; let [rows, cols, row, col] = [0, 0, 0, 0];
	while (y < h - dmin) {
		while (x < w - dmin) {
			let item = { w: 5, h: 5, iy: row, ix: col, bg: 'blue', position: 'absolute', x: x, y: y };
			x += dmin;
			items.push(item);
			cols++; col++;
		}
		rows++; row++; col = 0;
		x = xstart;
		y += dmin;
	}
	return items;
}
async function create_pic_dict(l, syms) {
	let edict = await route_path_text(`../base/assets/words/${l}dict.txt`);
	console.log('dict', edict);
	let lang = l.toUpperCase();
	let words = l == 'e' ? edict.split('\r\n') : edict.split('\n');
	console.log('words', words);
	console.log('syms', syms);
	let wdi = {};
	for (const w of words) {
		let w1 = w.trim().toLowerCase();
		if (isEmpty(w1)) continue;
		wdi[w1] = true;
	}
	let slist = [];
	for (const skey in syms) {
		let e = syms[skey][lang];
		if (nundef(e)) continue;
		e = e.trim().toLowerCase();
		slist.push({ key: skey, w: e });
	}
	slist_sorted = sortBy(slist, 'w');
	console.log('slist sorted', slist_sorted);
	console.log(wdi);
	let edi = {};
	for (const o of slist_sorted) {
		let [e, skey] = [o.w, o.key];
		if (e in wdi) edi[e] = skey;
		else console.log('word', e, 'from syms not in dict!!!');
	}
	console.log('result', edi, Object.keys(edi).length);
	return edi;
	return;
	for (const skey in syms) {
		let e = syms[skey][lang];
		if (nundef(e)) continue;
		e = e.trim().toLowerCase();
		console.assert(isdef(e) && e == e.toLowerCase(), 'word in syms not lowercasse:' + e);
		if (e in wdi) edi[e] = skey;
		else console.log('word', e, 'from syms not in dict!!!');
	}
	console.log('result', edi, Object.keys(edi).length);
	return edi;
}
async function create_pic_dicts(list = ['e', 'd', 'f', 's']) {
	let syms = await route_path_yaml_dict('../base/assets/allSyms.yaml');
	for (const l of list) {
		let di = await create_pic_dict(l, syms);
		downloadAsYaml(di, l + 'picdict');
	}
	loader_off();
}
function create_random_players(n = 1) {
	let colors = rWheel(n);
	let res = [{ name: 'mimi', playmode: 'human', color: colors[0] }];
	let names = rChoose(MyNames, n - 1);
	if (!isList(names)) names = [names];
	for (let i = 1; i < n; i++) {
		let pl = { name: names[i - 1], playmode: 'bot', color: colors[i], strategy: 'random' };
		res.push(pl);
	}
	return res;
}
function create_score_table() {
	let t = Session.cur_table;
	let fen = t.fen;
	let dParent = mBy('dIntro');
	let d = mDiv(dParent, { margin: 'auto', w: 300, bg: 'red' });
	html = `<div style='text-align:center;margin-top:200px'>
		<table id='customers'><tr><th>player</th><th>score</th></tr>
		`;
	let plparts = fen.split(',');
	for (const pl of plparts) {
		html += `<tr><td>${stringBefore(pl, ':')}</td><td>${stringAfter(pl, ':')}</td></tr>`
	}
	html += '</table></div>';
	d.innerHTML = html;
}
function create_set_card(fen, dParent, card_styles) {
	let myinfo = info_from_fen(fen);
	let info = { shape: 'circle', color: BLUE, num: 1, shading: 'solid', background: 'white', text: 'none' };
	copyKeys(myinfo, info);
	let card = draw_set_card(dParent, info, card_styles);
	card.fen = fen;
	return card;
}
function create_sym(map, key, center, sz, styles) {
	let d1 = mSym(key, null, styles);
	let html = d1.innerHTML;
	let [xoff, yoff] = sz == 'large' ? [136, 150] : sz == 'medium' ? [36, 40] : [16, 18];
	let offset = [xoff, yoff];
	return create_div_marker(map, html, center, sz, offset);
}
function create_table(options, players) {
	Session.cur_tid = Session.cur_table = Selected = null;
	let gname = Session.cur_game;
	let t = {};
	t.friendly = generate_friendly_table_name();
	t.game = Session.cur_game;
	t.host = Session.cur_user;
	t.turn = 'none';
	t.players = valf(players, valf(lookup(Session, ['game_options', 'players']), get_def_players_for_user(Session.cur_user)));
	t.options = valf(options, lookup(Session, ['game_options', 'game']));
	t.pl_options = get_player_options(t.players, gname);
	t.status = 'started';
	t.host_status = 'joined';
	t.player_status = 'joined';
	t.player_init = DB.games[gname].game_type == 'turn' ? null : {};
	if (gname == 'gPreinno') { t.fen = inno_setup(t.players); }
	else if (gname == 'gAristo') { t.fen = ari_setup(t.players); }
	return t;
}
function create_toolbar(map) {
	let d = map._controlContainer;
	console.log('control container', d);
	dMap = mDiv(d, { position: 'absolute', top: 0, left: 50, w: '100%', h: '100%' });
	dMap.style.zIndex = 12000;
	let toolbar = mDiv(dMap, { hmargin: 10, padding: 10, cursor: 'pointer' }, null, null, 'top'); mFlexWrap(toolbar);
	return toolbar;
}
function createAccountContent(userdata) {
	DA.imageChanged = DA.colorChanged = false;
	return `
		<div id="dAccount" style="max-width=500px; margin-top:10px; display:flex; animation: appear1 1s ease;justify-content:center; align-content:center">
				<div id="error">some text</div>
				<div style='text-align:center'>
						<form id="myform" autocomplete="off" style='text-align:center;background:${userdata.color}'>
								<span id='img_dd_instruction' style="font-size:11px;">drag and drop an image to change</span><br>
								<img id="imgPreview" onload='addColorPicker("${userdata.color}");' src='${get_image_path(userdata)}' ondragover="handle_drag_and_drop(event)" ondrop="handle_drag_and_drop(event)" ondragleave="handle_drag_and_drop(event)"
										style="height:200px;margin:10px;" />
								<input id='iUsername' type="text" name="motto" placeholder='motto' value="${userdata.motto}" autofocus
										onkeydown="if (event.keyCode === 13){event.preventDefault();collect_data(event);}" />
								<br />
								<input id='save_settings_button' type="button" value="Submit" onclick="collect_data(event)" ><br>
						</form>
		</div></div>
		`;
}
function createAccountContent1(userdata) {
	var d = mBy("inner_left_panel");
	clearElement(d);
	let d1 = mDiv(d, { w: '100%', matop: 10, animation: 'rotateIntoView 1s ease' });
	mCenterFlex(d1);
	let d2 = mDiv(d1, {}, 'error', 'hallo das ist ein error');
	let d3 = mDiv(d1, { align: 'center', bg: 'yellow' });
	let form = mCreate('form', { align: 'center', bg: 'red' }, 'myform');
	form.id = 'myform';
	form.setAttribute('autocomplete', 'off');
	form.onsubmit = (ev) => { ev.preventDefault(); collect_data(); }
	mAppend(d3, form);
	let sp1 = mSpan(form, { fz: 11 }, null, 'drag and drop an image to change');
	form.innerHTML += '<br>';
	DA.imageChanged = DA.colorChanged = false;
	let img = mImg(userdata.imagePath + '?=' + Date.now(), form, { h: 200, margin: 10 });
	img.onload = () => {
		let inp = mCreate('input');
		mAppend(form, inp);
		inp.setAttribute('type', 'text');
		inp.setAttribute('placeholder', 'username');
		inp.setAttribute('name', 'username');
		inp.setAttribute('id', 'iUsername');
		inp.setAttribute('value', userdata.username);
		inp.setAttribute('autofocus', true);
		inp.onkeydown = ev => {
			if (ev.keyCode === 13) {
				ev.preventDefault();
				console.log('WTF!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
				collect_data(ev);
			}
		};
		form.innerHTML += '<br />';
		let picker = mColorPickerBehavior(U.settings.userColor, img, form,
			(a) => { console.log('new color is', a); DA.newColor = a; DA.colorChanged = true; },
			{ w: 322, h: 45, bg: 'green', rounding: 6, margin: 'auto', align: 'center' });
		form.innerHTML += `<input id='save_account_button' type="button" value="Submit" onclick="collect_data(event)" ><br>`;
	};
	img.id = 'imgPreview';
	img.setAttribute('allowDrop', true);
	img.ondragover = img.ondrop = img.ondragleave = handle_drag_and_drop;
}
function createAreas(dGrid, areaNames, prefix, shadeAreaBackgrounds = false, showAreaNames = true) {
	console.log('creating areas', areaNames)
	let SPEC = {}; SPEC.areas = { T: 'dTrick', H: 'dHuman', A: 'dAI' };
	let palette = getTransPalette9();
	let ipal = 1;
	let result = [];
	for (const k in SPEC.areas) {
		let areaName = SPEC.areas[k];
		let dCell = mDiv(dGrid, { h: '100%', w: '100%', bg: 'random', 'grid-area': k, });
		if (shadeAreaBackgrounds) { dCell.style.backgroundColor = palette[ipal]; ipal = (ipal + 1) % palette.length; }
		if (showAreaNames) {
			dCell = mTitledDiv(areaName, dCell, { bg: 'green', }, { h: '100%', w: '100%', bg: 'yellow', }, areaName)
		} else { dCell.id = areaName; }
		result.push({ name: areaName, div: dCell });
	}
	return result;
	for (const areaName of areaNames) {
		let d1 = document.createElement('div');
		let id = (isdef(prefix) ? prefix + '.' : '') + areaName;
		d1.id = id;
		d1.style.gridArea = areaName;
		mStyleX(d1, { bg: 'random' });
		d1.innerHTML = 'hallo'
		if (shadeAreaBackgrounds) { d1.style.backgroundColor = colorPalette[ipal]; ipal = (ipal + 1) % colorPalette.length; }
		if (showAreaNames) { d1.innerHTML = makeAreaNameDomel(areaName); }
		dGrid.appendChild(d1);
	}
}
function createAreas_dep(d, areaNames, prefix, shadeAreaBackgrounds = false, showAreaNames = true) {
	console.log('creating areas', areaNames)
	let palette = getTransPalette9();
	let ipal = 1;
	for (const areaName of areaNames) {
		let d1 = document.createElement('div');
		let id = (isdef(prefix) ? prefix + '.' : '') + areaName;
		d1.id = id;
		d1.style.gridArea = areaName;
		mStyleX(d1, { bg: 'random' });
		d1.innerHTML = 'hallo'
		if (shadeAreaBackgrounds) { d1.style.backgroundColor = colorPalette[ipal]; ipal = (ipal + 1) % colorPalette.length; }
		if (showAreaNames) { d1.innerHTML = makeAreaNameDomel(areaName); }
		d.appendChild(d1);
	}
}
function createArtificialSpecForBoardMemberIfNeeded(oid, o, R) {
	let key = R.getR(oid);
	if (!isEmpty(key)) {
		key = key[0];
	}
	else {
		key = getUID();
		R.lastSpec[key] = { cond: { obj_type: o.obj_type }, type: 'info' };
		R.addR(oid, key);
		R.updateR(key);
	}
	return key;
}
function createBoard(nui, R, area) {
	console.log('nui', nui, 'R', R, 'area', area);
	let [oid, boardType, r0, c0] = detectBoardOidAndType(nui.oid, nui.boardType, R);
	nui.oid = oid;
	nui.boardType = boardType;
	let baseIndex = { r0: r0, c0: c0 };
	nui.bi = window[nui.boardType](R.getO(nui.oid), R, baseIndex);
	generalGrid(nui, R, area);
}
function createCardZone(id, label, labelPos = 'top', hCard = 110) {
	let gap = 2;
	let dZone = mDiv(dTable, { padding: 10, align: 'center', rounding: 20 });
	dZone.id = 'zone_' + id;
	let dLabel;
	if (isdef(label) && labelPos == 'top') {
		dLabel = mText(label, dZone, { display: 'inline-block', maleft: -10 });
	}
	let dData = mDiv(dZone, { h: hCard + gap, align: 'center' });
	dData.id = 'data_' + id;
	if (isdef(label) && labelPos == 'bottom') {
		dLabel = mText(label, dZone, { display: 'inline-block', maleft: -10 });
	}
	let b = getBounds(dZone);
	return { div: dZone, dData: dData, dLabel: dLabel, label: label, labelPos: labelPos, w: b.width, h: b.height, center: actualCenter(dZone) };
}
function createcircle(posx, posy, radius, stroke, fill, filter) {
	var circle = document.createElementNS(svgns, "circle");
	circle.setAttributeNS(null, "id", "c" + circles);
	circle.setAttributeNS(null, "cx", posx);
	circle.setAttributeNS(null, "cy", posy);
	circle.setAttributeNS(null, "r", radius);
	circle.setAttributeNS(null, "stroke-width", stroke);
	circle.setAttributeNS(null, "fill", fill);
	circle.setAttributeNS(null, "filter", filter);
	circle.setAttributeNS(null, "data-posx", posx);
	svg.appendChild(circle);
}
function createClassByName(name, ...a) { var c = eval(name); return new c(...a); }
function createClientBoardNew(o, s) {
	let [layout, wCell, hCell, wGap, hGap] = [s.boardLayout, s.dxCenter, s.dyCenter, s.wGap, s.hGap];
	let dInner = o.dInner;
	mCenterCenterFlex(dInner);
	let [wArea, hArea] = [Math.min(o.wOuter, s.wFieldArea), Math.min(o.hOuter, s.hFieldArea)];
	let dArea = o.dArea = mDiv(dInner, { matop: s.boardMarginTop, maleft: s.boardMarginLeft, w: wArea, h: hArea }, 'dFieldArea');
	mCenterCenterFlex(dArea);
	let [w, h] = [wArea, hArea];
	let isHexLayout = startsWith(layout, 'hex');
	let hline = isHexLayout ? hCell * .75 : hCell;
	let rows, cols;
	if (isdef(s.rows) && layout != 'circle') rows = s.rows; else rows = Math.floor(h / hline);
	if (isdef(s.cols) && layout != 'circle') cols = s.cols; else cols = Math.floor(w / wCell)
	let [centers, wTotal, hTotal] = getCentersFromRowsCols(layout, rows, cols, wCell, hCell);
	let dCells = mDiv(dArea, { w: wTotal, h: hTotal, position: 'relative' });
	mStyleX(dArea, { w: Math.max(wArea, wTotal), h: Math.max(hArea, hTotal) });
	let fields;
	if (isdef(centers)) fields = createFieldsFromCenters(dCells, o, centers, wCell, hCell, wGap, hGap, wTotal, hTotal);
	let bg = valf(s.fieldColor, colorTrans('black', .3));
	fields.map(x => mStyleX(iDiv(x), { bg: bg }));
	if (s.boardRotation != 0) {
		dCells.style.transform = `rotate(${s.boardRotation}deg)`;
	}
}
function createCollapsibles(dv, lst, collapsed) {
	let pageContent = mBy('pageContent');
	for (const item of lst) {
		let path = item;
		let info = dv[path];
		let coll = genCollapsible(path, dv[path]);
		dv[path].collapsible = coll;
		DOC_UIS[coll.id] = dv[path];
		let signatureLinkContainer = mDiv(mBy('menu'));
		signatureLinkContainer.id = getLinkContainerId(coll.id);
		let pathContainer = mDiv(pageContent);
		pathContainer.id = info.idPathContainer;
		let pathTitle = mDiv(pathContainer);
		pathTitle.innerHTML = info.filename;
		pathTitle.classList.add('pathTitle');
		let pathContent = mDiv(pathContainer);
		if (!isEmpty(info.topComment)) addComment(info.topComment, pathContent);
		pathContent.classList.add('comments');
		for (const signature of dv[path].funcIndex) {
			let entry = dv[path].funcDict[signature];
			let comments = entry.comments;
			let l = genLink(signature, signatureLinkContainer);
			let functionName = stringBefore(signature, '(').trim();
			l.id = 'a_' + entry.index + '@' + entry.path;
			entry.idLink = l.id;
			entry.idDiv = 'div' + entry.index + '@' + entry.path;
			let fDiv0 = mDiv(pathContent);
			fDiv0.id = entry.idDiv;
			let fDiv = mCreate('p');
			fDiv0.appendChild(fDiv);
			let fSignature = mDiv(fDiv);
			fSignature.innerHTML = signature;
			fSignature.classList.add('signature');
			let fComments = mDiv(fDiv);
			if (!isEmpty(comments)) addComment(comments, fComments);
			fComments.classList.add('comments');
		}
		hide(pathContainer);
	}
	let coll = document.getElementsByClassName("collapsible");
	for (let i = 0; i < coll.length; i++) {
		coll[i].addEventListener("click", toggleCollapsible);
	}
	if (collapsed) collapseAll();
}
function createContactsContent(myusers, msgs) {
	let mydata = uiGetContactStylesAndStart();
	mydata += uiGetContacts(myusers, msgs);
	return mydata;
}
function createContainers(list, dArea, styles) {
	let i = 0;
	let containers = [];
	let defStyles = { w: 150, h: 200, bg: 'random', rounding: 12, display: 'inline-block', margin: 12 };
	addKeys(defStyles, styles);
	for (const cat of list) {
		let cont = mTitledDiv(cat, dArea, styles, {}, 'c' + i);
		mStyleX(cont, { h: '100%' });
		i += 1;
		containers.push({ label: cat, div: cont });
	}
	return containers;
}
function createDeck() { return DeckA(); }
function createDeckWithJokers() { return _createDeck({ hasJokers: true }); }
function createDiv(id, className, left, top, width, height) {
	var div = document.createElement("div");
	div.id = id;
	div.className = className;
	div.style.left = String(left) + "px";
	div.style.top = String(top) + "px";
	div.style.width = String(width) + "px";
	div.style.height = String(height) + "px";
	return (div);
}
async function createDocs(collapsed = true) {
	let dv = DOC_vault = await createVault();
	DOC_UIS = {};
	let pkeys = Object.keys(dv).map(x => dv[x].filename);
	pkeys.sort();
	let lst = dict2list(dv);
	let sortedlst = lst.sort(fieldSorter(['filename']));
	i = 0;
	for (const item of sortedlst) {
		let id = item.id;
		let x = dv[item.id];
		x.index = i;
		x.idLink = 'a_path_' + i;
		x.idPathContainer = 'div_path_' + i;
		i += 1;
	}
	for (const p in dv) {
		let funcDict = dv[p].funcDict;
		let keys = Object.keys(funcDict);
		keys.sort();
		dv[p].funcIndex = keys;
		for (let i = 0; i < keys.length; i++) { funcDict[keys[i]].index = i; }
	}
	DOC_dvIndex = sortedlst.map(x => x.id);
	createCollapsibles(dv, DOC_dvIndex, collapsed);
	setCurrentPath('assetHelpers.js');
}
function createDragClone(ev, items, onRelease) {
	DragSourceItems = items;
	DragSourceItem = findItemFromEvent(items, ev);
	let elem = DragSource = iDiv(DragSourceItem);
	var clone = DragElem = elem.cloneNode(true);
	clone.id = DragElem.id + '_' + clone;
	DragSource = elem;
	mAppend(document.body, clone);
	mClass(clone, 'dragelem');
	mStyleX(clone, { left: ev.clientX - ev.offsetX, top: ev.clientY - ev.offsetY });
	clone.drag = { offsetX: ev.offsetX, offsetY: ev.offsetY };
	document.body.onmousemove = onMovingCloneAround;
	document.body.onmouseup = onRelease;
}
function createDraggable(id, className, left, top, width, text) {
	var div = document.createElement("div");
	div.innerHTML = String(text);
	div.id = id;
	div.className = className;
	div.style.left = String(left) + "px";
	div.style.top = String(top) + "px";
	div.style.width = String(width) + "px";
	div.draggable = true;
	ondragstart = "drag(event)";
	return (div);
}
function createDragLetters() {
	fz = 60; let word = Goal.label.toUpperCase();
	let dp = createLetterInputsX(word, dTable, { bg: 'silver', display: 'inline-block', fz: fz, w: fz, h: fz * 1.1, margin: 4 });
	scrambleInputs(dp);
	let letters = Array.from(dp.children);
	for (let i = 0; i < letters.length; i++) {
		let l = letters[i]
		l.onmousedown = onMouseDownOnLetter;
		mClass(l, 'draggable');
		l.id = 'letter' + i;
	}
	return letters;
}
function createDragWords(items, handler) {
	let keys = items.map(x => x.key);
	shuffle(keys);
	G.showLabels = true;
	titems = myShowLabels(null, undefined, { rows: 1, showLabels: true }, keys);
	titems.map(x => iDiv(x).style.cursor = 'pointer');
	titems.map(x => iDiv(x).onmousedown = (ev) => {
		createDragClone(ev, titems, dropAndEval);
	});
	return titems;
}
function createDropInputs() {
	let fz = 120; let word = Goal.label.toUpperCase(); let wlen = word.length;
	let dpEmpty = createLetterInputsX(word, dTable, { pabottom: 5, bg: 'grey', display: 'inline-block', fz: fz, w: fz, h: fz * 1.1, margin: 4 });
	let inputs = blankInputs(dpEmpty, range(0, wlen - 1), false);
	DropZones = [];
	for (let i = 0; i < inputs.length; i++) {
		let l = iDiv(inputs[i]);
		l.onmousedown = onMouseDownOnLetter;
		l.onclick = l.innerHTML = '_';
		mClass(l, 'dropzone');
		l.id = 'input' + i;
		DropZones.push(l);
	}
	return inputs;
}
function createDroppable(id, className, left, top, width, height) {
	var div = document.createElement("div");
	div.id = id;
	div.className = className;
	div.style.left = String(left) + "px";
	div.style.top = String(top) + "px";
	div.style.width = String(width) + "px";
	div.style.height = String(height) + "px";
	div.ondrop = "drop(event)";
	div.ondragover = "allowDrop(event)";
	return (div);
}
function createElementFromHTML(htmlString) {
	var div = document.createElement('div');
	div.innerHTML = htmlString.trim();
	return div.firstChild;
}
function createElementFromHtml(s) { return createElementFromHTML(s); }
function createEmoji({ key, w, h, unit = 'px', fg, bg, padding, cat, parent, border, rounding }) {
	let emoji = emojiChars[emojiKeys[key]];
	console.log('emoji', emoji);
	if (nundef(key)) key = getRandomKey(emojiChars);
	let ch = emoji.hexcode;
	console.log('ch', ch)
	let family = 'emoOpen';
	let text = emoji.emoji;
	if (isdef(parent) && isString(parent)) parent = mBy(parent);
	console.log(parent);
	console.log(typeof text, text)
	cat = isdef(cat) ? cat : isdef(parent) ? getTypeOf(parent) == 'div' ? 'd' : 'g' : isdef(cat) ? cat : 'd';
	let domel;
	if (cat == 'd') {
		let d = document.createElement('div');
		d.style.textAlign = 'center';
		if (isdef(bg)) {
			console.log('bg', bg);
			d.style.backgroundColor = bg;
		}
		d.innerHTML = text;
		domel = d;
		if (isdef(padding)) d.style.padding = padding + unit;
		d.style.display = 'inline-block';
		d.style.height = h + 2 * padding + unit;
		d.style.width = d.style.height;
		if (isdef(border)) d.style.border = border;
		if (isdef(rounding)) d.style.borderRadius = rounding + unit;
	} else {
	}
	domel.key = key;
	if (parent) parent.appendChild(domel);
	return domel;
}
function createFakeState() {
	let settings = DB.games.gPerlen2;
	let fakeServer = new FakeServerClass(Socket, PerlenDict, settings, null);
	let state = fakeServer.State;
	return { settings: settings, state: state, perlenDict: PerlenDict };
}
function createFields(s, b, scale) {
	let dCells = b.dCells = mDiv(b.dOuter, { matop: s.boardMarginTop * scale, maleft: s.boardMarginLeft * scale, w: b.wNeeded, h: b.hNeeded, position: 'relative' }, 'dFieldArea');
	let [horDist, vertDist, szField] = [b.dxCenter, b.dyCenter, s.szField * scale];
	let fields = b.fields = [], i = 0, dx = horDist / 2, dy = vertDist / 2;
	let bg = s.fieldColor;
	for (const p of b.centers) {
		let left = p.x - szField / 2;
		let top = p.y - szField / 2;
		let dItem = mDiv(dCells, { position: 'absolute', left: left, top: top, display: 'inline', w: szField, h: szField, rounding: '50%', bg: bg });
		mCenterCenterFlex(dItem)
		let f = { div: dItem, index: i, center: p, isField: true }; i += 1;
		fields.push(f);
	}
	if (s.boardRotation != 0) { dCells.style.transform = `rotate(${s.boardRotation}deg)`; }
}
function createFields_dep(s, b, scale) {
	let dCells = b.dCells = mDiv(b.dOuter, { matop: s.boardMarginTop * scale, maleft: s.boardMarginLeft * scale, w: b.wNeeded, h: b.hNeeded, position: 'relative' });
	let [wCell, hCell, wGap, hGap] = [b.dxCenter, b.dyCenter, s.wGap * scale, s.hGap * scale];
	let fields = b.fields = [], i = 0, dx = wCell / 2, dy = hCell / 2;
	let bg = s.fieldColor;
	for (const p of b.centers) {
		let left = p.x - dx + wGap / 2;
		let top = p.y - dy + hGap / 2;
		let dItem = mDiv(dCells, { position: 'absolute', left: left, top: top, display: 'inline', w: wCell - wGap, h: hCell - hGap, rounding: '50%', bg: bg });
		mCenterCenterFlex(dItem)
		let f = { div: dItem, index: i, center: p, isField: true }; i += 1;
		fields.push(f);
	}
	if (s.boardRotation != 0) { dCells.style.transform = `rotate(${s.boardRotation}deg)`; }
}
function createFilter(svg, posx, posy, sizex, sizey, type, data) {
	var svgns = "http://www.w3.org/2000/svg";
	var defs = document.createElementNS(svgns, "defs");
	svg.appendChild(defs);
	var filter = document.createElementNS(svgns, "filter");
	defs.appendChild(filter);
	filter.setAttribute("id", "filterBlur");
	filter.setAttribute("x", posx);
	filter.setAttribute("y", posy);
	filter.setAttribute("width", sizex);
	filter.setAttribute("height", sizey);
	for (z = 0; z < (data.length / 2); z++) {
		var filter = document.createElementNS(svgns, type[z]);
		filter.setAttributeNS(null, "in", "SourceGraphic");
		filter.setAttributeNS(null, data[2 * z], data[2 * z + 1]);
		document.getElementById("f" + circles).appendChild(filter);
	}
}
function createfilter1(posx, posy, sizex, sizey, type, data) {
	var svg = document.getElementById("canvas");
	var fs = document.getElementById("filters");
	var circles = 0;
	var svgns = "http://www.w3.org/2000/svg";
	var w = window.innerWidth;
	var filter = document.createElementNS(svgns, "filter");
	filter.setAttribute("id", "f" + circles);
	fs.appendChild(filter);
	for (z = 0; z < (data.length / 2); z++) {
		var filter = document.createElementNS(svgns, type[z]);
		filter.setAttributeNS(null, "in", "SourceGraphic");
		filter.setAttributeNS(null, data[2 * z], data[2 * z + 1]);
		document.getElementById("f" + circles).appendChild(filter);
	}
}
function createGamesContent(mygames, tables = {}) {
	let mydata = uiGetGamesStylesAndStart();
	mydata += uiGetGames(mygames, tables);
	return mydata;
}
function createGrid(areaName, idBoard, sBoard, sMemberPool, shape) {
	let board = makeBoard(idBoard, sBoard, areaName);
	board.structInfo = shape == 'hex' ? getHexGridInfo(sBoard.rows, sBoard.cols) : getQuadGridInfo(sBoard.rows, sBoard.cols);
	makeFields(sMemberPool, board, sBoard, shape);
	if (isdef(sBoard.corners)) makeCorners(sMemberPool, board, sBoard);
	if (isdef(sBoard.edges)) makeEdges(sMemberPool, board, sBoard);
	return board;
}
function createGridLayout(d, layout, collapseEmptySmallLetterAreas = false) {
	let s = '';
	let m = [];
	let maxNum = 0;
	let areaNames = [];
	for (const line of layout) {
		let letters = line.split(' ');
		let arr = [];
		for (const l of letters) {
			if (!isEmpty(l)) {
				addIf(areaNames, l);
				arr.push(l);
			}
		}
		m.push(arr);
		if (arr.length > maxNum) maxNum = arr.length;
	}
	for (const line of m) {
		let el = line[line.length - 1];
		while (line.length < maxNum) line.push(el);
		s += '"' + line.join(' ') + '" ';
	}
	d.style.gridTemplateAreas = s;
	if (collapseEmptySmallLetterAreas) { collapseSmallLetterAreas(m, d); }
	else fixedSizeGrid(m, d);
	return areaNames;
}
function createGridLayout_dep(d, layout) {
	let s = '';
	let m = [];
	let maxNum = 0;
	let areaNames = [];
	for (const line of layout) {
		let letters = line.split(' ');
		let arr = [];
		for (const l of letters) {
			if (!isEmpty(l)) {
				addIf(areaNames, l);
				arr.push(l);
			}
		}
		m.push(arr);
		if (arr.length > maxNum) maxNum = arr.length;
	}
	for (const line of m) {
		let el = line[line.length - 1];
		while (line.length < maxNum) line.push(el);
		s += '"' + line.join(' ') + '" ';
	}
	d.style.gridTemplateAreas = s;
	if (SPEC.collapseEmptySmallLetterAreas) { collapseSmallLetterAreas(m, d); }
	else fixedSizeGrid(m, d);
	return areaNames;
}
function createHandler(param, func) {
	return function (ev) {
		let id = evToId(ev);
		console.log(param, 'and', id);
		param.push(getOid(id));
		for (const oid of param) {
			getDefVisual(oid)[func]();
		}
	}
}
function createHexboard(rows = 3, cols = 3, a = 48) {
	let sq3 = Math.sqrt(3);
	let wp = a / 4, hp = a / 4, h = sq3 * a / 2;
	let [xoff, dx, yoff, dy] = [h + wp / 2, 2 * h, hp / 2, a / 2];
	let ys = 2 + 3 * rows;
	let xs = cols;
	let x = xoff, y = yoff;
	let pts = [];
	let infos = [];
	let idx = 0;
	let yEven = true;
	for (let i = 0; i < ys; i++) {
		let tcolOffset = yEven ? 1 : 0;
		let isCenterRow = i >= 2 && ((i - 2) % 3) == 0;
		for (let j = 0; j < xs + (1 - tcolOffset); j++) {
			let pt = { x: x, y: y };
			pts.push(pt);
			infos.push({ index: idx, tcol: tcolOffset + 2 * j, trow: i, x: x, y: y, pt: pt, isCenterRow: isCenterRow, isHexCenter: isCenterRow, isCenterCol: j % 2 == 1 });
			x += dx;
			idx += 1;
		}
		yEven = !yEven;
		y += dy; x = i % 2 ? xoff : wp / 2;
	}
	let byrc = {};
	for (const i of infos) {
		lookupSet(byrc, [i.trow, i.tcol], i.index);
	}
	console.log('byrc', byrc)
	let byxy = {};
	let adjList = [];
	let di = {};
	for (const info of infos) {
		let [r, c] = [info.trow, info.tcol];
		info.nodes = [
			lookup(byrc, [r - 2, c]),
			lookup(byrc, [r - 1, c + 1]),
			lookup(byrc, [r + 1, c + 1]),
			lookup(byrc, [r + 2, c]),
			lookup(byrc, [r + 1, c - 1]),
			lookup(byrc, [r + 1, c - 1]),
		];
		for (let i = 0; i < 6; i++) {
			let n1 = info.nodes[i];
			if (n1 == null) continue;
			let n2 = info.nodes[(i + 1 % 6)];
			if (n2 == null) continue;
			if (lookup(di, [n1, n2]) || lookup(di, [n2, n1])) continue;
			lookupSet(di, [n1, n2], true);
			adjList.push([n1, n2]);
		}
		info.neighbors = [
			lookup(byrc, [r - 3, c + 1]),
			lookup(byrc, [r, c + 2]),
			lookup(byrc, [r + 3, c + 1]),
			lookup(byrc, [r + 3, c - 1]),
			lookup(byrc, [r, c - 2]),
			lookup(byrc, [r - 3, c - 1]),
		];
	}
	return { items: infos, adjList: adjList, rows: rows, cols: cols, dx: dx, dy: dy, sz: a }
}
function createHexboard1(rows = 3, cols = 3, a = 48) {
	let sq3 = Math.sqrt(3);
	let wp = a / 4, hp = a / 4, h = sq3 * a / 2;
	let [xoff, dx, yoff, dy] = [h + wp / 2, 2 * h, hp / 2, a / 2];
	return createHexboardHelper(rows, cols, dy, dx, yoff, xoff, hp, wp, a);
}
function createHexboard2(rows = 3, cols = 3, a = 48) {
	let sq3 = Math.sqrt(3);
	let wp = a / 4, hp = a / 4, h = sq3 * a / 2;
	let [xoff, dx, yoff, dy] = [h + wp / 2, 2 * h, hp / 2, a / 2];
	return createHexboardHelper(rows, cols, dy, dx, yoff, xoff, hp, wp, a);
}
function createHexboardHelper(rows, cols, dy, dx, yoff, xoff, hp, wp, a) {
	let ys = 2 + 3 * rows;
	let xs = cols;
	let x = xoff, y = yoff;
	let pts = [];
	let infos = [];
	let idx = 0;
	let yEven = true;
	for (let i = 0; i < ys; i++) {
		let tcolOffset = yEven ? 1 : 0;
		let isCenterRow = i >= 2 && ((i - 2) % 3) == 0;
		for (let j = 0; j < xs + (1 - tcolOffset); j++) {
			let pt = { x: x, y: y };
			pts.push(pt);
			infos.push({ index: idx, tcol: tcolOffset + 2 * j, trow: i, x: x, y: y, pt: pt, isCenterRow: isCenterRow, isHexCenter: isCenterRow, isCenterCol: j % 2 == 1 });
			x += dx;
			idx += 1;
		}
		yEven = !yEven;
		y += dy; x = i % 2 ? xoff : wp / 2;
	}
	let byrc = {};
	for (const i of infos) {
		lookupSet(byrc, [i.trow, i.tcol], i.index);
	}
	let byxy = {};
	let adjList = [];
	let di = {};
	for (const info of infos) {
		let [r, c] = [info.trow, info.tcol];
		info.nodes = [
			lookup(byrc, [r - 2, c]),
			lookup(byrc, [r - 1, c + 1]),
			lookup(byrc, [r + 1, c + 1]),
			lookup(byrc, [r + 2, c]),
			lookup(byrc, [r + 1, c - 1]),
			lookup(byrc, [r + 1, c - 1]),
		];
		for (let i = 0; i < 6; i++) {
			let n1 = info.nodes[i];
			if (n1 == null) continue;
			let n2 = info.nodes[(i + 1 % 6)];
			if (n2 == null) continue;
			if (lookup(di, [n1, n2]) || lookup(di, [n2, n1])) continue;
			lookupSet(di, [n1, n2], true);
			adjList.push([n1, n2]);
		}
		info.neighbors = [
			lookup(byrc, [r - 3, c + 1]),
			lookup(byrc, [r, c + 2]),
			lookup(byrc, [r + 3, c + 1]),
			lookup(byrc, [r + 3, c - 1]),
			lookup(byrc, [r, c - 2]),
			lookup(byrc, [r - 3, c - 1]),
		];
	}
	return { items: infos, adjList: adjList, rows: rows, cols: cols, dx: dx, dy: dy, sz: a, byrc: byrc }
}
function createImage(filename, styles) {
	let img = mCreateFrom(`<img src='../rechnung/images/${filename}'>`);
	if (isdef(styles.w)) { img.setAttribute('width', styles.w); }
	if (isdef(styles.h)) { img.setAttribute('height', styles.h); }
	mStyle(img, styles);
	return img;
}
function createImg(id, className, zIndex, left, top, width, height, src) {
	var img = document.createElement("img");
	img.id = id;
	img.className = className;
	img.style.zIndex = zIndex;
	img.style.left = String(left) + "px";
	img.style.top = String(top) + "px";
	img.style.width = String(width) + "px";
	img.style.height = String(height) + "px";
	img.src = src;
	return (img);
}
function createIndependentUi(n, area) {
	if (nundef(n.type)) { n.type = inferType(n); }
	R.registerNode(n);
	decodeParams(n, R, {});
	calcIdUiParent(n, R, area);
	let ui;
	if (nundef(RCREATE[n.type])) ui = mDefault(n, area, R);
	else ui = RCREATE[n.type](n, R, area);
	if (nundef(n.uiType)) n.uiType = 'd';
	if (n.uiType == 'NONE') return ui;
	if (n.uiType != 'childOfBoardElement') {
		if (isBoard(n.uid, R)) { delete n.cssParams.padding; }
		applyCssStyles(n.uiType == 'h' ? mBy(n.uidStyle) : ui, n.cssParams);
	}
	if (!isEmpty(n.stdParams)) {
		switch (n.stdParams.show) {
			case 'if_content': if (!n.content) hide(ui); break;
			case 'hidden': hide(ui); break;
			default: break;
		}
	}
	R.setUid(n, ui);
	return ui;
}
function createKeyIndex(di, prop) {
	let res = {};
	for (const k in di) {
		res[di[k][prop]] = k;
	}
	return res;
}
function createLabel_dep(n1, ui, R) {
	let g = ui;
	if (n1.content) {
		let pa = n1.params;
		let transPa = { txt: n1.content };
		let fill = pa.fg;
		if (isdef(fill)) { transPa.fill = fill; }
		else if (isdef(pa.bg)) { transPa.fill = colorIdealText(pa.bg); }
		else {
			transPa.fill = 'white';
		}
		let font = pa.font; if (isdef(font)) transPa.font = font;
		let gt = n1.label = new gText(g);
		gt.text(transPa);
	}
}
function createLayout(dParent, l) {
	console.log('*** createLayout ***', dParent, l);
	let d = mBy(dParent);
	let areaNames = createGridLayout(d, l);
	console.log(areaNames, d)
	createAreas(d, areaNames, dParent);
}
function createLetterInputs(s, dParent, style, idForContainerDiv, colorWhiteSpaceChars = true, preserveColorsBetweenWhiteSpace = true) {
	let d = mDiv(dParent);
	if (isdef(idForContainerDiv)) d.id = idForContainerDiv;
	inputs = [];
	let whiteStyle = jsCopy(style);
	if (!colorWhiteSpaceChars) {
		if (isdef(whiteStyle.fg)) delete whiteStyle.fg;
		if (isdef(whiteStyle.bg)) delete whiteStyle.bg;
		if (isdef(whiteStyle.border)) delete whiteStyle.border;
	}
	let fg, fgOrig, bg, bgOrig;
	fgOrig = style.fg;
	bgOrig = style.bg;
	if (isVariableColor(fgOrig) && isdef(style.fg)) { fg = computeColorX(fgOrig); style.fg = fg; }
	if (isVariableColor(bgOrig) && isdef(style.bg)) { bg = computeColorX(bgOrig); style.bg = bg; }
	for (let i = 0; i < s.length; i++) {
		let d1 = mCreate('div');
		mAppend(d, d1);
		d1.innerHTML = s[i];
		let white = isWhiteSpace2(s[i]);
		if (white) {
			if (isVariableColor(fgOrig) && isdef(style.fg)) { fg = computeColorX(fgOrig); style.fg = fg; }
			if (isVariableColor(bgOrig) && isdef(style.bg)) { bg = computeColorX(bgOrig); style.bg = bg; }
		}
		mStyleX(d1, white ? whiteStyle : style);
	}
	return d;
}
function createLetterInputsX(s, dParent, style, idForContainerDiv) {
	let d = mDiv(dParent);
	if (isdef(idForContainerDiv)) d.id = idForContainerDiv;
	inputs = [];
	for (let i = 0; i < s.length; i++) {
		let d1 = mDiv(d);
		d1.innerHTML = s[i];
		mStyle(d1, style);
	}
	return d;
}
function createLoginContent(userdata) {
	return `
		<div id="dAccount" style="max-width=500px; margin-top:10px; display:flex; animation: appear1 1s ease;justify-content:center; align-content:center">
				<div id="error">some text</div>
				<div style='text-align:center'>
						<form id="myform" autocomplete="off" style='text-align:center;background:${userdata.color}'>
								<img id="imgPreview" src='${get_image_path(userdata)}' style="height:200px;margin:10px;" />
								<input id='iUsername' type="text" name="username" placeholder='username' value="${userdata.name}" autofocus
										onkeydown="if (event.keyCode === 13){event.preventDefault();console.log('WTF!!!!!!!!!!!!!!!!!!!!!!!!!!!!');collect_data(event);}" />
								<br />
								<input id='save_settings_button' type="button" value="Submit" onclick="collect_data(event)" ><br>
						</form>
		</div></div>
		`;
}
function createLoginNewContent(myusers, msgs) {
	let mydata = uiGetLoginNewStylesAndStart();
	mydata += uiGetLoginNewList(myusers, msgs);
	return mydata;
}
function createMarker(markerId) {
	let divs = document.getElementsByClassName('feedbackMarker');
	let d;
	d = mCreate('div');
	d.innerHTML = MarkerText[markerId];
	mClass(d, 'feedbackMarker');
	document.body.appendChild(d);
	Markers.push(d);
	return d;
}
function createMarker_orig(markerId) {
	let divs = document.getElementsByClassName('feedbackMarker');
	let d;
	d = mCreate('div');
	d.innerHTML = MarkerText[markerId];
	mClass(d, 'feedbackMarker');
	document.body.appendChild(d);
	Markers.push(d);
	return d;
}
function createMenuUi(dParent) {
	clearElement(dParent);
	mCenterFlex(dParent);
	mAppend(dParent, createElementFromHTML(`<h1>Choose Game:</h1>`));
	mLinebreak(dParent);
	let dMenuItems = mDiv(dParent, { w: '90%', h: 600 });
	let games = jsCopy(U.avGames); if (!navigator.onLine) { removeInPlace(games, 'gSayPic'); }
	let items = [];
	let outerStyles = {
		display: 'inline-flex', 'flex-direction': 'column',
		'justify-content': 'center', 'align-items': 'center', 'vertical-align': 'top',
		wmin: 140, hmin: 110, margin: 8, rounding: 6
	};
	for (const g of games) {
		let item = { o: DB.games[g], id: g }; iRegister(item, g);
		item.bg = getColorDictColor(item.o.color);
		item.label = capitalize(item.o.friendly);
		item.info = Syms[item.o.logo];
		let d = makeItemDiv(item, {
			outerStyles: outerStyles, ifs: { bg: true },
			picStyles: { fz: 60 },
			showPic: true, showLabels: true, labelBottom: true, handler: onClickMenuItem
		});
		iAdd(item, { div: d });
		mAppend(dMenuItems, d);
		items.push(item);
	}
	if (nundef(G)) return;
	SelectedMenuKey = G.id;
	let selItem = Items[SelectedMenuKey];
	toggleItemSelection(selItem);
}
function createMenuUiNew(dParent, keys, clickMenuHandler, outerStyles = {}, picStyles = {}, labelStyles = {}, hTotal = 600) {
	clearElement(dParent);
	mCenterFlex(dParent);
	mAppend(dParent, createElementFromHTML(`<h1>Choose Game:</h1>`));
	mLinebreak(dParent);
	let dMenuItems = mDiv(dParent, { w: '90%', h: hTotal });
	let games = keys;
	if (!navigator.onLine) { removeInPlace(games, 'gSayPic'); }
	let items = [];
	let defaultOuterStyles = {
		display: 'inline-flex', 'flex-direction': 'column',
		'justify-content': 'center', 'align-items': 'center', 'vertical-align': 'top',
		wmin: hTotal / 4, hmin: hTotal / 6, margin: 8, rounding: 6
	};
	addKeys(defaultOuterStyles, outerStyles);
	let defaultPicStyles = { fz: hTotal / 10, 'line-height': hTotal / 10 + 'px' };
	addKeys(defaultPicStyles, picStyles);
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
	if (nundef(G)) return;
	SelectedMenuKey = G.id;
	let selItem = Items[SelectedMenuKey];
	toggleItemSelection(selItem);
}
function createMessageContent(messages, me, other) {
	let result = `<div id='messages_holder_parent' onclick='set_seen(event)' style='background:silver;height:680px;'>
		<div id='messages_holder' style='box-sizing:border-box;height:580px;padding:10px;margin-bottom:10px;overflow-y:auto;'>`;
	result += `start of chat with ${other.username} <img src="${other.imagePath}" style="margin-left:10px;display:inline;height:30px;"/><br><br>`;
	for (const m of messages) {
		if (m.sender == me.username) { result += message_right(m, me); } else { result += message_left(m, other); }
	}
	result += message_controls();
	return result;
}
function createMSTree(mobj) {
	let areas = mobj.elem.children;
	for (const ch of [...areas]) {
		if (!ch.id) { continue; }
		let msChild = makeDomArea(ch);
		if (ch.id == 'a_d_settings' || ch.id == 'a_d_main_menu') continue;
		createMSTree(msChild);
	}
}
function createMultiplayerGame() {
	_sendRoute('/restart', d1 => _newGame(game));
}
function createMultipleChoiceElements(correctAnswer, wrongAnswers, dParent, dFeedbackUI, styles) {
	if (nundef(Goal)) Goal = {};
	let choices = wrongAnswers; choices.push(correctAnswer);
	Goal.correctChoice = correctAnswer;
	if (isYesNo(choices)) {
		sortByDescending(choices, 'text');
	} else {
		shuffle(choices);
		if (coin()) shuffle(choices);
	}
	Goal.choices = choices;
	Goal.feedbackUI = dFeedbackUI;
	let idx = 0;
	for (const ch of choices) {
		////'&frac57;', //'&frac12;', 
		let dButton = mButton(ch.text, onClickChoice, dParent, { wmin: 100, fz: 36, margin: 20, rounding: 4, vpadding: 4, hpadding: 10 }, ['toggleButtonClass']);
		dButton.id = 'bChoice_' + idx; idx += 1;
		if (ch.text == correctAnswer.text) {
			Goal.choice = ch.toString();
			Goal.buttonCorrect = dButton;
		}
	}
}
function createNode(sp, idParent, R) {
	let n = jsCopy(sp);
	n.idParent = idParent;
	let id = n.nid = getUid();
	n.fullPath = R.NODES[idParent].fullPath + '.' + id;
	return n;
}
function createNumberSequence(n, min, max, step, op = 'plus') {
	let fBuild = x => { return op == 'plus' ? (x + step) : op == 'minus' ? (x - step) : x; };
	if (op == 'minus') min += step * (n - 1);
	if (min >= (max - 10)) max = min + 10;
	let seq = getRandomNumberSequence(n, min, max, fBuild, lastPosition);
	lastPosition = seq[0];
	return seq;
}
function createPageDivsFullVisibleArea(above, tableStyles, below, defs = { bg: 'random', fg: 'contrast' }) {
	clearElement(dMain);
	let dRightSide = mDiv(dMain, { display: 'flex', 'flex-direction': 'column', 'flex-grow': 10 });
	let table = mDiv(dRightSide, {}, 'table');
	for (const k in above) {
		let name = 'd' + capitalize(k);
		let ltop = get3ColLine(table, name + 'Left', name, name + 'Right', mergeOverride(defs, above[k]));
	}
	let vals = Object.values(above);
	vals = vals.concat(Object.values(below));
	let sum = arrSum(vals, 'h');
	let sum1 = arrSum(vals, 'hmin');
	console.log('sum', sum, 'sum1', sum1);
	sum += sum1;
	let hTable = percentVh(100) - sum;
	let wTable = percentVw(100) - 20;
	if (nundef(tableStyles)) tableStyles = {};
	tableStyles = mergeOverride({ bg: 'dimgray', w: wTable, h: hTable, vpadding: 0, hpadding: 0 }, tableStyles);
	let ltable = get3ColLine(table, 'dTableLeft', 'dTable', 'dTableRight', tableStyles);
	ltable.id = 'lTable';
	mSize(dTable.parentNode, '100%', '100%');
	mSize(dTable, '100%', '100%');
	console.log('below', below);
	for (const k in below) {
		let name = 'd' + capitalize(k);
		let lbottom = get3ColLine(table, name + 'Left', name, name + 'Right', mergeOverride(defs, below[k]));
	}
	dFooter.innerHTML = 'HALLO';
	let rect = getRect(dTable);
	return rect;
}
function createPanelParentOfObjects(lst, n1, area, R) {
	if (nundef(n1.type)) n1.type = lst.length == 1 ? 'invisible' : 'panel';
	n1.content = null;
	n1.ui = createUi(n1, R, area);
}
function createPeeps() {
	const {
		rows,
		cols
	} = config
	const {
		naturalWidth: width,
		naturalHeight: height
	} = img
	const total = rows * cols
	const rectWidth = width / rows
	const rectHeight = height / cols
	for (let i = 0; i < total; i++) {
		allPeeps.push(new Peep({
			image: img,
			rect: [
				(i % rows) * rectWidth,
				(i / rows | 0) * rectHeight,
				rectWidth,
				rectHeight,
			]
		}))
	}
}
function createPerle(perle, dParent, sz = 64, wf = 1.3, hf = 0.4, useNewImage = false) {
	let d = makePerleDiv(perle,
		{ wmin: sz + 4, h: sz * (1 + hf) + 4 },
		{ w: sz, h: sz }, { wmax: sz * wf, hmax: sz * hf, fz: sz / 6 },
		'b', true, null, useNewImage);
	mAppend(dParent, d);
	if (perle.field != null) {
		perle.live.dLabel.remove();
		let img = perle.live.dImg;
		let d = iDiv(perle);
		let rect = getRect(img);
		let szField = G.settings.szField;
		let sz = G.settings.szPerle * szField / 100;
		if (isFarbPerle(perle)) mStyleX(img, { w: 1, h: 1 });
		else mStyleX(img, { w: sz, h: sz });
		mStyleX(d, { bg: 'transparent', w: sz, h: sz });
	} else {
		let d = iDiv(perle);
		mStyleX(d, { opacity: 1 - G.settings.dimming / 100 });
		let sz = G.settings.szPoolPerle;
		if (isdef(sz)) {
			mStyleX(d.firstChild, { w: sz, h: sz });
		}
	}
	return d;
}
function createPerleOverlap(perle, dParent, sz = 64, wf = 1.3, hf = 0.4) {
	let d = makePerleDiv(perle, { wmin: sz + 4, h: sz * hf + 4 }, { w: sz, h: sz }, { wmax: sz * wf, hmax: sz * hf, fz: sz / 6 }, 'b', true);
	mAppend(dParent, d);
	return d;
}
function createPicto({ key, w = 100, h = 100, unit = 'px', fg = 'blue', bg, padding = 10, cat, parent, border, rounding }) {
	if (nundef(key)) key = getRandomKey(iconChars);
	let ch = iconChars[key];
	let family = (ch[0] == 'f' || ch[0] == 'F') ? 'pictoFa' : 'pictoGame';
	let text = String.fromCharCode('0x' + ch);
	cat = isdef(parent) ? getTypeOf(parent) == 'div' ? 'd' : 'g' : isdef(cat) ? cat : 'd';
	let domel;
	if (cat == 'd') {
		let d = document.createElement('div');
		d.style.textAlign = 'center';
		d.style.fontFamily = family;
		d.style.fontWeight = 900;
		d.style.fontSize = h + unit;
		if (isdef(bg)) d.style.backgroundColor = bg;
		if (isdef(fg)) d.style.color = fg;
		d.innerHTML = text;
		domel = d;
		if (isdef(padding)) d.style.padding = padding + unit;
		d.style.display = 'inline-block';
		d.style.height = h + 2 * padding + unit;
		d.style.width = d.style.height;
		console.log('padding', padding, 'unit', unit, 'w', d.style.width, 'h', d.style.height);
		if (isdef(border)) d.style.border = border;
		if (isdef(rounding)) d.style.borderRadius = rounding + unit;
	} else {
	}
	domel.key = key;
	if (parent) parent.appendChild(domel);
	return domel;
}
function createPictoSimple({ key, w, h, unit = 'px', fg, bg, padding, cat, parent, border, rounding }) {
	if (nundef(key)) key = getRandomKey(iconChars);
	let ch = iconChars[key];
	let family = (ch[0] == 'f' || ch[0] == 'F') ? 'pictoFa' : 'pictoGame';
	let text = String.fromCharCode('0x' + ch);
	cat = isdef(cat) ? cat : isdef(parent) ? getTypeOf(parent) == 'div' ? 'd' : 'g' : isdef(cat) ? cat : 'd';
	if (nundef(w)) w = 25;
	if (nundef(h)) h = w;
	let domel;
	if (cat == 'd') {
		let d = document.createElement('div');
		d.style.textAlign = 'center';
		d.style.fontFamily = family;
		d.style.fontWeight = 900;
		d.style.fontSize = h + unit;
		if (isdef(bg)) d.style.backgroundColor = bg;
		if (isdef(fg)) d.style.color = fg;
		d.innerHTML = text;
		domel = d;
		if (isdef(padding)) d.style.padding = padding + unit;
		d.style.display = 'inline-block';
		d.style.height = h + 2 * padding + unit;
		d.style.width = d.style.height;
		if (isdef(border)) d.style.border = border;
		if (isdef(rounding)) d.style.borderRadius = rounding + unit;
	} else {
	}
	domel.key = key;
	if (parent) parent.appendChild(domel);
	return domel;
}
function createPictoX(parent, style, classes, titleOptions, pictoOptions, captionOptions) {
	let d = mDiv(parent);
	if (isdef(style)) mStyle(d, style);
	if (isdef(classes)) mClass(d, ...classes);
	if (isdef(titleOptions)) { titleOptions.parent = d; createText(titleOptions); }
	if (isdef(pictoOptions)) { pictoOptions.parent = d; createPicto(pictoOptions); }
	if (isdef(captionOptions)) { captionOptions.parent = d; createText(captionOptions); }
	return d;
}
function createPlayerZone(pl, namePos = 'top', showColor = false) {
	let id = pl.id;
	let z = createCardZone(id, id, namePos);
	if (showColor) mStyleX(z.div, { bg: pl.color });
	pl.zone = z;
	return z;
}
function createProtoForOidAndKey(oid, o, k, R) {
	let n = R.getSpec(k);
	let n1 = { key: k, oid: oid, uid: getUID() };
	return n1;
}
function createPrototypesForOid(oid, o, R) {
	if (isdef(R.oidNodes[oid])) {
		return;
	}
	let klist = R.getR(oid);
	let nlist = {};
	for (const k of klist) {
		let n1 = createProtoForOidAndKey(oid, o, k, R);
		nlist[k] = n1;
	}
	R.oidNodes[oid] = nlist;
}
function createSampleHex1(rows = 5, topcols = 3, w = 50, h = 50) {
	initTable();
	let styles = {
		outer: { bg: 'pink', padding: 25 },
		inner: { w: 500, h: 400 },
		node: { bg: 'pink', shape: 'hex', w: w, h: h },
		edge: { bg: 'white' }
	};
	let g = hex1Board(dTable, rows, topcols, styles);
	g.addLayoutControls();
	return g;
}
function createServerBoard(layout, filename, rows, cols) {
	let sz = 100;
	return { filename: 'brett10', layout: 'hex', cells: { w: 100, h: 120, wgap: 10, hgap: 10 } };
}
function createServerPoolKeys(perlenDict, settings = {}) { return getRandomPerlenKeys(perlenDict, valf(settings.numPool, 20)); }
function createSettingsUi(dParent) {
	clearElement(dParent);
	let ttag = 'h2';
	mAppend(dParent, createElementFromHTML(`<${ttag}>Common Settings for ${Username}:</${ttag}>`));
	let nGroupNumCommonAllGames = mInputGroup(dParent);
	setzeEineZahl(nGroupNumCommonAllGames, 'samples', 25, ['samplesPerGame']);
	setzeEineZahl(nGroupNumCommonAllGames, 'minutes', 1, ['minutesPerUnit']);
	setzeEineZahl(nGroupNumCommonAllGames, 'correct streak', 5, ['incrementLevelOnPositiveStreak']);
	setzeEineZahl(nGroupNumCommonAllGames, 'fail streak', 2, ['decrementLevelOnNegativeStreak']);
	setzeEinOptions(nGroupNumCommonAllGames, 'show labels', ['toggle', 'always', 'never'], ['toggle', 'always', 'never'], 'toggle', ['showLabels']);
	setzeEinOptions(nGroupNumCommonAllGames, 'language', ['E', 'D', 'S', 'F', 'C'], ['English', 'German', 'Spanish', 'French', 'Chinese'], 'E', ['language']);
	setzeEinOptions(nGroupNumCommonAllGames, 'vocabulary', Object.keys(KeySets), Object.keys(KeySets), 'best25', ['vocab']);
	setzeEineCheckbox(nGroupNumCommonAllGames, 'show time', false, ['showTime']);
	setzeEineCheckbox(nGroupNumCommonAllGames, 'spoken feedback', true, ['spokenFeedback']);
	setzeEineCheckbox(nGroupNumCommonAllGames, 'silent', false, ['silentMode']);
	setzeEineCheckbox(nGroupNumCommonAllGames, 'switch game after level', false, ['switchGame']);
	mLinebreak(dParent);
	let g = DB.games[G.id];
	if (nundef(g)) return;
	mAppend(dParent, createElementFromHTML(`<${ttag}>Settings for <span style='color:${g.color}'>${g.friendly}</span></${ttag}>`));
	let nGroupSpecific = mInputGroup(dParent);
	setzeEineZahl(nGroupSpecific, 'trials', 3, ['trials']);
	setzeEineCheckbox(nGroupSpecific, 'show hint', true, ['showHint']);
}
function createStandardDeck() { return _createDeck(); }
function createStandardItems(onClickPictureHandler, ifs = {}, options = {}, keys, labels) {
	//#region prelim: default ifs and options, keys & infos
	if (nundef(Settings)) Settings = {};
	let infos = keys.map(k => (isdef(Settings.language) ? getRandomSetItem(Settings.language, k) : symbolDict[k]));
	let bg = isdef(options.colorKeys) ? 'white' : (i) => options.sameBackground ? computeColor('random') : 'random';
	let fg = (i, info, item) => colorIdealText(item.bg);
	let defIfs = { bg: bg, fg: fg, label: isdef(labels) ? labels : (i, info) => info.best, contrast: .32, fz: 20, padding: 3 };
	let defOptions = {
		showLabels: Settings.labels == true, shufflePositions: true, sameBackground: true,
		showRepeat: false, repeat: 1, onclick: onClickPictureHandler, iStart: 0
	};
	ifs = deepmergeOverride(defIfs, ifs);
	options = deepmergeOverride(defOptions, options);
	//#endregion
	//#region phase1: make items: hier jetzt mix and match
	let items = zItems(infos, ifs, options);
	if (options.repeat > 1) items = zRepeatEachItem(items, options.repeat, options.shufflePositions);
	if (isdef(options.colorKeys)) items = zRepeatInColorEachItem(items, options.colorKeys);
	items.map(x => x.label = x.label.toUpperCase());
	//#endregion phase1
	return [items, ifs, options];
}
function createStandardItemsS(onClickPictureHandler, ifs = {}, options = {}, keys, labels) {
	if (nundef(Settings)) Settings = {};
	let lang = isdef(Settings.language) ? Settings.language : 'E';
	let defShowLabels = isdef(Settings.labels) && Settings.labels == true;
	let infos = keys.map(k => Syms[k]);
	infos.map(x => x.best = x['best' + lang]);
	console.log(infos.map(x => x.best));
	let bg = isdef(options.colorKeys) ? 'white' : (i) => options.sameBackground ? computeColor('random') : 'random';
	let fg = (i, info, item) => colorIdealText(item.bg);
	let defIfs = { bg: bg, fg: fg, label: isdef(labels) ? labels : (i, info) => info.best, contrast: .32, fz: 20, padding: 10 };
	let defOptions = { showLabels: defShowLabels, shufflePositions: true, sameBackground: true, showRepeat: false, repeat: 1, onclick: onClickPictureHandler, iStart: 0 };
	ifs = deepmergeOverride(defIfs, ifs);
	options = deepmergeOverride(defOptions, options);
	let items = zItems(infos, ifs, options);
	if (options.repeat > 1) items = zRepeatEachItem(items, options.repeat, options.shufflePositions);
	if (isdef(options.colorKeys)) items = zRepeatInColorEachItem(items, options.colorKeys);
	items.map(x => x.label = x.label.toUpperCase());
	return [items, ifs, options];
}
function createStaticUi(area, R) {
	ensureUiNodes(R);
	let n = R.tree;
	recUi(n, R, area);
}
function createSTree(n, idParent, R) {
	n = createNode(n, idParent, R);
	if (isContainerType(n.type)) {
		let prop = RCONTAINERPROP[n.type];
	}
}
function createSubtitledPage(bg = 'silver', title = 'Aristocracy', subtitle = '', footer = 'a game by F. Ludos') {
	setPageBackground(bg);
	createPageDivsFullVisibleArea({
		title: { h: 42, family: 'AlgerianRegular', fz: 36 },
		subtitle: { h: 30, fz: 16 },
		titleLine: { h: 5, bg: '#00000080' },
	}, { bg: '#00000050' }, { footer: { h: 30, fz: 16 } }, {});
	dTitle.innerHTML = title;
	dSubtitle.innerHTML = subtitle;
	dFooter.innerHTML = footer;
	addDummy();
}
function createSuccessMarker(sz) {
	let d = mCreate('div');
	d.innerHTML = 'J';
	mClass(d, 'feedbackMarker');
	document.body.appendChild(d);
	Markers.push(d);
	return d;
}
function createTable() {
	let numPlayers = G.numPlayers;
	if (isdef(numPlayers)) {
		idTable = getNextTableId();
		T = { id: idTable, game: G.id };
		getPlayersIncludingU();
		lookupSet(DB, ['tables', idTable], T);
		return idTable;
	}
	return null;
}
function createTableZone(showColor = false) {
	let z = createCardZone('table');
	if (showColor) mStyleX(z.div, { bg: 'white' });
	return z;
}
function createText({ s, parent, style, classes }) {
	let d = mText(s, parent);
	if (isdef(style)) mStyle(d, style);
	if (isdef(classes)) mClass(d, ...classes);
}
function createTooltip(oid) {
	$('#' + oid).unbind('mouseover mouseout');
	$('#' + oid).mouseover(function (e) {
		e.stopPropagation();
		let id = evToId(e);
		if (TT_JUST_UPDATED != id) {
			TT_JUST_UPDATED = id;
			updateTooltipContent(id);
			$('div#tooltip').css({
				display: 'inline-block',
				top: e.pageY,
				left: e.pageX,
			});
		}
	});
	$('#' + oid).mouseout(function (e) {
		if (TT_JUST_UPDATED == oid) TT_JUST_UPDATED = -1;
		e.stopPropagation();
		$('div#tooltip').css({
			top: 0,
			left: 0,
			display: 'none'
		});
	});
}
function createTooltip_hallo(oid) {
	let id = getMainId(oid);
	let ms = getVisual(oid);
	if (!ms) return;
	let ground = ms.ground;
	if (!ground) return;
	let domel = ground;
	console.log('creating tt', domel)
	$(domel).off('mouseover mouseout');
	$(domel).mouseover(function (e) {
		console.log('mouseover', e, evToId(e));
		return;
		let mainId = evToId(e);
		console.log(ev, 'should show tt for', mainId)
		if (TT_JUST_UPDATED != oid) {
			TT_JUST_UPDATED = oid;
			updateTooltipContent(mainId);
			$('div#tooltip').css({
				display: 'inline-block',
				top: e.pageY,
				left: e.pageX,
			});
		}
	});
	$(domel).mouseout(function (e) {
		if (TT_JUST_UPDATED == oid) TT_JUST_UPDATED = -1;
		e.stopPropagation();
		$('div#tooltip').css({
			top: 0,
			left: 0,
			display: 'none'
		});
	});
}
function createUi(n, R, area) {
	if (nundef(n.type)) { n.type = inferType(n); }
	R.registerNode(n);
	decodeParams(n, R, {});
	calcIdUiParent(n, R, area);
	let ui;
	if (nundef(RCREATE[n.type])) ui = mDefault(n, area, R);
	else ui = RCREATE[n.type](n, R, area);
	if (nundef(n.uiType)) n.uiType = 'd';
	if (n.uiType == 'NONE') return ui;
	if (n.uiType != 'childOfBoardElement') {
		if (isBoard(n.uid, R)) { delete n.cssParams.padding; }
		applyCssStyles(n.uiType == 'h' ? mBy(n.uidStyle) : ui, n.cssParams);
	}
	if (!isEmpty(n.stdParams)) {
		switch (n.stdParams.show) {
			case 'if_content': if (!n.content) hide(ui); break;
			case 'hidden': hide(ui); break;
			default: break;
		}
	}
	R.setUid(n, ui);
	return ui;
}
function createUiTestX(n, R, area) {
	if (nundef(n.type)) { n.type = inferType(n); }
	decodeParams(n, R, {});
	calcIdUiParent(n, R, area);
	let ui;
	if (isdef(RCREATE[n.type])) ui = RCREATE[n.type](n, R, area);
	else ui = mDefault(n, R, area);
	if (nundef(n.uiType)) n.uiType = 'd';
	if (n.uiType == 'NONE') return ui;
	if (n.uiType != 'childOfBoardElement') {
		if (isBoard(n.uid, R)) { delete n.cssParams.padding; }
		applyCssStyles(n.uiType == 'h' ? mBy(n.uidStyle) : ui, n.cssParams);
	}
	if (!isEmpty(n.stdParams)) {
		switch (n.stdParams.show) {
			case 'if_content': if (!n.content) hide(ui); break;
			case 'hidden': hide(ui); break;
			default: break;
		}
	}
	ui.id = n.uid;
	return ui;
}
async function createVault() {
	let sIndex = await fetchFileAsText('/RSG/index.html');
	let lines = sIndex.split('\n');
	let res = skipToLine(lines, 0, '#region loading:');
	let resend = skipToLine(lines, res.index, '#endregion');
	let listOfFiles = lines.slice(res.index, resend.index);
	listOfFiles = listOfFiles.map(x => stringBetween(x, '"'));
	listOfFiles = listOfFiles.filter(x => !isEmpty(x.trim()));
	listOfFiles.sort();
	listOfFiles = Array.from(listOfFiles);
	let files = ['assetHelpers', 'assets', 'helpers', 'helpersX'];
	listOfFiles = files.map(x => '/C/' + x + '.js');
	let vault = await documentVault(listOfFiles);
	return vault;
}
function createVisual(id, areaName, { rings = 3, bg = 'darkslategray', fg = 'lime', label, shape = 'circle', iPalette, ipal, fill, x = 0, y = 0, w = 25, h = 25, sPoints, border = 'green', thickness = 1, rounding, path, txt, fz = 12, sz, overlay = true, draw = true } = {}) {
	let parent = getVisual(areaName);
	if (parent.cat == 'd') {
		if (parent.ids.length != 1) {
			error('DIV cannot have more than 1 G child!!!');
		} else {
			parent = getVisual(parent.ids[0]);
			areaName = parent.id;
		}
	}
	let ms = new __O(id, areaName, 'G');
	let options = {};
	let labelOptions = {};
	if (iPalette && ipal) fill = S.pals[iPalette][ipal];
	if (bg) ms.setBg(bg);
	if (fg) { ms.setFg(fg); }
	if (fill) options.fill = fill;
	if (x) options.x = x;
	if (y) options.y = y;
	if (h) { options.h = h; options.sz = h; }
	if (w) { options.w = w; options.sz = w; }
	if (sz) options.sz = sz;
	if (txt) { options.txt = txt; labelOptions.txt = txt; }
	if (label) { labelOptions.txt = label; }
	if (fz) { options.fz = fz; labelOptions.fz = fz; }
	if (sPoints) options.sPoints = sPoints;
	if (border) options.border = border;
	if (thickness) options.thickness = thickness;
	if (rounding) options.rounding = rounding;
	if (path) options.path = './assets/images/transpng/' + path + '.png';
	if (rings) {
	} else rings = 1;
	dSize = Math.max(w / 6, 5);
	for (let i = 0; i < rings; i++) {
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
		options.w -= dSize;
		options.sz -= dSize;
		options.h -= dSize;
	}
	if (label) {
		ms.text(labelOptions);
	}
	if (h) { options.h = h; options.sz = h; }
	if (w) { options.w = w; options.sz = w; }
	if (sz) options.sz = sz;
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
	if (draw) ms.attach();
	return ms;
}
function createWordInputs(words, dParent, idForContainerDiv = 'seqContainer', sep = null, styleContainer = {}, styleWord = {}, styleLetter = {}, styleSep = {}, colorWhiteSpaceChars = true, preserveColorsBetweenWhiteSpace = true) {
	if (isEmpty(styleWord)) {
		let sz = 80;
		styleWord = {
			margin: 10, padding: 4, rounding: '50%', w: sz, h: sz, display: 'flex', fg: 'lime', bg: 'yellow', 'align-items': 'center',
			border: 'transparent', outline: 'none', fz: sz - 25, 'justify-content': 'center',
		};
	}
	let dContainer = mDiv(dParent);
	if (!isEmpty(styleContainer)) mStyleX(dContainer, styleContainer); else mClass(dContainer, 'flexWrap');
	dContainer.id = idForContainerDiv;
	let inputGroups = [];
	let charInputs = [];
	let iWord = 0;
	let idx = 0;
	let numWords = words.length;
	let wheel = getHueWheel(G.color, 40, numWords <= 4 ? 60 : numWords <= 10 ? 30 : 15, 0);
	wheel = wheel.map(x => colorHSLBuild(x, 100, 50));
	wheel = shuffle(wheel);
	let wheel1 = colorPalShadeX(colorFrom(wheel[0]), numWords);
	wheel = jsCopy(wheel1);
	if (G.op == 'plus') wheel.reverse();
	for (const w of words) {
		let dGroup = mDiv(dContainer);
		mStyleX(dGroup, styleWord);
		let bg = wheel[iWord]; // dGroup.style.backgroundColor=randomColorX(G.color,40,60,0,50,50);//'yellow';//randomColorX(G.color,70,80);
		dGroup.style.backgroundColor = bg;
		dGroup.style.color = colorIdealText(bg);
		dGroup.id = idForContainerDiv + '_' + iWord;
		let g = { dParent: dContainer, word: w, iWord: iWord, div: dGroup, oStyle: styleWord, ofg: dGroup.style.color, obg: dGroup.style.backgroundColor };
		inputGroups.push(g);
		let inputs = [];
		let iLetter = 0;
		let wString = w.toString();
		for (const l of wString) {
			let dLetter = mDiv(dGroup);
			if (!isEmpty(styleLetter)) mStyleX(dLetter, styleLetter);
			dLetter.innerHTML = l;
			let inp = { group: g, div: dLetter, letter: l, iLetter: iLetter, index: idx, oStyle: styleLetter, ofg: dLetter.style.color, obg: dLetter.style.backgroundColor };
			charInputs.push(inp);
			inputs.push(inp);
			iLetter += 1; idx += 1;
		}
		g.charInputs = inputs;
		if (iWord < words.length - 1 && isdef(sep)) {
			let dSep = mDiv(dContainer);
			dSep.innerHTML = sep;
			if (isdef(styleSep)) mStyleX(dSep, styleSep);
		}
		iWord += 1;
	}
	return { words: inputGroups, letters: charInputs };
}
function cRect(x, y, w, h, styles = null, ctx = null) {
	if (nundef(ctx)) { ctx = CX; if (!ctx) return; }
	if (styles) cStyle(styles, ctx);
	if (isdef(styles.bg) || nundef(styles.fg)) ctx.fillRect(x, y, w, h);
	if (isdef(styles.fg)) ctx.strokeRect(x, y, w, h);
}
function cropImageCorrectly(img, mindCorners = false) {
	let sz = SZ_UPLOAD_CANVAS;
	let canvas = mBy('canvas1');
	let cw, ch, iw, ih, fw, fh, f, padw, padh, padmin = mindCorners ? sz * .1 : 0;
	cw = ch = sz;
	iw = img.naturalWidth;
	ih = img.naturalHeight;
	fw = cw / iw;
	fh = ch / ih;
	f = Math.min(fw, fh);
	iw *= f;
	ih *= f;
	padw = (cw - iw) / 2;
	padh = (ch - ih) / 2;
	let dx, dy, cwNet, chNet;
	if (padw < padmin && padh < padmin) {
		padw = padh = padmin;
		cwNet = cw - 2 * padmin;
		chNet = ch - 2 * padmin;
		iw = img.naturalWidth;
		ih = img.naturalHeight;
		fw = cwNet / iw;
		fh = chNet / ih;
		f = Math.min(fw, fh);
		iw *= f;
		ih *= f;
	}
	let ctx = canvas.getContext("2d");
	let color = getBackgroundColor(img, ctx);
	ctx.clearRect(0, 0, sz, sz);
	drawColoredCircle(canvas, sz, color, color);
	ctx.drawImage(img, padw, padh, iw, ih);
	ctx.globalCompositeOperation = 'destination-in';
	ctx.beginPath();
	ctx.arc(cw / 2, ch / 2, ch / 2, 0, Math.PI * 2);
	ctx.closePath();
	ctx.fill();
}
function cRound(dParent, styles = {}, id) {
	styles.w = valf(styles.w, Card.sz);
	styles.h = valf(styles.h, Card.sz);
	styles.rounding = '50%';
	return cBlank(dParent, styles, id);
}
function cSetOrigin(ctx, x, y) {
	ctx.translate(x, y);
}
function cShadow(ctx, color, offx, offy, blur) {
	ctx.shadowColor = color;
	ctx.shadowOffsetX = offx;
	ctx.shadowOffsetY = offy;
	ctx.shadowBlur = blur;
}
function cStyle(styles, ctx) {
	if (nundef(ctx)) { ctx = CX; if (nundef(ctx)) { console.log('ctx undefined!!!!!!!'); return; } }
	const di = { bg: 'fillStyle', fill: 'fillStyle', stroke: 'strokeStyle', fg: 'strokeStyle', thickness: 'lineWidth', thick: 'lineWidth', cap: 'lineCap', ending: 'lineCap' };
	if (isdef(styles)) {
		for (const k in styles) { ctx[isdef(di[k]) ? di[k] : k] = styles[k]; }
	}
}
function cStyle_dep(cvx, fill, stroke, wline, cap) {
	cvx.fillStyle = fill;
	if (isdef(stroke)) cvx.strokeStyle = stroke;
	if (isdef(wline)) cvx.lineWidth = wline;
	if (isdef(cap)) cvx.lineCap = cap;
}
function csv_table_example(dParent) {
	mystring = get_csv_example();
	present_table_from_csv(mystring, dParent);
}
function csv2list(allText, hasHeadings = true) {
	var numHeadings = 11;
	var allTextLines = allText.split(/\r\n|\n/);
	var headings = allTextLines[0].split(',');
	numHeadings = headings.length;
	let entries = allTextLines.splice(1);
	var records = [];
	for (const e of entries) {
		let o = {};
		let values = e.split(',');
		for (let i = 0; i < numHeadings; i++) {
			let k = headings[i];
			o[k] = values[i];
		}
		records.push(o);
	}
	return records;
}
function cTest03_2Hands_transfer() {
	let deck1 = DA.h1.deck;
	let deck2 = DA.h2.deck;
	let item = DA.item;
	deck1.addTop(item.val);
	deck2.remove(item.val);
	iPresentHand_test(dTable, DA.h1);
	iPresentHand_test(dTable, DA.h2);
	iSortHand_test(dTable, DA.h1)
}
function cTest03_2Hands_transferStarts() {
	let h1 = DA.h1.iHand;
	let n1 = h1.items.length;
	let h2 = DA.h2.iHand;
	let n2 = h2.items.length;
	let c = chooseRandom(h2.items);
	DA.item = c;
	let w = c.w;
	let ov = w / 4;
	let xOffset = n1 * ov;
	console.log('w', w, 'ov', ov, 'xOffset', xOffset)
	iMoveFromTo(c, h2.div, h1.div, cTest03_2Hands_transfer, { x: xOffset, y: 0 });
}
function cTest03_2HandsRandom() {
	let h1 = iMakeHand_test(dTable, [33, 7, 1, 2, 3, 4], 'h1');
	let h2 = iMakeHand_test(dTable, [13, 14, 15, 16, 17], 'h2');
	setTimeout(cTest03_2Hands_transferStarts, 1000);
}
function cTest04_2HandsRandom() {
	let iarr = [33, 7, 1, 2, 3, 4], dParent = dTable, id = 'h1';
	let data = DA[id] = {};
	let h = data.deck = new DeckClass();
	h.init(iarr);
	let redo = true;
	h = data;
	if (nundef(h.zone)) {
		let nmax = 10, padding = 10;
		let sz = netHandSize(nmax);
		h.zone = mZone(dParent, { w: sz.w, h: sz.h, bg: 'random', padding: padding, rounding: 10 });
	} else {
		clearElement(h.zone);
	}
	if (nundef(h.iHand)) {
		let items = i52(h.deck.cards());
		h.iHand = iSplay(items, h.zone);
	} else if (redo) {
		clearElement(h.zone);
		let items = i52(h.deck.cards());
		h.iHand = iSplay(items, h.zone);
	}
	let h2 = iMakeHand([13, 14, 15, 16, 17], dParent, {}, 'h2');
	setTimeout(cTest03_2Hands_transferStarts, 1000);
}
function cTest05() {
	setBackgroundColor(null, 'random')
	mStyle(dTable, { h: 400, bg: 'black', padding: 10 });
	let SPEC = { layout: ['T T', 'H A'], showAreaNames: true };
	let s = '';
	let m = [];
	for (const line of SPEC.layout) {
		s += '"' + line + '" ';
		let letters = line.split(' ');
		let arr = [];
		for (const l of letters) { if (!isEmpty(l)) arr.push(l); }
		m.push(arr);
	}
	console.log('m', m, '\ns', s); return;
	let rows = SPEC.layout.length;
	let hCard = 110;
	let hTitle = 20;
	let gap = 4;
	let hGrid = rows * (hCard + hTitle) + gap * (rows + 1);
	let wGrid = '80%';
	let dGrid = mDiv(dTable, { h: hGrid, w: wGrid, 'grid-template-areas': s, bg: 'yellow' });
}
function cTest05B() {
	let dGridContainer = mDiv100(dTable, { bg: 'yellow' });
	let areas = mAreas(dGridContainer);
	areas.map(x => mCenterCenterFlex(x.div));
	let dGrid = dGridContainer.children[0];
	mStyle(dGrid, { gap: 5, bg: 'blue', box: true, padding: 5 })
	console.log(dTrick, dGridContainer.children[0]);
	areas.map(x => mStyle(x.div, { h: 110 }));
}
function cTest10() {
	let layout = ['T', 'H A'];
	let x = createGridLayout(dTable, layout);
	console.log('x', x);
}
function cTitleArea(card, h, styles, classes) {
	let dCard = iDiv(card);
	let dTitle = mDiv(dCard, { w: '100%', h: h, overflow: 'hidden', upperRounding: card.rounding });
	let dMain = mDiv(dCard, { w: '100%', h: card.h - h, lowerRounding: card.rounding });
	iAdd(card, { dTitle: dTitle, dMain: dMain });
	if (isdef(styles)) mStyle(dTitle, styles);
	return [dTitle, dMain];
}
function cumulative_distribution(from, to, mean, stdev, n = 0) {
	function cdfNormal(x, mean = 100, standardDeviation = 15) {
		return (1 - math.erf((mean - x) / (Math.sqrt(2) * standardDeviation))) / 2;
	}
	let res;
	if (to < from) { let h = from; from = to; to = h; }
	assertion(from <= to, 'MATH!!!!!!!!!!!!!!!??????????????????????')
	if (from <= mean && to >= mean) {
		let kleiner_als_from = cdfNormal(from, mean, stdev); console.log(kleiner_als_from)
		let kleiner_als_mean = cdfNormal(mean, mean, stdev); console.log(kleiner_als_mean)
		let res1 = kleiner_als_mean - kleiner_als_from; console.log('res1', res1);
		let kleiner_als_to = cdfNormal(to, mean, stdev); console.log(kleiner_als_to)
		let res2 = kleiner_als_to - kleiner_als_mean; console.log('res2', res2);
		console.log(res1 + res2); res = res1 + res2;
	} else {
		let kleiner_als_to = cdfNormal(to, mean, stdev); console.log(kleiner_als_to)
		let kleiner_als_from = cdfNormal(from, mean, stdev); console.log(kleiner_als_from)
		res = kleiner_als_to - kleiner_als_from; console.log('res', res);
	}
	return 100 * res.toFixed(n);
}
function cv_init_origin(canvas, origin) {
	let cv = canvas.cv;
	if (nundef(origin)) origin = 'cc';
	let pt = origin;
	if (isString(origin)) {
		let v = origin[0], h = origin[1];
		let y = v == 't' ? 0 : v == 'c' ? cv.height / 2 : cv.height;
		let x = h == 'l' ? 0 : h == 'c' ? cv.width / 2 : cv.width;
		pt = { x: x, y: y };
	}
	return pt;
}
function cycle(x, min, max) { let d = max - min; return (x - min) % d + min; }
//#endregion

//#region functions D
function dachain(ms = 0) {
	console.log('TestInfo', TestInfo)
	if (!isEmpty(DA.chain) && !(DA.test.running && DA.test.step == true)) {
		dachainext(ms);
	} else if (isEmpty(DA.chain)) console.log('DA.chain EMPTY ' + DA.test.iter)
}
function dachain_orig(ms = 0) {
	if (!isEmpty(DA.chain)) {
		dachainext(ms);
	} else console.log('DA.chain EMPTY ' + ITER)
}
function dachainext(ms = 0) {
	let f = DA.chain.shift();
	if (ms > 0) TOMan.TO[getUID('f')] = setTimeout(f, ms);
	else f();
}
function danext() { if (isdef(DA.next)) { let f = DA.next; DA.next = null; f(); } }
function darkerColor(r, g, b) {
	let hsv = rgbToHsv(r, g, b);
	testHelpers(hsv);
	let h = hsv.h;
	let s = hsv.s;
	let v = hsv.v / 2;
	let hsl = hsvToHsl(h, s, v);
	h = hsl.h;
	s = hsl.s * 100;
	let l = hsl.l * 100;
	testHelpers('hsl:', h, s, l);
	return hslToHslaString(h, s, l);
}
function dastaged(r, uname, ms = 0) {
	if (!isEmpty(DA.staged_moves)) {
		let action = DA.staged_moves.shift();
		if (action == 'meld') {
			let a = firstCond(r.actions, x => startsWith(x, `${uname}.hand.`));
			if (!a) { console.log('staged action', action, 'cannot be completed', r.actions); return; } else action = a;
		}
		if (action == 'draw') {
			let a = firstCond(r.actions, x => startsWith(x, `draw.decks.`));
			if (!a) { console.log('staged action', action, 'cannot be completed', r.actions); return; } else action = a;
		}
		if (ms > 0) TOMan.TO[getUID('f')] = setTimeout(() => autoselect_action(r, action, uname), ms);
		else autoselect_action(r, action, uname);
	}
}
function data_from_client(raw) {
	assertion(is_stringified(raw), 'data should be stringified json!!!!!!!!!!!!!!!', raw);
	let js = JSON.parse(raw);
	return js;
}
function date2locale(date) { return date.toLocaleDateString(); }
function db_add_code() {
	let kw = prompt('Enter Keywords');
	let text = dCode.value;
	console.log('saving', kw, text);
	let code = { kw: kw, c: text };
	let data = { table: 'code', item: code };
	lookupAddToList(DB, ['code'], code);
	post_json('http://localhost:3000/db/add/code', code, r => console.log('resp', r));
}
function db_clear_players(friendly) {
	assertion(isdef(GT[friendly]), `table ${friendly} does NOT exist!!!!`);
	let t = GT[friendly];
	for (const pldata of t.playerdata) { pldata.state = null; pldata.player_status = null; }
	return t.playerdata;
}
function db_create(table, rec, db) {
	if (!db) { db = DB; }
	lookupAddToList(db, ['appdata', table], rec);
	return db;
}
function db_delete(table, i, db) {
	if (!db) { db = DB; }
	if (nundef(i)) delete db.appdata[table]; else arrRemovip(lookup(db, ['appdata', table])[i]);
	return db;
}
function db_init(db) { DB = db; return db; }
function db_init_code() {
	let code = [
		{ kw: 'post route', c: `post_json('http://localhost:3000/post/json',o,r=>console.log('resp',r));` },
		{ kw: 'get yaml route', c: `await route_path_yaml_dict('http://localhost:3000/route')` },
		{ kw: 'get json route', c: `await route_path_json('http://localhost:3000/route')` },
	];
	DB.code = code;
	post_json('http://localhost:3000/db/init/code', code, r => console.log('resp', r));
}
function db_list_code() {
	for (const code of DB.code) {
	}
}
function db_new_table(friendly, game, host, players, fen, options) {
	let table = { friendly, game, host, players, fen, options };
	table.modified = Date.now();
	let playerdata = [];
	for (const plname of players) {
		playerdata.push({ name: `${plname}`, state: null, player_status: null });
	}
	let res = { table, playerdata };
	GT[friendly] = res;
	return res;
}
function db_read_playerdata(friendly) {
	assertion(isdef(GT[friendly]), `table ${friendly} does NOT exist!!!!`);
	return GT[friendly].playerdata;
}
function db_read_table(friendly) {
	assertion(isdef(GT[friendly]), `table ${friendly} does NOT exist!!!!`);
	return GT[friendly].table;
}
function db_readall(db) {
	if (!db) { db = DB; }
	return db;
}
function db_save() {
	if (!is_online()) { console.log('not saving! (no internet)'); return; }
	let txt = jsyaml.dump(DB);
	to_server({ db: txt }, 'dbsave');
}
function db_table_exists(friendly) { return isdef(GT[friendly]); }
function db_update(table, i, rec, save = false) {
	if (isdef(DB)) { let list = lookup(DB, ['appdata', table]); list[i] = rec; }
	if (NODEJS) post_json(SERVERURL + `/update`, { table: table, i: i, rec: rec, save: save }, () => console.log('updated db'));
}
function db_write_fen(friendly, fen, scoring = null) {
	assertion(isdef(GT[friendly]), `table ${friendly} does NOT exist!!!!`);
	let t = GT[friendly];
	let table = t.table;
	table.fen = fen; table.scoring = scoring; table.phase = isdef(scoring) ? 'over' : '';
	table.modified = Date.now();
	return table;
}
function db_write_player(friendly, uname, state, player_status) {
	assertion(isdef(GT[friendly]), `table ${friendly} does NOT exist!!!!`);
	let t = GT[friendly];
	let pldata = firstCond(t.playerdata, x => x.name == uname);
	pldata.state = state;
	pldata.player_status = player_status;
	pldata.checked = Date.now();
	return t.playerdata;
}
async function dbInit(appName, dir = '../DATA/') {
	let users = await route_path_yaml_dict(dir + 'users.yaml');
	let settings = await route_path_yaml_dict(dir + 'settings.yaml');
	let addons = await route_path_yaml_dict(dir + 'addons.yaml');
	let games = await route_path_yaml_dict(dir + 'games.yaml');
	let tables = await route_path_yaml_dict(dir + 'tables.yaml');
	DB = {
		id: appName,
		users: users,
		settings: settings,
		games: games,
		tables: tables,
		addons: addons,
	};
	dbSave(appName);
}
async function dbLoad(appName, callback) {
	let url = SERVERURL;
	fetch(url, {
		method: 'GET',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		},
	}).then(async data => {
		let sData = await data.json();
		DB = firstCond(sData, x => x.id == appName);
		if (isdef(callback)) callback();
	});
}
async function dbLoadX() { DB = await route_path_yaml_dict('./DB.yaml'); }
function dbSave() {
	if (NODEJS) {
		let route = `/post/json`;
		let o = { filename: 'db', data: DB }
		let callback = () => console.log('saved db');
		post_json(route, o, callback);
		console.log('full route', route);
	} else console.log('not saved - no app running!')
}
async function dbSaveX(callback) {
	if (USELIVESERVER) {
		return;
	}
	if (BlockServerSend1) { setTimeout(() => dbSaveX(callback), 1000); }
	else {
		let path = './MZZ/DB.yaml';
		let resp = await postData('http://localhost:3000/db', { obj: DB, path: path });
		BlockServerSend1 = false;
		if (callback) callback();
	}
}
function ddStart(ev, source, isCopy = true, clearTarget = false) {
	if (!canAct() || isdef(DDInfo.dragStartHandler) && !DDInfo.dragStartHandler(source)) return;
	ev.preventDefault();
	ev.stopPropagation();
	DDInfo.source = source;
	let d = iDiv(source);
	var clone = DragElem = DDInfo.clone = d.cloneNode(true);
	clone.isCopy = isCopy;
	clone.clearTarget = clearTarget;
	mAppend(document.body, clone);
	mClass(clone, 'dragelem');
	mStyle(clone, { left: ev.clientX - ev.offsetX, top: ev.clientY - ev.offsetY });
	DDInfo.dragOffset = clone.drag = { offsetX: ev.offsetX, offsetY: ev.offsetY };
	document.body.onmousemove = onMovingCloneAround;
	document.body.onmouseup = onReleaseClone;
}
function deactivate_ui() { uiActivated = false; DA.ai_is_moving = true; }
function deactivateChat(key) {
	console.log('deactivate chat', key, ActiveChats[key]);
	mClassRemove(ActiveChats[key].div, 'activeChat'); clearChatWindow();
}
function deactivateFocusGroup() {
	if (Goal.iFocus === null) {
		return;
	}
	let g = Goal.words[Goal.iFocus];
	g.div.style.backgroundColor = g.obg;
	Goal.iFocus = null;
}
function deactivateTooltips() {
	for (const oid in G.table) {
		$('#' + oid).unbind('mouseover mouseout');
	}
	for (const oid in G.players) {
		$('#' + oid).unbind('mouseover mouseout');
	}
}
function deactivateTooltips_hallo() {
	for (const oid in G.table) {
		$('#' + oid).unbind('mouseover mouseout');
	}
	for (const oid in G.players) {
		$('#' + oid).unbind('mouseover mouseout');
	}
}
function deactivateUis(R) {
	for (const uid in R.uiNodes) {
		let n = R.uiNodes[uid];
		if (n.oid && n.ui) {
			n.act.deactivate();
		}
	}
	R.isUiActive = false;
}
function deal1(deck, w, h) {
	deck.cards.forEach(function (card, i) {
		card.setSide('front')
		card.animateTo({
			delay: 1000 + i * 2,
			duration: 500,
			ease: 'quartOut',
			x: Math.random() * w - w / 2,
			y: Math.random() * h - h / 2
		})
	});
}
function dec_g_index(i) { set_g_index(G.i - 1); }
function dec_level_on_losestreak() {
	let players = get_values(Session.cur_players);
	let scores = players.map(x => x.score);
	let min = arrMin(scores);
	let losers = players.filter(x => x.score == min).map(x => x.name);
	let game = Session.cur_game;
	for (const w of losers) {
		let o = lookup(DB.users, [w, 'games', game]);
		o.losestreak = DB.users[w].games[game].losestreak = isdef(o.losestreak) ? o.losestreak + 1 : 1;
		if (o.losestreak >= 1) {
			let currentlevel = get_startlevel(w, game);
			lookupSetOverride(DB.users, [w, 'games', game, 'startlevel'], Math.max(currentlevel - 1, 0));
			delete o.losestreak;
		}
	}
}
function Deck() {
	this.cardWidth = 55;
	this.cardHeight = 80;
	this.cardSuit = 13;
	this.cardTotal = 52;
	this.cardURL = "../images/cards2/";
	this.cardReverse = "reverse";
	this.cardName = "";
	this.cardExtension = ".png";
	this.throwed = new Array(this.cardTotal);
	this.throwCard = function () {
		var id = Math.floor(Math.random() * this.throwed.length);
		while (this.throwed[id])
			if (++id == this.throwed.length)
				id = 0;
		this.throwed[id] = true;
		return (id)
	}
	this.cardSrc = function (id, reverse) {
		var srcname = (reverse) ? this.cardReverse : (this.cardName + String(id));
		return (this.cardURL + srcname + this.cardExtension);
	}
}
function deck_add(deck, n, arr) { let els = deck_deal(deck, n); els.map(x => arr.push(x)); return arr; }
function deck_deal(deck, n) { return deck.splice(0, n); }
function deck_deal_safe_ferro(fen, plname, n) {
	if (fen.deck.length < n) {
		fen.deck = fen.deck.concat(fen.deck_discard.reverse());
		fen.deck_discard = [];
	}
	let new_cards = deck_deal(fen.deck, n);
	fen.players[plname].hand.push(...new_cards);
	new_cards.map(x => lookupAddToList(fen.players[plname], ['newcards'], x));
	return new_cards;
}
function deck_deal_safe_fritz(fen, plname, n = 1) {
	if (fen.deck.length < n) {
		fen.deck = create_fen_deck('n', fen.num_decks, 0);
		fen.loosecards.push('*Hn');
	}
	let new_cards = deck_deal(fen.deck, n);
	fen.players[plname].hand.push(...new_cards);
	new_cards.map(x => lookupAddToList(fen.players[plname], ['newcards'], x));
	return new_cards;
}
function deck52Back(card) {
	card.elem.setAttribute('class', 'card');
}
function deck52Prep(card) {
	let elem = card.elem;
	var suitName = iToSuit52_G(card.suit);
	if (card.suitName == 'joker' && card.rank > 3)
		elem.setAttribute('class', 'card joker');
	else elem.setAttribute('class', 'card ' + suitName + ' rank' + card.rank);
}
function deck52Update(card) { deck52Prep(card); }
function deckAPrep(card) {
	let elem = card.elem;
	let i = card.i;
	elem.setAttribute('class', 'card joker');
}
function deckEmptyBack(card) {
	card.elem.setAttribute('class', 'card');
}
function deckEmptyPrep(card) {
	let elem = card.elem;
	elem.setAttribute('class', 'card joker');
}
function deckEmptyUpdate(card) { deckEmptyPrep(card); }
function deckWiseBack(card) {
	card.elem.setAttribute('class', 'card');
}
function deckWiseUpdate(card) { deckEmptyPrep(card); }
function decodeColor(c) {
	let parts = c.split(' ');
	if (parts.length == 1) return c;
	else if (parts.length == 2 && (parts[1][0] == '.' || parts[1][0] == '0')) {
		return colorFrom(parts[0], Number(parts[1]));
	} else {
		let n = Number(parts[1]);
		let lumParam = n / 50 - 1.0;
		let cAltered = colorShade(lumParam, parts[0]);
		if (parts.length > 2) { cAltered = colorFrom(cAltered, Number(parts[2])); }
		return cAltered;
	}
}
function decodeParams(n, R, defParams) {
	if (isdef(n.params) && isdef(n.params._NODE)) {
		let spk = n.params._NODE;
		let oParams = R.getSpec()[spk];
		for (const k in oParams) {
			n.params[k] = oParams[k];
		}
		delete n.params._NODE;
		let r = R.rNodes[n.uid];
		r.params = jsCopy(n.params);
	}
	if (nundef(n.params)) n.params = lookup(R.defs, [n.type, 'params']);
	if (!n.params) n.params = {};
	let inherited = lookup(defParams, [n.type, 'params']);
	let defaults = lookup(R.defs, [n.type, 'params']);
	let defs = n.params.inherit ? inherited : defaults ? defaults : {};
	if (n.type != 'grid') n.params = mergeOverrideArrays(defs, n.params);
	let o = isdef(n.oid) ? R.getO(n.oid) : null;
	let pNew = {};
	if (o) {
		pNew = mapValues(o, n.params, defs, R.getSpec());
		for (const k in pNew) { pNew[k] = calcContentFromData(n.oid, o, pNew[k], R); }
	} else pNew = n.params;
	if (isdef(pNew.bg) || isdef(pNew.fg)) {
		[pNew.bg, pNew.fg] = getExtendedColors(pNew.bg, pNew.fg);
	}
	let pNew1 = {};
	for (const k in pNew) { if (nundef(pNew[k])) continue; pNew1[k] = pNew[k]; }
	pNew = pNew1;
	for (const k in pNew) { if (COLORPARAMNAMES[k]) pNew[k] = decodeColor(pNew[k]); }
	let params = paramsToCss(pNew);
	n.params = pNew;
	n.typParams = params.typ;
	n.cssParams = params.css;
	n.stdParams = params.std;
}
function decodePropertyPath(o, path) {
	if (isString(path) && path[0] == '.') {
		let props = path.split('.').slice(1);
		return lookup(o, props);
	}
}
function decompose_2d_matrix(mat) {
	var a = mat[0];
	var b = mat[1];
	var c = mat[2];
	var d = mat[3];
	var e = mat[4];
	var f = mat[5];
	var delta = a * d - b * c;
	let result = {
		translation: [e, f],
		rotation: 0,
		scale: [0, 0],
		skew: [0, 0],
	};
	if (a != 0 || b != 0) {
		var r = Math.sqrt(a * a + b * b);
		result.rotation = b > 0 ? Math.acos(a / r) : -Math.acos(a / r);
		result.scale = [r, delta / r];
		result.skew = [Math.atan((a * c + b * d) / (r * r)), 0];
	} else if (c != 0 || d != 0) {
		var s = Math.sqrt(c * c + d * d);
		result.rotation =
			Math.PI / 2 - (d > 0 ? Math.acos(-c / s) : -Math.acos(c / s));
		result.scale = [delta / s, s];
		result.skew = [0, Math.atan((a * c + b * d) / (s * s))];
	} else {
	}
	return result;
}
function decomposeMatrix(matrix) {
	// @see https://gist.github.com/2052247
	var px = deltaTransformPoint(matrix, { x: 0, y: 1 });
	var py = deltaTransformPoint(matrix, { x: 1, y: 0 });
	var skewX = (180 / Math.PI) * Math.atan2(px.y, px.x) - 90;
	var skewY = (180 / Math.PI) * Math.atan2(py.y, py.x);
	return {
		translateX: matrix.e,
		translateY: matrix.f,
		scaleX: Math.sqrt(matrix.a * matrix.a + matrix.b * matrix.b),
		scaleY: Math.sqrt(matrix.c * matrix.c + matrix.d * matrix.d),
		scale: Math.sqrt(matrix.a * matrix.a + matrix.b * matrix.b),
		skewX: skewX,
		skewY: skewY,
		rotation: skewX
	};
}
function decorateVisual(ms, { draw = true, rings = 3, bg = 'darkslategray', fg = 'lime', label, shape = 'circle', palette, ipal, fill, x = 0, y = 0, w = 25, h = 25, sPoints, border = 'green', thickness = 1, rounding, path, txt, fz = 12, sz, overlay = true } = {}) {
	console.log('decorate', ms)
	let options = {};
	let labelOptions = {};
	if (palette && ipal) fill = palette[ipal];
	else if (ipal) fill = S.pal[ipal];
	if (bg) ms.setBg(bg);
	if (fg) { ms.setFg(fg); }
	if (fill) options.fill = fill;
	if (x) options.x = x;
	if (y) options.y = y;
	if (h) { options.h = h; options.sz = h; }
	if (w) { options.w = w; options.sz = w; }
	if (sz) options.sz = sz;
	if (txt) { options.txt = txt; labelOptions.txt = txt; }
	if (label) { labelOptions.txt = label; }
	if (fz) { options.fz = fz; labelOptions.fz = fz; }
	if (sPoints) options.sPoints = sPoints;
	if (border) options.border = border;
	if (thickness) options.thickness = thickness;
	if (rounding) options.rounding = rounding;
	if (path) options.path = './assets/images/transpng/' + path + '.png';
	if (rings) {
	} else rings = 1;
	dSize = Math.max(w / 6, 5);
	for (let i = 0; i < rings; i++) {
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
		options.w -= dSize;
		options.sz -= dSize;
		options.h -= dSize;
	}
	if (label) {
		ms.text(labelOptions);
	}
	if (h) { options.h = h; options.sz = h; }
	if (w) { options.w = w; options.sz = w; }
	if (sz) options.sz = sz;
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
	if (draw) ms.attach();
	return ms;
}
function decrease_handicap_if_winstreak(winners, game) {
	for (const w of winners) {
		let o = lookupSet(DB.users, [w, 'games', game], {});
		o.winstreak = DB.users[w].games[game].winstreak = isdef(o.winstreak) ? o.winstreak + 1 : 1;
		if (o.winstreak >= 3) {
			lookupSetOverride(DB.users, [w, 'games', game, 'startlevel'], Math.min(o.startlevel + 1, Session.maxlevel));
			delete o.winstreak;
			console.log('...startlevel of', w, 'is increased to', get_startlevel(w, game));
		}
		console.log('user', w, 'db entry', o);
	}
}
function deepmerge(target, source, optionsArgument) {
	var array = Array.isArray(source);
	var options = optionsArgument || { arrayMerge: defaultArrayMerge }
	var arrayMerge = options.arrayMerge || defaultArrayMerge
	if (array) {
		return Array.isArray(target) ? arrayMerge(target, source, optionsArgument) : cloneIfNecessary(source, optionsArgument)
	} else {
		return mergeObject(target, source, optionsArgument)
	}
}
function deepmergeOverride(base, drueber) { return mergeOverrideArrays(base, drueber); }
function deepmergeTest() {
	let o1 = { a: 1, c: 1 };
	let o2 = { a: 2, b: 2 };
	let o3 = deepmerge(o1, o2);
	logVals('___\no1', o1); logVals('o2', o2); logVals('o3', o3);
	o1.a = 11;
	logVals('___\no1', o1); logVals('o2', o2); logVals('o3', o3);
	o2.a = 22;
	logVals('___\no1', o1); logVals('o2', o2); logVals('o3', o3);
	o3.a = 33;
	logVals('___\no1', o1); logVals('o2', o2); logVals('o3', o3);
}
function deepmergeTestArray() {
	let o1 = { a: 1, b: [1, 2, 3], c: 1 };
	let o2 = { a: 2, b: [2, 3, 4, 5] };
	let o3 = deepmerge(o1, o2);
	logVals('___\no1', o1); logVals('o2', o2); logVals('o3', o3);
	o3 = mergeOverrideArrays(o1, o2);
	logVals('___\no1', o1); logVals('o2', o2); logVals('o3', o3);
	o3 = safeMerge(o1, o2);
	logVals('___\no1', o1); logVals('o2', o2); logVals('o3', o3);
}
function default_allowDrop(ev) { ev.preventDefault(); }
function default_item_serializer(o) { return copyKeys(o, {}, { live: true }); }
function defaultArrayMerge(target, source, optionsArgument) {
	var destination = target.slice()
	source.forEach(function (e, i) {
		if (typeof destination[i] === 'undefined') {
			destination[i] = cloneIfNecessary(e, optionsArgument)
		} else if (isMergeableObject(e)) {
			destination[i] = deepmerge(target[i], e, optionsArgument)
		} else if (target.indexOf(e) === -1) {
			destination.push(cloneIfNecessary(e, optionsArgument))
		}
	})
	return destination
}
function defaultPresentationNode(oid, o, R) {
	let nrep = {};
	let objLists = getElementLists(o);
	if (isEmpty(objLists)) {
		let litProp = firstCondDictKV(o, (k, v) => k != 'obj_type' && isLiteral(v));
		let content = litProp ? o[litProp] : o.obj_type + ' ' + oid;
		nrep = { type: 'info', data: content };
	} else {
		let key1 = Object.keys(objLists)[0];
		let list1 = Object.values(objLists)[0];
		console.log('defaultPresentationNode1: first list is:', key1, list1);
		nrep = { type: 'list', pool: list1, elm: '.' + key1 };
	}
	return nrep;
}
function defaultUIFunc(mk) {
	let el = mk.elem = mCreate('div');
	el.style.backgroundColor = randomColor();
	el.innerHTML = formatJson(mk.o);
	el.style.textAlign = 'left';
}
function defaultVisualExists(oid) { return firstCond(oid2ids[oid], x => x[0] == 'd'); }
function degrade_bars(dec) {
	let res = {};
	for (const color in DA.bars) {
		let bar = DA.bars[color];
		let val = Math.max(0, bar.w - dec);
		set_new_goal(color, val, 1);
		res[color] = val;
	}
	return res
}
function delete_current_table() {
	if (nundef(Session.cur_tid)) return;
	to_server(Session.cur_tid, 'delete_table');
	Session.cur_tid = null;
	Session.cur_table = null;
}
function delete_message(e) {
	if (confirm("Are you sure you want to delete this message??")) {
		var msgid = e.target.getAttribute("msgid");
		get_data({
			rowid: msgid
		}, "delete_message");
		get_data({
			username: CURRENT_CHAT_USER,
			seen: SEEN_STATUS
		}, "chats_refresh");
	}
}
function delete_table(friendly) { stop_game(); phpPost({ friendly: friendly }, 'delete_table'); }
function delete_thread(e) {
	if (confirm("Are you sure you want to delete this whole thread??")) {
		get_data({
			username: CURRENT_CHAT_USER
		}, "delete_thread");
		get_data({
			username: CURRENT_CHAT_USER,
			seen: SEEN_STATUS
		}, "chats_refresh");
	}
}
function deleteActions() { deleteAll('d', 'a'); }
function deleteAll(rsgType, idoType) {
	let ids = IdOwner[idoType];
	ids = isdef(IdOwner[idoType]) ? IdOwner[idoType].filter(x => x[0] == rsgType) : []; for (const id of ids) deleteRSG(id);
}
function deleteDefaultObjects() { deleteAll('d', 't'); }
function deleteDefaultPlayers() { deleteAll('d', 'p'); }
function deleteOid(oid) {
	let uids = jsCopy(oid2ids[oid]);
	for (const uid of uids) {
		if (uid[2] == 'r' || uid[2] == 'l') continue;
		if (UIS[uid]) deleteRSG(uid);
	}
}
function deleteRSG(id) {
	let mobj = UIS[id];
	if (nundef(mobj)) {
		error('object that should be deleted does NOT exist!!!! ' + id);
	}
	unhighlightMsAndRelatives(null, mobj)
	unlink(id);
	_deleteFromOwnerList(id);
	mobj.destroy();
	DELETED_IDS.push(id);
	DELETED_THIS_ROUND.push(id);
	delete UIS[id];
}
function deltaTransformPoint(matrix, point) {
	var dx = point.x * matrix.a + point.y * matrix.c + 0;
	var dy = point.x * matrix.b + point.y * matrix.d + 0;
	return { x: dx, y: dy };
}
function describe(d) {
	console.log('_________________');
	console.log('innerHTML', d.innerHTML);
	console.log('firstChild', d.firstChild);
	console.log('d', d)
}
function DeSelectSq(sq) {
	$('.Square').each(function (index) {
		if (PieceIsOnSq(sq, $(this).position().top, $(this).position().left) == BOOL.TRUE) {
			$(this).removeClass('SqSelected');
		}
	});
}
function DeselectSq(sq) {
	if (GameController.BoardFlipped == BOOL.TRUE) {
		sq = MIRROR120(sq);
	}
	$(".Square").each(function (index) {
		if ((RanksBrd[sq] == 7 - Math.round($(this).position().top / 60)) && (FilesBrd[sq] == Math.round($(this).position().left / 60))) {
			$(this).removeClass('SqSelected');
		}
	});
}
function destroyInfoboxFor(oid) { let id = makeIdInfobox(oid); if (UIS[id]) deleteRSG(id); }
function destroySudokuRule(pattern, rows, cols) {
	let sz = Math.min(rows, cols);
	let [r1, r2] = choose(range(0, sz - 1), 2);
	let c = chooseRandom(range(0, sz - 1));
	if (coin(50)) { arrSwap2d(pattern, r1, c, r2, c); }
	else if (coin(50)) { arrSwap2d(pattern, c, r1, c, r2); }
}
function detect_size_from_styles(st = {}, defsize = 50) {
	return [valf(st.w, st.sz, defsize), valf(st.w, st.sz, defsize)];
}
function detectArea(dParent, w, h) {
	let rect = isdef(dParent) ? getRect(dParent) : null;
	if (nundef(w)) { w = rect ? rect.w : window.innerWidth; }
	if (nundef(h)) { h = rect ? rect.h : window.innerHeight; }
	return [w, h];
}
function detectBoard(soDict, loc) {
	timit.showTime('*** board start ***')
	let idBoard = firstCondDict(soDict, x => isBoardObject(x));
	if (isdef(idBoard)) {
		let sBoard = soDict[idBoard];
		let idField0 = sBoard.fields._set[0]._obj;
		let f0 = soDict[idField0];
		let numNei = f0.neighbors.length;
		if (numNei == 6) return _hexGrid(loc, idBoard, sBoard, soDict); else return _quadGrid(loc, idBoard, sBoard, soDict);
	}
	return null;
}
function detectBoardOidAndType(oid, boardType, R) {
	if (!oid) oid = detectFirstBoardObject(R);
	let oBoard = R.getO(oid);
	if (!boardType) boardType = detectBoardType(oBoard, R);
	let fids = getElements(oBoard.fields);
	let r0 = 1000; let c0 = 1000;
	for (const fid of fids) {
		let f = R.getO(fid);
		if (f.row < r0) r0 = f.row;
		if (f.col < c0) c0 = f.col;
	}
	return [oid, boardType, r0, c0];
}
function detectBoardParams(n, R) {
	let allParams = {};
	let boardDefs = R.defs.grid;
	if (isdef(boardDefs)) {
		let specific = R.defs[n.boardType];
		if (isdef(specific)) boardDefs = deepmerge(boardDefs, specific);
		if (isdef(boardDefs.params)) {
			if (isdef(n.params)) allParams = deepmerge(boardDefs.params, n.params);
			else allParams = boardDefs.params;
		}
	}
	n.bi.params = { fields: {}, corners: {}, edges: {} };
	let justBoardParams = jsCopy(allParams);
	for (const name of ['fields', 'corners', 'edges']) {
		n.bi.params[name] = justBoardParams[name];
		delete justBoardParams[name];
	}
	return justBoardParams;
}
function detectBoardType(oBoard, R) {
	let fid0 = getElements(oBoard.fields)[0];
	let nei = R.getO(fid0).neighbors;
	let len = nei.length;
	return len == 6 ? 'hexGrid' : 'quadGrid';
}
function detectDecks(tableObjects, areaName) {
	let deckKeys = allCondDict(tableObjects, x => isDeckObject(x)); if (isEmpty(deckKeys)) return null;
	S.settings.hasCards = true;
	let deckArea = makeDeckArea(areaName, deckKeys.length);
	let msDecks = deckKeys.map(x => makeDeckSuccess(x, tableObjects[x], deckArea.id));
	lineupDecks(msDecks, deckArea);
	return deckKeys;
}
function detectFirstBoardObject(R) {
	for (const oid in R._sd) {
		let o = R.getO(oid);
		if (isdef(o.map) && isdef(o.fields)) return oid;
	}
}
function detectItemInfoKey(itemInfoKey) {
	let item, info, key;
	if (isString(itemInfoKey)) { key = itemInfoKey; info = Syms[key]; item = { info: info, key: key }; }
	else if (isDict(itemInfoKey)) {
		if (isdef(itemInfoKey.info)) { item = itemInfoKey; info = item.info; key = item.info.key; }
		else { info = itemInfoKey; key = info.key; item = { info: info, key: key }; }
	}
	return [item, info, key];
}
function detectItems(n) {
	if (isNumber(n)) n = choose(SymKeys, n);
	if (isString(n[0])) n = n.map(x => Syms[x]);
	if (nundef(n[0].info)) n = n.map(x => infoToItem(x));
	return n;
}
function detectSilben(words) {
	const syllableRegex = /[^aeiouy]*[aeiouy]+(?:[^aeiouy]*$|[^aeiouy](?=[^aeiouy]))?/gi;
	return words.match(syllableRegex);
}
function detectSymbolKey(o) {
	if (isdef(o.name)) return o.name;
	let res = null;
	for (const k in o) {
		if (!isLiteral(o[k]) || k == 'obj_type') continue;
		if (k.toLowerCase().includes('name') && isString(o[k])) return o[k];
	}
	let k = firstCondDict(o, x => isLiteral(o[k]));
	if (isdef(k)) return o[k];
}
function detectType(id) {
	let el = document.getElementById(id);
	return getTypeOf(el);
}
function determine_church_turn_order() {
	let [fen, A, uplayer, plorder] = [Z.fen, Z.A, Z.uplayer, Z.plorder];
	let initial = [];
	for (const plname of fen.plorder) {
		let pl = fen.players[plname];
		pl.vps = ari_calc_fictive_vps(fen, plname);
		pl.max_journey_length = ari_get_max_journey_length(fen, plname);
		pl.score = pl.vps * 10000 + pl.max_journey_length * 100 + pl.coins;
		initial.push(pl);
	}
	let sorted = sortByDescending(initial, 'score');
	return sorted.map(x => x.name);
}
function diContent(item) { return isdef(item.live) ? item.live.dContent : null; }
function dict_augment(di, o) { addKeys(o, di); return di; }
function dict_remove(di, keys) {
}
function dict2list(d, keyName = 'id') {
	let res = [];
	for (const key in d) {
		let val = d[key];
		let o;
		if (isDict(val)) { o = jsCopy(val); } else { o = { value: val }; }
		o[keyName] = key;
		res.push(o);
	}
	return res;
}
function dict2olist(d, keyName = 'id') {
	let res = [];
	for (const key in d) {
		let val = d[key];
		let o;
		if (isDict(val)) { o = jsCopy(val); }
		else {
			o = { value: val };
		}
		o[keyName] = key;
		res.push(o);
	}
	return res;
}
function dicti(areaName, oSpec, oid, o) {
	let [num, or, split, bg, fg, id, panels, parent] = getParams(areaName, oSpec, oid);
	parent.style.display = 'inline-grid';
	return parent;
}
function dictOrListToString(x, ifDict = 'keys') {
	let lst = x;
	if (isList(lst) && !isEmpty(lst)) { return lst.join(' '); }
	else if (isDict(lst)) {
		return ifDict == 'keys' ? Object.keys(lst).join(' ')
			: ifDict == 'values' ? Object.keys(lst).join(' ')
				: Object.entries(lst).join(' ');
	}
	else return null;
}
function dictToKeyList(x) { return Object.keys(lst).join(' '); }
function dictToKVList(x) { return Object.entries(lst).join(' '); }
function dictToValueList(x) { return Object.values(lst).join(' '); }
function differInAtMost(req, given, n = 1) {
	let diffs = levDist(req, given);
	return diffs <= n;
}
function diMessage(item) { return isdef(item.live) ? item.live.dMessage : null; }
function disable_bar_ui() {
	for (const k in DA.bars) {
		let bar = DA.bars[k];
		let b = bar.cont.getElementsByTagName('button')[0];
		b.disabled = true;
	}
}
function disable_sidebar() { close_sidebar(); }
function disableButton(id) { disableStyle(id); }
function disableButtonsForMultiplayerGame() {
	if (isReallyMultiplayer) {
		if (iAmStarter()) enableButton('c_b_Restart'); else disableButton('c_b_Restart');
		disableButton('c_b_Step');
		disableButton('c_b_RunToEnd');
	}
}
function disableClick(el) {
	let mobj = 'mobj' in el ? el.mobj : el;
	mobj.clickHandler = null;
	mobj.disable();
}
function disableCreateButton() { disableButton('bCreateGame'); }
function disableHover(el) {
	let mobj = 'mobj' in el ? el.mobj : el;
	mobj.mouseEnterHandler = null;
	mobj.mouseLeaveHandler = null;
	mobj.disable();
}
function disableJoinButton() { disableButton('bJoinGame'); }
function disableResumeButton() {
	disableButton('bResumeGame');
}
function disableStyle(id) {
	if (isString(id)) id = document.getElementById(id);
	id.style.pointerEvents = 'none';
	id.style.opacity = .5;
	id.style.cursor = 'none';
}
function disappear(elem, msDuration = 1000, msStartAfter = 0) {
	if (isString(elem)) elem = mBy(elem);
	if (nundef(elem)) return;
	mStyle(elem, { overflow: 'hidden', animation: `disappear ${msDuration}ms ease` });
	setTimeout(() => { hide(elem); mStyle(elem, { animation: 'unset' }); }, msDuration);
}
function disconnectSocket() {
	if (Socket) { Socket.disconnect(); Socket = null; }
}
function displayWindowSize() {
	var w = document.documentElement.clientWidth;
	var h = document.documentElement.clientHeight;
	for (const msId in elements) {
		elements[msId].center();
	}
}
function distance(x1, y1, x2, y2) { return Math.sqrt(dSquare({ x: x1, y: y1 }, { x: x2, y: y2 })); }
function distribute_innerHTML(arr, s, sep = '') {
	let letters = s.split(sep);
	for (let i = 0; i < letters.length; i++) {
		let d = iDiv(arr[i]);
		let l = letters[i];
		if (l.length > 1) {
			l = '&#x' + l.substring(3) + ';';
		}
		d.innerHTML = l;
	}
	return;
	let i = 0; arr.map(x => { iDiv(x).innerHTML = s[i]; if (i < s.length - 1) i++; });
}
function diTitle(item) { return isdef(item.live) ? item.live.dTitle : null; }
function divInt(a, b) { return Math.trunc(a / b); }
function divKeyFromEv(ev) {
	let id = evToClosestId(ev);
	let div = mBy(id);
	return div.key;
}
function divscrolldown(id) {
	id = '#' + id;
	setTimeout(function () {
		$(id).animate(
			{
				scrollTop: $(id).offset().top
			},
			500
		);
	}, 200);
}
function dixit_activate(fen, plname) {
	console.log('activating for', plname)
}
function dixit_get_card(ckey, index, h = 200) {
	let filename = `${Basepath}assets/games/dixit/img${ckey}.jpg`;
	let clip = 50;
	let html = `<img src='${filename}' height='${h + clip}' style='clip-path:inset(0px 0px ${clip}px 0px)'></img>`;
	let d = mDiv(null, { rounding: 8, bg: 'blue', margin: 10, h: h, w: h * 141 / 200, overflow: 'hidden' }, null, html, 'card');
	mMagnifyOnHoverControl(d)
	let item = { key: ckey, index: index, div: d, html: html, h: h, faceUp: true };
	d.onclick = () => { face_up(item); };
	return item;
}
function dixit_present(fen, dParent, plname) {
	F = {};
	if (isdef(fen.story)) {
		F.story = ui_message(dParent, fen.story);
	}
	if (isdef(fen.instruction) && isdef(plname) && fen.plturn == plname) {
		let dTemp = mBy('dTemp');
		dTemp.style.display = 'block';
		mAppend(dParent, dTemp);
		dTempTitle.innerHTML = 'Write a story';
		dTempForm.onsubmit = ev => dixit_submit_story(mBy('dTempInput').value, ev);
	}
	if (isdef(fen.tablecards)) {
		let d = mDiv(dParent, { fg: 'white', bg: user.color, w: '100%' }, null, 'table'); mFlexWrap(d);
		pl.div = d;
		mLinebreak(d)
		let i = 0; let items = F.tablecards = fen.tablecards.map(x => { i++; return dixit_get_card(x, i) });
		for (const item of items) mAppend(d, iDiv(item));
	}
	let pls = F.players = {};
	for (const uname in fen.players) {
		let pl = pls[uname] = {};
		let fpl = fen.players[uname];
		console.log('dixit_present', user);
		let user = firstCond(Users, x => x.name == uname);
		copyKeys(user, pl)
		console.log('pl', uname, pl);
		if (isdef(plname) && uname != plname) continue;
		let d = mDiv(dParent, { fg: 'white', bg: user.color, w: '100%' }, null, uname); mFlexWrap(d);
		pl.div = d;
		mLinebreak(d)
		let i = 0; let items = pl.hand = fpl.hand.map(x => { i++; return dixit_get_card(x, i) });
		for (const item of items) mAppend(d, iDiv(item));
	}
}
function dixit_setup(players) {
	let fen = {};
	let deck = fen.deck = shuffle(range(0, 435));
	let pls = fen.players = {};
	for (const uname of players) {
		let pl = pls[uname] = {};
		pl.hand = deck_deal(deck, 7);
	}
	fen.plorder = rPlayerOrder(players);
	fen.turn = [fen.plorder[0]];
	fen.round = [];
	fen.iturn = 0;
	fen.phase = 'create';
	fen.instruction = 'write your story';
	return fen;
}
function dixit_submit_story(x, ev) {
	console.log('x', x, 'ev', ev)
}
function dlColor(factor, r, g, b) {
	testHelpers(r, g, b);
	let hsl = rgbToHsl(r, g, b);
	let hsv = hsl2hsv(...hsl);
	let h = hsv[0];
	let s = hsv[1];
	let v = hsv[2];
	v *= factor;
	hsl = hsv2hsl(h, s, v);
	let l = hsl[2];
	let sperc = s * 100;
	let lperc = l * 100;
	testHelpers('h,s,l,v:', h, s, l, v);
	return hslToHslaString(h, sperc, lperc);
}
function dm1(a, b, opt) {
	if (nundef(a)) return b;
	else if (nundef(b)) return a;
	else if (isLiteral(a)) return b;
	else if (isLiteral(b)) return a;
	else if (Array.isArray(b)) {
		return Array.isArray(a) ? mergeArr(a, b, opt) : cloneIfNecessary(b, opt);
	} else {
		return mergeObj(a, b, opt);
	}
}
async function DOCStart() {
	await loadAssets();
	createDocs();
}
async function documentFile(url) {
	let res = await fetchFileAsText(url);
	let regex = new RegExp('\nasync function|\nfunction|\nvar|\nconst|\nclass', 'g');
	let fcode = res.split(regex);
	let code = {};
	for (const w of fcode) {
		let trimmed = w.trim();
		let name = firstWord(trimmed);
		if (!isEmpty(name)) code[name] = trimmed;
	}
	let lines = res.split('\n');
	let i = 0;
	let iFunc = 0;
	let akku = {};
	let lastKey;
	let topComment = '';
	while (i < lines.length) {
		let result = skipToLine(lines, i, ['function', '/' + '/#r' + 'egion doc ']);
		if (nundef(result.option)) {
			break;
		} else if (result.option == 'function') {
			let line = lines[result.index];
			let lineTrimmed = line.trim();
			if (startsWith(lineTrimmed, 'function') || startsWith(lineTrimmed, 'async')) {
				let line1 = stringAfter(line, 'function ');
				if (line1.includes(')')) line1 = stringBefore(line1, ')').trim() + ')';
				let entry = akku[line1] = { name: firstWord(line1), index: iFunc, comments: '', path: url };
				if (isdef(code[entry.name])) entry.code = code[entry.name];
				iFunc += 1;
				lastKey = line1;
			}
		} else {
			let iStart = result.index + 1;
			let resend = skipToLine(lines, iStart, ['//#endregion']);
			let iEnd = resend.index;
			let block = copyLinesFromTo(lines, iStart, iEnd, '/*', '*/');
			if (lastKey) akku[lastKey].comments = block;
			else topComment = block;
			lastKey = null;
		}
		i = result.index + 1;
	}
	return { funcDict: akku, topComment: topComment };
}
async function documentVault(pathlist) {
	let res = {};
	for (const p of pathlist) {
		let fileInfo = await documentFile(p);
		res[p] = { filename: stringAfterLast(p, '/'), funcDict: fileInfo.funcDict, topComment: fileInfo.topComment };
	}
	return res;
}
function doit(secs, f, interval) {
	if (get_now() - DA.start < secs * 1000) setTimeout(() => { f(); doit(secs, f, interval); }, interval);
	else console.log('DONE!!!');
}
function dom(o, { loc, pool, params }) {
	console.log(o, loc, pool, params);
	let res = mCreate(params.tag ? params.tag : 'div');
	let sep = params.separator ? params.separator : ',';
	if (params.optin) res.innerHTML = params.optin.map(x => o.o[x]).join(sep);
	console.log('content:', res.innerHTML);
	return res;
}
function domId(id) { return document.getElementById(id) }
async function doNext(series, index, mexIndex) {
	recVerify(series, index + 1, maxIndex);
}
function doPerlenPoolChanges() {
	let s = G.perlenOptions;
	console.log('options:', s);
	Socket.emit('perlenOptions', s);
}
function dots(ms, n, { UL = false, UR = true, sz = 10, pos, dir, colors } = {}) {
	let dim = ms.bounds;
	let x, y, dx, dy;
	if (UR) {
		if (nundef(sz)) sz = dim.h / (2 * n);
		x = dim.w / 2 + -2 * sz;
		y = -dim.h / 2 + 2 * sz;
		dx = 0;
		dy = 2 * sz;
	} else if (UL) {
		return;
	}
	for (let i = 0; i < n; i++) {
		let color = isdef(colors) ? colors[i] : ms.fg;
		ms.circle({ sz: sz, x: x, y: y, fill: color });
		x += dx;
		y += dy;
	}
}
function download(jsonObject, fname) {
	json_str = JSON.stringify(jsonObject);
	saveFile(fname + '.json', 'data:application/json', new Blob([json_str], { type: '' }));
}
function download_all_functions() { downloadAsText(CODE.text, 'hallo', 'js'); }
function downloadAsText(s, filename, ext = 'txt') {
	saveFileAtClient(
		filename + "." + ext,
		"data:application/text",
		new Blob([s], { type: "" }));
}
function downloadAsYaml(o, filename) {
	let y = jsyaml.dump(o);
	downloadAsText(y, filename, 'yaml');
}
function downloadCodebase(superdi) {
	let text = '';
	for (const type of ['var', 'const', 'cla', 'func']) {
		let keys = get_keys(superdi[type]);
		if (type != 'const') sortCaseInsensitive(keys);
		for (const k of keys) {
			let code = superdi[type][k].code;
			if (!isEmptyOrWhiteSpace(code)) {
				text += code;
				if (code.trim() == '}') text += '\r\n';
			}
		}
	}
	downloadAsText(text, 'hallo', 'js');
	downloadAsYaml(superdi, 'hallo');
}
function downloadFile(jsonObject, filenameNoExt) {
	json_str = JSON.stringify(jsonObject);
	saveFileAtClient(
		filenameNoExt + ".json",
		"data:application/json",
		new Blob([json_str], { type: "" }));
}
function downloadHtmlFile(html, filenameNoExt) {
	saveFileAtClient(
		filenameNoExt + ".html",
		"data:application/html",
		new Blob([html], { type: "" }));
}
function downloadJson(o, filename) {
	if (filename.indexOf('.') < 0) filename = filename.json;
	let txt = (typeof o == 'object') ? encodeURIComponent(JSON.stringify(o)) : o;
	let dl = document.getElementById('downloadAnchorElement');
	if (nundef(dl)) dl = mCreateFrom(`<a id="downloadAnchorElem" style="display:none"></a>`);
	var dataStr = "data:text/json;charset=utf-8," + txt;
	dl.setAttribute("href", dataStr);
	dl.setAttribute("download", "_aaa\\scene.json");
	dl.click();
}
function downloadKeySet() {
	let keys = Pictures.filter(x => x.isSelected).map(x => x.info.key);
	downloadAsYaml(keys, 'keyset');
}
function downloadTextFile(s, filenameNoExt, ext = 'txt') {
	saveFileAtClient(
		filenameNoExt + "." + ext,
		"data:application/text",
		new Blob([s], { type: "" }));
}
function dPP(o, plist, R) {
	if (isEmpty(plist)) return o;
	if (isList(o) && isNumber(plist[0])) {
		let i = Number(plist[0]);
		return dPP(o[i], plist.slice(1), R);
	}
	if (!isDict(o)) {
		let o1 = R.getO(o);
		if (isdef(o1)) return dPP(o1, plist, R);
		console.log('dPP ERROR!!! o', o, 'plist', plist, '\no1', o1);
		return null;
	}
	let k1 = plist[0];
	let o1 = o[k1];
	if (nundef(o1)) return null;
	let plist1 = plist.slice(1);
	if (o1._set) {
		o1 = o1._set;
		if (plist1.length > 0 && isNumber(plist1[0])) {
			let i = Number(plist1[0]);
			return dPP(o1[i], plist1.slice(1), R);
		} else {
			return o1.map(x => dPP(x, plist1, R));
		}
	}
	if (o1._player) { o1 = R.getO(o1._player); }
	else if (o1._obj) { o1 = R.getO(o1._obj); }
	return dPP(o1, plist1, R);
}
function dPP1(o, plist, R) {
	if (isEmpty(plist)) {
		let res = isdef(o._player) ? [o._player] : isdef(o._obj) ? [o._obj] : o;
		return res;
	}
	if (isList(o) && isNumber(plist[0])) {
		let i = Number(plist[0]);
		return dPP1(o[i], plist.slice(1), R);
	}
	if (!isDict(o)) {
		let o1 = R.getO(o);
		if (isdef(o1)) return dPP1(o1, plist, R);
		console.log('dPP1 ERROR!!! o', o, 'plist', plist, '\no1', o1);
		return null;
	}
	let k1 = plist[0];
	let o1 = isdef(o._player) ? R.getO(o._player)[k1]
		: isdef(o._obj) ? R.getO(o._obj)[k1]
			: o[k1];
	if (nundef(o1)) return null;
	let plist1 = plist.slice(1);
	if (o1._set) {
		o1 = o1._set;
		if (plist1.length > 0 && !isNumber(plist1[0])) {
			return o1.map(x => dPP1(x, plist1, R));
		}
	}
	return dPP1(o1, plist1, R);
}
function drag(ev) {
	let elem = ev.target;
	dragStartOffset = getRelCoords(ev, $(elem));
	draggedElement = elem;
}
function dragKey(ev) {
	ev.dataTransfer.setData("text", ev.target.id);
	dragStartOffset = getRelCoords(ev, $(this));
}
function dragover_fritz(ev) {
	ev.preventDefault();
	ev.dataTransfer.dropEffect = "move";
	let target_id = evToClosestId(ev);
	let d = mBy(target_id);
	mStyle(d, { bg: 'red' });
	if (target_id == 'dOpenTable') {
	} else if (isdef(Items[target_id])) {
		let targetcard = Items[target_id];
		let targetgroup = Items[targetcard.groupid];
	} else {
	}
}
function dragStartPreventionOnSidebarOpen() {
	if (isdef(mBy('drop-region'))) {
		alert('please close sidebar (by DOUBLECLICK on it) before proceeding!');
		return false;
	}
	return true;
}
function dragX(ev) {
	let elem = ev.target;
	dragStartOffset = getRelCoordsX(ev, elem);
	draggedElement = elem;
}
function dragX2(ev) {
	let elem = ev.target;
	dragStartOffset = getRelCoordsX(ev, elem);
	draggedElement = elem;
}
function draw() {
	background(51);
	for (let i = 0; i < tree.length; i++) {
		tree[i].show();
		if (jittering) tree[i].jitter();
	}
	for (let i = 0; i < leaves.length; i++) {
		let l = leaves[i].current;
		noStroke();
		fill(0, 255, 100, 100);
		ellipse(l.x, l.y, 8, 8);
		if (jittering) leaves[i].current.y += random(0, 2);
	}
}
function draw_canvas(item) {
	let r = getRect(dTable);
	let c = mCanvas(d, { w: r.w, h: r.h, rounding: 0, bg: 'white' }); let [cv, cx] = [c.cv, c.cx];
	for (const item of items) {
		let d1 = item.div = cRect(item.x, item.y, item.w, item.h, { bg: item.bg }, cx);
	}
}
function draw_car(canvas, item) {
	let cx = canvas.cx;
	cRect(0 - item.w / 2, 0 - item.h / 2, item.w, item.h, { bg: item.color }, cx);
	cRect(item.w - item.w / 2, 0 - item.h / 2, 10, item.h, { bg: 'yellow' }, cx);
}
function draw_dom(item) {
	if (item.init) { item.init = false; iAdd(item, { div: mDiv(valf(dParent, item.container, dTable)) }); }
	if (item.refresh) { item.refresh = false; mStyle(iDiv(item.id), item.styles); }
}
function draw_from_deck_to(deck, arr) { top_elem_from_to(deck, arr); }
function draw_from_deck_to_board(deck, arr) { top_elem_from_to_top(deck, arr); }
function draw_gaussian(canvas, mean, stdev, color, thick, legendcolor, legend) {
	canvas.draw_axes();
	canvas.scale = 40;
	let f = gaussian_amp(canvas, 1)
	canvas.plot(f, color, thick);
	draw_ticks_gaussian(canvas, f, mean, stdev, legendcolor);
	draw_text(canvas, legend, { fg: legendcolor, pos: 'tr', hmargin: 25, vmargin: 12 });
}
function draw_label(canvas, item) {
	let cx = canvas.cx;
	cx.textAlign = 'center';
	cx.font = `${valf(item.fz, 16)}px Arial`;
	cx.fillStyle = item.color;
	cx.fillText(`  ${item.label}`, 0, 0);
}
function draw_on_canvas(cx, item) {
	if (isdef(item.draw)) { item.draw(cx, item); }
	else {
		cx.save();
		let st = item.styles;
		let [x, y, w, h, a, color] = [valf(st.x, 0), valf(st.y, 0), valf(st.w, 30), valf(st.h, 30), valf(st.a, 0), valf(st.bg, RED)];
		cx.translate(x, y);
		cx.rotate(toRadian(a));
		cEllipse(0, 0, w, h, { bg: colorFrom(color) }, 0, cx);
		cx.restore();
	}
}
function draw_on_div(dParent, item) {
	if (isdef(item.draw)) { item.draw(dParent, item); }
	else {
		let d = mDiv(dParent, item.styles);
		iAdd(item, { div: d });
	}
}
function draw_perlin_x(item) {
	let [cv, cx] = [item.live.cv, item.live.cx];
	cClear(cv, cx);
	let r = rPerlin(item.x);
	item.r = map_range(r, 0, 1, -item.w / 2, item.w / 2);
	cEllipse(item.r, 0, 25, 25, { bg: 'white' }, 0, cx);
	item.x += .02;
}
function draw_perlin_xy(item) {
	let [cv, cx] = [item.live.cv, item.live.cx];
	cClear(cv, cx);
	item.randx = valf(item.randx, 0) + .01;
	item.randy = valf(item.randy, 10000) + .02;
	item.x = map_range(rPerlin(item.randx), 0, 1, -item.w / 2, item.w / 2);
	item.y = map_range(rPerlin(item.randy), 0, 1, -item.h / 2, item.h / 2);
	cEllipse(item.x, item.y, 25, 25, { bg: 'white' }, 0, cx);
}
function draw_point(canvas, item) {
	let cx = canvas.cx;
	cx.font = `${valf(item.fz, 16)}px Arial`;
	cx.fillStyle = item.color;
	if (isdef(item.label)) cx.fillText(`  ${item.label}`, 0, 0);
	cEllipse(0, 0, item.w, item.h, { bg: item.color }, 0, cx);
}
function draw_random_walk(item) {
	let [cv, cx] = [item.live.cv, item.live.cx];
	cClear(cv, cx);
	cEllipse(rInc(item, 'x', -2, 2), rInc(item, 'y', -2, 2), 30, 20, { bg: 'blue', fg: 'green' }, 0, cx);
}
function draw_rect(canvas, item) {
	let cx = canvas.cx;
	cRect(0 - item.w / 2, 0 - item.h / 2, item.w, item.h, { bg: item.color }, cx);
}
function draw_set_card(dParent, info, card_styles) {
	let card = cLandscape(dParent, card_styles);
	card.info = info;
	let d = iDiv(card);
	mCenterCenterFlex(d);
	let sz = card.sz / 2.8;
	let bg, shape = info.shape, text;
	switch (info.shading) {
		case 'solid': bg = info.color; break;
		case 'gradient': bg = `linear-gradient(${info.color}, silver)`; break;
		case 'empty': bg = `repeating-linear-gradient(
						45deg,
						${info.color},
						${info.color} 10px,
						silver 10px,
						silver 20px
				)`; break;
	}
	mStyle(d, { bg: info.background });
	switch (info.text) {
		case 'none': text = null; break;
		case 'letter': text = randomLetter(); break;
		case 'number': text = '' + randomDigit(); break;
	}
	let styles = { w: sz, h: sz, margin: sz / 10 };
	for (let i = 0; i < info.num; i++) {
		let d1 = drawShape(shape, d, styles);
		if (info.shading == 'gradient') { d1.style.backgroundColor = info.color; mClass(d1, 'polka-dot'); } else mStyle(d1, { bg: bg });
		if (shape == 'circle') console.log('circle', d1);
		if (isdef(text)) { mCenterCenterFlex(d1); mText(text, d1, { fz: sz / 1.75, fg: 'black', family: 'impact' }); }
	}
	return card;
}
function draw_set_card_test(dParent) {
	let card = cLandscape(dParent, { w: 120 });
	let d = iDiv(card, { h: '100%' });
	mCenterCenterFlex(d);
	let sz = card.sz / 4;
	let styles = { w: sz, h: sz, bg: `linear-gradient(${RED},black`, margin: sz / 10, border: `solid 3px ${GREEN}` };
	let d1 = drawShape('circle', d, styles); mCenterCenterFlex(d1); mText('A', d1, { fz: sz / 4, fg: 'white' });
	drawShape('circle', d, styles);
	drawShape('circle', d, styles);
}
function draw_text(canvas, text, styles = {}) {
	let cx = canvas.cx;
	addKeys({ x: 0, y: 0, family: 'opensans', fz: 36 }, styles);
	styles.bg = styles.fg;
	styles.font = `${styles.fz}px ${styles.family}`;
	cStyle(styles, cx);
	let [x, y, offx, offy] = [styles.x, styles.y, valf(styles.hmargin, styles.margin, 4), valf(styles.vmargin, styles.margin, 4)];
	if (isdef(styles.pos)) {
		let pos = styles.pos;
		if (pos[0] == 't') {
			y += canvas.miny + offy;
			cx.textBaseline = 'hanging';
		} else if (pos[0] == 'c') {
			y += offy;
			cx.textBaseline = 'middle';
		} else {
			y += canvas.maxy - offy;
			cx.textBaseline = 'top';
		}
		if (pos[1] == 'l') {
			x += canvas.minx + offx;
			cx.textAlign = 'start';
		} else if (pos[1] == 'c') {
			x += offx;
			cx.textAlign = 'center';
		} else {
			x += canvas.maxx - offx;
			cx.textAlign = 'end';
		}
	} else {
		cx.textAlign = 'center';
		cx.textBaseline = 'middle';
	}
	if (isdef(styles.al)) {
		let a = ' ' + styles.al;
		console.log('a', a);
		cx.textAlign = a.includes(' s') ? 'start' : a.includes(' e') ? 'end' : a.includes(' r') ? 'right' : a.includes(' l') ? 'left' : 'center';
		cx.textBaseline = a.includes(' b') ? 'bottom' : a.includes(' t') ? 'top' : a.includes(' h') ? 'hanging' : a.includes(' a') ? 'alpjabetic' : a.includes(' i') ? 'ideographic' : 'middle';
	}
	if (isdef(styles.offy)) {
		if (isNumber(styles.offy)) y += styles.offy;
		else {
			let ws = toWords(styles.offy);
			let di = { below: 'hanging', above: 'bottom', ontop: 'bottom', onbottom: 'hanging', unterhalb: 'hanging', oberhalb: 'bottom', unten: 'hanging', oben: 'bottom' };
			for (const w of ws) {
				if (isNumber(w)) y += Number(w);
				else if (isdef(di[w])) cx.textBaseline = di[w];
				else if (w.length == 1) {
					cx.textBaseline = w == 'b' ? 'bottom' : w == 't' ? 'top' : w == 'a' ? 'alphabetic' : w == 'i' ? 'ideographic' : w == 'm' ? 'middle' : 'hanging';
				} else cx.textBaseline = w;
			}
		}
	}
	if (isdef(styles.offx)) {
		if (isNumber(styles.offx)) y += styles.offx;
		else {
			let ws = toWords(styles.offx);
			for (const w of ws) {
				if (isNumber(w)) x += Number(w);
				else if (w.length == 1) {
					cx.textAlign = w == 's' ? 'start' : w == 'e' ? 'end' : w == 'l' ? 'left' : w == 'r' ? 'right' : 'center';
				} else cx.textAlign = w;
			}
		}
	}
	console.log('x', x, 'y', y, 'elign', cx.textAlign, 'baseline', cx.textBaseline)
	cx.fillText(text, x, y);
}
function draw_ticks(canvas, f) {
	let sc = canvas.scale;
	let x_end = search_end_point(f, 0, canvas.maxx, 0.02);
	let y_end = f(x_end);
	canvas.pp(x_end * sc, -y_end * sc, `${Math.round(x_end * sc)}`, 'red', 'tc');
	console.log('endpoint x', x_end, 'y', y_end, canvas.minx, canvas.maxx);
	console.log('stdev', x_end / 3);
	let label = 100, dx = x_end / 3, x = 0;
	for (let i = 0; i <= 3; i++) {
		let x1 = Math.round(convert_to_range(x, -x_end, x_end, 50, 150));
		let x2 = Math.round(convert_to_range(-x, -x_end, x_end, 50, 150));
		canvas.pp(x * sc, 0, `${label + i * 15}`);
		if (x) canvas.pp(-x * sc, 0, `${label - i * 15}`);
		x += dx;
	}
}
function draw_ticks_gaussian(canvas, f, mean, dev, color) {
	let sc = canvas.scale;
	let x_end = search_end_point(f, 0, canvas.maxx, .005, .02);
	let dx = x_end / 3, x = 0;
	for (let i = 0; i <= 3; i++) {
		canvas.pp(x * sc, 0, `${mean + i * dev}`, { bg: color });
		if (x) canvas.pp(-x * sc, 0, `${mean - i * dev}`, { bg: color });
		x += dx;
	}
}
function drawBee(c) { return drawSym('bee', c); }
function drawBox() {
	c.lineWidth = 1;
	c.strokeRect(0.5, 0.5, canvas.width - 1, canvas.height - 1);
}
function drawcard(key, dParent, sz) {
	let d1;
	let card = ari_get_card(key, sz);
	mAppend(dParent, iDiv(card));
	let d = iDiv(card); mStyle(d, { position: 'relative', margin: 20 });
	let h = sz * .6;
	let w = h / 6.5;
	let left = sz >= 300 ? 7 : sz >= 200 ? 5 : sz >= 100 ? 3 : 3;
	let bottom = sz >= 300 ? 0 : sz >= 200 ? -1 : sz >= 100 ? -2 : -3;
	let matop = (sz - h) / 2;
	let html = `<img height=${sz / 3} src="./base/assets/images/icons/deco0.svg" style="transform:scaleX(-1);">`;
	d1 = mDiv(d, { position: 'absolute', bottom: bottom, left: left, opacity: .5 }, null, html);
	let dt = mDiv(d, { family: 'Algerian' }, null, 'luxury');
	mPlace(dt, 'tc', 0, '50%')
}
function drawCenteredBee(c) { return drawCenteredSym('bee', c); }
function drawCenteredPlainCircle(c) {
	let item = iContainer(dMain, { fz: 8, fg: 'black', bg: 'grey', padding: 1 });
	let d = iDiv(item);
	let rect = getRect(d);
	console.log('rect', rect)
	mPos(d, c.x - rect.w / 2, c.y - rect.h / 2);
	return item;
}
function drawCenteredSym(sym, c) {
	let item = mPic(sym, dMain, { w: 80, h: 80, box: true, fz: 25, rounding: '50%', vpadding: 14, hpadding: 4 });
	let d = iDiv(item);
	let rect = getRect(d);
	console.log('rect', rect)
	mPos(d, c.x - rect.w / 2, c.y - rect.h / 2);
	return item;
}
function drawCircle() {
	c.beginPath();
	c.arc(circle.x, circle.y, radius - lineWidth / 2, 0, 2 * Math.PI, false);
	c.fillStyle = '00F0FF';
	c.fill();
	c.lineWidth = 4;
	c.strokeStyle = 'black';
	c.stroke();
}
function drawColoredCircle(canvas, sz, color, stroke = 'black') {
	var context = canvas.getContext('2d');
	var centerX = canvas.width / 2;
	var centerY = canvas.height / 2;
	var radius = sz / 2;
	context.beginPath();
	context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
	context.fillStyle = color;
	context.fill();
}
function drawElems(idlist) {
	for (const id of idlist) {
		EID[id].ms.draw();
	}
}
function drawFlatHex(dParent, styles, classes, sizing) {
	if (nundef(styles)) styles = { w: 100, h: 100, bg: 'blue' };
	if (nundef(classes)) classes = ['frameOnHover'];
	if (nundef(sizing)) sizing = { hgrow: true, wgrow: true };
	let d = mDiv(dParent, styles, null, null, classes, sizing);
	mStyle(d, { 'clip-path': 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' });
	return d;
}
function drawHex(dParent, styles, classes, sizing) {
	if (nundef(styles)) styles = { w: 100, h: 100, bg: 'blue' };
	if (nundef(classes)) classes = ['frameOnHover'];
	if (nundef(sizing)) sizing = { hgrow: true, wgrow: true };
	let d = mDiv(dParent, styles, null, null, classes, sizing);
	mStyle(d, { 'clip-path': 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' });
	return d;
}
function drawLineToMouse() {
	c.lineWidth = 2;
	c.moveTo(circle.x, circle.y);
	c.lineTo(mouse.x, mouse.y);
	c.stroke();
}
function drawloop() { G.items.map(x => { if (isdef(x.draw)) x.draw(x); }); }
function DrawMaterial() {
	if (brd_pceNum[PIECES.wP] != 0 || brd_pceNum[PIECES.bP] != 0) return BOOL.FALSE;
	if (brd_pceNum[PIECES.wQ] != 0 || brd_pceNum[PIECES.bQ] != 0 || brd_pceNum[PIECES.wR] != 0 || brd_pceNum[PIECES.bR] != 0) return BOOL.FALSE;
	if (brd_pceNum[PIECES.wB] > 1 || brd_pceNum[PIECES.bB] > 1) { return BOOL.FALSE; }
	if (brd_pceNum[PIECES.wN] > 1 || brd_pceNum[PIECES.bN] > 1) { return BOOL.FALSE; }
	if (brd_pceNum[PIECES.wN] != 0 && brd_pceNum[PIECES.wB] != 0) { return BOOL.FALSE; }
	if (brd_pceNum[PIECES.bN] != 0 && brd_pceNum[PIECES.bB] != 0) { return BOOL.FALSE; }
	return BOOL.TRUE;
}
function drawPlainCircle(c) {
	let item = mPic('heart', dMain, { fz: 8, bg: 'red', rounding: '50%', padding: 1 });
	mPos(iDiv(item), c.x, c.y);
	return item;
}
function drawShape(key, dParent, styles, classes, sizing) {
	if (nundef(styles)) styles = { w: 96, h: 96, bg: 'random' };
	if (nundef(sizing)) sizing = { hgrow: true, wgrow: true };
	let d = mDiv(dParent, styles, null, null, classes, sizing);
	if (key == 'circle' || key == 'ellipse') mStyle(d, { rounding: '50%' });
	else mStyle(d, { 'clip-path': PolyClips[key] });
	return d;
}
function drawSym(sym, c) {
	let item = mPic(sym, dMain, { fz: 25, bg: 'skyblue', rounding: '50%', padding: 4 });
	mPos(iDiv(item), c.x, c.y);
	return item;
}
function drawTest(board, num) {
	clearElement(board.elem);
	let d = 10;
	let coll = [];
	for (let row = 0; row < board.h; row += d) {
		for (let col = 0; col < board.w; col += d) {
			let y = row - board.h / 2 + d / 2;
			let x = col - board.w / 2 + d / 2;
			let mobj = makeDrawingElement('el1', 'board');
			mobj.x = x; mobj.y = y;
			coll.push(mobj);
		}
	}
	timit.showTime('nach compute: number of elements=' + coll.length);
	const colors = ['red', 'green', 'yellow', 'blue', 'orange', 'violet', 'skyblue', 'sienna'];
	let keys = Object.keys(iconChars);
	let numPictos = Math.min(coll.length, keys.length);
	for (let i = 0; i < numPictos; i++) {
		let mobj = coll[i];
		let c = chooseRandom(colors);
		let key = keys[i];
		mobj._picto(key, mobj.x, mobj.y, d, d, c);
		//   let key = keys[i];//chooseRandom(Object.keys(faIcons));//'clock';
	}
	timit.showTime('nach shape');
	for (const mobj of coll) {
		mobj.attach();
	}
	timit.showTime('nach attach');
	if (num > 0) setTimeout(() => drawTest(board, num - 1), 0);
	else return coll;
}
function drawText(text, c) {
	let item = mText(text, dMain, { fz: 16, bg: 'skyblue', rounding: '50%', padding: 4 });
	mPos(iDiv(item), c.x, c.y);
	return item;
}
function drawTriangle(dParent, styles, classes, sizing) {
	if (nundef(styles)) styles = { w: 100, h: 100, bg: 'blue' };
	if (nundef(classes)) classes = ['frameOnHover'];
	if (nundef(sizing)) sizing = { hgrow: true, wgrow: true };
	let d = mDiv(dParent, styles, null, null, classes, sizing);
	mStyle(d, { 'clip-path': 'polygon(50% 0%, 100% 100%, 0% 100%)' });
	return d;
}
function drop(ev) {
	ev.preventDefault();
	let targetElem = findDragTarget(ev);
	targetElem.appendChild(draggedElement);
	setDropPosition(ev, draggedElement, targetElem, isdef(draggedElement.dropPosition) ? draggedElement.dropPosition : dropPosition);
}
function drop_card_fritz(ev) {
	ev.preventDefault();
	evNoBubble(ev);
	if (isdef(mBy('ddhint'))) mRemove(mBy('ddhint'));
	var data = ev.dataTransfer.getData("text");
	let card = Items[data];
	let target_id = evToClosestId(ev);
	if (card.source == 'discard') {
		let [discard, loose] = arrSplitAtIndex(UI.deck_discard.items, card.index);
		c = loose[0];
		loose = loose.slice(1);
		assertion(c == card, 'NEEEEEEEE');
		for (const c of loose) {
			console.log('card', c.key, 'source', c.source)
			if (c.source == 'discard') frnew(c, { target: 'dummy' });
		}
	}
	if (target_id == 'dOpenTable') {
		frnew(card, ev);
	} else if (isdef(Items[target_id])) {
		let targetcard = Items[target_id];
		let targetgroup = Items[targetcard.groupid];
		fradd(card, targetgroup, targetcard);
	} else {
	}
}
function drop_old(ev) {
	if (ev.cancel) return;
	ev.preventDefault();
	var data = ev.dataTransfer.getData("text");
	let dElem = document.getElementById(data);
	let dTarget1 = ev.target;
	let targetElem = dTarget1;
	while (!targetElem.ondragover) targetElem = targetElem.parentNode;
	targetElem.appendChild(dElem);
	console.log('dropping', dElem.id, 'onto', targetElem.id);
	var elm = $(targetElem);
	x = ev.pageX - elm.offset().left - dragStartOffset.x;
	y = ev.pageY - elm.offset().top - dragStartOffset.y;
	posXY(dElem, targetElem, x, y);
	ev.cancel = true;
}
function dropAndEval(ev) {
	cancelBubble = true;
	let els = allElementsFromPoint(ev.clientX, ev.clientY);
	if (nundef(DragElem)) return;
	let targetItem = DropZoneItem = firstCond(DropZoneItems, x => els.includes(iDiv(x)));
	if (nundef(targetItem)) { cancelDD(); return; }
	let droppedItem = DragSourceItem;
	addLabel1(targetItem, droppedItem.label);
	cancelDD();
}
function dropDD(ev) {
	ev.stopPropagation();
	ev.preventDefault();
	var data = ev.dataTransfer.getData("text");
	let dElem = document.getElementById(data);
	let targetElem = ev.target;
	while (!targetElem.ondragover) targetElem = targetElem.parentNode;
	if (isdef(dElem.dd) && dElem.dd != targetElem.dd) {
		console.log('wrong association dd', dElem.dd, targetElem.dd);
		return;
	}
	targetElem.appendChild(dElem);
	console.log('dropping', dElem.id, 'onto', targetElem.id);
	var elm = $(targetElem);
	x = ev.pageX - elm.offset().left - dragStartOffset.x;
	y = ev.pageY - elm.offset().top - dragStartOffset.y;
	posXY(dElem, targetElem, x, y);
	ev.cancel = true;
}
function dropKey(ev) {
	ev.stopPropagation();
	ev.preventDefault();
	var data = ev.dataTransfer.getData("text");
	let dElem = document.getElementById(data);
	let targetElem = ev.target;
	while (!targetElem.ondragover) targetElem = targetElem.parentNode;
	if (isdef(dElem.dd) && dElem.dd != targetElem.dd) {
		console.log('wrong association dd', dElem.dd, targetElem.dd);
		return;
	}
	targetElem.appendChild(dElem);
	console.log('dropping', dElem.id, 'onto', targetElem.id);
	var elm = $(targetElem);
	x = ev.pageX - elm.offset().left - dragStartOffset.x;
	y = ev.pageY - elm.offset().top - dragStartOffset.y;
	posXY(dElem, targetElem, x, y);
	ev.cancel = true;
}
function dropLast(s) { return s.substring(0, s.length - 1); }
function dropX(ev) {
	ev.preventDefault();
	let targetElem = findDragTarget(ev);
	if (nundef(draggedElement.dropPosition) || typeof (draggedElement.dropPosition) != 'function') targetElem.appendChild(draggedElement);
	setDropPosition(ev, draggedElement, targetElem, isdef(draggedElement.dropPosition) ? draggedElement.dropPosition : dropPosition);
}
function dropX2(ev) {
	ev.preventDefault();
	let targetElem = findDragTarget(ev);
	if (nundef(draggedElement.dropPosition) || typeof (draggedElement.dropPosition) != 'function') targetElem.appendChild(draggedElement);
	setDropPosition(ev, draggedElement, targetElem, isdef(draggedElement.dropPosition) ? draggedElement.dropPosition : dropPosition);
}
function dSquare(pos1, pos2) {
	let dx = pos1.x - pos2.x;
	dx *= dx;
	let dy = pos1.y - pos2.y;
	dy *= dy;
	return dx + dy;
}
function dummy_reaction(ev) { console.log('clicked', ev.target) }
function dump(...arr) {
	for (const a of arr) {
	}
}
function dynamicArea(areaName, oSpec, oid, o) {
	func = correctFuncName(oSpec.type);
	oSpec.ui = window[func](areaName, oSpec, oid, o);
}
//#endregion

//#region functions E
function each_hand_of_one(o) {
	let [fen, uplayer] = [o.fen, o.fen.turn[0]];
	for (const plname of fen.plorder) {
		let pl = fen.players[plname];
		pl.hand = [rChoose(['4Hn', '5Hn', 'QHn', 'KHn', 'AHn'])];
		pl.goals['33'] = true; pl.roundgoal = '33';
		pl.journeys.push(['4Hn', '4Sn', '*Hn'], ['5Hn', '5Sn', '*Hn'], ['QHn', 'QSn', '*Hn']);
	}
	fen.players[uplayer].hand = ['4Cn'];
}
function editableUsernameUi(dParent) {
	let inp = mEditableInput(dParent, 'user: ', Username);
	inp.id = 'spUser';
	inp.addEventListener('focusout', () => { changeUserTo(inp.innerHTML.toLowerCase()); });
	return inp;
}
async function editLayoutTests() {
	DB = await route_path_yaml_dict('./PERLENDATA/data.yaml');
	lastState = await route_path_yaml_dict('./PERLENDATA/lastState.yaml');
	G = { settings: lastState.settings, dParent: dTable, clientBoard: {} };
	applyStandard(G.dParent, G.settings);
	onClickEditLayout();
}
function einhaengen(oid, o, R) {
	let topUids;
	let success = false;
	let successKeys = [];
	for (const key of R.getR(oid)) {
		let specNode = R.getSpec(key);
		if (o.loc && nundef(R.Locations[key]) && nundef(specNode._ref)) {
			if (nundef(R.Locations[key])) {
				topUids = addOidByLocProperty(oid, key, R);
			} else {
				console.log('impossible to add!!! key bound to location', R.locations[key]);
			}
		} else if (isdef(R.Locations[key])) {
			topUids = addOidByParentKeyLocation(oid, key, R);
		} else {
			topUids = [];
		}
		if (isEmpty(topUids)) { continue; }
		else { successKeys.push(key); success = true; }
		for (const top of topUids) {
			let uiParent = R.uiNodes[top.uidParent];
			let rParent = R.rNodes[top.uidParent];
			if (isdef(uiParent)) {
				uiParent.adirty = true;
				uiParent.children = rParent.children.map(x => x);
			}
			recUi(R.rNodes[top.uid], R, top.uidParent, oid, key);
		}
	}
	return success ? successKeys : false;
}
function elem_from_to(el, arr1, arr2) { removeInPlace(arr1, el); arr2.push(el); }
function elem_from_to_top(el, arr1, arr2) { removeInPlace(arr1, el); arr2.unshift(el); }
function ellipsis(text, font, width, padding) {
	let textLength = getTextWidth(text, font);
	let ellipsisLength = 0;
	ellipsisLength = getTextWidth('...', font);
	let maxw = width - 2 * padding;
	while (textLength + ellipsisLength > maxw && text.length > 0) {
		text = text.slice(0, -1).trim();
		textLength = getTextWidth(text, font);
	}
	return ellipsisLength > 0 ? text + '...' : text;
}
function empty(arr) {
	let result = arr === undefined || !arr || (isString(arr) && (arr == 'undefined' || arr == '')) || (Array.isArray(arr) && arr.length == 0) || emptyDict(arr);
	testHelpers(typeof arr, result ? 'EMPTY' : arr);
	return result;
}
function empty_func(x) { nundef(x) || x == ' '; }
function emptyCard() {
	return cardFace({ key: 'empty' });
}
function emptyDict(obj) {
	let test = Object.entries(obj).length === 0 && obj.constructor === Object;
	return test;
}
function emptyTarget(val) {
	return Array.isArray(val) ? [] : {}
}
function enableButton(id) { enableStyle(id) }
function enableClick(el, handler) {
	let mobj = 'mobj' in el ? el.mobj : el;
	mobj.clickHandler = handler;
	mobj.enable();
}
function enableCreateButton() { enableButton('bCreateGame'); }
function enableDD(sources, targets, dropHandler, isCopy, clearTarget, dragStartHandler) {
	DDInfo = { sources: sources, targets: targets, dropHandler: dropHandler, dragStartHandler };
	let sourceDivs = sources.map(x => iDiv(x));
	for (let i = 0; i < sources.length; i++) {
		let source = sources[i];
		let d = sourceDivs[i];
		d.onmousedown = (ev) => ddStart(ev, source, isCopy, clearTarget);
	}
}
function enableDragForDeck(d) {
	d.cards.forEach(function (card, i) {
		card.enableDragging();
	});
}
function enableFlipForDeck(d) {
	d.cards.forEach(function (card, i) {
		card.enableFlipping();
	});
}
function enableHover(el, enterHandler, leaveHandler) {
	let mobj = 'mobj' in el ? el.mobj : el;
	mobj.mouseEnterHandler = enterHandler;
	mobj.mouseLeaveHandler = leaveHandler;
	mobj.enable();
}
function enableJoinButton() { enableButton('bJoinGame'); }
function enableResumeButton() {
	enableButton('bResumeGame');
}
function enableStyle(id) {
	if (isString(id)) id = document.getElementById(id);
	id.style.pointerEvents = null;
	id.style.opacity = 1;
	id.style.cursor = 'pointer';
}
function end_of_round_ferro() {
	let [plorder, stage, A, fen, uplayer] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer];
	calc_ferro_score(uplayer);
	if (Z.options.phase_order == 'anti') {
		for (const plname of plorder) {
			let pl = fen.players[plname];
			if (!pl.roundgoal) pl.goals[get_round_goal()] = true;
		}
	}
	ari_history_list([`${uplayer} wins the round`], 'round');
	fen.round_winner = uplayer;
	[Z.stage, Z.turn] = ['round_end', [Z.host]];
	take_turn_fen();
}
function end_of_round_fritz(plname) {
	let [A, fen, uplayer, plorder] = [Z.A, Z.fen, Z.uplayer, Z.plorder];
	let pl = fen.players[uplayer];
	calc_fritz_score();
	ari_history_list([`${plname} wins the round`], 'round over');
	fen.round_winner = plname;
	plorder = fen.plorder = jsCopy(fen.roundorder);
	if (Z.round >= fen.maxrounds) {
		fen.winners = find_players_with_min_score();
		ari_history_list([`game over: ${fen.winners.join(', ')} win${fen.winners.length == 1 ? 's' : ''}`], 'game over');
		Z.stage = 'game_over';
		console.log('end of game: stage', Z.stage, '\nplorder', fen.plorder, '\nturn', Z.turn);
	} else {
		let starter = fen.starter = get_next_in_list(fen.starter, plorder);
		console.log('starter', starter);
		Z.turn = [starter];
		Z.round += 1;
		fritz_new_table(fen, Z.options);
		fritz_new_player_hands(fen, Z.turn[0], Z.options);
	}
}
function end_of_turn_fritz() {
	//#region prelim
	let [A, fen, uplayer, plorder] = [Z.A, Z.fen, Z.uplayer, Z.plorder];
	let pl = fen.players[uplayer];
	clear_quick_buttons();
	let ms = fen.players[uplayer].time_left = stop_timer();
	//#endregion
	//#region TJ group processing
	let ploose = {};
	fen.journeys = [];
	fen.loosecards = [];
	for (const plname in fen.players) { fen.players[plname].loosecards = []; }
	for (const group of DA.TJ) {
		let ch = arrChildren(iDiv(group));
		let cards = ch.map(x => Items[x.id]);
		let set = Z.options.overlapping == 'yes' ? is_overlapping_set(cards, Z.options.jokers_per_group, 3, false)
			: ferro_is_set(cards, Z.options.jokers_per_group, 3, false);
		if (!set) {
			for (const card of cards) {
				if (is_joker(card)) {
					fen.loosecards.push(card.key);
					continue;
				}
				let owner = valf(card.owner, uplayer);
				lookupAddToList(ploose, [owner], card.key);
			}
		} else {
			let j = set;
			fen.journeys.push(j);
		}
	}
	for (const plname in ploose) {
		fen.players[plname].loosecards = ploose[plname];
	}
	let discard = UI.deck_discard.items.filter(x => x.source == 'discard');
	fen.deck_discard = discard.map(x => x.key);
	if (!isEmpty(A.selected)) {
		let ui_discarded_card = A.selected.map(x => A.items[x].o)[0];
		removeInPlace(UI.players[uplayer].hand.items, ui_discarded_card);
		ckey = ui_discarded_card.key;
		elem_from_to(ckey, fen.players[uplayer].hand, fen.deck_discard);
		ari_history_list([`${uplayer} discards ${ckey}`], 'discard');
	}
	let uihand = UI.players[uplayer].hand.items;
	let fenhand_vorher = fen.players[uplayer].hand;
	let fenhand = fen.players[uplayer].hand = uihand.filter(x => x.source == 'hand').map(x => x.key);
	//#endregion
	if (isEmpty(fenhand) && isEmpty(fen.players[uplayer].loosecards)) {
		end_of_round_fritz(uplayer);
	} else if (ms <= 100) {
		console.log(`time is up for ${uplayer}!!!`);
		ari_history_list([`${uplayer} runs out of time`], 'timeout');
		if (fen.plorder.length <= 1) { end_of_round_fritz(uplayer); }
		else { Z.turn = [get_next_player(Z, uplayer)]; deck_deal_safe_fritz(fen, Z.turn[0]); removeInPlace(fen.plorder, uplayer); }
	} else { Z.turn = [get_next_player(Z, uplayer)]; deck_deal_safe_fritz(fen, Z.turn[0]); }
	take_turn_fen();
}
function endit() { throw new Error("*** THE END ***"); }
function endsWith(s, sSub) { let i = s.indexOf(sSub); return i >= 0 && i == s.length - sSub.length; }
function endTurn() {
	present();
	let el = T.trick[0].div;
	let res = indexOfMax(T.trick, 'rank');
	let winnerOfTrick = T.players[res.i];
	winnerOfTrick.hand.add(T.trick);
	let pos = actualCenter(el);
	let targetPos = actualCenter(Zones[winnerOfTrick.id].div);
	console.log('from', pos, 'to', targetPos);
	el.style.position = 'fixed';
	el.style.left = pos.x + 'px';
	el.style.top = pos.y + 'px';
	setTimeout(() => { el.style.left = targetPos.x + 'px'; el.style.top = targetPos.y + 'px' }, 2000);
	showHands();
	return;
	let losers = [], winners = [];
	for (const pl of T.players) {
		if (pl.hand.count() == 0) { losers.push(pl); } else { winners.push(pl); }
	}
	if (winners.length == 1) {
		console.log('*** game over *** winner', winners[0]); return;
	} else {
		console.log('game goes on');
		showHands();
	}
	setTimeout(startRound, 2000);
}
function engine_go(e) {
	const matrix = {
		a: {
			click: () => add_agent_at(M.map, [e.latlng.lat, e.latlng.lng]),
			route: () => { M.event = 'route', M.state = 'r'; engine_go() }
		},
		r: {
		},
	}
	switch (M.state) {
		case 'a':
			switch (event) {
				case 'click': break;
				case 'route': M.state = 'r'; break;
				case 'clear': break;
			}
			break;
		case 'r':
			break;
		default:
			break;
	}
}
function enQ(f, parr = null, msBefore = null, msAfter = null, callback = null) {
	if (nundef(Q)) restartQ();
	Q.push({ f: f, parr: parr, msBefore: msBefore, msAfter: msAfter, callback: callback });
}
function ensure_actions(fen) { fen.actionsCompleted = []; }
function ensure_assets(obj) {
	if (nundef(DB)) {
		DB = jsyaml.load(obj.db);
		symbolDict = Syms = jsyaml.load(obj.syms);
		SymKeys = Object.keys(Syms);
		ByGroupSubgroup = jsyaml.load(obj.symGSG);
		WordP = jsyaml.load(obj.allWP);
		C52 = jsyaml.load(obj.c52);
		Cinno = jsyaml.load(obj.cinno);
		FenPositionList = csv2list(obj.fens);
		KeySets = getKeySets();
	}
	console.assert(isdef(DB), 'NO DB!!!!!!!!!!!!!!!!!!!!!!!!!!!');
}
function ensure_assets_old(obj) {
	DB = jsyaml.load(obj.db);
	symbolDict = Syms = jsyaml.load(obj.syms);
	SymKeys = Object.keys(Syms);
	ByGroupSubgroup = jsyaml.load(obj.symGSG);
	WordP = jsyaml.load(obj.allWP);
	C52 = jsyaml.load(obj.c52);
	Cinno = jsyaml.load(obj.cinno);
	inno_create_card_assets();
	ari_create_card_assets('rbgyop');
	FenPositionList = csv2list(obj.fens);
	KeySets = getKeySets();
	if (isdef(obj.edict)) { Dictionary = { E: to_words(obj.edict), S: to_words(obj.sdict), F: to_words(obj.fdict), D: to_words(obj.ddict) } };
	console.assert(isdef(DB), 'NO DB!!!!!!!!!!!!!!!!!!!!!!!!!!!');
}
function ensure_buttons_visible_ferro() {
	let [plorder, stage, A, fen, uplayer, pl] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer, Z.fen.players[Z.uplayer]];
	if (fen.players[uplayer].hand.length <= 1) return;
	let dbPlayer = mBy('dbPlayer');
	if (nundef(dbPlayer)) {
		let d = iDiv(UI.players[uplayer]);
		mStyle(d, { position: 'relative' })
		dbPlayer = mDiv(d, { position: 'absolute', bottom: 2, left: 100, height: 25 }, 'dbPlayer');
	}
	let styles = { rounding: 6, bg: 'silver', fg: 'black', border: 0, maleft: 10 };
	if (Z.game == 'ferro') {
		let b = mButton('clear selection', onclick_clear_selection_ferro, dbPlayer, styles, 'enabled', 'bClearSelection');
		if (isEmpty(A.selected)) hide(b);
	}
}
function ensure_buttons_visible_for(plname) {
	if (Z.role == 'spectator' || isdef(mBy('dbPlayer'))) return;
	let fen = Z.fen;
	let pl = fen.players[plname];
	let plui = UI.players[plname];
	if (pl.hand.length <= 1) return;
	let d = iDiv(plui);
	mStyle(d, { position: 'relative' })
	let dbPlayer = mDiv(d, { position: 'absolute', bottom: 2, left: 100, height: 25 }, 'dbPlayer');
	let styles = { rounding: 6, bg: 'silver', fg: 'black', border: 0, maleft: 10 };
	let bByRank = mButton('by rank', onclick_by_rank_ferro, dbPlayer, styles, 'enabled');
	let bBySuit = mButton('by suit', onclick_by_suit_ferro, dbPlayer, styles, 'enabled');
}
function ensure_clientstate() {
	if (nundef(Clientdata.state)) {
		Clientdata.state = {};
		for (const k in DA.bars) Clientdata.state[k] = 0;
	}
}
function ensure_market(fen, n) { fen.stallSelected = []; deck_add(fen.deck, n - fen.market.length, fen.market); }
function ensure_player_id_name_index_type_color(pls) {
	let i = 0;
	pls.map(x => {
		x.id = getUID();
		x.name = (i == 0 ? Username : randomBotName()).toLowerCase();
		x.index = i;
		x.type = (i == 0 ? 'human' : 'ai');
		x.colorName = (i == 0 ? U.settings.userColor : Object.values(PlayerColors)[i]);
		x.color = (i == 0 ? U.settings.userColor : Object.keys(PlayerColors)[i]);
		i++;
	});
}
function ensure_polling() { }
function ensure_score(plname) {
	let sc = 0;
	if (isdef(Z.playerdata)) {
		let pldata = valf(firstCond(Z.playerdata, x => x.name == plname), { name: plname, state: { score: 0 } });
		sc = isdef(pldata.state) ? pldata.state.score : 0;
	} else Z.playerdata = Z.plorder.map(x => [{ name: x, state: { score: 0 } }]);
	lookupSet(Z.fen, ['players', plname, 'score'], sc);
}
function ensure_stall(fen, uplayer, n) { let pl = fen.players[uplayer]; deck_add(fen.deck, n - pl.stall.length, pl.stall); }
function ensure_stallSelected(fen) { if (nundef(fen.stallSelected)) fen.stallSelected = []; }
function ensure_winnerlist(game) { return lookupSet(DB.games, [game, 'winnerlist'], []); }
function ensure_Z() {
	if (nundef(Z)) Z = {};
	copyKeys(Serverdata, Z);
	if (isdef(Serverdata.table)) { copyKeys(Serverdata.table, Z); copyKeys(Serverdata.table.fen, Z); }
}
async function ensureAllAssets() { ensureAllAssets(true, true, true, true); }
function ensureAllGames(callbacks = []) {
	if (allGames == null) {
		sendGetAllGames(d => {
			allGames = d;
			console.log('allGames', allGames);
			if (!isEmpty(callbacks)) callbacks[0](arrFromIndex(callbacks, 1));
		});
	} else if (!isEmpty(callbacks)) callbacks[0](arrFromIndex(callbacks, 1));
}
async function ensureAssets() {
	if (nundef(Syms)) {
		Syms = await route_path_yaml_dict(`${Basepath}assets/allSyms.yaml`);
		SymKeys = get_keys(Syms);
		ByGroupSubgroup = await route_path_yaml_dict(`${Basepath}assets/symGSG.yaml`);
		KeySets = getKeySets();
		C52 = await route_path_yaml_dict(`${Basepath}assets/c52.yaml`);
		ari_create_card_assets('rb');
	}
}
function ensureColorDict() {
	if (isdef(ColorDi)) return;
	ColorDi = {};
	let names = getColorNames();
	let hexes = getColorHexes();
	for (let i = 0; i < names.length; i++) {
		ColorDi[names[i].toLowerCase()] = { c: '#' + hexes[i] };
	}
	const newcolors = {
		black: { c: '#000000', D: 'schwarz' },
		blue: { c: '#0000ff', D: 'blau' },
		BLUE: { c: '#4363d8', E: 'blue', D: 'blau' },
		BLUEGREEN: { c: '#004054', E: 'bluegreen', D: 'blaugrün' },
		BROWN: { c: '#96613d', E: 'brown', D: 'braun' },
		deepyellow: { c: '#ffed01', E: 'yellow', D: 'gelb' },
		FIREBRICK: { c: '#800000', E: 'darkred', D: 'rotbraun' },
		gold: { c: 'gold', D: 'golden' },
		green: { c: 'green', D: 'grün' },
		GREEN: { c: '#3cb44b', E: 'green', D: 'grün' },
		grey: { c: 'grey', D: 'grau' },
		lightblue: { c: 'lightblue', D: 'hellblau' },
		LIGHTBLUE: { c: '#42d4f4', E: 'lightblue', D: 'hellblau' },
		lightgreen: { c: 'lightgreen', D: 'hellgrün' },
		LIGHTGREEN: { c: '#afff45', E: 'lightgreen', D: 'hellgrün' },
		lightyellow: { c: '#fff620', E: 'lightyellow', D: 'gelb' },
		NEONORANGE: { c: '#ff6700', E: 'neonorange', D: 'neonorange' },
		NEONYELLOW: { c: '#efff04', E: 'neonyellow', D: 'neongelb' },
		olive: { c: 'olive', D: 'oliv' },
		OLIVE: { c: '#808000', E: 'olive', D: 'oliv' },
		orange: { c: 'orange', D: 'orange' },
		ORANGE: { c: '#f58231', E: 'orange', D: 'orange' },
		PINK: { c: 'deeppink', D: 'rosa' },
		pink: { c: 'pink', D: 'rosa' },
		purple: { c: 'purple', D: 'lila' },
		PURPLE: { c: '#911eb4', E: 'purple', D: 'lila' },
		red: { c: 'red', D: 'rot' },
		RED: { c: '#e6194B', E: 'red', D: 'rot' },
		skyblue: { c: 'skyblue', D: 'himmelblau' },
		SKYBLUE: { c: 'deepskyblue', D: 'himmelblau' },
		teal: { c: '#469990', D: 'blaugrün' },
		TEAL: { c: '#469990', E: 'teal', D: 'blaugrün' },
		transparent: { c: '#00000000', E: 'transparent', D: 'transparent' },
		violet: { c: 'violet', E: 'violet', D: 'violett' },
		VIOLET: { c: 'indigo', E: 'violet', D: 'violett' },
		white: { c: 'white', D: 'weiss' },
		yellow: { c: 'yellow', D: 'gelb' },
		yelloworange: { c: '#ffc300', E: 'yellow', D: 'gelb' },
		YELLOW: { c: '#ffe119', E: 'yellow', D: 'gelb' },
	};
	for (const k in newcolors) {
		let cnew = newcolors[k];
		if (cnew.c[0] != '#' && isdef(ColorDi[cnew.c])) cnew.c = ColorDi[cnew.c].c;
		ColorDi[k] = cnew;
	}
}
function ensureColorNames() {
	if (isdef(ColorNames)) return;
	ColorNames = {};
	let names = getColorNames();
	let hexes = getColorHexes();
	for (let i = 0; i < names.length; i++) {
		ColorNames[names[i].toLowerCase()] = '#' + hexes[i];
	}
}
function ensureDictionary() {
	if (nundef(Dictionary)) { Dictionary = { E: {}, S: {}, F: {}, C: {}, D: {} } };
	for (const k in Syms) {
		for (const lang of ['E', 'D', 'F', 'C', 'S']) {
			let w = Syms[k][lang];
			if (nundef(w)) continue;
			Dictionary[lang][w.toLowerCase()] = Dictionary[lang][w.toUpperCase()] = k;
		}
	}
}
function ensureInView(container, element) {
	let cTop = container.scrollTop;
	let cBottom = cTop + container.clientHeight;
	let eTop = element.offsetTop;
	let eBottom = eTop + element.clientHeight;
	if (eTop < cTop) {
		container.scrollTop -= cTop - eTop;
	} else if (eBottom > cBottom) {
		container.scrollTop += eBottom - cBottom;
	}
}
function ensureKeys(o, def) {
	addKeys(def, o);
}
function ensureRtree(R) {
	if (nundef(R.tree) || isEmpty(R.tree)) {
		if (isdef(R.lastSpec.ROOT.cond)) {
			R.tree = { uid: getUID(), uidParent: null, here: 'ROOT', type: 'invisible' };
			if (R.lastSpec.ROOT.chanav) R.tree.chanav = R.lastSpec.ROOT.chanav;
			R.rNodes[R.tree.uid] = R.tree;
			R.Locations.ROOT = [R.tree.uid];
		} else {
			R.tree = recTree(R.lastSpec.ROOT, null, R);
			R.rNodes[R.tree.uid] = R.tree;
		}
	} else {
		console.log('(tree present!)');
	}
}
async function ensureSvgDict() {
	if (nundef(svgDict)) {
		svgDictC = await vidCache.load('svgDict', route_svgDict, true, false);
		svgDict = vidCache.asDict('svgDict');
		svgKeys = Object.keys(svgDict);
		svgList = dict2list(svgDict);
	}
}
function ensureSymByHex() {
	if (nundef(symByHex)) {
		symByHex = {};
		symKeysByHex = [];
		for (const k in symbolDict) {
			let info = symbolDict[k];
			symByHex[info.hexcode] = info;
		}
		symKeysByHex = Object.keys(symByHex);
	}
}
function ensureSymBySet() { if (nundef(symBySet)) { makeEmoSetIndex(); } }
function ensureSymByType() {
	if (nundef(symByType)) {
		symByType = { emo: {}, eduplo: {}, icon: {}, iduplo: {} };
		symKeysByType = { emo: [], eduplo: [], icon: [], iduplo: [] };
		symListByType = { emo: [], eduplo: [], icon: [], iduplo: [] };
		for (const k in symbolDict) {
			let info = symbolDict[k];
			if (info.type == 'emo' && info.isDuplicate) { symByType.eduplo[k] = info; symListByType.eduplo.push(info); symKeysByType.eduplo.push(k); }
			else if (info.type == 'icon' && info.isDuplicate) { symByType.iduplo[k] = info; symListByType.iduplo.push(info); symKeysByType.iduplo.push(k); }
			else if (info.type == 'emo') { symByType.emo[k] = info; symListByType.emo.push(info); symKeysByType.emo.push(k); }
			else if (info.type == 'icon') { symByType.icon[k] = info; symListByType.icon.push(info); symKeysByType.icon.push(k); }
		}
	}
}
function ensureUiNodes(R) { if (nundef(R.uiNodes)) R.uiNodes = {}; }
function ensureUIS() { if (nundef(UIS)) { UIS = {}; IdOwner = {}; id2oids = {}; oid2ids = {}; id2uids = {}; path2mainIds = {}; } }
function enter_pressed(e) { if (e.keyCode == 13) { send_message(e); } set_seen(); }
function enterInterruptState() {
	clearTimeouts();
	if (isdef(G.instance)) G.instance.clear();
	auxOpen = true;
}
function enterLobby() {
	console.assert(isdef(DB) && isdef(U), 'ENTERLOBBY DB U NOT CORRECT!!!')
	if (JUST_PERLEN_GAME) { simplestPerlenGame(); }
}
function enterOnlineIDFormSubmit() {
	var form = document.getElementById("EnterOnlineIDForm");
	let userid = mBy("enterID-input");
	let pwd = mBy('tlpvt-passcode-input');
	onclick_submit_boa_login();
}
function enterWaitingLoop() {
	setStatus('waiting for more players!!!');
}
function eraseSpaces(s) {
	let i = 0;
	while (s.includes('  ')) {
		s = s.replace('  ', ' ');
		s = s.replace(' {', '{');
		s = s.replace(' (', '(');
		s = s.replace('\n ', ' ');
		s = s.replace('\n{', '{');
		s = s.replace('\n}', '}');
	}
	return s;
}
function errlog() { console.log('ERROR!', ...arguments); }
function error(msg) {
	let fname = getFunctionsNameThatCalledThisFunction();
	console.log(fname, 'ERROR!!!!! ', msg);
}
function errormsg(ms) { $('#msg').innerHTML = ms; }
function establishUsername(username) {
	hide(dLogin);
	Username = username;
	initSocket();
}
function ev_to_gname(ev) { evNoBubble(ev); return evToTargetAttribute(ev, 'gamename'); }
function eval_approx_derivative(f, xfrom, xto, dx) { }
function eval_approx_integral(f, xfrom, xto, dx) { }
function eval_normal_cdf(x, mean, stdev) { let f = get_normal_cdf(mean, stdev); return f(x); }
function eval_normal_pdf(x, mean, stdev) { let f = get_normal_pdf(mean, stdev); return f(x); }
function evalCond(o, condKey, condVal) {
	let func = FUNCTIONS[condKey];
	if (isString(func)) func = window[func];
	if (nundef(func)) {
		if (nundef(o[condKey])) return null;
		if (isList(condVal)) {
			for (const v of condVal) if (o[condKey] == v) return true;
			return null;
		} else {
			return isdef(o[condKey]) ? o[condKey] == condVal : null;
		}
	}
	return func(o, condVal);
}
function evalConds(o, conds) {
	for (const [f, v] of Object.entries(conds)) {
		if (!evalCond(o, f, v)) return false;
	}
	return true;
}
function evalExp() { }
function EvalInit() {
	var index = 0;
	for (index = 0; index < 10; ++index) {
		PawnRanksWhite[index] = 0;
		PawnRanksBlack[index] = 0;
	}
}
function evalML(word) {
	let answer = normalize(word, currentLanguage);
	let reqAnswer = normalize(bestWord, currentLanguage);
	if (answer == reqAnswer) return true;
	else if (currentLanguage == 'D' && isEnglishKeyboardGermanEquivalent(reqAnswer, answer)) {
		return true;
	} else {
		return false;
	}
}
function EvalPosition() {
	var pce;
	var pceNum;
	var sq;
	var score = brd_material[COLOURS.WHITE] - brd_material[COLOURS.BLACK];
	var file;
	var rank;
	if (0 == brd_pceNum[PIECES.wP] && 0 == brd_pceNum[PIECES.bP] && MaterialDraw() == BOOL.TRUE) {
		return 0;
	}
	PawnsInit();
	pce = PIECES.wP;
	for (pceNum = 0; pceNum < brd_pceNum[pce]; ++pceNum) {
		sq = brd_pList[PCEINDEX(pce, pceNum)];
		score += PawnTable[SQ64(sq)];
		file = FilesBrd[sq] + 1;
		rank = RanksBrd[sq];
		if (PawnRanksWhite[file - 1] == RANKS.RANK_8 && PawnRanksWhite[file + 1] == RANKS.RANK_8) {
			score += PawnIsolated;
		}
		if (PawnRanksBlack[file - 1] <= rank && PawnRanksBlack[file] <= rank && PawnRanksBlack[file + 1] <= rank) {
			score += PawnPassed[rank];
		}
	}
	pce = PIECES.bP;
	for (pceNum = 0; pceNum < brd_pceNum[pce]; ++pceNum) {
		sq = brd_pList[PCEINDEX(pce, pceNum)];
		score -= PawnTable[MIRROR64(SQ64(sq))];
		file = FilesBrd[sq] + 1;
		rank = RanksBrd[sq];
		if (PawnRanksBlack[file - 1] == RANKS.RANK_1 && PawnRanksBlack[file + 1] == RANKS.RANK_1) {
			score -= PawnIsolated;
		}
		if (PawnRanksWhite[file - 1] >= rank && PawnRanksWhite[file] >= rank && PawnRanksWhite[file + 1] >= rank) {
			score -= PawnPassed[7 - rank];
		}
	}
	pce = PIECES.wN;
	for (pceNum = 0; pceNum < brd_pceNum[pce]; ++pceNum) {
		sq = brd_pList[PCEINDEX(pce, pceNum)];
		score += KnightTable[SQ64(sq)];
	}
	pce = PIECES.bN;
	for (pceNum = 0; pceNum < brd_pceNum[pce]; ++pceNum) {
		sq = brd_pList[PCEINDEX(pce, pceNum)];
		score -= KnightTable[MIRROR64(SQ64(sq))];
	}
	pce = PIECES.wB;
	for (pceNum = 0; pceNum < brd_pceNum[pce]; ++pceNum) {
		sq = brd_pList[PCEINDEX(pce, pceNum)];
		score += BishopTable[SQ64(sq)];
	}
	pce = PIECES.bB;
	for (pceNum = 0; pceNum < brd_pceNum[pce]; ++pceNum) {
		sq = brd_pList[PCEINDEX(pce, pceNum)];
		score -= BishopTable[MIRROR64(SQ64(sq))];
	}
	pce = PIECES.wR;
	for (pceNum = 0; pceNum < brd_pceNum[pce]; ++pceNum) {
		sq = brd_pList[PCEINDEX(pce, pceNum)];
		score += RookTable[SQ64(sq)];
		file = FilesBrd[sq] + 1;
		if (PawnRanksWhite[file] == RANKS.RANK_8) {
			if (PawnRanksBlack[file] == RANKS.RANK_1) {
				score += RookOpenFile;
			} else {
				score += RookSemiOpenFile;
			}
		}
	}
	pce = PIECES.bR;
	for (pceNum = 0; pceNum < brd_pceNum[pce]; ++pceNum) {
		sq = brd_pList[PCEINDEX(pce, pceNum)];
		score -= RookTable[MIRROR64(SQ64(sq))];
		file = FilesBrd[sq] + 1;
		if (PawnRanksBlack[file] == RANKS.RANK_1) {
			if (PawnRanksWhite[file] == RANKS.RANK_8) {
				score -= RookOpenFile;
			} else {
				score -= RookSemiOpenFile;
			}
		}
	}
	pce = PIECES.wQ;
	for (pceNum = 0; pceNum < brd_pceNum[pce]; ++pceNum) {
		sq = brd_pList[PCEINDEX(pce, pceNum)];
		score += RookTable[SQ64(sq)];
		file = FilesBrd[sq] + 1;
		if (PawnRanksWhite[file] == RANKS.RANK_8) {
			if (PawnRanksBlack[file] == RANKS.RANK_1) {
				score += QueenOpenFile;
			} else {
				score += QueenSemiOpenFile;
			}
		}
	}
	pce = PIECES.bQ;
	for (pceNum = 0; pceNum < brd_pceNum[pce]; ++pceNum) {
		sq = brd_pList[PCEINDEX(pce, pceNum)];
		score -= RookTable[MIRROR64(SQ64(sq))];
		file = FilesBrd[sq] + 1;
		if (PawnRanksBlack[file] == RANKS.RANK_1) {
			if (PawnRanksWhite[file] == RANKS.RANK_8) {
				score -= QueenOpenFile;
			} else {
				score -= QueenSemiOpenFile;
			}
		}
	}
	pce = PIECES.wK;
	sq = brd_pList[PCEINDEX(pce, 0)];
	if ((brd_material[COLOURS.BLACK] <= ENDGAME_MAT)) {
		score += KingE[SQ64(sq)];
	} else {
		score += KingO[SQ64(sq)];
	}
	pce = PIECES.bK;
	sq = brd_pList[PCEINDEX(pce, 0)];
	if ((brd_material[COLOURS.WHITE] <= ENDGAME_MAT)) {
		score -= KingE[MIRROR64(SQ64(sq))];
	} else {
		score -= KingO[MIRROR64(SQ64(sq))];
	}
	if (brd_pceNum[PIECES.wB] >= 2) score += BishopPair;
	if (brd_pceNum[PIECES.bB] >= 2) score -= BishopPair;
	if (brd_side == COLOURS.WHITE) {
		return score;
	} else {
		return -score;
	}
}
function evalSP(speechResult) {
	if (isEmpty(speechResult)) {
		return false;
	}
	Selected = {}
	let answer = Goal.answer = Selected.answer = normalize(speechResult, currentLanguage);
	let reqAnswer = Goal.reqAnswer = normalize(bestWord, currentLanguage);
	if (answer == reqAnswer) return true;
	else if (matchesAnyWordOrSound(Goal.info, answer)) return true;
	else if (matchingNumberOrTime(Goal.info, answer)) {
		return true;
	} else if (isAcceptableAnswerButNewSound(Goal.info, reqAnswer, answer)) {
		addAsSoundToDatabase(Goal.info, answer);
		return true;
	} else {
		return false;
	}
}
function evalSPA(speechResult) {
	if (isEmpty(speechResult)) {
		console.log('empty speechResult')
		return false;
	}
	Selected = {}
	let answer = Goal.answer = Selected.answer = normalize(speechResult, currentLanguage);
	let reqAnswer = Goal.reqAnswer = normalize(bestWord, currentLanguage);
	if (answer == reqAnswer) return true;
	else if (matchesAnyWordOrSound(Goal.info, answer)) return true;
	else if (matchingNumberOrTime(Goal.info, answer)) {
		return true;
	} else if (isAcceptableAnswerButNewSound(Goal.info, reqAnswer, answer)) {
		addAsSoundToDatabase(Goal.info, answer);
		return true;
	} else {
		return false;
	}
}
function evalSpecPath(n, relpath, R) {
	if (isEmpty(relpath)) return null;
	if (relpath == '.') return n;
	let iNext = firstNumber(relpath);
	nNext = n.sub[iNext];
	let newPath = stringAfter(relpath, '.' + iNext);
	if (isEmpty(newPath)) return nNext;
	else return evalSpecPath(nNext, newPath, R);
}
function evalTC(ev) {
	let id = evToClosestId(ev);
	ev.cancelBubble = true;
	let i = firstNumber(id);
	let item = Pictures[i];
	Selected = { pic: item, feedbackUI: item.div };
	if (item == Goal) { return true; } else { return false; }
}
function evalTP(ev) {
	let id = evToClosestId(ev);
	ev.cancelBubble = true;
	let i = firstNumber(id);
	let item = Pictures[i];
	Selected = { pic: item, feedbackUI: item.div, sz: getBounds(item.div).height };
	if (item.label == bestWord) { return true; } else { return false; }
}
function evaluate() {
	if (!canAct()) return;
	uiActivated = false; clearTimeouts();
	IsAnswerCorrect = G.instance.eval(...arguments);
	if (IsAnswerCorrect === undefined) { promptNextTrial(); return; }
	G.trialNumber += 1;
	if (!IsAnswerCorrect && G.trialNumber < G.trials && !calibrating()) { promptNextTrial(); return; }
	if (calibrating()) { DELAY = 300; if (IsAnswerCorrect) G.successFunc(false); else G.failFunc(); }
	else if (IsAnswerCorrect) { DELAY = Settings.spokenFeedback ? 1500 : 300; G.successFunc(); }
	else { DELAY = G.correctionFunc(); G.failFunc(); }
	setTimeout(removeMarkers, 1500);
	let nextLevel = scoring(IsAnswerCorrect);
	if (Score.gameChange) {
		setNextGame();
		if (unitTimeUp()) {
			setTimeout(() => gameOver('Great job! Time for a break!'), DELAY);
		} else {
			TOMain = setTimeout(startGame, DELAY);
		}
	} else if (Score.levelChange && nextLevel <= G.maxLevel) {
		G.level = nextLevel;
		setBadgeLevel(G.level);
		TOMain = setTimeout(startLevel, DELAY);
	} else {
		TOMain = setTimeout(startRound, DELAY);
	}
}
function evaluateBoard(move, prevSum, color) {
	var from = [8 - parseInt(move.from[1]), move.from.charCodeAt(0) - 'a'.charCodeAt(0)];
	var to = [8 - parseInt(move.to[1]), move.to.charCodeAt(0) - 'a'.charCodeAt(0)];
	if (prevSum < -1500) {
		if (move.piece === 'k') { move.piece = 'k_e' }
		else if (move.captured === 'k') { move.captured = 'k_e' }
	}
	if ('captured' in move) {
		if (move.color === color) {
			prevSum += (weights[move.captured] + pstOpponent[move.color][move.captured][to[0]][to[1]]);
		}
		else {
			prevSum -= (weights[move.captured] + pstSelf[move.color][move.captured][to[0]][to[1]]);
		}
	}
	if (move.flags.includes('p')) {
		move.promotion = 'q';
		if (move.color === color) {
			prevSum -= (weights[move.piece] + pstSelf[move.color][move.piece][from[0]][from[1]]);
			prevSum += (weights[move.promotion] + pstSelf[move.color][move.promotion][to[0]][to[1]]);
		}
		else {
			prevSum += (weights[move.piece] + pstSelf[move.color][move.piece][from[0]][from[1]]);
			prevSum -= (weights[move.promotion] + pstSelf[move.color][move.promotion][to[0]][to[1]]);
		}
	}
	else {
		if (move.color !== color) {
			prevSum += pstSelf[move.color][move.piece][from[0]][from[1]];
			prevSum -= pstSelf[move.color][move.piece][to[0]][to[1]];
		}
		else {
			prevSum -= pstSelf[move.color][move.piece][from[0]][from[1]];
			prevSum += pstSelf[move.color][move.piece][to[0]][to[1]];
		}
	}
	return prevSum;
}
function evalWP(wp) {
	let title = wp.title;
	if (title.includes('Adding') && !titla.includes('Fractions')) {
	}
}
function evenFloor(x) { let n = Math.floor(x); return n % 2 ? n - 1 : n; }
function everyinterval(n) {
	if ((myGameArea.frameNo / n) % 1 == 0) {
		return true;
	}
	return false;
}
function evNoBubble(ev) { ev.preventDefault(); ev.cancelBubble = true; }
function evStop(ev) {
	ev.preventDefault();
	ev.stopPropagation();
	ev.stopImmediatePropagation();
	ev.cancelBubble = true;
}
function evToClass(ev, className) {
	let elem = findParentWithClass(className);
	return elem;
}
function evToClosestId(ev) {
	let elem = findParentWithId(ev.target);
	return elem.id;
}
function evToId(ev) {
	let elem = findParentWithId(ev.target);
	return elem.id;
}
function evToId_g_(ev) {
	let elem = findParentWithId(ev.target);
	let s = elem.id;
	return s[0] == 'g' && s[1] == '_' ? stringAfter(s, '_') : s;
}
function evToIdParent(ev) {
	let elem = findParentWithId(ev.target);
	return elem;
}
function evToIdTNT(ev) {
	let elem = findParentWithId(ev.target);
	return elem.id;
}
function evToItem(ev) {
	let id = evToId(ev);
	let item = Items[id];
	return item;
}
function evToItemC(ev) { ev.cancelBubble = true; return evToItem(ev); }
function evToO(ev) {
	return getVisual(evToId(ev));
}
function evToProp(ev, prop) {
	let x = ev.target;
	while (isdef(x) && nundef(x.getAttribute(prop))) x = x.parentNode;
	return isdef(x) ? x.getAttribute(prop) : null;
}
function evToTargetAttribute(ev, attr) {
	let val = ev.target.getAttribute(attr);
	if (nundef(val)) { val = ev.target.parentNode.getAttribute(attr); }
	return val;
}
function ex00_sidebar(sidebar) {
	let styles = { hpadding: 12, vpadding: 4, fz: 20 };
	for (const link of ['short', 'link3super superlang dasdasdas', 'short']) {
		sidebar.addContent(`<a href='#'>${link}</a>`, styles);
	}
	sidebar.open(null, false);
}
function ex01_table(dContent) {
	console.log('dContent', dContent);
	mStyle(dContent, { bg: wyellow, position: 'relative' });
	let dTable = mDiv100(dContent);
	let d3 = mDiv(dTable, { position: 'absolute', left: 40, top: 4, bg: 'pink', w: 300, h: 300 });
}
function ex02_table(dContent) {
	console.log('dContent', dContent);
	mStyle(dContent, { bg: wyellow, position: 'relative', hmin: 1600 });
	let dTable = mDiv100(dContent);
}
function exchange_by_index(arr1, i1, arr2, i2) {
	let temp = arr1[i1];
	arr1[i1] = arr2[i2];
	arr2[i2] = temp;
}
function exchange_items_in_fen(fen, o0, o1) {
	let p0 = o0.path.split('.'); if (isdef(fen.players[p0[0]])) p0.unshift('players');
	let p1 = o1.path.split('.'); if (isdef(fen.players[p1[0]])) p1.unshift('players');
	let list0 = lookup(fen, p0);
	let list1 = lookup(fen, p1);
	if (isDict(list0) && isdef(list0.list)) list0 = list0.list;
	if (isDict(list1) && isdef(list1.list)) list1 = list1.list;
	elem_from_to(o0.key, list0, list1);
	elem_from_to(o1.key, list1, list0);
}
function executeFrame() {
	if (animate)
		requestAnimFrame(executeFrame);
	incrementSimulation();
	c.clearRect(0, 0, canvas.width, canvas.height);
	drawBox();
	drawCircle();
	if (mouse.down)
		drawLineToMouse();
}
function executeFunctionByName(functionName, context) {
	var args = Array.prototype.slice.call(arguments, 2);
	var namespaces = functionName.split('.');
	var func = namespaces.pop();
	for (var i = 0; i < namespaces.length; i++) {
		context = context[namespaces[i]];
	}
	return context[func].apply(context, args);
}
function executeMapping(mapping, otype, oid, o) {
	let mKey = mapping.id;
	let path = stringAfter(mKey, '.');
	let omap = parsePropertyPath(o, stringAfter(mKey, '.'));
	if (nundef(omap)) return;
	let func = mapping.type;
	let loc = mapping.loc;
	if (stringBefore(loc, '.') == 'this') {
		loc = parsePropertyPath(o, stringAfter(loc, '.'));
	}
	let mkLoc = UIS[loc];
	if (mkLoc && mkLoc.maxHeightFunc) {
		let hMax = mkLoc.maxHeightFunc();
		mkLoc.elem.style.setProperty('height', hMax + 'px');
	}
	let structObject = window[func](serverData.table, loc, o, oid, path, omap);
}
function existingPlayers(callback) { callback({ response: 'hallo' }); }
function exitToAddon(callback) {
	AD.callback = callback;
	enterInterruptState(); auxOpen = false;
	AD.run();
}
function exp_church(options) { return options.church == 'yes'; }
function exp_commissions(options) { return options.commission == 'yes'; }
function exp_dep(data) {
	if (isDict(data) && 'type' in data) {
		return [data];
	}
	if (is_Set(data) && data._set.length == 1) {
		return exp(data._set[0]);
	}
	if (is_Set(data) && data._set.length > 1) {
		return data._set.map(exp);
	}
	if (is_Tuple(data) && data._tuple.length == 1) {
		return exp(data._tuple[0]);
	}
	if (is_Tuple(data) && data._tuple.length > 1) data = data._tuple;
	if (isList(data) && empty(data)) return [];
	if (isList(data) && data.length == 1) return exp(data[0])
	if (isList(data)) {
		let a = exp(data[0]);
		let rest = data.slice(1);
		let tlist = exp(rest);
		return carteset(a, tlist);
	}
}
function exp_journeys(options) { return options.journey == 'yes'; }
function exp_rumors(options) { return options.rumors == 'yes'; }
function expand(e) {
	console.log('e', e)
	let res = [];
	let e2 = expand1(e);
	console.log('e2', e2)
	for (const el of e2) {
		if (isll(el)) el.map(x => res.push(x));
		else res.push(el);
	}
	return res;
}
function expand1(x) {
	if (isEmpty(x)) return [];
	if (isLiteral(x)) return [x.toString()];
	if (isActionElement(x)) return [x];
	if (isSingleton(x)) return expand1(firstElement(x));
	if (is_Set(x)) return x._set.map(el => expand1(el));
	if (isSet(x)) return x.set.map(el => expand1(el));
	if (is_Tuple(x)) {
		x = x._tuple;
		let a = expand1(firstElement(x));
		let b = x.slice(1);
		let c = expand1(x.slice(1));
		let d = extractActionLists(c);
		return carteset(a, d);
	}
	if (isTuple(x)) {
		let a = expand1(firstElement(x));
		let b = x.slice(1);
		let c = expand1(x.slice(1));
		let d = extractStringLists(c);
		testHelpers('a=', fj(a), 'b=', fj(b), 'c=', fj(c));
		testHelpers('d=', fj(d));
		return carteset(a, d);
	}
}
function expand1_99(x) {
	if (isList(x)) {
	}
	if (isDict(x)) {
		if ('_set' in x) {
			return handleSet(x._set);
		} else if ('_tuple' in x) {
			return handleTuple(x._tuple);
		} else if ('type' in x) {
			return handleAction(x);
		} else { error('IMPOSSIBLE OBJECT', x); return null; }
	} else { error('IMPOSSIBLE TYPE', x); return null; }
}
function expand99(e) {
	let res = [];
	e = expand1_99(e);
	for (const el of e) {
		if (isll(el)) el.map(x => res.push(x));
		else res.push(el);
	}
	return res;
}
function expandBoard(board, rNew, cNew, iInsert) {
	let [boardArrOld, rOld, cOld] = [board.fields.map(x => isdef(x.item) ? x.item.index : null), board.rows, board.cols];
	let boardArrNew = new Array(rNew * cNew);
	for (let r = 0; r < rNew; r++) {
		for (let c = 0; c < cNew; c++) {
			let i = iFromRowCol(r, c, rNew, cNew);
			let x = (rOld != rNew) ? r : c;
			if (x < iInsert) {
				let iOld = iFromRowCol(r, c, rOld, cOld);
				boardArrNew[i] = boardArrOld[iOld];
			}
			else if (x == iInsert) boardArrNew[i] = null;
			else {
				let [ir, ic] = (rOld != rNew) ? [r - 1, c] : [r, c - 1];
				let iOld = iFromRowCol(ir, ic, rOld, cOld);
				boardArrNew[i] = boardArrOld[iOld];
			}
		}
	}
	return { rows: rNew, cols: cNew, boardArr: boardArrNew, extras: [] };
}
function expandX(e) {
	console.log('e', e)
	let res = [];
	let e2 = expandX1(e);
	console.log('e2', e2)
	for (const el of e2) {
		if (isll(el)) el.map(x => res.push(x));
		else res.push(el);
	}
	return res;
}
function expandX1(x) {
	console.log('expand1', cnt, x); cnt += 1;
	if (is_Set(x) && x._set.length == 1) return x._set.map(el => expandX1(el));
	if (isDict(x) || isActionElement(x) || isLiteral(x)) return [x];
	if (is_Tuple(x)) x = x._tuple;
	if (Array.isArray(x)) {
		if (isEmpty(x)) return [];
		let a = expandX1(firstElement(x));
		let b = x.slice(1);
		let c = expandX1(b);
		console.log(c);
		let d = extractActionLists(c);
		console.log('a=', fj(a));
		console.log('b=', fj(b));
		console.log('c=', fj(c));
		console.log('d=', fj(d));
		return flat(cartesi(a, d));
	}
}
function explode(deck, w, h) {
	deck.cards.forEach(function (card, i) {
		card.setSide('front')
		card.animateTo({
			delay: 1000 + i * 2,
			duration: 500,
			ease: 'quartOut',
			x: Math.random() * w - w / 2,
			y: Math.random() * h - h / 2
		})
	});
}
function extendedObjectString(o, indent, simple, lstShow, lstOmit) {
	let s = ' '.repeat(indent) + (o.id ? o.id + ': ' : ' _ : ');
	for (const k in o) {
		if (k == 'id') continue;
		if (lstShow && lstShow.includes(k)
			|| lstOmit && !lstOmit.includes(k)
			|| simple && isSimple(o[k]) && !isComplexColor(o[k])) {
			if (isDict(o[k])) {
				s += '(' + extendedObjectString(o[k], indent, simple, lstShow, lstOmit) + ') ';
			} else s += k + ':' + o[k] + ' ';
		}
	}
	return s;
}
function extendPath(path, postfix) { return path + (endsWith(path, '.') ? '' : '.') + postfix; }
function extendRect(r4) { r4.l = r4.x; r4.t = r4.y; r4.r = r4.x + r4.w; r4.b = r4.t + r4.h; }
function extendWidth(w) { return replaceEvery(w, 'w', 2); }
function extract_game_options() {
	let opt = Session.game_options;
	return Session.game_options;
}
function extract_polygon(f) {
	var polygon = L.polygon(f.geometry.coordinates);
	if (f.geometry.type == 'MultiPolygon') {
		let max_area_polygon;
		let max_area = 0;
		for (poly in (f.geometry.coordinates)) {
			let polygon1 = turf.polygon((f.geometry.coordinates)[poly])
			area = turf.area(polygon1);
			if (area > max_area) {
				max_area = area
				max_area_polygon = polygon1;
			}
		}
		console.log('turf', turf)
		console.log('polymax', max_area_polygon)
		polygon = L.polygon(max_area_polygon.geometry.coordinates);
	}
	return polygon;
}
function extractActionLists(lst) {
	let res = [];
	for (const l of lst) {
		if (isListOfActionElements(l)) res.push(l);
		else if (isActionElement(l)) res.push([l]);
		else {
			let r2 = extractStringLists(l);
			r2.map(x => res.push(x));
		}
	}
	return res;
}
function extractActions(lst) {
	let res = [];
	for (const l of lst) {
		if (isListOfActionElements(l)) res.push(l);
		else if (isActionElement(l)) res.push([l]);
		else {
			let r2 = extractStringLists(l);
			r2.map(x => res.push(x));
		}
	}
	return res;
}
function extractColorsFromCss() {
	let arr = collectPropFromCss('background-color');
	var di = {};
	for (const o of arr) {
		let sarr = splitAtAnyOf(o.class, ' .-:,');
		let sColor = null;
		for (const w of sarr) {
			if (['w3', 'text', 'hover', 'border'].includes(w)) continue;
			sColor = w;
			break;
		}
		if (sColor && o.color) {
			di[sColor] = o.color; //"'" + o.color + "'"; //'hallo'; //o.color.toString();
		}
	}
	return di;
}
function extractKeywords(text) {
	let words = toWords(text, true);
	let res = [];
	for (const w of words) { if (isdef(CODE.all[w])) addIf(res, w); }
	return res;
}
function extractPixel(str) {
	if (isNumber(str)) return str;
	else return firstNumber(str);
}
function extractStringLists(lst) {
	console.log(lst);
	let res = [];
	for (const l of lst) {
		if (isListOfLiterals(l)) res.push(l);
		else if (isLiteral(l)) res.push([l]);
		else {
			let r2 = extractStringLists(l);
			r2.map(x => res.push(x));
		}
	}
	return res;
}
function extractTuples(x) {
	if (isList(x))
		if (isListOfListOfActions(x)) return x;
	return isList(x) && x.length > 0 ? stripSet(x[0]) : x;
}
function extractUniqueStrings(tupleList) {
	let idlist = [];
	tupleList.map(x => x.map(y => addIf_dep(y, idlist)));
	return idlist;
}
//#endregion

