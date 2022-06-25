//#region polling
function autopoll(ms) {
	let polltime = isdef(ms) ? ms : 2000;
	//ich soll verhindern dass hotseat und solo von einem NON-host gespielt werden!
	if (Pollmode == 'auto' && isdef(Z) && (Z.mode == 'multi' && !is_just_my_turn() || Z.role == 'spectator')) {
		TO.poll = setTimeout(_poll, polltime);
	}
}
function ensure_polling() { Pollmode == 'auto'; }
function onclick_startpolling() {
	if (Pollmode == 'auto') return;
	pollStop();
	Pollmode = 'auto';
	DA.noshow = 0;
	console.log('..........poll=>auto',`(noshow:${DA.noshow})`);
	_poll();
}
function onclick_stoppolling() {
	if (Pollmode == 'manual') return;
	pollStop();
	Pollmode = 'manual';
	console.log('..........poll=>manual',`(noshow:${DA.noshow})`);
}
async function onclick_poll() {
	if (Pollmode == 'manual') _poll(true);
	else {
		console.log('stop _autopoll first!!!')
	}

}
function pollStop() { clearTimeout(TO.poll); }
function _poll() {
	//return;
	if (nundef(U) || nundef(Z) || nundef(Z.friendly)) { console.log('poll without U or Z!!!', U, Z); return; }

	//Counter.poll = isdef(Counter.poll) ? Counter.poll + 1 : 1;
	// console.log('____poll:', Counter.poll);
	console.log('____poll:',`(noshow:${DA.noshow})`);

	phpPost({ friendly: Z.friendly }, 'table');
}

//#-endregion





