
function uiTypeCalendar(dParent, month1, year1) {
  const [cellWidth,gap] = [100,10];
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var events = [];
  var dParent = toElem(dParent);
  var container = mDiv(dParent, { bg: 'white' }, 'dCalendar');
  var date = new Date();
  let dTitle = mDiv(container, { w: 760, padding: gap, fg: '#d36c6c', fz: 26, family: 'sans-serif', display: 'flex', justify: 'space-between' });
  var dWeekdays = mGrid(1, 7, container, { gap: gap });
  var dDays = [];
  //var dWeekdays = mDiv(container,{w: '100%',display: 'flex',fg: '#247BA0'});
  for (const w of weekdays) { mDiv(dWeekdays, { w: cellWidth, fg: '#247BA0' }, null, w) };
  var dGrid = mGrid(5, 7, container, { gap: gap });
  var dDate = mDiv(dTitle, { display: 'flex', gap: gap });
  var dButtons = mDiv(dTitle, { display: 'flex', gap: gap });
  mButton('Prev',
    () => {
      let m = date.getMonth();
      let y = date.getFullYear();
      if (m == 0) setDate(12, y - 1); else setDate(m, y);
      //setDate(date.getMonth(), date.getFullYear())
    },
    dButtons, { bg: '#92a1d1' });
  mButton('Next',
    () => {
      let m = date.getMonth();
      let y = date.getFullYear();
      if (m == 11) setDate(1, y + 1); else setDate(m + 2, y);
      //setDate(date.getMonth() + 2, date.getFullYear())
    }, dButtons, { bg: '#92a1d1' });
  var dMonth, dYear;
  setDate(valf(month1, date.getMonth() + 1), valf(year1, date.getFullYear()));

  function openModal(date,d,ev) {
    if (ev.target != d) return;
    clicked = date;
    console.log('clicked',d,date)

    let d1=addEditable(d,{w:'100%'}); 

    const eventForDay = events.find(e => e.date === clicked);
    console.log('eventForDay',eventForDay);
  }
  function setDate(m, y) {
    date.setMonth(m - 1);
    date.setFullYear(y);
    mClear(dDate);
    dMonth = mDiv(dDate, {}, 'dMonth', `${date.toLocaleDateString('en-us', { month: 'long' })}`);
    dYear = mDiv(dDate, {}, 'dYear', `${date.getFullYear()}`);
    //makeContentEditable(dMonth,ev=>setDate(4,2333)); //geht!
    makeContentEditable(dMonth, ev => {
      let d = ev.target;
      if (d != dMonth) return;
      let val = getCorrectMonth(d.innerHTML, months[date.getMonth()]);
      d.innerHTML = val[1];
      date.setMonth(val[0])
    });
    makeContentEditable(dYear, ev => {
      let d = ev.target;
      if (d != dYear) return;
      let val = firstNumber(d.innerHTML);
      date.setFullYear(val);
      d.innerHTML = val;
    });
    weiterNachSetDate();
  }
  function weiterNachSetDate() {
    mClear(dGrid);

    // for(const w of weekdays){mDiv(dGrid,{w: 100, h:25, padding: 10,fg: '#247BA0'},null,w)};
    let outerStyles = { weight:'bold', box:true, paleft:gap/2, w: cellWidth, hmin: cellWidth, fg:'contrast', bg: rColor() }
    for (const i of range(35)) {
      let cell = mDiv(dGrid, outerStyles);
      dDays[i] = cell;
    }

    let dt = date;
    const day = dt.getDate();
    const month = dt.getMonth();
    const year = dt.getFullYear();

    const firstDayOfMonth = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const dateString = firstDayOfMonth.toLocaleDateString('en-us', {
      weekday: 'long',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    });
    const paddingDays = weekdays.indexOf(dateString.split(', ')[0]);

    console.log('paddingDays', day, month, year, paddingDays);
    console.log('dDays', dDays);
    for (const i of range(paddingDays)) {
      // mStyle(dDays[i],{bg:'white'});
      mStyle(dDays[i], { opacity: 0 });
    }

    //restliche tage bis month ende sind ok
    //danach wieder alle loeschen

    for (let i = 1; i <= paddingDays + daysInMonth; i++) {
      const daySquare = document.createElement('div');
      //daySquare.classList.add('day1');

      const dayString = `${month + 1}/${i - paddingDays}/${year}`;

      if (i > paddingDays) {
        daySquare.innerText = i - paddingDays;
        mDiv(daySquare, { align:'center',bg: rColor(),w:cellWidth-gap,hmin:cellWidth-24 })
        const eventForDay = events.find(e => e.date === dayString);

        //if (i - paddingDays === day && nav === 0) { daySquare.id = 'currentDay'; }

        if (eventForDay) {
          const eventDiv = document.createElement('div');
          eventDiv.classList.add('event');
          eventDiv.innerText = eventForDay.title;
          daySquare.appendChild(eventDiv);
        }
        daySquare.lastChild.addEventListener('click', ev => openModal(dayString, daySquare.lastChild, ev));
      } else {
        daySquare.classList.add('padding');
      }

      dDays[i-1].appendChild(daySquare);
    }

  }
  return { container, date, dDate, dGrid, dMonth, dYear, setDate }
}





