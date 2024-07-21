var PrevUser = null;
function is_user_spectating(g) { return isdef(U) && !g.plorder.includes(U.name); }
function gamestep() {

	let g = Serverdata.table;
	//console.log('g',g);return;

	//first determine user
	let gamemode = g.options.mode;
	//let logged_in_name = 
	let uname = gamemode == 'hotseat'? is_user_spectating(g) ? U.name : g.turn[0] : isdef(U) ? U.name : g.turn[0]; // let uname = U.name;	if (nundef(U)) { clearTable(); console.log('...no user => no show'); return; }
	if (nundef(U) || uname != U.name) U = firstCond(Serverdata.users, x => x.name == uname);

	//has game or user changed since last present?
	if (isdef(G) && nundef(G.scoring.winner) && g.modified <= G.modified && G.friendly == g.friendly && PrevUser == uname) {
		show_status(`nothing new in ${G.friendly}`);
		//if (nundef(DA.noshow)) DA.noshow = 1; else DA.noshow++; if (DA.noshow > 100) onclick_pause_continue(); //damit er nicht dauernd weiter pollt!
		autopoll();
		show('bPauseContinue');
		return;
	} else DA.noshow = 0;

	G = g;
	PrevUser = uname;

	dTable.animate([{ opacity: 0, transform: 'translateY(50px)' }, { opacity: 1, transform: 'translateY(0px)' },], { fill: 'both', duration: 800, easing: 'ease' });
	show_table_for(g, dTable, uname);
	//console.log(' *** THE REAL END *** '); return;

	//console.log('scoring', G.scoring);
	if (isdef(G.scoring.winner)) {
		//console.log('___there is a winner, return before polling!')
		show_message(`GAME OVER! winner is ${G.scoring.winner}`);
		mShield(dTable);
		console.log('wieso? er sollte pause button hiden!!!!')
		hide('bPauseContinue');
	} else if (winner = window[G.game]().check_gameover(G)) {
		//console.log('GAME OVER! winner is', winner); //return;
		//assume game has single winner!!! no tie!!!
		mShield(dTable);
		show_message(`GAME OVER! winner is ${winner}`);
		G.fen.winner = winner;
		G.scoring = { winner: winner }
		sendgameover(winner, G.friendly, G.fen, G.scoring);
		hide('bPauseContinue');
	} else if (!isdef(G.expected[uname])) {
		mShield(dTable);
		show('bPauseContinue');
		autopoll();
	} else {
		activate_ui(g);
		g.func.activate_ui(g, uname);
		show('bPauseContinue');
		autopoll();
	}
}
function is_ai_player() {
	let [fen, uname] = [z.fen, z.uname];
	return lookup(fen, ['players', uname, 'playmode']) == 'bot';
}
function ai_schummler() {

}
function ai_move() {
	// TODO: das gilt NUR FUER ARISTO!!!!! brauch ein etwas besseres system!
	//deactivate_ui();
	//if (!uiActivated) return;
	//pollStop();

	//pick a random move
	//console.log('so ich soll jetzt moven!!!', z.A);
	//how many items do I have to select?
	let A = z.A;
	let selitems;
	if (A.command == 'trade') {
		selitems = ai_pick_legal_trade();
	} else if (A.command == 'exchange') {
		selitems = ai_pick_legal_exchange();
	} else if (A.command == 'upgrade' && z.stage == 44 || A.command == 'downgrade' && z.stage == 103) {
		selitems = [rChoose(A.items)]; //ai_pick_legal_downgrad_cards();
	} else if (ARI.stage[z.stage] == 'journey') {
		console.log('bot should be picking a correct journey!!!! wie geht das?');
		selitems = [arrLast(A.items)]; // always pass!
		//selitems = [rChoose(A.items)]; //ai_pick_legal_downgrad_cards();
	} else {
		let items = A.items;
		let nmin = A.minselected;
		let nmax = Math.min(A.maxselected, items.length);
		let nselect = rNumber(nmin, nmax);
		selitems = rChoose(items, nselect); if (!isList(selitems)) selitems = [selitems];
	}
	for (const item of selitems) {
		let b = mBy(item.idButton);
		select_toggle({ target: b });
	}
	//deactivate_ui();
	//A.callback(); //NEIN!!!!!!!!!!!!!!!!!!!
	clearTimeout(TO.ai);
	TO.ai = setTimeout(A.callback, 2000);
	//console.log('callback would be', A.callback);


}
function show_table_for(g, dParent, uname) {
	show_title(g.friendly);
	let spectating = !g.fen.plorder.includes(uname);
	let playername = spectating ? g.turn[0] : uname;
	show_settings(g, playername);
	show_user();
	show_message(g.fen.message);
	show_instruction(isdef(g.expected[uname]) ? g.fen.instruction : g.fen.plorder.includes(uname) ? 'NOT YOUR TURN' : 'Spectating');
	g.func.present(g, dParent, playername);
}
function sendgameover(plname, friendly, fen, scoring) {
	let o = { winner: plname, friendly: friendly, fen: fen, scoring: scoring };
	phpPost(o, 'gameover');
}
function sendmove(plname, friendly, fen, action, expected, phase, round, step, stage) {
	deactivate_ui();
	let o = { uname: plname, friendly: friendly, fen: fen, action: action, expected: expected, phase: phase, round: round, step: step, stage: stage };
	phpPost(o, 'move');
}

//#region aristo TEMP
function turn_send_move_update() {
	let [fen, uname] = [z.fen, z.uname];	//console.log('sending move:z',z); //return;
	[fen.stage, fen.phase, fen.turn] = [z.stage, z.phase, z.turn];

	//das ist standard wenn nur 1 player turn hat
	let action = z.expected[uname];
	let expected = {}; fen.turn.map(x => expected[x] = { stage: z.stage, step: z.step }); fen.lastplayer = uname;

	sendmove(z.uname, z.friendly, z.fen, action, expected, z.phase, 0, z.step, z.stage);
}

