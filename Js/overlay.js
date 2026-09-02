/**
 * Renders and opens the detail overlay for the selected task card.
 *
 * @param {string} id - The relevant database ID.
 * @returns {void}
 */
function renderCardOverlay(id) {
    const task = boardTasks.find((task) => task.id === taskId);
    if (!card) return;

    const overlay = document.getElementById("cardOverlay");
    const formContainer = document.getElementById("cardFormContainer");
    if (!overlay || !formContainer) return;

    const priorityLabel = card.priorityClass.replace('prio-', '');
    formContainer.innerHTML = `
        <div id="openTaskOverlay" class="task-card">
            <div class="task-card-header">
                <span class="task-tag ${card.overlayTagClass}">${card.tag}</span>
                <button class="task-close-btn" onclick="closeCardOverlay()">&times;</button>
            </div>
            <h3 class="task-title">${card.title}</h3>
            <p class="task-description">${card.description}</p>

            <div class="task-meta">
                <div class="task-meta-item">
                    <span class="task-meta-label">Due date:</span>
                    <span class="task-meta-value">${card.dueDate}</span>
                </div>
                <div class="task-meta-item">
                    <span class="task-meta-label">Priority:</span>
                    <span class="task-meta-value">
                        ${card.priorityText}
                        <span class="priority-indicator ${priorityLabel}"></span>
                    </span>
                </div>
            </div>

            <div class="task-assigned">
                <div class="task-assigned-label">Assigned To:</div>
                <div class="task-assigned-list">
                    ${card.avatars.map(av => `
                        <div class="assigned-person">
                            <div class="assigned-avatar ${av.overlayColor}">${av.initials}</div>
                            <span class="assigned-name">${av.name}</span>
                        </div>`).join('')}
                </div>
            </div>

            <div class="task-subtasks">
                <div class="task-subtasks-label">Subtasks</div>
                <div class="task-subtasks-list">
                    ${card.subtasks.map(sub => `
                        <label class="subtask-item">
                            <input type="checkbox" ${sub.checked ? 'checked' : ''}>
                            <span class="subtask-text">${sub.text}</span>
                        </label>`).join('')}
                </div>
            </div>

            <div class="task-actions">
                <button class="task-action-btn delete-btn">
                    <img src="./assets/img/delete-contact.svg" alt="delete image">
                    Delete
                </button>
                <button class="task-action-btn edit-btn">
                    <img src="./assets/img/edit-contact.svg" alt="delete image">
                    Edit
                </button>
            </div>
        </div>`;

    overlay.style.display = "flex";
    document.body.style.overflow = "hidden";
    
    overlay.onclick = eventClick;

}

  /**
   * Closes the card overlay.
   *
   * @returns {void}
   */
  function closeCardOverlay() {
    const overlay = document.getElementById("cardOverlay");

    if (!overlay) {
      return;
    }

    overlay.style.display = "none";
    document.body.style.overflow = "auto";
  }

  /**
   * Closes the card overlay when its background is clicked.
   *
   * @param {Event} event - The event that triggered the operation.
   * @returns {void}
   */
  function eventClick(event) {
    if (event.target.id === "cardOverlay") {
      closeCardOverlay();
    }
  }
