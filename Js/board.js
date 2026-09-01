import { loadData, patchData, deleteData } from "./storage.js";

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

  initEditTaskForm(task);
}

function initEditTaskForm(task) {
  const state = createEditFormState(task);
  initEditFormControls(state);
  initEditValidationEvents();
  bindEditFormSubmit(task.id, state);
}

function createEditFormState(task) {
  return {
    priority: task.priority || "medium",
    contacts: enrichAssignedContacts(task.assignedTo || []),
    subtasks: [...(task.subtasks || [])],
  };
}

function initEditFormControls(state) {
  document.getElementById("closeEditTaskOverlayBtn")
    .addEventListener("click", closeTaskDetailOverlay);
  initEditPriorityButtons((priority) => {
    state.priority = priority;
  });
  initEditAssignedContacts(state.contacts, (contacts) => {
    state.contacts = contacts;
  });
  initEditSubtasks(state.subtasks, (subtasks) => {
    state.subtasks = subtasks;
  });
}

function bindEditFormSubmit(taskId, state) {
  document.getElementById("editTaskForm").addEventListener("submit", (event) => {
    event.preventDefault();
    saveEditedTask(taskId, state.priority, state.contacts, state.subtasks);
  });
}

function initEditValidationEvents() {
  const elements = getEditValidationElements();
  elements.date.min = getTodayISO();
  bindEditValidation(elements.title, elements.titleError, validateEditTaskTitle);
  bindEditValidation(elements.date, elements.dateError, validateEditTaskDate);
  bindEditCategoryValidation(elements.category, elements.categoryError);
}

function getEditValidationElements() {
  return {
    title: document.getElementById("editTaskTitle"),
    titleError: document.getElementById("editTaskTitleError"),
    date: document.getElementById("editTaskDate"),
    dateError: document.getElementById("editTaskDateError"),
    category: document.getElementById("editTaskCategory"),
    categoryError: document.getElementById("editTaskCategoryError"),
  };
}

function bindEditValidation(input, error, validate) {
  input.addEventListener("input", () => clearEditInputError(input, error));
  input.addEventListener("blur", validate);
}

function bindEditCategoryValidation(input, error) {
  input.addEventListener("change", () => {
    clearEditInputError(input, error);
    validateEditTaskCategory();
  });
  input.addEventListener("blur", validateEditTaskCategory);
}

async function saveEditedTask(taskId, priority, selectedContacts, subtasks) {
  if (!isEditTaskFormValid()) return;
  const updatedTask = getEditedTaskData(priority, selectedContacts, subtasks);
  try {
    await patchData(`tasks/${taskId}`, updatedTask);
    finishEditTaskSave(taskId, updatedTask);
  } catch (error) {
    console.error("Fehler beim Aktualisieren des Tasks:", error);
  }
}

function getEditedTaskData(priority, assignedTo, subtasks) {
  const date = document.getElementById("editTaskDate").value;
  return {
    title: document.getElementById("editTaskTitle").value.trim(),
    description: document.getElementById("editTaskDescription").value.trim(),
    dueDate: formatDateForDisplay(date), dueDateISO: date,
    category: document.getElementById("editTaskCategory").value,
    priority, assignedTo, subtasks,
  };
}

function finishEditTaskSave(taskId, updatedTask) {
  updateTaskInBoardTasks(taskId, updatedTask);
  updateFilteredTasks();
  closeTaskDetailOverlay();
  renderBoardTasks();
}

function isEditTaskFormValid() {
  clearEditErrors();

  return (
    validateEditTaskTitle() &&
    validateEditTaskDate() &&
    validateEditTaskCategory()
  );
}

function validateEditTaskTitle() {
  const input = document.getElementById("editTaskTitle");
  const error = document.getElementById("editTaskTitleError");

  if (input.value.trim()) {
    clearEditInputError(input, error);
    return true;
  }

  setEditInputError(input, error, "This field is required");
  return false;
}

function validateEditTaskCategory() {
  const editTaskCategory = document.getElementById("editTaskCategory");
  const editTaskCategoryError = document.getElementById("editTaskCategoryError");

  if (editTaskCategory.value) return true;

  setEditInputError(
    editTaskCategory,
    editTaskCategoryError,
    "This field is required",
  );
  return false;
}

function validateEditTaskDate() {
  const editTaskDate = document.getElementById("editTaskDate");
  const editTaskDateError = document.getElementById("editTaskDateError");
  const dateValue = editTaskDate.value.trim();
  if (!dateValue) return rejectEditDate(editTaskDate, editTaskDateError,
    "This field is required");
  if (!isValidEditDateFormat(dateValue)) {
    return rejectEditDate(editTaskDate, editTaskDateError,
      "Please enter a valid date");
  }
  return validateEditDateIsNotPast(editTaskDate, editTaskDateError, dateValue);
}

