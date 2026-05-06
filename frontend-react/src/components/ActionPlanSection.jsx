import React from 'react'

export default function ActionPlanSection({ analysisResult, onCopy, copied }) {
  const items = analysisResult?.action_items || []

  return (
    <section style={{ backgroundColor: 'var(--color-bgSecondary)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }} className="rounded-2xl shadow-xl border p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p style={{ color: 'var(--color-primary)' }} className="text-xs uppercase tracking-[0.18em] font-bold">Action Plan</p>
          <h2 style={{ color: 'var(--color-text)' }} className="mt-2 text-2xl font-semibold">Next Steps & Learning Goals</h2>
        </div>
        <button
          type="button"
          onClick={() => onCopy(items.join('\n'))}
          disabled={!items.length}
          style={{
            backgroundColor: 'var(--color-primary)',
            color: '#ffffff',
            borderColor: 'var(--color-primary)'
          }}
          className="rounded-xl border px-4 py-2 text-xs font-semibold hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 transition-all"
        >
          {copied ? 'Copied' : 'Copy Action Plan'}
        </button>
      </div>

      <div style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }} className="mt-5 rounded-2xl border p-5">
        {items.length ? (
          <ol className="space-y-3 list-decimal pl-5">
            {items.map((item, idx) => (
              <li key={`${item}-${idx}`} style={{ backgroundColor: `var(--color-primary)20`, borderColor: 'var(--color-border)', color: 'var(--color-text)' }} className="rounded-2xl border p-4 text-sm">
                {item}
              </li>
            ))}
          </ol>
        ) : (
          <p style={{ color: 'var(--color-textMuted)' }}>No action plan has been generated yet. Analyze a lecture to populate this section.</p>
        )}
      </div>
    </section>
  )
}
