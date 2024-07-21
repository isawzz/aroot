function onclick_games() { if (!menu_enabled('games')) return; stop_game(); to_games(); }

function onclick_game_menu_item(ev) {
	console.assert(is_admin(), 'game menu click NON admin!!!!!');
	S.game = ev_to_gname(ev);
	let table = lookup(S.tables_by_game, [S.game, 0]);
	if (isdef(table)) { parse_table(table); } else S.tid = S.table = null;
	show_settings();
}
function onclick_create_game_button() {
	console.assert(is_admin(), 'non admin is creating game!!!!!!!!!!!');
	collect_game_options();
	to_create_table();
}
function onclick_delete_table() { stop_game(); delete_current_table(to_games); }
function onclick_reset_tables() { stop_game(); server_send({}, 'reset_tables', to_games); }
