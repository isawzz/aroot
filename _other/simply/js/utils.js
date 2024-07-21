
function aniSequence() {

}

function aniSuper(elem, name, duration, easing, delay, iterations, direction, before_after, playstate) {
	//* for MUST properties
	//*elem: element to be animated
	//*name: appear, disappear, fade
	//*duration: in ms
	//easing: linear|ease|ease-in|ease-out|ease-in-out|step-start|step-end|steps(int,start|end)|cubic-bezier(n,n,n,n)|initial|inherit
	//delay: in ms
	//iterations: number|infinite|initial|inherit;
	//direction: normal|reverse|alternate|alternate-reverse|initial|inherit;
	//before_after: none|forwards|backwards|both|initial|inherit;
	//playstate: paused|running|initial|inherit;

}

function disappear(elem, msDuration = 1000, msStartAfter = 0) {
	if (isString(elem)) elem = mBy(elem);
	if (nundef(elem)) return;
	mStyle(elem, { overflow: 'hidden', animation: `disappear ${msDuration}ms ease` });
	setTimeout(() => { hide(elem); mStyle(elem, { animation: 'unset' }); }, msDuration);

}
function get_request(type, data) {

	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function () {
		if (this.readyState == 4 && this.status == 200) {
			//console.log(this.responseText);
			handle_result(type, this.responseText);
		}
	};
	let url = `php/${type}.php`;
	let isFirst = true;
	for(const k in data){
		url+=(isFirst?'?':'&') + k + '=' + data[k];
		isFirst = false;
	}
	xmlhttp.open("GET", url, true);
	xmlhttp.send();

}
function get_data(type, data = {}) {
	var xml = new XMLHttpRequest();
	// var loader_holder = mBy("loader_holder");
	// loader_holder.className = "loader_on";
	xml.onload = function () {
		if (xml.readyState == 4 || xml.status == 200) {
			// loader_holder.className = "loader_off";
			//console.log('ajax came back with xml.responseText',xml.responseText);
			handle_result(type, xml.responseText);
		}
	}
	data.data_type = type;
	data = JSON.stringify(data);
	let url = `php/${type}.php`;
	//console.log('________POST to '+url,data);
	//return;
	xml.open("POST", url, true);
	xml.send(data);
}
function handle_result(type, result) {
	//common stuff
	hideLoader();

	//console.log('________________',typeof result, '\nresult', result, '\ntype', type);
	window[type + '_2handleResult'](result);
	//window['present_' + type](data);
	//common stuff
}
function handle_drag_and_drop(e) {
	if (e.type == "dragover") {
		e.preventDefault();
		mClass(e.target, "dragging");
	} else if (e.type == "dragleave") {
		mClassRemove(e.target, "dragging");
	} else if (e.type == "drop") {
		e.preventDefault();
		DA.imageChanged = true;
		mClassRemove(e.target, "dragging");
		mDropImage(e, e.target);
		//let uimg = mBy('dUserImage');		mDropImage(e, uimg);
		//uimg.src = `../base/assets/images/${Username}.jpg`;

	} else {
		mClassRemove(e.target, "dragging");
	}
}
function sendHtml(id, filename) {
	window.scrollTo(0, 0);
	html2canvas(document.getElementById(id)).then(function (canvas) {
		var ajax = new XMLHttpRequest();
		ajax.open("POST", "php/account.php", true);
		ajax.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		ajax.send("image=" + canvas.toDataURL("image/jpeg", 0.9) + "&filename=" + filename + ".jpg");
		ajax.onreadystatechange = function () {
			if (this.readyState == 4 && this.status == 200) {
				console.log('RESPONSE IMAGE UPLOAD!!!!!!!', this.responseText);
				//window.location = "index.php?user="+Username;
				let elem = document.getElementById('dUserImage');
				elem.src = '../uploadHtmlSimple/' + filename + '.jpg';
				let elem2 = document.getElementById('imgPreview');
				elem.src = elem2.src;
			}

		};
	});
}

async function loadassets() {
	//console.log('...local loading');
	C52 = await localOrRoute('C52', '../base/assets/c52.yaml');
	symbolDict = Syms = await localOrRoute('syms', '../base/assets/allSyms.yaml');
	SymKeys = Object.keys(Syms);
	ByGroupSubgroup = await localOrRoute('gsg', '../base/assets/symGSG.yaml');
	WordP = await route_path_yaml_dict('../base/assets/math/allWP.yaml');
	DB = await route_path_yaml_dict('../DB.yaml');
	start();
}

function getProfileImagePath(userrecord){
	let dir = '../base/assets/images/';
	let path = dir + (userrecord.hasImage ? userrecord.username : 'unknown_user') + '.jpg';
	return path;
}




