//#region account
function get_account() {
	let udata = get_current_userdata();
	mBy("inner_left_panel").innerHTML = createAccountContent(udata);
	// to_server(Session.cur_user, "contacts", php); 
}
function addColorPicker(c) {
	//console.log('addColorPicker geht!',c);
	//if (DA.colorPickerLoaded) return;
	//DA.colorPickerLoaded=true;
	let form = mBy('myform');
	let img = mBy('imgPreview');
	//let c = Session.cur_me.color; //get_user_color()
	let picker = mColorPickerBehavior(anyColorToStandardString(c), img, form,
		(a) => { DA.newColor = a; DA.colorChanged = true; },
		{ w: 322, h: 45, bg: 'green', rounding: 6, margin: 'auto', align: 'center' });

	if (is_online()) {
		img.ondragover = img.ondrop = img.ondragleave = handle_drag_and_drop;
		//hier brauch noch das drag to change image!
	}
	mBy('img_dd_instruction').style.opacity = is_online() ? 1 : 0;
	img.onload = null;
}
function collect_data() {
	var myform = mBy("myform");
	var inputs = myform.getElementsByTagName("INPUT");
	var data = {};
	for (var i = inputs.length - 1; i >= 0; i--) {
		var key = inputs[i].name;
		switch (key) {
			case "username":
			case "name":
				let uname = inputs[i].value;
				console.log(`${key} in input is`, uname);
				uname = replaceAllSpecialChars(uname, ' ', '_');
				uname = replaceAllSpecialChars(uname, '&', '_');
				uname = replaceAllSpecialChars(uname, '+', '_');
				uname = replaceAllSpecialChars(uname, '?', '_');
				uname = replaceAllSpecialChars(uname, '=', '_');
				uname = replaceAllSpecialChars(uname, '+', '_');
				uname = replaceAllSpecialChars(uname, '/', '_');
				uname = replaceAllSpecialChars(uname, '\\', '_');
				data[key] = uname.toLowerCase();
				break;
			case "motto":
				data[key] = inputs[i].value.toLowerCase();
		}
	}
	if (DA.imageChanged) {
		//do the same as I did before!
		sendHtml('imgPreview', Session.cur_user);
		//DA.imageChanged = false;
	} else {
		let udata = get_current_userdata();
		let changed = false;
		if (DA.colorChanged) { udata.color = DA.newColor; changed = true; }// DA.colorChanged = false;}
		if (data.motto != udata.motto) {
			changed = true;
			udata.motto = data.motto;
			mBy('motto').innerHTML = udata.motto;
		}
		if (changed) {
			//console.log('changed!');
			DA.next = get_login;
			db_save(); //save_users();

		}

	}


}
function createAccountContent(userdata) {
	DA.imageChanged = DA.colorChanged = false; //DA.colorPickerLoaded = false;
	//console.log('userdata', userdata);
	return `
	<div id="dAccount" style="max-width=500px; margin-top:10px; display:flex; animation: appear1 1s ease;justify-content:center; align-content:center">
		<div id="error">some text</div>
		<div style='text-align:center'>
			<form id="myform" autocomplete="off" style='text-align:center;background:${userdata.color}'>
				<span id='img_dd_instruction' style="font-size:11px;">drag and drop an image to change</span><br>
				<img id="imgPreview" onload='addColorPicker("${userdata.color}");' src='${get_image_path(userdata)}' ondragover="handle_drag_and_drop(event)" ondrop="handle_drag_and_drop(event)" ondragleave="handle_drag_and_drop(event)"
					style="height:200px;margin:10px;" />
				<input id='iUsername' type="text" name="motto" placeholder='motto' value="${userdata.motto}" autofocus
					onkeydown="if (event.keyCode === 13){event.preventDefault();collect_data(event);}" />
				<br />
				<input id='save_settings_button' type="button" value="Submit" onclick="collect_data(event)" ><br>
			</form>
	</div></div>
	`; //onload='addColorPicker(${userdata.color})' 
}
function sendHtml(id, filename) {
	//console.log('_______________HALLO!!!!')
	window.scrollTo(0, 0);
	html2canvas(document.getElementById(id)).then(function (canvas) {
		let imgData = canvas.toDataURL("image/jpeg", 0.9);
		var profile_image = mBy("profile_image");
		profile_image.src = imgData;
		mBy('imgPreview').src = imgData;
		var ajax = new XMLHttpRequest();
		ajax.open("POST", "server/save_url_encoded_image.php", true);
		ajax.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		//ajax.setRequestHeader("Cache-Control", "no-cache"); das ist es nicht!!!!!!!!!!!!!!!!!!!
		ajax.send("image=" + canvas.toDataURL("image/jpeg", 0.9) + "&filename=" + filename + ".jpg");
		ajax.onreadystatechange = function () {
			if (this.readyState == 4 && this.status == 200) {
				//console.log('RESPONSE IMAGE UPLOAD!!!!!!!', this.responseText);
				let udata = get_current_userdata();
				if (!udata.image) { udata.image = true; db_save(); } //save_users(); }
				get_login();
				//window.location.replace('index.html');
			}
		};
	});
}
//#endregion

