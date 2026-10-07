/**
 * Returns today's local date in ISO format.
 *
 * @returns {string} The generated value or HTML markup.
 */
export function getTodayISO() {
  const today = new Date();
  const timezoneOffset = today.getTimezoneOffset() * 60000;
  const localDate = new Date(today.getTime() - timezoneOffset);

  return localDate.toISOString().split("T")[0];
}
