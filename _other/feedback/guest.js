
function guest_update() {
	assertion(isdef(Z.fen), 'no fen');

	//set new goals
	show_status();

	let mydata = firstCond(Z.playerdata,x=>x.name == Clientdata.uid);
	if (isdef(mydata) && isdef(mydata.state) && isNumber(mydata.state.green)) {
		console.log('mydata.state', mydata.state);
		assertion(isdef(mydata.state), 'no state');
		for(const k of ['green','red']){
			assertion(isNumber(mydata.state[k]), 'NAN state['+k+']');
			Clientdata.state[k] = Math.ceil((mydata.state[k]+Clientdata.state[k])/2);
		}
	}//else Clientdata.state={green:0,red:0};

	for (const k in Z.fen) {
		set_new_goal(k, Z.fen[k]);
	}

	autopoll();

}

function onclick_plus(id, inc) {
	console.log('id', id);
	ensure_clientstate();
	Clientdata.state[id]++;
	console.log('sending Clientdata.state', Clientdata.state);
	let o = { friendly: 'feedback', uname: Clientdata.uid, state: jsCopy(Clientdata.state) };
	//console.log('sending guest state', o.state);
	phpPost(o, 'update_player');

	//console.log('click plus', Clientdata.state);
	//let bar = DA.bars[id]; set_new_goal(id, bar.w + inc);
}

