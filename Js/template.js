

function getPriorityIcon(priorityClass) {
    if (priorityClass === 'urgent')  
        return `<svg width="20" height="15" viewBox="0 0 20 15" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_392603_5802)"><path d="M18.9043 14.5096C18.6696 14.51 18.4411 14.4351 18.2522 14.2961L10.0001 8.21288L1.74809 14.2961C1.63224 14.3816 1.50066 14.4435 1.36086 14.4783C1.22106 14.513 1.07577 14.5199 0.933305 14.4986C0.790837 14.4772 0.653973 14.428 0.530528 14.3538C0.407083 14.2796 0.299474 14.1818 0.213845 14.0661C0.128216 13.9503 0.0662437 13.8188 0.0314671 13.6791C-0.00330956 13.5394 -0.0102098 13.3943 0.0111604 13.2519C0.0543195 12.9644 0.21001 12.7058 0.443982 12.533L9.34809 5.96249C9.53679 5.8229 9.76536 5.74756 10.0001 5.74756C10.2349 5.74756 10.4635 5.8229 10.6522 5.96249L19.5563 12.533C19.7422 12.6699 19.8801 12.862 19.9503 13.0819C20.0204 13.3018 20.0193 13.5382 19.9469 13.7573C19.8746 13.9765 19.7349 14.1673 19.5476 14.3024C19.3604 14.4375 19.1352 14.51 18.9043 14.5096Z" fill="#FF3D00"/><path d="M18.9043 8.76057C18.6696 8.76097 18.4411 8.68612 18.2522 8.54702L10.0002 2.46386L1.7481 8.54702C1.51412 8.71983 1.22104 8.79269 0.93331 8.74956C0.645583 8.70643 0.386785 8.55086 0.213849 8.31706C0.0409137 8.08326 -0.0319941 7.79039 0.011165 7.50288C0.054324 7.21536 0.210015 6.95676 0.443986 6.78395L9.3481 0.213471C9.5368 0.0738799 9.76537 -0.00146484 10.0002 -0.00146484C10.2349 -0.00146484 10.4635 0.0738799 10.6522 0.213471L19.5563 6.78395C19.7422 6.92087 19.8801 7.11298 19.9503 7.33286C20.0204 7.55274 20.0193 7.78914 19.947 8.00832C19.8746 8.22751 19.7349 8.41826 19.5476 8.55335C19.3604 8.68844 19.1352 8.76096 18.9043 8.76057Z" fill="#FF3D00"/></g><defs><clipPath id="clip0_392603_5802"><rect width="20" height="14.5098" fill="white"/></clipPath></defs></svg>`;
    if (priorityClass === 'medium')
        return `<svg width="20" height="8" viewBox="0 0 20 8" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_156_994)"><path d="M18.9041 7.45086H1.09589C0.805242 7.45086 0.526498 7.33456 0.320979 7.12755C0.11546 6.92054 0 6.63977 0 6.34701C0 6.05425 0.11546 5.77349 0.320979 5.56647C0.526498 5.35946 0.805242 5.24316 1.09589 5.24316H18.9041C19.1948 5.24316 19.4735 5.35946 19.679 5.56647C19.8845 5.77349 20 6.05425 20 6.34701C20 6.63977 19.8845 6.92054 19.679 7.12755C19.4735 7.33456 19.1948 7.45086 18.9041 7.45086Z" fill="#FFA800"/><path d="M18.9041 2.2077H1.09589C0.805242 2.2077 0.526498 2.0914 0.320979 1.88439C0.11546 1.67738 0 1.39661 0 1.10385C0 0.81109 0.11546 0.530322 0.320979 0.32331C0.526498 0.116298 0.805242 0 1.09589 0L18.9041 0C19.1948 0 19.4735 0.116298 19.679 0.32331C19.8845 0.530322 20 0.81109 20 1.10385C20 1.39661 19.8845 1.67738 19.679 1.88439C19.4735 2.0914 19.1948 2.2077 18.9041 2.2077Z" fill="#FFA800"/></g><defs><clipPath id="clip0_156_994"><rect width="20" height="7.45098" fill="white"/></clipPath></defs></svg>`;
    return `<svg width="20" height="15" viewBox="0 0 20 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 8.76077C9.7654 8.76118 9.53687 8.68634 9.34802 8.54726L0.444913 1.97752C0.329075 1.89197 0.231235 1.78445 0.15698 1.66111C0.0827245 1.53777 0.033508 1.40102 0.0121402 1.25868C-0.031014 0.971193 0.0418855 0.678356 0.214802 0.444584C0.387718 0.210811 0.646486 0.0552534 0.934181 0.0121312C1.22188 -0.0309911 1.51493 0.0418545 1.74888 0.214643L10 6.29712L18.2511 0.214643C18.367 0.129087 18.4985 0.0671675 18.6383 0.0324205C18.7781 -0.00232646 18.9234 -0.00922079 19.0658 0.0121312C19.2083 0.0334832 19.3451 0.0826633 19.4685 0.156864C19.592 0.231064 19.6996 0.328831 19.7852 0.444584C19.8708 0.560336 19.9328 0.691806 19.9676 0.831488C20.0023 0.97117 20.0092 1.11633 19.9879 1.25868C19.9665 1.40102 19.9173 1.53777 19.843 1.66111C19.7688 1.78445 19.6709 1.89197 19.5551 1.97752L10.652 8.54726C10.4631 8.68634 10.2346 8.76118 10 8.76077Z" fill="#7AE229"/><path d="M10 14.5093C9.7654 14.5097 9.53687 14.4349 9.34802 14.2958L0.444913 7.72606C0.210967 7.55327 0.0552944 7.29469 0.0121402 7.00721C-0.031014 6.71973 0.0418855 6.42689 0.214802 6.19312C0.387718 5.95935 0.646486 5.80379 0.934181 5.76067C1.22188 5.71754 1.51493 5.79039 1.74888 5.96318L10 12.0457L18.2511 5.96318C18.4851 5.79039 18.7781 5.71754 19.0658 5.76067C19.3535 5.80379 19.6123 5.95935 19.7852 6.19312C19.9581 6.42689 20.031 6.71973 19.9879 7.00721C19.9447 7.29469 19.789 7.55327 19.5551 7.72606L10.652 14.2958C10.4631 14.4349 10.2346 14.5097 10 14.5093Z" fill="#7AE229"/></svg>`;
}


