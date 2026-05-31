const currentUser = JSON.parse(localStorage.getItem("currentUser"));

if (!currentUser) {
  document.body.classList.add("guestView");
}