
function show_left_netcard(plname,order) {
	let dx = lookup(UI, ['stats', plname]);
	dx=dx.douter;

	//need player next to plname in order
	let next = get_next_in_list(plname,order);
	let dx1=lookup(UI, ['stats', next]);
	dx1=dx1.douter;

	let r=getRect(dx);
	let r1=getRect(dx1);
	console.log('r',r)
	let xcenter = r.r+(r1.l-r.r)/2;

	let sz=40;
	let wsz=sz*.7;
	let dmark=mDiv(dTable,{position:'absolute',top:r.t+r.h/2-sz*1.5,left:xcenter-wsz/2,h:sz,w:wsz+1});//,bg:GREEN})

	let pl = Z.fen.players[plname];
	let idleft = get_color_card(pl.idleft, sz);
	let d = iDiv(idleft);
	mAppend(dmark, d)
}




























