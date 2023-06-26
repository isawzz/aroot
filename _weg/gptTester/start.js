function generateCalendar(month, year) {
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const calendarContainer = document.getElementById('calendar-container');

  // Create table element
  const table = document.createElement('table');
  table.classList.add('notion-calendar');

  // Create table header with days of the week
  const tableHeader = document.createElement('thead');
  const headerRow = document.createElement('tr');
  daysOfWeek.forEach(day => {
    const headerCell = document.createElement('th');
    headerCell.textContent = day;
    headerRow.appendChild(headerCell);
  });
  tableHeader.appendChild(headerRow);

  // Create table body with calendar dates
  const tableBody = document.createElement('tbody');

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const totalDays = lastDay.getDate();

  let currentDate = 1;

  while (currentDate <= totalDays) {
    const weekRow = document.createElement('tr');

    for (let i = 0; i < 7; i++) {
      const dayCell = document.createElement('td');

      if (currentDate > totalDays) {
        break;
      }

      if (i >= firstDay.getDay() || weekRow.childElementCount > 0) {
        const dateElement = document.createElement('div');
        dateElement.classList.add('notion-calendar-date');
        dateElement.textContent = currentDate;

        const entryInput = document.createElement('input');
        entryInput.type = 'text';
        entryInput.classList.add('notion-calendar-entry-input');
        entryInput.placeholder = 'Add entry';

        dayCell.appendChild(dateElement);
        dayCell.appendChild(entryInput);
        currentDate++;
      }

      weekRow.appendChild(dayCell);
    }

    tableBody.appendChild(weekRow);
  }

  table.appendChild(tableHeader);
  table.appendChild(tableBody);

  // Clear the calendar container and append the table
  calendarContainer.innerHTML = '';
  calendarContainer.appendChild(table);
}

function generateCalendar0(month, year) {
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const calendarContainer = document.getElementById('calendar-container');

  // Create table element
  const table = document.createElement('table');
  table.classList.add('notion-calendar');

  // Create table header with days of the week
  const tableHeader = document.createElement('thead');
  const headerRow = document.createElement('tr');
  daysOfWeek.forEach(day => {
    const headerCell = document.createElement('th');
    headerCell.textContent = day;
    headerRow.appendChild(headerCell);
  });
  tableHeader.appendChild(headerRow);

  // Create table body with calendar dates
  const tableBody = document.createElement('tbody');

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const totalDays = lastDay.getDate();

  let currentDate = 1;

  while (currentDate <= totalDays) {
    const weekRow = document.createElement('tr');

    for (let i = 0; i < 7; i++) {
      const dayCell = document.createElement('td');

      if (currentDate > totalDays) {
        break;
      }

      if (i >= firstDay.getDay() || weekRow.childElementCount > 0) {
        const dateElement = document.createElement('div');
        dateElement.classList.add('notion-calendar-date');
        dateElement.textContent = currentDate;

        dayCell.appendChild(dateElement);
        currentDate++;
      }

      weekRow.appendChild(dayCell);
    }

    tableBody.appendChild(weekRow);
  }

  table.appendChild(tableHeader);
  table.appendChild(tableBody);

  // Clear the calendar container and append the table
  calendarContainer.innerHTML = '';
  calendarContainer.appendChild(table);
}

