var dMain = document.getElementById('dMain'), dTable;
function start() {
	prelim();
	// mCenterFlex(dMiddle); //muss garnicht gemacht werden!!!

	testCardsGridOverlap();
	//testCardsGridOverlap();
}
function testCardsGridOverlap(){
	dTable = stdGridContainer(dMiddle);
	testAdd10Cards();
}
function stdGridContainer(dParent,styles={}){
	addKeys({	wmax: 500,
	margin: 'auto', 
	padding: 10,
	gap:0, 
	display:'grid',
	bg:'green',
	'grid-template-columns': `repeat(${20}, 20px)`
	},styles);
	return mDiv(dParent,styles);
}
function testCardsNoOverlap(){
	dTable = stdContainerRowWrap(dMiddle);
	testAdd10Cards();
}
function testAdd10Cards(){

	let uilist = [],ch;
	for (let i = 0; i < 10; i++) {
		//let content = randomContent('object'); outputContent(content);
		if (coin()){
			let card = Card52.getItem();
			ch = iDiv(card);
			mAppend(dTable,ch);
		}else{
			//mDiv(dParent, styles, id, inner, classes, sizing)
			// ch = mDiv(dTable,{w:randomNumber(50,120),h:randomNumber(50,100),bg:'random'});
			ch = mDiv(dTable,{w:76,h:110,bg:'random'});
			mClass(ch,'card');
		}

		uilist.push(ch);

		// let d=mDiv(dTable,{display:'inline-block',wmin:170,hmin:110});
		// let d1 = mAddContentAndMeasureW(d, content); 

		// let item = mItem(null, {div:d}, {})
		// console.log('d',d)
		// mStyle(d, { display: 'inline-block', w: 70, h: 110, bg:'random', rounding:6, margin:10 });
		// //mCenterFlex(d)
	}
}
function prelim(){
	// #region TITLE
	mStyle(dMain,{bg:'random'});
	let prefix = 'title';
	let title = 'Aristocracy';
	let dTitleOuter = mDiv(dMain, { bg: '#000000', alpha: .6, display: 'flex', 'flex-flow': 'row' });//, 'align-items': 'center' });
	let dTitleLeft = mDiv(dTitleOuter, { w: 100 }, `d${prefix}Left`);
	let dTitleMiddle = mDiv(dTitleOuter, { align: 'center', flex: '1 0 auto' }, `d${prefix}Middle`, title);
	mCenterCenterFlex(dTitleMiddle);
	let dTitleRight = mDiv(dTitleOuter, { align: 'right', wmin: 100, overflow: 'hidden' }, `d${prefix}Right`);
	//#endregion
	//#region *** MAIN DIV ***
	let dOuter = mDiv(dMain, { flex: 1, display: 'flex', 'flex-flow': 'row' });
	let dLeft = mDiv(dOuter, { bg: '#000000', alpha: .3, align: 'center' }, 'dLeft');
	let dMiddle = mDiv(dOuter, { flex: 1, position: 'relative', bg: '#ffffff', alpha: .3}, 'dMiddle');
	let dRight = mDiv(dOuter, { bg: '#000000', alpha: .3, align: 'center' }, 'dRight');
	mAddContentAndMeasureW(dLeft, 'left', { hpadding: 12 });
	mAddContentAndMeasureW(dRight, 'right', { hpadding: 12 });
	//#endregion
	//#region FOOTER
	let dFooter = mDiv(dMain, { bg: '#000000', alpha: .5, paleft: 10 }, 'dFooter', 'footer');
	let bMenuLeft = stdMenuButton(dTitleLeft);
	stdSidebarController(bMenuLeft, 'dLeft');
	let bMenuRight = stdMenuButton(dTitleRight);
	stdSidebarController(bMenuRight, 'dRight');
	mButton('+', addRandomContentToSidebarOrTable, dTitleLeft, { }, 'mybutton');

	let w = getRect(dMiddle).w;
	//console.log('w von dMiddle', w);
	//#endregion
}
function stdFlexContainer(dParent,styles={}){
	addKeys({	wmax: '96%',
	margin: 'auto', 
	padding: 10,
	gap:10, 
	display:'flex',
	flex:'1 0 auto',
	wrap: true,},styles);
	return mDiv(dParent,styles);
}

