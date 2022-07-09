
//#region ferro ausmisten

function ui_get_jolly_items() {
	//find journey items that contain a jolly replaceable by A.selectedCards[0].key
	let items = [], i = 0;
	let sets = Z.A.jollySets;
	//console.log('...sets', sets);
	for (const s of sets) {
		let o = UI.players[s.plname].journeys[s.index];
		let name = `${s.plname}_j${i}`;
		o.div = o.container;
		let item = { o: o, a: name, key: o.list[0], friendly: name, path: o.path, index: i, ui: o.container };
		i++;
		items.push(item);

	}
	return items;

}

//#region aristo rumors
function path2fen(path) {
	let [fen, uplayer] = [Z.fen, Z.uplayer];
	let res = lookup(fen, path.split('.'));
	//console.log('res',res);
	return res;
}
function mStamp(d1,text) {
	mStyle(d1, { position: 'relative' });
	//let stamp = mDiv(d1, { family:'tahoma', fz:16, weight:'bold', position:'absolute', top:'25%',left:'10%',transform:'rotate(35deg)', w: '80%', h: 24 },null,`blackmail!`,'rubberstamp');
	//let stamp = mDiv(d1, { position:'absolute',top:30,left:0,transform:'rotate( 35deg )' },null,`blackmail!`,'rubberp');
	// mDiv(d1,{position:'absolute',top:30,left:0,},null,`<span class="stamp is-approved">BLACKMAIL!</span>`);
	// mDiv(d1,{position:'absolute',top:30,left:0,},null,`<span class="stamp1">BLACKMAIL!</span>`);
	//mDiv(d1, { position: 'absolute', top: 25, left: 5, weight: 700, fg: 'black', border: '2px solid black', padding: 2 }, null, `BLACKMAIL`, 'stamp1');

	let r=getRect(d1);
	let [w,h]=[r.w,r.h];
	let sz = r.h/7;
	console.log('r',r, 'sz', sz);
	//let [border,rounding,angle]=[sz*.08,sz/3,-14];
	let [padding,border,rounding,angle]=[sz/10,sz/6,sz/8,rNumber(-25,25)];
	mDiv(d1, {
		opacity: 0.9,
		position: 'absolute', top: 25, left: 5, //weight: 700, fg: 'black', border: '2px solid black', padding: 2,
		transform: `rotate(${angle}deg)`,
		fz:sz,
		//'line-height':sz,
		// border:`${border}px solid black`,
		border:`${border}px solid black`,
		hpadding: 2, //padding,
		vpadding: 0,
		// vpadding: border,
		// hpadding: rounding,
		rounding: rounding,
		// 'background-image': `url('https://s3-us-west-2.amazonaws.com/s.cdpn.io/8399/grunge.png')`,
		// 'background-size': `${300*sz}px ${200*sz}px`,
		// 'background-position': `${4*sz}px ${2*sz}px`,
		// 'background-image': 'url(../base/assets/images/textures/stamp.jpg)',
		// 'background-size': `${300*sz}px ${200*sz}px`,
		// 'background-position': `${4*sz}px ${2*sz}px`,

		'-webkit-mask-size': `${w}px ${h}px`,
		'-webkit-mask-position': `50% 50%`,
		//'-webkit-mask-image': `url('https://s3-us-west-2.amazonaws.com/s.cdpn.io/8399/grunge.png')`,
		'-webkit-mask-image': 'url("../base/assets/images/textures/grunge.png")',

		// '-webkit-mask-size': `311px 200px`,
		// '-webkit-mask-position': `4rem 2rem`,
		// '-webkit-mask-image': `url('https://s3-us-west-2.amazonaws.com/s.cdpn.io/8399/grunge.png')`,

		weight: 400, //700,
		display:'inline-block',
		'text-transform':'uppercase',
		family:"black ops one", //'Courier', //'courier new',
		'mix-blend-mode':'multiply'}, null, text);

}


