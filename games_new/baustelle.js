
function accuse_deck(numpl,hz,colors='rb',repeat=2){
	
}

function ncRank(ckey){return Number(stringBefore(ckey,'_'))}
function ncColor(ckey){return stringAfter(ckey,'_')}
function ncSvg(ckey){
	'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="card" face="3H" height="100%" preserveAspectRatio="none" viewBox="-120 -168 240 336" width="100%"><symbol id="SH3" viewBox="-600 -600 1200 1200" preserveAspectRatio="xMinYMid"><path d="M0 -300C0 -400 100 -500 200 -500C300 -500 400 -400 400 -250C400 0 0 400 0 500C0 400 -400 0 -400 -250C-400 -400 -300 -500 -200 -500C-100 -500 0 -400 -0 -300Z" fill="red"></path></symbol><symbol id="VH3" viewBox="-500 -500 1000 1000" preserveAspectRatio="xMinYMid"><path d="M-250 -320L-250 -460L200 -460L-110 -80C-100 -90 -50 -120 0 -120C200 -120 250 0 250 150C250 350 170 460 -30 460C-230 460 -260 300 -260 300" stroke="red" stroke-width="80" stroke-linecap="square" stroke-miterlimit="1.5" fill="none"></path></symbol><rect width="239" height="335" x="-119.5" y="-167.5" rx="12" ry="12" fill="white" stroke="black"></rect><use xlink:href="#VH3" height="32" x="-114.4" y="-156"></use><use xlink:href="#SH3" height="26.769" x="-111.784" y="-119"></use><use xlink:href="#SH3" height="70" x="-35" y="-135.501"></use><use xlink:href="#SH3" height="70" x="-35" y="-35"></use><g transform="rotate(180)"><use xlink:href="#VH3" height="32" x="-114.4" y="-156"></use><use xlink:href="#SH3" height="26.769" x="-111.784" y="-119"></use><use xlink:href="#SH3" height="70" x="-35" y="-135.501"></use></g></svg>'
}
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












