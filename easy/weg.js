function calc_syms(numSyms) {
	//should return [rows,cols,colarr]
	let n = numSyms, rows, cols, colarr;
	if (n == 3) { rows = 2; cols = 1; colarr = [1,2];}
	else if (n == 4) { rows = 2; cols = 2; colarr = [2,2];}
	else if (n == 5) { rows = 3; cols = 1; colarr = [1,3,1];}
	else if (n == 6) { rows = 3.3; cols = 1; colarr = [2,3,1];}
	else if (n == 7) { rows = 3; cols = 2; colarr = [2,3,2];} //default
	else if (n == 8) { rows = 3.8; cols = 1; colarr = [1,3,3,1];}
	else if (n == 9) { rows = 5; cols = 9; colarr = [2, 3, 3, 1];}
	else if (n == 10) { rows = 4; cols = 2; }
	else if (n == 11) { rows = 4.5; cols = 3; colarr = [2, 3, 4, 2]; }
	else if (n == 12) { rows = 5; cols = 3; }
	else if (n == 13) { rows = 5; cols = 4; colarr = [2, 3, 4, 3, 1]; }
	else if (n == 14) { rows = 5; cols = 2; }
	else if (n == 17) { rows = 6; cols = 2; }
	else if (n == 18) { rows = 6; cols = 3; }

	// console.log('...numSyms,rows,cols', numSyms, rows, cols);
	if (![9,11,13].includes(n)) colarr = _calc_hex_col_array(rows, cols);

	//correction for certain perCard outcomes:
	if (rows == 3 && cols == 1) { colarr = [1, 3, 1]; } //5
	else if (rows == 2 && cols == 1) { colarr = [1, 2]; } //3
	else if (rows == 4 && cols == 1) { rows = 3.3; colarr = [2, 3, 1]; } //6
	else if (rows == 5 && cols == 1) { rows = 4; cols = 1; colarr = [1, 3, 3, 1]; } //8
	else if (rows == 5 && cols == 3) { rows = 5; cols = 1; colarr = [1, 3, 4, 3, 1]; } //12
	else if (rows == 6 && cols == 2) { rows = 5.5; colarr = [2, 4, 5, 4, 2]; } //17
	else if (rows == 6 && cols == 3) { rows = 5.8; colarr = [2, 4, 5, 4, 3]; } //18

	// console.log('colarr',jsCopy(colarr));
	return [rows, cols, colarr];
}


function old_show_settings(dParent) {
	let [options, fen, uplayer] = [Z.options, Z.fen, Z.uplayer];
	clearElement(dParent);
	mFlex(dParent);
	let playermode = get_playmode(uplayer); //console.log('playermode',playermode)
	let game_mode = Z.mode;
	let dplaymode = mDiv(dParent, { fg: 'blue' }, null, playermode); // playermode == 'bot' ? 'bot' : '');
	let dgamemode = mDiv(dParent, { fg: 'red' }, null, Z.mode); //Z.mode == 'hotseat' ? 'h' : '');
	let d = miPic('gear', dParent, { fz: 20, padding: 6, h: 40, box: true, matop: 2, rounding: '50%', cursor: 'pointer' });
	options.playermode = playermode;
	d.onmouseenter = () => show_options_popup(options);
	d.onmouseleave = hide_options_popup;
}
function show_history_popup() {
	
	if (isEmpty(Z.fen.history)) return;
	assertion(isdef(UI.dHistoryParent) && isdef(UI.dHistory), 'UI.dHistoryParent && UI.dHistory do NOT exist!!!');
	let dParent = UI.dHistoryParent;
	let dh=UI.dHistory;
	if (dParent.firstChild == dh) {
		HRPLayout();

	}else if (dParent.lastChild == dh){
		mInsert(dParent, dh);
	}else{
		//swap it back down
		mAppend(dParent, dh);
		UI.DRR.remove();

	}

	
}
function _show_history_popup() {

	if (isdef(mBy('dHistoryPopup')) || isEmpty(Z.fen.history)) return;
	let dpop = mPopup('', dTable, { fz: 16, bg: colorLight('#EDC690', .5), rounding: 8, fg: 'dimgray', top: 0, right: 0, border: 'white' }, 'dHistoryPopup');
	mAppend(dpop, UI.dHistory);
	mInsert(dpop, mCreateFrom(`<div style="margin-left:10px;text-align:left;width:100%;font-family:Algerian;font-size:22px;">${Config.games[Z.game].friendly}</div>`));
	//let bclose = mButtonX(dpop, hide_options_popup, 'tr');
	let bclose = mButtonX(dpop, hide_history_popup, 'tr', 25, 'dimgray');
}

function show_history_popup() {
	
	let fen = Z.fen;
	if (!isEmpty(fen.history)) {
		let html = '';
		for (const arr of jsCopy(fen.history).reverse()) {
			html += arr;
			//html+=`<h1>${k}</h1>`;
			//for (const line of arr) { html += `<p>${line}</p>`; }
		}
		let dpop = mPopup('', dTable, { paleft:12, fz: 16, bg: colorLight('#EDC690',.5), rounding:8, fg: 'black', top: 0, right: 0, border: 'white' }, 'dOptions');
		let dHistory = mDiv(dpop, { matop:10, patop:10, w:'100%', hmax: `calc( 100vh - 250px )`, 'overflow-y': 'auto', wmin: 260 }, null, html); //JSON.stringify(fen.history));
		mInsert(dpop, mCreateFrom(`<div style="text-align:center;width:100%;font-family:Algerian;font-size:22px;">${Z.game}</div>`));
		// let bclose = mButtonX(dpop,'tr',hide_options_popup,null,12);
		let bclose = mButtonX(dpop, hide_options_popup, 'tr');

		//mNode(fen.history, dHistory, 'history');
	}
	//console.log('popup', dpop);
}

