// Global Variable

let toDoNumbers = document.getElementById(`toDoNumbers`)
let doneNumbers = document.getElementById(`doneNumbers`)
let urgentNumbers = document.getElementById(`urgentNumbers`)
let dueDate = document.getElementById(`dueDate`)
let totalTasksNumbers = document.getElementById(`totalTasksNumbers`)
let inProgressNumber = document.getElementById(`inProgressNumber`)
let awaitingFeedbackNumber = document.getElementById(`awaitingFeedbackNumber`)
let Firebase_URL = "./test-databank.json"

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

  // Zahlen in Konsole ausgeben als test
  console.log("Summary Zahlen:");
  console.log("Total Todos:", totalTodos);
  console.log("Done:", totalDone);
  console.log("Todo:", totalTodo);
  console.log("In Progress:", totalInProgress);
  console.log("Awaiting Feedback:", totalFeedback);
  console.log("Urgent:", totalUrgent);
  console.log("With Date:", totalWithDate);


  toDoNumbers.innerText = totalTodo;
  doneNumbers.innerText = totalDone;
  urgentNumbers.innerText = totalUrgent;
  totalTasksNumbers.innerText = totalTodos;
  inProgressNumber.innerText = totalInProgress;
  awaitingFeedbackNumber.innerText = totalFeedback;


}

