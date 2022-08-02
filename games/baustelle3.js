
function ui_get_rumors_and_players_items(uplayer) {
	//console.log('uplayer',uplayer,UI.players[uplayer])
	let items = [], i = 0;
	let comm = UI.players[uplayer].rumors;

	let [data, pl] = [Z.uplayer_data, Z.pl];
	// let data = firstCond(Z.playerdata, x => x.name == uplayer);
	assertion(isdef(data), 'no data for player ' + uplayer);

	console.log('ui: uplayer', Z.uplayer, 'data', data);
	sss();

	if (!isDict(data.state)) data.state = {remaining:jsCopy(pl.rumors),receivers:[],di:{}};
	let rem = data.state.remaining;
	for (const k of rem) {
		let o = firstCond(comm.items, x => x.key == k);
		let item = { o: o, a: o.key, key: o.key, friendly: o.short, path: comm.path, index: i };
		i++;
		items.push(item);
	}

	let players = [];

	// let receivers = valf(Z.fen.receivers, []);
	let receivers = data.state.receivers;
	console.log('receivers', receivers);

	for (const plname in UI.players) {
		if (plname == uplayer || receivers.includes(plname)) continue;
		players.push(plname);
	}
	items = items.concat(ui_get_string_items(players));

	//assertion(comm.items.length == players.length, 'irgendwas stimmt nicht mit rumors verteilung!!!!', players, comm)

	reindex_items(items);
	return items;
}


