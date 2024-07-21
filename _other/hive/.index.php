<!DOCTYPE html>
<html lang="en">

<head>
	<meta charset="UTF-8" />

	<link rel="icon" href="https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/apple/285/honeybee_1f41d.png" />
	<title>Hive!</title>

	<!-- #region base -->
	<script src="../base/alibs/numbers.js"></script>
	<script src="../base/alibs/math.js"></script>
	<script src="../base/alibs/jsyaml.js"></script>
	<script src="../base/alibs/jquery-3.6.0.min.js"></script>
	<link rel="stylesheet" href="../base/alibs/chessBoard/css/chessboard.min.css" />
	<script src="../base/alibs/chessBoard/js/chessboard.min.js"></script>
	<script src="../base/alibs/chess.js"></script>
	<script src="../base/alibs/cyto.js"></script>
	<script src="../base/alibs/cola.min.js"></script>
	<script src="../base/alibs/cytoscape-cola.js"></script>
	<script src="../base/alibs/euler.js"></script>
	<script src="../base/alibs/fcose/layout-base.js"></script>
	<script src="../base/alibs/fcose/cose-base.js"></script>
	<script src="../base/alibs/fcose/fcose.js"></script>
	<script src="../base/alibs/klay.js"></script>
	<script src="../base/alibs/cytoscape-klay.js"></script>
	<script src="../base/alibs/cytonode.js"></script>

	<link rel="stylesheet" href="../base/assets/fonts/fonts.css" />
	<link rel="stylesheet" href="../base/base.css" />
	<script src="../base/globals.js"></script>
	<script src="../base/base.js"></script>

	<script src="../base/features/areas.js"></script>
	<script src="../base/features/audio.js"></script>
	<script src="../base/features/badges.js"></script>
	<script src="../base/features/banner.js"></script>
	<script src="../base/features/board.js"></script>
	<script src="../base/features/markers.js"></script>
	<script src="../base/features/menu.js"></script>
	<script src="../base/features/mGraph.js"></script>
	<script src="../base/features/speech.js"></script>
	<script src="../base/features/settings.js"></script>
	<script src="../base/features/time.js"></script>

	<!-- classes  must be loaded first leider -->
	<script src="../base/js/maze.js"></script>
	<script src="../base/js/ai.js"></script>
	<script src="../base/js/all.js"></script>
	<script src="../base/js/cardGame.js"></script>
	<script src="../base/js/chessUtils.js"></script>
	<script src="../base/js/classes.js"></script>
	<script src="../base/js/debug.js"></script>
	<script src="../base/js/controller.js"></script>
	<script src="../base/js/classes3.js"></script>
	<script src="../base/js/controller3.js"></script>
	<script src="../base/js/game.js"></script>
	<script src="../base/js/house.js"></script>
	<script src="../base/js/item.js"></script>
	<script src="../base/js/keys.js"></script>
	<script src="../base/js/legacy.js"></script>
	<script src="../base/js/letter.js"></script>
	<script src="../base/js/math.js"></script>
	<script src="../base/js/onClick.js"></script>
	<script src="../base/js/scoring.js"></script>
	<script src="../base/js/testing.js"></script>
	<script src="../base/js/ui.js"></script>
	<script src="../base/js/user.js"></script>
	<script src="../base/js/work.js"></script>
	<script src="../base/js/workUI.js"></script>
	<!-- #endregion base -->

	<link rel="stylesheet" href="./style.css" />
	<!-- <script src="./work.js"></script> -->
	<script src="./start.js"></script>
</head>

<body>
	<div id="dMain"></div>
	<div id="md" style="display: none">
		<div id="sidebar" style="align-self: stretch"></div>
		<div id="rightSide">
			<div id="table" class="flexWrap"></div>
		</div>
	</div>
	<!-- #region comment -->
	<?php $UseLiveServer = true; if(!$UseLiveServer) include('php/loadassets.php'); ?>
	<script type="text/javascript">
	USELIVESERVER = true;
	window.onload = loadassets;
	async function loadassets() {
		if (USELIVESERVER) {
			C52 = await localOrRoute('C52', '../base/assets/c52.yaml');
			symbolDict = Syms = await localOrRoute('syms', '../base/assets/allSyms.yaml');
			SymKeys = Object.keys(Syms);
			ByGroupSubgroup = await localOrRoute('gsg', '../base/assets/symGSG.yaml');
		}
		start();
	}
	var dMain = document.getElementById('dMain');
	var dTable = document.getElementById('table');
	</script>
	<!-- #endregion comment -->
</body>

</html>