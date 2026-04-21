import { loadTasks } from "./task.js";

async function initBoard() {
  const tasks = await loadTasks();
  console.log(tasks);

  renderTasks(tasks);
}

initBoard();
function createTaskCard(task) {
  const card = document.createElement("div");

  card.classList.add("taskCard");

  card.innerHTML = `
    <h3>${task.title}</h3>
    <p>${task.description}</p>
    <small>${task.category}</small>
  `;

  return card;
}

function renderTasks(tasks) {
  const todoColumn = document.getElementById("todoColumn");
  const inProgressColumn = document.getElementById("inProgressColumn");
  const doneColumn = document.getElementById("doneColumn");

  // leeren
  todoColumn.innerHTML = "";
  inProgressColumn.innerHTML = "";
  doneColumn.innerHTML = "";

  tasks.forEach((task) => {
    const card = createTaskCard(task);

    if (!task.status || task.status === "todo") {
  todoColumn.appendChild(card);
}

    if (task.status === "todo") {
      todoColumn.appendChild(card);
    } else if (task.status === "inprogress") {
      inProgressColumn.appendChild(card);
    } else if (task.status === "done") {
      doneColumn.appendChild(card);
    }
  });
}

