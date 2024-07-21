//#region settings.js
function show_settings() {
	let [uname, gname, tid] = [U.name, S.game, S.tid];

	let g = DB.games[gname];
	S.game_options = isdef(S.table)? S.table.options : {};

	let d = mBy('inner_left_panel');
	d.innerHTML = get_lobby();
	let d1 = mBy('d_game_options');

	group = mRadioGroup(d1, { wmin: 190 }, 'd_players', 'players'); //create another fieldset with legend players

	populate_game_settings(d1);
	populate_playmode(d1, g.av_modes);
	populate_players(isdef(tid)?S.table.players:get_def_players_for_user(uname)); 
}
function populate_game_settings(dParent) {
	S.game_options.game = {};

	//wo find ich possible settings?
	let poss = DB.games[S.game].options;
	if (nundef(poss)) return;

	for (const p in poss) {
		let key = p;
		let val = poss[p];
		if (isString(val)) {
			let list = val.split(',');
			let fs = mRadioGroup(dParent, {}, `d_${key}`, key);
			let checkfirst = nundef(S.tid);
			for (const v of list) {
				let d = mRadio(v, isNumber(v) ? Number(v) : v, fs, { cursor: 'pointer' }, null, key);

				//which option should be checked?	if tid exists, take current value! otherwise first value
				if (checkfirst || lookup(S.game_options, [S.game, key]) == v) {
					let inp = d.firstChild;
					inp.setAttribute('checked', true);
					checkfirst = false;
				}
			}
			measure_fieldset(fs);
		}
	}

}
function populate_playmode(d, modes) {
	//only multi is enabled right now!!!!
	let group = mRadioGroup(d, {}, 'd_mode', 'play mode');

	modes = modes.split(',');
	for (const m of modes) {
		let name = m == 'pp' ? 'pass&play' : m == 'multi' ? 'multiplayer' : m;
		let d = mRadio(name, m, group, { cursor: 'default' }, null, 'mode');
		let inp = d.firstChild;
		inp.setAttribute('disabled', true);
		if (m != 'multi') mClass(d, 'disabled');
	}

	measure_fieldset(group);

	//at population, set first option or param defaultMode
	let mode = S.game_options.mode = modes.includes(S.def_playmode) ? S.def_playmode : modes[0];
	let el = mBy(`i_mode_${mode}`).checked = true;

}
function populate_players(list) {
	let d = mBy('d_players');
	mStyle(d,{wmax:200});
	if (nundef(d)) return;
	mRemoveChildrenFromIndex(d, 1);
	S.game_options.players = [];

	//multi mode: TODO select/add/remove players for now: fixed S.def_players
	for (const name of list) {
		S.game_options.players.push(name); //initially all default players are in list

		let d1 = mDiv(d, {}, 'dpl_' + name);
		let b = mButton('edit', ev => open_player_editor(ev), d1);

		//host cannot be removed from player list!
		let label = `${name} (${get_startlevel(name, S.game)} ${get_preferred_lang(name)})`;
		if (name == U.name) { let el = mToggle(label, name, d1, { display: 'inline' }); el.firstChild.setAttribute('disabled', true); }
		else { mToggle(label, name, d1, { cursor: 'pointer', display: 'inline' }); }

	}

	measure_fieldset(d);

	let styles = { fz: 14, w:150, matop: 8 };
	mButton('clear all', clear_all_players, d_players, styles, null, 'b_clear_players');
	mButton('add players', add_players, d_players, styles, null, 'b_add_players');
	mButton('hand select', hand_select, d_players, styles, null, 'b_select_players');
	mButton('reduce', reduce_to_current_players, d_players, styles, null, 'b_reduce_players');
	mButton('show all', show_all_players, d_players, styles, null, 'b_show_all_players');
}