function displayCalendar(month, year) {
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const calendarContainer = document.getElementById('calendar-container');

  // Create table and header
  const table = document.createElement('table');
  table.classList.add('metro-calendar');

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
      dayCell.classList.add('metro-calendar-cell');

      // Check if the cell corresponds to a day in the current month
      if (i === 0 && j < firstDay.getDay()) {
        dayCell.textContent = '';
      } else if (currentDate > totalDays) {
        break;
      } else {
        const dateElement = document.createElement('div');
        dateElement.textContent = currentDate;
        dateElement.classList.add('metro-calendar-date');
        dayCell.appendChild(dateElement);

        const inputList = document.createElement('ul');
        inputList.classList.add('metro-calendar-input-list');
        for (let h = 9; h <= 19; h += 2) {
          const inputItem = document.createElement('li');
          inputItem.classList.add('metro-calendar-input-item');

          const hourColumn = document.createElement('div');
          hourColumn.textContent = `${h}:00`;
          hourColumn.classList.add('metro-calendar-hour-column');
          inputItem.appendChild(hourColumn);

          const inputColumn = document.createElement('div');
          const textarea = document.createElement('textarea'); //input');
          textarea.rows = 1;
          textarea.classList.add('metro-calendar-input');
          inputColumn.appendChild(textarea);
          inputItem.appendChild(inputColumn);

          inputList.appendChild(inputItem);
        }
        dayCell.appendChild(inputList);

        dayCell.dataset.day = currentDate;
        currentDate++;
      }

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

function displayCalendar3(month, year) {
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const calendarContainer = document.getElementById('calendar-container');

  // Create table and header
  const table = document.createElement('table');
  table.classList.add('metro-calendar');

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
      dayCell.classList.add('metro-calendar-cell');

      // Check if the cell corresponds to a day in the current month
      if (i === 0 && j < firstDay.getDay()) {
        dayCell.textContent = '';
      } else if (currentDate > totalDays) {
        break;
      } else {
        const dateElement = document.createElement('div');
        dateElement.textContent = currentDate;
        dateElement.classList.add('metro-calendar-date');
        dayCell.appendChild(dateElement);

        const inputList = document.createElement('ul');
        inputList.classList.add('metro-calendar-input-list');
        for (let h = 9; h <= 19; h += 2) {
          const inputItem = document.createElement('li');
          const hourHeader = document.createElement('div');
          hourHeader.textContent = `${h}:00`;
          hourHeader.classList.add('metro-calendar-hour-header');
          inputItem.appendChild(hourHeader);

          const textarea = document.createElement('textarea');
          textarea.rows = 3;
          textarea.classList.add('metro-calendar-input');
          inputItem.appendChild(textarea);

          inputList.appendChild(inputItem);
        }
        dayCell.appendChild(inputList);

        dayCell.dataset.day = currentDate;
        currentDate++;
      }

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

function displayCalendar2(month, year) {
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const calendarContainer = document.getElementById('calendar-container');

  // Create table and header
  const table = document.createElement('table');
  table.classList.add('metro-calendar');

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
      dayCell.classList.add('metro-calendar-cell');

      // Check if the cell corresponds to a day in the current month
      if (i === 0 && j < firstDay.getDay()) {
        dayCell.textContent = '';
      } else if (currentDate > totalDays) {
        break;
      } else {
        const dateElement = document.createElement('div');
        dateElement.textContent = currentDate;
        dateElement.classList.add('metro-calendar-date');
        dayCell.appendChild(dateElement);

        const textarea = document.createElement('textarea');
        textarea.rows = 10;
        textarea.classList.add('metro-calendar-input');
        dayCell.appendChild(textarea);

        dayCell.dataset.day = currentDate;
        currentDate++;
      }

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

function displayCalendar1(month, year) {
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const calendarContainer = document.getElementById('calendar-container');

  // Create table and header
  const table = document.createElement('table');
  table.classList.add('metro-calendar');

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
      dayCell.classList.add('metro-calendar-cell');

      // Check if the cell corresponds to a day in the current month
      if (i === 0 && j < firstDay.getDay()) {
        dayCell.textContent = '';
      } else if (currentDate > totalDays) {
        break;
      } else {
        const textarea = document.createElement('textarea');
        textarea.rows = 10;
        textarea.classList.add('metro-calendar-input');
        dayCell.appendChild(textarea);

        dayCell.dataset.day = currentDate;
        currentDate++;
      }

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

function displayCalendar0(month, year) {
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
// Example usage: Display the calendar for June 2023
displayCalendar(5, 2023);

