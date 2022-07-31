
function is_commission_stage_complete(fen) {

	//comm stage 3 is complete when comm_setup_di hat entry fuer alle players in plorder
	for (const plname of fen.plorder) {
		if (!isdef(fen.comm_setup_di[plname])) return false;
	}
	return true;


}








