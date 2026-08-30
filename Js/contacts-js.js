/**
 * Stores the media query and the contact data used on the contact page.
 */
const mediaQueryForD_none = window.matchMedia("(max-width: 1023px)")
let fetchedData;
let currentContactId = null;

/**
 * Updates the initial view when the media query changes.
 */
mediaQueryForD_none.addEventListener("change", setInitialView);

/**
 * Initializes the contact page by loading the contacts
 * and rendering the contact list.
 *
 * @async
 * @function init
 * @returns {Promise<void>} A promise that resolves after the contacts are loaded.
 */
async function init() {
  setInitialView()
  fetchedData = await loadDataBase("contacts");
  renderContactList();
}

/**
 * Renders the contact list by generating the corresponding HTML
 * and inserting it into the contact list container.
 *
 * @async
 * @returns {Promise<void>} A promise that resolves when the contact list has been rendered.
 */
async function renderContactList() {
    const contacts = getContactArray();
    const html = createContactListHTML(contacts);

    contactListDiv.innerHTML = html;
}

/**
 * Creates the HTML markup for the contact list.
 * Contacts are grouped alphabetically by the first letter of their names.
 *
 * @param {Object[]} contacts - The list of contacts to render.
 * @returns {string} The generated HTML markup for the contact list.
 */
function createContactListHTML(contacts) {
    let html = "";
    let lastLetter = "";

    contacts.forEach(contact => {
        const firstLetter = contact.name.charAt(0).toUpperCase();
        const showHeader = firstLetter !== lastLetter;

        if (showHeader) lastLetter = firstLetter;
        html += createContactListItem(contact, firstLetter, showHeader);
    });

    return html;
}

/**
 * Creates the HTML markup for a single contact list item.
 * Optionally adds a letter header before the contact.
 *
 * @param {Object} contact - The contact to render.
 * @param {string} firstLetter - The first letter of the contact's name.
 * @param {boolean} showHeader - Whether to display the letter header.
 * @returns {string} The generated HTML markup for the contact list item.
 */
function createContactListItem(contact, firstLetter, showHeader) {
    return `
        <div class="contact-list-items">
            ${showHeader ? contactHeaderTemplate(firstLetter) : ""}
            ${contactListTemplate(contact)}
        </div>
    `;
}

/**
 * Retrieves, filters, and sorts the contacts from the fetched data.
 * Only contacts with a name and email address are included.
 *
 * @returns {Object[]} An array of valid contacts sorted alphabetically by name.
 */
function getContactArray() {

    return Object.values(fetchedData)
        .filter(c => c.name && c.email)
        .sort((a, b) => a.name.localeCompare(b.name));

}

/**
 * Opens the selected contact and displays its details.
 * Removes the active state from all other contacts.
 *
 * @param {Event} event - The event triggered by clicking a contact.
 * @returns {void}
 */
function openContact(event) {
    const clickedContact = event.target.closest(".contact-container");

    if (!clickedContact) return;
    document.querySelectorAll(".contact-container")
        .forEach(contact => {
            contact.classList.remove("active-contact");
        });

    clickedContact.classList.add("active-contact");
    const id = clickedContact.dataset.id;
    currentContactId = id;
    const contact = fetchedData[id];

    renderContactDetails(contact);
}

/**
 * Renders the details of the selected contact.
 * Updates the contact detail container and initializes the required
 * contact detail actions and edit tools.
 *
 * @param {Object} contact - The contact whose details should be displayed.
 * @returns {void}
 */
function renderContactDetails(contact) {
    contactDetailDiv.innerHTML = contactDetailsTemplate(contact);
    openContactDetails();
    checkQueriesForEditTools();

}

/**
 * Finds a contact by matching its name and email address.
 *
 * @param {string} contactName - The name of the contact to find.
 * @param {string} contactEmail - The email address of the contact to find.
 * @returns {Object|null} The matching contact, or null if no contact is found.
 */
function findContact(contactName, contactEmail) {
  if (!fetchedData || typeof fetchedData !== "object") return null;
  for (const [id, data] of Object.entries(fetchedData)) {
    if (data.name === contactName && data.email === contactEmail) {
      return data;
    }
  }
  return null;
}

/**
 * Renders the details of a found contact inside the contact detail container.
 * Opens the contact details view and initializes the edit tools.
 *
 * @param {Object} foundContact - The contact whose details should be displayed.
 * @returns {void}
 */
function renderFloatingCard(foundContact) {
  contactDetailDiv.innerHTML = contactDetailsTemplate(
    foundContact.name,foundContact.email,foundContact.phone,foundContact.color,foundContact.initials,);
    openContactDetails();

    checkQueriesForEditTools()
}

/**
 * Generates initials from a full name.
 * Uses the first character of the first and last name.
 *
 * @param {string} fullName - The full name to generate initials from.
 * @returns {string} The generated initials, or "?" if the input is invalid.
 */
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

