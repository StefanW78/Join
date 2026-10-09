import { getInitials } from "./avatarUtils.js";
/**
 * Stores the user data read from local storage.
 */
const currentUser = JSON.parse(localStorage.getItem("currentUser"));

/**
 * References the first DOM element matching `.userInitials`.
 */
const badge = document.querySelector(".userInitials");

if (badge && currentUser) {
  badge.textContent = currentUser.initials || getInitials(currentUser.name);
}