function mSuit(ckey, dParent, styles, pos='cc', classes) {

	console.log('mSuit!!!!!!!!!!!!!!!',ckey, dParent, styles, pos, classes);
	let di={H:'Herz0',S:'Pik',C:'Treff',D:'Karo'};
	let key = ckey.length == 1?di[ckey]:isdef(di[ckey[1]])?di[ckey[1]]:ckey;

	let svg = gCreate('svg');
	console.log('svg', svg);
	//svg.setAttribute('height', 25); //geht!!!
	let el = gCreate('use');
	el.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#' + key);
	mAppend(svg, el);

	console.log('el', el); 

	if (isdef(dParent)) mAppend(dParent, svg); 
	styles = valf(styles, { bg: 'random' });
	let sz = isdef(styles.h) ? styles.h : isdef(styles.sz) ? styles.sz : styles.w;
	if (isdef(sz)) { el.setAttribute('height', sz); svg.setAttribute('height', sz);el.setAttribute('width', sz); svg.setAttribute('width', sz); }
	mStyle(el, styles);
	if (isdef(styles.bg)) { 
		let color = colorFrom(styles.bg);
		console.log('color', color);
		//let html = el.innerHTML;
		//console.log('html', html);
		svg.setAttribute('fill', color); 
	} //sz); svg.setAttribute('height', sz);el.setAttribute('width', sz); svg.setAttribute('width', sz); }

	if (isdef(classes)) mClass(svg, classes);


	//if (isdef(d)) { mAppend(d, svg); gSizeToContent(svg); }

	//geht nur fuer eck positions!
	if (isdef(pos)) { mSuitPos(svg, pos); }
	// 	pos = pos.toLowerCase();
	// 	let di={t:'top',b:'bottom',r:'right',l:'left'};
	// 	svg.style.position = 'absolute';
	// 	svg.style[di[pos[0]]] = svg.style[di[pos[1]]] = 0;
	// }
	return svg;
}
function mSuit(ckey='S',dParent,styles,pos,classes) {
	let suit = ckey.length == 1?ckey:ckey[1];
	let svg = gCreate('svg');
	svg.setAttribute('viewBox',"-600 -600 1200 1200");
	svg.setAttribute('preserveAspectRatio','xMinYMid');
	svg.setAttribute('height','100%');
	svg.setAttribute('width','100%');
	let color = valf(styles.bg,suit == 'H' || suit == 'D'?'red':'black');
	let paths={
		H:"M0 -300C0 -400 100 -500 200 -500C300 -500 400 -400 400 -250C400 0 0 400 0 500C0 400 -400 0 -400 -250C-400 -400 -300 -500 -200 -500C-100 -500 0 -400 -0 -300Z",
		S:"M0 -500C100 -250 355 -100 355 185A150 150 0 0 1 55 185A10 10 0 0 0 35 185C35 385 85 400 130 500L-130 500C-85 400 -35 385 -35 185A10 10 0 0 0 -55 185A150 150 0 0 1 -355 185C-355 -100 -100 -250 0 -500Z",
		C:"M30 150C35 385 85 400 130 500L-130 500C-85 400 -35 385 -30 150A10 10 0 0 0 -50 150A210 210 0 1 1 -124 -51A10 10 0 0 0 -110 -65A230 230 0 1 1 110 -65A10 10 0 0 0 124 -51A210 210 0 1 1 50 150A10 10 0 0 0 30 150Z",
		D:"M-400 0C-350 0 0 -450 0 -500C0 -450 350 0 400 0C350 0 0 450 0 500C0 450 -350 0 -400 0Z"
	};
	console.log('suit', suit);
	svg.innerHTML = `
				<path
				d="${paths[suit]}"
				fill="${color}"></path>

		`;
	let d = mDiv(dParent, styles);
	mAppend(d,svg);
	if (isdef(pos)) mPlace(d,pos);
	if (isdef(classes)) mClass(d,classes);
	return d;
}
function mSuitPos(svg, pos) {
	// pos is: tl, tb, bl, br or cl, cr, tc, bc, cc
	pos = pos.toLowerCase();

	if (pos[0] == 'c' || pos[1] == 'c') {
		let dCard = svg.parentNode;
		let r = getRect(dCard);
		let [wCard, hCard] = [r.w, r.h];
		let [wSym, hSym] = [svg.getAttribute('width'), svg.getAttribute('height')];

		switch (pos) {
			case 'cc': mStyle(svg, { position: 'absolute', left: (wCard - wSym) / 2, top: (hCard - hSym) / 2 }); break;
			case 'tc': mStyle(svg, { position: 'absolute', left: (wCard - wSym) / 2, top: 0 }); break;
			case 'bc': mStyle(svg, { position: 'absolute', left: (wCard - wSym) / 2, bottom: 0 }); break;
			case 'cl': mStyle(svg, { position: 'absolute', left: 0, top: (hCard - hSym) / 2 }); break;
			case 'cr': mStyle(svg, { position: 'absolute', right: 0, top: (hCard - hSym) / 2 }); break;
		}
		return;
	}
	let di = { t: 'top', b: 'bottom', r: 'right', l: 'left' };
	svg.style.position = 'absolute';
	svg.style[di[pos[0]]] = svg.style[di[pos[1]]] = 0;
}
function mSuitSize(suit, sz) { suit.setAttribute('sz', sz); suit.firstChild.setAttribute('height', sz); gSizeToContent(suit); }

