//Template 
function getTaskCard(task) {
    return `
        <div class="card" data-id="${task.id}" data-status="${task.status}" draggable="true">
            <div class="header-card">
            <span class="tag ${task.categoryClass}">${task.category}</span>
            <div class="swap-horiz-div" data-id="${task.id}">
              <img src="./assets/img/swap1_horiz.svg" alt="">
              <div class="move-menu d_none">
              <div class="move-to-header">
                <span>Move To</span>
              </div>
              <div class="movingto-Div">
                
              </div>

        </div>
            </div>
            </div>
            <div class="card-title">${task.title}</div>
            <div class="card-desc">${task.description}</div>
            <div class="subtasks">
              ${task.subtasksHTML}
            </div>
            <div class="card-footer">
              <div class="avatars">
               ${task.avatarsHTML}
              </div>
              <div class="priority ${task.priority}">
                ${getPriorityIcon(task.priority)}
              </div>
            </div>
          </div>`;
};

function getAssignedPersonTemplate(avatar) {
    return `
        <div class="assigned-person">

            <div class="assigned-avatar" style="background-color: ${avatar.color};">
                ${avatar.initials}
            </div>

            <span class="assigned-name">
                ${avatar.name}
            </span>

        </div>
    `;
}

function getSubtaskTemplate(subtask, taskId, index) {
    return `
        <label class="subtask-item">

            <input
                class="subtask-checkbox"
                type="checkbox"
                data-task-id="${taskId}"
                data-index="${index}"
                ${subtask.done ? "checked" : ""}
            >

            <span class="subtask-text">
                ${subtask.title}
            </span>

        </label>
    `;
}


