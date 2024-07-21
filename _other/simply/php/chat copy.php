<?php
include 'helpers.php';

if (isset($_POST['data_type'])) {
  echo 'HAAAAAAAAAAAAAAAAAAAAAALo' . $_POST['data_type'];die;
}

$reply = $_POST;
$reply['message'] = 'HALLO ES IST RICHTIG!';
echo json_encode($reply);
die;

$currentContact = $_POST['currentContact'];

$reply = ['message' => $currentContact];
echo json_encode($reply);

//echo "HALLO, $currentContact!!!";

?>
