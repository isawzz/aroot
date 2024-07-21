function onClickContact(ev) {	
	el = evToClass(ev, 'contact');	
	DA.currentContact = el.getAttribute('username');	
	onClickMenu('chat');
}
function onClickSubmitUsernameChange(newUsername) { window.location = "index.php?user=" + newUsername; }
function onClickSubmitImageChange() { sendHtml('imgPreview', Username); DA.imageChanged = false; }

//sidebar menu
function onClickMenu(text) {
	let subMenu = capitalize(text);
	let id = 'd' + subMenu;
	console.log('menu id clicked:',id);
	if (id == getVisibleChild('dInnerLeft')) { console.log('NOPE!'); return; } //this menu is already active

	let delay1 = hideCurrent();
	setTimeout(() => {
		let delay2 = text == 'chat' || text == 'tables' ? closeLeftPane() : openLeftPane();
		setTimeout(() => { showCurrent(id); window['onClickMenu' + subMenu](); }, delay2 + 100);
	}, delay1 + 100);

}
function onClickMenuGames() { show_games(); }
function onClickMenuTables() { }

async function onClickMenuChat() {
	chatStartOrActivate();
}
function onClickMenuContacts() { get_data('contacts'); }
function onClickMenuAccount() { show_account(); }



function onClick_belinda() { window.location = '../belinda/index.php'; }
function onClick_books() { closeLeftPane(); }
function onClick_cardgames() { closeLeftPane(); }

function onClickGamesMenu(text) {
	console.log('clicked on menu: ', text);
	console.log('open menu is ', getVisibleChild('dGames'));

	let id = 'd' + capitalize(text);
	if (id == getVisibleChild('dGames')) { console.log('NOPE!'); return; }
	transitionTo(id);
	window['onClick_' + text]();



}