function getCardOverlayTemplate(card) {
    return `
        <div class = "open_task_overlay_content">
            <div class="task-card-header">
                <span class="task-tag ${card.overlayTagClass}">${card.tag}</span>
                <button class="task-close-btn" onclick="closeCardOverlay()">
                <img src="./assets/img/clearX.svg" alt="">
                </button>
            </div>
            <h3 class="task-title">${card.title}</h3>
            <p class="task-description">${card.description}</p>

            <div class="task-meta">
                <div class="task-meta-item">
                    <span class="task-meta-label">Due date:</span>
                    <span class="task-meta-value">${card.dueDate}</span>
                </div>
                <div class="task-meta-item">
                    <span class="task-meta-label">Priority:</span>
                    <span class="task-meta-value">
                        ${card.priorityText}
                         ${card.priorityIcon}
                    </span>
                </div>
            </div>

            <div class="task-assigned">
                <div class="task-assigned-label">Assigned To:</div>
                <div class="task-assigned-list">
                    ${card.avatarsHTML}
                </div>
            </div>

            <div class="task-subtasks">
                <div class="task-subtasks-label">Subtasks</div>
                <div class="task-subtasks-list">
                    ${card.subtasksHTML}
                </div>
            </div>

            <div class="task-actions">
                <button class="task-action-btn delete-btn" onclick="deleteCard('${card.id}')">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M3 4h10M5.5 4V2.5A1.5 1.5 0 0 1 7 1h2a1.5 1.5 0 0 1 1.5 1.5V4m1.5 0v9a1.5 1.5 0 0 1-1.5 1.5h-5A1.5 1.5 0 0 1 4 13V4h8Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Delete
                </button>
                <div class= "vector">
                </div>
                <button class="task-action-btn edit-btn" onclick="renderEditOverlay('${card.id}')">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M11.333 2A1.886 1.886 0 0 1 14 4.667l-9 9-3.667 1 1-3.667 9-9Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Edit
                </button>
            </div>
            </div>`;
}

// function getEditOverlayTemplate(task) {
//     return `
//         <div class="task-card-header">
//             <h3 class="edit-task-title">Edit Task</h3>

//             <button
//                 class="task-close-btn"
//                 onclick="renderCardOverlay('${task.id}')">
//                 &times;
//             </button>
//         </div>


//         <form id="editTaskForm" class="taskForm">

//             <div class="formGrid editFormGrid">


//                 <div class="formColumn">


//                     <div class="formGroup">
//                         <label for="editTaskTitle">Title</label>

//                         <input
//                             id="editTaskTitle"
//                             type="text"
//                             value="${task.title || ""}">
//                     </div>



//                     <div class="formGroup">
//                         <label for="editTaskDescription">Description</label>

//                         <textarea
//                             id="editTaskDescription">${task.description || ""}</textarea>
//                     </div>



//                     <div class="formGroup">
//                         <label for="editTaskDate">Due date</label>

//                         <div class="inputWithIcon">

//                             <input
//                                 id="editTaskDate"
//                                 type="text"
//                                 value="${task.dueDate || ""}"
//                                 placeholder="dd/mm/yyyy"
//                                 inputmode="numeric"
//                                 maxlength="10">

//                             <img
//                                 src="./assets/img/calendar-icon.svg"
//                                 alt="calendar icon">

//                         </div>
//                     </div>


//                 </div>




//                 <div class="formColumn">



//                     <fieldset class="formGroup priorityGroup">

//                         <legend>Priority</legend>


//                         <div class="priorityButtons">


//                             <button
//                                 type="button"
//                                 class="priorityBtn editPriorityBtn urgentBtn ${task.priority === "urgent" ? "activeUrgent" : ""}"
//                                 data-priority="urgent">

//                                 <span>Urgent</span>

//                                 <img
//                                     src="./assets/img/PrioUP-icon.svg"
//                                     alt="urgent">

//                             </button>



//                             <button
//                                 type="button"
//                                 class="priorityBtn editPriorityBtn mediumBtn ${task.priority === "medium" ? "activeMedium" : ""}"
//                                 data-priority="medium">

//                                 <span>Medium</span>

//                                 <img
//                                     src="./assets/img/PrioMedium-icon.svg"
//                                     alt="medium">

