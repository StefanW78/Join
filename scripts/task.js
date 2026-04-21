import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db } from "./firebase.js";
import { observeAuthState } from "./auth.js";

let currentUser = null;

observeAuthState((user) => {
  currentUser = user;
});

export async function createTask(taskData) {
  if (!currentUser) {
    throw new Error("Kein eingeloggter User.");
  }

  const payload = {
    title: taskData.title,
    description: taskData.description,
    dueDate: taskData.dueDate,
    priority: taskData.priority,
    assignedTo: taskData.assignedTo || [],
    category: taskData.category,
    subtasks: taskData.subtasks || [],
    status: taskData.status || "todo",
    createdBy: currentUser.uid,
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, "tasks"), payload);
  return docRef.id;
}