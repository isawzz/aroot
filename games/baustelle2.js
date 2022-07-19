
function gamestep() {

	show_admin_ui();

	DA.running = true; clear_screen();
	dTable = mBy('dTable'); mFall(dTable); mClass('dTexture', 'wood');

	shield_off();
	show_title();
	show_role();
	Z.func.present(Z, dTable, Z.uplayer);	// *** Z.uname und Z.uplayer ist IMMER da! ***

	//console.log('_____uname:'+Z.uname,'role:'+Z.role,'player:'+Z.uplayer,'host:'+Z.host,'curplayer:'+Z.turn[0],'bot?',is_current_player_bot()?'YES':'no');
	if (isdef(Z.scoring.winners)) { show_winners(); }
	else if (Z.func.check_gameover(Z)) {
		let winners = show_winners();
		Z.scoring = { winners: winners }
		sendgameover(winners[0], Z.friendly, Z.fen, Z.scoring);
	} else if (is_shield_mode()) {
		if (!DA.no_shield == true) { hide('bRestartMove'); shield_on(); } //mShield(dTable.firstChild.childNodes[1])} //if (isdef(Z.fen.shield)) mShield(dTable);  }
		autopoll();
	} else {
		Z.A = { level: 0, di: {}, ll: [], items: [], selected: [], tree: null, breadcrumbs: [], sib: [], command: null, autosubmit: Config.autosubmit };
		copyKeys(jsCopy(Z.fen), Z);
		copyKeys(UI, Z);
		activate_ui(Z); //console.log('uiActivated',uiActivated?'true':'false');
		Z.func.activate_ui();
		if (Z.options.zen_mode != 'yes' && Z.mode != 'hotseat') autopoll();
	}

	//landing();

}


//#region HELPERS..............
function i_am_host(){return U.name == Z.host;}
function i_am_acting_host(){return U.name == Z.fen.acting_host;}
function onclick_status(){
	query_status();
}
function show_admin_ui(){
	//notes: once this is set by player, will NOT be erased!
	//how to clear notes????
	//if (isdef(Z.prev.notes[uplayer])) Z.notes[uplayer]=Z.prev.notes[uplayer];
	//game specific buttons hide or show
	for (const id of ['bSpotitStart', 'bClearAck', 'bRandomMove', 'bSkipPlayer']) hide(id);
	if (Z.game == 'spotit' && Z.uname == Z.host && Z.stage == 'init') show('bSpotitStart');
	else if (Z.game == 'bluff' && Z.uname == Z.host && Z.stage == 1) show('bClearAck');
	else if (Z.game == 'ferro' && Z.uname == Z.host && Z.stage == 'buy_or_pass') show('bClearAck');
	else if (['ferro', 'bluff', 'aristo', 'a_game'].includes(Z.game)) {
		//console.log('random should show because game is', Z.game)
		show('bRandomMove');
	}
	if (Z.uname == Z.host) show('dHostButtons'); else hide('dHostButtons');
}








