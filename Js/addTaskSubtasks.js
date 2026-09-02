import { toggleInputFocus } from "./addTaskForm.js";

/**
 * Initializes the controls and events used to manage subtasks.
 *
 * @returns {void}
 */
export function initSubtasks() {
  subtaskInput.addEventListener("keydown", handleSubtaskEnter);
  addSubtaskBtn.addEventListener("click", addCurrentSubtaskInput);
  clearSubtaskBtn.addEventListener("click", clearSubtaskInput);
  document.addEventListener("click", closeSubtasksOnOutsideClick);
}

/**
 * Handles the subtask enter.
 *
 * @param {Event} event - The event that triggered the operation.
 * @returns {void}
 */
function handleSubtaskEnter(event) {
  if (event.key !== "Enter") return;
  event.preventDefault();
  addCurrentSubtaskInput();
}

/**
 * Clears the subtask input.
 *
 * @returns {void}
 */
function clearSubtaskInput() {
  subtaskInput.value = "";
  subtaskInput.focus();
  toggleInputFocus(subtaskInput);
}

/**
 * Closes the additional-subtasks dropdown after an outside click.
 *
 * @param {Event} event - The event that triggered the operation.
 * @returns {void}
 */
function closeSubtasksOnOutsideClick(event) {
  if (!event.target.closest(".subtasksWrapper")) {
    moreSubtasksDropdown.classList.add("d_none");
  }
}

/**
 * Renders the subtasks.
 *
 * @returns {void}
 */
export function renderSubtasks() {
  subtaskList.innerHTML = "";
  moreSubtasksDropdown.innerHTML = "";
  moreSubtasksDropdown.classList.add("d_none");
  const visibleSubtasks = subtasks.slice(0, 4);
  const hiddenSubtasks = subtasks.slice(4);
  visibleSubtasks.forEach(renderVisibleSubtask);
  if (hiddenSubtasks.length) renderHiddenSubtasks(hiddenSubtasks);
  initSubtaskItemButtons();
}

/**
 * Renders the visible subtask.
 *
 * @param {Object} subtask - The subtask to process.
 * @param {number} index - The item's position in its list.
 * @returns {void}
 */
function renderVisibleSubtask(subtask, index) {
  subtaskList.innerHTML += `
    <li class="subtaskItem">
      <span class="subtaskText">• ${subtask.title}</span>
      ${getSubtaskActionsTemplate(index)}
    </li>
  `;
}

/**
 * Renders the hidden subtasks.
 *
 * @param {Object[]} hiddenSubtasks - The subtasks displayed in the additional-subtasks dropdown.
 * @returns {void}
 */
function renderHiddenSubtasks(hiddenSubtasks) {
  subtaskList.innerHTML += `
      <li>
        <button type="button" class="moreSubtasksBtn" id="moreSubtasksBtn">
          +${hiddenSubtasks.length}
        </button>
      </li>
    `;
  hiddenSubtasks.forEach(renderHiddenSubtask);
  document.getElementById("moreSubtasksBtn")
    .addEventListener("click", toggleMoreSubtasks);
}

/**
 * Renders the hidden subtask.
 *
 * @param {Object} subtask - The subtask to process.
 * @param {number} index - The item's position in its list.
 * @returns {void}
 */
function renderHiddenSubtask(subtask, index) {
  const realIndex = index + 4;
  moreSubtasksDropdown.innerHTML += `
    <div class="moreSubtaskItem">
      <span class="moreSubtaskText">• ${subtask.title}</span>
      ${getSubtaskActionsTemplate(realIndex)}
    </div>
  `;
}

/**
 * Retrieves the subtask actions template.
 *
 * @param {number} index - The item's position in its list.
 * @returns {string} The generated value or HTML markup.
 */
function getSubtaskActionsTemplate(index) {
  return `
    <div class="subtaskItemActions">
      <button type="button" class="editSubtaskBtn" data-index="${index}">
        <img src="./assets/img/Subtasks change.svg" alt="Edit subtask" />
      </button>
      <button type="button" class="deleteSubtaskBtn" data-index="${index}">
        <img src="./assets/img/SubTask delete.svg" alt="Delete subtask" />
      </button>
    </div>`;
}

/**
 * Toggles the more subtasks.
 *
 * @param {Event} event - The event that triggered the operation.
 * @returns {void}
 */
function toggleMoreSubtasks(event) {
  event.stopPropagation();
  moreSubtasksDropdown.classList.toggle("d_none");
}

/**
 * Initializes the subtask item buttons.
 *
 * @returns {void}
 */
function initSubtaskItemButtons() {
  initIndexedButtons(".deleteSubtaskBtn", deleteSubtask);
  initIndexedButtons(".editSubtaskBtn", editSubtask);
}

/**
 * Initializes the indexed buttons.
 *
 * @param {string} selector - The selector used to find elements.
 * @param {Function} handler - The callback to register.
 * @returns {void}
 */
function initIndexedButtons(selector, handler) {
  document.querySelectorAll(selector).forEach((button) => {
    button.addEventListener("click", () => handler(Number(button.dataset.index)));
  });
}

/**
 * Deletes the subtask.
 *
 * @param {number} index - The item's position in its list.
 * @returns {void}
 */
function deleteSubtask(index) {
  subtasks.splice(index, 1);
  renderSubtasks();
}

/**
 * Moves a subtask into the input so it can be edited.
 *
 * @param {number} index - The item's position in its list.
 * @returns {void}
 */
function editSubtask(index) {
  subtaskInput.value = subtasks[index].title;
  subtasks.splice(index, 1);
  renderSubtasks();
  subtaskInput.focus();
  toggleInputFocus(subtaskInput);
}

/**
 * Generates uppercase initials from the first two parts of a name.
 *
 * @param {string} name - The name used to generate the initials.
 * @returns {string} The generated value or HTML markup.
 */
export function getInitials(name = "") {
  return name
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

/**
 * Selects an avatar color based on an item's position.
 *
 * @param {number} index - The item's position in its list.
 * @returns {string} The generated value or HTML markup.
 */
export function getAvatarColor(index) {
  const colors = [
    "#9327ff",
    "#ff7a00",
    "#fc71ff",
    "#6e52ff",
    "#1fd7c1",
    "#ffbb2b",
  ];
  return colors[index % colors.length];
}