//#region assets
function ensure_assets() {
	where([...arguments]);
	const asset_names = {
		'Syms': 'allSyms',
		'users': 'db_users',
		'games': 'db_games',
		'tables': 'db_tables',

	}
	//console.log('ensure_assets arguments',[...arguments])
	let list = [];
	for (const k of [...arguments]) {
		if (isdef(window[k]) || isdef(DB[k])) continue;
		let assetname = valf(asset_names[k], k);
		list.push(assetname);
	}
	//console.log('list',list);
	if (isEmpty(list)) {
		console.log('list is empty!');
		danext();

	} else assets_get(...list);
}
function ensure_assets_old(obj) {
	DB = jsyaml.load(obj.db);
	symbolDict = Syms = jsyaml.load(obj.syms);
	SymKeys = Object.keys(Syms);
	ByGroupSubgroup = jsyaml.load(obj.symGSG);
	WordP = jsyaml.load(obj.allWP);
	C52 = jsyaml.load(obj.c52);
	Cinno = jsyaml.load(obj.cinno);
	FenPositionList = csv2list(obj.fens);
	KeySets = getKeySets();
	console.assert(isdef(DB), 'NO DB!!!!!!!!!!!!!!!!!!!!!!!!!!!');
}
function reload_assets() {
	const asset_names = {
		'Syms': 'allSyms',
		'users': 'db_users',
		'games': 'db_games',
		'tables': 'db_tables',

	}
	assets_get(arguments);
}
function assets_get() {
	//console.log('assets_get arguments',[...arguments])
	where([...arguments]);
	to_server([...arguments], 'assets');
}
function assets_parse(o) {
	where(o);

	for (const k in o) {
		let text = o[k]; //supposedly just file contents as string
		//console.log('k', k);
		if (k == 'allSyms') {
			//reading Syms!
			symbolDict = Syms = jsyaml.load(text);
			SymKeys = Object.keys(Syms);
		} else if (k == 'symGSG') {
			ByGroupSubgroup = jsyaml.load(text);
		} else if (k == 'allWP') {
			WordP = jsyaml.load(text);
		} else if (k == 'fens') {
			FenPositionList = csv2list(text);
		} else if (startsWith(k, 'db_')) {
			let okey = stringAfter(k, '_');
			//console.log('DB',DB,k);
			DB[okey] = jsyaml.load(text);
			//window[capitalize(k)] = jsyaml.load(text); //default is yaml style content that translates to capitalized name as global asset
		} else {
			window[capitalize(k)] = jsyaml.load(text); //default is yaml style content that translates to capitalized name as global asset
		}
	}

	if (nundef(KeySets) && isdef(o.symGSG)) { KeySets = getKeySets(); }
}
//#endregion

//#region drag drop
function drag(e) {
	where();
	let newUsername = e.target.parentNode.getAttribute('username');
	//console.log('drag', newUsername);
	e.dataTransfer.setData("username", newUsername);
}
function handle_drag_and_drop(e) {
	//return;
	if (e.type == "dragover") {
		e.preventDefault();
		mClass(e.target, "dragging");
	} else if (e.type == "dragleave") {
		mClassRemove(e.target, "dragging");
	} else if (e.type == "drop") {
		let target = e.target;
		let id = target.id;
		mClassRemove(e.target, "dragging");
		//changing user image
		console.log('===>dropped on target:', e.target);
		e.preventDefault();
		DA.imageChanged = true;
		mClassRemove(e.target, "dragging");
		mDropImage(e, e.target);
	} else {
		mClassRemove(e.target, "dragging");
	}
}
//#endregion

//#region games menu
function set_user_tables_by_game(obj) {
	//console.log('present_games: obj',obj);
	let user_tables = obj.user_tables;
	//user_tables.map(x => console.log('table:', x));

	//what if user_tables is empty?
	let bygame = Session.user_tables_by_game = {};
	if (isEmpty(user_tables)) {
		Session.cur_tid = null;
		Session.user_tables_by_game = {};
	} else {
		//got tables sorted by most recent first
		Session.cur_tid = user_tables[0].id;
		for (const t of user_tables) { lookupAddToList(bygame, [t.game], t); }
	}
	return bygame;
}
function present_games(obj) {
	bygame = set_user_tables_by_game(obj);
	mBy('inner_left_panel').innerHTML = createGamesContent(dict2list(DB.games), bygame);
	mCenterCenterFlex(mBy('game_menu'));
}
function createGamesContent(mygames, tables = {}) {
	let mydata = uiGetGamesStylesAndStart();
	mydata += uiGetGames(mygames, tables);
	return mydata;
}
function uiGetGamesStylesAndStart() {
	let mydata = `
	<style>

 		.contact{
 			cursor:pointer;
 			transition: all .5s cubic-bezier(0.68, -2, 0.265, 1.55);
	 	}

	 	.contact:hover{
	 		transform: scale(1.1);
	 	}

	</style>
	<div id='game_menu' style="text-align: center; animation: appear 1s ease both">
  `;
	return mydata;
}
function uiGetGames(mygames, tables) {
	mydata = '';
	for (const r of mygames) {
		row = r;
		mydata += uiGetGame(row, tables[r.id]);
	}
	return mydata;
}
function uiGetGame(gi, tables = []) {
	//tables is: tables of that game! gi.id
	//console.log('* gi.id * tables', tables);
	let sym = Syms[gi.logo];
	let bg = getColorDictColor(gi.color);
	let gname = gi.id;
	let uname = Session.cur_user;
	let color = null, id = getUID();
	if (!isEmpty(tables)) { //!isEmpty(tables)) {
		let t = tables[0];
		//for color look at first of tables (=most recent!)

		let table_status = t.status;
		let my_status = t.player_status;
		let have_another_move = my_status == 'joined' || my_status == 'lamov';

		color = have_another_move ? 'green' //lookup(Session,['t_play',gname])?'green'
			: t.player_status == 'join' ? 'orange'
				: t.host == uname && t.status == 'ready' ? 'yellow'
					: table_status == 'show' || t.status == 'seen' ? 'blue'
						: t.status == 'ending' ? 'red' : 'black';
		id = `rk_${t.id}`;
		//console.log(':::Scolor is', color ? color : 'null');
	}
	return `
	<div onclick="onclick_game_in_games_menu(event)" gamename=${gi.id} style='cursor:pointer;border-radius:10px;margin:10px;padding:5px;padding-top:15px;width:120px;height:90px;display:inline-block;background:${bg};position:relative;'>
	${nundef(color) ? '' : runderkreis(color, id)}
	<span style='font-size:50px;font-family:${sym.family}'>${sym.text}</span><br>${gi.friendly}</div>
	`;
}
function runderkreis(color, id) {
	//console.log('color', color);
	return `<div id=${id} style='width:20px;height:20px;border-radius:50%;background-color:${color};color:white;position:absolute;left:0px;top:0px;'>` + '' + "</div>";
}
//#endregion

