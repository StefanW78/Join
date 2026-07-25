function validateTaskTitle() {
  if (taskTitle.value.trim()) return true;

  setInputError(taskTitle, taskTitleError, "This field is required");
  return false;
}

function validateTaskCategory() {
  if (selectedCategory) return true;

  setInputError(categoryButton, categoryError, "This field is required");
  return false;
}

function validateCurrentUser() {
  if (currentUser) return true;

  console.error("Kein User eingeloggt!");
  return false;
}


function validateTaskDate() {
  clearInputError(taskDate, taskDateError);

  const dateValue = taskDate.value.trim();

  if (!dateValue) {
    setInputError(taskDate, taskDateError, "This field is required");
    return false;
  }

  if (!isValidDateFormat(dateValue)) {
    setInputError(taskDate, taskDateError, "Please use the format dd/mm/yyyy");
    return false;
  }

  const selectedDate = parseDateFromInput(dateValue);
  const today = new Date();

  today.setHours(0, 0, 0, 0);
  selectedDate.setHours(0, 0, 0, 0);

  if (selectedDate < today) {
    setInputError(
      taskDate,
      taskDateError,
      "The due date cannot be in the past.",
    );
    return false;
  }

  return true;
}

function isValidDateFormat(dateValue) {
  const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;

  if (!dateRegex.test(dateValue)) {
    return false;
  }

  const selectedDate = parseDateFromInput(dateValue);

  const day = Number(dateValue.slice(0, 2));
  const month = Number(dateValue.slice(3, 5));
  const year = Number(dateValue.slice(6, 10));

  return (
    selectedDate.getFullYear() === year &&
    selectedDate.getMonth() === month - 1 &&
    selectedDate.getDate() === day
  );
}