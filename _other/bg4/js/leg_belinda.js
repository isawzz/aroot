
//#region ai.js
class SoloPlayer {
	constructor(user) {
		this.color = getColorDictColor(user.settings.userColor);
		this.id = user.id;
		this.score = 0;
	}
}
class AIPlayer {
	constructor(max_depth = -1) {
		this.id = getUID('AI');
		this.color = randomColor();
		this.type = 'ai';
		this.score = 0;
		// this.max_depth = max_depth;
		// this.nodes_map = new Map();
	}
	setData(o) { copyKeys(o, this); }
}

var CCC = 0;
function AIMinimax(g, callback) {
	let state = g.getState();
	state = boardToNode(state);
	//console.log('==>AI search: myMinimax (maxDepth', g.searchDepth + ')');
	F_END = g.evalState;
	F_HEURISTIC = g.heuristic;
	F_MOVES = g.getAvailableMoves;
	F_APPLYMOVE = g.applyMove;
	F_UNDOMOVE = g.undoMove;
	MAXIMIZER = g.plTurn;
	MINIMIZER = g.plOpp;
	SelectedMove = null;
	let algorithm = g.copyState==true ? minimaxCopy : myMinimax;
	let val = algorithm(state, 0, -Infinity, Infinity, g.searchDepth, true);
	//console.log('chosen move has value', val, 'nodes inspected:', CCC);
	//if (!SelectedMove)
	CCC = 0;

	callback(SelectedMove);
}
function myMinimax(node, depth, alpha, beta, maxDepth, maxim) {
	CCC += 1;
	if (depth >= maxDepth) return 1;
	let ec = F_END(node, depth); if (ec.reached) return ec.val;
	depth += 1;
	var move, result;
	var availableMoves = F_MOVES(node);
	let player = maxim ? MAXIMIZER : MINIMIZER;
	for (var i = 0; i < availableMoves.length; i++) {
		move = availableMoves[i];
		F_APPLYMOVE(node, move, player);
		result = myMinimax(node, depth, alpha, beta, maxDepth, !maxim);
		F_UNDOMOVE(node, move, player);
		if (maxim) {
			if (result > alpha) {
				//console.log('new best', result, move);
				alpha = result;
				if (depth == 1) SelectedMove = move;
			} else if (alpha >= beta) { return alpha; }
		} else {
			if (result < beta) {
				beta = result;
				if (depth == 1) SelectedMove = move;
			} else if (beta <= alpha) { return beta; }
		}
	}
	return maxim ? alpha : beta;
}

function minimaxCopy(node, depth, alpha, beta, maxDepth, maxim) {
	CCC += 1;
	if (depth >= maxDepth) return F_HEURISTIC(node,MAXIMIZER,MINIMIZER);
	let ec = F_END(node, depth); if (ec.reached) return ec.val;
	depth += 1;
	var move, result;
	var availableMoves = F_MOVES(node);
	//if (depth == 1) console.log(availableMoves)
	let player = maxim ? MAXIMIZER : MINIMIZER;
	let nodeSafe = jsCopy(node);
	for (var i = 0; i < availableMoves.length; i++) {
		move = availableMoves[i];
		let node1 = jsCopy(node);
		console.assert(sameList(nodeSafe,node),'HA!');
		//printState(node1);
		F_APPLYMOVE(node1, move, player);
		result = minimaxCopy(node1, depth, alpha, beta, maxDepth, !maxim);
		//if (depth == 1)console.log(result);
		//if (CCC>0) {SelectedMove = move;return 1;}
		if (maxim) {
			if (result > alpha) {
				//console.log('new best', result, move, depth);
				alpha = result;
				if (depth == 1) SelectedMove = move;
			} else if (alpha >= beta) { return alpha; }
		} else {
			if (result < beta) {
				beta = result;
				if (depth == 1) SelectedMove = move;
			} else if (beta <= alpha) { return beta; }
		}
	}
	return maxim ? alpha : beta;
}



//#endregion

//#region all.js
function canAct() { return (aiActivated || uiActivated) && !auxOpen; }
function canHumanAct() { return uiActivated && !auxOpen; }
function canAIAct() { return aiActivated && !auxOpen; }
function setGame_dep(game, immediate = false) {
	cleanupOldGame();
	resetUIDs();
	if (isdef(G) && G.id != game) Score.gameChange = true;

	//console.log('game',game)
	G = new (classByName(capitalize(game)))(game, DB.games[game]);
	Settings = new SettingsClass(G, dAux); //DEPRECATED!
	//console.log('G',G)

	if (nundef(U.games[game])) {
		if (G.controllerType == 'solitaire') { U.games[game] = { nTotal: 0, nCorrect: 0, nCorrect1: 0, startlevel: 0 }; }
		else U.games[game] = {};
	}

	if (isdef(G.maxlevel)) G.level = Math.min(getUserStartLevel(game), G.maxlevel);

	//if (G.id != 'gAristo') Settings.updateGameValues(U, G); //hier werden die belinda settings geadded
	Settings.updateGameValues(U, G); 
	// presentNode(G,'HALLO',dTable.firstChild)

	save_users(); //???das sollte nur gemacht werden wenn wirklich was sich geaendert hat!

	//hier werden die av_modes eingelesen und gecheckt und der av_mode wird von def_playmode genommen oder default (erster av_mode)
	//console.log('av_modes',G.av_modes);
	let s = valf(G.av_modes,'training');
	//console.log('G.av_modes',s);
	let modes = s.split(',');
	//console.log('modes',modes);
	if (!modes.includes(Session.def_playmode)) Session.def_playmode = modes[0];
	G.playmode = Session.def_playmode;
	//playmode determines Controller unless have controller_class also
	if (nundef(G.controller_class)) G.controller_class = `Controller${capitalize(G.playmode)}`;
	//console.log('class',G.controller_class)
	GC = new (classByName(G.controller_class))(G,U);	
	//GC = new window[G.controller_class](G,U);
	// switch (G.mode) {
	// 	case 'solitaire': GC = PROJECTNAME == 'belinda'?new ControllerSolitaire(G, U):new ControllerSolitaireMinimal(G, U); break;
	// 	case 'solo': GC = new ControllerTTT(G, U); break;
	// 	case 'chess': GC = new ControllerChess(G, U); break;
	// 	//case 'multi': GC = new ControllerMulti(G, U); break;
	// 	case 'c52': GC = new ControllerC52(G, U); break;
	// }
	G.controller = GC;
	//console.log('G',G,'GC',GC)
	showGameTitle();
	if (immediate) GC.startGame();
}
function setGame(game, immediate = false) {
	cleanupOldGame();
	resetUIDs();
	if (isdef(G) && G.id != game) Score.gameChange = true;

	//console.log('game',game)
	G = new (classByName(capitalize(game)))(game, DB.games[game]);
	Settings = new SettingsClass(G, dAux);
	//console.log('G',G)

	if (nundef(U.games[game])) {
		if (G.controllerType == 'solitaire') { U.games[game] = { nTotal: 0, nCorrect: 0, nCorrect1: 0, startlevel: 0 }; }
		else U.games[game] = {};
	}

	if (isdef(G.maxlevel)) G.level = Math.min(getUserStartLevel(game), G.maxlevel);

	if (G.id != 'gAristo') Settings.updateGameValues(U, G); //hier werden die belinda settings geadded
	// presentNode(G,'HALLO',dTable.firstChild)

	save_users(); //das sollte nur gemacht werden wenn wirklich was sich geaendert hat!

	switch (G.controllerType) {
		case 'solitaire': GC = PROJECTNAME == 'belinda'?new ControllerSolitaire(G, U):new ControllerSolitaireMinimal(G, U); break;
		case 'solo': GC = new ControllerTTT(G, U); break;
		case 'chess': GC = new ControllerChess(G, U); break;
		//case 'multi': GC = new ControllerMulti(G, U); break;
		case 'c52': GC = new ControllerC52(G, U); break;
	}
	G.controller = GC;
	//console.log('G',G,'GC',GC)
	showGameTitle();
	if (immediate) GC.startGame();
}

//fraction helpers
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
function fractionsUnder1ByDenominator() {
	let fr = {
		2: [1],
		3: [1, 2],
		4: [1, 3],
		5: [1, 2, 3, 4],
		6: [1, 5],
		7: [1, 2, 3, 4, 5, 6],
		8: [1, 3, 5, 7],
		9: [1, 2, 4, 5, 7, 8],
	};
	return fr;
}
function getTextForMixed(full, num, denom) {
	let s = '' + full;
	if (isdef(num) && isdef(denom)) s += ' ' + num + '&frasl;' + denom;
	return s;
}
function getTextForFractionX(num, denom) {
	if (num == denom) return '1';
	else if (denom == 1) return num;
	else if (num / denom > 2) {
		let mixed = getMixedNumber(num, denom);
		//console.log('mixed',mixed)
		return getTextForMixed(mixed.full, mixed.n, mixed.d);
	} else {
		let s = '' + num + '&frasl;' + denom; return s;
	}
}
function getTextForFraction(num, denom) {
	let s = '' + num + '&frasl;' + denom; return s;
}
function getMixedNumber(num, denom) {
	const quotient = Math.floor(num / denom);
	const remainder = num % denom;
	if (remainder === 0) {
		return { full: quotient, frac: null, n: null, d: null };
	} else {
		return { full: quotient, frac: math.fraction(remainder, denom), n: remainder, d: denom };
	};
}
function getRandomFraction(num, denom) {
	if (isdef(denom)) {
		if (nundef(num)) num = randomNumber(1, denom - 1);
		return math.fraction(num, denom);
	} else if (isdef(num)) {
		//num defined but denom not
		denom = randomNumber(2, 9);
		return math.fraction(num, denom);
	}

	let flist = all2DigitFractionsUnder1Expanded();
	// if (isdef(num)) flist = flist.filter(x => x.numer == num);
	// if (isdef(denom)) flist = flist.filter(x => x.denom == num);

	//console.log('flist', flist);
	let fr = chooseRandom(flist);
	return math.fraction(Number(fr.numer), Number(fr.denom));
}
function getFractionVariantsTrial1(res) {
	let num = getRandomFractions(res, 8);
	let resInList = firstCond(nums, x => x.n == res.n && x.d == res.d);
	if (!resInList) nums.push(res);

	//von den nums eliminate 
	let finalNums = nums.filter(x => x.n == res.n);
	let otherNums = nums.filter(x => x.n != res.n);
	if (finalNums.length < 4) {
		let nMissing = 4 - finalNums.length;
		let additional = choose(otherNums, nMissing);
		finalNums = finalNums.concat(additional);
	}
	nums = finalNums;
	return nums;
}
function get3FractionVariants(fr, sameNum = false, sameDenom = true) {
	let num = fr.n;
	let rnd1 = randomNumber(1, 2);
	let rnd2 = rnd1 + randomNumber(1, 3);
	let rnd3 = rnd2 + randomNumber(1, 5);
	let nums = sameNum ? [num, num, num, num] : [num, num + rnd1, num > 5 ? (num - rnd2) : num + rnd2, num + rnd3];

	let den = fr.d;
	let denoms = sameDenom ? [den, den, den, den] : sameNum ? [den, den + 1, den + 2, den > 2 ? den - 1 : den + 3]
		: [den, den + 1, den + 2, den];
	//console.log('res',fr,'\nnums',nums,'\ndenoms',denoms);

	let frlist = [];
	for (let i = 0; i < 4; i++) {
		frlist.push(math.fraction(nums[i], denoms[i]));
	}
	return frlist;
}

function getRandomFractions(n) {
	let flist = all2DigitFractionsUnder1Expanded();
	let frlist = choose(flist, n);
	//console.log('frlist',frlist)
	return frlist.map(x => math.fraction(Number(x.numer), Number(x.denom)));
}


function simplifyFraction(numerator, denominator) {
	var gcd = function gcd(a, b) {
		return b ? gcd(b, a % b) : a;
	};
	gcd = gcd(numerator, denominator);
	return [numerator / gcd, denominator / gcd];
}






//#endregion

//#region areas.js (features)
function fixedSizeGrid(m, d) {
	let rows = m.length;
	let cols = m[0].length;
	d.style.gridTemplateColumns = 'repeat(' + cols + ',1fr)'; // gtc.join(' '); //'min-content 1fr 1fr min-content';// 'min-content'.repeat(rows);
	d.style.gridTemplateRows = 'repeat(' + rows + ',1fr)'; // //'min-content 1fr 1fr min-content';// 'min-content'.repeat(rows);
}
function collapseSmallLetterAreas(m, d) {
	//how many columns does this grid have?
	let rows = m.length;
	let cols = m[0].length;
	//console.log(m);

	let gtc = [];
	for (let c = 0; c < cols; c++) {
		gtc[c] = 'min-content';
		for (let r = 0; r < rows; r++) {
			let sArea = m[r][c];
			//console.log(c, r, m[r], m[r][c]);
			if (sArea[0] == sArea[0].toUpperCase()) gtc[c] = 'auto';
		}
	}
	let cres = gtc.join(' ');
	//console.log('cols', cres);
	d.style.gridTemplateColumns = gtc.join(' '); //'min-content 1fr 1fr min-content';// 'min-content'.repeat(rows);

	let gtr = [];
	for (let r = 0; r < rows; r++) {
		gtr[r] = 'min-content';
		for (let c = 0; c < cols; c++) {
			let sArea = m[r][c];
			//console.log(r, c, m[r], m[r][c]);
			if (sArea[0] == sArea[0].toUpperCase()) gtr[r] = 'auto';
		}
	}
	let rres = gtr.join(' ');
	//console.log('rows', rres);
	d.style.gridTemplateRows = gtr.join(' '); //'min-content 1fr 1fr min-content';// 'min-content'.repeat(rows);

	// d.style.gridTemplateRows = '1fr 1fr min-content min-content';// 'min-content'.repeat(cols);

}
function createGridLayout(d, layout, collapseEmptySmallLetterAreas=false) {
	//first need to make each line of grid layout equal sized! do I? what happens if I dont?
	let s = '';
	let m = [];
	let maxNum = 0;
	let areaNames = [];
	// console.log('layout', layout)
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
	//console.log('jagged matrix:', m)

	//habe jagged array, muss into matrix verwandeln!
	//last letter of each row will be repeated!
	for (const line of m) {
		let el = line[line.length - 1];
		while (line.length < maxNum) line.push(el);
		s += '"' + line.join(' ') + '" ';

	}
	//console.log('matrix:', m)

	//console.log(m);
	d.style.gridTemplateAreas = s;// eg. '"z z z" "a b c" "d e f"';

	if (collapseEmptySmallLetterAreas) { collapseSmallLetterAreas(m, d); }
	else fixedSizeGrid(m, d);

	return areaNames;
}

