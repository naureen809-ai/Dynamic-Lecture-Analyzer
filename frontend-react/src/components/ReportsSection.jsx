import React from 'react'

function SectionBlock({ title, children }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <div className="mt-3 text-slate-200 space-y-3">{children}</div>
    </div>
  )
}

function BadgeList({ items }) {
  if (!items?.length) {
    return <p className="text-slate-500">No keywords available.</p>
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, idx) => (
        <span key={`${item}-${idx}`} className="rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-200">
          {item}
        </span>
      ))}
    </div>
  )
}

export default function ReportsSection({ analysisResult, onCopy, copied, onExportPdf, exportId }) {
  const result = analysisResult || {}

  const reportText = [
    result.summary,
    ...(result.topics || []),
    ...(result.action_items || []),
    ...(result.keywords || []),
    result.speaker_feedback,
    ...(result.notes?.short_notes || []),
    ...(result.questions?.short_questions || []),
    ...(result.questions?.viva_questions || [])
  ].filter(Boolean).join('\n\n')

  return (
    <section className="rounded-2xl shadow-xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-cyan-300/90">Reports</p>
          <h1 className="mt-2 text-3xl font-extrabold text-white">Full Lecture Report</h1>
          <p className="mt-2 text-sm text-slate-400">Export or copy the complete structured analysis for review and study.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => onCopy(reportText)}
            disabled={!reportText}
            className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-200 hover:border-cyan-400 hover:text-cyan-200 disabled:cursor-not-allowed disabled:text-slate-500"
          >
            {copied ? 'Copied' : 'Copy Full Report'}
          </button>
          <button
            type="button"
            onClick={() => onExportPdf(exportId)}
            disabled={!exportId}
            className="rounded-2xl border border-slate-700 bg-cyan-300 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-200 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
          >
            Export PDF
          </button>
        </div>
      </div>

      {!analysisResult ? (
        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-950/80 p-6 text-slate-500">
          Run an analysis to generate a complete lecture report.
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          <SectionBlock title="Summary">
            <p>{result.summary || 'No summary available.'}</p>
          </SectionBlock>

          <SectionBlock title="Topics">
            {result.topics?.length ? (
              <ul className="list-disc pl-5 space-y-2 text-slate-200">
                {result.topics.map((topic, idx) => (
                  <li key={`${topic}-${idx}`}>{topic}</li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500">No topics identified.</p>
            )}
          </SectionBlock>

          <SectionBlock title="Action Plan">
            {result.action_items?.length ? (
              <ul className="list-decimal pl-5 space-y-2 text-slate-200">
                {result.action_items.map((item, idx) => (
                  <li key={`${item}-${idx}`}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500">No action items found.</p>
            )}
          </SectionBlock>

          <SectionBlock title="Keywords">
            <BadgeList items={result.keywords} />
          </SectionBlock>

          <SectionBlock title="Speaker Feedback">
            <p>{result.speaker_feedback || 'No speaker feedback generated.'}</p>
          </SectionBlock>
        </div>
      )}
    </section>
  )
}
