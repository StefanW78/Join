function isEditTaskFormValid() {
    clearEditErrors();

    const isTitleValid = validateEditTaskTitle();
    const isDateValid = validateEditTaskDate();
    const isCategoryValid = validateEditTaskCategory();

    return isTitleValid && isDateValid && isCategoryValid;
}


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

function clearInputError(input, errorElement) {
    if (!input || !errorElement) return;

    input.classList.remove("inputError");
    errorElement.textContent = "";
}

function setInputError(input, errorElement, message) {
    if (!input || !errorElement) return;

    input.classList.remove("inputFocus");
    input.classList.add("inputError");
    errorElement.textContent = message;
}

function validateEditTaskTitle() {
    const input = document.getElementById("editTaskTitle");
    const error = document.getElementById("editTaskTitleError");

    if (input.value.trim()) {
        return true;
    }

    setInputError(input, error, "This field is required");
    return false;
}

function validateEditTaskCategory() {
    const select = document.getElementById("editTaskCategory");
    const error = document.getElementById("editTaskCategoryError");

    if (select.value) {
        return true;
    }

    setInputError(select, error, "This field is required");
    return false;
}

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



function parseDateFromInput(dateValue) {

    const [day, month, year] = dateValue.split("/");


    return new Date(
        Number(year),
        Number(month) - 1,
        Number(day)
    );
}

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

