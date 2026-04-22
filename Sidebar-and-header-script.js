let DropDowncontain = document.getElementById(`dropdown-menu`)
let dropdownButton = document.getElementById(`header-button`)
const mediaQuery = window.matchMedia("(max-width: 1092px)");
//später entfernen
localStorage.setItem("username", "Dennis Kollak");


DropDowncontain.classList.add("d_none");

mediaQuery.addEventListener("change", (e) => {
  if (e.matches) {
    // Mobile
    DropDowncontain.classList.add("d_none");
  } else {
    // Desktop
    DropDowncontain.classList.add("d_none");
  }
});

dropdownButton.addEventListener("click", (e) => {
  DropDowncontain.classList.toggle("d_none");
  e.stopPropagation(); // verhindert, dass der Klick weiter hoch bubbelt
});

document.addEventListener("click", () => {
  DropDowncontain.classList.add("d_none");
});

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
 
document.addEventListener("DOMContentLoaded", renderInitials);


// Andere variante zum schließen
// const closeDropdown = () => {
//   DropDowncontain.classList.add("d_none");
// };

// closeDropdown(); // beim Laden

// mediaQuery.addEventListener("change", closeDropdown);