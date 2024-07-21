async function start() {
	dTable = makePage(); 

}






function testMuell0(){
	//dTable = mBy('dMain'); mCenterCenterFlex(dTable); cardGameTest05();
	dTable = makePage(); //mCenterFlex(dTable); //mCenterCenterFlex(dTable); //makeAreasKrieg(dTable); //cardGameTest05();
	mStyle(dTable,{display:'flex',})
	let dGrid = mDiv(dTable, { wmin:110, hmin:70, bg: 'white', padding: 3, rounding: 6 });
	let d = mTitledMessageDiv('title', dGrid, 'id1', 
	{ bg: 'green', rounding: 6 }, 
	{ lowerRounding: 6 },
	{ bg: 'dimgray', align:'center', 'line-height':30, family: 'AlgerianRegular', upperRounding: 6 }, 
	{ fg: 'yellow', padding:10 }, 
	true);
}
function testMakeAreas(dParent) {
	// setBackgroundColor('random');
	let dGrid = mDiv(dParent, { gap: 10, bg: 'white', w: '90%', padding: 10, display: 'inline-grid', rounding: 10 }, 'dGrid');
	let layout = ['T', 'H A'];
	//let layout = ['t', 'H A'];
	let x = createGridLayout(dGrid, layout); //teilt dGrid in areas ein

	//more intricate layout!
	let areaStyles = { bg: 'green', hmin:200, rounding: 6 };//,box:true, padding:10};
	let contentStyles = { lowerRounding: 6 };
	let messageStyles = { fg: 'yellow' };
	let titleStyles = { bg: 'dimgray', family: 'AlgerianRegular', upperRounding: 6 };
	let areas = {
		T: { title: 'table', id: 'dTrick', showTitle: true, messageArea: true, areaStyles: areaStyles, contentStyles: contentStyles, messageStyles: messageStyles, titleStyles: titleStyles, titleOnTop: true },
		H: { title: 'YOU', id: 'dHuman', showTitle: true, messageArea: true, areaStyles: areaStyles, contentStyles: contentStyles, messageStyles: messageStyles, titleStyles: titleStyles, titleOnTop: false },
		A: { title: 'opponent', id: 'dAI', showTitle: true, messageArea: true, areaStyles: areaStyles, contentStyles: contentStyles, messageStyles: messageStyles, titleStyles: titleStyles, titleOnTop: false },
	};

	//createAreas(dGrid, x, 'dGrid');
	let items = [];
	for (const k in areas) {
		let item = areas[k];
		item.areaStyles['grid-area'] = k;
		let dCell = mTitledMessageDiv(item.title, dGrid, item.id, item.areaStyles, item.contentStyles, item.titleStyles, item.messageStyles, item.titleOnTop)
		//console.log('children', dCell.children);
		iRegister(item, item.id);
		if (item.titleOnTop) iAdd(item, { div: dCell, dTitle: dCell.children[0], dMessage: dCell.children[1], dContent: dCell.children[2] });
		else iAdd(item, { div: dCell, dTitle: dCell.children[2], dMessage: dCell.children[0], dContent: dCell.children[1] });
		mCenterCenterFlex(diContent(item));
		mStyle(diContent(item), { gap: 10 });//,padding:10, box:true});
		items.push(item);
	}
	return items;


}
function presentSimpleVal(d, item) {
	let d1 = mDiv(d, { display: 'inline-block', bg: 'random', rounding: 10, margin: 10, padding: 10 });
	d1.innerHTML = item;

}
function present0(dParent, item) {
	for (const k in item) {
		val = item[k];
		let d = mDiv(dParent, { display: 'inline-block', bg: 'random', rounding: 10, margin: 10, padding: 10 });
		//let dCell = mTitledMessageDiv(item.title, dGrid, item.id, item.areaStyles, item.contentStyles, item.titleStyles, item.messageStyles)
		//let dTitle = mDiv(d,{}
		//mCenterCenterFlex(d);
		if (isDict(val)) {
			present0(d, val);
		} else if (isList(val)) {
			val.map(x => presentSimpleVal(d, x));

		} else {
			presentSimpleVal(d, val);
		}
		// else {
		// 	present0(d, val);
		// }
	}
}
function pTest0() {
	let state = DB.tables.t0;
	console.log('state', state);
	let dMiddle = makePage();
	mStyle(dMiddle, { padding: 20, overflow: 'auto' });
	mCenterCenterFlex(dMiddle)

	// let dTable = mDiv100(dMiddle,{flex:'0 0 100%', bg:'green',box:true,rounding:12,display:'flex','flex-flow':'row wrap'});
	let dTable = mDiv100(dMiddle, { wmax: 800, box: true, rounding: 12 });
	//setRect(dTable);
	//dTable.style.maxWidth = dTable.width+'px';
	dTable.style.overflow = 'auto';
	console.log('dTable', dTable)
	// mFlexWrap(dTable);
	present0(dTable, state);
	//present_simple(dTable,state)
	return;

	mCenterCenterFlex(dTable);
	let d1 = mDiv(dTable);


	let d2 = present_structured1(d1, state);

}
function test12_backToPresent() {
	// present_state_player(dMain, state, 'felix');
	// mCenterCenterFlex(dMain);	present_auto(dMain, state);
	// mCenterCenterFlex(dMain);	present_simple(dMain, state);
	// mCenterCenterFlex(dMain);	present_structured(dMain, state);

	dMenu = mMenuLine(dMain);
	dMenu.style.display = 'block';
	let bToggle = mMenuButton(dMenu);
	//return;
	let d = mDiv(dMain);
	mCenterFlex(d);
	let d1 = present_structured1(d, state);

	let sb = iSidebar(mDiv(d), d1, bToggle, 40, true);
	//mCenterCenterFlex(dMain);	present_simple0(dMain, state);


}

