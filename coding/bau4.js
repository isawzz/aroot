function _NO_computeClosure(symlist) {
  let keys = {};
  for (const k in CODE.di) { for (const k1 in CODE.di[k]) keys[k1] = CODE.di[k][k1]; }
  CODE.all = keys;
  CODE.keylist = Object.keys(keys)
  // let inter = intersection(Object.keys(keys), Object.keys(window));
  let done = {};
  let tbd = valf(symlist, ['start']);
  let MAX = 1007, i = 0;
  //let alltext = '';
  while (!isEmpty(tbd)) {
    if (++i > MAX) break;
    let sym = tbd[0];
		console.log('sym',sym)
    let o = CODE.all[sym];
		console.log('o',o)
    if (nundef(o)) o = getObjectFromWindow(sym);
		if (nundef(o)) {console.log('not',sym);removeInPlace(tbd,sym);continue;}
    if (o.type == 'var' && !o.name.startsWith('d') && o.name == o.name.toLowerCase()) { tbd.shift(); continue; }
    if (o.type != 'func') { tbd.shift(); lookupSet(done, [o.type, sym], o); continue; }
    let olive = window[sym];
    if (nundef(olive)) { tbd.shift(); lookupSet(done, [o.type, sym], o); continue; }
    let text = olive.toString();
		//console.log('text',text)
    //if (!isEmpty(text)) alltext += text + '\r\n';
    let words = toWords(text, true);
    words = words.filter(x => text.includes(' ' + x));
		//console.log('words',words)
    for (const w of words) {
      if (nundef(done[w]) && w != sym && (isdef(window[w]) || isdef(CODE.all[w]))) addIf(tbd, w);
    }
    tbd.shift();
    lookupSet(done, [o.type, sym], o);
  }

	console.log('done',done);
	return done;

  let tres = '';
  for (const k of ['const', 'var', 'cla', 'func']) {
    console.log('done', k, done[k])
    let o = done[k]; if (nundef(o)) continue;
    let klist = get_keys(o);
    if (k == 'func') klist = sortCaseInsensitive(klist);
    for (const k1 of klist) {
      let code = CODE.justcode[k1];
      if (!isEmptyOrWhiteSpace(code)) tres += code + '\r\n';
    }
  }
}
function ___BAD___computeClosure(keysOrText = []) {
	if (nundef(keysOrText)) keysOrText=['start']
	let done = {};
	let tbd = isList(keysOrText) ? keysOrText : extractKeywords(keysOrText);

	let MAX = 1007, i = 0;
	while (!isEmpty(tbd)) {
		if (++i > MAX) break;

		let sym = tbd[0];
		let o = CODE.all[sym];
		if (nundef(o)) o = getObjectFromWindow(sym);

		if (!o) { tbd.shift(); continue; } //window[sym] is NOT a function type

		o.code = nundef(CODE.all[sym]) ? o.toString() : CODE.justcode[sym];
		o.history = CODE.history[sym];

		let text = o.code.trim();
		let words = toWords(text, true); //console.log('words', words);
		//words = words.filter(x=>text.includes(' '+x));
		for (const w of words) {
			if (nundef(done[w]) && w != sym && isdef(CODE.all[w])) addIf(tbd, w);
		}
		tbd.shift();

		lookupSet(done, [o.type, sym], o); //done[sym] = o;
	}

	return done;
	//console.log('_______________after', i, 'iter:')
	//console.log('done', done); //Object.keys(done));
	//console.log('tbd', tbd);

	let tres = '';
	for (const k of ['const', 'var', 'cla', 'func']) {
		console.log('done', k, done[k])
		let o = done[k]; if (nundef(o)) continue;
		let klist = get_keys(o);
		if (k == 'func') klist = sortCaseInsensitive(klist);
		else if (k == 'cla') klist = sortClassKeys(done);
		else if (k == 'const') klist = sortConstKeys(done).map(x => x.key);
		for (const k1 of klist) { //in done[k]) {
			//if (isLetter(k1) && k1 == k1.toLowerCase()) continue;
			let code = CODE.justcode[k1];
			//console.log('type',k,'key',k1,'code',code)
			if (!isEmptyOrWhiteSpace(code)) tres += code + '\r\n';
		}
	}

	return done;
	//console.log('result',tres);
	//downloadAsText(tres, 'mycode', 'js');
}
