const moveRules = {
    todo: ["done", "inProgress"],
    inProgress: ["todo", "awaitFeedback"],
    awaitFeedback: ["inProgress", "done"],
    done: ["awaitFeedback", "todo"]
};

let draggedCard = null;

let tasks = []

let SearchText = "";

const columns = {
    todo: document.getElementById("toDo-list"),
    inProgress: document.getElementById("inProgress-list"),
    awaitFeedback: document.getElementById("awaitFeedback-list"),
    done: document.getElementById("Done-list")
};

const STATUS = {
    TODO: "todo",
    IN_PROGRESS: "inProgress",
    AWAIT_FEEDBACK: "awaitFeedback",
    DONE: "done"
};

async function Init() {
    await loadTasks()
    renderTasks()
    initSimpleDragAndDrop()
    initBoardSearch()
    document.addEventListener("click", handleBoardClick);
}

async function loadTasks() {
  tasks = Object.values(await loadDataBase("tasks"));
}

function renderTasks() {

    const html = {};

    for (const status in columns) {
        html[status] = "";
    }
    for (const task of tasks) {

    const preparedTask = prepareTaskData(task);
    html[task.status] += getTaskCard(preparedTask);
}
    for (const status in columns) {
        columns[status].innerHTML =
            html[status] || `<div class="empty-card">No tasks</div>`;
    }
}

function renderOneTask(taskId) {

    const task = tasks.find(t => t.id === taskId);

    if (!task) return;

    const preparedTask = prepareTaskData(task);

    const newCardHTML = getTaskCard(preparedTask);

    const oldCard = document.querySelector(`.card[data-id="${taskId}"]`);

    if (!oldCard) return;

    const wrapper = document.createElement("div");
    wrapper.innerHTML = newCardHTML;

    oldCard.replaceWith(wrapper.firstElementChild);

}

function renderFilteredTasks() {

    const filteredTasks = filterTasks();

    const html = {};

    for (const status in columns) {
        html[status] = "";
    }

    for (const task of filteredTasks) {

        const preparedTask = prepareTaskData(task);

        html[task.status] += getTaskCard(preparedTask);

    }

    for (const status in columns) {

        columns[status].innerHTML =
            html[status] || `<div class="empty-card">No matching tasks</div>`;

    }

}

function initBoardSearch() {

    const searchInput = document.getElementById("searchTasks");

    if (!searchInput) return;

    searchInput.addEventListener("input", (event) => {

        SearchText = event.target.value.trim().toLowerCase();

        renderFilteredTasks();

    });

}

function filterTasks() {

    if (!SearchText) return tasks;

    return tasks.filter(task => {

        const title = (task.title || "").toLowerCase();
        const description = (task.description || "").toLowerCase();

        return title.includes(SearchText) ||
               description.includes(SearchText);

    });

}

function renderMoveMenu(menu, currentStatus, taskId) {

    const container = menu.querySelector(".movingto-Div");

    const statusNames = {
        todo: "To Do",
        inProgress: "In Progress",
        awaitFeedback: "Await Feedback",
        done: "Done"
    };

    const allowedStatuses = getAllowedMoves(currentStatus);

    container.innerHTML = "";

    allowedStatuses.forEach((status, index) => {

        container.innerHTML += `
            <div class="${index === 0 ? 'moving-top' : 'moving-down'} move-option"
                 data-task-id="${taskId}"
                 data-status="${status}">

                <img src="./assets/img/${index === 0 ? 'arrow_upward.svg' : 'arrow_upward.svg'}">
                <span>${statusNames[status]}</span>

            </div>
        `;
    });
}

function renderEditOverlay(taskId) {

    const task = tasks.find(t => t.id === taskId);

    if (!task) return;

    const formContainer = document.getElementById("openTaskOverlay");

    if (!formContainer) return;


    formContainer.classList.remove("overlay-content-animation");


    // kurz warten, damit die Animation neu startet
    setTimeout(() => {

        formContainer.innerHTML = getEditOverlayTemplate(task);

        formContainer.classList.add("overlay-content-animation");

    }, 50);
}

function handleBoardClick(event) {

    const moveButton = event.target.closest(".swap-horiz-div");
    const clickedMenu = event.target.closest(".move-menu");
    const card = event.target.closest(".card");

    // 👉 Menü öffnen
    if (moveButton) {
        event.stopPropagation();
        toggleMoveMenu(moveButton);
        return;
    }

    if (clickedMenu) return;

    if (card) {
        renderCardOverlay(card.dataset.id);
        return;
    }
    closeAllMoveMenus();
}

