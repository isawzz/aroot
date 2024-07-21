class Game {
	constructor(name, o) {
		this.name = name;
		copyKeys(o, this);
		this.maxLevel = isdef(this.levels) ? Object.keys(this.levels).length - 1 : 0;
		this.id = name;
		this.color = getColorDictColor(this.color);
	}
	clear() { clearTimeout(this.TO); clearFleetingMessage(); }
	startGame() { }
	start_Level() {
		this.keys = setKeysG(this, filterWordByLengthG, 25);
		console.assert(nundef(this.numPics) || this.keys.length >= this.numPics, 'WAAAAAAAAAAAS? nMin in setKeys nicht richtig!!!!! ' + this.numPics + ' ' + this.keys.length)
	}
	startRound() { }
	prompt() {
		myShowPics(this.controller.evaluate.bind(this.controller));
		setGoal();
		//showInstruction(Goal.label, 'click', dTitle, true);
		show_instruction(`click <b>${Goal.label.toUpperCase()}</b>`, dTitle, `click ${Goal.label}`);
		this.controller.activateUi.bind(this.controller)();
	}
	trialPrompt() {
		sayTryAgain();
		if (this.showHint) shortHintPic();
		return 10;
	}
	activate() { }
	interact() { }
	eval(ev) {
		ev.cancelBubble = true;
		let item = findItemFromEvent(Pictures, ev);
		Selected = { pic: item, feedbackUI: iDiv(item), sz: getRect(iDiv(item)).h };

		//console.log('item in eval',item,'Selected',Selected,'rect',getRect(iDiv(item)));
		//console.log('Selected', Selected.pic.key, 'id', id)

		Selected.reqAnswer = Goal.label;
		Selected.answer = item.label;

		if (item.label == Goal.label) { return true; } else { return false; }
	}
}
class GAbacus extends Game {
	constructor(name, o) { super(name, o); }
	startGame() { this.successFunc = successThumbsUp; this.failFunc = failThumbsDown; this.correctionFunc = this.showCorrectSequence.bind(this); }
	showCorrectSequence() { let t = correctBlanks(); if (this.level <= 1 && (this.step <= 3 || this.op != 'mult')) showSayHint(3); return t + 1000; }
	start_Level() { if (!isList(this.steps)) this.steps = [this.steps]; this.numPics = 2; }
	prompt() {
		mLinebreak(dTable, 2);

		showHiddenThumbsUpDown(110);
		mLinebreak(dTable);

		this.seq = makeExpSequence();


		//console.log('this.seq', this.seq);

		let panel = mDiv(dTable, { bg: '#00000080', padding: 20, rounding: 10 });
		//replace op in seq by wr
		//arrReplace(this.seq,this.op,OPS[this.op].wr);
		[this.words, this.letters] = showEquation(this.seq, panel);
		setNumberSequenceGoal();
		//console.log(this)

		mLinebreak(dTable, 30);

		let wr = (this.language == 'E' ? 'calculate' : "rechne");
		//let s=this.seq;
		let spOp = this.oop.sp; if (this.language == 'D') spOp = DD[spOp];
		let sp = this.operand + ' ' + spOp + ' ' + this.step + ' ?';
		//instr1 = arrTake(this.seq,3).join(' ');
		//showInstruction('', wr, dTitle, true, sp);
		show_instruction(wr, dTitle, sp);

		//console.log('showHint', this.showHint);

		if (this.level <= 1 && this.showHint && (this.step <= 3 || this.op != 'mult'))
			hintEngineStart(getOperationHintString, [0, 1], 5000 + this.level * 1000);

		this.controller.activateUi.bind(this.controller)();
	}
	trialPrompt() {
		if (this.level <= 1 && this.showHint && (this.step <= 3 || this.op != 'mult')) hintEngineStart(getOperationHintString, [0, 1], 5000 + this.level * 1000);
		TOMain = setTimeout(() => getWrongChars().map(x => unfillChar(x)), 500);
		return 600;
	}
	activate() { addKeyup('G', this.interact.bind(this)); }
	interact(ev) {

		//console.log('key!',ev.key,typeof(ev.key));
		if (!isNumber(ev.key) && ev.key != '-') return;
		clearFleetingMessage();
		if (!canAct()) return;

		let sel = Selected = onKeyWordInput(ev);
		if (nundef(sel)) return;
		//console.log('===>', sel);

		//target,isMatch,isLastOfGroup,isVeryLast,ch
		let lastInputCharFilled = sel.target;
		console.assert(sel.isMatch == (lastInputCharFilled.letter == sel.ch), lastInputCharFilled, sel.ch);

		//all cases aufschreiben und ueberlegen was passieren soll!
		//TODO: multiple groups does NOT work!!!
		if (sel.isMatch && sel.isVeryLast) {
			deactivateFocusGroup();
			this.controller.evaluate.bind(this.controller)(true);
		} else if (sel.isMatch && sel.isLastOfGroup) {
			//it has been filled
			//remove this group from Goal.blankWords
			sel.target.isBlank = false;
			sel.target.group.hasBlanks = false;
			removeInPlace(Goal.blankWords, sel.target.group);
			removeInPlace(Goal.blankChars, sel.target);
			deactivateFocusGroup();
			console.log('haaaaaaaaaaaalo', Goal.isFocus)
			//console.log('=>', Goal)
		} else if (sel.isMatch) {
			//a partial match
			removeInPlace(Goal.blankChars, sel.target);
			sel.target.isBlank = false;
		} else if (sel.isVeryLast) {
			Selected.words = getInputWords();
			Selected.answer = getInputWordString();
			Selected.req = getCorrectWordString();
			deactivateFocusGroup();
			//console.log('LAST ONE WRONG!!!')
			this.controller.evaluate.bind(this.controller)(false);
			//user entered last missing letter but it is wrong!
			//can there be multiple errors in string?
		} else if (sel.isLastOfGroup) {
			//unfill last group

			Selected.words = getInputWords();
			Selected.answer = getInputWordString();
			Selected.req = getCorrectWordString();
			deactivateFocusGroup();
			this.controller.evaluate.bind(this.controller)(false);
			//user entered last missing letter but it is wrong!
			//can there be multiple errors in string?
		} else {
			if (!this.silent) { writeSound(); playSound('incorrect1'); }
			deactivateFocusGroup();
			//unfillCharInput(Selected.target);
			showFleetingMessage('does NOT fit: ' + Selected.ch, 0, { fz: 24 });
			setTimeout(() => unfillCharInput(Selected.target), 500);
		}
		//
	}

	eval(isCorrect) { return isCorrect; }

}

function makeDraggableInner(elem) {
	elem.setAttribute('draggable', true);
	elem.ondragstart = ev => {
		if (!canAct()) return;
		let id = evToClosestId(ev);
		let source = mBy(id);
		if (isLetterElement(source)) {
			//console.log('source letter', source.innerHTML);
			ev.dataTransfer.setData("Text", source.innerHTML);
		}
	}
	mClass(elem, 'draggable');

}

class GAnagram extends Game {
	constructor(name, o) {
		super(name, o);
		if (this.language == 'C') {
			this.realLanguage = this.language;
			this.language = chooseRandom('E', 'S', 'F', 'D');
		}
	}
	clear() { super.clear(); if (isdef(this.language)) this.language = this.language; }
	start_Level() {
		this.keys = setKeysG(this, filterWordByLengthG, 10);
		if (this.keys.length < 10) { this.keys = setKeysG(this, filterWordByLengthG, 10, 'all'); }
		//console.log('anagram keys',this.keys.map(x=>Syms[x][this.lang]));
		//console.log(this.keys)
	}
	prompt() {
		myShowPics(null, {}, {});
		if (this.hidden) {
			let d = iDiv(Pictures[0]);
			animate(d, 'aniAppearMinute', 100000);
		}
		setGoal();
		// showInstruction(this.showWord ? Goal.label : '', this.language == 'E' ? 'drag letters to form' : "forme", dTitle, true);

		let w = this.showWord ? Goal.label : '';
		let wr = `drag letters to form ${w}`;
		let sp = `forme ${w}`;
		show_instruction(wr, dTitle, sp);
		mLinebreak(dTable, 22);

		let word = Goal.label.toUpperCase();
		let wlen = word.length;
		let wTable = getRect(mBy('table')).w;
		let wmax = wTable / wlen;
		let gap = 4;
		let fzMax = wTable / wlen - 3 * gap;
		let fz = Math.min(70, fzMax);
		let dpEmpty = createLetterInputsX(word, dTable, { pabottom: 5, bg: 'grey', display: 'inline-block', fz: fz, w: fz, h: fz * 1.1, margin: gap }); //,w:40,h:80,margin:10});
		let inputs = blankInputs(dpEmpty, range(0, wlen - 1), false);
		for (let i = 0; i < inputs.length; i++) {
			let l = iDiv(inputs[i]);
			ipadd(l);
			//l.ondragover = ev => ev.preventDefault();
			//l.ondrop = event => { event.preventDefault(); var data = event.dataTransfer.getData("Text"); event.target.innerHTML = data; }
			//makeDraggableInner(l);
			mClass(l, 'dropzone');
			l.id = 'input' + i;
		}
		this.inputs = inputs;

		let x = mLinebreak(dTable, 35);
		fz = Math.min(60, fzMax);
		let dp = createLetterInputsX(word, dTable, { bg: 'silver', display: 'inline-block', fz: fz, w: fz, h: fz * 1.1, margin: 4 }); //,w:40,h:80,margin:10});
		scrambleInputs(dp);
		let letters = Array.from(dp.children);
		for (let i = 0; i < letters.length; i++) {
			let l = letters[i];
			l.setAttribute('draggable', true);
			//makeDraggableInner(l);
			ipadd(l);
			l.id = 'letter' + i;
		}
		this.letters = letters;

		//add done button here!
		mLinebreak(dTable, 35);
		this.bDone = mButton('Done!', this.controller.evaluate.bind(this.controller), dTable, { fz: 28, matop: 10, rounding: 10, padding: 16, border: 8 }, ['buttonClass']);

		if (this.hidden) showFleetingMessage('category: ' + Pictures[0].info.subgroup, 5000);
		else if (!this.showWord) { showLabelPercentHintAfter(50, 6000); }

		this.controller.activateUi.bind(this.controller)();

	}
	trialPrompt() {
		sayTryAgain();
		setTimeout(() => {
			this.inputs.map(x => iDiv(x).innerHTML = '_')
			// mClass(d, 'blink');
		}, 1500);

		return 10;
	}
	eval() {
		//let w = buildWordFromLetters(inp.parentNode);
		//console.log(this.inputs[0])
		let s = this.inputs.map(x => iDiv(x).innerHTML);
		let w = s = s.join('');
		let word = Goal.label.toUpperCase();
		//console.log('word input',w,'goal word',word);
		Selected = { answer: w, reqAnswer: word, feedbackUI: iDiv(Goal) };
		return w == word;
	}
	onTimeup() { this.controller.evaluate(); }
}
class GColoku extends Game {
	startGame() {
		this.correctionFunc = () => {
			if (this.qName == 'isThisSudokuCorrect') {
				mStyle(Goal.buttonCorrect, { bg: 'green' });
				animate(Goal.buttonCorrect, 'komisch', 1000);

				//console.log('correct', Goal.correct)
				if (!Goal.correct) {
					animateColorScale(Goal.correctionFeedbackUI, Goal.item.color, 1.5, 1500);
					this.dComment.innerHTML = 'rule broken! duplicate in ' + Goal.err.type;
				} else {
					this.dComment.innerHTML = 'this coloku is correct!';
				}
			} else {
				this.dWordArea.remove();
				this.bDone.remove();
				if (Goal.err) {
					this.dComment.innerHTML = 'rule broken! duplicate in ' + Goal.err.type;
					animateColorScale(Goal.correctionFeedbackUI, Goal.item.color, 1.5, 1500);
				} else {
					this.dComment.innerHTML = 'Coloku is incomplete!!!!';
				}
			}

			return 20000;
		};
		this.failFunc = () => {
			if (this.qName == 'isThisSudokuCorrect') {
				if (Goal.choice == Goal.correctChoice) { mStyle(Goal.buttonClicked, { bg: 'green' }); mCheckit(Goal.feedbackUI, 100); }
				else { mXit(Goal.buttonClicked, 100); }
				//mStyle(this.dGraph, { opacity: 1 });
			} else {
				mXit(this.dGrid, 200);
			}
		}
		this.successFunc = () => {
			if (this.qName == 'isThisSudokuCorrect') {
				if (Goal.choice == Goal.correctChoice) { mStyle(Goal.buttonClicked, { bg: 'green' }); mCheckit(Goal.feedbackUI, 100); }
				else { mXit(Goal.buttonClicked, 100); }
			} else {
				mCheckit(this.dGrid, 200);
			}
		}
	}
	prompt() {

		this.trials = 1;
		//let [rows, cols] = [this.rows, this.cols] = [6, 6];
		let [rows, cols] = [this.rows, this.cols];// = [4, 4]; //
		this.dGrid = mGrid(rows, cols, dTable, { position: 'relative', w: 400, h: 400, gap: 8, bg: 'white' });

		let o = getSudokuPatternFromDB(rows, cols);
		//console.log('pattern', o.pattern, 'puzzle', o.puzzle);
		let [pattern, minPuzzle] = [this.pattern, this.minPuzzle] = [o.pattern, o.puzzle];
		// let pattern = this.pattern = getSudokuPattern(rows, cols);
		//console.log('pattern',pattern)
		//printMatrix(pattern, 'pattern');
		//printMatrix(minPuzzle, 'minpuzzle');
		//console.log('inclomplete coloku has spaces', minPuzzle)
		//return;

		mLinebreak(dTable, 20);
		this.dChoices = mDiv(dTable);
		mLinebreak(dTable);
		this.dComment = mDiv(dTable);
		mLinebreak(dTable);

		let qName = this.qName = this.level == 0 && coin() && PROJECTNAME == 'belinda' ? 'isThisSudokuCorrect' : 'solve';
		//let qName = this.qName = 'solve'; // solve | isThisSudokuCorrect
		this[qName]();

		this.controller.activateUi.bind(this.controller)();
	}
	fillGrid(pattern) {
		//fill grid w/ colored divs
		let items = this.items = [];
		let [rows, cols, dGrid] = [this.rows, this.cols, this.dGrid];
		let colors = this.colors = rows == 4 ? [RED, YELLOW, BLUE, GREEN]
			: rows == 6 ? [RED, YELLOW, BLUE, GREEN, PURPLE, ORANGE]
				: [BLUEGREEN, PURPLE, ORANGE, RED, YELLOW, BLUE, GREEN, LIGHTBLUE, OLIVE];
		shuffle(colors);
		for (let r = 0; r < rows; r++) {
			let arr = [];
			for (let c = 0; c < cols; c++) {
				let nch = pattern[r][c];

				let color = isNumber(nch) ? colors[pattern[r][c]] : null;
				let d = mDiv(dGrid, { bg: color }, getUID());
				let item = { row: r, col: c, id: d.id, color: color, val: nch };
				iAdd(item, { div: d });
				arr.push(item);
			}
			items.push(arr);
		}
		return items;
	}
	makeLines() {
		let [wline, dGrid, sz] = [2, this.dGrid, this.rows];
		let gSize = getSize(dGrid);
		//console.log('size:', gSize);
		let rh = sz != 9 ? makeRect((gSize.w - wline) / 2, 0, wline, gSize.h) : makeRect((gSize.w - wline) / 3, 0, wline, gSize.h);
		let rv = sz == 4 ? makeRect(0, (gSize.h - wline) / 2, gSize.w, wline) : makeRect(0, (gSize.h - wline) / 3, gSize.w, wline);

		//bei 4 und 6 nur 1 vertical line in der mitte, bei 9 2 davon!
		let vLine = mDiv(dGrid, { bg: this.color, position: 'absolute', left: rh.l, top: rh.t, w: rh.w, h: rh.h });
		if (sz == 9) vLine = mDiv(dGrid, { bg: this.color, position: 'absolute', left: rh.l * 2, top: rh.t, w: rh.w, h: rh.h });

		//bei 4 nur 1 horizontal line in der mitte, bei 6 und 9 2 davon!
		let hLine = mDiv(dGrid, { bg: this.color, position: 'absolute', left: rv.l, top: rv.t, w: rv.w, h: rv.h });
		if (sz != 4) vLine = mDiv(dGrid, { bg: this.color, position: 'absolute', left: rv.l, top: 2 * rv.t, w: rv.w, h: rv.h });
	}
	setGoal(pattern) {
		let err = checkSudokuRule(pattern);

		//console.log('flattened', arrFlatten(pattern));
		let incomplete = false;
		for (const el of arrFlatten(pattern)) {
			if (!isNumber(el)) { incomplete = true; break; }
		}
		//let incomplete = arrFlatten(pattern).includes(' ');
		//console.log('pattern after arrFlatten', pattern, '\nincomplete', incomplete, '\nisNumber(space)', isNumber(' '))

		let answer = (err == null) && !incomplete; //console.log('correct', answer);
		//if (err) console.log('err', err.type, '[' + err.row + ',' + err.col + ']');
		//find the tile where the error really is!
		Goal = { correct: answer, err: err, incomplete: incomplete };
	}
	isThisSudokuCorrect() {

		this.trials = 1;

		let [pattern, rows, cols, dGrid] = [this.pattern, this.rows, this.cols, this.dGrid];
		//if (coin()) destroySudokuRule(pattern, rows, cols);
		destroySudokuRule(pattern, rows, cols);

		this.setGoal(pattern);

		let items = this.fillGrid(pattern);
		this.makeLines();
		let wsp = {
			D: 'ist dieses coloku korrekt?',
			E: 'is this coloku correct?',
			S: 'es este coloku correcto?',
			F: 'est ce que ce coloku est exacte?',
		};
		let sp = wsp[this.language];
		show_instruction(sp, dTitle, sp);

		showFleetingMessage('rule: each color must be unique in every row, column and quadrant!', 15000);

		//console.log('answer', Goal.correct, Goal.err);
		let correct, incorrect;
		if (Goal.correct) { correct = { num: 1, text: 'yes' }; incorrect = [{ num: 0, text: 'no' }]; }
		else { correct = { num: 0, text: 'no' }; incorrect = [{ num: 1, text: 'yes' }]; }
		let feedbackUI = Goal.correctionFeedbackUI = Goal.correct ? this.dGrid : iDiv(this.items[Goal.err.row][Goal.err.col]);
		createMultipleChoiceElements(correct, incorrect, this.dChoices, feedbackUI, {});
		Goal.item = Goal.correct ? this.items[0] : this.items[Goal.err.row][Goal.err.col];
	}
	solve() {
		//take a few pieces out
		//this.numMissing = 1; //das wird dann automatisiert!

		//take a random number out of puzzle
		let [rrand, crand] = [randomNumber(0, this.rows - 1), randomNumber(0, this.cols - 1)];
		let puzzle = this.puzzle = jsCopy(this.pattern);

		//find all possible r,c that can be removed (=are empty in min version of puzzle)
		let [min, rows, cols] = [this.minPuzzle, this.rows, this.cols];
		let combis = [];
		for (let r = 0; r < rows; r++) {
			for (let c = 0; c < cols; c++) {
				if (min[r][c] === ' ') combis.push({ row: r, col: c });
			}
		}

		//take numMissing of these randomly
		let combisToRemove = choose(combis, this.numMissing);

		//remove these entries from pattern to get real puzzle!
		for (const o of combisToRemove) {
			puzzle[o.row][o.col] = ' ';
		}

		//printMatrix(puzzle, 'puzzle');
		this.fillGrid(puzzle);
		this.makeLines();

		let sp = 'solve this coloku!'
		show_instruction(sp, dTitle, sp);

		//showFleetingMessage('rule: each color must be unique in every row, column and quadrant!', 15000);

		//containers should be divs of empty (unset) puzzle
		let itemlist = this.itemlist = arrFlatten(this.items);
		//console.log('items', itemlist);
		let containers = this.containers = itemlist.filter(x => x.val === ' ');
		//console.log('containers', containers)

		let dWordArea = this.dWordArea = mDiv(dTable, { h: 70, display: 'flex', 'flex-wrap': 'wrap', layout: 'fhcc' });
		let colorItems = this.colorItems = [];
		for (const color of this.colors) {
			let colorItem = { id: getUID(), color: color };
			let d = mDiv(dWordArea, { w: 40, h: 40, bg: color, margin: 10, cursor: 'pointer' }, colorItem.id);
			iAdd(colorItem, { div: d });
			colorItems.push(colorItem);
		}

		enableDD(colorItems, containers, this.dropHandler.bind(this), true);
		mLinebreak(dTable, 50);
		this.bDone = mButton('Done!', this.controller.evaluate.bind(this.controller), dTable, { fz: 28, matop: 10, rounding: 10, padding: 16, border: 8 }, ['buttonClass']);
		//printMatrix(this.puzzle, 'puzzle');

	}
	dropHandler(source, target, isCopy = true) {
		let dSource = iDiv(source);
		let dTarget = iDiv(target);
		mStyle(dTarget, { bg: source.color });
		target.color = source.color;
		target.val = this.colors.indexOf(source.color);

	}

