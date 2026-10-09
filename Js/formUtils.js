/**
 * Marks an input as invalid and displays its error message.
 *
 * @param {HTMLElement} input - The input element to process.
 * @param {HTMLElement} errorElement - The element used to display an error.
 * @param {string} message - The message to display.
 * @returns {void}
 */
export function setInputError(input, errorElement, message) {
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
export function clearInputError(input, errorElement) {
  input.classList.remove("inputError");
  errorElement.textContent = "";
}

/**
 * Checks whether an email address contains the required basic characters.
 *
 * @param {string} email - The email address to validate.
 * @returns {boolean} Whether the validation or comparison succeeds.
 */
export function isValidEmail(email) {
  return email.includes("@") && email.includes(".");
}
