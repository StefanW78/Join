function getEditTaskTemplate(task) {
  return `
    <div class="task-card edit-task-card">
      <div class="task-card-header">
        <h3 class="edit-task-title">Edit Task</h3>
        <button class="task-close-btn" id="closeEditTaskOverlayBtn">&times;</button>
      </div>

      <form id="editTaskForm" class="taskForm">
        <div class="formGrid editFormGrid">
          <div class="formColumn">
            <div class="formGroup">
              <label for="editTaskTitle">Title</label>
              <input
                id="editTaskTitle"
                type="text"
                value="${task.title || ""}"
              />
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
                  maxlength="10"
                />
                <img src="./assets/img/calendar-icon.svg" alt="calendar icon" />
              </div>
            </div>
          </div>

          <div class="formColumn">
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
              <label for="editTaskCategory">Category</label>
              <select id="editTaskCategory">
                <option value="Technical Task" ${task.category === "Technical Task" ? "selected" : ""}>
                  Technical Task
                </option>
                <option value="User Story" ${task.category === "User Story" ? "selected" : ""}>
                  User Story
                </option>
              </select>
            </div>

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
                  <button type="button" id="editClearSubtaskBtn">×</button>
                  <div class="subtaskDivider"></div>
                  <button type="button" id="editAddSubtaskBtn">✓</button>
                </div>
              </div>

              <div class="subtasksWrapper">
                <ul class="subtaskList" id="editSubtaskList"></ul>
              </div>
            </div>
          </div>
        </div>

        <div class="editTaskActions">
          <button type="button" class="clearBtn" id="cancelEditTaskBtn">
            Cancel ✕
          </button>

          <button type="submit" class="createTaskBtn">
            Ok ✓
          </button>
        </div>
      </form>
    </div>
  `;
}
