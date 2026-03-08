/**
 * A style tag card — magazine cover layout.
 * The thumbnail fills the entire card; text overlays the bottom via a dark gradient.
 * Falls back to the gradient palette if no thumbnail is available.
 *
 * mode="library"  — sidebar, ~120px tall. Delete button on hover.
 * mode="select"   — Create panel grid, ~160px tall. Selection ring + checkmark.
 *
 * Props:
 *   tag: StyleTag object
 *   mode: 'library' | 'select'
 *   onClick: () => void
 *   onDelete: () => void        (library mode only)
 *   isSelected: boolean         (select mode only)
 */
export default function StyleTag({ tag, mode = 'library', onClick, onDelete, isSelected }) {
  const { from, to } = tag.gradient
  const height = mode === 'library' ? 'h-[120px]' : 'h-[160px]'

  return (
    <div
      onClick={onClick}
      className={`
        relative group rounded-xl cursor-pointer transition-all duration-200 select-none overflow-hidden
        ${height}
        ${mode === 'select'
          ? isSelected
            ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-950 scale-[1.02] shadow-2xl'
            : 'hover:scale-[1.02] hover:shadow-xl opacity-85 hover:opacity-100'
          : 'hover:scale-[1.02] hover:shadow-xl'
        }
      `}
    >
      {/* ── Background layer ── */}
      {tag.thumbnail ? (
        <img
          src={tag.thumbnail}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        // Fallback: gradient palette when no thumbnail
        <div className={`absolute inset-0 bg-gradient-to-br ${from} ${to}`} />
      )}

      {/* ── Dark gradient overlay — bottom half for text legibility ── */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

      {/* ── Text overlaid on bottom ── */}
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <p className="text-sm font-bold text-white leading-tight drop-shadow-sm">
          {tag.tagName}
        </p>
        <p className="text-xs text-white/60 mt-0.5 line-clamp-2 leading-snug">
          {tag.atmosphere}
        </p>
      </div>

      {/* ── Selected checkmark (select mode) ── */}
      {mode === 'select' && isSelected && (
        <div className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg z-10">
          <svg className="w-3.5 h-3.5 text-zinc-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
      )}

      {/* ── Delete button (library mode) — appears on hover ── */}
      {mode === 'library' && onDelete && (
        <button
          onClick={e => { e.stopPropagation(); onDelete() }}
          className="absolute top-2 right-2 w-6 h-6 bg-black/50 hover:bg-black/80 rounded-full items-center justify-center hidden group-hover:flex transition-all z-10"
          title="Delete tag"
        >
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}
