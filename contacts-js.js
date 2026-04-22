// all Global Variablen

let addContactButton = document.getElementById(`add-contact`)
let contactListDiv = document.getElementById(`contact-list`)
let contactBadge = document.getElementById(`contact-badge`)
let contactInfoSec = document.getElementById(`contacts-info-sec`)
let contactListSec = document.getElementById(`contacts-list-sec`)
let contactHeader = document.getElementById(`contact-header`)
let contactSymbol = document.getElementById(`contact-symbol`)
let contactTextDiv = document.getElementById(`contact-text`)
let contactNameDiv = document.getElementById(`contact-name`)
let addContactOverlay = document.getElementById(`add-contact-overlay`)
let editContactOverlay = document.getElementById(`edit-contact-overlay`)
let editContactPopup = document.getElementById(`edit-contact-popup`)
let editTool = document.getElementById(`edit`)
let DeleteTool = document.getElementById(`delete`)
let contactDetailsDiv = document.getElementById(`contact-details`)
let spanEmail = document.getElementById(`span-email`)
let spanPhone = document.getElementById(`span-phone`)
let contactPopUpAdd = document.getElementById(`contact-pop-add`)
let contactDetailDiv = document.getElementById(`contacts-infos`)
const mediaQuery2 = window.matchMedia("(max-width: 1092px)");
const mediaQueryForD_none = window.matchMedia("(max-width: 864px)")
const editToolmobileButton = document.getElementById(`contact-edit-tools`)
const createMessage = document.getElementById(`createMessage`)

const color = ["rgba(255, 122, 0, 1)", 
  "rgba(255, 94, 179, 1)", 
  "rgba(110, 82, 255, 1)", 
  "rgba(147, 39, 255, 1)", 
  "rgba(0, 190, 232, 1)", 
  "rgba(31, 215, 193, 1)", 
  "rgba(255, 116, 94, 1)", 
  "rgba(255, 163, 94, 1)", 
  "rgba(252, 113, 255, 1)", 
  "rgba(255, 199, 1, 1)", 
  "rgba(0, 56, 255, 1)", 
  "rgba(195, 255, 43, 1)", 
  "rgba(255, 230, 43, 1)", 
  "rgba(255, 70, 70, 1)", 
  "rgba(255, 187, 43, 1)"];

  //hier Firebase URL eingeben
let Firebase_URL = ""

// mediaQueryForD_none.addEventListener("change", handleResponsiveChange);
mediaQueryForD_none.addEventListener("change", setInitialView);

async function init() {
  setInitialView()
  await loadDataBase()
  createContactList()
}



