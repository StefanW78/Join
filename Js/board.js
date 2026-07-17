import { loadData, patchData, deleteData } from "./storage.js";

let boardTasks = [];
let contacts = [];
let filteredTasks = [];

async function initBoard() {
  try {
    const tasksObject = await loadData("tasks");
    const usersObject = await loadData("users");

    contacts = Object.entries(usersObject).map(([id, user], index) => {
      return {
        id,
        name: user.name,
        email: user.email,
        initials: user.initials,
        color: user.color || getAvatarColor(index),
      };
    });

    boardTasks = Object.entries(tasksObject).map(([id, task]) => {
      return {
        id,
        ...task,
      };
    });

    filteredTasks = boardTasks;

    initBoardSearch();
    renderBoardTasks();
  } catch (error) {
    console.error("Fehler beim Laden der Board-Daten:", error);
  }
}



function renderBoardTasks() {
  clearBoardColumns();

  filteredTasks.forEach((task) => {
    const targetColumn = getTargetColumn(task.status);

    if (!targetColumn) return;

    targetColumn.innerHTML += getTaskCardTemplate(task);
  });

  renderEmptyMessages();
  initTaskCardClicks();
  initDragAndDrop();
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
    <div class="card" draggable="true" data-task-id="${task.id}">
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
          ${getAssignedAvatarsTemplate(enrichAssignedContacts(task.assignedTo || []))}
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

function getSubtaskProgressTemplate(
  completedSubtasks,
  totalSubtasks,
  progress,
) {
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
  return assignedContacts.map((assignedContact) => {
    const contactFromUsers = contacts.find((contact) => {
      return (
        contact.id === assignedContact.id ||
        contact.email === assignedContact.email ||
        contact.name === assignedContact.name
      );
    });

    if (!contactFromUsers) {
      return assignedContact;
    }

    return {
      ...assignedContact,
      id: contactFromUsers.id,
      name: contactFromUsers.name,
      email: contactFromUsers.email,
      initials: contactFromUsers.initials || getInitials(contactFromUsers.name),
      color: contactFromUsers.color,
    };
  });
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

let draggedTaskId = null;
let isDraggingTask = false;

function initDragAndDrop() {
  initDraggableCards();
  initDropColumns();
}

function initDraggableCards() {
  document.querySelectorAll(".card[data-task-id]").forEach((card) => {
    card.addEventListener("dragstart", () => {
      draggedTaskId = card.dataset.taskId;
      isDraggingTask = true;
      card.classList.add("is-dragging");
    });

    card.addEventListener("dragend", () => {
      card.classList.remove("is-dragging");

      setTimeout(() => {
        draggedTaskId = null;
        isDraggingTask = false;
      }, 0);
    });
  });
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

  if (!task) return;

  if (task.status === newStatus) return;

  try {
    await patchData(`tasks/${taskId}`, {
      status: newStatus,
    });

    task.status = newStatus;
    updateFilteredTasks();
    renderBoardTasks();
  } catch (error) {
    console.error("Fehler beim Verschieben des Tasks:", error);
  }
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
    checkbox.addEventListener("change", async () => {
      const subtaskIndex = Number(checkbox.dataset.index);

      if (!task.subtasks || !task.subtasks[subtaskIndex]) return;

      task.subtasks[subtaskIndex].done = checkbox.checked;

      try {
        await patchData(`tasks/${task.id}`, {
          subtasks: task.subtasks,
        });

        updateFilteredTasks();
      } catch (error) {
        console.error("Fehler beim Aktualisieren des Subtasks:", error);
      }
    });
  });
}

