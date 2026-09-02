/**
 * Checks whether all required fields in the edit task form are valid.
 *
 * @returns {boolean} Whether the validation or comparison succeeds.
 */
function isEditTaskFormValid() {
    clearEditErrors();

    const isTitleValid = validateEditTaskTitle();
    const isDateValid = validateEditTaskDate();
    const isCategoryValid = validateEditTaskCategory();

    return isTitleValid && isDateValid && isCategoryValid;
}


/**
 * Clears all validation errors from the edit task form.
 *
 * @returns {void}
 */
function clearEditErrors() {
    clearInputError(
        document.getElementById("editTaskTitle"),
        document.getElementById("editTaskTitleError")
    );

    clearInputError(
        document.getElementById("editTaskDate"),
        document.getElementById("editTaskDateError")
    );

    clearInputError(
        document.getElementById("editTaskCategory"),
        document.getElementById("editTaskCategoryError")
    );
}

/**
 * Removes the error state and message from an input.
 *
 * @param {HTMLElement} input - The input element to process.
 * @param {HTMLElement} errorElement - The element used to display an error.
 * @returns {void}
 */
function clearInputError(input, errorElement) {
    if (!input || !errorElement) return;

    input.classList.remove("inputError");
    errorElement.textContent = "";
}

/**
 * Marks an input as invalid and displays its error message.
 *
 * @param {HTMLElement} input - The input element to process.
 * @param {HTMLElement} errorElement - The element used to display an error.
 * @param {string} message - The message to display.
 * @returns {void}
 */
function setInputError(input, errorElement, message) {
    if (!input || !errorElement) return;

    input.classList.remove("inputFocus");
    input.classList.add("inputError");
    errorElement.textContent = message;
}

/**
 * Validates the edit task title.
 *
 * @returns {boolean} Whether the validation or comparison succeeds.
 */
function validateEditTaskTitle() {
    const input = document.getElementById("editTaskTitle");
    const error = document.getElementById("editTaskTitleError");

    if (input.value.trim()) {
        return true;
    }

    setInputError(input, error, "This field is required");
    return false;
}

/**
 * Validates the edit task category.
 *
 * @returns {boolean} Whether the validation or comparison succeeds.
 */
function validateEditTaskCategory() {
    const select = document.getElementById("editTaskCategory");
    const error = document.getElementById("editTaskCategoryError");

    if (select.value) {
        return true;
    }

    setInputError(select, error, "This field is required");
    return false;
}

/**
 * Validates the edit task date.
 *
 * @returns {boolean} Whether the validation or comparison succeeds.
 */
function validateEditTaskDate() {
    const input = document.getElementById("editTaskDate");
    const error = document.getElementById("editTaskDateError");

    clearInputError(input, error);

    const dateValue = input.value.trim();

    if (!dateValue) {
        setInputError(
            input,
            error,
            "This field is required"
        );
        return false;
    }


    if (!isValidDateFormat(dateValue)) {
        setInputError(
            input,
            error,
            "Please use the format dd/mm/yyyy"
        );
        return false;
    }


    const selectedDate = parseDateFromInput(dateValue);

    const today = new Date();

    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);


    if (selectedDate < today) {
        setInputError(
            input,
            error,
            "The due date cannot be in the past."
        );
        return false;
    }


    return true;
}



/**
 * Checks whether a date uses the expected format and represents a real date.
 *
 * @param {string} dateValue - The date value to process.
 * @returns {boolean} Whether the validation or comparison succeeds.
 */
function isValidDateFormat(dateValue) {

    const dateRegex =
        /^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;


    if (!dateRegex.test(dateValue)) {
        return false;
    }


    const selectedDate = parseDateFromInput(dateValue);


    const [day, month, year] = dateValue.split("/");


    return (
        selectedDate.getDate() === Number(day) &&
        selectedDate.getMonth() === Number(month) - 1 &&
        selectedDate.getFullYear() === Number(year)
    );
}



/**
 * Parses a displayed date value into a Date object.
 *
 * @param {string} dateValue - The date value to process.
 * @returns {Date} The parsed date.
 */
function parseDateFromInput(dateValue) {

    const [day, month, year] = dateValue.split("/");


    return new Date(
        Number(year),
        Number(month) - 1,
        Number(day)
    );
}

/**
 * Initializes the edit validation events.
 *
 * @returns {void}
 */
function initEditValidationEvents() {
  const editTaskTitle = document.getElementById("editTaskTitle");
  const editTaskDate = document.getElementById("editTaskDate");
  const editTaskCategory = document.getElementById("editTaskCategory");

  const editTaskTitleError =
    document.getElementById("editTaskTitleError");

  const editTaskDateError =
    document.getElementById("editTaskDateError");

  const editTaskCategoryError =
    document.getElementById("editTaskCategoryError");

  editTaskTitle.addEventListener("input", () => {
    clearInputError(editTaskTitle, editTaskTitleError);
  });

  editTaskTitle.addEventListener("blur", () => {
    validateEditTaskTitle();
  });

  editTaskDate.addEventListener("input", () => {
    clearInputError(editTaskDate, editTaskDateError);
  });

  editTaskDate.addEventListener("blur", () => {
    validateEditTaskDate();
  });

  editTaskCategory.addEventListener("change", () => {
    clearInputError(editTaskCategory, editTaskCategoryError);
    validateEditTaskCategory();
  });

  editTaskCategory.addEventListener("blur", () => {
    validateEditTaskCategory();
  });
}
