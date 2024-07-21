<?php
session_start();
include_once 'php/helpers.php';
if (isset($_GET['user']) && $_GET['user'] != "") {
  $_SESSION['username'] = $_GET['user'];
  //echo 'got user!' . $_SESSION['username'];
} elseif (isset($_GET['user']) && $_GET['user'] == "") {
  $_SESSION['username'] = 'guest';
}

?>
<html>

<head>
	<?php include_once __DIR__ . '/../base/html/mdb.html'; ?>
	<?php include_once __DIR__ . '/../base/html/base.html'; ?>
	<link rel="icon" href="https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/softbank/145/cat-face_1f431.png" />
	<title>chillchat!</title>
	<link rel="stylesheet" href="css/theme.css" />
	<link rel="stylesheet" href="css/messages.css" />
	<script src='../base/alibs/html2canvas.js'></script>
	<script src='../base/features/menu.js'></script>
	<script src='../base/features/syms.js'></script>
</head>

<body>
	<form style='display:none;' method="post" name="myform" action="php/savedb.php">
		<textarea id="myarea" name="myarea"></textarea>
	</form>

	<div id="dMessage"></div>
	<div id="dMain"></div>
	<div id="dLoader"><img src='../base/assets/images/icons/giphy.gif' width=30 /></div>

	<script src='js/onclick.js'></script>
	<script src='js/page.js'></script>
	<script src='js/utils.js'></script>

	<script src='js/account.js'></script>
	<script src='js/chat.js'></script>
	<script src='js/contacts.js'></script>
	<script src='js/games.js'></script>
	<script src='js/getuser.js'></script>
	<script src='js/standard.js'></script>
	<script src='js/tables.js'></script>

	<script src='js/start.js'></script>

	<script>
	window.onload = <?php echo isLocalhost() ? "loadassets" : "start"; ?>;
	</script>
	<?php if (!isLocalhost()) {include 'php/loadassets.php';} ?>
</body>

</html>
