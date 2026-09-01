import { loadData, patchData, deleteData } from "./storage.js";
import { initEditTaskForm } from "./boardEdit.js";

let boardTasks = [];
let contacts = [];
let filteredTasks = [];

async function initBoard() {
  try {
    const tasksObject = await loadData("tasks");
    const usersObject = await loadData("users");
    contacts = Object.entries(usersObject).map(createBoardContact);
    boardTasks = Object.entries(tasksObject).map(createBoardTask);
    filteredTasks = boardTasks;
    initBoardSearch();
    renderBoardTasks();
  } catch (error) {
    console.error("Fehler beim Laden der Board-Daten:", error);
  }
}

function createBoardContact([id, user], index) {
  return { id, name: user.name, email: user.email,
    initials: user.initials, color: user.color || getAvatarColor(index) };
}

function createBoardTask([id, task]) {
  return { id, ...task };
}



function renderBoardTasks() {
  clearBoardColumns();
  filteredTasks.forEach(renderTaskIntoColumn);
  renderEmptyMessages();
  initTaskCardClicks();
  initDragAndDrop();
}

function renderTaskIntoColumn(task) {
  const targetColumn = getTargetColumn(task.status);
  if (targetColumn) targetColumn.innerHTML += getTaskCardTemplate(task);
}

function initBoardSearch() {
  const boardSearch = document.getElementById("boardSearch");

  if (!boardSearch) return;

  boardSearch.addEventListener("input", () => {
    updateFilteredTasks();
    renderBoardTasks();
  });
}

function updateFilteredTasks() {
  const boardSearch = document.getElementById("boardSearch");
  const searchText = boardSearch ? boardSearch.value.trim().toLowerCase() : "";

  filteredTasks = boardTasks.filter((task) => {
    const title = (task.title || "").toLowerCase();
    const description = (task.description || "").toLowerCase();

    return title.includes(searchText) || description.includes(searchText);
  });
}

function clearBoardColumns() {
  document.getElementById("todoTasks").innerHTML = "";
  document.getElementById("inProgressTasks").innerHTML = "";
  document.getElementById("awaitFeedbackTasks").innerHTML = "";
  document.getElementById("doneTasks").innerHTML = "";
}

function getTargetColumn(status) {
  const columnIds = {
    todo: "todoTasks",
    inProgress: "inProgressTasks",
    awaitFeedback: "awaitFeedbackTasks",
    done: "doneTasks",
  };
  return document.getElementById(columnIds[status] || columnIds.todo);
}

function getTaskCardTemplate(task) {
  const subtasks = task.subtasks || [];
  const completedSubtasks = subtasks.filter((subtask) => subtask.done).length;
  const totalSubtasks = subtasks.length;
  const progress = getSubtaskProgress(completedSubtasks, totalSubtasks);
  return `
    <div class="card" draggable="true" data-task-id="${task.id}">
      ${getTaskCardContentTemplate(task)}
      ${getSubtaskProgressTemplate(completedSubtasks, totalSubtasks, progress)}
      ${getTaskCardFooterTemplate(task)}
    </div>`;
}

function getTaskCardContentTemplate(task) {
  return `
    <span class="tag ${getCategoryClass(task.category)}">
      ${task.category || "Task"}
    </span>
    <div class="card-title">${task.title || ""}</div>
    <div class="card-desc">${task.description || ""}</div>`;
}

function getTaskCardFooterTemplate(task) {
  const assigned = enrichAssignedContacts(task.assignedTo || []);
  return `
    <div class="card-footer">
      <div class="avatars">${getAssignedAvatarsTemplate(assigned)}</div>
      <div class="priority ${getPriorityClass(task.priority)}">
        ${getPriorityIcon(task.priority)}
      </div>
    </div>`;
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
  const classes = {
    urgent: "prio-urgent",
    medium: "prio-medium",
    low: "prio-low",
  };
  return classes[priority] || classes.medium;
}

function getSubtaskProgress(completedSubtasks, totalSubtasks) {
  if (totalSubtasks === 0) {
    return 0;
  }

  return Math.round((completedSubtasks / totalSubtasks) * 100);
}

function getSubtaskProgressTemplate(completedSubtasks, totalSubtasks, progress) {
  if (totalSubtasks === 0) return "";
  return `
    <div class="subtasks">
      <div class="progress-bar">
        <div class="progress-fill" style="width:${progress}%"></div>
      </div>
      ${completedSubtasks}/${totalSubtasks} Subtasks
    </div>`;
}

