import React from 'react'

const LANGUAGES = [
  'English',
  'Hindi',
  'Hinglish',
  'Bengali',
  'Tamil',
  'Telugu',
  'Marathi',
  'Gujarati',
  'Punjabi',
  'Urdu',
  'Kannada',
  'Malayalam',
  'Odia',
  'Assamese',
  'Sanskrit',
  'Konkani',
  'Maithili',
  'Dogri',
  'Manipuri',
  'Bodo',
  'Santhali',
  'Kashmiri',
  'Sindhi',
  'Nepali'
]

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
    <section className="rounded-2xl shadow-2xl border dark:border-slate-700/50 light:border-slate-300 dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900/95 dark:to-slate-950 light:bg-white p-6 md:p-8 dark:hover:shadow-cyan-500/10 light:hover:shadow-slate-400/10 transition-all duration-300">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pb-6 border-b dark:border-slate-700/30 light:border-slate-200">
        <div>
          <p className="text-xs tracking-[0.28em] uppercase font-bold dark:text-cyan-400/80 light:text-cyan-600/80">📝 Input Studio</p>
          <h1 className="mt-3 text-3xl md:text-4xl font-black dark:text-white light:text-slate-900">Lecture Analyzer</h1>
        </div>
        <select
          value={language}
          onChange={(event) => onLanguageChange(event.target.value)}
          className="rounded-xl border dark:border-slate-600/50 light:border-slate-300 dark:bg-slate-900/70 light:bg-slate-100 px-4 py-2 text-sm font-semibold dark:text-slate-100 light:text-slate-900 focus:outline-none focus:ring-2 dark:focus:ring-cyan-400/50 light:focus:ring-cyan-400 dark:hover:border-slate-500 light:hover:border-slate-400 transition-all"
        >
          {LANGUAGES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </header>

      <div className="mt-6 rounded-2xl border dark:border-slate-700/30 light:border-slate-300 dark:bg-slate-900/40 light:bg-slate-50 p-6">
        <label htmlFor="lecture-input" className="text-sm font-bold dark:text-slate-300 light:text-slate-700">
          📄 Paste your lecture transcript, notes, or extracted audio text
        </label>
        <textarea
          id="lecture-input"
          value={text}
          onChange={(event) => onTextChange(event.target.value)}
          placeholder="Paste your lecture content here and let AI analyze it..."
          className="mt-4 w-full min-h-[220px] rounded-xl border dark:border-slate-600/50 light:border-slate-300 dark:bg-slate-900/60 light:bg-white p-4 text-sm dark:text-slate-100 light:text-slate-900 dark:placeholder:text-slate-500 light:placeholder:text-slate-400 focus:outline-none focus:ring-2 dark:focus:ring-cyan-400/50 light:focus:ring-cyan-400 dark:hover:border-slate-500 light:hover:border-slate-400 transition-all resize-none"
        />

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onAnalyze}
              disabled={!canAnalyze}
              className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-bold dark:text-white light:text-white dark:bg-gradient-to-r dark:from-cyan-500 dark:to-cyan-600 dark:hover:from-cyan-400 dark:hover:to-cyan-500 light:bg-gradient-to-r light:from-cyan-500 light:to-cyan-600 light:hover:from-cyan-400 light:hover:to-cyan-500 dark:disabled:cursor-not-allowed dark:disabled:from-slate-700 dark:disabled:to-slate-700 dark:disabled:text-slate-400 light:disabled:cursor-not-allowed light:disabled:from-slate-300 light:disabled:to-slate-300 light:disabled:text-slate-500 transition-all dark:shadow-lg dark:hover:shadow-cyan-500/40 light:shadow-lg light:hover:shadow-cyan-400/40 dark:disabled:shadow-none light:disabled:shadow-none"
            >
              {loading ? '⏳ Analyzing...' : '🚀 Analyze Lecture'}
            </button>
            <button
              type="button"
              onClick={onDownload}
              disabled={!canDownload || loading}
              className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold dark:text-cyan-300 light:text-cyan-600 dark:border dark:border-cyan-500/40 light:border light:border-cyan-400 dark:bg-slate-900/70 light:bg-slate-100/70 dark:hover:bg-slate-800/70 light:hover:bg-slate-200/70 dark:hover:border-cyan-400/60 light:hover:border-cyan-500 transition-all dark:shadow-md dark:hover:shadow-cyan-500/20 light:shadow-md light:hover:shadow-cyan-400/20 dark:disabled:cursor-not-allowed dark:disabled:border-slate-700 dark:disabled:text-slate-500 light:disabled:cursor-not-allowed light:disabled:border-slate-300 light:disabled:text-slate-400 dark:disabled:shadow-none light:disabled:shadow-none"
            >
              📥 Download Report
            </button>
          </div>
          <p className="text-xs dark:text-slate-400 light:text-slate-600 font-semibold">✨ Powered by AI - Generate structured insights from your lectures</p>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border dark:border-rose-700/40 light:border-rose-300 dark:bg-rose-900/20 light:bg-rose-100 px-4 py-3 text-sm dark:text-rose-300 light:text-rose-700 font-semibold">
            ⚠️ {error}
          </div>
        )}
      </div>
    </section>
  )
}
