
function accuse_ai_move(bot){
	let [pl,fen,stage]=[Z.fen.players[bot],Z.fen,Z.stage];
	if (stage == 'hand'){
		//this is where hand card or empty can be played
		pl.move={state:{card:''}}
	}else if (stage == 'membership'){
		//this is where a membership card has to be chosen
	}
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
function get_policies_to_win(){
	let fen=Z.fen;

	if (isEmpty(fen.policies)) return ['any',fen.policies_needed]; //`${fen.policies_needed} policies of the same color needed!`]
	//let color = get_color_of_card(arrLast(fen.policies));
	let revlist = fen.policies.reverse();
	console.log('revlist',revlist);
	let color = get_color_of_card(revlist[0]);
	let samecolorlist=arrTakeWhile(revlist,x=>get_color_of_card(x)==color);
	console.log('samecolorlist',samecolorlist)
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









