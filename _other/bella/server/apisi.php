<?php
require_once "helpers.php";
session_start();
$DATA_RAW = file_get_contents("php://input");
$o = json_decode($DATA_RAW);
$type = $o->type;
$result = (object) [];
$result->type = $type; 

if ($type == 'assets'){
	$list = [];
  foreach ($o->req as $assetname) {
		$asset = str_starts_with($assetname, 'db_')? load_db($assetname) : load_yaml_asset($assetname);
		if (isset($asset)) $list[$assetname] = $asset;
  }
	$result->response = $list;
}else if ($type == 'intro'){ //OK
  $sql = "SELECT * FROM users ORDER BY username";
  $users = db_read($sql); //$DB->read($sql, []);
  $result->users = $users;
}else if ($type == 'get_tables'){ // same as games
	$q = "SELECT * FROM players INNER JOIN tables ON tables.id = players.tid WHERE players.name = '$o->req' and tables.status != 'past' order by tables.modified desc";
	$result->tables = db_read($q);
}else if ($type == 'games'){ // in:uname out:tables (including player_status) (most recent first) OK
	$q = "SELECT * FROM players INNER JOIN tables ON tables.id = players.tid WHERE players.name = '$o->req' and tables.status != 'past' order by tables.modified desc";
	$result->tables = db_read($q);
}else if ($type == 'play' || $type == 'play_start'){
	$uname = $o->req->uname;
	$tid = $o->req->tid;
	$qr = "SELECT * FROM tables WHERE id = $tid";
	$table = db_read($qr)[0];
	$qr = "SELECT * FROM players WHERE tid = $tid and name = '$uname'";
	$player_rec = db_read($qr)[0];
	$table_status = $table['status'];
	if ($table_status == 'over' || $table_status == 'past'){
		$player_status = 'done';
		$time = get_now();
		$qw = "UPDATE players SET `player_status`='$player_status',checked=$time WHERE tid = $tid and name = '$uname'"; //ok
		$res_write = db_write($qw);
	}
	$qr = "SELECT * FROM players WHERE tid = $tid";
	$result->playerdata = db_read($qr);
	$result->table = $table;
}else if ($type == 'play_old'){
	$uname = $o->req->uname;
	$tid = $o->req->tid;
	
	$qr = "SELECT * FROM tables WHERE id = $tid";
	$table = db_read($qr)[0];
	$qr = "SELECT * FROM players WHERE tid = $tid and name = '$uname'";
	$player_rec = db_read($qr)[0];
	if ($table['status'] == 'ending' && $player_rec['player_status'] != 'done' && $player_rec['player_status'] != 'lamov') {
		$player_status = 'lamov';
		$time = get_now();
		$qw = "UPDATE players SET `player_status`='$player_status',checked=$time WHERE tid = $tid and name = '$uname'"; //ok
		$res_write = db_write($qw);
	}
	$qr = "SELECT * FROM players WHERE tid = $tid";
	$result->playerdata = db_read($qr);
	$result->table = $table;

}else if ($type == 'send_move'){ //in: tid,uname,score,state
	$result->playerdata = db_update_playerdata($o);
	$tid = $o->req->tid;
	$qr = "SELECT * FROM tables WHERE id = $tid";
	$result->table = db_read($qr)[0];
}else if ($type == 'seen'){ //in: tid,uname,score,state

	$uname = $o->req->uname;
	$tid = $o->req->tid;
	if (isset($o->req->db)){
		$db = $o->req->db;
		rename(__DIR__ . '/../DB.yaml', __DIR__ . '/../DB_old.yaml');
		file_put_contents(__DIR__ . '/../DB.yaml', $db);
		$result->message = "db has been saved by user $uname";

		//update table status to saved
	}

	$res = db_update_seen($o);
	// if (is_string($res)) {
	// 	$result->playerdata = [];
	// 	$result->table = ['status'=>'deleted'];
	// 	$result->message = $res;
	// }else{
		$result->playerdata = $res;
		$qr = "SELECT * FROM tables WHERE id = $tid";
		$result->table = db_read($qr)[0];
	// }
}else if ($type == 'create_table_and_start'){ // returns table and players OK
	$t = $o->req;
	$info = create_table($t);
	$result->table = $info->table;
	$result->playerdata = $info->players;
}else if ($type == 'modify_table'){ // returns table and players OK
	$t = $o->req;
	$tid = $t->id;
	$players = join(',',$t->players);
	$fen = $t->fen;	if (!is_string($fen)) $fen = json_encode($fen);
	$options = $t->options;	if (!is_string($options)) $options = json_encode($options);
	$time = get_now();

	$qw = "UPDATE tables SET `players`='$players',`fen`='$fen',`options`='$options',modified=$time WHERE id = $tid"; //ok
	$res_write = db_write($qw);

	$qr = "SELECT * FROM tables WHERE id = $tid";
	$res = db_read($qr)[0];
	$result->table = $res;

}else if ($type == 'standard_assets'){ //in: tid,uname out:table,status,player_record,message OK
	$list = load_game_assets();
	foreach (['db_users','db_games'] as $assetname) {
		$asset = str_starts_with($assetname, 'db_')? load_db($assetname) : load_yaml_asset($assetname);
		if (isset($asset)) $list[$assetname] = $asset;
  }
	$result->response = $list;
}else if ($type == 'non_admin_reload'){ // same as games
	$q = "SELECT * FROM players INNER JOIN tables ON tables.id = players.tid WHERE players.name = '$o->req' and tables.status != 'past' order by tables.modified desc";
	$result->tables = db_read($q);
}else if ($type == 'get_user_game_tables'){ // same as games
	$uname = $o->req->uname;
	$game = $o->req->game;
	$q = "SELECT * FROM players INNER JOIN tables ON tables.id = players.tid WHERE tables.game = '$game' and players.name = '$uname' and tables.status != 'past' order by tables.modified desc";
	$result->tables = db_read($q);
}else if ($type == 'get_past_tables'){ // same as games
	$q = "SELECT * FROM tables WHERE tables.status = 'past' order by modified desc";
	$result->tables = db_read($q);
}else if ($type == 'poll_table_started'){ // same as games aber nur tables mit status started
	$q = "SELECT * FROM players INNER JOIN tables ON tables.id = players.tid WHERE players.name = '$o->req' and tables.status = 'started' order by tables.modified desc";
	$result->tables = db_read($q);
}else if ($type == 'poll_table_show'){
	$uname = $o->req->uname;
	$tid = $o->req->tid;
	
	$qr = "SELECT * FROM tables WHERE id = $tid and status != 'past'";
	$table = db_read($qr)[0];
	$qr = "SELECT * FROM players WHERE tid = $tid";
	$result->playerdata = db_read($qr);
	$result->table = $table;

}else if ($type == 'poll_table_seen'){
	$uname = $o->req->uname;
	$tid = $o->req->tid;
	
	$qr = "SELECT * FROM tables WHERE id = $tid"; // and status != 'past'";
	$res = db_read($qr)[0];
	if ($res['status'] == 'past'){
		$result->playerdata = [];
		$result->table = $res;
		$result->message = "NO TABLE $tid";
	}else{
		$qr = "SELECT * FROM players WHERE tid = $tid";
		$result->playerdata = db_read($qr);
		$result->table = $res;
	}


	// $res = db_read($qr);
	// //$result->table = 
	// if (count($res)<1){
	// 	$result->playerdata = [];
	// 	$result->table = [];
	// 	$result->message = "NO TABLE $tid";
	// }else{

	// 	$qr = "SELECT * FROM players WHERE tid = $tid";
	// 	$result->playerdata = db_read($qr);
	// 	$result->table = $res[0];
	// }

}else if ($type == 'login'){
  $sql = "SELECT * FROM users WHERE username != '$o->req' ORDER BY username";
  $users = db_read($sql); //$DB->read($sql, []);
  $result->users = $users;
}else if ($type == 'save_and_delete'){
	$uname = $o->req->uname;
	$tid = $o->req->tid;
	$db = $o->req->db;
	rename(__DIR__ . '/../DB.yaml', __DIR__ . '/../DB_old.yaml');
	file_put_contents(__DIR__ . '/../DB.yaml', $db);
	$result->fen = delete_game_table($o);
	$result->message = "db has been saved and table $tid archived by user $uname";

}else if ($type == 'dictionary'){
	$result->lang = $o->req;
  $result->dict = load_dictionary($o->req);

}else if ($type == 'dbsave') {
  rename(__DIR__ . '/../DB.yaml', __DIR__ . '/../DB_old.yaml');
  file_put_contents(__DIR__ . '/../DB.yaml', $o->req->db);
	$path = __DIR__ . '/../DB.yaml';
	$result->message = "saved to $path";
	$result->data=$o->req->db;
  //echo json_encode(['request' => 'hallo', 'data_type' => 'dbsave']);
}else if ($type == 'delete_table'){ // really delete the table from db
	$tid = $o->req;
	$q="DELETE FROM `tables` WHERE id = $tid";
	$res=db_write($q);
	$q="DELETE FROM `players` WHERE tid = $tid";
	$res=db_write($q);
	$result->message = "completely deleted table $tid";
}else if ($type == 'reset_tables'){ //delete all tables,players,moves OK
	$q="TRUNCATE table `tables`";
	$res=db_write($q);
	$q="TRUNCATE table `moves`";
	$res=db_write($q);
	$q="TRUNCATE table `players`";
	$res=db_write($q);
	$result->q = $q;
//************* NOT USED BUT USEFUL ************************************************************* ok */
}else if ($type == 'ticker_status_send_receive'){ // same as send_move
	$result->playerdata = db_update_playerdata($o);
	
}else if ($type == 'create_table'){ // returns table and players - SAME AS create_table_and_start OK
	$t = $o->req;
	$info = create_table($t);
	$result->table = $info->table;
	$result->playerdata = $info->players;
}else if ($type == 'start_table'){ //in: tid,uname toggles between join and joined status OK
	$tid = $o->req->tid;
	$uname = $o->req->uname;
	$time = get_now();
	//echo "in start_table $tid $uname $time";
	$qw = "UPDATE tables SET status='started',modified=$time WHERE id = $tid"; //ok
	$qr = "SELECT * FROM tables WHERE id = $tid";
	$res = db_write_read($qw,$qr);
	//pp($res); die;
	$result->table = $res;

	//************************************************************************** ok */
}else if ($type == 'join_table'){ //in: tid,uname out:table,status,player_record,message OK
	$tid = $o->req->tid;
	$uname = $o->req->uname;
	//echo "table id: $tid, user name: $uname"; die; //OK
	$q = "SELECT * FROM players WHERE tid = $tid and name = '$uname'";
	$res = db_read($q)[0];
	$result->player_record = $res;
	//pp($res,'PLAYERS RECORD'); die; //OK
	//echo $res['status']; die; //OK

	//first I need to check if the user has already joined
	if ($res['player_status'] == 'join') { // uname has yet to join
		$time = get_now();

		$qw = "UPDATE players SET player_status='joined',checked=$time WHERE name = '$uname' and tid = $tid"; //ok
		$qr = "SELECT * FROM players WHERE tid = $tid and name = '$uname'";
		$res = db_write_read($qw,$qr);
		$status = $res['player_status'];
		$result->status = $status;
		$result->player_record = $res; //override player_record with updated!

		//are all players joined? count records in players for this table id where status is NOT joined
		$num_not_joined = db_read_count("SELECT * FROM players WHERE tid = $tid and player_status = 'join'");
		//echo "players not joined: $num_not_joined"; die; //OK
		if ($num_not_joined == 0){
			$qw = "UPDATE tables SET status='ready',modified=$time WHERE id = $tid"; //ok
			$res = db_write($qw);
			$result->message = "user $uname joined! table ready: host can start the game!!"; 
		}else{
			$result->message = "user $uname joined! still waiting for more players to join!"; 

		}
	}else{
		$result->message = "user $uname has already joined!"; 
		$result->status = 'joined';
	}
	$qr = "SELECT * FROM tables WHERE id = $tid";
	$res = db_read($qr)[0];
	$result->table = $res;
	$result->player_status = $result->player_record['player_status'];



}else if ($type == 'toggle_join'){ //in: tid,uname toggles between join and joined status OK
	$tid = $o->req->tid;
	$uname = $o->req->uname;
	//echo "table id: $tid, user name: $uname"; die; //OK
	$q = "SELECT * FROM players WHERE tid = $tid and name = '$uname'";
	$res = db_read($q)[0];
	//pp($res,'PLAYERS RECORD'); die; //OK
	$status = $res['player_status'];
	$result->vorher = $status;
	$new_status = $status == 'joined'? 'join' : 'joined';
	$time = get_now();
	$qw = "UPDATE players SET player_status='$new_status',checked=$time WHERE name = '$uname' and tid = $tid"; //ok
	$qr = "SELECT * FROM players WHERE tid = $tid and name = '$uname'";
	$res = db_write_read($qw,$qr);
	$result->nachher =  $res['player_status'];
	$result->player_status = $result->nachher;
	$result->table = db_read("SELECT * FROM tables WHERE id = $tid")[0];
	$result->player_record = $res;

	//echo '--- END OF TEST ---'; die;
}
echo json_encode($result);

die;
pp($o,'object');
echo 'type ' . $type;
