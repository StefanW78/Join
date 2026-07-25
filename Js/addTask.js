import { loadData, postData, patchData } from "./storage.js";

const taskDate = document.getElementById("taskDate");
const taskDateError = document.getElementById("taskDateError");

const taskTitleError = document.getElementById("taskTitleError");
const categoryError = document.getElementById("categoryError");

const currentUser = JSON.parse(localStorage.getItem("currentUser"));

const taskForm = document.getElementById("taskForm");
const taskTitle = document.getElementById("taskTitle");
const taskDescription = document.getElementById("taskDescription");
const clearTaskBtn = document.getElementById("clearTaskBtn");

const assignedInput = document.getElementById("assignedInput");
const assignedList = document.getElementById("assignedList");
const selectedContactsContainer = document.getElementById("selectedContacts");
const moreContactsDropdown = document.getElementById("moreContactsDropdown");

const categoryButton = document.getElementById("categoryButton");
const categoryList = document.getElementById("categoryList");

const subtaskInput = document.getElementById("subtasks");
const subtaskList = document.getElementById("subtaskList");
const addSubtaskBtn = document.getElementById("addSubtaskBtn");
const clearSubtaskBtn = document.getElementById("clearSubtaskBtn");
const moreSubtasksDropdown = document.getElementById("moreSubtasksDropdown");

const taskAddedOverlay = document.getElementById("taskAddedOverlay");

let selectedPriority = "medium";
let selectedCategory = "";
let contacts = [];
let selectedContacts = [];
let subtasks = [];

initPriorityButtons();
initCategoryDropdown();
initAssignedDropdown();
initSubtasks();
loadContacts();

clearTaskBtn.addEventListener("click", () => {
  resetFormState();
});

function validateTaskDate() {
  clearInputError(taskDate, taskDateError);

  const dateValue = taskDate.value.trim();

  if (!dateValue) {
    setInputError(taskDate, taskDateError, "This field is required");
    return false;
  }

  if (!isValidDateFormat(dateValue)) {
    setInputError(taskDate, taskDateError, "Please use the format dd/mm/yyyy");
    return false;
  }

  const selectedDate = parseDateFromInput(dateValue);
  const today = new Date();

  today.setHours(0, 0, 0, 0);
  selectedDate.setHours(0, 0, 0, 0);

  if (selectedDate < today) {
    setInputError(
      taskDate,
      taskDateError,
      "The due date cannot be in the past.",
    );
    return false;
  }

  return true;
}

function isValidDateFormat(dateValue) {
  const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;

  if (!dateRegex.test(dateValue)) {
    return false;
  }

  const selectedDate = parseDateFromInput(dateValue);

  const day = Number(dateValue.slice(0, 2));
  const month = Number(dateValue.slice(3, 5));
  const year = Number(dateValue.slice(6, 10));

  return (
    selectedDate.getFullYear() === year &&
    selectedDate.getMonth() === month - 1 &&
    selectedDate.getDate() === day
  );
}

function parseDateFromInput(dateValue) {
  const [day, month, year] = dateValue.split("/");

  return new Date(Number(year), Number(month) - 1, Number(day));
}

taskForm.addEventListener("submit", handleTaskSubmit);

async function handleTaskSubmit(event) {
  event.preventDefault();

  if (!isTaskFormValid()) return;

  addCurrentSubtaskInput();

  const task = createTaskFromForm();
  await saveTask(task);
}

function isTaskFormValid() {
  clearAllErrors();

  return (
    validateTaskTitle() &&
    validateTaskDate() &&
    validateTaskCategory() &&
    validateCurrentUser()
  );
}

function validateTaskTitle() {
  if (taskTitle.value.trim()) return true;

  setInputError(taskTitle, taskTitleError, "This field is required");
  return false;
}

function validateTaskCategory() {
  if (selectedCategory) return true;

  setInputError(categoryButton, categoryError, "This field is required");
  return false;
}

function validateCurrentUser() {
  if (currentUser) return true;

  console.error("Kein User eingeloggt!");
  return false;
}

function createTaskFromForm() {
  return {
    ...getTaskFormValues(),
    ...getTaskUserData(),
    ...getTaskDefaultData(),
  };
}

function getTaskFormValues() {
  return {
    title: taskTitle.value.trim(),
    description: taskDescription.value.trim(),
    dueDate: taskDate.value,
    dueDateISO: convertDateToISO(taskDate.value),
    category: selectedCategory,
    priority: selectedPriority,
    assignedTo: selectedContacts,
    subtasks,
  };
}

