function addDummy(dParent) {
	let dummy = mCreate('button');
	mAppend(dParent, dummy);
	mStyle(dummy, { position: 'absolute', opacity: 0, h: 0, w: 0, padding: 0, margin: 0, outline: 'none', border: 'none', bg: 'transparent' });
	dummy.id = 'dummy';

}
function loadCodebase(o = {}) {
	o = JSON.stringify(o);
	var xml = new XMLHttpRequest();
	xml.onload = function () {
		if (xml.readyState == 4 || xml.status == 200) {
			loadCodebaseResult(xml.responseText);
		} else { console.log('WTF?????') }
	}
	xml.open("POST", "api.php", true);
	xml.send(o);

}
function loadCodebaseResult(result) {
	let obj = JSON.parse(result);
	//console.log('result',result);
	DA.all = jsyaml.load(obj.all);
	DA.allcode = jsyaml.load(obj.allcode);
	DA.allhistory = jsyaml.load(obj.allhistory);
	Syms = jsyaml.load(obj.syms);
	SymKeys = Object.keys(Syms);
	ByGroupSubgroup = jsyaml.load(obj.symGSG);
	C52 = jsyaml.load(obj.c52);
	Cinno = jsyaml.load(obj.cinno);
	Info = jsyaml.load(obj.info);
	Sayings = jsyaml.load(obj.sayings);
	create_card_assets_c52();
	KeySets = getKeySets();

	CODE.di = DA.all;
	CODE.justcode = DA.allcode;
	CODE.codelist = dict2list(CODE.justcode, 'key');
	CODE.history = DA.allhistory;
	let keys = {};
	for (const k in CODE.di) { for (const k1 in CODE.di[k]) keys[k1] = CODE.di[k][k1]; }
	CODE.all = keys;
	CODE.keylist = Object.keys(keys)
	CODE.keysSorted = CODE.keylist;

}
function lookupToggle(o, list) {
	let x = lookup(o, list);
	let val = !x;
	lookupSetOverride(o, list, val);
	return val;
}
function mButton(caption, handler, dParent, styles = {}, opts = {}) {
	addKeys({ bg: '#00000080', hpadding: 10, vpadding: 4, rounding: 8, cursor: 'pointer' }, styles);
	addKeys({ html: caption, onclick: handler, className: 'hop1' }, opts);
	return mDom(dParent, styles, opts);
}
function mDom(dParent, styles = {}, opts = {}) {
	let tag = valf(opts.tag, 'div');
	let d = document.createElement(tag);
	mAppend(dParent, d);
	if (tag == 'textarea') styles.wrap = 'hard';
	const aliases = {
		classes: 'className',
		inner: 'innerHTML',
		html: 'innerHTML',

	};
	if (opts.editable) {
		d.setAttribute('contentEditable', true);
		mStyle(d, { overflow: 'hidden' })
		mClass(d, 'plain');
		d.addEventListener('keydown', (ev) => {
			if (ev.key === 'Enter') {
				ev.preventDefault();
				//if (nundef(mBy('dummy'))) mButton('', null, dTestButtons, { position:'absolute',opacity: 0, h: 0, w: 0, padding: 0, margin: 0, outline: 'none', border: 'none', bg: 'transparent' },{id:'dummy'});
				mBy('dummy').focus();
				// mBy('dummy').focus();
			}
		});
		// d.onkeyup = ev=>{if (ev.key == 'Enter') d.parentNode.focus();}
	}
	if (nundef(opts.onclick) && opts.selectOnClick) {
		if (opts.editable) {
			opts.onclick = ev => selectText(ev.target);
		} else if (tag == 'input' || tag == 'textarea') {
			//if (tag != 'input' && tag != 'textarea') d.setAttribute('contentEditable', true); //opts.contenteditable=true;
			opts.onclick = ev => ev.target.select();
		}
	}

	for (const opt in opts) { d[valf(aliases[opt], opt)] = opts[opt] };
	mStyle(d, styles);
	return d;
}
function mDomRest(dParent, styles, opts) {
	if (nundef(styles.w) && nundef(styles.w100)) addKeys({ wrest: true }, styles);
	if (nundef(styles.h) && nundef(styles.h100)) addKeys({ hrest: true }, styles);
	return mDom(dParent, styles, opts);
}
function mDom100(dParent, styles, opts) {
	if (nundef(styles.w) && nundef(styles.wrest)) addKeys({ w100: true }, styles);
	if (nundef(styles.h) && nundef(styles.hrest)) addKeys({ h100: true }, styles);
	return mDom(dParent, styles, opts);
}
function mInput(dParent, styles = {}, opts = {}) {
	addKeys({ fz: 'inherit', fg: 'inherit', 'flex-grow': 1, bg: '#00000080', hpadding: 10, vpadding: 4, rounding: 8 }, styles);
	addKeys({ id: 'inpSearch', name: 'searchResult', className: 'hop1 plain', type: 'text', tag: 'input' }, opts);
	return mDom(dParent, styles, opts);

}
function mSearch(label, handler, dParent, styles = {}, opts = {}) {
	let html = `
    <form action="javascript:void(0);" autocomplete="off">
		<label>${label}</label>
    </form>
  `;
	let elem = mCreateFrom(html);
	mAppend(dParent, elem);
	mStyle(elem, { display: 'grid', 'align-items': 'center', w100: true, gap: 4, 'grid-template-columns': 'auto 1fr auto' });
	//mStyle(elem, { display: 'grid', w100: true, gap: 4, 'grid-template-columns': 'auto 1fr auto' });

	let inp = mInput(elem, styles, opts);

	let myhandler = () => handler(mBy(inp.id).value.trim()); // handler(toWords(mBy(inp.id).value));
	mButton('GO', myhandler, elem);
	elem.onsubmit = myhandler;

	return elem;
}
function myOnclickCodeInSidebar(ev) {
	let key = isString(ev) ? ev : ev.target.innerHTML;
	let text = CODE.justcode[key];
	AU.ta.value = text;
	let download = false;
	if (download) downloadAsText(text, 'hallo', 'js');
	return text;
}
function mySearch(kws) {
	//kws should be a string
	assertion(isString(kws), 'mySearch: kws should be a string')
	console.log(`'${kws}'`);
	ohneRegexMix(kws); //return;//keyPlusMinus(); return;
}
function ohneRegexMix(s) {
	let arr = CODE.codelist;
	//s=`-e +fi`
	let ws = parseSearchString(s);
	let [sno, syes, smay] = [[], [], []];
	for (const w of ws) {
		if (w[0] == '-') sno.push(w.substring(1));
		else if (w[0] == '+') syes.push(w.substring(1));
		else smay.push(w);
	}

	let res = [];
	let opts = lookup(CODE, ['searchOptions', 'case']) == true ? '' : 'i';
	let prop = lookup(CODE, ['searchOptions', 'fulltext']) == true ? 'value' : 'key';
	let prefix = lookup(CODE, ['searchOptions', 'where']); // == true ? 'value' : 'key';

	for (const el of arr) {
		let text = el[prop]; //or x.value
		if (sno.some(x => text.includes(x))) continue;
		if (syes.some(x => !text.includes(x))) continue;
		let patt = smay.join('|');
		if (prefix) patt = '\\b' + patt;
		let regex = new RegExp(patt, opts);
		if (regex.test(text)) res.push(el.key);
		//if (!isEmpty(syes) || smay.some(x => text.includes(x))) res.push(el.key);
	}
	CODE.selectedKeys = res; // arr.filter(x => regex.test(x.key)).map(x => x.key);
	console.log('res', res.length > 20 ? res.length : res)
	if (!isEmpty(res)) show_sidebar(res, myOnclickCodeInSidebar); //console.log('keys', res);
}
function onclickCase(ev) {
	let val = lookupToggle(CODE, ['searchOptions', 'case']);
	let b = ev.target;
	b.innerHTML = val ? 'case-sensitive' : 'insensitive';
}
function onclickCodeInSidebar(ev) {
	let key = isString(ev) ? ev : ev.target.innerHTML;
	let text = CODE.justcode[key];

	let ta = AU.ta; let dParent = null;
	if (nundef(ta)) {
		dParent = valf(dFiddle, dTable, document.body);
		let talist = dParent.getElementsByTagName('textarea');
		if (isEmpty(talist)) ta = mTextarea(null, null, dParent, { w: '100%' });
		else ta = talist[0];
	} else dParent = ta.parentNode;
	ta.value = text;
	let hideal = ta.scrollHeight;
	console.log('ta.scrollheight', hideal)

	//wie gross soll dParent sein? h sowie sidebar
	let hsidebar = window.innerHeight - 128; // getComputedStyle(dSidebar, 'height');
	mStyle(dParent, { hmax: hsidebar });

	let lines = text.split('\n');
	let min = lines.length + 1;

	mStyle(ta, { h: hideal, hmin: 50, hmax: hsidebar - 24 });
	ta.scrollTop = 0;

	let download = false;
	if (download) downloadAsText(text, 'hallo', 'js');
	return text;
}
function onclickFulltext(ev) {
	let val = lookupToggle(CODE, ['searchOptions', 'fulltext']);
	let b = ev.target;
	b.innerHTML = val ? 'fulltext' : 'name';
}
function onclickWhere(ev) {
	let val = lookupToggle(CODE, ['searchOptions', 'where']);
	let b = ev.target;
	b.innerHTML = val ? 'start' : 'anywhere';
}
function onclickTest(x) {
	x=runcode(mBy('ta').value)
	console.log('TEST!', x)
}
function parseSearchString(s, sAllow = '+-_') { return toWordsX(s, sAllow); }
function rColorTrans(opaPer = 100, lumPer = 70, satPer = 100, hue) {
	if (isList(hue) && hue.length > 2) {
		//interpret as choose one of these hues
		hue = rChoose(hue);
	} else if (isList(hue)) {
		//interpret as range min,max
		hue = Math.random() * (hue[1] - hue[0]) + hue[0];
	} else if (isdef(hue)) {
		//interpret as modulo
		hue = divInt(rHue(), hue) * hue;
	} else hue = Math.round(Math.random() * 360);
	//console.log('hue', hue)
	return hslToHslaString(hue, satPer, lumPer, opaPer / 100);
}
function runcode(code, callback = null) {
	let x = eval(code);
	if (callback) callback(x);
	else {
		console.log('===>result:', x);
		if (isdef(dMessage)) dMessage.innerHTML = isDict(x) ? JSON.stringify(x) : isdef(x) ? x.toString() : x;
	}
}
function selectText(el) {
	var sel, range;
	//var el = document.getElementById(id); //get element id
	if (window.getSelection && document.createRange) { //Browser compatibility
		sel = window.getSelection();
		if (sel.toString() == '') { //no text selection
			window.setTimeout(function () {
				range = document.createRange(); //range object
				range.selectNodeContents(el); //sets Range
				sel.removeAllRanges(); //remove all ranges from selection
				sel.addRange(range);//add Range to a Selection.
			}, 1);
		}
	} else if (document.selection) { //older ie
		sel = document.selection.createRange();
		if (sel.text == '') { //no text selection
			range = document.body.createTextRange();//Creates TextRange object
			range.moveToElementText(el);//sets Range
			range.select(); //make selection.
		}
	}
}
function show_coding_ui() {
	let d = document.body; mClass(d, 'fullpage airport'); //addDummy(d);
	//mStyle(d,{hmax:'100%'})
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
	dPage = mGridFrom(d, areas, cols, rows, { hmax:'96%',padding: 4, box: true, bg: bg, fg: fg });

	let elem = mSearch('keywords:', mySearch, dSearch, {}, { selectOnClick: true });
	let bs = mDiv(elem, { 'grid-column': '1 / span 3', display: 'flex', gap: 4 });
	mButton('name', onclickFulltext, bs, { align: 'center', w: 110 });
	mButton('insensitive', onclickCase, bs, { align: 'center', w: 210 });
	mButton('anywhere', onclickWhere, bs, { align: 'center', w: 210 });

	mStyle(dFiddle, { h:800,bg:GREEN });
	mDom(dFiddle, {}, { html: 'Edit Code:' });
	AU.ta = mDom(dFiddle, { fz: 18, family: 'consolas', w100: true, box: true, h: 'rest', bg: colorTrans(bg, 1), fg: 'black' }, { tag: 'textarea', id: 'ta', className: 'plain' });

	mFlex(dTestButtons);
	mButton('TEST', onclickTest, dTestButtons); //mDom(dTestButtons, { bg: bg, hpadding: 10, vpadding: 4, rounding: 8, cursor: 'pointer' }, { onclick: onclickTest, className: 'hop1', html: 'TEST' });

	addEventListener('keydown',execute_on_control_enter)
	//mDom(dTable, {margin:10,bg:'#222'}, { html: 'HAAAAAAAAAALLLLLLLLLOOOOOO', editable: true, selectOnClick: true });
	//dUnten = mDiv(dTable, {box:true,w:'100%',h:400,bg:'#222'});
}
function sortClassKeys(di) {
	let classes = dict2list(di.cla, 'key');
	let classesWithoutExtends = classes.filter(x => !x.code.includes(' extends '));

	let keys = sortCaseInsensitive(classesWithoutExtends.map(x => x.key));
	let dinew = {};
	for (const el of keys) { dinew[el] = di.cla[el]; }

	let classesWithExtends = classes.filter(x => x.code.includes(' extends '));

	let MAX = 150, i = 0;
	console.log('starting class loop')
	while (!isEmpty(classesWithExtends)) {
		if (++i > MAX) { console.log("WRONG!!!"); return []; }
		let o = classesWithExtends.find(x => {
			let ext = firstWordAfter(x.code, 'extends', true).trim();
			if (nundef(di.cla[ext])) return true; //Array
			//console.log('extends:', ext);
			return isdef(dinew[ext]);
		});
		if (isdef(o)) { dinew[o.key] = o; removeInPlace(classesWithExtends, o); }
	}
	return Object.keys(dinew);
}
function sortConstKeys(di) {
	let tbd = dict2list(di.const, 'key');
	let donelist = [];

	tbd = sortBy(tbd, x => x.code.length); //sortCaseInsensitive(tbd.map(x => x.key));
	//console.log('tbd',tbd)
	let dinew = {};

	//let keystbd=tbd.map(x=>x.key);
	let MAX = 3000, i1 = 0, i2 = 0, i3 = 0;
	console.log('starting const loop');
	console.log('const keys', tbd.length);
	while (!isEmpty(tbd)) {
		if (++i1 > MAX) { console.log("WRONG!!!"); return donelist; }

		//find a key in keystbd which code does NOT contain any other const
		let o = null;
		i2 = 0;
		for (const c of tbd) {
			if (++i2 > MAX) { console.log("WRONG!!!"); return donelist; }
			i3 = 0;
			let ok = true;
			for (const c1 of tbd) {
				if (++i3 > MAX) { console.log("WRONG!!!"); return donelist; }
				//if (c1.key == 'BRAUN' && c.key == 'ColorDict') console.log('BRAUN!!!',c1)
				if (c1 == c) continue;
				if (c.code.includes(c1.key)) ok = false;
			}
			//if (c.key == 'ColorDict') console.log('ColorDict ok',ok);
			if (ok) { o = c; break; }
		}

		//let o = tbd.find(x => tbd.every(y => y.key != x.key && !x.code.includes(y.key)));
		//console.log('o',o)
		if (isdef(o)) { donelist.push(o); dinew[o.key] = o; removeInPlace(tbd, o); } // console.log('removing',o.key); }
	}

	return donelist; //dinew; //Object.keys(dinew);
}
function stringMinusLast(s, n = 1) {
	return s.substring(0, s.length - n);
}
function toWordsX(s, sAllow = '_') {
	let special = ['-', '.', '*', '?', '!'];
	let s1 = '';
	for (let i = 0; i < sAllow.length; i++) {
		let ch = sAllow[i];
		s1 += (special.includes(ch) ? '\\' : '') + ch + '|';
	}
	s1 = stringMinusLast(s1);
	let arr = s.split(new RegExp(`[^(\\w|${s1})]`)); ///[^(\w|+|\-|_)]/); // // toWordsX('+hallo -rey das ist ein regal');
	return arr.filter(x => !isEmpty(x));
}
