import { useState, useEffect } from 'react'
import { GRADIENT_PALETTE } from '../constants/palette.js'

const STORAGE_KEY = 'aesthetic-style-library'

/**
 * Manages the style tag library with localStorage persistence.
 * Tags are prepended (newest first) and each gets a gradient from the palette.
 */
export function useStyleLibrary() {
  const [tags, setTags] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  // Persist to localStorage on every change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tags))
  }, [tags])

  /**
   * Adds a new tag from Claude's aesthetic analysis result.
   * Assigns a gradient based on total tag count (cycles through palette).
   * @param {Object} aestheticData - The raw JSON from Claude
   * @returns {Object} The created tag with id and gradient
   */
  function addTag(aestheticData) {
    // Use total-ever count by reading current length before adding
    const gradient = GRADIENT_PALETTE[tags.length % GRADIENT_PALETTE.length]
    const newTag = {
      id: crypto.randomUUID(),
      ...aestheticData,
      gradient,
      createdAt: Date.now(),
    }
    setTags(prev => [newTag, ...prev])
    return newTag
  }

  /**
   * Removes a tag by id.
   * @param {string} id
   */
  function removeTag(id) {
    setTags(prev => prev.filter(tag => tag.id !== id))
  }

  return { tags, addTag, removeTag }
}
