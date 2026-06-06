document.querySelectorAll(".openAddTaskBtn").forEach((button) => {
button.addEventListener("click", () => {
    window.location.href = "./addTask.html";
});
});