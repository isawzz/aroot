<?php
require_once "helpers.php";
session_start();

$info = (object) [];

$destination = "";
if (isset($_FILES['file']) && $_FILES['file']['name'] != "") {

  $allowed[] = "image/jpeg";
  $allowed[] = "image/png";

  if ($_FILES['file']['error'] == 0 && in_array($_FILES['file']['type'], $allowed)) {

    //good to go
    $folder = "uploads/";
    if (!file_exists($folder)) {
      mkdir($folder, 0777, true);
    }

    $destination = $folder . $_FILES['file']['name'];
    move_uploaded_file($_FILES['file']['tmp_name'], $destination);

    $info->message = "Your image was uploaded";
    $info->data_type = $_POST['data_type'];
    echo json_encode($info);

  }
}
if ($info->data_type == "send_image") {

  $sender = $_POST['sender'];
  $receiver = $_POST['receiver'];
  $date = date("Y-m-d H:i:s");
  $file = $destination;

  $q = qInsertFileMessage($sender, $receiver, $file);
  db_write($q);
}
