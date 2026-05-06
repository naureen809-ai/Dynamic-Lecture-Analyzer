import React from 'react'

export default function KeywordsSection({ analysisResult, onCopy, copied }) {
  const keywords = analysisResult?.keywords || []

  return (
    <section style={{ backgroundColor: 'var(--color-bgSecondary)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }} className="rounded-2xl shadow-xl border p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p style={{ color: 'var(--color-primary)' }} className="text-xs uppercase tracking-[0.18em] font-bold">Keywords</p>
          <h2 style={{ color: 'var(--color-text)' }} className="mt-2 text-2xl font-semibold">Most Important Keywords</h2>
        </div>
        <button
          type="button"
          onClick={() => onCopy(keywords.join(', '))}
          disabled={!keywords.length}
          style={{
            backgroundColor: 'var(--color-primary)',
            color: '#ffffff',
            borderColor: 'var(--color-primary)'
          }}
          className="rounded-xl border px-4 py-2 text-xs font-semibold hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 transition-all"
        >
          {copied ? 'Copied' : 'Copy Keywords'}
        </button>
      </div>

      <div style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }} className="mt-5 rounded-2xl border p-5 min-h-[180px]">
        {keywords.length ? (
          <div className="flex flex-wrap gap-3">
            {keywords.map((keyword, idx) => (
              <span key={`${keyword}-${idx}`} style={{ backgroundColor: `var(--color-primary)20`, borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }} className="rounded-full border px-3 py-1 text-xs font-semibold">
                {keyword}
              </span>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--color-textMuted)' }}>Keywords will appear once the lecture has been analyzed.</p>
        )}
      </div>
    </section>
  )
}
