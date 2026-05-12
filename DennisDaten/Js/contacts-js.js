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
let editContactOverlay = document.getElementById(`edit-contact-overlay`)
let editTool = document.getElementById(`edit`)
let DeleteTool = document.getElementById(`delete`)
let contactDetailsDiv = document.getElementById(`contact-details`)
let spanEmail = document.getElementById(`span-email`)
let spanPhone = document.getElementById(`span-phone`)
let contactDetailDiv = document.getElementById(`contacts-infos`)
const mediaQuery2 = window.matchMedia("(max-width: 1092px)");
const mediaQueryForD_none = window.matchMedia("(max-width: 864px)")
const editToolmobileButton = document.getElementById(`contact-edit-tools`)
const createMessage = document.getElementById(`createMessage`)

const colors = ["rgba(255, 122, 0, 1)", 
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


let Firebase_URL = "Your Firebase Code";

// mediaQueryForD_none.addEventListener("change", handleResponsiveChange);
mediaQueryForD_none.addEventListener("change", setInitialView);

async function init() {
  setInitialView()
  await loadDataBase()
  createContactList()
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
    
    //await pushContactsToAPI();
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
    const response = await fetch(`${Firebase_URL}/${contactId}.json`, {
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
      contactDetailDiv.innerHTML = ""
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

