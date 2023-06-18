<?php
require_once "apihelpers.php";

$raw = file_get_contents("php://input");
$o = json_decode($raw);
$data = $o->data;
$cmd = $o->cmd;
$result = (object)[];
if ($cmd == 'login'){ 
  $usernameemail = $data->name;
  $password = $data->pwd;
  $conn = db_connect(); 
  $res = mysqli_query($conn, "SELECT * FROM tb_user WHERE username = '$usernameemail' OR email = '$usernameemail'");
  $row = mysqli_fetch_assoc($res);
  if(mysqli_num_rows($res) > 0){
    if($password == $row['password']){
      //exit('login, isset submit, multiple, correct pwd');
      $_SESSION["login"] = true;
      $_SESSION["id"] = $row["id"];
      //header("Location: index.php");
      $result->id = $row['id'];
      $result->status = "loggedin";
      $result->user = $row;
    }else{
      //echo "<script> alert('Wrong Password'); </script>";
      $result->id = $row['id'];
      $result->status = "wrong_pwd";
      //exit('login, isset submit, multiple, WRONG pwd');
    }
  }else{
    //echo "<script> alert('User Not Registered'); </script>";
    $result->id = $usernameemail;
    $result->status = "not_registered";
    //exit('login, isset submit, not registered');
  }
}
echo json_encode($result); 


