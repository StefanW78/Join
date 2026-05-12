
let contactPopUpAdd = document.getElementById(`contact-pop-add`)
let addContactOverlay = document.getElementById(`add-contact-overlay`)
let editContactPopup = document.getElementById(`edit-contact-popup`)


function OpenAddDialog() {
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
  }, 460)
  }, 200)
 
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

async function addNewContact() {
  const newContact = await getDataToMakeNewContact();
  const contactName = document.getElementById("name_input").value.trim();
  const contactEmail = document.getElementById("email_input").value.trim();
  const contactPhone = document.getElementById("phone_input").value.trim();
  
  if (!contactName || !contactEmail || !contactPhone) {
    contactErrorMsg("Please fill in all fields");

    return;
  }
  if (newContact.name && newContact.email && newContact.phone) {
    try {
      await validateContactForm();
      await saveContact(newContact);
      await loadDataBase();
      await createContactList();
      CloseAddDialog();
      popupMessage("Contact successfully created!");
    } catch (error) {
      console.error("Error adding contact:", error);
      alert("Failed to add contact. Please try again.");
    }
  } else {
    contactErrorMsg("Please fill in all fields");
  }
}


async function getDataToMakeNewContact() {
  const nameInputField = document.getElementById("name_input");
  const emailInputField = document.getElementById("email_input");
  const phoneInputField = document.getElementById("phone_input");
  const initials = getInitials(nameInputField.value.trim());
  const contactColor = colors[Math.floor(Math.random() * colors.length)];

  if (!nameInputField || !emailInputField || !phoneInputField) {
    console.error("Input fields not found in DOM");
    alert("Error: Form fields not available");
    return;
  }
  const newContact = {
    name: nameInputField.value.trim(),
    email: emailInputField.value.trim(),
    phone: phoneInputField.value.trim(),
    initials: initials,
    color: contactColor,
    checked: false,
  };
  
  return newContact;
}


async function validateContactForm() {
  const isNameValid = await contactNameValidation();
  const isEmailValid = await contactEmailValidation();
  const isPhoneValid = contactPhoneValidation();
  return isNameValid && isEmailValid && isPhoneValid;
}

async function contactNameValidation() {
  const contactName = document.getElementById("name_input").value.trim().toLowerCase();
  const nameInput = document.getElementById("name_input");
  const ErrorMsgBox = document.getElementById("validationErrorMsg");

  if (!contactName) {
    contactErrorMsg("Name cannot be empty.");
    nameInput.value = "";
    nameInput.parentElement.style.borderColor = "rgb(170, 22, 22)";
    return false;
  }

  const isNameAvailable = await existingNameValidation();
  if (!isNameAvailable) {
    return false;
  }

  ErrorMsgBox.style.visibility = "hidden";
  nameInput.parentElement.style.borderColor = "#ccc";
  return true;
}

async function existingNameValidation() {
  const contactName = document
    .getElementById("name_input")
    .value.trim()
    .toLowerCase();
  const nameInput = document.getElementById("name_input");

  try {
    const existingUserNames = await fetchExistingContactName();
    if (
      existingUserNames.find(
        (existingName) => existingName.toLowerCase() === contactName,
      )
    ) {
      contactErrorMsg("Contact with this name already exists.");
      nameInput.value = "";
      nameInput.parentElement.style.borderColor = "rgb(170, 22, 22)";
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error validating name:", error);
    return true;
  }
}

async function fetchExistingContactName() {
  try {
    const response = await fetch(Firebase_URL + ".json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const existingNames = [];

    if (data && typeof data === "object") {
      for (const [id, contactData] of Object.entries(data)) {
        if (contactData.name) {
          existingNames.push(contactData.name);
        }
      }
      return existingNames;
    }
  } catch (error) {
    console.error(error);
    return [];
  }
}

async function contactEmailValidation() {
  const contactEmail = document.getElementById("email_input").value.trim().toLowerCase();
  const contactEmailInput = document.getElementById("email_input");
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const ErrorMsgBox = document.getElementById("validationErrorMsg");

  if (!contactEmail) {
    contactErrorMsg("Email cannot be empty.");
    contactEmailInput.value = "";
    contactEmailInput.parentElement.style.borderColor = "rgb(170, 22, 22)";
    return false;
  }

  if (!emailRegex.test(contactEmail)) {
    contactErrorMsg("Please enter a valid email address.");
    contactEmailInput.value = "";
    contactEmailInput.parentElement.style.borderColor = "rgb(170, 22, 22)";
    return false;
  }
  const isEmailAvailable = await existingEmailValidation();
  if (!isEmailAvailable) {
    return false;
  }

  contactEmailInput.parentElement.style.borderColor = "#ccc";
  ErrorMsgBox.style.visibility = "hidden";
  return true;
}

async function existingEmailValidation() {
  const contactEmail = document.getElementById("email_input").value.trim().toLowerCase();
  const emailInput = document.getElementById("email_input");

  try {
    const existingContactEmails = await fetchExistingContactEmail();
    if (
      existingContactEmails.find(
        (existingEmail) => existingEmail.toLowerCase() === contactEmail,
      )
    ) {
      contactErrorMsg("This email already exists.");
      emailInput.value = "";
      emailInput.parentElement.style.borderColor = "rgb(170, 22, 22)";
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error validating email:", error);
    // Bei Fehler: Allow registration (fail-safe)
    return true;
  }
}

async function fetchExistingContactEmail() {
  try {
    const response = await fetch(Firebase_URL + ".json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const existingEmails = [];

    if (data && typeof data === "object") {
      for (const [id, contactData] of Object.entries(data)) {
        if (contactData.email) {
          existingEmails.push(contactData.email);
        }
      }
      return existingEmails;
    }
  } catch (error) {
    console.error(error);
    return [];
  }
}

function contactPhoneValidation() {
  const contactPhone = document.getElementById("phone_input").value.trim();
  const phoneInput = document.getElementById("phone_input");
  const ErrorMsgBox = document.getElementById("validationErrorMsg");
  const phoneRegex = /^\+?[0-9\s\-()]{7,}$/;

  if (!contactPhone) {
    contactErrorMsg("Phone number cannot be empty.");
    phoneInput.value = "";
    phoneInput.parentElement.style.borderColor = "rgb(170, 22, 22)";
    return false;
  }

  if (!phoneRegex.test(contactPhone)) {
    contactErrorMsg("Invalid phone number format.");
    phoneInput.value = "";
    phoneInput.parentElement.style.borderColor = "rgb(170, 22, 22)";
    return false;
  }

  ErrorMsgBox.style.visibility = "hidden";
  phoneInput.parentElement.style.borderColor = "#ccc";
  return true;
}

async function saveEditedContact() {
  const editedData = getEditedContactData();
  if (!editedData) return;
  const contactId = findContactIdFromDisplayed();
  if (!contactId) {
    alert("Contact not found");
    return;
  }
  const updatedContact = {
    name: editedData.editedName,
    email: editedData.editedEmail,
    phone: editedData.editedPhone,
    initials: getInitials(editedData.editedName)

  };
  try {
    await updateContactInFirebase(contactId, updatedContact);
    await loadDataBase();
    await createContactList();
    CloseEditDialog();
    popupMessage("Contact successfully saved!");
    contactDetailDiv.innerHTML = ""
  } catch (error) {
    console.error("Error saving edited contact:", error);
    alert("Failed to save contact. Please try again.");
  }
}
