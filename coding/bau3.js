
function minimizeCode(di, klist, symlist = ['start']) {
	let done = {};
	let tbd = symlist;
	let MAX = 1000000, i = 0;
	let visited = { grid: true, jQuery: true, config: true, Number: true, sat: true, hallo: true, autocomplete: true, PI: true };
	while (!isEmpty(tbd)) {
		if (++i > MAX) break; //else console.log('i',i)
		let sym = tbd[0]; console.log('sym', sym);
		if (isdef(visited[sym])) { tbd.shift(); continue; }
		visited[sym] = true;
		let o = di[sym];
		if (nundef(o)) { tbd.shift(); continue; }
		let text = o.code; //always using last function body!!!
		let words = toWords(text, true);
		for (const w of words) { if (nundef(done[w]) && nundef(visited[w]) && w != sym && isdef(di[w])) addIf(tbd, w); }
		tbd.shift();
		done[sym] = o;
	}
	//console.log('done',done);
	return done;
}
async function onclickClosure() {
	let [di, klist] = [lookup(DA, ['bundle', 'di']), lookup(DA, ['bundle', 'klist'])];
	if (!di) {
		await onclickBundle();
		[di, klist] = [lookup(DA, ['bundle', 'di']), lookup(DA, ['bundle', 'klist'])];
	}
	//console.log('di', di)
	let done = minimizeCode(di, klist);
	console.log('done', done)

	assemble_complete_code(klist, done);

	lookupSetOverride(DA, ['closure', 'di'], done)
	lookupSetOverride(DA, ['closure', 'klist'], klist.filter(x => isdef(done[x])));

	write_new_index_html(DA.codedir, 'closure');

}










