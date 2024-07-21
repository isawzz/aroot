class ControllerSolitaireMinimal extends ControllerSolitaire {

	clear() { if (isdef(this.timer)) this.timer.clear(); }

	startLevel() {
		Settings.updateGameValues(this.player, this.g);
		this.g.start_Level();

		// if (isdef(this.g.onTimeup)) {
		// 	if (isdef(this.timer)) this.timer.clear();
		// 	this.timer = new CTimer(dScore, 500, null, valf(this.g.msTotal, 3000), this.g.onTimeup.bind(this.g));
		// }

		this.startRound();
	}


	prompt() {
		QContextCounter += 1;
		showStats(false); //nundef(this.timer));
		this.g.trialNumber = 0;
		this.g.prompt();
	}
	activateUi() {
		Selected = null;
		uiActivated = true;
		if (isdef(this.timer)) this.timer.start(); //else { console.log('no timer exists!!!!'); }
		this.g.activate();
	}

	gotoNext(nextLevel) {
		onclick = null;
		removeMarkers();
		clearTimeouts();
		if (isdef(this.timer)) this.timer.clear();

		if (Score.levelChange && nextLevel <= this.g.maxLevel) {
			this.g.level = nextLevel;
			setBadgeLevel(this.g.level);
			this.startLevel();
		} else {

			this.startRound();
		}

	}

}