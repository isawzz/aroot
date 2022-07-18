function handle_result(result, cmd) {
	//if (verbose) console.log('cmd', cmd, '\nresult', result); //return;
	if (result.trim() == "") return;
	let obj;
	try { obj = JSON.parse(result); } catch { console.log('ERROR:', result); }

	if (verbose) console.log('HANDLERESULT bekommt', jsCopy(obj));
	processServerdata(obj, cmd);

	switch (cmd) {
		case "assets": load_assets(obj); start_with_assets(); break;
		case "users": show_users(); break; //autopoll(0); break; //if (isdef(G)) gamestep();break;
		case "tables": show_tables(); break; //autopoll(0); break; //if (isdef(G)) gamestep(); break;
		case "delete_table":
		case "delete_tables": show_tables(); break;

		case "gameover":
		case "single":
		case "table":
		case "startgame":

			console.log('obj has keys', Object.keys(obj));
			for (const k in obj) {
				console.log('k', k, typeof obj[k], obj[k]);
			}

			update_table(); if (!Z.skip_presentation) gamestep(); break;

		// case "table":
		// case "startgame":

		// 	//console.log('Serverdata', Serverdata);
		// 	update_table(); 
		// 	//console.log('will present',!Z.skip_presentation);
		// 	if (!Z.skip_presentation) {
		// 		let [fen,uname,role,uplayer,playmode]=[Z.fen,Z.uname,Z.role,Z.uplayer,Z.playmode]
		// 		console.log('______present',Z.friendly, fen.turn);
		// 		console.log('uname',uname,role);
		// 		console.log('uplayer',uplayer,playmode);
		// 	}else{console.log('not presenting');}
		// 	break; // console.log('Z', Z); //if (!Z.skip_presentation) gamestep(); break;
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

	assertion(isdef(Config), 'NO Config!!!!!!!!!!!!!!!!!!!!!!!!');

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
	//creates and maintains Serverdata
	//console.log('obj', obj);
	if (isdef(Serverdata.table)) Serverdata.prevtable = jsCopy(Serverdata.table);

	for (const k in obj) {
		if (k == 'tables') Serverdata.tables = obj.tables.map(x => unpack_table(x));
		else if (k == 'table') { Serverdata.table = unpack_table(obj.table); } //update_current_table(); }
		else if (k == 'users') Serverdata[k] = obj[k];
		else if (cmd != 'assets') Serverdata[k] = obj[k];
	}

	//if obj.table is defined, update that same table in Serverdata.tables
	if (isdef(obj.table)) {
		assertion(isdef(Serverdata.table) && obj.table.id == Serverdata.table.id, 'table NOT in Serverdata or table id mismatch');
		let i = Serverdata.tables.findIndex(x => x.id == obj.table.id);
		//console.log('i', i)
		if (i != -1) { Serverdata.tables[i] = Serverdata.table; } else Serverdata.tables.push(Serverdata.table);
	}

	//ensure that Serverrdata.table still exists in Serverdata.tables
	else if (isdef(Serverdata.table)) {
		let t = Serverdata.tables.find(x => x.id == Serverdata.table.id);
		if (nundef(t)) delete Serverdata.table;
	}

}
function unpack_table(table) {
	//console.log('table as arriving from server', jsCopy(table));
	//console.log('table has keys', Object.keys(table));
	for (const k of ['players', 'fen', 'options', 'scoring', 'notes']) {
		let val = table[k];
		if (isdef(table[k])) table[k] = JSON.parse(table[k]); else table[k] = {};
	}
	if (isdef(table.modified)) { table.timestamp = new Date(Number(table.modified)); table.stime = stringBeforeLast(table.timestamp.toString(), 'G').trim(); }
	assertion(isdef(window[table.game], 'game function for ' + table.game + ' not defined in window'));
	if (isdef(table.game)) { table.func = window[table.game](); }
	if (isdef(table.options.mode)) { table.mode = table.options.mode; }

	//legacy code: delete action,expected,
	delete table.action; delete table.expected;

	//console.log('table after unpacking', jsCopy(table));
	return table;
}
function update_table() {
	//creates and maintains Z (open tables)
	assertion(isdef(U), 'NO USER LOGGED IN WHEN GETTING TABLE FROM SERVER!!!!!!!!!!!!!!!!!!!!', U);

	//copy all important keys to Z.prev
	if (nundef(Z) || nundef(Z.prev)) Z = { prev: {} };
	for (const wichtig of ['notes', 'uplayer', 'uname', 'friendly', 'step', 'round', 'phase', 'stage', 'timestamp', 'modified', 'stime', 'mode', 'scoring']) {
		if (isdef(Z[wichtig])) Z.prev[wichtig] = jsCopy(Z[wichtig]);
	}
	Z.prev.turn = Clientdata.last_turn = Clientdata.this_turn;

	copyKeys(Serverdata, Z);
	if (isdef(Serverdata.table)) { copyKeys(Serverdata.table, Z); Z.playerlist = Z.players; copyKeys(Serverdata.table.fen, Z); }
	assertion(isdef(Z.fen), 'no fen in Z bei cmd=table or startgame!!!', Serverdata);

	Clientdata.this_turn = Z.turn;

	set_user(U.name); //sets Z.uname

	assertion(!isEmpty(Z.turn), 'turn empty!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!', Z.turn);

	//console.log('Z', Z);
	let fen = Z.fen; //set Z.role
	Z.role = !is_playing(Z.uname, fen) ? 'spectator' : fen.turn.includes(Z.uname) ? 'active' : 'inactive';

	//set Z.uplayer
	let [uname, turn, mode, host] = [Z.uname, fen.turn, Z.mode, Z.host];
	let upl = Z.role == 'active' ? uname : turn[0];
	if (mode == 'hotseat' && turn.length > 1) { let next = get_next_human_player(Z.prev.uplayer); if (next) upl = next; }
	if (mode == 'multi' && Z.role == 'inactive' && (uname != host || is_human_player(upl))) { upl = uname; }
	set_player(upl, fen);

	//set playmode and strategy
	let pl = Z.pl;
	Z.playmode = pl.playmode; //could be human | ai | hybrid (that's for later!!!)
	if (Z.playmode != 'human') Z.strategy = pl.strategy;

	//determine wheather have to present game state!
	let [uplayer, friendly, modified] = [Z.uplayer, Z.friendly, Z.modified];

	//can skip presentation if: same table & uplayer, state newer (has been modified)
	Z.skip_presentation = !FORCE_REDRAW && friendly == Z.prev.friendly && modified <= Z.prev.modified && uplayer == Z.prev.uplayer;
	FORCE_REDRAW = false;

	if (Z.skip_presentation) { autopoll(); } else { clear_timeouts(); }

}

function autopoll(ms) { TO.poll = setTimeout(_poll, valf(ms, 2000)); }
function pollStop() { clearTimeout(TO.poll); }
function ensure_polling() { }
function _poll() {
	if (nundef(U) || nundef(Z) || nundef(Z.friendly)) { console.log('poll without U or Z!!!', U, Z); return; }
	console.log('polling...');
	phpPost({ friendly: Z.friendly }, 'table');
}





