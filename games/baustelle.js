
function send_experience_points() {
	console.log('sending experience points.....')
}

function check_experience_states(){
	let [pldata, stage, A, fen, phase, uplayer, turn, uname, host] = [Z.playerdata, Z.stage, Z.A, Z.fen, Z.phase, Z.uplayer, Z.turn, Z.uname, Z.host];

	//read playerdata state2
	let donelist = Z.playerdata.filter(x => isDict(x.state1));
	//console.log('...state1',donelist,stage);

	for(const x of donelist){
		//this is a gift from 
		let plfrom = x.name;
		let plto=x.state1.plname;
		let num=Number(x.state1.num);

		fen.players[plfrom].experience -= num;
		fen.players[plto].experience += num;
		x.state1=null; //reset fuer den fall dass multiple times in accuse_activate gehe!!!!
	}




}

function show_special_popup(title, onsubmit, styles = {}) {
	let dParent = mBy('dBandMessage');
	if (nundef(dParent)) dParent = mDiv(document.body, {}, 'dBandMessage');
	show(dParent);
	clearElement(dParent);
	addKeys({ position: 'fixed', top: 154, classname: 'slow_gradient_blink', vpadding: 10, align: 'center', position: 'absolute', fg: 'white', fz: 24, w: '100vw' }, styles);
	if (!isEmpty(styles.classname)) { mClass(dParent, styles.classname); }
	delete styles.classname;
	mStyle(dParent, styles);
	mDiv(dParent, {}, null, title)

	DA.popupitems = [];
	let irow = 0;
	let buttonstyle = { maleft: 10, vmargin: 2, rounding: 6, padding: '4px 12px 5px 12px', border: '0px solid transparent', outline: 'none' }
	for (const list of [...arguments].slice(3)) {
		let d = mDiv(dParent, { padding: 10 }, `d_line_${irow}`);
		mCenterFlex(d);
		let items = ui_get_string_items(list);
		DA.popupitems = DA.popupitems.concat(items);
		let sample = items[0];
		//console.log('sample', sample); //continue;
		let type = sample.itemtype = isNumber(sample.a) ? 'number' : is_card(sample.a) ? 'card' : is_player(sample.a) ? 'player' : isdef(sample.o) ? 'container' : is_color(sample.a) ? 'color' : 'string';
		//console.log('type', type); //continue;
		//lookupSet(DA,['selections',idx],null);
		//DA.selections[irow]=null;
		let icol = 0;
		for (const item of items) {
			//console.log('type', type, items[0].a);
			//let handler = x=> ev => DA.selections[x]=ev.target; //console.log(ev.target.innerHTML,x); //lookupSetOverride(DA,['selections',idx],ev.target.innerHTML);
			item.div = mButton(item.a, unselect_select, d, buttonstyle, 'selectable_button', `b_${irow}_${icol}`);
			item.id = item.div.id;
			item.irow = irow;
			item.icol = icol;
			if (type == 'color') mStyle(item.div, { bg: item.a, fg: 'contrast' });
			icol++;
		}
		irow++;
		//for (const el of list) { mButton(el, x => console.log(x.target.innerHTML), d); }
	}
	mButton("submit", gift_experience_points, dParent, buttonstyle, ['donebutton', 'enabled']);
}
function gift_experience_points() {
	let selected = DA.popupitems.filter(x => x.isSelected);
	if (selected.length < 2){
		//console.log('cannot send experience points!!!!');
		return;
	}
	let plname_item = selected.find(x => x.irow == 0);
	let plname = plname_item.a;
	let num_item = selected.find(x => x.irow == 1);
	let num = Number(num_item.a);
	//console.log('player', Z.uplayer, 'gives', num, 'points to', plname);
	//close the popup

	mRemove('dBandMessage');
	Z.state1 = { plname: plname, num: num };
	take_turn_state1();

	//now I need reload with write player!!!!

}
function unselect_select(ev) {
	let id = evToId(ev);
	//console.log('clicked', id)
	let [irow, icol] = allNumbers(id);
	//console.log('row', irow, 'col', icol);
	let newitem = null;
	//check if there is an item selected in that row already
	for (const item of DA.popupitems) {
		//console.log('item', item, item.isSelected);
		let id1 = iDiv(item).id;
		let [irow1, icol1] = allNumbers(id1);
		if (irow1 == irow && icol1 != icol && item.isSelected) {
			make_string_unselected(item);
			item.isSelected = false;
		} else if (irow1 == irow && icol1 == icol) {
			newitem = item;
		}
	}
	//newitem should be selected or unselected
	//console.log('newitem', newitem)
	if (newitem.isSelected) { make_string_unselected(newitem); newitem.isSelected = false; }
	else { make_string_selected(newitem); newitem.isSelected = true; }
}


function colored_jolly(color) {
	//let svg = 
}



















