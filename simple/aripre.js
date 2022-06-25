function ari_pre_action() {
	let [stage, A, fen, phase, uname, deck, market] = [z.stage, z.A, z.fen, z.phase, z.uname, z.deck, z.market];
	show_stage();
	switch (ARI.stage[stage]) {
		case 'journey': select_add_items(ui_get_hand_and_journey_items(uname), process_journey, 'journeys'); break;
		case 'auto market': ari_open_market(fen, phase, deck, market); break;
		case 'tax': let n=fen.pl_tax[uname];select_add_items(ui_get_hand_items(uname), post_tax, 'tax',n,n); break;
		case 'stall selection': select_add_items(ui_get_hand_items(uname), post_stall_selected, 'hand'); break;
		case 'action: command': z.stage = 6; select_add_items(ui_get_commands(uname), process_command, 'action', 1, 1); break;
		case 'action step 2':
			A.command = A.selected_key;
			//let txt_stage = isdef(z.A) && isdef(z.A.command) ? z.A.command : ARI.stage[z.stage]; console.log('command',z.A.command,'txt',txt_stage);
			show_stage();

			switch (A.command) {
				case 'trade': select_add_items(ui_get_trade_items(uname), post_trade, 'trading cards'); break;
				case 'build': select_add_items(ui_get_payment_items('K'), payment_complete, 'pay', 1, 1); break;
				case 'upgrade': select_add_items(ui_get_payment_items('K'), payment_complete, 'pay', 1, 1); break;
				//case 'downgrade': select_add_items(ui_get_payment_items('K'), payment_complete, 'pay'); break; // wenn's was kostet
				case 'downgrade': select_add_items(ui_get_building_items(uname, A.payment), process_downgrade, 'downgrade', 1,1); break;
				case 'pickup': select_add_items(ui_get_stall_items(uname), post_pickup, 'stall', 1, 1); break;
				case 'harvest': select_add_items(ui_get_harvest_items(uname), post_harvest, 'harvest', 1, 1); break;
				case 'sell': select_add_items(ui_get_stall_items(uname), post_sell, 'sell',2,2); break;
				case 'buy': select_add_items(ui_get_payment_items('J'), payment_complete, 'pay', 1, 1); break;
				case 'exchange': select_add_items(ui_get_exchange_items(uname), post_exchange, 'exchange'); break;
				case 'visit': select_add_items(ui_get_payment_items('Q'), payment_complete, 'pay', 1,1); break;
				case 'pass': post_pass();break;
				case 'commission': select_add_items(ui_get_commission_items(uname), process_commission, 'commission',1,1); break;
			}
			break;
		case 'build': select_add_items(ui_get_build_items(uname, A.payment), post_build, 'build', 4, 6); break;
		case 'commission new': select_add_items(ui_get_commission_new_items(uname), post_commission, 'commission', 1, 1); break;
		case 'upgrade': select_add_items(ui_get_build_items(uname, A.payment), process_upgrade, 'upgrade'); break;
		case 'select building to upgrade': select_add_items(ui_get_farms_estates_items(uname), post_upgrade, 'buildings', 1, 1); break;
		case 'select downgrade cards': select_add_items(A.possible_downgrade_cards, post_downgrade, 'downgrade'); break;
		case 'buy': select_add_items(ui_get_open_discard_items(uname, A.payment), post_buy, 'buy', 1, 1); break;
		case 'visit': select_add_items(ui_get_other_buildings(uname, A.payment), process_visit, 'visit',1,1); break;
		case 'visit destroy': select_add_items(ui_get_string_items(uname, ['destroy', 'get cash']), post_visit, 'visit', 1, 1); break;
		case 'ball': select_add_items(ui_get_hand_items(uname), post_ball, 'action'); break;
		case 'auction: bid': select_add_items(ui_get_coin_amounts(uname), process_auction, 'bid', 1, 1); break;
		case 'auction: buy': select_add_items(ui_get_market_items(), post_auction, 'buy', 1, 1); break;
		case 'end game?': select_add_items(ui_get_endgame(uname), post_endgame, 'end game?', 1, 1); break;
		case 'add new journey': post_new_journey(); break;
		case 'pick luxury or journey cards': select_add_items(ui_get_string_items(uname, ['luxury cards', 'journey cards']), post_luxury_or_journey_cards, 'get cards', 1, 1); break;
		//case 'downgrade': select_add_items(ui_get_building_items(uname, A.payment), process_downgrade, 'downgrade'); break; // wenn's was kostet
		//case 'payment action': select_add_items(ui_get_payment_items(), payment_complete, 'pay'); break;
		default: console.log('stage is', stage); break;
	}

}

function ari_globalize(g, uname) {
	DA.uname = uname; DA.g = g;

	//console.log('haaaaaaaaaaaaaaaaaaaaaa')
	z = {};
	z.A = { level: 0, di: {}, ll: [], items: [], selected: [], tree: null, breadcrumbs: [], sib: [], command: null };
	copyKeys(DA.g, z);
	copyKeys(jsCopy(DA.g.fen), z);
	copyKeys(UI, z);
	z.uname = uname;

	// console.log('globals',z);
	// console.log('stage',z.stage);


}




