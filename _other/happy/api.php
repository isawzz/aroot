<?php
require_once "apihelpers.php";

$raw = file_get_contents("php://input");
$o = json_decode($raw);
$cmd = $o->cmd;
$data = $o->data;
$result = (object)[];
if ($cmd == "assets") {
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
}else if ($cmd == 'table'){ 
	$friendly = $data->friendly;
	$qr="SELECT * FROM gametable WHERE `friendly` = '$friendly' limit 1";
  $table = db_read($qr)[0]; 
  $result->table = $table;
	$result->status = "reloaded table $friendly";
}else if ($cmd == 'move'){ 
	$uname = $data->uname;
	$friendly = $data->friendly;
	$action = $data->action;
	$astage = $action->stage;
	$astep = $action->step;
	//print_r($action->stage);
	//print_r($action->step);

	//get this table's state!
	$qr="SELECT * FROM gametable WHERE `friendly` = '$friendly' limit 1";
  $table = db_read($qr)[0]; 
	$exp = json_decode($table['expected']);
	//$exp = (object)$exp;
	//$exp = $exp->$uname;
	//$expstep= $exp
	//print_r($exp); 
	$exp1 = $exp->$uname;
	$estep = $exp1->step;
	$estage = $exp1->stage;
	//print_r($estep); 
	//print_r($estage); 

	if ($astep == $estep && $astage == $estage){
		$fen = json_encode($data->fen);
		$expected = json_encode($data->expected);
		$phase = $data->phase;	
		$round = $data->round;	
		$step = $data->step;	
		$stage = $data->stage;	
		$action = json_encode($action);
		$modified = get_now();
		$qw = "UPDATE gametable SET `fen`='$fen',`expected`='$expected',`phase`='$phase',`round`=$round,`step`=$step,`stage`='$stage',`action`='$action',modified=$modified WHERE `friendly` = '$friendly'"; //ok
		$qr="SELECT * FROM gametable WHERE `friendly` = '$friendly' limit 1";
		$res=db_write_read($qw,$qr);
		$result->table = $res;
		$result->status = "table updated!"; 
	}else{
		$result->table = $table;
		$result->status = "INVALID MOVE!!! expect: $estep $estage but got $astep $astage"; 
	}
}else if ($cmd == 'gameover'){ 
	$winner = $data->winner;
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
}else if ($cmd == 'startgame'){ 
	$friendly = $data->friendly;
	$game = $data->game;
	$host = $data->host;
	$players = json_encode($data->players);
	$options = json_encode($data->options);
	$phase = $data->phase;
	$round = $data->round;
	$step = $data->step;
	$stage = $data->stage;
	$fen = json_encode($data->fen);
	$expected = json_encode($data->expected);
	$modified = get_now();
	$qw="INSERT INTO `gametable` (`friendly`,`game`,`host`,`players`,`phase`,`round`,`step`,`stage`,`fen`,`expected`,`options`,`modified`) 
		VALUES ('$friendly','$game','$host','$players','$phase', $round, $step,'$stage','$fen','$expected','$options',$modified)";
	$qr="SELECT * FROM gametable WHERE `friendly` = '$friendly' limit 1";
	$res=db_write_read($qw,$qr);
	$result->table = $res;
	$result->status = "started table $friendly"; 
}else if ($cmd == 'delete_table'){ 
	$friendly = $data->friendly;
	$q="DELETE FROM `gametable` WHERE `friendly` = '$friendly'";
	$res=db_write($q);
	$result->tables = get_tables();
	$result->status = "tables $friendly deleted"; 
}else if ($cmd == 'delete_tables'){ 
	$q="TRUNCATE table `gametable`";
	$res=db_write($q);
	$result->tables = get_tables();
	$result->status = "all tables deleted"; 
}else if ($cmd == 'delete_past'){ 
	$q="DELETE FROM `gametable` WHERE `phase` = 'over'";
	$res=db_write($q);
	$result->tables = get_tables();
	$result->status = "completed tables deleted"; 
}else if ($cmd == 'delete_table'){ 
	$friendly = $data->friendly;
	$q="DELETE FROM `gametable` WHERE `friendly` = '$friendly'";
	$res=db_write($q);
	$result->tables = get_tables();
	$result->status = "deleted table $friendly"; 
}else if ($cmd == "coassets") {
	$path = '../base/assets/';
	$syms = file_get_contents($path . 'allSyms.yaml');
	$symGSG = file_get_contents($path . 'symGSG.yaml');
	$info = file_get_contents($path . 'lists/info.yaml');
	$config = file_get_contents(__DIR__ . '/config.yaml');
	$result = (object) ['info' => $info, 'users' => get_cousers(), 'contrib' => get_contrib(), 'config' => $config, 'syms' => $syms, 'symGSG' => $symGSG];
}
echo json_encode($result); 




