function stdContainerRowWrap(dParent){ return stdFlexContainer(dParent);}
function stdContainerColWrap(dParent){return stdFlexContainer(dParent,{dir:'col'});}
function stdContainerCenterRowWrap(dParent){ return stdFlexContainer(dParent,{'justify-content':'center'});}
function stdContainerCenterColWrap(dParent){return stdFlexContainer(dParent,{dir:'col','align-content':'center'});}
function muiCard(key,dParent,styles,classes){

}
function recFindDOMs(o){
	if (!isDict(o)) return [];
	if (isDOM(iDiv(o))) return [iDiv(o)];
	let akku=[];
	for(const k in o){
		let val = o[k];
		akku = akku.concat(recFindDOMs(val));
	}
	return akku;
}
function isSimpleType(type) { return !['list', 'object'].includes(type); }
function randomType(onlySimple = false) {
	let complexTypes = ['list'];// object
	let simpleTypes = ['number', 'string', 'varLenString', 'C52', 'Card52'];//'card'?,'html','DOM'];
	let allTypes = complexTypes.concat(simpleTypes);
	//console.log('\nsimple:',simpleTypes.join(),'\ncomplex:',complexTypes.join(),'\nall:',allTypes.join());
	type = chooseRandom(onlySimple ? simpleTypes : allTypes);
	return type;
}
function randomObject(len = 3, onlySimple = true, elTypes) {
	if (nundef(elTypes)) { elTypes = Array.from({ length: len, }, () => randomType(true)); }
	//console.log('elTypes', elTypes.join());
	let result = { id:getUID('o')};
	let i=0;
	for(const t of elTypes){
		let key = t+'_'+i; i+=1;
		let val = randomContent(t);
		result[key]=isdef(val.content)?val.content:val;
	}
	return result;
}
function randomList(len = 3, onlySimple = true, elType) {
	if (nundef(elType)) { elType = randomType(onlySimple); }
	let result = [];
	for (let i = 0; i < len; i++) {
		let c = randomContent(elType);

		result.push(isdef(c.content) ? c.content : c);
	}
	return { content: result, elType: elType };
}
function randomContent(type) {
	if (nundef(type)) { type = randomType(); }
	//console.log('type is', type)
	let content = window['random' + capitalize(type)]();
	//console.log('content is', content);
	if (isDict(content)) { content.type = type; } else content = { content: content, type: type };
	return content;
}
function addRandomContentToSidebarOrTable() {
	console.log('clicked!');
	let content = randomContent();
	console.log('content is type', type, '=>', content);

	//choose a random container from dLeft,dRight, dMiddle
	let d = chooseRandom([mBy('dLeft'), mBy('dRight'), dTable]);

	mAddContentAndMeasureW(dTable, content);

}
function randomVowel() { return chooseRandom(toLetters('aeioy')); }
function randomConsonant() { return chooseRandom(toLetters('bcdfghjklmnpqrstvwxz')); }
function randomVarLenString(lmin = 3, lmax = 12, startLetter) { let len = randomNumber(lmin, lmax); return randomString(len, startLetter); }
function randomString(len = 4, startLetter) {
	let s = '';
	if (isdef(startLetter)) { s = startLetter; len -= 1; }
	let isVowel = coin() ? true : false;
	for (let i = 0; i < len; i++) {
		if (isVowel) s += randomVowel(); else s += randomConsonant();
		isVowel = !isVowel;
	}
	return s;
}
function outputContent(content){
	if (content.type == 'list') {
		console.log('list of', content.elType, content.content);
	} else {
		console.log('content', content);
	}

}













