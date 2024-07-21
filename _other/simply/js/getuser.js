function getuser_1send() {
	get_data('getuser', {});
}
function getuser_2handleResult(result) {
	//mBy('dMessage').innerHTML = result;
	//return;

	Userdata = JSON.parse(result);
	Userdata.image = Userdata.username + '.jpg';
	Username = Userdata.username;

	//console.log('Userdata', Userdata);
	let d = mBy('dUserInfo');
	clearElement(d);
	let dParent = mDiv(d);

	let dir = '../base/assets/images/';
	let path = dir + (Userdata.hasImage ? Username : 'unknown_user') + '.jpg';
	let size = 100;
	let styles = { 'object-fit': 'cover', rounding: '50%', margin: 10, h: size, w: size, border: '2px solid white' };
	let dUserImage = mImg(path, dParent, styles);
	dUserImage.id = 'dUserImage';

	let dUserName = mText(Username, d, { fz: 14, family: 'opensans' });
	dUserName.id = 'dUserName';

	let dUserEmail = mText(Userdata.email, d, { fz: 12, opacity: .5, family: 'opensans' });
	dUserEmail.id = 'dUserEmail';

}