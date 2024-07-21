let verbose = false;
function handle_result(result, cmd) {
	//console.log('handle_result', cmd);

	if (Clientdata.AUTORESET) {Clientdata.AUTORESET = false; if (cmd == 'autopoll'){console.log('bounce back'); return;}}

	if (verbose) console.log('cmd', cmd, '\nresult', result); //return;
	if (result.trim() == "") return;
	let obj;
	try { obj = JSON.parse(result); } catch { console.log('ERROR:', result); }

	DA.result = jsCopy(obj); //console.log('DA.result', DA.result);
	processServerdata(obj, cmd);

	switch (cmd) {
		case "assets": load_assets(obj); Z = jsCopy(Serverdata); start_with_assets(); break;
		case 'reset': ensure_Z(); host_update(); break;
		case 'update_fen': ensure_Z(); host_update(); break;
		case 'update_player': ensure_Z(); guest_update(); break;
		case 'autopoll': ensure_Z(); if (Clientdata.role == 'host') host_update(); else guest_update(); break;
		default: 'unknown cmd' + cmd;
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
	KeySets = getKeySets();

	assertion(isdef(Config), 'NO Config!!!!!!!!!!!!!!!!!!!!!!!!');

}
function phpPost(data, cmd) {

	//console.log('poll')
	pollStop();

	var o = {};
	o.data = valf(data, {});
	o.cmd = cmd;
	o = JSON.stringify(o);

	if (DA.simulate) {
		sendSIMSIM(o, true, true);
		FORCE_REDRAW = true;
		return;
	}

	var xml = new XMLHttpRequest();
	loader_on();
	xml.onload = function () {
		if (xml.readyState == 4 || xml.status == 200) {
			loader_off();
			handle_result(xml.responseText, cmd);
		} else { console.log('WTF?????') }
	}
	xml.open("POST", "api.php", true);
	xml.send(o);
}

function processServerdata(obj, cmd) {
	//creates and maintains Serverdata
	//console.log('obj', obj);
	if (isdef(Serverdata.table)) Serverdata.prevtable = jsCopy(Serverdata.table);

	if (cmd != 'assets') copyKeys(obj, Serverdata);

	if (isdef(obj.table)) {
		let t = obj.table;
		let tnew = {
			friendly: t.friendly,
			fen: isdef(t.fen) ? if_stringified(t.fen) : {},
			options: isdef(t.options) ? if_stringified(t.options) : {},
		}
		if (isdef(t.modified)) { tnew.modified = Number(t.modified); tnew.timestamp = new Date(tnew.modified); tnew.stime = stringBeforeLast(tnew.timestamp.toString(), 'G').trim(); }
		Serverdata.table = tnew;
	}

	//console.log('obj.playerdata', obj.playerdata);
	if (isdef(obj.playerdata)) {
		let pldata = if_stringified_or_list(obj.playerdata);
		//console.log('pldata', pldata);
		pldata.map(x => x.state = nundef(x.state) ? { green: 0, red: 0 } : if_stringified(x.state));
		Serverdata.playerdata = pldata;
	}
}

function pollStop() { clearTimeout(TO.poll); Clientdata.AUTORESET = true; }
function autopoll() {
	pollStop();
	TO.poll = setTimeout(_poll, 1000);
}
function _poll() {
	phpPost({ friendly: 'feedback' }, 'autopoll');
}












