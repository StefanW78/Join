import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAQcmLvkjSPOO1RZ3_V3Bd9RPmtz-AplDU",
  authDomain: "test-2651c.firebaseapp.com",
  databaseURL: "https://test-2651c-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "test-2651c",
  storageBucket: "test-2651c.firebasestorage.app",
  messagingSenderId: "800204801428",
  appId: "1:800204801428:web:985963c3b0f7b337a23b81",
  measurementId: "G-1DC79B9YXP",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getDatabase(app);