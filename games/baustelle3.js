
function trigger_check_is_sending(trigger) {
	//this function seends a write_fen message and return true if playerdata can be resolved!
	//otherwise returns false (will result in Z.skip_presentation if not resolve)

	if (!trigger) return false;
	let [uplayer, fen, stage, pldata] = [Z.uplayer, Z.fen, Z.stage, Z.playerdata];

	//case1: stage != can_resolve
	if (stage != 'can_resolve') {
		let can_resolve = Z.func.check_resolve();	
		if (can_resolve) {
			[Z.turn, Z.stage] = [[trigger], 'can_resolve'];
			prep_move();
			let o = { uname: Z.uplayer, friendly: Z.friendly, fen: Z.fen, write_fen: true, write_notes: 'lock' };
			let cmd = 'table';
			send_or_sim(o, cmd);

			return true;
		} else return false;
	}else if (uplayer == trigger){
		//case2: uplayer == trigger
		//das ist der der resolven koennte! NUR trigger kann fen aendern!!!!!!
		//es wird resolved!
		Z.func.resolve();	
		// console.log('buy process done ... resolving');
		// ferro_change_to_card_selection(); //das soll durch resolve ersetzt werden
		// prep_move();
		// let o = { uname: Z.uplayer, friendly: Z.friendly, fen: Z.fen, write_fen: true, write_notes: '' };
		// let cmd = 'table';
		// send_or_sim(o, cmd);

		return true;
	} else return false;

}



