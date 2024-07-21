
function host_update(){
	//console.log('hallo host')
	assertion(isdef(Z.fen), 'no fen');

	check_for_clicks();

	show_status();
	//start_creeping_down();	

}

function check_for_clicks(){
	//console.log('playerdata', Z.playerdata);

	let cur = get_bar_values();
	let clicks = get_clicks_from_playerdata();

	//console.log('clicks', clicks);
	
	//console.log('wie berechne ich neues goal von clicks?')

	let newgoals=jsCopy(Z.fen),changed=false;
	for(const k in cur){
		if (clicks[k]==0) continue;
		changed=true;
		
		let newgoal = cur[k] + clicks[k]*10;
		newgoals[k]=newgoal;
		set_new_goal(k, newgoal);
	}

	Z.fen = newgoals;
	
	if (changed){
		//console.log('fen changed!',Z.fen);
		phpPost({ friendly: 'feedback', fen: newgoals, newstate:{green:0,red:0} }, 'update_fen');
	}else{
		autopoll();
	}
}
function onclick_reset_progressbars() {
	//console.log('HAAAAAAAAAAAAAAAAAAAAAALLLLLLLLLLLLLLLLLLLOOOOOOOOOOOO')
	DA.winit = 10; //rNumber(0,100);
	let oldfen=isdef(Z.fen)?jsCopy(Z.fen):{green:0,red:0};
	let fen={green:DA.winit,red:DA.winit};
	
	for (const k in DA.bars) {

		set_new_goal(k, DA.winit);
	}
	phpPost({ friendly: 'feedback', fen: fen }, 'reset');

}



