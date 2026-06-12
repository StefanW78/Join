// Global Variable

let toDoNumbers = document.getElementById(`toDoNumbers`)
let doneNumbers = document.getElementById(`doneNumbers`)
let urgentNumbers = document.getElementById(`urgentNumbers`)
let dueDate = document.getElementById(`dueDate`)
let totalTasksNumbers = document.getElementById(`totalTasksNumbers`)
let inProgressNumber = document.getElementById(`inProgressNumber`)
let awaitingFeedbackNumber = document.getElementById(`awaitingFeedbackNumber`)
let SummaryName = document.getElementById(`userName`)
let SummaryDiv = document.getElementById(`summary-div`)
let AnimationWelcomePage = document.getElementById(`anima-welcom-page`)
const SignedUserName = document.getElementById("signedUser");



function init() {
  greetingGuest()
  renderSummary();
  renderInitials();
}


async function renderSummary() {
  renderName();

  const fetchdData = await loadDataBase("tasks");
  const todos = Object.values(fetchdData);

  // Zahlen berechnen
  const totalTodos = todos.length;
  const totalDone = todos.filter(t => t.status === "done").length;
  const totalTodo = todos.filter(t => t.status === "todo").length;
  const totalInProgress = todos.filter(t => t.status === "inProgress").length;
  const totalFeedback = todos.filter(t => t.status === "feedback").length;
  const totalUrgent = todos.filter(t => t.priority === "urgent").length;
  const nextDeadline = getUpcomingDeadline(todos);


  const formattedDeadline = nextDeadline
    ? nextDeadline.toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      })
    : "No upcoming deadlines";

  toDoNumbers.innerText = totalTodo;
  doneNumbers.innerText = totalDone;
  urgentNumbers.innerText = totalUrgent;
  totalTasksNumbers.innerText = totalTodos;
  inProgressNumber.innerText = totalInProgress;
  awaitingFeedbackNumber.innerText = totalFeedback;
  dueDate.innerText = formattedDeadline;
}

function getUpcomingDeadline(todos) {
  const now = new Date();

  const upcoming = todos
    .filter(t => t.dueDate)
    .map(t => new Date(t.dueDate))
    .filter(dueDate => dueDate >= now)
    .sort((a, b) => a - b);

  return upcoming.length > 0 ? upcoming[0] : null;
}

function renderName() {
  let name = localStorage.getItem("username")

  if (!name) return;

  SummaryName.innerText = name
  SignedUserName.innerText = name
}


function greetingGuest() {
  const checkQueries = window.matchMedia("(max-width: 1092px)");
  if (checkQueries.matches) {
    AnimationWelcomeAnimation()
  }
}


function AnimationWelcomeAnimation() {
  const welcomeMsg = document.querySelector(".welcomeMsg");

  SummaryDiv.style.display = "none";
  AnimationWelcomePage.classList.add("welcome-animation");
  welcomeMsg.textContent = `Good morning!`;
  AnimationWelcomePage.classList.remove("d_none")
  AnimationWelcomePage.style.display = "block";
  // signedUser.textContent = userName === "Guest" ? "" : `${userName}`;
  setTimeout(() => {
    AnimationWelcomePage.classList.remove("welcome-animation");
    AnimationWelcomePage.style.display = "none";
    SummaryDiv.style.display = "flex";
  }, 3000);
}

const boxItems = document.querySelectorAll(".overview-container-items");
boxItems.forEach((box) => {
  box.addEventListener("click", () => {
    window.location.href = "index.html";
  });
});

