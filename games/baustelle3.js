
function calcNumRanks(total, repeat, ncolors) {
	let d = Math.ceil(total / (repeat * ncolors));
	return range(1, d + 1);
}


function start_new_generation(fen, players, options) {
	let deck_discard = fen.deck_discard = [];
	let deck_ballots = [];
	let handsize = fen.handsize;
	let ctype = fen.cardtype;
	if (ctype == 'c52') {
		let ranks = fen.ranks = '*A23456789TJQK';
		let tb = {
			4: ['4', '5', 5, 12, 1],
			5: ['4', 'T', 6, 2, 1],
			6: ['2', 'T', 6, 0, 1],
			7: ['A', 'T', 6, 2, 1],
			8: ['2', 'K', 6, 0, 1],
			9: ['A', 'K', 6, 0, 1],
			10: ['2', 'K', 5, 2, 1],
			11: ['A', 'K', 5, 3, 1],
			12: ['2', '8', 5, 4, 2],
			13: ['2', '9', 5, 2, 2],
			14: ['2', '9', 5, 2, 2], //add 4 10s
		};
		if (nundef(players)) players = get_keys(fen.players);
		let N = players.length;

		let [r0, r1, hz, jo, numdecks] = tb[N];

		for (let i = ranks.indexOf(r0); i <= ranks.indexOf(r1); i++) {
			for (let nd = 0; nd < numdecks; nd++) {
				let c = ranks[i];
				for (const suit of 'SHDC') { deck_ballots.push(c + suit + 'n'); }
			}
		}
		if (N == 14) { for (const suit of 'SHDC') { deck_ballots.push('T' + suit + 'n'); } }

		// *** jokers ***
		// for (let i = 0; i < jo; i++) { deck_ballots.push('A' + (i % 2 ? 'H' : 'S') + 'n'); }  //'' + (i%2) + 'J' + 'n');
		// for (let i = 0; i < jo; i++) { deck_ballots.push('' + (i%2) + 'J' + 'n'); } 
		for (let i = 0; i < jo; i++) { deck_ballots.push('*' + (i % 2 ? 'H' : 'S') + 'n'); }
	} else if (ctype == 'num') {
		let ncolors = fen.colors.length;
		let nplayers = get_keys(fen.players).length;
		let ranks = fen.ranks = calcNumRanks(players.length * handsize, 2, ncolors);
		//console.log('ranks',ranks);
		let ncards = handsize * nplayers;
		let colors = fen.colors;
		let n = 1;
		while (deck_ballots.length < ncards) {
			for (const c of colors) {
				for (const i of range(2)) {
					deck_ballots.push(`${n}_${c}`);
				}
			}
			n++;
		}
	}

	console.log('new gen: ranks=', fen.ranks)

	shuffle(deck_ballots); console.log('deck', deck_ballots);
	fen.deck_ballots = deck_ballots;
	//console.log('deck_ballots:::',deck_ballots.length);
	for (const plname in fen.players) {
		let pl = fen.players[plname];
		pl.hand = deck_deal(deck_ballots, handsize);
	}
	//console.log('phase',fen.phase)
	let gens = lookup(fen, ['generations']);
	let last_winning_color = gens && gens.length >= 1 ? arrLast(gens).color : null;
	fen.policies = [];
	if (last_winning_color && fen.colors.includes(last_winning_color)) {
		fen.policies.push(get_color_card(last_winning_color)); //'Q' + (last_winning_color == 'red' ? 'H' : 'S') + 'n');
	}
	fen.validvoters = jsCopy(players)
	fen.crisis = 0;
	delete fen.president;
	delete fen.newpresident;
	delete fen.isprovisional;
	delete fen.player_cards;
	delete fen.accused;
	delete fen.dominance;

	//ari_history_list(`*** generation ${fen.phase} starts ***`,'',fen)

}

function rest() {
	let ranks = fen.ranks;
	let tb = {
		4: ['4', '5', 5, 12, 1],
		5: ['4', 'T', 6, 2, 1],
		6: ['2', 'T', 6, 0, 1],
		7: ['A', 'T', 6, 2, 1],
		8: ['2', 'K', 6, 0, 1],
		9: ['A', 'K', 6, 0, 1],
		10: ['2', 'K', 5, 2, 1],
		11: ['A', 'K', 5, 3, 1],
		12: ['2', '8', 5, 4, 2],
		13: ['2', '9', 5, 2, 2],
		14: ['2', '9', 5, 2, 2], //add 4 10s
	};
	if (nundef(players)) players = get_keys(fen.players);
	let N = players.length;

	let deck_ballots = [];
	let [r0, r1, handsize, jo, numdecks] = tb[N];

	for (let i = ranks.indexOf(r0); i <= ranks.indexOf(r1); i++) {
		for (let nd = 0; nd < numdecks; nd++) {
			let c = ranks[i];
			for (const suit of 'SHDC') { deck_ballots.push(c + suit + 'n'); }
		}
	}
	if (N == 14) { for (const suit of 'SHDC') { deck_ballots.push('T' + suit + 'n'); } }

	// *** jokers ***
	// for (let i = 0; i < jo; i++) { deck_ballots.push('A' + (i % 2 ? 'H' : 'S') + 'n'); }  //'' + (i%2) + 'J' + 'n');
	// for (let i = 0; i < jo; i++) { deck_ballots.push('' + (i%2) + 'J' + 'n'); } 
	for (let i = 0; i < jo; i++) { deck_ballots.push('*' + (i % 2 ? 'H' : 'S') + 'n'); }

	shuffle(deck_ballots);	//console.log('deck', deck_ballots);
	fen.deck_ballots = deck_ballots;
	fen.handsize = handsize;
	//console.log('deck_ballots:::',deck_ballots.length);
	for (const plname in fen.players) {
		let pl = fen.players[plname];
		pl.hand = deck_deal(deck_ballots, handsize);
	}
	//console.log('phase',fen.phase)
	let gens = lookup(fen, ['generations']);
	let last_winning_color = gens && gens.length >= 1 ? arrLast(gens).color : null;
	fen.policies = [];
	if (last_winning_color && fen.colors.includes(last_winning_color)) {
		fen.policies.push(get_color_card(last_winning_color)); 
	}
	fen.validvoters = jsCopy(players)
	fen.crisis = 0;
	delete fen.president;
	delete fen.newpresident;
	delete fen.isprovisional;
	delete fen.player_cards;
	delete fen.accused;
	delete fen.dominance;

	//ari_history_list(`*** generation ${fen.phase} starts ***`,'',fen)

}


