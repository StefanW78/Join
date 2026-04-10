function contactListTemplate( name, email, color, initials, alphabetHeader) {
    return`
          <div class="contact-list-items">
                ${alphabetHeader}
                <div class="contact-seperator"></div>
                    <div class="contact-container">
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