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
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M3 4h10M5.5 4V2.5A1.5 1.5 0 0 1 7 1h2a1.5 1.5 0 0 1 1.5 1.5V4m1.5 0v9a1.5 1.5 0 0 1-1.5 1.5h-5A1.5 1.5 0 0 1 4 13V4h8Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Delete
                </button>
                <button class="task-action-btn edit-btn">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M11.333 2A1.886 1.886 0 0 1 14 4.667l-9 9-3.667 1 1-3.667 9-9Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Edit
                </button>
            </div>
        </div>`;

    overlay.style.display = "flex";
    document.body.style.overflow = "hidden";
    
    overlay.onclick = eventClick;

}

  function closeCardOverlay() {
    const overlay = document.getElementById("cardOverlay");

    if (!overlay) {
      return;
    }

    overlay.style.display = "none";
    document.body.style.overflow = "auto";
  }

  function eventClick(event) {
    if (event.target.id === "cardOverlay") {
      closeCardOverlay();
    }
  }