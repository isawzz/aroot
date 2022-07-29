let verbose = false;
function handle_result(result, cmd) {

	//if (cmd == 'table') {console.log('result', result); } //return;}

	if (verbose) console.log('cmd', cmd, '\nresult', result); //return;
	if (result.trim() == "") return;
	let obj;
	try { obj = JSON.parse(result); } catch { console.log('ERROR:', result); }

	if (Clientdata.AUTORESET) { Clientdata.AUTORESET = false; if (result.auto == true) { console.log('message bounced'); return; } }

	if (verbose) console.log('HANDLERESULT bekommt', jsCopy(obj));
	processServerdata(obj, cmd);

	// console.log('obj.fen', obj.fen,'obj.turn', obj.turn, 'obj.a', obj.a, 'obj.b', obj.b);
	//console.log('obj.fen', obj.fen,'obj.turn', obj.turn, 'obj.a', obj.a, 'obj.b', obj.b);

	switch (cmd) {
		case "assets": load_assets(obj); start_with_assets(); break;
		case "users": show_users(); break;
		case "tables": show_tables(); break;
		case "delete_table":
		case "delete_tables": show_tables(); break;

		//************************* table *************************** */
		case "table1":
			update_table();

			//console.log('status:', Z.status)
			//console.log('Z.playerdata', Z.playerdata.map(x => `${x.name}:${object2string(x.state)}`).join(', '));
			//console.log('Z.table', Z.table);
			console.log('cmd',cmd)
			console.log('obj',obj)
			for (const k in obj) { if (isLiteral(obj[k])) { console.log(k, obj[k]); } }
			clear_timeouts();
			gamestep();

			break;


		//************************* table *************************** */
		case "gameover":
		//case "clear":
		case "table":
		case "startgame":
			update_table();

			//console.log('status:',Z.status)
			console.log('Z.playerdata', Z.playerdata.map(x => `${x.name}:${object2string(x.state)}`).join(', '));
			//console.log('Z.table', Z.table);

			//console.log('...playerdata',Z.playerdata,`turn:${Z.turn}`)
			if (Z.skip_presentation) { Z.func.state_info(mBy('dTitleLeft')); autopoll(); return; }
			//console.log('===>turn', Z.turn);
			clear_timeouts();
			gamestep();
			break;

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

	if (DA.TEST1 == true && cmd == 'table') { cmd = 'table1'; }

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

	if (isdef(obj.playerdata)) {

		let old_playerdata = valf(Serverdata.playerdata, []);
		let di = list2dict(old_playerdata, 'name');

		Serverdata.playerdata = obj.playerdata;

		Serverdata.playerdata_changed_for = [];

		for (const o of Serverdata.playerdata) {

			let old = di[o.name];
			o.state = isEmpty(o.state) ? '' : JSON.parse(o.state);

			let changed = nundef(old) ? true : !simpleCompare(old, o);
			//console.log('playerdata for', o.name, 'changed', changed);
			if (changed) { Serverdata.playerdata_changed_for.push(o.name); }
			//console.log('state', o.state, typeof o.state);
			//console.log('isEmpty?',isEmpty(o.state),'isdef',isdef(o.state),'isString?',isString(o.state));
			// if (isEmpty(o.state)) o.state = ''; else o.state = JSON.parse(o.state);

		}
		//Serverdata.playerdata.map(x=>x.state = isEmpty(x.state) ? x.state : JSON.parse(x.state));
		//console.log('playerdata processed:', Serverdata.playerdata);
		//console.log('playerdata processed:', Serverdata.playerdata);
	} else if (isdef(Serverdata.playerdata)) {
		Serverdata.playerdata_changed_for = Serverdata.playerdata.map(x => x.name);
		Serverdata.playerdata = [];
	} else Serverdata.playerdata_changed_for = [];

	for (const k in obj) {
		if (k == 'tables') Serverdata.tables = obj.tables.map(x => unpack_table(x));
		else if (k == 'table') { Serverdata.table = unpack_table(obj.table); }
		//else if (k == 'playerdata') { Serverdata.playerdata = obj.playerdata.map(x=>unpack_playerdata(obj.table); } 
		else if (k == 'users') Serverdata[k] = obj[k];
		else if (k == 'playerdata') continue;
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
	for (const k of ['players', 'fen', 'options', 'scoring']) {
		let val = table[k];
		//console.log('k',k, 'val',val, table[k]);
		if (isdef(table[k])) table[k] = JSON.parse(table[k]); else table[k] = {};
	}
	if (isdef(table.modified)) { table.timestamp = new Date(Number(table.modified)); table.stime = stringBeforeLast(table.timestamp.toString(), 'G').trim(); }
	assertion(isdef(window[table.game]), 'game function for ' + table.game + ' not defined in window');
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
	for (const wichtig of ['playerdata', 'notes', 'uplayer', 'uname', 'friendly', 'step', 'round', 'phase', 'stage', 'timestamp', 'modified', 'stime', 'mode', 'scoring']) {
		if (isdef(Z[wichtig])) Z.prev[wichtig] = jsCopy(Z[wichtig]);
	}
	Z.prev.turn = Clientdata.last_turn = Clientdata.this_turn;

	copyKeys(Serverdata, Z);

	//console.log('playerdata', Z.playerdata, 'prev', Z.prev.playerdata);

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
	//console.log('modified', modified, 'Z.prev.modified', Z.prev.modified);
	//console.log('Z.playerdata_changed_for', Z.playerdata_changed_for);
	//console.log('FORCE_REDRAW', FORCE_REDRAW);
	//console.log()
	Z.skip_presentation = isEmpty(Z.playerdata_changed_for) && !FORCE_REDRAW && friendly == Z.prev.friendly && modified <= Z.prev.modified && uplayer == Z.prev.uplayer;
	FORCE_REDRAW = false;
	//console.log('Z.skip_presentation', Z.skip_presentation);

	//if (Z.skip_presentation) { autopoll(); } else { clear_timeouts(); }

}

function autopoll(ms) { TO.poll = setTimeout(_poll, valf(ms, 2000)); }
function pollStop() { clearTimeout(TO.poll); Clientdata.AUTORESET = true; }
function stopPolling() { pollStop(); }
function ensure_polling() { }
function _poll() {
	if (nundef(U) || nundef(Z) || nundef(Z.friendly)) { console.log('poll without U or Z!!!', U, Z); return; }
	//console.log('polling...');

	show_polling_signal();

	send_or_sim({ friendly: Z.friendly, uname: Z.uplayer, auto: true }, 'table');
}





