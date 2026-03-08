import { API_ENDPOINTS } from '../constants/models.js'

/**
 * Sends an image to the server for aesthetic analysis via Claude vision.
 * @param {string} base64 - Raw base64 image data (no data URL prefix)
 * @param {string} mimeType - e.g. "image/jpeg"
 * @returns {Promise<Object>} - Aesthetic JSON: { tagName, colorGrading, lightingMood, ... }
 */
export async function analyzeImage(base64, mimeType) {
  const res = await fetch(API_ENDPOINTS.analyze, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ base64, mimeType }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(err.error || `Server error ${res.status}`)
  }

  return res.json()
}

/**
 * Asks Claude to blend a user prompt + style tags into a unified image gen prompt.
 * @param {string} userPrompt - The user's subject/concept text (may be empty)
 * @param {Object[]} styleTags - Array of style tag objects from the library
 * @returns {Promise<string>} - The blended prompt string
 */
export async function composePrompt(userPrompt, styleTags, conflictingStyles = false) {
  const res = await fetch(API_ENDPOINTS.compose, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userPrompt, styleTags, conflictingStyles }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(err.error || `Server error ${res.status}`)
  }

  const data = await res.json()
  return data.prompt
}
