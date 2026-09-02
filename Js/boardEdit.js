import { patchData } from "./storage.js";

let boardEditContext = null;

/**
 * Initializes the edit task form.
 *
 * @param {Object} task - The task to process.
 * @param {Object} context - The board data and callbacks used by the edit form.
 * @returns {void}
 */
export function initEditTaskForm(task, context) {
  boardEditContext = context;
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
    contacts: boardEditContext.enrichAssignedContacts(task.assignedTo || []),
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
  boardEditContext.updateTaskInBoardTasks(taskId, updatedTask);
  boardEditContext.updateFilteredTasks();
  boardEditContext.closeTaskDetailOverlay();
  boardEditContext.renderBoardTasks();
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

/**
 * Initializes the edit priority buttons.
 *
 * @param {Function} onChange - The callback invoked after the value changes.
 * @returns {void}
 */
function initEditPriorityButtons(onChange) {
  document.querySelectorAll(".editPriorityBtn").forEach((button) => {
    button.addEventListener("click", () => selectEditPriority(button, onChange));
  });
}

/**
 * Selects the edit priority.
 *
 * @param {HTMLElement} button - The button involved in the operation.
 * @param {Function} onChange - The callback invoked after the value changes.
 * @returns {void}
 */
function selectEditPriority(button, onChange) {
  clearEditPriorityButtons();
  const priority = button.dataset.priority;
  const activeClasses = {
    urgent: "activeUrgent", medium: "activeMedium", low: "activeLow",
  };
  if (activeClasses[priority]) button.classList.add(activeClasses[priority]);
  onChange(priority);
}

/**
 * Clears the edit priority buttons.
 *
 * @returns {void}
 */
function clearEditPriorityButtons() {
  document.querySelectorAll(".editPriorityBtn").forEach((button) => {
    button.classList.remove("activeUrgent", "activeMedium", "activeLow");
  });
}

/**
 * Initializes the edit assigned contacts.
 *
 * @param {Object[]} selectedEditContacts - The contacts selected in the edit form.
 * @param {Function} onChange - The callback invoked after the value changes.
 * @returns {void}
 */
function initEditAssignedContacts(selectedEditContacts, onChange) {
  const elements = getEditAssignedElements();
  if (!elements) return;

  renderEditAssignedContacts(selectedEditContacts);
  initEditAssignedInputEvents(elements, selectedEditContacts, onChange);
  initEditAssignedDocumentClick(elements.editAssignedList);
}

/**
 * Retrieves the edit assigned elements.
 *
 * @returns {Object} The generated data object.
 */
function getEditAssignedElements() {
  const editAssignedInput = document.getElementById("editAssignedInput");
  const editAssignedList = document.getElementById("editAssignedList");

  if (!editAssignedInput || !editAssignedList) return null;

  return { editAssignedInput, editAssignedList };
}

/**
 * Initializes the edit assigned input events.
 *
 * @param {Object} elements - The elements required by the operation.
 * @param {Object[]} selectedEditContacts - The contacts selected in the edit form.
 * @param {Function} onChange - The callback invoked after the value changes.
 * @returns {void}
 */
function initEditAssignedInputEvents(elements, selectedEditContacts, onChange) {
  elements.editAssignedInput.addEventListener("focus", () => {
    showEditAssignedList(elements.editAssignedList);
    renderEditContactOptions(selectedEditContacts, onChange);
  });

  elements.editAssignedInput.addEventListener("input", () => {
    renderEditContactOptions(selectedEditContacts, onChange);
  });
}

/**
 * Displays the edit assigned list.
 *
 * @param {HTMLElement} editAssignedList - The assigned-contact list to display.
 * @returns {void}
 */
function showEditAssignedList(editAssignedList) {
  editAssignedList.classList.remove("d_none");
}

/**
 * Initializes document clicks that close assigned-contact dropdowns.
 *
 * @param {HTMLElement} editAssignedList - The assigned-contact list controlled by document clicks.
 * @returns {void}
 */
function initEditAssignedDocumentClick(editAssignedList) {
  document.addEventListener("click", (event) => {
    closeEditAssignedListOnOutsideClick(event, editAssignedList);
    closeEditMoreContactsOnOutsideClick(event);
  });
}

/**
 * Closes the edit assigned list on outside click.
 *
 * @param {Event} event - The event that triggered the operation.
 * @param {HTMLElement} editAssignedList - The assigned-contact list to close.
 * @returns {void}
 */
function closeEditAssignedListOnOutsideClick(event, editAssignedList) {
  const clickedInsideDropdown = event.target.closest("#editAssignedDropdown");

  if (!clickedInsideDropdown) {
    editAssignedList.classList.add("d_none");
  }
}

/**
 * Closes the edit more contacts on outside click.
 *
 * @param {Event} event - The event that triggered the operation.
 * @returns {void}
 */
function closeEditMoreContactsOnOutsideClick(event) {
  const clickedInsideSelected = event.target.closest(".selectedContactsWrapper");

  if (clickedInsideSelected) return;

  const dropdown = document.getElementById("editMoreContactsDropdown");
  if (dropdown) dropdown.classList.add("d_none");
}



/**
 * Renders the edit contact options.
 *
 * @param {Object[]} selectedEditContacts - The contacts selected in the edit form.
 * @param {Function} onChange - The callback invoked after the value changes.
 * @returns {void}
 */
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

/**
 * Retrieves the edit contact option template.
 *
 * @param {Object} contact - The contact to process.
 * @param {number} index - The item's position in its list.
 * @param {Object[]} selectedContacts - The currently selected contacts.
 * @returns {string} The generated value or HTML markup.
 */
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

/**
 * Initializes the edit contact option events.
 *
 * @param {Object[]} selectedContacts - The currently selected contacts.
 * @param {Function} onChange - The callback invoked after the value changes.
 * @returns {void}
 */
function initEditContactOptionEvents(selectedContacts, onChange) {
  document.querySelectorAll("#editAssignedList .contactOption").forEach(option => {
    option.addEventListener("click", event => {
      handleEditContactOption(event, option, selectedContacts, onChange);
    });
  });
}

/**
 * Handles the edit contact option.
 *
 * @param {Event} event - The event that triggered the operation.
 * @param {HTMLElement} option - The selected option element.
 * @param {Object[]} selectedContacts - The currently selected contacts.
 * @param {Function} onChange - The callback invoked after the value changes.
 * @returns {void}
 */
function handleEditContactOption(event, option, selectedContacts, onChange) {
  event.stopPropagation();
  const updatedContacts = toggleEditContact(option.dataset.contactId, selectedContacts);
  if (!updatedContacts) return;
  document.getElementById("editAssignedInput").value = "";
  renderEditAssignedContacts(updatedContacts);
  renderEditContactOptions(updatedContacts, onChange);
  onChange(updatedContacts);
}

/**
 * Adds or removes a contact from the edit form selection.
 *
 * @param {string} contactId - The ID of the contact.
 * @param {Object[]} selectedContacts - The currently selected contacts.
 * @returns {Object[]|null} The updated contacts, or null when the contact is not found.
 */
function toggleEditContact(contactId, selectedContacts) {
  const contact = boardEditContext.contacts.find(item => item.id === contactId);
  if (!contact) return null;
  const isSelected = selectedContacts.some(item => item.id === contactId);
  return isSelected
    ? selectedContacts.filter(item => item.id !== contactId)
    : [...selectedContacts, contact];
}

/**
 * Initializes the edit subtasks.
 *
 * @param {Object[]} editSubtasks - The edit form subtasks to process.
 * @param {Function} onChange - The callback invoked after the value changes.
 * @returns {void}
 */
function initEditSubtasks(editSubtasks, onChange) {
  const state = createEditSubtaskState(editSubtasks, onChange);
  renderEditSubtaskState(state);
  bindEditSubtaskStateEvents(state);
}

/**
 * Creates the edit subtask state.
 *
 * @param {Object[]} editSubtasks - The edit form subtasks to process.
 * @param {Function} onChange - The callback invoked after the value changes.
 * @returns {Object} The generated data object.
 */
function createEditSubtaskState(editSubtasks, onChange) {
  return {
    subtasks: editSubtasks, onChange, editingIndex: null,
    input: document.getElementById("editSubtaskInput"),
    addButton: document.getElementById("editAddSubtaskBtn"),
    clearButton: document.getElementById("editClearSubtaskBtn"),
  };
}

/**
 * Renders the edit subtask state.
 *
 * @param {Object} state - The current edit form state.
 * @returns {void}
 */
function renderEditSubtaskState(state) {
  const setEditing = index => state.editingIndex = index;
  renderEditSubtasks(state.subtasks, state.onChange, setEditing);
}

/**
 * Binds the edit subtask state events.
 *
 * @param {Object} state - The current edit form state.
 * @returns {void}
 */
function bindEditSubtaskStateEvents(state) {
  state.input.addEventListener("keydown", event => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    saveEditSubtaskState(state);
  });
  state.addButton.addEventListener("click", () => saveEditSubtaskState(state));
  state.clearButton.addEventListener("click", () => resetEditSubtaskState(state));
}

