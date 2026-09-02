import { loadData, postData, patchData } from "./storage.js";
import {
  initPriorityButtons, initCategoryDropdown, initAssignedDropdown, loadContacts,
} from "./addTaskContacts.js";
import { initSubtasks, renderSubtasks } from "./addTaskSubtasks.js";
import {
  resetFormState, clearInputError, handleInputChange, toggleInputFocus,
  clearAllErrors, showTaskAddedOverlay, initAddTaskBlurValidation,
} from "./addTaskForm.js";

globalThis.taskDate = document.getElementById("taskDate");
globalThis.taskDateError = document.getElementById("taskDateError");

globalThis.taskTitleError = document.getElementById("taskTitleError");
globalThis.categoryError = document.getElementById("categoryError");

globalThis.currentUser = JSON.parse(localStorage.getItem("currentUser"));

globalThis.taskForm = document.getElementById("taskForm");
globalThis.taskTitle = document.getElementById("taskTitle");
globalThis.taskDescription = document.getElementById("taskDescription");
globalThis.clearTaskBtn = document.getElementById("clearTaskBtn");

globalThis.assignedInput = document.getElementById("assignedInput");
globalThis.assignedList = document.getElementById("assignedList");
globalThis.selectedContactsContainer = document.getElementById("selectedContacts");
globalThis.moreContactsDropdown = document.getElementById("moreContactsDropdown");

globalThis.categoryButton = document.getElementById("categoryButton");
globalThis.categoryList = document.getElementById("categoryList");

globalThis.subtaskInput = document.getElementById("subtasks");
globalThis.subtaskList = document.getElementById("subtaskList");
globalThis.addSubtaskBtn = document.getElementById("addSubtaskBtn");
globalThis.clearSubtaskBtn = document.getElementById("clearSubtaskBtn");
globalThis.moreSubtasksDropdown = document.getElementById("moreSubtasksDropdown");

globalThis.taskAddedOverlay = document.getElementById("taskAddedOverlay");
globalThis.assignedArrow = document.getElementById("assignedArrow");
globalThis.categoryArrow = document.getElementById("categoryArrow");

globalThis.selectedPriority = "medium";
globalThis.selectedCategory = "";
globalThis.contacts = [];
globalThis.selectedContacts = [];
globalThis.subtasks = [];
globalThis.categoryWasTouched = false;

initPriorityButtons();
initCategoryDropdown();
initAssignedDropdown();
initSubtasks();
loadContacts();
initAddTaskBlurValidation()
initTaskDate();

clearTaskBtn.addEventListener("click", () => {
  resetFormState();
});

/**
 * Validates the task date.
 *
 * @returns {boolean} Whether the validation or comparison succeeds.
 */
export function validateTaskDate() {
  clearInputError(taskDate, taskDateError);
  const dateValue = taskDate.value;
  if (!dateValue) return rejectTaskDate("This field is required");
  if (dateValue < getTodayISO()) {
    return rejectTaskDate("The due date cannot be in the past.");
  }
  return true;
}

/**
 * Rejects the invalid task date.
 *
 * @param {string} message - The message to display.
 * @returns {boolean} Whether the validation or comparison succeeds.
 */
function rejectTaskDate(message) {
  setInputError(taskDate, taskDateError, message);
  return false;
}

/**
 * Initializes the task date.
 *
 * @returns {void}
 */
