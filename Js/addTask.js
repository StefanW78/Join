import { loadData, postData, patchData } from "./storage.js";

const taskDate = document.getElementById("taskDate");
const taskDateError = document.getElementById("taskDateError");

const taskTitleError = document.getElementById("taskTitleError");
const categoryError = document.getElementById("categoryError");

const currentUser = JSON.parse(localStorage.getItem("currentUser"));

const taskForm = document.getElementById("taskForm");
const taskTitle = document.getElementById("taskTitle");
const taskDescription = document.getElementById("taskDescription");
const clearTaskBtn = document.getElementById("clearTaskBtn");

const assignedInput = document.getElementById("assignedInput");
const assignedList = document.getElementById("assignedList");
const selectedContactsContainer = document.getElementById("selectedContacts");
const moreContactsDropdown = document.getElementById("moreContactsDropdown");

const categoryButton = document.getElementById("categoryButton");
const categoryList = document.getElementById("categoryList");

const subtaskInput = document.getElementById("subtasks");
const subtaskList = document.getElementById("subtaskList");
const addSubtaskBtn = document.getElementById("addSubtaskBtn");
const clearSubtaskBtn = document.getElementById("clearSubtaskBtn");
const moreSubtasksDropdown = document.getElementById("moreSubtasksDropdown");

const taskAddedOverlay = document.getElementById("taskAddedOverlay");
const assignedArrow = document.getElementById("assignedArrow");
const categoryArrow = document.getElementById("categoryArrow");

