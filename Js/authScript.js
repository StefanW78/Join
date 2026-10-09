/**
 * @file Controls page access after the window has finished loading.
 * Privacy Policy and Legal Notice remain accessible without a stored user.
 * Other pages redirect to the login page when no currentUser value is stored.
 * This client-side check does not verify the stored user's credentials.
 */

/**
 * Checks the current page and stored user when the load event fires.
 *
 * @listens window:load
 * @returns {void}
 */
window.addEventListener("load", function () {
  /** @type {string} The final pathname segment, excluding query parameters. */
  const currentPage = window.location.pathname.split("/").pop();
  /** @type {string[]} Pages that do not require a stored user. */
  const publicPages = ["privacy.html", "legalnotes.html"];

  if (publicPages.includes(currentPage)) {
    return;
  }

  /** @type {string|null} The stored user value, without parsing or validation. */
  const currentUser = localStorage.getItem("currentUser");

  if (!currentUser) {
    window.location.href = "./index.html";
  }
});
