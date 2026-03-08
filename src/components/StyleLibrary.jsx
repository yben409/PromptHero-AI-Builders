import { useState } from 'react'
import StyleTag from './StyleTag.jsx'
import TagDetail from './TagDetail.jsx'

/**
 * Sidebar showing all saved style tags.
 * Clicking a tag opens the TagDetail modal.
 *
 * Props:
 *   tags: StyleTag[]
 *   onDelete: (id: string) => void
 */
export default function StyleLibrary({ tags, onDelete }) {
  const [selectedTag, setSelectedTag] = useState(null)

  return (
    <>
      <aside className="flex flex-col h-full bg-zinc-900/50 border-l border-zinc-800">
        {/* Header */}
        <div className="px-4 py-4 border-b border-zinc-800">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-200">Style Library</h2>
            <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">
              {tags.length}
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Analyze images to build your library
          </p>
        </div>

        {/* Tag list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {tags.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-2 text-center px-4">
              <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center">
                <svg className="w-5 h-5 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
                </svg>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed">
                No styles yet. Switch to <span className="text-zinc-400 font-medium">Analyze</span> mode and upload an image.
              </p>
            </div>
          ) : (
            tags.map(tag => (
              <StyleTag
                key={tag.id}
                tag={tag}
                mode="library"
                onClick={() => setSelectedTag(tag)}
                onDelete={() => onDelete(tag.id)}
              />
            ))
          )}
        </div>
      </aside>

      {/* Tag detail modal */}
      {selectedTag && (
        <TagDetail tag={selectedTag} onClose={() => setSelectedTag(null)} />
      )}
    </>
  )
}
