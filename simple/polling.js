function autopoll(ms) {
	let polltime = isdef(ms) ? ms : 2000;
	if (Pollmode == 'auto' && isdef(G) && (G.options.mode == 'multi' || !G.fen.plorder.includes(U.name) )) {
		TO.poll = setTimeout(poll, polltime);
	}
}
function ensure_polling(){if (Pollmode == 'manual') onclick_pause_continue();}
function onclick_startpolling() {
	pollStop();
	Pollmode = 'auto';
	poll();
}
function onclick_stoppolling() {
	pollStop();
	Pollmode = 'manual';
}
async function onclick_poll() {
	if (Pollmode == 'manual') poll(true);
	else {
		console.log('STOP _autopoll first!!!')
	}

}
function pollStop() { clearTimeout(TO.poll); }
function poll() {
	//return;
	if (nundef(U) || nundef(G)) { console.log('poll without U or G!!!', U, G); return; }

	Counter.poll = isdef(Counter.poll) ? Counter.poll + 1 : 1;
	console.log('____poll:', Counter.poll);

	phpPost({ friendly: G.friendly }, 'table');
}
