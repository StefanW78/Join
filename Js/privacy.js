/**
 * References the DOM element with the ID `summaryA`.
 */
let SummaryA = document.getElementById(`summaryA`)
/**
 * References the DOM element with the ID `addTaskA`.
 */
let addTaskA = document.getElementById(`addTaskA`)
/**
 * References the DOM element with the ID `boardA`.
 */
let boardA = document.getElementById(`boardA`)
/**
 * References the DOM element with the ID `contactsA`.
 */
let contactsA = document.getElementById(`contactsA`)
/**
 * References the DOM element with the ID `LogInA`.
 */
let LogInA = document.getElementById(`LogInA`)
/**
 * References the DOM element with the ID `footer-mobile`.
 */
let footerMobile = document.getElementById(`footer-mobile`)
/**
 * References the DOM element with the ID `user-header`.
 */
let userHeader = document.getElementById(`user-header`)
/**
 * References the DOM element with the ID `mobile-view-linkandfooter`.
 */
let mobileViewLinkandFooter = document.getElementById(`mobile-view-linkandfooter`)


/**
 * Initializes the privacy page visibility for the current user.
 *
 * @returns {void}
 */
function init() {
    CheckInUser()
}
/**
 * Updates privacy page navigation based on the current authentication status.
 *
 * @returns {void}
 */
function CheckInUser() {
    const userStatus = localStorage.getItem("userStatus");
  // loggedIn gegen user getauscht
    if (!userStatus || (userStatus !== "guest" && userStatus !== "user")) {
    SummaryA.classList.add(`d_none`)
    addTaskA.classList.add(`d_none`)
    boardA.classList.add(`d_none`)
    contactsA.classList.add(`d_none`)
    footerMobile.classList.add(`d_flex`)
    userHeader.classList.add(`d_none`)
    LogInA.classList.remove(`d_none`)
    
  }else{
    mobileViewLinkandFooter.classList.add(`d_none`)
  }
}
