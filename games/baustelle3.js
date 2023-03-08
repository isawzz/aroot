
function turn_has_bots_that_must_move(){
	let [turn,pldata] = [Z.turn,Z.playerdata];

	if (isEmpty(pldata)) return [];
	let pldata_dict = list2dict(pldata,'name');

	let bots_on_turn = turn.filter(x=>Z.fen.players[x].playmode != 'human');
	//console.log('bots_on_turn',bots_on_turn)

	for(const bot of bots_on_turn){
		console.log(bot,pldata_dict[bot])
	}

	let no_pldata = bots_on_turn.filter(x=>!isDict(pldata_dict[x].state));
	let is_bot_turn = turn.length==bots_on_turn.length;
	if (is_bot_turn && turn.length == 1) return [turn];
	//is_bot_turn.map(x=>addIf(no_pldata,x));

	return no_pldata;

}


function there_are_bots(){
	let players = get_values(Z.fen.players);
	return firstCond(players,x=>x.playmode != 'human');

}
function get_bots_on_turn(){
	let players = Z.turn;
	return players.filter(x=>Z.fen.players[x].playmode != 'human');
}


function accuse_ai_move(bot){
	let [pl,fen,stage]=[Z.fen.players[bot],Z.fen,Z.stage];
	if (stage == 'hand'){
		//this is where hand card or empty can be played
		pl.move={state:{card:''}}
	}else if (stage == 'membership'){
		//this is where a membership card has to be chosen
	}
}







function start_downgrade_ticker() {
	TO.main = setTimeout(degrade_bars, 5000);
}
function degrade_bars() {
	for (const color in DA.bars) {
		let bar = DA.bars[color];
		set_bar(color, bar.w - 1, 1);
		
	}
	Z.fen.decrement += 1;
	start_downgrade_ticker();
}
function feedback_update_fen() {
	//aggregate all values for green and red in playerdata
	let fen = Z.fen;
	fen.barvalues = {};
	for (const pldata of Z.playerdata) {
		if (isdef(pldata.state)) {
			for (const color in pldata.state) {
				let value = pldata.state[color];
				if (isdef(fen.barvalues[color])) {
					fen.barvalues[color] += value;
				} else {
					fen.barvalues[color] = value;
				}
			}
		}
	}
	for(const k in fen.barvalues) {
		let val = fen.barvalues[k]-fen.decrement;
		if (val<0) val=0;
		fen.barvalues[k] = val;
	}


}