//nur in testing verwendet:
function createAreas(dGrid, areaNames, prefix, shadeAreaBackgrounds=false, showAreaNames=true) {
	console.log('creating areas',areaNames)
	let SPEC={};SPEC.areas = { T: 'dTrick', H: 'dHuman', A: 'dAI' };
	let palette = getTransPalette9(); //getPalette(color);//palette.length-1;
	let ipal = 1;

	let result = [];
	for (const k in SPEC.areas) {
		let areaName = SPEC.areas[k];
		let dCell = mDiv(dGrid, { h:'100%', w:'100%', bg: 'random', 'grid-area': k, });

		if (shadeAreaBackgrounds) { dCell.style.backgroundColor = palette[ipal]; ipal = (ipal + 1) % palette.length; }
		if (showAreaNames) { 
			dCell=mTitledDiv(areaName,dCell,{bg: 'green',},{h:'100%', w:'100%', bg: 'yellow',},areaName)
		}else {dCell.id=areaName;}
		result.push({ name: areaName, div: dCell });
	}
	return result;
}
//#endregion

//#region house.js
//new API
function convertToGraphElements(g1,house) {
	// let elements = { nodes: [], edges: [] };
	let vertices = house.rooms.map(x => Items[x]);
	let doors = [];
	for (const v of vertices) {

		v.center = getCenter(v.rect);
		v.center.x+=v.rect.l-house.rect.l;
		v.center.y+=v.rect.t-house.rect.t;

		g1.addNode(v,v.center);
		// elements.nodes.push({ data: v, position: v.center });
		doors = union(doors, v.doors);
	}

	let centers = g1.getNodes().map(x=>x.data('center'));
	g1.storePositions('prest',centers);
	let edges = doors.map(x => Items[x]).filter(x => x.rooms.length == 2);
	//console.log('edges in converter:',edges)
	for (const e of edges) {
		if (e.rooms.length < 2) continue;
		e.source = e.rooms[0];
		e.target = e.rooms[1];
		g1.addEdge(e.source,e.target,e);
		// elements.edges.push({ data: e });
	}
	//return elements;
}

//testing
function makeNewLayout(g1) {
	let nodes = g1.getNodes();
	let x = 10; let y = 10;
	for (n of nodes) {
		n.position({ x: x, y: y });
		x += 50; y += 50; if (y > 250) { y = 10; } if (x > 550) { x = 10; }
	}
}

function setPositionData(g1) {
	let ids = g1.getNodeIds();
	for (const id of ids) {
		let pos = g1.getProp(id, 'center');
		g1.setPosition(id, pos.x, pos.y);
	}
	g1.reset();
}
function storePositionData(g1) {
	let ids = g1.getNodeIds();
	let x = 10; let y = 10;
	for (const id of ids) {
		g1.setProp(id, 'center', { x: x, y: y });
		x += 50; y += 50; if (y > 250) { y = 10; } if (x > 550) { x = 10; }
	}
}
function storeRoomPositions(g1, house) {
	let ids = g1.getNodeIds();
	let di = g1.posDict = {};
	for (const id of ids) {
		let r = Items[id];
		let center = getCenter(iDiv(r));
		center.x += r.rect.x;
		center.y += r.rect.y;
		//console.log('center of room',id,center);
		g1.setProp(id, 'center', center);
		di[id] = center;
	}
}
function convertToGraphElements_dep(g1,house) {
	let elements = { nodes: [], edges: [] };
	let vertices = house.rooms.map(x => Items[x]);
	let doors = [];
	for (const v of vertices) {
		v.center = getCenter(v.rect);
		elements.nodes.push({ data: v, position: v.center });
		doors = union(doors, v.doors);
	}
	let edges = doors.map(x => Items[x]).filter(x => x.rooms.length == 2);
	//console.log('edges in converter:',edges)
	for (const e of edges) {
		if (e.rooms.length < 2) continue;
		e.source = e.rooms[0];
		e.target = e.rooms[1];
		elements.edges.push({ data: e });
	}
	return elements;
}
function iDoor(r1, dir, r2, styles = {}) {
	r1 = isString(r1) ? Items[r1] : r1;
	let house = Items[r1.house];
	r2 = isdef(r2) ? isString(r2) ? Items[r2] : r2 : null;
	let wall = r2 ? findWall(r1, r2) : isdef(dir) ? findFreeWall(r1, r1.walls[dir]) : findFreeWall(r1);

	if (wall.door) { errlog('there is already a door between', r1.id, 'and', r2); return; }

	let szDoor = valf(styles.szDoor, house.szDoor);
	let bg = valf(styles.bg, house.bg);
	let dParent = iDiv(house);
	let wr = wall.rect;

	//console.log('wall',wall);
	if (nundef(r2) && wall.room) { r2 = Items[wall.room]; } //console.log('r2',r2); }

	let dr = jsCopy(wr);
	let or = wall.dir == 'e' || wall.dir == 'w' ? 'v' : 'h';
	//console.log('or',or)
	if (or == 'v') {
		let len = wr.h;
		let offy = (len - szDoor) / 2;
		dr.y = dr.t = dr.t + offy;
		dr.h = szDoor;
	} else {
		let len = wr.w;
		let offx = (len - szDoor) / 2;
		dr.x = dr.l = dr.l + offx;
		dr.w = szDoor;
	}

	let id = getDoorId(r1.id, r2 ? r2.id : house.id);
	let door = { rooms: [r1.id], rect: dr, id: id, or: or }; //, source: r1.id, target: r2 ? r2.id : house.id };
	if (r2) { r2.doors.push(id); door.rooms.push(r2.id); } else { house.doors.push(id); }
	r1.doors.push(id);

	//paint(iDiv(house), wr, 'violet'); showRect('r1', r1); showRect('wall', wall); showRect('door', { rect: dr }); showRect('r1', r1); showRect('wall', wall); showRect('door', door); if (r2) showRect('r2', r2); else showRect('house', house);
	//let d = paint(iDiv(house), dr, bg); 
	let stylesPlus = { position: 'absolute', left: dr.x, top: dr.y, w: dr.w, h: dr.h, bg: bg };
	copyKeys(stylesPlus, styles);
	d = mDiv(dParent, styles);
	iAdd(door, { div: d });

	return door;

}
function iLabyrint(dParent, cols,rows, styles = { w: 800, h: 400 }) {
	//achtung styles: fg is wall color, bg is room color!
	let d = mDiv(dParent, { display: 'inline-grid', position: 'relative', box: true });

	//each room name is a..z + 1..9


	ns = isNumber(ns) ? d.style.gridTemplateAreas = getLayoutSample(ns) : ns; //'"z z d" "a a c" "a a c"';// getLayoutSample(3);
	let s = d.style.gridTemplateAreas = ns;
	//setGranularityFactor(s, 9);
	let letterList = filterDistinctLetters(s);
	let wallWidth = valf(styles.gap, 4);

	//hier berechne ich house size etwas genauer: 
	//let [wHouse,hHouse]=keepGridAtFixedIntegerSize(d);
	let lines = s.split('"').filter(x => !isWhiteSpaceString(x));
	//console.log('lines',lines);
	//console.log('this thins has',cols,'cols','and',rows,'rows');
	//each unit should be divisible by 4
	let wHouse = Math.round(styles.w / cols) * cols + wallWidth * cols + 1;
	let hHouse = Math.round(styles.h / rows) * rows + wallWidth * rows + 1;
	d.style.gridTemplateRows = `repeat(${rows}, 1fr)`;// / repeat(${cols}, 1fr)`;
	d.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;// / repeat(${cols}, 1fr)`;

	let szDoor = valf(styles.szDoor, 40);

	let [wallColor, floorColor] = [valf(styles.fg, 'white'), valf(styles.bg, BLUE)];
	mStyle(d, { bg: wallColor, w: wHouse, h: hHouse, gap: wallWidth, padding: wallWidth });

	let rooms = [];
	for (const ch of letterList) { //['a', 'c', 'd', 'f', 'z']) {
		let r = iRoom(d, ch, { bg: floorColor });
		rooms.push(r);
	}

	let house = { rect: getRect(d), fg: wallColor, bg: floorColor, doors: [], rooms: rooms.map(x => x.id), roomLetters: letterList, szDoor: szDoor, wallWidth: wallWidth };
	house.roomsByLetter = {};
	//console.log('..........',house.rect)
	rooms.map(x => house.roomsByLetter[x.ch] = x.id);
	iAdd(house, { div: d });
	rooms.map(x => x.house = house.id);

	roomAdjacency(house);

	return house;
}
function iHouse(dParent, ns = 1, styles = { w: 500, h: 400 }) {
	//achtung styles: fg is wall color, bg is room color!
	let d = mDiv(dParent, { display: 'inline-grid', position: 'relative', box: true });

	ns = isNumber(ns) ? d.style.gridTemplateAreas = getLayoutSample(ns) : ns; //'"z z d" "a a c" "a a c"';// getLayoutSample(3);
	let s = d.style.gridTemplateAreas = ns;
	//setGranularityFactor(s, 9);
	let letterList = filterDistinctLetters(s);
	let wallWidth = valf(styles.gap, 4);

	//hier berechne ich house size etwas genauer: 
	//let [wHouse,hHouse]=keepGridAtFixedIntegerSize(d);
	let lines = s.split('"').filter(x => !isWhiteSpaceString(x));
	//console.log('lines',lines);
	let cols = lines[0].split(' ').length;
	let rows = lines.length;
	//console.log('this thins has',cols,'cols','and',rows,'rows');
	//each unit should be divisible by 4
	let wHouse = Math.round(styles.w / cols) * cols + wallWidth * cols + 1;
	let hHouse = Math.round(styles.h / rows) * rows + wallWidth * rows + 1;
	d.style.gridTemplateRows = `repeat(${rows}, 1fr)`;// / repeat(${cols}, 1fr)`;
	d.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;// / repeat(${cols}, 1fr)`;

	let szDoor = valf(styles.szDoor, 40);

	let [wallColor, floorColor] = [valf(styles.fg, 'white'), valf(styles.bg, BLUE)];
	mStyle(d, { bg: wallColor, w: wHouse, h: hHouse, gap: wallWidth, padding: wallWidth });

	let rooms = [];
	for (const ch of letterList) { //['a', 'c', 'd', 'f', 'z']) {
		let r = iRoom(d, ch, { bg: floorColor });
		rooms.push(r);
	}

	let house = { rect: getRect(d), fg: wallColor, bg: floorColor, doors: [], rooms: rooms.map(x => x.id), roomLetters: letterList, szDoor: szDoor, wallWidth: wallWidth };
	house.roomsByLetter = {};
	//console.log('..........',house.rect)
	rooms.map(x => house.roomsByLetter[x.ch] = x.id);
	iAdd(house, { div: d });
	rooms.map(x => x.house = house.id);

	roomAdjacency(house);

	return house;
}
function iRoom(dParent, ch, styles) {
	let def = { 'grid-area': ch, position: 'relative' };
	copyKeys(def, styles);
	let dCell = mDiv(dParent, styles);
	let rect = getRect(dCell);
	let size = Math.round(rect.w * rect.h / 1000);
	let room = { id: ch, ch: ch, bg: dCell.style.backgroundColor, rect: rect, size: size };
	delete Items[ch];
	iAdd(room, { div: dCell });
	room.doors = [];
	room.furniture = [];
	room.hasDoor = () => !isEmpty(room.doors)
	room.hasPassThrough = () => room.doors.length >= 2;
	return room;
}
function findWall(r1, r2) {
	for (const dir in r1.walls) {
		let walls = r1.walls[dir];
		for (const wall of walls) {
			if (wall.r2 == r2.id) return wall;
		}
	}
	return null;
}
function findFreeWall(r1, walls) {
	r1 = isString(r1) ? Items[r1] : r1;
	if (nundef(walls)) {
		walls = [];
		for (const dir in r1.walls) {
			walls = walls.concat(r1.walls[dir]);
		}
	}
	//console.log('walls',r1.ch)
	walls = walls.filter(x => !x.door);
	return isEmpty(walls) ? null : chooseRandom(walls);
}
function hideOuterDoors(house) {
	// console.log(house.doors);
	for (const did of jsCopy(house.doors)) {
		// console.log(did)
		let door = Items[did];
		hide(iDiv(door));//.remove();
		// console.log('door',door);
		// for(const rid of door.rooms){removeInPlace(Items[rid].doors,did);}
		// removeInPlace(house.doors,did);
	}
	// console.log(house.doors);

}
function removeOuterDoors(house) {
	console.log(house.doors);
	for (const did of jsCopy(house.doors)) {
		console.log(did)
		let door = Items[did];
		iDiv(door).remove();
		console.log('door', door);
		for (const rid of door.rooms) { removeInPlace(Items[rid].doors, did); }
		removeInPlace(house.doors, did);
	}
	console.log(house.doors);

}
function roomAdjacency(house) {
	//assumes rectangular rooms! to make other shapes of rooms, need to compose them!
	let rooms = house.rooms.map(x => Items[x]);

	for (let i = 0; i < rooms.length; i++) {
		for (let j = i + 1; j < rooms.length; j++) {
			let [r1, r2] = [rooms[i], rooms[j]];
			let [e1, e2] = [r1.rect, r2.rect];
			let rhoeher = e1.t < e2.t ? r1 : r2;
			let rleft = e1.x < e2.x ? r1 : r2;
			let rniedriger = (rhoeher == r1 ? r2 : r1);
			let rright = (rleft == r1 ? r2 : r1);
			let diff = 2 * house.wallWidth; // =min length between rooms to warrant a wall

			//check for vertical wall
			let y1 = Math.max(e1.t, e2.t);
			let y2 = Math.min(e1.b, e2.b);
			let dCommony = y2 - y1;
			if (dCommony > diff && isCloseTo(rright.rect.l, rleft.rect.r)) {
				//console.log(r1.ch, 'and', r2.ch, 'share vertical wall of size', dCommony);
				// let re1=getRect(iDiv(r1),iDiv(house)); //relative to house
				// let re2=getRect(iDiv(r2),iDiv(house));
				//showRect('r1', r1); showRect('r2', r2); showRect('house', house);
				let dr = {
					x: rleft.rect.r - house.rect.l,
					y: rniedriger.rect.t - house.rect.t, //fuer door: + (dCommony - szDoor) / 2,
					w: rright.rect.l - rleft.rect.r, //house.wallWidth,
					h: dCommony, //fuer door: szDoor
				};
				extendRect(dr);
				addAdjacencyFromTo(rleft, rright, 'e', dr);
			}

			//check for horizontal wall
			let x1 = Math.max(e1.l, e2.l);
			let x2 = Math.min(e1.r, e2.r);
			let dCommonx = x2 - x1;
			if (dCommonx > diff && isCloseTo(rniedriger.rect.t, rhoeher.rect.b)) {
				//console.log(r1.ch, 'and', r2.ch, 'share horizontal wall of size', dCommonx);
				// let re1=getRect(iDiv(r1),iDiv(house)); //relative to house
				// let re2=getRect(iDiv(r2),iDiv(house));
				//showRect('r1', r1); showRect('r2', r2); showRect('house', house);
				let dr = {
					x: rright.rect.l - house.rect.l, //fuer door: + (dCommonx - szDoor) / 2,
					y: rhoeher.rect.b - house.rect.t,
					w: dCommonx, //fuer door: szDoor, 
					h: house.wallWidth
				};
				extendRect(dr);
				addAdjacencyFromTo(rhoeher, rniedriger, 's', dr);
			}
		}
	}


	// add OUTER walls:
	for (let i = 0; i < rooms.length; i++) {
		let r = rooms[i];
		//console.log(r.ch);
		if (isCloseTo(r.rect.l, house.rect.l)) {
			//this room has western outer wall
			let wallRect = { x: house.rect.l, y: r.rect.t, w: house.wallWidth, h: r.rect.h };
			extendRect(wallRect);
			addAdjacencyFromTo(r, null, 'w', wallRect);
		}
		if (isCloseTo(r.rect.r, house.rect.r)) {
			//this room has eastern outer wall
			let wallRect = { x: r.rect.r, y: r.rect.t, w: house.wallWidth, h: r.rect.h };
			extendRect(wallRect);
			addAdjacencyFromTo(r, null, 'e', wallRect);
		}
		if (isCloseTo(r.rect.t, house.rect.t)) {
			//this room has northern outer wall
			let wallRect = { x: r.rect.l, y: house.rect.t, w: r.rect.w, h: house.wallWidth };
			extendRect(wallRect);
			addAdjacencyFromTo(r, null, 'n', wallRect);
		}
		if (isCloseTo(r.rect.b, house.rect.b)) {
			//this room has southern outer wall
			let wallRect = { x: r.rect.l, y: r.rect.b, w: r.rect.w, h: house.wallWidth };
			extendRect(wallRect);
			addAdjacencyFromTo(r, null, 's', wallRect);
		}
	}
}

