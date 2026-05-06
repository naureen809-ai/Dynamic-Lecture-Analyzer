import React from 'react'

function StatCard({ label, value, helper, accent }) {
  return (
    <article
      className="relative overflow-hidden rounded-3xl border p-5 md:p-6 transition-all duration-400 shadow-lg"
      style={{
        backgroundColor: 'var(--color-bgSecondary)',
        borderColor: 'var(--color-border)',
        color: 'var(--color-text)'
      }}
    >
      <div
        className="absolute inset-x-0 top-0 h-1"
        style={{
          background: accent || 'linear-gradient(90deg, var(--color-primary), var(--color-primaryLight))'
        }}
      />
      <p className="text-xs uppercase tracking-[0.28em] font-semibold" style={{ color: 'var(--color-textMuted)' }}>{label}</p>
      <p className="mt-3 text-4xl font-black tracking-tight" style={{ color: 'var(--color-text)' }}>{value}</p>
      <p className="mt-2 text-sm leading-6" style={{ color: 'var(--color-textMuted)' }}>{helper}</p>
    </article>
  )
}

function Pill({ children }) {
  return (
    <span
      className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold"
      style={{
        backgroundColor: 'var(--color-bgSecondary)',
        borderColor: 'var(--color-border)',
        color: 'var(--color-primary)'
      }}
    >
      {children}
    </span>
  )
}

function EmptyState({ title, description }) {
  return (
    <div
      className="rounded-3xl border p-6 md:p-8"
      style={{ backgroundColor: 'var(--color-bgSecondary)', borderColor: 'var(--color-border)' }}
    >
      <p className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>{title}</p>
      <p className="mt-2 text-sm leading-6" style={{ color: 'var(--color-textMuted)' }}>{description}</p>
    </div>
  )
}

