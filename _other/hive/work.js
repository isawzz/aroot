function createHexboard2(rows = 3, cols = 3, a = 48) {
	let sq3 = Math.sqrt(3);
	//let a = 48;
	let wp = a / 4, hp = a / 4, h = sq3 * a / 2;
	let [xoff, dx, yoff, dy] = [h + wp / 2, 2 * h, hp / 2, a / 2];

	return createHexboardHelper(rows, cols, dy, dx, yoff, xoff, hp, wp, a);
}
function createHexboard1(rows = 3, cols = 3, a = 48) {
	let sq3 = Math.sqrt(3);
	//let a = 48;
	let wp = a / 4, hp = a / 4, h = sq3 * a / 2;
	let [xoff, dx, yoff, dy] = [h + wp / 2, 2 * h, hp / 2, a / 2];

	return createHexboardHelper(rows, cols, dy, dx, yoff, xoff, hp, wp, a);
}
function createHexboardHelper(rows, cols, dy, dx, yoff, xoff, hp, wp, a) {
	//nlines: 1 line, then 4 lines per hex row
	//nxs: 1 + 2 per col
	//let [rows, maxcols] = [3, 4];
	let ys = 2 + 3 * rows;
	let xs = cols; //1 + 2 * maxcols;
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

	//console.log('byrc', byrc)
	let byxy = {};



	let adjList = [];
	let di = {};
	for (const info of infos) {
		//nodes from north! null if dont exist
		let [r, c] = [info.trow, info.tcol];
		//nodes for each field
		info.nodes = [
			lookup(byrc, [r - 2, c]),
			lookup(byrc, [r - 1, c + 1]),
			lookup(byrc, [r + 1, c + 1]),
			lookup(byrc, [r + 2, c]),
			lookup(byrc, [r + 1, c - 1]),
			lookup(byrc, [r + 1, c - 1]),
		];
		//edges between nodes
		for (let i = 0; i < 6; i++) {
			let n1 = info.nodes[i];
			if (n1 == null) continue;
			let n2 = info.nodes[(i + 1 % 6)];
			if (n2 == null) continue;
			if (lookup(di, [n1, n2]) || lookup(di, [n2, n1])) continue;
			lookupSet(di, [n1, n2], true);
			adjList.push([n1, n2]);
		}
		//field neighbors
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
function createHexboard(rows = 3, cols = 3, a = 48) {
	let sq3 = Math.sqrt(3);
	//let a = 48;
	let wp = a / 4, hp = a / 4, h = sq3 * a / 2;
	let [xoff, dx, yoff, dy] = [h + wp / 2, 2 * h, hp / 2, a / 2];
	//nlines: 1 line, then 4 lines per hex row
	//nxs: 1 + 2 per col
	//let [rows, maxcols] = [3, 4];
	let ys = 2 + 3 * rows;
	let xs = cols; //1 + 2 * maxcols;
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
		//nodes from north! null if dont exist
		let [r, c] = [info.trow, info.tcol];
		//nodes for each field
		info.nodes = [
			lookup(byrc, [r - 2, c]),
			lookup(byrc, [r - 1, c + 1]),
			lookup(byrc, [r + 1, c + 1]),
			lookup(byrc, [r + 2, c]),
			lookup(byrc, [r + 1, c - 1]),
			lookup(byrc, [r + 1, c - 1]),
		];
		//edges between nodes
		for (let i = 0; i < 6; i++) {
			let n1 = info.nodes[i];
			if (n1 == null) continue;
			let n2 = info.nodes[(i + 1 % 6)];
			if (n2 == null) continue;
			if (lookup(di, [n1, n2]) || lookup(di, [n2, n1])) continue;
			lookupSet(di, [n1, n2], true);
			adjList.push([n1, n2]);
		}
		//field neighbors
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
function drawCenteredBee(c) { return drawCenteredSym('bee', c); }
function drawBee(c) { return drawSym('bee', c); }

function get2Points(v1, v2) {
	let dx = v2.x - v1.x;
	let dy = v2.y - v1.y;
	//console.log('v1', v1, 'v2', v2, 'dx', dx, 'dy', dy);
	let alpha;
	if (dx == 1) alpha = dy > 0 ? 270 : 90;
	else alpha = 180 * Math.atan(dy / dx) / Math.PI;

	//console.log('angle between nodes', alpha);

	//jetzt brauch ich den angle+90
	let beta = (alpha + 90) % 360;

	//jetzt muss ich stroke festlegen
	let stroke = 10;
	let radius = 5;
	let rbeta = beta * Math.PI / 180;

	let x1 = radius * Math.cos(rbeta);
	let y1 = radius * Math.sin(rbeta);
	let x2 = -radius * Math.cos(rbeta);
	let y2 = -radius * Math.sin(rbeta);


	return { p1: { x: x1 + v1.x, y: y1 + v1.y }, p2: { x: x2 + v1.x, y: y2 + v1.y }, p3: { x: x1 + v2.x, y: y1 + v2.y }, p4: { x: x2 + v2.x, y: y2 + v2.y } };
}
function get2Points_mod(v1, v2) {
	let dx = v2.x - v1.x;
	let dy = v2.y - v1.y;
	//console.log('v1', v1, 'v2', v2, 'dx', dx, 'dy', dy);
	let alpha;
	if (dx == 1) alpha = dy > 0 ? 270 : 90;
	else alpha = 180 * Math.atan(dy / dx) / Math.PI;

	//console.log('angle between nodes', alpha);

	//jetzt brauch ich den angle+90
	let beta = (alpha + 90) % 360;

	//jetzt muss ich stroke festlegen
	let stroke = 10;
	let radius = 5;
	let rbeta = beta * Math.PI / 180;

	let x1 = radius * Math.cos(rbeta);
	let y1 = radius * Math.sin(rbeta);
	let x2 = -radius * Math.cos(rbeta);
	let y2 = -radius * Math.sin(rbeta);


	return { p1: { x: x1 + v1.x, y: y1 + v1.y }, p2: { x: x2 + v1.x, y: y2 + v1.y }, p3: { x: x1 + v2.x, y: y1 + v2.y }, p4: { x: x2 + v2.x, y: y2 + v2.y } };
}
function hextestNewBROKEN() {
	let info = createHexboard2(3, 4, 50);
	console.log('info', info);
	let [centers, maxx, maxy] = [[], 0, 0];
	let [wCell, hCell] = [100, 100];

	for (const item of info.items) {
		if (item.isHexCenter) {
			let [x, y] = [item.x, item.y];
			maxx = Math.max(maxx, x); maxy = Math.max(maxy, y);
			centers.push({ x: x, y: y });
		}
	}
	let wCont = maxx + wCell / 2;
	let hCont = maxy + hCell / 2;

	let resultOfHexCenters = [centers, wCont, hCont];
	console.log('centers', centers);
	let dCont = mDiv(dMain, { position: 'relative', w: wCont, h: hCont, bg: 'pink' });
	for (const pt of centers) {
		let d = drawShape('hex', dCont);
		//mStyle(d,{transition:'2s'});
		mCenterAt(d, pt.x, pt.y);
		//mPos(d, pt.x - 50, pt.y - 50);
	}

}
function iHexboard(cols = 3, rows = 3, a = 48) {
	let sq3 = Math.sqrt(3);
	let wp = a / 4, hp = a / 4, h = sq3 * a / 2;
	let [xoff, dx, yoff, dy] = [h + wp / 2, 2 * h, hp / 2, a / 2];
	//nlines: 1 line, then 4 lines per hex row
	//nxs: 1 + 2 per col

	let ys = 2 + 3 * rows;
	let xs = cols; //1 + 2 * maxcols;
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

	//console.log('byrc', byrc)
	let byxy = {};



	let adjList = [];
	let di = {};
	for (const info of infos) {
		//nodes from north! null if dont exist
		let [r, c] = [info.trow, info.tcol];
		//nodes for each field
		info.nodes = [
			lookup(byrc, [r - 2, c]),
			lookup(byrc, [r - 1, c + 1]),
			lookup(byrc, [r + 1, c + 1]),
			lookup(byrc, [r + 2, c]),
			lookup(byrc, [r + 1, c - 1]),
			lookup(byrc, [r + 1, c - 1]),
		];
		//edges between nodes
		for (let i = 0; i < 6; i++) {
			let n1 = info.nodes[i];
			if (n1 == null) continue;
			let n2 = info.nodes[(i + 1 % 6)];
			if (n2 == null) continue;
			if (lookup(di, [n1, n2]) || lookup(di, [n2, n1])) continue;
			lookupSet(di, [n1, n2], true);
			adjList.push([n1, n2]);
		}
		//field neighbors
		info.neighbors = [
			lookup(byrc, [r - 3, c + 1]),
			lookup(byrc, [r, c + 2]),
			lookup(byrc, [r + 3, c + 1]),
			lookup(byrc, [r + 3, c - 1]),
			lookup(byrc, [r, c - 2]),
			lookup(byrc, [r - 3, c - 1]),
		];

	}

	let boardItem = { dx: dx, dy: dy, rows: rows, cols: cols, count: infos.length, adjList: adjList, byrc: byrc, pts: pts, items: infos };
	return boardItem;
}
function ltest2_iHexboard() {

	let boardInfo = iHexboard(2, 3, 35);
	mFlex(dMain);
	console.log('HALLO'); //return;
	//let d = mDiv(dMain, { display: 'flex', bg: 'grey' });

	let dParent = mPanel(dMain);
	//console.log('dPanel', d);
	//setRect(d)
	//return;
	//mCenterCenterFlex(d);
	let board = mItem(null, { div: dParent }, boardInfo);


	console.log('board', board, '\nboard panel', iDiv(board));
	console.log('------------------')

	//visuals!
	let sym = chooseRandom(getAnimals());
	let items = [];
	for (const info of boardInfo.items) {

		//einfach nur ein simples item
		let d = mDiv(dParent, { bg: 'random', w: board.dx / 2, h: board.dy * 2 }); //, transform: 'rotate(90deg)' });
		mPos(d, info.pt.y, info.pt.x);
		let item = mItem(null, { div: d }, info);
		//mClass(d, 'hexagon');


		//console.log('info', info);		break;
		//let item = info.isHexCenter ? drawCenteredBee(info.pt) : drawCenteredPlainCircle(info.pt);
		items.push(item);

		//if (info.isHexCenter) mClass(d, 'hexagon');

		//console.log('pos', info.pt)
		//item.add(info.trow + ' ' + info.tcol, { styles: { fz: 10 }, key: 'label', pos: info.pt });




	}

}
function makeVisualsForHexboard(boardInfo) {

	let infos = boardInfo.items;

	//visuals!
	let sym = chooseRandom(getAnimals());
	let items = [];
	for (const info of infos) {
		let item = drawText(info.trow + ',' + info.tcol, info.pt);
		if (info.isHexCenter) mStyle(iDiv(item), { bg: 'pink' })
		items.push(item);
	}

}
function makeEdge1(dParent, v1, v2) {
	let poly = get2Points(v1, v2);

	//jetzt hab ich genau 1 edge
	//aber jetzt muss ich noch ein polygon machen!
	//console.log('v1', v1, 'v2', v2, 'poly', poly);

	//jetzt brauch ich das bounding rect!
	let minx = 100000, miny = 100000, maxx = -100000, maxy = -100000;
	for (const k in poly) {
		let pt = poly[k];
		minx = Math.min(pt.x, minx);
		miny = Math.min(pt.y, miny);
		maxx = Math.max(pt.x, maxx);
		maxy = Math.max(pt.y, maxy);
	}

	// console.log('minx', minx);
	// console.log('miny', miny);

	let bb = { x: minx, y: miny, w: maxx - minx, h: maxy - miny };
	//console.log('bb', bb)

	//jetzt mach ich ein div mit dem clip-path
	let de = mDiv(dParent, { position: 'absolute', left: minx, top: miny, w: bb.w, h: bb.h, bg: 'red' }); // drawShape('hex', dCont); //OK!
	//let de = mDiv(dCont, { position: 'absolute', w: maxx, h: maxy, bg: 'red' }); // drawShape('hex', dCont);
	//let de = mDiv100(dCont, { position: 'absolute', }); //, left: minx, top: miny, w: bb.w, h: bb.h, bg: 'red' }); // drawShape('hex', dCont);
	//let spoly = `polygon(${poly.p1.x} ${poly.p1.y}, ${poly.p2.x} ${poly.p2.y}, ${poly.p3.x} ${poly.p3.y}, ${poly.p4.x} ${poly.p4.y})`
	//console.log('spoly', spoly);
	//mStyle(de, { 'clip-path': spoly });

	//return;

	let [x1, y1, x2, y2] = [v1.x, v1.y, v2.x, v2.y];

	let stroke = 10;
	let sp = '';
	if (x1 == x2) {
		//this is a vertical line, either up or down
		if (y1 < y2) sp = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)';
		else sp = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)'; //same!
	} else if (y1 == y2) {
		sp = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)'; //same
	} else if (x1 < x2 && y1 < y2) {
		sp = `polygon(0% 0%, 0% 20%, 100% 100%, 100% 80%)`;
	} else if (x1 < x2 && y1 > y2) {
		sp = `polygon(0% 100%, 0% 80%, 100% 0%, 100% 20%)`;
	} else if (x1 > x2 && y1 < y2) {
		sp = `polygon(0% 100%, 0% 80%, 100% 0%, 100% 20%)`;
	} else {
		sp = `polygon(0% 0%, 0% 20%, 100% 100%, 100% 80%)`;
	}

	mStyle(de, { 'clip-path': sp });

	let e = mItem(null, { div: de }, { type: 'edge', nodes: [v1.id, v2.id] });

	return e;



	//try clipping a line from v1 to v2
	//first brauch ich den angle zwischen den lines



}
function makeEdgeW(dParent, v1, v2, dFromEdge, ew = 20) {

	mCircle(dParent, v1.x, v1.y, 5, 'red');

	let switched = false;
	if (v1.x == v2.x) {
		if (v1.y > v2.y) { let h = v2; v2 = v1; v1 = h; switched = true; }
		let w = ew / 2;

		let sp = `polygon(${v1.x - w + ew}px ${v1.y + dFromEdge + ew}px, ${v1.x + w + ew}px ${v1.y + dFromEdge + ew}px, ${v2.x + w + ew}px ${v2.y - dFromEdge + ew}px, ${v2.x - w + ew}px ${v2.y - dFromEdge + ew}px)`;
		//let sp = `polygon(90% 30%, 100% 30%, 90% 60%, 100% 60%)`;
		console.log('sp', sp)
		let de = mDiv(dParent, { position: 'absolute', left: -ew, top: -ew, w: '120%', h: '120%', bg: 'random' });
		// mStyle(de, { 'clip-path': `polygon(0% 0%, 0% 20%, 100% 100%, 100% 80%)` });
		mStyle(de, { 'clip-path': sp });
		return de;
	}
	if (v1.x > v2.x) { let h = v2; v2 = v1; v1 = h; switched = true; }

	let dx = v2.x - v1.x;
	let dy = v2.y - v1.y; //

	let m = dy / dx;
	let [x1, y1, x2, y2] = [v1.x, v1.y, v2.x, v2.y];

	let alpha = Math.atan(m);

	//line equation is: y=x1 + m*x
	// ich brauch jetzt den punkt auf der line 

	let xa = x1 + dFromEdge * Math.cos(alpha);
	let ya = y1 + dFromEdge * Math.sin(alpha);

	mCircle(dParent, xa, ya, 10, 'orange');

	let xe = x2 - dFromEdge * Math.cos(alpha);
	let ye = y2 - dFromEdge * Math.sin(alpha);

	mCircle(dParent, xe, ye, 10, 'orange');

	let m2 = -1 / m;
	let beta = Math.atan(m2);

	let w = ew / 2;
	let x1t = xa + w * Math.cos(beta);
	let y1t = ya + w * Math.sin(beta);
	mCircle(dParent, x1t, y1t, 5, 'green');
	let x1b = xa - w * Math.cos(beta);
	let y1b = ya - w * Math.sin(beta);
	mCircle(dParent, x1b, y1b, 5, 'green');

	let x2t = xe + w * Math.cos(beta);
	let y2t = ye + w * Math.sin(beta);
	mCircle(dParent, x2t, y2t, 5, 'violet');
	let x2b = xe - w * Math.cos(beta);
	let y2b = ye - w * Math.sin(beta);
	mCircle(dParent, x2b, y2b, 5, 'violet');


	//let de = mDiv(dParent, { position: 'absolute', left: 0, top: 0, w: 1000, h: 1000, bg: 'red' }); 
	//let de = mDiv100(dParent, { bg: 'blue' });
	let de = mDiv(dParent, { position: 'absolute', left: 0, top: 0, w: '120%', h: '120%', bg: 'random' });
	mStyle(de, { 'clip-path': `polygon(${x1t}px ${y1t}px, ${x2t}px ${y2t}px, ${x2b}px ${y2b}px, ${x1b}px ${y1b}px)` });
	return de;
	// let poly = get2Points_mod(v1, v2);

	// //jetzt brauch ich das bounding rect!
	// let minx = 100000, miny = 100000, maxx = -100000, maxy = -100000;
	// for (const k in poly) {
	// 	let pt = poly[k];
	// 	minx = Math.min(pt.x, minx);
	// 	miny = Math.min(pt.y, miny);
	// 	maxx = Math.max(pt.x, maxx);
	// 	maxy = Math.max(pt.y, maxy);
	// }

	// let bb = { x: minx, y: miny, w: maxx - minx, h: maxy - miny };
	// let de = mDiv(dParent, { position: 'absolute', left: minx, top: miny, w: bb.w, h: bb.h, bg: 'red' }); // drawShape('hex', dCont); //OK!
	// let [x1, y1, x2, y2] = [v1.x, v1.y, v2.x, v2.y];

	// let stroke = 10;
	// let sp = '';
	// if (x1 == x2) {
	// 	if (y1 < y2) sp = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)';
	// 	else sp = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)'; //same!
	// } else if (y1 == y2) {
	// 	sp = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)'; //same
	// } else if (x1 < x2 && y1 < y2) {
	// 	sp = `polygon(0% 0%, 0% 20%, 100% 100%, 100% 80%)`;
	// } else if (x1 < x2 && y1 > y2) {
	// 	sp = `polygon(0% 100%, 0% 80%, 100% 0%, 100% 20%)`;
	// } else if (x1 > x2 && y1 < y2) {
	// 	sp = `polygon(0% 100%, 0% 80%, 100% 0%, 100% 20%)`;
	// } else {
	// 	sp = `polygon(0% 0%, 0% 20%, 100% 100%, 100% 80%)`;
	// }
	// mStyle(de, { 'clip-path': sp });
	// let e = mItem(null, { div: de }, { type: 'edge', nodes: [v1.id, v2.id] });
	// return e;
}
function modifyColor() {
	const colors = [YELLOW, 'skyblue', "green", "purple", "yellow"];
	document.body.style.setProperty('--corner-color', colors[Math.floor(Math.random() * colors.length)]);
	document.body.style.setProperty('--color1', colors[Math.floor(Math.random() * colors.length)]);
	document.body.style.setProperty('--color2', colors[Math.floor(Math.random() * colors.length)]);
}
function neighborhood2(items, byrc) {
	let adjList = [];
	let di = {};
	for (const info of items) {
		//nodes from north! null if dont exist
		let [r, c] = [info.row, info.col];
		//nodes for each field
		info.nodeItems = [
			lookup(byrc, [r - 2, c]),
			lookup(byrc, [r - 1, c + 1]),
			lookup(byrc, [r + 1, c + 1]),
			lookup(byrc, [r + 2, c]),
			lookup(byrc, [r + 1, c - 1]),
			lookup(byrc, [r + 1, c - 1]),
		];
		info.nodes = info.nodeItems.map(x => x ? x.id : null);
		delete info.nodeItems;

		//edges between nodes
		for (let i = 0; i < 6; i++) {
			let n1 = info.nodes[i];
			if (n1 == null) continue;
			let n2 = info.nodes[(i + 1 % 6)];
			if (n2 == null) continue;
			if (lookup(di, [n1, n2]) || lookup(di, [n2, n1])) continue;
			lookupSet(di, [n1, n2], true);
			adjList.push([n1, n2]);
		}
		//field neighbors
		info.neighbors = [
			lookup(byrc, [r - 3, c + 1]),
			lookup(byrc, [r, c + 2]),
			lookup(byrc, [r + 3, c + 1]),
			lookup(byrc, [r + 3, c - 1]),
			lookup(byrc, [r, c - 2]),
			lookup(byrc, [r - 3, c - 1]),
		];

	}

}
function neighborhood1(items, byrc) {
	let adjList = [];
	let di = {};
	for (const info of items) {
		//nodes from north! null if dont exist
		let [r, c] = [info.row, info.col];
		//nodes for each field
		info.nodes = [
			lookup(byrc, [r - 2, c]),
			lookup(byrc, [r - 1, c + 1]),
			lookup(byrc, [r + 1, c + 1]),
			lookup(byrc, [r + 2, c]),
			lookup(byrc, [r + 1, c - 1]),
			lookup(byrc, [r + 1, c - 1]),
		];
		//edges between nodes
		for (let i = 0; i < 6; i++) {
			let n1 = info.nodes[i];
			if (n1 == null) continue;
			let n2 = info.nodes[(i + 1 % 6)];
			if (n2 == null) continue;
			if (lookup(di, [n1, n2]) || lookup(di, [n2, n1])) continue;
			lookupSet(di, [n1, n2], true);
			adjList.push([n1, n2]);
		}
		//field neighbors
		info.neighbors = [
			lookup(byrc, [r - 3, c + 1]),
			lookup(byrc, [r, c + 2]),
			lookup(byrc, [r + 3, c + 1]),
			lookup(byrc, [r + 3, c - 1]),
			lookup(byrc, [r, c - 2]),
			lookup(byrc, [r - 3, c - 1]),
		];

	}

}
function tri4() {
	let sq3 = Math.sqrt(3);
	let a = 48;
	let wp = a / 4, hp = a / 4, h = sq3 * a / 2;
	let [xoff, dx, yoff, dy] = [h + wp / 2, 2 * h, hp / 2, a / 2];
	//nlines: 1 line, then 4 lines per hex row
	//nxs: 1 + 2 per col
	let [rows, maxcols] = [3, 4];
	let ys = 2 + 3 * rows;
	let xs = maxcols; //1 + 2 * maxcols;
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
		//nodes from north! null if dont exist
		let [r, c] = [info.trow, info.tcol];
		//nodes for each field
		info.nodes = [
			lookup(byrc, [r - 2, c]),
			lookup(byrc, [r - 1, c + 1]),
			lookup(byrc, [r + 1, c + 1]),
			lookup(byrc, [r + 2, c]),
			lookup(byrc, [r + 1, c - 1]),
			lookup(byrc, [r + 1, c - 1]),
		];
		//edges between nodes
		for (let i = 0; i < 6; i++) {
			let n1 = info.nodes[i];
			if (n1 == null) continue;
			let n2 = info.nodes[(i + 1 % 6)];
			if (n2 == null) continue;
			if (lookup(di, [n1, n2]) || lookup(di, [n2, n1])) continue;
			lookupSet(di, [n1, n2], true);
			adjList.push([n1, n2]);
		}
		//field neighbors
		info.neighbors = [
			lookup(byrc, [r - 3, c + 1]),
			lookup(byrc, [r, c + 2]),
			lookup(byrc, [r + 3, c + 1]),
			lookup(byrc, [r + 3, c - 1]),
			lookup(byrc, [r, c - 2]),
			lookup(byrc, [r - 3, c - 1]),
		];

	}



	//visuals!
	let sym = chooseRandom(getAnimals());
	let items = [];
	for (const info of infos) {
		let item = drawText(info.trow + ',' + info.tcol, info.pt);
		if (info.isHexCenter) mStyle(iDiv(item), { bg: 'pink' })
		items.push(item);
	}
}
function tri3() {
	let sq3 = Math.sqrt(3);
	let a = 48;
	let wp = a / 4, hp = a / 4, h = sq3 * a / 2;
	let [xoff, dx, yoff, dy] = [h + wp / 2, 2 * h, hp / 2, a / 2];
	//nlines: 1 line, then 4 lines per hex row
	//nxs: 1 + 2 per col
	let [rows, maxcols] = [3, 4];
	let ys = 2 + 3 * rows;
	let xs = maxcols; //1 + 2 * maxcols;
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
		//nodes from north! null if dont exist
		let [r, c] = [info.trow, info.tcol];
		//nodes for each field
		info.nodes = [
			lookup(byrc, [r - 2, c]),
			lookup(byrc, [r - 1, c + 1]),
			lookup(byrc, [r + 1, c + 1]),
			lookup(byrc, [r + 2, c]),
			lookup(byrc, [r + 1, c - 1]),
			lookup(byrc, [r + 1, c - 1]),
		];
		//edges between nodes
		for (let i = 0; i < 6; i++) {
			let n1 = info.nodes[i];
			if (n1 == null) continue;
			let n2 = info.nodes[(i + 1 % 6)];
			if (n2 == null) continue;
			if (lookup(di, [n1, n2]) || lookup(di, [n2, n1])) continue;
			lookupSet(di, [n1, n2], true);
			adjList.push([n1, n2]);
		}
		//field neighbors
		info.neighbors = [
			lookup(byrc, [r - 3, c + 1]),
			lookup(byrc, [r, c + 2]),
			lookup(byrc, [r + 3, c + 1]),
			lookup(byrc, [r + 3, c - 1]),
			lookup(byrc, [r, c - 2]),
			lookup(byrc, [r - 3, c - 1]),
		];

	}


	//visuals!
	let sym = chooseRandom(getAnimals());
	let items = [];
	for (const info of infos) {
		let item = drawText(info.trow + ',' + info.tcol, info.pt);
		items.push(item);
	}
}
function tri2() {
	let sq3 = Math.sqrt(3);
	let a = 48;
	let wp = a / 4, hp = a / 4, h = sq3 * a / 2;
	let [xoff, dx, yoff, dy] = [h + wp / 2, 2 * h, hp / 2, a / 2];
	//nlines: 1 line, then 4 lines per hex row
	//nxs: 1 + 2 per col
	let [rows, maxcols] = [3, 4];
	let ys = 2 + 3 * rows;
	let xs = maxcols; //1 + 2 * maxcols;
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
		//nodes from north! null if dont exist
		let [r, c] = [info.trow, info.tcol];
		//nodes for each field
		info.nodes = [
			lookup(byrc, [r - 2, c]),
			lookup(byrc, [r - 1, c + 1]),
			lookup(byrc, [r + 1, c + 1]),
			lookup(byrc, [r + 2, c]),
			lookup(byrc, [r + 1, c - 1]),
			lookup(byrc, [r + 1, c - 1]),
		];
		//edges between nodes
		for (let i = 0; i < 6; i++) {
			let n1 = info.nodes[i];
			if (n1 == null) continue;
			let n2 = info.nodes[(i + 1 % 6)];
			if (n2 == null) continue;
			if (lookup(di, [n1, n2]) || lookup(di, [n2, n1])) continue;
			lookupSet(di, [n1, n2], true);
			adjList.push([n1, n2]);
		}
		//field neighbors
		info.neighbors = [
			lookup(byrc, [r - 3, c + 1]),
			lookup(byrc, [r, c + 2]),
			lookup(byrc, [r + 3, c + 1]),
			lookup(byrc, [r + 3, c - 1]),
			lookup(byrc, [r, c - 2]),
			lookup(byrc, [r - 3, c - 1]),
		];

	}


	//visuals!
	let sym = chooseRandom(getAnimals());
	let items = [];
	for (const info of infos) {
		let item = info.isHexCenter ? drawCenteredBee(info.pt) : drawCenteredPlainCircle(info.pt);
		items.push(item);
		let d = iDiv(item);
		if (info.isHexCenter) mClass(d, 'hexagon');
		if (info.isHexCenter) mText(info.trow + ' ' + info.tcol, d, { fz: 10 });




	}
}
function tri1() {
	let sq3 = Math.sqrt(3);
	let a = 48;
	let wp = a / 4, hp = a / 4, h = sq3 * a / 2;
	let [xoff, dx, yoff, dy] = [h + wp / 2, 2 * h, hp / 2, a / 2];
	//nlines: 1 line, then 4 lines per hex row
	//nxs: 1 + 2 per col
	let [rows, maxcols] = [3, 4];
	let ys = 2 + 3 * rows;
	let xs = maxcols; //1 + 2 * maxcols;
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
		//nodes from north! null if dont exist
		let [r, c] = [info.trow, info.tcol];
		//nodes for each field
		info.nodes = [
			lookup(byrc, [r - 2, c]),
			lookup(byrc, [r - 1, c + 1]),
			lookup(byrc, [r + 1, c + 1]),
			lookup(byrc, [r + 2, c]),
			lookup(byrc, [r + 1, c - 1]),
			lookup(byrc, [r + 1, c - 1]),
		];
		//edges between nodes
		for (let i = 0; i < 6; i++) {
			let n1 = info.nodes[i];
			if (n1 == null) continue;
			let n2 = info.nodes[(i + 1 % 6)];
			if (n2 == null) continue;
			if (lookup(di, [n1, n2]) || lookup(di, [n2, n1])) continue;
			lookupSet(di, [n1, n2], true);
			adjList.push([n1, n2]);
		}
		//field neighbors
		info.neighbors = [
			lookup(byrc, [r - 3, c + 1]),
			lookup(byrc, [r, c + 2]),
			lookup(byrc, [r + 3, c + 1]),
			lookup(byrc, [r + 3, c - 1]),
			lookup(byrc, [r, c - 2]),
			lookup(byrc, [r - 3, c - 1]),
		];

	}


	//visuals!
	let sym = chooseRandom(getAnimals());
	let items = [];
	for (const info of infos) {
		let item = info.isHexCenter ? drawBee(info.pt) : drawSym(sym, info.pt);
		items.push(item);
	}
}
function tri0() {
	let sq3 = 1.73205080757;
	let sq3b = Math.sqrt(3);
	console.log('sq3', sq3, 'sq3b', sq3b)
}