	evalIsCorrect() {
		Selected = { feedbackUI: Goal.buttonClicked };
		return Goal.buttonClicked == Goal.buttonCorrect;
	}
	evalSolve() {
		//compare pattern to item values
		let [items, pattern, rows, cols] = [this.items, this.pattern, this.rows, this.cols];

		//console.log('flat', arrFlatten(this.items));
		let pat = items.map(x => x.map(y => y.val));
		//printMatrix(pat, 'trial!');

		this.setGoal(pat);
		if (Goal.err) {
			Goal.correctionFeedbackUI = iDiv(this.items[Goal.err.row][Goal.err.col]);
			Goal.item = this.items[Goal.err.row][Goal.err.col];
		}

		Selected = { feedbackUI: this.dGrid };
		return Goal.correct;
	}
	eval() {
		clearFleetingMessage();
		return this.qName == 'solve' ? this.evalSolve() : this.evalIsCorrect();
	}
	onTimeup() { this.controller.evaluate(); }

}
class GCats extends Game {
	constructor(name, o) { super(name, o); }
	startGame() { this.correctionFunc = showCorrectPictureLabels; this.failFunc = failSomePictures; }

	dropHandler(source, target, isCopy = true) {
		let dSource = iDiv(source);
		let dTarget = iDiv(target);

		if (!isCopy) {
			mAppend(dTarget, dSource);
		} else {
			let dNew = mText(dSource.innerHTML, dTarget, { wmin: 100, fz: 20, padding: 4, margin: 4, display: 'inline-block' });
			addDDSource(dNew, false);
		}

		if (isOverflown(dTarget)) {
			let d = dTarget.parentNode;
			let r = getRect(d);
			let w = r.w + 100;

			mSize(d, w, r.h);
			console.log('overflow!!!!', r.w, '=>', w)
		}
	}

	prompt() {
		let items;

		// pick categories
		let data = this.keysByCat = genCats(this.numCats);
		this.keylists = [], this.catsByKey = {};
		for (const cat in data) {
			this.keylists.push({ keys: data[cat], cat: cat });
			for (const k of data[cat]) {
				this.catsByKey[k] = cat;
			}
		}
		this.cats = Object.keys(this.keysByCat);
		this.allKeys = Object.keys(this.catsByKey);
		this.options = {}; _extendOptions(this.options);

		// pick items
		if (this.pickRandom == false) {
			items = Pictures = getNItemsPerKeylist(this.numPics, this.keylists, this.options);
		} else {
			let keys = choose(this.allKeys, this.numPics * this.numCats);
			items = Pictures = genItemsFromKeys(keys, this.options);
			items.map(x => x.cat = this.catsByKey[x.key]);
		}
		shuffle(items);

		//OIL for category boxes
		//showInstruction('', this.language == 'E' ? 'drag pictures to categories' : "ordne die bilder in kategorien", dTitle, true);
		let wr = this.language == 'E' ? 'drag pictures to categories' : "ordne die bilder in kategorien";
		show_instruction(wr, dTitle, wr);
		mLinebreak(dTable);

		//show categories:
		let dArea = mDiv(dTable, { display: 'flex', 'flex-wrap': 'wrap' });
		let containers, dWordArea;
		containers = this.containers = createContainers(this.cats, dArea, { w: 'auto', wmin: 150, wmax: 300, hmin: 250, fz: 24, fg: 'contrast' }); //['animals', 'sport', 'transport'], dArea);
		mLinebreak(dTable);

		//show words:
		dWordArea = this.dWordArea = mDiv(dTable, { h: 70, display: 'flex', 'flex-wrap': 'wrap', layout: 'fhcc' });
		for (const item of items) { let d = miPic(item, dWordArea); iAdd(item, { div: d }); }

		enableDD(items, containers, this.dropHandler.bind(this), false);
		mLinebreak(dTable, 50);
		mButton('Done!', this.controller.evaluate.bind(this.controller), dTable, { fz: 28, matop: 10, rounding: 10, padding: 16, border: 8 }, ['buttonClass']);

		this.controller.activateUi.bind(this.controller)();
	}
	trialPrompt() {
		sayTryAgain();
		TOMain = setTimeout(() => {
			for (const p of Pictures) {
				if (!p.isCorrect) {
					mAppend(this.dWordArea, iDiv(p));
					if (this.trialNumber == 1) miAddLabel(p, { bg: '#00000080', margin: 4, fz: 20 });
				}
			}
		}, 1000);
		return 1200;
	}
	eval() {
		this.piclist = Pictures;
		Selected = { piclist: this.piclist, feedbackUI: this.piclist.map(x => iDiv(x)), sz: getRect(iDiv(this.piclist[0])).h };
		let isCorrect = true;
		for (const p of Pictures) {
			let label = p.label;
			let d = iDiv(p);
			let cont = d.parentNode;
			for (const c of this.containers) {
				if (iDiv(c) == cont) {
					p.classified = true;
					if (p.cat == c.label) p.isCorrect = true;
					else { p.isCorrect = isCorrect = false; }
					break;
				}
			}
			if (!p.classified) p.isCorrect = isCorrect = false;
		}
		//Pictures.map(x => console.log(x.label, x.isCorrect));
		return isCorrect;
	}
}
class GElim extends Game {
	constructor(name, o) { super(name, o); }
	startGame() {
		this.correctionFunc = () => { writeSound(); playSound('incorrect1'); return this.spokenFeedback ? 1800 : 300; };
		this.successFunc = () => { Goal.pics.map(x => iDiv(x).style.opacity = .3); successPictureGoal(); }
	}
	start_Level() {
		super.start_Level();
		this.keys = this.keys.filter(x => containsColorWord(x));
	}
	prompt() {
		this.piclist = [];
		let colorKeys = this.numColors > 1 ? choose(this.colors, this.numColors) : null;
		let showRepeat = this.numRepeat > 1;
		let rows = this.numColors > 1 ? this.numColors : undefined;
		myShowPics(this.interact.bind(this), { bg: 'white' },// { contrast: this.contrast, },
			{
				showRepeat: showRepeat, colorKeys: colorKeys, numRepeat: this.numRepeat,
				contrast: this.contrast, rows: rows
			});

		//console.log('this.colors', this.colors, 'colorKeys', colorKeys);
		let [sSpoken, sWritten, piclist] = logicMulti(Pictures);
		this.piclist = piclist;
		Goal = { pics: this.piclist, sammler: [] };

		show_instruction(sWritten, dTitle, sSpoken, { fz: 22, voice: 'zira' });
		this.controller.activateUi.bind(this.controller)();
	}
	trialPrompt() {
		sayTryAgain();
		let msg = this.language == 'D' ? 'noch einmal!' : 'try again!'
		showFleetingMessage(msg, 0, { margin: -8, fz: 22 }, true);
		return 1000;
	}
	activate() {
		for (const p of this.piclist) { if (p.isSelected) toggleSelectionOfPicture(p); }
		this.piclist = [];
	}
	interact(ev) {
		ev.cancelBubble = true;
		if (!canAct()) return;

		let pic = findItemFromEvent(Pictures, ev);
		// let id = evToClosestId(ev);
		// let pic = firstCond(Pictures, x => iDiv(x).id == id);
		writeSound(); playSound('hit');

		if (Goal.pics.includes(pic)) {
			removePicture(pic);
			//console.log('YES!!!!'); 
			Goal.sammler.push(pic);
		}


		if (Goal.pics.length == Goal.sammler.length) this.controller.evaluate.bind(this.controller)(true);
		else if (!Goal.pics.includes(pic)) { this.lastPic = pic; this.controller.evaluate.bind(this.controller)(false); }
		// if (pic.label == Goal.label) this.controller.evaluate.bind(this.controller)(false);
		// else { removePicture(pic);maLayout(Pictures,dTable) }

	}
	eval(isCorrect) {
		//	console.log('eval', isCorrect);
		// console.log('piclist', this.piclist)
		Selected = { piclist: this.piclist, feedbackUI: isCorrect ? Goal.pics.map(x => iDiv(x)) : iDiv(this.lastPic) };
		return isCorrect;
	}
}
class GHouse extends Game {
	constructor(name, o) { super(name, o); }
	startGame() {
		this.correctionFunc = () => {
			mStyle(Goal.buttonCorrect, { bg: 'green' });
			animate(Goal.buttonCorrect, 'komisch', 1000);
			mStyle(this.dGraph, { opacity: 1 });
			//if (this.q.name.includes('isThereAPath')) 
			// this.showPath();
			return 20000;
		};
		this.failFunc = () => {
			if (Goal.choice == Goal.correctChoice) { mStyle(Goal.buttonClicked, { bg: 'green' }); mCheckit(Goal.feedbackUI, 100); }
			else { mXit(Goal.buttonClicked, 100); }
			mStyle(this.dGraph, { opacity: 1 });
		}
		this.successFunc = () => {
			if (Goal.choice == Goal.correctChoice) { mStyle(Goal.buttonClicked, { bg: 'green' }); mCheckit(Goal.feedbackUI, 100); }
			else { mXit(Goal.buttonClicked, 100); }
			mStyle(this.dGraph, { opacity: 1 });
		}
	}

