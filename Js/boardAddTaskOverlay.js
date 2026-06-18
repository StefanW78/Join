const addTaskOverlay = document.getElementById("addTaskOverlay");
const closeAddTaskOverlayBtn = document.getElementById("closeAddTaskOverlay");
const openAddTaskButtons = document.querySelectorAll(".openAddTaskBtn");

openAddTaskButtons.forEach((button) => {
  button.addEventListener("click", openAddTaskOverlay);
});

closeAddTaskOverlayBtn.addEventListener("click", closeAddTaskOverlay);

addTaskOverlay.addEventListener("click", (event) => {
  if (event.target === addTaskOverlay) {
    closeAddTaskOverlay();
  }
});

function openAddTaskOverlay() {
  addTaskOverlay.classList.remove("d_none");

  setTimeout(() => {
    addTaskOverlay.classList.add("show");
  }, 10);
}

function closeAddTaskOverlay() {
  addTaskOverlay.classList.remove("show");

  setTimeout(() => {
    addTaskOverlay.classList.add("d_none");
  }, 300);
}