/**
 * Stores the media query and the contact data used on the contact page.
 */
const mediaQueryForD_none = window.matchMedia("(max-width: 1023px)")
/**
 * Stores the contact data loaded from the database.
 */
let fetchedData;
/**
 * Stores the ID of the contact currently displayed.
 */
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