function initTaskDate() {
  taskDate.min = getTodayISO();

  taskDate.addEventListener("input", () => {
    handleInputChange(taskDate, taskDateError);
  });

  taskDate.addEventListener("blur", validateTaskDate);
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

taskForm.addEventListener("submit", handleTaskSubmit);

/**
 * Validates the add task form and saves the resulting task.
 *
 * @async
 * @param {Event} event - The event that triggered the operation.
 * @returns {Promise<void>} A promise that resolves when the operation is complete.
 */
async function handleTaskSubmit(event) {
  event.preventDefault();

  if (!isTaskFormValid()) return;

  addCurrentSubtaskInput();

  const task = createTaskFromForm();
  await saveTask(task);
}

/**
 * Checks whether all required fields in the add task form are valid.
 *
 * @returns {boolean} Whether the validation or comparison succeeds.
 */
function isTaskFormValid() {
  clearAllErrors();

  return (
    validateTaskTitle() &&
    validateTaskDate() &&
    validateTaskCategory() &&
    validateCurrentUser()
  );
}

/**
 * Validates the task title.
 *
 * @returns {boolean} Whether the validation or comparison succeeds.
 */
export function validateTaskTitle() {
  if (taskTitle.value.trim()) {
    clearInputError(taskTitle, taskTitleError);
    return true;
  }

  setInputError(taskTitle, taskTitleError, "This field is required");
  return false;
}

/**
 * Validates the task category.
 *
 * @returns {boolean} Whether the validation or comparison succeeds.
 */
export function validateTaskCategory() {
  if (selectedCategory) {
    clearInputError(categoryButton, categoryError);
    return true;
  }

  setInputError(categoryButton, categoryError, "This field is required");
  return false;
}

/**
 * Checks whether a current user is available for the new task.
 *
 * @returns {boolean} Whether the validation or comparison succeeds.
 */
function validateCurrentUser() {
  if (currentUser) return true;

  console.error("Kein User eingeloggt!");
  return false;
}

/**
 * Creates a complete task object from the current form state.
 *
 * @returns {Object} The generated data object.
 */
function createTaskFromForm() {
  return {
    ...getTaskFormValues(),
    ...getTaskUserData(),
    ...getTaskDefaultData(),
  };
}

/**
 * Retrieves the task form values.
 *
 * @returns {Object} The generated data object.
 */
function getTaskFormValues() {
  return {
    title: taskTitle.value.trim(),
    description: taskDescription.value.trim(),
    dueDate: formatDateForDisplay(taskDate.value),
    dueDateISO: taskDate.value,
    category: selectedCategory,
    priority: selectedPriority,
    assignedTo: selectedContacts,
    subtasks,
  };
}

/**
 * Converts an ISO date into the date format used for display.
 *
 * @param {string} dateValue - The date value to process.
 * @returns {string} The generated value or HTML markup.
 */
function formatDateForDisplay(dateValue) {
  if (!dateValue) return "";

  const [year, month, day] = dateValue.split("-");

  return `${day}/${month}/${year}`;
}

/**
 * Retrieves the task user data.
 *
 * @returns {Object} The generated data object.
 */
function getTaskUserData() {
  return {
    createdBy: currentUser.id || currentUser.uid || "guest",
  };
}

/**
 * Retrieves the task default data.
 *
 * @returns {Object} The generated data object.
 */
function getTaskDefaultData() {
  return {
    status: "todo",
    createdAt: Date.now(),
  };
}

/**
 * Saves the task.
 *
 * @async
 * @param {Object} task - The task to process.
 * @returns {Promise<void>} A promise that resolves when the operation is complete.
 */
async function saveTask(task) {
  try {
    const result = await postData("tasks", task);
    handleTaskSaveSuccess(result);
  } catch (error) {
    console.error("Fehler beim Speichern:", error);
  }
}

/**
 * Handles a successful save by notifying the user and resetting the form.
 *
 * @param {Object} result - The database response for the saved task.
 * @returns {void}
 */
function handleTaskSaveSuccess(result) {
  console.log("Task gespeichert mit ID:", result.name);

  showTaskAddedOverlay();
  resetFormState();
  redirectToBoardAfterDelay();
}

/**
 * Redirects to the board after a short delay.
 *
 * @returns {void}
 */
function redirectToBoardAfterDelay() {
  setTimeout(() => {
    window.location.href = "./board.html";
  }, 1200);
}

taskTitle.addEventListener("input", () => {
  handleInputChange(taskTitle, taskTitleError);
});

taskDescription.addEventListener("input", () => {
  toggleInputFocus(taskDescription);
});

subtaskInput.addEventListener("input", () => {
  toggleInputFocus(subtaskInput);
});

/**
 * Adds the current subtask input value to the task when it is not empty.
 *
 * @returns {void}
 */
function addCurrentSubtaskInput() {
  const subtaskText = subtaskInput.value.trim();

  if (!subtaskText) return;

  subtasks.push({
    title: subtaskText,
    done: false,
  });

  subtaskInput.value = "";
  renderSubtasks();
}