	prompt() {

		if (isdef(this.graph)) this.graph.clear();

		this.trials = 1;
		let n = randomNumber(this.minRooms, this.maxRooms); //console.log('n',n)

		//#region selectQuestion
		let qFuncs = [this.areRoomsConnected.bind(this)];
		// let qFuncs = [this.howMany.bind(this), this.areRoomsConnected.bind(this)];
		if (n > 5) qFuncs.push(this.isThereAPath.bind(this));
		let q = this.q = this.level > 1 ? arrLast(qFuncs) : chooseRandom(qFuncs); // this.isThereAPath.bind(this);//
		//#endregion

		//#region make house
		let s = n;
		let wTotal = n < 4 || n > 12 ? 700 : n > 10 ? 600 : 500;
		let dGridOuter = mDiv(dTable, { wmin: wTotal, hmin: 400 });
		let house = this.house = iHouse(dGridOuter, s, { w: wTotal, h: 400 });
		//console.log('house size', getRect(dGridOuter).w, getRect(dGridOuter).h);
		let rooms = this.rooms = house.rooms.map(x => Items[x]);
		this.addLabelsToRooms();
		//#endregion

		//#region add doors
		// let door = iDoor('g', 'e'); doors.push(door);
		let dirs = coin() ? ['n', 'w'] : ['s', 'e'];
		let doors = this.doors = [];
		for (const r of rooms) {
			let dir = coin() ? dirs[0] : dirs[1];
			let door = iDoor(r.id, dir);
			doors.push(door);
		}

		if (q.name.includes('Path')) hideOuterDoors(house);
		//#endregion

		//#region prep container for multiple choices
		mLinebreak(dTable, 20);
		this.dChoices = mDiv(dTable);

		mLinebreak(dTable);
		//#endregion

		//#region make graph container
		// let dGraph = this.dGraph = mDiv(dTable, { align: 'left', position: 'relative', w: wTotal, h: 300, rounding: 10, matop: 10, bg: 'skyblue' });

		let r = getRect(dGridOuter); //console.log('r',r);
		mStyle(dGridOuter, { position: 'relative' });
		let dGraph = this.dGraph = mDiv(dGridOuter, { box: true, align: 'left', position: 'absolute', bg: '#ffffff80', top: 0, left: 0, w: r.w, h: r.h });
		//#endregion

		let innerStyles = { box: true, align: 'left', position: 'absolute', bg: '#ffffff80', top: 0, left: 0, w: r.w, h: r.h };
		let g1 = this.graph = new UIGraph(dGraph, { edge: { bg: 'blue' }, outer: { align: 'left', w: wTotal, h: 400 }, inner: innerStyles });//{ box: true, align: 'left', position: 'absolute', bg: '#ffffff80', top: 0, left: 0, w: r.w, h: r.h });
		// let els = convertToGraphElements(g1,house);
		convertToGraphElements(g1, house);
		//console.log('nodes', g1.getNodeIds());
		//console.log('edges', g1.getEdgeIds());

		// g1.cy.elements=els; //, els, false); //Username != 'gul');
		//console.log(g1.getNodeIds())
		//storeRoomPositions(g1);
		g1.presetLayout();
		g1.reset();

		mStyle(dGraph, { opacity: 0 });

		q();
		this.controller.activateUi.bind(this.controller)();
	}
	//#region qFuncs
	isThereAPath() {
		let house = this.house;
		let corners = getCornerRoomsDict(house); //console.log('corners', corners); 
		let clist = Object.values(corners);	//console.log('cornerlist',clist);
		let g = this.graph;

		let id = g.getNodeWithMaxDegree(clist); //console.log('max degree node:',id);
		let cornerRoomIds = g.sortNodesByDegree(clist).map(x => x.id());
		//console.log('nodes',cornerRoomIds);

		let [r1, r2] = [Items[cornerRoomIds[0]], Items[cornerRoomIds[1]]]; //take first 2 nodes, and order by dir: n,e,
		if (r1 == r2 || areNeighbors(r1, r2) && cornerRoomIds.length > 2) r2 = Items[cornerRoomIds[2]];
		if (!r1.isW && (r2.isW || !r1.N)) [r1, r2] = [r2, r1];

		//console.log('from room',r1.id,r1,'to room',r2.id,r2);

		let roomFrom = r1.id; // corners.NW; 	// console.log('nw', nw)
		let funcs = this.dijkstra = g.getShortestPathsFrom(roomFrom);	// console.log('funcs', funcs);
		let roomTo = r2.id; //null;
		for (const k in corners) {
			if (k != 'NW') {
				let dist = funcs.distanceTo('#' + corners[k]);
				if (dist != Infinity && dist >= 3) {
					roomTo = corners[k];
					break;
				} //else console.log('distance to', k, dist);
			}
		}
		if (!roomTo) { roomTo = corners.SE; }

		//#region spoken and written instruction
		//setLanguageHALLO('F');

		this.roomFrom = roomFrom;
		this.roomTo = roomTo;

		let sp1 = {
			D: ['gibt es einen weeg von', 'gibt es einen weg von'],
			E: ['is there a path from', 'is there a path from'],
			S: ['hay un camino de', 'hay un camino de'],
			F: ["y a 'til un chemin de", "y a 'til un chemin de"],
		};
		let sp2 = {
			D: ['zu', 'zu'],
			E: ['to', 'to'],
			S: ['a', 'a'],
			F: ['!. a! ', 'à'],
		};
		let fill1 = [`. "${Items[roomFrom].id.toUpperCase()}"! `, ` ${Items[roomFrom].id} `];
		let fill2 = [`. "${Items[roomTo].id.toUpperCase()}"`, ` ${Items[roomTo].id}`];
		let l = 'E'; //this.language;
		let sp = sp1[l][0] + fill1[0] + sp2[l][0] + fill2[0] + '?';
		let wr = sp1[l][1] + fill1[1] + sp2[l][1] + fill2[1] + '?';

		// let wr = this.language == 'E' ? `is there a path from ${Items[nw].id} to ${Items[n2].id}` : `gibt es einen weg von ${Items[nw].id} zu ${Items[n2].id}`;
		// // let sp = this.language == 'E' ? `is there a path from: "${Items[nw].id.toUpperCase()}", to: "${Items[corners.SE].id.toUpperCase()}"`: `gibt es einen weg von ${Items[nw].id} zu ${Items[n2].id}`;
		// let sp = this.language == 'E' ? `is there a path from: "${Items.a.id.toUpperCase()}", to: "${Items.a.id.toUpperCase()}"` : `gibt es einen weeg von ${Items[nw].id} zu ${Items[n2].id}`;
		//sp = `is there a path from. "A"! to. "A"`;

		let voice = this.language == 'E' ? coin() ? 'ukMale' : 'zira' : this.language;

		//showInstruction('', wr, dTitle, true, sp, 20, 'david');		
		//#endregion

		show_instruction(wr, dTitle, sp, { voice: voice });

		let answer = funcs.distanceTo('#' + roomTo) != Infinity;
		let correct, incorrect;
		if (answer) { correct = { num: 1, text: 'yes' }; incorrect = [{ num: 0, text: 'no' }]; }
		else { correct = { num: 0, text: 'no' }; incorrect = [{ num: 1, text: 'yes' }]; }
		createMultipleChoiceElements(correct, incorrect, this.dChoices, iDiv(this.house), {});
	}
	howMany() {
		//showInstruction('', this.language == 'E' ? 'how many units are there in this house?' : "wieviele wohneinheiten hat dieses haus?", dTitle, true);
		let wr = this.language == 'E' ? 'how many units are there in this house?' : "wieviele wohneinheiten hat dieses haus?";
		show_instruction(wr, dTitle, wr);
		let numUnits = this.graph.getNumComponents(); //howManyComponents();
		// console.log(numUnits)
		let otherChoices = [
			numUnits * 2,
			Math.round(numUnits / 2),
			numUnits + randomNumber(1, 10)
		];
		let di = {};
		for (let i = 0; i < otherChoices.length; i++) {
			let n = otherChoices[i];
			while (n == numUnits || isdef(di[n])) { n += 1; } //console.log('!!!!!'); }
			di[n] = true;
			otherChoices[i] = n;
		}
		createMultipleChoiceElements({ num: numUnits, text: numUnits },
			otherChoices.map(x => ({ num: x, text: x })), this.dChoices, iDiv(this.house), {});

	}
	areRoomsConnected() {
		//showInstruction('', this.language == 'E' ? 'are all rooms connected?' : "sind alle zimmer verbunden?", dTitle, true);
		let wr = this.language == 'E' ? 'are all rooms connected?' : "sind alle zimmer verbunden?";
		showInstruction(wr, dTitle, wr);
		let numUnits = this.graph.getNumComponents(); //howManyComponents();
		let correct, incorrect;
		if (numUnits == 1) { correct = { num: 1, text: 'yes' }; incorrect = [{ num: 0, text: 'no' }]; }
		else { correct = { num: 0, text: 'no' }; incorrect = [{ num: 1, text: 'yes' }]; }
		createMultipleChoiceElements(correct, incorrect, this.dChoices, iDiv(this.house), {});
	}

	//#region helpers
	showPath() {
		//how to get path from this.roomFrom to this.roomTo?
		//console.log('from',this.roomFrom,'to',this.roomTo);
		mStyle(this.dGraph, { opacity: 1 });
		// show(this.dGraph);
		//let path = this.path = getPathNodes(this.dijkstra);


		//console.log('path',path);
	}
	//#region add stuff to house
	addLabelsToRooms() {
		let roomlist = ['bedroom', 'livingroom', 'bathroom', 'kitchen'];
		sortByFunc(this.rooms, x => x.rect.w * x.rect.h);
		this.rooms.map(x => addLabel(x, x.ch, {}));

	}
	addOneDoorPerRoom(directions) {
		//console.log('______________________')
		//console.log('rooms', this.rooms);
		//console.log('house', this.house);
		for (const r of this.rooms) {
			let door = makeRandomDoor(r, this.house, directions); this.doors.push(door);
		}
		//console.log('dooes', this.doors);
	}
	addWallFinderByMouseClick() {
		dTable.onclick = ev => {
			console.log(ev.clientX, ev.clientY);
			let w = findWall(ev.clientX, ev.clientY, this.walls);
			console.log('found wall', w)
		}
	}
	addFurnitureItems() {
		let keys = ['bed', 'bathtub', 'chair', 'couch and lamp', 'toilet', 'door', 'table'];//ByGroupSubgroup.Objects.household;
		let items = Pictures = genItemsFromKeys(keys);
		console.assert(arrLast(items).key == 'table', 'NOOOOOOO');
		let itable = arrLast(items);
		shuffle(items);
		let dWordArea = this.dWordArea = mDiv(dTable, { h: 70, display: 'flex', 'flex-wrap': 'wrap', layout: 'fhcc' });
		for (const item of items) { let d = miPic(item, dWordArea); iAdd(item, { div: d }); }
		mStyle(iDiv(itable), { fg: BROWN });

		enableDD(items, rooms, this.dropHandler.bind(this), false);
	}
	//#endregion

	eval() {
		clearFleetingMessage();
		Selected = { reqAnswer: G.correctAnswer, answer: Goal.choice.text, feedbackUI: Goal.buttonClicked };

		//console.log('Selected', Selected);
		return (Goal.buttonClicked == Goal.buttonCorrect);
	}

}
class GMaze extends Game {
	constructor(name, o) { super(name, o); }
	clear() { super.clear(); if (isdef(this.cy)) { this.cy.destroy(); } }//maze.clear();this.maze=null;clearElement(dTable);console.log('MAZE CLEARING!')} }
	startGame() {
		//console.log('dTable',dTable)
		this.correctionFunc = () => {
			mStyle(Goal.buttonCorrect, { bg: 'green' });
			animate(Goal.buttonCorrect, 'komisch', 1000);
			if (Goal.correctChoice.text == 'yes') this.maze.breadCrumbs(this.path); else this.maze.colorComponents();

			return 20000;
		};
		this.failFunc = () => {
			if (Goal.choice == Goal.correctChoice) { mStyle(Goal.buttonClicked, { bg: 'green' }); mCheckit(Goal.feedbackUI, 100); }
			else { mXit(Goal.buttonClicked, 100); }
			//mStyle(this.dGraph, { opacity: 1 });
		}
		this.successFunc = () => {
			if (Goal.choice == Goal.correctChoice) { mStyle(Goal.buttonClicked, { bg: 'green' }); mCheckit(Goal.feedbackUI, 100); }
			else { mXit(Goal.buttonClicked, 100); }
		}
	}
	startRound() { if (isdef(this.cy)) this.cy.destroy(); clearElement(dTable); } //clearElement(dTable); this.maze = null; }// if (isdef(this.maze)) this.maze.clear(); }
	prompt() {

		//console.log('MAZE PROMPT!!! supposedly creating maze');
		this.trials = 1;
		//[this.rows, this.cols] = [6 + this.level * 2, 6 + this.level * 2];

		let maze = this.maze = new MazeGraph(dTable, this.rows, this.cols, this.sz, this.gap);
		this.cy = maze.cy;
		//console.log('new MAZE', maze);

		mLinebreak(dTable, 20);
		this.dChoices = mDiv(dTable);
		mLinebreak(dTable);

		//let q = chooseRandom([this.isThereAPath.bind(this)]);
		//q();
		this.isThereAPath(maze);

		this.controller.activateUi.bind(this.controller)();
	}

	isThereAPath(maze) {

		//this.maze.showGraph(); //for testing!

		//set content of start and goal cells
		let cellStart = maze.getTopLeftCell();
		//console.log('cellStart',cellStart)
		mCellContent(iDiv(cellStart), { w: '50%', h: '50%', fz: '60%', bg: 'green', fg: 'white', rounding: '50%' }, 'A');

		let cellGoal = maze.getBottomRightCell();
		mCellContent(iDiv(cellGoal), { w: '50%', h: '50%', fz: '60%', bg: 'red', fg: 'white', rounding: '50%' }, 'B');

		[this.roomFrom, this.roomTo] = [cellStart.nodeId, cellGoal.nodeId];

		//#region spoken and written instruction
		let sp1 = {
			D: ['gibt es einen weeg von', 'gibt es einen weg von'],
			E: ['is there a path from', 'is there a path from'],
			S: ['hay un camino de', 'hay un camino de'],
			F: ["y a 'til un chemin de", "y a 'til un chemin de"],
		};
		let sp2 = {
			D: ['zu', 'zu'],
			E: ['to', 'to'],
			S: ['a', 'a'],
			F: ['!. a! ', 'à'],
		};
		let fill1 = [`. "A"! `, ` A `];
		let fill2 = [`. "B"`, ` B`];
		let l = this.language;
		let sp = sp1[l][0] + fill1[0] + sp2[l][0] + fill2[0] + '?';
		let wr = sp1[l][1] + fill1[1] + sp2[l][1] + fill2[1] + '?';

		let voice = this.language == 'E' ? coin() ? 'ukMale' : 'zira' : this.language;

		show_instruction(wr, dTitle, sp, { voice: voice });
		//#endregion

		let path = this.path = maze.getShortestPathFromTo(this.roomFrom, this.roomTo);

		console.assert(path.length < Infinity, 'WAAAAAAAAAAAAAAS?');
		if (coin(this.level > 2 ? 50 : 40)) maze.cutPath(this.path, .5, .75);
		// this.maze.cutPath(this.path,.5,.75);
		let len = maze.getLengthOfShortestPath(this.roomFrom, this.roomTo); //verify that no longer a path!!!!!

		let answer = len != Infinity;
		//console.log('answer', answer, len)
		let correct, incorrect;
		if (answer) { correct = { num: 1, text: 'yes' }; incorrect = [{ num: 0, text: 'no' }]; }
		else { correct = { num: 0, text: 'no' }; incorrect = [{ num: 1, text: 'yes' }]; }
		createMultipleChoiceElements(correct, incorrect, this.dChoices, maze.dMaze, {});
	}

