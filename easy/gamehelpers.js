function activate_ui() {

	if (uiActivated) {DA.ai_is_moving = false; return; }
	//console.log('______ activate_ui','\nprevturn',Clientdata.last_turn,'\n=>turn',Clientdata.this_turn,'\nprevstage',Clientdata.last_stage,'\n=>stage',Clientdata.this_stage);

	if ((Clientdata.this_stage != Clientdata.last_stage || FirstLoad) && Clientdata.this_stage == 'card_selection') {
		FirstLoad = false;
		Clientdata.snapshot = jsCopy(Z.fen);

		show('bRestartMove');
	} else if (Clientdata.this_turn.length != 1) {
		delete Clientdata.snapshot;
		hide('bRestartMove');

	}

	uiActivated = true; DA.ai_is_moving = false;
}
function deactivate_ui() { uiActivated = false; DA.ai_is_moving = true; }
function clear_status() { if (nundef(mBy('dStatus'))) return; clearTimeout(TO.fleeting); mRemove("dStatus"); }
//function clear_table() { clear_status(); clear_title(); mStyle(document.body, { bg: 'white', fg: '#111111' }) }
function clear_title() { mClear('dTitleMiddle'); mClear('dTitleLeft'); mClear('dTitleRight'); }
function collect_game_specific_options(game) {
	let poss = Config.games[game].options;
	if (nundef(poss)) return;
	let di = {};
	for (const p in poss) {
		let fs = mBy(`d_${p}`);
		//console.log('fs',fs, 'key',p);
		let val = get_checked_radios(fs)[0];
		di[p] = isNumber(val) ? Number(val) : val;
	}
	return di;
}
function ev_to_gname(ev) { evNoBubble(ev); return evToTargetAttribute(ev, 'gamename'); }
function generate_table_name(n) {
	let existing = Serverdata.tables.map(x => x.friendly);
	while (true) {
		let cap = rChoose(Info.capital);
		let parts = cap.split(' ');
		//console.log('parts', parts);
		if (parts.length == 2) cap = stringBefore(cap, ' '); else cap = stringBefore(cap, '-');
		cap = cap.trim();
		let s = (n == 2 ? 'duel of ' : rChoose(['battle of ', 'war of '])) + cap;
		//console.log('s', s);
		if (!existing.includes(s)) return s;
	}
}
function get_checked_radios(rg) {
	let inputs = rg.getElementsByTagName('INPUT');
	let list = [];
	for (const ch of inputs) {
		//console.log('child',ch)
		let checked = ch.getAttribute('checked');
		//console.log('is',checked);
		//console.log('?',ch.checked); 
		if (ch.checked) list.push(ch.value);
	}
	//console.log('list',list)
	return list;
}
function get_next_in_list(el, list) {
	let iturn = list.indexOf(el);
	let nextplayer = list[(iturn + 1) % list.length];
	return nextplayer;
}
function get_next_player(g, uname) {
	let plorder = g.fen.plorder;
	let iturn = plorder.indexOf(uname);
	let nextplayer = plorder[(iturn + 1) % plorder.length];
	return nextplayer;
}
function get_next_human_player(plname) {
	//console.log('==>find next_human_player after',plname);
	if (nundef(plname)) return null;
	let [prevturn, mode, turn, uname, plorder, fen, host] = [Z.prev.turn, Z.mode, Z.turn, Z.uname, Z.plorder, Z.fen, Z.host];
	let same = isString(plname) && isList(prevturn) && sameList(prevturn, turn);
	if (!same) return null;
	// let i=valf(fen.ihotseat,0);

	//log_object(Z,'hotseat player choice','prev turn plorder players');
	//console.log('prevturn', prevturn, 'turn', turn, 'same', same, 'plname', plname);
	let plnew = get_next_player(Z, plname);
	while (fen.players[plnew].playmode == 'bot') {
		plnew = get_next_player(Z, plnew);
		if (plnew == plname) break;
	}

	//console.log('next player should be',plnew);
	return plnew;
}

