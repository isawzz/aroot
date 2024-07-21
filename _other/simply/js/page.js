var dMain = document.getElementById('dMain'), dTable, Step = 0;
var dCurrent = null;
var paneOpen = false;
var DELAY_PANE = 100;
var DELAY_DISAPPEAR = 100;
var DELAY_APPEAR = 100;


function initPage() {
	let colors = ['#27344b', '#485b6c', '#383e48', '#f2f7f8'];
	mStyle(dMain, { padding: 0, margin: 0 });
	//colors = ['rgb(159, 63, 9)', 'rgb(99, 6, 63)', 'rgb(201, 159, 51)', 'rgb(0, 156, 246)'];
	let dLeft = mDiv(dMain, { hmin: 500, bg: colors[0], flex: 1 }, 'dLeft');
	let dRight = mDiv(dMain, { hmin: 500, flex: 4 }, 'dRight');
	let dHeader = mDiv(dRight, { bg: colors[1], align: 'center', h: 70, fz: 40, family: 'summervibes', position: 'relative' }, 'dHeader', 'My Chat');
	let dContainer = mDiv(dRight, { display: 'flex' });
	let dInnerLeft = mDiv(dContainer, { position: 'relative', hmin: 430, bg: colors[2], flex: 1 }, 'dInnerLeft'); //, flex: 1 });
	mCenterCenterFlex(dInnerLeft);
	let dInnerRight = mDiv(dContainer, { transition: `all ${DELAY_PANE}ms ease`, hmin: 430, bg: colors[3], flex: 2, align: 'center' }, 'dInnerRight');//, flex: 2 });
	let dChatWindow = mDiv(dInnerRight, { display: 'none', 'overflow-x': 'hidden', 'overflow-y': 'auto',padding: 10, fg: 'black', align: 'left' }, 'dChatWindow');
	let dGameWindow = mDiv(dInnerRight, { display: 'none', overflow: 'hidden' }, 'dGameWindow');

	//left panel has user info
	let dUserInfo = mDiv(dLeft, { padding: 10, align: 'center' }, 'dUserInfo');

	//add labels chat contacts settings to dLeft
	let dToolbar = mDiv(dLeft, { matop: 40, align: 'center' });
	for (const t of ['Games', 'Tables', 'Chat', 'Contacts', 'Account']) {
		let text = t + ` <img src="../base/assets/images/icons/${t}.png" height="90%" style="float:right"/>`;
		let dLabel = mLabel(text, dToolbar, { padding: 5, cursor: 'pointer', w: '100%', h: 30, display: 'block', 'border-bottom': 'solid thin #ffffff55' });//,`r${t}`);
		dLabel.onclick = () => window['onClickMenu'](t.toLowerCase());

		let d = mDiv(dInnerLeft, { position: 'absolute', w: '100%', h: '100%', display: 'none' }, 'd' + t);
	}

	//let dTopToolbar = mDiv(dHeader, { position: 'absolute', top: 0, right: 10, h: 50, w: 50, bg: 'orange' });

}

//#region left pane
function closeLeftPane() {
	if (!paneOpen) return 0;
	// let left=mBy('dInnerLeft');
	let right = mBy('dInnerRight');
	// mStyle(left,{flex:1});
	mStyle(right, { flex: 2 });
	paneOpen = false;
	return DELAY_PANE;
}
function openLeftPane() {
	if (paneOpen) return 0;
	// let left=mBy('dInnerLeft');
	let right = mBy('dInnerRight');
	// mStyle(left,{flex:1});
	mStyle(right, { flex: 0 });
	paneOpen = true;
	return DELAY_PANE;
}
//#endregion

//#region loader
function showLoader() { mBy('dLoader').style.display = "unset"; }
function hideLoader() { mBy('dLoader').style.display = "none"; }
//#endregion

//#region transition 
function transitionTo(id) {
	let delay = dCurrent ? .1 : 0;
	hideCurrent();
	setTimeout(() => setCurrent(id), delay);
}
function hideCurrent() {
	if (dCurrent) {
		if (dCurrent.id == 'dChat') disappear(mBy('dChatWindow'),DELAY_DISAPPEAR);
		disappear(dCurrent, DELAY_DISAPPEAR); 
		dCurrent = null; 
		return DELAY_DISAPPEAR;
	} else return 0;
}
function showCurrent(id) { if (isdef(dCurrent) && dCurrent.id == id) { return 0; } else { dCurrent = mBy(id); mStyle(dCurrent, { overflow: 'hidden' }); show(id); return DELAY_APPEAR } };
function setCurrent(id) {
	if (dCurrent && dCurrent.id == id) return;
	else if (dCurrent) hideCurrent();
	dCurrent = mBy(id); mStyle(dCurrent, { overflow: 'hidden' }); show(id); return dCurrent;
}
//#endregion