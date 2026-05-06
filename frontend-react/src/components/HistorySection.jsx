import React, { useState } from 'react'

function HistoryCard({ entry, onSelect, onExport }) {
  const dateString = entry.timestamp ? new Date(entry.timestamp).toLocaleString() : 'Unknown date'
  const summary = entry.ai_output?.summary || 'No summary available.'
  const inputText = entry.input_text || 'No input saved.'

  return (
    <article style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }} className="rounded-2xl border p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p style={{ color: 'var(--color-textMuted)' }} className="text-xs uppercase tracking-[0.14em]">{dateString}</p>
          <p style={{ color: 'var(--color-text)' }} className="mt-2 text-sm font-semibold line-clamp-2">{summary}</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onSelect(entry)}
            style={{
              backgroundColor: 'var(--color-primary)',
              color: '#ffffff',
              borderColor: 'var(--color-primary)'
            }}
            className="rounded-xl border px-3 py-2 text-xs font-semibold hover:shadow-lg transition-all"
          >
            Load
          </button>
          <button
            type="button"
            onClick={() => onExport(entry._id || entry.id)}
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
      <p style={{ color: 'var(--color-textMuted)' }} className="mt-3 text-sm line-clamp-3">{inputText}</p>
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

  return (
    <section style={{ backgroundColor: 'var(--color-bgSecondary)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }} className="rounded-2xl shadow-xl border p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p style={{ color: 'var(--color-primary)' }} className="text-xs uppercase tracking-[0.28em] font-bold">History</p>
          <h1 style={{ color: 'var(--color-text)' }} className="mt-2 text-3xl font-extrabold">Analysis History</h1>
          <p style={{ color: 'var(--color-textMuted)' }} className="mt-2 text-sm">Browse past lecture analyses and restore previous summaries quickly.</p>
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
