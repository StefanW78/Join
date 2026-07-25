let contacts = [];
let editAssignedList = null;

async function loadEditContacts() {

    try {

        const usersObject = await loadDataBase("users");

        contacts = Object.entries(usersObject).map(([id, user]) => ({
            id,
            name: user.name,
            email: user.email,
            initials: user.initials,
            color: user.color
        }));

    } catch (error) {

        console.error("Fehler beim Laden der Kontakte:", error);

        contacts = [];
    }
}

async function initEditTaskForm(task) {
    await loadEditContacts();

    const state = createEditTaskState(task);

    initEditPriorityButtons(priority => {
        state.priority = priority;
    });

    initEditAssignedContacts(state.contacts, contacts => {
        state.contacts = contacts;
    });

    initEditSubtasks(state.subtasks, subtasks => {
        state.subtasks = subtasks;
    });

    registerEditFormSubmit(task.id, state);
}

function createEditTaskState(task) {
    return {
        priority: task.priority || "medium",
        contacts: [...(task.assignedTo || [])],
        subtasks: [...(task.subtasks || [])],
    };
}

function registerEditFormSubmit(taskId, state) {
    document
        .getElementById("editTaskForm")
        .addEventListener("submit", (event) => {
            event.preventDefault();

            if (!isTaskFormValid()) return;

          saveEditedTask(
                taskId,
                state.priority,
                state.contacts,
                state.subtasks
            );
        });
}

//save functions
async function saveEditedTask(
    taskId,
    selectedPriority,
    selectedContacts,
    editSubtasks
) {

    const updatedTask = getUpdatedTaskData(
        selectedPriority,
        selectedContacts,
        editSubtasks
    );

    const oldTask = getTaskById(taskId);

    if (!oldTask) return;

    const backupTask = structuredClone(oldTask);

    try {

        await updateTaskInDatabase(taskId, updatedTask);

        updateLocalTask(oldTask, updatedTask);

        refreshBoard(taskId);

    } catch (error) {

        rollbackTask(oldTask, backupTask);

        console.error(
            "Speichern fehlgeschlagen:",
            error
        );
    }
}

function getUpdatedTaskData(
    selectedPriority,
    selectedContacts,
    editSubtasks
) {

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
    input,
    list,
    selectedContacts,
    onChange
) {
    const renderOptions = () =>
        renderEditContactOptions(selectedContacts, onChange);

    input.addEventListener("focus", () => {
        list.classList.remove("d_none");
        renderOptions();
    });

    input.addEventListener("input", renderOptions);
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

    const filteredContacts = contacts.filter(contact =>
        contact.name.toLowerCase().includes(searchText)
    );

    list.innerHTML = filteredContacts
        .map(contact => createContactOptionTemplate(contact, selectedContacts))
        .join("");

    registerContactOptionEvents(selectedContacts, onChange);
}

function registerContactOptionEvents(selectedContacts, onChange) {
    document
        .querySelectorAll("#editAssignedList .contactOption")
        .forEach(option => {

            option.addEventListener("click", event => {
                event.stopPropagation();

                toggleSelectedContact(
                    option.dataset.contactId,
                    selectedContacts
                );

                document.getElementById("editAssignedInput").value = "";

                renderEditAssignedContacts(selectedContacts);
                renderEditContactOptions(
                    selectedContacts,
                    onChange
                );

                onChange(selectedContacts);
            });

        });
}

function toggleSelectedContact(contactId, selectedContacts) {
    const index = selectedContacts.findIndex(
        item => item.id === contactId
    );

    if (index !== -1) {
        selectedContacts.splice(index, 1);
        return;
    }

    const contact = contacts.find(
        item => item.id === contactId
    );

    if (contact) {
        selectedContacts.push(contact);
    }
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

    if (!input || !addButton || !clearButton) {
        return null;
    }

    return {
        input,
        addButton,
        clearButton
    };
}

