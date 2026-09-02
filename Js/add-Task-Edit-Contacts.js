/**
 * Handles outside clicks by closing the assigned-contact dropdowns.
 *
 * @param {Event} event - The event that triggered the operation.
 * @returns {void}
 */
function handleEditAssignedOutsideClick(event) {
    closeAssignedList(event);
    closeMoreContactsDropdown(event);
}

/**
 * Closes the assigned list.
 *
 * @param {Event} event - The event that triggered the operation.
 * @returns {void}
 */
function closeAssignedList(event) {
    if (!editAssignedList) return;

    if (!event.target.closest("#editAssignedDropdown")) {
        editAssignedList.classList.add("d_none");
    }
}

/**
 * Closes the more contacts dropdown.
 *
 * @param {Event} event - The event that triggered the operation.
 * @returns {void}
 */
function closeMoreContactsDropdown(event) {
    if (event.target.closest(".selectedContactsWrapper")) return;

    const dropdown = document.getElementById("editMoreContactsDropdown");

    if (dropdown) {
        dropdown.classList.add("d_none");
    }
}

/**
 * Renders the edit contact options.
 *
 * @param {Object[]} selectedContacts - The currently selected contacts.
 * @param {Function} onChange - The callback invoked after the value changes.
 * @returns {void}
 */
function renderEditContactOptions(selectedContacts, onChange) {
    const input = document.getElementById("editAssignedInput");
    const list = document.getElementById("editAssignedList");
    const searchText = input.value.trim().toLowerCase();
    list.innerHTML = getFilteredEditContacts(searchText)
        .map(contact => createContactOptionTemplate(contact, selectedContacts))
        .join("");
    registerContactOptionEvents(selectedContacts, onChange);
}

/**
 * Retrieves the filtered edit contacts.
 *
 * @param {string} searchText - The normalized search text.
 * @returns {Object[]} The matching items.
 */
function getFilteredEditContacts(searchText) {
    return contacts.filter(contact =>
        contact.name.toLowerCase().includes(searchText)
    );
}

/**
 * Registers the contact option events.
 *
 * @param {Object[]} selectedContacts - The currently selected contacts.
 * @param {Function} onChange - The callback invoked after the value changes.
 * @returns {void}
 */
function registerContactOptionEvents(selectedContacts, onChange) {
    const options = document.querySelectorAll("#editAssignedList .contactOption");
    options.forEach(option => {
        option.addEventListener("click", event => {
            handleEditContactSelection(event, option, selectedContacts, onChange);
        });
    });
}

/**
 * Handles the edit contact selection.
 *
 * @param {Event} event - The event that triggered the operation.
 * @param {HTMLElement} option - The selected option element.
 * @param {Object[]} selectedContacts - The currently selected contacts.
 * @param {Function} onChange - The callback invoked after the value changes.
 * @returns {void}
 */
function handleEditContactSelection(event, option, selectedContacts, onChange) {
    event.stopPropagation();
    toggleSelectedContact(option.dataset.contactId, selectedContacts);
    document.getElementById("editAssignedInput").value = "";
    renderEditAssignedContacts(selectedContacts);
    renderEditContactOptions(selectedContacts, onChange);
    onChange(selectedContacts);
}

/**
 * Toggles the selected contact.
 *
 * @param {string} contactId - The ID of the contact.
 * @param {Object[]} selectedContacts - The currently selected contacts.
 * @returns {void}
 */
function toggleSelectedContact(contactId, selectedContacts) {
    const index = selectedContacts.findIndex(item => item.id === contactId);
    if (index !== -1) {
        selectedContacts.splice(index, 1);
        return;
    }
    const contact = contacts.find(item => item.id === contactId);
    if (contact) selectedContacts.push(contact);
}

/**
 * Initializes the edit subtasks.
 *
 * @param {Object[]} editSubtasks - The edit form subtasks to process.
 * @param {Function} onChange - The callback invoked after the value changes.
 * @returns {void}
 */
