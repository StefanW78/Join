import { loadData } from "./storage.js";
import {
  getTaskCardTemplate, getAvatarColor, renderEmptyMessages,
} from "./boardCards.js";
import { initDragAndDrop } from "./boardDrag.js";
import { initTaskCardClicks } from "./boardDetails.js";

/**
 * Stores all tasks currently loaded on the board.
 */
let boardTasks = [];
/**
 * Stores the contacts available for task assignment.
 */
let contacts = [];
/**
 * Stores the board tasks matching the current search.
 */
let filteredTasks = [];

/**
 * Initializes the board by loading tasks and users,
 * preparing the board data, and rendering all task cards.
 *
 * @async
 * @returns {Promise<void>} A promise that resolves when the board has been initialized.
 */
async function initBoard() {
  try {
    const tasksObject = await loadData("tasks");
    const usersObject = await loadData("users");
    contacts = Object.entries(usersObject).map(createBoardContact);
    boardTasks = Object.entries(tasksObject).map(createBoardTask);
    filteredTasks = boardTasks;
    initBoardSearch();
    renderBoardTasks();
  } catch (error) {
    console.error("Fehler beim Laden der Board-Daten:", error);
  }
}

/**
 * Creates a contact object for use on the board.
 * Adds the database ID and provides a fallback avatar color when necessary.
 *
 * @param {[string, Object]} contactEntry - The contact ID and user data from the database.
 * @param {number} index - The contact's position in the loaded user list.
 * @returns {Object} The normalized board contact.
 */
function createBoardContact([id, user], index) {
  return { id, name: user.name, email: user.email,
    initials: user.initials, color: user.color || getAvatarColor(index) };
}

/**
 * Creates a task object for use on the board.
 * Adds the database ID to the stored task data.
 *
 * @param {[string, Object]} taskEntry - The task ID and task data from the database.
 * @returns {Object} The normalized board task.
 */
function createBoardTask([id, task]) {
  return { id, ...task };
}



/**
 * Renders all filtered tasks in their corresponding board columns.
 * Also updates empty messages, card click events, and drag-and-drop behavior.
 *
 * @returns {void}
 */
function renderBoardTasks() {
  clearBoardColumns();
  filteredTasks.forEach(renderTaskIntoColumn);
  renderEmptyMessages();
  const context = getBoardContext();
  initTaskCardClicks(context);
  initDragAndDrop(context);
}

/**
 * Renders a single task inside the column matching its current status.
 *
 * @param {Object} task - The task to render.
 * @returns {void}
 */
function renderTaskIntoColumn(task) {
  const targetColumn = getTargetColumn(task.status);
  if (targetColumn) targetColumn.innerHTML += getTaskCardTemplate(task, contacts);
}

/**
 * Initializes the board search field and updates the displayed tasks
 * whenever the search value changes.
 *
 * @returns {void}
 */
function initBoardSearch() {
  const boardSearch = document.getElementById("boardSearch");

  if (!boardSearch) return;

  boardSearch.addEventListener("input", () => {
    updateFilteredTasks();
    renderBoardTasks();
  });
}

/**
 * Filters the board tasks by the current search text.
 * Task titles and descriptions are searched case-insensitively.
 *
 * @returns {void}
 */
function updateFilteredTasks() {
  const boardSearch = document.getElementById("boardSearch");
  const searchText = boardSearch ? boardSearch.value.trim().toLowerCase() : "";

  filteredTasks = boardTasks.filter((task) => {
    const title = (task.title || "").toLowerCase();
    const description = (task.description || "").toLowerCase();

    return title.includes(searchText) || description.includes(searchText);
  });
}

/**
 * Removes all rendered task cards and empty messages from the board columns.
 *
 * @returns {void}
 */
function clearBoardColumns() {
  document.getElementById("todoTasks").innerHTML = "";
  document.getElementById("inProgressTasks").innerHTML = "";
  document.getElementById("awaitFeedbackTasks").innerHTML = "";
  document.getElementById("doneTasks").innerHTML = "";
}

/**
 * Retrieves the board column associated with a task status.
 * Falls back to the to-do column when the status is unknown.
 *
 * @param {string} status - The task status used to select a board column.
 * @returns {HTMLElement|null} The matching board column, or null if it is not found.
 */
function getTargetColumn(status) {
  const columnIds = {
    todo: "todoTasks",
    inProgress: "inProgressTasks",
    awaitFeedback: "awaitFeedbackTasks",
    done: "doneTasks",
  };
  return document.getElementById(columnIds[status] || columnIds.todo);
}

/**
 * Creates the shared task data and callbacks used by the board modules.
 *
 * @returns {Object} The shared board context.
 */
function getBoardContext() {
  return {
    getTasks: () => boardTasks,
    getContacts: () => contacts,
    updateFilteredTasks,
    renderBoardTasks,
    removeTask: taskId => boardTasks = boardTasks.filter(task => task.id !== taskId),
    updateTaskInBoardTasks,
  };
}

/**
 * Updates a task in the board's local task collection.
 *
 * @param {string} taskId - The ID of the task.
 * @param {Object} updatedTask - The updated task values.
 * @returns {void}
 */
function updateTaskInBoardTasks(taskId, updatedTask) {
  boardTasks = boardTasks.map(task =>
    task.id === taskId ? { ...task, ...updatedTask } : task);
}

initBoard();
