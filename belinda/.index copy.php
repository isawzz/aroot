<?php $UseLiveServer = true; ?>

<html>
<?php include('html/head.html'); ?>

<body>
	<?php if (!$UseLiveServer): ?>
	<?php include('php/loadassets.php'); ?>
	<?php else: ?>
	<script>
	USELIVESERVER = true;
	</script>
	<?php endif ?>

	<?php include('html/index.html'); ?>

	<form style='display:none;' method="post" name="myform" action="php/savedb.php">
		<textarea id="myarea" name="myarea"></textarea>
	</form>

	<script>
	function dbSaveX() {} //dummy function
	function savedb() {
		let s = jsyaml.dump(DB);
		document.myform.myarea.value = s;
		document.myform.submit();
	}
	</script>

	<script src='start.js'></script>
</body>

</html>