window.onload = start; //start_testing | start
function start() {

	//console.log('test',stringAfterLast('hallo','.'));return;

	Speech = new Speaker('E');
	TOMan = new TimeoutManager();
	ColorThiefObject = new ColorThief();
	init_internet();
	init_keyhandlers();

	mBy('label_games').onclick = onclick_games;
	mBy('label_play').onclick = onclick_play;
	mBy('label_account').onclick = onclick_account;
	mBy('label_login').onclick = onclick_login;
	//mBy('label_settings').onclick = onclick_settings;

	//set globals here to avoid override by saved or other
	Session.cur_user = valf(queryStringToJson().user, 'guest');
	//console.log('cur_user in start ist',Session.cur_user)
	Session.cur_menu = 'games'; testbuttons_off();
	Session.cur_game = 'gSpotit';
	Session.def_playmode = 'multi';
	Session.def_players = ['mimi', 'leo']; //, 'bob'];
	Session.winning_score = 1;
	//Session.def_players = ['mimi','afia','amanda','annabel','blade','felix','gul','lauren','mac','nasi','sarah','valerie']; 
	Session.cur_chatter = 'gul';

	go_online(); // nur LG simulate internet - lassen denn es stoert ueberhaupt nicht!
	get_data(queryStringToJson(), 'user_info'); //NOTFALLS! old api habs nicht geschafft das mit new api zu machen!
	//=>wird in start_with_base_assets starten!
}
function start_with_basic_assets() {

	//bluff_present();return;

	G = Session;
	G.plprev = null;
	//DA.staged_moves = []; DA.iter = 100; DA.auto_moves = {};
	//start_ari(); return; ////test_0_inno_setup();return;

	//hier ist user name entweder unknown oder vom queryString!
	//wenn mit https://www.telecave.net/aroot/basinno gestartet wird, ist man hier ein guest!
	//guest screen bedeutet: NUR ein screen auf dem die contacts sind!!!
	if (is_admin()) {

		//test0_inno_setup();return;
		// hide('divTest'); //this is done in index.html damit kein flickering!
		let user = load_user(Session.cur_user); //queryStringToJson().user); //test0_load_user();
		loader_off();

		TESTING = false;
		DA.staged_moves = []; DA.iter = 100; DA.auto_moves = {};
		if (TESTING) {
			sidebar_transition_off();
			main_menu_off();
			DA.chain = [get_dictionary]; get_last_table(); //onclick_ut_n('ari', 107); //onclick_ut_n('inno',9);
			//DA.chain = [get_dictionary]; onclick_ut_n('inno',10); //onclick_ut_n('inno',9);
		} else {
			DA.chain = [get_dictionary]; get_last_table(); //get_games(); //orig
		}

		//DA.chain = [get_dictionary, onclick_inno_ut0]; get_games();
		//show('b_polling');

	} else {

		close_sidebar();
		mBy('user_info_mini').style.display = 'flex';
		mBy('b_toggle_sidebar').style.display = 'none';
		//console.log('NA: cur_user', Session.cur_user);

		//get_intro(); 
		Session.cur_user = valf(localStorage.getItem('user'), 'guest');
		//console.log('cur_user',Session.cur_user);
		if (nundef(Session.cur_user) || Session.cur_user == 'guest') get_intro(); else present_non_admin_user(Session.cur_user);
		//if (Session.cur_user == 'guest') get_intro(); else if (isdef(DB.users[Session.cur_user])) present_non_admin_user(Session.cur_user);
		//if (Session.cur_user == 'guest') get_intro(); else present_non_admin_user(Session.cur_user);
	}
}
function start_testing() {
	//test0_make_set_deck();
	test0_make_goal_set();
}
function start_ari() {
	Session.cards = Aristocards;
	//console.log('Session', Session);
	dTable = mDiv(mBy('inner_left_panel')); mFlexWrap(dTable);
	for (const k in Session.cards) {
		let card = ari_get_card(k);
		mAppend(dTable, iDiv(card));
	}
}

function test0_inno_setup() {
	let user = load_user(Session.cur_user); //queryStringToJson().user); //test0_load_user();
	loader_off();
	onclick_preinno_create();
	show('b_polling');

}
function test0_actions() {
	actions_on();
	add_action('Wheel');
	add_action('Sailing');
	dLeiste.onclick = actions_off;

}
function test0_make_set_deck() {
	let list = make_set_deck(4); console.log('list', list);
}
function test0_make_goal_set() {
	let n = randomNumber(2, 6);
	let deck = make_set_deck(n); // alle card fens
	shuffle(deck);

	let prob_different = chooseRandom([25, 50, 75]);

	let [fen1, fen2, fen3] = make_goal_set(deck, prob_different);
	console.log('goal set', fen1, fen2, fen3);
}

