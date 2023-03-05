function accuse() {
	function state_info() { return; }
	function setup(players, options) {
		//console.log('SETUP!!!!!!!!!!!!!!!!!!!')
		let fen = { players: {}, plorder: jsCopy(players), history: [], num: options.num };
		//shuffle(fen.plorder);
		let starter = fen.starter = fen.plorder[0];
		let deck_ballots = create_fen_deck('n'); shuffle(deck_ballots);
		let num = Math.ceil(players.length / 2)
		let deck_identities = fen.deck_identities = [];
		let ranks = 'KQJT98765432A';
		for (let i = 0; i < num; i++) { deck_identities.push(ranks[i] + 'Hh'); deck_identities.push(ranks[i] + 'Sh'); }
		shuffle(deck_identities);

		tb = {
			5: ['2', 'T', 7],
			6: ['A', 'T', 6],
			7: ['A', 'T', 5],
			8: ['A', 'T', 5],
			9: ['A', 'K', 5],
			10: ['A', 'K', 5],
			11: ['A', 'K', 4],
			12: ['A', 'K', 4],
			13: ['A', 'K', 4],
		};
		let [rmax, rmin, handsize] = tb[players.length];
		let [imin, imax] = [ranks.indexOf(rmin), ranks.indexOf(rmax)];
		//console.log('N',players.length,'minrank',imin,'maxrank',imax)
		deck_ballots = deck_ballots.filter(x => {
			let i = ranks.indexOf(x[0])
			return i>=imin && i<=imax;
		});
		fen.deck_ballots=deck_ballots;
		fen.handsize = handsize;
		//console.log('deck_ballots:::',deck_ballots.length);

		for (const plname of players) {
			let pl = fen.players[plname] = {
				score: 0,
				name: plname,
				idright: deck_deal(deck_identities, 1)[0],
				hand: deck_deal(deck_ballots, handsize),
				color: get_user_color(plname),
			};
		}

		//each player gets idright = idleft of next player
		for (let i = 0; i < players.length; i++) {
			let j = (i + 1) % players.length;
			fen.players[players[i]].idleft = fen.players[players[j]].idright;
		}

		[fen.phase, fen.stage, fen.step, fen.turn] = ['one', 'write', 0, jsCopy(fen.plorder)];
		return fen;
	}
	function check_gameover() { return false; }
	return { state_info, setup, present: accuse_present, check_gameover, activate_ui: accuse_activate };
}

function accuse_present(dParent) {
	let [fen, ui, stage, uplayer] = [Z.fen, UI, Z.stage, Z.uplayer];
	let [dOben, dOpenTable, dMiddle, dRechts] = tableLayoutMR(dParent, 1, 0); ///tableLayoutOMR(dParent, 5, 1);
	let dt = dTable = dOpenTable; clearElement(dt); mCenterFlex(dt);

	accuse_stats(dt);

	let pl = fen.players[uplayer];
	//console.log('pl', pl)
	let d = mDiv(dt)
	let idleft = ari_get_card(pl.idleft, 100); //ui.idleft = ui_type_market([pl.idleft], dt, { maleft: 12 }, `players.${uplayer}.idleft`, 'id', ari_get_card);
	let idright = ari_get_card(pl.idright, 100); //ui.idleft = ui_type_market([pl.idleft], dt, { maleft: 12 }, `players.${uplayer}.idleft`, 'id', ari_get_card);
	//console.log('idleft', idleft)
	//mDiv(dt,{wmin:12})

	mLinebreak(dt,10)
	
	//let discard = ui_type_deck(fen.deck_ballots,dt);
	//mDiv(dt,{wmin:50})
	//mLinebreak(dt,10)

	mAppend(dt, iDiv(idleft))
	//mDiv(dt,{wmin:24})
	let membership = ui_type_market([],dt,{wmin:300})
	//mDiv(dt,{wmin:12})
	mAppend(dt, iDiv(idright))

	mLinebreak(dt, 10);

	lookupSetOverride(ui,['players',uplayer,'hand'],ui_type_hand(pl.hand,dt,{pleft:25},`players.${uplayer}.hand`));
	console.log('ui',ui)

}

function accuse_activate() {
	console.log('activating for', Z.uplayer)
	let [stage, A, fen, phase, uplayer] = [Z.stage, Z.A, Z.fen, Z.phase, Z.uplayer];

	show_stage();
	stage = 'ball'
	switch (stage) {
		case 'ball': select_add_items(ui_get_hand_items(uplayer), post_select, 'may select card to play',0,1); break;
		default: 
	}
}

