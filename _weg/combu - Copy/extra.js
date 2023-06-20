function maButton(caption, handler, dParent, styles, classes) {
  let a = mLink("javascript:void(0)", dParent, styles, null, caption, classes);
  a.onclick = handler;
  if (isdef(styles)) mStyle(a, styles);
  return a;
}
function mFlexLine(d,bg='white',fg='contrast'){
	//console.log('h',d.clientHeight,d.innerHTML,d.offsetHeight);
	mStyle(d,{bg:bg,fg:fg,display:'flex',valign:'center',hmin:measureHeight(d)});
	mDiv(d,{fg:'transparent'},null,'|')
}
function measureHeight(d){
	let d2=mDiv(d,{opacity:0},null,'HALLO');
	return d2.clientHeight;
}
function phpPost(data, cmd) {
	var o = {};
	o.data = valf(data, {});
	o.cmd = cmd;
	o = JSON.stringify(o);

  var xml = new XMLHttpRequest();
	xml.onload = function () {
		if (xml.readyState == 4 || xml.status == 200) {
			handleResult(xml.responseText, cmd);
		} else { console.log('WTF?????') }
	}
	xml.open("POST", "php/api.php", true);
	xml.send(o);
}









