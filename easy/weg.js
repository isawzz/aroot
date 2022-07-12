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

















