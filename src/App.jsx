import { useState } from 'react'
import ModeToggle from './components/ModeToggle.jsx'
import AnalyzePanel from './components/AnalyzePanel.jsx'
import CreatePanel from './components/CreatePanel.jsx'
import StyleLibrary from './components/StyleLibrary.jsx'
import { useStyleLibrary } from './hooks/useStyleLibrary.js'

export default function App() {
  const [mode, setMode] = useState('analyze')
  const { tags, addTag, removeTag } = useStyleLibrary()

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* ── Header ── */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-purple-400 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-bold text-zinc-100 leading-none">Aesthetic Style Builder</h1>
              <p className="text-xs text-zinc-500 mt-0.5">Extract. Save. Create.</p>
            </div>
          </div>

          {/* Mode toggle */}
          <ModeToggle mode={mode} onChange={setMode} tagCount={tags.length} />
        </div>
      </header>

      {/* ── Main layout ── */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        {/* Main content area */}
        <main className="flex-1 p-6 overflow-y-auto">
          {mode === 'analyze' ? (
            <AnalyzePanel addTag={addTag} />
          ) : (
            <CreatePanel tags={tags} />
          )}
        </main>

        {/* Style Library sidebar — always visible */}
        <div className="w-64 shrink-0">
          <StyleLibrary tags={tags} onDelete={removeTag} />
        </div>
      </div>
    </div>
  )
}
