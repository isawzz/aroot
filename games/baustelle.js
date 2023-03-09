

function accuse_player_stat(dParent, plname, hvotecard,himg,hstatfz,gap) {
	let players = Z.fen.players;
	let pl = players[plname];
	//console.log('plname',plname,pl)
	//console.log()
	let onturn = Z.turn.includes(plname);
	let sz = himg; //onturn?100:50;
	let bcolor = plname == Z.uplayer ? 'lime' : 'silver';
	let border = pl.playmode == 'bot' ? `double 5px ${bcolor}` : `solid 5px ${bcolor}`;
	let rounding = pl.playmode == 'bot' ? '0px' : '50%';
	let d = mDiv(dParent, { align: 'center' });
	//let d = mDiv(dParent); mCenterFlex(d); //, { margin: 4, align: 'center' });
	let card = mDiv(d, { hmin: hvotecard+gap,bg:'transparent',mabottom:gap, paright:4 }); mCenterFlex(card);

	let dcombine = mDiv(d,{w:sz,margin:'auto'}); //,{padding:6});

	let dimg = mDiv(dcombine, {padding:0}, null, `<img src='../base/assets/images/${plname}.jpg' style="border-radius:${rounding};border:${border};box-sizing:border-box" width=${sz} height=${sz}>`);mCenterFlex(dimg);
	let stats = mDiv(dcombine, { align:'center',w:sz,bg:'silver',rounding:10 }); mCenterFlex(stats);
	let x = lookupSetOverride(UI, ['stats', plname], { douter: d, dcombi: dcombine, dstats: stats, dimg: dimg, dcard: card });
	accuse_player_stat_count('star', pl.score, stats, {sz:hstatfz});
	accuse_player_stat_count('hand with fingers splayed', pl.hand.length, stats, {sz:hstatfz});

	return x;
}
function accuse_player_stat_count(key, n, dParent, styles = {}) {
	//mStyle(dParent,{align:'center'});
	let sz=valf(styles.sz, 8);
	let d=mDiv(dParent,{w:'50%',align:'center'});
	let dsym;
	if (isdef(Syms[key])) dsym=mSym(key, d, { h: sz, 'line-height': sz, w: '100%' });
	else dsym=mText(key, d, { h: sz, fz: sz, w: '100%' });
	//console.log('hallo!!!')

	//if (nundef(styles.wmax)) styles.wmax = sz;
	//addKeys({ display: 'flex', margin: 4, dir: 'column', hmax: 2 * sz, 'align-content': 'start', fz: sz, align: 'center' }, styles);

	let dn = mDiv(d, {fz:2*sz,weight:'bold'},null,n);
	return d;
}
function ui_type_accuse_hand(list, dParent, styles = {}, path = 'hand', title = 'hand', get_card_func = ari_get_card, show_if_empty = false) {

	//copyKeys({wmin:500,bg:'red'},styles); //testing wmin
	let cont = ui_make_container(dParent, styles); //get_container_styles(styles));

	//mStyle(cont,{bg:'lime'})

	let items = list.map(x => get_card_func(x));

	let cardcont = mDiv(cont);
	//if (!isEmpty(items)) {
	let card = isEmpty(items) ? { w: 1, h: Config.ui.card.h, ov: 0 } : items[0];
	//console.log('card',card)
	let splay = 2;
	mContainerSplay(cardcont, splay, card.w, card.h, items.length, card.ov * card.w);
	ui_add_cards_to_hand_container(cardcont, items, list);
	//}
	let dtitle=ui_add_accuse_container_title(title, cont, items, show_if_empty);

	//console.log('hand container',cont, cardcont)

	return {
		ctype: 'hand',
		list: list,
		path: path,
		container: cont,
		cardcontainer: cardcont,
		splay: splay,
		items: items,
		dtitle: dtitle,
	};
}
function ui_add_accuse_container_title(title, cont, items, show_if_empty) {
	if (isdef(title) && (!isEmpty(items) || show_if_empty)) {
		let elem = mText(title, cont, {margin:3});
		return elem;
	}
	return null;
}












