function canAct() { return (aiActivated || uiActivated) && !auxOpen; }
function canHumanAct() { return uiActivated && !auxOpen; }
function canAIAct() { return aiActivated && !auxOpen; }
function setGame(game, immediate = false) {
	cleanupOldGame();
	resetUIDs();
	if (isdef(G) && G.id != game) Score.gameChange = true;

	//console.log('game',game)
	G = new (classByName(capitalize(game)))(game, DB.games[game]);
	Settings = new SettingsClass(G, dAux);
	//console.log('G',G)

	if (nundef(U.games[game])) {
		if (G.controllerType == 'solitaire') { U.games[game] = { nTotal: 0, nCorrect: 0, nCorrect1: 0, startLevel: 0 }; }
		else U.games[game] = {};
	}

	if (isdef(G.maxLevel)) G.level = Math.min(getUserStartLevel(game), G.maxLevel);

	if (G.id != 'gAristo') Settings.updateGameValues(U, G); //hier werden die belinda settings geadded
	// presentNode(G,'HALLO',dTable.firstChild)

	save_user(); //das sollte nur gemacht werden wenn wirklich was sich geaendert hat!

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