//#region aristo rumors
function ui_get_top_rumors() {
	//let cards = ari_open_rumors();
	return ui_get_card_items(cards);
	let items = [], i = 0;
	let comm = UI.deck_rumors;
	for (const o of comm.items) {
		let item = { o: o, a: o.key, key: o.key, friendly: o.short, path: comm.path, index: i };
		i++;
		items.push(item);
	}
	let topdeck = UI.deck_commission.get_topcard();
	items.push({ o: topdeck, a: topdeck.key, key: topdeck.key, friendly: topdeck.short, path: 'deck_commission', index: i });
	//console.log('choose among:', items)
	return items;
}
function post_rumor() {

	let [fen, A, uplayer, building, obuilding, owner] = [Z.fen, Z.A, Z.uplayer, Z.A.building, Z.A.obuilding, Z.A.buildingowner];
	let buildingtype = Z.A.building.o.type;
	//console.log('====>buildingtype',buildingtype);
	let res = A.selected[0] == 0; //confirm('destroy the building?'); //TODO das muss besser werden!!!!!!!
	if (!res) {
		if (fen.players[owner].coins > 0) {
			//console.log('player', owner, 'pays to', uplayer, fen.players[owner].coins, fen.players[uplayer].coins);
			fen.players[owner].coins -= 1;
			fen.players[uplayer].coins += 1;
			//console.log('after payment:', fen.players[owner].coins, fen.players[uplayer].coins)
		}
	} else {
		let list = obuilding.list;
		//console.log('!!!!!!!!!!!!!building', obuilding, 'DESTROY!!!!!!!!!!!!!!!!', '\nlist', list);
		let correct_key = list[0];
		let rank = correct_key[0];
		//console.log('rank is', rank);
		//console.log('building destruction: ', correct_key);
		while (list.length > 0) {
			let ckey = list[0];
			//console.log('card rank is', ckey[0])
			if (ckey[0] != rank) {
				elem_from_to_top(ckey, list, fen.deck_discard);
				//console.log('discard',otree.deck_discard);
			} else {
				elem_from_to(ckey, list, fen.players[owner].hand);
			}
		}
		//console.log('building after removing cards', list, obuilding)
		if (isdef(obuilding.harvest)) {
			fen.deck_discard.unshift(obuilding.harvest);
		}
		ari_reorg_discard(fen);


		let blist = lookup(fen, stringBeforeLast(building.path, '.').split('.')); //building.path.split('.')); //stringBeforeLast(ibuilding.path, '.').split('.'));, stringBeforeLast(building.path, '.').split('.'));

		//console.log('===>remove',obuilding,'from',blist);
		removeInPlace(blist, obuilding);

		//console.log('player', owner, 'after building destruction', otree[owner])
	}
	ari_history_list([`${uplayer} rumored ${buildingtype} of ${owner} resulting in ${res ? 'destruction' : 'payoff'}`,], 'rumor');

	ari_next_action(fen, uplayer);


}
function rest(){

	if (isdef(obuilding.schwein)) {

		Z.stage = 46;
		A.building = item;
		A.obuilding = obuilding;
		A.buildingowner = owner;
		ari_pre_action();
		return;

	} else {

		//this building is revealed
		let cards = item.o.items;
		let key = cards[0].rank;
		let schweine = false;
		let schwein = null;
		for (const c of cards) {
			if (c.rank != key) { schweine = true; schwein = c.key; face_up(c); break; }
		}
		if (schweine) {
			if (fen.players[owner].coins > 0) {
				fen.players[owner].coins--;
				fen.players[uplayer].coins++;
			}
			let b = lookup(fen, item.path.split('.'));
			b.schwein = schwein;
		}

		ari_history_list([
			`${uplayer} rumored ${ari_get_building_type(obuilding)} of ${owner} resulting in ${schweine ? 'schweine' : 'ok'} ${ari_get_building_type(obuilding)}`,
		], 'rumor');

		ari_next_action(fen, uplayer);
	}


}

function ui_type_building(b, dParent, styles = {}, path = 'farm', title = '', get_card_func = ari_get_card) {

	let cont = ui_make_container(dParent, get_container_styles(styles));
	let cardcont = mDiv(cont);

	let list = b.list;
	//console.log('list', list)
	//let n = list.length;
	let d = mDiv(dParent);
	let items = list.map(x => get_card_func(x));
	// let cont = ui_make_hand_container(items, d, { maleft: 12, padding: 4 });

	let schwein = null;
	for (let i = 1; i < items.length; i++) {
		let item = items[i];
		if (b.schwein != item.key) face_down(item); else schwein = item;
	}

	let d_harvest = null;
	if (isdef(b.h)) {
		let keycard = items[0];
		let d = iDiv(keycard);
		mStyle(d, { position: 'relative' });
		d_harvest = mDiv(d, { position: 'absolute', w: 20, h: 20, bg: 'orange', opacity: .5, fg: 'black', top: '45%', left: -10, rounding: '50%', align: 'center' }, null, 'H');
	}

	let card = isEmpty(items) ? { w: 1, h: 100, ov: 0 } : items[0];
	//console.log('card',card)
	mContainerSplay(cardcont, 2, card.w, card.h, items.length, card.ov * card.w);
	ui_add_cards_to_hand_container(cardcont, items, list);

	ui_add_container_title(title, cont, items);

	// if (isdef(title) && !isEmpty(items)) { mText(title, d); }

	return {
		ctype: 'hand',
		list: list,
		path: path,
		container: cont,
		cardcontainer: cardcont,
		items: items,
		schwein: schwein,
		harvest: d_harvest,
		keycard: items[0],

	};
}


//#region fritz

function _show_special_message(msg,stay=false) {
	let dParent = mBy('dBandMessage'); 
	console.log('dBandMessage',mBy('dBandMessage'))
	if (nundef(dParent)) dParent = mDiv(document.body,{},'dBandMessage');
	console.log('dParent',dParent)
	show(dParent); 
	clearElement(dParent);
	mStyle(dParent, { position: 'absolute', top: 200, bg: 'green', wmin: '100vw'}); 
	let d = mDiv(dParent, { margin: 0 });
	let styles = { classname: 'slow_gradient_blink', vpadding: 10, align: 'center', position: 'absolute', fg: 'white', fz: 24, w: '100vw' };
	let dContent = mDiv(d, styles, null, msg);
	mFadeClear(dParent, 3000 );
}