function restmuell() {
  dMonth.onclick = ev => {

    let d = ev.target;
    if (d != dMonth) return;
    let inp = mDom100(dMonth);
    mInput
  }
  if (isdef(month1)) date.setMonth(month1 - 1);
  if (isdef(year1)) date.setYear(year1);
  var setterMonth = ev => {
    let elem = ev.target;
    //let curmonth=date.getMonth();
    let [idx, s] = getCorrectMonth(elem.innerHTML);
    if (idx != date.getMonth()) { date.setMonth(s); }
    elem.innerHTML = `${date.toLocaleDateString('en-us', { month: 'long' })}`;
  }
  makeContentEditable(dMonth, setterMonth);
}
function restmuell() {
  function init() {
    mClear(container)
    date = initDate(_month, _year);
    uiDate();
  }
  function initDate(month, year) {
    let dt = new Date();
    if (nundef(year)) year = dt.getFullYear();
    if (nundef(month)) month = dt.getMonth(); else month -= 1;
    dt = new Date(year, month); //(`${dt.getFullYear()}-${dt.getMonth}-01`)
    //console.log('date', dt, year, month + 1);
    return dt;
  }
  function setMonth(s) { date.setMonth(s); init(); }
  function setYear(s) { date.setYear(s); init(); }
  function uiDate() {
    //uses: date, container
    let d = mDiv(container, { padding: 10, fg: '#d36c6c', fz: 26, family: 'sans-serif', display: 'flex', justify: 'space-between' });

    let elem = mDiv(d, {}, 'dMonth', `${date.toLocaleDateString('en-us', { month: 'long' })}`);
    let setter = ev => {
      let [idx, s] = getCorrectMonth(ev.target.innerHTML, month);

      if (idx != date.getMonth()) { date.setMonth(s); elem.innerHTML = s; }

    };
    makeContentEditable(elem, setter);
    // //makeContentEditable(dMonth); //, ev=>setMonth(ev.target.innerHTML));
    // if (nundef(mBy('dummy'))) addDummy(document.body, 'cc');
    // elem.contentEditable = true;
    // elem.addEventListener('keyup', ev => {
    //   if (ev.key == 'Enter') {
    //     //if (preventDefault) ev.preventDefault(); 
    //     mBy('dummy').focus();
    //     //console.log('month is now', s)
    //   }
    // });

    //dMonth.innerText = `${date.toLocaleDateString('en-us', { month: 'long' })} ${date.getFullYear()}`;
    //wie mach ich das editable?
  }
  // init();
  // return { container, date, dParent };

}


