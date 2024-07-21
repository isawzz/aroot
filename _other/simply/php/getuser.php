<?php
include 'helpers.php';
session_start();
if (isset($_SESSION['username'])) {
  $username = $_SESSION['username'];
} elseif (isset($_COOKIE['user'])) {
  $username = $_COOKIE['user'];
} else {
  $username = 'guest';
}

$userdata = db_get_userdata($username);
echo json_encode($userdata);
?>
