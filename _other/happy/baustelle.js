
function mButtonX(dParent, pos='tr', handler=null, defaultBehavior='hide') {
	//ACHTUNG!!! default behavior is: removing dParent
	dParent = toElem(dParent);
	let sz = 32;

	// let d2 = mDiv(dParent, { family:'opensans', box:true, align:'center','line-height':34,w: 32, h: 32, pointer: 'cursor' }, null, `<i class="fa-thin fa-times" style="font-size:${sz}px;"></i>`, 'btnX');
	let d2 = mDiv(dParent, { bg: GREEN, rounding:'50%', cursor:'pointer',w:sz,h:sz }, null, `<svg><use xlink:href="#Times" /></svg>`); //, 'btnX');


	d2.onclick = isdef(handler)? handler:defaultBehavior=='hide'?()=>hide(dParent):()=>dParent.remove();
	mPlace(d2, pos,10);
	return d2;
}
function mButtonX(dParent, pos='tr', handler=null, defaultBehavior='hide') {
	//ACHTUNG!!! default behavior is: removing dParent
	dParent = toElem(dParent);
	let sz = 40;

	// let styles = { box:true, border:`blue solid ${3*sz/34}px`, bg: GREEN, rounding:'50%', cursor:'pointer',w:sz,h:sz };
	let styles = { cursor:'pointer',w:sz,h:sz };

	// let d2 = mDiv(dParent, { family:'opensans', box:true, align:'center','line-height':34,w: 32, h: 32, pointer: 'cursor' }, null, `<i class="fa-thin fa-times" style="font-size:${sz}px;"></i>`, 'btnX');
	let d2 = mDiv(dParent, styles, null, `<svg width='100%' height='100%' ><use xlink:href="#Times" /></svg>`); //, 'btnX');
	mClass(d2,'svgbtnX');

	d2.onclick = isdef(handler)? handler:defaultBehavior=='hide'?()=>hide(dParent):()=>dParent.remove();
	mPlace(d2, pos, 10);
	return d2;
}
























