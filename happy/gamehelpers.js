function assertion(cond) {
	if (!cond) {
		let args = [...arguments];
		//console.log('args',args)
		for (const a of args) {
			console.log('\n', a);
		}
		throw new Error('TERMINATING!!!')
	}
}
function activate_ui() { uiActivated = true; DA.ai_is_moving = false; }
function deactivate_ui() { uiActivated = false; DA.ai_is_moving = true; }
function clear_status() { if (nundef(mBy('dStatus'))) return; clearTimeout(TO.fleeting); mRemove("dStatus"); }
//function clear_table() { clear_status(); clear_title(); mStyle(document.body, { bg: 'white', fg: '#111111' }) }
function clear_title() { mClear('dTitleMiddle'); mClear('dTitleLeft'); mClear('dTitleRight'); }

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

function is_just_my_turn() { return isEmpty(Z.turn.filter(x => x != Z.uplayer)); }
function player_stat_count(key, n, dParent, styles = {}) {
	let sz = valf(styles.sz, 16);
	//console.log('hallo!!!')
	let d = mDiv(dParent, { display: 'flex', margin: 4, dir: 'column', wmax: sz, hmax: 2 * sz, 'align-content': 'start', fz: sz, align: 'center' });
	let s = mSym(key, d, { h: sz, fz: sz });
	d.innerHTML += `<span style="font-weight:bold">${n}</span>`;
	return d;
}

function set_user(name) { if (isdef(U) && U.name != name) { Z.prev.u = U; Z.prev.uname = U.name; } U = Z.u = firstCond(Serverdata.users, x => x.name == name); Z.uname = name; }
function set_player(name, fen) {
	if (isdef(PL) && PL.name != name) { Z.prev.pl = PL; Z.prev.uplayer = PL.name; }
	PL = Z.pl = firstCond(Serverdata.users, x => x.name == name);
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
	for (const g of dict2list(Config.games)) { html += ui_game_menu_item(g); }
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
function show_role() {

	let d = mBy('dAdminMiddle');
	clearElement(d);
	let hotseatplayer = Z.uname != Z.uplayer && Z.mode == 'hotseat' && Z.host == Z.uname;
	let styles = Z.role == 'active' || hotseatplayer ? { fg: 'red', weight: 'bold', fz: 20 } : { fg: 'black', weight: null, fz: null };
	// let text = Z.role == 'active'? `<div class='mCenterCenterFlex'>${get_waiting_html()}It's your turn!</div>`:Z.role == 'spectator'?"(spectating)":'';
	let text = hotseatplayer ? `you turn for ${Z.uplayer}` : Z.role == 'active' ? `It's your turn!` : Z.role == 'spectator' ? "(spectating)" : `(${Z.turn[0]}'s turn)`;
	d.innerHTML = text;
	mStyle(d, styles);//style="font-weight:bold;font-size:20px"
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
	clear_status();
	show_fleeting_message(s, 'dTest', { fz: 14, position: 'absolute', top: 5, right: 10 }, 'dStatus');
}
function show_tables(ms = 500) {

	clear_screen();
	let dParent = mBy('dTables');
	mClear(dParent);

	show_games();

	let tables = Serverdata.tables;
	if (isEmpty(tables)) { mText('no active game tables', dParent); return []; }

	mText(`<h2>game tables</h2>`, dParent, { maleft: 12 })
	let t = mDataTable(tables, dParent, null, ['friendly', 'game', 'players'], 'tables', false);

	mTableCommandify(t.rowitems, {
		0: (item, val) => hFunc(val, 'onclick_table', val, item.id),
	});



	//mRise(dParent, ms);
	//mRise('dScreen', 1000); 
}
function show_winners() {
	let winners = Z.fen.winner;
	let multiple_winners = winners.length > 1;
	//mach ein html von all den winne rpictures!
	let winner_html = winners.map(x => get_user_pic_html(x, 30)).join(' ');
	show_message(`<div style="display:flex;align-items:center"><div>GAME OVER! the winner${multiple_winners ? 's are: ' : ' is '}</div> ${winner_html}</div>`, true);
	//show_message(`GAME OVER! winner${multiple_winners ? 's are: ' + winners.join(', ') : ' is ' + winners[0]}`, true);
	mShield(dTable);

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
		let dHistory = mDiv(dParent, { padding: 6, margin: 4, bg: '#00000060', fg: 'white', hmax: 400, 'overflow-y': 'auto', w: 240, rounding: 12 }, null, html); //JSON.stringify(fen.history));
		//mNode(fen.history, dHistory, 'history');
	}

}
function show_hourglass(uname, d, sz, stylesPos = {}) {
	let html = get_waiting_html(sz);
	mStyle(d, { position: 'relative' });
	addKeys({ position: 'absolute' }, stylesPos);
	let dw = mDiv(d, stylesPos, `dh_${uname}`, html);
	
}
function remove_hourglass(uname){let d=mBy(`dh_${uname}`);if (isdef(d)) mRemove(d);}
function show_home_logo() {
	let bg = colorLight();
	let dParent = mBy('dAdminLeft');
	clearElement(dParent);
	let styles = { cursor:'pointer', fz: 24, padding: 6, h: 100, box: true, margin: 2 };
	let d = mImage('../base/assets/images/cosensus/cosensus-logo.png', dParent, styles);
	//let d = miPic('castle', dParent, { cursor:'pointer', fz: 24, padding: 6, h: 36, box: true, margin: 2 }); //, bg: bg, rounding: '50%' });
	d.onclick = onclick_home;
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
	phpPost({ app: 'easy' }, 'tables');
}
function show_users(ms = 300) {
	let dParent = mBy('dUsers');
	mClear(dParent);
	//mStyle(dParent, { gap: 10, padding: 10 });
	for (const u of Serverdata.users) {
		let d = get_user_pic_and_name(u.name, dParent);
		d.onclick = () => onclick_user(u.name);
		mStyle(d, { cursor: 'pointer' });
	}
	mFall(dParent, ms);
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
	ui.dError = mDiv(dOben, { w: '100%', bg: 'red', fg: 'yellow' }, 'dError');
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
	let styles = jsCopy(innerStyles); addKeys({ rounding: 10, bg: '#00000050', margin: 4, padding: 4, box: true, 'border-style': 'solid', 'border-width': 6 }, styles);
	for (const pl of players) {
		let uname = pl.name;
		let imgPath = `../base/assets/images/${uname}.jpg`;
		styles['border-color'] = get_user_color(uname);
		let item = mDivItem(dParent, styles, name2id(uname));
		let img = mImage(imgPath, iDiv(item), { w: 50, h: 50 }, 'img_person');
		items[uname] = item;
	}
	return items;
}



















