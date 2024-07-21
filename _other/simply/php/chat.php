<?php
session_start();
include 'helpers.php';

$o = (object) [];
$o->request = $_REQUEST;

$username = $_SESSION['username'];
$currentContact = $_REQUEST['currentContact'];

$o->userdata = db_get_userdata($currentContact);
$o->messages = db_get_messages($username, $currentContact);

echo json_encode($o);

?>
