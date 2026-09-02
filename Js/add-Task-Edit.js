let contacts = [];
let editAssignedList = null;

/**
 * Loads the edit contacts.
 *
 * @async
 * @returns {Promise<void>} A promise that resolves when the operation is complete.
 */
async function loadEditContacts() {
    try {
        const usersObject = await loadDataBase("users");
        contacts = Object.entries(usersObject).map(createEditContact);
    } catch (error) {
        console.error("Fehler beim Laden der Kontakte:", error);
        contacts = [];
    }
}

/**
 * Creates a normalized contact object for the task edit form.
 *
 * @param {[string, Object]} contactEntry - The database ID and associated data.
 * @returns {Object} The generated data object.
 */
function createEditContact([id, user]) {
    return { id, name: user.name, email: user.email,
        initials: user.initials, color: user.color };
}

/**
 * Initializes the edit task form.
 *
 * @async
 * @param {Object} task - The task to process.
 * @returns {Promise<void>} A promise that resolves when the operation is complete.
 */
async function initEditTaskForm(task) {
    await loadEditContacts();
    const state = createEditTaskState(task);
    initEditStateControls(state);
    registerEditFormSubmit(task.id, state);
    initEditValidationEvents();
}

/**
 * Initializes the edit state controls.
 *
 * @param {Object} state - The current edit form state.
 * @returns {void}
 */
function initEditStateControls(state) {
    initEditPriorityButtons(priority => {
        state.priority = priority;
    });
    initEditAssignedContacts(state.contacts, contacts => {
        state.contacts = contacts;
    });
    initEditSubtasks(state.subtasks, subtasks => {
        state.subtasks = subtasks;
    });
}

/**
 * Creates the edit task state.
 *
 * @param {Object} task - The task to process.
 * @returns {Object} The generated data object.
 */
function createEditTaskState(task) {
    return {
        priority: task.priority || "medium",
        contacts: [...(task.assignedTo || [])],
        subtasks: [...(task.subtasks || [])],
    };
}

/**
 * Registers the submit handler for the edit task form.
 *
 * @param {string} taskId - The ID of the task.
 * @param {Object} state - The current edit form state.
 * @returns {void}
 */
function registerEditFormSubmit(taskId, state) {
    const form = document.getElementById("editTaskForm");
    form.addEventListener("submit", (event) => handleEditSubmit(event, taskId, state));
}

/**
 * Validates and handles submission of the edit task form.
 *
 * @param {Event} event - The event that triggered the operation.
 * @param {string} taskId - The ID of the task.
 * @param {Object} state - The current edit form state.
 * @returns {void}
 */
function handleEditSubmit(event, taskId, state) {
    event.preventDefault();
    if (!isEditTaskFormValid()) return;
    saveEditedTask(taskId, state.priority, state.contacts, state.subtasks);
}

//save functions
/**
 * Saves the edited task.
 *
 * @async
 * @param {string} taskId - The ID of the task.
 * @param {string} priority - The selected task priority.
 * @param {Object[]} selectedContacts - The currently selected contacts.
 * @param {Object[]} editSubtasks - The edit form subtasks to process.
 * @returns {Promise<void>} A promise that resolves when the operation is complete.
 */
async function saveEditedTask(taskId, priority, selectedContacts, editSubtasks) {
    const updatedTask = getUpdatedTaskData(priority, selectedContacts, editSubtasks);
    const oldTask = getTaskById(taskId);
    if (!oldTask) return;
    const backupTask = structuredClone(oldTask);
    try {
        await persistEditedTask(taskId, oldTask, updatedTask);
    } catch (error) {
        handleEditSaveError(oldTask, backupTask, error);
    }
}

/**
 * Persists the edited task.
 *
 * @async
 * @param {string} taskId - The ID of the task.
 * @param {Object} oldTask - The original task object.
 * @param {Object} updatedTask - The updated task values.
 * @returns {Promise<void>} A promise that resolves when the operation is complete.
 */
async function persistEditedTask(taskId, oldTask, updatedTask) {
    await updateTaskInDatabase(taskId, updatedTask);
    updateLocalTask(oldTask, updatedTask);
    refreshBoard(taskId);
}

/**
 * Handles the edit save error.
 *
 * @param {Object} oldTask - The original task object.
 * @param {Object} backupTask - The task backup used for restoration.
 * @param {Error} error - The error raised while saving the task.
 * @returns {void}
 */
function handleEditSaveError(oldTask, backupTask, error) {
    rollbackTask(oldTask, backupTask);
    console.error("Speichern fehlgeschlagen:", error);
}

/**
 * Collects the updated task data from the edit form state.
 *
 * @param {string} selectedPriority - The selected task priority.
 * @param {Object[]} selectedContacts - The currently selected contacts.
 * @param {Object[]} editSubtasks - The edit form subtasks to process.
 * @returns {Object} The generated data object.
 */