function getAssignedAvatarsTemplate(assignedContacts) {
  const visibleContacts = assignedContacts.slice(0, 3);

  return visibleContacts
    .map((contact) => {
      return `
        <div class="av" style="background:${contact.color || "#2a3647"}">
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

function getAvatarColor(index) {
  const colors = ["#ff7a00", "#9747ff", "#1fbcb4", "#29abe2", "#6e52ff"];
  return colors[index % colors.length];
}

function enrichAssignedContacts(assignedContacts = []) {
  return assignedContacts.map(enrichAssignedContact);
}

function enrichAssignedContact(assignedContact) {
  const user = contacts.find((contact) => matchesAssignedContact(contact, assignedContact));
  if (!user) return assignedContact;
  return { ...assignedContact, id: user.id, name: user.name,
    email: user.email, initials: user.initials || getInitials(user.name),
    color: user.color };
}

function matchesAssignedContact(contact, assignedContact) {
  return contact.id === assignedContact.id ||
    contact.email === assignedContact.email ||
    contact.name === assignedContact.name;
}

function getPriorityIcon(priority) {
  if (priority === "urgent") return getUrgentPriorityIcon();
  if (priority === "low") return getLowPriorityIcon();
  return getMediumPriorityIcon();
}

function getUrgentPriorityIcon() {
  return `
      <svg width="20" height="15" viewBox="0 0 20 15" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18.9 14.5L10 8.2L1.1 14.5" stroke="#FF3D00" stroke-width="3"/>
        <path d="M18.9 8.7L10 2.4L1.1 8.7" stroke="#FF3D00" stroke-width="3"/>
      </svg>`;
}

function getLowPriorityIcon() {
  return `
      <svg width="20" height="15" viewBox="0 0 20 15" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1.1 1L10 7.3L18.9 1" stroke="#7AE229" stroke-width="3"/>
        <path d="M1.1 6.8L10 13.1L18.9 6.8" stroke="#7AE229" stroke-width="3"/>
      </svg>`;
}

function getMediumPriorityIcon() {
  return `
    <svg width="20" height="8" viewBox="0 0 20 8" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 1H19" stroke="#FFA800" stroke-width="3"/>
      <path d="M1 7H19" stroke="#FFA800" stroke-width="3"/>
    </svg>`;
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

let draggedTaskId = null;
let isDraggingTask = false;

function initDragAndDrop() {
  initDraggableCards();
  initDropColumns();
}

function initDraggableCards() {
  document.querySelectorAll(".card[data-task-id]").forEach((card) => {
    card.addEventListener("dragstart", (event) => {
      startDraggingCard(event, card);
    });

    card.addEventListener("dragend", () => {
      stopDraggingCard(card);
    });
  });
}

function startDraggingCard(event, card) {
  draggedTaskId = card.dataset.taskId;
  isDraggingTask = true;
  card.classList.add("is-dragging");
  const dragImage = createRotatedDragImage(card);
  setTaskDragImage(event, dragImage);
  requestAnimationFrame(() => dragImage.remove());
}

function setTaskDragImage(event, dragImage) {
  event.dataTransfer.setDragImage(
    dragImage,
    dragImage.offsetWidth / 2,
    dragImage.offsetHeight / 2,
  );
}

function createRotatedDragImage(card) {
  const dragImage = card.cloneNode(true);

  dragImage.classList.remove("is-dragging");
  dragImage.classList.add("custom-drag-image");

  dragImage.style.width = `${card.offsetWidth}px`;
  dragImage.style.height = `${card.offsetHeight}px`;

  document.body.appendChild(dragImage);

  return dragImage;
}

function stopDraggingCard(card) {
  card.classList.remove("is-dragging");

  setTimeout(() => {
    draggedTaskId = null;
    isDraggingTask = false;
  }, 0);
}

function initDropColumns() {
  document.querySelectorAll(".column[data-status]").forEach(initDropColumn);
}  

function initDropColumn(column) {
  column.addEventListener("dragover", (event) => handleDragOver(event, column));
  column.addEventListener("dragleave", () => handleDragLeave(column));
  column.addEventListener("drop", (event) => handleDrop(event, column));
}

function handleDragOver(event, column) {
  event.preventDefault();
  column.classList.add("is-drag-over");
}

function handleDragLeave(column) {
  column.classList.remove("is-drag-over");
}

async function handleDrop(event, column) {
  event.preventDefault();
  column.classList.remove("is-drag-over");

  if (!draggedTaskId) return;

  const newStatus = column.dataset.status;
  await moveTaskToStatus(draggedTaskId, newStatus);
}

async function moveTaskToStatus(taskId, newStatus) {
  if (!taskId || !newStatus) return;
  const task = boardTasks.find((task) => task.id === taskId);
  if (!task || task.status === newStatus) return;
  try {
    await persistTaskStatus(taskId, task, newStatus);
  } catch (error) {
    console.error("Fehler beim Verschieben des Tasks:", error);
  }
}

async function persistTaskStatus(taskId, task, newStatus) {
  await patchData(`tasks/${taskId}`, { status: newStatus });
  task.status = newStatus;
  updateFilteredTasks();
  renderBoardTasks();
}

initBoard();

function initTaskCardClicks() {
  document.querySelectorAll(".card[data-task-id]").forEach((card) => {
    card.addEventListener("click", () => {
      if (isDraggingTask) return;

      openTaskDetailOverlay(card.dataset.taskId);
    });
  });
}

function openTaskDetailOverlay(taskId) {
  const task = findTaskById(taskId);
  if (!task) return;

  const elements = getTaskDetailOverlayElements();
  if (!elements) return;

  renderTaskDetailOverlay(task, elements.formContainer);
  initTaskDetailOverlayEvents(task, elements.overlay);
  showTaskDetailOverlay(elements.overlay);
}

function findTaskById(taskId) {
  return boardTasks.find((task) => task.id === taskId);
}

function getTaskDetailOverlayElements() {
  const overlay = document.getElementById("cardOverlay");
  const formContainer = document.getElementById("cardFormContainer");

  if (!overlay || !formContainer) return null;

  return { overlay, formContainer };
}

function renderTaskDetailOverlay(task, formContainer) {
  formContainer.innerHTML = getTaskDetailOverlayTemplate(task);
  initDetailSubtaskCheckboxes(task);
}

function initTaskDetailOverlayEvents(task, overlay) {
  initCloseTaskDetailEvent();
  initDeleteTaskEvent(task);
  initEditTaskEvent(task);
  overlay.addEventListener("click", closeTaskOverlayOnBackgroundClick);
}

function initCloseTaskDetailEvent() {
  document
    .getElementById("closeTaskDetailOverlayBtn")
    .addEventListener("click", closeTaskDetailOverlay);
}

function initDeleteTaskEvent(task) {
  document.getElementById("deleteTaskBtn").addEventListener("click", () => {
    deleteTask(task.id);
  });
}

function initEditTaskEvent(task) {
  document.getElementById("editTaskBtn").addEventListener("click", () => {
    openEditTaskOverlay(task.id);
  });
}

function showTaskDetailOverlay(overlay) {
  overlay.style.display = "flex";
  document.body.style.overflow = "hidden";
}

function initDetailSubtaskCheckboxes(task) {
  document.querySelectorAll(".detailSubtaskCheckbox").forEach((checkbox) => {
    checkbox.addEventListener("change", () => updateDetailSubtask(task, checkbox));
  });
}

async function updateDetailSubtask(task, checkbox) {
  const subtaskIndex = Number(checkbox.dataset.index);
  if (!task.subtasks || !task.subtasks[subtaskIndex]) return;
  task.subtasks[subtaskIndex].done = checkbox.checked;
  try {
    await patchData(`tasks/${task.id}`, { subtasks: task.subtasks });
    updateFilteredTasks();
  } catch (error) {
    console.error("Fehler beim Aktualisieren des Subtasks:", error);
  }
}

function closeTaskDetailOverlay() {
  const overlay = document.getElementById("cardOverlay");
  const formContainer = document.getElementById("cardFormContainer");
  if (!overlay || !formContainer) return;
  resetTaskDetailOverlay(overlay, formContainer);
  updateFilteredTasks();
  renderBoardTasks();
}

function resetTaskDetailOverlay(overlay, formContainer) {
  overlay.style.display = "none";
  document.body.style.overflow = "auto";
  formContainer.innerHTML = "";
  formContainer.classList.remove("edit-mode");
  overlay.removeEventListener("click", closeTaskOverlayOnBackgroundClick);
}

function closeTaskOverlayOnBackgroundClick(event) {
  if (event.target.id === "cardOverlay") {
    closeTaskDetailOverlay();
  }
}

function getTaskDetailOverlayTemplate(task) {
  const assignedContacts = enrichAssignedContacts(task.assignedTo || []);
  const subtasks = task.subtasks || [];
  return `
    <div id="openTaskOverlay" class="task-card">
      ${getTaskDetailHeaderTemplate(task)}
      <h3 class="task-title">${task.title || ""}</h3>
      <p class="task-description">${task.description || ""}</p>
      ${getTaskMetaTemplate(task)}
      ${getTaskAssignedTemplate(assignedContacts)}
      ${getTaskSubtasksTemplate(subtasks)}
      ${getTaskActionsTemplate()}
    </div>`;
}

function getTaskDetailHeaderTemplate(task) {
  return `<div class="task-card-header">
    <span class="task-tag ${getOverlayCategoryClass(task.category)}">
      ${task.category || "Task"}
    </span>
    <button class="task-close-btn" id="closeTaskDetailOverlayBtn">&times;</button>
  </div>`;
}

function getTaskMetaTemplate(task) {
  return `<div class="task-meta">
    <div class="task-meta-item"><span class="task-meta-label">Due date:</span>
      <span class="task-meta-value">${task.dueDate || ""}</span></div>
    <div class="task-meta-item"><span class="task-meta-label">Priority:</span>
      <span class="task-meta-value">${getPriorityText(task.priority)}
        <span class="priority-indicator ${task.priority || "medium"}"></span>
      </span></div>
  </div>`;
}

function getTaskAssignedTemplate(assignedContacts) {
  return `<div class="task-assigned">
    <div class="task-assigned-label">Assigned To:</div>
    <div class="task-assigned-list">
      ${getAssignedOverlayTemplate(assignedContacts)}
    </div>
  </div>`;
}

function getTaskSubtasksTemplate(subtasks) {
  return `<div class="task-subtasks">
    <div class="task-subtasks-label">Subtasks</div>
    <div class="task-subtasks-list">
      ${getSubtasksOverlayTemplate(subtasks)}
    </div>
  </div>`;
}

function getTaskActionsTemplate() {
  return `<div class="task-actions">
    <button class="task-action-btn delete-btn" id="deleteTaskBtn" type="button">
      <img src="./assets/img/delete-contact.svg" alt="delete image"> Delete
    </button>
    <button class="task-action-btn edit-btn" id="editTaskBtn" type="button">
      <img src="./assets/img/edit-contact.svg" alt="edit image"> Edit
    </button>
  </div>`;
}

function getOverlayCategoryClass(category) {
  if (category === "Technical Task") {
    return "technical-task";
  }

  if (category === "User Story") {
    return "user-story";
  }

  return "user-story";
}

function getPriorityText(priority) {
  const labels = { urgent: "Urgent", medium: "Medium", low: "Low" };
  return labels[priority] || labels.medium;
}

function getAssignedOverlayTemplate(assignedContacts) {
  if (!assignedContacts.length) {
    return `<span class="assigned-name">No contacts assigned</span>`;
  }
  return assignedContacts.map(getAssignedPersonTemplate).join("");
}

function getAssignedPersonTemplate(contact) {
  return `<div class="assigned-person">
    <div class="assigned-avatar" style="background:${contact.color || "#2a3647"}">
      ${contact.initials || getInitials(contact.name)}
    </div>
    <span class="assigned-name">${contact.name || ""}</span>
  </div>`;
}

function getSubtasksOverlayTemplate(subtasks) {
  if (!subtasks.length) return `<span class="subtask-text">No subtasks</span>`;
  return subtasks.map(getOverlaySubtaskTemplate).join("");
}

function getOverlaySubtaskTemplate(subtask, index) {
  return `<label class="subtask-item">
    <input type="checkbox" class="detailSubtaskCheckbox"
      data-index="${index}" ${subtask.done ? "checked" : ""}>
    <span class="subtask-text">${subtask.title || ""}</span>
  </label>`;
}

async function deleteTask(taskId) {
  const shouldDelete = confirm("Do you really want to delete this task?");
  if (!shouldDelete) return;
  try {
    await deleteData(`tasks/${taskId}`);
    removeDeletedTask(taskId);
  } catch (error) {
    console.error("Fehler beim Löschen des Tasks:", error);
  }
}

function removeDeletedTask(taskId) {
  boardTasks = boardTasks.filter((task) => task.id !== taskId);
  updateFilteredTasks();
  closeTaskDetailOverlay();
  renderBoardTasks();
}

function openEditTaskOverlay(taskId) {
  const task = boardTasks.find((task) => task.id === taskId);

  if (!task) return;

  const formContainer = document.getElementById("cardFormContainer");

  formContainer.classList.add("edit-mode");
  formContainer.innerHTML = getEditTaskTemplate(task);

  initEditTaskForm(task, getBoardEditContext());
}

function getBoardEditContext() {
  return {
    contacts,
    enrichAssignedContacts,
    closeTaskDetailOverlay,
    updateTaskInBoardTasks,
    updateFilteredTasks,
    renderBoardTasks,
    getAvatarColor,
    getInitials,
  };
}

function updateTaskInBoardTasks(taskId, updatedTask) {
  boardTasks = boardTasks.map((task) => {
    return task.id === taskId ? { ...task, ...updatedTask } : task;
  });
}
