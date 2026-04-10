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
let editTool = document.getElementById(`edit`)
let DeleteTool = document.getElementById(`delete`)
let contactDetailsDiv = document.getElementById(`contact-details`)
let spanEmail = document.getElementById(`span-email`)
let spanPhone = document.getElementById(`span-phone`)
let contactPopUpAdd = document.getElementById(`contact-pop-add`)
const mediaQuery2 = window.matchMedia("(max-width: 1092px)");
const mediaQueryForD_none = window.matchMedia("(max-width: 864px)")
const editToolmobileButton = document.getElementById(`contact-edit-tools`)
const editDialogBox = document.getElementById(`edit-menu-dialog`)
const createMessage = document.getElementById(`createMessage`)

let Firebase_URL = "./contacts.json"

mediaQueryForD_none.addEventListener("change", handleResponsiveChange);




async function loadingContacs() {
    
    try{
        const response = await fetch(Firebase_URL)

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const ResponseToJson = await response.json();

        let fetchdData = {};
        
        if (ResponseToJson && typeof ResponseToJson === "object") {
      for (const [id, todoData] of Object.entries(ResponseToJson)) {
        fetchdData[id] = { id, ...todoData };
      }
    }

        console.log("fetchData:", fetchdData);
        return fetchdData;
    }catch (error) {
    console.error("Error loading todos:", error);
    return {};
  }


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
 
function MobileSwitchToContacts() {
  contactInfoSec.classList.toggle("d_none");
  contactListSec.classList.toggle("d_none");


}

function handleResponsiveChange(e) {
  if (!e.matches) {
    // Desktop → beide sichtbar (oder dein Standardzustand)
    contactInfoSec.classList.remove("d_none");
    contactListSec.classList.remove("d_none");
  } else {
    // Mobile → Standardzustand festlegen
    contactInfoSec.classList.add("d_none"); // z.B. erstmal verstecken
    contactListSec.classList.remove("d_none");
  }
}

// Für später vllt das der code Kontrolierter ist 
function showContacts() {
  contactInfoSec.classList.add("d_none");
  contactListSec.classList.remove("d_none");
}

function showDetails() {
  contactInfoSec.classList.remove("d_none");
  contactListSec.classList.add("d_none");
}
// Für später vllt das der code Kontrolierter ist 


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