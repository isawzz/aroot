<?php
$image = $_POST["image"];
$image = explode(";", $image)[1];
$image = explode(",", $image)[1];
$image = str_replace(" ", "+", $image);
$image = base64_decode($image);
$filename = $_POST["filename"];
$path = '../../base/assets/images/';
file_put_contents($path . $filename, $image);

// Sending response back to client
echo "Done $path$filename!";

?>
