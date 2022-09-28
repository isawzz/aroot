DA.simple = false;
onload = start;

function start() { phpPost({ app: 'simple' }, 'assets'); }
function start_with_assets() { if (DA.simple) start_simple(); else start_advanced(); }

//ab hier soll der gesamte ui code refactored werden!
function start_advanced() {
	dTable = mBy('dTable');dTitle = mBy('dTitle');
	show('dTopAdvanced');
	show_tables();
	show_games();
	
	show_title();
	show_home_logo();
	dTitle.animate([{ opacity: 0 }, { opacity: 1 },], { fill: 'both', duration: 1000, easing: 'ease-in' });
	dTable = mBy('dTable'); //mStyle(dTable,{w:'100%',display:'flex'}) 
	show_users();

	//mColFlex(dTable); 
	//mCenterCenterFlex(dTable); mStyle(dTable, { fg: 'white', bg: GREEN })

	//onclick_user('afia');
	//startgame('bluff', ['afia','amanda','felix','meckele','mimi','nasi'], {min_handsize:2,max_handsize:4});
	if (!isEmpty(Serverdata.tables)) onclick_game_in_gametable(Serverdata.tables[0].friendly);

	//find_sequences(['2C','3C'],2, 'A23456789TJQK',true); 
	//find_sequences(['AS','3C','QS','KH','2S','2H','JH','2D','3H','TS','TH'],2, 'A23456789TJQK',true);
	//console.log('setup',aristo().setup(['felix','amanda'],{winning_score:9,mode:'hotseat'}));

	//testSplitIntoNumbersAndWords();

}
function activate_ui() { uiActivated = true; }
function clearTable() {
	clearElement('dTable');
	clearElement('dHistory');
	show_title();
	clearElement('dMessage');
	clearElement('dInstruction');
	clearElement('dTitleRight');
	hide('bPauseContinue');
}
function clearStatus() { clearFleetingMessage(); }
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
function deactivate_ui() { uiActivated = false; }
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
function get_next_player(g, uname) {
	let plorder = g.fen.plorder;
	let iturn = plorder.indexOf(uname);
	let nextplayer = plorder[(iturn + 1) % plorder.length];
	return nextplayer;
}
function get_user_color(uname) { let u = firstCond(Serverdata.users, x => x.name == uname); return u.color; }
function get_user_pic(uname, dParent, sz = 50, border = 'solid medium white') {
	let html = `
			<div username='${uname}' style='text-align:center;font-size:${sz / 3}px'>
				<img src='../base/assets/images/${uname}.jpg' width='${sz}' height='${sz}' class='img_person' style='margin:0;border:${border}'>
				<br>${uname}
			</div>`;
	let elem = mCreateFrom(html);
	mAppend(dParent, elem);
	return elem;
}
function hFunc(content, funcname, arg1, arg2, arg3) {
	//console.log('arg2',arg2,typeof arg2)
	let html = `<a style='color:blue' href="javascript:${funcname}('${arg1}','${arg2}','${arg3}');">${content}</a>`;
	return html;
}
function hide_options_popup() {
	let d = mBy('dOptions');
	if (isdef(d)) mRemove(d);
}
function rPlayerOrder(players) { return shuffle(jsCopy(players)); }
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
			for (const v of list) { mRadio(v, isNumber(v) ? Number(v) : v, key, fs, { cursor: 'pointer' }, null, key, true); }
			measure_fieldset(fs);
		}
	}

}
function show_games() {
	let dParent = mBy('dGames');
	show(dParent);
	clearElement(dParent);
	toggle_games_on();
	mText(`<h1>start new game</h1>`, dParent, { maleft: 12 });

	let html = `<div id='game_menu' style="color:white;text-align: center; animation: appear 1s ease both">`;
	for (const g of dict2list(Config.games)) { html += ui_game_menu_item(g); }
	mAppend(dParent, mCreateFrom(html)); //dParent.innerHTML = html;
	mCenterCenterFlex(mBy('game_menu'));

}
function show_home_logo() {
	let bg = colorLight();
	clearElement('dTitleLeft');
	let d = miPic('airplane', mBy('dTitleLeft'), { fz: 28, padding: 6, h: 40, box: true, matop: 2, bg: bg, rounding: '50%' });
}
function show_instruction(msg = '') { let d = mBy('dInstruction'); d.innerHTML = msg; }
function show_message(msg = '') { let d = mBy('dMessage'); d.innerHTML = msg; }
function show_options_popup(options) {
	let x = mYaml(mCreate('div'), options);
	let dpop = mPopup(x.innerHTML, dTable, { fz: 16, fg: 'white', top: 0, right: 0, border: 'white', padding: 10, patop: 30, bg: 'dimgray' }, 'dOptions');
	//console.log('popup', dpop);
}
function show_player_mode(dParent, g, uname) {
	let dplmode = valf(mBy('dPlayerMode'), mDiv(dParent, { fg: 'blue', fz: 12, padding: 4 }, 'dPlayerMode'));
	mCenterCenterFlex(dplmode);

	let plmode = lookupSet(g.fen, ['players', uname, 'playmode'], 'human'); //sets to human if not set!
	dplmode.innerHTML = plmode;

	//playmode change only if it is this player's turn!
	if (g.fen.turn.includes(uname)) {
		dplmode.onclick = () => {
			let playermode = lookup(g.fen, ['players', uname, 'playmode']);
			playermode = lookupSetOverride(g.fen, ['players', uname, 'playmode'], playermode == 'human' ? 'bot' : 'human');
			//console.log('hhhhhhhhhhhhhhh');
			dplmode.innerHTML = playermode;
			if (playermode == 'bot') ai_move();
		}
		mStyle(dplmode, { cursor: 'pointer' });
	}

}
function show_settings(g, playername) {
	let [options, fen] = [g.options, g.fen];
	clearElement('dTitleRight');
	let dParent = mBy('dTitleRight');
	mFlex(dParent);
	show_player_mode(dParent, g, playername);
	let dgamemode = mDiv(dParent, { fg: 'red' }, null, options.mode[0]); //options.mode == 'hotseat' ? 'h' : '');
	let d = miPic('gear', dParent, { fz: 20, padding: 6, h: 40, box: true, matop: 2, rounding: '50%', cursor: 'pointer' });
	d.onmouseenter = () => show_options_popup(options);
	d.onmouseleave = hide_options_popup;
}
function show_settings_orig(options) {
	clearElement('dTitleRight');
	let dParent = mDiv(mBy('dTitleRight'), { display: 'flex', fg: 'red' }, null, options.mode == 'hotseat' ? 'h' : '');

	let d = miPic('gear', dParent, { fz: 20, padding: 6, h: 40, box: true, matop: 2, rounding: '50%', cursor: 'pointer' });
	d.onmouseenter = () => show_options_popup(options);
	d.onmouseleave = hide_options_popup;
}
function show_medium_ui() { DA.testing = false; hide('dButtons'); hide('dTest0'); hide('dTopAdvanced'); toggle_games_off(); } //toggle_tables_off();  }
function show_simple_ui_orig() {
	DA.testing = false;
	hide('dButtons');
	hide('dTest0');
	hide('dTopAdvanced');
	toggle_games_off();
	toggle_tables_off();
	toggle_users_on();
}
function show_advanced_ui() {
	show('dButtons');
	show('dTest0');
	show('dTopAdvanced');
	//hier koennt ich auch activate test vars machen!!!
	DA.testing = true;
	DA.test = { iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [100, 101] };

	//hier setze default tests!
	DA.test.list = arrRange(100, 101); //[];// [100, 101, 102, 103, 104];
	DA.test.number = 306; // do NOT set this to 107 in real mode!
	DA.staged_moves = []; DA.iter = 100; DA.auto_moves = {};

}
function show_status(msg = '', stay) {
	if (isdef(stay)) showFleetingMessage(msg, mBy('dStatus'), { fg: 'red' }, 1000, 0, false);
	else showFleetingMessage(msg, mBy('dStatus'), { fg: 'black' });  //let d = mBy('dStatus'); d.innerHTML = msg; 
}

