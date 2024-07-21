var GAME_PLAY_UI = null;

function game_resume_or_start() {
	//mBy('left_panel').style.flex = 0;
	var inner_left_panel = mBy("inner_left_panel");

	inner_left_panel.innerHTML = `<div>
	<div id="md" style="display: flex">
	<div id="sidebar" style="align-self: stretch"></div>
	<div id="rightSide">
		<div id="table" class="flexWrap"></div>
	</div>
	</div></div>`;

	Items = {};
	initTable();
	initSidebar();
	initAux();
	initScore();

	console.assert(!isEmpty(Username), 'Username undefined in game_start_or_resume!!!!!');
	if (isEmpty(CURRENT_GAME)) CURRENT_GAME = 'gAnagram'; //for now: set game here if it wasnt set!
	loadUser(Username, CURRENT_GAME); //hier wird setGame aufgerufen! 

	//here sollte correct U und G und GC haben!
	//console.log("GC", GC, '\nG', G, '\nU', U);

	if (isEmpty(CURRENT_FEN)) CURRENT_FEN = G.START_FEN; //for now: assume there is a start fen in game def (DB.games[game])

	U.session = {}; //used for score!
	GC.startGame(CURRENT_FEN);
}


function game_interrupt() {
	if (!mBy('radio_play').checked) return;
	console.log('INTERRUPT!')
	interrupt();
	GAME_PLAY_UI = null;// mBy('inner_left_panel').innerHTML;
}

