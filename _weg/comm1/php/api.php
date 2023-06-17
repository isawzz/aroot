<?php
require_once "apihelpers.php";
session_start();
$conn = db_connect(); //mysqli_connect("localhost", "root", "", "reglog");
if(!empty($_SESSION["id"])){
  $id = $_SESSION["id"];
  $result = mysqli_query($conn, "SELECT * FROM tb_user WHERE id = $id");
  $row = mysqli_fetch_assoc($result);
}
else{
  header("Location: login.php");
}

// $raw = file_get_contents("php://input");
// $o = json_decode($raw);
// $data = $o->data;
// $cmd = $o->cmd;
// $result = (object)[];
