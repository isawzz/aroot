
function changeUserTo(name) {
	if (name != Username) { save_user(); }
	mBy('spUser').innerHTML = name;
	loadUser(name);
	startUnit();
}
function cleanupOldGame() {
	updateUserScore();//this saves user data + clears the score.nTotal,nCorrect,nCorrect1!!!!!
	//console.log('haaaaaaaaaaaaaaaaaaaaaaaaa')
	//clear previous game (timeouts...)
	if (isdef(G)) { G.clear(); }
	clearTable();
	clearStats();
	clearFleetingMessage();

}
function editableUsernameUi(dParent) {
	//console.log('creating input elem for user', Username)
	let inp = mEditableInput(dParent, 'user: ', Username);
	inp.id = 'spUser';
	inp.addEventListener('focusout', () => { changeUserTo(inp.innerHTML.toLowerCase()); });
	return inp;
}
function getUserStartLevel(game) { return valf(lookup(U, ['games', game, 'startLevel']), 0); }
function getUserStartLevel_dep(game) { gInfo = U.games[game]; level = isdef(gInfo) && isdef(gInfo.startLevel) ? gInfo.startLevel : 0; return level; }
function loadUFromDB(newUser) {
	//determine Username

	if (newUser == Username && isdef(U)) { return; } //console.log('user up to date! ' + Username); return; }

	Username = isdef(newUser) ? newUser : localStorage.getItem('user');
	if (nundef(Username)) Username = DEFAULTUSERNAME;

	//console.log('User',Username)
	//console.log('U anfang von loadUser', U, '\nDB', DB.users[Username]);
	// make sure there are data in DB.users
	let uData = lookupSet(DB, ['users', Username]);
	if (!uData) {
		if (startsWith(newUser, 'test')) { uData = DB.users[Username] = jsCopy(DB.users.test0); uData.id = Username; }
		else { uData = DB.users[Username] = jsCopy(DB.users.guest0); uData.id = Username; }
	}
	//DB ist jetzt erweitert falls dieser user nicht existiert hat!

	U = DB.users[Username]; //load user data
	//console.log('color vorher', lookup(U, ['settings', 'userColor']));

	//ensure U.games and U.settings and U.settings.userColor
	if (nundef(U.games)) U.games = jsCopy(DB.users.guest0.games);
	lookupSet(U, ['settings', 'userColor'], randomColor());
	//console.log('color nachher', lookup(U, ['settings', 'userColor']));

	return U;
}
function loadUser(newUser, game) {

	//if (Username == newUser) return;
	cleanupOldGame();

	//load U from db
	loadUFromDB(newUser);

	//der rest ab hier wird nur gemacht wenn Play! oder in Belinda: verwendet nur U

	//show user name on screen
	if (PROJECTNAME.startsWith('bel')) showUsernameOnScreen(true);

	//determine game
	if (nundef(game)) {
		game = !window.navigator.onLine && U.lastGame == 'gSayPic' ? 'gTouchPic' : U.lastGame; //do NOT start in gSayPic if no internet!!!
		if (nundef(game)) game = U.avGames[0];
	}
	console.assert(isdef(game), "user.js: no game in loadUser!!!!!!!");
	//determine level
	//let gInfo = U.games[game]; let level = isdef(gInfo) && isdef(gInfo.startLevel) ? gInfo.startLevel : 0;

	setGame(game);
}
function showUsernameOnScreen(isEditable=true){
	let uiName = 'spUser';
	let dUser = mBy(uiName);
	if (isdef(dUser)) return;
	dUser = isEditable? editableUsernameUi(dLineTopLeft):mText(Username, dLineTopLeft);
	dUser.id = uiName; 
}
function save_user(db_dirty = true) {

	//console.log('save_user:', Username,G.id,G.level); //_getFunctionsNameThatCalledThisFunction()); 
	if (isdef(G)) U.lastGame = G.id;
	if (!startsWith(Username, 'test')) localStorage.setItem('user', Username);

	DB.users[Username] = U;
	if (db_dirty) db_save();
}
function setNextGame() {
	let game = G.id;
	let i = U.avGames.indexOf(game);
	let iNew = (i + 1) % U.avGames.length;
	setGame(U.avGames[iNew]);
}
function updateUserScore() {
	if (nundef(Score.nTotal) || Score.nTotal <= 0) return;

	let sc = { nTotal: Score.nTotal, nCorrect: Score.nCorrect, nCorrect1: Score.nCorrect1, nWins: Score.nWins, nLoses: Score.nLoses, nTied: Score.nTied };
	let g = G.id;

	let recOld = lookupSet(U, ['games', g], { startLevel: 0, nTotal: 0, nCorrect: 0, nCorrect1: 0, nWins: 0, nLoses: 0, nTied: 0 });
	let recSession = lookupSet(U, ['session', g], { startLevel: 0, nTotal: 0, nCorrect: 0, nCorrect1: 0, nWins: 0, nLoses: 0, nTied: 0 });

	addByKey(sc, recSession);
	let counts = DB.games[g].controllerType == 'solo' ? recSession.nWins : recSession.nCorrect;
	recSession.percentage = Math.round(100 * counts / recSession.nTotal);

	addByKey(sc, recOld);
	counts = DB.games[g].controllerType == 'solo' ? recOld.nWins : recOld.nCorrect;
	recOld.percentage = Math.round(100 * recOld.nCorrect / recOld.nTotal);

	// console.log('updated user score for', U.id, g, sc, recSession);
	//console.log('updated user score session', recSession);
	Score.nTotal = Score.nCorrect = Score.nCorrect1 = 0;
	save_user();
}
function userUpdate(proplist, val) {
	lookupSetOverride(U, proplist, val);
	save_user();
}

