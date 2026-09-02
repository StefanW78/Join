import { patchData, deleteData } from "./storage.js";
import { initEditTaskForm } from "./boardEdit.js";
import { enrichAssignedContacts, getAvatarColor, getInitials } from "./boardCards.js";
import { getTaskDetailOverlayTemplate } from "./boardDetailTemplates.js";
import { isBoardDragging } from "./boardDrag.js";

/**
 * Stores the shared board data and callbacks used by task details.
 */
let boardDetailsContext = null;

/**
 * Initializes task card clicks and stores the shared board context.
 *
 * @param {Object} context - The shared data and callbacks used by the module.
 * @returns {void}
 */
export function initTaskCardClicks(context) {
  boardDetailsContext = context;
  document.querySelectorAll(".card[data-task-id]").forEach((card) => {
    card.addEventListener("click", () => {
      if (isBoardDragging()) return;

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
  return boardDetailsContext.getTasks().find((task) => task.id === taskId);
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
  const assigned = enrichAssignedContacts(
    task.assignedTo || [], boardDetailsContext.getContacts());
  formContainer.innerHTML = getTaskDetailOverlayTemplate(task, assigned);
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
    boardDetailsContext.updateFilteredTasks();
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
  boardDetailsContext.updateFilteredTasks();
  boardDetailsContext.renderBoardTasks();
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
  boardDetailsContext.removeTask(taskId);
  boardDetailsContext.updateFilteredTasks();
  closeTaskDetailOverlay();
  boardDetailsContext.renderBoardTasks();
}

/**
 * Opens the edit form for a selected task and initializes its board context.
 *
 * @param {string} taskId - The ID of the task to edit.
 * @returns {void}
 */
function openEditTaskOverlay(taskId) {
  const task = boardDetailsContext.getTasks().find((task) => task.id === taskId);

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
    contacts: boardDetailsContext.getContacts(),
    enrichAssignedContacts: assigned => enrichAssignedContacts(
      assigned, boardDetailsContext.getContacts()),
    closeTaskDetailOverlay,
    updateTaskInBoardTasks: boardDetailsContext.updateTaskInBoardTasks,
    updateFilteredTasks: boardDetailsContext.updateFilteredTasks,
    renderBoardTasks: boardDetailsContext.renderBoardTasks,
    getAvatarColor,
    getInitials,
  };
}
