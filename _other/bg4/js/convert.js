function convert_from_row(row){
	//row is modified!
	for(const k in row){
		let val=row[k];
		if (isNumber(val)) row[k]=Number(val);
		if (isString(val) && val[0]=='{') row[k]=JSON.parse(val);
		if (k=='players' && isString(row[k])) row[k]=val.split(',');
	}

}
function convert_from_server(obj){
	//console.log('obj',obj)
	if (isdef(obj.table)) convert_from_row(obj.table);
	if (isdef(obj.playerdata)){
		for(const row of obj.playerdata){
			convert_from_row(row);
		}
	}
	if (isdef(obj.moves)){
		for(const row of obj.moves){
			convert_from_row(row);
		}
	}
}












