<?php
require 'php/config.php';
if(!empty($_SESSION["id"])){
  //exit('login not empty');
  header("Location: index.php");
}
if(isset($_POST["submit"])){
  //exit('login, isset submit');
  $usernameemail = $_POST["usernameemail"];
  $password = $_POST["password"];
  $result = mysqli_query($conn, "SELECT * FROM tb_user WHERE username = '$usernameemail' OR email = '$usernameemail'");
  $row = mysqli_fetch_assoc($result);
  if(mysqli_num_rows($result) > 0){
    if($password == $row['password']){
      //exit('login, isset submit, multiple, correct pwd');
      $_SESSION["login"] = true;
      $_SESSION["id"] = $row["id"];
      header("Location: index.php");
    }else{
      echo "<script> alert('Wrong Password'); </script>";
      //exit('login, isset submit, multiple, WRONG pwd');
    }
  }else{
    echo "<script> alert('User Not Registered'); </script>";
    //exit('login, isset submit, not registered');
  }
}
?>
<!DOCTYPE html>
<html lang="en" dir="ltr">
  <head>
    <meta charset="utf-8">
    <title>Login</title>
  </head>
  <body>
    <h2>Login</h2>
    <form class="" action="" method="post" autocomplete="no">
      <label for="usernameemail">Username or Email : </label>
      <input type="text" name="usernameemail" id="usernameemail" required value=""> <br>
      <label for="password">Password : </label>
      <input type="password" name="password" id="password" required value=""> <br>
      <button type="submit" name="submit">Login</button>
    </form>
    <br>
    <a href="registration.php">Registration</a>
  </body>
</html>
