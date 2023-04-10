
function belinda_get_games() {
	return [
		'gSpotit',
		'gColoku',
		'gMaze',
		'gSteps',
		'gSentence',
		'gTouchColors',
		'gSayPic',
		'gReversi',
		'gMissingLetter',
		'gNamit',
		'gTouchPic',
		'gHouse',
		'gWritePic',
		'gChess',
		'gPremem',
		'gMem',
		'gSwap',
		'gTTT',
		'gElim',
		'gAnagram',
		'gCats',
		'gAbacus',
		'gRiddle',
		'gC4',
	];
}
function belinda_get_imports() {
	return `
	<script src="../belindafull/js/globals.js"></script>
	<script src="../belindafull/js/base.js"></script>
	<script src="../belindafull/js/areas.js"></script>
	<script src="../belindafull/js/audio.js"></script>
	<script src="../belindafull/js/badges.js"></script>
	<script src="../belindafull/js/banner.js"></script>
	<script src="../belindafull/js/board.js"></script>
	<script src="../belindafull/js/cards.js"></script>
	<script src="../belindafull/js/chess.js"></script>
	<script src="../belindafull/js/markers.js"></script>
	<script src="../belindafull/js/menu.js"></script>
	<script src="../belindafull/js/mGraph.js"></script>
	<script src="../belindafull/js/speech.js"></script>
	<script src="../belindafull/js/settings.js"></script>
	<script src="../belindafull/js/test_ui_helpers.js"></script>
	<script src="../belindafull/js/time.js"></script>
	<script src="../belindafull/js/maze.js"></script>
	<script src="../belindafull/js/ai.js"></script>
	<script src="../belindafull/js/all.js"></script>
	<script src="../belindafull/js/classes.js"></script>
	<script src="../belindafull/js/debug.js"></script>
	<script src="../belindafull/js/controller.js"></script>
	<script src="../belindafull/js/classes3.js"></script>
	<script src="../belindafull/js/controller3.js"></script>
	<script src="../belindafull/js/game.js"></script>
	<script src="../belindafull/js/house.js"></script>
	<script src="../belindafull/js/item.js"></script>
	<script src="../belindafull/js/keys.js"></script>
	<script src="../belindafull/js/legacy.js"></script>
	<script src="../belindafull/js/letter.js"></script>
	<script src="../belindafull/js/math.js"></script>
	<script src="../belindafull/js/onClick.js"></script>
	<script src="../belindafull/js/scoring.js"></script>
	<script src="../belindafull/js/testing.js"></script>
	<script src="../belindafull/js/ui.js"></script>
	<script src="../belindafull/js/user.js"></script>
	<script src="../belindafull/js/work.js"></script>
	<script src="../belindafull/js/workUI.js"></script>
	`
}
async function belinda_get_index_html() {
	return await route_path_text('../belindafull/html/index.html');
}
async function belinda_closure() {
	let indexhtml = DA.indexhtml = await belinda_get_index_html();
	let [di, klist] = [lookup(DA, ['bundle', 'di']), lookup(DA, ['bundle', 'klist'])];
	if (!di) {
		await belinda_bundle();
		[di, klist] = [lookup(DA, ['bundle', 'di']), lookup(DA, ['bundle', 'klist'])];
	}
	//console.log('di', di)

	//all die onclick dinsplit('onclick=").shift()ger dazu
	let symlist = ['start'];
	console
	let onclicks = DA.indexhtml.split('onclick="'); //.shift();
	onclicks.shift();
	console.log('onclicks', onclicks);
	for (const oncl of onclicks) {
		console.log('oncl', oncl)
		let code = stringBefore(oncl, '(');
		symlist.push(code);
	}
	for(const cl of belinda_get_games()){
		symlist.push(capitalize(cl));
	}
	symlist = symlist.concat(['csv2list','ControllerSolitaireMinimal'])

	//console.log('belindafull sym list',symlist); 

	let done = minimizeCode(di, klist, symlist);
	//console.log('done', done); //return;

	let newklist = klist.filter(x => isdef(done[x]))
	lookupSetOverride(DA, ['closure', 'di'], done, newklist)
	lookupSetOverride(DA, ['closure', 'klist'],);

	assemble_complete_code(newklist, done);

	//write_new_index_html(DA.dirout, 'closure');

}
async function belinda_bundle() {
	let files = belinda_get_imports().split('src="');
	files = files.map(x => stringBefore(x, '"'));
	files.shift(); //console.log(files); return;
	files.push('../belindafull/start.js');
	let dirout = 'belinda';
	let byKey = {}, ckeys = [], idx = 0;
	let text = '';
	for (const f of files) {
		let [filetext, idxnew] = await belinda_parsefile(f, byKey, ckeys, idx);
		idx = idxnew;
		text += filetext;
	}
	//assemble text!!!

	assemble_complete_code(ckeys, byKey);

	lookupSetOverride(DA, ['bundle', 'di'], byKey)
	lookupSetOverride(DA, ['bundle', 'klist'], ckeys)

	//write_new_index_html(dirout);
	//DA.codedir = dir;
	DA.dirout = dirout;
}
async function belinda_parsefile(f, byKey, ckeys, idx) {
	let chunk = '', error = '', state, kw = null, blocktype = null, region = null;
	//let linestarts = [];
	let txt = await route_path_text(f);
	let fname = stringAfterLast(f, '/'); fname = stringBefore(fname, '.');
	let text = `//#region ${fname}\n`;
	let lines = txt.split('\n'); //console.log('lines[0]',lines[0]);

	for (const line of lines) {
		let [w, type] = getLineStart(line);	//console.log('linestart', w, type);
		if (type == 'WTF') {
			//if (fname == 'test_ui_helpers') console.log('WTF',w,'\n..',line,w); 
			if (kw == 'uiGetContact') console.log('WTF', w, '\n..', line, w);
			if (w == 'SPACE') chunk += line + '\n';
			continue;
		}
		else if (type == 'empty') {
			// if (fname == 'test_ui_helpers') console.log('empty', w, '\n..', line, w);
			// if (kw == 'uiGetContact') console.log('empty', w, '\n..', line, w);
			continue;
		}
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
						console.log('DUPLICATE', kw, prev);
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


