function show_card_1(ckey, sz) {

	console.log('show_card', ckey)

	let card = cBlank(dTable, { h: sz, border: 'silver' });

	let d = iDiv(card, { margin: 10 });
	let color = stringAfter(ckey, '_');
	let num = stringBefore(ckey, '_');

	//let d=mMeasure()

	let [sm, lg] = [sz / 8, sz / 4]

	let styles = { fg: color, h: sm, fz: sm, hline: sm, weight: 'bold' };
	for (const pos of ['tl', 'tr']) {
		let d1 = mDiv(d, styles, null, num);
		mPlace(d1, pos, 2, 2);
	}
	for (const pos of ['bl', 'br']) {
		let d1 = mDiv(d, styles, null, num);
		d1.style.transform = 'rotate(180deg)';
		mPlace(d1, pos, 2, 2);
	}
	let dbig = mDiv(d, { family: 'algerian', fg: color, fz: lg, h: lg, w: '100%', hline: lg, align: 'center' }, null, num);
	mPlace(dbig, 'cc');
	return card;

}


function measureTextX(text, fz, family, weight = 900) {
	let sFont = '' + weight + ' ' + fz + 'px ' + family;
	sFont = sFont.trim();
	var canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement('canvas'));
	var context = canvas.getContext('2d');
	context.font = sFont;
	var metrics = context.measureText(text);
	let actualHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
	console.log(metrics.width, actualHeight, fz)
	return { w: metrics.width, h: actualHeight, fz: fz };
}

function getTextSizeX(text, fz, family, weight = 900, parentDivOrId = null, styles = {}) {
	var d = document.createElement("div");
	styles.fz = fz;
	styles.family = family;
	styles['font-weight'] = weight;
	styles.position = 'fixed';
	styles.opacity = 0;
	styles.top = '-9999px';
	styles.w = 200;
	mStyleX(d, styles);
	d.innerHTML = text;
	if (isdef(parentDivOrId)) {
		if (isString(parentDivOrId)) parentDivOrId = document.getElementById(parentDivOrId);
		parentDivOrId.appendChild(d);
	} else {
		document.body.appendChild(d);
	}
	height = d.clientHeight;
	width = d.clientWidth;
	d.parentNode.removeChild(d)
	return { w: width, h: height };
}
function getTextSizeX1(text, fz, family, weight = 900, parentDivOrId = null, styles = {}) {
	var d = document.createElement("div");
	styles.fz = fz;
	styles.family = family;
	styles['font-weight'] = weight;
	styles.position = 'fixed';
	styles.opacity = 0;
	styles.top = '-9999px';
	mStyleX(d, styles);
	d.innerHTML = text;
	if (isdef(parentDivOrId)) {
		if (isString(parentDivOrId)) parentDivOrId = document.getElementById(parentDivOrId);
		parentDivOrId.appendChild(d);
	} else {
		document.body.appendChild(d);
	}
	height = d.clientHeight;
	width = d.clientWidth;
	return { w: width, h: height, d: d };
}

function getTextSize(s = 'hallo', parentDivOrId) {
	var newDiv = document.createElement("div");
	newDiv.innerHTML = s;
	newDiv.style.cssText = "position:fixed; top:-9999px; opacity:0;"
	if (isdef(parentDivOrId)) {
		if (isString(parentDivOrId)) parentDivOrId = document.getElementById(parentDivOrId);
		parentDivOrId.appendChild(newDiv);
	} else {
		document.body.appendChild(newDiv);
	}
	height = newDiv.clientHeight;
	width = newDiv.clientWidth;
	newDiv.parentNode.removeChild(newDiv)
	return { w: width, h: height };
}

function getTextWidth(text, font) {
	var canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement('canvas'));
	var context = canvas.getContext('2d');
	context.font = font;
	var metrics = context.measureText(text);
	return metrics.width;
}





function accuse_ai_move(bot) {
	let [pl, fen, stage] = [Z.fen.players[bot], Z.fen, Z.stage];
	if (stage == 'hand') {
		//this is where hand card or empty can be played
		pl.move = { state: { item: '' } }
	} else if (stage == 'membership') {
		//this is where a membership card has to be chosen
	}
}









