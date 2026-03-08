import DropZone from './DropZone.jsx'
import { useAnalyze } from '../hooks/useAnalyze.js'

/**
 * Full Analyze mode UI.
 * Manages: image upload → Claude analysis → save to library.
 *
 * Props:
 *   addTag: (aestheticData) => void   — from useStyleLibrary
 */
export default function AnalyzePanel({ addTag }) {
  const {
    imagePreview,
    result,
    loading,
    error,
    saved,
    handleFile,
    analyze,
    saveToLibrary,
    reset,
  } = useAnalyze(addTag)

  const fields = result
    ? [
        { label: 'Color Grading', value: result.colorGrading },
        { label: 'Lighting Mood', value: result.lightingMood },
        { label: 'Texture Quality', value: result.textureQuality },
        { label: 'Composition Style', value: result.compositionStyle },
        { label: 'Contrast Level', value: result.contrastLevel },
        { label: 'Atmosphere', value: result.atmosphere },
      ]
    : []

  return (
    <div className="flex flex-col gap-6">
      {/* Section header */}
      <div>
        <h1 className="text-lg font-semibold text-zinc-100">Analyze Aesthetic</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Upload any image. Claude will decode its visual DNA — not what's in it, but how it <em>feels</em>.
        </p>
      </div>

      {/* Drop zone */}
      <DropZone
        onFile={handleFile}
        imagePreview={imagePreview}
        disabled={loading}
      />

      {/* Error message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        {imagePreview && !loading && (
          <>
            <button
              onClick={analyze}
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 text-white font-medium text-sm hover:from-violet-500 hover:to-purple-400 transition-all shadow-lg shadow-violet-500/20 active:scale-[0.98]"
            >
              Analyze Image
            </button>
            <button
              onClick={reset}
              className="px-4 py-3 rounded-xl bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700 transition-all text-sm"
            >
              Clear
            </button>
          </>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center gap-3 py-10">
          <div className="w-10 h-10 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
          <p className="text-zinc-400 text-sm">Claude is reading the aesthetic DNA…</p>
        </div>
      )}

      {/* Result card */}
      {result && !loading && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          {/* Tag name header */}
          <div className={`bg-gradient-to-br ${result.gradient?.from || 'from-violet-600'} ${result.gradient?.to || 'to-purple-400'} p-5`}>
            <p className="text-xs font-medium uppercase tracking-widest text-white/70">Detected Style</p>
            <h3 className="text-2xl font-bold text-white mt-1">{result.tagName}</h3>
            <p className="text-sm italic text-white/80 mt-1">"{result.atmosphere}"</p>
          </div>

          {/* Aesthetic fields */}
          <div className="p-5 grid grid-cols-1 gap-3">
            {fields.slice(0, 5).map(({ label, value }) => (
              <div key={label} className="flex gap-3">
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider w-36 shrink-0 pt-0.5">{label}</span>
                <span className="text-sm text-zinc-200 leading-relaxed">{value}</span>
              </div>
            ))}
          </div>

          {/* Generation prompt fragment */}
          <div className="px-5 pb-5">
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                Generation Prompt Fragment
              </p>
              <p className="text-sm text-violet-300 leading-relaxed font-mono">{result.generationPrompt}</p>
            </div>
          </div>

          {/* Save button */}
          <div className="px-5 pb-5">
            <button
              onClick={saveToLibrary}
              disabled={saved}
              className={`w-full py-3 rounded-xl font-medium text-sm transition-all ${
                saved
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 hover:border-zinc-500 active:scale-[0.98]'
              }`}
            >
              {saved ? '✓ Saved to Library' : 'Save to Style Library'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
