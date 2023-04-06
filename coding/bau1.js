function compute_closure(code) {
	if (nundef(code)) code = AU.ta.value;
	let disub = CODE.closure = computeClosure();
	let keylist = [];
	for (const type of ['const', 'var', 'cla', 'func']) {
		//let klist = sortCaseInsensitive(get_keys(disub[type]));
		if (nundef(disub[type])) continue;
		let knownkeys = CODE.keysSorted.filter(x => lookup(disub, [type, x]));
		let extras = sortCaseInsensitive(get_keys(disub[type]).filter(x => !knownkeys.includes(x)));
		keylist = keylist.concat(knownkeys).concat(extras);
	}

	//console.log(keylist.includes('write_code_text_file'));
	console.log('duplicates',hasDuplicates(keylist))
	write_code_text_file(keylist);
}
function getLiveKeys(list){
	return list.filter(x=>isLiveInBrowser(x));
}
function isLiveInBrowser(s){
	if (isdef(window[s])) return true;
	try{
		console.log('have to eval!!!',s)
		let res=eval(s);
		return isdef(res);
	}catch{
		return false;
	}
	return false;
}
function hasDuplicates(list){
	let res=[];
	for(let i=0;i<list.length;i++){
		for(let j=i+1;j<list.length;j++){
			if (list[i]==list[j]){res.push(list[i])}
		}
	}
	return res.length>0?res:false;
}
function computeClosure(symlist) {
	let keys = {};
	for (const k in CODE.di) { for (const k1 in CODE.di[k]) keys[k1] = CODE.di[k][k1]; }
	CODE.all = keys;
	CODE.keylist = Object.keys(keys)
	let done = {};
	let tbd = valf(symlist, ['start']);
	let MAX = 1000000, i = 0;
	let visited = { grid: true, jQuery: true, config: true, Number: true, sat: true, hallo: true, autocomplete: true, PI: true };
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
		let olive = valf(window[sym], o.code);
		//if (sym == 'write_code_text_file') console.log('still here')
		if (nundef(olive)) { tbd.shift(); lookupSet(done, [o.type, sym], o); continue; }
		//if (sym == 'write_code_text_file') console.log('still here')

		let text = olive.toString(); //always using last function body!!!
		let words = toWords(text, true);

		if (words.includes('in' + 'it')) console.log('sym', sym)
		//if (words.includes('gr'+'id')) console.log('sym',sym)
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

























