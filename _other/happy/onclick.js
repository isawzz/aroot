function onclick_add_question() { show_question_editor(); }
function onclick_close_project_editor(ev) {
	//let dParent = ev.target.parentNode;
	console.log('click!!!')
	show_home();
}
function onclick_color(prop) {
	return color => { let styles = {}; styles[prop] = color; mStyle(mBy('dAdmin'), styles); };
}
function onclick_compose() { show_project_editor(); }
function onclick_home() { start_with_assets(); }










