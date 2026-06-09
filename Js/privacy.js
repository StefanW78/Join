let SummaryA = document.getElementById(`summaryA`)
let addTaskA = document.getElementById(`addTaskA`)
let boardA = document.getElementById(`boardA`)
let contactsA = document.getElementById(`contactsA`)
let LogInA = document.getElementById(`LogInA`)
let footerMobile = document.getElementById(`footer-mobile`)
let userHeader = document.getElementById(`user-header`)
let mobileViewLinkandFooter = document.getElementById(`mobile-view-linkandfooter`)


function init() {
    CheckInUser()
}
function CheckInUser() {
    const userStatus = localStorage.getItem("userStatus");

    if (!userStatus || (userStatus !== "guest" && userStatus !== "loggedIn")) {
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