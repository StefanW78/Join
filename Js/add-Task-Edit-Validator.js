function isEditTaskFormValid() {
    clearEditErrors();

    return (
        validateEditTaskTitle() &&
        validateEditTaskDate() &&
        validateEditTaskCategory()
    );
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
  input.classList.remove("inputError");
  errorElement.textContent = "";
}

function setInputError(input, errorElement, message) {
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


function validateEditTaskDate() {
    const input = document.getElementById("editTaskDate");
    const error = document.getElementById("editTaskDateError");

    clearInputError(input, error);

    const dateValue = input.value.trim();

    if (!dateValue) {
        setInputError(input, error, "This field is required");
        return false;
    }

    if (!isValidDateFormat(dateValue)) {
        setInputError(input, error, "Please use the format dd/mm/yyyy");
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


function parseDateFromInput(dateValue) {
  const [day, month, year] = dateValue.split("/");

  return new Date(Number(year), Number(month) - 1, Number(day));
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