function initEditSubtasks(editSubtasks, onChange) {
    const elements = getEditSubtaskElements();

    if (!elements) return;

    renderEditSubtasks(editSubtasks, onChange);

    registerEditSubtaskEvents(
        elements,
        editSubtasks,
        onChange
    );
}

/**
 * Retrieves the edit subtask elements.
 *
 * @returns {Object} The generated data object.
 */
function getEditSubtaskElements() {
    const input = document.getElementById("editSubtaskInput");
    const addButton = document.getElementById("editAddSubtaskBtn");
    const clearButton = document.getElementById("editClearSubtaskBtn");
    if (!input || !addButton || !clearButton) return null;
    return { input, addButton, clearButton };
}

/**
 * Registers the edit subtask events.
 *
 * @param {Object} elements - The elements required by the operation.
 * @param {Object[]} editSubtasks - The edit form subtasks to process.
 * @param {Function} onChange - The callback invoked after the value changes.
 * @returns {void}
 */
function registerEditSubtaskEvents(elements, editSubtasks, onChange) {
    const { input, addButton, clearButton } = elements;
    input.addEventListener("keydown", event => {
        handleEditSubtaskEnter(event, editSubtasks, onChange);
    });
    addButton.addEventListener("click", () => addEditSubtask(editSubtasks, onChange));
    clearButton.addEventListener("click", () => clearEditSubtaskInput(input));
}

/**
 * Adds an edit subtask when the Enter key is pressed.
 *
 * @param {Event} event - The event that triggered the operation.
 * @param {Object[]} editSubtasks - The edit form subtasks to process.
 * @param {Function} onChange - The callback invoked after the value changes.
 * @returns {void}
 */
function handleEditSubtaskEnter(event, editSubtasks, onChange) {
    if (event.key !== "Enter") return;
    event.preventDefault();
    addEditSubtask(editSubtasks, onChange);
}

/**
 * Clears the edit subtask input.
 *
 * @param {HTMLElement} input - The input element to process.
 * @returns {void}
 */