function end_of_turn_fritz() {
	//console.log('A', Z.A)
	//console.log('time is up!!!', getFunctionsNameThatCalledThisFunction());
	let [A, fen, uplayer, plorder] = [Z.A, Z.fen, Z.uplayer, Z.plorder];
	let pl = fen.players[uplayer];
	//console.log('__________________________');

	clear_quick_buttons();

	//all TJ groups must be checked and loose cards placed in loosecards
	let ploose = {};
	fen.journeys = [];
	fen.loosecards = [];
	for (const plname in fen.players) { fen.players[plname].loosecards = []; }
	for (const group of DA.TJ) {
		let ch = arrChildren(iDiv(group));
		let cards = ch.map(x => Items[x.id]);
		//find out if is a set
		//console.log('cards', cards);
		let set = ferro_is_set(cards, Z.options.jokers_per_group, 3);
		//console.log('set', set);
		if (!set) {
			//dann kommen die Karten in die Loosecards
			for (const card of cards) {
				if (is_joker(card)) {
					//console.log('pushing joker', card.key);
					fen.loosecards.push(card.key);
					continue;
				}
				let owner = valf(card.owner, uplayer);
				lookupAddToList(ploose, [owner], card.key);
				//console.log('add card', card.key, 'to', owner);
			}
			//console.log('NOT A SET', cards);
		} else {
			let j = set; //[];
			//for (const card of cards) { delete card.owner; j.push(card.key); }
			fen.journeys.push(j);
			//console.log('YES!!!', 'adding journey', j);
		}
	}
	for (const plname in ploose) {
		fen.players[plname].loosecards = ploose[plname];
	}

	//console.log('_____\npublic loosecards', fen.loosecards);
	//console.log('journeys:', fen.journeys);
	//for (const plname in fen.players) { console.log('loosecards', plname, fen.players[plname].loosecards); }

	//discard pile must be reduced by all cards that do not have source = 'discard'
	let discard = UI.deck_discard.items.filter(x => x.source == 'discard');
	fen.deck_discard = discard.map(x => x.key);

	if (!isEmpty(A.selected)) {
		//console.log('selected', A.selected);
		let ui_discarded_card = A.selected.map(x => A.items[x].o)[0];

		removeInPlace(UI.players[uplayer].hand.items, ui_discarded_card);
		ckey = ui_discarded_card.key;
		//console.log('discard', discard);
		elem_from_to(ckey, fen.players[uplayer].hand, fen.deck_discard);
		//ari_history_list([`${uplayer} discards ${c}`], 'discard');

	}

	//all UI.hand cards that do NOT have source=hand must be removed from player hands

	let uihand = UI.players[uplayer].hand.items; //.filter(x => x.source == 'hand');
	let fenhand_vorher = fen.players[uplayer].hand;
	let fenhand = fen.players[uplayer].hand = uihand.filter(x => x.source == 'hand').map(x => x.key);
	//console.log('hand', uihand, 'fenhand vorher:', fenhand_vorher, 'fenhand', fenhand);

	//check gameover!!!!
	if (isEmpty(fenhand) && isEmpty(fen.players[uplayer].loosecards)) {
		end_of_round_fritz(uplayer);

	} else {
		Z.turn = [get_next_player(Z, uplayer)];
		deck_deal_safe_fritz(fen, Z.turn[0]);
	}
	//console.log('==>fen.loosecards', fen.loosecards); //, fen.players[uplayer].loosecards); //, fen.players);
	let ms = fen.players[uplayer].time_left = stop_user_timer();

	//console.log('fritz_turn_ends', 'ms', ms);
	if (ms <= 0) {
		console.log('time is up!!!');
		//this player needs to be removed!
		if (Z.turn[0] == uplayer) Z.turn = [get_next_player(Z, uplayer)];
		//if only 1 player in plorder, that player wins
		remove_player(fen, uplayer);
		if (plorder.length == 1) { end_of_round_fritz(plorder[0]); }
	}

	turn_send_move_update();

}


function fritz_present_new(z, dParent, uplayer) {

	let [fen, ui, stage] = [z.fen, UI, z.stage];
	let [dOben, dOpenTable, dMiddle, dRechts] = tableLayoutMR(dParent, 5, 1); mFlexWrap(dOpenTable)
	Config.ui.card.h = 130;
	Config.ui.container.h = Config.ui.card.h + 30;

	//let deck = ui.deck = ui_type_deck(fen.deck, dOpenTable, { maleft: 12 }, 'deck', 'deck', fritz_get_card);
	if (isEmpty(fen.deck_discard)) {
		mText('discard empty', dOpenTable);
		ui.deck_discard = { items: [] }
	} else {
		let deck_discard = ui.deck_discard = ui_type_hand(fen.deck_discard, dOpenTable, { maright: 25 }, 'deck_discard', 'discard', fritz_get_card, true);
		let i = 0; deck_discard.items.map(x => { x.source = 'discard'; x.index = i++ });
	}
	mLinebreak(dOpenTable);


	let ddarea = UI.ddarea = mDiv(dOpenTable, { border: 'dashed 1px black', bg: '#eeeeee80', box: true, wmin:245, padding: '5px 50px 5px 5px', margin: 5 });
	mDroppable(ddarea, drop_card_fritz); ddarea.id = 'dOpenTable'; Items[ddarea.id] = ddarea;
	mFlexWrap(ddarea)

	fritz_stats_new(z, dRechts);

	show_history(fen, dRechts);

	DA.TJ = [];
	//journeys become groups
	//fen.journeys = [['QHn', 'KHn', 'AHn'], ['QCn', 'QHn', 'QDn']];
	for (const j of fen.journeys) {
		let cards = j.map(x => fritz_get_card(x));
		frnew(cards[0], { target: 'hallo' });
		for (let i = 1; i < cards.length; i++) { fradd(cards[i], Items[cards[0].groupid]); }

	}
	//loose cards of fen and other players become groups. own loose cards will ALSO go to player area
	let loosecards = ui.loosecards = jsCopy(fen.loosecards).map(c => fritz_get_card(c));
	for (const plname of fen.plorder) {
		let cards = fen.players[plname].loosecards.map(c => fritz_get_card(c));
		cards.map(x => x.owner = plname);
		// if (plname == uplayer) { ui.ploosecards = cards; } else { loosecards = loosecards.concat(cards); }
		if (plname != uplayer) { loosecards = loosecards.concat(cards); }
		//loosecards = loosecards.concat(cards);
	}
	for (const looseui of loosecards) {
		//console.log('looseui', looseui);
		let card = looseui;
		frnew(card, { target: 'hallo' });
	}

	//all cards in drop area are droppable
	for (const group of DA.TJ) {
		let d = iDiv(group);
		//console.log('d',d);
		let ch = arrChildren(iDiv(group));
		let cards = ch.map(x => Items[x.id]);
		//console.log('cards', cards);
		cards.map(x => mDroppable(iDiv(x), drop_card_fritz));
	}

	//if ddarea is empty, write drag and drop hint
	if (arrChildren(ddarea).length == 0) {
		let d = mDiv(ddarea, {'pointer-events': 'none',maleft:45,align:'center',hmin:40,w:'100%',fz:12,fg:'dimgray'},'ddhint','drag and drop cards here');
		//setRect(ddarea)
		//mPlace(d,'cc')

	} 

	ui.players = {};
	let uname_plays = fen.plorder.includes(Z.uname);
	let plmain = uname_plays && Z.mode == 'multi' ? Z.uname : uplayer;
	fritz_present_player(plmain, dMiddle);

	if (TESTING) {
		for (const plname of arrMinus(fen.plorder, plmain)) {
			fritz_present_player(plname, dMiddle);
		}
	}


}



