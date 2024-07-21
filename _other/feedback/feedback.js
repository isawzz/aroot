
function calc_speed(oldgoal, newgoal) {
	let speed = Math.abs(newgoal - oldgoal) / 10;
	return speed;
}
function ensure_clientstate() {
	if (nundef(Clientdata.state)) {
		Clientdata.state = {};
		for (const k in DA.bars) Clientdata.state[k] = 0; // DA.bars[k].w;
		//console.log('init state', Clientdata.state);
	}
}
function ensure_Z() {
	if (nundef(Z)) Z = {};
	copyKeys(Serverdata, Z);
	if (isdef(Serverdata.table)) { copyKeys(Serverdata.table, Z); copyKeys(Serverdata.table.fen, Z); }
}
function feedback() { }

function degrade_bars(dec) {
	let res = {};
	for (const color in DA.bars) {
		let bar = DA.bars[color];
		let val = Math.max(0, bar.w - dec);
		set_new_goal(color, val, 1);
		res[color] = val;
	}
	return res
}
function disable_bar_ui() {
	for (const k in DA.bars) {
		let bar = DA.bars[k];
		let b = bar.cont.getElementsByTagName('button')[0];
		b.disabled = true;
	}
}
function get_bar_values() {

	let res = {};
	for (const color in DA.bars) {
		let bar = DA.bars[color];
		res[color] = bar.w;
	}
	return res;
}
function get_clicks_from_playerdata() {
	let clicks = { green: 0, red: 0 };
	//sss();
	//console.log('playerdata', Z.playerdata);
	for (const pl of Z.playerdata) {
		let state = pl.state;
		if (!isEmpty(state)) {
			for (const k of ['green', 'red']) {

				if (state[k] > 0) {
					clicks[k] += state[k];
					//console.log('click',k,clicks[k]);

				}
			}
		}
	}
	return clicks;
}
function get_plus_progressbar(dParent, color, id) {
	//color has to be a word (web color)
	//console.log('dParent', dParent);
	if (nundef(id)) id = getUID();
	let d = mDiv(dParent, {}, id, null, 'grid_progressbar');
	let button = mButton('+', () => onclick_plus(color, 10), d);
	let d1 = mDiv(d, {}, null, null, 'progressbar');
	let winit = DA.winit = 10;
	let dbar = mDiv(d1, { bg: color, w: winit + '%' }, 'b_' + color, null, 'barstatus');
	return { w: winit, cont: d, div: dbar, ti: null };
}
function init_table() {
	dTable = mBy('dTable'); mStyle(dTable, { box: true, padding: 10, hmin: 500, w: '100%' }); //, bg: 'orange' });
	//mFlex(dTable);
}
function onclick_role(role) {
	//localStorage.setItem('role', role);
	mFade(mBy('dRoles'), 1000, null, 'linear');
	show_my_role(role);
}
function set_new_goal(id, goal, speed = .1) {
	let bar = DA.bars[id];
	goal = Math.min(100, Math.max(0, goal));
	if (goal == bar.w) return;
	let i = goal > bar.w ? speed : -speed;
	//console.log('new goal', goal, 'current', bar.w, 'speed', i);

	clearInterval(bar.ti);
	bar.ti = setInterval(() => anim(bar, i, goal), 10);

	function anim(bar, i, goal) {
		if (i < 0 && bar.w <= goal || i > 0 && bar.w >= goal) {
			clearInterval(bar.ti);
		} else {
			bar.w += i;
			bar.div.style.width = bar.w + '%';
		}
	}
}
function show_bars() {
	let d = mDiv(dTable, { w: '100%', box: true, opacity: 0 }, 'dBars');
	mLinebreak(d);
	let dgreen = get_plus_progressbar(d, 'green');
	mLinebreak(d);
	let dred = get_plus_progressbar(d, 'red');
	mLinebreak(d);

	DA.bars = {
		green: dgreen,
		red: dred,
	};
	return d;
}
function show_my_role(role) {
	//wird nur 1x aufgerufen bei login!

	let dRoles = mBy('dRoles');
	dRoles.innerHTML = `<h1>${role}</h1>`;
	Clientdata.role = role;
	mAppear(dRoles, 1000, null, 'linear');
	let d = show_bars();

	mAppear(d, 1000, null, 'linear');

	if (role == 'host') {
		mButton('reset', onclick_reset_progressbars, d, { h: 30, w: 100 });
		disable_bar_ui();
		// mButton('poll', on_host_tick, d, { h: 30, w: 100 });
		// on_host_tick();
		// TO.poll = setTimeout(on_host_tick,1000);
	} else if (role == 'guest') {
		if (nundef(Clientdata.uid)) Clientdata.uid = rUniqueId(30);
		Clientdata.new_clicks = 0;


		// mButton('poll', on_guest_tick, d, { h: 30, w: 100 });
		//on_guest_tick();
		// TO.poll = setTimeout(on_guest_tick,1000);
	}

	autopoll();
}
function show_roles() {
	let d = mDiv(dTable, {}, 'dRoles', null, 'grid_roles');

	mButton('host', () => onclick_role('host'), d, {}, ['donebutton', 'enabled']);
	mButton('guest', () => onclick_role('guest'), d, {}, ['donebutton', 'enabled']);
}
function show_status() {
	dStatus = mBy('dStatus');
	dStatus.innerHTML = `<h1>goals: <span style="color:green">${Math.round(Z.fen.green)}%</span> : <span style="color:red">${Math.round(Z.fen.red)}%</span></h1>`;
}

function start_creeping_down() {

	for (const k in Z.fen) {
		set_new_goal(k, 0);
	}
}

