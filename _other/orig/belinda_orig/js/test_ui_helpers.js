//#region misc helpers =>integrate with base eventually!
function ipadd(elem) {
	elem.setAttribute('draggable', true);

	function OnDragOver(ev) {
		elem.setAttribute('DragOver', true);
		ev.stopPropagation();    //  let child accept and don't pass up to parent element
		ev.preventDefault();     //  ios to accept drop
		ev.dataTransfer.dropEffect = 'copy';//   move has no icon? adding copy shows +
	}
	function OnDragLeave(ev) {
		elem.removeAttribute('DragOver');
	}
	function OnDrop(ev) {
		elem.removeAttribute('DragOver');
		ev.preventDefault();     //  dont let page attempt to load our data
		ev.stopPropagation();
		// elem.innerHTML = ev.dataTransfer.getData('text/plain');
		//console.log('drop');
		elem.innerHTML = ev.dataTransfer.getData('text/plain');
	}
	function OnDragStart(ev) {
		//console.log('insane!!!');
		//ev.preventDefault();
		ev.stopPropagation(); // let child take the drag
		ev.dataTransfer.dropEffect = 'move';
		ev.dataTransfer.setData('text/plain', this.innerHTML);
	}
	function OnClickClick(ev) {
		ev.preventDefault();     //  dont let page attempt to load our data
		ev.stopPropagation(); // let child take the drag
		//console.log('click', elem); //ev.target); return;
		//let el=ev.target;
		let aname = 'data_transport'; //hallo hallo hallo
		let source = DA[aname];
		if (isdef(source)) {
			//this is the second click!
			//console.log('click! WHAT THE FUCK??????????????????????????????');
			elem.innerHTML = source.innerHTML;
			toggleSelectionOfPicture(source);
			DA[aname] = null;
		} else {
			toggleSelectionOfPicture(elem);
			DA[aname] = elem;
		}
	}
	elem.addEventListener('dragstart', OnDragStart);
	elem.addEventListener('dragover', OnDragOver);
	elem.addEventListener('dragleave', OnDragLeave);
	elem.addEventListener('drop', OnDrop);
	elem.onclick = OnClickClick;
	DA.data_transport=null;
}

//#region chats 
function createMessageContent(messages, me, other) {
	let result = `<div id='messages_holder_parent' onclick='set_seen(event)' style='background:silver;height:680px;'>
	<div id='messages_holder' style='box-sizing:border-box;height:580px;padding:10px;margin-bottom:10px;overflow-y:auto;'>`;

	//result += `<div>start of chat with<img src="${other.imagePath} height=30 /></div><br>`;
	// result += `start of chat with ${other.username}<br>`;
	// result += `start of chat with ${other.imagePath}<br>`;
	result += `start of chat with ${other.username} <img src="${other.imagePath}" style="margin-left:10px;display:inline;height:30px;"/><br><br>`;

	for (const m of messages) {
		if (m.sender == me.username) { result += message_right(m, me); } else { result += message_left(m, other); }
	}
	result += message_controls(); //`</div></div>`;
	return result;
}
function message_left(msg, sender) {
	image = sender.imagePath;
	$a = `
	<div id='message_left'>
	<div></div>
		<img  id='prof_img' src='${image}' class='img_person sz50' style='float: left;margin:2px;'>
		<b>${sender.username}</b><br>
		${msg.message}<br><br>`;

	if (msg.files != "") {
		$a += `<img src='${msg.files}' style='margin:30px;cursor:pointer;' onclick='image_show(event)' /> <br>`;
	}
	$a += `<span style='font-size:11px;color:white;'>${msg.date}<span>
	<img id='trash' src='../base/assets/images/icons/trash.png' onclick='delete_message(event)' msgid='${msg.id}' />
	</div>`;

	return $a;
}
function message_right(msg, sender) {
	image = sender.imagePath;
	//console.log('imagePath',image)
	$a = `
	<div id='message_right'>

	<div>`;

	if (msg.seen) {
		$a += "<img src='../base/assets/images/tick.png' style=''/>";
	} else if (msg.received) {
		$a += "<img src='../base/assets/images/tick_grey.png' style=''/>";
	}

	$a += `</div>

		<img id='prof_img' src='${image}' style='float:right;margin:2px;' class='img_person sz50'>
		<b>${sender.username}</b><br>
		${msg.message}<br><br>`;

	if (msg.files != "") {
		$a += `<img src='${msg.files}' style='margin:30px;cursor:pointer;' onclick='image_show(event)' /> <br>`;
	}
	$a += `<span style='font-size:11px;color:#888;'>${msg.date}<span>

		<img id='trash' src='../base/assets/images/icons/trash.png' onclick='delete_message(event)' msgid='${msg.id}' />
	</div>`;

	return $a;
}
function message_controls() {

	return `
	</div>
	<div style='display:flex;gap:10px;padding:10px;box-sizing:border-box;width:100%;height:60px;'>
		<label for='message_file'><img src='../base/assets/images/icons/clip.png' style='opacity:0.8;width:30px;cursor:pointer;' ></label>
		<input type='file' id='message_file' name='file' style='display:none' onchange='send_image(this.files)' />
		<input id='message_text' onkeyup='enter_pressed(event)' style='flex:6;border:solid thin #ccc;border-bottom:none;font-size:14px;padding:4px;outline:none;' type='text' placeHolder='type your message'/>
		<input style='flex:1;cursor:pointer;outline:none;' type='button' value='send' onclick='send_message(event)'/>
	</div>
	<span onclick='delete_thread(event)' style='color:white;cursor:pointer;'>Delete this thread </span>
	</div>`;
}

