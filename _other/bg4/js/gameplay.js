var GAME_PLAY_UI = null;

function game_resume_or_start() {
	//if in the middle of a game, bring it back
	if (isdef(Session.game)) mBy("inner_left_panel").innerHTML = game.screen;
	else { game_start_new(); }

	game.run();
}

function game_start_new() {
	console.log('start a new game')
}



function game_interrupt() {
	if (!mBy('radio_play').checked) return;
	//console.log('INTERRUPT!')
	interrupt();
	GAME_PLAY_UI = null;// mBy('inner_left_panel').innerHTML;
}

