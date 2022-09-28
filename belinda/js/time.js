//#region chatas
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
		this.game = G.name;

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
			if (isdef(this.onElapsed)) {
				console.assert(G.name == this.game,'game not the same!!! '+G.name + ' ' +this.game);

				this.onElapsed();
			}
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

//#region belinda
function renewTimer(G, elem, onTimeOver = null) { if (nundef(GameTimer)) GameTimer = new TimerClass(G); GameTimer.restart(G, elem, onTimeOver); }
function checkTimer(G) { if (nundef(GameTimer)) return false; return GameTimer.check(G); }
class TimerClass {
	constructor(g, elem) {
		this.started, this.elapsed, this.onTimeOver = null, this.elem, this.timeLeft, this.settings = g;
		if (isdef(elem)) this.setElem(elem);
	}
	setElem(elem) {
		if (nundef(elem) && isdef(this.elem)) { elem = this.elem; }
		else if (nundef(elem)) { let d = mBy('time'); if (isdef(d)) this.elem = d; }
		else if (isString(elem)) { elem = mBy(elem); this.elem = elem; }
	}
	check(g) { this.settings = g; if (g.showTime) { show(this.elem); this.start(); } else { hide(this.elem); } return g.showTime; }
	clear() { clearTimeout(this.TO); }
	restart(g, elem, onTimeOver = null) {
		this.clear();
		this.setElem(elem);
		let active = this.check(g);
		//console.log('timer is',active)
		this.started = msNow();
		this.elapsed = 0;
		if (isdef(onTimeOver)) this.onTimeOver = onTimeOver;
		if (active) this.start();
	}
	start() {
		//console.log(this.settings.showTime,this.settings.minutesPerUnit)
		if (nundef(this.settings.showTime) || !this.settings.showTime) return;
		if (nundef(this.settings.minutesPerUnit)) this.settings.minutesPerUnit = 10;
		if (nundef(this.started)) { this.started = msNow(); this.elapsed = 0; }

		var timeLeft = this.timeLeft = this.settings.minutesPerUnit * 60000 - this.getTimeElapsed();
		//console.log('started at',this.started,'this.timeLeft',this.timeLeft)
		if (timeLeft > 0) {
			let t = msToTime(timeLeft);
			let s = format2Digits(t.h) + ":" + format2Digits(t.m) + ":" + format2Digits(t.s);

			this.elem.innerHTML = s;//h + ":" + m + ":" + s;
			this.TO = setTimeout(() => this.start(), 500);
		} else {
			this.elem.innerHTML = '00:00:00';
			if (this.onTimeOver) this.onTimeOver();
		}
	}
	unitTimeUp() {
		//console.log('TTTTTTTTTTT',this.settings.minutesPerUnit * 60000,this.getTimeElapsed(),this.started,this.elapsed);
		return (this.settings.minutesPerUnit * 60000 - this.getTimeElapsed()) <= 0;
	}
	startClock(elem) {
		if (nundef(this.settings.showTime) || !this.settings.showTime) return;
		var today = new Date(),
			h = format2Digits(today.getHours()),
			m = format2Digits(today.getMinutes()),
			s = format2Digits(today.getSeconds());

		if (isString(elem)) elem = mBy(elem); elem.innerHTML = h + ":" + m + ":" + s;
		this.TO = setTimeout(() => this.startClock(elem), 500);

	}
	getTimeElapsed() { return this.elapsed + msElapsedSince(this.started); }
}

class TimeoutManager {
	constructor() {
		this.TO = {};
	}
	clear(key) {
		if (nundef(key)) key = Object.keys(this.TO);
		else if (isString(key)) key = [];

		for (const k of key) {
			clearTimeout(this.TO[k]);
			delete this.TO[k];
		}
	}
	set(ms, callback, key) {
		if (nundef(key)) key = getUID();
		TO[key] = setTimeout(ms, callback);
	}
}


class CountdownTimer {
	constructor(ms, elem) {
		this.timeLeft = ms;
		this.msStart = Daat.now();
		this.elem = elem;
		this.tick();
	}
	msElapsed() { return Date.now() - this.msStart; }
	tick() {
		this.timeLeft -= this.msElapsed;
		this.elem.innerHTML = this.timeLeft;
		if (this.timeLeft > 1000) {
			setTimeout(this.tick.bind(this), 500);
		} else this.elem.innerHTML = 'timeover';
	}
}
