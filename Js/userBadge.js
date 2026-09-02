const currentUser = JSON.parse(localStorage.getItem("currentUser"));

const badge = document.querySelector(".userInitials");

if (badge && currentUser) {
  badge.textContent = currentUser.initials || getInitials(currentUser.name);
}

/**
 * Generates uppercase initials from the first two parts of a name.
 *
 * @param {string} name - The name used to generate the initials.
 * @returns {string} The generated value or HTML markup.
 */
function getInitials(name = "") {
  return name
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}
