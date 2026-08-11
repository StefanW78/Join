

function contactListTemplate(contact) {

    return`
                                <div class="contact-container" onclick="openContact(event)" data-id="${contact.id}">
                                    <div class="contact-badge" id="contact-badge" style="background-color: ${contact.color}">
                                        ${contact.initials}
                                    </div>
                                    <div class="contactDetails">
                                        <h3 class="contactName">${contact.name}</h3>
                                        <span class="contactEmail" title="${contact.email}">${contact.email}</span>
                                    </div>
                                </div>
    
    `
}

function contactHeaderTemplate(letter) {

    return `
        <h3 class="contact-alphabet">${letter}</h3>
        <div class="contact-seperator"></div>
    `;
}



function NoContacts() {
    return`
    <div class="no-contacts" style="padding: 20px; text-align: center; color: #888;">No contacts available</div>
    `
}

function contactDetailsTemplate(contact) {
    return`
    <div class="contact-header" id="contact-header">
                                <div class="contact-baged" id="contact-symbol" style="background-color: ${contact.color}">
                                    ${contact.initials}
                                </div>
                                <div class="contact-text" id="contact-text">
                                    <div class="contact-name" id="contact-name">
                                        ${contact.name}
                                    </div>

                                    <div class="contact-edit-tools" id="contact-edit-tools">
                                        <div class="edit-delete-component-default" id="edit" onclick="openEdit('${contact.id}')">
                                            <img src="" alt="edit-logo">
                                            <span>Edit</span>
                                        </div>
                                        <div class="edit-delete-component-default" id="delete" onclick="deleteContactAction('${contact.id}')">
                                            <img src="./assets/img/delete-contact.svg" alt="delete-logo">
                                            <span>Delete</span>
                                        </div>
                                    </div>
                                    <!-- als Test -->
                                    <div id="edit-menu-dialog" class="edit-menu-dialog d_none">
                                        <div id="editMobile" class="edit-delete-component-default" onclick="openEdit('${contact.id}')">
                                            <img src="" alt="">
                                            <span>Edit</span>
                                        </div>
                                        <div id="deleteMobile" class="edit-delete-component-default" onclick="deleteContactAction('${contact.id}')">
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
                                <a href="mailto:${contact.email}" class="span-email" id="span-email">${contact.email}</a>
                                <h4 class="contact-phone" id="contact-phone">Phone</h4>
                                <span class="span-phone" id="span-phone">${contact.phone}</span>
                            </div>
    `
}

function renderEditTemplate(contact) {
    return`
                                    <div class="edit-contact-overlay slide-out" id="edit-contact-overlay">
                                    <div class="edit-contact-overview">
                                        <div class="close-btn" onclick="CloseEditDialog()">
                                            <img src="./assets/img/add-contact-close-button.svg" alt="close-btn">
                                        </div>
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
                                        <div class="edit-contact-form">
                                            <div class="contact-badge" style="background-color: ${contact.color}">
                                                ${contact.initials}
                                            </div>
                                            <div class="contactForm">
                                            <div class="input-and-errordiv">
                                                <div class="inputContainer" id="editInputContainer_name">
                                                    <input type="text" placeholder="Name" id="nameInput" value="${contact.name}" required autocomplete="name" aria-describedby="editName_error" oninput="handleContactFieldInput('edit', 'name')" onblur="validateContactField('edit', 'name')">
                                                    <img src="./assets/img/add-contact-person-icon.svg" alt="person-icon">
                                                </div>
                                                <span class="contact-field-error" id="editName_error" aria-live="polite"></span>
                                                </div>
                                                <div class="input-and-errordiv">
                                                <div class="inputContainer" id="editInputContainer_email">
                                                    <input type="email" placeholder="Email" id="emailInput" value="${contact.email}" required autocomplete="email" aria-describedby="editEmail_error" oninput="handleContactFieldInput('edit', 'email')" onblur="validateContactField('edit', 'email')">
                                                    <img src="./assets/img/add-contact-mail-icon.svg" alt="mail-icon">
                                                </div>
                                                <span class="contact-field-error" id="editEmail_error" aria-live="polite"></span>
                                                </div>
                                                <div class="input-and-errordiv">
                                                <div class="inputContainer" id="editInputContainer_phone">
                                                    <input type="tel" placeholder="Phone" id="phoneInput" value="${contact.phone}" required autocomplete="tel" aria-describedby="editPhone_error" oninput="handleContactFieldInput('edit', 'phone')" onblur="validateContactField('edit', 'phone')">
                                                    <img src="./assets/img/add-contact-call-icon.svg" alt="phone-icon">
                                                </div>
                                                <span class="contact-field-error" id="editPhone_error" aria-live="polite"></span>
                                                </div>
                                                <div class="validationErrorMsg" id="editValidationErrorMsg" aria-live="polite" hidden></div>
                                                <div class="edit-contact-buttons">
                                                    <button class="secondary-btn-default-icon" id="delete-btn" type="button" onclick="deleteContactFromEditOverlay(event)">
                                                        Delete
                                                        <img src="" alt="">
                                                    </button>
                                                    <button class="primary-btn-default-icon" id="saveContact-btn" type="button" disabled onclick="saveEditedContact()">
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
