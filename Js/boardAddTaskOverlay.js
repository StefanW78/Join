const addTaskOverlay = document.getElementById("addTaskOverlay");
const closeAddTaskOverlay = document.getElementById("closeAddTaskOverlay");
const openAddTaskButtons = document.querySelectorAll(".openAddTaskBtn");

openAddTaskButtons.forEach((button) => {
  button.addEventListener("click", () => {
    addTaskOverlay.classList.remove("dNone");
  });
});

closeAddTaskOverlay.addEventListener("click", () => {
  addTaskOverlay.classList.add("dNone");
});

addTaskOverlay.addEventListener("click", (event) => {
  if (event.target === addTaskOverlay) {
    addTaskOverlay.classList.add("dNone");
  }
});