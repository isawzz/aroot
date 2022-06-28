var FirstLoad = true;
onload = start;

function start() {
	//test6_generate_statement(); return;//test4_boa_main(); return; //test5_bw_skin(); return;//test4_boa_main(); return; //test3_boa_havecode(); return;
	mAppear('dScreen', 100);
	if (FirstLoad) { FirstLoad = false; initialize_state(); } //show_master_password(); }
	get_toolbar();
	//#region test
	//show_eval_message(false);
	//start_challenge2();
	//onclick_location('skype');	S.skype_contact = DIBOA.skype.contacts[DIBOA.skype.contacts.length - 1];	show_skype_contact(DIBOA.skype.divRight)
	//S.bw_state = 'loggedin'; bw_widget_popup();
	// onclick_popup('bw');
	//onclick_location('boa');
	//onclick_bigredloginbutton();
	//fillout_boa_login();
	//#endregion
}
function initialize_state() {
	//var S = { location: null, boa_state: null, bw_state: null, master_password: 'Ab33', score: 0, };
	let dpop = mBy('dPopup'); dpop.onclick = ev => evNoBubble(ev);
	onclick = close_popup;
	onkeyup = keyhandler;
	let state = localStorage.getItem('boa');
	if (state) S = JSON.parse(state); else S = { location: null, boa_state: null, bw_state: null, master_password: 'Ab33', score: 0, };
	let score = S.score;
	if (score >= 10) { set_new_password(); }
	S.location = 'home'; // home | boa 
	S.bw_state = 'loggedin'; // loggedin | expired | loggedout;
	S.boa_state = null;
	//console.log('load_boa', S);
}

function start_challenge1() {
	DA.challenge = 1;
	DA.name = 'Login';
	scrollToTop();
	onclick_location('boa');
}
function start_challenge2() {
	DA.challenge = 2;
	DA.name = 'Bill Pay';
	scrollToTop();
	boamain_start();
	show_bill_button();
}
function start_challenge3() {
	DA.challenge = 3;
	DA.name = 'Full Bill Pay';
	scrollToTop();
	onclick_location('boa');
}

