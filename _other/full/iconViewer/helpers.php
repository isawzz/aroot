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
  $userdata['hasImage'] = file_exists(__DIR__ . "/../base/assets/images/" . $username . '.jpg');
  $userdata['imagePath'] = "../base/assets/images/" . ($userdata['hasImage'] ? $username : 'unknown_user') . '.jpg';
  return $userdata; // ['q' => $q, 'userdata' => $userdata, 'date' => $userdata['date'], 'result' => $result]; // $userdata;
}
function db_read($q) {
  $con = db_connect();
  $result = mysqli_query($con, $q);
  $rows = [];
  while ($row = $result->fetch_assoc()) {
    $rows[] = $row;
  }
  $con->close();
  return $rows;
}
function db_update($q) {
  $con = db_connect();
  $result = mysqli_query($con, $q);
  return $result;
}
function db_write($q) {
  $con = db_connect();
  $result = mysqli_query($con, $q);
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
  $myusers = db_read($sql); //$DB->read($sql, []);
  $dict = [];
  foreach ($myusers as $u) {
    $o = (object)$u;
    $dict[$o->username] = $o;
    $o->isContact = false;
  }
  return $dict;
}
function isLocalhost() {return ($_SERVER['SERVER_NAME'] == "localhost");}
function isdef($s) {return !nundef($s);}
function load_assets() {
  $path = '../base/assets/';
  $c52 = file_get_contents($path . 'c52.yaml');
  $syms = file_get_contents($path . 'allSyms.yaml');
  $symGSG = file_get_contents($path . 'symGSG.yaml');
  $fens = file_get_contents($path . 'fens.csv');
  $allWP = file_get_contents($path . 'math/allWP.yaml');
  $db = file_get_contents('../base/DB.yaml');
  return ['fens' => $fens, 'c52' => $c52, 'syms' => $syms, 'symGSG' => $symGSG, 'allWP' => $allWP, 'db' => $db];
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
    //echo $cont;
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
	<div style="text-align: center; animation: appear 1s ease">
  ';
  return $mydata;
}
function uiGetContact($row, $msgs) {
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
function uiGetContacts($myusers, $msgs) {
  $mydata = '';
  foreach ($myusers as $r) {
    $row = (object)$r;
    $mydata .= uiGetContact($row, $msgs);
  }
  return $mydata;
}
function uiGetContacts_Worig($myusers, $msgs) {
  $mydata = '';
  foreach ($myusers as $r) {
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