//house helpers
function addAdjacencyFromTo(r1, r2, dir, rect) {
	//console.log(rect);
	let house = Items[r1.house];
	//console.log('---------',house)
	if (!r2) rect = rrto(rect, house.rect);
	//console.log(rect)
	lookupAddToList(r1, ['walls', dir], { rect: rect, dir: dir, room: r2 ? r2.id : r2, door: null });
	let dir2 = r2 ? getOppDir(dir) : dir;
	lookupAddToList(r2 ? r2 : Items[r1.house], ['walls', dir2], { rect: rect, dir: dir2, room: r1.id, door: null });
}
function areNeighbors(r1, r2) {
	let res = firstCond(r1.doors, x => x.includes(r1.id) && x.includes(r2.id));
	//console.log('are',r1.id+','+r2.id,'neighbors?',res!=null, r1.doors);
	return res != null;
}
function getDoorId(r1, r2) { return r1 + '_' + r2 + '_' + r1; }
function getLayoutSample(n) {
	//console.log('n', n)

	if (G.level > 4){
		//room size: min 40x40 (40x14=560)
		// max ist 20x8=80 rooms a 50x50, versuch das mal!
		// wenn platz habe 1000, kann ich 50x20 rooms in einer reihe machen und hohe kann machen 5
		//3x4, 3x5, 3x6, 3x7, 3x8, 3x9, 3x10, 
		//4x5, 4x6, 4x7, 4x8, 4x9, 4x10, 4x11, 4x12, 4x13, 4x14
		
	}

	let samples = {
		1: '"a"',
		2: '"a b"', //'"a" "b"',
		3: ['"a b c"', '"a a" "b c"', '"a b" "c c"'], // "cd"',
		4: ['"z z d" "a a c" "a a c"', '"a b" "c d"'],
		5: ['"a b e" "c c d"', '"a a b" "c d e"', '"a b e" "c d e"'],
		6: ['"a b b c" "d d e f"', '"a b b c" "a d e f"', '"a b b b" "c d e f"'],
		7: ['"a b c d" "a b e f"', '"a b b c" "a d e c" "a d f g"'],
		8: ['"a a b c" "d d e c" "f g e h"', '"a b b c" "a d e c" "f g e h"'],
		9: ['"a a b b" "c d d e" "f g h i"', '"a d e b" "c d e b" "f g h i"'],
		10: '"j a b b" "c d d e" "f g h i"',
		11: '"j a a b b" "j c d d e" "f g h i k"',
		12: '"j a a b b l" "j c d d e l" "f g h i k k"',
		13: '"j a a b b" "j c d d e" "f g h i k" "l l m m k"',
		14: '"n j a a b b" "n j c d d e" "f g h i i k" "l l m m m k"',
		15: '"n j o o b b" "n j a a b b" "n j c d d e" "f g h i i k" "l l m m m k"',
		16: [
			'"a b c d e" "f f g h e" "o p i h j" "k l i m n"',
			'"a b b d e" "n f p g e" "i j j o k" "l l c m h"',
			'"a a p g c h" "a a b b c h" "n d d e e f" "o i j k l m"',
			'"a b c o d e" "f b c p g e" "f i i j g k" "n l m j h k"'
		],
		17: [
			'"a b c d e" "f g h i j" "k l m i o" "p n q q o"',
			'"a a c d e" "f g h i j" "k l m i o" "p n q b o"',
			'"a b c d e" "f b h i j" "k l m i o" "p n m q g"'
		],
		18: [
			'"a b c d e" "a g h i j" "k l m n o" "p q r f o"',
			'"a b b c d e" "a g h h i j" "k l l m n o" "p q q r f o"',
			'"a b b c d e" "a g g h i j" "k g g m n o" "p q l r f o"',
			'"a b b c d e" "a g h h i j" "k k l m n o" "p q l r f o"',
		],
		19: [
			'"a b c d e" "f b h i j" "k l m s o" "p n q g r"',
			'"a a b c d e" "f h b i i j" "k l m m s o" "p n q g g r"',
			'"a a b c d e" "f h b i l j" "k h m m s o" "p n q g g r"',
			'"a q b c d e" "f h b i l j" "k h m m s o" "p n m m g r"',
			'"a q b c d e" "f h b i l j" "k h m m s o" "p n m m g r"',
		],
		20: [
			'"a b c d e" "f g h i j" "k l m n o" "p q r s t"',
			'"a b b c d e" "f g h h i j" "k k l m n o" "p q r s s t"',
			'"a b b c d e" "f g h h i j" "k k l m i o" "p q r n s t"',
			'"a f b c d e" "a g h h i j" "k k l m i o" "p q r n s t"',
		],
		21: [
			'"a b b c d e" "f g h h i j" "k u l m n o" "p q r s s t"',
			'"a b b c d e" "f u g h i j" "k u l m n o" "p q r s n t"',
			'"a b b c d e" "f g h u i j" "k k l m i o" "p q r n s t"',
			'"a f b c d e" "a g h h i j" "k u l m i o" "p q r n s t"',
		],
		22: [
			'"a v b c d e" "f g h h i j" "k u l m n o" "p q r s s t"',
			'"a b b c d e e" "f u g h i j v" "k u l m n o v" "p q r s n t t"',
			'"a b b c d e e" "f u g h i j j" "k u l m n o v" "p q r s n t t"',
			'"a b b c d d e" "m b b c i j e" "f u g h i j v" "k u l l n o v" "p q r s n t t"',
		],
		23: [
			'"a v b c d e" "f g h h i j" "k u l m n o" "p q r w s t"',
			'"a w b c d e e" "f u g h i j v" "k u l m n o o" "p q r s n t t"',
			'"a b b c d e e" "f w g h i j j" "k u l m n o v" "p q r s n t t"',
		],
		24: [
			'"a v b c d e" "f g h x i j" "k u l m n o" "p q r w s t"',
			'"a v v b c d e" "f g h x x i j" "k u l l n o m" "p q r w s t m"',
		],
		25: ['"a b c d e f g" "a h i k l m g" "o p n r s m u" "v w x y q t j"'],
		26: ['"a a c d e f g" "h i b k l j n" "o p q r s m u" "v w x y z t u"'],
		27: ['"a b c d e f g" "h i j k l m n" "o p q r s t u" "v w x y z A u"'],
		28: ['"a b c d e f g" "h i j k l m n" "o p q r s t u" "v w x y z A B"'],
		29: ['"a b c d e f g h" "i j k d m n o p" "q r r t u v w x" "y z A B C s l l"'],
		30: ['"a b c d e f g h" "i j k d m n o p" "q r s t u v w x" "y z A B C D l l"'],
		31: ['"a b c d e f g h" "i j k l m n o p" "q r s t u v w x" "y z A B C D E E"'],
		32: ['"a b c d e f g h" "i j k l m n o p" "q r s t u v w x" "y z A B C D E F"'],
	};
	let s;
	if (nundef(n)) {
		let l = chooseRandom(Object.keys(samples));
		s = samples[l];
	} else {
		s = samples[n];
	}
	s = isList(s) ? chooseRandom(s) : s;
	s = getLetterSwapEncoding(s);
	//console.log('s', s);
	return s;
}
function getOppDir(dir) { return { e: 'w', w: 'e', n: 's', s: 'n' }[dir]; }
function getRoomNE(house) { return firstCond(house.rooms, x => isNorthRoom(house, Items[x]) && isEastRoom(house, Items[x])); }
function getRoomNW(house) { return firstCond(house.rooms, x => isNorthRoom(house, Items[x]) && isWestRoom(house, Items[x])); }
function getRoomSE(house) {
	let rooms = house.rooms.map(x => Items[x]);
	//console.log('rooms',rooms);
	for (const r of rooms) {
		let isSouth = isSouthRoom(house, r);
		//console.log('south:',isSouth,r.rect.b,house.rect.b);
		let isEast = isEastRoom(house, r);
		//console.log('east:',isEast,r.rect.r,house.rect.r);
	}
	return firstCond(house.rooms, x => isSouthRoom(house, Items[x]) && isEastRoom(house, Items[x]));
}
function getRoomSW(house) { return firstCond(house.rooms, x => isSouthRoom(house, Items[x]) && isWestRoom(house, Items[x])); }
function getDiagonallyOpposedCornerRooms(house) {
	if (coin()) return [getRoomNW(house), getRoomSE(house)]; else return [getRoomSW(house), getRoomNE(house)];
}
function getDiagRoomPairs(house) {
	return [[getRoomNW(house), getRoomSE(house)], [getRoomSW(house), getRoomNE(house)]];
}
function getCornerRoomsDict(house) {
	let rooms = house.rooms.map(x => Items[x]);
	let result = {};
	for (const r of rooms) {
		let isN = r.isN = isNorthRoom(house, r);
		let isS = r.isS = isSouthRoom(house, r);
		let isW = r.isW = isWestRoom(house, r);
		let isE = r.isE = isEastRoom(house, r);
		if (isN && isW) result.NW = r.id;
		else if (isN && isE) result.NE = r.id;
		else if (isS && isE) result.SE = r.id;
		else if (isS && isW) result.SW = r.id;
	}
	return result;
}
function getCornerRooms(house) {
	let rooms = house.rooms.map(x => Items[x]);
	let result = [];
	for (const r of rooms) {
		if (isCornerRoom(house, r)) {
			result.push(r.id);
		}
	}
	return result;
}
function isCornerRoom(house, room) {
	let rr = room.rect;
	let rh = house.rect;
	let w = house.wallWidth;
	let isHorSide = isCloseTo(rr.x, rh.x, w) || isCloseTo(rr.r, rh.r, w);
	let isVertSide = isCloseTo(rr.y, rh.y, w) || isCloseTo(rr.b, rh.b, w);
	return isHorSide && isVertSide;
}
function isNorthRoom(house, room) { return isCloseTo(room.rect.t, house.rect.t, house.wallWidth); }
function isSouthRoom(house, room) { return isCloseTo(room.rect.b, house.rect.b, house.wallWidth); }
function isEastRoom(house, room) { return isCloseTo(room.rect.r, house.rect.r, house.wallWidth); }
function isWestRoom(house, room) { return isCloseTo(room.rect.l, house.rect.l, house.wallWidth); }
function makeAreas(dParent, layout) {
	let dGrid = mDiv(dParent, { gap: 10, bg: 'white', w: '90%', padding: 10, display: 'inline-grid', rounding: 10 }, 'dGrid');
	if (nundef(layout)) layout = ['T', 'H A'];
	//let layout = ['t', 'H A'];
	let x = createGridLayout(dGrid, layout); //teilt dGrid in areas ein

	//more intricate layout!
	let areaStyles = { bg: 'green', rounding: 6 };//,box:true, padding:10};
	let contentStyles = { lowerRounding: 6 };
	let messageStyles = { fg: 'yellow' };
	let titleStyles = { bg: 'dimgray', family: 'AlgerianRegular', upperRounding: 6 };
	let areas = {
		T: { title: 'table', id: 'dTrick', showTitle: true, messageArea: true, areaStyles: areaStyles, contentStyles: contentStyles, messageStyles: messageStyles, titleStyles: titleStyles, titleOnTop: true },
		H: { title: 'YOU', id: 'dHuman', showTitle: true, messageArea: true, areaStyles: areaStyles, contentStyles: contentStyles, messageStyles: messageStyles, titleStyles: titleStyles, titleOnTop: false },
		A: { title: 'opponent', id: 'dAI', showTitle: true, messageArea: true, areaStyles: areaStyles, contentStyles: contentStyles, messageStyles: messageStyles, titleStyles: titleStyles, titleOnTop: false },
	};

	let items = [];
	for (const k in areas) {
		let item = areas[k];
		item.areaStyles['grid-area'] = k;
		let dCell = mTitledMessageDiv(item.title, dGrid, item.id, item.areaStyles, item.contentStyles, item.titleStyles, item.messageStyles, item.titleOnTop)
		//console.log('children', dCell.children);
		iRegister(item, item.id);
		if (item.titleOnTop) iAdd(item, { div: dCell, dTitle: dCell.children[0], dMessage: dCell.children[1], dContent: dCell.children[2] });
		else iAdd(item, { div: dCell, dTitle: dCell.children[2], dMessage: dCell.children[0], dContent: dCell.children[1] });
		mCenterCenterFlex(diContent(item));
		mStyle(diContent(item), { gap: 10 });//,padding:10, box:true});
		items.push(item);
	}
	return items;


}
function paint(dParent, r, color = 'random') {
	let d = mDiv(dParent, { position: 'absolute', left: r.x, top: r.y, w: r.w, h: r.h, bg: color });
	return d;
}
function rrto(r1, r2) {
	let r = jsCopy(r1);
	r.x -= r2.x; r.l -= r2.x; r.r -= r2.x;
	r.y -= r2.y; r.t -= r2.y; r.b -= r2.y;
	return r;
}
function setGranularityFactor(s, f = 2) {
	let lines = s.split('"');
	//console.log(lines);
	let lines1 = lines.filter(x => !isEmptyOrWhiteSpace(x));
	//console.log(lines1);
	//multiply each line item * factor
	let lines2 = [];
	for (const l of lines1) {
		let lNew = '';
		for (let i = 0; i < l.length; i++) {
			if (l[i] == ' ') continue;// lNew += ' ';
			for (let x = 0; x < f; x++) lNew += l[i] + ' ';

		}
		lines2.push(lNew.trim());
	}
	//console.log(lines2);
	//multiply each line * factor
	let lines3 = [];
	for (const l of lines2) { for (let i = 0; i < f; i++) { lines3.push(l); } }
	//console.log(lines3);
	return lines3;

}
function showRect(s, o) {
	let r = o.rect;
	console.log('\n', s, 'w', Math.round(r.w), '=', Math.round(r.l), Math.round(r.r), 'h', Math.round(r.h), '=', Math.round(r.t), Math.round(r.b));
}
function showRectReal(s, o) {
	let r = o.rect;
	console.log('\n', s, 'w', r.w, '=', r.l, r.r, 'h', r.h, '=', r.t, r.b);
}







