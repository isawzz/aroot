

function testColarrVersions() {
	let tests = [[2,2],[3, 2], [4, 2], [5, 2], [6, 2],[6,3]];
	for(let i=0;i<50;i++){
	//for (const t of tests) {
		let [rows,cols] = [randomNumber(1, 10), randomNumber(1, 10)];
		//let [rows, cols] = t; 
		let carr1 = _calc_hex_col_array(rows, cols);
		let carr2 = _calc_hex_col_arrayNew(rows, cols);
		let even = (rows % 2)==0;
		console.log('rows',rows,(even ? 'even' : 'odd'),'cols',cols, '\nold', carr1,'\nnew', carr2);
		console.assert(even || sameList(carr1, carr2), 'FEHLER!!!!!!!!!!!!!!!!!!');
	}
}

function testSpotit() {

	//prompt for 2 cards gesamter ablauf!
	let [rows, cols, numCards, setName] = [3, 2, 3, 'animals'];
	let infos = spotitDeal(rows, cols, numCards, setName); //backend
	//items.map(x => console.log('item.keys', x.keys));

	//frontend
	let items = [];
	for (const info of infos) {
		let item = spotitCard(info, dTable, { margin: 10 }, spotitOnClickSymbol);




		items.push(item);
	}
	return;
	for (const item of items) {
		//shared symbol shouldn't be same size as on the other card!

		for (const k in item.shares) {
			let other = Items[item.shares[k]];
		}
	}
}


