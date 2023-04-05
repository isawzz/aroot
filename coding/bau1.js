function compute_closure(code) {
	if (nundef(code)) code = AU.ta.value;
	let disub = CODE.closure = computeClosure();
	let keylist = [];
	for (const type of ['const','var','cla','func']) {
		//let klist = sortCaseInsensitive(get_keys(disub[type]));
		
		let knownkeys = CODE.keysSorted.filter(x => isdef(disub[type][x]));
		let extras = sortCaseInsensitive(get_keys(disub[type]).filter(x => !knownkeys.includes(x)));
		keylist = keylist.concat(knownkeys).concat(extras);
	}

	console.log(keylist.includes('write_code_text_file'));
	write_code_text_file(keylist);
}
function write_code_text_file(keylist) {
	let text = '';
	for (const k of keylist) {
		let o = lookup(CODE, ['all', k]);
		let type, code;
		type = isdef(o) ? o.type : null;
		if (type == 'var') { code = CODE.justcode[k]; }
		else if (type == 'const') { code = CODE.justcode[k]; }
		else if (type == 'cla') { code = CODE.justcode[k]; }
		else if (type == 'func') { code = isdef(window[k]) ? window[k].toString() : CODE.justcode[k]; }
		else { code = window[k].toString(); }
		// else if (!OWNPROPS.includes(k)) { code = window[k].toString(); }
		// else code = '';
		// assertion(!code.includes('[native code]') && !code.includes('function('),"ERRORRRRRRRRRRRRRRRR")
		// if (k == 'write_code_text_file') console.log('code',code)

		if (k != 'write_code_text_file' && (code.includes('[native code]') || code.includes('function('))) continue;
		text += code + '\n';
	}
	text = replaceAllSpecialChars(text, '\r', '');
	AU.ta.value = text;
	return text;
}

























