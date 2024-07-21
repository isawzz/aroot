var verbose = false;
function write() { if (verbose) console.log(...arguments); }

class ControllerSolitaire {

	constructor(g, user) { this.g = g; this.player = user; }
	stopGame() { resetState(); }
	startGame() {

		resetState();
		this.g.successFunc = successPictureGoal;
		this.g.failFunc = failPictureGoal;
		this.g.correctionFunc = showCorrectWord;

		this.g.startGame();
		this.start_level();
	}
	start_level() {
		Settings.updateGameValues(this.player, this.g);

		this.g.start_level();

		this.startAction();
	}
	startAction() {
		resetRound(); //hier passiert clear table!
		uiActivated = false;
		this.g.startAction();
		TOMain = setTimeout(() => this.prompt(), 300);
	}
	prompt() {
		QContextCounter += 1;
		showStats();
		this.g.trialNumber = 0;
		this.g.prompt();
	}
	promptNextTrial() {
		QContextCounter += 1;
		clearTimeout(TOTrial);
		uiActivated = false;
		let delay = this.g.trialPrompt(this.g.trialNumber);
		TOMain = setTimeout(() => this.activateUi(), delay);
	}
	activateUi() {
		Selected = null;
		uiActivated = true;
		this.g.activate();
	}
	evaluate() {
		if (!canAct()) return;
		uiActivated = false; clearTimeouts();

		IsAnswerCorrect = this.g.eval(...arguments);
		if (IsAnswerCorrect === undefined) { this.promptNextTrial(); return; }

		this.g.trialNumber += 1;
		if (!IsAnswerCorrect && this.g.trialNumber < this.g.trials) { this.promptNextTrial(); return; }

		//feedback
		if (IsAnswerCorrect) { DELAY = isdef(Selected.delay) ? Selected.delay : this.g.spokenFeedback ? 1500 : 300; this.g.successFunc(); }
		else { DELAY = this.g.correctionFunc(); this.g.failFunc(); }

		let nextLevel = this.scoring(IsAnswerCorrect);

		if (DELAY > 2000) showActiveMessage('click to continue...', () => this.gotoNext(nextLevel));
		TOMain = setTimeout(() => this.gotoNext(nextLevel), DELAY);
	}
	gotoNext(nextLevel) {
		onclick = null;
		removeMarkers();
		clearTimeouts();

		if (Score.gameChange) {
			setNextGame();
			if (GameTimer.unitTimeUp()) { gameOver('Great job! Time for a break!'); } else { GC.startGame(); }

		} else if (Score.levelChange && nextLevel <= this.g.maxlevel) {
			this.g.level = nextLevel;
			setBadgeLevel(this.g.level);
			this.start_level();
		} else { this.startAction(); }

	}
	scoring(is_correct){
		console.log('scoring reingezogen!')
		return scoring(is_correct);
	}
}
class ControllerTTT {
	constructor(g, user) {
		this.g = g;
		this.createPlayers(user);
		GameCounter = 0;
	}
	write() { write('gc', ...arguments); }
	createPlayers(user) {
		this.write('create players');
		let players = this.players = this.g.players = [];
		let h = this.human = this.g.human = new SoloPlayer(user);
		let a = this.ai = this.g.ai = new AIPlayer();
		players.push(this.human);
		players.push(this.ai);
		this.ai.color = RED;
	}
	startGame() {
		this.write('start game')
		GameCounter += 1;
		resetState();
		this.g.startGame();
		this.startAction();
	}
	startAction() {
		this.write('start round')
		this.deactivateUi();
		this.g.startAction();
		showStats();
		this.prompt();
	}
	prompt() {
		this.write('prompt')
		this.g.prompt();
	}
	uiInteract(ev) { if (canHumanAct()) this.g.interact(ev); }
	activateUi() {
		this.write('activate');
		if (this.g.plTurn == this.g.ai) aiActivated = true; else uiActivated = true;
		this.g.activate();
	}
	deactivateUi() { aiActivated = uiActivated = false; }
	evaluate() {
		this.write('evaluate')
		this.deactivateUi();
		this.g.eval(...arguments);
		//console.log('back from game eval',G.gameOver)
		this.write('gameOver', this.g.gameOver)
		if (this.g.gameOver) {
			//console.log('game over!!!');
			let msg, sp;
			//console.log('winner', this.g.winner)
			if (this.g.winner && this.g.winner == this.ai) { msg = 'AI wins!'; sp = 'A.I. wins!'; this.ai.score += 1; }
			else if (this.g.winner) { msg = sp = 'You win!!!'; this.human.score += 1; }
			else { msg = "It's a tie"; sp = 'tie: no one wins'; if (nundef(this.tie)) this.tie = 1; else this.tie += 1; }

			if (this.g.info) msg += ' ' + this.g.info;

			Score.nTotal += 1;
			Score.nCorrect = Score.nWins = this.human.score;
			Score.nLoses = this.ai.score;
			Score.nTied = this.tie;
			showScore();
			// showInstruction('', msg, dTitle, !this.g.silent, sp);
			show_instruction(msg, dTitle, sp);

			//hier koennte auch banner display! und die buttons kommen auf das banner!
			TOMain = setTimeout(() => {
				//new Banner(this.g.bannerPos).message(['Winner:', capitalize(this.g.winner.id)]);
				if (GameCounter <= 3) this.bPlay = mButton('play again', () => { resetRound(); this.startGame(); }, dTable, { fz: 28, margin: 20, rounding: 10, vpadding: 6, hpadding: 12, border: 8 }, ['buttonClass']);
				this.bPlay = mButton('next game', () => { setNextGame(); GC.startGame(); }, dTable, { fz: 28, margin: 20, rounding: 10, vpadding: 6, hpadding: 12, border: 8 }, ['buttonClass']);
			}, 1500);

			// this.bTest = mButton('test', () => { unitTest00(); }, dTable, { fz: 28, matop: 20, rounding: 10, vpadding: 6, hpadding: 12, border: 8 }, ['buttonClass']);
		} else {

			this.g.changePlayer();
			this.startAction();
			//TOMain=setTimeout(()=>this.startAction(),1500);
		}
	}
}
class ControllerMinimal {
	constructor(g, user) {
		//console.log('HAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA')
		this.g = g;
		this.user = user;
		GameCounter = 0;
	}
	write() { write('gc', ...arguments); }
	startGame(fen) {
		this.write(`__________ start ${this.g.name} game`);
		GameCounter += 1;
		resetState();
		this.g.startGame(fen);
	}
	startAction(){}
	prompt(){}
	uiInteract(){}
	activateUi(){}
	deactivateUi(){}
	evaluate() {
		this.write('evaluate');
		return;
	}
}
class ControllerChess extends ControllerMinimal{
	constructor(g,user){super(g,user);}
	evaluate() {
		super.evaluate();
		this.write('____________GameController\n', GameController);
	}
}
class ControllerC52 extends ControllerMinimal {
	constructor(g, user) { super(g, user); }
}

