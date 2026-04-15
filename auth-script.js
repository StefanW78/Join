window.onload = function () {
  const userStatus = localStorage.getItem("userStatus");
  const UID = localStorageStorage.getItem("userID");

  // Wenn der Benutzer nicht eingeloggt ist.
  if (!userStatus || (userStatus !== "guest" && userStatus !== "loggedIn")) {
    window.location.href = "../html/index.html"; // Weiterleitung zur Login-Seite
  }
};