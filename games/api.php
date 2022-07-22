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
	$notes = $table['notes'];
	$result->status = "reloaded table $friendly";

	//collecting individual data
	if (isset($data->write_fen) && isset($data->state)){
		$uname = $data->uname;
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

		//if $notes ends with 'all', then check if all players have non-empty state
		$done = true;
		if (str_ends_with($notes, 'all')){
			foreach ($res as $player){
				if ($player['state'] == ''){
					$done = false;
					break;
				}
			}
		}else if (str_ends_with($notes, 'first')){
			$done = true;
		}else $done = false;
		$result->collect_complete = $done;
		if ($done) {
			$data->fen->turn = array($data->fen->acting_host); //array($table['host']);
			$fen = json_encode($data->fen);
			$qw = "UPDATE `gametable` SET `notes`='lock',`modified`=$modified,`fen`='$fen' WHERE `friendly` = '$friendly'";
			$res=db_write($qw);
		}
		$result->status = "player $uname updated!"; 
	} else if ($notes == 'lock') {
		$result->collect_complete = true;
		$result->too_late = true;
		$qr = "SELECT * FROM indiv WHERE `friendly` = '$friendly'";
		$result->playerdata=db_read($qr);
		$result->status = "table already locked - collect complete!";
	} 

	if (isset($data->write_notes)) {$notes = $data->write_notes;}
	if (isset($data->write_fen)){
		//echo "HALLO";
		$fen = json_encode($data->fen);
		$modified = get_now();
		// $qw = "UPDATE gametable SET `fen`='$fen',modified=$modified,`notes`='indiv' WHERE `friendly` = '$friendly'"; //ok
		$qw = "UPDATE gametable SET `fen`='$fen',modified=$modified,`notes`='$notes' WHERE `friendly` = '$friendly'"; //ok
		$qr="SELECT * FROM gametable WHERE `friendly` = '$friendly' limit 1";
		$res=db_write_read($qw,$qr);
		$result->table = $res;
		// $qw="INSERT INTO `gametable` (`friendly`,`game`,`host`,`players`,`fen`,`options`,`modified`) VALUES ('$friendly','$game','$host','$players','$fen','$options',$modified)";
		// $qr="SELECT * FROM gametable WHERE `friendly` = '$friendly' limit 1";
		// $res=db_write_read($qw,$qr);
		// $qw = "UPDATE gametable SET `fen`='$fen','modified'=$modified WHERE `friendly` = '$friendly'"; //ok
		// $res=db_write($qw);
	} else {
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
	$endcond = $data->fen->endcond; // first | all | last | N
	$notes = "indiv_".$endcond;
	$fen = json_encode($data->fen);
	$modified = get_now();
	$qw = "UPDATE gametable SET `fen`='$fen',modified=$modified,`notes`='$notes' WHERE `friendly` = '$friendly'"; //ok
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




