//#region game options
function open_game_options(gamename) { present_game_options(gamename); }
function close_game_options() { mBy('inner_left_panel').innerHTML = ''; }
function extract_game_options() {
	//hier werden die options in game menu eingelesen
	let opt = Session.game_options;
	//players: TODO!!!
	//opt.players = Session.def_players;
	//mode: automatically set in options menu
	//at the end of this, Session.game_options should be up-to-date!
	return Session.game_options;
}
function get_lobby() {
	let html = `
	<div id="lobby_holder" class="layout_lobby">
		<div id="lobby_header"><div class='logo'>⛱</div></div>

		<div id="lobby_main">
				<div id='d_game_options' class='vCenterChildren'>
				</div>
				<div class="button_wrapper">
					<button id='bJoinGame' class='button' style='display:none'>join game</button>
					<button id='bCreateGame' class='button' onclick='onclick_create_game_button()'>create game</button>
					<button id='bResumeGame' class='button' style='display:none'>resume game</button>
					<button id='bLobbyOk' class='button' onclick='onClickCreateGameOk()' style='display:none'>Ok</button>
					<button id='bLobbyCancel' class='button' onclick='onClickCreateGameCancel()' style='display:none'>Cancel</button>
					<button id='bLobbyJoinOk' class='button' onclick='onClickJoinGameOk()' style='display:none'>Ok</button>
					<button id='bLobbyJoinCancel' class='button' onclick='onClickJoinGameCancel()' style='display:none'>Cancel</button>
				</div>
			</div>
		</div>

	`;
	return html;// createElementFromHTML(html);
}
function present_game_options() {
	let gname = Session.cur_game;
	let g = DB.games[gname];
	Session.game_options = {};

	let d = mBy('inner_left_panel');
	d.innerHTML = get_lobby();
	let d1 = mBy('d_game_options');

	spotit_populate_settings(d1);

	populate_playmode(d1, g.av_modes);
	group = mRadioGroup(d1, { wmin: 190 }, 'd_players', 'players'); //create another fieldset with legend players
	populate_players(get_def_players_for_user(Session.cur_user));


}
function mTextArea(rows, cols, dParent, styles = {}, id) {
	let html = `<textarea id="${id}" rows="${rows}" cols="${cols}" wrap="hard"></textarea>`;
	let t = createElementFromHTML(html);
	mAppend(dParent, t);
	mStyle(t, styles);
	return t;
}
//only multi is enabled right now!!!!
function populate_playmode(d, modes) {

	let group = mRadioGroup(d, {}, 'd_mode', 'play mode');

	modes = modes.split(',');
	//console.log('modes', modes);
	for (const m of modes) {
		let name = m == 'pp' ? 'pass&play' : m == 'multi' ? 'multiplayer' : m;
		//let d = mRadio(name, m, group, {cursor:'pointer'}, v => { Session.game_options.mode = v; populate_players(v); }, 'mode'); //{h:40,w:150,bg:'red'},'mode');
		let d = mRadio(name, m, group, { cursor: 'default' }, null, 'mode');
		let inp = d.firstChild;
		inp.setAttribute('disabled', true);
		if (m != 'multi') mClass(d, 'disabled');
		//let d = mRadioAttrappe(name, m, group, {});
		//for(el of [d,d.firstChild,d.children[1]])		mClass(el,m=='multi'?'enabled':'disabled');
	}

	measure_fieldset(group);

	//at population, set first option or param defaultMode
	let mode = Session.game_options.mode = modes.includes(Session.def_playmode) ? Session.def_playmode : modes[0];
	let el = mBy(`i_mode_${mode}`).checked = true;

}
function populate_players(list) {
	let d = mBy('d_players');
	if (nundef(d)) return;
	mRemoveChildrenFromIndex(d, 1);
	Session.game_options.players = [];

	//multi mode: TODO select/add/remove players for now: fixed Session.def_players
	for (const name of list) {
		Session.game_options.players.push(name); //initially all default players are in list

		//host cannot be removed from player list!
		if (name == Session.cur_user) { let el = mToggle(name, name, d); el.firstChild.setAttribute('disabled', true); }
		else { mToggle(name, name, d, { cursor: 'pointer' }); }

	}

	d_players.innerHTML += '<br>';
	mTextArea(3, 20, d_players, { fz: 16, display: 'none', resize: 'none', border: 'none', outline: 'none' }, 'ta_edit_players');
	d_players.innerHTML += '<br>';
	//mLinebreak(d_players,0);

	measure_fieldset(d);

	mButton('edit', onclick_edit_players, d_players, { fz: 14, wmin: '90%' }, null, 'b_edit_players');

}
//#endregion

//#region intro user screen
function get_intro() { to_server(Session.cur_user, "intro"); }
function present_intro(obj) { param_present_contacts(obj, mBy('dIntro'), 'onclick_user_in_intro'); }
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
function show_guest_screen() { get_intro(); }
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

//#region login
function get_login(php = true) { to_server(Session.cur_user, "login", php); }
function present_login(obj) { param_present_contacts(obj, mBy('inner_left_panel'), 'onclick_user_login'); }
//#endregion

//#region spotit: uses global Session.items
function measure_fieldset(fs) {
	let legend = fs.firstChild;
	let r = getRect(legend);
	//console.log('r legend', r.w);

	let labels = fs.getElementsByTagName('label');
	//console.log('labels', labels);
	let wmax = 0;
	for (const l of labels) {
		let r1 = getRect(l);
		//console.log('l', l.innerHTML, r1.w);
		wmax = Math.max(wmax, r1.w);
	}
	//console.log('max width of labels', wmax);

	let wt = r.w;
	let wo = wmax + 24;
	let diff = wt - wo;
	if (diff >= 10) {
		//verschiebe all die labels
		for (const l of labels) { let d = l.parentNode; mStyle(d, { maleft: diff / 2 }); }

	}
	//each label should be at least 50 px wide!

	//fs min-width setzen
	let wneeded = Math.max(wt, wo) + 10;
	mStyle(fs, { wmin: wneeded });
	for (const l of labels) { let d = l.parentNode; mStyle(l, { display: 'inline-block', wmin: 50 }); mStyle(d, { wmin: wneeded - 40 }); }



}
function spotit_populate_settings(dParent) {
	//console.log('HALLO!!!!!!!!!!!!!');
	Session.game_options.game = {};

	//wo find ich possible settings?
	let poss = DB.games[Session.cur_game].options;
	if (nundef(poss)) return;

	for (const p in poss) {
		//p is the name of the variable
		//poss[p] are possible values
		//can be string of strings or numbers =>convert to string list or number list and make it a radio
		//can be true or false => make it a checkbox
		//=>todo: could be a range as well
		let key = p;
		let val = poss[p];
		if (isString(val)) {
			// make a list 
			let list = val.split(','); //besser!!!
			let fs = mRadioGroup(dParent, {}, `d_${key}`, key);
			let checkfirst = true;
			for (const v of list) {
				let d = mRadio(v, isNumber(v) ? Number(v) : v, fs, { cursor: 'pointer' }, null, key);
				if (checkfirst) {
					//let el = mBy(`i_mode_${mode}`).checked = true;
					let inp = d.firstChild;//.firstchild.checked=true;checkfirst = false;
					inp.setAttribute('checked', true); // = true;
					//console.log('should be input',inp);
					checkfirst = false;
				}
			}

			measure_fieldset(fs);

		} else if (val === true || val === false) {
			//wie mach ich eine checkbox?
			// NOT IMPLEMENTED!!!
			console.log('should make a checkbox for', key);
		}
	}

}

