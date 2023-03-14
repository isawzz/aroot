
function accuse_present(dParent) {

	mStyle(mBy('dTitle'), { display: 'grid', 'grid-template-columns': 'auto 1fr auto' });

	DA.no_shield = true;
	let [fen, ui, stage, uplayer] = [Z.fen, UI, Z.stage, Z.uplayer];
	if (firsttime) { fen = Z.fen = getfen1(); firsttime = false; }
	let [dOben, dOpenTable, dMiddle, dRechts] = tableLayoutMR(dParent, 1, 0);
	let dt = dTable = dOpenTable; clearElement(dt); mCenterFlex(dt); mStyle(dt, { hmin: 700 })

	show_history(fen, dRechts);
	if (isdef(fen.msg)) {show_message(fen.msg,true);}

	let [hlg, hsm] = [80, 50];
	let [hpolcard, hvotecard, himg, hstatfz, hnetcard, hhandcard, gap] = [hsm, hlg, 50, 8, hsm, hlg, 4];
	let [hpol, hstat, hhand] = [hpolcard + 30, hvotecard + himg + hstatfz * 3 + gap * 2, hhandcard + 30];
	let [d1, d2, d3, d4, d5] = [mDiv(dt), mDiv(dt), mDiv(dt), mDiv(dt), mDiv(dt)];
	//for (const d of [d1, d2, d3, d4, d5]) { mCenterCenterFlex(d); mStyle(d, { gap:10, w: '100%', hmin: h }) }

	// *** test example ***
	//fen.policies = ['QHn','QSn','AHn','2Dn'];
	// fen.players[uplayer].membership='QSn'


	// *** d1 policies ***
	let [color, n] = get_policies_to_win();
	//if (isEmpty(fen.policies))
	UI.policies = ui_type_accuse_hand(fen.policies, d1, { h: hpol }, '', 'policies', accuse_get_card_func(hsm, GREEN), false);
	//console.log(UI.policies);
	mStyle(d1, { h: isEmpty(fen.policies) ? 40 : hpol, w: '90%', display: 'flex', gap: 12 })
	let msg = color == 'any' ? `${n} policies are needed to win!` : `${capitalize(color)} needs ${n} more policies`
	let x = mDiv(d1, { h: isEmpty(fen.policies) ? 40 : hpolcard }, null, msg); mCenterCenterFlex(x)

	// *** d2 players ***
	let wgap = 20;
	let players = fen.players;
	//console.log('himg',himg)
	let wneeded = (himg + wgap) * fen.plorder.length + wgap;
	//console.log('wneeded',wneeded)
	let wouter = '95%';
	mStyle(d2, { hmin: hstat, w: wouter }); mCenterFlex(d2);
	// mStyle(d2, { hmin: hstat, w: wouter, bg:GREEN }); mCenterFlex(d2);
	//let dstats = mDiv(d2, { display: 'flex', 'justify-content': 'space-between', 'align-items': 'space-evenly',gap:20, w: 'auto' });
	//let dstats = mGrid(1,fen.plorder-1,d2,{display:'inline-grid',w:wneeded}); //, { display: 'flex', 'justify-content': 'space-between', 'align-items': 'space-evenly',gap:20, w: 'auto' });
	let dstats = mDiv(d2, { w: wneeded }); //, bg:'lime'});
	dstats.style.gridTemplateColumns = 'repeat(' + (fen.plorder.length - 1) + ',1fr)';
	dstats.style.display = 'inline-grid';
	dstats.style.padding = dstats.style.gap = `${wgap}px`;
	let order = get_present_order();
	let me = order[0];
	//console.log(`me:${me} uplayer:${uplayer}`)
	assertion(me==uplayer,"MEEEEEEEEEEEEEEE",me,uplayer)
	//assertion(me == uplayer,'order wrong!!!!!!!!')
	//console.log('order',order)
	// for(const plname of order){
	// 	let cleft = fen.players[plname].idleft;
	// 	//console.log(get_color_of_card(cleft),cleft);
	// 	//console.log(plname);
	// 	let cright = fen.players[plname].idright;
	// 	//console.log(get_color_of_card(cright),cright);
	// }
	for (const plname of order.slice(1)) { accuse_player_stat(dstats, plname, hvotecard, himg, hstatfz, gap); }
	mLinebreak(d2)

	// *** d3 me ***
	//mStyle(d3, { hmin: hstat, wmax: wneeded, bg:ORANGE })
	mStyle(d3, { hmin: hstat, w: wouter }); mCenterFlex(d3);
	// mStyle(d3, { hmin: hstat, w: wouter, bg:RED }); mCenterFlex(d3);
	//let dnet = mDiv(d3, { display: 'inline-flex', 'justify-content': 'space-between', 'align-items': 'space-evenly', w: wneeded });
	let dnet = mDiv(d3, { w: wneeded }); //, bg:'orange'});
	let wrest = wneeded - 2 * himg;
	//console.log('wrest',wrest)
	// dnet.style.gridTemplateColumns = `${himg}px ${wrest}px ${himg}px`; // 'repeat(' + 3 + ',1fr)';
	//dnet.style.gridTemplateColumns = `${hnetcard*.7}px 1fr ${hnetcard*.7}px`; // 'repeat(' + 3 + ',1fr)';
	dnet.style.gridTemplateColumns = `64px 1fr 64px`; // 'repeat(' + 3 + ',1fr)';
	dnet.style.display = 'inline-grid';
	dnet.style.padding = `${wgap}px`; // = dstats.style.gap = `${wgap}px`;

	let pl = fen.players[me];

	let par = (64 - hnetcard * .7) / 2;
	let d_idright = mDiv(dnet, { w: 64, padding: par }); //align:'center'}); //let d_idleft = mDiv(dnet,{align:'left'})
	let idright = get_color_card(pl.idright, hnetcard); mAppend(d_idright, iDiv(idright))

	let dme_stats = mDiv(dnet, { display: 'flex', 'justify-content': 'center', 'align-items': 'space-evenly' });//, w: 200 });
	let dx = accuse_player_stat(dme_stats, me, hvotecard, himg, hstatfz, gap);
	if (isdef(pl.membership)) {
		let c = get_color_of_card(pl.membership);
		mStyle(dx.dcombi, { bg: c, rounding: hnetcard / 10 });//, patop: 4 })
		mStyle(dx.dstats, { bg: c, fg: 'white' });
		dx.dimg.firstChild.width = dx.dimg.firstChild.height = himg - 10;
	}
	//mStyle(dx.dcombi,{bg:isdef(pl.membership)?get_color_of_card(pl.membership):'transparent'});
	//let membership = get_color_card(pl.membership, hnet); mAppend(dme_stats, iDiv(membership))

	// let d_idright = mDiv(dnet,{paright:align:'center'}); //'right'})
	let d_idleft = mDiv(dnet, { w: 64, padding: par }); //align:'center'}); //let d_idleft = mDiv(dnet,{align:'left'})
	let idleft = get_color_card(pl.idleft, hnetcard); mAppend(d_idleft, iDiv(idleft))

	// *** d4 hand ***
	mStyle(d4, { matop: 10, h: hhand, w: '90%' }); mCenterFlex(d4);
	let handui = ui_type_accuse_hand(pl.hand, d4, {}, `players.${uplayer}.hand`, 'hand', accuse_get_card_func(hhandcard));
	//mStyle(handui.container,{wmax:300})
	lookupSetOverride(ui, ['players', uplayer, 'hand'], handui);

	presentcards(hvotecard);
}












