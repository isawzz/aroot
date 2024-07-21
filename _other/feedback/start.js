
onload = start;

function start() {
	phpPost({ app: 'simple' }, 'assets');
}
function start_with_assets(){

	init_table();	//show_bars(); return;

	Clientdata.AUTORESET=false;
	let role = null; //localStorage.getItem('role');
	if (nundef(role)) show_roles(); else show_my_role(role);

}

























