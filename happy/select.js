
function ui_get_bluff_inputs(strings){
	let uplayer = Z.uplayer;
	let items = ui_get_string_items(uplayer,strings);
	console.log('items',items)
	return items;
	//hier koennt ich die ergebnis inputs dazugeben!
}

//#region select
function select_add_items(items, callback = null, instruction = null, min = 0, max = 100, prevent_autoselect=false){ //, show_submit_button=true) {
	let A = Z.A;
	select_clear_previous_level();
	A.level++; A.items = items; A.callback = callback; A.selected = []; A.minselected = min; A.maxselected = max;

	show_stage();
	let dInstruction = mBy('dSelections0');
	mClass(dInstruction, 'instruction');
	mCenterCenterFlex(dInstruction);
	// dInstruction.innerHTML = '<div>' + ((Z.role == 'active' ? `${get_waiting_html()}<span style="color:red;font-weight:bold;max-height:25px">You </span>` : `${Z.uplayer} `)) + "&nbsp;" + instruction; // + '</div>';
	dInstruction.innerHTML = (Z.role == 'active' ? `${get_waiting_html()}<span style="color:red;font-weight:bold;max-height:25px">You</span>` : `${Z.uplayer}`) + "&nbsp;" + instruction; // + '</div>';
	//console.log('A',A)
	if (too_many_string_items(A)) { mLinebreak(dInstruction, 4); } //console.log('triggered!!!') }
	//prep items and link to ui
	//console.log('haaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaA.items',items,A.items); //return;
	for (const item of A.items) {
		let type = item.itemtype = is_card(item) ? 'card' : isdef(item.o) ? 'container' : 'string';
		let id = item.id = getUID(); A.di[id] = item;
		if (type == 'string') { //make button for this item!
			item.div = mButton(item.a, () => select_last(item, select_toggle), dInstruction, {}, null, id);
		} else {
			let ui = item.div = iDiv(item.o);
			ui.onclick = () => select_last(item, select_toggle); // show_submit_button ? select_toggle : select_finalize;
			ui.id = id;
		}
	}

	//show_submit_button = show_submit_button && A.minselected != A.maxselected || !Config.autosubmit;
	let show_submit_button = A.minselected != A.maxselected || !Config.autosubmit;
	if (show_submit_button) { mButton('submit', callback, dInstruction, { bg: 'red', fg: 'white', maleft: 10 }, null, 'bSubmit'); }

	let show_restart_button = show_submit_button && A.level > 1;
	if (show_restart_button) { mButton('restart', onclick_reload, dInstruction, { bg: 'red', fg: 'white', maleft: 10 }, null, 'bReload'); }

	//now, mark all items for selection
	let dParent = window[`dActions${A.level}`];
	for (const item of A.items) { ari_make_selectable(item, dParent, dInstruction); }

	//ich muss alle hand containers identifizieren!
	//let handcontainers = 

	//activate ui or automatic selection
	assertion(A.items.length >= min, 'less options than min selection!!!!', A.items.length, 'min is', min); //TODO: sollte das passieren, check in ari_pre_action die mins!!!
	if (A.items.length == min && !is_ai_player() && !prevent_autoselect) {
		//all items need to be selected!
		for (const item of A.items) { A.selected.push(item.index); ari_make_selected(item); }
		if (Config.autosubmit) {
			//console.log('items.length==min und autosubmit!!!!!!!!!!!!!!!!!!')
			loader_on();
			//console.log('autosubmit because item.length == min items (so would have to select all items anyway)')
			setTimeout(() => { if (callback) callback(); loader_off(); }, 800);
		}
	} else if (is_ai_player()) {
		ai_move();
	} else if (DA.testing) {
		let movekey = Z.uplayer + '_' + DA.test.iter;
		let selection_list = DA.auto_moves[movekey];
		if (nundef(selection_list)) selection_list = DA.auto_moves[DA.test.iter];
		if (isEmpty(selection_list)) { activate_ui(); return; }

		deactivate_ui();
		let selection = selection_list.shift();

		let numbers = [];
		for (const el of selection) {
			if (el == 'last') {
				numbers.push(A.items.length - 1);
			} else if (isString(el)) {
				//this is a command!
				let commands = A.items.map(x => x.key);
				let idx = commands.indexOf(el);
				//console.log('idx of', el, 'is', idx)
				numbers.push(idx);
			} else numbers.push(el);
		}
		selection = numbers;
		//console.log('got selection for', movekey, selection, '\nrest', DA.auto_moves[movekey]);
		console.log('DA.testing: ein test case?!?!?!?!?!?????????????')
		setTimeout(() => {
			A.selected = selection;
			if (selection.length == 1) A.command = A.items[A.selected[0]].key;
			select_highlight();
			if (A.callback) A.callback();
		}, 1000);
	} else {activate_ui();}
}
function select_last(item, callback) { Z.A.last_selected = item; callback(item); }

