import React from 'react'

export default function SummarySection({ analysisResult, onCopy, copied }) {
  const summary = analysisResult?.summary || ''

  return (
    <section style={{ backgroundColor: 'var(--color-bgSecondary)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }} className="rounded-2xl shadow-xl border p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p style={{ color: 'var(--color-primary)' }} className="text-xs uppercase tracking-[0.18em] font-bold">Summary</p>
          <h2 style={{ color: 'var(--color-text)' }} className="mt-2 text-2xl font-semibold">Lecture Summary</h2>
        </div>
        <button
          type="button"
          onClick={() => onCopy(summary)}
          disabled={!summary}
          style={{
            backgroundColor: 'var(--color-primary)',
            color: '#ffffff',
            borderColor: 'var(--color-primary)'
          }}
          className="rounded-xl border px-4 py-2 text-xs font-semibold hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 transition-all"
        >
          {copied ? 'Copied' : 'Copy Summary'}
        </button>
      </div>

      <div style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }} className="mt-5 rounded-2xl border p-5 min-h-[220px] leading-7">
        {summary ? (
          <p>{summary}</p>
        ) : (
          <p style={{ color: 'var(--color-textMuted)' }}>No summary available yet. Run analysis in Input Studio to populate this section.</p>
        )}
      </div>
    </section>
  )
}