/**
 * Saves the edit subtask state.
 *
 * @param {Object} state - The current edit form state.
 * @returns {void}
 */
function saveEditSubtaskState(state) {
  state.editingIndex = addOrUpdateEditSubtask(state.subtasks, state.editingIndex);
  renderEditSubtaskState(state);
  state.onChange(state.subtasks);
}

/**
 * Resets the edit subtask state.
 *
 * @param {Object} state - The current edit form state.
 * @returns {void}
 */
function resetEditSubtaskState(state) {
  state.input.value = "";
  state.editingIndex = null;
  state.input.focus();
}

/**
 * Adds a new subtask or updates the subtask currently being edited.
 *
 * @param {Object[]} editSubtasks - The edit form subtasks to process.
 * @param {number|null} editingIndex - The index of the edited subtask, or null when adding one.
 * @returns {number|null} The active edit index, or null after saving.
 */
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

/**
 * Adds the edit subtask.
 *
 * @param {Object[]} editSubtasks - The edit form subtasks to process.
 * @param {Function} onChange - The callback invoked after the value changes.
 * @returns {void}
 */
function addEditSubtask(editSubtasks, onChange) {
  const editSubtaskInput = document.getElementById("editSubtaskInput");
  const subtaskText = editSubtaskInput.value.trim();
  if (!subtaskText) return;
  editSubtasks.push({ title: subtaskText, done: false });
  editSubtaskInput.value = "";
  renderEditSubtasks(editSubtasks, onChange);
  onChange(editSubtasks);
}

