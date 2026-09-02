/**
 * Creates the complete HTML markup for the legacy task edit overlay.
 *
 * @param {Object} task - The task to process.
 * @returns {string} The generated value or HTML markup.
 */
function getEditOverlayTemplate(task) {
    return `
        <div class="task-card-header">
            <h3 class="edit-task-title">Edit Task</h3>

            <button
                class="task-close-btn"
                onclick="renderCardOverlay('${task.id}')">
                &times;
            </button>
        </div>

        <form id="editTaskForm" class="taskForm">

            <div class="formGrid editFormGrid">

                <div class="formColumn">

                    <div class="formGroup">
                        <label for="editTaskTitle">Title</label>

                        <input
                            id="editTaskTitle"
                            type="text"
                            value="${task.title || ""}">

                        <p class="fieldError" id="editTaskTitleError"></p>
                    </div>

                    <div class="formGroup">
                        <label for="editTaskDescription">Description</label>

                        <textarea id="editTaskDescription">${task.description || ""}</textarea>
                    </div>

                    <div class="formGroup">
                        <label for="editTaskDate">Due date</label>

                        <div class="inputWithIcon">
                            <input
                                id="editTaskDate"
                                type="text"
                                value="${task.dueDate || ""}"
                                placeholder="dd/mm/yyyy"
                                inputmode="numeric"
                                maxlength="10">

                            <img
                                src="./assets/img/calendar-icon.svg"
                                alt="calendar icon">
                        </div>

                        <p class="fieldError" id="editTaskDateError"></p>
                    </div>

                </div>

                <div class="formColumn">

                    <fieldset class="formGroup priorityGroup">
                        <legend>Priority</legend>

                        <div class="priorityButtons">

                            <button
                                type="button"
                                class="priorityBtn editPriorityBtn urgentBtn ${task.priority === "urgent" ? "activeUrgent" : ""}"
                                data-priority="urgent">

                                <span>Urgent</span>

                                <img
                                    src="./assets/img/PrioUP-icon.svg"
                                    alt="urgent">
                            </button>

                            <button
                                type="button"
                                class="priorityBtn editPriorityBtn mediumBtn ${!task.priority || task.priority === "medium" ? "activeMedium" : ""}"
                                data-priority="medium">

                                <span>Medium</span>

                                <img
                                    src="./assets/img/PrioMedium-icon.svg"
                                    alt="medium">
                            </button>

                            <button
                                type="button"
                                class="priorityBtn editPriorityBtn lowBtn ${task.priority === "low" ? "activeLow" : ""}"
                                data-priority="low">

                                <span>Low</span>

                                <img
                                    src="./assets/img/PrioDown-icon.svg"
                                    alt="low">
                            </button>

                        </div>
                    </fieldset>

                    <div class="formGroup">
                        <label for="editTaskCategory">Category</label>

                        <select id="editTaskCategory">

                            <option
                                value="Technical Task"
                                ${task.category === "Technical Task" ? "selected" : ""}>
                                Technical Task
                            </option>

                            <option
                                value="User Story"
                                ${task.category === "User Story" ? "selected" : ""}>
                                User Story
                            </option>

                        </select>

                        <p class="fieldError" id="editTaskCategoryError"></p>
                    </div>

                    <div class="formGroup">

                        <label for="editAssignedInput">
                            Assigned to
                        </label>

                        <div
                            class="customDropdown"
                            id="editAssignedDropdown">

                            <input
                                type="text"
                                class="dropdownButton"
                                id="editAssignedInput"
                                placeholder="Select contacts to assign"
                                autocomplete="off">

                            <div
                                class="dropdownList d_none"
                                id="editAssignedList">
                            </div>

                        </div>

                        <div class="selectedContactsWrapper">

                            <div
                                class="selectedContacts"
                                id="editSelectedContacts">
                            </div>

                            <div
                                class="moreContactsDropdown d_none"
                                id="editMoreContactsDropdown">
                            </div>

                        </div>

                    </div>

                    <div class="formGroup">

                        <label for="editSubtaskInput">
                            Subtasks
                        </label>

                        <div class="subtaskInputWrapper">

                            <input
                                id="editSubtaskInput"
                                type="text"
                                placeholder="Add new subtask">

                            <div class="subtaskActions">

                                <button
                                    type="button"
                                    id="editClearSubtaskBtn">
                                    &times;
                                </button>

                                <div class="subtaskDivider"></div>

                                <button
                                    type="button"
                                    id="editAddSubtaskBtn">
                                    ✓
                                </button>

                            </div>

                        </div>

                        <div class="subtasksWrapper">

                            <ul
                                class="subtaskList"
                                id="editSubtaskList">
                            </ul>

                        </div>

                    </div>

                </div>

            </div>

        </form>

        <div class="editTaskActions">

            <button
                type="button"
                class="clearBtn"
                onclick="renderCardOverlay('${task.id}')">
                Cancel ✕

            </button>

            <button
                type="submit"
                form="editTaskForm"
                class="createTaskBtn">
                Ok ✓
            </button>

        </div>
    `;
}

