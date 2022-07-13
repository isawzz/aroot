let verbose = false;
function handle_result(result, cmd) {
	//if (verbose) console.log('cmd', cmd, '\nresult', result); //return;
	if (result.trim() == "") return;

	// var obj = JSON.parse(result);
	let obj;
	try {
		obj = JSON.parse(result);
	} catch {
		console.log('ERROR:', result);
	}

	//delete obj.tables;

	//console.log('___cmd=' + cmd, '\nkeys sent', get_keys(obj));
	if (verbose) console.log('HANDLERESULT bekommt', jsCopy(obj)); //log_object(obj);
	processServerdata(obj, cmd);
	assertion(isdef(Z) || nundef(obj.table), 'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ');

	//ack is done sequentially from now on!!!!!!!!
	// //*** NUR HIER WIRD SERVER AKKU PROCESSED!!! */
	// DA.need_resend = nundef(Z) ? false :
	// 	Z.game == 'bluff' ? bluff_update_ack() :
	// 		Z.game == 'ferro' ? ferro_update_ack() : false;
	// if (DA.need_resend) { turn_send_move_update(); return; }
	show_status(valf(Serverdata.status, `cmd: ${cmd} RESEND:${DA.need_resend}`));

	//console.log('=>Serverdata', Serverdata);
	switch (cmd) {
		case "assets": load_assets(obj); start_with_assets(); break;
		case "users": show_users(); break; //autopoll(0); break; //if (isdef(G)) gamestep();break;
		case "tables": show_tables(); break; //autopoll(0); break; //if (isdef(G)) gamestep(); break;
		case "delete_past":
		case "delete_table":
		case "delete_tables": show_tables(); break;
		case "gameover": //show_tables(); break;
		case "move":
		case "table":
		case "startgame": if (!Z.skip_presentation) gamestep(); break;
	}
}

//#region helpers
function load_assets(obj) {
	Config = jsyaml.load(obj.config);
	Syms = jsyaml.load(obj.syms);
	SymKeys = Object.keys(Syms);
	ByGroupSubgroup = jsyaml.load(obj.symGSG);
	C52 = jsyaml.load(obj.c52);
	Cinno = jsyaml.load(obj.cinno);
	Info = jsyaml.load(obj.info);
	create_card_assets_c52();
	KeySets = getKeySets();
	console.assert(isdef(Config), 'NO Config!!!!!!!!!!!!!!!!!!!!!!!!');

}

function phpPost(data, cmd) {
	clear_transaction();

	pollStop();
	var xml = new XMLHttpRequest();
	loader_on();
	xml.onload = function () {
		if (xml.readyState == 4 || xml.status == 200) {
			loader_off();
			handle_result(xml.responseText, cmd);
		}
	}
	var o = {};
	o.data = valf(data, {});
	o.cmd = cmd;
	o = JSON.stringify(o);
	xml.open("POST", "api.php", true);
	xml.send(o);
}

function processServerdata(obj, cmd) {

	if (isdef(obj.users)) { Serverdata.users = obj.users; }

	for (const k in obj) {
		if (k == 'tables') Serverdata.tables = obj.tables.map(x => unpack_table(x));
		else if (k == 'table') { Serverdata.table = unpack_table(obj.table); update_current_table(); }
		else if (cmd != 'assets') Serverdata[k] = obj[k];
	}

	//update table in Serverdata.tables
	//make sure that table is same in Serverdata.tables and Serverdata.table!!!
	if (isdef(obj.table) && isdef(Serverdata.tables) && nundef(obj.tables)) {
		let t = firstCond(Serverdata.tables, x => x.friendly == obj.table.friendly);
		if (t) {
			//replace t in Serverdata by obj.table
			let idx = Serverdata.tables.indexOf(t);
			Serverdata.tables.splice(idx, 1, obj.table);
			//console.log('==>OP:',obj.table.friendly,'\n',obj.table.fen,'\n--- statt ---\n',t.fen);
		} else {
			Serverdata.tables.unshift(obj.table);
		}
	}

	//make sure Serverdata.table exists
	if (nundef(obj.table) && isdef(Serverdata.table) && !firstCond(Serverdata.tables, x => x.friendly == Serverdata.table.friendly)) {
		//console.log('===>table', Serverdata.table.friendly, 'does not exist!');
		delete (Serverdata.table);
	}
}
function unpack_table(o) {

	//console.log('table as arriving from server', jsCopy(o));
	for (const k of ['players', 'fen', 'expected', 'action', 'options', 'scoring', 'notes']) {
		let val = o[k];
		//o[k] = isdef(val)? isNumber(val)? Number(val):JSON.parse(val):{};
		if (isdef(o[k])) o[k] = JSON.parse(o[k]); else o[k] = {};
		if (k == 'expected') {
			//console.log('turn is set to expected', jsCopy(o[k]));
			Clientdata.last_turn = Clientdata.this_turn; Clientdata.this_turn = o.turn = get_keys(o[k]);
		}
	}
	if (isdef(o.step)) o.step = Number(o.step);
	if (isdef(o.round)) o.round = Number(o.round);
	if (isdef(o.stage)) { Clientdata.last_stage = Clientdata.this_stage; Clientdata.this_stage = o.stage; }
	if (isdef(o.modified)) {
		o.timestamp = new Date(Number(o.modified));
		//console.log('o.timestamp',o.timestamp);
		o.stime = stringBeforeLast(o.timestamp.toString(), 'G').trim();
		//console.log('timestamp',o.stime);
	}
	//console.log('o.game',o)
	if (isdef(o.game)) { if (nundef(window[o.game])) o.game='fritz';o.func = window[o.game](); }
	if (isdef(o.options.mode)) { o.mode = o.options.mode; }
	if (lookup(o, ['fen', 'plorder'])) o.plorder = lookup(o, ['fen', 'plorder']);
	//console.log('table after unpacking', jsCopy(o));
	return o;
}

