<?php
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
function db_read($q) {
  $con = db_connect();
  $result = mysqli_query($con, $q);
  $rows = [];
	if ($result == false){
		return $rows;
	}
  $rows = [];
  while ($row = $result->fetch_assoc()) {
    $rows[] = $row;
  }
  $con->close();
  return $rows;
}
function db_write_close($q) {
  $con = db_connect();
	$res = mysqli_query($con, $q);
	$id = mysqli_insert_id($con);
  $con->close();
	return $id;
}	
function db_write($q) {
  $con = db_connect();
	$res = mysqli_query($con, $q);
	$id = mysqli_insert_id($con);
	return $id;
}	
function db_write_read($qw,$qr){
	db_write($qw);
	$res = db_read($qr)[0];
	return $res;
}
function db_write_read_all($qw,$qr){
	db_write($qw);
	$res = db_read($qr);
	return $res;
}
function get_now(){
	return number_format(microtime(true)*1000,0,'.','');
}
function get_users(){
  $sql = "SELECT * FROM user ORDER BY `name`";
  $users = db_read($sql); 
	return $users;
}
function get_tables(){
  $sql = "SELECT * FROM gametable ORDER BY `modified` DESC";
  $tables = db_read($sql); 
	return $tables;
}
function pp($obj, $title = "hallo") {
  if (isset($title)) {
    echo "<br>$title:";
  }

  #echo "<pre>";
  print_r($obj);
  #cho "</pre>";
}

function clear_playerdata($friendly,$newstate){
	$newstate = json_encode($newstate);
	$modified = get_now();
	$qw = "UPDATE `indiv` SET `state`='',`player_status`=NULL,`checked`=$modified WHERE `friendly` = '$friendly'";
	$qr = "SELECT * FROM indiv WHERE `friendly` = '$friendly'"; 
	$res=db_write_read_all($qw,$qr);
	return $res;
}
function delete_playerdata($friendly){
	$q="DELETE FROM `indiv` WHERE `friendly` = '$friendly'";
	$res=db_write($q);
	return [];	
}
function update_fen($friendly,$fen){
	$fen = json_encode($fen);
	$modified = get_now();
	$qw = "UPDATE gametable SET `fen`='$fen',`modified`=$modified, `phase`='',`scoring`=NULL WHERE `friendly` = '$friendly'"; //ok
	$qr="SELECT * FROM gametable WHERE `friendly` = '$friendly' limit 1";
	$res=db_write_read($qw,$qr);
	return $res;
}
function read_table($friendly){
	$q="SELECT * FROM gametable WHERE `friendly` = '$friendly' limit 1";
	$res=db_read($q)[0];
	return $res;
}
function read_playerdata($friendly){
	$q="SELECT * FROM indiv WHERE `friendly` = '$friendly'";
	$res=db_read($q);
	return $res;
}
function write_playerdata($friendly,$uname,$state){
	$state = json_encode($state);
	$q="SELECT * FROM indiv WHERE `friendly` = '$friendly' and `name` = '$uname'";
	$res=db_read($q);
	if(count($res)==0){
		$q="INSERT INTO indiv (`friendly`,`name`,`state`) VALUES ('$friendly','$uname','$state')";
	}else{
		$q="UPDATE indiv SET `state`='$state' WHERE `friendly` = '$friendly' and `name` = '$uname'";
	}
	$res=db_write($q);

	return $res;
}

















