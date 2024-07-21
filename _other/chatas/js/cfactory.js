const INNO = {
	color: { blue: '#89aad7', red: '#da7887', green: '#72b964', yellow: '#e2e57a', purple: '#9b58ba' },
	sym: {
		tower: { key: 'white-tower', fg: 'silver', bg: 'dimgray' },
		leaf: { key: 'leaf', fg: '#96D6BE', bg: '#275D45' },
		tree: { key: 'leaf', fg: '#96D6BE', bg: '#275D45' },
		bulb: { key: 'lightbulb', fg: 'white', bg: '#69224C' },
		crown: { key: 'queen-crown', fg: '#FEE593', bg: '#A27E44' },
		factory: { key: 'i_factory', fg: '#CD5147', bg: '#6D1A12' },
		clock: { key: 'clock', fg: '#3E84B5', bg: '#0B5884' },
	},
};
var CSZ = 300;
var CHEIGHT = CSZ;
var CWIDTH = CSZ * .7
var CGAP = CSZ * .05;

//#region inno
function cardInno(dParent, key) {
	if (nundef(key)) key = chooseRandom(Object.keys(Cinno));
	let cardInfo = Cinno[key];
	cardInfo.key = key;
	// console.log('card', cardInfo);
	let sym = INNO.sym[cardInfo.type];
	let info = Syms[sym.key];
	let card = cBlank(dParent, { fg: 'black', bg: INNO.color[cardInfo.color], w: CSZ, h: CSZ * .65 });
	let [dCard, sz, szTitle, margin] = [iDiv(card), CSZ / 5, CSZ/8, CSZ/40];

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
	let box = mBoxFromMargins(dMain, 10, margin, sz + margin, sz + 2 * margin); //,{bg:'grey',alpha:.5, rounding:10});
	mStyle(box, { align: 'left' });
	let text = '';
	for (const dog of cardInfo.dogmas) {
		console.log('text', cardInfo.type, sym);
		let t = startsWith(dog, 'I demand') ? ('I <b>demand</b>' + dog.substring(8)) : dog;
		//text += `<div style="display:inline-block;width:8px;height:8px;background:${sym.bg}"></div>` + '&nbsp;' + t + '<br>';
		// text += `<span style="color:${sym.bg}">&#8226;</span>` + '&nbsp;' + t + '<br>';
		//text += makeSymbolSpan(Syms[sym.key], sym.bg, sym.fg, 10, '50%') + '. ' + dog + '<br>';
		//text += `<span style="color:${sym.bg};font-size:30px;vertical-align:bottom;">&bull;</span>` + t + '<br>';
		text += `<span style="color:${sym.bg};font-family:${info.family}">${info.text}</span>` + '&nbsp;' + t + '<br>';
		//&bull;
	}
	let t2 = innoText(text);
	box.onclick = (ev) => makeInfobox(ev, box, 2); //console.log('click!',ev.target);
	mFillText(t2, box);
}
function innoAgeNumber(n, dParent, sz, pos, margin = 10) {
	let x = CSZ*.04; sz -= x; margin += x/2;
	let box = mDiv(dParent, { w: sz, h: sz, bg: 'beige', rounding: '50%', align: 'center' }); 
	mPlace(box, pos, margin);
	s = mDiv(box, { fz: sz * .7, fg: 'black', display: 'inline-block' }, null, n);
	mPlace(s, 'cc'); //, 'vertical-align': 'text-top'  },null,n); 
	return box;
}
function innoBonusNumber(n, dParent, sz, pos, margin = 10) {
	let hOff = margin / 2;
	let styles = { w: sz, h: sz - hOff, bg: 'brown', box: true, align: 'center' };
	let box = mShape('hexFlat', dParent, styles); mPlace(box, pos, margin + hOff / 2, margin);
	//let box = mDiv(dParent, { w: sz, h: sz, bg: 'brown', border:'5px double dimgray', box:true, rounding: '50%', align:'center'}); mPlace(box, pos, margin);
	let dText = mDiv(box, { fz: sz * .1, fg: 'black', 'line-height': sz * .1, matop: sz * .05 }, null, 'bonus');
	let dNum = mDiv(box, { fz: sz * .7, fg: 'black', 'line-height': sz * .65 }, null, n);
	return box;
}
function innoEcho(text, dParent, sz, pos, margin = 10) {
	if (isList(text)) text = text.join('<br>');
	//console.log('text',text); return;
	margin /= 2;
	sz += margin / 4;
	let box = mDiv(dParent, { w: sz, h: sz, bg: 'black', fg: 'white', rounding: 10 });
	mPlace(box, pos, margin);
	box.onclick = (ev) => makeInfobox(ev, box, 3); 
	let t2 = innoText(text);
	mFillText(t2, box);
	return box;
}
function innoSym(key, dParent, sz, pos, margin = 10) {
	let box = mDiv(dParent, { w: sz, h: sz, bg: INNO.sym[key].bg, rounding: 10 }); mPlace(box, pos, margin);
	s = mSym(INNO.sym[key].key, box, { sz: sz * .75, fg: INNO.sym[key].fg }, 'cc');
	return box;
}
function innoText(text) {
	for (const s in INNO.sym) { INNO.sym[s].sym = Syms[INNO.sym[s].key]; }
	// console.log('INNO.sym', INNO.sym);
	// console.log('text', text);

	//words to replace:
	let parts = text.split('[');
	let s = parts[0];
	for (let i = 1; i < parts.length; i++) {
		let part = parts[i];
		let kw = stringBefore(part, ']');
		//console.log('kw', kw);
		let sp;
		let fz = CSZ*.04;
		if (Object.keys(INNO.sym).includes(kw)) { let o = INNO.sym[kw]; sp = makeSymbolSpan(o.sym, o.bg, o.fg, fz); }
		else if (isNumber(kw)) { sp = makeNumberSpan(kw, 'white', 'black', fz); }
		s += sp + stringAfter(part, ']');
	}
	// console.log('text', text, '\ns', s)
	return s;
}

