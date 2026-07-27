const BASE_URL = "https://test-2651c-default-rtdb.europe-west1.firebasedatabase.app/";


/**
 * 
 * Loads all entries from a Firebase collection and stores them
 * in the global fetchedData object. Each entry is extended with
 * its Firebase ID.
 *
 * @async
 * @param {string} collection - Name of the Firebase collection.
 * @returns {Promise<Object>} Returns an object containing all fetched entries.
 */

async function loadDataBase(collection) {

  const fetchedData = {};

  try {

    const response = await fetch(BASE_URL + collection + ".json");

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseToJson = await response.json();

    // Firebase returns object with IDs as keys:
    // {
    //   "-NxAbc": { name, email },
    //   "-NxDef": { name, email }
    // }

    // Convert to:
    // {
    //   "-NxAbc": { id: "-NxAbc", name, email },
    //   "-NxDef": { id: "-NxDef", name, email }
    // }

    if (responseToJson && typeof responseToJson === "object") {

      for (const [id, data] of Object.entries(responseToJson)) {

        fetchedData[id] = {
          id,
          ...data,
        };

      }

    }

    return fetchedData;

  } catch (error) {

    console.error(`Error loading ${collection}:`, error);

    return {};

  }

}

/**
 * Saves a new entry to a Firebase collection.
 * @async 
 * @function saveData
 * @param {string} collection - Name of the Firebase collection.
 * @param {Object} data - Data object to be saved.
 * @returns {Promise<Object>} Firebase response containing the generated ID.
 * @throws {Error} Throws an error if the request fails.
 */

