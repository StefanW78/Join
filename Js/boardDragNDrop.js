
/**
 * Stores the task card currently being dragged.
 */
let draggedCard = null;

// Verbesserte Version vom DragnDrop
/**
 * Initializes drag-and-drop behavior for all task cards and board columns.
 *
 * @returns {void}
 */
function initSimpleDragAndDrop() {
    const board = document.querySelector(".board-columns");
    const columns = document.querySelectorAll(".column");

    let draggedCard = null;

    setupDragStart(board, () => draggedCard, (val) => draggedCard = val);
    setupDragEnd(board, () => draggedCard, (val) => draggedCard = val);
    setupDropZones(columns, () => draggedCard);

}

/**
 * Registers the drag-start handler for task cards on the board.
 *
 * @param {HTMLElement} board - The board element receiving drag events.
 * @param {Function} getCard - The callback that returns the currently dragged card.
 * @param {Function} setCard - The callback that changes the currently dragged card.
 * @returns {void}
 */
function setupDragStart(board, getCard, setCard) {
    board.addEventListener("dragstart", (e) => {

        const card = e.target.closest(".card");
        if (!card) return;

        setCard(card);
        card.classList.add("is-dragging");

    });
}

/**
 * Registers the drag-end handler and clears the active card state.
 *
 * @param {HTMLElement} board - The board element receiving drag events.
 * @param {Function} getCard - The callback that returns the currently dragged card.
 * @param {Function} setCard - The callback that changes the currently dragged card.
 * @returns {void}
 */
function setupDragEnd(board, getCard, setCard) {

    board.addEventListener("dragend", () => {

        const card = getCard();
        if (card) card.classList.remove("is-dragging");

        setCard(null);

    });

}

/**
 * Initializes every board column as a drop zone.
 *
 * @param {NodeListOf<HTMLElement>} columns - The board columns to initialize.
 * @param {Function} getCard - The callback that returns the currently dragged card.
 * @returns {void}
 */
function setupDropZones(columns, getCard) {
    columns.forEach((column) => setupDropZone(column, getCard));
}

/**
 * Initializes drag counters and drop events for one board column.
 *
 * @param {HTMLElement} column - The board column element.
 * @param {Function} getCard - The callback that returns the currently dragged card.
 * @returns {void}
 */
function setupDropZone(column, getCard) {
    const taskList = column.querySelector(".task-list");
    let dragCounter = 0;
    column.addEventListener("dragenter", () => {
        dragCounter = handleDragEnter(column, dragCounter);
    });
    column.addEventListener("dragleave", () => {
        dragCounter = handleDragLeave(column, dragCounter);
    });
    setupDropZoneMoveEvents(column, taskList, getCard, () => dragCounter = 0);
}

/**
 * Registers drag-over and drop handlers for a board column.
 *
 * @param {HTMLElement} column - The board column element.
 * @param {HTMLElement} taskList - The task list containing the draggable cards.
 * @param {Function} getCard - The callback that returns the currently dragged card.
 * @param {Function} resetCounter - The callback used to reset the drag counter.
 * @returns {void}
 */
function setupDropZoneMoveEvents(column, taskList, getCard, resetCounter) {
    column.addEventListener("dragover", (event) => {
        handleDragOver(event, taskList, getCard);
    });
    column.addEventListener("drop", (event) => {
        handleDropZone(event, column, getCard);
        resetCounter();
    });
}

/**
 * Highlights a column and increments its nested drag counter.
 *
 * @param {HTMLElement} column - The board column element.
 * @param {number} dragCounter - The column's current nested drag counter.
 * @returns {number} The updated drag counter.
 */
function handleDragEnter(column, dragCounter) {
    dragCounter++;
    column.classList.add("is-drag-over");
    return dragCounter;
}

/**
 * Decrements a column's drag counter and removes its highlight when appropriate.
 *
 * @param {HTMLElement} column - The board column element.
 * @param {number} dragCounter - The column's current nested drag counter.
 * @returns {number} The updated drag counter.
 */
function handleDragLeave(column, dragCounter) {
    dragCounter--;

    if (dragCounter === 0) {
        column.classList.remove("is-drag-over");
    }

    return dragCounter;
}

/**
 * Repositions the dragged card while it moves over a task list.
 *
 * @param {Event} event - The event that triggered the operation.
 * @param {HTMLElement} taskList - The task list containing the draggable cards.
 * @param {Function} getCard - The callback that returns the currently dragged card.
 * @returns {void}
 */
function handleDragOver(event, taskList, getCard) {
    event.preventDefault();

    const card = getCard();
    if (!card) return;

    moveCard(taskList, card, event);
}

/**
 * Removes a column's highlight and completes the card drop.
 *
 * @param {Event} event - The event that triggered the operation.
 * @param {HTMLElement} column - The board column element.
 * @param {Function} getCard - The callback that returns the currently dragged card.
 * @returns {number} The reset drag counter value.
 */
function handleDropZone(event, column, getCard) {
    column.classList.remove("is-drag-over");
    handleDrop(event, column, getCard);
    return 0;
}

//Test

/**
 * Inserts the dragged card at the position nearest to the pointer.
 *
 * @param {HTMLElement} taskList - The task list containing the draggable cards.
 * @param {HTMLElement} card - The task card element.
 * @param {Event} e - The event that triggered the operation.
 * @returns {void}
 */
function moveCard(taskList, card, e) {

    const afterElement = getDragAfterElement(taskList, e.clientY);

    if (!afterElement) {
        taskList.appendChild(card);
    } else {
        taskList.insertBefore(card, afterElement);
    }

}

/**
 * Persists the new task status after a card is dropped into a column.
 *
 * @async
 * @param {Event} e - The event that triggered the operation.
 * @param {HTMLElement} column - The board column element.
 * @param {Function} getCard - The callback that returns the currently dragged card.
 * @returns {Promise<void>} A promise that resolves when the operation is complete.
 */
async function handleDrop(e, column, getCard) {

    e.preventDefault();

    const card = getCard();
    if (!card) return;

    column.classList.remove("is-drag-over");

    const taskId = card.dataset.id;
    const newStatus = column.dataset.status;

    await moveTask(taskId, newStatus);
}

/**
 * Finds the card that should follow the dragged card at the current pointer position.
 *
 * @param {HTMLElement} container - The task list containing possible insertion targets.
 * @param {number} mouseY - The vertical pointer position.
 * @returns {HTMLElement|undefined} The card after the insertion point, or undefined.
 */
function getDragAfterElement(container, mouseY) {
    const elements = [...container.querySelectorAll(".card:not(.is-dragging)")];
    return elements.reduce((closest, child) => {
        return getCloserDragElement(closest, child, mouseY);
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

/**
 * Returns the closer eligible card while calculating a drag insertion position.
 *
 * @param {Object} closest - The closest insertion candidate found so far.
 * @param {HTMLElement} child - The card currently being compared.
 * @param {number} mouseY - The vertical pointer position.
 * @returns {Object} The closest insertion candidate and its offset.
 */
function getCloserDragElement(closest, child, mouseY) {
    const box = child.getBoundingClientRect();
    const offset = mouseY - box.top - box.height / 2;
    return offset < 0 && offset > closest.offset
        ? { offset, element: child }
        : closest;
}