function get_waiting_html() { return `<img src="../base/assets/images/active_player.gif" height="30" style="margin:0px 10px" />`; }
function get_waiting_html(sz = 30) { return `<img src="../base/assets/images/active_player.gif" height="${sz}" style="margin:0px ${sz / 3}px" />`; }
function get_default_options(gamename) {
	let options = {};
	for (const k in Config.games[gamename].options) options[k] = arrLast(Config.games[gamename].options[k]);
	return options;
}
function get_logout_button() {
	let html = `<a id="aLogout" href="javascript:onclick_logout()">logout</a>`;
	return mCreateFrom(html);
}
function get_screen_distance(child, newParent) {
	child = toElem(child);
	newParent = toElem(newParent);

	const parentOriginal = child.parentNode;

	let children = arrChildren(parentOriginal);
	let iChild = children.indexOf(child);
	let sibling = iChild == children.length - 1 ? null : children[iChild + 1];

	const x0 = child.getBoundingClientRect().left;
	const y0 = child.getBoundingClientRect().top;
	//console.log('pos0', x0, y0)

	newParent.appendChild(child);
	const x1 = child.getBoundingClientRect().left;
	const y1 = child.getBoundingClientRect().top;
	//console.log('pos1', x1, y1)

	if (sibling) parentOriginal.insertBefore(child, sibling); else parentOriginal.appendChild(child);
	// child.style.setProperty('--dx', (x1 - x0) + 'px');
	// child.style.setProperty('--dy', (y1 - y0) + 'px');
	return [x1 - x0, y1 - y0];
}
function get_game_color(game) { return colorFrom(Config.games[game].color); }
function get_playmode(uname) { return Z.fen.players[uname].playmode; }
function get_user_color(uname) { let u = firstCond(Serverdata.users, x => x.name == uname); return colorFrom(u.color); }
function get_user_pic(uname, sz = 50, border = 'solid medium white') {
	let html = get_user_pic_html(uname, sz, border); // `<img src='../base/assets/images/${uname}.jpg' width='${sz}' height='${sz}' class='img_person' style='margin:0px 4px;border:${border}'>`
	return mCreateFrom(html);
}
function get_user_pic_html(uname, sz = 50, border = 'solid medium white') {
	return `<img src='../base/assets/images/${uname}.jpg' width='${sz}' height='${sz}' class='img_person' style='margin:0px 4px;border:${border}'>`
	//return mCreateFrom(html);
}
function get_user_pic_and_name(uname, dParent, sz = 50, border = 'solid medium white') {
	let html = `
			<div username='${uname}' style='text-align:center;font-size:${sz / 2.8}px'>
				<img src='../base/assets/images/${uname}.jpg' width='${sz}' height='${sz}' class='img_person' style='margin:0;border:${border}'>
				<div style='margin-top:${-sz / 6}px'>${uname}</div>
			</div>`;
	let elem = mCreateFrom(html);
	mAppend(dParent, elem);
	return elem;
}
function get_texture(name) { return `url(../base/assets/images/textures/${name}.png)`; }
function is_advanced_user() {
	let advancedUsers = ['mimi', 'bob', 'buddy', 'minnow', 'nimble', 'leo', 'guest', 'felix'];
	//console.log('U',isdef(U)?U.name:'undefined!!!');
	return isdef(U) && advancedUsers.includes(U.name);
}
function is_just_my_turn() {
	return isEmpty(Z.turn.filter(x => x != Z.uplayer));
}
function is_shield_mode() {
	return Z.role == 'spectator'
		|| Z.mode == 'multi' && Z.role == 'inactive' && Z.host != Z.uname
		|| Z.mode == 'multi' && Z.role == 'inactive' && Z.pl.playmode != 'bot'
}
function path2fen(fen, path) { let o = lookup(fen, path.split('.')); return o; }
function path2UI(path) {
	let res = lookup(UI, path.split('.'));
	//console.log('res',res);
	return res;
}
function player_stat_count(key, n, dParent, styles = {}) {
	let sz = valf(styles.sz, 16);
	//console.log('hallo!!!')

	//if (nundef(styles.wmax)) styles.wmax = sz;
	addKeys({ display: 'flex', margin: 4, dir: 'column', hmax: 2 * sz, 'align-content': 'start', fz: sz, align: 'center' }, styles);

	let d = mDiv(dParent, styles);
	if (isdef(Syms[key])) mSym(key, d, { h: sz, 'line-height':sz, w: '100%' });
	else mText(key, d, { h: sz, fz: sz, w: '100%' });
	d.innerHTML += `<span style="font-weight:bold">${n}</span>`;
	return d;
}
function new_cards_animation(n=2){
	let [stage, A, fen, plorder, uplayer, deck] = [Z.stage, Z.A, Z.fen, Z.plorder, Z.uplayer, Z.deck];
	let pl = fen.players[uplayer];
	if (stage == 'card_selection' && !isEmpty(pl.newcards)) {
		let anim_elems = [];

		//console.log('player', uplayer, 'newcards', jsCopy(pl.newcards));
		for (const key of pl.newcards) {
			let ui = lastCond(UI.players[uplayer].hand.items, x => x.key == key);
			ui = iDiv(ui);
			anim_elems.push(ui);
		}
		delete pl.newcards;
		//console.log('player', uplayer, 'newcards deleted:', pl.newcards);

		//animate newcards!
		anim_elems.map(x => mPulse(x, n*1000));
		// setTimeout(ferro_pre_action,1000);
	}
}
function round_change_animation(n=2) {
	let [stage, A, fen, plorder, uplayer, deck] = [Z.stage, Z.A, Z.fen, Z.plorder, Z.uplayer, Z.deck];
	let pl = fen.players[uplayer];
	if (pl.roundchange) {
		let d = mBy('dTitleLeft');
		mStyle(d, { 'transform-origin': '0% 0%' });
		mPulse(d, n*1000);
		show_special_message(`${fen.round_winner} won round ${Z.round - 1}!!!`)
		delete pl.roundchange;
	}
}
function remove_player(fen, uname) {
	if (nundef(fen.original_players)) fen.original_players = jsCopy(fen.players);
	removeInPlace(fen.plorder, uname);
	delete fen.players[uname];
	return fen.plorder;
}
function remove_hourglass(uname) { let d = mBy(`dh_${uname}`); if (isdef(d)) mRemove(d); }
function set_user(name) { 
	if (isdef(U) && U.name != name) { 
		Z.prev.u = U; 
		Z.prev.uname = U.name; 
	} 
	U = Z.u = firstCond(Serverdata.users, x => x.name == name); 
	//console.log('set_user', name, U);
	Z.uname = name; 
	//console.log('Z.uname', Z.uname);
}
function set_player(name, fen) {
	if (isdef(PL) && PL.name != name) { Z.prev.pl = PL; Z.prev.uplayer = PL.name; }
	PL = Z.pl = firstCond(Serverdata.users, x => x.name == name);
	//console.log('name',name);
	copyKeys(fen.players[name], PL);
	Z.uplayer = name;
}
function show_fleeting_message(s, dParent, styles, id, ms = 2000) {
	let d = mDiv(dParent, styles, id, s);
	mFadeRemove(d, ms);
}
function show_games(ms = 500) {

	let dParent = mBy('dGames');
	mClear(dParent);
	mText(`<h2>start new game</h2>`, dParent, { maleft: 12 });

	let html = `<div id='game_menu' style="color:white;text-align: center; animation: appear 1s ease both">`;
	let gamelist = 'aristo bluff spotit ferro fritz';
	for (const g of dict2list(Config.games)) { if (gamelist.includes(g.id)) html += ui_game_menu_item(g); }
	mAppend(dParent, mCreateFrom(html));
	//mCenterCenterFlex(mBy('game_menu'));
	mFlexWrap(mBy('game_menu'));

	//mRise(dParent, ms);
}
function show_game_options(dParent, game) {
	mRemoveChildrenFromIndex(dParent, 2);
	let poss = Config.games[game].options;
	if (nundef(poss)) return;
	for (const p in poss) {
		let key = p;
		let val = poss[p];
		if (isString(val)) {
			let list = val.split(','); // make a list 
			let fs = mRadioGroup(dParent, {}, `d_${key}`, key);
			//let func = pool=='mode'?adjust_playmodes:null;
			for (const v of list) { mRadio(v, isNumber(v) ? Number(v) : v, key, fs, { cursor: 'pointer' }, null, key, true); }
			measure_fieldset(fs);
		}
	}

}
function show_history(fen, dParent) {
	if (!isEmpty(fen.history)) {
		let html = '';
		for (const arr of jsCopy(fen.history).reverse()) {
			//html+=`<h1>${k}</h1>`;
			for (const line of arr) {
				html += `<p>${line}</p>`;
			}
		}
		let dHistory = mDiv(dParent, { padding: 6, margin: 4, bg: '#00000060', fg: 'white', hmax: 400, 'overflow-y': 'auto', wmin: 240, rounding: 12 }, null, html); //JSON.stringify(fen.history));
		//mNode(fen.history, dHistory, 'history');
	}

}
function show_home_logo() {
	let bg = colorLight();
	let dParent = mBy('dAdminLeft');
	clearElement(dParent);
	let d = miPic('castle', dParent, { cursor: 'pointer', fz: 24, padding: 6, h: 36, box: true, margin: 2 }); //, bg: bg, rounding: '50%' });
	d.onclick = onclick_home;
}
function show_hourglass(uname, d, sz, stylesPos = {}) {
	let html = get_waiting_html(sz);
	mStyle(d, { position: 'relative' });
	addKeys({ position: 'absolute' }, stylesPos);
	let dw = mDiv(d, stylesPos, `dh_${uname}`, html);

}
function show_instruction() {

	let d = mBy('dAdminMiddle');
	clearElement(d)
	if (Z.role == 'spectator') {
		let d = mBy('dInstruction');
		mStyle(d, { display: 'flex', 'justify-content': 'end' });
		mDiv(d, { maright: 10 }, null, 'SPECTATING');

	} else if (Z.role == 'inactive') {
		let d = mBy('dInstruction');
		mStyle(d, { display: 'flex', 'justify-content': 'start' });
		mDiv(d, { maleft: 10 }, null, 'NOT YOUR TURN');

	} else if (isdef(Z.fen.instruction)) {
		let d = mBy('dInstruction');
		mStyle(d, { display: 'flex', 'justify-content': 'center' });
		mDiv(d, {}, null, Z.fen.instruction);

	}


	//mBy('dInstruction'), Z.role == 'active' ? Z.fen.instruction : Z.role == 'inactive' ? 'NOT YOUR TURN' : '<span style="float:right;">Spectating</span>');
}
function show_message(msg = '', stay = false) {
	mStyle(dTable, { transition: 'all 1s ease' });
	let d = mBy('dMessage'); d.innerHTML = msg;
	if (stay) return;
	let ms = 1000, delay = 3000;
	let anim = d.animate([{ transform: `scale(1,1)`, opacity: 1 }, { transform: `scale(1,0)`, opacity: 0 },], { duration: 1000, easing: 'ease', delay: delay });
	dTable.animate([{ transform: 'translateY(0px)' }, { transform: 'translateY(-56px)' },], { fill: 'none', duration: ms, easing: 'ease', delay: delay });
	anim.onfinish = () => {
		mClear(d);
	}
}
function show_options_popup(options) {
	let opresent = {};
	let di = { mode: 'gamemode', yes: true, no: false };
	let keys = get_keys(options);
	keys.sort();
	for (const k of get_keys(options).sort()) {
		let key = valf(di[k], k);
		let val = valf(di[options[k]], options[k]);
		opresent[key] = val;
	}
	//moechte dass er statt mode
	let x = mYaml(mCreate('div'), opresent);
	let dpop = mPopup(x.innerHTML, dTable, { fz: 16, fg: 'white', top: 0, right: 0, border: 'white', padding: 10, bg: 'dimgray' }, 'dOptions');
	mInsert(dpop, mCreateFrom(`<div style="text-align:center;width:100%;font-family:Algerian;font-size:22px;">${Z.game}</div>`));
	//console.log('popup', dpop);
}
function show_role() {

	let d = mBy('dAdminMiddle');
	clearElement(d);
	let hotseatplayer = Z.uname != Z.uplayer && Z.mode == 'hotseat' && Z.host == Z.uname;

	let styles,text;
	let boldstyle = { fg: 'red', weight: 'bold', fz: 20 };
	let normalstyle = { fg: 'black', weight: null, fz: null };
	if (hotseatplayer){
		styles = boldstyle;
		text = `you turn for ${Z.uplayer}`;
	}else if (Z.role == 'spectator') {
		styles = normalstyle;
		text = `(spectating)`;
	}else if (Z.role == 'active') {
		styles = boldstyle;
		text = `It's your turn!`;
	}else{
		assertion(Z.role == 'inactive', 'role is not active or inactive or spectating ' + Z.role);
		styles = normalstyle;
		text =  `(${Z.turn[0]}'s turn)`;
	}

	// let styles = Z.role == 'active' || hotseatplayer ? { fg: 'red', weight: 'bold', fz: 20 } : { fg: 'black', weight: null, fz: null };
	// let text = hotseatplayer ? `you turn for ${Z.uplayer}` : Z.role == 'active' ? `It's your turn!` : Z.role == 'spectator' ? "(spectating)" : `(${Z.turn[0]}'s turn)`;
	d.innerHTML = text;
	mStyle(d, styles);
}
function show_settings(dParent) {
	let [options, fen, uplayer] = [Z.options, Z.fen, Z.uplayer];
	clearElement(dParent);
	mFlex(dParent);
	let playermode = get_playmode(uplayer); //console.log('playermode',playermode)
	let game_mode = Z.mode;
	let dplaymode = mDiv(dParent, { fg: 'blue' }, null, playermode); // playermode == 'bot' ? 'bot' : '');
	let dgamemode = mDiv(dParent, { fg: 'red' }, null, Z.mode); //Z.mode == 'hotseat' ? 'h' : '');
	let d = miPic('gear', dParent, { fz: 20, padding: 6, h: 40, box: true, matop: 2, rounding: '50%', cursor: 'pointer' });
	options.playermode = playermode;
	d.onmouseenter = () => show_options_popup(options);
	d.onmouseleave = hide_options_popup;
}
function status_message_new(msg, dParent, styles = {}) {
}
function show_stage() {
	if (isdef(Z.fen.progress)) {
		let d = mBy('dTitleLeft');
		let former = mBy('dProgress');
		if (isdef(former)) former.remove();
		let dprogress = mDiv(d, {}, 'dProgress', `<div>${Z.fen.progress}</div>`);
	}
}
function show_status(s) {

	//console.log('........show_status', s)
	if (is_advanced_user()) {
		clear_status();
		if (!TESTING && !s.includes('reload')) show_fleeting_message(s, 'dTest', { fz: 14, position: 'absolute', top: 5, right: 10 }, 'dStatus');
	}
}
function show_tables(ms = 500) {

	clear_screen();
	let dParent = mBy('dTables');
	mClear(dParent);

	show_games();

	let tables = Serverdata.tables;
	if (isEmpty(tables)) { mText('no active game tables', dParent); return []; }

	tables.map(x=>x.game_friendly = Config.games[x.game].friendly);
	mText(`<h2>game tables</h2>`, dParent, { maleft: 12 })
	let t = mDataTable(tables, dParent, null, ['friendly', 'game_friendly', 'players'], 'tables', false);

	mTableCommandify(t.rowitems, {
		0: (item, val) => hFunc(val, 'onclick_table', val, item.id),
	});



	//mRise(dParent, ms);
	//mRise('dScreen', 1000); 
}
function show_title() {
	mBy('dTitleMiddle').innerHTML = Z.friendly;
	Z.func.state_info(mBy('dTitleLeft'));
	show_settings(mBy('dTitleRight'));
}
function show_username() {
	let uname = U.name;
	let dpic = get_user_pic(uname, 30);
	let d = mBy('dAdminRight');
	mClear(d);
	mAppend(d, get_logout_button());
	mAppend(d, dpic);

	if (is_advanced_user()) {if (TESTING) show('dAdvanced');show('dAdvanced1');} else {hide('dAdvanced');hide('dAdvanced1');}

	phpPost({ app: 'easy' }, 'tables');
}
function show_users(ms = 300) {
	let dParent = mBy('dUsers');
	mClear(dParent);
	//mStyle(dParent, { gap: 10, padding: 10 });
	for (const u of Serverdata.users) {
		if (['ally','bob','leo'].includes(u.name)) continue;
		let d = get_user_pic_and_name(u.name, dParent);
		d.onclick = () => onclick_user(u.name);
		mStyle(d, { cursor: 'pointer' });
	}
	mFall(dParent, ms);
}
function show_winners() {
	let winners = Z.fen.winners;
	//winners = ['felix','amanda'];
	let multiple_winners = winners.length > 1;
	let winners_html = winners.map(x => get_user_pic_html(x, 35)).join(' ');
	let msg = `
		<div style="display:flex;gap:10px;align-items:center">
			<div style="color:red;font-size:22px;font-weight:bold;">GAME OVER! the winner${multiple_winners ? 's are: ' : ' is '}</div>
			<div style="padding-top:5px;">${winners_html}</div>
		</div>
	`;
	show_message(msg, true);
	//mStyle(d,{fg:'red',weight:'bold',fz:24})
	mShield(dTable);
	hide('bRestartMove');

	return Z.fen.winners;
}
function tableLayoutMR(dParent, m, r) {
	let ui = UI; ui.players = {};
	clearElement(dParent);
	let bg = 'transparent';
	let [dMiddle, dRechts] = [ui.dMiddle, ui.dRechts] = mColFlex(dParent, [m, r], [bg, bg]);
	mCenterFlex(dMiddle, false); //no horizontal centering!
	let dOben = ui.dOben = mDiv(dMiddle, { w: '100%', display: 'block' }, 'dOben');
	let dSelections = ui.dSelections = mDiv(dOben, {}, 'dSelections');
	for (let i = 0; i <= 5; i++) { ui[`dSelections${i}`] = mDiv(dSelections, {}, `dSelections${i}`); }
	let dActions = ui.dActions = mDiv(dOben, { w: '100%' });
	for (let i = 0; i <= 5; i++) { ui[`dActions${i}`] = mDiv(dActions, { w: '100%' }, `dActions${i}`); }
	ui.dError = mDiv(dOben, { w: '100%', bg: 'red', fg: 'yellow', hpadding: 12, box: true }, 'dError');
	let dSubmitOrRestart = ui.dSubmitOrRestart = mDiv(dOben, { w: '100%' });
	let dOpenTable = ui.dOpenTable = mDiv(dMiddle, { w: '100%', padding: 10 }); mFlexWrap(dOpenTable);// mLinebreak(d_table);
	return [dOben, dOpenTable, dMiddle, dRechts];
}
function ui_player_info(g, dParent, outerStyles = { dir: 'column' }, innerStyles = {}) {
	let fen = g.fen;
	let players = dict2list(fen.players, 'name');
	players = sortByFunc(players, x => fen.plorder.indexOf(x.name));
	if (nundef(outerStyles.display)) outerStyles.display = 'flex';
	mStyle(dParent, outerStyles);

	let items = {};
	let styles = jsCopy(innerStyles); addKeys({ rounding: 10, bg: '#00000050', margin: 4, padding: 4, patop: 12, box: true, 'border-style': 'solid', 'border-width': 6 }, styles);
	for (const pl of players) {
		let uname = pl.name;
		let imgPath = `../base/assets/images/${uname}.jpg`;
		styles['border-color'] = get_user_color(uname);
		let item = mDivItem(dParent, styles, name2id(uname));
		let d = iDiv(item);

		//let bc=pl.playmode == 'bot'?'red':'white';
		let picstyle = { w: 50, h: 50, box: true };
		let ucolor = get_user_color(uname);
		if (pl.playmode == 'bot') {
			copyKeys({ rounding: 0, border: `double 6px ${ucolor}` }, picstyle);
		} else {
			copyKeys({ rounding: '50%', border: `solid 2px white` }, picstyle);
		}
		let img = mImage(imgPath, d, picstyle, 'img_person');

		// let d1=mDiv(d,{w: 50, h: 50});
		// if (pl.playmode == 'bot') {
		// 	//console.log('d', d, d.children[0]); let img = d.children[0];
		// 	let d2 = mText('B', d1, { fg: 'red', fz: 20, position:'absolute',top:'50%',left:'50%'});
		// 	//mPlace(d2, 'cc');
		// }


		items[uname] = item;
	}
	return items;
}



















