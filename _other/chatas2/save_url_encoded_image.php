<?php

session_start();

$image = $_POST["image"];
$image = explode(";", $image)[1];
$image = explode(",", $image)[1];
$image = str_replace(" ", "+", $image);
$image = base64_decode($image);
$filename = $_POST["filename"];
$path = '../base/assets/images/';
file_put_contents($path . $filename, $image);

//brauch ein dbupdate fuer imagePath und hasImage!
//wieso ich speicher es doch nicht in der database????????
if (isset($_SESSION['userdata'])) {
  $_SESSION['userdata']['hasImage'] = true;
  $_SESSION['userdata']['imagePath'] = '../base/assets/images/' . $_SESSION['username'] . '.jpg';
  echo json_encode($_SESSION['userdata']);die;
}

// Sending response back to client
echo "Done $path$filename!";

?>
