function start_simple(){
	//define and style ui
	

	let uname = localStorage.getItem('uname');
	if (isdef(uname)) onclick_user(uname); else show_users(); 
}
function onclick_logout(){
	stopgame();
	hide('dTitle'); hide('aLogout'); hide('dTables');
	U=null;
	show_users();

}
function show_simple_ui(name) { 
	U = firstCond(Serverdata.users, x => x.name == name);
	localStorage.setItem('uname', U.name);
	dTitle = mBy('dTitle');
	show_title();
	show_logged_in_user_simple();
	dTitle.animate([{ opacity: 0 }, { opacity: 1 },], { fill: 'both', duration: 1000, easing: 'ease-in' });
	dTable = mBy('dTable'); //mStyle(dTable,{w:'100%',display:'flex'}) 
	
	hide('dUsers'); show('aLogout');
	hide('dTopMenu')
	let dStatus = mBy('dStatus'); mStyle(dStatus,{left:10,width:'50%',right:null});

	onclick_tables();

	//this is when switching from simple to advanced mode would be possible! but this is not really what I want!

	DA.testing = false;  return;
	hide('dButtons'); 
	hide('dTest0'); 
	hide('dTopAdvanced'); 
	toggle_games_off(); 
	toggle_tables_off();  
	toggle_users_on();
} 
function show_table_simple(tablename){
	hide('dTables');
	show('dTable');
	stopgame();
	let table = firstCond(Serverdata.tables, x => x.friendly == tablename);
	ensure_polling();
	phpPost({ friendly: tablename }, 'table');

}
function show_tables_simple() {

	let dParent = mBy('dTables');
	
	show(dParent); hide('dTable');
	clearElement(dParent);

	let tables = Serverdata.tables;
	if (isEmpty(tables)) { mText('no active game tables', dParent); return []; }

	mText(`<h1>game tables</h1>`, dParent, { maleft: 12 })
	let t = mDataTable(tables, dParent, null, ['game', 'friendly', 'players'], 'tables');

	mTableCommandify(t.rowitems, {
		1: (item, val) => hFunc(val, 'onclick_game_in_gametable', val, item.id),
	});

}
function show_logged_in_user_simple(){
	let uname = U.name;
	let sz = 36;
	let html = `
	<div username='${uname}' style='display:flex;align-items:center;gap:6px;height:100%'>
		<img src='../base/assets/images/${uname}.jpg' width='${sz}' height='${sz}' class='img_person' style='border:3px solid ${U.color};margin:0'>
		<span>${uname}</span>
	</div>`;
	show_title_right(html, { fg: U.color });

}
function show_status_simple(){

}




















