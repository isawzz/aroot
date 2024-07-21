function server_receive(result, type, callback) {
	//if (type == "modify_table") { console.log('______from server:', type, '\nresult:', result); }// return; }
	if (result.trim() == "") return; var obj = JSON.parse(result);
	console.log('obj', obj, 'result size', result.length);
	convert_from_server(obj); //number strings => number, players => list, string starting with '{'=:JSON.parse
	switch (type) {
		case 'games': S.tables = obj.tables; S.tables_by_game = arr_to_dict_by(S.tables, 'game'); callback(); break;
		case 'create_table_and_start': parse_table_and_players(obj); callback(); break;
		case 'delete_table': callback(obj); break;
		case 'reset_tables': callback(obj); break;

		default: break;

	}
}
function server_send(req, type, callback) {
	var xml = new XMLHttpRequest();
	var loader_holder = mBy("loader_holder");
	loader_holder.className = "loader_on";

	xml.onload = function () {
		if (xml.readyState == 4 || xml.status == 200) {
			loader_holder.className = "loader_off";
			// console.log('xml.responseText', xml.responseText);
			server_receive(xml.responseText, type, callback);
		}
	}
	var data = { req: req, type: type };
	data = JSON.stringify(data);
	xml.open("POST", "./server/apimin.php", true);
	xml.send(data);
}