//                             </button>



//                             <button
//                                 type="button"
//                                 class="priorityBtn editPriorityBtn lowBtn ${task.priority === "low" ? "activeLow" : ""}"
//                                 data-priority="low">

//                                 <span>Low</span>

//                                 <img
//                                     src="./assets/img/PrioDown-icon.svg"
//                                     alt="low">

//                             </button>


//                         </div>

//                     </fieldset>






//                     <div class="formGroup">

//                         <label for="editTaskCategory">
//                             Category
//                         </label>


//                         <select id="editTaskCategory">


//                             <option
//                                 value="Technical Task"
//                                 ${task.category === "Technical Task" ? "selected" : ""}>
//                                 Technical Task
//                             </option>


//                             <option
//                                 value="User Story"
//                                 ${task.category === "User Story" ? "selected" : ""}>
//                                 User Story
//                             </option>


//                         </select>


//                     </div>







//                     <div class="formGroup">

//                         <label for="editAssignedInput">
//                             Assigned to
//                         </label>



//                         <div
//                             class="customDropdown"
//                             id="editAssignedDropdown">


//                             <input
//                                 type="text"
//                                 class="dropdownButton"
//                                 id="editAssignedInput"
//                                 placeholder="Select contacts to assign"
//                                 autocomplete="off">


//                             <div
//                                 class="dropdownList d_none"
//                                 id="editAssignedList">
//                             </div>


//                         </div>




//                         <div class="selectedContactsWrapper">

//                             <div
//                                 class="selectedContacts"
//                                 id="editSelectedContacts">
//                             </div>

//                         </div>


//                     </div>








//                     <div class="formGroup">

//                         <label for="editSubtaskInput">
//                             Subtasks
//                         </label>



//                         <div class="subtaskInputWrapper">


//                             <input
//                                 id="editSubtaskInput"
//                                 type="text"
//                                 placeholder="Add new subtask">


//                             <div class="subtaskActions">


//                                 <button
//                                     type="button"
//                                     id="editClearSubtaskBtn">
//                                     &times;
//                                 </button>


//                                 <div class="subtaskDivider"></div>


//                                 <button
//                                     type="button"
//                                     id="editAddSubtaskBtn">
//                                     ✓
//                                 </button>


//                             </div>


//                         </div>





//                         <div class="subtasksWrapper">

//                             <ul
//                                 class="subtaskList"
//                                 id="editSubtaskList">

//                                 ${task.editSubtasksHTML || ""}

//                             </ul>


//                         </div>


//                     </div>



//                 </div>


//             </div>


//         </form>




//         <div class="editTaskActions">


//             <button
//                 type="button"
//                 class="clearBtn"
//                 onclick="renderCardOverlay('${task.id}')">

//                 Cancel ✕

//             </button>




//             <button
//                 type="submit"
//                 form="editTaskForm"
//                 class="createTaskBtn">

//                 Ok ✓

//             </button>


//         </div>
//     `;
// }

