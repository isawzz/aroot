function mAddContent(dParent, cont, styles = {}, opts) {
	//console.log('mAddContent')
	if (nundef(opts)) opts = { keepInLine: true, replace: false, newline: true };
	let keepInLine = valf(opts.keepInLine, true)
	let replace = valf(opts.replace, false);
	let newline = valf(opts.newline, true);

	//console.log('keepInLine', keepInLine, 'replace', replace, 'newline', newline);

	if (replace) clearElement(dParent);
	if (keepInLine) styles['white-space'] = 'nowrap';
	if (newline) styles.display = 'block';

	let elem = contentToElement(cont, styles);
	mAppend(dParent, elem);

	return elem;
}
function contentToElement(cont, styles, keepInLine = true) {
	let elem = cont;
	if (isString(cont)) {
		if (cont[0] === '<') {
			elem = createElementFromHtml(cont);
		} else {
			elem = mText(elem);
		}
	}
	if (keepInLine) styles['white-space'] = 'nowrap';
	mStyle(elem, styles);
	return elem;
}
function multiStyleAnimation(elist, ms, callback) {
	//console.log('multiStyleAnimation ms', ms)
	let els = elist.map(x => x[0]);
	let styles = elist.map(x => x[1]);
	//console.log('d1 transition', isEmpty(els[0].style.transition) ? 'empty' : els[0].style.transition);
	els.map(x => x.style.transition = '' + ms + 'ms'); //transitionOff(x)); }
	//console.log('d1 transition', isEmpty(els[0].style.transition) ? 'empty' : els[0].style.transition);
	for (let i = 0; i < els.length; i++) { mStyle(els[i], styles[i]); }

	DA.TO = setTimeout(() => {
		els.map(x => x.style.transition = 'unset');
		if (isdef(callback)) callback();
		//console.log('d1 transition', isEmpty(els[0].style.transition) ? 'empty' : els[0].style.transition);
	}, ms);


	//if (ms == 0) { els.map(x => mRemoveClass(x, 'noTransition')); }
}
function iSidebar(d1, d2, dToggle = null, w = 100, startOpen = true, id) {
	mStyle(d1, { h: '100%', w: startOpen == true ? w : 0, position: 'absolute', z: 1, top: 0, left: 0, 'overflow': 'hidden' }); //, transition: secs });
	mStyle(d2, { h: '100%', maleft: startOpen == true ? w : '0px', box: true }, null, null); //, transition: secs

	d1.isOpen = startOpen;
	d1.wNeeded = w;
	let tell = () => console.log('sidebar is', d1.isOpen ? 'OPEN' : 'CLOSED');

	let fToggle = (ev, animate = true) => {
		d1.isOpen = !d1.isOpen;
		let val = d1.isOpen ? d1.wNeeded : 0;
		if (animate) multiStyleAnimation([[d1, { w: val }], [d2, { maleft: val }]], 500, tell);
		else { mStyle(d1, { w: val }); mStyle(d2, { maleft: val }); tell(); }
	}

	let fOpen = (ev, animate = true) => {
		if (d1.isOpen) return;
		fToggle(ev, animate);
	}

	let fClose = (ev, animate = true) => {
		if (!d1.isOpen) return;
		fToggle(ev, animate);
	}

	let fAddContent = (cont, styles) => {
		mAddContent(d1, cont, styles, { keepInLine: true, replace: false });
		let sz = getSizeNeeded(d1);
		//console.log('size needed is', sz);
		d1.wNeeded = sz.w;
		if (d1.isOpen) { mStyle(d1, { w: d1.wNeeded }); mStyle(d2, { maleft: d1.wNeeded }); }
	};

	let fReplaceContent = (cont, styles) => { clearElement(d1); fAddContent(cont, styles); };

	id = isdef(id) ? id : !isEmpty(d1.id) ? d1.id : getUID('sb');

	let item = mItem(id, { div: d1 }, { type: 'sidebar', w: w, toggle: fToggle, open: fOpen, close: fClose, addContent: fAddContent, replaceContent: fReplaceContent });
	if (!isEmpty(d2.id)) item.idContent = d2.id;
	if (isdef(dToggle)) { iAdd(item, { dToggle: dToggle }); dToggle.onclick = fToggle; }
	return item;
}










