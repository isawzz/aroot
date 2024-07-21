//#region spotit: uses global Session.items
function spotit_populate_settings(dParent) {
	//console.log('HALLO!!!!!!!!!!!!!');
	Session.game_options.game = {};

	//wo find ich possible settings?
	let poss = DB.games[Session.cur_game].options;
	if (nundef(poss)) return;

	for (const p in poss) {
		//p is the name of the variable
		//poss[p] are possible values
		//can be string of strings or numbers =>convert to string list or number list and make it a radio
		//can be true or false => make it a checkbox
		//=>todo: could be a range as well
		let key = p;
		let val = poss[p];
		if (isString(val)) {
			// make a list 
			let list = val.split(','); //besser!!!
			let fs = mRadioGroup(dParent, {}, `d_${key}`, key);
			let checkfirst = true;
			for (const v of list) {
				let d = mRadio(v, isNumber(v) ? Number(v) : v, fs, { cursor: 'pointer' }, null, key);
				if (checkfirst) {
					//let el = mBy(`i_mode_${mode}`).checked = true;
					let inp = d.firstChild;//.firstchild.checked=true;checkfirst = false;
					inp.setAttribute('checked', true); // = true;
					//console.log('should be input',inp);
					checkfirst = false;
				}
			}

			measure_fieldset(fs);

		} else if (val === true || val === false) {
			//wie mach ich eine checkbox?
			// NOT IMPLEMENTED!!!
			console.log('should make a checkbox for', key);
		}
	}

}
function spotit_card(info, dParent, cardStyles, onClickSym) {
	copyKeys({ w: CSZ, h: CSZ }, cardStyles);

	// //let card_container = mDiv(dParent,{padding:20});
	// mStyle(dParent,{bg:'red',hmin:CSZ+50});
	// let x = mDiv(dParent,{margin:20, w:200,h:200, bg:'white',fg:'black'},getUID(),'hallo','card',false);
	// return x;	

	let card = cRound(dParent, cardStyles, info.id);
	// return card;

	addKeys(info, card);

	let d = iDiv(card);
	card.pattern = fillColarr(card.colarr, card.keys);

	//could make each pattern be object {key:card.key,scale:card.scale}
	//instead of line above do this to include scale in pattern!
	let zipped = [];
	//console.log(card.scales);
	for (let i = 0; i < card.keys.length; i++) {
		zipped.push({ key: card.keys[i], scale: card.scales[i] });
	}
	card.pattern = fillColarr(card.colarr, zipped);

	// symSize: abhaengig von rows
	let symStyles = { sz: CSZ / (card.rows + 1), fg: 'random', hmargin: 8, vmargin: 4, cursor: 'pointer' };
	//console.log('sz',symStyles.sz,info.rows,info.cols);

	let syms = [];
	mRowsX(iDiv(card), card.pattern, symStyles, { 'justify-content': 'center' }, { 'justify-content': 'center' }, syms);
	for (let i = 0; i < info.keys.length; i++) {
		let key = card.keys[i];
		let sym = syms[i];
		card.live[key] = sym;
		sym.setAttribute('key', key);
		sym.onclick = onClickSym;
	}

	return card;
}
function spotit_deal(numCards, rows, cols, vocab, lang, min_scale, max_scale, fen) {
	lang = valf(lang, 'E');
	let colarr = _calc_hex_col_array(rows, cols);

	//correction for certain perCard outcomes:
	if (rows == 3 && cols == 1) { colarr = [1, 3, 1]; }
	else if (rows == 2 && cols == 1) { colarr = [1, 2]; }
	else if (rows == 4 && cols == 1) { rows = 3; colarr = [2, 3, 1]; }
	else if (rows == 5 && cols == 1) { rows = 4; cols = 1; colarr = [1, 3, 3, 1]; }
	else if (rows == 5 && cols == 3) { rows = 5; cols = 1; colarr = [1, 3, 4, 3, 1]; }
	else if (rows == 6 && cols == 2) { rows = 5.5; colarr = [2, 4, 5, 4, 2]; }

	//from here on, rows ONLY determines symbol size! colarr is used for placing elements

	let perCard = arrSum(colarr);
	let nShared = (numCards * (numCards - 1)) / 2;
	let nUnique = perCard - numCards + 1;
	let numKeysNeeded = nShared + numCards * nUnique;
	let nMin = numKeysNeeded + 3;
	let keypool = setKeys({ nMin: nMin, lang: valf(lang, 'E'), key: valf(vocab, 'animals'), keySets: KeySets, filterFunc: (_, x) => !x.includes(' ') });
	//console.log('keys', keypool);

	let keys = choose(keypool, numKeysNeeded);
	let dupls = keys.slice(0, nShared); //these keys are shared: cards 1 and 2 share the first one, 1 and 3 the second one,...
	let uniqs = keys.slice(nShared);
	//console.log('numCards', numCards, '\nperCard', perCard, '\ntotal', keys.length, '\ndupls', dupls, '\nuniqs', uniqs);

	let infos = [];
	for (let i = 0; i < numCards; i++) {
		let keylist = uniqs.slice(i * nUnique, (i + 1) * nUnique);
		//console.log('card unique keys:',card.keys);
		let info = { id: getUID(), shares: {}, keys: keylist, rows: rows, cols: cols, colarr: colarr, num_syms: perCard };
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

	//for each key make a scale factor
	//console.log('min_scale',min_scale,'max_scale',max_scale);
	for (const info of infos) {
		info.scales = info.keys.map(x => randomNumber(min_scale * 100, max_scale * 100) / 100);
		//info.scales = info.scales.map(x=>coin()?x:-x);
	}

	if (isdef(fen)) {
		let ks_for_cards = fen.split(',');
		for (let i = 0; i < infos.length; i++) {
			let info = infos[i];
			//console.log('vorher', jsCopy(info.keys), jsCopy(info.scales));
			let ks_list = ks_for_cards[i].split(' ');
			info.keys = ks_list.map(x => stringBefore(x, ':'));
			info.scales = ks_list.map(x => stringAfter(x, ':')).map(x => Number(x));
			//console.log('nachher', info.keys, info.scales);
		}
	}


	let items = [];
	for (const info of infos) {
		let item = spotit_card(info, dTable, { margin: 20 }, spotit_interact);
		//mStyle(iDiv(item), { animation: 'appear 1s ease' });
		items.push(item);
	}

	return items;

}
function spotit_evaluate() {
	//console.log('evaluating move: was soll geschehen?')
	if (!canAct()) return;
	uiActivated = false; clear_timeouts();
	IsAnswerCorrect = Selected.isCorrect;

	update_my_score(IsAnswerCorrect ? 1 : 0);
	let me = Session.cur_me;
	if (me.score >= Session.winning_score) me.player_status = 'done'; //*** player winning ****/

	//console.log('move ist correct?', IsAnswerCorrect ? 'JA!' : 'nope');
	let delay = show_feedback(IsAnswerCorrect);

	setTimeout(() => {
		in_game_open_prompt_off();
		clear_table_events();
		send_move();
	}, delay);

}
function spotit_check_endcondition() {
	let players = get_values(Session.cur_players);
	//console.log(players.map(x=>'score:'+x.score));
	//console.log('')
	let winners = players.filter(x => x.score >= 2).map(x => x.name); //allCondDict(players, x => x.score >= Session.winning_score);
	return winners;

}
function spotit_interact(ev) {
	ev.cancelBubble = true;
	if (!canAct()) { console.log('no act'); return; }

	let keyClicked = evToProp(ev, 'key');
	let id = evToId(ev);

	if (isdef(keyClicked) && isdef(Items[id])) {
		let item = Items[id];
		//console.log('clicked key', keyClicked, 'of card', id, item);
		if (Object.values(item.shares).includes(keyClicked)) {
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
			Selected = { isCorrect: false, feedbackUI: [cardSymbol], correctUis: spotit_get_shared_symbols(), correctionDelay: Session.items.length * 1500 };

		}
		spotit_evaluate();
	}
}
function spotit_get_shared_symbols() {
	let result = [];
	for (const item of Session.items) {
		for (const id in item.shares) {
			let k = item.shares[id];
			let ui = iGetl(item, k);
			result.push(ui);
		}
	}
	return result;
}
function spotit_fen() {
	let me = Session.cur_players[Session.cur_user];
	let items = Session.items;

	//state in spotit game is just 'key key..., key key...'
	let fen = items.map(x => x.keys.join(' ')).join(',');

	//neu: 'k:s k:s...,k:s k:s...
	let item_fens = [];
	for (const item of items) {
		let arr = arrFlatten(item.pattern);
		let ifen = arr.map(x => `${x.key}:${x.scale}`).join(' ');
		item_fens.push(ifen);
	}

	fen = item_fens.join(',');
	//console.log('fen',fen);
	me.state = fen;
}

//#endregion