//Von stefan branch in boardTemplate.js
function getEditOverlayTemplate(task) {
    return `
        <div class="task-card-header">
            <h3 class="edit-task-title">Edit Task</h3>

            <button
                class="task-close-btn"
                onclick="renderCardOverlay('${task.id}')">
                &times;
            </button>
        </div>

        <form id="editTaskForm" class="taskForm">

            <div class="formGrid editFormGrid">

                <div class="formColumn">

                    <div class="formGroup">
                        <label for="editTaskTitle">Title</label>
                        <input
                            id="editTaskTitle"
                            type="text"
                            value="${task.title || ""}">
                    </div>

                    <div class="formGroup">
                        <label for="editTaskDescription">Description</label>
                        <textarea id="editTaskDescription">${task.description || ""}</textarea>
                    </div>

                    <div class="formGroup">
                        <label for="editTaskDate">Due date</label>

                        <div class="inputWithIcon">
                            <input
                                id="editTaskDate"
                                type="text"
                                value="${task.dueDate || ""}"
                                placeholder="dd/mm/yyyy"
                                inputmode="numeric"
                                maxlength="10">

                            <img
                                src="./assets/img/calendar-icon.svg"
                                alt="calendar icon">
                        </div>
                    </div>

                </div>


                <div class="formColumn">

                    <fieldset class="formGroup priorityGroup">
                        <legend>Priority</legend>

                        <div class="priorityButtons">

                            <button
                                type="button"
                                class="priorityBtn editPriorityBtn urgentBtn ${task.priority === "urgent" ? "activeUrgent" : ""}"
                                data-priority="urgent">

                                <span>Urgent</span>

                                <img
                                    src="./assets/img/PrioUP-icon.svg"
                                    alt="urgent">
                            </button>


                            <button
                                type="button"
                                class="priorityBtn editPriorityBtn mediumBtn ${!task.priority || task.priority === "medium" ? "activeMedium" : ""}"
                                data-priority="medium">

                                <span>Medium</span>

                                <img
                                    src="./assets/img/PrioMedium-icon.svg"
                                    alt="medium">
                            </button>


                            <button
                                type="button"
                                class="priorityBtn editPriorityBtn lowBtn ${task.priority === "low" ? "activeLow" : ""}"
                                data-priority="low">

                                <span>Low</span>

                                <img
                                    src="./assets/img/PrioDown-icon.svg"
                                    alt="low">
                            </button>

                        </div>
                    </fieldset>


                    <div class="formGroup">
                        <label for="editTaskCategory">Category</label>

                        <select id="editTaskCategory">

                            <option
                                value="Technical Task"
                                ${task.category === "Technical Task" ? "selected" : ""}>
                                Technical Task
                            </option>

                            <option
                                value="User Story"
                                ${task.category === "User Story" ? "selected" : ""}>
                                User Story
                            </option>

                        </select>
                    </div>


                    <div class="formGroup">

                        <label for="editAssignedInput">
                            Assigned to
                        </label>

                        <div
                            class="customDropdown"
                            id="editAssignedDropdown">

                            <input
                                type="text"
                                class="dropdownButton"
                                id="editAssignedInput"
                                placeholder="Select contacts to assign"
                                autocomplete="off">

                            <div
                                class="dropdownList d_none"
                                id="editAssignedList">
                            </div>

                        </div>


                        <div class="selectedContactsWrapper">

                            <div
                                class="selectedContacts"
                                id="editSelectedContacts">
                            </div>


                            <div
                                class="moreContactsDropdown d_none"
                                id="editMoreContactsDropdown">
                            </div>

                        </div>

                    </div>


                    <div class="formGroup">

                        <label for="editSubtaskInput">
                            Subtasks
                        </label>

                        <div class="subtaskInputWrapper">

                            <input
                                id="editSubtaskInput"
                                type="text"
                                placeholder="Add new subtask">


                            <div class="subtaskActions">

                                <button
                                    type="button"
                                    id="editClearSubtaskBtn">
                                    &times;
                                </button>

                                <div class="subtaskDivider"></div>

                                <button
                                    type="button"
                                    id="editAddSubtaskBtn">
                                    ✓
                                </button>

                            </div>

                        </div>


                        <div class="subtasksWrapper">

                            <ul
                                class="subtaskList"
                                id="editSubtaskList">
                            </ul>

                        </div>

                    </div>

                </div>

            </div>

        </form>


        <div class="editTaskActions">

            <button
                type="button"
                class="clearBtn"
                onclick="renderCardOverlay('${task.id}')">
                Cancel ✕
            </button>


            <button
                type="submit"
                form="editTaskForm"
                class="createTaskBtn">
                Ok ✓
            </button>

        </div>
    `;
}


function getEditAssignedContactTemplate(contact) {

    return `
        <div
            class="selectedAvatar"
            style="background:${contact.color}"
            title="${contact.name || ""}">

            ${contact.initials || getInitials(contact.name)}

        </div>
    `;
}


function getEditMoreContactTemplate(contact) {

    return `
        <div class="moreContactItem">

            <div
                class="selectedAvatar"
                style="background:${contact.color}">

                ${contact.initials || getInitials(contact.name)}

            </div>

            <span>
                ${contact.name || ""}
            </span>

        </div>
    `;
}