//#region rechnung
function boamain_start() {
	//console.log('haaaaaaaaaaaaaaaaa');
	S.boa_state = 'authorized';

	//hier start timer that will reset boa_state to null
	if (DA.challenge == 1) {
		TO.boa = setTimeout(() => {
			S.boa_state = null;
			let msg = DA.challenge == 1 ? 'CONGRATULATIONS!!!! YOU SUCCEEDED IN LOGGING IN TO BOA' : 'Session timed out!';
			show_eval_message(true);
			//alert(msg);
			//boa_start();
		}, 3000);
	}

	show_correct_location('boa');  //das ist um alle anderen screens zu loeschen!
	let dParent = mBy('dBoa'); mClear(dParent);

	let d0 = mDiv(dParent, { align: 'center' }, 'dBoaMain'); mCenterFlex(d0);
	// let d0 = mDiv(d, { align:'center', display: 'grid', 'grid-template-columns': '2', gap:20 }, 'dBoaMain');
	//let d0 = mDiv(d, { display: 'flex', 'justify-content': 'center', gap:20 }, 'dBoaMain');

	let [wtotal, wleft, wright] = [972, 972 - 298, 292];

	let d = mDiv(d0, { w: wtotal, hmin: 500 }); mAppend(d, createImage('boamain_header.png', { h: 111 }));
	//return;

	// let d0 = mDiv(d);
	//let d1 = mDiv(d0, { align: 'center' });

	// let d2 = mDiv(d);
	// let d3 = mDiv(d2, { display: 'flex', 'justify-content': 'center' }, 'dBoaMain');

	// d = mDiv(d3, { w: wtotal, hmin: 500 });
	let dl = mDiv(d, { float: 'left', w: wleft, hmin: 400 });
	let dr = mDiv(d, { float: 'right', hmin: 400, w: wright });

	mDiv(dr, { h: 100 });
	mAppend(dr, createImage('boamain_rechts.png', { w: 292 }));

	mAppend(dl, createImage('boamain_left_top.jpg', { matop: 50, maleft: -20 }));
	//mDiv(dl, { family:'connectionsregular,Verdana,Geneva,Arial,Helvetica,sans-serif', fz: 18, weight: 500, 'line-height':70, fg:'#524940' }, null, 'Payment Center');

	mDiv(dl, { bg: '#857363', fg: 'white', fz: 15 }, null, '&nbsp;&nbsp;<i class="fa fa-caret-down"></i>&nbsp;&nbsp;Default Group<div style="float:right;">Sort&nbsp;&nbsp;</div>');

	let boadata = get_fake_boa_data_list();
	let color_alt = '#F9F7F4';
	let i = 0;
	//let sortedkeys = get_keys(boadata);	sortedkeys.sort();
	for (const o of boadata) {
		let k = o.key;
		o.index = i;
		//console.log('key',k,'index',i);
		let logo = valf(o.logo, 'defaultacct.jpg');
		let path = `${logo}`;
		let [sz, bg] = [25, i % 2 ? 'white' : color_alt];

		let dall = mDiv(dl, { bg: bg, fg: '#FCFCFC', 'border-bottom': '1px dotted silver' }, `dAccount${i}`);
		let da = mDiv(dall);
		mFlexLR(da);

		let img = createImage(path, { h: sz, margin: 10 });

		let da1 = mDiv(da);
		mAppend(da1, img);
		let dtext = mDiv(da1, { align: 'left', display: 'inline-block', fg: '#FCFCFC', fz: 14 });
		mAppend(dtext, mCreateFrom(`<a>${k}</a>`));
		let dsub = mDiv(dtext, { fg: 'dimgray', fz: 12 }, null, o.sub);

		let da2 = mDiv(da); mFlex(da2);
		let da21 = mDiv(da2, { w: 100, hmargin: 20, mabottom: 20 });
		let padinput = 7;
		mDiv(da21, { fg: 'black', fz: 12, weight: 'bold' }, null, 'Amount');
		mDiv(da21, { w: 100 }, null, `<input onfocus="add_make_payments_button(event)" style="color:dimgray;font-size:14px;border:1px dotted silver;padding:${padinput}px;width:85px" id="inp${i}" name="authocode" value="$" type="text" />`);

		let da22 = mDiv(da2, { maright: 10 });
		mDiv(da22, { fg: 'black', fz: 12, weight: 'bold' }, null, 'Deliver By');
		mDiv(da22, {}, null, `<input style="color:dimgray;font-size:12px;border:1px dotted silver;padding:${padinput}px" id="inpAuthocode" name="authocode" value="" type="date" />`);

		// mDiv(dall,{fz:12,fg:'blue',maleft:400,mabottom:25},null,'hallo');
		let dabot = mDiv(dall);
		mFlexLR(dabot);
		let lastpayment = isdef(o['Last Payment']) ? `Last Payment: ${o['Last Payment']}` : ' ';
		mDiv(dabot, { fz: 12, fg: '#303030', maleft: 10, mabottom: 25 }, null, `${lastpayment}`);
		mDiv(dabot, { fz: 12, fg: 'blue', maright: 90, mabottom: 25 }, null, `<a>Activity</a>&nbsp;&nbsp;&nbsp;<a>Reminders</a>&nbsp;&nbsp;&nbsp;<a>AutoPay</a>`);

		mDiv(dall);
		//let dadummy = mDiv(dall, {margin:500 },null,`<a>Activity</a><a>Reminders</a><a>AutoPay</a>`); //;'border-bottom':'1px solid black'});

		i++;
	}


	//mDiv(dl, { hmin: 400, bg: 'orange' });
	//for (let j = 0; j < i; j++) { let inp = document.getElementById(`inp${j}`); inp.addEventListener('keyup', unfocusOnEnter); }

}
function _boamain_start() {
	//console.log('haaaaaaaaaaaaaaaaa');
	S.boa_state = 'authorized';

	//hier start timer that will reset boa_state to null
	if (DA.challenge == 1) {
		TO.boa = setTimeout(() => {
			S.boa_state = null;
			let msg = DA.challenge == 1 ? 'CONGRATULATIONS!!!! YOU SUCCEEDED IN LOGGING IN TO BOA' : 'Session timed out!';
			alert(msg);
			boa_start();
		}, 3000);
	}

	show_correct_location('boa');  //das ist um alle anderen screens zu loeschen!
	let d = mBy('dBoa'); mClear(d);

	let d0 = mDiv(d);
	let d1 = mDiv(d0, { align: 'center' });
	mAppend(d1, createImage('boamain_header.png', { h: 111 }));

	let d2 = mDiv(d);
	let d3 = mDiv(d2, { display: 'flex', 'justify-content': 'center' },'dBoaMain');

	let [wtotal, wleft, wright] = [972, 972 - 298, 292];
	d = mDiv(d3, { w: wtotal, hmin: 500 });
	let dl = mDiv(d, { float: 'left', w: wleft, hmin: 400 });
	let dr = mDiv(d, { float: 'right', hmin: 400, w: wright });

	mDiv(dr, { h: 100 });
	mAppend(dr, createImage('boamain_rechts.png', { w: 292 }));

	mAppend(dl, createImage('boamain_left_top.jpg', { matop: 50, maleft: -20 }));
	//mDiv(dl, { family:'connectionsregular,Verdana,Geneva,Arial,Helvetica,sans-serif', fz: 18, weight: 500, 'line-height':70, fg:'#524940' }, null, 'Payment Center');

	mDiv(dl, { bg: '#857363', fg: 'white', fz: 15 }, null, '&nbsp;&nbsp;<i class="fa fa-caret-down"></i>&nbsp;&nbsp;Default Group<div style="float:right;">Sort&nbsp;&nbsp;</div>');

	let boadata = get_fake_boa_data();
	let color_alt = '#F9F7F4';
	let i = 0;
	for (const k in boadata) {
		let o = boadata[k];
		//console.log('o', o);
		let logo = valf(o.logo, 'defaultacct.jpg');
		let path = `${logo}`;
		let [sz, bg] = [25, i % 2 ? 'white' : color_alt];

		let dall = mDiv(dl, { bg: bg, fg: '#FCFCFC', 'border-bottom': '1px dotted silver' });
		let da = mDiv(dall);
		mFlexLR(da);

		let img = createImage(path, { h: sz, margin: 10 });

		let da1 = mDiv(da);
		mAppend(da1, img);
		let dtext = mDiv(da1, { display: 'inline-block', fg: '#FCFCFC', fz: 14 });
		mAppend(dtext, mCreateFrom(`<a>${k}</a>`));
		let dsub = mDiv(dtext, { fg: 'dimgray', fz: 12 }, null, o.sub);

		let da2 = mDiv(da); mFlex(da2);
		let da21 = mDiv(da2, { w: 100, hmargin: 20, mabottom: 20 });
		let padinput = 7;
		mDiv(da21, { fg: 'black', fz: 12, weight: 'bold' }, null, 'Amount');
		mDiv(da21, { w: 100 }, null, `<input style="color:dimgray;font-size:14px;border:1px dotted silver;padding:${padinput}px;width:85px" id="inpAuthocode" name="authocode" value="$" type="text" />`);

		let da22 = mDiv(da2, { maright: 10 });
		mDiv(da22, { fg: 'black', fz: 12, weight: 'bold' }, null, 'Deliver By');
		mDiv(da22, {}, null, `<input style="color:dimgray;font-size:12px;border:1px dotted silver;padding:${padinput}px" id="inpAuthocode" name="authocode" value="" type="date" />`);

		// mDiv(dall,{fz:12,fg:'blue',maleft:400,mabottom:25},null,'hallo');
		let dabot = mDiv(dall);
		mFlexLR(dabot);
		let lastpayment = isdef(o['Last Payment']) ? `Last Payment: ${o['Last Payment']}` : ' ';
		mDiv(dabot, { fz: 12, fg: '#303030', maleft: 10, mabottom: 25 }, null, `${lastpayment}`);
		mDiv(dabot, { fz: 12, fg: 'blue', maright: 90, mabottom: 25 }, null, `<a>Activity</a>&nbsp;&nbsp;&nbsp;<a>Reminders</a>&nbsp;&nbsp;&nbsp;<a>AutoPay</a>`);
		//let dadummy = mDiv(dall, {margin:500 },null,`<a>Activity</a><a>Reminders</a><a>AutoPay</a>`); //;'border-bottom':'1px solid black'});

		i++;
	}

	//mDiv(dl, { hmin: 400, bg: 'orange' });

}

