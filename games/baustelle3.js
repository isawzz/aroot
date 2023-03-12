
function on_empty_votes(){}



function accuse_ai_move(bot){
	let [pl,fen,stage]=[Z.fen.players[bot],Z.fen,Z.stage];
	if (stage == 'hand'){
		//this is where hand card or empty can be played
		pl.move={state:{card:''}}
	}else if (stage == 'membership'){
		//this is where a membership card has to be chosen
	}
}
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
function accuse_show_sitting_order(fen){
	if (nundef(fen)) fen=Z.fen;

	//ist der turn immer wie der sitting order?
	//console.log('turn');
	for(const plname of fen.turn){
		let pl=fen.players[plname];
		//console.log(pl.idleft,plname,pl.idright)
	}

	//console.log('plorder');
	for(const plname of fen.plorder){
		let pl=fen.players[plname];
		//console.log(pl.idleft,plname,pl.idright)
	}

}
function get_bots_on_turn(){
	let players = Z.turn;
	return players.filter(x=>Z.fen.players[x].playmode != 'human');
}
function get_color_card(ckey, h, opts={}) {
	//console.log('ckey', ckey);
	let color;
	if (nundef(ckey)) color='transparent'; else color = get_color_of_card(ckey);
	let type = 'color';
	let info = {friendly:color,color:valf(opts.bg,BLUE)}
	info.ckey = color;
	let el = mDiv(null, { bg: color=='black'?'#222':color,rounding:h/10 });
	h = valf(h, valf(info.h, 100));
	w = valf(opts.w, h * .7);
	mSize(el, w, h);
	let card = {};
	copyKeys(info, card);
	copyKeys({ sz: h, w: w, h: h, faceUp: true, div: el }, card);
	card.ov = valf(opts.ov,.3);

	return card;
}
function get_policies_to_win(){
	let fen=Z.fen;

	if (isEmpty(fen.policies)) return ['any',fen.policies_needed]; //`${fen.policies_needed} policies of the same color needed!`]
	//let color = get_color_of_card(arrLast(fen.policies));
	let revlist = jsCopy(fen.policies).reverse();
	//console.log('revlist',revlist);
	let color = get_color_of_card(revlist[0]);
	let samecolorlist=arrTakeWhile(revlist,x=>get_color_of_card(x)==color);
	//console.log('samecolorlist',samecolorlist)
	//while()
	return [color,Math.max(0,fen.policies_needed-samecolorlist.length)];
}
function there_are_bots(){
	let players = get_values(Z.fen.players);
	return firstCond(players,x=>x.playmode != 'human');

}
function turn_has_bots_that_must_move(){
	let [turn,pldata] = [Z.turn,Z.playerdata];

	if (isEmpty(pldata)) return [];
	let pldata_dict = list2dict(pldata,'name');

	let bots_on_turn = turn.filter(x=>Z.fen.players[x].playmode != 'human');
	//console.log('bots_on_turn',bots_on_turn)

	for(const bot of bots_on_turn){
		//console.log(bot,pldata_dict[bot])
	}

	let no_pldata = bots_on_turn.filter(x=>!isDict(pldata_dict[x].state));
	let is_bot_turn = turn.length==bots_on_turn.length;
	if (is_bot_turn && turn.length == 1) return [turn];
	//is_bot_turn.map(x=>addIf(no_pldata,x));

	return no_pldata;

}
function ui_add_accuse_container_title(title, cont, items, show_if_empty) {
	if (isdef(title) && (!isEmpty(items) || show_if_empty)) {
		let elem = mText(title, cont, {margin:3});
		return elem;
	}
	return null;
}
function ui_get_player_items(playernames) {
	let items = [], i = 0;
	for (const plname of playernames) {
		let plui = UI.stats[plname];
		plui.div = plui.dimg;
		plui.itemtype = 'player';
		let item = { o: plui, a: plname, key: plname, friendly: plname, path: `stats.${plname}`, index: i };
		i++;
		items.push(item);
	}
	return items;
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









