const CODE = {
	paths: [],
	funcs: {},
	consts: {},
	index: [],
};
const RED = '#e6194B';
var Syms;
var SymKeys;
var ByGroupSubgroup;
var Info;
var KeySets;
var DB;
var NODEJS;
var C52;
var c52;
var Config;
var words;
var SERVER = 'localhost';
var PORT = 3000;
var SERVERURL;
var LIVE_SERVER;
var TESTING = false;
var SINGLECLIENT;
var Socket = null;
var dFiddle;
var A;
var T;
var Q;
var S = {};
var C = null;
var C52Cards;
var Z;
var lastUpdate = 0;
var ball;
var Categories;
var palette = null;
var DA = {};
var radius = 32;
var view = null;
async function _start() {
	set_run_state_no_server();
	onpagedeactivated(() => { saveEnv(); dbSave(); });
	await load_syms();
	await load_db();
	let dicode = CODE.di = await route_path_yaml_dict('../y/z_all.yaml');
	let kwindow = get_keys(window);
	test100();
}
function addIf(arr, el) { if (!arr.includes(el)) arr.push(el); }
function arrChildren(elem) { return [...toElem(elem).children]; }
function assertion(cond) {
	if (!cond) {
		let args = [...arguments];
		for (const a of args) {
			console.log('\n', a);
		}
		throw new Error('TERMINATING!!!')
	}
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
function createcircle(posx, posy, radius, stroke, fill, filter) {
	var circle = document.createElementNS(svgns, "circle");
	circle.setAttributeNS(null, "id", "c" + circles);
	circle.setAttributeNS(null, "cx", posx);
	circle.setAttributeNS(null, "cy", posy);
	circle.setAttributeNS(null, "r", radius);
	circle.setAttributeNS(null, "stroke-width", stroke);
	circle.setAttributeNS(null, "fill", fill);
	circle.setAttributeNS(null, "filter", filter);
	circle.setAttributeNS(null, "data-posx", posx);
	svg.appendChild(circle);
}
function dbSave() {
	if (NODEJS) {
		let route = `/post/json`;
		let o = { filename: 'db', data: DB }
		let callback = () => console.log('saved db');
		post_json(route, o, callback);
		console.log('full route', route);
	} else console.log('not saved - no app running!')
}
function download(jsonObject, fname) {
	json_str = JSON.stringify(jsonObject);
	saveFile(fname + '.json', 'data:application/json', new Blob([json_str], { type: '' }));
}
function downloadAsText(s, filename, ext = 'txt') {
	saveFileAtClient(
		filename + "." + ext,
		"data:application/text",
		new Blob([s], { type: "" }));
}
function fiddleSave() {
	if (isdef(dFiddle)) {
		let codelist = arrChildren(dFiddle).slice(1).filter(x => !isEmptyOrWhiteSpace(x.value)).map(x => x.value);
		localStorage.setItem('codelist', JSON.stringify(codelist));
		lookupSetOverride(DB, ['env', 'fiddle'], codelist);
	} else console.log('fiddle closed - not saved')
}
function get_keys(o) { return Object.keys(o); }
function getAnimals() {
	let gr = 'Animals & Nature';
	let result = [];
	for (const sg in ByGroupSubgroup[gr]) {
		if (startsWith(sg, 'anim')) result = result.concat(ByGroupSubgroup[gr][sg]);
	}
	return result;
}
function getFunctionSignature(firstline, key) {
	let sig;
	if (firstline.includes(') {')) sig = stringBefore(firstline, ') {') + ')';
	else if (firstline.includes('){')) sig = stringBefore(firstline, '){') + ')';
	else sig = `function ${key}()`;
	sig += '{}';
	return sig;
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
function getObjectFromWindow(key) {
	let code, sig, type;
	let f = window[key];
	if (typeof f != 'function') return null;
	code = f.toString();
	sig = getFunctionSignature(stringBefore(code, '\n'), key);
	type = 'func';
	let o = { name: key, code: code, sig: sig, region: type, filename: '', path: '', type: type };
	CODE.justcode[key] = code;
	CODE.all[key] = CODE.di[type][key] = o;
	return o;
}
function intersection(arr1, arr2) {
	let res = [];
	for (const a of arr1) {
		if (arr2.includes(a)) {
			addIf(res, a);
		}
	}
	return res;
}
function isdef(x) { return x !== null && x !== undefined; }
function isEmpty(arr) {
	return arr === undefined || !arr
		|| (isString(arr) && (arr == 'undefined' || arr == ''))
		|| (Array.isArray(arr) && arr.length == 0)
		|| Object.entries(arr).length === 0;
}
function isEmptyOrWhiteSpace(s) { return isEmpty(s.trim()); }
function isLetter(s) { return /^[a-zA-Z]$/i.test(s); }
function isList(arr) { return Array.isArray(arr); }
function isNumber(x) { return x !== ' ' && x !== true && x !== false && isdef(x) && (x == 0 || !isNaN(+x)); }
function isString(param) { return typeof param == 'string'; }
function last(arr) {
	return arr.length > 0 ? arr[arr.length - 1] : null;
}
async function load_db() { DB = await route_path_yaml_dict('../y/db.yaml'); Config = DB; }
async function load_syms(path) {
	if (nundef(path)) path = '../base/assets/';
	Syms = await route_path_yaml_dict(path + 'allSyms.yaml');
	SymKeys = Object.keys(Syms);
	ByGroupSubgroup = await route_path_yaml_dict(path + 'symGSG.yaml');
	KeySets = getKeySets();
	Info = await route_path_yaml_dict(path + 'lists/info.yaml');
	C52 = await route_path_yaml_dict(path + 'c52.yaml');
	create_card_assets_c52();
	assertion(Syms, 'Syms undefined!');
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
function mBy(id) { return document.getElementById(id); }
function nundef(x) { return x === null || x === undefined; }
function onpagedeactivated(handler) {
	document.addEventListener('visibilitychange',
		() => {
			console.log('visibilityState', document.visibilityState);
			if (document.visibilityState !== 'visible') handler();
		});
}
function post_json(url, o, callback) {
	fetch(url, {
		method: 'POST',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(o)
	}).then(response => response.json()).then(response => callback(response));
}
async function route_path_yaml_dict(url) {
	let data = await fetch(url);
	let text = await data.text();
	let dict = jsyaml.load(text);
	return dict;
}
function saveEnv() {
	fiddleSave();
}
function saveFile(name, type, data) {
	if (data != null && navigator.msSaveBlob) return navigator.msSaveBlob(new Blob([data], { type: type }), name);
	var a = $("<a style='display: none;'/>");
	var url = window.URL.createObjectURL(new Blob([data], { type: type }));
	a.attr('href', url);
	a.attr('download', name);
	$('body').append(a);
	a[0].click();
	setTimeout(function () {
		window.URL.revokeObjectURL(url);
		a.remove();
	}, 500);
}
function saveFileAtClient(name, type, data) {
	if (data != null && navigator.msSaveBlob) return navigator.msSaveBlob(new Blob([data], { type: type }), name);
	let a = document.createElement('a');
	a.style.display = 'none';
	let url = window.URL.createObjectURL(new Blob([data], { type: type }));
	a.href = url;
	a.download = name;
	document.body.appendChild(a);
	simulateClick(a);
	setTimeout(function () {
		window.URL.revokeObjectURL(url);
		a.remove();
	}, 500);
}
function set_run_state(singleclient = true, sockets = false, port = 3000, localhost = true, testing = true, liveserver = true, nodejs = true) {
	SERVER = localhost ? '127.0.0.1' : '216.250.112.218';
	PORT = port;
	SERVERURL = `http:/` + `${SERVER}:${PORT}`;
	NODEJS = nodejs;
	LIVE_SERVER = liveserver;
	TESTING = testing;
	SINGLECLIENT = singleclient;
	if (sockets) {
		Socket = liveserver ? io(SERVERURL) : io();
		Socket.on('message', x => console.log('got message', x));
		Socket.on('disconnect', x => console.log('got disconnect', x));
		Socket.on('update', x => console.log('got update', x));
	}
	console.log('SERVER:' + SERVERURL, 'LIVE:' + LIVE_SERVER, 'Socket:' + Socket, TESTING ? 'TESTING' : '', SINGLECLIENT ? 'SINGLE' : '');
}
function set_run_state_local() {
	set_run_state(true, false, 3000, true, false, true, true);
}
function set_run_state_no_server() {
	set_run_state(true, false, 3000, true, true, true, false);
}
function set_run_state_vps() {
	set_run_state(false, false, 3000, false, false, false, true);
}
function simulateClick(elem) {
	var evt = new MouseEvent('click', { bubbles: true, cancelable: true, view: window });
	var canceled = !elem.dispatchEvent(evt);
}
function sortCaseInsensitive(list) {
	list.sort((a, b) => { return a.toLowerCase().localeCompare(b.toLowerCase()); });
	return list;
}
function startsWith(s, sSub) {
	return s.substring(0, sSub.length) == sSub;
}
function stringBefore(sFull, sSub) {
	let idx = sFull.indexOf(sSub);
	if (idx < 0) return sFull;
	return sFull.substring(0, idx);
}
function test() {
	for (i = 0; i < 10; i++) {
		circles += 1;
		createcircle((i * w / 10), "50%", "100", "0", "hsla(" + (i * 36) + ",100%,50%,0.5)", "url(#f" + circles + ")"); createfilter("-50%", "-50%", "200%", "200%", ["feGaussianBlur"], ["stdDeviation", "5"]);
	}
}
function test100() {
	let keys = {};
	for (const k in CODE.di) { for (const k1 in CODE.di[k]) keys[k1] = CODE.di[k][k1]; }
	CODE.all = keys;
	CODE.keylist = Object.keys(keys)
	let inter = intersection(Object.keys(keys), Object.keys(window));
	let done = {};
	let tbd = ['_start'];
	let MAX = 1007, i = 0;
	let alltext = '';
	while (!isEmpty(tbd)) {
		if (++i > MAX) break;
		let sym = tbd[0];
		let o = CODE.all[sym];
		if (nundef(o)) o = getObjectFromWindow(sym);
		if (o.type != 'func') { tbd.shift(); lookupSet(done, [o.type, sym], o); continue; }
		let olive = window[sym];
		if (nundef(olive)) { tbd.shift(); lookupSet(done, [o.type, sym], o); continue; }
		let text = olive.toString();
		if (!isEmpty(text)) alltext += text + '\r\n';
		let words = toWords(text, true);
		for (const w of words) {
			if (nundef(done[w]) && w != sym && isdef(CODE.all[w])) addIf(tbd, w);
		}
		tbd.shift();
		lookupSet(done, [o.type, sym], o);
	}
	let tres = '';
	for (const k of ['const', 'var', 'cla', 'func']) {
		console.log('done', k, done[k])
		let o = done[k]; if (nundef(o)) continue;
		let klist = get_keys(o);
		if (k == 'func') klist = sortCaseInsensitive(klist);
		for (const k1 of klist) {
			if (isLetter(k1) && k1 == k1.toLowerCase()) continue;
			let code = CODE.justcode[k1];
			if (!isEmptyOrWhiteSpace(code)) tres += code;
		}
	}
}
function toElem(d) { return isString(d) ? mBy(d) : d; }
function toLetters(s) { return [...s]; }
function toWords(s, allow_ = false) {
	let arr = allow_ ? s.split(/[\W]+/) : s.split(/[\W|_]+/);
	return arr.filter(x => !isEmpty(x));
}
function trim(str) {
	return str.replace(/^\s+|\s+$/gm, '');
}
function update(time) {
	var t = time - lastUpdate;
	lastUpdate = time;
	ball.update(t);
	ai.update();
	requestAnimationFrame(update);
}
