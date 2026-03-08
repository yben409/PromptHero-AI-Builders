/**
 * Modal showing all aesthetic fields of a style tag.
 * Triggered when the user clicks a tag in the library.
 *
 * Props:
 *   tag: StyleTag | null
 *   onClose: () => void
 */
export default function TagDetail({ tag, onClose }) {
  if (!tag) return null

  const { from, to, text } = tag.gradient

  const fields = [
    { label: 'Color Grading', value: tag.colorGrading },
    { label: 'Lighting Mood', value: tag.lightingMood },
    { label: 'Texture Quality', value: tag.textureQuality },
    { label: 'Composition Style', value: tag.compositionStyle },
    { label: 'Contrast Level', value: tag.contrastLevel },
  ]

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Modal panel */}
      <div
        className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header gradient band */}
        <div className={`bg-gradient-to-br ${from} ${to} p-5`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              {/* Source image thumbnail — shown if available */}
              {tag.thumbnail && (
                <img
                  src={tag.thumbnail}
                  alt="Source image"
                  className="w-14 h-14 rounded-xl object-cover shrink-0 ring-2 ring-black/20 shadow-lg"
                />
              )}
              <div className="min-w-0">
                <p className={`text-xs font-medium uppercase tracking-widest ${text} opacity-70`}>Style Tag</p>
                <h2 className={`text-xl font-bold mt-0.5 ${text}`}>{tag.tagName}</h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-black/20 hover:bg-black/40 rounded-full flex items-center justify-center transition-colors shrink-0"
            >
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {/* Atmosphere — the poetic one-liner */}
          <p className={`mt-2 text-sm italic ${text} opacity-80`}>"{tag.atmosphere}"</p>
        </div>

        {/* Aesthetic fields */}
        <div className="p-5 space-y-3">
          {fields.map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{label}</p>
              <p className="text-sm text-zinc-200 mt-0.5 leading-relaxed">{value}</p>
            </div>
          ))}
        </div>

        {/* Generation prompt */}
        <div className="px-5 pb-5">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
              Generation Prompt Fragment
            </p>
            <p className="text-sm text-violet-300 leading-relaxed font-mono">{tag.generationPrompt}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