//#endregion

//#region keys.js
//prep key sets at start of prog
function getKeySets() {
	//let ks = localStorage.getItem('KeySets');

	makeCategories();	//console.log('Categories',Categories)

	//if (isdef(ks)) { return JSON.parse(ks); }

	//console.log('hallo'); return [];
	let res = {};
	for (const k in Syms) {
		let info = Syms[k];
		if (nundef(info.cats)) continue;
		for (const ksk of info.cats) {
			//console.log('ksk',ksk,'k',k);
			lookupAddIfToList(res, [ksk], k);
		}
	}
	res.animals = getAnimals();
	res.nature = getNature();
	localStorage.setItem('KeySets', JSON.stringify(res));
	return res;

}
function getAnimals() {
	let gr = 'Animals & Nature';
	let result = [];
	for (const sg in ByGroupSubgroup[gr]) {
		if (startsWith(sg, 'anim')) result = result.concat(ByGroupSubgroup[gr][sg]);
	}
	return result;
}
function getNature() {
	let gr = 'Animals & Nature';
	let result = [];
	for (const sg in ByGroupSubgroup[gr]) {
		result = result.concat(ByGroupSubgroup[gr][sg]);
	}
	return result;
}

function getGSGElements(gCond, sCond) {
	let keys = [];
	let byg = ByGroupSubgroup;
	for (const gKey in byg) {
		if (!gCond(gKey)) continue;

		for (const sKey in byg[gKey]) {
			if (!sCond(sKey)) continue;

			keys = keys.concat(byg[gKey][sKey]);
		}
	}
	return keys.sort();
}
function makeCategories() {
	//console.log(ByGroupSubgroup);
	let keys = Categories = {
		animal: getGSGElements(g => g == 'Animals & Nature', s => startsWith(s, 'animal')),
		clothing: getGSGElements(g => g == 'Objects', s => s == 'clothing'),
		emotion: getGSGElements(g => g == 'Smileys & Emotion', s => startsWith(s, 'face') && !['face-costume', 'face-hat'].includes(s)),
		food: getGSGElements(g => g == 'Food & Drink', s => startsWith(s, 'food')),
		'game/toy': (['sparkler', 'firecracker', 'artist palette', 'balloon', 'confetti ball'].concat(ByGroupSubgroup['Activities']['game'])).sort(),
		gesture: getGSGElements(g => g == 'People & Body', s => startsWith(s, 'hand')),
		job: ByGroupSubgroup['People & Body']['job'],
		mammal: ByGroupSubgroup['Animals & Nature']['animal-mammal'],
		music: getGSGElements(g => g == 'Objects', s => startsWith(s, 'musi')),
		object: getGSGElements(g => g == 'Objects', s => true),
		place: getGSGElements(g => g == 'Travel & Places', s => startsWith(s, 'place')),
		plant: getGSGElements(g => g == 'Animals & Nature' || g == 'Food & Drink', s => startsWith(s, 'plant') || s == 'food-vegetable' || s == 'food-fruit'),
		sport: ByGroupSubgroup['Activities']['sport'],
		tool: getGSGElements(g => g == 'Objects', s => s == 'tool'),
		transport: getGSGElements(g => g == 'Travel & Places', s => startsWith(s, 'transport')),
	};

	let incompatible = Daat.incompatibleCats = {
		animal: ['mammal'],
		clothing: ['object'],
		emotion: ['gesture'],
		food: ['plant', 'animal'],
		'game/toy': ['object', 'music'],
		gesture: ['emotion'],
		job: ['sport'],
		mammal: ['animal'],
		music: ['object', 'game/toy'],
		object: ['music', 'clothing', 'game/toy', 'tool'],
		place: [],
		plant: ['food'],
		sport: ['job'],
		tool: ['object'],
		transport: [],
	}
	//console.log('categories', keys);

}

//keys and categories
function genCats(n) {
	//console.log('???????',Daat.incompatibleCats)
	let di = {};
	let cats = Object.keys(Categories);
	//console.log('cats available:',cats)
	for (let i = 0; i < n; i++) {
		let cat = chooseRandom(cats);
		let incompat = Daat.incompatibleCats[cat];
		//console.log('cats',cats,'\ncat',cat,'\nincompat',incompat)
		cats = arrMinus(cats, incompat);
		removeInPlace(cats, cat);
		//console.log('cats after minus',cats);
		di[cat] = Categories[cat];
	}
	return di;
}
function oneWordKeys(keys) { return keys.filter(x => !x.includes(' ')); }

function removeDuplicates(keys, prop) {
	let di = {};
	let res = [];
	let items = keys.map(x => Syms[x]);
	for (const item of items) {
		// if (item.key.includes('key')) console.log('hallo',item)
		// if (isdef(di[item.best])) {console.log('dupl:',item.key); continue;}
		if (isdef(di[item.best])) { continue; }
		res.push(item);
		di[item.key] = true;
	}
	return res.map(x => x.key);
}
function setKeysG(g, filterFunc, nMin, key) {
	if (nundef(nMin)) nMin = 25;
	if (isdef(g.numPics)) nMin = Math.max(25, g.numPics);
	return setKeys({ nMin: nMin, lang: g.language, key: valf(key, g.vocab), keySets: KeySets, filterFunc: filterFunc, param: g });
}
function setKeys({ allowDuplicates, nMin = 25, lang, key, keySets, filterFunc, param, confidence, sortByFunc } = {}) {
	// console.log('setKeys (legacy)',nMin,lang,key,keySets,'\nfilterFunc',filterFunc);
	//G.keys = setKeys({ nMin, lang: G.language, keySets: KeySets, key: G.vocab });

	let keys = jsCopy(keySets[key]);
	// console.log('setKeys (from',getFunctionsNameThatCalledThisFunction()+')',keys)
	//if (isdef(filterFunc)) console.log('f',filterFunc);

	// console.log('setKeys',keys)
	if (isdef(nMin)) {
		let diff = nMin - keys.length;
		let additionalSet = diff > 0 ? nMin > 100 ? firstCondDictKeys(keySets, k => k != key && keySets[k].length > diff) : 'best100' : null;

		//console.log('diff', diff, additionalSet, keys)
		if (additionalSet) KeySets[additionalSet].map(x => addIf(keys, x)); //
		//if (additionalSet) keys = keys.concat(keySets[additionalSet]);
		//console.log(keys)
	}

	let primary = [];
	let spare = [];
	for (const k of keys) {
		let info = Syms[k];

		//console.log('info',info);
		info.best = info[lang];
		//console.log(info.best)

		if (nundef(info.best)) {
			let ersatzLang = (lang == 'D' ? 'D' : 'E');
			let klang = 'best' + ersatzLang;
			//console.log(k,lang,klang)
			if (nundef(info[klang])) info[klang] = lastOfLanguage(k, ersatzLang);
		}
		//console.log(k,lang,lastOfLanguage(k,lang),info.best,info)
		let isMatch = true;
		//if (isdef(filterFunc)) console.log(filterFunc,filterFunc(k,info.best))
		if (isdef(filterFunc)) isMatch = isMatch && filterFunc(param, k, info.best);
		if (isdef(confidence)) isMatch = info[klang + 'Conf'] >= confidence;
		if (isMatch) { primary.push(k); } else { spare.push(k); }
	}

	//console.assert(isEmpty(intersection(spare,primary)))

	if (isdef(nMin)) {
		//if result does not have enough elements, take randomly from other
		let len = primary.length;
		let nMissing = nMin - len;
		if (nMissing > 0) { let list = choose(spare, nMissing); spare = arrMinus(spare, list); primary = primary.concat(list); }
	}

	if (isdef(sortByFunc)) { sortBy(primary, sortByFunc); }

	if (isdef(nMin)) console.assert(primary.length >= nMin);
	//console.log(primary)
	if (nundef(allowDuplicates)) {
		//console.log('hhhhhhhhhhhhhhh',primary.length)
		primary = removeDuplicates(primary);
	}
	return primary;
}

//filter functions: g must be first param!
function filterWordByLengthG(g, k, w, allowSpaces = false) {
	if (nundef(g.minWordLength)) g.minWordLength = 0;
	if (nundef(g.maxWordLength)) g.maxWordLength = 50;
	return filterByLength(w, g.minWordLength, g.maxWordLength, allowSpaces);
}









//#endregion

//#region letter.js
function arrCycleSwap(arr, prop, clockwise = true) {
	let n = arr.length;
	let h = arr[0].prop;
	for (let i = 1; i < n; i++) { arr[i - 1][prop] = arr[i][prop]; }
	arr[n - 1][prop] = h;
}
function gatherItems(n, options) {
	//console.log(n,options)
	let items = null;
	while (!items) { items = Pictures = pickSuitableItems(n, options); }

	//console.log('==>items',items)

	//each item has a iLetter and letter now!

	//labels need to be replaced! =>replace cycle!
	let l = items[0].letter;
	for (let i = 0; i < n; i++) {
		let item1 = items[i];
		let item2 = items[(i + 1) % n];
		let label = item1.origLabel = item1.label;
		let idx = item1.iLetter;
		item1.label = replaceAtString(label, idx, item2.letter);
		if (isWord(item1.label)) {
			//console.log(item1,item2,item1.label,item2.label)
			item2.iLetter = (item2.iLetter + 1) % item2.label.length;
			item2.letter = item2.label[item2.iLetter];
			item1.label = replaceAtString(label, idx, item2.letter); // label.substring(0, idx) + item2.letter + label.substring(idx + 1);
			if (isWord(item1.label)) return gatherItems(n, options);
		}
		//add swapInfo to item1
		item1.swaps = {};
		item1.swaps[idx] = {
			swapped: { itemId: item2.id, index: item2.iLetter, l: item2.letter },
			correct: { itemId: item1.id, index: item1.iLetter, l: item1.letter },
			temp: null,
		};

	}
	return items;
}
function pickSuitableItems(n, options) {
	let items = genItems(n, options);
	let words = items.map(x => x.label);
	//console.log('words',words);

	//console.log('words',words,'options',options)

	//if all labels are longer than 5 letters try finding vowels first
	let minlen = arrMinMax(words, x => x.length).min;
	//console.log('minlen', minlen)

	let used = [];
	for (const item of items) {
		let res = minlen > 6 ? getRandomVowel(item.label, used) : minlen > 3 ? getRandomConsonant(item.label, used) : getRandomLetter(item.label, used);
		if (isEmpty(res)) return null;
		let i = item.iLetter = res.i;
		let letter = item.letter = item.label[i];
		used.push(letter);
		//console.log('w',item.label,'i', i, 'letter', letter);
	}
	return items;
}
function getLettersExcept(w, except = []) {
	w = w.toLowerCase();
	let res = [];
	for (let i = 0; i < w.length; i++) {
		if (!except.includes(w[i])) res.push({ i: i, letter: w[i] });
	}
	return res;
}
function getVowels(w, except = []) {
	w = w.toLowerCase();
	//console.log('w', w);
	let vowels = 'aeiouy';
	let res = [];
	for (let i = 0; i < w.length; i++) {
		if (vowels.includes(w[i]) && !except.includes(w[i])) res.push({ i: i, letter: w[i] });
	}
	//console.log('res', res)
	return res;
}
function getConsonants(w, except = []) {
	w = w.toLowerCase();
	//console.log('w',w);
	let vowels = 'aeiouy' + except.join('');
	let res = [];
	for (let i = 0; i < w.length; i++) {
		if (!vowels.includes(w[i])) res.push({ i: i, letter: w[i] });
	}
	//console.log('res',res)
	return res;
}
function getRandomVowel(w, except = []) { let vowels = getVowels(w, except); return chooseRandom(vowels); }
function getRandomConsonant(w, except = []) { let cons = getConsonants(w, except); return chooseRandom(cons); }
function getRandomLetter(w, except = []) { let cons = getLettersExcept(w, except); return chooseRandom(cons); }
function getBlinkingLetter(item) {
	if (nundef(item.letters)) return null;
	return firstCond(item.letters, x => x.isBlinking);
}
function iLetters(s, dParent, style) {
	let d = mDiv(dParent);
	for (let i = 0; i < s.length; i++) {
		let d1 = mDiv(d);
		d1.innerHTML = s[i];
		mStyle(d1, style);
	}
	return d;
}
function isWord(w) { return lookup(Dictionary,[G.language,w]); }
function pickSuitableItems_dep(n, options) {
	let items = genItems(n, options);
	let words = items.map(x => x.label);

	let used = [];
	for (const item of items) {
		let res = getRandomConsonant(item.label, used);
		if (isEmpty(res)) return null;
		let i = item.iLetter = res.i;
		let letter = item.letter = item.label[i];
		used.push(letter);
		//console.log('w',item.label,'i', i, 'letter', letter);
	}
	return items;
}
function stopBlinking(item) { if (isdef(item)) { item.isBlinking = false; mRemoveClass(iDiv(item), 'blink'); } }
function startBlinking(item, items, unique = true) {
	//console.log('item', item, 'items', items, 'unique', unique)
	if (unique) {
		let prevLetter = firstCond(items, x => x.isBlinking == true);
		//console.log('prevLetter', prevLetter);
		stopBlinking(prevLetter);
	}
	mClass(iDiv(item), 'blink');
	item.isBlinking = true;
}
function startPulsating(item, items, unique = true) {
	//console.log('item', item, 'items', items, 'unique', unique)
	if (unique) {
		let prevLetter = firstCond(items, x => x.isPulsating == true);
		//console.log('prevLetter', prevLetter);
		stopPulsating(prevLetter);
	}
	mClass(iDiv(item), 'onPulse');
	item.isPulsating = true;
}
function stopPulsating(item) { if (isdef(item)) { item.isPulsating = false; mRemoveClass(iDiv(item), 'onPulse'); } }

