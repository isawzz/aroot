var dada = {};
async function start(){
  test1_displayCalendar();//test0_displayNQuestions();
}
function test1_displayCalendar(){
  let html = `<div id="calendar-container"></div>`;
  let d=mBy('dMain');
  mClear(d);
  mAppend(d,mCreateFrom(html));
  displayCalendar(7,2023);

}
function test0_displayNQuestions(){
  let ui = uiTypeQuestions(mBy('dMain')); //console.log(ui)
  let qlist = loadQuestions();//  console.log(qlist)
  //qlist = qlist=qlist.filter(x=>['needs'].includes(x.k));
  displayQuestions(qlist,20);
  //displayQuestionnaire();
}
function displayCalendar(month, year) {
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const calendarContainer = document.getElementById('calendar-container');

  // Create table and header
  const table = document.createElement('table');
  const tableHeader = document.createElement('thead');
  const headerRow = document.createElement('tr');

  // Add days of the week as header cells
  daysOfWeek.forEach(day => {
    const headerCell = document.createElement('th');
    headerCell.textContent = day;
    headerRow.appendChild(headerCell);
  });

  tableHeader.appendChild(headerRow);
  table.appendChild(tableHeader);

  // Create table body
  const tableBody = document.createElement('tbody');

  // Get the first day of the month and the total number of days
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const totalDays = lastDay.getDate();

  let currentDate = 1;

  // Create table rows for each week
  for (let i = 0; i < 6; i++) {
    const weekRow = document.createElement('tr');

    // Create table cells for each day of the week
    for (let j = 0; j < 7; j++) {
      const dayCell = document.createElement('td');

      // Check if the cell corresponds to a day in the current month
      if (i === 0 && j < firstDay.getDay()) {
        dayCell.textContent = '';
      } else if (currentDate > totalDays) {
        break;
      } else {
        dayCell.textContent = currentDate;
        currentDate++;
      }

      // Make the cells editable
      const input = document.createElement('input');
      input.type = 'text';
      dayCell.appendChild(input);

      weekRow.appendChild(dayCell);
    }

    tableBody.appendChild(weekRow);
  }

  table.appendChild(tableBody);
  calendarContainer.innerHTML = '';

  // Display the month and year
  const monthYearHeader = document.createElement('h2');
  monthYearHeader.textContent = `${monthNames[month]} ${year}`;
  calendarContainer.appendChild(monthYearHeader);
  calendarContainer.appendChild(table);
}
function displayQuestions(qlist,num,pickRandom=true){

  if (nundef(num)) num=10;
  qlist = pickRandom? rChoose(qlist,num): arrTake(qlist,num);

  console.log('qs',qlist)
  qlist.map(x=>displayQuestion(x));

}
function displayQuestion(x){
  let q = isString(x)?x:x.q;
  var questionnaireContainer = document.getElementById("questionnaire");
  let i = questionnaireContainer.children.length;

  var question = document.createElement("div");
  question.className = "question";
  question.innerHTML = "<h3>Question " + (i+1) + ": " + q + "</h3>";

  var answer = document.createElement("input");
  answer.className = "answer-input";
  answer.setAttribute("type", "text");
  answer.setAttribute("data-question-index", i);

  question.appendChild(answer);
  questionnaireContainer.appendChild(question);

}
function loadQuestions(){
  let res = [];
  let i = 0;
  for (const k in DiQuestions) {
    for (const q of DiQuestions[k]) { res.push({ i: i++, k: k, q: q, a: null }); i += 1; }
  }
  return res;
}
function loadAnswers(){
  let html = `<div class="results-container" id="results"></div>`

}
function uiTypeQuestions(dParent){
  // let res = mDiv(dParent,{},null,)
  let html = `
    <div class="questionnaire-container">
      <div id="questionnaire"></div>
      <button class="submit-button" onclick="submitQuestionnaire()">Submit</button>
    </div>
  `;
  return mAppend(dParent,mCreateFrom(html));

}
