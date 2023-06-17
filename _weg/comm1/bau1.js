function phpPost(data, cmd) {
	var o = {};
	o.data = valf(data, {});
	o.cmd = cmd;
	o = JSON.stringify(o);

  var xml = new XMLHttpRequest();
	xml.onload = function () {
		if (xml.readyState == 4 || xml.status == 200) {
			handle_result(xml.responseText, cmd);
		} else { console.log('WTF?????') }
	}
	xml.open("POST", "php/index.php", true);
	xml.send(o);
}
function phpStart(file) {
  window.location.href = `../comm/php/${file}.php`;
  // console.log('hallo!')
  // var xml = new XMLHttpRequest();
	// xml.open("GET", `php/${file}.php`, true);
}








