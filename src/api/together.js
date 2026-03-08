import { API_ENDPOINTS } from '../constants/models.js'

/**
 * Sends a prompt to Together AI (FLUX.1-schnell) and returns the generated image URL.
 * @param {string} prompt - The fully composed image generation prompt
 * @returns {Promise<string>} - Direct URL to the generated image
 */
export async function generateImage(prompt) {
  const res = await fetch(API_ENDPOINTS.generate, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(err.error || `Server error ${res.status}`)
  }

  const data = await res.json()
  return data.url
}
