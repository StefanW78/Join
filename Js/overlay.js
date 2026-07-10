
function prepareOverlayData(card) {

    const priority = getPriorityData(card.priority);

    return {
        ...card,

        tag: card.category,

        overlayTagClass: getCategoryClass(card.category),

        priorityClass: `prio-${card.priority}`,

        priorityText: priority.text,

        priorityIcon: priority.icon,

        avatarsHTML: createAssignedPersons(card.assignedTo || []),

        subtasksHTML: createSubtasks(card.subtasks || [])
    };
}

function createAssignedPersons(avatars) {
    return avatars
        .map(avatar => getAssignedPersonTemplate(avatar))
        .join("");
}

function createSubtasks(subtasks) {
    return subtasks
        .map(subtask => getSubtaskTemplate(subtask))
        .join("");
}

function getPriorityData(priority) {

    const priorities = {
        urgent: {
            text: "Urgent",
            icon: getPriorityIcon("urgent")
        },

        medium: {
            text: "Medium",
            icon: getPriorityIcon("medium")
        },

        low: {
            text: "Low",
            icon: getPriorityIcon("low")
        }
    };


    return priorities[priority] || priorities.medium;
}

function getCategoryClass(category) {

    const categoryClassMap = {
        "User Story": "tag-blue",
        "Technical Task": "tag-teal"
    };

    return categoryClassMap[category] || "tag-default";
}


function getAssignedPersonTemplate(avatar) {
    return `
        <div class="assigned-person">

            <div class="assigned-avatar" style="background-color: ${avatar.color};">
                ${avatar.initials}
            </div>

            <span class="assigned-name">
                ${avatar.name}
            </span>

        </div>
    `;
}

function getSubtaskTemplate(subtask) {
    return `
        <label class="subtask-item">

            <input
                type="checkbox"
                ${subtask.checked ? "checked" : ""}
            >

            <span class="subtask-text">
                ${subtask.text}
            </span>

        </label>
    `;
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

function renderCardOverlay(id) {
    const card = tasks.find(c => c.id === id);
    if (!card) return;

    const overlay = document.getElementById("cardOverlay");
    const formContainer = document.getElementById("openTaskOverlay");

    if (!overlay || !formContainer) return;

    const preparedCard = prepareOverlayData(card);

    formContainer.innerHTML = getCardOverlayTemplate(preparedCard);

    overlay.style.display = "flex";
    document.body.style.overflow = "hidden";

    overlay.onclick = eventClick;
}

function getCardOverlayTemplate(card) {
    return `
        <div class = "open_task_overlay_content">
            <div class="task-card-header">
                <span class="task-tag ${card.overlayTagClass}">${card.tag}</span>
                <button class="task-close-btn" onclick="closeCardOverlay()">
                <img src="./assets/img/clearX.svg" alt="">
                </button>
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
                         ${card.priorityIcon}
                    </span>
                </div>
            </div>

            <div class="task-assigned">
                <div class="task-assigned-label">Assigned To:</div>
                <div class="task-assigned-list">
                    ${card.avatarsHTML}
                </div>
            </div>

            <div class="task-subtasks">
                <div class="task-subtasks-label">Subtasks</div>
                <div class="task-subtasks-list">
                    ${card.subtasksHTML}
                </div>
            </div>

            <div class="task-actions">
                <button class="task-action-btn delete-btn">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M3 4h10M5.5 4V2.5A1.5 1.5 0 0 1 7 1h2a1.5 1.5 0 0 1 1.5 1.5V4m1.5 0v9a1.5 1.5 0 0 1-1.5 1.5h-5A1.5 1.5 0 0 1 4 13V4h8Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Delete
                </button>
                <div class= "vector">
                </div>
                <button class="task-action-btn edit-btn">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M11.333 2A1.886 1.886 0 0 1 14 4.667l-9 9-3.667 1 1-3.667 9-9Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Edit
                </button>
            </div>
            </div>`;
}