//Test


/**
 * Creates avatar markup for a selected edit contact.
 *
 * @param {Object} contact - The contact to render.
 * @returns {string} The generated value or HTML markup.
 */
function getEditAssignedContactTemplate(contact) {

    return `
        <div
            class="selectedAvatar"
            style="background:${contact.color}"
            title="${contact.name || ""}">

            ${contact.initials || getInitials(contact.name)}

        </div>
    `;
}


/**
 * Creates markup for an additional selected edit contact.
 *
 * @param {Object} contact - The contact to render.
 * @returns {string} The generated value or HTML markup.
 */
function getEditMoreContactTemplate(contact) {

    return `
        <div class="moreContactItem">

            <div
                class="selectedAvatar"
                style="background:${contact.color}">

                ${contact.initials || getInitials(contact.name)}

            </div>

            <span>
                ${contact.name || ""}
            </span>

        </div>
    `;
}

/**
 * Creates avatar markup for an assigned contact.
 *
 * @param {Object} contact - The contact to render.
 * @returns {string} The generated value or HTML markup.
 */
function createAvatarTemplate(contact) {
    return `
        <div class="av" style="background-color:${contact.color}">
            ${contact.initials}
        </div>
    `;
}

/**
 * Creates the counter avatar for additional assigned contacts.
 *
 * @param {number} extraCount - The number of additional contacts.
 * @returns {string} The generated value or HTML markup.
 */
function createExtraAvatar(extraCount) {
    if (extraCount <= 0) return "";
    return `<div class="av-more">+${extraCount}</div>`;
}

/**
 * Creates progress bar markup for completed subtasks.
 *
 * @param {number} progress - The subtask completion percentage.
 * @param {number} done - The number of completed subtasks.
 * @param {number} total - The total number of subtasks.
 * @returns {string} The generated value or HTML markup.
 */
function progressTemplate(progress, done, total) {
    return `
        <div class="progress-bar">
            <div class="progress-fill" style="width:${progress}%"></div>
        </div>
        ${done}/${total} Subtasks
    `;
}

/**
 * Creates the markup for one task status move option.
 *
 * @param {number} index - The item's position in its collection.
 * @param {string} taskId - The ID of the task.
 * @param {string} status - The destination task status.
 * @param {string} statusName - The display label for the destination status.
 * @returns {string} The generated value or HTML markup.
 */
function moveOptionTemplate(index, taskId, status, statusName) {
    return `
        <div class="${index === 0 ? 'moving-top' : 'moving-down'} move-option"
             data-task-id="${taskId}"
             data-status="${status}">

            <img src="./assets/img/arrow_upward.svg">
            <span>${statusName}</span>

        </div>
    `;
}

/**
 * Creates selectable contact markup for the assignment dropdown.
 *
 * @param {Object} contact - The contact to render.
 * @param {Object[]} selectedContacts - The currently selected contacts.
 * @returns {string} The generated value or HTML markup.
 */
function createContactOptionTemplate(contact, selectedContacts) {
    const isSelected = selectedContacts.some(
        item => item.id === contact.id
    );

    return `
        <div class="contactOption ${isSelected ? "selectedContactOption" : ""}" 
             data-contact-id="${contact.id}">

            <div class="contactAvatar" style="background:${contact.color}">
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
}

/**
 * Creates editable subtask markup for the task edit form.
 *
 * @param {Object} subtask - The subtask to render.
 * @param {number} index - The item's position in its collection.
 * @returns {string} The generated value or HTML markup.
 */
function editSubtaskTemplate(subtask, index) {
    return `
        <li class="subtaskItem editSubtaskItem">

            <span class="subtaskText">
                • ${subtask.title}
            </span>

            <div class="subtaskItemActions">

                <button
                    type="button"
                    class="editSubtaskBtn"
                    data-index="${index}">

                    <img
                        src="./assets/img/Subtasks change.svg"
                        alt="Edit subtask">

                </button>


                <button
                    type="button"
                    class="deleteSubtaskBtn"
                    data-index="${index}">

                    <img
                        src="./assets/img/SubTask delete.svg"
                        alt="Delete subtask">

                </button>

            </div>

        </li>
    `;
}
