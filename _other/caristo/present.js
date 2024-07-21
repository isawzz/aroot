function isSimple(x) { return !isDict(x) && !isList(x); }
function pPanel(dParent){return mDiv(dParent, { bg: 'random', rounding: 10, margin: 10, padding: 10 });}
function pKeyVal(dParent,k,val){let d=pPanel(dParent);d.innerHTML=k+':'; pVal(d,val); return d;}
function pVal(dParent,val){let d=pPanel(dParent);d.innerHTML=val; return d;}
function present_simple(dParent, item) {
	if (isDict(item)) {
		mCenterCenterFlex(dParent);
		for (const k in item) {
			let d = mDiv(dParent, { bg: 'random', rounding: 10, margin: 10, padding: 10 }, null, k+': ');
			val = item[k];
			present_simple(d, val);
		}
	} else if (isList(item)) {
		mCenterCenterFlex(dParent);
		item.map(x => present_simple(dParent, x));
	} else {
		dParent.innerHTML += item;
	}
}
function present_simple(dParent, item) {
	if (isDict(item)) {
		mCenterCenterFlex(dParent);
		for (const k in item) {
			let d = mDiv(dParent, { bg: 'random', rounding: 10, margin: 10, padding: 10 }, null, k+': ');
			val = item[k];
			present_simple(d, val);
		}
	} else if (isList(item)) {
		mCenterCenterFlex(dParent);
		item.map(x => present_simple(dParent, x));
	} else {
		dParent.innerHTML += item;
	}
}
function present_simple0(dParent, item) {
	if (isDict(item)) {
		let d = mDiv(dParent, { bg: 'random', rounding: 10, margin: 10, padding: 10 });
		mCenterCenterFlex(d);
		for (const k in item) {
			d.innerHTML += k;
			present_simple0(d,item[k]);
		}
	} else if (isList(item)) {
		let d = mDiv(dParent, { bg: 'random', rounding: 10, margin: 10, padding: 10 });
		mCenterCenterFlex(d);
		item.map(x => present_simple0(d, x));
	} else {
		let d = mDiv(dParent, { bg: 'random', rounding: 10, margin: 10, padding: 10 });
		d.innerHTML = item;
	}
}
function present_structured1(dParent, item) {
	if (isDict(item)) {
		mCenterCenterFlex(dParent);
		for (const k in item) {
			val = item[k];
			let d = mDiv(dParent, { bg: 'random', rounding: 10, margin: 10, padding: 10 }, null, k);
			present_structured1(d, val);
		}
		return dParent;
	} else if (isList(item)) {
		let d = mDiv(dParent, { bg: 'random', rounding: 10, margin: 10, padding: 10 });
		mCenterCenterFlex(d);
		item.map(x => present_structured1(d, x));
		return d;
	} else {
		let d = mDiv(dParent, { bg: 'random', rounding: 10, margin: 10, padding: 10 });
		d.innerHTML = item;
		return d;
	}
}
function present_structured(dParent, item) {
	let d = mDiv(dParent, { bg: 'random', rounding: 10, margin: 10, padding: 10 });
	if (isDict(item)) {
		mCenterCenterFlex(d);
		for (const k in item) {
			val = item[k];
			let d1 = mDiv(d, { bg: 'random', rounding: 10, margin: 10, padding: 10 }, null, k);
			present_structured(d1, val);
		}
	} else if (isList(item)) {
		mCenterCenterFlex(d);
		item.map(x => present_structured(d, x));
	} else {
		d.innerHTML = item;
	}
}
function present_auto(dParent, state) {
	for (const k in state) {
		let d = mDiv(dParent, { bg: 'random', rounding: 10, margin: 10, padding: 10 }, null, k);
		let val = state[k];
		if (isSimple(val)) {
			d.innerHTML += ': ' + val;
		} else if (isList(val)) {
			mCenterCenterFlex(d);
			val.map(x => mDiv(d, { bg: 'random', rounding: 10, margin: 10, padding: 10 }, null, x));
		} else {
			mCenterCenterFlex(d);
			present_auto(d, val);
		}
	}
}
function present_state_player(dParent, state, player) {
	if (!lookup(state, ['players', player])) { console.log('no state for player', player); return; }
	let dplayer = mDiv(dParent, { bg: 'random', rounding: 10, margin: 10, padding: 10 }, null, 'your items:');
	present_auto(dplayer, state.players[player]);
	//let others = filterDict(state.players,

	let drest = mDiv(dParent, { bg: 'random', rounding: 10, margin: 10, padding: 10 }, null, 'table');
	present_auto(drest, state);

}