async function saveData(collection, data) {

  try {

    const response = await fetch(BASE_URL + collection + ".json", {

      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(data),

    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();

  } catch (error) {

    console.error(`Error saving to ${collection}:`, error);

    throw error;

  }

}

/**
 * Deletes an entry from a Firebase collection.
 * 
 * @async
 * @function deleteData
 * @param {string} collection - Name of the Firebase collection.
 * @param {string} id - Firebase ID of the entry to delete.
 * @returns {Promise<boolean>} Returns true if deletion was successful.
 * @throws {Error} Throws an error if the request fails.
 */

async function deleteData(collection, id) {

  try {

    const response = await fetch(
      BASE_URL + collection + "/" + id + ".json",
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return true;

  } catch (error) {

    console.error(`Error deleting from ${collection}:`, error);

    throw error;

  }

}

/**
 * 
 * Updates an existing Firebase entry with new data.
 * 
 * @async
 * @function updateData
 * @param {string} collection - Name of the Firebase collection.
 * @param {string} id - Firebase ID of the entry to update.
 * @param {Object} updatedData - Object containing updated values.
 * @returns {Promise<Object>} Firebase response containing updated data.
 * @throws {Error} Throws an error if the request fails.
 */

async function updateData(collection, id, updatedData) {

  try {

    const response = await fetch(
      BASE_URL + collection + "/" + id + ".json",
      {

        method: "PATCH",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(updatedData),

      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();

  } catch (error) {

    console.error(`Error updating ${collection}:`, error);

    throw error;

  }

}

/**
 * 
 * Displays an error message and highlights an input field.
 * 
 * @param {string} inputOrDivId - ID of the input or container element.
 * @param {string} errorId - ID of the error message element.
 * @param {string} message - Error message to display.
 */

function setError(inputOrDivId, errorId, message) {
    document.getElementById(errorId).style.color = "red";
    document.getElementById(errorId).textContent = message;
    document.getElementById(inputOrDivId).style.borderColor = "red";
}

/**
 * 
 * Removes an error message and resets input styling.
 * 
 * @param {string} inputOrDivId - ID of the input or container element.
 * @param {string} errorId - ID of the error message element.
 */

function clearError(inputOrDivId, errorId) {
    document.getElementById(errorId).textContent = "";
    document.getElementById(errorId).style.color = "";
    document.getElementById(inputOrDivId).style.borderColor = "";
}

/**
 * 
 * Enables or disables a button depending on the validation
 * state of a form.
 * 
 * @param {string} buttonId - ID of the button element.
 * @param {string} formKey - Key of the form state object.
 * 
 */

function updateButton(buttonId, formKey) {
    const button = document.getElementById(buttonId);

    button.disabled =
        !Object.values(formState[formKey]).every(Boolean);
}

/**
 * 
 * Validates a name input field.
 * Only letters, spaces and hyphens are allowed.
 * 
 * @param {string} inputId - ID of the input element.
 * @param {string} errorId - ID of the error message element.
 * @param {string} inputOrDivId - ID of the input or container element.
 * @returns {boolean} True if the name is valid, otherwise false.
 */

function validateName(inputId, errorId, inputOrDivId) {
    const name = document.getElementById(inputId).value.trim();

    const nameRegex = /^[a-zA-ZäöüÄÖÜß\s-]+$/;

    if (!name) {
       setError(inputOrDivId, errorId, "Name is required");
       return false;

    } else if (!nameRegex.test(name)) {
       setError(inputOrDivId, errorId, "Only letters, spaces and hyphens are allowed");
        return false;
    } else {
      clearError(inputOrDivId, errorId);
        return true;
    }
}

/**
 * 
 * Validates an email input field.
 * 
 * @param {string} inputId - ID of the input element.
 * @param {string} errorId - ID of the error message element.
 * @param {string} inputOrDivId - ID of the input or container element.
 * @returns {boolean} True if the email is valid, otherwise false.
 */
function validateEmail(inputId, errorId, inputOrDivId) {
    const email = document.getElementById(inputId).value.trim();

    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
        setError(inputOrDivId, errorId, "Email is required");
        return false;
    }

    if (!regex.test(email)) {
        setError(inputOrDivId, errorId, "Invalid email");
        return false;
    }

    clearError(inputOrDivId, errorId);
    return true;
}

/**
 * 
 * Validates a phone number input field.
 * 
 * @param {string} inputId - ID of the input element.
 * @param {string} errorId - ID of the error message element.
 * @param {string} inputOrDivId - ID of the input or container element.
 * @returns {boolean} True if the phone number is valid, otherwise false.
 */
function validatePhone(inputId, errorId, inputOrDivId) {
    const phone = document.getElementById(inputId).value.trim();

    const regex = /^[0-9+\s()-]{6,}$/;

    if (!phone) {
        setError(inputOrDivId, errorId, "Phone is required");
        return false;
    }

    if (!regex.test(phone)) {
        setError(inputOrDivId, errorId, "Invalid phone number");
        return false;
    }

    clearError(inputOrDivId, errorId);
    return true;
}

/**
 * 
 * Validates a form field and updates the submit button state.
 * 
 * @param {string} formKey - Key of the form state object.
 * @param {string} type - Validation type ("name", "email", or "phone").
 * @param {string} inputId - ID of the input element.
 * @param {string} errorId - ID of the error message element.
 * @param {string} buttonId - ID of the submit button.
 * @param {string} inputOrDivId - ID of the input or container element.
 */
function checkField(formKey, type, inputId, errorId, buttonId, inputOrDivId) {

    if (type === "name") {
        formState[formKey][type] = validateName(inputId, errorId, inputOrDivId);
    }

    if (type === "email") {
        formState[formKey][type] = validateEmail(inputId, errorId, inputOrDivId);
    }

    if (type === "phone") {
        formState[formKey][type] = validatePhone(inputId, errorId, inputOrDivId);
    }

    updateButton(buttonId, formKey);
}
//<input oninput="checkField('contact','name','edit_name_input','edit_name_error','editContactBtn')">

/**
 * 
 * Resets form inputs, clears error messages and resets validation state.
 * 
 * @param {string} formKey - Key of the form state object.
 * @param {string} buttonId - ID of the button element.
 * @param {string[]} fields - Array of field names to reset.
 */
function resetForm(formKey, buttonId, fields) {

    fields.forEach(field => {
        document.getElementById(field + "_input").value = "";
        document.getElementById(field + "_error").textContent = "";

        formState[formKey][field] = false;
    });

    updateButton(buttonId, formKey);
}
//Beispiel 
//resetForm("contact", "createContactBtn", ["name", "email", "phone"]);
//Wird dann in Beispiel in addnewContact unter popUpMassage gepackt

function logout() {
  localStorage.removeItem("userStatus")
  localStorage.removeItem("username")
  window.location.href = "./index.html";
}
