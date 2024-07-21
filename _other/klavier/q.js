//quick ui
function qOptions(bg = BLUEGREEN) {
	let options = {
		bCaption: '☰',
		bStyles: { fz: 30, margin: 4 },
		menuStyles: { bg: wblack, alpha: .65 },
		sbStyles: { bg: wblack, alpha: .25 },
		divStyles: { bg: wwhite, alpha: .25 },
		innerStyles: {},
		outerStyles: { bg: bg },
	};
	return options;

}
function qPageMST(dParent, options) {

	//test07_menu_sidebar_div();
	mStyle(dParent, { h: '100%', w: '100%', box: true, bg: 'silver' }); //, padding: 10 });
	setRect(dParent);

	let item = iMenuSidebarDiv(dParent, options);

	return { item: item, sidebar: iGetl(item, 'sidebar'), dContent: iGetl(item, 'dContent'), dMenu: iGetl(item, 'dMenu') };

}
