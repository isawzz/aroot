onload = start;

async function start() {
	test_ui();
	await load_Codebase('../coding/cb2');
	await load_assets_fetch('../base/', '../games/')
	console.log('CODE', CODE, '\nDB', DB, '\nConfig', Config)

}




















