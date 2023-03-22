
function show_card(ckey){

	mClear('dTable');
	console.log('show_card',ckey)

	dTable = mBy('dTable'); mCenterFlex(dTable);
	let card = cBlank(dTable,{h:300});

	let d=iDiv(card);
	let color = stringAfter(ckey,'_');
	let num=stringBefore(ckey,'_');
	let styles = {fg:color,h:20,w:20, weight:'bold'};
	for(const pos of ['tl','tr']){
		let d1=mDiv(d,styles,null,num);
		mPlace(d1,pos);
	}
	for(const pos of ['bl','br']){
		let d1=mDiv(d,styles,null,num);
		d1.style.transform = 'rotate(180deg)';
		mPlace(d1,pos);
	}
	let dbig=mDiv(d,{family:'algerian',fg:color,fz:100,h:100,w:'100%',hline:100,align:'center'},null,num);
	mPlace(dbig,'cc')

}



























