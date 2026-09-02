import { validateTaskTitle, validateTaskDate, validateTaskCategory } from "./addTask.js";
import { renderContacts, renderSelectedContacts } from "./addTaskContacts.js";
import { renderSubtasks } from "./addTaskSubtasks.js";

/**
 * Restores the add task form and its dynamic controls to their default state.
 *
 * @returns {void}
 */
export function resetFormState() {
  resetTaskForm();
  resetTaskValues();
  resetTaskInputs();
  closeTaskDropdowns();
  resetTaskFocusStyles();
  rerenderTaskForm();
  resetPriorityButtons();
}

/**
 * Resets the task form.
 *
 * @returns {void}
 */
function resetTaskForm() {
  taskForm.reset();
  clearAllErrors();
}

/**
 * Resets the task values.
 *
 * @returns {void}
 */
function resetTaskValues() {
  selectedPriority = "medium";
  selectedCategory = "";
  selectedContacts = [];
  subtasks = [];
}

/**
 * Resets the task inputs.
 *
 * @returns {void}
 */
function resetTaskInputs() {
  categoryButton.textContent = "Select task category";
  assignedInput.value = "";
  subtaskInput.value = "";
}

/**
 * Closes the task dropdowns.
 *
 * @returns {void}
 */
function closeTaskDropdowns() {
  assignedList.classList.add("d_none");
  moreContactsDropdown.classList.add("d_none");
  moreSubtasksDropdown.classList.add("d_none");
  categoryList.classList.add("d_none");
}

/**
 * Resets the task focus styles.
 *
 * @returns {void}
 */
function resetTaskFocusStyles() {
  const focusElements = [
    taskTitle,
    taskDate,
    taskDescription,
    subtaskInput,
    categoryButton,
  ];

  focusElements.forEach((element) => element.classList.remove("inputFocus"));
}

/**
 * Rerenders all dynamic sections of the add task form.
 *
 * @returns {void}
 */
function rerenderTaskForm() {
  renderSelectedContacts();
  renderSubtasks();
  renderContacts();
}

/**
 * Resets the priority buttons.
 *
 * @returns {void}
 */
function resetPriorityButtons() {
  document.querySelectorAll(".priorityBtn").forEach((btn) => {
    btn.classList.remove("activeUrgent", "activeMedium", "activeLow");
  });

  const mediumBtn = document.querySelector(".mediumBtn");
  if (mediumBtn) mediumBtn.classList.add("activeMedium");
}

/**
 * Marks an input as invalid and displays its error message.
 *
 * @param {HTMLElement} input - The input element to process.
 * @param {HTMLElement} errorElement - The element used to display an error.
 * @param {string} message - The message to display.
 * @returns {void}
 */
function setInputError(input, errorElement, message) {
  input.classList.remove("inputFocus");
  input.classList.add("inputError");
  errorElement.textContent = message;
}

/**
 * Removes the error state and message from an input.
 *
 * @param {HTMLElement} input - The input element to process.
 * @param {HTMLElement} errorElement - The element used to display an error.
 * @returns {void}
 */
export function clearInputError(input, errorElement) {
  input.classList.remove("inputError");
  errorElement.textContent = "";
}

/**
 * Handles the input change.
 *
 * @param {HTMLElement} input - The input element to process.
 * @param {HTMLElement} errorElement - The element used to display an error.
 * @returns {void}
 */
export function handleInputChange(input, errorElement) {
  clearInputError(input, errorElement);
  toggleInputFocus(input);
}

/**
 * Toggles the input focus.
 *
 * @param {HTMLElement} input - The input element to process.
 * @returns {void}
 */
export function toggleInputFocus(input) {
  if (input.value.trim()) {
    input.classList.add("inputFocus");
  } else {
    input.classList.remove("inputFocus");
  }
}

/**
 * Clears all validation errors from the current form.
 *
 * @returns {void}
 */
export function clearAllErrors() {
  clearInputError(taskTitle, taskTitleError);
  clearInputError(taskDate, taskDateError);
  clearInputError(categoryButton, categoryError);
}

/**
 * Displays the task added overlay.
 *
 * @returns {void}
 */
export function showTaskAddedOverlay() {
  taskAddedOverlay.classList.remove("d_none");
  scheduleOverlayClass("show", "add", 10);
  scheduleOverlayClass("show", "remove", 1200);
  scheduleOverlayClass("d_none", "add", 1500);
}

/**
 * Schedules a class change on the task-added overlay.
 *
 * @param {string} className - The CSS class to change.
 * @param {string} action - The class-list action to perform.
 * @param {number} delay - The delay in milliseconds.
 * @returns {void}
 */
function scheduleOverlayClass(className, action, delay) {
  setTimeout(() => taskAddedOverlay.classList[action](className), delay);
}

/**
 * Initializes validation when add task fields lose focus.
 *
 * @returns {void}
 */
export function initAddTaskBlurValidation() {
  taskTitle.addEventListener("blur", validateTaskTitle);
  taskDate.addEventListener("blur", validateTaskDate);

  document.addEventListener("click", (event) => {
    const clickedInsideCategory = event.target.closest("#categoryDropdown");

    if (categoryWasTouched && !clickedInsideCategory) {
      validateTaskCategory();
    }
  });
}

/**
 * Returns a task's due date in ISO format.
 *
 * @param {Object} task - The task to process.
 * @returns {string} The generated value or HTML markup.
 */
function getTaskDateISO(task) {
  if (task.dueDateISO) {
    return task.dueDateISO;
  }

  if (!task.dueDate || !task.dueDate.includes("/")) {
    return task.dueDate || "";
  }

  const [day, month, year] = task.dueDate.split("/");

  return `${year}-${month}-${day}`;
}
