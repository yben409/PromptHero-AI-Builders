/**
 * Tab switcher between Analyze and Create modes.
 * Props:
 *   mode: 'analyze' | 'create'
 *   onChange: (mode) => void
 */
export default function ModeToggle({ mode, onChange, tagCount = 0 }) {
  return (
    <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-1 gap-1">
      <button
        onClick={() => onChange('analyze')}
        className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
          mode === 'analyze'
            ? 'bg-gradient-to-r from-violet-600 to-purple-500 text-white shadow-lg shadow-violet-500/20'
            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
        }`}
      >
        Analyze
      </button>
      <button
        onClick={() => onChange('create')}
        className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
          mode === 'create'
            ? 'bg-gradient-to-r from-violet-600 to-purple-500 text-white shadow-lg shadow-violet-500/20'
            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
        }`}
      >
        Create
        {tagCount > 0 && (
          <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${
            mode === 'create' ? 'bg-white/20 text-white' : 'bg-violet-500/20 text-violet-400'
          }`}>
            {tagCount}
          </span>
        )}
      </button>
    </div>
  )
}
