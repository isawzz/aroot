window.onload = start;
function start() { mBy('i_search').select(); }
function startsearch(){
	let itext = mBy('i_search').value;
	console.log('input', itext);
	let part1 = `https://www.bing.com/videos/search?q=Dokus+`;
	let part2 = `&qft=+filterui:duration-long&FORM=VRFLTR`;
	window.location = part1 + toWords(itext).join('+') + part2;
}

