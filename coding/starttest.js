onload = start;

async function start() {
	test_ui_extended();
	await load_Codebase('../basejs/cb1');
	await load_assets_fetch('../base/', '../games/')
	//console.log('CODE', CODE, '\nDB', DB, '\nConfig', Config)

	await games_css_closure();


}
function startgames() {
	let uname = DA.secretuser = localStorage.getItem('uname');
	if (isdef(uname)) U = { name: uname };
	phpPost({ app: 'simple' }, 'assets');
}




















