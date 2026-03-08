// Supported image types for Claude vision API
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const MAX_SIZE_MB = 5

/**
 * Validates that a file is a supported image type and within size limits.
 * @param {File} file
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateImageFile(file) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Unsupported format. Please use JPEG, PNG, WebP, or GIF.',
    }
  }
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    return {
      valid: false,
      error: `File too large. Maximum size is ${MAX_SIZE_MB}MB.`,
    }
  }
  return { valid: true }
}

/**
 * Creates a square-cropped thumbnail from a File using a canvas.
 * Returns a small JPEG data URL suitable for storing in localStorage alongside a tag.
 * Fails silently (returns null) since the thumbnail is non-critical.
 * @param {File} file
 * @param {number} size - Output pixel dimensions (square), default 80
 * @returns {Promise<string|null>} - JPEG data URL or null on failure
 */
export function createThumbnail(file, size = 80) {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      // Square-crop from center so the thumbnail fills the frame cleanly
      const min = Math.min(img.width, img.height)
      const sx = (img.width - min) / 2
      const sy = (img.height - min) / 2
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      canvas.getContext('2d').drawImage(img, sx, sy, min, min, 0, 0, size, size)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.75))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve(null)
    }
    img.src = url
  })
}

/**
 * Converts a File to a base64 string + mimeType.
 * Claude's vision API expects raw base64 (no data URL prefix).
 * @param {File} file
 * @returns {Promise<{ base64: string, mimeType: string }>}
 */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      // reader.result is "data:image/jpeg;base64,/9j/4AAQ..." — we strip the prefix
      const base64 = reader.result.split(',')[1]
      resolve({ base64, mimeType: file.type })
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}
