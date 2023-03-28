<?php
// require_once "apihelpers.php";

$raw = file_get_contents("php://input");
$o = json_decode($raw);
$result = (object)[];
$path = '../coding/cb2/';
$all = file_get_contents($path . 'z_all.yaml');
$allcode = file_get_contents($path . 'z_allcode.yaml');
$allhistory = file_get_contents($path . 'z_allhistory.yaml');
$result = (object) ['all' => $all, 'allcode' => $allcode, 'allhistory' => $allhistory];
echo json_encode($result); 




















