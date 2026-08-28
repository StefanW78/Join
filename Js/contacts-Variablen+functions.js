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
const createMessage = document.getElementById(`createMessage`)


/**
 * Sets the initial contact view based on the current viewport width.
 * On mobile devices, only the contact list is displayed.
 * On desktop devices, both the contact list and contact details are displayed.
 *
 * @returns {void}
 */
function setInitialView() {
  if (window.innerWidth <= 1023) {
    // Mobile
    contactListSec.classList.remove("d_none");
    contactInfoSec.classList.add("d_none");
  } else {
    // Desktop
    contactListSec.classList.remove("d_none");
    contactInfoSec.classList.remove("d_none");
  }
}

/**
 * Opens the contact details section on mobile devices.
 * Hides the contact list and displays the contact information section
 * when the viewport width is 1023px or less.
 *
 * @returns {void}
 */
function openContactDetails() {
  if (window.innerWidth <= 1023) {
    contactListSec.classList.add("d_none");
    contactInfoSec.classList.remove("d_none");
  }
}

/**
 * Switches back to the contact list view on mobile devices.
 * Hides the contact details section and displays the contact list.
 * Also removes the active state from all contacts on mobile devices.
 *
 * @returns {void}
 */
function MobileSwitchToContacts() {
    contactInfoSec.classList.add("d_none");
    contactListSec.classList.remove("d_none");

    if (window.innerWidth <= 1023) {
        document.querySelectorAll(".contact-container")
            .forEach(contact => {
                contact.classList.remove("active-contact");
            });
    }
}

/**
 * Displays a temporary popup message with a slide-in and slide-out animation.
 *
 * @param {string} message - The message to display.
 * @returns {void}
 */
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

/**
 * Displays a validation error message for adding or editing a contact.
 *
 * @param {string} message - The validation error message to display.
 * @param {string} [mode="add"] - Determines whether the error belongs to the add or edit form.
 * @returns {void}
 */
function contactErrorMsg(message, mode = "add") {
  const errorId = mode === "edit"
    ? "editValidationErrorMsg"
    : "validationErrorMsg";
  const errorMsgBox = document.getElementById(errorId);
  if (!errorMsgBox) return;
  errorMsgBox.hidden = false;
  errorMsgBox.textContent = message;
}

//main ContactsJS
