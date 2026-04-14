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
let contactToolsDiv = document.getElementById(`contact-edit-tools`)
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
const editDialogBox = document.getElementById(`edit-menu-dialog`)
const createMessage = document.getElementById(`createMessage`)


let Firebase_URL = "./contacts-test.json"

// mediaQueryForD_none.addEventListener("change", handleResponsiveChange);
mediaQueryForD_none.addEventListener("change", setInitialView);

async function init() {
  setInitialView()
  await loadDataBase()
  createContactList()
}



async function loadDataBase() {
  try {
    // const response = await fetch(Firebase_URL + ".json");
    const response = await fetch(Firebase_URL);
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
    openContactDetails()
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



mediaQuery2.addEventListener("change", (e) => {
  if (e.matches) {
    // Mobile
    editDialogBox.classList.add("d_none");
  } else {
    // Desktop
    editDialogBox.classList.add("d_none");
  }
});


editToolmobileButton.addEventListener("click", (e) => {
  editDialogBox.classList.toggle("d_none");
  e.stopPropagation(); // verhindert, dass der Klick weiter hoch bubbelt
});

document.addEventListener("click", () => {
  editDialogBox.classList.add("d_none");
});

function OpenMobileDialogForDetails() {
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
  const checkquery = window.matchMedia("(max-width: 991px)");
  if (checkquery.matches) {
    openEditMenuDialog();
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

  setTimeout(() =>{
  editContactOverlay.classList.remove(`slide-out`)
  editContactOverlay.classList.add(`slide-in`)
  }, 200)
 
}


function CloseEditDialog() {
  setTimeout(() =>{
  editContactOverlay.classList.remove(`slide-in`)
  editContactOverlay.classList.add(`slide-out`)
  setTimeout(() => {
    editContactPopup.classList.add("d_none");
  }, 460)
  }, 200)
 
}