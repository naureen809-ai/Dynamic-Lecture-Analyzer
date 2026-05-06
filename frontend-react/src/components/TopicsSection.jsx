import React from 'react'

export default function TopicsSection({ analysisResult, onCopy, copied }) {
  const topics = analysisResult?.topics || []

  return (
    <section style={{ backgroundColor: 'var(--color-bgSecondary)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }} className="rounded-2xl shadow-xl border p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p style={{ color: 'var(--color-primary)' }} className="text-xs uppercase tracking-[0.18em] font-bold">Topics</p>
          <h2 style={{ color: 'var(--color-text)' }} className="mt-2 text-2xl font-semibold">Key Lecture Topics</h2>
        </div>
        <button
          type="button"
          onClick={() => onCopy(topics.join('\n'))}
          disabled={!topics.length}
          style={{
            backgroundColor: 'var(--color-primary)',
            color: '#ffffff',
            borderColor: 'var(--color-primary)'
          }}
          className="rounded-xl border px-4 py-2 text-xs font-semibold hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 transition-all"
        >
          {copied ? 'Copied' : 'Copy Topics'}
        </button>
      </div>

      <div style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }} className="mt-5 rounded-2xl border p-5 min-h-[180px]">
        {topics.length ? (
          <ul className="space-y-3">
            {topics.map((topic, idx) => (
              <li key={`${topic}-${idx}`} style={{ backgroundColor: `var(--color-primary)20`, borderColor: 'var(--color-border)', color: 'var(--color-text)' }} className="rounded-2xl border p-4 text-sm">
                {topic}
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ color: 'var(--color-textMuted)' }}>No topics are available yet. Analyze a lecture to see the top subjects.</p>
        )}
      </div>
    </section>
  )
}
