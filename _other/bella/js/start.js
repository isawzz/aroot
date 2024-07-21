window.onload = start_prelims;

function start() {
	if (is_admin()) to_admin(to_games); //else to_guest(to_users);
}


function to_admin() {
	show('dAdminButtons');
	U = DB.users.mimi; show_user(DB.users[U.name]);
	to_games();
}
function to_games() {
	console.log('games fuer user', U.name, 'suchen');
	get_games(U.name, show_games_menu); //get all tables for this user from server
}
function to_create_table() {
	let t = create_table();
	server_send(t, 'create_table_and_start', to_table);
}
function to_table(){
	console.log('table should be presented!')
}









