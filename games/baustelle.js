
function show_membership_color(plname,hnetcard,himg){

	let dx = lookup(UI, ['stats', plname]);
	//console.log('dx',dx,plname);

	let pl = Z.fen.players[plname];

	if (nundef(pl.membership)) return;

	let c = get_color_of_card(pl.membership);
	mStyle(dx.dcombi, { bg: c, rounding: hnetcard / 10, patop: 4 })
	mStyle(dx.dstats, { bg: c, fg: 'white' });
	dx.dimg.firstChild.width = dx.dimg.firstChild.height = himg - 10;

}




























