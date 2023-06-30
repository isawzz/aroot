function editEvent(ev,o){
}
function phpSim(data,cmd){
  //der macht genau das was normal der phpServer macht und verwendet als
  //SESSION die global Session var
  var o = {};
  o.data = valf(data, {});
  o.cmd = cmd;
  //o = JSON.stringify(o);

  let result = {};
  if (cmd == 'addEvent') {
    //find max id in existing events, add 1 to it
    let ev=jsCopy(data);

    let max = isEmpty(Config.events)?0:arrMax(Config.events,x=>x.id);
    console.log('max',max,typeof max)
    ev.id = Number(max)+1;
    result.event = ev;
    console.log(result)
  }

  handleResult(JSON.stringify(result), cmd);
}

function populateDays(cal){
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

  //console.log('paddingDays', day, month, year, paddingDays);
  //console.log('dDays', dDays);
  for (const i of range(42)){
    if (i<paddingDays || i>=paddingDays + daysInMonth){ mStyle(dDays[i], { opacity: 0 }); }
  }
  // for (const i of range(paddingDays)) { mStyle(dDays[i], { opacity: 0 }); }
  // for (const i of range(paddingDays + daysInMonth,34)) { mStyle(dDays[i], { opacity: 0 }); }

  //restliche tage bis month ende sind ok
  for (let i = paddingDays+1; i <= paddingDays + daysInMonth; i++) {
    const daySquare = dDays[i - 1]; //document.createElement('div');
    const dayString = `${month + 1}/${i - paddingDays}/${year}`;
    daySquare.innerText = i - paddingDays;
    let date = new Date(year, month, i-paddingDays);
    let d = mDiv(daySquare, { box:true, align: 'center', bg: rColor(), w: '95%', hpadding: '2%', hmin: cellWidth - 28}); //,null,null,'padding');
    d.addEventListener('click', ev => openModal(date, dayString, daySquare.lastChild, ev));
    //dDays[i - 1].appendChild(daySquare);
  }


}







