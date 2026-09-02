/**
 * Initializes the contact form for the given mode.
 * Resets field values and validation states when requested.
 * Updates form messages and the submit button afterwards.
 *
 * @param {string} mode - The form mode, such as "add" or "edit".
 * @param {boolean} [clearValues=false] - Whether to clear all input values.
 * @returns {void}
 */
function initializeContactForm(mode, clearValues = false) {
  const config = contactFormConfig[mode];
  if (!config) return;

  Object.entries(config.fields).forEach(([fieldName, [inputId]]) => {
    const input = document.getElementById(inputId);
    if (!input) return;
    if (clearValues) input.value = "";

    contactFieldTouched[mode][fieldName] = false;
    contactFormState[mode][fieldName] = !getContactFieldError(
      fieldName,
      input.value,
    );
    setContactFieldError(mode, fieldName, "");
  });

  clearContactFormMessage(mode);
  updateContactSubmitButton(mode);
}

/**
 * Validates a contact field and returns an error message if invalid.
 *
 * @param {string} fieldName - The name of the field to validate.
 * @param {string} rawValue - The original value entered in the field.
 * @returns {string} An error message or an empty string if valid.
 */
function getContactFieldError(fieldName, rawValue) {
  const value = rawValue.trim();

  if (!value)
    return `${fieldName[0].toUpperCase() + fieldName.slice(1)} is required`;

  if (fieldName === "name") return validateName(rawValue, value);
  if (fieldName === "email") return validateEmail(rawValue, value);
  if (fieldName === "phone") return validatePhone(value);

  return "";
}

/**
 * Validates a contact name for spaces and allowed characters.
 *
 * @param {string} rawValue - The original input value before trimming.
 * @param {string} value - The trimmed name value.
 * @returns {string} An error message or an empty string if valid.
 */
function validateName(rawValue, value) {
  if (rawValue !== value)
    return "Name cannot contain leading or trailing spaces";

  const regex = /^[\p{L}\p{M}]+(?:[\s'’-][\p{L}\p{M}]+)*$/u;
  return regex.test(value)
    ? ""
    : "Only letters, spaces, apostrophes and hyphens are allowed";
}

/**
 * Validates an email address for spaces and valid formatting.
 *
 * @param {string} rawValue - The original input value before trimming.
 * @param {string} value - The trimmed email address.
 * @returns {string} An error message or an empty string if valid.
 */
function validateEmail(rawValue, value) {
  if (rawValue !== value)
    return "Email address cannot contain leading or trailing spaces";

  const regex = /^(?!.*\.\.)(?!.*@\.)[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(value) ? "" : "Please enter a valid email";
}

/**
 * Validates a phone number for allowed characters and digit length.
 *
 * @param {string} value - The phone number to validate.
 * @returns {string} An error message or an empty string if valid.
 */
function validatePhone(value) {
  const regex = /^\+?[0-9\s()-]+$/;
  const digits = value.replace(/\D/g, "").length;

  return regex.test(value) && digits >= 7 && digits <= 15
    ? ""
    : "Please enter a valid phone number (7 to 15 digits)";
}

/**
 * Displays or clears a validation error for a contact form field.
 * Updates the error message, accessibility state, and invalid styling.
 *
 * @param {string} mode - The form mode, such as "add" or "edit".
 * @param {string} fieldName - The name of the field to update.
 * @param {string} message - The validation error message to display.
 * @returns {void}
 */
function setContactFieldError(mode, fieldName, message) {
  const fieldConfig = contactFormConfig[mode]?.fields[fieldName];
  if (!fieldConfig) return;

  const [inputId, errorId, containerId] = fieldConfig;
  const input = document.getElementById(inputId);
  const errorElement = document.getElementById(errorId);
  const inputContainer = document.getElementById(containerId);

  if (errorElement) errorElement.textContent = message;
  if (input) input.setAttribute("aria-invalid", String(Boolean(message)));
  if (inputContainer) {
    inputContainer.classList.toggle("contact-input-invalid", Boolean(message));
  }
}

/**
 * Validates a contact form field and updates its validation state.
 * Displays the error message and updates the submit button accordingly.
 *
 * @param {string} mode - The form mode, such as "add" or "edit".
 * @param {string} fieldName - The name of the field to validate.
 * @returns {boolean} True if the field is valid, otherwise false.
 */
function validateContactField(mode, fieldName) {
  const inputId = contactFormConfig[mode]?.fields[fieldName]?.[0];
  const input = document.getElementById(inputId);
  if (!input) return false;

  contactFieldTouched[mode][fieldName] = true;
  const message = getContactFieldError(fieldName, input.value);
  contactFormState[mode][fieldName] = !message;
  setContactFieldError(mode, fieldName, message);
  clearContactFormMessage(mode);
  updateContactSubmitButton(mode);
  return !message;
}

/**
 * Validates a contact field while the user enters data.
 * Updates the field state and displays errors for touched fields.
 *
 * @param {string} mode - The form mode, such as "add" or "edit".
 * @param {string} fieldName - The name of the field being updated.
 * @returns {void}
 */
function handleContactFieldInput(mode, fieldName) {
  const inputId = contactFormConfig[mode]?.fields[fieldName]?.[0];
  const input = document.getElementById(inputId);
  if (!input) return;

  const message = getContactFieldError(fieldName, input.value);
  contactFormState[mode][fieldName] = !message;

  if (contactFieldTouched[mode][fieldName]) {
    setContactFieldError(mode, fieldName, message);
  }

  clearContactFormMessage(mode);
  updateContactSubmitButton(mode);
}

/**
 * Validates all fields of the contact form.
 *
 * @param {string} mode - The form mode, such as "add" or "edit".
 * @returns {boolean} True if all form fields are valid, otherwise false.
 */
function validateContactForm(mode) {
  const results = Object.keys(contactFormConfig[mode].fields).map((fieldName) =>
    validateContactField(mode, fieldName),
  );
  return results.every(Boolean);
}

/**
 * Updates the contact form submit button based on the validation state.
 * Disables the button when one or more fields are invalid.
 *
 * @param {string} mode - The form mode, such as "add" or "edit".
 * @returns {void}
 */
function updateContactSubmitButton(mode) {
  const button = document.getElementById(contactFormConfig[mode]?.buttonId);
  if (!button) return;
  button.disabled = !Object.values(contactFormState[mode]).every(Boolean);
}

/**
 * Clears and hides the contact form summary message.
 *
 * @param {string} mode - The form mode, such as "add" or "edit".
 * @returns {void}
 */
function clearContactFormMessage(mode) {
  const messageElement = document.getElementById(
    contactFormConfig[mode]?.summaryId,
  );
  if (!messageElement) return;
  messageElement.textContent = "";
  messageElement.hidden = true;
}

/**
 * Creates a new contact after validating the form data.
 * Saves the contact to the database and updates the local contact list.
 *
 * @returns {Promise<void>} A promise that resolves when the contact is created.
 */
