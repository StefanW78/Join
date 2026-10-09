/**
 * Stores the base URL of the Firebase Realtime Database.
 */
const BASE_URL =
  "https://test-2651c-default-rtdb.europe-west1.firebasedatabase.app/";

/**
 * Loads data from the configured Firebase path.
 *
 * @async
 * @param {string} path - The database path to access.
 * @returns {Promise<Object>} A promise that resolves with the database response.
 */
export async function loadData(path = "") {
  const response = await fetch(`${BASE_URL}${path}.json`);

  if (!response.ok) {
    throw new Error(`Fehler beim Laden: ${response.status}`);
  }

  return (await response.json()) || {};
}

/**
 * Creates a new entry at the configured Firebase path.
 *
 * @async
 * @param {string} path - The database path to access.
 * @param {Object} data - The data to save.
 * @returns {Promise<Object>} A promise that resolves with the database response.
 */
export async function postData(path = "", data = {}) {
  const response = await fetch(`${BASE_URL}${path}.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Fehler beim Speichern: ${response.status}`);
  }

  return await response.json();
}

/**
 * Updates data at the configured Firebase path.
 *
 * @async
 * @param {string} path - The database path to access.
 * @param {Object} data - The data to save.
 * @returns {Promise<Object>} A promise that resolves with the database response.
 */
export async function patchData(path = "", data = {}) {
  const response = await fetch(`${BASE_URL}${path}.json`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Fehler beim Aktualisieren: ${response.status}`);
  }

  return await response.json();
}

/**
 * Deletes data at the configured Firebase path.
 *
 * @async
 * @param {string} path - The database path to access.
 * @returns {Promise<boolean>} A promise that resolves with true after deletion.
 */
export async function deleteData(path = "") {
  const response = await fetch(`${BASE_URL}${path}.json`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`Fehler beim Löschen: ${response.status}`);
  }

  return true;
}
