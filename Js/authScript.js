window.addEventListener("load", function () {
  const currentUser = localStorage.getItem("currentUser");

  if (!currentUser) {
    window.location.href = "./index.html";
  }
});



