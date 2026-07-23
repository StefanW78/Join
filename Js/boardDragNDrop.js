
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