	eval() {
		clearFleetingMessage();
		//console.log(Goal.buttonClicked)
		Selected = { reqAnswer: G.correctAnswer, answer: Goal.choice.text, feedbackUI: Goal.buttonClicked };

		//console.log('Selected', Selected);
		return (Goal.buttonClicked == Goal.buttonCorrect);
	}

}
class GMem extends Game {
	constructor(name, o) { super(name, o); }
	clear() { clearTimeout(this.TO); showMouse(); }
	prompt() {
		this.trials = 1;
		myShowPics(this.interact.bind(this),
			{ border: '3px solid #ffffff80' },
			{});
		setGoal();

		let wr = (this.language == 'E' ? 'remember ' : 'merke dir ') + (this.level > 2 ? (this.language == 'E' ? 'all' : 'alle') : Goal.label);
		show_instruction(wr, dTitle, wr);
		// if (this.level > 2) { showInstruction('', this.language == 'E' ? 'remember all' : 'merke dir alle', dTitle, true); }
		// else { showInstruction(Goal.label, this.language == 'E' ? 'remember' : 'merke dir', dTitle, true); }

		let secs = calcMemorizingTime(this.numPics, this.level > 2);
		hideMouse();
		TOMain = setTimeout(() => turnCardsAfter(secs), 300, this.level >= 5); //needed fuer ui update! sonst verschluckt er last label

	}
	interact(ev) {
		//console.log('interact!', ev);
		ev.cancelBubble = true;
		if (!canAct()) return;
		let pic = findItemFromEvent(Pictures, ev);
		turnFaceUpSimple(pic);
		if (this.trialNumber == this.trials - 1) turnFaceUpSimple(Goal);
		TOMain = setTimeout(() => this.controller.evaluate.bind(this.controller)(ev), 300);
	}

}
class GMissingLetter extends Game {
	constructor(name, o) { super(name, o); }
	start_Level() {
		super.start_Level();
		this.maxPosMissing = this.posMissing == 'start' ? this.numMissing - 1 : 100;
	}
	prompt() {
		myShowPics(() => fleetingMessage('just enter the missing letter!'));
		setGoal();

		if (this.instruction == 'all') {
			// showInstruction(Goal.label, this.language == 'E' ? 'complete' : "ergänze", dTitle, true);
			let wr = (this.language == 'E' ? 'complete ' : "ergänze ") + `<b>${Goal.label.toUpperCase()}</b>`;
			let sp = (this.language == 'E' ? 'complete ' : "ergänze ") + `${Goal.label}`;
			show_instruction(wr, dTitle, sp);
		} else if (this.instruction == 'spokenGoal') {
			let wr = this.language == 'E' ? 'complete the word' : "ergänze das wort";
			let sp = (this.language == 'E' ? 'complete' : "ergänze") + ' ' + Goal.label;
			// showInstruction('', wr, dTitle, true, sp);
			show_instruction(wr, dTitle, sp);
		} else {
			let wr = this.language == 'E' ? 'complete the word' : "ergänze das wort";
			// showInstruction('', wr, dTitle, true, wr);
			show_instruction(wr, dTitle, wr);
		}

		mLinebreak(dTable, 20);

		// create sequence of letter ui
		let style = { margin: 6, fg: 'white', display: 'inline', bg: 'transparent', align: 'center', border: 'transparent', outline: 'none', family: 'Consolas', fz: 80 };
		let d = createLetterInputs(Goal.label.toUpperCase(), dTable, style); // acces children: d.children

		// randomly choose 1-this.numMissing alphanumeric letters from Goal.label
		let indices = getIndicesCondi(Goal.label, (x, i) => isAlphaNum(x) && i <= this.maxPosMissing);
		this.nMissing = Math.min(indices.length, this.numMissing);
		//console.log('nMissing is', this.nMissing, this.numPosMissing, this.maxPosMissing, indices, indices.length)
		let ilist = choose(indices, this.nMissing); sortNumbers(ilist);

		this.inputs = [];
		for (const idx of ilist) {
			let inp = d.children[idx];
			inp.innerHTML = '_';
			mClass(inp, 'blink');
			this.inputs.push({ letter: Goal.label[idx].toUpperCase(), div: inp, index: idx });
		}

		mLinebreak(dTable);

		let msg = this.composeFleetingMessage();
		let ms = this.instruction == 'all' ? 3000 : this.instruction == 'spokenGoal' ? 9000 : 15000;
		showFleetingMessage(msg, ms);
		this.controller.activateUi.bind(this.controller)();

	}
	trialPrompt() {
		let selinp = Selected.inp;
		sayTryAgain();
		TOMain = setTimeout(() => {
			let d = selinp.div;
			d.innerHTML = '_';
			mClass(d, 'blink');
		}, 1200);

		showFleetingMessage(this.composeFleetingMessage(), 3000);
		return 1500;
	}
	activate() {
		addKeyup('G', ev => {
			if (!isLetter(ev.key)) return;
			clearFleetingMessage();
			if (!canAct()) return;
			let charEntered = ev.key.toString();
			if (!isAlphaNum(charEntered)) return;

			Selected = { lastLetterEntered: charEntered.toUpperCase() };
			//console.log(inputs[0].div.parentNode)

			if (this.nMissing == 1) {
				let d = Selected.feedbackUI = this.inputs[0].div;
				Selected.positiveFeedbackUI = iDiv(Goal);
				Selected.lastIndexEntered = this.inputs[0].index;
				Selected.inp = this.inputs[0];
				d.innerHTML = Selected.lastLetterEntered;
				mRemoveClass(d, 'blink');
				let result = buildWordFromLetters(mParent(d));

				this.controller.evaluate.bind(this.controller)(result);
			} else {
				let ch = charEntered.toUpperCase();
				for (const inp of this.inputs) {
					if (inp.letter == ch) {
						Selected.lastIndexEntered = inp.index;
						Selected.inp = inp;
						let d = Selected.feedbackUI = inp.div;
						d.innerHTML = ch;
						mRemoveClass(d, 'blink');
						removeInPlace(this.inputs, inp);
						this.nMissing -= 1;
						break;
					}
				}
				if (nundef(Selected.lastIndexEntered)) {
					//the user entered a non existing letter!!!
					showFleetingMessage('you entered ' + Selected.lastLetterEntered);
					sayRandomVoice('try a different letter!', 'anderer Buchstabe!')
				}
				showFleetingMessage(this.composeFleetingMessage(), 3000);
				//if get to this place that input did not match!
				//ignore for now!
			}
		})

	}
	eval(word) {
		//console.log('word',word,Goal)
		let answer = normalize(word, this.language);
		let reqAnswer = normalize(Goal.label, this.language);

		Selected.reqAnswer = reqAnswer;
		Selected.answer = answer;

		//console.log(answer, reqAnswer)
		if (answer == reqAnswer) return true;
		else if (this.language == 'D' && fromUmlaut(answer) == fromUmlaut(reqAnswer)) {
			//console.log('hhhhhhhhhhhhhhhhhhh')
			return true;
		} else {
			return false;
		}
	}
	composeFleetingMessage() {
		//console.log('this', this)
		let lst = this.inputs;
		//console.log(this.inputs)
		let msg = lst.map(x => x.letter).join(',');
		let edecl = lst.length > 1 ? 's ' : ' ';
		let ddecl = lst.length > 1 ? 'die' : 'den';
		let s = (this.language == 'E' ? 'Type the letter' + edecl : 'Tippe ' + ddecl + ' Buchstaben ');
		return s + msg;
	}

}
class GNamit extends Game {
	constructor(name, o) { super(name, o); }
	startGame() { this.correctionFunc = showCorrectPictureLabels; this.failFunc = failSomePictures; }
	prompt() {
		this.showLabels = false;
		myShowPics(null, {}, { rows: 1 });
		Pictures.map(x => x.correctLabel = x.label);
		//console.assert(false,'THE END')
		Goal = { pics: Pictures };

		//showInstruction('', this.language == 'E' ? 'drag labels to pictures' : "ordne die texte den bildern zu", dTitle, true);
		let wr = this.language == 'E' ? 'drag labels to pictures' : "ordne die texte den bildern zu";
		show_instruction(wr, dTitle, wr);
		mLinebreak(dTable);

		mLinebreak(dTable, 50);

		let keys = Pictures.map(x => x.key);
		shuffle(keys);
		G.showLabels = true;
		let titems = this.letters = myShowLabels(null, undefined, { rows: 1, showLabels: true }, keys);
		titems.map(x => iDiv(x).style.cursor = 'pointer');
		mLinebreak(dTable, 50);

		enableDD(this.letters, Pictures, this.dropHandler.bind(this), true, false, null);

		mButton('Done!', this.controller.evaluate.bind(this.controller), dTable, { fz: 32, matop: 10, rounding: 10, padding: 16, border: 8 }, ['buttonClass']);

		this.controller.activateUi.bind(this.controller)();
	}
	dropHandler(source, target, isCopy = true) {
		let dSource = iDiv(source);
		let dTarget = iDiv(target);
		console.log('dropped', source, 'onto', target);
		let label = iLabel(target);
		console.log('label', label);
		let div = iDiv(target);
		console.log('div', div);

		addLabel(target, source.label, {});
		//coloku code:
		// mStyle(dTarget, { bg: source.color });
		// target.color = source.color;
		// target.val = this.colors.indexOf(source.color);

	}
	trialPrompt() {
		this.failFunc();
		sayTryAgain();
		TOMain = setTimeout(() => { removeMarkers(); Pictures.map(x => removeLabel(x)) }, 1200);
		return 1500;
	}
	eval() {

		console.log('eval in Namit!!!!!')
		this.piclist = Pictures;
		Selected = { piclist: this.piclist, feedbackUI: this.piclist.map(x => iDiv(x)), sz: getRect(iDiv(this.piclist[0])).h };
		let isCorrect = true;
		for (const p of Pictures) {
			let correctLabel = p.correctLabel;
			console.log('correctLabel', correctLabel, p.label);
			let dLabel = iLabel(p);
			console.log('dLabel', dLabel);
			if (nundef(dLabel) || p.label != correctLabel) p.isCorrect = isCorrect = false;
			//else if (dLabel.innerHTML != correctLabel) p.isCorrect = isCorrect = false;
			else p.isCorrect = true;
			// if (nundef(iDiv(p).children[1])) {
			// 	p.isCorrect = isCorrect = false;
			// } else {
			// 	let text = getActualText(p);
			// 	if (text != label) { p.isCorrect = isCorrect = false; } else p.isCorrect = true;
			// }
		}
		return isCorrect;
	}

}
class GPremem extends Game {
	constructor(name, o) { super(name, o); this.piclist = []; }
	prompt() {
		this.piclist = [];
		this.showLabels = false;
		myShowPics(this.interact.bind(this), { border: '3px solid #ffffff80' }, {});
		//showInstruction('', this.language == 'E' ? 'click any picture' : 'click irgendein Bild', dTitle, true);
		let wr = this.language == 'E' ? 'click any picture' : 'click irgendein Bild';
		show_instruction(wr, dTitle, wr);
		this.controller.activateUi.bind(this.controller)();
	}
	trialPrompt() {
		for (const p of this.piclist) { toggleSelectionOfPicture(p); }
		this.piclist = [];
		// showInstruction('', 'try again: click any picture', dTitle, true);
		show_instruction('try again: click any picture', dTitle, 'try again: click any picture');
		return 10;
	}
	interact(ev) {
		ev.cancelBubble = true;
		if (!canAct()) return;
		let pic = findItemFromEvent(Pictures, ev);

		if (!isEmpty(this.piclist) && this.piclist.length < this.numRepeat - 1 && this.piclist[0].label != pic.label) return;
		toggleSelectionOfPicture(pic, this.piclist);
		if (isEmpty(this.piclist)) {
			//showInstruction('', this.language == 'E' ? 'click any picture' : 'click irgendein Bild', dTitle, true);
			let wr = this.language == 'E' ? 'click any picture' : 'click irgendein Bild';
			show_instruction(wr, dTitle, wr);
		} else if (this.piclist.length < this.numRepeat - 1) {
			//set incomplete: more steps are needed!
			//frame the picture
			//showInstruction(pic.label, this.language == 'E' ? 'click another' : 'click ein andres Bild mit', dTitle, true);
			let wr = (this.language == 'E' ? 'click another ' : 'click ein andres Bild mit ');

			show_instruction(wr + `<b>${pic.label.toUpperCase()}</b>`, dTitle, wr + pic.label);
		} else if (this.piclist.length == this.numRepeat - 1) {
			// look for last picture with x that is not in the set
			let picGoal = firstCond(Pictures, x => x.label == pic.label && !x.isSelected);
			setGoal(picGoal.index);
			// showInstruction(picGoal.label, this.language == 'E' ? 'click the ' + (this.numRepeat == 2 ? 'other' : 'last') : 'click das ' + (this.numRepeat == 2 ? 'andere' : 'letzte') + ' Bild mit', dTitle, true);

			let wr = (this.language == 'E' ? 'click the ' + (this.numRepeat == 2 ? 'other ' : 'last ')
				: 'click das ' + (this.numRepeat == 2 ? 'andere ' : 'letzte ') + ' Bild mit')
			show_instruction(wr + `<b>${picGoal.label.toUpperCase()}</b>`, dTitle, wr + picGoal.label);

		} else {
			//set is complete: eval
			this.controller.evaluate.bind(this.controller)(this.piclist);
		}
	}
	eval(piclist) {
		Selected = { piclist: piclist, feedbackUI: piclist.map(x => iDiv(x)), sz: getRect(iDiv(piclist[0])).h };
		let req = Selected.reqAnswer = piclist[0].label;
		Selected.answer = piclist[piclist.length - 1].label;
		if (Selected.answer == req) { return true; } else { return false; }
	}
}
class GRiddle extends Game {
	constructor(name, o) { super(name, o); }
	startGame() {
		this.successFunc = successThumbsUp; this.failFunc = failThumbsDown;
		this.correctionFunc = () => {
			mStyle(Goal.buttonCorrect, { bg: 'green' });
			animate(Goal.buttonCorrect, 'komisch', 1000);
			return 20000;
		};
	}
	prompt() {
		this.trials = 1;
		// showInstruction('', 'Solve the Riddle:', dTitle, true);
		show_instruction('Solve the Riddle:', dTitle, 'Solve the Riddle:');

		//let wp = this.wp = jsCopy(WordP[22]); //getRandomWP(1, this.maxIndex);
		let wp = this.wp = getRandomWP(this.minIndex, this.maxIndex);
		let haveResult = wp.isTextResult = instantiateNames(wp);
		//console.log('haveResult',haveResult)
		if (!haveResult) instantiateNumbers(wp);


		//console.log(wp.result)
		//for(let i=0;i<37;i++){console.log(WordP[i].sol)}

		mLinebreak(dTable, 2);

		showHiddenThumbsUpDown(90);
		mLinebreak(dTable);
		let dArea = this.textArea = mDiv(dTable, { w: '70%' });
		let d = mText(wp.text, dArea, { fz: 28 });

		mLinebreak(dTable, 20);
		let dResult = this.dResult = mDiv(dTable);

		// this.createInputElements();
		Goal = { label: wp.result.text };

		//console.log('====>', Goal)
		this.createMultipleChoiceElements();

		mLinebreak(dTable);

		// console.log(wp.text); console.log(wp.result);
		this.controller.activateUi.bind(this.controller)();
	}
	createMultipleChoiceElements() {
		let wp = this.wp;

		let choices = [], nums = [], texts = [];
		if (wp.isTextResult == true) {

			texts = Object.values(wp.diNames);
			for (let i = 0; i < texts.length; i++) { choices.push({ number: 0, text: texts[i] }); }
			Goal.correctChoice = firstCond(choices, x => x.text == Goal.label);

		} else if (wp.isFractionResult == true) {
			let res = wp.result.number; //das ist eine fraction

			if (res.n / res.d > 2) {
				wp.result.isMixed = true;
				wp.result.mixed = getMixedNumber(res.n, res.d);
			}
			//console.log('res',res); //ok

			nums = get3FractionVariants(res);
			//console.log('nums',nums)
			//nums = getFractionVariantsTrial1(res);
			texts = nums.map(x => getTextForFractionX(x.n, x.d));
			wp.result.text = texts[0];
			for (let i = 0; i < texts.length; i++) { choices.push({ number: nums[i], text: texts[i] }); }
			// console.log('res',res,'\nwp',wp.result,'\nnums',nums,'\ntexts',texts)

			Goal.correctChoice = firstCond(choices, x => x.text == wp.result.text);

			//<span id="amount2">'&frac12;'</span>
			//console.log('choices',choices);

		} else {
			let res = wp.result.number;
			nums = [res, res + randomNumber(1, 25), res / randomNumber(2, 5), res * randomNumber(2, 5)];
			texts = nums.map(x => (Math.round(x * 100) / 100));
			for (let i = 0; i < texts.length; i++) { choices.push({ number: nums[i], text: texts[i] }); }
			Goal.correctChoice = choices[0];
		}
		//console.log('choices', choices, 'correct', Goal.correctChoice);
		//return;
		shuffle(choices);
		if (coin()) shuffle(choices);
		Goal.choices = choices;
		let dParent = this.dResult;
		let idx = 0;
		for (const ch of choices) {
			////'&frac57;', //'&frac12;', 
			let dButton = mButton(ch.text, this.onClickChoice.bind(this), dParent, { wmin: 100, fz: 36, margin: 20, rounding: 4, vpadding: 4, hpadding: 10 }, ['toggleButtonClass']);
			dButton.id = 'bChoice_' + idx; idx += 1;
			//	console.log('==============',ch,wp.result)
			if (ch.text == wp.result.text) {
				Goal.choice = ch.toString();
				Goal.buttonCorrect = dButton; //else console.log('ch', ch.toString(), 'res', wp.result.text)
			}
		}

	}
	onClickChoice(ev) {
		let id = evToClosestId(ev);
		let b = mBy(id);
		let index = Number(stringAfter(id, '_'));
		Goal.choice = Goal.choices[index];
		Goal.buttonClicked = b;
		//console.log('clicked:',Goal.choice,Goal.correctChoice)
		if (Goal.choice == Goal.correctChoice) { mStyle(b, { bg: 'green' }); mCheckit(this.textArea, 100); }
		else { mXit(b, 100); }
		this.controller.evaluate.bind(this.controller)();
	}
	eval() {
		clearFleetingMessage();
		Selected = { delay: 5000, reqAnswer: this.wp.result.number, answer: Goal.choice.number, feedbackUI: Goal.buttonClicked };
		if (this.wp.isTextResult) { Selected.reqAnswer = this.wp.result.text; Selected.answer = Goal.choice.text; }

		//console.log('Selected', Selected);
		return (Goal.buttonClicked == Goal.buttonCorrect);
	}

