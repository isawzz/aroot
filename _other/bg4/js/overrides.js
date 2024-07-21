//internet setting
function toogle_internet_status() {
	if (is_online()) {
		go_offline();
		menu_disable('chat');
		let b = mBy('b_internet');
		b.className = 'statusbutton enabled off';
		b.innerHTML = 'offline';
	} else {
		go_online();
		menu_enable('chat');
		db_save();
		let b = mBy('b_internet');
		b.className = 'statusbutton enabled on';
		b.innerHTML = 'online';
	}
	console.log('InternetStatus:', is_online() ? 'online' : 'OFFLINE');
}

//language setting
function set_language(lang = 'E', update_ui = true) {
	console.log('lang', lang);
	if (isdef(G)) {
		G.language = G.lang = lang; lookupSetOverride(U.games, [G.id, 'language'], lang);
		Speech.setLanguage(lang);
		//console.log()
		//if (G.language == 'C') { lookupSet(U.games,[G.id,'pictureLabels'],'always'); G.pictureLabels = 'always'; G.showLabels = true; }
	}
}
function update_language_choices(g) {
	let langs = g.availableLanguages;
	let language_holder = mBy('language_holder');
	clearElement(language_holder);
	let friendly = { E: 'english', D: 'german', S: 'spanish', F: 'french', C: 'mandarin' };
	if (isdef(language_holder) && isdef(langs) && langs.length > 1) {
		let avail = toLetterList(langs);
		let labels = avail.map(x => friendly[x]);
		let esel = mSelect(language_holder, avail, friendly, valf(g.lang, 'E'), (ev) => {
			let sel = ev.target;
			let val = sel.value;
			console.log('selected language', val)
			set_language(val, false);
		});
		mClass(esel.firstChild, 'statusselect');
	} else if (isdef(language_holder)) {
		mDiv(language_holder, { patop: 6 }, null, friendly[g.lang], 'statusselect');
	}

}

//silent setting
function set_sound(silent = false) {
	let b = mBy('b_sound');
	if (silent) {
		b.className = 'statusbutton sym enabled off';
		b.innerHTML = '🔈️';
	} else {
		b.className = 'statusbutton sym enabled on';
		b.innerHTML = '🔊';
	}
}
function toggle_sound() {
	U.settings.silent = !U.settings.silent;
	if (isdef(G)) G.silent = U.settings.silent;
	set_sound(U.settings.silent);
}












