/**
 * Stores the contacts available for task assignment.
 */
let contacts = [];
/**
 * Stores the assigned-contact dropdown used by the edit form.
 */
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
