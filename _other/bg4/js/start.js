window.onload = start;

function start() {

	// loader_off();
	// show('dIntro');
	// test_start_test_user_endscreen(); return;



	//let s=format_datetime('1636770099945',str='y-m-d_h:i:s.r'); console.log('time:',s);
	//console.log('starting',new Date().getTime()); //generate_table_id('spotit')); return;
	//let x=generate_friendly_table_name();console.log(x); return;

	Speech = new Speaker('E'); //SpeechAPI('E');
	TOMan = new TimeoutManager();
	ColorThiefObject = new ColorThief();
	init_internet();
	init_keyhandlers();

	mBy('label_contacts').onclick = onclick_contacts;
	mBy('label_chat').onclick = onclick_chat;
	mBy('label_games').onclick = onclick_games;
	mBy('label_play').onclick = onclick_play;
	mBy('label_account').onclick = onclick_account;
	mBy('label_login').onclick = onclick_login_new;

	//set globals here to avoid override by saved or other
	Session.cur_user = valf(queryStringToJson().user, 'guest');
	Session.cur_menu = 'games'; //this will default to games (see leg_chatas.js line 213)
	Session.cur_game = 'gSpotit'; //this will default to U.lastGame if not set
	Session.def_playmode = 'multi'; //this will default to first mode in av_modes | 'solo'
	Session.def_players = ['mimi', 'gul']; //,'mac']; //,'amanda','blade','lauren','gul'];//,'nimble','bob','mitra','valerie','meckele'];
	Session.cur_chatter = 'meckele'; //this will default to other user that has sent|receive the most recent message from U

	// test_timestep_js_vs_php(); // test0_load_user(); //ok!
	// return;

	//go_online(); // nur LG simulate internet - lassen denn es stoert ueberhaupt nicht!
	//console.log('x',x);
	get_data(queryStringToJson(), 'user_info'); //NOTFALLS

	// DA.next = start_with_basic_assets;
	// ensure_assets('users','games','Syms');

}
function start_with_basic_assets() {

	//hier ist user name entweder unknown oder vom queryString!
	//wenn mit https://www.telecave.net/aroot/bg gestartet wird, ist man hier ein guest!
	//guest screen bedeutet: NUR ein screen auf dem die contacts sind!!!

	if (is_admin()) {
		hide('dIntro');
		let user = load_user(Session.cur_user); //queryStringToJson().user); //test0_load_user();
		loader_off();
		get_user_tables();
	}else{

		show_guest_screen();
	}
}

function danext() {
	if (isdef(DA.next)) { let f = DA.next; DA.next = null; f(); }
}

//#region old api