async function loadDataBase() {
  try {
    const response = await fetch(Firebase_URL + ".json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const responseToJson = await response.json();

    // Firebase returns object with IDs as keys: { "-NxAbc": {name, email, phone}, ... }
    // Convert to object where each contact has its id: { "-NxAbc": {id: "-NxAbc", name, email, phone}, ... }
    if (responseToJson && typeof responseToJson === "object") {
      fetchedData = {};
      for (const [id, contactData] of Object.entries(responseToJson)) {
        fetchedData[id] = { id, ...contactData };
      }
    } else {
      fetchedData = {};
    }
    return fetchedData;
  } catch (error) {
    console.error("Error loading database:", error);
    fetchedData = {};
    return {};
  }
}

async function createContactList() {
  const array = getContactArray();
  if (!array.length) {
    contactListDiv.innerHTML =
      NoContacts();
    return;
  }
  let last
  let html = "";
  let needsAUpdate = false;

  array.forEach((contact) => {
    if (!contact.initials) {
      contact.initials = getInitials(contact.name);
      needsAUpdate = true;
    }
    const first = contact.name ? contact.name.charAt(0).toUpperCase() : "#";
    const show = first !== last;
    if (show) last = first;
    html += CreateContactItemHTML(contact, contact.color, show);
  });

  contactListDiv.innerHTML = html;
  if (needsAUpdate) {
    console.log("Geupdatet");
    
    // await pushContactsToAPI();
  }
}


function getContactArray() {
  if (!fetchedData || !Object.keys(fetchedData).length) {
    return [];
  }
  const source = [];
  Object.entries(fetchedData).forEach(([id, data]) => {
    if (data.name && data.email) {
      source.push({ id, ...data });
    }
  });
  const sortedContacts = [...source].sort((a, b) => {
    const nameA = (a.name || "").toLowerCase();
    const nameB = (b.name || "").toLowerCase();
    return nameA.localeCompare(nameB);
  });
  return sortedContacts;
}

function CreateContactItemHTML(contact, color, showAlphabet) {
  const contactColor = contact.color;
  const initials = contact.initials;
  const firstLetter = contact.name ? contact.name.charAt(0).toUpperCase() : "#";
  const alphabetHeader = showAlphabet
    ? `<h3 class="contact-alphabet">${firstLetter}</h3><div class="contact-seperator"></div>`
    : "";
  return contactListTemplate(
    contact.name,
    contact.email,
    contactColor,
    initials,
    alphabetHeader,
  );
}

function renderContactDetails(event) {
  const contactData = getContactDataFromDOM(event)
  if (!contactData) return;
  const foundContact = findContact(
    contactData.contactName,
    contactData.contactEmail,
  );
  if (foundContact) {
    renderFloatingCard(foundContact, contactData.contactColor);
  } else {
    console.error(
      "Contact not found:",
      contactData.contactName,
      contactData.contactEmail,
    );
    // container.innerHTML = "<h2>Contact not found</h2>";
    // container.classList.remove("d-none");
    // // Force reflow to ensure animation triggers
    // container.offsetHeight;
    // container.classList.remove("slide-out");
    // container.classList.add("slide-in");
  }

}

function getContactDataFromDOM(event) {
  const clicked = event.target.closest(".contact-container");
  if (!clicked) {
    console.warn("No contact-container found");
    return null;
  }
  const badge = clicked.querySelector(".contact-badge");
  const contactColor = badge ? badge.style.backgroundColor : null;
  const nameElement = clicked.querySelector(".contactName");
  const emailElement = clicked.querySelector(".contactEmail");
  const contactName = nameElement ? nameElement.textContent.trim() : "";
  const contactEmail = emailElement ? emailElement.textContent.trim() : "";
  if (!contactName || !contactEmail) {
    console.error("Contact data missing");
    return null;
  }
  return { contactName, contactEmail, contactColor };
}

function findContact(contactName, contactEmail) {
  if (!fetchedData || typeof fetchedData !== "object") return null;
  for (const [id, data] of Object.entries(fetchedData)) {
    if (data.name === contactName && data.email === contactEmail) {
      return data;
    }
  }
  return null;
}

function renderFloatingCard(foundContact) {
  contactDetailDiv.innerHTML = contactDetailsTemplate(
    foundContact.name,
    foundContact.email,
    foundContact.phone,
    foundContact.color,
    foundContact.initials,
  );
    openContactDetails();

    checkQueriesForEditTools()
}

function renderEditOverlay() {
  const contactData = getDataForEditOverlay();
  const { foundContact, foundID, contactColor } = contactData;

  if (foundContact) {
    foundContact.id = foundID
    const initials = getInitials(foundContact.name);
    editContactPopup.innerHTML = renderEditTemplate(
      foundContact.name, 
      foundContact.email, 
      foundContact.phone, 
      contactColor, 
      initials)

  }

  OpenEditDialog();
}

function popupMessage(message) {
  createMessage.textContent = `${message}`;
  createMessage.classList.remove("d_none");
  createMessage.offsetHeight;
  createMessage.classList.add("slide-in");
  setTimeout(() => {
    createMessage.classList.remove("slide-in");
    createMessage.classList.add("slide-out");
    setTimeout(() => {
      createMessage.classList.add("d_none");
      createMessage.classList.remove("slide-out");
    }, 510);
  }, 2100);
}

function contactErrorMsg(message) {
  const ErrorMsgBox = document.getElementById("validationErrorMsg");
  ErrorMsgBox.style.visibility = "visible";
  ErrorMsgBox.textContent = message;
}

function getDataForEditOverlay() {
  let foundContact,
    foundID,
    contactColor = null;
  const contactSymbol = document.getElementById("contact-symbol");
  if (contactSymbol) {
    contactColor = contactSymbol.style.backgroundColor;
  }
  for (const [id, data] of Object.entries(fetchedData)) {
    if (
      data.name ===
        document.getElementById("contact-name").textContent.trim() &&
      data.email === document.getElementById("span-email").textContent.trim() &&
      data.phone === document.getElementById("span-phone").textContent.trim()
    ) {
      foundContact = data;
      foundID = id;
      break;
    }
  }
  return { foundContact, foundID, contactColor };
}

function getInitials(fullName) {
  if (!fullName || typeof fullName !== "string") {
    return "?";
  }
  const nameParts = fullName.trim().split(" ");
  const firstInitial = nameParts[0]
    ? nameParts[0].charAt(0).toUpperCase() || ""
    : "";
  const lastInitial = nameParts[nameParts.length - 1]
    ? nameParts[nameParts.length - 1].charAt(0).toUpperCase() || ""
    : "";
  return firstInitial + lastInitial;
}

async function deleteContactFromEditOverlay(event) {
  const contactData = foundContactUndIdEditOverlay();
  if (!contactData) return;
  const { foundContact, foundId, contactName, contactEmail } = contactData;
  if (!foundContact) {
    console.error(
      "Contact not found for deletion - Name:",
      contactName,
      "Email:",
      contactEmail,
    );
    alert("Error: Contact could not be found");
    return;
  }
  try {
    await deleteContact(foundId);
    await loadDataBase();
    await createContactList();
    closeEditContactOverlay();
    container.classList.add("d-none");
    popupMessage("Contact successfully deleted!");
  } catch (error) {
    console.error("Error deleting contact:", error);
    alert("Failed to delete contact. Please try again.");
  }
}

function foundContactUndIdEditOverlay() {
  const contactData = findDataFromEditOverlayToDelete();
  if (!contactData) return null;
  const { contactName, contactEmail } = contactData;
  for (const [id, data] of Object.entries(fetchedData)) {
    if (data.name === contactName && data.email === contactEmail) {
      return { foundContact: data, foundId: id, contactName, contactEmail };
    }
  }
  console.error("No match found in fetchedData");
  return null;
}

function findDataFromEditOverlayToDelete() {
  const nameInputEdit = document.getElementById("nameInput");
  const emailInputEdit = document.getElementById("emailInput");
  if (!nameInputEdit || !emailInputEdit) {
    console.error("Input fields not found");
    alert("Error: Input fields not found");
    return null;
  }
  const contactName = nameInputEdit.value.trim();
  const contactEmail = emailInputEdit.value.trim();
  if (!contactName || !contactEmail) {
    console.error("Contact name or email is missing");
    alert("Error: Contact information is missing");
    return null;
  }
  return { contactName, contactEmail };
}

async function deleteContact(contactId) {
  try {
    const response = await fetch(`${storageUrl}/${contactId}.json`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error deleting contact:", error);
    throw error;
  }
}

async function deleteFloatingData(event) {
  // Close edit menu dialog if open
  if (typeof closeEditMenuDialog === "function") {
    closeEditMenuDialog();
  }

  const contactData = saveDataAsFoundContact();
  if (!contactData) return;
  const { foundContact, foundId, contactName, contactEmail } = contactData;
  if (foundContact) {
    try {
      await deleteContact(foundId);
      await loadDataBase();
      await createContactList();
      container.classList.add("d-none");
      popupMessage("Contact successfully deleted!");
    } catch (error) {
      console.error("Error deleting contact:", error);
      alert("Error: Failed to delete contact");
    }
  } else {
    console.error(
      "Contact not found for deletion - Name:",
      contactName,
      "Email:",
      contactEmail,
    );
    alert("Error: Contact could not be found");
  }
}

function saveDataAsFoundContact() {
  const contactData = getDataFromClickedContactFloating();
  if (!contactData) return null;
  const { contactName, contactEmail } = contactData;
  for (const [id, data] of Object.entries(fetchedData)) {
    if (data.name === contactName && data.email === contactEmail) {
      return { foundContact: data, foundId: id, contactName, contactEmail };
    }
  }
  return null;
}

function getDataFromClickedContactFloating() {
  const nameElement = document.getElementById("contact-name");
  const emailElement = document.getElementById("span-email");
  if (!nameElement || !emailElement) {
    console.error("Contact name or email is missing");
    alert("Error: Contact information is missing");
    return null;
  }
  const contactName = nameElement.textContent.trim();
  const contactEmail = emailElement.textContent.trim();
  return { contactName, contactEmail };
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
  };
  try {
    await updateContactInFirebase(contactId, updatedContact);
    await loadDataBase();
    await createContactList();
    CloseEditDialog();
    popupMessage("Contact successfully saved!");
  } catch (error) {
    console.error("Error saving edited contact:", error);
    alert("Failed to save contact. Please try again.");
  }
}

function getEditedContactData() {
  const editedName = document.getElementById("nameInput").value.trim();
  const editedEmail = document.getElementById("emailInput").value.trim();
  const editedPhone = document.getElementById("phoneInput").value.trim();
  if (!editedName || !editedEmail || !editedPhone) {
    alert("Please fill in all fields");
    return null;
  }
  return { editedName, editedEmail, editedPhone };
}

function findContactIdFromDisplayed() {
  const contactName = document
    .getElementById("contact-name")
    .textContent.trim();
  const contactEmail = document.getElementById("span-email").textContent.trim();
  const contactPhone = document.getElementById("span-phone").textContent.trim();
  for (const [id, data] of Object.entries(fetchedData)) {
    if (
      data.name === contactName &&
      data.email === contactEmail &&
      data.phone === contactPhone
    ) {
      return id;
    }
  }
  return null;
}

async function updateContactInFirebase(contactId, updatedContact) {
  try {
    const response = await fetch(`${Firebase_URL}/${contactId}.json`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedContact),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error updating contact:", error);
    throw error;
  }
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

async function saveContact(contact) {
  try {
    const response = await fetch(Firebase_URL + ".json", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(contact),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error saving contact:", error);
    throw error;
  }
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
// mediaQuery2.addEventListener("change", (e) => {
//   if (e.matches) {
//     // Mobile
//     editDialogBox.classList.add("d_none");
//   } else {
//     // Desktop
//     editDialogBox.classList.add("d_none");
//   }
// });

// Für Spätere Tests 

// document.addEventListener("click", (event) => {
//   if (event.target.matches(".edit-button")) {
//     OpenMobileDialogForDetails();
//   }
// });

document.addEventListener("click", (event) => {
  const editDialogBox = document.getElementById("edit-menu-dialog");

  if (!editDialogBox) return; // Element noch nicht da → nix machen
   editDialogBox.classList.add("d_none");
});

function OpenMobileDialogForDetails() {
  const editDialogBox = document.getElementById("edit-menu-dialog");

  if (!editDialogBox) {
    console.error("Element #edit-menu-dialog nicht gefunden!");
    return;
  }

  editDialogBox.classList.toggle("d_none");
}

function checkQueriesForEditTools() {
  const editToolEls = document.getElementById("contact-edit-tools");
  if (!editToolEls) return;
  editToolEls.removeEventListener("click", handleEditToolClick);
  editToolEls.addEventListener("click", handleEditToolClick);

}

function handleEditToolClick(event) {
  event.stopPropagation();
  const editToolEls = document.getElementById("contact-edit-tools");
  if (!editToolEls) return;
  const checkquery = window.matchMedia("(max-width: 860px)");
  if (checkquery.matches) {
    OpenMobileDialogForDetails();
  }
}


// Zum testen 

function setInitialView() {
  if (window.innerWidth <= 864) {
    // Mobile
    contactListSec.classList.remove("d_none");
    contactInfoSec.classList.add("d_none");
  } else {
    // Desktop
    contactListSec.classList.remove("d_none");
    contactInfoSec.classList.remove("d_none");
  }
}

function openContactDetails() {
  if (window.innerWidth <= 864) {
    contactListSec.classList.add("d_none");
    contactInfoSec.classList.remove("d_none");
  }
}


function MobileSwitchToContacts() {
  contactInfoSec.classList.add("d_none");
  contactListSec.classList.remove("d_none");
}

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