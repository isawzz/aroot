

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























