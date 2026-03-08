import { useState } from 'react'
import { validateImageFile, fileToBase64, createThumbnail } from '../utils/imageUtils.js'
import { analyzeImage } from '../api/claude.js'

/**
 * Manages the full analyze flow:
 * file selection → base64 conversion → Claude analysis → save to library
 *
 * @param {Function} addTag - from useStyleLibrary
 */
export function useAnalyze(addTag) {
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [saved, setSaved] = useState(false)

  /**
   * Validates and stages a new image file for analysis.
   * Creates a local object URL for preview display.
   * @param {File} file
   */
  function handleFile(file) {
    const { valid, error: validationError } = validateImageFile(file)
    if (!valid) {
      setError(validationError)
      return
    }
    setError(null)
    setResult(null)
    setSaved(false)
    setImageFile(file)

    // Revoke any previous object URL to avoid memory leaks
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setImagePreview(URL.createObjectURL(file))
  }

  /**
   * Converts the staged image to base64 and sends it to Claude for analysis.
   */
  async function analyze() {
    if (!imageFile) return
    setLoading(true)
    setError(null)
    try {
      const { base64, mimeType } = await fileToBase64(imageFile)
      const data = await analyzeImage(base64, mimeType)
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Saves the current analysis result + a small source thumbnail to the style library.
   * Thumbnail generation is async but non-blocking — the tag saves even if it fails.
   */
  async function saveToLibrary() {
    if (!result || saved) return
    const thumbnail = imageFile ? await createThumbnail(imageFile, 160) : null
    addTag({ ...result, thumbnail })
    setSaved(true)
  }

  /**
   * Resets the entire analyze panel back to initial state.
   */
  function reset() {
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setImageFile(null)
    setImagePreview(null)
    setResult(null)
    setError(null)
    setSaved(false)
  }

  return {
    imageFile,
    imagePreview,
    result,
    loading,
    error,
    saved,
    handleFile,
    analyze,
    saveToLibrary,
    reset,
  }
}
