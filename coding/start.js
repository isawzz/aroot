
async function start() {
	test_ui_extended();
	//await load_Codebase('../coding/cb/cb1');
	//await load_assets_fetch('../base/', '../games/')
	let [bundle, closure, csstext, html] = await bundleGenFromProject('coding', false);
	AU.ta.value = csstext; 
}