function rejectEditDate(input, error, message) {
  setEditInputError(input, error, message);
  return false;
}

function setEditInputError(input, errorElement, message) {
  input.classList.remove("inputFocus");
  input.classList.add("inputError");

  if (errorElement) {
    errorElement.textContent = message;
  }
}

function clearEditInputError(input, errorElement) {
  input.classList.remove("inputError");

  if (errorElement) {
    errorElement.textContent = "";
  }
}

function clearEditErrors() {
  const fieldIds = [
    ["editTaskTitle", "editTaskTitleError"],
    ["editTaskDate", "editTaskDateError"],
    ["editTaskCategory", "editTaskCategoryError"],
  ];
  fieldIds.forEach(([inputId, errorId]) => {
    clearEditInputError(document.getElementById(inputId),
      document.getElementById(errorId));
  });
}

function updateTaskInBoardTasks(taskId, updatedTask) {
  boardTasks = boardTasks.map((task) => {
    if (task.id === taskId) {
      return {
        ...task,
        ...updatedTask,
      };
    }

    return task;
  });
}

function convertDateToISO(dateValue) {
  if (!dateValue.includes("/")) {
    return dateValue;
  }

  const [day, month, year] = dateValue.split("/");
  return `${year}-${month}-${day}`;
}

function getTodayISO() {
  const today = new Date();
  const timezoneOffset = today.getTimezoneOffset() * 60000;
  const localDate = new Date(today.getTime() - timezoneOffset);

  return localDate.toISOString().split("T")[0];
}

function formatDateForDisplay(dateValue) {
  if (!dateValue || !dateValue.includes("-")) return dateValue || "";

  const [year, month, day] = dateValue.split("-");
  return `${day}/${month}/${year}`;
}

function isValidEditDateFormat(dateValue) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) return false;

  const [year, month, day] = dateValue.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function validateEditDateIsNotPast(input, errorElement, dateValue) {
  if (dateValue < getTodayISO()) {
    setEditInputError(
      input,
      errorElement,
      "The due date cannot be in the past",
    );
    return false;
  }

  clearEditInputError(input, errorElement);
  return true;
}

function initEditPriorityButtons(onChange) {
  document.querySelectorAll(".editPriorityBtn").forEach((button) => {
    button.addEventListener("click", () => selectEditPriority(button, onChange));
  });
}

function selectEditPriority(button, onChange) {
  clearEditPriorityButtons();
  const priority = button.dataset.priority;
  const activeClasses = {
    urgent: "activeUrgent", medium: "activeMedium", low: "activeLow",
  };
  if (activeClasses[priority]) button.classList.add(activeClasses[priority]);
  onChange(priority);
}

function clearEditPriorityButtons() {
  document.querySelectorAll(".editPriorityBtn").forEach((button) => {
    button.classList.remove("activeUrgent", "activeMedium", "activeLow");
  });
}

function initEditAssignedContacts(selectedEditContacts, onChange) {
  const elements = getEditAssignedElements();
  if (!elements) return;

  renderEditAssignedContacts(selectedEditContacts);
  initEditAssignedInputEvents(elements, selectedEditContacts, onChange);
  initEditAssignedDocumentClick(elements.editAssignedList);
}

function getEditAssignedElements() {
  const editAssignedInput = document.getElementById("editAssignedInput");
  const editAssignedList = document.getElementById("editAssignedList");

  if (!editAssignedInput || !editAssignedList) return null;

  return { editAssignedInput, editAssignedList };
}

function initEditAssignedInputEvents(elements, selectedEditContacts, onChange) {
  elements.editAssignedInput.addEventListener("focus", () => {
    showEditAssignedList(elements.editAssignedList);
    renderEditContactOptions(selectedEditContacts, onChange);
  });

  elements.editAssignedInput.addEventListener("input", () => {
    renderEditContactOptions(selectedEditContacts, onChange);
  });
}

function showEditAssignedList(editAssignedList) {
  editAssignedList.classList.remove("d_none");
}

function initEditAssignedDocumentClick(editAssignedList) {
  document.addEventListener("click", (event) => {
    closeEditAssignedListOnOutsideClick(event, editAssignedList);
    closeEditMoreContactsOnOutsideClick(event);
  });
}

function closeEditAssignedListOnOutsideClick(event, editAssignedList) {
  const clickedInsideDropdown = event.target.closest("#editAssignedDropdown");

  if (!clickedInsideDropdown) {
    editAssignedList.classList.add("d_none");
  }
}

function closeEditMoreContactsOnOutsideClick(event) {
  const clickedInsideSelected = event.target.closest(".selectedContactsWrapper");

  if (clickedInsideSelected) return;

  const dropdown = document.getElementById("editMoreContactsDropdown");
  if (dropdown) dropdown.classList.add("d_none");
}



