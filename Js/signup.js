import { loadData, postData } from "./storage.js";

/**
 * References the DOM element with the ID `signupForm`.
 */
const signupForm = document.getElementById("signupForm");
/**
 * References the DOM element with the ID `signupName`.
 */
const signupName = document.getElementById("signupName");
/**
 * References the DOM element with the ID `signupEmail`.
 */
const signupEmail = document.getElementById("signupEmail");
/**
 * References the DOM element with the ID `signupPassword`.
 */
const signupPassword = document.getElementById("signupPassword");
/**
 * References the DOM element with the ID `signupConfirmPassword`.
 */
const signupConfirmPassword = document.getElementById("signupConfirmPassword");
/**
 * References the DOM element with the ID `signupPrivacy`.
 */
const signupPrivacy = document.getElementById("signupPrivacy");
/**
 * References the DOM element with the ID `signupError`.
 */
const signupError = document.getElementById("signupError");
/**
 * References the DOM element with the ID `signupSuccess`.
 */
const signupSuccess = document.getElementById("signupSuccess");

/**
 * References the DOM element with the ID `nameError`.
 */
const nameError = document.getElementById("nameError");
/**
 * References the DOM element with the ID `emailError`.
 */
const emailError = document.getElementById("emailError");
/**
 * References the DOM element with the ID `passwordError`.
 */
const passwordError = document.getElementById("passwordError");
/**
 * References the DOM element with the ID `confirmPasswordError`.
 */
const confirmPasswordError = document.getElementById("confirmPasswordError");

signupForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  clearAllErrors();

  const isNameValid = validateUsername();
  const isEmailValid = validateEmail();
  const isPasswordValid = validatePassword();
  const isConfirmPasswordValid = validateConfirmPassword();
  const isPrivacyValid = validatePrivacy();

  if (
    !isNameValid ||
    !isEmailValid ||
    !isPasswordValid ||
    !isConfirmPasswordValid ||
    !isPrivacyValid
  ) {
    return;
  }

  const name = signupName.value.trim();
  const email = signupEmail.value.trim();
  const password = signupPassword.value.trim();

  try {
    const users = (await loadData("users")) || {};

    const userExists = Object.values(users).some((user) => {
      return user.email === email;
    });

    if (userExists) {
      setInputError(
        signupEmail,
        emailError,
        "This email address is already in use.",
      );
      return;
    }

    const userCount = Object.keys(users).length;

    const user = {
      name,
      email,
      password,
      initials: getInitials(name),
      createdAt: Date.now(),
      color: getAvatarColor(userCount),
    };

    await postData("users", user);

    showSignupSuccessOverlay();

    setTimeout(() => {
      window.location.href = "./index.html";
    }, 1000);
  } catch (error) {
    console.error(error);
    signupError.textContent =
      "Something went wrong. Registration failed.";
  }
});

/**
 * Validates the username.
 *
 * @returns {boolean} Whether the validation or comparison succeeds.
 */
function validateUsername() {
  const name = signupName.value.trim();
  const nameParts = name.split(" ").filter(Boolean);

  clearInputError(signupName, nameError);

  if (nameParts.length < 2) {
    setInputError(
      signupName,
      nameError,
      "Bitte Vor- und Nachname eintragen."
    );
    return false;
  }

  return true;
}

/**
 * Validates the email.
 *
 * @returns {boolean} Whether the validation or comparison succeeds.
 */
function validateEmail() {
  const email = signupEmail.value.trim();

  clearInputError(signupEmail, emailError);

  if (!isValidEmail(email)) {
    setInputError(
      signupEmail,
      emailError,
      "Please enter a valid email.",
    );
    return false;
  }

  return true;
}

/**
 * Validates the password.
 *
 * @returns {boolean} Whether the validation or comparison succeeds.
 */
function validatePassword() {
  const password = signupPassword.value.trim();

  clearInputError(signupPassword, passwordError);

  if (password.length < 6) {
    setInputError(
      signupPassword,
      passwordError,
      "Password must be at least 6 characters.",
    );
    return false;
  }

  return true;
}

/**
 * Validates that the confirmation password is present and matches.
 *
 * @returns {boolean} Whether the validation or comparison succeeds.
 */
function validateConfirmPassword() {
  const password = signupPassword.value.trim();
  const confirmPassword = signupConfirmPassword.value.trim();

  clearInputError(signupConfirmPassword, confirmPasswordError);

  if (!confirmPassword) {
    setInputError(
      signupConfirmPassword,
      confirmPasswordError,
      "Please confirm your password.",
    );
    return false;
  }

  if (password !== confirmPassword) {
    setInputError(
      signupConfirmPassword,
      confirmPasswordError,
      "Passwords do not match.",
    );
    return false;
  }

  return true;
}

signupName.addEventListener("blur", validateUsername);
signupEmail.addEventListener("blur", validateEmail);
signupPassword.addEventListener("blur", validatePassword);
signupConfirmPassword.addEventListener(
  "blur",
  validateConfirmPassword,
);

signupPrivacy.addEventListener("change", validatePrivacy);

signupName.addEventListener("input", () => {
  clearInputError(signupName, nameError);
});

signupEmail.addEventListener("input", () => {
  clearInputError(signupEmail, emailError);
});

signupPassword.addEventListener("input", () => {
  clearInputError(signupPassword, passwordError);

  if (signupConfirmPassword.value) {
    validateConfirmPassword();
  }
});

signupConfirmPassword.addEventListener("input", () => {
  clearInputError(
    signupConfirmPassword,
    confirmPasswordError,
  );
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
  signupError.textContent = "";
  signupSuccess.textContent = "";

  clearInputError(signupName, nameError);
  clearInputError(signupEmail, emailError);
  clearInputError(signupPassword, passwordError);
  clearInputError(signupConfirmPassword, confirmPasswordError);
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
 * Generates uppercase initials from the first two parts of a name.
 *
 * @param {string} name - The name used to generate the initials.
 * @returns {string} The generated value or HTML markup.
 */
function getInitials(name = "") {
  return name
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

/**
 * Displays the signup success overlay.
 *
 * @returns {void}
 */
function showSignupSuccessOverlay() {
  const overlay = document.getElementById("signupSuccessOverlay");

  overlay.classList.remove("dNone");

  setTimeout(() => {
    overlay.classList.add("show");
  }, 10);
}

/**
 * Selects an avatar color based on an item's position.
 *
 * @param {number} index - The item's position in its list.
 * @returns {string} The generated value or HTML markup.
 */
function getAvatarColor(index) {
  const colors = [
    "#9327ff",
    "#ff7a00",
    "#fc71ff",
    "#6e52ff",
    "#1fd7c1",
    "#ffbb2b",
  ];

  return colors[index % colors.length];
}

signupPrivacy.addEventListener("change", validatePrivacy);

/**
 * Validates that the privacy policy checkbox has been accepted.
 *
 * @returns {boolean} Whether the validation or comparison succeeds.
 */
function validatePrivacy() {
  signupError.textContent = "";

  if (!signupPrivacy.checked) {
    signupError.textContent = "Please accept Privacy Policy.";
    return false;
  }

  return true;
}
