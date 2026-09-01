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

function validateTaskDate() {
  clearInputError(taskDate, taskDateError);
  const dateValue = taskDate.value;
  if (!dateValue) return rejectTaskDate("This field is required");
  if (dateValue < getTodayISO()) {
    return rejectTaskDate("The due date cannot be in the past.");
  }
  return true;
}

function rejectTaskDate(message) {
  setInputError(taskDate, taskDateError, message);
  return false;
}

function initTaskDate() {
  taskDate.min = getTodayISO();

  taskDate.addEventListener("input", () => {
    handleInputChange(taskDate, taskDateError);
  });

  taskDate.addEventListener("blur", validateTaskDate);
}

function getTodayISO() {
  const today = new Date();
  const timezoneOffset = today.getTimezoneOffset() * 60000;
  const localDate = new Date(today.getTime() - timezoneOffset);

  return localDate.toISOString().split("T")[0];
}

taskForm.addEventListener("submit", handleTaskSubmit);

async function handleTaskSubmit(event) {
  event.preventDefault();

  if (!isTaskFormValid()) return;

  addCurrentSubtaskInput();

  const task = createTaskFromForm();
  await saveTask(task);
}

function isTaskFormValid() {
  clearAllErrors();

  return (
    validateTaskTitle() &&
    validateTaskDate() &&
    validateTaskCategory() &&
    validateCurrentUser()
  );
}

function validateTaskTitle() {
  if (taskTitle.value.trim()) {
    clearInputError(taskTitle, taskTitleError);
    return true;
  }

  setInputError(taskTitle, taskTitleError, "This field is required");
  return false;
}

function validateTaskCategory() {
  if (selectedCategory) {
    clearInputError(categoryButton, categoryError);
    return true;
  }

  setInputError(categoryButton, categoryError, "This field is required");
  return false;
}

function validateCurrentUser() {
  if (currentUser) return true;

  console.error("Kein User eingeloggt!");
  return false;
}

function createTaskFromForm() {
  return {
    ...getTaskFormValues(),
    ...getTaskUserData(),
    ...getTaskDefaultData(),
  };
}

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

function formatDateForDisplay(dateValue) {
  if (!dateValue) return "";

  const [year, month, day] = dateValue.split("-");

  return `${day}/${month}/${year}`;
}

function getTaskUserData() {
  return {
    createdBy: currentUser.id || currentUser.uid || "guest",
  };
}

function getTaskDefaultData() {
  return {
    status: "todo",
    createdAt: Date.now(),
  };
}

async function saveTask(task) {
  try {
    const result = await postData("tasks", task);
    handleTaskSaveSuccess(result);
  } catch (error) {
    console.error("Fehler beim Speichern:", error);
  }
}

function handleTaskSaveSuccess(result) {
  console.log("Task gespeichert mit ID:", result.name);

  showTaskAddedOverlay();
  resetFormState();
  redirectToBoardAfterDelay();
}

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

function initPriorityButtons() {
  const priorityButtons = document.querySelectorAll(".priorityBtn");
  priorityButtons.forEach((button) => {
    button.addEventListener("click", () => selectPriority(button, priorityButtons));
  });
}

function selectPriority(button, priorityButtons) {
  clearPrioritySelection(priorityButtons);
  const priority = getButtonPriority(button);
  if (!priority) return;
  selectedPriority = priority;
  button.classList.add(`active${capitalize(priority)}`);
}

function clearPrioritySelection(priorityButtons) {
  priorityButtons.forEach((button) => {
    button.classList.remove("activeUrgent", "activeMedium", "activeLow");
  });
}

