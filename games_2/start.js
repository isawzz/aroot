onload = start;

function start() {
	DA.isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1; if (DA.isFirefox) console.log('using Firefox!')
	phpPost(null, 'assets');
}
function start_with_assets(load_last_table = false) {
	show_home_logo();
	let uname = DA.secretuser = localStorage.getItem('uname'); if (isdef(uname)) U = { name: uname }; console.log('U', U);
	// U=null;
	// load_last_table = DA.showTestButtons;
	console.log('Serverdata',Serverdata);
	if (nundef(U)) show_users(); else show_username(load_last_table);
	if (DA.showTestButtons) show('dTestButtons');
}

function autopoll(ms) { TO.poll = setTimeout(_poll, valf(ms, valf(Z.options.poll, 2000))); }
function handle_result(result, cmd) {
	if (Clientdata.AUTORESET) { Clientdata.AUTORESET = false; if (result.auto == true) { console.log('message bounced'); return; } }

	let obj;
	try { obj = JSON.parse(result); } catch { console.log('ERROR:', result); }

	//console.log('cmd', cmd, 'obj', obj);
	switch (cmd) {
		case "assets": load_assets(obj); Serverdata = {tables:obj.tables,users:obj.users}; start_with_assets(); break;
		default: console.log('unknown result');
	}
}
function load_assets(obj) {
	Config = jsyaml.load(obj.config);
	Syms = jsyaml.load(obj.syms);
	SymKeys = Object.keys(Syms);
	ByGroupSubgroup = jsyaml.load(obj.symGSG);
	C52 = jsyaml.load(obj.c52);
	Cinno = jsyaml.load(obj.cinno);
	Info = jsyaml.load(obj.info);
	Sayings = jsyaml.load(obj.sayings);
	create_card_assets_c52();
	KeySets = getKeySets();

	assertion(isdef(Config), 'NO Config!!!!!!!!!!!!!!!!!!!!!!!!');

}
function phpPost(data, cmd) {
	pollStop();

	var o = JSON.stringify({ data: valf(data, {}), cmd: cmd });

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
function pollStop() { clearTimeout(TO.poll); Clientdata.AUTORESET = true; }
function _poll() {
	assertion(isdef(U) && isdef(Z) && isdef(Z.friendly), 'poll without U or Z!!!', U, Z);
	console.log('polling');
	phpPost({ friendly: Z.friendly, uname: Z.uplayer, auto: true }, 'table');
}
function show_username(loadTable = false) {
	let uname = U.name;
	let dpic = get_user_pic(uname, 30);
	let d = mBy('dAdminRight');
	mClear(d);
	if (['felix','mimi','lauren','amanda'].includes(uname)) add_advanced_ui(d); //mAppend(d, get_advanced_menu_buttons());
	mAppend(d, get_logout_button());
	mAppend(d, dpic);

	if (is_advanced_user()) { show('dAdvanced1'); } else { hide('dAdvanced'); hide('dAdvanced1'); }
	//if (TESTING) show('dAdvanced');

	//console.log('DA.running',DA.running); //'Z',Z,'dTable',dTable,mBy('dTable'),isVisible('dTable'));

	if (!TESTING && !DA.running) {
		if (!loadTable) phpPost({ app: 'easy' }, 'tables'); //else console.log('no tables cmd! DA.running', DA.running);
		else if (!isEmpty(Serverdata.tables)) {
			//console.log('....Serverdata',Serverdata);
			onclick_table(Serverdata.tables[0].friendly);
		}
	}
}
function show_users(ms = 300) {
	let dParent = mBy('dUsers');
	mClear(dParent);

	//mStyle(dParent, { gap: 10, padding: 10 });
	for (const u of Serverdata.users) {
		if (['ally', 'bob', 'leo'].includes(u.name)) continue;
		//console.log('u',u)
		let d = get_user_pic_and_name(u.name, dParent);
		d.onclick = () => onclick_user(u.name);
		mStyle(d, { cursor: 'pointer' });
	}
	mFall(dParent, ms);
}















