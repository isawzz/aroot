function getCorrectMonth(s,val){
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];
  let n=firstNumber(s); 
  if (n>=1 && n<=12) return [n-1,months[n-1]];
  s=s.substring(0,3).toLowerCase();
  for(const m of months){
    let m1=m.substring(0,3).toLowerCase();
    if (s == m1) return [months.indexOf(m),m];
  }
  return val;
}

function isCorrectMonth(s){
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];
  let n=firstNumber(s);

  if (n>=1 && n<=12) return months[n-1];
  s=s.substring(0,3).toLowerCase();
  for(const m of months){
    let m1=m.substring(0,3).toLowerCase();
    if (s == m1) return m;
  }
  return false;
}
function makeContentEditable(elem, setter) {
  if (nundef(mBy('dummy'))) addDummy(document.body, 'cc');
  elem.contentEditable = true;
  elem.addEventListener('keydown', ev => { 
    if (ev.key == 'Enter') { 
      ev.preventDefault();
      mBy('dummy').focus(); 
      if (setter) setter(ev);
    } 
  }); 
}

function addEditable(dParent, styles = {}, opts = {}) {
  //let html= `<p contenteditable="true">hallo</p>`; let x=mDom(dParent,{},{html:html});
  let x = mDom(dParent, { w: '90%' }, { tag: 'input', classes: 'plain' });
  x.focus();
  x.addEventListener('keyup', ev => {
    if (ev.key == 'Enter') {
      mBy('dummy').focus();
      // let text=x.value;
      // let d=mDiv(dParent,{},null,x.value);
      // x.remove();
      if (isdef(opts.onEnter)) opts.onEnter(ev)
    }
  }); //console.log('HALLO'); });
  //mPlace(x,'cc'); //(x,0,20)
  return x;
}


