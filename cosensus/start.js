onload = start; var FirstLoad = true;

function start() { let uname = localStorage.getItem('coname'); if (isdef(uname)) U = { name: uname }; phpPost({ app: 'cosensus' }, 'coassets'); }
function start_with_assets() {

	console.log('users', Serverdata.users, 'contrib', Serverdata.contrib);
	dTable = mBy('dWrapper'); mCenterFlex(dTable);

	//show_home();
	show_project_editor();
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
function mCardButton(caption, handler, dParent, styles, classtr = '', id = null) {
	let classes = toWords("card300 wb fett no_outline btn" + classtr);
	return mButton(caption, handler, dParent, styles, classes, id);
}
function mCard(dParent, styles, classtr = '', id = null) {
	let classes = toWords("card300 wb " + classtr);
	console.log('classes',classes);
	// classes = classes.filter(x=>!isEmpty(x));
	// for(const cl of classes){
	// 	if (cl == '') console.log('YES EMPTY!!!')
	// }
	// console.log('classes',classes);
	return mDiv(dParent, styles, id, null, classes);
}
function mButtonX(dParent, handler){
	let sz = 25;
	let d2 = mDiv(dParent, { w: sz, h: sz, pointer: 'cursor' }, null, `<i class="fa fa-times" style="font-size:${sz}px;"></i>`, 'btnX');
	d2.onclick = handler;
	return d2;
}
function show_motto() {
	mDiv(dTable, {}, null, `Compose. Connect. Contribute.`);
	mLinebreak(dTable);
	mDiv(dTable, {}, null, `Collective decision making made easy.`);
}
function show_compose() {
	mCardButton('compose', onclick_compose, dTable);
}
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
	let d2 = mButtonX(d,onclick_close_project_editor);
	mPlace(d2, 'tr', 10);

	let i = 0;
	let d3 = mInput(d, {}, 'inTitle', 'Title', 'coinput', i++); //, 'input');
	let d4 = mInput(d, {}, 'inCreator', 'Creator', 'coinput', i++, isdef(U) ? U.name : ''); //, 'input');
	let d5 = mInput(d, {}, 'inDescription', 'Short Description', 'coinput', i++); //, 'input');

	let b = mButton('next', onclick_add_question, d, {}, ['fett', 'no_outline', 'btn']);
}
function show_question_editor() {

	mLinebreak(dTable,4)
	let d = mCard(dTable, { }, 'coform'); mCenterFlex(d);

	let iform = arrChildren(dTable).length;
	console.log('this is question number', iform);

	let d1 = mText('New Composition', d, {}, 'fett'); mPlace(d1, 'tl', 10);
	let d2 = mButtonX(d,onclick_close_question_editor);
	mPlace(d2, 'tr', 10);

	mLinebreak(d, 40);
	let i = 0;
	let d3 = mInput(d, {  }, 'inTitle' + iform, 'Title', 'coinput', i++); //, 'input');
	let d4 = mInput(d, {  }, 'inCreator' + iform, 'Creator', 'coinput', i++, isdef(U) ? U.name : ''); //, 'input');
	let d5 = mInput(d, {  }, 'inDescription' + iform, 'Short Description', 'coinput', i++); //, 'input');

	let b = mButton('next', onclick_add_question, d, {}, ['fett', 'no_outline', 'btn']);

}



















