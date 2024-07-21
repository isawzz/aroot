onload = start; var FirstLoad = true;

function start() { let uname = localStorage.getItem('coname'); if (isdef(uname)) U = { name: uname }; phpPost({ app: 'cosensus' }, 'coassets'); }
function start_with_assets() {

	//console.log('users', Serverdata.users, 'contrib', Serverdata.contrib);
	dTable = mBy('dWrapper'); mCenterFlex(dTable); mStyle(dTable, { position: 'relative' });
	mButtonX('dAdmin');

	show_motto();

	document.body.style.backgroundImage=`url("https://img.youtube.com/vi/FMrtSHAAPhM/maxresdefault.jpg")`;
	
	return;
	let d = mBy('imgY');
	d.onload=(ev)=>{
		let pal = colorPaletteFromImage(ev.target);
		mStyle(document.body,{bg:pal[0],fg:pal[5],'background-image':`url(${ev.target.src})`});
		d.remove();
		};
	
	console.log('d',d)
	//start_sound();

}
function start_sound(){

}
function show_home() {
	console.log('hallo! should clear table!!!')
	mClear(dTable);
	show_motto();
	mLinebreak(dTable, 40);
	show_compose();
	mLinebreak(dTable, 4);
	show_recent_contributions();
}
function show_motto() {
	let d = mBy('dMotto');
	mLinebreak(d,6);
	mDiv(d, {}, null, `Chillax. Dream. Let Go.`);
	mLinebreak(d);
	mDiv(d, {}, null, `Life made simple and light.`);
}
function hide_motto(){mClear('dMotto')}
function show_compose() { mCardButton('compose', onclick_compose, dTable); }
function show_recent_contributions() {
	let d = mCard(dTable);
	let contrib = Serverdata.contrib;
	if (isEmpty(contrib)) { d.innerHTML = 'no projects yet...'; return; }


}
function show_project_editor() {
	console.log('display the project editor!');
	mClear(dTable);
	let d = mCard(dTable, {}, 'coform'); mCenterFlex(d);
	mLinebreak(d, 40);
	let d1 = mText('New Composition', d, {}, 'fett');
	mPlace(d1, 'tl', 10);
	let d2 = mButtonX(d, onclick_close_project_editor);
	mPlace(d2, 'tr', 10);

	let i = 0;
	let d3 = mInput(d, {}, 'inTitle', 'Title', 'coinput', i++); //, 'input');
	let d4 = mInput(d, {}, 'inCreator', 'Creator', 'coinput', i++, isdef(U) ? U.name : ''); //, 'input');
	let d5 = mInput(d, {}, 'inDescription', 'Short Description', 'coinput', i++); //, 'input');

	let b = mButton('next', onclick_add_question, d, {}, ['fett', 'no_outline', 'btn']);
}
function show_question_editor() {

	mLinebreak(dTable, 4)
	let d = mCard(dTable, {}, 'coform'); mCenterFlex(d);

	let iform = arrChildren(dTable).length;
	console.log('this is question number', iform);

	let d1 = mText('New Composition', d, {}, 'fett'); mPlace(d1, 'tl', 10);
	let d2 = mButtonX(d, onclick_close_question_editor);
	mPlace(d2, 'tr', 10);

	mLinebreak(d, 40);
	let i = 0;
	let d3 = mInput(d, {}, 'inTitle' + iform, 'Title', 'coinput', i++); //, 'input');
	let d4 = mInput(d, {}, 'inCreator' + iform, 'Creator', 'coinput', i++, isdef(U) ? U.name : ''); //, 'input');
	let d5 = mInput(d, {}, 'inDescription' + iform, 'Short Description', 'coinput', i++); //, 'input');

	let b = mButton('next', onclick_add_question, d, {}, ['fett', 'no_outline', 'btn']);

}



















