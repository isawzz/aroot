
function minimizeCode(di, klist, symlist = ['start']) {
	let done = {};
	let tbd = symlist; console.log('symlist', symlist)
	let MAX = 1000000, i = 0;
	let visited = { grid: true, jQuery: true, config: true, Number: true, sat: true, hallo: true, autocomplete: true, PI: true };
	while (!isEmpty(tbd)) {
		if (++i > MAX) break; //else console.log('i',i)
		let sym = tbd[0]; //console.log('sym', sym);
		if (isdef(visited[sym])) { tbd.shift(); continue; }
		visited[sym] = true;
		let o = di[sym];
		//if (nundef(o)) { console.log('not def', sym); tbd.shift(); continue; }
		if (nundef(o)) { tbd.shift(); continue; } //console.log('not def',sym);
		let text = o.code; //always using last function body!!!
		let words = toWords(text, true);
		for (const w of words) { if (nundef(done[w]) && nundef(visited[w]) && w != sym && isdef(di[w])) addIf(tbd, w); }
		assertion(sym == tbd[0], 'W T F')
		tbd.shift();
		done[sym] = o;
	}
	//console.log('done',done);
	//==>assertion(isdef(done.SOCKETSERVER),'no SOCK.......')
	return done;
}
async function onclickClosure() {
	let [di, klist] = [lookup(DA, ['bundle', 'di']), lookup(DA, ['bundle', 'klist'])];
	if (!di) {
		await onclickBundle();
		[di, klist] = [lookup(DA, ['bundle', 'di']), lookup(DA, ['bundle', 'klist'])];
	}
	//console.log('di', di)

	//all die onclick dinsplit('onclick=").shift()ger dazu
	let symlist = ['start'];
	console
	let onclicks = DA.indexhtml.split('onclick="'); //.shift();
	onclicks.shift();
	console.log('onclicks',onclicks);
	for (const oncl of onclicks) {
		console.log('oncl', oncl)
		let code = stringBefore(oncl, '(');
		symlist.push(code);
	}

	let done = minimizeCode(di, klist, symlist);
	console.log('done', done)

	let newklist = klist.filter(x => isdef(done[x]))
	lookupSetOverride(DA, ['closure', 'di'], done, newklist)
	lookupSetOverride(DA, ['closure', 'klist'],);

	assemble_complete_code(newklist, done);

	write_new_index_html(DA.dirout, 'closure');

}