function toggleMoveMenu(button) {

    const card = button.closest(".card");
    const menu = card.querySelector(".move-menu");

    if (!menu) return;

    const wasOpen = !menu.classList.contains("d_none");

    closeAllMoveMenus();

    if (wasOpen) return;

    const currentStatus = card.closest(".column").dataset.status;
    const taskId = card.dataset.id;

    renderMoveMenu(menu, currentStatus, taskId);

    menu.classList.remove("d_none");

    requestAnimationFrame(() => {

    const taskList = card.closest(".task-list");

    const menuRect = menu.getBoundingClientRect();
    const listRect = taskList.getBoundingClientRect();

    if (menuRect.right > listRect.right) {
        taskList.scrollBy({
            left: menuRect.right - listRect.right + 20,
            behavior: "smooth"
        });
    }

});
}

//für das moven von Tasks update.
async function moveTask(taskId, newStatus) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const oldStatus = task.status;

    task.status = newStatus;
    renderTasks();

    try {
        await updateData("tasks", taskId, { status: newStatus });
    } catch (err) {
        task.status = oldStatus;
        renderTasks();
    }
}

async function moveTaskFromMenu(event, taskId, newStatus) {

    event.stopPropagation();

    await moveTask(taskId, newStatus);

    closeAllMoveMenus()
}

function getAllowedMoves(currentStatus) {
    return moveRules[currentStatus] || [];
}


function prepareTaskData(task) {

    const assignedTo = task.assignedTo || [];
    const subtasks = task.subtasks || [];
    const maxVisible = 4;
    const visibleAvatars = assignedTo.slice(0, maxVisible);
    const extraCount = assignedTo.length - maxVisible;

    const avatarsHTML = visibleAvatars
        .map(av => `<div class="av" style="background-color:${av.color}">${av.initials}</div>`)
        .join('');

    const extraHTML = extraCount > 0
        ? `<div class="av-more">+${extraCount}</div>`
        : '';

    const finalAvatarsHTML = avatarsHTML + extraHTML;

    const total = subtasks.length;
    const done = subtasks.filter(s => s.done).length;
    const progress = total > 0 ? (done / total) * 100 : 0;

    const subtasksHTML = total > 0
        ? `
            <div class="progress-bar">
                <div class="progress-fill" style="width:${progress}%"></div>
            </div>
            ${done}/${total} Subtasks
          `
        : '';


    const categoryClassMap = {
        "User Story": "tag-blue",
        "Technical Task": "tag-teal"
    };

    const categoryClass = categoryClassMap[task.category] || "tag-default";


    return {
        ...task,
        avatarsHTML: finalAvatarsHTML,
        subtasksHTML,
        categoryClass
    };
}

function closeAllMoveMenus() {
    document.querySelectorAll(".move-menu").forEach(menu => {
        menu.classList.add("d_none");
    });
}

function renderAssignees(assignees = []) {

    if (!assignees.length) return "";

    return assignees
        .map(user => `
            <div class="avatar">
                ${user.initials || "?"}
            </div>
        `)
        .join("");
}

function getSubtaskStats(subtasks = []) {
    const total = subtasks.length;
    const done = subtasks.filter(s => s.checked).length;

    return {
        total,
        done,
        progress: total ? (done / total) * 100 : 0
    };
}

function getProgressHTML(subtasks = []) {
    const { total, done, progress } = getSubtaskStats(subtasks);

    if (!total) return "";

    return `
        <div class="progress-bar">
            <div class="progress-fill" style="width:${progress}%"></div>
        </div>
        ${done}/${total} Subtasks
    `;
}

document.addEventListener("click", (event) => {

    const option = event.target.closest(".move-option");

    if (!option) return;

    event.stopPropagation();

    const taskId = option.dataset.taskId;
    const status = option.dataset.status;

    moveTask(taskId, status);
});


//für die checkboxen
document.addEventListener("change", async (event) => {
    const checkbox = event.target.closest(".subtask-checkbox");
    if (!checkbox) return;

    const taskId = checkbox.dataset.taskId;
    const subIndex = checkbox.dataset.index;

    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    task.subtasks[subIndex].done = checkbox.checked;

    renderTasks();
    renderCardOverlay(taskId);

    await updateData("tasks", taskId, {
        subtasks: task.subtasks
    });
});

async function deleteCard(taskId) {

    const oldTasks = [...tasks];

    try {

        await deleteData("tasks", taskId);

        tasks = tasks.filter(task => task.id !== taskId);

        renderTasks();
        closeCardOverlay();
        showContextMessage("Task deleted successfully");

    } catch (error) {
        tasks = oldTasks;
        console.error("Fehler beim Löschen:", error);
    }
}