function restrest() {
	let d1 = mDiv(d0, { align: 'center' });
	mAppend(d1, createImage('boamain_header.png', { h: 111 }));

	let d2 = mDiv(d);
	let d3 = mDiv(d2, { display: 'flex', 'justify-content': 'center' });

	let [wtotal, wleft, wright] = [972, 972 - 298, 292];
	d = mDiv(d3, { w: wtotal, hmin: 500 });
	let dl = mDiv(d, { float: 'left', w: wleft, hmin: 400 });
	let dr = mDiv(d, { float: 'right', hmin: 400, w: wright });

	mDiv(dr, { h: 100 });
	mAppend(dr, createImage('boamain_rechts.png', { w: 292 }));

	mAppend(dl, createImage('boamain_left_top.jpg', { matop: 50, maleft: -20 }));
	//mDiv(dl, { family:'connectionsregular,Verdana,Geneva,Arial,Helvetica,sans-serif', fz: 18, weight: 500, 'line-height':70, fg:'#524940' }, null, 'Payment Center');

	mDiv(dl, { bg: '#857363', fg: 'white', fz: 15 }, null, '&nbsp;&nbsp;<i class="fa fa-caret-down"></i>&nbsp;&nbsp;Default Group<div style="float:right;">Sort&nbsp;&nbsp;</div>');

	let boadata = get_fake_boa_data();
	let color_alt = '#F9F7F4';
	let i = 0;
	for (const k in boadata) {
		let o = boadata[k];
		//console.log('o', o);
		let logo = valf(o.logo, 'defaultacct.jpg');
		let path = `${logo}`;
		let [sz, bg] = [25, i % 2 ? 'white' : color_alt];

		let dall = mDiv(dl, { bg: bg, fg: '#FCFCFC', 'border-bottom': '1px dotted silver' });
		let da = mDiv(dall);
		mFlexLR(da);

		let img = createImage(path, { h: sz, margin: 10 });

		let da1 = mDiv(da);
		mAppend(da1, img);
		let dtext = mDiv(da1, { display: 'inline-block', fg: '#FCFCFC', fz: 14 });
		mAppend(dtext, mCreateFrom(`<a>${k}</a>`));
		let dsub = mDiv(dtext, { fg: 'dimgray', fz: 12 }, null, o.sub);

		let da2 = mDiv(da); mFlex(da2);
		let da21 = mDiv(da2, { w: 100, hmargin: 20, mabottom: 20 });
		let padinput = 7;
		mDiv(da21, { fg: 'black', fz: 12, weight: 'bold' }, null, 'Amount');
		mDiv(da21, { w: 100 }, null, `<input style="color:dimgray;font-size:14px;border:1px dotted silver;padding:${padinput}px;width:85px" id="inpAuthocode" name="authocode" value="$" type="text" />`);

		let da22 = mDiv(da2, { maright: 10 });
		mDiv(da22, { fg: 'black', fz: 12, weight: 'bold' }, null, 'Deliver By');
		mDiv(da22, {}, null, `<input style="color:dimgray;font-size:12px;border:1px dotted silver;padding:${padinput}px" id="inpAuthocode" name="authocode" value="" type="date" />`);

		// mDiv(dall,{fz:12,fg:'blue',maleft:400,mabottom:25},null,'hallo');
		let dabot = mDiv(dall);
		mFlexLR(dabot);
		let lastpayment = isdef(o['Last Payment']) ? `Last Payment: ${o['Last Payment']}` : ' ';
		mDiv(dabot, { fz: 12, fg: '#303030', maleft: 10, mabottom: 25 }, null, `${lastpayment}`);
		mDiv(dabot, { fz: 12, fg: 'blue', maright: 90, mabottom: 25 }, null, `<a>Activity</a>&nbsp;&nbsp;&nbsp;<a>Reminders</a>&nbsp;&nbsp;&nbsp;<a>AutoPay</a>`);
		//let dadummy = mDiv(dall, {margin:500 },null,`<a>Activity</a><a>Reminders</a><a>AutoPay</a>`); //;'border-bottom':'1px solid black'});

		i++;
	}



	//mDiv(dl, { hmin: 400, bg: 'orange' });

}
function _bw_widget_popup() {
	let dpop = mBy('dPopup');
	show(dpop); mClear(dpop)
	mStyle(dpop, { top: 50, right: 10 }); let prefix = 'boa';
	let d = mDiv(dpop, { wmin: 200, hmin: 200, padding: 0 }, 'dBw');
	let d2 = mDiv(d, { padding: 0, h: 30 }, null, `<img width='100%' src='../rechnung/images/bwsearch.jpg'>`);
	//let d2 = mDiv(d, { bg: 'dodgerblue', fg: 'white' }, null, 'your bitwarden vault');

	let d3 = mDiv(d, { bg: '#eee', fg: 'dimgray', padding: 8, matop: 8 }, null, 'LOGINS');
	let d4 = mDiv(d, { bg: 'white', fg: 'black' });
	let d5 = mDiv(d4, { display: 'flex' });
	let dimg = mDiv(d5, { bg: 'white', fg: 'black' }, null, `<img src='../rechnung/images/boa.png' height=14 style="margin:8px">`);
	// let dtext = mDiv(d5, {}, null, `<div>boa</div><div style="font-size:12px;color:gray">gleeb69</div>`);
	let dtext = mDiv(d5, { cursor: 'pointer' }, null, `<div>boa</div><div style="font-size:12px;color:gray">gleeb69</div>`);
	dtext.onclick = () => onclick_bw_symbol(prefix)
	let d6 = mDiv(d4, { display: 'flex', padding: 2 });
	let disyms = {
		bwtext: { postfix: 'userid', matop: 2, maright: 0, mabottom: 0, maleft: 0, sz: 27 },
		bwcross: { postfix: 'cross', matop: 2, maright: 0, mabottom: 0, maleft: -13, sz: 25 },
		bwkey: { postfix: 'pwd', matop: 0, maright: 0, mabottom: 0, maleft: -12, sz: 27 },
		bwclock: { postfix: 'clock', matop: 0, maright: 0, mabottom: 0, maleft: 0, sz: 25 },
	}
	for (const k of ['bwtext', 'bwcross', 'bwkey']) { //,'bwclock']) {
		let o = disyms[k];
		let [filename, styles] = [k, disyms[k]];
		let path = `../rechnung/images/${filename}.png`;
		let [sz, ma] = [styles.sz, `${styles.matop}px ${styles.maright}px ${styles.mabottom}px ${styles.maleft}px`];
		//console.log('ma', ma);
		let img = mDiv(d6, { paright: 16 }, null, `<img src='${path}' height=${sz} style="margin:${ma}">`);
		if (k != 'bwcross') {
			mStyle(img, { cursor: 'pointer' });
			img.onclick = () => onclick_bw_symbol(prefix, o.postfix);
		}
	}
	mFlexSpacebetween(d4);
	let d7 = mDiv(d, { bg: '#eee', fg: 'dimgray', padding: 7 }, null, 'CARDS');
	//let d8 = mDiv(d, { fg: 'white' }, null, `<img width='100%' src='../rechnung/images/rest_bw.jpg'>`);

}

