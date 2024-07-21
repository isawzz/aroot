function start() {

	mStyle(document.body, { bg: wblue });

	ltest5_catan(); //ltest4_catan_1hex(); //ltest3_catan(); //ltest2_hextest(); //ltest2(); //ltest1_hex(); //ltest0(); 
}




//#region ltest layout tests
function ltest5_catan() {
	let [rows, cols, wCell, hCell, wCorner, hCorner, cover] = [10, 10, 80, 80, 20, 10 * Math.sqrt(3), true];

	//field centers and overall board size:
	let [centers, wCont, hCont] = cover ? hexCenters(rows, cols, wCell, hCell) : hex1Centers(rows, cols, wCell, hCell);

	//board div
	let dBoard = mDiv(dMain, { position: 'relative', w: wCont, h: hCont, margin: 100 });

	//field visuals
	for (const pt of centers) {
		let d = drawShape('hex', dBoard, { w: wCell - 4, h: hCell - 4 });
		mClass(d, 'field');
		mCenterAt(d, pt.x, pt.y);
	}

	// corner centers
	let vertices = getCornerVertices(centers, wCell, hCell);

	//corner visuals
	for (const pt of vertices) {
		//let d = mDiv(dBoard, { rounding: '50%', w: wCorner, h: hCorner });
		let d = drawShape('hexF', dBoard, { w: wCorner, h: hCorner });
		mClass(d, 'corner');
		mCenterAt(d, pt.x, pt.y);
	}

	//make items with type,row,col
	let items = [];
	centers.map(x => items.push({ x: x.x, y: x.y, type: 'field' }));
	vertices.map(x => items.push({ x: x.x, y: x.y, type: 'corner' }));
	let byrc = addRowsCols(items);
	addIds(items);

	neighborhood(items, byrc);
	console.log('items', items);

	// add edges for ALL fields
	let di = {};
	let edges = [];
	for (const item of items) {
		if (item.type != 'field') continue;
		for (let i = 0; i < 6; i++) {
			let v1 = item.nodes[i];
			let v2 = item.nodes[(i + 1) % 6];
			if (lookup(di, [v1, v2]) || lookup(di, [v2, v1])) continue;
			let e = makeEdge(dBoard, Items[v1], Items[v2], hCorner / 2, 10);
			edges.push(e);
			lookupSet(di, [v1, v2], e);
		}
	}


}
function ltest4_catan_1hex() {
	let [rows, cols, wCell, hCell, wCorner, hCorner, cover] = [1, 1, 400, 400, 100, 50 * Math.sqrt(3), true];

	//field centers and overall board size:
	let [centers, wCont, hCont] = cover ? hexCenters(rows, cols, wCell, hCell) : hex1Centers(rows, cols, wCell, hCell);

	//board div
	let dBoard = mDiv(dMain, { position: 'relative', w: wCont, h: hCont, margin: 100 });

	//field visuals
	for (const pt of centers) {
		let d = drawShape('hex', dBoard, { w: wCell - 4, h: hCell - 4 });
		mClass(d, 'field');
		mCenterAt(d, pt.x, pt.y);
	}

	// corner centers
	let vertices = getCornerVertices(centers, wCell, hCell);

	//corner visuals
	for (const pt of vertices) {
		//let d = mDiv(dBoard, { rounding: '50%', w: wCorner, h: hCorner });
		let d = drawShape('hexF', dBoard, { w: wCorner, h: hCorner });
		mClass(d, 'corner');
		mCenterAt(d, pt.x, pt.y);
	}

	//das sind nur die plain vertices ohne connection zu den fields
	setCssVar('--color1', YELLOW);
	setCSSVariable('--color2', GREEN); //oh doch geht auch!
	mButton('mod colors', modifyColor, dMain);

	//make items with type,row,col
	let items = [];
	centers.map(x => items.push({ x: x.x, y: x.y, type: 'field' }));
	vertices.map(x => items.push({ x: x.x, y: x.y, type: 'corner' }));
	let byrc = addRowsCols(items);
	addIds(items);
	//console.log(byrc);
	//console.log(items);

	neighborhood(items, byrc);
	console.log('items', items);
	//return;

	// add edges for ALL fields
	let di = {};
	let edges = [];
	for (const item of items) {
		if (item.type != 'field') continue;
		for (let i = 0; i < 6; i++) {
			let v1 = item.nodes[i];
			let v2 = item.nodes[(i + 1) % 6];
			if (lookup(di, [v1, v2]) || lookup(di, [v2, v1])) continue;
			let e = makeEdge(dBoard, Items[v1], Items[v2], hCorner / 2);
			edges.push(e);
			lookupSet(di, [v1, v2], e);
		}
	}

}
function modifyColor() {
	setCssVar('--corner-color', YELLOW);
	setCssVar('--field-color', BLUE);
	setCssVar('--edge-color', PURPLE);
}
function ltest3_catan() {
	let [rows, cols, wCell, hCell, wCorner, hCorner, cover] = [5, 5, 100, 100, 25, 25, true];

	//field centers and overall board size:
	let [centers, wCont, hCont] = cover ? hexCenters(rows, cols, wCell, hCell) : hex1Centers(rows, cols, wCell, hCell);

	//board div
	let dBoard = mDiv(dMain, { position: 'relative', w: wCont, h: hCont, margin: 25 });

	//field visuals
	for (const pt of centers) {
		let d = drawShape('hex', dBoard, { w: wCell - 4, h: hCell - 4 });
		mClass(d, 'field');
		mCenterAt(d, pt.x, pt.y);
	}

	// corner centers
	let vertices = getCornerVertices(centers, wCell, hCell);

	//corner visuals
	for (const pt of vertices) {
		let d = mDiv(dBoard, { rounding: '50%', w: wCorner, h: hCorner });
		mClass(d, 'corner');
		mCenterAt(d, pt.x, pt.y);
	}

	//das sind nur die plain vertices ohne connection zu den fields
	mButton('mod colors', modifyColor, dMain);

	//make items with type,row,col
	let items = [];
	centers.map(x => items.push({ x: x.x, y: x.y, type: 'field' }));
	vertices.map(x => items.push({ x: x.x, y: x.y, type: 'corner' }));
	let byrc = addRowsCols(items);
	console.log(byrc);
	console.log(items);

}
function ltest2_hextest() {
	let [centers, wCont, hCont] = hexCenters(5, 4, 100, 100);
	console.log('centers', centers);
	let dCont = mDiv(dMain, { position: 'relative', w: wCont, h: hCont });
	for (const pt of centers) {
		let d = drawShape('hex', dCont);
		//mStyle(d,{transition:'2s'});
		mCenterAt(d, pt.x, pt.y);
		//mPos(d, pt.x - 50, pt.y - 50);
	}
	return dCont;
}
function ltest1_hex(chex = { x: 200, y: 200 }) {

	let centers = cCircle(chex, 400, 6);
	for (const c of centers) {
		let item = mPic('bee', dMain, { fz: 40, bg: 'skyblue', rounding: '50%', padding: 10 });
		mPos(iDiv(item), c.x, c.y);
	}
	let item = mPic('bee', dMain, { fz: 40, bg: 'skyblue', rounding: '50%', padding: 10 });
	mPos(iDiv(item), chex.x, chex.y);
}
function ltest0() {

	let centers = cCircle({ x: 300, y: 300 }, 400, 6);
	for (const c of centers) {
		let item = mPic('bee', dMain, { fz: 40, bg: 'skyblue', rounding: '50%', padding: 10 });

		mPos(iDiv(item), c.x, c.y);
	}
}






















