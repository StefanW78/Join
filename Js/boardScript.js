
let tasks = []
let SearchText = "";

const moveRules = {
    todo: ["done", "inProgress"],
    inProgress: ["todo", "awaitFeedback"],
    awaitFeedback: ["inProgress", "done"],
    done: ["awaitFeedback", "todo"]
};

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
        container.innerHTML += moveOptionTemplate(
            index,
            taskId,
            status,
            statusNames[status]
        );
    });
}

function renderEditOverlay(taskId) {
    const task = tasks.find(t => t.id === taskId);

    if (!task) return;

    const formContainer = document.getElementById("openTaskOverlay");

    if (!formContainer) return;

    formContainer.classList.remove("overlay-content-animation");

    setTimeout(() => {

        formContainer.innerHTML = getEditOverlayTemplate(task);

        initEditTaskForm(task);

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
    return {
        ...task,
        avatarsHTML: createAvatarsHTML(task.assignedTo || []),
        subtasksHTML: createSubtasksHTML(task.subtasks || []),
        categoryClass: getCategoryClass(task.category)
    };
}

function createAvatarsHTML(assignedTo) {
    const maxVisible = 4;
    const visibleAvatars = assignedTo.slice(0, maxVisible);
    const extraCount = assignedTo.length - maxVisible;

    const avatars = visibleAvatars
        .map(createAvatarTemplate)
        .join("");

    return avatars + createExtraAvatar(extraCount);
}

function createSubtasksHTML(subtasks) {
    if (!subtasks.length) return "";

    const done = getDoneSubtasks(subtasks);
    const progress = (done / subtasks.length) * 100;

    return progressTemplate(progress, done, subtasks.length);
}

function calculateProgress(subtasks) {
    return (getDoneSubtasks(subtasks) / subtasks.length) * 100;
}

function getDoneSubtasks(subtasks) {
    return subtasks.filter(subtask => subtask.done).length;
}

function getCategoryClass(category) {
    const categoryClassMap = {
        "User Story": "tag-blue",
        "Technical Task": "tag-teal"
    };

    return categoryClassMap[category] || "tag-default";
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