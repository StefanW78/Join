let contacts = [];
let editAssignedList = null;

async function loadEditContacts() {
    try {
        const usersObject = await loadDataBase("users");
        contacts = Object.entries(usersObject).map(createEditContact);
    } catch (error) {
        console.error("Fehler beim Laden der Kontakte:", error);
        contacts = [];
    }
}

function createEditContact([id, user]) {
    return { id, name: user.name, email: user.email,
        initials: user.initials, color: user.color };
}

async function initEditTaskForm(task) {
    await loadEditContacts();
    const state = createEditTaskState(task);
    initEditStateControls(state);
    registerEditFormSubmit(task.id, state);
    initEditValidationEvents();
}

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

function createEditTaskState(task) {
    return {
        priority: task.priority || "medium",
        contacts: [...(task.assignedTo || [])],
        subtasks: [...(task.subtasks || [])],
    };
}

function registerEditFormSubmit(taskId, state) {
    const form = document.getElementById("editTaskForm");
    form.addEventListener("submit", (event) => handleEditSubmit(event, taskId, state));
}

function handleEditSubmit(event, taskId, state) {
    event.preventDefault();
    if (!isEditTaskFormValid()) return;
    saveEditedTask(taskId, state.priority, state.contacts, state.subtasks);
}

//save functions
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

async function persistEditedTask(taskId, oldTask, updatedTask) {
    await updateTaskInDatabase(taskId, updatedTask);
    updateLocalTask(oldTask, updatedTask);
    refreshBoard(taskId);
}

function handleEditSaveError(oldTask, backupTask, error) {
    rollbackTask(oldTask, backupTask);
    console.error("Speichern fehlgeschlagen:", error);
}

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

function getTaskById(taskId) {

    return tasks.find(task => task.id === taskId);

}

async function updateTaskInDatabase(taskId, updatedTask) {

    await updateData(
        "tasks",
        taskId,
        updatedTask
    );

}

function updateLocalTask(task, updatedTask) {

    Object.assign(
        task,
        updatedTask
    );

}

function refreshBoard(taskId) {

    renderTasks();

    renderCardOverlay(taskId);

}

function rollbackTask(task, backupTask) {

    Object.assign(
        task,
        backupTask
    );

    renderTasks();

}
//save functions



function convertDateToISO(dateValue) {
  if (!dateValue.includes("/")) {
    return dateValue;
  }

  const [day, month, year] = dateValue.split("/");
  return `${year}-${month}-${day}`;
}

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

function setActivePriorityButton(button) {
    clearPriorityButtons();

    const activeClass = getPriorityClass(button.dataset.priority);

    if (activeClass) {
        button.classList.add(activeClass);
    }
}

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

function getPriorityClass(priority) {
    const classes = {
        urgent: "activeUrgent",
        medium: "activeMedium",
        low: "activeLow"
    };

    return classes[priority];
}

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

function registerAssignedInputEvents(
    input, list, selectedContacts, onChange
) {
    const renderOptions = () =>
        renderEditContactOptions(selectedContacts, onChange);
    input.addEventListener("focus", () => openEditAssignedList(list, renderOptions));
    input.addEventListener("input", renderOptions);
}

function openEditAssignedList(list, renderOptions) {
    list.classList.remove("d_none");
    renderOptions();
}

document.addEventListener("click", handleEditAssignedOutsideClick);

function handleEditAssignedOutsideClick(event) {
    closeAssignedList(event);
    closeMoreContactsDropdown(event);
}

function closeAssignedList(event) {
    if (!editAssignedList) return;

    if (!event.target.closest("#editAssignedDropdown")) {
        editAssignedList.classList.add("d_none");
    }
}

function closeMoreContactsDropdown(event) {
    if (event.target.closest(".selectedContactsWrapper")) return;

    const dropdown = document.getElementById("editMoreContactsDropdown");

    if (dropdown) {
        dropdown.classList.add("d_none");
    }
}

function renderEditContactOptions(selectedContacts, onChange) {
    const input = document.getElementById("editAssignedInput");
    const list = document.getElementById("editAssignedList");
    const searchText = input.value.trim().toLowerCase();
    list.innerHTML = getFilteredEditContacts(searchText)
        .map(contact => createContactOptionTemplate(contact, selectedContacts))
        .join("");
    registerContactOptionEvents(selectedContacts, onChange);
}

function getFilteredEditContacts(searchText) {
    return contacts.filter(contact =>
        contact.name.toLowerCase().includes(searchText)
    );
}

function registerContactOptionEvents(selectedContacts, onChange) {
    const options = document.querySelectorAll("#editAssignedList .contactOption");
    options.forEach(option => {
        option.addEventListener("click", event => {
            handleEditContactSelection(event, option, selectedContacts, onChange);
        });
    });
}

