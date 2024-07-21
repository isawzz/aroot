
function addCodeBlock(byKey, ckeys, kw, chunk, fname, region, blocktype, idx) {
	let prev = lookup(byKey, [kw]);
	let oldfname = prev ? prev.fname : fname;
	let o = { key: kw, code: chunk, fname: oldfname, region: region ?? oldfname, type: blocktype, idx: idx++ };
	if (prev) {
		if (prev.type != o.type) {
			console.log('DUPLICATE', kw, prev);
			console.log('... change from', prev.type, 'to', o.type);
		}
	} else { ckeys.push(kw); }
	lookupSetOverride(byKey, [kw], o);
}
async function bundleGenFromProject(projectname, genfiles) {
	//assume projectname has to be a top leve folder inside of the dir where coding resides!
	await bundleGenerateFrom(`../${projectname}/index.html`, null, genfiles);
}
async function bundleGenerateFrom(htmlScriptsFile, htmlBodyFile = null, download = true) {
	let html = await route_path_text(htmlScriptsFile);
	if (htmlBodyFile) html += await route_path_text(htmlBodyFile);
	let dirhtml = stringBeforeLast(htmlScriptsFile, '/');
	let project = stringAfter(dirhtml, '/'); if (project.includes('/')) project = stringBefore(project, '/');
	let files = extractFilesFromHtml(html, htmlScriptsFile);

	let byKey = {}, ckeys = [], idx = 0, haveBundle = false;
	if (files.length == 1) {
		haveBundle = true;
		console.log('bundle already generated!!!', files[0]);
	}
	for (const f of files) { let idxnew = await parseCodeFile(f, byKey, ckeys, idx); idx = idxnew; }
	let bundle_code = assemble_code_sorted(ckeys, byKey, haveBundle);
	if (download) downloadAsText(bundle_code, `${project}_bundle`, 'js');

	//closure!
	let seed = ['start'].concat(extractOnclickFromHtml(html));
	let byKeyMinimized = minimizeCode(byKey, ckeys, seed);
	let ckeysMinimized = ckeys.filter(x => isdef(byKeyMinimized[x]));
	let closure_code = assemble_code_sorted(ckeysMinimized, byKeyMinimized, haveBundle);
	if (download) downloadAsText(closure_code, `${project}_closure`, 'js');

	let scripts = `</body><script src="../${dirhtml}/bundle.js"></script><script>onload = start;</script>\n</html>`;
	let htmlcode = stringBefore(html, `</body>`) + scripts;
	if (download) downloadAsText(htmlcode, `${project}_bundle`, 'html')
	if (download) downloadAsText(htmlcode.replace('/bundle.js', 'closure.js'), `${project}_closure`, 'html')

	AU.ta.value = closure_code;

}
function extractFilesFromHtml(html, htmlfile) {
	let dirhtml = stringBeforeLast(htmlfile, '/');
	let project = stringAfter(dirhtml, '/'); if (project.includes('/')) project = stringBefore(project, '/');
	let parts = html.split('script src="');
	parts.shift();
	let files = parts.map(x => stringBefore(x, '"'));
	files = files.filter(x => !x.includes('alibs')); //console.log('files', jsCopy(files))

	//console.log('dirhtml', dirhtml);
	let files2 = [];
	for (const f of files) {
		if (f.startsWith(dirhtml)) { files2.push(f); continue; }

		if (f.startsWith('./')) { files2.push(dirhtml + f.substring(1)); continue; }

		if (f.startsWith('../') && stringCount(dirhtml, '../') == 1) {
			files2.push(f); continue;
		}

		if (!f.includes('/')) { files2.push(dirhtml + '/' + f); continue; }
		console.log('PROBLEM!', f)
		//file die in f is relative to index.html
		//ich brauch es relativ to coding/index
		//if (!f.startsWith())
	}
	//console.log('files2', files2);
	files = files2;
	return files;
}
function extractOnclickFromHtml(html) {
	let symlist = [];
	let onclicks = html.split('onclick="'); //.shift();
	onclicks.shift();
	//console.log('onclicks',onclicks);
	for (const oncl of onclicks) {
		//console.log('oncl', oncl)
		let code = stringBefore(oncl, '(');
		symlist.push(code);
	}
	return symlist;
}
async function parseCodeFile(f, byKey, ckeys, idx) {
	let chunk = '', kw = null, blocktype = null, region = null;
	let txt = await route_path_text(f);
	let fname = stringAfterLast(f, '/'); fname = stringBefore(fname, '.');
	let lines = txt.split('\n');
	for (const line of lines) {
		let [w, type] = getLineStart(line);
		if (line.includes('`;')) console.log('ACHTUNG!', w, type, line.trim() == '`;');
		if (line.trim() == '`;' && kw) { chunk += line + '\n'; continue; }
		if (type == 'WTF') { continue; }
		else if (type == 'empty') { continue; }
		else if (type == 'in_process') {
			if (line.includes('//#region') || line.includes('//#endregion')) continue;
			if (kw) { chunk += line + '\n'; }
		}
		else if (type == 'REGION') { if (w == type) region = stringAfter(line, '//#region ').trim(); }
		else if (type == 'block') {
			if (kw) addCodeBlock(byKey, ckeys, kw, chunk, fname, region, blocktype, idx++);
			kw = w == 'async' ? stringAfter(line, 'function ') : stringAfter(line, ' '); kw = firstWord(kw, true);
			let blocktypes = { function: 'func', class: 'cla', async: 'func', var: 'var', const: 'const' };
			blocktype = blocktypes[w];
			chunk = line + '\n';
		} else { console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!'); break; }
	}
	if (kw) addCodeBlock(byKey, ckeys, kw, chunk, fname, region, blocktype, idx++);
	return idx;
}









