function is_card_key(ckey, rankstr = '*A23456789TJQK', suitstr = 'SHCD') { return rankstr.includes(ckey[0]) && suitstr.includes(ckey[1]); }
function beautify_history(lines, title, fen, uplayer) {
	//mach draus ein html
	//let [fen, uplayer] = [Z.fen, Z.uplayer];
	let html = `<div class="history"><span style="color:red;font-weight:bold;">${title}: </span>`;
	for (const l of lines) {
		let words = toWords(l);
		for (const w1 of words) {
			if (is_card_key(w1)) {
				//html += ` ${ari_get_card(w1).friendly} `; 

				//html += `${w1[0]}<i class="fas fa-spade"></i>`;
				//let suit =  mCardText(w1).innerHTML;
				html += mCardText(w1);
				//console.log('suit', suit);
				continue;
			}
			w = w1.toLowerCase();
			if (isdef(fen.players[w])) {
				html += `<span style="color:${get_user_color(w)};font-weight:bold"> ${w} </span>`;
			} else html += ` ${w} `;
		}
	}
	html += "</div>";
	return html;
}

function show_history(fen, dParent) {
	if (!isEmpty(fen.history)) {
		let html = '';
		for (const arr of jsCopy(fen.history).reverse()) {
			html += arr;//html+=`<h1>${k}</h1>`;
			//for (const line of arr) { html += `<p>${line}</p>`; }
		}
		// let dHistory =  mDiv(dParent, { padding: 6, margin: 4, bg: '#ffffff80', fg: 'black', hmax: 400, 'overflow-y': 'auto', wmin: 240, rounding: 12 }, null, html); //JSON.stringify(fen.history));
		let dHistory = mDiv(dParent, { paleft: 12, bg: colorLight('#EDC690', .5), box:true, matop: 10, patop: 10, w: '100%', hmax: `calc( 100vh - 250px )`, 'overflow-y': 'auto', wmin: 260 }, null, html); //JSON.stringify(fen.history));
		// let dHistory =  mDiv(dParent, { padding: 6, margin: 4, bg: '#ffffff80', fg: 'black', hmax: 400, 'overflow-y': 'auto', wmin: 240, rounding: 12 }, null, html); //JSON.stringify(fen.history));
		//mNode(fen.history, dHistory, 'history');
		UI.dHistoryParent = dParent;
		UI.dHistory = dHistory;
	}

}

function show_history_popup() {
	if (isdef(mBy('dHistoryPopup'))) return;
	let dpop = mPopup('', dTable, { fz: 16, bg: colorLight('#EDC690', .5), rounding: 8, fg: 'dimgray', top: 0, right: 0, border: 'white' }, 'dHistoryPopup');
	mAppend(dpop, UI.dHistory);
	mInsert(dpop, mCreateFrom(`<div style="margin-left:10px;text-align:left;width:100%;font-family:Algerian;font-size:22px;">${Config.games[Z.game].friendly}</div>`));
	//let bclose = mButtonX(dpop, hide_options_popup, 'tr');
	let bclose = mButtonX(dpop, hide_history_popup, 'tr', 25, 'dimgray');
}
function show_settings(dParent) {
	let [options, fen, uplayer] = [Z.options, Z.fen, Z.uplayer];
	clearElement(dParent);
	mFlex(dParent);
	mStyle(dParent, { 'justify-content': 'end', gap: 12, paright: 10 })
	console.log('dParent', dParent)
	let playermode = get_playmode(uplayer); //console.log('playermode',playermode)
	let game_mode = Z.mode;
	// let dplaymode = mDiv(dParent, { fg: 'blue' }, null, playermode); // playermode == 'bot' ? 'bot' : '');
	// let dgamemode = mDiv(dParent, { fg: 'red' }, null, Z.mode); //Z.mode == 'hotseat' ? 'h' : '');
	// let st = { fz: 20, padding: 6, h: 40, box: true, matop: 2, rounding: '50%', cursor: 'pointer' };
	let st = { fz: 20, padding: 0, h: 40, box: true, matop: 2, rounding: '50%', cursor: 'pointer' };
	let dHistoryButton = miPic('scroll', dParent, st);
	let d = miPic('gear', dParent, st);
	options.playermode = playermode;
	d.onmouseenter = () => show_options_popup(options);
	d.onmouseleave = hide_options_popup;
	dHistoryButton.onmouseenter = () => show_history_popup(options);

	//dHistoryButton.onmouseleave = hide_options_popup;
}