function accuse_activate() {
	let [pldata, stage, A, fen, phase, uplayer] = [Z.playerdata, Z.stage, Z.A, Z.fen, Z.phase, Z.uplayer];

	//stages: write, select, round
	let donelist = Z.playerdata.filter(x => isDict(x.state));
	let complete = donelist.length == Z.plorder.length;
	let resolvable = uplayer == fen.starter && complete;
	//console.log('donelist',donelist.length
	let waiting = !resolvable && isdef(donelist.find(x => x.name == uplayer));
	console.log(uplayer, stage, 'done', donelist, 'complete', complete, 'waiting', waiting);

	Z.isWaiting = false;
	if (waiting) {
		//either results are not all in or am NOT the starter (=admin)
		mDiv(dTable, {}, null, 'WAITING FOR PLAYERS TO COMPLETE....');
		if (complete) {
			//turn is transferred to starter
			Z.turn = [fen.starter];
			if (Z.mode != 'multi') take_turn_waiting();

		}
		Z.isWaiting = true;
		autopoll();
	} else if (stage == 'write' && resolvable) {
		assertion(uplayer == fen.starter, 'NOT THE STARTER WHO COMPLETES THE STAGE!!!')
		let start = fen.saying.start.toLowerCase();
		let sentences = [];
		for (const pldata of Z.playerdata) {
			let plname = pldata.name;
			let text = start + ' ' + pldata.state.text;
			sentences.push({ plname: plname, text: text.toLowerCase() });
		}
		sentences.push({ plname: '', text: start + ' ' + fen.saying.end.toLowerCase() });
		fen.sentences = shuffle(sentences);
		Z.turn = jsCopy(Z.plorder);
		Z.stage = 'select';
		take_turn_fen_clear();

	} else if (stage == 'write') {
		let d = mCreate('form');
		let dt = dTable;
		mAppend(dt, d);
		d.autocomplete = "off";
		d.action = "javascript:void(0);";
		mDiv(d, { fz: 20 }, 'dForm', fen.saying.start.toLowerCase() + '...');
		Z.form = d;
		mLinebreak(d, 10);
		mInput(d, { wmin: 600 }, 'i_end', 'enter ending');
		d.onsubmit = accuse_submit_card;
	} else if (stage == 'select' && resolvable) {
		assertion(uplayer == fen.starter, 'NOT THE STARTER WHO COMPLETES THE STAGE!!!')
		let d = mDiv(dTable, {});
		fen.result = {};
		for (const pldata of Z.playerdata) {
			let selecting = pldata.name;
			let selected = pldata.state.plname;
			let text = pldata.state.text;
			//console.log('selected',selected, typeof selected);
			if (isEmpty(selected)) { //} || selected === null || !selected || nundef(selected)){ // nundef(selected)) {
				console.log('REINGEGANGEN!!!!!!!!!!!!!!')
				fen.players[selecting].score += 1;
				selected = 'correct';
			} else if (selecting != selected) {
				//console.log('selecting', selecting, 'selected', selected ?? 'null')
				fen.players[selected].score += 1;
			}
			fen.result[selecting] = { plname: selected, text: text };
			//that player gets a point
			//selections.push({ plname: plname, text: text.toLowerCase() });

		}
		delete fen.sentences;
		Z.turn = jsCopy(Z.plorder);
		Z.stage = 'round';
		take_turn_fen_clear();
	} else if (stage == 'select') {
		let d = mDiv(dTable, {});
		let i = 1;
		for (const s of fen.sentences) {
			let d1 = mDiv(d, { fz: 20, hline: 30 }, `dsent_${s.plname}`, '' + (i++) + ') ' + s.text, 'hop1');
			d1.onclick = accuse_select_sentence;
		}
	} else if (stage == 'round' && resolvable) {
		assertion(uplayer == fen.starter, 'NOT THE STARTER WHO COMPLETES THE STAGE!!!')
		delete fen.result;
		Z.turn = jsCopy(Z.plorder);
		fen.index++;
		fen.saying = Sayings[fen.index];
		Z.stage = 'write';
		take_turn_fen_clear();
	} else if (stage == 'round') {
		let d = mDiv(dTable, {});
		for (const plname in fen.result) {
			let o = fen.result[plname];
			let d1 = mDiv(d, { fz: 20, hline: 30 }, null, `${plname} selected ${o.plname}: ${o.text}`);
		}
		mLinebreak(dTable, 12)
		mButton('WEITER', accuse_onclick_weiter, dTable, {}, ['donebutton', 'enabled']);
	}else{
		console.log('Z',Z)
		alert('PROBLEM!!!')
	}
}
function accuse_onclick_weiter() {
	Z.state = { plname: Z.uplayer };
	take_turn_multi();
}
function accuse_select_sentence(ev) {
	if (!uiActivated) return;
	let text = ev.target.innerHTML;
	let plname = stringAfter(ev.target.id, 'dsent_')
	//console.log('player', Z.uplayer, 'prefers', text, '(' + plname + ')');

	Z.state = { plname: plname, text: text };
	take_turn_multi();

}
function accuse_submit_card(ev) { ev.preventDefault(); let text = mBy('i_end').value; Z.state = { text: text }; take_turn_multi(); }


function post_select(){ console.log('post_select...')}
function accuse_stats(d) {
	let players = Z.fen.players;
	//console.log('uplayer',Z.uplayer)
	let d1 = mDiv(d, { display: 'flex', 'justify-content': 'center', 'align-items': 'space-evenly' });
	for (const plname of get_present_order()) {
		let pl = players[plname];
		let onturn = Z.turn.includes(plname);
		let sz = 50; //onturn?100:50;
		let bcolor = plname == Z.uplayer ? 'lime' : 'silver';
		let border = pl.playmode == 'bot' ? `double 5px ${bcolor}` : `solid 5px ${bcolor}`;
		let rounding = pl.playmode == 'bot' ? '0px' : '50%';
		let d2 = mDiv(d1, { margin: 4, align: 'center' }, null, `<img src='../base/assets/images/${plname}.jpg' style="border-radius:${rounding};display:block;border:${border};box-sizing:border-box" class='img_person' width=${sz} height=${sz}>${get_player_score(plname)}`);
	}
}
