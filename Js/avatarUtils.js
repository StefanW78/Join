/**
 * Generates uppercase initials from the first two parts of a name.
 *
 * @param {string} name - The name used to generate the initials.
 * @returns {string} The generated value or HTML markup.
 */
export function getInitials(name = "") {
  return name
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

/**
 * Selects an avatar color based on an item's position.
 *
 * @param {number} index - The item's position in its list.
 * @returns {string} The generated value or HTML markup.
 */
export function getAvatarColor(index) {
  const colors = [
    "#9327ff",
    "#ff7a00",
    "#fc71ff",
    "#6e52ff",
    "#1fd7c1",
    "#ffbb2b",
  ];
  return colors[index % colors.length];
}
