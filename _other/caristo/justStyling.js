function mMenuButton(dParent, caption, styles) {
	caption = valf(caption, UnicodeSymbols.menu);
	styles = valf(styles, { fz: 30, margin: 4 });
	let b = mButton(caption, null, dParent, styles, 'mybutton', getUID('b'));
	return b;
}
function mMenuLine(dParent, styles) {
	let menuStyles = isdef(styles) ? styles : { bg: wblack, alpha: .65 };
	let dMenu = mDiv(dParent, menuStyles);
	return dMenu;
}

