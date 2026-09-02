import { boardEditState } from "./boardEditState.js";

/**
 * Initializes editable subtasks and their controls.
 *
 * @param {Object[]} editSubtasks - The editable subtasks to initialize.
 * @param {Function} onChange - The callback invoked after the value changes.
 * @returns {void}
 */
export function initEditSubtasks(editSubtasks, onChange) {
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
export function renderEditAssignedContacts(selectedEditContacts) {
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
  const color = contact.color || boardEditState.context.getAvatarColor(index);
  const name = contact.name || "";
  const initials = contact.initials || boardEditState.context.getInitials(contact.name);

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
  const initials = contact.initials || boardEditState.context.getInitials(contact.name);
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
