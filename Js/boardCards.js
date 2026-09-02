/**
 * Creates the complete HTML markup for a board task card.
 *
 * @param {Object} task - The task to process.
 * @param {Object[]} contacts - The contacts available for task assignment.
 * @returns {string} The generated HTML markup for the task card.
 */
export function getTaskCardTemplate(task, contacts) {
  const subtasks = task.subtasks || [];
  const completedSubtasks = subtasks.filter((subtask) => subtask.done).length;
  const totalSubtasks = subtasks.length;
  const progress = getSubtaskProgress(completedSubtasks, totalSubtasks);
  return `
    <div class="card" draggable="true" data-task-id="${task.id}">
      ${getTaskCardContentTemplate(task)}
      ${getSubtaskProgressTemplate(completedSubtasks, totalSubtasks, progress)}
      ${getTaskCardFooterTemplate(task, contacts)}
    </div>`;
}

/**
 * Creates the category, title, and description markup for a task card.
 *
 * @param {Object} task - The task whose main card content should be rendered.
 * @returns {string} The generated HTML markup for the task card content.
 */
function getTaskCardContentTemplate(task) {
  return `
    <span class="tag ${getCategoryClass(task.category)}">
      ${task.category || "Task"}
    </span>
    <div class="card-title">${task.title || ""}</div>
    <div class="card-desc">${task.description || ""}</div>`;
}

/**
 * Creates the assigned-contact and priority markup for a task card footer.
 *
 * @param {Object} task - The task whose footer should be rendered.
 * @returns {string} The generated HTML markup for the task card footer.
 */
function getTaskCardFooterTemplate(task, contacts) {
  const assigned = enrichAssignedContacts(task.assignedTo || [], contacts);
  return `
    <div class="card-footer">
      <div class="avatars">${getAssignedAvatarsTemplate(assigned)}</div>
      <div class="priority ${getPriorityClass(task.priority)}">
        ${getPriorityIcon(task.priority)}
      </div>
    </div>`;
}

/**
 * Returns the CSS class associated with a task category.
 *
 * @param {string} category - The task category.
 * @returns {string} The CSS class used to style the category tag.
 */
function getCategoryClass(category) {
  if (category === "Technical Task") {
    return "tag-teal";
  }

  if (category === "User Story") {
    return "tag-blue";
  }

  return "tag-blue";
}

/**
 * Returns the CSS class associated with a task priority.
 *
 * @param {string} priority - The task priority.
 * @returns {string} The CSS class used to style the priority indicator.
 */
function getPriorityClass(priority) {
  const classes = {
    urgent: "prio-urgent",
    medium: "prio-medium",
    low: "prio-low",
  };
  return classes[priority] || classes.medium;
}

/**
 * Calculates the completion percentage for a task's subtasks.
 *
 * @param {number} completedSubtasks - The number of completed subtasks.
 * @param {number} totalSubtasks - The total number of subtasks.
 * @returns {number} The rounded completion percentage, or 0 when no subtasks exist.
 */
function getSubtaskProgress(completedSubtasks, totalSubtasks) {
  if (totalSubtasks === 0) {
    return 0;
  }

  return Math.round((completedSubtasks / totalSubtasks) * 100);
}

/**
 * Creates the progress bar markup for a task's subtasks.
 *
 * @param {number} completedSubtasks - The number of completed subtasks.
 * @param {number} totalSubtasks - The total number of subtasks.
 * @param {number} progress - The completion percentage to display.
 * @returns {string} The generated progress markup, or an empty string when no subtasks exist.
 */
function getSubtaskProgressTemplate(completedSubtasks, totalSubtasks, progress) {
  if (totalSubtasks === 0) return "";
  return `
    <div class="subtasks">
      <div class="progress-bar">
        <div class="progress-fill" style="width:${progress}%"></div>
      </div>
      ${completedSubtasks}/${totalSubtasks} Subtasks
    </div>`;
}

/**
 * Creates avatar markup for up to three contacts assigned to a task.
 *
 * @param {Object[]} assignedContacts - The contacts assigned to the task.
 * @returns {string} The generated HTML markup for the visible avatars.
 */
function getAssignedAvatarsTemplate(assignedContacts) {
  const visibleContacts = assignedContacts.slice(0, 3);

  return visibleContacts
    .map((contact) => {
      return `
        <div class="av" style="background:${contact.color || "#2a3647"}">
          ${contact.initials || getInitials(contact.name)}
        </div>
      `;
    })
    .join("");
}

