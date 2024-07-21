function getOuterDivForMenuStyle(){
	return createElementFromHtml(`<div style='max-height:430px;text-align: center; animation: appear 4s ease'>`);
}

function show_games() {
	let d = mBy('dGames');
	if (isdef(d.firstChild)) {console.log('game menu already loaded!'); return;}

	mCenterCenterFlex(d);
	let dMenu = getOuterDivForMenuStyle();
	mAppend(d,dMenu);

	let favGames ='gColoku, gMaze, gSteps, gMissingLetter, gMem, gC4, gWritePic, gNamit, gSwap, gRiddle, gAbacus, gAnagram'.split(", ");
	// createMenuUiNew(dMenu,favGames, null, {fz:20,w:100,h:80, margin:8},{fz:50,'line-height':50},{fz:15,matop:-15},480);
	createMenuUiNew(dMenu,favGames, null, {patop:4},{},{fz:15},480);
	return;
	let extraGames = 'gSentence, gTouchColors, gSayPic, gTouchPic, gHouse, gPremem, gCats, gElim'.split(", ");
	let nonSolitaires = 'gKrieg, gReversi, gChess, gTTT, gC4'.split(", ");

	//console.log('favGames',favGames);
	//let olist = favGames.map(x=>DB.games[x]);
	//console.log('olist',olist);

	let keys = favGames.map(x=>DB.games[x].logo);
	console.log('keys',keys);
	//return;
	//console.log('favGames',favGames);

	let viewer = new ItemViewerClass(dMenu,null,keys);
	// for(const gameName of favGames){
	// 	let g = DB.games[gameName];
	// 	let friendly = g.friendly;
	// 	let symkey = g.logo;

		
	// }


	//trial 2
	// let d = mDiv(dParent,{align:'center'});
	// let dToolbar = mDiv(d, { matop: 40, align: 'center' });
	// for (const t of ['Belinda', 'Books', 'CardGames']) { 
	// 	let text = t + ` <img src="../base/assets/images/icons/${t}.png" height="90%" style="float:right"/>`;
	// 	let dLabel = mLabel(text, dToolbar, { padding: 5, cursor: 'pointer', w: '100%', h: 30, display: 'block', 'border-bottom': 'solid thin #ffffff55' });//,`r${t}`);
	// 	dLabel.onclick = ()=>window['onClickGamesMenu'](t.toLowerCase());
	// 	let d = mDiv(dInnerLeft,{position:'absolute',w:'100%',h:'100%',display:'none'},'d'+t);
	// }

	//trial 1
	// let link = createElementFromHtml(`
	// <a href="../belinda/index.php">belinda</a>
	// `);

	// mAppend(d,link);




}