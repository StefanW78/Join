import { getInitials } from "./boardCards.js";

/**
 * Creates the complete HTML markup for a task detail overlay.
 *
 * @param {Object} task - The task to process.
 * @param {Object[]} assignedContacts - The contacts assigned to the task.
 * @returns {string} The generated HTML markup for the task detail overlay.
 */
export function getTaskDetailOverlayTemplate(task, assignedContacts) {
  const subtasks = task.subtasks || [];
  return `
    <div id="openTaskOverlay" class="task-card">
      ${getTaskDetailHeaderTemplate(task)}
      <h3 class="task-title">${task.title || ""}</h3>
      <p class="task-description">${task.description || ""}</p>
      ${getTaskMetaTemplate(task)}
      ${getTaskAssignedTemplate(assignedContacts)}
      ${getTaskSubtasksTemplate(subtasks)}
      ${getTaskActionsTemplate()}
    </div>`;
}

/**
 * Creates the category and close-button markup for the task detail header.
 *
 * @param {Object} task - The task used to render the detail header.
 * @returns {string} The generated HTML markup for the task detail header.
 */
function getTaskDetailHeaderTemplate(task) {
  return `<div class="task-card-header">
    <span class="task-tag ${getOverlayCategoryClass(task.category)}">
      ${task.category || "Task"}
    </span>
    <button class="task-close-btn" id="closeTaskDetailOverlayBtn">&times;</button>
  </div>`;
}

/**
 * Creates the due-date and priority markup for a task detail overlay.
 *
 * @param {Object} task - The task whose metadata should be displayed.
 * @returns {string} The generated HTML markup for the task metadata.
 */
function getTaskMetaTemplate(task) {
  return `<div class="task-meta">
    <div class="task-meta-item"><span class="task-meta-label">Due date:</span>
      <span class="task-meta-value">${task.dueDate || ""}</span></div>
    <div class="task-meta-item"><span class="task-meta-label">Priority:</span>
      <span class="task-meta-value">${getPriorityText(task.priority)}
        <span class="priority-indicator ${task.priority || "medium"}"></span>
      </span></div>
  </div>`;
}

/**
 * Creates the assigned-contacts section for a task detail overlay.
 *
 * @param {Object[]} assignedContacts - The contacts assigned to the task.
 * @returns {string} The generated HTML markup for the assigned-contacts section.
 */
function getTaskAssignedTemplate(assignedContacts) {
  return `<div class="task-assigned">
    <div class="task-assigned-label">Assigned To:</div>
    <div class="task-assigned-list">
      ${getAssignedOverlayTemplate(assignedContacts)}
    </div>
  </div>`;
}

/**
 * Creates the subtask section for a task detail overlay.
 *
 * @param {Object[]} subtasks - The task's subtasks.
 * @returns {string} The generated HTML markup for the subtask section.
 */
function getTaskSubtasksTemplate(subtasks) {
  return `<div class="task-subtasks">
    <div class="task-subtasks-label">Subtasks</div>
    <div class="task-subtasks-list">
      ${getSubtasksOverlayTemplate(subtasks)}
    </div>
  </div>`;
}

/**
 * Creates the delete and edit action buttons for a task detail overlay.
 *
 * @returns {string} The generated HTML markup for the task actions.
 */
function getTaskActionsTemplate() {
  return `<div class="task-actions">
    <button class="task-action-btn delete-btn" id="deleteTaskBtn" type="button">
      <img src="./assets/img/delete-contact.svg" alt="delete image"> Delete
    </button>
    <button class="task-action-btn edit-btn" id="editTaskBtn" type="button">
      <img src="./assets/img/edit-contact.svg" alt="edit image"> Edit
    </button>
  </div>`;
}

/**
 * Returns the overlay CSS class associated with a task category.
 *
 * @param {string} category - The task category.
 * @returns {string} The CSS class used to style the overlay category tag.
 */
function getOverlayCategoryClass(category) {
  if (category === "Technical Task") {
    return "technical-task";
  }

  if (category === "User Story") {
    return "user-story";
  }

  return "user-story";
}

/**
 * Returns the display label associated with a task priority.
 *
 * @param {string} priority - The task priority.
 * @returns {string} The human-readable priority label.
 */
function getPriorityText(priority) {
  const labels = { urgent: "Urgent", medium: "Medium", low: "Low" };
  return labels[priority] || labels.medium;
}

/**
 * Creates the assigned-person markup for a task detail overlay.
 * Displays a fallback message when no contacts are assigned.
 *
 * @param {Object[]} assignedContacts - The contacts assigned to the task.
 * @returns {string} The generated HTML markup for the assigned contacts.
 */
function getAssignedOverlayTemplate(assignedContacts) {
  if (!assignedContacts.length) {
    return `<span class="assigned-name">No contacts assigned</span>`;
  }
  return assignedContacts.map(getAssignedPersonTemplate).join("");
}

/**
 * Creates the HTML markup for one assigned person in a task detail overlay.
 *
 * @param {Object} contact - The assigned contact to render.
 * @returns {string} The generated HTML markup for the assigned person.
 */
function getAssignedPersonTemplate(contact) {
  return `<div class="assigned-person">
    <div class="assigned-avatar" style="background:${contact.color || "#2a3647"}">
      ${contact.initials || getInitials(contact.name)}
    </div>
    <span class="assigned-name">${contact.name || ""}</span>
  </div>`;
}

/**
 * Creates the subtask markup for a task detail overlay.
 * Displays a fallback message when the task has no subtasks.
 *
 * @param {Object[]} subtasks - The subtasks to render.
 * @returns {string} The generated HTML markup for the subtasks.
 */
function getSubtasksOverlayTemplate(subtasks) {
  if (!subtasks.length) return `<span class="subtask-text">No subtasks</span>`;
  return subtasks.map(getOverlaySubtaskTemplate).join("");
}

/**
 * Creates checkbox markup for one subtask in a task detail overlay.
 *
 * @param {Object} subtask - The subtask to render.
 * @param {number} index - The subtask's position in the task's subtask list.
 * @returns {string} The generated HTML markup for the subtask checkbox.
 */
function getOverlaySubtaskTemplate(subtask, index) {
  return `<label class="subtask-item">
    <input type="checkbox" class="detailSubtaskCheckbox"
      data-index="${index}" ${subtask.done ? "checked" : ""}>
    <span class="subtask-text">${subtask.title || ""}</span>
  </label>`;
}
