//#region cardM.js
function mSymFramed(info, bg, sz) {
	let [w, h, fz] = [sz, sz, sz * .7];
	return createElementFromHTML(`<div style='
	text-align:center;display:inline;background-color:${bg};
	font-size:${fz}px;overflow:hidden;
	font-family:${info.family}'>${info.text}</div>`);
}



//#region svg zeug
function mgPos(card, el, x = 0, y = 0, unit='%',anchor='center') {
	mAppend(iG(card), el);
	let box = el.getBBox();
	console.log('rect',box);
	// if (unit == '%'){
	// 	x=x*card.w/100;
	// 	y=y*card.h/100;
	// }
	// if (anchor == 'center'){
	// 	let [w, h] = [box.width, box.height];
	// 	console.log('w',w,'h',h)
	// 	x -= w/2;
	// 	y -= h/2;
	// }
	el.setAttribute('x', x);
	el.setAttribute('y', y);
}
function mgSize(el, h, w) {
	el.setAttribute('height', h);
	if (isdef(w)) el.setAttribute('width', w);
}
function mgSuit(key) {
	// let svg=gCreate('svg');
	let el = gCreate('use');
	el.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#' + key);
	return el;
	// mAppend(svg,el);
	// return svg;
}
function mgSym(key) {
	let el = gCreate('text');
	let info = Syms[key];
	mStyle(el, { family: info.family });
	el.innerHTML = info.text;
	return el;
}
function mgShape(key) {

}

function mgSuit1(card, key, h, x, y) {
	//let el = useSymbol(key, h, x, y);
	el = document.createElementNS('http://www.w3.org/2000/svg', 'use');
	el.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', `#${key}`);
	el.setAttribute('height', h);
	el.setAttribute('width', h);
	el.setAttribute('x', x);
	el.setAttribute('y', y);

	mAppend(iG(card), el);
	return el;

	// let p=iG(card);
	// //p.innerHTML += el.innerHTML;
	// el = createElementFromHTML(el);
}
function useSymbolElemNO(key = 'Treff', h = 50, x = 0, y = 0) {
	return createElementFromHTML(`<use xlink:href="#${key}" height="${h}" x="${x}" y="${y}"></use>`);
}


function fitSvg(el) {
	const box = el.querySelector('text').getBBox();
	el.style.width = `${box.width}px`;
	el.style.height = `${box.height}px`;
}
function cBlankSvg(dParent, styles = {}) {
	if (nundef(styles.h)) styles.h = CSZ;
	if (nundef(styles.w)) styles.w = styles.h * .7;
	if (nundef(styles.bg)) styles.bg = 'white';
	styles.position = 'relative';

	let [w, h, sz] = [styles.w, styles.h, Math.min(styles.w, styles.h)];
	if (nundef(styles.rounding)) styles.rounding = sz * .05;

	let d = mDiv(dParent, styles, null, null, 'card');
	let svg = mgTag('svg', d, { width: '100%', height: '100%' }); //,background:'transparent'});
	let g = mgTag('g', svg);
	//let sym = mSymFramed(Syms['bee'], 'skyblue', sz / 4); mAppend(d, sym);

	let item = mItem(null, { div: d, svg: svg, g: g }, { type: 'card', sz: sz }, false);
	copyKeys(styles, item);
	return item;
}

//#endregion



//hier kann man jede belibige card anfertigen lassen!
function mSymbol(key, dParent, sz, styles = {}) {

	console.log('key', key)
	let info = symbolDict[key];

	//ich brauche einen size der macht dass das symbol in sz passt
	fzStandard = info.fz;
	hStandard = info.h[0];
	wStandard = info.w[0];

	//fzStandard/fz = hStandard/sz= wStandard/wz;
	//fzStandard = fz*hStandard/sz= fz*wStandard/wz;
	//fzStandard = fz*hStandard/sz= fz*wStandard/wz;

	let fzMax = fzStandard * sz / Math.max(hStandard, wStandard);
	fzMax *= .9;


	let fz = isdef(styles.fz) && styles.fz < fzMax ? styles.fz : fzMax;

	let wi = wStandard * fz / 100;
	let hi = hStandard * fz / 100;
	let vpadding = 2 + Math.ceil((sz - hi) / 2); console.log('***vpadding', vpadding)
	let hpadding = Math.ceil((sz - wi) / 2);

	let margin = '' + vpadding + 'px ' + hpadding + 'px'; //''+vpadding+'px '+hpadding+' ';

	let newStyles = deepmergeOverride({ fz: fz, align: 'center', w: sz, h: sz, bg: 'white' }, styles);
	newStyles.fz = fz;
	let d = mDiv(dParent, newStyles);

	console.log(key, info)
	//let fz=sz;
	//if (isdef(styles.h)) styles.fz=info.h[0]*
	let txt = mText(info.text, d, { family: info.family });

	console.log('-----------', margin, hpadding, vpadding);
	mStyle(txt, { margin: margin, 'box-sizing': 'border-box' });

	return d;
}

function fitFont(text, fz = 20, w2 = 200, h2 = 100) {
	let e1, e2, r1, r2;
	e1 = mDiv(dTable, { w: w2, h: h2, display:'inline-block' });
	do {
		e2 = mDiv(e1, { fz: fz, display:'inline-block' }, null, text);
		r1 = getRect(e1);
		r2 = getRect(e2);
		e2.remove();
		//console.log('e1', r1.w, r1.h, 'e2', r2.w, r2.h, 'fz',fz);
		fz -= 1;
	} while (r1.w * r1.h < r2.w * r2.h);
	e1.remove();

	return [fz + 1, r2.w, r2.h];

}

function makeInnoSymbolDiv(info,bg,fz=20){

	return `<div style='text-align:center;display:inline;background-color:${bg};width:40px;padding:2px ${fz/2}px;
	font-size:${fz}px;font-family:${info.family}'>${info.text}</div>`;
}
function makeInnoNumberDiv(n,fz){
	return `<span style='background:white;color:black;padding:2px 10px;border-radius:50%'>${n}</span>`;
}
function mSymInline(key,dParent,styles){
	let info = Syms[key];
	styles.family = info.family;
	let el = mSpan(dParent,styles,null,info.text);
	return text;
}
function innoSymInline(key,dParent){
	//let box = mSpan(dParen,bg: INNO.sym[key].bg, rounding: 10t, { bg: INNO.sym[key].bg, rounding: 10 }); mPlace(box, pos, 10);

	s = mSymInline(INNO.sym[key].key, dParent, { fg: INNO.sym[key].fg,bg: INNO.sym[key].bg, rounding: 10 });
	return s;
}