/**
 * Generates initials from the first two parts of a name.
 *
 * @param {string} name - The name used to generate the initials.
 * @returns {string} The generated uppercase initials.
 */
export function getInitials(name = "") {
  return name
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

/**
 * Selects a fallback avatar color based on an item's position.
 *
 * @param {number} index - The position used to select a color.
 * @returns {string} The selected hexadecimal color value.
 */
export function getAvatarColor(index) {
  const colors = ["#ff7a00", "#9747ff", "#1fbcb4", "#29abe2", "#6e52ff"];
  return colors[index % colors.length];
}

/**
 * Enriches all assigned-contact references with the available board contact data.
 *
 * @param {Object[]} assignedContacts - The assigned-contact references to enrich.
 * @returns {Object[]} The enriched assigned contacts.
 */
export function enrichAssignedContacts(assignedContacts = [], contacts = []) {
  return assignedContacts.map(contact => enrichAssignedContact(contact, contacts));
}

/**
 * Enriches a single assigned-contact reference with matching board contact data.
 *
 * @param {Object} assignedContact - The assigned-contact reference to enrich.
 * @returns {Object} The enriched contact, or the original reference when no match is found.
 */
function enrichAssignedContact(assignedContact, contacts) {
  const user = contacts.find((contact) => matchesAssignedContact(contact, assignedContact));
  if (!user) return assignedContact;
  return { ...assignedContact, id: user.id, name: user.name,
    email: user.email, initials: user.initials || getInitials(user.name),
    color: user.color };
}

/**
 * Checks whether a board contact matches an assigned-contact reference.
 * Contacts are compared by ID, email address, or name.
 *
 * @param {Object} contact - The board contact to compare.
 * @param {Object} assignedContact - The assigned-contact reference to compare.
 * @returns {boolean} Whether the contacts match.
 */
function matchesAssignedContact(contact, assignedContact) {
  return contact.id === assignedContact.id ||
    contact.email === assignedContact.email ||
    contact.name === assignedContact.name;
}

/**
 * Returns the SVG icon associated with a task priority.
 *
 * @param {string} priority - The task priority.
 * @returns {string} The SVG markup for the matching priority icon.
 */
function getPriorityIcon(priority) {
  if (priority === "urgent") return getUrgentPriorityIcon();
  if (priority === "low") return getLowPriorityIcon();
  return getMediumPriorityIcon();
}

/**
 * Creates the SVG markup for the urgent-priority icon.
 *
 * @returns {string} The urgent-priority SVG markup.
 */
function getUrgentPriorityIcon() {
  return `
      <svg width="20" height="15" viewBox="0 0 20 15" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18.9 14.5L10 8.2L1.1 14.5" stroke="#FF3D00" stroke-width="3"/>
        <path d="M18.9 8.7L10 2.4L1.1 8.7" stroke="#FF3D00" stroke-width="3"/>
      </svg>`;
}

/**
 * Creates the SVG markup for the low-priority icon.
 *
 * @returns {string} The low-priority SVG markup.
 */
function getLowPriorityIcon() {
  return `
      <svg width="20" height="15" viewBox="0 0 20 15" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1.1 1L10 7.3L18.9 1" stroke="#7AE229" stroke-width="3"/>
        <path d="M1.1 6.8L10 13.1L18.9 6.8" stroke="#7AE229" stroke-width="3"/>
      </svg>`;
}

/**
 * Creates the SVG markup for the medium-priority icon.
 *
 * @returns {string} The medium-priority SVG markup.
 */
function getMediumPriorityIcon() {
  return `
    <svg width="20" height="8" viewBox="0 0 20 8" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 1H19" stroke="#FFA800" stroke-width="3"/>
      <path d="M1 7H19" stroke="#FFA800" stroke-width="3"/>
    </svg>`;
}

/**
 * Renders an empty-state message in every board column without tasks.
 *
 * @returns {void}
 */
export function renderEmptyMessages() {
  renderEmptyMessage("todoTasks", "No tasks To do");
  renderEmptyMessage("inProgressTasks", "No tasks in progress");
  renderEmptyMessage("awaitFeedbackTasks", "No tasks await feedback");
  renderEmptyMessage("doneTasks", "No tasks done");
}

/**
 * Renders an empty-state message when the specified container has no children.
 *
 * @param {string} containerId - The ID of the board column container.
 * @param {string} message - The empty-state message to display.
 * @returns {void}
 */
function renderEmptyMessage(containerId, message) {
  const container = document.getElementById(containerId);

  if (container.children.length === 0) {
    container.innerHTML = `<div class="empty-card">${message}</div>`;
  }
}