let selectedPriority = "medium";
let selectedCategory = "";
let contacts = [];
let selectedContacts = [];
let subtasks = [];
let categoryWasTouched = false;

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
function validateTaskDate() {
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
function validateTaskTitle() {
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
function validateTaskCategory() {
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

/**
 * Initializes the priority buttons.
 *
 * @returns {void}
 */
function initPriorityButtons() {
  const priorityButtons = document.querySelectorAll(".priorityBtn");
  priorityButtons.forEach((button) => {
    button.addEventListener("click", () => selectPriority(button, priorityButtons));
  });
}

/**
 * Selects the priority.
 *
 * @param {HTMLElement} button - The button involved in the operation.
 * @param {NodeListOf<HTMLElement>} priorityButtons - The available task priority buttons.
 * @returns {void}
 */
function selectPriority(button, priorityButtons) {
  clearPrioritySelection(priorityButtons);
  const priority = getButtonPriority(button);
  if (!priority) return;
  selectedPriority = priority;
  button.classList.add(`active${capitalize(priority)}`);
}

/**
 * Clears the priority selection.
 *
 * @param {NodeListOf<HTMLElement>} priorityButtons - The available task priority buttons.
 * @returns {void}
 */
function clearPrioritySelection(priorityButtons) {
  priorityButtons.forEach((button) => {
    button.classList.remove("activeUrgent", "activeMedium", "activeLow");
  });
}

/**
 * Retrieves the button priority.
 *
 * @param {HTMLElement} button - The button involved in the operation.
 * @returns {string} The generated value or HTML markup.
 */
function getButtonPriority(button) {
  if (button.classList.contains("urgentBtn")) return "urgent";
  if (button.classList.contains("mediumBtn")) return "medium";
  if (button.classList.contains("lowBtn")) return "low";
  return "";
}

/**
 * Capitalizes the first character of a string.
 *
 * @param {string} value - The value to capitalize.
 * @returns {string} The generated value or HTML markup.
 */
function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/**
 * Initializes the category dropdown.
 *
 * @returns {void}
 */
function initCategoryDropdown() {
  categoryButton.addEventListener("click", toggleCategoryDropdown);
  document.querySelectorAll("[data-category]").forEach((option) => {
    option.addEventListener("click", () => selectCategory(option));
  });
}

/**
 * Toggles the category dropdown.
 *
 * @returns {void}
 */
function toggleCategoryDropdown() {
  categoryList.classList.toggle("d_none");
  const isClosed = categoryList.classList.contains("d_none");
  categoryArrow.src = isClosed
    ? "./assets/img/arrow_drop_down-icon.svg"
    : "./assets/img/arrowUup.svg";
}

/**
 * Selects the category.
 *
 * @param {HTMLElement} option - The selected option element.
 * @returns {void}
 */
function selectCategory(option) {
  selectedCategory = option.dataset.category;
  categoryButton.textContent = selectedCategory;
  categoryList.classList.add("d_none");
  categoryArrow.src = "./assets/img/arrow_drop_down-icon.svg";
  clearInputError(categoryButton, categoryError);
  categoryButton.classList.add("inputFocus");
}

/**
 * Initializes the assigned dropdown.
 *
 * @returns {void}
 */
function initAssignedDropdown() {
  assignedInput.addEventListener("focus", openAssignedDropdown);
  assignedInput.addEventListener("input", renderContacts);
  document.addEventListener("click", handleAssignedOutsideClick);
}

/**
 * Opens the assigned dropdown.
 *
 * @returns {void}
 */
function openAssignedDropdown() {
  assignedList.classList.remove("d_none");
  assignedArrow.src = "./assets/img/arrowUup.svg";
  renderContacts();
}

/**
 * Closes assigned-contact controls when a click occurs outside them.
 *
 * @param {Event} event - The event that triggered the operation.
 * @returns {void}
 */
function handleAssignedOutsideClick(event) {
  if (!event.target.closest("#assignedDropdown")) closeAssignedDropdown();
  if (!event.target.closest(".selectedContactsWrapper")) {
    moreContactsDropdown.classList.add("d_none");
  }
}

/**
 * Closes the assigned dropdown.
 *
 * @returns {void}
 */
function closeAssignedDropdown() {
  assignedList.classList.add("d_none");
  assignedArrow.src = "./assets/img/arrow_drop_down-icon.svg";
}

/**
 * Loads the contacts.
 *
 * @async
 * @returns {Promise<void>} A promise that resolves when the operation is complete.
 */
async function loadContacts() {
  try {
    const usersObject = (await loadData("users")) || {};
    contacts = await Promise.all(Object.entries(usersObject).map(createContact));
  } catch (error) {
    console.error("Fehler beim Laden der User:", error);
    contacts = [];
  }
  renderContacts();
}

/**
 * Creates a normalized contact and ensures that it has an avatar color.
 *
 * @async
 * @param {[string, Object]} contactEntry - The database ID and associated data.
 * @param {number} index - The item's position in its list.
 * @returns {Promise<Object>} A promise that resolves with the normalized contact.
 */
async function createContact([id, user], index) {
  const color = await getOrCreateContactColor(id, user.color, index);
  return {
    id,
    name: user.name,
    email: user.email,
    initials: user.initials,
    color,
  };
}

/**
 * Returns an existing contact color or creates and saves a fallback color.
 *
 * @async
 * @param {string} id - The relevant database ID.
 * @param {string|undefined} color - The contact's existing color, if available.
 * @param {number} index - The item's position in its list.
 * @returns {Promise<string>} A promise that resolves with the contact color.
 */
async function getOrCreateContactColor(id, color, index) {
  if (color) return color;
  const generatedColor = getAvatarColor(index);
  await patchData(`users/${id}`, { color: generatedColor });
  return generatedColor;
}

/**
 * Renders the contacts.
 *
 * @returns {void}
 */
function renderContacts() {
  assignedList.innerHTML = "";
  const searchText = assignedInput.value.trim().toLowerCase();
  contacts.filter((contact) => matchesContact(contact, searchText))
    .forEach(renderContactOption);
  initContactOptionEvents();
}

/**
 * Checks whether a contact's name contains the current search text.
 *
 * @param {Object} contact - The contact to process.
 * @param {string} searchText - The normalized search text.
 * @returns {boolean} Whether the validation or comparison succeeds.
 */
function matchesContact(contact, searchText) {
  return contact.name.toLowerCase().includes(searchText);
}

/**
 * Renders the contact option.
 *
 * @param {Object} contact - The contact to process.
 * @returns {void}
 */
function renderContactOption(contact) {
  const isSelected = selectedContacts.some((item) => item.id === contact.id);
  assignedList.innerHTML += `
    <div class="contactOption ${isSelected ? "selectedContactOption" : ""}"
      data-contact-id="${contact.id}">
      <div class="contactAvatar" style="background:${contact.color}">
        ${contact.initials || getInitials(contact.name)}
      </div>
      <span>${contact.name}</span>
      <input class="contactCheckbox" type="checkbox"
        aria-label="Select ${contact.name}" ${isSelected ? "checked" : ""}>
    </div>`;
}

/**
 * Initializes the contact option events.
 *
 * @returns {void}
 */
function initContactOptionEvents() {
  document.querySelectorAll(".contactOption").forEach((option) => {
    option.addEventListener("click", (event) => selectContactOption(event, option));
  });
}

/**
 * Selects the contact option.
 *
 * @param {Event} event - The event that triggered the operation.
 * @param {HTMLElement} option - The selected option element.
 * @returns {void}
 */
function selectContactOption(event, option) {
  event.stopPropagation();
  toggleContact(option.dataset.contactId);
  assignedInput.value = "";
  assignedInput.focus();
  assignedList.classList.remove("d_none");
  renderContacts();
}

/**
 * Toggles the contact.
 *
 * @param {string} contactId - The ID of the contact.
 * @returns {void}
 */
function toggleContact(contactId) {
  const contact = contacts.find((item) => item.id === contactId);
  if (!contact) return;
  const isSelected = selectedContacts.some((item) => item.id === contactId);
  selectedContacts = isSelected
    ? selectedContacts.filter((item) => item.id !== contactId)
    : [...selectedContacts, contact];
  renderContacts();
  renderSelectedContacts();
}

/**
 * Renders the selected contacts.
 *
 * @returns {void}
 */
function renderSelectedContacts() {
  selectedContactsContainer.innerHTML = "";
  moreContactsDropdown.innerHTML = "";
  moreContactsDropdown.classList.add("d_none");
  const visibleContacts = selectedContacts.slice(0, 3);
  const hiddenContacts = selectedContacts.slice(3);
  visibleContacts.forEach(renderSelectedAvatar);
  if (hiddenContacts.length) renderHiddenContacts(hiddenContacts);
}

/**
 * Renders the selected avatar.
 *
 * @param {Object} contact - The contact to process.
 * @returns {void}
 */
function renderSelectedAvatar(contact) {
  selectedContactsContainer.innerHTML += `
      <div class="selectedAvatar" style="background:${contact.color}" title="${contact.name}">
        ${contact.initials || getInitials(contact.name)}
      </div>
    `;
}

/**
 * Renders the hidden contacts.
 *
 * @param {Object[]} hiddenContacts - The contacts displayed in the additional-contacts dropdown.
 * @returns {void}
 */
function renderHiddenContacts(hiddenContacts) {
  selectedContactsContainer.innerHTML += `
      <button type="button" class="moreContactsBtn" id="moreContactsBtn">
        +${hiddenContacts.length}
      </button>
    `;
  hiddenContacts.forEach(renderHiddenContact);
  document.getElementById("moreContactsBtn")
    .addEventListener("click", toggleMoreContacts);
}

/**
 * Renders the hidden contact.
 *
 * @param {Object} contact - The contact to process.
 * @returns {void}
 */
function renderHiddenContact(contact) {
  moreContactsDropdown.innerHTML += `
        <div class="moreContactItem">
          <div class="selectedAvatar" style="background:${contact.color}">
            ${contact.initials || getInitials(contact.name)}
          </div>
          <span>${contact.name}</span>
        </div>
      `;
}

/**
 * Toggles the dropdown containing additional selected contacts.
 *
 * @param {Event} event - The event that triggered the operation.
 * @returns {void}
 */
function toggleMoreContacts(event) {
  event.stopPropagation();
  moreContactsDropdown.classList.toggle("d_none");
}

/**
 * Initializes the subtasks.
 *
 * @returns {void}
 */
function initSubtasks() {
  subtaskInput.addEventListener("keydown", handleSubtaskEnter);
  addSubtaskBtn.addEventListener("click", addCurrentSubtaskInput);
  clearSubtaskBtn.addEventListener("click", clearSubtaskInput);
  document.addEventListener("click", closeSubtasksOnOutsideClick);
}

/**
 * Handles the subtask enter.
 *
 * @param {Event} event - The event that triggered the operation.
 * @returns {void}
 */
function handleSubtaskEnter(event) {
  if (event.key !== "Enter") return;
  event.preventDefault();
  addCurrentSubtaskInput();
}

/**
 * Clears the subtask input.
 *
 * @returns {void}
 */
function clearSubtaskInput() {
  subtaskInput.value = "";
  subtaskInput.focus();
  toggleInputFocus(subtaskInput);
}

/**
 * Closes the additional-subtasks dropdown after an outside click.
 *
 * @param {Event} event - The event that triggered the operation.
 * @returns {void}
 */
function closeSubtasksOnOutsideClick(event) {
  if (!event.target.closest(".subtasksWrapper")) {
    moreSubtasksDropdown.classList.add("d_none");
  }
}

/**
 * Renders the subtasks.
 *
 * @returns {void}
 */
function renderSubtasks() {
  subtaskList.innerHTML = "";
  moreSubtasksDropdown.innerHTML = "";
  moreSubtasksDropdown.classList.add("d_none");
  const visibleSubtasks = subtasks.slice(0, 4);
  const hiddenSubtasks = subtasks.slice(4);
  visibleSubtasks.forEach(renderVisibleSubtask);
  if (hiddenSubtasks.length) renderHiddenSubtasks(hiddenSubtasks);
  initSubtaskItemButtons();
}

/**
 * Renders the visible subtask.
 *
 * @param {Object} subtask - The subtask to process.
 * @param {number} index - The item's position in its list.
 * @returns {void}
 */
function renderVisibleSubtask(subtask, index) {
  subtaskList.innerHTML += `
    <li class="subtaskItem">
      <span class="subtaskText">• ${subtask.title}</span>
      ${getSubtaskActionsTemplate(index)}
    </li>
  `;
}

/**
 * Renders the hidden subtasks.
 *
 * @param {Object[]} hiddenSubtasks - The subtasks displayed in the additional-subtasks dropdown.
 * @returns {void}
 */
function renderHiddenSubtasks(hiddenSubtasks) {
  subtaskList.innerHTML += `
      <li>
        <button type="button" class="moreSubtasksBtn" id="moreSubtasksBtn">
          +${hiddenSubtasks.length}
        </button>
      </li>
    `;
  hiddenSubtasks.forEach(renderHiddenSubtask);
  document.getElementById("moreSubtasksBtn")
    .addEventListener("click", toggleMoreSubtasks);
}

/**
 * Renders the hidden subtask.
 *
 * @param {Object} subtask - The subtask to process.
 * @param {number} index - The item's position in its list.
 * @returns {void}
 */
function renderHiddenSubtask(subtask, index) {
  const realIndex = index + 4;
  moreSubtasksDropdown.innerHTML += `
    <div class="moreSubtaskItem">
      <span class="moreSubtaskText">• ${subtask.title}</span>
      ${getSubtaskActionsTemplate(realIndex)}
    </div>
  `;
}

/**
 * Retrieves the subtask actions template.
 *
 * @param {number} index - The item's position in its list.
 * @returns {string} The generated value or HTML markup.
 */
function getSubtaskActionsTemplate(index) {
  return `
    <div class="subtaskItemActions">
      <button type="button" class="editSubtaskBtn" data-index="${index}">
        <img src="./assets/img/Subtasks change.svg" alt="Edit subtask" />
      </button>
      <button type="button" class="deleteSubtaskBtn" data-index="${index}">
        <img src="./assets/img/SubTask delete.svg" alt="Delete subtask" />
      </button>
    </div>`;
}

/**
 * Toggles the more subtasks.
 *
 * @param {Event} event - The event that triggered the operation.
 * @returns {void}
 */
function toggleMoreSubtasks(event) {
  event.stopPropagation();
  moreSubtasksDropdown.classList.toggle("d_none");
}

/**
 * Initializes the subtask item buttons.
 *
 * @returns {void}
 */
function initSubtaskItemButtons() {
  initIndexedButtons(".deleteSubtaskBtn", deleteSubtask);
  initIndexedButtons(".editSubtaskBtn", editSubtask);
}

/**
 * Initializes the indexed buttons.
 *
 * @param {string} selector - The selector used to find elements.
 * @param {Function} handler - The callback to register.
 * @returns {void}
 */
function initIndexedButtons(selector, handler) {
  document.querySelectorAll(selector).forEach((button) => {
    button.addEventListener("click", () => handler(Number(button.dataset.index)));
  });
}

/**
 * Deletes the subtask.
 *
 * @param {number} index - The item's position in its list.
 * @returns {void}
 */
function deleteSubtask(index) {
  subtasks.splice(index, 1);
  renderSubtasks();
}

/**
 * Moves a subtask into the input so it can be edited.
 *
 * @param {number} index - The item's position in its list.
 * @returns {void}
 */
function editSubtask(index) {
  subtaskInput.value = subtasks[index].title;
  subtasks.splice(index, 1);
  renderSubtasks();
  subtaskInput.focus();
  toggleInputFocus(subtaskInput);
}

/**
 * Generates uppercase initials from the first two parts of a name.
 *
 * @param {string} name - The name used to generate the initials.
 * @returns {string} The generated value or HTML markup.
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
 * Selects an avatar color based on an item's position.
 *
 * @param {number} index - The item's position in its list.
 * @returns {string} The generated value or HTML markup.
 */
function getAvatarColor(index) {
  const colors = [
    "#9327ff",
    "#ff7a00",
    "#fc71ff",
    "#6e52ff",
    "#1fd7c1",
    "#ffbb2b",
  ];
  return colors[index % colors.length];
}

/**
 * Resets the form state.
 *
 * @returns {void}
 */
function resetFormState() {
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
function clearInputError(input, errorElement) {
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
function handleInputChange(input, errorElement) {
  clearInputError(input, errorElement);
  toggleInputFocus(input);
}

/**
 * Toggles the input focus.
 *
 * @param {HTMLElement} input - The input element to process.
 * @returns {void}
 */
function toggleInputFocus(input) {
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
function clearAllErrors() {
  clearInputError(taskTitle, taskTitleError);
  clearInputError(taskDate, taskDateError);
  clearInputError(categoryButton, categoryError);
}

/**
 * Displays the task added overlay.
 *
 * @returns {void}
 */
function showTaskAddedOverlay() {
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
function initAddTaskBlurValidation() {
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