export default function DashboardSection({ analysisResult, stats, statsLoading, statsError }) {
  const topicCount = analysisResult?.topics?.length || 0
  const actionCount = analysisResult?.action_items?.length || 0
  const keywordCount = analysisResult?.keywords?.length || 0
  const questionCount = analysisResult?.questions?.mcqs?.length || 0
  const hasAnalysis = Boolean(analysisResult?.summary)

  return (
    <section
      className="relative overflow-hidden space-y-6 rounded-3xl border p-6 md:p-8 shadow-2xl transition-colors duration-400"
      style={{
        backgroundColor: 'var(--color-bg)',
        borderColor: 'var(--color-border)'
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background: 'radial-gradient(circle at top left, color-mix(in srgb, var(--color-primary) 18%, transparent), transparent 34%), radial-gradient(circle at top right, color-mix(in srgb, var(--color-primaryLight) 14%, transparent), transparent 28%)'
        }}
      />

      <header className="relative flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] font-bold" style={{ color: 'var(--color-primary)' }}>Overview</p>
          <h1 className="mt-3 text-3xl md:text-5xl font-black tracking-tight" style={{ color: 'var(--color-text)' }}>Lecture Analytics Dashboard</h1>
          <p className="mt-3 max-w-2xl text-sm md:text-base leading-7" style={{ color: 'var(--color-textMuted)' }}>
            A premium control center for your lecture progress, AI insights, generated questions, and study actions.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Pill>{statsLoading ? 'Refreshing stats...' : 'Live analytics'}</Pill>
            <Pill>{hasAnalysis ? 'Latest lecture loaded' : 'No lecture analyzed yet'}</Pill>
            <Pill>{questionCount} generated MCQs</Pill>
          </div>
        </div>
        <div
          className="rounded-2xl border px-4 py-3 text-sm font-semibold shadow-lg"
          style={{
            color: 'var(--color-primary)',
            backgroundColor: 'var(--color-bgSecondary)',
            borderColor: 'var(--color-border)'
          }}
        >
          ✨ Premium analytics
        </div>
      </header>

      {statsError ? (
        <div className="relative rounded-2xl border px-4 py-3 text-sm font-semibold" style={{ borderColor: 'var(--color-danger)', backgroundColor: `var(--color-danger)15`, color: 'var(--color-danger)' }}>
          {statsError}
        </div>
      ) : null}

      <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-4">
        <StatCard
          label="Lectures analyzed"
          value={stats?.total_lectures_processed ?? '—'}
          helper="Total lecture sessions recorded by the system."
          accent="linear-gradient(90deg, #22d3ee, #3b82f6)"
        />
        <StatCard
          label="Questions generated"
          value={stats?.total_questions_generated ?? '—'}
          helper="Total AI-generated questions created from lecture content."
          accent="linear-gradient(90deg, #34d399, #10b981)"
        />
      </div>

      <div className="relative rounded-3xl border p-6 md:p-7 shadow-xl transition-colors duration-400" style={{ backgroundColor: 'var(--color-bgSecondary)', borderColor: 'var(--color-border)' }}>
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs uppercase tracking-[0.28em] font-bold" style={{ color: 'var(--color-primary)' }}>Latest analysis snapshot</p>
          <span className="text-xs font-semibold" style={{ color: 'var(--color-textMuted)' }}>
            {hasAnalysis ? 'Ready for review' : 'Waiting for analysis'}
          </span>
        </div>
        {analysisResult?.summary ? (
          <div className="mt-5 space-y-6" style={{ color: 'var(--color-textSecondary)' }}>
            <p className="text-sm md:text-base leading-7" style={{ color: 'var(--color-text)' }}>{analysisResult.summary}</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-2xl border p-4 shadow-sm transition-colors duration-400" style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
                <p className="text-xs uppercase tracking-[0.16em]" style={{ color: 'var(--color-textMuted)' }}>Topics</p>
                <p className="mt-2 text-2xl font-black" style={{ color: 'var(--color-text)' }}>{topicCount}</p>
                <p className="mt-1 text-xs" style={{ color: 'var(--color-textMuted)' }}>Core ideas extracted</p>
              </div>
              <div className="rounded-2xl border p-4 shadow-sm transition-colors duration-400" style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
                <p className="text-xs uppercase tracking-[0.16em]" style={{ color: 'var(--color-textMuted)' }}>Action plan items</p>
                <p className="mt-2 text-2xl font-black" style={{ color: 'var(--color-text)' }}>{actionCount}</p>
                <p className="mt-1 text-xs" style={{ color: 'var(--color-textMuted)' }}>Study tasks to follow</p>
              </div>
              <div className="rounded-2xl border p-4 shadow-sm transition-colors duration-400" style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
                <p className="text-xs uppercase tracking-[0.16em]" style={{ color: 'var(--color-textMuted)' }}>Keywords</p>
                <p className="mt-2 text-2xl font-black" style={{ color: 'var(--color-text)' }}>{keywordCount}</p>
                <p className="mt-1 text-xs" style={{ color: 'var(--color-textMuted)' }}>High-value terms found</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-2xl border p-5" style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
                <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>Quick Topics</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(analysisResult.topics || []).slice(0, 6).map((topic, idx) => (
                    <span key={`${topic}-${idx}`} className="rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: 'var(--color-primary)15', color: 'var(--color-primary)' }}>
                      {topic}
                    </span>
                  ))}
                  {!analysisResult.topics?.length && <span style={{ color: 'var(--color-textMuted)' }}>No topics yet.</span>}
                </div>
              </div>

              <div className="rounded-2xl border p-5" style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
                <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>Study Focus</p>
                <ListSection
                  items={(analysisResult.action_items || []).slice(0, 4)}
                  emptyText="No action items identified yet."
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-5">
            <EmptyState
              title="Run your first analysis"
              description="Paste lecture notes in AI Analysis to unlock a clean executive view with summary, topics, action items, keywords, and AI questions."
            />
          </div>
        )}
      </div>
    </section>
  )
}
