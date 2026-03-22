let DropDowncontain = document.getElementById(`dropdown-menu`)
let dropdownButton = document.getElementById(`header-button`)
const mediaQuery = window.matchMedia("(max-width: 1092px)");
localStorage.setItem("username", "Max Musterman");


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

  if (!user) return;

  const initials = user.split(" ").map(w => w[0].toUpperCase()).join("");

  dropdownButton.innerText = initials;
}


