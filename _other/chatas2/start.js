window.onload = start;

function start() {
	PROJECTNAME = 'chatas';
	Speech = new SpeechAPI('E');
	TOMan = new TimeoutManager();
	ColorThiefObject = new ColorThief();

	mBy("label_contacts").onclick = ev => { game_interrupt(); get_contacts(); }
	mBy("label_chat").onclick = ev => { game_interrupt(); get_chats(); }
	mBy("label_games").onclick = ev => { game_interrupt(); get_games(); }
	mBy("label_play").onclick = ev => { if (mBy("radio_play").checked) return; get_play(); }
	mBy("label_account").onclick = ev => { game_interrupt(); get_account_info(); }

	get_data(queryStringToJson(), "user_info");

	init_keyhandlers();
	//setReloadOnClick();
	setFullscreenKey();
	//addKeyup('a', ev => { if (ev.key == 'a') console.log('keyup event for a!'); })
}


//#region make a new Syms.yaml file with w,h for each symbol
function symbolMeasuring() {
	clearElement('wrapper');
	dTable = mDiv(mBy('wrapper'), { position: 'absolute', padding: 10, bg: 'white', overflow: 'scroll' });
	let items = []; let n = SymKeys.length;
	for (let i = 0; i < n; i++) {
		let k = SymKeys[i];
		let info = Syms[k];
		let d = mDiv(dTable, { fz: 100, family: info.family, bg: 'random', display: 'inline' }, null, info.text);
		let item = { div: d, k: k, info: info };
		//let r = getRect(d);
		//console.log('r',r);
		items.push(item);
	}
	setTimeout(() => symbolMeasuring2(items), 5000);
}
function symbolMeasuring2(items) {
	for (let i = 0; i < items.length; i++) {
		let item = items[i];
		let r = getRect(item.div);
		item.info.w = Math.round(r.w);
		item.info.h = Math.round(r.h);
		//console.log('size',item.k,r.w,'x',r.h,'\nitem',item.info);

	}
	//return;
	let newDict = {};
	for (const item of items) {
		newDict[item.k] = item.info;
	}
	//now save symbolDict but how?
	downloadAsYaml(newDict, 'syms');
}
//#endregion