function process_comm_setup() {

	let [fen, A, uplayer, plorder] = [Z.fen, Z.A, Z.uplayer, Z.plorder];
	assertion(fen.keeppolling == true, "keeppolling must be true for process_comm_setup!!!");
	//console.log('OK 1');

	//get keys of selected cards
	let items = A.selected.map(x => A.items[x]);
	let next = get_next_player(Z, uplayer);
	let receiver = next;
	let giver = uplayer;
	let keys = items.map(x => x.key);

	//must write to pldata (=Z.state) {giver, receiver, keys}
	Z.state = { giver, receiver, keys };

	assertion(isdef(Z.playerdata), "Z.playerdata must be defined for process_comm_setup!!!");
	let data = firstCond(Z.playerdata, x => x.name == uplayer);
	assertion(isdef(data), `MISSING: playerdata for ${uplayer}`);
	data.state = Z.state;

	//console.log('OK 2');

	//check if playerdata set for all players
	let can_resolve = true;
	for (const plname of plorder) {
		let data1 = firstCond(Z.playerdata, x => x.name == plname && !isEmpty(x.state));
		if (nundef(data1)) { can_resolve = false; break; }
	}
	if (can_resolve) {
		Z.turn = [Z.host];
		Z.stage = 104; //'next_comm_setup_stage';
		take_turn_fen_write();
	} else {
		take_turn_multi();
	}



}
function post_comm_setup_stage() {
	//console.log('OK 3');

	//erst uebertrage alle cards from pldata.state.keys to pldata.state.receiver
	let [fen, A, uplayer, plorder] = [Z.fen, Z.A, Z.uplayer, Z.plorder];
	for (const data of Z.playerdata) {
		let state = data.state;
		console.log('state',state)
		let giver = state.giver;
		let receiver = state.receiver;
		let keys = state.keys;
		console.log('giver',giver,'receiver',receiver,'keys',keys);

		keys.map(x=>elem_from_to(x,fen.players[giver].commissions,fen.players[receiver].commissions));
		//fen.players[giver].commissions = arrMinus(fen.players[giver].commissions, keys);
		//fen.players[receiver].commissions = fen.players[receiver].commissions.concat(keys); //arrPlus(fen.players[receiver].commissions, keys);
		//fen.players[receiver].commissions = arrPlus(fen.players[receiver].commissions, keys);
	}

	fen.comm_setup_num -= 1;

	if (fen.comm_setup_num == 0) {
		delete fen.comm_setup_di;
		delete fen.comm_setup_num;
		delete fen.keeppolling;
		ari_history_list([`commission trading ends`], 'commissions');

		if (exp_rumors) {
			[Z.stage, Z.turn] = [24, fen.plorder]; //fen.keeppolling = true; //[plorder[0]]];
			ari_history_list([`gossiping starts`], 'rumors');

		} else { [Z.stage, Z.turn] = set_journey_or_stall_stage(fen, Z.options, fen.phase); }
	}else{
	
		//muss auf jeden fen clear aufrufen!
		//mach dasselbe wie beim ersten mal!
		[Z.stage, Z.turn] = [23, fen.plorder]; 
	}

	//if fen.comm_setup_num is 1, then go to next stage 
	console.log('fen',fen);
	take_turn_fen_clear();
}