function closeTaskDetailOverlay() {
  const overlay = document.getElementById("cardOverlay");
  const formContainer = document.getElementById("cardFormContainer");

  if (!overlay || !formContainer) return;

  overlay.style.display = "none";
  document.body.style.overflow = "auto";
  formContainer.innerHTML = "";
  formContainer.classList.remove("edit-mode");

  overlay.removeEventListener("click", closeTaskOverlayOnBackgroundClick);

  updateFilteredTasks();
  renderBoardTasks();
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
      <div class="task-card-header">
        <span class="task-tag ${getOverlayCategoryClass(task.category)}">
          ${task.category || "Task"}
        </span>

        <button class="task-close-btn" id="closeTaskDetailOverlayBtn">
          &times;
        </button>
      </div>

      <h3 class="task-title">${task.title || ""}</h3>

      <p class="task-description">
        ${task.description || ""}
      </p>

      <div class="task-meta">
        <div class="task-meta-item">
          <span class="task-meta-label">Due date:</span>
          <span class="task-meta-value">${task.dueDate || ""}</span>
        </div>

        <div class="task-meta-item">
          <span class="task-meta-label">Priority:</span>
          <span class="task-meta-value">
            ${getPriorityText(task.priority)}
            <span class="priority-indicator ${task.priority || "medium"}"></span>
          </span>
        </div>
      </div>

      <div class="task-assigned">
        <div class="task-assigned-label">Assigned To:</div>

        <div class="task-assigned-list">
          ${getAssignedOverlayTemplate(assignedContacts)}
        </div>
      </div>

      <div class="task-subtasks">
        <div class="task-subtasks-label">Subtasks</div>

        <div class="task-subtasks-list">
          ${getSubtasksOverlayTemplate(subtasks)}
        </div>
      </div>

      <div class="task-actions">
        <button class="task-action-btn delete-btn" id="deleteTaskBtn" type="button">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 4h10M5.5 4V2.5A1.5 1.5 0 0 1 7 1h2a1.5 1.5 0 0 1 1.5 1.5V4m1.5 0v9a1.5 1.5 0 0 1-1.5 1.5h-5A1.5 1.5 0 0 1 4 13V4h8Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Delete
        </button>

        <button class="task-action-btn edit-btn" id="editTaskBtn" type="button">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M11.333 2A1.886 1.886 0 0 1 14 4.667l-9 9-3.667 1 1-3.667 9-9Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Edit
        </button>
      </div>
    </div>
  `;
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
  if (priority === "urgent") {
    return "Urgent";
  }

  if (priority === "medium") {
    return "Medium";
  }

  if (priority === "low") {
    return "Low";
  }

  return "Medium";
}

function getAssignedOverlayTemplate(assignedContacts) {
  if (assignedContacts.length === 0) {
    return `<span class="assigned-name">No contacts assigned</span>`;
  }

  return assignedContacts
    .map((contact) => {
      return `
        <div class="assigned-person">
          <div class="assigned-avatar" style="background:${contact.color || "#2a3647"}">
            ${contact.initials || getInitials(contact.name)}
          </div>
          <span class="assigned-name">${contact.name || ""}</span>
        </div>
      `;
    })
    .join("");
}

function getSubtasksOverlayTemplate(subtasks) {
  if (subtasks.length === 0) {
    return `<span class="subtask-text">No subtasks</span>`;
  }

  return subtasks
    .map((subtask, index) => {
      return `
        <label class="subtask-item">
          <input
            type="checkbox"
            class="detailSubtaskCheckbox"
            data-index="${index}"
            ${subtask.done ? "checked" : ""}
          >
          <span class="subtask-text">${subtask.title || ""}</span>
        </label>
      `;
    })
    .join("");
}

async function deleteTask(taskId) {
  const shouldDelete = confirm("Do you really want to delete this task?");

  if (!shouldDelete) return;

  try {
    await deleteData(`tasks/${taskId}`);

    boardTasks = boardTasks.filter((task) => task.id !== taskId);

    updateFilteredTasks();
    closeTaskDetailOverlay();
    renderBoardTasks();
  } catch (error) {
    console.error("Fehler beim Löschen des Tasks:", error);
  }
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
  let selectedEditPriority = task.priority || "medium";
  let selectedEditContacts = enrichAssignedContacts(task.assignedTo || []);
  let editSubtasks = [...(task.subtasks || [])];

  document
    .getElementById("closeEditTaskOverlayBtn")
    .addEventListener("click", closeTaskDetailOverlay);

  document.getElementById("cancelEditTaskBtn").addEventListener("click", () => {
    openTaskDetailOverlay(task.id);
  });

  initEditPriorityButtons((priority) => {
    selectedEditPriority = priority;
  });

  initEditAssignedContacts(selectedEditContacts, (updatedContacts) => {
    selectedEditContacts = updatedContacts;
  });

  initEditSubtasks(editSubtasks, (updatedSubtasks) => {
    editSubtasks = updatedSubtasks;
  });

  initEditValidationEvents();

  document
    .getElementById("editTaskForm")
    .addEventListener("submit", (event) => {
      event.preventDefault();

      saveEditedTask(
        task.id,
        selectedEditPriority,
        selectedEditContacts,
        editSubtasks,
      );
    });
}

function initEditValidationEvents() {
  const editTaskTitle = document.getElementById("editTaskTitle");
  const editTaskDate = document.getElementById("editTaskDate");
  const editTaskCategory = document.getElementById("editTaskCategory");

  editTaskTitle.addEventListener("input", () => {
    clearEditInputError(editTaskTitle, document.getElementById("editTaskTitleError"));
  });

  editTaskDate.addEventListener("input", () => {
    clearEditInputError(editTaskDate, document.getElementById("editTaskDateError"));
  });

  editTaskCategory.addEventListener("change", () => {
    clearEditInputError(
      editTaskCategory,
      document.getElementById("editTaskCategoryError"),
    );
  });
}

async function saveEditedTask(
  taskId,
  selectedPriority,
  selectedEditContacts,
  editSubtasks,
) {
  const editTaskTitle = document.getElementById("editTaskTitle");
  const editTaskDescription = document.getElementById("editTaskDescription");
  const editTaskDate = document.getElementById("editTaskDate");
  const editTaskCategory = document.getElementById("editTaskCategory");

  if (!isEditTaskFormValid()) return;

  const updatedTask = {
    title: editTaskTitle.value.trim(),
    description: editTaskDescription.value.trim(),
    dueDate: editTaskDate.value.trim(),
    dueDateISO: convertDateToISO(editTaskDate.value.trim()),
    category: editTaskCategory.value,
    priority: selectedPriority,
    assignedTo: selectedEditContacts,
    subtasks: editSubtasks,
  };

  if (!updatedTask.title) {
    editTaskTitle.classList.add("inputError");
    return;
  }

  try {
    await patchData(`tasks/${taskId}`, updatedTask);

    updateTaskInBoardTasks(taskId, updatedTask);

    updateFilteredTasks();
    closeTaskDetailOverlay();
    renderBoardTasks();
  } catch (error) {
    console.error("Fehler beim Aktualisieren des Tasks:", error);
  }
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
  const editTaskTitle = document.getElementById("editTaskTitle");
  const editTaskTitleError = document.getElementById("editTaskTitleError");

  if (editTaskTitle.value.trim()) return true;

  setEditInputError(editTaskTitle, editTaskTitleError, "This field is required");
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

  if (!dateValue) {
    setEditInputError(editTaskDate, editTaskDateError, "This field is required");
    return false;
  }

  if (!isValidEditDateFormat(dateValue)) {
    setEditInputError(
      editTaskDate,
      editTaskDateError,
      "Please use the format dd/mm/yyyy",
    );
    return false;
  }

  return validateEditDateIsNotPast(editTaskDate, editTaskDateError, dateValue);
}

function validateEditDateIsNotPast(input, errorElement, dateValue) {
  const selectedDate = parseEditDateFromInput(dateValue);
  const today = new Date();

  today.setHours(0, 0, 0, 0);
  selectedDate.setHours(0, 0, 0, 0);

  if (selectedDate >= today) return true;

  setEditInputError(input, errorElement, "The due date cannot be in the past.");
  return false;
}

function isValidEditDateFormat(dateValue) {
  if (dateValue.includes("/")) {
    return isValidSlashDate(dateValue);
  }

  return isValidIsoDate(dateValue);
}

function isValidSlashDate(dateValue) {
  const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;

  if (!dateRegex.test(dateValue)) return false;

  const selectedDate = parseEditDateFromInput(dateValue);
  const [day, month, year] = dateValue.split("/").map(Number);

  return isRealDate(selectedDate, day, month, year);
}

function isValidIsoDate(dateValue) {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

  if (!dateRegex.test(dateValue)) return false;

  const selectedDate = parseEditDateFromInput(dateValue);
  const [year, month, day] = dateValue.split("-").map(Number);

  return isRealDate(selectedDate, day, month, year);
}

function parseEditDateFromInput(dateValue) {
  if (dateValue.includes("/")) {
    const [day, month, year] = dateValue.split("/");
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  const [year, month, day] = dateValue.split("-");
  return new Date(Number(year), Number(month) - 1, Number(day));
}

function isRealDate(date, day, month, year) {
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
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
  clearEditInputError(
    document.getElementById("editTaskTitle"),
    document.getElementById("editTaskTitleError"),
  );

  clearEditInputError(
    document.getElementById("editTaskDate"),
    document.getElementById("editTaskDateError"),
  );

  clearEditInputError(
    document.getElementById("editTaskCategory"),
    document.getElementById("editTaskCategoryError"),
  );
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

function initEditPriorityButtons(onChange) {
  document.querySelectorAll(".editPriorityBtn").forEach((button) => {
    button.addEventListener("click", () => {
      const selectedPriority = button.dataset.priority;

      document.querySelectorAll(".editPriorityBtn").forEach((btn) => {
        btn.classList.remove("activeUrgent", "activeMedium", "activeLow");
      });

      if (selectedPriority === "urgent") {
        button.classList.add("activeUrgent");
      }

      if (selectedPriority === "medium") {
        button.classList.add("activeMedium");
      }

      if (selectedPriority === "low") {
        button.classList.add("activeLow");
      }

      onChange(selectedPriority);
    });
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
  const editAssignedInput = document.getElementById("editAssignedInput");
  const editAssignedList = document.getElementById("editAssignedList");

  editAssignedList.innerHTML = "";

  const searchText = editAssignedInput.value.trim().toLowerCase();

  const filteredContacts = contacts.filter((contact) => {
    return contact.name.toLowerCase().includes(searchText);
  });

  filteredContacts.forEach((contact, index) => {
    const isSelected = selectedEditContacts.some(
      (item) => item.id === contact.id,
    );

    editAssignedList.innerHTML += `
      <div class="contactOption ${isSelected ? "selectedContactOption" : ""}" data-contact-id="${contact.id}">
        <div class="contactAvatar" style="background:${contact.color || getAvatarColor(index)}">
          ${contact.initials || getInitials(contact.name)}
        </div>

        <span>${contact.name}</span>

        <input
          class="contactCheckbox"
          type="checkbox"
          ${isSelected ? "checked" : ""}
        >
      </div>
    `;
  });

  document
    .querySelectorAll("#editAssignedList .contactOption")
    .forEach((option) => {
      option.addEventListener("click", (event) => {
        event.stopPropagation();

        const contactId = option.dataset.contactId;
        const contact = contacts.find((item) => item.id === contactId);

        if (!contact) return;

        const isSelected = selectedEditContacts.some(
          (item) => item.id === contactId,
        );

        if (isSelected) {
          selectedEditContacts = selectedEditContacts.filter(
            (item) => item.id !== contactId,
          );
        } else {
          selectedEditContacts.push(contact);
        }

        editAssignedInput.value = "";
        renderEditAssignedContacts(selectedEditContacts);
        renderEditContactOptions(selectedEditContacts, onChange);
        onChange(selectedEditContacts);
      });
    });
}

function initEditSubtasks(editSubtasks, onChange) {
  const editSubtaskInput = document.getElementById("editSubtaskInput");
  const editAddSubtaskBtn = document.getElementById("editAddSubtaskBtn");
  const editClearSubtaskBtn = document.getElementById("editClearSubtaskBtn");

  renderEditSubtasks(editSubtasks, onChange);

  editSubtaskInput.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;

    event.preventDefault();
    addEditSubtask(editSubtasks, onChange);
  });

  editAddSubtaskBtn.addEventListener("click", () => {
    addEditSubtask(editSubtasks, onChange);
  });

  editClearSubtaskBtn.addEventListener("click", () => {
    editSubtaskInput.value = "";
    editSubtaskInput.focus();
  });
}

function addEditSubtask(editSubtasks, onChange) {
  const editSubtaskInput = document.getElementById("editSubtaskInput");
  const subtaskText = editSubtaskInput.value.trim();

  if (!subtaskText) return;

  editSubtasks.push({
    title: subtaskText,
    done: false,
  });

  editSubtaskInput.value = "";

  renderEditSubtasks(editSubtasks, onChange);
  onChange(editSubtasks);
}

function renderEditSubtasks(editSubtasks, onChange) {
  const editSubtaskList = document.getElementById("editSubtaskList");

  editSubtaskList.innerHTML = "";

  editSubtasks.forEach((subtask, index) => {
    editSubtaskList.innerHTML += `
      <li class="subtaskItem editSubtaskItem">
        <span class="subtaskText">• ${subtask.title}</span>

        <div class="subtaskItemActions">
          <button type="button" class="editSubtaskBtn" data-index="${index}">
            <img src="./assets/img/Subtasks change.svg" alt="Edit subtask" />
          </button>

          <button type="button" class="deleteSubtaskBtn" data-index="${index}">
            <img src="./assets/img/SubTask delete.svg" alt="Delete subtask" />
          </button>
        </div>
      </li>
    `;
  });

  initEditSubtaskButtons(editSubtasks, onChange);
}

function initEditSubtaskButtons(editSubtasks, onChange) {
  document
    .querySelectorAll("#editSubtaskList .deleteSubtaskBtn")
    .forEach((button) => {
      button.addEventListener("click", () => {
        const index = Number(button.dataset.index);

        editSubtasks.splice(index, 1);
        renderEditSubtasks(editSubtasks, onChange);
        onChange(editSubtasks);
      });
    });

  document
    .querySelectorAll("#editSubtaskList .editSubtaskBtn")
    .forEach((button) => {
      button.addEventListener("click", () => {
        const index = Number(button.dataset.index);
        const editSubtaskInput = document.getElementById("editSubtaskInput");

        editSubtaskInput.value = editSubtasks[index].title;

        editSubtasks.splice(index, 1);
        renderEditSubtasks(editSubtasks, onChange);
        onChange(editSubtasks);

        editSubtaskInput.focus();
      });
    });
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