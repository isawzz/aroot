
function show_sidebar(list, handler) {
	dSidebar = mBy('dSidebar'); 
	mClear(dSidebar); 
	//mStyle(dSidebar, { w: 200, h: window.innerHeight - 68, overy: 'auto' });
	for (const k of list) {
		let d = mDiv(dSidebar, { cursor: 'pointer', wmin: 100 }, null, k, 'hop1')
		if (isdef(handler)) d.onclick = handler;
	}
}
function test_ui() {
	mClear(document.body);
	let d1 = mDom(document.body, {}, { classes: 'fullpage airport' });
	let [dl, dr] = mColFlex(d1, [7, 2]);
	for (const d of [dl, dr]) mStyle(d, { bg: rColor('blue', 'green', .5) })

	mStyle(dr, { h: '100vh', fg: 'white' })
	dSidebar = mDiv100(dr,{wmax:240,overy:'auto',overx:'hidden'},'dSidebar'); //,{h:window.innerHeight},'dSidebar')
	dLeft = dl;
	onresize = create_left_side;
	create_left_side();
}
function create_left_side() {
	let dl = dLeft;
	mClear(dLeft);
	let [dt, dse, dsb, dft, dfta] = [mDiv(dl), mDiv(dl), mDiv(dl), mDiv(dl), mDiv(dl)];

	for (const d of [dt, dse, dsb, dft, dfta]) mStyle(d, { padding: 4, hmin: 10 })

	mSearch('keywords', mySearch, dse, { hmargin: 6 }, { selectOnClick: true });

	let dm = mDom(dft, {}, { html: 'Edit Code:' });
	let r = getRect(dm);
	console.log(r.y + r.h);
	//let h = `calc( 100vh - ${r.y + r.h} )`;
	h = window.innerHeight - (r.y + r.h + 4); mStyle(dfta, { h: h,box:true,padding:4 });
	AU.ta = mDom(dfta, { fz: 18, family: 'consolas', w100: true, box: true, h: '99%', bg: 'white', fg: 'black' }, { tag: 'textarea', id: 'ta', className: 'plain' });


}
function _test_ui() {
	let dbody = document.body; mClass(dbody, 'fullpage airport'); addDummy(dbody);
	let areas = [
		'dTestButtons dTestButtons',
		'dSearch dSidebar',
		'dFiddle dSidebar',
		'dTable dSidebar',
		'dFooter dSidebar',
	];
	let cols = '1fr 240px';
	let rows = 'auto auto 1fr auto auto';

	let [bg, fg] = [rColorTrans(50, 10, 100, [150, 230]), 'contrast']; //console.log('colors:', bg, fg);	//bg='hsla(120,100%,25%,0.3)';
	dPage = mGridFrom(dbody, areas, cols, rows); //, { hmax:'96%',padding: 4, box: true, bg: bg, fg: fg });

	// for(const ch of arrChildren(dPage)){mStyle(ch,{bg:rColor()})}
	for (const ch of [dTestButtons, dSearch, dFiddle, dSidebar, dTable, dFooter]) { mStyle(ch, { bg: rColor('green', 'blue', .5) }) };

	let elem = mSearch('keywords:', mySearch, dSearch, {}, { selectOnClick: true });

}
function rest() {
	let areas = [
		'dTestButtons dTestButtons',
		'dSearch dSidebar',
		'dFiddle dSidebar',
		'dTable dSidebar',
		'dFooter dSidebar',
	];
	let cols = '1fr 240px';
	let rows = 'auto auto 1fr auto auto';

	let [bg, fg] = [rColorTrans(50, 10, 100, [150, 230]), 'contrast']; //console.log('colors:', bg, fg);	//bg='hsla(120,100%,25%,0.3)';
	dPage = mGridFrom(d, areas, cols, rows, { hmax: '96%', padding: 4, box: true, bg: bg, fg: fg });

	let elem = mSearch('keywords:', mySearch, dSearch, {}, { selectOnClick: true });
	let bs = mDiv(elem, { 'grid-column': '1 / span 3', display: 'flex', gap: 4 });
	mButton('name', onclickFulltext, bs, { align: 'center', w: 110 });
	mButton('insensitive', onclickCase, bs, { align: 'center', w: 210 });
	mButton('anywhere', onclickWhere, bs, { align: 'center', w: 210 });

	mStyle(dFiddle, { h: 800, bg: GREEN });
	mDom(dFiddle, {}, { html: 'Edit Code:' });
	AU.ta = mDom(dFiddle, { fz: 18, family: 'consolas', w100: true, box: true, h: 'rest', bg: colorTrans(bg, 1), fg: 'black' }, { tag: 'textarea', id: 'ta', className: 'plain' });

	mFlex(dTestButtons);
	mButton('TEST', onclickTest, dTestButtons); //mDom(dTestButtons, { bg: bg, hpadding: 10, vpadding: 4, rounding: 8, cursor: 'pointer' }, { onclick: onclickTest, className: 'hop1', html: 'TEST' });

	addEventListener('keydown', execute_on_control_enter)
	//mDom(dTable, {margin:10,bg:'#222'}, { html: 'HAAAAAAAAAALLLLLLLLLOOOOOO', editable: true, selectOnClick: true });
	//dUnten = mDiv(dTable, {box:true,w:'100%',h:400,bg:'#222'});
}









function execute_on_control_enter(ev) {
	if (ev.ctrlKey && ev.key == 'Enter') {
		console.log('!!!')
		x = runcode(mBy('ta').value)
		//console.log('TEST!', x)
	}
}
