//#endregion

//#region ack OLD
function ferro_update_ack() {
	//should return true if need to resend!
	let [fen, stage, uplayer] = [Z.fen, Z.stage, Z.uplayer];

	//console.log('___________notes', jsCopy(Z.notes));

	if (Z.notes.resolve == true && uplayer == Z.host) { ferro_change_to_turn_round(); return true; }

	//update turn from notes
	let updated = false;
	for (const k in Z.notes) {
		if (k == 'akku') continue;
		if (!Z.turn.includes(k)) continue;
		updated = true;
		removeInPlace(Z.turn, k);
		console.log('removing player', k, 'from turn', Z.turn);
	}
	//console.log('Z.turn is now:', jsCopy(Z.turn));
	fen.turn = Z.turn;

	if (!isEmpty(Z.turn)) return updated;

	//ab hier is Z.turn EMPTY da heisst akku ist voll!!!!
	else if (uplayer == Z.host) { ferro_change_to_turn_round(); return true; }
	else { Z.turn = fen.turn = [Z.host]; Z.notes.resolve = true; return true; } //hier sollte resolve flag setzen!!!
}
function ferro_change_to_ack_round() {
	let [plorder, stage, A, fen, uplayer] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer];
	let nextplayer = get_next_player(Z, uplayer);

	//console.log('nextplayer should be', nextplayer)

	//newturn is list of players starting with nextplayer
	let newturn = jsCopy(plorder); while (newturn[0] != nextplayer) { newturn = arrCycle(newturn, 1); }

	//each player except uplayer will get opportunity to buy top discard - nextplayer will draw if passing
	fen.lastplayer = uplayer;
	fen.nextplayer = nextplayer;
	fen.turn_after_ack = [nextplayer];
	fen.nextstage = 'card_selection';
	let buyerlist = fen.canbuy = [];
	//console.log('newturn', newturn);
	for (const plname of newturn) {
		let pl = fen.players[plname];
		if (plname == uplayer) { pl.buy = false; continue; }
		//if (plname == nextplayer) { pl.buy = false; buyerlist.push(plname); }
		else if (pl.coins > 0) { pl.buy = false; buyerlist.push(plname); }
	}
	//log_object(fen, 'buyers', 'nextplayer canbuy');

	Z.stage = 'buy_or_pass';
	Z.turn = buyerlist;
	//console.log('Z.turn', Z.turn);
	Z.notes = { akku: true };
}
function ferro_change_to_turn_round() {
	//console.log('ferro_change_to_turn_round', getFunctionsNameThatCalledThisFunction()); 
	let [z, A, fen, stage, uplayer, ui] = [Z, Z.A, Z.fen, Z.stage, Z.uplayer, UI];
	assertion(stage == 'buy_or_pass', "ALREADY IN TURN ROUND!!!!!!!!!!!!!!!!!!!!!!")
	Z.turn = fen.turn_after_ack;
	//console.log('fen.canbuy', fen.canbuy);
	//console.log('next player will be', Z.turn);

	//resolve buy or pass round!
	//if any player has bought, he will get top discard
	for (const plname of fen.canbuy) {
		let pl = fen.players[plname];
		//console.log('pl',pl);
		if (pl.buy) {
			let card = fen.deck_discard.shift();
			//console.log('card',card,jsCopy(pl.hand));
			pl.hand.push(card);
			//also pl gets 2 top cards from deck
			//console.log('card',card,pl.hand);
			pl.hand.push(fen.deck.shift()); //get 1 extra card from deck
			pl.coins -= 1; //pay
			fen.player_bought = plname;
			ari_history_list([`${plname} bought ${card}`], 'buy');
			//console.log(plname, 'bought', card, 'for', 1, 'coins');
			break;
		}
	}
	fen.players[fen.nextplayer].hand.push(fen.deck.shift());//nextplayer draws
	Z.stage = fen.nextstage;
	//cleanup buy_or_pass variables
	for (const k of ['player_bought', 'nextplayer', 'nextstage', 'canbuy', 'turn_after_ack', 'akku']) delete fen[k];
	for (const plname of fen.plorder) { delete fen.players[plname].buy; }
	Z.notes = {};
	clear_transaction();

	//hier kann ich turn snapshot machen

}
function ferro_ack_uplayer() {
	let [A, fen, stage, uplayer] = [Z.A, Z.fen, Z.stage, Z.uplayer];
	removeInPlace(Z.turn, uplayer);
	if (A.selected[0] == 0) {
		Z.notes[uplayer] = { buy: true };
		fen.players[uplayer].buy = true;
	} else {
		Z.notes[uplayer] = { buy: false };
		fen.players[uplayer].buy = false;
	}

	if (isEmpty(Z.turn)) { ferro_change_to_turn_round(); }
	turn_send_move_update();
}
//#endregion



