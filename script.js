const BASE_URL =
  "https://test-2651c-default-rtdb.europe-west1.firebasedatabase.app/";

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
    const response = await fetch(BASE_URL + collection + "/" + id + ".json", {
      method: "DELETE",
    });

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
    const response = await fetch(BASE_URL + collection + "/" + id + ".json", {
      method: "PATCH",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(updatedData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error updating ${collection}:`, error);

    throw error;
  }
}