function testCardContent0(card) {

	//console.log('card',card); return;
	let dCard = iDiv(card);
	mRows(dCard, spotItPattern(5, 2), { sz: CSZ / 6, fg: 'random', hmargin: 8, vmargin: 4 }, { 'justify-content': 'center' }, { 'justify-content': 'center' }); return;
	mRows(dCard, spotItPattern(5, 2), { sz: CSZ / 8, fg: 'random', margin: 6 }, { 'justify-content': 'center' }, { 'justify-content': 'center' }); return;
	mRows(dCard, cardPattern(13, 'spade suit'), { sz: CSZ / 8, fg: 'random', margin: 6 }, { 'justify-content': 'center' }, { 'justify-content': 'center' }); return;
	mRows(dCard, [['frog', 'frog', 'frog'], ['frog', 'frog'], ['frog', 'frog', 'frog']], { sz: CSZ / 6, fg: 'random' }, { 'justify-content': 'center' }, { 'justify-content': 'center' }); return;
	//mRows(dCard,['dasf rog','der frog','die frog']); return;
	mRows(dCard, [['frog', 'frog', 'frog'], ['frog', 'frog'], ['frog', 'frog', 'frog']], { sz: CSZ / 5, fg: 'random' }, { 'justify-content': 'center' }, { 'justify-content': 'space-evenly' }); return;
	mSym('frog', dCard, {}, 'cc'); return;
	mRows(iDiv(card), [[['frog', 3], 'HALLO', 'bee'], ['frog', 'HALLO', 'bee'], ['frog', 'HALLO', 4, 'bee'], 'ja das ist es!']);
	//cardRows(card,[['frog','HALLO','bee'],['frog','HALLO','bee'],['frog','HALLO','bee']]);
	return;

	let d = iDiv(dCard, { display: 'flex', dir: 'column', h: '100%', 'justify-content': 'center' }, 'dOuter');
	return;

	for (const arr of rows) {
		let dCol = mDiv(d, { display: 'flex', 'justify-content': 'space-between', 'align-items': 'center' });
		for (const c of arr) {
			let dc;
			if (isdef(Syms[c])) {
				dc = mDiv(dCol, { fg: 'black' });
				ds = mSym(dc, dCol, { sz: CSZ / 5, fg: 'random' });
			} else {
				dc = mDiv(dCol, { fg: 'black' }, null, c);
			}
		}
	}
}
function testInnoMain() {
	//dTable = mDiv(mBy('wrapper'), { position: 'absolute', padding: 10, w: '100vw', h: '100vh', bg: 'white' });
	mStyle(dTable, { gap: 10, pabottom: 150 });

	for (const k in Cinno) {
		if (isdef(Cinno[k].expansion)) cardInno(dTable, k);
	}
}
function testInnoCardPhantasie() {

	dTable = mDiv(mBy('wrapper'), { position: 'absolute', padding: 10, w: '100vw', h: '100vh', bg: 'white' });

	mStyle(dTable, { gap: 10 }); let card = cBlank(dTable, { fg: 'black', bg: INNO.color.red, w: CSZ, h: CSZ * .65 });
	let [dCard, sz, szTitle, gap] = [iDiv(card), CSZ / 4, 24, 8];

	let [dTitle, dMain] = cTitleArea(card, 32);
	let d = mAddContent(dTitle, 'MetalWorking', { bg: INNO.sym.tower.bg, fg: 'white', h: 32, fz: 23, align: 'center', position: 'relative' });
	mAddContent(d, '5', { float: 'right', hpadding: 10 });
	let s = mSym(INNO.sym.tower.key, d, { h: 22, fg: INNO.sym.tower.fg }, 'cl');

	let margin = 20;
	innoSym('leaf', dMain, sz, 'tl', margin);
	innoSym('crown', dMain, sz, 'bl', margin);
	innoSym('leaf', dMain, sz, 'bc', margin);
	innoSym('leaf', dMain, sz, 'br', margin);

	let box = mBoxFromMargins(dMain, 0, margin, sz + margin, sz + margin); //,{bg:'grey',alpha:.5, rounding:10});
	let text = 'I demand if you get [tower] or [crown], immediately switch to age [2]. aber ich hab ja gott sei dank zeit! denn wenn nicht ist es ein echtes problem. dann muss ich einen anderen test machen!';
	let t2 = innoText(text);
	mFillText(t2, box);

	return;


	box = mDiv(dMain, { w: sz, h: sz, bg: 'dimgrey', rounding: 10 }); mPlace(box, 'tl');
	s = mSym('white-tower', box, { sz: sz * .75, fg: 'silver' }, 'cc');
	box = mDiv(dMain, { w: sz, h: sz, bg: 'dimgrey', rounding: 10 }); mPlace(box, 'bl');
	s = mSym('frog', box, { sz: sz * .75, fg: 'silver' }, 'cc');

	box = mDiv(dMain, { w: sz, h: sz, bg: 'dimgrey', rounding: 10 }); mPlace(box, 'bc');
	s = mSym('maple-leaf', box, { sz: sz * .75, fg: 'silver' }, 'cc');
	// box = mDiv(dMain,{w:sz,h:sz,bg:'grey',alpha:.5, rounding:10}); mPlace(box,'bc');
	// text = 'lorem ipsum bla bla bla denn wenn nicht ist es ein echtes problem. dann muss ich einen anderen test machen!';
	// mFillText(text,box);

	box = mDiv(dMain, { w: sz, h: sz, bg: 'grey', alpha: .5, rounding: 10 }); mPlace(box, 'br');
	text = 'denn wenn es nicht geht und ich bin muede dann halt nicht!';
	mFillText(text, box);

	box = mBoxFromMargins(dMain, 4, 4, sz + 8, sz + 10); //,{bg:'grey',alpha:.5, rounding:10});
	text = 'das muss jetzt ein viel laenderer text sein. aber ich hab ja gott sei dank zeit! denn wenn nicht ist es ein echtes problem. dann muss ich einen anderen test machen!';
	mFillText(text, box);


	return;

	//mPlaceText(text,where,dParent,styles,classes)
	text = 'das ist ein sehr langer text ich hoffe er ist auf jeden fall zu lang fuer diese box. denn wenn nicht ist es ein echtes problem. dann muss ich einen anderen test machen!';
	box = mPlaceText(text, [szTitle, 10, sz + gap, sz + gap], d, { fg: 'dimgrey' }, { bg: 'beige', border: '1px solid grey', rounding: 10 });

	text = 'denn wenn nicht ist es ein echtes problem. dann muss ich einen anderen test machen!';
	box = mPlaceText(text, [sz, sz, 'bl'], d, { fg: 'dimgrey', bg: 'pink', rounding: 10, border: '5px solid pink' });


	let x1 = mSym('crow', d, { w: sz, h: sz, fg: 'green' }, 'br');

	x1 = mSym('abacus', d, { w: sz, h: sz }, 'bc');

	//mPlaceText(text,where,dParent,styles,classes)
	box = mPlaceText('hallo das ist noch ein echo!!!', [sz, sz, 'tl'], d, { fg: 'blue', bg: 'orange', rounding: 10 });
	//let b = (text, d, {top:szTitle, right:10, bottom:sz, left:sz}, {fg:'black'});

}
function testRectanglesW1() {
	mStyle(dTable, { gap: 10 }); let card = cBlank(dTable, { w: CSZ, h: CSZ * .8 });
	let [d, sz, szTitle, gap] = [iDiv(card), CSZ / 4, 24, 8];


	//mPlaceText(text,where,dParent,styles,classes)
	let text = 'das ist ein sehr langer text ich hoffe er ist auf jeden fall zu lang fuer diese box. denn wenn nicht ist es ein echtes problem. dann muss ich einen anderen test machen!';
	box = mPlaceText(text, [szTitle, 10, sz + gap, sz + gap], d, { fg: 'dimgrey' }, { bg: 'beige', border: '1px solid grey', rounding: 10 });

	text = 'denn wenn nicht ist es ein echtes problem. dann muss ich einen anderen test machen!';
	box = mPlaceText(text, [sz, sz, 'bl'], d, { fg: 'dimgrey', bg: 'pink', rounding: 10, border: '5px solid pink' });


	let x1 = mSym('crow', d, { w: sz, h: sz, fg: 'green' }, 'br');

	x1 = mSym('abacus', d, { w: sz, h: sz }, 'bc');

	//mPlaceText(text,where,dParent,styles,classes)
	box = mPlaceText('hallo das ist noch ein echo!!!', [sz, sz, 'tl'], d, { fg: 'blue', bg: 'orange', rounding: 10 });
	//let b = (text, d, {top:szTitle, right:10, bottom:sz, left:sz}, {fg:'black'});

}
function testRectanglesTextInBoxesW0() {
	mStyle(dTable, { gap: 10 }); let card = cBlank(dTable, { w: CSZ, h: CSZ * .8 });
	let [d, sz, szTitle, gap] = [iDiv(card), CSZ / 4, 24, 8];


	let box = mBoxFromMargins(d, szTitle, 10, sz + gap, sz + gap);
	let r = mMeasure(box);
	text = 'das ist ein sehr langer text ich hoffe er ist auf jeden fall zu lang fuer diese box. denn wenn nicht ist es ein echtes problem. dann muss ich einen anderen test machen!';
	let [fz, w, h] = fitFont(text, 20, r.w, r.h);
	console.log('res', fz, w, h);
	let dText = mDiv(box, {
		w: w, h: h, fz: fz, fg: 'black',
		position: 'absolute', transform: 'translate(-50%,-50%)', top: '50%', left: '50%'
	}, null, text);

	//jetzt mach ein echo mit demselben text
	box = mDiv(d, { w: sz, h: sz });
	mPlace(box, 'bl');
	r = mMeasure(box);
	text = 'denn wenn nicht ist es ein echtes problem. dann muss ich einen anderen test machen!';
	[fz, w, h] = fitFont(text, 20, r.w, r.h);
	console.log('res', fz, w, h);
	dText = mDiv(box, {
		w: w, h: h, fz: fz, fg: 'black',
		position: 'absolute', transform: 'translate(-50%,-50%)', top: '50%', left: '50%'
	}, null, text);


	//mPlaceText(text,where,dParent,styles,classes)
	mPlaceText('hallo das ist noch ein echo!!!', [sz, sz, 'tl'], d, { fg: 'blue' }, { bg: 'orange', border: '1px dashed red', rounding: 10 });
	//let b = (text, d, {top:szTitle, right:10, bottom:sz, left:sz}, {fg:'black'});

}
function testPositionCardSym() {
	mStyle(dTable, { gap: 10 }); let card = cBlank(dTable); let d = iDiv(card); let sz = CSZ / 5;

	let x1 = mSym('crow', d, { w: sz, h: sz, bg: 'random' }, 'cc'); console.log('\nx1', x1);
}
function testPosition3() {
	mStyle(dTable, { gap: 10 }); let card = cBlank(dTable); let d = iDiv(card); let sz = CSZ / 5;

	let x1 = mShapeR('hex', null, { w: sz, h: sz, bg: 'random' }); console.log('\nx1', x1);

	for (const p of ['tl', 'tc', 'tr', 'cl', 'cc', 'cr', 'bl', 'bc', 'br']) {
		let x2 = x1.cloneNode(); mAppend(d, x2); mPlace(x2, p, 20);
	}

}
function testPositionPatterns() {
	mStyle(dTable, { gap: 10 }); let card = cBlank(dTable); let d = iDiv(card); let sz = CSZ / 5;

	let x1 = mShapeR('hex', null, { w: sz, h: sz, bg: 'random' }); console.log('\nx1', x1);

	for (const p of ['tl', 'tc', 'tr', 'cl', 'cc', 'cr', 'bl', 'bc', 'br']) {
		let x2 = x1.cloneNode(); mAppend(d, x2);	//console.log('x2',x2);
		mPlace(x2, p, p.includes('c') ? 0 : 20);
	}

}
function testPositionPatterns1() {
	mStyle(dTable, { gap: 10 }); let card = cBlank(dTable); let d = iDiv(card); let sz = CSZ / 5;

	let x1 = mShapeR('circle', null, { w: sz, h: sz, bg: 'random' }); console.log('\nx1', x1);

	for (const p of ['tl', 'tr', 'bl', 'br']) {
		let x2 = x1.cloneNode(); mAppend(d, x2);	//console.log('x2',x2);
		mPlace(x2, p, 20);
	}
	for (const p of ['tc', 'cl', 'cc', 'cr', 'bc']) {
		let x2 = x1.cloneNode(); mAppend(d, x2);	//console.log('x2',x2);
		mPlace(x2, p);
	}

}
function testPositionShapeR0() {
	mStyle(dTable, { gap: 10 }); let card = cBlank(dTable); let d = iDiv(card); let sz = CSZ / 4;
	let x1 = mShapeR('triup', d, { sz: sz, bg: 'random' }); console.log('\nx1', x1);
	mPlace(x1, 'tl');

	let x2 = mShapeR('hex', d, { sz: sz, bg: 'random' }); console.log('\nx1', x2);
	mPlace(x2, 'tr');

	let x3 = mShapeR('triangle', d, { sz: sz, bg: 'random' }); console.log('\nx1', x3);
	mPlace(x3, 'br');

	let x4 = mShapeR('hexFlat', d, { sz: sz, bg: 'random' }); console.log('\nx1', x4);
	mPlace(x4, 'bl');


}
function testKartePositionSuit() {
	//stress test: for (let i = 0; i < 100; i++) { testKartePositionSuit(); }

	mStyle(dTable, { gap: 10 }); let card = cBlank(dTable); let d = iDiv(card); let sz = CSZ / 6;

	//alles auf einmal:
	let s1 = mSuit('Herz', d, { sz: sz }, 'tc'); //console.log('s1', s1);
	let s2 = mSuit('Herz', d, { sz: sz }, 'cr'); //console.log('s2', s2);
	let s3 = mSuit('Herz', d, { sz: sz }, 'bc'); //console.log('s3', s3);
	let s4 = mSuit('Herz', d, { sz: sz }, 'cl'); //console.log('s4', s4);
	let s5 = mSuit('Pik', d, { sz: sz * 2 }, 'cc'); //console.log('s5', s5);

	s5 = mSuit('Treff', d, { sz: sz * 1.5 }, 'tl'); //console.log('s5', s5);
	s5 = mSuit('Treff', d, { sz: sz * 1.5 }, 'tr'); //console.log('s5', s5);
	s5 = mSuit('Treff', d, { sz: sz * 1.5 }, 'bl'); //console.log('s5', s5);
	s5 = mSuit('Treff', d, { sz: sz * 1.5 }, 'br'); //console.log('s5', s5);

}
function testKarteSizing() {
	mStyle(dTable, { gap: 10 }); let card;
	card = cBlank(dTable);
	let d = iDiv(card);
	let sz = CSZ;

	//1. produce html elements: prefab
	let arr = [];
	let suit = mSuit('Pik');  // das ist ein prefab
	let triangle = mShape('triangle', null, { bg: 'red' }); //, w: sz / 4, h: sz / 4, position: 'absolute', bottom: 10, left: 10 });
	let sym = mSym('frog');
	let shape = mShape('test1');
	let x = mShapeR(); //console.log('\nx', x); mAppend(d, x);return;

	//2. size the elements: which ones can be sized and how?
	//size a suit? simply set h
	let h = sz / 4;

	suit.setAttribute('height', h);//size a mSuit

	mStyle(sym, { fz: h * .75 });// 88 75 size a mSym: use magic number .75
	mSize(shape, h * .75); //size a mShape: use magic number .75
	mSize(triangle, h * .75); //yes!
	mStyle(x, { w: h * .75 }); mClassReplace(x, 'weired1');
	//mSize(x,h*75);

	arr = [triangle, suit, sym, shape, x];
	// console.log('suit',suit,'\nsym',sym,'\nshape',shape,'\nx',x,'\ntriangle',triangle);
	//console.log('\nx', x);

	//mAppend(d, x); return;
	for (const x of arr) { mAppend(d, x); }
	gSizeToContent(suit);
	// resizeSvg(suit);
	//suit is ein svg element
	//suit.style.backgroundColor = 'blue';

	//mAppend(iDiv(card),suit);

}

