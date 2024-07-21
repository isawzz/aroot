let verbose = false;
function handle_result(result, cmd) {
	if (verbose) console.log('cmd', cmd, '\nresult', result); //return;
	if (result.trim() == "") return;
	var obj = JSON.parse(result);
	processServerdata(obj, cmd);
	show_status(Serverdata.status);
	//console.log('=>Serverdata', Serverdata);
	switch (cmd) {
		case "assets": load_assets(obj); start_with_assets(); break;
		case "users": show_users(); autopoll(0); break; //if (isdef(G)) gamestep();break;
		case "tables": show_tables(); autopoll(0); break; //if (isdef(G)) gamestep(); break;
		case "delete_past":
		case "delete_table":
		case "delete_tables": show_tables(); break;
		case "gameover": show_tables(); break;
		case "move":
		case "table":
		case "startgame": if (isVisible('dTables')) show_tables(); gamestep(); break;
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
	//inno_create_card_assets();
	ari_create_card_assets('rbgyop');
	KeySets = getKeySets();
	console.assert(isdef(Config), 'NO Config!!!!!!!!!!!!!!!!!!!!!!!!');

}
function phpPost(data, cmd) {
	pollStop();
	var xml = new XMLHttpRequest();
	// var loader_holder = mBy("loader_holder");
	// loader_holder.className = "loader_on";
	xml.onload = function () {
		if (xml.readyState == 4 || xml.status == 200) {
			// loader_holder.className = "loader_off";
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
	for (const k in obj) {
		if (k == 'tables') Serverdata.tables = obj.tables.map(x => unpack_table(x));
		else if (k == 'table') Serverdata.table = unpack_table(obj.table);
		else if (cmd != 'assets' || k == 'users') Serverdata[k] = obj[k];
	}

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

	if (nundef(obj.table) && isdef(Serverdata.table) && !firstCond(Serverdata.tables, x => x.friendly == Serverdata.table.friendly)) {
		//console.log('===>table', Serverdata.table.friendly, 'does not exist!');
		delete (Serverdata.table);
	}
}
function unpack_table(o) {
	for (const k of ['players', 'fen', 'expected', 'action', 'options', 'scoring', 'notes']) {
		let val = o[k];
		//o[k] = isdef(val)? isNumber(val)? Number(val):JSON.parse(val):{};
		if (isdef(o[k])) o[k] = JSON.parse(o[k]); else o[k] = {};
		if (k == 'expected') o.turn = get_keys(o[k]);
	}
	if (isdef(o.step)) o.step = Number(o.step);
	if (isdef(o.round)) o.round = Number(o.round);
	if (isdef(o.modified)) {
		o.timestamp = new Date(Number(o.modified));
		//console.log('o.timestamp',o.timestamp);
		o.stime = stringBeforeLast(o.timestamp.toString(), 'G').trim();
		//console.log('timestamp',o.stime);
	}
	console.log('game',o.game)
	if (isdef(o.game)) { o.func = window[o.game](); }
	if (isdef(o.options.mode)) { o.mode = o.options.mode; }
	if (lookup(o, ['fen', 'plorder'])) o.plorder = lookup(o, ['fen', 'plorder']);
	return o;
}










