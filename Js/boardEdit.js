import { patchData } from "./storage.js";
import { boardEditState } from "./boardEditState.js";
import {
  initEditPriorityButtons, initEditAssignedContacts,
} from "./boardEditContacts.js";
import { initEditSubtasks } from "./boardEditSubtasks.js";

/**
 * Initializes the edit task form.
 *
 * @param {Object} task - The task to process.
 * @param {Object} context - The board data and callbacks used by the edit form.
 * @returns {void}
 */
export function initEditTaskForm(task, context) {
  boardEditState.context = context;
  const state = createEditFormState(task);
  initEditFormControls(state);
  initEditValidationEvents();
  bindEditFormSubmit(task.id, state);
}

/**
 * Creates the edit form state.
 *
 * @param {Object} task - The task to process.
 * @returns {Object} The generated data object.
 */
function createEditFormState(task) {
  return {
    priority: task.priority || "medium",
    contacts: boardEditState.context.enrichAssignedContacts(task.assignedTo || []),
    subtasks: [...(task.subtasks || [])],
  };
}

/**
 * Initializes the edit form controls.
 *
 * @param {Object} state - The current edit form state.
 * @returns {void}
 */
function initEditFormControls(state) {
  document.getElementById("closeEditTaskOverlayBtn")
    .addEventListener("click", boardEditState.context.closeTaskDetailOverlay);
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

/**
 * Binds the submit handler for the edit task form.
 *
 * @param {string} taskId - The ID of the task.
 * @param {Object} state - The current edit form state.
 * @returns {void}
 */
function bindEditFormSubmit(taskId, state) {
  document.getElementById("editTaskForm").addEventListener("submit", (event) => {
    event.preventDefault();
    saveEditedTask(taskId, state.priority, state.contacts, state.subtasks);
  });
}

/**
 * Initializes the edit validation events.
 *
 * @returns {void}
 */
function initEditValidationEvents() {
  const elements = getEditValidationElements();
  elements.date.min = getTodayISO();
  bindEditValidation(elements.title, elements.titleError, validateEditTaskTitle);
  bindEditValidation(elements.date, elements.dateError, validateEditTaskDate);
  bindEditCategoryValidation(elements.category, elements.categoryError);
}

/**
 * Retrieves the edit validation elements.
 *
 * @returns {Object} The generated data object.
 */
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

/**
 * Binds the edit validation.
 *
 * @param {HTMLElement} input - The input element to process.
 * @param {HTMLElement} error - The element used to display an error.
 * @param {Function} validate - The validation callback to register.
 * @returns {void}
 */
function bindEditValidation(input, error, validate) {
  input.addEventListener("input", () => clearEditInputError(input, error));
  input.addEventListener("blur", validate);
}

/**
 * Binds the edit category validation.
 *
 * @param {HTMLElement} input - The input element to process.
 * @param {HTMLElement} error - The element used to display an error.
 * @returns {void}
 */
function bindEditCategoryValidation(input, error) {
  input.addEventListener("change", () => {
    clearEditInputError(input, error);
    validateEditTaskCategory();
  });
  input.addEventListener("blur", validateEditTaskCategory);
}

/**
 * Saves the edited task.
 *
 * @async
 * @param {string} taskId - The ID of the task.
 * @param {string} priority - The selected task priority.
 * @param {Object[]} selectedContacts - The currently selected contacts.
 * @param {Object[]} subtasks - The subtasks to process.
 * @returns {Promise<void>} A promise that resolves when the operation is complete.
 */
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

/**
 * Retrieves the edited task data.
 *
 * @param {string} priority - The selected task priority.
 * @param {Object[]} assignedTo - The contacts assigned to the task.
 * @param {Object[]} subtasks - The subtasks to process.
 * @returns {Object} The generated data object.
 */
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

/**
 * Updates the board state and closes the overlay after a task is saved.
 *
 * @param {string} taskId - The ID of the task.
 * @param {Object} updatedTask - The updated task values.
 * @returns {void}
 */
function finishEditTaskSave(taskId, updatedTask) {
  boardEditState.context.updateTaskInBoardTasks(taskId, updatedTask);
  boardEditState.context.updateFilteredTasks();
  boardEditState.context.closeTaskDetailOverlay();
  boardEditState.context.renderBoardTasks();
}

/**
 * Checks whether all required fields in the edit task form are valid.
 *
 * @returns {boolean} Whether the validation or comparison succeeds.
 */
function isEditTaskFormValid() {
  clearEditErrors();

  return (
    validateEditTaskTitle() &&
    validateEditTaskDate() &&
    validateEditTaskCategory()
  );
}

/**
 * Validates the edit task title.
 *
 * @returns {boolean} Whether the validation or comparison succeeds.
 */
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

/**
 * Validates the edit task category.
 *
 * @returns {boolean} Whether the validation or comparison succeeds.
 */
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

/**
 * Validates the edit task date.
 *
 * @returns {boolean} Whether the validation or comparison succeeds.
 */
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

/**
 * Rejects the invalid edit date.
 *
 * @param {HTMLElement} input - The input element to process.
 * @param {HTMLElement} error - The element used to display an error.
 * @param {string} message - The message to display.
 * @returns {boolean} Whether the validation or comparison succeeds.
 */
function rejectEditDate(input, error, message) {
  setEditInputError(input, error, message);
  return false;
}

/**
 * Marks an edit form input as invalid and displays its error message.
 *
 * @param {HTMLElement} input - The input element to process.
 * @param {HTMLElement} errorElement - The element used to display an error.
 * @param {string} message - The message to display.
 * @returns {void}
 */
function setEditInputError(input, errorElement, message) {
  input.classList.remove("inputFocus");
  input.classList.add("inputError");

  if (errorElement) {
    errorElement.textContent = message;
  }
}

/**
 * Removes the error state and message from an edit form input.
 *
 * @param {HTMLElement} input - The input element to process.
 * @param {HTMLElement} errorElement - The element used to display an error.
 * @returns {void}
 */
function clearEditInputError(input, errorElement) {
  input.classList.remove("inputError");

  if (errorElement) {
    errorElement.textContent = "";
  }
}

/**
 * Clears all validation errors from the edit task form.
 *
 * @returns {void}
 */
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

/**
 * Converts a displayed date value into ISO format.
 *
 * @param {string} dateValue - The date value to process.
 * @returns {string} The generated value or HTML markup.
 */
function convertDateToISO(dateValue) {
  if (!dateValue.includes("/")) {
    return dateValue;
  }

  const [day, month, year] = dateValue.split("/");
  return `${year}-${month}-${day}`;
}

/**
 * Returns today's local date in ISO format.
 *
 * @returns {string} The generated value or HTML markup.
 */
function getTodayISO() {
  const today = new Date();
  const timezoneOffset = today.getTimezoneOffset() * 60000;
  const localDate = new Date(today.getTime() - timezoneOffset);

  return localDate.toISOString().split("T")[0];
}

/**
 * Converts an ISO date into the date format used for display.
 *
 * @param {string} dateValue - The date value to process.
 * @returns {string} The generated value or HTML markup.
 */
function formatDateForDisplay(dateValue) {
  if (!dateValue || !dateValue.includes("-")) return dateValue || "";

  const [year, month, day] = dateValue.split("-");
  return `${day}/${month}/${year}`;
}

/**
 * Checks whether an edit form date uses a valid ISO date format.
 *
 * @param {string} dateValue - The date value to process.
 * @returns {boolean} Whether the validation or comparison succeeds.
 */
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

/**
 * Checks that the selected edit task date is not in the past.
 *
 * @param {HTMLElement} input - The input element to process.
 * @param {HTMLElement} errorElement - The element used to display an error.
 * @param {string} dateValue - The date value to process.
 * @returns {boolean} Whether the validation or comparison succeeds.
 */
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
