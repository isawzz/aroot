function accuse_player_stat(d1, plname) {
	let players = Z.fen.players;
	let pl = players[plname];
	let onturn = Z.turn.includes(plname);
	let sz = 50; //onturn?100:50;
	let bcolor = plname == Z.uplayer ? 'lime' : 'silver';
	let border = pl.playmode == 'bot' ? `double 5px ${bcolor}` : `solid 5px ${bcolor}`;
	let rounding = pl.playmode == 'bot' ? '0px' : '50%';
	let d = mDiv(d1, { margin: 4, align: 'center' });
	let stats = mDiv(d, { align:'center' }); mCenterFlex(stats);
	let dimg = mDiv(d, {padding:0}, null, `<img src='../base/assets/images/${plname}.jpg' style="border-radius:${rounding};border:${border};box-sizing:border-box" width=${sz} height=${sz}>`);
	mCenterFlex(dimg);
	let card = mDiv(d, { hmin: 40 }); mCenterFlex(card);
	let x = lookupSetOverride(UI, ['stats', plname], { douter: d, dstats: stats, dimg: dimg, dcard: card });
	return x;
}
function accuse_stats(d, dl, dr, dmain) {
	let players = Z.fen.players;
	//console.log('uplayer',Z.uplayer)
	let d1 = mDiv(d, { display: 'flex', 'justify-content': 'center', 'align-items': 'space-evenly' });
	let order = get_present_order();

	let me = order[0];
	accuse_player_stat(dmain, me)
	let next = order[1];
	accuse_player_stat(dl, next)
	let prev = arrLast(order);
	accuse_player_stat(dr, prev)
	let middle = order.slice(2, order.length - 1);
	//console.log('me', me, 'next', next, 'prev', prev, 'middle', middle);

	for (const plname of middle) {
		let pl = players[plname];
		if (TESTHISTORY && plname == middle[0]) { let dleft = ari_get_card(pl.idleft, 80); mAppend(d1, iDiv(dleft)) }

		accuse_player_stat(d1, plname)

		//if (TESTHISTORY && isdef(pl.membership)) { let dmiddle = ari_get_card(pl.membership, 40); mAppend(dmain, iDiv(dmiddle)); }
		if (TESTHISTORY) { let dright = ari_get_card(pl.idright, 80); mAppend(d1, iDiv(dright)); }

	}


}











