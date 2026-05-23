import { loadData } from "./storage.js";

const splashScreen = document.getElementById("splashScreen");
const splashLogo = document.getElementById("splashLogo");
const authLogo = document.querySelector(".authLogo");
const splashBackground = document.getElementById("splashBackground");

const loginForm = document.getElementById("loginForm");
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const loginError = document.getElementById("loginError");
const guestLoginBtn = document.getElementById("guestLoginBtn");

window.addEventListener("load", () => {
  splashLogo.classList.add("animate");
  splashBackground.classList.add("fadeOut");

  setTimeout(() => {
    authLogo.classList.add("show");
    splashScreen.style.display = "none";
  }, 1500);
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = loginEmail.value.trim();
  const password = loginPassword.value.trim();

  try {
    const users = await loadData("users");

    const foundEntry = Object.entries(users).find(([, user]) => {
      return user.email === email && user.password === password;
    });

    if (!foundEntry) {
      loginError.textContent = "E-Mail oder Passwort ist falsch.";
      return;
    }

    const [id, user] = foundEntry;

    localStorage.setItem(
      "currentUser",
      JSON.stringify({
        id,
        name: user.name,
        email: user.email,
        initials: user.initials,
      })
    );

    window.location.href = "../htmlSites1/addTask.html";
  } catch (error) {
    console.error(error);
    loginError.textContent = "Login fehlgeschlagen.";
  }
});

guestLoginBtn.addEventListener("click", () => {
  localStorage.setItem(
    "currentUser",
    JSON.stringify({
      id: "guest",
      name: "Guest User",
      email: "guest@example.com",
      initials: "GU",
    })
  );
  localStorage.setItem("userStatus", "guest")
  localStorage.setItem("username", "guest")

  window.location.href = "./summary.html";
});