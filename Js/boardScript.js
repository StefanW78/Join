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

    // 🔥 HIER NEU: Validierung
    const allowed = moveRules[task.status];

    if (!allowed?.includes(newStatus)) {
        console.warn("Move not allowed:", task.status, "→", newStatus);
        return;
    }

    const oldStatus = task.status;

    // UI sofort updaten
    task.status = newStatus;
    renderTasks();

    try {
        await updateData("tasks", taskId, { status: newStatus });
    } catch (error) {

        console.error("MoveTask failed:", error);

        // rollback
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




// Verbesserte Version vom DragnDrop
function initSimpleDragAndDrop() {

    const board = document.querySelector(".board-columns");
    const columns = document.querySelectorAll(".column");

    let draggedCard = null;

    setupDragStart(board, () => draggedCard, (val) => draggedCard = val);
    setupDragEnd(board, () => draggedCard, (val) => draggedCard = val);
    setupDropZones(columns, () => draggedCard);

}

function setupDragStart(board, getCard, setCard) {

    board.addEventListener("dragstart", (e) => {

        const card = e.target.closest(".card");
        if (!card) return;

        setCard(card);
        card.classList.add("is-dragging");

    });

}

function setupDragEnd(board, getCard, setCard) {

    board.addEventListener("dragend", () => {

        const card = getCard();
        if (card) card.classList.remove("is-dragging");

        setCard(null);

    });

}

function setupDropZones(columns, getCard) {

    columns.forEach(column => {

        const taskList = column.querySelector(".task-list");

        let dragCounter = 0;

        column.addEventListener("dragenter", () => {
            dragCounter++;
            column.classList.add("is-drag-over");
        });

        column.addEventListener("dragleave", () => {
            dragCounter--;
            if (dragCounter === 0) {
                column.classList.remove("is-drag-over");
            }
        });

        column.addEventListener("dragover", (e) => {
            e.preventDefault();

            const card = getCard();
            if (!card) return;

            moveCard(taskList, card, e);
        });

        column.addEventListener("drop", (e) => {
            dragCounter = 0; 
            column.classList.remove("is-drag-over");

            handleDrop(e, column, getCard);
        });

    });
}

function moveCard(taskList, card, e) {

    const afterElement = getDragAfterElement(taskList, e.clientY);

    if (!afterElement) {
        taskList.appendChild(card);
    } else {
        taskList.insertBefore(card, afterElement);
    }

}

async function handleDrop(e, column, getCard) {

    e.preventDefault();

    const card = getCard();
    if (!card) return;

    column.classList.remove("is-drag-over");

    const taskId = card.dataset.id;
    const newStatus = column.dataset.status;

    await moveTask(taskId, newStatus);
}

function getDragAfterElement(container, mouseY) {

    const elements = [...container.querySelectorAll(".card:not(.is-dragging)")];

    return elements.reduce((closest, child) => {

        const box = child.getBoundingClientRect();
        const offset = mouseY - box.top - box.height / 2;

        if (offset < 0 && offset > closest.offset) {
            return { offset, element: child };
        }

        return closest;

    }, { offset: Number.NEGATIVE_INFINITY }).element;

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
