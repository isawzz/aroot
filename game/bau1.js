
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

function test100() {

	let keys = {};
	for (const k in CODE.di) { for (const k1 in CODE.di[k]) keys[k1] = CODE.di[k][k1]; }
	CODE.all = keys;

	CODE.keylist = Object.keys(keys)
	//console.log('keys',CODE.keylist);

	let inter = intersection(Object.keys(keys), Object.keys(window));
	//console.log('intersection',inter);

	//7748 in intersection, also ca 400 jeweils extra, ergibt total of 8500 keys ca.

	let done = {};
	let tbd = ['_start']; //,'test100'];

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

		let words = toWords(text, true); //console.log('words', words);

		for (const w of words) {
			if (nundef(done[w]) && w != sym && isdef(CODE.all[w])) addIf(tbd, w);
		}
		tbd.shift();
		lookupSet(done, [o.type, sym], o); //done[sym] = o;
	}

	//console.log('_______________after', i, 'iter:')
	//console.log('done', done); //Object.keys(done));
	//console.log('tbd', tbd);

	let tres = '';
	for (const k of ['const', 'var', 'cla', 'func']) {
		console.log('done', k, done[k])
		let o = done[k]; if (nundef(o)) continue;
		let klist = get_keys(o);
		if (k == 'func') klist = sortCaseInsensitive(klist);
		for (const k1 of klist) { //in done[k]) {
			if (isLetter(k1) && k1 == k1.toLowerCase()) continue;
			let code = CODE.justcode[k1];
			//console.log('type',k,'key',k1,'code',code)
			if (!isEmptyOrWhiteSpace(code)) tres += code + '\r\n';
		}
	}
	//console.log('result',tres);
	//downloadAsText(tres, 'mycode', 'js');
}



