function select_clear_previous_level() {
	//console.log('select_clear_previous_level', Z.A.items)
	let A = Z.A;
	if (!isEmpty(A.items)) {
		console.assert(A.level >= 1, 'have items but level is ' + A.level);
		A.ll.push({ items: A.items, selected: A.selected });
		let dsel = mBy(`dSelections1`); // mBy(`dSelections${A.level}`)
		mStyle(dsel, { display: 'flex', 'align-items': 'center', padding: 10, box: true, gap: 10 })
		for (const item of A.items) {
			ari_make_unselectable(item);
			ari_make_unselected(item);
			if (!A.selected.includes(item.index)) continue;
			if (item.itemtype == 'card') {
				//a miniature of this item is added to 
				let d = iDiv(item);
				let card = item.o;
				let mini = mDiv(dsel, { bg: 'yellow', fg: 'black', hpadding:2, border: '1px solid black' }, null, card.friendly);
			} else if (item.itemtype == 'container') {
				//a miniature of this item is added to 
				let list = item.o.list;
				let cards = list.map(x => ari_get_card(x, 30, 30 * .7));
				//let d2=mDiv(dsel,{display:'inline-block', margin:10,});
				let cont2 = ui_make_hand_container(cards, dsel, { bg: 'transparent' });
				ui_add_cards_to_hand_container(cont2, cards, list);
			} else if (item.itemtype == 'string') {
				// let bui = mBy(item.id);
				// bui.remove();
				let db = mDiv(dsel, { bg: 'yellow', fg: 'black', border: 'black', hpadding: 4 }, item.id, item.a);
				// bui.onclick = null;
				// mBy(bui, { bg: 'yellow', fg: 'black', outline: '', border: '', cursor:'default' });
				// mAppend(dsel, bui);
			}
		}
	}
}
function select_toggle() {
	if (!uiActivated) { console.log('ui is deactivated!!!'); return; }
	let A = Z.A;

	let item = A.last_selected;
	//console.log('last_selected', item)
	//let id = evToId(ev); let item = A.di[id];

	//console.log('click id', id, 'item', item);
	if (A.selected.includes(item.index)) {
		removeInPlace(A.selected, item.index);
		ari_make_unselected(item);
	} else {

		if (A.maxselected == 1 && !isEmpty(A.selected)) { ari_make_unselected(A.items[A.selected[0]]); A.selected = []; }

		A.selected.push(item.index);
		ari_make_selected(item);

		if (!DA.ai_is_moving && A.selected.length >= A.maxselected && Config.autosubmit) {
			//console.log('autosubmitting in select_toggle with 1 sec delay because cannot select more -  max reached!');
			setTimeout(() => A.callback(), 100);
		}
	}
	//console.log('selected', A.selected);
}



//#-endregion

//#region making things selectable or selected
function ari_make_selectable(item, dParent, dInstruction) {
	let A = Z.A;
	switch (item.itemtype) {
		case 'card': make_card_selectable(item); break;
		case 'container': make_container_selectable(item); break;
		case 'string': make_string_selectable(item); break;
	}
}
function ari_make_unselectable(item) {
	let A = Z.A;
	switch (item.itemtype) {
		case 'card': make_card_unselectable(item); break;
		case 'container': make_container_unselectable(item); break;
		case 'string': make_string_unselectable(item); break;
	}
}
function ari_make_selected(item) {
	//console.log('item',item)
	let A = Z.A;
	switch (item.itemtype) {
		case 'card': make_card_selected(item); break;
		case 'container': make_container_selected(item); break;
		case 'string': make_string_selected(item); break;
	}

}
function ari_make_unselected(item) {
	let A = Z.A;
	switch (item.itemtype) {
		case 'card': make_card_unselected(item); break;
		case 'container': make_container_unselected(item); break;
		case 'string': make_string_unselected(item); break;
	}

}
// card
function make_card_selectable(item) { let d = iDiv(item.o); mClass(d, 'selectable'); mClass(d.parentNode, 'selectable_parent'); spread_hand(item.path, .3); }
function make_card_unselectable(item) { let d = iDiv(item.o); mClassRemove(d, 'selectable'); mClassRemove(d.parentNode, 'selectable_parent'); spread_hand(item.path); }
function make_card_selected(item) { set_card_border(item, 13, 'red'); }
function make_card_unselected(item) { set_card_border(item); }

//container
function make_container_selectable(item) { let d = iDiv(item); mClass(d, 'selectable'); mClass(d, 'selectable_parent'); }
function make_container_unselectable(item) { let d = iDiv(item); mClassRemove(d, 'selectable'); mClassRemove(d, 'selectable_parent'); }
function make_container_selected(item) { let d = iDiv(item); mClass(d, 'selected_parent'); }
function make_container_unselected(item) { let d = iDiv(item); mClassRemove(d, 'selected_parent'); }

function make_string_selectable(item) { let d = mBy(item.id); mClass(d, 'selectable_button'); }
function make_string_unselectable(item) { let d = mBy(item.id); mClassRemove(d, 'selectable_button'); }
function make_string_selected(item) { let d = mBy(item.id); item.bg = mGetStyle(d, 'bg'); item.fg = mGetStyle(d, 'fg'); mStyle(d, { bg: 'yellow', fg: 'black' }); } //console.log('item', item, 'd', d); 
function make_string_unselected(item) { let d = mBy(item.id); mStyle(d, { bg: item.bg, fg: item.fg }); } //mClassRemove(d, 'string_selected'); }

function make_hand_selectable(item) { }
function make_hand_unselectable(item) { }
function make_hand_selected(item) { }
function make_hand_unselected(item) { }

function make_market_selectable(item) { }
function make_market_unselectable(item) { }
function make_market_selected(item) { }
function make_market_unselected(item) { }

function make_deck_selectable(item) { }
function make_deck_unselectable(item) { }
function make_deck_selected(item) { }
function make_deck_unselected(item) { }

//#-endregion

