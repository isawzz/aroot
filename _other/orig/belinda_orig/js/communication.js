async function postCors(url, data, type, handle_result) {
	data.data_type = type;
	var formData = new FormData();
	for (const k in data) {
		formData.append(k, data[k]);
	}
	let h = new Headers();
	h.append('Accept', 'application/text');
	var resp = await fetch(url, {
		method: 'POST',
		mode: 'cors', // no-cors, *cors, same-origin
		headers: h,
		body: formData,
	});
	let result = await resp.text();
	//console.log('result',result,'\ntype',typeof result);
	//safely turn this into a json object
	try {
		//let jsonResult = await resp.json();
		let jsonResult = JSON.parse(result);
		//console.log('***jsonResult', jsonResult); //SEHR GUT!
		if (isdef(handle_result)) handle_result(jsonResult); //console.log('type',typeof result,'\nresult',result);
	} catch {
		if (isdef(handle_result)) handle_result({ message: result }); //, data_type: 'info'}); //console.log('type',typeof result,'\nresult',result);
	}
}
function queryINSERT(data){
	let newData = {};
	for (const k in data) {
		let val = data[k];
		if (!isNumber(val)) newData[k] = "'" + val + "'"; else newData[k] = val;
		//else console.log(k, val);
	}

	let q = 'INSERT INTO users (' + Object.keys(newData).join() + ') VALUES (' + Object.values(newData).join(',') + ')';
	//console.log('communication: statement', q);
	return q;

}

function querySelectUser(data){
	let newData = {};
	for (const k in data) {
		let val = data[k];
		if (!isNumber(val)) newData[k] = "'" + val + "'"; else newData[k] = val;
	}

	let q = 'SELECT * FROM users WHERE username = ' + newData.username;
	//console.log('communication: statement', q);
	return q;

}









