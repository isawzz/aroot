
//#region bundle generation
function mClosureUI(dParent) {
	let d=mDiv(dParent,{gap:10});mFlexWrap(d);
	let d1=mDiv(d);
	mDiv(d1, {}, null, 'project')
	mDiv(d1, {}, null, '<input type="text" id="inp_project" value="gamesfull"/>')
	let d2=mDiv(d);
	mDiv(d2, {}, null, 'seed')
	mDiv(d2, {}, null, '<input type="text" id="inp_seed" value="start"/>')
	let d3=mDiv(d);
	mDiv(d3, {}, null, 'output')
	mDiv(d3, {}, null, '<input type="text" id="inp_dirout" value="games"/>')

	let d4=mDiv(dParent,{gap:12}); mFlexWrap(d4);
	mButton('bundle', onclickBundle, d4);
	mButton('closure', onclickClosure, d4);
	mButton('belinda bundle', belinda_bundle, d4);
	mButton('belinda closure', belinda_closure, d4);
}
function getLineStart(line) {

	if (isEmpty(line.trim())) { return ['', 'empty'] }

	let type = 'in_process';
	let w = stringBefore(line, ' ');
	let ch = line[0];
	let i = 0; while (line[i] == '\t') { i++; }
	let fw = line.slice(i);
	//whilestringAfterLast(line, '\t');
	//if (isdef(fw) && fw.startsWith('//')) console.log('comm',line)
	if (line.startsWith('//#region')) { w = 'REGION'; type = 'REGION' }
	else if (line.startsWith('//#endregion')) { w = 'ENDREGION'; type = 'REGION' }
	else if (line.startsWith('//')) { w = 'COMMENT'; type = 'empty' }
	else if (isdef(fw) && fw.startsWith('//')) { w = 'COMMENT'; type = 'empty' }
	else if (ch == '\t') { w = 'TAB'; }
	else if (ch == '}' || ch == '{') { w = 'BRACKET' }
	else if (nundef(ch)) { w = 'UNDEFINED'; type = 'WTF' }
	else if (ch == ' ') { w = 'SPACE'; type = 'WTF' }
	else if (ch == '\r') { type = 'WTF' }
	else if (nundef(fw)) { w = fw; type = 'WTF' }

	if (['async', 'class', 'const', 'function', 'var'].includes(w)) type = 'block';
	else if (isLetter(ch)) type = 'WTF';

	return [w, type];
}
async function get_dir_files_seed() {

	//first go to project dir and load all js files
	let dir = '../' + mBy('inp_project').value;
	let list = mBy('inp_seed').value.split(' ');

	//console.log('dir', dir, 'list', list)

	//hol mir erstmal das index file
	let textIndex = DA.indexhtml = await route_path_text(dir + '/index.html');
	let arr = textIndex.split('script src="');
	arr.shift();
	let files = arr.map(x => stringBefore(x, '"'));


	files = files.filter(x => !x.includes('alibs'));
	//console.log('files', files)
	let dirout = mBy('inp_dirout').value;
	return [dir, files, list, dirout];
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
		if (type == 'WTF') { continue; } //console.log('linestart', w, type); 
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
				let o = { key: kw, code: chunk, fname: oldfname, region: region ?? oldfname, type: blocktype, idx: idx++ };
				// if (o.type == 'async') {o.type = 'function';console.log('async',kw)}
				if (prev) {
					if (prev.type != o.type) {
						console.log('DUPLICATE', kw,prev);
						console.log('... change from', prev.type, 'to', o.type);
					}
					//loesche den alten!
					//ckeys[prev.idx] = null;
				} else { ckeys.push(kw); }
				//lookupSetOverride(di, [blocktype, region, kw], o);
				lookupSetOverride(byKey, [kw], o);


			}
			kw = w == 'async' ? stringAfter(line, 'function ') : stringAfter(line, ' '); kw = firstWord(kw, true);
			let blocktypes = { function: 'func', class: 'cla', async: 'func', var: 'var', const: 'const' };
			blocktype = blocktypes[w]; //w == 'async' ? 'function' : w; //hier async turns into function!!!
			chunk = line + '\n';
			//console.log('?',blocktype,kw,line);
			//console.log('kw',kw);
		} else { console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!'); break; }
	}
	if (kw) {
		//close previous block!
		let prev = lookup(byKey, [kw]);
		let oldfname = prev ? prev.fname : fname;
		let o = { key: kw, code: chunk, fname: oldfname, region: region ?? oldfname, type: blocktype, idx: idx++ };
		if (prev) {
			//console.log('DUPLICATE', kw);
			if (prev.type != o.type) {
				console.log('... change from', prev.type, 'to', o.type);
			}
			//loesche den alten!
			//ckeys[prev.idx] = null;
		} else { ckeys.push(kw); }
		lookupSetOverride(byKey, [kw], o);


	}
	text += `//#endregion ${fname}\n\n`;
	return [text, idx];
}
async function onclickBundle() {
	let [dir, files, seed, dirout] = await get_dir_files_seed();
	let byKey = {}, ckeys = [], idx = 0; 
	//console.log(files)
	let text = '';
	for (const f of files) {
		let [filetext, idxnew] = await __parsefile(f, byKey, ckeys, idx);
		idx = idxnew;
		text += filetext;
	}
	//assemble text!!!
	assemble_complete_code(ckeys, byKey);

	lookupSetOverride(DA, ['bundle', 'di'], byKey)
	lookupSetOverride(DA, ['bundle', 'klist'], ckeys)

	write_new_index_html(dirout);
	DA.codedir = dir;
	DA.dirout = dirout;
}
function assemble_complete_code(list, di) {
	CODE.byKey = di;
	CODE.keylist = list;
	//console.log('...',list[0],di[list[0]]);//var list problem!!!!!
	let region = null, fname = di[list[0]].fname;
	let text = `//#region ${fname}\n`;
	for (const k of list) {
		if (!k || nundef(di[k])) continue;
		let o = di[k];

		//if (o.key == 'verify_min_req') console.log('verify_min_req', o)

		if (fname != o.fname) {
			text += `//#endregion ${fname}\n\n//#region ${o.fname}\n`;
			fname = o.fname;
		}
		text += o.code;

	}

	text += `//#endregion\n\n`;
	downloadAsText(text, 'bundle', 'js');
	lookupSetOverride(DA, ['bundle', 'text'], text)

	AU.ta.value = text;
}
function write_new_index_html(dir,filename='bundle') {
	//let project = stringAfterLast(dir,'/');	console.log('project',project)
	let text = DA.indexhtml;

	
	let scripts = `</body><script src="../${dir}/${filename}.js"></script><script>onload = start;</script>\n</html>`;
	let newtext = stringBefore(text, `</body>`) + scripts;

	downloadAsText(newtext,`index`,'html')
}
//#endregion bundle generation



