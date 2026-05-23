import { loadData, postData } from "./storage.js";

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
    const users = await loadData("users");
    const userExists = Object.values(users).some((user) => user.email === email);

    if (userExists) {
      signupError.textContent = "Diese E-Mail-Adresse wird bereits verwendet.";
      return;
    }

    const user = {
      name,
      email,
      password,
      initials: getInitials(name),
      createdAt: Date.now(),
    };

    await postData("users", user);

    signupSuccess.textContent = "Registrierung erfolgreich.";

    setTimeout(() => {
      window.location.href = "./login.html";
    }, 1000);
  } catch (error) {
    console.error(error);
    signupError.textContent = "Registrierung fehlgeschlagen.";
  }
});

function getInitials(name = "") {
  return name
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}