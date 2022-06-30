function ferro_is_set(cards, max_jollies_allowed = 1, seqlen = 7) {
	//let [plorder, stage, A, fen, uplayer] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer];

	if (cards.length < 3) return false;
	let num_jollies_in_cards = cards.filter(x => is_joker(x)).length;
	if (num_jollies_in_cards > max_jollies_allowed) return false;

	cards = sortCardItemsByRank(cards.map(x => x), rankstr = '23456789TJQKA*');

	let rank = cards[0].rank;
	if (cards.every(x => x.rank == rank || is_joker(x))) return cards.map(x => x.key);

	let suit = cards[0].suit;
	if (!cards.every(x => is_jolly(x.key) || x.suit == suit)) return false;

	//if duplicate keys in cards, then it's not a set
	let keys = cards.map(x => x.key);
	if (keys.length != new Set(keys).size) return false;

	//console.log('checking for sequence!!!!!!!!!!!!!!!!!!!!!')
	let at_most_jollies = Math.min(num_jollies_in_cards, max_jollies_allowed);
	let num_jolly = sortCardItemsToSequence(cards, rankstr = '23456789TJQKA', at_most_jollies);
	//console.log('num_jolly', num_jolly);
	let cond1 = num_jolly <= at_most_jollies; //this sequence does not need more jollies than it should
	let cond2 = cards.length >= seqlen; //console.log('cond2', cond2);
	//console.log('cards', cards);
	if (cond1 && cond2) return cards.map(x => x.key); else return false;
}


function output_scores() {
	let fen = Z.fen;
	for (const plname in fen.players) {
		let pl = fen.players[plname];
		console.log('score', plname, pl.score);
		//let score = pl.score; let score_str = score.toString(); let score_elem = iDiv(`score_${plname}`); score_elem.innerHTML = score_str;
	}
}















