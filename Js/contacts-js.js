// all Global Variablen

let contactListDiv = document.getElementById(`contact-list`)
let contactInfoSec = document.getElementById(`contacts-info-sec`)
let contactListSec = document.getElementById(`contacts-list-sec`)
let contactSymbol = document.getElementById(`contact-symbol`)
let editTool = document.getElementById(`edit`)
let contactDetailDiv = document.getElementById(`contacts-infos`)
const mediaQueryForD_none = window.matchMedia("(max-width: 1092px)")
const createMessage = document.getElementById(`createMessage`)

let fetchedData;
let currentContactId = null;

mediaQueryForD_none.addEventListener("change", setInitialView);

async function init() {
  setInitialView()
  fetchedData = await loadDataBase("contacts");
  renderContactList();
}

async function renderContactList() {

        const contacts = getContactArray();

    let html = "";
    let lastLetter = "";

    contacts.forEach(contact => {

        const firstLetter = contact.name.charAt(0).toUpperCase();
        const showHeader = firstLetter !== lastLetter;

        if (showHeader) lastLetter = firstLetter;

        html += `
            <div class="contact-list-items">

                ${showHeader ? contactHeaderTemplate(firstLetter) : ""}

                ${contactListTemplate(contact)}

            </div>
        `;
    });

    contactListDiv.innerHTML = html;
}

function getContactArray() {

    return Object.values(fetchedData)
        .filter(c => c.name && c.email)
        .sort((a, b) => a.name.localeCompare(b.name));

}


function openContact(event) {

    const clickedContact = event.target.closest(".contact-container");

    if (!clickedContact) return;

    // alten aktiven Kontakt entfernen
    document.querySelectorAll(".contact-container")
        .forEach(contact => {
            contact.classList.remove("active-contact");
        });

    // neuen Kontakt markieren
    clickedContact.classList.add("active-contact");


    const id = clickedContact.dataset.id;

    currentContactId = id;

    const contact = fetchedData[id];

    renderContactDetails(contact);
}

function renderContactDetails(contact) {

    contactDetailDiv.innerHTML = contactDetailsTemplate(contact);
    openContactDetails();
    checkQueriesForEditTools();

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
    foundContact.name,foundContact.email,foundContact.phone,foundContact.color,foundContact.initials,);
    openContactDetails();

    checkQueriesForEditTools()
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
    await deleteContactAction(foundId);
    await loadDataBase();
    renderContactList();
    CloseEditDialog();
    MobileSwitchToContacts();
    popupMessage("Contact successfully deleted!");
  } catch (error) {
    console.error("Error deleting contact:", error);
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

//neue Version um zu löschen von contacte. danach später weiter schauen wegen der anderen Lösch contact durch mobile Ver.
async function deleteContactAction(contactId) {

    const contact = getDeleteTarget(contactId);

    if (!contact) return;



    try {

        await deleteContactFromFirebase(contactId);

        renderContactList();
        if (currentContactId === contactId) {
            contactDetailDiv.innerHTML = "";
        }
        popupMessage("Contact deleted!");
    } catch (error) {
        console.error("Delete failed:", error);
    }
}

function getDeleteTarget(contactId) {

    if (!contactId) {
        console.error("No contactId provided");
        return null;
    }

    const contact = fetchedData[contactId];

    if (!contact) {
        console.error("Contact not found in local data");
        return null;
    }

    return contact;

}

async function deleteContactFromFirebase(contactId) {

    await deleteData("contacts", contactId);

    delete fetchedData[contactId];

}

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
  const checkquery = window.matchMedia("(max-width: 1092px)");
  if (checkquery.matches) {
    OpenMobileDialogForDetails();
  }
}

function setInitialView() {
  if (window.innerWidth <= 1092) {
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
  if (window.innerWidth <= 1092) {
    contactListSec.classList.add("d_none");
    contactInfoSec.classList.remove("d_none");
  }
}

function MobileSwitchToContacts() {
  contactInfoSec.classList.add("d_none");
  contactListSec.classList.remove("d_none");
}