function getUpdatedTaskData(selectedPriority, selectedContacts, editSubtasks) {
    return {
        title: document.getElementById("editTaskTitle").value.trim(),
        description: document.getElementById("editTaskDescription").value.trim(),
        dueDate: document.getElementById("editTaskDate").value.trim(),
        category: document.getElementById("editTaskCategory").value,
        priority: selectedPriority,
        assignedTo: selectedContacts,
        subtasks: editSubtasks
    };
}

/**
 * Finds a loaded task by its ID.
 *
 * @param {string} taskId - The ID of the task.
 * @returns {Object|undefined} The matching task, or undefined when it is not found.
 */
function getTaskById(taskId) {

    return tasks.find(task => task.id === taskId);

}

/**
 * Saves the updated task data in the database.
 *
 * @async
 * @param {string} taskId - The ID of the task.
 * @param {Object} updatedTask - The updated task values.
 * @returns {Promise<void>} A promise that resolves when the operation is complete.
 */
async function updateTaskInDatabase(taskId, updatedTask) {

    await updateData(
        "tasks",
        taskId,
        updatedTask
    );

}

/**
 * Updates the local task.
 *
 * @param {Object} task - The task to process.
 * @param {Object} updatedTask - The updated task values.
 * @returns {void}
 */
function updateLocalTask(task, updatedTask) {

    Object.assign(
        task,
        updatedTask
    );

}

/**
 * Refreshes the board and reopens the selected task overlay.
 *
 * @param {string} taskId - The ID of the task.
 * @returns {void}
 */
function refreshBoard(taskId) {

    renderTasks();

    renderCardOverlay(taskId);

}

/**
 * Restores the previous task.
 *
 * @param {Object} task - The task to process.
 * @param {Object} backupTask - The task backup used for restoration.
 * @returns {void}
 */
function rollbackTask(task, backupTask) {

    Object.assign(
        task,
        backupTask
    );

    renderTasks();

}
//save functions



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
 * Initializes the edit priority buttons.
 *
 * @param {Function} onChange - The callback invoked after the value changes.
 * @returns {void}
 */
function initEditPriorityButtons(onChange) {
    document
        .querySelectorAll(".editPriorityBtn")
        .forEach(button => {
            button.addEventListener("click", () => {
                const priority = button.dataset.priority;

                setActivePriorityButton(button);

                onChange(priority);
            });
        });
}

/**
 * Marks the selected priority button as active.
 *
 * @param {HTMLElement} button - The button involved in the operation.
 * @returns {void}
 */
function setActivePriorityButton(button) {
    clearPriorityButtons();

    const activeClass = getPriorityClass(button.dataset.priority);

    if (activeClass) {
        button.classList.add(activeClass);
    }
}

/**
 * Clears the priority buttons.
 *
 * @returns {void}
 */
function clearPriorityButtons() {
    document
        .querySelectorAll(".editPriorityBtn")
        .forEach(button => {
            button.classList.remove(
                "activeUrgent",
                "activeMedium",
                "activeLow"
            );
        });
}

/**
 * Retrieves the priority class.
 *
 * @param {string} priority - The selected task priority.
 * @returns {string} The generated value or HTML markup.
 */
function getPriorityClass(priority) {
    const classes = {
        urgent: "activeUrgent",
        medium: "activeMedium",
        low: "activeLow"
    };

    return classes[priority];
}

/**
 * Initializes the edit assigned contacts.
 *
 * @param {Object[]} selectedContacts - The currently selected contacts.
 * @param {Function} onChange - The callback invoked after the value changes.
 * @returns {void}
 */
function initEditAssignedContacts(selectedContacts, onChange) {
    const input = document.getElementById("editAssignedInput");
    editAssignedList = document.getElementById("editAssignedList");

    renderEditAssignedContacts(selectedContacts);

    registerAssignedInputEvents(
        input,
        editAssignedList,
        selectedContacts,
        onChange
    );
}

/**
 * Registers the assigned input events.
 *
 * @param {HTMLElement} input - The input element to process.
 * @param {HTMLElement} list - The list element to update.
 * @param {Object[]} selectedContacts - The currently selected contacts.
 * @param {Function} onChange - The callback invoked after the value changes.
 * @returns {void}
 */
function registerAssignedInputEvents(
    input, list, selectedContacts, onChange
) {
    const renderOptions = () =>
        renderEditContactOptions(selectedContacts, onChange);
    input.addEventListener("focus", () => openEditAssignedList(list, renderOptions));
    input.addEventListener("input", renderOptions);
}

/**
 * Opens the edit assigned list.
 *
 * @param {HTMLElement} list - The list element to update.
 * @param {Function} renderOptions - The callback used to render the contact options.
 * @returns {void}
 */
function openEditAssignedList(list, renderOptions) {
    list.classList.remove("d_none");
    renderOptions();
}

document.addEventListener("click", handleEditAssignedOutsideClick);

/**
 * Handles clicks outside the assigned-contact controls.
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