function update_current_table() {

	let o = Serverdata.table;
	assertion(isdef(U), 'NO USER LOGGED IN WHEN GETTING TABLE FROM SERVER!!!!!!!!!!!!!!!!!!!!', U, o);
	// if (!Z) Z = {};
	if (nundef(Z) || nundef(Z.prev)) Z = { prev: {} };
	assertion(isdef(Z), 'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ', Z);
	set_user(U.name);
	//console.log('uname should be set to ', U.name);

	//HISTORY: update prev turn,stage,step,phase,round,modified
	//DA.prevturn = isdef(Z.prev.turn)?jsCopy(Z.prev.turn):null; console.log('DA.prevturn',DA.prevturn);

	for (const wichtig of ['notes', 'uplayer', 'friendly', 'step', 'round', 'phase', 'stage', 'timestamp', 'modified', 'stime', 'mode', 'scoring']) {
		if (isdef(Z[wichtig])) Z.prev[wichtig] = jsCopy(Z[wichtig]);
	}
	Z.prev.turn = Clientdata.last_turn;

	//paste data to Z:
	copyKeys(o, Z, {uname:true});  //muss uname excepten weil sonst haut es in hotseat mode nicht hin bei TESTING!
	//console.log('writing notes:',Z.notes[Z.uname])

	//now determine which player's view I need to present!
	let [mode, turn, uname, plorder, fen, host] = [Z.mode, Z.turn, Z.uname, Z.plorder, Z.fen, Z.host];
	//if mode is multi and U is in turn, current player (==player_presented) should be U

	//console.log('=>after copyKeys(o,Z): turn', Z.turn);
	assertion(!isEmpty(turn), 'turn empty!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!', turn, fen, plorder);

	//role refers to what role logged in user has in the presented table
	Z.role = !plorder.includes(uname) ? 'spectator' : turn.includes(uname) ? 'active' : 'inactive';

	if (Z.game == 'fritz' && Z.role == 'spectator' && isdef(Z.fen.roundorder) && Z.fen.roundorder.includes(uname)){
		Z.role = 'inactive';
	} 

	let upl = Z.role == 'active' ? uname : turn[0];

	if (mode == 'hotseat' && turn.length > 1) { let next = get_next_human_player(Z.prev.uplayer); if (next) upl = next; }

	//console.log('turn', turn, 'upl', upl, 'plorder', plorder, 'uname', uname, 'role', Z.role);

	// if (mode == 'hotseat'){ // && fen.players[upl].playmode!='bot') {
	// 	if (isdef(Z.prev.turn) && sameList(turn, Z.prev.turn) && turn.length > 1) {
	// 		if (nundef(fen.ihotseat)) fen.ihotseat = 0;
	// 		let i = fen.ihotseat;
	// 		upl = turn[i];
	// 		fen.ihotseat = (i + 1) % fen.plorder;
	// 	}else fen.ihotseat=0;
	// } else 

	if (mode == 'multi' && Z.role == 'inactive' && (uname != host || is_human_player(upl))) {
		upl = uname;
	}
	set_player(upl, fen);
	//console.log('upl',upl,'mode',mode,'role',Z.role,'turn',turn,'host',host,'uname',uname);

	let [uplayer, pl] = [Z.uplayer, Z.pl];
	Z.playmode = pl.playmode; //could be human | ai | hybrid (that's for later!!!)
	//console.log('==>Z.playmode',Z.playmode,pl);
	if (Z.playmode != 'human') Z.strategy = pl.strategy;

	//determine wheather have to present game state!
	let [friendly, modified] = [Z.friendly, Z.modified];

	//can skip presentation if: same table & uplayer, no newer modified
	Z.skip_presentation = !FORCE_REDRAW && friendly == Z.prev.friendly && modified <= Z.prev.modified && uplayer == Z.prev.uplayer;
	FORCE_REDRAW = false;

	//console.log('Z.skip_presentation', Z.skip_presentation, 'FORCE_REDRAW', FORCE_REDRAW, 'Z.playmode', Z.playmode, 'Z.friendly', Z.friendly, 'Z.prev.modified', Z.prev.modified, 'Z.modified', Z.modified, 'Z.prev.uplayer', Z.prev.uplayer, 'Z.uplayer', Z.uplayer);

	if (Z.skip_presentation) {

		show_status(`nothing new in ${Z.friendly}`);
		// show('bPauseContinue');

		//activate the following to stop polling after some time of inactivity!!!!!!!!!!!
		const STOP_POLLING_AFTER = 3000;
		if (nundef(DA.noshow)) DA.noshow = 1; else DA.noshow++; if (DA.noshow >= STOP_POLLING_AFTER) onclick_stoppolling(); //damit er nicht dauernd weiter pollt!

		autopoll();

	} else {
		DA.noshow = 0;
		delete DA.sperre;
		clear_timeouts();

	}

}










