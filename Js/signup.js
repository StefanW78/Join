import { loadData, postData } from "./storage.js";

const signupForm = document.getElementById("signupForm");
const signupName = document.getElementById("signupName");
const signupEmail = document.getElementById("signupEmail");
const signupPassword = document.getElementById("signupPassword");
const signupConfirmPassword = document.getElementById("signupConfirmPassword");
const signupPrivacy = document.getElementById("signupPrivacy");
const signupError = document.getElementById("signupError");
const signupSuccess = document.getElementById("signupSuccess");

const nameError = document.getElementById("nameError");
const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");
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

function setInputError(input, errorElement, message) {
  input.classList.add("inputError");
  errorElement.textContent = message;
}

function clearInputError(input, errorElement) {
  input.classList.remove("inputError");
  errorElement.textContent = "";
}

function clearAllErrors() {
  signupError.textContent = "";
  signupSuccess.textContent = "";

  clearInputError(signupName, nameError);
  clearInputError(signupEmail, emailError);
  clearInputError(signupPassword, passwordError);
  clearInputError(signupConfirmPassword, confirmPasswordError);
}

function isValidEmail(email) {
  return email.includes("@") && email.includes(".");
}

function getInitials(name = "") {
  return name
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

function showSignupSuccessOverlay() {
  const overlay = document.getElementById("signupSuccessOverlay");

  overlay.classList.remove("dNone");

  setTimeout(() => {
    overlay.classList.add("show");
  }, 10);
}

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

function validatePrivacy() {
  signupError.textContent = "";

  if (!signupPrivacy.checked) {
    signupError.textContent = "Please accept Privacy Policy.";
    return false;
  }

  return true;
}
