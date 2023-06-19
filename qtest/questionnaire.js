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

// Function to display the questionnaire
function displayQuestionnaire() {
  var questionnaireContainer = document.getElementById("questionnaire");

  for (var i = 0; i < questions.length; i++) {
    var question = document.createElement("div");
    question.innerHTML = "<h3>Question " + (i + 1) + ": " + questions[i] + "</h3>";
    question.classList.add('question')

    var answer = document.createElement("input");
    answer.setAttribute("type", "text");
    answer.setAttribute("data-question-index", i);
    answer.classList.add('answer-input')

    question.appendChild(answer);
    questionnaireContainer.appendChild(question);
  }

  var submitButton = document.createElement("button");
  submitButton.textContent = "Submit";
  submitButton.addEventListener("click", submitQuestionnaire);
  questionnaireContainer.appendChild(submitButton);
}

// Function to submit the questionnaire and store responses
function submitQuestionnaire() {
  var answerInputs = document.querySelectorAll("input[data-question-index]");
  for (var i = 0; i < answerInputs.length; i++) {
    var response = answerInputs[i].value;
    userResponses.push(response);
  }

  displayResults();
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

// Display the questionnaire
displayQuestionnaire();
