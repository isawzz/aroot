// Array to store the user's responses
var userResponses = [];

// Questions array
var questions = [
  "What is your favorite hobby?",
  "Do you prefer indoor or outdoor activities?",
  "Are you more introverted or extroverted?",
  "What type of music do you enjoy?",
  "What is your favorite book or genre?",
  "Are you a morning person or a night owl?",
  "What is your favorite type of cuisine?",
  "Do you enjoy watching sports?",
  "Are you a cat or a dog person?",
  "What is your preferred mode of transportation?",
  "Do you enjoy traveling?",
  "Are you a tea or coffee person?",
  "What is your favorite season of the year?",
  "Do you enjoy cooking?",
  "Are you interested in art or photography?",
  "What is your favorite movie genre?",
  "Do you like to participate in team activities?",
  "What is your favorite type of exercise or physical activity?",
  "Do you enjoy solving puzzles or brain teasers?",
  "What is your favorite leisure activity?"
];

// Function to ask questions and store responses
function askQuestions() {
  var i = 0;
  var totalQuestions = questions.length;

  function askQuestion() {
    if (i < totalQuestions) {
      var response = prompt(questions[i]);
      userResponses.push(response);
      i++;
      askQuestion();
    } else {
      displayResults();
    }
  }

  askQuestion();
}

// Function to display user's responses
function displayResults() {
  var resultsContainer = document.getElementById("results");

  for (var i = 0; i < userResponses.length; i++) {
    var question = document.createElement("h3");
    question.textContent = "Question " + (i + 1) + ": " + questions[i];
    resultsContainer.appendChild(question);

    var answer = document.createElement("p");
    answer.textContent = "Answer: " + userResponses[i];
    resultsContainer.appendChild(answer);
  }
}

// Start the questionnaire
askQuestions();