	createInputElements() {
		this.inputBox = addNthInputElement(this.dResult, 0);
		this.defaultFocusElement = this.inputBox.id;
		onclick = () => mBy(this.defaultFocusElement).focus();
		mBy(this.defaultFocusElement).focus();
	}
	activate() { }//this.activate_input(); }
	eval_dep(ev) {
		console.log('#', this.trialNumber, 'of', this.trials);
		clearFleetingMessage();
		Selected = {};
		let answer = normalize(this.inputBox.value, 'E');
		let reqAnswer = normalize(this.wp.result.text, 'E');
		console.log('answer', answer, 'req', reqAnswer);
		let isCorrect = answer == reqAnswer;
		Selected = { reqAnswer: reqAnswer, answer: answer, feedbackUI: isCorrect ? Goal.buttonClicked : Goal.buttonCorrect };
		return (answer == reqAnswer);
	}
	trialPrompt_dep() {
		sayTryAgain();
		let n = this.trialNumber; // == 1 ? 1 : (this.trialNumber + Math.floor((Goal.label.length - this.trialNumber) / 2));

		showFleetingMessage('try again!', 0, {}, true);

		this.inputBox = addNthInputElement(this.dResult, this.trialNumber);
		this.defaultFocusElement = this.inputBox.id;
		mLinebreak(dTable);

		return 10;
	}
	activate_input() {
		this.inputBox.onkeyup = ev => {
			if (!canAct()) return;
			if (ev.key === "Enter") {
				ev.cancelBubble = true;
				this.controller.evaluate.bind(this.controller)(ev);
			}
		};
		this.inputBox.focus();
	}

}
class GSayPic extends Game {
	constructor(name, o) { super(name, o); }
	clear() { Speech.stopRecording(); }
	prompt() {
		myShowPics();
		setGoal();
		// showInstruction(Goal.label, this.language == 'E' ? 'say:' : "sage: ", dTitle);
		let wr = (this.language == 'E' ? 'say: ' : "sage: ");
		show_instruction(wr + `<b>${Goal.label.toUpperCase()}</b>`, dTitle); //, wr+Goal.label);
		animate(dInstruction, 'pulse800' + bestContrastingColor(this.color, ['yellow', 'red']), 900);
		mLinebreak(dTable, 25);
		MicrophoneUi = mMicrophone(dTable, this.color);
		MicrophoneHide();
		TOMain = setTimeout(this.controller.activateUi.bind(this.controller), 200);
	}
	trialPrompt(nTrial) {
		sayRandomVoice(nTrial < 2 ? 'speak UP!!!' : 'Louder!!!', 'LAUTER!!!');
		animate(dInstruction, 'pulse800' + bestContrastingColor(this.color, ['yellow', 'red']), 500);
		return 600;
	}
	activate() {
		if (Speech.isSpeakerRunning()) {
			TOMain = setTimeout(this.activate.bind(this), 200);
		} else {
			TOMain = setTimeout(() => Speech.startRecording(this.language, this.controller.evaluate.bind(this.controller)), 100);
		}

	}
	eval(isfinal, speechResult, confidence, sessionId) {
		if (sessionId != SessionId) {
			alert('NOT THIS BROWSER!!!!!!'); return undefined;
		}
		let answer = Goal.answer = normalize(speechResult, this.language);
		let reqAnswer = Goal.reqAnswer = normalize(Goal.label, this.language);

		Selected = { reqAnswer: reqAnswer, answer: answer, feedbackUI: iDiv(Goal) };

		if (isEmpty(answer)) return false;
		else return isSimilar(answer, reqAnswer) || isList(Goal.info.valid) && firstCond(Goal.info.valid, x => x.toUpperCase() == answer.toUpperCase());

	}
}
class GSentence extends Game {
	constructor(name, o) {
		super(name, o);
		this.prevLanguage = this.language;
		this.language = 'E';
	}
	startGame() {
		this.correctionFunc = () => {
			let sent = this.sentenceList[0].join(' ');
			this.dWordArea.innerHTML = `<h1>${sent}</h1>`;
			if (this.spokenFeedback) sayRandomVoice(sent);

			return 3000;
		}

		this.successFunc = () => { mCheckit(this.dWordArea, 120); };
	}
	clear() { super.clear(); this.language = this.prevLanguage; }
	start_Level() {
		this.sentences = [];
		for (const s of EnglishSentences) {
			let slist = isList(s) ? s : [s];
			slist = slist.map(x => x.split(' '));
			if (slist[0].length <= this.maxWords && slist[0].length >= this.minWords) this.sentences.push(slist);
		}
		//console.log('sentences', this.sentences);
	}
	dropHandler(source, target, isCopy = false, clearTarget = false) {
		let prevTarget = source.target;
		source.target = target;
		let dSource = iDiv(source);
		let dTarget = iDiv(target);
		if (clearTarget) {
			//if this target is empty, remove _
			let ch = dTarget.children[0];
			let chSource = firstCond(Pictures, x => iDiv(x) == ch);
			if (chSource) {
				if (isdef(prevTarget)) {
					mAppend(iDiv(prevTarget), ch);
					chSource.target = prevTarget;
				} else {
					mAppend(this.dWordArea, ch);
					delete chSource.target;
				}
			}
			clearElement(dTarget);

			//find out previous target! (parentNode of dSource in a drop target?)
		}
		if (isCopy) {
			let dNew = mText(dSource.innerHTML, dTarget, { wmin: 100, fz: 20, padding: 4, margin: 4, display: 'inline-block' });
			addDDSource(dNew, isCopy, clearTarget);
		} else {
			mAppend(dTarget, dSource);
		}
	}
	prompt() {

		// showInstruction('', 'form a correct sentence', dTitle, true);
		show_instruction('form a correct sentence', dTitle, 'form a correct sentence');
		mLinebreak(dTable);

		//pick a random sentence
		let sl = this.sentenceList = chooseRandom(this.sentences);
		//console.log('slist', sl);
		let words = this.sentenceList[0];

		let fz = 32;
		let h = fz * 1.25, wmin = fz * 1.25;
		let items = Pictures = [];
		let containers = this.containers = [];
		let options = _simpleOptions({ fz: fz, bg: 'transparent', fg: 'white', showPic: false, showLabels: true }, { wmin: wmin });
		let dArea = mDiv(dTable, { h: 150, display: 'flex', 'flex-wrap': 'wrap', layout: 'fhcc' });
		mLinebreak(dTable);

		let dWordArea = this.dWordArea = mDiv(dTable, { h: 70, wmin: 20, display: 'flex', 'flex-wrap': 'wrap', layout: 'fhcc' });//,{layout:'fhcc'})

		let i = 0;
		for (const word of words) {
			let item = { label: word, index: i };
			let container = { label: word, index: i };
			i += 1;
			let d = makeItemDiv(item, options);
			let dCont = mDiv(dArea, { wmin: wmin + 12, hmin: h + 10, bg: colorTrans('beige', .25), fg: 'black', margin: 12 });
			container.div = dCont;
			items.push(item);
			containers.push(container);
		}

		shuffle(items);
		items.map(x => { mAppend(dWordArea, iDiv(x)); mStyle(iDiv(x), { h: h, w: 'auto' }); });
		enableDD(items, containers, this.dropHandler.bind(this), false, true);
		mLinebreak(dTable, 50);
		mButton('Done!', this.controller.evaluate.bind(this.controller), dTable, { fz: 28, matop: 10, rounding: 10, padding: 16, border: 8 }, ['buttonClass']);
		this.controller.activateUi.bind(this.controller)();
	}
	trialPrompt() {
		sayTryAgain();
		showFleetingMessage('Try again!', 0, { fg: 'white' });
		TOMain = setTimeout(() => { Pictures.map(x => mAppend(this.dWordArea, iDiv(x))); }, 1200);
		return 1500;
	}
	eval() {
		let words = [];
		for (const cont of this.containers) {
			let d = iDiv(cont);
			//console.log('cont',cont);
			let ch = d.firstChild;
			//console.log('ch',ch);
			if (ch && isdef(ch.firstChild)) {
				words.push(ch.firstChild.innerHTML);
			} else break;
			//this.containers.map(x => iDiv(x).firstChild.firstChild.innerHTML).join(' ');
		}
		let answer = words.join(' ');
		//console.log('answer is', answer);
		let isCorrect = false;
		for (const sent of this.sentenceList) {
			let variant = sent.join(' ');
			//console.log('variant', variant);
			if (answer == variant) isCorrect = true;
		}

		Selected = { piclist: Pictures, feedbackUI: Pictures.map(x => iDiv(x)), sz: getRect(iDiv(Pictures[0])).h + 10 };
		return isCorrect;
	}

}
class GSteps extends Game {
	constructor(name, o) { super(name, o); }
	startGame() { this.correctionFunc = showCorrectWords; }
	start_Level() {
		super.start_Level();
		this.keys = this.keys.filter(x => containsColorWord(x));
	}

