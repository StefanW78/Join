function contactListTemplate( name, email, color, initials, alphabetHeader) {
    return`
          <div class="contact-list-items">
                                ${alphabetHeader}
                                <div class="contact-container" onclick="renderContactDetails(event)">
                                    <div class="contact-badge" id="contact-badge" style="background-color: ${color}">
                                        ${initials}
                                    </div>
                                    <div class="contactDetails">
                                        <h3 class="contactName">${name}</h3>
                                        <span class="contactEmail">${email}</span>
                                    </div>
                                </div>
                            </div>
    
    `
}


function NoContacts() {
    return`
    <div class="no-contacts" style="padding: 20px; text-align: center; color: #888;">No contacts available</div>
    `
}

function contactDetailsTemplate(name, email, phone, color, initials) {
    return`
    <div class="contact-header" id="contact-header">
                                <div class="contact-baged" id="contact-symbol" style="background-color: ${color}">
                                    ${initials}
                                </div>
                                <div class="contact-text" id="contact-text">
                                    <div class="contact-name" id="contact-name">
                                        ${name}
                                    </div>

                                    <div class="contact-edit-tools" id="contact-edit-tools">
                                        <div class="edit-delete-component-default" id="edit" onclick="renderEditOverlay()">
                                            <img src="" alt="edit-logo">
                                            <span>Edit</span>
                                        </div>
                                        <div class="edit-delete-component-default" id="delete" onclick="deleteFloatingData(event)">
                                            <img src="./assets/img/delete-contact.svg" alt="delete-logo">
                                            <span>Delete</span>
                                        </div>
                                    </div>
                                    <!-- als Test -->
                                    <div id="edit-menu-dialog" class="edit-menu-dialog d_none">
                                        <div id="editMobile" class="edit-delete-component-default" onclick="renderEditOverlay()">
                                            <img src="" alt="">
                                            <span>Edit</span>
                                        </div>
                                        <div id="deleteMobile" class="edit-delete-component-default" onclick="deleteFloatingData(event)">
                                            <img src="" alt="">
                                            <span>Delete</span>
                                        </div>
                                    </div>
                                    <!-- als test -->
                                </div>
                            </div>
                            <h3 class="contact-information" id="contact-information">Contact Information</h3>
                            <div class="contact-details" id="contact-details">
                                <h4 class="contact-email">Email</h4>
                                <a href="mailto:test@gmail.com" class="span-email" id="span-email">${email}</a>
                                <h4 class="contact-phone" id="contact-phone">Phone</h4>
                                <span class="span-phone" id="span-phone">${phone}</span>
                            </div>
    `
}

function renderEditTemplate(name, email, phone, contactColor, initials) {
    return`
                                    <div class="edit-contact-overlay slide-out" id="edit-contact-overlay">
                                    <div class="edit-contact-overview">
                                        <div class="join-logo-contact">
                                            <img src="./assets/img/join-logo-add-contact.svg" alt="logo-join">
                                        </div>
                                        <div class="edit-contact-text">
                                            <h2 class="edit-contact-title">Edit contact</h2>
                                            <div class="blue-vector">
                                                <img src="./assets/img/add-contact-blue-vector.svg" alt="seperator">
                                            </div>
                                        </div>
                                    </div>
                                    <div class="edit-contact-container">
                                        <div class="close-btn" onclick="CloseEditDialog()">
                                            <img src="./assets/img/add-contact-close-button.svg" alt="close-btn">
                                        </div>
                                        <div class="edit-contact-form">
                                            <div class="contact-badge" style="background-color: ${contactColor}">
                                                ${initials}
                                            </div>
                                            <div class="contactForm">
                                                <div class="inputContainer">
                                                    <input type="text" placeholder="name" id="nameInput" value="${name}">
                                                    <img src="./assets/img/add-contact-person-icon.svg" alt="person-icon">
                                                </div>
                                                <div class="inputContainer">
                                                    <input type="email" placeholder="Email" id="emailInput" value="${email}">
                                                    <img src="./assets/img/add-contact-mail-icon.svg" alt="mail-icon">
                                                </div>
                                                <div class="inputContainer">
                                                    <input type="tel" placeholder="Phone" id="phoneInput" value="${phone}">
                                                    <img src="./assets/img/add-contact-call-icon.svg" alt="phone-icon">
                                                </div>
                                                <div class="edit-contact-buttons">
                                                    <button class="secondary-btn-default-icon" id="delete-btn" onclick="deleteContactFromEditOverlay(event)">
                                                        Delete
                                                        <img src="" alt="">
                                                    </button>
                                                    <button class="primary-btn-default-icon" id="saveContact-btn" onclick="saveEditedContact()">
                                                        Save
                                                        <img src="./assets/img/create-contact-check.svg" alt="">
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
    `
}