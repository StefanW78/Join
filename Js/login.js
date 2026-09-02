import { loadData } from "./storage.js";

/**
 * References the DOM element with the ID `loginEmailError`.
 */
const loginEmailError = document.getElementById("loginEmailError");
/**
 * References the DOM element with the ID `loginPasswordError`.
 */
const loginPasswordError = document.getElementById("loginPasswordError");

/**
 * References the DOM element with the ID `splashScreen`.
 */
const splashScreen = document.getElementById("splashScreen");
/**
 * References the DOM element with the ID `splashLogo`.
 */
const splashLogo = document.getElementById("splashLogo");
/**
 * References the first DOM element matching `.authLogo`.
 */
const authLogo = document.querySelector(".authLogo");
/**
 * References the DOM element with the ID `splashBackground`.
 */
const splashBackground = document.getElementById("splashBackground");

/**
 * References the DOM element with the ID `loginForm`.
 */
const loginForm = document.getElementById("loginForm");
/**
 * References the DOM element with the ID `loginEmail`.
 */
const loginEmail = document.getElementById("loginEmail");
/**
 * References the DOM element with the ID `loginPassword`.
 */
const loginPassword = document.getElementById("loginPassword");
/**
 * References the DOM element with the ID `guestLoginBtn`.
 */
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

/**
 * Marks an input as invalid and displays its error message.
 *
 * @param {HTMLElement} input - The input element to process.
 * @param {HTMLElement} errorElement - The element used to display an error.
 * @param {string} message - The message to display.
 * @returns {void}
 */
function setInputError(input, errorElement, message) {
  input.classList.add("inputError");
  errorElement.textContent = message;
}

/**
 * Removes the error state and message from an input.
 *
 * @param {HTMLElement} input - The input element to process.
 * @param {HTMLElement} errorElement - The element used to display an error.
 * @returns {void}
 */
function clearInputError(input, errorElement) {
  input.classList.remove("inputError");
  errorElement.textContent = "";
}

/**
 * Clears all validation errors from the current form.
 *
 * @returns {void}
 */
function clearAllErrors() {
  clearInputError(loginEmail, loginEmailError);
  clearInputError(loginPassword, loginPasswordError);
}

/**
 * Checks whether an email address contains the required basic characters.
 *
 * @param {string} email - The email address to validate.
 * @returns {boolean} Whether the validation or comparison succeeds.
 */
function isValidEmail(email) {
  return email.includes("@") && email.includes(".");
}

/**
 * Displays the login success overlay.
 *
 * @returns {void}
 */
function showLoginSuccessOverlay() {
  const overlay = document.getElementById("loginSuccessOverlay");

  overlay.classList.remove("dNone");

  setTimeout(() => {
    overlay.classList.add("show");
  }, 10);
}