function mTableCommands(rowitems, di) {
	let t = rowitems[0].div.parentNode;
	mTableHeader(t, 'commands');
	for (const item of rowitems) {
		let drow = item.div;
		let dcol = mTableCol(drow);
		let colitem = { div: dcol, key: 'commands', val: null };
		item.colitems.push(colitem);
		let html = '';
		for (const k in di) {
			html += di[k](item); //`<a href="/loggedin/${item.o.name}">login</a>`);

		}
		dcol.innerHTML = html;
	}
}
function show_tables() {
	if (DA.simple) { show_tables_simple(); return; }
	let dParent = mBy('dTables');
	show(dParent);
	clearElement(dParent);
	toggle_tables_on();

	let tables = DA.simple && isdef(U) ? Serverdata.tables.filter(x => x.players.includes(U.name)) : Serverdata.tables;
	if (isEmpty(tables)) { mText('no active game tables', dParent); return []; }

	//show_x_button(dParent);
	mText(`<h1>${DA.simple && isdef(U) ? U.name + "'s" : 'all'} game tables</h1>`, dParent, { maleft: 12 })
	let t = mDataTable(tables, dParent, null, ['game', 'mode', 'friendly', 'plorder', 'players'], 'tables');

	mTableCommandify(t.rowitems, {
		2: (item, val) => hFunc(val, 'onclick_game_in_gametable', val, item.id),
	});

	if (DA.simple) return;

	mTableCommandify(t.rowitems, {
		3: (item, val) => { return item.o.mode == 'hotseat' ? val : mTableCommandifyList(item, val, (rowitem, valpart) => hFunc(valpart, 'onclick_player_in_gametable', valpart, rowitem.o.friendly, rowitem.id)); },
	});
	//console.log('t', t)
	let d = iDiv(t);
	let x = mAppend(d.firstChild.firstChild, mCreate('th')); //'<th>hallo</th>'));
	x.innerHTML = 'commands';
	//console.log('x', x);
	for (const ri of t.rowitems) {
		let r = iDiv(ri);
		let h = hFunc('delete', 'delete_table', ri.o.friendly);

		c = mAppend(r, mCreate('td')); //'<th>hallo</th>'));
		c.innerHTML = h;

	}
	//mTableHeader(iDiv(t), 'hallo');
	//mTableCommands(t.rowitems, { login: x => `<a href="javascript:console.log('hallo')>hallo</a>` });

}
function delete_table(friendly) { stopgame(); phpPost({ friendly: friendly }, 'delete_table'); }

