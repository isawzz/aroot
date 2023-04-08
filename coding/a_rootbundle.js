//#region apiserver
function _poll() {
	if (nundef(U) || nundef(Z) || nundef(Z.friendly)) { console.log('poll without U or Z!!!', U, Z); return; }
	show_polling_signal();
	if (nundef(DA.pollCounter)) DA.pollCounter = 0; DA.pollCounter++; console.log('polling');
	if (Z.game == 'feedback' && i_am_host()) {
		send_or_sim({ friendly: Z.friendly, uname: Z.uplayer, fen: Z.fen, write_fen: true, auto: true }, 'table');
	} else send_or_sim({ friendly: Z.friendly, uname: Z.uplayer, auto: true }, 'table');
}
function autopoll(ms) { TO.poll = setTimeout(_poll, valf(ms, valf(Z.options.poll, 2000))); }
function ensure_polling() { }
function handle_result(result, cmd) {
	if (result.trim() == "") return;
	let obj;
	try { obj = JSON.parse(result); } catch { console.log('ERROR:', result); }
	if (Clientdata.AUTORESET) { Clientdata.AUTORESET = false; if (result.auto == true) { console.log('message bounced'); return; } }
	DA.result = jsCopy(obj);
	processServerdata(obj, cmd);
	switch (cmd) {
		case "assets": load_assets(obj); start_with_assets(); break;
		case "users": show_users(); break;
		case "tables": show_tables(); break;
		case "delete_table":
		case "delete_tables": show_tables(); break;
		case "table1":
			update_table();
			console.log('cmd', cmd)
			console.log('obj', obj)
			for (const k in obj) { if (isLiteral(obj[k])) { console.log(k, obj[k]); } }
			clear_timeouts();
			gamestep();
			break;
		case "gameover":
		case "table":
		case "startgame":
			update_table();
			if (Z.skip_presentation) { Z.func.state_info(mBy('dTitleLeft')); autopoll(); return; }
			clear_timeouts();
			gamestep();
			break;
	}
}
function load_assets(obj) {
	Config = jsyaml.load(obj.config);
	Syms = jsyaml.load(obj.syms);
	SymKeys = Object.keys(Syms);
	ByGroupSubgroup = jsyaml.load(obj.symGSG);
	C52 = jsyaml.load(obj.c52);
	Cinno = jsyaml.load(obj.cinno);
	Info = jsyaml.load(obj.info);
	Sayings = jsyaml.load(obj.sayings);
	create_card_assets_c52();
	KeySets = getKeySets();
	assertion(isdef(Config), 'NO Config!!!!!!!!!!!!!!!!!!!!!!!!');
}
function phpPost(data, cmd) {
	if (DA.TEST1 === true && cmd == 'table') { cmd = 'table1'; }
	pollStop();
	var o = {};
	o.data = valf(data, {});
	o.cmd = cmd;
	o = JSON.stringify(o);
	if (DA.SIMSIM && (DA.exclusive || ['table', 'startgame', 'gameover', 'tables'].includes(cmd))) {
		sendSIMSIM(o, DA.exclusive);
		FORCE_REDRAW = true;
		if (DA.exclusive) return;
	} else if (DA.simulate) {
		sendSIMSIM(o, true, true);
		FORCE_REDRAW = true;
		return;
	}
	clear_transaction();
	var xml = new XMLHttpRequest();
	loader_on();
	xml.onload = function () {
		if (xml.readyState == 4 || xml.status == 200) {
			loader_off();
			handle_result(xml.responseText, cmd);
		} else { console.log('WTF?????') }
	}
	xml.open("POST", "api.php", true);
	xml.send(o);
}
function pollStop() { clearTimeout(TO.poll); Clientdata.AUTORESET = true; }
function processServerdata(obj, cmd) {
	if (isdef(Serverdata.table)) Serverdata.prevtable = jsCopy(Serverdata.table);
	if (isdef(obj.playerdata)) {
		let old_playerdata = valf(Serverdata.playerdata, []);
		let di = list2dict(old_playerdata, 'name');
		Serverdata.playerdata = if_stringified(obj.playerdata);
		Serverdata.playerdata_changed_for = [];
		for (const o of Serverdata.playerdata) {
			let old = di[o.name];
			o.state = isEmpty(o.state) ? '' : if_stringified(o.state);
			o.state1 = isEmpty(o.state1) ? '' : if_stringified(o.state1);
			o.state2 = isEmpty(o.state2) ? '' : if_stringified(o.state2);
			let changed = nundef(old) ? true : !simpleCompare(old, o);
			if (changed) {
				Serverdata.playerdata_changed_for.push(o.name);
			}
		}
	} else if (isdef(Serverdata.playerdata)) {
		Serverdata.playerdata_changed_for = Serverdata.playerdata.map(x => x.name);
		Serverdata.playerdata = [];
	} else Serverdata.playerdata_changed_for = [];
	for (const k in obj) {
		if (k == 'tables') Serverdata.tables = obj.tables.map(x => unpack_table(x));
		else if (k == 'table') { Serverdata.table = unpack_table(obj.table); }
		else if (k == 'users') Serverdata[k] = obj[k];
		else if (k == 'playerdata') continue;
		else if (cmd != 'assets') Serverdata[k] = obj[k];
	}
	if (isdef(obj.table)) {
		assertion(isdef(Serverdata.table) && obj.table.id == Serverdata.table.id, 'table NOT in Serverdata or table id mismatch');
		let i = Serverdata.tables.findIndex(x => x.id == obj.table.id);
		if (i != -1) { Serverdata.tables[i] = Serverdata.table; } else Serverdata.tables.push(Serverdata.table);
	}
	else if (isdef(Serverdata.table)) {
		let t = Serverdata.tables.find(x => x.id == Serverdata.table.id);
		if (nundef(t)) delete Serverdata.table;
	}
}
function send_or_sim(o, cmd) {
	Counter.server += 1;
	phpPost(o, cmd);
}
function stopPolling() { pollStop(); }
function unpack_table(table) {
	for (const k of ['players', 'fen', 'options', 'scoring']) {
		let val = table[k];
		if (isdef(table[k])) table[k] = if_stringified(val); if (nundef(table[k])) table[k] = {};
	}
	if (isdef(table.modified)) { table.modified = Number(table.modified); table.timestamp = new Date(table.modified); table.stime = stringBeforeLast(table.timestamp.toString(), 'G').trim(); }
	assertion(isdef(window[table.game]), 'game function for ' + table.game + ' not defined in window');
	if (isdef(table.game)) { table.func = window[table.game](); }
	if (isdef(table.options.mode)) { table.mode = table.options.mode; }
	delete table.action; delete table.expected;
	return table;
}
function update_table() {
	assertion(isdef(U), 'NO USER LOGGED IN WHEN GETTING TABLE FROM SERVER!!!!!!!!!!!!!!!!!!!!', U);
	if (nundef(Z) || nundef(Z.prev)) Z = { prev: {} };
	for (const wichtig of ['playerdata', 'notes', 'uplayer', 'uname', 'friendly', 'step', 'round', 'phase', 'stage', 'timestamp', 'modified', 'stime', 'mode', 'scoring']) {
		if (isdef(Z[wichtig])) Z.prev[wichtig] = jsCopy(Z[wichtig]);
	}
	Z.prev.turn = Clientdata.last_turn = Clientdata.this_turn;
	copyKeys(Serverdata, Z);
	if (isdef(Serverdata.table)) { copyKeys(Serverdata.table, Z); Z.playerlist = Z.players; copyKeys(Serverdata.table.fen, Z); }
	assertion(isdef(Z.fen), 'no fen in Z bei cmd=table or startgame!!!', Serverdata);
	assertion(isdef(Z.host), 'TABLE HAS NOT HOST IN UPDATE_TABLE!!!!!!!!!!!!!!')
	Clientdata.this_turn = Z.turn;
	set_user(U.name);
	assertion(!isEmpty(Z.turn), 'turn empty!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!', Z.turn);
	let [fen, uname, turn, mode, host] = [Z.fen, Z.uname, Z.fen.turn, Z.mode, Z.host];
	let role = Z.role = !is_playing(uname, fen) ? 'spectator' : fen.turn.includes(uname) ? 'active' : 'inactive';
	let upl = role != 'spectator' ? uname : turn[0];
	if (Z.game == 'accuse') {
		if (isdef(Clientdata.mode)) Z.mode = Clientdata.mode;
		if (mode == 'hotseat' && turn.length > 1) {
			let next = get_next_in_list(Z.prev.uplayer, Z.turn); if (next) upl = next;
		} else if (turn.length > 1 && uname == host) {
			let bots = turn_has_bots_that_must_move();
			if (!isEmpty(bots)) upl = bots[0];
		} else if (uname == host && !is_human_player(turn[0])) {
			upl = turn[0];
		} else if (mode == 'hotseat') {
			upl = turn[0];
		}
	} else {
		upl = Z.role == 'active' ? uname : turn[0];
		if (mode == 'hotseat' && turn.length > 1) { let next = get_next_in_list(Z.prev.uplayer, Z.turn); if (next) upl = next; }
		if (mode == 'multi' && Z.role == 'inactive' && (uname != host || is_human_player(upl))) { upl = uname; }
	}
	set_player(upl, fen);
	let pl = Z.pl;
	Z.playmode = pl.playmode;
	Z.strategy = uname == pl.name ? valf(Clientdata.strategy, pl.strategy) : pl.strategy;
	let [uplayer, friendly, modified] = [Z.uplayer, Z.friendly, Z.modified];
	Z.uplayer_data = firstCond(Z.playerdata, x => x.name == Z.uplayer);
	let sametable = !FORCE_REDRAW && friendly == Z.prev.friendly && modified <= Z.prev.modified && uplayer == Z.prev.uplayer;
	let sameplayerdata = isEmpty(Z.playerdata_changed_for);
	let myplayerdatachanged = Z.playerdata_changed_for.includes(Z.uplayer);
	let specialcase = !i_am_host() && !i_am_acting_host() && !i_am_trigger() && !myplayerdatachanged;
	Z.skip_presentation = sametable && (sameplayerdata || specialcase);
	if (DA.TEST1 && DA.TEST0 && (!sametable || !sameplayerdata)) {
		console.log('======>Z.skip_presentation', Z.skip_presentation, '\nplayerdata_changed_for', Z.playerdata_changed_for);
		console.log('_______ *** THE END *** ___________')
	}
	FORCE_REDRAW = false;
}
//#endregion apiserver

//#region apisimphp
function apiphp(o, saveFromZ = false) {
	let [data, cmd] = [o.data, o.cmd];
	let result = {}, friendly, uname, state, player_status, fen;
	if (saveFromZ && isdef(data.friendly) && !db_table_exists(data.friendly)) {
		let res = db_new_table(data.friendly, Z.game, Z.host, jsCopy(Z.playerlist), jsCopy(Z.fen), jsCopy(Z.options));
		if (isdef(Z.playerdata)) res.playerdata = jsCopy(Z.playerdata);
	}
	if (cmd == 'table') {
		if (isdef(data.auto)) result.auto = data.auto;
		friendly = data.friendly;
		uname = data.uname;
		result.status = "table";
		if (isdef(data.clear_players)) {
			result.playerdata = db_clear_players(friendly);
			result.status = "clear_players";
		} else if (isdef(data.write_player) && isdef(data.state)) {
			player_status = isdef(data.player_status) ? data.player_status : '';
			result.playerdata = db_write_player(friendly, uname, data.state, player_status);
			result.status = "write_player";
		} else {
			result.playerdata = db_read_playerdata(friendly);
		}
		if (isdef(data.write_fen)) {
			result.table = db_write_fen(friendly, data.fen);
			result.status += " write_fen";
		} else {
			result.table = db_read_table(friendly);
		}
	} else if (cmd == 'startgame') {
		let res = db_new_table(data.friendly, data.game, data.host, data.players, data.fen, data.options);
		result.table = res.table;
		result.playerdata = res.playerdata;
		result.status = `startgame ${data.friendly}`;
	} else if (cmd == 'tables') {
		result.tables = dict2list(GT, 'friendly').map(x => x.table);
		result.status = "tables";
	} else if (cmd == 'gameover') {
		result.table = db_write_fen(data.friendly, data.fen, data.scoring);
		result.status = `scored table ${data.friendly}`;
	}
	return result;
}
function data_from_client(raw) {
	assertion(is_stringified(raw), 'data should be stringified json!!!!!!!!!!!!!!!', raw);
	let js = JSON.parse(raw);
	return js;
}
function db_clear_players(friendly) {
	assertion(isdef(GT[friendly]), `table ${friendly} does NOT exist!!!!`);
	let t = GT[friendly];
	for (const pldata of t.playerdata) { pldata.state = null; pldata.player_status = null; }
	return t.playerdata;
}
function db_new_table(friendly, game, host, players, fen, options) {
	let table = { friendly, game, host, players, fen, options };
	table.modified = Date.now();
	let playerdata = [];
	for (const plname of players) {
		playerdata.push({ name: `${plname}`, state: null, player_status: null });
	}
	let res = { table, playerdata };
	GT[friendly] = res;
	return res;
}
function db_read_playerdata(friendly) {
	assertion(isdef(GT[friendly]), `table ${friendly} does NOT exist!!!!`);
	return GT[friendly].playerdata;
}
function db_read_table(friendly) {
	assertion(isdef(GT[friendly]), `table ${friendly} does NOT exist!!!!`);
	return GT[friendly].table;
}
function db_table_exists(friendly) { return isdef(GT[friendly]); }
function db_write_fen(friendly, fen, scoring = null) {
	assertion(isdef(GT[friendly]), `table ${friendly} does NOT exist!!!!`);
	let t = GT[friendly];
	let table = t.table;
	table.fen = fen; table.scoring = scoring; table.phase = isdef(scoring) ? 'over' : '';
	table.modified = Date.now();
	return table;
}
function db_write_player(friendly, uname, state, player_status) {
	assertion(isdef(GT[friendly]), `table ${friendly} does NOT exist!!!!`);
	let t = GT[friendly];
	let pldata = firstCond(t.playerdata, x => x.name == uname);
	pldata.state = state;
	pldata.player_status = player_status;
	pldata.checked = Date.now();
	return t.playerdata;
}
function get_now() { return new Date(); }
function sendSIMSIM(o, exclusive = false, saveFromZ = false) {
	o = data_from_client(o);
	let result = apiphp(o, saveFromZ);
	if (TESTING && o.cmd == 'startgame') { for (const func of DA.test.mods) func(result.table); }
	let res = JSON.stringify(result);
	if (exclusive) { if_hotseat_autoswitch(result); handle_result(res, o.cmd); } else { console.log('sendSIMSIM testresult', result); }
}
//#endregion apisimphp

//#region basemin
function addIf(arr, el) { if (!arr.includes(el)) arr.push(el); }
function addKeys(ofrom, oto) { for (const k in ofrom) if (nundef(oto[k])) oto[k] = ofrom[k]; return oto; }
function addMonthToDate(date, months) {
	let d = new Date(date);
	d.setMonth(d.getMonth() + months);
	return d;
}
function addWeekToDate(date, weeks) {
	let d = new Date(date);
	d.setDate(d.getDate() + (weeks * 7));
	return d;
}
function aFlip(d, ms = 300, x = 0, y = 1, easing = 'cubic-bezier(1,-0.03,.27,1)') {
	return d.animate({ transform: `scale(${2}px,${y}px)` }, { easing: easing, duration: ms });
}
function agCircle(g, sz) { let r = gEllipse(sz, sz); g.appendChild(r); return r; }
function agColoredShape(g, shape, w, h, color) {
	SHAPEFUNCS[shape](g, w, h);
	gBg(g, color);
}
function agEllipse(g, w, h) { let r = gEllipse(w, h); g.appendChild(r); return r; }
function agG(g) { let g1 = gG(); g.appendChild(g1); return g1; }
function agHex(g, w, h) { let pts = size2hex(w, h); return agPoly(g, pts); }
function agLine(g, x1, y1, x2, y2) { let r = gLine(x1, y1, x2, y2); g.appendChild(r); return r; }
function agPoly(g, pts) { let r = gPoly(pts); g.appendChild(r); return r; }
function agRect(g, w, h) { let r = gRect(w, h); g.appendChild(r); return r; }
function agShape(g, shape, w, h, color, rounding) {
	let sh = gShape(shape, w, h, color, rounding);
	g.appendChild(sh);
	return sh;
}
function allNumbers(s) {
	let m = s.match(/\-.\d+|\-\d+|\.\d+|\d+\.\d+|\d+\b|\d+(?=\w)/g);
	if (m) return m.map(v => Number(v)); else return null;
}
function alphaToHex(zero1) {
	zero1 = Math.round(zero1 * 100) / 100;
	var alpha = Math.round(zero1 * 255);
	var hex = (alpha + 0x10000)
		.toString(16)
		.slice(-2)
		.toUpperCase();
	var perc = Math.round(zero1 * 100);
	return hex;
}
function aMove(d, dSource, dTarget, callback, offset, ms, easing, fade) {
	let b1 = getRect(dSource);
	let b2 = getRect(dTarget);
	if (nundef(offset)) offset = { x: 0, y: 0 };
	let dist = { x: b2.x - b1.x + offset.x, y: b2.y - b1.y + offset.y };
	d.style.zIndex = 100;
	let a = d.animate({ opacity: valf(fade, 1), transform: `translate(${dist.x}px,${dist.y}px)` }, { easing: valf(easing, 'EASE'), duration: ms });
	a.onfinish = () => { d.style.zIndex = iZMax(); if (isdef(callback)) callback(); };
}
function animateProperty(elem, prop, start, middle, end, msDuration, forwards) {
	let kflist = [];
	for (const v of [start, middle, end]) {
		let o = {};
		o[prop] = isString(v) || prop == 'opacity' ? v : '' + v + 'px';
		kflist.push(o);
	}
	let opts = { duration: msDuration };
	if (isdef(forwards)) opts.fill = forwards;
	elem.animate(kflist, opts);
}
function animatePropertyX(elem, prop, start_middle_end, msDuration, forwards, easing, delay) {
	let kflist = [];
	for (const perc in start_middle_end) {
		let o = {};
		let val = start_middle_end[perc];
		o[prop] = isString(val) || prop == 'opacity' ? val : '' + val + 'px';
		kflist.push(o);
	}
	let opts = { duration: msDuration, fill: valf(forwards, 'none'), easing: valf(easing, 'ease-it-out'), delay: valf(delay, 0) };
	elem.animate(kflist, opts);
}
function aRotate(d, ms = 2000) { return d.animate({ transform: `rotate(360deg)` }, ms); }
function aRotateAccel(d, ms) { return d.animate({ transform: `rotate(1200deg)` }, { easing: 'cubic-bezier(.72, 0, 1, 1)', duration: ms }); }
function arr_get_max(arr, func) {
	if (isEmpty(arr)) return null;
	if (nundef(func)) func = x => x;
	let i = 0; let aug = arr.map(x => ({ el: jsCopy(x), val: func(x), i: i++ }));
	sortByDescending(aug, 'val');
	let max = aug[0].val;
	let res = arrTakeWhile(aug, x => x.val == max); return res.map(x => arr[x.i]);
}
function arr_get_min(arr, func) {
	if (isEmpty(arr)) return null;
	if (nundef(func)) func = x => x;
	let i = 0; let aug = arr.map(x => ({ el: jsCopy(x), val: func(x), i: i++ }));
	sortBy(aug, 'val');
	let min = aug[0].val;
	let res = arrTakeWhile(aug, x => x.val == min); return res.map(x => arr[x.i]);
}
function arrBuckets(arr, func, sortbystr) {
	let di = {};
	for (const a of arr) {
		let val = func(a);
		if (nundef(di[val])) di[val] = { val: val, list: [] };
		di[val].list.push(a);
	}
	let res = []
	let keys = get_keys(di);
	if (isdef(sortbystr)) {
		keys.sort((a, b) => sortbystr.indexOf(a) - sortbystr.indexOf(b));
	}
	return keys.map(x => di[x]);
}
function arrChildren(elem) { return [...toElem(elem).children]; }
function arrClear(arr) { arr.length = 0; }
function arrCount(arr, func) { return arr.filter(func).length; }
function arrCycle(arr, count) { return arrRotate(arr, count); }
function arrExtend(arr, list) { list.map(x => arr.push(x)); return arr; }
function arrFirst(arr) { return arr.length > 0 ? arr[0] : null; }
function arrFlatten(arr) {
	let res = [];
	for (let i = 0; i < arr.length; i++) {
		for (let j = 0; j < arr[i].length; j++) {
			res.push(arr[i][j]);
		}
	}
	return res;
}
function arrFromIndex(arr, i) { return arr.slice(i); }
function arrFromTo(arr, iFrom, iTo) { return takeFromTo(arr, iFrom, iTo); }
function arrFunc(n, func) { let res = []; for (let i = 0; i < n; i++) res.push(func()); return res; }
function arrIndices(arr, func) {
	let indices = [];
	for (let i = 0; i < arr.length; i++) { if (func(arr[i])) indices.push(i); }
	return indices;
}
function arrLast(arr) { return arr.length > 0 ? arr[arr.length - 1] : null; }
function arrLastOfLast(arr) { if (arr.length > 0) { let l = arrLast(arr); return isList(l) ? arrLast(l) : null; } else return null; }
function arrMax(arr, f) { return arr_get_max(arr, f); }
function arrMin(arr, f) { return arr_get_min(arr, f); }
function arrMinMax(arr, func) {
	if (nundef(func)) func = x => x;
	let min = func(arr[0]), max = func(arr[0]), imin = 0, imax = 0;
	for (let i = 1, len = arr.length; i < len; i++) {
		let v = func(arr[i]);
		if (v < min) {
			min = v; imin = i;
		} else if (v > max) {
			max = v; imax = i;
		}
	}
	return { min: min, imin: imin, max: max, imax: imax, elmin: arr[imin], elmax: arr[imax] };
}
function arrMinus(a, b) { if (isList(b)) return a.filter(x => !b.includes(x)); else return a.filter(x => x != b); }
function arrPlus(a, b) { b.map(x => a.push(x)); return a; }
function arrRange(from = 1, to = 10, step = 1) { let res = []; for (let i = from; i <= to; i += step)res.push(i); return res; }
function arrRemove(arr, listweg) {
	arrReplace(arr, listweg, []);
}
function arrRemoveLast(arr) { arr.length -= 1; }
function arrRemovip(arr, el) {
	let i = arr.indexOf(el);
	if (i > -1) arr.splice(i, 1);
	return i;
}
function arrRepeat(n, el) { let res = []; for (let i = 0; i < n; i++) res.push(el); return res; }
function arrReplace(arr, listweg, listdazu) {
	arrExtend(arr, listdazu);
	listweg.map(x => arrRemovip(arr, x));
	return arr;
}
function arrReplace1(arr, elweg, eldazu) {
	let i = arr.indexOf(elweg);
	arr[i] = eldazu;
	return arr;
}
function arrReverse(arr) { return jsCopy(arr).reverse(); }
function arrRotate(arr, count) {
	var unshift = Array.prototype.unshift,
		splice = Array.prototype.splice;
	var len = arr.length >>> 0, count = count >> 0;
	let arr1 = jsCopy(arr);
	unshift.apply(arr1, splice.call(arr1, count % len, len));
	return arr1;
}
function arrShufflip(arr) { if (isEmpty(arr)) return []; else return fisherYates(arr); }
function arrSplitAtIndex(arr, i) {
	return [arr.slice(0, i), arr.slice(i)];
}
function arrSplitByIndices(arr, indices) {
	let [a1, a2] = [[], jsCopy(arr)];
	for (let i = 0; i < indices.length; i++) {
		let el = arr[indices[i]];
		a1.push(el);
		removeInPlace(a2, el);
	}
	return [a1, a2];
}
function arrSum(arr, props) { if (nundef(props)) return arr.reduce((a, b) => a + b); if (!isList(props)) props = [props]; return arr.reduce((a, b) => a + (lookup(b, props) || 0), 0); }
function arrSwap(arr, i, j) { let h = arr[i]; arr[i] = arr[j]; arr[j] = h; }
function arrTake(arr, n = 0, from = 0) {
	if (isDict(arr)) {
		let keys = Object.keys(arr);
		return n > 0 ? keys.slice(from, from + n).map(x => (arr[x])) : keys.slice(from).map(x => (arr[x]));
	} else return n > 0 ? arr.slice(from, from + n) : arr.slice(from);
}
function arrTakeLast(arr, n, from = 0) {
	let res = [];
	if (isDict(arr)) {
		let keys = Object.keys(arr);
		let ilast = keys.length - 1; for (let i = ilast - from; i >= 0 && i > ilast - from - n; i--) { res.unshift(arr[keys[i]]); }
	} else {
		let ilast = arr.length - 1; for (let i = ilast - from; i >= 0 && i > ilast - from - n; i--) { res.unshift(arr[i]); }
	}
	return res;
}
function arrTakeWhile(arr, func) {
	let res = [];
	for (const a of arr) {
		if (func(a)) res.push(a); else break;
	}
	return res;
}
function arrWithout(arr, b) { return arrMinus(arr, b); }
function arrZip(arr1, arr2) {
	let res = [];
	for (let i = 0; i < Math.min(arr1, arr2); i++) {
		let o = {};
		addKeys(arr1[i], o);
		addKeys(arr2[i], o);
		res.push(o);
	}
	return res;
}
function assertion(cond) {
	if (!cond) {
		let args = [...arguments];
		for (const a of args) {
			console.log('\n', a);
		}
		throw new Error('TERMINATING!!!')
	}
}
function aSvg(dParent) {
	if (!dParent.style.position) dParent.style.position = 'relative';
	let svg1 = gSvg();
	svg1.setAttribute('width', '100%');
	svg1.setAttribute('height', '100%');
	let style = 'margin:0;padding:0;position:absolute;top:0px;left:0px;';
	svg1.setAttribute('style', style);
	dParent.appendChild(svg1);
	return svg1;
}
function aSvgg(dParent, originInCenter = true) {
	if (!dParent.style.position) dParent.style.position = 'relative';
	let svg1 = gSvg();
	svg1.setAttribute('width', '100%');
	svg1.setAttribute('height', '100%');
	let style = 'margin:0;padding:0;position:absolute;top:0px;left:0px;';
	svg1.setAttribute('style', style);
	dParent.appendChild(svg1);
	let g1 = document.createElementNS('http://www.w3.org/2000/svg', 'g');
	svg1.appendChild(g1);
	if (originInCenter) { g1.style.transform = "translate(50%, 50%)"; }
	return g1;
}
function aTranslateBy(d, x, y, ms) { return d.animate({ transform: `translate(${x}px,${y}px)` }, ms); }
function aTranslateByEase(d, x, y, ms, easing = 'cubic-bezier(1,-0.03,.27,1)') {
	return d.animate({ transform: `translate(${x}px,${y}px)` }, { easing: easing, duration: ms });
}
function aTranslateFadeBy(d, x, y, ms) { return d.animate({ opacity: .5, transform: `translate(${x}px,${y}px)` }, { easing: MyEasing, duration: ms }); }
function bottom_elem_from_to(arr1, arr2) { last_elem_from_to(arr1, arr2); }
function bottom_elem_from_to_top(arr1, arr2) { arr2.unshift(arr1.pop()); }
function calculateDaysBetweenDates(begin, end) {
	var oneDay = 24 * 60 * 60 * 1000;
	var firstDate = new Date(begin);
	var secondDate = new Date(end);
	var diffDays = Math.round(Math.abs((firstDate.getTime() - secondDate.getTime()) / (oneDay)));
	return diffDays;
}
function capitalize(s) {
	if (typeof s !== 'string') return '';
	return s.charAt(0).toUpperCase() + s.slice(1);
}
function choose(arr, n, excepti) { return rChoose(arr, n, null, excepti); }
function chooseRandom(arr) { return rChoose(arr); }
function clear_timeouts() {
	for (const k in TO) clearTimeout(TO[k]);
	stop_simple_timer();
}
function clearElement(elem) {
	if (isString(elem)) elem = document.getElementById(elem);
	if (window.jQuery == undefined) { elem.innerHTML = ''; return elem; }
	while (elem.firstChild) {
		$(elem.firstChild).remove();
	}
	return elem;
}
function clearFleetingMessage() {
	if (isdef(dFleetingMessage)) {
		dFleetingMessage.remove();
		dFleetingMessage = null;
		clearTimeout(TOFleetingMessage);
	}
}
function coin(percent = 50) { let r = Math.random(); r *= 100; return r < percent; }
function colorDark(c, percent = 50, log = true) {
	if (nundef(c)) c = rColor(); else c = colorFrom(c);
	let zero1 = -percent / 100;
	return pSBC(zero1, c, undefined, !log);
}
function colorFrom(cAny, a, allowHsl = false) {
	if (isString(cAny)) {
		if (cAny[0] == '#') {
			if (a == undefined) return cAny;
			cAny = cAny.substring(0, 7);
			return cAny + (a == 1 ? '' : alphaToHex(a));
		} else if (isdef(ColorDi) && lookup(ColorDi, [cAny])) {
			let c = ColorDi[cAny].c;
			if (a == undefined) return c;
			c = c.substring(0, 7);
			return c + (a == 1 ? '' : alphaToHex(a));
		} else if (startsWith(cAny, 'rand')) {
			let spec = capitalize(cAny.substring(4));
			if (isdef(window['color' + spec])) {
				c = window['color' + spec]();
			} else c = rColor();
			if (a == undefined) return c;
			return c + (a == 1 ? '' : alphaToHex(a));
		} else if (startsWith(cAny, 'linear')) {
			return cAny;
		} else if (cAny[0] == 'r' && cAny[1] == 'g') {
			if (a == undefined) return cAny;
			if (cAny[3] == 'a') {
				if (a < 1) {
					return stringBeforeLast(cAny, ',') + ',' + a + ')';
				} else {
					let parts = cAny.split(',');
					let r = firstNumber(parts[0]);
					return 'rgb(' + r + ',' + parts[1] + ',' + parts[2] + ')';
				}
			} else {
				if (a < 1) {
					return 'rgba' + cAny.substring(3, cAny.length - 1) + ',' + a + ')';
				} else {
					return cAny;
				}
			}
		} else if (cAny[0] == 'h' && cAny[1] == 's') {
			if (allowHsl) {
				if (a == undefined) return cAny;
				if (cAny[3] == 'a') {
					if (a < 1) {
						return stringBeforeLast(cAny, ',') + ',' + a + ')';
					} else {
						let parts = cAny.split(',');
						let r = firstNumber(parts[0]);
						return 'hsl(' + r + ',' + parts[1] + ',' + parts[2] + ')';
					}
				} else {
					return a == 1 ? cAny : 'hsla' + cAny.substring(3, cAny.length - 1) + ',' + a + ')';
				}
			} else {
				if (cAny[3] == 'a') {
					cAny = HSLAToRGBA(cAny);
				} else {
					cAny = HSLToRGB(cAny);
				}
				return colorFrom(cAny, a, false);
			}
		} else {
			ensureColorDict();
			let c = ColorDi[cAny];
			if (nundef(c)) {
				if (startsWith(cAny, 'rand')) {
					let spec = cAny.substring(4);
					if (isdef(window['color' + spec])) {
						c = window['color' + spec](res);
					} else c = rColor();
				} else {
					console.log('color not available:', cAny);
					throw new Error('color not found: ' + cAny)
					return '#00000000';
				}
			} else c = c.c;
			if (a == undefined) return c;
			c = c.substring(0, 7);
			return c + (a == 1 ? '' : alphaToHex(a));
		}
	} else if (Array.isArray(cAny)) {
		if (cAny.length == 3 && isNumber(cAny[0])) {
			let r = cAny[0];
			let g = cAny[1];
			let b = cAny[2];
			return a == undefined || a == 1 ? `rgb(${r},${g},${b})` : `rgba(${r},${g},${b},${a})`;
		} else {
			return rChoose(cAny);
		}
	} else if (typeof cAny == 'object') {
		if ('h' in cAny) {
			let hslString = '';
			if (a == undefined || a == 1) {
				hslString = `hsl(${cAny.h},${Math.round(cAny.s <= 1.0 ? cAny.s * 100 : cAny.s)}%,${Math.round(cAny.l <= 1.0 ? cAny.l * 100 : cAny.l)}%)`;
			} else {
				hslString = `hsla(${cAny.h},${Math.round(cAny.s <= 1.0 ? cAny.s * 100 : cAny.s)}%,${Math.round(cAny.l <= 1.0 ? cAny.l * 100 : cAny.l)}%,${a})`;
			}
			if (allowHsl) {
				return hslString;
			} else {
				return colorFrom(hslString, a, allowHsl);
			}
		} else if ('r' in cAny) {
			if (a !== undefined && a < 1) {
				return `rgba(${cAny.r},${cAny.g},${cAny.b},${a})`;
			} else {
				return `rgb(${cAny.r},${cAny.g},${cAny.b})`;
			}
		}
	}
}
function colorFromHSL(hue, sat = 100, lum = 50) {
	return hslToHex(valf(hue, rHue()), sat, lum);
}
function colorHex(cAny) {
	let c = colorFrom(cAny);
	if (c[0] == '#') {
		return c;
	} else {
		let res = pSBC(0, c, 'c');
		return res;
	}
}
function colorHSL(cAny, asObject = false) {
	let res = colorFrom(cAny, undefined, true);
	let shsl = res;
	if (res[0] == '#') {
		if (res.length == 9) {
			shsl = hexAToHSLA(res);
		} else if (res.length == 7) {
			shsl = hexToHSL(res);
		}
	} else if (res[0] == 'r') {
		if (res[3] == 'a') {
			shsl = RGBAToHSLA(res);
		} else {
			shsl = RGBToHSL(res);
		}
	}
	let n = allNumbers(shsl);
	if (asObject) {
		return { h: n[0], s: n[1] / 100, l: n[2] / 100, a: n.length > 3 ? n[3] : 1 };
	} else {
		return shsl;
	}
}
function colorHSLBuild(hue, sat = 100, lum = 50) { let result = "hsl(" + hue + ',' + sat + '%,' + lum + '%)'; return result; }
function colorHue(cAny) { let hsl = colorHSL(cAny, true); return hsl.h; }
function colorHueWheel(contrastTo, minDiff = 25, mod = 30, start = 0) {
	let hc = colorHue(contrastTo);
	let wheel = [];
	while (start < 360) {
		let d1 = Math.abs((start + 360) - hc);
		let d2 = Math.abs((start) - hc);
		let d3 = Math.abs((start - 360) - hc);
		let min = Math.min(d1, d2, d3);
		if (min > minDiff) wheel.push(start);
		start += mod;
	}
	return wheel;
}
function colorIdealText(bg, grayPreferred = false) {
	let rgb = colorRGB(bg, true);
	const nThreshold = 105;
	let r = rgb.r;
	let g = rgb.g;
	let b = rgb.b;
	var bgDelta = r * 0.299 + g * 0.587 + b * 0.114;
	var foreColor = 255 - bgDelta < nThreshold ? 'black' : 'white';
	if (grayPreferred) foreColor = 255 - bgDelta < nThreshold ? 'dimgray' : 'snow';
	return foreColor;
}
function colorLight(c, percent = 20, log = true) {
	if (nundef(c)) {
		return colorFromHSL(rHue(), 100, 85);
	} else c = colorFrom(c);
	let zero1 = percent / 100;
	return pSBC(zero1, c, undefined, !log);
}
function colorPalette(color, type = 'shade') {
	color = colorFrom(color);
	return colorShades(color);
}
function colorPaletteFromImage(img) {
	if (nundef(ColorThiefObject)) ColorThiefObject = new ColorThief();
	let palette0 = ColorThiefObject.getPalette(img);
	let palette = [];
	for (const pal of palette0) {
		let color = colorFrom(pal);
		palette.push(color);
	}
	return palette;
}
function colorPaletteFromUrl(path) {
	let img = mCreateFrom(`<img src='${path}' />`);
	let pal = colorPaletteFromImage(img);
	return pal;
}
function colorRGB(cAny, asObject = false) {
	let res = colorFrom(cAny);
	let srgb = res;
	if (res[0] == '#') {
		srgb = pSBC(0, res, 'c');
	}
	let n = allNumbers(srgb);
	if (asObject) {
		return { r: n[0], g: n[1], b: n[2], a: n.length > 3 ? n[3] : 1 };
	} else {
		return srgb;
	}
}
function colorsFromBFA(bg, fg, alpha) {
	if (fg == 'contrast') {
		if (bg != 'inherit') bg = colorFrom(bg, alpha);
		fg = colorIdealText(bg);
	} else if (bg == 'contrast') {
		fg = colorFrom(fg);
		bg = colorIdealText(fg);
	} else {
		if (isdef(bg) && bg != 'inherit') bg = colorFrom(bg, alpha);
		if (isdef(fg) && fg != 'inherit') fg = colorFrom(fg);
	}
	return [bg, fg];
}
function colorShades(color) {
	let res = [];
	for (let frac = -0.8; frac <= 0.8; frac += 0.2) {
		let c = pSBC(frac, color, undefined, true);
		res.push(c);
	}
	return res;
}
function colorTrans(cAny, alpha = 0.5) {
	return colorFrom(cAny, alpha);
}
function colorTransPalette(color = '#000000') {
	let res = [];
	for (const alpha of [.0, .1, .2, .3, .4, .5, .6, .7, .8, .9, 1]) res.push(colorTrans(color, alpha));
	return res;
}
function colorWheel(contrastTo, n) {
	let hc = colorHue(contrastTo);
	let wheel = [];
	let start = hc;
	let inc = Math.round(360 / (n + 1));
	start += inc;
	for (let i = 0; i < n; i++) {
		wheel.push(start % 360);
		start += inc;
	}
	return wheel.map(x => colorHSLBuild(x));
}
function contains(s, sSub) { return s.toLowerCase().includes(sSub.toLowerCase()); }
function copyKeys(ofrom, oto, except = {}, only) {
	let keys = isdef(only) ? only : Object.keys(ofrom);
	for (const k of keys) {
		if (isdef(except[k])) continue;
		oto[k] = ofrom[k];
	}
}
function date2locale(date) { return date.toLocaleDateString(); }
function dict2list(d, keyName = 'id') {
	let res = [];
	for (const key in d) {
		let val = d[key];
		let o;
		if (isDict(val)) { o = jsCopy(val); } else { o = { value: val }; }
		o[keyName] = key;
		res.push(o);
	}
	return res;
}
function divInt(a, b) { return Math.trunc(a / b); }
function draw_from_deck_to(deck, arr) { top_elem_from_to(deck, arr); }
function draw_from_deck_to_board(deck, arr) { top_elem_from_to_top(deck, arr); }
function drawFlatHex(dParent, styles, classes, sizing) {
	if (nundef(styles)) styles = { w: 100, h: 100, bg: 'blue' };
	if (nundef(classes)) classes = ['frameOnHover'];
	if (nundef(sizing)) sizing = { hgrow: true, wgrow: true };
	let d = mDiv(dParent, styles, null, null, classes, sizing);
	mStyle(d, { 'clip-path': 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' });
	return d;
}
function drawHex(dParent, styles, classes, sizing) {
	if (nundef(styles)) styles = { w: 100, h: 100, bg: 'blue' };
	if (nundef(classes)) classes = ['frameOnHover'];
	if (nundef(sizing)) sizing = { hgrow: true, wgrow: true };
	let d = mDiv(dParent, styles, null, null, classes, sizing);
	mStyle(d, { 'clip-path': 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' });
	return d;
}
function drawPlainCircle(c) {
	let item = mPic('heart', dMain, { fz: 8, bg: 'red', rounding: '50%', padding: 1 });
	mPos(iDiv(item), c.x, c.y);
	return item;
}
function drawShape(key, dParent, styles, classes, sizing) {
	if (nundef(styles)) styles = { w: 96, h: 96, bg: 'random' };
	if (nundef(sizing)) sizing = { hgrow: true, wgrow: true };
	let d = mDiv(dParent, styles, null, null, classes, sizing);
	if (key == 'circle' || key == 'ellipse') mStyle(d, { rounding: '50%' });
	else mStyle(d, { 'clip-path': PolyClips[key] });
	return d;
}
function drawSym(sym, c) {
	let item = mPic(sym, dMain, { fz: 25, bg: 'skyblue', rounding: '50%', padding: 4 });
	mPos(iDiv(item), c.x, c.y);
	return item;
}
function drawText(text, c) {
	let item = mText(text, dMain, { fz: 16, bg: 'skyblue', rounding: '50%', padding: 4 });
	mPos(iDiv(item), c.x, c.y);
	return item;
}
function drawTriangle(dParent, styles, classes, sizing) {
	if (nundef(styles)) styles = { w: 100, h: 100, bg: 'blue' };
	if (nundef(classes)) classes = ['frameOnHover'];
	if (nundef(sizing)) sizing = { hgrow: true, wgrow: true };
	let d = mDiv(dParent, styles, null, null, classes, sizing);
	mStyle(d, { 'clip-path': 'polygon(50% 0%, 100% 100%, 0% 100%)' });
	return d;
}
function elem_from_to(el, arr1, arr2) { removeInPlace(arr1, el); arr2.push(el); }
function elem_from_to_top(el, arr1, arr2) { removeInPlace(arr1, el); arr2.unshift(el); }
function endsWith(s, sSub) { let i = s.indexOf(sSub); return i >= 0 && i == s.length - sSub.length; }
function ensureColorDict() {
	if (isdef(ColorDi)) return;
	ColorDi = {};
	let names = getColorNames();
	let hexes = getColorHexes();
	for (let i = 0; i < names.length; i++) {
		ColorDi[names[i].toLowerCase()] = { c: '#' + hexes[i] };
	}
	const newcolors = {
		black: { c: '#000000', D: 'schwarz' },
		blue: { c: '#0000ff', D: 'blau' },
		BLUE: { c: '#4363d8', E: 'blue', D: 'blau' },
		BLUEGREEN: { c: '#004054', E: 'bluegreen', D: 'blaugrün' },
		BROWN: { c: '#96613d', E: 'brown', D: 'braun' },
		deepyellow: { c: '#ffed01', E: 'yellow', D: 'gelb' },
		FIREBRICK: { c: '#800000', E: 'darkred', D: 'rotbraun' },
		gold: { c: 'gold', D: 'golden' },
		green: { c: 'green', D: 'grün' },
		GREEN: { c: '#3cb44b', E: 'green', D: 'grün' },
		grey: { c: 'grey', D: 'grau' },
		lightblue: { c: 'lightblue', D: 'hellblau' },
		LIGHTBLUE: { c: '#42d4f4', E: 'lightblue', D: 'hellblau' },
		lightgreen: { c: 'lightgreen', D: 'hellgrün' },
		LIGHTGREEN: { c: '#afff45', E: 'lightgreen', D: 'hellgrün' },
		lightyellow: { c: '#fff620', E: 'lightyellow', D: 'gelb' },
		NEONORANGE: { c: '#ff6700', E: 'neonorange', D: 'neonorange' },
		NEONYELLOW: { c: '#efff04', E: 'neonyellow', D: 'neongelb' },
		olive: { c: 'olive', D: 'oliv' },
		OLIVE: { c: '#808000', E: 'olive', D: 'oliv' },
		orange: { c: 'orange', D: 'orange' },
		ORANGE: { c: '#f58231', E: 'orange', D: 'orange' },
		PINK: { c: 'deeppink', D: 'rosa' },
		pink: { c: 'pink', D: 'rosa' },
		purple: { c: 'purple', D: 'lila' },
		PURPLE: { c: '#911eb4', E: 'purple', D: 'lila' },
		red: { c: 'red', D: 'rot' },
		RED: { c: '#e6194B', E: 'red', D: 'rot' },
		skyblue: { c: 'skyblue', D: 'himmelblau' },
		SKYBLUE: { c: 'deepskyblue', D: 'himmelblau' },
		teal: { c: '#469990', D: 'blaugrün' },
		TEAL: { c: '#469990', E: 'teal', D: 'blaugrün' },
		transparent: { c: '#00000000', E: 'transparent', D: 'transparent' },
		violet: { c: 'violet', E: 'violet', D: 'violett' },
		VIOLET: { c: 'indigo', E: 'violet', D: 'violett' },
		white: { c: 'white', D: 'weiss' },
		yellow: { c: 'yellow', D: 'gelb' },
		yelloworange: { c: '#ffc300', E: 'yellow', D: 'gelb' },
		YELLOW: { c: '#ffe119', E: 'yellow', D: 'gelb' },
	};
	for (const k in newcolors) {
		let cnew = newcolors[k];
		if (cnew.c[0] != '#' && isdef(ColorDi[cnew.c])) cnew.c = ColorDi[cnew.c].c;
		ColorDi[k] = cnew;
	}
}
function errlog() { console.log('ERROR!', ...arguments); }
function evNoBubble(ev) { ev.preventDefault(); ev.cancelBubble = true; }
function evToClass(ev, className) {
	let elem = findParentWithClass(className);
	return elem;
}
function evToClosestId(ev) {
	let elem = findParentWithId(ev.target);
	return elem.id;
}
function evToId(ev) {
	let elem = findParentWithId(ev.target);
	return elem.id;
}
function evToProp(ev, prop) {
	let x = ev.target;
	while (isdef(x) && nundef(x.getAttribute(prop))) x = x.parentNode;
	return isdef(x) ? x.getAttribute(prop) : null;
}
function evToTargetAttribute(ev, attr) {
	let val = ev.target.getAttribute(attr);
	if (nundef(val)) { val = ev.target.parentNode.getAttribute(attr); }
	return val;
}
function find_minimum(array) {
	let min = array[0];
	for (let i = 1; i < array.length; i++) {
		if (array[i] < min) min = array[i];
	}
	return min;
}
function find_minimum_by_function(array, func) {
	let min = func(array[0]);
	for (let i = 1; i < array.length; i++) {
		if (func(array[i]) < func(min)) min = array[i];
	}
	return min;
}
function findAncestorElemOfType(el, type) {
	while (el) {
		let t = getTypeOf(el);
		if (t == type) break;
		el = el.parentNode;
	}
	return el;
}
function findAncestorElemWithParentOfType(el, type) {
	while (el && el.parentNode) {
		let t = getTypeOf(el);
		let tParent = getTypeOf(el.parentNode);
		if (tParent == type) break;
		el = el.parentNode;
	}
	return el;
}
function findAttributeInAncestors(elem, attr) {
	let val;
	while (elem && nundef(val = elem.getAttribute(attr))) { elem = elem.parentNode; }
	return val;
}
function findChildOfType(type, parentElem) {
	let children = arrChildren(parentElem);
	for (const ch of children) {
		if (getTypeOf(ch) == type) return ch;
	}
	return null;
}
function findChildrenOfType(type, parentElem) {
	let children = arrChildren(parentElem);
	let res = [];
	for (const ch of children) {
		if (getTypeOf(ch) == type) res.push(ch);
	}
	return res;
}
function findChildWithClass(className, parentElem) {
	testHelpers(parentElem);
	let children = arrChildren(parentElem);
	for (const ch of children) {
		if (ch.classList.includes(className)) return ch;
	}
	return null;
}
function findChildWithId(id, parentElem) {
	testHelpers(parentElem);
	let children = arrChildren(parentElem);
	for (const ch of children) {
		if (ch.id == id) return ch;
	}
	return null;
}
function findDescendantOfType(type, parent) {
	if (getTypeOf(parent) == type) return parent;
	let children = arrChildren(parent);
	if (isEmpty(children)) return null;
	for (const ch of children) {
		let res = findDescendantOfType(type, ch);
		if (res) return res;
	}
	return null;
}
function findDescendantWithId(id, parent) {
	if (parent.id == id) return parent;
	let children = arrChildren(parent);
	if (isEmpty(children)) return null;
	for (const ch of children) {
		let res = findDescendantWithId(id, ch);
		if (res) return res;
	}
	return null;
}
function findKeys(s) { return SymKeys.filter(x => contains(x, s) || contains(Syms[x].E) || contains(Syms[x].D), s); }
function findParentWithClass(elem, className) { while (elem && !mHasClass(elem, className)) { elem = elem.parentNode; } return elem; }
function findParentWithId(elem) { while (elem && !(elem.id)) { elem = elem.parentNode; } return elem; }
function fireClick(node) {
	if (document.createEvent) {
		var evt = document.createEvent('MouseEvents');
		evt.initEvent('click', true, false);
		node.dispatchEvent(evt);
	} else if (document.createEventObject) {
		node.fireEvent('onclick');
	} else if (typeof node.onclick == 'function') {
		node.onclick();
	}
}
function fireKey(k, { control, alt, shift } = {}) {
	console.log('fireKey called!' + document.createEvent)
	if (document.createEvent) {
		console.log('fireKey: createEvent and node.dispatchEvent exist!!!', k, control, alt, shift);
		window.dispatchEvent(new KeyboardEvent('keypress', { key: '+', ctrlKey: true }));
	} else if (document.createEventObject) {
		console.log('fireClick: createEventObject and node.fireEvent exist!!!', node)
		node.fireEvent('onclick');
	} else if (typeof node.onclick == 'function') {
		console.log('fireClick: node.onclick exists!!!', node)
		node.onclick();
	}
}
function fireWheel(node) {
	if (document.createEvent) {
		var evt = document.createEvent('MouseEvents');
		evt.initEvent('wheel', true, false);
		console.log('fireClick: createEvent and node.dispatchEvent exist!!!', node)
		node.dispatchEvent(evt);
	} else if (document.createEventObject) {
		console.log('fireClick: createEventObject and node.fireEvent exist!!!', node)
		node.fireEvent('onclick');
	} else if (typeof node.onclick == 'function') {
		console.log('fireClick: node.onclick exists!!!', node)
		node.onclick();
	}
}
function firstCond(arr, func) {
	if (nundef(arr)) return null;
	for (const a of arr) {
		if (func(a)) return a;
	}
	return null;
}
function firstCondDict(dict, func) {
	for (const k in dict) { if (func(dict[k])) return k; }
	return null;
}
function firstCondDictKey() { return firstCondDictKeys(...arguments); }
function firstCondDictKeys(dict, func) {
	for (const k in dict) { if (func(k)) return k; }
	return null;
}
function firstNCond(n, arr, func) {
	if (nundef(arr)) return [];
	let result = [];
	let cnt = 0;
	for (const a of arr) {
		cnt += 1; if (cnt > n) break;
		if (func(a)) result.push(a);
	}
	return result;
}
function firstNumber(s) {
	if (s) {
		let m = s.match(/-?\d+/);
		if (m) {
			let sh = m.shift();
			if (sh) { return Number(sh); }
		}
	}
	return null;
}
function fisherYates(arr) {
	if (arr.length == 2 && coin()) { return arr; }
	var rnd, temp;
	let last = arr[0];
	for (var i = arr.length - 1; i; i--) {
		rnd = Math.random() * i | 0;
		temp = arr[i];
		arr[i] = arr[rnd];
		arr[rnd] = temp;
	}
	return arr;
}
function fleetingMessage(msg, d, styles, ms, fade) {
	if (isString(msg)) {
		dFleetingMessage.innerHTML = msg;
		mStyle(dFleetingMessage, styles);
	} else {
		mAppend(dFleetingMessage, msg);
	}
	if (fade) Animation1 = mAnimate(dFleetingMessage, 'opacity', [1, .4, 0], null, ms, 'ease-in', 0, 'both');
	return dFleetingMessage;
}
function forAll(arr, func) { for (const a of arr) if (!func(a)) return false; return true; }
function format_currency(num) {
	return '$' + num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
function format_date(date) {
	let d = new Date(date);
	let month = '' + (d.getMonth() + 1);
	let day = '' + d.getDate();
	let year = d.getFullYear();
	if (month.length < 2) month = '0' + month;
	if (day.length < 2) day = '0' + day;
	return [month, day, year].join('/');
}
function gBg(g, color) { g.setAttribute('fill', color); }
function gCanvas(area, w, h, color, originInCenter = true) {
	let dParent = mBy(area);
	let div = stage3_prepContainer(dParent);
	div.style.width = w + 'px';
	div.style.height = h + 'px';
	let svg = gSvg();
	let style = `margin:0;padding:0;position:absolute;top:0px;left:0px;width:100%;height:100%;`
	svg.setAttribute('style', style);
	mColor(svg, color);
	div.appendChild(svg);
	let g = gG();
	if (originInCenter) g.style.transform = "translate(50%, 50%)";
	svg.appendChild(g);
	return g;
}
function gCreate(tag) { return document.createElementNS('http://www.w3.org/2000/svg', tag); }
function gEllipse(w, h) { let r = gCreate('ellipse'); r.setAttribute('rx', w / 2); r.setAttribute('ry', h / 2); return r; }
function genCats(n) {
	let di = {};
	let cats = Object.keys(Categories);
	for (let i = 0; i < n; i++) {
		let cat = chooseRandom(cats);
		let incompat = DA.incompatibleCats[cat];
		cats = arrMinus(cats, incompat);
		removeInPlace(cats, cat);
		di[cat] = Categories[cat];
	}
	return di;
}
function get_keys(o) { return Object.keys(o); }
function get_mouse_pos(ev) {
	let x = ev.pageX - document.body.scrollLeft;
	let y = ev.pageY - document.body.scrollTop;
	return ({ x: x, y: y });
}
function get_values(o) { return Object.values(o); }
function get_weekday(date) {
	let d = new Date(date);
	return d.getDay();
}
function getAnimals() {
	let gr = 'Animals & Nature';
	let result = [];
	for (const sg in ByGroupSubgroup[gr]) {
		if (startsWith(sg, 'anim')) result = result.concat(ByGroupSubgroup[gr][sg]);
	}
	return result;
}
function getColorHexes(x) {
	return [
		'f0f8ff',
		'faebd7',
		'00ffff',
		'7fffd4',
		'f0ffff',
		'f5f5dc',
		'ffe4c4',
		'000000',
		'ffebcd',
		'0000ff',
		'8a2be2',
		'a52a2a',
		'deb887',
		'5f9ea0',
		'7fff00',
		'd2691e',
		'ff7f50',
		'6495ed',
		'fff8dc',
		'dc143c',
		'00ffff',
		'00008b',
		'008b8b',
		'b8860b',
		'a9a9a9',
		'a9a9a9',
		'006400',
		'bdb76b',
		'8b008b',
		'556b2f',
		'ff8c00',
		'9932cc',
		'8b0000',
		'e9967a',
		'8fbc8f',
		'483d8b',
		'2f4f4f',
		'2f4f4f',
		'00ced1',
		'9400d3',
		'ff1493',
		'00bfff',
		'696969',
		'696969',
		'1e90ff',
		'b22222',
		'fffaf0',
		'228b22',
		'ff00ff',
		'dcdcdc',
		'f8f8ff',
		'ffd700',
		'daa520',
		'808080',
		'808080',
		'008000',
		'adff2f',
		'f0fff0',
		'ff69b4',
		'cd5c5c',
		'4b0082',
		'fffff0',
		'f0e68c',
		'e6e6fa',
		'fff0f5',
		'7cfc00',
		'fffacd',
		'add8e6',
		'f08080',
		'e0ffff',
		'fafad2',
		'd3d3d3',
		'd3d3d3',
		'90ee90',
		'ffb6c1',
		'ffa07a',
		'20b2aa',
		'87cefa',
		'778899',
		'778899',
		'b0c4de',
		'ffffe0',
		'00ff00',
		'32cd32',
		'faf0e6',
		'ff00ff',
		'800000',
		'66cdaa',
		'0000cd',
		'ba55d3',
		'9370db',
		'3cb371',
		'7b68ee',
		'00fa9a',
		'48d1cc',
		'c71585',
		'191970',
		'f5fffa',
		'ffe4e1',
		'ffe4b5',
		'ffdead',
		'000080',
		'fdf5e6',
		'808000',
		'6b8e23',
		'ffa500',
		'ff4500',
		'da70d6',
		'eee8aa',
		'98fb98',
		'afeeee',
		'db7093',
		'ffefd5',
		'ffdab9',
		'cd853f',
		'ffc0cb',
		'dda0dd',
		'b0e0e6',
		'800080',
		'663399',
		'ff0000',
		'bc8f8f',
		'4169e1',
		'8b4513',
		'fa8072',
		'f4a460',
		'2e8b57',
		'fff5ee',
		'a0522d',
		'c0c0c0',
		'87ceeb',
		'6a5acd',
		'708090',
		'708090',
		'fffafa',
		'00ff7f',
		'4682b4',
		'd2b48c',
		'008080',
		'd8bfd8',
		'ff6347',
		'40e0d0',
		'ee82ee',
		'f5deb3',
		'ffffff',
		'f5f5f5',
		'ffff00',
		'9acd32'
	];
}
function getColorNames() {
	return [
		'AliceBlue',
		'AntiqueWhite',
		'Aqua',
		'Aquamarine',
		'Azure',
		'Beige',
		'Bisque',
		'Black',
		'BlanchedAlmond',
		'Blue',
		'BlueViolet',
		'Brown',
		'BurlyWood',
		'CadetBlue',
		'Chartreuse',
		'Chocolate',
		'Coral',
		'CornflowerBlue',
		'Cornsilk',
		'Crimson',
		'Cyan',
		'DarkBlue',
		'DarkCyan',
		'DarkGoldenRod',
		'DarkGray',
		'DarkGrey',
		'DarkGreen',
		'DarkKhaki',
		'DarkMagenta',
		'DarkOliveGreen',
		'DarkOrange',
		'DarkOrchid',
		'DarkRed',
		'DarkSalmon',
		'DarkSeaGreen',
		'DarkSlateBlue',
		'DarkSlateGray',
		'DarkSlateGrey',
		'DarkTurquoise',
		'DarkViolet',
		'DeepPink',
		'DeepSkyBlue',
		'DimGray',
		'DimGrey',
		'DodgerBlue',
		'FireBrick',
		'FloralWhite',
		'ForestGreen',
		'Fuchsia',
		'Gainsboro',
		'GhostWhite',
		'Gold',
		'GoldenRod',
		'Gray',
		'Grey',
		'Green',
		'GreenYellow',
		'HoneyDew',
		'HotPink',
		'IndianRed',
		'Indigo',
		'Ivory',
		'Khaki',
		'Lavender',
		'LavenderBlush',
		'LawnGreen',
		'LemonChiffon',
		'LightBlue',
		'LightCoral',
		'LightCyan',
		'LightGoldenRodYellow',
		'LightGray',
		'LightGrey',
		'LightGreen',
		'LightPink',
		'LightSalmon',
		'LightSeaGreen',
		'LightSkyBlue',
		'LightSlateGray',
		'LightSlateGrey',
		'LightSteelBlue',
		'LightYellow',
		'Lime',
		'LimeGreen',
		'Linen',
		'Magenta',
		'Maroon',
		'MediumAquaMarine',
		'MediumBlue',
		'MediumOrchid',
		'MediumPurple',
		'MediumSeaGreen',
		'MediumSlateBlue',
		'MediumSpringGreen',
		'MediumTurquoise',
		'MediumVioletRed',
		'MidnightBlue',
		'MintCream',
		'MistyRose',
		'Moccasin',
		'NavajoWhite',
		'Navy',
		'OldLace',
		'Olive',
		'OliveDrab',
		'Orange',
		'OrangeRed',
		'Orchid',
		'PaleGoldenRod',
		'PaleGreen',
		'PaleTurquoise',
		'PaleVioletRed',
		'PapayaWhip',
		'PeachPuff',
		'Peru',
		'Pink',
		'Plum',
		'PowderBlue',
		'Purple',
		'RebeccaPurple',
		'Red',
		'RosyBrown',
		'RoyalBlue',
		'SaddleBrown',
		'Salmon',
		'SandyBrown',
		'SeaGreen',
		'SeaShell',
		'Sienna',
		'Silver',
		'SkyBlue',
		'SlateBlue',
		'SlateGray',
		'SlateGrey',
		'Snow',
		'SpringGreen',
		'SteelBlue',
		'Tan',
		'Teal',
		'Thistle',
		'Tomato',
		'Turquoise',
		'Violet',
		'Wheat',
		'White',
		'WhiteSmoke',
		'Yellow',
		'YellowGreen'
	];
}
function getFunctionCallerName() {
	return new Error().stack.match(/at (\S+)/g)[1].slice(3);
}
function getFunctionsNameThatCalledThisFunction() {
	let c1 = getFunctionsNameThatCalledThisFunction.caller;
	if (nundef(c1)) return 'no caller!';
	let c2 = c1.caller;
	if (nundef(c2)) return 'no caller!';
	return c2.name;
}
function getGSGElements(gCond, sCond) {
	let keys = [];
	let byg = ByGroupSubgroup;
	for (const gKey in byg) {
		if (!gCond(gKey)) continue;
		for (const sKey in byg[gKey]) {
			if (!sCond(sKey)) continue;
			keys = keys.concat(byg[gKey][sKey]);
		}
	}
	return keys.sort();
}
function getKeySets() {
	makeCategories();
	let res = {};
	for (const k in Syms) {
		let info = Syms[k];
		if (nundef(info.cats)) continue;
		for (const ksk of info.cats) {
			lookupAddIfToList(res, [ksk], k);
		}
	}
	res.animals = getAnimals();
	res.nature = getNature();
	localStorage.setItem('KeySets', JSON.stringify(res));
	return res;
}
function getNature() {
	let gr = 'Animals & Nature';
	let result = [];
	for (const sg in ByGroupSubgroup[gr]) {
		result = result.concat(ByGroupSubgroup[gr][sg]);
	}
	return result;
}
function getRect(elem, relto) {
	if (isString(elem)) elem = document.getElementById(elem);
	let res = elem.getBoundingClientRect();
	if (isdef(relto)) {
		let b2 = relto.getBoundingClientRect();
		let b1 = res;
		res = {
			x: b1.x - b2.x,
			y: b1.y - b2.y,
			left: b1.left - b2.left,
			top: b1.top - b2.top,
			right: b1.right - b2.right,
			bottom: b1.bottom - b2.bottom,
			width: b1.width,
			height: b1.height
		};
	}
	let r = { x: res.left, y: res.top, w: res.width, h: res.height };
	addKeys({ l: r.x, t: r.y, r: r.x + r.w, b: r.t + r.h }, r);
	return r;
}
function getSizeNeeded(elem) {
	var d = elem.cloneNode(true);
	d.style.width = 'auto';
	document.body.appendChild(d);
	let cStyles = {};
	cStyles.position = 'fixed';
	cStyles.opacity = 0;
	cStyles.top = '-9999px';
	mStyle(d, cStyles);
	height = d.clientHeight;
	width = d.clientWidth;
	d.parentNode.removeChild(d);
	return { w: Math.round(width), h: Math.round(height) };
}
function getStyleProp(elem, prop) { return getComputedStyle(elem).getPropertyValue(prop); }
function getTextSize(s = 'hallo', parentDivOrId) {
	var newDiv = document.createElement("div");
	newDiv.innerHTML = s;
	newDiv.style.cssText = "position:fixed; top:-9999px; opacity:0;"
	if (isdef(parentDivOrId)) {
		if (isString(parentDivOrId)) parentDivOrId = document.getElementById(parentDivOrId);
		parentDivOrId.appendChild(newDiv);
	} else {
		document.body.appendChild(newDiv);
	}
	height = newDiv.clientHeight;
	width = newDiv.clientWidth;
	newDiv.parentNode.removeChild(newDiv)
	return { w: width, h: height };
}
function getTextSizeX(text, fz, family, weight = 900, parentDivOrId = null, styles = {}) {
	var d = document.createElement("div");
	styles.fz = fz;
	styles.family = family;
	styles['font-weight'] = weight;
	styles.position = 'fixed';
	styles.opacity = 0;
	styles.top = '-9999px';
	styles.w = 200;
	mStyleX(d, styles);
	d.innerHTML = text;
	if (isdef(parentDivOrId)) {
		if (isString(parentDivOrId)) parentDivOrId = document.getElementById(parentDivOrId);
		parentDivOrId.appendChild(d);
	} else {
		document.body.appendChild(d);
	}
	height = d.clientHeight;
	width = d.clientWidth;
	d.parentNode.removeChild(d)
	return { w: width, h: height };
}
function getTextSizeX1(text, fz, family, weight = 900, parentDivOrId = null, styles = {}) {
	var d = document.createElement("div");
	styles.fz = fz;
	styles.family = family;
	styles['font-weight'] = weight;
	styles.position = 'fixed';
	styles.opacity = 0;
	styles.top = '-9999px';
	mStyleX(d, styles);
	d.innerHTML = text;
	if (isdef(parentDivOrId)) {
		if (isString(parentDivOrId)) parentDivOrId = document.getElementById(parentDivOrId);
		parentDivOrId.appendChild(d);
	} else {
		document.body.appendChild(d);
	}
	height = d.clientHeight;
	width = d.clientWidth;
	return { w: width, h: height, d: d };
}
function getTextWidth(text, font) {
	var canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement('canvas'));
	var context = canvas.getContext('2d');
	context.font = font;
	var metrics = context.measureText(text);
	return metrics.width;
}
function getTypeOf(param) {
	let type = typeof param;
	if (type == 'string') {
		return 'string';
	}
	if (type == 'object') {
		type = param.constructor.name;
		if (startsWith(type, 'SVG')) type = stringBefore(stringAfter(type, 'SVG'), 'Element').toLowerCase();
		else if (startsWith(type, 'HTML')) type = stringBefore(stringAfter(type, 'HTML'), 'Element').toLowerCase();
	}
	let lType = type.toLowerCase();
	if (lType.includes('event')) type = 'event';
	return type;
}
function getUID(pref = '') {
	UIDCounter += 1;
	return pref + '_' + UIDCounter;
}
function gFg(g, color, thickness) { g.setAttribute('stroke', color); if (thickness) g.setAttribute('stroke-width', thickness); }
function gG() { return gCreate('g'); }// document.createElementNS('http://www.w3.org/2000/svg', 'g'); }
function gHex(w, h) { let pts = size2hex(w, h); return gPoly(pts); }
function gLine(x1, y1, x2, y2) { let r = gCreate('line'); r.setAttribute('x1', x1); r.setAttribute('y1', y1); r.setAttribute('x2', x2); r.setAttribute('y2', y2); return r; }
function gPoly(pts) { let r = gCreate('polygon'); if (pts) r.setAttribute('points', pts); return r; }
function gPos(g, x, y) { g.style.transform = `translate(${x}px, ${y}px)`; }
function gRect(w, h) { let r = gCreate('rect'); r.setAttribute('width', w); r.setAttribute('height', h); r.setAttribute('x', -w / 2); r.setAttribute('y', -h / 2); return r; }
function gRounding(r, rounding) {
	r.setAttribute('rx', rounding);
	r.setAttribute('ry', rounding);
}
function gShape(shape, w = 20, h = 20, color = 'green', rounding) {
	let el = gG();
	if (nundef(shape)) shape = 'rect';
	if (shape != 'line') agColoredShape(el, shape, w, h, color);
	else gStroke(el, color, w);
	if (isdef(rounding) && shape == 'rect') {
		let r = el.children[0];
		gRounding(r, rounding);
	}
	return el;
}
function gSize(g, w, h, shape = null, iChild = 0) {
	let el = (getTypeOf(g) != 'g') ? g : g.children[iChild];
	let t = getTypeOf(el);
	switch (t) {
		case 'rect': el.setAttribute('width', w); el.setAttribute('height', h); el.setAttribute('x', -w / 2); el.setAttribute('y', -h / 2); break;
		case 'ellipse': el.setAttribute('rx', w / 2); el.setAttribute('ry', h / 2); break;
		default:
			if (shape) {
				switch (shape) {
					case 'hex': let pts = size2hex(w, h); el.setAttribute('points', pts); break;
				}
			}
	}
	return el;
}
function gSizeToContent(svg) {
	var bbox = svg.getBBox();
	svg.setAttribute("width", bbox.x + bbox.width + bbox.x);
	svg.setAttribute("height", bbox.y + bbox.height + bbox.y);
}
function gStroke(g, color, thickness) { g.setAttribute('stroke', color); if (thickness) g.setAttribute('stroke-width', thickness); }
function gSvg() { return gCreate('svg'); } //document.createElementNS('http://www.w3.org/2000/svg', 'svg'); }
function hasWhiteSpace(s) { return /\s/g.test(s); }
function hexAToHSLA(H) {
	let ex = /^#([\da-f]{4}){1,2}$/i;
	if (ex.test(H)) {
		let r = 0,
			g = 0,
			b = 0,
			a = 1;
		if (H.length == 5) {
			r = '0x' + H[1] + H[1];
			g = '0x' + H[2] + H[2];
			b = '0x' + H[3] + H[3];
			a = '0x' + H[4] + H[4];
		} else if (H.length == 9) {
			r = '0x' + H[1] + H[2];
			g = '0x' + H[3] + H[4];
			b = '0x' + H[5] + H[6];
			a = '0x' + H[7] + H[8];
		}
		r /= 255;
		g /= 255;
		b /= 255;
		let cmin = Math.min(r, g, b),
			cmax = Math.max(r, g, b),
			delta = cmax - cmin,
			h = 0,
			s = 0,
			l = 0;
		if (delta == 0) h = 0;
		else if (cmax == r) h = ((g - b) / delta) % 6;
		else if (cmax == g) h = (b - r) / delta + 2;
		else h = (r - g) / delta + 4;
		h = Math.round(h * 60);
		if (h < 0) h += 360;
		l = (cmax + cmin) / 2;
		s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
		s = +(s * 100).toFixed(1);
		l = +(l * 100).toFixed(1);
		a = (a / 255).toFixed(3);
		return 'hsla(' + h + ',' + s + '%,' + l + '%,' + a + ')';
	} else {
		return 'Invalid input color';
	}
}
function hexToHSL(H) {
	let ex = /^#([\da-f]{3}){1,2}$/i;
	if (ex.test(H)) {
		let r = 0,
			g = 0,
			b = 0;
		if (H.length == 4) {
			r = '0x' + H[1] + H[1];
			g = '0x' + H[2] + H[2];
			b = '0x' + H[3] + H[3];
		} else if (H.length == 7) {
			r = '0x' + H[1] + H[2];
			g = '0x' + H[3] + H[4];
			b = '0x' + H[5] + H[6];
		}
		r /= 255;
		g /= 255;
		b /= 255;
		let cmin = Math.min(r, g, b),
			cmax = Math.max(r, g, b),
			delta = cmax - cmin,
			h = 0,
			s = 0,
			l = 0;
		if (delta == 0) h = 0;
		else if (cmax == r) h = ((g - b) / delta) % 6;
		else if (cmax == g) h = (b - r) / delta + 2;
		else h = (r - g) / delta + 4;
		h = Math.round(h * 60);
		if (h < 0) h += 360;
		l = (cmax + cmin) / 2;
		s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
		s = +(s * 100).toFixed(1);
		l = +(l * 100).toFixed(1);
		return 'hsl(' + h + ',' + s + '%,' + l + '%)';
	} else {
		return 'Invalid input color';
	}
}
function hide(elem) {
	if (isString(elem)) elem = document.getElementById(elem);
	if (nundef(elem)) return;
	if (isSvg(elem)) {
		elem.setAttribute('style', 'visibility:hidden;display:none');
	} else {
		elem.style.display = 'none';
	}
}
function HSLAToRGBA(hsla, isPct) {
	let ex = /^hsla\(((((([12]?[1-9]?\d)|[12]0\d|(3[0-5]\d))(\.\d+)?)|(\.\d+))(deg)?|(0|0?\.\d+)turn|(([0-6](\.\d+)?)|(\.\d+))rad)(((,\s?(([1-9]?\d(\.\d+)?)|100|(\.\d+))%){2},\s?)|((\s(([1-9]?\d(\.\d+)?)|100|(\.\d+))%){2}\s\/\s))((0?\.\d+)|[01]|(([1-9]?\d(\.\d+)?)|100|(\.\d+))%)\)$/i;
	if (ex.test(hsla)) {
		let sep = hsla.indexOf(',') > -1 ? ',' : ' ';
		hsla = hsla
			.substr(5)
			.split(')')[0]
			.split(sep);
		if (hsla.indexOf('/') > -1) hsla.splice(3, 1);
		isPct = isPct === true;
		let h = hsla[0],
			s = hsla[1].substr(0, hsla[1].length - 1) / 100,
			l = hsla[2].substr(0, hsla[2].length - 1) / 100,
			a = hsla[3];
		if (h.indexOf('deg') > -1) h = h.substr(0, h.length - 3);
		else if (h.indexOf('rad') > -1) h = Math.round((h.substr(0, h.length - 3) / (2 * Math.PI)) * 360);
		else if (h.indexOf('turn') > -1) h = Math.round(h.substr(0, h.length - 4) * 360);
		if (h >= 360) h %= 360;
		let c = (1 - Math.abs(2 * l - 1)) * s,
			x = c * (1 - Math.abs(((h / 60) % 2) - 1)),
			m = l - c / 2,
			r = 0,
			g = 0,
			b = 0;
		if (0 <= h && h < 60) {
			r = c;
			g = x;
			b = 0;
		} else if (60 <= h && h < 120) {
			r = x;
			g = c;
			b = 0;
		} else if (120 <= h && h < 180) {
			r = 0;
			g = c;
			b = x;
		} else if (180 <= h && h < 240) {
			r = 0;
			g = x;
			b = c;
		} else if (240 <= h && h < 300) {
			r = x;
			g = 0;
			b = c;
		} else if (300 <= h && h < 360) {
			r = c;
			g = 0;
			b = x;
		}
		r = Math.round((r + m) * 255);
		g = Math.round((g + m) * 255);
		b = Math.round((b + m) * 255);
		let pctFound = a.indexOf('%') > -1;
		if (isPct) {
			r = +((r / 255) * 100).toFixed(1);
			g = +((g / 255) * 100).toFixed(1);
			b = +((b / 255) * 100).toFixed(1);
			if (!pctFound) {
				a *= 100;
			} else {
				a = a.substr(0, a.length - 1);
			}
		} else if (pctFound) {
			a = a.substr(0, a.length - 1) / 100;
		}
		return 'rgba(' + (isPct ? r + '%,' + g + '%,' + b + '%,' + a + '%' : +r + ',' + +g + ',' + +b + ',' + +a) + ')';
	} else {
		return 'Invalid input color';
	}
}
function hslToHex(h, s, l) {
	l /= 100;
	const a = s * Math.min(l, 1 - l) / 100;
	const f = n => {
		const k = (n + h / 30) % 12;
		const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
		return Math.round(255 * color).toString(16).padStart(2, '0');
	};
	return `#${f(0)}${f(8)}${f(4)}`;
}
function HSLToRGB(hsl, isPct) {
	let ex = /^hsl\(((((([12]?[1-9]?\d)|[12]0\d|(3[0-5]\d))(\.\d+)?)|(\.\d+))(deg)?|(0|0?\.\d+)turn|(([0-6](\.\d+)?)|(\.\d+))rad)((,\s?(([1-9]?\d(\.\d+)?)|100|(\.\d+))%){2}|(\s(([1-9]?\d(\.\d+)?)|100|(\.\d+))%){2})\)$/i;
	if (ex.test(hsl)) {
		let sep = hsl.indexOf(',') > -1 ? ',' : ' ';
		hsl = hsl
			.substr(4)
			.split(')')[0]
			.split(sep);
		isPct = isPct === true;
		let h = hsl[0],
			s = hsl[1].substr(0, hsl[1].length - 1) / 100,
			l = hsl[2].substr(0, hsl[2].length - 1) / 100;
		if (h.indexOf('deg') > -1) h = h.substr(0, h.length - 3);
		else if (h.indexOf('rad') > -1) h = Math.round((h.substr(0, h.length - 3) / (2 * Math.PI)) * 360);
		else if (h.indexOf('turn') > -1) h = Math.round(h.substr(0, h.length - 4) * 360);
		if (h >= 360) h %= 360;
		let c = (1 - Math.abs(2 * l - 1)) * s,
			x = c * (1 - Math.abs(((h / 60) % 2) - 1)),
			m = l - c / 2,
			r = 0,
			g = 0,
			b = 0;
		if (0 <= h && h < 60) {
			r = c;
			g = x;
			b = 0;
		} else if (60 <= h && h < 120) {
			r = x;
			g = c;
			b = 0;
		} else if (120 <= h && h < 180) {
			r = 0;
			g = c;
			b = x;
		} else if (180 <= h && h < 240) {
			r = 0;
			g = x;
			b = c;
		} else if (240 <= h && h < 300) {
			r = x;
			g = 0;
			b = c;
		} else if (300 <= h && h < 360) {
			r = c;
			g = 0;
			b = x;
		}
		r = Math.round((r + m) * 255);
		g = Math.round((g + m) * 255);
		b = Math.round((b + m) * 255);
		if (isPct) {
			r = +((r / 255) * 100).toFixed(1);
			g = +((g / 255) * 100).toFixed(1);
			b = +((b / 255) * 100).toFixed(1);
		}
		return 'rgb(' + (isPct ? r + '%,' + g + '%,' + b + '%' : +r + ',' + +g + ',' + +b) + ')';
	} else {
		return 'Invalid input color';
	}
}
function iAdd(item, props) {
	let id, l;
	if (isString(item)) { id = item; item = Items[id]; }
	else if (nundef(item.id)) { id = item.id = iRegister(item); }
	else { id = item.id; if (nundef(Items[id])) Items[id] = item; }
	if (nundef(item.live)) item.live = {};
	l = item.live;
	for (const k in props) {
		let val = props[k];
		if (nundef(val)) {
			continue;
		}
		l[k] = val;
		if (k == 'div') val.id = id;
		if (isdef(val.id) && val.id != id) {
			lookupAddIfToList(val, ['memberOf'], id);
		}
	}
}
function iDiv(i) { return isdef(i.live) ? i.live.div : isdef(i.div) ? i.div : i; }
function if_stringified_or_dict(obj) { return nundef(obj) ? {} : is_stringified(obj) ? JSON.parse(obj) : obj; }
function if_stringified_or_list(obj) { return nundef(obj) ? [] : is_stringified(obj) ? JSON.parse(obj) : obj; }
function if_stringified_or_string(obj) { return nundef(obj) ? '' : is_stringified(obj) ? JSON.parse(obj) : obj; }
function iG(i) { return isdef(i.live) ? i.live.g : isdef(i.g) ? i.g : i; }
function iMeasure(item, sizingOptions) {
	if (nundef(iDiv(item))) return;
	setRect(iDiv(item), valf(sizingOptions, { hgrow: true, wgrow: true }));
}
function incInput(inp, n = 1) {
	let val = Number(inp.innerHTML);
	val += n;
	inp.innerHTML = val;
}
function iRegister(item, id) { let uid = isdef(id) ? id : getUID(); Items[uid] = item; return uid; }
function isAlphaNum(s) { query = /^[a-zA-Z0-9]+$/; return query.test(s); }
function isdef(x) { return x !== null && x !== undefined; }
function isDict(d) { let res = (d !== null) && (typeof (d) == 'object') && !isList(d); return res; }
function isDictOrList(d) { return typeof (d) == 'object'; }
function isDigit(s) { return /^[0-9]$/i.test(s); }
function isDOM(x) { let c = lookup(x, ['constructor', 'name']); return c ? startsWith(c, 'HTML') || startsWith(c, 'SVG') : false; }
function isEmpty(arr) {
	return arr === undefined || !arr
		|| (isString(arr) && (arr == 'undefined' || arr == ''))
		|| (Array.isArray(arr) && arr.length == 0)
		|| Object.entries(arr).length === 0;
}
function isEmptyOrWhiteSpace(s) { return isEmpty(s.trim()); }
function isLetter(s) { return /^[a-zA-Z]$/i.test(s); }
function isList(arr) { return Array.isArray(arr); }
function isListOf(arr, predfunc) { return Array.isArray(arr) && !firstCond(arr, x => !predfunc(x)); }
function isLiteral(x) { return isString(x) || isNumber(x); }
function isNumber(x) { return x !== ' ' && x !== true && x !== false && isdef(x) && (x == 0 || !isNaN(+x)); }
function isOverflown(element) {
	return element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth;
}
function isString(param) { return typeof param == 'string'; }
function isSvg(elem) { return startsWith(elem.constructor.name, 'SVG'); }
function iSvg(i) { return isdef(i.live) ? i.live.svg : isdef(i.svg) ? i.svg : i; }
function isVisible(elem) {
	if (isString(elem)) elem = document.getElementById(elem);
	let x = elem.style.flex;
	return (elem.style.display != 'none' || elem.offsetParent !== null) && (nundef(elem.style.flex) || !endsWith(elem.style.flex, '0%'));
}
function isWhiteSpace(ch) { return /\s/.test(ch) }
function isWhiteSpace2(ch) {
	const alphanum = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_';
	return !alphanum.includes(ch);
}
function isWhiteSpaceString(s) { return isEmptyOrWhiteSpace(s); }
function jsClean(o) {
	if (nundef(o)) return o;
	else if (isDOM(o)) return null;
	else if (isLiteral(o)) return o;
	else if (isList(o)) {
		let onew = o.map(x => jsClean(x));
		return onew.filter(x => x !== null);
	} else if (isDict(o)) {
		for (const k in o) o[k] = jsClean(o[k]);
		let onew = {};
		for (const k in o) if (o[k] !== null) onew[k] = o[k];
		return onew;
	}
}
function jsCopy(o) { return JSON.parse(JSON.stringify(o)); }
function jsCopySafe(o) { return JSON.parse(JSON.stringify(jsClean(o))); }
function jsonToYaml(o) { let y = jsyaml.dump(o); return y; }
function last_elem_from_to(arr1, arr2) { arr2.push(arr1.pop()); }
function lastCond(arr, func) {
	if (nundef(arr)) return null;
	for (let i = arr.length - 1; i >= 0; i--) { let a = arr[i]; if (func(a)) return a; }
	return null;
}
function lastDescendantOfType(type, parent) {
	if (getTypeOf(parent) == type) return parent;
	let children = arrChildren(parent);
	if (isEmpty(children)) return null;
	for (const ch of children.reverse()) {
		let res = lastDescendantOfType(type, ch);
		if (res) return res;
	}
	return null;
}
function list2dict(arr, keyprop = 'id', uniqueKeys = true) {
	let di = {};
	for (const a of arr) {
		if (uniqueKeys) lookupSet(di, [a[keyprop]], a);
		else lookupAddToList(di, [a[keyprop]], a);
	}
	return di;
}
function load_assets_direct(obj) {
	Config = jsyaml.load(obj.config);
	Syms = jsyaml.load(obj.syms);
	SymKeys = Object.keys(Syms);
	ByGroupSubgroup = jsyaml.load(obj.symGSG);
	Info = jsyaml.load(obj.info);
	KeySets = getKeySets();
	console.assert(isdef(Config), 'NO Config!!!!!!!!!!!!!!!!!!!!!!!!');
}
async function load_assets_fetch(basepath, baseminpath) {
	let path = basepath + 'assets/';
	Config = await route_path_yaml_dict(baseminpath + 'config.yaml');
	DB = await route_path_yaml_dict(basepath + 'DB.yaml');
	Syms = await route_path_yaml_dict(path + 'allSyms.yaml');
	SymKeys = Object.keys(Syms);
	ByGroupSubgroup = await route_path_yaml_dict(path + 'symGSG.yaml');
	C52 = await route_path_yaml_dict(path + 'c52.yaml');
	Cinno = await route_path_yaml_dict(path + 'fe/inno.yaml');
	Info = await route_path_yaml_dict(path + 'lists/info.yaml');
	create_card_assets_c52();
	KeySets = getKeySets();
	console.assert(isdef(Config), 'NO Config!!!!!!!!!!!!!!!!!!!!!!!!');
	return { users: dict2list(DB.users, 'name'), games: dict2list(Config.games, 'name'), tables: [] };
}
async function load_syms(path) {
	if (nundef(path)) path = './base/assets/';
	Syms = await route_path_yaml_dict(path + 'allSyms.yaml');
	SymKeys = Object.keys(Syms);
	ByGroupSubgroup = await route_path_yaml_dict(path + 'symGSG.yaml');
	KeySets = getKeySets();
}
function loader_off() { let d = mBy('loader_holder'); if (isdef(d)) d.className = 'loader_off'; }
function loader_on() { let d = mBy('loader_holder'); if (isdef(d)) d.className = 'loader_on'; }
function log_array(arr) {
	arr.map(x => console.log(x));
}
function log_object(o = {}, msg = '', props = [], indent = 0) {
	console.log(indent ? '.'.repeat(indent) : '____', msg, indent ? '' : `(caller:${getFunctionsNameThatCalledThisFunction()})`);
	let keys = get_keys(o); keys.sort();
	for (const k of keys) {
		if (isEmpty(props) || props.includes(k)) {
			if (isDict(o[k])) { log_object(o[k], k, get_keys(o[k]).join(' '), indent + 1); console.log(); }
			else if (isListOf(o[k], isLiteral)) console.log(' '.repeat(indent), k + ':', o[k].join(','));
			else console.log(' '.repeat(indent), k + ':', o[k]);
		}
	}
}
function lookup(dict, keys) {
	let d = dict;
	let ilast = keys.length - 1;
	let i = 0;
	for (const k of keys) {
		if (k === undefined) break;
		let e = d[k];
		if (e === undefined || e === null) return null;
		d = d[k];
		if (i == ilast) return d;
		i += 1;
	}
	return d;
}
function lookupAddIfToList(dict, keys, val) {
	let lst = lookup(dict, keys);
	if (isList(lst) && lst.includes(val)) return;
	lookupAddToList(dict, keys, val);
}
function lookupAddToList(dict, keys, val) {
	let d = dict;
	let ilast = keys.length - 1;
	let i = 0;
	for (const k of keys) {
		if (i == ilast) {
			if (nundef(k)) {
				console.assert(false, 'lookupAddToList: last key indefined!' + keys.join(' '));
				return null;
			} else if (isList(d[k])) {
				d[k].push(val);
			} else {
				d[k] = [val];
			}
			return d[k];
		}
		if (nundef(k)) continue;
		if (d[k] === undefined) d[k] = {};
		d = d[k];
		i += 1;
	}
	return d;
}
function lookupSet(dict, keys, val) {
	let d = dict;
	let ilast = keys.length - 1;
	let i = 0;
	for (const k of keys) {
		if (nundef(k)) continue;
		if (d[k] === undefined) d[k] = (i == ilast ? val : {});
		if (nundef(d[k])) d[k] = (i == ilast ? val : {});
		d = d[k];
		if (i == ilast) return d;
		i += 1;
	}
	return d;
}
function lookupSetOverride(dict, keys, val) {
	let d = dict;
	let ilast = keys.length - 1;
	let i = 0;
	for (const k of keys) {
		if (i == ilast) {
			if (nundef(k)) {
				return null;
			} else {
				d[k] = val;
			}
			return d[k];
		}
		if (nundef(k)) continue;
		if (nundef(d[k])) d[k] = {};
		d = d[k];
		i += 1;
	}
	return d;
}
function makeCategories() {
	let keys = Categories = {
		animal: getGSGElements(g => g == 'Animals & Nature', s => startsWith(s, 'animal')),
		clothing: getGSGElements(g => g == 'Objects', s => s == 'clothing'),
		emotion: getGSGElements(g => g == 'Smileys & Emotion', s => startsWith(s, 'face') && !['face-costume', 'face-hat'].includes(s)),
		food: getGSGElements(g => g == 'Food & Drink', s => startsWith(s, 'food')),
		'game/toy': (['sparkler', 'firecracker', 'artist palette', 'balloon', 'confetti ball'].concat(ByGroupSubgroup['Activities']['game'])).sort(),
		gesture: getGSGElements(g => g == 'People & Body', s => startsWith(s, 'hand')),
		job: ByGroupSubgroup['People & Body']['job'],
		mammal: ByGroupSubgroup['Animals & Nature']['animal-mammal'],
		music: getGSGElements(g => g == 'Objects', s => startsWith(s, 'musi')),
		object: getGSGElements(g => g == 'Objects', s => true),
		place: getGSGElements(g => g == 'Travel & Places', s => startsWith(s, 'place')),
		plant: getGSGElements(g => g == 'Animals & Nature' || g == 'Food & Drink', s => startsWith(s, 'plant') || s == 'food-vegetable' || s == 'food-fruit'),
		sport: ByGroupSubgroup['Activities']['sport'],
		tool: getGSGElements(g => g == 'Objects', s => s == 'tool'),
		transport: getGSGElements(g => g == 'Travel & Places', s => startsWith(s, 'transport')),
	};
	let incompatible = DA.incompatibleCats = {
		animal: ['mammal'],
		clothing: ['object'],
		emotion: ['gesture'],
		food: ['plant', 'animal'],
		'game/toy': ['object', 'music'],
		gesture: ['emotion'],
		job: ['sport'],
		mammal: ['animal'],
		music: ['object', 'game/toy'],
		object: ['music', 'clothing', 'game/toy', 'tool'],
		place: [],
		plant: ['food'],
		sport: ['job'],
		tool: ['object'],
		transport: [],
	}
}
function makeUnitString(nOrString, unit = 'px', defaultVal = '100%') {
	if (nundef(nOrString)) return defaultVal;
	if (isNumber(nOrString)) nOrString = '' + nOrString + unit;
	return nOrString;
}
function mAnimate(elem, prop, valist, callback, msDuration = 1000, easing = 'cubic-bezier(1,-0.03,.86,.68)', delay = 0, forwards = 'none') {
	let kflist = [];
	for (const perc in valist) {
		let o = {};
		let val = valist[perc];
		o[prop] = isString(val) || prop == 'opacity' ? val : '' + val + 'px';
		kflist.push(o);
	}
	let opts = { duration: msDuration, fill: forwards, easing: easing, delay: delay };
	let a = toElem(elem).animate(kflist, opts);
	if (isdef(callback)) { a.onfinish = callback; }
	return a;
}
function mAnimateList(elem, ogoal, callback, msDuration = 1000, easing = 'cubic-bezier(1,-0.03,.86,.68)', delay = 0) {
	for (const k in ogoal) {
		ogoal[k] = isString(ogoal[k]) || k == 'opacity' ? ogoal[k] : '' + ogoal[k] + 'px';
	}
	let kflist = [ogoal];
	let opts = { duration: msDuration, fill: 'forwards', easing: easing, delay: delay };
	let a = toElem(elem).animate(kflist, opts);
	if (isdef(callback)) { a.onfinish = callback; }
	return a;
}
function mAnimateTo(elem, prop, val, callback, msDuration = 1000, easing = 'cubic-bezier(1,-0.03,.86,.68)', delay = 0) {
	let o = {};
	o[prop] = isString(val) || prop == 'opacity' ? val : '' + val + 'px';
	let kflist = [o];
	let opts = { duration: msDuration, fill: 'forwards', easing: easing, delay: delay };
	let a = toElem(elem).animate(kflist, opts);
	if (isdef(callback)) { a.onfinish = callback; }
	return a;
}
function mAppear(d, ms = 800, callback = null) { return mAnimateTo(d, 'opacity', 1, callback, ms); }
function mAppend(d, child) { toElem(d).appendChild(child); return child; }
function mAttrs(elem, attrs) { for (const k in attrs) { elem.setAttribute(k, attrs[k]); } }
function mBackground(bg, fg) { mStyle(document.body, { bg: bg, fg: fg }); }
function mBoxFromMargins(dParent, t, r, b, l, styles, id, inner, classes) {
	let d = mDiv(dParent, { position: 'absolute', top: t, right: r, bottom: b, left: l }, id, inner, classes);
	let pos = dParent.style.position;
	if (pos != 'absolute') dParent.style.position = 'relative';
	if (isdef(styles)) mStyle(d, styles);
	return d;
}
function mButton(caption, handler, dParent, styles, classes, id) {
	let x = mCreate('button');
	x.innerHTML = caption;
	if (isdef(handler)) x.onclick = handler;
	if (isdef(dParent)) dParent.appendChild(x);
	if (isdef(styles)) mStyle(x, styles);
	if (isdef(classes)) mClass(x, classes);
	if (isdef(id)) x.id = id;
	return x;
}
function mButtonX(dParent, handler, pos = 'tr', sz = 25, color = 'white') {
	let d2 = mDiv(dParent, { fg: color, w: sz, h: sz, pointer: 'cursor' }, null, `<i class="fa fa-times" style="font-size:${sz}px;"></i>`, 'btnX');
	mPlace(d2, pos, 2);
	d2.onclick = handler;
	return d2;
}
function mBy(id) { return document.getElementById(id); }
function mCard(dParent, styles, classtr = '', id = null) {
	let classes = toWords("card300 wb " + classtr);
	return mDiv(dParent, styles, id, null, classes);
}
function mCardButton(caption, handler, dParent, styles, classtr = '', id = null) {
	let classes = toWords("card300 wb fett no_outline btn" + classtr);
	return mButton(caption, handler, dParent, styles, classes, id);
}
function mCardText(ckey, sz, color) {
	let j = is_jolly(ckey);
	if (nundef(color)) color = get_color_of_card(ckey);
	return is_jolly(ckey) ?
		`<span style="font-size:12px;font-family:Algerian;color:${color}">jolly</span>` :
		is_color(ckey) ? `<span style="font-weight:bold;color:${color}">${ckey}</span>` :
			is_color(stringAfter(ckey, '_')) ? `<span style="font-size:16px;font-family:Algerian;color:${color}">${stringBefore(ckey, '_')}</span>` :
				`${ckey[0]}${mSuit(ckey, sz, color)}`;
}
function mCenterCenterFlex(d) { mCenterFlex(d, true, true, true); }
function mCenterFlex(d, hCenter = true, vCenter = false, wrap = true) {
	let styles = { display: 'flex' };
	if (hCenter) styles['justify-content'] = 'center';
	styles['align-content'] = vCenter ? 'center' : 'flex-start';
	if (wrap) styles['flex-wrap'] = 'wrap';
	mStyle(d, styles);
}
function mClass(d) {
	d = toElem(d);
	if (arguments.length == 2 && isList(arguments[1])) for (let i = 0; i < arguments[1].length; i++) d.classList.add(arguments[1][i]);
	else for (let i = 1; i < arguments.length; i++) d.classList.add(arguments[i]);
}
function mClass0(d) { d = toElem(d); d.className = ''; }
function mClassRemove(d) { d = toElem(d); for (let i = 1; i < arguments.length; i++) d.classList.remove(arguments[i]); }
function mClassReplace(d, weg, her) { mClassRemove(d, weg); mClass(d, her); }
function mClear(d) { clearElement(d); }
function mColFlex(dParent, chflex = [1, 5, 1], bgs) {
	let styles = { opacity: 1, display: 'flex', 'align-items': 'stretch', 'flex-flow': 'nowrap' };
	mStyle(dParent, styles);
	let res = [];
	for (let i = 0; i < chflex.length; i++) {
		let bg = isdef(bgs) ? bgs[i] : null;
		let d1 = mDiv(dParent, { flex: chflex[i], bg: bg });
		res.push(d1);
	}
	return res;
}
function mColorLetters(s, brightness) {
	return toLetters(s).map(x => `<div style='display:inline-block;transform:rotate(${rChoose([10, 5, -10, -5])}deg);color:${rColor(brightness)}'>${x == ' ' ? '&nbsp;' : x}</div>`).join('');
}
function mColorPickerBehavior(value, targetImage, elem, handler) {
	let hues = arrTake(colorHueWheel(value), 10);
	let colorPalette = hues.map(x => colorFrom(colorHSLBuild(x)));
	let palette = isdef(targetImage) ? colorPaletteFromImage(targetImage) : colorPalette;
	mStyle(elem, { bg: value });
	let inp = new JSColor(elem, { alpha: 'ff', closeButton: true, value: value, palette: palette, });
	inp.onInput = () => { let c = inp.toHEXAString(); handler(c); }
	return inp;
}
function mColorPickerControl(label, value, targetImage, dParent, handler, styles = { hpadding: 25 }) {
	let d = mDiv(dParent, styles);
	let hpad = valf(styles.hpadding, 6);
	let dLabel = mDiv(d, { 'vertical-align': 'top', w: '35%', align: 'right', hpadding: hpad, display: 'inline-block' }, null, label);
	let hues = arrTake(colorHueWheel(value), 10);
	let colorPalette = hues.map(x => colorFrom(colorHSLBuild(x)));
	let palette = isdef(targetImage) ? colorPaletteFromImage(targetImage) : colorPalette;
	let elem = mDiv(d, { w: '55%', hpadding: hpad, h: 24, rounding: hpad, display: 'inline-block' });
	let inp = new JSColor(elem, {
		alpha: 'ff',
		closeButton: true,
		value: value,
		palette: palette,
	});
	inp.onInput = () => { let c = inp.toHEXAString(); handler(c); }
	return inp;
}
function mCreate(tag, styles, id) { let d = document.createElement(tag); if (isdef(id)) d.id = id; if (isdef(styles)) mStyle(d, styles); return d; }
function mCreateFrom(htmlString) {
	var div = document.createElement('div');
	div.innerHTML = htmlString.trim();
	return div.firstChild;
}
function mDataTable(reclist, dParent, rowstylefunc, headers, id, showheaders = true) {
	if (nundef(headers)) headers = get_keys(reclist[0]);
	let t = mTable(dParent, headers, showheaders);
	if (isdef(id)) t.id = `t${id}`;
	let rowitems = [];
	let i = 0;
	for (const u of reclist) {
		let rid = isdef(id) ? `r${id}_${i}` : null;
		r = mTableRow(t, u, headers, rid);
		if (isdef(rowstylefunc)) mStyle(r.div, rowstylefunc(u));
		rowitems.push({ div: r.div, colitems: r.colitems, o: u, id: rid, index: i });
		i++;
	}
	return { div: t, rowitems: rowitems };
}
function mDiv(dParent, styles, id, inner, classes, sizing) {
	let d = mCreate('div');
	if (dParent) mAppend(dParent, d);
	if (isdef(styles)) mStyle(d, styles);
	if (isdef(classes)) mClass(d, classes);
	if (isdef(id)) d.id = id;
	if (isdef(inner)) d.innerHTML = inner;
	if (isdef(sizing)) { setRect(d, sizing); }
	return d;
}
function mDiv100(dParent, styles, id, sizing = true) { let d = mDiv(dParent, styles, id); mSize(d, 100, 100, '%', sizing); return d; }
function mDivItem(dParent, styles, id, content) {
	if (nundef(id)) id = getUID();
	let d = mDiv(dParent, styles, id, content);
	return mItem(id, { div: d });
}
function mDivLR(dParent, styles, id, innerlist, classes) {
	let d = mDiv(dParent, styles, id, `<div>${innerlist[0]}</div><div>${innerlist[1]}</div>`, classes);
	mStyle(d, { display: 'flex', 'justify-content': 'space-between', 'align-items': 'center' });
	return d;
}
function mDover(dParent, styles = {}, sizing = true) {
	let d = mDiv(dParent, styles);
	mIfNotRelative(dParent);
	mStyle(d, { position: 'absolute', left: 0, top: 0, w: '100%', h: '100%' });
	setRect(d, sizing);
	return d;
}
function mDraggable(item) {
	let d = iDiv(item);
	d.draggable = true;
	d.ondragstart = drag;
}
function mDroppable(item, handler, dragoverhandler) {
	function allowDrop(ev) { ev.preventDefault(); }
	let d = iDiv(item);
	d.ondragover = isdef(dragoverhandler) ? dragoverhandler : allowDrop;
	d.ondrop = handler;
}
function measure_fieldset(fs) {
	let legend = fs.firstChild;
	let r = getRect(legend);
	let labels = fs.getElementsByTagName('label');
	let wmax = 0;
	for (const l of labels) {
		let r1 = getRect(l);
		wmax = Math.max(wmax, r1.w);
	}
	let wt = r.w;
	let wo = wmax + 24;
	let diff = wt - wo;
	if (diff >= 10) {
		for (const l of labels) { let d = l.parentNode; mStyle(d, { maleft: diff / 2 }); }
	}
	let wneeded = Math.max(wt, wo) + 10;
	mStyle(fs, { wmin: wneeded });
	for (const l of labels) { let d = l.parentNode; mStyle(l, { display: 'inline-block', wmin: 50 }); mStyle(d, { wmin: wneeded - 40 }); }
}
function measureTextX(text, fz, family, weight = 900) {
	let sFont = '' + weight + ' ' + fz + 'px ' + family;
	sFont = sFont.trim();
	var canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement('canvas'));
	var context = canvas.getContext('2d');
	context.font = sFont;
	var metrics = context.measureText(text);
	let actualHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
	console.log(metrics.width, actualHeight, fz)
	return { w: metrics.width, h: actualHeight, fz: fz };
}
function mEdit(label, value, dParent, handler, styles, classes, id) {
	let d = mDiv(dParent, styles);
	let hpad = valf(styles.hpadding, 4);
	let dLabel = mDiv(d, { w: '50%', align: 'right', hpadding: hpad, display: 'inline-block' }, null, label);
	let inp = mCreateFrom(`<div contenteditable="true" spellcheck="false">${value}</div>  `)
	mAppend(d, inp);
	mStyle(inp, { display: 'inline-block', w: '50%', align: 'left', hpadding: hpad });
	inp.addEventListener('keydown', unfocusOnEnter);
	inp.addEventListener('focusout', ev => { handler(inp.innerHTML, ev); });
	inp.onclick = ev => selectText(ev.target);
	if (isdef(classes)) mClass(inp, classes);
	if (isdef(id)) inp.id = id;
	return inp;
}
function mEditableInput(dParent, label, val, styles, classes, id) {
	let labelElem = mCreateFrom(`<span>${label}</span>  `)
	let elem = mCreateFrom(`<span contenteditable="true" spellcheck="false">${val}</span>  `)
	elem.addEventListener('keydown', (ev) => {
		if (ev.key === 'Enter') {
			ev.preventDefault();
			mBy('dummy').focus();
		}
	});
	let dui = mDiv(dParent, { margin: 2 });
	mAppend(dui, labelElem);
	mAppend(dui, elem);
	if (isdef(styles)) {
		if (isdef(styles.wInput)) mStyle(elem, { wmin: styles.wInput });
		mStyle(elem, styles);
	}
	if (isdef(classes)) mStyle(elem, classes);
	if (isdef(id)) elem.id = id;
	return elem;
}
function mEditableOnEdited(id, dParent, label, initialVal, onEdited, onOpening, styles, classes) {
	let inp = mEditableInput(dParent, label, initialVal, styles, classes);
	inp.id = id;
	if (isdef(onOpening)) { inp.addEventListener('focus', ev => onOpening(ev)); }
	inp.addEventListener('focusout', ev => {
		window.getSelection().removeAllRanges();
		if (isdef(onEdited)) onEdited(inp.innerHTML, ev);
	});
	return inp;
}
function mEditNumber(label, value, dParent, handler, styles, classes, id, triggerOnChange = false) {
	let d = mDiv(dParent, styles);
	let hpad = valf(styles.hpadding, 4);
	let dLabel = mDiv(d, { w: '50%', align: 'right', hpadding: hpad, display: 'inline-block' }, null, label);
	if (nundef(handler)) handler = x => console.log(x);
	let inp = mCreateFrom(`<div contenteditable="true" spellcheck="false">${value}</div>  `)
	mAppend(d, inp);
	mStyle(inp, { display: 'inline-block', w: '40%', align: 'left', hpadding: hpad });
	inp.addEventListener('keydown', unfocusOnEnter);
	inp.addEventListener('focusout', ev => { handler(inp.innerHTML, ev); });
	inp.onclick = ev => selectText(ev.target);
	if (isdef(classes)) mClass(inp, classes);
	if (isdef(id)) inp.id = id;
	return inp;
}
function mEditRange(label, value, min, max, step, dParent, handler, styles, classes, id, triggerOnChange = true) {
	let d = mDiv(dParent, styles);
	let hpad = valf(styles.hpadding, 4);
	let dLabel = mDiv(d, { w: '30%', align: 'right', hpadding: hpad, display: 'inline-block' }, null, label);
	let inpText = mCreateFrom(`<input type='number'  step=${step} min="${min}" max="${max}" value="${value}" ></input>`);
	let inp = mCreateFrom(`<input type="range" step=${step} min="${min}" max="${max}" value="${value}" ></input>`);
	mAppend(d, inpText);
	mAppend(d, inp);
	mStyle(inpText, { display: 'inline', w: '20%', align: 'left', hpadding: hpad });
	mStyle(inp, { display: 'inline', w: '40%', hpadding: hpad });
	inpText.onchange = (ev) => { inp.value = inpText.value; handler(inpText.value, ev); };
	inpText.onclick = ev => selectText(ev.target);
	inp.onchange = (ev) => { inpText.value = inp.value; handler(inpText.value, ev); };
	if (isdef(classes)) mClass(inp, classes);
	if (isdef(id)) inp.id = id;
	return inpText;
}
function mEditX(label, val, dParent, styles, classes, handler, id, opt = {}) {
	let defOptions = {
		alignLabel: 'right',
		fgLabel: 'silver',
		wminLabel: 120,
		alignInput: 'left',
		fgInput: 'white',
		wminInput: 50,
		wminRight: 120,
		align: 'center',
	}
	addKeys(defOptions, opt);
	let wminTotal = wminLabel + wminRight;
	if (nundef(styles)) styles = {};
	if (nundef(styles.wmin)) styles.wmin = 0;
	styles.wmin = Math.max(styles.wmin, wminTotal);
	styles.align = opt.align;
	let dOuter = mDiv(dParent, styles, id, null, classes);
	let dLabel = mDiv(dOuter, { fg: opt.fgLabel, wmin: opt.wminLabel, align: opt.alignLabel }, null, label);
	let dInput = mDiv(dOuter, { contenteditable: true, spellcheck: false, fg: opt.fgInput, wmin: opt.wminInput, align: opt.alignInput }, null, val);
	dInput.onfocusout = ev => handler(dInput.innerHTML, ev);
	dInput.onkeydown = (ev) => {
		if (ev.key === 'Enter') {
			ev.preventDefault();
			mBy('dummy').focus();
		}
	}
	return dInput;
}
function mFade(d, ms = 800, callback = null) { return mAnimateTo(d, 'opacity', 0, callback, ms); }
function mFadeClear(d, ms = 800, callback = null) { return mAnimateTo(d, 'opacity', 0, () => { mClear(d); if (callback) callback(); }, ms); }
function mFadeClearShow(d, ms = 800, callback = null) { return mAnimate(d, 'opacity', [1, 0], () => { mClear(d); if (callback) callback(); }, ms); }
function mFadeRemove(d, ms = 800, callback = null) { return mAnimateTo(d, 'opacity', 0, () => { mRemove(d); if (callback) callback(); }, ms); }
function mFall(d, ms = 800, dist = 50) { toElem(d).animate([{ opacity: 0, transform: `translateY(-${dist}px)` }, { opacity: 1, transform: 'translateY(0px)' },], { fill: 'both', duration: ms, easing: 'ease' }); }
function mFlex(d, or = 'h') {
	d = toElem(d);
	d.style.display = 'flex';
	d.style.flexFlow = (or == 'v' ? 'column' : 'row') + ' ' + (or == 'w' ? 'wrap' : 'nowrap');
}
function mFlexColumn(d, or = 'h') {
	d = toElem(d);
	d.style.display = 'flex';
	d.style.flexFlow = (or == 'v' ? 'column' : 'row') + ' ' + (or == 'w' ? 'wrap' : 'nowrap');
	d.style.alignItems = 'stretch';
	d.style.alignContent = 'stretch';
	d.style.justiifyItems = 'stretch';
	d.style.justifyContent = 'stretch';
}
function mFlexEvenly(d) {
	let styles = { display: 'flex' };
	styles['justify-content'] = 'space-evenly';
	mStyle(d, styles);
}
function mFlexLR(d) { mStyle(d, { display: 'flex', 'justify-content': 'space-between', 'align-items': 'center' }); }
function mFlexSpacebetween(d) { mFlexLR(d); }
function mFlexWrap(d) { mFlex(d, 'w'); }
function mForm(dParent) {
	return mAppend(dParent, mCreate('form'));
}
function mFromPoint(x, y) {
	var element, elements = [];
	var old_visibility = [];
	while (true) {
		element = document.elementFromPoint(x, y);
		if (!element || element === document.documentElement) {
			break;
		}
		elements.push(element);
		old_visibility.push(element.style.visibility);
		element.style.visibility = 'hidden';
	}
	for (var k = 0; k < elements.length; k++) {
		elements[k].style.visibility = old_visibility[k];
	}
	elements.reverse();
	return elements;
}
function mGetStyle(elem, prop) {
	let val;
	elem = toElem(elem);
	if (prop == 'bg') { val = getStyleProp(elem, 'background-color'); if (isEmpty(val)) return getStyleProp(elem, 'background'); }
	else if (isdef(STYLE_PARAMS[prop])) { val = getStyleProp(elem, STYLE_PARAMS[prop]); }
	else {
		switch (prop) {
			case 'vmargin': val = stringBefore(elem.style.margin, ' '); break;
			case 'hmargin': val = stringAfter(elem.style.margin, ' '); break;
			case 'vpadding': val = stringBefore(elem.style.padding, ' '); break;
			case 'hpadding': val = stringAfter(elem.style.padding, ' '); break;
			case 'box': val = elem.style.boxSizing; break;
			case 'dir': val = elem.style.flexDirection; break;
		}
	}
	if (nundef(val)) val = getStyleProp(elem, prop);
	if (val.endsWith('px')) return firstNumber(val); else return val;
}
function mGrid(rows, cols, dParent, styles = {}) {
	let d = mDiv(dParent, styles);
	d.style.gridTemplateColumns = 'repeat(' + cols + ',1fr)';
	d.style.gridTemplateRows = 'repeat(' + rows + ',1fr)';
	d.style.display = 'inline-grid';
	d.style.padding = valf(styles.padding, styles.gap) + 'px';
	return d;
}
function mgSvg(dParent, attrs) { return mgTag('svg', dParent, attrs); }
function mgTag(tag, dParent, attrs, styles = {}, innerHTML) {
	let elem = gCreate(tag);
	mStyle(elem, styles);
	mAttrs(elem, attrs);
	if (isdef(innerHTML)) elem.innerHTML = innerHTML;
	if (isdef(dParent)) mAppend(dParent, elem);
	return elem;
}
function mgText(text, dParent, attrs, styles) { return mgTag('text', dParent, attrs, styles, text); }
function mHide(d, ms = 0) { if (ms > 0) mFade(d, ms); else mStyle(d, { opacity: 0 }); }
function mIfNotRelative(d) { if (isEmpty(d.style.position)) d.style.position = 'relative'; }
function mImage() { return mImg(...arguments); }
function mImg(path, dParent, styles, classes, callback) {
	let d = mCreate('img');
	if (isdef(callback)) d.onload = callback;
	d.src = path;
	mAppend(dParent, d);
	if (isdef(styles)) mStyle(d, styles);
	if (isdef(classes)) mClass(d, classes);
	if (isdef(styles.w)) d.setAttribute('width', styles.w + 'px');
	if (isdef(styles.h)) d.setAttribute('height', styles.h + 'px');
	return d;
}
function mInput(dParent, styles, id, placeholder, classtr = 'input', tabindex = null, value = '') {
	let html = `<input type="text" id=${id} class="${classtr}" placeholder="${valf(placeholder, '')}" tabindex="${tabindex}" value="${value}">`;
	let d = mAppend(dParent, mCreateFrom(html));
	if (isdef(styles)) mStyle(d, styles);
	return d;
}
function mInsert(dParent, el, index = 0) { dParent.insertBefore(el, dParent.childNodes[index]); }
function mInsertAfter(dParent, el, index = 0) {
	if (dParent.childNodes.length == index) mAppend(dParent, el);
	else mInsert(dParent, el, index + 1);
}
function mInsertAt(dParent, el, index = 0) { mInsert(dParent, el, index); }
function mInsertFirst(dParent, el) { mInsert(dParent, el, 0); }
function miPic(item, dParent, styles, classes) {
	let info = isString(item) ? Syms[item] : isdef(item.info) ? item.info : item;
	let d = mDiv(dParent);
	d.innerHTML = info.text;
	if (nundef(styles)) styles = {};
	let family = info.family;
	addKeys({ family: family, fz: 50, display: 'inline-block' }, styles);
	mStyle(d, styles);
	if (isdef(classes)) mClass(d, classes);
	mCenterCenterFlex(d);
	return d;
}
function mItem(id, diDOM, di = {}, addSizing = false) {
	let item = di;
	id = isdef(id) ? id : isdef(diDOM) && isdef(diDOM.div) && !isEmpty(diDOM.div.id) ? diDOM.div.id : getUID();
	item.id = iRegister(item, id);
	if (isdef(diDOM) && isdef(diDOM.div)) { diDOM.div.id = id; iAdd(item, diDOM); }
	if (addSizing) {
		if (nundef(item.sizing)) item.sizing = 'sizeToContent';
		if (nundef(item.positioning)) { item.positioning = 'absolute'; }
		if (nundef(item.posType)) { item.posType = 'center'; }
		if (isdef(diDOM) && item.sizing == 'sizeToContent') iMeasure(item, item.sizingOptions);
	}
	return item;
}
function mLine(dParent, styles) { return mDiv(dParent, styles, null, '<hr>'); }
function mLinebreak(dParent, gap) {
	dParent = toElem(dParent);
	let d;
	let display = getComputedStyle(dParent).display;
	if (display == 'flex') {
		d = mDiv(dParent, { fz: 2, 'flex-basis': '100%', h: 0, w: '100%' }, null, ' &nbsp; ');
	} else {
		d = mDiv(dParent, {}, null, '<br>');
	}
	if (isdef(gap)) { d.style.minHeight = gap + 'px'; d.innerHTML = ' &nbsp; '; d.style.opacity = .2; }
	return d;
}
function mLinebreakFlex(dParent, gap) {
	dParent = toElem(dParent);
	let d = mDiv(dParent, { fz: 2, 'flex-basis': '100%', h: 0, w: '100%' }, null, ' &nbsp; ');
	if (isdef(gap)) { d.style.minHeight = gap + 'px'; d.innerHTML = ' &nbsp; '; d.style.opacity = .2; }
	return d;
}
function mLink(dParent, styles, id, inner, classes, sizing) {
	let d = mCreate('a');
	if (dParent) mAppend(dParent, d);
	if (isdef(styles)) mStyle(d, styles);
	if (isdef(classes)) mClass(d, classes);
	if (isdef(id)) d.id = id;
	if (isdef(inner)) d.innerHTML = inner;
	if (isdef(sizing)) { setRect(d, sizing); }
	return d;
}
function mMagnifyOnHoverControl(elem) {
	elem.onmouseenter = ev => { if (ev.ctrlKey) mClass(elem, 'magnify_on_hover'); }
	elem.onmouseleave = ev => mClassRemove(elem, 'magnify_on_hover');
}
function mMagnifyOnHoverControlPopup(elem) {
	elem.onmouseenter = ev => {
		if (ev.ctrlKey) {
			let r = getRect(elem, document.body);
			let popup = mDiv(document.body, { rounding: 4, position: 'absolute', top: r.y, left: r.x }, 'popup');
			let clone = elem.cloneNode(true);
			popup.appendChild(clone);
			mClass(popup, 'doublesize')
			popup.onmouseleave = () => popup.remove();
		}
	}
}
function mMagnifyOnHoverControlRemove(elem) {
	elem.onmouseenter = elem.onmouseleave = null;
	mClassRemove(elem, 'magnify_on_hover');
}
function mMeasure(d) { let r = getRect(d); mStyle(d, { w: r.w, h: r.h }); return r; }
function mNode(o, dParent, title) {
	recConvertLists(o);
	console.log('mNode o', o);
	let d = mCreate('div');
	mYaml(d, o);
	let pre = d.getElementsByTagName('pre')[0];
	pre.style.fontFamily = 'inherit';
	if (isdef(title)) mInsert(d, mText(title));
	if (isdef(dParent)) mAppend(dParent, d);
	if (isDict(o)) d.style.textAlign = 'left';
	return d;
}
function mPlace(elem, pos, offx, offy) {
	elem = toElem(elem);
	pos = pos.toLowerCase();
	let dParent = elem.parentNode; if (dParent.style.position != 'absolute') dParent.style.position = 'relative';
	let vert = valf(offx, 0);
	let hor = isdef(offy) ? offy : vert;
	if (pos[0] == 'c' || pos[1] == 'c') {
		let rParent = getRect(dParent);
		let [wParent, hParent] = [rParent.w, rParent.h];
		let rElem = getRect(elem);
		let [wElem, hElem] = [rElem.w, rElem.h];
		switch (pos) {
			case 'cc': mStyle(elem, { position: 'absolute', left: hor + (wParent - wElem) / 2, top: vert + (hParent - hElem) / 2 }); break;
			case 'tc': mStyle(elem, { position: 'absolute', left: hor + (wParent - wElem) / 2, top: vert }); break;
			case 'bc': mStyle(elem, { position: 'absolute', left: hor + (wParent - wElem) / 2, bottom: vert }); break;
			case 'cl': mStyle(elem, { position: 'absolute', left: hor, top: vert + (hParent - hElem) / 2 }); break;
			case 'cr': mStyle(elem, { position: 'absolute', right: hor, top: vert + (hParent - hElem) / 2 }); break;
		}
		return;
	}
	let di = { t: 'top', b: 'bottom', r: 'right', l: 'left' };
	elem.style.position = 'absolute';
	elem.style[di[pos[0]]] = hor + 'px'; elem.style[di[pos[1]]] = vert + 'px';
}
function mPopup(content, dParent, styles, id) {
	if (isdef(mBy(id))) mRemove(id);
	mIfNotRelative(dParent);
	if (nundef(styles)) styles = { top: 0, left: 0 };
	styles.position = 'absolute';
	let d1 = mDiv(dParent, styles, valf(id, getUID()), content);
	return d1;
}
function mPos(d, x, y, unit = 'px') { mStyle(d, { left: x, top: y, position: 'absolute' }, unit); }
function mPulse(d, ms, callback = null) { mClass(d, 'onPulse'); TO[getUID()] = setTimeout(() => { mClassRemove(d, 'onPulse'); if (callback) callback(); }, ms); }
function mPulse1(d, callback) { mPulse(d, 1000, callback); }
function mPulse2(d, callback) { mPulse(d, 2000, callback); }
function mPulse3(d, callback) { mPulse(d, 3000, callback); }
function mRadio(label, val, name, dParent, styles = {}, handler, group_id, is_on) {
	let cursor = styles.cursor; delete styles.cursor;
	let d = mDiv(dParent, styles, group_id + '_' + val);
	let id = isdef(group_id) ? `i_${group_id}_${val}` : getUID();
	let type = isdef(group_id) ? 'radio' : 'checkbox';
	let checked = isdef(is_on) ? is_on : false;
	let inp = mCreateFrom(`<input class='radio' id='${id}' type="${type}" name="${name}" value="${val}">`);
	if (checked) inp.checked = true;
	let text = mCreateFrom(`<label for='${inp.id}'>${label}</label>`);
	if (isdef(cursor)) { inp.style.cursor = text.style.cursor = cursor; }
	mAppend(d, inp);
	mAppend(d, text);
	if (isdef(handler)) {
		inp.onclick = ev => {
			ev.cancelBubble = true;
			if (handler == 'toggle') {
			} else if (isdef(handler)) {
				handler(val);
			}
		};
	}
	return d;
}
function mRadio1(label, val, dParent, styles = {}, handler, group_id) {
	let cursor = styles.cursor; delete styles.cursor;
	let d = mDiv(dParent, styles, group_id + '_' + val);
	let inp = mCreateFrom(`<input class='radio' id='i_${group_id}_${val}' type="radio" name="${group_id}" value="${val}" >`);
	let text = mCreateFrom(`<label for='${inp.id}'>${label}</label>`);
	if (isdef(cursor)) { inp.style.cursor = text.style.cursor = cursor; }
	mAppend(d, inp);
	mAppend(d, text);
	if (isdef(handler)) d.onclick = () => handler(val);
	return d;
}
function mRadioGroup(dParent, styles, id, legend, legendstyles) {
	let f = mCreate('fieldset');
	f.id = id;
	if (isdef(styles)) mStyle(f, styles);
	if (isdef(legend)) {
		let l = mCreate('legend');
		l.innerHTML = legend;
		mAppend(f, l);
		if (isdef(legendstyles)) { mStyle(l, legendstyles); }
	}
	mAppend(dParent, f);
	return f;
}
function mRadioToggle(label, val, dParent, styles = {}, is_on = true) {
	let cursor = styles.cursor; delete styles.cursor;
	let d = mDiv(dParent, styles);
	let id = getUID();
	let inp = mCreateFrom(`<input class='radio' id='${id}' type="checkbox" checked="${is_on}" value="${val}" >`);
	let text = mCreateFrom(`<label for='${id}'>${label}</label>`);
	if (isdef(cursor)) { inp.style.cursor = text.style.cursor = cursor; }
	mAppend(d, inp);
	mAppend(d, text);
	return d;
}
function mRemove(elem) {
	elem = toElem(elem);
	var a = elem.attributes, i, l, n;
	if (a) {
		for (i = a.length - 1; i >= 0; i -= 1) {
			n = a[i].name;
			if (typeof elem[n] === 'function') {
				elem[n] = null;
			}
		}
	}
	a = elem.childNodes;
	if (a) {
		l = a.length;
		for (i = a.length - 1; i >= 0; i -= 1) {
			mRemove(elem.childNodes[i]);
		}
	}
	elem.remove();
}
function mRemoveChildrenFromIndex(dParent, i) { while (dParent.children[i]) { mRemove(dParent.children[i]); } }
function mRise(d, ms = 800) {
	toElem(d).animate([{ opacity: 0, transform: 'translateY(50px)' }, { opacity: 1, transform: 'translateY(0px)' },], { fill: 'both', duration: ms, easing: 'ease' });
}
function mScale(d, scale) { mStyle(d, { 'transform-origin': 'top', transform: `scale(${scale})` }); }
function mSelectTableRow(r, color = 'pink') {
	let t = r.parentNode;
	for (const ch of t.children) mStyle(ch, { background: 'transparent' });
	mStyle(r, { background: color });
}
function mShield(dParent, styles = { bg: '#00000020' }, id = null, classnames = null, hideonclick = false) {
	dParent = toElem(dParent);
	let d = mDiv(dParent, styles, id, classnames);
	lookupAddIfToList(DA, ['shields'], d);
	mIfNotRelative(dParent);
	mStyle(d, { position: 'absolute', left: 0, top: 0, w: '100%', h: '100%' });
	if (hideonclick) d.onclick = ev => { evNoBubble(ev); d.remove(); };
	else d.onclick = ev => { evNoBubble(ev); };
	mClass(d, 'topmost');
	return d;
}
function mShieldsOff() { if (nundef(DA.shields)) return; for (const d of DA.shields) d.remove(); }
function mShow(d, ms = 0) { if (ms > 0) mAppear(d, ms); else mStyle(d, { opacity: 1 }); }
function mShrink(d, x = .75, y = .75, ms = 800, callback = null) {
	let anim = toElem(d).animate([{ transform: `scale(${1},${1})` }, { transform: `scale(${x},${y})` },], { fill: 'both', duration: ms, easing: 'ease' });
	anim.onfinish = callback;
}
function mShrinkTranslate(child, scale, newParent, ms = 800, callback) {
	let [dx, dy] = get_screen_distance(child, newParent);
	mAnimate(child, 'transform', [`translateX(${dx}px) translateY(${dy}px) scale(${scale})`], callback, ms, 'ease');
}
function mShrinkUp(d, x = .75, y = 0, ms = 800, callback = null) {
	let anim = toElem(d).animate([{ transform: `scale(${1},${1})`, opacity: 1 }, { transform: `scale(${x},${y})`, opacity: 0 },], { fill: 'none', duration: ms, easing: 'ease' });
	anim.onfinish = mClear(d);
}
function mSize(d, w, h, unit = 'px', sizing) { if (nundef(h)) h = w; mStyle(d, { width: w, height: h }, unit); if (isdef(sizing)) setRect(d, sizing); }
function mStamp(d1, text, color, sz) {
	mStyle(d1, { position: 'relative' });
	let r = getRect(d1);
	let [w, h] = [r.w, r.h];
	color = valf(color, 'black');
	sz = valf(sz, r.h / 7);
	let [padding, border, rounding, angle] = [sz / 10, sz / 6, sz / 8, rChoose([-16, -14, -10, 10, 14])];
	let d2 = mDiv(d1, {
		fg: color,
		position: 'absolute', top: 25, left: 5,
		transform: `rotate(${angle}deg)`,
		fz: sz,
		hpadding: 2,
		vpadding: 0,
		rounding: rounding,
		border: `${border}px solid ${colorTrans(color, .8)}`,
		'-webkit-mask-size': `${w}px ${h}px`,
		'-webkit-mask-position': `50% 50%`,
		'-webkit-mask-image': 'url("../base/assets/images/textures/grunge.png")',
		weight: 400,
		display: 'inline-block',
		'text-transform': 'uppercase',
		family: 'blackops',
		'mix-blend-mode': 'multiply',
	}, null, text);
}
function mStyleRemove(elem, prop) {
	if (isdef(STYLE_PARAMS[prop])) prop = STYLE_PARAMS[prop];
	elem.style.removeProperty(prop);
}
function mSuit(ckey, sz = 20, color = null) {
	let suit = ckey.length == 1 ? ckey : ckey[1];
	let di = { S: '&spades;', H: '&hearts;', D: '&diams;', C: '&clubs;' };
	color = valf(color, suit == 'H' || suit == 'D' ? 'red' : 'black');
	let html = `<span style='color:${color};font-size:${sz}px'>${di[suit]}</span>`;
	return html;
}
function mSym(key, dParent, styles = {}, pos, classes) {
	let info = Syms[key];
	styles.display = 'inline-block';
	let family = info.family;
	styles.family = family;
	let sizes;
	if (isdef(styles.sz)) { sizes = mSymSizeToBox(info, styles.sz, styles.sz); }
	else if (isdef(styles.w) && isdef(styles.h)) { sizes = mSymSizeToBox(info, styles.w, styles.h); }
	else if (isdef(styles.fz)) { sizes = mSymSizeToFz(info, styles.fz); }
	else if (isdef(styles.h)) { sizes = mSymSizeToH(info, styles.h); }
	else if (isdef(styles.w)) { sizes = mSymSizeToW(info, styles.w); }
	else { sizes = mSymSizeToFz(info, 25); }
	styles.fz = sizes.fz;
	styles.w = sizes.w;
	styles.h = sizes.h;
	styles.align = 'center';
	if (isdef(styles.bg) && info.family != 'emoNoto') { styles.fg = styles.bg; delete styles.bg; }
	let x = mDiv(dParent, styles, null, info.text);
	if (isdef(classes)) mClass(x, classes);
	if (isdef(pos)) { mPlace(x, pos); }
	return x;
}
function mSymText(s, dParent, styles = {}, pos, classes) {
	styles.display = 'inline-block';
	styles.w = valfi(styles.w, styles.sz, styles.h, '25%');
	styles.h = valfi(styles.h, styles.sz, styles.w, styles.fz, '25%');
	styles.fz = valfi(styles.fz, styles.sz * 4 / 5, styles.h * 4 / 5, styles.w * 2, '20%');
	styles.align = 'center';
	let x = mDiv(dParent, styles, null, s); mCenterCenterFlex(x);
	if (isdef(classes)) mClass(x, classes);
	if (isdef(pos)) { mPlace(x, pos); }
	return x;
}
function mTable(dParent, headers, showheaders, styles = { mabottom: 0 }, className = 'table') {
	let d = mDiv(dParent);
	let t = mCreate('table');
	mAppend(d, t);
	if (isdef(className)) mClass(t, className);
	if (isdef(styles)) mStyle(t, styles);
	if (showheaders) {
		let code = `<tr>`;
		for (const h of headers) {
			code += `<th>${h}</th>`
		}
		code += `</tr>`;
		t.innerHTML = code;
	}
	return t;
}
function mTableCol(r, val) {
	let col = mCreate('td');
	mAppend(r, col);
	if (isdef(val)) col.innerHTML = val;
	return col;
}
function mTableCommandify(rowitems, di) {
	for (const item of rowitems) {
		for (const index in di) {
			let colitem = item.colitems[index];
			colitem.div.innerHTML = di[index](item, colitem.val);
		}
	}
}
function mTableCommandifyList(rowitem, val, func) {
	let names = isString(val) ? val.replaceAll(' ', ',').split(',') : val;
	let html = '';
	for (const name of names) {
		html += func(rowitem, name);
	}
	return html;
}
function mTableHeader(t, val) {
	let col = mCreate('th');
	mAppend(t.firstChild, col);
	col.innerHTML = val;
	return col;
}
function mTableRow(t, o, headers, id) {
	let elem = mCreate('tr');
	if (isdef(id)) elem.id = id;
	mAppend(t, elem);
	let colitems = [];
	for (const k of headers) {
		let val = isdef(o[k]) ? isDict(o[k]) ? JSON.stringify(o[k]) : isList(o[k]) ? o[k].join(', ') : o[k] : '';
		let col = mTableCol(elem, val);
		colitems.push({ div: col, key: k, val: val });
	}
	return { div: elem, colitems: colitems };
}
function mTableTransition(d, ms = 800) {
	toElem(d).animate([{ opacity: .25 }, { opacity: 1 },], { fill: 'both', duration: ms, easing: 'ease' });
}
function mText(text, dParent, styles, classes) {
	if (!isString(text)) text = text.toString();
	let d = mDiv(dParent);
	if (!isEmpty(text)) { d.innerHTML = text; }
	if (isdef(styles)) mStyle(d, styles);
	if (isdef(classes)) mClass(d, classes);
	return d;
}
function mTextArea(rows, cols, dParent, styles = {}, id) {
	let html = `<textarea id="${id}" rows="${rows}" cols="${cols}" wrap="hard"></textarea>`;
	let t = mCreateFrom(html);
	mAppend(dParent, t);
	mStyle(t, styles);
	return t;
}
function mTranslate(child, newParent, ms = 800, callback = null) {
	let [dx, dy] = get_screen_distance(child, newParent);
	onend = () => { mAppend(newParent, child); if (callback) callback(); };
	mAnimate(child, 'transform', [`translateX(${dx}px) translateY(${dy}px)`], onend, ms, 'ease');
}
function mTranslateBy(elem, x, y, ms = 800, callback = null) {
	mAnimate(elem, 'transform', [`translateX(${x}px) translateY(${y}px)`], callback, ms, 'ease');
}
function mTranslateByFade(elem, x, y, ms = 800, callback = null) {
	mAnimate(elem, 'transform', [`translateX(${x}px) translateY(${y}px)`], callback, ms, 'ease');
	let a = toElem(elem).animate([{ opacity: .25 }, { opacity: 1 },], { fill: 'both', duration: ms, easing: 'ease' });
}
function mYaml(d, js) {
	d.innerHTML = '<pre>' + jsonToYaml(js) + '</pre>';
	return d;
}
function normalize_string(s, sep = '_') {
	s = s.toLowerCase().trim();
	let res = '';
	for (let i = 0; i < s.length; i++) { if (isAlphaNum(s[i])) res += s[i]; else if (s[i] == ' ') res += sep; }
	return res;
}
function nundef(x) { return x === null || x === undefined; }
function old_mButtonX(dParent, pos = 'tr', handler = null, defaultBehavior = 'hide', sz = 40) {
	dParent = toElem(dParent);
	let styles = { cursor: 'pointer', w: sz, h: sz };
	let d2 = mDiv(dParent, styles, null, `<svg width='100%' height='100%' ><use xlink:href="#Times" /></svg>`);
	mClass(d2, 'svgbtnX');
	d2.onclick = isdef(handler) ? handler : defaultBehavior == 'hide' ? () => hide(dParent) : () => dParent.remove();
	mPlace(d2, pos, 10);
	return d2;
}
function oneWordKeys(keys) { return keys.filter(x => !x.includes(' ')); }
function plural(n) { return n == 0 || n > 1 ? 's' : ''; }
function pSBC(p, c0, c1, l) {
  let r, g, b, P, f, t, h, i = parseInt, m = Math.round, a = typeof c1 == 'string';
  if (typeof p != 'number' || p < -1 || p > 1 || typeof c0 != 'string' || (c0[0] != 'r' && c0[0] != '#') || (c1 && !a)) return null;
  h = c0.length > 9;
  h = a ? (c1.length > 9 ? true : c1 == 'c' ? !h : false) : h;
  f = pSBCr(c0);
  P = p < 0;
  t = c1 && c1 != 'c' ? pSBCr(c1) : P ? { r: 0, g: 0, b: 0, a: -1 } : { r: 255, g: 255, b: 255, a: -1 };
  p = P ? p * -1 : p;
  P = 1 - p;
  if (!f || !t) return null;
  if (l) { r = m(P * f.r + p * t.r); g = m(P * f.g + p * t.g); b = m(P * f.b + p * t.b); }
  else { r = m((P * f.r ** 2 + p * t.r ** 2) ** 0.5); g = m((P * f.g ** 2 + p * t.g ** 2) ** 0.5); b = m((P * f.b ** 2 + p * t.b ** 2) ** 0.5); }
  a = f.a;
  t = t.a;
  f = a >= 0 || t >= 0;
  a = f ? (a < 0 ? t : t < 0 ? a : a * P + t * p) : 0;
  if (h) return 'rgb' + (f ? 'a(' : '(') + r + ',' + g + ',' + b + (f ? ',' + m(a * 1000) / 1000 : '') + ')';
  else return '#' + (4294967296 + r * 16777216 + g * 65536 + b * 256 + (f ? m(a * 255) : 0)).toString(16).slice(1, f ? undefined : -2);
}
function pSBCr(d) {
  let i = parseInt, m = Math.round, a = typeof c1 == 'string';
  let n = d.length,
    x = {};
  if (n > 9) {
    ([r, g, b, a] = d = d.split(',')), (n = d.length);
    if (n < 3 || n > 4) return null;
    (x.r = parseInt(r[3] == 'a' ? r.slice(5) : r.slice(4))), (x.g = parseInt(g)), (x.b = parseInt(b)), (x.a = a ? parseFloat(a) : -1);
  } else {
    if (n == 8 || n == 6 || n < 4) return null;
    if (n < 6) d = '#' + d[1] + d[1] + d[2] + d[2] + d[3] + d[3] + (n > 4 ? d[4] + d[4] : '');
    d = parseInt(d.slice(1), 16);
    if (n == 9 || n == 5) (x.r = (d >> 24) & 255), (x.g = (d >> 16) & 255), (x.b = (d >> 8) & 255), (x.a = m((d & 255) / 0.255) / 1000);
    else (x.r = d >> 16), (x.g = (d >> 8) & 255), (x.b = d & 255), (x.a = -1);
  }
  return x;
}
function rAlphanums(n) { return rChoose(toLetters('0123456789abcdefghijklmnopq'), n); }
function randomColor() { return rColor(); }
function range(f, t, st = 1) {
	if (nundef(t)) {
		t = f - 1;
		f = 0;
	}
	let arr = [];
	for (let i = f; i <= t; i += st) {
		arr.push(i);
	}
	return arr;
}
function rCard(postfix = 'n', ranks = '*A23456789TJQK', suits = 'HSDC') { return rChoose(ranks) + rChoose(suits) + postfix; }
function rChoose(arr, n = 1, func = null, exceptIndices = null) {
	let indices = arrRange(0, arr.length - 1);
	if (isdef(exceptIndices)) {
		for (const i of exceptIndices) removeInPlace(indices, i);
	}
	if (isdef(func)) indices = indices.filter(x => func(arr[x]));
	if (n == 1) {
		let idx = Math.floor(Math.random() * indices.length);
		return arr[indices[idx]];
	}
	arrShufflip(indices);
	return indices.slice(0, n).map(x => arr[x]);
}
function rCoin(percent = 50) {
	let r = Math.random();
	r *= 100;
	return r < percent;
}
function rDate(before, after) {
	let after_date = new Date(after);
	let before_date = new Date(before);
	let random_date = new Date(Math.random() * (before_date.getTime() - after_date.getTime()) + after_date.getTime());
	return random_date;
}
function rDigits(n) { return rChoose(toLetters('0123456789'), n); }
function recConvertLists(o, maxlen = 25) {
	for (const k in o) {
		let val = o[k];
		if (isList(val)) {
			if (val.length > maxlen) val = val.slice(0, maxlen).toString() + '...';
			else val = val.toString();
			o[k] = val;
		} else if (isDict(val)) recConvertLists(val);
	}
}
function removeDuplicates(keys, prop) {
	let di = {};
	let res = [];
	let items = keys.map(x => Syms[x]);
	for (const item of items) {
		if (isdef(di[item.best])) { continue; }
		res.push(item);
		di[item.key] = true;
	}
	return res.map(x => x.key);
}
function removeInPlace(arr, el) {
	arrRemovip(arr, el);
}
function replaceAll(str, sSub, sBy) {
	let regex = new RegExp(sSub, 'g');
	return str.replace(regex, sBy);
}
function replaceAllFast(str, sSub, sBy) { return replaceAll(str, sSub, sBy); }
function replaceAllSafe(str, sSub, sBy) { return replaceAllSpecialChars(str, sSub, sBy); }
function replaceAllSpecialChars(str, sSub, sBy) { return str.split(sSub).join(sBy); }
function replaceAllX(str, sSub, sBy) { return replaceAllSpecialChars(str, sSub, sBy); }
function replaceAtString(s, i, ssub) { return s.substring(0, i) + ssub + s.substring(i + 1); }
function replaceEvery(w, letter, nth) {
	let res = '';
	for (let i = 1; i < w.length; i += 2) {
		res += letter;
		res += w[i];
	}
	if (w.length % 2) res += w[0];
	return res;
}
function return_elem_to_deck_from(el, arr, deck) { elem_from_to(el, arr, deck); }
function reverse(x) {
	if (isString(x)) {
		var newString = "";
		for (var i = x.length - 1; i >= 0; i--) {
			newString += x[i];
		}
		return newString;
	}
	if (isList(x)) return x.reverse();
	if (isDict(x)) return dict2list(x, 'value').reverse();
	return x;
}
function RGBAToHex9(rgba) {
	let n = allNumbers(rgba);
	if (n.length < 3) {
		return randomHexColor();
	}
	let a = n.length > 3 ? n[3] : 1;
	let sa = alphaToHex(a);
	if (rgba.includes('%')) {
		n[0] = Math.round((n[0] * 255) / 100);
		n[1] = Math.round((n[1] * 255) / 100);
		n[2] = Math.round((n[2] * 255) / 100);
	}
	return '#' + ((1 << 24) + (n[0] << 16) + (n[1] << 8) + n[2]).toString(16).slice(1) + sa;
}
function RGBAToHSLA(rgba) {
	let ex = /^rgba\((((((((1?[1-9]?\d)|10\d|(2[0-4]\d)|25[0-5]),\s?)){3})|(((([1-9]?\d(\.\d+)?)|100|(\.\d+))%,\s?){3}))|(((((1?[1-9]?\d)|10\d|(2[0-4]\d)|25[0-5])\s){3})|(((([1-9]?\d(\.\d+)?)|100|(\.\d+))%\s){3}))\/\s)((0?\.\d+)|[01]|(([1-9]?\d(\.\d+)?)|100|(\.\d+))%)\)$/i;
	if (ex.test(rgba)) {
		let sep = rgba.indexOf(',') > -1 ? ',' : ' ';
		rgba = rgba
			.substr(5)
			.split(')')[0]
			.split(sep);
		if (rgba.indexOf('/') > -1) rgba.splice(3, 1);
		for (let R in rgba) {
			let r = rgba[R];
			if (r.indexOf('%') > -1) {
				let p = r.substr(0, r.length - 1) / 100;
				if (R < 3) {
					rgba[R] = Math.round(p * 255);
				}
			}
		}
		let r = rgba[0] / 255,
			g = rgba[1] / 255,
			b = rgba[2] / 255,
			a = rgba[3],
			cmin = Math.min(r, g, b),
			cmax = Math.max(r, g, b),
			delta = cmax - cmin,
			h = 0,
			s = 0,
			l = 0;
		if (delta == 0) h = 0;
		else if (cmax == r) h = ((g - b) / delta) % 6;
		else if (cmax == g) h = (b - r) / delta + 2;
		else h = (r - g) / delta + 4;
		h = Math.round(h * 60);
		if (h < 0) h += 360;
		l = (cmax + cmin) / 2;
		s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
		s = +(s * 100).toFixed(1);
		l = +(l * 100).toFixed(1);
		return 'hsla(' + h + ',' + s + '%,' + l + '%,' + a + ')';
	} else {
		return 'Invalid input color';
	}
}
function rgbToHex(rgbStr) { return rgbStr && '#' + rgbStr.slice(4, -1).split(',').map(x => (+x).toString(16).padStart(2, '0')).join(''); }
function RGBToHex7(c) {
	let n = allNumbers(c);
	if (c.includes('%')) {
		n[0] = Math.round((n[0] * 255) / 100);
		n[1] = Math.round((n[1] * 255) / 100);
		n[2] = Math.round((n[2] * 255) / 100);
	}
	return '#' + ((1 << 24) + (n[0] << 16) + (n[1] << 8) + n[2]).toString(16).slice(1);
}
function RGBToHSL(rgb) {
	let ex = /^rgb\((((((((1?[1-9]?\d)|10\d|(2[0-4]\d)|25[0-5]),\s?)){2}|((((1?[1-9]?\d)|10\d|(2[0-4]\d)|25[0-5])\s)){2})((1?[1-9]?\d)|10\d|(2[0-4]\d)|25[0-5]))|((((([1-9]?\d(\.\d+)?)|100|(\.\d+))%,\s?){2}|((([1-9]?\d(\.\d+)?)|100|(\.\d+))%\s){2})(([1-9]?\d(\.\d+)?)|100|(\.\d+))%))\)$/i;
	if (ex.test(rgb)) {
		let sep = rgb.indexOf(',') > -1 ? ',' : ' ';
		rgb = rgb
			.substr(4)
			.split(')')[0]
			.split(sep);
		for (let R in rgb) {
			let r = rgb[R];
			if (r.indexOf('%') > -1) rgb[R] = Math.round((r.substr(0, r.length - 1) / 100) * 255);
		}
		let r = rgb[0] / 255,
			g = rgb[1] / 255,
			b = rgb[2] / 255,
			cmin = Math.min(r, g, b),
			cmax = Math.max(r, g, b),
			delta = cmax - cmin,
			h = 0,
			s = 0,
			l = 0;
		if (delta == 0) h = 0;
		else if (cmax == r) h = ((g - b) / delta) % 6;
		else if (cmax == g) h = (b - r) / delta + 2;
		else h = (r - g) / delta + 4;
		h = Math.round(h * 60);
		if (h < 0) h += 360;
		l = (cmax + cmin) / 2;
		s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
		s = +(s * 100).toFixed(1);
		l = +(l * 100).toFixed(1);
		return 'hsl(' + h + ',' + s + '%,' + l + '%)';
	} else {
		return 'Invalid input color';
	}
}
function rHue() { return (rNumber(0, 36) * 10) % 360; }
function rLetter(except) { return rLetters(1, except)[0]; }
function rLetters(n, except = []) {
	let all = 'abcdefghijklmnopqrstuvwxyz';
	for (const l of except) all = all.replace(l, '');
	console.log('all', all, except)
	return rChoose(toLetters(all), n);
}
function rNumber(min = 0, max = 100) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
async function route_path_yaml_dict(url) {
	let data = await fetch(url);
	let text = await data.text();
	let dict = jsyaml.load(text);
	return dict;
}
function rPassword(n) { return rChoose(toLetters('0123456789abcdefghijklmnopqABCDEFGHIJKLMNOPQRSTUVWXYZ!.?*&%$#@:;_'), n).join(''); }
function rPrimaryColor() { let c = '#' + rChoose(['ff', '00']) + rChoose(['ff', '00']); c += c == '#0000' ? 'ff' : c == '#ffff' ? '00' : rChoose(['ff', '00']); return c; }
function rRank(ranks = 'A23456789TJQK') { return rChoose(ranks); }
function rSuit(suit = 'HSDC') { return rChoose(suit); }
function sameList(l1, l2) {
	if (l1.length != l2.length) return false;
	for (const s of l1) {
		if (!l2.includes(s)) return false;
	}
	return true;
}
function selectText(el) {
	var sel, range;
	if (window.getSelection && document.createRange) {
		sel = window.getSelection();
		if (sel.toString() == '') {
			window.setTimeout(function () {
				range = document.createRange();
				range.selectNodeContents(el);
				sel.removeAllRanges();
				sel.addRange(range);
			}, 1);
		}
	} else if (document.selection) {
		sel = document.selection.createRange();
		if (sel.text == '') {
			range = document.body.createTextRange();
			range.moveToElementText(el);
			range.select();
		}
	}
}
function setKeys({ allowDuplicates, nMin = 25, lang, key, keySets, filterFunc, param, confidence, sortByFunc } = {}) {
	let keys = jsCopy(keySets[key]);
	if (isdef(nMin)) {
		let diff = nMin - keys.length;
		let additionalSet = diff > 0 ? nMin > 100 ? firstCondDictKeys(keySets, k => k != key && keySets[k].length > diff) : 'best100' : null;
		if (additionalSet) KeySets[additionalSet].map(x => addIf(keys, x));
	}
	let primary = [];
	let spare = [];
	for (const k of keys) {
		let info = Syms[k];
		info.best = info[lang];
		if (nundef(info.best)) {
			let ersatzLang = (lang == 'D' ? 'D' : 'E');
			let klang = 'best' + ersatzLang;
			if (nundef(info[klang])) info[klang] = lastOfLanguage(k, ersatzLang);
		}
		let isMatch = true;
		if (isdef(filterFunc)) isMatch = isMatch && filterFunc(param, k, info.best);
		if (isdef(confidence)) isMatch = info[klang + 'Conf'] >= confidence;
		if (isMatch) { primary.push(k); } else { spare.push(k); }
	}
	if (isdef(nMin)) {
		let len = primary.length;
		let nMissing = nMin - len;
		if (nMissing > 0) { let list = choose(spare, nMissing); spare = arrMinus(spare, list); primary = primary.concat(list); }
	}
	if (isdef(sortByFunc)) { sortBy(primary, sortByFunc); }
	if (isdef(nMin)) console.assert(primary.length >= nMin);
	if (nundef(allowDuplicates)) {
		primary = removeDuplicates(primary);
	}
	return primary;
}
function setRect(elem, options) {
	let r = getRect(elem);
	elem.rect = r;
	elem.setAttribute('rect', `${r.w} ${r.h} ${r.t} ${r.l} ${r.b} ${r.r}`);
	if (isDict(options)) {
		if (options.hgrow) mStyle(elem, { hmin: r.h });
		else if (options.hfix) mStyle(elem, { h: r.h });
		else if (options.hshrink) mStyle(elem, { hmax: r.h });
		if (options.wgrow) mStyle(elem, { wmin: r.w });
		else if (options.wfix) mStyle(elem, { w: r.w });
		else if (options.wshrink) mStyle(elem, { wmax: r.w });
	}
	return r;
}
function show(elem, isInline = false) {
	if (isString(elem)) elem = document.getElementById(elem);
	if (isSvg(elem)) {
		elem.setAttribute('style', 'visibility:visible');
	} else {
		elem.style.display = isInline ? 'inline-block' : null;
	}
	return elem;
}
function show_special_message(msg, stay = false, ms = 3000, delay = 0, styles = {}, callback = null) {
	let dParent = mBy('dBandMessage');
	if (nundef(dParent)) dParent = mDiv(document.body, {}, 'dBandMessage');
	show(dParent);
	clearElement(dParent);
	addKeys({ position: 'fixed', top: 200, classname: 'slow_gradient_blink', vpadding: 10, align: 'center', position: 'absolute', fg: 'white', fz: 24, w: '100vw' }, styles);
	if (!isEmpty(styles.classname)) { mClass(dParent, styles.classname); }
	delete styles.classname;
	mStyle(dParent, styles);
	dParent.innerHTML = msg;
	if (delay > 0) TO.special = setTimeout(() => { mFadeRemove(dParent, ms, callback); }, delay);
	else mFadeRemove(dParent, ms, callback);
}
function showFleetingMessage(msg, dParent, styles = {}, ms = 3000, msDelay = 0, fade = true) {
	clearFleetingMessage();
	dFleetingMessage = mDiv(dParent);
	if (msDelay) {
		TOFleetingMessage = setTimeout(() => fleetingMessage(msg, dFleetingMessage, styles, ms, fade), msDelay);
	} else {
		TOFleetingMessage = setTimeout(() => fleetingMessage(msg, dFleetingMessage, styles, ms, fade), 10);
	}
}
function shuffle(arr) { if (isEmpty(arr)) return []; else return fisherYates(arr); }
function shuffle_children(d) {
	let arr = Array.from(d.children);
	shuffle(arr);
	for (const ch of arr) { mAppend(d, ch); }
}
function shuffleChildren(dParent) { shuffle_children(dParent); }
function sortBy(arr, key) { arr.sort((a, b) => (a[key] < b[key] ? -1 : 1)); return arr; }
function sortByDescending(arr, key) { arr.sort((a, b) => (a[key] > b[key] ? -1 : 1)); return arr; }
function sortByFunc(arr, func) { arr.sort((a, b) => (func(a) < func(b) ? -1 : 1)); return arr; }
function sortByFuncDescending(arr, func) { arr.sort((a, b) => (func(a) > func(b) ? -1 : 1)); return arr; }
function sortNumbers(ilist) { ilist.sort(function (a, b) { return a - b }); return ilist; }
function splitAtAnyOf(s, sep) {
	let arr = [], w = '';
	for (let i = 0; i < s.length; i++) {
		let ch = s[i];
		if (sep.includes(ch)) {
			if (!isEmpty(w)) arr.push(w);
			w = '';
		} else {
			w += ch;
		}
	}
	if (!isEmpty(w)) arr.push(w);
	return arr;
}
function splitIntoNumbersAndWords(s) {
	let arr = [], i = 0;
	while (i < s.length) {
		let ch = s[i];
		let w = '';
		if (isDigit(ch)) while (i < s.length && isDigit(ch)) { w += ch; i++; ch = s[i]; }
		else if (isLetter(ch)) while (i < s.length && isLetter(ch)) { w += ch; i++; ch = s[i]; }
		else { i++; continue; }
		arr.push(w);
	}
	return arr;
}
function start_simple_timer(dtimer, msInterval, onTick, msTotal, onElapsed) {
	if (isdef(DA.timer)) { DA.timer.clear(); DA.timer = null; }
	let timer = DA.timer = new SimpleTimer(dtimer, msInterval, onTick, msTotal, onElapsed);
	timer.start();
}
function startsWith(s, sSub) {
	return s.substring(0, sSub.length) == sSub;
}
function stop_simple_timer() { if (isdef(DA.timer)) { DA.timer.clear(); DA.timer = null; } }
function stringAfter(sFull, sSub) {
	let idx = sFull.indexOf(sSub);
	if (idx < 0) return '';
	return sFull.substring(idx + sSub.length);
}
function stringAfterLast(sFull, sSub) {
	let parts = sFull.split(sSub);
	return arrLast(parts);
}
function stringBefore(sFull, sSub) {
	let idx = sFull.indexOf(sSub);
	if (idx < 0) return sFull;
	return sFull.substring(0, idx);
}
function stringBeforeLast(sFull, sSub) {
	let parts = sFull.split(sSub);
	return sFull.substring(0, sFull.length - arrLast(parts).length - 1);
}
function stringBetween(sFull, sStart, sEnd) {
	return stringBefore(stringAfter(sFull, sStart), isdef(sEnd) ? sEnd : sStart);
}
function stringBetweenLast(sFull, sStart, sEnd) {
	let s1 = stringBeforeLast(sFull, isdef(sEnd) ? sEnd : sStart);
	return stringAfterLast(s1, sStart);
}
function stripToKeys(o, di) {
	let res = {};
	for (const k in o) {
		if (isdef(di[k])) res[k] = o[k];
	}
	return res;
}
function timeConversion(duration, format = 'Hmsh') {
	const portions = [];
	const msInHour = 1000 * 60 * 60;
	const hours = Math.trunc(duration / msInHour);
	if (format.includes('H')) portions.push((hours < 10 ? '0' : '') + hours);
	duration = duration - (hours * msInHour);
	const msInMinute = 1000 * 60;
	const minutes = Math.trunc(duration / msInMinute);
	if (format.includes('m')) portions.push((minutes < 10 ? '0' : '') + minutes);
	duration = duration - (minutes * msInMinute);
	const msInSecond = 1000;
	const seconds = Math.trunc(duration / 1000);
	if (format.includes('s')) portions.push((seconds < 10 ? '0' : '') + seconds);
	duration = duration - (seconds * msInSecond);
	const hundreds = duration / 10;
	if (format.includes('h')) portions.push((hundreds < 10 ? '0' : '') + hundreds);
	return portions.join(':');
}
function toElem(d) { return isString(d) ? mBy(d) : d; }
function toggleSelection(pic, selected, clSelected = 'framedPicture', clUnselected = null) {
	let ui = iDiv(pic);
	pic.isSelected = !pic.isSelected;
	if (pic.isSelected) {
		if (isdef(clUnselected)) mClassRemove(ui, clUnselected);
		mClass(ui, clSelected);
	} else {
		mClassRemove(ui, clSelected);
		if (isdef(clUnselected)) mClass(ui, clUnselected);
	}
	if (isdef(selected)) {
		if (isList(selected)) {
			if (pic.isSelected) {
				console.assert(!selected.includes(pic), 'UNSELECTED PIC IN PICLIST!!!!!!!!!!!!')
				selected.push(pic);
			} else {
				console.assert(selected.includes(pic), 'PIC NOT IN PICLIST BUT HAS BEEN SELECTED!!!!!!!!!!!!')
				removeInPlace(selected, pic);
			}
		} else {
			mClassRemove(iDiv(selected), clSelected);
			if (isdef(clUnselected)) mClass(iDiv(selected), clUnselected);
			selected.isSelected = false;
		}
	}
	return pic.isSelected ? pic : null;
}
function toggleSelectionOfPicture(pic, selectedPics, className = 'framedPicture') {
	let ui = iDiv(pic);
	pic.isSelected = !pic.isSelected;
	if (pic.isSelected) mClass(ui, className); else mClassRemove(ui, className);
	if (isdef(selectedPics)) {
		if (pic.isSelected) {
			console.assert(!selectedPics.includes(pic), 'UNSELECTED PIC IN PICLIST!!!!!!!!!!!!')
			selectedPics.push(pic);
		} else {
			console.assert(selectedPics.includes(pic), 'PIC NOT IN PICLIST BUT HAS BEEN SELECTED!!!!!!!!!!!!')
			removeInPlace(selectedPics, pic);
		}
	}
}
function toLetters(s) { return [...s]; }
function top_elem_from_to(arr1, arr2) { arr2.push(arr1.shift()); }
function top_elem_from_to_top(arr1, arr2) { arr2.unshift(arr1.shift()); }
function toWords(s) {
	let arr = s.split(/(?:,|\s|!)+/);
	return arr.filter(x => !isEmpty(x));
}
function unfocusOnEnter(ev) {
	if (ev.key === 'Enter') {
		ev.preventDefault();
		mBy('dummy').focus();
	}
}
function valf(val, def) { return isdef(val) ? val : def; }
function valfi() {
	for (const arg of arguments) {
		if (isdef(arg)) return arg;
	}
	return null;
}
//#endregion basemin

//#region cards
function accuse_get_card(ckey, h, w, backcolor = BLUE, ov = .3) {
	if (is_color(ckey)) {
		return get_color_card(ckey, h)
	} else if (ckey.length > 3) {
		return get_number_card(ckey, h, null, backcolor, ov);
	} else {
		let info = get_c52j_info(ckey, backcolor);
		let card = cardFromInfo(info, h, w, ov);
		return card;
	}
}
function accuse_get_card_func(hcard = 80, backcolor = BLUE) { return ckey => accuse_get_card(ckey, hcard, null, backcolor); }
function aggregate_player_hands_by_rank(fen) {
	let di_ranks = {};
	let akku = [];
	for (const uname in fen.players) {
		let pl = fen.players[uname];
		let hand = pl.hand;
		for (const c of hand) {
			akku.push(c);
			let r = c[0];
			if (isdef(di_ranks[r])) di_ranks[r] += 1; else di_ranks[r] = 1;
		}
	}
	fen.akku = akku;
	return di_ranks;
}
function anim_face_down(item, ms = 300, callback = null) { face_up(item); anim_toggle_face(item, callback); }
function anim_face_up(item, ms = 300, callback = null) { face_down(item); anim_toggle_face(item, callback); }
function anim_toggle_face(item, ms = 300, callback = null) {
	let d = iDiv(item);
	mClass(d, 'aniflip');
	TO.anim = setTimeout(() => {
		if (item.faceUp) face_down(item); else face_up(item); mClassRemove(d, 'aniflip');
		if (isdef(callback)) callback();
	}, ms);
}
function ari_get_card(ckey, h, w, ov = .3) {
	let type = ckey[2];
	let sz = { largecard: 100, smallcard: 50 };
	let info = type == 'n' ? to_aristocard(ckey, sz.largecard) : type == 'l' ? to_luxurycard(ckey, sz.largecard) : type == 'r' ? to_rumorcard(ckey, sz.smallcard) : to_commissioncard(ckey, sz.smallcard);
	let card = cardFromInfo(info, h, w, ov);
	if (type == 'l') luxury_card_deco(card);
	else if (type == 'h') heritage_card_deco(card);
	return card;
}
function ari_get_card_large(ckey, h, w, ov = .2) {
	let type = ckey[2];
	let sz = { largecard: 120, smallcard: 80 };
	let info = type == 'n' ? to_aristocard(ckey, sz.largecard) : type == 'l' ? to_luxurycard(ckey, sz.largecard) : type == 'r' ? to_rumorcard(ckey, sz.smallcard) : to_commissioncard(ckey, sz.smallcard);
	let card = cardFromInfo(info, h, w, ov);
	if (type == 'l') luxury_card_deco(card);
	return card;
}
function calc_hand_value(hand, card_func = ferro_get_card) {
	let vals = hand.map(x => card_func(x).val);
	let sum = vals.reduce((a, b) => a + b, 0);
	return sum;
}
function cardFromInfo(info, h, w, ov) {
	let svgCode = C52[info.c52key];
	let ckey = info.key;
	if (info.rank == '*') {
		let color = get_color_of_card(ckey);
		if (color != 'red') svgCode = colored_jolly(color);
	}
	svgCode = '<div>' + svgCode + '</div>';
	let el = mCreateFrom(svgCode);
	h = valf(h, valf(info.h, 100));
	w = valf(w, h * .7);
	mSize(el, w, h);
	let res = {};
	copyKeys(info, res);
	copyKeys({ w: w, h: h, faceUp: true, div: el }, res);
	if (isdef(ov)) res.ov = ov;
	return res;
}
function colored_jolly(color) {
	let id = `J_${color}`;
	let svg = `
    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="card" face="1J" 
    height="100%" preserveAspectRatio="none" viewBox="-120 -168 240 336" width="100%">
    <symbol id="J11" preserveAspectRatio="none" viewBox="0 0 1300 2000">
    <path fill="#FC4" d="M1095,1000A445,445 0 0 1 650,1445 445,445 0 0 1 205,1000 445,445 0 0 1 650,555 445,445 0 0 1 1095,1000Z"></path>
    </symbol>
    <symbol id="${id}" preserveAspectRatio="none" viewBox="0 0 1300 2000">
    <path fill="${color}" d="M317.05664,1294.416 100,1620l220,-60 40,240 140,-200 160,200 40,-200 180,180 60,-220 260,60 -236.67969,-304.3027A445,445 0 0 1 650,1445 445,445 0 0 1 317.05664,1294.416ZM831.71484,249.10742C687.94378,262.65874 542.4812,256.33752 420,520 369.08062,331.38331 278.61481,370.61289 187.77148,412.01367a75,75 0 0 1 2.52344,19.12695 75,75 0 0 1 -16.78515,47.19532c66.827,55.25537 117.57478,127.8247 155.77539,213.90429A445,445 0 0 1 650,555 445,445 0 0 1 924.33984,650.26562c42.39917,-50.4556 91.60026,-93.34711 167.51176,-106.5332a75,75 0 0 1 -0.6524,-9.14258 75,75 0 0 1 14.6172,-44.3457C1026.3517,437.47479 931.12146,446.83238 840,440 761.98041,388.07638 804.10248,338.17898 853.51758,288.4043a75,75 0 0 1 -21.80274,-39.29688z"></path>
    </symbol>
    <symbol id="J13" preserveAspectRatio="none" viewBox="0 0 1300 2000">
    <path fill="#44F" d="M879.65521,937.6026a40,40 0 0 1 -40,40 40,40 0 0 1 -40,-40 40,40 0 0 1 40,-40 40,40 0 0 1 40,40zm-379.31039,0a40,40 0 0 1 -40,40 40,40 0 0 1 -40,-40 40,40 0 0 1 40,-40 40,40 0 0 1 40,40z"></path>
    </symbol>
    <symbol id="J14" preserveAspectRatio="none" viewBox="0 0 1300 2000">
    <path stroke="#44F" stroke-linecap="round" stroke-linejoin="round" stroke-width="6" fill="none" d="M317.05664,1294.416 100,1620l220,-60 40,240 140,-200 160,200 40,-200 180,180 60,-220 260,60 -236.67969,-304.3027M1241.1987,534.58948a75,75 0 0 1 -75,75 75,75 0 0 1 -75,-75 75,75 0 0 1 75,-75 75,75 0 0 1 75,75zM980.11493,234.09686a75,75 0 0 1 -75,75 75,75 0 0 1 -75,-75 75,75 0 0 1 75,-75 75,75 0 0 1 75,75zM190.29556,431.1412a75,75 0 0 1 -75,75 75,75 0 0 1 -74.999997,-75 75,75 0 0 1 74.999997,-75 75,75 0 0 1 75,75zM924.3457,650.27148c42.40088,-50.45397 91.5936,-93.35356 167.5059,-106.53906 -0.4037,-3.03138 -0.6215,-6.0846 -0.6524,-9.14258 0.03,-15.96068 5.1503,-31.4957 14.6172,-44.3457C1026.3517,437.47479 931.12146,446.83238 840,440 761.98041,388.07638 804.10248,338.17898 853.51758,288.4043 842.40414,277.84182 834.79487,264.12701 831.71484,249.10742 687.94378,262.65874 542.4812,256.33752 420,520 369.08062,331.38331 278.61481,370.61289 187.77148,412.01367c1.66108,6.24042 2.50924,12.66925 2.52344,19.12695 -0.0209,17.1896 -5.94587,33.85038 -16.7832,47.19336 66.82714,55.25532 117.5686,127.8306 155.76953,213.91016M384.88867,1140c51.89013,98.343 153.91815,159.9189 265.11133,160 111.19809,-0.076 213.23257,-61.6527 265.125,-160M1095,1000A445,445 0 0 1 650,1445 445,445 0 0 1 205,1000 445,445 0 0 1 650,555 445,445 0 0 1 1095,1000Z"></path>
    </symbol>
    <rect width="239" height="335" x="-119.5" y="-167.5" rx="12" ry="12" fill="white" stroke="black"></rect>
    <text x="-110" y="-115" fill="${color}" stroke="${color}" style="font:bold 60px sans-serif">*</text>
    <use width="202.8" height="312" x="-101.4" y="-156" xlink:href="#J11"></use>
    <use width="202.8" height="312" x="-101.4" y="-156" xlink:href="#${id}"></use>
    <use width="202.8" height="312" x="-101.4" y="-156" xlink:href="#J13"></use>
    <use width="202.8" height="312" x="-101.4" y="-156" xlink:href="#J14"></use>
    </svg>
  `;
	return svg;
}
function correct_handsorting(hand, plname) {
	let pl = Z.fen.players[plname];
	let [cs, pls, locs] = [Clientdata.handsorting, pl.handsorting, localStorage.getItem('handsorting')];
	let s = cs ?? pls ?? locs ?? Config.games[Z.game].defaulthandsorting;
	hand = sort_cards(hand, s == 'suit', 'CDSH', true, Z.func.rankstr);
	return hand;
}
function create_card_assets_c52() {
	let ranknames = { A: 'Ace', K: 'King', T: '10', J: 'Jack', Q: 'Queen' };
	let suitnames = { S: 'Spades', H: 'Hearts', C: 'Clubs', D: 'Diamonds' };
	let rankstr = '23456789TJQKA';
	let suitstr = 'SHDC';
	sz = 100;
	let di = {};
	for (const r of toLetters(rankstr)) {
		for (const s of toLetters(suitstr)) {
			let k = r + s;
			let info = di[k] = { key: k, val: 1, irank: rankstr.indexOf(r), isuit: suitstr.indexOf(s), rank: r, suit: s, color: RED, c52key: 'card_' + r + s, w: sz * .7, h: sz, sz: sz, ov: .25, friendly: `${isNumber(r) ? r : ranknames[r]} of ${suitnames[s]}`, short: `${r}${s}` };
			info.isort = info.isuit * 13 + info.irank;
		}
	}
	C52Cards = di;
	return di;
}
function create_fen_deck(cardtype, num_decks = 1, num_jokers = 0) {
	let arr = get_keys(C52Cards).map(x => x + cardtype);
	let newarr = [];
	while (num_decks > 0) { newarr = newarr.concat(arr); num_decks--; }
	while (num_jokers > 0) { newarr.push('*H' + cardtype); num_jokers--; }
	return newarr;
}
function face_down(item, color, texture) {
	if (!item.faceUp) return;
	if (isdef(texture) || lookup(item, ['live', 'dCover'])) {
		face_down_alt(item, color, texture);
	} else {
		let svgCode = C52.card_2B;
		item.div.innerHTML = svgCode;
		if (nundef(color)) color = item.color;
		if (isdef(item.color)) item.div.children[0].children[1].setAttribute('fill', item.color);
	}
	item.faceUp = false;
}
function face_down_alt(item, bg, texture_name) {
	let dCover = item.live.dCover;
	if (nundef(dCover)) {
		let d = iDiv(item);
		dCover = item.live.dCover = mDiv(d, { background: bg, rounding: mGetStyle(d, 'rounding'), position: 'absolute', width: '100%', height: '100%', left: 0, top: 0 });
		let t = get_texture(texture_name);
		dCover.style.backgroundImage = t;
		dCover.style.backgroundRepeat = 'repeat';
	} else mStyle(dCover, { display: 'block' });
}
function face_up(item) {
	if (item.faceUp) return;
	if (lookup(item, ['live', 'dCover'])) mStyle(item.live.dCover, { display: 'none' });
	else item.div.innerHTML = isdef(item.c52key) ? C52[item.c52key] : item.html;
	item.faceUp = true;
}
function ferro_get_card(ckey, h, w, ov = .25) {
	let type = ckey[2];
	let info = ckey[0] == '*' ? get_joker_info() : jsCopy(C52Cards[ckey.substring(0, 2)]);
	info.key = ckey;
	info.cardtype = ckey[2];
	let [r, s] = [info.rank, info.suit];
	info.val = r == '*' ? 50 : r == 'A' ? 20 : 'TJQK'.includes(r) ? 10 : Number(r);
	info.color = RED;
	info.sz = info.h = valf(h, Config.ui.card.h);
	info.w = valf(w, info.sz * .7);
	info.irank = '23456789TJQKA*'.indexOf(r);
	info.isuit = 'SHCDJ'.indexOf(s);
	info.isort = info.isuit * 14 + info.irank;
	let card = cardFromInfo(info, h, w, ov);
	return card;
}
function find_index_of_jolly(j) { return j.findIndex(x => is_jolly(x)); }
function find_jolly_rank(j, rankstr = 'A23456789TJQKA') {
	let jolly_idx = find_index_of_jolly(j);
	if (jolly_idx == -1) return false;
	if (jolly_idx > 0) {
		let rank_before_index = j[jolly_idx - 1][0];
		let rank_needed = rankstr[rankstr.indexOf(rank_before_index) + 1];
		return rank_needed;
	} else {
		let rank_after_index = j[jolly_idx + 1][0];
		let rank_needed = rank_after_index == 'A' ? 'K' : rankstr[rankstr.indexOf(rank_after_index) - 1];
		return rank_needed;
	}
}
function get_c52j_info(ckey, backcolor = BLUE) {
	let info;
	if (ckey[0] == '*') {
		info = {
			c52key: `card_0J`, //'card_1J', //`card_${1+n%2}`,
			color: "#e6194B",
			friendly: "Joker",
			key: ckey,
			h: 100,
			ov: 0.25,
			rank: "*",
			short: "J",
			suit: ckey[1],
			sz: 100,
			val: 0,
			w: 70,
		};
	} else {
		info = jsCopy(C52Cards[ckey.substring(0, 2)]);
	}
	info.key = ckey;
	info.cardtype = ckey[2];
	let [r, s] = [info.rank, info.suit];
	info.val = r == '*' ? 0 : r == 'A' ? 1 : 'TJQK'.includes(r) ? 10 : Number(r);
	info.color = backcolor;
	info.sz = info.h = sz;
	info.w = valf(w, sz * .7);
	let ranks = valf(lookup(Z, ['fen', 'ranks']), '*A23456789TJQK');
	info.irank = ranks.indexOf(r);
	info.isuit = 'SHCD'.indexOf(s);
	info.isort = info.isuit * ranks.length + info.irank;
	return info;
}
function get_color_of_card(ckey) { return is_color(ckey) ? ckey : ckey.length == 3 ? ['H', 'D'].includes(ckey[1]) ? 'red' : 'black' : stringAfter(ckey, '_'); }
function get_container_styles(styles = {}) { let defaults = valf(Config.ui.container, {}); defaults.position = 'relative'; addKeys(defaults, styles); return styles; }
function get_containertitle_styles(styles = {}) { let defaults = valf(Config.ui.containertitle, {}); defaults.position = 'absolute'; addKeys(defaults, styles); return styles; }
function get_group_rank(j) { let non_jolly_key = firstCond(j, x => !is_jolly(x)); return non_jolly_key[0]; }
function get_joker_info() {
	return {
		c52key: `card_0J`, //'card_1J', //`card_${1+n%2}`,
		color: "#e6194B",
		friendly: "Joker",
		key: '*Hn',
		h: 100,
		irank: 14,
		isort: 100,
		isuit: 3,
		ov: 0.25,
		rank: "*",
		short: "J",
		suit: "H",
		sz: 100,
		val: 1,
		w: 70,
	};
}
function get_sequence_suit(j) { let non_jolly_key = firstCond(j, x => !is_jolly(x)); return non_jolly_key[1]; }
function has_at_most_n_jolly(j, n = 1) { return j.filter(x => is_jolly(x)).length <= n; }
function has_jolly(j) { return firstCond(j, x => is_jolly(x)); }
function heritage_card_deco(card) {
	let d = iDiv(card); mStyle(d, { position: 'relative' });
	let d1 = mDiv(d, { fg: 'silver', fz: 11, family: 'tangerine', position: 'absolute', right: '36%', top: 1 }, null, 'heritage');
}
function is_card_key(ckey, rankstr = '*A23456789TJQK', suitstr = 'SHCD') {
	return is_nc_card(ckey) || is_color(ckey) || rankstr.includes(ckey[0]) && suitstr.includes(ckey[1]);
}
function is_joker(card) { return is_jolly(card.key); }
function is_jolly(ckey) { return ckey[0] == '*'; }
function is_overlapping_set(cards, max_jollies_allowed = 1, seqlen = 7, group_same_suit_allowed = true) {
	let istart = 0;
	let inextstart = 0;
	let lmin = 3;
	let legal = true;
	if (cards.length < lmin) return false;
	while (legal && istart <= cards.length - lmin) {
		let cl = cards.slice(istart, istart + lmin);
		let set = ferro_is_set(cl, max_jollies_allowed, seqlen, group_same_suit_allowed);
		if (set) { istart++; inextstart = Math.min(istart + lmin, cards.length - 3); }
		else if (!set && inextstart == istart) return false;
		else istart++;
	}
	return cards.map(x => x.key);
}
function jolly_matches(key, j, rankstr = 'A23456789TJQKA') {
	let jolly_idx = find_index_of_jolly(j);
	if (jolly_idx == -1) return false;
	if (is_group(j)) {
		let r = get_group_rank(j);
		if (key[0] == r) return true;
	} else if (jolly_idx > 0) {
		let rank_before_index = j[jolly_idx - 1][0];
		let suit_needed = j[jolly_idx - 1][1];
		let rank_needed = rankstr[rankstr.indexOf(rank_before_index) + 1];
		if (key[0] == rank_needed && key[1] == suit_needed) return true;
	} else {
		let rank_after_index = j[jolly_idx + 1][0];
		let suit_needed = j[jolly_idx + 1][1];
		let rank_needed = rank_after_index == 'A' ? 'K' : rankstr[rankstr.indexOf(rank_after_index) - 1];
		if (key[0] == rank_needed && key[1] == suit_needed) return true;
	}
	return false;
}
function luxury_card_deco(card) {
	let d = iDiv(card); mStyle(d, { position: 'relative' });
	let d1 = mDiv(d, { fg: 'dimgray', fz: 11, family: 'tangerine', position: 'absolute', left: 0, top: 0, 'writing-mode': 'vertical-rl', transform: 'scale(-1)', top: '35%' }, null, 'Luxury');
	let html = `<img height=${18} src="../base/assets/images/icons/deco0.svg" style="transform:scaleX(-1);">`;
	d1 = mDiv(d, { position: 'absolute', bottom: -2, left: 3, opacity: .25 }, null, html);
}
function pop_top(o) {
	if (isEmpty(o.list)) return null;
	let t = o.get_topcard();
	o.list.shift();
	o.renew(o.list, o.cardcontainer, o.items, o.get_card_func);
	return t;
}
function remove_card_shadow(c) { iDiv(c).firstChild.setAttribute('class', null); }
function replace_jolly(key, j) {
	let jolly_idx = find_index_of_jolly(j);
	j[jolly_idx] = key;
}
function set_card_border(item, thickness = 1, color = 'black', dasharray) {
	let d = iDiv(item);
	let rect = lastDescendantOfType('rect', d);
	if (rect) {
		rect.setAttribute('stroke-width', thickness);
		rect.setAttribute('stroke', color);
		if (isdef(dasharray)) rect.setAttribute('stroke-dasharray', dasharray);
	} else {
		mStyle(d, { border: `solid ${1}px ${color}` })
	}
}
function set_card_style(item, styles = {}, className) {
	console.log('set_card_style', item, styles);
	let d = iDiv(item);
	let svg = findDescendantOfType('svg', d);
	let rect = findDescendantOfType('rect', svg);
	if (isdef(styles.shadow)) {
		let shadow = styles.shadow;
		delete styles.shadow;
		let hexcolor = colorFrom(styles.shadow);
		svg.style.filter = `drop-shadow(4px 5px 2px ${hexcolor})`;
	}
	if (isdef(styles.bg)) {
		let hexcolor = colorFrom(styles.bg);
		rect.setAttribute('stroke-width', 14); rect.setAttribute('stroke', hexcolor);
	}
	assertion(rect, 'NO RECT FOUND IN ELEM', d);
	mStyle(d, styles);
	if (isdef(className)) mClass(svg, className);
}
function set_card_style_works(c, styles, className) {
	let d = iDiv(c);
	mStyle(d, styles);
	d.firstChild.setAttribute('class', className);
}
function sheriff_card(name, color) {
	let di = SHERIFF.cards;
	let info = valf(di[name], { ksym: 'crossbow', kcenter: 'green apple', label: 'crossbow', type: 'contraband', value: 9, penalty: 4 });
	let bcolor = SHERIFF.color[info.type];
	let c = cPortrait(null, { margin: 12, border: `solid 4px ${bcolor}`, bg: valf(color, colorLight('gold', 60)) });
	let d = iDiv(c);
	let ds = mSym(info.ksym, d, { sz: 30 }, 'tl');
	ds = mSymText(info.value, d, { sz: 25, rounding: '50%', bg: 'gold', margin: 3 }, 'tr');
	ds = mText(info.label.toUpperCase(), d, { family: 'Algerian', w: '100%', fz: 12, align: 'center', position: 'absolute', bottom: 0 });
	ds = mText(info.label.toUpperCase(), d, { family: 'Algerian', w: '100%', fz: 12, align: 'center', position: 'absolute', top: 0 });
	ds = mSymText(info.penalty, d, { sz: 25, rounding: '50%', bg: 'crimson', margin: 3 }, 'br');
	ds = mSym(info.kcenter, d, { sz: 70 }, 'cc'); mPos(ds, 'calc( 50% - 35px )', 'calc( 50% - 35px )');
	return c;
}
function sort_cards(hand, bySuit = true, suits = 'CDHS', byRank = true, rankstr = '23456789TJQKA') {
	if (bySuit && byRank) {
		let buckets = arrBuckets(hand, x => x[1], suits);
		for (const b of buckets) { sort_cards(b.list, false, null, true, rankstr); }
		hand.length = 0; buckets.map(x => x.list.map(y => hand.push(y)));
	} else if (bySuit) hand.sort((a, b) => suits.indexOf(a[1]) - suits.indexOf(b[1]));
	else if (byRank) hand.sort((a, b) => rankstr.indexOf(a[0]) - rankstr.indexOf(b[0]));
	return hand;
}
function sortByRank(ckeys, rankstr = '23456789TJQKA') {
	let ranks = toLetters(rankstr);
	ckeys.sort((a, b) => ranks.indexOf(a[0]) - ranks.indexOf(b[0]));
	return ckeys;
}
function sortCardItemsByRank(items, rankstr = '23456789TJQKA') {
	let ranks = toLetters(rankstr);
	items.sort((a, b) => ranks.indexOf(a.key[0]) - ranks.indexOf(b.key[0]));
	return items;
}
function sortCardItemsBySuit(items, suitstr = 'CDSH') {
	let ranks = toLetters(suitstr);
	items.sort((a, b) => ranks.indexOf(a.key[1]) - ranks.indexOf(b.key[1]));
	return items;
}
function sortCardItemsToSequence(items, rankstr = '23456789TJQKA', jolly_allowed = 1) {
	let ranks = toLetters(rankstr);
	let n = items.length;
	let jollies = items.filter(x => is_joker(x));
	if (jollies.length > jolly_allowed) { return null; }
	let no_jolly = items.filter(x => !is_joker(x));
	let sorted = sortCardItemsByRank(no_jolly, rankstr);
	let partial_sequences = [], seq = [sorted[0]], first, second;
	for (let i = 0; i < sorted.length - 1; i++) {
		first = sorted[i];
		second = sorted[i + 1];
		diff = second.irank - first.irank;
		if (diff == 1) { seq.push(second); }
		else {
			partial_sequences.push({ seq: seq, len: seq.length, diff_to_next: diff });
			seq = [second];
		}
	}
	diff = sorted[0].irank - (sorted[sorted.length - 1].irank - rankstr.length)
	if (!isEmpty(seq)) {
		partial_sequences.push({ seq: seq, len: seq.length, diff_to_next: diff });
	} else {
		arrLast(partial_sequences).diff_to_next = diff;
	}
	let i_max_diff = partial_sequences.findIndex(x => x.diff_to_next == Math.max(...partial_sequences.map(x => x.diff_to_next)));
	let max_diff = partial_sequences[i_max_diff].diff_to_next;
	let istart = (i_max_diff + 1) % partial_sequences.length;
	let final_sequence = [];
	let jollies_needed = 0;
	let len = partial_sequences.length;
	let ij = 0;
	for (let i = 0; i < len; i++) {
		let index = (i + istart) % len;
		let list = partial_sequences[index].seq;
		final_sequence = final_sequence.concat(list);
		let nj = partial_sequences[index].diff_to_next - 1;
		if (i < len - 1) {
			for (let j = 0; j < nj; j++) { final_sequence.push(jollies[ij++]); }
			jollies_needed += nj;
		}
	}
	for (let i = 0; i < final_sequence.length; i++) { items[i] = final_sequence[i]; }
	return jollies_needed;
}
function spread_hand(path, ov) {
	let hand = lookup(UI, path.split('.'));
	assertion(hand, 'hand does NOT exist', path);
	if (hand.ctype != 'hand') return;
	if (isEmpty(hand.items)) return;
	let card = hand.items[0];
	if (nundef(ov)) ov = card.ov;
	if (hand.ov == ov) return;
	hand.ov = ov;
	let cont = hand.cardcontainer;
	let items = hand.items;
	mContainerSplay(cont, hand.splay, card.w, card.h, items.length, ov * card.w);
}
function symbolcolor(card, color) {
	let d = iDiv(card);
	let els = d.getElementsByTagName('symbol');
	console.log('list', els)
	for (const el of els) {
		let html = el.innerHTML;
		let html1 = replaceAll(html, 'red', color);
		let html2 = replaceAll(html1, 'black', color);
		el.innerHTML = html2;
	}
}
function to_aristocard(ckey, sz = 100, color = RED, w) {
	let info = jsCopy(C52Cards[ckey.substring(0, 2)]);
	info.key = ckey;
	info.cardtype = ckey[2];
	let [r, s] = [info.rank, info.suit];
	info.val = r == 'A' ? 1 : 'TJQK'.includes(r) ? 10 : Number(r);
	info.color = color;
	info.sz = info.h = sz;
	info.w = valf(w, sz * .7);
	info.irank = 'A23456789TJQK'.indexOf(r);
	info.isuit = 'SHCD'.indexOf(s);
	info.isort = info.isuit * 13 + info.irank;
	return info;
}
function to_commissioncard(ckey, sz = 40, color = GREEN, w) { return to_aristocard(ckey, sz, color); }
function to_luxurycard(ckey, sz = 100, color = 'gold', w) { return to_aristocard(ckey, sz, color); }
function to_rumorcard(ckey, sz = 40, color = GREEN, w) { return to_aristocard(ckey, sz, color); }
function toggle_face(item) { if (item.faceUp) face_down(item); else face_up(item); }
function ui_add_cards_to_deck_container(cont, items, list) {
	if (nundef(list)) list = items.map(x => x.key);
	for (const item of items) {
		mAppend(cont, iDiv(item));
		mItemSplay(item, list, 4, Card.ovdeck);
		face_down(item);
	}
	return items[0];
}
function ui_add_cards_to_hand_container(cont, items, list) {
	if (nundef(list)) list = items.map(x => x.key);
	for (const item of items) {
		mAppend(cont, iDiv(item));
		mItemSplay(item, list, 2, Card.ovw);
	}
}
function ui_add_container_title(title, cont, items, show_if_empty) {
	if (isdef(title) && (!isEmpty(items) || show_if_empty)) {
		let st = get_containertitle_styles();
		let stmeasure = jsCopy(st); delete stmeasure.position;
		let elem = mText(title, cont, stmeasure);
		let sz = getSizeNeeded(elem);
		let offsetx = valf(st.left, 0);
		let cont_wmin = mGetStyle(cont, 'wmin');
		let my_min = sz.w + offsetx * 1.5;
		let wmin = !isNumber(cont_wmin) ? my_min : Math.max(valf(cont_wmin, 0), my_min);
		mStyle(cont, { wmin: wmin });
		mStyle(elem, st);
	}
}
function ui_make_container(dParent, styles = { bg: 'random', padding: 10 }) {
	let id = getUID('u');
	let d = mDiv(dParent, styles, id);
	return d;
}
function ui_make_deck_container(list, dParent, styles = { bg: 'random', padding: 10 }, get_card_func) {
	let id = getUID('u');
	let d = mDiv(dParent, styles, id);
	if (isEmpty(list)) return d;
	let c = get_card_func(list[0]);
	mContainerSplay(d, 4, c.w, c.h, n, 0);
	return d;
}
function ui_make_hand_container(items, dParent, styles = { bg: 'random', padding: 10 }) {
	let id = getUID('u');
	let d = mDiv(dParent, styles, id);
	if (!isEmpty(items)) {
		let card = items[0];
		mContainerSplay(d, 2, card.w, card.h, items.length, card.ov * card.w);
	}
	return d;
}
function ui_type_building(b, dParent, styles = {}, path = 'farm', title = '', get_card_func = ari_get_card, separate_lead = false, ishidden = false) {
	let cont = ui_make_container(dParent, get_container_styles(styles));
	let cardcont = mDiv(cont);
	let list = b.list;
	let d = mDiv(dParent);
	let items = list.map(x => get_card_func(x));
	reindex_items(items);
	let d_harvest = null;
	if (isdef(b.h)) {
		let keycard = items[0];
		let d = iDiv(keycard);
		mStyle(d, { position: 'relative' });
		d_harvest = mDiv(d, { position: 'absolute', w: 20, h: 20, bg: 'orange', opacity: .5, fg: 'black', top: '45%', left: -10, rounding: '50%', align: 'center' }, null, 'H');
	}
	let d_rumors = null, rumorItems = [];
	if (!isEmpty(b.rumors)) {
		let d = cont;
		mStyle(d, { position: 'relative' });
		d_rumors = mDiv(d, { display: 'flex', gap: 2, position: 'absolute', h: 30, bottom: 0, right: 0 });
		for (const rumor of b.rumors) {
			let dr = mDiv(d_rumors, { h: 24, w: 16, vmargin: 3, align: 'center', bg: 'dimgray', rounding: 2 }, null, 'R');
			rumorItems.push({ div: dr, key: rumor });
		}
	}
	let card = isEmpty(items) ? { w: 1, h: 100, ov: 0 } : items[0];
	let [ov, splay] = separate_lead ? [card.ov * 1.5, 5] : [card.ov, 2];
	mContainerSplay(cardcont, 5, card.w, card.h, items.length, card.ov * 1.5 * card.w);
	ui_add_cards_to_hand_container(cardcont, items, list);
	ui_add_container_title(title, cont, items);
	let uischweine = [];
	for (let i = 1; i < items.length; i++) {
		let item = items[i];
		if (!b.schweine.includes(i)) face_down(item); else add_ui_schwein(item, uischweine);
	}
	return {
		ctype: 'hand',
		list: list,
		path: path,
		container: cont,
		cardcontainer: cardcont,
		items: items,
		schweine: uischweine,
		harvest: d_harvest,
		rumors: rumorItems,
		keycard: items[0],
	};
}
function ui_type_church(list, dParent, styles = {}, path = 'trick', title = '', get_card_func = ari_get_card, show_if_empty = false) {
	let cont = ui_make_container(dParent, get_container_styles(styles));
	let cardcont = mDiv(cont, { display: 'flex' });
	let items = [];
	let n = Z.plorder.length;
	let inc = 90;
	let rotation = n % 2 ? 0 : 90;
	for (const ckey of list) {
		let d = mDiv(cardcont, { origin: 'center', transform: `rotate( ${rotation}deg )`, position: 'absolute', left: 8 });
		let c = get_card_func(ckey);
		if (ckey != arrLast(list)) face_down(c);
		mAppend(d, iDiv(c));
		remove_card_shadow(c);
		let item = { card: c, div: d };
		items.push(item);
		rotation += inc;
	}
	ui_add_container_title(title, cont, items, show_if_empty);
	return {
		list: list,
		path: path,
		container: cont,
		cardcontainer: cardcont,
		items: items,
	}
}
function ui_type_deck(list, dParent, styles = {}, path = 'deck', title = 'deck', get_card_func = ari_get_card, show_if_empty = false) {
	let cont = ui_make_container(dParent, get_container_styles(styles));
	let cardcont = mDiv(cont);
	let items = [];
	ensure_ui(list, cardcont, items, get_card_func);
	ui_add_container_title(title, cont, items, show_if_empty);
	function get_topcard() { return isEmpty(list) ? null : items[0]; }
	function get_bottomcard() { return isEmpty(list) ? null : arrLast(items); }
	function ensure_ui(list, cardcont, items, get_card_func) {
		clearElement(cardcont); arrClear(items); if (isEmpty(list)) return;
		let n = Math.min(2, list.length); let ct = get_card_func(list[0]); items.push(ct); if (n > 1) { let cb = get_card_func(arrLast(list)); items.push(cb); }
		mStyle(cardcont, { position: 'relative', wmin: ct.w + 8, hmin: ct.h });
		for (let i = items.length - 1; i >= 0; i--) { let x = items[i]; face_down(x); mAppend(cardcont, iDiv(x)); mStyle(iDiv(x), { position: 'absolute', top: 0, left: 0 }) }
		mText(list.length, iDiv(ct), { position: 'absolute', left: list.length >= 100 ? '10%' : '25%', top: 10, fz: ct.h / 3 });
	}
	return {
		ctype: 'deck',
		container: cont,
		cardcontainer: cardcont,
		items: items,
		list: list,
		title: title,
		path: path,
		func: get_card_func,
		get_topcard: get_topcard,
		get_bottomcard: get_bottomcard,
		get_card_func: get_card_func,
		renew: ensure_ui,
	};
}
function ui_type_hand(list, dParent, styles = {}, path = 'hand', title = 'hand', get_card_func = ari_get_card, show_if_empty = false) {
	let cont = ui_make_container(dParent, get_container_styles(styles));
	let items = list.map(x => get_card_func(x));
	let cardcont = mDiv(cont);
	let card = isEmpty(items) ? { w: 1, h: Config.ui.card.h, ov: 0 } : items[0];
	let splay = 2;
	mContainerSplay(cardcont, splay, card.w, card.h, items.length, card.ov * card.w);
	ui_add_cards_to_hand_container(cardcont, items, list);
	ui_add_container_title(title, cont, items, show_if_empty);
	return {
		ctype: 'hand',
		list: list,
		path: path,
		container: cont,
		cardcontainer: cardcont,
		splay: splay,
		items: items,
	};
}
function ui_type_lead_hand(list, dParent, styles = {}, path = 'hand', title = 'hand', get_card_func = ari_get_card, show_if_empty = false) {
	let hcard = isdef(styles.h) ? styles.h - 30 : Config.ui.card.h;
	addKeys(get_container_styles(styles), styles);
	let cont = ui_make_container(dParent, styles);
	let items = list.map(x => get_card_func(x, hcard));
	let cardcont = mDiv(cont);
	let card = isEmpty(items) ? { w: 1, h: hcard, ov: 0 } : items[0];
	let splay = 5;
	mContainerSplay(cardcont, splay, card.w, card.h, items.length, card.ov * card.w);
	ui_add_cards_to_hand_container(cardcont, items, list);
	ui_add_container_title(title, cont, items, show_if_empty);
	return {
		ctype: 'hand',
		list: list,
		path: path,
		container: cont,
		cardcontainer: cardcont,
		splay: splay,
		items: items,
	};
}
function ui_type_market(list, dParent, styles = {}, path = 'market', title = 'market', get_card_func = ari_get_card, show_if_empty = false) {
	let cont = ui_make_container(dParent, get_container_styles(styles));
	let cardcont = mDiv(cont, { display: 'flex', gap: 2 });
	let items = list.map(x => get_card_func(x));
	items.map(x => mAppend(cardcont, iDiv(x)));
	ui_add_container_title(title, cont, items, show_if_empty);
	return {
		ctype: 'market',
		list: list,
		path: path,
		container: cont,
		cardcontainer: cardcont,
		items: items,
	};
}
function ui_type_rank_count(list, dParent, styles, path, title, get_card_func, show_if_empty = false) {
	let cont = ui_make_container(dParent, get_container_styles(styles));
	let cardcont = mDiv(cont, { display: 'flex' });
	let items = [];
	for (const o of list) {
		let d = mDiv(cardcont, { display: 'flex', dir: 'c', padding: 1, fz: 12, align: 'center', position: 'relative' });
		let c = get_card_func(o.key);
		mAppend(d, iDiv(c));
		remove_card_shadow(c);
		d.innerHTML += `<span style="font-weight:bold">${o.count}</span>`;
		let item = { card: c, count: o.count, div: d };
		items.push(item);
	}
	ui_add_container_title(title, cont, items, show_if_empty);
	return {
		list: list,
		path: path,
		container: cont,
		cardcontainer: cardcont,
		items: items,
	}
}
//#endregion cards

//#region gamehelpers
function activate_playerstats(items) {
	let fen = Z.fen;
	for (const plname in fen.players) {
		let ui = items[plname];
		let d = iDiv(ui);
		d.onclick = () => { switch_uname(plname); onclick_reload(); }
	}
}
function activate_ui() {
	if (uiActivated) { DA.ai_is_moving = false; return; }
	uiActivated = true; DA.ai_is_moving = false;
}
function aggregate_elements(list_of_object, propname) {
	let result = [];
	for (let i = 0; i < list_of_object.length; i++) {
		let obj = list_of_object[i];
		let arr = obj[propname];
		for (let j = 0; j < arr.length; j++) {
			result.push(arr[j]);
		}
	}
	return result;
}
function ai_move(ms = 100) {
	DA.ai_is_moving = true;
	let [A, fen] = [valf(Z.A, {}), Z.fen];
	let selitems;
	if (Z.game == 'accuse' && Z.stage == 'hand') {
		selitems = [];
	} else if (Z.game == 'ferro') {
		if (Z.stage == 'card_selection') {
			let uplayer = Z.uplayer;
			let i1 = firstCond(A.items, x => x.path.includes(`${uplayer}.hand`));
			let i2 = firstCond(A.items, x => x.key == 'discard');
			selitems = [i1, i2];
		} else if (Z.stage == 'buy_or_pass') {
			selitems = [A.items[1]];
		} else selitems = [A.items[0]];
	} else if (Z.game == 'bluff') {
		let [newbid, handler] = bluff_ai();
		if (newbid) { fen.newbid = newbid; UI.dAnzeige.innerHTML = bid_to_string(newbid); }
		else if (handler != handle_gehtHoch) { bluff_generate_random_bid(); }
		A.callback = handler;
		selitems = [];
	} else if (A.command == 'trade') {
		selitems = ai_pick_legal_trade();
	} else if (A.command == 'exchange') {
		selitems = ai_pick_legal_exchange();
	} else if (A.command == 'upgrade') {
		selitems = [rChoose(A.items)];
	} else if (A.command == 'rumor') {
		selitems = [];
		let buildings = A.items.filter(x => x.path.includes('building'));
		let rumors = A.items.filter(x => !x.path.includes('building'));
		selitems = [rChoose(buildings), rChoose(rumors)];
	} else if (ARI.stage[Z.stage] == 'rumors_weitergeben') {
		let players = A.items.filter(x => Z.plorder.includes(x.key))
		let rumors = A.items.filter(x => !Z.plorder.includes(x.key))
		selitems = [rChoose(players), rChoose(rumors)];
	} else if (ARI.stage[Z.stage] == 'journey') {
		selitems = [];
	} else {
		let items = A.items;
		let nmin = A.minselected;
		let nmax = Math.min(A.maxselected, items.length);
		let nselect = rNumber(nmin, nmax);
		selitems = rChoose(items, nselect); if (!isList(selitems)) selitems = [selitems];
	}
	for (const item of selitems) {
		select_last(item, select_toggle);
		if (isdef(item.submit_on_click)) A.selected.pop();
	}
	clearTimeout(TO.ai);
	loader_on();
	TO.ai = setTimeout(() => { if (isdef(A.callback)) A.callback(); loader_off(); }, ms);
}
function ai_schummler() { }
function animate_card_approx(card, goal, ms, callback) {
	let d = iDiv(card);
	let dgoal = iDiv(goal);
	let r = getRect(d);
	let rgoal = getRect(dgoal);
	let c = { x: r.x + r.w / 2, y: r.y + r.h / 2 };
	let cgoal = { x: rgoal.x + rgoal.w / 2, y: rgoal.y + rgoal.h / 2 };
	let v = { x: cgoal.x - c.x, y: cgoal.y - c.y };
	mAnimateList(d, { transform: `translateX(${v.x}px) translateY(${v.y}px)`, opacity: 0 }, callback, ms, 'linear');
}
function animate_card_exchange(i0, i1, callback) {
	ari_make_unselectable(i0);
	ari_make_unselectable(i1);
	let d0 = iDiv(i0.o);
	let d1 = iDiv(i1.o);
	let r0 = getRect(d0);
	let r1 = getRect(d1);
	let c0 = { x: r0.x + r0.w / 2, y: r0.y + r0.h / 2 };
	let c1 = { x: r1.x + r1.w / 2, y: r1.y + r1.h / 2 };
	let v = { x: c1.x - c0.x, y: c1.y - c0.y };
	mTranslateBy(d0, v.x, v.y);
	mTranslateBy(d1, -v.x, -v.y, 700, callback);
}
function animate_card_transfer(card, goal, callback) {
	let d = iDiv(card);
	let dgoal = iDiv(goal);
	let r = getRect(d);
	let rgoal = getRect(dgoal);
	let c = { x: r.x + r.w / 2, y: r.y + r.h / 2 };
	let cgoal = { x: rgoal.x + rgoal.w / 2, y: rgoal.y + rgoal.h / 2 };
	let v = { x: cgoal.x - c.x, y: cgoal.y - c.y };
	mTranslateBy(d, v.x, v.y, 700, callback);
}
function animate_title() {
	var rev = "fwd";
	function titlebar(val) {
		var msg = "Hallodi!";
		var res = " ";
		var speed = 100;
		var pos = val;
		msg = "   |-" + msg + "-|";
		var le = msg.length;
		if (rev == "fwd") {
			if (pos < le) {
				pos = pos + 1;
				scroll = msg.substr(0, pos);
				document.title = scroll;
				timer = window.setTimeout("titlebar(" + pos + ")", speed);
			}
			else {
				rev = "bwd";
				timer = window.setTimeout("titlebar(" + pos + ")", speed);
			}
		}
		else {
			if (pos > 0) {
				pos = pos - 1;
				var ale = le - pos;
				scrol = msg.substr(ale, le);
				document.title = scrol;
				timer = window.setTimeout("titlebar(" + pos + ")", speed);
			}
			else {
				rev = "fwd";
				timer = window.setTimeout("titlebar(" + pos + ")", speed);
			}
		}
	}
	titlebar(0);
}
function animatedTitle(msg = 'DU BIST DRAN!!!!!') {
	TO.titleInterval = setInterval(() => {
		let corner = CORNERS[WhichCorner++ % CORNERS.length];
		document.title = `${corner} ${msg}`; //'⌞&amp;21543;    U+231E \0xE2Fo\u0027o Bar';
	}, 1000);
}
function ari_show_handsorting_buttons_for(plname) {
	if (Z.role == 'spectator' || isdef(mBy('dHandButtons'))) return;
	let fen = Z.fen;
	let pl = fen.players[plname];
	if (pl.hand.length <= 1) return;
	let d = UI.players[plname].hand.container; mStyle(d, { position: 'relative' });
	let dHandButtons = mDiv(d, { position: 'absolute', bottom: -2, left: 52, height: 25 }, 'dHandButtons');
	show_player_button('sort', dHandButtons, onclick_by_rank);
}
function beautify_history(lines, title, fen, uplayer) {
	let html = `<div class="history"><span style="color:red;font-weight:bold;">${title}: </span>`;
	for (const l of lines) {
		let words = toWords(l);
		for (const w1 of words) {
			if (is_card_key(w1)) { html += mCardText(w1); continue; }
			w = w1.toLowerCase();
			if (isdef(fen.players[w])) {
				html += `<span style="color:${get_user_color(w)};font-weight:bold"> ${w} </span>`;
			} else html += ` ${w} `;
		}
		if (lines.length > 1) html = html.trim() + (l == arrLast(lines) ? '.' : ', ');
	}
	html += "</div>";
	return html;
}
function clear_screen() { mShieldsOff(); clear_status(); clear_title(); for (const ch of arrChildren('dScreen')) mClear(ch); mClassRemove('dTexture', 'wood'); mStyle(document.body, { bg: 'white', fg: 'black' }); }
function clear_status() { if (nundef(mBy('dStatus'))) return; clearTimeout(TO.fleeting); mRemove("dStatus"); }
function clear_title() { mClear('dTitleMiddle'); mClear('dTitleLeft'); mClear('dTitleRight'); }
function clearPlayers() {
	for (const item of DA.allPlayers) {
		if (item.isSelected && !is_loggedin(item.uname)) {
			style_not_playing(item, '', DA.playerlist);
		}
	}
	assertion(!isEmpty(DA.playerlist), "uname removed from playerlist!!!!!!!!!!!!!!!")
	DA.lastName = DA.playerlist[0].uname;
}
function collect_game_specific_options(game) {
	let poss = Config.games[game].options;
	if (nundef(poss)) return;
	let di = {};
	for (const p in poss) {
		let key = p;
		let vals = poss[p];
		if (isString(vals) && vals.split(',').length <= 1) {
			di[p] = isNumber(vals) ? Number(vals) : vals;
			continue;
		}
		let fs = mBy(`d_${p}`);
		let val = get_checked_radios(fs)[0];
		di[p] = isNumber(val) ? Number(val) : val;
	}
	return di;
}
function complexCompare(obj1, obj2) {
	const obj1Keys = Object.keys(obj1);
	const obj2Keys = Object.keys(obj2);
	if (obj1Keys.length !== obj2Keys.length) {
		return false;
	}
	for (let objKey of obj1Keys) {
		if (obj1[objKey] !== obj2[objKey]) {
			if (typeof obj1[objKey] == "object" && typeof obj2[objKey] == "object") {
				if (!isEqual(obj1[objKey], obj2[objKey])) {
					return false;
				}
			}
			else {
				return false;
			}
		}
	}
	return true;
}
function compute_hidden(plname) {
	let [fen, uplayer] = [Z.fen, Z.uplayer];
	let pl = fen.players[plname];
	let hidden;
	if (isdef(fen.winners)) hidden = false;
	else if (Z.role == 'spectator') hidden = plname != uplayer;
	else if (Z.mode == 'hotseat') hidden = (pl.playmode == 'bot' || plname != uplayer);
	else hidden = plname != Z.uname;
	return hidden;
}
function deactivate_ui() { uiActivated = false; DA.ai_is_moving = true; }
function delete_table(friendly) { stopgame(); phpPost({ friendly: friendly }, 'delete_table'); }
function ev_to_gname(ev) { evNoBubble(ev); return evToTargetAttribute(ev, 'gamename'); }
function exchange_by_index(arr1, i1, arr2, i2) {
	let temp = arr1[i1];
	arr1[i1] = arr2[i2];
	arr2[i2] = temp;
}
function find_card(index, ui_item) { return ui_item.items[index]; }
function gamestep() {
	show_admin_ui();
	DA.running = true; clear_screen(); dTable = mBy('dTable'); mClass('dTexture', 'wood');
	if (Z.game == 'aristo') { if (Z.role != Clientdata.role || Z.mode == 'multi' && Z.role != 'active') mFall(dTable); Clientdata.role = Z.role; }
	else mFall(dTable);
	shield_off();
	show_title();
	show_role();
	Z.func.present(dTable);
	if (isdef(Z.scoring.winners)) { show_winners(); animatedTitle('GAMEOVER!'); }
	else if (Z.func.check_gameover(Z)) {
		let winners = show_winners();
		Z.scoring = { winners: winners }
		sendgameover(winners[0], Z.friendly, Z.fen, Z.scoring);
	} else if (is_shield_mode()) {
		staticTitle();
		if (!DA.no_shield == true) { hide('bRestartMove'); shield_on(); }
		autopoll();
	} else {
		Z.A = { level: 0, di: {}, ll: [], items: [], selected: [], tree: null, breadcrumbs: [], sib: [], command: null, autosubmit: Config.autosubmit };
		copyKeys(jsCopy(Z.fen), Z);
		copyKeys(UI, Z);
		activate_ui(Z);
		Z.func.activate_ui();
		if (Z.isWaiting == true || Z.mode != 'multi') staticTitle(); else animatedTitle();
		if (Z.options.zen_mode != 'yes' && Z.mode != 'hotseat' && Z.fen.keeppolling) {
			autopoll();
			console.log('gamestep autopoll');
		}
	}
	if (TESTING == true) landing();
}
function generate_table_name(n) {
	let existing = Serverdata.tables.map(x => x.friendly);
	while (true) {
		let cap = rChoose(Info.capital);
		let parts = cap.split(' ');
		if (parts.length == 2) cap = stringBefore(cap, ' '); else cap = stringBefore(cap, '-');
		cap = cap.trim();
		let s = (n == 2 ? 'duel of ' : rChoose(['battle of ', 'war of '])) + cap;
		if (!existing.includes(s)) return s;
	}
}
function get_admin_player(list) {
	let res = valf(firstCond(list, x => x == 'mimi'), firstCond(list, x => ['felix', 'amanda', 'lauren'].includes(x)));
	return res ?? list[0];
}
function get_checked_radios(rg) {
	let inputs = rg.getElementsByTagName('INPUT');
	let list = [];
	for (const ch of inputs) {
		let checked = ch.getAttribute('checked');
		if (ch.checked) list.push(ch.value);
	}
	return list;
}
function get_default_options(gamename) {
	let options = {};
	for (const k in Config.games[gamename].options) options[k] = arrLast(Config.games[gamename].options[k]);
	return options;
}
function get_game_color(game) { return colorFrom(Config.games[game].color); }
function get_logout_button() {
	let html = `<a id="aLogout" href="javascript:onclick_logout()">logout</a>`;
	return mCreateFrom(html);
}
function get_multi_trigger() { return lookup(Z, ['fen', 'trigger']); }
function get_next_human_player(plname) {
	if (nundef(plname)) return null;
	let [prevturn, mode, turn, uname, plorder, fen, host] = [Z.prev.turn, Z.mode, Z.turn, Z.uname, Z.plorder, Z.fen, Z.host];
	let same = isString(plname) && isList(prevturn) && sameList(prevturn, turn);
	if (!same) return null;
	let plnew = get_next_player(Z, plname);
	while (fen.players[plnew].playmode == 'bot') {
		plnew = get_next_player(Z, plnew);
		if (plnew == plname) break;
	}
	return plnew;
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
function get_playmode(uname) { return Z.fen.players[uname].playmode; }
function get_present_order() {
	let [fen, uplayer, uname] = [Z.fen, Z.uplayer, Z.uname];
	assertion(is_human_player(uplayer) || uname == Z.host, "PRESENT ORDER ME WRONG!!!!!!!!!!!!!")
	let uname_plays = fen.plorder.includes(uname);
	let is_bot = !is_human_player(uplayer);
	let show_first = Z.mode == 'multi' && uname_plays && !is_bot ? Z.uname : uplayer;
	return arrCycle(Z.fen.plorder, Z.fen.plorder.indexOf(show_first));
}
function get_present_order_accuse() {
	let [fen, uplayer] = [Z.fen, Z.uplayer];
	let show_first = uplayer;
	console.log('uplayer', uplayer)
	return arrCycle(Z.fen.plorder, Z.fen.plorder.indexOf(show_first));
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
	newParent.appendChild(child);
	const x1 = child.getBoundingClientRect().left;
	const y1 = child.getBoundingClientRect().top;
	if (sibling) parentOriginal.insertBefore(child, sibling); else parentOriginal.appendChild(child);
	return [x1 - x0, y1 - y0];
}
function get_texture(name) { return `url(../base/assets/images/textures/${name}.png)`; }
function get_user_color(uname) { let u = firstCond(Serverdata.users, x => x.name == uname); return colorFrom(u.color); }
function get_user_pic(uname, sz = 50, border = 'solid medium white') {
	let html = get_user_pic_html(uname, sz, border);
	return mCreateFrom(html);
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
function get_user_pic_html(uname, sz = 50, border = 'solid medium white') {
	return `<img src='../base/assets/images/${uname}.jpg' width='${sz}' height='${sz}' class='img_person' style='margin:0px 4px;border:${border}'>`
}
function get_waiting_html(sz = 30) { return `<img src="../base/assets/images/active_player.gif" height="${sz}" style="margin:0px ${sz / 3}px" />`; }
function hFunc(content, funcname, arg1, arg2, arg3) {
	let html = `<a style='color:blue' href="javascript:${funcname}('${arg1}','${arg2}','${arg3}');">${content}</a>`;
	return html;
}
function hide_buildings() {
	let uplayer = Z.uplayer;
	let buildings = UI.players[uplayer].buildinglist;
	for (const b of buildings) {
		for (let i = 1; i < b.items.length; i++) {
			let card = b.items[i];
			if (b.schweine.includes(card)) continue;
			face_down(b.items[i]);
		}
	}
}
function HPLayout() {
	if (isdef(UI.DRR)) UI.DRR.remove();
	mInsert(UI.dRechts, UI.dHistory);
	Clientdata.historyLayout = 'hp';
}
function HRPLayout() {
	let dr = UI.dRechts;
	dr.remove();
	let drr = UI.DRR = mDiv(dTable);
	mAppend(drr, UI.dHistory);
	mAppend(dTable, dr);
	Clientdata.historyLayout = 'hrp';
}
function i_am_acting_host() { return U.name == Z.fen.acting_host; }
function i_am_host() { return U.name == Z.host; }
function i_am_trigger() { return is_multi_trigger(U.name); }
function if_hotseat_autoswitch(result) {
	if (isdef(result.table) && isdef(Z) && Z.mode == 'hotseat') {
		let turn = lookup(result, ['table', 'fen', 'turn']);
		assertion(isdef(turn), 'turn is NOT defined (_sendSIMSIM) !!!!');
		let uname = turn.length == 1 ? turn[0] : get_next_in_list(U.name, turn);
		if (uname != U.name) switch_uname(uname);
	}
}
function if_plural(n) { return n == 1 ? '' : 's'; }
function if_stringified(obj) { return is_stringified(obj) ? JSON.parse(obj) : obj; }
function intersection(arr1, arr2) {
	let res = [];
	for (const a of arr1) {
		if (arr2.includes(a)) {
			addIf(res, a);
		}
	}
	return res;
}
function is_advanced_user() {
	let advancedUsers = ['mimi', 'felix', 'bob', 'buddy', 'minnow', 'nimble', 'leo'];
	return isdef(U) && ((advancedUsers.includes(DA.secretuser) || advancedUsers.includes(U.name)));
}
function is_ai_player(plname) {
	let [fen, name] = [Z.fen, valf(plname, Z.uplayer)];
	return lookup(fen, ['players', name, 'playmode']) == 'bot';
}
function is_collect_mode() { return Z.turn.length > 1; }
function is_color(s) { return isdef(ColorDi[s.toLowerCase()]); }
function is_current_player_bot() {
	let [fen, uplayer, turn] = [Z.fen, Z.uplayer, Z.turn];
	let curplayer = Z.turn[0];
	if (fen.players[curplayer].playmode == 'bot') return true; else return false;
}
function is_human_player(plname) {
	let [fen, name] = [Z.fen, valf(plname, Z.uplayer)];
	return lookup(fen, ['players', name, 'playmode']) == 'human';
}
function is_just_my_turn() {
	return isEmpty(Z.turn.filter(x => x != Z.uplayer));
}
function is_loggedin(name) { return isdef(U) && U.name == name; }
function is_multi_stage() { return isdef(Z.fen.trigger); }
function is_multi_trigger(plname) { return lookup(Z, ['fen', 'trigger']) == plname; }
function is_player(s) { return isdef(Z.fen.players[s]); }
function is_playerdata_set(plname) {
	return isdef(Z.playerdata) && !isEmpty(Z.playerdata) && !isEmpty(Z.playerdata.find(x => x.name == plname).state);
}
function is_playing(pl, fen) {
	return isList(fen.plorder) && fen.plorder.includes(pl) || isList(fen.roundorder) && fen.roundorder.includes(pl) || Z.game == 'feedback' && isdef(Z.fen.players[pl]);
}
function is_shield_mode() {
	return Z.role == 'spectator'
		|| Z.mode == 'multi' && Z.role == 'inactive' && Z.host != Z.uname
		|| Z.mode == 'multi' && Z.role == 'inactive' && Z.pl.playmode != 'bot'
}
function is_stringified(obj) {
	if (isString(obj)) {
		return '"\'{[('.includes(obj[0]);
	}
	return false;
}
function mFlip(card, ms, callback) {
	let a = mAnimate(iDiv(card), 'transform', [`scale(1,1)`, `scale(0,1)`],
		() => {
			if (card.faceUp) face_down(card); else face_up(card);
			mAnimate(iDiv(card), 'transform', [`scale(0,1)`, `scale(1,1)`], callback, ms / 2, 'ease-in', 0, 'both');
		},
		ms / 2, 'ease-out', 0, 'both');
}
function new_cards_animation(n = 2) {
	let [stage, A, fen, plorder, uplayer, deck] = [Z.stage, Z.A, Z.fen, Z.plorder, Z.uplayer, Z.deck];
	let pl = fen.players[uplayer];
	if (stage == 'card_selection' && !isEmpty(pl.newcards)) {
		let anim_elems = [];
		for (const key of pl.newcards) {
			let ui = lastCond(UI.players[uplayer].hand.items, x => x.key == key);
			if (nundef(ui)) { pl.newcards = []; return; }
			ui = iDiv(ui);
			anim_elems.push(ui);
		}
		delete pl.newcards;
		anim_elems.map(x => mPulse(x, n * 1000));
	}
}
function object2string(o, props = [], except_props = []) {
	let s = '';
	if (nundef(o)) return s;
	if (isString(o)) return o;
	let keys = Object.keys(o).sort();
	for (const k of keys) {
		if (!isEmpty(props) && props.includes(k) || !except_props.includes(k)) {
			let val = isList(o[k]) ? o[k].join(',') : isDict(o[k]) ? object2string(o[k].props, except_props) : o[k];
			let key_part = isEmpty(s) ? '' : `, ${k}:`;
			s += val;
		}
	}
	return s;
}
function path2fen(fen, path) { let o = lookup(fen, path.split('.')); return o; }
function path2UI(path) {
	let res = lookup(UI, path.split('.'));
	return res;
}
function PHLayout() {
	if (isdef(UI.DRR)) UI.DRR.remove();
	mAppend(UI.dRechts, UI.dHistory);
	Clientdata.historyLayout = 'ph';
}
function player_stat_count(key, n, dParent, styles = {}) {
	let sz = valf(styles.sz, 16);
	addKeys({ display: 'flex', margin: 4, dir: 'column', hmax: 2 * sz, 'align-content': 'start', fz: sz, align: 'center' }, styles);
	let d = mDiv(dParent, styles);
	if (isdef(Syms[key])) mSym(key, d, { h: sz, 'line-height': sz, w: '100%' });
	else mText(key, d, { h: sz, fz: sz, w: '100%' });
	d.innerHTML += `<span style="font-weight:bold">${n}</span>`;
	return d;
}
function prep_move() {
	let [fen, uplayer, pl] = [Z.fen, Z.uplayer, Z.pl];
	for (const k of ['round', 'phase', 'stage', 'step', 'turn']) { fen[k] = Z[k]; }
	deactivate_ui();
	clear_timeouts();
}
function PRHLayout() {
	let drr = UI.DRR = mDiv(dTable);
	mAppend(drr, UI.dHistory);
	Clientdata.historyLayout = 'prh';
}
function remove_hourglass(uname) { let d = mBy(`dh_${uname}`); if (isdef(d)) mRemove(d); }
function remove_player(fen, uname) {
	if (nundef(fen.original_players)) fen.original_players = jsCopy(fen.players);
	removeInPlace(fen.plorder, uname);
	delete fen.players[uname];
	return fen.plorder;
}
function round_change_animation(n = 2) {
	let [stage, A, fen, plorder, uplayer, deck] = [Z.stage, Z.A, Z.fen, Z.plorder, Z.uplayer, Z.deck];
	let pl = fen.players[uplayer];
	if (pl.roundchange) {
		let d = mBy('dTitleLeft');
		mStyle(d, { 'transform-origin': '0% 0%' });
		mPulse(d, n * 1000);
		show_special_message(`${fen.round_winner} won round ${Z.round - 1}!!!`)
		delete pl.roundchange;
	}
}
function sendgameover(plname, friendly, fen, scoring) {
	let o = { winners: plname, friendly: friendly, fen: fen, scoring: scoring };
	phpPost(o, 'gameover');
}
function set_player(name, fen) {
	if (isdef(PL) && PL.name != name) { Z.prev.pl = PL; Z.prev.uplayer = PL.name; }
	PL = Z.pl = firstCond(Serverdata.users, x => x.name == name);
	copyKeys(fen.players[name], PL);
	Z.uplayer = name;
}
function set_player_strategy(val) {
	Z.strategy = Clientdata.strategy = Z.pl.strategy = val;
	mRemove('dOptions')
}
function set_user(name) {
	if (isdef(Z) && isdef(U) && U.name != name) {
		Z.prev.u = U;
		Z.prev.uname = U.name;
	}
	U = firstCond(Serverdata.users, x => x.name == name);
	if (isdef(Z)) {
		Z.u = U;
		Z.uname = name;
	}
}
function shield_off() {
	mStyle('dAdmin', { bg: 'white' });
}
function shield_on() {
	mShield(dTable.firstChild.childNodes[1]);
	mStyle('dAdmin', { bg: 'silver' });
}
function show_admin_ui() {
	for (const id of ['bSpotitStart', 'bClearAck', 'bRandomMove', 'bSkipPlayer', 'bRestartMove', 'dTakeover', 'bExperience']) hide(id);
	if (Z.game == 'spotit' && Z.uname == Z.host && Z.stage == 'init') show('bSpotitStart');
	else if (Z.game == 'bluff' && Z.uname == Z.host && Z.stage == 1) show('bClearAck');
	else if (Z.uname == Z.host && Z.stage == 'round_end') show('bClearAck');
	else if (Z.game == 'ferro' && Z.uname == 'mimi' && Z.stage != 'card_selection') show('bClearAck');
	if (Z.game == 'accuse' && lookup(Z, ['fen', 'players', Z.uplayer, 'experience']) > 0) show('bExperience');
	if (['ferro', 'bluff', 'aristo', 'a_game'].includes(Z.game) && (Z.role == 'active' || Z.mode == 'hotseat')) {
		show('bRandomMove');
	}
	if (Z.uname == Z.host || Z.uname == 'mimi' || Z.uname == 'felix') show('dHostButtons'); else hide('dHostButtons');
	if (DA.showTestButtons == true) show('dTestButtons'); else hide('dTestButtons');
}
function show_fleeting_message(s, dParent, styles, id, ms = 2000) {
	let d = mDiv(dParent, styles, id, s);
	mFadeRemove(d, ms);
}
function show_game_menu(gamename) {
	stopgame();
	show('dMenu'); mClear('dMenu');
	let dMenu = mBy('dMenu');
	let dForm = mDiv(dMenu, { align: 'center' }, 'fMenuInput');
	let dInputs = mDiv(dForm, {}, 'dMenuInput');
	let dButtons = mDiv(dForm, {}, 'dMenuButtons');
	let bstart = mButton('start', () => {
		let players = DA.playerlist.map(x => ({ name: x.uname, playmode: x.playmode }));
		let game = gamename;
		let options = collect_game_specific_options(game);
		for (const pl of players) { if (isEmpty(pl.strategy)) pl.strategy = valf(options.strategy, 'random'); }
		startgame(game, players, options); hide('dMenu');
	}, dButtons, {}, ['button', 'enabled']);
	let bcancel = mButton('cancel', () => { hide('dMenu'); }, dButtons, {}, ['button', 'enabled']);
	let bclear = mButton('clear players', clearPlayers, dButtons, {}, ['button', 'enabled']);
	let d = dInputs; mClear(d); mCenterFlex(d);
	let dPlayers = mDiv(d, { gap: 6 });
	mCenterFlex(dPlayers);
	DA.playerlist = [];
	DA.allPlayers = [];
	DA.lastName = null;
	let params = [gamename, DA.playerlist];
	let funcs = [style_not_playing, style_playing_as_human, style_playing_as_bot];
	for (const u of Serverdata.users) {
		let d = get_user_pic_and_name(u.name, dPlayers, 40);
		mStyle(d, { w: 60, cursor: 'pointer' })
		let item = { uname: u.name, div: d, state: 0, strategy: '', isSelected: false };
		DA.allPlayers.push(item);
		if (is_loggedin(u.name)) { toggle_select(item, funcs, gamename, DA.playerlist); DA.lastName = U.name; }
		else d.onclick = ev => {
			if (ev.shiftKey) {
				let list = Serverdata.users;
				if (nundef(DA.lastName)) DA.lastName = list[0].name;
				let x1 = list.find(x => x.name == DA.lastName);
				let i1 = list.indexOf(x1);
				let x2 = list.find(x => x.name == item.uname);
				let i2 = list.indexOf(x2);
				if (i1 == i2) return;
				if (i1 > i2) [i1, i2] = [i2, i1];
				assertion(i1 < i2, "NOT IN CORRECT ORDER!!!!!")
				for (let i = i1; i <= i2; i++) {
					let xitem = DA.allPlayers[i];
					if (xitem.isSelected) continue;
					style_playing_as_human(xitem, gamename, DA.playerlist);
				}
				DA.lastName = item.uname;
			} else {
				toggle_select(item, funcs, gamename, DA.playerlist);
				if (item.isSelected) DA.lastName = item.uname;
			}
		}
	}
	// mDiv(d,{h:40,matop:10,fz:11,fg:'silver',rounding:10,bg:'beige'},null,'use SHIFT to multi-select players'); //'SHIFT<br>multiselect');
	mDiv(d, { w: '100%', fz: 11, fg: '#444' }, null, '(use SHIFT to multi-select players)'); //'SHIFT<br>multiselect');
	mLinebreak(d, 1);
	show_game_options(d, gamename);
	mFall('dMenu');
}
function show_game_options(dParent, game) {
	mRemoveChildrenFromIndex(dParent, 2);
	let poss = Config.games[game].options;
	if (nundef(poss)) return;
	for (const p in poss) {
		let key = p;
		let val = poss[p];
		if (isString(val)) {
			let list = val.split(',');
			if (list.length <= 1) continue;
			let fs = mRadioGroup(dParent, {}, `d_${key}`, key);
			for (const v of list) { mRadio(v, isNumber(v) ? Number(v) : v, key, fs, { cursor: 'pointer' }, null, key, true); }
			measure_fieldset(fs);
		}
	}
}
function show_games(ms = 500) {
	let dParent = mBy('dGames');
	mClear(dParent);
	mText(`<h2>start new game</h2>`, dParent, { maleft: 12 });
	let d = mDiv(dParent, { fg: 'white', animation: 'appear 1s ease both' }, 'game_menu'); mFlexWrap(d);
	let gamelist = 'accuse aristo bluff wise spotit ferro'; if (DA.TEST0) gamelist += ' a_game';
	for (const gname of toWords(gamelist)) {
		let g = Config.games[gname];
		let [sym, bg, color, id] = [Syms[g.logo], g.color, null, getUID()];
		let d1 = mDiv(d, { cursor: 'pointer', rounding: 10, margin: 10, padding: 0, patop: 15, wmin: 140, height: 90, bg: bg, position: 'relative' }, g.id);
		d1.setAttribute('gamename', gname);
		d1.onclick = onclick_game_menu_item;
		mCenterFlex(d1);
		mDiv(d1, { fz: 50, family: sym.family, 'line-height': 55 }, null, sym.text);
		mLinebreak(d1);
		mDiv(d1, { fz: 18, align: 'center' }, null, g.friendly);
	}
}
function show_handsorting_buttons_for(plname, styles = {}) {
	if (Z.role == 'spectator' || isdef(mBy('dHandButtons'))) return;
	let fen = Z.fen;
	let pl = fen.players[plname];
	if (pl.hand.length <= 1) return;
	let d = UI.players[plname].hand.container; mStyle(d, { position: 'relative', wmin: 155 });
	addKeys({ position: 'absolute', left: 58, bottom: -8, height: 25 }, styles);
	let dHandButtons = mDiv(d, styles, 'dHandButtons');
	show_player_button('rank', dHandButtons, onclick_by_rank);
	show_player_button('suit', dHandButtons, onclick_by_suit);
}
function show_history(fen, dParent) {
	if (!isEmpty(fen.history)) {
		let html = '';
		for (const o of jsCopy(fen.history).reverse()) {
			html += beautify_history(o.lines, o.title, fen);
		}
		let dHistory = mDiv(dParent, { maright: 10, hpadding: 12, bg: colorLight('#EDC690', 50), box: true, matop: 4, rounding: 10, patop: 10, pabottom: 10, hmax: `calc( 100vh - 250px )`, 'overflow-y': 'auto', w: 260 }, null, html);
		UI.dHistoryParent = dParent;
		UI.dHistory = dHistory;
		if (isdef(Clientdata.historyLayout)) { show_history_layout(Clientdata.historyLayout); }
	}
}
function show_history_layout(layout) {
	assertion(isdef(UI.dHistoryParent) && isdef(UI.dHistory), 'UI.dHistoryParent && UI.dHistory do NOT exist!!!');
	if (layout == 'ph') PHLayout();
	else if (layout == 'hp') HPLayout();
	else if (layout == 'prh') PRHLayout();
	else if (layout == 'hrp') HRPLayout();
	else PHLayout();
}
function show_history_popup() {
	if (isEmpty(Z.fen.history)) return;
	assertion(isdef(UI.dHistoryParent) && isdef(UI.dHistory), 'UI.dHistoryParent && UI.dHistory do NOT exist!!!');
	let l = valf(Clientdata.historyLayout, 'ph');
	let cycle = ['ph', 'hp', 'prh', 'hrp'];
	let i = (cycle.indexOf(l) + 1) % cycle.length;
	show_history_layout(cycle[i]);
}
function show_home_logo() {
	let bg = colorLight();
	let dParent = mBy('dAdminLeft');
	clearElement(dParent);
	let d = miPic('castle', dParent, { cursor: 'pointer', fz: 24, padding: 6, h: 36, box: true, margin: 2 });
	d.onclick = onclick_home;
	let version = 'v0.0.1';
	let html = `version ${version}`
	mText(html, dParent, { fz: 12 });
}
function show_hourglass(uname, d, sz, stylesPos = {}) {
	let html = get_waiting_html(sz);
	mStyle(d, { position: 'relative' });
	addKeys({ position: 'absolute' }, stylesPos);
	let dw = mDiv(d, stylesPos, `dh_${uname}`, html);
}
function show_instruction(msg) { mBy('dSelections0').innerHTML = msg; }
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
function show_MMM(msg) { show_fleeting_message(msg, mBy('dMMM')); }
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
	let x = mYaml(mCreate('div'), opresent);
	let dpop = mPopup(x.innerHTML, dTable, { fz: 16, fg: 'white', top: 0, right: 0, border: 'white', padding: 10, bg: 'dimgray' }, 'dOptions');
	mInsert(dpop, mCreateFrom(`<div style="text-align:center;width:100%;font-family:Algerian;font-size:22px;">${Z.game}</div>`));
}
function show_player_button(caption, ui_item, handler) {
	let d = ui_item.container ?? iDiv(ui_item);
	let styles = { rounding: 6, bg: 'silver', fg: 'black', border: 0, maleft: 10 };
	let b = mButton(caption, handler, d, styles, 'enabled');
	return b;
}
function show_playerdatastate() {
	for (const pldata of Z.playerdata) {
		console.log('player', pldata.name, `status=${isEmpty(pldata.player_status) ? 'none' : pldata.player_status}`, pldata.state);
	}
}
function show_polling_signal() {
	if (DA.TEST0 != true) return;
	let d1 = mDiv(mBy('dAdmin'), { position: 'fixed', top: 10, left: 73 });
	let bg = Z.skip_presentation == true ? 'grey' : 'green';
	let d2 = mDiv(d1, { width: 20, height: 20, bg: bg, rounding: 10, display: 'inline-block' });
	mFadeRemove(d1, 1000);
}
function show_progress() {
	if (isdef(Z.fen.progress)) {
		let d = mBy('dTitleLeft');
		let former = mBy('dProgress');
		if (isdef(former)) former.remove();
		let dprogress = mDiv(d, {}, 'dProgress', `<div>${Z.fen.progress}</div>`);
	}
}
function show_role() {
	if (Z.game == 'accuse') { show_role_accuse(); return; }
	let d = mBy('dAdminMiddle');
	clearElement(d);
	let hotseatplayer = Z.uname != Z.uplayer && Z.mode == 'hotseat' && Z.host == Z.uname;
	let styles, text;
	let boldstyle = { fg: 'red', weight: 'bold', fz: 20 };
	let normalstyle = { fg: 'black', weight: null, fz: null };
	let location = '';
	if (hotseatplayer) {
		styles = boldstyle;
		text = `your turn for ${Z.uplayer}`;
	} else if (Z.role == 'spectator') {
		styles = normalstyle;
		text = `(spectating)`;
	} else if (Z.role == 'active') {
		styles = boldstyle;
		text = `It's your turn!!!`;
	} else if (Z.role == 'waiting') {
		text = `waiting for players to complete their moves...`;
	} else {
		assertion(Z.role == 'inactive', 'role is not active or inactive or spectating ' + Z.role);
		styles = normalstyle;
		text = `(${Z.turn[0]}'s turn)`;
	}
	d.innerHTML = location + text;
	mStyle(d, styles);
}
function show_settings(dParent) {
	let [options, fen, uplayer] = [Z.options, Z.fen, Z.uplayer];
	clearElement(dParent);
	mFlex(dParent);
	mStyle(dParent, { 'justify-content': 'end', gap: 12, paright: 10 })
	let playmode = get_playmode(uplayer);
	let game_mode = Z.mode;
	let st = { fz: 20, padding: 0, h: 40, box: true, matop: 2, rounding: '50%', cursor: 'pointer' };
	let dHistoryButton = miPic('scroll', dParent, st);
	dHistoryButton.onclick = show_history_popup;
	if (isdef(Config.games[Z.game].options.strategy)) {
		let dStrategy = miPic('chess pawn', dParent, st);
		dStrategy.onclick = show_strategy_popup;
	}
	let d = miPic('gear', dParent, st);
	options.playmode = playmode;
	d.onmouseenter = () => show_options_popup(options);
	d.onmouseleave = hide_options_popup;
}
function show_status(s) {
	if (is_advanced_user()) {
		clear_status();
		if (!TESTING && !s.includes('reload')) show_fleeting_message(s, 'dTest', { fz: 14, position: 'absolute', top: 5, right: 10 }, 'dStatus');
	}
}
function show_strategy_popup() {
	let dpop = mPopup('', dTable, { fz: 16, fg: 'white', top: 0, right: 0, border: 'white', padding: 10, bg: 'dimgray' }, 'dOptions');
	mAppend(dpop, mCreateFrom(`<div style="text-align:center;width:100%;font-family:Algerian;font-size:22px;">${Z.game}</div>`));
	mDiv(dpop, { matop: 5, maleft: 10 }, null, `choose strategy:`);
	let vals = Config.games[Z.game].options.strategy.split(',');
	let key = 'strategy';
	let fs = mRadioGroup(dpop, { fg: 'white' }, `d_${key}`);
	for (const v of vals) { mRadio(v, isNumber(v) ? Number(v) : v, key, fs, { cursor: 'pointer' }, set_player_strategy, key, v == Z.strategy); }
	measure_fieldset(fs);
}
function show_tables(ms = 500) {
	clear_screen();
	let dParent = mBy('dTables');
	mClear(dParent);
	show_games();
	let tables = Serverdata.tables;
	if (isEmpty(tables)) { mText('no active game tables', dParent); return []; }
	tables.map(x => x.game_friendly = Config.games[x.game].friendly);
	mText(`<h2>game tables</h2>`, dParent, { maleft: 12 })
	let t = mDataTable(tables, dParent, null, ['friendly', 'game_friendly', 'players'], 'tables', false);
	mTableCommandify(t.rowitems, {
		0: (item, val) => hFunc(val, 'onclick_table', val, item.id),
	});
	let d = iDiv(t);
	for (const ri of t.rowitems) {
		let r = iDiv(ri);
		let h = hFunc('delete', 'delete_table', ri.o.friendly);
		c = mAppend(r, mCreate('td'));
		c.innerHTML = h;
	}
}
function show_title() {
	settingsOn = Z.func.state_info(mBy('dTitleLeft'));
	if (nundef(settingsOn) || settingsOn) show_settings(mBy('dTitleRight'));
	mBy('dTablename').innerHTML = Z.friendly;
}
function show_username(loadTable = false) {
	let uname = U.name;
	let dpic = get_user_pic(uname, 30);
	let d = mBy('dAdminRight');
	mClear(d);
	if (['felix', 'mimi', 'lauren', 'amanda'].includes(uname)) add_advanced_ui(d);
	mAppend(d, get_logout_button());
	mAppend(d, dpic);
	if (is_advanced_user()) { show('dAdvanced1'); } else { hide('dAdvanced'); hide('dAdvanced1'); }
	if (!TESTING && !DA.running) {
		if (!loadTable) phpPost({ app: 'easy' }, 'tables');
		else if (!isEmpty(Serverdata.tables)) {
			onclick_table(Serverdata.tables[0].friendly);
		}
	}
}
function show_users(ms = 300) {
	let dParent = mBy('dUsers');
	mClear(dParent);
	for (const u of Serverdata.users) {
		if (['ally', 'bob', 'leo'].includes(u.name)) continue;
		let d = get_user_pic_and_name(u.name, dParent);
		d.onclick = () => onclick_user(u.name);
		mStyle(d, { cursor: 'pointer' });
	}
	mFall(dParent, ms);
}
function show_view_buildings_button(plname) {
	if (Z.role == 'spectator' || isdef(mBy('dPlayerButtons'))) return;
	if (isEmpty(UI.players[plname].buildinglist)) return;
	let d1 = iDiv(UI.players[plname]); mStyle(d1, { position: 'relative' });
	let d2 = mDiv(d1, { position: 'absolute', top: 8, left: 50, height: 25 }, 'dPlayerButtons');
	show_player_button('view buildings', d2, onclick_view_buildings);
}
function show_waiting_for_ack_message() {
	let dInstruction = mBy('dSelections0');
	mClass(dInstruction, 'instruction');
	mCenterCenterFlex(dInstruction);
	mBy('dSelections0').innerHTML = 'waiting for next round to start...';
}
function show_waiting_message(msg) {
	let dInstruction = mBy('dSelections0');
	mClass(dInstruction, 'instruction');
	mCenterCenterFlex(dInstruction);
	mBy('dSelections0').innerHTML = msg;
}
function show_winners() {
	let winners = Z.fen.winners;
	let multiple_winners = winners.length > 1;
	let winners_html = winners.map(x => get_user_pic_html(x, 35)).join(' ');
	let msg = `
    <div style="display:flex;gap:10px;align-items:center">
      <div style="color:red;font-size:22px;font-weight:bold;">GAME OVER! the winner${multiple_winners ? 's are: ' : ' is '}</div>
      <div style="padding-top:5px;">${winners_html}</div>
    </div>
  `;
	show_message(msg, true);
	mShield(dTable);
	hide('bRestartMove');
	return Z.fen.winners;
}
function shuffletest(list) {
	for (let i = 0; i < 100; i++) {
		shuffle(list);
		console.log('shuffle: ' + jsCopy(list));
	}
}
function simpleCompare(o1, o2) {
	let s1 = object2string(o1);
	let s2 = object2string(o2);
	return s1 == s2;
}
function sss() { show_playerdatastate(); }
function sss1() {
	let [fen, A, uplayer, plorder, data] = [Z.fen, Z.A, Z.uplayer, Z.plorder, Z.uplayer_data];
	let s = 'no data.state for player ' + uplayer;
	if (isDict(data.state)) {
		s = `${uplayer} passes `;
		for (const k in data.state.di) {
			s += `${k} ${data.state.di[k]}, `;
		}
	}
	console.log(s);
}
function start() {
	let uname = DA.secretuser = localStorage.getItem('uname');
	if (isdef(uname)) U = { name: uname };
	phpPost({ app: 'simple' }, 'assets');
}
function start_game_with_players(n, game = 'accuse', opts = {}) {
	let numplayers = n;
	let list = jsCopy(Serverdata.users).map(x => x.name);
	removeInPlace(list, 'mimi');
	removeInPlace(list, 'felix');
	let playernames = rChoose(list, numplayers - 2);
	playernames = ['mimi', 'felix'].concat(playernames);
	let uname = U.name;
	removeInPlace(playernames, uname);
	playernames.unshift(uname);
	let playmodes = playernames.map(x => 'human');
	let players = [];
	for (let i = 0; i < n; i++) players.push({ name: playernames[i], playmode: playmodes[i] });
	addKeys({ mode: 'multi' }, opts);
	startgame(game, players, opts);
}
function start_with_assets(reload = false) {
	DA.isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1; if (DA.isFirefox) console.log('using Firefox!')
	show_home_logo();
	if (nundef(U)) { show_users(); return; }
	show_username(reload);
	if (DA.TEST0 || DA.showTestButtons) show('dTestButtons');
	//#region TESTING
	//#endregion
}
function startgame(game, players, options = {}) {
	if (nundef(game)) game = 'a_game';
	let default_options = {}; for (const k in Config.games[game].options) default_options[k] = arrLast(Config.games[game].options[k].split(','));
	addKeys(default_options, options);
	if (nundef(players)) players = rChoose(Serverdata.users, 2).map(x => ({ name: x.name }));
	let playernames = players.map(x => x.name);
	let fen = window[game]().setup(playernames, options);
	if (nundef(fen.round)) fen.round = 1;
	if (nundef(fen.phase)) fen.phase = '';
	if (nundef(fen.stage)) fen.stage = 0;
	if (nundef(fen.step)) fen.step = 0;
	if (nundef(fen.turn)) fen.turn = [fen.plorder[0]]; else if (DA.TESTSTART1 && fen.turn.length == 1) fen.turn = [playernames[0]];
	players.map(x => { let pl = fen.players[x.name]; pl.playmode = valf(x.playmode, 'human'); pl.strategy = valf(x.strategy, valf(options.strategy, 'random')); });
	if (options.mode == 'solo') {
		let me = isdef(U) && isdef(fen.players[U.name]) ? U.name : rChoose(playernames);
		for (const plname of playernames) {
			if (plname == me) continue;
			fen.players[plname].playmode = 'bot';
		}
		options.mode = 'hotseat';
	}
	for (const k in options) { if (isNumber(options[k])) options[k] = parseInt(options[k]); }
	let o = {
		friendly: generate_table_name(players.length), game: game, host: playernames[0], players: playernames,
		fen: fen, options: options
	};
	ensure_polling();
	phpPost(o, 'startgame');
}
function staticTitle() {
	clearInterval(TO.titleInterval);
	let url = window.location.href;
	let loc = url.includes('telecave') ? 'telecave' : 'local';
	let game = isdef(Z) ? stringAfter(Z.friendly, 'of ') : '♠ GAMES ♠';
	document.title = `(${loc}) ${game}`;
}
function status_message_new(msg, dParent, styles = {}) {
}
function stopgame() {
	if (!DA.running) return;
	DA.running = false;
	DA.noshow = 0;
	clear_timeouts();
	hide('bRestartMove');
	hide('dHostButtons');
	mStyle('dAdmin', { bg: 'white' });
	mClear('dAdminMiddle')
	for (const id of ['bSpotitStart', 'bClearAck', 'bRandomMove', 'bSkipPlayer']) hide(id);
	pollStop();
	Z = null; delete Serverdata.table; delete Serverdata.playerdata; Clientdata = {};
	staticTitle();
}
function switch_uname(plname) {
	set_user(plname);
	show_username();
}
function tableLayoutMR(dParent, m = 7, r = 1) {
	let ui = UI; ui.players = {};
	clearElement(dParent);
	let bg = 'transparent';
	let [dMiddle, dRechts] = [ui.dMiddle, ui.dRechts] = mColFlex(dParent, [m, r], [bg, bg]);
	mCenterFlex(dMiddle, false);
	let dOben = ui.dOben = mDiv(dMiddle, { w: '100%', display: 'block' }, 'dOben');
	let dSelections = ui.dSelections = mDiv(dOben, {}, 'dSelections');
	for (let i = 0; i <= 5; i++) { ui[`dSelections${i}`] = mDiv(dSelections, {}, `dSelections${i}`); }
	let dActions = ui.dActions = mDiv(dOben, { w: '100%' });
	for (let i = 0; i <= 5; i++) { ui[`dActions${i}`] = mDiv(dActions, { w: '100%' }, `dActions${i}`); }
	ui.dError = mDiv(dOben, { w: '100%', bg: 'red', fg: 'yellow', hpadding: 12, box: true }, 'dError');
	let dSubmitOrRestart = ui.dSubmitOrRestart = mDiv(dOben, { w: '100%' });
	let dOpenTable = ui.dOpenTable = mDiv(dMiddle, { w: '100%', padding: 10 }); mFlexWrap(dOpenTable);
	return [dOben, dOpenTable, dMiddle, dRechts];
}
function take_feedback_host(write_fen = true, write_player = false, clear_players = false, player_status = null) {
	prep_move();
	let o = { uname: Z.uplayer, friendly: Z.friendly };
	if (isdef(Z.fen)) o.fen = Z.fen;
	if (write_fen) { assertion(isdef(Z.fen) && isdef(Z.fen.turn), 'write_fen without fen!!!!'); o.write_fen = true; }
	if (write_player) { o.write_player = true; o.state = Z.state; }
	if (clear_players) o.clear_players = true;
	o.player_status = player_status;
	o.auto = true;
	let cmd = 'table';
	send_or_sim(o, cmd);
}
function take_turn(write_fen = true, write_player = false, clear_players = false, player_status = null) {
	prep_move();
	let o = { uname: Z.uplayer, friendly: Z.friendly };
	if (isdef(Z.fen)) o.fen = Z.fen;
	if (write_fen) { assertion(isdef(Z.fen) && isdef(Z.fen.turn), 'write_fen without fen!!!!'); o.write_fen = true; }
	if (write_player) {
		o.write_player = true;
		if (isdef(Z.state)) o.state = Z.state;
		if (isdef(Z.state1)) o.state1 = Z.state1;
		if (isdef(Z.state2)) o.state2 = Z.state2;
	}
	if (clear_players) {
		o.clear_players = true; delete Z.playerdata; delete o.fen.pldata;
	}
	o.player_status = player_status;
	let cmd = 'table';
	send_or_sim(o, cmd);
}
function take_turn_fen() { take_turn(); }
function take_turn_fen_clear() { take_turn(true, false, true); }
function take_turn_fen_write() { take_turn(true, true); }
function take_turn_multi() { if (isdef(Z.state)) take_turn(false, true); else take_turn(false, false); }
function take_turn_spotit() { take_turn(true, true); }
function take_turn_state1() { if (isdef(Z.state1)) take_turn(false, true); else take_turn(false, false); }
function take_turn_state2() { if (isdef(Z.state2)) take_turn(false, true); else take_turn(false, false); }
function take_turn_waiting() { take_turn(true, false, false, null); }
function take_turn_write() { take_turn_multi(); }
function ui_player_info(dParent, outerStyles = { dir: 'column' }, innerStyles = {}) {
	let fen = Z.fen;
	if (nundef(outerStyles.display)) outerStyles.display = 'flex';
	mStyle(dParent, outerStyles);
	let items = {};
	let styles = jsCopy(innerStyles); addKeys({ rounding: 10, bg: '#00000050', margin: 4, padding: 4, patop: 12, box: true, 'border-style': 'solid', 'border-width': 6 }, styles);
	let order = get_present_order();
	for (const plname of order) {
		let pl = fen.players[plname];
		let uname = pl.name;
		let imgPath = `../base/assets/images/${uname}.jpg`;
		styles['border-color'] = get_user_color(uname);
		let item = mDivItem(dParent, styles, name2id(uname));
		let d = iDiv(item);
		let picstyle = { w: 50, h: 50, box: true };
		let ucolor = get_user_color(uname);
		if (pl.playmode == 'bot') {
			copyKeys({ rounding: 0, border: `double 6px ${ucolor}` }, picstyle);
		} else {
			copyKeys({ rounding: '50%', border: `solid 2px white` }, picstyle);
		}
		let img = mImage(imgPath, d, picstyle, 'img_person');
		items[uname] = item;
	}
	if (DA.SIMSIM || is_advanced_user()) activate_playerstats(items)
	return items;
}
//#endregion gamehelpers

//#region legacy
function _calc_hex_col_array(rows, cols) {
	let colarr = [];
	let even = rows % 2 == 0;
	for (let i = 0; i < rows; i++) {
		colarr[i] = cols;
		if (even && i < (rows / 2) - 1) cols += 1;
		else if (even && i > rows / 2) cols -= 1;
		else if (!even && i < (rows - 1) / 2) cols += 1;
		else if (!even || i >= (rows - 1) / 2) cols -= 1;
	}
	return colarr;
}
function _calc_hex_col_array_old(rows, cols) {
	let colarr = [];
	for (let i = 0; i < rows; i++) {
		colarr[i] = cols;
		if (i < (rows - 1) / 2) cols += 1;
		else cols -= 1;
	}
	return colarr;
}
function addRowsCols(items) {
	let byrc = {};
	let byx = sortBy(items, 'x');
	let c = 0, x = byx[0].x;
	for (let i = 0; i < byx.length; i++) {
		let item = byx[i];
		if (!isCloseTo(item.x, x, 2)) { c += 1; x = item.x; }
		item.col = c;
	}
	let byy = sortBy(items, 'y');
	let r = 0, y = byy[0].y;
	for (let i = 0; i < byy.length; i++) {
		let item = byy[i];
		if (!isCloseTo(item.y, y, 2)) { r += 1; y = item.y; }
		item.row = r;
		lookupSet(byrc, [item.row, item.col], item);
	}
	return byrc;
}
function anim1(elem, prop, from, to, ms) {
	if (prop == 'left') elem.style.position = 'absolute';
	if (isNumber(from)) from = '' + from + 'px';
	if (isNumber(to)) to = '' + to + 'px';
}
function applyStyles(g, id, styles) { g.mStyle(id, styles, isdef(g.getNode(id)) ? 'node' : 'edge'); }
function ari_deck_add_safe(otree, n, arr) {
	ari_ensure_deck(otree, n);
	deck_add(otree.deck, n, arr);
}
function aristoUi(dParent, g) {
	clearTable();
	let d1 = mDiv(dParent, { w: '100%' }); mFlex(d1, 'v');
	let dWorld = mDiv(d1, { bg: 'random', hmin: 170, flex: 1 });
	mFlex(dWorld);
	iAdd(g.me, { div: cardZone(d1, g.me, 2) });
	let others = g.others;
	for (let i = 0; i < others.length; i++) {
		let pl = others[i];
		iAdd(pl, { div: cardZone(d1, pl) });
	}
	for (const o of [g.draw_pile, g.market, g.buy_cards, g.discard_pile]) { iAdd(o, { div: cardZone(dWorld, o) }); }
	for (const name of ['draw_pile', 'market', 'buy_cards', 'discard_pile']) { g[name + 'Items'] = showCards(g[name]); }
	for (const pl of g.allPlayers) {
		pl.handItems = showCards({ div: iDiv(pl), type: pl == g.me ? 'hand' : 'handHidden', cards: pl.hand });
		if (isdef(pl.stall)) pl.stallItems = showCards({ div: iDiv(pl), type: g.stallsHidden ? 'cardsHidden' : 'cards', cards: pl.stall });
		if (isdef(pl.buildings)) {
			for (const building of pl.buildings) {
				let bItem = showCards({ div: iDiv(pl), type: 'hand', cards: building });
				lookupAddToList(pl, ['buildingItems'], bItem);
			}
		}
	}
}
function arrToMatrix(arr, rows, cols) {
	let i = 0, res = [];
	for (let r = 0; r < rows; r++) {
		let rarr = [];
		for (let c = 0; c < cols; c++) {
			let a = arr[i]; i++;
			rarr.push(a);
		}
		res.push(rarr);
	}
	return res;
}
function bCapturedPieces(plSym, arr, idx, rows, cols, includeDiagonals = true) {
	let res = [];
	let nei = bNei(arr, idx, rows, cols, includeDiagonals);
	for (let dir = 0; dir < 8; dir++) {
		let i = nei[dir];
		if (nundef(i)) continue;
		let el = arr[i];
		if (EmptyFunc(el) || el == plSym) continue;
		let inew = [];
		let MAX = 100, cmax = 0;
		while (isOppPiece(el, plSym)) {
			if (cmax > MAX) break; cmax += 1;
			inew.push(i);
			i = bNeiDir(arr, i, dir, rows, cols);
			if (nundef(i)) break;
			el = arr[i];
		}
		if (el == plSym) {
			res = res.concat(inew);
		}
	}
	return res;
}
function bCheck(r, c, rows, cols) { return r >= 0 && r < rows && c >= 0 && c < cols ? r * cols + c : null; }
function bCreateEmpty(rows, cols) { return new Array(rows * cols).fill(null); }
function bFreeRayDir(arr, idx, dir, rows, cols) {
	let indices = [];
	let i = idx;
	while (i < arr.length) {
		i = bNeiDir(arr, i, dir, rows, cols);
		if (!i || !EmptyFunc(arr[i])) break; else indices.push(i);
	}
	return indices;
}
function bFreeRayDir1(arr, idx, dir, rows, cols) {
	let indices = [];
	let i = idx;
	while (i < arr.length) {
		i = bNeiDir(arr, i, dir, rows, cols);
		if (!i) break;
		else indices.push(i);
		if (!EmptyFunc(arr[i])) break;
	}
	return indices;
}
function bFullCol(arr, icol, rows, cols) {
	let iStart = icol;
	let x = arr[iStart]; if (EmptyFunc(x)) return null;
	for (let i = iStart + cols; i < iStart + (cols * rows); i += cols) if (arr[i] != x) return null;
	return x;
}
function bFullDiag(arr, rows, cols) {
	let iStart = 0;
	let x = arr[iStart]; if (EmptyFunc(x)) return null;
	for (let i = iStart + cols + 1; i < arr.length; i += cols + 1) { if (arr[i] != x) return null; }
	return x;
}
function bFullDiag2(arr, rows, cols) {
	let iStart = cols - 1;
	let x = arr[iStart]; if (EmptyFunc(x)) return null;
	for (let i = iStart + cols - 1; i < arr.length - 1; i += cols - 1) { if (arr[i] != x) return null; }
	return x;
}
function bFullRow(arr, irow, rows, cols) {
	let iStart = irow * cols;
	let x = arr[iStart]; if (EmptyFunc(x)) return null;
	for (let i = iStart + 1; i < iStart + cols; i++) if (arr[i] != x) return null;
	return x;
}
function bGetChunks(arr2d, rowsEach, colsEach) {
	let res = [];
	let [rTotal, cTotal] = [arr2d.length, arr2d[0].length];
	for (let r = 0; r < rTotal; r += rowsEach) {
		let m1 = [];
		for (let c = 0; c < cTotal; c += colsEach) {
			m1 = bGetSubMatrix(arr2d, r, rowsEach, c, colsEach);
			res.push(arrFlatten(m1));
		}
	}
	return res;
}
function bGetChunksWithIndices(arr2d, rowsEach, colsEach) {
	let res = [];
	let [rTotal, cTotal] = [arr2d.length, arr2d[0].length];
	for (let r = 0; r < rTotal; r += rowsEach) {
		let m1 = [];
		for (let c = 0; c < cTotal; c += colsEach) {
			m1 = bGetSubMatrixWithIndices(arr2d, r, rowsEach, c, colsEach);
			res.push(arrFlatten(m1));
		}
	}
	return res;
}
function bGetCol(arr, icol, rows, cols) {
	let iStart = icol;
	let res = [];
	for (let i = iStart; i < iStart + (cols * rows); i += cols) res.push(arr[i]);
	return res;
}
function bGetCols(arr2d) {
	let rows = arr2d.length;
	let cols = arr2d[0].length;
	let res = [];
	for (let c = 0; c < cols; c++) { res.push([]); }
	for (let r = 0; r < rows; r++) {
		for (let c = 0; c < cols; c++) {
			res[c].push(arr2d[r][c]);
		}
	}
	return res;
}
function bGetRow(arr, irow, rows, cols) {
	let iStart = irow * cols;
	let arrNew = arr.slice(iStart, iStart + cols);
	let res = [];
	for (let i = iStart; i < iStart + cols; i++) res.push(arr[i]);
	console.assert(sameList(arrNew, res), 'NOOOOOO');
	return res;
}
function bGetRows(arr2d) {
	return arr2d;
}
function bGetSubMatrix(arr2d, rFrom, rows, cFrom, cols) {
	let res = []; for (let i = 0; i < rows; i++) res.push([]);
	let [rTotal, cTotal] = [arr2d.length, arr2d[0].length];
	let rIndex = 0;
	for (let r = rFrom; r < rFrom + rows; r++) {
		for (let c = cFrom; c < cFrom + cols; c++) {
			res[rIndex].push(arr2d[r][c]);
		}
		rIndex += 1;
	}
	return res;
}
function bGetSubMatrixWithIndices(arr2d, rFrom, rows, cFrom, cols) {
	let res = []; for (let i = 0; i < rows; i++) res.push([]);
	let [rTotal, cTotal] = [arr2d.length, arr2d[0].length];
	let rIndex = 0;
	for (let r = rFrom; r < rFrom + rows; r++) {
		for (let c = cFrom; c < cFrom + cols; c++) {
			res[rIndex].push({ row: r, col: c, val: arr2d[r][c] });
		}
		rIndex += 1;
	}
	return res;
}
function bNei(arr, idx, rows, cols, includeDiagonals = true) {
	let nei = [];
	let [r, c] = iToRowCol(idx, rows, cols);
	if (r > 0) nei.push(idx - cols); else nei.push(null);
	if (r > 0 && c < cols - 1 && includeDiagonals) nei.push(idx - cols + 1); else nei.push(null);
	if (c < cols - 1) nei.push(idx + 1); else nei.push(null);
	if (r < rows - 1 && c < cols - 1 && includeDiagonals) nei.push(idx + cols + 1); else nei.push(null);
	if (r < rows - 1) nei.push(idx + cols); else nei.push(null);
	if (r < rows - 1 && c > 0 && includeDiagonals) nei.push(idx + cols - 1); else nei.push(null);
	if (c > 0) nei.push(idx - 1); else nei.push(null);
	if (r > 0 && c > 0 && includeDiagonals) nei.push(idx - cols - 1); else nei.push(null);
	return nei;
}
function bNeiDir(arr, idx, dir, rows, cols, includeDiagonals = true) {
	let [r, c] = iToRowCol(idx, rows, cols);
	switch (dir) {
		case 0: if (r > 0) return (idx - cols); else return (null);
		case 1: if (r > 0 && c < cols - 1 && includeDiagonals) return (idx - cols + 1); else return (null);
		case 2: if (c < cols - 1) return (idx + 1); else return (null);
		case 3: if (r < rows - 1 && c < cols - 1 && includeDiagonals) return (idx + cols + 1); else return (null);
		case 4: if (r < rows - 1) return (idx + cols); else return (null);
		case 5: if (r < rows - 1 && c > 0 && includeDiagonals) return (idx + cols - 1); else return (null);
		case 6: if (c > 0) return (idx - 1); else return (null);
		case 7: if (r > 0 && c > 0 && includeDiagonals) return (idx - cols - 1); else return (null);
	}
	return null;
}
function boardArrOmitFirstRowCol(boardArr, rows, cols) {
	let res = [];
	for (let r = 1; r < rows; r++) {
		for (let c = 1; c < cols; c++) {
			let i = iFromRowCol(r, c, rows, cols);
			res.push(boardArr[i]);
		}
	}
	return res;
}
function boardToNode(state) {
	let res = new Array();
	for (let i = 0; i < state.length; i++) {
		if (state[i] == null) res[i] = ' ';
		else res[i] = state[i];
	}
	return res;
}
function bPartialCol(arr, icol, rows, cols) {
	let iStart = icol;
	let x = null;
	for (let i = iStart; i < iStart + (cols * rows); i += cols) { if (EmptyFunc(arr[i])) continue; else if (EmptyFunc(x)) x = arr[i]; else if (arr[i] != x) return null; }
	return x;
}
function bPartialDiag(arr, rows, cols) {
	let iStart = 0;
	let x = null;
	for (let i = iStart; i < arr.length; i += cols + 1) { if (EmptyFunc(arr[i])) continue; else if (EmptyFunc(x)) x = arr[i]; else if (arr[i] != x) return null; }
	return x;
}
function bPartialDiag2(arr, rows, cols) {
	let iStart = cols - 1;
	let x = null;
	for (let i = iStart; i < arr.length - 1; i += cols - 1) {
		if (EmptyFunc(arr[i])) continue; else if (EmptyFunc(x)) x = arr[i]; else if (arr[i] != x) return null;
	}
	return x;
}
function bPartialRow(arr, irow, rows, cols) {
	let iStart = irow * cols;
	let x = null;
	for (let i = iStart; i < iStart + cols; i++) {
		if (EmptyFunc(arr[i])) continue;
		else if (EmptyFunc(x)) x = arr[i];
		else if (arr[i] != x) return null;
	}
	return x;
}
function bRayDir(arr, idx, dir, rows, cols) {
	let indices = [];
	let i = idx;
	while (i < arr.length) {
		let i = bNeiDir(arr, i, dir, rows, cols);
		if (!i) break; else indices.push(i);
	}
	return indices;
}
function bStrideCol(arr, icol, rows, cols, stride) {
	for (let i = 0; i <= rows - stride; i++) {
		let ch = bStrideColFrom(arr, i, icol, rows, cols, stride);
		if (ch) return ch;
	}
	return null;
}
function bStrideColFrom(arr, irow, icol, rows, cols, stride) {
	if (rows - irow < stride) return null;
	let iStart = irow * cols + icol;
	let x = arr[iStart];
	if (EmptyFunc(x)) return null;
	for (let i = iStart + cols; i < iStart + cols * stride; i += cols) if (arr[i] != x) return null;
	return x;
}
function bStrideDiag2From(arr, irow, icol, rows, cols, stride) {
	if (rows - irow < stride || icol - stride + 1 < 0) return null;
	let iStart = irow * cols + icol;
	let x = arr[iStart];
	if (EmptyFunc(x)) return null;
	for (let i = iStart + cols - 1; i < iStart + (cols - 1) * stride; i += cols - 1) if (arr[i] != x) return null;
	return x;
}
function bStrideDiagFrom(arr, irow, icol, rows, cols, stride) {
	if (rows - irow < stride || cols - icol < stride) return null;
	let iStart = irow * cols + icol;
	let x = arr[iStart];
	if (EmptyFunc(x)) return null;
	for (let i = iStart + cols + 1; i < iStart + (cols + 1) * stride; i += cols + 1) if (arr[i] != x) return null;
	return x;
}
function bStrideRow(arr, irow, rows, cols, stride) {
	for (let i = 0; i <= cols - stride; i++) {
		let ch = bStrideRowFrom(arr, irow, i, rows, cols, stride);
		if (ch) return ch;
	}
	return null;
}
function bStrideRowFrom(arr, irow, icol, rows, cols, stride) {
	if (cols - icol < stride) return null;
	let iStart = irow * cols + icol;
	let x = arr[iStart];
	if (EmptyFunc(x)) return null;
	for (let i = iStart + 1; i < iStart + stride; i++) if (arr[i] != x) return null;
	return x;
}
function cardInno1(key, wCard = 420) {
	if (nundef(key)) key = chooseRandom(Object.keys(Cinno));
	let f = wCard / 420;
	let [w, h, szSym, paSym, fz, pa, bth, vGapTxt, rnd, gap] = [420 * f, 200 * f, 100 * f, 8 * f, 100 * f * .8, 20 * f, 4 * f, 8 * f, 10 * f, 6 * f].map(x => Math.ceil(x));
	let info = Cinno[key];
	info.key = key;
	let cdict = { red: RED, blue: 'royalblue', green: 'green', yellow: 'yelloworange', purple: 'indigo' };
	info.c = getColorDictColor(cdict[info.color]);
	let d = mDiv();
	mSize(d, w, h);
	mStyle(d, { fz: pa, margin: 8, align: 'left', bg: info.c, rounding: rnd, patop: paSym, paright: pa, pabottom: szSym, paleft: szSym + paSym, border: '' + bth + 'px solid silver', position: 'relative' })
	mText(info.key.toUpperCase(), d, { fz: pa, weight: 'bold', margin: 'auto' });
	mLinebreak(d);
	for (const dog of info.dogmas) {
		let text = replaceSymbols(dog);
		let d1 = mText(text, d);
		d1.style.marginBottom = '' + vGapTxt + 'px';
	}
	let syms = []; let d1;
	szSym -= gap;
	let sdict = {
		tower: { k: 'white-tower', bg: 'dimgray' }, clock: { k: 'watch', bg: 'navy' }, crown: { k: 'crown', bg: 'black' },
		tree: { k: 'tree', bg: GREEN },
		bulb: { k: 'lightbulb', bg: 'purple' }, factory: { k: 'factory', bg: 'red' }
	};
	for (const s in sdict) { sdict[s].sym = Syms[sdict[s].k]; }
	for (const sym of info.resources) {
		let isEcho = false;
		if (sym == 'None') {
			d1 = mDiv(d, { fz: fz * .75, fg: 'black', bg: 'white', rounding: '50%', display: 'inline' });
			let d2 = mText('' + info.age, d1, {});
			mClass(d2, 'centerCentered');
		} else if (sym == 'echo') {
			let text = info.echo;
			console.log('info.echo', info.echo);
			if (isList(info.echo)) text = info.echo[0];
			text = replaceSymbols(text);
			wEcho = szSym;
			let [w1, h1, w2, h2] = [wEcho, szSym, wEcho - 8, szSym - 8];
			d1 = mDiv(d, { display: 'inline', fg: 'white', bg: 'dimgray', rounding: 6, h: h1, w: w1 });
			let [bestFont, w3, h3] = fitFont(text, 20, w2, h2);
			let d2 = mDiv(d1, { w: w3, h: h3, fz: bestFont }, null, text);
			mCenterCenterFlex(d1);
			isEcho = true;
		} else if (isNumber(sym)) {
			d1 = mDiv(d, { fz: fz * .75, fg: 'white', bg: 'brown', border: '2px solid black', rounding: '50%', display: 'inline' });
			mCenterCenterFlex(d1);
			let d2 = mText('' + info.age, d1, {});
		} else {
			let key = sdict[sym].k;
			let mi = mPic(key, d, { w: szSym, fz: szSym * .8, bg: sdict[sym].bg, rounding: '10%' });
			d1 = iDiv(mi);
		}
		syms.push({ isEcho: isEcho, div: d1 });
	}
	placeSymbol(syms[0], szSym, gap, { left: 0, top: 0 });
	placeSymbol(syms[1], szSym, gap, { left: 0, bottom: 0 });
	placeSymbol(syms[2], szSym, gap, { left: w / 2, bottom: 0 });
	placeSymbol(syms[3], szSym, gap, { right: 0, bottom: 0 });
	info.div = d;
	return info;
}
function cardPattern(n, sym) {
	let di = {
		1: [sym],
		2: [[sym], [sym]],
		3: [[sym], [sym], [sym]],
		4: [[sym, sym], [sym, sym]],
		5: [[sym, sym], [sym], [sym, sym]],
		6: [[sym, sym], [sym, sym], [sym, sym]],
		7: [[sym, sym], [sym, sym, sym], [sym, sym]],
		8: [[sym, sym, sym], [sym, sym], [sym, sym, sym]],
		9: [[sym, sym, sym], [sym, sym, sym], [sym, sym, sym]],
		10: [[sym, sym, sym], [sym, sym, sym, sym], [sym, sym, sym]],
		11: [[sym, sym, sym, sym], [sym, sym, sym], [sym, sym, sym, sym]],
		12: [[sym, sym, sym, sym], [sym, sym, sym, sym], [sym, sym, sym, sym]],
		13: [[sym, sym, sym], [sym, sym], [sym, sym, sym], [sym, sym], [sym, sym, sym]],
		14: [[sym, sym, sym, sym], [sym, sym, sym, sym], [sym, sym, sym, sym]],
		15: [[sym, sym, sym, sym], [sym, sym, sym, sym], [sym, sym, sym, sym]],
	};
	return di[n];
}
function cardZone(dParent, o, flex = 1, hmin = 170) {
	let dOuter = mDiv(dParent, { bg: o.color, fg: 'contrast', flex: flex, hmin: hmin }, 'd' + o.name, o.name);
	let dInner = mDiv(dOuter);
	mFlex(dInner); dInner.style.alignContent = 'flex-start';
	return dInner;
}
function catanBoard(dParent, rows, topcols, styles = {}) {
	let g = hex1Board(dParent, rows, topcols, styles);
	hexCornerNodes(g);
}
function cBlank(dParent, styles = {}, id) {
	if (nundef(styles.h)) styles.h = Card.sz;
	if (nundef(styles.w)) styles.w = styles.h * .7;
	if (nundef(styles.bg)) styles.bg = 'white';
	styles.position = 'relative';
	let [w, h, sz] = [styles.w, styles.h, Math.min(styles.w, styles.h)];
	if (nundef(styles.rounding)) styles.rounding = sz * .05;
	let d = mDiv(dParent, styles, id, null, 'card');
	//return d;
	let item = mItem(null, { div: d }, { type: 'card', sz: sz, rounding: styles.rounding });
	copyKeys(styles, item);
	return item;
}
function cBlankSvg(dParent, styles = {}) {
	if (nundef(styles.h)) styles.h = Card.sz;
	if (nundef(styles.w)) styles.w = styles.h * .7;
	if (nundef(styles.bg)) styles.bg = 'white';
	styles.position = 'relative';
	let [w, h, sz] = [styles.w, styles.h, Math.min(styles.w, styles.h)];
	if (nundef(styles.rounding)) styles.rounding = sz * .05;
	let d = mDiv(dParent, styles, null, null, 'card');
	let svg = mgTag('svg', d, { width: '100%', height: '100%' });
	let g = mgTag('g', svg);
	let item = mItem(null, { div: d, svg: svg, g: g }, { type: 'card', sz: sz });
	copyKeys(styles, item);
	return item;
}
function cCircle(c, sz, n, disp = -90) {
	let rad = sz / 2;
	centers = getEllipsePoints(rad, rad, n, disp)
	centers = centers.map(pt => ({ x: pt.X + c.x, y: pt.Y + c.y }));
	return centers;
}
function check_complete_set(fenlist) {
	if (fenlist.length != 3) return false;
	let [f1, f2, f3] = fenlist;
	console.log('set clicked', f1, f2, f3)
	for (let i = 0; i < f1.length; i++) {
		let [a, b, c] = [f1[i], f2[i], f3[i]];
		console.log('...set clicked', a, b, c)
		let correct = (a == b && b == c) || (a != b && b != c && a != c);
		if (!correct) return false;
	}
	return true;
}
function checkBoardEmpty(arr) { for (const x of arr) { if (!EmptyFunc(x)) return false; } return true; }
function checkBoardFull(arr) { for (const x of arr) if (EmptyFunc(x)) return false; return true; }
function checkPotentialTTT(arr, rows, cols) { return checkwinnersPossible(arr, rows, cols); }
function checkSudokuRule(matrix) {
	let i = 0;
	for (const arr of matrix) {
		let dd = hasDuplicate(arr);
		if (dd) {
			let err = { type: 'row', row: i, col: dd.i, val: dd.val, info: dd, i: i };
			return err;
		}
		i += 1;
	}
	i = 0;
	for (const arr of bGetCols(matrix)) {
		let dd = hasDuplicate(arr);
		if (dd) {
			let err = { type: 'column', col: i, row: dd.i, val: dd.val, i: i, info: dd };
			return err;
		}
		i += 1;
	}
	let [rows, cols] = [matrix.length, matrix[0].length];
	let rowsEach = rows == 9 ? 3 : 2;
	let colsEach = cols == 4 ? 2 : 3;
	let chunks = bGetChunksWithIndices(matrix, rowsEach, colsEach);
	i = 0;
	for (const arr of chunks) {
		let dd = hasDuplicate(arr);
		if (dd) {
			let val = dd.val;
			let err = { type: 'quadrant', row: val.row, col: val.col, val: val.val, i: i, info: dd };
		}
		i += 1;
	}
	return null;
}
function checkSudokuRule_trial1(matrix) {
	for (const arr of matrix) { let dd = hasDuplicate(arr); if (dd) return { type: 'row', info: dd }; }
	for (const arr of bGetCols(matrix)) { let dd = hasDuplicate(arr); if (dd) return { type: 'column', info: dd }; }
	let chunks = bGetChunks(matrix, 2, 2);
	for (const arr of chunks) { let dd = hasDuplicate(arr); if (dd) return { type: 'quadrant', info: dd }; }
	return null;
}
function checkwinners(arr, rows, cols) {
	for (i = 0; i < rows; i++) { let ch = bFullRow(arr, i, rows, cols); if (ch) return ch; }
	for (i = 0; i < cols; i++) { let ch = bFullCol(arr, i, rows, cols); if (ch) return ch; }
	let ch = bFullDiag(arr, rows, cols); if (ch) return ch;
	ch = bFullDiag2(arr, rows, cols); if (ch) return ch;
	return null;
}
function checkwinnersC4(arr, rows = 6, cols = 7, stride = 4) {
	for (i = 0; i < rows; i++) { let ch = bStrideRow(arr, i, rows, cols, stride); if (ch) return ch; }
	for (i = 0; i < cols; i++) { let ch = bStrideCol(arr, i, rows, cols, stride); if (ch) return ch; }
	for (i = 0; i < rows; i++) {
		for (j = 0; j < cols; j++) {
			let ch = bStrideDiagFrom(arr, i, j, rows, cols, stride); if (ch) return ch;
			ch = bStrideDiag2From(arr, i, j, rows, cols, stride); if (ch) return ch;
		}
	}
	return null;
}
function checkwinnersPossible(arr, rows, cols) {
	for (i = 0; i < rows; i++) { let ch = bPartialRow(arr, i, rows, cols); if (ch) return ch; }
	for (i = 0; i < cols; i++) { let ch = bPartialCol(arr, i, rows, cols); if (ch) return ch; }
	let ch = bPartialDiag(arr, rows, cols); if (ch) return ch;
	ch = bPartialDiag2(arr, rows, cols); if (ch) return ch;
	return null;
}
function checkwinnersTTT(arr, rows, cols) { return checkwinners(arr, rows, cols); }
function circleCenters(rows, cols, wCell, hCell) {
	let [w, h] = [cols * wCell, rows * hCell];
	let cx = w / 2;
	let cy = h / 2;
	let centers = [{ x: cx, y: cy }];
	let rx = cx + wCell / 2; let dradx = rx / wCell;
	let ry = cy + hCell / 2; let drady = ry / hCell;
	let nSchichten = Math.floor(Math.min(dradx, drady));
	for (let i = 1; i < nSchichten; i++) {
		let [newCenters, wsch, hsch] = oneCircleCenters(i * 2 + 1, i * 2 + 1, wCell, hCell);
		for (const nc of newCenters) {
			centers.push({ x: nc.x + cx - wsch / 2, y: nc.y + cy - hsch / 2 });
		}
	}
	return [centers, wCell * cols, hCell * rows];
}
function cLandscape(dParent, styles = {}, id) {
	if (nundef(styles.w)) styles.w = Card.sz;
	if (nundef(styles.h)) styles.h = styles.w * .65;
	return cBlank(dParent, styles, id);
}
function clearStatus() { clearFleetingMessage(); }
function clearTable() {
	clearElement('dTable');
	clearElement('dHistory');
	show_title();
	clearElement('dMessage');
	clearElement('dInstruction');
	clearElement('dTitleRight');
	hide('bPauseContinue');
}
function correctPolys(polys, approx = 10) {
	let clusters = [];
	for (const p of polys) {
		for (const pt of p) {
			let found = false;
			for (const cl of clusters) {
				for (const v of cl) {
					let dx = Math.abs(v.x - pt.x);
					let dy = Math.abs(v.y - pt.y);
					if (dx < approx && dy < approx) {
						cl.push(pt);
						found = true;
						break;
					}
				}
				if (found) break;
			}
			if (!found) {
				clusters.push([pt]);
			}
		}
	}
	let vertices = [];
	for (const cl of clusters) {
		let sumx = 0;
		let sumy = 0;
		let len = cl.length;
		for (const pt of cl) {
			sumx += pt.x;
			sumy += pt.y;
		}
		vertices.push({ x: Math.round(sumx / len), y: Math.round(sumy / len) });
	}
	for (const p of polys) {
		for (const pt of p) {
			let found = false;
			for (const v of vertices) {
				let dx = Math.abs(v.x - pt.x);
				let dy = Math.abs(v.y - pt.y);
				if (dx < approx && dy < approx) {
					if (dx != 0 || dy != 0) {
						pt.x = v.x;
						pt.y = v.y;
					}
					found = true;
				}
				if (found) break;
			}
			if (!found) {
				error('point not found in vertices!!! ' + pt.x + ' ' + pt.y);
			}
		}
	}
	return vertices;
}
function cPortrait(dParent, styles = {}, id) {
	if (nundef(styles.h)) styles.h = Card.sz;
	if (nundef(styles.w)) styles.w = styles.h * .7;
	return cBlank(dParent, styles, id);
}
function create_set_card(fen, dParent, card_styles) {
	let myinfo = info_from_fen(fen);
	let info = { shape: 'circle', color: BLUE, num: 1, shading: 'solid', background: 'white', text: 'none' };
	copyKeys(myinfo, info);
	let card = draw_set_card(dParent, info, card_styles);
	card.fen = fen;
	return card;
}
function cRound(dParent, styles = {}, id) {
	styles.w = valf(styles.w, Card.sz);
	styles.h = valf(styles.h, Card.sz);
	styles.rounding = '50%';
	return cBlank(dParent, styles, id);
}
function cTitleArea(card, h, styles, classes) {
	let dCard = iDiv(card);
	let dTitle = mDiv(dCard, { w: '100%', h: h, overflow: 'hidden', upperRounding: card.rounding });
	let dMain = mDiv(dCard, { w: '100%', h: card.h - h, lowerRounding: card.rounding });
	iAdd(card, { dTitle: dTitle, dMain: dMain });
	if (isdef(styles)) mStyle(dTitle, styles);
	return [dTitle, dMain];
}
function dachain(ms = 0) {
	console.log('TestInfo', TestInfo)
	if (!isEmpty(DA.chain) && !(DA.test.running && DA.test.step == true)) {
		dachainext(ms);
	} else if (isEmpty(DA.chain)) console.log('DA.chain EMPTY ' + DA.test.iter)
}
function dachainext(ms = 0) {
	let f = DA.chain.shift();
	if (ms > 0) TOMan.TO[getUID('f')] = setTimeout(f, ms);
	else f();
}
function deck_add(deck, n, arr) { let els = deck_deal(deck, n); els.map(x => arr.push(x)); return arr; }
function deck_deal(deck, n) { return deck.splice(0, n); }
function destroySudokuRule(pattern, rows, cols) {
	let sz = Math.min(rows, cols);
	let [r1, r2] = choose(range(0, sz - 1), 2);
	let c = chooseRandom(range(0, sz - 1));
	if (coin(50)) { arrSwap2d(pattern, r1, c, r2, c); }
	else if (coin(50)) { arrSwap2d(pattern, c, r1, c, r2); }
}
function draw_set_card(dParent, info, card_styles) {
	let card = cLandscape(dParent, card_styles);
	card.info = info;
	let d = iDiv(card);
	mCenterCenterFlex(d);
	let sz = card.sz / 2.8;
	let bg, shape = info.shape, text;
	switch (info.shading) {
		case 'solid': bg = info.color; break;
		case 'gradient': bg = `linear-gradient(${info.color}, silver)`; break;
		case 'empty': bg = `repeating-linear-gradient(
      45deg,
      ${info.color},
      ${info.color} 10px,
      silver 10px,
      silver 20px
    )`; break;
	}
	mStyle(d, { bg: info.background });
	switch (info.text) {
		case 'none': text = null; break;
		case 'letter': text = randomLetter(); break;
		case 'number': text = '' + randomDigit(); break;
	}
	let styles = { w: sz, h: sz, margin: sz / 10 };
	for (let i = 0; i < info.num; i++) {
		let d1 = drawShape(shape, d, styles);
		if (info.shading == 'gradient') { d1.style.backgroundColor = info.color; mClass(d1, 'polka-dot'); } else mStyle(d1, { bg: bg });
		if (shape == 'circle') console.log('circle', d1);
		if (isdef(text)) { mCenterCenterFlex(d1); mText(text, d1, { fz: sz / 1.75, fg: 'black', family: 'impact' }); }
	}
	return card;
}
function draw_set_card_test(dParent) {
	let card = cLandscape(dParent, { w: 120 });
	let d = iDiv(card, { h: '100%' });
	mCenterCenterFlex(d);
	let sz = card.sz / 4;
	let styles = { w: sz, h: sz, bg: `linear-gradient(${RED},black`, margin: sz / 10, border: `solid 3px ${GREEN}` };
	let d1 = drawShape('circle', d, styles); mCenterCenterFlex(d1); mText('A', d1, { fz: sz / 4, fg: 'white' });
	drawShape('circle', d, styles);
	drawShape('circle', d, styles);
}
function expandBoard(board, rNew, cNew, iInsert) {
	let [boardArrOld, rOld, cOld] = [board.fields.map(x => isdef(x.item) ? x.item.index : null), board.rows, board.cols];
	let boardArrNew = new Array(rNew * cNew);
	for (let r = 0; r < rNew; r++) {
		for (let c = 0; c < cNew; c++) {
			let i = iFromRowCol(r, c, rNew, cNew);
			let x = (rOld != rNew) ? r : c;
			if (x < iInsert) {
				let iOld = iFromRowCol(r, c, rOld, cOld);
				boardArrNew[i] = boardArrOld[iOld];
			}
			else if (x == iInsert) boardArrNew[i] = null;
			else {
				let [ir, ic] = (rOld != rNew) ? [r - 1, c] : [r, c - 1];
				let iOld = iFromRowCol(ir, ic, rOld, cOld);
				boardArrNew[i] = boardArrOld[iOld];
			}
		}
	}
	return { rows: rNew, cols: cNew, boardArr: boardArrNew, extras: [] };
}
function fen_from_info(info) {
	let all_attrs = gSet_attributes();
	let keys = get_keys(all_attrs);
	let fen = '';
	for (const prop of keys) {
		let val = info[prop];
		let i = all_attrs[prop].indexOf(val);
		fen += '' + i;
	}
	return fen;
}
function fillColarr(colarr, items) {
	let i = 0;
	let result = [];
	for (const r of colarr) {
		let arr = [];
		for (let c = 0; c < r; c++) {
			arr.push(items[i]); i++;
		}
		result.push(arr);
	}
	return result;
}
function fitFont(text, fz = 20, w2 = 200, h2 = 100) {
	let e1, e2, r1, r2;
	e1 = mDiv(dTable, { w: w2, h: h2, display: 'inline-block' });
	do {
		e2 = mDiv(e1, { fz: fz, display: 'inline-block' }, null, text);
		r1 = getRect(e1);
		r2 = getRect(e2);
		e2.remove();
		fz -= 1;
	} while (r1.w * r1.h < r2.w * r2.h);
	e1.remove();
	return [fz + 1, r2.w, r2.h];
}
function fitSvg(el) {
	const box = el.querySelector('text').getBBox();
	el.style.width = `${box.width}px`;
	el.style.height = `${box.height}px`;
}
function gameItem(name, color) { return mItem(name2id(name), null, { color: isdef(color) ? color : randomColor(), name: name }); }
function get_card_div(R1 = '1', SB = 'B') {
	let key52 = get_card_key52(R1, SB);
	let svgCode = C52['card_1B'];
	svgCode = '<div>' + svgCode + '</div>';
	let el = mCreateFrom(svgCode);
	[w, h] = [isdef(w) ? w : Card.w, isdef(h) ? h : Card.sz];
	mSize(el, w, h);
	return el;
}
function get_card_key52(R1 = '1', SB = 'B') {
	return `card_${Rank1}${SuitB}`;
}
function get_create_staged(fen, options, player_names) {
	let t = create_table(options, player_names);
	t.fen = fen;
	to_server({ table: t }, 'delete_and_create_staged');
}
function get_random_attr_val(attr_list) {
	let all_attrs = gSet_attributes();
	return attr_list.map(x => chooseRandom(all_attrs[x]));
}
function get_splay_number(wsplay) { return wsplay == 'none' ? 0 : wsplay == 'left' ? 1 : wsplay == 'right' ? 2 : wsplay == 'up' ? 3 : 4; }
function get_splay_word(nsplay) { return nsplay == 0 ? 'none' : nsplay == 1 ? 'left' : nsplay == 2 ? 'right' : dsplay == 3 ? 'up' : 'deck'; }
function getCenters(layout, rows, cols, wCell, hCell,) {
	if (layout == 'quad') { return quadCenters(rows, cols, wCell, hCell); }
	else if (layout == 'hex') { return hexCenters(rows, cols, wCell, hCell); }
	else if (layout == 'circle') { return circleCenters(rows, cols, wCell, hCell); }
}
function getCentersFromAreaSize(layout, wBoard, hBoard, wCell, hCell) {
	let info;
	if (layout == 'quad') { info = quadCenters(rows, cols, wCell, hCell); }
	else if (layout == 'hex') { info = hexCenters(rows, cols, wCell, hCell); }
	else if (layout == 'hex1') { info = hex1Centers(rows, cols, wCell, hCell); }
	else if (layout == 'circle') { info = circleCenters(rows, cols, wCell, hCell); }
	return info;
}
function getCentersFromRowsCols(layout, rows, cols, wCell, hCell) {
	let info;
	if (layout == 'quad') { info = quadCenters(rows, cols, wCell, hCell); }
	else if (layout == 'hex') { info = hexCenters(rows, cols, wCell, hCell); }
	else if (layout == 'hex1') { info = hex1Centers(rows, cols, wCell, hCell); }
	else if (layout == 'circle') { info = circleCenters(rows, cols, wCell, hCell); }
	return info;
}
function getCornerVertices(centers, w = 100, h = 100) {
	let polys = [];
	for (const pt of centers) {
		let poly = getHexPoly(pt.x, pt.y, w, h);
		polys.push(poly);
	}
	let vertices = correctPolys(polys, 1);
	return vertices;
}
function getSudokuPattern(r, c) {
	let patterns = {
		44: [
			[[0, 1, 2, 3], [2, 3, 0, 1], [3, 0, 1, 2], [1, 2, 3, 0]],
			[[0, 1, 2, 3], [3, 2, 0, 1], [2, 3, 1, 0], [1, 0, 3, 2]],
			[[0, 1, 2, 3], [2, 3, 0, 1], [1, 0, 3, 2], [3, 2, 1, 0]],
		],
	};
	return chooseRandom(patterns['' + r + c]);
}
function getSudokuPatternFromDB(r, c, index) {
	let key = '' + r + 'x' + c;
	let numSamples = Object.keys(DB.games.gColoku.samples[key]).length;
	if (nundef(index)) index = randomNumber(0, numSamples - 1); else if (index >= numSamples) index = 1;
	let sample = DB.games.gColoku.samples[key][index];
	let pattern = sudokuSampleToIndexMatrix(sample.sol, r, c);
	let puzzle = sudokuSampleToIndexMatrix(sample.min, r, c);
	return { pattern: pattern, puzzle: puzzle };
}
function giRep(gi, dParent, styles, shape, prefix, content) {
	gi = isString(gi) ? gi[1] == '_' ? Items[gi] : Items[name2id(gi)] : gi;
	let id = gi.id;
	let name = gi.name;
	let d = mShape(shape, dParent, styles);
	d.id = (isdef(prefix) ? prefix : '') + id;
	let key = isdef(prefix) ? prefix : 'div';
	d.innerHTML = content;
	let di = {}; di[key] = d; iAdd(gi, di);
	return d;
}
function gSet_attributes() {
	const all_attrs = {
		shape: ['circle', 'triangle', 'square'],
		color: [RED, BLUE, GREEN],
		num: [1, 2, 3],
		shading: ['solid', 'empty', 'gradient'],
		background: ['white', 'grey', 'black'],
		text: ['none', 'letter', 'number'],
	};
	return all_attrs;
}
function has_farm(uname) { return firstCond(UI.players[uname].buildinglist, x => x.type == 'farm'); }
function hasDuplicate(arr, efunc) {
	let di = {};
	if (nundef(efunc)) efunc = x => { return x === ' ' };
	let i = -1;
	for (const a of arr) {
		i += 1;
		if (efunc(a)) continue;
		if (a in di) return { i: i, val: a };
		di[a] = true;
	}
	return false;
}
function hex1Board(dParent, rows, topcols, styles = {}) {
	let g = new UIGraph(dParent, styles);
	let [w, h] = [valf(lookup(styles, ['node', 'w']), 50), valf(lookup(styles, ['node', 'h']), 50)];
	let total = hex1Count(rows, topcols);
	let nids = g.addNodes(total);
	g.hex1(rows, topcols, w + 4, h + 4);
	let indices = hex1Indices(rows, topcols);
	let ids = g.getNodeIds();
	let di = {};
	for (let i = 0; i < ids.length; i++) {
		let [row, col] = [indices[i].row, indices[i].col];
		let id = ids[i];
		lookupSet(di, [row, col], id);
		g.setProp(id, 'row', row);
		g.setProp(id, 'col', col);
		g.setProp(id, 'label', `${row},${col}`);
	}
	for (let i = 0; i < ids.length; i++) {
		let [row, col] = [indices[i].row, indices[i].col];
		let id = ids[i];
		let nid2 = lookup(di, [row, col + 2]); if (nid2) g.addEdge(id, nid2);
		nid2 = lookup(di, [row + 1, col - 1]); if (nid2) g.addEdge(id, nid2);
		nid2 = lookup(di, [row + 1, col + 1]); if (nid2) g.addEdge(id, nid2);
	}
	let byrc = {};
	for (const r in di) {
		byrc[r] = {};
		for (const c in di[r]) {
			byrc[r][c] = g.getNode(di[r][c]).data();
		}
	}
	g.di = di;
	g.byrc = byrc;
	g.rc = (i, j, f) => (isdef(f)) ? f(g.getNode(di[i][j])) : g.getNode(di[i][j]);
	return g;
}
function hex1Centers(rows, cols, wCell = 100, hCell = null) {
	let colarr = _calc_hex_col_array(rows, cols);
	let maxcols = arrMax(colarr);
	if (nundef(hCell)) hCell = (hCell / .866);
	let hline = hCell * .75;
	let offX = wCell / 2, offY = hCell / 2;
	let centers = [];
	let x = 0; y = 0;
	for (let r = 0; r < colarr.length; r++) {
		let n = colarr[r];
		for (let c = 0; c < n; c++) {
			let dx = (maxcols - n) * wCell / 2;
			let dy = r * hline;
			let center = { x: dx + c * wCell + offX, y: dy + offY };
			centers.push(center);
		}
	}
	return [centers, wCell * maxcols, hCell / 4 + rows * hline];
}
function hex1Count(rows, topcols) {
	let colarr = _calc_hex_col_array(rows, topcols);
	let total = 0;
	for (let r = 0; r < colarr.length; r++) { total += colarr[r]; }
	return total;
}
function hex1Indices(rows, topcols) {
	let colarr = _calc_hex_col_array(rows, topcols);
	let iStart = Math.floor(rows / 2);
	let inc = -1;
	let res = [];
	for (let r = 0; r < colarr.length; r++) {
		let n = colarr[r];
		for (let c = 0; c < n; c++) {
			let icol = iStart + 2 * c;
			let irow = r;
			res.push({ row: irow, col: icol });
		}
		if (iStart == 0) inc = 1;
		iStart += inc;
	}
	return res;
}
function hexCenters(rows, cols, wCell = 100, hCell) {
	if (nundef(hCell)) hCell = (hCell / .866);
	let hline = hCell * .75;
	let offX = wCell / 2, offY = hCell / 2;
	let centers = [];
	let startSmaller = Math.floor(rows / 2) % 2 == 1;
	let x = 0; y = 0;
	for (let r = 0; r < rows; r++) {
		let isSmaller = startSmaller && r % 2 == 0 || !startSmaller && r % 2 == 1;
		let curCols = isSmaller ? cols - 1 : cols;
		let dx = isSmaller ? wCell / 2 : 0;
		dx += offX;
		for (let c = 0; c < curCols; c++) {
			let center = { x: dx + c * wCell, y: offY + r * hline };
			centers.push(center);
		}
	}
	return [centers, wCell * cols, hCell / 4 + rows * hline];
}
function hexCornerNodes(g) {
	let nodes = g.getNodes();
	let centers = nodes.map(x => x.data('center'));
	let vertices = getCornerVertices(centers);
	for (const f of nodes) {
		let center = f.data('center');
		console.log('center', center)
	}
}
function hide_history_popup() { let d = mBy('dHistoryPopup'); if (isdef(d)) { mAppend(UI.dHistoryParent, UI.dHistory); mRemove(d); } }
function hide_options_popup() { let d = mBy('dOptions'); if (isdef(d)) mRemove(d); }
function i52(i) { return isList(i) ? i.map(x => Card52.getItem(x)) : Card52.getItem(i); }
function iAppend52(i, dParent, faceUp) {
	let item = i52(i);
	iFace(item, faceUp);
	mAppend(dParent, item.div);
	return item;
}
function id2name(id) { id.substring(2).split('_').join(' '); }
function iFace(item, faceUp) { if (isdef(faceUp)) faceUp ? iFaceUp(item) : iFaceDown(item); }
function iFaceDown(item) { Card52.turnFaceDown(item); }
function iFaceUp(item) { Card52.turnFaceUp(item); }
function iFromRowCol(row, col, rows, cols) { return row * cols + col; }
function iH00(iarr, dParent, styles, id) {
	function iH00Zone(dTable, nmax = 7, padding = 10) {
		let sz = netHandSize(nmax);
		return mZone(dTable, { wmin: sz.w, h: sz.h, padding: padding });
	}
	let h = isdef(Items[id]) ? Items[id] : { arr: iarr, styles: styles, id: id };
	if (nundef(h.zone)) h.zone = iH00Zone(dParent); else clearElement(h.zone);
	let items = i52(iarr);
	h.iHand = iSplay(items, h.zone);
	return h;
}
function iH00_dep(iarr, dParent, styles, id) {
	function iH00Zone(dTable, nmax = 3, padding = 10) {
		let sz = netHandSize(nmax);
		return mZone(dTable, { wmin: sz.w, h: sz.h, padding: padding, rounding: 10 });
	}
	let data = DA[id] = {};
	let h = data.deck = new DeckClass();
	h.init(iarr);
	h = data;
	if (nundef(h.zone)) h.zone = iH00Zone(dParent); else clearElement(h.zone);
	if (nundef(h.iHand)) {
		let items = i52(h.deck.cards());
		h.iHand = iSplay(items, h.zone);
	} else if (redo) {
		clearElement(h.zone);
		let items = i52(h.deck.cards());
		h.iHand = iSplay(items, h.zone);
	}
	return h;
}
function iH01(iarr, dParent, styles, id, overlap) {
	function iH01Zone(dTable, nmax = 3, padding = 10) {
		let sz = netHandSize(nmax);
		return mZone(dTable, { wmin: sz.w, h: sz.h, padding: padding });
	}
	let h = isdef(Items[id]) ? Items[id] : { arr: iarr, styles: styles, id: id };
	if (nundef(h.zone)) h.zone = iH01Zone(dParent); else clearElement(h.zone);
	let items = i52(iarr);
	h.iHand = iSplay(items, h.zone, {}, 'right', overlap);
	return h;
}
function iHand52(i) {
	let hand = iSplay(i, dTable);
}
function iHandZone(dParent, styles, nmax) {
	if (nundef(styles)) styles = { bg: 'random', rounding: 10 };
	if (isdef(nmax)) {
		console.log('nmax', nmax)
		let sz = netHandSize(nmax);
		styles.w = sz.w;
		styles.h = sz.h;
	}
	return mZone(dParent, styles);
}
function iHandZone_test(dTable, nmax = 10, padding = 10) {
	let sz = netHandSize(nmax);
	return mZone(dTable, { wmin: sz.w, h: sz.h, bg: 'random', padding: padding, rounding: 10 });
}
function iMakeHand(iarr, dParent, styles, id) {
	let data = DA[id] = {};
	let h = data.deck = new DeckClass();
	h.init(iarr);
	iPresentHand(data, dParent, styles);
	return data;
}
function iMakeHand_test(dParent, iarr, id) {
	let data = DA[id] = {};
	let h = data.deck = new DeckClass();
	h.init(iarr);
	iPresentHand_test(dParent, data);
	return data;
}
function indexDiff(a, b, s) {
	let ia = s.indexOf(a);
	let ib = s.indexOf(b);
	console.log('index of', a, 'is', ia)
	console.log('index of', b, 'is', ib)
	return ia - ib;
}
function info_from_fen(fen) {
	let all_attrs = gSet_attributes();
	let keys = get_keys(all_attrs);
	let info = {};
	for (let i = 0; i < fen.length; i++) {
		let prop = keys[i];
		let val = all_attrs[prop][Number(fen[i])];
		info[prop] = val;
	}
	return info;
}
function inno_calc_visible_syms(board, splays = {}) {
	let res = {};
	INNO.symNames.map(x => res[x] = 0);
	for (const color in board) {
		let res_color = inno_calc_visible_syms_pile(board[color], splays[color]);
		for (const k in res) { res[k] += res_color[k]; }
	}
	return res;
}
function inno_calc_visible_syms_pile(keys, dir) {
	let [cards, totals] = [keys.map(x => InnoById[x]), {}];
	INNO.symNames.map(x => totals[x] = 0);
	if (isEmpty(keys)) return totals;
	let top = cards.shift();
	for (const k of top.resources) {
		if (isdef(totals[k])) totals[k] += 1;
	}
	if (nundef(dir) || dir == 0) return totals;
	if (dir == 1) {
	} else if (dir == 2) {
		for (const c of cards) {
			for (const k in totals) {
				if (c.resources[0] == k) totals[k]++;
				if (c.resources[1] == k) totals[k]++;
			}
		}
	}
	return totals;
}
function inno_card(dParent, keyOrName) {
	if (nundef(keyOrName)) keyOrName = chooseRandom(get_keys(InnoById));
	let cardInfo, name, key, id;
	if (isdef(InnoById[keyOrName])) { id = key = keyOrName; cardInfo = InnoById[id]; name = cardInfo.name; }
	else if (isdef(InnoByName[keyOrName])) { name = keyOrName; cardInfo = InnoByName[name]; id = key = cardInfo.id; };
	let sym = INNO.sym[cardInfo.type];
	let info = Syms[sym.key];
	let card = cBlank(dParent, { fg: 'black', bg: INNO.color[cardInfo.color], w: Card.sz, h: Card.sz * .65, margin: 10 });
	let [dCard, sz, szTitle, margin] = [iDiv(card), Card.sz / 5, cardInfo.exp[0] == 'A' ? Card.sz / 12 : Card.sz / 8, 4];
	let [dTitle, dMain] = cTitleArea(card, szTitle);
	let d = mAddContent(dTitle, name, {
		patop: 4, bg: sym.bg, fg: 'white', h: szTitle, fz: szTitle * .7, align: 'center',
		position: 'relative'
	});
	mAddContent(d, cardInfo.age, { hpadding: szTitle / 4, float: 'right' });
	let s = mSym(sym.key, d, { hpadding: szTitle / 4, h: szTitle * .7, fg: sym.fg, float: 'left' });
	let positions = ['tl', 'bl', 'bc', 'br'];
	for (let i = 0; i < 4; i++) {
		let r = cardInfo.resources[i];
		let pos = positions[i];
		if (r in INNO.sym) { innoSym(r, dMain, sz, pos, margin); }
		else if (r == 'None') { innoAgeNumber(cardInfo.age, dMain, sz, pos, margin); }
		else if (isNumber(r)) { innoBonusNumber(r, dMain, sz, pos, margin); }
		else if (r == 'echo') { innoEcho(cardInfo.echo, dMain, sz, pos, margin); }
		else if (r == 'inspire') { innoInspire(cardInfo.inspire, dMain, sz, pos, margin); }
	}
	if (isdef(cardInfo.dogmas)) {
		let box = mBoxFromMargins(dMain, 10, margin, sz + margin, sz + 2 * margin);
		mStyle(box, { align: 'left' });
		let text = '';
		for (const dog of cardInfo.dogmas) {
			let t = startsWith(dog, 'I demand') ? ('I <b>demand</b>' + dog.substring(8)) : startsWith(dog, 'I compell') ? ('I <b>compell</b>' + dog.substring(8)) : dog;
			text += `<span style="color:${sym.bg};font-family:${info.family}">${info.text}</span>` + '&nbsp;' + t + '<br>';
		}
		let t2 = innoText(text);
		mFillText(t2, box);
	} else if (isdef(cardInfo.res_city)) {
		let positions = ['tc', 'tr'];
		for (let i = 0; i < 2; i++) {
			let r = cardInfo.res_city[i];
			let pos = positions[i];
			if (r == 'flag') { innoFlag(cardInfo.type, dMain, sz, pos, margin); }
			else if (r in INNO.sym) { innoSym(r, dMain, sz, pos, margin); }
			else if (r == 'None') { innoAgeNumber(cardInfo.age, dMain, sz, pos, margin); }
			else if (isNumber(r)) { innoBonusNumber(r, dMain, sz, pos, margin); }
			else if (r == 'echo') { innoEcho(cardInfo.echo, dMain, sz, pos, margin); }
			else if (r == 'inspire') { innoInspire(cardInfo.inspire, dMain, sz, pos, margin); }
		}
	}
	card.info = cardInfo;
	return card;
}
function inno_card_fixed_font(dParent, keyOrName) {
	if (nundef(keyOrName)) keyOrName = chooseRandom(get_keys(InnoById));
	let cardInfo, name, key, id;
	if (isdef(InnoById[keyOrName])) { id = key = keyOrName; cardInfo = InnoById[id]; name = cardInfo.name; }
	else if (isdef(InnoByName[keyOrName])) { name = keyOrName; cardInfo = InnoByName[name]; id = key = cardInfo.id; };
	let sym = INNO.sym[cardInfo.type];
	let info = Syms[sym.key];
	let card = cBlank(dParent, { fg: 'black', bg: INNO.color[cardInfo.color], w: Card.sz, h: Card.sz * .65, margin: 10 });
	let [dCard, sz, szTitle, margin] = [iDiv(card), Card.sz / 5, cardInfo.exp[0] == 'A' ? Card.sz / 12 : Card.sz / 8, 4];
	let [dTitle, dMain] = cTitleArea(card, szTitle);
	let d = mAddContent(dTitle, name, {
		patop: 4, bg: sym.bg, fg: 'white', h: szTitle, fz: szTitle * .7, align: 'center',
		position: 'relative'
	});
	mAddContent(d, cardInfo.age, { hpadding: szTitle / 4, float: 'right' });
	let s = mSym(sym.key, d, { hpadding: szTitle / 4, h: szTitle * .7, fg: sym.fg, float: 'left' });
	let positions = ['tl', 'bl', 'bc', 'br'];
	for (let i = 0; i < 4; i++) {
		let r = cardInfo.resources[i];
		let pos = positions[i];
		if (r in INNO.sym) { innoSym(r, dMain, sz, pos, margin); }
		else if (r == 'None') { innoAgeNumber(cardInfo.age, dMain, sz, pos, margin); }
		else if (isNumber(r)) { innoBonusNumber(r, dMain, sz, pos, margin); }
		else if (r == 'echo') { innoEcho(cardInfo.echo, dMain, sz, pos, margin); }
	}
	let box = mBoxFromMargins(dMain, 10, margin, sz + margin, sz + 2 * margin);
	console.log('box', box);
	mStyle(box, { align: 'left', padding: 4 });
	let text = '';
	for (const dog of cardInfo.dogmas) {
		let t = startsWith(dog, 'I demand') ? ('I <b>demand</b>' + dog.substring(8)) : startsWith(dog, 'I compell') ? ('I <b>compell</b>' + dog.substring(8)) : dog;
		text += `<span style="color:${sym.bg};font-family:${info.family}">${info.text}</span>` + '&nbsp;' + t + '<br>';
	}
	let t2 = innoText(text);
	mText(t2, box, { fz: 10 });
	card.info = cardInfo;
	return card;
}
function inno_create_card_assets() {
	Dinno = { A: {}, B: {}, C: {}, E: {}, F: {} };
	InnoById = {};
	InnoByName = {};
	for (const exp in Cinno) {
		for (const name in Cinno[exp]) {
			let c = Cinno[exp][name];
			c.name = name;
			c.exp = exp;
			let id = inno_get_id(c);
			c.id = c.key = id;
			if (isdef(InnoById[id])) { console.log('duplicate id', id, InnoById[id].name, c.name); }
			InnoById[id] = c;
			let key_name = name.toLowerCase().trim();
			if (isdef(InnoByName[key_name])) console.log('duplicate name', name);
			InnoByName[key_name] = c;
			lookupAddToList(Dinno, [exp[0], c.age], c.id);
		}
	}
}
function inno_get_basic_deck_age(otree, min_age) {
	for (let i = min_age; i <= 10; i++) {
		let deck = otree.decks.B[i];
		let len = deck.length;
		if (len > 0) return i;
	}
	return 11;
}
function inno_get_cardinfo(key) { return InnoById[key]; }
function inno_get_deck_age(otree, deck_letter, min_age = 1) {
	let deck_age = inno_get_basic_deck_age(otree, min_age);
	if (deck_letter == 'B') return deck_age;
	let deck = otree.decks[deck_letter][deck_age];
	while (deck_age <= 10 && isEmpty(deck)) { deck_age += 1; deck = otree.decks[deck_letter][deck_age]; }
	return deck_age;
}
function inno_get_hand_actions(otree, uname) {
	let actions = [];
	otree[uname].hand.map(x => actions.push(`${uname}.hand.${x}`));
	return actions;
}
function inno_get_id(c) { return normalize_string(c.name); }
function inno_get_object_keys(otree) {
	let keys = {}; for (const k in InnoById) keys[k] = true;
	for (const k of otree.plorder) keys[k] = true;
	for (const k of ['decks', 'board', 'splays', 'hand', 'green', 'purple', 'blue', 'red', 'yellow', 'forecast', 'scored', 'artifact', 'special_achievements', 'achievements']) keys[k] = true;
	let decknames = 'ABCEF';
	for (let i = 0; i < decknames.length; i++) { keys[decknames[i]] = true; }
	for (let age = 1; age <= 10; age++) { keys['' + age] = true; }
	return keys;
}
function inno_get_phase(iphase) { return INNO.phases[iphase].key; }
function inno_get_player_age(otree, uname) {
	let top = inno_get_top_card_info(otree, uname);
	let maxage = arrMinMax(top, x => x.age).max;
	return maxage;
}
function inno_get_splay(otree, path) {
	let [uname, x, color, y] = path.split('.');
	let splay = otree[uname].splays[color];
	return splay;
}
function inno_get_top_card_actions(otree, uname) {
	let keys = inno_get_top_card_keys(otree, uname);
	let res = keys.map(x => `${uname}.board.${inno_get_cardinfo(x).color}.${x}`);
	return res;
}
function inno_get_top_card_info(otree, uname) { return inno_get_top_card_keys(otree, uname).map(x => inno_get_cardinfo(x)); }
function inno_get_top_card_keys(otree, uname) {
	let pl = otree[uname];
	let board = pl.board;
	let top = [];
	for (const k in board) { if (!isEmpty(board[k])) top.push(arrFirst(board[k])); }
	return top;
}
function inno_present_board(dParent, board) {
	let dBoard = mDiv(dParent, {}, null, 'board');
	mFlex(dBoard);
	let boardItemLists = [];
	for (const color in board) {
		let cardlist = board[color];
		let d = mDiv(dBoard);
		let items = inno_present_cards(d, cardlist);
		boardItemLists.push(items);
	}
	return boardItemLists;
}
function inno_present_card(dParent, k) { let card = inno_card(dParent, k); card.key = card.info.key; return card; }
function inno_present_cards(dParent, keys) {
	let items = [];
	for (const k of keys) {
		let card = inno_present_card(dParent, k);
		items.push(card);
	}
	return items;
}
function inno_present_hand(dParent, hand) {
	let dHand = mDiv(dParent, {}, null, 'hand');
	mFlexWrap(dHand); mLinebreak(dHand);
	let handItems = inno_present_cards(dHand, hand);
	return handItems;
}
function inno_setup(player_names) {
	inno_shuffle_decks();
	let pre_fen = {};
	let decks = pre_fen.decks = jsCopy(Dinno);
	pre_fen.achievements = [];
	for (const age in decks.B) { last_elem_from_to(decks.B[age], pre_fen.achievements); }
	pre_fen.special_achievements = ['monument', 'empire', 'world', 'wonder', 'universe', 'legend', 'repute', 'fame', 'glory', 'victory', 'supremacy', 'destiny', 'wealth', 'heritage', 'history'];
	let pls = pre_fen.players = {};
	let deck1 = decks.B[1]; let deck2 = decks.E[1];
	for (const plname of player_names) {
		let pl = pls[plname] = {
			hand: [],
			board: { blue: [], red: [], green: [], yellow: [], purple: [] },
			splays: { blue: 0, red: 0, green: 0, yellow: 0, purple: 0 },
			achievements: [],
			scored: [],
			forecast: [],
			artifact: null
		};
		last_elem_from_to(deck1, pl.hand); last_elem_from_to(deck2, pl.hand);
	}
	pre_fen.plorder = jsCopy(player_names);
	let fen = {
		players: pre_fen.players,
		decks: pre_fen.decks,
	};
	addKeys(pre_fen, fen);
	return fen;
}
function inno_show_other_player_info(ev) {
	console.log('enter', ev.target);
	let id = evToId(ev);
	let g = Session;
	let plname = stringAfter(id, '_');
	let pl = firstCond(g.players, x => x.name == plname);
	console.log('player info for', pl);
}
function inno_shuffle_decks() {
	for (const exp in Dinno) {
		for (const age in Dinno[exp]) {
			shuffle(Dinno[exp][age]);
		}
	}
}
function inno_stat_sym(key, n, dParent, sz) {
	let d = mDiv(dParent, { display: 'flex', dir: 'c', fz: sz });
	let s = mSym(INNO.sym[key].key, d, { h: sz, fz: sz, fg: INNO.sym[key].fg });
	d.innerHTML += `<span>${n}</span>`;
	return d;
}
function innoAgeNumber(n, dParent, sz, pos, margin = 10) {
	let x = Card.sz * .04; sz -= x;
	let hOff = 0;
	let styles = { wmin: sz * 1.1, h: sz, bg: '#131313', align: 'center' };
	let box = mShape('hexFlat', dParent, styles); mPlace(box, pos, margin, margin - hOff / 2);
	s = mDiv(box, { fz: sz * .6, fg: 'white', display: 'inline-block' }, null, n);
	mPlace(s, 'cc');
	return box;
}
function innoBonusNumber(n, dParent, sz, pos, margin = 10) {
	let hOff = margin / 2;
	let styles = { w: sz, h: sz - hOff, bg: 'brown', box: true, align: 'center' };
	let box = mShape('circle', dParent, styles); mPlace(box, pos, margin + hOff / 2, margin);
	let dText = mDiv(box, { fz: sz * .1, fg: 'black', 'line-height': sz * .1, matop: sz * .05 }, null, 'bonus');
	let dNum = mDiv(box, { fz: sz * .7, fg: 'black', 'line-height': sz * .65 }, null, n);
	return box;
}
function innoEcho(text, dParent, sz, pos, margin = 10) {
	if (isList(text)) text = text.join('<br>');
	margin /= 2;
	sz += margin / 4;
	let box = mDiv(dParent, { w: sz, h: sz, bg: 'black', fg: 'white', rounding: 10 });
	mPlace(box, pos, margin);
	box.onclick = (ev) => makeInfobox(ev, box, 3);
	let t2 = innoText(text);
	mFillText(t2, box);
	return box;
}
function innoFlag(cardType, dParent, sz, pos, margin = 10) {
	let box = mDiv(dParent, { w: sz, h: sz, bg: INNO.sym.flag.bg, rounding: 10 }); if (isdef(pos)) mPlace(box, pos, margin);
	s = mSym(INNO.sym.flag.key, box, { sz: sz * .75, fg: INNO.sym[cardType].bg }, 'cc');
	return box;
}
function innoInspire(text, dParent, sz, pos, margin = 10) {
	if (isList(text)) text = text.join('<br>');
	margin /= 2;
	sz += margin / 4;
	let box = mDiv(dParent, { w: sz, h: sz, bg: '#ffffff80', fg: 'black', rounding: 10 });
	mPlace(box, pos, margin);
	box.onclick = (ev) => makeInfobox(ev, box, 3);
	let t2 = innoText(text);
	mFillText(t2, box);
	return box;
}
function innoSym(key, dParent, sz, pos, margin = 10) {
	let box = mDiv(dParent, { w: sz, h: sz, bg: INNO.sym[key].bg, rounding: 10 }); if (isdef(pos)) mPlace(box, pos, margin);
	s = mSym(INNO.sym[key].key, box, { sz: sz * .75, fg: INNO.sym[key].fg }, 'cc');
	return box;
}
function innoSymInline(key, dParent) {
	s = mSymInline(INNO.sym[key].key, dParent, { fg: INNO.sym[key].fg, bg: INNO.sym[key].bg, rounding: 10 });
	return s;
}
function innoText(text) {
	for (const s in INNO.sym) { INNO.sym[s].sym = Syms[INNO.sym[s].key]; }
	let parts = text.split('[');
	let s = parts[0];
	for (let i = 1; i < parts.length; i++) {
		let part = parts[i];
		let kw = stringBefore(part, ']');
		let sp;
		let fz = Card.sz * .04;
		if (Object.keys(INNO.sym).includes(kw)) { let o = INNO.sym[kw]; sp = makeSymbolSpan(o.sym, o.bg, o.fg, fz * .9, '20%'); }
		else if (isNumber(kw)) { sp = makeNumberSpan(kw, '#232323', 'white', fz * .9, '20%'); }
		s += sp + stringAfter(part, ']');
	}
	return s;
}
function insertColNew(board, cClick) { return expandBoard(board, board.rows, board.cols + 1, cClick + 1); }
function insertRowNew(board, cClick) { return expandBoard(board, board.rows + 1, board.cols, cClick + 1); }
function iPresentHand(h, dParent, styles, redo = true) {
	if (nundef(h.zone)) h.zone = iHandZone(dParent, styles); else clearElement(h.zone);
	if (nundef(h.iHand)) {
		let items = i52(h.deck.cards());
		h.iHand = iSplay(items, h.zone);
	} else if (redo) {
		clearElement(h.zone);
		let items = i52(h.deck.cards());
		h.iHand = iSplay(items, h.zone);
	}
	return h;
}
function iPresentHand_test(dParent, h, redo = true) {
	if (nundef(h.zone)) h.zone = iHandZone_test(dParent); else clearElement(h.zone);
	if (nundef(h.iHand)) {
		let items = i52(h.deck.cards());
		h.iHand = iSplay(items, h.zone);
	} else if (redo) {
		clearElement(h.zone);
		let items = i52(h.deck.cards());
		h.iHand = iSplay(items, h.zone);
	}
	return h;
}
function iRemakeHand(data) {
	let zone = data.zone;
	let deck = data.deck;
	let items = i52(deck.cards());
	clearElement(zone);
	data.iHand = iSplay(items, zone);
	return data;
}
function iResize52(i, h) { let w = h * .7; return iResize(i, w, h); }
function is_card(o) { return isdef(o.rank) || isdef(o.o) && isdef(o.o.rank); }
function isOppPiece(sym, plSym) { return sym && sym != plSym; }
function iSortHand(dParent, h) {
	let d = h.deck;
	d.sort();
	iPresentHand(dParent, h);
}
function iSortHand_test(dParent, h) {
	let d = h.deck;
	d.sort();
	iPresentHand_test(dParent, h);
}
function iSplay52(i, iContainer, splay = 'right', ov = 20, ovUnit = '%', createiHand = true, rememberFunc = true) {
	let ilist = !isList(i) ? i : [i];
	let items = isNumber(i[0]) ? i52(ilist) : ilist;
	let res = iSplay(items, iContainer, null, 'right', 20, '%', true);
	return res;
}
function iTableBounds(i) { return iBounds(i, dTable); }
function iToRowCol(idx, rows, cols) { let c = idx % cols; let r = (idx - c) / rows; return [r, c]; }
function make_goal_set(deck, prob_different) {
	let [fen1, fen2, fen3] = [deck[0], '', ''];
	let n = fen1.length;
	let different = randomNumber(0, n - 1);
	for (let i = 0; i < n; i++) {
		let l1 = fen1[i];
		let same = i == different ? false : coin(prob_different);
		let inc = coin() ? 1 : -1;
		let [l2, l3] = same ? [l1, l1] : ['' + (3 + Number(l1) + inc * 1) % 3, '' + (3 + Number(l1) + inc * 2) % 3];
		fen2 += l2; fen3 += l3;
	}
	return [fen1, fen2, fen3];
}
function make_set_deck(n_or_attr_list) {
	let all_attrs = gSet_attributes();
	let keys = get_keys(all_attrs);
	let n = isNumber(n_or_attr_list) ? n_or_attr_list : n_or_attr_list.length;
	let attrs = isNumber(n_or_attr_list) ? arrTake(keys, n) : n_or_attr_list;
	let list = ['0', '1', '2'];
	let i = 1;
	while (i < n) {
		let [l1, l2, l3] = [jsCopy(list), jsCopy(list), jsCopy(list)];
		l1 = l1.map(x => '0' + x); l2 = l2.map(x => '1' + x); l3 = l3.map(x => '2' + x);
		list = l1.concat(l2).concat(l3);
		i++;
	}
	return list;
}
function makeEdge(dParent, v1, v2, dFromEdge, ew = 20) {
	let switched = false;
	if (v1.x == v2.x) {
		if (v1.y > v2.y) { let h = v2; v2 = v1; v1 = h; switched = true; }
		let w = ew / 2;
		let sp = `polygon(${v1.x - w + ew}px ${v1.y + dFromEdge + ew}px, ${v1.x + w + ew}px ${v1.y + dFromEdge + ew}px, ${v2.x + w + ew}px ${v2.y - dFromEdge + ew}px, ${v2.x - w + ew}px ${v2.y - dFromEdge + ew}px)`;
		let de = mDiv(dParent, { position: 'absolute', left: -ew, top: -ew, w: '120%', h: '120%' });
		mClass(de, 'edge');
		mStyle(de, { 'clip-path': sp });
		return mItem(null, { div: de }, { type: 'edge' }, true);
	}
	if (v1.x > v2.x) { let h = v2; v2 = v1; v1 = h; switched = true; }
	let dx = v2.x - v1.x;
	let dy = v2.y - v1.y;
	let m = dy / dx;
	let [x1, y1, x2, y2] = [v1.x, v1.y, v2.x, v2.y];
	let alpha = Math.atan(m);
	let xa = x1 + dFromEdge * Math.cos(alpha);
	let ya = y1 + dFromEdge * Math.sin(alpha);
	let xe = x2 - dFromEdge * Math.cos(alpha);
	let ye = y2 - dFromEdge * Math.sin(alpha);
	let m2 = -1 / m;
	let beta = Math.atan(m2);
	let w = ew / 2;
	let x1t = xa + w * Math.cos(beta);
	let y1t = ya + w * Math.sin(beta);
	let x1b = xa - w * Math.cos(beta);
	let y1b = ya - w * Math.sin(beta);
	let x2t = xe + w * Math.cos(beta);
	let y2t = ye + w * Math.sin(beta);
	let x2b = xe - w * Math.cos(beta);
	let y2b = ye - w * Math.sin(beta);
	let de = mDiv(dParent, { position: 'absolute', left: 0, top: 0, w: '120%', h: '120%' });
	mStyle(de, { 'clip-path': `polygon(${x1t}px ${y1t}px, ${x2t}px ${y2t}px, ${x2b}px ${y2b}px, ${x1b}px ${y1b}px)` });
	mClass(de, 'edge');
	return mItem(null, { div: de }, { type: 'edge' }, true);
}
function makeInfobox(ev, elem, scale) {
	let t = ev.target; while (isdef(t) && t != elem) t = t.parentNode; if (nundef(t)) { console.log('WRONG click', ev.target); return; }
	let di = DA.infobox; if (isdef(di)) {
		let inner = di.innerHTML;
		di.remove();
		DA.infobox = null;
		if (inner == elem.innerHTML) return;
	}
	let r = getRectInt(elem, dTable);
	let d = DA.infobox = mDiv(dTable, {
		bg: 'black', rounding: 10, fz: 24, position: 'absolute',
		w: r.w, h: r.h, left: r.l, top: r.t, transform: `scale(${scale})`
	}, 'dInfoBox', elem.innerHTML);
	d.innerHTML += '<div style="font-size:6px">click to close</div><br>';
	d.onclick = () => { d.remove(); DA.infobox = null; }
}
function makeInnoNumberDiv(n, fz) {
	return `<span style='background:white;color:black;padding:2px 10px;border-radius:50%'>${n}</span>`;
}
function makeInnoSymbolDiv(info, bg, fz = 20) {
	return `<div style='text-align:center;display:inline;background-color:${bg};width:40px;padding:2px ${fz / 2}px;
  font-size:${fz}px;font-family:${info.family}'>${info.text}</div>`;
}
function makeNumberSpan(n, bg, fg, fz, rounding = '50%') {
	return `<span style='font-size:${fz}px;background:${bg};color:${fg};padding:0px 5px;border-radius:${rounding}'>${n}</span>`;
}
function makeSymbolSpan(info, bg, fg, fz, rounding = '50%') {
	let patop = Math.min(2, fz * .2);
	let pad = '5% 10%'; pad = '3px 5px'; pad = `${patop}px ${patop * 2}px`;
	if (info.key == 'queen-crown') pad = `${patop}px ${patop}px ${1}px ${patop}px`;
	else if (info.key == 'leaf') pad = `${1}px ${patop}px ${patop}px ${patop}px`;
	else if (info.key == 'white-tower') pad = `${patop}px ${patop * 2}px ${patop - 1}px ${patop * 2}px`;
	return `<div style='box-sizing:border-box;padding:${pad};min-height:${fz + 3}px;display:inline-block;font-family:${info.family};font-size:${fz}px;background:${bg};color:${fg};border-radius:${rounding}'>${info.text}</div>`;
}
function mCols(dParent, arr, itemStyles = { bg: 'random' }, rowStyles, colStyles, akku) {
	let d0 = mDiv100(dParent, { display: 'flex', 'justify-content': 'space-between' });
	if (isdef(colStyles)) mStyle(d0, colStyles);
	for (let i = 0; i < arr.length; i++) {
		let content = arr[i];
		if (isList(content)) {
			d1 = mDiv(d0);
			mRows(d1, content, itemStyles, rowStyles, colStyles, akku);
		} else {
			d1 = mContent(content, d0, itemStyles);
			akku.push(d1);
		}
	}
}
function mColsX(dParent, arr, itemStyles = { bg: 'random' }, rowStyles, colStyles, akku) {
	let d0 = mDiv100(dParent, { display: 'flex', 'justify-content': 'space-between' });
	if (isdef(colStyles)) mStyle(d0, colStyles);
	for (let i = 0; i < arr.length; i++) {
		let content = arr[i];
		if (isList(content)) {
			d1 = mDiv(d0);
			mRowsX(d1, content, itemStyles, rowStyles, colStyles, akku);
		} else {
			d1 = mContentX(content, d0, itemStyles);
			akku.push(d1);
		}
	}
}
function mContainerSplay(d, splay, w, h, num, ov) {
	if (nundef(splay)) splay = 2;
	if (!isNumber(splay)) splay = get_splay_number(splay);
	if (isString(ov) && ov[ov.length - 1] == '%') ov = splay == 0 ? 1 : splay == 3 ? Number(ov) * h / 100 : Number(ov) * w / 100;
	if (splay == 3) {
		d.style.display = 'grid';
		d.style.gridTemplateRows = `repeat(${num},${ov}px)`;
		console.log('HAAAAAAAAAAAALLLLLLLLLLLLLLLLLLLLLLLLLLOOOOOOOOOOOOOOOOOOOOOOOOO')
		d.style.minHeight = `${h + (num - 1) * (ov * 1.1)}px`;
	} else if (splay == 2 || splay == 1) {
		d.style.display = 'grid';
		d.style.gridTemplateColumns = `repeat(${num},${ov}px)`;
		let wnew = w + (num - 1) * (ov * 1.1);
		d.style.minWidth = `${w + (num - 1) * (ov * 1.1)}px`;
	} else if (splay == 0) {
		d.style.display = 'grid'; ov = .5
		d.style.gridTemplateColumns = `repeat(${num},${ov}px)`;
		d.style.minWidth = `${w + (num - 1) * (ov * 1.1)}px`;
	} else if (splay == 5) {
		d.style.display = 'grid';
		d.style.gridTemplateColumns = `${ov}px repeat(${num - 1},${ov / 2}px)`;
		d.style.minWidth = `${w + (num) * (ov / 2 * 1.1)}px`;
	} else if (splay == 4) {
		d.style.position = 'relative';
		if (nundef(ov)) ov = .5;
		d.style.minWidth = `${w + (num - 1) * (ov * 1.1)}px`;
		d.style.minHeight = `${h + (num - 1) * (ov * 1.1)}px`;
	}
}
function mContainerSplay_WORKS(d, splay, w, h, num, ov) {
	if (!isNumber(splay)) splay = get_splay_number(splay);
	if (isString(ov) && ov[ov.length - 1] == '%') ov = splay == 0 ? 1 : splay == 3 ? Number(ov) * h / 100 : Number(ov) * w / 100;
	if (splay == 3) {
		d.style.display = 'grid';
		d.style.gridTemplateRows = `repeat(${num},${ov}px)`;
		d.style.height = `${h + (num - 1) * (ov * 1.1)}px`;
	} else if (splay == 2 || splay == 1) {
		d.style.display = 'grid';
		d.style.gridTemplateColumns = `repeat(${num},${ov}px)`;
		d.style.width = `${w + (num - 1) * (ov * 1.1)}px`;
	} else if (splay == 0) {
		d.style.display = 'grid'; ov = .5
		d.style.gridTemplateColumns = `repeat(${num},${ov}px)`;
		d.style.width = `${w + (num - 1) * (ov * 1.1)}px`;
	} else if (splay == 4) {
		d.style.position = 'relative';
		if (nundef(ov)) ov = .5;
		d.style.width = `${w + (num - 1) * (ov * 1.1)}px`;
		d.style.height = `${h + (num - 1) * (ov * 1.1)}px`;
	}
}
function mContent(content, dParent, styles) {
	let d1 = isdef(Syms[content]) ? mSymInDivShrink(content, dParent, styles) : mDiv(dParent, styles, null, content);
	return d1;
}
function mContentX(content, dParent, styles = { sz: Card.sz / 5, fg: 'random' }) {
	let [key, scale] = isDict(content) ? [content.key, content.scale] : [content, 1];
	if (scale != 1) { styles.transform = `scale(${scale},${Math.abs(scale)})`; }
	let dResult = mDiv(dParent);
	let ds = isdef(Syms[key]) ? mSym(key, dResult, styles) : mDiv(dResult, styles, null, key);
	return dResult;
}
function mFillText(text, box, padding = 10, perleft = 10, pertop = 20) {
	let r = mMeasure(box);
	let [fz, w, h] = fitFont(text, 14, r.w - padding, r.h - padding);
	let dText = mDiv(box, {
		w: w, h: h, fz: fz,
		position: 'absolute', transform: `translate(-${perleft}%,-${pertop}%)`, top: `${pertop}%`, left: `${perleft}%`
	}, null, text);
	return dText;
}
function mgPos(card, el, x = 0, y = 0, unit = '%', anchor = 'center') {
	mAppend(iG(card), el);
	let box = el.getBBox();
	console.log('rect', box);
	el.setAttribute('x', x);
	el.setAttribute('y', y);
}
function mgShape(key) {
}
function mgSize(el, h, w) {
	el.setAttribute('height', h);
	if (isdef(w)) el.setAttribute('width', w);
}
function mgSuit(key) {
	let el = gCreate('use');
	el.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#' + key);
	return el;
}
function mgSuit1(card, key, h, x, y) {
	el = document.createElementNS('http://www.w3.org/2000/svg', 'use');
	el.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', `#${key}`);
	el.setAttribute('height', h);
	el.setAttribute('width', h);
	el.setAttribute('x', x);
	el.setAttribute('y', y);
	mAppend(iG(card), el);
	return el;
}
function mgSym(key) {
	let el = gCreate('text');
	let info = Syms[key];
	mStyle(el, { family: info.family });
	el.innerHTML = info.text;
	return el;
}
function mItemSplay(item, list, splay, ov = .5) {
	if (!isNumber(splay)) splay = get_splay_number(splay);
	let d = iDiv(item);
	let idx = list.indexOf(item.key);
	if (splay == 4) {
		let offset = (list.length - idx) * ov;
		mStyle(d, { position: 'absolute', left: offset, top: offset });
		d.style.zIndex = list.length - idx;
	} else {
		d.style.zIndex = splay != 2 ? list.length - idx : 0;
	}
}
function mPlaceText(text, where, dParent, styles, innerStyles, classes) {
	let box;
	if (where.length == 4) {
		let [t, r, b, l] = where;
		box = mBoxFromMargins(dParent, t, r, b, l);
	} else if (where.length == 3) {
		let [wb, hb, place] = where;
		box = mDiv(dParent, { w: wb, h: hb });
		mPlace(box, place);
	}
	let r = mMeasure(box);
	let [fz, w, h] = fitFont(text, 20, r.w, r.h);
	console.log('res', fz, w, h);
	let dText = mDiv(box, {
		w: w, h: h, fz: fz,
		position: 'absolute', transform: 'translate(-50%,-50%)', top: '50%', left: '50%'
	}, null, text);
	if (isdef(styles)) mStyle(box, styles);
	if (isdef(innerStyles)) mStyle(dText, innerStyles);
	if (isdef(classes)) mStyle(box, classes);
	return box;
}
function mRows(dParent, arr, itemStyles = { bg: 'random' }, rowStyles, colStyles, akku) {
	let d0 = mDiv100(dParent, { display: 'flex', dir: 'column', 'justify-content': 'space-between' });
	if (isdef(rowStyles)) mStyle(d0, rowStyles);
	for (let i = 0; i < arr.length; i++) {
		let content = arr[i];
		if (isList(content)) {
			let d1 = mDiv(d0);
			mCols(d1, content, itemStyles, rowStyles, colStyles, akku);
		} else {
			d1 = mContent(content, d0, itemStyles);
			akku.push(d1);
		}
	}
}
function mRowsX(dParent, arr, itemStyles = { bg: 'random' }, rowStyles, colStyles, akku) {
	let d0 = mDiv100(dParent, { display: 'flex', dir: 'column', 'justify-content': 'space-between' });
	if (isdef(rowStyles)) mStyle(d0, rowStyles);
	for (let i = 0; i < arr.length; i++) {
		let content = arr[i];
		if (isList(content)) {
			let d1 = mDiv(d0);
			mColsX(d1, content, itemStyles, rowStyles, colStyles, akku);
		} else {
			d1 = mContentX(content, d0, itemStyles);
			akku.push(d1);
		}
	}
}
function mSymbol(key, dParent, sz, styles = {}) {
	console.log('key', key)
	let info = symbolDict[key];
	fzStandard = info.fz;
	hStandard = info.h[0];
	wStandard = info.w[0];
	let fzMax = fzStandard * sz / Math.max(hStandard, wStandard);
	fzMax *= .9;
	let fz = isdef(styles.fz) && styles.fz < fzMax ? styles.fz : fzMax;
	let wi = wStandard * fz / 100;
	let hi = hStandard * fz / 100;
	let vpadding = 2 + Math.ceil((sz - hi) / 2); console.log('***vpadding', vpadding)
	let hpadding = Math.ceil((sz - wi) / 2);
	let margin = '' + vpadding + 'px ' + hpadding + 'px'; //''+vpadding+'px '+hpadding+' ';
	let newStyles = deepmergeOverride({ fz: fz, align: 'center', w: sz, h: sz, bg: 'white' }, styles);
	newStyles.fz = fz;
	let d = mDiv(dParent, newStyles);
	console.log(key, info)
	let txt = mText(info.text, d, { family: info.family });
	console.log('-----------', margin, hpadding, vpadding);
	mStyle(txt, { margin: margin, 'box-sizing': 'border-box' });
	return d;
}
function mSymFramed(info, bg, sz) {
	let [w, h, fz] = [sz, sz, sz * .7];
	return mCreateFrom(`<div style='
  text-align:center;display:inline;background-color:${bg};
  font-size:${fz}px;overflow:hidden;
  font-family:${info.family}'>${info.text}</div>`);
}
function mSymInDiv(sym, dParent, styles = { sz: Card.sz / 5, fg: 'random' }) {
	dResult = mDiv(dParent);
	ds = mSym(sym, dResult, styles);
	return dResult;
}
function mSymInDivShrink(sym, dParent, styles = { sz: Card.sz / 5, fg: 'random' }) {
	dResult = mDiv(dParent);
	let ds = mSym(sym, dResult, styles);
	let scale = chooseRandom([.5, .75, 1, 1.25]);
	let [scaleX, scaleY] = [coin() ? scale : -scale, scale];
	if (coin()) ds.style.transform = `scale(${scaleX},${scaleY})`;
	return dResult;
}
function mSymInline(key, dParent, styles) {
	let info = Syms[key];
	styles.family = info.family;
	let el = mSpan(dParent, styles, null, info.text);
	return text;
}
function mSymSizeToBox(info, w, h) {
	let fw = w / info.w;
	let fh = h / info.h;
	let f = Math.min(fw, fh);
	return { fz: 100 * f, w: info.w * f, h: info.h * f };
}
function mSymSizeToFz(info, fz) { let f = fz / 100; return { fz: fz, w: info.w * f, h: info.h * f }; }
function mSymSizeToH(info, h) { let f = h / info.h; return { fz: 100 * f, w: info.w * f, h: h }; }
function mSymSizeToW(info, w) { let f = w / info.w; return { fz: 100 * f, w: w, h: info.h * f }; }
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
			html += di[k](item);
		}
		dcol.innerHTML = html;
	}
}
function name2id(name) { return 'd_' + name.split(' ').join('_'); }
function neighborhood(items, byrc) {
	let adjList = [];
	let di = {};
	for (const info of items) {
		if (info.type != 'field') continue;
		let [r, c] = [info.row, info.col];
		info.nodeItems = [
			lookup(byrc, [r - 2, c]),
			lookup(byrc, [r - 1, c + 1]),
			lookup(byrc, [r + 1, c + 1]),
			lookup(byrc, [r + 2, c]),
			lookup(byrc, [r + 1, c - 1]),
			lookup(byrc, [r - 1, c - 1]),
		];
		info.nodes = info.nodeItems.map(x => isdef(x) ? x.id : null);
		delete info.nodeItems;
		for (let i = 0; i < 6; i++) {
			let n1 = info.nodes[i];
			if (n1 == null) continue;
			let n2 = info.nodes[(i + 1 % 6)];
			if (n2 == null) continue;
			if (lookup(di, [n1, n2]) || lookup(di, [n2, n1])) continue;
			lookupSet(di, [n1, n2], true);
			adjList.push([n1, n2]);
		}
		info.neiItems = [
			lookup(byrc, [r - 3, c + 1]),
			lookup(byrc, [r, c + 2]),
			lookup(byrc, [r + 3, c + 1]),
			lookup(byrc, [r + 3, c - 1]),
			lookup(byrc, [r, c - 2]),
			lookup(byrc, [r - 3, c - 1]),
		];
		info.nei = info.neiItems.map(x => isdef(x) ? x.id : null);
		delete info.neiItems;
	}
}
function netHandSize(nmax, hCard, wCard, ovPercent = 20, splay = 'right') {
	let isHorizontal = splay == 'right' || splay == 'left';
	if (nundef(hCard)) hCard = 110;
	if (nundef(wCard)) wCard = Math.round(hCard * .7);
	return isHorizontal ? { w: wCard + (nmax - 1) * wCard * ovPercent / 100, h: hCard } : { w: wCard, h: hCard + (nmax - 1) * hCard * ovPercent / 100 };
}
function onclick_lamp() {
	DA.simple = !DA.simple;
	if (DA.simple) show_simple_ui(); else show_advanced_ui();
	if (isVisible('dTables')) onclick_tables();
}
function onclick_last_test() {
	stop_game();
	stop_polling();
	DA.test.iter = 0;
	DA.test.suiteRunning = false;
	onclick_ut_n('ari', DA.test.number);
}
function onclick_pause_continue() {
	let b = mBy('bPauseContinue');
	clearTimeout(TO.ai);
	onclick_stoppolling();
	show_status('game is paused', true);
	mStyle(b, { fg: 'grey' });
}
function onclick_player_in_gametable(uname, tablename, rid) {
	stopgame();
	U = firstCond(Serverdata.users, x => x.name == uname);
	send_or_sim({ friendly: tablename, uname: U.name, }, 'table');
}
function onclick_reset_past() { stopgame(); phpPost({ app: 'simple' }, 'delete_past'); }
function onclick_run_tests() {
	stop_game();
	stop_polling();
	shield_on();
	DA.test.iter = 0;
	DA.test.suiteRunning = true;
	if (nundef(DA.test.list)) {
		console.log('taking default DA.test.list');
		DA.test.list = [100, 101];
	}
	test_engine_run_next(DA.test.list);
}
function onclick_step() {
	DA.test.step = true;
	DA.test.running = true;
	if (!isEmpty(DA.chain)) { dachainext(1000); return; }
	let testnumber = valf(mBy('intestnumber').value, 110);
	if (!isNumber(testnumber)) testnumber = 110;
	console.log('test for step is', testnumber);
	DA.test.number = testnumber;
	onclick_last_test();
}
function onclick_ut_n(g, n) {
	DA.test.running = true;
	let [fen, player_names] = window[`${g}_ut${n}_create_staged`]();
	get_create_staged(fen, { level_setting: 'min' }, player_names);
}
function oneCircleCenters(rows, cols, wCell, hCell) {
	let [w, h] = [cols * wCell, rows * hCell];
	let cx = w / 2;
	let cy = h / 2;
	let centers = [{ x: cx, y: cy }];
	let n = 8;
	let radx = cx - wCell / 2;
	let rady = cy - hCell / 2;
	let peri = Math.min(radx, rady) * 2 * Math.PI;
	n = Math.floor(peri / Math.min(wCell, hCell));
	while (n > 4 && n % 4 != 0 && n % 6 != 0) n -= 1;
	centers = getEllipsePoints(radx, rady, n)
	centers = centers.map(pt => ({ x: pt.X + cx, y: pt.Y + cy }));
	return [centers, wCell * cols, hCell * rows];
}
function placeSymbol(sym, szSym, margin, posStyles) {
	let d = iDiv(sym);
	posStyles.position = 'absolute';
	posStyles.margin = margin;
	posStyles.h = szSym;
	posStyles.w = szSym;
	mStyle(d, posStyles);
}
function printBoard(arr, rows, cols, reduced = true) {
	let arrR = boardArrOmitFirstRowCol(arr, rows, cols);
	let s = toBoardString(arrR, rows, cols);
	console.log('board', s);
}
function printMatrix(arr2d, title = 'result') {
	let rows = arr2d.length;
	let cols = arr2d[0].length;
	let arr = arrFlatten(arr2d);
	let s = toBoardString(arr, rows, cols);
	console.log(title, s)
}
function printState(state, cols, rows) {
	let formattedString = '';
	state.forEach((cell, index) => {
		formattedString += isdef(cell) ? ` ${cell == '0' ? ' ' : cell} |` : '   |';
		if ((index + 1) % cols == 0) {
			formattedString = formattedString.slice(0, -1);
			if (index < rows * cols - 1) {
				let s = '\u2015\u2015\u2015 '.repeat(cols);
				formattedString += '\n' + s + '\n';
			}
		}
	});
	console.log('%c' + formattedString, 'color: #6d4e42;font-size:10px');
	console.log();
}
function quadCenters(rows, cols, wCell, hCell) {
	let offX = wCell / 2, offY = hCell / 2;
	let centers = [];
	let x = 0; y = 0;
	for (let i = 0; i < rows; i++) {
		for (let j = 0; j < cols; j++) {
			let center = { x: x + offX, y: y + offY };
			centers.push(center);
			x += wCell;
		}
		y += hCell; x = 0;
	}
	return [centers, wCell * cols, hCell * rows];
}
function randomC52() { return Card52.getShortString(randomCard52()); }
function randomCard52() { return Card52.random(); }
function randomRank() { return Card52.randomRankSuit[0]; }
function randomSuit() { return Card52.randomRankSuit[1]; }
function reduceBoard(board, rNew, cNew, iModify) {
	let [boardArrOld, rOld, cOld] = [board.fields.map(x => isdef(x.item) ? x.item.index : null), board.rows, board.cols];
	let rest = [];
	if (rOld > rNew) { rest = bGetRow(boardArrOld, iModify, rOld, cOld).filter(x => x != null); }
	else if (cOld > cNew) { rest = bGetCol(boardArrOld, iModify, rOld, cOld).filter(x => x != null); }
	let boardArrNew = new Array(rNew * cNew);
	for (let r = 0; r < rNew; r++) {
		for (let c = 0; c < cNew; c++) {
			let i = iFromRowCol(r, c, rNew, cNew);
			let x = (rOld != rNew) ? r : c;
			if (x < iModify) {
				let iOld = iFromRowCol(r, c, rOld, cOld);
				boardArrNew[i] = boardArrOld[iOld];
			}
			else {
				let [ir, ic] = (rOld != rNew) ? [r + 1, c] : [r, c + 1];
				let iOld = iFromRowCol(ir, ic, rOld, cOld);
				boardArrNew[i] = boardArrOld[iOld];
			}
		}
	}
	return { rows: rNew, cols: cNew, boardArr: boardArrNew, extras: rest };
}
function removeColNew(board, cClick) { return reduceBoard(board, board.rows, board.cols - 1, cClick); }
function removeRowNew(board, cClick) { return reduceBoard(board, board.rows - 1, board.cols, cClick); }
function rPlayerOrder(players) { return shuffle(jsCopy(players)); }
function set_card_constants(w, h, ranks, suits, deckletters, numjokers = 0, ovdeck = .25, ovw = '20%', ovh = '20%') {
	Card = {};
	Card.sz = valf(h, 300);
	Card.h = h;
	Card.w = isdef(w) ? w : Card.sz * .7;
	Card.gap = Card.sz * .05;
	Card.ovdeck = ovdeck;
	Card.ovw = isString(ovw) ? Card.w * firstNumber(ovw) / 100 : ovw;
	Card.ovh = isString(ovh) ? Card.h * firstNumber(ovh) / 100 : ovh;
	Card.ranks = valf(ranks, '23456789TJQKA');
	Card.suits = valf(suits, 'SHDC');
	Card.decks = valf(deckletters, 'rb');
	Card.numdecks = deckletters.length;
	Card.numjokers = numjokers;
}
function setSymLabel(g, id, key, styles = {}) {
	if (nundef(Syms[key])) return;
	let info = Syms[key];
	console.log('family', info.family);
	g.setLabel(id, info.text, addKeys({ fz: 40, family: info.family }, styles));
}
function show_advanced_ui() {
	show('dButtons');
	show('dTest0');
	show('dTopAdvanced');
	DA.testing = true;
	DA.test = { iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [100, 101] };
	DA.test.list = arrRange(100, 101);
	DA.test.number = 306;
	DA.staged_moves = []; DA.iter = 100; DA.auto_moves = {};
}
function show_card(dParent, key, type = 'aristo') {
	if (type == 'spotit') {
		Card.sz = 200;
		let [rows, cols, numCards, setName] = [3, 2, 2, valf(key, 'animals')];
		let infos = spotitDeal(rows, cols, numCards, setName);
		let items = [];
		for (const info of infos) {
			let item = spotitCard(info, dParent, { margin: 10 }, spotitOnClickSymbol);
			mStyle(iDiv(item), { padding: 12 });
			items.push(item);
		}
	} else if (type == 'aristo') {
		let card = ari_get_card(valf(key, 'ASr'));
		mAppend(dParent, iDiv(card))
	}
}
function show_medium_ui() { DA.testing = false; hide('dButtons'); hide('dTest0'); hide('dTopAdvanced'); toggle_games_off(); }
function show_settings_orig(options) {
	clearElement('dTitleRight');
	let dParent = mDiv(mBy('dTitleRight'), { display: 'flex', fg: 'red' }, null, options.mode == 'hotseat' ? 'h' : '');
	let d = miPic('gear', dParent, { fz: 20, padding: 6, h: 40, box: true, matop: 2, rounding: '50%', cursor: 'pointer' });
	d.onmouseenter = () => show_options_popup(options);
	d.onmouseleave = hide_options_popup;
}
function show_simple_ui_orig() {
	DA.testing = false;
	hide('dButtons');
	hide('dTest0');
	hide('dTopAdvanced');
	toggle_games_off();
	toggle_tables_off();
	toggle_users_on();
}
function show_status_orig(msg = '', stay) {
	if (isdef(stay)) showFleetingMessage(msg, mBy('dStatus'), { fg: 'red' }, 1000, 0, false);
	else showFleetingMessage(msg, mBy('dStatus'), { fg: 'black' });
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
	if (isdef(U) && U.name != 'anonymous') {
		let uname = U.name;
		let sz = 36;
		let html = `
    <div username='${uname}' style='display:flex;align-items:center;gap:6px;height:100%'>
      <img src='../base/assets/images/${uname}.jpg' width='${sz}' height='${sz}' class='img_person' style='border:3px solid ${U.color};margin:0'>
      <span>${uname}</span>
    </div>`;
		show_title_left(html, { fg: U.color });
	}
	else show_home_logo();
}
function show_x_button(dParent) {
	let b = mButton('close', () => hide(dParent), dParent, { maleft: '95%' });
}
function showCards(o, type) {
	let d2 = iDiv(o);
	if (nundef(type)) type = isdef(o.type) ? o.type : 'hand';
	let arr = type == 'deck' ? o.deck.cards() : o.cards;
	let cont = type == 'deck' ? stdDeckContainer(d2, arr.length) : startsWith(type, 'cards') ? stdCardsContainer(d2, arr.length) : stdHandContainer(d2, arr.length);
	let items = arr.map(x => Card52.getItem(x % 52));
	if (endsWith(type, 'Hidden') || type == 'deck') items.map(x => Card52.turnFaceDown(x, BG_CARD_BACK));
	items.map(x => mAppend(cont, iDiv(x)));
	return items;
}
function sort_cards_orig(hand, bysuit = true, byrank = true) {
	let ranked = hand.map(x => ({ x: x, r: x[0], s: x[1] }));
	let rankstr = 'A23456789TJQK';
	if (bysuit && byrank) {
		sortByFunc(ranked, x => 3 * x.s.charCodeAt(0) + 2 * rankstr.indexOf(x.r));
	} else if (bysuit) {
		sortByFunc(ranked, x => x.s.charCodeAt(0));
	} else if (byrank) {
		sortByFunc(ranked, x => rankstr.indexOf(x.r));
	}
	return ranked.map(x => x.x);
}
function splayout(elems, dParent, w, h, x, y, overlap = 20, splay = 'right') {
	function splayRight(elems, d, x, y, overlap) {
		for (const c of elems) {
			mAppend(d, c);
			mStyle(c, { position: 'absolute', left: x, top: y });
			x += overlap;
		}
		return [x, y];
	}
	function splayLeft(elems, d, x, y, overlap) {
		x += (elems.length - 2) * overlap;
		let xLast = x;
		for (const c of elems) {
			mAppend(d, c);
			mStyle(c, { position: 'absolute', left: x, top: y });
			x -= overlap;
		}
		return [xLast, y];
	}
	function splayDown(elems, d, x, y, overlap) {
		for (const c of elems) {
			mAppend(d, c);
			mStyle(c, { position: 'absolute', left: x, top: y });
			y += overlap;
		}
		return [x, y];
	}
	function splayUp(elems, d, x, y, overlap) {
		y += (elems.length - 1) * overlap;
		let yLast = y;
		for (const c of elems) {
			mAppend(d, c);
			mStyle(c, { position: 'absolute', left: x, top: y });
			y -= overlap;
		}
		return [x, yLast];
	}
	if (isEmpty(elems)) return { w: 0, h: 0 };
	mStyle(dParent, { display: 'block', position: 'relative' });
	[x, y] = (eval('splay' + capitalize(splay)))(elems, dParent, x, y, overlap);
	let isHorizontal = splay == 'right' || splay == 'left';
	let sz = { w: (isHorizontal ? (x - overlap + w) : w), h: (isHorizontal ? h : (y - overlap + h)) };
	return sz;
}
function spotitCard(info, dParent, cardStyles, onClickSym) {
	let styles = copyKeys({ w: Card.sz, h: Card.sz }, cardStyles);
	let card = cRound(dParent, cardStyles, info.id);
	addKeys(info, card);
	let d = iDiv(card);
	card.pattern = fillColarr(card.colarr, card.keys);
	let symStyles = { sz: Card.sz / (card.rows + 1), fg: 'random', hmargin: 8, vmargin: 4, cursor: 'pointer' };
	let syms = [];
	mRows(iDiv(card), card.pattern, symStyles, { 'justify-content': 'center' }, { 'justify-content': 'center' }, syms);
	for (let i = 0; i < info.keys.length; i++) {
		let key = card.keys[i];
		let sym = syms[i];
		card.live[key] = sym;
		sym.setAttribute('key', key);
		sym.onclick = onClickSym;
	}
	return card;
}
function spotitDeal(rows, cols, numCards, setName) {
	let colarr = _calc_hex_col_array(rows, cols);
	let perCard = arrSum(colarr);
	let nShared = (numCards * (numCards - 1)) / 2;
	let nUnique = perCard - numCards + 1;
	let keys = choose(oneWordKeys(KeySets[setName]), nShared + numCards * nUnique);
	let dupls = keys.slice(0, nShared);
	let uniqs = keys.slice(nShared);
	let infos = [];
	for (let i = 0; i < numCards; i++) {
		let keylist = uniqs.slice(i * nUnique, i * nUnique + nUnique);
		let info = { id: getUID(), shares: {}, keys: keylist, rows: rows, cols: cols, colarr: colarr };
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
		}
	}
	for (const info of infos) { shuffle(info.keys); }
	return infos;
}
function spotitFindCardSharingSymbol(card, key) {
	let id = firstCondDict(card.shares, x => x == key);
	return Items[id];
}
function spotitFindSymbol(card, key) { let k = firstCondDictKey(card.live, x => x == key); return card.live[k]; }
function spotitOnClickSymbol(ev) {
	let keyClicked = evToProp(ev, 'key');
	let id = evToId(ev);
	if (isdef(keyClicked) && isdef(Items[id])) {
		let item = Items[id];
		console.log('clicked key', keyClicked, 'of card', id, item);
		if (Object.values(item.shares).includes(keyClicked)) {
			console.log('success!!!');
			let otherCard = spotitFindCardSharingSymbol(item, keyClicked);
			let cardSymbol = ev.target;
			let otherSymbol = spotitFindSymbol(otherCard, keyClicked);
			Selected = { success: true, feedbackUI: [cardSymbol, otherSymbol] };
		} else {
			console.log('fail!!!!!!!!');
			let cardSymbol = ev.target;
			Selected = { success: false, feedbackUI: [cardSymbol] };
		}
	}
}
function stdCardsContainer(dParent, n, ov = 80, styles = {}) { return stdRowOverlapContainer(dParent, n, n * ov + 22, ov, addKeys({ paleft: 20, patop: 10 }, styles)); }
function stdColOverlapContainer(dParent, n, wGrid, wCell, styles) {
	addKeys({
		h: wGrid,
		gap: 0,
		display: 'inline-grid',
		'grid-template-rows': `repeat(${n}, ${wCell}px)`
	}, styles);
	return mDiv(dParent, styles);
}
function stdDeckContainer(dParent, n, ov = .25, styles = {}) { return stdRowOverlapContainer(dParent, n, 140, ov, addKeys({ padding: 10 }, styles)); }
function stdGridContainer(dParent, wCell, styles = {}) {
	addKeys({
		wmax: 500,
		margin: 'auto',
		padding: 10,
		gap: 0,
		display: 'grid',
		bg: 'green',
		'grid-template-columns': `repeat(${20}, ${wCell}px)`
	}, styles);
	return mDiv(dParent, styles);
}
function stdHandContainer(dParent, n, ov = 20, styles = {}) { return stdRowOverlapContainer(dParent, n, 76 + n * ov + 22, ov, addKeys({ padding: 10 }, styles)); }
function stdRowOverlapContainer(dParent, n, wGrid, wCell, styles) {
	addKeys({
		w: wGrid,
		gap: 0,
		display: 'inline-grid',
		'grid-template-columns': `repeat(${n}, ${wCell}px)`
	}, styles);
	return mDiv(dParent, styles);
}
function stdRowsColsContainer(dParent, cols, styles = {}) {
	addKeys({
		margin: 'auto',
		padding: 10,
		gap: 10,
		display: 'grid',
		bg: 'green',
		'grid-template-columns': `repeat(${cols}, 1fr)`
	}, styles);
	return mDiv(dParent, styles);
}
function stringToMatrix(s, rows, cols) {
	if (isNumber(s)) s = String(s);
	let letters = toLetterArray(s);
	let nums = letters.map(x => Number(x));
	let matrix = arrToMatrix(nums, rows, cols);
}
function sudokuSampleToIndexMatrix(s, rows, cols) {
	if (isNumber(s)) s = String(s);
	let letters = toLetterArray(s);
	let nums = letters.map(x => Number(x));
	let res = [];
	for (const n of nums) {
		if (n === 0) res.push(' ');
		else res.push(n - 1);
	}
	let matrix = arrToMatrix(res, rows, cols);
	return matrix;
}
function test_add_building() {
	let [A, fen, uname] = [Z.A, Z.fen, Z.uname];
	let type = rChoose(['farm', 'estate', 'chateau']);
	add_a_correct_building_to(fen, uname, type);
	take_turn_fen();
}
function test_add_schwein() {
	let [A, fen, uname] = [Z.A, Z.fen, Z.uname];
	let type = rChoose(['farm', 'estate', 'chateau']);
	let keys = deck_deal(fen.deck, type[0] == 'f' ? 4 : type[0] == 'e' ? 5 : 6);
	fen.players[uname].buildings[type].push({ list: keys, h: null });
	take_turn_fen();
}
function test_endgame() {
	let [A, fen, uname] = [Z.A, Z.fen, Z.uname];
	fen.actionsCompleted = [];
	for (const plname of fen.plorder) {
		add_a_correct_building_to(fen, plname, 'chateau');
		add_a_correct_building_to(fen, plname, rChoose(['farm', 'estate', 'chateau']));
		if (coin()) add_a_correct_building_to(fen, plname, rChoose(['farm', 'estate', 'chateau']));
		fen.actionsCompleted.push(plname);
	}
	Z.stage = 5;
	Z.phase = 'king';
	take_turn_fen();
}
function test_skip_to_actions() {
	let [A, fen, uname] = [Z.A, Z.fen, Z.uname];
	Z.phase = 'king';
	Z.stage = 5;
	fen.actionsCompleted = [];
	let i = arrMinMax(fen.plorder, x => fen.players[x].hand.length).imin;
	let pl_min_hand = fen.plorder[i];
	console.log('pl w/ min hand is', pl_min_hand);
	let pl = fen.players[pl_min_hand];
	pl.hand = pl.hand.concat(fen.market);
	fen.market = deck_deal(fen.deck, 2);
	for (const plname of fen.plorder) {
		pl = fen.players[plname];
		let n = rNumber(1, pl.hand.length);
		pl.stall = pl.hand.splice(0, n);
	}
	Z.turn = [fen.plorder[rNumber(0, fen.plorder.length - 1)]];
	fen.total_pl_actions = fen.num_actions = fen.players[Z.turn[0]].stall.length;
	fen.action_number = 1;
	take_turn_fen();
}
function test_skip_to_tax() {
	let [A, fen, uname] = [Z.A, Z.fen, Z.uname];
	Z.phase = 'jack';
	Z.stage = 5;
	let iturn = fen.plorder.length - 1;
	Z.turn = [fen.plorder[iturn]];
	fen.actionsCompleted = fen.plorder.slice(0, iturn);
	console.log('fen.actionsCompleted', fen.actionsCompleted);
	for (const plname in fen.players) {
		let pl = fen.players[plname];
		pl.hand = pl.hand.concat(deck_deal(fen.deck, rNumber(0, 5)));
	}
	take_turn_fen();
}
function testanim0() {
	let [fen, phase, stage, deck, market] = [Z.fen, Z.phase, Z.stage, Z.deck, Z.market];
	let ms = 400;
	let item = deck.topmost;
	mAnimate(iDiv(item), 'transform', [`scale(1,1)`, `scale(0,1)`],
		() => {
			if (item.faceUp) face_down(item); else face_up(item);
			mAnimate(iDiv(item), 'transform', [`scale(0,1)`, `scale(1,1)`], null,
				ms / 2, 'ease-in', 0, 'both');
		}, ms / 2, 'ease-out', 100, 'both');
}
function testanim1() {
	let [fen, phase, deck, market] = [Z.fen, Z.phase, Z.deck, Z.market];
	DA.qanim = [];
	let n_market = phase == 'jack' ? 3 : 2;
	fen.stage = Z.stage = phase == 'jack' ? 12 : phase == 'queen' ? 11 : 4;
	for (let i = 0; i < n_market; i++) {
		DA.qanim = DA.qanim.concat([
			[qanim_flip_topmost, [deck]],
			[qanim_move_topmost, [deck, market]],
			[q_move_topmost, [deck, market]],
		]);
	}
	DA.qanim.push([q_mirror_fen, ['deck', 'market']]);
	DA.qanim.push([ari_pre_action, []]);
	qanim();
}
function testjourney0() {
	let [fen, uname] = [Z.fen, Z.uname];
	let plist = find_players_with_potential_journey(fen);
	console.log('journey players', plist);
	if (!plist.includes(uname)) {
		set_nextplayer_after_journey();
		console.log('Z.turn', Z.turn)
		take_turn_fen();
	}
}
function testSplitIntoNumbersAndWords() {
	let ss = ['1k 2queen', '1 k 12 q', '12king2queen', '31 ace 2queen', '1 3 3 4', '1 10 3 8', '1J3As', '12 koenig 2 Ass'];
	for (const s of ss) {
		let x = splitIntoNumbersAndWords(s);
	}
}
function toBoardString(arr, rows, cols) {
	let s = '\n';
	for (let r = 0; r < rows; r++) {
		for (let c = 0; c < cols; c++) {
			let item = arr[r * cols + c];
			s += '' + (nundef(item) ? '_' : item) + ' ';
		}
		s += '\n';
	}
	return s;
}
function toggle_games_off() { let a = mBy('aGames'); hide('dGames'); mStyle(a, { bg: 'silver' }); }
function toggle_games_on() { let a = mBy('aGames'); mStyle(a, { bg: 'skyblue' }); }
function toggle_tables_off() { let a = mBy('aTables'); hide('dTables'); mStyle(a, { bg: 'silver' }); }
function toggle_tables_on() { let a = mBy('aTables'); mStyle(a, { bg: '#afe78f' }); } //'lightgreen' }); }
function toggle_users_off() { let a = mBy('aUsers'); hide('dUsers'); mStyle(a, { bg: 'silver' }); }
function toggle_users_on() { let a = mBy('aUsers'); mStyle(a, { bg: 'coral' }); }
function useSymbolElemNO(key = 'Treff', h = 50, x = 0, y = 0) {
	return mCreateFrom(`<use xlink:href="#${key}" height="${h}" x="${x}" y="${y}"></use>`);
}
//#endregion legacy

//#region onclick
function onclick_ack() {
	if (nundef(Z) || nundef(Z.func.clear_ack)) return;
	Z.func.clear_ack();
}
function onclick_advanced_menu() { DA.showTestButtons = toggle_visibility('dTestButtons'); }
function onclick_advanced_mode() { Clientdata.mode = toggle_mode(); }
function onclick_advanced_test() {
	DA.showTestButtons = toggle_visibility('dTestButtons');
	style_advanced_button();
}
function onclick_by_rank() {
	let [plorder, stage, A, fen, uplayer, pl] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer, Z.fen.players[Z.uplayer]];
	let items = ui_get_hand_items(uplayer).map(x => x.o);
	let h = UI.players[uplayer].hand;
	pl.handsorting = 'rank';
	Clientdata.handsorting = pl.handsorting;
	localStorage.setItem('handsorting', Clientdata.handsorting);
	let cardcont = h.cardcontainer;
	let ch = arrChildren(cardcont);
	ch.map(x => x.remove());
	let sorted = sortCardItemsByRank(items, Z.func.rankstr); //window[Z.game.toUpperCase()].rankstr); //'23456789TJQKA*');
	h.sortedBy = 'rank';
	for (const item of sorted) {
		mAppend(cardcont, iDiv(item));
	}
}
function onclick_by_suit() {
	let [plorder, stage, A, fen, uplayer, pl] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer, Z.fen.players[Z.uplayer]];
	let items = ui_get_hand_items(uplayer).map(x => x.o);
	let h = UI.players[uplayer].hand;
	Clientdata.handsorting = pl.handsorting = 'suit';
	localStorage.setItem('handsorting', Clientdata.handsorting);
	let cardcont = h.cardcontainer;
	let ch = arrChildren(cardcont);
	ch.map(x => x.remove());
	let sorted = sortCardItemsByRank(items, Z.func.rankstr); //'23456789TJQKA*');
	sorted = sortCardItemsBySuit(sorted);
	h.sortedBy = 'suit';
	for (const item of sorted) {
		mAppend(cardcont, iDiv(item));
	}
}
function onclick_cancelmenu() { hide('dMenu'); }
function onclick_experience() {
	let [fen, uplayer] = [Z.fen, Z.uplayer];
	let plnames = get_other_players();
	let nums = range(1, fen.players[uplayer].experience);
	if (isEmpty(nums)) { show_special_message('you dont have any experience points!'); return; }
	show_special_popup('select player and number of experience points to gift:', send_experience_points, {}, plnames, nums);
}
function onclick_game_menu_item(ev) { show_game_menu(ev_to_gname(ev)); }
function onclick_home() { stopgame(); start_with_assets(); }
function onclick_logout() {
	mFadeClearShow('dAdminRight', 300);
	mClear('dAdminMiddle');
	stopgame();
	clear_screen();
	U = null;
	show_users();
}
function onclick_random() {
	if (uiActivated && !DA.ai_is_moving) ai_move(300);
	else if (!uiActivated) console.log('NOP: ui not activated...');
	else if (DA.ai_is_moving) console.log('NOP: ai is (or was already) moving...');
	else console.log('NOP: unknown...');
}
function onclick_reload() {
	if (isdef(Z)) {
		if (Z.game == 'fritz' && nundef(Z.fen.winners)) {
			console.log(Z);
			Z.fen.players[Z.uplayer].time_left = stop_timer();
			take_turn_fen();
		} else {
			FORCE_REDRAW = true; send_or_sim({ friendly: Z.friendly, uname: Z.uplayer, auto: false }, 'table');
		}
	} else if (U) { onclick_tables(); }
	else { show_users(); }
}
function onclick_reload_after_switching() { DA.pollCounter = 0; DA.reloadColor = rColor(); onclick_reload(); }
function onclick_remove_host() {
	let [role, host, game, fen, uplayer, turn, stage] = [Z.role, Z.host, Z.game, Z.fen, Z.uplayer, Z.turn, Z.stage];
}
function onclick_reset_all() { stopgame(); phpPost({ app: 'simple' }, 'delete_tables'); }
function onclick_restart() {
	let [game, fen, plorder, host] = [Z.game, Z.fen, Z.plorder, Z.host];
	Z.scoring = {};
	if (nundef(fen.original_players)) fen.original_players = fen.players;
	let playernames = [host].concat(get_keys(fen.original_players).filter(x => x != host));
	let playmodes = playernames.map(x => fen.original_players[x].playmode);
	let strategies = playernames.map(x => fen.original_players[x].strategy);
	let default_options = {}; for (const k in Config.games[game].options) default_options[k] = arrLast(Config.games[game].options[k].split(','));
	addKeys(default_options, Z.options);
	fen = Z.fen = Z.func.setup(playernames, Z.options);
	[Z.plorder, Z.stage, Z.turn, Z.round, Z.step, Z.phase] = [fen.plorder, fen.stage, fen.turn, 1, 1, fen.phase];
	if (DA.TESTSTART1) Z.turn = fen.turn = [Z.host];
	let i = 0; playernames.map(x => { let pl = fen.players[x]; pl.name = x; pl.strategy = strategies[i]; pl.playmode = playmodes[i++]; });
	take_turn_fen_clear();
}
function onclick_restart_move() { clear_transaction(); onclick_reload(); }
function onclick_skip() {
	let [game, fen, uplayer, turn, stage] = [Z.game, Z.fen, Z.uplayer, Z.turn, Z.stage];
	if (game == 'spotit') return;
	else if (game == 'bluff' && stage == 1 || game == 'ferro' && stage == 'auto_ack') { onclick_ack(); }
	else if (game == 'aristo') {
		Z.uplayer = Z.turn[0];
		Z.A = { level: 0, di: {}, ll: [], items: [], selected: [], tree: null, breadcrumbs: [], sib: [], command: null };
		copyKeys(jsCopy(Z.fen), Z);
		copyKeys(UI, Z);
		activate_ui(Z);
		Z.func.activate_ui();
		ai_move();
	} else {
		let plskip = Z.turn[0];
		Z.turn = [get_next_player(Z, plskip)];
		Z.uplayer = plskip;
		take_turn_fen();
	}
}
function onclick_skip_membership_selection() {
	let [game, A, fen, uplayer, plorder] = [Z.game, Z.A, Z.fen, Z.uplayer, Z.plorder];
	for (const pld of Z.playerdata) {
		if (isDict(pld.state)) continue;
		let plname = pld.name;
		let pl = fen.players[plname];
		pld.state = { item: rChoose(pl.hand) };
	}
	relegate_to_host(Z.playerdata);
}
function onclick_start_spotit() {
	let [game, fen, uplayer, turn, stage] = [Z.game, Z.fen, Z.uplayer, Z.turn, Z.stage];
	Z.stage = 'move';
	Z.turn = jsCopy(Z.plorder);
	take_turn_fen();
}
function onclick_status() { query_status(); }
function onclick_table(tablename) {
	send_or_sim({ friendly: tablename, uname: U.name }, 'table');
}
function onclick_tables() { phpPost({ app: 'simple' }, 'tables'); }
function onclick_tithe_all() {
	let [game, fen, uplayer, turn, stage] = [Z.game, Z.fen, Z.uplayer, Z.turn, Z.stage];
	for (const plname in fen.players) {
		let pl = fen.players[plname];
		if (isdef(pl.tithes)) { continue; }
		pl.tithes = { val: rNumber(8, 10) };
	}
	proceed_to_newcards_selection();
}
function onclick_user(uname) {
	U = firstCond(Serverdata.users, x => x.name == uname);
	localStorage.setItem('uname', U.name);
	DA.secretuser = U.name;
	let elem = firstCond(arrChildren('dUsers'), x => x.getAttribute('username') == uname);
	let img = elem.children[0];
	mShrinkTranslate(img, .75, 'dAdminRight', 400, show_username);
	mFadeClear('dUsers', 300);
}
function onclick_view_buildings() {
	let [game, fen, uplayer, turn, stage] = [Z.game, Z.fen, Z.uplayer, Z.turn, Z.stage];
	let buildings = UI.players[uplayer].buildinglist;
	for (const b of buildings) b.items.map(x => face_up(x));
	TO.buildings = setTimeout(hide_buildings, 5000);
}
function onclick_vote_1() {
	let [game, A, fen, uplayer, plorder] = [Z.game, Z.A, Z.fen, Z.uplayer, Z.plorder];
	let pld = Z.playerdata.filter(x => !isDict(x.state));
	let pld1 = rChoose(pld);
	pld1.state = { item: rChoose(fen.players[pld1.name].hand) };
	relegate_to_host(Z.playerdata);
}
function onclick_vote_empty() {
	let [game, A, fen, uplayer, plorder] = [Z.game, Z.A, Z.fen, Z.uplayer, Z.plorder];
	for (const pld of Z.playerdata) {
		if (isDict(pld.state)) continue;
		pld.state = { item: '' };
	}
	relegate_to_host(Z.playerdata);
}
function onclick_vote_president() {
	let [game, A, fen, uplayer, plorder] = [Z.game, Z.A, Z.fen, Z.uplayer, Z.plorder];
	let pls = rChoose(Z.turn, 2);
	let pld0 = Z.playerdata.find(x => x.name == pls[0]);
	let pld1 = Z.playerdata.find(x => x.name == pls[1]);
	pld0.state = { item: get_random_ballot_card() };
	pld1.state = { item: get_random_ballot_card() };
	relegate_to_host(Z.playerdata);
}
function onclick_vote_random() {
	let [game, A, fen, uplayer, plorder] = [Z.game, Z.A, Z.fen, Z.uplayer, Z.plorder];
	for (const pld of Z.playerdata) {
		if (isDict(pld.state)) continue;
		let plname = pld.name;
		let pl = fen.players[plname];
		pld.state = { item: (coin() ? '' : rChoose(pl.hand)) };
	}
	relegate_to_host(Z.playerdata);
}
function onclick_vote_red() {
	let [game, A, fen, uplayer, plorder] = [Z.game, Z.A, Z.fen, Z.uplayer, Z.plorder];
	for (const pld of Z.playerdata) {
		if (isDict(pld.state)) continue;
		let plname = pld.name;
		let pl = fen.players[plname];
		let list = pl.hand.filter(x => get_color_of_card(x) == 'red');
		pld.state = { item: isEmpty(list) ? '' : rChoose(list) };
	}
	relegate_to_host(Z.playerdata);
}
function style_advanced_button() {
	let b = mBy('dAdvancedUI').children[0];
	if (DA.showTestButtons) { b.innerHTML = ' '; mStyle(b, { bg: GREEN, opacity: 1 }); }
	else { b.innerHTML = ' '; mStyle(b, { bg: 'silver', opacity: .5 }); }
}
function style_not_playing(item, game, list) {
	let ui = iDiv(item); let uname = ui.getAttribute('username');
	mStyle(ui, { bg: 'transparent', fg: 'black' });
	arrLast(arrChildren(ui)).innerHTML = uname;
	item.ifunc = 0; item.playmode = 'none'; removeInPlace(list, item);
	item.isSelected = false;
}
function style_playing_as_bot(item, game, list) {
	let ui = iDiv(item); let uname = ui.getAttribute('username'); let bg = get_game_color(game);
	mStyle(ui, { bg: bg, fg: colorIdealText(bg) });
	arrLast(arrChildren(ui)).innerHTML = uname.substring(0, 3) + 'bot';
	item.ifunc = 2; item.playmode = 'bot';
	item.isSelected = true;
}
function style_playing_as_human(item, game, list) {
	let ui = iDiv(item); let uname = ui.getAttribute('username');
	mStyle(ui, { bg: get_user_color(uname), fg: colorIdealText(get_user_color(uname)) });
	arrLast(arrChildren(ui)).innerHTML = uname;
	item.ifunc = 1; item.playmode = 'human'; list.push(item);
	item.isSelected = true;
}
function test_start_aristo(n = 3, mode = 'multi') {
	let game = 'aristo';
	let playernames = arrTake(['mimi', 'felix', 'amanda', 'lauren', 'gul', 'nasi'], n);
	let playmodes = ['human', 'human', 'human', 'human', 'human', 'human'];
	let strategies = ['random', 'random', 'random', 'random', 'random', 'random', 'random'];
	let i = 0; let players = playernames.map(x => ({ name: x, strategy: strategies[i], playmode: playmodes[i++] }));
	let options = { mode: mode, commission: 'no' };
	startgame(game, players, options);
}
function test_start_ferro(mode = 'multi') {
	let game = 'ferro';
	let playernames = ['mimi', 'lauren', 'felix'];
	let playmodes = ['human', 'human', 'human'];
	let strategies = ['random', 'random', 'random'];
	let i = 0; let players = playernames.map(x => ({ name: x, strategy: strategies[i], playmode: playmodes[i++] }));
	let options = { mode: mode, thinking_time: 20 };
	startgame(game, players, options);
}
function toggle_select(item, funcs) {
	let params = [...arguments];
	let ifunc = (valf(item.ifunc, 0) + 1) % funcs.length; let f = funcs[ifunc]; f(item, ...params.slice(2));
}
//#endregion onclick

//#region select
function add_transaction(cmd) {
	if (!DA.simulate) start_transaction();
	DA.transactionlist.push(cmd);
}
function ari_make_selectable(item, dParent, dInstruction) {
	let A = Z.A;
	switch (item.itemtype) {
		case 'card': make_card_selectable(item); break;
		case 'container': make_container_selectable(item); break;
		case 'player': make_container_selectable(item); break;
		case 'string': make_string_selectable(item); break;
	}
}
function ari_make_selected(item) {
	let A = Z.A;
	switch (item.itemtype) {
		case 'card': make_card_selected(item); break;
		case 'container': make_container_selected(item); break;
		case 'player': make_container_selected(item); break;
		case 'string': make_string_selected(item); break;
	}
}
function ari_make_unselectable(item) {
	let A = Z.A;
	switch (item.itemtype) {
		case 'card': make_card_unselectable(item); break;
		case 'container': make_container_unselectable(item); break;
		case 'player': make_container_unselectable(item); break;
		case 'string': make_string_unselectable(item); break;
	}
}
function ari_make_unselected(item) {
	let A = Z.A;
	switch (item.itemtype) {
		case 'card': make_card_unselected(item); break;
		case 'container': make_container_unselected(item); break;
		case 'player': make_container_unselected(item); break;
		case 'string': make_string_unselected(item); break;
	}
}
function clear_selection() {
	let [plorder, stage, A, fen, uplayer, pl] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer, Z.fen.players[Z.uplayer]];
	if (nundef(Z.A) || isEmpty(A.selected)) return;
	let selitems = A.selected.map(x => A.items[x]);
	for (const item of selitems) { ari_make_unselected(item); }
	A.selected = [];
}
function clear_transaction() { DA.simulate = false; DA.transactionlist = []; }
function continue_after_error() {
	dError.innerHTML = ''; if (isdef(DA.callback)) { DA.callback(); delete (DA.callback); }
}
function make_card_selectable(item) {
	let d = iDiv(item.o);
	mClass(d, 'selectable');
	if (Z.game != 'aristo') { spread_hand(item.path, .3); }
	mClass(d.parentNode, 'selectable_parent');
}
function make_card_selected(item) {
	let color = isdef(Z.func.get_selection_color) ? Z.func.get_selection_color(item) : 'red';
	set_card_border(item, 13, color);
	if (DA.magnify_on_select) mClass(iDiv(item.o), 'mag');
}
function make_card_unselectable(item) { let d = iDiv(item.o); d.onclick = null; mClassRemove(d, 'selectable'); mClassRemove(d.parentNode, 'selectable_parent'); spread_hand(item.path); }
function make_card_unselected(item) { set_card_border(item); if (DA.magnify_on_select) mClassRemove(iDiv(item.o), 'mag'); }
function make_container_selectable(item) { let d = iDiv(item); mClass(d, 'selectable'); mClass(d, 'selectable_parent'); }
function make_container_selected(item) { let d = iDiv(item); mClass(d, 'selected_parent'); }
function make_container_unselectable(item) { let d = iDiv(item); d.onclick = null; mClassRemove(d, 'selectable'); mClassRemove(d, 'selectable_parent'); }
function make_container_unselected(item) { let d = iDiv(item); mClassRemove(d, 'selected_parent'); }
function make_deck_selectable(item) { }
function make_deck_selected(item) { }
function make_deck_unselectable(item) { }
function make_deck_unselected(item) { }
function make_hand_selectable(item) { }
function make_hand_selected(item) { }
function make_hand_unselectable(item) { }
function make_hand_unselected(item) { }
function make_market_selectable(item) { }
function make_market_selected(item) { }
function make_market_unselectable(item) { }
function make_market_unselected(item) { }
function make_string_selectable(item) { let d = mBy(item.id); mClass(d, 'selectable_button'); }
function make_string_selected(item) { let d = mBy(item.id); item.bg = mGetStyle(d, 'bg'); item.fg = mGetStyle(d, 'fg'); mStyle(d, { bg: 'yellow', fg: 'black' }); }
function make_string_unselectable(item) { let d = mBy(item.id); d.onclick = null; mClassRemove(d, 'selectable_button'); }
function make_string_unselected(item) { let d = mBy(item.id); mStyle(d, { bg: item.bg, fg: item.fg }); }
function pack_table(o) {
	for (const k of ['players', 'fen', 'state', 'player_status', 'options', 'scoring', 'notes', 'turn']) {
		let val = o[k];
		if (isdef(val)) o[k] = JSON.stringify(val);
	}
	return JSON.stringify({ table: o, playerdata: JSON.stringify(o.playerdata) });
}
function remove_from_selection(card) {
	if (nundef(Z.A)) return;
	let A = Z.A;
	let item = firstCond(A.items, x => x.id == card.id);
	if (isdef(item)) {
		let idx = item.index;
		A.items.splice(item.index, 1);
		removeInPlace(A.selected, item.index);
		make_card_unselectable(item);
		make_card_unselected(item);
		reindex_items(A.items);
	}
}
function restart_selection_process() {
	let [plorder, stage, A, fen, uplayer, pl] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer, Z.fen.players[Z.uplayer]];
	if (Z.game != 'ferro') {
		console.log('attempt to restart selection process in non-ferro game!!!');
		return;
	}
	A.selectedCards.map(x => ari_make_unselected(x));
	mClear('dSelections0');
	Z.A = { level: 0, di: {}, ll: [], items: [], selected: [], tree: null, breadcrumbs: [], sib: [], command: null };
	Z.stage = 'card_selection';
	ferro_pre_action();
}
function select_add_items(items, callback = null, instruction = null, min = 0, max = 100, prevent_autoselect = false) {
	let A = Z.A;
	select_clear_previous_level();
	A.level++; A.items = items; A.callback = callback; A.selected = []; A.minselected = min; A.maxselected = max;
	show_progress();
	let dInstruction = mBy('dSelections0');
	mClass(dInstruction, 'instruction');
	mCenterCenterFlex(dInstruction);
	dInstruction.innerHTML = (Z.role == 'active' ? `${get_waiting_html()}<span style="color:red;font-weight:bold;max-height:25px">You</span>` : `${Z.uplayer}`) + "&nbsp;" + instruction;
	if (too_many_string_items(A)) { mLinebreak(dInstruction, 4); }
	let has_submit_items = false;
	let buttonstyle = { maleft: 10, vmargin: 2, rounding: 6, padding: '4px 12px 5px 12px', border: '0px solid transparent', outline: 'none' }
	for (const item of A.items) {
		let type = item.itemtype = is_card(item) ? 'card' : is_player(item.a) ? 'player' : isdef(item.o) ? 'container' : is_color(item.a) ? 'color' : 'string';
		if (isdef(item.submit_on_click)) { has_submit_items = true; }
		let id = item.id = lookup(item, ['o', 'id']) ? item.o.id : getUID(); A.di[id] = item;
		if (type == 'string' || type == 'color') {
			let handler = ev => select_last(item, isdef(item.submit_on_click) ? callback : select_toggle, ev);
			item.div = mButton(item.a, handler, dInstruction, buttonstyle, null, id);
			if (type == 'color') mStyle(item.div, { bg: item.a, fg: 'contrast' });
		} else {
			let ui = item.div = iDiv(item.o);
			ui.onclick = ev => select_last(item, select_toggle, ev);
			ui.id = id;
		}
	}
	let show_submit_button = !has_submit_items && (A.minselected != A.maxselected || !A.autosubmit);
	if (show_submit_button) { mButton('submit', callback, dInstruction, buttonstyle, 'selectable_button', 'bSubmit'); }
	let show_restart_button = A.level > 1;
	if (show_restart_button) { mButton('restart', onclick_reload, dInstruction, buttonstyle, 'selectable_button', 'bReload'); }
	let dParent = window[`dActions${A.level}`];
	for (const item of A.items) { ari_make_selectable(item, dParent, dInstruction); }
	assertion(A.items.length >= min, 'less options than min selection!!!!', A.items.length, 'min is', min);
	if (A.items.length == min && !is_ai_player() && !prevent_autoselect) {
		for (const item of A.items) { A.selected.push(item.index); ari_make_selected(item); }
		if (A.autosubmit) {
			loader_on();
			setTimeout(() => { if (callback) callback(); loader_off(); }, 800);
		}
	} else if (is_ai_player()) {
		ai_move();
	} else if (TESTING && isdef(DA.test)) {
		if (DA.test.iter >= DA.auto_moves.length) {
			if (isdef(DA.test.end)) DA.test.end();
			activate_ui();
			return;
		}
		let selection = DA.auto_moves[DA.test.iter++];
		if (selection) {
			deactivate_ui();
			let numbers = [];
			for (const el of selection) {
				if (el == 'last') {
					numbers.push(A.items.length - 1);
				} else if (el == 'random') {
					numbers.push(rNumber(0, A.items.length - 1));
				} else if (isString(el)) {
					let commands = A.items.map(x => x.key);
					let idx = commands.indexOf(el);
					numbers.push(idx);
				} else numbers.push(el);
			}
			selection = numbers;
			A.selected = selection;
			if (selection.length == 1) A.command = A.items[A.selected[0]].key;
			A.last_selected = A.items[A.selected[0]];
			select_highlight();
			setTimeout(() => {
				if (A.callback) A.callback();
			}, 1000);
		} else { activate_ui(); }
	} else { activate_ui(); }
}
function select_clear_previous_level() {
	let A = Z.A;
	if (!isEmpty(A.items)) {
		console.assert(A.level >= 1, 'have items but level is ' + A.level);
		A.ll.push({ items: A.items, selected: A.selected });
		let dsel = Z.game == 'accuse' ? mBy(`dTitleMiddle`) : mBy(`dSelections1`);
		mStyle(dsel, { display: 'flex', 'align-items': 'center', padding: 10, box: true, gap: 10 });
		for (const item of A.items) {
			ari_make_unselectable(item);
			if (A.keep_selection) continue;
			ari_make_unselected(item);
			if (!A.selected.includes(item.index)) continue;
			if (item.itemtype == 'card') {
				let d = iDiv(item);
				let card = item.o;
				let mini = mDiv(dsel, { bg: 'yellow', fg: 'black', hpadding: 2, border: '1px solid black' }, null, card.friendly);
			} else if (item.itemtype == 'container') {
				let list = item.o.list;
				let cards = list.map(x => ari_get_card(x, 30, 30 * .7));
				let cont2 = ui_make_hand_container(cards, dsel, { bg: 'transparent' });
				ui_add_cards_to_hand_container(cont2, cards, list);
			} else if (item.itemtype == 'string') {
				let db = mDiv(dsel, { bg: 'yellow', fg: 'black', border: 'black', hpadding: 4 }, item.id, item.a);
			} else if (item.itemtype == 'color') {
				let db = mDiv(dsel, { bg: item.a, fg: 'contrast', border: 'black', hpadding: 4 }, item.id, item.a);
			} else if (item.itemtype == 'player') {
				let db = mDiv(dsel, {}, item.id, `<span style="color:${get_user_color(item.a)};font-weight:bold"> ${item.a} </span>`);
			}
		}
	}
}
function select_confirm_weiter(callback) {
	select_add_items(ui_get_string_items(['weiter']), callback, 'may click to continue', 1, 1, Z.mode == 'multi');
}
function select_error(msg, callback = null, stay = false) {
	let [A] = [Z.A];
	DA.callback = callback;
	if (A.maxselected == 1 && A.selected.length > 0) {
		let item = A.items[A.selected[0]];
		ari_make_unselected(item);
		A.selected = [];
	} else if (A.selected.length == 2) {
		let item = A.items[A.selected[1]];
		ari_make_unselected(item);
		A.selected = [A.selected[0]];
	}
	dError.innerHTML = msg;
	if (stay) {
		dError.innerHTML += '<br><button onclick="continue_after_error()">CLICK TO CONTINUE</button>';
	} else {
		TO.error = setTimeout(continue_after_error, 3000);
	}
}
function select_highlight() { let A = Z.A; for (const i of A.selected) { let a = A.items[i]; ari_make_selected(a, true); } }
function select_last(item, callback, ev) {
	if (isdef(ev)) evNoBubble(ev);
	Z.A.last_selected = item; callback(item, ev);
}
function select_timer(ms, callback) {
	let d = mBy('dSelections0');
	let dtimer = mDiv(d, { w: 80, maleft: 10, fg: 'red', weight: 'bold' }, 'dTimer');
	if (isdef(DA.timer)) { DA.timer.clear(); DA.timer = null; }
	let timer = DA.timer = new SimpleTimer(dtimer, 1000, null, ms, callback);
	timer.start();
	return dtimer;
}
function select_toggle() {
	if (!uiActivated) { console.log('ui is deactivated!!!'); return; }
	let A = Z.A;
	let item = A.last_selected;
	if (A.selected.includes(item.index)) {
		removeInPlace(A.selected, item.index);
		ari_make_unselected(item);
	} else {
		if (A.maxselected == 1 && !isEmpty(A.selected)) { ari_make_unselected(A.items[A.selected[0]]); A.selected = []; }
		A.selected.push(item.index);
		ari_make_selected(item);
		if (!DA.ai_is_moving && A.selected.length >= A.maxselected && A.autosubmit) {
			setTimeout(() => A.callback(), 100);
		}
	}
}
function start_transaction() {
	if (DA.simulate) return;
	DA.simulate = true;
	DA.snapshot = { fen: jsCopy(Z.fen), stage: Z.stage, round: Z.round, phase: Z.phase, turn: Z.turn };
	DA.transactionlist = [];
}
function stop_timer() {
	if (isdef(DA.timer)) {
		let res = DA.timer.clear();
		DA.timer = null;
		return isNumber(res) ? res : 0;
	}
	return 0;
}
//#endregion select

//#region sim
function add_to_chain(list) { DA.chain = DA.chain.concat(list); }
function ari_test_hand_to_discard(fen, uname, keep = 0) {
	let list = fen.players[uname].hand;
	while (fen.open_discard.length < 4 && list.length > keep) top_elem_from_to(list, fen.open_discard);
	while (list.length > keep) top_elem_from_to(list, fen.deck_discard);
}
function ari_ut0_create_staged() {
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'leo'];
	let fen = ari_setup(player_names);
	for (const uname in fen.players) {
		let pl = fen.players[uname];
		while (!isEmpty(pl.hand)) last_elem_from_to(pl.hand, fen.deck);
	}
	fen.players.mimi.hand = 'AHb ADb 2Cb 4Cb 6Cb KCb QDb'.split(' ');
	fen.players.leo.hand = 'ACb ASb 2Db 4Db 6Db KDb QSb'.split(' ');
	fen.players.mimi.buildings.farm = [{ list: '4Cr 4Sr 4Sb 4Dr'.split(' '), h: null }, { list: '5Cr 5Sr 5Sb 5Dr'.split(' '), h: null }];
	fen.players.mimi.buildings.estate = [{ list: 'TCr TSr TSb TDr TDb'.split(' '), h: null }];
	DA.staged_moves = [];
	DA.iter = 100;
	return [fen, player_names];
}
function ari_ut1_create_staged() {
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'leo'];
	let fen = ari_setup(player_names);
	top_elem_from_to(fen.deck, fen.market);
	top_elem_from_to(fen.deck, fen.market);
	fen.stage = 4;
	top_elem_from_to(fen.players.mimi.hand, fen.players.mimi.stall);
	top_elem_from_to(fen.players.mimi.hand, fen.players.mimi.stall);
	fen.iturn = 1;
	fen.turn = ['leo'];
	DA.staged_moves = [];
	DA.iter = 100;
	return [fen, player_names];
}
function ari_ut10_create_staged() {
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'leo'];
	let fen = ari_setup(player_names);
	DA.staged_moves = [];
	DA.iter = 100;
	return [fen, player_names];
}
function ari_ut100_create_staged() {
	console.log('*** test 100: tax ***');
	DA.test.number = 100;
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'amanda', 'felix', 'lauren', 'blade'];
	let fen = ari_setup(player_names);
	ari_test_hand_to_discard(fen, 'mimi');
	deck_add(fen.deck, 3, fen.players.amanda.hand);
	ari_test_hand_to_discard(fen, 'felix', 3);
	deck_add(fen.deck, 1, fen.players.blade.hand);
	let sz = ARI.sz_hand;
	fen.pl_tax = { mimi: -sz, amanda: 3, felix: -sz + 3, lauren: 0, blade: 1 };
	[fen.iturn, fen.turn] = [1, ['amanda']];
	fen.stage = 2;
	DA.fen0 = fen;
	DA.staged_moves = [];
	DA.iter = 100;
	DA.iter_verify = 3;
	DA.verify = (ot) => {
		let res = forAll(ot.plorder, x => ot[x].hand.length <= sz);
		if (!res) for (const uname of ot.plorder) console.log('pl', uname, 'hand', ot[uname].hand.length, 'should be', Math.min(sz, DA.fen0.players[uname].hand.length));
		return res;
	};
	DA.auto_moves = {
		amanda_1: [[0, 1, 2]],
		blade_2: [[0]],
	}
	return [fen, player_names];
}
function ari_ut101_create_staged() {
	console.log('*** test 101: stall selection 5 players ***');
	DA.test.number = 101;
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'amanda', 'felix', 'lauren', 'blade'];
	let fen = ari_setup(player_names);
	ari_test_hand_to_discard(fen, 'mimi');
	ari_test_hand_to_discard(fen, 'felix');
	fen.stage = 3;
	DA.fen0 = fen;
	DA.staged_moves = [];
	DA.iter = 100;
	DA.iter_verify = 6;
	DA.verify = (ot) => {
		let stall_sz = { mimi: 0, amanda: 3, felix: 0, lauren: 1, blade: 2 };
		let res = forAll(ot.plorder, x => ot[x].stall.length == stall_sz[x]);
		if (!res) for (const uname of ot.plorder) console.log('pl', uname, 'stall', ot[uname].stall.length, 'should be', stall_sz[uname]);
		return res;
	};
	DA.auto_moves = {
		amanda_2: [[0, 1, 2]],
		lauren_4: [[0]],
		blade_5: [[0, 1]],
	}
	return [fen, player_names];
}
function ari_ut102_create_staged() {
	console.log('*** test 102: stall selection mimi-leo ***');
	DA.test.number = 102;
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'leo'];
	let fen = ari_setup(player_names);
	ari_test_hand_to_discard(fen, 'mimi');
	fen.stage = 3;
	DA.fen0 = fen;
	DA.iter_verify = 3;
	DA.verify = (ot) => {
		let stall_sz = { mimi: 0, leo: 3 };
		let res = forAll(ot.plorder, x => ot[x].stall.length == stall_sz[x]);
		if (!res) for (const uname of ot.plorder) console.log('pl', uname, 'stall', ot[uname].stall.length, 'should be', stall_sz[uname]);
		return res;
	};
	DA.auto_moves = {
		leo_2: [[0, 1, 2]],
	};
	return [fen, player_names];
}
function ari_ut103_create_staged() {
	console.log('*** test 103: trade ***');
	DA.test.number = 103;
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'leo'];
	let fen = ari_setup(player_names);
	arisim_stage_3(fen);
	arisim_stage_4_all_mimi_starts(fen, 2);
	DA.fen0 = fen;
	DA.auto_moves = {
		mimi_1: [['trade'], [1, 3]],
		mimi_2: [['pass']],
		leo_3: [['trade'], [1, 3]],
		leo_4: [['pass']],
	};
	DA.iter_verify = 5;
	DA.verify = (ot) => {
		let res = firstCond(ot.mimi.hand, x => x == DA.fen0.market[1]);
		if (!res) console.log('mimi stall does not contain market card from start!!!');
		return res;
	};
	return [fen, player_names];
}
function ari_ut104_create_staged() {
	console.log('*** test 104: downgrade from estate to farm ***');
	DA.test.number = 104;
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'leo'];
	let fen = ari_setup(player_names);
	arisim_stage_3(fen);
	arisim_stage_4_all_mimi_starts(fen);
	stage_building(fen, fen.iturn, 'estate');
	DA.fen0 = fen;
	DA.iter_verify = 2;
	DA.verify = (ot) => {
		let stall_sz = { mimi: 0, leo: 3 };
		let res = ot.mimi.buildings.farm.length == 1 && ot.mimi.buildings.estate.length == 0;
		if (!res) console.log('mimi buildings', ot.mimi.buildings);
		return res;
	};
	DA.auto_moves = {
		mimi_1: [['downgrade'], [0]],
	};
	return [fen, player_names];
}
function ari_ut105_create_staged() {
	console.log('*** test 105: visit ***');
	DA.test.number = 105;
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'leo', 'meckele'];
	let fen = ari_setup(player_names);
	arisim_stage_3(fen);
	arisim_stage_4_all_mimi_starts(fen);
	stage_replace_hand_cards_by(fen, 'mimi', ['QSy']);
	stage_building(fen, fen.iturn, 'estate');
	stage_building(fen, 1, 'estate');
	stage_building(fen, 2, 'estate');
	fen.phase = 'queen';
	DA.fen0 = fen;
	DA.iter_verify = 2;
	DA.verify = (ot) => {
		let uname_visited = ot.uname;
		let building = ot[uname_visited].buildings.estate[0];
		let res = ot.mimi.coins == 2 || ot.mimi.coins == 4 || ot.mimi.hand.length + ot.mimi.stall.length == 6;
		if (!res) console.log('mimi visit payment did not work!', building.list);
		return res;
	};
	DA.auto_moves = {
		mimi_1: [['visit'], [0], [0], ['pass']],
	};
	return [fen, player_names];
}
function ari_ut106_create_staged() {
	console.log('*** test 106: double visit ***');
	DA.test.number = 106;
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'leo', 'meckele'];
	let fen = ari_setup(player_names);
	arisim_stage_3(fen);
	arisim_stage_4_all_mimi_starts(fen);
	stage_replace_hand_cards_by(fen, 'mimi', ['QSy', 'QSg']);
	stage_building(fen, fen.iturn, 'estate');
	stage_building(fen, 1, 'chateau');
	stage_building(fen, 2, 'chateau');
	fen.phase = 'queen';
	DA.fen0 = fen;
	DA.auto_moves = {
		mimi_1: [['visit'], [0], [0]],
		mimi_2: [['visit'], [0], [0]],
	};
	DA.iter_verify = 3;
	DA.verify = (ot) => {
		let uname_visited = ot.plorder[1];
		let chateau = ot[uname_visited].buildings.chateau;
		console.log('chateau:', uname_visited, chateau);
		let res = ot.mimi.coins == 5 || ot[uname_visited].buildings.chateau.length == 0;
		if (!res) console.log('double visit failed or building is correct!!!');
		return res;
	};
	return [fen, player_names];
}
function ari_ut107_create_staged() {
	console.log('*** test 107: end game ***');
	DA.test.number = 107;
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'leo'];
	let fen = ari_setup(player_names);
	arisim_stage_3(fen);
	arisim_stage_4_all_mimi_starts(fen);
	stage_correct_buildings(fen, { mimi: { farm: 2, estate: 2, chateau: 1 }, leo: { farm: 3 } });
	DA.fen0 = fen;
	DA.auto_moves = {
		mimi_1: [['pass']],
		leo_2: [['pass']],
		3: [[0]],
	};
	DA.iter_verify = 4;
	DA.verify = (ot) => {
		let res = ot.winners = 'mimi';
		if (!res) console.log('end game mimi should win didnt work!', ot);
		return res;
	};
	return [fen, player_names];
}
function ari_ut108_create_staged() {
	console.log('*** test 108: buy from open discard ***');
	DA.test.number = 108;
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'leo'];
	let fen = ari_setup(player_names);
	fen.open_discard = deck_deal(fen.deck, 4);
	arisim_stage_3(fen);
	arisim_stage_4_all_mimi_starts(fen);
	stage_correct_buildings(fen, { mimi: { farm: 2, estate: 2, chateau: 1 }, leo: { farm: 3 } });
	fen.phase = 'jack';
	DA.fen0 = fen;
	DA.auto_moves = {
		mimi_1: [['buy'], [0], [0]],
	};
	DA.iter_verify = 2;
	DA.verify = (ot) => {
		let res = ot.open_discard.length == 3 && ot.mimi.hand.length == 5 && ot.mimi.coins == 2
			|| arrLast(ot.open_discard)[0] == 'J' && ot.mimi.hand.length == 4 && ot.mimi.coins == 3;
		if (!res) console.log('buy form discard does not work!', ot.mimi, ot.open_discard);
		return res;
	};
	return [fen, player_names];
}
function ari_ut109_create_staged() {
	console.log('*** test 109: harvest ***');
	DA.test.number = 109;
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'leo', 'meckele'];
	let fen = ari_setup(player_names);
	fen.open_discard = deck_deal(fen.deck, 4);
	arisim_stage_3(fen);
	arisim_stage_4_all_mimi_starts(fen);
	stage_correct_buildings(fen, { mimi: { farm: 2, estate: 2 }, leo: { farm: 3 }, meckele: { farm: 2 } });
	fen.phase = 'jack';
	DA.fen0 = fen;
	DA.auto_moves = [
		[[]],
		[['pass']], [['pass']], [['pass']],
		[[0]], [[0]], [[0]],
		[[0, 1]], [[0, 1]], [[0, 1]],
		[['harvest'], [0]],
	];
	DA.iter_verify = 11;
	DA.verify = (ot) => {
		let uname = ot.uname;
		let res = ot[uname].buildings.farm[0].h == null && ot[uname].hand.length == 6;
		if (!res) console.log('harvest FAIL!', ot[uname]);
		return res;
	};
	return [fen, player_names];
}
function ari_ut11_create_staged() {
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'leo'];
	let fen = ari_setup(player_names);
	let [mimi, leo] = [fen.players.mimi, fen.players.leo];
	mimi.buildings.farm = [{ list: deck_deal(fen.deck, 4), h: null }];
	leo.buildings.farm = [{ list: deck_deal(fen.deck, 4), h: null }];
	fen.open_discard = deck_deal(fen.deck, 4);
	fen.market = deck_deal(fen.deck, 2);
	fen.phase = 'king';
	arisim_stage_4(fen, 3, 3);
	DA.staged_moves = [];
	DA.iter = 100;
	return [fen, player_names];
}
function ari_ut110_create_staged() {
	console.log('*** test 110: end game 2 ***');
	DA.test.number = 110;
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'leo'];
	let fen = ari_setup(player_names);
	arisim_stage_3(fen);
	arisim_stage_4_all_mimi_starts(fen);
	fen.open_discard = deck_deal(fen.players.mimi.hand, 2);
	deck_add(fen.players.leo.hand, 2, fen.open_discard);
	stage_correct_buildings(fen, { mimi: { farm: 2, estate: 2, chateau: 1 }, leo: { farm: 3 } });
	fen.phase = 'jack';
	DA.fen0 = fen;
	DA.auto_moves = [
		[[]],
		[['pass']], [['pass']],
		[[0]], [[0]],
		[['pass']], [['pass']],
		[[1]],
	];
	DA.iter_verify = 8;
	DA.verify = (ot) => {
		let res = ot.stage == 3;
		if (!res) console.log('Not ending game FAIL!', ot.stage);
		return res;
	};
	return [fen, player_names];
}
function ari_ut111_create_staged() {
	console.log('*** test 111: auction payment test ***');
	DA.test.number = 111;
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'leo', 'meckele'];
	let fen = ari_setup(player_names);
	arisim_stage_3(fen);
	arisim_stage_4_all_mimi_starts(fen);
	fen.open_discard = deck_deal(fen.players.mimi.hand, 2);
	deck_add(fen.players.leo.hand, 2, fen.open_discard);
	fen.phase = 'queen';
	DA.fen0 = fen;
	DA.auto_moves = {
		1: [['pass']],
		2: [['pass']],
		3: [['pass']],
		4: [[0]],
		5: [[1]],
		6: [[2]],
		7: [[0]],
	};
	DA.iter_verify = 8;
	DA.verify = (ot) => {
		let coins = ot.plorder.map(x => ot[x].coins);
		let sum = arrSum(coins);
		let res = sum == 8;
		if (!res) console.log('payment for auction card wrong', coins, sum);
		return res;
	};
	return [fen, player_names];
}
function ari_ut112_create_staged() {
	console.log('*** test 112: auction payment test 2 ***');
	DA.test.number = 112;
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'leo', 'meckele', 'felix', 'amanda'];
	let fen = ari_setup(player_names);
	arisim_stage_3(fen);
	arisim_stage_4_all_mimi_starts(fen);
	fen.phase = 'queen';
	DA.fen0 = fen;
	DA.auto_moves = {
		1: [['pass']],
		2: [['pass']],
		3: [['pass']],
		4: [['pass']],
		5: [['pass']],
		6: [[1]],
		7: [[0]],
		8: [[2]],
		9: [[2]],
		10: [[1]],
		11: [[0]],
		12: [[1]],
	};
	DA.iter_verify = 13;
	DA.verify = (ot) => {
		let coins = ot.plorder.map(x => ot[x].coins);
		let sum = arrSum(coins);
		let res = sum == 11;
		if (!res) console.log('payment for auction card wrong', coins, sum);
		return res;
	};
	return [fen, player_names];
}
function ari_ut113_create_staged() {
	console.log('*** test 113: buy from open discard w/ jack ***');
	DA.test.number = 113;
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'leo'];
	let fen = ari_setup(player_names);
	fen.open_discard = deck_deal(fen.deck, 4);
	arisim_stage_3(fen);
	arisim_stage_4_all_mimi_starts(fen);
	stage_replace_hand_cards_by(fen, 'mimi', ['JSy']);
	stage_correct_buildings(fen, { mimi: { farm: 2, estate: 2, chateau: 1 }, leo: { farm: 3 } });
	fen.phase = 'jack';
	DA.fen0 = fen;
	DA.auto_moves = {
		mimi_1: [['buy'], [0], [0]],
	};
	DA.iter_verify = 2;
	DA.verify = (ot) => {
		let res = ot.open_discard.length == 3 && ot.mimi.hand.length == 5 && ot.mimi.coins == 2
			|| arrLast(ot.open_discard)[0] == 'J' && ot.mimi.hand.length == 4 && ot.mimi.coins == 3;
		if (!res) console.log('buy form discard does not work!', ot.mimi, ot.open_discard);
		return res;
	};
	return [fen, player_names];
}
function ari_ut12_create_staged() {
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'amanda', 'felix', 'lauren', 'blade'];
	let fen = ari_setup(player_names);
	DA.staged_moves = [];
	DA.iter = 100;
	return [fen, player_names];
}
function ari_ut13_create_staged() {
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'amanda', 'felix', 'lauren', 'blade'];
	let fen = ari_setup(player_names);
	ari_test_hand_to_discard(fen, 'mimi');
	ari_test_hand_to_discard(fen, 'lauren');
	console.log('mimi', fen.players.mimi)
	DA.staged_moves = [];
	DA.iter = 100;
	return [fen, player_names];
}
function ari_ut14_create_staged() {
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'amanda', 'felix', 'lauren', 'blade'];
	let fen = ari_setup(player_names);
	DA.fen0 = jsCopy(fen);
	arisim_stage_3(fen);
	arisim_stage_4_all(fen, 1);
	DA.staged_moves = [];
	DA.iter = 100;
	DA.iter_verify = 2;
	DA.verify = (ot) => {
		let plast = arrLast(ot.round);
		let ok = sameList(ot[plast].hand, DA.fen0.players[plast].hand);
		console.log('pl', plast, 'hand', ot[plast].hand, 'should be', DA.fen0.players[plast].hand);
		return ok;
	}
	return [fen, player_names];
}
function ari_ut15_create_staged() {
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'amanda', 'felix', 'lauren', 'blade'];
	let fen = DA.fen0 = ari_setup(player_names);
	ari_test_hand_to_discard(fen, 'mimi');
	ari_test_hand_to_discard(fen, 'amanda');
	ari_test_hand_to_discard(fen, 'lauren');
	ari_test_hand_to_discard(fen, 'blade');
	DA.staged_moves = [];
	DA.iter = 100;
	DA.iter_verify = 3;
	DA.verify = (ot) => ot.uname == 'felix';
	return [fen, player_names];
}
function ari_ut16_create_staged() {
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'leo'];
	let fen = ari_setup(player_names);
	DA.staged_moves = [];
	DA.iter = 100;
	return [fen, player_names];
}
function ari_ut2_create_staged() {
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'leo'];
	let fen = ari_setup(player_names);
	arisim_stage_3(fen);
	arisim_stage_4(fen);
	DA.staged_moves = [];
	DA.iter = 100;
	return [fen, player_names];
}
function ari_ut206_create_staged() {
	console.log('*** test 206: prep double visit ***');
	DA.test.number = 206;
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'leo', 'meckele'];
	let fen = ari_setup(player_names);
	arisim_stage_3(fen);
	arisim_stage_4_all_mimi_starts(fen);
	stage_replace_hand_cards_by(fen, 'mimi', ['QSy', 'QSg']);
	stage_building(fen, fen.iturn, 'estate');
	fen.players.leo.buildings.farm = [{ list: '4Cy 4Sy 4Hy 6Dy'.split(' '), h: null }, { list: '5Cy JSy 5Sy 5Dy'.split(' '), h: null }];
	fen.phase = 'queen';
	DA.fen0 = fen;
	return [fen, player_names];
}
function ari_ut3_create_staged() {
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'leo'];
	let fen = ari_setup(player_names);
	for (const uname in fen.players) {
		let pl = fen.players[uname];
		while (!isEmpty(pl.hand)) last_elem_from_to(pl.hand, fen.deck);
	}
	fen.players.mimi.hand = 'AHb ADb 2Cb 4Cb 6Cb KCb QDb'.split(' ');
	fen.players.leo.hand = 'ACb KDb QSb ASb 2Db 4Db 6Db'.split(' ');
	fen.players.mimi.buildings.farm = [{ list: '4Cr 7Sr 4Sb 4Dr'.split(' '), h: null }];
	fen.players.leo.buildings.estate = [{ list: 'TCr 7Sr TSb TDr TDb'.split(' '), h: null }];
	fen.market = 'KSb 3Sb'.split(' ');
	arisim_stage_4(fen, 3, 2);
	DA.staged_moves = [];
	DA.iter = 100;
	return [fen, player_names];
}
function ari_ut306_create_staged() {
	console.log('*** test 306: prep double visit ***');
	DA.test.number = 306;
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'leo', 'meckele'];
	let fen = ari_setup(player_names);
	arisim_stage_3(fen);
	arisim_stage_4_all_mimi_starts(fen);
	stage_replace_hand_cards_by(fen, 'mimi', ['QSy', 'QSg']);
	stage_building(fen, fen.iturn, 'estate');
	fen.players.leo.buildings.farm = [{ list: '4Cy 4Sy 4Hy 6Dy'.split(' '), h: null }, { list: '5Cy JSy 5Sy 5Dy'.split(' '), h: null }];
	fen.phase = 'queen';
	DA.fen0 = fen;
	DA.auto_moves = [[],
	[['visit'], ['last'], [0]],
	[['visit'], ['last'], [1]],
	[['pass']],
	];
	return [fen, player_names];
}
function ari_ut4_create_staged() {
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'leo'];
	let fen = ari_setup(player_names);
	for (const uname in fen.players) {
		let pl = fen.players[uname];
		while (!isEmpty(pl.hand)) last_elem_from_to(pl.hand, fen.deck);
	}
	fen.players.mimi.hand = 'AHb ADb 2Cb 4Cb 6Cb KCb QDb'.split(' ');
	fen.players.leo.hand = 'ACb KDb QSb ASb 2Db 4Db 6Db'.split(' ');
	fen.players.mimi.buildings.farm = [{ list: '4Cr 7Sr 4Sb 4Dr'.split(' '), h: null }];
	fen.players.leo.buildings.estate = [{ list: 'TCr 7Sr TSb TDr TDb'.split(' '), h: null }];
	fen.market = 'KSb 3Sb'.split(' ');
	fen.phase = 'queen';
	fen.stage = 11;
	DA.staged_moves = [];
	DA.iter = 100;
	return [fen, player_names];
}
function ari_ut5_create_staged() {
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'leo'];
	let fen = ari_setup(player_names);
	for (const uname in fen.players) {
		let pl = fen.players[uname];
		while (!isEmpty(pl.hand)) last_elem_from_to(pl.hand, fen.deck);
	}
	fen.players.mimi.hand = 'AHb ADb 2Cb 4Cb 6Cb KCb QDb'.split(' ');
	fen.players.leo.hand = 'ACb KDb QSb ASb 2Db 4Db 6Db'.split(' ');
	fen.players.mimi.buildings.farm = [{ list: '4Cr 7Sr 4Sb 4Dr'.split(' '), h: null }];
	fen.players.leo.buildings.estate = [{ list: 'TCr 7Sr TSb TDr TDb'.split(' '), h: null }];
	fen.phase = 'jack';
	fen.stage = 3;
	DA.staged_moves = [];
	DA.iter = 100;
	return [fen, player_names];
}
function ari_ut6_create_staged() {
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'leo'];
	let fen = ari_setup(player_names);
	for (const uname in fen.players) {
		let pl = fen.players[uname];
		while (!isEmpty(pl.hand)) last_elem_from_to(pl.hand, fen.deck);
	}
	fen.players.mimi.hand = 'AHb ADb 2Cb 4Cb 6Cb KCb QDb'.split(' ');
	fen.players.leo.hand = 'ACb KDb QSb ASb 2Db 4Db 6Db'.split(' ');
	fen.players.mimi.buildings.farm = [{ list: '4Cr 7Sr 4Sb 4Dr'.split(' '), h: null }];
	fen.players.leo.buildings.estate = [{ list: 'TCr 7Sr TSb TDr TDb'.split(' '), h: null }];
	for (let i = 0; i < 3; i++) {
		top_elem_from_to(fen.deck, fen.market);
	}
	fen.phase = 'jack';
	arisim_stage_4(fen);
	DA.staged_moves = [];
	DA.iter = 100;
	return [fen, player_names];
}
function ari_ut7_create_staged() {
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'leo'];
	let fen = ari_setup(player_names);
	for (const uname in fen.players) {
		let pl = fen.players[uname];
		while (!isEmpty(pl.hand)) last_elem_from_to(pl.hand, fen.deck);
	}
	fen.players.mimi.hand = 'AHb ADb 2Cb 4Cb 6Cb QCb QDb'.split(' ');
	fen.players.leo.hand = 'ACb KDb QSb ASb 2Db 4Db 6Db'.split(' ');
	fen.players.mimi.buildings.farm = [{ list: '4Cr 7Sr 4Sb 4Dr'.split(' '), h: null }];
	fen.players.leo.buildings.estate = [{ list: 'TCr 7Sr TSb TDr TDb'.split(' '), h: null }];
	for (let i = 0; i < 3; i++) {
		top_elem_from_to(fen.deck, fen.market);
	}
	fen.phase = 'jack';
	arisim_stage_4(fen);
	DA.staged_moves = [];
	DA.iter = 100;
	return [fen, player_names];
}
function ari_ut8_create_staged() {
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'leo'];
	let fen = ari_setup(player_names);
	deck_add(fen.deck, 1, fen.players.mimi.hand); //'AHb ADb 2Cb 4Cb 6Cb QCb QDb'.split(' ');
	//deck_add(fen.deck, 2, fen.players.leo.hand); //'ACb KDb QSb ASb 2Db 4Db 6Db'.split(' ');
	fen.players.mimi.buildings.farm = [{ list: deck_deal(fen.deck, 4), h: '3Hb' }];
	fen.players.leo.buildings.farm = [{ list: deck_deal(fen.deck, 4), h: null }];
	fen.players.leo.buildings.estate = [{ list: deck_deal(fen.deck, 5), h: null }];
	fen.market = deck_deal(fen.deck, 3);
	fen.phase = 'jack';
	arisim_stage_4(fen);
	DA.staged_moves = [];
	DA.iter = 100;
	return [fen, player_names];
}
function ari_ut9_create_staged() {
	Session.cur_game = 'gAristo';
	let player_names = ['mimi', 'leo'];
	let fen = ari_setup(player_names);
	for (const uname in fen.players) {
		let pl = fen.players[uname];
		while (!isEmpty(pl.hand)) last_elem_from_to(pl.hand, fen.deck);
	}
	fen.players.mimi.hand = 'AHb ADb 2Cb 4Cb 6Cb QCb QDb'.split(' ');
	fen.players.leo.hand = 'ACb KDb QSb ASb 2Db 4Db 6Db'.split(' ');
	fen.players.mimi.buildings.farm = [{ list: '4Cr 7Sr 4Sb 4Dr'.split(' '), h: '3Hb' }];
	fen.players.leo.buildings.farm = [{ list: 'JCr JSr JSb JDr'.split(' '), h: '3Sr' }];
	fen.players.leo.buildings.estate = [{ list: 'TCr 7Sr TSb TDr TDb'.split(' '), h: null }];
	for (let i = 0; i < 3; i++) {
		top_elem_from_to(fen.deck, fen.market);
	}
	fen.phase = 'king';
	arisim_stage_4(fen);
	DA.staged_moves = [];
	DA.iter = 100;
	return [fen, player_names];
}
function arisim_stage_3(fen) {
	top_elem_from_to(fen.deck, fen.market);
	top_elem_from_to(fen.deck, fen.market);
	if (fen.phase == 'jack') top_elem_from_to(fen.deck, fen.market);
	fen.stage = 4;
}
function arisim_stage_4(fen, n_mimi = 2, n_leo = 3) {
	for (let i = 0; i < n_mimi; i++) top_elem_from_to(fen.players.mimi.hand, fen.players.mimi.stall);
	for (let i = 0; i < n_leo; i++)  top_elem_from_to(fen.players.leo.hand, fen.players.leo.stall);
	fen.stage = 5;
	let valmimi = fen.players.mimi.stall_value = arrSum(fen.players.mimi.stall.map(x => ari_get_card(x).val));
	let valleo = fen.players.leo.stall_value = arrSum(fen.players.leo.stall.map(x => ari_get_card(x).val));
	let minplayer = valmimi <= valleo ? 'mimi' : 'leo';
	fen.iturn = fen.plorder.indexOf(minplayer); fen.turn = [minplayer];
	fen.num_actions = fen.total_pl_actions = fen.players[minplayer].stall.length;
	fen.action_number = 1;
}
function arisim_stage_4_all(fen, n = 3, changeturn = true) {
	for (let i = 0; i < n; i++) top_elem_from_to(fen.players.mimi.hand, fen.players.mimi.stall);
	let others = get_keys(fen.players).filter(x => x != 'mimi');
	for (const plname of others) {
		for (let i = 0; i < n; i++)  top_elem_from_to(fen.players[plname].hand, fen.players[plname].stall);
	}
	let list = [];
	for (const plname of get_keys(fen.players)) {
		fen.players[plname].stall_value = arrSum(fen.players[plname].stall.map(x => ari_get_card(x).val));
		list.push({ uname: plname, val: fen.players[plname].stall_value });
	}
	fen.stage = 5;
	list = sortBy(list, 'val');
	let minplayer = list[0].uname;
	fen.iturn = fen.plorder.indexOf(minplayer);
	if (changeturn) fen.turn = [minplayer];
	fen.num_actions = fen.total_pl_actions = fen.players[fen.turn[0]].stall.length;
	fen.action_number = 1;
}
function arisim_stage_4_all_mimi_starts(fen, n = 3) {
	for (let i = 0; i < n; i++) top_elem_from_to(fen.players.mimi.hand, fen.players.mimi.stall);
	let others = get_keys(fen.players).filter(x => x != 'mimi');
	for (const uname of others) {
		for (let i = 0; i < n; i++)  top_elem_from_to(fen.players[uname].hand, fen.players[uname].stall);
	}
	let list = [];
	for (const uname of get_keys(fen.players)) {
		fen.players[uname].stall_value = arrSum(fen.players[uname].stall.map(x => ari_get_card(x).val));
		list.push({ uname: uname, val: fen.players[uname].stall_value });
	}
	fen.stage = 5;
	list = sortBy(list, 'val');
	let minplayer = list[0].uname;
	if (minplayer != 'mimi') {
		console.log('NOT mimi!!! minplayer', minplayer)
		let best_stall = fen.players[minplayer].stall;
		let best_stall_value = fen.players[minplayer].stall_value;
		fen.players[minplayer].stall = fen.players.mimi.stall;
		fen.players[minplayer].stall_value = fen.players.mimi.stall_value;
		fen.players.mimi.stall = best_stall;
		fen.players.mimi.stall_value = best_stall_value;
		minplayer = 'mimi';
	}
	fen.iturn = fen.plorder.indexOf(minplayer);
	fen.turn = [minplayer];
	console.assert(fen.turn == ['mimi'], 'WTF?????????????????');
	fen.num_actions = fen.total_pl_actions = fen.players[minplayer].stall.length;
	fen.action_number = 1;
}
function ferro_ut0_create_staged() {
	console.log('*** test ferro 0: buy_or_pass with no coins ***');
	DA.test.number = 0;
	let [fen, uplayer] = [o.fen, o.fen.turn[0]];
	let otherplayer = firstCond(fen.plorder, (p) => p != uplayer);
	let pl = fen.players[otherplayer];
	pl.coins = 0;
	DA.fen0 = fen;
	DA.auto_moves = [[],
	[['visit'], ['last'], [0]],
	[['visit'], ['last'], [1]],
	[['pass']],
	];
	return [fen, player_names];
}
function inno_undo_random_deal(fen) {
	for (const uname in fen.players) {
		let pl = fen.players[uname];
		last_elem_from_to(pl.hand, fen.decks.E[1]);
		last_elem_from_to(pl.hand, fen.decks.B[1]);
	}
}
function inno_ut0_create_staged() {
	Session.cur_game = 'gPreinno';
	let player_names = ['mimi', 'leo'];
	let fen = inno_setup(player_names);
	console.log('fen', fen)
	let [decks, mimi, leo] = [fen.decks, fen.players.mimi, fen.players.leo];
	let deck1 = decks.B[1]; let deck2 = decks.E[1];
	inno_undo_random_deal(fen);
	elem_from_to('agriculture', deck1, mimi.hand);
	elem_from_to('comb', deck2, mimi.hand);
	elem_from_to('metalworking', deck1, leo.hand);
	elem_from_to('soap', deck2, leo.hand);
	DA.staged_moves = ['mimi.hand.agriculture', 'leo.hand.metalworking', 'mimi.board.yellow.agriculture', 'mimi.hand.comb',
		'leo.board.red.metalworking', 'leo.board.red.metalworking', 'mimi.board.yellow.agriculture', 'pass', 'mimi.board.yellow.agriculture', 'pass'];
	DA.iter = 100;
	return [fen, player_names];
}
function inno_ut1_create_staged() {
	console.log('*** TEST: activate agriculture ***');
	Session.cur_game = 'gPreinno';
	let player_names = ['mimi', 'leo'];
	let fen = inno_setup(player_names);
	let [decks, mimi, leo] = [fen.decks, fen.players.mimi, fen.players.leo];
	let deck1 = decks.B[1]; let deck2 = decks.E[1];
	inno_undo_random_deal(fen);
	elem_from_to('agriculture', deck1, mimi.hand);
	elem_from_to('comb', deck2, mimi.hand);
	elem_from_to('metalworking', deck1, leo.hand);
	elem_from_to('soap', deck2, leo.hand);
	DA.staged_moves = ['mimi.hand.agriculture', 'leo.hand.metalworking', 'mimi.board.yellow.agriculture', 'mimi.hand.comb'];
	DA.iter = 13;
	return [fen, player_names];
}
function inno_ut10_create_staged() {
	Session.cur_game = 'gPreinno';
	let player_names = ['mimi', 'leo'];
	let fen = inno_setup(player_names);
	let [decks, mimi, leo] = [fen.decks, fen.players.mimi, fen.players.leo];
	let deck1 = decks.B[1]; let deck2 = decks.E[1];
	inno_undo_random_deal(fen);
	elem_from_to('agriculture', deck1, mimi.hand);
	elem_from_to('comb', deck2, mimi.hand);
	elem_from_to('metalworking', deck1, leo.hand);
	elem_from_to('soap', deck2, leo.hand);
	DA.staged_moves = ['mimi.hand.agriculture', 'leo.hand.metalworking', 'draw', 'draw', 'draw', 'draw'];
	DA.iter = 100;
	return [fen, player_names];
}
function inno_ut11_create_staged() {
	Session.cur_game = 'gPreinno';
	let player_names = ['mimi', 'leo'];
	let fen = inno_setup(player_names);
	let [decks, mimi, leo] = [fen.decks, fen.players.mimi, fen.players.leo];
	let deck1 = decks.B[1]; let deck2 = decks.E[1];
	inno_undo_random_deal(fen);
	elem_from_to('agriculture', deck1, mimi.hand);
	elem_from_to('comb', deck2, mimi.hand);
	elem_from_to('metalworking', deck1, leo.hand);
	elem_from_to('soap', deck2, leo.hand);
	DA.staged_moves = ['mimi.hand.agriculture', 'leo.hand.metalworking', 'draw', 'draw', 'draw', 'draw', 'meld', 'meld', 'draw', 'draw', 'meld', 'meld'];
	DA.iter = 100;
	return [fen, player_names];
}
function inno_ut12_create_staged() {
	console.log('*** TEST: activate code_of_laws ***');
	Session.cur_game = 'gPreinno';
	let player_names = ['mimi', 'leo'];
	let fen = inno_setup(player_names);
	let [decks, mimi, leo] = [fen.decks, fen.players.mimi, fen.players.leo];
	let deck1 = decks.B[1]; let deck2 = decks.E[1];
	inno_undo_random_deal(fen);
	elem_from_to('code_of_laws', deck1, mimi.hand);
	elem_from_to('puppet', deck2, mimi.hand);
	elem_from_to('sailing', deck1, leo.hand);
	elem_from_to('soap', deck2, leo.hand);
	DA.staged_moves = ['mimi.hand.code_of_laws', 'leo.hand.sailing', 'mimi.board.purple.code_of_laws', 'leo.hand.soap', 'mimi.hand.puppet'];
	DA.iter = 100;
	return [fen, player_names];
}
function inno_ut2_create_staged() {
	Session.cur_game = 'gPreinno';
	let player_names = ['mimi', 'leo'];
	let fen = inno_setup(player_names);
	let [decks, mimi, leo] = [fen.decks, fen.players.mimi, fen.players.leo];
	let deck1 = decks.B[1]; let deck2 = decks.E[1];
	inno_undo_random_deal(fen);
	elem_from_to('agriculture', deck1, mimi.hand);
	elem_from_to('comb', deck2, mimi.hand);
	elem_from_to('metalworking', deck1, leo.hand);
	elem_from_to('soap', deck2, leo.hand);
	DA.staged_moves = ['mimi.hand.agriculture', 'leo.hand.metalworking'];
	DA.iter = 100;
	return [fen, player_names];
}
function inno_ut3_create_staged() {
	Session.cur_game = 'gPreinno';
	let player_names = ['mimi', 'leo', 'felix', 'amanda'];
	let fen = inno_setup(player_names);
	let [decks, mimi, leo, felix, amanda] = [fen.decks, fen.players.mimi, fen.players.leo, fen.players.felix, fen.players.amanda];
	let deck1 = decks.B[1]; let deck2 = decks.E[1];
	inno_undo_random_deal(fen);
	elem_from_to('wheel', deck1, mimi.hand);
	elem_from_to('comb', deck2, mimi.hand);
	elem_from_to('metalworking', deck1, leo.hand);
	elem_from_to('soap', deck2, leo.hand);
	elem_from_to('agriculture', deck1, felix.hand);
	elem_from_to('chopsticks', deck2, felix.hand);
	elem_from_to('pottery', deck1, amanda.hand);
	elem_from_to('dice', deck2, amanda.hand);
	DA.staged_moves = ['mimi.hand.wheel', 'leo.hand.metalworking', 'felix.hand.agriculture', 'amanda.hand.dice'];
	DA.iter = 100;
	return [fen, player_names];
}
function inno_ut4_create_staged() {
	console.log('*** TEST: sharing agriculture ***');
	Session.cur_game = 'gPreinno';
	let player_names = ['mimi', 'leo', 'felix'];
	let fen = inno_setup(player_names);
	let [decks, mimi, leo, felix] = [fen.decks, fen.players.mimi, fen.players.leo, fen.players.felix];
	let deck1 = decks.B[1]; let deck2 = decks.E[1];
	inno_undo_random_deal(fen);
	elem_from_to('pottery', deck1, mimi.hand);
	elem_from_to('comb', deck2, mimi.hand);
	elem_from_to('metalworking', deck1, leo.hand);
	elem_from_to('soap', deck2, leo.hand);
	elem_from_to('agriculture', deck1, felix.hand);
	elem_from_to('chopsticks', deck2, felix.hand);
	DA.staged_moves = ['mimi.hand.pottery', 'leo.hand.soap', 'felix.hand.agriculture'];
	DA.iter = 100;
	return [fen, player_names];
}
function inno_ut5_create_staged() {
	console.log('*** TEST: sharing metalworking ***');
	Session.cur_game = 'gPreinno';
	let player_names = ['mimi', 'leo', 'felix'];
	let fen = inno_setup(player_names);
	let [decks, mimi, leo, felix] = [fen.decks, fen.players.mimi, fen.players.leo, fen.players.felix];
	let deck1 = decks.B[1]; let deck2 = decks.E[1];
	inno_undo_random_deal(fen);
	elem_from_to('wheel', deck1, mimi.hand);
	elem_from_to('comb', deck2, mimi.hand);
	elem_from_to('metalworking', deck1, leo.hand);
	elem_from_to('soap', deck2, leo.hand);
	elem_from_to('agriculture', deck1, felix.hand);
	elem_from_to('chopsticks', deck2, felix.hand);
	DA.staged_moves = ['mimi.hand.wheel', 'leo.hand.metalworking', 'felix.hand.agriculture', 'draw.decks.B.1'];
	DA.iter = 100;
	return [fen, player_names];
}
function inno_ut6_create_staged() {
	console.log('*** TEST: draw ***');
	Session.cur_game = 'gPreinno';
	let player_names = ['mimi', 'leo'];
	let fen = inno_setup(player_names);
	let [decks, mimi, leo] = [fen.decks, fen.players.mimi, fen.players.leo];
	let deck1 = decks.B[1]; let deck2 = decks.E[1];
	inno_undo_random_deal(fen);
	elem_from_to('wheel', deck1, mimi.hand);
	elem_from_to('comb', deck2, mimi.hand);
	elem_from_to('metalworking', deck1, leo.hand);
	elem_from_to('soap', deck2, leo.hand);
	DA.staged_moves = ['mimi.hand.wheel', 'leo.hand.soap'];
	DA.iter = 100;
	return [fen, player_names];
}
function inno_ut7_create_staged() {
	console.log('*** TEST: draw 2 ***');
	Session.cur_game = 'gPreinno';
	let player_names = ['mimi', 'leo'];
	let fen = inno_setup(player_names);
	let [decks, mimi, leo] = [fen.decks, fen.players.mimi, fen.players.leo];
	let deck1 = decks.B[1]; let deck2 = decks.E[1];
	inno_undo_random_deal(fen);
	elem_from_to('wheel', deck1, mimi.hand);
	elem_from_to('comb', deck2, mimi.hand);
	elem_from_to('metalworking', deck1, leo.hand);
	elem_from_to('soap', deck2, leo.hand);
	DA.staged_moves = ['mimi.hand.wheel', 'leo.hand.soap', 'decks.E.1', 'decks.B.1', 'decks.B.1'];
	DA.iter = 100;
	return [fen, player_names];
}
function inno_ut8_create_staged() {
	console.log('*** TEST: splay up ***');
	Session.cur_game = 'gPreinno';
	let player_names = ['mimi', 'leo'];
	let fen = inno_setup(player_names);
	let [decks, mimi, leo] = [fen.decks, fen.players.mimi, fen.players.leo];
	let deck1 = decks.B[1]; let deck2 = decks.E[1];
	inno_undo_random_deal(fen);
	elem_from_to('agriculture', deck1, mimi.hand);
	elem_from_to('comb', deck2, mimi.hand);
	elem_from_to('metalworking', deck1, leo.hand);
	elem_from_to('puppet', deck2, leo.hand);
	elem_from_to('chopsticks', deck2, mimi.board.yellow);
	elem_from_to('soap', deck2, mimi.board.yellow);
	elem_from_to('fermenting', decks.B[2], mimi.board.yellow);
	fen.players.mimi.splays.yellow = 3;
	DA.iter = 100;
	return [fen, player_names];
}
function inno_ut9_create_staged() {
	console.log('*** TEST: splay complex ***');
	Session.cur_game = 'gPreinno';
	let player_names = ['mimi', 'leo'];
	let fen = inno_setup(player_names);
	let [decks, mimi, leo] = [fen.decks, fen.players.mimi, fen.players.leo];
	let deck1 = decks.B[1]; let deck2 = decks.E[1];
	inno_undo_random_deal(fen);
	elem_from_to('agriculture', deck1, mimi.hand);
	elem_from_to('comb', deck2, mimi.hand);
	elem_from_to('metalworking', deck1, leo.hand);
	elem_from_to('puppet', deck2, leo.hand);
	let mydeck1 = decks.B[1].map(x => ({ key: x, deck: decks.B[1] }));
	let mydeck2 = decks.B[2].map(x => ({ key: x, deck: decks.B[2] }));
	let mydeck3 = decks.B[3].map(x => ({ key: x, deck: decks.B[3] }));
	let mydecks = mydeck1.concat(mydeck2).concat(mydeck3);
	for (const x of mydecks) { elem_from_to(x.key, x.deck, mimi.board[inno_get_cardinfo(x.key).color]); }
	fen.players.mimi.splays.blue = 3;
	fen.players.mimi.splays.red = 0;
	fen.players.mimi.splays.green = 1;
	fen.players.mimi.splays.yellow = 2;
	fen.players.mimi.splays.purple = 2;
	DA.iter = 100;
	return [fen, player_names];
}
function stage_building(fen, i_pl, type) {
	let n = type == 'chateau' ? 6 : type == 'estate' ? 5 : 4;
	let plname = fen.plorder[i_pl];
	lookupSet(fen.players[plname], ['buildings', type], []);
	let building = { list: deck_deal(fen.deck, n), h: null, type: type, schweine: [] };
	building.lead = building.list[0];
	fen.players[plname].buildings[type].push(building);
	return building;
}
function stage_building_new(fen, i_pl, type, n_openschwein, n_closedschwein) {
	let n = type == 'chateau' ? 6 : type == 'estate' ? 5 : 4;
	let plname = fen.plorder[i_pl];
	lookupSet(fen.players[plname], ['buildings', type], []);
	let building = { list: deck_deal(fen.deck, 1), h: null, type: type, schweine: [] };
	let k = building.lead = building.list[0];
	let other = k[0] == 'Q' ? '2' : 'Q';
	let i, j;
	for (i = 1; i <= n_openschwein; i++) { building.schweine.push(i); building.list.push(other + rSuit('CSHD') + 'n'); }
	for (j = 1; j <= n_closedschwein; j++) { building.list.push(other + rSuit('CSHD') + 'n'); }
	while (building.list.length < n) { building.list.push(k); j++; }
	fen.players[plname].buildings[type].push(building);
	return building;
}
function stage_correct_buildings(fen, o) {
	let ranks = toLetters('A23456789TJQK');
	let irank = 0;
	for (const uname in o) {
		let pl = fen.players[uname];
		let bo = pl.buildings;
		let dinums = o[uname];
		for (const type in dinums) {
			let n = dinums[type];
			for (let i = 0; i < n; i++) {
				let r = ranks[irank]; irank++;
				let s = type == 'farm' ? `${r}Cn ${r}Sn ${r}Sn ${r}Dn` :
					type == 'estate' ? `${r}Cn ${r}Sn ${r}Sn ${r}Dn ${r}Cn` : `${r}Cn ${r}Sn ${r}Sn ${r}Dn ${r}Cn ${r}Hn`;
				bo[type].push({ list: s.split(' '), h: null });
			}
		}
	}
}
function test_engine_run_next(list) {
	if (nundef(list)) {
		list = DA.test.list = arrRange(100, DA.test.number - 1);
	}
	if (isEmpty(list)) {
		console.log('*** all tests finished ***');
		DA.test.suiteRunning = DA.test.running = false;
		shield_off();
		return;
	}
	let n = list.shift();
	DA.test.iter = 0;
	onclick_ut_n('ari', n);
}
function verify_unit_test(otree) {
	if (isdef(DA.verify) && DA.test.iter == DA.iter_verify) {
		DA.test.running = false;
		let res = DA.verify(otree);
		console.log('***UNIT TEST ' + DA.test.number, res ? 'passed...' : 'FAILED!!!!!!!!!!!!!!!!');
		console.assert(res, '*** _ TEST FAIL ***')
		if (DA.test.suiteRunning) test_engine_run_next(DA.test.list);
	}
	return true;
}
//#endregion sim

