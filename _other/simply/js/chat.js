var ActiveChats = {}; //cache


function showChatWindow() { let d = mBy('dChatWindow'); mStyle(d, { display: 'block' }); return d; }

function deactivateChat(key) { 
	console.log('deactivate chat',key,ActiveChats[key]);
	mClassRemove(ActiveChats[key].div, 'activeChat'); clearChatWindow(); 
}
function clearChatWindow() { clearElement('dChatWindow'); }
function chatStartOrActivate() {
	if (nundef(DA.currentContact) && nundef(DA.activeChat)) {
		console.log('no current contact!');
	} else if (nundef(DA.currentContact)) {
		console.log('no current contact! - activate activeChat!');
		console.log('(nothing to do!)')
	} else if (DA.currentContact == DA.activeChat) {
		console.log('currentContact is already active', DA.currentContact);
		return;
	} else if (isdef(ActiveChats[DA.currentContact])) {
		console.log('messages have been loaded for', DA.currentContact, '- just activate');
		activateChat(DA.currentContact);
		console.log('if another contact was active, deactivate,');
		console.log('activate this new contact');
		//mClass()
	} else {
		console.log('new data for', DA.currentContact, 'have to be requested from phphost!');
		let data = { username: Username, currentContact: DA.currentContact, data_type: 'chat' };
		get_request('chat', data);
	}
}
function activateChat(username) {
	if (DA.activeChat == username) {console.log('already active:',username); return;}
	if (isdef(DA.activeChat) && DA.activeChat != username) deactivateChat(DA.activeChat);
	DA.activeChat = username;
	let active = ActiveChats[username];
	let othername = username;
	let mename = Username;
	let other = active.userdata;
	let me = Userdata;

	if (nundef(active.div)) {
		let dcontactlist = mBy('dChat');
		other.bg = randomColor();
		other.fg = colorIdealText(other.bg);
		let dContact = presentInChatList(other, dcontactlist);
		active.div = dContact;
		mStyle(dContact, { bg: other.bg, fg: other.fg });
		dContact.onclick = ()=>activateChat(username);
	} else {
		console.log('es gibt schon ein entry fuer', username, 'in chat menu',iDiv(active),'\nactive',active)
	}

	mClass(active.div,'activeChat');
	let d = showChatWindow();
	clearElement(d);

	console.log('add title to chatWindow!');

	for (const msg of active.messages) {
		let className = msg.sender == othername ? 'message_left' : 'message_right';
		let path = getProfileImagePath(msg.sender == othername ? other : me);
		let d1 = mDiv(d);
		if (msg.sender == othername) mStyle(d1, { bg: other.bg, fg: other.fg });
		let dImg = mImg(path, d1, { w: 40, h: 40, rounding: '50%' }, 'profile_img');
		let dtext = mText(msg.message, d1, {});
		mStyle(d1, { 'box-shadow': '0px 0px 10px #aaa', rounding: 10, padding: 10, matop: 10, display: 'flex', gap: 10, float: msg.sender == othername ? 'left' : 'right', w: '60%' });
	}

}
function chat_2handleResult(result) {
	//this will only happen when new contact or refresh contact
	result = JSON.parse(result);
	console.log('chat result:', result);
	ActiveChats[result.userdata.username] = result;
	activateChat(result.userdata.username);
}

function presentInChatList(result, dParent) {
	//"<div style='max-height:430px;text-align: center; animation: appear 4s ease'>"
	let d2 = mDiv(dParent, { display: 'flex', gap: 10, margin: 10, padding: 10, bg: 'white', fg: 'dimgray' });
	d2.setAttribute('username', result.username);// onclick='start_chat(event)'>
	// let dir = '../base/assets/images/';
	// let path = dir + (result.hasImage ? result.username : 'unknown_user') + '.jpg';

	let path = getProfileImagePath(result);
	let img = mImg(path, d2, { h: 50 });
	let d3 = mDiv(d2);//,{bg:'blue'});
	let name = mText(result.username, d3); //,{display:'inline'});
	//mText(result.username,d3); //,{display:'inline'});
	//mText(result.username,d3); //,{display:'inline'});
	return d2;
}