/**
 * Renders the edit subtasks.
 *
 * @param {Object[]} editSubtasks - The edit form subtasks to process.
 * @param {Function} onChange - The callback invoked after the value changes.
 * @param {Function} onEdit - The callback invoked when editing starts.
 * @returns {void}
 */
function renderEditSubtasks(editSubtasks, onChange, onEdit) {
  const editSubtaskList = document.getElementById("editSubtaskList");
  editSubtaskList.innerHTML = editSubtasks.map(getEditSubtaskItemTemplate).join("");
  initEditSubtaskButtons(editSubtasks, onChange, onEdit);
}

/**
 * Retrieves the edit subtask item template.
 *
 * @param {Object} subtask - The subtask to process.
 * @param {number} index - The item's position in its list.
 * @returns {string} The generated value or HTML markup.
 */
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

/**
 * Initializes the edit subtask buttons.
 *
 * @param {Object[]} editSubtasks - The edit form subtasks to process.
 * @param {Function} onChange - The callback invoked after the value changes.
 * @param {Function} onEdit - The callback invoked when editing starts.
 * @returns {void}
 */
function initEditSubtaskButtons(editSubtasks, onChange, onEdit) {
  initEditSubtaskDeleteButtons(editSubtasks, onChange, onEdit);
  initEditSubtaskEditButtons(editSubtasks, onEdit);
}

/**
 * Initializes the edit subtask delete buttons.
 *
 * @param {Object[]} editSubtasks - The edit form subtasks to process.
 * @param {Function} onChange - The callback invoked after the value changes.
 * @param {Function} onEdit - The callback invoked when editing starts.
 * @returns {void}
 */
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

/**
 * Initializes the edit subtask edit buttons.
 *
 * @param {Object[]} editSubtasks - The edit form subtasks to process.
 * @param {Function} onEdit - The callback invoked when editing starts.
 * @returns {void}
 */
function initEditSubtaskEditButtons(editSubtasks, onEdit) {
  document.querySelectorAll("#editSubtaskList .editSubtaskBtn")
    .forEach(button => {
      button.addEventListener("click", () => editSelectedSubtask(button,
        editSubtasks, onEdit));
    });
}

