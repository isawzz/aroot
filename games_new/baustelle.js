
function accuse_deck(numpl,hz,colors='rb',repeat=2){
	
}

function ncRank(ckey){return Number(stringBefore(ckey,'_'))}
function ncColor(ckey){return stringAfter(ckey,'_')}
function get_number_card(ckey, h, opts={}) {
	//ckey sollen sein: '123_r' zum beispiel

	//let ranks = '1234567890abc'
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












