import { requireAuth } from "./guard.js";

requireAuth();

import { requireAuth } from "./guard.js";
import { createTask } from "./tasks.js";

requireAuth();

const taskForm = document.querySelector(".taskForm");

let selectedPriority = "medium";

taskForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const title = document.getElementById("taskTitle").value.trim();
  const description = document.getElementById("taskDescription").value.trim();
  const dueDate = document.getElementById("taskDate").value;
  const category = document.getElementById("category").value;
  const assignedTo = [];
  const subtasks = [];

  try {
    await createTask({
      title,
      description,
      dueDate,
      priority: selectedPriority,
      assignedTo,
      category,
      subtasks,
      status: "todo",
    });

    alert("Task erfolgreich erstellt.");
    taskForm.reset();
    selectedPriority = "medium";
  } catch (error) {
    console.error(error);
    alert("Task konnte nicht gespeichert werden.");
  }
});

const priorityButtons = document.querySelectorAll(".priorityBtn");

priorityButtons.forEach((button) => {
  button.addEventListener("click", () => {
    priorityButtons.forEach((btn) => btn.classList.remove("activePriority"));
    button.classList.add("activePriority");

    if (button.classList.contains("urgentBtn")) selectedPriority = "urgent";
    if (button.classList.contains("mediumBtn")) selectedPriority = "medium";
    if (button.classList.contains("lowBtn")) selectedPriority = "low";
  });
});