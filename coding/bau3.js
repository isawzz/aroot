function getObjectFromWindow(key) {
	let code, sig, type;
	let f = window[key];

	if (isdef(f)) {
		type = typeof f;
		if (type != 'function') return null; else type = 'func';
		// } else if (['async', 'function', 'await'].includes(key)) {
		// 	return null;
	} else {
		//console.log('key', key)
		try {
			f = eval(key);
			if (typeof (f) == 'function') type = 'cla'; else return null;
		} catch { return null; }
	}
	// if (isdef(f)) console.log('key', key, 'type', typeof f); //, isdef(f)?f.toString():'_',typeof f)
	// if (typeof f != 'function') return null;
	code = f.toString();
	//if (type == 'cla') console.log('code', code)
	sig = type == 'func' ? getFunctionSignature(stringBefore(code, '\n'), key) : `class ${key}{}`;
	// type = 'func';
	let o = { name: key, code: code, sig: sig, region: type, filename: '', path: '', type: type };
	CODE.justcode[key] = code;
	CODE.all[key] = CODE.di[type][key] = o;
	return o;
}












