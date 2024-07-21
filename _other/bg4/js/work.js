
function present_table(obj) {

	update_session(obj);
	console.log('______________', Session.cur_user, 'game update:\ntable status', Session.cur_table.status, '\nmy status', Session.cur_me.player_status);

	if (nundef(obj.table) || obj.table.status == 'deleted') {
		in_game_off();
		in_game_open_prompt_off();
		status_message_off();
		get_games();
		return;
	}

	if (!in_game()) {
		//open game ui from scratch
		open_game_ui();
		in_game_on();
	} //else { console.log('in game already!!!'); }

	let d = mBy('table'); d.animate([{ opacity: 0, transform: 'translateY(50px)' }, { opacity: 1, transform: 'translateY(0px)' },], { fill: 'both', duration: 1000, easing: 'ease' });

	let table_status = Session.cur_table.status;
	let my_status = Session.cur_me.player_status;
	let have_another_move = my_status == 'joined';
	if (have_another_move) {
		if (!in_game_open_prompt()) {
			//zeigt ein neues prompt und activiert es
			open_prompt();
			spotit_fen();
			in_game_open_prompt_on();
		} else { uiActivated = true; } //console.log('in prompt already!!!'); uiActivated = true; }
	} else {
		reload_prompt(Session.cur_me.state);
	}

	update_game_status(Session.cur_players); //ueber den cards soll ein panel sein mit all den spielern

	if (table_status.status == 'started') {
		delete Session.cur_table.scoring_complete;
	} else if (table_status == 'ending') { 
		stop_game();
		status_message(`Game over! gathering information...`, { top: 220, classname: 'slow_gradient_blink' });
		poll_for_table_show();
	} else if (table_status == 'show') {
		let winners = Session.winners = spotit_check_endcondition();
		console.log('winners', winners);
		if (!isEmpty(winners)) {
			stop_game();
			DA.after_status_message = continue_game_ending_process;
			show_gameover(winners);
		}
	}



	//console.log('end of update table:', Session.cur_tid, 'scoring_complete:', Session.cur_table.scoring_complete);
}



//this is executed when user click on game over message!
function continue_game_ending_process() {
	let game = Session.cur_game;
	let winners = Session.winners;
	if (nundef(Session.cur_table.scoring_complete)) {
		console.log('scoring...')
		decrease_handicap_if_winstreak(winners, game);
		Session.cur_table.scoring_complete = true;
	}
	to_server({ tid: Session.cur_tid, uname: Session.cur_user }, 'seen');
}






