function aristo() {
	function aristo_activate(g, uname) {
		//hier start ich mit all dem stages zeug!
		//onclick_stoppolling();

		ari_globalize(g, uname);
		ari_pre_action();
	}
	function aristo_check_gameover(g) {
		return isdef(g.fen.winner) ? g.fen.winner : false;
		//let players_in_game = get_keys(g.fen.players);
		//return players_in_game.length < 2 ? players_in_game[0] : false;
	}
	function aristo_setup(players, options) {
		let fen = { players: {}, plorder: jsCopy(players), history: [] };
		let deck = fen.deck = get_keys(Aristocards).filter(x => 'br'.includes(x[2]));
		shuffle(deck);
		let deck_commission = fen.deck_commission = get_keys(Aristocards).filter(x => 'g'.includes(x[2]));
		shuffle(deck_commission);
		let deck_luxury = fen.deck_luxury = get_keys(Aristocards).filter(x => 'y'.includes(x[2]));
		shuffle(deck_luxury);
		shuffle(fen.plorder);
		fen.market = [];
		fen.deck_discard = [];
		fen.open_discard = [];
		fen.commissioned = []; //eg., [Q,A,5,...]
		fen.open_commissions = exp_commissions(options) ? deck_deal(deck_commission, 3) : [];
		fen.church = deck_deal(deck, players.length);
		for (const plname of players) {
			let pl = fen.players[plname] = {
				hand: deck_deal(deck, 7),
				commissions: exp_commissions(options) ? deck_deal(deck_commission, 4) : [],
				journeys: [], //options.journey == 'no' ? [] : coin() ? [['QSr', 'KSr']] : [['3Cr', '4Cr']],
				buildings: { farm: [], estate: [], chateau: [] },
				stall: [],
				stall_value: 0,
				coins: 3,
				vps: 0,
				score: 0,
				color: get_user_color(plname),
			};
		}
		fen.phase = 'king'; //TODO: king !!!!!!!
		fen.num_actions = 0;
		fen.herald = fen.plorder[0];

		z={};
		set_journey_or_stall_stage(fen, options, fen.phase);
		//fen.stage = 3;

		if (options.mode == 'solo') {
			let me = isdef(U) && isdef(fen.players[U.name]) ? U.name : rChoose(players);
			for (const plname of players) {
				if (plname == me) continue;
				fen.players[plname].playmode = 'bot';
			}
			options.mode = 'hotseat';

		}

		return fen;
	}
	function aristo_present(g, dParent, uname) {
		//console.log('fen', g.fen, '\nexpected', g.expected, 'presenting for', uname)
		let fen = g.fen;
		let ui = UI; ui.players = {};
		//onclick_stoppolling();//danit ruhe ist

		clearElement(dParent);
		let bg=colorTrans(YELLOW,.7);
		let [dMiddle, dRechts] = [ui.dMiddle, ui.dRechts] = mColFlex(dParent, [5, 1], [bg, bg]);
		//console.log('dMiddle', dMiddle);
		mCenterFlex(dMiddle, false); //no horizontal centering!
		let dTop = ui.dTop = mDiv(dMiddle, { bg: '#00000040', fg: 'white', w: '100%' }, 'dTop');
		// let dOben = ui.dOben = mDiv(dMiddle, { bg: '#ffffff40', w: '100%' }, 'dOben');
		let dOben = ui.dOben = mDiv(dMiddle, { w: '100%' }, 'dOben');
		let dSelections = ui.dSelections = mDiv(dOben, { w: '100%' });
		for (let i = 0; i <= 5; i++) { ui[`dSelections${i}`] = mDiv(dSelections, { w: '100%' }, `dSelections${i}`); }
		let dActions = ui.dActions = mDiv(dOben, { w: '100%' });
		for (let i = 0; i <= 5; i++) { ui[`dActions${i}`] = mDiv(dActions, { w: '100%' }, `dActions${i}`); }
		ui.dError = mDiv(dOben, { w: '100%', bg: 'red', fg: 'yellow' }, 'dError');
		let dSubmitOrRestart = ui.dSubmitOrRestart = mDiv(dOben, { w: '100%' });

		ari_player_stats(g, dRechts);

		if (!isEmpty(fen.history)) {
			let html = '';
			for (const arr of jsCopy(fen.history).reverse()) {
				//html+=`<h1>${k}</h1>`;
				for (const line of arr) {
					html += `<p>${line}</p>`;
				}
			}
			let dHistory = mDiv(dRechts, { padding: 6, margin: 4, bg: '#00000060', fg: 'white', hmax: 400, 'overflow-y': 'auto', w: 240, rounding: 12 }, null, html); //JSON.stringify(fen.history));
			//mNode(fen.history, dHistory, 'history');
		}

		let dOpenTable = ui.dOpenTable = mDiv(dMiddle, { w: '100%', padding: 10 }); mFlexWrap(dOpenTable);// mLinebreak(d_table);
		let deck = ui.deck = ui_type_deck(fen.deck, dOpenTable, 'deck', 'deck');
		let market = ui.market = ui_type_market(fen.market, dOpenTable, 'market', 'market');
		let deck_discard = ui.deck_discard = ui_type_deck(fen.deck_discard, dOpenTable, 'deck_discard', 'discard');
		let open_discard = ui.open_discard = ui_type_market(fen.open_discard, dOpenTable, 'open_discard', 'open discard');

		if (exp_commissions(g.options)) {
			let open_commissions = ui.open_commissions = ui_type_market(fen.open_commissions, dOpenTable, 'open_commissions', 'commissions');
			let deck_commission = ui.deck_commission = ui_type_deck(fen.deck_commission, dOpenTable, 'deck_commission', '');
			// let commissioned = ui.commissioned = ui_type_list(fen.commissioned, ['rank','count'], dOpenTable, {h:130}, 'commissioned', 'commissioned');
			let commissioned = ui.commissioned = ui_type_rank_count(fen.commissioned, dOpenTable, 'commissioned', 'commissioned');
		}

		let order = [uname].concat(fen.plorder.filter(x => x != uname));
		for (const plname of order) {
			let pl = fen.players[plname];
			let d = mDiv(dMiddle, { w: '100%', bg: pl.color, fg: colorIdealText(pl.color), padding: 10 }, null, plname);
			mFlexWrap(d);
			mLinebreak(d);
			//R.add_ui_node(d, getUID('u'), uname);
			ari_present_player(g, plname, d, plname != uname);
		}


		if (isdef(fen.winner)) ari_reveal_all_buildings(fen);

	}
	function ari_present_player(g, uname, d, ishidden = false) {
		let fen = g.fen;
		let pl = fen.players[uname];
		let ui = UI.players[uname] = {};

		pl.hand=fen.stage == '1'? sort_cards(pl.hand):sort_cards(pl.hand,false); 
		let hand = ui.hand = ui_type_hand(pl.hand, d, `players.${uname}.hand`, 'hand');
		if (ishidden) { hand.items.map(x => face_down(x)); }

		let stall = ui.stall = ui_type_market(pl.stall, d, `players.${uname}.stall`, 'stall');
		if (fen.stage < 5 && ishidden) { stall.items.map(x => face_down(x)); }

		ui.buildings = [];
		for (const k in pl.buildings) {
			let i = 0;
			for (const b of pl.buildings[k]) {
				let type = k;
				//let name = type + ' ' + (b.list[0][0] == 'T' ? '10' : b.list[0][0]);
				let b_ui = ui_type_building(b, d, `players.${uname}.buildings.${k}.${i}`, type);
				//b_ui.path = `players.${uname}.buildings.${k}.${i}`;
				b_ui.type = k;
				i += 1;
				ui.buildings.push(b_ui);
			}
		}

		//present commissions
		if (exp_commissions(g.options) && !ishidden) {
			pl.commissions.sort(); let commissions = ui.commissions = ui_type_hand(pl.commissions, d, `players.${uname}.commissions`, 'commissions');
			//if (ishidden) { commissions.items.map(x => face_down(x)); }
		}


		ui.journeys = [];
		let i = 0;
		for (const j of pl.journeys) {
			let jui = ui_type_hand(j, d, `players.${uname}.journeys.${i}`);
			//jui.path = `players.${uname}.journeys.${i}`;
			i += 1;
			ui.journeys.push(jui);
		}

	}
	function ari_player_stats(g, dParent) {

		let player_stat_items = UI.player_stat_items = ui_player_info(g, dParent); //fen.plorder.map(x => fen.players[x]));
		//console.log('player_stat_items', player_stat_items);
		let fen = g.fen;
		let herald = fen.plorder[0];
		for (const uname of fen.plorder) {
			let pl = fen.players[uname];
			let item = player_stat_items[uname];
			let d = iDiv(item); mCenterFlex(d); mLinebreak(d);
			if (uname == herald) {
				//console.log('d', d, d.children[0]); let img = d.children[0];
				mSym('tied-scroll', d, { fg: 'gold', fz: 24 }, 'TL');
			}
			if (pl.playmode == 'bot') {
				//console.log('d', d, d.children[0]); let img = d.children[0];
				let d1=mText('bot', d, { bg:pl.color, fg: 'contrast', fz: 16 });
				mPlace(d1,'TR')
			}
			player_stat_count('coin', pl.coins, d);
			if (!isEmpty(fen.players[uname].stall) && fen.stage >= 5 && fen.stage <= 6) {
				player_stat_count('shinto shrine', !fen.actionsCompleted.includes(uname) || fen.stage < 6 ? calc_stall_value(fen, uname) : '_', d);
			}
			player_stat_count('star', uname == U.name||isdef(fen.winner)?ari_get_real_vps(fen,uname):ari_get_fictive_vps(fen, uname), d);
		}
	}

	// all helpers see arihelpers.js

	return { setup: aristo_setup, present: aristo_present, present_player: ari_present_player, check_gameover: aristo_check_gameover, stats: ari_player_stats, activate_ui: aristo_activate };

}

