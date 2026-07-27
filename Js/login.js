import { loadData } from "./storage.js";

const loginEmailError = document.getElementById("loginEmailError");
const loginPasswordError = document.getElementById("loginPasswordError");

const splashScreen = document.getElementById("splashScreen");
const splashLogo = document.getElementById("splashLogo");
const authLogo = document.querySelector(".authLogo");
const splashBackground = document.getElementById("splashBackground");

const loginForm = document.getElementById("loginForm");
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
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

  clearAllErrors();

  const email = loginEmail.value.trim();
  const password = loginPassword.value.trim();

  if (!isValidEmail(email)) {
    setInputError(
      loginEmail,
      loginEmailError,
      "Please enter a valid email address.",
    );
    return;
  }

  if (!password) {
    setInputError(
      loginPassword,
      loginPasswordError,
      "Please enter your password.",
    );
    return;
  }

  try {
    const users = await loadData("users");

    const foundEntry = Object.entries(users).find(([, user]) => {
      return user.email === email && user.password === password;
    });

    if (!foundEntry) {
      setInputError(
        loginEmail,
        loginEmailError,
        "Check your email and password. Please try again.",
      );
      setInputError(loginPassword, loginPasswordError, "");
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
      }),
    );
    localStorage.setItem("userStatus", "user");
    localStorage.setItem("username", user.name);

    showLoginSuccessOverlay();

    setTimeout(() => {
      window.location.href = "./summary.html";
    }, 1000);
  } catch (error) {
    console.error(error);
    setInputError(
      loginEmail,
      loginEmailError,
      "Login failed. Please try again.",
    );
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
    }),
  );

  localStorage.setItem("userStatus", "guest");
  localStorage.setItem("username", "guest");

  showLoginSuccessOverlay();

  setTimeout(() => {
    window.location.href = "./summary.html";
  }, 1000);
});

loginEmail.addEventListener("input", () => {
  clearInputError(loginEmail, loginEmailError);
});

loginPassword.addEventListener("input", () => {
  clearInputError(loginPassword, loginPasswordError);
});

function setInputError(input, errorElement, message) {
  input.classList.add("inputError");
  errorElement.textContent = message;
}

function clearInputError(input, errorElement) {
  input.classList.remove("inputError");
  errorElement.textContent = "";
}

function clearAllErrors() {
  clearInputError(loginEmail, loginEmailError);
  clearInputError(loginPassword, loginPasswordError);
}

function isValidEmail(email) {
  return email.includes("@") && email.includes(".");
}

function showLoginSuccessOverlay() {
  const overlay = document.getElementById("loginSuccessOverlay");

  overlay.classList.remove("dNone");

  setTimeout(() => {
    overlay.classList.add("show");
  }, 10);
}