function showCorrectLabelSwapping() {
	for (const p of Pictures) {
		for (const l of p.letters) {
			let sw = l.swapInfo;
			if (isdef(sw)) {
				//console.log('state', l.state, l.letter, '=>', sw.correct.l);
				//startPulsating(l,p.letters,false);
				iDiv(l).innerHTML = sw.correct.l;
				if (l.i == p.iLetter) animate(iDiv(l), 'komisch', 2300);
				//console.log('will correct',p.testLabel,'to',replaceAtString(p.label,l.i,sw.correct.l));
				//show correct version of that letter!
				//transformation should be slow (animation similar to abacus correction!)
			}
		}
	}
	DELAY = 3000;
	return 3000;
}

//#endregion

//#region math.js

function getOperand(type) { let x = OPS[type]; return randomNumber(Math.max(2, x.min), x.max); }
function getRandomWP(min = 0, max = 35) { let n=randomNumber(min, max); console.log('wp',n); return jsCopy(WordP[n]); }// chooseRandom(WordP.slice(min,max));}
function instantiateNames(wp) {
	let text = wp.text;
	let parts = text.split('@P');
	//console.log('parts', parts);
	let diNames = wp.diNames = {};
	let tnew = '';
	let allNames = jsCopy(arrPlus(GirlNames, BoyNames));
	let gNames = jsCopy(GirlNames);
	let bNames = jsCopy(BoyNames);

	if (!startsWith(text, '@P')) { tnew += parts[0]; parts = parts.slice(1); }
	for (const part of parts) {
		let textPart = stringAfter(part, ' ');

		let hasDot = part[2] == '.';

		//console.log('==>',part)
		let key = part.substring(0, 2);

		//console.log('key', key);

		if (['G', 'B', 'P'].includes(part[0])) {
			let nlist = part[0] == 'P' ? allNames : part[0] == 'B' ? bNames : gNames;
			if (isdef(diNames[key])) {
				tnew += ' ' + diNames[key];
			} else {
				diNames[key] = chooseRandom(nlist);
				removeInPlace(nlist, diNames[key]);
				removeInPlace(allNames, diNames[key]);
				tnew += ' ' + diNames[key];
			}
		}
		tnew += (hasDot ? '. ' : ' ') + textPart.trim();
	}
	wp.text = tnew.trim();

	if (wp.sol[0] == 'p') {
		//console.log('diNames',diNames,'\nsol',wp.sol);

		let k = wp.sol.trim().substring(3);
		//console.log('key',k)
		wp.result = { number: 0, text: diNames[k] };
		//console.log(wp.result,wp.diNames,k)
		return true;
	} else { return false; }
}
function instantiateNumbers(wp) {

	let text = wp.text;

	if (wp.sol[0] == 's') { wp.result = { number: 0, text: wp.sol.substring(1) }; return [{}, '']; }

	let diop = wp.diop = {}, res, result = [], eq;
	let solist = wp.sol.split('=>');
	//console.log(wp.sol);

	for (const sol of solist) {
		//console.log(sol);
		[res, eq] = replaceSol(sol, diop);
		//console.log('res',res)
		result.push(res);
	}
	result = arrLast(result).res;
	//console.log('_______diop', diop);

	//now replace each key in text by diop[key] and sett wp.result to diop.R
	wp.result = { number: isdef(diop.R) ? diop.R : result };
	wp.result.text = '' + wp.result.number;
	for (const k in diop) {
		if (k == 'R') continue;
		text = replaceAll(text, '@' + k, valToString(diop[k]));
	}
	wp.text = text;
	fractionConvert(wp, diop);
	return [diop, eq];
}
function valToString(n) { if (isFractionType(n)) return getTextForFractionX(n.n, n.d); else return n; }
function replaceSol(sol, diop) {
	//sol = R*N2=N1
	let rhs = stringBefore(sol, '=');
	//console.log('_________\nrhs', rhs);
	//console.log('sol', sol);

	let type = rhs.includes('*') ? rhs.includes('R') ? 'div' : 'mult' : rhs.includes('R') ? 'minus' : 'plus';
	//replace R and Nx in rhs by operands
	let i = 0;
	while (i < rhs.length) {
		if (rhs[i] == 'R') { diop.R = getOperand(type); i += 1; }
		else if (rhs[i] == 'r' && !isLetter(rhs[i+1])) { if (nundef(diop.r)) diop.r = getOperand(type); i += 1; } //zwischenergebnis
		else if (rhs[i] == 'N') {
			i += 1;
			let inum = Number(rhs[i]);
			let k = 'N' + inum;
			if (nundef(diop[k])) diop[k] = getOperand(type);
			i += 1;
		} else if (rhs[i] == 'D') {
			i += 1;
			let inum = Number(rhs[i]);
			let k = 'D' + inum;
			i += 1;
			if (rhs[i] == '{') {
				let subs = rhs.substring(i);
				let inKlammern = stringBefore(subs, '}');
				//console.log('rhs war',rhs, 'inKlammern',inKlammern)
				rhs = rhs.substring(0, i) + stringAfter(subs, '}');
				//console.log('rhs is now',rhs)
				i += inKlammern.length;
				let nums = allNumbers(inKlammern);
				diop[k] = chooseRandom(nums);
			} else if (nundef(diop[k])) {
				diop[k] = randomNumber(2, 9); //getOperand(type);
			}
			//i += 1; //vorgezogen! => repeat tests mit D
		} else if (rhs[i] == 'F') {

			if (isdef(diop[rhs.substring(i, i + 2)])) { i += 2; continue; }

			// example for fraction: F1(D2,D3)
			let s_ab_i = rhs.substring(i);
			let s_vor_klammer_zu = stringBefore(s_ab_i, ')');
			let lenRaus = s_vor_klammer_zu.length + 1;
			//console.log('_________', s_ab_i, s_vor_klammer_zu, lenRaus);
			let s_nach_fraction = stringAfter(s_ab_i, ')');

			let kFraction = s_ab_i.substring(0, 2);
			//console.log('s_ab_i', s_ab_i)
			let kNum = s_ab_i.substring(3); kNum = stringBefore(kNum, ',');
			let kDenom = stringAfter(s_ab_i, ','); kDenom = stringBefore(kDenom, ')'); //s_ab_i.substring(6, 8);

			//console.log('kFraction', kFraction, '\nkNum', kNum, '\nkDenom', kDenom);

			rhs = rhs.substring(0, i) + 'math.fraction(' + kNum + ',' + kDenom + ')' + s_nach_fraction;
			//console.log('new rhs', rhs);

			//get a random fraction
			let num = isNumber(kNum) ? Number(kNum) : isdef(diop[kNum]) ? diop[kNum] : null;
			let denom = isNumber(kDenom) ? Number(kDenom) : isdef(diop[kDenom]) ? diop[kDenom] : null;

			let fr = getRandomFraction(num, denom);
			//console.log('fraction is', fr);
			diop[kFraction] = fr;
			if (!num) diop[kNum] = fr.n;
			if (!denom) diop[kDenom] = fr.d;
			// if (nundef(diop[kNum]) && !isNumber(kNum)) diop[kNum] = fr.n;
			// if (nundef(diop[kDenom]) && !isNumber(kDenom)) diop[kDenom] = fr.d;
			//console.log('dict', diop)
			//rhs=rhs.substring(0,i)+
			i += 20; //length of new rhs middle text
			//console.log('rhs rest is', rhs.substring(i));
		} else i += 1;
	}

	//console.log('diop after capital replacement', diop)
	//geh nochmal durch und diesmal replace nx by some number < Nx
	//fuer div mit rest: R*N2+n2=N1
	i = 0;
	while (i < rhs.length) {
		if (rhs[i] == 'n') {
			i += 1;
			let inum = Number(rhs[i]);
			let k = 'n' + inum;
			let kN = 'N' + inum;
			let x = diop[kN];
			// if (x<=2) diop[kN]+=1;
			//console.log('number exists',x);
			if (nundef(diop[k])) diop[k] = randomNumber(2, x - 1);
			i += 1;
		} else i += 1;
	}

	//replace in sol each rhs by its operand, the eval rhs
	let eq = rhs;
	for (const k in diop) {
		let val = diop[k];
		if (isFractionType(val)) val = `math.fraction(${val.n},${val.d})`;
		eq = eq.replace(k, val); //diop[k]);
	}
	//console.log('diop',diop);

	//eq = 'math.add(math.fraction(2,9)'
	//console.log('eq', eq);
	let result = eval(eq);
	//console.log('result', result);

	//now, assign result to lhs
	let lhs = stringAfter(sol, '=').trim();
	if (isEmpty(lhs)) lhs = 'R';

	//if lhs contains more than 1 all but the last one have to be replaced by 
	diop[lhs] = result;

	return [result, eq];
}

function isFractionType(x) { return isDict(x) && isdef(x.n) && isdef(x.d); }
function fractionConvert(wp, diop) {
	let n = wp.result.number;
	let t = typeof n;
	//console.log('num is', n, 'type', t);
	if (isFractionType(n)) {
		//console.log('haaaaaaaaaaaaaaaaaaaaaaaa');
		wp.isFractionResult = true;
		wp.result.text = getTextForFraction(n.n, n.d);
	}
}


function instantiateNumbersIncludingFractions(wp) {
	//sol = simplify({N2(3,8)}/{N1(12,24)})
	let sol = wp.sol;
	console.log('________________sol', sol)
	let parts = sol.split('{');
	let di = {};
	let newSol = '';
	//replacing Ni in sol
	for (const p of parts) {
		if (p[0] == 'N') {
			let key = p.substring(0, 2);
			let n;
			console.log('p', p)
			if (p[2] == '(') {
				let nums = stringBetween(p, '(', ')');
				let lst = allNumbers(nums);
				if (lst.length <= 3 && lst[0] <= lst[1]) {
					n = randomNumber(...lst);
				} else {
					n = chooseRandom(lst);
				}
			} else {
				n = randomNumber(2, 9);
			}
			//now replace {N1(3,8)} by eg. 4
			let rest = stringAfter(p, '}');
			newSol += '' + n + rest;
			di[key] = n;

		} else newSol += p;
	}

	console.log('newSol', newSol);
	//all Ni are now replaced by corresponding ranges
	let res = eval(newSol);

	console.log('res of simplify', res);
	let numResult = res[0] / res[1];
	let textResult = numResult == Math.round(numResult) ? numResult : '' + res[0] + '/' + res[1];
	wp.result = { number: numResult, text: textResult };

	//replacing Ni and {F...} in text
	let text = wp.text;
	for (const k in di) {
		if (k == 'R') continue;
		text = replaceAll(text, '{' + k + '}', di[k]);
	}

	console.log('_________ text', text);
	parts = text.split('{');
	let tnew = '';
	for (const p of parts) {
		if (p[0] == 'F') {
			//parser numbers
			let s = stringBefore(p, '}');
			console.log('s', s)
			let [n, d] = allNumbers(s);
			tnew += getTextForFraction(n, d);
			tnew += '; ' + stringAfter(p, '}');
		} else tnew += p;
	}
	text = tnew;

	wp.text = text;

	mText(wp.text, dTable)
}
function instantiateFractions(wp) {
	let text = wp.text;
	let parts = text.split('{');
	console.log('parts', parts);
	let tnew = '';
	if (!startsWith(text, '{')) { tnew += parts[0]; parts = parts.slice(1); }
	let denom;
	for (const part of parts) {
		let textPart = stringAfter(part, '}');
		let key = part.substring(0, 2);
		console.log('key', key);
		if (part[0] == 'F') { //{Fa/b}
			let numer = part[1] == 'a' ? 1 : isdef(denom) ? denom : randomNumber(2, 8);
			if (nundef(denom)) {
				denom = numer <= 2 ? randomNumber(numer + 1, 9) :
					numer < 9 ? coin() ? randomNumber(2, numer - 1) : randomNumber(numer + 1, 9) : randomNumber(2, number - 1);
			}
			tnew += ' ' + getTextForFraction(numer, denom);
			operands.push(numer / denom);
		}
		tnew += ' ' + textPart.trim();
	}
	wp.text = tnew.trim();
}
function instantiateWP(wp) {

	if (wp.title.includes('Fractions')) instantiateNumbersIncludingFractions(wp); else instantiateNumbers(wp);

	instantiateNames(wp);

	console.log('wp', wp.text, wp.result);
}
function evalWP(wp) {
	let title = wp.title;
	if (title.includes('Adding') && !titla.includes('Fractions')) {

	}
}

