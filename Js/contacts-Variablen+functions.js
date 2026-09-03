
/**
 * References the HTML elements used to display contact data.
 */

//Contact Overlay
/**
 * References the DOM element with the ID `contact-pop-add`.
 */
let contactPopUpAdd = document.getElementById("contact-pop-add");
/**
 * References the DOM element with the ID `add-contact-overlay`.
 */
let addContactOverlay = document.getElementById("add-contact-overlay");
/**
 * References the DOM element with the ID `edit-contact-popup`.
 */
let editContactPopup = document.getElementById("edit-contact-popup");

/**
 * Defines the input and error elements for each contact form mode.
 */
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

/**
 * Stores validation state for the contact forms.
 */
const contactFormState = {
  add: { name: false, email: false, phone: false },
  edit: { name: false, email: false, phone: false },
};

/**
 * Tracks which fields in each contact form have been touched.
 */
const contactFieldTouched = {
  add: { name: false, email: false, phone: false },
  edit: { name: false, email: false, phone: false },
};

/**
 * Stores the color palette used for contact avatars.
 */
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
  "rgba(255, 187, 43, 1)"
];

/**
 * Opens the dialog for adding a new contact and starts the slide-in animation.
 *
 * @function OpenAddDialog
 * @returns {void}
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
 * Closes the add contact dialog and starts the slide-out animation.
 * Resets the contact form after the animation is finished.
 *
 * @function CloseAddDialog
 * @returns {void}
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
 * Closes the add contact dialog.
 *
 * @function CloseAddContactDialog
 * @returns {void}
 */
function CloseAddContactDialog() {
  CloseAddDialog();
}

/**
 * Opens the edit contact dialog and starts the slide-in animation.
 *
 * @function OpenEditDialog
 * @returns {void}
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
 * Closes the edit contact dialog and starts the slide-out animation.
 *
 * @function CloseEditDialog
 * @returns {void}
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
 * Returns a random color from the colors array.
 *
 * @function randomColor
 * @returns {string} A randomly selected color.
 */
function randomColor() {
    return colors[Math.floor(Math.random() * colors.length)];
}

//for Overlay

//main ConctactsJs

/**
 * References the DOM element with the ID `contact-list`.
 */
let contactListDiv = document.getElementById(`contact-list`)
/**
 * References the DOM element with the ID `contacts-info-sec`.
 */
let contactInfoSec = document.getElementById(`contacts-info-sec`)
/**
 * References the DOM element with the ID `contacts-list-sec`.
 */
let contactListSec = document.getElementById(`contacts-list-sec`)
/**
 * References the DOM element with the ID `contact-symbol`.
 */
let contactSymbol = document.getElementById(`contact-symbol`)
/**
 * References the DOM element with the ID `edit`.
 */
let editTool = document.getElementById(`edit`)
/**
 * References the DOM element with the ID `contacts-infos`.
 */
let contactDetailDiv = document.getElementById(`contacts-infos`)
/**
 * References the DOM element with the ID `createMessage`.
 */
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
