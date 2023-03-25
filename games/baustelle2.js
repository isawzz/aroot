
function accuse_replaced_membership() {
	let [stage, A, uplayer, fen, accused] = [Z.stage, Z.A, Z.uplayer, Z.fen, Z.fen.accused];

	assertion(accused == uplayer, "accuse_replace_membership: WRONG PLAYER!!!!")
	let card = A.items[A.selected[0]].a;
	//remove from hand, set membership
	let pl = fen.players[uplayer];
	accuse_discard(pl.membership)
	pl.membership = card;
	removeInPlace(pl.hand, card);
	ari_history_list(`${accused} chooses new membership` + (TESTHISTORY ? ` ${card}` : ''), 'accuse');
	delete fen.msg;
	if (stage == 'accuse_action_entlarvt'){
		Z.turn = [fen.president];
		Z.stage = 'accuse_action_policy';
		take_turn_fen_clear(); //!!!!clear added!!!!
	}else{
		fen.newpresident = accused;
		set_new_president();
	}
}














