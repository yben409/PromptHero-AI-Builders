import { useRef, useState } from 'react'

/**
 * Drag-and-drop image uploader with click-to-browse fallback.
 * Shows an image preview once a file is selected.
 *
 * Props:
 *   onFile: (File) => void
 *   imagePreview: string | null  — object URL for preview
 *   disabled: boolean
 */
export default function DropZone({ onFile, imagePreview, disabled }) {
  const inputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)

  function handleDragOver(e) {
    e.preventDefault()
    if (!disabled) setIsDragging(true)
  }

  function handleDragLeave(e) {
    e.preventDefault()
    setIsDragging(false)
  }

  function handleDrop(e) {
    e.preventDefault()
    setIsDragging(false)
    if (disabled) return
    const file = e.dataTransfer.files?.[0]
    if (file) onFile(file)
  }

  function handleChange(e) {
    const file = e.target.files?.[0]
    if (file) onFile(file)
    // Reset input so the same file can be re-selected
    e.target.value = ''
  }

  return (
    <div
      onClick={() => !disabled && inputRef.current?.click()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative rounded-2xl border-2 border-dashed transition-all duration-200 overflow-hidden
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${isDragging
          ? 'border-violet-400 bg-violet-500/10 scale-[1.01]'
          : imagePreview
            ? 'border-zinc-700 hover:border-zinc-500'
            : 'border-zinc-700 hover:border-violet-500/60 hover:bg-violet-500/5'
        }
      `}
      style={{ minHeight: '280px' }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleChange}
        disabled={disabled}
      />

      {imagePreview ? (
        // Preview mode — show the image, with a subtle re-upload overlay on hover
        <>
          <img
            src={imagePreview}
            alt="Upload preview"
            className="w-full h-full object-cover"
            style={{ maxHeight: '400px' }}
          />
          <div className="absolute inset-0 bg-zinc-950/0 hover:bg-zinc-950/60 transition-all duration-200 flex items-center justify-center">
            <span className="opacity-0 hover:opacity-100 transition-opacity duration-200 text-zinc-200 text-sm font-medium bg-zinc-900/80 px-4 py-2 rounded-lg border border-zinc-700">
              Click to change image
            </span>
          </div>
        </>
      ) : (
        // Empty state
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-8">
          <div className="w-14 h-14 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center">
            <svg className="w-7 h-7 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-zinc-200 font-medium">Drop an image here</p>
            <p className="text-zinc-500 text-sm mt-1">or click to browse · JPEG, PNG, WebP, GIF · max 5MB</p>
          </div>
          {isDragging && (
            <p className="text-violet-400 text-sm font-medium animate-pulse">Release to upload</p>
          )}
        </div>
      )}
    </div>
  )
}
