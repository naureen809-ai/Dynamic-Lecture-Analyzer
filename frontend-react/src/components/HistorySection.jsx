import React, { useState } from 'react'

function deriveLectureTitle(entry) {
  const explicitTitle = String(entry?.lecture_title || '').trim()
  if (explicitTitle) return explicitTitle

  const source = String(entry?.input_text || entry?.summary || entry?.ai_output?.summary || '').replace(/\s+/g, ' ').trim()
  if (!source) return 'Untitled Lecture'

  const firstSentence = source.split(/(?<=[.!?])\s+/)[0] || source
  const title = firstSentence.length > 80 ? firstSentence.split(' ').slice(0, 8).join(' ') : firstSentence
  return title.replace(/^[a-z]/, (char) => char.toUpperCase())
}

function TopicDetails({ entry }) {
  const headings = entry?.ai_output?.notes?.headings || []
  const topics = entry?.ai_output?.topics || []
  const summary = entry?.ai_output?.summary || ''

  if (!headings.length && !topics.length && !summary) {
    return <p style={{ color: 'var(--color-textMuted)' }}>No detailed explanation is available for this lecture.</p>
  }

  return (
    <div className="space-y-4">
      {summary ? (
        <div className="rounded-2xl border p-4" style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
          <p className="text-xs uppercase tracking-[0.2em] font-bold" style={{ color: 'var(--color-primary)' }}>Summary</p>
          <p className="mt-2 text-sm leading-6" style={{ color: 'var(--color-text)' }}>{summary}</p>
        </div>
      ) : null}

      {headings.length ? (
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.2em] font-bold" style={{ color: 'var(--color-primary)' }}>Topics Covered</p>
          {headings.map((heading, idx) => (
            <div key={`${heading?.title || 'heading'}-${idx}`} className="rounded-2xl border p-4" style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
              <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>{heading?.title || `Topic ${idx + 1}`}</p>
              {Array.isArray(heading?.points) && heading.points.length ? (
                <ul className="mt-3 space-y-2 text-sm leading-6" style={{ color: 'var(--color-textSecondary)' }}>
                  {heading.points.map((point, pointIndex) => <li key={`${point}-${pointIndex}`}>• {point}</li>)}
                </ul>
              ) : null}
              {Array.isArray(heading?.important_lines) && heading.important_lines.length ? (
                <div className="mt-3 rounded-xl border px-3 py-2 text-sm" style={{ backgroundColor: 'var(--color-bgSecondary)', borderColor: 'var(--color-border)', color: 'var(--color-textMuted)' }}>
                  <p className="font-semibold" style={{ color: 'var(--color-text)' }}>Important lines</p>
                  <ul className="mt-2 space-y-1">
                    {heading.important_lines.map((line, lineIndex) => <li key={`${line}-${lineIndex}`}>• {line}</li>)}
                  </ul>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      {!headings.length && topics.length ? (
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.2em] font-bold" style={{ color: 'var(--color-primary)' }}>Topics Covered</p>
          <div className="flex flex-wrap gap-2">
            {topics.map((topic, idx) => (
              <span key={`${topic}-${idx}`} className="rounded-full border px-3 py-1 text-xs font-semibold" style={{ borderColor: 'var(--color-primary)40', backgroundColor: 'var(--color-primary)15', color: 'var(--color-primary)' }}>
                {topic}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function HistoryCard({ entry, onSelect, onExport }) {
  const [expanded, setExpanded] = useState(false)
  const lectureTitle = deriveLectureTitle(entry)
  const dateString = entry.timestamp ? new Date(entry.timestamp).toLocaleString() : 'Unknown date'

  return (
    <article style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }} className="rounded-2xl border p-4 space-y-4">
      <div role="button" tabIndex={0} onClick={() => setExpanded((value) => !value)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') setExpanded((value) => !value) }} className="w-full cursor-pointer text-left outline-none">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p style={{ color: 'var(--color-textMuted)' }} className="text-xs uppercase tracking-[0.14em]">{dateString}</p>
            <p style={{ color: 'var(--color-text)' }} className="mt-2 text-sm font-semibold line-clamp-2">{lectureTitle}</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                onSelect(entry)
              }}
              style={{
                backgroundColor: 'var(--color-primary)',
                color: '#ffffff',
                borderColor: 'var(--color-primary)'
              }}
              className="rounded-xl border px-3 py-2 text-xs font-semibold hover:shadow-lg transition-all"
            >
              Open report
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                onExport(entry._id || entry.id)
              }}
              style={{
                backgroundColor: 'var(--color-primary)',
                color: '#ffffff',
                borderColor: 'var(--color-primary)'
              }}
              className="rounded-xl border px-3 py-2 text-xs font-semibold hover:shadow-lg transition-all"
            >
              Export
            </button>
          </div>
        </div>
      </div>

      {expanded ? (
        <div className="rounded-2xl border p-4" style={{ backgroundColor: 'var(--color-bgSecondary)', borderColor: 'var(--color-border)' }}>
          <TopicDetails entry={entry} />
        </div>
      ) : null}
    </article>
  )
}

export default function HistorySection({
  history,
  historyLoading,
  historyError,
  searchResults,
  searchLoading,
  searchError,
  onSearch,
  onRefreshHistory,
  onSelectHistory,
  onExportPdf
}) {
  const [query, setQuery] = useState('')

  const titleCount = useMemo(() => history?.length || 0, [history])

  return (
    <section style={{ backgroundColor: 'var(--color-bgSecondary)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }} className="rounded-2xl shadow-xl border p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p style={{ color: 'var(--color-primary)' }} className="text-xs uppercase tracking-[0.28em] font-bold">History</p>
          <h1 style={{ color: 'var(--color-text)' }} className="mt-2 text-3xl font-extrabold">Analysis History</h1>
          <p style={{ color: 'var(--color-textMuted)' }} className="mt-2 text-sm">Browse past lecture analyses and restore previous summaries quickly.</p>
          <p style={{ color: 'var(--color-textMuted)' }} className="mt-2 text-sm">Each row shows only the lecture title. Open it to view the covered topics and explanation.</p>
        </div>
        <button
          type="button"
          onClick={onRefreshHistory}
          disabled={historyLoading}
          style={{
            backgroundColor: 'var(--color-primary)',
            color: '#ffffff',
            borderColor: 'var(--color-primary)'
          }}
          className="rounded-xl border px-4 py-2 text-sm font-semibold hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 transition-all"
        >
          {historyLoading ? 'Refreshing...' : 'Refresh history'}
        </button>
      </div>

      <div style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }} className="mt-6 rounded-2xl border p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search past summaries, topics, or keywords"
            style={{
              backgroundColor: 'var(--color-bgSecondary)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)',
              caretColor: 'var(--color-primary)'
            }}
            className="flex-1 rounded-2xl border px-4 py-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-opacity-50"
          />
          <button
            type="button"
            onClick={() => onSearch(query)}
            disabled={searchLoading}
            style={{
              backgroundColor: 'var(--color-primary)',
              color: '#ffffff'
            }}
            className="rounded-2xl border px-4 py-3 text-sm font-semibold hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 transition-all"
          >
            {searchLoading ? 'Searching...' : 'Search history'}
          </button>
        </div>
        {searchError && <div style={{ color: '#dc2626' }} className="mt-3 text-sm">{searchError}</div>}
      </div>

      <div className="mt-6 space-y-4">
        {searchResults?.length > 0 ? (
          <div className="space-y-4">
            <p style={{ color: 'var(--color-textMuted)' }} className="text-sm">Search results</p>
            {searchResults.map((entry) => (
              <HistoryCard
                key={entry._id || entry.id}
                entry={entry}
                onSelect={onSelectHistory}
                onExport={onExportPdf}
              />
            ))}
          </div>
        ) : (
          <>
            {historyError && (
              <div style={{ backgroundColor: '#fee2e2', borderColor: '#fca5a5', color: '#991b1b' }} className="rounded-2xl border px-4 py-3 text-sm">
                {historyError}
              </div>
            )}
            {!historyLoading && !history?.length && !historyError ? (
              <p style={{ color: 'var(--color-textMuted)' }} className="text-sm">No history available yet. Run an analysis first and your sessions will appear here.</p>
            ) : null}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {history?.map((entry) => (
                <HistoryCard
                  key={entry._id || entry.id}
                  entry={entry}
                  onSelect={onSelectHistory}
                  onExport={onExportPdf}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
