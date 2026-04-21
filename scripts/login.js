import { loginUser, observeAuthState } from "./auth.js";

const loginForm = document.getElementById("loginForm");
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const loginError = document.getElementById("loginError");
const guestLoginBtn = document.getElementById("guestLoginBtn");

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  loginError.textContent = "";

  const email = loginEmail.value.trim();
  const password = loginPassword.value.trim();

  try {
    await loginUser(email, password);
    window.location.href = "../summary.html";
  } catch (error) {
    loginError.textContent = getLoginErrorMessage(error.code);
    console.error(error);
  }
});

guestLoginBtn.addEventListener("click", async () => {
  loginError.textContent = "";

  try {
    await loginUser("guest@example.com", "guest123456");
    window.location.href = "../summary.html";
  } catch (error) {
    loginError.textContent = "Guest login funktioniert gerade nicht.";
    console.error(error);
  }
});

function getLoginErrorMessage(errorCode) {
  switch (errorCode) {
    case "auth/invalid-credential":
      return "E-Mail oder Passwort ist falsch.";
    case "auth/invalid-email":
      return "Die E-Mail-Adresse ist ungültig.";
    case "auth/too-many-requests":
      return "Zu viele Versuche. Bitte warte kurz.";
    default:
      return "Login fehlgeschlagen. Bitte versuche es erneut.";
  }
}

observeAuthState((user) => {
  if (!user) return;

  const initials = (user.displayName || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

  const profileBadge = document.querySelector(".userInitials");

  if (profileBadge) {
    profileBadge.textContent = initials || "U";
  }
});