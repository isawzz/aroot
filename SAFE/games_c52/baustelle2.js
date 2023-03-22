
function show_playerstats_over(d2) {
	let [fen, ui, stage, uplayer] = [Z.fen, UI, Z.stage, Z.uplayer];
	let [hlg, hsm] = [80, 50];
	let [hpolcard, hvotecard, himg, hstatfz, hnetcard, hhandcard, gap] = [hsm, hlg, 50, 8, hsm, hlg, 4];
	let [hpol, hstat, hhand] = [hpolcard + 25, hvotecard + himg + hstatfz * 5 + gap * 2, hhandcard + 25];
	// *** d2 players ***
	let [wgap, hgap] = [10, 12]; //NEW!
	let players = fen.players;

	let order = get_present_order();
	let me = order[0];
	let ncols = order.length - 1 + order.length - 2;

	let wneeded = (himg + wgap) * ncols + wgap;
	let wouter = '95%';
	mStyle(d2, { hmin: hstat, wmin: wouter }); mCenterFlex(d2);
	let dstats = mDiv(d2, { wmin: wneeded });

	let szcols = '1fr'; //isover?'auto':'1fr';

	dstats.style.gridTemplateColumns = `repeat(${ncols},${szcols})`; // 'repeat(' + ncols + `,1fr)`;
	dstats.style.display = 'inline-grid';
	dstats.style.padding = dstats.style.gap = `${hgap}px ${wgap}px`;
	assertion(me == uplayer, "MEEEEEEEEEEEEEEE")
	for (const plname of order.slice(1)) {
		let dshell1=mDiv(dstats); mCenterCenterFlex(dshell1)
		accuse_player_stat(dshell1, plname, hvotecard, himg, hstatfz, gap);
		//if game is over and this is NOT the last one in order, show his left net card!!!
		if(plname == arrLast(order)) break;
		let dshell2=mDiv(dstats); mCenterCenterFlex(dshell2)
		let dncshell = mDiv(dshell2); //,{bg:'green'}); //{h:141,patop:90,bg:GREEN});
		let dummy=mDiv(dncshell,{h:50,bg:'transparent'})
		let netcard = get_color_card(fen.players[plname].idright, 50);
		mAppend(dncshell, iDiv(netcard));
	}
	mLinebreak(d2)

}

function show_playerstats_orig(d2) {
	let [fen, ui, stage, uplayer] = [Z.fen, UI, Z.stage, Z.uplayer];
	let [hlg, hsm] = [80, 50];
	let [hpolcard, hvotecard, himg, hstatfz, hnetcard, hhandcard, gap] = [hsm, hlg, 50, 8, hsm, hlg, 4];
	let [hpol, hstat, hhand] = [hpolcard + 25, hvotecard + himg + hstatfz * 5 + gap * 2, hhandcard + 25];
	// *** d2 players ***
	let [wgap, hgap] = [20, 12];
	let players = fen.players;
	let wneeded = (himg + wgap) * fen.plorder.length + wgap;
	let wouter = '95%';
	mStyle(d2, { hmin: hstat, wmin: wouter }); mCenterFlex(d2);
	let dstats = mDiv(d2, { wmin: wneeded });
	let order = get_present_order();
	let me = order[0];
	dstats.style.gridTemplateColumns = 'repeat(' + (fen.plorder.length - 1) + ',1fr)';
	dstats.style.display = 'inline-grid';
	dstats.style.padding = dstats.style.gap = `${hgap}px ${wgap}px`;
	assertion(me == uplayer, "MEEEEEEEEEEEEEEE")
	for (const plname of order.slice(1)) { accuse_player_stat(dstats, plname, hvotecard, himg, hstatfz, gap); }
	mLinebreak(d2)

}














