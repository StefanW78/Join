import { registerUser } from "./auth.js";

const signupForm = document.getElementById("signupForm");
const signupName = document.getElementById("signupName");
const signupEmail = document.getElementById("signupEmail");
const signupPassword = document.getElementById("signupPassword");
const signupConfirmPassword = document.getElementById("signupConfirmPassword");
const signupPrivacy = document.getElementById("signupPrivacy");
const signupError = document.getElementById("signupError");
const signupSuccess = document.getElementById("signupSuccess");

signupForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  signupError.textContent = "";
  signupSuccess.textContent = "";

  const name = signupName.value.trim();
  const email = signupEmail.value.trim();
  const password = signupPassword.value.trim();
  const confirmPassword = signupConfirmPassword.value.trim();

  if (password !== confirmPassword) {
    signupError.textContent = "Die Passwörter stimmen nicht überein.";
    return;
  }

  if (!signupPrivacy.checked) {
    signupError.textContent = "Bitte akzeptiere die Privacy Policy.";
    return;
  }

  try {
    await registerUser(name, email, password);
    signupSuccess.textContent = "Registrierung erfolgreich. Du wirst weitergeleitet...";
    setTimeout(() => {
      window.location.href = "../summary.html";
    }, 1200);
  } catch (error) {
    signupError.textContent = getSignupErrorMessage(error.code);
    console.error(error);
  }
});

function getSignupErrorMessage(errorCode) {
  switch (errorCode) {
    case "auth/email-already-in-use":
      return "Diese E-Mail-Adresse wird bereits verwendet.";
    case "auth/invalid-email":
      return "Die E-Mail-Adresse ist ungültig.";
    case "auth/weak-password":
      return "Das Passwort ist zu schwach.";
    case "auth/missing-password":
      return "Bitte gib ein Passwort ein.";
    default:
      return "Registrierung fehlgeschlagen. Bitte versuche es erneut.";
  }
}

import { observeAuthState } from "./auth.js";

observeAuthState((user) => {
  if (user) {
    const initials = user.displayName
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase();

    document.querySelector(".userProfileSvg").textContent = initials;
  }
});