function showContextMessage(message) {

    const box = document.getElementById("contextMessage");
    const text = document.getElementById("contextMessageText");

    if (!box || !text) return;

    text.textContent = message;

    box.classList.add("show");

    setTimeout(() => {

        box.classList.remove("show");

    }, 3000);

}

//Edit format von stefan branch von board.js

function openEditTaskOverlay(taskId) {
  const task = boardTasks.find((task) => task.id === taskId);

  if (!task) return;

  const formContainer = document.getElementById("cardFormContainer");

  formContainer.classList.add("edit-mode");
  formContainer.innerHTML = getEditTaskTemplate(task);

  initEditTaskForm(task);
}

function initEditTaskForm(task) {
  let selectedEditPriority = task.priority || "medium";
  let selectedEditContacts = [...(task.assignedTo || [])];
  let editSubtasks = [...(task.subtasks || [])];

  document
    .getElementById("closeEditTaskOverlayBtn")
    .addEventListener("click", closeTaskDetailOverlay);

  document.getElementById("cancelEditTaskBtn").addEventListener("click", () => {
    openTaskDetailOverlay(task.id);
  });

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

async function saveEditedTask(
  taskId,
  selectedPriority,
  selectedEditContacts,
  editSubtasks,
) {
  const editTaskTitle = document.getElementById("editTaskTitle");
  const editTaskDescription = document.getElementById("editTaskDescription");
  const editTaskDate = document.getElementById("editTaskDate");
  const editTaskCategory = document.getElementById("editTaskCategory");

  const updatedTask = {
    title: editTaskTitle.value.trim(),
    description: editTaskDescription.value.trim(),
    dueDate: editTaskDate.value.trim(),
    dueDateISO: convertDateToISO(editTaskDate.value.trim()),
    category: editTaskCategory.value,
    priority: selectedPriority,
    assignedTo: selectedEditContacts,
    subtasks: editSubtasks,
  };

  if (!updatedTask.title) {
    editTaskTitle.classList.add("inputError");
    return;
  }

  try {
    await patchData(`tasks/${taskId}`, updatedTask);

    updateTaskInBoardTasks(taskId, updatedTask);

    updateFilteredTasks();
    closeTaskDetailOverlay();
    renderBoardTasks();
  } catch (error) {
    console.error("Fehler beim Aktualisieren des Tasks:", error);
  }
}

function updateTaskInBoardTasks(taskId, updatedTask) {
  boardTasks = boardTasks.map((task) => {
    if (task.id === taskId) {
      return {
        ...task,
        ...updatedTask,
      };
    }

    return task;
  });
}

function convertDateToISO(dateValue) {
  if (!dateValue.includes("/")) {
    return dateValue;
  }

  const [day, month, year] = dateValue.split("/");
  return `${year}-${month}-${day}`;
}

function initEditPriorityButtons(onChange) {
  document.querySelectorAll(".editPriorityBtn").forEach((button) => {
    button.addEventListener("click", () => {
      const selectedPriority = button.dataset.priority;

      document.querySelectorAll(".editPriorityBtn").forEach((btn) => {
        btn.classList.remove("activeUrgent", "activeMedium", "activeLow");
      });

      if (selectedPriority === "urgent") {
        button.classList.add("activeUrgent");
      }

      if (selectedPriority === "medium") {
        button.classList.add("activeMedium");
      }

      if (selectedPriority === "low") {
        button.classList.add("activeLow");
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
        <div class="contactAvatar" style="background:${getAvatarColor(index)}">
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
        const contact = contacts.find((item) => item.id === contactId);

        if (!contact) return;

        const isSelected = selectedEditContacts.some(
          (item) => item.id === contactId,
        );

        if (isSelected) {
          selectedEditContacts = selectedEditContacts.filter(
            (item) => item.id !== contactId,
          );
        } else {
          selectedEditContacts.push(contact);
        }

        editAssignedInput.value = "";
        renderEditAssignedContacts(selectedEditContacts);
        renderEditContactOptions(selectedEditContacts, onChange);
        onChange(selectedEditContacts);
      });
    });
}

/* function renderEditAssignedContacts(selectedEditContacts) {
  const editSelectedContacts = document.getElementById("editSelectedContacts");

  if (!editSelectedContacts) return;

  editSelectedContacts.innerHTML = "";

  selectedEditContacts.forEach((contact, index) => {
    editSelectedContacts.innerHTML += `
      <div
        class="selectedAvatar"
        style="background:${getAvatarColor(index)}"
        title="${contact.name || ""}"
      >
        ${contact.initials || getInitials(contact.name)}
      </div>
    `;
  });
}
 */
function initEditSubtasks(editSubtasks, onChange) {
  const editSubtaskInput = document.getElementById("editSubtaskInput");
  const editAddSubtaskBtn = document.getElementById("editAddSubtaskBtn");
  const editClearSubtaskBtn = document.getElementById("editClearSubtaskBtn");

  renderEditSubtasks(editSubtasks, onChange);

  editSubtaskInput.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;

    event.preventDefault();
    addEditSubtask(editSubtasks, onChange);
  });

  editAddSubtaskBtn.addEventListener("click", () => {
    addEditSubtask(editSubtasks, onChange);
  });

  editClearSubtaskBtn.addEventListener("click", () => {
    editSubtaskInput.value = "";
    editSubtaskInput.focus();
  });
}