function add_verify_content(dParent) {
	let d1 = mDiv(dParent);
	let [dl, dr] = mColFlex(d1, [4, 1]);
	dr.innerHTML = img_html('verify_right.jpg');
	let d2 = mDiv(dl, { w: '100%', padding: 12, box: true });
	let d3 = mDiv(d2, { fz: 22, weight: 900, rounding: 4, hmin: 50, border: '3px solid black' }, null, 'Request Authorization Code');
	let d4 = mDiv(dl, { w: '100%', padding: 12, box: true, fz: 14, family: 'Verdana' }, null, 'To verify your identity, we need to send you an authorization code');
	let d5 = mDiv(dl, { w: '100%', matop: 12, hpadding: 12, box: true, fz: 14, family: 'Verdana' }, null, 'Select a Phone Number');

	let st1 = `padding:12px;font-size:18px;`;
	let stradio = `margin:5px 10px;color:black`;
	let html = `
		<div id='dPhoneContact' style="${st1}">
			<fieldset>
				<div style="${stradio}">
					<div>
						<input class="multipleContact" id="tlpvt-text1" name="phoneContact" value="text_1" type="radio" />
						<label for="tlpvt-text1">XXX-XXX-7382</label>
						<div class="clearboth"></div>
					</div>
				</div>
				<div style="${stradio}">
					<div class="phone-num">
						<input class="multipleContact" id="tlpvt-text2" name="phoneContact" value="text_2" type="radio" />
						<label class="TL_NPI_L1" for="tlpvt-text2">XXX-XXX-9671</label>
						<div class="clearboth"></div>
					</div>
				</div>
				<div style="${stradio}">
					<div class="phone-num">
						<input class="multipleContact" id="tlpvt-text3" name="phoneContact" value="text_3" type="radio" />
						<label class="TL_NPI_L1" for="tlpvt-text3">XXX-XXX-0297</label>
						<div class="clearboth"></div>
					</div>
				</div>
			</fieldset>
		</div>

	`;
	mAppend(dl, mCreateFrom(html));

	let d7 = mDiv(dl, { w: '100%', matop: 12, hpadding: 12, box: true, fz: 14, family: 'Verdana' }, null, 'How would you like to receive it?');
	html = `
		<div id='dTextOrPhone' style="${st1}">
			<fieldset>
				<div style="${stradio}">
					<div>
						<input class="multipleContact" id="tph-text1" name="textorphone" value="text_1" type="radio" checked />
						<label for="tph-text1">Text message</label>
						<div class="clearboth"></div>
					</div>
				</div>
				<div style="${stradio}">
					<div class="phone-num">
						<input class="multipleContact" id="tph-text2" name="textorphone" value="text_2" type="radio" />
						<label class="TL_NPI_L1" for="tph-text2">Phone call</label>
						<div class="clearboth"></div>
					</div>
				</div>
			</fieldset>
		</div>

	`;
	mAppend(dl, mCreateFrom(html));

	let d9 = mDiv(dl, { w: '100%', matop: 12, hpadding: 12, box: true, fz: 14, family: 'Verdana' }, null, 'The code expires 10 minutes after you request it');

	let d10 = mDiv(dl, { w: '100%', matop: 12, hpadding: 12, box: true, fz: 14, family: 'Verdana' }, null, '<a>Having trouble receiving you code by phone?</a>');

	let d11 = mDiv(dl, { w: '100%', matop: 12, hpadding: 12, box: true, fz: 14, family: 'Verdana' }, null, 'You are consenting to be contacted at the phone number selected for the purpose of receiving an authorization code. If you selected text message, Wireless and text message fees may apply from you carrier.<br>Supported carriers include AT&T, Sprint, T-Mobile, US Cellular, Verizon, or any other branded wireless operator.');

	let d12 = mDiv(dl, { hpadding: 12, matop: 24, gap: 12 }); mFlex(d12);
	let bstyle = { vpadding: 12, hpadding: 20, fz: 20, fg: 'grey', rounding: 6, maright: 25, weight: 'bold' };
	mButton('SEND CODE', onclick_boa_sendcode, d12, bstyle);
	mButton('CANCEL', onclick_boa_cancel, d12, bstyle);
}
function add_havecode_content(dParent) {
	let d1 = mDiv(dParent);
	let [dl, dr] = mColFlex(d1, [4, 1]);
	dr.innerHTML = img_html('verify_right.jpg');
	let d2 = mDiv(dl, { w: '100%', padding: 12, box: true });
	let d3 = mDiv(d2, { fz: 22, weight: 900, rounding: 4, hmin: 50, border: 'none' }, null, 'Enter Authorization Code');
	let d4 = mDiv(dl, { w: '100%', padding: 12, box: true, fz: 14, family: 'Verdana' }, null, 'An authorization code was sent to your phone');
	let d5 = mDiv(dl, { w: '100%', matop: 12, mabottom: 20, hpadding: 12, box: true, fz: 14, family: 'Verdana' }, null, 'XXX-XXX-0297');

	let html = `
		<div>
			<form action="javascript:onclick_boa_submit_code();">
				<div>
					<label for="inpAuthocode">Authorization code</label><br>
					<input style="border:1px dotted silver;padding:4px" id="inpAuthocode" name="authocode" value="XXXXXX" type="text" />
					<div class="clearboth"></div>
				</div>
				<div style="font-size:12px;margin:30px 0px">The code expires 10 minutes after you request it.</div>
				<a style="font-size:12px;">Request another authorization code</a>
				<div style="margin-top:30px"><button id='bSubmit'>SUBMIT</button><button id='bCancel'>CANCEL</button></div>
			</form>
		</div>
	`;


	let d6 = mDiv(dl, { w: '100%', matop: 12, hpadding: 12, box: true, fz: 14, family: 'Verdana' }, null, html);
	let bSubmit = document.getElementById('bSubmit');
	let bStyle = { vpadding: 6, hpadding: 20, fz: 20, rounding: 6, maright: 25, weight: 'bold' };
	mStyle(bSubmit, bStyle);
	mStyle(bCancel, bStyle); mStyle(bCancel, { fg: 'grey', border: 'grey' })
	mClass(bSubmit, 'btn-bofa-blue');
	bCancel.onclick = onclick_boa_cancel;
}
function add_make_payments_button(ev) {
	let id = evToClosestId(ev);
	let inp = mBy(id);

	if (isdef(DA.prevHidden)) { mClear(DA.prevHidden); }
	let dHidden = inp.parentNode.parentNode.parentNode.parentNode.parentNode.lastChild;
	mClear(dHidden);
	let d1 = mCard(dHidden, { w: '90%', padding: 10, box: true });
	let el = mDiv(d1, { cursor: 'pointer' }, null, `<span class="btn-bofa btn-bofa-blue btn-bofa-blue-lock">Make Payments</span>`);
	el.onclick = () => make_payments_challenge_eval(inp);

	//mAppend(dHidden,mBy('dummy'))
	//console.log('parent', parent);

	//window.scrollTo(window.screenY,0);
	//el.scrollIntoView();
	DA.prevHidden = dHidden;

}
function bw_login_popup() {
	let html = `
		<div id="dBw" class="mystyle" style="background:silver;padding:12px">
			<div id="dBWLogin">
				<form action="javascript:check_bw_master_password()" id="fBitwarden">
					<label for="inputPassword">Enter Master Password:</label>
					<input type="password" id="inputPassword" placeholder="" />
				</form>
				<div id="bw_login_status" style="color:red"></div>
			</div>
		</div>
	`;
	let d = mCreateFrom(html);
	let dParent = mBy('dPopup');
	show(dParent);
	mClear(dParent);
	mStyle(dParent, { top: 50, right: 10 });
	mAppend(dParent, d);
	document.getElementById("inputPassword").focus();
}
function boa_start() {
	let d = mBy('dBoa');
	mClear(d);
	mAppend(d, get_header_top('Log In')); //Mobile and Online Bill Pay'),[''])
	mAppend(d, get_red_header('Mobile and Online Bill Pay', true));
	mAppend(d, get_boa_start_content());
	let footer = mAppend(d, get_boa_footer1());
	mStyle(footer, { matop: 100, hmax: 150 });
	//mStyle(footer,{position:'absolute',bottom:0,left:0,right:0,hmax:150});

	S.boa_loggedin = false;
}
function boa_save() { localStorage.setItem('boa', JSON.stringify(S)); }
function boalogin_start() {
	let d = mBy('dBoa');
	mClear(d);
	mAppend(d, get_header_top(''));
	mAppend(d, get_red_header('Log In to Online Banking'));
	mAppend(d, get_boalogin_html());
	mAppend(d, get_boa_footer2());
	S.boa_state = 'loginform'; //no need to save!
	let elem = get_boa_userid_input(); //console.log('elem', elem);
	elem.onfocus = () => { bw_symbol_pulse(); S.current_input = get_boa_userid_input(); S.current_label = 'userid'; };
	let elem2 = get_boa_pwd_input(); //console.log('elem', elem);
	elem2.onfocus = () => { bw_symbol_pulse(); S.current_input = get_boa_pwd_input(); S.current_label = 'pwd'; };
}
function boamain_start() {
	//console.log('haaaaaaaaaaaaaaaaa');
	S.boa_state = 'authorized';

	//hier start timer that will reset boa_state to null
	if (DA.challenge == 1) {
		TO.boa = setTimeout(() => {
			S.boa_state = null;
			let msg = DA.challenge == 1 ? 'CONGRATULATIONS!!!! YOU SUCCEEDED IN LOGGING IN TO BOA' : 'Session timed out!';
			show_eval_message(true);
		}, 3000);
	} else if (DA.challenge == 3) show_bill_button(); 
	show_correct_location('boa');  //das ist um alle anderen screens zu loeschen!
	let dParent = mBy('dBoa'); mClear(dParent);
	let d0 = mDiv(dParent, { align: 'center' }, 'dBoaMain'); mCenterFlex(d0);
	let [wtotal, wleft, wright] = [972, 972 - 298, 292];
	let d = mDiv(d0, { w: wtotal, hmin: 500 }); mAppend(d, createImage('boamain_header.png', { h: 111 }));
	let dl = mDiv(d, { float: 'left', w: wleft, hmin: 400 });
	let dr = mDiv(d, { float: 'right', hmin: 400, w: wright });
	mDiv(dr, { h: 100 });
	mAppend(dr, createImage('boamain_rechts.png', { w: 292 }));
	mAppend(dl, createImage('boamain_left_top.jpg', { matop: 50, maleft: -20 }));
	mDiv(dl, { bg: '#857363', fg: 'white', fz: 15 }, null, '&nbsp;&nbsp;<i class="fa fa-caret-down"></i>&nbsp;&nbsp;Default Group<div style="float:right;">Sort&nbsp;&nbsp;</div>');
	let boadata = get_fake_boa_data_list();
	let color_alt = '#F9F7F4';
	let i = 0;
	for (const o of boadata) {
		let k = o.key;
		o.index = i;
		let logo = valf(o.logo, 'defaultacct.jpg');
		let path = `${logo}`;
		let [sz, bg] = [25, i % 2 ? 'white' : color_alt];

		let dall = mDiv(dl, { bg: bg, fg: '#FCFCFC', 'border-bottom': '1px dotted silver' }, `dAccount${i}`);
		let da = mDiv(dall);
		mFlexLR(da);

		let img = createImage(path, { h: sz, margin: 10 });

		let da1 = mDiv(da);
		mAppend(da1, img);
		let dtext = mDiv(da1, { align: 'left', display: 'inline-block', fg: '#FCFCFC', fz: 14 });
		mAppend(dtext, mCreateFrom(`<a>${k}</a>`));
		let dsub = mDiv(dtext, { fg: 'dimgray', fz: 12 }, null, o.sub);

		let da2 = mDiv(da); mFlex(da2);
		let da21 = mDiv(da2, { w: 100, hmargin: 20, mabottom: 20 });
		let padinput = 7;
		mDiv(da21, { fg: 'black', fz: 12, weight: 'bold' }, null, 'Amount');
		mDiv(da21, { w: 100 }, null, `<input onfocus="add_make_payments_button(event)" style="color:dimgray;font-size:14px;border:1px dotted silver;padding:${padinput}px;width:85px" id="inp${i}" name="authocode" value="$" type="text" />`);

		let da22 = mDiv(da2, { maright: 10 });
		mDiv(da22, { fg: 'black', fz: 12, weight: 'bold' }, null, 'Deliver By');
		mDiv(da22, {}, null, `<input style="color:dimgray;font-size:12px;border:1px dotted silver;padding:${padinput}px" id="inpAuthocode" name="authocode" value="" type="date" />`);

		let dabot = mDiv(dall);
		mFlexLR(dabot);
		let lastpayment = isdef(o['Last Payment']) ? `Last Payment: ${o['Last Payment']}` : ' ';
		mDiv(dabot, { fz: 12, fg: '#303030', maleft: 10, mabottom: 25 }, null, `${lastpayment}`);
		mDiv(dabot, { fz: 12, fg: 'blue', maright: 90, mabottom: 25 }, null, `<a>Activity</a>&nbsp;&nbsp;&nbsp;<a>Reminders</a>&nbsp;&nbsp;&nbsp;<a>AutoPay</a>`);

		mDiv(dall);

		i++;
	}
}
function boaverify_start() {
	let d = mBy('dBoa');
	mClear(d);
	mAppend(d, get_header_top('Extra Security At Sign-in')); //Mobile and Online Bill Pay'),[''])
	mAppend(d, get_red_header('Verify Your Identity'));
	add_verify_content(d);
	mAppend(d, get_boa_footer2());
}
function boahavecode_start() {
	let d = mBy('dBoa');
	mClear(d);
	mAppend(d, get_header_top('Extra Security At Sign-in')); //Mobile and Online Bill Pay'),[''])
	mAppend(d, get_red_header('Verify Your Identity'));
	add_havecode_content(d);
	mAppend(d, get_boa_footer2());

	//S.boa_authorization_code = rDigits(6).join('').toUpperCase();
	S.boa_state = 'authorization_pending';
	console.log(S.boa_authorization_code);

}
function bw_symbol_pulse() { let elem = mBy('tbbw'); if (nundef(elem)) return; else { mPulse1(elem); } } //console.log('elem', elem); } }
function bw_list_entry(d, key, loginOrCard = 'login') {
	let logins = loginOrCard == 'login' ? get_fake_bw_logins() : get_fake_bw_cards();
	let login = logins[key];

	let d4 = mDiv(d, { bg: 'white', fg: 'black', 'border-bottom': '1px dotted #ddd' });
	let d5 = mDiv(d4, { display: 'flex' });

	let dimg = mDiv(d5, { bg: 'white', fg: 'black' }, null, `<img src='../rechnung/images/${login.logo}' height=14 style="margin:8px">`);
	let dtext = mDiv(d5, { cursor: 'pointer' }, null, `<div>${key}</div><div style="font-size:12px;color:gray">${login.sub}</div>`);
	dtext.onclick = () => onclick_bw_symbol(key)
	let d6 = mDiv(d4, { display: 'flex', padding: 2 });
	let disyms = {
		bwtext: { postfix: 'userid', matop: 2, maright: 0, mabottom: 0, maleft: 0, sz: 27 },
		bwcross: { postfix: 'cross', matop: 2, maright: 0, mabottom: 0, maleft: -13, sz: 25 },
		bwkey: { postfix: 'pwd', matop: 0, maright: 0, mabottom: 0, maleft: -12, sz: 27 },
		bwclock: { postfix: 'clock', matop: 0, maright: 0, mabottom: 0, maleft: 0, sz: 25 },
	}
	for (const k of ['bwtext', 'bwcross', 'bwkey']) { //,'bwclock']) {
		let o = disyms[k];
		let [filename, styles] = [k, disyms[k]];
		let path = `../rechnung/images/${filename}.png`;
		let [sz, ma] = [styles.sz, `${styles.matop}px ${styles.maright}px ${styles.mabottom}px ${styles.maleft}px`];
		//console.log('ma', ma);
		let img = mDiv(d6, { paright: 16 }, null, `<img src='${path}' height=${sz} style="margin:${ma}">`);
		if (k != 'bwcross') {
			mStyle(img, { cursor: 'pointer' });
			img.onclick = () => onclick_bw_symbol(key, o.postfix);
		}
	}
	mFlexSpacebetween(d4);
	return d4;
}
function bw_widget_popup(key = 'boa') {
	let dpop = mBy('dPopup');
	show(dpop); mClear(dpop)
	mStyle(dpop, { top: 50, right: 10, border: 'silver' });
	let prefix = key;
	let douter = mDiv(dpop, { wmin: 200, bg: 'white', fg: 'black', border: '1px single #ccc' }, 'dBw');

	//das wird dann ersetzt wenn search enable!!!
	let d2 = mDiv(douter, { padding: 0, h: 30 }, null, `<img width='100%' src='../rechnung/images/bwsearch.jpg'>`);
	//let d2 = mDiv(d, { bg: 'dodgerblue', fg: 'white' }, null, 'your bitwarden vault');

	let d = mDiv(douter, { padding: 0, hmax: 600, 'overflow-y': 'auto' });
	let dtb = mDiv(douter, { padding: 8 }); mFlexEvenly(dtb);
	let dibuttons = { tab: { top: 2, left: 0 }, vault: { top: 1, left: 3 }, send: { top: 2, left: 3 }, generator: { top: 2, left: 1 }, settings: { top: 4, left: 2 } };
	for (const bname in dibuttons) {
		let path = `../rechnung/images/bw${bname}.jpg`;
		let db = mDiv(dtb, { w: 60 }); mCenterFlex(db);
		let img = mDiv(db, { h: 36, w: 36, bg: 'white', position: 'relative' }, null, `<img style="position:absolute;top:${dibuttons[bname].top}px;left:${dibuttons[bname].left}px" src='${path}'>`);
		mLinebreak(db);
		let txt = mDiv(db, { fz: 12 }, null, capitalize(bname));
	}

	let d3 = mDiv(d, { bg: '#eee', fg: 'dimgray', padding: 8, matop: 8 }, null, 'LOGINS');
	bw_list_entry(d, key);

	let d7 = mDiv(d, { bg: '#eee', fg: 'dimgray', padding: 7 }, null, 'CARDS');

	//DAS ERSETZEN:
	//let d8 = mDiv(d, { fg: 'white' }, null, `<img width='100%' src='../rechnung/images/rest_bw.jpg'>`);
	let data = get_fake_bw_cards();
	let color_alt = '#F9F7F4';
	let i = 0;
	for (const k in data) {
		let dentry = bw_list_entry(d, k, 'cards');
	}


}
function close_popup() {
	//console.log('screen click');
	let dpop = mBy('dPopup');
	hide(dpop);
}
function check_bw_master_password() {
	let pw = mBy('inputPassword').value;
	if (pw === S.master_password) {
		//user entered master password
		set_boa_score(1);
		S.bw_state = 'loggedin';
		toggle_bw_symbol();
		hide('dPopup');
		//change to other symbol!!!
		//soll ich den bw_state saven? erst bei langem pwd

	} else {
		set_boa_score(-1);
		let d = mBy('bw_login_status');
		d.innerHTML = 'Incorrect Master Password';
	}
}
function enterOnlineIDFormSubmit() {
	var form = document.getElementById("EnterOnlineIDForm");
	//console.log(form);
	let userid = mBy("enterID-input");
	let pwd = mBy('tlpvt-passcode-input');
	//console.log('userid', userid.value, 'pwd', pwd.value)
	onclick_submit_boa_login();

}
function fillout_boa_login() {
	let data = DIBOA.bw_info.boa;
	let elem_userid = get_boa_userid_input();
	let elem_pwd = get_boa_pwd_input();
	elem_userid.value = data.userid;
	elem_pwd.value = data.pwd;
}
function generate_statement(dParent, boacc, brand) {

	let brand_colors = {
		usbank: 'navy', prime: 'skyblue', citibank: 'silver', wellsfargo: RED, BofA_rgb: 'navy', chase_bank: BLUE,
		comcast: 'orange', oasis: GREEN, PSE: 'gold', redmond: 'grey'
	};

	let date = new Date();

	let acc = { index: boacc.index, creditline: rNumber(0, 10) * 100, holder: 'Gunter Yang Lee', num: 242948572348, due: rDate(addWeekToDate(date, 4), addWeekToDate(date, 2)) }
	let nums = { prevbalance: rNumber(0, 100), payments: rNumber(100, 1000) + rNumber(0, 100) / 100, fees: rNumber(0, 100) };
	nums.balance = nums.prevbalance + nums.payments + nums.fees;
	acc.cashadvance = acc.creditline / 4;

	//acc.num should be a 12 digit number where the last 4 digits correspond to boacc.sub.substring(1)
	acc.num = acc.num.toString();
	acc.num = acc.num.substring(0, acc.num.length - 4) + boacc.sub.substring(1);
	acc.num = parseInt(acc.num);


	let [color, fromdate, todate] = [valf(brand_colors[brand], 'random'), addWeekToDate(date, -5), addWeekToDate(date, -1)];

	//#region header
	let d;
	if (nundef(dParent)) {
		let dpop = mBy('dPopup'); show(dpop); mClear(dpop); mStyle(dpop, { top: 50, right: 10 });
		d = mDiv(dpop, { padding: 10, border: '1px solid #ddd', bg: 'white', fg: 'black' });
	} else {
		mStyle(dParent, { 'justify-content': 'start' });
		d = mDiv(dParent);
	}
	mStyle(d, { bg: 'white', position: 'fixed', top: 50, right: 0, padding: 10 });

	let d1 = mDiv(d, { bg: color, h: 5, w: '100%' }); //horizontal line
	let dheader = mDiv(d, { fz: 12 }); //header part
	let [dl, dr] = mColFlex(dheader, [1, 3]); //, [BLUE, GREEN]);
	//mDiv(dl1, { weight: 'bold' }, null, `- your partner in business -`);
	let logo = createImage(`${brand}.png`, { hmax: 90, wmax: 300 });

	let dl1 = mDiv(dl, { hmax: 90, wmax: 400 }); mAppend(dl1, logo); //, null, img_html(`${brand}.png`));
	let dr1 = mDiv(dr, { align: 'right', paright: 10 });
	mDiv(dr1, {}, null, `Account Holder: ${acc.holder}`);
	mDiv(dr1, {}, null, `Account Number: ${acc.num}`);
	mDiv(dr1, {}, null, `Statement Period: ${date2locale(fromdate)} - ${date2locale(todate)}`);
	mDiv(dr1, {}, null, `Due Date: ${date2locale(acc.due)}`);
	mDiv(d, {}, null, '<br>');
	//#endregion
	let dmain = mDiv(d, { wmax: 600 }); //main part
	let [dlm, drm] = mColFlex(dmain, [1, 1.25]); //, [BLUE, GREEN]);
	let dlm1 = mDiv(dlm, { hmargin: 10, }, null, `ACCOUNT SUMMARY`);
	let dsum = mDiv(dlm, { hmargin: 10, rounding: 12, padding: 10, border: '1px solid #ccc', bg: 'white', fg: 'black' });
	mDivLR(dsum, { w: '100%' }, null, [`Previous Balance:`, `${format_currency(nums.prevbalance)}`]);
	mDivLR(dsum, { w: '100%' }, null, [`Payments and Credits:`, `${format_currency(nums.payments)}`]);
	mDivLR(dsum, { w: '100%' }, null, [`Purchases:`, `${format_currency(nums.payments)}`]);
	mDivLR(dsum, { w: '100%' }, null, [`Balance Transfers:`, `${format_currency(0)}`]);
	mDivLR(dsum, { w: '100%' }, null, [`Cash Advances:`, `${format_currency(0)}`]);
	mDivLR(dsum, { w: '100%' }, null, [`Fees Charged:`, `${format_currency(nums.fees)}`]);
	mDivLR(dsum, { w: '100%' }, null, [`Interest Charged:`, `${format_currency(0)}`]);
	mDivLR(dsum, { w: '100%' }, null, [`New Balance:`, `${format_currency(nums.balance)}`]);
	mDiv(dsum, { fz: 9, align: 'center' }, null, 'see interest charge calculation section following the Transactions section for detailed APR information');
	mLine(dsum, { fz: 10, align: 'center' });
	mDivLR(dsum, { w: '100%' }, null, [`Credit Line:`, `${format_currency(acc.creditline)}`]);
	mDivLR(dsum, { w: '100%' }, null, [`Credit Line Available:`, `${format_currency(acc.creditline)}`]);
	mDivLR(dsum, { w: '100%' }, null, [`Cash Advance Credit Line:`, `${format_currency(acc.cashadvance)}`]);
	mDivLR(dsum, { w: '100%' }, null, [`Cash Advance Credit Line Available:`, `${format_currency(acc.cashadvance)}`]);
	mDiv(dsum, {}, null, 'You may be able to avoid interest on purchases. See reverse for details');

	// mDiv(dsum,{},null,`Account Number: ${acc.num}`);
	// mDiv(dsum,{},null,`Statement Period: ${date2locale(fromdate)} - ${date2locale(todate)}`);
	// mDiv(dsum,{},null,`Due Date: ${date2locale(acc.due)}`);

	let drm1 = mDiv(drm, { hmargin: 10, }, null, `PAYMENT INFORMATION`);
	let dpay = mDiv(drm, { hmargin: 10, rounding: 12, padding: 10, border: '1px solid #ccc', bg: 'white', fg: 'black' });
	mDivLR(dpay, { w: '100%', weight: 'bold' }, null, [`New Balance:`, `${format_currency(nums.balance)}`]);
	mLine(dpay, { fz: 10, align: 'center' });
	mDivLR(dpay, { w: '100%' }, null, [`Minimum Payment Due:`, `${format_currency(nums.balance / 10)}`]);
	mDivLR(dpay, { w: '100%', weight: 'bold' }, null, [`Payment Due Date:`, `${date2locale(acc.due)}`]);
	mDiv(dpay, { fz: 9, matop: 10 }, null, '<b>Late Payment Warning:</b> If we do not receive your minimum payment by the date listed above, you may have to pay a fee of up to $10.00.');

	let drm2 = mDiv(drm, { matop: 10, hmargin: 10, }, null, `REWARDS`);
	let drewards = mDiv(drm, { hmargin: 10, rounding: 12, padding: 10, border: '1px solid #ccc', bg: 'white', fg: 'black' });
	mDivLR(drewards, { w: '100%', weight: 'bold' }, null, [`Cashback Bonus*:`, `Anniversary Month`]);
	mDivLR(drewards, { w: '100%' }, null, [`Opening Balance:`, `${format_currency(0)}`]);
	mDivLR(drewards, { w: '100%' }, null, [`New Cashback Bonus this Period:`, `${format_currency(4.98)}`]);
	mDivLR(drewards, { w: '100%' }, null, [`Redeemed this Period:`, `${format_currency(0)}`]);
	mLine(drewards, { fz: 10, align: 'center' });
	mDivLR(drewards, { w: '100%', weight: 'bold' }, null, [`Cashback Bonus Balance:`, `${format_currency(4.98)}`]);
	mDiv(drewards, { fz: 10 }, null, `<b>to learn more log in to www.${brand}.com</b>`);

	mDiv(d, { matop: 25, maleft: 6 }, null, img_html('statement2.jpg'));
	mDiv(d, {}, null, '<br>');
	let dbla1 = mDiv(d, { hmargin: 10, rounding: 12, padding: 10, border: '1px solid #ccc', bg: 'white', fg: 'black' });
	mAppend(dbla1, createImage('statement1.jpg', {}));
	mAppend(d, createImage('statementfooter.jpg', {}));


	return { div: d, nums: nums, acc: acc, topay: nums.balance, brand: brand, boacc: boacc };

}
function generate_skype_contacts(n) {
	let date = new Date();
	let res = [{ num: `+${rNumber(11111, 99999)}`, date: date, color: rChoose([ORANGE, PURPLE, 'deepskyblue', 'hotpink']), msg: `<#>'BofA': DO NOT share this S...` }];
	for (let i = 1; i < n; i++) {
		date = rDate(date, new Date(2022, 1, 1));
		let istext = coin();
		let [num, msg] = istext ? [`+${rNumber(11111, 99999)}`, `<#>${rChoose(['BofA', 'Prudential'])}: DO NOT share this S...`]
			: [`+1425${rNumber(1111111, 9999999)}`, `Missed Call`];
		let c = { num: num, date: date, color: rChoose([ORANGE, PURPLE, 'deepskyblue', 'hotpink']), msg: msg };
		res.push(c);
	}
	return res;
}
function get_fake_boa_data() { if (nundef(DA.boadata)) DA.boadata = DIBOA.boa_data; return DA.boadata; }
function get_fake_boa_data_list() { if (nundef(DA.boadata)) DA.boadata = dict2list(DIBOA.boa_data, 'key'); return DA.boadata; }
function get_fake_bw_cards() {
	const cards = {
		'amazon': { sub: '*5555', logo: 'visa.png' },
		'amex': { sub: '*4554', logo: 'amex.png' },
		'becu': { sub: '*1331', logo: 'mastercard.png' },
		'becu other': { sub: '*7575', logo: 'mastercard.png' },
		'boa debit': { sub: '*8585', logo: 'visa.png' },
		'boa leprop': { sub: '*0898', logo: 'visa.png' },
		'costco': { sub: '*6565', logo: 'visa.png' },
		'disco': { sub: '*1324', logo: 'discover.png' },
		'fidel rewards': { sub: '*6456', logo: 'visa.png' },
		'flexper': { sub: '*9789', logo: 'visa.png' },
		'heritage': { sub: '*3131', logo: 'mastercard.png' },
		'premblue': { sub: '*0898', logo: 'visa.png' },
		'visa2': { sub: '*0797', logo: 'visa.png' },
		'zz credit': { sub: '*1432', logo: 'visa.png' },
	};

	return cards;
}
function get_fake_bw_logins() {
	const logins = {
		'bw': { link: '', sub: 'gilee144', p: '', acc: '*5555', logo: 'bw.png' },
		'boa': { link: '', sub: 'gilee144', p: 'boa.png', acc: '*5555', logo: 'boa.png' },
		'authy': { link: '', sub: 'agfil22', p: 'authy.png', acc: '*5555', logo: 'authy.png' },
		'authenticator': { link: '', sub: 'amf234', p: '', acc: '*5555', logo: 'authenticator.png' },
		'skype': { link: '', sub: 'agile34', p: '', acc: '*5555', logo: 'skype.png' },
		'onedrive': { link: '', sub: 'agand23', p: '', acc: '*5555', logo: 'onedrive.png' },
	}
	return logins;
}
function get_boa_userid_input() { return document.getElementById('enterID-input'); }
function get_boa_pwd_input() { return document.getElementById('tlpvt-passcode-input'); }
function get_boalogin_html() {
	let html = `
		<div id="dBoaLogin" class="fsd-layout fsd-2c-700lt-layout">
			<div class="fsd-border">
				<div class="center-content">
					<div class="columns">
						<div class="flex-col lt-col">
							<div class="online-id-vipaa-module">
								<div class="enter-skin phoenix">
									<form
										class="simple-form collector-form-marker"
										name="enter-online-id-form"
										id="EnterOnlineIDForm"
										method=""
										action="javascript:onclick_submit_boa_login();"
										autocomplete="off"
										novalidate="novalidate"
									>
										<div class="online-id-section">
											<label for="enterID-input">
												User ID
												<span class="ada-hidden">Must be at least 6 characters long</span>
											</label>
											<input
												type="text"
												id="enterID-input"
												name="dummy-onlineId"
												maxlength="32"
												value=""
												autocomplete="off"
												class="cs-enterID-input"
												autocapitalize="none"
												autocorrect="off"
												spellcheck="false"
											/>
											<div class="remember-info">
												<input type="checkbox" id="remID" name="saveMyID" class="cs-remID" autocapitalize="none" autocorrect="off" spellcheck="false" />
												<label for="remID">Save this User ID</label>
												<a
													class="boa-dialog force-xlarge info-layer-help-fsd dotted"
													href="javascript:void(0);"
													name="online-id-help"
													rel="help-content"
													title="Help"
												>
													<span class="ada-hidden">Online ID Help</span>
													<span class="boa-ada-text ada-hidden">&nbsp;layer</span>
												</a>
												<div class="clearboth"></div>
											</div>
										</div>
										<input
											aria-hidden="true"
											type="password"
											class="tl-private cs-input"
											name="new-passcode"
											maxlength="20"
											style="display: none"
											value=""
											autocapitalize="none"
											autocorrect="off"
											spellcheck="false"
										/>
										<label for="tlpvt-passcode-input" class="mtop-15">
											Password
											<span class="ada-hidden">is unavailable. Please enter atleast 6 characters of online id to enable Passcode</span>
										</label>
										<div class="TL_NPI_Pass">
											<input
												type="password"
												class="tl-private fl-lt cs-tlpvt-passcode-input"
												id="tlpvt-passcode-input"
												name="dummy-passcode"
												maxlength="20"
												value=""
												autocomplete="off"
												autocapitalize="none"
												autocorrect="off"
												spellcheck="false"
											/>
										</div>

										<a href="#" class="fl-lt forgot-passcode" name="forgot-your-passcode">Forgot your Password?</a>
										<div class="clearboth"></div>
										<a
											href="javascript:void(0);"
											onclick="enterOnlineIDFormSubmit();"
											title="Log In"
											class="btn-bofa btn-bofa-blue btn-bofa-small behbio btn-bofa-noRight"
											name="enter-online-id-submit"
										>
											<span class="btn-bofa-blue-lock">Log In</span>
										</a>

										<a href="javascript:void(0);" id="signin-mobile-app" name="signin-mobile-app" class="displayNone">Log In with mobile app</a>

										<a href="javascript:void(0);" id="signin-with-passcode" name="signin-with-passcode" class="hidden">Log In with Password</a>

										<a href="javascript:void(0);" id="signin-with-windows-hello" name="signin-with-windows-hello" class="bold hidden">
											Log in with Windows Hello
										</a>
										<div class="digital-id-notify phoenix hidden" id="digital-id-success-message">
											<div class="digital-id-head">Check your mobile device</div>
											<span class="circle-animation">
												<div class="circle-inline">Loading</div>
												<div class="loading-circle circle-inline">
													<div class="circle-bounce1"></div>
													<div class="circle-bounce2"></div>
													<div class="circle-bounce3"></div>
												</div>
											</span>
											<p class="digital-id-msg">
												We sent a notification to your registered device. Verify your identity in the app now to log in to Online Banking.
											</p>
											<a href="javascript:void(0);" class="digital-id-link send-notification-again">Send notification again</a>
											<a href="javascript:void(0);" class="digital-id-link sign-in-with-passcode-instead">Log In with Password instead</a>
										</div>
										<div class="digital-id-notify phoenix hidden" id="digital-id-general-error">
											<div class="digital-id-head">Check your mobile device</div>
											<p class="digital-id-msg">
												If you're enrolled in this security feature, we sent a notification to your registered device. Verify your identity in the app now to
												log in to Online Banking.
											</p>
											<a href="javascript:void(0);" class="digital-id-link send-notification-again">Send notification again</a>
											<a href="javascript:void(0);" class="digital-id-link sign-in-with-passcode-instead">Log In with Password instead</a>
										</div>
										<div class="digital-id-notify phoenix hidden" id="digital-id-max-error">
											<div class="digital-id-head">Check your mobile device</div>

											<p class="digital-id-msg">We can't identify you at this time. Please use your User ID/Password to log in.</p>

											<a href="javascript:void(0);" class="digital-id-link sign-in-with-passcode-instead">Log In with Password instead</a>
										</div>
										<div class="clearboth"></div>
										<input type="hidden" name="_ia" id="_iaID" class="cs-_iaID" autocapitalize="none" autocorrect="off" spellcheck="false" />
										<input
											type="hidden"
											name="_u2support"
											id="u2supportID"
											value="1"
											class="cs-u2supportID"
											autocapitalize="none"
											autocorrect="off"
											spellcheck="false"
										/>
										<input
											type="hidden"
											name="webAuthAPI"
											id="webAuthAPIID"
											value="true"
											class="cs-webAuthAPIID"
											autocapitalize="none"
											autocorrect="off"
											spellcheck="false"
										/>
									</form>
									<!-- #region nach form -->

									<div id="fpContainer" class="" style="width: 50%"></div>
									<!-- Mobile CTA: Borneo version of 'Get the app' widget on the signOnV2 page -->
									<!-- Normal Scenario -->
									<div class="mobile-cta-section vertical-dotted-line fl-rt">
										<p class="cnx-regular title enroll-color-gray mbtm-10">Stay connected with our app</p>
										<img height="208" width="149" src="../rechnung/images/mobile_llama.png" alt="Mobile banking Llama" class="fl-lt" />
										<div class="get-app-content-section">
											<div class="cnx-regular title enroll-color-gray mcta-bubble">Secure, convenient banking anytime</div>
											<a
												id="choose-device-get-the-app"
												name="choose-device-get-the-app"
												class="choose-device-get-the-app-modal btn-bofa btn-bofa-red btn-bofa-noRight cnx-regular"
												href="javascript:void(0);"
												rel="mobile-app-download-choose-device"
											>
												<span>Get the app</span>
												<span class="ada-hidden">&nbsp; link opens a new info modal layer</span>
											</a>
										</div>
									</div>
									<!-- #endregion -->
								</div>
							</div>

							<!-- #region body rest -->

							<div class="modal-mobile-module hide">
								<div class="get-app-skin aps-mobile-products">
									<h3>{title}</h3>
									<div class="content-wrapper three-col">
										<div class="{storeLogo}">
											<div class="column app-box">
												<h4 class="sprite sprite-I5 sprited">
													Download directly to your mobile device.
													<div class="spr"></div>
												</h4>
												<a
													class="sprite store-icon {storeLogo} sprited"
													name="{storeName}"
													href="#"
													id="{storeId}"
													target="_blank"
												>
													<span class="ada-hidden">{storeLinkText}</span>
													<div class="spr"></div>
												</a>
												<p class="{notice}">{noticeText}</p>
											</div>
											<div class="column comm-box {text}{email}">
												<h4 class="sprite sprite-J5 {text} sprited">
													We'll text you a link to download the app.
													<div class="spr"></div>
												</h4>
												<h4 class="sprite sprite-L5 row-2 {email} sprited">
													We'll email you a link to download the app.
													<div class="spr"></div>
												</h4>
												<form action="" id="mobile_app_download_url">
													<div id="field-level-error" role="alert"><span class="ada-hidden"></span></div>
													<div class="{text}">
														<label
															class="ada-hidden"
															for="tlpvt-mob_app_download_phone_num"
															name="mobile_app_download_phone_prompt"
															id="mobile_app_download_phone_prompt"
														>
															{placeholderText}
														</label>
														<input
															type="text"
															name="mobile_app_download_phone_number"
															id="tlpvt-mob_app_download_phone_num"
															class="phone-input {text} tl-private cs-tlpvt-mob_app_download_phone_num"
															placeholder="{placeholderText}"
															autocapitalize="none"
															autocorrect="off"
															spellcheck="false"
														/>
													</div>
													<div class="{email}">
														<label
															class="ada-hidden"
															for="tlpvt-mob_app_download_email_id"
															name="mobile_app_download_email_prompt"
															id="mobile_app_download_email_prompt"
														>
															{emailPlaceholderText}
														</label>
														<input
															type="text"
															name="mobile_app_download_email_id"
															id="tlpvt-mob_app_download_email_id"
															class="email-input {email} tl-private cs-tlpvt-mob_app_download_email_id"
															placeholder="{emailPlaceholderText}"
															autocapitalize="none"
															autocorrect="off"
															spellcheck="false"
														/>
													</div>
													<a
														href="javascript:void(0);"
														name="anc-send-email-button"
														class="btn-bofa btn-bofa-small btn-bofa-noRight"
														id="mobile_app_download_send_button"
														onclick="onclick_button_line_844()"
													>
														Send
													</a>
													<div class="clearboth"></div>
													<p class="{text}">
														By providing your mobile number you are consenting to receive a text message. Text message fees may apply from your carrier. Text
														messages may be transmitted automatically.
													</p>
												</form>
											</div>
											<div class="column info-box">
												<h4 class="sprite sprite-K5 sprited">
													Visit bankofamerica.com in your mobile web browser for a link to download the app.
													<div class="spr"></div>
												</h4>
											</div>
										</div>

										<div class="other-device-info {deviceStatus}">
											<div>
												<p>Our mobile app is not available for all devices</p>
												<a
													href="#"
													class="style-link guillemet-right"
													name="anc_learn_more_about_phone_banking"
												>
													Learn about your Banking by Phone options&nbsp;
													<span class="guillemet ls-n1 f-11 ls-n2 guillement-set">��</span>
												</a>
											</div>
										</div>
										<div class="confirmation-screen hide">
											<div class="inline-ack-msg sprite sprite-D7 sprited">
												<span class="ada-hidden"></span>
												<span class="message"></span>
												<span id="inputHolder" class="TL_NPI_L1"></span>
												<div class="spr"></div>
											</div>
											<div class="button-wrapper">
												<a href="javascript:;" class="btn-bofa btn-bofa-blue btn-bofa-small" name="anc-close-button" id="confirmModalCloseButton">Close</a>
												<a href="javascript:;" class="btn-bofa btn-bofa-small btn-bofa-noRight" name="anc-send-another-link" id="confirmModalSendAnotherLink">
													Send another link
												</a>
											</div>
										</div>
										<div class="processing hide">
											<span class="ada-hidden">Please wait. Your request is being processed.</span>
											<span class="modal-skin-processing-text">Please wait...</span>
										</div>
										<div class="clearboth"></div>
									</div>
								</div>
							</div>

							<div id="mobile-app-download-flex-modal" class="aps-mobile-products"></div>

							<style type="text/css">
								.aps-mobile-products .sprite .spr {
									background-image: url('/content/images/ContextualSiteGraphics/Instructional/en_US/aps-mobile-products-icon-sprite-dev.png');
									background-size: 700px 550px;
								}
							</style>

							<div class="mobile-app-download-module hide" id="mobile-app-download-choose-device">
								<div class="choose-device-modal-skin">
									<h3>Select your device</h3>
									<div class="flex-modal-main-content">
										<p>Please select your device to continue:</p>
										<label for="device-pulldown" class="ada-hidden">Select your device. Press TAB to continue after making selection.</label>
										<select id="device-pulldown" name="device-pulldown" class="select-bofa">
											<option value="Select your device">Select your device</option>
											<option value="iPhone">iPhone</option>
											<option value="iPad">iPad</option>
											<option value="Android">Android</option>
											<option value="Other">Other</option>
										</select>
										<div class="clearboth"></div>
										<a
											href="javascript:void(0);"
											id="choose-device"
											class="btn-bofa btn-bofa-red btn-disabled get-app-modal-trigger btn-bofa-noRight"
											name="choose-device"
											rel="choose-device-modal"
										>
											Continue
											<span class="ada-hidden">&nbsp; link opens a new info modal layer</span>
										</a>
									</div>
								</div>
							</div>
							<style type="text/css">
								.aps-mobile-products .sprite-D5 > .spr {
									width: 50px !important;
									left: 25px !important;
									top: -5px !important;
								}
								.aps-mobile-products .sprite-J8 > .spr {
									height: 51px;
									width: 50px !important;
									background-position: -522px -410px !important;
									left: 30px !important;
								}
								.aps-mobile-products .sprite-F5 > .spr {
									width: 50px !important;
									left: 25px !important;
									top: -5px !important;
								}
							</style>
							<!-- #endregion body rest -->
						</div>
						<div class="flex-col rt-col">
							<div class="side-well-vipaa-module">
								<div class="fsd-ll-skin">
									<h2>Login help</h2>
									<ul class="li-pbtm-15">
										<li>
											<a class="arrow" href="#" name="Forgot ID/Password?">Forgot ID/Password?</a>
										</li>
										<li>
											<a class="arrow" href="#" name="Problem logging in?">Problem logging in?</a>
										</li>
									</ul>
								</div>
								<div class="fsd-ll-skin">
									<h2>Not using Online Banking?</h2>
									<ul class="li-pbtm-15">
										<li>
											<a class="arrow" href="#" name="Enroll_now">
												Enroll now
												<span class="ada-hidden">for online Banking</span>
											</a>
										</li>
										<li>
											<a class="arrow" href="#" name="Learn_more_about_Online_Banking_dotcom">
												Learn more about Online Banking
											</a>
										</li>
										<li>
											<a class="arrow" href="#" name="Service_Agreement_dotcom">
												Service Agreement
											</a>
										</li>
									</ul>
								</div>
							</div>
						</div>
						<div class="clearboth"></div>
					</div>
				</div>
			</div>
		</div>

	`;
	return mCreateFrom(html);
}
function get_boa_footer1() {
	return mCreateFrom(img_html('boa_footer.jpg', fulldim = 'width'));
}
function get_boa_footer2() {
	let d = mDiv(null, { matop: 25, padding: 10, box: true });
	mAppend(d, mCreateFrom(img_html('boa_footer2.jpg', fulldim = 'width')));
	return d;
}
function get_header_top(nebenLogo, links) {
	let html = `
		<div class="header-module">
			<div class="fsd-secure-esp-skin">
				<img height="28" width="230" alt="Bank of America" src="../rechnung/images/BofA_rgb.png" />
				<div class="page-type cnx-regular">${nebenLogo}</div>
				<div class="right-links">
					<div class="secure-area">Secure Area</div>
					<div class="clearboth"></div>
				</div>
				<div class="clearboth"></div>
			</div>
		</div>
	`;
	return mCreateFrom(html);
}
function get_red_header(title, show_login_button = false) {
	let html = `
		<div class="page-title-module h-100" id="skip-to-h1">
			<div class="red-grad-bar-skin sup-ie" style="display:flex;align-items:center;justify-content:space-between">
				<h1 id="dRedTitle" class="cnx-regular">${title}</h1>`;

	if (show_login_button) {
		html += `
			<div class="title-button">
				<a id="signinOnlineBankingBtnBillPay" href="javascript:onclick_bigredloginbutton()" class="spa-btn spa-btn--small spa-btn--white-border">Log in to Online Banking</a>
			</div>
						`;
	}
	html += `
			</div>
		</div>
	`;
	return mCreateFrom(html);

}
function get_boa_start_content() {
	let img = `<img src='../rechnung/images/boa_start_pic.JPG' width='100%'>`;
	return mCreateFrom(img);
}
function get_make_payments_button() {
	let html = `
		<a
			href="javascript:void(0);"
			onclick="make_payments();"
			class="btn-bofa btn-bofa-blue btn-bofa-small behbio btn-bofa-noRight"
			name="make-payments-submit"
			>
			<span class="btn-bofa  btn-bofa-blue-lock">Make Payments</span>
		</a>

	`;
}
function get_skype_expanded_message(msg) {
	if (msg[0] == 'M') { return msg; }
	return msg.slice(0, msg.length - 4) + `ign In code. We will NEVER call you or text you for it. Code ${rNumber(111111, 999999)}. Reply HELP if you didn't request it. `;
}
function get_skype_phone_icon(color) {
	let html = `
	<svg width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#0090B8" gradientcolor1="#0090B8" gradientcolor2="#0090B8"><path d="M14.75 13.666a2.75 2.75 0 00-2.745-2.745 2.75 2.75 0 00-2.744 2.745 2.75 2.75 0 002.744 2.744 2.75 2.75 0 002.744-2.744zm-4.117 0c0-.761.622-1.373 1.372-1.373.75 0 1.372.612 1.372 1.373 0 .75-.621 1.372-1.372 1.372-.75 0-1.372-.622-1.372-1.372zm7.547-.466a.69.69 0 00-.686.686v4.121a.69.69 0 01-.686.686H7.203a.69.69 0 01-.686-.686v-4.121a.69.69 0 00-.686-.686.69.69 0 00-.686.686v4.121c0 1.136.922 2.058 2.058 2.058h9.605a2.059 2.059 0 002.058-2.058v-4.121a.69.69 0 00-.686-.686z"></path><path d="M12 3.6c3.998-.005 6.703 1.53 8.585 3.192.792.699 1.154 1.75.966 2.736l-.19.995c-.177.932-1.048 1.558-2.036 1.463l-1.965-.19c-.856-.082-1.491-.708-1.76-1.596-.365-1.206-.6-2.1-.6-2.1-.897-.368-1.784-.6-3-.6s-2.085.258-3 .6c0 0-.245.895-.6 2.1-.237.805-.605 1.508-1.444 1.592l-1.953.197c-.975.098-1.91-.522-2.187-1.45l-.297-.996c-.296-.99-.032-2.033.693-2.736C4.922 5.147 8.008 3.605 12 3.6zm4.17 4.232l.03.114.119.43c.103.367.25.884.43 1.476.163.541.466.725.726.75l1.965.19c.415.04.69-.213.743-.493l.19-.995c.105-.557-.097-1.185-.582-1.613C18.08 6.182 15.648 4.795 12 4.8c-3.69.005-6.474 1.43-7.953 2.868-.395.383-.55.957-.38 1.532l.298.995c.11.368.505.641.917.6l1.954-.197a.156.156 0 00.064-.015.231.231 0 00.06-.06c.084-.106.183-.307.288-.662a138.653 138.653 0 00.55-1.923l.033-.116c.123-.44.55-.747.748-.846.983-.368 2.003-.676 3.42-.676 1.398 0 2.44.273 3.455.69.182.075.579.341.706.805l.002.009.007.028z"></path></svg>
	`;

	html = `
		<div role="none" style="position: relative; display: flex; flex-direction: row; flex-grow: 0; flex-shrink: 0; overflow: hidden; align-items: center; background: linear-gradient(135deg, rgb(240, 252, 255), rgb(199, 238, 255)) rgb(0, 120, 212); width: 40px; height: 40px; border-radius: 20px; justify-content: center;"><div role="none" aria-hidden="true" style="position: relative; display: flex; flex-direction: column; flex-grow: 0; flex-shrink: 0; overflow: hidden; align-items: stretch; background-color: rgba(0, 0, 0, 0);"><svg width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#0090B8" gradientcolor1="#0090B8" gradientcolor2="#0090B8"><path d="M14.75 13.666a2.75 2.75 0 00-2.745-2.745 2.75 2.75 0 00-2.744 2.745 2.75 2.75 0 002.744 2.744 2.75 2.75 0 002.744-2.744zm-4.117 0c0-.761.622-1.373 1.372-1.373.75 0 1.372.612 1.372 1.373 0 .75-.621 1.372-1.372 1.372-.75 0-1.372-.622-1.372-1.372zm7.547-.466a.69.69 0 00-.686.686v4.121a.69.69 0 01-.686.686H7.203a.69.69 0 01-.686-.686v-4.121a.69.69 0 00-.686-.686.69.69 0 00-.686.686v4.121c0 1.136.922 2.058 2.058 2.058h9.605a2.059 2.059 0 002.058-2.058v-4.121a.69.69 0 00-.686-.686z"></path><path d="M12 3.6c3.998-.005 6.703 1.53 8.585 3.192.792.699 1.154 1.75.966 2.736l-.19.995c-.177.932-1.048 1.558-2.036 1.463l-1.965-.19c-.856-.082-1.491-.708-1.76-1.596-.365-1.206-.6-2.1-.6-2.1-.897-.368-1.784-.6-3-.6s-2.085.258-3 .6c0 0-.245.895-.6 2.1-.237.805-.605 1.508-1.444 1.592l-1.953.197c-.975.098-1.91-.522-2.187-1.45l-.297-.996c-.296-.99-.032-2.033.693-2.736C4.922 5.147 8.008 3.605 12 3.6zm4.17 4.232l.03.114.119.43c.103.367.25.884.43 1.476.163.541.466.725.726.75l1.965.19c.415.04.69-.213.743-.493l.19-.995c.105-.557-.097-1.185-.582-1.613C18.08 6.182 15.648 4.795 12 4.8c-3.69.005-6.474 1.43-7.953 2.868-.395.383-.55.957-.38 1.532l.298.995c.11.368.505.641.917.6l1.954-.197a.156.156 0 00.064-.015.231.231 0 00.06-.06c.084-.106.183-.307.288-.662a138.653 138.653 0 00.55-1.923l.033-.116c.123-.44.55-.747.748-.846.983-.368 2.003-.676 3.42-.676 1.398 0 2.44.273 3.455.69.182.075.579.341.706.805l.002.009.007.028z"></path></svg></div></div>	
	`;

	html = `
		<div
			role="none"
			style="
				position: relative;
				display: flex;
				flex-direction: row;
				flex-grow: 0;
				flex-shrink: 0;
				overflow: hidden;
				align-items: center;
				background: linear-gradient(135deg, white, ${colorLight(color, .5)}, ${colorLight(color, .25)});
				width: 40px;
				height: 40px;
				border-radius: 20px;
				justify-content: center;
			"
		>
			<div
				role="none"
				aria-hidden="true"
				style="
					position: relative;
					display: flex;
					flex-direction: column;
					flex-grow: 0;
					flex-shrink: 0;
					overflow: hidden;
					align-items: stretch;
					background-color: rgba(0, 0, 0, 0);
				"
			>
				<svg width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" gradientcolor1="${color}" gradientcolor2="${color}">
					<path
						d="M14.75 13.666a2.75 2.75 0 00-2.745-2.745 2.75 2.75 0 00-2.744 2.745 2.75 2.75 0 002.744 2.744 2.75 2.75 0 002.744-2.744zm-4.117 0c0-.761.622-1.373 1.372-1.373.75 0 1.372.612 1.372 1.373 0 .75-.621 1.372-1.372 1.372-.75 0-1.372-.622-1.372-1.372zm7.547-.466a.69.69 0 00-.686.686v4.121a.69.69 0 01-.686.686H7.203a.69.69 0 01-.686-.686v-4.121a.69.69 0 00-.686-.686.69.69 0 00-.686.686v4.121c0 1.136.922 2.058 2.058 2.058h9.605a2.059 2.059 0 002.058-2.058v-4.121a.69.69 0 00-.686-.686z"
					></path>
					<path
						d="M12 3.6c3.998-.005 6.703 1.53 8.585 3.192.792.699 1.154 1.75.966 2.736l-.19.995c-.177.932-1.048 1.558-2.036 1.463l-1.965-.19c-.856-.082-1.491-.708-1.76-1.596-.365-1.206-.6-2.1-.6-2.1-.897-.368-1.784-.6-3-.6s-2.085.258-3 .6c0 0-.245.895-.6 2.1-.237.805-.605 1.508-1.444 1.592l-1.953.197c-.975.098-1.91-.522-2.187-1.45l-.297-.996c-.296-.99-.032-2.033.693-2.736C4.922 5.147 8.008 3.605 12 3.6zm4.17 4.232l.03.114.119.43c.103.367.25.884.43 1.476.163.541.466.725.726.75l1.965.19c.415.04.69-.213.743-.493l.19-.995c.105-.557-.097-1.185-.582-1.613C18.08 6.182 15.648 4.795 12 4.8c-3.69.005-6.474 1.43-7.953 2.868-.395.383-.55.957-.38 1.532l.298.995c.11.368.505.641.917.6l1.954-.197a.156.156 0 00.064-.015.231.231 0 00.06-.06c.084-.106.183-.307.288-.662a138.653 138.653 0 00.55-1.923l.033-.116c.123-.44.55-.747.748-.846.983-.368 2.003-.676 3.42-.676 1.398 0 2.44.273 3.455.69.182.075.579.341.706.805l.002.009.007.028z"
					></path>
				</svg>
			</div>
		</div>

	`;
	return mCreateFrom(html);
}
function get_toolbar(list) {
	//console.log('hallo')
	if (nundef(list)) list = ['home', 'boa', 'bw', 'authenticator', 'authy', 'onedrive', 'skype'];
	let d = mBy('dTop');
	// mDiv(d,{},'tbBoa',`<a href="../rechnung/boaa.html"><img id="bwlogo" src="../rechnung/boa/boa.png" height="30"/></a>`);
	mFlex(d);
	mStyle(d, { 'justify-content': 'space-between', padding: 10 });
	let dleft = mDiv(d, { display: 'flex', gap: 10 }, 'dTopLeft'); let dright = mDiv(d, { display: 'flex', gap: 10 }, 'dTopRight');
	for (const k of list) {
		let o = DIBOA[k];
		if (nundef(o)) { console.log('missing toolbar item: ' + k); continue; }
		let d1 = o.align == 'left' ? dleft : dright;
		let dsym = mDiv(d1, {}, `tb${k}`, `<a href="javascript:${o.pop ? 'onclick_popup' : 'onclick_location'}('${k}')"><img src="../rechnung/images/${o.img}" height="30"/></a>`);
		if (k == 'bw') {
			mStyle(dsym, { position: 'relative' });
			let elem = mCreateFrom(`<i class="fa fa-car"></i>`);
			mAppend(dsym, elem);
			let offset = 6;
			mStyle(elem, { fg: 'transparent', fz: 10, position: 'absolute', bottom: offset - 1, right: offset + 1 });
			//console.log('is_bw',is_bw())
			if (!is_bw()) toggle_bw_symbol(dsym);
		}
	}
}
function is_bw() {
	//find out bitwarden state
	let bw_state = S.bw_state; //localStorage.getItem('bw_state');
	//console.log('bw_state', bw_state);
	return bw_state == 'loggedin'; // isdef(bw_state);
}
function keyhandler(ev) {
	//console.log('ev',ev.keyCode,ev.shiftKey,ev.ctrlKey,ev.altKey);
	if (ev.key == 'Enter') { } //console.log('KEY:ENTER!');}
	else if (ev.key == 'Escape') { close_popup(); } //console.log('KEY:ESCAPE!');}
}
function make_payments_challenge_eval(inp) {
	let val = inp.value;
	//console.log('mit was muss ich das jetzt vergleichen',val);

	let solution = { amount: DA.bill.nums.balance, index: DA.bill.acc.index };
	let answer = { amount: Number(val.substring(1).trim()), index: Number(inp.id.substring(3)) };


	//console.log('solution',solution,'answer',answer);
	let correct = solution.amount.toFixed(2) == answer.amount.toFixed(2) && solution.index == answer.index;
	//if (correct) { console.log('CORRECT!!!!!!!!!'); } else { console.log('WRONG!!!!!!!!!', 'solution', solution, 'answer', answer); }
	show_eval_message(correct);
}
function onclick_bill() {
	//console.log('clicked bill');
	let dParent = mBy('dBoaMain');
	if (dParent.children.length > 1) dParent.lastChild.remove();

	//let accs = get_fake_boa_data();	let acclist = dict2list(accs).filter(x => isdef(x['Last Payment']));
	let acclist = get_fake_boa_data_list().filter(x => isdef(x['Last Payment']));
	//console.log('accs', acclist);
	let boacc = rChoose(acclist);

	let item = generate_statement(dParent, boacc, boacc.brand);
	DA.bill = item;
	lookupAddIfToList(DA, ['challengedata'], item);
	//console.log('item', item, DA);
	//item.boacc.sub
}
function onclick_bw_symbol(app, key) {
	if (nundef(key)) key = S.current_label;
	let s = lookup(DIBOA, ['bw_info', app, key]);
	//console.log('app', app, 'key', key, 's', s, '\nS', S);
	if (s && isdef(S.current_input)) {
		//hier brauch ich jetzt das field in dem ich war bevor bw opened!
		S.current_input.value = s;
	} else {
		console.log('no bw_info for', app, key);
	}
}
function onclick_boa_sendcode() {
	//extract data from code form above
	let list1 = get_checked_radios(mBy('dPhoneContact'));
	let list2 = get_checked_radios(mBy('dTextOrPhone'))
	console.log(list1, list2);
	let success_phone = list1.length == 1 && list1[0] == 'text_3';
	let success_textOrPhone = list2.length == 1 && list2[0] == 'text_1';

	let TESTSKIP = false;
	console.log('TESTSKIP', TESTSKIP);
	if (!TESTSKIP) {
		if (!success_phone) { alert("Please select the phone number ending in '0297'!"); return; }
		if (!success_textOrPhone) { alert("Please select the option 'Text message'!"); return; }
	}

	//SUCCESS! now open next form!
	boahavecode_start();

}
function onclick_boa_cancel() { onclick_location('home'); }
function onclick_bigredloginbutton() { boalogin_start(); }
function onclick_submit_boa_login() {
	let userid = get_boa_userid_input().value;
	let pwd = get_boa_pwd_input().value;
	let TESTSUCCESS = false; //true;
	if (TESTSUCCESS || userid == DIBOA.bw_info.boa.userid && pwd == DIBOA.bw_info.boa.pwd) {
		//console.log('SUCCESS!!!!!!! onclick_submit_boa_login', userid, pwd);

		//open next form
		boaverify_start();

	} else {
		console.log('FAIL!!!!!!! onclick_submit_boa_login', userid, pwd);
	}
}
function onclick_home() {
	onclick_location('home');
}
function onclick_location(k) {
	//console.log('_onclick_location', k);
	show_correct_location(k);
	if (k == 'boa') {
		console.log('boa_state', S.boa_state);
		if (S.boa_state == 'authorized') { boamain_start(); }
		else if (S.boa_state == 'authorization_pending') boahavecode_start();
		else { S.boa_state = 'start'; boa_start(); }
	} else if (k == 'skype') {
		skype_start();
	} else if (k == 'home') {
		let b = mBy('tbbill'); if (isdef(b)) b.remove();
		scrollToTop();
		S.boa_state = null;
		let dband = mBy('dBandMessage');
		if (isdef(dband)) mStyle(dband, { display: 'none', h: 0, hmin: 0 });
	}
}
function onclick_userid() {
	let userid = mBy("enterID-input");
	let pwd = mBy('tlpvt-passcode-input');
	console.log('userid', userid.value, 'pwd', pwd.value);
}
function onclick_popup(k) {

	let o = DIBOA[k];
	if (nundef(o)) { console.log('missing popup item: ' + k); return; }
	if (k == 'bw') {
		if (!is_bw()) {
			assertion(S.bw_state != 'loggedin', "bw_state is not set!!!!", S.bw_state);
			bw_login_popup();
		} else {
			bw_widget_popup();
		}
	} else { console.log('onclick_popup', k); }
}
function onclick_boa_submit_code() {
	//extract data from code form above
	let list1 = get_input_value('inpAuthocode');
	//console.log('code', list1, S.boa_authorization_code);

	let success_code = list1 == S.boa_authorization_code;

	if (!success_code) {
		show_eval_message(false);
		//alert("The code you entered was not correct! " + S.boa_authorization_code); 
		return;
	}

	//SUCCESS! now open next form!
	//console.log('Finally, open account list!!!!!');
	boamain_start();

}
function scrollToTop() {
	document.body.scrollTop = 0; // For Safari
	document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}
