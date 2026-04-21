import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


const firebaseConfig = {
  apiKey: "AIzaSyBiVlZXfMRSTCBbKaBojJb3l3gtj0XCnGM",
  authDomain: "join1-cf601.firebaseapp.com",
  projectId: "join1-cf601",
  storageBucket: "join1-cf601.firebasestorage.app",
  messagingSenderId: "867458741705",
  appId: "1:867458741705:web:f286a923969980c61a6418",
  measurementId: "G-YN2089JYDS"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
