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
	console.log('Serverdata', Serverdata);
	if (nundef(U)) show_users(); else show_username(load_last_table);
	if (DA.showTestButtons) show('dTestButtons');
}

function autopoll(ms) { TO.poll = setTimeout(_poll, valf(ms, valf(Z.options.poll, 2000))); }
function clear_screen() { arrChildren('dScreen').map(x=>mClear(x)); }
function handle_result(result, cmd) {
	if (Clientdata.AUTORESET) { Clientdata.AUTORESET = false; if (result.auto == true) { console.log('message bounced'); return; } }

	let obj;
	try { obj = JSON.parse(result); } catch { console.log('ERROR:', result); }

	//console.log('cmd', cmd, 'obj', obj);
	switch (cmd) {
		case "assets": load_assets(obj); Serverdata = { tables: obj.tables, users: obj.users }; start_with_assets(); break;
		case "table": Serverdata.table = obj; gamestep(); break;
		case "users": show_users(); break;
		case "tables": show_tables(); break;
		case "delete_table":
		case "delete_tables": show_tables(); break;
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
function onclick_table(tablename) { phpPost({ friendly: tablename, uname: U.name }, 'table'); }
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
function show_advanced_ui(dParent) {
	let d = mDiv(dParent, {}, 'dAdvancedUI');
	let sz = 20;
	let styles = { bg: 'silver', wmin: sz, h: sz, rounding: '50%', maright: 10, align: 'center' };
	mButton(' ', onclick_advanced_test, d, styles, 'enabled');
	style_advanced_button();
}
function show_tables(ms = 500) {

	clear_screen();
	let dParent = mBy('dTables');
	mClear(dParent);

	show_games();

	let tables = Serverdata.tables;
	if (isEmpty(tables)) { mText('no active game tables', dParent); return []; }

	tables.map(x => x.game_friendly = Config.games[x.game].friendly);
	mText(`<h2>game tables</h2>`, dParent, { maleft: 12 })
	let t = mDataTable(tables, dParent, null, ['friendly', 'game_friendly', 'players'], 'tables', false);

	mTableCommandify(t.rowitems, {
		0: (item, val) => hFunc(val, 'onclick_table', val, item.id),
	});


	//delete command:
	let d = iDiv(t);
	//let x = mAppend(d.firstChild.firstChild, mCreate('th')); x.innerHTML = 'commands'; //header! console.log('x', x);
	for (const ri of t.rowitems) {
		let r = iDiv(ri);
		let h = hFunc('delete', 'delete_table', ri.o.friendly);
		c = mAppend(r, mCreate('td'));
		c.innerHTML = h;
	}
}
function show_username(loadTable = false) {
	let uname = U.name;
	let dpic = get_user_pic(uname, 30);
	let d = mBy('dAdminRight');
	mClear(d);
	if (['felix', 'mimi', 'lauren', 'amanda'].includes(uname)) show_advanced_ui(d); //mAppend(d, get_advanced_menu_buttons());
	mAppend(d, get_logout_button());
	mAppend(d, dpic);
	if (!loadTable) phpPost(null, 'tables');
	else if (!isEmpty(Serverdata.tables)) { onclick_table(Serverdata.tables[0].friendly); }
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
function stopgame() {
	clear_timeouts();
	pollStop();
	mClear('dAdminMiddle')
	hide('bRestartMove');
	hide('dHostButtons');
	mStyle('dAdmin', { bg: 'white' });
	for (const id of ['bSpotitStart', 'bClearAck', 'bRandomMove', 'bSkipPlayer']) hide(id);

	//clear_table();
	Z = null; delete Serverdata.table; delete Serverdata.playerdata; Clientdata = {};
	staticTitle();
}