function show_bill_button() {
	if (isdef(mBy('tbbill'))) return;
	let tb = mBy('dTopRight');
	let b = mDiv(tb, {}, `tbbill`, `<a href="javascript:onclick_bill()"><img src="../rechnung/images/bill.png" height="30"/></a>`);
	mInsert(tb, b);
}
function show_master_password() {
	let score = localStorage.getItem('score');
	show_special_message('the bitwarden master password is ' + S.master_password, false, 5000, 2000, { bg: 'dodgerblue', classname: '', top: 400 });
}
function show_eval_message(correct) {
	let msg = correct ? `Congratulations!!! You passed the ${DA.name} challenge!` : 'Wrong solution - Try Again!';
	//show_special_message(msg, false, 5000, 2000, { bg: 'dodgerblue', position:'sticky', classname: 'special_message' },onclick_home);
	let d = valf(mBy('dBandMessage'), mDiv(document.body, {}, 'dBandMessage'));
	//console.log('dParent',dParent)
	show(d);
	clearElement(d);

	//addKeys({ position: 'fixed', top: 200, classname: 'slow_gradient_blink', vpadding: 10, align: 'center', position: 'absolute', fg: 'white', fz: 24, w: '100vw' }, styles);
	//if (!isEmpty(styles.classname)) { mClass(dParent, styles.classname); }
	//delete styles.classname;
	//mStyle(dParent, styles);
	d.innerHTML = msg; //'blablablablabllllllllllllllllllllllllllllllaaaaaaaaaaaaaaaaaaaaaaa'; //msg;
	mStyle(d, { position: 'fixed', top: 127, left: 0, bg: 'red', fg: 'white', w: '100%', h: 40, hmin: 40, hmax: 40, fz: 24, align: 'center', vpadding: 10, classname: 'slow_gradient_blink' });
	//mClass(d,'slow_gradient_blink')
	let [ms, delay, callback] = [5000, 0, correct ? onclick_home : null];
	if (delay > 0) TO.special = setTimeout(() => { mFadeClear(d, ms, callback); }, delay);
	else mFadeClear(d, ms, callback);

}
function show_correct_location(k) {
	hide('dPopup');
	for (const k1 in DIBOA) { hide(`d${capitalize(k1)}`); }
	S.location = k; // muss ich nicht saven
	show(`d${capitalize(k)}`);
}
function show_one_skype_message(dParent, o) {
	let d = mDiv(dParent, { rounding: 12, hpadding: 6, vpadding: 6, margin: 4, gap: 12 }); mFlex(d);
	let [sz] = [40];
	let dimg = get_skype_phone_icon(o.color); //mDiv(dc,{w:sz,h:sz,margin:10},null,);
	mAppend(d, dimg);

	let dmiddle = mDiv(d, { flex: 8, wmax: '75%' });
	let dnum = mDiv(dmiddle, { fz: 11, fg: 'grey' }, null, `<div>${o.num} ${format_date(o.date)}</div>`);
	let msg = get_skype_expanded_message(o.msg);
	S.boa_authorization_code = stringAfter(msg, 'Code ').substring(0, 6);
	let dmsg = mDiv(dmiddle, { bg: '#EEE', fz: 14, fg: 'black', rounding: 8, padding: 8 }, null, `<div>${msg}</div>`);

	//let ddate = mDiv(d,{flex:1,fz: 11, fg: 'grey'},null,`<div>${format_date(o.date)}</div>`);
}
function show_skype_contact(dParent) {
	let c = S.skype_contact;
	if (isdef(c)) {
		mClear(dParent);
		let d = mDiv(dParent, { h: 'calc( 100vh - 200px )', 'overflow-y': 'scroll' }); //d.style.h='calc( 100vh - 200px )';
		let dfooter = mDiv(dParent, { h: 190, padding: 10 }); //, bg: 'blue' });
		let address = c.num;
		dfooter.innerHTML = `to: ${address} via Skype<br>`;
		let dform = mDiv(dfooter, { vmargin: 14 }); mFlex(dform);
		let denter = mInput(dform, { border: 'none', w: '85%', h: 40, bg: '#EEE', fg: '#000', fz: 14, padding: 10, hmargin: 14, rounding: 25 }, null, 'Type an SMS here');
		let b = skype_go_button();
		mAppend(dform, b);

		for (let i = 0; i < 20; i++) {
			show_one_skype_message(d, c)
		}

		d.scrollTop = d.scrollHeight;
	}

	console.log('auth code is', S.boa_authorization_code);
}
function set_new_password() {
	let len = Math.min(20, S.master_password.length + 1);
	let pnew = rPassword(len);
	console.log('new password: ', pnew);
	S.master_password = pnew;
	S.score = 0;
	boa_save();
}
function set_boa_score(inc) { S.score += inc; if (S.score < 0) S.score = 0; boa_save(); }
function skype_go_button() {
	let html = `
		<button
			role="button"
			title="Send message"
			aria-label="Send message"
			aria-disabled="false"
			style="
				position: relative;
				display: flex;
				flex-direction: column;
				flex-grow: 0;
				flex-shrink: 0;
				overflow: visible;
				align-items: center;
				justify-content: center;
				app-region: no-drag;
				background-color: transparent;
				border-color: transparent;
				text-align: left;
				border-width: 0px;
				height: 44px;
				width: 44px;
				padding: 0px;
				cursor: pointer;
				border-style: solid;
			"
		>
			<div
				role="none"
				style="
					position: absolute;
					display: flex;
					flex-direction: column;
					flex-grow: 0;
					flex-shrink: 0;
					overflow: hidden;
					align-items: center;
					background: linear-gradient(135deg, rgb(0, 188, 242), rgb(0, 120, 212));
					height: 40px;
					width: 40px;
					border-radius: 20px;
					top: 2px;
					left: 2px;
					justify-content: center;
				"
			>
				<div
					role="none"
					aria-hidden="true"
					style="position: relative; display: flex; flex-direction: column; flex-grow: 0; flex-shrink: 0; overflow: hidden; align-items: stretch; margin-left: 2px"
				>
					<svg width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FFFFFF" gradientcolor1="#FFFFFF" gradientcolor2="#FFFFFF">
						<path
							d="M5.694 12L2.299 3.272c-.236-.608.356-1.189.942-.982l.093.04 18 9a.75.75 0 01.097 1.283l-.097.058-18 9c-.583.291-1.217-.245-1.065-.847l.03-.096L5.694 12 2.299 3.272 5.694 12zM4.402 4.54l2.61 6.71h6.627a.75.75 0 01.743.648l.007.102a.75.75 0 01-.649.743l-.101.007H7.01l-2.609 6.71L19.322 12 4.401 4.54z"
						></path>
					</svg>
				</div>
			</div>
		</button>

	`;

	return mCreateFrom(html);
}
function skype_start() {

	let d = mBy('dSkype'); mClear(d); //mStyle(document.body, { h: 'calc( 100vh - 56px )'});
	mStyle(d, { h: 'calc( 100vh - 56px )', 'overflow-y': 'hidden' });

	let d0 = mDiv(d);
	let [dl, dr] = mColFlex(d, [1, 3]); //, [BLUE, GREEN]);
	mStyle(dl, { border: '1px dotted silver' }); mStyle(dr, { border: '1px dotted silver' });

	mDiv(dl, {}, null, img_html('skypeTopLeft.jpg'));
	let d1 = mDiv(dl);
	DIBOA.skype.divRight = dr;
	DIBOA.skype.divLeft = dl;

	let contacts = DIBOA.skype.contacts = generate_skype_contacts(25); console.log(contacts)
	for (const o of contacts) {
		let dc = mDiv(d1, { rounding: 12, hpadding: 6, vpadding: 6, margin: 4, gap: 12, overflow: 'hidden' }, null, null, 'skypecontact');
		mFlex(dc);
		o.div = dc;
		dc.onclick = () => { S.skype_contact = toggleSelection(o, S.skype_contact, 'skypecontact_active'); show_skype_contact(dr) };

		let [sz] = [40];

		let dimg = get_skype_phone_icon(o.color); //mDiv(dc,{w:sz,h:sz,margin:10},null,);
		mAppend(dc, dimg);

		let dmiddle = mDiv(dc, { flex: 8 });
		let dnum = mDiv(dmiddle, { fz: 14, fg: 'black' }, null, `<div>${o.num}</div>`);
		let dmsg = mDiv(dmiddle, { fz: 11, fg: 'grey' }, null, `<div>${o.msg}</div>`);

		let ddate = mDiv(dc, { flex: 1, fz: 11, fg: 'grey' }, null, `<div>${format_date(o.date)}</div>`);
	}

}
function toggle_bw_symbol(d) {
	if (nundef(d)) d = document.getElementById('tbbw');
	d = d.getElementsByTagName('i')[0];
	console.log('d', d);
	if (isdef(d)) {
		if (d.classList.contains('fa-car')) {
			d.classList.remove('fa-car');
			d.classList.add('fa-star');
			mStyle(d, { fg: 'silver' });
		} else {
			d.classList.remove('fa-star');
			d.classList.add('fa-car');
			mStyle(d, { fg: 'transparent' });
		}
	}
}