//testing
function test_endgame(){
	let [A, fen, uname] = [z.A, z.fen, z.uname];
	fen.actionsCompleted = [];

	//erstmal: jeder bakommt ein chateau + 1 or 2 random buildings!
	//erstmal: alle players bekommen 3-5 correct buildings
	for(const plname of fen.plorder){
		add_a_correct_building_to(fen,plname,'chateau');
		add_a_correct_building_to(fen,plname,rChoose(['farm','estate','chateau']));
		if (coin()) add_a_correct_building_to(fen,plname,rChoose(['farm','estate','chateau']));
		fen.actionsCompleted.push(plname);
	}

	//test_skip_to_actions();
	z.stage = 5;
	z.phase = 'king';
	turn_send_move_update();

}
function test_add_schwein(){
	let [A, fen, uname] = [z.A, z.fen, z.uname];

	let type=rChoose(['farm','estate','chateau']);
	let keys=deck_deal(fen.deck,type[0]=='f'?4:type[0]=='e'?5:6);
	fen.players[uname].buildings[type].push({list:keys,h:null});
	turn_send_move_update();

}
function add_a_correct_building_to(fen,uname,type){
	let ranks = lookupSet(DA,['test','extra','ranks'],'A3456789TJQK');
	let r=ranks[0];lookupSetOverride(DA,['test','extra','ranks'],ranks.substring(1));
	let keys=[`${r}So`,`${r}Ho`,`${r}Co`,`${r}Do`];
	if (type != 'farm') keys.push(`${r}Cp`); if (type == 'chateau') keys.push(`${r}Hp`); 
	fen.players[uname].buildings[type].push({list:keys,h:null});
}
function test_add_building(){
	let [A, fen, uname] = [z.A, z.fen, z.uname];
	let type=rChoose(['farm','estate','chateau']);
	add_a_correct_building_to(fen,uname,type);
	turn_send_move_update();

}
function testSplitIntoNumbersAndWords(){
	let ss = ['1k 2queen','1 k 12 q','12king2queen','31 ace 2queen','1 3 3 4','1 10 3 8','1J3As','12 koenig 2 Ass'];
	for(const s of ss){
		let x = splitIntoNumbersAndWords(s);
		//console.log('s',s,'x',x);
	}
}
function test_skip_to_tax() {
	let [A, fen, uname] = [z.A, z.fen, z.uname];

	//was soll da geschehen?
	z.phase = 'jack';
	z.stage = 5;
	let iturn = fen.plorder.length - 1;
	z.turn = [fen.plorder[iturn]];
	fen.actionsCompleted = fen.plorder.slice(0, iturn);
	console.log('fen.actionsCompleted', fen.actionsCompleted);

	//add 0 to 5 cards to each player's hand
	for (const plname in fen.players) {
		let pl = fen.players[plname];
		pl.hand = pl.hand.concat(deck_deal(fen.deck, rNumber(0, 5)));
	}

	turn_send_move_update();

}
function test_skip_to_actions() {
	let [A, fen, uname] = [z.A, z.fen, z.uname];

	//was soll da geschehen?
	z.phase = 'king';
	z.stage = 5;
	fen.actionsCompleted = [];

	//empty market into pl with min hand!
	let i = arrMinMax(fen.plorder, x => fen.players[x].hand.length).imin;
	let pl_min_hand = fen.plorder[i];
	console.log('pl w/ min hand is', pl_min_hand);
	let pl = fen.players[pl_min_hand];
	pl.hand = pl.hand.concat(fen.market);
	fen.market = deck_deal(fen.deck, 2);

	//each player gets a random stall (1 to hand length)
	for (const plname of fen.plorder) {
		pl = fen.players[plname];
		let n = rNumber(1, pl.hand.length);
		pl.stall = pl.hand.splice(0, n);

	}

	z.turn = [fen.plorder[rNumber(0, fen.plorder.length - 1)]];
	fen.total_pl_actions = fen.num_actions = fen.players[z.turn[0]].stall.length;
	fen.action_number = 1;

	turn_send_move_update();

}
function testjourney0() {
	let [fen, uname] = [z.fen, z.uname];

	let plist = find_players_with_potential_journey(fen);
	console.log('journey players', plist);
	if (!plist.includes(uname)) {
		set_nextplayer_after_journey(); //der macht ja auch find_players_with_potential_journey .....
		console.log('z.turn', z.turn)
		turn_send_move_update();
	}

}
function testanim1() {
	let [fen, phase, deck, market] = [z.fen, z.phase, z.deck, z.market];

	DA.qanim = [];
	let n_market = phase == 'jack' ? 3 : 2;
	fen.stage = z.stage = phase == 'jack' ? 12 : phase == 'queen' ? 11 : 4;

	for (let i = 0; i < n_market; i++) {
		DA.qanim = DA.qanim.concat([
			[qanim_flip_topmost, [deck]],
			[qanim_move_topmost, [deck, market]],
			[q_move_topmost, [deck, market]],
		]);
	}
	DA.qanim.push([q_mirror_fen, ['deck', 'market']]);
	DA.qanim.push([ari_pre_action, []]);
	qanim();
}
function testanim0() {
	let [fen, phase, stage, deck, market] = [z.fen, z.phase, z.stage, z.deck, z.market];

	let ms = 400;
	let item = deck.topmost;
	mAnimate(iDiv(item), 'transform', [`scale(1,1)`, `scale(0,1)`],
		() => {
			if (item.faceUp) face_down(item); else face_up(item);
			mAnimate(iDiv(item), 'transform', [`scale(0,1)`, `scale(1,1)`], null,
				ms / 2, 'ease-in', 0, 'both');
		}, ms / 2, 'ease-out', 100, 'both');


}






