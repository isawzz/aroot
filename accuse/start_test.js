onload=_start();

DA.SIMSIM = true; DA.exclusive = true; DA.TESTSTART1 = true; //DA.sendmax = 3; 

async function _start(){
	Sayings = await route_path_yaml_dict('../base/assets/accuse/wise/sayings.yaml');
	//console.log('sayings:',Sayings);

	//DB = await route_path_yaml_dict('./base/DB.yaml');	console.log('DB',DB);	return; //OK!
	Serverdata = await load_assets_fetch('../base/', '../accuse/'); //war vorher './easy/' !!!!!!!!!!!!!!!!!!!!!!!! 
	//console.log('Serverdata',Serverdata); return; //OK!
	let uname = DA.secretuser = 'mimi'; //localStorage.getItem('uname');
	U = firstCond(Serverdata.users, x => x.name == uname);
	assertion(isdef(U), 'user not found');

	show_home_logo(); 
	TESTING = true; //DA.AUTOSWITCH = true;
	show_username(); 

	start_with_assets();
}
function start_with_assets() { 
	start_tests(); 
}
function landing() { if (isdef(DA.landing)) DA.landing(); } //onclick_by_rank(); } //show_strategy_popup(); } //onclick_random(); }//show_history_popup(); }
function start_tests() {
	fentest2_accuse(); //fentest_wise();
	//#region old tests
	//dTable = mBy('dTable'); mCenterFlex(dTable); mStyle(dTable, { hmin: 500 }); mClass(dTable, 'wood')
	//ltest6_bluff_skin();	//ltest11_ferro_discard(); //ltest10_ferro_sim();  //ltest5_jokerhtml(); 	//ltest4_sheriff(); 	//ltest0_card();
	//ltest31_ferro_rollback(); //ltest29_ferro_play(); //ltest28_ferro_jolly_complex(); //ltest27_ferro_commands(); //ltest26_ferro_endgame(); //ltest12_ferro_buy();
	//ltest21_spotit(); //ltest20_spotit_adaptive();	//	ltest23_aristo_building_downgrade();
	//test100_partial_sequences(); 
	//ltest44_ferro_7R(); //ltest37_ferro_4_players(); //ltest35_ferro_sequence_anlegen(); //ltest31_ferro_rollback();
	//test_ferro_is_set(); //
	//ltest43_fritz_discard_pile();
	//ltest52_aristo_church_empty(); //ltest23_aristo_building_downgrade(); //ltest50_aristo_church();
	//ltest55_fritz_set_with_same_suits(); //ltest54_fritz_outoftime();
	//ltest56_algo_overlapping_sets(); //
	//ltest55_fritz_set_with_same_suits();
	//console.log('arrFunc',arrFunc(4,rCard));	console.log('rCard',rCard('r'));
	//ltest59_arrTakeLast();
	//ltest65_stamp(); //ltest58_aristo_building_rumor_harvest();
	//ltest69_ferro_is_group(); //
	//ltest70_aristo_church(); //ltest57_aristo();
	//ltest82_ferro(); //ltest85_card_short_text(); //ltest83_svg();
	//ltest89_aristo_journey();
	//ltest93_bluff(); //ltest90_bluff(); //ltest90_bluff_ueberbiete();
	//ltest82_ferro(); //ltest_aristo_simple(); //ltest110_fritz(); //ltest108_animate_coin(); //ltest38_ferro_end_of_round(); //ltest109_spotit(); //ltest93_bluff(); //ltest110_auction(); //ltest102_luxurycard(); //ltest101_commission(); //ltest100_auction();//ltest97_find_sequences(); //ltest96_aristo_visit(); //ltest95_aristo_rumor_action();
	//#endregion
	//ltest99_fritz(); //ltest_aristo_simple(); //ltest105_aristo_church(); //ltest107_aristo_build(); //ltest111_start();
}



//stubs & helpers
function get_texture(name) { return `url(/./base/assets/images/textures/${name}.png)`; }
function _poll() { return; }
//function clear_screen() { } //console.log('...clear_screen'); }
function stopgame() { console.log('...stopgame',getFunctionsNameThatCalledThisFunction()); }