function spotit_check_endcondition() {
	let players = get_values(Session.cur_players);
	//console.log(players.map(x=>'score:'+x.score));
	//console.log('')
	let winners = players.filter(x => x.score >= 2).map(x => x.name); //allCondDict(players, x => x.score >= Session.winning_score);
	return winners;

}
function spotit_card(info, dParent, cardStyles, onClickSym) {
	copyKeys({ w: CSZ, h: CSZ }, cardStyles);

	// //let card_container = mDiv(dParent,{padding:20});
	// mStyle(dParent,{bg:'red',hmin:CSZ+50});
	// let x = mDiv(dParent,{margin:20, w:200,h:200, bg:'white',fg:'black'},getUID(),'hallo','card',false);
	// return x;	

	let card = cRound(dParent, cardStyles, info.id);
	// return card;

	addKeys(info, card);

	let d = iDiv(card);
	card.pattern = fillColarr(card.colarr, card.keys);

	//could make each pattern be object {key:card.key,scale:card.scale}
	//instead of line above do this to include scale in pattern!
	let zipped = [];
	//console.log(card.scales);
	for (let i = 0; i < card.keys.length; i++) {
		zipped.push({ key: card.keys[i], scale: card.scales[i] });
	}
	card.pattern = fillColarr(card.colarr, zipped);

	// symSize: abhaengig von rows
	let symStyles = { sz: CSZ / (card.rows + 1), fg: 'random', hmargin: 8, vmargin: 4, cursor: 'pointer' };
	//console.log('sz',symStyles.sz,info.rows,info.cols);

	let syms = [];
	mRowsX(iDiv(card), card.pattern, symStyles, { 'justify-content': 'center' }, { 'justify-content': 'center' }, syms);
	for (let i = 0; i < info.keys.length; i++) {
		let key = card.keys[i];
		let sym = syms[i];
		card.live[key] = sym;
		sym.setAttribute('key', key);
		sym.onclick = onClickSym;
	}

	return card;
}
function spotit_deal(numCards, rows, cols, vocab, lang, min_scale, max_scale, fen) {
	lang = valf(lang, 'E');
	let colarr = _calc_hex_col_array(rows, cols);

	//correction for certain perCard outcomes:
	if (rows == 3 && cols == 1) { colarr = [1, 3, 1]; }
	else if (rows == 2 && cols == 1) { colarr = [1, 2]; }
	else if (rows == 4 && cols == 1) { rows = 3; colarr = [2, 3, 1]; }
	else if (rows == 5 && cols == 1) { rows = 4; cols = 1; colarr = [1, 3, 3, 1]; }
	else if (rows == 5 && cols == 3) { rows = 5; cols = 1; colarr = [1, 3, 4, 3, 1]; }
	else if (rows == 6 && cols == 2) { rows = 5.5; colarr = [2, 4, 5, 4, 2]; }

	//from here on, rows ONLY determines symbol size! colarr is used for placing elements

	let perCard = arrSum(colarr);
	let nShared = (numCards * (numCards - 1)) / 2;
	let nUnique = perCard - numCards + 1;
	let numKeysNeeded = nShared + numCards * nUnique;
	let nMin = numKeysNeeded + 3;
	let keypool = setKeys({ nMin: nMin, lang: valf(lang, 'E'), key: valf(vocab, 'animals'), keySets: KeySets, filterFunc: (_, x) => !x.includes(' ') });
	//console.log('keys', keypool);

	let keys = choose(keypool, numKeysNeeded);
	let dupls = keys.slice(0, nShared); //these keys are shared: cards 1 and 2 share the first one, 1 and 3 the second one,...
	let uniqs = keys.slice(nShared);
	//console.log('numCards', numCards, '\nperCard', perCard, '\ntotal', keys.length, '\ndupls', dupls, '\nuniqs', uniqs);

	let infos = [];
	for (let i = 0; i < numCards; i++) {
		let keylist = uniqs.slice(i * nUnique, (i + 1) * nUnique);
		//console.log('card unique keys:',card.keys);
		let info = { id: getUID(), shares: {}, keys: keylist, rows: rows, cols: cols, colarr: colarr, num_syms: perCard };
		infos.push(info);
	}

	let iShared = 0;
	for (let i = 0; i < numCards; i++) {
		for (let j = i + 1; j < numCards; j++) {
			let c1 = infos[i];
			let c2 = infos[j];
			let dupl = dupls[iShared++];
			c1.keys.push(dupl);
			c1.shares[c2.id] = dupl;
			c2.shares[c1.id] = dupl;
			c2.keys.push(dupl);
			//each gets a shared card
		}
	}

	for (const info of infos) { shuffle(info.keys); }

	//for each key make a scale factor
	//console.log('min_scale',min_scale,'max_scale',max_scale);
	for (const info of infos) {
		info.scales = info.keys.map(x => randomNumber(min_scale * 100, max_scale * 100) / 100);
		//info.scales = info.scales.map(x=>coin()?x:-x);
	}

	if (isdef(fen)) {
		let ks_for_cards = fen.split(',');
		for (let i = 0; i < infos.length; i++) {
			let info = infos[i];
			//console.log('vorher', jsCopy(info.keys), jsCopy(info.scales));
			let ks_list = ks_for_cards[i].split(' ');
			info.keys = ks_list.map(x => stringBefore(x, ':'));
			info.scales = ks_list.map(x => stringAfter(x, ':')).map(x => Number(x));
			//console.log('nachher', info.keys, info.scales);
		}
	}


	let items = [];
	for (const info of infos) {
		let item = spotit_card(info, dTable, { margin: 20 }, spotit_interact);
		//mStyle(iDiv(item), { animation: 'appear 1s ease' });
		items.push(item);
	}

	return items;

}
function spotit_evaluate() {
	//console.log('evaluating move: was soll geschehen?')
	if (!canAct()) return;
	uiActivated = false; clear_timeouts();
	IsAnswerCorrect = Selected.isCorrect;

	update_my_score(IsAnswerCorrect ? 1 : 0);
	let me = Session.cur_me;
	if (me.score >= Session.winning_score) me.player_status = 'done'; //*** player winning ****/

	//console.log('move ist correct?', IsAnswerCorrect ? 'JA!' : 'nope');
	let delay = show_feedback(IsAnswerCorrect);

	setTimeout(() => {
		in_game_open_prompt_off();
		clear_table_events();
		send_move();
	}, delay);

}
function spotit_interact(ev) {
	ev.cancelBubble = true;
	if (!canAct()) { console.log('no act'); return; }

	let keyClicked = evToProp(ev, 'key');
	let id = evToId(ev);

	if (isdef(keyClicked) && isdef(Items[id])) {
		let item = Items[id];
		//console.log('clicked key', keyClicked, 'of card', id, item);
		if (Object.values(item.shares).includes(keyClicked)) {
			let otherCard = spotitFindCardSharingSymbol(item, keyClicked);
			//console.log('otherCard', otherCard);
			let cardSymbol = ev.target;
			let otherSymbol = spotitFindSymbol(otherCard, keyClicked);
			//console.log('otherSymbol', otherSymbol);
			//mach die success markers auf die 2 symbols!
			Selected = { isCorrect: true, feedbackUI: [cardSymbol, otherSymbol] };

		} else {
			//console.log('fail!!!!!!!!'); //fail
			let cardSymbol = ev.target;
			Selected = { isCorrect: false, feedbackUI: [cardSymbol], correctUis: spotit_get_shared_symbols(), correctionDelay: Session.items.length * 1500 };

		}
		spotit_evaluate();
	}
}
//uses global: Session.items!
function spotit_get_shared_symbols() {
	let result = [];
	for (const item of Session.items) {
		for (const id in item.shares) {
			let k = item.shares[id];
			let ui = iGetl(item, k);
			result.push(ui);
		}
	}
	return result;
}
function spotit_fen() {
	let me = Session.cur_players[Session.cur_user];
	let items = Session.items;

	//state in spotit game is just 'key key..., key key...'
	let fen = items.map(x => x.keys.join(' ')).join(',');


	//neu: 'k:s k:s...,k:s k:s...
	let item_fens = [];
	for (const item of items) {
		let arr = arrFlatten(item.pattern);
		let ifen = arr.map(x => `${x.key}:${x.scale}`).join(' ');
		item_fens.push(ifen);
	}

	fen = item_fens.join(',');
	//console.log('fen',fen);
	me.state = fen;
}
function spotit_parse_fen() {

}

