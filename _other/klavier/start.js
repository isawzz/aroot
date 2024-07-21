window.onload = start;

async function start() {

	test09_WTF_das_ist_ambra();


}
function mRow(dParent, styles) {
	return mDiv(dParent, styles)
}
function iMenuLine(dParent, styles) {
	let d = mRow(dParent, styles);
	console.log('d', d)
	let item = mItem('dMenu', { div: d }, { type: 'menu' });
	return item;
}

function iMenuSidebarDiv(dParent, options) {

	let d0 = mDiv100(dParent, options.outerStyles);
	setRect(d0); //console.log(d0)

	let dMenu = mDiv(d0, options.menuStyles);
	let b = mButton(options.bCaption, null, dMenu, options.bStyles, 'mybutton', getUID('b'));
	setRect(dMenu, { hfix: true, wgrow: true });

	let st = options.innerStyles;
	st.position = 'relative';
	st.h = d0.rect.h - dMenu.rect.h - valf(st.matop, 0);

	let d = mDiv(d0, options.innerStyles);

	let dSide = mDiv(d, options.sbStyles);
	let dContent = mDiv(d, options.divStyles, getUID());

	let sb = iSidebar(dSide, dContent, b, 120, false);

	let item = mItem(getUID('comp'), { div: d0, button: b, dMenu: dMenu, sidebar: sb, dContent: dContent }, { type: 'component' });
	return item;
}
function iButtonSidebarDiv(dParent, bCaption = '☰', bStyles = { fz: 30 }, sbStyles = { bg: wpink }, divStyles = {}, outerStyles = { matop: 4, bg: wgrey }) {

	let d0 = mDiv100(dParent);

	//let dMenu = mDiv(d0);
	let b = mButton(bCaption, null, d0, bStyles, 'mybutton', getUID('b'));

	outerStyles.position = 'relative';
	//let d = mDiv100(dMain, { matop: 4, position: 'relative', });
	let h = getRect(d0).h - (getRect(b).h + outerStyles.matop);
	outerStyles.h = h;

	let d = mDiv(d0, outerStyles); //mStyle(d, { h: h })

	let dSide = mDiv(d, sbStyles);
	let dContent = mDiv(d, divStyles, getUID());

	let sb = iSidebar(dSide, dContent, b, 120, false);

	let item = mItem(getUID('comp'), { div: d0, button: b, sidebar: sb, dContent: dContent }, { type: 'component' });
	return item;
}

function test09_WTF_das_ist_ambra() {
	let comp = qPageMST(mBy('dMain'), qOptions());

	ex00_sidebar(comp.sidebar);
}
function test09_WTF_start(){
	ex01_table(comp.dContent);

	// mCenterFlex(dTable);
	// let tileStyles = { bg: 'pink', w: 300, h: 300, margin: 20 };
	// let d1 = mDiv(dTable, tileStyles);
	// let d2 = mDiv(dTable, tileStyles);
	// mGap(dTable, 10);
	// let d3 = mDiv(dTable, tileStyles);
	// let d4 = mDiv(dTable, tileStyles);
	// iMenuSidebarDiv(d1, qOptions())
	// iMenuSidebarDiv(d4, qOptions())

	mCenterFlex(dTable);
	let tileStyles1 = { bg: 'pink', w: 300, h: 300, margin: 20 };
	let [rows, cols] = [5, 5];
	for (let r = 0; r < rows; r++) {
		for (let c = 0; c < cols; c++) {
			let d1 = mDiv(dTable, tileStyles1);
			if (coin()) iMenuSidebarDiv(d1, qOptions());
		}
		mGap(dTable, 0);
	}



}
function test08_WTF() {
	let d = mBy('dMain');
	let menu = iMenuLine(d, { bg: 'dark' });
	console.log('iDiv', iDiv(menu));
	let title = mText('hello!', iDiv(menu), { fz: 30 }); //mText(text, dParent, styles, classes)

}
function test07_menu_sidebar_div() {
	let dMain = mBy('dMain');
	mStyle(dMain, { h: '100%', w: '100%', box: true, bg: 'silver', padding: 10 });
	//console.log('isdef', isdef(dMain.style.position), dMain.style.position, isEmpty(dMain.style.position))
	setRect(dMain); //console.log(dMain)

	let item = iMenuSidebarDiv(dMain, options);

	let dover = mDover(dMain, { bg: 'red', alpha: .25 });

	setTimeout(() => iDelete(item.live.sidebar), 5000)
}

