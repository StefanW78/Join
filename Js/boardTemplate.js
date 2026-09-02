/**
 * Returns a task's due date in ISO format.
 *
 * @param {Object} task - The task to process.
 * @returns {string} The task due date in ISO format.
 */
function getTaskDateISO(task) {
  if (task.dueDateISO) {
    return task.dueDateISO;
  }

  const dueDate = task.dueDate || "";

  if (!dueDate.includes("/")) {
    return dueDate;
  }

  const [day, month, year] = dueDate.split("/");

  return `${year}-${month}-${day}`;
}

/**
 * Creates the complete HTML markup for the board task edit form.
 *
 * @param {Object} task - The task to process.
 * @returns {string} The generated HTML markup for the task edit form.
 */
function getEditTaskTemplate(task) {
  return `
    <div class="task-card edit-task-card">
      <div class="task-card-header edit-task-card-header">
        <button
          class="task-close-btn"
          id="closeEditTaskOverlayBtn"
          type="button"
          aria-label="Close edit task"
        >
          <img src="./assets/img/close-icon.svg" alt="" />
        </button>
      </div>

      <form id="editTaskForm" class="taskForm">
        <input
          id="editTaskCategory"
          type="hidden"
          value="${task.category || "Technical Task"}"
        />
        <p class="fieldError" id="editTaskCategoryError"></p>

        <div class="formGrid editFormGrid">
          <div class="formColumn">
            <div class="formGroup">
              <label for="editTaskTitle">Title</label>
              <input
                id="editTaskTitle"
                type="text"
                value="${task.title || ""}"
              />
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
                  type="date"
                  value="${getTaskDateISO(task)}"
                />
                
              </div>
              <p class="fieldError" id="editTaskDateError"></p>
            </div>
          </div>

          <fieldset class="formGroup priorityGroup">
            <legend>Priority</legend>

            <div class="priorityButtons">
              <button type="button" class="priorityBtn editPriorityBtn urgentBtn ${task.priority === "urgent" ? "activeUrgent" : ""}" data-priority="urgent">
                <span>Urgent</span>
                <img src="./assets/img/PrioUP-icon.svg" alt="urgent" />
              </button>

              <button type="button" class="priorityBtn editPriorityBtn mediumBtn ${!task.priority || task.priority === "medium" ? "activeMedium" : ""}" data-priority="medium">
                <span>Medium</span>
                <img src="./assets/img/PrioMedium-icon.svg" alt="medium" />
              </button>

              <button type="button" class="priorityBtn editPriorityBtn lowBtn ${task.priority === "low" ? "activeLow" : ""}" data-priority="low">
                <span>Low</span>
                <img src="./assets/img/PrioDown-icon.svg" alt="low" />
              </button>
            </div>
          </fieldset>

          <div class="formGroup">
            <label for="editAssignedInput">Assigned to</label>

            <div class="customDropdown" id="editAssignedDropdown">
              <input
                type="text"
                class="dropdownButton"
                id="editAssignedInput"
                placeholder="Select contacts to assign"
                autocomplete="off"
              />

              <div class="dropdownList d_none" id="editAssignedList"></div>
            </div>

            <div class="selectedContactsWrapper">
              <div class="selectedContacts" id="editSelectedContacts"></div>
              <div
                class="moreContactsDropdown d_none"
                id="editMoreContactsDropdown"
              ></div>
            </div>
          </div>

          <div class="formGroup">
            <label for="editSubtaskInput">Subtasks</label>

            <div class="subtaskInputWrapper">
              <input
                id="editSubtaskInput"
                type="text"
                placeholder="Add new subtask"
              />

              <div class="subtaskActions">
                <button type="button" id="editClearSubtaskBtn" aria-label="Clear subtask">×</button>
                <div class="subtaskDivider"></div>
                <button type="button" id="editAddSubtaskBtn" aria-label="Add subtask">✓</button>
              </div>
            </div>

            <div class="subtasksWrapper">
              <ul class="subtaskList" id="editSubtaskList"></ul>
            </div>
          </div>
        </div>

        <div class="editTaskActions">
          <button type="submit" class="createTaskBtn">
            Ok <img src="/assets/img/create-contact-check.svg" alt="accept Task Button">
          </button>
        </div>
      </form>
    </div>
  `;
}
