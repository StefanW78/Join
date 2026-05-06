import { db } from "./firebase.js";
import {
  ref,
  push,
  set,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

import { observeAuthState } from "./auth.js";

const taskForm = document.getElementById("taskForm");
const taskTitle = document.getElementById("taskTitle");
const taskDescription = document.getElementById("taskDescription");
const taskDate = document.getElementById("taskDate");
const taskCategory = document.getElementById("category");

let currentUser = null;

observeAuthState((user) => {
  currentUser = user;
});

taskForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!currentUser) {
    console.error("Kein User eingeloggt!");
    return;
  }

  const task = {
    title: taskTitle.value.trim(),
    description: taskDescription.value.trim(),
    dueDate: taskDate.value,
    category: taskCategory.value,
    createdBy: currentUser.uid,
    status: "todo",
    createdAt: Date.now(),
  };

  try {
    const newTaskRef = push(ref(db, "tasks"));
    await set(newTaskRef, task);

    console.log("Task gespeichert mit ID:", newTaskRef.key);
    taskForm.reset();
  } catch (error) {
    console.error("Fehler beim Speichern:", error);
  }
});
