function mAppear(d, ms = 800) { mAnimateTo(d, 'opacity', 1, null, ms); }
function mFade(d, ms = 800) { mAnimateTo(d, 'opacity', 0, null, ms); }
function mFadeRemove(d, ms = 800) { mAnimateTo(d, 'opacity', 0, () => mRemove(d), ms); }
function mFadeClear(d, ms = 800) { mAnimateTo(d, 'opacity', 0, () => mClear(d), ms); }
function mFall(d, ms = 800) { toElem(d).animate([{ opacity: 0, transform: 'translateY(-50px)' }, { opacity: 1, transform: 'translateY(0px)' },], { fill: 'both', duration: ms, easing: 'ease' }); }

function mHide(d, ms = 0) { if (ms > 0) mFade(d, ms); else mStyle(d, { opacity: 0 }); }
function mShow(d, ms = 0) { if (ms > 0) mAppear(d, ms); else mStyle(d, { opacity: 1 }); }

function mRise(d, ms = 800) {
	toElem(d).animate([{ opacity: 0, transform: 'translateY(50px)' }, { opacity: 1, transform: 'translateY(0px)' },], { fill: 'both', duration: ms, easing: 'ease' });
}
function mShrink(d, x = .75, y = .75, ms = 800, callback = null) {
	let anim = toElem(d).animate([{ transform: `scale(${1},${1})` }, { transform: `scale(${x},${y})` },], { fill: 'both', duration: ms, easing: 'ease' });
	anim.onfinish = callback;
}
function get_screen_distance(child, newParent) {
	child = toElem(child);
	newParent = toElem(newParent);

	const parentOriginal = child.parentNode;

	let children = arrChildren(parentOriginal);
	let iChild = children.indexOf(child);
	let sibling = iChild == children.length - 1 ? null : children[iChild + 1];

	const x0 = child.getBoundingClientRect().left;
	const y0 = child.getBoundingClientRect().top;
	//console.log('pos0', x0, y0)

	newParent.appendChild(child);
	const x1 = child.getBoundingClientRect().left;
	const y1 = child.getBoundingClientRect().top;
	//console.log('pos1', x1, y1)

	if (sibling) parentOriginal.insertBefore(child, sibling); else parentOriginal.appendChild(child);
	// child.style.setProperty('--dx', (x1 - x0) + 'px');
	// child.style.setProperty('--dy', (y1 - y0) + 'px');
	return [x1 - x0, y1 - y0];
}
function mTranslate(child, newParent, ms = 800, callback = null) {
	let [dx, dy] = get_screen_distance(child, newParent);
	onend = () => { mAppend(newParent, child); if (callback) callback(); };
	mAnimate(child, 'transform', [`translateX(${dx}px) translateY(${dy}px)`], onend, ms, 'ease'); //translate(${dx}px,${dy}px)`
	//let anim = toElem(child).animate([{ transform: `scale(${1},${1})` }, { transform: `scale(${x},${y})` },], { fill: 'both', duration: ms, easing: 'ease' });
	//anim.onfinish = callback;
}
function mScale(d,scale){mStyle(d,{'transform-origin':'top',transform:`scale(${scale})`});}
function mShrinkTranslate(child, scale, newParent, ms = 800, before = null, after = null) {
	let [dx, dy] = get_screen_distance(child, newParent);
	onend = () => { if (before) before(); mAppend(newParent, child); if (after) after(); };
	//mStyle(child,{'transform-origin':'top'});
	mAnimate(child, 'transform', [`translateX(${dx}px) translateY(${dy}px) scale(${scale})`], onend, ms, 'ease'); //translate(${dx}px,${dy}px)`
	//let anim = toElem(child).animate([{ transform: `scale(${1},${1})` }, { transform: `scale(${x},${y})` },], { fill: 'both', duration: ms, easing: 'ease' });
	//anim.onfinish = callback;
}
function mTranslate1(child, newParent, ms = 800, callback = null) {
	child = toElem(child);
	newParent = toElem(newParent);

	const parentOriginal = child.parentNode;

	let children = arrChildren(parentOriginal);
	let iChild = children.indexOf(child);
	let sibling = iChild == children.length - 1 ? null : children[iChild + 1];

	const x0 = child.getBoundingClientRect().left;
	const y0 = child.getBoundingClientRect().top;
	//console.log('pos0', x0, y0)

	newParent.appendChild(child);
	const x1 = child.getBoundingClientRect().left;
	const y1 = child.getBoundingClientRect().top;
	//console.log('pos1', x1, y1)

	if (sibling) parentOriginal.insertBefore(child, sibling); else parentOriginal.appendChild(child);
	child.style.setProperty('--dx', (x1 - x0) + 'px');
	child.style.setProperty('--dy', (y1 - y0) + 'px');
	child.style.setProperty('--ms', `${ms}ms`);

	child.addEventListener('animationend', function () {
		newParent.appendChild(child);
		child.classList.remove('move');
		if (callback) callback();
	});
	child.classList.add('move');
}