//#region testing page layout tricks =>work.js
//test0_divRestOfPage();
//test1_3colHeaderFooter();
//test2_2rows();
//test3_3rows(); //ok
//test5_33mitMenuButtons(); //ok 
//test11_besseresColoring(); //test10(); //test9(); //test8();
function test11_besseresColoring() {
	var dMain = document.getElementById('dMain');
	mStyle(dMain, { bg: 'indigo' });
	let [dHeaderLeft, dTitle, dHeaderRight] = std3title(dMain, 'Aristocracy', { family: 'AlgerianRegular' }); // mDiv(dMain, { bg: 'random' }, 'dHeader', 'header');
	let [dLeft, dMiddle, dRight] = std3fold(dMain);
	let dFooter = mDiv(dMain, { bg: '#00000050' }, 'dFooter', 'footer');

	let bMenuLeft = stdMenuButton(dHeaderLeft);
	stdSidebarController(bMenuLeft, 'dLeft');
	let bMenuRight = stdMenuButton(dHeaderRight);
	stdSidebarController(bMenuRight, 'dRight');
}
function test10() {
	var dMain = document.getElementById('dMain');
	let [dHeaderLeft, dTitle, dHeaderRight] = std3title(dMain, 'Aristocracy', { family: 'AlgerianRegular' }); // mDiv(dMain, { bg: 'random' }, 'dHeader', 'header');
	let [dLeft, dMiddle, dRight] = std3fold(dMain);
	let dFooter = mDiv(dMain, { bg: 'random' }, 'dFooter', 'footer');

	let bMenuLeft = stdMenuButton(dHeaderLeft);
	stdSidebarController(bMenuLeft, 'dLeft');
	let bMenuRight = stdMenuButton(dHeaderRight);
	stdSidebarController(bMenuRight, 'dRight');
}
function test9() {
	var dMain = document.getElementById('dMain');
	let [dHeaderLeft, dTitle, dHeaderRight] = std3title(dMain, 'Aristocracy'); // mDiv(dMain, { bg: 'random' }, 'dHeader', 'header');
	let [dLeft, dMiddle] = std2fold(dMain);
	let dFooter = mDiv(dMain, { bg: 'random' }, 'dFooter', 'footer');

	let bMenuLeft = stdMenuButton(dHeaderLeft);
	stdSidebarController(bMenuLeft, 'dLeft');
}
function test8() {
	var dMain = document.getElementById('dMain');
	let dHeader = mDiv(dMain, { bg: 'random' }, 'dHeader', 'header');
	let [dLeft, dMiddle] = std2fold(dMain);
	let dFooter = mDiv(dMain, { bg: 'random' }, 'dFooter', 'footer');

	let bMenuLeft = stdMenuButton();
	mLeft(dHeader, bMenuLeft);
	stdSidebarController(bMenuLeft, 'dLeft');
}
function test7() {
	var dMain = document.getElementById('dMain');
	let dHeader = mDiv(dMain, { bg: 'random' }, 'dHeader', 'header');
	let [dLeft, dMiddle, dRight] = std3fold(dMain);
	let dFooter = mDiv(dMain, { bg: 'random' }, 'dFooter', 'footer');

	let bMenuLeft = stdMenuButton();
	mLeft(dHeader, bMenuLeft);
	stdSidebarController(bMenuLeft, 'dLeft');

	let bMenuRight = stdMenuButton();
	mRight(dHeader, bMenuRight);
	stdSidebarController(bMenuRight, 'dRight');

}
function test6_33mitMenuButtons() {
	let page = pageLayout33(); //ok!

	let bMenuRight = stdMenuButton();
	mRight(page.dHeader, bMenuRight);

	// let fToggle = (ev, animate = true) => {
	// 	d1.isOpen = !d1.isOpen;
	// 	let val = d1.isOpen ? d1.wNeeded : 0;
	// 	if (animate) multiStyleAnimation([[d1, { w: val }], [d2, { maleft: val }]], 500, tell);
	// 	else { mStyle(d1, { w: val }); mStyle(d2, { maleft: val }); tell(); }
	// }

	let bMenuLeft = stdMenuButton();
	mLeft(page.dHeader, bMenuLeft);


	dLeft.style.flex = 'unset';//'1 1 200px';
	bMenuLeft.onclick = () => {
		mStyle(mBy('dLeft'), { wmin: 0, w: 0 });
		// let open = nundef(page.dLeft.isOpen) || page.dLeft.isOpen == true;
		// console.log('haaaaaaaaaaaaaaaaa', open);
		// animateStyles(page.dLeft,{w:open?200:0},{w:open?0:200},2000);
		// page.dLeft.isOpen = !open;
	}
}
function test5_33mitMenuButtons() {
	let page = pageLayout33(); //ok!

	let bMenuRight = stdMenuButton();
	mRight(page.dHeader, bMenuRight);

	let bMenuLeft = stdMenuButton();
	mLeft(page.dHeader, bMenuLeft);
}
function test4_3rows() {
	var dMain = document.getElementById('dMain');
	let dHeader = mDiv(dMain, { bg: 'random' }, 'dHeader', 'header');
	let dOuter = mDiv(dMain, { bg: 'random', flex: '1 0 auto', display: 'flex', 'flex-flow': 'row wrap' });
	let dLeft = mDiv(dOuter, { bg: 'random', flex: '0 0 200px' }, 'dLeft', 'left');
	let dMiddle = mDiv(dOuter, { bg: 'random', flex: '1 0 auto' }, 'dMiddle', 'middle');
	let dRight = mDiv(dOuter, { bg: 'random', flex: '0 0 200px' }, 'dRight', 'right');
	let dFooter = mDiv(dMain, { bg: 'random' }, 'dFooter', 'footer');
	mSize(dHeader, '100%', 50);
}
function test3_3rows() {
	var dMain = document.getElementById('dMain');
	let dHeader = mDiv(dMain, { bg: 'random' }, 'dHeader', 'header');
	let dOuter = mDiv(dMain, { bg: 'random', flex: '1 0 auto' }, 'dOuter', 'outer');
	let dFooter = mDiv(dMain, { bg: 'random' }, 'dFooter', 'footer');
	mSize(dHeader, '100%', 50);
}
function test2_2rows() {
	var dMain = document.getElementById('dMain');
	let dHeader = mDiv(dMain, {}, 'dHeader', 'header', ['div1']);
	let dOuter = mDiv(dMain, {}, 'dOuter', 'outer', ['div2']);
}
function test1_3colHeaderFooter() {
	var dMain = document.getElementById('dMain');
	//mClass(dMain,'container');
	let dHeader = mDiv(dMain, { bg: '#ABC', hmin: 150 }, 'dHeader', 'header');
	let dOuter = mDiv(dMain, { bg: '#678', hmin: 500, display: 'flex', 'flex-flow': 'row wrap' }, 'dOuter');
	let dLeft = mDiv(dOuter, { bg: 'random', flex: '0 0 200px' }, 'dLeft', 'left');
	let dMiddle = mDiv(dOuter, { bg: 'random', flex: '1 0 auto' }, 'dMiddle', 'middle');
	let dRight = mDiv(dOuter, { bg: 'random', flex: '0 0 200px' }, 'dRight', 'right');
	let dFooter = mDiv(dMain, { bg: '#456', hmin: 100 }, 'dFooter', 'footer');



}
function test0_divRestOfPage() {
	console.log('DB', DB);
	console.log('C52', C52);

	let state = DB.tables.t0;
	console.log('state', state);

	var dMain = document.getElementById('dMain');

	let dMenu = mDiv(dMain, { bg: 'blue' }, null, '<span>hallo</span>');

	//insert a button at beginning of dMenu
	let bMenu = mButton(UnicodeSymbols.menu, null, null, null, 'mybutton');
	mInsertFirst(dMenu, bMenu);

	let dRest = mDivRestOfPage(dMain, dMenu);

	//mButton(caption, handler, dParent, styles, classes, id)
	let bTest = mButton('test', () => mSize(dMenu, 20, 80, '%'), dMenu, null, 'mybutton');

}

//#endregion






