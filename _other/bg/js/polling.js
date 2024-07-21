
//#region polling
function start_polling(data, type, onsuccess, ms = 5000) {
	DA.poll = {
		data: data,
		type: type,
		onsuccess: onsuccess,
		ms: ms,
	};
	poll();
}
function poll() { to_server(DA.poll.data, DA.poll.type); }
function stop_polling(){ clearTimeout(TOTicker);}

function poll_for_table_started() {
	//let username = Session.cur_user;
	start_polling(Session.cur_user, 'poll_table_started', on_poll_table_started, 6000); //, 5000); //check_table_exists, 5000);
}
function poll_for_table_show() {
	//let username = Session.cur_user;
	start_polling({ uname: Session.cur_user, tid: Session.cur_tid }, 'poll_table_show', on_poll_table_show, 3000); //, 5000); //check_table_exists, 5000);
}
function poll_for_table_seen_or_deleted() {
	//let username = Session.cur_user;
	start_polling({ uname: Session.cur_user, tid: Session.cur_tid }, 'poll_table_seen', on_poll_table_seen, 3000); //, 5000); //check_table_exists, 5000);
}

//das wird aufgerufen in server.js from_server poll_table_started?
// poll_table_started:
function check_poll_table_started(obj) {
	//console.log('obj', obj);
	if (isdef(obj) && !isEmpty(obj.user_tables)) {
		DA.poll.onsuccess();
	} else {
		TOTicker = setTimeout(poll, DA.poll.ms);
	}
}
function on_poll_table_started(obj) {
	delete DA.poll;
	status_message_off();
	clearElement('dIntro');
	hide('dIntro');
	//load_user();
	get_games();

}

// poll_table_show:
function check_poll_table_show(obj) {
	console.log('obj', obj);
	if (isdef(obj) && !isEmpty(obj.table) && obj.table.status == 'show') {
		DA.poll.onsuccess(obj);
	} else {
		TOTicker = setTimeout(poll, DA.poll.ms);
	}
}
function on_poll_table_show(obj) {
	delete DA.poll;
	status_message_off();
	present_table(obj);

}

// poll_table_seen:
function check_poll_table_seen(obj) {
	console.assert(isdef(obj.table), 'check_poll_table_seen NO TABLE!!!!');

	let t = obj.table;
	if (t.status == 'seen' || t.status == 'past') {
		update_session(obj);
		DA.poll.onsuccess(obj);
	} else {
		TOTicker = setTimeout(poll, DA.poll.ms);
	}
}
function on_poll_table_seen(obj) {
	delete DA.poll;

	if (is_game_host()) {
		//first save and then delete this table!
		//console.log('host is', Session.cur_user, 'save db...');
		let txt = jsyaml.dump(DB);
		DA.next = get_games;

		//brauch die fen = ranking
		let fen = get_score_fen_from_cur_players();

		to_server({ tid: Session.cur_tid, fen: fen, uname: Session.cur_user, db: txt }, 'save_and_delete');
		//remove all db save and delete table from work! and from server.js

	} else {

		show_user_intro_screen(true);
	}

}


