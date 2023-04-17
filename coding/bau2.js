
function stringCount(s,sSub,caseInsensitive=true){

	let temp = "Welcome to W3Docs";
	let m=new RegExp(sSub,'g'+(caseInsensitive?'i':''));
	let count = (s.match(m)).length;
	//console.log(count);
	return count;

	//console.log('m',m);
	//console.log(m.exec(s));
}












