<?php
require_once "apihelpers.php";

$raw = file_get_contents("php://input");
$o = json_decode($raw);
$data = $o->data;
$cmd = $o->cmd;
$result = (object)[];
if ($cmd == 'table'){ 
	$friendly = $data->friendly;
	$qr="SELECT * FROM gametable WHERE `friendly` = '$friendly' limit 1";
	$table = db_read($qr)[0]; 
	$result->status = "reloaded table $friendly";
	if (isset($data->write_player)){
		$uname = $data->uname;
		if ($table['notes'] == 'lock') {
			$result->collect_complete = true;
			$result->too_late = true;
			$qr = "SELECT * FROM indiv WHERE `friendly` = '$friendly'";
			$result->playerdata=db_read($qr);
			$result->status = "table already locked - collect complete!";
		}else {
			$result->too_late = false;
			$result->turn = $data->fen->turn;
			$state = json_encode($data->state);
			$modified = get_now();
			$qw = "UPDATE `indiv` SET `state`='$state',checked=$modified WHERE `friendly` = '$friendly' and `name` = '$uname'";
			$qr = "SELECT * FROM indiv WHERE `friendly` = '$friendly'"; // and `name` = '$uname' limit 1";
			$res=db_write_read($qw,$qr);
			// now check if all players have non-empty state
			$qr = "SELECT * FROM indiv WHERE `friendly` = '$friendly'";
			$res=db_read($qr);
			$result->playerdata = $res;
			$all_checked = true;
			foreach ($res as $player) {
				if ($player['state'] == '') {
					$all_checked = false;
					break;
				}
			}
			$result->collect_complete = $all_checked;
			if ($all_checked) {
				$data->fen->turn = array($data->fen->acting_host); //array($table['host']);
				$fen = json_encode($data->fen);
				$qw = "UPDATE `gametable` SET `notes`='lock',`modified`=$modified,`fen`='$fen' WHERE `friendly` = '$friendly'";
				$res=db_write($qw);
			}
			$result->status = "player $uname updated!"; 
		}
	}
	if (isset($data->write_fen)){
		$fen = json_encode($data->fen);
		$modified = get_now();
		$qw = "UPDATE gametable SET `fen`='$fen',modified=$modified WHERE `friendly` = '$friendly'"; //ok
		$res=db_write($qw);
	}
	$qr="SELECT * FROM gametable WHERE `friendly` = '$friendly' limit 1";
  $table = db_read($qr)[0]; 
  $result->table = $table;

}else if ($cmd == "assets") {
	$path = '../base/assets/';
	$c52 = file_get_contents($path . 'c52.yaml');
	$syms = file_get_contents($path . 'allSyms.yaml');
	$symGSG = file_get_contents($path . 'symGSG.yaml');
	$cinno = file_get_contents($path . 'fe/inno.yaml');
	$info = file_get_contents($path . 'lists/info.yaml');
	$config = file_get_contents(__DIR__ . '/config.yaml');
	$result = (object) ['info' => $info, 'users' => get_users(), 'tables' => get_tables(), 'config' => $config, 'c52' => $c52, 'cinno' => $cinno, 'syms' => $syms, 'symGSG' => $symGSG];



}else if ($cmd == 'users'){ 
  $result->users = get_users();
	$result->status = "reloaded users";
}else if ($cmd == 'tables'){ 
  $result->tables = get_tables();
	$result->status = "reloaded tables";
}else if ($cmd == 'clear'){ 
	$uname = $data->uname;
	$friendly = $data->friendly;
	$result->turn = $data->fen->turn;
	$fen = json_encode($data->fen);
	$modified = get_now();
	$qw = "UPDATE gametable SET `fen`='$fen',modified=$modified,`notes`=NULL WHERE `friendly` = '$friendly'"; //ok
	$qr="SELECT * FROM gametable WHERE `friendly` = '$friendly' limit 1";
	$res=db_write_read($qw,$qr);
	$result->table = $res;
	$result->status = "players updated!"; 
	$result->players = array();
	foreach ($data->players as $player) {
		$result->players[] = $player;
		$q="UPDATE `indiv` SET `state`='' WHERE `friendly` = '$friendly' and `name` = '$player'";
		$res=db_write($q);
	}
}else if ($cmd == 'collect_status'){ 
	$uname = $data->uname;
	$friendly = $data->friendly;
	$qr = "SELECT * FROM indiv WHERE `friendly` = '$friendly'";
	$res=db_read($qr);
	$all_checked = true;
	foreach ($res as $player) {
		if ($player['state'] == '') {
			$all_checked = false;
			break;
		}
	}
	$result->playerstates = $res;
	$result->collect_complete = $all_checked;
	$qr="SELECT * FROM gametable WHERE `friendly` = '$friendly' limit 1";
  $table = db_read($qr)[0]; 
  $result->table = $table;

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
	$result->status = "started table $friendly"; 
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




