/**
 * Loads the selected subtask into the input for editing.
 *
 * @param {HTMLElement} button - The button involved in the operation.
 * @param {Object[]} editSubtasks - The edit form subtasks to process.
 * @param {Function} onEdit - The callback invoked when editing starts.
 * @returns {void}
 */
function editSelectedSubtask(button, editSubtasks, onEdit) {
  const index = Number(button.dataset.index);
  const input = document.getElementById("editSubtaskInput");
  input.value = editSubtasks[index].title;
  input.focus();
  onEdit(index);
}

/**
 * Renders the edit assigned contacts.
 *
 * @param {Object[]} selectedEditContacts - The contacts selected in the edit form.
 * @returns {void}
 */
function renderEditAssignedContacts(selectedEditContacts) {
  const elements = getEditAssignedContactElements();
  if (!elements) return;

  resetEditAssignedContacts(elements);
  renderVisibleEditContacts(selectedEditContacts, elements.editSelectedContacts);
  renderHiddenEditContacts(selectedEditContacts, elements);
}

/**
 * Retrieves the edit assigned contact elements.
 *
 * @returns {Object} The generated data object.
 */
function getEditAssignedContactElements() {
  const editSelectedContacts = document.getElementById("editSelectedContacts");
  const editMoreContactsDropdown = document.getElementById(
    "editMoreContactsDropdown",
  );

  if (!editSelectedContacts || !editMoreContactsDropdown) return null;

  return { editSelectedContacts, editMoreContactsDropdown };
}

/**
 * Resets the edit assigned contacts.
 *
 * @param {Object} elements - The elements required by the operation.
 * @returns {void}
 */
function resetEditAssignedContacts(elements) {
  elements.editSelectedContacts.innerHTML = "";
  elements.editMoreContactsDropdown.innerHTML = "";
  elements.editMoreContactsDropdown.classList.add("d_none");
}

/**
 * Renders the visible edit contacts.
 *
 * @param {Object[]} selectedEditContacts - The contacts selected in the edit form.
 * @param {HTMLElement} editSelectedContacts - The container for selected contact avatars.
 * @returns {void}
 */
function renderVisibleEditContacts(selectedEditContacts, editSelectedContacts) {
  const visibleContacts = selectedEditContacts.slice(0, 3);

  visibleContacts.forEach((contact, index) => {
    editSelectedContacts.innerHTML += getVisibleEditContactTemplate(
      contact,
      index,
    );
  });
}

/**
 * Retrieves the visible edit contact template.
 *
 * @param {Object} contact - The contact to process.
 * @param {number} index - The item's position in its list.
 * @returns {string} The generated value or HTML markup.
 */
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

/**
 * Renders the hidden edit contacts.
 *
 * @param {Object[]} selectedEditContacts - The contacts selected in the edit form.
 * @param {Object} elements - The elements required by the operation.
 * @returns {void}
 */
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

/**
 * Renders the edit more contacts button.
 *
 * @param {Object[]} hiddenContacts - The contacts hidden behind the more button.
 * @param {HTMLElement} editSelectedContacts - The container for selected contact avatars.
 * @returns {void}
 */
function renderEditMoreContactsButton(hiddenContacts, editSelectedContacts) {
  editSelectedContacts.innerHTML += `
    <button type="button" class="moreContactsBtn" id="editMoreContactsBtn">
      +${hiddenContacts.length}
    </button>
  `;
}

/**
 * Renders the edit more contacts dropdown.
 *
 * @param {Object[]} hiddenContacts - The contacts to render in the dropdown.
 * @param {HTMLElement} dropdown - The dropdown element to update.
 * @returns {void}
 */
function renderEditMoreContactsDropdown(hiddenContacts, dropdown) {
  hiddenContacts.forEach((contact) => {
    dropdown.innerHTML += getEditMoreContactTemplate(contact);
  });
}

/**
 * Retrieves the edit more contact template.
 *
 * @param {Object} contact - The contact to process.
 * @returns {string} The generated value or HTML markup.
 */
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

/**
 * Initializes the edit more contacts button.
 *
 * @param {HTMLElement} editMoreContactsDropdown - The dropdown containing additional contacts.
 * @returns {void}
 */
function initEditMoreContactsButton(editMoreContactsDropdown) {
  const editMoreContactsBtn = document.getElementById("editMoreContactsBtn");

  if (!editMoreContactsBtn) return;

  editMoreContactsBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    editMoreContactsDropdown.classList.toggle("d_none");
  });
}
