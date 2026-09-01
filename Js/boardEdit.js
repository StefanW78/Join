import { patchData } from "./storage.js";

let boardEditContext = null;

export function initEditTaskForm(task, context) {
  boardEditContext = context;
  const state = createEditFormState(task);
  initEditFormControls(state);
  initEditValidationEvents();
  bindEditFormSubmit(task.id, state);
}

function createEditFormState(task) {
  return {
    priority: task.priority || "medium",
    contacts: boardEditContext.enrichAssignedContacts(task.assignedTo || []),
    subtasks: [...(task.subtasks || [])],
  };
}

function initEditFormControls(state) {
  document.getElementById("closeEditTaskOverlayBtn")
    .addEventListener("click", boardEditContext.closeTaskDetailOverlay);
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
  boardEditContext.updateTaskInBoardTasks(taskId, updatedTask);
  boardEditContext.updateFilteredTasks();
  boardEditContext.closeTaskDetailOverlay();
  boardEditContext.renderBoardTasks();
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
  const filtered = boardEditContext.contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchText));
  list.innerHTML = filtered.map((contact, index) =>
    getEditContactOptionTemplate(contact, index, selectedEditContacts)).join("");
  initEditContactOptionEvents(selectedEditContacts, onChange);
}

function getEditContactOptionTemplate(contact, index, selectedContacts) {
  const isSelected = selectedContacts.some(item => item.id === contact.id);
  const color = contact.color || boardEditContext.getAvatarColor(index);
  return `<div class="contactOption ${isSelected ? "selectedContactOption" : ""}"
    data-contact-id="${contact.id}">
    <div class="contactAvatar" style="background:${color}">
      ${contact.initials || boardEditContext.getInitials(contact.name)}
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
  const contact = boardEditContext.contacts.find(item => item.id === contactId);
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
  const color = contact.color || boardEditContext.getAvatarColor(index);
  const name = contact.name || "";
  const initials = contact.initials || boardEditContext.getInitials(contact.name);

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
  const initials = contact.initials || boardEditContext.getInitials(contact.name);
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
