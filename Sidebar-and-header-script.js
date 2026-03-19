let DropDowncontain = document.getElementById(`dropdown-menu`)
let dropdownButton = document.getElementById(`header-button`)
localStorage.setItem("username", "Max Musterman");


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


