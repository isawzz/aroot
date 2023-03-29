async function load_Codebase(dir) {
	let path_js = isdef(dir) ? (dir + '/z_all.js') : '../allcode.js';
	dir = isdef(dir) ? dir : '../basejs';

	let text = CODE.text = await route_path_text(path_js);

	let keysSorted = [];
	let lines = text.split('\r\n');
	for (const l of lines) {
		if (['var', 'const', 'cla', 'func'].some(x => l.startsWith(x))) {
			let key = firstWordAfter(l, ' ', true);
			keysSorted.push(key);
		}
	}
	CODE.keysSorted = keysSorted;
	//console.log('keysSorted',keysSorted);

	CODE.di = await route_path_yaml_dict(dir + '/z_all.yaml');
	CODE.justcode = await route_path_yaml_dict(dir + '/z_allcode.yaml');
	CODE.codelist = dict2list(CODE.justcode, 'key');
	CODE.history = await route_path_yaml_dict(dir + '/z_allhistory.yaml');
	let keys = {};
	for (const k in CODE.di) { for (const k1 in CODE.di[k]) keys[k1] = CODE.di[k][k1]; }
	CODE.all = keys;
	CODE.keylist = Object.keys(keys)
	//let inter = intersection(Object.keys(keys), Object.keys(window));
	//console.log('intersection',inter);
	//7748 in intersection, also ca 400 jeweils extra, ergibt total of 8500 keys ca.
}
