import { observeAuthState } from "./auth.js";

observeAuthState((user) => {
  if (!user) {
    window.location.href = "../htmlSites/login.html";
    return;
  }

  console.log("Eingeloggt als:", user.email);
});

import { requireAuth } from "./guard.js";

requireAuth();