//#region player editing helpers:
function get_lobby() {
	console.log('get_lobby',S);
	let game = DB.games[S.game];
	let resume_or_create = isdef(S.tid) ? 'resume' : 'create';
	let html = `
	<div id="lobby_holder" class="layout_lobby">
		<div id="lobby_header"><div class='logo'>⛱</div>Settings for ${game.friendly}</div>

		<div id="lobby_main">
				<div id='d_game_options' class='vCenterChildren'>
				</div>
				<div class="button_wrapper">
					<button class='button' onclick='onclick_${resume_or_create}_game_button()'>${resume_or_create} game</button>
				</div>
			</div>
		</div>

	`;
	return html;// createElementFromHTML(html);
}
function open_player_editor(ev) {
	console.log('ev', ev)
	let id = evToId(ev);
	console.log('open player editor for player ', id);
	let uname = id.substring(4);
	let game = S.game;
	console.log('player is', uname);
	let res = prompt(`enter [level lang] for player ${uname}: `);
	console.log('user entered', res);
	let parts = splitAtAnyOf(res, ' ,');
	let level = 'none', lang = 'none';
	if (parts.length >= 1) { level = set_startlevel(uname, game, Number(parts[0])); }
	if (parts.length >= 2) { lang = set_preferred_lang(uname, parts[1]); }
	console.log('selected language', lang, 'and level', level);
	console.log('should save DB', DB.users[uname]);
	if (isdef(DB.users[uname])) db_save();
	populate_players(S.game_options.players);
	//let d=mDiv(ev.target,{position:'absolute',top:10,left:10})
}
function clear_all_players() {
	console.log('trying to clear!!!')
	let d = mBy('d_players');
	let children = d.getElementsByTagName('input');
	console.log('children', children);

	for (const ch of children) { if (!ch.getAttribute('disabled')) ch.checked = false; }
	//S.game_options.players = [];
}
function add_players() {
	//open selection of contacts and let them be clicked then DONE
	//the resulting players are added to the list
	let res = prompt('enter player names to be added: ');
	let parts = splitAtAnyOf(res, ' ,');
	let list = S.game_options.players.slice(1); //removing mimi
	for (const p of parts) {
		let name = p.toLowerCase().trim();
		if (isdef(DB.users[name])) addIf(list, name);
	}
	list.sort(); list.unshift(U.name);
	populate_players(list);
}
function hand_select() {
	//open selection of contacts and let them be clicked then DONE
	//the resulting players are the only ones on the list + mimi natuerlich!
	let res = prompt('enter player names: ');
	let parts = splitAtAnyOf(res, ' ,');
	let list = [];
	for (const p of parts) {
		let name = p.toLowerCase().trim();
		if (isdef(DB.users[name])) addIf(list, name);
	}
	list.sort(); list.unshift(U.name);
	populate_players(list);
}
function reduce_to_current_players() {
	let d = mBy('d_players');
	let checkboxes = d.getElementsByTagName('input');
	let list = [];
	for (const chk of checkboxes) {
		if (chk.checked) {
			//console.log('player',chk.value,'is in game');
			list.push(chk.value);
		}
	}
	populate_players(list);
}
function show_all_players() { populate_players(get_def_players_for_user(U.name)); }

function collect_game_options() {
	//extract options
	//players are all the toggles that are checked
	let d = mBy('d_players');
	let checkboxes = d.getElementsByTagName('input');
	S.game_options.players = [];
	for (const chk of checkboxes) {
		if (chk.checked) {
			//console.log('player',chk.value,'is in game');
			S.game_options.players.push(chk.value);
		}
	}

	//retrieve game options from settings window
	let go = S.game_options.game = {};

	//wo find ich possible settings?
	let poss = DB.games[S.game].options;
	if (nundef(poss)) return;

	for (const p in poss) {
		let key = p;
		let val = poss[key];

		//console.log('key',key);
		let widget = mBy(`d_${key}`);
		if (nundef(widget)) { console.log('skipping key', key); continue; }
		let children = widget.getElementsByTagName('input');
		let widget_type = isString(val) ? 'radio' : 'checkbox'; //for now only user radio!!!!
		if (widget_type == 'radio') {
			for (const ch of children) {
				//console.log('===>ch',ch,ch.checked); //,ch.firstChild);
				if (ch.checked) go[key] = ch.value;
			}
		}
	}
	//console.log('go',go);

}


