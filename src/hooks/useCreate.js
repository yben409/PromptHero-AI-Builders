import { useState } from 'react'
import { composePrompt } from '../api/claude.js'
import { generateImage } from '../api/together.js'
import { detectStyleConflict } from '../utils/detectStyleConflict.js'

const MAX_HISTORY = 5

export function useCreate(tags) {
  const [userPrompt, setUserPrompt] = useState('')
  const [selectedTagIds, setSelectedTagIds] = useState(new Set())
  const [composedPrompt, setComposedPrompt] = useState(null)
  const [generatedImageUrl, setGeneratedImageUrl] = useState(null)
  const [loadingCompose, setLoadingCompose] = useState(false)
  const [loadingGenerate, setLoadingGenerate] = useState(false)
  const [error, setError] = useState(null)
  const [history, setHistory] = useState([])

  // Pending confirmation state for conflicting styles
  const [conflictInfo, setConflictInfo] = useState(null) // { reason, tagNamesA, tagNamesB, labelA, labelB }
  const [pendingArgs, setPendingArgs] = useState(null)   // { overrideTags, overridePrompt }

  function toggleTag(id) {
    setSelectedTagIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // Shared compose logic — returns { finalPrompt, selectedTags } or throws
  async function _compose(overrideTags, overridePrompt, conflictingStyles = false) {
    const selectedTags = Array.isArray(overrideTags) ? overrideTags : tags.filter(t => selectedTagIds.has(t.id))
    const prompt = overridePrompt !== undefined ? overridePrompt : userPrompt.trim()
    const hasTags = selectedTags.length > 0
    const hasPrompt = prompt.length > 0

    if (!hasPrompt && !hasTags) throw new Error('Enter a prompt or select at least one style tag.')

    setError(null)
    setComposedPrompt(null)
    setGeneratedImageUrl(null)

    let finalPrompt
    if (hasTags) {
      setLoadingCompose(true)
      try {
        finalPrompt = await composePrompt(prompt, selectedTags, conflictingStyles)
        setComposedPrompt(finalPrompt)
      } catch (err) {
        throw err
      } finally {
        setLoadingCompose(false)
      }
    } else {
      finalPrompt = prompt
      setComposedPrompt(finalPrompt)
    }
    return { finalPrompt, selectedTags, prompt }
  }

  function _makeHistoryEntry(url, finalPrompt, prompt, selectedTags) {
    return {
      id: crypto.randomUUID(),
      url,
      prompt: finalPrompt,
      userPrompt: prompt,
      tags: selectedTags.map(t => ({ id: t.id, tagName: t.tagName, thumbnail: t.thumbnail, gradient: t.gradient })),
    }
  }

  async function _runGenerate(overrideTags, overridePrompt, conflictingStyles = false) {
    let composed
    try {
      composed = await _compose(overrideTags, overridePrompt, conflictingStyles)
    } catch (err) {
      setError(err.message)
      return
    }
    const { finalPrompt, selectedTags, prompt } = composed
    setLoadingGenerate(true)
    try {
      const url = await generateImage(finalPrompt)
      setGeneratedImageUrl(url)
      setHistory(prev => [_makeHistoryEntry(url, finalPrompt, prompt, selectedTags), ...prev].slice(0, MAX_HISTORY))
    } catch (err) {
      setError(`Image generation failed: ${err.message}`)
    } finally {
      setLoadingGenerate(false)
    }
  }

  // Generate with conflict check — shows popup if styles clash
  function generate(overrideTags, overridePrompt) {
    const selectedTags = Array.isArray(overrideTags) ? overrideTags : tags.filter(t => selectedTagIds.has(t.id))
    const conflict = detectStyleConflict(selectedTags)

    if (conflict.conflicting) {
      setConflictInfo(conflict)
      setPendingArgs({ overrideTags, overridePrompt })
      return
    }

    _runGenerate(overrideTags, overridePrompt, false)
  }

  // Called when user confirms merge despite conflict
  function confirmConflictMerge() {
    const { overrideTags, overridePrompt } = pendingArgs
    setConflictInfo(null)
    setPendingArgs(null)
    _runGenerate(overrideTags, overridePrompt, true)
  }

  // Called when user cancels the conflict popup
  function cancelConflict() {
    setConflictInfo(null)
    setPendingArgs(null)
  }

  // Re-run FLUX on the existing composed prompt — no recompose
  async function regenerate() {
    if (!composedPrompt) return
    setGeneratedImageUrl(null)
    setLoadingGenerate(true)
    try {
      const url = await generateImage(composedPrompt)
      setGeneratedImageUrl(url)
    } catch (err) {
      setError(`Image generation failed: ${err.message}`)
    } finally {
      setLoadingGenerate(false)
    }
  }

  // Pick random tags, keep current text prompt
  function randomize() {
    if (tags.length === 0) return
    const count = Math.floor(Math.random() * Math.min(3, tags.length)) + 1
    const picked = [...tags].sort(() => Math.random() - 0.5).slice(0, count)
    setSelectedTagIds(new Set(picked.map(t => t.id)))
    generate(picked)
  }

  function restoreFromHistory(entry) {
    setComposedPrompt(entry.prompt)
    setUserPrompt(entry.userPrompt)
    setGeneratedImageUrl(entry.url)
    const libraryIds = new Set(tags.map(t => t.id))
    setSelectedTagIds(new Set(entry.tags.map(t => t.id).filter(id => libraryIds.has(id))))
    setError(null)
  }

  function reset() {
    setUserPrompt('')
    setSelectedTagIds(new Set())
    setComposedPrompt(null)
    setGeneratedImageUrl(null)
    setError(null)
  }

  const isLoading = loadingCompose || loadingGenerate

  return {
    userPrompt, setUserPrompt,
    selectedTagIds, toggleTag,
    composedPrompt,
    generatedImageUrl,
    loadingCompose, loadingGenerate, isLoading,
    error,
    conflictInfo, confirmConflictMerge, cancelConflict,
    history, restoreFromHistory,
    generate, regenerate, randomize, reset,
  }
}
