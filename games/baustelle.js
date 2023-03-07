
function accuse_show_sitting_order(fen){
	if (nundef(fen)) fen=Z.fen;

	//ist der turn immer wie der sitting order?
	console.log('turn');
	for(const plname of fen.turn){
		let pl=fen.players[plname];
		console.log(pl.idleft,plname,pl.idright)
	}

	console.log('plorder');
	for(const plname of fen.plorder){
		let pl=fen.players[plname];
		console.log(pl.idleft,plname,pl.idright)
	}















}













