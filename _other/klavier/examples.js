function ex02_table(dContent) {
	console.log('dContent', dContent);
	mStyle(dContent, { bg: wyellow, position: 'relative', hmin: 1600 });
	let dTable = mDiv100(dContent);
}
function ex01_table(dContent) {
	console.log('dContent', dContent);
	mStyle(dContent, { bg: wyellow, position: 'relative' });
	let dTable = mDiv100(dContent);
	let d3 = mDiv(dTable, { position: 'absolute', left: 40, top: 4, bg: 'pink', w: 300, h: 300 });

}
function ex00_sidebar(sidebar) {

	//sidebar.open(null, false);
	let styles = { hpadding: 12, vpadding: 4, fz: 20 };
	for (const link of ['short', 'link3super superlang dasdasdas', 'short']) {
		sidebar.addContent(`<a href='#'>${link}</a>`, styles);
	}
	sidebar.open(null, false);

}