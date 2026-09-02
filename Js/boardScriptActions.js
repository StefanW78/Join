/**
 * Moves a task to a new status and restores it if persistence fails.
 *
 * @async
 * @param {string} taskId - The ID of the task.
 * @param {string} newStatus - The status to assign to the task.
 * @returns {Promise<void>} A promise that resolves when the operation is complete.
 */
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

/**
 * Moves a task to the status selected in its move menu.
 *
 * @async
 * @param {Event} event - The event that triggered the operation.
 * @param {string} taskId - The ID of the task.
 * @param {string} newStatus - The status to assign to the task.
 * @returns {Promise<void>} A promise that resolves when the operation is complete.
 */
async function moveTaskFromMenu(event, taskId, newStatus) {
    event.stopPropagation();

    await moveTask(taskId, newStatus);

    closeAllMoveMenus()
}

/**
 * Returns the statuses to which a task may move from its current status.
 *
 * @param {string} currentStatus - The task's current status.
 * @returns {string[]} The allowed destination statuses.
 */
function getAllowedMoves(currentStatus) {
    return moveRules[currentStatus] || [];
}

/**
 * Adds generated display values to a task before it is rendered.
 *
 * @param {Object} task - The task to process.
 * @returns {Object} The generated data object.
 */
function prepareTaskData(task) {
    return {
        ...task,
        avatarsHTML: createAvatarsHTML(task.assignedTo || []),
        subtasksHTML: createSubtasksHTML(task.subtasks || []),
        categoryClass: getCategoryClass(task.category)
    };
}

/**
 * Creates the avatar markup for contacts assigned to a task.
 *
 * @param {Object[]} assignedTo - The contacts assigned to the task.
 * @returns {string} The generated value or HTML markup.
 */
function createAvatarsHTML(assignedTo) {
    const maxVisible = 4;
    const visibleAvatars = assignedTo.slice(0, maxVisible);
    const extraCount = assignedTo.length - maxVisible;

    const avatars = visibleAvatars
        .map(createAvatarTemplate)
        .join("");

    return avatars + createExtraAvatar(extraCount);
}

/**
 * Creates the progress markup for a task's subtasks.
 *
 * @param {Object[]} subtasks - The subtasks to process.
 * @returns {string} The generated value or HTML markup.
 */
function createSubtasksHTML(subtasks) {
    if (!subtasks.length) return "";

    const done = getDoneSubtasks(subtasks);
    const progress = (done / subtasks.length) * 100;

    return progressTemplate(progress, done, subtasks.length);
}

/**
 * Calculates the completion percentage for a list of subtasks.
 *
 * @param {Object[]} subtasks - The subtasks to process.
 * @returns {number} The calculated numeric result.
 */
function calculateProgress(subtasks) {
    return (getDoneSubtasks(subtasks) / subtasks.length) * 100;
}

/**
 * Counts the completed subtasks in a list.
 *
 * @param {Object[]} subtasks - The subtasks to process.
 * @returns {number} The calculated numeric result.
 */
function getDoneSubtasks(subtasks) {
    return subtasks.filter(subtask => subtask.done).length;
}

/**
 * Retrieves the category class.
 *
 * @param {string} category - The task category.
 * @returns {string} The generated value or HTML markup.
 */
function getCategoryClass(category) {
    const categoryClassMap = {
        "User Story": "tag-blue",
        "Technical Task": "tag-teal"
    };

    return categoryClassMap[category] || "tag-default";
}

/**
 * Closes all open task move menus.
 *
 * @returns {void}
 */
function closeAllMoveMenus() {
    document.querySelectorAll(".move-menu").forEach(menu => {
        menu.classList.add("d_none");
    });
}

/**
 * Creates the avatar markup for a list of assigned users.
 *
 * @param {Object[]} assignees - The users assigned to the task.
 * @returns {string} The generated value or HTML markup.
 */
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

/**
 * Calculates the total, completed count, and progress for a list of subtasks.
 *
 * @param {Object[]} subtasks - The subtasks to process.
 * @returns {Object} The generated data object.
 */
function getSubtaskStats(subtasks = []) {
    const total = subtasks.length;
    const done = subtasks.filter(s => s.checked).length;

    return {
        total,
        done,
        progress: total ? (done / total) * 100 : 0
    };
}

/**
 * Creates progress bar markup for a list of subtasks.
 *
 * @param {Object[]} subtasks - The subtasks to process.
 * @returns {string} The generated value or HTML markup.
 */
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

document.addEventListener("change", handleSubtaskChange);

/**
 * Saves a changed subtask checkbox and refreshes its task overlay.
 *
 * @async
 * @param {Event} event - The event that triggered the operation.
 * @returns {Promise<void>} A promise that resolves when the operation is complete.
 */
async function handleSubtaskChange(event) {
    const checkbox = event.target.closest(".subtask-checkbox");
    if (!checkbox) return;

    const task = tasks.find(task => task.id === checkbox.dataset.taskId);
    if (!task) return;

    task.subtasks[checkbox.dataset.index].done = checkbox.checked;

    refreshTask(task.id);
    await saveSubtasks(task);
}

/**
 * Refreshes a task on both the board and its detail overlay.
 *
 * @param {string} taskId - The ID of the task.
 * @returns {void}
 */
function refreshTask(taskId) {
    renderTasks();
    renderCardOverlay(taskId);
}

/**
 * Saves the subtasks.
 *
 * @async
 * @param {Object} task - The task to process.
 * @returns {Promise<void>} A promise that resolves when the operation is complete.
 */
async function saveSubtasks(task) {
    await updateData("tasks", task.id, {
        subtasks: task.subtasks,
    });
}

/**
 * Deletes the card.
 *
 * @async
 * @param {string} taskId - The ID of the task.
 * @returns {Promise<void>} A promise that resolves when the operation is complete.
 */
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

/**
 * Displays the context message.
 *
 * @param {string} message - The message to display.
 * @returns {void}
 */
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
