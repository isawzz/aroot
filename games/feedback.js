function feedback() {
	const w_init = 10;
	function setup(players, options) {
		let fen = { players: {}, plorder: jsCopy(players), turn: [players[0]], stage: 'init', phase: '' };
		fen.keeppolling = true;
		fen.barvalues = {green:10,red:10};
		fen.decrement = 0;
		for (const plname of players) { fen.players[plname] = { score: 0, name: plname, color: get_user_color(plname), }; }
		if (nundef(options.mode)) options.mode = 'multi';
		return fen;
	}
	function check_gameover() {
		for (const uname of Z.plorder) {
			let cond = get_player_score(uname) >= Z.options.winning_score;
			if (cond) { Z.fen.winners = [uname]; return Z.fen.winners; }
		}
		return false;
	}
	function state_info(dParent) {  }
	function present(dParent) { feedback_present(dParent); }
	function stats(dParent) { feedback_stats(dParent); }
	function activate_ui() {  }
	return { w_init, setup, activate_ui, check_gameover, present, state_info, stats };
}

function feedback_present() {
	dTable = mBy('dTable'); mStyle(dTable,{padding:20});

	DA.no_shield = true;
	feedback_stats(dTable);

	let dgreen = get_plus_progressbar(dTable, 'green');
	mLinebreak(dTable);
	let dred = get_plus_progressbar(dTable, 'red');
	mLinebreak(dTable);

	DA.bars = {
		green: dgreen,
		red: dred,
	};
	set_bar('green'); set_bar('red');
	//console.log('DA', DA);

	if (Z.role == 'spectator') {

		feedback_disable_ui();
		mButton('JOIN AS PLAYER', onclick_join_as_player, dTable, { h: 40, w: 200 });

	} else if (i_am_host()) {
		let [uname, fen, options, uplayer] = [Z.uname, Z.fen, Z.options, Z.uplayer];
		mButton('reset', onclick_reset_progressbars, dTable, { h: 30, w: 100 });
		feedback_disable_ui();
		//console.log('Z.playerdata_changed_for', Z.playerdata_changed_for); sss();
		let playerlist = Z.playerlist;
		let pldatalist = Z.playerdata.map(x => x.name);
		console.log('playerlist', playerlist, 'pldatalist', pldatalist);
		for (const plname of pldatalist) {
			if (!playerlist.includes(plname)) {
				console.log('plname', plname, 'not in playerlist', playerlist);
				fen.players[plname] = { score: 0, name: plname, color: get_user_color(plname) };
			}
		}

		if (playerlist.length != pldatalist.length) {
			//hier koennten neue players auch irgendeinen eigenen state bekommen!
			phpPost({ friendly: Z.friendly, uname: Z.uplayer, players: pldatalist, fen: fen }, 'add_players');
		}

		
		//host muss auch senden wenn irgendwer auf ein + clickt!
		fen.decrement = 0;
		start_downgrade_ticker();


	} else {
		assertion(Z.playerlist.includes(Z.uname),`${Z.uname} not in playerlist ${Z.playerlist} and not spectator`);
		//gejointe players koennen + in irgendeiner progressbar clicken

		//wird automatisch zu pldata geschieben!
	}
}

function feedback_stats(d) {
	let players = Z.fen.players;
	let d1 = mDiv(d, { display: 'flex', 'justify-content': 'center', 'align-items': 'space-evenly' });
	for (const plname in players) {
		let pl = players[plname];
		let sz = 50; //onturn?100:50;
		let bcolor = 'silver';
		let border = pl.playmode == 'bot' ? `double 5px ${bcolor}` : `solid 5px ${bcolor}`;
		let rounding = pl.playmode == 'bot' ? '0px' : '50%';
		let d2 = mDiv(d1, { margin: 4, align: 'center' }, null, `<img src='../base/assets/images/${plname}.jpg' style="border-radius:${rounding};display:block;border:${border};box-sizing:border-box" class='img_person' width=${sz} height=${sz}>`);
	}
}


function feedback_disable_ui() {
	for (const k in DA.bars) {
		let bar = DA.bars[k];
		let b=bar.cont.getElementsByTagName('button')[0];
		b.disabled = true;
	}
}
function get_plus_progressbar(dParent, color, id) {
	//color has to be a word (web color)
	//console.log('dParent', dParent);
	if (nundef(id)) id = getUID();
	let d = mDiv(dParent, {}, id, null, 'grid_progressbar');
	let button = mButton('+', () => onclick_plus(color, 10), d);
	let d1 = mDiv(d, {}, null, null, 'progressbar');
	let val = valf(Z.fen.barvalues[color],Z.func.init);
	let dbar = mDiv(d1, { w:`${val}%`,bg: color }, 'b_' + color, null, 'barstatus');
	return { w: val, cont: d, div: dbar, ti: null };
}
function onclick_join_as_player() {
	let [uname, fen, options, uplayer] = [Z.uname, Z.fen, Z.options, Z.uplayer];
	console.log('uname', uname, 'uplayer', uplayer);
	phpPost({ friendly: Z.friendly, uname: uname }, 'join');
}
function onclick_reset_progressbars() { for (const k in DA.bars) set_bar(k, Z.func.w_init, 2); }
function onclick_plus(id, inc) { 
	let bar = DA.bars[id]; set_bar(id, bar.w + inc, 1); 

	assertion(isdef(Z.uplayer_state), 'Z.uplayer_state not defined for ' + Z.uname);
	let state = Z.uplayer_data.state;
	if (nundef(state)) state={green:0,red:0};
	state[id] += 1;
	Z.state = state;
	take_turn_write();
}
function set_bar(id, val, speed) {
	let bar = DA.bars[id];
	//console.log('bar', bar);
	let goal = Math.min(100, Math.max(0, val));
	if (goal == bar.w) return;
	let i = goal > bar.w ? speed : -speed;

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
