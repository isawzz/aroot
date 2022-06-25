<?php

session_start();

$image = $_POST["image"];
$image = explode(";", $image)[1];
$image = explode(",", $image)[1];
$image = str_replace(" ", "+", $image);
$image = base64_decode($image);
$filename = $_POST["filename"];
$path = './weg/';
file_put_contents($path . $filename, $image);

echo "Done $path$filename!";

?>