function addEditSubtask(editSubtasks, onChange) {
  const editSubtaskInput = document.getElementById("editSubtaskInput");
  const subtaskText = editSubtaskInput.value.trim();

  if (!subtaskText) return;

  editSubtasks.push({
    title: subtaskText,
    done: false,
  });

  editSubtaskInput.value = "";

  renderEditSubtasks(editSubtasks, onChange);
  onChange(editSubtasks);
}

function renderEditSubtasks(editSubtasks, onChange) {
  const editSubtaskList = document.getElementById("editSubtaskList");

  editSubtaskList.innerHTML = "";

  editSubtasks.forEach((subtask, index) => {
    editSubtaskList.innerHTML += `
      <li class="subtaskItem editSubtaskItem">
        <span class="subtaskText">• ${subtask.title}</span>

        <div class="subtaskItemActions">
          <button type="button" class="editSubtaskBtn" data-index="${index}">
            <img src="./assets/img/Subtasks change.svg" alt="Edit subtask" />
          </button>

          <button type="button" class="deleteSubtaskBtn" data-index="${index}">
            <img src="./assets/img/SubTask delete.svg" alt="Delete subtask" />
          </button>
        </div>
      </li>
    `;
  });

  initEditSubtaskButtons(editSubtasks, onChange);
}

function initEditSubtaskButtons(editSubtasks, onChange) {
  document.querySelectorAll("#editSubtaskList .deleteSubtaskBtn").forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.index);

      editSubtasks.splice(index, 1);
      renderEditSubtasks(editSubtasks, onChange);
      onChange(editSubtasks);
    });
  });

  document.querySelectorAll("#editSubtaskList .editSubtaskBtn").forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.index);
      const editSubtaskInput = document.getElementById("editSubtaskInput");

      editSubtaskInput.value = editSubtasks[index].title;

      editSubtasks.splice(index, 1);
      renderEditSubtasks(editSubtasks, onChange);
      onChange(editSubtasks);

      editSubtaskInput.focus();
    });
  });
}

function renderEditAssignedContacts(selectedEditContacts) {
  const editSelectedContacts = document.getElementById("editSelectedContacts");
  const editMoreContactsDropdown = document.getElementById(
    "editMoreContactsDropdown",
  );

  if (!editSelectedContacts || !editMoreContactsDropdown) return;

  editSelectedContacts.innerHTML = "";
  editMoreContactsDropdown.innerHTML = "";
  editMoreContactsDropdown.classList.add("d_none");

  const visibleContacts = selectedEditContacts.slice(0, 3);
  const hiddenContacts = selectedEditContacts.slice(3);

  visibleContacts.forEach((contact, index) => {
    editSelectedContacts.innerHTML += `
      <div
        class="selectedAvatar"
        style="background:${getAvatarColor(index)}"
        title="${contact.name || ""}"
      >
        ${contact.initials || getInitials(contact.name)}
      </div>
    `;
  });

  if (hiddenContacts.length > 0) {
    editSelectedContacts.innerHTML += `
      <button type="button" class="moreContactsBtn" id="editMoreContactsBtn">
        +${hiddenContacts.length}
      </button>
    `;

    hiddenContacts.forEach((contact, index) => {
      editMoreContactsDropdown.innerHTML += `
        <div class="moreContactItem">
          <div
            class="selectedAvatar"
            style="background:${getAvatarColor(index + 3)}"
          >
            ${contact.initials || getInitials(contact.name)}
          </div>
          <span>${contact.name || ""}</span>
        </div>
      `;
    });

    const editMoreContactsBtn = document.getElementById("editMoreContactsBtn");

    editMoreContactsBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      editMoreContactsDropdown.classList.toggle("d_none");
    });
  }
}
