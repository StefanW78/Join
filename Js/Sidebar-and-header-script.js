
/**
 * References the HTML elements used to display sidebar and header data.
 */
let DropDowncontain = document.getElementById(`dropdown-menu`)
/**
 * References the DOM element with the ID `header-button`.
 */
let dropdownButton = document.getElementById(`header-button`)
/**
 * Stores the media query for `(max-width: 1023px)`.
 */
const mediaQuery = window.matchMedia("(max-width: 1023px)");
//später entfernen
// localStorage.setItem("username", "Dennis Kollak");


DropDowncontain.classList.add("d_none");

/**
 * Handles media query changes and hides the dropdown container.
 *
 * @param {MediaQueryList} mediaQuery - The media query being monitored.
 */
mediaQuery.addEventListener("change", (e) => {
  if (e.matches) {
    // Mobile
    DropDowncontain.classList.add("d_none");
  } else {
    // Desktop
    DropDowncontain.classList.add("d_none");
  }
});

/**
 * Toggles the visibility of the dropdown container when the button is clicked.
 */
dropdownButton.addEventListener("click", (e) => {
  DropDowncontain.classList.toggle("d_none");
  e.stopPropagation(); // verhindert, dass der Klick weiter hoch bubbelt
});

/**
 * Closes the dropdown container when the document is clicked.
 */
document.addEventListener("click", () => {
  DropDowncontain.classList.add("d_none");
});

/**
 * Retrieves the username and displays the user's initials in the dropdown button.
 *
 * @function renderInitials
 * @returns {string|undefined} The user's initials, a question mark, or undefined
 * if the dropdown button does not exist.
 */
function renderInitials() {
  const user = localStorage.getItem("username");

  if (!dropdownButton) return;

  if (!user) {
    dropdownButton.innerText = "?";
    return "?";
  }
  const initials = user
    .split(" ")
    .map(w => w[0]?.toUpperCase() || "")
    .join("");

  const finalInitials = initials || "?";
  dropdownButton.innerText = finalInitials;

  return finalInitials;
}

/**
 * Renders the user's initials when the DOM has finished loading.
 */
document.addEventListener("DOMContentLoaded", renderInitials);

/**
 * Logs out the current user and redirects to the login page.
 *
 * @function logout
 * @param {Event} [event] - Optional event used to prevent the default action.
 * @returns {void}
 */
function logout(event) {
  if (event) event.preventDefault();

  localStorage.removeItem("currentUser");
  localStorage.removeItem("userStatus");
  localStorage.removeItem("username");

  window.location.href = "./index.html";
}


// Andere variante zum schließen
// const closeDropdown = () => {
//   DropDowncontain.classList.add("d_none");
// };

// closeDropdown(); // beim Laden

// mediaQuery.addEventListener("change", closeDropdown);