//#endregion

//#region spotit
function spotitCard(info, dParent, cardStyles, onClickSym) {
	let styles = copyKeys({ w: CSZ, h: CSZ }, cardStyles);
	let card = cRound(dParent, cardStyles, info.id);
	addKeys(info, card);

	let d = iDiv(card);
	card.pattern = fillColarr(card.colarr, card.keys);

	// symSize: abhaengig von rows
	let symStyles = { sz: CSZ / (card.rows + 1), fg: 'random', hmargin: 8, vmargin: 4, cursor: 'pointer' };

	let syms = [];
	mRows(iDiv(card), card.pattern, symStyles, { 'justify-content': 'center' }, { 'justify-content': 'center' }, syms);
	for (let i = 0; i < info.keys.length; i++) {
		let key = card.keys[i];
		let sym = syms[i];
		card.live[key] = sym;
		sym.setAttribute('key', key);
		sym.onclick = onClickSym;
	}

	return card;
}
function spotitDeal(rows, cols, numCards, setName) {
	//deal cards (backend)
	let colarr = _calc_hex_col_array(rows, cols);
	let perCard = arrSum(colarr);

	let nShared = (numCards * (numCards - 1)) / 2;
	let nUnique = perCard - numCards + 1;
	let keys = choose(oneWordKeys(KeySets[setName]), nShared + numCards * nUnique);
	let dupls = keys.slice(0, nShared); //these keys are shared: cards 1 and 2 share the first one, 1 and 3 the second one,...
	let uniqs = keys.slice(nShared);
	//console.log('numCards', numCards, '\nperCard', perCard, '\ntotal', keys.length, '\ndupls', dupls, '\nuniqs', uniqs);

	let infos = [];
	for (let i = 0; i < numCards; i++) {
		let keylist = uniqs.slice(i * nUnique, i * nUnique + nUnique);
		//console.log('card unique keys:',card.keys);
		let info = { id: getUID(), shares: {}, keys: keylist, rows: rows, cols: cols, colarr: colarr };
		infos.push(info);
	}

	let iShared = 0;
	for (let i = 0; i < numCards; i++) {
		for (let j = i + 1; j < numCards; j++) {
			let c1 = infos[i];
			let c2 = infos[j];
			let dupl = dupls[iShared++];
			c1.keys.push(dupl);
			c1.shares[c2.id] = dupl;
			c2.shares[c1.id] = dupl;
			c2.keys.push(dupl);
			//each gets a shared card
		}
	}


	for (const info of infos) { shuffle(info.keys); }
	return infos;

}
function spotitFindCardSharingSymbol(card, key) {
	let id = firstCondDict(card.shares, x => x == key);
	//console.log('found', id);
	return Items[id];
}
function spotitFindSymbol(card, key) {
	let k = firstCondDictKey(card.live, x => x == key);
	//console.log('found symbol div', card.live[k]);
	return iGetl(card,k);
}
function spotitOnClickSymbol(ev) {

	let keyClicked = evToProp(ev, 'key');
	let id = evToId(ev);

	if (isdef(keyClicked) && isdef(Items[id])) {
		let item = Items[id];
		console.log('clicked key', keyClicked, 'of card', id, item);
		if (Object.values(item.shares).includes(keyClicked)) {
			console.log('success!!!');//success!
			//find the card that shares this symbol!
			let otherCard = spotitFindCardSharingSymbol(item, keyClicked);
			let cardSymbol = ev.target;
			let otherSymbol = spotitFindSymbol(otherCard, keyClicked);
			//mach die success markers auf die 2 symbols!
			Selected = { feedbackUI: [cardSymbol, otherSymbol] };

		} else {
			console.log('fail!!!!!!!!'); //fail
			let cardSymbol = ev.target;
			Selected = { feedbackUI: [cardSymbol] };

		}
	}
}
//#endregion