//#endregion

//#region table start and end
function create_new_table_and_join_all(user, game) {
	Session.cut_tid = Session.cur_table = null;
	let t = {};
	t.friendly = generate_friendly_table_name();
	t.game = 'gSpotit';
	t.host = Session.cur_user;
	t.players = valf(lookup(Session, ['game_options', 'players']), get_def_players_for_user(Session.cur_user));
	//console.log('def', Session.def_players, '\nopt', lookup(Session, ['game_options', 'players']), '\ntable', t.players);
	t.fen = 'noneed';
	t.options = valf(lookup(Session, ['game_options', 'game']), {});
	t.status = 'started'; // created
	t.host_status = 'joined'; // joined
	t.player_status = 'joined'; // join
	t.player_init = {};
	to_server(t, 'create_table_and_start');
}
function compute_elo_ranking(players, game) {
	//brauch ein ELO ranking! ranking ist: wer am oeftesten gewonnen hat
	//for each player in Session.cur_players
	players = sortBy(players, 'score');

	//jetzt mach ich aus den players buckets von gleichen scores
	let buckets = {};
	for (const pl of players) {
		let sc = pl.score;
		if (nundef(buckets[sc])) buckets[sc] = [];
		buckets[sc].push(pl.name);
	}
	//wieviele buckets gibt es?
	let nBuckets = get_keys(buckets).length;
	let elopart = 2 / (nBuckets - 1);
	let val = -1;
	for (const b in buckets) {
		for (const name of buckets[b]) {
			let elo = get_elo(name, game);
			set_elo(name, game, elo + val);
			console.log('user', name, 'with score', b, 'gets', val, 'added to elo!');
		}
		val += elopart;
	}
}
function delete_current_table() {
	if (nundef(Session.cur_tid)) return;
	to_server(Session.cur_tid, 'delete_table');
	Session.cur_tid = null;
	Session.cur_table = null;
}
function decrease_handicap_if_winstreak(winners, game) {
	//console.log('winners', winners);
	for (const w of winners) {
		let o = lookupSet(DB.users, [w, 'games', game], {});
		//o.winstreak = isdef(o.winstreak)?o.winstreak + 1:1;
		o.winstreak = DB.users[w].games[game].winstreak = isdef(o.winstreak) ? o.winstreak + 1 : 1;
		if (o.winstreak >= 3) {
			//this player will get his handicap increased!!!!
			lookupSetOverride(DB.users, [w, 'games', game, 'startlevel'], Math.min(o.startlevel + 1, Session.maxlevel));
			delete o.winstreak;
			console.log('...startlevel of', w, 'is increased to', get_startlevel(w, game));
		}
		console.log('user', w, 'db entry', o);
	}
}
function increase_handicap_if_losestreak(losers, game) {
	console.log('winners', losers);
	for (const w of losers) {
		let o = lookupSet(DB.users, [w, 'games', game], {});
		if (nundef(o.losestreak)) o.losestreak = 1; else o.losestreak += 1;
		if (o.losestreak >= 1) {
			//this player will get his handicap increased!!!!
			lookupSetOverride(o, ['startlevel'], Math.max(o.startlevel - 1, 0));
			o.losestreak = 0;
			console.log('...startlevel of', w, 'is decreased to', get_startlevel(w, game));
		}
	}
}
function record_winners(winners, game) { ensure_winnerlist(game).push(winners); } // lookupAddToList(DB.games, [game, 'winnerlist'], winners); }

