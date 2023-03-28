onload=start;
function start(){
	console.log('hallo coding');
	loadCodebase();
}

function loadCodebase(o={}){
	o = JSON.stringify(o);
	var xml = new XMLHttpRequest();
	xml.onload = function () {
		if (xml.readyState == 4 || xml.status == 200) {
			loadCodebaseResult(xml.responseText);
		} else { console.log('WTF?????') }
	}
	xml.open("POST", "api.php", true);
	xml.send(o);

}
function loadCodebaseResult(result){
	let obj=JSON.parse(result);
	//console.log('result',result);
	DA.all = jsyaml.load(obj.all);
	DA.allcode = jsyaml.load(obj.allcode);
	DA.allhistory = jsyaml.load(obj.allhistory);
	//console.log('all',DA.all);
	dTable = mBy('dTable');
	show_code();
}






