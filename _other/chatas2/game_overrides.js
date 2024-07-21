class ControllerSolitaireMinimal extends ControllerSolitaire {

	startLevel() {
		Settings.updateGameValues(this.player, this.g);
		this.g.start_Level();

		if (isdef(this.timer)) this.timer.clear();
		this.timer = new CTimer(dScore,500,null,valf(this.g.msTotal,30000),this.evaluate.bind(this));

		this.startRound();
	}


	prompt() {
		QContextCounter += 1;
		showStats(this.timer.elem.innerHTML);
		this.g.trialNumber = 0;
		this.g.prompt();
	}
	activateUi() {
		Selected = null;
		uiActivated = true;
		this.timer.start();
		this.g.activate();
	}

	gotoNext(nextLevel) {
		onclick = null;
		removeMarkers();
		clearTimeouts();

		if (Score.levelChange && nextLevel <= this.g.maxLevel) {
			this.g.level = nextLevel;
			setBadgeLevel(this.g.level);
			this.startLevel();
		} else {

			this.startRound();
		}

	}

}