
let contactPopUpAdd = document.getElementById("contact-pop-add");
let addContactOverlay = document.getElementById("add-contact-overlay");
let editContactPopup = document.getElementById("edit-contact-popup");

const contactFormConfig = {
  add: {
    buttonId: "createContactBtn",
    summaryId: "validationErrorMsg",
    fields: {
      name: ["name_input", "name_error", "addInputContainer_name"],
      email: ["email_input", "email_error", "addInputContainer_email"],
      phone: ["phone_input", "phone_error", "addInputContainer_phone"],
    },
  },
  edit: {
    buttonId: "saveContact-btn",
    summaryId: "editValidationErrorMsg",
    fields: {
      name: ["nameInput", "editName_error", "editInputContainer_name"],
      email: ["emailInput", "editEmail_error", "editInputContainer_email"],
      phone: ["phoneInput", "editPhone_error", "editInputContainer_phone"],
    },
  },
};

const contactFormState = {
  add: { name: false, email: false, phone: false },
  edit: { name: false, email: false, phone: false },
};

const contactFieldTouched = {
  add: { name: false, email: false, phone: false },
  edit: { name: false, email: false, phone: false },
};

function OpenAddDialog() {
  initializeContactForm("add", true);
  contactPopUpAdd.classList.remove("d_none");

  setTimeout(() =>{
  addContactOverlay.classList.remove(`slide-out`)
  addContactOverlay.classList.add(`slide-in`)
  }, 200)
 
}

function CloseAddDialog() {
  setTimeout(() =>{
  addContactOverlay.classList.remove(`slide-in`)
  addContactOverlay.classList.add(`slide-out`)
  setTimeout(() => {
    contactPopUpAdd.classList.add("d_none");
    initializeContactForm("add", true);
  }, 460)
  }, 200)
 
}

function CloseAddContactDialog() {
  CloseAddDialog();
}

function OpenEditDialog() {
  editContactPopup.classList.remove("d_none");
  let editContactOverlayD = document.getElementById(`edit-contact-overlay`)

  setTimeout(() =>{
  editContactOverlayD.classList.remove(`slide-out`)
  editContactOverlayD.classList.add(`slide-in`)
  }, 200)
 
}


function CloseEditDialog() {
  let editContactOverlayD = document.getElementById(`edit-contact-overlay`)
  setTimeout(() =>{
  editContactOverlayD.classList.remove(`slide-in`)
  editContactOverlayD.classList.add(`slide-out`)
  setTimeout(() => {
    editContactPopup.classList.add("d_none");

  }, 460)
  }, 200)
 
}

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

function getContactFieldError(fieldName, rawValue) {
  const value = rawValue.trim();

  if (!value) {
    return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
  }

  if (fieldName === "name") {
    if (rawValue !== value) {
      return "Name cannot contain leading or trailing spaces";
    }

    const nameRegex = /^[\p{L}\p{M}]+(?:[\s'’-][\p{L}\p{M}]+)*$/u;
    return nameRegex.test(value)
      ? ""
      : "Only letters, spaces, apostrophes and hyphens are allowed";
  }

  if (fieldName === "email") {
    if (rawValue !== rawValue.trim()) {
      return "Email address cannot contain leading or trailing spaces";
    }
    const emailRegex = /^(?!.*\.\.)(?!.*@\.)[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? "" : "Please enter a valid email";
  }

  if (fieldName === "phone") {
  const phone = value.trim();
  const phoneCharactersRegex = /^\+?[0-9\s()-]+$/;
  const digitCount = phone.replace(/\D/g, "").length;

  return phoneCharactersRegex.test(phone) &&
    digitCount >= 7 &&
    digitCount <= 15
    ? ""
    : "Please enter a valid phone number (7 to 15 digits)";
}

  return "";
}

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

function validateContactForm(mode) {
  const results = Object.keys(contactFormConfig[mode].fields).map((fieldName) =>
    validateContactField(mode, fieldName),
  );
  return results.every(Boolean);
}

function updateContactSubmitButton(mode) {
  const button = document.getElementById(contactFormConfig[mode]?.buttonId);
  if (!button) return;
  button.disabled = !Object.values(contactFormState[mode]).every(Boolean);
}

function clearContactFormMessage(mode) {
  const messageElement = document.getElementById(
    contactFormConfig[mode]?.summaryId,
  );
  if (!messageElement) return;
  messageElement.textContent = "";
  messageElement.hidden = true;
}

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

        fetchedData[id] = {
            id,
            ...newContact,
        };

        renderContactList();
        CloseAddContactDialog()
        popupMessage("Contact created!");

    } catch (error) {

        console.error("Error creating contact:", error);
        contactErrorMsg("Failed to create contact");

    }

}

function randomColor() {

    return colors[Math.floor(Math.random() * colors.length)];

}

function getContactFormData() {

    return {
        name: document.getElementById("name_input").value.trim(),
        email: document.getElementById("email_input").value.trim(),
        phone: document.getElementById("phone_input").value.trim(),
    };

}

function checkDuplicateContact(data, mode, excludedContactId = null) {
    const contacts = Object.entries(fetchedData)
      .filter(([id]) => id !== excludedContactId)
      .map(([, contact]) => contact);
    const normalizedName = data.name.toLowerCase().replace(/\s+/g, " ");
    const normalizedEmail = data.email.toLowerCase();
    const nameExists = contacts.some((contact) =>
      contact.name?.toLowerCase().replace(/\s+/g, " ") === normalizedName
    );
    const emailExists = contacts.some((contact) =>
      contact.email?.toLowerCase() === normalizedEmail
    );

    if (nameExists) {
      contactFieldTouched[mode].name = true;
      contactFormState[mode].name = false;
      setContactFieldError(mode, "name", "A contact with this name already exists");
    }

    if (emailExists) {
      contactFieldTouched[mode].email = true;
      contactFormState[mode].email = false;
      setContactFieldError(mode, "email", "A contact with this email already exists");
    }

    updateContactSubmitButton(mode);
    return !nameExists && !emailExists;
}

//Neue Version vom saveEditContact
async function saveEditedContact() {
    const id = currentContactId;

    if (!id) return;

    const updatedData = getEditedContactFormData();

    if (!validateContactForm("edit")) return;

    if (!checkDuplicateContact(updatedData, "edit", id)) return;

    try {
        // 🔥 1. Firebase wird geändert
        await updateData("contacts", id, updatedData);

        // 🔥 2. Lokaler Cache wird aktualisiert
        fetchedData[id] = {
            ...fetchedData[id],
            ...updatedData,
            initials: getInitials(updatedData.name),
        };

        // 🔥 3. UI aktualisieren
        renderContactList();
        renderContactDetails(fetchedData[id]);
        CloseEditDialog();
        popupMessage("Contact updated!");
    } catch (error) {
        console.error("Update failed:", error);
        contactErrorMsg("Failed to update contact", "edit");
    }
}

function getEditedContactFormData() {
  return {
    name: document.getElementById("nameInput").value.trim(),
    email: document.getElementById("emailInput").value.trim(),
    phone: document.getElementById("phoneInput").value.trim(),
  };
}

function openEdit(contactId) {

    const contact = fetchedData[contactId];

    if (!contact) return;

    currentContactId = contactId;

    editContactPopup.innerHTML = renderEditTemplate(contact);
    initializeContactForm("edit");
    OpenEditDialog();

}