function ui_get_bluff_inputs(strings) {
	let uplayer = Z.uplayer;
	let items = ui_get_string_items(strings);
	console.log('items', items)
	return items;
	//hier koennt ich die ergebnis inputs dazugeben!
}


function ui_get_ferro_action_items(){
	let [plorder, stage, A, fen, uplayer, pl] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer, Z.fen.players[Z.uplayer]];

	let items = ui_get_hand_items(uplayer);
	let actions = ['discard', 'auflegen', 'anlegen', 'jolly'];
	items = items.concat(ui_get_string_items(actions));
	reindex_items(items);
	return items;
}
function ferro_process_action(){
	let [plorder, stage, A, fen, uplayer, pl] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer, Z.fen.players[Z.uplayer]];

	let selitems = A.selected.map(x => A.items[x]);
	console.log('selitems:', selitems);
	let cards = selitems.filter(x => x.itemtype == 'card');
	let actions = selitems.filter(x => x.itemtype == 'string');
	if (actions.length == 0) { select_error('select an action!'); selitems.map(x=>ari_make_unselected(x)); A.selected=[];return; }
	let cmd=actions[0].a;
	switch(cmd){
		case 'discard': ferro_process_discard(); break;
		case 'auflegen': ferro_process_group(); break;
		case 'anlegen': ferro_process_anlegen(); break;
		case 'jolly': ferro_process_jolly(); break;
		default: console.log('unknown command: '+cmd);
	}
}
function ferro_process_action_() {
	let [plorder, stage, A, fen, uplayer, pl] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer, Z.fen.players[Z.uplayer]];

	//player has selected 1 card

	//need to find out what can do with that card?
	//commands will be: discard group sequence anlegen jolly
	A.initialItem = A.items[A.selected[0]];
	Z.stage = 'commands';
	ferro_pre_action();
}
function ferro_process_command_(){

	let [plorder, stage, A, fen, uplayer, pl] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer, Z.fen.players[Z.uplayer]];

	//player has selected 1 card
	let cmd = A.items[A.selected[0]].a;
	switch(cmd){
		case 'discard': ferro_process_discard(); break;
		case 'group': ferro_prep_group(); break;
		default: console.log('unknown command: '+cmd);
	}
}
function ferro_prep_group(){
	let [plorder, stage, A, fen, uplayer] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer];

	A.command = 'group';
	Z.stage = 'group';
	ferro_pre_action();

}
function ferro_get_actions(uplayer) {
	let fen = Z.fen;
	//actions include market card exchange
	let actions = ['discard', 'group', 'sequence', 'anlegen', 'jolly'];
	//if (Config.autosubmit) actions.push('pass'); ////, 'pass'];
	let avail_actions = [];
	for (const a of actions) {
		//check if this action is possible for uplayer
		let avail = ferro_check_action_available(a, fen, uplayer);
		if (avail) avail_actions.push(a);
	}
	return avail_actions;

}
function ferro_check_action_available(a, fen, uplayer) {
	let card = Z.A.initialItem.o;
	let pl = fen.players[uplayer];
	if (a == 'discard') { return true; }
	else if (a == 'group') {

		//check if player can build a group of 3 cards with rank = card.rank
		let rank = card.rank;
		let hand = pl.hand;
		//hand needs to have at least 3 cards of rank rank
		let group = hand.filter(x => x[0] == rank);

		//find a card in hand that has rank '*'
		let wildcard = hand.find(x => x[0] == '*');
		//console.log('wildcard', wildcard?'yes':'no');
		let n = group.length + (isdef(wildcard) ? 1 : 0);
		console.log('can build group of',n)
		return n >= 3;

	} else return false;
}
function ui_get_group_items(){
	let [plorder, stage, A, fen, uplayer] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer];
	let rank = A.initialItem.o.rank;
	let items = ui_get_hand_items(uplayer);
	console.log('items',items,'rank',rank);
	
	items = items.filter(x=>x.key[0] == rank || x.key[0] == '*');
	console.log('items',items);
	reindex_items(items);
	return items;
}
function ui_get_ferro_commands() {

	let avail = ferro_get_actions(Z.uplayer);
	let items = [], i = 0;
	for (const cmd of avail) { //just strings!
		let item = { o: null, a: cmd, key: cmd, friendly: cmd, path: null, index: i };
		i++;
		items.push(item);
	}
	//console.log('available commands', items);
	return items;
}
function ferro_pre_action_() {
	let [stage, A, fen, plorder, uplayer, deck] = [Z.stage, Z.A, Z.fen, Z.plorder, Z.uplayer, Z.deck];
	//log_object(fen, 'fen', 'stage turn players');	//console.log('__________stage', stage, 'uplayer', uplayer, '\nDA', get_keys(DA));	//console.log('fen',fen,fen.players[uplayer]);
	switch (stage) {
		case 'throw': select_add_items(ui_get_hand_items(uplayer), ferro_post_discard, 'must discard', 1, 1); break;
		case 'buy_or_pass': select_add_items(ui_get_buy_or_pass_items(), ferro_ack_uplayer, 'may click top discard to buy or pass', 1, 1); break;
		case 'card_selection': select_add_items(ui_get_ferro_action_items(), ferro_process_action, 'must discard or play a set', 1, 100); break;
		// case 'commands': select_add_items(ui_get_string_items(['discard', 'group', 'sequence', 'anlegen', 'jolly']), ferro_process_command, 'must select an action', 1, 1); break;
		case 'commands': select_add_items(ui_get_ferro_commands(), ferro_process_command, 'must select an action', 1, 1); break;
		case 'group': select_add_items(ui_get_group_items(), ferro_process_group, 'must select cards to reveal', 3, 100); break;

		default: console.log('stage is', stage); break;
	}
}




