function getTaskUserData() {
  return {
    createdBy: currentUser.id || currentUser.uid || "guest",
  };
}

function getTaskDefaultData() {
  return {
    status: "todo",
    createdAt: Date.now(),
  };
}

async function saveTask(task) {
  try {
    const result = await postData("tasks", task);
    handleTaskSaveSuccess(result);
  } catch (error) {
    console.error("Fehler beim Speichern:", error);
  }
}

function handleTaskSaveSuccess(result) {
  console.log("Task gespeichert mit ID:", result.name);

  showTaskAddedOverlay();
  resetFormState();
  redirectToBoardAfterDelay();
}

function redirectToBoardAfterDelay() {
  setTimeout(() => {
    window.location.href = "./board.html";
  }, 1200);
}

function convertDateToISO(dateValue) {
  const [day, month, year] = dateValue.split("/");
  return `${year}-${month}-${day}`;
}

taskTitle.addEventListener("input", () => {
  handleInputChange(taskTitle, taskTitleError);
});

function formatDateInput() {
  let value = taskDate.value.replace(/\D/g, "");

  if (value.length > 8) {
    value = value.slice(0, 8);
  }

  if (value.length >= 5) {
    value = value.slice(0, 2) + "/" + value.slice(2, 4) + "/" + value.slice(4);
  } else if (value.length >= 3) {
    value = value.slice(0, 2) + "/" + value.slice(2);
  }

  taskDate.value = value;
}

taskDate.addEventListener("input", () => {
  formatDateInput();
  handleInputChange(taskDate, taskDateError);
});

taskDescription.addEventListener("input", () => {
  toggleInputFocus(taskDescription);
});

subtaskInput.addEventListener("input", () => {
  toggleInputFocus(subtaskInput);
});

function addCurrentSubtaskInput() {
  const subtaskText = subtaskInput.value.trim();

  if (!subtaskText) return;

  subtasks.push({
    title: subtaskText,
    done: false,
  });

  subtaskInput.value = "";
  renderSubtasks();
}

function initPriorityButtons() {
  const priorityButtons = document.querySelectorAll(".priorityBtn");

  priorityButtons.forEach((button) => {
    button.addEventListener("click", () => {
      priorityButtons.forEach((btn) => {
        btn.classList.remove("activeUrgent", "activeMedium", "activeLow");
      });

      if (button.classList.contains("urgentBtn")) {
        selectedPriority = "urgent";
        button.classList.add("activeUrgent");
      }

      if (button.classList.contains("mediumBtn")) {
        selectedPriority = "medium";
        button.classList.add("activeMedium");
      }

      if (button.classList.contains("lowBtn")) {
        selectedPriority = "low";
        button.classList.add("activeLow");
      }
    });
  });
}

function initCategoryDropdown() {
  categoryButton.addEventListener("click", () => {
    categoryList.classList.toggle("d_none");
  });

  document.querySelectorAll("[data-category]").forEach((option) => {
    option.addEventListener("click", () => {
      selectedCategory = option.dataset.category;
      categoryButton.textContent = selectedCategory;
      categoryList.classList.add("d_none");
      clearInputError(categoryButton, categoryError);

      categoryButton.classList.add("inputFocus");
    });
  });
}

function initAssignedDropdown() {
  assignedInput.addEventListener("focus", () => {
    assignedList.classList.remove("d_none");
    renderContacts();
  });

  assignedInput.addEventListener("input", () => {
    renderContacts();
  });

  document.addEventListener("click", (event) => {
    const clickedInsideAssignedDropdown =
      event.target.closest("#assignedDropdown");
    const clickedInsideMoreContacts = event.target.closest(
      ".selectedContactsWrapper",
    );

    if (!clickedInsideAssignedDropdown) {
      assignedList.classList.add("d_none");
    }

    if (!clickedInsideMoreContacts) {
      moreContactsDropdown.classList.add("d_none");
    }
  });
}

async function loadContacts() {
  try {
    const usersObject = (await loadData("users")) || {};
    const userEntries = Object.entries(usersObject);

    contacts = await Promise.all(
      userEntries.map(async ([id, user], index) => {
        let color = user.color;

        if (!color) {
          color = getAvatarColor(index);
          await patchData(`users/${id}`, { color });
        }

        return {
          id,
          name: user.name,
          email: user.email,
          initials: user.initials,
          color,
        };
      }),
    );

    renderContacts();
  } catch (error) {
    console.error("Fehler beim Laden der User:", error);
    contacts = [];
    renderContacts();
  }
}