class ControllerSolitaireMinimal extends ControllerSolitaire {
	clear() { if (isdef(this.timer)) this.timer.clear(); }
	start_level() {
		let g = this.g;
		Settings.updateGameValues(this.player, g);

		g.start_level();

		// if (isdef(g.onTimeup)) {
		// 	if (isdef(this.timer)) this.timer.clear();
		// 	this.timer = new CTimer(dScore, 500, null, valf(g.msTotal, 3000), g.onTimeup.bind(g));
		// }

		//hier muss ich das language setting am bildschirm anzeigen!
		update_language_choices(g);
		this.startAction();
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
		//if (isdef(this.timer)) this.timer.start(); //else { console.log('no timer exists!!!!'); }
		this.g.activate();
	}
	gotoNext(nextLevel) {
		onclick = null;
		removeMarkers();
		clearTimeouts();
		if (isdef(this.timer)) this.timer.clear();

		if (Score.levelChange && nextLevel <= this.g.maxlevel) {
			this.g.level = nextLevel;
			setBadgeLevel(this.g.level);
			this.start_level();
		} else {

			this.startAction();
		}

	}
}


class ControllerTraining extends ControllerSolitaire{}
class ControllerSolo extends ControllerSolitaire{}


class ControllerMulti0 {

	constructor(g, user) { this.g = g; this.player = user; }
	startGame(fen) {
		console.log('controller starts...')
		resetState();
		this.g.successFunc = successPictureGoal;
		this.g.failFunc = failPictureGoal;
		this.g.correctionFunc = showCorrectWord;

		this.g.startGame(fen);
		this.startPhase();
	}
	startPhase(){this.startRound();}
	startRound(){
		//determine player order for this round!

	}
	start_level() {
		Settings.updateGameValues(this.player, this.g);

		this.g.start_level();

		this.startAction();
	}
	startAction() {
		resetRound(); //hier passiert clear table!
		uiActivated = false;
		this.g.startAction();
		TOMain = setTimeout(() => this.prompt(), 300);
	}
	prompt() {
		QContextCounter += 1;
		showStats();
		this.g.trialNumber = 0;
		this.g.prompt();
	}
	promptNextTrial() {
		QContextCounter += 1;
		clearTimeout(TOTrial);
		uiActivated = false;
		let delay = this.g.trialPrompt(this.g.trialNumber);
		TOMain = setTimeout(() => this.activateUi(), delay);
	}
	activateUi() {
		Selected = null;
		uiActivated = true;
		this.g.activate();
	}
	evaluate() {
		if (!canAct()) return;
		uiActivated = false; clearTimeouts();

		IsAnswerCorrect = this.g.eval(...arguments);
		if (IsAnswerCorrect === undefined) { this.promptNextTrial(); return; }

		this.g.trialNumber += 1;
		if (!IsAnswerCorrect && this.g.trialNumber < this.g.trials) { this.promptNextTrial(); return; }

		//feedback
		if (IsAnswerCorrect) { DELAY = isdef(Selected.delay) ? Selected.delay : this.g.spokenFeedback ? 1500 : 300; this.g.successFunc(); }
		else { DELAY = this.g.correctionFunc(); this.g.failFunc(); }

		let nextLevel = this.scoring(IsAnswerCorrect);

		if (DELAY > 2000) showActiveMessage('click to continue...', () => this.gotoNext(nextLevel));
		TOMain = setTimeout(() => this.gotoNext(nextLevel), DELAY);
	}
	gotoNext(nextLevel) {
		onclick = null;
		removeMarkers();
		clearTimeouts();

		if (Score.gameChange) {
			setNextGame();
			if (GameTimer.unitTimeUp()) { gameOver('Great job! Time for a break!'); } else { GC.startGame(); }

		} else if (Score.levelChange && nextLevel <= this.g.maxlevel) {
			this.g.level = nextLevel;
			setBadgeLevel(this.g.level);
			this.start_level();
		} else { this.startAction(); }

	}
	scoring(is_correct){
		console.log('scoring reingezogen!')
		return scoring(is_correct);
	}
}

