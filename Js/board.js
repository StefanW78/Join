import { loadData, patchData, deleteData } from "./storage.js";
import { initEditTaskForm } from "./boardEdit.js";

let boardTasks = [];
let contacts = [];
let filteredTasks = [];

/**
 * Initializes the board by loading tasks and users,
 * preparing the board data, and rendering all task cards.
 *
 * @async
 * @returns {Promise<void>} A promise that resolves when the board has been initialized.
 */
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

/**
 * Creates a contact object for use on the board.
 * Adds the database ID and provides a fallback avatar color when necessary.
 *
 * @param {[string, Object]} contactEntry - The contact ID and user data from the database.
 * @param {number} index - The contact's position in the loaded user list.
 * @returns {Object} The normalized board contact.
 */
function createBoardContact([id, user], index) {
  return { id, name: user.name, email: user.email,
    initials: user.initials, color: user.color || getAvatarColor(index) };
}

/**
 * Creates a task object for use on the board.
 * Adds the database ID to the stored task data.
 *
 * @param {[string, Object]} taskEntry - The task ID and task data from the database.
 * @returns {Object} The normalized board task.
 */
function createBoardTask([id, task]) {
  return { id, ...task };
}



/**
 * Renders all filtered tasks in their corresponding board columns.
 * Also updates empty messages, card click events, and drag-and-drop behavior.
 *
 * @returns {void}
 */
function renderBoardTasks() {
  clearBoardColumns();
  filteredTasks.forEach(renderTaskIntoColumn);
  renderEmptyMessages();
  initTaskCardClicks();
  initDragAndDrop();
}

/**
 * Renders a single task inside the column matching its current status.
 *
 * @param {Object} task - The task to render.
 * @returns {void}
 */
function renderTaskIntoColumn(task) {
  const targetColumn = getTargetColumn(task.status);
  if (targetColumn) targetColumn.innerHTML += getTaskCardTemplate(task);
}

/**
 * Initializes the board search field and updates the displayed tasks
 * whenever the search value changes.
 *
 * @returns {void}
 */
function initBoardSearch() {
  const boardSearch = document.getElementById("boardSearch");

  if (!boardSearch) return;

  boardSearch.addEventListener("input", () => {
    updateFilteredTasks();
    renderBoardTasks();
  });
}

/**
 * Filters the board tasks by the current search text.
 * Task titles and descriptions are searched case-insensitively.
 *
 * @returns {void}
 */
function updateFilteredTasks() {
  const boardSearch = document.getElementById("boardSearch");
  const searchText = boardSearch ? boardSearch.value.trim().toLowerCase() : "";

  filteredTasks = boardTasks.filter((task) => {
    const title = (task.title || "").toLowerCase();
    const description = (task.description || "").toLowerCase();

    return title.includes(searchText) || description.includes(searchText);
  });
}

/**
 * Removes all rendered task cards and empty messages from the board columns.
 *
 * @returns {void}
 */
function clearBoardColumns() {
  document.getElementById("todoTasks").innerHTML = "";
  document.getElementById("inProgressTasks").innerHTML = "";
  document.getElementById("awaitFeedbackTasks").innerHTML = "";
  document.getElementById("doneTasks").innerHTML = "";
}

/**
 * Retrieves the board column associated with a task status.
 * Falls back to the to-do column when the status is unknown.
 *
 * @param {string} status - The task status used to select a board column.
 * @returns {HTMLElement|null} The matching board column, or null if it is not found.
 */
function getTargetColumn(status) {
  const columnIds = {
    todo: "todoTasks",
    inProgress: "inProgressTasks",
    awaitFeedback: "awaitFeedbackTasks",
    done: "doneTasks",
  };
  return document.getElementById(columnIds[status] || columnIds.todo);
}

/**
 * Creates the complete HTML markup for a board task card.
 *
 * @param {Object} task - The task used to create the card.
 * @returns {string} The generated HTML markup for the task card.
 */
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

