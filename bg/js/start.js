window.onload = start;

function start() {
	Speech = new Speaker('E'); 
	TOMan = new TimeoutManager();
	ColorThiefObject = new ColorThief();
	init_internet();
	init_keyhandlers();

	mBy('label_games').onclick = onclick_games;
	mBy('label_play').onclick = onclick_play;
	mBy('label_account').onclick = onclick_account;
	mBy('label_login').onclick = onclick_login;

	//set globals here to avoid override by saved or other
	Session.cur_user = valf(queryStringToJson().user, 'guest');
	Session.cur_menu = 'games'; 
	Session.cur_game = 'gSpotit'; 
	Session.def_playmode = 'multi'; 
	Session.def_players = ['mimi', 'gul']; 
	Session.cur_chatter = 'gul'; 

	//go_online(); // nur LG simulate internet - lassen denn es stoert ueberhaupt nicht!
	get_data(queryStringToJson(), 'user_info'); //NOTFALLS! old api habs nicht geschafft das mit new api zu machen!
	//=>wird in start_with_base_assets starten!
}
function start_with_basic_assets() {

	onclick_test();return;

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


//#region old api