function coButtonSidebarDiv_00(dParent, bCaption = '☰', bStyles = { fz: 30 }, sbStyles = { bg: wpink }, divStyles = {}, outerStyles = { matop: 4, bg: wgrey }) {

	let d0 = mDiv100(dParent);

	let b = mButton(bCaption, null, d0, bStyles, 'mybutton');

	outerStyles.position = 'relative';
	//let d = mDiv100(dMain, { matop: 4, position: 'relative', });
	let h = getRect(d0).h - (getRect(b).h + outerStyles.matop);
	outerStyles.h = h;

	let d = mDiv(d0, outerStyles); //mStyle(d, { h: h })

	let dSide = mDiv(d, sbStyles);
	let dContent = mDiv(d, divStyles);

	let sb = iSidebar(d, dSide, dContent, b, 120, false);

	return { button: b, sidebar: sb, div: dContent };
}
function test06_coButtonSidebarDiv() {
	let dMain = mBy('dMain');
	mStyle(dMain, { h: '100%', w: '100%', box: true, bg: 'silver', padding: 10 });
	let co = coButtonSidebarDiv(dMain);
	console.log('co', co)
	let co2 = coButtonSidebarDiv(co.div);
}

function test05_div_mit_sidebar() {
	let dMain = mBy('dMain');
	mStyle(dMain, { h: '100%', w: '100%', box: true, bg: 'silver', padding: 10 });

	let b = mButton('☰', null, dMain, { fz: 36 }, 'mybutton');
	let d = mDiv100(dMain, { matop: 4, position: 'relative', });

	let dSide = mDiv(d, { bg: 'silver' });
	let dContent = mDiv(d, { bg: worange });

	let sb = iSidebar(d, dSide, dContent, b, 120, false);
	// b.onclick = sb.toggle;

}
function test04_div_mit_sidebar() {
	let dMain = mBy('dMain');
	mStyle(dMain, { h: '100%', w: '100%', box: true, bg: 'silver', padding: 10 });

	let d = mDiv100(dMain, { position: 'relative', });

	let d1 = mDiv(d, { bg: wdeeporange });
	let d2 = mDiv(d, { bg: worange });

	let sb = iSidebar04(d, d1, d2, d2, 50);

	// iDiv(sb).innerHTML = 'superlongword!!!!!'; sb.wNeeded = getRect(iDiv(sb)).w; iDiv(sb).wNeeded = sb.wNeeded;
	sb.addContent('wwwwwwwwwwwwwwwwwwwwwwwwww');

	sb.toggle();
	//sb.toggle();

	sb.addContent('s');

	sb.toggle();
	//sb.addContent('wwwwwwwwwwwwwwwwwwwwwwwwww');

}
function iSidebar04(d, d1, d2, dToggle = null, w = 100, startOpen = true) {
	mStyle(d1, { h: '100%', w: startOpen ? w : 0, position: 'absolute', z: 1, top: 0, left: 0, overflow: 'hidden', transition: '0.5s' });
	//let dContent = mDiv(d1, { w: 'auto' });
	mStyle(d2, { h: '100%', maleft: startOpen ? w : 0, box: true, transition: '0.5s' }, null, null);
	d1.isOpen = startOpen;
	let fToggle = () => {
		d1.isOpen = !d1.isOpen;
		let wOpen = valf(d1.wNeeded, w)
		mToggle(d1, 'width', 0, wOpen);
		mToggle(d2, 'margin-left', 0, wOpen);
	}
	let fOpen = () => {
		if (d1.isOpen) return;
		fToggle();
	}
	let fClose = () => {
		if (!d1.isOpen) return;
		fToggle();
	}
	let fReplaceContent = cont => {
		//if (!d1.isOpen) fOpen();
		d1.style.width = 'auto'; //need to measure content!
		d1.innerHTML = cont;
		let wNeeded = d1.wNeeded = getRect(d1).w;
		d1.wCurrent = d1.style.width = makeUnitString(wNeeded); //Math.max(wCurrent, wNeeded));
		console.log('now wNeeded is', d1.wNeeded);
		if (!d1.isOpen) d1.style.width = 0;
	};
	let fAddContent = cont => {
		//if (!d1.isOpen) fOpen();
		d1.style.width = 'auto'; //need to measure content!
		mAppend(d1, isString(cont) ? mText(cont, d1) : cont);
		let wNeeded = d1.wNeeded = getRect(d1).w;
		d1.wCurrent = d1.style.width = makeUnitString(wNeeded); //Math.max(wCurrent, wNeeded));
		console.log('now wNeeded is', d1.wNeeded);
		if (!d1.isOpen) d1.style.width = 0;
	};
	let item = mItem({ div: d1, dParent: d, dSibling: d2 });
	d1.item = item; d1.id = item.id;
	item.toggle = fToggle;
	item.open = fOpen;
	item.close = fClose;
	item.addContent = fAddContent;
	item.replaceContent = fReplaceContent;
	item.w = w;
	if (isdef(dToggle)) { item.dToggle = dToggle; dToggle.onclick = fToggle; }
	return item;
}
function test03_div_mit_sidebar() {
	let dMain = mBy('dMain');
	mStyle(dMain, { h: '100%', w: '100%', box: true, bg: 'silver', padding: 10 });

	let d = mDiv100(dMain, { position: 'relative', });

	let d1 = mDiv(d, { bg: wdeeporange });
	let d2 = mDiv(d, { bg: worange });

	let sb = iSidebar01(d, d1, d2, d2, 200);
	sb.fToggle();


}
function iSidebar01(d, d1, d2, dToggle = null, w = 100) {
	mStyle(d1, { h: '100%', w: 100, position: 'absolute', z: 1, top: 0, left: 0, overflow: 'hidden', transition: '0.5s' });
	mStyle(d2, { maleft: 100, h: '100%', box: true, transition: '0.5s' }, null, null)
	let fToggle = () => {
		mToggle(d1, 'width', 0, w); mToggle(d2, 'margin-left', 0, w);
	}
	let item = mItem({ div: d1, dParent: d, dSibling: d2 });
	item.fToggle = fToggle;
	item.w = w;
	if (isdef(dToggle)) { item.dToggle = dToggle; dToggle.onclick = fToggle; }
	return item;
}
function test02_div_mit_sidebar() {
	let dMain = mBy('dMain');
	mStyle(dMain, { h: '100%', w: '100%', box: true, bg: 'silver', padding: 10 });

	let d = mDiv100(dMain, { position: 'relative', });

	let d1 = mDiv(d, { bg: wdeeporange });
	let d2 = mDiv(d, { bg: worange });

	makeSidebar00(d, d1, d2);

}
function makeSidebar00(d, d1, d2) {
	mStyle(d1, { h: '100%', w: 100, position: 'absolute', z: 1, top: 0, left: 0, overflow: 'hidden', transition: '0.5s' });
	mStyle(d2, { maleft: 100, h: '100%', box: true, transition: '0.5s' }, null, null)
	d2.onclick = () => {
		mToggle(d1, 'width', 0, 100); mToggle(d2, 'margin-left', 0, 100);
	}
}
function test01_show_w3colors() {
	let dMain = mBy('dMain');
	mCenterCenterFlex(dMain);
	for (const c of [wblue, wred, worange, wgreen, wamber, wyellow, wbrown]) {
		let d = mDiv(dMain, { w: 100, h: 100, bg: c, margin: 10 });
	}

}
function test00_div_mit_sidebar() {
	let dMain = mBy('dMain');
	mStyle(dMain, { h: '100%', w: '100%', box: true, bg: 'silver', padding: 10 });

	let d = mDiv100(dMain, { bg: 'blue', position: 'relative', });

	let d1 = mDiv(d, { h: '100%', w: 100, position: 'absolute', z: 1, top: 0, left: 0, overflow: 'hidden', transition: '0.5s' }, null, 'hallo', ['w3-blue']);
	let d2 = mDiv(d, { maleft: 100, h: '100%', box: true, transition: '0.5s' }, null, null, ['w3-orange'])

	d2.onclick = () => {
		mToggle(d1, 'width', 0, 100); mToggle(d2, 'margin-left', 0, 100);
	}

}
function mSidebar(d) { }









