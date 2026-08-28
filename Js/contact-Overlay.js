

/**

Initializes the contact form for the given mode.
Resets field values and validation states when requested.
Updates form messages and the submit button afterwards.
@param {string} mode - The form mode, such as "add" or "edit".
@param {boolean} [clearValues=false] - Whether to clear all input values.
@returns {void}
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

Validates a contact field and returns an error message if invalid.
@param {string} fieldName - The name of the field to validate.
@param {string} rawValue - The original value entered in the field.
@returns {string} An error message or an empty string if valid.
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

Validates a contact name for spaces and allowed characters.
@param {string} rawValue - The original input value before trimming.
@param {string} value - The trimmed name value.
@returns {string} An error message or an empty string if valid.
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

Validates an email address for spaces and valid formatting.
@param {string} rawValue - The original input value before trimming.
@param {string} value - The trimmed email address.
@returns {string} An error message or an empty string if valid.
*/
function validateEmail(rawValue, value) {
  if (rawValue !== value)
    return "Email address cannot contain leading or trailing spaces";

  const regex = /^(?!.*\.\.)(?!.*@\.)[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(value) ? "" : "Please enter a valid email";
}

/**

Validates a phone number for allowed characters and digit length.
@param {string} value - The phone number to validate.
@returns {string} An error message or an empty string if valid.
*/
function validatePhone(value) {
  const regex = /^\+?[0-9\s()-]+$/;
  const digits = value.replace(/\D/g, "").length;

  return regex.test(value) && digits >= 7 && digits <= 15
    ? ""
    : "Please enter a valid phone number (7 to 15 digits)";
}

/**

Displays or clears a validation error for a contact form field.
Updates the error message, accessibility state, and invalid styling.
@param {string} mode - The form mode, such as "add" or "edit".
@param {string} fieldName - The name of the field to update.
@param {string} message - The validation error message to display.
@returns {void}
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

Validates a contact form field and updates its validation state.
Displays the error message and updates the submit button accordingly.
@param {string} mode - The form mode, such as "add" or "edit".
@param {string} fieldName - The name of the field to validate.
@returns {boolean} True if the field is valid, otherwise false.
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

Validates a contact field while the user is entering data.
Updates the field state and displays errors for touched fields.
@param {string} mode - The form mode, such as "add" or "edit".
@param {string} fieldName - The name of the field being updated.
@returns {void}
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

Validates all fields of the contact form.
@param {string} mode - The form mode, such as "add" or "edit".
@returns {boolean} True if all form fields are valid, otherwise false.
*/
function validateContactForm(mode) {
  const results = Object.keys(contactFormConfig[mode].fields).map((fieldName) =>
    validateContactField(mode, fieldName),
  );
  return results.every(Boolean);
}

/**

Updates the contact form submit button based on the validation state.
Disables the button when one or more fields are invalid.
@param {string} mode - The form mode, such as "add" or "edit".
@returns {void}
*/
function updateContactSubmitButton(mode) {
  const button = document.getElementById(contactFormConfig[mode]?.buttonId);
  if (!button) return;
  button.disabled = !Object.values(contactFormState[mode]).every(Boolean);
}

/**

Clears and hides the contact form summary message.
@param {string} mode - The form mode, such as "add" or "edit".
@returns {void}
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

Creates a new contact after validating the form data.

Saves the contact to the database and updates the local contact list.

@returns {Promise<void>} A promise that resolves when the contact is created.
*/
async function addNewContact() {
    const data = getContactFormData();

    if (!validateContactForm("add")) return;
    if (!checkDuplicateContact(data, "add")) return;

    const newContact = {
        ...data,
        initials: getInitials(data.name),
        color: randomColor(),
        checked: false,
    };

    try {
        const result = await saveData("contacts", newContact);
        const id = result.name;

        saveContactLocally(id, newContact);
        updateContactList();
    } catch (error) {
        console.error("Error creating contact:", error);
        contactErrorMsg("Failed to create contact");
    }
}

/**

Stores a new contact in the local contact cache.
@param {string} id - The unique ID of the contact.
@param {Object} newContact - The contact data to store.
@returns {void}
*/
function saveContactLocally(id, newContact) {
    fetchedData[id] = {
        id,
        ...newContact,
    };
}

/**

Updates the contact list after creating a new contact.
Closes the add contact dialog and shows a success message.
@returns {void}
*/
function updateContactList() {
    renderContactList();
    CloseAddContactDialog();
    popupMessage("Contact created!");
}


/**

Collects and trims the contact form input values.

@returns {Object} An object containing the name, email, and phone values.
*/
function getContactFormData() {

    return {
        name: document.getElementById("name_input").value.trim(),
        email: document.getElementById("email_input").value.trim(),
        phone: document.getElementById("phone_input").value.trim(),
    };

}

/**

Checks whether a contact with the same name or email already exists.
Updates duplicate error messages and the form submit button.
@param {Object} data - The contact data to check for duplicates.
@param {string} mode - The form mode, such as "add" or "edit".
@param {string|null} [excludedContactId=null] - Contact ID to exclude from the check.
@returns {boolean} True if no duplicate exists, otherwise false.
*/
function checkDuplicateContact(data, mode, excludedContactId = null) {
  const contacts = Object.entries(fetchedData)
    .filter(([id]) => id !== excludedContactId)
    .map(([, contact]) => contact);

  const nameExists = contacts.some(c =>
    c.name?.toLowerCase().replace(/\s+/g, " ") ===
    data.name.toLowerCase().replace(/\s+/g, " ")
  );

  const emailExists = contacts.some(c =>
    c.email?.toLowerCase() === data.email.toLowerCase()
  );

  setDuplicateError(mode, "name", nameExists);
  setDuplicateError(mode, "email", emailExists);
  updateContactSubmitButton(mode);

  return !nameExists && !emailExists;
}

/**

Sets a duplicate error for a contact form field.
Marks the field as touched and invalid when a duplicate exists.
@param {string} mode - The form mode, such as "add" or "edit".
@param {string} field - The field to mark as duplicate.
@param {boolean} exists - Whether a duplicate contact exists.
@returns {void}
*/
function setDuplicateError(mode, field, exists) {
  if (!exists) return;

  contactFieldTouched[mode][field] = true;
  contactFormState[mode][field] = false;

  const message = field === "name"
    ? "A contact with this name already exists"
    : "A contact with this email already exists";

  setContactFieldError(mode, field, message);
}

/**

Updates an existing contact after validating the edited data.

Saves the changes and updates the local contact data and UI.

@returns {Promise<void>} A promise that resolves when the contact is updated.
*/
async function saveEditedContact() {
    const id = currentContactId;
    if (!id) return;

    const updatedData = getEditedContactFormData();
    if (!validateContactForm("edit")) return;
    if (!checkDuplicateContact(updatedData, "edit", id)) return;

    try {
        await updateData("contacts", id, updatedData);
        updateLocalContact(id, updatedData);
        updateContactUI(id);
    } catch (error) {
        console.error("Update failed:", error);
        contactErrorMsg("Failed to update contact", "edit");
    }
}

/**

Updates the contact data in the local contact cache.
Recalculates the contact initials based on the updated name.
@param {string} id - The unique ID of the contact.
@param {Object} updatedData - The updated contact data.
@returns {void}
*/
function updateLocalContact(id, updatedData) {
    fetchedData[id] = {
        ...fetchedData[id],
        ...updatedData,
        initials: getInitials(updatedData.name),
    };
}

/**

Updates the contact list and details after editing a contact.
Closes the edit dialog and displays a success message.
@param {string} id - The unique ID of the updated contact.
@returns {void}
*/
function updateContactUI(id) {
    renderContactList();
    renderContactDetails(fetchedData[id]);
    CloseEditDialog();
    popupMessage("Contact updated!");
}

/**

Collects and trims the edited contact form values.
@returns {Object} An object containing the name, email, and phone values.
*/
function getEditedContactFormData() {
  return {
    name: document.getElementById("nameInput").value.trim(),
    email: document.getElementById("emailInput").value.trim(),
    phone: document.getElementById("phoneInput").value.trim(),
  };
}

/**

Opens the edit dialog for the selected contact.

Loads the contact data into the edit form and initializes it.

@param {string} contactId - The unique ID of the contact to edit.

@returns {void}
*/
function openEdit(contactId) {

    const contact = fetchedData[contactId];

    if (!contact) return;

    currentContactId = contactId;

    editContactPopup.innerHTML = renderEditTemplate(contact);
    initializeContactForm("edit");
    OpenEditDialog();

}




