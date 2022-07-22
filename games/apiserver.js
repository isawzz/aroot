let verbose = false;
function handle_result(result, cmd) {
	if (verbose) console.log('cmd', cmd, '\nresult', result); //return;
	if (result.trim() == "") return;
	let obj;
	try { obj = JSON.parse(result); } catch { console.log('ERROR:', result); }

	if (verbose) console.log('HANDLERESULT bekommt', jsCopy(obj));
	processServerdata(obj, cmd);

	switch (cmd) {
		case "assets": load_assets(obj); start_with_assets(); break;
		case "users": show_users(); break;
		case "tables": show_tables(); break;
		case "delete_table":
		case "delete_tables": show_tables(); break;
		case "collect_status":
			//console.log('collect_status', obj);
			//update_playerdata(obj);
			update_table();
			//console.log('Z.stage', Z.stage);
			if (!is_collect_mode()) {
				show_status(`waiting for ${Z.turn.join(', ')}`);

			} else if (obj.collect_complete == false) {
				let pls = obj.playerstates;
				let waiting_for = [];
				for (const val of pls) {
					let state = !isEmpty(val.state) ? JSON.parse(val.state) : null;
					//console.log('val', val, 'state', state);
					if (isEmpty(state)) { waiting_for.push(val.name); }
				}
				show_status(`waiting for ${waiting_for.join(', ')}`);
			} else { show_status('COMPLETE!'); }
			break;
		//************************* table *************************** */
		case "gameover":
		case "clear":
		case "table":
		case "startgame":
			update_table();
			//console.log('skip', Z.skip_presentation)
			let is_collect = check_collect(obj);

			//console.log('haaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1', is_collect);
			if (is_collect) { return; }

			//console.log('haaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa2')
			if (Z.skip_presentation) { autopoll(); return; }


			//console.log('haaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa3')

			//console.log('WILL PRESENT! obj has keys', Object.keys(obj));
			//for (const k in obj) { if (['table', 'tables', 'users'].includes(k)) continue; console.log('k', k, typeof obj[k], obj[k]); }

			clear_timeouts();
			gamestep();
			break;

	}
}

//#region helpers
function check_collect(obj) {
	//erwarte dass obj ein collect_complete und ein too_late hat!
	//console.log('notes', Z.notes)
	if (nundef(obj.collect_complete)) return false;
	if (Z.mode != 'multi') { console.log('COLLECT NUR IN MULTI PLAYER MODE!!!!!!'); return false; }
	if (!startsWith(Z.notes,'indiv') && Z.notes != 'lock') { return false; } //console.log('!!!notes is NOT indiv or lock'); return false; }
	assertion(isdef(obj.playerdata), 'no playerdata but collect_complete');

	let collect_complete = obj.collect_complete;
	let too_late = obj.too_late;
	//console.log('notes', Z.notes)
	//console.log('collect_open', collect_complete, 'too_late', too_late);

	if (i_am_acting_host() && collect_complete) {

		//console.log('collect_open: i am host, collect_complete, was nun???');
		assertion(obj.table.fen.turn.length == 1 && obj.table.fen.turn[0] == U.name && U.name == obj.table.fen.acting_host, 'collect_open: acting host is NOT the one in turn!');
		assertion(isdef(Z.func.post_collect), 'post_collect not defined for game ' + obj.table.game);

		//Z.playerdata = obj.playerdata;
		//console.log('playerdata vorher', Z.playerdata);
		if (Z.fen.end_cond == 'all') for (const p of Z.playerdata) { p.state = JSON.parse(p.state); }
		else if (Z.fen.end_cond == 'first') {
			for (const p of Z.playerdata) {
				if (isdef(p.state)) {
					p.state = JSON.parse(p.state);
					//console.log('*** winning player is', p.name, p.state);
				}

			}
			//console.log('playerdata nachher', Z.playerdata);
		}
		Z.func.post_collect();


	} else if (collect_complete && (Z.turn.length > 1 || Z.turn[0] != Z.fen.acting_host)) {
		Z.turn = [Z.fen.acting_host];
		take_turn_single();
		//console.log('collect_open: collect_complete, bin aber nicht der host! was nun???');

	} else if (i_am_acting_host()) {
		//console.log('collect_open: i am host, bin aber nicht collect_complete, was nun???');
		//autopoll();
		return false;

	} else {
		//console.log('collect_open: bin nicht der host, bin nicht collect_complete, was nun???');
		//autopoll();
		return false;

	}
	return true;

}
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

	if (isdef(obj.playerdata)){
		Serverdata.playerdata = obj.playerdata;
		for(const o of Serverdata.playerdata){
			//console.log('state', o.state, typeof o.state);
			//console.log('isEmpty?',isEmpty(o.state),'isdef',isdef(o.state),'isString?',isString(o.state));
			if (isEmpty(o.state)) o.state = ''; else  o.state = JSON.parse(o.state);
		
		}
		//Serverdata.playerdata.map(x=>x.state = isEmpty(x.state) ? x.state : JSON.parse(x.state));
		//console.log('playerdata processed:', Serverdata.playerdata);
		//console.log('playerdata processed:', Serverdata.playerdata);
	}

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
	//console.log('modified', modified, 'Z.prev.modified', Z.prev.modified);
	Z.skip_presentation = !FORCE_REDRAW && friendly == Z.prev.friendly && modified <= Z.prev.modified && uplayer == Z.prev.uplayer;
	FORCE_REDRAW = false;

	//if (Z.skip_presentation) { autopoll(); } else { clear_timeouts(); }

}

function autopoll(ms) { TO.poll = setTimeout(_poll, valf(ms, 2000)); }
function pollStop() { clearTimeout(TO.poll); }
function ensure_polling() { }
function _poll() {
	if (nundef(U) || nundef(Z) || nundef(Z.friendly)) { console.log('poll without U or Z!!!', U, Z); return; }
	//console.log('polling...');
	phpPost({ friendly: Z.friendly }, 'table');
}





