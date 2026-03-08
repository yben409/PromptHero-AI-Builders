import { useState } from 'react'
import StyleTag from './StyleTag.jsx'
import { useCreate } from '../hooks/useCreate.js'

export default function CreatePanel({ tags }) {
  const {
    userPrompt, setUserPrompt,
    selectedTagIds, toggleTag,
    composedPrompt,
    generatedImageUrl,
    loadingCompose, loadingGenerate, isLoading,
    error,
    conflictInfo, confirmConflictMerge, cancelConflict,
    history, restoreFromHistory,
    generate, regenerate, randomize,
  } = useCreate(tags)

  const [copied, setCopied] = useState(false)

  function copyPrompt() {
    if (!composedPrompt) return
    navigator.clipboard.writeText(composedPrompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const selectedCount = selectedTagIds.size
  const selectedTags = tags.filter(t => selectedTagIds.has(t.id))

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-zinc-100">Create with Style</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Describe your subject, select style tags, and let Claude blend them into a generation prompt.
        </p>
      </div>

      {/* Text prompt */}
      <div>
        <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
          Your Prompt
        </label>
        <textarea
          value={userPrompt}
          onChange={e => setUserPrompt(e.target.value)}
          placeholder="e.g. a woman sitting by a window, a mountain at dawn, a city at night…"
          disabled={isLoading}
          rows={3}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 resize-none focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/30 transition-all disabled:opacity-50"
        />
      </div>

      {/* Style tag selector + Feature 1: dominance sliders */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            Apply Style Tags
          </label>
          {selectedCount > 0 && (
            <span className="text-xs text-violet-400 font-medium">{selectedCount} selected</span>
          )}
        </div>

        {tags.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 text-center">
            <p className="text-sm text-zinc-500">
              No styles yet.{' '}
              <span className="text-zinc-400">Switch to Analyze mode to extract styles from images.</span>
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {tags.map(tag => (
              <StyleTag
                key={tag.id}
                tag={tag}
                mode="select"
                isSelected={selectedTagIds.has(tag.id)}
                onClick={() => toggleTag(tag.id)}
              />
            ))}
          </div>
        )}
      </div>


      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Blend preview — overlapping thumbnails when 2+ tags selected */}
      {selectedTags.length >= 2 && (
        <div className="flex items-center gap-3">
          <div className="flex">
            {selectedTags.map((tag, i) => (
              <div
                key={tag.id}
                style={{ marginLeft: i > 0 ? '-10px' : 0, zIndex: selectedTags.length - i }}
                className="w-9 h-9 rounded-full border-2 border-zinc-950 overflow-hidden shrink-0 shadow-md"
              >
                {tag.thumbnail
                  ? <img src={tag.thumbnail} className="w-full h-full object-cover" alt="" />
                  : <div className={`w-full h-full bg-gradient-to-br ${tag.gradient.from} ${tag.gradient.to}`} />
                }
              </div>
            ))}
          </div>
          <p className="text-xs text-zinc-400">{selectedTags.length} styles will be blended</p>
        </div>
      )}

      {/* Generate buttons */}
      <div className="flex gap-2">
        <button
          onClick={generate}
          disabled={isLoading}
          className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 text-white font-medium text-sm hover:from-violet-500 hover:to-purple-400 transition-all shadow-lg shadow-violet-500/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
        >
          Generate
        </button>
      </div>

      {/* Two-step pipeline progress */}
      {isLoading && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <div className="flex items-start gap-4">
            <div className="relative flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                loadingCompose ? 'bg-violet-500/20 border-2 border-violet-500' : 'bg-emerald-500/20 border-2 border-emerald-500'
              }`}>
                {loadingCompose ? (
                  <span className="w-3.5 h-3.5 border-2 border-violet-400/40 border-t-violet-400 rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                )}
              </div>
              <div className={`w-px flex-1 mt-1 min-h-[24px] transition-colors duration-500 ${loadingGenerate ? 'bg-emerald-500/40' : 'bg-zinc-700'}`} />
            </div>
            <div className="pb-6">
              <p className={`text-sm font-medium ${loadingCompose ? 'text-violet-300' : 'text-emerald-400'}`}>
                {loadingCompose ? 'Composing style with Claude…' : 'Style composed'}
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">
                {loadingCompose ? 'Blending aesthetic descriptors into a unified prompt' : 'Prompt ready — passing to FLUX'}
              </p>
              {composedPrompt && !loadingCompose && (
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed italic border-l-2 border-emerald-500/30 pl-3">
                  {composedPrompt}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 border-2 ${
              loadingGenerate ? 'bg-violet-500/20 border-violet-500' : 'bg-zinc-800 border-zinc-700'
            }`}>
              {loadingGenerate
                ? <span className="w-3.5 h-3.5 border-2 border-violet-400/40 border-t-violet-400 rounded-full animate-spin" />
                : <span className="w-2 h-2 rounded-full bg-zinc-600" />
              }
            </div>
            <div>
              <p className={`text-sm font-medium ${loadingGenerate ? 'text-violet-300' : 'text-zinc-500'}`}>
                {loadingGenerate ? 'Generating image with FLUX…' : 'Generating image with FLUX'}
              </p>
              <p className="text-xs text-zinc-600 mt-0.5">
                {loadingGenerate ? 'FLUX.1-schnell rendering at 1024×1024' : 'Waiting for style composition'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Composed prompt — persists after generation */}
      {composedPrompt && !isLoading && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Composed Prompt</p>
            <button
              onClick={copyPrompt}
              className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors px-2 py-1 bg-zinc-800 hover:bg-zinc-700 rounded-lg"
            >
              {copied ? (
                <>
                  <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                  </svg>
                  Copy
                </>
              )}
            </button>
          </div>
          <p className="text-sm text-zinc-300 leading-relaxed">{composedPrompt}</p>
        </div>
      )}

      {/* Result card */}
      {generatedImageUrl && !loadingGenerate && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="flex">
            {/* Style sources column */}
            {selectedTags.length > 0 && (
              <div className="w-36 shrink-0 border-r border-zinc-800 flex flex-col">
                <div className="px-3 py-2.5 border-b border-zinc-800">
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Style Sources</p>
                  <p className="text-xs text-zinc-600 mt-0.5">{selectedTags.length} tag{selectedTags.length > 1 ? 's' : ''} blended</p>
                </div>
                <div className="flex flex-col flex-1">
                  {selectedTags.map((tag, i) => (
                    <div key={tag.id} className={`relative flex-1 min-h-[80px] ${i > 0 ? 'border-t border-zinc-800' : ''}`}>
                      {tag.thumbnail ? (
                        <>
                          <img src={tag.thumbnail} alt={tag.tagName} className="absolute inset-0 w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                        </>
                      ) : (
                        <div className={`absolute inset-0 bg-gradient-to-br ${tag.gradient.from} ${tag.gradient.to}`} />
                      )}
                      <p className="absolute bottom-2 left-2 right-2 text-xs font-semibold text-white leading-tight drop-shadow-sm">{tag.tagName}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Generated image(s) */}
            <div className="flex flex-col flex-1 min-w-0">
              <div className="px-3 py-2.5 border-b border-zinc-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Generated Result</p>
                  <p className="text-xs text-zinc-600 mt-0.5">FLUX.1-schnell · 1024×1024</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={regenerate}
                    title="Regenerate — rerun FLUX on the same prompt"
                    className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-800 rounded-lg hover:bg-zinc-700"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                    Regenerate
                  </button>
                  <a
                    href={generatedImageUrl}
                    download="aesthetic-creation.png"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-800 rounded-lg hover:bg-zinc-700"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    Download
                  </a>
                </div>
              </div>

              <img src={generatedImageUrl} alt="Generated result" className="w-full object-cover" />
            </div>
          </div>
        </div>
      )}

      {/* Conflict confirmation modal */}
      {conflictInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-100">Style Conflict Detected</p>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  These tags have conflicting <span className="text-amber-400 font-medium">{conflictInfo.reason}</span>.
                  Blending them may favor one style over the other.
                </p>
              </div>
            </div>

            <div className="flex gap-2 mb-5">
              <div className="flex-1 bg-zinc-800 rounded-lg px-3 py-2 text-center">
                <p className="text-xs text-zinc-500 mb-1">Style A</p>
                <p className="text-xs font-semibold text-zinc-200 leading-tight">{conflictInfo.tagNamesA.join(', ')}</p>
                <p className="text-xs text-zinc-500 mt-0.5 italic">{conflictInfo.labelA}</p>
              </div>
              <div className="flex items-center text-zinc-600 font-bold text-sm">vs</div>
              <div className="flex-1 bg-zinc-800 rounded-lg px-3 py-2 text-center">
                <p className="text-xs text-zinc-500 mb-1">Style B</p>
                <p className="text-xs font-semibold text-zinc-200 leading-tight">{conflictInfo.tagNamesB.join(', ')}</p>
                <p className="text-xs text-zinc-500 mt-0.5 italic">{conflictInfo.labelB}</p>
              </div>
            </div>

            <p className="text-xs text-zinc-500 mb-4 leading-relaxed">
              If you continue, Claude will use a creative bridge technique — like selective color pop or split-toning — to honor both styles at full strength rather than letting one dominate.
            </p>

            <div className="flex gap-2">
              <button
                onClick={cancelConflict}
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300 text-sm font-medium hover:bg-zinc-700 transition-all"
              >
                Go back
              </button>
              <button
                onClick={confirmConflictMerge}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg shadow-amber-500/20"
              >
                Merge anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Session history */}
      {history.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
            Session History · {history.length} generation{history.length > 1 ? 's' : ''}
          </p>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {history.map((entry, i) => (
              <button
                key={entry.id}
                onClick={() => restoreFromHistory(entry)}
                className="shrink-0 w-44 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-600 transition-all hover:scale-[1.02] text-left"
              >
                <div className="relative h-28">
                  <img src={entry.url} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  {i === 0 && (
                    <span className="absolute top-2 left-2 bg-violet-600 text-white text-xs font-semibold px-1.5 py-0.5 rounded-md">
                      Latest
                    </span>
                  )}
                </div>
                <div className="p-2.5">
                  <p className="text-xs text-zinc-300 leading-relaxed line-clamp-2">{entry.prompt}</p>
                  {entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {entry.tags.map(t => (
                        <span key={t.id} className="text-xs text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded-md">
                          {t.tagName}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
