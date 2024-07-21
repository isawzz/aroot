<?php

function cors() {

	// Allow from any origin
	if (isset($_SERVER['HTTP_ORIGIN'])) {
			echo "haaaaaaaaaaaaaaaaaaaaaallllllllllllllloooooooooo " . $_SERVER['HTTP_ORIGIN'] ;
			// Decide if the origin in $_SERVER['HTTP_ORIGIN'] is one
			// you want to allow, and if so:
			header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
			header('Access-Control-Allow-Credentials: true');
			header('Access-Control-Max-Age: 86400');    // cache for 1 day
	}

	// Access-Control headers are received during OPTIONS requests
	if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {

			if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
					// may also be using PUT, PATCH, HEAD etc
					header("Access-Control-Allow-Methods: GET, POST, OPTIONS");         

			if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
					header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");

			exit(0);
	}

	echo "You have CORS!";
	echo '<br>POST:<br>';
	print_r($_POST);
	echo '<br>SERVER:<br>';
	print_r($_SERVER);
	echo '<br>REQUEST:<br>';
	print_r($_REQUEST);
	echo '<br>GET:<br>';
	print_r($_GET);
	echo '<br>SESSION:<br>';
	print_r($_SESSION);
	

}

if (isset($_REQUEST['data_type'])){
	cors();
	$output = $_REQUEST['n1'] . " has reached server!!!";
	echo 'GOT IT! '. $output;
}else{	
	print_r($_REQUEST);
	echo 'did not get any request!'; 
}

?>