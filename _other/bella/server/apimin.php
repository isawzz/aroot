<?php
require_once "helpers.php";
session_start();
$DATA_RAW = file_get_contents("php://input");
$o = json_decode($DATA_RAW);
$type = $o->type;
$result = (object) [];
$result->type = $type; 

if ($type == 'games'){ // in:uname out:tables status!=past (including player_status) (most recent first) OK
	$q = "SELECT * FROM players INNER JOIN tables ON tables.id = players.tid WHERE players.name = '$o->req' and tables.status != 'past' order by tables.modified desc";
	$result->tables = db_read($q);
}else if ($type == 'create_table_and_start'){ // returns table and players OK
	$t = $o->req;
	$info = create_table($t);
	$result->table = $info->table;
	$result->players = $info->players;
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
}
echo json_encode($result);

die;
pp($o,'object');
echo 'type ' . $type;