function clearEditSubtaskInput(input) {
    input.value = "";
    input.focus();
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
    if (!editSubtaskInput) return;
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
 * @returns {void}
 */
function renderEditSubtasks(editSubtasks, onChange) {
    const editSubtaskList = document.getElementById("editSubtaskList");
    if (!editSubtaskList) return;
    editSubtaskList.innerHTML = editSubtasks
        .map((subtask, index) => editSubtaskTemplate(subtask, index))
        .join("");
    initEditSubtaskButtons(editSubtasks, onChange);
}

/**
 * Initializes the edit subtask buttons.
 *
 * @param {Object[]} editSubtasks - The edit form subtasks to process.
 * @param {Function} onChange - The callback invoked after the value changes.
 * @returns {void}
 */
function initEditSubtaskButtons(editSubtasks, onChange) {
    const editSubtaskList = document.getElementById("editSubtaskList");
    if (!editSubtaskList) return;
    editSubtaskList.addEventListener("click", (event) => {
        handleEditSubtaskButton(event, editSubtasks, onChange);
    });
}

/**
 * Handles the edit subtask button.
 *
 * @param {Event} event - The event that triggered the operation.
 * @param {Object[]} editSubtasks - The edit form subtasks to process.
 * @param {Function} onChange - The callback invoked after the value changes.
 * @returns {void}
 */
function handleEditSubtaskButton(event, editSubtasks, onChange) {
    const deleteButton = event.target.closest(".deleteSubtaskBtn");
    const editButton = event.target.closest(".editSubtaskBtn");
    if (deleteButton) handleDeleteSubtask(deleteButton, editSubtasks, onChange);
    if (editButton) handleEditSubtask(editButton, editSubtasks, onChange);
}

/**
 * Deletes the selected subtask from the edit form.
 *
 * @param {HTMLElement} button - The button involved in the operation.
 * @param {Object[]} editSubtasks - The edit form subtasks to process.
 * @param {Function} onChange - The callback invoked after the value changes.
 * @returns {void}
 */
function handleDeleteSubtask(button, editSubtasks, onChange) {

    const index = Number(button.dataset.index);

    editSubtasks.splice(index, 1);

    renderEditSubtasks(editSubtasks,onChange );

    onChange(editSubtasks);
}


/**
 * Moves the selected subtask into the input for editing.
 *
 * @param {HTMLElement} button - The button involved in the operation.
 * @param {Object[]} editSubtasks - The edit form subtasks to process.
 * @param {Function} onChange - The callback invoked after the value changes.
 * @returns {void}
 */
function handleEditSubtask(button, editSubtasks, onChange) {
    const index = Number(button.dataset.index);
    const subtask = editSubtasks[index];
    const input = document.getElementById("editSubtaskInput");
    if (!subtask || !input) return;
    input.value = subtask.title;
    editSubtasks.splice(index, 1);
    renderEditSubtasks(editSubtasks, onChange);
    onChange(editSubtasks);
    input.focus();
}

/**
 * Renders the edit assigned contacts.
 *
 * @param {Object[]} selectedEditContacts - The contacts selected in the edit form.
 * @returns {void}
 */
function renderEditAssignedContacts(selectedEditContacts) {
    const editSelectedContacts = document.getElementById("editSelectedContacts");
    const dropdown = document.getElementById("editMoreContactsDropdown");
    if (!editSelectedContacts) return;
    editSelectedContacts.innerHTML = "";
    resetEditContactsDropdown(dropdown);
    renderVisibleEditContacts(selectedEditContacts.slice(0, 3), editSelectedContacts);
    renderHiddenEditContacts(selectedEditContacts.slice(3), editSelectedContacts, dropdown);
}

/**
 * Resets the edit contacts dropdown.
 *
 * @param {HTMLElement} dropdown - The dropdown element to update.
 * @returns {void}
 */
function resetEditContactsDropdown(dropdown) {
    if (!dropdown) return;
    dropdown.innerHTML = "";
    dropdown.classList.add("d_none");
}

/**
 * Renders the visible edit contacts.
 *
 * @param {Object[]} visibleContacts - The contacts displayed directly in the form.
 * @param {HTMLElement} container - The container element to update.
 * @returns {void}
 */
function renderVisibleEditContacts(visibleContacts, container) {
    container.innerHTML = visibleContacts
        .map((contact, index) => getEditAssignedContactTemplate(contact, index))
        .join("");
}

/**
 * Renders the hidden edit contacts.
 *
 * @param {Object[]} hiddenContacts - The contacts displayed in the additional-contacts dropdown.
 * @param {HTMLElement} container - The container element to update.
 * @param {HTMLElement} dropdown - The dropdown element to update.
 * @returns {void}
 */
function renderHiddenEditContacts(hiddenContacts, container, dropdown) {
    if (!hiddenContacts.length || !dropdown) return;
    renderEditMoreContactsButton(hiddenContacts.length, container);
    dropdown.innerHTML = hiddenContacts
        .map((contact, index) => getEditMoreContactTemplate(contact, index))
        .join("");
    bindEditMoreContactsButton(dropdown);
}

/**
 * Renders the edit more contacts button.
 *
 * @param {number} count - The number of items.
 * @param {HTMLElement} container - The container element to update.
 * @returns {void}
 */
function renderEditMoreContactsButton(count, container) {
    container.innerHTML += `
        <button
            type="button"
            class="moreContactsBtn"
            id="editMoreContactsBtn">
            +${count}
        </button>
    `;
}

/**
 * Binds the edit more contacts button.
 *
 * @param {HTMLElement} dropdown - The dropdown element to update.
 * @returns {void}
 */
function bindEditMoreContactsButton(dropdown) {
    document.getElementById("editMoreContactsBtn")
        ?.addEventListener("click", event => {
            event.stopPropagation();
            dropdown.classList.toggle("d_none");
        });
}