function show_title(s = 'My Little World', styles = {}, funnyLetters = true) {
	show('dTitle');
	let d = mBy('dTitleCenter');
	// d.innerHTML = isdef(G) ? `Battle of ${mColorLetters(capitalize(G.friendly))}` : `${funnyLetters ? mColorLetters(s) : s}`;
	d.innerHTML = `${funnyLetters ? mColorLetters(s, 'medium') : s}`;
	if (isdef(styles)) mStyle(d, { fg: 'grey' });
}
function show_title_left(s, styles, funnyLetters = false) {
	let d = mBy('dTitleLeft');
	d.innerHTML = `${funnyLetters ? mColorLetters(s) : s}`;
	if (isdef(styles)) mStyle(d, styles);
}
function show_title_right(s, styles, funnyLetters = false) {
	let d = mBy('dTitleRight');
	d.innerHTML = `${funnyLetters ? mColorLetters(s) : s}`;
	if (isdef(styles)) mStyle(d, styles);
}
function show_user() {
	//console.log('U',U)
	if (isdef(U) && U.name != 'anonymous') {
		//show_title_left(U.name, { fg: U.color });
		let uname = U.name;
		let sz = 36;
		let html = `
		<div username='${uname}' style='display:flex;align-items:center;gap:6px;height:100%'>
			<img src='../base/assets/images/${uname}.jpg' width='${sz}' height='${sz}' class='img_person' style='border:3px solid ${U.color};margin:0'>
			<span>${uname}</span>
		</div>`;
		show_title_left(html, { fg: U.color });
		// mUserPic(U.name, mBy('dTitleLeft'));
	}
	else show_home_logo();
}
function show_users() {
	toggle_users_on(); //show(dParent);
	let dParent = mBy('dUsers');
	clearElement(dParent); mCenterFlex(dParent); mStyle(dParent, { gap: 10, padding: 10 })
	for (const u of Serverdata.users) {
		let d = get_user_pic(u.name, dParent); //,'onclick_user'); //mAppend(dParent, elem);
		d.onclick = () => onclick_user(u.name); //"${funcname}('${uname}');"
		mStyle(d, { cursor: 'pointer' });
	}
}
function show_x_button(dParent) {
	let b = mButton('close', () => hide(dParent), dParent, { maleft: '95%' });
}
function startgame(game, players, options) {
	if (nundef(game)) game = 'spotit';

	if (nundef(players)) players = rChoose(Serverdata.users, 2).map(x => x.name);

	let fen = window[game]().setup(players, options);
	let expected = {}; fen.turn.map(x => expected[x] = { stage: fen.stage, step: 0 });
	let o = {
		friendly: generate_table_name(players.length), game: game, host: players[0], players: players,
		phase: fen.phase, stage: fen.stage, step: 0, round: 0, fen: fen, expected: expected, options: options
	};

	//console.log('sending startgame', o)
	ensure_polling();
	phpPost(o, 'startgame');
}
function stopgame() {
	clearTimeout(TO.ai);
	//clearStatus();
	pollStop();
	clearTable();
	G = null;
}
function toggle_games_on() { let a = mBy('aGames'); mStyle(a, { bg: 'skyblue' }); }
function toggle_games_off() { let a = mBy('aGames'); hide('dGames'); mStyle(a, { bg: 'silver' }); }
function toggle_tables_on() { let a = mBy('aTables'); mStyle(a, { bg: '#afe78f' }); } //'lightgreen' }); }
function toggle_tables_off() { let a = mBy('aTables'); hide('dTables'); mStyle(a, { bg: 'silver' }); }
function toggle_users_on() { let a = mBy('aUsers'); mStyle(a, { bg: 'coral' }); }
function toggle_users_off() { let a = mBy('aUsers'); hide('dUsers'); mStyle(a, { bg: 'silver' }); }
function ui_game_menu_item(g, g_tables = []) {
	function runderkreis(color, id) {
		return `<div id=${id} style='width:20px;height:20px;border-radius:50%;background-color:${color};color:white;position:absolute;left:0px;top:0px;'>` + '' + "</div>";
	}
	let [sym, bg, color, id] = [Syms[g.logo], g.color, null, getUID()];
	if (!isEmpty(g_tables)) {
		let t = g_tables[0]; //most recent table of that game
		let have_another_move = t.player_status == 'joined';
		color = have_another_move ? 'green' : 'red';
		id = `rk_${t.id}`;
	}
	return `
	<div onclick="onclick_game_menu_item(event)" gamename=${g.id} style='cursor:pointer;border-radius:10px;margin:10px;padding:5px;padding-top:15px;width:120px;height:90px;display:inline-block;background:${bg};position:relative;'>
	${nundef(color) ? '' : runderkreis(color, id)}
	<span style='font-size:50px;font-family:${sym.family}'>${sym.text}</span><br>${g.friendly}</div>
	`;
}
function ui_player_info(g, dParent) {
	let fen = g.fen;
	let players = dict2list(fen.players, 'name');
	players = sortByFunc(players, x => fen.plorder.indexOf(x.name));
	//console.log('playerlist', players); console.log('=>', players);
	//let dPanel = mDiv(dParent, { display: 'flex', dir: 'column' }); // }); //, 'align-items': 'space-evenly' });
	mStyle(dParent, { display: 'flex', dir: 'column' });
	let items = {};
	for (const pl of players) {
		let uname = pl.name;
		let imgPath = `../base/assets/images/${uname}.jpg`;
		//console.log('name2id', uname); console.log(':', name2id(uname))
		let item = mDivItem(dParent, { bg: pl.color, fg: colorIdealText(pl.color), margin: 4, rounding: 10 }, name2id(uname));
		let img = mImage(imgPath, iDiv(item), { w: 50, h: 50 }, 'img_person');
		//console.log('turn', g.turn, uname)
		let onturn = g.turn.includes(uname);
		let border = onturn ? uname == U.name ? 'solid 5px lime' : 'solid 5px red' : null;//'solid medium white';
		if (border) mStyle(iDiv(item), { border: border, box: true });
		items[uname] = item;
	}
	return items;
}


//#region version_0
function show_user_version_0() {
	//console.log('U',U)
	if (isdef(U) && U.name != 'anonymous') show_title_left(U.name, { fg: U.color });
	else show_home_logo();
}
function show_users_version_0() {
	//console.log('Serverdata.users',Serverdata.users)
	let dParent = mBy('dAllTables');
	show(dParent);
	clearElement(dParent);
	let headers = ['id', 'name', 'motto', 'commands'];
	let t = mDataTable(Serverdata.users, dParent, rec => ({ fg: 'contrast', bg: rec.color }), headers, 'users');
	mTableCommandify(t.rowitems, {
		1: (item, val) => hFunc(val, 'onclick_user', val),
	});
	return t;
}


//#endregion