//#region card presentation: m functions ==>base!
function mRows(dParent, arr, itemStyles = { bg: 'random' }, rowStyles, colStyles, akku) {
	let d0 = mDiv100(dParent, { display: 'flex', dir: 'column', 'justify-content': 'space-between' });//,'align-items':'center'});
	if (isdef(rowStyles)) mStyle(d0, rowStyles);
	for (let i = 0; i < arr.length; i++) {
		// let d1=mDiv(d0,{bg:'random',h:randomNumber(30,80),w:'100%'},null,randomName());
		let content = arr[i];
		if (isList(content)) {
			let d1 = mDiv(d0); //,null,randomName());
			mCols(d1, content, itemStyles, rowStyles, colStyles, akku);
		} else {
			d1 = mContent(content, d0, itemStyles); //mDiv(d0, styles, null, content);
			akku.push(d1);
			// let d1 = mDiv(d0, { bg: 'random' }, null, content);
		}

	}

}
function mCols(dParent, arr, itemStyles = { bg: 'random' }, rowStyles, colStyles, akku) {
	let d0 = mDiv100(dParent, { display: 'flex', 'justify-content': 'space-between' }); //,'align-items':'center'});
	if (isdef(colStyles)) mStyle(d0, colStyles);
	for (let i = 0; i < arr.length; i++) {
		let content = arr[i];
		if (isList(content)) {
			d1 = mDiv(d0); //,null,randomName());
			mRows(d1, content, itemStyles, rowStyles, colStyles, akku);
		} else {
			d1 = mContent(content, d0, itemStyles); //mDiv(d0, styles, null, content);
			akku.push(d1);
		}
	}

}
function mContent(content, dParent, styles) {
	let d1 = isdef(Syms[content]) ? mSymInDivShrink(content, dParent, styles) : mDiv(dParent, styles, null, content);
	return d1;
}
function mSymInDiv(sym, dParent, styles = { sz: CSZ / 5, fg: 'random' }) {
	dResult = mDiv(dParent);
	//sym = chooseRandom(KeySets['animals-nature']); //SymKeys);
	ds = mSym(sym, dResult, styles);
	return dResult;
}
function mSymInDivShrink(sym, dParent, styles = { sz: CSZ / 5, fg: 'random' }) {
	dResult = mDiv(dParent);
	let ds = mSym(sym, dResult, styles);
	//console.log('ds',ds);
	let scale = chooseRandom([.4, .7, 1, 1.25]);
	//if (coin()) scale = -scale;
	let [scaleX, scaleY] = [coin() ? scale : -scale, scale];
	//console.log('sym', sym, scaleX, scaleY);
	if (coin()) ds.style.transform = `scale(${scaleX},${scaleY})`;
	return dResult;
}
//#endregion

