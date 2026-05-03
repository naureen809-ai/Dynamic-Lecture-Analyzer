import React, { useState } from 'react'

function HistoryCard({ entry, onSelect, onExport }) {
  const dateString = entry.timestamp ? new Date(entry.timestamp).toLocaleString() : 'Unknown date'
  const summary = entry.ai_output?.summary || 'No summary available.'
  const inputText = entry.input_text || 'No input saved.'

  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-slate-400">{dateString}</p>
          <p className="mt-2 text-sm font-semibold text-slate-100 line-clamp-2">{summary}</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onSelect(entry)}
            className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-200 hover:border-cyan-400 hover:text-cyan-200"
          >
            Load
          </button>
          <button
            type="button"
            onClick={() => onExport(entry._id || entry.id)}
            className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-200 hover:border-cyan-400 hover:text-cyan-200"
          >
            Export
          </button>
        </div>
      </div>
      <p className="mt-3 text-sm text-slate-400 line-clamp-3">{inputText}</p>
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
    <section className="rounded-2xl shadow-xl border border-slate-800 bg-slate-900/70 p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-cyan-300/90">History</p>
          <h1 className="mt-2 text-3xl font-extrabold text-white">Analysis History</h1>
          <p className="mt-2 text-sm text-slate-400">Browse past lecture analyses and restore previous summaries quickly.</p>
        </div>
        <button
          type="button"
          onClick={onRefreshHistory}
          disabled={historyLoading}
          className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-200 hover:border-cyan-400 hover:text-cyan-200 disabled:cursor-not-allowed disabled:text-slate-500"
        >
          {historyLoading ? 'Refreshing...' : 'Refresh history'}
        </button>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search past summaries, topics, or keywords"
            className="flex-1 rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
          <button
            type="button"
            onClick={() => onSearch(query)}
            disabled={searchLoading}
            className="rounded-2xl border border-slate-700 bg-cyan-300 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-200 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
          >
            {searchLoading ? 'Searching...' : 'Search history'}
          </button>
        </div>
        {searchError && <div className="mt-3 text-sm text-rose-300">{searchError}</div>}
      </div>

      <div className="mt-6 space-y-4">
        {searchResults?.length > 0 ? (
          <div className="space-y-4">
            <p className="text-sm text-slate-500">Search results</p>
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
              <div className="rounded-2xl border border-rose-700/40 bg-rose-900/20 px-4 py-3 text-sm text-rose-300">
                {historyError}
              </div>
            )}
            {!historyLoading && !history?.length && !historyError ? (
              <p className="text-sm text-slate-500">No history available yet. Run an analysis first and your sessions will appear here.</p>
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
