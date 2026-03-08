/**
 * Returns a human-readable summary of a style tag's aesthetic fields
 * for use in UI tooltips or previews.
 * @param {Object} tag
 * @returns {string}
 */
export function getTagSummary(tag) {
  return [tag.colorGrading, tag.lightingMood, tag.atmosphere]
    .filter(Boolean)
    .join(' · ')
}

/**
 * Truncates a string to a max length, appending ellipsis if needed.
 * Used for displaying long generated prompts inline.
 * @param {string} str
 * @param {number} maxLength
 * @returns {string}
 */
export function truncate(str, maxLength = 120) {
  if (!str || str.length <= maxLength) return str
  return str.slice(0, maxLength).trimEnd() + '…'
}