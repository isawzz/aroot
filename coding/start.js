onload = start;

async function start() {
	test_ui_extended();
	await load_Codebase('../basejs/cb1');
	await load_assets_fetch('../base/', '../games/')

	// dTable = document.body;
	// mClear(dTable);
	// let x=get_user_pic_and_name()

	let [bundle, closure, csstext, html] = await bundleGenFromProject('coding');
	//await bundleGenerateFrom('../games/test.html'); 

	//let text = await cssGenerateFrom(['../belinda/css/base.css','../belinda/css/cards.css'], '../belinda/closure.js', '../belinda/html/index.html');
	AU.ta.value = csstext;
	//test_cleanup_css_clause();
	//await prettyCss('../games/basemin.css','../games/closure.js','../games/index.html');
}

function test_cleanup_css_clause() {
	let cl = `
	#sidebar {
		/* height: 100%;
		flex: 1 0 auto; */
		background-color: #ffffff80;
		box-sizing: border-box;
		padding: 12px;
		text-align: center;
	}
		`;
	let x = cssCleanupClause(cl, 'sidebar');
	console.log('x', x);

}
function linestartsTest(lines) {
	AU.ta.value = lines.join('\n')
	let linestarts = [];
	for (const line of lines) {
		if (isLetter(line[0])) addIf(linestarts, 'letter')
		else addIf(linestarts, line[0])
	}
	console.log('linestarts', linestarts)

}
















