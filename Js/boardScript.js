
/**
 * Stores the tasks currently loaded for the board.
 */
let tasks = []
/**
 * Stores the normalized text used to filter board tasks.
 */
let SearchText = "";

/**
 * Maps each task status to its allowed destination statuses.
 */
const moveRules = {
    todo: ["done", "inProgress"],
    inProgress: ["todo", "awaitFeedback"],
    awaitFeedback: ["inProgress", "done"],
    done: ["awaitFeedback", "todo"]
};

/**
 * Maps task statuses to their corresponding board columns.
 */
const columns = {
    todo: document.getElementById("toDo-list"),
    inProgress: document.getElementById("inProgress-list"),
    awaitFeedback: document.getElementById("awaitFeedback-list"),
    done: document.getElementById("Done-list")
};

/**
 * Defines the supported board task status values.
 */
const STATUS = {
    TODO: "todo",
    IN_PROGRESS: "inProgress",
    AWAIT_FEEDBACK: "awaitFeedback",
    DONE: "done"
};

/**
 * Initializes the board by loading tasks and registering its interactions.
 *
 * @async
 * @returns {Promise<void>} A promise that resolves when the operation is complete.
 */
async function Init() {
    await loadTasks()
    renderTasks()
    initSimpleDragAndDrop()
    initBoardSearch()
    document.addEventListener("click", handleBoardClick);
}

/**
 * Loads the tasks.
 *
 * @async
 * @returns {Promise<void>} A promise that resolves when the operation is complete.
 */
async function loadTasks() {
  tasks = Object.values(await loadDataBase("tasks"));
}

/**
 * Renders the tasks.
 *
 * @returns {void}
 */
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

/**
 * Renders the filtered tasks.
 *
 * @returns {void}
 */
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

/**
 * Initializes the board search.
 *
 * @returns {void}
 */
function initBoardSearch() {
    const searchInput = document.getElementById("searchTasks");

    if (!searchInput) return;

    searchInput.addEventListener("input", (event) => {

        SearchText = event.target.value.trim().toLowerCase();
        renderFilteredTasks();

    });
}

/**
 * Filters the loaded tasks using the current board search text.
 *
 * @returns {Object[]} The matching items.
 */
function filterTasks() {
    if (!SearchText) return tasks;
    return tasks.filter(task => {

        const title = (task.title || "").toLowerCase();
        const description = (task.description || "").toLowerCase();

        return title.includes(SearchText) ||
               description.includes(SearchText);

    });
}

/**
 * Renders the move menu.
 *
 * @param {HTMLElement} menu - The move menu to populate.
 * @param {string} currentStatus - The task's current status.
 * @param {string} taskId - The ID of the task.
 * @returns {void}
 */
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

/**
 * Renders the edit overlay.
 *
 * @param {string} taskId - The ID of the task.
 * @returns {void}
 */
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

/**
 * Handles the board click.
 *
 * @param {Event} event - The event that triggered the operation.
 * @returns {void}
 */
function handleBoardClick(event) {

    const moveButton = event.target.closest(".swap-horiz-div");
    const clickedMenu = event.target.closest(".move-menu");
    const card = event.target.closest(".card");

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

/**
 * Toggles the move menu.
 *
 * @param {HTMLElement} button - The button involved in the operation.
 * @returns {void}
 */
function toggleMoveMenu(button) {
    const card = button.closest(".card");
    const menu = card.querySelector(".move-menu");

    if (!menu) return;

    const wasOpen = !menu.classList.contains("d_none");

    closeAllMoveMenus();

    if (wasOpen) return;

    openMoveMenu(card, menu);
}

/**
 * Opens the move menu.
 *
 * @param {HTMLElement} card - The task card element.
 * @param {HTMLElement} menu - The move menu to open.
 * @returns {void}
 */
function openMoveMenu(card, menu) {
    const currentStatus = card.closest(".column").dataset.status;
    const taskId = card.dataset.id;

    renderMoveMenu(menu, currentStatus, taskId);
    menu.classList.remove("d_none");

    scrollMenuIntoView(card, menu);
}

/**
 * Scrolls the menu into view.
 *
 * @param {HTMLElement} card - The task card element.
 * @param {HTMLElement} menu - The move menu that should remain visible.
 * @returns {void}
 */
function scrollMenuIntoView(card, menu) {
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
