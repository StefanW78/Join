import { loadData, postData } from "./storage.js";

const taskTitleError = document.getElementById("taskTitleError");
const taskDateError = document.getElementById("taskDateError");
const categoryError = document.getElementById("categoryError");

const currentUser = JSON.parse(localStorage.getItem("currentUser"));

const taskForm = document.getElementById("taskForm");
const taskTitle = document.getElementById("taskTitle");
const taskDescription = document.getElementById("taskDescription");
const taskDate = document.getElementById("taskDate");

const assignedInput = document.getElementById("assignedInput");
const assignedList = document.getElementById("assignedList");
const selectedContactsContainer = document.getElementById("selectedContacts");

const categoryButton = document.getElementById("categoryButton");
const categoryList = document.getElementById("categoryList");

const subtaskInput = document.getElementById("subtasks");
const subtaskList = document.getElementById("subtaskList");

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

taskForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  clearAllErrors();

  if (!taskTitle.value.trim()) {
    setInputError(taskTitle, taskTitleError, "This field is required");
    return;
  }

  if (!taskDate.value) {
    setInputError(taskDate, taskDateError, "This field is required");
    return;
  }

  if (!selectedCategory) {
    setInputError(categoryButton, categoryError, "This field is required");
    return;
  }

  if (!currentUser) {
    console.error("Kein User eingeloggt!");
    return;
  }

  addCurrentSubtaskInput();

  const task = {
    title: taskTitle.value.trim(),
    description: taskDescription.value.trim(),
    dueDate: taskDate.value,
    category: selectedCategory,
    priority: selectedPriority,
    assignedTo: selectedContacts,
    subtasks,
    createdBy: currentUser.id || "guest",
    status: "todo",
    createdAt: Date.now(),
  };

  try {
    const result = await postData("tasks", task);
    console.log("Task gespeichert mit ID:", result.name);
    resetFormState();
  } catch (error) {
    console.error("Fehler beim Speichern:", error);
  }
});

taskTitle.addEventListener("input", () => {
  handleInputChange(taskTitle, taskTitleError);
});

taskDate.addEventListener("input", () => {
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
    categoryList.classList.toggle("dNone");
  });

  document.querySelectorAll("[data-category]").forEach((option) => {
    option.addEventListener("click", () => {
      selectedCategory = option.dataset.category;
      categoryButton.textContent = selectedCategory;
      categoryList.classList.add("dNone");
      clearInputError(categoryButton, categoryError);

      categoryButton.classList.add("inputFocus");
    });
  });
}

function initAssignedDropdown() {
  assignedInput.addEventListener("focus", () => {
    assignedList.classList.remove("dNone");
    renderContacts();
  });

  assignedInput.addEventListener("input", () => {
    renderContacts();
  });

  document.addEventListener("click", (event) => {
    const clickedInsideDropdown = event.target.closest("#assignedDropdown");

    if (!clickedInsideDropdown) {
      assignedList.classList.add("dNone");
    }
  });
}

async function loadContacts() {
  try {
    const usersObject = await loadData("users");

    contacts = Object.entries(usersObject).map(([id, user]) => ({
      id,
      name: user.name,
      email: user.email,
      initials: user.initials,
    }));

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

  filteredContacts.forEach((contact, index) => {
    const isSelected = selectedContacts.some((item) => item.id === contact.id);

    assignedList.innerHTML += `
      <div class="contactOption" data-contact-id="${contact.id}">
        <div class="contactAvatar" style="background:${getAvatarColor(index)}">
          ${contact.initials || getInitials(contact.name)}
        </div>
        <span>${contact.name}</span>
        <input class="contactCheckbox" type="checkbox" ${isSelected ? "checked" : ""}>
      </div>
    `;
  });

  document.querySelectorAll(".contactOption").forEach((option) => {
    option.addEventListener("click", () => {
      toggleContact(option.dataset.contactId);
      assignedInput.value = "";
      assignedInput.focus();
      assignedList.classList.remove("dNone");
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

  selectedContacts.forEach((contact, index) => {
    selectedContactsContainer.innerHTML += `
      <div class="selectedAvatar" style="background:${getAvatarColor(index)}">
        ${contact.initials || getInitials(contact.name)}
      </div>
    `;
  });
}

function initSubtasks() {
  subtaskInput.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;

    event.preventDefault();
    addCurrentSubtaskInput();
  });
}

function renderSubtasks() {
  subtaskList.innerHTML = "";

  subtasks.forEach((subtask) => {
    subtaskList.innerHTML += `<li>${subtask.title}</li>`;
  });
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
  taskForm.reset();

  selectedPriority = "medium";
  selectedCategory = "";
  selectedContacts = [];
  subtasks = [];

  categoryButton.textContent = "Select task category";
  assignedInput.value = "";

  clearAllErrors();
  taskTitle.classList.remove("inputFocus");
  taskDate.classList.remove("inputFocus");
  taskDescription.classList.remove("inputFocus");
  subtaskInput.classList.remove("inputFocus");
  categoryButton.classList.remove("inputFocus");

  renderSelectedContacts();
  renderSubtasks();
  renderContacts();

  document.querySelectorAll(".priorityBtn").forEach((btn) => {
    btn.classList.remove("activeUrgent", "activeMedium", "activeLow");
  });

  document.querySelector(".mediumBtn").classList.add("activeMedium");
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
