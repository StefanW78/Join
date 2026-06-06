const currentUser = JSON.parse(localStorage.getItem("currentUser"));
const params = new URLSearchParams(window.location.search);
const isPublicView = params.get("public") === "true";

if (!currentUser || isPublicView) {
  document.body.classList.add("guestView");
}