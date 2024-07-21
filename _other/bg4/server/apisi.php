<?php
require_once "helpers.php";
session_start();
$DATA_RAW = file_get_contents("php://input");
$o = json_decode($DATA_RAW);
$type = $o->type;
$result = (object) [];
$result->type = $type; //default

if ($type == 'assets'){
	$list = [];
  foreach ($o->req as $assetname) {
		$asset = str_starts_with($assetname, 'db_')? load_db($assetname) : load_yaml_asset($assetname);
		if (isset($asset)) $list[$assetname] = $asset;
  }
	$result->response = $list;
}else if ($type == 'play'){
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
}else if ($type == 'standard_assets'){ //in: tid,uname out:table,status,player_record,message OK
	$list = load_game_assets();
	foreach (['db_users','db_games'] as $assetname) {
		$asset = str_starts_with($assetname, 'db_')? load_db($assetname) : load_yaml_asset($assetname);
		if (isset($asset)) $list[$assetname] = $asset;
  }
	$result->response = $list;
}else if ($type == 'games'){ // return user_tables and player_records (most recent first) OK
	$q = "SELECT * FROM players INNER JOIN tables ON tables.id = players.tid WHERE players.name = '$o->req' and tables.status != 'past' order by tables.modified desc";
	//$q2 = "SELECT * FROM tables INNER JOIN players ON tables.id = players.tid WHERE players.name = '$o->req' order by tables.modified desc";
	$result->user_tables = db_read($q);
	//$result->tables_players = db_read($q2);
	//$q = "SELECT * FROM players WHERE name = '$o->req' order by modified desc";
	//$result->player_records = db_read($q);
	//$result->q = $q;
}else if ($type == 'get_user_tables'){ // same as games
	$q = "SELECT * FROM players INNER JOIN tables ON tables.id = players.tid WHERE players.name = '$o->req' and tables.status != 'past' order by tables.modified desc";
	$result->user_tables = db_read($q);
}else if ($type == 'get_past_tables'){ // same as games
	$q = "SELECT * FROM tables WHERE tables.status = 'past' order by modified desc";
	$result->tables = db_read($q);
}else if ($type == 'poll_table_started'){ // same as games aber nur tables mit status started
	$q = "SELECT * FROM players INNER JOIN tables ON tables.id = players.tid WHERE players.name = '$o->req' and tables.status = 'started' order by tables.modified desc";
	$result->user_tables = db_read($q);
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

}else if ($type == 'contacts'){
	$username = $o->req;
  //$mydata = uiGetContactStylesAndStart();
  $msgs = checkForNewMessagesToMe($username);
  $myusers = sortContactsByMostRecentFirst($username);
  $_SESSION['sortedContacts'] = $myusers; //array_keys($myusers);
  //$mydata .= uiGetContacts($myusers, $msgs);
  //$result->message = $mydata;
  $result->myusers = $myusers;
  $result->msgs = $msgs;
}else if ($type == 'intro'){
  $sql = "SELECT * FROM users ORDER BY username";
  $myusers = db_read($sql); //$DB->read($sql, []);
  $result->myusers = $myusers;
}else if ($type == 'login_new'){
	$username = $o->req;
  $msgs = checkForNewMessagesToMe($username);
  $myusers = sortContactsByMostRecentFirst($username);
  $_SESSION['sortedContacts'] = $myusers; //array_keys($myusers);
  $result->myusers = $myusers;
  $result->msgs = $msgs;
}else if ($type == 'save_and_delete'){
	$uname = $o->req->uname;
	$tid = $o->req->tid;
	$db = $o->req->db;
	rename(__DIR__ . '/../DB.yaml', __DIR__ . '/../DB_old.yaml');
	file_put_contents(__DIR__ . '/../DB.yaml', $db);
	// $q="DELETE FROM `tables` WHERE id = $tid";
	// $res=db_write($q);
	// $q="DELETE FROM `players` WHERE tid = $tid";
	// $res=db_write($q);
	$result->fen = delete_game_table($o);
	$result->message = "db has been saved and table $tid deleted by user $uname";

}else if ($type == 'dbsave') {
  rename(__DIR__ . '/../DB.yaml', __DIR__ . '/../DB_old.yaml');
  file_put_contents(__DIR__ . '/../DB.yaml', $o->req->db);
  //echo json_encode(['request' => 'hallo', 'data_type' => 'dbsave']);
}else if ($type == 'delete_table'){ // input: tid, end_fen which should be scoring/ranking info
	$tid = $o->req->tid;
	$result->fen = delete_game_table($o);
	$result->message = "deleted table $tid";
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
//************** TRASH!!! ************************************************************ ok */
}else if ($type == 'long_poll_table_exists'){ // same as games DOES NOT WORK!!!
	$done = false;
	while(!$done){
		$q = "SELECT * FROM players INNER JOIN tables ON tables.id = players.tid WHERE players.name = '$o->req' order by tables.modified desc";
		$user_tables = db_read($q);
		if (count($user_tables) > 1){
			$done = true;
		}
		sleep(10);
	}
	$result->user_table = $user_tables;

}else if ($type == 'finalize_table__NO') {
	$uname = $o->req->uname;
	$tid = $o->req->tid;
	$db = $o->req->db;
  rename(__DIR__ . '/../DB.yaml', __DIR__ . '/../DB_old.yaml');
  file_put_contents(__DIR__ . '/../DB.yaml', $db);
	$q="DELETE FROM `tables` WHERE id = $tid";
	$res=db_write($q);
	$q="DELETE FROM `players` WHERE tid = $tid";
	$res=db_write($q);

	$result->message = 'deleted table! db up-to-date';
	$result->db_ok = true;
	//alle users muessten eigentlich jetzt die db reloaden!
  //echo json_encode(['request' => 'hallo', 'data_type' => 'dbsave']);

}else if ($type == 'gameover'){ //in: tid,uname,state,player_status
	//need to make sure that all players have sent this message before can close the table!
	$uname = $o->req->uname;
	$tid = $o->req->tid;
	$score = $o->req->score; 
	$player_status = $o->req->player_status;
	//echo "player_status of $uname is $player_status,    ";

	$state = $o->req->state;
	if (!is_string($state)) $state = json_encode($state);

	$time = get_now();
	//pp($o->req); echo "tid: $tid"; die;

	//echo "should write $state to players $uname table $tid";
	$qw = "UPDATE players SET player_status='$player_status',score=$score,`state`='$state',checked=$time WHERE tid = $tid and name = '$uname'"; //ok
	$res_write = db_write($qw);
	//pp($res_write,'write');
	$qr = "SELECT * FROM players WHERE tid = $tid";
	$res1 = db_read($qr);

	$qr = "SELECT * FROM players WHERE tid = $tid and player_status = 'over'";
	$res2 = db_read($qr);

	//echo 'players with status over: ' . count($res2);
	//pp($res2,'RECORDS OF PLAYERS THAT HAVE TERMINATED');
	//pp($res1,'ALL PLAYERS:');

	//hier muss gecheckt werden ob ALLE players bereits status over haben!!!
	if (count($res2)==count($res1)){
		//all players are over! set table status to 'over'
		// I cannot change db from here!!!
		//host needs to poll until this works!
		$qw = "UPDATE tables SET status='over' WHERE id = $tid"; //ok
		$res_write = db_write($qw);
		$result->table_status = 'over';
	}else $result->table_status = 'ending';
	
	$result->playerdata = $res1;
	$result->playerdata_over = $res2;

}else if ($type == 'table'){ // return table tid OK TODO: also return moves since last check...
	echo "$type NOT IMPLEMENTED!!!";
}else if ($type == 'user_game_tables'){
	$req = $o->req;
	$game = $req->game;
	$uname = $req->uname;
	$q = "SELECT * FROM tables INNER JOIN players ON tables.id = players.tid WHERE players.name = '$uname' and tables.game = '$game'";
	$res = db_read($q);
	$result->response = $res; 
	$result->q = $q;
}else if ($type == 'move'){ //in: tid,uname toggles between join and joined status OK
	
	$fen = json_encode($o->req->fen);
	$game = $o->req->game;
	$tid = $o->req->tid;
	$data = $o->req->data;
	$user = $o->req->user;
	$step = $o->req->step;
	$time = get_now();
	//pp($o->req); echo "tid: $tid"; die;

	$q="INSERT INTO `moves` (`game`, `tid`, `timestamp`, `user`, `data`, `step`) VALUES ('$game', $tid, $time, '$user', '$data', $step)";

	db_write($q);

	//get the last moves that have not been gathered before
	$q = "SELECT * FROM moves WHERE tid = $tid and user = '$user' order by timestamp desc";
	$last_move = db_read($q)[0];
	$last_time = $last_move['timestamp'];
	$q = "SELECT * FROM moves WHERE tid = $tid and timestamp >= $last_time";
	$new_moves = db_read($q);

	$result->recent_moves = $new_moves;

	$qw = "UPDATE tables SET fen='$fen',modified=$time WHERE id = $tid"; //ok
	$qr = "SELECT * FROM tables WHERE id = $tid";
	$res = db_write_read($qw,$qr);
	$result->table = $res;

	//************************************************************************** ok */
}else if ($type == 'old_api'){ //in: tid,uname out:table,status,player_record,message OK
  $result->info = load_assets();
	//pp($result,'result');
  //$result->message = 'hello,old api!';
  echo json_encode($result); //['req' => $DATA_OBJ, 'data_type' => 'user_info', 'message' => $Userdata, 'name' => $nvuname]);
}else if ($type == 'table_status'){ //in: tid,uname toggles between join and joined status OK
	$tid = $o->req;
	$qr = "SELECT * FROM tables WHERE id = $tid";
	$res = db_read($qr)[0];
	$result->table = $res;

	//************************************************************************** ok */
}else if ($type == 'complete_players_for_table'){
	$t=$o->req;
	$players=$t->players;
	$tid=$t->id;
	$each_write=array();
	foreach($players as $name){
		//player status should be joined if it is the host in t and join if not
		$status = $name == $t->host ? "joined":"join";
		$modified = $t->created;
		$q="INSERT INTO `players` (`tid`, `name`, `player_status`, `score`, `checked`) VALUES ($tid, '$name', '$status', 0, $modified)";
		$res=db_write($q);
		$each_write[]=$res;
	}

	$result->response = ['writes'=>$each_write,'table'=>$t,'tid'=>$tid, 'playerdata'=>$players];

}else if ($type == 'all_tables'){
	$q = "SELECT * FROM tables";
	$res = db_read($q);
	$result->response = $res; 
	$result->q = $q;

}else if ($type == 'send_move'){
	$mi = $o->req;
	$game = $mi->game;
	$uname = $mi->uname;
	$tid = $mi->tid;
	$step = $mi->step;
	$move = $mi->move;
	$record = completeMovedata($uname,$tid,$step,$data);
	$q = qInsertMoveComplete($record);
	//$res = db_write($q);
	//$result->response = $res; 
	$result->response = 'test'; 
	$result->q = $q;
	$result->record = $record;
	$result->request = $mi;

	//return all moves for this tid


}else if ($type == 'play_dep'){ //NO
	$mi = $o->req;
	$uname = $mi->uname;
	$tid = $mi->tid;
	$step = $mi->step;
	$move = $mi->move;
	$record = completeMovedata($uname,$tid,$step,$data);
	$q = qInsertMoveComplete($record);
	$res = db_write($q);
	$result->response = $res; 
	$result->q = $q;
	$result->record = $record;
	$result->message = $mi;

	//return all moves for this tid

}else if ($type == 'save_users'){
	save_db('db_users',$o->req);
}else if ($type == 'save_tables'){
	save_db('db_tables',$o->req);
}else if ($type == 'add_users'){
	foreach($o->req as $username){
		$userdata = ['username' => $username];
		$userdata = completeUserdata($username, $userdata);
		//pp($userdata);
		$q = qInsertUserdataComplete($username, $userdata);
		//pp($q);
		$result->response = db_write($q);
		//pp($res,'RESULT');


	}
}else if ($type == 'timestamp_test'){
	echo get_now(); die;
}
echo json_encode($result);

die;
pp($o,'object');
echo 'type ' . $type;
