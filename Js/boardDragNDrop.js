
let draggedCard = null;

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
    columns.forEach((column) => setupDropZone(column, getCard));
}

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

function setupDropZoneMoveEvents(column, taskList, getCard, resetCounter) {
    column.addEventListener("dragover", (event) => {
        handleDragOver(event, taskList, getCard);
    });
    column.addEventListener("drop", (event) => {
        handleDropZone(event, column, getCard);
        resetCounter();
    });
}

function handleDragEnter(column, dragCounter) {
    dragCounter++;
    column.classList.add("is-drag-over");
    return dragCounter;
}

function handleDragLeave(column, dragCounter) {
    dragCounter--;

    if (dragCounter === 0) {
        column.classList.remove("is-drag-over");
    }

    return dragCounter;
}

function handleDragOver(event, taskList, getCard) {
    event.preventDefault();

    const card = getCard();
    if (!card) return;

    moveCard(taskList, card, event);
}

function handleDropZone(event, column, getCard) {
    column.classList.remove("is-drag-over");
    handleDrop(event, column, getCard);
    return 0;
}

//Test

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
        return getCloserDragElement(closest, child, mouseY);
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function getCloserDragElement(closest, child, mouseY) {
    const box = child.getBoundingClientRect();
    const offset = mouseY - box.top - box.height / 2;
    return offset < 0 && offset > closest.offset
        ? { offset, element: child }
        : closest;
}
