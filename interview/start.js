async function start() {
  dMain = mBy('dMain'); mFlexWrap(dMain); mStyle(dMain, { padding: 10, gap: 10 });
  //test0_sleep();
  let url = `../aroot/base/assets/games/poetry/words.yaml`;
  url = `../howto.txt`;
  let di = await mFetch(url, 'text'); console.log('di', di); //YES

  //di = mFetch(url).then(x=>console.log('di',x)); //YES
}
async function mFetch(url, cmd = 'text', o = null) {
  let sess = detectSessionType();
  let method = o ? 'post' : 'get';
  console.log('mFetch', sess, cmd, method);

  let result;
  if (method == 'get') {
    if (sess == 'live') {
      result = await fetch(url).then(x => cmd == 'json' ? x.json() : x.text());
      if (cmd == 'yaml') result = jsyaml.load(result);
    } else if (sess == 'php') {
      result = await fetch(url).then(x => cmd == 'json' ? x.json() : x.text());
      if (cmd == 'yaml') result = jsyaml.load(result);
    }
  }

  return result;

}
function mSetTimeout(ms) { return mSleep(ms); }
function mSleep(ms) {
  return new Promise(
    (res, rej) => {
      if (ms <= 3000) {
        setTimeout(res, ms);
      } else {
        printNope();
      }
    });
}
function printHallo() { mDom(dMain, { fg: GREEN }, { html: 'hallo' }); }
function printGeh() { mDom(dMain, { fg: BLUE }, { html: 'geh' }); }
function printNope() { mDom(dMain, { fg: RED }, { html: 'nope' }); }
function print0() { }
function hallo() {
  const myPromise = new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve('Operation completed successfully!');
    }, 1000);
  }).then(printNope).then(printGeh);
  const prom = new Promise(() => {
    setTimeout(printHallo, 1000);
  }).then(printGeh).then(printGeh);
}

async function test0_sleep() {

  //setTimeout(printHallo,1000); printNope(); // not waiting!

  mSleep(1000).then(printHallo).then(printHallo); //YES!

  await mSleep(2000); printGeh(); printGeh(); //YES!!!

  await mSetTimeout(2000); printHallo(); //YES!!!

}















