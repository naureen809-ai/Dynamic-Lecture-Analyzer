import React from 'react'

export default function TopicsSection({ analysisResult, onCopy, copied }) {
  const topics = analysisResult?.topics || []

  return (
    <section className="rounded-2xl shadow-xl border border-slate-800 bg-slate-900/70 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">Topics</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Key Lecture Topics</h2>
        </div>
        <button
          type="button"
          onClick={() => onCopy(topics.join('\n'))}
          disabled={!topics.length}
          className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:border-cyan-400 hover:text-cyan-200 disabled:cursor-not-allowed disabled:text-slate-500"
        >
          {copied ? 'Copied' : 'Copy Topics'}
        </button>
      </div>

      <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/80 p-5 min-h-[180px]">
        {topics.length ? (
          <ul className="space-y-3 text-slate-200">
            {topics.map((topic, idx) => (
              <li key={`${topic}-${idx}`} className="rounded-2xl border border-slate-700 bg-slate-900/80 p-4 text-sm">
                {topic}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-slate-500">No topics are available yet. Analyze a lecture to see the top subjects.</p>
        )}
      </div>
    </section>
  )
}