/**
 * Creates the category, title, and description markup for a task card.
 *
 * @param {Object} task - The task whose main card content should be rendered.
 * @returns {string} The generated HTML markup for the task card content.
 */
function getTaskCardContentTemplate(task) {
  return `
    <span class="tag ${getCategoryClass(task.category)}">
      ${task.category || "Task"}
    </span>
    <div class="card-title">${task.title || ""}</div>
    <div class="card-desc">${task.description || ""}</div>`;
}

/**
 * Creates the assigned-contact and priority markup for a task card footer.
 *
 * @param {Object} task - The task whose footer should be rendered.
 * @returns {string} The generated HTML markup for the task card footer.
 */
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

/**
 * Returns the CSS class associated with a task category.
 *
 * @param {string} category - The task category.
 * @returns {string} The CSS class used to style the category tag.
 */
function getCategoryClass(category) {
  if (category === "Technical Task") {
    return "tag-teal";
  }

  if (category === "User Story") {
    return "tag-blue";
  }

  return "tag-blue";
}

/**
 * Returns the CSS class associated with a task priority.
 *
 * @param {string} priority - The task priority.
 * @returns {string} The CSS class used to style the priority indicator.
 */
function getPriorityClass(priority) {
  const classes = {
    urgent: "prio-urgent",
    medium: "prio-medium",
    low: "prio-low",
  };
  return classes[priority] || classes.medium;
}

/**
 * Calculates the completion percentage for a task's subtasks.
 *
 * @param {number} completedSubtasks - The number of completed subtasks.
 * @param {number} totalSubtasks - The total number of subtasks.
 * @returns {number} The rounded completion percentage, or 0 when no subtasks exist.
 */
function getSubtaskProgress(completedSubtasks, totalSubtasks) {
  if (totalSubtasks === 0) {
    return 0;
  }

  return Math.round((completedSubtasks / totalSubtasks) * 100);
}

/**
 * Creates the progress bar markup for a task's subtasks.
 *
 * @param {number} completedSubtasks - The number of completed subtasks.
 * @param {number} totalSubtasks - The total number of subtasks.
 * @param {number} progress - The completion percentage to display.
 * @returns {string} The generated progress markup, or an empty string when no subtasks exist.
 */
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

/**
 * Creates avatar markup for up to three contacts assigned to a task.
 *
 * @param {Object[]} assignedContacts - The contacts assigned to the task.
 * @returns {string} The generated HTML markup for the visible avatars.
 */
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

/**
 * Generates initials from the first two parts of a name.
 *
 * @param {string} name - The name used to generate the initials.
 * @returns {string} The generated uppercase initials.
 */
