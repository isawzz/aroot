<?php
require 'php/config.php';
$_SESSION = [];
if(!empty($_SESSION["id"])){
  $id = $_SESSION["id"];
  $result = mysqli_query($conn, "SELECT * FROM tb_user WHERE id = $id");
  $row = mysqli_fetch_assoc($result);
  $name = 'name '.$row["name"];
  //exit('index, not empty');
  //include 'index.html';
  header("Location: index.html?name=".$row["name"]);
}else{
  //exit('index, empty');
  header("Location: login.php");
}
?>
