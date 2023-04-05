function isCodeWord(w) {
	return isdef(window[w]) || isdef(CODE.all[w])
}
function computeClosure(symlist) {
	let keys = {};
	for (const k in CODE.di) { for (const k1 in CODE.di[k]) keys[k1] = CODE.di[k][k1]; }
	CODE.all = keys;
	CODE.keylist = Object.keys(keys)
	let done = {};
	let tbd = valf(symlist, ['start']);
	let MAX = 1000000, i = 0;
	let visited = {};
	while (!isEmpty(tbd)) {
		if (++i > MAX) break; //else console.log('i',i)
		let sym = tbd[0];
		if (isdef(visited[sym])) { tbd.shift(); continue; }
		visited[sym] = true;
		let o = CODE.all[sym];
		if (nundef(o)) o = getObjectFromWindow(sym);
		if (nundef(o)) { tbd.shift(); continue; }
		if (o.type == 'var' && !o.name.startsWith('d') && o.name == o.name.toLowerCase()) { tbd.shift(); continue; }
		if (o.type == 'var' || o.type == 'const') { tbd.shift(); lookupSet(done, [o.type, sym], o); continue; }

		assertion(['cla', 'func'].includes(o.type), 'TYPE ERRROR!!!!!!!!!!!!!!!!!!!!!!!!!')

		//at this point *** sym is a func or class!!! ***
		let olive = valf(window[sym],o.code);
		//if (sym == 'write_code_text_file') console.log('still here')
		if (nundef(olive)) { tbd.shift(); lookupSet(done, [o.type, sym], o); continue; }
		//if (sym == 'write_code_text_file') console.log('still here')

		let text = olive.toString(); //always using last function body!!!
		let words = toWords(text, true);

		//words = words.filter(x => text.includes(' ' + x) || text.includes(x + '(')  || text.includes(x + ','));
		//console.log('words',words)
		//if (sym == 'compute_closure') console.log('', sym, words)

		for (const w of words) { if (nundef(done[w]) || nundef(visited[w]) && w != sym && isCodeWord(w)) addIf(tbd, w); }
		tbd.shift();

		//if (sym == 'write_code_text_file') console.log('still here',o.code)
		//done[sym] = o; //
		lookupSet(done, [o.type, sym], o);
	}

	//console.log('done',done);
	return done;
}