function instantiateNumbers_dep(wp) {

	let text = wp.text;


	let diop = {};
	//let result=replaceSol()

	//sol = R*N2=N1
	let sol = wp.sol;
	let rhs = stringBefore(sol, '=');
	let type = rhs.includes('*') ? rhs.includes('R') ? 'div' : 'mult' : rhs.includes('R') ? 'minus' : 'plus';
	//replace R and Nx in rhs by operands
	let i = 0;
	while (i < rhs.length) {
		if (rhs[i] == 'R') { diop.R = getOperand(type); i += 1; }
		else if (rhs[i] == 'N') {
			i += 1;
			let inum = Number(rhs[i]);
			let k = 'N' + inum;
			diop[k] = getOperand(type);
			i += 1;
		} else i += 1;
	}

	//geh nochmal durch und diesmal replace nx by some number < Nx
	//fuer div mit rest: R*N2+n2=N1
	i = 0;
	while (i < rhs.length) {
		if (rhs[i] == 'n') {
			i += 1;
			let inum = Number(rhs[i]);
			let k = 'n' + inum;
			let kN = 'N' + inum;
			let x = diop[kN];
			//console.log('number exists',x);
			diop[k] = randomNumber(1, x - 1);
			i += 1;
		} else i += 1;
	}

	//replace in sol each rhs by its operand, the eval rhs
	let eq = rhs;
	for (const k in diop) {
		eq = eq.replace(k, diop[k]);
	}
	//console.log('diop',diop);
	//console.log('eq',eq);
	let result = eval(eq);
	//console.log('result',result);

	//now, assign result to lhs
	let lhs = stringAfter(sol, '=');

	//if lhs contains more than 1 all but the last one have to be replaced by 
	diop[lhs] = result;

	//console.log('_______diop', diop);

	//now replace each key in text by diop[key] and sett wp.result to diop.R
	wp.result = { number: isdef(diop.R) ? diop.R : result };
	wp.result.text = '' + wp.result.number;
	for (const k in diop) {
		if (k == 'R') continue;
		text = text.replace('@' + k, diop[k]);
	}
	wp.text = text;
	return [diop, eq];
}

//#endregion

//#region scoring.js
function initScore() { resetScore(); }//Score = { gameChange: true, levelChange: true, nTotal: 0, nCorrect: 0, nCorrect1: 0, nPos: 0, nNeg: 0 }; }
function lastStreakFalse(items) {
	let n = G.decrementLevelOnNegativeStreak;
	let iFrom = items.length - 1;
	let iTo = iFrom - n;
	for (let i = iFrom; i > iTo; i--) {
		if (i < 0) return false;
		else if (items[i].isCorrect) return false;
	}
	return true;

}
function lastStreakCorrect(items) {
	let n = G.incrementLevelOnPositiveStreak;
	let iFrom = items.length - 1;
	let iTo = iFrom - n;
	for (let i = iFrom; i > iTo; i--) {
		if (i < 0) return false;
		else if (!items[i].isCorrect) return false;
	}
	return true;

}
function scoring(isCorrect) {

	console.log('hallo',Score)
	// update Score incl. streaks
	Score.nTotal += 1;
	if (isCorrect) { Score.nCorrect += 1; if (G.trialNumber == 1) Score.nCorrect1 += 1; }
	percentageCorrect = Math.round(100 * Score.nCorrect / Score.nTotal);
	if (isCorrect) { Score.nPos += 1; Score.nNeg = 0; } else { Score.nPos = 0; Score.nNeg += 1; }

	let levelChange = 0;
	let gameChange = false;
	let nextLevel = G.level;
	let toggle = G.pictureLabels == 'toggle';
	let hasLabels = G.showLabels == true; //currently has labels
	let boundary = G.samplesPerGame;


	//level change will occur iff streak (- or +). on streak: update StartLevel For User!
	//check streaks
	let pos = G.incrementLevelOnPositiveStreak;
	let posSeq = pos > 0 && Score.nPos >= pos;
	let halfposSeq = pos > 0 && Score.nPos >= pos / 2;
	let neg = G.decrementLevelOnNegativeStreak;
	let negSeq = neg > 0 && Score.nNeg >= neg;
	let halfnegSeq = neg > 0 && Score.nNeg >= neg / 2;
	// console.log('_________pos',pos,'posSeq',posSeq,'neg',neg,'negSeq',negSeq);
	//console.log('_________posSeq', posSeq, 'negSeq', negSeq);
	let labelsNextRound = G.showLabels;
	if (halfposSeq && hasLabels && toggle) { labelsNextRound = false; }
	else if (posSeq) { levelChange = 1; nextLevel += 1; Score.nPos = 0; }
	if (halfnegSeq && !hasLabels && toggle) { labelsNextRound = true; }
	else if (negSeq) { levelChange = -1; if (nextLevel > 0) nextLevel -= 1; Score.nNeg = 0; }
	if (nextLevel != G.Level && nextLevel > 0 && nextLevel <= G.maxlevel) {
		userUpdate(['games', G.id, 'startlevel'], nextLevel);
		// updateStartLevelForUser(G.id, nextLevel);
	}

	// if boundary reached: change game, 
	if (Score.nTotal >= boundary) {
		gameChange = true; levelChange = false;
	}

	if (levelChange || gameChange) {
		if (toggle) labelsNextRound = true;
	} else if (!halfnegSeq && toggle && hasLabels && Score.nTotal >= G.samplesPerGame / 2) {
		labelsNextRound = false;
	}

	//console.log('toggle', toggle, 'showLabels', hasLabels, 'labelsNextRound', labelsNextRound);
	G.showLabels = labelsNextRound;
	Score.gameChange = gameChange;
	Score.levelChange = levelChange;
	
	return nextLevel;
}


//restored:
function initScore() { resetScore(); }//Score = { gameChange: true, levelChange: true, nTotal: 0, nCorrect: 0, nCorrect1: 0, nPos: 0, nNeg: 0 }; }
function lastStreakFalse(items) {
	let n = G.decrementLevelOnNegativeStreak;
	let iFrom = items.length - 1;
	let iTo = iFrom - n;
	for (let i = iFrom; i > iTo; i--) {
		if (i < 0) return false;
		else if (items[i].isCorrect) return false;
	}
	return true;

}
function lastStreakCorrect(items) {
	let n = G.incrementLevelOnPositiveStreak;
	let iFrom = items.length - 1;
	let iTo = iFrom - n;
	for (let i = iFrom; i > iTo; i--) {
		if (i < 0) return false;
		else if (!items[i].isCorrect) return false;
	}
	return true;

}
function scoring(isCorrect) {

	//console.log(Score)
	// update Score incl. streaks
	Score.nTotal += 1;
	if (isCorrect) { Score.nCorrect += 1; if (G.trialNumber == 1) Score.nCorrect1 += 1; }
	percentageCorrect = Math.round(100 * Score.nCorrect / Score.nTotal);
	if (isCorrect) { Score.nPos += 1; Score.nNeg = 0; } else { Score.nPos = 0; Score.nNeg += 1; }

	let levelChange = 0;
	let gameChange = false;
	let nextLevel = G.level;
	let toggle = G.pictureLabels == 'toggle';
	let hasLabels = G.showLabels == true; //currently has labels
	let boundary = G.samplesPerGame;


	//level change will occur iff streak (- or +). on streak: update StartLevel For User!
	//check streaks
	let pos = G.incrementLevelOnPositiveStreak;
	let posSeq = pos > 0 && Score.nPos >= pos;
	let halfposSeq = pos > 0 && Score.nPos >= pos / 2;
	let neg = G.decrementLevelOnNegativeStreak;
	let negSeq = neg > 0 && Score.nNeg >= neg;
	let halfnegSeq = neg > 0 && Score.nNeg >= neg / 2;
	// console.log('_________pos',pos,'posSeq',posSeq,'neg',neg,'negSeq',negSeq);
	//console.log('_________posSeq', posSeq, 'negSeq', negSeq);
	let labelsNextRound = G.showLabels;
	if (halfposSeq && hasLabels && toggle) { labelsNextRound = false; }
	else if (posSeq) { levelChange = 1; nextLevel += 1; Score.nPos = 0; }
	if (halfnegSeq && !hasLabels && toggle) { labelsNextRound = true; }
	else if (negSeq) { levelChange = -1; if (nextLevel > 0) nextLevel -= 1; Score.nNeg = 0; }
	if (nextLevel != G.Level && nextLevel > 0 && nextLevel <= G.maxlevel) {
		userUpdate(['games', G.id, 'startlevel'], nextLevel);
		// updateStartLevelForUser(G.id, nextLevel);
	}

	// if boundary reached: change game, 
	if (Score.nTotal >= boundary) {
		gameChange = true; levelChange = false;
	}

	if (levelChange || gameChange) {
		if (toggle) labelsNextRound = true;
	} else if (!halfnegSeq && toggle && hasLabels && Score.nTotal >= G.samplesPerGame / 2) {
		labelsNextRound = false;
	}

	//console.log('toggle', toggle, 'showLabels', hasLabels, 'labelsNextRound', labelsNextRound);
	G.showLabels = labelsNextRound;
	Score.gameChange = gameChange;
	Score.levelChange = levelChange;
	return nextLevel;
}





//#endregion

//#region settings.js (features)

class SettingsClass {

	constructor(settingsObject, userObject, dParent) {
		this.o = settingsObject;
		this.u = userObject;
		//console.log('settings:',this.o,this.u);
		this.dParent = dParent;
	}
	//settings ui

	createSettingsUi(dParent) {
		dParent = valf(dParent, this.dParent);
		clearElement(dParent);
		this.list = [];
		let ttag = 'h2';
		mAppend(dParent, createElementFromHTML(`<${ttag}>Settings for ${this.o.friendly}</${ttag}>`));

		let nGroupNumCommonAllGames = this.mInputGroup(dParent);
		this.setzeEineZahl(nGroupNumCommonAllGames, 'samples', 25, ['samplesPerGame']);
		this.setzeEineZahl(nGroupNumCommonAllGames, 'minutes', 1, ['minutesPerUnit']);
		this.setzeEineZahl(nGroupNumCommonAllGames, 'correct streak', 5, ['incrementLevelOnPositiveStreak']);
		this.setzeEineZahl(nGroupNumCommonAllGames, 'fail streak', 2, ['decrementLevelOnNegativeStreak']);
		this.setzeEinOptions(nGroupNumCommonAllGames, 'show labels', ['toggle', 'always', 'never'], ['toggle', 'always', 'never'], 'toggle', ['pictureLabels']);

		//options duerfen nur die in available languages sein!!!!
		let avail = toLetterList(this.o.availableLanguages);
		const langs = { E: 'English', D: 'Deutsch', S: 'Spanish', F: 'French', C: 'Chinese' };
		let labels = avail.map(x => langs[x]);

		this.setzeEinOptions(nGroupNumCommonAllGames, 'language', avail, labels, 'E', ['language']);

		let vocabs = Object.keys(KeySets);
		vocabs.sort();
		this.setzeEinOptions(nGroupNumCommonAllGames, 'vocabulary', vocabs, vocabs, 'best25', ['vocab']);
		this.setzeEineCheckbox(nGroupNumCommonAllGames, 'show time', false, ['showTime']);
		this.setzeEineCheckbox(nGroupNumCommonAllGames, 'spoken feedback', true, ['spokenFeedback']);
		this.setzeEineCheckbox(nGroupNumCommonAllGames, 'silent', false, ['silent']);
		this.setzeEineCheckbox(nGroupNumCommonAllGames, 'switch game after level', false, ['switchGame']);
		this.setzeEineZahl(nGroupNumCommonAllGames, 'trials', 3, ['trials']);
		this.setzeEineCheckbox(nGroupNumCommonAllGames, 'show hint', true, ['showHint']);

		//console.log('Settings', this.list)
	}
	setSettingsKeys(elem) {
		let val = elem.type == 'number' ? Number(elem.value) : elem.type == 'checkbox' ? elem.checked : elem.value;
		lookupSetOverride(this.o, elem.keyList, val);
		this.hasChanged = true;
		//console.log(elem.keyList, val)
		//console.log(this.o);
	}
	setSettingsKeysSelect(elem) {

		let val;
		for (const opt of elem.children) {
			if (opt.selected) val = opt.value;
		}

		// console.log('lllllllllllllllll', a, a.value, a.keyList);
		//let val = elem.type == 'number' ? Number(elem.value) : elem.value;
		this.hasChanged = true;
		console.log('setting\nkeyList', elem.keyList)
		console.log('this.o', this.o)
		console.log('val', val)
		lookupSetOverride(this.o, elem.keyList, val);
		//console.log('result', lookup(this.o, elem.keyList));
	}
	setzeEineZahl(dParent, label, init, skeys) {
		// <input id='inputPicsPerLevel' class='input' type="number" value=1 />
		let d = mDiv(dParent);
		let val = lookup(this.o, skeys);
		if (nundef(val)) val = init;
		let inp = createElementFromHTML(
			// `<input id="${id}" type="number" class="input" value="1" onfocusout="setSettingsKeys(this)" />`); 
			`<input type="number" class="input" value="${val}" onfocusout="Settings.setSettingsKeys(this)" />`);
		let labelui = createElementFromHTML(`<label>${label}</label>`);
		mAppend(d, labelui);
		mAppend(labelui, inp);

		mStyle(inp, { maleft: 12, mabottom: 4 });
		mClass(inp, 'input');

		inp.keyList = skeys;
		this.addSetting(skeys[0]);
	}
	setzeEineCheckbox(dParent, label, init, skeys) {
		// <input id='inputPicsPerLevel' class='input' type="number" value=1 />
		let d = mDiv(dParent);
		let val = lookup(this.o, skeys);
		if (nundef(val)) val = init;
		let inp = createElementFromHTML(
			`<input type="checkbox" class="checkbox" ` + (val === true ? 'checked=true' : '') + ` onfocusout="Settings.setSettingsKeys(this)" >`
			// `<input id="${id}" type="number" class="input" value="1" onfocusout="setSettingsKeys(this)" />`); 
			// `<input type="number" class="input" value="${val}" onfocusout="setSettingsKeys(this)" />`
		);
		let labelui = createElementFromHTML(`<label>${label}</label>`);
		mAppend(d, labelui);
		mAppend(labelui, inp);

		mStyle(inp, { maleft: 12, mabottom: 4 });
		mClass(inp, 'input');

		inp.keyList = skeys;
		this.addSetting(skeys[0]);
	}
	setzeEinOptions(dParent, label, optionList, friendlyList, init, skeys) {

		// <input id='inputPicsPerLevel' class='input' type="number" value=1 />
		let d = mDiv(dParent);
		let val = lookup(this.o, skeys);
		if (nundef(val)) val = init;

		let inp = createElementFromHTML(`<select class="options" onfocusout="Settings.setSettingsKeysSelect(this)"></select>`);
		for (let i = 0; i < optionList.length; i++) {
			let opt = optionList[i];
			let friendly = friendlyList[i];
			let optElem = createElementFromHTML(`<option value="${opt}">${friendly}</option>`);
			mAppend(inp, optElem);
			if (opt == val) optElem.selected = true;
		}
		// // `<input id="${id}" type="number" class="input" value="1" onfocusout="setSettingsKeys(this)" />`); 
		// `<input type="number" class="input" value="${val}" onfocusout="setSettingsKeys(this)" />`);
		let labelui = createElementFromHTML(`<label>${label}</label>`);
		mAppend(d, labelui);
		mAppend(labelui, inp);

		mStyle(inp, { maleft: 12, mabottom: 4 });

		inp.keyList = skeys;
		this.addSetting(skeys[0]);
	}

