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
  echo json_encode($info); //['req' => $DATA_OBJ, 'data_type' => 'user_info', 'message' => $Userdata, 'name' => $nvuname]);
} elseif (isset($DATA_OBJ->data_type) && $DATA_OBJ->data_type == "contacts") {
  $mydata = uiGetContactStylesAndStart();
  $msgs = checkForNewMessagesToMe($Username);
  $myusers = sortContactsByMostRecentFirst($Username);
  $_SESSION['sortedContacts'] = $myusers; //array_keys($myusers);
  $mydata .= uiGetContacts($myusers, $msgs);
  $info->nvuname = $nvuname;
  $info->message = $mydata;
  $info->myusers = $myusers;
  $info->msgs = $msgs;
  $info->data_type = "contacts";
  echo json_encode($info);

} elseif (isset($DATA_OBJ->data_type) && $DATA_OBJ->data_type == "chats") {
  $chatUsername = extractUsername($DATA_OBJ->find);
  if ($chatUsername == '') {
    if (!isset($_SESSION['sortedContacts'])) {
      $myusers = sortContactsByMostRecentFirst($Username);
    }

    $chatUsername = $_SESSION['sortedContacts'][0]->username;
  }
  $other = (object)db_get_userdata($chatUsername);
  $me = (object)$Userdata;
  $messages = db_get_messages_for($me, $other);
  echo json_encode(['messages' => $messages, 'me' => $me, 'other' => $other, 'data_type' => 'chats']); //, 'arrMessages' => $result2, 'messages' => $messages, 'mydata' => $mydata]); //die;//, 'result' => $result2, 'row' => $row, 'q' => $sql]);die;
} elseif (isset($DATA_OBJ->data_type) && $DATA_OBJ->data_type == "send_message") {
  //send message
  $me = (object)$Userdata; //db_get_userdata($username);
  $message = $DATA_OBJ->find->message;
  $receiver = $DATA_OBJ->find->username;
	//echo 'receiver ' . $receiver;
	//die;
  $q = qInsertTextMessage($Username, $receiver, $message);
  $result = db_write($q);
  echo json_encode(['data_type' => 'send_message', 'message' => $message . ' SENT!!!', 'result' => $result]);
} elseif (isset($DATA_OBJ->data_type) && $DATA_OBJ->data_type == "account") {
  echo json_encode(['data_type' => 'account', 'message' => $Userdata]);
} elseif (isset($DATA_OBJ->data_type) && $DATA_OBJ->data_type == "assets") {

  $info = (object)load_assets();
  $info->data_type = 'assets';
  echo json_encode($info);

} elseif (isset($DATA_OBJ->data_type) && $DATA_OBJ->data_type == "games") {

  $assets_needed = $DATA_OBJ->find->assets;
  if ($assets_needed) {$info = (object)load_assets();}
  $info->data_type = 'games';
  echo json_encode($info);

} elseif (isset($DATA_OBJ->data_type) && $DATA_OBJ->data_type == "play") {

  $assets_needed = $DATA_OBJ->find->assets;
  if ($assets_needed) {$info = (object)load_assets();}
  $info->data_type = 'play';
  echo json_encode($info);

} elseif (isset($DATA_OBJ->data_type) && $DATA_OBJ->data_type == "dbsave") {
  rename(__DIR__ . '/../DB.yaml', __DIR__ . '/../DB_old.yaml');
  file_put_contents(__DIR__ . '/../DB.yaml', $DATA_OBJ->find->db);
  echo json_encode(['request' => 'hallo', 'data_type' => 'dbsave']);
//********************************* ??? NUR BIS HIER VERWENDET ??? ********************** */
} elseif (false && isset($DATA_OBJ->data_type) && $DATA_OBJ->data_type == "save_settings") {
  $newUsername = validatedUsername($DATA_OBJ->find->username);
  $result = db_get_userdata($newUsername);
  $Username = $_SESSION['username'] = $newUsername;
  if ($username != 'guest') {setcookie('username', $newUsername, time() + 8000000);}
  $Userdata = $_SESSION['userdata'] = $result;
  echo json_encode(['data_type' => 'save_settings', 'message' => $result, 'date' => date('Y-M-d H:i:s')]);
} elseif (false && isset($DATA_OBJ->data_type) && $DATA_OBJ->data_type == "settings") {
  //user info
  include "includes/settings.php";
} elseif (false && isset($DATA_OBJ->data_type) && $DATA_OBJ->data_type == "delete_message") {
  //send message
  include "includes/delete_message.php";
} elseif (false && isset($DATA_OBJ->data_type) && $DATA_OBJ->data_type == "delete_thread") {
  //send message
  include "includes/delete_thread.php";
} elseif (false && isset($DATA_OBJ->data_type) && $DATA_OBJ->data_type == "test") {
  $data = [];
  $data['username'] = 'felix';
  $query = "select * from users where username = :username limit 1";
  $result = $DB->read($query, $data);

  if (is_array($result)) {
    echo json_encode($result);
  } else {
    echo json_encode($DATA_OBJ);
  }
  die;
}
