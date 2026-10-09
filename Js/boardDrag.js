import { patchData } from "./storage.js";

/**
 * Stores the ID of the task currently being dragged.
 */
let draggedTaskId = null;
/**
 * Tracks whether a board task is currently being dragged.
 */
let draggingTask = false;
/**
 * Stores the shared board callbacks used during drag-and-drop.
 */
let dragContext = null;

/**
 * Initializes drag events on task cards and drop events on board columns.
 *
 * @returns {void}
 */
export function initDragAndDrop(context) {
  dragContext = context;
  initDraggableCards();
  initDropColumns();
}

/**
 * Adds drag-start and drag-end event handlers to all draggable task cards.
 *
 * @returns {void}
 */
function initDraggableCards() {
  document.querySelectorAll(".card[data-task-id]").forEach((card) => {
    card.addEventListener("dragstart", (event) => {
      startDraggingCard(event, card);
    });

    card.addEventListener("dragend", () => {
      stopDraggingCard(card);
    });
  });
}

/**
 * Starts dragging a task card and configures its custom drag image.
 *
 * @param {DragEvent} event - The drag-start event.
 * @param {HTMLElement} card - The task card being dragged.
 * @returns {void}
 */
function startDraggingCard(event, card) {
  draggedTaskId = card.dataset.taskId;
  draggingTask = true;
  card.classList.add("is-dragging");
  const dragImage = createRotatedDragImage(card);
  setTaskDragImage(event, dragImage);
  requestAnimationFrame(() => dragImage.remove());
}

/**
 * Positions a custom image at the center of the pointer during dragging.
 *
 * @param {DragEvent} event - The drag event containing the data transfer object.
 * @param {HTMLElement} dragImage - The element used as the custom drag image.
 * @returns {void}
 */
function setTaskDragImage(event, dragImage) {
  event.dataTransfer.setDragImage(
    dragImage,
    dragImage.offsetWidth / 2,
    dragImage.offsetHeight / 2,
  );
}

/**
 * Creates and appends a rotated clone of a task card for use while dragging.
 *
 * @param {HTMLElement} card - The task card to clone.
 * @returns {HTMLElement} The custom drag image element.
 */
function createRotatedDragImage(card) {
  const dragImage = card.cloneNode(true);

  dragImage.classList.remove("is-dragging");
  dragImage.classList.add("custom-drag-image");

  dragImage.style.width = `${card.offsetWidth}px`;
  dragImage.style.height = `${card.offsetHeight}px`;

  document.body.appendChild(dragImage);

  return dragImage;
}

/**
 * Ends the visual dragging state and resets the active task information.
 *
 * @param {HTMLElement} card - The task card whose dragging state should be removed.
 * @returns {void}
 */
function stopDraggingCard(card) {
  card.classList.remove("is-dragging");

  setTimeout(() => {
    draggedTaskId = null;
    draggingTask = false;
  }, 0);
}

/**
 * Initializes drop behavior for all board columns that define a task status.
 *
 * @returns {void}
 */
function initDropColumns() {
  document.querySelectorAll(".column[data-status]").forEach(initDropColumn);
}

/**
 * Adds drag-over, drag-leave, and drop event handlers to a board column.
 *
 * @param {HTMLElement} column - The board column to initialize.
 * @returns {void}
 */
function initDropColumn(column) {
  column.addEventListener("dragover", (event) => handleDragOver(event, column));
  column.addEventListener("dragleave", () => handleDragLeave(column));
  column.addEventListener("drop", (event) => handleDrop(event, column));
}

/**
 * Allows a task to be dropped and highlights the active board column.
 *
 * @param {DragEvent} event - The drag-over event.
 * @param {HTMLElement} column - The board column currently under the pointer.
 * @returns {void}
 */
function handleDragOver(event, column) {
  event.preventDefault();
  column.classList.add("is-drag-over");
}

/**
 * Removes the drag-over highlight from a board column.
 *
 * @param {HTMLElement} column - The board column the pointer has left.
 * @returns {void}
 */
function handleDragLeave(column) {
  column.classList.remove("is-drag-over");
}

/**
 * Handles dropping a task into a board column and updates its status.
 *
 * @async
 * @param {DragEvent} event - The drop event.
 * @param {HTMLElement} column - The board column receiving the task.
 * @returns {Promise<void>} A promise that resolves after the drop has been handled.
 */
async function handleDrop(event, column) {
  event.preventDefault();
  column.classList.remove("is-drag-over");

  if (!draggedTaskId) return;

  const newStatus = column.dataset.status;
  await moveTaskToStatus(draggedTaskId, newStatus);
}

/**
 * Moves a task to a new status when the task and status are valid.
 *
 * @async
 * @param {string} taskId - The ID of the task to move.
 * @param {string} newStatus - The destination status.
 * @returns {Promise<void>} A promise that resolves after the move attempt is complete.
 */
async function moveTaskToStatus(taskId, newStatus) {
  if (!taskId || !newStatus) return;
  const task = dragContext.getTasks().find((task) => task.id === taskId);
  if (!task || task.status === newStatus) return;
  try {
    await persistTaskStatus(taskId, task, newStatus);
  } catch (error) {
    console.error("Fehler beim Verschieben des Tasks:", error);
  }
}

/**
 * Persists a task's new status and refreshes the rendered board.
 *
 * @async
 * @param {string} taskId - The ID of the task to update.
 * @param {Object} task - The local task object to update.
 * @param {string} newStatus - The status to save.
 * @returns {Promise<void>} A promise that resolves after the status has been saved.
 */
async function persistTaskStatus(taskId, task, newStatus) {
  await patchData(`tasks/${taskId}`, { status: newStatus });
  task.status = newStatus;
  dragContext.updateFilteredTasks();
  dragContext.renderBoardTasks();
}

/**
 * Checks whether a board task is currently being dragged.
 *
 * @returns {boolean} Whether a board task is currently being dragged.
 */
export function isBoardDragging() {
  return draggingTask;
}
