onload = _start;

async function _start() {
	set_run_state_no_server(); // set_run_state_no_server | set_run_state_local | set_run_state_vps
	onpagedeactivated(() => { saveEnv(); dbSave(); });
	await load_syms(); // jetzt gibt es Syms SymKeys ByGroupSubgroup Info KeySets
	await load_db(); //console.log("DB", DB); //jetzt gibt es DB
	let dicode = CODE.di = await route_path_yaml_dict('../basejs/z_all.yaml');
	let dijustcode = CODE.justcode = await route_path_yaml_dict('../basejs/z_allcode.yaml');
	//console.log('keys', dicode);
	let kwindow = get_keys(window);
	//console.log('window', kwindow);
	test100();
}

function rest() {
	// show_sidebar(sortCaseInsensitive(get_keys(superdi.const)));
	// dTable = mBy('dTable');
	// fiddleInit();

}

function show_code(res) {
	dTable = mBy('dTable');
	let ta = mTextarea(null, null, dTable, { w: '90vw', h: '90vh' });
	let text = res.text;
	ta.value = text;
	downloadAsText(text, 'hallo', 'js');
	console.log('res', res)

}

function saveEnv() {
	fiddleSave(); // fiddle
}
function show_sidebar(list, handler) {
	dSidebar = mBy('dSidebar'); mStyle(dSidebar, { w: 300, h: window.innerHeight - 68, overy: 'auto' });
	for (const k of list) {
		let d = mDiv(dSidebar, { cursor: 'pointer', wmin: 100 }, null, k, 'hop1')
		if (isdef(handler)) d.onclick = handler;
	}
}











async function _start_old() {
	//#region prelim timit set_run_state onpagedeactivated load:syms db codebase

	let timit = new TimeIt('* using timit *');
	set_run_state_vps(); //vps und multiclients mit sockets sein? set_run_state(false,true,3000,false,false,false,true);

	//saven von db choices: 
	// 1. db_update hat param save that is per default false
	// 2. db_update koennte fuer admin updates true, sonst false haben, oder irgendwie so (anfang von move: true, sonst: false)
	// 3. bei SINGLECLIENT kann auch nur wenn window deactivated wird saven
	// 4. or, uebernaechste line: when any client closes browser, save db at server
	onpagedeactivated(save_all); //

	await load_syms(); // jetzt gibt es Syms SymKeys ByGroupSubgroup Info KeySets
	await load_db(); //console.log("DB", DB); //jetzt gibt es DB
	await load_codebase(); //return;  //console.log('codebase',DA.codebase); return
	timit.show();
	//#endregion



	//#region db tests
	//was ist wenn ich jetzt DB modifyen will am server
	//ich muss eine route verwenden ODER die file route verwenden!
	//wenn server NICHT laeuft kann ich y/db/yaml nicht touchen oder??? laeuft, muss ich 
	//es muss einen CRUD server geben damit ich wirklich ein file veraendern kann!!!
	//db_create('action',{t:'09:18',d:65,p:20}); //	console.log('created',DB.appdata.action);
	//db_delete('action');
	//db_delete('action'); //db_create('action',{t:'HALLO',d:65,p:20});
	//dbSave();

	function test_random_update() {
		let n = rNumber();
		let i = rNumber(0, DB.appdata.howto.length - 1);
		let rec = { kw: 'k' + n, c: 'hallo' + (n + i) };
		db_update('howto', i, rec);
	}

	//onclick = test_random_update;

	//old code
	//await load_config();
	//await load_config_fast(['fitbit']); //wenn ich eh schon weiss welche filenames apps,tables
	//await load_config_new();

	//init db at client (use file db.yaml)

	//let data = await route_path_yaml_dict(`../y/appdata/calendar.yaml`); console.log('data', data)
	//#endregion
	//#region other tests

	//let x=toWords('"_TOSound, _sndP:layer, _load!ed = false, @1_qSound, _idl1 seSound = true, _sndCounter = 0;')
	//console.log('x',x)

	//test8_simple_intellisense(); 
	//show_apps();

	//test7_card();
	//howto_open();	//test6_sidebar(); //test5_prelim();

	//show_games();
	// show_apps();
	// book_open_title('cs', 2);
	// show_fiddle();

	//G.canvas.play();
	//iCollect();
	//iTag(['div','textarea','canvas','a']);
	//show_div_ids();
	//console.log('Items', Items)

	//setTimeout(show_div_ids,100);

	//test4_intelli();


	//test3_p5_perlin_2d(); //test2_p5_perlin(); //test1_p5_init(); //test0_random();
	//#endregion

}
function save_all_old() { if (!SINGLECLIENT) dbSave(); fiddleSave(); }








