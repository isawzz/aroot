window.onload = start;
var fa_words;
async function start() {

	let txt = await route_path_text('../iconViewer/fa_symbols.css');
	let parts = txt.split(':before');
	console.log('parts', parts.length);
	let list = [];
	for (const p of parts) {
		//console.log('p',p)
		let word = stringAfter(p, '.fa-').trim();
		//console.log('word',word);
		list.push(word);
	}
	console.log('list', list);
	fa_words = list.sort();

	get_assets();
}
function onclick_fa() {
	let dParent = mBy('dMain');
	dParent.innerHTML = '';
	for (const w of fa_words){ // arrTake(fa_words, 100)) {
		let d = mDiv(dParent, { align: 'center', bg: 'blue', margin: 8, fg: 'white', display: 'inline-block', padding: 10 }, null, `<i class="fa fa-${w} fa-2x"></i><br>${w}`);
	}

}
function onclick_syms() {
	let dParent = mBy('dMain');

	// *** hier ist item auswahl!!! ***
	//let items = ['gAbacus','gTouchPic', 'gAnagram', 'gChess'].map(x => DB.games[x]);
	//let items = findKeys('hand').map(x=>Syms[x]); // filter keys
	let items = dict2list(Syms); //all keys
	//console.log('items',items);

	//let x=Syms.watch;	console.log('x',x);
	dParent.innerHTML = createViewerContent(items, [], true);
}

function get_assets() {
	get_data({}, 'assets');


}
function get_data(find, type) {
	var xml = new XMLHttpRequest();
	var loader_holder = mBy("loader_holder");
	loader_holder.className = "loader_on";
	xml.onload = function () {
		if (xml.readyState == 4 || xml.status == 200) {
			loader_holder.className = "loader_off";
			handle_result(xml.responseText, type);
		}
	}
	var data = {};
	data.find = find;
	data.data_type = type;
	data = JSON.stringify(data);
	xml.open("POST", "test.php", true);
	xml.send(data);
}
function handle_result(result, type) {
	//console.log('type', type, '\nresult', result); return;
	if (result.trim() == "") return;

	var obj = JSON.parse(result);
	console.log('obj', obj);
	switch (obj.data_type) {
		case 'assets':
			ensure_assets(obj);
			console.log('Syms', Syms);
			let dParent = mBy('dMain');
			//let items = ['gAbacus','gTouchPic', 'gAnagram', 'gChess'].map(x => DB.games[x]);

			let items = dict2list(Syms); //all keys
			//let items = findKeys('hand').map(x=>Syms[x]); // filter keys
			//console.log('items',items);

			//let x=Syms.watch;	console.log('x',x);
			dParent.innerHTML = createViewerContent(items, [], true);
			break;
	}
}
function ensure_assets(obj) {
	console.log('hallo!', DB)
	if (nundef(DB) || isEmpty(get_keys(DB))) {
		//console.log('obj', obj.db)
		symbolDict = Syms = jsyaml.load(obj.syms);
		SymKeys = Object.keys(Syms);
		ByGroupSubgroup = jsyaml.load(obj.symGSG);
		WordP = jsyaml.load(obj.allWP);
		C52 = jsyaml.load(obj.c52);
		FenPositionList = csv2list(obj.fens);
		DB = jsyaml.load(obj.db);
		//console.log('FenPositionList',FenPositionList);
		KeySets = getKeySets();
	}
	console.assert(isdef(DB), 'NO DB!!!!!!!!!!!!!!!!!!!!!!!!!!!');
}


function createViewerContent(mygames, tables = [], show_key = false) {
	let mydata = uiGetViewerStylesAndStart();
	mydata += uiGetViewer(mygames, tables, show_key);
	return mydata;
}
function uiGetViewerStylesAndStart() {
	let mydata = `
	<style>
		@keyframes appear{

			0%{opacity:0;transform: translateY(50px)}
			100%{opacity:1;transform: translateY(0px)}
 		}

 		.contact{
 			cursor:pointer;
 			transition: all .5s cubic-bezier(0.68, -2, 0.265, 1.55);
	 	}

	 	.contact:hover{
	 		transform: scale(1.1);
	 	}

	</style>
	<div id='game_menu' style="text-align: center; animation: appear 1s ease">
  `;
	return mydata;
}
function uiGetViewerItem(item, tables = [], show_key) {
	let bg = randomColor(); //getColorDictColor(item.color);

	return `
	<div onclick="start_game(event)" gamename=${item.id} style='overflow:hidden;cursor:pointer;border-radius:10px;margin:10px;padding:5px;padding-top:15px;width:120px;min-height:90px;display:inline-block;background:${bg}'>
	<span style='font-size:50px;font-family:${item.family}'>${item.text}</span><br>${show_key ? item.key : item.E}</div>
	`;
}
function uiGetViewer(mygames, tables, show_key) {
	mydata = '';
	for (const row of mygames) {
		mydata += uiGetViewerItem(row, tables, show_key);
	}
	return mydata;
}



//orig code von chatas games menu!
function createGamesContent(mygames, tables = []) {
	let mydata = uiGetGamesStylesAndStart();
	mydata += uiGetGames(mygames, tables);
	return mydata;
}
function uiGetGamesStylesAndStart() {
	let mydata = `
	<style>
		@keyframes appear{

			0%{opacity:0;transform: translateY(50px)}
			100%{opacity:1;transform: translateY(0px)}
 		}

 		.contact{
 			cursor:pointer;
 			transition: all .5s cubic-bezier(0.68, -2, 0.265, 1.55);
	 	}

	 	.contact:hover{
	 		transform: scale(1.1);
	 	}

	</style>
	<div id='game_menu' style="text-align: center; animation: appear 1s ease">
  `;
	return mydata;
}
function uiGetGame(gi, tables = []) {
	let sym = Syms[gi.logo];
	let bg = getColorDictColor(gi.color);
	return `
	<div onclick="start_game(event)" gamename=${gi.id} style='cursor:pointer;border-radius:10px;margin:10px;padding:5px;padding-top:15px;width:120px;height:90px;display:inline-block;background:${bg}'>
	<span style='font-size:50px;font-family:${sym.family}'>${sym.text}</span><br>${gi.friendly}</div>
	`;
}
function uiGetGames(mygames, tables) {
	mydata = '';
	for (const r of mygames) {
		row = r;
		mydata += uiGetGame(row, tables);
	}
	return mydata;
}

