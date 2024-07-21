<?php
function eLine($s) {echo $s . '<br>';}
function pp($obj, $title = "hallo") {
  if (isset($title)) {
    echo "<br>$title:";
  }

  echo "<pre>";
  print_r((array)$obj);
  echo "</pre>";
}
function isLocalhost() {return ($_SERVER['SERVER_NAME'] == "localhost");}
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
function db_get_userdata($username) {
  $con = db_connect();
  $q = "SELECT * FROM users WHERE username = '$username'";
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
  $userdata['hasImage'] = file_exists(__DIR__ . "/../../base/assets/images/" . $username . '.jpg');
  return $userdata;
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
function generateId($max = 20) {
  $rand = '';
  $rand_count = rand(8, $max);
  for ($i = 0; $i < $rand_count; $i++) {
    $rand .= rand(0, 9);
  }
  return $rand;
}
function completeUserdata($username, $userdata) {
  if (!array_key_exists('userid', $userdata)) {$userdata['userid'] = generateId();}
  if (!array_key_exists('username', $userdata)) {$userdata['username'] = $username;}
  if (!array_key_exists('email', $userdata)) {$userdata['email'] = "$username@email.com";}
  if (!array_key_exists('password', $userdata)) {$userdata['password'] = "";}
  if (!array_key_exists('date', $userdata)) {$userdata['date'] = date('Y-M-d H:i:s');}
  $userdata['image'] = $username . 'jpg';
  return $userdata;
}
function qInsertUserdataComplete($username, $userdata) {
  $u = (object)$userdata;
  $q = "INSERT INTO `users` (`userid`, `username`, `email`, `password`, `date`, `image`) VALUES
  ($u->userid, '$u->username', '$u->email', '$u->password', '$u->date', '$u->image')";
  //eLine($q);
  return $q;
}
function qInsertTextMessage($from, $to, $text) {
  $date = date('Y-M-d H:i:s');
  $q = "INSERT INTO `messages` (`sender`, `receiver`, `message`, `date`, `seen`, `received`, `deleted_sender`, `deleted_receiver`) VALUES
  ('$from', '$to', '$text', '$date', 1,1,0,0)";
  //INSERT INTO `messages` (`sender`, `receiver`, `message`, `date`, `seen`, `received`, `deleted_sender`, `deleted_receiver`) VALUES ('$from', '$to', 'hallo wie gehts?', '2021-09-04 12:00:23', 1,1,0,0);
  //INSERT INTO `messages` (`sender`, `receiver`, `message`, `date`, `seen`, `received`, `deleted_sender`, `deleted_receiver`) VALUES ('$to', '$from', 'gut und dir?', '2021-09-04 12:03:23', 1,1,0,0);
  //eLine($q);
  return $q;
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
//echo show_inserts('users');
//prepareMessages("felix", "lauren");
//echo 'HALLO';
?>