//#region account
function addColorPicker(){
	let form = mBy('myform');
	let img = mBy('imgPreview');
	let picker = mColorPickerBehavior(U.settings.userColor, img, form,
		(a) => { console.log('new color is', a); DA.newColor = a; DA.colorChanged = true; },//d.style.background = a;DA.UserColor = a; }, 
		{ w: 322, h: 45, bg: 'green', rounding: 6, margin: 'auto', align: 'center' });
}
function createAccountContent(userdata) {
	DA.imageChanged = DA.colorChanged = false;
	return `
	<style type="text/css">
		 
		@keyframes appear1{
		 0%{opacity:0;transform: translateY(50px) rotate(5deg);transform-origin:100% 100%;}
		 100%{opacity:1;transform: translateY(0px) rotate(0deg);transform-origin:100% 100%;}
		}

		form{
		 margin: auto;
		 padding: 10px;
		 width:100%;
		 max-width: 400px;
		}

		input[type=text],input[type=password],input[type=button]{

		 padding:10px;
		 margin: 10px;
		 width: 300px;
		 border-radius: 5px;
		 border:solid 1px grey;
		 outline: none;
		 font-size:20px;
		}

		input[type=button]{
			width: 320px;
			cursor: pointer;
			background-color: #2b5488;
			color: white;
			font-size:16px;
		}

	 #error{

		 text-align: center;
		 padding: 0.5em;
		 background-color: #ecaf91;
		 color: white;
		 display: none;
	 }

	 .dragging{
		 border: dashed 2px #aaa;
	 }

	 </style>

	<div style="max-width=500px; margin-top:10px; display:flex; animation: appear1 1s ease;justify-content:center; align-content:center">
		<div id="error">some text</div>
		<div style='text-align:center'>
			<form id="myform" autocomplete="off" style='text-align:center'>
				<span style="font-size:11px;">drag and drop an image to change</span><br>
				<img id="imgPreview" onload='addColorPicker()' src='${userdata.imagePath + '?=' + Date.now()}' ondragover="handle_drag_and_drop(event)" ondrop="handle_drag_and_drop(event)" ondragleave="handle_drag_and_drop(event)"
					style="height:200px;margin:10px;" />
				<input id='iUsername' type="text" name="username" placeholder='username' value="${userdata.username}" autofocus
					onkeydown="if (event.keyCode === 13){event.preventDefault();console.log('WTF!!!!!!!!!!!!!!!!!!!!!!!!!!!!');collect_data(event);}" />
				<br />
				<input id='save_settings_button' type="button" value="Submit" onclick="collect_data(event)" ><br>
			</form>
	</div></div>
	`;
}
//unused
function createAccountContent1(userdata) {
	var d = mBy("inner_left_panel");
	clearElement(d);
	let d1 = mDiv(d, { w: '100%', matop: 10, animation: 'rotateIntoView 1s ease' });
	mCenterFlex(d1);
	let d2 = mDiv(d1, {}, 'error', 'hallo das ist ein error');
	let d3 = mDiv(d1, { align: 'center', bg: 'yellow' });
	let form = mCreate('form', { align: 'center', bg: 'red' }, 'myform');
	form.id = 'myform';
	form.setAttribute('autocomplete', 'off');
	// form.setAttribute('action', '');
	// form.setAttribute('method', '');
	form.onsubmit = (ev)=>{ev.preventDefault();collect_data();}
	mAppend(d3, form);
	//console.log('form', form, d1.children[1].firstChild); //YES!
	let sp1 = mSpan(form, { fz: 11 }, null, 'drag and drop an image to change');
	form.innerHTML += '<br>';
	DA.imageChanged = DA.colorChanged = false;
	let img = mImg(userdata.imagePath + '?=' + Date.now(), form, { h: 200, margin: 10 });
	img.onload = () => {
		//add colorThief here only!
		let inp = mCreate('input');
		mAppend(form, inp);
		inp.setAttribute('type', 'text');
		inp.setAttribute('placeholder', 'username');
		inp.setAttribute('name', 'username');
		inp.setAttribute('id', 'iUsername');
		inp.setAttribute('value', userdata.username);
		inp.setAttribute('autofocus', true);
		inp.onkeydown = ev => {
			if (ev.keyCode === 13) {
				ev.preventDefault();
				//console.log('WTF!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
				collect_data(ev);
			}
		};
		form.innerHTML += '<br />';
		let picker = mColorPickerBehavior(U.settings.userColor, img, form,
			(a) => { console.log('new color is', a); DA.newColor = a; DA.colorChanged = true; },//d.style.background = a;DA.UserColor = a; }, 
			{ w: 322, h: 45, bg: 'green', rounding: 6, margin: 'auto', align: 'center' });
		//picker.setAttribute('width','400px');
		form.innerHTML += `<input id='save_account_button' type="button" value="Submit" onclick="collect_data(event)" ><br>`;

	};
	img.id = 'imgPreview';
	img.setAttribute('allowDrop',true);
	img.ondragover = img.ondrop = img.ondragleave = handle_drag_and_drop;
}