function bluff() {
	function bluff_activate() { }
	function bluff_check_gameover(g) {
		let players_in_game = get_keys(g.fen.players);
		return players_in_game.length < 2 ? players_in_game[0] : false;
	}
	function bluff_present(g, dParent, uname) {
		clearElement(dParent); mCenterCenterFlex(dParent); mStyle(dParent, { fg: 'white', bg: GREEN }); clearElement('dHistory');
		//console.log('fen', g.fen, '\nexpected', g.expected,'presenting for', uname)

		dParent.innerHTML = `<h1>Round ${g.round}</h1>`;
		mLinebreak(dParent, 10);
		bluff_stats(g, dParent, g.fen.players);
		mLinebreak(dParent, 10);

		let fen = g.fen;

		UI.players = {};
		let pl = g.fen.players[uname], upl = UI.players[uname] = {};
		pl.hand.sort(); let hand = upl.hand = ui_type_hand(pl.hand, dParent);
		mLinebreak(dParent, 12);

		bluff_history(fen);

		if (nundef(g.expected[uname])) return;

		let havebid = isdef(g.fen.bid) && g.fen.bid;
		let msg = havebid ? `${fen.bidder}'s bid: ${format_bid(g.fen.bid)}` : `${uname}, you are the first bidder!`;
		mText(msg, dParent);
		mLinebreak(dParent, 12);
		if (havebid) mButton('geht hoch!', () => onclick_gehthoch(g, uname), dParent, {}, 'button');

		mLinebreak(dParent, 12);
		bluff_prompt(g, `${uname}, enter your bid: <br>(format: number rank number rank, eg: 2 10, 1 Q)<br>use spaces in-between!`, dParent);
		//mButton('random', () => onclick_random(g, uname), dParent, { maleft: 4 }, 'button');
		mLinebreak(dParent, 10);

	}
	function bluff_setup(players, options) {
		let fen = { players: {}, plorder: jsCopy(players), history: {}, stage: 'move', phase: '' };

		//how many decks? 
		//for each player there must be enough cards for maxsize: 
		let num_cards_needed = players.length * options.max_handsize;
		let num_decks_needed = Math.ceil(num_cards_needed / 52);
		console.log('need', num_decks_needed, 'decks for', players.length, 'players with max_handsize', options.max_handsize);
		let deckletters = 'brgopy'.substring(0, num_decks_needed);

		let deck = fen.deck = get_keys(Aristocards).filter(x => deckletters.includes(x[2]));
		shuffle(deck);
		shuffle(fen.plorder);
		fen.turn = [fen.plorder[0]];
		for (const uname of fen.plorder) {
			let handsize = options.min_handsize;
			fen.players[uname] = { hand: deck_deal(deck, handsize), handsize: handsize };
		}

		//console.log('fen', fen)
		return fen;
	}
	function bluff_stats(g, d) {
		let players = g.fen.players;
		//console.log('________players', players);
		let d1 = mDiv(d, { display: 'flex', 'justify-content': 'center', 'align-items': 'space-evenly' });
		for (const plname of g.fen.plorder) {
			let pl = players[plname];
			let onturn = g.turn.includes(plname);
			let sz = 50; //onturn?100:50;
			let border = onturn ? plname == U.name ? 'solid 5px lime' : 'solid 5px red' : 'solid medium white';
			let d2 = mDiv(d1, { margin: 4, align: 'center' }, null,
				`<img src='../base/assets/images/${plname}.jpg' style="display:block;border:${border};" class='img_person' width=${sz} height=${sz}>${pl.handsize}`);
		}
	}

	//#region helpers
	function aggregate_all_player_hands(fen) {
		let agg = [];
		for (const pl in fen.players) agg = agg.concat(fen.players[pl].hand);
		//console.log('agg should return', agg)
		return agg;
	}
	function aggregate_player_hands_by_rank(fen) {
		let di_ranks = {};
		for (const uname in fen.players) {
			let pl = fen.players[uname];
			let hand = pl.hand;
			for (const c of hand) {
				let r = c[0];
				if (isdef(di_ranks[r])) di_ranks[r] += 1; else di_ranks[r] = 1;
			}
		}
		//console.log('di_ranks', di_ranks);
		return di_ranks;
	}
	function bluff_history(fen) {
		if (isdef(fen.history) && isdef(fen.history.bid)) {
			let bid = fen.history.bid;
			let cards = fen.history.cards;
			let d = mBy('dHistory');
			//clearElement(d);
			d.innerHTML = `<h1>history round ${fen.history.round}</h1>`;
			mStyle(d, { bg: GREEN, alpha: .5 });
			mText(`${fen.history.bidder}'s bid was: ` + format_bid(bid), d);
			mText(`${fen.history.aufheber} was skeptical`, d);
			//d.innerHTML = `${fen.bidder}'s bid was: ` + format_bid(bid);

			mLinebreak(d, 25);
			let ranks = toLetters('23456789TJQKA');
			cards.sort((a, b) => ranks.indexOf(a[0]) - ranks.indexOf(b[0]));
			//console.log('---cards', cards)

			ui_type_hand(cards, d);
			mLinebreak(d, 12);
			mText(fen.history.war_drin ? `=> WAR DRIN: ${fen.history.aufheber} loses!` : `=> WAR NICHT DRIN: ${fen.history.bidder} loses!`, d);
			mLinebreak(d, 12);

		} else {
			clearElement('dHistory');
		}
	}
	function bluff_prompt(g, s, dParent) {
		let label = mText(s, dParent, { align: 'center' });
		mLinebreak(dParent, 2);
		let f = mForm(dParent);
		let id = 'inBid';
		let inp = mInput(f, id);
		inp.focus();
		//let testval = '2 T, 3 Q'; inp.value = testval; let bid = evalbid(g, '2 T, 3 Q'); console.log('newbid is', bid);

		f.setAttribute('action', "javascript:void(0);");
		f.onsubmit = () => onsubmit_bid(g, id);
	}
	function calc_bid_minus_cards(fen, bid) {

		let di_ranks = aggregate_player_hands_by_rank(fen);

		let [brauch1, r1, brauch2, r2] = bid;
		let hab1 = valf(di_ranks[r1], 0);
		let hab2 = valf(di_ranks[r2], 0);
		let wildcards = valf(di_ranks['2'], 0);

		//console.log('cards contain:', c1, 'of', r1, ',', c2, 'of', r2, 'and', wildcards, '2er');
		//console.log('bid', bid);

		// if (hab1 < brauch1) { let diff1 = brauch1 - hab1; if (wildcards < diff1) return false; wildcards -= diff1; }
		// if (hab2 < brauch2) { let diff2 = brauch2 - hab2; if (wildcards < diff2) return false; wildcards -= diff2; }

		let diff1 = Math.max(0, brauch1 - hab1);
		let diff2 = Math.max(0, brauch2 - hab2);
		return diff1 + diff2 - wildcards;
	}
	function evalbid(g, s) {
		let newbid = text2bid(s);
		let ranks = '23456789TJQKA';
		newbid = normalize_bid(newbid, ranks);
		//normalize_bid([1, '2'], ranks); normalize_bid([1, '2', 2, '3'], ranks); normalize_bid([2, '2', 2, 'A'], ranks); //test

		//console.log('new bid', newbid);
		let lastbid = g.fen.bid;
		if (isdef(lastbid)) {
			//compare lastbid to newbid and return newbid if valid else false;
			//newbid is higher if number is higher
			if (newbid[1] == newbid[3]) return false;
			else if (newbid[0] > lastbid[0]) return newbid;
			else if (newbid[2] > lastbid[2]) return newbid;
			else if (newbid[0] < lastbid[0]) return false;
			else if (ranks.indexOf(newbid[1]) < ranks.indexOf(lastbid[1])) return false;
			else if (newbid[2] < lastbid[2]) return false;
			else if (ranks.indexOf(newbid[1]) > ranks.indexOf(lastbid[1])) return newbid;
			else if (ranks.indexOf(newbid[3]) <= ranks.indexOf(lastbid[3])) return false;
			else return newbid;
		} else return newbid;

	}
	function format_bid(bid) {
		let di = {
			Q: 'Queen',
			K: 'King',
			J: 'Jack',
			T: '10',
			A: 'Ace'
		};
		return `${bid[0]} ${isdef(di[bid[1]]) ? di[bid[1]] : bid[1]}, ${bid[2]} ${isdef(di[bid[3]]) ? di[bid[3]] : bid[3]}`;
	}
	function get_move_action(g) { return { step: g.step, stage: 'move' }; }
	function generate_random_bid(g) {
		let b = g.fen.bid;
		if (isdef(b)) {
			console.log('existing bid is', b);
			let [n1, r1, n2, r2] = b;
			if (n1 > n2) return [n1, r1, n2 + 1, r2]; else return [n1 + 1, r1, n2, r2];
		} else {
			return [2, rChoose(toLetters('9TJQKA')), 1, rChoose(toLetters('345678'))];
		}
	}
	function inc_handsize(fen, uname) {
		let sz = fen.players[uname].handsize;
		//console.log('playersize', playersize);
		fen.players[uname].handsize = sz + 1;
		return sz + 1;
	}
	function new_deal(fen) {
		//new deal
		let deck = fen.deck = get_keys(Aristocards).filter(x => 'b'.includes(x[2]));
		shuffle(deck);
		for (const name in fen.players) {
			let handsize = fen.players[name].handsize;
			//console.log('player', name, 'has handsize', handsize)
			fen.players[name] = { hand: deck_deal(deck, handsize), handsize: handsize };
		}
	}
	function normalize_bid(bid, ranks) {
		//console.log('_______bid at start of normalize:', jsCopy(bid));
		let n1, r1, i1, n2, r2, i2;

		if (bid.length == 2) {
			[n1, r1] = bid;
			//look for the lowest rank that is not = r1
			n2 = 1;
			for (let i = 1; i < ranks.length; i++) {
				if (ranks[i] != r1) { r2 = ranks[i]; break; }
			}
			bid = [n1, r1, n2, r2];
		} else if (bid.length == 4) {
			[n1, r1, n2, r2] = bid;
		}
		[i1, i2] = [ranks.indexOf(r1), ranks.indexOf(r2)];
		bid = [n1, i1, n2, i2];
		//console.log('bid after completing to 4:', jsCopy(bid));

		//sort bid!
		if (n1 == n2 && i2 > i1) bid = [n2, i2, n1, i1];
		//console.log('bid after sorting of numbers equal:', jsCopy(bid));

		//sort bid!
		if (n1 < n2) bid = [n2, i2, n1, i1];
		//console.log('bid after sorting of numbers different:', jsCopy(bid));

		bid = [bid[0], ranks[bid[1]], bid[2], ranks[bid[3]]];
		//console.log('bid at end:', jsCopy(bid));
		return bid;
	}
	function onclick_gehthoch(g, uname) {
		//hier wird abgerechnet: soll NUR bei uname gemacht werden!
		//ev.cancelBubble = true;
		if (!uiActivated) { console.log('ui NOT activated'); return; }

		let [fen, bid] = [g.fen, g.fen.bid];

		//console.log('fen', fen);
		fen.history = { round: g.round, bid: jsCopy(bid), cards: aggregate_all_player_hands(fen), bidder: fen.bidder, aufheber: uname };

		let diff = calc_bid_minus_cards(fen, bid);
		fen.aufheber = uname;
		let loser = diff > 0 ? fen.bidder : fen.aufheber;
		//console.log('==>WAR', diff > 0 ? 'NICHT' : '', 'DRIN!!!!');
		fen.history.war_drin = diff <= 0;
		let loser_handsize = inc_handsize(fen, loser);
		if (loser_handsize > g.options.max_handsize) {
			//determine next player
			let turn = fen.turn = [get_next_player(g, loser)];
			console.log('plorder', fen.plorder, 'loser', loser);
			let plorder = fen.plorder = remove_player(fen, loser);
		} else {
			let turn = fen.turn = [loser];
		}
		let action = { stage: g.stage, step: g.step };
		g.stage = 'move'; g.step += 1; g.round += 1;
		let expected = {}; expected[fen.turn[0]] = { stage: g.stage, step: g.step };
		new_deal(fen);
		delete fen.bid;
		delete fen.bidder;
		fen.trial += 1;
		sendmove(uname, g.friendly, fen, action, expected, g.phase, g.round, g.step, g.stage);
	}
	function onclick_random(g, uname) {
		if (!uiActivated) { console.log('ui NOT activated'); return; }
		let validbid = generate_random_bid(g);
		send_valid_bid(g, validbid, uname);
	}
	function onsubmit_bid(g, id) {
		if (!uiActivated) { console.log('ui NOT activated'); return; }
		let inp1 = mBy(id);
		let val = inp1.value;
		let validbid = evalbid(g, val);
		console.log('validbid', validbid, val);
		if (isdef(validbid[0])) { send_valid_bid(g, validbid, U.name); } else { show_status('ambiguous bid formatting!'); }
	}
	function remove_player(fen, uname) {
		arrRemovip(fen.plorder, uname);
		delete fen.players[uname];
		return fen.plorder;
	}
	function send_valid_bid(g, validbid, uname) {
		let fen = g.fen;
		fen.bid = validbid;
		fen.bidder = uname;
		standard_turn_move(g, uname);

	}
	function set_next_player(g, uname) {
		//set turn to next player in plorder after uname
		//g.step is already updated!
		let plorder = g.fen.plorder;
		let iturn = plorder.indexOf(uname);
		let nextplayer = plorder[(iturn + 1) % plorder.length];
		g.expected = {};
		g.expected[nextplayer] = { step: g.step, stage: 'move' };
		return nextplayer;
	}
	function set_next_step(g) { g.step += 1; return g.step; }
	function standard_turn_move(g, uname) {
		let action = get_move_action(g);
		let step = set_next_step(g);
		let nextplayer = set_next_player(g, uname);
		g.fen.turn = [nextplayer];
		sendmove(uname, g.friendly, g.fen, action, g.expected, g.phase, g.round, step, g.stage);
		//return {step:step,action:action,fen:g.fen,expected:g.expected,phase:g.phase,stage:g.stage};
	}
	function text2bid_orig(s) {
		let words = toWords(s);
		console.log('words are', words);
		//replace 10 by T, jack by J...
		let di = {
			'10': 'T',
			jack: 'J',
			queen: 'Q',
			king: 'K',
			bub: 'J',
			dame: 'Q',
			koenig: 'K',
			t: 'T',
			j: 'J',
			k: 'K',
			q: 'Q',
			d: 'Q',
			b: 'J',
			zehn: 'T',
			ten: 'T',
			two: '2',
			three: '3',
			four: '4',
			five: '5',
			six: '6',
			seven: '7',
			eight: '8',
			nine: '9',
			zwei: '2',
			drei: '3',
			vier: '4',
			fuenf: '5',
			sechs: '6',
			sieben: '7',
			acht: '8',
			neun: '9',
			ace: 'A',
			a: 'A',
			ass: 'A',

		};
		let bid = [], even = true;



		//console.log('words length',words.length, words[0].length);
		if (words.length == 1 && words[0].length == 4 && isNumber(words[0][0]) && isNumber(words[0][2])) {
			let w = words[0];

			if (nundef(di[w[1]]) && !isNumber(w[1])) return 'ERROR';
			if (nundef(di[w[3]]) && !isNumber(w[3])) return 'ERROR';
			//console.log('hhhhhhhhhhhhhhhhhhhhhhhhhhh')

			return [Number(w[0]), isNumber(w[1]) ? Number(w[1]) : di[w[1]], Number(w[2]), isNumber(w[3]) ? Number(w[3]) : di[w[3]]];
		} else if (words.length == 1 && words[0].length == 2 && isNumber(words[0][0])) {
			let w = words[0];
			if (nundef(di[w[1]]) && !isNumber(w[1])) return 'ERROR';
			//console.log('hhhhhhhhhhhhhhhhhhhhhhhhhhhaaaaaaaaaaaaaaaaaaaaaaaaaaa')
			let res = [Number(w[0]), isNumber(w[1]) ? Number(w[1]) : di[w[1]]];
			//console.log('res',res)
			return res;
		}

		for (const w of words) {
			let k = w.toLowerCase();
			//console.log('w', w);
			if (isdef(di[k])) bid.push(di[k]);
			else if (!even && w.length == 1 && '23456789TJQKA'.indexOf(w) >= 0) {
				bid.push(w);
			} else if (isNumber(w) && even) bid.push(Number(w));
			else {
				//console.log('unknown word!!!!', w);
				return 'ERROR';
			}
			even = !even;
		}
		return bid;
	}
	function text2bid(s) {
		let di = {
			'10': 'T',
			jack: 'J',
			queen: 'Q',
			king: 'K',
			bub: 'J',
			dame: 'Q',
			koenig: 'K',
			t: 'T',
			j: 'J',
			k: 'K',
			q: 'Q',
			d: 'Q',
			b: 'J',
			zehn: 'T',
			zehner: 'T',
			ten: 'T',
			two: '2',
			three: '3',
			four: '4',
			five: '5',
			six: '6',
			seven: '7',
			eight: '8',
			nine: '9',
			zwei: '2',
			drei: '3',
			vier: '4',
			fuenf: '5',
			sechs: '6',
			sieben: '7',
			acht: '8',
			neun: '9',
			ace: 'A',
			a: 'A',
			as: 'A',
			ass: 'A',

		};
		let res = splitIntoNumbersAndWords(s); //text2bid(s);
		let even = true;
		let newbid = [];
		for (const w of res) {
			let k = w.toLowerCase();
			if (even) newbid.push(Number(k)); else newbid.push(valf(di[k], k));
			even = !even;
		}
		console.log('s', s, 'res', res, 'newbid', newbid);
		return newbid;
	}
	function text2bid_old(s) {

		let words = toWords(s);
		console.log('words are', words);
		//replace 10 by T, jack by J...
		let bid = [], even = true;

		let n = [], r = [], i = 0;
		for (const w of words) {
			let k = w.toLowerCase();
			if (isNumber(k) && even) n[i] = Number(k);
			else if (isNumber(k) && !even && k >= 2 && k <= 10) r[i] = k;
			else if (isdef(di[k]) && !even) r[i] = di[k];
			else if (isLetter(w[0])) console.log('wrong formatting!!!', s, w);
			else {
				let num = firstNumber(w);
				let rank = stringAfter(num.toString());
				//if (isdef(di[rank]) )
			}
		}

		//console.log('words length',words.length, words[0].length);
		if (words.length == 1 && words[0].length == 4 && isNumber(words[0][0]) && isNumber(words[0][2])) {
			let w = words[0];

			if (nundef(di[w[1]]) && !isNumber(w[1])) return 'ERROR';
			if (nundef(di[w[3]]) && !isNumber(w[3])) return 'ERROR';
			//console.log('hhhhhhhhhhhhhhhhhhhhhhhhhhh')

			return [Number(w[0]), isNumber(w[1]) ? Number(w[1]) : di[w[1]], Number(w[2]), isNumber(w[3]) ? Number(w[3]) : di[w[3]]];
		} else if (words.length == 1 && words[0].length == 2 && isNumber(words[0][0])) {
			let w = words[0];
			if (nundef(di[w[1]]) && !isNumber(w[1])) return 'ERROR';
			//console.log('hhhhhhhhhhhhhhhhhhhhhhhhhhhaaaaaaaaaaaaaaaaaaaaaaaaaaa')
			let res = [Number(w[0]), isNumber(w[1]) ? Number(w[1]) : di[w[1]]];
			//console.log('res',res)
			return res;
		}

		for (const w of words) {
			let k = w.toLowerCase();
			//console.log('w', w);
			if (isdef(di[k])) bid.push(di[k]);
			else if (!even && w.length == 1 && '23456789TJQKA'.indexOf(w) >= 0) {
				bid.push(w);
			} else if (isNumber(w) && even) bid.push(Number(w));
			else {
				//console.log('unknown word!!!!', w);
				return 'ERROR';
			}
			even = !even;
		}
		return bid;
	}

	return { setup: bluff_setup, present: bluff_present, check_gameover: bluff_check_gameover, stats: bluff_stats, activate_ui: bluff_activate };

}

