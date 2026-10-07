let SummaryA = document.getElementById(`summaryA`);
let addTaskA = document.getElementById(`addTaskA`);
let boardA = document.getElementById(`boardA`);
let contactsA = document.getElementById(`contactsA`);
let LogInA = document.getElementById(`LogInA`);
let footerMobile = document.getElementById(`footer-mobile`);
let userHeader = document.getElementById(`user-header`);
let mobileViewLinkandFooter = document.getElementById(
  `mobile-view-linkandfooter`,
);

/**
 * Initializes the privacy page navigation for the stored user status.
 * @returns {void}
 */
function init() {
  CheckInUser();
}
/**
 * Adjusts navigation, login link, and footer visibility for guests and users.
 * @returns {void}
 */
function CheckInUser() {
  const userStatus = localStorage.getItem("userStatus");
  if (!userStatus || (userStatus !== "guest" && userStatus !== "user")) {
    SummaryA.classList.add(`d_none`);
    addTaskA.classList.add(`d_none`);
    boardA.classList.add(`d_none`);
    contactsA.classList.add(`d_none`);
    footerMobile.classList.add(`d_flex`);
    userHeader.classList.add(`d_none`);
    LogInA.classList.remove(`d_none`);
  } else {
    mobileViewLinkandFooter.classList.add(`d_none`);
  }
}