//wie teilt man n symbols auf eine card auf (sz bei pik 8)
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
function cRound(dParent,styles={}, id){
	styles.w=valf(styles.w,CSZ);
	styles.h=valf(styles.h,CSZ);
	styles.rounding = '50%';
	return cBlank(dParent, styles, id);
}
function cLandscape(dParent, styles = {}, id) {
	if (nundef(styles.w)) styles.w = CSZ;
	if (nundef(styles.h)) styles.h = styles.w * .65;
	return cBlank(dParent, styles, id);
}
function cPortrait(dParent, styles = {}, id) {
	if (nundef(styles.h)) styles.h = CSZ;
	if (nundef(styles.w)) styles.w = styles.h * .7;

	return cBlank(dParent, styles, id);
}
function cBlank(dParent, styles={}, id) {
	if (nundef(styles.h)) styles.h = CSZ;
	if (nundef(styles.w)) styles.w = styles.h * .7;
	if (nundef(styles.bg)) styles.bg = 'white';
	styles.position = 'relative';

	let [w, h, sz] = [styles.w, styles.h, Math.min(styles.w, styles.h)];
	if (nundef(styles.rounding)) styles.rounding = sz * .05;

	let d = mDiv(dParent, styles, id, null, 'card');

	let item = mItem(null, { div: d }, { type: 'card', sz: sz, rounding: styles.rounding }, false);
	copyKeys(styles, item);
	return item;
}
function cTitleArea(card, h, styles, classes) {
	let dCard = iDiv(card);

	let dTitle = mDiv(dCard, { w: '100%', h: h, overflow: 'hidden', upperRounding: card.rounding });
	let dMain = mDiv(dCard, { w: '100%', h: card.h - h, lowerRounding: card.rounding });
	iAdd(card, { dTitle: dTitle, dMain: dMain });
	if (isdef(styles)) mStyle(dTitle, styles);
	return [dTitle, dMain];

}
function makeInfobox(ev, elem, scale) {
	let t = ev.target; while (isdef(t) && t != elem) t = t.parentNode; if (nundef(t)) { console.log('WRONG click', ev.target); return; }
	//let t = ev.target; if (ev.target != elem) {console.log('WRONG click',ev.target); return;}

	console.log('ok');
	let di = DA.infobox; if (isdef(di)) {
		let inner = di.innerHTML;
		console.log('removing!');
		di.remove();
		DA.infobox = null;
		if (inner == elem.innerHTML) return;
	}
	let r = getRectInt(elem, dTable);
	let d = DA.infobox = mDiv(dTable, {
		bg: 'black', rounding: 10, fz: 24, position: 'absolute',
		w: r.w, h: r.h, left: r.l, top: r.t, transform: `scale(${scale})`
	}, 'dInfoBox', elem.innerHTML);
	d.innerHTML += '<div style="font-size:6px">click to close</div><br>';
	d.onclick = () => { d.remove(); DA.infobox = null; }
}
function makeNumberSpan(n, bg, fg, fz, rounding = '50%') {
	return `<span style='font-size:${fz}px;background:${bg};color:${fg};padding:1px 7px;border-radius:${rounding}'>${n}</span>`;
}
function makeSymbolSpan(info, bg, fg, fz, rounding = '50%') {
	//console.log('makeSymbol',bg,fg,fz)
	//return `<span style='background:${bg};padding:2px 10px;font-family:${info.family}'>${info.text}</span>`;
	// sp = `
	// <div style="display: inline-flex; place-content: center; flex-wrap: wrap; width: ${fz * 1.5}px; height: ${fz * 1.35}px;
	// 	font-size: ${fz}px; background: ${bg};color: ${fg}; border-radius: 50%;">
	// 	<div style="font-family: ${info.family}; font-size: ${fz}px;display: inline-block;">${info.text}</div>
	// </div>`;
	// return `<span style='line-height: 125%;font-family:${info.family};font-size:${fz}px;background:${bg};color:${fg};padding:1px 7px;border-radius:${rounding}'>${info.text}</span>`;
	return `<div style='box-sizing:border-box;padding:6px 7px 4px 7px;min-height:22px;display:inline-block;font-family:${info.family};font-size:${fz}px;background:${bg};color:${fg};border-radius:${rounding}'>${info.text}</div>`;
}
function mSymSizeToH(info, h) { let f = h / info.h; return { fz: 100 * f, w: info.w * f, h: h }; }
function mSymSizeToW(info, w) { let f = w / info.w; return { fz: 100 * f, w: w, h: info.h * f }; }
function mSymSizeToFz(info, fz) { let f = fz / 100; return { fz: fz, w: info.w * f, h: info.h * f }; }
function mSymSizeToBox(info, w, h) {
	//console.log('mSymSizeToBox', w, h, '\ninfo:', info.w, info.h);
	let fw = w / info.w;
	let fh = h / info.h;
	let f = Math.min(fw, fh);
	//console.log('fw', fw, '\nfh', fh, '\nf', f);
	return { fz: 100 * f, w: info.w * f, h: info.h * f };
}
function mPlaceText(text, where, dParent, styles, innerStyles, classes) {
	//where can be: [w,h,'tl'] or margins: [t,r,b,l]
	let box;
	if (where.length == 4) {
		let [t, r, b, l] = where;
		box = mBoxFromMargins(dParent, t, r, b, l);
	} else if (where.length == 3) {
		let [wb, hb, place] = where;
		box = mDiv(dParent, { w: wb, h: hb });
		mPlace(box, place);
	}
	let r = mMeasure(box);
	//text = 'das ist ein sehr langer text ich hoffe er ist auf jeden fall zu lang fuer diese box. denn wenn nicht ist es ein echtes problem. dann muss ich einen anderen test machen!';
	let [fz, w, h] = fitFont(text, 20, r.w, r.h);
	console.log('res', fz, w, h);
	let dText = mDiv(box, {
		w: w, h: h, fz: fz,
		position: 'absolute', transform: 'translate(-50%,-50%)', top: '50%', left: '50%'
	}, null, text);
	if (isdef(styles)) mStyle(box, styles);
	if (isdef(innerStyles)) mStyle(dText, innerStyles);
	if (isdef(classes)) mStyle(box, classes);
	return box;
}

function mFillText(text, box, padding = 10) {
	let r = mMeasure(box);

	//text = 'das ist ein sehr langer text ich hoffe er ist auf jeden fall zu lang fuer diese box. denn wenn nicht ist es ein echtes problem. dann muss ich einen anderen test machen!';
	let [fz, w, h] = fitFont(text, 20, r.w - padding, r.h - padding);
	//console.log('res', fz,w,h);
	let dText = mDiv(box, {
		w: w, h: h, fz: fz,
		position: 'absolute', transform: 'translate(-50%,-50%)', top: '50%', left: '50%'
	}, null, text);
	//if (isdef(styles)) mStyle(box,styles);
	//if (isdef(innerStyles)) mStyle(dText,innerStyles);
	//if (isdef(classes)) mStyle(box,classes);
	return dText;

}













