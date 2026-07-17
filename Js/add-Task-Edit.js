let contacts = [];

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
  let selectedEditPriority = task.priority || "medium";
  let selectedEditContacts = [...(task.assignedTo || [])];
  let editSubtasks = [...(task.subtasks || [])];

//   document
//     .getElementById("closeEditTaskOverlayBtn")
//     .addEventListener("click", closeTaskDetailOverlay);

//   document.getElementById("cancelEditTaskBtn").addEventListener("click", () => {
//     renderCardOverlay(task.id);
//   });

  initEditPriorityButtons((priority) => {
    selectedEditPriority = priority;
  });

  initEditAssignedContacts(selectedEditContacts, (updatedContacts) => {
    selectedEditContacts = updatedContacts;
  });

  initEditSubtasks(editSubtasks, (updatedSubtasks) => {
    editSubtasks = updatedSubtasks;
  });

  document
    .getElementById("editTaskForm")
    .addEventListener("submit", (event) => {
      event.preventDefault();

      saveEditedTask(
        task.id,
        selectedEditPriority,
        selectedEditContacts,
        editSubtasks,
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
        .forEach((button) => {

            button.addEventListener("click", () => {

                const selectedPriority = button.dataset.priority;

                document
                    .querySelectorAll(".editPriorityBtn")
                    .forEach((btn) => {

                        btn.classList.remove(
                            "activeUrgent",
                            "activeMedium",
                            "activeLow"
                        );

                    });

                const activeClass = {
                    urgent: "activeUrgent",
                    medium: "activeMedium",
                    low: "activeLow"
                };
                
                const className = activeClass[selectedPriority];

                if (className) {
                    button.classList.add(className);
                }

                onChange(selectedPriority);

            });

        });
}

function initEditAssignedContacts(selectedEditContacts, onChange) {
  const editAssignedInput = document.getElementById("editAssignedInput");
  const editAssignedList = document.getElementById("editAssignedList");

  renderEditAssignedContacts(selectedEditContacts);

  editAssignedInput.addEventListener("focus", () => {
    editAssignedList.classList.remove("d_none");
    renderEditContactOptions(selectedEditContacts, onChange);
  });

  editAssignedInput.addEventListener("input", () => {
    renderEditContactOptions(selectedEditContacts, onChange);
  });

  document.addEventListener("click", (event) => {
  const clickedInsideDropdown = event.target.closest("#editAssignedDropdown");
  const clickedInsideSelectedContacts = event.target.closest(
    ".selectedContactsWrapper",
  );

  if (!clickedInsideDropdown) {
    editAssignedList.classList.add("d_none");
  }

  if (!clickedInsideSelectedContacts) {
    const editMoreContactsDropdown = document.getElementById(
      "editMoreContactsDropdown",
    );

    if (editMoreContactsDropdown) {
      editMoreContactsDropdown.classList.add("d_none");
    }
  }
});
}

function renderEditContactOptions(selectedEditContacts, onChange) {
  const editAssignedInput = document.getElementById("editAssignedInput");
  const editAssignedList = document.getElementById("editAssignedList");

  editAssignedList.innerHTML = "";

  const searchText = editAssignedInput.value.trim().toLowerCase();

  const filteredContacts = contacts.filter((contact) => {
    return contact.name.toLowerCase().includes(searchText);
  });

  filteredContacts.forEach((contact, index) => {
    const isSelected = selectedEditContacts.some(
      (item) => item.id === contact.id,
    );

    editAssignedList.innerHTML += `
    <div class="contactOption ${isSelected ? "selectedContactOption" : ""}" data-contact-id="${contact.id}">

        <div 
            class="contactAvatar"
            style="background:${contact.color}">
            
            ${contact.initials || getInitials(contact.name)}

        </div>

        <span>${contact.name}</span>

        <input
            class="contactCheckbox"
            type="checkbox"
            ${isSelected ? "checked" : ""}
        >

    </div>
`;
  });

  document
    .querySelectorAll("#editAssignedList .contactOption")
    .forEach((option) => {
        option.addEventListener("click", (event) => {
            event.stopPropagation();

            const contactId = option.dataset.contactId;

            const contact = contacts.find(
                (item) => item.id === contactId
            );

            if (!contact) return;

            const isSelected = selectedEditContacts.some(
                (item) => item.id === contactId
            );

            if (isSelected) {

                const index = selectedEditContacts.findIndex(
                    (item) => item.id === contactId
                );

                if (index !== -1) {
                    selectedEditContacts.splice(index, 1);
                }

            } else {

                selectedEditContacts.push(contact);

            }

            editAssignedInput.value = "";
            renderEditAssignedContacts(
                selectedEditContacts
            );
            renderEditContactOptions(
                selectedEditContacts,
                onChange
            );
            onChange(
                selectedEditContacts
            );
        });
    });
}

function initEditSubtasks(editSubtasks, onChange) {

    const editSubtaskInput =
        document.getElementById("editSubtaskInput");

    const editAddSubtaskBtn =
        document.getElementById("editAddSubtaskBtn");

    const editClearSubtaskBtn =
        document.getElementById("editClearSubtaskBtn");

    if (
        !editSubtaskInput ||
        !editAddSubtaskBtn ||
        !editClearSubtaskBtn
    ) return;

    renderEditSubtasks(
        editSubtasks,
        onChange
    );

    editSubtaskInput.addEventListener("keydown", (event) => {

        if (event.key !== "Enter") return;

        event.preventDefault();

        addEditSubtask(
            editSubtasks,
            onChange
        );
    });

    editAddSubtaskBtn.addEventListener("click", () => {

        addEditSubtask(
            editSubtasks,
            onChange
        );
    });

    editClearSubtaskBtn.addEventListener("click", () => {

        editSubtaskInput.value = "";

        editSubtaskInput.focus();

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

    renderEditSubtasks(
        editSubtasks,
        onChange
    );

    onChange(editSubtasks);
}

function renderEditSubtasks(editSubtasks, onChange) {

    const editSubtaskList =
        document.getElementById("editSubtaskList");


    if (!editSubtaskList) return;


    editSubtaskList.innerHTML = "";


    editSubtasks.forEach((subtask, index) => {

        editSubtaskList.innerHTML += `

            <li class="subtaskItem editSubtaskItem">

                <span class="subtaskText">
                    • ${subtask.title}
                </span>

                <div class="subtaskItemActions">
                    <button
                        type="button"
                        class="editSubtaskBtn"
                        data-index="${index}">

                        <img
                            src="./assets/img/Subtasks change.svg"
                            alt="Edit subtask">
                    </button>

                    <button
                        type="button"
                        class="deleteSubtaskBtn"
                        data-index="${index}">

                        <img
                            src="./assets/img/SubTask delete.svg"
                            alt="Delete subtask">

                    </button>
                </div>
            </li>
        `;
    });

    initEditSubtaskButtons(
        editSubtasks,
        onChange
    );
}

function initEditSubtaskButtons(editSubtasks, onChange) {

    document
        .querySelectorAll("#editSubtaskList .deleteSubtaskBtn")
        .forEach((button) => {

            button.addEventListener("click", () => {

                const index = Number(button.dataset.index);

                editSubtasks.splice(index, 1);

                renderEditSubtasks(
                    editSubtasks,
                    onChange
                );

                onChange(editSubtasks);
            });
        });

    document
        .querySelectorAll("#editSubtaskList .editSubtaskBtn")
        .forEach((button) => {

            button.addEventListener("click", () => {

                const index = Number(button.dataset.index);

                const subtask =
                    editSubtasks[index];

                const editSubtaskInput =
                    document.getElementById("editSubtaskInput");

                if (!subtask || !editSubtaskInput) return;

                editSubtaskInput.value =
                    subtask.title;

                editSubtasks.splice(index, 1);

                renderEditSubtasks(
                    editSubtasks,
                    onChange
                );

                onChange(editSubtasks);
                editSubtaskInput.focus();

            });
        });
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

