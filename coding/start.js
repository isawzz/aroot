onload = start;
function start() {
	console.log('hallo coding!');
	show_coding_ui();
	loadCodebase({},start_with_assets);
}

async function start_with_assets(){
	await games_css_closure();
}