function handleEditContactSelection(event, option, selectedContacts, onChange) {
    event.stopPropagation();
    toggleSelectedContact(option.dataset.contactId, selectedContacts);
    document.getElementById("editAssignedInput").value = "";
    renderEditAssignedContacts(selectedContacts);
    renderEditContactOptions(selectedContacts, onChange);
    onChange(selectedContacts);
}

function toggleSelectedContact(contactId, selectedContacts) {
    const index = selectedContacts.findIndex(item => item.id === contactId);
    if (index !== -1) {
        selectedContacts.splice(index, 1);
        return;
    }
    const contact = contacts.find(item => item.id === contactId);
    if (contact) selectedContacts.push(contact);
}

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

function getEditSubtaskElements() {
    const input = document.getElementById("editSubtaskInput");
    const addButton = document.getElementById("editAddSubtaskBtn");
    const clearButton = document.getElementById("editClearSubtaskBtn");
    if (!input || !addButton || !clearButton) return null;
    return { input, addButton, clearButton };
}

function registerEditSubtaskEvents(elements, editSubtasks, onChange) {
    const { input, addButton, clearButton } = elements;
    input.addEventListener("keydown", event => {
        handleEditSubtaskEnter(event, editSubtasks, onChange);
    });
    addButton.addEventListener("click", () => addEditSubtask(editSubtasks, onChange));
    clearButton.addEventListener("click", () => clearEditSubtaskInput(input));
}

function handleEditSubtaskEnter(event, editSubtasks, onChange) {
    if (event.key !== "Enter") return;
    event.preventDefault();
    addEditSubtask(editSubtasks, onChange);
}

function clearEditSubtaskInput(input) {
    input.value = "";
    input.focus();
}

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

function renderEditSubtasks(editSubtasks, onChange) {
    const editSubtaskList = document.getElementById("editSubtaskList");
    if (!editSubtaskList) return;
    editSubtaskList.innerHTML = editSubtasks
        .map((subtask, index) => editSubtaskTemplate(subtask, index))
        .join("");
    initEditSubtaskButtons(editSubtasks, onChange);
}

function initEditSubtaskButtons(editSubtasks, onChange) {
    const editSubtaskList = document.getElementById("editSubtaskList");
    if (!editSubtaskList) return;
    editSubtaskList.addEventListener("click", (event) => {
        handleEditSubtaskButton(event, editSubtasks, onChange);
    });
}

function handleEditSubtaskButton(event, editSubtasks, onChange) {
    const deleteButton = event.target.closest(".deleteSubtaskBtn");
    const editButton = event.target.closest(".editSubtaskBtn");
    if (deleteButton) handleDeleteSubtask(deleteButton, editSubtasks, onChange);
    if (editButton) handleEditSubtask(editButton, editSubtasks, onChange);
}

function handleDeleteSubtask(button, editSubtasks, onChange) {

    const index = Number(button.dataset.index);

    editSubtasks.splice(index, 1);

    renderEditSubtasks(editSubtasks,onChange );

    onChange(editSubtasks);
}


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

function renderEditAssignedContacts(selectedEditContacts) {
    const editSelectedContacts = document.getElementById("editSelectedContacts");
    const dropdown = document.getElementById("editMoreContactsDropdown");
    if (!editSelectedContacts) return;
    editSelectedContacts.innerHTML = "";
    resetEditContactsDropdown(dropdown);
    renderVisibleEditContacts(selectedEditContacts.slice(0, 3), editSelectedContacts);
    renderHiddenEditContacts(selectedEditContacts.slice(3), editSelectedContacts, dropdown);
}

function resetEditContactsDropdown(dropdown) {
    if (!dropdown) return;
    dropdown.innerHTML = "";
    dropdown.classList.add("d_none");
}

function renderVisibleEditContacts(visibleContacts, container) {
    container.innerHTML = visibleContacts
        .map((contact, index) => getEditAssignedContactTemplate(contact, index))
        .join("");
}

function renderHiddenEditContacts(hiddenContacts, container, dropdown) {
    if (!hiddenContacts.length || !dropdown) return;
    renderEditMoreContactsButton(hiddenContacts.length, container);
    dropdown.innerHTML = hiddenContacts
        .map((contact, index) => getEditMoreContactTemplate(contact, index))
        .join("");
    bindEditMoreContactsButton(dropdown);
}

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

function bindEditMoreContactsButton(dropdown) {
    document.getElementById("editMoreContactsBtn")
        ?.addEventListener("click", event => {
            event.stopPropagation();
            dropdown.classList.toggle("d_none");
        });
}
