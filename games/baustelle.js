
function get_random_ballot_card() {
	let [fen] = [Z.fen];
	console.log('fen.cardtype', fen.cardtype, '\nranks', fen.ranks);
	return fen.cardtype == 'num' ? `${rChoose(fen.ranks)}_${rChoose(fen.colors)}` : `${rCard('n', fen.ranks, 'SHDC')}`;
}






















