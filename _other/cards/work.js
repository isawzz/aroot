function makePage(){
	var dMain = document.getElementById('dMain');
	mStyle(dMain, { bg: 'indigo' });
	let [dHeaderLeft, dTitle, dHeaderRight] = std3title(dMain, 'Aristocracy', { family: 'AlgerianRegular' }); // mDiv(dMain, { bg: 'random' }, 'dHeader', 'header');
	let [dLeft, dMiddle, dRight] = std3fold(dMain);
	let dFooter = mDiv(dMain, { bg: '#00000050' }, 'dFooter', 'footer');

	let bMenuLeft = stdMenuButton(dHeaderLeft);
	stdSidebarController(bMenuLeft, 'dLeft');
	let bMenuRight = stdMenuButton(dHeaderRight);
	stdSidebarController(bMenuRight, 'dRight');
	return dMiddle;
}
function stdMenuButton(dParent, styles={}) { return mButton(UnicodeSymbols.menu, null, dParent, styles, 'mybutton'); }
function stdSidebarController(button, id) {
	let [ms, easing] = [500, 'cubic-bezier(0.25, 0.1, 0.25, 1.0)'];
	button.onclick = () => {
		let d = mBy(id);
		let open = nundef(d.isOpen) || d.isOpen == true;
		d.isOpen = !open;
		let r = parseRect(d);
		console.log('rect attribute is',r);
		let wNeeded = isdef(r)?r.w:100;
		let [from, to] = open ? [wNeeded, 0] : [0, wNeeded];
		console.log('sidebar is',open?'OPEN':'CLOSED','wNeeded',wNeeded,'from',from,'to',to);

		d.animate([{ width: `${from}px` }, { width: `${to}px` }], { duration: ms, easing: easing });
		setTimeout(() => d.style.width = `${to}px`, ms - 10);
	}

}
function std3title(dParent,title, titleStyles) {
	let prefix = 'title';
	let dOuter = mDiv(dParent, { bg: '#000000', alpha:.5, display: 'flex', 'flex-flow': 'row'});//, 'align-items': 'center' });
	let dLeft = mDiv(dOuter, { w: 100 }, `d${prefix}Left`);
	let dMiddle = mDiv(dOuter, {  align:'center', flex: '1 0 auto' }, `d${prefix}Middle`, title);
	mCenterCenterFlex(dMiddle);
	if (isdef(titleStyles)) mStyle(dMiddle,titleStyles);
	let dRight = mDiv(dOuter, { align:'right', wmin: 100, overflow: 'hidden' }, `d${prefix}Right`);
	return [dLeft, dMiddle, dRight];
}
function std3fold(dParent) {
	let dOuter = mDiv(dParent, {  flex: '1 0 auto', display: 'flex', 'flex-flow': 'row' });
	let dLeft = mDiv(dOuter, { w: 100 }, 'dLeft', 'left');
	let dMiddle = mDiv(dOuter, {position:'relative', bg:'#ffffff80', flex: '1 0 auto' }, 'dMiddle');
	let dRight = mDiv(dOuter, { w: 100, overflow: 'hidden' }, 'dRight', 'right');
	return [dLeft, dMiddle, dRight];
}
function std2fold(dParent) {
	let dOuter = mDiv(dParent, { bg: 'random', flex: '1 0 auto', display: 'flex', 'flex-flow': 'row wrap' });
	let dLeft = mDiv(dOuter, { bg: 'random', w: 100 }, 'dLeft', 'left');
	let dMiddle = mDiv(dOuter, { bg: 'random', flex: '1 0 auto' }, 'dMiddle', 'middle');
	return [dLeft, dMiddle];
}
function mRight(dParent, d, margin = 0) {
	mStyle(dParent, { display: 'flex', 'justify-content': 'space-between', 'align-items': 'center' });
	mAppend(dParent, d);
	mStyle(d, { margin: margin, 'align-self': 'flex-end' });
	return d;

}
function mLeft(dParent, d, margin = 0) {
	mStyle(dParent, { display: 'flex', 'justify-content': 'space-between', 'align-items': 'center' });
	mInsertFirst(dParent, d);
	mStyle(d, { margin: margin, 'align-self': 'flex-start' });
	return d;

}
function animateStyles(d, styles1, styles2, ms) {
	// if (isdef(styles1)) {
	// 	d.style.transition = 'unset';
	// 	mStyle(d, styles1);
	// }
	d.style.transition = `${ms}ms`;
	mStyle(d, styles2);

}
function pageLayout33() {
	var dMain = document.getElementById('dMain');
	let dHeader = mDiv(dMain, { bg: 'random' }, 'dHeader', 'header');
	let dOuter = mDiv(dMain, { bg: 'random', flex: '1 0 auto', display: 'flex', 'flex-flow': 'row wrap' });
	let dLeft = mDiv(dOuter, { bg: 'random', flex: '0 0 200px' }, 'dLeft', 'left');
	let dMiddle = mDiv(dOuter, { bg: 'random', flex: '1 0 auto' }, 'dMiddle', 'middle');
	let dRight = mDiv(dOuter, { bg: 'random', flex: '0 0 200px' }, 'dRight', 'right');
	let dFooter = mDiv(dMain, { bg: 'random' }, 'dFooter', 'footer');
	//mSize(dHeader,'100%',50);

	return {
		dHeader: dHeader,
		dLeft: dLeft,
		dRight: dRight,
		dMiddle: dMiddle,
		dFooter, dFooter
	}

}
