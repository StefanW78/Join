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
let Firebase_URL = "./test-databank.json"


function init() {
  greetingGuest()
  renderSummary();
  renderInitials();
}


async function loadTodos() {
    
    try{
        const response = await fetch(Firebase_URL)

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const ResponseToJson = await response.json();

        let fetchdData = {};
        
        if (ResponseToJson && typeof ResponseToJson === "object") {
      for (const [id, todoData] of Object.entries(ResponseToJson)) {
        fetchdData[id] = { id, ...todoData };
      }
    }

        console.log("fetchData:", fetchdData);
        return fetchdData;
    }catch (error) {
    console.error("Error loading todos:", error);
    return {};
  }


}

async function renderSummary() {
   
    renderName();
    const fetchdData = await loadTodos();

    const todos = Object.values(fetchdData);

    // Zahlen berechnen
  const totalTodos = todos.length;
  const totalDone = todos.filter(t => t.status === "done").length;
  const totalTodo = todos.filter(t => t.status === "todo").length;
  const totalInProgress = todos.filter(t => t.status === "inProgress").length;
  const totalFeedback = todos.filter(t => t.status === "feedback").length;
  const totalUrgent = todos.filter(t => t.urgent).length;
  const totalWithDate = todos.filter(t => t.date).length;

  toDoNumbers.innerText = totalTodo;
  doneNumbers.innerText = totalDone;
  urgentNumbers.innerText = totalUrgent;
  totalTasksNumbers.innerText = totalTodos;
  inProgressNumber.innerText = totalInProgress;
  awaitingFeedbackNumber.innerText = totalFeedback;

    // // Zahlen in Konsole ausgeben als test
  // console.log("Summary Zahlen:");
  // console.log("Total Todos:", totalTodos);
  // console.log("Done:", totalDone);
  // console.log("Todo:", totalTodo);
  // console.log("In Progress:", totalInProgress);
  // console.log("Awaiting Feedback:", totalFeedback);
  // console.log("Urgent:", totalUrgent);
  // console.log("With Date:", totalWithDate);


}

function renderName() {
  let name = localStorage.getItem("username")

  if (!name) return;

  SummaryName.innerText = name
  SignedUserName.innerText = name
}


function greetingGuest() {
  const checkQueries = window.matchMedia("(max-width: 864px)");
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

