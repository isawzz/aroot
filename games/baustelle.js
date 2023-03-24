
function ui_type_accuse_policies(list, dParent, styles = {}, path = 'hand', title = 'hand', get_card_func = ari_get_card, show_if_empty = false) {

	let cont = ui_make_container(dParent, styles);
	let items = list.map(x => get_card_func(x));

	for (const item of items) {
		let d = iDiv(item);
		//console.log('item', item)
		let color = item.ckey;
		let c = get_nc_complement_array(color); //colorMix((color,.7)
		mStyle(d, { bg: c, border: color }); //`solid 2px ${color}`,box:true}); //color,thickness:3,box:true}); //'#ddd',border:item.ckey});
		// mStyle(d,{bg:'#eee',border:`solid 2px ${color}`,box:true}); //color,thickness:3,box:true}); //'#ddd',border:item.ckey});
		// mStyle(d,{bg:'#eee',border:`solid 2px ${color}`,box:true}); //color,thickness:3,box:true}); //'#ddd',border:item.ckey});
	}

	let cardcont = mDiv(cont);
	let card = isEmpty(items) ? { w: 1, h: valf(styles.h, Config.ui.card.h), ov: 0 } : items[0];
	let splay = 2;
	mContainerSplay(cardcont, splay, card.w, card.h, items.length, card.ov * card.w);
	ui_add_cards_to_hand_container(cardcont, items, list);
	let dtitle = ui_add_accuse_container_title(title, cont, items, show_if_empty);

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

function eval_consensus(votes, color) {
	let [stage, A, fen, phase, uplayer, turn, uname, host] = [Z.stage, Z.A, Z.fen, Z.phase, Z.uplayer, Z.turn, Z.uname, Z.host];

	//check ob es eindeutiges maximum rank gibt
	let vsorted = sortCardObjectsByRankDesc(votes, fen.ranks, 'card');
	//console.log(vsorted.map(x => x.card));
	//console.log('...CONSENSUS!!!!!!!!!!!!!', color, votes);

	let opt = valf(Z.options.consensus, 'policy');

	if (opt == 'policy') {
		fen.policies.push(color); //get_color_card(color)); //color == 'red' ? 'QDn' : 'QSn'); //last_policy);
		fen.validvoters = jsCopy(Z.plorder);
		check_enough_policies_or_start_new_poll(`consensus on ${color}`);
	} else if (opt == "coupdetat") {
		let ace_present = vsorted.find(x => is_ace(x.card));
		//console.log('ace_present', ace_present);
		if (isdef(ace_present)) {
			ari_history_list(`coup succeeded! ${color} wins!`, 'generation ends');
			accuse_score_update(color);
			Z.turn = jsCopy(Z.plorder);
			Z.stage = 'round';
			take_turn_fen_clear();
		} else { //just add a policy
			fen.policies.push(color); //get_color_card(color)); //color == 'red' ? 'QDn' : 'QSn'); 
			fen.validvoters = jsCopy(Z.plorder);
			check_enough_policies_or_start_new_poll(`consensus on ${color}`);
		}
	} else if (opt == 'generation') {
		ari_history_list(`consensus on ${color}!`, 'generation ends');
		accuse_score_update(color);
		Z.turn = jsCopy(Z.plorder);
		Z.stage = 'round';
		take_turn_fen_clear();
	} else if (opt == 'playerpolicy') { // opt == 'policy'
		//what if there is a tie?
		let tie = vsorted.length > 1 && getRankOf(vsorted[0].card) == getRankOf(vsorted[1].card);
		if (tie) {
			//need to go into a dialogue: each of the tied players must select a victim (tied player) who will pay!
			let maxrank = getRankOf(vsorted[0].card);
			let tied_votes = arrTakeWhile(vsorted, x => getRankOf(x.card) == maxrank);
			let tied_players = tied_votes.map(x => x.plname);
			console.log('tied', tied_votes, tied_players);
			Z.turn = tied_players;
			Z.stage = 'tied_consensus';
			fen.tied_votes = tied_votes;
			take_turn_fen_clear();
		} else {
			let winner = vsorted[0];
			//remove winning vote from player hand and add it to policies!
			fen.policies.push(winner.card);
			removeInPlace(fen.players[winner.plname].hand, winner.card);
			fen.validvoters = jsCopy(Z.plorder);
			check_enough_policies_or_start_new_poll(`consensus on ${color}`);
		}
	}
}