	//helpers 
	mInputGroup(dParent, styles) {
		let baseStyles = { display: 'inline-block', align: 'right', bg: '#00000080', rounding: 10, padding: 20, margin: 12 };
		if (isdef(styles)) styles = mergeOverride(baseStyles, styles); else styles = baseStyles;
		return mDiv(dParent, styles);
	}
	addSetting(keylist) { if (nundef(this.list)) this.list = []; this.list.push(keylist); }

	//essential functions (keep in bg!)
	updateSettings() {

		this.updateLabelSettings();
		this.updateTimeSettings();
		//updateKeySettings();
		this.updateSpeakmodeSettings();

		//welche settings kommen wohin?
		let scope = 'user';//'game' 'level','temp','all'
		//console.log(Settings)
		if (scope == 'temp' || nundef(this.list)) return;
		for (const k of this.list) {

			console.log('updating', k, 'from', U.settings[k], 'to', this.o[k]);

			if (scope == 'user') lookupSetOverride(U, ['settings', k], this.o[k]);
			else if (scope == 'game') lookupSetOverride(U, ['games', this.o.id, k], this.o[k]);
			else if (scope == 'level') lookupSetOverride(U, ['games', this.o.id, 'levels', this.o.level, k], this.o[k]);
			else if (scope == 'all') lookupSetOverride(DB, ['settings', k], this.o[k]);
		}

	}
	updateSpeakmodeSettings() { if (this.o.silent && this.o.spokenFeedback) this.o.spokenFeedback = false; }
	updateTimeSettings() { if (PROJECTNAME != 'chatas') checkTimer(this.o); }//let timeElem = mBy('time'); if (this.o.showTime) { show(timeElem); startTime(timeElem); } else hide(timeElem); }
	updateLabelSettings() {
		if (this.o.pictureLabels == 'toggle') this.o.showLabels = true;
		else this.o.showLabels = (this.o.pictureLabels == 'always');
		//console.log('labels set to',this.o.showLabels)
	}
	updateGameValues(U) {
		//console.log('HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH');
		//extracts values for current user and current game from DB
		let game = this.o.id;
		let level = this.o.level;

		let settings = { numColors: 1, numRepeat: 1, numPics: 1, numSteps: 1, colors: ColorList }; // general defaults
		if (isdef(DB.settings)) settings = mergeOverride(settings, DB.settings);
		if (isdef(U.settings)) settings = mergeOverride(settings, U.settings);
		if (isdef(DB.games[game])) settings = mergeOverride(settings, DB.games[game]);
		let next = lookup(DB.games, [game, 'levels', level]); if (next) settings = mergeOverride(settings, next);
		next = lookup(U, ['games', game]); if (next) settings = mergeOverride(settings, next);
		next = lookup(U, ['games', game, 'levels', level]); if (next) settings = mergeOverride(settings, next);

		//console.log(settings);
		delete settings.levels;
		delete settings.colors;
		//console.log('settings', jsCopy(settings));
		let lang = settings.language;
		let avail = toLetterList(valf(settings.availableLanguages,'E'));
		if (!avail.includes(lang)) lang = chooseRandom(avail);
		settings.language = settings.lang = lang;
		Speech.setLanguage(settings.language);

		copyKeys(settings, this.o);
		this.updateSettings();

		//return settings;

	}

}
//#endregion

//#region time.js (features)
//neu in chatas
function timeConversion(duration, format = 'Hmsh') {
	// console.log(timeConversion((60 * 60 * 1000) + (59 * 60 * 1000) + (59 * 1000)));
	// console.log(timeConversion((60 * 60 * 1000) + (59 * 60 * 1000)              ));
	// console.log(timeConversion((60 * 60 * 1000)                                 ));
	// console.log(timeConversion((60 * 60 * 1000)                    + (59 * 1000)));
	// console.log(timeConversion(                   (59 * 60 * 1000) + (59 * 1000)));
	// console.log(timeConversion(                                      (59 * 1000)));
	if (duration < 0) duration = 0;
	const portions = [];

	const msInHour = 1000 * 60 * 60;
	const hours = Math.trunc(duration / msInHour);
	//if (hours > 0) {
	if (format.includes('H')) portions.push((hours < 10 ? '0' : '') + hours);
	duration = duration - (hours * msInHour); // hours + 'h');
	//}

	const msInMinute = 1000 * 60;
	const minutes = Math.trunc(duration / msInMinute);
	//if (minutes > 0) {
	if (format.includes('m')) portions.push((minutes < 10 ? '0' : '') + minutes);// minutes + 'm');
	duration = duration - (minutes * msInMinute);
	//}

	const msInSecond = 1000;
	const seconds = Math.trunc(duration / 1000);
	//if (seconds > 0) {
	if (format.includes('s')) portions.push((seconds < 10 ? '0' : '') + seconds);//seconds + 's');
	duration = duration - (seconds * msInSecond);
	//}

	const hundreds = duration / 10;
	if (format.includes('h')) portions.push((hundreds < 10 ? '0' : '') + hundreds);//hundreds);

	return portions.join(':');
}
class CTimer_dep {
	constructor(elem, msTick, onTick, msTotal, onElapsed) {
		this.elem = elem;
		this.msTotal = this.msLeft = msTotal;
		this.onTick = onTick;
		this.onElapsed = onElapsed;
		this.interval = msTick;
		this.running = false;
		this.paused = false;
		this.game = G.name;

		//mButton(caption, handler, dParent, styles, classes, id)
		this.button = mButton('click', this.togglePause.bind(this), this.elem, { transition: 'all 1s ease', display: 'inline-block', fz: 20, rounding: 12, bg: GREEN, w: 260 }, 'mybutton');
		this.TO = null;
		//this.d = mDiv(this.elem, { display: 'inline-block', rounding: 12, bg: GREEN, w: 260 }, null, 'TIMER');
		// this.d.onclick = this.togglePause.bind(this);
	}
	togglePause() { if (this.paused) this.continue(); else this.pause(); }
	clear() { this.stop(); clearElement(this.elem); }
	continue() {
		if (!this.running) this.start();
		else if (!this.paused) return;
		else { this.paused = false; this.TO = setInterval(this.tickHandler.bind(this), this.interval); }
	}
	tickHandler() {
		this.msLeft -= this.interval;
		let [ms, unit] = [this.msLeft, this.msTotal / 6];
		this.msElapsed = this.msTotal - this.msLeft;
		//console.log('msLeft', this.msLeft, timeConversion(this.msLeft));
		this.button.innerHTML = timeConversion(Math.max(this.msLeft, 0), 'sh');
		let bg = ms > unit * 4 ? GREEN : ms > unit * 2 ? YELLOW : ms > unit ? 'orange' : RED;
		this.button.style.background = bg;

		if (isdef(this.onTick)) this.onTick();
		if (this.msLeft <= 0) {
			this.stop();
			if (isdef(this.onElapsed)) {
				console.assert(G.name == this.game,'game not the same!!! '+G.name + ' ' +this.game);

				this.onElapsed();
			}
		}
	}
	start() {
		if (this.running) this.stop();
		this.started = new Date/1e3|0; //Date.now();
		this.msLeft = this.msTotal;
		this.msElapsed = 0;
		this.running = true;
		this.TO = setInterval(this.tickHandler.bind(this), this.interval);

	}
	stop() {
		if (!this.running) return;
		clearInterval(this.TO);
		this.running = false;


	}
	pause() {
		if (this.paused || !this.running) return;
		clearInterval(this.TO);
		this.paused = true;
	}

}

//aus belinda
function renewTimer(G, elem, onTimeOver = null) { if (nundef(GameTimer)) GameTimer = new TimerClass(G); GameTimer.restart(G, elem, onTimeOver); }
function checkTimer(G) { if (nundef(GameTimer)) return false; return GameTimer.check(G); }
class TimerClass {
	constructor(g, elem) {
		this.started, this.elapsed, this.onTimeOver = null, this.elem, this.timeLeft, this.settings = g;
		if (isdef(elem)) this.setElem(elem);
	}
	setElem(elem) {
		if (nundef(elem) && isdef(this.elem)) { elem = this.elem; }
		else if (nundef(elem)) { let d = mBy('time'); if (isdef(d)) this.elem = d; }
		else if (isString(elem)) { elem = mBy(elem); this.elem = elem; }
	}
	check(g) { this.settings = g; if (g.showTime) { show(this.elem); this.start(); } else { hide(this.elem); } return g.showTime; }
	clear() { clearTimeout(this.TO); }
	restart(g, elem, onTimeOver = null) {
		this.clear();
		this.setElem(elem);
		let active = this.check(g);
		//console.log('timer is',active)
		this.started = msNow();
		this.elapsed = 0;
		if (isdef(onTimeOver)) this.onTimeOver = onTimeOver;
		if (active) this.start();
	}
	start() {
		//console.log(this.settings.showTime,this.settings.minutesPerUnit)
		if (nundef(this.settings.showTime) || !this.settings.showTime) return;
		if (nundef(this.settings.minutesPerUnit)) this.settings.minutesPerUnit = 10;
		if (nundef(this.started)) { this.started = msNow(); this.elapsed = 0; }

		var timeLeft = this.timeLeft = this.settings.minutesPerUnit * 60000 - this.getTimeElapsed();
		//console.log('started at',this.started,'this.timeLeft',this.timeLeft)
		if (timeLeft > 0) {
			let t = msToTime(timeLeft);
			let s = format2Digits(t.h) + ":" + format2Digits(t.m) + ":" + format2Digits(t.s);

			this.elem.innerHTML = s;//h + ":" + m + ":" + s;
			this.TO = setTimeout(() => this.start(), 500);
		} else {
			this.elem.innerHTML = '00:00:00';
			if (this.onTimeOver) this.onTimeOver();
		}
	}
	unitTimeUp() {
		//console.log('TTTTTTTTTTT',this.settings.minutesPerUnit * 60000,this.getTimeElapsed(),this.started,this.elapsed);
		return (this.settings.minutesPerUnit * 60000 - this.getTimeElapsed()) <= 0;
	}
	startClock(elem) {
		if (nundef(this.settings.showTime) || !this.settings.showTime) return;
		var today = new Date(),
			h = format2Digits(today.getHours()),
			m = format2Digits(today.getMinutes()),
			s = format2Digits(today.getSeconds());

		if (isString(elem)) elem = mBy(elem); elem.innerHTML = h + ":" + m + ":" + s;
		this.TO = setTimeout(() => this.startClock(elem), 500);

	}
	getTimeElapsed() { return this.elapsed + msElapsedSince(this.started); }
}
class TimeoutManager {
	constructor() {
		this.TO = {};
	}
	clear(key) {
		if (nundef(key)) key = Object.keys(this.TO);
		else if (isString(key)) key = [];

		for (const k of key) {
			clearTimeout(this.TO[k]);
			delete this.TO[k];
		}
	}
	set(ms, callback, key) {
		if (nundef(key)) key = getUID();
		TO[key] = setTimeout(ms, callback);
	}
}
class CountdownTimer {
	constructor(ms, elem) {
		this.timeLeft = ms;
		this.msStart = Daat.now();
		this.elem = elem;
		this.tick();
	}
	msElapsed() { return Date.now() - this.msStart; }
	tick() {
		this.timeLeft -= this.msElapsed;
		this.elem.innerHTML = this.timeLeft;
		if (this.timeLeft > 1000) {
			setTimeout(this.tick.bind(this), 500);
		} else this.elem.innerHTML = 'timeover';
	}
}

//#endregion

