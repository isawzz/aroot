
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
	//if (download) downloadAsText(bundle_code, `${project}_bundle`, 'js');

	//closure!
	let seed = ['start'].concat(extractOnclickFromHtml(html));
	let byKeyMinimized = minimizeCode(byKey, ckeys, seed);
	let ckeysMinimized = ckeys.filter(x => isdef(byKeyMinimized[x]));
	let closure_code = assemble_code_sorted(ckeysMinimized, byKeyMinimized, haveBundle);
	if (download) downloadAsText(closure_code, `${project}_closure`, 'js');

	let scripts = `</body><script src="../${dirhtml}/closure.js"></script><script>onload = start;</script>\n</html>`;
	let htmlcode = stringBefore(html, `</body>`) + scripts;
	//if (download) downloadAsText(htmlcode, `${project}_index`, 'html')
	// if (download) downloadAsText(htmlcode.replace('/bundle.js', 'closure.js'), `${project}_closure`, 'html')

	AU.ta.value = closure_code;
	cssfiles = extractFilesFromHtml(html, htmlScriptsFile, 'css');
	console.log('cssfiles', cssfiles)
	//jetzt brauch ich noch das css
	let csstext = files.length>0? await cssGenerateFrom(cssfiles[0], bundle_code, html):'no css';

	return [bundle_code, closure_code, csstext, html];

}













