

//#region bundle generation
function mClosureUI(dParent) {
	mDiv(dParent, {}, null, 'project')
	mDiv(dParent, {}, null, '<input type="text" id="inp_project" value="games2"/>')
	mDiv(dParent, {}, null, 'seed')
	mDiv(dParent, {}, null, '<input type="text" id="inp_seed" value="accuse start startgame"/>')
	mButton('closure', onclickClosure, dParent);
}
function getLineStart(line) {

	if (isEmpty(line.trim())) { return ['', 'empty'] }

	let type = 'in_process';
	let w = stringBefore(line, ' ');
	let ch = line[0];
	let i=0;while(line[i]=='\t'){i++;}
	let fw = line.slice(i);
	//whilestringAfterLast(line, '\t');
	if (isdef(fw) && fw.startsWith('//')) console.log('comm',line)
	if (line.startsWith('//#region')) { w = 'REGION'; type = 'REGION' }
	else if (line.startsWith('//#endregion')) { w = 'ENDREGION'; type = 'REGION' }
	else if (line.startsWith('//')) { w = 'COMMENT'; type = 'empty' }
	else if (isdef(fw) && fw.startsWith('//')) { w = 'COMMENT'; type = 'empty' }
	else if (ch == '\t') { w = 'TAB'; }
	else if (ch == '}' || ch == '{') { w = 'BRACKET' }
	else if (nundef(ch)) { w = 'UNDEFINED'; type = 'WTF' }
	else if (ch == ' ') { w = 'SPACE'; type = 'WTF' }
	else if (ch == '\r') { type = 'WTF' }
	else if (nundef(fw)) {w=fw;type='WTF'}

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
async function __parsefile(f, byKey, ckeys, idx) {
	let chunk = '', error = '', state, kw = null, blocktype = null, region = null;
	//let linestarts = [];
	let txt = await route_path_text(f);
	let fname = stringAfterLast(f, '/'); fname = stringBefore(fname, '.');
	let text = `//#region ${fname}\n`;
	let lines = txt.split('\n'); //console.log('lines[0]',lines[0]);

	for (const line of lines) {
		let [w, type] = getLineStart(line);	//console.log('linestart', w, type);
		if (type == 'WTF') { console.log('linestart', w, type); continue; }
		else if (type == 'empty') { continue; }
		else if (type == 'in_process') {

			if (line.includes('//#region') || line.includes('//#endregion')) continue;
			if (kw) { chunk += line + '\n'; } else error += line + '\n';
		}
		else if (type == 'REGION') { if (w == type) region = stringAfter(line, '//#region ').trim(); }
		else if (type == 'block') {
			if (kw) {
				//close previous block!
				let prev = lookup(byKey, [kw]);
				let oldfname = prev ? prev.fname : fname;
				let o = { key: kw, code: chunk, fname: oldfname, region: region ?? oldfname, blocktype: blocktype, idx: idx++ };
				if (prev) {
					//console.log('DUPLICATE', kw);
					if (prev.blocktype != o.blocktype) {
						console.log('... change from', prev.blocktype, 'to', o.blocktype);
					}
					//loesche den alten!
					//ckeys[prev.idx] = null;
				} else { ckeys.push(kw); }
				//lookupSetOverride(di, [blocktype, region, kw], o);
				lookupSetOverride(byKey, [kw], o);


			}
			blocktype = w == 'async' ? 'function' : w;
			chunk = line + '\n';
			kw = w == 'async' ? stringAfter(line, 'function ') : stringAfter(line, ' '); kw = firstWord(kw, true);
			//console.log('?',blocktype,kw,line);
			//console.log('kw',kw);
		} else { console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!'); break; }
	}
	if (kw) {
		//close previous block!
		let prev = lookup(byKey, [kw]);
		let oldfname = prev ? prev.fname : fname;
		let o = { key: kw, code: chunk, fname: oldfname, region: region ?? oldfname, blocktype: blocktype, idx: idx++ };
		if (prev) {
			//console.log('DUPLICATE', kw);
			if (prev.blocktype != o.blocktype) {
				console.log('... change from', prev.blocktype, 'to', o.blocktype);
			}
			//loesche den alten!
			//ckeys[prev.idx] = null;
		} else { ckeys.push(kw); }
		//lookupSetOverride(di, [blocktype, region, kw], o);
		lookupSetOverride(byKey, [kw], o);


	}
	text += `//#endregion ${fname}\n\n`;
	return [text, idx];
}
async function onclickClosure() {
	let [dir, files, seed] = await get_dir_files_seed();
	let byKey = {}, ckeys = [], idx = 0; //, di = {}
	//console.log(files)
	let text = '';
	for (const f of files) {
		let [filetext, idxnew] = await __parsefile(f, byKey, ckeys, idx);
		idx = idxnew;
		text += filetext;
	}

	//downloadAsText(text, 'bundle', 'js');
	//AU.ta.value = text;

	// console.log('byKey', get_values(byKey));
	// console.log('keys', ckeys);

	//assemble text!!!
	assemble_complete_code(ckeys, byKey);

	write_new_index_html(dir);
}
function assemble_complete_code(list, di) {
	CODE.byKey = di;
	CODE.keylist = list;
	let region = null, fname = di[list[0]].fname;
	let text = `//#region ${fname}\n`;
	console.log('first fname is', fname)
	for (const k of list) {
		if (!k) continue;
		let o = di[k];

		if (o.key == 'verify_min_req') console.log('verify_min_req', o)

		if (fname != o.fname) {
			text += `//#endregion ${fname}\n\n//#region ${o.fname}\n`;
			fname = o.fname;
		}
		text += o.code;

	}

	text += `//#endregion\n\n`;
	downloadAsText(text, 'bundle', 'js');

	AU.ta.value = text;
	//console.log('last keys',arrTakeLast(list,2))
}
function write_new_index_html(dir) {
	//let project = stringAfterLast(dir,'/');	console.log('project',project)
	let text = DA.indexhtml;

	let scripts = `</body><script src="${dir}test/bundle.js"></script><script>onload = start;</script>\n</html>`;
	let newtext = stringBefore(text, `</body>`) + scripts;

	downloadAsText(newtext,`index`,'html')
}


