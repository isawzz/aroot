<?php
require_once "php/apihelpers.php";
session_start();

$_SESSION = [];
$_SESSION["EP"] = "php";
//$_SESSION["login"] = true;
//$_SESSION["id"] = 'a';

$conn = db_connect(); //mysqli_connect("localhost", "root", "", "reglog");

//print_r($_SESSION); echo "<br />"; exit('.');//$stuff = array('name' => 'Joe', 'email' => 'joe@example.com');
$x = 'index.html?';
foreach ($_SESSION as $key => $value) {
  $x = $x."$key=$value&";
  echo "$key=$value".'<br />';
}
header("Location: $x");
?>
