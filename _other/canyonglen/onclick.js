function onClickMusic() {

	toggleSound('mozart');
	if (isPlaying()) { hide0('bPlay'); show0('bPause'); } else { hide0('bPause'); show0('bPlay'); }
}
function hide0(id) { mBy(id).style.display = "none"; }
function show0(id) { mBy(id).style.display = "block"; }












