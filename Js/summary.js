
/**
 * References the HTML elements used to display summary data.
 */
let toDoNumbers = document.getElementById(`toDoNumbers`)
/**
 * References the DOM element with the ID `doneNumbers`.
 */
let doneNumbers = document.getElementById(`doneNumbers`)
/**
 * References the DOM element with the ID `urgentNumbers`.
 */
let urgentNumbers = document.getElementById(`urgentNumbers`)
/**
 * References the DOM element with the ID `dueDate`.
 */
let dueDate = document.getElementById(`dueDate`)
/**
 * References the DOM element with the ID `totalTasksNumbers`.
 */
let totalTasksNumbers = document.getElementById(`totalTasksNumbers`)
/**
 * References the DOM element with the ID `inProgressNumber`.
 */
let inProgressNumber = document.getElementById(`inProgressNumber`)
/**
 * References the DOM element with the ID `awaitingFeedbackNumber`.
 */
let awaitingFeedbackNumber = document.getElementById(`awaitingFeedbackNumber`)
/**
 * References the DOM element with the ID `userName`.
 */
let SummaryName = document.getElementById(`userName`)
/**
 * References the DOM element with the ID `summary-div`.
 */
let SummaryDiv = document.getElementById(`summary-div`)
/**
 * References the DOM element with the ID `anima-welcom-page`.
 */
let AnimationWelcomePage = document.getElementById(`anima-welcom-page`)
/**
 * References the DOM element with the ID `signedUser`.
 */
const SignedUserName = document.getElementById("signedUser");


/**
 * Initializes the application by displaying the greeting,
 * rendering the task summary and setting the user's initials.
 *
 * @function init
 * @returns {void}
 */
function init() {
  greetingGuest()
  renderSummary();
  renderInitials();
}

/**
 * Loads the tasks and renders the task summary.
 *
 * @async
 * @function renderSummary
 * @returns {Promise<void>} A promise that resolves when the summary is rendered.
 */
async function renderSummary() {
  renderName();

  const fetchdData = await loadDataBase("tasks");
  const todos = Object.values(fetchdData);

  const numbers = getTodoNumbers(todos);
  const formattedDeadline = formatDeadline(todos);

  displaySummary(numbers, formattedDeadline);
}

/**
 * Calculates the number of tasks based on their status and priority.
 *
 * @function getTodoNumbers
 * @param {Object[]} todos - Array of task objects.
 * @returns {Object} An object containing the calculated task numbers.
 */
function getTodoNumbers(todos) {
  return {
    totalTodos: todos.length,
    totalDone: todos.filter(t => t.status === "done").length,
    totalTodo: todos.filter(t => t.status === "todo").length,
    totalInProgress: todos.filter(t => t.status === "inProgress").length,
    totalFeedback: todos.filter(t => t.status === "awaitFeedback").length,
    totalUrgent: todos.filter(t => t.priority === "urgent").length
  };
}

/**
 * Formats the upcoming deadline as a readable date.
 *
 * @function formatDeadline
 * @param {Object[]} todos - Array of task objects.
 * @returns {string} The formatted deadline or a message if no deadline exists.
 */
function formatDeadline(todos) {
  const nextDeadline = getUpcomingDeadline(todos);

  if (!nextDeadline) {
    return "No upcoming deadlines";
  }

  return nextDeadline.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  });
}

/**
 * Displays the task summary and deadline in the corresponding HTML elements.
 *
 * @function displaySummary
 * @param {Object} numbers - Object containing the calculated task numbers.
 * @param {string} formattedDeadline - Formatted upcoming deadline.
 * @returns {void}
 */
function displaySummary(numbers, formattedDeadline) {
  toDoNumbers.innerText = numbers.totalTodo;
  doneNumbers.innerText = numbers.totalDone;
  urgentNumbers.innerText = numbers.totalUrgent;
  totalTasksNumbers.innerText = numbers.totalTodos;
  inProgressNumber.innerText = numbers.totalInProgress;
  awaitingFeedbackNumber.innerText = numbers.totalFeedback;
  dueDate.innerText = formattedDeadline;
}

/**
 * Finds the next upcoming deadline from the given tasks.
 *
 * @function getUpcomingDeadline
 * @param {Object[]} todos - Array of task objects.
 * @returns {Date|null} The next upcoming deadline or null if none exists.
 */
function getUpcomingDeadline(todos) {
  const now = new Date();

  const upcoming = todos
    .filter(t => t.dueDate)
    .map(t => new Date(t.dueDate))
    .filter(dueDate => dueDate >= now)
    .sort((a, b) => a - b);

  return upcoming.length > 0 ? upcoming[0] : null;
}

/**
 * Retrieves the username from local storage and displays it.
 *
 * @function renderName
 * @returns {void}
 */
function renderName() {
  let name = localStorage.getItem("username")

  if (!name) return;

  SummaryName.innerText = name
  SignedUserName.innerText = name
}

/**
 * Checks the screen width and starts the welcome animation on smaller screens.
 *
 * @function greetingGuest
 * @returns {void}
 */
function greetingGuest() {
  const checkQueries = window.matchMedia("(max-width: 1023px)");
  if (checkQueries.matches) {
    AnimationWelcomeAnimation()
  }
}

/**
 * Displays the welcome animation and shows the summary after three seconds.
 *
 * @function AnimationWelcomeAnimation
 * @returns {void}
 */
function AnimationWelcomeAnimation() {
  const welcomeMsg = document.querySelector(".welcomeMsg");

  SummaryDiv.style.display = "none";
  AnimationWelcomePage.classList.add("welcome-animation");
  welcomeMsg.textContent = `Good morning!`;
  AnimationWelcomePage.classList.remove("d_none")
  AnimationWelcomePage.style.display = "block";
  setTimeout(() => {
    AnimationWelcomePage.classList.remove("welcome-animation");
    AnimationWelcomePage.style.display = "none";
    SummaryDiv.style.display = "flex";
  }, 3000);
}

/**
 * Adds click events to the overview items and redirects to the board page.
 */
const boxItems = document.querySelectorAll(".overview-container-items");
boxItems.forEach((box) => {
  box.addEventListener("click", () => {
    window.location.href = "board.html";
  });
});
