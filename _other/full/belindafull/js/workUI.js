//#region instruction
function ani_say(d, fSpeak) {
	if (isdef(fSpeak)) fSpeak(); // sayRandomVoice(spoken);
	mClass(d, 'onPulse');
	setTimeout(() => mRemoveClass(d, 'onPulse'), 500);

}
function show_click_vocab() {
	//say something like: click APPLE

	let cmd = 'click';
	let vocab = Goal.label;
	let voice = G.language;
	let dParent = dTitle;
	let fz = 36;
	//console.log('cmd', cmd);	console.log('vocab', vocab);	console.log('voice', voice);

	let fSpeak = () => {
		Speech.say(cmd, 1, .8, .9, 'random', () => {
			Speech.say(vocab, 1, .8, .9, voice);
		}, 'E');
	};
	fSpeak();

	clearElement(dParent);
	let d = mDiv(dParent);
	mStyle(d, { margin: 15 })
	mClass(d, 'flexWrap');
	let msg = cmd + " " + `<b>${vocab.toUpperCase()}</b>`;
	if (nundef(fz)) fz = 36;
	let d1 = mText(msg, d, { fz: fz, display: 'inline-block' });

	let sym = symbolDict.speaker;
	let d2 = mText(sym.text, d, {
		fz: fz + 2, weight: 900, display: 'inline-block',
		family: sym.family, 'padding-left': 14
	});

	dFeedback = dInstruction = d;
	dInstruction.addEventListener('click', () => ani_say(dInstruction, () => {
		Speech.say(vocab, 1, .8, .9, voice);}));

}
//#endregion

//#region success failure correction
function success_pic_goal(withComment = true) {
	let lang = G.language;
	if (withComment && G.spokenFeedback) {
		const comments = {
			E: ['YEAH!', 'Excellent!!!', 'CORRECT!', 'Great!!!'],
			D: ['gut', 'Sehr Gut!!!', 'richtig!!', 'Bravo!!!'],
			S: ['bien', 'muy bien!!!', 'eccelente!!', 'bravo!!!'],
			F: ['bien', 'tres bien!!!', 'fantastique!!', 'bravo!!!', 'excellent!!!'],
			C: ['优秀', '好的!!!', '正确的!!', 'Bravo!!!'],
		}[lang];
		say(chooseRandom(comments), lang);
	}
	if (isdef(Selected) && isdef(Selected.feedbackUI)) {
		let uilist;
		if (isdef(Selected.positiveFeedbackUI)) uilist = [Selected.positiveFeedbackUI];
		else uilist = isList(Selected.feedbackUI) ? Selected.feedbackUI : [Selected.feedbackUI];
		let sz = getRect(uilist[0]).h;
		//console.log('in der succesfunc!!!!!!!', uilist)
		for (const ui of uilist) {
			let d = markerSuccess();
			//console.log('sz',sz,'ui',ui,'\nmarker',d);
			mpOver(d, ui, sz * (4 / 5), 'limegreen', 'segoeBlack');
		}
	}
}




function show_instruction_different(dParent, wlist, slist, styles) {

	wlist = [
		{ phrase: 'click', styles: { fg: 'red' } },
		{ phrase: 'tomato', styles: { fg: 'red' } },
	];
	slist = [
		{ phrase: 'click', voice: 'default', }
	];
	//show_instruction(sWritten, dTitle, sSpoken, { fz: 22, voice: 'zira' });
	//showInstruction(Goal.label, 'click', dTitle, true);
	console.assert(isdef(Speech));

	//console.assert(title.children.length == 0,'TITLE NON_EMPTY IN SHOWINSTRUCTION!!!!!!!!!!!!!!!!!')
	//console.log('G.id is', G.id)
	clearElement(dParent);
	let d = mDiv(dParent);
	mStyle(d, { margin: 15 })
	mClass(d, 'flexWrap');

	//old: combine cmd und special word
	let msg = cmd + " " + `<b>${text.toUpperCase()}</b>`;
	if (nundef(fz)) fz = 36;
	let d1 = mText(msg, d, { fz: fz, display: 'inline-block' });
	//new
	if (nundef(fz)) fz = 36;
	d1 = mText(written, d, { fz: fz, display: 'inline-block' });

	//old
	if (isSpoken) {
		let sym = symbolDict.speaker;
		let d2 = mText(sym.text, d, {
			fz: fz + 2, weight: 900, display: 'inline-block',
			family: sym.family, 'padding-left': 14
		});
	}
	dFeedback = dInstruction = d;
	spoken = isSpoken ? isdef(spoken) ? spoken : cmd + " " + text : null;
	dInstruction.addEventListener('click', () => aniInstruction(spoken));
	if (!isSpoken) return;
	sayRandomVoice(isdef(spoken) ? spoken : (cmd + " " + text), null, "david");

	//new
	let sym = symbolDict.speaker;
	let d2 = mText(sym.text, d, {
		fz: fz + 2, weight: 900, display: 'inline-block',
		family: sym.family, 'padding-left': 14
	});
	dFeedback = dInstruction = d;

	dInstruction.addEventListener('click', () => aniInstruction(spoken));
	if (isdef(spoken)) sayRandomVoice(spoken, spoken, voice);

}
function showWritten(cmd, vocab, dParent, styles) { }
function showSpoken() { }



