	prompt() {
		this.piclist = [];
		let colorKeys = this.numColors > 1 ? choose(this.colors, this.numColors) : null;
		let bg = this.numColors > 1 || this.numRepeat > 1 ? 'white' : 'random';
		let rows = this.numColors > 1 ? this.numColors : undefined;
		let showRepeat = this.numRepeat > 1;

		myShowPics(this.interact.bind(this), { bg: bg },// { contrast: this.contrast, },
			{ rows: rows, showRepeat: showRepeat, colorKeys: colorKeys, numRepeat: this.numRepeat, contrast: this.contrast });
		setMultiGoal(this.numSteps);
		let cmd = 'click';
		let spoken = [], written = [], corr = [];
		for (let i = 0; i < this.numSteps; i++) {
			let goal = Goal.pics[i];
			let sOrdinal = getOrdinal(goal.iRepeat);
			[written[i], spoken[i], corr[i]] = getOrdinalColorLabelInstruction(cmd, sOrdinal, goal.color, goal.label);
			goal.correctionPhrase = corr[i];
			cmd = 'then';
		}
		let sWritten = this.showVisualInstruction ? written.join('; ') : 'listen to instruction!';
		show_instruction(sWritten, dTitle, spoken.join('. '), { fz: 20 });
		this.controller.activateUi.bind(this.controller)();
	}
	trialPrompt() {
		sayTryAgain();
		showFleetingMessage(this.message, 0);
		return 1000;
	}
	activate() {
		for (const p of this.piclist) { toggleSelectionOfPicture(p); }
		this.piclist = [];

	}
	interact(ev) {
		ev.cancelBubble = true;
		if (!canAct()) { console.log('no act'); return; }
		let pic = findItemFromEvent(Pictures, ev);
		toggleSelectionOfPicture(pic, this.piclist);
		if (this.piclist.length == Goal.pics.length) {
			clearFleetingMessage();
			Selected = { piclist: this.piclist }; this.controller.evaluate.bind(this.controller)();
		}
	}
	eval() {
		Selected = { piclist: this.piclist, feedbackUI: this.piclist.map(x => iDiv(x)), sz: getRect(iDiv(this.piclist[0])).h };
		let isCorrect = true;
		this.message = this.language == 'D' ? 'beachte die REIHENFOLGE!' : 'mind the ORDER!';
		for (let i = 0; i < this.piclist.length; i++) {
			let p = this.piclist[i];
			if (!Goal.pics.includes(p)) this.message = this.language == 'D' ? 'noch einmal!' : 'try again!';
			if (this.piclist[i] != Goal.pics[i]) isCorrect = false;
		}
		return isCorrect;
	}
}
function ensureDictionary(){
	if (nundef(Dictionary)) { Dictionary = { E: {}, S: {}, F: {}, C: {}, D: {} } };
	for (const k in Syms) {
		for (const lang of ['E', 'D', 'F', 'C', 'S']) {
			let w = Syms[k][lang];
			if (nundef(w)) continue;
			Dictionary[lang][w.toLowerCase()] = Dictionary[lang][w.toUpperCase()] = k;
		}
	}

}
class GSwap extends Game {
	constructor(name, o) {
		super(name, o);
		if (this.language == 'C') { this.prevLanguage = this.language; this.language = chooseRandom('E', 'D'); }
		ensureDictionary();
	}
	startGame() { this.correctionFunc = showCorrectLabelSwapping; } //this.successFunc = showCorrectLabelSwapping;  }
	clear() { super.clear(); if (isdef(this.prevLanguage)) this.language = this.prevLanguage; }
	start_Level() {
		this.keys = setKeysG(this, filterWordByLengthG, 25);
		if (this.keys.length < 25) { this.keys = setKeysG(this, filterWordByLengthG, 25, 'all'); }
		this.trials = 2;
	}
	dropHandler(source, target, isCopy = false, clearTarget = false) {
		let prevTarget = source.target;
		source.target = target;
		let dSource = iDiv(source);
		let dTarget = iDiv(target);
		if (clearTarget) {
			//if this target is empty, remove _
			let ch = dTarget.children[0];
			let chSource = firstCond(Pictures, x => iDiv(x) == ch);
			if (chSource) {
				if (isdef(prevTarget)) {
					mAppend(iDiv(prevTarget), ch);
					chSource.target = prevTarget;
				} else {
					mAppend(this.dWordArea, ch);
					delete chSource.target;
				}
			}
			clearElement(dTarget);

			//find out previous target! (parentNode of dSource in a drop target?)
		}
		if (isCopy) {
			let dNew = mText(dSource.innerHTML, dTarget, { wmin: 100, fz: 20, padding: 4, margin: 4, display: 'inline-block' });
			addDDSource(dNew, isCopy, clearTarget);
		} else {
			mAppend(dTarget, dSource);
		}
	}
	prompt() {
		// showInstruction('', 'swap letter to form words', dTitle, true);
		show_instruction('swap letter to form words', dTitle, 'swap letter to form words');
		mLinebreak(dTable);

		let fz = 32;
		let options = _simpleOptions({ language: this.language, w: 200, h: 200, keySet: this.keys, luc: 'u', fz: fz, bg: 'random', fg: 'white', showLabels: true });

		let n = 2;
		let items = gatherItems(n, options); // items haben jetzt swaps dictionary

		let style = { margin: 3, cursor: 'pointer', fg: 'white', display: 'inline', bg: '#00000020', align: 'center', border: 'transparent', outline: 'none', family: 'Consolas', fz: 80 };
		for (const item of items) {
			let d1 = item.container = mDiv(dTable, { hmin: 250 });
			let d = iLetters(item.label, d1, style); //statt makeItemDiv
			iAdd(item, { div: d }); //this is the item's standard div now!
			let letters = item.letters = [];
			for (let i = 0; i < arrChildren(d).length; i++) {
				let ch = d.children[i];
				let l = {
					itemId: item.id, div: ch, i: i, letter: ch.innerHTML,
					swapInfo: item.swaps[i],
					state: 'swapped',
					isBlinking: false, fg: 'white', bg: 'transparent'
				};
				letters.push(l);
				ch.onclick = () => { startBlinking(l, item.letters, true) };
			}
			mStyle(d, { margin: 35 });
			delete item.swaps;
		}

		showPictureHints(Pictures, 'container');

		mLinebreak(dTable, 50);
		this.buttonDone = mButton('Done!', () => {
			if (!canAct()) return;
			for (let i = 0; i < Pictures.length; i++) {
				let p = Pictures[i];
				let blinking = getBlinkingLetter(p);
				//console.log('blinking',blinking);
				if (!blinking) {
					let msg = 'You need to pick 1 letter to swap in EACH word!!!';
					Speech.say(msg);
					sayRandomVoice(msg);
					showFleetingMessage('You need to pick 1 letter to swap in EACH word!!!', 0, { fz: 30 });
					return;
				}
			}
			this.controller.evaluate.bind(this.controller)();
		}, dTable, { fz: 28, matop: 10, rounding: 10, padding: 16, border: 8 }, ['buttonClass']);
		this.controller.activateUi.bind(this.controller)();

	}
	trialPrompt() {
		if (this.trialNumber % 2 == 0) showPictureHints(Pictures, 'container'); else showTextHints(Pictures, 'container', 'origLabel');
		TOMain = setTimeout(() => {
			for (const p of Pictures) {
				for (const l of p.letters) {
					l.state = 'swapped';
					if (isdef(l.swapInfo)) {
						//console.log('need to correct:', l);
						iDiv(l).innerHTML = p.label[l.i];
					}
				}
			}
		}, 1500);
		return 1800;
	}
	activate() {
		//this.buttonDone.style.opacity = 1;
		//console.log('trialNumber', this.trialNumber)
		if (this.trialNumber >= 1) { sayTryAgain(); showFleetingMessage('Try again!'); }
		else { showFleetingMessage('click one letter in each word!'); }
	}
	eval() {
		let n = Pictures.length;
		let blinkInfo = this.blinkInfo = [];

		clearFleetingMessage();
		for (let i = 0; i < n; i++) {
			let p = Pictures[i];
			let blinking = getBlinkingLetter(p);
			blinkInfo.push({ i: i, blinking: blinking });
		}
		//console.log('blinking', blinkInfo.map(x => x.blinking));
		for (let i = 0; i < n; i++) { let l = blinkInfo[i].blinking; if (!l) continue; stopBlinking(l); }
		for (const blinki of blinkInfo) { if (!blinki.blinking) { return false; } }

		let isCorrect = true;

		//swap letters first
		for (let i = 0; i < n; i++) {
			let b1 = blinkInfo[i].blinking;
			let b2 = blinkInfo[(i + 1) % blinkInfo.length].blinking;
			let item = Items[b1.itemId];
			let item2 = Items[b2.itemId];
			let l = item.letters[b1.i];
			let sw = l.swapInfo;
			if (nundef(sw)) { sw = l.swapInfo = { correct: { itemId: item.id, index: b1.i, l: b1.letter } }; }
			sw.temp = { itemId: item2.id, index: b2.i, l: b2.letter };
			item.testLabel = replaceAtString(item.label, b1.i, b2.letter);
			iDiv(l).innerHTML = b2.letter;
			l.state = 'temp';
		}

		//replacements sind gemacht
		for (const p of Pictures) { if (p.testLabel != p.origLabel) { isCorrect = false; } }

		let feedbackList = [];
		for (let i = 0; i < n; i++) {
			let item = Pictures[i];
			let d;
			if (isCorrect) d = iDiv(item.letters[item.iLetter]);
			else {
				let iLetter = blinkInfo[i].blinking.i;
				if (item.iLetter != iLetter) d = iDiv(item.letters[iLetter]);
			}
			if (isdef(d)) feedbackList.push(d);
		}

		//console.log('correct?',isCorrect)
		Selected = { piclist: Pictures, feedbackUI: feedbackList, sz: getRect(iDiv(Pictures[0])).h, delay: 800 };
		return isCorrect;
	}
}
class GTouchColors extends Game {
	constructor(name, o) { super(name, o); }
	start_Level() {
		super.start_Level();
		this.keys = this.keys.filter(x => containsColorWord(x));
	}
	prompt() {
		let colorKeys = choose(this.colors, this.numColors);
		let rows = this.numColors;
		let showLabels = this.lang == 'C' || this.showLabels;
		console.log('showLabels', showLabels);
		myShowPics(this.controller.evaluate.bind(this.controller), { bg: 'white' }, { showLabels: showLabels, colorKeys: colorKeys, rows: rows });
		if (this.shuffle == true) {
			let dParent = iDiv(Pictures[0]).parentNode;
			shuffleChildren(dParent);
		}
		setGoal(randomNumber(0, Pictures.length - 1));
		let [written, spoken] = getOrdinalColorLabelInstruction('click'); //getColorLabelInstruction('click');
		show_instruction(written, dTitle, spoken);
		this.controller.activateUi.bind(this.controller)();
	}
	eval(ev) {
		ev.cancelBubble = true;
		let item = findItemFromEvent(Pictures, ev);
		Selected = { answer: item.label, reqAnswer: Goal.label, pic: item, feedbackUI: iDiv(item) };
		if (item == Goal) { return true; } else { return false; }
	}
}
class GTouchPic extends Game {
	constructor(name, o) { super(name, o); }
	prompt() {
		myShowPics(this.controller.evaluate.bind(this.controller), {}, { showLabels: (this.lang == 'C' || this.showLabels) });
		setGoal();

		//showInstruction(Goal.label, 'click', dTitle, true);
		let wr = 'click ';
		show_instruction(wr + `<b>${Goal.label.toUpperCase()}</b>`, dTitle, Goal.label);
		// show_click_vocab();

		this.controller.activateUi.bind(this.controller)();
	}
}
class GWritePic extends Game {
	constructor(name, o) { super(name, o); }
	startGame() {
		this.correctionFunc = showCorrectWordInTitle;
		onkeydown = ev => {
			if (!canAct()) return;
			if (isdef(this.inputBox)) { this.inputBox.focus(); }
		}
	}
	start_Level() {
		this.keys = setKeysG(this, filterWordByLengthG, 25);
		if (this.keys.length < 25) { this.keys = setKeysG(this, filterWordByLengthG, 25, 'all'); }
	}
	prompt() {
		let showLabels = this.showLabels == true && this.labels == true;
		myShowPics(() => mBy(this.defaultFocusElement).focus(), {}, { showLabels: showLabels });
		setGoal();

		if (this.instruction == 'all') {
			// showInstruction(Goal.label, this.language == 'E' ? 'type' : "schreib'", dTitle, true);
			let wr = (this.language == 'E' ? 'type ' : "schreib' ");
			show_instruction(wr + `<b>${Goal.label.toUpperCase()}</b>`, dTitle, wr + Goal.label);
		} else if (this.instruction == 'spokenGoal') {
			let wr = this.language == 'E' ? 'type the correct word' : "schreib' das passende wort";
			let sp = (this.language == 'E' ? 'type' : "schreib'") + ' ' + Goal.label;
			// showInstruction('', wr, dTitle, true, sp);
			show_instruction(wr, dTitle, sp);
		} else {
			let wr = this.language == 'E' ? 'type the correct word' : "schreib' das passende wort";
			// showInstruction('', wr, dTitle, true, wr);
			show_instruction(wr, dTitle, wr);
		}

		mLinebreak(dTable, 20);
		this.inputBox = addNthInputElement(dTable, this.trialNumber);
		this.defaultFocusElement = this.inputBox.id;

		this.controller.activateUi.bind(this.controller)();
	}
	trialPrompt() {
		sayTryAgain();
		let n = this.trialNumber == 1 ? 1 : (this.trialNumber + Math.floor((Goal.label.length - this.trialNumber) / 2));
		showFleetingMessage(Goal.label.substring(0, n));
		mLinebreak(dTable);
		this.inputBox = addNthInputElement(dTable, this.trialNumber);
		this.defaultFocusElement = this.inputBox.id;
		return 10;
	}
	activate() {
		this.inputBox.onkeyup = ev => {
			if (!canAct()) return;
			if (ev.key === "Enter") {
				ev.cancelBubble = true;
				this.controller.evaluate.bind(this.controller)(ev);
			} //else if (!isLetter(ev.key) && ![' ', '-', '_'].includes(ev.key)) return;
		};
		this.inputBox.focus();
	}
	eval(ev) {
		let answer = normalize(this.inputBox.value, this.language);
		let reqAnswer = normalize(Goal.label, this.language);
		let correctPrefix = this.correctPrefix = getCorrectPrefix(Goal.label, this.inputBox.value);
		Selected = { reqAnswer: reqAnswer, answer: answer, feedbackUI: iDiv(Goal) };
		if (answer == reqAnswer) { showFleetingMessage(Goal.label); return true; }
		else { return false; }
	}
}
class GameTimed extends Game{
	constructor(name, o) { super(name, o); }
	clear() { clearInterval(this.TOI); super.clear(); this.timer = null; }
	makeTimer() {
		this.timer = true;
		if (nundef(this.msTotal)) this.msTotal = 5000;
		if (nundef(this.msInterval)) this.msInterval = 100;
		let w = this.wTimerOuter = 200;
		this.dTimeOuter = mDiv(dTable, { w: w, h: 25, border: 'white', rounding: 10, position: 'relative' });
		[this.wTimer, this.r, this.g] = [0, 0, 255];
		this.dTimeInner = mDiv(this.dTimeOuter, { h: 25, w: this.wTimer, rounding: 10, bg: `rgb(${this.r},${this.g},0)`, position: 'absolute', left: 0, top: 0 });
		this.dTimeDisplay = mDiv(this.dTimeOuter, { patop: 2, align: 'center', h: 25, w: w, position: 'absolute', left: 0, top: 0 });

		mLinebreak(dTable);
		this.dPause = mDiv(dTable, { cursor: 'pointer', fz: 12, hpadding: 30, vpadding: 10 }, null, 'click to pause');
		this.dPause.onclick = () => this.pause();

	}
	pause() {
		if (nundef(this.timer)) return;
		clearInterval(this.TOI);
		this.dPause.innerHTML = 'click to resume...';
		this.dPause.onclick = () => this.resume();
		// showActiveMessage('click to resume...', () => this.resume());
	}
	resume() {
		if (nundef(this.timer)) return;
		this.dPause.innerHTML = 'click to pause...';
		this.dPause.onclick = () => this.pause();
		//showActiveMessage('click to pause...', () => this.pause());
		this.TOI = setInterval(this.onTick.bind(this), this.msInterval);
	}
	activate() {
		if (nundef(this.timer)) return;
		//kann ich den timer irgendwie anders machen?
		this.msLeft = valf(this.msTotal, 10000);
		this.dTimeDisplay.innerHTML = timeConversion(this.msLeft, 'sh');
		this.TOI = setInterval(this.onTick.bind(this), this.msInterval);
		// showActiveMessage('click to pause...', () => this.pause());
	}
	onTick() {
		//console.log('noch', this.secsLeft, 'seconds!');
		this.msLeft -= this.msInterval;
		this.wTimer += this.wTimerOuter * this.msInterval / this.msTotal;
		let inc_color = 255 * this.msInterval / this.msTotal; // 25
		this.r += inc_color; this.g -= inc_color;
		//console.log('w',this.wTimer,inc_color);

		mStyle(this.dTimeInner, { w: this.wTimer, bg: `rgb(${this.r},${this.g},0)` });
		this.dTimeDisplay.innerHTML = timeConversion(this.msLeft, 'sh');

		if (this.msLeft < 100) {
			//console.log('TIME UP!!!');
			clearInterval(this.TOI);
			this.dPause.style.opacity = 0;

			this.onTimeup();
		}
	}
}
class GSpotit extends GameTimed {
	constructor(name, o) { super(name, o); }
	startGame() { this.correctionFunc = showCorrectUis; }
	start_Level() {
		super.start_Level();
		this.colarr = _calc_hex_col_array(this.rows, this.cols);
		let perCard = arrSum(this.colarr);
		this.nShared = (this.numCards * (this.numCards - 1)) / 2;
		this.nUnique = perCard - this.numCards + 1;
		this.numKeysNeeded = this.nShared + this.numCards * this.nUnique;
		this.keys = setKeysG(this, (_, x) => !x.includes(' '), this.numKeysNeeded + 1);
		//this.keys = oneWordKeys(this.keys); 
	}
	deal() {
		let keys = choose(this.keys, this.numKeysNeeded);
		let dupls = keys.slice(0, this.nShared); //these keys are shared: cards 1 and 2 share the first one, 1 and 3 the second one,...
		let uniqs = keys.slice(this.nShared);
		//console.log('numCards', numCards, '\nperCard', perCard, '\ntotal', keys.length, '\ndupls', dupls, '\nuniqs', uniqs);

		let infos = [];
		for (let i = 0; i < this.numCards; i++) {
			let keylist = uniqs.slice(i * this.nUnique, (i + 1) * this.nUnique);
			//console.log('card unique keys:',card.keys);
			let info = { id: getUID(), shares: {}, keys: keylist, rows: this.rows, cols: this.cols, colarr: this.colarr };
			infos.push(info);
		}

		let iShared = 0;
		for (let i = 0; i < this.numCards; i++) {
			for (let j = i + 1; j < this.numCards; j++) {
				let c1 = infos[i];
				let c2 = infos[j];
				let dupl = dupls[iShared++];
				c1.keys.push(dupl);
				c1.shares[c2.id] = dupl;
				c2.shares[c1.id] = dupl;
				c2.keys.push(dupl);
				//each gets a shared card
			}
		}


		for (const info of infos) { shuffle(info.keys); }
		return infos;
	}
	interact(ev) {
		ev.cancelBubble = true;
		if (!canAct()) { console.log('no act'); return; }

		let keyClicked = evToProp(ev, 'key');
		let id = evToId(ev);

		if (isdef(keyClicked) && isdef(Items[id])) {
			this.pause();
			let item = Items[id];
			//console.log('clicked key', keyClicked, 'of card', id, item);
			if (Object.values(item.shares).includes(keyClicked)) {
				//console.log('success!!!');//success!
				//find the card that shares this symbol!
				let otherCard = spotitFindCardSharingSymbol(item, keyClicked);
				//console.log('otherCard', otherCard);
				let cardSymbol = ev.target;
				let otherSymbol = spotitFindSymbol(otherCard, keyClicked);
				//console.log('otherSymbol', otherSymbol);
				//mach die success markers auf die 2 symbols!
				Selected = { isCorrect: true, feedbackUI: [cardSymbol, otherSymbol] };

			} else {
				//console.log('fail!!!!!!!!'); //fail
				let cardSymbol = ev.target;
				Selected = { isCorrect: false, feedbackUI: [cardSymbol], correctUis: this.getSharedSymbols(), correctionDelay: this.items.length * 1500 };

			}
			this.controller.evaluate.bind(this.controller)();
		}
	}
	getSharedSymbols() {
		let result = [];
		for (const item of this.items) {
			for (const id in item.shares) {
				let k = item.shares[id];
				let ui = iGetl(item, k);
				result.push(ui);
			}
		}
		return result;
	}
	eval() { return Selected.isCorrect; }
	prompt() {
		this.trials = 1;
		show_instruction('find common symbol', dTitle);

		//this.makeTimer();

		mLinebreak(dTable, 25);

		let infos = this.deal(); //backend

		//frontend
		let items = this.items = [];
		for (const info of infos) {
			let item = spotitCard(info, dTable, { margin: 10 }, this.interact.bind(this));
			items.push(item);
		}

		this.controller.activateUi.bind(this.controller)();
	}
	activate(){}
	onTimeup() {
		Selected = { isCorrect: false, correctUis: this.getSharedSymbols(), correctionDelay: this.items.length * 2000 };
		this.controller.evaluate.bind(this.controller)();
	}
}
class GMissingNumber extends Game {
	constructor(name, o) { super(name, o); }
	startGame() {
		this.successFunc = successThumbsUp;
		this.failFunc = failThumbsDown;
		this.correctionFunc = this.showCorrectSequence.bind(this);
	}
	showCorrectSequence() { return numberSequenceCorrectionAnimation(getNumSeqHint); }
	start_Level() {
		if (!isList(this.steps)) this.steps = [this.steps];
		this.numPics = 2;
		this.labels = false;
	}
	prompt() {
		mLinebreak(dTable, 12);
		showHiddenThumbsUpDown(110);
		mLinebreak(dTable);

		this.step = chooseRandom(this.steps);
		this.op = chooseRandom(this.ops);
		this.oop = OPS[this.op];
		this.seq = createNumberSequence(this.seqLen, this.minNum, this.maxNum, this.step, this.op);
		[this.words, this.letters] = showNumberSequence(this.seq, dTable);
		setNumberSequenceGoal();

		mLinebreak(dTable);

		let instr1 = (this.language == 'E' ? 'complete the sequence' : "ergänze die reihe");
		// showInstruction('', instr1, dTitle, true);
		show_instruction(instr1, dTitle, instr1);

		if (this.showHint) {
			hintEngineStart(getNumSeqHintString, [0, 1, 2, 3, 4], 5000 + this.level * 1000);
		}

		this.controller.activateUi.bind(this.controller)();
	}
	trialPrompt() {
		let hintlist = this.trialNumber >= 4 ? [this.trialNumber] : range(this.trialNumber, 4);
		if (this.showHint) hintEngineStart(getNumSeqHintString, hintlist, 3000 + this.level * 1000);
		TOMain = setTimeout(() => getWrongChars().map(x => unfillChar(x)), 500);
		return 600;
	}
	activate() { addKeyup('G', this.interact.bind(this)); }
	interact(ev) {
		if (!isNumber(ev.key) && ev.key != '-') return;
		//console.log('key',ev.key,'\nkeyCode',ev.keyCode);
		//console.log('key!');
		clearFleetingMessage();
		if (!canAct()) return;

		let sel = Selected = onKeyWordInput(ev);
		if (nundef(sel)) return;
		//console.log('===>', sel);

		//target,isMatch,isLastOfGroup,isVeryLast,ch
		let lastInputCharFilled = sel.target;
		console.assert(sel.isMatch == (lastInputCharFilled.letter == sel.ch), lastInputCharFilled, sel.ch);

		//all cases aufschreiben und ueberlegen was passieren soll!
		//TODO: multiple groups does NOT work!!!
		if (sel.isMatch && sel.isVeryLast) {
			deactivateFocusGroup();
			this.controller.evaluate.bind(this.controller)(true);
		} else if (sel.isMatch && sel.isLastOfGroup) {
			//it has been filled
			//remove this group from Goal.blankWords
			sel.target.isBlank = false;
			sel.target.group.hasBlanks = false;
			removeInPlace(Goal.blankWords, sel.target.group);
			removeInPlace(Goal.blankChars, sel.target);
			deactivateFocusGroup();
			console.log('haaaaaaaaaaaalo', Goal.isFocus)
			//console.log('=>', Goal)
		} else if (sel.isMatch) {
			//a partial match
			removeInPlace(Goal.blankChars, sel.target);
			sel.target.isBlank = false;
		} else if (sel.isVeryLast) {
			Selected.words = getInputWords();
			Selected.answer = getInputWordString();
			Selected.req = getCorrectWordString();
			deactivateFocusGroup();
			//console.log('LAST ONE WRONG!!!')
			this.controller.evaluate.bind(this.controller)(false);
			//user entered last missing letter but it is wrong!
			//can there be multiple errors in string?
		} else if (sel.isLastOfGroup) {
			//unfill last group

			Selected.words = getInputWords();
			Selected.answer = getInputWordString();
			Selected.req = getCorrectWordString();
			deactivateFocusGroup();
			this.controller.evaluate.bind(this.controller)(false);
			//user entered last missing letter but it is wrong!
			//can there be multiple errors in string?
		} else {
			if (!this.silent) { writeSound(); playSound('incorrect1'); }
			deactivateFocusGroup();
			//unfillCharInput(Selected.target);
			showFleetingMessage('does NOT fit: ' + Selected.ch, 0, { fz: 24 });
			setTimeout(() => unfillCharInput(Selected.target), 500);
		}
	}