function renderContacts() {
  assignedList.innerHTML = "";

  const searchText = assignedInput.value.trim().toLowerCase();

  const filteredContacts = contacts.filter((contact) => {
    return contact.name.toLowerCase().includes(searchText);
  });

  filteredContacts.forEach((contact) => {
    const isSelected = selectedContacts.some((item) => item.id === contact.id);

    assignedList.innerHTML += `
      <div class="contactOption ${isSelected ? "selectedContactOption" : ""}" data-contact-id="${contact.id}">
        <div class="contactAvatar" style="background:${contact.color}">
          ${contact.initials || getInitials(contact.name)}
        </div>

        <span>${contact.name}</span>

        <input
          class="contactCheckbox"
          type="checkbox"
          aria-label="Select ${contact.name}"
          ${isSelected ? "checked" : ""}
        >
      </div>
    `;
  });

  document.querySelectorAll(".contactOption").forEach((option) => {
    option.addEventListener("click", (event) => {
      event.stopPropagation();

      toggleContact(option.dataset.contactId);
      assignedInput.value = "";
      assignedInput.focus();
      assignedList.classList.remove("d_none");
      renderContacts();
    });
  });
}

function toggleContact(contactId) {
  const contact = contacts.find((item) => item.id === contactId);
  if (!contact) return;

  const isSelected = selectedContacts.some((item) => item.id === contactId);

  if (isSelected) {
    selectedContacts = selectedContacts.filter((item) => item.id !== contactId);
  } else {
    selectedContacts.push(contact);
  }

  renderContacts();
  renderSelectedContacts();
}

function renderSelectedContacts() {
  selectedContactsContainer.innerHTML = "";
  moreContactsDropdown.innerHTML = "";
  moreContactsDropdown.classList.add("d_none");

  const visibleContacts = selectedContacts.slice(0, 3);
  const hiddenContacts = selectedContacts.slice(3);

  visibleContacts.forEach((contact, index) => {
    selectedContactsContainer.innerHTML += `
      <div class="selectedAvatar" style="background:${contact.color}" title="${contact.name}">
        ${contact.initials || getInitials(contact.name)}
      </div>
    `;
  });

  if (hiddenContacts.length > 0) {
    selectedContactsContainer.innerHTML += `
      <button type="button" class="moreContactsBtn" id="moreContactsBtn">
        +${hiddenContacts.length}
      </button>
    `;

    hiddenContacts.forEach((contact, index) => {
      moreContactsDropdown.innerHTML += `
        <div class="moreContactItem">
          <div class="selectedAvatar" style="background:${contact.color}">
            ${contact.initials || getInitials(contact.name)}
          </div>
          <span>${contact.name}</span>
        </div>
      `;
    });

    const moreContactsBtn = document.getElementById("moreContactsBtn");

    moreContactsBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      moreContactsDropdown.classList.toggle("d_none");
    });
  }
}

function initSubtasks() {
  subtaskInput.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;

    event.preventDefault();
    addCurrentSubtaskInput();
  });

  addSubtaskBtn.addEventListener("click", () => {
    addCurrentSubtaskInput();
  });

  clearSubtaskBtn.addEventListener("click", () => {
    subtaskInput.value = "";
    subtaskInput.focus();
    toggleInputFocus(subtaskInput);
  });

  document.addEventListener("click", (event) => {
    const clickedInsideSubtasks = event.target.closest(".subtasksWrapper");

    if (!clickedInsideSubtasks) {
      moreSubtasksDropdown.classList.add("d_none");
    }
  });
}

function renderSubtasks() {
  subtaskList.innerHTML = "";
  moreSubtasksDropdown.innerHTML = "";
  moreSubtasksDropdown.classList.add("d_none");

  const visibleSubtasks = subtasks.slice(0, 4);
  const hiddenSubtasks = subtasks.slice(4);

  visibleSubtasks.forEach((subtask, index) => {
    subtaskList.innerHTML += `
    <li class="subtaskItem">
      <span class="subtaskText">• ${subtask.title}</span>

      <div class="subtaskItemActions">
        <button type="button" class="editSubtaskBtn" data-index="${index}">
          <img src="./assets/img/Subtasks change.svg" alt="Edit subtask" />
        </button>

        <button type="button" class="deleteSubtaskBtn" data-index="${index}">
          <img src="./assets/img/SubTask delete.svg" alt="Delete subtask" />
        </button>
      </div>
    </li>
  `;
  });

  if (hiddenSubtasks.length > 0) {
    subtaskList.innerHTML += `
      <li>
        <button type="button" class="moreSubtasksBtn" id="moreSubtasksBtn">
          +${hiddenSubtasks.length}
        </button>
      </li>
    `;

    hiddenSubtasks.forEach((subtask, index) => {
      const realIndex = index + 4;

      moreSubtasksDropdown.innerHTML += `
    <div class="moreSubtaskItem">
      <span class="moreSubtaskText">• ${subtask.title}</span>

      <div class="subtaskItemActions">
        <button type="button" class="editSubtaskBtn" data-index="${realIndex}">
          <img src="./assets/img/Subtasks change.svg" alt="Edit subtask" />
        </button>

        <button type="button" class="deleteSubtaskBtn" data-index="${realIndex}">
          <img src="./assets/img/SubTask delete.svg" alt="Delete subtask" />
        </button>
      </div>
    </div>
  `;
    });

    const moreSubtasksBtn = document.getElementById("moreSubtasksBtn");

    moreSubtasksBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      moreSubtasksDropdown.classList.toggle("d_none");
    });
  }
  initSubtaskItemButtons();
}