function renderEditContactOptions(selectedEditContacts, onChange) {
  const input = document.getElementById("editAssignedInput");
  const list = document.getElementById("editAssignedList");
  const searchText = input.value.trim().toLowerCase();
  const filtered = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchText));
  list.innerHTML = filtered.map((contact, index) =>
    getEditContactOptionTemplate(contact, index, selectedEditContacts)).join("");
  initEditContactOptionEvents(selectedEditContacts, onChange);
}

function getEditContactOptionTemplate(contact, index, selectedContacts) {
  const isSelected = selectedContacts.some(item => item.id === contact.id);
  const color = contact.color || getAvatarColor(index);
  return `<div class="contactOption ${isSelected ? "selectedContactOption" : ""}"
    data-contact-id="${contact.id}">
    <div class="contactAvatar" style="background:${color}">
      ${contact.initials || getInitials(contact.name)}
    </div>
    <span>${contact.name}</span>
    <input class="contactCheckbox" type="checkbox" ${isSelected ? "checked" : ""}>
  </div>`;
}

function initEditContactOptionEvents(selectedContacts, onChange) {
  document.querySelectorAll("#editAssignedList .contactOption").forEach(option => {
    option.addEventListener("click", event => {
      handleEditContactOption(event, option, selectedContacts, onChange);
    });
  });
}

function handleEditContactOption(event, option, selectedContacts, onChange) {
  event.stopPropagation();
  const updatedContacts = toggleEditContact(option.dataset.contactId, selectedContacts);
  if (!updatedContacts) return;
  document.getElementById("editAssignedInput").value = "";
  renderEditAssignedContacts(updatedContacts);
  renderEditContactOptions(updatedContacts, onChange);
  onChange(updatedContacts);
}

function toggleEditContact(contactId, selectedContacts) {
  const contact = contacts.find(item => item.id === contactId);
  if (!contact) return null;
  const isSelected = selectedContacts.some(item => item.id === contactId);
  return isSelected
    ? selectedContacts.filter(item => item.id !== contactId)
    : [...selectedContacts, contact];
}

function initEditSubtasks(editSubtasks, onChange) {
  const state = createEditSubtaskState(editSubtasks, onChange);
  renderEditSubtaskState(state);
  bindEditSubtaskStateEvents(state);
}

function createEditSubtaskState(editSubtasks, onChange) {
  return {
    subtasks: editSubtasks, onChange, editingIndex: null,
    input: document.getElementById("editSubtaskInput"),
    addButton: document.getElementById("editAddSubtaskBtn"),
    clearButton: document.getElementById("editClearSubtaskBtn"),
  };
}

function renderEditSubtaskState(state) {
  const setEditing = index => state.editingIndex = index;
  renderEditSubtasks(state.subtasks, state.onChange, setEditing);
}

function bindEditSubtaskStateEvents(state) {
  state.input.addEventListener("keydown", event => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    saveEditSubtaskState(state);
  });
  state.addButton.addEventListener("click", () => saveEditSubtaskState(state));
  state.clearButton.addEventListener("click", () => resetEditSubtaskState(state));
}

function saveEditSubtaskState(state) {
  state.editingIndex = addOrUpdateEditSubtask(state.subtasks, state.editingIndex);
  renderEditSubtaskState(state);
  state.onChange(state.subtasks);
}

function resetEditSubtaskState(state) {
  state.input.value = "";
  state.editingIndex = null;
  state.input.focus();
}

function addOrUpdateEditSubtask(editSubtasks, editingIndex) {
  const editSubtaskInput = document.getElementById("editSubtaskInput");
  const subtaskText = editSubtaskInput.value.trim();
  if (!subtaskText) return editingIndex;
  if (editingIndex === null) {
    editSubtasks.push({ title: subtaskText, done: false });
  } else {
    editSubtasks[editingIndex].title = subtaskText;
  }
  editSubtaskInput.value = "";
  return null;
}

function addEditSubtask(editSubtasks, onChange) {
  const editSubtaskInput = document.getElementById("editSubtaskInput");
  const subtaskText = editSubtaskInput.value.trim();
  if (!subtaskText) return;
  editSubtasks.push({ title: subtaskText, done: false });
  editSubtaskInput.value = "";
  renderEditSubtasks(editSubtasks, onChange);
  onChange(editSubtasks);
}

function renderEditSubtasks(editSubtasks, onChange, onEdit) {
  const editSubtaskList = document.getElementById("editSubtaskList");
  editSubtaskList.innerHTML = editSubtasks.map(getEditSubtaskItemTemplate).join("");
  initEditSubtaskButtons(editSubtasks, onChange, onEdit);
}