	eval(isCorrect) { return isCorrect; }
}

//#region programming game
class GProg extends Game {
	constructor(name, o) { super(name, o); }

	prompt() {

		let c = this.card = cRound(dTable); //cPortrait(dTable);
		let d = c.visual = iDiv(c);

		visualPropertySetter(this.card);
		visualAttributeSetter(this.card);

		d.innerHTML = 'HALLO';
		mStyle(d, { fg: 'blue' });

		//show_instruction('write code what rank and suit this card should have', dTitle);

		mLinebreak(dTable, 25);

		this.ta = this.createTextArea();

		this.ta.value = `mCenterCenterFlex(card.visual);`; // console.log(card.bg);`; //7 NO

		mLinebreak(dTable, 25);

		mButton('run', this.runCode.bind(this), dTable, { bg: 'skyblue', fg: 'black', fz: 32 }, 'mybutton');

		//console.log('type of style', typeof this.card1);


	}
	runCode() {
		let code = this.ta.value;

		let prelim = ''; //prefix a context
		//10
		prelim = 'let card = this.card;'; //add context: 6

		code = prelim + code;
		//console.log('code', code);

		eval(code);
	}
	createTextArea() {
		let dCode = mDiv(dTable, {});
		let ta = this.ta = mCreate('textarea');
		mAppend(dCode, ta);
		ta.setAttribute('rows', 10);
		ta.setAttribute('cols', 60);
		mStyle(ta, { family: 'courier', padding: 10 });
		return ta;
	}
}
function propertyGiverW0(o, prop, setter) {
	//usage: // propertyGiverW0(c, 'color', x=>G.style.background = x); //YES!
	Object.defineProperty(o, prop, {
		get: function () { return this.val; },
		set: function (val) { setter(val); }
		// set: function (val) { console.log('this',this); this.val = val; setter(val); }
	});
}
function propertyGiver(o, prop, setter, getter) {
	//usage: // propertyGiverW0(c, 'color', x=>G.style.background = x); //YES!
	Object.defineProperty(o, prop, {
		get: function () { return getter(); },
		set: function (val) { setter(val); }
		// set: function (val) { console.log('this',this); this.val = val; setter(val); }
	});
}
function visualPropertySetter(c) {
	let props = 'bg fg h w background color height width rounding padding fz font align';
	for (const k of props.split(' ')) {
		//propertyGiverW0(c, k, x => { let styles = {}; styles[k] = x; mStyle(c.visual, styles); });
		propertyGiver(c, k,
			x => { let styles = {}; styles[k] = x; mStyle(c.visual, styles); },
			() => { return mGetStyle(c.visual, k); }
		);
	}
	//propertyGiverW0(c, 'bg', x => { mStyle(G.visual, { 'bg': x }); }); //YES!!
}
function visualAttributeSetter(c) {
	let props = 'innerHTML onclick';
	for (const k of props.split(' ')) {
		// propertyGiverW0(c, k, x => c.visual[k] = x);
		propertyGiver(c, k, x => c.visual[k] = x, () => c.visual[k]);
	}
	//propertyGiverW0(c, 'bg', x => { mStyle(G.visual, { 'bg': x }); }); //YES!!
}

//#endregion

//#region aristo
class GAristo extends GMinimalGame {
	constructor(name, o) { super(name, o); }
	startGame(fen) {
		//testFindKeys();testInno();
		//testInnoMain();
		//symbolMeasuring();

		//testBirdCards(); //ok
		//test52CardsOther(); //ok
		//testCard52Cards();

		if (nundef(fen)) { fen = G.START_FEN = this.default_start_fen(); }
		this.parse_fen(fen);
		return;
		// this.gamify();

		// let d1 = mDiv(dTable, { w: '50%', float: 'left' });
		// presentNode(this, 'G', d1, ['draw_pile', 'market', 'buy', 'discard_pile', 'numPlayers'], [], [], ['controller', 'deck']);
		// let d2 = mDiv(dTable, { w: '50%' });
		// presentNode(Items, 'Items', d2);
		// return;

		let n = this.nOthers = 2; chooseRandom(this.numPlayers);

		let me = this.me = gameItem(Username).id;
		let others = this.others = []; for (let i = 0; i < n; i++) others.push(gameItem(randomName()).id);
		let allPlayers = this.allPlayers = [me].concat(others);
		let world = this.world = gameItem('world'); // mItem('world',null,{ color: randomColor(), name:'world' });
		let market = this.market = gameItem('market'); // mItem('market',null,{ color: randomColor(),name:'market' });
		let draw_pile = this.draw_pile = gameItem('draw pile'); // mItem(name2id(''),null, { color: randomColor(),name:'draw pile' });
		let buy_cards = this.buy_cards = gameItem('buy cards'); // mItem('buy_cards',null,{ color: randomColor(),name:'buy cards' });
		let discard_pile = this.discard_pile = gameItem('discard pile'); // mItem('discard_pile',null,{ color: randomColor(),name:'discard pile' });
		let phase = this.phase = 'king';
		let turn = chooseRandom(allPlayers);

		aristoGame1(this); //, GC.evaluate.bind(GC));
	}

