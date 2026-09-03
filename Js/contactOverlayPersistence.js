
/**
 * Creates a new contact after validating the form data.
 * Saves the contact to the database and updates the local contact list.
 *
 * @returns {Promise<void>} A promise that resolves when the contact is created.
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
 * Stores a new contact in the local contact cache.
 *
 * @param {string} id - The unique ID of the contact.
 * @param {Object} newContact - The contact data to store.
 * @returns {void}
 */
function saveContactLocally(id, newContact) {
    fetchedData[id] = {
        id,
        ...newContact,
    };
}

/**
 * Updates the contact list after creating a new contact.
 * Closes the add contact dialog and shows a success message.
 *
 * @returns {void}
 */
function updateContactList() {
    renderContactList();
    CloseAddContactDialog();
    popupMessage("Contact created!");
}


/**
 * Collects and trims the contact form input values.
 *
 * @returns {Object} An object containing the name, email, and phone values.
 */
function getContactFormData() {

    return {
        name: document.getElementById("name_input").value.trim(),
        email: document.getElementById("email_input").value.trim(),
        phone: document.getElementById("phone_input").value.trim(),
    };

}

/**
 * Checks whether a contact with the same name or email exists.
 * Updates duplicate errors and the form submit button.
 *
 * @param {Object} data - The contact data to check.
 * @param {string} mode - The form mode, such as "add" or "edit".
 * @param {string|null} [excludedContactId=null] - Contact ID to exclude.
 * @returns {boolean} True if no duplicate exists, otherwise false.
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
 * Sets a duplicate error for a contact form field.
 * Marks the field as touched and invalid when a duplicate exists.
 *
 * @param {string} mode - The form mode, such as "add" or "edit".
 * @param {string} field - The field to mark as duplicate.
 * @param {boolean} exists - Whether a duplicate contact exists.
 * @returns {void}
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
 * Updates an existing contact after validating the edited data.
 * Saves the changes and updates the local contact data and UI.
 *
 * @returns {Promise<void>} A promise that resolves when the contact is updated.
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
 * Updates the contact data in the local contact cache.
 * Recalculates the contact initials based on the updated name.
 *
 * @param {string} id - The unique ID of the contact.
 * @param {Object} updatedData - The updated contact data.
 * @returns {void}
 */
function updateLocalContact(id, updatedData) {
    fetchedData[id] = {
        ...fetchedData[id],
        ...updatedData,
        initials: getInitials(updatedData.name),
    };
}

/**
 * Updates the contact list and details after editing a contact.
 * Closes the edit dialog and displays a success message.
 *
 * @param {string} id - The unique ID of the updated contact.
 * @returns {void}
 */
function updateContactUI(id) {
    renderContactList();
    renderContactDetails(fetchedData[id]);
    CloseEditDialog();
    popupMessage("Contact updated!");
}

/**
 * Collects and trims the edited contact form values.
 *
 * @returns {Object} An object containing the name, email, and phone values.
 */
function getEditedContactFormData() {
  return {
    name: document.getElementById("nameInput").value.trim(),
    email: document.getElementById("emailInput").value.trim(),
    phone: document.getElementById("phoneInput").value.trim(),
  };
}

/**
 * Opens the edit dialog for the selected contact.
 * Loads the contact data into the edit form and initializes it.
 *
 * @param {string} contactId - The unique ID of the contact to edit.
 * @returns {void}
 */
function openEdit(contactId) {

    const contact = fetchedData[contactId];

    if (!contact) return;

    currentContactId = contactId;

    editContactPopup.innerHTML = renderEditTemplate(contact);
    initializeContactForm("edit");
    OpenEditDialog();

}