/**
 * Deletes the selected contact from the edit overlay.
 * Finds the contact, performs the deletion, and finalizes the deletion process.
 *
 * @async
 * @param {Event} event - The event triggered when deleting the contact.
 * @returns {Promise<void>} A promise that resolves when the contact deletion is completed.
 */
async function deleteContactFromEditOverlay(event) {
  const contactData = foundContactUndIdEditOverlay();
  if (!contactData) return;

  const { foundContact, foundId, contactName, contactEmail } = contactData;
  if (!foundContact) {
    handleContactDeleteError(contactName, contactEmail);
    return;
  }

  try {
    await deleteContactAction(foundId);
    await finishContactDeletion();
  } catch (error) {
    console.error("Error deleting contact:", error);
  }
}

/**
 * Handles the error that occurs when a contact cannot be found for deletion.
 * Logs the contact information and displays an error alert to the user.
 *
 * @param {string} contactName - The name of the contact that could not be found.
 * @param {string} contactEmail - The email address of the contact that could not be found.
 * @returns {void}
 */
function handleContactDeleteError(contactName, contactEmail) {
  console.error(
    "Contact not found for deletion - Name:",
    contactName,
    "Email:",
    contactEmail,
  );
  alert("Error: Contact could not be found");
}

/**
 * Completes the contact deletion process.
 * Reloads the contact data, updates the contact list, closes the edit dialog,
 * switches to the contacts view on mobile devices, and displays a success message.
 *
 * @async
 * @returns {Promise<void>} A promise that resolves when the deletion process is finished.
 */
async function finishContactDeletion() {
  await loadDataBase();
  renderContactList();
  CloseEditDialog();
  MobileSwitchToContacts();
  popupMessage("Contact successfully deleted!");
}

/**
 * Finds a contact and its ID based on the name and email
 * entered in the edit overlay.
 *
 * @returns {{foundContact: Object, foundId: string, contactName: string, contactEmail: string}|null}
 * The matching contact data and ID, or null if no match is found.
 */
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

/**
 * Retrieves and validates the contact name and email
 * from the edit overlay input fields.
 *
 * @returns {{contactName: string, contactEmail: string}|null}
 * An object containing the contact name and email, or null if the
 * input fields are missing or the contact information is incomplete.
 */
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

/**
 * Deletes a contact from the database and updates the contact list.
 * Clears the contact details if the deleted contact was currently selected
 * and displays a confirmation message.
 *
 * @async
 * @param {string} contactId - The ID of the contact to delete.
 * @returns {Promise<void>} A promise that resolves when the deletion process is completed.
 */
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

/**
 * Retrieves a contact from the local data using its ID.
 *
 * @param {string} contactId - The ID of the contact to retrieve.
 * @returns {Object|null} The matching contact, or null if no contact is found.
 */
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

/**
 * Deletes a contact from Firebase and removes it from the local contact data.
 *
 * @async
 * @param {string} contactId - The ID of the contact to delete.
 * @returns {Promise<void>} A promise that resolves when the contact has been deleted.
 */
async function deleteContactFromFirebase(contactId) {

    await deleteData("contacts", contactId);

    delete fetchedData[contactId];

}

/**
 * Adds a global click event listener that hides the edit menu dialog.
 *
 * @param {Event} event - The click event triggered on the document.
 * @returns {void}
 */
document.addEventListener("click", (event) => {
  const editDialogBox = document.getElementById("edit-menu-dialog");

  if (!editDialogBox) return; // Element noch nicht da → nix machen
   editDialogBox.classList.add("d_none");
});

/**
 * Toggles the visibility of the mobile edit menu dialog.
 * Displays the dialog if it is hidden and hides it if it is visible.
 *
 * @returns {void}
 */
function OpenMobileDialogForDetails() {
  const editDialogBox = document.getElementById("edit-menu-dialog");

  if (!editDialogBox) {
    console.error("Element #edit-menu-dialog nicht gefunden!");
    return;
  }

  editDialogBox.classList.toggle("d_none");
}

/**
 * Initializes the click event listener for the contact edit tools.
 * Removes any existing listener first to prevent duplicate event handlers.
 *
 * @returns {void}
 */
function checkQueriesForEditTools() {
  const editToolEls = document.getElementById("contact-edit-tools");
  if (!editToolEls) return;
  editToolEls.removeEventListener("click", handleEditToolClick);
  editToolEls.addEventListener("click", handleEditToolClick);

}

/**
 * Handles clicks on the contact edit tools.
 * Stops event propagation and toggles the mobile edit menu
 * when the viewport width is 1023px or less.
 *
 * @param {Event} event - The click event triggered on the edit tools.
 * @returns {void}
 */
function handleEditToolClick(event) {
  event.stopPropagation();
  const editToolEls = document.getElementById("contact-edit-tools");
  if (!editToolEls) return;
  const checkquery = window.matchMedia("(max-width: 1023px)");
  if (checkquery.matches) {
    OpenMobileDialogForDetails();
  }
}
