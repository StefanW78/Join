import { loadData } from "./storage.js";

let boardTasks = [];

async function initBoard() {
  try {
    const tasksObject = await loadData("tasks");

    boardTasks = Object.entries(tasksObject).map(([id, task]) => {
      return {
        id,
        ...task,
      };
    });

    renderBoardTasks();
  } catch (error) {
    console.error("Fehler beim Laden der Tasks:", error);
  }
}

function renderBoardTasks() {
  clearBoardColumns();

  boardTasks.forEach((task) => {
    const targetColumn = getTargetColumn(task.status);

    if (!targetColumn) return;

    targetColumn.innerHTML += getTaskCardTemplate(task);
  });

  renderEmptyMessages();
}

function clearBoardColumns() {
  document.getElementById("todoTasks").innerHTML = "";
  document.getElementById("inProgressTasks").innerHTML = "";
  document.getElementById("awaitFeedbackTasks").innerHTML = "";
  document.getElementById("doneTasks").innerHTML = "";
}

function getTargetColumn(status) {
  if (status === "todo") {
    return document.getElementById("todoTasks");
  }

  if (status === "inProgress") {
    return document.getElementById("inProgressTasks");
  }

  if (status === "awaitFeedback") {
    return document.getElementById("awaitFeedbackTasks");
  }

  if (status === "done") {
    return document.getElementById("doneTasks");
  }

  return document.getElementById("todoTasks");
}

function getTaskCardTemplate(task) {
  const subtasks = task.subtasks || [];
  const completedSubtasks = subtasks.filter((subtask) => subtask.done).length;
  const totalSubtasks = subtasks.length;
  const progress = getSubtaskProgress(completedSubtasks, totalSubtasks);

  return `
    <div class="card" data-task-id="${task.id}">
      <span class="tag ${getCategoryClass(task.category)}">
        ${task.category || "Task"}
      </span>

      <div class="card-title">${task.title || ""}</div>

      <div class="card-desc">
        ${task.description || ""}
      </div>

      ${getSubtaskProgressTemplate(completedSubtasks, totalSubtasks, progress)}

      <div class="card-footer">
        <div class="avatars">
          ${getAssignedAvatarsTemplate(task.assignedTo || [])}
        </div>

        <div class="priority ${getPriorityClass(task.priority)}">
          ${getPriorityIcon(task.priority)}
        </div>
      </div>
    </div>
  `;
}

function getCategoryClass(category) {
  if (category === "Technical Task") {
    return "tag-teal";
  }

  if (category === "User Story") {
    return "tag-blue";
  }

  return "tag-blue";
}

function getPriorityClass(priority) {
  if (priority === "urgent") {
    return "prio-urgent";
  }

  if (priority === "medium") {
    return "prio-medium";
  }

  if (priority === "low") {
    return "prio-low";
  }

  return "prio-medium";
}

function getSubtaskProgress(completedSubtasks, totalSubtasks) {
  if (totalSubtasks === 0) {
    return 0;
  }

  return Math.round((completedSubtasks / totalSubtasks) * 100);
}

function getSubtaskProgressTemplate(completedSubtasks, totalSubtasks, progress) {
  if (totalSubtasks === 0) {
    return "";
  }

  return `
    <div class="subtasks">
      <div class="progress-bar">
        <div class="progress-fill" style="width:${progress}%"></div>
      </div>
      ${completedSubtasks}/${totalSubtasks} Subtasks
    </div>
  `;
}

function getAssignedAvatarsTemplate(assignedContacts) {
  const visibleContacts = assignedContacts.slice(0, 3);

  return visibleContacts
    .map((contact, index) => {
      return `
        <div class="av ${getAvatarColorClass(index)}">
          ${contact.initials || getInitials(contact.name)}
        </div>
      `;
    })
    .join("");
}

function getInitials(name = "") {
  return name
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

function getAvatarColorClass(index) {
  const colors = ["av-orange", "av-purple", "av-teal"];
  return colors[index % colors.length];
}

function getPriorityIcon(priority) {
  if (priority === "urgent") {
    return `
      <svg width="20" height="15" viewBox="0 0 20 15" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18.9 14.5L10 8.2L1.1 14.5" stroke="#FF3D00" stroke-width="3"/>
        <path d="M18.9 8.7L10 2.4L1.1 8.7" stroke="#FF3D00" stroke-width="3"/>
      </svg>
    `;
  }

  if (priority === "low") {
    return `
      <svg width="20" height="15" viewBox="0 0 20 15" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1.1 1L10 7.3L18.9 1" stroke="#7AE229" stroke-width="3"/>
        <path d="M1.1 6.8L10 13.1L18.9 6.8" stroke="#7AE229" stroke-width="3"/>
      </svg>
    `;
  }

  return `
    <svg width="20" height="8" viewBox="0 0 20 8" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 1H19" stroke="#FFA800" stroke-width="3"/>
      <path d="M1 7H19" stroke="#FFA800" stroke-width="3"/>
    </svg>
  `;
}

function renderEmptyMessages() {
  renderEmptyMessage("todoTasks", "No tasks To do");
  renderEmptyMessage("inProgressTasks", "No tasks in progress");
  renderEmptyMessage("awaitFeedbackTasks", "No tasks await feedback");
  renderEmptyMessage("doneTasks", "No tasks done");
}

function renderEmptyMessage(containerId, message) {
  const container = document.getElementById(containerId);

  if (container.children.length === 0) {
    container.innerHTML = `<div class="empty-card">${message}</div>`;
  }
}

initBoard();