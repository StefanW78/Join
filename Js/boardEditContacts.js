import { boardEditState } from "./boardEditState.js";
import { renderEditAssignedContacts } from "./boardEditSubtasks.js";

/**
 * Initializes the priority controls in the edit task form.
 *
 * @param {Function} onChange - The callback invoked after the value changes.
 * @returns {void}
 */
export function initEditPriorityButtons(onChange) {
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
export function initEditAssignedContacts(selectedEditContacts, onChange) {
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
  const filtered = boardEditState.context.contacts.filter(contact =>
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
  const color = contact.color || boardEditState.context.getAvatarColor(index);
  return `<div class="contactOption ${isSelected ? "selectedContactOption" : ""}"
    data-contact-id="${contact.id}">
    <div class="contactAvatar" style="background:${color}">
      ${contact.initials || boardEditState.context.getInitials(contact.name)}
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
  const contact = boardEditState.context.contacts.find(item => item.id === contactId);
  if (!contact) return null;
  const isSelected = selectedContacts.some(item => item.id === contactId);
  return isSelected
    ? selectedContacts.filter(item => item.id !== contactId)
    : [...selectedContacts, contact];
}
