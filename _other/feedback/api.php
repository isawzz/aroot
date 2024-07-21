<?php
require_once "apihelpers.php";

$raw = file_get_contents("php://input");
$o = json_decode($raw);
$data = $o->data;
$cmd = $o->cmd;
$result = (object)[];
if ($cmd == "reset"){
	$result->playerdata = delete_playerdata($data->friendly);
	$result->table = update_fen($data->friendly,$data->fen);
}else if ($cmd == "update_fen"){
	$result->playerdata = read_playerdata('feedback');
	$result->table = update_fen($data->friendly,$data->fen);
	clear_playerdata($data->friendly,$data->newstate);
}else if ($cmd == "update_player"){
	write_playerdata('feedback',$data->uname,$data->state);
	$result->playerdata = read_playerdata('feedback');
	$result->table = read_table('feedback');
}else if ($cmd == "assets") {
	$path = '../base/assets/';
	$syms = file_get_contents($path . 'allSyms.yaml');
	$symGSG = file_get_contents($path . 'symGSG.yaml');
	$config = file_get_contents(__DIR__ . '/config.yaml');
	$result = (object) ['config' => $config, 'syms' => $syms, 'symGSG' => $symGSG];
	$result->table = read_table('feedback');
}else{
	$result->playerdata = read_playerdata('feedback');
	$result->table = read_table('feedback');
}
echo json_encode($result); 




