	cards_to_string(cards) { return cards.map(x => x.toString).join('_'); } //eg. 1_103_34
	deal_hand() { let h = this.deck.deal(this.HAND_SZ); this.draw_pile = this.deck.cards(); return h; }
	deal_glob() {
		this.phase = 'king'; //phase king
		this.deck = new Deck('52_double');
		this.cards = this.deck.cards().map(x => gameItem(x));
		this.market = this.deck.deal(this.MARKET_SZ);
		this.draw_pile = this.deck.cards(); //.join(' ');
		this.buy = [];
		this.discard_pile = [];
	}
	//opt: numplayers ranks suits jokers vp handsz marketsz buysz farmsz estatesz chateausz coins
	default_start_fen() {
		//opt: numplayers ranks suits jokers vp handsz marketsz buysz farmsz estatesz chateausz coins
		let fen = '5 13 8 0 6 7 3 4 4 5 6 3';
		return fen;
	}
	gamify() {

	}
	make_aristocracy_card(i) {
		if (i < this.DECK_SZ - this.JOKERS) {
			//das wird eine normale karte
			let rank = i % this.RANKS;
			let suit = Math.floor(i / this.RANKS) % 4;


			//wie mach ich so eine card? hier war ich!
		}
		// let rank = i %
	}
	parse_fen(fen) {
		//opt:glob:pl1:pl2:...
		let parts = fen.split(':');
		let opt = parts[0];
		let glob = parts.length > 1 ? parts[1] : null;
		let pls = [];
		for (let i = 2; i < parts.length; i++) {
			pls.push(parts[i]);
		}

		//parse each part!
		//opt: numplayers ranks suits jokers vp handsz marketsz buysz farmsz estatesz chateausz coins
		let opts = opt.split(' ');
		this.NUMPLAYERS = Number(opts[0]);
		this.RANKS = Number(opts[1]);
		this.SUITS = Number(opts[2]); // not including jokers!
		this.JOKERS = Number(opts[3]);
		this.VP = Number(opts[4]);
		this.HAND_SZ = Number(opts[5]);
		this.MARKET_SZ = Number(opts[6]);
		this.BUY_SZ = Number(opts[7]);
		this.FARM_SZ = Number(opts[8]);
		this.ESTATE_SZ = Number(opts[9]);
		this.CHATEAU_SZ = Number(opts[10]);
		this.COINS = Number(opts[11]);
		this.DECK_SZ = this.RANKS * this.SUITS + this.JOKERS;

		//make a deck and card objects first!
		let deck = this.deck = new Deck();
		deck.initNumber(this.DECK_SZ);
		this.cards = [];
		for (const x of deck.cards()) {
			let c = this.make_aristocracy_card(x);
		}
		//return mItem(name2id(name), null, { color: isdef(color) ? color : randomColor(), name: name },false); }


		//everything that has not been set will be set randomly according to basic variables
		//separator for list of cards is '_'
		//glob: herald phase turn draw market buy discard
		return; //********************************************************************************* */
		if (glob) {
			let globs = glob.split(' ');
			this.herald = globs[0]; //string eg. 'a'
			this.phase = globs[1]; // k | q | j
			this.turn = globs[2]; // letters a .. z (as many players)
			this.draw = parse_cards(globs[3]);
			this.market = parse_cards(globs[4]);
			this.buy = parse_cards(globs[5]);
			this.discard = parse_cards(globs[6]);
		} else {
			this.deal_glob();
		}

		let have_player_data = pls.length > 0;
		this.players = [];
		if (have_player_data) {
			for (let i = 0; i < pls.length; i++) {
				let pl = parse_player(pls[i]);
				this.players.push(pl);
			}
		} else {
			for (let i = 0; i < this.NUMPLAYERS; i++) {
				let pl = {
					coins: this.COINS,
					hand: this.deal_hand(),
				};
				this.players.push(pl);
			}
		}
		ensure_player_id_name_index_type_color(this.players);

	}
	parse_cards(s) { return s.split('_').map(x => Number(x)); }//=>list of numbers


}


function aristoGame1(g) {
	let phase = g.phase = 'king'; //phase king
	let players = g.allPlayers;

	let i = 0; players.map(x => x.index = i++);
	let indices = players.map(x => x.index);

	let me = g.me;
	let others = g.others;
	let market = g.market;
	let buy_cards = g.buy_cards;

	let draw_pile = g.draw_pile; draw_pile.type = 'deck';
	let deck = draw_pile.deck = new Deck();
	deck.init52_double(); //console.log('deck', deck);

	let discard_pile = g.discard_pile; discard_pile.type = 'deck';
	let discard = discard_pile.deck = new Deck();

	//each player gets 7 cards, 3 coin
	for (const pl of players) { pl.hand = deck.deal(7); pl.coins = 3; }

	market.cards = deck.deal(3); market.type = 'cards';	//market gets 3 cards
	buy_cards.cards = []; buy_cards.type = 'cards';	//market gets 3 cards

	let herald = g.herald = players[1];// chooseRandom(players);	//determine herald randomly
	//console.log('herald', herald.index);

	//calc player order for setup stalls (sitting order starting with herald)
	let heraldOrder = g.heraldOrder = arrCycle(indices, herald.index);
	//console.log('heraldOrder', heraldOrder);

	//ais before me setup stalls
	g.stallsHidden = true;
	for (const plIndex of heraldOrder) {
		if (plIndex == 0) break;
		let pl = players[plIndex];
		//console.log('build stall: pl', pl.name, me.name)

		aristoAIAction(pl, g, 'stall');
		//setup stall
	}

	//prompt: setup your stall
	aristoUi(dTable, g);
	dLineTopMiddle.innerHTML = 'choose your stall!';
	mButton('submit move', () => aristoUserAction(g, 'stall', aristoGame2), mBy('sidebar').firstChild, { w: 80, bg: g.color }, 'mybutton');

	//hand of player hasa to be activated!
	for (const card of g.me.handItems) {
		let d = iDiv(card);
		d.onclick = () => {
			if (card.isSelected) {
				card.isSelected = false;
				iDiv(card).style.transform = 'unset';
			} else {
				card.isSelected = true;
				iDiv(card).style.transform = 'translateY(-25px)';
			}
		}
	}
}

function aristoAIAction(pl, g, key) {
	if (key == 'stall') {
		let deck1 = new Deck(pl.hand);
		//console.log(deck1);
		pl.stall = deck1.deal(randomNumber(Math.min(2, deck1.count()), Math.min(5, deck1.count())));
		pl.hand = deck1.cards();
	}
}
function aristoUserAction(g, key, followFunc) {
	if (key == 'stall') {
		let me = g.me;
		let indices = arrIndices(me.handItems, x => x.isSelected);
		[me.stall, me.hand] = arrSplitByIndices(me.hand, indices);
		followFunc(g);
	}
}
function aristoAggregateVisible(g) {
	let result = [];
	let stalls = g.allPlayers.map(x => x.stall);
	result = arrFlatten(stalls).concat(g.market.cards);
	return result;

}
//onSubmit stall wird aristoGame2 aufgerufen!
function aristoGame2(g) {

	//ais after me setup stalls
	let heraldOrder = g.heraldOrder;
	let players = g.allPlayers;
	let me = g.me;

	let iNext = heraldOrder.indexOf(0) + 1;
	for (let i = iNext; i < heraldOrder.length; i++) {
		let plIndex = heraldOrder[i];
		let pl = players[plIndex];
		if (plIndex == 0) break;
		let deck1 = new Deck(pl.hand);
		pl.stall = deck1.deal(randomNumber(Math.min(2, deck1.count()), Math.min(5, deck1.count())));
		pl.hand = deck1.cards();
	}

	//turn around stalls
	g.stallsHidden = false;
	aristoUi(dTable, g);

	setTimeout(() => aristoGame3(g), 2000);
}
function aristoGame3(g) {

	let heraldOrder = g.heraldOrder;
	let players = g.allPlayers;
	let me = g.me;

	let stallOrder = g.stallOrder = calcStallOrder(players);
	players.map(x => x.nActions = x.stall.length);
	//console.log('stallOrder', stallOrder);

	//in stall order do your actions
	for (const plIndex of stallOrder) {
		let pl = players[1]; //plIndex]; //[0];
		console.log('player', pl.name, 'starts with', pl.nActions, 'actions, stall value is', pl.stallValue);
		//console.log('build stall: pl', pl.name, me.name)
		if (plIndex == 0) break;

		//continue;

		while (pl.nActions > 0) {
			//aiDoActions(pl,g);
			//simplest strategy: 
			// 1. correct schweinefarm
			// 2. build best building if can
			aristoBuild(pl, g);
			break;
		}
		console.log('player', pl.name, 'still has', pl.nActions, 'actions');
		//break;
	}


	aristoUi(dTable, g);
	return;

	//stalls are revealed and value calculated

	//determine player order: in order of stall value	
	//determine how many actions eahc player has

	//ais before me take actions
	//prompt: take actions
	//ais after me take actions

	//possible actions are:
	//1. build a farm or estate or chateau if King or king phase
	//2. upgrade building if King or king phase
	//3. buy if have jack or in jack phase
	//4. exchange card in one of own buildings
	//5. challenge a building if Queen or Queen phase
	//6. sell 2 cards for 1 coin
	//7.? anything else?

	//after all actions have been done: deal: 
	//1. market is discarded
	//2. each player gets 1 card

	//trasnfer phase:
	//King->Queen:
	// replenish 3
	// ball
	// finish game?
	//Queen->Jack
	// estate/chateau get coin
	// replenish to 4
	// auction
	//Jack->King
	// each farm 1 card
	// hand size to 7+ #chateaus
	// pass herald to next player
	console.log('Game', g);
}

//#region actions
function aristoBuild(pl, g) {
	let visToAll = aristoAggregateVisible(g);
	let visRanks = visToAll.map(x => x % 13);
	//console.log('visRanks', visRanks);
	let players = g.allPlayers;

	//1. build aggregate of all cards visible to this player
	let myVis = visToAll.concat(pl.hand);
	let myRanks = myVis.map(x => x % 13).sort();
	//console.log('player', pl, 'myRanks', myRanks);
	//myRanks.sort();
	//2. build buckets of same rank
	let rankCount = new Array(13).fill(0);
	for (let i = 0; i < myRanks.length; i++) { rankCount[myRanks[i]]++; }
	//console.log('rankCount',rankCount);

	let i = 0;
	let buckets = rankCount.map(x => ({ rank: i, count: rankCount[i++] }));

	//calc actionsNeeded to build a farm (or best possible group)
	//already have groups in my hand and market:
	//for(const )
	//myOnly = pl.hand.concat(pl.stall);
	myHandRanks = pl.hand.map(x => x % 13);
	myStallRanks = pl.stall.map(x => x % 13);

	nActions = pl.nActions = pl.stall.length; //number of actions available
	//console.log('I have', nActions, 'actions');

	//how many actions needed to build each bucket
	for (const b of buckets) {
		b.handCount = arrCount(myHandRanks, x => x == b.rank);
		b.stallCount = arrCount(myStallRanks, x => x == b.rank);
		b.actionsNeeded = b.count - b.handCount - b.stallCount + 1;
	}


	sortByDescending(buckets, 'count');

	//strategy boundary to build
	let boundaryToBuild = 3; //keine schweinefarmen! super ehrliche AI

	//moegliche farmen sind buckets die count=4 und actionsNeeded<=actions haben!
	let bucketsPossible = buckets.filter(x => x.count >= boundaryToBuild && x.actionsNeeded <= nActions);

	let canBuild = !isEmpty(bucketsPossible) && pl.coins > 0;


	//3. sort by group size
	//4. 
	//console.log('can build: ', bucketsPossible, canBuild);

	if (!canBuild) return false;

	//build erstbestes building
	let best = bucketsPossible[0];
	let rank = best.rank;

	//exchange a card from stall with one of another player or market
	while (best.actionsNeeded - 1 > 0) {
		let marketRanks = g.market.cards.map(x => x % 13);
		if (marketRanks.includes(rank)) {
			//console.log('found rank', rank, 'on market', marketRanks);
			let iSource = marketRanks.indexOf(rank);
			let elSource = g.market[iSource];
			let itemSource = g.marketItems[iSource];

			//pick some element from stall that has NOT rank rank
			let elTarget = firstCond(pl.stall, x => x % 13 != rank);
			let iTarget = pl.stall.indexOf(elTarget);
			// let itemTarget = pl.stallItems[iTarget];

			//exchange!!!!!
			g.market.cards[iSource] = pl.stall[iTarget];
			g.marketItems[iSource] = pl.stallItems[iTarget];

			pl.stall[iTarget] = elSource;
			pl.stallItems[iTarget] = itemSource;
			//console.log('exchanged with market!', g.market.cards.map(x => x % 13));

		} else {
			for (const other of players) {
				if (other == pl) continue;
				let stallRanks = other.stall.map(x => x % 13);
				//console.log('stallRanks',stallRanks);
				if (stallRanks.includes(rank)) {


					//console.log('found rank', rank, 'on player stall', other.name, '\nother', stallRanks, '\nme', jsCopy(pl.stall).map(x => x % 13));
					//console.log('')
					let iSource = stallRanks.indexOf(rank);
					let elSource = other.stall[iSource];
					let itemSource = other.stallItems[iSource];

					//pick some element from stall that has NOT rank rank
					let elTarget = firstCond(pl.stall, x => (x % 13) != rank);
					//console.log('I am giving him a', elTarget % 13);
					let iTarget = pl.stall.indexOf(elTarget);
					// let itemTarget = pl.stallItems[iTarget];

					//exchange!!!!!
					other.stall[iSource] = pl.stall[iTarget];
					other.stallItems[iSource] = pl.stallItems[iTarget];

					pl.stall[iTarget] = elSource;
					pl.stallItems[iTarget] = itemSource;

					//console.log('exchanged with!', other.name, other.stall.map(x => x % 13));
					break;

				}
			}
			best.actionsNeeded--;

		}
	}
	//build farm!
	console.log('building a farm of', rank);
	console.log('bucket', best);

	//identify the cards to be used for building!

	//from hand take all cards that are rank
	let handCards = pl.hand.filter(x => x % 13 == rank);
	console.log('handCards for this farm:', handCards);

	pl.hand = arrMinus(pl.hand, handCards);
	console.log('hand will be:', pl.hand);

	let stallCards = pl.stall.filter(x => x % 13 == rank);
	console.log('handCards for this farm:', stallCards);

	pl.stall = arrMinus(pl.stall, stallCards);
	console.log('stall will be:', pl.stall);

	let building = handCards.concat(stallCards);
	console.log('building:', building);
	lookupAddToList(pl, ['buildings'], building);

	pl.nActions -= best.actionsNeeded;
	//need to remove all 'rank' cards form hand and enough to complete from stall
	//if it is schweinefarm, need to add n more cards from hand!
	//let farm = [];
	//moveCardsFromTo(rank,pl.hand,farm);
	//moveCardsFromTo(rank,pl.stall,farm);
	//lookupAddToList(pl,['buildings','farms'],)

}

function moveCardsFromTo(cards, from, to) {
	//need to move the cards, need to move the items!
}

function identifyCardByRank(key, rank) {
	if (key == 'market') {

	}
}

function getItemOfSameIndexAsIn(val, arr, items) {
	let i = arr.indexOf(val);
	return items[i];
}

function aristoExchangeCard() { }
//#endregion actions
//#region helpers
function calcAristoHandValue(cards) {
	let ranks = cards.map(x => x % 13);
	let total = 0;
	for (const rank of ranks) { total += Math.min(10, rank + 1); }
	//console.log(cards,'ranks',ranks,total);
	return total;
}
function calcStallOrder(players) {
	for (const pl of players) {
		pl.stallValue = calcAristoHandValue(pl.stall);
		//console.log('pl',pl.name,'has',pl.stallValue);
	}

	//sort players by rankValue
	let stallOrder = players.map(x => ({ stallValue: x.stallValue, index: x.index }));
	let plSorted = sortBy(stallOrder, 'stallValue').map(x => x.index);
	//console.log(stallOrder,'plSorted',plSorted);

	return plSorted;
}
function ensure_player_id_name_index_type_color(pls) {
	let i = 0;
	pls.map(x => {
		x.id = getUID();
		x.name = (i == 0 ? Username : randomBotName()).toLowerCase();
		x.index = i;
		x.type = (i == 0 ? 'human' : 'ai');
		x.colorName = (i == 0 ? U.settings.userColor : Object.values(PlayerColors)[i]);
		x.color = (i == 0 ? U.settings.userColor : Object.keys(PlayerColors)[i]);
		i++;
	});
}
//#endregion helpers
//#endregion aristo


