import React from 'react'

function SectionBlock({ title, children }) {
  return (
    <div className="rounded-2xl border dark:border-slate-800 light:border-slate-300 dark:bg-slate-950/80 light:bg-slate-100 p-5 transition-colors duration-400" style={{ backgroundColor: 'var(--color-bgSecondary)', borderColor: 'var(--color-border)' }}>
      <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>{title}</h3>
      <div className="mt-3 space-y-3" style={{ color: 'var(--color-textSecondary)' }}>{children}</div>
    </div>
  )
}

function BadgeList({ items }) {
  if (!items?.length) {
    return <p style={{ color: 'var(--color-textMuted)' }}>No keywords available.</p>
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, idx) => (
        <span key={`${item}-${idx}`} className="rounded-full border px-3 py-1 text-xs font-semibold transition-colors duration-400" style={{ borderColor: `${window.getComputedStyle(document.documentElement).getPropertyValue('--color-primary')}66`, backgroundColor: `${window.getComputedStyle(document.documentElement).getPropertyValue('--color-primary')}1a`, color: 'var(--color-primary)' }}>
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
    <section className="rounded-2xl shadow-xl border dark:border-slate-800 light:border-slate-300 dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 light:bg-white p-6 transition-colors duration-400" style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em]" style={{ color: 'var(--color-primary)' }}>Reports</p>
          <h1 className="mt-2 text-3xl font-extrabold" style={{ color: 'var(--color-text)' }}>Full Lecture Report</h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--color-textMuted)' }}>Export or copy the complete structured analysis for review and study.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => onCopy(reportText)}
            disabled={!reportText}
            className="rounded-2xl border px-4 py-3 text-sm font-semibold transition-colors duration-400 hover:border-opacity-100 disabled:cursor-not-allowed"
            style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bgSecondary)', color: 'var(--color-text)' }}
          >
            {copied ? 'Copied' : 'Copy Full Report'}
          </button>
          <button
            type="button"
            onClick={() => onExportPdf(exportId)}
            disabled={!exportId}
            className="rounded-2xl border px-4 py-3 text-sm font-semibold transition-colors duration-400 disabled:cursor-not-allowed"
            style={{ borderColor: 'var(--color-primary)', backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)' }}
          >
            Export PDF
          </button>
        </div>
      </div>

      {!analysisResult ? (
        <div className="mt-8 rounded-2xl border p-6 transition-colors duration-400" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bgSecondary)', color: 'var(--color-textMuted)' }}>
          Run an analysis to generate a complete lecture report.
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          <SectionBlock title="Summary">
            <p>{result.summary || 'No summary available.'}</p>
          </SectionBlock>

          <SectionBlock title="Topics">
            {result.topics?.length ? (
              <ul className="list-disc pl-5 space-y-2">
                {result.topics.map((topic, idx) => (
                  <li key={`${topic}-${idx}`}>{topic}</li>
                ))}
              </ul>
            ) : (
              <p style={{ color: 'var(--color-textMuted)' }}>No topics identified.</p>
            )}
          </SectionBlock>

          <SectionBlock title="Action Plan">
            {result.action_items?.length ? (
              <ul className="list-decimal pl-5 space-y-2">
                {result.action_items.map((item, idx) => (
                  <li key={`${item}-${idx}`}>{item}</li>
                ))}
              </ul>
            ) : (
              <p style={{ color: 'var(--color-textMuted)' }}>No action items found.</p>
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
