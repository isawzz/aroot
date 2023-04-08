

async function onclickClosure() {
	let [dir, files, seed] = await get_dir_files_seed();
	let text = '', chunk = '', in_process = false, kw = null, di = {}, ckeys = [];
	let linestarts = [];
	for (const f of files) {
		let txt = await route_path_text(f);
		let fname = stringAfterLast(f, '/'); fname = stringBefore(fname, '.');
		text += `//#region ${fname}`;
		let lines = txt.split('\n'); //console.log('lines[0]',lines[0]);

		for (const line of lines) {
			if (['const', 'var', 'class', 'function', 'async'].some(x => line.startsWith(x))) {
				in_process = !in_process;
				if (in_process) {
					kw = firstWord(stringAfter(line, ' '));
				} else {
					assertion(isdef(kw), 'NO KAYWORDS!!!!!!!!!!');
					if (isdef(kw)) removeInPlace(ckeys, kw);
					di[kw] = chunk;
					chunk = '';
					ckeys.push(kw);
				}
			}
			text += line + '\n';
			chunk += line + '\n';
			addIf(linestarts, w); //lookupAddIfToList(linestarts,[fname],w,line[0])
		}
		text += `//#endregion ${fname}`;
	}

	console.log('di', di);
	console.log('keys', ckeys);
	console.log('linestarts', linestarts)


	AU.ta.value = text;

}
function _NO_computeClosure(symlist) {
  let keys = {};
  for (const k in CODE.di) { for (const k1 in CODE.di[k]) keys[k1] = CODE.di[k][k1]; }
  CODE.all = keys;
  CODE.keylist = Object.keys(keys)
  // let inter = intersection(Object.keys(keys), Object.keys(window));
  let done = {};
  let tbd = valf(symlist, ['start']);
  let MAX = 1007, i = 0;
  //let alltext = '';
  while (!isEmpty(tbd)) {
    if (++i > MAX) break;
    let sym = tbd[0];
		console.log('sym',sym)
    let o = CODE.all[sym];
		console.log('o',o)
    if (nundef(o)) o = getObjectFromWindow(sym);
		if (nundef(o)) {console.log('not',sym);removeInPlace(tbd,sym);continue;}
    if (o.type == 'var' && !o.name.startsWith('d') && o.name == o.name.toLowerCase()) { tbd.shift(); continue; }
    if (o.type != 'func') { tbd.shift(); lookupSet(done, [o.type, sym], o); continue; }
    let olive = window[sym];
    if (nundef(olive)) { tbd.shift(); lookupSet(done, [o.type, sym], o); continue; }
    let text = olive.toString();
		//console.log('text',text)
    //if (!isEmpty(text)) alltext += text + '\r\n';
    let words = toWords(text, true);
    words = words.filter(x => text.includes(' ' + x));
		//console.log('words',words)
    for (const w of words) {
      if (nundef(done[w]) && w != sym && (isdef(window[w]) || isdef(CODE.all[w]))) addIf(tbd, w);
    }
    tbd.shift();
    lookupSet(done, [o.type, sym], o);
  }

	console.log('done',done);
	return done;

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
function ___BAD___computeClosure(keysOrText = []) {
	if (nundef(keysOrText)) keysOrText=['start']
	let done = {};
	let tbd = isList(keysOrText) ? keysOrText : extractKeywords(keysOrText);

	let MAX = 1007, i = 0;
	while (!isEmpty(tbd)) {
		if (++i > MAX) break;

		let sym = tbd[0];
		let o = CODE.all[sym];
		if (nundef(o)) o = getObjectFromWindow(sym);

		if (!o) { tbd.shift(); continue; } //window[sym] is NOT a function type

		o.code = nundef(CODE.all[sym]) ? o.toString() : CODE.justcode[sym];
		o.history = CODE.history[sym];

		let text = o.code.trim();
		let words = toWords(text, true); //console.log('words', words);
		//words = words.filter(x=>text.includes(' '+x));
		for (const w of words) {
			if (nundef(done[w]) && w != sym && isdef(CODE.all[w])) addIf(tbd, w);
		}
		tbd.shift();

		lookupSet(done, [o.type, sym], o); //done[sym] = o;
	}

	return done;
	//console.log('_______________after', i, 'iter:')
	//console.log('done', done); //Object.keys(done));
	//console.log('tbd', tbd);

	let tres = '';
	for (const k of ['const', 'var', 'cla', 'func']) {
		console.log('done', k, done[k])
		let o = done[k]; if (nundef(o)) continue;
		let klist = get_keys(o);
		if (k == 'func') klist = sortCaseInsensitive(klist);
		else if (k == 'cla') klist = sortClassKeys(done);
		else if (k == 'const') klist = sortConstKeys(done).map(x => x.key);
		for (const k1 of klist) { //in done[k]) {
			//if (isLetter(k1) && k1 == k1.toLowerCase()) continue;
			let code = CODE.justcode[k1];
			//console.log('type',k,'key',k1,'code',code)
			if (!isEmptyOrWhiteSpace(code)) tres += code + '\r\n';
		}
	}

	return done;
	//console.log('result',tres);
	//downloadAsText(tres, 'mycode', 'js');
}

function isCodeWord(w) {
	return isdef(window[w]) || isdef(CODE.all[w])
}
function computeClosure(symlist) {
	let keys = {};
	for (const k in CODE.di) { for (const k1 in CODE.di[k]) keys[k1] = CODE.di[k][k1]; }
	CODE.all = keys;
	CODE.keylist = Object.keys(keys)
	let done = {};
	let tbd = valf(symlist, ['start']);
	let MAX = 1000000, i = 0;
	let visited = {};
	while (!isEmpty(tbd)) {
		if (++i > MAX) break; else console.log('i',i)
		let sym = tbd[0];
		if (isdef(visited[sym])) { tbd.shift(); continue; }
		visited[sym] = true;
		let o = CODE.all[sym];
		if (nundef(o)) o = getObjectFromWindow(sym);
		if (nundef(o)) { tbd.shift(); continue; }
		if (o.type == 'var' && !o.name.startsWith('d') && o.name == o.name.toLowerCase()) { tbd.shift(); continue; }
		if (o.type == 'var' || o.type == 'const') { tbd.shift(); lookupSet(done, [o.type, sym], o); continue; }

		//at this point *** sym is a func or class!!! ***
		let olive = window[sym];
		if (nundef(olive)) { tbd.shift(); lookupSet(done, [o.type, sym], o); continue; }

		let text = olive.toString(); //always using last function body!!!
		let words = toWords(text, true);

		//words = words.filter(x => text.includes(' ' + x) || text.includes(x + '(')  || text.includes(x + ','));
		//console.log('words',words)
		if (sym == 'compute_closure') console.log('', sym, words)

		for (const w of words) { if (nundef(done[w]) || nundef(visited[w]) && w != sym && isCodeWord(w)) addIf(tbd, w); }
		tbd.shift();

		done[sym] = o; //lookupSet(done, [o.type, sym], o);
	}

	//console.log('done',done);
	return done;

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

function computeClosure(symlist) {
	let keys = {};
	for (const k in CODE.di) { for (const k1 in CODE.di[k]) keys[k1] = CODE.di[k][k1]; }
	CODE.all = keys;
	CODE.keylist = Object.keys(keys)
	let done = {};
	let tbd = valf(symlist, ['start']);
	let MAX = 1000000, i = 0;
	let visited = {};
	while (!isEmpty(tbd)) {
		//console.log(tbd)
		if (++i > MAX) break;
		let sym = tbd[0];
		if (isdef(visited[sym])) { tbd.shift(); continue; }
		visited[sym]=true;
		let o = CODE.all[sym];
		// if (sym == 'ensureColorDict') console.log('!!!!',sym)
		if (sym == 'MS') console.log('!!!!',sym)
		if (nundef(o)) o = getObjectFromWindow(sym);
		if (nundef(o)) { tbd.shift(); continue; } //console.log('not',sym);
		if (o.type == 'var' && !o.name.startsWith('d') && o.name == o.name.toLowerCase()) { tbd.shift(); continue; }
		if (o.type != 'func' && o.type != 'cla') { tbd.shift(); lookupSet(done, [o.type, sym], o); continue; }

		//at this point *** sym is a func!!! ***
		let olive = window[sym];
		if (nundef(olive)) { tbd.shift(); lookupSet(done, [o.type, sym], o); continue; }

		let text = olive.toString(); //always using last function body!!!
		let words = toWords(text, true);

		//words = words.filter(x => text.includes(' ' + x) || text.includes(x + '(')  || text.includes(x + ','));
		//console.log('words',words)
		if (sym=='compute_closure') console.log('',sym,words)
		//if (sym=='colorFrom') console.log('',sym,words, words.includes('ensureColorDict'))
		for (const w of words) {
			if (nundef(done[w]) && w != sym && isCodeWord(w)) addIf(tbd, w);
		}
		tbd.shift();
		// if (sym=='colorFrom') console.log('',sym, tbd.includes('ensureColorDict'))
		if (sym == 'MS') console.log('', sym, tbd.includes('MSCATS'))
		lookupSet(done, [o.type, sym], o);
	}

	//console.log('done',done);
	return done;

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


function compute_closure(code) {
	if (nundef(code)) code = AU.ta.value;
	let disub = computeClosure();
	//console.log('disub', disub);//return;
	let keydict = {};
	for (const type in disub) {
		let klist = sortCaseInsensitive(get_keys(disub[type]));
		klist.map(x => keydict[x] = disub[type][x]);
	}
	CODE.lastClosure = disub;
	CODE.closureKeys = keydict;
	let ksorted = [];
	for (const k of CODE.keysSorted) { if (isdef(CODE.closureKeys[k])) ksorted.push(k); }
	CODE.closureKeysSorted = ksorted;
	write_code_text_file();
}

function compute_closure(code) {
	if (nundef(code)) code = AU.ta.value;
	let disub = computeClosure();
	console.log('disub', disub);//return;
	let keydict = {};
	for (const type in disub) {
		let klist = sortCaseInsensitive(get_keys(disub[type]));
		klist.map(x => keydict[x] = disub[type][x]);
	}
	CODE.lastClosure = disub;
	CODE.closureKeys = keydict;
	let ksorted = [];
	for (const k of CODE.keysSorted) {
		if (isdef(CODE.closureKeys[k])) ksorted.push(k);
	}
	CODE.closureKeysSorted = ksorted;

	//hier muss ich all die closurekeys die NICHT in closureKeysSorted sind reinnehmen!!!!!!!
	//das wenn ich WIRKLICH nur 1 closure file will!!!!!!!
	//let 
	let otherKeys = arrMinus(get_keys(keydict), ksorted);
	//console.log('rest',otherKeys)
	//ja, leider sind bei den otherkeys auch native keys drin!!! so geht es also nicht!
	//console.log('BUILTIN',BUILTIN)
	let others = otherKeys.filter(x => !OWNPROPS.includes(x));
	console.log('my keys', sortCaseInsensitive(ksorted.concat(others)))

	let text = '';
	//let firstvar=true;
	for (const k of CODE.closureKeysSorted) {
		let o = lookup(CODE, ['all', k]);

		let code = (lookup(o, ['type']) == 'func' && isdef(window[k]) ? window[k].toString() : CODE.justcode[k]);

		//if (code.startsWith('var') && firstvar){firstvar=false; text+='\n';}

		if (code.includes('d =>')) {
			console.log('WTF??????????????????', k, code);
		} else text += code + '\n';

		//if (k == 'pSBCr') console.log('yes',code)


		//text += '\n';
		//let code = isdef(CODE.all[k]) && C
	}
	for (const k of others) {
		let code = window[k].toString();
		text += code + '\n';
	}

	text = replaceAllSpecialChars(text, '\r', ''); // replaceAllSafe(text,'\r','')
	//text = text.replace(/(?:\\[rn])+/g, "\n");
	AU.ta.value = text;

}

function entrybody() {
	//const BUILTIN = Object.keys(window);
	const OWNPROPS = Object.getOwnPropertyNames(window).concat(Object.getOwnPropertyNames(EventTarget.prototype));
	const OWNPROPS1 = Object.getOwnPropertyNames(window);
	const OWNBODY = Object.getOwnPropertyNames(document);
	console.log(':', Object.getOwnPropertyNames(EventTarget.prototype));
	//console.log('BUILTIN', BUILTIN, '\nOWN', OWNPROPS, '\nbody', OWNBODY);
	console.log('own1', OWNPROPS1);
	let obj = this;
	for (var key in obj.prototype) {
		console.log('key', key);
	}

}
function _test_ui() {
	let dbody = document.body; mClass(dbody, 'fullpage airport'); addDummy(dbody);
	let areas = [
		'dTestButtons dTestButtons',
		'dSearch dSidebar',
		'dFiddle dSidebar',
		'dTable dSidebar',
		'dFooter dSidebar',
	];
	let cols = '1fr 240px';
	let rows = 'auto auto 1fr auto auto';

	let [bg, fg] = [rColorTrans(50, 10, 100, [150, 230]), 'contrast']; //console.log('colors:', bg, fg);	//bg='hsla(120,100%,25%,0.3)';
	dPage = mGridFrom(dbody, areas, cols, rows); //, { hmax:'96%',padding: 4, box: true, bg: bg, fg: fg });

	// for(const ch of arrChildren(dPage)){mStyle(ch,{bg:rColor()})}
	for (const ch of [dTestButtons, dSearch, dFiddle, dSidebar, dTable, dFooter]) { mStyle(ch, { bg: rColor('green', 'blue', .5) }) };

	let elem = mSearch('keywords:', mySearch, dSearch, {}, { selectOnClick: true });

}

function mStyle(elem, styles, unit = 'px') {
	//if (styles.bg == '#00000000') console.log('mStyle',getFunctionsNameThatCalledThisFunction(), styles.bg,styles.fg)
	elem = toElem(elem);
	if (isdef(styles.vmargin)) { styles.mabottom = styles.matop = styles.vmargin; }
	if (isdef(styles.hmargin)) { styles.maleft = styles.maright = styles.hmargin; }

	//console.log(':::::::::styles',styles)
	let bg, fg;
	if (isdef(styles.bg) || isdef(styles.fg)) {
		[bg, fg] = colorsFromBFA(styles.bg, styles.fg, styles.alpha);
	}
	if (isdef(styles.vpadding) || isdef(styles.hpadding)) {

		styles.padding = valf(styles.vpadding, 0) + unit + ' ' + valf(styles.hpadding, 0) + unit;
		//console.log('::::::::::::::', styles.vpadding, styles.hpadding)
	}
	if (isdef(styles.upperRounding)) {
		let rtop = '' + valf(styles.upperRounding, 0) + unit;
		let rbot = '0' + unit;
		styles['border-radius'] = rtop + ' ' + rtop + ' ' + rbot + ' ' + rbot;
	} else if (isdef(styles.lowerRounding)) {
		let rbot = '' + valf(styles.lowerRounding, 0) + unit;
		let rtop = '0' + unit;
		styles['border-radius'] = rtop + ' ' + rtop + ' ' + rbot + ' ' + rbot;
	}

	if (isdef(styles.box)) styles['box-sizing'] = 'border-box';
	//console.log(styles.bg,styles.fg);

	for (const k in styles) {
		//if (k=='textShadowColor' || k=='contrast') continue; //meaningless styles => TBD
		let val = styles[k];
		let key = k;
		//console.log('key',key)
		if (isdef(STYLE_PARAMS[k])) key = STYLE_PARAMS[k];
		else if (k == 'font' && !isString(val)) {
			//font would be specified as an object w/ size,family,variant,bold,italic
			// NOTE: size and family MUST be present!!!!!!! in order to use font param!!!!
			let fz = f.size; if (isNumber(fz)) fz = '' + fz + 'px';
			let ff = f.family;
			let fv = f.variant;
			let fw = isdef(f.bold) ? 'bold' : isdef(f.light) ? 'light' : f.weight;
			let fs = isdef(f.italic) ? 'italic' : f.style;
			if (nundef(fz) || nundef(ff)) return null;
			let s = fz + ' ' + ff;
			if (isdef(fw)) s = fw + ' ' + s;
			if (isdef(fv)) s = fv + ' ' + s;
			if (isdef(fs)) s = fs + ' ' + s;
			elem.style.setProperty(k, s);
			continue;
		} else if (k == 'classname') {
			mClass(elem, styles[k]);
		} else if (k == 'border') {
			//console.log('________________________YES!')
			if (isNumber(val)) val = `solid ${val}px ${isdef(styles.fg) ? styles.fg : '#ffffff80'}`;
			if (val.indexOf(' ') < 0) val = 'solid 1px ' + val;
		} else if (k == 'layout') {
			if (val[0] == 'f') {
				//console.log('sssssssssssssssssssssssssssssssssssssssssssss')
				val = val.slice(1);
				elem.style.setProperty('display', 'flex');
				elem.style.setProperty('flex-wrap', 'wrap');
				let hor, vert;
				if (val.length == 1) hor = vert = 'center';
				else {
					let di = { c: 'center', s: 'start', e: 'end' };
					hor = di[val[1]];
					vert = di[val[2]];

				}
				let justStyle = val[0] == 'v' ? vert : hor;
				let alignStyle = val[0] == 'v' ? hor : vert;
				elem.style.setProperty('justify-content', justStyle);
				elem.style.setProperty('align-items', alignStyle);
				switch (val[0]) {
					case 'v': elem.style.setProperty('flex-direction', 'column'); break;
					case 'h': elem.style.setProperty('flex-direction', 'row'); break;
				}
			} else if (val[0] == 'g') {
				//layout:'g_15_240' 15 columns, each col 240 pixels wide
				//console.log('sssssssssssssssssssssssssssssssssssssssssssss')
				val = val.slice(1);
				elem.style.setProperty('display', 'grid');
				let n = allNumbers(val);
				let cols = n[0];
				let w = n.length > 1 ? '' + n[1] + 'px' : 'auto';
				elem.style.setProperty('grid-template-columns', `repeat(${cols}, ${w})`);
				elem.style.setProperty('place-content', 'center');
			}
		} else if (k == 'layflex') {
			elem.style.setProperty('display', 'flex');
			elem.style.setProperty('flex', '0 1 auto');
			elem.style.setProperty('flex-wrap', 'wrap');
			if (val == 'v') { elem.style.setProperty('writing-mode', 'vertical-lr'); }
		} else if (k == 'laygrid') {
			elem.style.setProperty('display', 'grid');
			let n = allNumbers(val);
			let cols = n[0];
			let w = n.length > 1 ? '' + n[1] + 'px' : 'auto';
			elem.style.setProperty('grid-template-columns', `repeat(${cols}, ${w})`);
			elem.style.setProperty('place-content', 'center');
		}

		//console.log(key,val,isNaN(val));if (isNaN(val) && key!='font-size') continue;
		//if (k == 'bg') console.log('style', k, key, val, bg)

		if (key == 'font-weight') { elem.style.setProperty(key, val); continue; }
		else if (key == 'background-color') elem.style.background = bg;
		else if (key == 'color') elem.style.color = fg;
		else if (key == 'opacity') elem.style.opacity = val;
		else if (key == 'wrap') elem.style.flexWrap = 'wrap';
		else if (startsWith(k, 'dir')) {
			//console.log('.................................................!!!!!!!!!!!!!!!!!!!!!!!')
			//console.log('val',val);
			isCol = val[0] == 'c';
			elem.style.setProperty('flex-direction', 'column'); //flexDirection = isCol ? 'column' : 'row';
			//in order for this to work, HAVE TO set wmax or hmax!!!!!!!!!!!!!
			// if (isCol && nundef(styles.hmax)) { //?????????????? WTF??????????????????
			// 	let rect = getRect(elem.parentNode); //console.log('rect', rect);
			// 	elem.style.maxHeight = rect.h * .9;
			// 	elem.style.alignContent = 'start';
			// } else if (nundef(styles.wmax)) elem.style.maxWidth = '90%';
		} else if (key == 'flex') {
			if (isNumber(val)) val = '' + val + ' 1 0%';
			elem.style.setProperty(key, makeUnitString(val, unit));
		} else {
			//console.log('set property',key,makeUnitString(val,unit),val,isNaN(val));
			//if ()
			elem.style.setProperty(key, makeUnitString(val, unit));
		}
	}
}


function rest() {
	let areas = [
		'dTestButtons dTestButtons',
		'dSearch dSidebar',
		'dFiddle dSidebar',
		'dTable dSidebar',
		'dFooter dSidebar',
	];
	let cols = '1fr 240px';
	let rows = 'auto auto 1fr auto auto';

	let [bg, fg] = [rColorTrans(50, 10, 100, [150, 230]), 'contrast']; //console.log('colors:', bg, fg);	//bg='hsla(120,100%,25%,0.3)';
	dPage = mGridFrom(d, areas, cols, rows, { hmax: '96%', padding: 4, box: true, bg: bg, fg: fg });

	let elem = mSearch('keywords:', mySearch, dSearch, {}, { selectOnClick: true });
	let bs = mDiv(elem, { 'grid-column': '1 / span 3', display: 'flex', gap: 4 });
	mButton('name', onclickFulltext, bs, { align: 'center', w: 110 });
	mButton('insensitive', onclickCase, bs, { align: 'center', w: 210 });
	mButton('anywhere', onclickWhere, bs, { align: 'center', w: 210 });

	mStyle(dFiddle, { h: 800, bg: GREEN });
	mDom(dFiddle, {}, { html: 'Edit Code:' });
	AU.ta = mDom(dFiddle, { fz: 18, family: 'consolas', w100: true, box: true, h: 'rest', bg: colorTrans(bg, 1), fg: 'black' }, { tag: 'textarea', id: 'ta', className: 'plain' });

	mFlex(dTestButtons);
	mButton('TEST', onclickTest, dTestButtons); //mDom(dTestButtons, { bg: bg, hpadding: 10, vpadding: 4, rounding: 8, cursor: 'pointer' }, { onclick: onclickTest, className: 'hop1', html: 'TEST' });

	addEventListener('keydown', execute_on_control_enter)
	//mDom(dTable, {margin:10,bg:'#222'}, { html: 'HAAAAAAAAAALLLLLLLLLOOOOOO', editable: true, selectOnClick: true });
	//dUnten = mDiv(dTable, {box:true,w:'100%',h:400,bg:'#222'});
}

//#region gc SUPERCARDS

function gcTest() {
	let deck = gcDeck('num', 5 * 5, 2, ['green', 'orange', 'violet']);
	mClear('dTable'); dTable = mBy('dTable'); mStyle(dTable, { gap: 10 }); mCenterFlex(dTable);
	let hand = deck.deal(10);
	ui_type_gcHand(hand, dTable);
}

function gcDeck(type = 'c52', total = 52, repeat = 1, colors = ['red', 'black'], opts = {}) {
	let ranks, suits, letter = valf(opts.letter, 'n');
	if (type == 'c52') {
		addKeys({ lowAce: true, lowJoker: true, numJokers: 0 }, opts)
		//if (isdef(opts.jokers)) ranks='*';
		ranks = opts.lowAce ? 'A23456789TJQK' : '23456789TJQKA';
		if (opts.numJokers > 0) ranks = opts.lowJoker ? ('*' + ranks) : (ranks + '*');
		suits = 'SHDC';
	} else if (type == 'num') {

	}
	return {
		ckeys: ckeys,
		colors: colors,
		ctype: type,
		letter: letter,
		ranks: ranks,
		suits: suits,
	}
}

function ui_type_gcHand(list, dParent) {

}

//#endregion

function restrest() {
	console.log('Z', Z)
	console.log('mode', isdef(Z) ? Z.mode : 'no Z available!'); //valf(Z.mode,Cliendata.mode,''));
	return;
	// let html = `<a id="aAdvancedMenu" href="javascript:onclick_advanced_menu()">≡</a>`;
	let html = `<a href="javascript:onclick_advanced_test()">T</a>`;
	let btest = mCreateFrom(html);
	let mode = 'multi';
	html = `<a href="javascript:onclick_advanced_mode()">${mode[0].toUpperCase()}</a>`;
	let bmode = mCreateFrom(html);
	let d = mCreate('div');
	mAppend(d, btest);
	mAppend(d, bmode);
	mStyle(btest, styles);
	mStyle(bmode, styles);
	//mStyle(b, { bg: 'silver', hpadding: 6, maright: 10, rounding: 4 });
	// mStyle(b, { bg: 'silver', hpadding: 6, maright: 10, rounding: 4 });
	mClass(btest, 'hop1')
	mClass(bmode, 'hop1')
	return d;
}
function rest_show_role() {
	let hotseatplayer = Z.uname != Z.uplayer && Z.mode == 'hotseat' && Z.host == Z.uname;

	let styles, text;
	let boldstyle = { fg: 'red', weight: 'bold', fz: 20 };
	let normalstyle = { fg: 'black', weight: null, fz: null };
	let location = ''; //`<span style="color:dimgray;font-family:Algerian">${Z.friendly}  </span>`; // `in ${stringAfter(Z.friendly,'of ')}`;
	if (hotseatplayer) {
		styles = boldstyle;
		text = `your turn for ${Z.uplayer}`;
		// text = `your turn for ${Z.uplayer} ${location}`;
	} else if (Z.role == 'spectator') {
		styles = normalstyle;
		text = `(spectating)`;
		//text = `(spectating  ${location})`;
	} else if (Z.role == 'active') {
		styles = boldstyle;
		text = `It's your turn!!!`;
		//text = `It's your turn  ${location}!`;
	} else if (Z.role == 'waiting') {
		text = `waiting for players to complete their moves...`;
		//text = `waiting for players to complete their moves ${location}...`;
	} else {
		assertion(Z.role == 'inactive', 'role is not active or inactive or spectating ' + Z.role);
		styles = normalstyle;
		text = `(${Z.turn[0]}'s turn)`;
	}
	d.innerHTML = text;
	mStyle(d, styles);
}

function accuse_replaced_membership() {
	let [A, uplayer, fen, accused] = [Z.A, Z.uplayer, Z.fen, Z.fen.accused];

	assertion(accused == uplayer, "accuse_replace_membership: WRONG PLAYER!!!!")
	let card = A.items[A.selected[0]].a;
	//remove from hand, set membership
	let pl = fen.players[uplayer];
	accuse_discard(pl.membership)
	pl.membership = card;
	removeInPlace(pl.hand, card);
	fen.newpresident = Z.stage == 'accuse_action_entlarvt' ? null : accused;
	delete fen.msg;
	Z.turn = [fen.president];
	Z.stage = Z.stage == 'accuse_action_entlarvt' ? 'accuse_action_policy' : 'accuse_action_new_president';
	ari_history_list(`${accused} chooses new membership` + (TESTHISTORY ? ` ${card}` : ''), 'accuse');
	take_turn_fen_clear(); //!!!!clear added!!!!

}

function rest() {
	let ranks = fen.ranks;
	let tb = {
		4: ['4', '5', 5, 12, 1],
		5: ['4', 'T', 6, 2, 1],
		6: ['2', 'T', 6, 0, 1],
		7: ['A', 'T', 6, 2, 1],
		8: ['2', 'K', 6, 0, 1],
		9: ['A', 'K', 6, 0, 1],
		10: ['2', 'K', 5, 2, 1],
		11: ['A', 'K', 5, 3, 1],
		12: ['2', '8', 5, 4, 2],
		13: ['2', '9', 5, 2, 2],
		14: ['2', '9', 5, 2, 2], //add 4 10s
	};
	if (nundef(players)) players = get_keys(fen.players);
	let N = players.length;

	let deck_ballots = [];
	let [r0, r1, handsize, jo, numdecks] = tb[N];

	for (let i = ranks.indexOf(r0); i <= ranks.indexOf(r1); i++) {
		for (let nd = 0; nd < numdecks; nd++) {
			let c = ranks[i];
			for (const suit of 'SHDC') { deck_ballots.push(c + suit + 'n'); }
		}
	}
	if (N == 14) { for (const suit of 'SHDC') { deck_ballots.push('T' + suit + 'n'); } }

	// *** jokers ***
	// for (let i = 0; i < jo; i++) { deck_ballots.push('A' + (i % 2 ? 'H' : 'S') + 'n'); }  //'' + (i%2) + 'J' + 'n');
	// for (let i = 0; i < jo; i++) { deck_ballots.push('' + (i%2) + 'J' + 'n'); } 
	for (let i = 0; i < jo; i++) { deck_ballots.push('*' + (i % 2 ? 'H' : 'S') + 'n'); }

	shuffle(deck_ballots);	//console.log('deck', deck_ballots);
	fen.deck_ballots = deck_ballots;
	fen.handsize = handsize;
	//console.log('deck_ballots:::',deck_ballots.length);
	for (const plname in fen.players) {
		let pl = fen.players[plname];
		pl.hand = deck_deal(deck_ballots, handsize);
	}
	//console.log('phase',fen.phase)
	let gens = lookup(fen, ['generations']);
	let last_winning_color = gens && gens.length >= 1 ? arrLast(gens).color : null;
	fen.policies = [];
	if (last_winning_color && fen.colors.includes(last_winning_color)) {
		fen.policies.push(get_color_card(last_winning_color));
	}
	fen.validvoters = jsCopy(players)
	fen.crisis = 0;
	delete fen.president;
	delete fen.newpresident;
	delete fen.isprovisional;
	delete fen.player_cards;
	delete fen.accused;
	delete fen.dominance;

	//ari_history_list(`*** generation ${fen.phase} starts ***`,'',fen)

}

function start_new_generation(fen, players, options) {
	let deck_discard = fen.deck_discard = [];

	//how many players are there
	if (nundef(players)) players = get_keys(fen.players);
	let N = players.length;

	//console.log('.....',options)
	//how many cards each player should get? options: 5 or 6 cards
	let handsize = fen.handsize;

	let ncards = handsize * N;
	let colors = ['red', 'black'];
	let n = 1;
	let deck_ballots = [];
	while (deck_ballots.length < ncards) {
		for (const c of colors) {
			for (const i of range(2)) {
				deck_ballots.push(`${n}_${c}`);
			}
		}
		n++;
	}
	fen.ranks = n;
	//console.log('deck', deck_ballots);
	shuffle(deck_ballots);	//console.log('deck', deck_ballots);
	fen.deck_ballots = deck_ballots;
	fen.handsize = handsize;
	//console.log('deck_ballots:::',deck_ballots.length);
	for (const plname in fen.players) {
		let pl = fen.players[plname];
		pl.hand = deck_deal(deck_ballots, handsize);
	}
	//console.log('phase',fen.phase)
	let gens = lookup(fen, ['generations']);
	let last_winning_color = gens && gens.length >= 1 ? arrLast(gens).color : null;
	fen.policies = [];
	if (last_winning_color && ['red', 'black'].includes(last_winning_color)) {
		fen.policies.push('Q' + (last_winning_color == 'red' ? 'H' : 'S') + 'n');
	}
	fen.validvoters = jsCopy(players)
	fen.crisis = 0;
	delete fen.president;
	delete fen.newpresident;
	delete fen.isprovisional;
	delete fen.player_cards;
	delete fen.accused;
	delete fen.dominance;
}

function show_left_netcard(plname, order) {
	let dx = lookup(UI, ['stats', plname]);
	dx = dx.douter;

	//need player next to plname in order
	let next = get_next_in_list(plname, order);
	let dx1 = lookup(UI, ['stats', next]);
	dx1 = dx1.douter;

	let r = getRect(dx);
	let r1 = getRect(dx1);
	console.log('r', r)
	let xcenter = r.r + (r1.l - r.r) / 2;

	let sz = 40;
	let wsz = sz * .7;
	let dmark = mDiv(dTable, { position: 'absolute', top: r.t + r.h / 2 - sz * 1.5, left: xcenter - wsz / 2, h: sz, w: wsz + 1 });//,bg:GREEN})

	let pl = Z.fen.players[plname];
	let idleft = get_color_card(pl.idleft, sz);
	let d = iDiv(idleft);
	mAppend(dmark, d)
}

function accuse_present(dParent) {
	//console.log('options',Z.options)
	mStyle(mBy('dTitle'), { display: 'grid', 'grid-template-columns': 'auto 1fr auto', h: 32 });

	DA.no_shield = true;
	let [fen, ui, stage, uplayer] = [Z.fen, UI, Z.stage, Z.uplayer];
	if (firsttime) { fen = Z.fen = getfen1(); firsttime = false; }
	let [dOben, dOpenTable, dMiddle, dRechts] = tableLayoutMR(dParent, 1, 0);
	let dt = dTable = dOpenTable; clearElement(dt); mCenterFlex(dt); mStyle(dt, { hmin: 700 })

	show_history(fen, dRechts);
	if (isdef(fen.msg)) { show_message(fen.msg, true); }

	let [hlg, hsm] = [80, 50];
	let [hpolcard, hvotecard, himg, hstatfz, hnetcard, hhandcard, gap] = [hsm, hlg, 50, 8, hsm, hlg, 4];
	let [hpol, hstat, hhand] = [hpolcard + 25, hvotecard + himg + hstatfz * 5 + gap * 2, hhandcard + 25];
	let [d1, d2, d3, d4, d5] = [mDiv(dt), mDiv(dt), mDiv(dt), mDiv(dt), mDiv(dt)];

	// *** d1 policies ***
	let [color, n] = get_policies_to_win();
	UI.policies = ui_type_accuse_hand(fen.policies, d1, { h: hpol }, '', 'policies', accuse_get_card_func(hsm, GREEN), false);
	mStyle(d1, { h: isEmpty(fen.policies) ? 40 : hpol, w: '90%', display: 'flex', gap: 12 })
	let msg = color == 'any' ? `${n} policies are needed to win!` : n <= 0 ? `${capitalize(color)} wins generation ${fen.generations.length}!` : `${capitalize(color)} needs ${n} more policies`
	let x = mDiv(d1, { h: isEmpty(fen.policies) ? 40 : hpolcard }, null, msg); mCenterCenterFlex(x)

	let [wgap, hgap] = [20, 12];
	let players = fen.players;
	let wneeded = (himg + wgap) * fen.plorder.length + wgap;
	let wouter = '95%';
	let order = get_present_order();
	let me = order[0];

	// *** d2 players ***
	if (Z.phase > Z.options.rounds) show_playerstats_over(d2); else show_playerstats_orig(d2);


	// *** d3 me ***
	mStyle(d3, { hmin: hstat, w: wouter }); mCenterFlex(d3);
	let dnet = mDiv(d3, { w: wneeded });
	let wrest = wneeded - 2 * himg;
	dnet.style.gridTemplateColumns = `64px 1fr 64px`;
	dnet.style.display = 'inline-grid';
	dnet.style.padding = `${hgap}px ${wgap}px`;

	let pl = fen.players[me];

	let par = (64 - hnetcard * .7) / 2;
	let d_idright = mDiv(dnet, { w: 64, padding: par });
	let idright = get_color_card(pl.idright, hnetcard); mAppend(d_idright, iDiv(idright))

	let dme_stats = mDiv(dnet, { display: 'flex', 'justify-content': 'center', 'align-items': 'space-evenly' });
	let dx = accuse_player_stat(dme_stats, me, hvotecard, himg, hstatfz, gap);
	let d_idleft = mDiv(dnet, { w: 64, padding: par });
	let idleft = get_color_card(pl.idleft, hnetcard); mAppend(d_idleft, iDiv(idleft))

	// *** d4 hand ***
	mStyle(d4, { margin: 10, h: hhand, w: '90%' }); mCenterFlex(d4);
	let handui = ui_type_accuse_hand(pl.hand, d4, {}, `players.${uplayer}.hand`, 'hand', accuse_get_card_func(hhandcard));
	lookupSetOverride(ui, ['players', uplayer, 'hand'], handui);

	presentcards(hvotecard);

	// *** show membership color for me (or in 'round' stage for all)
	let plnames = stage == 'round' || stage == 'gameover' ? order : [me];
	plnames.map(x => show_membership_color(x, hnetcard, himg));

	// if (Z.phase > Number(Z.options.rounds)) {
	// 	order.slice(1, order.length - 1).map(x => show_left_netcard(x,order));
	// 	order.map(x => show_membership_color(x, hnetcard, himg));
	// }
}

function show_left_netcard(plname, order) {

	console.log('hallo!!!!!!!!!!')

	let dx = lookup(UI, ['stats', plname]);
	dx = dx.douter;
	console.log('dx', dx, plname);

	//return;

	//need player next to plname in order
	let next = get_next_in_list(plname, order);
	let dx1 = lookup(UI, ['stats', next]);
	dx1 = dx1.douter;

	let r = getRect(dx);
	let r1 = getRect(dx1);
	console.log('r', r)
	let xcenter = r.r + (r1.l - r.r) / 2;
	let ycenter = r.t;//+(r.h/2);
	let ybot = r.t + r.h;
	console.log('center', xcenter, ycenter)

	let sz = 40;
	let wsz = sz * .7;
	let dmark = mDiv(dTable, { position: 'absolute', top: r.t + r.h / 2 - sz * 1.5, left: xcenter - wsz / 2, h: sz, w: wsz + 1 });//,bg:GREEN})

	let pl = Z.fen.players[plname];
	let idleft = get_color_card(pl.idleft, sz);
	let d = iDiv(idleft);
	mAppend(dmark, d)

	//now place 

	return;

	// let pl = Z.fen.players[plname];
	// let dParent = dx.douter;
	// mStyle(dParent, { position: 'relative' })

	// let dnew = mDiv(dParent, {});
	// let idleft = get_color_card(pl.idleft, 40);
	// let d = iDiv(idleft);
	// mAppend(dnew, d)
	// mPos(dnew, 82, 92)
}

function accuse_present(dParent) {
	//console.log('options',Z.options)
	mStyle(mBy('dTitle'), { display: 'grid', 'grid-template-columns': 'auto 1fr auto' });

	DA.no_shield = true;
	let [fen, ui, stage, uplayer] = [Z.fen, UI, Z.stage, Z.uplayer];
	if (firsttime) { fen = Z.fen = getfen1(); firsttime = false; }
	let [dOben, dOpenTable, dMiddle, dRechts] = tableLayoutMR(dParent, 1, 0);
	let dt = dTable = dOpenTable; clearElement(dt); mCenterFlex(dt); mStyle(dt, { hmin: 700 })

	show_history(fen, dRechts);
	if (isdef(fen.msg)) { show_message(fen.msg, true); }

	let [hlg, hsm] = [80, 50];
	let [hpolcard, hvotecard, himg, hstatfz, hnetcard, hhandcard, gap] = [hsm, hlg, 50, 8, hsm, hlg, 4];
	let [hpol, hstat, hhand] = [hpolcard + 30, hvotecard + himg + hstatfz * 5 + gap * 2, hhandcard + 30];
	let [d1, d2, d3, d4, d5] = [mDiv(dt), mDiv(dt), mDiv(dt), mDiv(dt), mDiv(dt)];
	//for (const d of [d1, d2, d3, d4, d5]) { mCenterCenterFlex(d); mStyle(d, { gap:10, w: '100%', hmin: h }) }

	// *** test example ***
	//fen.policies = ['QHn','QSn','AHn','2Dn'];
	// fen.players[uplayer].membership='QSn'


	// *** d1 policies ***
	let [color, n] = get_policies_to_win();
	//if (isEmpty(fen.policies))
	UI.policies = ui_type_accuse_hand(fen.policies, d1, { h: hpol }, '', 'policies', accuse_get_card_func(hsm, GREEN), false);
	//console.log(UI.policies);
	mStyle(d1, { h: isEmpty(fen.policies) ? 40 : hpol, w: '90%', display: 'flex', gap: 12 })
	let msg = color == 'any' ? `${n} policies are needed to win!` : `${capitalize(color)} needs ${n} more policies`
	let x = mDiv(d1, { h: isEmpty(fen.policies) ? 40 : hpolcard }, null, msg); mCenterCenterFlex(x)

	// *** d2 players ***
	let wgap = 20;
	let players = fen.players;
	//console.log('himg',himg)
	let wneeded = (himg + wgap) * fen.plorder.length + wgap;
	//console.log('wneeded',wneeded)
	let wouter = '95%';
	mStyle(d2, { hmin: hstat, w: wouter }); mCenterFlex(d2);
	// mStyle(d2, { hmin: hstat, w: wouter, bg:GREEN }); mCenterFlex(d2);
	//let dstats = mDiv(d2, { display: 'flex', 'justify-content': 'space-between', 'align-items': 'space-evenly',gap:20, w: 'auto' });
	//let dstats = mGrid(1,fen.plorder-1,d2,{display:'inline-grid',w:wneeded}); //, { display: 'flex', 'justify-content': 'space-between', 'align-items': 'space-evenly',gap:20, w: 'auto' });
	let dstats = mDiv(d2, { w: wneeded }); //, bg:'lime'});
	dstats.style.gridTemplateColumns = 'repeat(' + (fen.plorder.length - 1) + ',1fr)';
	dstats.style.display = 'inline-grid';
	dstats.style.padding = dstats.style.gap = `${wgap}px`;
	let order = get_present_order();
	let me = order[0];
	//console.log(`me:${me} uplayer:${uplayer}`)
	assertion(me == uplayer, "MEEEEEEEEEEEEEEE")
	//assertion(me == uplayer,'order wrong!!!!!!!!')
	//console.log('order',order)
	// for(const plname of order){
	// 	let cleft = fen.players[plname].idleft;
	// 	//console.log(get_color_of_card(cleft),cleft);
	// 	//console.log(plname);
	// 	let cright = fen.players[plname].idright;
	// 	//console.log(get_color_of_card(cright),cright);
	// }
	for (const plname of order.slice(1)) { accuse_player_stat(dstats, plname, hvotecard, himg, hstatfz, gap); }
	mLinebreak(d2)

	// *** d3 me ***
	//mStyle(d3, { hmin: hstat, wmax: wneeded, bg:ORANGE })
	mStyle(d3, { hmin: hstat, w: wouter }); mCenterFlex(d3);
	// mStyle(d3, { hmin: hstat, w: wouter, bg:RED }); mCenterFlex(d3);
	//let dnet = mDiv(d3, { display: 'inline-flex', 'justify-content': 'space-between', 'align-items': 'space-evenly', w: wneeded });
	let dnet = mDiv(d3, { w: wneeded }); //, bg:'orange'});
	let wrest = wneeded - 2 * himg;
	//console.log('wrest',wrest)
	// dnet.style.gridTemplateColumns = `${himg}px ${wrest}px ${himg}px`; // 'repeat(' + 3 + ',1fr)';
	//dnet.style.gridTemplateColumns = `${hnetcard*.7}px 1fr ${hnetcard*.7}px`; // 'repeat(' + 3 + ',1fr)';
	dnet.style.gridTemplateColumns = `64px 1fr 64px`; // 'repeat(' + 3 + ',1fr)';
	dnet.style.display = 'inline-grid';
	dnet.style.padding = `${wgap}px`; // = dstats.style.gap = `${wgap}px`;

	let pl = fen.players[me];

	let par = (64 - hnetcard * .7) / 2;
	let d_idright = mDiv(dnet, { w: 64, padding: par }); //align:'center'}); //let d_idleft = mDiv(dnet,{align:'left'})
	let idright = get_color_card(pl.idright, hnetcard); mAppend(d_idright, iDiv(idright))

	let dme_stats = mDiv(dnet, { display: 'flex', 'justify-content': 'center', 'align-items': 'space-evenly' });//, w: 200 });
	let dx = accuse_player_stat(dme_stats, me, hvotecard, himg, hstatfz, gap);
	if (isdef(pl.membership)) {
		let c = get_color_of_card(pl.membership);
		mStyle(dx.dcombi, { bg: c, rounding: hnetcard / 10 });//, patop: 4 })
		mStyle(dx.dstats, { bg: c, fg: 'white' });
		dx.dimg.firstChild.width = dx.dimg.firstChild.height = himg - 10;
	}
	//mStyle(dx.dcombi,{bg:isdef(pl.membership)?get_color_of_card(pl.membership):'transparent'});
	//let membership = get_color_card(pl.membership, hnet); mAppend(dme_stats, iDiv(membership))

	// let d_idright = mDiv(dnet,{paright:align:'center'}); //'right'})
	let d_idleft = mDiv(dnet, { w: 64, padding: par }); //align:'center'}); //let d_idleft = mDiv(dnet,{align:'left'})
	let idleft = get_color_card(pl.idleft, hnetcard); mAppend(d_idleft, iDiv(idleft))

	// *** d4 hand ***
	mStyle(d4, { matop: 10, h: hhand, w: '90%' }); mCenterFlex(d4);
	let handui = ui_type_accuse_hand(pl.hand, d4, {}, `players.${uplayer}.hand`, 'hand', accuse_get_card_func(hhandcard));
	//mStyle(handui.container,{wmax:300})
	lookupSetOverride(ui, ['players', uplayer, 'hand'], handui);

	presentcards(hvotecard);
}

function check_enough_policies() {
	let [stage, A, fen, phase, uplayer, turn, uname, host] = [Z.stage, Z.A, Z.fen, Z.phase, Z.uplayer, Z.turn, Z.uname, Z.host];
	//look if last X policies are same color =>dominance
	let policies_needed = fen.stability - fen.crisis;
	let arr = arrTakeLast(fen.policies, policies_needed);
	let color = arrAllSame(arr, get_color_of_card);
	if (color && arr.length >= policies_needed) {
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


function show_item_selector(dParent, items) {
	let A = Z.A;
	select_clear_previous_level();
	A.level++; A.items = items; A.callback = callback; A.selected = []; A.minselected = min; A.maxselected = max;
	//console.log('A.level', A.level)
	show_progress();
	let dInstruction = mBy('dSelections0');
	mClass(dInstruction, 'instruction');
	mCenterCenterFlex(dInstruction);
	// dInstruction.innerHTML = '<div>' + ((Z.role == 'active' ? `${get_waiting_html()}<span style="color:red;font-weight:bold;max-height:25px">You </span>` : `${Z.uplayer} `)) + "&nbsp;" + instruction; // + '</div>';
	dInstruction.innerHTML = (Z.role == 'active' ? `${get_waiting_html()}<span style="color:red;font-weight:bold;max-height:25px">You</span>` : `${Z.uplayer}`) + "&nbsp;" + instruction; // + '</div>';
	//console.log('A',A)
	if (too_many_string_items(A)) { mLinebreak(dInstruction, 4); } //console.log('triggered!!!') }
	//prep items and link to ui
	//console.log('haaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaA.items',items,A.items); //return;

	let has_submit_items = false;
	let buttonstyle = { maleft: 10, vmargin: 2, rounding: 6, padding: '4px 12px 5px 12px', border: '0px solid transparent', outline: 'none' }
	for (const item of A.items) {
		let type = item.itemtype = is_card(item) ? 'card' : is_player(item.a) ? 'player' : isdef(item.o) ? 'container' : is_color(item.a) ? 'color' : 'string'; // nundef(item.submit_on_click) ? 'string' : 'submit';
		if (isdef(item.submit_on_click)) { has_submit_items = true; }
		//if (type == 'submit') has_submit_items = true;
		let id = item.id = lookup(item, ['o', 'id']) ? item.o.id : getUID(); A.di[id] = item;
		if (type == 'string' || type == 'color') { //make button for this item!
			let handler = ev => select_last(item, isdef(item.submit_on_click) ? callback : select_toggle, ev);
			item.div = mButton(item.a, handler, dInstruction, buttonstyle, null, id);
			if (type == 'color') mStyle(item.div, { bg: item.a, fg: 'contrast' });
		} else {
			let ui = item.div = iDiv(item.o);
			ui.onclick = ev => select_last(item, select_toggle, ev); // show_submit_button ? _select_toggle : select_finalize;
			ui.id = id;
		}
	}

	//show_submit_button = show_submit_button && A.minselected != A.maxselected || !A.autosubmit; { bg: 'red', fg: 'white', maleft: 10 }
	let show_submit_button = !has_submit_items && (A.minselected != A.maxselected || !A.autosubmit);
	if (show_submit_button) { mButton('submit', callback, dInstruction, buttonstyle, 'selectable_button', 'bSubmit'); }

	let show_restart_button = A.level > 1; //show_submit_button && A.level > 1;
	if (show_restart_button) { mButton('restart', onclick_reload, dInstruction, buttonstyle, 'selectable_button', 'bReload'); }

	//now, mark all items for selection
	dParent = window[`dActions${A.level}`];
	for (const item of A.items) { ari_make_selectable(item, dParent, dInstruction); }

	//ich muss alle hand containers identifizieren!
	//let handcontainers = 

	//activate ui or automatic selection
	assertion(A.items.length >= min, 'less options than min selection!!!!', A.items.length, 'min is', min); //TODO: sollte das passieren, check in ari_pre_action die mins!!!
	if (A.items.length == min && !is_ai_player() && !prevent_autoselect) {
		//all items need to be selected!
		for (const item of A.items) { A.selected.push(item.index); ari_make_selected(item); }
		if (A.autosubmit) {
			//console.log('items.length==min und autosubmit!!!!!!!!!!!!!!!!!!')
			loader_on();
			//console.log('autosubmit because item.length == min items (so would have to select all items anyway)')
			setTimeout(() => { if (callback) callback(); loader_off(); }, 800);
		}
	} else if (is_ai_player()) {
		//console.log('ist ein BOT!!!');
		ai_move();
	} else if (TESTING && isdef(DA.test)) {
		if (DA.test.iter >= DA.auto_moves.length) {
			//console.log('test end');
			if (isdef(DA.test.end)) DA.test.end();
			activate_ui();
			return;
		}
		let selection = DA.auto_moves[DA.test.iter++];
		if (selection) {
			deactivate_ui();
			let numbers = [];
			for (const el of selection) {
				if (el == 'last') {
					numbers.push(A.items.length - 1);
				} else if (el == 'random') {
					numbers.push(rNumber(0, A.items.length - 1));
				} else if (isString(el)) {
					//this is a command!
					let commands = A.items.map(x => x.key);
					let idx = commands.indexOf(el);
					//console.log('idx of', el, 'is', idx)
					numbers.push(idx);
				} else numbers.push(el);
			}
			selection = numbers;
			A.selected = selection;
			if (selection.length == 1) A.command = A.items[A.selected[0]].key;
			A.last_selected = A.items[A.selected[0]];
			select_highlight();
			//console.log('DA.testing: selection', selection);
			setTimeout(() => {
				if (A.callback) A.callback();
			}, 1000);
		} else { activate_ui(); }
	} else { activate_ui(); }
}

function start() { let uname = null; if (isdef(uname)) U = { name: uname }; phpPost({ app: 'simple' }, 'assets'); }

function test_engine() {
	DA.test.list = [100, 101, 102];

	//wie starte ich die tests?
	test_engine_run_next(DA.test.list);
}

function stage_moves() {
	for (const a of arguments) {
		let [uname, x, cardname] = a.split('.');

		DA.chain.push(() => {
			//console.log('player',pl,'selects',a);
			let g = Session;
			let state = { selected: {} }; //{ id: a }
			state.selected[uname] = [a];
			let o = { uname: uname, tid: g.table.id, state: state, player_status: 'joined' };
			//console.log('sending to server',o)
			to_server(o, 'turn_update');

		})
	}
}
function old_stage_moves() {
	for (const a of arguments) {
		let [uname, x, cardname] = a.split('.');

		DA.chain.push(() => {
			//console.log('player',pl,'selects',a);
			let g = Session;
			let state = { selected: {} }; //{ id: a }
			state.selected[uname] = [a];
			let o = { uname: uname, tid: g.table.id, state: state, player_status: 'joined' };
			//console.log('sending to server',o)
			to_server(o, 'turn_send_move');

		})
	}
}
function _ui_game_menu_item_dep(g, g_tables = []) {
	function runderkreis(color, id) {
		return `<div id=${id} style='width:20px;height:20px;border-radius:50%;background-color:${color};color:white;position:absolute;left:0px;top:0px;'>` + '' + "</div>";
	}
	let [sym, bg, color, id] = [Syms[g.logo], g.color, null, getUID()];
	if (!isEmpty(g_tables)) {
		let t = g_tables[0]; //most recent table of that game
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



function eval_empty_votes(votes) {
	let [stage, A, fen, phase, uplayer, turn, uname, host] = [Z.stage, Z.A, Z.fen, Z.phase, Z.uplayer, Z.turn, Z.uname, Z.host];
	//console.log('pldata', Z.playerdata.map(x => x.state))
	//console.log('EMPTY VOTES!!!!!!!!!!!!!');
	let opt = valf(Z.options.empty_vote, 'add policy');
	if (opt == 'blank' || isEmpty(fen.policies)) {
		ari_history_list(`no votes!`, 'generation ends blank');
		accuse_score_update('white')
		Z.turn = jsCopy(Z.plorder);
		Z.stage = 'round';
		take_turn_fen_clear();
	} else if (opt == 'add policy') {
		let last_policy = arrLast(fen.policies);
		if (last_policy) {
			console.log('add policy, last:', last_policy)
			fen.policies.push(last_policy);
		}
		fen.validvoters = jsCopy(Z.plorder);
		check_enough_policies_or_start_new_poll(`no one voted: policy repeat`);
		// let end = check_enough_policies();
		// console.log('enough policies', end)
		// if (!end) { start_new_poll(); }
	} else { //generation end: last policy color wins!
		let last_policy = arrLast(fen.policies);

		let color = get_color_of_card(arrLast(fen.policies))
		ari_history_list(`no votes!`, `generation ends ${color}`);
		accuse_score_update(color)
		Z.turn = jsCopy(Z.plorder);
		Z.stage = 'round';
		take_turn_fen_clear();
	}

}

function start_new_generation(fen, players) {
	let deck_discard = fen.deck_discard = [];
	//let deck_ballots = create_fen_deck('n'); shuffle(deck_ballots);
	let ranks = fen.ranks;
	let tb = {
		5: ['4', 'T', 6, 2, 1],
		6: ['2', 'T', 6, 0, 1],
		7: ['A', 'T', 6, 2, 1],
		8: ['2', 'K', 6, 0, 1],
		9: ['A', 'K', 6, 0, 1],
		10: ['2', 'K', 5, 2, 1],
		11: ['A', 'K', 5, 3, 1],
		12: ['2', '8', 5, 4, 2],
		13: ['2', '9', 5, 2, 2],
		14: ['2', '9', 5, 2, 2], //add 4 10s
	};
	if (nundef(players)) players = get_keys(fen.players);
	let N = players.length;

	let deck_ballots = [];
	let [r0, r1, handsize, jo, numdecks] = tb[N];

	for (let i = ranks.indexOf(r0); i <= ranks.indexOf(r1); i++) {
		for (let nd = 0; nd < numdecks; nd++) {
			let c = ranks[i];
			for (const suit of 'SHDC') { deck_ballots.push(c + suit + 'n'); }
		}
	}
	if (N == 14) { for (const suit of 'SHDC') { deck_ballots.push('T' + suit + 'n'); } }
	// for (let i = 0; i < jo; i++) { deck_ballots.push('A' + (i % 2 ? 'H' : 'S') + 'n'); }  //'' + (i%2) + 'J' + 'n');
	for (let i = 0; i < jo; i++) { deck_ballots.push('' + (i % 2) + 'J' + 'n'); }

	//#region old
	// let [rmax, rmin, handsize] = isdef(tb[N]) ? tb[N] : ['A', 'K', Math.min(8, Math.floor(52 / N))];

	// //modiy handsize options.handsize
	// //handsize += Number(fen.inc_handsize_by);

	// let [imin, imax] = [ranks.indexOf(rmin), ranks.indexOf(rmax)];
	// //console.log('N',players.length,'minrank',imin,'maxrank',imax)
	// deck_ballots = deck_ballots.filter(x => {
	// 	let i = ranks.indexOf(x[0])
	// 	return i >= imin && i <= imax;
	// });
	//#endregion

	shuffle(deck_ballots); console.log('deck', deck_ballots);
	fen.deck_ballots = deck_ballots;
	fen.handsize = handsize;
	//console.log('deck_ballots:::',deck_ballots.length);
	for (const plname in fen.players) {
		let pl = fen.players[plname];
		pl.hand = deck_deal(deck_ballots, handsize);
		//hzcontrol(pl.hz=handsize;
	}
	fen.policies = [];
	fen.validvoters = jsCopy(players)
	delete fen.president;
	delete fen.newpresident;
	delete fen.isprovisional;
	delete fen.player_cards;
	delete fen.accused;
	delete fen.dominance;

	//ari_history_list(`*** generation ${fen.phase} starts ***`,'',fen)

}

function presentcards_old(h) {
	if (startsWith(Z.stage, 'hand')) {
		let donelist = Z.playerdata.filter(x => isDict(x.state) && isdef(x.state.item));
		//let reveal = donelist.length >= turn.length
		for (const pld of donelist) {
			let plname = pld.name;
			let plui = lookup(UI, ['stats', plname]);
			let dcard = plui.dcard;

			if (isEmpty(arrChildren(dcard))) {
				// console.log('dcard',dcard)
				let card = pld.state.item;
				let actualcard = plui.actualcard = !isEmpty(card)
				let card1 = plui.card = ari_get_card(actualcard ? card : 'AHn', h)
				mAppend(dcard, iDiv(card1));
			}
			if (!Z.fen.cardsrevealed || !plui.actualcard) face_down(plui.card);
		}
	}
}

function presentcards(h) {
	if (startsWith(Z.stage, 'hand')) {
		let donelist = Z.playerdata.filter(x => isDict(x.state) && isdef(x.state.item));
		//let reveal = donelist.length >= turn.length
		for (const pld of donelist) {
			let plname = pld.name;
			let plui = lookup(UI, ['stats', plname]);
			let dcard = plui.dcard;

			if (isEmpty(arrChildren(dcard))) {
				// console.log('dcard',dcard)
				let card = pld.state.item;
				let actualcard = plui.actualcard = !isEmpty(card)
				let card1 = plui.card = ari_get_card(actualcard ? card : 'AHn', h)
				mAppend(dcard, iDiv(card1));
			}
			if (!Z.fen.cardsrevealed || !plui.actualcard) face_down(plui.card);
		}
	}
}

function consensus_vote_payer() {
	let [A, uplayer, fen] = [Z.A, Z.uplayer, Z.fen];
	let plname = A.items[A.selected[0]].a;
	console.log('player', Z.uplayer, 'selects', plname);
	Z.state = { item: plname };
	ari_history_list(`${uplayer} selects ${plname}`, 'consensus tie');
	take_turn_multi();

}

function sort_by_rank(olist, prop = 'card', ranks = 'KQJT98765432A') {

}
function policy_added(votes) {

	let vsorted =
		lookupAddToList(fen, ['policies'], card);
	removeInPlace(fen.players[uplayer].hand, card);
	ari_history_list(`${uplayer} enacts a ${get_color_of_card(card)} policy`, 'policy')

	//look if last 5 policies are same color =>dominance
	let arr = arrTakeLast(fen.policies, fen.policies_needed);
	let color = arrAllSame(arr, get_color_of_card);
	if (color && arr.length >= fen.policies_needed) {
		//session ends here!!! 
		fen.dominance = true;
		ari_history_list(`${color} dominance reached!`, 'session ends')

		//update score
		accuse_score_update(color);
		Z.turn = jsCopy(Z.plorder);
		//Z.phase += 1
		Z.stage = 'round';
		take_turn_fen_clear();


	} else {
		president_end();
	}

}

function accuse_evaluate_votes() {
	let [stage, A, fen, phase, uplayer, turn, uname, host] = [Z.stage, Z.A, Z.fen, Z.phase, Z.uplayer, Z.turn, Z.uname, Z.host];
	assertion(uplayer == host && fen.cardsrevealed, 'NOT THE STARTER WHO COMPLETES THE STAGE!!!')
	let votes = [];
	for (const pldata of Z.playerdata) {
		let plname = pldata.name;
		let card = pldata.state.card;
		if (!isEmpty(card)) votes.push({ plname: plname, card: card });
		else removeInPlace(fen.validvoters, plname);
	}
	ari_history_list(votes.map(x => `${x.plname} ${x.card}`), 'poll');

	//resolve votes
	//0. check if unsuccessful (no votes)
	if (isEmpty(votes)) {
		console.log('EMPTY VOTES!!!!!!!!!!!!!');
		ari_history_list(`no votes!`, 'session ends');
		accuse_score_update('white')
		Z.turn = jsCopy(Z.plorder);
		Z.stage = 'round';
		take_turn_fen_clear();
		return;
	}
	//1. check if all votes same color (consensus)
	let color = get_color_of_card(votes[0].card);
	let allsame = true;
	for (const v of votes) {
		let c1 = get_color_of_card(v.card);
		if (c1 != color) { allsame = false; break; }
	}
	if (allsame) {
		console.log('...CONSENSUS!!!!!!!!!!!!!', color, votes);
		ari_history_list(`consensus on ${color}!`, 'session ends');
		accuse_score_update(color);
		Z.turn = jsCopy(Z.plorder);
		Z.stage = 'round';
		take_turn_fen_clear();
		return;
	}
	//2. check single winner if any (presidency)
	//sort votes by rank
	let ranks = 'KQJT98765432A';
	let vsorted = sortByFunc(votes, x => ranks.indexOf(x.card[0]));
	//schau ob eindeutig!
	let winning_vote = vsorted[0];
	if (votes.length > 1 && vsorted[1].card[0] == vsorted[0].card[0]) {
		winning_vote = null;
	}
	if (winning_vote) {
		let plwinner = winning_vote.plname;
		console.log('...WINNER PRESIDENT!!!!!!!!!!!!!', plwinner, winning_vote.card);
		//return all pending cards (from previous votes) to resp hands
		for (const plname in fen.players) {
			let pl = fen.players[plname];
			if (!isEmpty(pl.pending)) pl.pending.map(x => pl.hand.push(x));
			delete pl.pending;
		}
		//discard winning vote
		removeInPlace(fen.players[plwinner].hand, winning_vote.card);
		fen.deck_discard.push(winning_vote.card);
		fen.president = plwinner;
		fen.isprovisional = false;
		ari_history_list(`${plwinner} wins presidency!`, 'president');
		Z.turn = [plwinner];
		Z.stage = 'president';
		take_turn_fen_clear();
		return;
	}

	// console.log('STOP! Tie!!!!!!!!!!!!!', vsorted); return;
	//console.log('Tie!!!!!!!!!!!!!', vsorted);
	ari_history_list(`tie!`, 'new poll round');
	//played cards go into pending
	for (const v of vsorted) {
		let plname = v.plname;
		let pl = fen.players[plname];
		lookupAddToList(pl, ['pending'], v.card)
		removeInPlace(pl.hand, v.card);
	}
	//stage goes to hand
	Z.turn = get_valid_voters(); //vsorted.map(x => x.plname); //only active voters remain in poll
	Z.stage = 'hand';
	fen.cardsrevealed = false;
	take_turn_fen_clear();


}









// --------------- reverted to _nonsens accusefreez0
function transferToPlayer(plname) {
	//mFadeClearShow('dAdminRight', 300);
	mClear('dAdminMiddle');
	stopgame();
	clear_screen();
	U = null;

	//jetzt muss ich login mit game
	U = firstCond(Serverdata.users, x => x.name == plname);
	//localStorage.setItem('uname', U.name);
	//DA.secretuser = U.name;

	show_username(true);
}


function host_takes_over(plname) {
	transferToPlayer(plname); return;
	console.log('should start with', plname)
	U = firstCond(Serverdata.users, x => x.name == plname);
	start_with_assets(true);
}

function show_takeover_ui() {

	DA.omnipower = true;
	let [pldata, stage, A, fen, phase, uplayer, turn, uname, host] = [Z.playerdata, Z.stage, Z.A, Z.fen, Z.phase, Z.uplayer, Z.turn, Z.uname, Z.host];
	let votes = [];
	let dTakeover = mBy('dTakeover'); show(dTakeover); mClear(dTakeover);
	dTakeover.innerHTML = '' + stage + ': ';
	for (const plname of turn) {
		if (!has_player_state(plname)) {
			let pic = get_user_pic(plname, sz = 35, border = 'solid medium white');
			mStyle(pic, { cursor: 'pointer' })
			pic.onclick = () => host_takes_over(plname);
			mAppend(dTakeover, pic);
		}
	}
}


function host_takes_over(plname) {
	//console.log('=>>>',Z.uplayer,'will play for',plname,'!!!!!!!!!!!!!!!!!!!!!');
	let [pldata, stage, A, fen, phase, uplayer, turn, uname, host] = [Z.playerdata, Z.stage, Z.A, Z.fen, Z.phase, Z.uplayer, Z.turn, Z.uname, Z.host];
	if (stage == 'membership' || stage == 'hand') {
		//select a random card for membership for this player
		let hand = fen.players[plname].hand;
		let card = rChoose(hand);
		Z.state = { card: card };
		Z.uplayer = plname;
		console.log('...', Z.uplayer, '===>', card, Z.fen.players[Z.uplayer].hand)

		take_turn_multi();
	} else if (turn.length == 1) {
		U = firstCond(Serverdata.users, x => x.name == plname);
		start_with_assets(true);
	} else {
		console.log('STAGE NOT IMPLEMENTED', stage)
	}
}

function mistmist() {
	if (isdef(Clientdata.temp)) {
		let temp = Clientdata.temp;
		upl = temp.next;
		if (upl == temp.orig) {
			console.log('----- Clientdata.temp deleted!')
			delete Clientdata.temp;
		} else {
			temp.next = temp.orig;
		}
	}

}

function accuse_activate() {
	//return;
	let [pldata, stage, A, fen, phase, uplayer, turn, uname, host] = [Z.playerdata, Z.stage, Z.A, Z.fen, Z.phase, Z.uplayer, Z.turn, Z.uname, Z.host];

	let donelist = Z.playerdata.filter(x => isDict(x.state) && isdef(x.state.card));

	// let donehumans = donelist.filter(x=>is_human_player(x.name));
	// let humans_on_turn = turn.filter(x=>is_human_player(x));
	// let humanscomplete = ['hand', 'membership'].includes(stage) && donehumans.length >= humans_on_turn.length || stage == 'round' && firstCond(pldata, x => isDict(x));

	//sobald die humans complete sind, kann host uebernehmen und die bot moves machen und anschliessend gleich evaluaten

	let complete = ['hand', 'membership'].includes(stage) && donelist.length >= turn.length || stage == 'round' && firstCond(pldata, x => isDict(x));
	let humanscomplete = complete;
	// if (complete && uname == host){//} && turn.length>!sameList(turn,[Z.host])) {
	if (complete && !sameList(turn, [Z.host])) {
		console.log('complete', turn, sameList(turn, [Z.host]), 'uplayer', uplayer);
		Z.turn = [Z.host];
		take_turn_fen();
		return;
	}
	//if still here and multiturn: it cannot be humanscomplete or Z.host is only player on turn now!
	assertion(!humanscomplete || sameList(turn, [Z.host]), 'humanscomplete hat nicht zu host uebergeben!!!!!!!!!!')

	let waiting = isdef(donelist.find(x => x.name == uplayer)) && turn.length > 1;
	Z.isWaiting = false;

	if (humanscomplete && stage == 'hand') {
		assertion(sameList(turn, [Z.host]) && uplayer == Z.host, 'complete FEHLER!!!!!!!!!!!!!!!!!!!!!!!!!!', turn, Z.host, uplayer);

		//first, vote for bots!

		fen.cardsrevealed = true;
		DA.gobutton = mButton('reveal cards', () => { Z.turn = [uplayer]; Z.stage = 'handresolve'; take_turn_fen(); }, dTable, { w: 300 });
	} else if (stage == 'handresolve') {
		assertion(uplayer == Z.host && fen.cardsrevealed, 'NOT THE STARTER WHO COMPLETES THE STAGE!!!')
		DA.gobutton = mButton('evaluate cards', () => { Z.stage = 'handresolve_weiter'; take_turn_fen(); }, dTable, { w: 300 });
	} else if (stage == 'handresolve_weiter') {
		assertion(uplayer == Z.host && fen.cardsrevealed, 'NOT THE STARTER WHO COMPLETES THE STAGE!!!')
		let votes = [];
		for (const pldata of Z.playerdata) {
			let plname = pldata.name;
			let card = pldata.state.card;
			if (!isEmpty(card)) votes.push({ plname: plname, card: card });
			else removeInPlace(fen.validvoters, plname);
		}

		ari_history_list(votes.map(x => `${x.plname} ${x.card}`), 'poll');

		//resolve votes
		//0. check if unsuccessful (no votes)
		if (isEmpty(votes)) {
			//console.log('STOP! EMPTY VOTES!!!!!!!!!!!!!'); return;
			//console.log('EMPTY VOTES!!!!!!!!!!!!!');
			ari_history_list(`no votes!`, 'session ends');
			accuse_score_update('white')

			Z.turn = jsCopy(Z.plorder);
			Z.stage = 'round';
			take_turn_fen_clear();
			return;
		}
		//1. check if all votes same color
		let color = get_color_of_card(votes[0].card); //['H', 'D'].includes(votes[0].card[1]) ? 'red' : 'black';
		let allsame = true;
		for (const v of votes) {
			let c1 = get_color_of_card(v.card); //['H', 'D'].includes(v.card[1]) ? 'red' : 'black';
			if (c1 != color) { allsame = false; break; }
		}
		if (allsame) {
			//session ends! consensus
			//console.log('STOP! CONSENSUS!!!!!!!!!!!!!',color);return;
			//console.log('...CONSENSUS!!!!!!!!!!!!!', color, votes);
			ari_history_list(`consensus on ${color}!`, 'session ends');

			//update score
			accuse_score_update(color);

			Z.turn = jsCopy(Z.plorder);
			//Z.phase += 1
			Z.stage = 'round';
			take_turn_fen_clear();
			return;

		}
		//ermittle winner if any
		//sort votes by rank
		let ranks = 'KQJT98765432A';
		let vsorted = sortByFunc(votes, x => ranks.indexOf(x.card[0]));
		//schau ob eindeutig!
		let winning_vote = vsorted[0];
		if (votes.length > 1 && vsorted[1].card[0] == vsorted[0].card[0]) {
			winning_vote = null;
		}
		if (winning_vote) {
			let plwinner = winning_vote.plname
			//console.log('STOP! WINNER PRESIDENT!!!!!!!!!!!!!',plwinner,winning_vote.card); return;
			//console.log('...WINNER PRESIDENT!!!!!!!!!!!!!', plwinner, winning_vote.card);
			Z.turn = [plwinner];
			Z.stage = 'president';
			//return all non-winning votes zu player hands: done
			//return all pending cards (from previous votes) to resp hands
			for (const plname in fen.players) {
				let pl = fen.players[plname];
				if (!isEmpty(pl.pending)) pl.pending.map(x => pl.hand.push(x));
				delete pl.pending;
			}
			//discard winning vote
			removeInPlace(fen.players[plwinner].hand, winning_vote.card);
			fen.deck_discard.push(winning_vote.card);
			fen.president = plwinner;
			fen.isprovisional = false;
			ari_history_list(`${plwinner} wins presidency!`, 'president');
			take_turn_fen_clear();
			return;
		}

		// console.log('STOP! Tie!!!!!!!!!!!!!', vsorted); return;
		//console.log('Tie!!!!!!!!!!!!!', vsorted);
		ari_history_list(`tie!`, 'new poll round');
		//played cards go into pending
		for (const v of vsorted) {
			let plname = v.plname;
			let pl = fen.players[plname];
			lookupAddToList(pl, ['pending'], v.card)
			removeInPlace(pl.hand, v.card);
		}
		//stage goes to hand
		Z.turn = vsorted.map(x => x.plname); //only active voters remain in poll
		Z.stage = 'hand';
		fen.cardsrevealed = false;
		take_turn_fen_clear();

	} else if (humanscomplete && stage == 'membership') {
		assertion(uplayer == Z.host, 'NOT THE STARTER WHO COMPLETES THE STAGE!!!')
		//console.log('RESOLVING membership!!!!!!!!!!!!!')
		let histest = [];
		for (const pldata of Z.playerdata) {
			let plname = pldata.name;
			let card = pldata.state.card;
			assertion(!isEmpty(card), "INVALID MEMBERSHIP SELECTION!!!!!!!!!!!!", uplayer)
			//selected card goes from hand to membership
			let pl = fen.players[plname];
			pl.membership = card;
			removeInPlace(pl.hand, card);
			histest.push(`${plname} ${TESTHISTORY ? card : ''}`); //TODO:KEEP secret!!!!!!!!!!!!!!!!!!!!!!
		}
		ari_history_list(histest, 'membership');
		Z.stage = 'hand';
		fen.cardsrevealed = false;
		Z.turn = get_valid_voters();
		take_turn_fen_clear();
	} else if (humanscomplete && stage == 'round') {
		assertion(uplayer == Z.host, 'NOT THE STARTER WHO COMPLETES THE STAGE!!!')
		//new session starts here!!!!!
		Z.turn = jsCopy(Z.plorder);
		Z.phase = Number(Z.phase) + 1;
		Z.stage = 'membership';
		//console.log('REMOVING MEMBERSHIP!!!! SCORING SHOULD BE DONE BY NOW!!!!!')
		for (const pl in fen.players) { delete fen.players[pl].membership; }
		accuse_new_session(fen);
		take_turn_fen_clear();
	} else if (stage == 'president') {
		let accuse_action_available = !fen.isprovisional || fen.players[uplayer].hand.length >= 1;
		let parlay_action_available = get_others_with_at_least_one_hand_card().length >= 1;
		let actions = ['defect', 'resign'];
		if (parlay_action_available) actions.unshift('parlay');
		if (accuse_action_available) actions.unshift('accuse');
		select_add_items(ui_get_string_items(actions), president_action, 'must select action to play', 1, 1);
	} else if (stage == 'pay_for_accuse') {
		select_add_items(ui_get_hand_items(uplayer), pay_for_accuse_action, 'must pay a card for accuse action', 1, 1);
	} else if (stage == 'accuse_action_select_player') {
		let plnames = get_keys(fen.players);
		let validplayers = plnames.filter(x => fen.players[x].hand.length >= 1 && x != uplayer);
		select_add_items(ui_get_player_items(validplayers), accuse_submit_accused, 'must select player name', 1, 1);
	} else if (stage == 'accuse_action_select_color') {
		select_add_items(ui_get_string_items(['red', 'black']), accuse_submit_accused_color, 'must select color', 1, 1);
	} else if (stage == 'accuse_action_entlarvt') {
		select_add_items(ui_get_hand_items(uplayer), accuse_replaced_membership, 'must select new alliance', 1, 1);
	} else if (stage == 'accuse_action_provisional') {
		select_add_items(ui_get_hand_items(uplayer), accuse_replaced_membership, 'must select new alliance', 1, 1);
	} else if (stage == 'accuse_action_policy') {
		select_add_items(ui_get_hand_items(uplayer), accuse_enact_policy, 'may enact a policy', 0, 1);
	} else if (stage == 'accuse_action_new_president') {
		set_new_president();
	} else if (stage == 'parlay_select_player') {
		let players = get_others_with_at_least_one_hand_card();
		select_add_items(ui_get_player_items(players), parlay_player_selected, 'must select player to exchange cards with', 1, 1);
	} else if (stage == 'parlay_select_cards') {
		select_add_items(ui_get_hand_items(uplayer), parlay_cards_selected, 'may select cards to exchange', 0, fen.maxcards);
	} else if (stage == 'parlay_opponent_selects') {
		let n = fen.player_cards.length;
		select_add_items(ui_get_hand_items(uplayer), parlay_opponent_selected, `must select ${n} cards`, n, n);
	} else if (stage == 'defect_membership') {
		select_add_items(ui_get_hand_items(uplayer), defect_resolve, 'may replace your alliance', 0, 1);
	} else if (waiting) {//} && !startsWith(stage,'handresolve')) {
		//console.log('WAITING!!', stage, uplayer);
		//either results are not all in or am NOT the starter (=admin)
		let mystate = donelist.find(x => x.name == uplayer).state.card;
		if (!isEmpty(mystate)) {
			let handui = lookup(UI, ['players', uplayer, 'hand']);
			//console.log('handui',handui)
			let items = handui.items;
			let cardui = items.find(x => x.key == mystate)

			//.items.find(item=>item.a == mystate);
			//console.log('mystate',mystate,cardui)
			if (stage == 'hand' && isdef(cardui)) make_card_selected(cardui);
			else if (stage == 'membership' && isdef(cardui)) make_card_selected(cardui);
			else mDiv(dTable, {}, null, 'WAITING FOR PLAYERS TO COMPLETE....');
		}
		//mDiv(dTable, {}, null, 'WAITING FOR PLAYERS TO COMPLETE....');
		if (complete) {
			//turn is transferred to starter
			Z.turn = [Z.host];
			if (Z.mode != 'multi') { take_turn_waiting(); return; }
		}

		if (uplayer == Z.host && there_are_bots()) {
			//mode for bots also!
			let bots = get_bots_on_turn();
			//console.log('bots', bots)
			for (const bot of bots) { accuse_ai_move(bot); }
		}


		Z.isWaiting = true;
		autopoll();
	} else if (stage == 'membership') {
		select_add_items(ui_get_hand_items(uplayer), accuse_submit_membership, 'must select your alliance', 1, 1);
	} else if (stage == 'hand') {
		select_add_items(ui_get_hand_items(uplayer), accuse_submit_card, 'may select card to play', 0, 1);
	} else if (stage == 'round') {
		//let d = mDiv(dTable, {}, null, `Session end! ${fen.sessions[fen.phase - 1].color} wins`);
		show_special_message(`Session end! ${fen.sessions[fen.phase - 1].color} wins`, false, 3000, 0, { top: 67 })
		if (is_ai_player(uplayer)) accuse_onclick_weiter();
		else {
			mLinebreak(dTable, 12)
			mButton('WEITER', accuse_onclick_weiter, dTable, {}, ['donebutton', 'enabled']);
		}
	} else {
		//console.log('Z',Z)
		alert('PROBLEM!!!')
	}
}

function accuse_activate() {
	//return;
	let [pldata, stage, A, fen, phase, uplayer, turn, uname, host] = [Z.playerdata, Z.stage, Z.A, Z.fen, Z.phase, Z.uplayer, Z.turn, Z.uname, Z.host];

	let donelist = Z.playerdata.filter(x => isDict(x.state) && isdef(x.state.card));

	// let donehumans = donelist.filter(x=>is_human_player(x.name));
	// let humans_on_turn = turn.filter(x=>is_human_player(x));
	// let humanscomplete = ['hand', 'membership'].includes(stage) && donehumans.length >= humans_on_turn.length || stage == 'round' && firstCond(pldata, x => isDict(x));

	//sobald die humans complete sind, kann host uebernehmen und die bot moves machen und anschliessend gleich evaluaten

	let complete = ['hand', 'membership'].includes(stage) && donelist.length >= turn.length || stage == 'round' && firstCond(pldata, x => isDict(x));
	let humanscomplete = complete;
	// if (complete && uname == host){//} && turn.length>!sameList(turn,[Z.host])) {
	if (complete && !sameList(turn, [Z.host])) {
		console.log('complete', turn, sameList(turn, [Z.host]), 'uplayer', uplayer);
		Z.turn = [Z.host];
		take_turn_fen();
		return;
	}
	//if still here and multiturn: it cannot be humanscomplete or Z.host is only player on turn now!
	assertion(!humanscomplete || sameList(turn, [Z.host]), 'humanscomplete hat nicht zu host uebergeben!!!!!!!!!!')

	let waiting = isdef(donelist.find(x => x.name == uplayer)) && turn.length > 1;
	Z.isWaiting = false;

	if (humanscomplete && stage == 'hand') {
		assertion(sameList(turn, [Z.host]) && uplayer == Z.host, 'complete FEHLER!!!!!!!!!!!!!!!!!!!!!!!!!!', turn, Z.host, uplayer);

		//first, vote for bots!

		fen.cardsrevealed = true;
		DA.gobutton = mButton('reveal cards', () => { Z.turn = [uplayer]; Z.stage = 'handresolve'; take_turn_fen(); }, dTable, { w: 300 });
	} else if (stage == 'handresolve') {
		assertion(uplayer == Z.host && fen.cardsrevealed, 'NOT THE STARTER WHO COMPLETES THE STAGE!!!')
		DA.gobutton = mButton('evaluate cards', () => { Z.stage = 'handresolve_weiter'; take_turn_fen(); }, dTable, { w: 300 });
	} else if (stage == 'handresolve_weiter') {
		assertion(uplayer == Z.host && fen.cardsrevealed, 'NOT THE STARTER WHO COMPLETES THE STAGE!!!')
		let votes = [];
		for (const pldata of Z.playerdata) {
			let plname = pldata.name;
			let card = pldata.state.card;
			if (!isEmpty(card)) votes.push({ plname: plname, card: card });
			else removeInPlace(fen.validvoters, plname);
		}

		ari_history_list(votes.map(x => `${x.plname} ${x.card}`), 'poll');

		//resolve votes
		//0. check if unsuccessful (no votes)
		if (isEmpty(votes)) {
			//console.log('STOP! EMPTY VOTES!!!!!!!!!!!!!'); return;
			//console.log('EMPTY VOTES!!!!!!!!!!!!!');
			ari_history_list(`no votes!`, 'session ends');
			accuse_score_update('white')

			Z.turn = jsCopy(Z.plorder);
			Z.stage = 'round';
			take_turn_fen_clear();
			return;
		}
		//1. check if all votes same color
		let color = get_color_of_card(votes[0].card); //['H', 'D'].includes(votes[0].card[1]) ? 'red' : 'black';
		let allsame = true;
		for (const v of votes) {
			let c1 = get_color_of_card(v.card); //['H', 'D'].includes(v.card[1]) ? 'red' : 'black';
			if (c1 != color) { allsame = false; break; }
		}
		if (allsame) {
			//session ends! consensus
			//console.log('STOP! CONSENSUS!!!!!!!!!!!!!',color);return;
			//console.log('...CONSENSUS!!!!!!!!!!!!!', color, votes);
			ari_history_list(`consensus on ${color}!`, 'session ends');

			//update score
			accuse_score_update(color);

			Z.turn = jsCopy(Z.plorder);
			//Z.phase += 1
			Z.stage = 'round';
			take_turn_fen_clear();
			return;

		}
		//ermittle winner if any
		//sort votes by rank
		let ranks = 'KQJT98765432A';
		let vsorted = sortByFunc(votes, x => ranks.indexOf(x.card[0]));
		//schau ob eindeutig!
		let winning_vote = vsorted[0];
		if (votes.length > 1 && vsorted[1].card[0] == vsorted[0].card[0]) {
			winning_vote = null;
		}
		if (winning_vote) {
			let plwinner = winning_vote.plname
			//console.log('STOP! WINNER PRESIDENT!!!!!!!!!!!!!',plwinner,winning_vote.card); return;
			//console.log('...WINNER PRESIDENT!!!!!!!!!!!!!', plwinner, winning_vote.card);
			Z.turn = [plwinner];
			Z.stage = 'president';
			//return all non-winning votes zu player hands: done
			//return all pending cards (from previous votes) to resp hands
			for (const plname in fen.players) {
				let pl = fen.players[plname];
				if (!isEmpty(pl.pending)) pl.pending.map(x => pl.hand.push(x));
				delete pl.pending;
			}
			//discard winning vote
			removeInPlace(fen.players[plwinner].hand, winning_vote.card);
			fen.deck_discard.push(winning_vote.card);
			fen.president = plwinner;
			fen.isprovisional = false;
			ari_history_list(`${plwinner} wins presidency!`, 'president');
			take_turn_fen_clear();
			return;
		}

		// console.log('STOP! Tie!!!!!!!!!!!!!', vsorted); return;
		//console.log('Tie!!!!!!!!!!!!!', vsorted);
		ari_history_list(`tie!`, 'new poll round');
		//played cards go into pending
		for (const v of vsorted) {
			let plname = v.plname;
			let pl = fen.players[plname];
			lookupAddToList(pl, ['pending'], v.card)
			removeInPlace(pl.hand, v.card);
		}
		//stage goes to hand
		Z.turn = vsorted.map(x => x.plname); //only active voters remain in poll
		Z.stage = 'hand';
		fen.cardsrevealed = false;
		take_turn_fen_clear();

	} else if (humanscomplete && stage == 'membership') {
		assertion(uplayer == Z.host, 'NOT THE STARTER WHO COMPLETES THE STAGE!!!')
		//console.log('RESOLVING membership!!!!!!!!!!!!!')
		let histest = [];
		for (const pldata of Z.playerdata) {
			let plname = pldata.name;
			let card = pldata.state.card;
			assertion(!isEmpty(card), "INVALID MEMBERSHIP SELECTION!!!!!!!!!!!!", uplayer)
			//selected card goes from hand to membership
			let pl = fen.players[plname];
			pl.membership = card;
			removeInPlace(pl.hand, card);
			histest.push(`${plname} ${TESTHISTORY ? card : ''}`); //TODO:KEEP secret!!!!!!!!!!!!!!!!!!!!!!
		}
		ari_history_list(histest, 'membership');
		Z.stage = 'hand';
		fen.cardsrevealed = false;
		Z.turn = get_valid_voters();
		take_turn_fen_clear();
	} else if (humanscomplete && stage == 'round') {
		assertion(uplayer == Z.host, 'NOT THE STARTER WHO COMPLETES THE STAGE!!!')
		//new session starts here!!!!!
		Z.turn = jsCopy(Z.plorder);
		Z.phase = Number(Z.phase) + 1;
		Z.stage = 'membership';
		//console.log('REMOVING MEMBERSHIP!!!! SCORING SHOULD BE DONE BY NOW!!!!!')
		for (const pl in fen.players) { delete fen.players[pl].membership; }
		accuse_new_session(fen);
		take_turn_fen_clear();
	} else if (stage == 'president') {
		let accuse_action_available = !fen.isprovisional || fen.players[uplayer].hand.length >= 1;
		let parlay_action_available = get_others_with_at_least_one_hand_card().length >= 1;
		let actions = ['defect', 'resign'];
		if (parlay_action_available) actions.unshift('parlay');
		if (accuse_action_available) actions.unshift('accuse');
		select_add_items(ui_get_string_items(actions), president_action, 'must select action to play', 1, 1);
	} else if (stage == 'pay_for_accuse') {
		select_add_items(ui_get_hand_items(uplayer), pay_for_accuse_action, 'must pay a card for accuse action', 1, 1);
	} else if (stage == 'accuse_action_select_player') {
		let plnames = get_keys(fen.players);
		let validplayers = plnames.filter(x => fen.players[x].hand.length >= 1 && x != uplayer);
		select_add_items(ui_get_player_items(validplayers), accuse_submit_accused, 'must select player name', 1, 1);
	} else if (stage == 'accuse_action_select_color') {
		select_add_items(ui_get_string_items(['red', 'black']), accuse_submit_accused_color, 'must select color', 1, 1);
	} else if (stage == 'accuse_action_entlarvt') {
		select_add_items(ui_get_hand_items(uplayer), accuse_replaced_membership, 'must select new alliance', 1, 1);
	} else if (stage == 'accuse_action_provisional') {
		select_add_items(ui_get_hand_items(uplayer), accuse_replaced_membership, 'must select new alliance', 1, 1);
	} else if (stage == 'accuse_action_policy') {
		select_add_items(ui_get_hand_items(uplayer), accuse_enact_policy, 'may enact a policy', 0, 1);
	} else if (stage == 'accuse_action_new_president') {
		set_new_president();
	} else if (stage == 'parlay_select_player') {
		let players = get_others_with_at_least_one_hand_card();
		select_add_items(ui_get_player_items(players), parlay_player_selected, 'must select player to exchange cards with', 1, 1);
	} else if (stage == 'parlay_select_cards') {
		select_add_items(ui_get_hand_items(uplayer), parlay_cards_selected, 'may select cards to exchange', 0, fen.maxcards);
	} else if (stage == 'parlay_opponent_selects') {
		let n = fen.player_cards.length;
		select_add_items(ui_get_hand_items(uplayer), parlay_opponent_selected, `must select ${n} cards`, n, n);
	} else if (stage == 'defect_membership') {
		select_add_items(ui_get_hand_items(uplayer), defect_resolve, 'may replace your alliance', 0, 1);
	} else if (waiting) {//} && !startsWith(stage,'handresolve')) {
		//console.log('WAITING!!', stage, uplayer);
		//either results are not all in or am NOT the starter (=admin)
		let mystate = donelist.find(x => x.name == uplayer).state.card;
		if (!isEmpty(mystate)) {
			let handui = lookup(UI, ['players', uplayer, 'hand']);
			//console.log('handui',handui)
			let items = handui.items;
			let cardui = items.find(x => x.key == mystate)

			//.items.find(item=>item.a == mystate);
			//console.log('mystate',mystate,cardui)
			if (stage == 'hand' && isdef(cardui)) make_card_selected(cardui);
			else if (stage == 'membership' && isdef(cardui)) make_card_selected(cardui);
			else mDiv(dTable, {}, null, 'WAITING FOR PLAYERS TO COMPLETE....');
		}
		//mDiv(dTable, {}, null, 'WAITING FOR PLAYERS TO COMPLETE....');
		if (complete) {
			//turn is transferred to starter
			Z.turn = [Z.host];
			if (Z.mode != 'multi') { take_turn_waiting(); return; }
		}

		if (uplayer == Z.host && there_are_bots()) {
			//mode for bots also!
			let bots = get_bots_on_turn();
			//console.log('bots', bots)
			for (const bot of bots) { accuse_ai_move(bot); }
		}


		Z.isWaiting = true;
		autopoll();
	} else if (stage == 'membership') {
		select_add_items(ui_get_hand_items(uplayer), accuse_submit_membership, 'must select your alliance', 1, 1);
	} else if (stage == 'hand') {
		select_add_items(ui_get_hand_items(uplayer), accuse_submit_card, 'may select card to play', 0, 1);
	} else if (stage == 'round') {
		//let d = mDiv(dTable, {}, null, `Session end! ${fen.sessions[fen.phase - 1].color} wins`);
		show_special_message(`Session end! ${fen.sessions[fen.phase - 1].color} wins`, false, 3000, 0, { top: 67 })
		if (is_ai_player(uplayer)) accuse_onclick_weiter();
		else {
			mLinebreak(dTable, 12)
			mButton('WEITER', accuse_onclick_weiter, dTable, {}, ['donebutton', 'enabled']);
		}
	} else {
		//console.log('Z',Z)
		alert('PROBLEM!!!')
	}
}

function update_table() {
	//creates and maintains Z (open tables)
	assertion(isdef(U), 'NO USER LOGGED IN WHEN GETTING TABLE FROM SERVER!!!!!!!!!!!!!!!!!!!!', U);

	//copy all important keys to Z.prev
	if (nundef(Z) || nundef(Z.prev)) Z = { prev: {} };
	for (const wichtig of ['playerdata', 'notes', 'uplayer', 'uname', 'friendly', 'step', 'round', 'phase', 'stage', 'timestamp', 'modified', 'stime', 'mode', 'scoring']) {
		if (isdef(Z[wichtig])) Z.prev[wichtig] = jsCopy(Z[wichtig]);
	}
	//console.log('last uplayer was',Z.prev.uplayer)
	Z.prev.turn = Clientdata.last_turn = Clientdata.this_turn;

	copyKeys(Serverdata, Z);

	//console.log('playerdata', Z.playerdata, 'prev', Z.prev.playerdata);

	if (isdef(Serverdata.table)) { copyKeys(Serverdata.table, Z); Z.playerlist = Z.players; copyKeys(Serverdata.table.fen, Z); }
	assertion(isdef(Z.fen), 'no fen in Z bei cmd=table or startgame!!!', Serverdata);
	assertion(isdef(Z.host), 'TABLE HAS NOT HOST IN UPDATE_TABLE!!!!!!!!!!!!!!')

	Clientdata.this_turn = Z.turn;

	set_user(U.name); //sets Z.uname

	assertion(!isEmpty(Z.turn), 'turn empty!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!', Z.turn);

	//console.log('Z', Z);
	let fen = Z.fen; //set Z.role
	Z.role = !is_playing(Z.uname, fen) ? 'spectator' : fen.turn.includes(Z.uname) ? 'active' : 'inactive';

	//set Z.uplayer
	let [uname, turn, mode, host] = [Z.uname, fen.turn, Z.mode, Z.host];
	//console.log('uname', uname, 'turn', turn, 'mode', mode, 'host', host);
	let upl = uname;

	//console.log('Z',Z)
	if (Z.game == 'accuse') {
		//upl = Z.role == 'active' ? uname : turn[0];
		if (mode == 'hotseat' && turn.length > 1) { let next = get_next_in_list(Z.prev.uplayer, Z.turn); if (next) upl = next; }
		else if (turn.length > 1) {
			//if ()
		}
		if (mode == 'multi' && uname == host) {
			//if upl is host, first move all bots
			//if upl is bot but there is no other bot, go back to host
			let bots = turn_has_bots_that_must_move();
			//console.log('bots on turn that must move',bots);
			//if (!isEmpty(bots)) assertion(false,"GOT BOTS!!!!!!!!!!!!!!!")
			if (!isEmpty(bots)) upl = bots[0];

		}
		// console.log('Z.role',Z.role,'turn',turn,'uname',uname,'host',host)
		// let pld=Z.playerdata.find(x=>x.name == uname);
		// let hasmoved=isdef(pld) && isDict(pld.state);
		// let isrobot = Z.fen.players[uname].playmode != 'human';
		// if (mode == 'multi' && (uname == host || isrobot) && turn.length > 1 && hasmoved) { upl = uname; }

	} else {
		upl = Z.role == 'active' ? uname : turn[0];

		if (mode == 'hotseat' && turn.length > 1) { let next = get_next_in_list(Z.prev.uplayer, Z.turn); if (next) upl = next; }
		if (mode == 'multi' && Z.role == 'inactive' && (uname != host || is_human_player(upl))) { upl = uname; }

	}

	//console.log('-----------setting', upl,'\nuname',uname,'\nturn',turn,'\nprev',Z.prev.uplayer)
	set_player(upl, fen); //sets uplayer
	//console.log('uplayer',Z.uplayer)

	//set playmode and strategy
	let pl = Z.pl;
	Z.playmode = pl.playmode; //could be human | ai | hybrid (that's for later!!!)
	Z.strategy = uname == pl.name ? valf(Clientdata.strategy, pl.strategy) : pl.strategy; //humans are really hybrids: they have default strategy 'random'
	//if (Z.playmode != 'human') Z.strategy = pl.strategy;

	//determine wheather have to present game state!
	let [uplayer, friendly, modified] = [Z.uplayer, Z.friendly, Z.modified];

	//can skip presentation if: same table & uplayer, state newer (has been modified)
	//console.log('modified', modified, 'Z.prev.modified', Z.prev.modified);
	//console.log('Z.playerdata_changed_for', Z.playerdata_changed_for);
	//console.log('FORCE_REDRAW', FORCE_REDRAW);
	//console.log()
	Z.uplayer_data = firstCond(Z.playerdata, x => x.name == Z.uplayer);

	// _Z.skip_presentation = isEmpty(Z.playerdata_changed_for) && !FORCE_REDRAW && friendly == Z.prev.friendly && modified <= Z.prev.modified && uplayer == Z.prev.uplayer;
	let sametable = !FORCE_REDRAW && friendly == Z.prev.friendly && modified <= Z.prev.modified && uplayer == Z.prev.uplayer;
	let sameplayerdata = isEmpty(Z.playerdata_changed_for);
	let myplayerdatachanged = Z.playerdata_changed_for.includes(Z.uplayer);

	//if uplayer is neither host nor trigger nor acting_host, can skip unless own playerdata changed??? =>will still do _autopoll!
	let specialcase = !i_am_host() && !i_am_acting_host() && !i_am_trigger() && !myplayerdatachanged;

	Z.skip_presentation = sametable && (sameplayerdata || specialcase);

	if (DA.TEST0 && (!sametable || !sameplayerdata)) {
		console.log('======>Z.skip_presentation', Z.skip_presentation, '\nplayerdata_changed_for', Z.playerdata_changed_for);
		console.log('_______ *** THE END *** ___________')
	}
	// Z.skip_presentation = !FORCE_REDRAW && friendly == Z.prev.friendly && modified <= Z.prev.modified && uplayer == Z.prev.uplayer;
	// !Z.playerdata_changed_for.includes(uplayer) && 
	// if (Z.skip_presentation && !isEmpty(Z.playerdata_changed_for) && Z.role != 'active') {
	// 	//some playerdata have changed, but NOT uplayer's
	// 	//may make some small adjustments but NOT full_fledged redraw!
	// 	console.log('skip_presentation but playerdata_changed_for not empty', Z.playerdata_changed_for);
	// }
	FORCE_REDRAW = false;
	//console.log('!!!!!!!!!!!!!!!!!Z.skip_presentation', Z.skip_presentation);

	//if (Z.skip_presentation) { _autopoll(); } else { clear_timeouts(); }

}

function accuse_deck(numpl, hz) {
	let need = numpl * hz;
	let numbers = Math.ceil(need / 2);
	let ranks = ['H', 'S'];
	let deck = [];
	ranks.map(x => deck.push(`A${x}n`));
	for (let i = 2; i <= numbers; i++) {
		ranks.map(x => deck.push(`${i}${x}n`));
	}
	//deck.shuffle();
	return deck;
}


function accuse_activate() {
	//return;
	let [pldata, stage, A, fen, phase, uplayer, turn] = [Z.playerdata, Z.stage, Z.A, Z.fen, Z.phase, Z.uplayer, Z.turn];

	let donelist = Z.playerdata.filter(x => isDict(x.state) && isdef(x.state.card));
	let complete = ['hand', 'membership'].includes(stage) && donelist.length >= turn.length || stage == 'round' && firstCond(pldata, x => isDict(x));
	let resolvable = (uplayer == 'mimi' || uplayer == Z.host) && complete;
	let waiting = !resolvable && isdef(donelist.find(x => x.name == uplayer)) && turn.length > 1;
	Z.isWaiting = false;

	if (stage == 'impossible') {
		console.log('impossible stage!!!!!!!!!!!!')
	} else if (stage == 'president') {
		let accuse_action_available = !fen.isprovisional || fen.players[uplayer].hand.length >= 1;
		let parlay_action_available = get_others_with_at_least_one_hand_card().length >= 1;
		let actions = ['defect', 'resign'];
		if (parlay_action_available) actions.unshift('parlay');
		if (accuse_action_available) actions.unshift('accuse');
		select_add_items(ui_get_string_items(actions), president_action, 'must select action to play', 1, 1);
	} else if (stage == 'pay_for_accuse') {
		select_add_items(ui_get_hand_items(uplayer), pay_for_accuse_action, 'must pay a card for accuse action', 1, 1);
	} else if (stage == 'accuse_action_select_player') {
		let plnames = get_keys(fen.players);
		let validplayers = plnames.filter(x => fen.players[x].hand.length >= 1 && x != uplayer);
		select_add_items(ui_get_player_items(validplayers), accuse_submit_accused, 'must select player name', 1, 1);
	} else if (stage == 'accuse_action_select_color') {
		select_add_items(ui_get_string_items(['red', 'black']), accuse_submit_accused_color, 'must select color', 1, 1);
	} else if (stage == 'accuse_action_entlarvt') {
		select_add_items(ui_get_hand_items(uplayer), accuse_replaced_membership, 'must select new alliance', 1, 1);
	} else if (stage == 'accuse_action_provisional') {
		select_add_items(ui_get_hand_items(uplayer), accuse_replaced_membership, 'must select new alliance', 1, 1);
	} else if (stage == 'accuse_action_policy') {
		select_add_items(ui_get_hand_items(uplayer), accuse_enact_policy, 'may enact a policy', 0, 1);
	} else if (stage == 'accuse_action_new_president') {
		set_new_president();
	} else if (stage == 'parlay_select_player') {
		let players = get_others_with_at_least_one_hand_card();
		select_add_items(ui_get_player_items(players), parlay_player_selected, 'must select player to exchange cards with', 1, 1);
	} else if (stage == 'parlay_select_cards') {
		select_add_items(ui_get_hand_items(uplayer), parlay_cards_selected, 'may select cards to exchange', 0, fen.maxcards);
	} else if (stage == 'parlay_opponent_selects') {
		let n = fen.player_cards.length;
		select_add_items(ui_get_hand_items(uplayer), parlay_opponent_selected, `must select ${n} cards`, n, n);
	} else if (stage == 'defect_membership') {
		select_add_items(ui_get_hand_items(uplayer), defect_resolve, 'may replace your alliance', 0, 1);
	} else if (waiting) {//} && !startsWith(stage,'handresolve')) {
		//console.log('WAITING!!', stage, uplayer);
		//either results are not all in or am NOT the starter (=admin)
		let mystate = donelist.find(x => x.name == uplayer).state.card;
		if (!isEmpty(mystate)) {
			let handui = lookup(UI, ['players', uplayer, 'hand']);
			//console.log('handui',handui)
			let items = handui.items;
			let cardui = items.find(x => x.key == mystate)

			//.items.find(item=>item.a == mystate);
			//console.log('mystate',mystate,cardui)
			if (stage == 'hand' && isdef(cardui)) make_card_selected(cardui);
			else if (stage == 'membership' && isdef(cardui)) make_card_selected(cardui);
			else mDiv(dTable, {}, null, 'WAITING FOR PLAYERS TO COMPLETE....');
		}
		//mDiv(dTable, {}, null, 'WAITING FOR PLAYERS TO COMPLETE....');
		if (complete) {
			//turn is transferred to starter
			Z.turn = [Z.host];
			if (Z.mode != 'multi') { take_turn_waiting(); return; }
		}

		if (uplayer == Z.host && there_are_bots()) {
			//mode for bots also!
			let bots = get_bots_on_turn();
			//console.log('bots', bots)
			for (const bot of bots) { accuse_ai_move(bot); }
		}


		Z.isWaiting = true;
		autopoll();
	} else if (stage == 'membership' && resolvable) {
		assertion(uplayer == Z.host, 'NOT THE STARTER WHO COMPLETES THE STAGE!!!')
		//console.log('RESOLVING membership!!!!!!!!!!!!!')
		let histest = [];
		for (const pldata of Z.playerdata) {
			let plname = pldata.name;
			let card = pldata.state.card;
			assertion(!isEmpty(card), "INVALID MEMBERSHIP SELECTION!!!!!!!!!!!!", uplayer)

			//selected card goes from hand to membership
			let pl = fen.players[plname];
			pl.membership = card;
			removeInPlace(pl.hand, card);

			histest.push(`${plname} ${TESTHISTORY ? card : ''}`); //TODO:KEEP secret!!!!!!!!!!!!!!!!!!!!!!
		}

		ari_history_list(histest, 'membership');
		Z.stage = 'hand';
		fen.cardsrevealed = false;
		Z.turn = get_valid_voters();
		take_turn_fen_clear();

	} else if (stage == 'membership') {
		select_add_items(ui_get_hand_items(uplayer), accuse_submit_membership, 'must select your alliance', 1, 1);
	} else if (stage == 'hand' && resolvable) {
		assertion(uplayer == Z.host || uplayer == 'mimi', 'NOT THE STARTER WHO COMPLETES THE STAGE!!!')

		//all the cards in UI.stats[plname].card
		fen.cardsrevealed = true;

		//console.log('STOP: RESOLVING HAND!!!!!!!!!!!!!', Z.playerdata.map(x => x.state.card));
		// DA.gobutton = mButton('reveal cards', () => { Z.stage = 'handresolve'; accuse_activate(); }, dTable, { w: 300 });
		DA.gobutton = mButton('reveal cards', () => { Z.turn = [uplayer]; Z.stage = 'handresolve'; take_turn_fen(); }, dTable, { w: 300 });
		//Z.stage = 'handresolve'; accuse_activate();
		return;
	} else if (stage == 'handresolve') {
		assertion(uplayer == Z.host || uplayer == 'mimi' && fen.cardsrevealed, 'NOT THE STARTER WHO COMPLETES THE STAGE!!!')
		DA.gobutton = mButton('evaluate cards', () => { Z.stage = 'handresolve_weiter'; take_turn_fen(); }, dTable, { w: 300 });
		return;
	} else if (stage == 'handresolve_weiter') {
		let votes = [];
		for (const pldata of Z.playerdata) {
			let plname = pldata.name;
			let card = pldata.state.card;
			if (!isEmpty(card)) votes.push({ plname: plname, card: card });
			else removeInPlace(fen.validvoters, plname);
		}

		ari_history_list(votes.map(x => `${x.plname} ${x.card}`), 'poll');

		//resolve votes
		//0. check if unsuccessful (no votes)
		if (isEmpty(votes)) {
			//console.log('STOP! EMPTY VOTES!!!!!!!!!!!!!'); return;
			//console.log('EMPTY VOTES!!!!!!!!!!!!!');
			ari_history_list(`no votes!`, 'session ends');
			accuse_score_update('white')

			Z.turn = jsCopy(Z.plorder);
			Z.stage = 'round';
			take_turn_fen_clear();
			return;
		}
		//1. check if all votes same color
		let color = get_color_of_card(votes[0].card); //['H', 'D'].includes(votes[0].card[1]) ? 'red' : 'black';
		let allsame = true;
		for (const v of votes) {
			let c1 = get_color_of_card(v.card); //['H', 'D'].includes(v.card[1]) ? 'red' : 'black';
			if (c1 != color) { allsame = false; break; }
		}
		if (allsame) {
			//session ends! consensus
			//console.log('STOP! CONSENSUS!!!!!!!!!!!!!',color);return;
			//console.log('...CONSENSUS!!!!!!!!!!!!!', color, votes);
			ari_history_list(`consensus on ${color}!`, 'session ends');

			//update score
			accuse_score_update(color);

			Z.turn = jsCopy(Z.plorder);
			//Z.phase += 1
			Z.stage = 'round';
			take_turn_fen_clear();
			return;

		}
		//ermittle winner if any
		//sort votes by rank
		let ranks = 'KQJT98765432A';
		let vsorted = sortByFunc(votes, x => ranks.indexOf(x.card[0]));
		let best = vsorted[0];
		//schau ob eindeutig!
		let winning_vote = vsorted[0];
		if (votes.length > 1 && vsorted[1].card[0] == vsorted[0].card[0]) {
			winning_vote = null;
		}
		if (winning_vote) {
			let plwinner = winning_vote.plname
			//console.log('STOP! WINNER PRESIDENT!!!!!!!!!!!!!',plwinner,winning_vote.card); return;
			//console.log('...WINNER PRESIDENT!!!!!!!!!!!!!', plwinner, winning_vote.card);
			Z.turn = [plwinner];
			Z.stage = 'president';
			//return all non-winning votes zu player hands: done
			//return all pending cards (from previous votes) to resp hands
			for (const plname in fen.players) {
				let pl = fen.players[plname];
				if (!isEmpty(pl.pending)) pl.pending.map(x => pl.hand.push(x));
				delete pl.pending;
			}
			//discard winning vote
			removeInPlace(fen.players[plwinner].hand, winning_vote.card);
			fen.deck_discard.push(winning_vote.card);
			fen.president = plwinner;
			fen.isprovisional = false;
			ari_history_list(`${plwinner} wins presidency!`, 'president');
			take_turn_fen_clear();
			return;
		}

		// console.log('STOP! Tie!!!!!!!!!!!!!', vsorted); return;
		//console.log('Tie!!!!!!!!!!!!!', vsorted);
		ari_history_list(`tie!`, 'new poll round');
		//played cards go into pending
		for (const v of vsorted) {
			let plname = v.plname;
			let pl = fen.players[plname];
			lookupAddToList(pl, ['pending'], v.card)
			removeInPlace(pl.hand, v.card);
		}
		//stage goes to hand
		Z.turn = vsorted.map(x => x.plname); //only active voters remain in poll
		Z.stage = 'hand';
		fen.cardsrevealed = false;
		take_turn_fen_clear();

	} else if (stage == 'hand') {
		select_add_items(ui_get_hand_items(uplayer), accuse_submit_card, 'may select card to play', 0, 1);
	} else if (stage == 'round' && resolvable) {
		assertion(uplayer == 'mimi' || uplayer == Z.host, 'NOT THE STARTER WHO COMPLETES THE STAGE!!!')
		//new session starts here!!!!!
		Z.turn = jsCopy(Z.plorder);
		Z.phase = Number(Z.phase) + 1;
		Z.stage = 'membership';
		//console.log('REMOVING MEMBERSHIP!!!! SCORING SHOULD BE DONE BY NOW!!!!!')
		for (const pl in fen.players) { delete fen.players[pl].membership; }
		accuse_new_session(fen);
		take_turn_fen_clear();
	} else if (stage == 'round') {
		//let d = mDiv(dTable, {}, null, `Session end! ${fen.sessions[fen.phase - 1].color} wins`);
		show_special_message(`Session end! ${fen.sessions[fen.phase - 1].color} wins`, false, 3000, 0, { top: 67 })
		if (is_ai_player(uplayer)) accuse_onclick_weiter();
		else {
			mLinebreak(dTable, 12)
			mButton('WEITER', accuse_onclick_weiter, dTable, {}, ['donebutton', 'enabled']);
		}
	} else {
		//console.log('Z',Z)
		alert('PROBLEM!!!')
	}
}

function accuse_new_session(fen, players) {
	let deck_discard = fen.deck_discard = [];
	let deck_ballots = accuse_deck(fen.handsize, players.length); shuffle(deck_ballots);
	let ranks = 'KQJT98765432A';
	let tb = {
		5: ['2', 'T', 7],
		6: ['A', 'T', 6],
		7: ['A', 'T', 5],
		8: ['A', 'T', 5],
		9: ['A', 'K', 5],
		10: ['A', 'K', 5],
		11: ['A', 'K', 4],
		12: ['A', 'K', 4],
		13: ['A', 'K', 4],
	};
	if (nundef(players)) players = get_keys(fen.players);
	let N = players.length;
	let [rmax, rmin, handsize] = isdef(tb[N]) ? tb[N] : ['A', 'K', Math.min(8, Math.floor(52 / N))];

	// //modiy handsize options.handsize
	// let hplus=N*Number(fen.inc_handsize_by);
	// let cardsneeded = hplus-deck_ballots.length;
	// let hz = handsize + Number(fen.inc_handsize_by);
	// if (hz*N<=deck_ballots.length){
	// 	handsize = hz;
	// }
	// assertion(handsize*N<=deck_ballots.length,"not enough cards!!!!!!!!!!!!!!!!!!!!!!!!")

	let [imin, imax] = [ranks.indexOf(rmin), ranks.indexOf(rmax)];
	//console.log('N',players.length,'minrank',imin,'maxrank',imax)
	deck_ballots = deck_ballots.filter(x => {
		let i = ranks.indexOf(x[0])
		return i >= imin && i <= imax;
	});
	fen.deck_ballots = deck_ballots;
	fen.handsize = handsize;
	//console.log('deck_ballots:::',deck_ballots.length);
	for (const plname in fen.players) {
		let pl = fen.players[plname];
		pl.hand = deck_deal(deck_ballots, handsize);
	}
	fen.policies = [];
	fen.validvoters = jsCopy(players)
	delete fen.president;
	delete fen.newpresident;
	delete fen.isprovisional;
	delete fen.player_cards;
	delete fen.accused;
	delete fen.dominance;

	//ari_history_list(`*** session ${fen.phase} starts ***`,'',fen)

}

function accuse_hand_discard(card, plname) {
	let fen = Z.fen;
	let pl = fen.players[plname]
	removeInPlace(pl.hand, card)
	fen.deck_discard.push(card);
}
function accuse_hand_draw(player) {
	removeInPlace(from,)
}

function accuse_stats(d, dl, dr, dmain) {
	let players = Z.fen.players;
	//console.log('uplayer',Z.uplayer)
	let d1 = mDiv(d, { display: 'flex', 'justify-content': 'center', 'align-items': 'space-evenly' });
	let order = get_present_order();

	let me = order[0];
	accuse_player_stat(dmain, me)
	let next = order[1];
	accuse_player_stat(dl, next)
	let prev = arrLast(order);
	accuse_player_stat(dr, prev)
	let middle = order.slice(2, order.length - 1);
	//console.log('me', me, 'next', next, 'prev', prev, 'middle', middle);

	for (const plname of middle) {
		let pl = players[plname];
		if (TESTHISTORY && plname == middle[0]) { let dleft = ari_get_card(pl.idleft, 80); mAppend(d1, iDiv(dleft)) }

		accuse_player_stat(d1, plname)

		//if (TESTHISTORY && isdef(pl.membership)) { let dmiddle = ari_get_card(pl.membership, 40); mAppend(dmain, iDiv(dmiddle)); }
		if (TESTHISTORY) { let dright = ari_get_card(pl.idright, 80); mAppend(d1, iDiv(dright)); }

	}


}

function presentcards() {
	if (startsWith(Z.stage, 'hand')) {
		let donelist = Z.playerdata.filter(x => isDict(x.state) && isdef(x.state.card));
		//let reveal = donelist.length >= turn.length
		for (const pld of donelist) {
			let plname = pld.name;
			let plui = lookup(UI, ['stats', plname]);
			let dcard = plui.dcard;

			if (isEmpty(arrChildren(dcard))) {
				// console.log('dcard',dcard)
				let card = pld.state.card;
				let actualcard = plui.actualcard = !isEmpty(card)
				let card1 = plui.card = ari_get_card(actualcard ? card : 'AHn', 35)
				mAppend(dcard, iDiv(card1));
			}
			if (!Z.fen.cardsrevealed || !plui.actualcard) face_down(plui.card);
		}
	} else {
		console.log('presentcards no hand state!')
		// let fen = Z.fen;
		// console.log('fen', fen)
		// for (const plname in fen.players) {
		// 	let pl = fen.players[plname];
		// 	let plui = lookup(UI, ['stats', plname]);
		// 	console.log('plui', plui)
		// 	let dcard = plui.dcard;
		// 	console.log('dcard', dcard);
		// 	console.log('score', pl.score)
		// 	mClear(dcard);
		// 	mDiv(dcard, {}, null, `${pl.score}`)

		// }
	}


}

function restpresent(dParent) {
	mStyle(d1, { h: 130, w: '90%' }); //, bg: 'yellow' });
	mStyle(d2, { h: 130, display: 'grid', 'grid-template-columns': '120px 1fr 120px', gap: 4, w: '100%' }); //, bg: 'orange' });
	mStyle(d3, { h: 130, display: 'grid', 'grid-template-columns': '100px 120px 1fr 120px 100px', gap: 4, w: '100%' }); //, bg: 'red' });
	mStyle(d4, { h: 130, display: 'grid', 'grid-template-columns': '120px 1fr 120px', gap: 4, w: '100%' }); //, bg: 'hotpink' });
	let [d2le, d2mid, d2ri] = [mDiv(d2), mDiv(d2), mDiv(d2)];
	let [d3le, d3lemi, d3mid, d3rimi, d3ri] = [mDiv(d3), mDiv(d3), mDiv(d3), mDiv(d3), mDiv(d3)];
	// let [d4le, d4lemi, d4mid, d4rimi, d4ri] = [mDiv(d4,{w:100}), mDiv(d4), mDiv(d4), mDiv(d4), mDiv(d4)];
	let [d4le, d4mid, d4ri] = [mDiv(d4), mDiv(d4), mDiv(d4)];
	for (const d of [d2le, d2mid, d2ri, d3lemi, d3mid, d3rimi, d4le, d4mid]) mCenterFlex(d);
	for (const d of [d2le, d2mid, d2ri, d3lemi, d3mid, d3rimi, d4le, d4mid]) mStyle(d, { h: 130 });

	// *** player stats ***
	accuse_stats(d1, d2le, d2ri, d4le); //lookupSetOverride(UI, ['stats', plname], { douter: d, dstats: stats, dimg: img, dcard: card });
	presentcards();

	// *** policies ***
	if (nundef(fen.policies)) fen.policies = [];
	UI.policies = ui_type_hand(fen.policies, d2mid, { hmin: 120 }, '', 'policies', ari_get_card, false);

	// *** player membership cards ***
	let pl = fen.players[uplayer];
	let idleft = ari_get_card(pl.idleft, 100); mAppend(d3lemi, iDiv(idleft))
	let membership = ui_type_market(isdef(pl.membership) ? [pl.membership] : [], d3mid, { hmargin: 120 }, '', 'alliance')
	let idright = ari_get_card(pl.idright, 100); mAppend(d3rimi, iDiv(idright))

	// *** player hand ***
	mStyle(d4mid, { h: 130 });
	let handui = ui_type_hand(pl.hand, d4mid, { paleft: 25 }, `players.${uplayer}.hand`);
	//mStyle(handui.container,{wmax:300})
	lookupSetOverride(ui, ['players', uplayer, 'hand'], handui);
}

function accuse_present(dParent) {

	DA.no_shield = true;
	let [fen, ui, stage, uplayer] = [Z.fen, UI, Z.stage, Z.uplayer];
	let [dOben, dOpenTable, dMiddle, dRechts] = tableLayoutMR(dParent, 1, 0); ///tableLayoutOMR(dParent, 5, 1);
	//dHistory = mDiv(dOben,{},'dHistory','history: '+ arrLast(fen.history));
	let dt = dTable = dOpenTable; clearElement(dt); mCenterFlex(dt); mStyle(dt, { hmin: 700 })

	//console.log('dTitle',dTitle); hide(dTitle); //return;
	// mBy('dTitleLeft').innerHTML = `Session ${fen.phase}`; mStyle(dTitle, { hpadding: 10, vpadding: 1, h: 20 });
	// mBy('dTitleRight').innerHTML = '';

	//mStyle(dRechts,{wmin:265,bg:'#00000080'});
	show_history(fen, dRechts);

	let colorfunc = () => 'transparent' //rColor
	let [d1, d2, d3, d4] = [mDiv(dt, { bg: colorfunc() }), mDiv(dt, { bg: colorfunc() }), mDiv(dt, { bg: colorfunc() }), mDiv(dt, { bg: colorfunc() })];
	mStyle(d1, { h: 130, w: '90%' }); //, bg: 'yellow' });
	mStyle(d2, { h: 130, display: 'grid', 'grid-template-columns': '120px 1fr 120px', gap: 4, w: '100%' }); //, bg: 'orange' });
	mStyle(d3, { h: 130, display: 'grid', 'grid-template-columns': '100px 120px 1fr 120px 100px', gap: 4, w: '100%' }); //, bg: 'red' });
	mStyle(d4, { h: 130, display: 'grid', 'grid-template-columns': '120px 1fr 120px', gap: 4, w: '100%' }); //, bg: 'hotpink' });
	let [d2le, d2mid, d2ri] = [mDiv(d2), mDiv(d2), mDiv(d2)];
	let [d3le, d3lemi, d3mid, d3rimi, d3ri] = [mDiv(d3), mDiv(d3), mDiv(d3), mDiv(d3), mDiv(d3)];
	// let [d4le, d4lemi, d4mid, d4rimi, d4ri] = [mDiv(d4,{w:100}), mDiv(d4), mDiv(d4), mDiv(d4), mDiv(d4)];
	let [d4le, d4mid, d4ri] = [mDiv(d4), mDiv(d4), mDiv(d4)];
	for (const d of [d2le, d2mid, d2ri, d3lemi, d3mid, d3rimi, d4le, d4mid]) mCenterFlex(d);
	for (const d of [d2le, d2mid, d2ri, d3lemi, d3mid, d3rimi, d4le, d4mid]) mStyle(d, { h: 130 });

	// *** player stats ***
	accuse_stats(d1, d2le, d2ri, d4le); //lookupSetOverride(UI, ['stats', plname], { douter: d, dstats: stats, dimg: img, dcard: card });
	presentcards();

	// *** policies ***
	if (nundef(fen.policies)) fen.policies = [];
	UI.policies = ui_type_hand(fen.policies, d2mid, { hmin: 120 }, '', 'policies', ari_get_card, false);

	// *** player membership cards ***
	let pl = fen.players[uplayer];
	let idleft = ari_get_card(pl.idleft, 100); mAppend(d3lemi, iDiv(idleft))
	let membership = ui_type_market(isdef(pl.membership) ? [pl.membership] : [], d3mid, { hmargin: 120 }, '', 'alliance')
	let idright = ari_get_card(pl.idright, 100); mAppend(d3rimi, iDiv(idright))

	// *** player hand ***
	mStyle(d4mid, { h: 130 });
	let handui = ui_type_hand(pl.hand, d4mid, { paleft: 25 }, `players.${uplayer}.hand`);
	//mStyle(handui.container,{wmax:300})
	lookupSetOverride(ui, ['players', uplayer, 'hand'], handui);
}

function accuse_player_stat(d1, plname) {
	let players = Z.fen.players;
	let pl = players[plname];
	let onturn = Z.turn.includes(plname);
	let sz = 40; //onturn?100:50;
	let bcolor = plname == Z.uplayer ? 'lime' : 'silver';
	let border = pl.playmode == 'bot' ? `double 5px ${bcolor}` : `solid 5px ${bcolor}`;
	let rounding = pl.playmode == 'bot' ? '0px' : '50%';
	let d = mDiv(d1, { margin: 4, align: 'center' });
	let stats = mDiv(d, { hmax: 14 }, null, 'hallo'); mCenterFlex(stats);
	// let img=mCreate('img');
	// img.setAttribute('height',sz);
	// img.setAttribute('width',sz);
	// img.src=`../base/assets/images/${plname}.jpg`;
	// mStyle(img,{rounding:rounding,display:'inline',border:border,box:true});
	// let dimg=mDiv(d,{align:'center',padding:0},null,img);
	//let dimg = mDiv(d, {}, null, `<img src='../base/assets/images/${plname}.jpg' style="border-radius:${rounding};display:block;border:${border};box-sizing:border-box" class='img_person' width=${sz} height=${sz}>`);
	let dimg = mDiv(d, { padding: 0 }, null, `<img src='../base/assets/images/${plname}.jpg' style="border-radius:${rounding};border:${border};box-sizing:border-box" width=${sz} height=${sz}>`);
	mCenterFlex(dimg);
	let card = mDiv(d, { hmin: 40 }); mCenterFlex(card);
	let x = lookupSetOverride(UI, ['stats', plname], { douter: d, dstats: stats, dimg: dimg, dcard: card });
	return x;
}

function accuse_stats(d) {
	let players = Z.fen.players;
	//console.log('uplayer',Z.uplayer)
	let d1 = mDiv(d, { display: 'flex', 'justify-content': 'center', 'align-items': 'space-evenly' });
	for (const plname of get_present_order()) {
		let pl = players[plname];
		let onturn = Z.turn.includes(plname);
		let sz = 50; //onturn?100:50;
		let bcolor = plname == Z.uplayer ? 'lime' : 'silver';
		let border = pl.playmode == 'bot' ? `double 5px ${bcolor}` : `solid 5px ${bcolor}`;
		let rounding = pl.playmode == 'bot' ? '0px' : '50%';
		let d2 = mDiv(d1, { margin: 4, align: 'center' }, null, `<img src='../base/assets/images/${plname}.jpg' style="border-radius:${rounding};display:block;border:${border};box-sizing:border-box" class='img_person' width=${sz} height=${sz}>${get_player_score(plname)}`);

		if (TESTHISTORY) {
			let d3 = mDiv(d2, { display: 'flex', gap: 4 });
			let dleft = ari_get_card(pl.idleft, 40); mAppend(d3, iDiv(dleft))
			if (isdef(pl.membership)) { let dmiddle = ari_get_card(pl.membership, 40); mAppend(d3, iDiv(dmiddle)); }
			let dright = ari_get_card(pl.idright, 40); mAppend(d3, iDiv(dright))
		}
	}
}


function accuse_activate() {
	//console.log('activating for', Z.uplayer)
	let [stage, A, fen, phase, uplayer] = [Z.stage, Z.A, Z.fen, Z.phase, Z.uplayer];

	show_progress();
	stage = 'ball'
	switch (stage) {
		case 'ball': select_add_items(ui_get_hand_items(uplayer), post_select, 'may select card to play', 0, 1); break;
		default:
	}
}


function accuse_activate() {
	let [pldata, stage, A, fen, phase, uplayer] = [Z.playerdata, Z.stage, Z.A, Z.fen, Z.phase, Z.uplayer];

	//stages: hand, write, select, round
	//hand: 
	let donelist = Z.playerdata.filter(x => isDict(x.state));
	let complete = donelist.length == Z.plorder.length;
	let resolvable = uplayer == fen.starter && complete;
	//console.log('donelist',donelist.length
	let waiting = !resolvable && isdef(donelist.find(x => x.name == uplayer));

	// let humans=[];
	// for(const pl in fen.players) if (fen.players[pl].playmode == 'human') humans.push(pl);
	// let humancomplete = true;
	// for(data of Z.playerdata) if (humans.includes(data.name) && isEmpty(data.state)) humancomplete = false;
	//console.log(uplayer, stage, 'done', donelist, 'complete', complete, 'waiting', waiting);

	Z.isWaiting = false;
	if (waiting) {
		console.log('WAITING!!!!!!!!!', uplayer);
		//either results are not all in or am NOT the starter (=admin)
		let mystate = donelist.find(x => x.name == uplayer).state.card;
		if (!isEmpty(mystate)) {
			let handui = lookup(UI, ['players', uplayer, 'hand']);
			//console.log('handui',handui)
			let items = handui.items;
			let cardui = items.find(x => x.key == mystate)

			//.items.find(item=>item.a == mystate);
			//console.log('mystate',mystate,cardui)
			if (stage == 'hand' && isdef(cardui)) make_card_selected(cardui);
			else if (stage == 'membership' && isdef(cardui)) make_card_selected(cardui);
			else mDiv(dTable(''))


		}
		//mDiv(dTable, {}, null, 'WAITING FOR PLAYERS TO COMPLETE....');
		if (complete) {
			//turn is transferred to starter
			Z.turn = [fen.starter];
			if (Z.mode != 'multi') take_turn_waiting();

		}
		Z.isWaiting = true;
		autopoll();
	} else if (stage == 'hand' && resolvable) {
		assertion(uplayer == fen.starter, 'NOT THE STARTER WHO COMPLETES THE STAGE!!!')
		console.log('RESOLVING HAND!!!!!!!!!!!!!')
		let votes = [];
		let outofpoll = [];
		for (const pldata of Z.playerdata) {
			let plname = pldata.name;
			let card = pldata.state.card;
			if (!isEmpty(card)) votes.push({ plname: plname, card: card });
			else outofpoll.push(plname);
		}

		//resolve votes
		//0. check if unsuccessful (no votes)
		if (isEmpty(votes)) {
			//nothing has changed
			//restart session
			Z.turn = jsCopy(Z.plorder);
			Z.stage = 'hand';
			take_turn_fen_clear();
			return;
		}
		//1. check if all votes same color
		let color = ['H', 'D'].includes(votes[0].card[1]) ? 'red' : 'black';
		let allsame = true;
		for (const v of votes) {
			let c1 = ['H', 'D'].includes(v.card[1]) ? 'red' : 'black';
			if (c1 != color) { allsame = false; break; }
		}
		if (allsame) {
			//session ends! consensus
			lookupAddToList(fen, ['sessions'], color)
			Z.turn = jsCopy(Z.plorder);
			//Z.phase += 1
			Z.stage = 'round';
			take_turn_fen_clear();
			return;

		}
		//ermittle winner if any
		//sort votes by rank
		let ranks = 'KQJT98765432A';
		let vsorted = sortByFunc(votes, x => ranks.indexOf(x.card[0]));
		let best = vsorted[0];
		//schau ob eindeutig!
		let winning_vote = vsorted[0];
		if (votes.length > 1 && vsorted[1].card[0] == vsorted[0].card[0]) {
			winning_vote = null;
		}
		if (winning_vote) {
			let plwinner = winning_vote.plname
			Z.turn = [plwinner];
			Z.stage = 'president';
			//return all non-winning votes zu player hands
			//done
			//discard winning vote
			removeInPlace(fen.players[plwinner].hand, winning_vote.card);
			//eigentlich soll es zur discard pile!			
		}

		return;
		sentences.push({ plname: '', text: start + ' ' + fen.saying.end.toLowerCase() });
		fen.sentences = shuffle(sentences);
		Z.turn = jsCopy(Z.plorder);
		Z.stage = 'select';
		take_turn_fen_clear();

	} else if (stage == 'hand') {
		select_add_items(ui_get_hand_items(uplayer), accuse_submit_card, 'may select card to play', 0, 1);
		// let d = mCreate('form');
		// let dt = dTable;
		// mAppend(dt, d);
		// d.autocomplete = "off";
		// d.action = "javascript:void(0);";
		// mDiv(d, { fz: 20 }, 'dForm', fen.saying.start.toLowerCase() + '...');
		// Z.form = d;
		// mLinebreak(d, 10);
		// mInput(d, { wmin: 600 }, 'i_end', 'enter ending');
		// d.onsubmit = accuse_submit_card;
	} else if (stage == 'select' && resolvable) {
		assertion(uplayer == fen.starter, 'NOT THE STARTER WHO COMPLETES THE STAGE!!!')
		let d = mDiv(dTable, {});
		fen.result = {};
		for (const pldata of Z.playerdata) {
			let selecting = pldata.name;
			let selected = pldata.state.plname;
			let text = pldata.state.text;
			//console.log('selected',selected, typeof selected);
			if (isEmpty(selected)) { //} || selected === null || !selected || nundef(selected)){ // nundef(selected)) {
				console.log('REINGEGANGEN!!!!!!!!!!!!!!')
				fen.players[selecting].score += 1;
				selected = 'correct';
			} else if (selecting != selected) {
				//console.log('selecting', selecting, 'selected', selected ?? 'null')
				fen.players[selected].score += 1;
			}
			fen.result[selecting] = { plname: selected, text: text };
			//that player gets a point
			//selections.push({ plname: plname, text: text.toLowerCase() });

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
			d1.onclick = accuse_select_sentence;
		}
	} else if (stage == 'round' && resolvable) {
		assertion(uplayer == fen.starter, 'NOT THE STARTER WHO COMPLETES THE STAGE!!!')
		//new session starts here!!!!!
		Z.turn = jsCopy(Z.plorder);
		Z.phase += 1;
		Z.stage = 'hand';

		take_turn_fen_clear();
	} else if (stage == 'round') {
		let d = mDiv(dTable, {}, null, `Session end! ${fen.session[fen.phase]} wins`);
		mLinebreak(dTable, 12)
		mButton('WEITER', accuse_onclick_weiter, dTable, {}, ['donebutton', 'enabled']);
	} else {
		//console.log('Z',Z)
		alert('PROBLEM!!!')
	}
}




function present_wise_rest() {

	let done = Z.playerdata.filter(x => isDict(x.state)); //.length = fen.plorder.length;
	console.log('done', done)
	Z.switchStage = uplayer == fen.starter && done.length == Z.plorder.length;


	if (stage == 'write' && !Z.switchStage) {
		if (done.find(x => x.name == uplayer)) {
			mDiv(dt, {}, null, 'waiting for other players to finish.....');
		} else {
			let d = mCreate('form');
			mAppend(dt, d);
			d.autocomplete = "off";
			d.action = "javascript:void(0);";
			mDiv(d, { fz: 20 }, 'dForm', Sayings[fen.index].start.toLowerCase() + '...');
			Z.form = d;
		}

	} else if (isdef(fen.sentences)) {
		console.log('sentences', fen)
		let d = mDiv(dt, {});
		for (const s of fen.sentences) {
			let d1 = mDiv(d, { fz: 20, cursor: 'pointer' }, `dsent_${s.plname}`, s.text, 'hop1');

			d1.onclick = wise_select_sentence;
			//mLinebreak(dt)
		}
	}



} function _activate_wise() {
	let [d, stage, A, fen, phase, uplayer] = [Z.form, Z.stage, Z.A, Z.fen, Z.phase, Z.uplayer];

	if (Z.switchStage) {
		console.log('hallo!!!!!!!!!!!!!!!!!!!!!!!!')
		//ich bin der starter und alle playerdata sind complete!
		let start = Sayings[fen.index].start.toLowerCase();
		let sentences = [];
		for (const pldata of Z.playerdata) {
			let plname = pldata.name;
			let text = start + ' ' + pldata.state.text;
			//fen.players[plname].text = text;
			sentences.push({ plname: plname, text: text.toLowerCase() });
		}
		fen.sentences = shuffle(sentences);
		//fen.sentences = Z.playerdata.map(x => start + ' ' + x.state.text);
		delete Z.switchStage;
		Z.turn = [Z.uplayer];
		Z.stage = 'select';
		take_turn_fen_clear();
	} else {
		let pldata = Z.playerdata.find(x => x.name == uplayer);

		if (!isEmpty(pldata.state)) {
			console.log('player already turned in sentence!!!', pldata);
		} else {
			mLinebreak(d, 10);
			mInput(d, { wmin: 600 }, 'i_end', 'enter ending');
			//console.log('parent', d.parentNode)
			d.onsubmit = wise_submit_text; // ()=>console.log('SUBMITTING',mBy('i_end').value)

		}
	}



}
function activate_MUELL() {
	let [stage, A, fen, phase, uplayer] = [Z.stage, Z.A, Z.fen, Z.phase, Z.uplayer];

	show_stage();
	switch (stage) {
		case 'write': break;


		case 'pick_schwein': select_add_items(ui_get_schweine_candidates(A.uibuilding), post_inspect, 'must select the new schwein', 1, 1); break;
		case 'comm_weitergeben': if (!is_playerdata_set(uplayer)) select_add_items(ui_get_all_commission_items(uplayer), process_comm_setup, `must select ${fen.comm_setup_num} card${fen.comm_setup_num > 1 ? 's' : ''} to discard`, fen.comm_setup_num, fen.comm_setup_num); break;
		case 'auto market': ari_open_market(fen, phase, deck, market); break;
		case 'next_comm_setup_stage': select_confirm_weiter(post_comm_setup_stage); break;
		default: console.log('stage is', stage); break;
	}

}


//WRONG!!!!!!!!!!!!!!!

function monkey_jump() { aJumpby(dPuppet, 60); }
function aRollby(elem, dx, ms = 3000) {
	anime({ targets: elem, translateX: dx, rotate: '1turn', duration: ms });
}
function aJumpby(elem, h = 40, ms = 1000) {
	anime({
		targets: elem,
		keyframes: [
			// {translateY: 0, scaleX:1, scaleY:1}, 
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
		//loop: 2,
	});
	//anime({ targets: elem, translateY: -h, direction: 'alternate', direction: 'alternate', duration: ms });
}

function initui() {
	let htop = 105;

	dPuppet = miPic('monkey', document.body, { position: 'fixed', fz: 40, left: 40, top: htop - 45 });
	aRollby(dPuppet, 250);

	dHeader = mBy('dHeader'); mStyle(dHeader, { h: htop - 22, w: '100vw' });

	//mButton('TEST', () => mStyle('dTable', { h: rNumber(500, 1500) }), dHeader);
	mButton('TEST', monkey_jump, dHeader);

	dMessage = mBy('dMessage'); mStyle(dMessage, { h: 22, w: '100vw' });

	let hmintable = `calc( 90vh - ${htop}px )`;
	dTable = mBy('dTable'); mStyle(dTable, { position: 'relative', hmin: hmintable, wmin: '100%' }); mClass(dTable, 'wood');

	let txt = 'copyright 2022 Vidulus Ludorum';
	let fz = mStyleGet(dTable, 'fz');
	let wprox = mTextWidth(txt, fz);
	dFooter = mDiv(dTable, { position: 'absolute', bottom: -22, left: `calc( 50vw - ${wprox / 2}px )` }, 'dFooter', txt); mCenterFlex(dFooter);

	//dFooter = mBy('dFooter'); mStyle(dFooter,{position:'absolute',bottom:-20});dFooter.innerHTML='copyright 2022 vidulusludorum';



	console.log('dTable', dTable)
	//jetzt wie soll eine file upload form aussehen?
	//ich will beliebiges file uploaden koennen, aber nur als admin oder mit authorization
	//specify upload folder default ./base/uploads
	//specify filename (default orig)
	//dTable soll min von 600 haben


	//wie hab ich die texture wood gemacht>



}

function is_visible(id) { return !mBy(id).classList.includes('d-none'); }

const lastpos = {};
function setw(elem, goal, color) {

	let g = Math.floor(goal);
	let w = Math.floor(firstNumber(elem.style.width));
	if (g == w) return;
	let i = g > w ? granularity : -granularity;

	clearInterval(TO[color]);
	TO[color] = setInterval(() => anim(elem, i, g), 10);

	function anim(el, by, from, to, color) {
		let x = from;
		if (by < 0 && x <= to || by > 0 && x >= to) {
			clearInterval(TO[color]);
		} else {
			x += by;
			el.style.width = x + '%';
		}
	}
}
function paint_game(state) {
	let [wgreen, wred] = [state.green.pos, state.red.pos];

	//w is in percent, have to calc in pixel

	// setw(dgreen,wgreen,'green'); //neeee!
	// setw(dred,wred,'red');

	// if (isdef(TO.animgreen)) TO.animgreen.cancel(); //scheusslich
	// TO.animgreen = mAnimateTo(dgreen,'width',wgreen);

	dgreen.style.width = wgreen + '%';
	dred.style.width = wred + '%';

	// num_calls++;
	// if (Math.abs(lastgreen - wgreen) > granularity) { dgreen.style.width = wgreen + '%'; num_painted += .5; lastgreen = wgreen; }
	// if (Math.abs(lastred - wred) > granularity) { dred.style.width = wred + '%'; num_painted += .5; lastred = wred; }

}




//#region unused old versions
// previous versions for calculations
//1. constant decay: does not use velocity!
//function calc_decay(st, dps) { st.pos -= dps; }
// function calc_event(st, inc) {
// 	st.pos += inc; // inc is constant increment  (Settings.PLUS or Settings.MINUS) 
// 	if (st.pos > 100) st.pos = 100; // upper bound 100%
// }








function fe(st, e, dps, vps) {
	let tnow = get_now();
	let t = (tnow - e.last) / 1000; //secs past since last event

	let T = 10; //horizon only events taking place in the last 10 secs will have effect




}
function event_strength(color) {

	let e = E[color];
	let t = get_now();
	console.log('t', t, typeof t);

	let diff = t - e.tlast; e.tlast = t;
	secs = diff / 1000;

	let T = 10; //horizon
	let r = 2; //decay

	raw = Math.max(0., 1 - secs / T) * Math.pow(0.5, (r * secs / T));

	console.log('secs', secs, 'raw', raw,);

	return Math.min(Math.max(0., raw), 1.);
}
function _calc_event_increment(color) {

	console.log('color', color, 'E', E[color],);
	let e = E[color];
	if (e) e.strength = event_strength(color);
	else e = E[color] = { strength: 1, tlast: get_now() };

	let inc = color == 'green' ? Settings.PLUS : Settings.MINUS;

	let current = e.strength;
	let step = 0.6; //stepsize
	let mag = current + (1 - current) * step;

	console.log('mag', mag, current * inc);

	return mag * inc; // E[color].strength * inc;
}

function bounded(val, inc, min, max) {
	if (val + inc < min) { return min; }
	if (val + inc > max) { return max; }
	return val + inc;
}
//#endregion

function show_settings() {

	if (nundef(settings)) { settings = { DECAY: 2, FR: 5, INTERVAL: 200, MINUS: 5, PLUS: 10, V_DECAY: .05, V_INIT: 1, V_MIN: 0.25, W_INIT: 50, exp_decay: "x * Math.pow((1 - DECAY)", }; }

	let dp = mBy('dSettings') ?? mDiv(dTable, { box: true, margin: 10, padding: 20 }, 'dSettings', null, 'card');
	mClear(dp);
	//let d=mDiv(dp,{display:'grid','grid-template-columns':'1fr 1fr'}); //Grid(dp);
	let dp1 = mDiv(dp, { align: 'center' })
	let [dleft, dright] = mColFlex(dp1, [1, 1]); //,['blue','red']);	
	//dleft.innerHTML = 'hallo';	dright.innerHTML = 'hallo';

	//let d1 = mDiv(dp, {}, null, null, 'row');
	//let dleft = mDiv(dp, {w:100,h:100,bg:'blue'}, null, 'hallo', 'col');
	//let dright = mDiv(dp, {w:100,h:100,bg:'red'}, null, 'geh', 'col');
	// let i = 0;
	//let n = get_keys(settings).length / 2; //console.log('n', n);
	//let fr = 1000 / settings.INTERVAL; let nsettings = jsCopy(settings); for (const k in nsettings) { nsettings[k] *= fr; }

	let lleft = 'w_init decay plus minus';
	let lright = 'v_init v_decay v_min interval';
	let lines = 'exp_decay exp_green exp_red';

	let d = dleft;
	for (const k of toWords(lleft)) {
		let di = mDiv(d, { w: 300 }, null, null, ['coinput', 'd-flex']);
		let label = (k.includes('decay') ? k + '/s' : k == 'interval' ? k + ' in ms' : k) + ':';
		let key = k.toUpperCase();
		//let val = k.includes('decay')?settings[key]*1000/settings.INTERVAL:settings[key];
		let dn = mEditNumber(label, settings[key], di, null, { w: '100%' }, null, `i_${k}`);
	}
	d = dright;
	for (const k of toWords(lright)) {
		let di = mDiv(d, { w: 300 }, null, null, ['coinput', 'd-flex']);
		let label = (k.includes('decay') ? k + '/s' : k == 'interval' ? k + ' in ms' : k) + ':';
		let key = k.toUpperCase();
		//let val = k.includes('decay')?settings[key]*1000/settings.INTERVAL:settings[key];
		let dn = mEditNumber(label, settings[key], di, null, { w: '100%' }, null, `i_${k}`);
	}

	mLinebreak(dp, 10);
	let d1 = mDiv(dp, { gap: 12 }, 'dButtons', null, ['d-flex', 'justify-content-center']);
	mButton('update', update_settings, d1, {}, 'button');
	mButton('defaults', reset_settings, d1, {}, 'button');
}
function reset_settings() {

	for (const k in settings) { settings[k] = defaults[k]; }
	show_settings();


}
function update_settings() {

	let lleft = 'w_init decay plus minus';
	let lright = 'v_init v_decay v_min interval';
	let lines = 'exp_decay exp_green exp_red';
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



function old_processEvent(color) {

	let inc = color == 'green' ? INCGREEN : INCRED;
	return inc;
}

//#region socket handlers
// const socket = io('https://sleepy-island-33889.herokuapp.com/');
//const socket = io('http://localhost:3000/'); 
// const io = require("socket.io-client");
// const socket = io("http://localhost:3000/");



function handleGameOver(data) {
	if (!game_running) {
		return;
	}
	data = JSON.parse(data);

	game_running = false;

	if (data.winner === Clientdata.id) {
		alert('You Win!');
	} else {
		alert('You Lose :(');
	}
}

function handleGameCode(gameCode) {
	dAdminLeft.innerText = gameCode;
}

function handleUnknownCode() {
	reset();
	alert('Unknown Game Code')
}

function handleTooManyPlayers() {
	reset();
	alert('This game is already in progress');
}
//#endregion

//#region unused code

function init_canvas() {

	let canvas, ctx;
	canvas = document.getElementById('canvas');
	ctx = canvas.getContext('2d');

	canvas.width = canvas.height = 600;

	ctx.fillStyle = BG_COLOUR;
	ctx.fillRect(0, 0, canvas.width, canvas.height);

}







//#endregion


function on_host_tick() {
	//console.log('tick host')
	let degrade = DA.degrade = 0;
	let fen = degrade_bars(degrade);
	let options = {};
	//console.log('fen', fen);
	phpPost({ friendly: 'feedback', fen: fen, players: [], clear_players: DA.autoreset, options: options }, 'poll_host');
	DA.autoreset = false;
	// if (DA.resetplayers) {
	// 	DA.resetplayers = false;
	// 	phpPost({ friendly: 'feedback', fen: fen, players: [], clear_players: true, options: options }, 'poll_host');
	// } else {
	// 	phpPost({ friendly: 'feedback', fen: fen, players: [], options: options }, 'poll_host');
	// }
}

function on_guest_tick() {
	//console.log("NOT IMPLEMTTED YET");return;
	ensure_clientstate();

	let o = { friendly: 'feedback', uname: Clientdata.uid, write_player: true, state: jsCopy(Clientdata.state) };
	//console.log('Z',Z);
	//console.log('Clientdata',Clientdata);
	console.log('guest sends state', o.state);

	//console.log('wuerde jetzt senden!',o)
	for (const k in Clientdata.state) Clientdata.state[k] = 0;
	phpPost(o, 'poll');
}

function update_Z(role) {
	//console.log('_____update_ui',role); //, Serverdata);
	ensure_Z();

	let [fen, playerdata] = [Z.fen, Z.playerdata];
	console.log('fen', fen);
	sss();

	//update bars
	// for (const k in DA.bars) {set_bar(k,fen[k],1);}

	assertion(role == Clientdata.role, 'role mismatch');

	if (role == 'host') host_update(); else guest_update();

}


function start_downgrade_ticker() {
	TO.main = setTimeout(degrade_bars, 5000);
}
function degrade_bars() {
	for (const color in DA.bars) {
		let bar = DA.bars[color];
		set_bar(color, bar.w - 1, 1);

	}
	Z.fen.decrement += 1;
	start_downgrade_ticker();
}
function feedback_update_fen() {
	//aggregate all values for green and red in playerdata
	let fen = Z.fen;
	fen.barvalues = {};
	for (const pldata of Z.playerdata) {
		if (isdef(pldata.state)) {
			for (const color in pldata.state) {
				let value = pldata.state[color];
				if (isdef(fen.barvalues[color])) {
					fen.barvalues[color] += value;
				} else {
					fen.barvalues[color] = value;
				}
			}
		}
	}
	for (const k in fen.barvalues) {
		let val = fen.barvalues[k] - fen.decrement;
		if (val < 0) val = 0;
		fen.barvalues[k] = val;
	}


}



function onclick_restart_long() {
	//new code: startgame mit selben players und options
	let game = Z.game;
	let playernames = [Z.host].concat(Z.plorder.filter(x => x != Z.host));
	let playmodes = playernames.map(x => Z.fen.players[x].playmode);
	let strategies = playernames.map(x => Z.fen.players[x].strategy);
	let i = 0; let players = playernames.map(x => ({ name: x, strategy: strategies[i], playmode: playmodes[i++] }));
	let options = Z.options;
	stopgame();
	startgame(game, players, options);
}
function onclick_restart_NEW() {
	//old code: nur die fen wird resettet
	let fen = Z.fen;
	let oldZ = {};
	for (const k of ['uplayer', 'game', 'host', 'func', 'mode', 'options', 'friendly', 'uname']) { oldZ[k] = Z[k]; }
	Z = {}; //Z.scoring = {};
	for (const k of ['uplayer', 'game', 'host', 'func', 'mode', 'options', 'friendly', 'uname']) { Z[k] = oldZ[k]; }

	if (nundef(fen.original_players)) fen.original_players = fen.players;
	//if (isdef(fen.original_players)) plorder=fen.original_players;
	let playernames = [Z.host].concat(get_keys(fen.original_players).filter(x => x != Z.host));
	let playmodes = playernames.map(x => fen.original_players[x].playmode);
	let strategies = playernames.map(x => fen.original_players[x].strategy);

	let default_options = {}; for (const k in Config.games[Z.game].options) default_options[k] = arrLast(Config.games[Z.game].options[k].split(','));
	addKeys(default_options, Z.options);

	//console.log('playernames',playernames,'playmodes',playmodes)
	fen = Z.fen = Z.func.setup(playernames, Z.options);
	[Z.stage, Z.turn, Z.round, Z.step, Z.phase] = [fen.stage, fen.turn, 1, 1, fen.phase];
	let i = 0; let players = playernames.map(x => { let pl = fen.players[x]; pl.name = x; pl.strategy = strategies[i]; pl.playmode = playmodes[i++]; });
	// let i = 0; playernames.map(x => fen.players[x].playmode = playmodes[i++]); //restore playmode
	//if (Z.game == 'spotit') spotit_clear_score();
	//console.log('neue fen',Z.fen.plorder.map(x=>fen.players[x].time_left))
	take_turn_fen_clear();
}

//#region rumorsetup
function process_rumors_setup_orig() {

	let [fen, A, uplayer, plorder, data] = [Z.fen, Z.A, Z.uplayer, Z.plorder, Z.uplayer_data];

	let items = A.selected.map(x => A.items[x]);
	let receiver = firstCond(items, x => plorder.includes(x.key)).key;
	let rumor = firstCond(items, x => !plorder.includes(x.key));
	if (nundef(receiver) || nundef(rumor)) {
		select_error('you must select exactly one player and one rumor card!');
		return;
	}

	assertion(isdef(data), 'no data for player ' + uplayer); //	sss(); //console.log('data',data);

	let remaining = arrMinus(data.state.remaining, rumor.key); //fen.players[uplayer].rumors = arrMinus(fen.players[uplayer].rumors, rumor.key);
	lookupAddToList(data, ['state', 'di', receiver], rumor.key);
	lookupAddToList(data, ['state', 'receivers'], receiver);
	lookupSetOverride(data, ['state', 'remaining'], remaining);

	//console.log('state nach auswahl von', rumor.key, 'fuer', receiver, data.state);

	Z.state = data.state; //genau DAS muss gesendet werden!!!!!

	//check can_resolve (das ist weenn ALLE rumors von ALLEN spielern verteilt sind!)
	let done = ari_try_resolve_rumors_distribution();
	//console.log('===>ALL DONE!', done, 'remaining', remaining);
	if (!done) {
		if (isEmpty(remaining)) {
			take_turn_write_complete();
		} else {
			//console.log('WRITING STOP!!!!!!!!!!!!!!!!!!!!!!!!!!!!',uplayer)
			take_turn_write_partial();
		}
	}
}



function process_rumors_setup_0() {

	let [fen, A, uplayer, plorder, data] = [Z.fen, Z.A, Z.uplayer, Z.plorder, Z.uplayer_data];

	let items = A.selected.map(x => A.items[x]);
	let receiver = firstCond(items, x => plorder.includes(x.key)).key;
	let rumor = firstCond(items, x => !plorder.includes(x.key));
	if (nundef(receiver) || nundef(rumor)) {
		select_error('you must select exactly one player and one rumor card!');
		return;
	}

	assertion(isdef(data), 'no data for player ' + uplayer); //	sss(); //console.log('data',data);

	let remaining = arrMinus(data.state.remaining, rumor.key); //fen.players[uplayer].rumors = arrMinus(fen.players[uplayer].rumors, rumor.key);
	lookupAddToList(data, ['state', 'di', receiver], rumor.key);
	lookupAddToList(data, ['state', 'receivers'], receiver);
	lookupSetOverride(data, ['state', 'remaining'], remaining);

	//console.log('state nach auswahl von', rumor.key, 'fuer', receiver, data.state);

	Z.state = data.state; //genau DAS muss gesendet werden!!!!!

	//check can_resolve (das ist weenn ALLE rumors von ALLEN spielern verteilt sind!)
	let done = ari_try_resolve_rumors_distribution();
	console.log('===>ALL DONE!', done, 'remaining', remaining);
	if (!done) {
		if (isEmpty(remaining)) {
			clear_transaction();
			//console.log('player',uplayer,'done:');
			sss1();
			take_turn_write();
		} else {
			//console.log('WRITING STOP!!!!!!!!!!!!!!!!!!!!!!!!!!!!',uplayer)
			add_transaction('rumorsetup');
			//console.log('player',uplayer,'in transaction:');
			sss1();
			take_turn_write();
		}
	}
}

function restmule() {
	//check can_resolve (das ist weenn ALLE rumors von ALLEN spielern verteilt sind!)
	let done = ari_try_resolve_rumors_distribution();
	console.log('===>ALL DONE!', done, 'remaining', remaining);
	if (!done) {
		if (isEmpty(remaining)) {
			clear_transaction();
			//console.log('player',uplayer,'done:');
			sss1();
			take_turn_write();
		} else {
			//console.log('WRITING STOP!!!!!!!!!!!!!!!!!!!!!!!!!!!!',uplayer)
			add_transaction('rumorsetup');
			//console.log('player',uplayer,'in transaction:');
			sss1();
			take_turn_write();
		}
	}
}
function ari_try_resolve_rumors_distribution() {
	if (!i_am_host()) return false;
	//console.log('HAAAAAAAAAAAAAAAAAAAAAAAA')
	let can_resolve = true;
	for (const pldata of Z.playerdata) {
		//let data1 = pldata;
		console.log('pldata', pldata.name, pldata.state.di, pldata.state.remaining);

		// if (isEmpty(pldata.state)) { console.log('empty, break'); can_resolve = false; break; }
		// else if (!isEmpty(pldata.state.remaining)) { console.log('some remaining!, break'); can_resolve = false; break; }

		//let receivers = data1.receivers;		if (receivers.length < Z.plorder.length-1) { can_resolve = false; break; }

		if (isEmpty(pldata.state)) { can_resolve = false; break; }
		else if (!isEmpty(pldata.state.remaining)) { can_resolve = false; break; }

	}
	// hier ist es richtig!

	// console.log('can_resolve', can_resolve);
	if (can_resolve) {
		//console.log('HAAAAAAAAAAAAAAAAAALLLLLLLLLLLLLLLOOOOOOOOOOOOOOOOOOOOO');
		Z.turn = [Z.host];
		Z.stage = 105; //'next_rumors_setup_stage';
		clear_transaction();

		console.log('Z.state', Z.state, 'uplayer');
		take_turn_fen();
		//console.log('can resolve');
		sss1();
		return true;
	}
	return false;
}
//#endregion

function is_legal_if_7R(cards) {
	//assumes that if this is a sequence, the sequence is legal,
	//this just tests whether the player is allowed to put down a 7sequence at this time

	//console.log('_is_legal_if_7R', cards);

	let keys = cards.map(x => x.key);
	let isgroup = is_group(keys);
	if (isgroup) return true;
	if (is_fixed_goal() && get_round_goal() != '7R') {
		//console.log('DESHALB!!!')
		return false;
	}
	let [fen, uplayer] = [Z.fen, Z.uplayer];
	let pl = fen.players[uplayer];
	if (!is_fixed_goal() && pl.goals['7R'] == true) return false;

	if (pl.journeys.find(x => is_sequence(x))) return false;

	if (pl.roundgoal) return false;

	return true;

}

function fp_card_selection() {
	let [plorder, stage, A, fen, uplayer, pl] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer, Z.fen.players[Z.uplayer]];

	let selitems = A.selectedCards = A.selected.map(x => A.items[x]);
	let cards = selitems.map(x => x.o);
	let cmd = A.last_selected.key;

	if (cmd == 'discard') {
		//if only 1 card selected, discard it
		//first deal with error cases!
		if (selitems.length != 1) { select_error('select exactly 1 hand card to discard!'); return; }

		let item = selitems[0];
		if (!item.path.includes(`${uplayer}.hand`)) { select_error('select a hand card to discard!', () => { ari_make_unselected(item); A.selected = []; }); return; }

		//console.log('discard! DA',DA);
		//here I have to check for transaction and commit or _rollback
		//if transactionlist is non-empty, check if player's minimum req has been fullfilled
		//console.log('discard', DA.transactionlist);
		assertion(DA.transactionlist.length == 0 || DA.simulate, '!!!!!!!!!!!!!!!!transactionlist is not empty!');
		let legal = verify_min_req();
		if (legal) {
			ferro_process_discard(); //discard selected card
			//take_turn_single();
		} else if (DA.simulate) {
			clear_transaction();
			ferro_transaction_error();
		} else {
			select_error('minimum requirements not fullfilled!');
		}
	} else if (cmd == 'jolly') {

		//first, error cases: have to select exactly 2 cards
		if (selitems.length != 2) { select_error('select a hand card and the jolly you want!'); return; }
		//one card has to be hand, the other jolly from a group
		let handcard = selitems.find(x => !is_joker(x.o) && x.path.includes(`${uplayer}.hand`));
		let jolly = selitems.find(x => is_joker(x.o) && !x.path.includes(`${uplayer}.hand`));
		if (!isdef(handcard) || !isdef(jolly)) { select_error('select a hand card and the jolly you want!'); return; }

		let key = handcard.key;
		let j = path2fen(fen, jolly.path);
		if (!jolly_matches(key, j)) { select_error('your card does not match jolly!'); return; }

		//if player has not yet played a set, simulate transaction!!!!
		if (pl.journeys.length == 0) { add_transaction(cmd); }
		ferro_process_jolly(key, j);
		take_turn_fen();

	} else if (cmd == 'auflegen') {

		if (selitems.length < 3) { select_error('select cards to form a group!'); return; }
		else if (pl.hand.length == selitems.length) { select_error('you need to keep a card for discard!!', clear_selection); return; }
		// console.log('HAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', cards.map(x=>x.key))
		let newset = ferro_is_set(cards, Z.options.jokers_per_group);

		//console.log('nach is_set', newset);

		//console.log('is_set', is_set);
		if (!newset) { select_error('this is NOT a valid set!'); return; }

		//special case fuer 7R: geht nur in 7R round wenn fixed order
		let is_illegal = is_correct_group_illegal(cards);
		//console.log('is_legal', is_legal);

		if (is_illegal) { select_error(is_illegal); return; }

		if (pl.journeys.length == 0) { add_transaction(cmd); }
		let keys = newset; //cards.map(x => x.key);
		ferro_process_set(keys);
		take_turn_fen();

	} else if (cmd == 'anlegen') {

		if (selitems.length < 1) { select_error('select at least 1 hand card and the first card of a group!'); return; }
		else if (pl.hand.length == selitems.length - 1) { select_error('you need to keep a card for discard!!', clear_selection); return; }

		let handcards = selitems.filter(x => !is_joker(x.o) && x.path.includes(`${uplayer}.hand`));
		let groupcard = selitems.find(x => !is_joker(x.o) && !x.path.includes(`${uplayer}.hand`));
		if (isEmpty(handcards) || !isdef(groupcard)) { select_error('select 1 or more hand cards and the first card of a group!'); return; }

		//test try_anlegen for all handcards
		//if more than one handcard, test if all have the same rank
		let hand_rank = handcards[0].key[0];
		let handcards_same_rank = handcards.every(x => x.key[0] == hand_rank);
		let j = path2fen(fen, groupcard.path);

		if (is_group(j)) {
			if (!handcards_same_rank) { select_error('all hand cards must have the same rank!'); return; }

			let group_rank = groupcard.key[0];
			if (group_rank == hand_rank) {
				//console.log('anlegen is legal');

				for (const h of handcards) {
					elem_from_to(h.key, fen.players[uplayer].hand, j);
				}
				if (pl.journeys.length == 0) { add_transaction(cmd); }
				take_turn_fen();
				return;
			} else {
				select_error('hand cards do not match the group!');
				return;
			}
		} else { //its a sequence!
			//sort hand cards
			//more than 1 hand_card!
			let suit = get_sequence_suit(j);
			let handkeys = handcards.map(x => x.key); //console.log('suit',suit,'keys', keys);
			if (firstCond(handkeys, x => x[1] != suit)) { select_error('hand card suit does not match the group!'); return; }

			//look if first key is a jolly
			let ij = j.findIndex(x => is_jolly(x));
			let j_has_jolly = ij > -1;
			let rank_to_be_relaced_by_jolly = j_has_jolly ? find_jolly_rank(j) : null;

			let r = rank_to_be_relaced_by_jolly;
			if (r) {
				j[ij] = r + suit + 'n';
			}

			//now should have a seequence without jolly!
			keys = handkeys.concat(j);
			let allcards = keys.map(x => ferro_get_card(x)); // handcards.concat(j.map(x=>ferro_get_card(x)));
			let jneeded = sortCardItemsToSequence(allcards, undefined, 0);

			//now replace back if r != null
			//console.log('new sequence', allcards.map(x => x.key), 'jneeded', jneeded);
			if (jneeded == 0) {
				//if r != null need to replace r key by * in final sequence
				let seq = allcards.map(x => x.key);
				if (r) { arrReplace1(seq, r + suit + 'n', '*Hn'); }
				//console.log('new sequence', seq);
				j.length = 0;
				j.push(...seq);
				for (const k of handkeys) { removeInPlace(fen.players[uplayer].hand, k); }
				if (pl.journeys.length == 0) { add_transaction(cmd); }
				take_turn_fen();
				//console.log('YES!');

			} else {
				if (r != null) { j[ij] = '*Hn'; }
				select_error('hand cards cannot be added to sequence!');
				return;
			}
		}
	}
}

//#region NOT USED
function ferro_round_end_ack_player() {
	//let [z, A, fen, stage, uplayer, ui] = [Z, Z.A, Z.fen, Z.stage, Z.uplayer, UI];
	Clientdata.acked = true;
	mBy('dSelections0').innerHTML = 'waiting for next round to start...'; //.remove();
}
//#endregion


function ferro_transaction_error(goals, transactions, callbackname) {
	let di = {
		'3': 'one set of 3',
		'33': 'two sets of 3',
		'4': 'one set of 4',
		'44': 'two sets of 4',
		'5': 'one set of 5',
		'55': 'two sets of 5',
		'7R': 'a sequence of 7',
	};

	//let goals = ['44', '5', '55', '7R'];

	let alternatives = [];
	let singles = goals.filter(x => x.length == 1).sort();
	let doubles = goals.filter(x => x != '7R' && x.length == 2).sort();
	let s7 = goals.filter(x => x == '7R');

	if (!isEmpty(singles)) alternatives.push(di[singles[0]]);
	if (!isEmpty(doubles) && (isEmpty(singles) || Number(singles[0][0]) > Number(doubles[0][0]))) alternatives.push(di[doubles[0]]);
	if (!isEmpty(s7)) alternatives.push(di[s7[0]]);

	// let min_els = find_minimum_by_func(DA.min_goals,x=>x[0]);
	// let min_numsets = (min_els.length == 2)?find_minimum_by_func(DA.min_goals,x=>length[x]):1;
	// let can_do_7R = DA.min_goals.includes('7R');

	//lowestNumber = DA.min_goals.find(x=>)
	let msg_min_req = `You need to fulfill the minimum requirement of ${alternatives.join(' or ')}!`;
	let l = transactions; //['jolly']; // DA.transactionlist;
	let [jolly, auflegen, anlegen] = [l.includes('jolly'), l.includes('auflegen'), l.includes('anlegen')];
	let msg_action = anlegen ? 'Anlegen requires auflegen von minimum first!' :
		'jolly' ? 'To exchange a jolly you need to be able to auflegen!' :
			'Your sets are not good enough!';

	let dError = mBy('dError');
	dError.innerHTML = `<h2>Impossible Transaction!</h2><p>${msg_min_req}</p><p>${msg_action}</p><div style="text-align:center">...performing rollback...</div>`;
	dError.innerHTML += `<div style="text-align:center"><button class="donebutton" onclick="${callbackname}()">CLICK TO CONTINUE</button></div>`;

}


function correct_handsorting(hand, plname) {
	let pl = Z.fen.players[plname];
	//console.log('pl',pl,'Clientdata',Clientdata);
	let [cs, pls, locs] = [Clientdata.handsorting, pl.handsorting, localStorage.getItem('handsorting')];

	//console.log('correct_handsorting:', 'client', cs, 'pl', pls, 'stor', locs);

	let s = cs ?? pls ?? locs ?? Config.games[Z.game].defaulthandsorting;
	//console.log('sorting is',s);
	// return;

	// if (nundef(cs) && nundef(pls)) {
	// 	let hs;
	// 	hs = localStorage.getItem('handsorting');
	// 	if (hs) Clientdata.handsorting = JSON.parse(hs);
	// 	else Clientdata.handsorting = Config.games[Z.game].defaulthandsorting;
	// 	pls = pl.handsorting = Clientdata.handsorting;
	// 	localStorage.setItem('handsorting', JSON.stringify(pls));
	// } else if (nundef(cs)) { Clientdata.handsorting = pls; localStorage.setItem('handsorting', JSON.stringify(pls)); }
	// if (isdef(cs) && isdef(pls) && cs != pls) { pls = pl.handsorting = cs; localStorage.setItem('handsorting', JSON.stringify(pls)); }; //update from current
	// console.log('current sorting:', pls);
	// //pls is now the correct sorting

	hand = sort_cards(hand, s == 'suit', 'CDSH', true, Z.func.rankstr);
	return hand;

}

function correct_handsorting(hand, plname) {
	let pl = Z.fen.players[plname];
	//console.log('pl',pl,'Clientdata',Clientdata);
	let [cs, pls, locs] = [Clientdata.handsorting, pl.handsorting, localStorage.getItem('handsorting')];

	console.log('correct_handsorting:', 'client', cs, 'pl', pls, 'stor', locs);
	if (nundef(cs) && nundef(pls)) {
		let hs;
		hs = localStorage.getItem('handsorting');
		if (hs) Clientdata.handsorting = JSON.parse(hs);
		else Clientdata.handsorting = Config.games[Z.game].defaulthandsorting;
		pls = pl.handsorting = Clientdata.handsorting;
		localStorage.setItem('handsorting', JSON.stringify(pls));
	} else if (nundef(cs)) { Clientdata.handsorting = pls; localStorage.setItem('handsorting', JSON.stringify(pls)); }
	if (isdef(cs) && isdef(pls) && cs != pls) { pls = pl.handsorting = cs; localStorage.setItem('handsorting', JSON.stringify(pls)); }; //update from current
	console.log('current sorting:', pls);

	//pls is now the correct sorting
	hand = sort_cards(hand, pls == 'suit', 'CDSH', true, Z.func.rankstr);
	return hand;

}

function onclick_by_rank_ari() {

	let items = UI.players[Z.uplayer].hand.items; //ui_get_hand_items(Z.uplayer).map(x => x.o);
	console.log('items', items);
	let s1 = items.map(x => `${x.index}:${x.key}`).join(',');

	return;
	console.log('onclick_by_rank', s1);

	onclick_by_rank();

	reindex_items(items);
	let s2 = items.map(x => `${x.index}:${x.key}`).join(',');
	console.log('...items', items.map(x => `${x.index}:${x.key}`));

}

function restrest() {
	let len = no_twos.length; // anzahl der Karten ohne 2er
	let upper = arrTake(no_twos, len / 2, len / 2 - 1);
	let lower = arrTake(no_twos, len / 2, 0);

	let myupper = intersection(upper, pl.hand); //upper.filter(x => pl.hand.map(y=>x[0] == pl.name); // meine Karten ohne 2er
	let highset = isEmpty(myupper) ? upper : myupper;


	let highrank = rChoose(highset)[0];
	let lowrank = rChoose(lower)[0];
	if (highrank == lowrank) lowrank = firstCond(pl.hand, x => x[0] != highrank);
	if (highrank == lowrank) lowrank = firstCond(no_twos, x => x[0] != highrank);

	let newbid = null;
	if (nundef(fen.lastbid)) {
		console.log('muesste hier landen')
		//make a reasonable guess
		newbid = [nreason, toword[highrank], 1, toword[lowrank]];
		return [newbid, handle_bid];
	} else if (get_rank_index(highrank, rankstr) > get_rank_index(torank[fen.lastbid[1]], rankstr)) {
		//how likely is it that I can overbid higher number?
		let b = fen.lastbid;
		newbid = [b[0], toword[highrank], b[2], b[3]];
	}
	if (newbid) {
		//console.log('all_hand_cards:', all_hand_cards,upper,myupper);
		//console.log('expected:', expected, nreason);
		//console.log('upper, lower', upper, lower);
		console.log('newbid', newbid);
	}
	return [newbid, newbid == null && nundef(fen.lastbid) ? handle_gehtHoch : handle_bid];

}


function restttt() {
	let words = get_keys(torank).slice(1); // words sind three, four, ..., king, ace
	let b = isdef(fen.lastbid) ? jsCopy(fen.lastbid) : null;
	let playerslist = dict2list(fen.players, 'name');

	let all_hand_cards = aggregate_elements(playerslist, 'hand');
	let expected = all_hand_cards / 13; // auch 2er gibt es soviele!
	let byrank = aggregate_player_hands_by_rank(fen);
	let rank_list = dict2list(byrank, 'rank');

	//sort rank_list by value
	rank_list.sort((a, b) => b.value - a.value);
	let max_reason = Math.round(expected * 1.5);
	let max_count = rank_list[0].value;
	let min_count = rank_list[rank_list.length - 1].value;

	console.log('all_hand_cards:', byrank, rank_list);
	let max_ranks = rank_list.filter(x => x.value == max_count);
	let max_owner = max_ranks.filter(x => pl.hand.map(y => y[0]).includes(x.rank));
	console.log('max_ranks', jsCopy(max_ranks));
	let highest_count = b ? b[0] : 0;
	let highest_rank = b ? torank[b[1]] : '3';

	//soll ich der ai eine kleine chance geben dass sie komplett schummelt???
	//if (coin()) {
	console.log('last bid:', isdef(b) ? b : 'null'); //[2, 'six', 2, 'five'] beispiel

	//try to overbid last bid using rank_list
	let newbid = null;
	if (isdef(b)) {
		//if max_count is higher than highest_count, I can overbid
		if (max_count > highest_count) {
			//find highest_rank in rank_list

			newbid = [max_count, toword[rChoose(isEmpty(max_owner) ? max_ranks : max_owner).rank], b[2], b[3]];

		} else if (max_count == highest_count) {

			//find a rank in max_ranks that is higher than highest_rank
			let rankstr = '3456789TJQKA2';
			console.log('highest_rank:', highest_rank);
			let highest_index = get_rank_index(highest_rank, rankstr);
			let valid_ranks = max_ranks.filter(x => get_rank_index(x.rank, rankstr) > highest_index);
			if (valid_ranks.length > 0) {
				//can still beat it!
				newbid = [max_count, toword[rChoose(valid_ranks).rank], b[2], b[3]];
			} else {
				valid_ranks = max_ranks.filter(x => get_rank_index(x.rank, rankstr) == highest_index);
				if (valid_ranks.length > 0) {
					//remove valid_ranks from max_ranks
					max_ranks = arrMinus(max_ranks, valid_ranks);
					console.log('max_ranks is jetzt', jsCopy(max_ranks));
				}

				//can I 
			}

		}

	} else {
		console.log('...max', max_owner, max_ranks);
		let rand = rChoose(isEmpty(max_owner) ? max_ranks : max_owner);
		let rank = rand.rank;
		console.log('rand', rand, 'rank', rank);
		newbid = [max_count, toword[rank], '_', '_'];

	}
	if (newbid) {
		fen.newbid = newbid;
		//console.log('new bid:', b);
		UI.dAnzeige.innerHTML = bid_to_string(newbid);
	}
	return newbid;
}


function _bluff_generate_random_bid() {
	let [A, fen, uplayer] = [Z.A, Z.fen, Z.uplayer];
	const di2 = { _: '_', three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 'T', jack: 'J', queen: 'Q', king: 'K', ace: 'A' };

	let words = get_keys(di2).slice(1); // words sind three, four, ..., king, ace

	let b = isdef(fen.lastbid) ? jsCopy(fen.lastbid) : null;
	//console.log('last bid:', isdef(b) ? b : 'null');
	if (isdef(b)) {
		assertion(b[0] >= (b[2] == '_' ? 0 : b[2]), 'bluff_generate_random_bid: bid not formatted correctly!!!!!!!', b)

		let nmax = calc_reasonable_max(fen);
		let n = b[0] == '_' ? 1 : Number(b[0]);
		let done = false;
		if (n > nmax + 1) {
			//try to modify word instead!
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

		//if no done, manipulate number
		if (!done) {
			if (b[3] == '_') { b[2] = 1; b[3] = rChoose(words, 1, x => x != b[1]); }
			else if (b[0] > b[2]) { b[2] += 1; } //console.log('new bid is now:', b); }
			else { b[0] += coin(80) ? 1 : 2; if (coin()) b[2] = b[3] = '_'; }
		}
	} else {
		//let words = get_keys(di2); //!!!!!!!!!!!!!!!!!!!!!!!!!!NOOOOOOOOOOOOOOOOOOO

		//max bid soll abhaengig sein von wieviele cards im spiel sind oder ich mach clairvoyant bot!
		let nmax = calc_reasonable_max(fen);
		let nmin = Math.max(nmax - 1, 1);
		let arr_nmax = arrRange(1, nmax);
		let arr_nmin = arrRange(1, nmin);
		b = [rChoose(arr_nmax), rChoose(words), rChoose(arr_nmin), rChoose(words)];

		// b = [rChoose([1, 2, 3, 4]), rChoose(words), rChoose([1, 2]), rChoose(words)];
		if (b[1] == b[3]) b[3] = rChoose(words, 1, x => x != b[1]);
		if (coin()) b[2] = b[3] = '_';
	}
	fen.newbid = b;
	//console.log('new bid:', b);
	UI.dAnzeige.innerHTML = bid_to_string(b);

}

function process_rumors_setup() {

	let [fen, A, uplayer, plorder, data] = [Z.fen, Z.A, Z.uplayer, Z.plorder, Z.uplayer_data];

	let items = A.selected.map(x => A.items[x]);
	let receiver = firstCond(items, x => plorder.includes(x.key)).key;
	let rumor = firstCond(items, x => !plorder.includes(x.key));
	if (nundef(receiver) || nundef(rumor)) {
		select_error('you must select exactly one player and one rumor card!');
		return;
	}

	//receiver gets that rumor, aber die verteilung ist erst wenn alle rumors verteilt sind!
	//das geht nicht!!!!!!!!!!!!!!!!!!!!!!! weil ich ja nicht in die fen schreiben kann!!!!!!!
	assertion(isdef(data), 'no data for player ' + uplayer);
	sss(); //console.log('data',data);


	//assertion(isdef(data.state.remaining), 'no state.remaining for player ' + uplayer);

	let remaining = arrMinus(data.state.remaining, rumor.key); //fen.players[uplayer].rumors = arrMinus(fen.players[uplayer].rumors, rumor.key);

	// lookupAddToList(fen, ['di', receiver], rumor.key);
	// lookupAddToList(fen, ['receivers'], receiver);
	lookupAddToList(data, ['state', 'di', receiver], rumor.key);
	lookupAddToList(data, ['state', 'receivers'], receiver);
	lookupSetOverride(data, ['state', 'remaining'], remaining);

	console.log('state nach auswahl von', rumor.key, 'fuer', receiver, data.state);

	Z.state = data.state; //genau DAS muss gesendet werden!!!!!


	//so geht es schon mal NICHT weil der state ja successively geupdated wird!!!!
	// let data = firstCond(Z.playerdata, x => x.name == uplayer);
	// data.state = Z.state;

	//console.log('di', fen.di)

	//der rest wird anders!
	//check can_resolve (das ist weenn ALLE rumors von ALLEN spielern verteilt sind!)
	let done = ari_try_resolve_rumors_distribution();
	if (!done) take_turn_write();
}
function ari_try_resolve_rumors_distribution() {
	if (!i_am_host()) return;
	//console.log('HAAAAAAAAAAAAAAAAAAAAAAAA')
	let can_resolve = true;
	for (const pldata of Z.playerdata) {
		//let data1 = pldata;
		console.log('pldata', pldata, pldata.state, pldata.remaining);
		if (isEmpty(pldata.state)) { console.log('empty, break'); can_resolve = false; break; }

		else if (!isEmpty(pldata.state.remaining)) { console.log('some remaining!, break'); can_resolve = false; break; }
		//let receivers = data1.receivers;		if (receivers.length < Z.plorder.length-1) { can_resolve = false; break; }
	}

	console.log('can_resolve', can_resolve);
	if (can_resolve) {
		//console.log('HAAAAAAAAAAAAAAAAAALLLLLLLLLLLLLLLOOOOOOOOOOOOOOOOOOOOO');
		Z.turn = [Z.host];
		Z.stage = 105; //'next_rumors_setup_stage';
		take_turn_fen_write();
		return true;
	}
	return false;
}
function post_rumor_setup() {
	let [fen, A, uplayer, plorder] = [Z.fen, Z.A, Z.uplayer, Z.plorder];

	for (const plname of plorder) { fen.players[plname].rumors = []; }


	for (const plname of plorder) {
		//if (plname == uplayer) continue;
		//let pl = fen.players[plname];
		let data = firstCond(Z.playerdata, x => x.name == plname);
		let di = data.state.di;
		console.log('di', plname, di);
		for (const k in di) arrPlus(fen.players[k].rumors, di[k]);
		// 	assertion(isdef(fen.rumor_setup_di[plname]), 'no rumors for ' + plname);
		// 	pl.rumors = fen.rumor_setup_di[plname];
	}
	// delete fen.rumor_setup_di;
	// delete fen.rumor_setup_receivers;
	ari_history_list([`gossiping ends`], 'rumors');


	[Z.stage, Z.turn] = set_journey_or_stall_stage(fen, Z.options, fen.phase);
	take_turn_fen_clear();
}




function ui_get_rumors_and_players_items(uplayer) {
	//console.log('uplayer',uplayer,UI.players[uplayer])
	let items = [], i = 0;
	let comm = UI.players[uplayer].rumors;

	let data = firstCond(Z.playerdata, x => x.name == uplayer);
	assertion(isdef(data), 'no data for player ' + uplayer);

	let remaining = valf(lookup(data, ['state', 'remaining']), jsCopy(Z.fen.players[uplayer].rumors));

	for (const o of comm.items) {

		let item = { o: o, a: o.key, key: o.key, friendly: o.short, path: comm.path, index: i };
		i++;
		items.push(item);
	}

	let players = [];
	// let received = valf(Z.fen.rumor_setup_receivers, []);

	let received = valf(lookup(data, ['state', 'rumor_setup_receivers']), []);
	for (const plname in UI.players) {
		if (plname == uplayer || received.includes(plname)) continue;
		players.push(plname);
	}
	items = items.concat(ui_get_string_items(players));

	assertion(comm.items.length == players.length, 'irgendwas stimmt nicht mit rumors verteilung!!!!', players, comm)

	reindex_items(items);
	return items;
}

function process_rumors_setup_orig() {

	let [fen, A, uplayer, plorder] = [Z.fen, Z.A, Z.uplayer, Z.plorder];

	let items = A.selected.map(x => A.items[x]);
	let receiver = firstCond(items, x => plorder.includes(x.key)).key;
	let rumor = firstCond(items, x => !plorder.includes(x.key));
	if (nundef(receiver) || nundef(rumor)) {
		select_error('you must select exactly one player and one rumor card!');
		return;
	}

	//receiver gets that rumor, aber die verteilung ist erst wenn alle rumors verteilt sind!
	let remaining = fen.players[uplayer].rumors = arrMinus(fen.players[uplayer].rumors, rumor.key);
	lookupAddToList(fen, ['rumor_setup_di', receiver], rumor.key);
	lookupAddToList(fen, ['rumor_setup_receivers'], receiver);
	//console.log('di', fen.rumor_setup_di)

	let next = get_next_player(Z, uplayer);
	if (isEmpty(remaining) && next == plorder[0]) {
		//rumor distrib is complete, goto next stage
		for (const plname of plorder) {
			//if (plname == uplayer) continue;
			let pl = fen.players[plname];
			assertion(isdef(fen.rumor_setup_di[plname]), 'no rumors for ' + plname);
			pl.rumors = fen.rumor_setup_di[plname];
		}
		delete fen.rumor_setup_di;
		delete fen.rumor_setup_receivers;
		ari_history_list([`gossiping ends`], 'rumors');


		[Z.stage, Z.turn] = set_journey_or_stall_stage(fen, Z.options, fen.phase);
	} else if (isEmpty(remaining)) {
		//next rumor round starts
		delete fen.rumor_setup_receivers;
		Z.turn = [next];
	}
	take_turn_fen();
}


function process_comm_setup_orig() {

	let [fen, A, uplayer, plorder] = [Z.fen, Z.A, Z.uplayer, Z.plorder];

	//console.log('we are in stage ' + Z.stage);

	let items = A.selected.map(x => A.items[x]);
	let next = get_next_player(Z, uplayer);
	let receiver = next;
	let giver = uplayer;
	let keys = items.map(x => x.key);
	fen.players[giver].commissions = arrMinus(fen.players[giver].commissions, keys);
	if (nundef(fen.comm_setup_di)) fen.comm_setup_di = {};
	fen.comm_setup_di[receiver] = keys;

	if (is_setup_commissions_complete()) {
		for (const plname of plorder) {
			let pl = fen.players[plname];
			assertion(isdef(fen.comm_setup_di[plname]), 'no commission setup for ' + plname);
			pl.commissions = pl.commissions.concat(fen.comm_setup_di[plname]);
		}
		delete fen.comm_setup_di;
		delete fen.comm_setup_num;

		ari_history_list([`commission trading ends`], 'commissions');

		if (exp_rumors) {
			[Z.stage, Z.turn] = [24, [plorder[0]]];
			ari_history_list([`gossiping starts`], 'rumors');

		} else { [Z.stage, Z.turn] = set_journey_or_stall_stage(fen, Z.options, fen.phase); }

	} else if (next == plorder[0]) {
		//next commission round starts
		for (const plname of plorder) {
			let pl = fen.players[plname];
			assertion(isdef(fen.comm_setup_di[plname]), 'no commission setup for ' + plname);
			pl.commissions = pl.commissions.concat(fen.comm_setup_di[plname]);
		}
		fen.comm_setup_num -= 1;
		Z.turn = [plorder[0]]
	} else {
		Z.turn = [next];
	}
	take_turn_fen();

}

function is_commission_stage_complete(fen) {

	//comm stage 3 is complete when comm_setup_di hat entry fuer alle players in plorder
	for (const plname of fen.plorder) {
		if (!isdef(fen.comm_setup_di[plname])) return false;
	}
	return true;


}

function ui_game_menu_item(g, g_tables = []) {
	function runderkreis(color, id) {
		return `<div id=${id} style='width:20px;height:20px;border-radius:50%;background-color:${color};color:white;position:absolute;left:0px;top:0px;'>` + '' + "</div>";
	}
	let [sym, bg, color, id] = [Syms[g.logo], g.color, null, getUID()];
	if (!isEmpty(g_tables)) {
		let t = g_tables[0]; //most recent table of that game
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

function show_games(ms = 500) {

	let dParent = mBy('dGames');
	mClear(dParent);
	mText(`<h2>start new game</h2>`, dParent, { maleft: 12 });

	let html = `<div id='game_menu' style="color:white;text-align: center; animation: appear 1s ease both">`;
	let gamelist = 'a_game aristo bluff spotit ferro fritz';
	for (const g of dict2list(Config.games)) { if (gamelist.includes(g.id)) html += ui_game_menu_item(g); }
	mAppend(dParent, mCreateFrom(html));
	//mCenterCenterFlex(mBy('game_menu'));
	mFlexWrap(mBy('game_menu'));

	//mRise(dParent, ms);
}

function ui_game_menu_item(g, g_tables = []) {
	function runderkreis(color, id) {
		return `<div id=${id} style='width:20px;height:20px;border-radius:50%;background-color:${color};color:white;position:absolute;left:0px;top:0px;'>` + '' + "</div>";
	}
	let [sym, bg, color, id] = [Syms[g.logo], g.color, null, getUID()];
	if (!isEmpty(g_tables)) {
		let t = g_tables[0]; //most recent table of that game
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

function show_polling_signal() {

	let url = window.location.href;
	//console.log('url', url, typeof(url));
	let loc = url.includes('telecave') ? 'tele' : 'local';
	document.title = `${loc}:${DA.pollCounter} ${Config.games[Z.game].friendly}`;


	// let d1 = mDiv(mBy('dAdmin'), { position: 'fixed', top: 10, left: 73, width: 20, height: 20, bg: valf(DA.reloadColor, 'green'), rounding: 10 });
	// mFadeRemove(d1, 1000);
}

function gamestep() {

	show_admin_ui();

	DA.running = true; clear_screen();
	dTable = mBy('dTable'); mFall(dTable); mClass('dTexture', 'wood');

	shield_off();
	show_title();
	show_role();
	Z.func.present(Z, dTable, Z.uplayer);	// *** Z.uname und Z.uplayer ist IMMER da! ***

	//console.log('_____uname:'+Z.uname,'role:'+Z.role,'player:'+Z.uplayer,'host:'+Z.host,'curplayer:'+Z.turn[0],'bot?',is_current_player_bot()?'YES':'no');
	if (isdef(Z.scoring.winners)) { show_winners(); }
	else if (Z.func.check_gameover(Z)) {
		let winners = show_winners();
		Z.scoring = { winners: winners }
		sendgameover(winners[0], Z.friendly, Z.fen, Z.scoring);
	} else if (is_shield_mode()) {
		if (!DA.no_shield == true) { hide('bRestartMove'); shield_on(); } //mShield(dTable.firstChild.childNodes[1])} //if (isdef(Z.fen.shield)) mShield(dTable);  }
		autopoll();
	} else {
		Z.A = { level: 0, di: {}, ll: [], items: [], selected: [], tree: null, breadcrumbs: [], sib: [], command: null, autosubmit: Config.autosubmit };
		copyKeys(jsCopy(Z.fen), Z);
		copyKeys(UI, Z);
		activate_ui(Z); //console.log('uiActivated',uiActivated?'true':'false');
		Z.func.activate_ui();
		//if (Z.options.zen_mode != 'yes' && Z.mode != 'hotseat' && !DA.simulate) autopoll();
		if (Z.options.zen_mode != 'yes' && Z.mode != 'hotseat' && Z.fen.keeppolling) autopoll();
		//  (Z.turn.length > 1 || Z.stage == 'can_resolve' && get_multi_trigger() != 'mimi' || Z.game == 'bluff')) autopoll();
		//  (Z.turn.length > 1 || Z.stage == 'can_resolve' || Z.game == 'bluff' && Z.stage == 1)) autopoll();

		//let favicon = document.querySelector('[rel=icon]'); favicon.href = "../base/assets/images/icons/yourturn.gif";

	}

	//landing();

}

//#region comm pass trial 1
function ari_transfer_commission_cards_to_di() {
	let [fen, A, uplayer, plorder] = [Z.fen, Z.A, Z.uplayer, Z.plorder];

	//console.log('we are in stage ' + Z.stage);

	let items = A.selected.map(x => A.items[x]);
	let next = get_next_player(Z, uplayer);
	let receiver = next;
	let giver = uplayer;
	let keys = items.map(x => x.key);
	fen.players[giver].commissions = arrMinus(fen.players[giver].commissions, keys);
	if (nundef(fen.comm_setup_di)) fen.comm_setup_di = {};
	fen.comm_setup_di[receiver] = keys;
}
function process_comm_setup() {

	let [fen, A, uplayer, plorder] = [Z.fen, Z.A, Z.uplayer, Z.plorder];

	//console.log('we are in stage ' + Z.stage);

	ari_transfer_commission_cards_to_di();

	if (is_commission_stage_complete(fen)) {
		//transfer cards from di to each player's commision cards
		for (const plname of plorder) {
			if (isdef(fen.comm_setup_di[plname])) {
				fen.players[plname].commissions = arrPlus(fen.players[plname].commissions, fen.comm_setup_di[plname]);
			}
		}

		// 
	}
}
function old_process_comm_setup() {
	if (is_setup_commissions_complete()) {
		for (const plname of plorder) {
			let pl = fen.players[plname];
			assertion(isdef(fen.comm_setup_di[plname]), 'no commission setup for ' + plname);
			pl.commissions = pl.commissions.concat(fen.comm_setup_di[plname]);
		}
		delete fen.comm_setup_di;
		delete fen.comm_setup_num;

		ari_history_list([`commission trading ends`], 'commissions');

		if (exp_rumors) {
			[Z.stage, Z.turn] = [24, [plorder[0]]];
			ari_history_list([`gossiping starts`], 'rumors');

		} else { [Z.stage, Z.turn] = set_journey_or_stall_stage(fen, Z.options, fen.phase); }

	} else if (next == plorder[0]) {
		//next commission round starts
		for (const plname of plorder) {
			let pl = fen.players[plname];
			assertion(isdef(fen.comm_setup_di[plname]), 'no commission setup for ' + plname);
			pl.commissions = pl.commissions.concat(fen.comm_setup_di[plname]);
		}
		fen.comm_setup_num -= 1;
		Z.turn = [plorder[0]]
	} else {
		Z.turn = [next];
	}
	take_turn_fen();

}





//#region ack::: rem cons nach bluff check!!!!!!!!!!!!!
function start_simple_ack_round(ackstage, ack_players, nextplayer, callbackname_after_ack, keeppolling = false) {

	let fen = Z.fen;
	//each player except uplayer will get opportunity to buy top discard - nextplayer will draw if passing
	fen.ack_players = ack_players;
	fen.lastplayer = arrLast(ack_players);
	fen.nextplayer = nextplayer; //next player after ack!
	fen.turn_after_ack = [nextplayer];
	fen.callbackname_after_ack = callbackname_after_ack;
	fen.keeppolling = keeppolling;

	Z.stage = ackstage;
	Z.turn = [ack_players[0]];

}
function ack_player(plname) {
	let [fen, uplayer, pl] = [Z.fen, Z.uplayer, Z.fen.players[Z.uplayer]];

	//console.log('ack_player','plname',plname,'uplayer',uplayer,'pl',pl,'Z.turn',Z.turn,'Z.stage',Z.stage);
	assertion(sameList(Z.turn, [plname]), "ack_player: wrong turn");

	if (plname == fen.lastplayer || fen.players[uplayer].buy == true) {
		let func = window[fen.callbackname_after_ack];
		if (isdef(func)) func();
	} else {
		Z.turn = [get_next_in_list(plname, fen.ack_players)];
	}
	//console.log('ack_player','plname',plname,'uplayer',uplayer,'pl',pl,'Z.turn',Z.turn,'Z.stage',Z.stage);
	take_turn_fen();
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
//#endregion


function bluff_ack_uplayer() {
	let [A, fen, stage, uplayer] = [Z.A, Z.fen, Z.stage, Z.uplayer];
	fen.players[uplayer].ack = true;
	//DA.ack[uplayer] = true;
	ack_player(uplayer);
}

function new_cards_animation(n = 2) {
	let [stage, A, fen, plorder, uplayer, deck] = [Z.stage, Z.A, Z.fen, Z.plorder, Z.uplayer, Z.deck];
	let pl = fen.players[uplayer];
	if (stage == 'card_selection' && !isEmpty(Clientdata.newcards)) {
		let anim_elems = [];
		for (const key of Clientdata.newcards) {
			let ui = lastCond(UI.players[uplayer].hand.items, x => x.key == key);
			ui = iDiv(ui);
			anim_elems.push(ui);
		}
		delete Clientdata.newcards;
		anim_elems.map(x => mPulse(x, n * 1000));
	}
}

function new_cards_animation(n = 2) {
	let [stage, A, fen, plorder, uplayer, deck] = [Z.stage, Z.A, Z.fen, Z.plorder, Z.uplayer, Z.deck];
	let pl = fen.players[uplayer];
	if (stage == 'card_selection' && !isEmpty(pl.newcards)) {
		let anim_elems = [];

		//console.log('player', uplayer, 'newcards', jsCopy(pl.newcards));
		for (const key of pl.newcards) {
			let ui = lastCond(UI.players[uplayer].hand.items, x => x.key == key);
			ui = iDiv(ui);
			anim_elems.push(ui);
		}
		delete pl.newcards;
		//console.log('player', uplayer, 'newcards deleted:', pl.newcards);

		//animate newcards!
		anim_elems.map(x => mPulse(x, n * 1000));
		// setTimeout(ferro_pre_action,1000);
	}
}

function turn_send_move_update(action_star = false) {
	take_turn_fen();
}


//#region ferro multi zeug!

function ferro_start_buy_or_pass() {

	let fen = Z.fen;
	//fen.canbuy =, fen.trigger, fen.buyer, fen.nextturn (und playerdata natuerlich!)
	//each player except uplayer will get opportunity to buy top discard - nextplayer will draw if passing
	fen.ack_players = ack_players;
	fen.lastplayer = arrLast(ack_players);
	fen.nextplayer = nextplayer; //next player after ack!
	fen.turn_after_ack = [nextplayer];
	fen.callbackname_after_ack = callbackname_after_ack;
	fen.keeppolling = keeppolling;

	Z.stage = ackstage;
	Z.turn = [ack_players[0]];

}
function ferro_simple_ack_player(plname) {
	let [fen, uplayer, pl] = [Z.fen, Z.uplayer, Z.fen.players[Z.uplayer]];

	//console.log('ack_player','plname',plname,'uplayer',uplayer,'pl',pl,'Z.turn',Z.turn,'Z.stage',Z.stage);
	assertion(sameList(Z.turn, [plname]), "ack_player: wrong turn");

	if (plname == fen.lastplayer || fen.players[uplayer].buy == true) {
		let func = window[fen.callbackname_after_ack];
		if (isdef(func)) func();
	} else {
		Z.turn = [get_next_in_list(plname, fen.ack_players)];
	}
	//console.log('ack_player','plname',plname,'uplayer',uplayer,'pl',pl,'Z.turn',Z.turn,'Z.stage',Z.stage);
	take_turn_fen();
}
function ferro_clear_ack_variables() {
	let [fen, uplayer, pl] = [Z.fen, Z.uplayer, Z.fen.players[Z.uplayer]];
	delete fen.ack_players;
	delete fen.lastplayer;
	delete fen.nextplayer;
	delete fen.turn_after_ack;
	delete fen.ackstage;
	delete fen.callbackname_after_ack;
	delete fen.keeppolling;

}





function take_turn_lock_multi() { take_turn(true, false, true, 'lock'); }
function take_turn_end_multi() { take_turn(true, false, true); }



//#region take_turn old mit notes...

function take_turn_single() { take_turn(); }

function take_turn_spotit() { take_turn(true, true); }

function take_turn_init_multi(endcond = 'turn') { take_turn(true, false, false, `indiv_${endcond}`, true); }

function take_turn_lock_multi() { take_turn(true, false, true, 'lock'); }

function take_turn_multi_plus_lock() { take_turn(true, true, false, 'lock'); }

function take_turn_end_multi() { take_turn(true, false, false, '', true); }

function take_turn_multi() { if (isdef(Z.state)) take_turn(false, true); else take_turn(false, false, true); }


function take_turn(write_fen = true, write_player = false, read_players = false, write_notes = null, clear_players = false) {
	prep_move();
	let o = { uname: Z.uplayer, friendly: Z.friendly };
	if (isdef(Z.fen)) o.fen = Z.fen;
	if (write_fen) o.write_fen = true;
	if (isdef(write_notes)) { o.write_notes = write_notes; } //console.log('JA');}
	if (write_player) { o.write_player = true; o.state = Z.state; }
	if (read_players) o.read_players = true;
	if (clear_players) o.clear_players = true;

	//console.log('sending', o);
	let cmd = 'table';
	send_or_sim(o, cmd);
}

function prep_move() {
	let [fen, uplayer, pl] = [Z.fen, Z.uplayer, Z.pl];
	for (const k of ['round', 'phase', 'stage', 'step', 'turn']) { fen[k] = Z[k]; }
	deactivate_ui();
	clear_timeouts();
}
function send_or_sim(o, cmd) {
	Counter.server += 1;
	if (nundef(Z) || is_multi_stage()) o.read_players = true;
	if (DA.simulate) phpPostSimulate(o, cmd); else phpPost(o, cmd);
}

//#endregion

function sendmove(plname, friendly, fen, action, expected, phase, round, step, stage, notes, scoring = {}) {
	deactivate_ui();
	clear_timeouts();

	let o = { uname: plname, friendly: friendly, fen: fen, action: action, expected: expected, phase: phase, round: round, step: step, stage: stage, notes: notes, scoring: scoring };
	//console.log('sendmove: turn',fen.turn)

	//console.log(`sendmove: simulated: ${DA.simulate}`);
	if (DA.simulate) phpPostSimulate(o, 'move'); else phpPost(o, 'move');
}

function turn_send_move_update(action_star = false) {
	take_turn_single(); return;
	let [fen, uplayer] = [Z.fen, Z.uplayer];	//console.log('sending move:Z',Z); //return;

	//console.log('uplayer', uplayer, 'action_star', action_star);

	[fen.stage, fen.phase, fen.turn] = [Z.stage, Z.phase, Z.turn];

	//ACHTUNG!!!!
	assertion(!isEmpty(fen.turn), 'ACHTUNG!!!!!!!!!!! TURN IST EMPTY in take_turn_single!!!!!!!!!!!!!', Z.turn);
	//if (isEmpty(fen.turn)) { fen.turn = Z.turn = [Z.host]; console.log('SETTING HOST TURN BECAUSE TURN EMPTY AT SEND!!!!!!!') }

	let action = action_star ? { stage: '*', step: '*' } : Z.expected[uplayer];
	let expected = {}; fen.turn.map(x => expected[x] = { stage: fen.stage, step: Z.step });
	//console.log(':::take_turn_single: action', action, 'expected', expected, 'Z.step', Z.step, 'Z.turn', Z.turn);

	//console.log('in',getFunctionsNameThatCalledThisFunction(),'fen.turn', fen.turn);
	sendmove(Z.uplayer, Z.friendly, Z.fen, action, expected, Z.phase, Z.round, Z.step, Z.stage, Z.notes, Z.scoring);
}


function spotit_clear_score() {
	assertion(isdef(Z.notes), 'Z.notes not defined');
	Z.notes = {};
	//ensure_score();
	//for (const plname in Z.fen.players) { Z.notes[plname].score = 0; }
}
function _spotit_move(uplayer, success) {
	//console.log('g',g,'uname',uname,'success',success)
	if (success) {
		//console.log('success!',jsCopy(g.expected));
		inc_player_score(uplayer);
		Z.action = { stage: 'move', step: Z.options.zen_mode == 'yes' ? '*' : Z.step };
		for (const plname in Z.expected) { Z.expected[plname].step += 1 }
		Z.step += 1; Z.round += 1;
		//console.log('sending',jsCopy(g.expected));
		Z.fen.items = spotit_item_fen(Z.options);
		//Clientdata.iwin = true;
		sendmove(uplayer, Z.friendly, Z.fen, Z.action, Z.expected, Z.phase, Z.round, Z.step, Z.stage, Z.notes)
	} else {
		let d = mShield(dTable, { bg: '#000000aa', fg: 'red', fz: 60, align: 'center' });
		d.innerHTML = 'NOPE!!! try again!';
		TO.spotit_penalty = setTimeout(() => d.remove(), 2000);
	}
}


function ferro_ack_uplayer_lean() {
	let [A, uplayer] = [Z.A, Z.uplayer];
	stopPolling();
	let o_pldata = Z.playerdata.find(x => x.name == uplayer);
	Z.state = o_pldata.state = { buy: !isEmpty(A.selected) && A.selected[0] == 0 };
	let can_resolve = ferro_check_resolve();
	if (can_resolve) {
		assertion(Z.stage == 'buy_or_pass', 'stage is not buy_or_pass when checking can_resolve!');
		Z.stage = 'can_resolve';
		[Z.turn, Z.stage] = [[get_multi_trigger()], 'can_resolve'];
		take_turn_multi_plus_lock();
	} else { take_turn_multi(); }
}

function ferro_ack_uplayer() {
	let [A, fen, stage, uplayer] = [Z.A, Z.fen, Z.stage, Z.uplayer];
	//console.log('A.selected', A.selected)

	stopPolling();

	// update Z.playerstate (fuer resolve check!) and set Z.state
	let o_pldata = Z.playerdata.find(x => x.name == uplayer);
	Z.state = o_pldata.state = { buy: !isEmpty(A.selected) && A.selected[0] == 0 };

	//console.log('====>ack_player:playerdata', Z.playerdata);

	//NEIN!FORCE_REDRAW = true; //brauch ich damit ui fuer diesen player weggeht

	//console.log('<===write_player', uplayer, Z.state);

	//hier muss ich checken ob eh schon genug info habe fuer can_resolve!
	let can_resolve = ferro_check_resolve();
	//console.log('===>can_resolve', can_resolve);
	if (can_resolve) {
		assertion(Z.stage == 'buy_or_pass', 'stage is not buy_or_pass when checking can_resolve!');
		//console.log('====>buyer found!', fen.buyer);
		Z.stage = 'can_resolve';
		[Z.turn, Z.stage] = [[get_multi_trigger()], 'can_resolve'];
		take_turn_multi_plus_lock();
	} else {
		// if (Z.mode == 'hotseat') {
		// 	let next = get_next_in_list(fen.canbuy, uplayer);
		// 	assertion(next != fen.canbuy[0], 'sollte schon laengst can_resolve sein!!!!!!!!!!!!!!!!!')
		// 	Z.turn = [next];
		// }
		take_turn_multi();
	}
	//Z.func.state_info(mBy('dTitleLeft')); //rem cons
}


function handle_result(result, cmd) {

	//if (cmd == 'table') {console.log('result', result); } //return;}

	if (verbose) console.log('cmd', cmd, '\nresult', result); //return;
	if (result.trim() == "") return;
	let obj;
	try { obj = JSON.parse(result); } catch { console.log('ERROR:', result); }

	if (verbose) console.log('HANDLERESULT bekommt', jsCopy(obj));
	processServerdata(obj, cmd);

	// console.log('obj.fen', obj.fen,'obj.turn', obj.turn, 'obj.a', obj.a, 'obj.b', obj.b);
	//console.log('obj.fen', obj.fen,'obj.turn', obj.turn, 'obj.a', obj.a, 'obj.b', obj.b);

	switch (cmd) {
		case "assets": load_assets(obj); start_with_assets(); break;
		case "users": show_users(); break;
		case "tables": show_tables(); break;
		case "delete_table":
		case "delete_tables": show_tables(); break;
		//************************* table *************************** */
		case "gameover":
		//case "clear":
		case "table":
		case "startgame":
			update_table();

			//console.log('===>turn', Z.turn);
			// console.log(`_________ ${Counter.server} apiserver cmd`,cmd,Z.turn);
			// console.log('<===request', obj.status);
			// console.log('===>stage', Z.stage);
			// console.log('===>notes', Z.notes);
			// console.log('===>fen.multi', Z.fen.multi); //return;
			// console.log('===>playerdata', Z.playerdata); //return;

			//handle multi stage
			if (is_multi_stage()) {
				//check if is already in can_resolve stage
				if (Z.stage == 'can_resolve') {
					//trigger soll jetzt mal manually ACK clicken
					//console.log('triggering manual ACK to resolve');
					if (is_multi_trigger(Z.uplayer)) {
						//for now do NOT goto gamestep but just show Clear Ack button
						show('bClearAck');
						Z.func.state_info(mBy('dTitleLeft'));
						return;
					}
				}

				assertion(Z.stage != 'can_resolve', "WTF!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");	//I am NOT in can_resolve stage yet!!!!

				//check if can be resolved
				let can_resolve = Z.func.check_resolve();
				if (can_resolve) {
					[Z.turn, Z.stage] = [[get_multi_trigger()], 'can_resolve'];
					Z.func.state_info(mBy('dTitleLeft'));
					take_turn_lock_multi();
					//return;
				} else if (is_multi_trigger()) {
					//update turn to only those players with empty playerdata
				}
			}

			if (Z.skip_presentation) { Z.func.state_info(mBy('dTitleLeft')); autopoll(); return; }
			console.log('===>turn', Z.turn);
			clear_timeouts();
			gamestep();
			break;

	}
}

// ferro vor change of clear_ack
function clear_ack() {
	if (Z.stage == 'buy_or_pass') {
		//ferro_change_to_turn_round();
		if (isList(Z.playerdata) && lookup(Z.fen, ['multi', 'trigger']) == Z.uplayer) ferro_force_resolve(true);
		else {
			ferro_change_to_card_selection();
			prep_move();
			let o = { uname: Z.uplayer, friendly: Z.friendly, fen: Z.fen, write_fen: true, write_notes: '' };
			let cmd = 'table';
			send_or_sim(o, cmd);

		}
	}
	else if (Z.stage == 'round_end') start_new_round_ferro();
}

function ferro() {
	function clear_ack() {
		if (Z.stage == 'buy_or_pass') {
			//ferro_change_to_turn_round();
			if (isList(Z.playerdata) && lookup(Z.fen, ['multi', 'trigger']) == Z.uplayer) ferro_force_resolve(true);
			else {
				ferro_change_to_card_selection();
				prep_move();
				let o = { uname: Z.uplayer, friendly: Z.friendly, fen: Z.fen, write_fen: true, write_notes: '' };
				let cmd = 'table';
				send_or_sim(o, cmd);

			}
		}
		else if (Z.stage == 'round_end') start_new_round_ferro();
	}
	function state_info(dParent) { ferro_state_new(dParent); }
	function setup(players, options) {
		let fen = { players: {}, plorder: jsCopy(players), history: [] };

		//calc how many decks are needed (basically 1 suit per person, plus 1 for the deck)
		let n = players.length;
		let num_decks = fen.num_decks = 2 + (n >= 9 ? 2 : n >= 7 ? 1 : 0); // 2 + (n > 5 ? Math.ceil((n - 5) / 2) : 0); //<=5?2:Math.max(2,Math.ceil(players.length/3));
		//console.log('num_decks', num_decks);
		let deck = fen.deck = create_fen_deck('n', num_decks, 4 * num_decks);
		let deck_discard = fen.deck_discard = [];
		shuffle(deck);
		if (DA.TEST0 != true) shuffle(fen.plorder);
		let starter = fen.plorder[0];
		//console.log('options', options);
		let handsize = valf(Number(options.handsize), 11);
		for (const plname of players) {
			let pl = fen.players[plname] = {
				hand: deck_deal(deck, plname == starter ? handsize + 1 : handsize),
				journeys: [],
				coins: 10,
				vps: 0,
				score: 0,
				name: plname,
				color: get_user_color(plname),
			};
			pl.goals = { 3: 0, 33: 0, 4: 0, 44: 0, 5: 0, 55: 0, '7R': 0 };

			if (plname == starter) {
				pl.hand = ['AHn', 'AHn', 'AHn', 'AHn'];
			}
			//for(const goal of Config.games.ferro.options.goals) pl.goals[goal]=0;
		}
		fen.phase = ''; //TODO: king !!!!!!!
		[fen.stage, fen.turn] = ['card_selection', [starter]];
		return fen;
	}
	function present(z, dParent, uplayer) { ferro_present_new(z, dParent, uplayer); }
	function present_player(g, plname, d, ishidden = false) { ferro_present_player_new(g, plname, d, ishidden = false) }
	function check_gameover() { return isdef(Z.fen.winners) ? Z.fen.winners : false; }
	function stats(Z, dParent) { ferro_stats_new(dParent); }
	function activate_ui() { ferro_activate_ui(); }
	function check_resolve() { return ferro_check_resolve(); }
	function resolve() { ferro_resolve(); }
	return { check_resolve, resolve, clear_ack, state_info, setup, present, present_player, check_gameover, stats, activate_ui };
}

function playerstate_check() {
	//returns true if automessage has been sent by trigger
	//this function sends a write_fen message and return true if playerdata can be resolved!
	//otherwise returns false (will result in Z.skip_presentation if not resolve)

	//is this a turn that collects individual playerdata?
	//how to handle spotit this time?
	let trigger = lookup(Z, ['fen', 'multi', 'trigger']);
	if (!trigger) return false;
	let [uplayer, fen, stage, pldata] = [Z.uplayer, Z.fen, Z.stage, Z.playerdata];

	//case1: stage != can_resolve
	if (stage != 'can_resolve') {
		let can_resolve = Z.func.check_resolve();
		if (can_resolve) {
			[Z.turn, Z.stage] = [[trigger], 'can_resolve'];
			take_turn_lock_multi();
			return true;
		} else return false;
	} else if (uplayer == trigger) {
		//case2: uplayer == trigger
		//das ist der der resolven koennte! NUR trigger kann fen aendern!!!!!!
		//es wird resolved!
		Z.func.resolve();
		// console.log('buy process done ... resolving');
		// ferro_change_to_card_selection(); //das soll durch resolve ersetzt werden
		// prep_move();
		// let o = { uname: Z.uplayer, friendly: Z.friendly, fen: Z.fen, write_fen: true, write_notes: '' };
		// let cmd = 'table';
		// send_or_sim(o, cmd);

		return true;
	} else return false;

}


//#region ferro last version vor standard take_turn!
function ferro_change_to_buy_pass() {
	let [plorder, stage, A, fen, uplayer] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer];
	let nextplayer = get_next_player(Z, uplayer); //player after buy_or_pass round

	//newturn is list of players starting with nextplayer
	let newturn = jsCopy(plorder); while (newturn[0] != nextplayer) { newturn = arrCycle(newturn, 1); } //console.log('newturn', newturn);
	let buyerlist = fen.canbuy = []; //fen.canbuy list ist angeordnet nach reihenfolge der frage
	for (const plname of newturn) {
		let pl = fen.players[plname];
		if (plname != uplayer && pl.coins > 0) { pl.buy = false; buyerlist.push(plname); }
		//if (plname == uplayer) { pl.buy = false; buyerlist.push(plname); } else if (pl.coins > 0) { pl.buy = false; buyerlist.push(plname); }
	}


	fen.multi = {
		//turn: buyerlist,
		//stage: 'buy_or_pass',
		trigger: uplayer,  //Z.host, //uplayer, host geht nicht weil der ja dann nicht buy or pass kann!!!
		endcond: 'turn',
		turn_after_ack: [nextplayer],
		callbackname_after_ack: 'ferro_change_to_card_selection',
		next_stage: 'card_selection',

	};
	[Z.stage, Z.turn] = ['buy_or_pass', buyerlist];
	console.log('sending turn', Z.turn);
	//take_turn_init_multi('turn');
	prep_move();
	let o = { uname: Z.uplayer, friendly: Z.friendly, clear_players: buyerlist, write_notes: 'indiv_turn', fen: Z.fen, write_fen: true };
	//console.log('sending to server', o);
	let cmd = 'table';
	send_or_sim(o, cmd);

	//log_object(fen, 'buyers', 'nextplayer canbuy');

	//start_indiv_ack_round('buy_or_pass', buyerlist, nextplayer, 'ferro_change_to_turn_round');

}
function ferro_ack_uplayer() {
	let [A, fen, stage, uplayer] = [Z.A, Z.fen, Z.stage, Z.uplayer];
	//console.log('A.selected', A.selected)
	Z.state = { buy: !isEmpty(A.selected) && A.selected[0] == 0 };
	//Z.state = Clientdata.playerstate = { buy: !isEmpty(A.selected) && A.selected[0] == 0 };
	//Clientdata._playerdata_set = true;
	FORCE_REDRAW = true;

	console.log('<===write_player', uplayer, Z.state)
	prep_move();
	let o = { uname: Z.uplayer, friendly: Z.friendly, fen: Z.fen, state: Z.state, write_player: true };
	let cmd = 'table';
	send_or_sim(o, cmd);
}
function ferro_change_to_card_selection() {
	//console.log('ferro_change_to_turn_round_', getFunctionsNameThatCalledThisFunction()); 
	let [z, fen, stage, uplayer, ui] = [Z, Z.fen, Z.stage, Z.uplayer, UI];
	assertion(stage != 'card_selection', "ALREADY IN TURN ROUND!!!!!!!!!!!!!!!!!!!!!!");

	for (const plname of fen.canbuy) {
		let pl = fen.players[plname];
		if (pl.buy == true) {
			let card = fen.deck_discard.shift();
			pl.hand.push(card);
			deck_deal_safe_ferro(fen, plname, 1);
			pl.coins -= 1; //pay
			ari_history_list([`${plname} bought ${card}`], 'buy');
			break;
		}
	}
	let nextplayer = fen.multi.turn_after_ack[0];
	deck_deal_safe_ferro(fen, nextplayer, 1); //nextplayer draws

	//console.log('multi',fen.multi);
	Z.turn = fen.multi.turn_after_ack;
	Z.stage = 'card_selection';

	clear_ack_variables();
	delete fen.multi;

	for (const k of ['canbuy']) delete fen[k];
	for (const plname of fen.plorder) { delete fen.players[plname].buy; }
	clear_transaction();
}
function ferro_check_resolve() {
	let [pldata, stage, A, fen, plorder, uplayer, deck, turn] = [Z.playerdata, Z.stage, Z.A, Z.fen, Z.plorder, Z.uplayer, Z.deck, Z.turn];
	let pl = fen.players[uplayer];

	if (stage != 'buy_or_pass') return false;
	for (const plname of turn) {
		let data = firstCond(pldata, x => x.name == plname);
		assertion(isdef(data), 'no pldata for', plname);
		let state = data.state;

		console.log('state', plname, state);
		if (isEmpty(state)) done = false;
		else if (state.buy == true) buyer = plname;
		else continue;

		break;
	}
	return done;
}
function ferro_resolve() {
	console.log('buy process done, buyer', buyer);
	ferro_change_to_card_selection();
	prep_move();
	let o = { uname: Z.uplayer, friendly: Z.friendly, fen: Z.fen, write_fen: true, write_notes: '' };
	let cmd = 'table';
	send_or_sim(o, cmd);
}
//#endregion ===========================

function take_turn_spotit() {
	prep_move();
	let o = { uname: Z.uplayer, friendly: Z.friendly, fen: Z.fen, state: Z.state, write_player: true, write_fen: true };
	let cmd = 'table';
	send_or_sim(o, cmd);
}

function query_status() {
	prep_move();
	let o = { uname: Z.uname, friendly: Z.friendly };
	let cmd = 'collect_status';
	send_or_sim(o, cmd);
}

function trigger_check_is_sending(trigger) {
	//this function seends a write_fen message and return true if playerdata can be resolved!
	//otherwise returns false (will result in Z.skip_presentation if not resolve)

	if (!trigger) return false;
	let [uplayer, fen, stage, pldata] = [Z.uplayer, Z.fen, Z.stage, Z.playerdata];

	//case1: stage != can_resolve
	if (stage != 'can_resolve') {
		let can_resolve = Z.func.check_resolve();
		if (can_resolve) {
			[Z.turn, Z.stage] = [[trigger], 'can_resolve'];
			prep_move();
			let o = { uname: Z.uplayer, friendly: Z.friendly, fen: Z.fen, write_fen: true, write_notes: 'lock' };
			let cmd = 'table';
			send_or_sim(o, cmd);

			return true;
		} else return false;
	} else if (uplayer == trigger) {
		//case2: uplayer == trigger
		//das ist der der resolven koennte! NUR trigger kann fen aendern!!!!!!
		//es wird resolved!
		Z.func.resolve();
		// console.log('buy process done ... resolving');
		// ferro_change_to_card_selection(); //das soll durch resolve ersetzt werden
		// prep_move();
		// let o = { uname: Z.uplayer, friendly: Z.friendly, fen: Z.fen, write_fen: true, write_notes: '' };
		// let cmd = 'table';
		// send_or_sim(o, cmd);

		return true;
	} else return false;

}

function check_collect(obj) {
	//erwarte dass obj ein collect_complete und ein too_late hat!
	//console.log('notes', Z.notes)
	if (nundef(obj.collect_complete)) return false;
	if (Z.mode != 'multi') { console.log('COLLECT NUR IN MULTI PLAYER MODE!!!!!!'); return false; }
	if (!startsWith(Z.notes, 'indiv') && Z.notes != 'lock') { return false; } //console.log('!!!notes is NOT indiv or lock'); return false; }
	assertion(isdef(obj.playerdata), 'no playerdata but collect_complete');

	let collect_complete = obj.collect_complete;
	let too_late = obj.too_late;
	//console.log('notes', Z.notes)
	//console.log('collect_open', collect_complete, 'too_late', too_late);

	if (i_am_acting_host() && collect_complete) {

		//console.log('collect_open: i am host, collect_complete, was nun???');
		assertion(obj.table.fen.turn.length == 1 && obj.table.fen.turn[0] == U.name && U.name == obj.table.fen.acting_host, 'collect_open: acting host is NOT the one in turn!');
		assertion(isdef(Z.func.post_collect), 'post_collect not defined for game ' + obj.table.game);

		//Z.playerdata = obj.playerdata;
		//console.log('playerdata vorher', Z.playerdata);
		if (Z.fen.end_cond == 'all') for (const p of Z.playerdata) { p.state = JSON.parse(p.state); }
		else if (Z.fen.end_cond == 'first') {
			for (const p of Z.playerdata) {
				if (isdef(p.state)) {
					p.state = JSON.parse(p.state);
					//console.log('*** winning player is', p.name, p.state);
				}

			}
			//console.log('playerdata nachher', Z.playerdata);
		}
		Z.func.post_collect();


	} else if (collect_complete && (Z.turn.length > 1 || Z.turn[0] != Z.fen.acting_host)) {
		Z.turn = [Z.fen.acting_host];
		take_turn_single();
		//console.log('collect_open: collect_complete, bin aber nicht der host! was nun???');

	} else if (i_am_acting_host()) {
		//console.log('collect_open: i am host, bin aber nicht collect_complete, was nun???');
		//autopoll();
		return false;

	} else {
		//console.log('collect_open: bin nicht der host, bin nicht collect_complete, was nun???');
		//autopoll();
		return false;

	}
	return true;

}

function MUELL() {
	if (Z.stage == 'can_resolve') {
		assertion(trigger, 'no trigger and can_resolve!!!');
	}

	//first check if resolve condition is met!
	let resolve = Z.func.check_resolve();

	if (Z.stage == 'can_resolve' && uplayer == trigger) {
		//das ist der der resolven koennte! NUR trigger kann fen aendern!!!!!!
		//es wird resolved!
	} else if (resolve) {
		[Z.turn, Z.stage] = [[trigger], 'can_resolve'];

	} else return false;

	//das ist nur prototyping!!!!!!!!!!!!!!!!!
	if (Z.game == 'ferro' && Z.stage == 'buy_or_pass') {
		let [pldata, multi, turn, done, buyer] = [Z.playerdata, Z.fen.multi, Z.turn, true, null];
		console.log(':::trigger check!', turn);
		//console.log('..............pldata', pldata);

		for (const plname of turn) {
			let data = firstCond(Z.playerdata, x => x.name == plname);
			assertion(isdef(data), 'no pldata for', plname);
			let state = data.state;

			console.log('state', plname, state);
			if (isEmpty(state)) done = false;
			else if (state.buy == true) buyer = plname;
			else continue;

			break;
		}
		if (done) {
			console.log('buy process done, buyer', buyer);
			ferro_change_to_card_selection();
			prep_move();
			let o = { uname: Z.uplayer, friendly: Z.friendly, fen: Z.fen, write_fen: true, write_notes: '' };
			let cmd = 'table';
			send_or_sim(o, cmd);

			return true;
		}
	}
	return false;

}

function ferro_force_resolve(by_ack_button = false) {
	assertion(isdef(Z.playerdata) || by_ack_button, 'no playerdata in force_resolve by trigger!!!!');
	// for(const data of Z.playerdata){
	// 	let pl = fen.players[data.name];
	// 	if (isEmpty(data.state)) pl.buy = false; else	pl.buy = data.state.buy;
	// }
	ferro_call_resolve();

}
function ferro_call_resolve() {
	//expects a function fen.multi.callbackname_after_ack

	assertion(Z.stage == 'buy_or_pass', 'no buy_or_pass in call_resolve');

	let [fen, stage, uplayer] = [Z.fen, Z.stage, Z.uplayer];
	let callbackname = fen.multi.callbackname_after_ack;
	// console.log('===>RESOLVE',Z.uplayer); 
	// console.log('fen.multi', fen.multi); //return;

	for (const data of Z.playerdata) {
		let pl = fen.players[data.name];
		if (isEmpty(data.state)) pl.buy = false; else pl.buy = data.state.buy;
	}

	if (isdef(callbackname)) {
		let f = window[callbackname];
		if (isdef(f)) {
			f();
		}
	}
	prep_move();
	let o = { uname: Z.uplayer, friendly: Z.friendly, fen: Z.fen, write_fen: true, write_notes: '' };
	let cmd = 'table';
	send_or_sim(o, cmd);
}
function ferro_clear_playerdata() { if (isdef(Clientdata._playerdata_set)) { delete Clientdata._playerdata_set; } }

function ferro_handle_buy_or_pass() {
	let [fen, stage, uplayer] = [Z.fen, Z.stage, Z.uplayer];
	// if (uplayer == fen.multi.trigger) {
	// 	//hier muss der trigger checken fuer early break up von buy_or_pass
	// 	console.log('HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHAAAAAAAAAAAAALLLLLLLLLLLLOOOOOOOOOOOOO')
	// 	let pldata = Z.playerdata;
	// 	console.log('..............pldata', pldata);
	// }else	
	if (uplayer == lookup(fen, ['multi', 'trigger'])) {
		//select_timer(6000, ferro_force_resolve);
	} else if (nundef(Clientdata.playerdata_set)) {
		select_add_items(ui_get_buy_or_pass_items(), ferro_ack_uplayer, 'may click top discard to buy or pass', 1, 1);
		//select_timer(5000, ferro_ack_uplayer);
	}
}



//#region ferro ack NEW!
function ferro_change_to_ack_round() {
	let [plorder, stage, A, fen, uplayer] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer];
	let nextplayer = get_next_player(Z, uplayer); //player after buy_or_pass round

	//newturn is list of players starting with nextplayer
	let newturn = jsCopy(plorder); while (newturn[0] != nextplayer) { newturn = arrCycle(newturn, 1); } //console.log('newturn', newturn);
	let buyerlist = fen.canbuy = []; //fen.canbuy list ist angeordnet nach reihenfolge der frage
	for (const plname of newturn) {
		let pl = fen.players[plname];
		if (plname == uplayer) { pl.buy = false; continue; }
		else if (pl.coins > 0) { pl.buy = false; buyerlist.push(plname); }
	}
	//log_object(fen, 'buyers', 'nextplayer canbuy');

	start_simple_ack_round('buy_or_pass', buyerlist, nextplayer, 'ferro_change_to_turn_round');
}
function ferro_change_to_turn_round() {
	//console.log('ferro_change_to_turn_round_', getFunctionsNameThatCalledThisFunction()); 
	let [z, A, fen, stage, uplayer, ui] = [Z, Z.A, Z.fen, Z.stage, Z.uplayer, UI];
	assertion(stage != 'card_selection', "ALREADY IN TURN ROUND!!!!!!!!!!!!!!!!!!!!!!");

	for (const plname of fen.canbuy) {
		let pl = fen.players[plname];
		if (pl.buy == true) {
			let card = fen.deck_discard.shift();
			pl.hand.push(card);
			deck_deal_safe_ferro(fen, plname, 1);
			pl.coins -= 1; //pay
			ari_history_list([`${plname} bought ${card}`], 'buy');
			break;
		}
	}
	deck_deal_safe_ferro(fen, fen.nextplayer, 1); //nextplayer draws

	console.log('multi', fen.multi);
	Z.turn = fen.multi.turn_after_ack;
	Z.stage = 'card_selection';

	clear_ack_variables();
	for (const k of ['canbuy']) delete fen[k];
	for (const plname of fen.plorder) { delete fen.players[plname].buy; }
	clear_transaction();
}
function _ferro_ack_uplayer() {
	let [A, fen, stage, uplayer] = [Z.A, Z.fen, Z.stage, Z.uplayer];
	fen.players[uplayer].buy = A.selected[0] == 0;

	ack_player(uplayer);
}

//#endregion


function start_indiv_ack_round(ackstage, ack_players, nextplayer, callbackname_after_ack) {

	let fen = Z.fen;
	//each player except uplayer will get opportunity to buy top discard - nextplayer will draw if passing
	fen.acting_host = Z.uplayer;
	fen.ack_players = ack_players;
	fen.lastplayer = arrLast(ack_players);
	fen.nextplayer = nextplayer; //next player after ack!
	fen.turn_after_ack = [nextplayer];
	fen.callbackname_after_ack = callbackname_after_ack;

	Z.stage = ackstage;
	Z.turn = jsCopy(ack_players);

}

function old_ensure_buttons_visible_ferro() {
	if (isdef(mBy('dbPlayer'))) return;
	let [plorder, stage, A, fen, uplayer, pl] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer, Z.fen.players[Z.uplayer]];
	if (fen.players[uplayer].hand.length <= 1) return; // only display for hand size > 1
	let d = iDiv(UI.players[uplayer]);
	mStyle(d, { position: 'relative' })
	//console.log('d', d);
	let dbPlayer = mDiv(d, { position: 'absolute', bottom: 2, left: 100, height: 25 }, 'dbPlayer');
	let styles = { rounding: 6, bg: 'silver', fg: 'black', border: 0, maleft: 10 };
	let bByRank = mButton('by rank', onclick_by_rank_ferro, dbPlayer, styles, 'enabled');
	let bBySuit = mButton('by suit', onclick_by_suit_ferro, dbPlayer, styles, 'enabled');
	if (Z.game == 'ferro') {
		let b = mButton('clear selection', onclick_clear_selection_ferro, dbPlayer, styles, 'enabled', 'bClearSelection'); //isEmpty(A.selected)?'disabled':'enabled');
		if (isEmpty(A.selected)) hide(b);
	}

}

function handle_result(result, cmd) {
	//if (verbose) console.log('cmd', cmd, '\nresult', result); //return;
	if (result.trim() == "") return;
	let obj;
	try { obj = JSON.parse(result); } catch { console.log('ERROR:', result); }

	if (verbose) console.log('HANDLERESULT bekommt', jsCopy(obj));
	processServerdata(obj, cmd);

	switch (cmd) {
		case "assets": load_assets(obj); start_with_assets(); break;
		case "users": show_users(); break;
		case "tables": show_tables(); break;
		case "delete_table":
		case "delete_tables": show_tables(); break;
		case "collect_status":
			//console.log('collect_status', obj);
			//update_playerdata(obj);
			update_table();
			//console.log('Z.stage', Z.stage);
			if (!is_collect_mode()) {
				show_status(`waiting for ${Z.turn.join(', ')}`);

			} else if (obj.collect_complete == false) {
				let pls = obj.playerstates;
				let waiting_for = [];
				for (const val of pls) {
					let state = !isEmpty(val.state) ? JSON.parse(val.state) : null;
					//console.log('val', val, 'state', state);
					if (isEmpty(state)) { waiting_for.push(val.name); }
				}
				show_status(`waiting for ${waiting_for.join(', ')}`);
			} else { show_status('COMPLETE!'); }
			break;

		case "collect_open":
			//erwarte dass obj ein collect_complete und ein too_late hat!
			let collect_complete = obj.collect_complete;
			let too_late = obj.too_late;
			console.log('collect_open', collect_complete, 'too_late', too_late);

			if (Z.mode != 'multi') { console.log('COLLECT NUR IN MULTI PLAYER MODE!!!!!!'); return; }

			//do I have obj.table?
			if (isdef(obj.table)) {
				let me = U.name; //console.log('me', me);
				//console.log('obj.table', obj.table); // table ist eh schon unpacked! war ja in processServerdata!!!!!!!
				let fen = obj.table.fen;
				let turn = fen.turn;
				console.log('me', me, 'turn', turn);
			}
			if (isdef(obj.playerdata)) {
				let playerdata = obj.playerdata;
				console.log('playerdata', playerdata);
			} else {
				console.log('playerdata nicht da');
			}


			if (i_am_acting_host() && collect_complete) {

				console.log('collect_open: i am host, collect_complete, was nun???');

				assertion(obj.table.fen.turn.length == 1 && obj.table.fen.turn[0] == U.name && U.name == obj.table.fen.acting_host, 'collect_open: acting host is NOT the one in turn!');
				//integrate all player indiv moves into fen
				let fen = obj.table.fen;
				//console.log('YES!')

				update_table(); pollStop();
				assertion(isdef(Z.func.post_collect), 'post_collect not defined for game ' + obj.table.game);
				console.log('playerdata', Z.playerdata)
				for (const p of Z.playerdata) {
					p.state = JSON.parse(p.state);
				}
				console.log('playerdata', Z.playerdata)
				Z.func.post_collect();
				return;


			} else if (collect_complete) {
				console.log('collect_open: collect_complete, bin aber nicht der host! was nun???');

			} else if (i_am_acting_host()) {
				console.log('collect_open: i am host, bin aber nicht collect_complete, was nun???');

			} else {
				console.log('collect_open: bin nicht der host, bin nicht collect_complete, was nun???');

			}
			autopoll();
			// if (collect_complete) {
			// 	update_table();
			// 	autopoll();
			// 	// if (Z.skip_presentation) {
			// 	// 	console.log('presentation is skipped!!!')
			// 	// 	return;
			// 	// }
			// 	// // //console.log('obj has keys', Object.keys(obj));
			// 	// // for (const k in obj) {
			// 	// // 	if (['table', 'tables', 'users'].includes(k)) continue;
			// 	// // 	//console.log('k', k, typeof obj[k], obj[k]);
			// 	// // }
			// 	// gamestep();
			// }				//for (const k in obj) { console.log('k', k, typeof obj[k], obj[k]); }
			break;

		case "gameover":
		case "clear":
		case "table":
		case "startgame":
			update_table();
			let is_collect = check_collect(obj);

			if (is_collect) { pollStop(); console.log('WAS NUN?????'); return; }

			if (Z.skip_presentation) { pollStop(); console.log('not presenting!'); return; }

			console.log('WILL PRESENT! obj has keys', Object.keys(obj));
			//for (const k in obj) { if (['table', 'tables', 'users'].includes(k)) continue; console.log('k', k, typeof obj[k], obj[k]); }

			gamestep(); break;

		// case "table":
		// case "startgame":

		// 	//console.log('Serverdata', Serverdata);
		// 	update_table(); 
		// 	//console.log('will present',!Z.skip_presentation);
		// 	if (!Z.skip_presentation) {
		// 		let [fen,uname,role,uplayer,playmode]=[Z.fen,Z.uname,Z.role,Z.uplayer,Z.playmode]
		// 		console.log('______present',Z.friendly, fen.turn);
		// 		console.log('uname',uname,role);
		// 		console.log('uplayer',uplayer,playmode);
		// 	}else{console.log('not presenting');}
		// 	break; // console.log('Z', Z); //if (!Z.skip_presentation) gamestep(); break;
	}
}
function _show_history(fen, dParent) {
	if (!isEmpty(fen.history)) {
		let html = '';
		for (const arr of jsCopy(fen.history).reverse()) {
			html += arr;//html+=`<h1>${k}</h1>`;
			//for (const line of arr) { html += `<p>${line}</p>`; }
		}
		// let dHistory =  mDiv(dParent, { padding: 6, margin: 4, bg: '#ffffff80', fg: 'black', hmax: 400, 'overflow-y': 'auto', wmin: 240, rounding: 12 }, null, html); //JSON.stringify(fen.history));
		let dHistory = mDiv(dParent, { paleft: 12, bg: colorLight('#EDC690', 50), box: true, matop: 10, patop: 10, w: '100%', hmax: `calc( 100vh - 250px )`, 'overflow-y': 'auto', wmin: 260 }, null, html); //JSON.stringify(fen.history));
		// let dHistory =  mDiv(dParent, { padding: 6, margin: 4, bg: '#ffffff80', fg: 'black', hmax: 400, 'overflow-y': 'auto', wmin: 240, rounding: 12 }, null, html); //JSON.stringify(fen.history));
		//mNode(fen.history, dHistory, 'history');
		UI.dHistoryParent = dParent;
		UI.dHistory = dHistory;
		console.log('dHistory', dHistory);
	}

}

//#region ferro ausmisten
function matches_on_either_end_new(key, j, rankstr = 'A23456789TJQKA') {
	let jfirst = arrFirst(j.o.list);
	let jlast = arrLast(j.o.list);
	for (let i = 0; i < rankstr.length - 1; i++) { let r = rankstr[i]; if (jfirst[0] == rankstr[i + 1]) return true; }
	for (let i = rankstr.length - 1; i > 0; i--) { let r = rankstr[i]; if (jlast[0] == rankstr[i - 1]) return true; }
	return false;
}
function get_all_journeys() {
	let [plorder, stage, A, fen, uplayer] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer];
	let sets = [];
	for (const plname of plorder) {
		let pl = fen.players[plname];
		let i = 0;
		for (const j of pl.journeys) {
			sets.push({ plname: plname, j: j, jnew: jsCopy(j), index: i });
			i++;
		}
	}
	return sets;
}

function try_add_to_group(key, j, addkey = true) {
	if (is_group(j)) {
		if (key[0] == find_group_rank(j)) { if (addkey) j.push(key); return true; }
	} else {
		if (matches_on_either_end_new(key, j)) { if (addkey) j.push(key); return true; }
	}
	return false;
}
function try_replace_jolly(key, j, replace = true) {
	let jolly_idx = find_index_of_jolly(j);
	if (jolly_idx == -1) return false;

	if (is_group(j)) {
		let r = find_group_rank(j);
		if (key[0] == r) { if (replace) j[jolly_idx] = key; return true; }
	} else if (jolly_idx > 0) {
		let rank_before_index = j[jolly_idx - 1][0];
		let rankstr = 'A23456789TJQKA';
		let rank_needed = rankstr[rankstr.indexOf(rank_before_index) + 1];
		if (key[0] == rank_needed) { if (replace) j[jolly_idx] = key; return true; }
	} else {
		let rank_after_index = j[jolly_idx + 1][0];
		let rankstr = 'A23456789TJQKA';
		let rank_needed = rank_after_index == 'A' ? 'K' : rankstr[rankstr.indexOf(rank_after_index) - 1];
		if (key[0] == rank_needed) { if (replace) j[jolly_idx] = key; return true; }
	}
	return false;
}
function get_journeys_with_jolly_for_key(key) {
	let [plorder, stage, A, fen, uplayer] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer];
	let sets = [];
	for (const plname of plorder) {
		let pl = fen.players[plname];
		let i = 0;
		for (const j of pl.journeys) {
			if (try_replace_jolly(key, j, false)) sets.push({ plname: plname, j: j, index: i });
			i++;
		}
	}
	return sets;
}
function ui_get_jolly_items() {
	//find journey items that contain a jolly replaceable by A.selectedCards[0].key
	let items = [], i = 0;
	let sets = Z.A.jollySets;
	//console.log('...sets', sets);
	for (const s of sets) {
		let o = UI.players[s.plname].journeys[s.index];
		let name = `${s.plname}_j${i}`;
		o.div = o.container;
		let item = { o: o, a: name, key: o.list[0], friendly: name, path: o.path, index: i, ui: o.container };
		i++;
		items.push(item);

	}
	return items;

}

//#region aristo rumors
function path2fen(path) {
	let [fen, uplayer] = [Z.fen, Z.uplayer];
	let res = lookup(fen, path.split('.'));
	//console.log('res',res);
	return res;
}
function mStamp(d1, text) {
	mStyle(d1, { position: 'relative' });
	//let stamp = mDiv(d1, { family:'tahoma', fz:16, weight:'bold', position:'absolute', top:'25%',left:'10%',transform:'rotate(35deg)', w: '80%', h: 24 },null,`blackmail!`,'rubberstamp');
	//let stamp = mDiv(d1, { position:'absolute',top:30,left:0,transform:'rotate( 35deg )' },null,`blackmail!`,'rubberp');
	// mDiv(d1,{position:'absolute',top:30,left:0,},null,`<span class="stamp is-approved">BLACKMAIL!</span>`);
	// mDiv(d1,{position:'absolute',top:30,left:0,},null,`<span class="stamp1">BLACKMAIL!</span>`);
	//mDiv(d1, { position: 'absolute', top: 25, left: 5, weight: 700, fg: 'black', border: '2px solid black', padding: 2 }, null, `BLACKMAIL`, 'stamp1');

	let r = getRect(d1);
	let [w, h] = [r.w, r.h];
	let sz = r.h / 7;
	console.log('r', r, 'sz', sz);
	//let [border,rounding,angle]=[sz*.08,sz/3,-14];
	let [padding, border, rounding, angle] = [sz / 10, sz / 6, sz / 8, rNumber(-25, 25)];
	mDiv(d1, {
		opacity: 0.9,
		position: 'absolute', top: 25, left: 5, //weight: 700, fg: 'black', border: '2px solid black', padding: 2,
		transform: `rotate(${angle}deg)`,
		fz: sz,
		//'line-height':sz,
		// border:`${border}px solid black`,
		border: `${border}px solid black`,
		hpadding: 2, //padding,
		vpadding: 0,
		// vpadding: border,
		// hpadding: rounding,
		rounding: rounding,
		// 'background-image': `url('https://s3-us-west-2.amazonaws.com/s.cdpn.io/8399/grunge.png')`,
		// 'background-size': `${300*sz}px ${200*sz}px`,
		// 'background-position': `${4*sz}px ${2*sz}px`,
		// 'background-image': 'url(../base/assets/images/textures/stamp.jpg)',
		// 'background-size': `${300*sz}px ${200*sz}px`,
		// 'background-position': `${4*sz}px ${2*sz}px`,

		'-webkit-mask-size': `${w}px ${h}px`,
		'-webkit-mask-position': `50% 50%`,
		//'-webkit-mask-image': `url('https://s3-us-west-2.amazonaws.com/s.cdpn.io/8399/grunge.png')`,
		'-webkit-mask-image': 'url("../base/assets/images/textures/grunge.png")',

		// '-webkit-mask-size': `311px 200px`,
		// '-webkit-mask-position': `4rem 2rem`,
		// '-webkit-mask-image': `url('https://s3-us-west-2.amazonaws.com/s.cdpn.io/8399/grunge.png')`,

		weight: 400, //700,
		display: 'inline-block',
		'text-transform': 'uppercase',
		family: "black ops one", //'Courier', //'courier new',
		'mix-blend-mode': 'multiply'
	}, null, text);

}


//#region aristo rumors
function ui_get_top_rumors() {
	//let cards = ari_open_rumors();
	return ui_get_card_items(cards);
	let items = [], i = 0;
	let comm = UI.deck_rumors;
	for (const o of comm.items) {
		let item = { o: o, a: o.key, key: o.key, friendly: o.short, path: comm.path, index: i };
		i++;
		items.push(item);
	}
	let topdeck = UI.deck_commission.get_topcard();
	items.push({ o: topdeck, a: topdeck.key, key: topdeck.key, friendly: topdeck.short, path: 'deck_commission', index: i });
	//console.log('choose among:', items)
	return items;
}
function post_rumor() {

	let [fen, A, uplayer, building, obuilding, owner] = [Z.fen, Z.A, Z.uplayer, Z.A.building, Z.A.obuilding, Z.A.buildingowner];
	let buildingtype = Z.A.building.o.type;
	//console.log('====>buildingtype',buildingtype);
	let res = A.selected[0] == 0; //confirm('destroy the building?'); //TODO das muss besser werden!!!!!!!
	if (!res) {
		if (fen.players[owner].coins > 0) {
			//console.log('player', owner, 'pays to', uplayer, fen.players[owner].coins, fen.players[uplayer].coins);
			fen.players[owner].coins -= 1;
			fen.players[uplayer].coins += 1;
			//console.log('after payment:', fen.players[owner].coins, fen.players[uplayer].coins)
		}
	} else {
		let list = obuilding.list;
		//console.log('!!!!!!!!!!!!!building', obuilding, 'DESTROY!!!!!!!!!!!!!!!!', '\nlist', list);
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


		let blist = lookup(fen, stringBeforeLast(building.path, '.').split('.')); //building.path.split('.')); //stringBeforeLast(ibuilding.path, '.').split('.'));, stringBeforeLast(building.path, '.').split('.'));

		//console.log('===>remove',obuilding,'from',blist);
		removeInPlace(blist, obuilding);

		//console.log('player', owner, 'after building destruction', otree[owner])
	}
	ari_history_list([`${uplayer} rumored ${buildingtype} of ${owner} resulting in ${res ? 'destruction' : 'payoff'}`,], 'rumor');

	ari_next_action(fen, uplayer);


}
function rest() {

	if (isdef(obuilding.schwein)) {

		Z.stage = 46;
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
				fen.players[uplayer].coins++;
			}
			let b = lookup(fen, item.path.split('.'));
			b.schwein = schwein;
		}

		ari_history_list([
			`${uplayer} rumored ${ari_get_building_type(obuilding)} of ${owner} resulting in ${schweine ? 'schweine' : 'ok'} ${ari_get_building_type(obuilding)}`,
		], 'rumor');

		ari_next_action(fen, uplayer);
	}


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


//#region fritz

function _show_special_message(msg, stay = false) {
	let dParent = mBy('dBandMessage');
	console.log('dBandMessage', mBy('dBandMessage'))
	if (nundef(dParent)) dParent = mDiv(document.body, {}, 'dBandMessage');
	console.log('dParent', dParent)
	show(dParent);
	clearElement(dParent);
	mStyle(dParent, { position: 'absolute', top: 200, bg: 'green', wmin: '100vw' });
	let d = mDiv(dParent, { margin: 0 });
	let styles = { classname: 'slow_gradient_blink', vpadding: 10, align: 'center', position: 'absolute', fg: 'white', fz: 24, w: '100vw' };
	let dContent = mDiv(d, styles, null, msg);
	mFadeClear(dParent, 3000);
}


function end_of_turn_fritz() {
	//console.log('A', Z.A)
	//console.log('time is up!!!', getFunctionsNameThatCalledThisFunction());
	let [A, fen, uplayer, plorder] = [Z.A, Z.fen, Z.uplayer, Z.plorder];
	let pl = fen.players[uplayer];
	//console.log('__________________________');

	clear_quick_buttons();

	//all TJ groups must be checked and loose cards placed in loosecards
	let ploose = {};
	fen.journeys = [];
	fen.loosecards = [];
	for (const plname in fen.players) { fen.players[plname].loosecards = []; }
	for (const group of DA.TJ) {
		let ch = arrChildren(iDiv(group));
		let cards = ch.map(x => Items[x.id]);
		//find out if is a set
		//console.log('cards', cards);
		let set = ferro_is_set(cards, Z.options.jokers_per_group, 3);
		//console.log('set', set);
		if (!set) {
			//dann kommen die Karten in die Loosecards
			for (const card of cards) {
				if (is_joker(card)) {
					//console.log('pushing joker', card.key);
					fen.loosecards.push(card.key);
					continue;
				}
				let owner = valf(card.owner, uplayer);
				lookupAddToList(ploose, [owner], card.key);
				//console.log('add card', card.key, 'to', owner);
			}
			//console.log('NOT A SET', cards);
		} else {
			let j = set; //[];
			//for (const card of cards) { delete card.owner; j.push(card.key); }
			fen.journeys.push(j);
			//console.log('YES!!!', 'adding journey', j);
		}
	}
	for (const plname in ploose) {
		fen.players[plname].loosecards = ploose[plname];
	}

	//console.log('_____\npublic loosecards', fen.loosecards);
	//console.log('journeys:', fen.journeys);
	//for (const plname in fen.players) { console.log('loosecards', plname, fen.players[plname].loosecards); }

	//discard pile must be reduced by all cards that do not have source = 'discard'
	let discard = UI.deck_discard.items.filter(x => x.source == 'discard');
	fen.deck_discard = discard.map(x => x.key);

	if (!isEmpty(A.selected)) {
		//console.log('selected', A.selected);
		let ui_discarded_card = A.selected.map(x => A.items[x].o)[0];

		removeInPlace(UI.players[uplayer].hand.items, ui_discarded_card);
		ckey = ui_discarded_card.key;
		//console.log('discard', discard);
		elem_from_to(ckey, fen.players[uplayer].hand, fen.deck_discard);
		//ari_history_list([`${uplayer} discards ${c}`], 'discard');

	}

	//all UI.hand cards that do NOT have source=hand must be removed from player hands

	let uihand = UI.players[uplayer].hand.items; //.filter(x => x.source == 'hand');
	let fenhand_vorher = fen.players[uplayer].hand;
	let fenhand = fen.players[uplayer].hand = uihand.filter(x => x.source == 'hand').map(x => x.key);
	//console.log('hand', uihand, 'fenhand vorher:', fenhand_vorher, 'fenhand', fenhand);

	//check gameover!!!!
	if (isEmpty(fenhand) && isEmpty(fen.players[uplayer].loosecards)) {
		end_of_round_fritz(uplayer);

	} else {
		Z.turn = [get_next_player(Z, uplayer)];
		deck_deal_safe_fritz(fen, Z.turn[0]);
	}
	//console.log('==>fen.loosecards', fen.loosecards); //, fen.players[uplayer].loosecards); //, fen.players);
	let ms = fen.players[uplayer].time_left = stop_user_timer();

	//console.log('fritz_turn_ends', 'ms', ms);
	if (ms <= 0) {
		console.log('time is up!!!');
		//this player needs to be removed!
		if (Z.turn[0] == uplayer) Z.turn = [get_next_player(Z, uplayer)];
		//if only 1 player in plorder, that player wins
		remove_player(fen, uplayer);
		if (plorder.length == 1) { end_of_round_fritz(plorder[0]); }
	}

	turn_send_move_update();

}


function fritz_present_new(z, dParent, uplayer) {

	let [fen, ui, stage] = [z.fen, UI, z.stage];
	let [dOben, dOpenTable, dMiddle, dRechts] = tableLayoutMR(dParent, 5, 1); mFlexWrap(dOpenTable)
	Config.ui.card.h = 130;
	Config.ui.container.h = Config.ui.card.h + 30;

	//let deck = ui.deck = ui_type_deck(fen.deck, dOpenTable, { maleft: 12 }, 'deck', 'deck', fritz_get_card);
	if (isEmpty(fen.deck_discard)) {
		mText('discard empty', dOpenTable);
		ui.deck_discard = { items: [] }
	} else {
		let deck_discard = ui.deck_discard = ui_type_hand(fen.deck_discard, dOpenTable, { maright: 25 }, 'deck_discard', 'discard', fritz_get_card, true);
		let i = 0; deck_discard.items.map(x => { x.source = 'discard'; x.index = i++ });
	}
	mLinebreak(dOpenTable);


	let ddarea = UI.ddarea = mDiv(dOpenTable, { border: 'dashed 1px black', bg: '#eeeeee80', box: true, wmin: 245, padding: '5px 50px 5px 5px', margin: 5 });
	mDroppable(ddarea, drop_card_fritz); ddarea.id = 'dOpenTable'; Items[ddarea.id] = ddarea;
	mFlexWrap(ddarea)

	fritz_stats_new(z, dRechts);

	show_history(fen, dRechts);

	DA.TJ = [];
	//journeys become groups
	//fen.journeys = [['QHn', 'KHn', 'AHn'], ['QCn', 'QHn', 'QDn']];
	for (const j of fen.journeys) {
		let cards = j.map(x => fritz_get_card(x));
		frnew(cards[0], { target: 'hallo' });
		for (let i = 1; i < cards.length; i++) { fradd(cards[i], Items[cards[0].groupid]); }

	}
	//loose cards of fen and other players become groups. own loose cards will ALSO go to player area
	let loosecards = ui.loosecards = jsCopy(fen.loosecards).map(c => fritz_get_card(c));
	for (const plname of fen.plorder) {
		let cards = fen.players[plname].loosecards.map(c => fritz_get_card(c));
		cards.map(x => x.owner = plname);
		// if (plname == uplayer) { ui.ploosecards = cards; } else { loosecards = loosecards.concat(cards); }
		if (plname != uplayer) { loosecards = loosecards.concat(cards); }
		//loosecards = loosecards.concat(cards);
	}
	for (const looseui of loosecards) {
		//console.log('looseui', looseui);
		let card = looseui;
		frnew(card, { target: 'hallo' });
	}

	//all cards in drop area are droppable
	for (const group of DA.TJ) {
		let d = iDiv(group);
		//console.log('d',d);
		let ch = arrChildren(iDiv(group));
		let cards = ch.map(x => Items[x.id]);
		//console.log('cards', cards);
		cards.map(x => mDroppable(iDiv(x), drop_card_fritz));
	}

	//if ddarea is empty, write drag and drop hint
	if (arrChildren(ddarea).length == 0) {
		let d = mDiv(ddarea, { 'pointer-events': 'none', maleft: 45, align: 'center', hmin: 40, w: '100%', fz: 12, fg: 'dimgray' }, 'ddhint', 'drag and drop cards here');
		//setRect(ddarea)
		//mPlace(d,'cc')

	}

	ui.players = {};
	let uname_plays = fen.plorder.includes(Z.uname);
	let plmain = uname_plays && Z.mode == 'multi' ? Z.uname : uplayer;
	fritz_present_player(plmain, dMiddle);

	if (TESTING) {
		for (const plname of arrMinus(fen.plorder, plmain)) {
			fritz_present_player(plname, dMiddle);
		}
	}


}



//#region rechnung
function boamain_start() {
	//console.log('haaaaaaaaaaaaaaaaa');
	S.boa_state = 'authorized';

	//hier start timer that will reset boa_state to null
	if (DA.challenge == 1) {
		TO.boa = setTimeout(() => {
			S.boa_state = null;
			let msg = DA.challenge == 1 ? 'CONGRATULATIONS!!!! YOU SUCCEEDED IN LOGGING IN TO BOA' : 'Session timed out!';
			show_eval_message(true);
			//alert(msg);
			//boa_start();
		}, 3000);
	}

	show_correct_location('boa');  //das ist um alle anderen screens zu loeschen!
	let dParent = mBy('dBoa'); mClear(dParent);

	let d0 = mDiv(dParent, { align: 'center' }, 'dBoaMain'); mCenterFlex(d0);
	// let d0 = mDiv(d, { align:'center', display: 'grid', 'grid-template-columns': '2', gap:20 }, 'dBoaMain');
	//let d0 = mDiv(d, { display: 'flex', 'justify-content': 'center', gap:20 }, 'dBoaMain');

	let [wtotal, wleft, wright] = [972, 972 - 298, 292];

	let d = mDiv(d0, { w: wtotal, hmin: 500 }); mAppend(d, createImage('boamain_header.png', { h: 111 }));
	//return;

	// let d0 = mDiv(d);
	//let d1 = mDiv(d0, { align: 'center' });

	// let d2 = mDiv(d);
	// let d3 = mDiv(d2, { display: 'flex', 'justify-content': 'center' }, 'dBoaMain');

	// d = mDiv(d3, { w: wtotal, hmin: 500 });
	let dl = mDiv(d, { float: 'left', w: wleft, hmin: 400 });
	let dr = mDiv(d, { float: 'right', hmin: 400, w: wright });

	mDiv(dr, { h: 100 });
	mAppend(dr, createImage('boamain_rechts.png', { w: 292 }));

	mAppend(dl, createImage('boamain_left_top.jpg', { matop: 50, maleft: -20 }));
	//mDiv(dl, { family:'connectionsregular,Verdana,Geneva,Arial,Helvetica,sans-serif', fz: 18, weight: 500, 'line-height':70, fg:'#524940' }, null, 'Payment Center');

	mDiv(dl, { bg: '#857363', fg: 'white', fz: 15 }, null, '&nbsp;&nbsp;<i class="fa fa-caret-down"></i>&nbsp;&nbsp;Default Group<div style="float:right;">Sort&nbsp;&nbsp;</div>');

	let boadata = get_fake_boa_data_list();
	let color_alt = '#F9F7F4';
	let i = 0;
	//let sortedkeys = get_keys(boadata);	sortedkeys.sort();
	for (const o of boadata) {
		let k = o.key;
		o.index = i;
		//console.log('key',k,'index',i);
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

		// mDiv(dall,{fz:12,fg:'blue',maleft:400,mabottom:25},null,'hallo');
		let dabot = mDiv(dall);
		mFlexLR(dabot);
		let lastpayment = isdef(o['Last Payment']) ? `Last Payment: ${o['Last Payment']}` : ' ';
		mDiv(dabot, { fz: 12, fg: '#303030', maleft: 10, mabottom: 25 }, null, `${lastpayment}`);
		mDiv(dabot, { fz: 12, fg: 'blue', maright: 90, mabottom: 25 }, null, `<a>Activity</a>&nbsp;&nbsp;&nbsp;<a>Reminders</a>&nbsp;&nbsp;&nbsp;<a>AutoPay</a>`);

		mDiv(dall);
		//let dadummy = mDiv(dall, {margin:500 },null,`<a>Activity</a><a>Reminders</a><a>AutoPay</a>`); //;'border-bottom':'1px solid black'});

		i++;
	}


	//mDiv(dl, { hmin: 400, bg: 'orange' });
	//for (let j = 0; j < i; j++) { let inp = document.getElementById(`inp${j}`); inp.addEventListener('keyup', unfocusOnEnter); }

}
function _boamain_start() {
	//console.log('haaaaaaaaaaaaaaaaa');
	S.boa_state = 'authorized';

	//hier start timer that will reset boa_state to null
	if (DA.challenge == 1) {
		TO.boa = setTimeout(() => {
			S.boa_state = null;
			let msg = DA.challenge == 1 ? 'CONGRATULATIONS!!!! YOU SUCCEEDED IN LOGGING IN TO BOA' : 'Session timed out!';
			alert(msg);
			boa_start();
		}, 3000);
	}

	show_correct_location('boa');  //das ist um alle anderen screens zu loeschen!
	let d = mBy('dBoa'); mClear(d);

	let d0 = mDiv(d);
	let d1 = mDiv(d0, { align: 'center' });
	mAppend(d1, createImage('boamain_header.png', { h: 111 }));

	let d2 = mDiv(d);
	let d3 = mDiv(d2, { display: 'flex', 'justify-content': 'center' }, 'dBoaMain');

	let [wtotal, wleft, wright] = [972, 972 - 298, 292];
	d = mDiv(d3, { w: wtotal, hmin: 500 });
	let dl = mDiv(d, { float: 'left', w: wleft, hmin: 400 });
	let dr = mDiv(d, { float: 'right', hmin: 400, w: wright });

	mDiv(dr, { h: 100 });
	mAppend(dr, createImage('boamain_rechts.png', { w: 292 }));

	mAppend(dl, createImage('boamain_left_top.jpg', { matop: 50, maleft: -20 }));
	//mDiv(dl, { family:'connectionsregular,Verdana,Geneva,Arial,Helvetica,sans-serif', fz: 18, weight: 500, 'line-height':70, fg:'#524940' }, null, 'Payment Center');

	mDiv(dl, { bg: '#857363', fg: 'white', fz: 15 }, null, '&nbsp;&nbsp;<i class="fa fa-caret-down"></i>&nbsp;&nbsp;Default Group<div style="float:right;">Sort&nbsp;&nbsp;</div>');

	let boadata = get_fake_boa_data();
	let color_alt = '#F9F7F4';
	let i = 0;
	for (const k in boadata) {
		let o = boadata[k];
		//console.log('o', o);
		let logo = valf(o.logo, 'defaultacct.jpg');
		let path = `${logo}`;
		let [sz, bg] = [25, i % 2 ? 'white' : color_alt];

		let dall = mDiv(dl, { bg: bg, fg: '#FCFCFC', 'border-bottom': '1px dotted silver' });
		let da = mDiv(dall);
		mFlexLR(da);

		let img = createImage(path, { h: sz, margin: 10 });

		let da1 = mDiv(da);
		mAppend(da1, img);
		let dtext = mDiv(da1, { display: 'inline-block', fg: '#FCFCFC', fz: 14 });
		mAppend(dtext, mCreateFrom(`<a>${k}</a>`));
		let dsub = mDiv(dtext, { fg: 'dimgray', fz: 12 }, null, o.sub);

		let da2 = mDiv(da); mFlex(da2);
		let da21 = mDiv(da2, { w: 100, hmargin: 20, mabottom: 20 });
		let padinput = 7;
		mDiv(da21, { fg: 'black', fz: 12, weight: 'bold' }, null, 'Amount');
		mDiv(da21, { w: 100 }, null, `<input style="color:dimgray;font-size:14px;border:1px dotted silver;padding:${padinput}px;width:85px" id="inpAuthocode" name="authocode" value="$" type="text" />`);

		let da22 = mDiv(da2, { maright: 10 });
		mDiv(da22, { fg: 'black', fz: 12, weight: 'bold' }, null, 'Deliver By');
		mDiv(da22, {}, null, `<input style="color:dimgray;font-size:12px;border:1px dotted silver;padding:${padinput}px" id="inpAuthocode" name="authocode" value="" type="date" />`);

		// mDiv(dall,{fz:12,fg:'blue',maleft:400,mabottom:25},null,'hallo');
		let dabot = mDiv(dall);
		mFlexLR(dabot);
		let lastpayment = isdef(o['Last Payment']) ? `Last Payment: ${o['Last Payment']}` : ' ';
		mDiv(dabot, { fz: 12, fg: '#303030', maleft: 10, mabottom: 25 }, null, `${lastpayment}`);
		mDiv(dabot, { fz: 12, fg: 'blue', maright: 90, mabottom: 25 }, null, `<a>Activity</a>&nbsp;&nbsp;&nbsp;<a>Reminders</a>&nbsp;&nbsp;&nbsp;<a>AutoPay</a>`);
		//let dadummy = mDiv(dall, {margin:500 },null,`<a>Activity</a><a>Reminders</a><a>AutoPay</a>`); //;'border-bottom':'1px solid black'});

		i++;
	}

	//mDiv(dl, { hmin: 400, bg: 'orange' });

}

function restrest() {
	let d1 = mDiv(d0, { align: 'center' });
	mAppend(d1, createImage('boamain_header.png', { h: 111 }));

	let d2 = mDiv(d);
	let d3 = mDiv(d2, { display: 'flex', 'justify-content': 'center' });

	let [wtotal, wleft, wright] = [972, 972 - 298, 292];
	d = mDiv(d3, { w: wtotal, hmin: 500 });
	let dl = mDiv(d, { float: 'left', w: wleft, hmin: 400 });
	let dr = mDiv(d, { float: 'right', hmin: 400, w: wright });

	mDiv(dr, { h: 100 });
	mAppend(dr, createImage('boamain_rechts.png', { w: 292 }));

	mAppend(dl, createImage('boamain_left_top.jpg', { matop: 50, maleft: -20 }));
	//mDiv(dl, { family:'connectionsregular,Verdana,Geneva,Arial,Helvetica,sans-serif', fz: 18, weight: 500, 'line-height':70, fg:'#524940' }, null, 'Payment Center');

	mDiv(dl, { bg: '#857363', fg: 'white', fz: 15 }, null, '&nbsp;&nbsp;<i class="fa fa-caret-down"></i>&nbsp;&nbsp;Default Group<div style="float:right;">Sort&nbsp;&nbsp;</div>');

	let boadata = get_fake_boa_data();
	let color_alt = '#F9F7F4';
	let i = 0;
	for (const k in boadata) {
		let o = boadata[k];
		//console.log('o', o);
		let logo = valf(o.logo, 'defaultacct.jpg');
		let path = `${logo}`;
		let [sz, bg] = [25, i % 2 ? 'white' : color_alt];

		let dall = mDiv(dl, { bg: bg, fg: '#FCFCFC', 'border-bottom': '1px dotted silver' });
		let da = mDiv(dall);
		mFlexLR(da);

		let img = createImage(path, { h: sz, margin: 10 });

		let da1 = mDiv(da);
		mAppend(da1, img);
		let dtext = mDiv(da1, { display: 'inline-block', fg: '#FCFCFC', fz: 14 });
		mAppend(dtext, mCreateFrom(`<a>${k}</a>`));
		let dsub = mDiv(dtext, { fg: 'dimgray', fz: 12 }, null, o.sub);

		let da2 = mDiv(da); mFlex(da2);
		let da21 = mDiv(da2, { w: 100, hmargin: 20, mabottom: 20 });
		let padinput = 7;
		mDiv(da21, { fg: 'black', fz: 12, weight: 'bold' }, null, 'Amount');
		mDiv(da21, { w: 100 }, null, `<input style="color:dimgray;font-size:14px;border:1px dotted silver;padding:${padinput}px;width:85px" id="inpAuthocode" name="authocode" value="$" type="text" />`);

		let da22 = mDiv(da2, { maright: 10 });
		mDiv(da22, { fg: 'black', fz: 12, weight: 'bold' }, null, 'Deliver By');
		mDiv(da22, {}, null, `<input style="color:dimgray;font-size:12px;border:1px dotted silver;padding:${padinput}px" id="inpAuthocode" name="authocode" value="" type="date" />`);

		// mDiv(dall,{fz:12,fg:'blue',maleft:400,mabottom:25},null,'hallo');
		let dabot = mDiv(dall);
		mFlexLR(dabot);
		let lastpayment = isdef(o['Last Payment']) ? `Last Payment: ${o['Last Payment']}` : ' ';
		mDiv(dabot, { fz: 12, fg: '#303030', maleft: 10, mabottom: 25 }, null, `${lastpayment}`);
		mDiv(dabot, { fz: 12, fg: 'blue', maright: 90, mabottom: 25 }, null, `<a>Activity</a>&nbsp;&nbsp;&nbsp;<a>Reminders</a>&nbsp;&nbsp;&nbsp;<a>AutoPay</a>`);
		//let dadummy = mDiv(dall, {margin:500 },null,`<a>Activity</a><a>Reminders</a><a>AutoPay</a>`); //;'border-bottom':'1px solid black'});

		i++;
	}



	//mDiv(dl, { hmin: 400, bg: 'orange' });

}
function _bw_widget_popup() {
	let dpop = mBy('dPopup');
	show(dpop); mClear(dpop)
	mStyle(dpop, { top: 50, right: 10 }); let prefix = 'boa';
	let d = mDiv(dpop, { wmin: 200, hmin: 200, padding: 0 }, 'dBw');
	let d2 = mDiv(d, { padding: 0, h: 30 }, null, `<img width='100%' src='../rechnung/images/bwsearch.jpg'>`);
	//let d2 = mDiv(d, { bg: 'dodgerblue', fg: 'white' }, null, 'your bitwarden vault');

	let d3 = mDiv(d, { bg: '#eee', fg: 'dimgray', padding: 8, matop: 8 }, null, 'LOGINS');
	let d4 = mDiv(d, { bg: 'white', fg: 'black' });
	let d5 = mDiv(d4, { display: 'flex' });
	let dimg = mDiv(d5, { bg: 'white', fg: 'black' }, null, `<img src='../rechnung/images/boa.png' height=14 style="margin:8px">`);
	// let dtext = mDiv(d5, {}, null, `<div>boa</div><div style="font-size:12px;color:gray">gleeb69</div>`);
	let dtext = mDiv(d5, { cursor: 'pointer' }, null, `<div>boa</div><div style="font-size:12px;color:gray">gleeb69</div>`);
	dtext.onclick = () => onclick_bw_symbol(prefix)
	let d6 = mDiv(d4, { display: 'flex', padding: 2 });
	let disyms = {
		bwtext: { postfix: 'userid', matop: 2, maright: 0, mabottom: 0, maleft: 0, sz: 27 },
		bwcross: { postfix: 'cross', matop: 2, maright: 0, mabottom: 0, maleft: -13, sz: 25 },
		bwkey: { postfix: 'pwd', matop: 0, maright: 0, mabottom: 0, maleft: -12, sz: 27 },
		bwclock: { postfix: 'clock', matop: 0, maright: 0, mabottom: 0, maleft: 0, sz: 25 },
	}
	for (const k of ['bwtext', 'bwcross', 'bwkey']) { //,'bwclock']) {
		let o = disyms[k];
		let [filename, styles] = [k, disyms[k]];
		let path = `../rechnung/images/${filename}.png`;
		let [sz, ma] = [styles.sz, `${styles.matop}px ${styles.maright}px ${styles.mabottom}px ${styles.maleft}px`];
		//console.log('ma', ma);
		let img = mDiv(d6, { paright: 16 }, null, `<img src='${path}' height=${sz} style="margin:${ma}">`);
		if (k != 'bwcross') {
			mStyle(img, { cursor: 'pointer' });
			img.onclick = () => onclick_bw_symbol(prefix, o.postfix);
		}
	}
	mFlexSpacebetween(d4);
	let d7 = mDiv(d, { bg: '#eee', fg: 'dimgray', padding: 7 }, null, 'CARDS');
	//let d8 = mDiv(d, { fg: 'white' }, null, `<img width='100%' src='../rechnung/images/rest_bw.jpg'>`);

}

//#endregion

//#region ack OLD
function ferro_update_ack() {
	//should return true if need to resend!
	let [fen, stage, uplayer] = [Z.fen, Z.stage, Z.uplayer];

	//console.log('___________notes', jsCopy(Z.notes));

	if (Z.notes.resolve == true && uplayer == Z.host) { ferro_change_to_turn_round(); return true; }

	//update turn from notes
	let updated = false;
	for (const k in Z.notes) {
		if (k == 'akku') continue;
		if (!Z.turn.includes(k)) continue;
		updated = true;
		removeInPlace(Z.turn, k);
		console.log('removing player', k, 'from turn', Z.turn);
	}
	//console.log('Z.turn is now:', jsCopy(Z.turn));
	fen.turn = Z.turn;

	if (!isEmpty(Z.turn)) return updated;

	//ab hier is Z.turn EMPTY da heisst akku ist voll!!!!
	else if (uplayer == Z.host) { ferro_change_to_turn_round(); return true; }
	else { Z.turn = fen.turn = [Z.host]; Z.notes.resolve = true; return true; } //hier sollte resolve flag setzen!!!
}
function ferro_change_to_ack_round() {
	let [plorder, stage, A, fen, uplayer] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer];
	let nextplayer = get_next_player(Z, uplayer);

	//console.log('nextplayer should be', nextplayer)

	//newturn is list of players starting with nextplayer
	let newturn = jsCopy(plorder); while (newturn[0] != nextplayer) { newturn = arrCycle(newturn, 1); }

	//each player except uplayer will get opportunity to buy top discard - nextplayer will draw if passing
	fen.lastplayer = uplayer;
	fen.nextplayer = nextplayer;
	fen.turn_after_ack = [nextplayer];
	fen.nextstage = 'card_selection';
	let buyerlist = fen.canbuy = [];
	//console.log('newturn', newturn);
	for (const plname of newturn) {
		let pl = fen.players[plname];
		if (plname == uplayer) { pl.buy = false; continue; }
		//if (plname == nextplayer) { pl.buy = false; buyerlist.push(plname); }
		else if (pl.coins > 0) { pl.buy = false; buyerlist.push(plname); }
	}
	//log_object(fen, 'buyers', 'nextplayer canbuy');

	Z.stage = 'buy_or_pass';
	Z.turn = buyerlist;
	//console.log('Z.turn', Z.turn);
	Z.notes = { akku: true };
}
function ferro_change_to_turn_round() {
	//console.log('ferro_change_to_turn_round', getFunctionsNameThatCalledThisFunction()); 
	let [z, A, fen, stage, uplayer, ui] = [Z, Z.A, Z.fen, Z.stage, Z.uplayer, UI];
	assertion(stage == 'buy_or_pass', "ALREADY IN TURN ROUND!!!!!!!!!!!!!!!!!!!!!!")
	Z.turn = fen.turn_after_ack;
	//console.log('fen.canbuy', fen.canbuy);
	//console.log('next player will be', Z.turn);

	//resolve buy or pass round!
	//if any player has bought, he will get top discard
	for (const plname of fen.canbuy) {
		let pl = fen.players[plname];
		//console.log('pl',pl);
		if (pl.buy) {
			let card = fen.deck_discard.shift();
			//console.log('card',card,jsCopy(pl.hand));
			pl.hand.push(card);
			//also pl gets 2 top cards from deck
			//console.log('card',card,pl.hand);
			pl.hand.push(fen.deck.shift()); //get 1 extra card from deck
			pl.coins -= 1; //pay
			fen.player_bought = plname;
			ari_history_list([`${plname} bought ${card}`], 'buy');
			//console.log(plname, 'bought', card, 'for', 1, 'coins');
			break;
		}
	}
	fen.players[fen.nextplayer].hand.push(fen.deck.shift());//nextplayer draws
	Z.stage = fen.nextstage;
	//cleanup buy_or_pass variables
	for (const k of ['player_bought', 'nextplayer', 'nextstage', 'canbuy', 'turn_after_ack', 'akku']) delete fen[k];
	for (const plname of fen.plorder) { delete fen.players[plname].buy; }
	Z.notes = {};
	clear_transaction();

	//hier kann ich turn snapshot machen

}
function ferro_ack_uplayer() {
	let [A, fen, stage, uplayer] = [Z.A, Z.fen, Z.stage, Z.uplayer];
	removeInPlace(Z.turn, uplayer);
	if (A.selected[0] == 0) {
		Z.notes[uplayer] = { buy: true };
		fen.players[uplayer].buy = true;
	} else {
		Z.notes[uplayer] = { buy: false };
		fen.players[uplayer].buy = false;
	}

	if (isEmpty(Z.turn)) { ferro_change_to_turn_round(); }
	turn_send_move_update();
}
//#endregion



function ui_get_bluff_inputs(strings) {
	let uplayer = Z.uplayer;
	let items = ui_get_string_items(strings);
	console.log('items', items)
	return items;
	//hier koennt ich die ergebnis inputs dazugeben!
}


function ui_get_ferro_action_items() {
	let [plorder, stage, A, fen, uplayer, pl] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer, Z.fen.players[Z.uplayer]];

	let items = ui_get_hand_items(uplayer);
	let actions = ['discard', 'auflegen', 'anlegen', 'jolly'];
	items = items.concat(ui_get_string_items(actions));
	reindex_items(items);
	return items;
}
function ferro_process_action() {
	let [plorder, stage, A, fen, uplayer, pl] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer, Z.fen.players[Z.uplayer]];

	let selitems = A.selected.map(x => A.items[x]);
	console.log('selitems:', selitems);
	let cards = selitems.filter(x => x.itemtype == 'card');
	let actions = selitems.filter(x => x.itemtype == 'string');
	if (actions.length == 0) { select_error('select an action!'); selitems.map(x => ari_make_unselected(x)); A.selected = []; return; }
	let cmd = actions[0].a;
	switch (cmd) {
		case 'discard': ferro_process_discard(); break;
		case 'auflegen': ferro_process_group(); break;
		case 'anlegen': ferro_process_anlegen(); break;
		case 'jolly': ferro_process_jolly(); break;
		default: console.log('unknown command: ' + cmd);
	}
}
function ferro_process_action_() {
	let [plorder, stage, A, fen, uplayer, pl] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer, Z.fen.players[Z.uplayer]];

	//player has selected 1 card

	//need to find out what can do with that card?
	//commands will be: discard group sequence anlegen jolly
	A.initialItem = A.items[A.selected[0]];
	Z.stage = 'commands';
	ferro_pre_action();
}
function ferro_process_command_() {

	let [plorder, stage, A, fen, uplayer, pl] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer, Z.fen.players[Z.uplayer]];

	//player has selected 1 card
	let cmd = A.items[A.selected[0]].a;
	switch (cmd) {
		case 'discard': ferro_process_discard(); break;
		case 'group': ferro_prep_group(); break;
		default: console.log('unknown command: ' + cmd);
	}
}
function ferro_prep_group() {
	let [plorder, stage, A, fen, uplayer] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer];

	A.command = 'group';
	Z.stage = 'group';
	ferro_pre_action();

}
function ferro_get_actions(uplayer) {
	let fen = Z.fen;
	//actions include market card exchange
	let actions = ['discard', 'group', 'sequence', 'anlegen', 'jolly'];
	//if (Config.autosubmit) actions.push('pass'); ////, 'pass'];
	let avail_actions = [];
	for (const a of actions) {
		//check if this action is possible for uplayer
		let avail = ferro_check_action_available(a, fen, uplayer);
		if (avail) avail_actions.push(a);
	}
	return avail_actions;

}
function ferro_check_action_available(a, fen, uplayer) {
	let card = Z.A.initialItem.o;
	let pl = fen.players[uplayer];
	if (a == 'discard') { return true; }
	else if (a == 'group') {

		//check if player can build a group of 3 cards with rank = card.rank
		let rank = card.rank;
		let hand = pl.hand;
		//hand needs to have at least 3 cards of rank rank
		let group = hand.filter(x => x[0] == rank);

		//find a card in hand that has rank '*'
		let wildcard = hand.find(x => x[0] == '*');
		//console.log('wildcard', wildcard?'yes':'no');
		let n = group.length + (isdef(wildcard) ? 1 : 0);
		console.log('can build group of', n)
		return n >= 3;

	} else return false;
}
function ui_get_group_items() {
	let [plorder, stage, A, fen, uplayer] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer];
	let rank = A.initialItem.o.rank;
	let items = ui_get_hand_items(uplayer);
	console.log('items', items, 'rank', rank);

	items = items.filter(x => x.key[0] == rank || x.key[0] == '*');
	console.log('items', items);
	reindex_items(items);
	return items;
}
function ui_get_ferro_commands() {

	let avail = ferro_get_actions(Z.uplayer);
	let items = [], i = 0;
	for (const cmd of avail) { //just strings!
		let item = { o: null, a: cmd, key: cmd, friendly: cmd, path: null, index: i };
		i++;
		items.push(item);
	}
	//console.log('available commands', items);
	return items;
}
function ferro_pre_action_() {
	let [stage, A, fen, plorder, uplayer, deck] = [Z.stage, Z.A, Z.fen, Z.plorder, Z.uplayer, Z.deck];
	//log_object(fen, 'fen', 'stage turn players');	//console.log('__________stage', stage, 'uplayer', uplayer, '\nDA', get_keys(DA));	//console.log('fen',fen,fen.players[uplayer]);
	switch (stage) {
		case 'throw': select_add_items(ui_get_hand_items(uplayer), ferro_post_discard, 'must discard', 1, 1); break;
		case 'buy_or_pass': select_add_items(ui_get_buy_or_pass_items(), ferro_ack_uplayer, 'may click top discard to buy or pass', 1, 1); break;
		case 'card_selection': select_add_items(ui_get_ferro_action_items(), ferro_process_action, 'must discard or play a set', 1, 100); break;
		// case 'commands': select_add_items(ui_get_string_items(['discard', 'group', 'sequence', 'anlegen', 'jolly']), ferro_process_command, 'must select an action', 1, 1); break;
		case 'commands': select_add_items(ui_get_ferro_commands(), ferro_process_command, 'must select an action', 1, 1); break;
		case 'group': select_add_items(ui_get_group_items(), ferro_process_group, 'must select cards to reveal', 3, 100); break;

		default: console.log('stage is', stage); break;
	}
}




















