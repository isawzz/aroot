<?php

function checkForNewMessagesToMe($username) {
  $msgs = array();
  $me = $username;
  $query = "select * from messages where receiver = '$me' && received = 0";
  $mymgs = db_read($query);

  if (is_array($mymgs)) {

    foreach ($mymgs as $row2) {
      $sender = $row2['sender'];

      if (isset($msgs[$sender])) {
        $msgs[$sender]++;
      } else {
        $msgs[$sender] = 1;
      }
    }
  }
  return $msgs;

}
function checkForLastMessageContacts($username) {
  $query = "select * from messages where receiver = '$username' OR sender = '$username' ORDER BY date DESC";
  $result = db_read($query);

  return $result;
}
function completeUserdata($username, $userdata) {
  if (!array_key_exists('userid', $userdata)) {$userdata['userid'] = generateId();}
  if (!array_key_exists('username', $userdata)) {$userdata['username'] = $username;}
  if (!array_key_exists('email', $userdata)) {$userdata['email'] = "$username@email.com";}
  if (!array_key_exists('password', $userdata)) {$userdata['password'] = "";}
  //if (!array_key_exists('date', $userdata)) {$userdata['date'] = date('Y-M-d H:i:s');}
  $userdata['date'] = date('Y-M-d H:i:s');
  $userdata['image'] = $username . '.jpg';
  return $userdata;
}
function completeMovedata($uname,$tid,$step,$data) {
	$record = array();
	$record['game']=strtok($tid, '_');
	$record['timestamp']=strrchr( $tid, '_'); 
	$record['tid']=$tid;
	$record['user']=$uname;
	$record['data']=$data;
	$record['step']=$step;
  return $record;
}
function create_table($t){
	//pp($t,'CREATE TABLE INPUT');die;
	$info = (object)[];
	$player_init = $t->player_init;	if (!is_string($player_init)) $player_init = json_encode($player_init);
	//$turn = $t->turn; if (!is_string($turn)) $turn = json_encode($turn);
	$fen = '';
	if (isset($t->fen)){
		$fen = $t->fen;	if (!isset($fen)) $fen=''; elseif (!is_string($fen)) $fen = json_encode($fen);

	}
	//echo "fen: $fen"; die;
	$created = get_now();
	$modified = get_now();
	$players = join(',',$t->players);
	$pl_options = $t->pl_options;	if (!is_string($pl_options)) $pl_options = json_encode($pl_options);
	$options = $t->options;	if (!is_string($options)) $options = json_encode($options);
	$q="INSERT INTO `tables` (`friendly`, `game`, `created`, `modified`, `host`, `players`, `fen`, `pl_options`, `options`, `status`) 
		VALUES ('$t->friendly', '$t->game', $created, $modified, '$t->host', '$players', '$fen', '$pl_options', '$options', '$t->status')";

	$t->id=db_writeX($q);
	$t->created = $created;
	$t->modified = $modified;

	$each_player=array();
	//echo $t->players; die;
	foreach($t->players as $name){
		$score = 0;
		$status = $name == $t->host ? $t->host_status : $t->player_status;
		$modified = $t->created;
		$qw="INSERT INTO `players` (`tid`, `name`, `player_status`, `score`, `state`, `checked`) VALUES ($t->id, '$name', '$status', $score, '$player_init', $modified)";
		$qr="SELECT * FROM players WHERE tid = $t->id";
		$res=db_write_read($qw,$qr);
		//pp($res,'players record'); die;
		$each_player[]=['tid'=>$t->id,'name'=>$name,'player_status'=>$status,'score'=>$score,'state'=>$player_init, 'checked'=>$modified];
	}
	$info->table = $t; // join(',',$each_write); 
	$info->players = $each_player;
	return $info;
}
function db_update_table_and_players($o){
	$state = $o->req->state;if (!is_string($state)) $state = json_encode($state);
	$player_status = $o->req->player_status;
	$score = $o->req->score; 
	$uname = $o->req->uname;
	$tid = $o->req->tid;
	$time = get_now();
	//pp($o->req); echo "tid: $tid"; die;

	//table state is changed to 'ending' if state is 'done'
	$qr = "SELECT * FROM tables WHERE id = $tid";
	$table = db_read($qr)[0];
	$disregard_last_score = false;
	$is_winner = false;
	if ($player_status == 'done' && $table['status'] == 'started'){
			$qw = "UPDATE tables SET `status`='over',modified=$time WHERE id = $tid"; //ok
			$res_write = db_write($qw);
			$table['status']='over';
			$is_winner = true;
	} elseif ($table['status'] != 'started') {
		$player_status = 'done';
		$disregard_last_score = true;
	}

	//echo "should write $state to players $uname table $tid";
	if ($disregard_last_score){
		$qw = "UPDATE players SET player_status='$player_status',`state`='$state',checked=$time WHERE tid = $tid and name = '$uname'"; //ok
	}else{
		$qw = "UPDATE players SET score=$score,player_status='$player_status',`state`='$state',checked=$time WHERE tid = $tid and name = '$uname'"; //ok
	}
	
	$res_write = db_write($qw);
	//pp($res_write,'write');
	$qr = "SELECT * FROM players WHERE tid = $tid";
	$res = db_read($qr);

	return $res;

}

