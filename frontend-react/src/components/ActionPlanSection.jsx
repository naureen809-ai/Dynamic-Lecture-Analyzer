import React from 'react'

export default function ActionPlanSection({ analysisResult, onCopy, copied }) {
  const items = analysisResult?.action_items || []

  return (
    <section className="rounded-2xl shadow-xl border border-slate-800 bg-slate-900/70 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">Action Plan</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Next Steps & Learning Goals</h2>
        </div>
        <button
          type="button"
          onClick={() => onCopy(items.join('\n'))}
          disabled={!items.length}
          className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:border-cyan-400 hover:text-cyan-200 disabled:cursor-not-allowed disabled:text-slate-500"
        >
          {copied ? 'Copied' : 'Copy Action Plan'}
        </button>
      </div>

      <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/80 p-5">
        {items.length ? (
          <ol className="space-y-3 text-slate-200 list-decimal pl-5">
            {items.map((item, idx) => (
              <li key={`${item}-${idx}`} className="rounded-2xl border border-slate-700 bg-slate-900/80 p-4 text-sm">
                {item}
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-slate-500">No action plan has been generated yet. Analyze a lecture to populate this section.</p>
        )}
      </div>
    </section>
  )
}
