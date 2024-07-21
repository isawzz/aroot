function show_guest_screen() {
	//get_intro(); macht dasselbe wie get_contacts aber mit login click
	//dann aber zeigt es einen weiteren retard screen
	get_intro();
}
function get_intro() { to_server(Session.cur_user, "intro"); }
function present_intro(obj) { param_present_contacts(obj, mBy('dIntro'), 'onclick_user_in_intro'); }
function onclick_user_in_intro(e) {
	e.preventDefault(); e.cancelBubble = true;
	var username = e.target.getAttribute("username");
	if (e.target.id == "") {
		username = e.target.parentNode.getAttribute("username");
	}
	load_user(username);

	show_user_intro_screen();

	// to_server(username, 'poll_table_started');
	//hier soll long poll gestartet werden mit message: waiting for mimi to start the game...
}

//#region intro user screen
function intro_create_score_table(fen) {
	//customers	
	// let t=Session.cur_table;
	// let fen = t.fen;
	let dParent = mBy('dIntro');
	let d = mDiv(dParent, { margin: 'auto', w: 300 }); //, bg:'red'});

	html = `<div style='text-align:center;margin-top:100px'>
	<table id='customers'><tr><th>player</th><th>score</th></tr>
	`;
	let plparts = fen.split(',');
	for (const pl of plparts) {
		html += `<tr><td>${stringBefore(pl, ':')}</td><td>${stringAfter(pl, ':')}</td></tr>`
	}
	html += '</table></div>';
	d.innerHTML = html;

}
function intro_show_user_image(uname) {
	let dParent = mBy('dIntro');
	let d = mDiv(dParent, { margin: 'auto', w: 300 });
	let html = `
	<div style='text-align:center;margin-top:100px'>
		<img src='../base/assets/images/${uname}.jpg' class="img_person" height=200 />
	</div>
	`;
	d.innerHTML = html;

}
function create_score_table() {
	//customers	
	let t = Session.cur_table;
	let fen = t.fen;
	let dParent = mBy('dIntro');
	let d = mDiv(dParent, { margin: 'auto', w: 300, bg: 'red' });

	html = `<div style='text-align:center;margin-top:200px'>
	<table id='customers'><tr><th>player</th><th>score</th></tr>
	`;
	let plparts = fen.split(',');
	for (const pl of plparts) {
		html += `<tr><td>${stringBefore(pl, ':')}</td><td>${stringAfter(pl, ':')}</td></tr>`
	}
	html += '</table></div>';
	d.innerHTML = html;

}
function show_user_intro_screen(is_show_ranking = false, is_start_poll = true) {
	show('dIntro'); clearElement('dIntro');

	intro_show_user_image(Session.cur_user);
	status_message(`hi, ${capitalize(Session.cur_user)}, a game is starting soon...`, { top: 330, classname: 'slow_gradient_blink' });

	if (is_show_ranking) {
		let t = Session.cur_table;
		let fen = t.status == 'past' ? t.fen : get_score_fen_from_cur_players();
		intro_create_score_table(fen);
	}
	if (is_start_poll) poll_for_table_started();

}

//#endregion

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
//#endregion
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
	console.assert(isdef(obj.table),'check_poll_table_seen NO TABLE!!!!');

	let t=obj.table;
	if (t.status == 'seen' || t.status == 'past'){
		update_session(obj);
		DA.poll.onsuccess(obj);
	}else{
		TOTicker = setTimeout(poll, DA.poll.ms);
	}
}
function on_poll_table_seen(obj) {
	delete DA.poll;

	if (is_game_host()) {
		//first save and then delete this table!
		console.log('host is', Session.cur_user, 'save db...');
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









