import React from 'react'

const LANGUAGES = ['English', 'Hindi', 'Hinglish']

export default function InputSection({
  text,
  language,
  onTextChange,
  onLanguageChange,
  onAnalyze,
  onDownload,
  loading,
  error,
  canAnalyze,
  canDownload
}) {
  return (
    <section className="rounded-2xl shadow-xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs tracking-[0.28em] uppercase text-cyan-300/90">Input Studio</p>
          <h1 className="mt-2 text-3xl md:text-4xl font-extrabold text-white">Lecture Transcript Analyzer</h1>
        </div>
        <select
          value={language}
          onChange={(event) => onLanguageChange(event.target.value)}
          className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-400"
        >
          {LANGUAGES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </header>

      <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
        <label htmlFor="lecture-input" className="text-sm font-medium text-slate-200">
          Paste lecture transcript, notes, or extracted audio text below.
        </label>
        <textarea
          id="lecture-input"
          value={text}
          onChange={(event) => onTextChange(event.target.value)}
          placeholder="Paste your lecture text here..."
          className="mt-3 w-full min-h-[220px] rounded-2xl border border-slate-700 bg-slate-950/90 p-4 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400"
        />

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onAnalyze}
              disabled={!canAnalyze}
              className="inline-flex items-center justify-center rounded-2xl px-6 py-3 text-sm font-semibold text-slate-950 bg-cyan-300 hover:bg-cyan-200 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400 transition-colors"
            >
              {loading ? 'Analyzing...' : 'Analyze Lecture'}
            </button>
            <button
              type="button"
              onClick={onDownload}
              disabled={!canDownload || loading}
              className="inline-flex items-center justify-center rounded-2xl px-6 py-3 text-sm font-semibold text-cyan-200 border border-cyan-500/40 bg-slate-900 hover:bg-slate-800 disabled:cursor-not-allowed disabled:border-slate-700 disabled:text-slate-500 transition-colors"
            >
              Download Report
            </button>
          </div>
          <p className="text-xs text-slate-500">Start with lecture text to unlock structured analysis and summaries.</p>
        </div>

        {error && (
          <div className="mt-4 rounded-2xl border border-rose-700/40 bg-rose-900/20 px-4 py-3 text-sm text-rose-300">
            {error}
          </div>
        )}
      </div>
    </section>
  )
}
