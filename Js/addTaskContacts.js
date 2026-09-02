import { clearInputError } from "./addTaskForm.js";
import { getInitials, getAvatarColor } from "./addTaskSubtasks.js";

/**
 * Initializes the priority buttons in the add task form.
 *
 * @returns {void}
 */
export function initPriorityButtons() {
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
export function initCategoryDropdown() {
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
export function initAssignedDropdown() {
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
export async function loadContacts() {
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
export function renderContacts() {
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
export function renderSelectedContacts() {
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