//******************************** more tests *************************** */
function testKartePositionSuitOuterCenters() {
	mStyle(dTable, { gap: 10 }); let card = cBlank(dTable); let d = iDiv(card); let sz = CSZ / 4;

	//alles auf einmal:
	let s1 = mSuit('Pik', d, { sz: 60 }, 'tc'); console.log('s1', s1);
	let s2 = mSuit('Karo', d, { sz: 60 }, 'cr'); console.log('s2', s2);
	let s3 = mSuit('Herz', d, { sz: 60 }, 'bc'); console.log('s3', s3);
	let s4 = mSuit('Treff', d, { sz: 60 }, 'cl'); console.log('s4', s4);

}
function testKartePosition2() {
	mStyle(dTable, { gap: 10 }); let card = cBlank(dTable); let d = iDiv(card); let sz = CSZ / 4;

	//alles auf einmal:
	let s1 = mSuit('Pik', d, { sz: 25 }, 'tl'); console.log('s1', s1);
	let s2 = mSuit('Karo', d, { sz: 50 }, 'tr'); console.log('s2', s2);
	let s3 = mSuit('Herz', d, { sz: 75 }, 'bl'); console.log('s3', s3);
	let s4 = mSuit('Treff', d, { sz: 100 }, 'br'); console.log('s4', s4);

}
function testKartePosition1() {
	mStyle(dTable, { gap: 10 }); let card = cBlank(dTable); let d = iDiv(card); let sz = CSZ / 4;

	// let s = mSuit('Karo', d, { h: sz });	//mSuitLeft(s);	mSuitBottom(s);
	// mStyle(s, { top: 0, right: 0, position: 'absolute' });

	// let s1 = mSuit('Treff', d, { h: sz });	//mSuitLeft(s);	mSuitBottom(s);
	// mStyle(s1, { top: 100, right: -10, position: 'absolute' });

	// let s2 = mSuit('Pik', d, { h: sz });	//mSuitLeft(s);	mSuitBottom(s);
	// mStyle(s2, { top: 200, right: getSuitOffset(sz), position: 'absolute' });


	//produce+attach, size, position TL:
	let s3 = mSuit('Pik', d); mSuitSize(s3, 30); mSuitTL(s3); console.log('s3', s3);

	//produce+attach, size, position BR:
	let s4 = mSuit('Treff', d); mSuitSize(s4, 30); mSuitPos(s4, 'bottom', 'right'); console.log('s4', s4); //fail!
	//mStyle(s4,{right:0,bottom:0,position:'absolute'});

	let s5 = mSuit('Herz', d, { sz: 30 }); mSuitPos(s5, 'bottom', 'left'); console.log('s5', s5); //fail!
	let s6 = mSuit('Karo', d, { sz: 30 }); mSuitPos(s6, 'top', 'right'); console.log('s6', s6); //fail!



	//let s1=mSuit('Herz',d,{h:sz}); mSuitRight(s1); //	mSuitBottom(s1);
	//mStyle(s1,{right:0,position:'absolute'});
	//mSuitLeft(s,sz); ok
	//mSuitSize(suit2,sz); NOOOOOOOOOOOOOOO
	//mSuitLeft(suit2,sz);
	return;

	console.log('suit', suit);
	mPos(suit, 0, 0); // ja, geht
	mPos(suit1, -10, CHEIGHT - sz); //so geht es! mit -10 kann ich es an den rand schieben, works with CSZ/4=75 also 
	//sz*10/75 
	//wieviel prozent ist 10 von 75? 10 / (75/100) ... 1000/75? YES! 13.3
	mPos(suit1, -10 * sz / 100, CHEIGHT - sz); //JA das ist perfect!!!!!
	//bei CSZ=300 ist 
	//mStyle(suit1,{left:0,top:`calc( 100% - ${sz}px )`,position:'absolute'}); // ja seems to work!
	//mStyle(suit1,{left:0,top:`calc( 100% - ${sz}px )`,position:'absolute'}); // ja seems to work!
	//position:


}
function testKarte0() {
	mStyle(dTable, { gap: 10 }); let card = cBlank(dTable); let d = iDiv(card); let sz = CSZ;

	let suit = mSuit('Pik', d, { h: 300 });  // nope, brauch setAttribute in suit
	let p = suit.firstChild;
	console.log('p', p);
	console.log('child', p.firstChild);

}
function testKarte8() {
	for (let i = 0; i < 1; i++) {
		testKarte7();
	}
}
function testKarte6() {
	for (let i = 0; i < 10; i++) {
		let n = i * 15; // 10*randomNumber(2,25);
		let x = mShapeR('triup', dTable, { sz: n, bg: 'random' }); console.log('\nx', x); mAppend(dTable, x);
	}


}
function testKarte5() {
	for (let i = 0; i < 10; i++) {
		let n = i * 15; // 10*randomNumber(2,25);
		let x = mShapeR(); console.log('\nx', x);
		mStyle(x, { w: n }); mClassReplace(x, 'weired' + (n > 120 ? 8 : n > 80 ? 5 : n > 50 ? 3 : 1));
		mAppend(dTable, x);
	}
}
function testKarte4() {
	mStyle(dTable, { gap: 10 }); let card;
	card = cBlank(dTable);
	let d = iDiv(card);
	let sz = CSZ;

	//1. produce html elements: prefab
	let arr = [];
	let suit = mSuit('Pik');  // das ist ein prefab
	let triangle = mShape('triangle', null, { bg: 'red' }); //, w: sz / 4, h: sz / 4, position: 'absolute', bottom: 10, left: 10 });
	let sym = mSym('frog');
	let shape = mShape('test1');

	let x = mShapeX98(); console.log('\nx', x); mAppend(d, x);

	return;
	//2. size the elements: which ones can be sized and how?
	//size a suit? simply set h
	let h = sz / 4;
	suit.setAttribute('height', h);//size a mSuit
	mStyle(sym, { fz: h * .75 });// 88 75 size a mSym: use magic number .75
	mSize(shape, h * .75); //size a mShape: use magic number .75
	mSize(triangle, h * .75); //yes!
	// mStyle(x, { w: h*.75 });
	//mSize(x,h*75);




	arr = [triangle, suit, sym, shape, x];
	// console.log('suit',suit,'\nsym',sym,'\nshape',shape,'\nx',x,'\ntriangle',triangle);
	console.log('\nx', x);

	mAppend(d, x); return;

	for (const x of arr) { mAppend(d, x); }
	gSizeToContent(suit);
	//suit is ein svg element
	//suit.style.backgroundColor = 'blue';

	//mAppend(iDiv(card),suit);

}
function testKarte3_svg() {
	mStyle(dTable, { gap: 10 }); let card;

	//card = cBlankSvg(dTable);
	//immer noch brauch ich die Jack,King,Queen,back,Joker vielleicht
	//console.log('card', card);

	card = cBlankSvg(dTable);

	console.log('card', card); //mClass(iDiv(card),'hoverScale')
	let g = iG(card); console.log('g', g);

	//1 produce
	let x = mgSuit('Pik'); console.log('x', x);
	//2 attach
	//mAppend(iG(card),x);
	//3 size
	mgSize(x, CSZ / 2);
	//4 position
	mgPos(card, x); //,50,50);
	//mgPos(x,)



	//let x = cSuitTR(card, 'Treff');
	//console.log('x',x);
	//let x=mSuit(iDiv(card),'Pik',100,50,50);
	//let d=iDiv(card);

	// let c2 = Card52.get('HQ', CSZ); mAppend(dTable, iDiv(c2)); //console.log('c2', iDiv(c2)); 
	// let c3 = Card52.get('CQ', CSZ); mAppend(dTable, iDiv(c3));
	// c3 = Card52.get('DQ', CSZ); mAppend(dTable, iDiv(c3));
	// c3 = Card52.get('SQ', CSZ); mAppend(dTable, iDiv(c3));
}
function testKarte2() {
	//let x=mDiv(dTable,{bg:'random',w:70,h:110,rounding:20}); return;
	//let c=cBlank(dTable);	console.log('card',c);
	let card = cLandscape(dTable);
	let isLandscape = card.w > card.h;
	let sz = card.sz; // min of w,h of card
	console.log('sz', sz)
	let text = 'diese karte erlaubt es dir, zu verschwinden und aufzutauchen wo immer du willst.<br><br>pass jedoch auf: wenn du auf einer ungesicherten mine landest, verlierst du 1 leben!';

	//place a red triangle in top left corner
	let d = iDiv(card);
	let sh = [
		{ type: 'html', pos: 'TL', sz: 's', content: `<div class="weired"></div>` },
		{ type: 'html', pos: 'TR', sz: 's', content: `<div class="weired" style="--b:linear-gradient(red,blue);"></div>` },
		{
			type: 'html', pos: 'BL', sz: 's', content: `<div class="weired" style=
		"--b:conic-gradient(green,pink,green);
		--clip:polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
		--patop:100%;
		"></div>`},
		{
			type: 'html', pos: 'BR', sz: 's', content: `<div class="weired" style=
		"--b:url(../assets/images/felix.jpg) center/cover;
		--clip:polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
		--patop:100%;
		"></div>`},
		{ type: 'text', pos: 'CC', sz: 'l', content: 'diese karte erlaubt es dir, zu verschwinden und aufzutauchen wo immer du willst.<br><br>pass jedoch auf: wenn du auf einer ungesicherten mine landest, verlierst du 1 leben!' },
	];

	//type: html,DOM,text,shape,sym
	//size: xs,s,m,l,xl oder zahl (pixel)
	var SZ = sz;
	var GAP = SZ * .1;
	var SIZE = { xs: SZ / 8, s: SZ / 4, m: SZ / 2, l: SZ * 2 / 3, xl: SZ };
	//pos: TL TC TR CL CC CR BL BC BR dann noch TL2 TC2 TR2 BL2 BC2 CR2
	var POS = { TL: { top: GAP, left: GAP }, TR: { top: GAP, right: GAP }, BL: { bottom: GAP, right: GAP }, BR: { bottom: GAP, right: GAP } };
	//kann auch combi von szpos: TL

	for (const sh1 of sh) {
		// let pos = sh1.pos;
		// let size = SIZE[sh1.size];

		// if (pos[0]=='C'){
		// 	//element has to be centered vertically
		// 	//width of element = size
		// 	//height of element = isLandscape?size
		// }

		// let [w,h]=pos == 'CC'?isLandscape?[SIZE[size],SIZE[size]]
		// let content = sh1.content;
		// let type=sh1.type;
		// let x=type=='html'?createElementFromHtml(t)
		// :type =='text'?
		// switch(sh1.type){
		// 	case 'html':
		// }
		let t = sh1.content;
		x = isString(t) ? t[0] == '<' ? createElementFromHtml(t) : makeText(t, sz, sz / 2) : t;
		mAppend(d, x);
		let pos = sh1.pos;
		if (pos != 'CC') {
			mStyle(x, { w: 80 });
			window['mPos' + sh1.pos](x, 10);
		}

	}

}
function testKarte1() {
	//let x=mDiv(dTable,{bg:'random',w:70,h:110,rounding:20}); return;
	//let c=cBlank(dTable);	console.log('card',c);
	let card = cLandscape(dTable);
	let sz = card.sz; // min of w,h of card
	console.log('sz', sz)

	//place a red triangle in top left corner
	let d = iDiv(card);
	let x = mShape('triangle', d, { bg: 'blue', w: sz / 4, h: sz / 4, position: 'absolute', top: 10, left: 10 });
	x = mShape('test1', d, { bg: 'red', w: sz / 4, h: sz / 4, position: 'absolute', bottom: 10, left: 10 });
	x = mSym('bee', d, { fz: sz / 5, position: 'absolute', bottom: 10, right: 10 });
	x = mDiv(d, { bg: YELLOW, w: sz / 4, h: sz / 4, position: 'absolute', top: 10, right: 10 }, null, null, 'triangle');

	//mStyle(d,{align:'center'});
	let text = 'diese karte erlaubt es dir, zu verschwinden und aufzutauchen wo immer du willst.<br><br>pass jedoch auf: wenn du auf einer ungesicherten mine landest, verlierst du 1 leben!';
	let [fz, w, h] = fitFont(text, 20, sz, sz / 2);
	let pos = { left: (card.w - w) / 2, top: (card.h - h) / 2 }
	x = mDiv(d, { align: 'left', fz: fz, fg: 'black', w: w, h: h, top: pos.top, left: pos.left, display: 'inline-block', position: 'absolute' }, null, text);
	console.log('x', x)


	let sh0 = [
		`<div class="triangle"></div>`,
		`<div class="triangle type2" style="--b:linear-gradient(red,blue);"></div>`,
		`<div class="triangle type3" style="--b:conic-gradient(green,pink,green);"></div>`,
		`<div class="triangle hex" style="--b:url(https://picsum.photos/id/1067/200/200) center/cover;"></div>`,
		`<div class="triangle hex" style="--b:url(../assets/images/felix.jpg) center/cover;"></div>`,
	];


	let sh = [
		`<div class="weired"></div>`,
		`<div class="weired" style="--b:linear-gradient(red,blue);"></div>`,
		`<div class="weired" style=
		"--b:conic-gradient(green,pink,green);
		--clip:polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
		--patop:100%;
		"></div>`,

		//`<div class="triangle hex" style="--b:url(https://picsum.photos/id/1067/200/200) center/cover;"></div>`,
		//`<div class="triangle hex" style="--b:url(../assets/images/felix.jpg) center/cover;"></div>`,
	];
	for (const sh1 of sh) {
		x = createElementFromHtml(sh1);
		mStyle(x, { w: 80 });
		mAppend(dTable, x);
	}

	//let x=mShape('triangle',d,{bg:'red',w:sz/4,h:sz/4,position:'absolute',top:10,left:10});
	//let x=mShape('triangle',d,{bg:'red',w:sz/4,h:sz/4,position:'absolute',top:10,left:10});



	return;


	let styles = { margin: 10, bg: 'random' };
	//let d=drawShape('hex', dTable);
	for (let i = 0; i < 3; i++) { let d = mShape('triangle', dTable); console.log('d', d); }

}
function testInno() {

	//inno cards
	//for (const k in Cinno) { if (k == 'Metalworking') { let card = cardInno(k); mAppend(dTable, iDiv(card)); } }
	//for (const k in Cinno) { let card = cardInno(k); mAppend(dTable, iDiv(card)); }
	//for (const k in Cinno) { let card = cardInno(k); if (card.echo) mAppend(dTable, iDiv(card)); }

}
function testFindKeys() {
	//let keys = findKeys('bee'); //ok

}

//#region tests mit svg cards
function testCard52Cards() {

	for (let i = 0; i < 20; i++) {
		let card = Card52.random();
		mAppend(dTable, iDiv(card));
	}

}
function test52CardsOther() {
	keys = ['spades', 'hearts', 'clubs', 'diamonds'];

	for (let i = 0; i < 4; i++) {
		let k = keys[i % keys.length];
		console.log('k', k);
		let card = Karte.random(k, 110);
		mAppend(dTable, iDiv(card));
	}

}
function testBirdCards() {
	let keys = SymKeys.filter(x => Syms[x].family != 'emoNoto');
	console.log('groups', ByGroupSubgroup);
	console.log('keySets', KeySets);
	keys = KeySets['animal-bird'];
	for (let i = 0; i < 40; i++) {
		let k = chooseRandom(keys); //keys[i%keys.length];
		console.log('k', k);
		let card = Karte.get(k, 300);
		mAppend(dTable, iDiv(card));
	}

}













