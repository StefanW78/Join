//for Overlay
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

/**

Opens the add contact dialog and initializes the contact form.
Adds the slide-in animation after a short delay.
@returns {void}
*/
function OpenAddDialog() {
  initializeContactForm("add", true);
  contactPopUpAdd.classList.remove("d_none");

  setTimeout(() =>{
  addContactOverlay.classList.remove(`slide-out`)
  addContactOverlay.classList.add(`slide-in`)
  }, 200)
 
}

/**

Closes the add contact dialog with a slide-out animation.

Hides the dialog and resets the contact form after the animation.

@returns {void}
*/
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

/**

Closes the add contact dialog.
@returns {void}
*/
function CloseAddContactDialog() {
  CloseAddDialog();
}

/**

Opens the edit contact dialog with a slide-in animation.
Makes the edit popup visible before starting the animation.
@returns {void}
*/
function OpenEditDialog() {
  editContactPopup.classList.remove("d_none");
  let editContactOverlayD = document.getElementById(`edit-contact-overlay`)

  setTimeout(() =>{
  editContactOverlayD.classList.remove(`slide-out`)
  editContactOverlayD.classList.add(`slide-in`)
  }, 200)
 
}

/**

Closes the edit contact dialog with a slide-out animation.
Hides the popup after the animation is completed.
@returns {void}
*/
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

/**

Returns a random color from the available colors.
@returns {string} A randomly selected color.
*/
function randomColor() {

    return colors[Math.floor(Math.random() * colors.length)];

}

//for Overlay

//main ConctactsJs

let contactListDiv = document.getElementById(`contact-list`)
let contactInfoSec = document.getElementById(`contacts-info-sec`)
let contactListSec = document.getElementById(`contacts-list-sec`)
let contactSymbol = document.getElementById(`contact-symbol`)
let editTool = document.getElementById(`edit`)
let contactDetailDiv = document.getElementById(`contacts-infos`)
const mediaQueryForD_none = window.matchMedia("(max-width: 1023px)")
const createMessage = document.getElementById(`createMessage`)


//main ContactsJS
