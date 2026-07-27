
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

        subtasksHTML: createSubtasks(card.subtasks || [], card.id)
    };
}

function createAssignedPersons(avatars) {
    return avatars
        .map(avatar => getAssignedPersonTemplate(avatar))
        .join("");
}

function createSubtasks(subtasks, taskId) {
    return subtasks
        .map((subtask, index) => getSubtaskTemplate(subtask, taskId, index))
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