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
  const isDesktop = window.matchMedia("(min-width: 1093px)").matches;

  if (!isDesktop) {
    // Tablet & Handy -> zur Seite wechseln
    window.location.href = "addTask.html";
    return;
  }

  // Desktop -> Overlay öffnen
  addTaskOverlay.classList.remove("dNone");

  setTimeout(() => {
    addTaskOverlay.classList.add("show");
  }, 10);
}

function closeAddTaskOverlay() {
  addTaskOverlay.classList.remove("show");

  setTimeout(() => {
    addTaskOverlay.classList.add("dNone");
  }, 300);
}