//#region contacts
function createContactsContent(myusers, msgs) {
	let mydata = uiGetContactStylesAndStart();
	//console.log('\nmsgs', msgs);

	mydata += uiGetContacts(myusers, msgs);
	return mydata;
}
function uiGetContactStylesAndStart() {
	let mydata = `
	<style>
		@keyframes appear{

			0%{opacity:0;transform: translateY(50px)}
			100%{opacity:1;transform: translateY(0px)}
 		}

 		.contact{
 			cursor:pointer;
 			transition: all .5s cubic-bezier(0.68, -2, 0.265, 1.55);
	 	}

	 	.contact:hover{
	 		transform: scale(1.1);
	 	}

	</style>
	<div style="text-align: center; animation: appear 1s ease">`;
	return mydata;
}
function uiGetContact(row, msgs={}) {
	let image = `../base/assets/images/${row.image}`; //row.hasImage ? "../base/assets/images/row.image.jpg" : "../base/assets/images/unknown_user.jpg";
	//console.log('\nmsgs', msgs);

	let mydata = `
      <div class='contact' style='position:relative;text-align:center;margin-bottom:18px;' username='${row.username}' onclick='start_chat(event)'>
        <img src='${image}' draggable='true' ondragstart='drag(event)' class='img_person sz100' style='margin:0;'/>
        <br>${row.username}`;
	// <br><div style='text-align:center;'>row.username</div>";

	if (isdef(msgs[row.username])) {

		//console.log('sollte anzeigen new message von ',row.username)
		mydata += `<div style='width:20px;height:20px;border-radius:50%;background-color:orange;color:white;position:absolute;left:0px;top:0px;'>` + msgs[row.username] + "</div>";
	}

	mydata += "</div>";
	return mydata;

}
function uiGetContacts(myusers, msgs) {
	//console.log('\nmsgs', msgs);
	mydata = '';
	for (const r of myusers) {
		row = r;
		mydata += uiGetContact(row, msgs);
	}
	return mydata;
}

//#region games
function createGamesContent(mygames, tables = []) {
	let mydata = uiGetGamesStylesAndStart();
	mydata += uiGetGames(mygames, tables);
	return mydata;
}
function uiGetGamesStylesAndStart() {
	let mydata = `
	<style>
		@keyframes appear{

			0%{opacity:0;transform: translateY(50px)}
			100%{opacity:1;transform: translateY(0px)}
 		}

 		.contact{
 			cursor:pointer;
 			transition: all .5s cubic-bezier(0.68, -2, 0.265, 1.55);
	 	}

	 	.contact:hover{
	 		transform: scale(1.1);
	 	}

	</style>
	<div id='game_menu' style="text-align: center; animation: appear 1s ease">
  `;
	return mydata;
}
function uiGetGame(gi, tables = []) {
	let sym = Syms[gi.logo];
	let bg = getColorDictColor(gi.color);
	return `
	<div onclick="start_game(event)" gamename=${gi.id} style='cursor:pointer;border-radius:10px;margin:10px;padding:5px;padding-top:15px;width:120px;height:90px;display:inline-block;background:${bg}'>
	<span style='font-size:50px;font-family:${sym.family}'>${sym.text}</span><br>${gi.friendly}</div>
	`;
}
function uiGetGames(mygames, tables) {
	mydata = '';
	for (const r of mygames) {
		row = r;
		mydata += uiGetGame(row, tables);
	}
	return mydata;
}