function getButtonPriority(button) {
  if (button.classList.contains("urgentBtn")) return "urgent";
  if (button.classList.contains("mediumBtn")) return "medium";
  if (button.classList.contains("lowBtn")) return "low";
  return "";
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function initCategoryDropdown() {
  categoryButton.addEventListener("click", toggleCategoryDropdown);
  document.querySelectorAll("[data-category]").forEach((option) => {
    option.addEventListener("click", () => selectCategory(option));
  });
}

function toggleCategoryDropdown() {
  categoryList.classList.toggle("d_none");
  const isClosed = categoryList.classList.contains("d_none");
  categoryArrow.src = isClosed
    ? "./assets/img/arrow_drop_down-icon.svg"
    : "./assets/img/arrowUup.svg";
}

function selectCategory(option) {
  selectedCategory = option.dataset.category;
  categoryButton.textContent = selectedCategory;
  categoryList.classList.add("d_none");
  categoryArrow.src = "./assets/img/arrow_drop_down-icon.svg";
  clearInputError(categoryButton, categoryError);
  categoryButton.classList.add("inputFocus");
}

function initAssignedDropdown() {
  assignedInput.addEventListener("focus", openAssignedDropdown);
  assignedInput.addEventListener("input", renderContacts);
  document.addEventListener("click", handleAssignedOutsideClick);
}

function openAssignedDropdown() {
  assignedList.classList.remove("d_none");
  assignedArrow.src = "./assets/img/arrowUup.svg";
  renderContacts();
}

function handleAssignedOutsideClick(event) {
  if (!event.target.closest("#assignedDropdown")) closeAssignedDropdown();
  if (!event.target.closest(".selectedContactsWrapper")) {
    moreContactsDropdown.classList.add("d_none");
  }
}

function closeAssignedDropdown() {
  assignedList.classList.add("d_none");
  assignedArrow.src = "./assets/img/arrow_drop_down-icon.svg";
}

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

async function getOrCreateContactColor(id, color, index) {
  if (color) return color;
  const generatedColor = getAvatarColor(index);
  await patchData(`users/${id}`, { color: generatedColor });
  return generatedColor;
}

function renderContacts() {
  assignedList.innerHTML = "";
  const searchText = assignedInput.value.trim().toLowerCase();
  contacts.filter((contact) => matchesContact(contact, searchText))
    .forEach(renderContactOption);
  initContactOptionEvents();
}

function matchesContact(contact, searchText) {
  return contact.name.toLowerCase().includes(searchText);
}

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

function initContactOptionEvents() {
  document.querySelectorAll(".contactOption").forEach((option) => {
    option.addEventListener("click", (event) => selectContactOption(event, option));
  });
}

function selectContactOption(event, option) {
  event.stopPropagation();
  toggleContact(option.dataset.contactId);
  assignedInput.value = "";
  assignedInput.focus();
  assignedList.classList.remove("d_none");
  renderContacts();
}

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

function renderSelectedContacts() {
  selectedContactsContainer.innerHTML = "";
  moreContactsDropdown.innerHTML = "";
  moreContactsDropdown.classList.add("d_none");
  const visibleContacts = selectedContacts.slice(0, 3);
  const hiddenContacts = selectedContacts.slice(3);
  visibleContacts.forEach(renderSelectedAvatar);
  if (hiddenContacts.length) renderHiddenContacts(hiddenContacts);
}

function renderSelectedAvatar(contact) {
  selectedContactsContainer.innerHTML += `
      <div class="selectedAvatar" style="background:${contact.color}" title="${contact.name}">
        ${contact.initials || getInitials(contact.name)}
      </div>
    `;
}

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

function toggleMoreContacts(event) {
  event.stopPropagation();
  moreContactsDropdown.classList.toggle("d_none");
}

function initSubtasks() {
  subtaskInput.addEventListener("keydown", handleSubtaskEnter);
  addSubtaskBtn.addEventListener("click", addCurrentSubtaskInput);
  clearSubtaskBtn.addEventListener("click", clearSubtaskInput);
  document.addEventListener("click", closeSubtasksOnOutsideClick);
}

function handleSubtaskEnter(event) {
  if (event.key !== "Enter") return;
  event.preventDefault();
  addCurrentSubtaskInput();
}

function clearSubtaskInput() {
  subtaskInput.value = "";
  subtaskInput.focus();
  toggleInputFocus(subtaskInput);
}

function closeSubtasksOnOutsideClick(event) {
  if (!event.target.closest(".subtasksWrapper")) {
    moreSubtasksDropdown.classList.add("d_none");
  }
}

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

function renderVisibleSubtask(subtask, index) {
  subtaskList.innerHTML += `
    <li class="subtaskItem">
      <span class="subtaskText">• ${subtask.title}</span>
      ${getSubtaskActionsTemplate(index)}
    </li>
  `;
}

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

function renderHiddenSubtask(subtask, index) {
  const realIndex = index + 4;
  moreSubtasksDropdown.innerHTML += `
    <div class="moreSubtaskItem">
      <span class="moreSubtaskText">• ${subtask.title}</span>
      ${getSubtaskActionsTemplate(realIndex)}
    </div>
  `;
}

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

function toggleMoreSubtasks(event) {
  event.stopPropagation();
  moreSubtasksDropdown.classList.toggle("d_none");
}

function initSubtaskItemButtons() {
  initIndexedButtons(".deleteSubtaskBtn", deleteSubtask);
  initIndexedButtons(".editSubtaskBtn", editSubtask);
}

function initIndexedButtons(selector, handler) {
  document.querySelectorAll(selector).forEach((button) => {
    button.addEventListener("click", () => handler(Number(button.dataset.index)));
  });
}

function deleteSubtask(index) {
  subtasks.splice(index, 1);
  renderSubtasks();
}

function editSubtask(index) {
  subtaskInput.value = subtasks[index].title;
  subtasks.splice(index, 1);
  renderSubtasks();
  subtaskInput.focus();
  toggleInputFocus(subtaskInput);
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

function resetFormState() {
  resetTaskForm();
  resetTaskValues();
  resetTaskInputs();
  closeTaskDropdowns();
  resetTaskFocusStyles();
  rerenderTaskForm();
  resetPriorityButtons();
}

function resetTaskForm() {
  taskForm.reset();
  clearAllErrors();
}

function resetTaskValues() {
  selectedPriority = "medium";
  selectedCategory = "";
  selectedContacts = [];
  subtasks = [];
}

function resetTaskInputs() {
  categoryButton.textContent = "Select task category";
  assignedInput.value = "";
  subtaskInput.value = "";
}

function closeTaskDropdowns() {
  assignedList.classList.add("d_none");
  moreContactsDropdown.classList.add("d_none");
  moreSubtasksDropdown.classList.add("d_none");
  categoryList.classList.add("d_none");
}

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

function rerenderTaskForm() {
  renderSelectedContacts();
  renderSubtasks();
  renderContacts();
}

function resetPriorityButtons() {
  document.querySelectorAll(".priorityBtn").forEach((btn) => {
    btn.classList.remove("activeUrgent", "activeMedium", "activeLow");
  });

  const mediumBtn = document.querySelector(".mediumBtn");
  if (mediumBtn) mediumBtn.classList.add("activeMedium");
}

function setInputError(input, errorElement, message) {
  input.classList.remove("inputFocus");
  input.classList.add("inputError");
  errorElement.textContent = message;
}

function clearInputError(input, errorElement) {
  input.classList.remove("inputError");
  errorElement.textContent = "";
}

function handleInputChange(input, errorElement) {
  clearInputError(input, errorElement);
  toggleInputFocus(input);
}

function toggleInputFocus(input) {
  if (input.value.trim()) {
    input.classList.add("inputFocus");
  } else {
    input.classList.remove("inputFocus");
  }
}

function clearAllErrors() {
  clearInputError(taskTitle, taskTitleError);
  clearInputError(taskDate, taskDateError);
  clearInputError(categoryButton, categoryError);
}

function showTaskAddedOverlay() {
  taskAddedOverlay.classList.remove("d_none");
  scheduleOverlayClass("show", "add", 10);
  scheduleOverlayClass("show", "remove", 1200);
  scheduleOverlayClass("d_none", "add", 1500);
}

function scheduleOverlayClass(className, action, delay) {
  setTimeout(() => taskAddedOverlay.classList[action](className), delay);
}

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
