import { db } from "./firebase.js";
import {
  ref,
  onValue,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

export function listenToTasks(callback) {
  const tasksRef = ref(db, "tasks");

  onValue(tasksRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }

    const data = snapshot.val();

    const tasks = Object.entries(data).map(([id, task]) => ({
      id,
      ...task,
    }));

    callback(tasks);
  });
}