function db_update_playerdata($o){
	$state = $o->req->state;if (!is_string($state)) $state = json_encode($state);
	$player_status = $o->req->player_status;
	$score = $o->req->score; 
	$uname = $o->req->uname;
	$tid = $o->req->tid;
	$time = get_now();
	//pp($o->req); echo "tid: $tid"; die;

	//table state is changed to 'ending' if state is 'done'
	$qr = "SELECT * FROM tables WHERE id = $tid";
	$table = db_read($qr)[0];
	$disregard_last_score = false;
	$is_winner = false;
	if ($player_status == 'done' && $table['status'] == 'started'){
			$qw = "UPDATE tables SET `status`='over',modified=$time WHERE id = $tid"; //ok
			$res_write = db_write($qw);
			$table['status']='over';
			$is_winner = true;
	} elseif ($table['status'] != 'started') {
		$player_status = 'done';
		$disregard_last_score = true;
	}

	//echo "should write $state to players $uname table $tid";
	if ($disregard_last_score){
		$qw = "UPDATE players SET player_status='$player_status',`state`='$state',checked=$time WHERE tid = $tid and name = '$uname'"; //ok
	}else{
		$qw = "UPDATE players SET score=$score,player_status='$player_status',`state`='$state',checked=$time WHERE tid = $tid and name = '$uname'"; //ok
	}
	
	$res_write = db_write($qw);
	//pp($res_write,'write');
	$qr = "SELECT * FROM players WHERE tid = $tid";
	$res = db_read($qr);

	return $res;

}
function db_update_playerdata_old($o){
	$state = $o->req->state;
	$player_status = $o->req->player_status;
	if (!is_string($state)) $state = json_encode($state);
	$score = $o->req->score; 
	$uname = $o->req->uname;
	$tid = $o->req->tid;
	$time = get_now();
	//pp($o->req); echo "tid: $tid"; die;

	//table state is changed to 'ending' if state is 'done'
	$qr = "SELECT * FROM tables WHERE id = $tid";
	$table = db_read($qr)[0];
	$disregard_last_score = false;
	$is_winner = false;
	if ($player_status == 'done' && $table['status'] == 'started'){
		// if ($table['status'] == 'started') {
			$qw = "UPDATE tables SET `status`='ending',modified=$time WHERE id = $tid"; //ok
			$res_write = db_write($qw);
			$table['status']='ending';
			$is_winner = true;
		// }
	} elseif ($table['status'] == 'ending') {
		$player_status = 'done';
		$disregard_last_score = true;
	}

	//echo "should write $state to players $uname table $tid";
	if ($disregard_last_score){
		$qw = "UPDATE players SET player_status='$player_status',`state`='$state',checked=$time WHERE tid = $tid and name = '$uname'"; //ok
	}else{
		$qw = "UPDATE players SET score=$score,player_status='$player_status',`state`='$state',checked=$time WHERE tid = $tid and name = '$uname'"; //ok
	}
	
	$res_write = db_write($qw);
	//pp($res_write,'write');
	$qr = "SELECT * FROM players WHERE tid = $tid";
	$res = db_read($qr);

	if ($table['status'] == 'ending')	{
		$alldone = true;
		foreach($res as $pldata){
			if ($pldata['player_status'] != 'done') $alldone = false;
		}
		if ($alldone){
			$qw = "UPDATE tables SET `status`='show' WHERE id = $tid"; //ok
			$res_write = db_write($qw);

		}
	}

	return $res;

}
function db_update_seen($o){
	//$state = $o->req->state;
	//$player_status = $o->req->player_status;
	//if (!is_string($state)) $state = json_encode($state);
	//$score = $o->req->score; 
	$uname = $o->req->uname;
	$tid = $o->req->tid;
	$time = get_now();
	//pp($o->req); echo "tid: $tid"; die;

	//table state is changed to 'ending' if state is 'done'
	$qr = "SELECT * FROM tables WHERE id = $tid";
	$table = db_read($qr)[0];

	//echo "should write $state to players $uname table $tid";
	$qw = "UPDATE players SET player_status='seen',checked=$time WHERE tid = $tid and name = '$uname'"; //ok
	$res_write = db_write($qw);
	//pp($res_write,'write');
	$qr = "SELECT * FROM players WHERE tid = $tid";
	$res = db_read($qr);

	if ($table['status'] == 'show')	{
		$alldone = true;
		foreach($res as $pldata){
			if ($pldata['player_status'] != 'seen') $alldone = false;
		}
		if ($alldone){
			$qw = "UPDATE tables SET `status`='seen' WHERE id = $tid"; //ok
			$res_write = db_write($qw);
			// $q="DELETE FROM `tables` WHERE id = $tid";
			// $res=db_write($q);
			// $q="DELETE FROM `players` WHERE tid = $tid";
			// $res=db_write($q);
			// return "table $tid deleted!";
		}
	}

	return $res;

}
function delete_game_table($o){
	// $q="DELETE FROM `tables` WHERE id = $tid";
	$tid = $o->req->tid;
	if (isset($o->req->end_scoring)){
		$end_scoring = $o->req->end_scoring;
		if (!is_string($end_scoring)) $end_scoring = json_encode($end_scoring);	
	}else $end_scoring = 'nix';
	$time = get_now();
	
	$q =  "UPDATE tables SET status='past',end_scoring='$end_scoring',modified=$time WHERE id = $tid"; //ok
	$res=db_write($q);
	//$q="DELETE FROM `players` WHERE tid = $tid";
	//$res=db_write($q);
	// $q="DELETE FROM `moves` WHERE tid = $tid";
	// $res=db_write($q);

	return $end_scoring;

}
function db_connect() {
  if ($_SERVER['SERVER_NAME'] == "localhost") {
    $dbhost = "localhost";
    $dbuser = "root";
    $dbpass = "";
    $dbname = "mychat_db";
  } else {
    $dbhost = 'db5004411681.hosting-data.io';
    $dbuser = 'dbu1710177';
    $dbpass = 'totalerMistDieserHost!';
    $dbname = 'dbs3676269';
  }
  if (!$con = mysqli_connect($dbhost, $dbuser, $dbpass, $dbname)) {
    die("failed to connect!");
  } else {
    //echo '<p>Connection to MySQL server successfully established.</p>';
    return $con;
  }
}
function db_get_messages($from, $to, $n = 5) {
  $con = db_connect();
  $q = "SELECT * FROM messages WHERE sender = '$from' AND receiver = '$to' AND deleted_sender = 0 OR sender = '$to' AND receiver = '$from'  AND deleted_receiver = 0 order by id desc limit $n";
  $result = mysqli_query($con, $q);
  $messages = [];
  if ($result->num_rows > 0) {
    $rows = [];
    while ($row = $result->fetch_assoc()) {
      $rows[] = $row;
    }
    $messages = $rows;
    $messages = array_reverse($messages);

  }
  $con->close();
  return $messages;
}
function db_get_messages_for($me, $other) {
  $username = $me->username;
  $chatUsername = $other->username;
  $sql = "select * from messages where (sender = '$username' && receiver = '$chatUsername' && deleted_sender = 0) || (receiver = '$username' && sender = '$chatUsername' && deleted_receiver = 0) order by id desc limit 10";
  $messages = db_read($sql);
  $new_message = false;
  if (is_array($messages)) {
    $messages = array_reverse($messages);
    foreach ($messages as $da) {
      $data = (object)$da;
      if ($data->receiver == $username && $data->received == 0) {$new_message = true;} //check for new messages
      if ($data->receiver == $username) {
        $data->isNew = $new_message;
        db_update("update messages set received = 1 where id = '$data->id' limit 1");
      }
    }
  }
  return $messages;
}
function db_get_userdata($username) {
  if ($username == '' || $username == null) {
    return null;
  }

  $con = db_connect();
  $q = "SELECT * FROM users WHERE username = '$username' limit 1";
  $result = mysqli_query($con, $q);
  $userdata = ['username' => $username];
  if ($result->num_rows == 0) {
    $userdata = completeUserdata($username, $userdata);
    $q = qInsertUserdataComplete($username, $userdata);
    $result = mysqli_query($con, $q);
  } else {
    $rows = [];
    while ($row = $result->fetch_assoc()) {
      $rows[] = $row;
    }
    $userdata = $rows[0];
  }
  $con->close();
  $userdata['hasImage'] = file_exists(__DIR__ . "/../../base/assets/images/" . $username . '.jpg');
  $userdata['imagePath'] = "../base/assets/images/" . ($userdata['hasImage'] ? $username : 'unknown_user') . '.jpg';
  return $userdata; // ['q' => $q, 'userdata' => $userdata, 'date' => $userdata['date'], 'result' => $result]; // $userdata;
}
function db_read($q) {
  $con = db_connect();
  $result = mysqli_query($con, $q);
	if ($result == false){
		echo $q;
		pp($result);
		die;
	}
  $rows = [];
  while ($row = $result->fetch_assoc()) {
    $rows[] = $row;
  }
  $con->close();
  return $rows;
}
function db_read_count($q) {
  $con = db_connect();
  $result = mysqli_query($con, $q);
  $rows = [];
  while ($row = $result->fetch_assoc()) {
    $rows[] = $row;
  }
  $con->close();
  return count($rows);
}
function db_update($q) {
  $con = db_connect();
  $result = mysqli_query($con, $q);
  return $result;
}
function db_writeX($q){
  if ($_SERVER['SERVER_NAME'] == "localhost") {
    $dbhost = "localhost";
    $dbuser = "root";
    $dbpass = "";
    $dbname = "mychat_db";
  } else {
    $dbhost = 'db5004411681.hosting-data.io';
    $dbuser = 'dbu1710177';
    $dbpass = 'totalerMistDieserHost!';
    $dbname = 'dbs3676269';
  }
	$mysqli = new mysqli($dbhost,$dbuser,$dbpass,$dbname);
	if ($mysqli -> connect_errno) {
		echo "Failed to connect to MySQL: " . $mysqli -> connect_error;
		exit();
	}

	$mysqli -> query($q);
	$res=$mysqli -> insert_id;
	//echo "New record has id: " . $mysqli -> insert_id; die; // Print auto-generated id
	$mysqli -> close();
	return $res;	
}
function db_write_read($qw,$qr){
	//echo $qw;
	db_write($qw);
	$res = db_read($qr)[0];
	return $res;
}
function db_write_read_all($qw,$qr){
	db_write($qw);
	$res = db_read($qr);
	return $res;
}
function db_write($q) {
  $con = db_connect();
  $result = mysqli_query($con, $q);
	//echo $result; die;
  return $result;
}
function eLine($s) {echo $s . '<br>';}
function extractUsername($o) {
  return $o->username;
}
function generateId($max = 20) {
  $rand = '';
  $rand_count = rand(8, $max);
  for ($i = 0; $i < $rand_count; $i++) {
    $rand .= rand(0, 9);
  }
  return $rand;
}
function get_contacts_by_name($username) {
  $sql = "select * from users where username != '$username' ORDER BY username";
  $users = db_read($sql); //$DB->read($sql, []);
  $dict = [];
  foreach ($users as $u) {
    $o = (object)$u;
    $dict[$o->username] = $o;
    $o->isContact = false;
  }
  return $dict;
}
function isLocalhost() {return ($_SERVER['SERVER_NAME'] == "localhost");}
function isdef($s) {return !nundef($s);}
function load_yaml_asset($name,$subdir='') {
  $path = '../../base/assets/' . $subdir;
  $asset = file_get_contents($path . $name . '.yaml');
	return $asset;
}
function load_game_assets() {
  $path = '../../base/assets/';
  $c52 = file_get_contents($path . 'c52.yaml');
  $syms = file_get_contents($path . 'allSyms.yaml');
  $symGSG = file_get_contents($path . 'symGSG.yaml');
  $fens = file_get_contents($path . 'fens.csv');
  $allWP = file_get_contents($path . 'math/allWP.yaml');
  $cinno = file_get_contents($path . 'fe/inno.yaml');
  return ['fens' => $fens, 'c52' => $c52, 'cinno' => $cinno, 'syms' => $syms, 'symGSG' => $symGSG, 'allWP' => $allWP];
}
function load_db($key){	return file_get_contents(__DIR__ . "/data/$key.yaml");}
function load_assets() {
  $path = '../../base/assets/';
  $c52 = file_get_contents($path . 'c52.yaml');
  $syms = file_get_contents($path . 'allSyms.yaml');
  $symGSG = file_get_contents($path . 'symGSG.yaml');
  $fens = file_get_contents($path . 'fens.csv');
  $allWP = file_get_contents($path . 'math/allWP.yaml');
  $cinno = file_get_contents($path . 'fe/inno.yaml');
  // $edict = file_get_contents($path . 'words/edict.txt');
  // $ddict = file_get_contents($path . 'words/ddict.txt');
  // $sdict = file_get_contents($path . 'words/sdict.txt');
  // $fdict = file_get_contents($path . 'words/fdict.txt');
  $db = file_get_contents(__DIR__ . '/../DB.yaml');
  return ['fens' => $fens, 'db' => $db, 'c52' => $c52, 'cinno' => $cinno, 'syms' => $syms, 'symGSG' => $symGSG, 'allWP' => $allWP];
  // return ['edict' => $edict,'ddict' => $ddict,'sdict' => $sdict,'fdict' => $fdict, 'fens' => $fens, 'db' => $db, 'c52' => $c52, 'cinno' => $cinno, 'syms' => $syms, 'symGSG' => $symGSG, 'allWP' => $allWP];
}
function load_dictionary($lang) {
  $path = '../../base/assets/';
  $dict = file_get_contents($path . 'words/'.$lang.'dict.txt');
  // $ddict = file_get_contents($path . 'words/ddict.txt');
  // $sdict = file_get_contents($path . 'words/sdict.txt');
  // $fdict = file_get_contents($path . 'words/fdict.txt');
  return $dict;
}
function load_assets1() {
  $path = '../../base/assets/';
  //$c52 = file_get_contents($path . 'c52.yaml');
  $syms = file_get_contents($path . 'allSyms.yaml');
  //$symGSG = file_get_contents($path . 'symGSG.yaml');
  //$fens = file_get_contents($path . 'fens.csv');
  //$allWP = file_get_contents($path . 'math/allWP.yaml');
  //$cinno = file_get_contents($path . 'fe/inno.yaml');
  //$db = file_get_contents(__DIR__ . '/../DB.yaml');  
	//echo "db: $db"; die;
	//$db_users = file_get_contents('../../bg/server/data/db_users.yaml');
  //$db_games = file_get_contents('../../bg/server/data/db_games.yaml');
  // return ['fens' => $fens, 'db_users' => $db_users,'db_games' => $db_games, 'c52' => $c52, 'cinno' => $cinno, 'syms' => $syms, 'symGSG' => $symGSG, 'allWP' => $allWP];
  // return ['fens' => $fens, 'db' => $db, 'c52' => $c52, 'cinno' => $cinno, 'syms' => $syms, 'symGSG' => $symGSG, 'allWP' => $allWP];
  // return ['db' => $db, 'syms' => $syms, 'symGSG' => $symGSG];
  return ['syms' => $syms];
}
function nundef($s) {return (!isset($s) || trim($s) === '');}
function pp($obj, $title = "hallo") {
  if (isset($title)) {
    echo "<br>$title:";
  }

  echo "<pre>";
  print_r((array)$obj);
  echo "</pre>";
}
function prepareMessages($from, $to) {
  $q = "
  INSERT INTO `messages` (`sender`, `receiver`, `message`, `date`, `seen`, `received`, `deleted_sender`, `deleted_receiver`) VALUES ('$from', '$to', 'mox heute?', '2021-09-04 12:40:23', 1,1,0,0);
  INSERT INTO `messages` (`sender`, `receiver`, `message`, `date`, `seen`, `received`, `deleted_sender`, `deleted_receiver`) VALUES ('$to', '$from', 'heut gehts nicht, vielleicht morgen?', '2021-09-04 12:41:23', 1,1,0,0);
  INSERT INTO `messages` (`sender`, `receiver`, `message`, `date`, `seen`, `received`, `deleted_sender`, `deleted_receiver`) VALUES ('$from', '$to', 'gut!', '2021-09-04 12:41:53', 1,1,0,0);
  INSERT INTO `messages` (`sender`, `receiver`, `message`, `date`, `seen`, `received`, `deleted_sender`, `deleted_receiver`) VALUES ('$to', '$from', 'bis dann also', '2021-09-04 12:44:23', 1,1,0,0);
  INSERT INTO `messages` (`sender`, `receiver`, `message`, `date`, `seen`, `received`, `deleted_sender`, `deleted_receiver`) VALUES ('$to', '$from', 'vergiss nicht die liste', '2021-09-04 12:45:23', 1,1,0,0);
  INSERT INTO `messages` (`sender`, `receiver`, `message`, `date`, `seen`, `received`, `deleted_sender`, `deleted_receiver`) VALUES ('$from', '$to', 'na eh klar, ich vergess doch nir etwas, wie du weisst...', '2021-09-04 12:51:53', 1,1,0,0);

  ";
  echo $q;
  die;
  $con = db_connect();
  $result = mysqli_query($con, $q);
  echo $result;
  $con->close();
}
function qInsertUserdataComplete($username, $userdata) {
  $u = (object)$userdata;
  //$date = strtotime($u->date);
  $u->date = '2021-09-04 18:29:43';
  $u->date = date('Y-m-d H:i:s');
  //$q = "INSERT INTO `users` (`userid`, `username`, `email`, `password`, `date`, `image`) VALUES
  //($u->userid, '$u->username', '$u->email', '$u->password', STR_TO_DATE($u->date,'%Y/%M/%d %H:%i:%s'), '$u->image')";
  //eLine($q);

  $q = "INSERT INTO `users` (`userid`, `username`, `email`, `password`, `date`, `image`) VALUES
  ($u->userid, '$u->username', '$u->email', '$u->password', '$u->date', '$u->image')";

  return $q;
}
function qInsertMoveComplete($record) {
  $u = (object)$record;

  $q = "INSERT INTO `tables` (`game`, `tid`, `timestamp`, `user`, `data`, `step`) VALUES
  ($u->game, '$u->tid', $u->timestamp, '$u->user', '$u->data', $u->step)";

  return $q;
}
function qInsertTextMessage($from, $to, $text) {
  $date = date('Y-m-d H:i:s');
  $q = "INSERT INTO `messages` (`sender`, `receiver`, `message`, `date`, `seen`, `received`, `deleted_sender`, `deleted_receiver`) VALUES
  ('$from', '$to', '$text', '$date', 0, 0, 0, 0)";
  //INSERT INTO `messages` (`sender`, `receiver`, `message`, `date`, `seen`, `received`, `deleted_sender`, `deleted_receiver`) VALUES ('$from', '$to', 'hallo wie gehts?', '2021-09-04 12:00:23', 1,1,0,0);
  //INSERT INTO `messages` (`sender`, `receiver`, `message`, `date`, `seen`, `received`, `deleted_sender`, `deleted_receiver`) VALUES ('$to', '$from', 'gut und dir?', '2021-09-04 12:03:23', 1,1,0,0);
  //eLine($q);
  return $q;
}
function qInsertFileMessage($from, $to, $file) {
  $date = date('Y-m-d H:i:s');
  $q = "INSERT INTO `messages` (`sender`, `receiver`, `files`, `date`, `seen`, `received`, `deleted_sender`, `deleted_receiver`) VALUES
  ('$from', '$to', '$file', '$date', 0, 0, 0, 0)";
  //INSERT INTO `messages` (`sender`, `receiver`, `message`, `date`, `seen`, `received`, `deleted_sender`, `deleted_receiver`) VALUES ('$from', '$to', 'hallo wie gehts?', '2021-09-04 12:00:23', 1,1,0,0);
  //INSERT INTO `messages` (`sender`, `receiver`, `message`, `date`, `seen`, `received`, `deleted_sender`, `deleted_receiver`) VALUES ('$to', '$from', 'gut und dir?', '2021-09-04 12:03:23', 1,1,0,0);
  //eLine($q);
  return $q;
}
function save_db($key,$content){ 

  rename(__DIR__ . "/data/$key.yaml", __DIR__ . "/data/$key" . "_old.yaml");
	file_put_contents(__DIR__ . "/data/$key.yaml", $content);
}
function show_inserts($table, $where = null) {
  $con = db_connect();
  $sql = "SELECT * FROM `{$table}`" . (is_null($where) ? "" : " WHERE " . $where) . ";";
  $result = mysqli_query($con, $sql);

  $fields = array();
  foreach ($result->fetch_fields() as $key => $value) {
    $fields[$key] = "`{$value->name}`";
  }

  $values = array();
  while ($row = $result->fetch_row()) {
    $temp = array();
    foreach ($row as $key => $value) {
      if (is_numeric($value)) {
        $temp[$key] = ($value === null ? 'NULL' : $value);
      } else {
        $temp[$key] = ($value === null ? 'NULL' : "'" . $value . "'");
      }

    }
    $values[] = "(" . implode(",", $temp) . ")";
  }
  $num = $result->num_rows;
  return "INSERT `{$table}` (" . implode(",", $fields) . ") VALUES \n" . implode(",\n", $values) . ";";
}
function sortContactsByMostRecentFirst($username) {
  $uarr = get_contacts_by_name($username);
  $marr = checkForLastMessageContacts($username);
  $contacts = [];
  $di = [];
  foreach ($marr as $m) {
    $o = (object)$m;
    //pp($o, 'message');
    $cont = $o->sender == $username ? $o->receiver : $o->sender;
    //echo 'cont: ' . $cont;
    //echo 'username: ' . $username;
    //pp($di,'di');
    //pp($o,'o');
    if (!array_key_exists($cont, $di)) {
      //echo $cont . " exists!";
      $oUser = (object)$uarr[$cont];
      $oUser->isContact = true;
      $contacts[] = $oUser;
      $di[$cont] = $oUser;
    }
  }

  foreach ($uarr as $name => $o) {
    //$o = (object)$u;
    //$cont = $o->username;
    if (!$o->isContact) {
      $contacts[] = $o;
    }

  }
  return $contacts;
}
//timestamp:
function get_now(){
	//$ms = number_format(microtime(true)*1000,0,'.','');
	//echo $ms; die;
	//$ms = microtime();
	//$type=gettype($ms);
	//echo 'test ' . $ms . ' ' . $type;
	//die;
	
	return number_format(microtime(true)*1000,0,'.','');
}
function uiGetContactStylesAndStart() {
  $mydata = '
	<style>
		@keyframes appear{

			0%{opacity:0;transform: translateY(50px)}
			100%{opacity:1;transform: translateY(0px)}
 		}

 		#contact{
 			cursor:pointer;
 			transition: all .5s cubic-bezier(0.68, -2, 0.265, 1.55);
	 	}

	 	#contact:hover{
	 		transform: scale(1.1);
	 	}

	</style>
	<div style="text-align: center; animation: appear 1s ease both">
  ';
  return $mydata;
}
function uiGetContact($row, $msgs) {
	//pp($row);
  $image = "../base/assets/images/$row->image"; //$row->hasImage ? "../base/assets/images/$row->image.jpg" : "../base/assets/images/unknown_user.jpg";

  $mydata = "
      <div id='contact' style='position:relative;text-align:center;margin-bottom:18px;' username='$row->username' onclick='start_chat(event)'>
        <img src='$image' draggable='true' ondragstart='drag(event)' class='img_person sz100' style='margin:0;'/>
        <br>$row->username";
  // <br><div style='text-align:center;'>$row->username</div>";

  if (count($msgs) > 0 && isset($msgs[$row->username])) {
    $mydata .= "<div style='width:20px;height:20px;border-radius:50%;background-color:orange;color:white;position:absolute;left:0px;top:0px;'>" . $msgs[$row->username] . "</div>";
  }

  $mydata .= "</div>";
  return $mydata;

}
function uiGetContacts($users, $msgs) {
	//pp($users,'USERS:');
  $mydata = '';
  foreach ($users as $r) {
    $row = (object)$r;
		//pp($row);
    $mydata .= uiGetContact($row, $msgs);
  }
  return $mydata;
}
function uiGetContacts_Worig($users, $msgs) {
  $mydata = '';
  foreach ($users as $r) {
    $row = (object)$r;
    $image = "../base/assets/images/$row->image"; //$row->hasImage ? "../base/assets/images/$row->image.jpg" : "../base/assets/images/unknown_user.jpg";

    $mydata .= "
				<div id='contact' style='position:relative;' username='$row->username' onclick='start_chat(event)'>
					<img src='$image'>
					<br>$row->username";

    if (count($msgs) > 0 && isset($msgs[$row->username])) {
      $mydata .= "<div style='width:20px;height:20px;border-radius:50%;background-color:orange;color:white;position:absolute;left:0px;top:0px;'>" . $msgs[$row->username] . "</div>";
    }

    $mydata .= "
				</div>";
  }
  return $mydata;
}
function ui_message_left($data, $row) {
  $image = $row->imagePath;
  $a = "
	<div id='message_left'>
	<div></div>
		<img  id='prof_img' src='$image'>
		<b>$row->username</b><br>
		$data->message<br><br>";

  if ($data->files != "" && file_exists($data->files)) {
    $a .= "<img src='$data->files' style='width:100%;cursor:pointer;' onclick='image_show(event)' /> <br>";
  }
  $a .= "<span style='font-size:11px;color:white;'>" . date("jS M Y H:i:s a", strtotime($data->date)) . "<span>
	<img id='trash' src='../base/assets/images/icons/trash.png' onclick='delete_message(event)' msgid='$data->id' />
	</div> ";

  return $a;
}
function ui_message_right($data, $row) {
  $image = $row->imagePath;
  $a = "
	<div id='message_right'>

	<div>";

  if ($data->seen) {
    $a .= "<img src='../base/assets/images/tick.png' style=''/>";
  } elseif ($data->received) {
    $a .= "<img src='../base/assets/images/tick_grey.png' style=''/>";
  }

  $a .= "</div>

		<img id='prof_img' src='$image' style='float:right'>
		<b>$row->username</b><br>
		$data->message<br><br>";

  if ($data->files != "" && file_exists($data->files)) {
    $a .= "<img src='$data->files' style='width:100%;cursor:pointer;' onclick='image_show(event)' /> <br>";
  }
  $a .= "<span style='font-size:11px;color:#888;'>" . date("jS M Y H:i:s a", strtotime($data->date)) . "<span>

		<img id='trash' src='../base/assets/images/icons/trash.png' onclick='delete_message(event)' msgid='$data->id' />
	</div>";

  return $a;
}
function ui_message_controls() {

  return "
	</div>
	<span onclick='delete_thread(event)' style='color:purple;cursor:pointer;'>Delete this thread </span>
	<div style='display:flex;width:100%;height:40px;'>
		<label for='message_file'><img src='../base/assets/images/icons/clip.png' style='opacity:0.8;width:30px;margin:5px;cursor:pointer;' ></label>
		<input type='file' id='message_file' name='file' style='display:none' onchange='send_image(this.files)' />
		<input id='message_text' onkeyup='enter_pressed(event)' style='flex:6;border:solid thin #ccc;border-bottom:none;font-size:14px;padding:4px;' type='text' placeHolder='type your message'/>
		<input style='flex:1;cursor:pointer;' type='button' value='send' onclick='send_message(event)'/>
	</div>
	</div>";
}

function validatedUsername($username) {
  //username cannot be emty or contain / or \\ , max 30 letters, NOT case sensitive!
  //eLine("nundef" . (nundef($username) ? 'true' : 'false'));
  //eLine("/" . (strpos($username, '/') ? 'true' : 'false'));
  //eLine("\\" . (strpos($username, '\\') ? 'true' : 'false'));
  //eLine("strlen" . strlen($username));
  if (nundef($username) || strpos($username, '/') || strpos($username, '\\') || strlen($username) > 30) {
    return 'guest';
  }

  return strtolower($username);

}
//echo show_inserts('users');
//prepareMessages("felix", "max");
//echo 'HALLO';

//pp(sortContactsByMostRecentFirst('felix'));
//pp(checkForLastMessageContacts('felix'));
//echo "hallo, " . validatedUsername('amanda');
?>