function initSubtaskItemButtons() {
  document.querySelectorAll(".deleteSubtaskBtn").forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.index);
      deleteSubtask(index);
    });
  });

  document.querySelectorAll(".editSubtaskBtn").forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.index);
      editSubtask(index);
    });
  });
}

function deleteSubtask(index) {
  subtasks.splice(index, 1);
  renderSubtasks();
}

function editSubtask(index) {
  subtaskInput.value = subtasks[index].title;
  subtasks.splice(index, 1);
  renderSubtasks();
  subtaskInput.focus();
  toggleInputFocus(subtaskInput);
}

function getInitials(name = "") {
  return name
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

function getAvatarColor(index) {
  const colors = [
    "#9327ff",
    "#ff7a00",
    "#fc71ff",
    "#6e52ff",
    "#1fd7c1",
    "#ffbb2b",
  ];
  return colors[index % colors.length];
}

function resetFormState() {
  resetTaskForm();
  resetTaskValues();
  resetTaskInputs();
  closeTaskDropdowns();
  resetTaskFocusStyles();
  rerenderTaskForm();
  resetPriorityButtons();
}

function resetTaskForm() {
  taskForm.reset();
  clearAllErrors();
}

function resetTaskValues() {
  selectedPriority = "medium";
  selectedCategory = "";
  selectedContacts = [];
  subtasks = [];
}

function resetTaskInputs() {
  categoryButton.textContent = "Select task category";
  assignedInput.value = "";
  subtaskInput.value = "";
}

function closeTaskDropdowns() {
  assignedList.classList.add("d_none");
  moreContactsDropdown.classList.add("d_none");
  moreSubtasksDropdown.classList.add("d_none");
  categoryList.classList.add("d_none");
}

function resetTaskFocusStyles() {
  const focusElements = [
    taskTitle,
    taskDate,
    taskDescription,
    subtaskInput,
    categoryButton,
  ];

  focusElements.forEach((element) => element.classList.remove("inputFocus"));
}

function rerenderTaskForm() {
  renderSelectedContacts();
  renderSubtasks();
  renderContacts();
}

function resetPriorityButtons() {
  document.querySelectorAll(".priorityBtn").forEach((btn) => {
    btn.classList.remove("activeUrgent", "activeMedium", "activeLow");
  });

  const mediumBtn = document.querySelector(".mediumBtn");
  if (mediumBtn) mediumBtn.classList.add("activeMedium");
}

function setInputError(input, errorElement, message) {
  input.classList.remove("inputFocus");
  input.classList.add("inputError");
  errorElement.textContent = message;
}

function clearInputError(input, errorElement) {
  input.classList.remove("inputError");
  errorElement.textContent = "";
}

function handleInputChange(input, errorElement) {
  clearInputError(input, errorElement);
  toggleInputFocus(input);
}

function toggleInputFocus(input) {
  if (input.value.trim()) {
    input.classList.add("inputFocus");
  } else {
    input.classList.remove("inputFocus");
  }
}

function clearAllErrors() {
  clearInputError(taskTitle, taskTitleError);
  clearInputError(taskDate, taskDateError);
  clearInputError(categoryButton, categoryError);
}

function showTaskAddedOverlay() {
  taskAddedOverlay.classList.remove("d_none");

  setTimeout(() => {
    taskAddedOverlay.classList.add("show");
  }, 10);

  setTimeout(() => {
    taskAddedOverlay.classList.remove("show");
  }, 1200);

  setTimeout(() => {
    taskAddedOverlay.classList.add("d_none");
  }, 1500);
}