//#region ui helpers
function get_input_value(id) {
	let inp = mBy(id);
	let val = inp.value;
	return val;
}
function createImage(filename, styles) {
	let img = mCreateFrom(`<img src='../rechnung/images/${filename}'>`);
	if (isdef(styles.w)) { img.setAttribute('width', styles.w); }
	if (isdef(styles.h)) { img.setAttribute('height', styles.h); }
	mStyle(img, styles);
	return img;
}
function img_html(filename, fulldim = 'height') {
	return `<img ${fulldim}='100%' src='../rechnung/images/${filename}'>`;
}

//#region boa tests
function test0_boa_bw_fa() {
	let d = mDiv('dHome', { w: 200, h: 200, bg: 'red' }, 'd', `<i class="fa fa-car"></i>`);
	d.onclick = () => toggle_bw_symbol(d.firstChild);
}
function test1_bw_widget_boa() {
	let dpop = mBy('dPopup');
	show(dpop);
	mStyle(dpop, { top: 50, right: 10 });
	let prefix = 'boa';
	let d = mDiv(dpop, { wmin: 200, hmin: 200, bg: 'red' }, 'dBw');
	let d2 = mDiv(d, { bg: 'dodgerblue', fg: 'white' }, null, 'your bitwarden vault');
	let d3 = mDiv(d, { bg: '#eee', fg: 'dimgray', padding: 8 }, null, 'LOGINS');
	let d4 = mDiv(d, { bg: 'white', fg: 'black' });
	let d5 = mDiv(d4, { display: 'flex' });
	let dimg = mDiv(d5, { bg: 'white', fg: 'black' }, null, `<img src='../rechnung/images/boa.png' height=14 style="margin:8px">`);
	let dtext = mDiv(d5, { cursor: 'pointer' }, null, `<div>boa</div><div style="font-size:12px;color:gray">gleeb69</div>`);
	dtext.onclick = () => onclick_bw_symbol(prefix)
	let d6 = mDiv(d4, { display: 'flex', padding: 2 });
	let disyms = {
		bwtext: { postfix: 'userid', matop: 2, maright: 0, mabottom: 0, maleft: 0, sz: 27 },
		bwcross: { postfix: 'cross', matop: 2, maright: 0, mabottom: 0, maleft: -13, sz: 25 },
		bwkey: { postfix: 'pwd', matop: 0, maright: 0, mabottom: 0, maleft: -12, sz: 27 },
		bwclock: { postfix: 'clock', matop: 0, maright: 0, mabottom: 0, maleft: 0, sz: 25 },
	}
	for (const k of ['bwtext', 'bwcross', 'bwkey']) { //,'bwclock']) {
		let o = disyms[k];
		let [filename, styles] = [k, disyms[k]];
		let path = `../rechnung/images/${filename}.png`;
		let [sz, ma] = [styles.sz, `${styles.matop}px ${styles.maright}px ${styles.mabottom}px ${styles.maleft}px`];
		console.log('ma', ma);
		let img = mDiv(d6, { paright: 16 }, null, `<img src='${path}' height=${sz} style="margin:${ma}">`);
		if (k != 'bwcross') {
			mStyle(img, { cursor: 'pointer' });
			img.onclick = () => onclick_bw_symbol(prefix, o.postfix);
		}
	}
	mFlexSpacebetween(d4);
	let d7 = mDiv(d, { bg: '#eee', fg: 'dimgray', padding: 7 }, null, 'CARDS');
	let d8 = mDiv(d, { bg: 'dodgerblue', fg: 'white' }, null, `<img src='../rechnung/images/rest_bw.jpg'>`);
}
function test2_boa_verify() {
	mAppear('dScreen', 100);
	if (FirstLoad) { FirstLoad = false; initialize_state(); } //show_master_password(); }
	get_toolbar();
	onclick_location('boa');
	boaverify_start();
}
function test3_boa_havecode() {
	mAppear('dScreen', 100);
	if (FirstLoad) { FirstLoad = false; initialize_state(); } //show_master_password(); }
	get_toolbar();
	onclick_location('boa');
	S.boa_authorization_code = '123456';
	boahavecode_start();
}
function test4_boa_main() {
	mAppear('dScreen', 100);
	if (FirstLoad) { FirstLoad = false; initialize_state(); } //show_master_password(); }
	get_toolbar();
	onclick_location('boa');
	S.boa_authorization_code = '123456';
	boamain_start();
}
function test5_bw_skin() {
	mAppear('dScreen', 100);
	if (FirstLoad) { FirstLoad = false; initialize_state(); } //show_master_password(); }
	get_toolbar();
	bw_widget_popup('skype');

}
function test6_generate_statement() {
	mAppear('dScreen', 100);
	if (FirstLoad) { FirstLoad = false; initialize_state(); } //show_master_password(); }
	get_toolbar();
	generate_statement();
}



