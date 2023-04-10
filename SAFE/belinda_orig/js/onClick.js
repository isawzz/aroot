function onClickFreezer2(ev) {
	clearTable(); mRemoveClass(mBy('freezer2'), 'aniSlowlyAppear'); hide('freezer2'); auxOpen = false;
	savedb();
	//startUnit();
}
function onClickFloppy() {
	savedb();
}
function onClickGear() {
	openAux();
	hide('dGear');
	hide('dFloppy');
	hide('dCalibrate');
	Settings.createSettingsUi(dAux);
}
function onClickGo(ev) {
	if (isVisible('dTemple')) {
		closeAux();
		if (G.controllerType == 'solitaire') GC.startGame(); else GC.activateUi();
	} else {
		let item = isdef(ev) ? evToItemC(ev) : null;
		let gKey = nundef(ev) ? SelectedMenuKey : isString(ev) ? ev : item.id; // divKeyFromEv(ev);
		if (gKey != SelectedMenuKey) {
			if (isdef(SelectedMenuKey)) toggleItemSelection(Items[SelectedMenuKey]);
			SelectedMenuKey = gKey;
			let item = Items[SelectedMenuKey];
			toggleItemSelection(item);
		} else {
			closeAux();
			setGame(gKey);
			GC.startGame();
		}
	}
}
function onClickMenuItem(ev) { onClickGo(ev); }
function onClickNextGame(){	setNextGame(); GC.startGame();}
function onClickShield(ev){ 
	ev.stopPropagation(); 
	console.log('wait...');
	hideShield();
}
function hideShield(){setTimeout(()=>{mBy('dShield').style.display = 'none'},500);}
function showShield(){mBy('dShield').style.display = 'block';}
function onClickTemple() {
	openAux();
	hide('dTemple');
	createMenuUi(dAux, U.avGames, onClickMenuItem);
}



//#region helpers
function clearTimeouts() {
	onclick = null;
	clearTimeout(TOMain); //console.log('TOMain cleared')
	//clearTimeout(TOLong); console.log('TOLong cleared')
	clearTimeout(TOFleetingMessage);
	clearTimeout(TOTrial);
	if (isdef(TOList)) { for (const k in TOList) { TOList[k].map(x => clearTimeout(x)); } }
}
function closeAux() {
	hide(dAux);
	hide('dGo');
	show('dGear');
	show('dFloppy');
	show('dTemple');
	if (Settings.hasChanged) { Settings.updateSettings(); db_save(); }
	Settings.hasChanged = false;
	auxOpen = false;
}
function interrupt() {
	//console.log('iiiiiiiiiiiiiiiiiiiiiiii')
	STOPAUS = true;
	uiActivated = aiActivated = false;
	clearTimeouts(); //legacy
	if (isdef(G.clear)) G.clear();
	if (isdef(GC.clear)) GC.clear();
	TOMan.clear();
	clearMarkers();

}
function openAux() { interrupt(); show(dAux); show('dGo'); }
