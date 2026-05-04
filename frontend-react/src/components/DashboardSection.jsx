import React from 'react'

function StatCard({ label, value, helper }) {
  return (
    <article className="rounded-2xl border dark:border-slate-800 light:border-slate-300 dark:bg-slate-950/80 light:bg-slate-100 p-5 transition-colors duration-400" style={{ backgroundColor: 'var(--color-bgSecondary)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}>
      <p className="text-xs uppercase tracking-[0.18em]" style={{ color: 'var(--color-textMuted)' }}>{label}</p>
      <p className="mt-3 text-4xl font-bold" style={{ color: 'var(--color-text)' }}>{value}</p>
      <p className="mt-2 text-sm" style={{ color: 'var(--color-textMuted)' }}>{helper}</p>
    </article>
  )
}

export default function DashboardSection({ analysisResult, stats, statsLoading, statsError }) {
  return (
    <section className="space-y-6 rounded-2xl shadow-xl border dark:border-slate-800 light:border-slate-300 dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 light:bg-white p-6 transition-colors duration-400" style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
      <header className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em]" style={{ color: 'var(--color-primary)' }}>Overview</p>
          <h1 className="mt-2 text-3xl md:text-4xl font-extrabold" style={{ color: 'var(--color-text)' }}>Lecture Analytics Dashboard</h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--color-textMuted)' }}>A premium overview of your lecture analytics and latest AI insights.</p>
        </div>
        <span className="rounded-full border border-cyan-400/40 bg-cyan-500/10 px-4 py-1 text-xs font-medium text-cyan-200" style={{ color: 'var(--color-primary)', backgroundColor: `${window.getComputedStyle(document.documentElement).getPropertyValue('--color-primary')}20`, borderColor: `${window.getComputedStyle(document.documentElement).getPropertyValue('--color-primary')}40` }}>
          Premium analytics
        </span>
      </header>

      {statsError ? (
        <div className="rounded-2xl border dark:border-rose-700/40 light:border-rose-300 dark:bg-rose-900/20 light:bg-rose-100 px-4 py-3 text-sm" style={{ borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }}>
          {statsError}
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <StatCard
          label="Lectures analyzed"
          value={stats?.total_lectures_processed ?? '—'}
          helper="Total lecture sessions recorded by the system."
        />
        <StatCard
          label="Questions generated"
          value={stats?.total_questions_generated ?? '—'}
          helper="Total AI-generated questions created from lecture content."
        />
      </div>

      <div className="rounded-2xl border dark:border-slate-800 light:border-slate-300 dark:bg-slate-900/80 light:bg-slate-50 p-6 transition-colors duration-400" style={{ backgroundColor: 'var(--color-bgSecondary)', borderColor: 'var(--color-border)' }}>
        <p className="text-xs uppercase tracking-[0.18em]" style={{ color: 'var(--color-primary)' }}>Latest analysis snapshot</p>
        {analysisResult?.summary ? (
          <div className="mt-4 space-y-4" style={{ color: 'var(--color-textSecondary)' }}>
            <p className="text-sm leading-7">{analysisResult.summary}</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-2xl border dark:border-slate-700 light:border-slate-300 dark:bg-slate-950/80 light:bg-white p-4 transition-colors duration-400" style={{ backgroundColor: 'var(--color-bgTertiary)', borderColor: 'var(--color-border)' }}>
                <p className="text-xs uppercase tracking-[0.16em]" style={{ color: 'var(--color-textMuted)' }}>Topics</p>
                <p className="mt-2 text-xl font-semibold" style={{ color: 'var(--color-text)' }}>{analysisResult.topics?.length || 0}</p>
              </div>
              <div className="rounded-2xl border dark:border-slate-700 light:border-slate-300 dark:bg-slate-950/80 light:bg-white p-4 transition-colors duration-400" style={{ backgroundColor: 'var(--color-bgTertiary)', borderColor: 'var(--color-border)' }}>
                <p className="text-xs uppercase tracking-[0.16em]" style={{ color: 'var(--color-textMuted)' }}>Action plan items</p>
                <p className="mt-2 text-xl font-semibold" style={{ color: 'var(--color-text)' }}>{analysisResult.action_items?.length || 0}</p>
              </div>
              <div className="rounded-2xl border dark:border-slate-700 light:border-slate-300 dark:bg-slate-950/80 light:bg-white p-4 transition-colors duration-400" style={{ backgroundColor: 'var(--color-bgTertiary)', borderColor: 'var(--color-border)' }}>
                <p className="text-xs uppercase tracking-[0.16em]" style={{ color: 'var(--color-textMuted)' }}>Keywords</p>
                <p className="mt-2 text-xl font-semibold" style={{ color: 'var(--color-text)' }}>{analysisResult.keywords?.length || 0}</p>
              </div>
            </div>
          </div>
        ) : (
          <p className="mt-4" style={{ color: 'var(--color-textMuted)' }}>Run an analysis from Input Studio to see the latest insights here.</p>
        )}
      </div>
    </section>
  )
}
