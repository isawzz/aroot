<html>
<?php include('html/head.html'); ?>

<body>
	<?php include('html/index.html'); ?>

	<form style='display:none;' method="post" name="myform" action="php/savedb.php">
		<textarea id="myarea" name="myarea"></textarea>
	</form>

	<?php $UseLiveServer = true; if(!$UseLiveServer) include('php/loadassets.php'); ?>
	<script type="text/javascript">
	USELIVESERVER = true;
	START_IN_MENU = true; //!USELIVESERVER;
	DEFAULTUSERNAME = USELIVESERVER ? 'nil' : 'gul';
	window.onload = loadassets;
	async function loadassets() {
		if (USELIVESERVER) {
			C52 = await localOrRoute('C52', '../base/assets/c52.yaml');
			symbolDict = Syms = await localOrRoute('syms', '../base/assets/allSyms.yaml');
			SymKeys = Object.keys(Syms);
			ByGroupSubgroup = await localOrRoute('gsg', '../base/assets/symGSG.yaml');
			WordP = await route_path_yaml_dict('../base/assets/math/allWP.yaml');
			DB = await route_path_yaml_dict('./DB.yaml');
		}
		start();
	}

	function dbSaveX() {} //dummy function need to be eliminated all calls!
	function savedb() {
		if (USELIVESERVER) {
			console.log('not saving on liveserver!');
			return;
		}
		let s = jsyaml.dump(DB);
		document.myform.myarea.value = s;
		document.myform.submit();
	}
	</script>

	<script src='start.js'></script>
</body>

</html>