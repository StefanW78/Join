const currentUser = JSON.parse(localStorage.getItem("currentUser"));

const badge = document.querySelector(".userInitials");

if (badge && currentUser) {
  badge.textContent = currentUser.initials || getInitials(currentUser.name);
}

function getInitials(name = "") {
  return name
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}