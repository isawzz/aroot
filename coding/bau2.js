
function write_new_index_html(){
	let text=DA.indexhtml;

	let scripts=`</body><script src="../coding/_closuregames.js"></script><script>onload = start;</script></html>`;
	let newtext=stringBefore(text,`</body>`)+scripts;

	downloadAsText(newtext,'indextest.html')
}

function mClosureUI(dParent) {
	mDiv(dParent, {}, null, 'project')
	mDiv(dParent, {}, null, '<input type="text" id="inp_project" value="games"/>')
	mDiv(dParent, {}, null, 'seed')
	mDiv(dParent, {}, null, '<input type="text" id="inp_seed" value="accuse start startgame"/>')
	mButton('closure', onclickClosure, dParent);
}
function getLineStart(line) {

	if (isEmpty(line.trim())) { return ['', 'empty'] }

	let type = 'in_process';
	let w = stringBefore(line, ' ');
	let ch = line[0];
	if (ch == '\t') { w = 'TAB' }
	else if (ch == '}' || ch == '{') { w = 'BRACKET' }
	else if (nundef(ch)) { w = 'UNDEFINED' }
	else if (ch == ' ') { w = 'SPACE' }
	else if (ch == '\r') { type = 'WTF' }

	if (line.startsWith('//#region')) { w = 'REGION'; type = 'REGION' }
	else if (line.startsWith('//#endregion')) { w = 'ENDREGION'; type = 'REGION' }
	else if (line.startsWith('//')) { w = 'COMMENT'; type = 'empty' }


	if (['async', 'class', 'const', 'function', 'var'].includes(w)) type = 'block';
	else if (isLetter(ch)) type = 'WTF';

	return [w, type];
}
async function get_dir_files_seed() {

	//first go to project dir and load all js files
	let dir = '../' + mBy('inp_project').value;
	let list = mBy('inp_seed').value.split(' ');

	console.log('dir', dir, 'list', list)

	//hol mir erstmal das index file
	let textIndex = DA.indexhtml = await route_path_text(dir + '/index.html');
	let arr = textIndex.split('script src="');
	arr.shift();
	let files = arr.map(x => stringBefore(x, '"'));


	files = files.filter(x => !x.includes('alibs'));
	console.log('files', files)
	return [dir, files, list];
}
async function onclickClosure() {
	let [dir, files, seed] = await get_dir_files_seed();
	let chunk = '', error = '', state, kw = null, blocktype = null, region = null;
	let byKey = {}, ckeys = [], idx = 0; //, di = {}
	let linestarts = [];
	for (const f of files) {
		let txt = await route_path_text(f);
		let fname = stringAfterLast(f, '/'); fname = stringBefore(fname, '.');
		//text += `//#region ${fname}`;
		let lines = txt.split('\n'); //console.log('lines[0]',lines[0]);

		for (const line of lines) {
			let [w, type] = getLineStart(line);	//console.log('linestart', w, type);
			if (type == 'WTF') { console.log('linestart', w, type); continue; }
			else if (type == 'empty') { continue; }
			else if (type == 'in_process') { 
				if (line.includes('//#region') || line.includes('//#endregion')) continue;
				if (kw) chunk += line + '\n'; else error += line + '\n'; 
			}
			else if (type == 'REGION') { if (w == type) region = stringAfter(line, '//#region ').trim(); }
			else if (type == 'block') {
				if (kw) {
					//close previous block!
					let o = { key: kw, code: chunk, fname: fname, region: region ?? fname, blocktype: blocktype, idx: idx++ };
					let prev = lookup(byKey, [kw]);
					if (prev) {
						console.log('DUPLICATE', kw);
						if (prev.blocktype != o.blocktype) {
							console.log('... change from', prev.blocktype, 'to', o.blocktype);
						}
						//loesche den alten!
						ckeys[prev.idx] = null;
					}
					//lookupSetOverride(di, [blocktype, region, kw], o);
					lookupSetOverride(byKey, [kw], o);
					ckeys.push(kw);

				}
				blocktype = w == 'async' ? 'function' : w;
				chunk = line + '\n';
				kw = w == 'async' ? stringAfter(line, 'function ') : stringAfter(line, ' '); kw = firstWord(kw, true);
				//console.log('?',blocktype,kw,line);
				//console.log('kw',kw);
			} else { console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!'); break; }
		}
		//text += `//#endregion ${fname}`;
	}

	console.log('byKey', get_values(byKey));
	console.log('keys', ckeys);
	//console.log('di', di);
	//console.log('linestarts', linestarts)

	//assemble text!!!
	assemble_complete_code(ckeys, byKey);
	
	write_new_index_html();



}
function assemble_complete_code(list, di) {
	CODE.byKey=di;
	CODE.keylist=list;
	let text = '';
	let region = null,fname=null;
	for (const k of list) {
		if (!k) continue;
		let o = di[k];

		// if (fname != o.fname){region='';fname=o.fname}

		// let reg = o.fname + ' ' + o.region;
		// if (reg != region) {
		// 	if (region) text += `//#endregion\n`;
		// 	region = reg;
		// 	text += `//#region ${region}\n`;
		// }
		text += o.code;

	}
	AU.ta.value = text;

	console.log('last keys',arrTakeLast(list,2))
}


