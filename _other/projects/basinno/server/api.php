<?php
require_once "helpers.php";
session_start();
$DATA_RAW = file_get_contents("php://input");
$DATA_OBJ = json_decode($DATA_RAW);

//establish $username
if (isset($DATA_OBJ->find) && isset($DATA_OBJ->find->user)) {
  $nvuname = $DATA_OBJ->find->user;
  //echo "got a username $username";die;
} elseif (!isset($_SESSION['username'])) {
  if (isset($_COOKIE['username'])) {
    $nvuname = $_COOKIE['username'];
  } else {
    $nvuname = 'felix';
  }
} else {
  $nvuname = $_SESSION['username'];
}

//validate $username: max 30 characters, cannot contains '\\' or '/', NOT case sensitive!
$username = validatedUsername($nvuname); //returns 'guest' or a valid username in lower case
//echo "nvuser=$nvuname, validated username=$username";die;

//set session and cookie
$_SESSION['username'] = $username;
if ($username != 'guest') {setcookie('username', $username, time() + 8000000);}
$_SESSION['userdata'] = db_get_userdata($_SESSION['username']);

//set variables
$Username = $_SESSION['username'];
$Userdata = (object)$_SESSION['userdata'];
$info = (object) [];
$Error = "";

//proccess the data
if (isset($DATA_OBJ->data_type) && $DATA_OBJ->data_type == "user_info") {
  //$user = $DATA_OBJ->find->user;
  $info = (object)load_assets();
  $info->message = $Userdata;
  $info->name = $nvuname;
  $info->data_type = 'user_info';
  echo json_encode($info); 
} 