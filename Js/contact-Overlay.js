
let contactPopUpAdd = document.getElementById(`contact-pop-add`)
let addContactOverlay = document.getElementById(`add-contact-overlay`)
let editContactPopup = document.getElementById(`edit-contact-popup`)

const formState = {
    contact: {
        name: false,
        email: false,
        phone: false
    }
};

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

function CloseAddContactDialog() {
  setTimeout(() =>{
  addContactOverlay.classList.remove(`slide-in`)
  addContactOverlay.classList.add(`slide-out`)
  setTimeout(() => {
    contactPopUpAdd.classList.add("d_none");
    resetForm("contact", "createContactBtn", ["name", "email", "phone"]);
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

    const data = getContactFormData();

    if (!validateContactForm(data)) return;

    if (!checkDuplicateContact(data)) return;

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

function validateContactForm(data) {

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[0-9\s\-()]{7,}$/;

    if (!data.name) {
        contactErrorMsg("Name is required");
        return false;
    }

    if (!data.email) {
        contactErrorMsg("Email is required");
        return false;
    }

    if (!emailRegex.test(data.email)) {
        contactErrorMsg("Invalid email format");
        return false;
    }

    if (!data.phone) {
        contactErrorMsg("Phone is required");
        return false;
    }

    if (!phoneRegex.test(data.phone)) {
        contactErrorMsg("Invalid phone format");
        return false;
    }

    return true;

}

function checkDuplicateContact(data) {

    const contacts = Object.values(fetchedData);

    const nameExists = contacts.some(contact =>
        contact.name?.toLowerCase() === data.name.toLowerCase()
    );

    const emailExists = contacts.some(contact =>
        contact.email?.toLowerCase() === data.email.toLowerCase()
    );

    if (nameExists) {
        contactErrorMsg("Name already exists");
        return false;
    }

    if (emailExists) {
        contactErrorMsg("Email already exists");
        return false;
    }

    return true;

}

//Neue Version vom saveEditContact
async function saveEditedContact() {
    const id = currentContactId;

    if (!id) return;

    const updatedData = {
        name: document.getElementById("nameInput").value.trim(),
        email: document.getElementById("emailInput").value.trim(),
        phone: document.getElementById("phoneInput").value.trim(),
    };

    if (!updatedData.name || !updatedData.email || !updatedData.phone) {
        contactErrorMsg("Please fill all fields");
        return;
    }

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
    }
}

function openEdit(contactId) {

    const contact = fetchedData[contactId];

    if (!contact) return;

    currentContactId = contactId;

    editContactPopup.innerHTML =
        renderEditTemplate(contact);
        OpenEditDialog();

}





