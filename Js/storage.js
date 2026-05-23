const BASE_URL =
  "Your Firebase_URL";

export async function loadData(path = "") {
  const response = await fetch(`${BASE_URL}${path}.json`);

  if (!response.ok) {
    throw new Error(`Fehler beim Laden: ${response.status}`);
  }

  return (await response.json()) || {};
}

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