function getEditSubtaskItemTemplate(subtask, index) {
  return `<li class="subtaskItem editSubtaskItem">
    <span class="subtaskText">• ${subtask.title}</span>
    <div class="subtaskItemActions">
      <button type="button" class="editSubtaskBtn" data-index="${index}">
        <img src="./assets/img/Subtasks change.svg" alt="Edit subtask"></button>
      <button type="button" class="deleteSubtaskBtn" data-index="${index}">
        <img src="./assets/img/SubTask delete.svg" alt="Delete subtask"></button>
    </div>
  </li>`;
}

function initEditSubtaskButtons(editSubtasks, onChange, onEdit) {
  initEditSubtaskDeleteButtons(editSubtasks, onChange, onEdit);
  initEditSubtaskEditButtons(editSubtasks, onEdit);
}

function initEditSubtaskDeleteButtons(editSubtasks, onChange, onEdit) {
  document
    .querySelectorAll("#editSubtaskList .deleteSubtaskBtn")
    .forEach((button) => {
      button.addEventListener("click", () => {
        const index = Number(button.dataset.index);

        editSubtasks.splice(index, 1);
        renderEditSubtasks(editSubtasks, onChange, onEdit);
        onChange(editSubtasks);
      });
    });
}

function initEditSubtaskEditButtons(editSubtasks, onEdit) {
  document.querySelectorAll("#editSubtaskList .editSubtaskBtn")
    .forEach(button => {
      button.addEventListener("click", () => editSelectedSubtask(button,
        editSubtasks, onEdit));
    });
}

function editSelectedSubtask(button, editSubtasks, onEdit) {
  const index = Number(button.dataset.index);
  const input = document.getElementById("editSubtaskInput");
  input.value = editSubtasks[index].title;
  input.focus();
  onEdit(index);
}

function renderEditAssignedContacts(selectedEditContacts) {
  const elements = getEditAssignedContactElements();
  if (!elements) return;

  resetEditAssignedContacts(elements);
  renderVisibleEditContacts(selectedEditContacts, elements.editSelectedContacts);
  renderHiddenEditContacts(selectedEditContacts, elements);
}

function getEditAssignedContactElements() {
  const editSelectedContacts = document.getElementById("editSelectedContacts");
  const editMoreContactsDropdown = document.getElementById(
    "editMoreContactsDropdown",
  );

  if (!editSelectedContacts || !editMoreContactsDropdown) return null;

  return { editSelectedContacts, editMoreContactsDropdown };
}

function resetEditAssignedContacts(elements) {
  elements.editSelectedContacts.innerHTML = "";
  elements.editMoreContactsDropdown.innerHTML = "";
  elements.editMoreContactsDropdown.classList.add("d_none");
}

function renderVisibleEditContacts(selectedEditContacts, editSelectedContacts) {
  const visibleContacts = selectedEditContacts.slice(0, 3);

  visibleContacts.forEach((contact, index) => {
    editSelectedContacts.innerHTML += getVisibleEditContactTemplate(
      contact,
      index,
    );
  });
}

function getVisibleEditContactTemplate(contact, index) {
  const color = contact.color || getAvatarColor(index);
  const name = contact.name || "";
  const initials = contact.initials || getInitials(contact.name);

  return `
    <div class="selectedAvatar" style="background:${color}" title="${name}">
      ${initials}
    </div>
  `;
}

function renderHiddenEditContacts(selectedEditContacts, elements) {
  const hiddenContacts = selectedEditContacts.slice(3);

  if (hiddenContacts.length === 0) return;

  renderEditMoreContactsButton(hiddenContacts, elements.editSelectedContacts);
  renderEditMoreContactsDropdown(
    hiddenContacts,
    elements.editMoreContactsDropdown,
  );
  initEditMoreContactsButton(elements.editMoreContactsDropdown);
}

function renderEditMoreContactsButton(hiddenContacts, editSelectedContacts) {
  editSelectedContacts.innerHTML += `
    <button type="button" class="moreContactsBtn" id="editMoreContactsBtn">
      +${hiddenContacts.length}
    </button>
  `;
}

function renderEditMoreContactsDropdown(hiddenContacts, dropdown) {
  hiddenContacts.forEach((contact) => {
    dropdown.innerHTML += getEditMoreContactTemplate(contact);
  });
}

function getEditMoreContactTemplate(contact) {
  const color = contact.color || "#2a3647";
  const initials = contact.initials || getInitials(contact.name);
  const name = contact.name || "";

  return `
    <div class="moreContactItem">
      <div class="selectedAvatar" style="background:${color}">
        ${initials}
      </div>
      <span>${name}</span>
    </div>
  `;
}

function initEditMoreContactsButton(editMoreContactsDropdown) {
  const editMoreContactsBtn = document.getElementById("editMoreContactsBtn");

  if (!editMoreContactsBtn) return;

  editMoreContactsBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    editMoreContactsDropdown.classList.toggle("d_none");
  });
}