function cardInno1(key, wCard = 420) {
	if (nundef(key)) key = chooseRandom(Object.keys(Cinno));

	let f = wCard / 420;
	let [w, h, szSym, paSym, fz, pa, bth, vGapTxt, rnd, gap] = [420 * f, 200 * f, 100 * f, 8 * f, 100 * f * .8, 20 * f, 4 * f, 8 * f, 10 * f, 6 * f].map(x => Math.ceil(x));

	//key = 'Flight';
	let info = Cinno[key];
	info.key = key;

	let cdict = { red: RED, blue: 'royalblue', green: 'green', yellow: 'yelloworange', purple: 'indigo' };
	info.c = getColorDictColor(cdict[info.color]);

	//make empty card with dogmas on it
	let d = mDiv();
	mSize(d, w, h);
	//let szSym = 50; let fz = szSym * .8;

	mStyle(d, { fz: pa, margin: 8, align: 'left', bg: info.c, rounding: rnd, patop: paSym, paright: pa, pabottom: szSym, paleft: szSym + paSym, border: '' + bth + 'px solid silver', position: 'relative' })
	mText(info.key.toUpperCase(), d, { fz: pa, weight: 'bold', margin: 'auto' });
	mLinebreak(d);
	for (const dog of info.dogmas) {
		//console.log(dog);
		let text = replaceSymbols(dog);
		let d1 = mText(text, d); //,{mabot:14});
		d1.style.marginBottom = '' + vGapTxt + 'px';
		//mLinebreak(d);
	}

	let syms = []; let d1;

	szSym -= gap;

	//info.syms = info.resources.map(x => x == 'clock' ? 'watch' : x); //if (key == 'clock') key='watch';
	let sdict = {
		tower: { k: 'white-tower', bg: 'dimgray' }, clock: { k: 'watch', bg: 'navy' }, crown: { k: 'crown', bg: 'black' },
		tree: { k: 'tree', bg: GREEN },
		bulb: { k: 'lightbulb', bg: 'purple' }, factory: { k: 'factory', bg: 'red' }
	};
	for (const s in sdict) { sdict[s].sym = Syms[sdict[s].k]; }

	for (const sym of info.resources) {
		let isEcho = false;
		if (sym == 'None') {
			//einfach nur das age als text
			//console.log('age of card:', info.age)
			//mTextFit(text, { wmax, hmax }, dParent, styles, classes)
			d1 = mDiv(d, { fz: fz * .75, fg: 'black', bg: 'white', rounding: '50%', display: 'inline' });
			let d2 = mText('' + info.age, d1, {});
			mClass(d2, 'centerCentered');
		} else if (sym == 'echo') {
			let text = info.echo;
			console.log('info.echo',info.echo);
			if (isList(info.echo)) text = info.echo[0];
			text=replaceSymbols(text);
			//console.log('Echo!!! info', info);
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
function placeSymbol(sym, szSym, margin, posStyles) {
	let d = iDiv(sym);
	posStyles.position = 'absolute';
	posStyles.margin = margin;
	posStyles.h = szSym;
	posStyles.w = szSym; //sym.isEcho ? szSym * 3 : szSym;
	mStyle(d, posStyles); // { position: 'absolute', w: w, h: szSym, left: left, top: top, margin: margin });
}


class Karte {
	static random(sym = 'bee', h = 220) {
		return Karte.get(sym, h);

		return Card52.random();
	}

	static c1(info, n, fg, h, w) {

		let d = mDiv();
		let svg = mgTag('svg',d, { class: 'card', face: '2C', height: '100%', width: '100%', preserveAspectRatio: 'none', viewBox: "-120 -168 240 336" });

		// let idN = fg + n;
		// let prefabN = mgTag('symbol', svg, { id: idN, viewBox: "-500 -500 1000 1000", preserveAspectRatio: "xMinYMid" });
		// let t = mgTag('text', prefabN, { 'text-anchor': "middle", 'dominant-baseline': "middle", x: 0, y: 0, fill: fg }, { fz: 1000 }, n);

		// let idSym = info.E;
		// let prefabSym = mgTag('symbol', svg, { id: idSym, viewBox: "-500 -500 1000 1000", preserveAspectRatio: "xMinYMid" });
		// t = mgTag('text', prefabSym, { 'text-anchor': "middle", 'dominant-baseline': "middle", x: 0, y: 0, fill: fg },
		// 	{ fz: (info.family == 'emoNoto' ? 750 : 1000), family: info.family }, info.text);

		let g = mgTag('g',svg);
		let rect = mgTag('rect', g, { width: 239, height: 335, x: -120, y: 168, rx: 12, ry: 12, fill: "white", stroke: "black" });
		let t = mgTag('text', g, { 'text-anchor': "middle", 'dominant-baseline': "middle", x: 0, y: 0, fill: fg }, { fz: 1000 }, 'HALLO');

		// let elNumber = mgTag('use', svg, { 'xlink:href': `#${idN}`, height: 42, x: -120, y: -156 });

		if (nundef(w)) w = h * .7;
		if (isdef(h) || isdef(w)) { mSize(d, w, h); }

		console.log('d',d)
		return { key: getUID(), div: d, w: w, h: h, faceUp: true }; //this is a card!

	}
	static card(info, n, fg, h, w) {

		let x = `
		<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="card" 
			face="2C" height="100%" preserveAspectRatio="none" viewBox="-120 -168 240 336" width="100%">
			<symbol id="${fg}${n}" viewBox="-500 -500 1000 1000" preserveAspectRatio="xMinYMid">
				<text text-anchor="middle" dominant-baseline="middle" x="0" y="0" fill="${fg}" style="font-size:1000px;font-weight:bold;">${n}</text>				
			</symbol>
			<symbol id="${info.E}" viewBox="-500 -500 1000 1000" preserveAspectRatio="xMinYMid">
				<text text-anchor="middle" dominant-baseline="middle" x="0" y="-150" fill="red" style="font-size:750px;font-family:${info.family};">${info.text}</text>				
			</symbol>
			<rect width="239" height="335" x="-119.5" y="-167.5" rx="12" ry="12" fill="white" stroke="black"></rect>`;


		//calc coordinates!
		//min x [-120 120]
		//y [-156 156]
		//what should be next?
		//upper left=  
		let h1 = { xs: 24, s: 27, m: 42, l: 60, xl: 70, xxl: 100 };

		let left = [0, 50, 100, 120];
		// mid->left: 
		let upperLeftNumber = `<use xlink:href="#${fg}${n}" height="42" x="-120" y="-156"></use>`
			`<use xlink:href="#${info.E}" height="26.769" x="-111.784" y="-119"></use>
			<use xlink:href="#${info.E}" height="70" x="-35" y="-135.588"></use>
			<g transform="rotate(180)">
				<use xlink:href="#${fg}${n}" height="42" x="-120" y="-156"></use>
				<use xlink:href="#${info.E}" height="26.769" x="-111.784" y="-119"></use>
				<use xlink:href="#${info.E}" height="70" x="-35" y="-135.588"></use>
			</g>
		</svg>`;

		let svgCode = x;
		svgCode = '<div>' + svgCode + '</div>';
		let el = createElementFromHTML(svgCode);
		if (nundef(w)) w = h * .7;
		if (isdef(h) || isdef(w)) { mSize(el, w, h); }
		return { key: getUID(), div: el, w: w, h: h, faceUp: true }; //this is a card!

	}

	static get52(suit, rank, fg, bg, h, w, faceUp) {
		//suit is a key into Syms including
		//rank is a number 0,1.... or TJQKA or some other letter or * for joker 
		let key = suit.toLowerCase();
		let di = {
			h: 'hearts', s: 'spades', p: 'spades', c: 'clubs', t: 'clubs', d: 'diamonds', k: 'diamonds',
			j: 'joker', '*': 'joker'
		};
		if (isdef(di[key])) key = di[key];
		let di2 = { spades: 'spade suit', hearts: 'heart suit', diamonds: 'diamond suit', clubs: 'club suit' };
		if (isdef(di2[key])) key = di2[key];
		let info = Syms[key];
		//return Karte.c1(info, 2, 'black', 300); MUELL
		//return Karte.card(info, 2, 'black', 300); MUELL
		return Karte.get(key, 300, rank, fg);
		let fz = info.family == 'emoNoto' ? 750 : 1000;
	}

	static get(sym = 'bee', h = 110, n = 2, fg = 'indigo', w) {
		let info = Syms[sym];
		n = 2;
		ensureColorNames();
		if (nundef(fg)) fg = sym == 'spades' || sym == 'clubs' ? 'black' : sym == 'hearts' || sym == 'diamonds' ? 'red' : chooseRandom(Object.keys(ColorNames)); //coin()?'red':'black'; //randomDarkColor();
		let cardKey = info.family == 'emoNoto' ? 'card0' : 'card52';
		let basic = {
			card0: `
				<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="card" 
				face="2C" height="100%" preserveAspectRatio="none" viewBox="-120 -168 240 336" width="100%">
					<symbol id="${fg}${n}" viewBox="-500 -500 1000 1000" preserveAspectRatio="xMinYMid">
						<text text-anchor="middle" dominant-baseline="middle" x="0" y="0" fill="${fg}" style="font-size:1000px;font-weight:bold;">${n}</text>				
					</symbol>
					<symbol id="${info.E}" viewBox="-500 -500 1000 1000" preserveAspectRatio="xMinYMid">
						<text text-anchor="middle" dominant-baseline="middle" x="0" y="-150" fill="red" style="font-size:750px;font-family:${info.family};">${info.text}</text>				
					</symbol>
					<rect width="239" height="335" x="-119.5" y="-167.5" rx="12" ry="12" fill="white" stroke="black"></rect>
					<use xlink:href="#${fg}${n}" height="42" x="-118" y="-156"></use>
					<use xlink:href="#${info.E}" height="26.769" x="-111.784" y="-119"></use>
					<use xlink:href="#${info.E}" height="70" x="-35" y="-135.588"></use>
					<g transform="rotate(180)">
						<use xlink:href="#${fg}${n}" height="42" x="-118" y="-156"></use>
						<use xlink:href="#${info.E}" height="26.769" x="-111.784" y="-119"></use>
						<use xlink:href="#${info.E}" height="70" x="-35" y="-135.588"></use>
					</g>
				</svg>`,
			card52: `
				<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="card" 
				face="2C" height="100%" preserveAspectRatio="none" viewBox="-120 -168 240 336" width="100%">
					<symbol id="${fg}${n}" viewBox="-500 -500 1000 1000" preserveAspectRatio="xMinYMid">
						<text text-anchor="middle" dominant-baseline="middle" x="0" y="0" fill="${fg}" style="font-size:1000px;font-family:opensans;">${n}</text>				
					</symbol>
					<symbol id="${info.E}" viewBox="-500 -500 1000 1000" preserveAspectRatio="xMinYMid">
						<text text-anchor="middle" dominant-baseline="middle" x="0" y="50" fill="${fg}" style="font-size:800px;font-family:${info.family};">${info.text}</text>				
					</symbol>
					<rect width="239" height="335" x="-119.5" y="-167.5" rx="12" ry="12" fill="white" stroke="black"></rect>
					<use xlink:href="#${fg}${n}" height="40" x="-116.4" y="-156"></use>
					<use xlink:href="#${info.E}" height="26.769" x="-111.784" y="-119"></use>
					<use xlink:href="#${info.E}" height="70" x="-35" y="-135.588"></use>
					<g transform="rotate(180)">
						<use xlink:href="#${fg}${n}" height="40" x="-116.4" y="-156"></use>
						<use xlink:href="#${info.E}" height="26.769" x="-111.784" y="-119"></use>
						<use xlink:href="#${info.E}" height="70" x="-35" y="-135.588"></use>
					</g>
				</svg>`,
			card7: `
				<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="card" 
				face="2C" height="100%" preserveAspectRatio="none" viewBox="-120 -168 240 336" width="100%">
					<symbol id="VC2" viewBox="-500 -500 1000 1000" preserveAspectRatio="xMinYMid">
						<text text-anchor="middle" dominant-baseline="middle" x="0" y="0" fill="red" style="font-size:750px;font-family:opensans;">A</text>				
					</symbol>
					<rect width="239" height="335" x="-119.5" y="-167.5" rx="12" ry="12" fill="white" stroke="black"></rect>
					<use xlink:href="#VC2" height="32" x="-114.4" y="-156"></use>
					<use xlink:href="#VC2" height="26.769" x="-111.784" y="-119"></use>
					<use xlink:href="#VC2" height="70" x="-35" y="-135.588"></use>
					<g transform="rotate(180)">
						<use xlink:href="#VC2" height="32" x="-114.4" y="-156"></use>
						<use xlink:href="#VC2" height="26.769" x="-111.784" y="-119"></use>
						<use xlink:href="#VC2" height="70" x="-35" y="-135.588"></use>
					</g>
				</svg>`,
			card6: `
				<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="card" 
				face="2C" height="100%" preserveAspectRatio="none" viewBox="-120 -168 240 336" width="100%">
					<symbol id="VC2" viewBox="-500 -500 1000 1000" preserveAspectRatio="xMinYMid">
						<text text-anchor="middle" dominant-baseline="middle" x="0" y="0" fill="red" style="font-size:750px;font-family:opensans;">A</text>				
					</symbol>
					<rect width="239" height="335" x="-119.5" y="-167.5" rx="12" ry="12" fill="white" stroke="black"></rect>
					<use xlink:href="#VC2" height="32" x="-114.4" y="-156"></use>
				</svg>`,
			card5: `
				<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="card" 
				face="2C" height="100%" preserveAspectRatio="none" viewBox="-120 -168 240 336" width="100%">
					<symbol id="SC2" viewBox="-600 -600 1200 1200" preserveAspectRatio="xMinYMid">
						<path d="M30 150C35 385 85 400 130 500L-130 500C-85 400 -35 385 -30 150A10 10 0 0 0 -50 150A210 210 0 1 1 -124 -51A10 10 0 0 0 -110 -65A230 230 0 1 1 110 -65A10 10 0 0 0 124 -51A210 210 0 1 1 50 150A10 10 0 0 0 30 150Z" 
							fill="black">
						</path>
					</symbol>
					<symbol id="VC2" viewBox="-500 -500 1000 1000" preserveAspectRatio="xMinYMid">
						<path d="M-225 -225C-245 -265 -200 -460 0 -460C 200 -460 225 -325 225 -225C225 -25 -225 160 -225 460L225 460L225 300" 
							stroke="black" stroke-width="80" stroke-linecap="square" stroke-miterlimit="1.5" fill="none">
						</path>
					</symbol>
					<rect width="239" height="335" x="-119.5" y="-167.5" rx="12" ry="12" fill="white" stroke="black"></rect>
					<use xlink:href="#VC2" height="32" x="-114.4" y="-156"></use>
					<use xlink:href="#SC2" height="26.769" x="-111.784" y="-119"></use>
					<use xlink:href="#SC2" height="70" x="-35" y="-135.588"></use>
					<g transform="rotate(180)">
						<use xlink:href="#VC2" height="32" x="-114.4" y="-156"></use>
						<use xlink:href="#SC2" height="26.769" x="-111.784" y="-119"></use>
						<use xlink:href="#SC2" height="70" x="-35" y="-135.588"></use>
					</g>
					<text text-anchor="middle" dominant-baseline="middle" x="0" y="0" fill="red" style="font-size:16px;font-family:opensans;">I love SVG!</text>				
					<text text-anchor="middle" dominant-baseline="hanging" x="0" y="-156" fill="blue" style="font-size:16px;font-family:opensans;">YES</text>				
					<text text-anchor="middle" dominant-baseline="hanging" x="0" y="-156" fill="green" transform="rotate(180)" style="font-size:16px;font-family:opensans;">YES</text>				
				</svg>`,
			card4: `
				<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="card" 
				face="2C" height="100%" preserveAspectRatio="none" viewBox="-120 -168 240 336" width="100%">
					<symbol id="VC2" viewBox="-500 -500 1000 1000" preserveAspectRatio="xMinYMid">
						<text dominant-baseline="hanging" text-anchor="middle" x="0" y="0" fill="red" style="font-size:600px;font-family:${info.family};">${info.text}</text>				
					</symbol>
					<rect width="239" height="335" x="-119.5" y="-167.5" rx="12" ry="12" fill="white" stroke="black"></rect>

					<use xlink:href="#VC2" height="32" x="-114.4" y="-156" dominant-baseline="hanging" text-anchor="middle" ></use>
					<g transform="rotate(180)">
						<use xlink:href="#VC2" height="32" x="-114.4" y="-156" dominant-baseline="hanging" text-anchor="middle" ></use>
					</g>
					<text dominant-baseline="hanging" text-anchor="middle" x="0" y="0" fill="red" style="font-size:600px;font-family:${info.family};">${info.text}</text>				
					<text text-anchor="middle" dominant-baseline="middle" x="0" y="0" fill="red" style="font-size:16px;font-family:opensans;">I love SVG!</text>				
					<text text-anchor="middle" dominant-baseline="hanging" x="0" y="-156" fill="blue" style="font-size:16px;font-family:opensans;">YES</text>				
					<text text-anchor="middle" dominant-baseline="hanging" x="0" y="-156" fill="green" transform="rotate(180)" style="font-size:16px;font-family:opensans;">YES</text>				
				</svg>`,
			card3: `
				<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="card" 
				face="2C" height="100%" preserveAspectRatio="none" viewBox="-120 -168 240 336" width="100%">
					<rect width="239" height="335" x="-119.5" y="-167.5" rx="12" ry="12" fill="white" stroke="black"></rect>
					<text dominant-baseline="hanging" x="-114" y="-156" fill="red" style="font-size:30px;font-family:${info.family};">${info.text}</text>				
					<text  text-anchor="end" dominant-baseline="hanging" x="114" y="-156" fill="red" style="font-size:30px;font-family:${info.family};">${info.text}</text>				
					<text text-anchor="middle" dominant-baseline="hanging" x="0" y="-156" fill="blue" style="font-size:16px;font-family:opensans;">YES</text>				
					<text text-anchor="middle" dominant-baseline="middle" x="0" y="0" fill="red" style="font-size:16px;font-family:opensans;">I love SVG!</text>				
					<g transform="rotate(180)">
						<text dominant-baseline="hanging" x="-114" y="-156" fill="red" style="font-size:30px;font-family:${info.family};">${info.text}</text>				
						<text  text-anchor="end" dominant-baseline="hanging" x="114" y="-156" fill="red" style="font-size:30px;font-family:${info.family};">${info.text}</text>				
						<text text-anchor="middle" dominant-baseline="hanging" x="0" y="-156" fill="blue" style="font-size:16px;font-family:opensans;">YES</text>				
					</g>
				</svg>`,
			card2: `
				<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="card" 
				face="2C" height="100%" preserveAspectRatio="none" viewBox="-120 -168 240 336" width="100%">
					<symbol id="VC2" viewBox="-500 -500 1000 1000" preserveAspectRatio="xMinYMid">
						<text text-anchor="middle" dominant-baseline="middle" x="0" y="0" fill="red" style="font-size:500px;font-family:${info.family};">${info.text}</text>				
					</symbol>
					<rect width="239" height="335" x="-119.5" y="-167.5" rx="12" ry="12" fill="white" stroke="black"></rect>
					<text dominant-baseline="hanging" x="-114" y="-156" fill="red" style="font-size:30px;font-family:${info.family};">${info.text}</text>				
					<text  text-anchor="end" dominant-baseline="hanging" x="114" y="-156" fill="red" style="font-size:30px;font-family:${info.family};">${info.text}</text>				
					<text text-anchor="middle" dominant-baseline="hanging" x="0" y="-156" fill="blue" style="font-size:16px;font-family:opensans;">YES</text>				
					<text text-anchor="middle" dominant-baseline="middle" x="0" y="0" fill="red" style="font-size:16px;font-family:opensans;">I love SVG!</text>				
					<g transform="rotate(180)">
						<text dominant-baseline="hanging" x="-114" y="-156" fill="red" style="font-size:30px;font-family:${info.family};">${info.text}</text>				
						<text  text-anchor="end" dominant-baseline="hanging" x="114" y="-156" fill="red" style="font-size:30px;font-family:${info.family};">${info.text}</text>				
						<text text-anchor="middle" dominant-baseline="hanging" x="0" y="-156" fill="blue" style="font-size:16px;font-family:opensans;">YES</text>				
					</g>
				</svg>`,
			card1: `
				<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="card" 
				face="2C" height="100%" preserveAspectRatio="none" viewBox="-120 -168 240 336" width="100%">
					<symbol id="VC2">
					</symbol>
					<rect width="239" height="335" x="-119.5" y="-167.5" rx="12" ry="12" fill="white" stroke="black"></rect>
					<use xlink:href="#VC2" height="32" x="-114.4" y="-156"></use>
					<use xlink:href="#VC2" height="32" x="0" y="0"></use>
					<text text-anchor="middle" dominant-baseline="middle" x="0" y="0" fill="red" style="font-size:16px;font-family:opensans;">I love SVG!</text>				
					<g transform="rotate(180)">
						<text dominant-baseline="hanging" x="-114" y="-156" fill="red" style="font-size:30px;font-family:${info.family};">${info.text}</text>				
						<text text-anchor="end" dominant-baseline="hanging" x="114" y="-156" fill="red" style="font-size:30px;font-family:${info.family};">${info.text}</text>				
						<text text-anchor="middle" dominant-baseline="hanging" x="0" y="-156" fill="blue" style="font-size:16px;font-family:opensans;">YES</text>				
					</g>
				</svg>`


		};
		let svgCode = basic[cardKey];
		svgCode = '<div>' + svgCode + '</div>';
		let el = createElementFromHTML(svgCode);
		if (nundef(w)) w = h * .7;
		if (isdef(h) || isdef(w)) { mSize(el, w, h); }
		return { key: getUID(), div: el, w: w, h: h, faceUp: true }; //this is a card!

	}
}
//#endregion

//#region cfactory.js
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

	d0.style.maxHeight = `${CSZ}px`; //HACK!!!!!!!!!!!!!!!

	//console.log('card',dParent);	throw('interrupt!');
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














//#endregion

//#region cgame.js

//convert from number to different kinds of decks: i stands for item
function i52(i) { return isList(i) ? i.map(x => Card52.getItem(x)) : Card52.getItem(i); }
function iFaceUp(item) { Card52.turnFaceUp(item); }
function iFaceDown(item) { Card52.turnFaceDown(item); }
function iFace(item, faceUp) { if (isdef(faceUp)) faceUp ? iFaceUp(item) : iFaceDown(item); }
function iResize52(i, h) { let w = h * .7; return iResize(i, w, h); }
function iTableBounds(i) { return iBounds(i, dTable); }

//presentation of items or item groups(=layouts)
function iAppend52(i, dParent, faceUp) {
	let item = i52(i);
	iFace(item, faceUp);
	mAppend(dParent, item.div);
	return item;
}
function iHand52(i) {
	let hand = iSplay(i, dTable);

}
function iSplay52(i, iContainer, splay = 'right', ov = 20, ovUnit = '%', createiHand = true, rememberFunc = true) {
	let ilist = !isList(i) ? i : [i];
	let items = isNumber(i[0]) ? i52(ilist) : ilist;
	let res = iSplay(items, iContainer, null, 'right', 20, '%', true);
	return res;
}
function netHandSize(nmax, hCard, wCard, ovPercent = 20, splay = 'right') {

	let isHorizontal = splay == 'right' || splay == 'left';
	if (nundef(hCard)) hCard = 110;
	if (nundef(wCard)) wCard = Math.round(hCard * .7);
	return isHorizontal ? { w: wCard + (nmax - 1) * wCard * ovPercent / 100, h: hCard } : { w: wCard, h: hCard + (nmax - 1) * hCard * ovPercent / 100 };
}
function iHandZone(dParent, styles, nmax) {
	if (nundef(styles)) styles = { bg: 'random', rounding: 10 };
	if (isdef(nmax)) {
		console.log('nmax', nmax)
		let sz = netHandSize(nmax);
		styles.w = sz.w;
		styles.h = sz.h;
	}
	//console.log('________________', styles)
	return mZone(dParent, styles);
}
function iSortHand(dParent, h) {
	let d = h.deck;
	//console.log(d.cards());
	d.sort();
	//console.log(d.cards());

	iPresentHand(dParent, h);
}
function iPresentHand(h, dParent, styles, redo = true) {
	//console.log('zone styles',styles)
	if (nundef(h.zone)) h.zone = iHandZone(dParent, styles); else clearElement(h.zone);
	if (nundef(h.iHand)) {
		let items = i52(h.deck.cards());
		//console.log('items',items)
		h.iHand = iSplay(items, h.zone);
	} else if (redo) {
		clearElement(h.zone);
		let items = i52(h.deck.cards());
		h.iHand = iSplay(items, h.zone);
	}
	return h;
}
function iMakeHand(iarr, dParent, styles, id) {
	let data = DA[id] = {};
	let h = data.deck = new Deck();
	h.init(iarr);
	iPresentHand(data, dParent, styles);
	return data;
}
function iRemakeHand(data) {
	let zone = data.zone;
	let deck = data.deck;

	let items = i52(deck.cards());
	clearElement(zone);
	data.iHand = iSplay(items, zone);
	return data;
}
function iH00_dep(iarr, dParent, styles, id) {
	function iH00Zone(dTable, nmax = 3, padding = 10) {
		let sz = netHandSize(nmax);
		//console.log('________________', sz)
		return mZone(dTable, { wmin: sz.w, h: sz.h, padding: padding, rounding: 10 });
	}
	//should return item={iarr,live.div,styles}
	let data = DA[id] = {};
	let h = data.deck = new Deck();
	h.init(iarr);
	// iPresentHand_test(dParent, data);
	// return data;
	h = data;
	if (nundef(h.zone)) h.zone = iH00Zone(dParent); else clearElement(h.zone);
	if (nundef(h.iHand)) {
		let items = i52(h.deck.cards());
		h.iHand = iSplay(items, h.zone);
	} else if (redo) {
		clearElement(h.zone);
		let items = i52(h.deck.cards());
		h.iHand = iSplay(items, h.zone);
	}
	return h;

}
function iH01(iarr, dParent, styles, id, overlap) {
	function iH01Zone(dTable, nmax = 3, padding = 10) {
		let sz = netHandSize(nmax);
		//console.log('________________', sz)
		return mZone(dTable, { wmin: sz.w, h: sz.h, padding: padding }); //, rounding: 10, bg:'blue' });
	}
	//should return item={iarr,live.div,styles}
	let h = isdef(Items[id]) ? Items[id] : { arr: iarr, styles: styles, id: id };
	if (nundef(h.zone)) h.zone = iH01Zone(dParent); else clearElement(h.zone);
	let items = i52(iarr);
	h.iHand = iSplay(items, h.zone, {}, 'right', overlap);
	return h;

}
function iH00(iarr, dParent, styles, id) {
	function iH00Zone(dTable, nmax = 7, padding = 10) {
		let sz = netHandSize(nmax);
		//console.log('________________', sz)
		return mZone(dTable, { wmin: sz.w, h: sz.h, padding: padding }); //, rounding: 10, bg:'blue' });
	}
	//should return item={iarr,live.div,styles}
	let h = isdef(Items[id]) ? Items[id] : { arr: iarr, styles: styles, id: id };
	if (nundef(h.zone)) h.zone = iH00Zone(dParent); else clearElement(h.zone);
	let items = i52(iarr);
	h.iHand = iSplay(items, h.zone);
	return h;

}
function iHandZone_test(dTable, nmax = 10, padding = 10) {
	let sz = netHandSize(nmax);
	//console.log('________________', sz)
	return mZone(dTable, { wmin: sz.w, h: sz.h, bg: 'random', padding: padding, rounding: 10 });
}
function iSortHand_test(dParent, h) {
	let d = h.deck;
	//console.log(d.cards());
	d.sort();
	//console.log(d.cards());

	iPresentHand_test(dParent, h);
}
function iPresentHand_test(dParent, h, redo = true) {
	if (nundef(h.zone)) h.zone = iHandZone_test(dParent); else clearElement(h.zone);
	if (nundef(h.iHand)) {
		let items = i52(h.deck.cards());
		h.iHand = iSplay(items, h.zone);
	} else if (redo) {
		clearElement(h.zone);
		let items = i52(h.deck.cards());
		h.iHand = iSplay(items, h.zone);
	}
	return h;
}
function iMakeHand_test(dParent, iarr, id) {
	let data = DA[id] = {};
	let h = data.deck = new Deck();
	h.init(iarr);
	iPresentHand_test(dParent, data);
	return data;
}
function randomRank() { return Card52.randomRankSuit[0]; }
function randomSuit() { return Card52.randomRankSuit[1]; }
function randomC52() { return Card52.getShortString(randomCard52()); }
function randomCard52() { return Card52.random(); }

//animations of items or item groups(=layouts)
function anim1(elem, prop, from, to, ms) {
	if (prop == 'left') elem.style.position = 'absolute';
	if (isNumber(from)) from = '' + from + 'px';
	if (isNumber(to)) to = '' + to + 'px';
	// let kfStart={};
	// kfStart[prop]=from;
	// let kfEnd={};
	// kfEnd[prop]={};
	// elem.animate([{left: '5px'},{left: '200px'}], {
	// 	// timing options
	// 	duration: ms,
	// 	iterations: Infinity
	// });
}

class Card52 {
	static toString(c) { return c.rank + ' of ' + c.suit; }
	static _getKey(i) {
		if (i >= 52) return 'card_J1';
		let rank = Card52.getRank(i);
		let suit = Card52.getSuit(i);
		return 'card_' + rank + suit;

	}
	//returns index 0..51
	static _fromKey(k) {
		let ranks = 'A23456789TJQK';
		let suits = 'SHDC';
		//ex k='2H';
		let ir = ranks.indexOf(k[0]); //=> zahl zwischen 0 und 12
		let is = suits.indexOf(k[1]); //=> zahle zwischen 0 und 3
		//console.log(is)
		return is * 13 + ir;
	}
	static getRankValue(i) { if (nundef(i)) return null; let r = i % 13; return r == 0 ? 12 : r - 1; }
	static getRank(i) {
		let rank = (i % 13);
		if (rank == 0) rank = 'A';
		else if (rank >= 9) rank = ['T', 'J', 'Q', 'K'][rank - 9];
		else rank = rank + 1;
		return rank;
	}
	static getSuit(i) {
		let s = ['S', 'H', 'D', 'C'][divInt(i, 13)];
		//if (!'SHDC'.includes(s)) console.log('SUIT!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
		return s;
	}
	static getShortString(c){return c.suit+c.rank;}
	static turnFaceDown(c, color) {
		//console.log(c.faceUp)
		if (!c.faceUp) return;
		let svgCode = C52.card_2B; //C52 is cached asset loaded in _start
		c.div.innerHTML = svgCode;
		if (isdef(color)) c.div.children[0].children[1].setAttribute('fill', color);
		c.faceUp = false;
	}
	static turnFaceUp(c) {
		if (c.faceUp) return;
		c.div.innerHTML = C52[c.key];
		c.faceUp = true;
	}
	static fromSR(sr, h){return Card52.fromShortString(sr, h);}
	static fromShortString(sr, h){ 
		//eg: getByShortString('HK')
		let key = sr[1].toUpperCase()+sr[0].toUpperCase();
		let i = Card52._fromKey(key);
		console.log('card from ', sr,'is',key,'i',i)
		return Card52.getItem(i, h);
	}
	static get(sr, h){return Card52.fromSR(sr, h);}
	static getItem(i, h = 110, w) {
		//rank:A23456789TJQK, suit:SHDC, card_2H (2 of hearts)
		if (nundef(w)) w = h * .7;
		if (nundef(i)) i=randomNumber(0,51);
		if (isString(i) && i.length == 2){i=Card52._fromKey(i[1].toUpperCase()+i[0].toUpperCase());}
		let c = Card52._createUi(i, undefined, w, h);
		c.i = c.val = i;
		return c;
	}
	static _createUi(irankey, suit, w, h) {
		//#region set rank and suit from inputs
		let rank = irankey;
		if (nundef(irankey) && nundef(suit)) {
			[rank, suit] = Card52.randomRankSuit();
		} else if (nundef(irankey)) {
			//face down card!
			irankey = '2';
			suit = 'B';
		} else if (nundef(suit)) {
			if (isNumber(irankey)) irankey = Card52._getKey(irankey);
			rank = irankey[5];
			suit = irankey[6];
		}
		//console.log('rank', rank, 'suit', suit); // should have those now!

		if (rank == '10') rank = 'T';
		if (rank == '1') rank = 'A';
		if (nundef(suit)) suit = 'H'; else suit = suit[0].toUpperCase(); //joker:J1,J2, back:1B,2B
		//#endregion

		//#region load svg for card_[rank][suit] (eg. card_2H)
		let cardKey = 'card_' + rank + suit;
		let svgCode = C52[cardKey]; //C52 is cached asset loaded in _start
		// console.log(cardKey, C52[cardKey])
		svgCode = '<div>' + svgCode + '</div>';
		let el = createElementFromHTML(svgCode);
		if (isdef(h) || isdef(w)) { mSize(el, w, h); }
		//console.log('__________ERGEBNIS:',w,h)
		//#endregion

		return { rank: rank, suit: suit, key: cardKey, div: el, w: w, h: h, faceUp: true }; //this is a card!
	}
	static random() { return Card52.getItem(randomNumber(0,51)); }
	static randomRankSuit() {
		//console.log(Object.keys(C52))
		let c = Card52.random();
		return [c.rank,c.suit];
	}
	static show(icard, dParent, h = 110, w = undefined) {
		if (isNumber(icard)) {
			if (nundef(w)) w = h * .7;
			icard = Card52.getItem(icard, h, w);
		}
		mAppend(dParent, icard.div);
	}
}

class Deck {
	constructor(f) { this.data = []; if (isdef(f)) if (isString(f)) this['init' + f](); else if (isList(f)) this.init(f); }
	init(arr) { this.data = arr; }
	initEmpty() { this.data = []; }
	initNumber(n, shuffled = true) { this.initTest(n,shuffled);}
	initTest(n, shuffled = true) { this.data = range(0, n - 1); if (shuffled) this.shuffle(); }
	init52(shuffled = true, jokers = 0) { this.data = range(0, 51 + jokers); if (shuffled) this.shuffle(); }
	init52_double(shuffled = true, jokers = 0) { this.data = range(0, 103 + jokers); if (shuffled) this.shuffle(); }
	init52_no_suits(n=4,shuffled = true, jokers = 0) { this.data = range(0, 13*n + jokers - 1); if (shuffled) this.shuffle(); }
	initRandomHand52(n) { this.data = choose(range(0, 51), n); }
	addTop(i) { this.data.push(i); return this; }
	addBottom(i) { this.data.unshift(i); return this; }
	bottom() { return this.data[0]; }
	cards() { return this.data; }
	count() { return this.data.length; }
	clear() { this.data = []; }
	deal(n) { return this.data.splice(0, n); }
	dealDeck(n) { let d1 = new Deck(); d1.init(this.data.splice(0, n)); return d1; }
	popTop() { return this.data.pop(); }
	popBottom() { return this.data.shift(); }
	remTop() { this.data.pop(); return this; }
	remBottom() { this.data.shift(); return this; }
	remove(i) { removeInPlace(this.data, i); return this; }
	removeAtIndex(i) { return this.data.splice(i, 1)[0]; }
	removeFromIndex(i, n) { return this.data.splice(i, n); }
	setData(arr, shuffled = false) { this.data = arr; if (shuffled) this.shuffle(); }
	sort() {
		//console.log('cards:', this.data.join(','));
		this.data.sort((a, b) => Number(a) - Number(b));
		//console.log('cards:', this.data.join(','));
		return this;
	}
	shuffle() { shuffle(this.data); return this; }
	top() { return arrLast(this.data); }
	toString() { return this.data.toString(); }//.join(','); }
}

//das sind cards die belibige RANKZ SUITZ symbols, colors haben koennen
class Cardz {
	static toString(c) { return c.rank + ' of ' + c.suit; }
	static _getKey(i) {
		if (i >= 52) return 'card_J1';
		let rank = Card52.getRank(i);
		let suit = Card52.getSuit(i);
		return 'card_' + rank + suit;

	}
	//returns index 0..51
	static _fromKey(k) {
		let ranks = 'A23456789TJQK';
		let suits = 'SHDC';
		//ex k='2H';
		let ir = ranks.indexOf(k[0]); //=> zahl zwischen 0 und 12
		let is = suits.indexOf(k[1]); //=> zahle zwischen 0 und 3
		//console.log(is)
		return is * 13 + ir;
	}
	static getRankValue(i) { if (nundef(i)) return null; let r = i % 13; return r == 0 ? 12 : r - 1; }
	static getRank(i) {
		let rank = (i % 13);
		if (rank == 0) rank = 'A';
		else if (rank >= 9) rank = ['T', 'J', 'Q', 'K'][rank - 9];
		else rank = rank + 1;
		return rank;
	}
	static getSuit(i) {
		let s = ['S', 'H', 'D', 'C'][divInt(i, 13)];
		//if (!'SHDC'.includes(s)) console.log('SUIT!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
		return s;
	}
	static getShortString(c){return c.suit+c.rank;}
	static turnFaceDown(c, color) {
		//console.log(c.faceUp)
		if (!c.faceUp) return;
		let svgCode = C52.card_2B; //C52 is cached asset loaded in _start
		c.div.innerHTML = svgCode;
		if (isdef(color)) c.div.children[0].children[1].setAttribute('fill', color);
		c.faceUp = false;
	}
	static turnFaceUp(c) {
		if (c.faceUp) return;
		c.div.innerHTML = C52[c.key];
		c.faceUp = true;
	}
	static fromSR(sr){return Card52.fromShortString(sr);}
	static fromShortString(sr){ 
		//eg: getByShortString('HK')
		let key = sr[1].toUpperCase()+sr[0].toUpperCase();
		let i = Card52._fromKey(key);
		console.log(key,'i',i)
		return Card52.getItem(i);
	}
	static getItem(i, h = 110, w) {
		//rank:A23456789TJQK, suit:SHDC, card_2H (2 of hearts)
		if (nundef(w)) w = h * .7;
		if (nundef(i)) i=randomNumber(0,51);
		if (isString(i) && i.length == 2){i=Card52._fromKey(i[1].toUpperCase()+i[0].toUpperCase());}
		let c = Card52._createUi(i, undefined, w, h);
		c.i = c.val = i;
		return c;
	}
	static _createUi(irankey, suit, w, h) {
		//#region set rank and suit from inputs
		let rank = irankey;
		if (nundef(irankey) && nundef(suit)) {
			[rank, suit] = Card52.randomRankSuit();
		} else if (nundef(irankey)) {
			//face down card!
			irankey = '2';
			suit = 'B';
		} else if (nundef(suit)) {
			if (isNumber(irankey)) irankey = Card52._getKey(irankey);
			rank = irankey[5];
			suit = irankey[6];
		}
		//console.log('rank', rank, 'suit', suit); // should have those now!

		if (rank == '10') rank = 'T';
		if (rank == '1') rank = 'A';
		if (nundef(suit)) suit = 'H'; else suit = suit[0].toUpperCase(); //joker:J1,J2, back:1B,2B
		//#endregion

		//#region load svg for card_[rank][suit] (eg. card_2H)
		let cardKey = 'card_' + rank + suit;
		let svgCode = C52[cardKey]; //C52 is cached asset loaded in _start
		// console.log(cardKey, C52[cardKey])
		svgCode = '<div>' + svgCode + '</div>';
		let el = createElementFromHTML(svgCode);
		if (isdef(h) || isdef(w)) { mSize(el, w, h); }
		//console.log('__________ERGEBNIS:',w,h)
		//#endregion

		return { rank: rank, suit: suit, key: cardKey, div: el, w: w, h: h, faceUp: true }; //this is a card!
	}
	static random() { return Card52.getItem(randomNumber(0,51)); }
	static randomRankSuit() {
		//console.log(Object.keys(C52))
		let c = Card52.random();
		return [c.rank,c.suit];
	}
	static show(icard, dParent, h = 110, w = undefined) {
		if (isNumber(icard)) {
			if (nundef(w)) w = h * .7;
			icard = Card52.getItem(icard, h, w);
		}
		mAppend(dParent, icard.div);
	}
}
class Deck1 extends Array {
	initTest(n, shuffled = true) { range(0, n).map(x => this.push(Card52.getItem(x))); if (shuffled) this.shuffle(); }
	initEmpty() { }
	init52(shuffled = true, jokers = 0) {
		range(0, 51 + jokers).map(x => this.push(Card52.getItem(x)));
		//this.__proto__.faceUp = true;
		//console.log(this.__proto__)
		if (shuffled) this.shuffle();
	}
	add(otherDeck) { while (otherDeck.length > 0) { this.unshift(otherDeck.pop()); } return this; }
	count() { return this.length; }
	static transferTopFromToBottom(d1, d2) { let c = d1.pop(); d2.putUnderPile(c); return c; }
	deal(n) { return this.splice(0, n); }
	getIndices() { return this.map(x => x.i); }
	log() { console.log(this); }
	putUnderPile(x) { this.push(x); }
	putOnTop(x) { this.unshift(x); }
	showDeck(dParent, splay, ovPercent = 0, faceUp = undefined, contStyles = {}) {
		//console.log('aaaaaaaaaaaaaaaaaaaaaaaaa')
		if (isdef(faceUp)) { if (faceUp == true) this.turnFaceUp(); else this.turnFaceDown(); }
		// splayout(this, dParent, {bg:'random',padding:0}, ovPercent, splay);
		splayout(this, dParent, contStyles, ovPercent, splay);
	}
	shuffle() { shuffle(this); }
	topCard() { return this[this.length - 1]; }
	turnFaceUp() {
		if (isEmpty(this) || this[0].faceUp) return;
		//if (this.__proto__.faceUp) return;
		this.map(x => Card52.turnFaceUp(x));
		//this.__proto__.faceUp = true;
	}
	turnFaceDown() {
		if (isEmpty(this) || !this[0].faceUp) return;
		//if (!this.__proto__.faceUp) return;
		//console.log(this[0])
		this.map(x => Card52.turnFaceDown(x));
		//this.__proto__.faceUp = false;
	}
}

function splayout(elems, dParent, w, h, x, y, overlap = 20, splay = 'right') {
	function splayRight(elems, d, x, y, overlap) {
		//console.log('splayRight', elems, d)
		for (const c of elems) {
			mAppend(d, c);
			mStyle(c, { position: 'absolute', left: x, top: y });
			x += overlap;
		}
		return [x, y];
	}
	function splayLeft(elems, d, x, y, overlap) {
		x += (elems.length - 2) * overlap;
		let xLast = x;
		for (const c of elems) {
			mAppend(d, c);
			mStyle(c, { position: 'absolute', left: x, top: y });
			x -= overlap;
		}
		return [xLast, y];
	}
	function splayDown(elems, d, x, y, overlap) {
		for (const c of elems) {
			mAppend(d, c);
			mStyle(c, { position: 'absolute', left: x, top: y });
			y += overlap;
		}
		return [x, y];
	}
	function splayUp(elems, d, x, y, overlap) {
		y += (elems.length - 1) * overlap;
		let yLast = y;
		for (const c of elems) {
			mAppend(d, c);
			mStyle(c, { position: 'absolute', left: x, top: y });
			y -= overlap;
		}
		return [x, yLast];
	}

	if (isEmpty(elems)) return { w: 0, h: 0 };

	mStyle(dParent, { display: 'block', position: 'relative' });

	//phase 4: add items to container
	[x, y] = (eval('splay' + capitalize(splay)))(elems, dParent, x, y, overlap);

	let isHorizontal = splay == 'right' || splay == 'left';
	let sz = { w: (isHorizontal ? (x - overlap + w) : w), h: (isHorizontal ? (y - overlap + h) : h) };

	return sz;

}












//#endregion

//#region containers.js
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
//#endregion

