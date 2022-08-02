
function process_rumors_setup() {

	let [fen, A, uplayer, plorder, data] = [Z.fen, Z.A, Z.uplayer, Z.plorder, Z.uplayer_data];

	let items = A.selected.map(x => A.items[x]);
	let receiver = firstCond(items, x => plorder.includes(x.key)).key;
	let rumor = firstCond(items, x => !plorder.includes(x.key));
	if (nundef(receiver) || nundef(rumor)) {
		select_error('you must select exactly one player and one rumor card!');
		return;
	}

	//receiver gets that rumor, aber die verteilung ist erst wenn alle rumors verteilt sind!
	//das geht nicht!!!!!!!!!!!!!!!!!!!!!!! weil ich ja nicht in die fen schreiben kann!!!!!!!
	assertion(isdef(data), 'no data for player ' + uplayer);
	sss(); //console.log('data',data);


	//assertion(isdef(data.state.remaining), 'no state.remaining for player ' + uplayer);

	let remaining = arrMinus(data.state.remaining, rumor.key); //fen.players[uplayer].rumors = arrMinus(fen.players[uplayer].rumors, rumor.key);

	// lookupAddToList(fen, ['di', receiver], rumor.key);
	// lookupAddToList(fen, ['receivers'], receiver);
	lookupAddToList(data, ['state', 'di', receiver], rumor.key);
	lookupAddToList(data, ['state', 'receivers'], receiver);
	lookupSetOverride(data, ['state', 'remaining'], remaining);

	console.log('state nach auswahl von', rumor.key, 'fuer', receiver, data.state);

	Z.state = data.state; //genau DAS muss gesendet werden!!!!!


	//so geht es schon mal NICHT weil der state ja successively geupdated wird!!!!
	// let data = firstCond(Z.playerdata, x => x.name == uplayer);
	// data.state = Z.state;

	//console.log('di', fen.di)

	//der rest wird anders!
	//check can_resolve (das ist weenn ALLE rumors von ALLEN spielern verteilt sind!)
	ari_try_resolve_rumors_distribution();
}
function ari_try_resolve_rumors_distribution() {
	if (!i_am_host()) return;
	console.log('HAAAAAAAAAAAAAAAAAAAAAAAA')
	let can_resolve = true;
	for (const pldata of Z.playerdata) {
		//let data1 = pldata;
		console.log('pldata', pldata, pldata.state, pldata.remaining);
		if (isEmpty(pldata.state)) { console.log('empty, break'); can_resolve = false; break; }

		else if (!isEmpty(pldata.state.remaining)) { console.log('some remaining!, break'); can_resolve = false; break; }
		//let receivers = data1.receivers;		if (receivers.length < Z.plorder.length-1) { can_resolve = false; break; }
	}

	console.log('can_resolve', can_resolve);
	if (can_resolve) {
		console.log('HAAAAAAAAAAAAAAAAAALLLLLLLLLLLLLLLOOOOOOOOOOOOOOOOOOOOO');
		Z.turn = [Z.host];
		Z.stage = 105; //'next_rumors_setup_stage';
		take_turn_fen_write();
	}
}
function post_rumor_setup() {
	let [fen, A, uplayer, plorder] = [Z.fen, Z.A, Z.uplayer, Z.plorder];

	for (const plname of plorder) { fen.players[plname].rumors = []; }


	for (const plname of plorder) {
		//if (plname == uplayer) continue;
		//let pl = fen.players[plname];
		let data = firstCond(Z.playerdata, x => x.name == plname);
		let di = data.state.di;
		console.log('di', plname, di);
		for (const k in di) arrPlus(fen.players[k].rumors, di[k]);
		// 	assertion(isdef(fen.rumor_setup_di[plname]), 'no rumors for ' + plname);
		// 	pl.rumors = fen.rumor_setup_di[plname];
	}
	// delete fen.rumor_setup_di;
	// delete fen.rumor_setup_receivers;
	ari_history_list([`gossiping ends`], 'rumors');


	[Z.stage, Z.turn] = set_journey_or_stall_stage(fen, Z.options, fen.phase);
	take_turn_fen_clear();
}







