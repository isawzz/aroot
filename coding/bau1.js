
async function bundleGenFromProject(projectname){
	//assume projectname has to be a top leve folder inside of the dir where coding resides!
	await bundleGenerateFrom(`../${projectname}/index.html`);
}
async function bundleGenerateFrom(htmlfile){
	let html = await route_path_text(htmlfile);

	let parts = html.split('script src="');
	parts.shift();
	let files = parts.map(x => stringBefore(x, '"'));
	files = files.filter(x => !x.includes('alibs')); console.log('files',files)

	if (files.length == 1 && files[0].includes('/bundle.js')) {
		console.log('bundle already generated!!!',files[0]);
		return;
	}
	

}









