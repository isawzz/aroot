<?php
session_start();
include 'helpers.php';

//if (!isset($_POST['data_type']) || !isset($_SESSION['username'])) {die;}
$o = (object) []; //$_POST;
$o->username = $_SESSION['username'];
//if ($o->data_type == 'contacts') {

$q = "select * from users where username != '$o->username' limit 10";
$o->q = $q;
$myusers = db_read($q);

//$o->result = pp($myusers);

$mydata = "<div style='max-height:430px;text-align: center; animation: appear 4s ease'>";
foreach ($myusers as $row) {
  $orow = (object)$row;
  $mydata .= "
      <div class='contact' style='position:relative;' username='$orow->username' onclick='onClickContact(event)'>
        <img src='../base/assets/images/$orow->image'><br>$orow->username";
  $mydata .= "</div>";

}
$mydata .= "</div>";
$o->message = $mydata; //'<h1>HALLO DAS IST DOCH OK</h1>';
echo json_encode((array)$o);
//}

?>