//#region ui.js
//#region init UI
function initTable() {
	let table = mBy('table');
	clearElement(table);
	mStyle(table, { overflow: 'hidden' });

	initLineTop();
	initLineTitle();
	initLineTable();
	initLineBottom();

	dTable = dLineTableMiddle; 
	dTitle = dLineTitleMiddle;
	//console.log(dTable,dTitle)
}
function initSidebar() {
	let dParent = mBy('sidebar');
	clearElement(dParent);
	//console.log('dLeiste wird angelegt!!!!!!!')
	dLeiste = mDiv(dParent);
	mStyle(dLeiste, { 'min-width': 70, 'max-height': '100vh', display: 'flex', 'flex-flow': 'column wrap' });
}
function initAux() {
	dAux = mBy('dAux');
}
function initLineTop() {
	dLineTopOuter = mDiv(table); dLineTopOuter.id = 'lineTopOuter';
	dLineTop = mDiv(dLineTopOuter); dLineTop.id = 'lineTop';
	dLineTopLeft = mDiv(dLineTop); dLineTopLeft.id = 'lineTopLeft';
	dLineTopRight = mDiv(dLineTop); dLineTopRight.id = 'lineTopRight';
	dLineTopMiddle = mDiv(dLineTop); dLineTopMiddle.id = 'lineTopMiddle';

	dScore = mDiv(dLineTopMiddle);
	dScore.id = 'dScore';

	dLevel = mDiv(dLineTopLeft);
	dLevel.id = 'dLevel';

	dGameTitle = mDiv(dLineTopRight);
	dGameTitle.id = 'dGameTitle';
	let d = mDiv(dLineTopRight);
	d.id = 'time';

	mLinebreak(table);
}
function initLineTitle() {
	dLineTitleOuter = mDiv(table); dLineTitleOuter.id = 'lineTitleOuter';
	dLineTitle = mDiv(dLineTitleOuter); dLineTitle.id = 'lineTitle';
	if (PROJECTNAME != 'belinda') mStyle(dLineTitle,{matop:5});
	dLineTitleLeft = mDiv(dLineTitle); dLineTitleLeft.id = 'lineTitleLeft';
	dLineTitleRight = mDiv(dLineTitle); dLineTitleRight.id = 'lineTitleRight';
	dLineTitleMiddle = mDiv(dLineTitle); dLineTitleMiddle.id = 'lineTitleMiddle';

	mLinebreak(table);
}
function initLineTable() {
	dLineTableOuter = mDiv(table); dLineTableOuter.id = 'lineTableOuter';
	dLineTable = mDiv(dLineTableOuter); dLineTable.id = 'lineTable';
	dLineTableLeft = mDiv(dLineTable); dLineTableLeft.id = 'lineTableLeft';
	dLineTableMiddle = mDiv(dLineTable); dLineTableMiddle.id = 'lineTableMiddle';
	mClass(dLineTableMiddle, 'flexWrap');
	dLineTableRight = mDiv(dLineTable); dLineTableRight.id = 'lineTableRight';

	mLinebreak(table);
}
function initLineBottom() {
	dLineBottomOuter = mDiv(table); dLineBottomOuter.id = 'lineBottomOuter';
	dLineBottom = mDiv(dLineBottomOuter); dLineBottom.id = 'lineBottom';
	dLineBottomLeft = mDiv(dLineBottom); dLineBottomLeft.id = 'lineBottomLeft';
	dLineBottomRight = mDiv(dLineBottom); dLineBottomRight.id = 'lineBottomRight';
	dLineBottom = mDiv(dLineBottom); dLineBottom.id = 'lineBottomMiddle';

	mLinebreak(table);
}
//#endregion



//#endregion

//#region user.js

function cleanupOldGame() {
	updateUserScore();//this saves user data + clears the score.nTotal,nCorrect,nCorrect1!!!!!
	//console.log('haaaaaaaaaaaaaaaaaaaaaaaaa')
	//clear previous game (timeouts...)
	if (isdef(G)) { G.clear(); }
	clearTable();
	clearStats();
	clearFleetingMessage();

}
function editableUsernameUi(dParent) {
	//console.log('creating input elem for user', Session.cur_user)
	let inp = mEditableInput(dParent, 'user: ', Session.cur_user);
	inp.id = 'spUser';
	inp.addEventListener('focusout', () => { changeUserTo(inp.innerHTML.toLowerCase()); });
	return inp;
}
function getUserStartLevel(game) { return valf(lookup(U, ['games', game, 'startlevel']), 0); }
function showUsernameOnScreen(isEditable=true){
	let uiName = 'spUser';
	let dUser = mBy(uiName);
	if (isdef(dUser)) return;
	dUser = isEditable? editableUsernameUi(dLineTopLeft):mText(Session.cur_user, dLineTopLeft);
	dUser.id = uiName; 
}
function save_users(db_dirty = true) {

	//console.log('save_users:', Session.cur_user,G.id,G.level); //_getFunctionsNameThatCalledThisFunction()); 
	if (isdef(G)) U.lastGame = G.id;
	if (!startsWith(Session.cur_user, 'test')) localStorage.setItem('user', Session.cur_user);

	DB.users[Session.cur_user] = U;
	if (db_dirty) db_save();
}
function setNextGame() {
	let game = G.id;
	let i = U.avGames.indexOf(game);
	let iNew = (i + 1) % U.avGames.length;
	setGame(U.avGames[iNew]);
}
function updateUserScore() {
	if (nundef(Score.nTotal) || Score.nTotal <= 0) return;

	let sc = { nTotal: Score.nTotal, nCorrect: Score.nCorrect, nCorrect1: Score.nCorrect1, nWins: Score.nWins, nLoses: Score.nLoses, nTied: Score.nTied };
	let g = G.id;

	let recOld = lookupSet(U, ['games', g], { startlevel: 0, nTotal: 0, nCorrect: 0, nCorrect1: 0, nWins: 0, nLoses: 0, nTied: 0 });
	let recSession = lookupSet(U, ['session', g], { startlevel: 0, nTotal: 0, nCorrect: 0, nCorrect1: 0, nWins: 0, nLoses: 0, nTied: 0 });

	addByKey(sc, recSession);
	let counts = DB.games[g].controllerType == 'solo' ? recSession.nWins : recSession.nCorrect;
	recSession.percentage = Math.round(100 * counts / recSession.nTotal);

	addByKey(sc, recOld);
	counts = DB.games[g].controllerType == 'solo' ? recOld.nWins : recOld.nCorrect;
	recOld.percentage = Math.round(100 * recOld.nCorrect / recOld.nTotal);

	// console.log('updated user score for', U.id, g, sc, recSession);
	//console.log('updated user score session', recSession);
	Score.nTotal = Score.nCorrect = Score.nCorrect1 = 0;
	save_users();
}
function userUpdate(proplist, val) {
	lookupSetOverride(U, proplist, val);
	save_users();
}


//#endregion

//#region workUI.js
//instruction
function ani_say(d, fSpeak) {
	if (isdef(fSpeak)) fSpeak(); // say(spoken);
	mClass(d, 'onPulse');
	setTimeout(() => mRemoveClass(d, 'onPulse'), 500);

}
function show_click_vocab() {
	//say something like: click APPLE

	let cmd = 'click';
	let vocab = Goal.label;
	let voice = G.language;
	let dParent = dTitle;
	let fz = 36;
	//console.log('cmd', cmd);	console.log('vocab', vocab);	console.log('voice', voice);

	let fSpeak = () => {
		Speech.say(cmd, 1, .8, .9, 'random', () => {
			Speech.say(vocab, 1, .8, .9, voice);
		}, 'E');
	};
	fSpeak();

	clearElement(dParent);
	let d = mDiv(dParent);
	mStyle(d, { margin: 15 })
	mClass(d, 'flexWrap');
	let msg = cmd + " " + `<b>${vocab.toUpperCase()}</b>`;
	if (nundef(fz)) fz = 36;
	let d1 = mText(msg, d, { fz: fz, display: 'inline-block' });

	let sym = symbolDict.speaker;
	let d2 = mText(sym.text, d, {
		fz: fz + 2, weight: 900, display: 'inline-block',
		family: sym.family, 'padding-left': 14
	});

	dFeedback = dInstruction = d;
	dInstruction.addEventListener('click', () => ani_say(dInstruction, () => {
		Speech.say(vocab, 1, .8, .9, voice);}));

}

//success failure correction
function success_pic_goal(withComment = true) {
	let lang = G.language;
	if (withComment && G.spokenFeedback) {
		const comments = {
			E: ['YEAH!', 'Excellent!!!', 'CORRECT!', 'Great!!!'],
			D: ['gut', 'Sehr Gut!!!', 'richtig!!', 'Bravo!!!'],
			S: ['bien', 'muy bien!!!', 'eccelente!!', 'bravo!!!'],
			F: ['bien', 'tres bien!!!', 'fantastique!!', 'bravo!!!', 'excellent!!!'],
			C: ['优秀', '好的!!!', '正确的!!', 'Bravo!!!'],
		}[lang];
		say(chooseRandom(comments), lang);
	}
	if (isdef(Selected) && isdef(Selected.feedbackUI)) {
		let uilist;
		if (isdef(Selected.positiveFeedbackUI)) uilist = [Selected.positiveFeedbackUI];
		else uilist = isList(Selected.feedbackUI) ? Selected.feedbackUI : [Selected.feedbackUI];
		let sz = getRect(uilist[0]).h;
		//console.log('in der succesfunc!!!!!!!', uilist)
		for (const ui of uilist) {
			let d = markerSuccess();
			//console.log('sz',sz,'ui',ui,'\nmarker',d);
			mpOver(d, ui, sz * (4 / 5), 'limegreen', 'segoeBlack');
		}
	}
}




function show_instruction_different(dParent, wlist, slist, styles) {

	wlist = [
		{ phrase: 'click', styles: { fg: 'red' } },
		{ phrase: 'tomato', styles: { fg: 'red' } },
	];
	slist = [
		{ phrase: 'click', voice: 'default', }
	];
	//show_instruction(sWritten, dTitle, sSpoken, { fz: 22, voice: 'zira' });
	//showInstruction(Goal.label, 'click', dTitle, true);
	console.assert(isdef(Speech));

	//console.assert(title.children.length == 0,'TITLE NON_EMPTY IN SHOWINSTRUCTION!!!!!!!!!!!!!!!!!')
	//console.log('G.id is', G.id)
	clearElement(dParent);
	let d = mDiv(dParent);
	mStyle(d, { margin: 15 })
	mClass(d, 'flexWrap');

	//old: combine cmd und special word
	let msg = cmd + " " + `<b>${text.toUpperCase()}</b>`;
	if (nundef(fz)) fz = 36;
	let d1 = mText(msg, d, { fz: fz, display: 'inline-block' });
	//new
	if (nundef(fz)) fz = 36;
	d1 = mText(written, d, { fz: fz, display: 'inline-block' });

	//old
	if (isSpoken) {
		let sym = symbolDict.speaker;
		let d2 = mText(sym.text, d, {
			fz: fz + 2, weight: 900, display: 'inline-block',
			family: sym.family, 'padding-left': 14
		});
	}
	dFeedback = dInstruction = d;
	spoken = isSpoken ? isdef(spoken) ? spoken : cmd + " " + text : null;
	dInstruction.addEventListener('click', () => aniInstruction(spoken));
	if (!isSpoken) return;
	say(isdef(spoken) ? spoken : (cmd + " " + text));

	//new
	let sym = symbolDict.speaker;
	let d2 = mText(sym.text, d, {
		fz: fz + 2, weight: 900, display: 'inline-block',
		family: sym.family, 'padding-left': 14
	});
	dFeedback = dInstruction = d;

	dInstruction.addEventListener('click', () => aniInstruction(spoken));
	if (isdef(spoken)) say(spoken);

}
function showWritten(cmd, vocab, dParent, styles) { }
function showSpoken() { }




















//#endregion

//#region onClick.js
function onClickFreezer2(ev) {
	clearTable(); mRemoveClass(mBy('freezer2'), 'aniSlowlyAppear'); hide('freezer2'); auxOpen = false;
	savedb();
	//startUnit();
}
function onClickFloppy() {
	savedb();
}
function onClickGear() {
	openAux();
	hide('dGear');
	hide('dFloppy');
	hide('dCalibrate');
	Settings.createSettingsUi(dAux);
}
function onClickGo(ev) {
	if (isVisible('dTemple')) {
		closeAux();
		if (G.controllerType == 'solitaire') GC.startGame(); else GC.activateUi();
	} else {
		let item = isdef(ev) ? evToItemC(ev) : null;
		let gKey = nundef(ev) ? SelectedMenuKey : isString(ev) ? ev : item.id; // divKeyFromEv(ev);
		if (gKey != SelectedMenuKey) {
			if (isdef(SelectedMenuKey)) toggleItemSelection(Items[SelectedMenuKey]);
			SelectedMenuKey = gKey;
			let item = Items[SelectedMenuKey];
			toggleItemSelection(item);
		} else {
			closeAux();
			setGame(gKey);
			GC.startGame();
		}
	}
}
function onClickMenuItem(ev) { onClickGo(ev); }
function onClickNextGame(){	setNextGame(); GC.startGame();}
function onClickShield(ev){ 
	ev.stopPropagation(); 
	console.log('wait...?');
	hideShield();
}
function hideShield(){setTimeout(()=>{mBy('dShield').style.display = 'none'},500);}
function showShield(){mBy('dShield').style.display = 'block';}
function onClickTemple() {
	openAux();
	hide('dTemple');
	createMenuUi(dAux, U.avGames, onClickMenuItem);
}



//onclick helpers
function clearTimeouts() {
	onclick = null;
	clearTimeout(TOMain); //console.log('TOMain cleared')
	clearTimeout(TOTicker);
	//clearTimeout(TOLong); console.log('TOLong cleared')
	clearTimeout(TOFleetingMessage);
	clearTimeout(TOTrial);
	if (isdef(TOList)) { for (const k in TOList) { TOList[k].map(x => clearTimeout(x)); } }
}
function closeAux() {
	hide(dAux);
	hide('dGo');
	show('dGear');
	show('dFloppy');
	show('dTemple');
	if (Settings.hasChanged) { Settings.updateSettings(); db_save(); }
	Settings.hasChanged = false;
	auxOpen = false;
}
function interrupt() {
	//console.log('iiiiiiiiiiiiiiiiiiiiiiii')
	STOPAUS = true;
	uiActivated = aiActivated = false;
	clearTimeouts(); //legacy
	if (isdef(G) && isdef(G.clear)) G.clear();
	if (isdef(GC) && isdef(GC.clear)) GC.clear();
	TOMan.clear();
	clearMarkers();

}
function openAux() { interrupt(); show(dAux); show('dGo'); }

//#endregion