class ControllerMulti {

	constructor(g, user) { this.g = g; this.player = user; }
	startGame(fen) {
		console.log('controller starts...');
		Score = {};
		this.startPhase();
	}
	startPhase(){this.startRound();}
	startRound(){
		//determine player order for this round!
		this.players = [
			{name:'leo',i:0},
			{name:'felix',i:1},
			{name:'amanda',i:2},
		];
		this.pl_order = [0,1,2];
		this.turn=0;
		if (isdef(this.g.startTurn)) this.g.startTurn();
		this.startTurn();
	}
	startTurn(){
		//1. muss hier eine fen pos machen!
		Session.gfen = this.g.fen();
		Session.pfen = `${this.pl_order.join()} ${this.turn} ${this.players.map(x=>x.name).join(',')}`;
		//2. 
		this.player = this.players
	}
	start_level() {
		Settings.updateGameValues(this.player, this.g);

		this.g.start_level();

		this.startAction();
	}
	startAction() {
		resetRound(); //hier passiert clear table!
		uiActivated = false;
		this.g.startAction();
		TOMain = setTimeout(() => this.prompt(), 300);
	}
	prompt() {
		QContextCounter += 1;
		showStats();
		this.g.trialNumber = 0;
		this.g.prompt();
	}
	promptNextTrial() {
		QContextCounter += 1;
		clearTimeout(TOTrial);
		uiActivated = false;
		let delay = this.g.trialPrompt(this.g.trialNumber);
		TOMain = setTimeout(() => this.activateUi(), delay);
	}
	activateUi() {
		Selected = null;
		uiActivated = true;
		this.g.activate();
	}
	evaluate() {
		if (!canAct()) return;
		uiActivated = false; clearTimeouts();

		IsAnswerCorrect = this.g.eval(...arguments);
		if (IsAnswerCorrect === undefined) { this.promptNextTrial(); return; }

		this.g.trialNumber += 1;
		if (!IsAnswerCorrect && this.g.trialNumber < this.g.trials) { this.promptNextTrial(); return; }

		//feedback
		if (IsAnswerCorrect) { DELAY = isdef(Selected.delay) ? Selected.delay : this.g.spokenFeedback ? 1500 : 300; this.g.successFunc(); }
		else { DELAY = this.g.correctionFunc(); this.g.failFunc(); }

		let nextLevel = this.scoring(IsAnswerCorrect);

		if (DELAY > 2000) showActiveMessage('click to continue...', () => this.gotoNext(nextLevel));
		TOMain = setTimeout(() => this.gotoNext(nextLevel), DELAY);
	}
	gotoNext(nextLevel) {
		onclick = null;
		removeMarkers();
		clearTimeouts();

		if (Score.gameChange) {
			setNextGame();
			if (GameTimer.unitTimeUp()) { gameOver('Great job! Time for a break!'); } else { GC.startGame(); }

		} else if (Score.levelChange && nextLevel <= this.g.maxlevel) {
			this.g.level = nextLevel;
			setBadgeLevel(this.g.level);
			this.start_level();
		} else { this.startAction(); }

	}
	scoring(is_correct){
		console.log('scoring reingezogen!')
		return scoring(is_correct);
	}
}
















