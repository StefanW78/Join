

import { db } from "./firebase.js";

import {
  collection,
  addDoc,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { observeAuthState } from "./auth.js";

const taskForm = document.getElementById("taskForm");
const taskTitle = document.getElementById("taskTitle");
const taskDescription = document.getElementById("taskDescription");
const taskDate = document.getElementById("taskDate");
const taskCategory = document.getElementById("category");

let currentUser = null;

observeAuthState((user) => {
  currentUser = user;
  console.log("Aktueller User:", user);
});

taskForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!currentUser) {
    console.error("Kein User eingeloggt!");
    return;
  }

  const title = taskTitle.value.trim();
  const description = taskDescription.value.trim();
  const dueDate = taskDate.value;
  const category = taskCategory.value;

  const task = {
    title,
    description,
    dueDate,
    category,
    createdBy: currentUser.uid,
    status: "todo",
  };

  try {
    const docRef = await addDoc(collection(db, "tasks"), task);
    console.log("Task gespeichert mit ID:", docRef.id);
  } catch (error) {
    console.error("Fehler beim Speichern:", error);
  }
});

