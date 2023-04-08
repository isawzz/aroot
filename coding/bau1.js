function create_left_side_extended() {
	let dl = dLeft;
	mClear(dLeft);
	let [dt, dse, dsb, dft, dfta] = [mDiv(dl), mDiv(dl), mDiv(dl), mDiv(dl), mDiv(dl)];

	for (const d of [dt, dse, dsb, dft, dfta]) mStyle(d, { padding: 4, hmin: 10 })

	//hier kommt die neue ui!
	mClosureUI(dt)


	mSearchGoLive('keywords', mySearch, dse, { hmargin: 6 }, { selectOnClick: true });

	let dm = mDom(dft, {}, { html: 'Edit Code:' });
	mButton('closure', compute_closure, dm)
	let r = getRect(dm);
	//console.log(r.y + r.h);
	//let h = `calc( 100vh - ${r.y + r.h} )`;
	h = window.innerHeight - (r.y + r.h + 4); mStyle(dfta, { h: h, box: true, padding: 4 });
	AU.ta = mDom(dfta, { fz: 18, family: 'consolas', w100: true, box: true, h: '99%', bg: 'white', fg: 'black' }, { tag: 'textarea', id: 'ta', className: 'plain' });


}
function test_ui_extended() {
	mClear(document.body);
	let d1 = mDom(document.body, {}, { classes: 'fullpage airport' });
	let [dl, dr] = mColFlex(d1, [7, 2]);
	for (const d of [dl, dr]) mStyle(d, { bg: rColor('blue', 'green', .5) })
	//return;

	mStyle(dr, { h: '100vh', fg: 'white' })
	dSidebar = mDiv100(dr, { wmax: 240, overy: 'auto', overx: 'hidden' }, 'dSidebar'); //,{h:window.innerHeight},'dSidebar')
	dLeft = dl;
	onresize = create_left_side_extended;
	create_left_side_extended();
}

























