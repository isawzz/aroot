


class GSpotit extends Game {
	constructor(name, o) { super(name, o); }
	startGame() { this.correctionFunc = showCorrectUis; }
	start_Level() {
		super.start_Level();
		this.colarr = _calc_hex_col_array(this.rows, this.cols);
		let perCard = arrSum(this.colarr);
		this.nShared = (this.numCards * (this.numCards - 1)) / 2;
		this.nUnique = perCard - this.numCards + 1;
		this.numKeysNeeded = this.nShared + this.numCards * this.nUnique;
		this.keys = setKeysG(this, (_, x) => !x.includes(' '), this.numKeysNeeded + 1);
		//this.keys = oneWordKeys(this.keys); 
	}
	deal() {
		let keys = choose(this.keys, this.numKeysNeeded);
		let dupls = keys.slice(0, this.nShared); //these keys are shared: cards 1 and 2 share the first one, 1 and 3 the second one,...
		let uniqs = keys.slice(this.nShared);
		//console.log('numCards', numCards, '\nperCard', perCard, '\ntotal', keys.length, '\ndupls', dupls, '\nuniqs', uniqs);

		let infos = [];
		for (let i = 0; i < this.numCards; i++) {
			let keylist = uniqs.slice(i * this.nUnique, (i + 1) * this.nUnique);
			//console.log('card unique keys:',card.keys);
			let info = { id: getUID(), shares: {}, keys: keylist, rows: this.rows, cols: this.cols, colarr: this.colarr };
			infos.push(info);
		}

		let iShared = 0;
		for (let i = 0; i < this.numCards; i++) {
			for (let j = i + 1; j < this.numCards; j++) {
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
	interact(ev) {
		ev.cancelBubble = true;
		if (!canAct()) { console.log('no act'); return; }

		let keyClicked = evToProp(ev, 'key');
		let id = evToId(ev);

		if (isdef(keyClicked) && isdef(Items[id])) {
			clearInterval(this.TO);
			let item = Items[id];
			//console.log('clicked key', keyClicked, 'of card', id, item);
			if (Object.values(item.shares).includes(keyClicked)) {
				//console.log('success!!!');//success!
				//find the card that shares this symbol!
				let otherCard = spotitFindCardSharingSymbol(item, keyClicked);
				//console.log('otherCard', otherCard);
				let cardSymbol = ev.target;
				let otherSymbol = spotitFindSymbol(otherCard, keyClicked);
				//console.log('otherSymbol', otherSymbol);
				//mach die success markers auf die 2 symbols!
				Selected = { isCorrect: true, feedbackUI: [cardSymbol, otherSymbol] };

			} else {
				//console.log('fail!!!!!!!!'); //fail
				let cardSymbol = ev.target;
				Selected = { isCorrect: false, feedbackUI: [cardSymbol], correctUis: this.getSharedSymbols(), correctionDelay: this.items.length * 1500 };

			}
			this.controller.evaluate.bind(this.controller)();
		}
	}
	getSharedSymbols() {
		let result = [];
		for (const item of this.items) {
			for (const id in item.shares) {
				let k = item.shares[id];
				let ui = iGetl(item, k);
				result.push(ui);
			}
		}
		return result;
	}
	eval() { return Selected.isCorrect; }
	prompt() {
		show_instruction('find common symbol', dTitle);


		this.dTimeOuter = mDiv(dTable, { w: 100, h: 25, border: 'black', position: 'relative' }, null, '10');
		[this.wTimer, this.r, this.g] = [0, 0, 255];
		this.dTimeInner = mDiv(this.dTimeOuter, { h: 25, w: this.wTimer, bg: `rgb(${this.r},${this.g},0)`, position: 'absolute', left: 0, top: 0 });

		mLinebreak(dTable, 25);

		let infos = this.deal(); //backend

		//frontend
		let items = this.items = [];
		for (const info of infos) {
			let item = spotitCard(info, dTable, { margin: 10 }, this.interact.bind(this));
			items.push(item);
		}

		this.controller.activateUi.bind(this.controller)();

		return;
		for (const item of items) {
			//shared symbol shouldn't be same size as on the other card!

			for (const k in item.shares) {
				let other = Items[item.shares[k]];
			}
		}
	}
	activate() {
		//kann ich den timer irgendwie anders machen?
		this.secsLeft = 10;
		this.TO = setInterval(this.onTick.bind(this), 1000);
	}
	onTick() {
		//console.log('noch', this.secsLeft, 'seconds!');
		this.secsLeft -= 1;
		this.wTimer += 10; this.r += 25; this.g -= 25;
		mStyle(this.dTimeInner, { w: this.wTimer, bg: `rgb(${this.r},${this.g},0)` });

		if (this.secsLeft < 1) {
			//console.log('TIME UP!!!');
			clearInterval(this.TO);
			Selected = { isCorrect: false, correctUis: this.getSharedSymbols(), correctionDelay: this.items.length * 2000 };
			this.controller.evaluate.bind(this.controller)();
		}
	}
}

//#region programming game
class GProg extends Game {
	constructor(name, o) { super(name, o); }

	prompt() {

		let c = this.card = cRound(dTable); //cPortrait(dTable);
		let d = c.visual = iDiv(c);

		visualPropertySetter(this.card);
		visualAttributeSetter(this.card);

		d.innerHTML = 'HALLO';
		mStyle(d, { fg: 'blue' });

		//show_instruction('write code what rank and suit this card should have', dTitle);

		mLinebreak(dTable, 25);

		this.ta = this.createTextArea();

		this.ta.value = `mCenterCenterFlex(card.visual);`; // console.log(card.bg);`; //7 NO

		mLinebreak(dTable, 25);

		mButton('run', this.runCode.bind(this), dTable, { bg: 'skyblue', fg: 'black', fz: 32 }, 'mybutton');

		//console.log('type of style', typeof this.card1);


	}
	runCode() {
		let code = this.ta.value;

		let prelim = ''; //prefix a context
		//10
		prelim = 'let card = this.card;'; //add context: 6

		code = prelim + code;
		//console.log('code', code);

		eval(code);
	}
	createTextArea() {
		let dCode = mDiv(dTable, {});
		let ta = this.ta = mCreate('textarea');
		mAppend(dCode, ta);
		ta.setAttribute('rows', 10);
		ta.setAttribute('cols', 60);
		mStyle(ta, { family: 'courier', padding: 10 });
		return ta;
	}
}
function propertyGiverW0(o, prop, setter) {
	//usage: // propertyGiverW0(c, 'color', x=>G.style.background = x); //YES!
	Object.defineProperty(o, prop, {
		get: function () { return this.val; },
		set: function (val) { setter(val); }
		// set: function (val) { console.log('this',this); this.val = val; setter(val); }
	});
}
function propertyGiver(o, prop, setter, getter) {
	//usage: // propertyGiverW0(c, 'color', x=>G.style.background = x); //YES!
	Object.defineProperty(o, prop, {
		get: function () { return getter(); },
		set: function (val) { setter(val); }
		// set: function (val) { console.log('this',this); this.val = val; setter(val); }
	});
}
function visualPropertySetter(c) {
	let props = 'bg fg h w background color height width rounding padding fz font align';
	for (const k of props.split(' ')) {
		//propertyGiverW0(c, k, x => { let styles = {}; styles[k] = x; mStyle(c.visual, styles); });
		propertyGiver(c, k,
			x => { let styles = {}; styles[k] = x; mStyle(c.visual, styles); },
			() => { return mGetStyle(c.visual, k); }
		);
	}
	//propertyGiverW0(c, 'bg', x => { mStyle(G.visual, { 'bg': x }); }); //YES!!
}
function visualAttributeSetter(c) {
	let props = 'innerHTML onclick';
	for (const k of props.split(' ')) {
		// propertyGiverW0(c, k, x => c.visual[k] = x);
		propertyGiver(c, k, x => c.visual[k] = x, () => c.visual[k]);
	}
	//propertyGiverW0(c, 'bg', x => { mStyle(G.visual, { 'bg': x }); }); //YES!!
}

//#endregion

//#region aristo
class GAristo extends GMinimalGame {
	constructor(name, o) { super(name, o); }
	startGame(fen) {
		//testFindKeys();testInno();
		//testInnoMain();
		//symbolMeasuring();

		//testBirdCards(); //ok
		//test52CardsOther(); //ok
		//testCard52Cards();

		if (nundef(fen)) { fen = G.START_FEN = this.default_start_fen(); }
		this.parse_fen(fen);
		return;
		// this.gamify();

		// let d1 = mDiv(dTable, { w: '50%', float: 'left' });
		// presentNode(this, 'G', d1, ['draw_pile', 'market', 'buy', 'discard_pile', 'numPlayers'], [], [], ['controller', 'deck']);
		// let d2 = mDiv(dTable, { w: '50%' });
		// presentNode(Items, 'Items', d2);
		// return;

		let n = this.nOthers = 2; chooseRandom(this.numPlayers);

		let me = this.me = gameItem(Username).id;
		let others = this.others = []; for (let i = 0; i < n; i++) others.push(gameItem(randomName()).id);
		let allPlayers = this.allPlayers = [me].concat(others);
		let world = this.world = gameItem('world'); // mItem('world',null,{ color: randomColor(), name:'world' });
		let market = this.market = gameItem('market'); // mItem('market',null,{ color: randomColor(),name:'market' });
		let draw_pile = this.draw_pile = gameItem('draw pile'); // mItem(name2id(''),null, { color: randomColor(),name:'draw pile' });
		let buy_cards = this.buy_cards = gameItem('buy cards'); // mItem('buy_cards',null,{ color: randomColor(),name:'buy cards' });
		let discard_pile = this.discard_pile = gameItem('discard pile'); // mItem('discard_pile',null,{ color: randomColor(),name:'discard pile' });
		let phase = this.phase = 'king';
		let turn = chooseRandom(allPlayers);

		aristoGame1(this); //, GC.evaluate.bind(GC));
	}

	cards_to_string(cards) { return cards.map(x => x.toString).join('_'); } //eg. 1_103_34
	deal_hand() { let h = this.deck.deal(this.HAND_SZ); this.draw_pile = this.deck.cards(); return h; }
	deal_glob() {
		this.phase = 'king'; //phase king
		this.deck = new Deck('52_double');
		this.cards = this.deck.cards().map(x => gameItem(x));
		this.market = this.deck.deal(this.MARKET_SZ);
		this.draw_pile = this.deck.cards(); //.join(' ');
		this.buy = [];
		this.discard_pile = [];
	}
	//opt: numplayers ranks suits jokers vp handsz marketsz buysz farmsz estatesz chateausz coins
	default_start_fen() {
		//opt: numplayers ranks suits jokers vp handsz marketsz buysz farmsz estatesz chateausz coins
		let fen = '5 13 8 0 6 7 3 4 4 5 6 3';
		return fen;
	}
	gamify() {

	}
	make_aristocracy_card(i) {
		if (i < this.DECK_SZ - this.JOKERS) {
			//das wird eine normale karte
			let rank = i % this.RANKS;
			let suit = Math.floor(i / this.RANKS) % 4;


			//wie mach ich so eine card? hier war ich!
		}
		// let rank = i %
	}
	parse_fen(fen) {
		//opt:glob:pl1:pl2:...
		let parts = fen.split(':');
		let opt = parts[0];
		let glob = parts.length > 1 ? parts[1] : null;
		let pls = [];
		for (let i = 2; i < parts.length; i++) {
			pls.push(parts[i]);
		}

		//parse each part!
		//opt: numplayers ranks suits jokers vp handsz marketsz buysz farmsz estatesz chateausz coins
		let opts = opt.split(' ');
		this.NUMPLAYERS = Number(opts[0]);
		this.RANKS = Number(opts[1]);
		this.SUITS = Number(opts[2]); // not including jokers!
		this.JOKERS = Number(opts[3]);
		this.VP = Number(opts[4]);
		this.HAND_SZ = Number(opts[5]);
		this.MARKET_SZ = Number(opts[6]);
		this.BUY_SZ = Number(opts[7]);
		this.FARM_SZ = Number(opts[8]);
		this.ESTATE_SZ = Number(opts[9]);
		this.CHATEAU_SZ = Number(opts[10]);
		this.COINS = Number(opts[11]);
		this.DECK_SZ = this.RANKS * this.SUITS + this.JOKERS;

		//make a deck and card objects first!
		let deck = this.deck = new Deck();
		deck.initNumber(this.DECK_SZ);
		this.cards = [];
		for (const x of deck.cards()) {
			let c = this.make_aristocracy_card(x);
		}
		//return mItem(name2id(name), null, { color: isdef(color) ? color : randomColor(), name: name },false); }


		//everything that has not been set will be set randomly according to basic variables
		//separator for list of cards is '_'
		//glob: herald phase turn draw market buy discard
		return; //********************************************************************************* */
		if (glob) {
			let globs = glob.split(' ');
			this.herald = globs[0]; //string eg. 'a'
			this.phase = globs[1]; // k | q | j
			this.turn = globs[2]; // letters a .. z (as many players)
			this.draw = parse_cards(globs[3]);
			this.market = parse_cards(globs[4]);
			this.buy = parse_cards(globs[5]);
			this.discard = parse_cards(globs[6]);
		} else {
			this.deal_glob();
		}

		let have_player_data = pls.length > 0;
		this.players = [];
		if (have_player_data) {
			for (let i = 0; i < pls.length; i++) {
				let pl = parse_player(pls[i]);
				this.players.push(pl);
			}
		} else {
			for (let i = 0; i < this.NUMPLAYERS; i++) {
				let pl = {
					coins: this.COINS,
					hand: this.deal_hand(),
				};
				this.players.push(pl);
			}
		}
		ensure_player_id_name_index_type_color(this.players);

	}
	parse_cards(s) { return s.split('_').map(x => Number(x)); }//=>list of numbers


}


function aristoGame1(g) {
	let phase = g.phase = 'king'; //phase king
	let players = g.allPlayers;

	let i = 0; players.map(x => x.index = i++);
	let indices = players.map(x => x.index);

	let me = g.me;
	let others = g.others;
	let market = g.market;
	let buy_cards = g.buy_cards;

	let draw_pile = g.draw_pile; draw_pile.type = 'deck';
	let deck = draw_pile.deck = new Deck();
	deck.init52_double(); //console.log('deck', deck);

	let discard_pile = g.discard_pile; discard_pile.type = 'deck';
	let discard = discard_pile.deck = new Deck();

	//each player gets 7 cards, 3 coin
	for (const pl of players) { pl.hand = deck.deal(7); pl.coins = 3; }

	market.cards = deck.deal(3); market.type = 'cards';	//market gets 3 cards
	buy_cards.cards = []; buy_cards.type = 'cards';	//market gets 3 cards

	let herald = g.herald = players[1];// chooseRandom(players);	//determine herald randomly
	//console.log('herald', herald.index);

	//calc player order for setup stalls (sitting order starting with herald)
	let heraldOrder = g.heraldOrder = arrCycle(indices, herald.index);
	//console.log('heraldOrder', heraldOrder);

	//ais before me setup stalls
	g.stallsHidden = true;
	for (const plIndex of heraldOrder) {
		if (plIndex == 0) break;
		let pl = players[plIndex];
		//console.log('build stall: pl', pl.name, me.name)

		aristoAIAction(pl, g, 'stall');
		//setup stall
	}

	//prompt: setup your stall
	aristoUi(dTable, g);
	dLineTopMiddle.innerHTML = 'choose your stall!';
	mButton('submit move', () => aristoUserAction(g, 'stall', aristoGame2), mBy('sidebar').firstChild, { w: 80, bg: g.color }, 'mybutton');

	//hand of player hasa to be activated!
	for (const card of g.me.handItems) {
		let d = iDiv(card);
		d.onclick = () => {
			if (card.isSelected) {
				card.isSelected = false;
				iDiv(card).style.transform = 'unset';
			} else {
				card.isSelected = true;
				iDiv(card).style.transform = 'translateY(-25px)';
			}
		}
	}
}

function aristoAIAction(pl, g, key) {
	if (key == 'stall') {
		let deck1 = new Deck(pl.hand);
		//console.log(deck1);
		pl.stall = deck1.deal(randomNumber(Math.min(2, deck1.count()), Math.min(5, deck1.count())));
		pl.hand = deck1.cards();
	}
}
function aristoUserAction(g, key, followFunc) {
	if (key == 'stall') {
		let me = g.me;
		let indices = arrIndices(me.handItems, x => x.isSelected);
		[me.stall, me.hand] = arrSplitByIndices(me.hand, indices);
		followFunc(g);
	}
}
function aristoAggregateVisible(g) {
	let result = [];
	let stalls = g.allPlayers.map(x => x.stall);
	result = arrFlatten(stalls).concat(g.market.cards);
	return result;

}
//onSubmit stall wird aristoGame2 aufgerufen!
function aristoGame2(g) {

	//ais after me setup stalls
	let heraldOrder = g.heraldOrder;
	let players = g.allPlayers;
	let me = g.me;

	let iNext = heraldOrder.indexOf(0) + 1;
	for (let i = iNext; i < heraldOrder.length; i++) {
		let plIndex = heraldOrder[i];
		let pl = players[plIndex];
		if (plIndex == 0) break;
		let deck1 = new Deck(pl.hand);
		pl.stall = deck1.deal(randomNumber(Math.min(2, deck1.count()), Math.min(5, deck1.count())));
		pl.hand = deck1.cards();
	}

	//turn around stalls
	g.stallsHidden = false;
	aristoUi(dTable, g);

	setTimeout(() => aristoGame3(g), 2000);
}
function aristoGame3(g) {

	let heraldOrder = g.heraldOrder;
	let players = g.allPlayers;
	let me = g.me;

	let stallOrder = g.stallOrder = calcStallOrder(players);
	players.map(x => x.nActions = x.stall.length);
	//console.log('stallOrder', stallOrder);

	//in stall order do your actions
	for (const plIndex of stallOrder) {
		let pl = players[1]; //plIndex]; //[0];
		console.log('player', pl.name, 'starts with', pl.nActions, 'actions, stall value is', pl.stallValue);
		//console.log('build stall: pl', pl.name, me.name)
		if (plIndex == 0) break;

		//continue;

		while (pl.nActions > 0) {
			//aiDoActions(pl,g);
			//simplest strategy: 
			// 1. correct schweinefarm
			// 2. build best building if can
			aristoBuild(pl, g);
			break;
		}
		console.log('player', pl.name, 'still has', pl.nActions, 'actions');
		//break;
	}


	aristoUi(dTable, g);
	return;

	//stalls are revealed and value calculated

	//determine player order: in order of stall value	
	//determine how many actions eahc player has

	//ais before me take actions
	//prompt: take actions
	//ais after me take actions

	//possible actions are:
	//1. build a farm or estate or chateau if King or king phase
	//2. upgrade building if King or king phase
	//3. buy if have jack or in jack phase
	//4. exchange card in one of own buildings
	//5. challenge a building if Queen or Queen phase
	//6. sell 2 cards for 1 coin
	//7.? anything else?

	//after all actions have been done: deal: 
	//1. market is discarded
	//2. each player gets 1 card

	//trasnfer phase:
	//King->Queen:
	// replenish 3
	// ball
	// finish game?
	//Queen->Jack
	// estate/chateau get coin
	// replenish to 4
	// auction
	//Jack->King
	// each farm 1 card
	// hand size to 7+ #chateaus
	// pass herald to next player
	console.log('Game', g);
}

//#region actions
function aristoBuild(pl, g) {
	let visToAll = aristoAggregateVisible(g);
	let visRanks = visToAll.map(x => x % 13);
	//console.log('visRanks', visRanks);
	let players = g.allPlayers;

	//1. build aggregate of all cards visible to this player
	let myVis = visToAll.concat(pl.hand);
	let myRanks = myVis.map(x => x % 13).sort();
	//console.log('player', pl, 'myRanks', myRanks);
	//myRanks.sort();
	//2. build buckets of same rank
	let rankCount = new Array(13).fill(0);
	for (let i = 0; i < myRanks.length; i++) { rankCount[myRanks[i]]++; }
	//console.log('rankCount',rankCount);

	let i = 0;
	let buckets = rankCount.map(x => ({ rank: i, count: rankCount[i++] }));

	//calc actionsNeeded to build a farm (or best possible group)
	//already have groups in my hand and market:
	//for(const )
	//myOnly = pl.hand.concat(pl.stall);
	myHandRanks = pl.hand.map(x => x % 13);
	myStallRanks = pl.stall.map(x => x % 13);

	nActions = pl.nActions = pl.stall.length; //number of actions available
	//console.log('I have', nActions, 'actions');

	//how many actions needed to build each bucket
	for (const b of buckets) {
		b.handCount = arrCount(myHandRanks, x => x == b.rank);
		b.stallCount = arrCount(myStallRanks, x => x == b.rank);
		b.actionsNeeded = b.count - b.handCount - b.stallCount + 1;
	}


	sortByDescending(buckets, 'count');

	//strategy boundary to build
	let boundaryToBuild = 3; //keine schweinefarmen! super ehrliche AI

	//moegliche farmen sind buckets die count=4 und actionsNeeded<=actions haben!
	let bucketsPossible = buckets.filter(x => x.count >= boundaryToBuild && x.actionsNeeded <= nActions);

	let canBuild = !isEmpty(bucketsPossible) && pl.coins > 0;


	//3. sort by group size
	//4. 
	//console.log('can build: ', bucketsPossible, canBuild);

	if (!canBuild) return false;

	//build erstbestes building
	let best = bucketsPossible[0];
	let rank = best.rank;

	//exchange a card from stall with one of another player or market
	while (best.actionsNeeded - 1 > 0) {
		let marketRanks = g.market.cards.map(x => x % 13);
		if (marketRanks.includes(rank)) {
			//console.log('found rank', rank, 'on market', marketRanks);
			let iSource = marketRanks.indexOf(rank);
			let elSource = g.market[iSource];
			let itemSource = g.marketItems[iSource];

			//pick some element from stall that has NOT rank rank
			let elTarget = firstCond(pl.stall, x => x % 13 != rank);
			let iTarget = pl.stall.indexOf(elTarget);
			// let itemTarget = pl.stallItems[iTarget];

			//exchange!!!!!
			g.market.cards[iSource] = pl.stall[iTarget];
			g.marketItems[iSource] = pl.stallItems[iTarget];

			pl.stall[iTarget] = elSource;
			pl.stallItems[iTarget] = itemSource;
			//console.log('exchanged with market!', g.market.cards.map(x => x % 13));

		} else {
			for (const other of players) {
				if (other == pl) continue;
				let stallRanks = other.stall.map(x => x % 13);
				//console.log('stallRanks',stallRanks);
				if (stallRanks.includes(rank)) {


					//console.log('found rank', rank, 'on player stall', other.name, '\nother', stallRanks, '\nme', jsCopy(pl.stall).map(x => x % 13));
					//console.log('')
					let iSource = stallRanks.indexOf(rank);
					let elSource = other.stall[iSource];
					let itemSource = other.stallItems[iSource];

					//pick some element from stall that has NOT rank rank
					let elTarget = firstCond(pl.stall, x => (x % 13) != rank);
					//console.log('I am giving him a', elTarget % 13);
					let iTarget = pl.stall.indexOf(elTarget);
					// let itemTarget = pl.stallItems[iTarget];

					//exchange!!!!!
					other.stall[iSource] = pl.stall[iTarget];
					other.stallItems[iSource] = pl.stallItems[iTarget];

					pl.stall[iTarget] = elSource;
					pl.stallItems[iTarget] = itemSource;

					//console.log('exchanged with!', other.name, other.stall.map(x => x % 13));
					break;

				}
			}
			best.actionsNeeded--;

		}
	}
	//build farm!
	console.log('building a farm of', rank);
	console.log('bucket', best);

	//identify the cards to be used for building!

	//from hand take all cards that are rank
	let handCards = pl.hand.filter(x => x % 13 == rank);
	console.log('handCards for this farm:', handCards);

	pl.hand = arrMinus(pl.hand, handCards);
	console.log('hand will be:', pl.hand);

	let stallCards = pl.stall.filter(x => x % 13 == rank);
	console.log('handCards for this farm:', stallCards);

	pl.stall = arrMinus(pl.stall, stallCards);
	console.log('stall will be:', pl.stall);

	let building = handCards.concat(stallCards);
	console.log('building:', building);
	lookupAddToList(pl, ['buildings'], building);

	pl.nActions -= best.actionsNeeded;
	//need to remove all 'rank' cards form hand and enough to complete from stall
	//if it is schweinefarm, need to add n more cards from hand!
	//let farm = [];
	//moveCardsFromTo(rank,pl.hand,farm);
	//moveCardsFromTo(rank,pl.stall,farm);
	//lookupAddToList(pl,['buildings','farms'],)

}

function moveCardsFromTo(cards, from, to) {
	//need to move the cards, need to move the items!
}

function identifyCardByRank(key, rank) {
	if (key == 'market') {

	}
}

function getItemOfSameIndexAsIn(val, arr, items) {
	let i = arr.indexOf(val);
	return items[i];
}

function aristoExchangeCard() { }
//#endregion actions
//#region helpers
function calcAristoHandValue(cards) {
	let ranks = cards.map(x => x % 13);
	let total = 0;
	for (const rank of ranks) { total += Math.min(10, rank + 1); }
	//console.log(cards,'ranks',ranks,total);
	return total;
}
function calcStallOrder(players) {
	for (const pl of players) {
		pl.stallValue = calcAristoHandValue(pl.stall);
		//console.log('pl',pl.name,'has',pl.stallValue);
	}

	//sort players by rankValue
	let stallOrder = players.map(x => ({ stallValue: x.stallValue, index: x.index }));
	let plSorted = sortBy(stallOrder, 'stallValue').map(x => x.index);
	//console.log(stallOrder,'plSorted',plSorted);

	return plSorted;
}
function ensure_player_id_name_index_type_color(pls) {
	let i = 0;
	pls.map(x => {
		x.id = getUID();
		x.name = (i == 0 ? Username : randomBotName()).toLowerCase();
		x.index = i;
		x.type = (i == 0 ? 'human' : 'ai');
		x.colorName = (i == 0 ? U.settings.userColor : Object.values(PlayerColors)[i]);
		x.color = (i == 0 ? U.settings.userColor : Object.keys(PlayerColors)[i]);
		i++;
	});
}
//#endregion helpers
//#endregion aristo


class GProg0 extends Game {
	constructor(name, o) { super(name, o); }
	startGame(fen) {

	}
	prompt() {
		//design a card and attribute a meaning=behavior to it
		//show a blank card
		let c = this.card0 = cLandscape(dTable);
		this.card1 = iDiv(c).style;
		this.card2 = iDiv(c);
		this.card3 = iDiv(c);

		show_instruction('write code what rank and suit this card should have', dTitle);

		mLinebreak(dTable, 25);

		let dCode = mDiv(dTable, {});
		let ta = this.ta = mCreate('textarea');
		mAppend(dCode, ta);
		ta.setAttribute('rows', 10);
		ta.setAttribute('cols', 60);
		mStyle(ta, { family: 'courier', padding: 10 });

		ta.value = `mStyle(iDiv(G.card0),{bg:'pink'})`; //0
		ta.value = `this.card1.background = 'yellow'`; //1
		ta.value = `this.card2.style.background = 'yellow'`; //2
		ta.value = `this.set('background','red');`; //3
		ta.value = `this.set(this.card1,'background','red');`; //4
		ta.value = `set(card1,'background','red');`; //5
		ta.value = `card.background = 'red';`; //6
		ta.value = `card.color = 'red';`; //7 NO
		ta.value = `card.color = 'red';`; //7 NO

		mLinebreak(dTable, 25);

		mButton('run', this.runCode.bind(this), dTable, { bg: 'skyblue', fg: 'black', fz: 32 }, 'mybutton');

		console.log('type of style', typeof this.card1);


	}
	set(o, prop, val) {
		o[prop] = val;
		//this.card1[prop]=val;
	}
	runCode() {
		let code = this.ta.value;
		//code =replaceAllX(code,'set(','this.set(');	code =replaceAllX(code,'card','this.card'); //5

		let prelim = ''; //prefix a context
		//6
		prelim = 'let card = this.card1; '; //add context: 6
		//7
		prelim = `
		var card = new ProgObject(this.card0);
		console.log('card',card);
		`;

		prelim = `
		var obj = {};

		Object.defineProperty(obj, prop, {
				get: function() {return this.card1; },
				set: function(val) { this.card1.val = val; }
		});
		`

		code = prelim + code;
		console.log('code', code);

		eval(code);
	}
}
class GProg1 extends Game {
	constructor(name, o) { super(name, o); }

	prompt() {
		let c = this.card = cLandscape(dTable);
		let d = this.visual = iDiv(c);
		this.style = d.style;

		let propertyGiver1 = (o, prop, setter) => {
			Object.defineProperty(o, prop, {
				get: function () { return this.val; },
				set: function (val) { this.val = val; setter(val); }
			});
		};
		// propertyGiverW0(c, 'color', x=>G.style.background = x); //YES!

		let visualPropertySetter1 = (o) => {
			// let props = 'bg fg h w background color height width rounding padding fz font';
			// let parts = props.split(' ');
			// for (const k of parts) {
			// 	let styles = {}; styles[k] =
			// 		propertyGiver1(c, k, o,x => { let styles = []; styles[k] = x; mStyle(o, styles); });
			// }
			propertyGiver1(o, 'bg', x => { mStyle(G.visual, { 'bg': x }); }); //YES!!
		}
		visualPropertySetter1(this.card);

		d.innerHTML = 'HALLO';
		mStyle(d, { fg: 'blue' });

		//show_instruction('write code what rank and suit this card should have', dTitle);

		mLinebreak(dTable, 25);

		let dCode = mDiv(dTable, {});
		let ta = this.ta = mCreate('textarea');
		mAppend(dCode, ta);
		ta.setAttribute('rows', 10);
		ta.setAttribute('cols', 60);
		mStyle(ta, { family: 'courier', padding: 10 });

		ta.value = `card.bg = 'red'; console.log(card.bg);`; //7 NO

		mLinebreak(dTable, 25);

		mButton('run', this.runCode.bind(this), dTable, { bg: 'skyblue', fg: 'black', fz: 32 }, 'mybutton');

		console.log('type of style', typeof this.card1);


	}
	runCode() {
		let code = this.ta.value;

		let prelim = ''; //prefix a context
		//10
		prelim = 'let [card,visual,style] = [this.card,this.visual,this.style]; '; //add context: 6

		code = prelim + code;
		console.log('code', code);

		eval(code);
	}
}







