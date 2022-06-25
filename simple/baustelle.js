function show_table_if_winner(otree) {
	table_shield_off();
	if (isdef(otree.winner)) {
		stop_game();
		ari_reveal_all_buildings(otree);
		if (!DA.test.running) turn_show_gameover(otree);
	}
}

function dachain(ms = 0) {
	console.log('TestInfo', TestInfo)
	if (!isEmpty(DA.chain) && !(DA.test.running && DA.test.step == true)) {
		dachainext(ms);
	} else if (isEmpty(DA.chain)) console.log('DA.chain EMPTY ' + DA.test.iter)
}
function dachainext(ms = 0) {
	let f = DA.chain.shift();
	//console.log('====>CHAINING: func',f.name);
	if (ms > 0) TOMan.TO[getUID('f')] = setTimeout(f, ms);
	else f();
}
function onclick_step() {
	DA.test.step = true;
	DA.test.running = true;
	if (!isEmpty(DA.chain)) { dachainext(1000); return; }

	let testnumber = valf(mBy('intestnumber').value, 110);
	if (!isNumber(testnumber)) testnumber = 110;
	console.log('test for step is', testnumber);
	//onclick_ut_n('ari', testnumber);
	DA.test.number = testnumber;
	onclick_last_test();
	//jetzt nur den ersten step wie mach ich das?
}
function onclick_ut_n(g, n) {

	DA.test.running = true;
	let [fen, player_names] = window[`${g}_ut${n}_create_staged`]();
	get_create_staged(fen, { level_setting: 'min' }, player_names);
	// if (isdef(Session.cur_tid) && Session.cur_tid > 1) {
	// 	get_delete_last_and_create_staged(fen, { level_setting: 'min' }, player_names);
	// } else {
	// 	get_create_staged(fen, { level_setting: 'min' }, player_names);
	// }
}
function get_create_staged(fen, options, player_names) {
	let t = create_table(options, player_names);
	t.fen = fen;
	to_server({ table: t }, 'delete_and_create_staged');
}
function onclick_run_tests() {
	stop_game();
	stop_polling();
	shield_on();
	DA.test.iter = 0;
	DA.test.suiteRunning = true;
	if (nundef(DA.test.list)) {
		console.log('taking default DA.test.list');
		DA.test.list = [100, 101];
	}
	test_engine_run_next(DA.test.list);
	//onclick_ut_n('ari', 104);
}
function onclick_last_test() {
	stop_game();
	stop_polling();
	DA.test.iter = 0;
	DA.test.suiteRunning = false;
	onclick_ut_n('ari', DA.test.number);
}

function ari_deck_add_safe(otree, n, arr) {
	ari_ensure_deck(otree, n);
	deck_add(otree.deck, n, arr);
}

function has_farm(uname) { return firstCond(UI.players[uname].buildings, x => x.type == 'farm'); }
function output_error(msg) { dError.innerHTML = msg; }

//#region ani
var MyEasing = 'cubic-bezier(1,-0.03,.86,.68)';
function animateProperty(elem, prop, start, middle, end, msDuration, forwards) {
	let kflist = [];
	for (const v of [start, middle, end]) {
		let o = {};
		o[prop] = isString(v) || prop == 'opacity' ? v : '' + v + 'px';
		kflist.push(o);
	}
	let opts = { duration: msDuration };
	if (isdef(forwards)) opts.fill = forwards;
	elem.animate(kflist, opts); // {duration:msDuration}); //,fill:'forwards'});
}
function animatePropertyX(elem, prop, start_middle_end, msDuration, forwards, easing, delay) {
	let kflist = [];
	for (const perc in start_middle_end) {
		let o = {};
		let val = start_middle_end[perc];
		o[prop] = isString(val) || prop == 'opacity' ? val : '' + val + 'px';
		kflist.push(o);
	}
	let opts = { duration: msDuration, fill: valf(forwards, 'none'), easing: valf(easing, 'ease-it-out'), delay: valf(delay, 0) };
	elem.animate(kflist, opts); // {duration:msDuration}); //,fill:'forwards'});
}
function aMove(d, dSource, dTarget, callback, offset, ms, easing, fade) {
	let b1 = getRect(dSource);
	let b2 = getRect(dTarget);
	if (nundef(offset)) offset = { x: 0, y: 0 };
	let dist = { x: b2.x - b1.x + offset.x, y: b2.y - b1.y + offset.y };
	d.style.zIndex = 100;
	// var MyEasing = 'cubic-bezier(1,-0.03,.86,.68)';
	let a = d.animate({ opacity: valf(fade, 1), transform: `translate(${dist.x}px,${dist.y}px)` }, { easing: valf(easing, 'EASE'), duration: ms });
	// let a = aTranslateFadeBy(d.div, dist.x, dist.y, 500);
	a.onfinish = () => { d.style.zIndex = iZMax(); if (isdef(callback)) callback(); };
}
function aTranslateFadeBy(d, x, y, ms) { return d.animate({ opacity: .5, transform: `translate(${x}px,${y}px)` }, { easing: MyEasing, duration: ms }); }
function aTranslateBy(d, x, y, ms) { return d.animate({ transform: `translate(${x}px,${y}px)` }, ms); }// {easing:'cubic-bezier(1,-0.03,.27,1)',duration:ms}); }
function aTranslateByEase(d, x, y, ms, easing = 'cubic-bezier(1,-0.03,.27,1)') {
	return d.animate({ transform: `translate(${x}px,${y}px)` }, { easing: easing, duration: ms });
}
function aRotate(d, ms = 2000) { return d.animate({ transform: `rotate(360deg)` }, ms); }
function aRotateAccel(d, ms) { return d.animate({ transform: `rotate(1200deg)` }, { easing: 'cubic-bezier(.72, 0, 1, 1)', duration: ms }); }
function aFlip(d, ms = 300, x = 0, y = 1, easing = 'cubic-bezier(1,-0.03,.27,1)') {
	// return d.animate({ 'transform-origin': '50% 50%',transform: `scale(${x}px,${y}px)` }, {easing:easing,duration:ms}); 
	return d.animate({ transform: `scale(${2}px,${y}px)` }, { easing: easing, duration: ms });
}
//#-endregion









