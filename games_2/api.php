<?php
require_once "apihelpers.php";

$raw = file_get_contents("php://input");
$o = json_decode($raw);
$data = $o->data;
$cmd = $o->cmd;
$result = (object)[];
if ($cmd == 'table'){ 
	//$result->data = $data;
	if (isset($data->auto)) $result->auto = $data->auto;
	$friendly = $data->friendly;
	$uname = $data->uname;
	$result->status = "table";
	if (isset ($data->clear_players)){
		$modified = get_now();
		$qw = "UPDATE `indiv` SET `state`='',`state1`='',`state2`='',`player_status`=NULL,`checked`=$modified WHERE `friendly` = '$friendly'";
		$qr = "SELECT * FROM indiv WHERE `friendly` = '$friendly'"; 
		$res=db_write_read_all($qw,$qr);
		$result->playerdata = $res;
		$result->status = "clear_players";
	}else if (isset($data->write_player) && (isset($data->state) || isset($data->state1) || isset($data->state2))){ 
		$qw = "UPDATE `indiv` SET ";
		if (isset($data->state)){ $state = json_encode($data->state); $qw = $qw . "`state`='$state',"; }
		if (isset($data->state1)){ $state1 = json_encode($data->state1); $qw = $qw . "`state1`='$state1',"; }
		if (isset($data->state2)){ $state2 = json_encode($data->state2); $qw = $qw . "`state2`='$state2',"; }
		// $state = json_encode($data->state);
		$player_status = isset($data->player_status)? $data->player_status : '';
		$modified = get_now();
		$qw = $qw . "`player_status`='$player_status',`checked`=$modified WHERE `friendly` = '$friendly' and `name` = '$uname'";
		$qr = "SELECT * FROM indiv WHERE `friendly` = '$friendly'"; 
		$res=db_write_read_all($qw,$qr);
		$result->playerdata = $res;
		$result->status = "write_player";
	// }else if (isset($data->write_player) && isset($data->state)){ 
	// 	$state = json_encode($data->state);
	// 	$player_status = isset($data->player_status)? $data->player_status : '';
	// 	$modified = get_now();
	// 	$qw = "UPDATE `indiv` SET `state`='$state',`player_status`='$player_status',`checked`=$modified WHERE `friendly` = '$friendly' and `name` = '$uname'";
	// 	$qr = "SELECT * FROM indiv WHERE `friendly` = '$friendly'"; 
	// 	$res=db_write_read_all($qw,$qr);
	// 	$result->playerdata = $res;
	// 	$result->status = "write_player";
	}else{
		$qr = "SELECT * FROM indiv WHERE `friendly` = '$friendly'"; 
		$playerdata = db_read($qr);
		$result->playerdata = $playerdata;
	}
	if (isset($data->write_fen)){
		$fen = json_encode($data->fen);
		$modified = get_now();
		$qw = "UPDATE gametable SET `fen`='$fen',`modified`=$modified, `phase`='',`scoring`=NULL WHERE `friendly` = '$friendly'"; //ok
		$qr="SELECT * FROM gametable WHERE `friendly` = '$friendly' limit 1";
		$res=db_write_read($qw,$qr);
		$result->table = $res;
		$result->status .= " write_fen";
	}else{
		$qr="SELECT * FROM gametable WHERE `friendly` = '$friendly' limit 1";
		$table = db_read($qr)[0]; 
		$result->table = $table;
	}
}else if ($cmd == "assets") {
	$path = '../base/assets/';
	$c52 = file_get_contents($path . 'c52.yaml');
	$syms = file_get_contents($path . 'allSyms.yaml');
	$symGSG = file_get_contents($path . 'symGSG.yaml');
	$cinno = file_get_contents($path . 'fe/inno.yaml');
	$info = file_get_contents($path . 'lists/info.yaml');
	$sayings = file_get_contents($path . 'games/wise/sayings.yaml');
	$config = file_get_contents(__DIR__ . '/config.yaml');
	$result = (object) ['sayings' => $sayings, 'info' => $info, 'users' => get_users(), 'tables' => get_tables(), 'config' => $config, 'c52' => $c52, 'cinno' => $cinno, 'syms' => $syms, 'symGSG' => $symGSG];
}else if ($cmd == 'users'){ 
  $result->users = get_users();
	$result->status = "reloaded users";
}else if ($cmd == 'tables'){ 
  $result->tables = get_tables();
	$result->status = "reloaded tables";
}else if ($cmd == 'startgame'){ 
	$friendly = $data->friendly;
	$game = $data->game;
	$host = $data->host;
	$players = json_encode($data->players);
	$options = json_encode($data->options);
	$fen = json_encode($data->fen);
	$modified = get_now();
	foreach ($data->players as $player) {
		$q="INSERT INTO `indiv` (`friendly`,`name`) VALUES ('$friendly','$player')";
		$res=db_write($q);
	}
	$qw="INSERT INTO `gametable` (`friendly`,`game`,`host`,`players`,`fen`,`options`,`modified`) VALUES ('$friendly','$game','$host','$players','$fen','$options',$modified)";
	$qr="SELECT * FROM gametable WHERE `friendly` = '$friendly' limit 1";
	$res=db_write_read($qw,$qr);
	$result->table = $res;
	$qr = "SELECT * FROM indiv WHERE `friendly` = '$friendly'"; 
	$playerdata = db_read($qr);
	$result->playerdata = $playerdata;
	$result->status = "started table $friendly"; 
}else if ($cmd == 'gameover'){ 
	$winners = $data->winners;
	$friendly = $data->friendly;
	$fen = json_encode($data->fen);
	$scoring = json_encode($data->scoring);
	$modified = get_now();
	$qw = "UPDATE gametable SET `fen`='$fen',`phase`='over',`scoring`='$scoring',modified=$modified WHERE `friendly` = '$friendly'"; //ok
	$qr="SELECT * FROM gametable WHERE `friendly` = '$friendly' limit 1";
	$res=db_write_read($qw,$qr);
	$result->table = $res;
	$result->status = "scored table $friendly"; 
	$result->tables = get_tables();
}else if ($cmd == 'delete_table'){ 
	$friendly = $data->friendly;
	$q="DELETE FROM `gametable` WHERE `friendly` = '$friendly'";
	$res=db_write($q);
	$q="DELETE FROM `indiv` WHERE `friendly` = '$friendly'";
	$res=db_write($q);
	$result->tables = get_tables();
	$result->status = "tables $friendly deleted"; 
}else if ($cmd == 'delete_tables'){ 
	$q="TRUNCATE table `gametable`";
	$res=db_write($q);
	$q="TRUNCATE table `indiv`";
	$res=db_write($q);
	$result->tables = get_tables();
	$result->status = "all tables deleted"; 
}
echo json_encode($result); 




















