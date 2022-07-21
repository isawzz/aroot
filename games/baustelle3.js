function busy_wait_until_slot(slot){
	let diff = get_slot_diff(Z.fen);
	let dd;
	do {
		dd = last_n_digits(Date.now(), 2);
		if (dd >= slot && dd <= slot + diff) { break; }

	} while (true);
	return dd;
}
function last_n_digits(number,n=2) {
		return number % Math.pow(10,n);
}
function get_now_milliseconds() {
	return Date.now();
}
function get_slot_diff(fen){return Math.floor(100/fen.plorder.length);}







