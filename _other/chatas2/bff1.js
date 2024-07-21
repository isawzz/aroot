
function timeConversion(duration, format = 'Hmsh') {
	// console.log(timeConversion((60 * 60 * 1000) + (59 * 60 * 1000) + (59 * 1000)));
	// console.log(timeConversion((60 * 60 * 1000) + (59 * 60 * 1000)              ));
	// console.log(timeConversion((60 * 60 * 1000)                                 ));
	// console.log(timeConversion((60 * 60 * 1000)                    + (59 * 1000)));
	// console.log(timeConversion(                   (59 * 60 * 1000) + (59 * 1000)));
	// console.log(timeConversion(                                      (59 * 1000)));
	const portions = [];

	const msInHour = 1000 * 60 * 60;
	const hours = Math.trunc(duration / msInHour);
	//if (hours > 0) {
	if (format.includes('H')) portions.push((hours < 10 ? '0' : '') + hours);
	duration = duration - (hours * msInHour); // hours + 'h');
	//}

	const msInMinute = 1000 * 60;
	const minutes = Math.trunc(duration / msInMinute);
	//if (minutes > 0) {
	if (format.includes('m')) portions.push((minutes < 10 ? '0' : '') + minutes);// minutes + 'm');
	duration = duration - (minutes * msInMinute);
	//}

	const msInSecond = 1000;
	const seconds = Math.trunc(duration / 1000);
	//if (seconds > 0) {
	if (format.includes('s')) portions.push((seconds < 10 ? '0' : '') + seconds);//seconds + 's');
	duration = duration - (seconds * msInSecond);
	//}

	const hundreds = duration / 10;
	if (format.includes('h')) portions.push((hundreds < 10 ? '0' : '') + hundreds);//hundreds);

	return portions.join(':');
}


class CTimer {
	constructor(elem, msTick, onTick, msTotal, onElapsed) {
		this.elem = elem;
		this.msTotal = this.msLeft = msTotal;
		this.onTick = onTick;
		this.onElapsed = onElapsed;
		this.interval = msTick;
		this.running = false;
		this.paused = false;

		//mButton(caption, handler, dParent, styles, classes, id)
		this.button = mButton('click', this.togglePause.bind(this), this.elem, { transition: 'all 1s ease', display: 'inline-block', fz: 20, rounding: 12, bg: GREEN, w: 260 }, 'mybutton');
		this.TO = null;
		//this.d = mDiv(this.elem, { display: 'inline-block', rounding: 12, bg: GREEN, w: 260 }, null, 'TIMER');
		// this.d.onclick = this.togglePause.bind(this);
	}
	togglePause() { if (this.paused) this.continue(); else this.pause(); }
	clear() { this.stop(); clearElement(this.elem); }
	continue() {
		if (!this.running) this.start();
		else if (!this.paused) return;
		else { this.paused = false; this.TO = setInterval(this.tickHandler.bind(this), this.interval); }
	}
	tickHandler() {
		this.msLeft -= this.interval;
		let [ms, unit] = [this.msLeft, this.msTotal / 6];
		this.msElapsed = this.msTotal - this.msLeft;
		//console.log('msLeft', this.msLeft, timeConversion(this.msLeft));
		this.button.innerHTML = timeConversion(Math.max(this.msLeft, 0), 'sh');
		let bg = ms > unit * 4 ? GREEN : ms > unit * 2 ? YELLOW : ms > unit ? 'orange' : RED;
		this.button.style.background = bg;

		if (isdef(this.onTick)) this.onTick();
		if (this.msLeft <= 0) {
			this.stop();
			if (isdef(this.onElapsed)) this.onElapsed();
		}
	}
	start() {
		if (this.running) this.stop();
		this.started = new Date().now;
		this.msLeft = this.msTotal;
		this.msElapsed = 0;
		this.running = true;
		this.TO = setInterval(this.tickHandler.bind(this), this.interval);

	}
	stop() {
		if (!this.running) return;
		clearInterval(this.TO);
		this.running = false;


	}
	pause() {
		if (this.paused || !this.running) return;
		clearInterval(this.TO);
		this.paused = true;
	}

}



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
		console.log('insane!!!');
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
