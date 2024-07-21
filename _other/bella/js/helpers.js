function create_table(){
	S.tid = S.table = null;
	S.scoring_complete = false;
	let t = {};
	t.friendly = generate_friendly_table_name();
	t.game = S.game;
	t.host = U.name;
	t.players = valf(lookup(S, ['game_options', 'players']), get_def_players_for_user(U.name));
	t.options = valf(lookup(S, ['game_options', 'game']), {});
	t.status = 'started'; // created
	t.host_status = 'joined'; // joined
	t.player_status = 'joined'; // join
	t.player_init = {};
	//jeder bekommt seine settings als fen!
	t.fen = get_start_data_fen(t.players, t.game);
	return t;
}
function delete_current_table(callback) { if (nundef(S.tid)) return; server_send(S.tid, 'delete_table', callback); S.tid = S.table = null; }

function get_games(uname, callback) { server_send(uname, "games", callback); }

function parse_table_and_players(obj) {
	console.log('parse_table',obj.table);
	parse_table(obj.table);
	for(const pl of S.players) copyKeys(obj.players,pl);
}
function parse_table(t) {
	set_start_data_from_fen(t.fen, S.game);  //convert fen to DB values for preferred language and 
	if (isString(t.options)) t.options = JSON.parse(t.options); //convert options
	S.players = t.players.map(x=>({ name: x, color: getColorDictColor(DB.users[x].color), imgPath: `../base/assets/images/${x}.jpg`, score: 0 }));
	S.players_by_name = arr_to_dict_by(S.players, 'name');	
	S.game = t.game;
	S.tid = t.id;
	S.table = t;
}

function show_games_menu() {
	console.assert(isdef(S.tables_by_game), 'ERROR', getFunctionCallerName(), 'S.tables_by_game not set!');
	console.log('tables for user', U.name, S.tables);

	let html = `<div id='game_menu' style="text-align: center; animation: appear 1s ease both">`;
	for (const g of dict2list(DB.games)) { html += ui_game_menu_item(g, S.tables_by_game[g.id]); }
	mBy('inner_left_panel').innerHTML = html;
	mCenterCenterFlex(mBy('game_menu'));
}
function show_table() {
	console.log('show_table S', S)
}
function show_user(udata) {
	where(udata);
	mStyle(mBy('user_info'), { opacity: 1 });
	//mBy('user_info').style.opacity = 1;
	mBy("username").innerHTML = mBy('mini_username').innerHTML = udata.name;
	mBy("motto").innerHTML = udata.motto;

	let path = '../base/assets/images/' + (udata.image ? udata.name : 'unknown_user') + '.jpg';
	mBy("profile_image").src = mBy('mini_profile_img').src = path + (is_online() ? '?=' + Date.now() : '');
}

function ui_game_menu_item(g, g_tables = []) {
	let [sym, bg, color, id] = [Syms[g.logo], getColorDictColor(g.color), null, getUID()];
	if (!isEmpty(g_tables)) {
		let t = g_tables[0]; //most recent table of that game
		let have_another_move = t.player_status == 'joined';
		color = have_another_move ? 'green' : 'red';
		id = `rk_${t.id}`;
	}
	return `
	<div onclick="onclick_game_menu_item(event)" gamename=${g.id} style='cursor:pointer;border-radius:10px;margin:10px;padding:5px;padding-top:15px;width:120px;height:90px;display:inline-block;background:${bg};position:relative;'>
	${nundef(color) ? '' : runderkreis(color, id)}
	<span style='font-size:50px;font-family:${sym.family}'>${sym.text}</span><br>${g.friendly}</div>
	`;
}
function runderkreis(color, id) {
	return `<div id=${id} style='width:20px;height:20px;border-radius:50%;background-color:${color};color:white;position:absolute;left:0px;top:0px;'>` + '' + "</div>";
}







