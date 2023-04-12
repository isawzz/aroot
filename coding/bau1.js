function firstWordIncluding(s, allowed = '_-') {
	let res = '', i = 0;
	while (!isLetter(s[i]) && !isDigit(s[i]) && !allowed.includes(s[i])) i++;
	while (isLetter(s[i]) || isDigit(s[i]) || allowed.includes(s[i])) { res += s[i]; i++; }
	return res;
}
async function games_css_closure() {
	let tcss = await route_path_text('../games/basemin.css');
	let code = await route_path_text('../games/bundle.js');
	let html = await route_path_text('../games/index.html');

	let [diclasses, outputclasses] = parse_css_classes(tcss, code, html);
	let [dikeyframes, outputkeyframes] = parse_css_keyframes(tcss, code, html);
	let [diids, outputids] = parse_css_ids(tcss, code, html);
	let [ditags, outputtags] = parse_css_tags(tcss, code, html);

	// let res = outputtags;
	//let res = outputkeyframes; 
	let res = outputtags + '\n' + outputids + '\n' + outputkeyframes + '\n' + outputclasses;

	AU.ta.value = res; //keylist.join('\n');

}
function parse_css_classes(tcss, code, html) {
	let t = replaceAllSpecialChars(tcss, '\t', '  ');
	let lines = t.split('\r\n');
	let di = {};
	for (const line of lines) {
		if (line.startsWith('.')) {
			let word = firstWordIncluding(line, ['_', '-']);
			// console.log('word', word);
			lookupAddIfToList(di, ['classes'], word);
		}
	}
	let included_classes = [];
	for (const cname of di.classes) {
		if (code.includes(`'${cname}'`) || code.includes(`"${cname}"`)) addIf(included_classes, cname);
		if (html.includes(`${cname}`)) addIf(included_classes, cname);
	}
	console.log('all classes', di.classes);
	console.log('included_classes', sortCaseInsensitive(included_classes));
	let dicode = {};
	let parsing = false, chunk = '', comment = false;
	for (const cname of included_classes) { // sortCaseInsensitive(included_classes)) {
		for (const line of lines) {
			let lt = line.trim(); //console.log('ende',lt.endsWith('\n')); //return;
			if (line.startsWith('.' + cname)) {
				assertion(parsing == false,'NEW KW WHILE PARSING!!!!!!!!!!!!')
				parsing = true; comment = false;
				chunk = line + '\n';
				continue;
			} else if (lt.startsWith('/*')){
				comment = !lt.endsWith(('*/'));
				continue;
			} else if (lt.endsWith('*/')) { 
				comment = false; continue; 
			}	else if (comment) { continue; }
			if (parsing) {
				if (line.startsWith('}')) {
					parsing = false;
					lookupAddToList(dicode, [cname], chunk + line + '\n'); //finish up code for cname
					chunk = ''; // chunk + line + '\n';
				} else { 
					chunk += line + '\n'; 
				}
			} else assertion(!line.includes(',') || line.startsWith(' '), 'COMMA!!!', line)
		}
	}
	let output = css_complete_text(dicode);
	// let output = '';
	// let keylist = sortCaseInsensitive(get_keys(dicode));
	// console.log('keylist', keylist)
	// for (const k of keylist) {
	// 	for (const c of dicode[k]) {
	// 		output += c + '\n';
	// 	}
	// }
	return [dicode, output];
}
function parse_css_ids(tcss, code, html) {
	let t = replaceAllSpecialChars(tcss, '\t', '  ');
	let lines = t.split('\r\n');
	let di = {};
	for (const line of lines) { if (line.startsWith('#')) { let word = firstWordIncluding(line, ['_', '-']); lookupAddIfToList(di, ['classes'], word); } }
	let included_classes = [];
	for (const cname of di.classes) {
		if (code.includes(`'${cname}'`) || code.includes(`"${cname}"`)) addIf(included_classes, cname);
		if (html.includes(`${cname}`)) addIf(included_classes, cname);
	}
	console.log('all classes', di.classes);
	console.log('included_classes', included_classes);
	let dicode = {};
	let parsing = false, chunk = '', comment = false;
	for (const cname of included_classes) { // sortCaseInsensitive(included_classes)) {
		for (const line of lines) {
			let lt = line.trim(); //console.log('ende',lt.endsWith('\n')); //return;
			if (line.startsWith('#' + cname)) {
				assertion(parsing == false,'NEW KW WHILE PARSING!!!!!!!!!!!!')
				parsing = true; comment = false;
				chunk = line + '\n';
				continue;
			} else if (lt.startsWith('/*')){
				comment = !lt.endsWith(('*/'));
				continue;
			} else if (lt.endsWith('*/')) { 
				comment = false; continue; 
			}	else if (comment) { continue; }
			if (parsing) {
				if (line.startsWith('}')) {
					parsing = false;
					lookupAddToList(dicode, [cname], chunk + line + '\n'); //finish up code for cname
					chunk = ''; // chunk + line + '\n';
				} else { 
					chunk += line + '\n'; 
				}
			} else assertion(!line.includes(',') || line.startsWith(' '), 'COMMA!!!', line)
		}
	}
	let output = css_complete_text(dicode);
	// let output = '';
	// let keylist = sortCaseInsensitive(get_keys(dicode));
	// for (const k of keylist) {
	// 	//console.log('k',k,'\n___\n')
	// 	//output += '#' + k + ' {\n';
	// 	for (const codeline of dicode[k]) {
	// 		if (isEmpty(codeline.trim())) continue;
	// 		output += codeline + '\n';
	// 	}
	// 	//output += '}\n';

	// }
	return [dicode, output];
}
function parse_css_keyframes(tcss, code, html) {
	let t = replaceAllSpecialChars(tcss, '\t', '  ');
	let lines = t.split('\r\n');
	let di = {};
	for (const line of lines) {
		if (line.startsWith('@keyframes')) {
			let word = firstWordIncluding(stringAfter(line, 'keyframes'), ['_', '-']);
			console.log('=====word', word);
			lookupAddIfToList(di, ['classes'], word);
		}
	}
	let included_classes = [];
	for (const cname of di.classes) {
		if (code.includes(`'${cname}'`) || code.includes(`"${cname}"`)) addIf(included_classes, cname);
		if (html.includes(`${cname}`)) addIf(included_classes, cname);
	}
	console.log('all classes', di.classes);
	console.log('included_classes', included_classes);
	let dicode = {};
	let parsing = false, chunk = '', comment = false;
	for (const cname of included_classes) { // sortCaseInsensitive(included_classes)) {
		for (const line of lines) {
			let lt = line.trim(); //console.log('ende',lt.endsWith('\n')); //return;
			if (line.startsWith('@keyframes ' + cname)) {
				assertion(parsing == false,'NEW KW WHILE PARSING!!!!!!!!!!!!')
				parsing = true; comment = false;
				chunk = line + '\n';
				continue;
			} else if (lt.startsWith('/*')){
				comment = !lt.endsWith(('*/'));
				continue;
			} else if (lt.endsWith('*/')) { 
				comment = false; continue; 
			}	else if (comment) { continue; }
			if (parsing) {
				if (line.startsWith('}')) {
					parsing = false;
					lookupAddToList(dicode, [cname], chunk + line + '\n'); //finish up code for cname
					chunk = ''; // chunk + line + '\n';
				} else { 
					chunk += line + '\n'; 
				}
			} else assertion(!line.includes(',') || line.startsWith(' '), 'COMMA!!!', line)
		}
	}
	let output = css_complete_text(dicode);
	// let output = '';
	// let keylist = sortCaseInsensitive(get_keys(dicode));
	// for (const k of keylist) {
	// 	//console.log('k',k,'\n___\n')
	// 	//output += '@keyframes ' + k + ' {\n';
	// 	for (const codeline of dicode[k]) {
	// 		if (isEmpty(codeline.trim())) continue;
	// 		output += codeline + '\n';
	// 	}
	// 	//output += '}\n';

	// }
	return [dicode, output];
}
function parse_css_tags(tcss, code, html) {
	let t = replaceAllSpecialChars(tcss, '\t', '  ');
	let lines = t.split('\r\n');
	let di = {};
	for (const line of lines) { if (isLetter(line[0])) { let word = firstWordIncluding(line, []); lookupAddIfToList(di, ['classes'], word); } }
	let included_classes = di.classes; console.log('included_classes', included_classes);
	let dicode = {};
	let parsing = false, chunk = '', comment = false;
	for (const cname of included_classes) { 
		for (const line of lines) {
			let lt = line.trim(); //console.log('ende',lt.endsWith('\n')); //return;
			if (line.startsWith(cname)) {
				assertion(parsing == false,'NEW KW WHILE PARSING!!!!!!!!!!!!')
				parsing = true; comment = false;
				chunk = line + '\n';
				continue;
			} else if (lt.startsWith('/*')){
				comment = !lt.endsWith(('*/'));
				continue;
			} else if (lt.endsWith('*/')) { 
				comment = false; continue; 
			}	else if (comment) { continue; }
			if (parsing) {
				if (line.startsWith('}')) {
					parsing = false;
					lookupAddToList(dicode, [cname], chunk + line + '\n'); //finish up code for cname
					chunk = ''; // chunk + line + '\n';
				} else { 
					chunk += line + '\n'; 
				}
			} else assertion(!line.includes(',') || line.startsWith(' '), 'COMMA!!!', line)
		}
	}
	let output = css_complete_text(dicode);
	// let output = '';
	// let keylist = sortCaseInsensitive(get_keys(dicode));
	// for (const k of keylist) { for (const c of dicode[k]) { output += c + '\n'; } }
	return [dicode, output];
}
function css_complete_text(dicode){
	let output = '';
	let keylist = sortCaseInsensitive(get_keys(dicode));
	for (const k of keylist) { for (const c of dicode[k]) { output += c; } }
	return output;
}