function spotit() {
	function spotit_activate() { }
	function spotit_check_gameover(g) {
		for (const uname of g.players) {
			if (g.fen.players[uname].score >= g.options.winning_score) return uname;

		}
		return false;
	}
	function spotit_setup(players, options) {
		let fen = { players: {}, plorder: jsCopy(players), turn: jsCopy(players), stage: 'move', phase: '' };
		for (const uname of players) { fen.players[uname] = { score: 0 }; }
		fen.items = spotit_item_fen(options);
		options.mode = 'multi';

		//console.log('fen', fen)
		return fen;
	}
	function spotit_present(g, dParent, uname) {

		clearElement(dParent); mCenterCenterFlex(dParent); mStyle(dParent, { fg: 'white', bg: GREEN }); clearElement('dHistory');
		dParent.innerHTML = `<h1>Round ${g.round}</h1>`;
		mLinebreak(dParent, 10);
		spotit_stats(g, dParent, g.fen.players);
		mLinebreak(dParent, 10);

		let fen = g.fen;
		//console.log('fen', fen)
		let ks_for_cards = fen.items.split(',');
		let numCards = ks_for_cards.length;
		let items = g.items = [];
		let i = 0;
		for (const s of ks_for_cards) {
			let ks_list = s.split(' ');
			let item = {};
			item.keys = ks_list.map(x => stringBefore(x, ':'));
			item.scales = ks_list.map(x => stringAfter(x, ':')).map(x => Number(x));
			item.index = i; i++;
			let n = item.numSyms = item.keys.length;
			let [rows, cols, colarr] = calc_syms(item.numSyms);
			item.colarr = colarr;
			item.rows = rows;
			items.push(item);
		}

		g.cards = [];
		for (const item of items) {
			let card = spotit_card(item, dParent, { margin: 20, padding: 10 }, spotit_interact);
			g.cards.push(card);
		}
		mLinebreak(dParent, 10);
	}
	function spotit_stats(g, d) {
		let players = g.fen.players;
		let d1 = mDiv(d, { display: 'flex', 'justify-content': 'center', 'align-items': 'space-evenly' });
		for (const plname in players) {
			let pl = players[plname];
			let onturn = g.turn.includes(plname);
			let sz = 50; //onturn?100:50;
			let border = onturn ? plname == U.name ? 'solid 5px lime' : 'solid 5px red' : 'solid medium white';
			let d2 = mDiv(d1, { margin: 4, align: 'center' }, null, `<img src='../base/assets/images/${plname}.jpg' style="display:block;border:${border};" class='img_person' width=${sz} height=${sz}>${pl.score}`);
			//let d2 = mDiv(d1, { margin: 4, align: 'center' }, null, `<img src='../base/assets/images/${plname}.jpg' style="display:block" class='img_person' width=50 height=50>${pl.score}`);
		}
	}

	//#region internal
	function calc_syms(numSyms) {
		//should return [rows,cols,colarr]
		let n = numSyms, rows, cols;
		if (n == 3) { rows = 2; cols = 1; }
		else if (n == 4) { rows = 2; cols = 2; }
		else if (n == 5) { rows = 3; cols = 1; }
		else if (n == 6) { rows = 4; cols = 1; }
		else if (n == 7) { rows = 3; cols = 2; } //default
		else if (n == 8) { rows = 5; cols = 1; }
		else if (n == 9) { rows = 5; cols = 1; }
		else if (n == 10) { rows = 4; cols = 2; }
		else if (n == 12) { rows = 5; cols = 3; }
		else if (n == 14) { rows = 5; cols = 2; }
		else if (n == 17) { rows = 6; cols = 2; }
		else if (n == 18) { rows = 6; cols = 3; }

		let colarr = _calc_hex_col_array(rows, cols);

		//correction for certain perCard outcomes:
		if (rows == 3 && cols == 1) { colarr = [1, 3, 1]; } //5
		else if (rows == 2 && cols == 1) { colarr = [1, 2]; } //3
		else if (rows == 4 && cols == 1) { rows = 3.3; colarr = [2, 3, 1]; } //6
		else if (rows == 5 && cols == 1) { rows = 4; cols = 1; colarr = [1, 3, 3, 1]; } //8
		else if (rows == 5 && cols == 3) { rows = 5; cols = 1; colarr = [1, 3, 4, 3, 1]; } //12
		else if (rows == 6 && cols == 2) { rows = 5.5; colarr = [2, 4, 5, 4, 2]; } //17
		else if (rows == 6 && cols == 3) { rows = 5.8; colarr = [2, 4, 5, 4, 3]; } //18

		return [rows, cols, colarr];
	}
	function spotit_card(info, dParent, cardStyles, onClickSym) {
		Card.sz = 300;
		copyKeys({ w: Card.sz, h: Card.sz }, cardStyles);
		let card = cRound(dParent, cardStyles, info.id);
		addKeys(info, card);
		//let d = iDiv(card);
		let zipped = [];
		for (let i = 0; i < card.keys.length; i++) {
			zipped.push({ key: card.keys[i], scale: card.scales[i] });
		}
		card.pattern = fillColarr(card.colarr, zipped);

		// symSize: abhaengig von rows
		let symStyles = { sz: Card.sz / (card.rows + 1), fg: 'random', hmargin: 10, vmargin: 6, cursor: 'pointer' };

		let syms = [];
		mRowsX(iDiv(card), card.pattern, symStyles, { 'justify-content': 'center' }, { 'justify-content': 'center' }, syms);
		for (let i = 0; i < info.keys.length; i++) {
			let key = card.keys[i];
			let sym = syms[i];
			card.live[key] = sym;
			sym.setAttribute('key', key);
			sym.onclick = ev => onClickSym(ev, key); //ev, sym, key, card);
		}

		return card;
	}
	function spotit_create_sample(numCards, numSyms, vocab, lang, min_scale, max_scale) {
		lang = valf(lang, 'E');
		let [rows, cols, colarr] = calc_syms(numSyms);

		//from here on, rows ONLY determines symbol size! colarr is used for placing elements

		let perCard = arrSum(colarr);
		let nShared = (numCards * (numCards - 1)) / 2;
		let nUnique = perCard - numCards + 1;
		let numKeysNeeded = nShared + numCards * nUnique;
		let nMin = numKeysNeeded + 3;
		//lang = 'D';
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

			// info.scales = info.keys.map(x => randomNumber(min_scale * 100, max_scale * 100) / 100);
			info.scales = info.keys.map(x => chooseRandom([.5, .75, 1, 1.2]));

			//chooseRandom([.5, .75, 1, 1.25]);
			//info.scales = info.scales.map(x=>coin()?x:-x);
		}

		//console.log(card.scales);
		for (const info of infos) {
			let zipped = [];
			for (let i = 0; i < info.keys.length; i++) {
				zipped.push({ key: info.keys[i], scale: info.scales[i] });
			}
			info.pattern = fillColarr(info.colarr, zipped);
		}

		return infos;
	}
	function spotit_find_shared(g, card, keyClicked) {
		let success = false, othercard = null;
		for (const c of g.cards) {
			if (c == card) continue;
			if (c.keys.includes(keyClicked)) { success = true; othercard = c; }
		}
		return [success, othercard];
	}
	function spotit_item_fen(options) {
		let o = {
			num_cards: valf(options.num_cards, 2),
			num_symbols: valf(options.num_symbols, 7),
			vocab: valf(options.vocab, 'lifePlus'),
			lang: 'E',
			min_scale: valf(options.min_scale, 0.75),
			max_scale: valf(options.max_scale, 1.25),
		};

		let items = spotit_create_sample(o.num_cards, o.num_symbols, o.vocab, o.lang, o.min_scale, o.max_scale);
		let item_fens = [];
		for (const item of items) {
			let arr = arrFlatten(item.pattern);
			let ifen = arr.map(x => `${x.key}:${x.scale}`).join(' ');
			item_fens.push(ifen);
		}

		let res = item_fens.join(',');
		//console.log('res', res);
		return res;

	}
	function spotit_interact(ev, key) { //ev, sym, key, card) {
		ev.cancelBubble = true;
		if (!uiActivated) { console.log('ui NOT activated'); return; }

		let keyClicked = evToProp(ev, 'key');
		let id = evToId(ev);

		if (isdef(keyClicked) && isdef(Items[id])) {
			let item = Items[id];
			//console.log('g.cards',G.cards);
			let dsym = ev.target;
			let card = Items[id];
			//console.log('keyClicked',keyClicked);
			//console.log('dsym',dsym);
			//console.log('card',card);

			//find if symbol is shared!
			let [success, othercard] = spotit_find_shared(G, card, keyClicked);
			spotit_move(G, U.name, success);
		}
	}
	function spotit_move(g, uname, success) {
		//console.log('g',g,'uname',uname,'success',success)
		if (success) {
			//console.log('success!',jsCopy(g.expected));
			g.fen.players[uname].score += 1;
			g.action = { stage: 'move', step: g.step };
			for (const plname in g.expected) { g.expected[plname].step += 1 }
			g.step += 1; g.round += 1;
			//console.log('sending',jsCopy(g.expected));
			g.fen.items = spotit_item_fen(g.options);
			sendmove(uname, g.friendly, g.fen, g.action, g.expected, g.phase, g.round, g.step, g.stage)
		}
	}
	return { setup: spotit_setup, present: spotit_present, check_gameover: spotit_check_gameover, stats: spotit_stats, activate_ui: spotit_activate };
}




