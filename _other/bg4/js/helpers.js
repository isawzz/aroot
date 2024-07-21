//#region dictionaries
async function create_pic_dicts(list=['e','d','f','s']) {
	let syms = await route_path_yaml_dict('../base/assets/allSyms.yaml');
	for(const l of list){
		let di = await create_pic_dict(l,syms);
		downloadAsYaml(di,l+'picdict');
	}
	loader_off();
}
async function create_pic_dict(l,syms){
	//first need to get dicts in asset loading!
	//wo werden assets geladen?
	//kann ich txt file mit einfachem ajax holen?
	let edict = await route_path_text(`../base/assets/words/${l}dict.txt`);
	console.log('dict', edict);
	let lang = l.toUpperCase();

	let words = l=='e'? edict.split('\r\n'):edict.split('\n');

	console.log('words', words);
	console.log('syms', syms);

	let wdi = {};
	for (const w of words) { 
		let w1 = w.trim().toLowerCase();
		if (isEmpty(w1)) continue;
		//console.assert(w1 == w1.toLowerCase(),'not in lower case:',l,w1);
		wdi[w1] = true; 
	}

	let slist = [];
	for (const skey in syms) {
		let e = syms[skey][lang];
		if (nundef(e)) continue;
		e=e.trim().toLowerCase();
		slist.push({key:skey,w:e});
	}
	slist_sorted = sortBy(slist,'w');
	console.log('slist sorted',slist_sorted);

	console.log(wdi);
	let edi = {};
	for(const o of slist_sorted){
		let [e,skey]=[o.w,o.key];
		if (e in wdi) edi[e] = skey;
		else console.log('word',e,'from syms not in dict!!!');

	}
	console.log('result', edi, Object.keys(edi).length);
	return edi;

	return;

	for (const skey in syms) {
		let e = syms[skey][lang];
		if (nundef(e)) continue;
		e=e.trim().toLowerCase();
		console.assert(isdef(e) && e == e.toLowerCase(), 'word in syms not lowercasse:' + e);
		if (e in wdi) edi[e] = skey;
		else console.log('word',e,'from syms not in dict!!!');

	}
	console.log('result', edi, Object.keys(edi).length);
	return edi;
}
function ensureDictionary(){
	if (nundef(Dictionary)) { Dictionary = { E: {}, S: {}, F: {}, C: {}, D: {} } };
	for (const k in Syms) {
		for (const lang of ['E', 'D', 'F', 'C', 'S']) {
			let w = Syms[k][lang];
			if (nundef(w)) continue;
			Dictionary[lang][w.toLowerCase()] = Dictionary[lang][w.toUpperCase()] = k;
		}
	}
}

