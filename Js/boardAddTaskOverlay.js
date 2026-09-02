/**
 * References the DOM element with the ID `addTaskOverlay`.
 */
const addTaskOverlay = document.getElementById("addTaskOverlay");
/**
 * References the DOM element with the ID `closeAddTaskOverlay`.
 */
const closeAddTaskOverlayBtn = document.getElementById("closeAddTaskOverlay");
/**
 * References all DOM elements matching `.openAddTaskBtn`.
 */
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

/**
 * Opens the add task overlay.
 *
 * @returns {void}
 */
function openAddTaskOverlay() {
  addTaskOverlay.classList.remove("d_none");

  setTimeout(() => {
    addTaskOverlay.classList.add("show");
  }, 10);
}

/**
 * Closes the add task overlay.
 *
 * @returns {void}
 */
function closeAddTaskOverlay() {
  addTaskOverlay.classList.remove("show");

  setTimeout(() => {
    addTaskOverlay.classList.add("d_none");
  }, 300);
}
