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
                                        <div class="edit-delete-component-default" id="edit" onclick="OpenEditDialog()">
                                            <img src="" alt="edit-logo">
                                            <span>Edit</span>
                                        </div>
                                        <div class="edit-delete-component-default" id="delete">
                                            <img src="./assets/img/delete-contact.svg" alt="delete-logo">
                                            <span>Delete</span>
                                        </div>
                                    </div>
                                    <!-- als Test -->
                                    <div id="edit-menu-dialog" class="edit-menu-dialog d_none">
                                        <div id="editMobile" class="edit-delete-component-default" onclick="OpenEditDialog()">
                                            <img src="" alt="">
                                            <span>Edit</span>
                                        </div>
                                        <div id="deleteMobile" class="edit-delete-component-default">
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