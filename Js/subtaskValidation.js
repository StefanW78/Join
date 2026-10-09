/** Validates the trimmed subtask title and displays an inline error. */
export function validateSubtaskInput(input) {
  const valid = Array.from(input.value.trim()).length <= 50;
  const errorId = `${input.id}LengthError`;
  let error = document.getElementById(errorId);
  if (!error) {
    error = document.createElement("p");
    error.id = errorId;
    error.className = "fieldError";
    error.setAttribute("aria-live", "polite");
    input.closest(".subtaskInputWrapper").after(error);
    input.setAttribute("aria-describedby", errorId);
  }
  error.textContent = valid ? "" : "Can not be longer than 50 characters";
  input.classList.toggle("inputError", !valid);
  input.setAttribute("aria-invalid", String(!valid));
  if (!valid) input.classList.remove("inputFocus");
  return valid;
}

/** Validates typing and pasted text using the same limit as submission. */
export function initSubtaskValidation(input) {
  input.addEventListener("input", () => validateSubtaskInput(input));
  validateSubtaskInput(input);
}
