import { observeAuthState } from "./auth.js";

export function requireAuth() {
  observeAuthState((user) => {
    if (!user) {
      window.location.href = "./login.html";
    }
  });
}