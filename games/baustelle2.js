
function get_nc_color_array(){ return ['red', 'black', 'blue', 'green', 'gold', 'hotpink', 'cyan']}
function get_nc_complement_array(color){ return {red:'#ff9999', black:'#999', blue:BLUE, green:GREEN, gold:'lightgoldenrodyellow', hotpink:'pink', cyan:TEAL}[color];}

function get_number_card(ckey,h=100,w=null,backcolor=BLUE,ov=.3){
	let info={};
	let color = stringAfter(ckey, '_');
	let num = stringBefore(ckey, '_');

	info.key = ckey;
	info.cardtype = 'num';
	let [r, s] = [info.rank, info.suit] = [Number(num),color];
	info.val = r; // Number(num);
	info.color = backcolor;
	let sz = info.sz = info.h = h;
	w = info.w = valf(w, sz * .7);
	if (!isList(Z.fen.ranks)) Z.fen.ranks = calcNumRanks(get_keys(Z.fen.players).length*Z.fen.handsize,2,Z.fen.colors.length); 
	//console.log('ranks',Z.fen.ranks);
	let ranks = valf(lookup(Z, ['fen', 'ranks']), range(100)); //Z.fen.ranks;
	info.irank = ranks.indexOf(r);
	info.isuit = valf(lookup(Z, ['fen', 'colors']), get_nc_color_array()).indexOf(s); //range(100));'SHCD'.indexOf(s);
	info.isort = info.isuit * ranks.length + info.irank;

	//card face
	//let card = cBlank(dTable, { h: sz, w:w, border: 'silver' });
	//let dcard = mDiv(dTable,{h:h,w:w,rounding:4,bg:'white',border:'silver'});
	//console.log('________w',w)

	let d = mDiv(null,{h:h,w:w,rounding:4,bg:'white',border:'silver'},null,null,'card');
	//console.log('ui',d)

	//let d = iDiv(ui, { margin: 10 });
	let [sm, lg] = [sz / 8, sz / 4]

	let styles = { fg: color, h: sm, fz: sm, hline: sm, weight: 'bold' };
	for (const pos of ['tl', 'tr']) {
		let d1 = mDiv(d, styles, null, num);
		mPlace(d1, pos, 2, 2);
	}
	for (const pos of ['bl', 'br']) {
		let d1 = mDiv(d, styles, null, num);
		d1.style.transform = 'rotate(180deg)';
		mPlace(d1, pos, 2, 2);
	}
	let dbig = mDiv(d, { matop:(h-lg)/2,family: 'algerian', fg: color, fz: lg, h: lg, w: w, hline: lg, align: 'center' }, null, num);
	//mPlace(dbig, 'cc');

	// mSize(ui, info.w, info.h);
	let res = {};
	copyKeys(info, res);
	copyKeys({ w: info.w, h: info.h, faceUp: true, div: d }, res);
	if (isdef(ov)) res.ov = ov;

	return res;
}
function get_random_ballot_card() {
	let [fen] = [Z.fen];
	//console.log('fen.cardtype', fen.cardtype, '\nranks', fen.ranks);
	return fen.cardtype == 'num' ? `${rChoose(fen.ranks)}_${rChoose(fen.colors)}` : `${rCard('n', fen.ranks, 'SHDC')}`;
}













