let verbose = false;
function handle_result(result, cmd) {
	if (verbose) console.log('cmd', cmd, '\nresult', result); //return;
	if (cmd == 'users' || cmd == 'tables') console.log('!!!exec server cmd',cmd);
	if (result.trim() == "") return;
	var obj = JSON.parse(result);
	processServerdata(obj, cmd);
	switch (cmd) {
		case "coassets": load_coassets(obj); start_with_assets(); break;
		case "cousers": show_users(); break; 
	}
}

//#region helpers
function load_coassets(obj) {
	Config = jsyaml.load(obj.config);
	Syms = jsyaml.load(obj.syms);
	SymKeys = Object.keys(Syms);
	ByGroupSubgroup = jsyaml.load(obj.symGSG);
	Info = jsyaml.load(obj.info);
	KeySets = getKeySets();
	console.assert(isdef(Config), 'NO Config!!!!!!!!!!!!!!!!!!!!!!!!');

}

function phpPost(data, cmd) {
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
	if (isdef(obj.contrib)) { Serverdata.contrib = obj.contrib; }
}






























