window.addEventListener("load", function () {
  const currentPage = window.location.pathname.split("/").pop();
  const publicPages = ["privacy.html", "legalnotes.html"];

  if (publicPages.includes(currentPage)) {
    return;
  }

  const currentUser = localStorage.getItem("currentUser");

  if (!currentUser) {
    window.location.href = "./index.html";
  }
});