//#endregion
function canAct() { return (aiActivated || uiActivated) && !auxOpen; }
function clear_table_all() {
	clear_table_events();
	if (isdef(mBy('table'))) clearTable();
	resetUIDs(); //sicherheitshalber!
	Items = {};
}
function clear_table_events() {
	clear_timeouts();
	STOPAUS = true;
	pauseSound();
	DELAY = 1000;
	uiActivated = aiActivated = false;
	onclick = null;
	clearMarkers();
}
function clearTable() {
	clearElement(dLineTableMiddle); clearElement(dLineTitleMiddle); removeMarkers();
}
function clear_timeouts() {
	clearTimeout(TOMain); TOMain = null;
	clearTimeout(TOTicker); TOTicker = null;
	clearTimeout(TOFleetingMessage); TOFleetingMessage = null;
	clearTimeout(TOTrial); TOTrial = null;
	if (isdef(TOList)) { for (const k in TOList) { TOList[k].map(x => clearTimeout(x)); } TOList = {}; }
	if (isdef(TOMan)) TOMan.clear();
}
function convert_from_row(row) {
	//row is modified!
	for (const k in row) {
		let val = row[k];
		if (isNumber(val)) row[k] = Number(val);
		if (isString(val) && val[0] == '{') row[k] = JSON.parse(val);
		if (k == 'players' && isString(row[k])) row[k] = val.split(',');
	}

}
function convert_from_server(obj) {
	//console.log('obj',obj)
	if (isdef(obj.table)) convert_from_row(obj.table);
	if (isdef(obj.playerdata)) {
		for (const row of obj.playerdata) {
			convert_from_row(row);
		}
	}
	if (isdef(obj.moves)) {
		for (const row of obj.moves) {
			convert_from_row(row);
		}
	}
}
function danext() { if (isdef(DA.next)) { let f = DA.next; DA.next = null; f(); } }
function db_save() {
	//console.log('_____db_save: InternetStatus:', is_online() ? 'online' : 'OFFLINE', '\nuser', DB.users[Session.cur_user]);
	if (!is_online()) { console.log('not saving! (no internet)'); return; }
	let txt = jsyaml.dump(DB);
	to_server({ db: txt }, 'dbsave');
}
function generate_friendly_table_name(game, players) {
	//list of places
	const europe_capitals = 'Amsterdam,	Ankara,	Astana,	Athens,	Baku,	Belgrade,	Berlin,	Bern,	Bratislava,	Brussels,	Bucharest,	Budapest,	Chisinau,	Copenhagen,	Dublin,	Helsinki,	Kiev,	Lisbon,	Ljubljana,	London,	Luxembourg,	Madrid,	Minsk,	Monaco,	Moscow,	Nicosia,	Oslo,	Paris,	Podgorica,	Prague,	Reykjavík,	Riga,	Rome,	San Marino,	Sarajevo,	Skopje,	Sofia,	Stockholm,	Tallinn,	Tbilisi,	Tirana,	Vaduz,	Valletta,	Vatican City,	Vienna,	Vilnius,	Warsaw,	Yerevan,	Zagreb';
	const asia_capitals = 'Abu Dhabi,	Amman,	Ankara,	Ashgabat,	Astana,	Baghdad,	Baku,	Bandar Seri Begawan,	Bangkok,	Beijing,	Beirut,	Bishkek,	Cairo,	Colombo,	Damascus,	Dhaka,	Dili,	Doha,	Dushanbe,	Hanoi,	Islamabad,	Jakarta,	Jerusalem,	Kabul,	Kathmandu,	Kuala Lumpur,	Kuwait City,	Malé,	Manama,	Manila,	Moscow,	Muscat,	Naypyidaw,	New Delhi,	Nicosia,	Phnom Penh,	Pyongyang,	Ramallah,	Riyadh,	Sana’a,	Seoul,	Singapore,	Taipei,	Tashkent,	Tbilisi,	Tehran,	Thimphu,	Tokyo,	Ulaanbaatar,	Vientiane,	Yerevan';

	//let list = europe_capitals.split(',\t');
	//console.log('list',list);
	return 'Battle of ' + chooseRandom(coin() ? europe_capitals.split(',\t') : asia_capitals.split(',\t'));
}
function generate_table_id(gamename) {
	//wie macht man einen timestamp?
	return gamename + '_' + get_timestamp();
}
function get_cur_menu() { if (isdef(Session.cur_menu)) window['get_' + Session.cur_menu](); }
function get_score_fen_from_cur_players() {
	let players = get_values(Session.cur_players);
	let sorted = sortByDescending(players, 'score');
	let list = sorted.map(x => `${x.name}:${x.score}`);
	let fen = list.join(',');
	return fen;
}
function get_games(php = true) { Session.cur_menu = 'games'; to_server(Session.cur_user, "games", php); }
function get_game_option(g, key) {
	let set_option = lookup(Session, ['cur_table', 'options', key]);
	if (set_option) return set_option;
	let opts = g.options[key];
	let defval = opts.split(',')[0];
	return defval;
}
function get_play(uname, tid) {
	uname = valf(uname, Session.cur_user);
	tid = valf(tid, Session.cur_tid);
	if (nundef(tid)) {
		//console.log('get_play: NO TABLE ID!!!');
		if (is_admin()) { get_games(); }
		else {
			//get this other screen
			show_user_intro_screen();
		}
	} else {
		Session.cur_menu = 'play';
		to_server({ uname: uname, tid: tid }, 'play');
	}
}
function get_user_tables() { to_server(Session.cur_user, "get_user_tables"); }
function get_keys(o) { return Object.keys(o); }
function get_values(o) { return Object.values(o); }
function get_image_path(userdata) {
	let p = '../base/assets/images/';
	if (userdata.image) p += userdata.name; else p += 'unknown_user';
	p += '.jpg';
	if (is_online()) p += '?=' + Date.now();
	//console.log('image path', p);
	return p;
}
function get_timestamp() { return new Date().getTime(); }
function in_game() { return isdef(mBy('table')) && Session.in_game == `${Session.cur_user} ${Session.cur_tid}`; }
function in_game_on() { Session.in_game = `${Session.cur_user} ${Session.cur_tid}`; }
function in_game_off() { Session.in_game = null; }
function in_game_open_prompt() { return uiActivated && Session.in_prompt == `${Session.cur_user} ${Session.cur_tid}`; }
function in_game_open_prompt_on() { Session.in_prompt = `${Session.cur_user} ${Session.cur_tid}`; }
function in_game_open_prompt_off() { Session.in_prompt = null; }
function is_admin(name) { return ['mimi'].includes(isdef(name) ? name : Session.cur_user); }
function is_game_host() { return Session.cur_table.host == Session.cur_user; }
function log_object(o) { let keys = get_keys(o); keys.sort(); for (const k of keys) { console.log('', k + ':', o[k]); } }
function make_players(playernames) {
	let o = Session.cur_players = {};

	for (const plname of playernames) {
		o[plname] = { name: plname, color: getColorDictColor(DB.users[plname].color), imgPath: `../base/assets/images/${plname}.jpg`, score: 0 };
	}

	Session.cur_me = o[Session.cur_user];
	Session.cur_others = get_values(o).filter(x => x.name != Session.cur_user);

}
function modify_def_players(list) {
	console.log('list', list);
	return;
	let uname = Session.cur_user;
	Session.def_players = list;
	newlist = get_def_players_for_user(uname);
	populate_players(newlist);
	// setTimeout(() => {
	// 	// let ta = mBy('ta_edit_players');
	// 	// hide(ta);
	// 	let button = mBy('b_edit_players');
	// 	button.innerHTML = 'edit';
	// }, 100);

}
function open_game_ui() {

	clear_table_all();

	let hmin = firstNumber(getCssVar('--inner_left_panel_height'));

	//console.log('hmin', hmin);

	mBy("inner_left_panel").innerHTML = `<div style='min-height:${hmin}px'>
	<div id="md" style="display: flex;min-height:${hmin}px">
		<div id="sidebar"  style="align-self: stretch;min-height:${hmin}px"></div>
		<div id="rightSide" style='min-height:${hmin}px'>
			<div id="table" class="flexWrap"></div>
		</div>
	</div></div>`;

	initTable();
	//hide('sidebar');
	badges_off();
	//initSidebar();
	//initAux();
}
function open_prompt(fen) {
	// ich weiss ja welche table, welches game, welcher user.....
	console.assert(!uiActivated, 'open_prompt with uiActivated ON !!!!!!!!!!!!!!!!!!!!!!!!!!');
	let game = Session.cur_game;
	let uname = Session.cur_user;
	let g = Session;

	let next = lookup(DB.games, [game]); if (next) copyKeys(next, g); //g = mergeOverride(g, next);
	next = lookup(DB.users, [uname, 'games', game]); if (next) copyKeys(next, g); //g = mergeOverride(g, next);
	let level = g.level = valf(g.startlevel, g.def_startlevel);
	lookupSet(DB.users, [uname, 'games', game, 'startlevel'], level);

	next = lookup(DB.games, [game, 'levels']);
	if (next) copyKeys(next[level], g);
	g.maxlevel = valf(get_keys(next).length, 0) - 1;
	g.color = getColorDictColor(g.color);
	for (const k in g.options) {
		g[k] = get_game_option(g, k); //'winning_score'); 
		//console.log('g.' + k, g[k]);
	}
	delete g.levels;

	clearTable(); set_background_color(g.color); //reset state
	QContextCounter += 1;

	show_game_name(g.friendly);
	show_title(g.table.friendly);
	show_level(g.level, g.maxlevel);
	if (Session.is_badges) setBadgeLevel(g.level);

	g.startTime = get_timestamp();
	mLinebreak(dTable, 15);

	let items = g.items = spotit_deal(g.num_cards, g.rows, g.cols, g.vocab, g.lang, g.min_scale, g.max_scale, fen);

	Selected = null;
	if (nundef(fen)) uiActivated = true;

}
function param_present_contacts(obj, dParent, onclick_func_name) {
	let others = sync_users(obj.myusers);//after this DB.users is up-to-date![others,has_changed]
	Session.others = others.map(x => x.name);
	let msgs = valf(obj.msgs, {});
	let mydata = `
	<style>
		@keyframes appear{

			0%{opacity:0;transform: translateY(50px)}
			100%{opacity:1;transform: translateY(0px)}
 		}

 		.contact{
 			cursor:pointer;
 			transition: all .5s cubic-bezier(0.68, -2, 0.265, 1.55);
	 	}

	 	.contact:hover{
	 		transform: scale(1.1);
	 	}

	</style>
	<div style="text-align: center; animation: appear 1s ease both">
  `;

	let mydata_list = '';
	for (const r of others) {
		row = r;
		let image = get_image_path(row); // `../base/assets/images/${row.image ? row.name : 'unknown_user'}.jpg`;
		let mydata_element = `
				<div class='contact' style='position:relative;text-align:center;margin-bottom:18px;' username='${row.name}' 
					onclick='${onclick_func_name}(event)'>
					<img src='${image}' draggable='true' ondragstart='drag(event)' class='img_person sz100' style='margin:0;'/>
					<br>${row.name}`;

		if (isdef(msgs[row.username])) {
			mydata_element += `<div style='width:20px;height:20px;border-radius:50%;background-color:orange;color:white;position:absolute;left:0px;top:0px;'>` + msgs[row.username] + "</div>";
		}

		mydata_element += "</div>";
		mydata_list += mydata_element;
	}

	mydata += mydata_list;
	dParent.innerHTML = mydata;
}
function send_timer_ticker() {
	let me = Session.cur_players[Session.cur_user];
	to_server({ tid: Session.cur_tid, score: me.score, state: me.state, uname: me.name }, 'ticker_status_send_receive');
}
function send_move() {
	let me = Session.cur_players[Session.cur_user];

	//in lamov gilt der letzte punkt nicht mehr!

	if (me.player_status == 'lamov') me.player_status = 'done';
	let o = { tid: Session.cur_tid, player_status: me.player_status, score: me.score, state: me.state, uname: me.name };
	//console.log('sending send_move', o);
	to_server(o, 'send_move');
}
function set_background_color(color, elem) { if (nundef(elem)) elem = mBy('md').parentNode; mStyle(elem, { bg: getColorDictColor(color) }); }
function show_feedback(is_correct, correction = true) {
	function success() {
		if (isdef(Selected) && isdef(Selected.feedbackUI)) {
			let uilist;
			if (isdef(Selected.positiveFeedbackUI)) uilist = [Selected.positiveFeedbackUI];
			else uilist = isList(Selected.feedbackUI) ? Selected.feedbackUI : [Selected.feedbackUI];
			let sz = getRect(uilist[0]).h;
			//console.log('in der succesfunc!!!!!!!', uilist)
			for (const ui of uilist) {

				//mpOverImage(createSuccessMarker(sz), ui, sz);
				//mpOverImage(markerSuccess(), ui, sz);
				mpOver(markerSuccess(), ui, sz, 'green', 'segoeBlack'); //, 'openMojiTextBlack'); //WORKS!!!


				//show_checkmark(ui); NO

				//let d = create_marker('A');	mp_over(d, ui, sz * (4 / 5), 'limegreen', 'segoeBlack'); NO

				//let d = markerSuccess();
				//console.log('sz',sz,'ui',ui,'\nmarker',d);
				//mpOver(d, ui, sz * (4 / 5), 'limegreen', 'segoeBlack'); //no:segoe,openmo,orig: 'segoeBlack');
				// mpOver(d, ui, Math.max(sz,40), 'limegreen', 'none'); //no:segoe,openmo,orig: 'segoeBlack');
			}
		}
		return 500;
	}
	function fail() {
		if (isdef(Selected) && isdef(Selected.feedbackUI)) {
			let uilist = isList(Selected.feedbackUI) ? Selected.feedbackUI : [Selected.feedbackUI];
			//console.log('fail',uilist)
			let sz = getRect(uilist[0]).h;
			//console.log('failFunc:',uilist,sz)
			for (const ui of uilist) {

				//console.log('hallo!!!')
				// mpOver(markerFail(), ui, sz * (1 / 2), 'red', 'segoeBlack'); //, 'openMojiTextBlack');
				mpOver(markerFail(), ui, sz, 'red', 'segoeBlack'); //, 'openMojiTextBlack');
			}
		}
		return 1000;
	}
	if (is_correct) { return success(); }
	else {
		if (correction) {
			//console.log('CORRECTION!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!', Selected.correctUis)
			let anim = 'onPulse5';
			for (const ui of Selected.correctUis) { mClass(ui, anim); }
		}
		return fail();
	}
}
function show_level(level, maxlevel) {
	//console.log('level', level, 'maxlevel', maxlevel);
	let handicap = maxlevel - level;
	dLevel.innerHTML = `handicap: ${handicap}`;
	mStyle(dLevel, { fg: handicap <= 1 ? get_user_color() : 'white' });
	// dLevel.innerHTML = 'handicap: ' + (maxlevel - level) + '/' + (maxlevel + 1);
	// dLevel.innerHTML = 'level: ' + (level + 1) + '/' + (maxlevel + 1);
	// dLevel.innerHTML = 'level: ' + G.level + '/' + G.maxlevel;
}
function show_title(title) { mBy('dScore').innerHTML = title; }
function show_my_score() { let me = Session.cur_players[Session.cur_user]; console.log('my', me.name, 'score is', me.score); }
function show_game_name(gname) { dGameTitle.innerHTML = gname; }
function show_gameover(winners) {//,handler) {
	//winners: non-empty list of names!
	//console.log('winners', winners)
	let pl = Session.cur_players[winners[0]];
	let styles = { bg: pl.color, fg: 'contrast', top: 220, };
	if (winners.length > 1) {
		status_message(`GAME OVER - The winners are ${winners.join(', ')}!!!`, styles);//, handler);
	} else {
		status_message(`GAME OVER - The winner is ${winners[0]}!!!`, styles);//, handler);
	}
}
function stop_game() { clear_table_events(); }
function update_game_status(players) {
	let d = dTitle;
	clearElement(d);
	let d1 = mDiv(d, { display: 'flex', 'justify-content': 'center', 'align-items': 'space-evenly' });
	for (const plname in players) {
		let pl = players[plname];
		//let d2=mDiv(d1,{margin:10},null,`${pl}:${this.players[pl].score}`);
		let d2 = mDiv(d1, { margin: 4, align: 'center' }, null, `<img src='${pl.imgPath}' style="display:block" class='img_person' width=50 height=50>${pl.score}`);
	}
}
function update_session(obj) {
	// console.log('obj', obj)
	for (const k in obj) { if (isdef(Session[k])) copyKeys(obj[k], Session[k]); else Session[k] = obj[k]; }
	if (isdef(obj.table)) {
		Session.cur_table = Session.table;
		if (!isEmpty(obj.playerdata)) make_players(Session.table.players);
		console.assert(isdef(Session.cur_user) && Session.cur_game == Session.table.game && Session.cur_tid == Session.table.id, "SESSION MISMATCH IN GAME_OPEN_FOR_MOVE!!!!!!!!!!!!!!!!!!!!!");
	}
	if (isdef(obj.playerdata)) {
		let o = Session.cur_players;
		for (const rec of obj.playerdata) {

			//console.log('score', rec.name, rec.score, o[rec.name].score);
			copyKeys(rec, o[rec.name]);
		}
	}
}
function update_my_score(inc) {
	let me = Session.cur_players[Session.cur_user];
	me.score += inc;

	return me.score;
	//show_my_score();
}
function where(o) {
	let fname = getFunctionsNameThatCalledThisFunction();
	//if (fname.includes('asset')) console.log(':',fname,isdef(o)?o:'(no data)');
	//if (fname.includes('server')) console.log(':',fname,isdef(o)?o:'(no data)');
	//if (fname.includes('user')) console.log(':',fname,isdef(o)?o:'(no data)');
	//if (fname.includes('drag')) console.log(':',fname,isdef(o)?o:'(no data)');
}