function registerEditSubtaskEvents(
    { input, addButton, clearButton },
    editSubtasks,
    onChange
) {
    input.addEventListener("keydown", (event) => {
        if (event.key !== "Enter") return;

        event.preventDefault();

        addEditSubtask(
            editSubtasks,
            onChange
        );
    });


    addButton.addEventListener("click", () => {
        addEditSubtask(
            editSubtasks,
            onChange
        );
    });


    clearButton.addEventListener("click", () => {
        input.value = "";
        input.focus();
    });
}

function addEditSubtask(editSubtasks, onChange) {
    const editSubtaskInput =
        document.getElementById("editSubtaskInput");

    if (!editSubtaskInput) return;

    const subtaskText =
        editSubtaskInput.value.trim();

    if (!subtaskText) return;

    editSubtasks.push({
        title: subtaskText,
        done: false
    });

    editSubtaskInput.value = "";

    renderEditSubtasks(editSubtasks,onChange);

    onChange(editSubtasks);
}

function renderEditSubtasks(editSubtasks, onChange) {

    const editSubtaskList =
        document.getElementById("editSubtaskList");

    if (!editSubtaskList) return;


    editSubtaskList.innerHTML = editSubtasks
        .map((subtask, index) => {
            return editSubtaskTemplate(
                subtask,
                index
            );
        })
        .join("");


    initEditSubtaskButtons(
        editSubtasks,
        onChange
    );
}

function initEditSubtaskButtons(editSubtasks, onChange) {
    const editSubtaskList = document.getElementById("editSubtaskList");

    if (!editSubtaskList) return;

    editSubtaskList.addEventListener("click", (event) => {
        const deleteButton = event.target.closest(".deleteSubtaskBtn");
        const editButton = event.target.closest(".editSubtaskBtn");

        if (deleteButton) {
            handleDeleteSubtask(deleteButton,editSubtasks,onChange);
        }

        if (editButton) {
            handleEditSubtask(editButton,editSubtasks,onChange);
        }
    });
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

    renderEditSubtasks(editSubtasks,onChange);

    onChange(editSubtasks);

    input.focus();
}

function renderEditAssignedContacts(selectedEditContacts) {
    const editSelectedContacts =
        document.getElementById("editSelectedContacts");

    const editMoreContactsDropdown =
        document.getElementById("editMoreContactsDropdown");

    if (!editSelectedContacts) return;

    editSelectedContacts.innerHTML = "";

    if (editMoreContactsDropdown) {
        editMoreContactsDropdown.innerHTML = "";
        editMoreContactsDropdown.classList.add("d_none");
    }

    const visibleContacts =
        selectedEditContacts.slice(0, 3);

    const hiddenContacts =
        selectedEditContacts.slice(3);

    editSelectedContacts.innerHTML =
        visibleContacts
            .map((contact, index) =>
                getEditAssignedContactTemplate(contact, index)
            )
            .join("");

    if (!hiddenContacts.length || !editMoreContactsDropdown) return;

    editSelectedContacts.innerHTML += `
        <button
            type="button"
            class="moreContactsBtn"
            id="editMoreContactsBtn">
            +${hiddenContacts.length}
        </button>
    `;

    editMoreContactsDropdown.innerHTML =
        hiddenContacts
            .map((contact, index) =>
                getEditMoreContactTemplate(contact, index)
            )
            .join("");

    document
        .getElementById("editMoreContactsBtn")
        ?.addEventListener("click", (event) => {
            event.stopPropagation();
            editMoreContactsDropdown.classList.toggle(
                "d_none"
            );
        });
}

// editTaskForm.addEventListener("submit", handleTaskSubmit);

// async function handleTaskSubmit(event) {
//   event.preventDefault();

//   if (!isTaskFormValid()) return;

//   addCurrentSubtaskInput();

//   const task = createTaskFromForm();
//   await saveTask(task);
// }