import React from 'react'

export default function KeywordsSection({ analysisResult, onCopy, copied }) {
  const keywords = analysisResult?.keywords || []

  return (
    <section className="rounded-2xl shadow-xl border border-slate-800 bg-slate-900/70 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">Keywords</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Most Important Keywords</h2>
        </div>
        <button
          type="button"
          onClick={() => onCopy(keywords.join(', '))}
          disabled={!keywords.length}
          className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:border-cyan-400 hover:text-cyan-200 disabled:cursor-not-allowed disabled:text-slate-500"
        >
          {copied ? 'Copied' : 'Copy Keywords'}
        </button>
      </div>

      <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/80 p-5 min-h-[180px]">
        {keywords.length ? (
          <div className="flex flex-wrap gap-3">
            {keywords.map((keyword, idx) => (
              <span key={`${keyword}-${idx}`} className="rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-200">
                {keyword}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-slate-500">Keywords will appear once the lecture has been analyzed.</p>
        )}
      </div>
    </section>
  )
}