function getInitials(name = "") {
  return name
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

/**
 * Selects a fallback avatar color based on an item's position.
 *
 * @param {number} index - The position used to select a color.
 * @returns {string} The selected hexadecimal color value.
 */
function getAvatarColor(index) {
  const colors = ["#ff7a00", "#9747ff", "#1fbcb4", "#29abe2", "#6e52ff"];
  return colors[index % colors.length];
}

/**
 * Enriches all assigned-contact references with the available board contact data.
 *
 * @param {Object[]} assignedContacts - The assigned-contact references to enrich.
 * @returns {Object[]} The enriched assigned contacts.
 */
function enrichAssignedContacts(assignedContacts = []) {
  return assignedContacts.map(enrichAssignedContact);
}

/**
 * Enriches a single assigned-contact reference with matching board contact data.
 *
 * @param {Object} assignedContact - The assigned-contact reference to enrich.
 * @returns {Object} The enriched contact, or the original reference when no match is found.
 */
function enrichAssignedContact(assignedContact) {
  const user = contacts.find((contact) => matchesAssignedContact(contact, assignedContact));
  if (!user) return assignedContact;
  return { ...assignedContact, id: user.id, name: user.name,
    email: user.email, initials: user.initials || getInitials(user.name),
    color: user.color };
}

/**
 * Checks whether a board contact matches an assigned-contact reference.
 * Contacts are compared by ID, email address, or name.
 *
 * @param {Object} contact - The board contact to compare.
 * @param {Object} assignedContact - The assigned-contact reference to compare.
 * @returns {boolean} Whether the contacts match.
 */
function matchesAssignedContact(contact, assignedContact) {
  return contact.id === assignedContact.id ||
    contact.email === assignedContact.email ||
    contact.name === assignedContact.name;
}

/**
 * Returns the SVG icon associated with a task priority.
 *
 * @param {string} priority - The task priority.
 * @returns {string} The SVG markup for the matching priority icon.
 */
function getPriorityIcon(priority) {
  if (priority === "urgent") return getUrgentPriorityIcon();
  if (priority === "low") return getLowPriorityIcon();
  return getMediumPriorityIcon();
}

/**
 * Creates the SVG markup for the urgent-priority icon.
 *
 * @returns {string} The urgent-priority SVG markup.
 */
function getUrgentPriorityIcon() {
  return `
      <svg width="20" height="15" viewBox="0 0 20 15" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18.9 14.5L10 8.2L1.1 14.5" stroke="#FF3D00" stroke-width="3"/>
        <path d="M18.9 8.7L10 2.4L1.1 8.7" stroke="#FF3D00" stroke-width="3"/>
      </svg>`;
}

/**
 * Creates the SVG markup for the low-priority icon.
 *
 * @returns {string} The low-priority SVG markup.
 */
function getLowPriorityIcon() {
  return `
      <svg width="20" height="15" viewBox="0 0 20 15" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1.1 1L10 7.3L18.9 1" stroke="#7AE229" stroke-width="3"/>
        <path d="M1.1 6.8L10 13.1L18.9 6.8" stroke="#7AE229" stroke-width="3"/>
      </svg>`;
}

/**
 * Creates the SVG markup for the medium-priority icon.
 *
 * @returns {string} The medium-priority SVG markup.
 */
function getMediumPriorityIcon() {
  return `
    <svg width="20" height="8" viewBox="0 0 20 8" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 1H19" stroke="#FFA800" stroke-width="3"/>
      <path d="M1 7H19" stroke="#FFA800" stroke-width="3"/>
    </svg>`;
}

/**
 * Renders an empty-state message in every board column without tasks.
 *
 * @returns {void}
 */
function renderEmptyMessages() {
  renderEmptyMessage("todoTasks", "No tasks To do");
  renderEmptyMessage("inProgressTasks", "No tasks in progress");
  renderEmptyMessage("awaitFeedbackTasks", "No tasks await feedback");
  renderEmptyMessage("doneTasks", "No tasks done");
}

/**
 * Renders an empty-state message when the specified container has no children.
 *
 * @param {string} containerId - The ID of the board column container.
 * @param {string} message - The empty-state message to display.
 * @returns {void}
 */
function renderEmptyMessage(containerId, message) {
  const container = document.getElementById(containerId);

  if (container.children.length === 0) {
    container.innerHTML = `<div class="empty-card">${message}</div>`;
  }
}

let draggedTaskId = null;
let isDraggingTask = false;

/**
 * Initializes drag events on task cards and drop events on board columns.
 *
 * @returns {void}
 */
function initDragAndDrop() {
  initDraggableCards();
  initDropColumns();
}

/**
 * Adds drag-start and drag-end event handlers to all draggable task cards.
 *
 * @returns {void}
 */
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

/**
 * Starts dragging a task card and configures its custom drag image.
 *
 * @param {DragEvent} event - The drag-start event.
 * @param {HTMLElement} card - The task card being dragged.
 * @returns {void}
 */
function startDraggingCard(event, card) {
  draggedTaskId = card.dataset.taskId;
  isDraggingTask = true;
  card.classList.add("is-dragging");
  const dragImage = createRotatedDragImage(card);
  setTaskDragImage(event, dragImage);
  requestAnimationFrame(() => dragImage.remove());
}

/**
 * Positions a custom image at the center of the pointer during dragging.
 *
 * @param {DragEvent} event - The drag event containing the data transfer object.
 * @param {HTMLElement} dragImage - The element used as the custom drag image.
 * @returns {void}
 */
function setTaskDragImage(event, dragImage) {
  event.dataTransfer.setDragImage(
    dragImage,
    dragImage.offsetWidth / 2,
    dragImage.offsetHeight / 2,
  );
}

/**
 * Creates and appends a rotated clone of a task card for use while dragging.
 *
 * @param {HTMLElement} card - The task card to clone.
 * @returns {HTMLElement} The custom drag image element.
 */
function createRotatedDragImage(card) {
  const dragImage = card.cloneNode(true);

  dragImage.classList.remove("is-dragging");
  dragImage.classList.add("custom-drag-image");

  dragImage.style.width = `${card.offsetWidth}px`;
  dragImage.style.height = `${card.offsetHeight}px`;

  document.body.appendChild(dragImage);

  return dragImage;
}

/**
 * Ends the visual dragging state and resets the active task information.
 *
 * @param {HTMLElement} card - The task card whose dragging state should be removed.
 * @returns {void}
 */
function stopDraggingCard(card) {
  card.classList.remove("is-dragging");

  setTimeout(() => {
    draggedTaskId = null;
    isDraggingTask = false;
  }, 0);
}

/**
 * Initializes drop behavior for all board columns that define a task status.
 *
 * @returns {void}
 */
function initDropColumns() {
  document.querySelectorAll(".column[data-status]").forEach(initDropColumn);
}

/**
 * Adds drag-over, drag-leave, and drop event handlers to a board column.
 *
 * @param {HTMLElement} column - The board column to initialize.
 * @returns {void}
 */
function initDropColumn(column) {
  column.addEventListener("dragover", (event) => handleDragOver(event, column));
  column.addEventListener("dragleave", () => handleDragLeave(column));
  column.addEventListener("drop", (event) => handleDrop(event, column));
}

/**
 * Allows a task to be dropped and highlights the active board column.
 *
 * @param {DragEvent} event - The drag-over event.
 * @param {HTMLElement} column - The board column currently under the pointer.
 * @returns {void}
 */
function handleDragOver(event, column) {
  event.preventDefault();
  column.classList.add("is-drag-over");
}

/**
 * Removes the drag-over highlight from a board column.
 *
 * @param {HTMLElement} column - The board column the pointer has left.
 * @returns {void}
 */
function handleDragLeave(column) {
  column.classList.remove("is-drag-over");
}

/**
 * Handles dropping a task into a board column and updates its status.
 *
 * @async
 * @param {DragEvent} event - The drop event.
 * @param {HTMLElement} column - The board column receiving the task.
 * @returns {Promise<void>} A promise that resolves after the drop has been handled.
 */
async function handleDrop(event, column) {
  event.preventDefault();
  column.classList.remove("is-drag-over");

  if (!draggedTaskId) return;

  const newStatus = column.dataset.status;
  await moveTaskToStatus(draggedTaskId, newStatus);
}

/**
 * Moves a task to a new status when the task and status are valid.
 *
 * @async
 * @param {string} taskId - The ID of the task to move.
 * @param {string} newStatus - The destination status.
 * @returns {Promise<void>} A promise that resolves after the move attempt is complete.
 */
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

/**
 * Persists a task's new status and refreshes the rendered board.
 *
 * @async
 * @param {string} taskId - The ID of the task to update.
 * @param {Object} task - The local task object to update.
 * @param {string} newStatus - The status to save.
 * @returns {Promise<void>} A promise that resolves after the status has been saved.
 */
async function persistTaskStatus(taskId, task, newStatus) {
  await patchData(`tasks/${taskId}`, { status: newStatus });
  task.status = newStatus;
  updateFilteredTasks();
  renderBoardTasks();
}

initBoard();

/**
 * Adds click handlers to all task cards so their detail overlays can be opened.
 * Clicks triggered while dragging are ignored.
 *
 * @returns {void}
 */
function initTaskCardClicks() {
  document.querySelectorAll(".card[data-task-id]").forEach((card) => {
    card.addEventListener("click", () => {
      if (isDraggingTask) return;

      openTaskDetailOverlay(card.dataset.taskId);
    });
  });
}

/**
 * Opens and initializes the detail overlay for a selected task.
 *
 * @param {string} taskId - The ID of the task to display.
 * @returns {void}
 */
function openTaskDetailOverlay(taskId) {
  const task = findTaskById(taskId);
  if (!task) return;

  const elements = getTaskDetailOverlayElements();
  if (!elements) return;

  renderTaskDetailOverlay(task, elements.formContainer);
  initTaskDetailOverlayEvents(task, elements.overlay);
  showTaskDetailOverlay(elements.overlay);
}

/**
 * Finds a board task by its database ID.
 *
 * @param {string} taskId - The ID of the task to find.
 * @returns {Object|undefined} The matching task, or undefined if no task is found.
 */
function findTaskById(taskId) {
  return boardTasks.find((task) => task.id === taskId);
}

/**
 * Retrieves the elements required to display the task detail overlay.
 *
 * @returns {{overlay: HTMLElement, formContainer: HTMLElement}|null} The overlay elements, or null if an element is missing.
 */
function getTaskDetailOverlayElements() {
  const overlay = document.getElementById("cardOverlay");
  const formContainer = document.getElementById("cardFormContainer");

  if (!overlay || !formContainer) return null;

  return { overlay, formContainer };
}

/**
 * Renders a task inside the detail overlay and initializes its subtask checkboxes.
 *
 * @param {Object} task - The task to render.
 * @param {HTMLElement} formContainer - The container that receives the task markup.
 * @returns {void}
 */
function renderTaskDetailOverlay(task, formContainer) {
  formContainer.innerHTML = getTaskDetailOverlayTemplate(task);
  initDetailSubtaskCheckboxes(task);
}

/**
 * Initializes close, delete, edit, and background-click events for the task overlay.
 *
 * @param {Object} task - The task displayed in the overlay.
 * @param {HTMLElement} overlay - The task overlay element.
 * @returns {void}
 */
function initTaskDetailOverlayEvents(task, overlay) {
  initCloseTaskDetailEvent();
  initDeleteTaskEvent(task);
  initEditTaskEvent(task);
  overlay.addEventListener("click", closeTaskOverlayOnBackgroundClick);
}

/**
 * Adds the close event handler to the task detail overlay button.
 *
 * @returns {void}
 */
function initCloseTaskDetailEvent() {
  document
    .getElementById("closeTaskDetailOverlayBtn")
    .addEventListener("click", closeTaskDetailOverlay);
}

/**
 * Adds the delete event handler for the task displayed in the detail overlay.
 *
 * @param {Object} task - The task that should be deleted when the button is clicked.
 * @returns {void}
 */
function initDeleteTaskEvent(task) {
  document.getElementById("deleteTaskBtn").addEventListener("click", () => {
    deleteTask(task.id);
  });
}

/**
 * Adds the edit event handler for the task displayed in the detail overlay.
 *
 * @param {Object} task - The task that should be edited when the button is clicked.
 * @returns {void}
 */
function initEditTaskEvent(task) {
  document.getElementById("editTaskBtn").addEventListener("click", () => {
    openEditTaskOverlay(task.id);
  });
}

/**
 * Displays the task detail overlay and disables page scrolling.
 *
 * @param {HTMLElement} overlay - The task overlay element to display.
 * @returns {void}
 */
function showTaskDetailOverlay(overlay) {
  overlay.style.display = "flex";
  document.body.style.overflow = "hidden";
}

/**
 * Adds change handlers to all subtask checkboxes in the task detail overlay.
 *
 * @param {Object} task - The task whose subtasks can be updated.
 * @returns {void}
 */
function initDetailSubtaskCheckboxes(task) {
  document.querySelectorAll(".detailSubtaskCheckbox").forEach((checkbox) => {
    checkbox.addEventListener("change", () => updateDetailSubtask(task, checkbox));
  });
}

/**
 * Updates a subtask's completion state and saves the changed subtasks.
 *
 * @async
 * @param {Object} task - The task containing the changed subtask.
 * @param {HTMLInputElement} checkbox - The checkbox that triggered the update.
 * @returns {Promise<void>} A promise that resolves after the subtask update attempt.
 */
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

/**
 * Closes and clears the task detail overlay, then refreshes the board.
 *
 * @returns {void}
 */
function closeTaskDetailOverlay() {
  const overlay = document.getElementById("cardOverlay");
  const formContainer = document.getElementById("cardFormContainer");
  if (!overlay || !formContainer) return;
  resetTaskDetailOverlay(overlay, formContainer);
  updateFilteredTasks();
  renderBoardTasks();
}

/**
 * Resets the task overlay and its form container to their closed state.
 *
 * @param {HTMLElement} overlay - The task overlay element to hide.
 * @param {HTMLElement} formContainer - The container whose content and edit state should be cleared.
 * @returns {void}
 */
function resetTaskDetailOverlay(overlay, formContainer) {
  overlay.style.display = "none";
  document.body.style.overflow = "auto";
  formContainer.innerHTML = "";
  formContainer.classList.remove("edit-mode");
  overlay.removeEventListener("click", closeTaskOverlayOnBackgroundClick);
}

/**
 * Closes the task detail overlay when its background is clicked directly.
 *
 * @param {MouseEvent} event - The overlay click event.
 * @returns {void}
 */
function closeTaskOverlayOnBackgroundClick(event) {
  if (event.target.id === "cardOverlay") {
    closeTaskDetailOverlay();
  }
}

/**
 * Creates the complete HTML markup for a task's detail overlay.
 *
 * @param {Object} task - The task whose details should be displayed.
 * @returns {string} The generated HTML markup for the task detail overlay.
 */
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

/**
 * Creates the category and close-button markup for the task detail header.
 *
 * @param {Object} task - The task used to render the detail header.
 * @returns {string} The generated HTML markup for the task detail header.
 */
function getTaskDetailHeaderTemplate(task) {
  return `<div class="task-card-header">
    <span class="task-tag ${getOverlayCategoryClass(task.category)}">
      ${task.category || "Task"}
    </span>
    <button class="task-close-btn" id="closeTaskDetailOverlayBtn">&times;</button>
  </div>`;
}

/**
 * Creates the due-date and priority markup for a task detail overlay.
 *
 * @param {Object} task - The task whose metadata should be displayed.
 * @returns {string} The generated HTML markup for the task metadata.
 */
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

/**
 * Creates the assigned-contacts section for a task detail overlay.
 *
 * @param {Object[]} assignedContacts - The contacts assigned to the task.
 * @returns {string} The generated HTML markup for the assigned-contacts section.
 */
function getTaskAssignedTemplate(assignedContacts) {
  return `<div class="task-assigned">
    <div class="task-assigned-label">Assigned To:</div>
    <div class="task-assigned-list">
      ${getAssignedOverlayTemplate(assignedContacts)}
    </div>
  </div>`;
}

/**
 * Creates the subtask section for a task detail overlay.
 *
 * @param {Object[]} subtasks - The task's subtasks.
 * @returns {string} The generated HTML markup for the subtask section.
 */
function getTaskSubtasksTemplate(subtasks) {
  return `<div class="task-subtasks">
    <div class="task-subtasks-label">Subtasks</div>
    <div class="task-subtasks-list">
      ${getSubtasksOverlayTemplate(subtasks)}
    </div>
  </div>`;
}

/**
 * Creates the delete and edit action buttons for a task detail overlay.
 *
 * @returns {string} The generated HTML markup for the task actions.
 */
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

/**
 * Returns the overlay CSS class associated with a task category.
 *
 * @param {string} category - The task category.
 * @returns {string} The CSS class used to style the overlay category tag.
 */
function getOverlayCategoryClass(category) {
  if (category === "Technical Task") {
    return "technical-task";
  }

  if (category === "User Story") {
    return "user-story";
  }

  return "user-story";
}

/**
 * Returns the display label associated with a task priority.
 *
 * @param {string} priority - The task priority.
 * @returns {string} The human-readable priority label.
 */
function getPriorityText(priority) {
  const labels = { urgent: "Urgent", medium: "Medium", low: "Low" };
  return labels[priority] || labels.medium;
}

/**
 * Creates the assigned-person markup for a task detail overlay.
 * Displays a fallback message when no contacts are assigned.
 *
 * @param {Object[]} assignedContacts - The contacts assigned to the task.
 * @returns {string} The generated HTML markup for the assigned contacts.
 */
function getAssignedOverlayTemplate(assignedContacts) {
  if (!assignedContacts.length) {
    return `<span class="assigned-name">No contacts assigned</span>`;
  }
  return assignedContacts.map(getAssignedPersonTemplate).join("");
}

/**
 * Creates the HTML markup for one assigned person in a task detail overlay.
 *
 * @param {Object} contact - The assigned contact to render.
 * @returns {string} The generated HTML markup for the assigned person.
 */
function getAssignedPersonTemplate(contact) {
  return `<div class="assigned-person">
    <div class="assigned-avatar" style="background:${contact.color || "#2a3647"}">
      ${contact.initials || getInitials(contact.name)}
    </div>
    <span class="assigned-name">${contact.name || ""}</span>
  </div>`;
}

/**
 * Creates the subtask markup for a task detail overlay.
 * Displays a fallback message when the task has no subtasks.
 *
 * @param {Object[]} subtasks - The subtasks to render.
 * @returns {string} The generated HTML markup for the subtasks.
 */
function getSubtasksOverlayTemplate(subtasks) {
  if (!subtasks.length) return `<span class="subtask-text">No subtasks</span>`;
  return subtasks.map(getOverlaySubtaskTemplate).join("");
}

/**
 * Creates checkbox markup for one subtask in a task detail overlay.
 *
 * @param {Object} subtask - The subtask to render.
 * @param {number} index - The subtask's position in the task's subtask list.
 * @returns {string} The generated HTML markup for the subtask checkbox.
 */
function getOverlaySubtaskTemplate(subtask, index) {
  return `<label class="subtask-item">
    <input type="checkbox" class="detailSubtaskCheckbox"
      data-index="${index}" ${subtask.done ? "checked" : ""}>
    <span class="subtask-text">${subtask.title || ""}</span>
  </label>`;
}

/**
 * Requests confirmation and deletes a task from the database.
 *
 * @async
 * @param {string} taskId - The ID of the task to delete.
 * @returns {Promise<void>} A promise that resolves after the deletion attempt is complete.
 */
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

/**
 * Removes a deleted task from the local board data and refreshes the board.
 *
 * @param {string} taskId - The ID of the deleted task.
 * @returns {void}
 */
function removeDeletedTask(taskId) {
  boardTasks = boardTasks.filter((task) => task.id !== taskId);
  updateFilteredTasks();
  closeTaskDetailOverlay();
  renderBoardTasks();
}

/**
 * Opens the edit form for a selected task and initializes its board context.
 *
 * @param {string} taskId - The ID of the task to edit.
 * @returns {void}
 */
function openEditTaskOverlay(taskId) {
  const task = boardTasks.find((task) => task.id === taskId);

  if (!task) return;

  const formContainer = document.getElementById("cardFormContainer");

  formContainer.classList.add("edit-mode");
  formContainer.innerHTML = getEditTaskTemplate(task);

  initEditTaskForm(task, getBoardEditContext());
}

/**
 * Creates the shared data and callback context required by the task edit form.
 *
 * @returns {Object} The board edit context.
 */
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

/**
 * Replaces a task in the local board data with its updated values.
 *
 * @param {string} taskId - The ID of the task to update.
 * @param {Object} updatedTask - The changed task values.
 * @returns {void}
 */
function updateTaskInBoardTasks(taskId, updatedTask) {
  boardTasks = boardTasks.map((task) => {
    return task.id === taskId ? { ...task, ...updatedTask } : task;
  });
}
