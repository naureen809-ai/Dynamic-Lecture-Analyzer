import React from 'react'

function StatCard({ label, value, helper }) {
  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-3 text-4xl font-bold text-white">{value}</p>
      <p className="mt-2 text-sm text-slate-400">{helper}</p>
    </article>
  )
}

export default function DashboardSection({ analysisResult, stats, statsLoading, statsError }) {
  return (
    <section className="space-y-6 rounded-2xl shadow-xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-cyan-300/90">Overview</p>
          <h1 className="mt-2 text-3xl md:text-4xl font-extrabold text-white">Lecture Intelligence Dashboard</h1>
          <p className="mt-2 text-sm text-slate-400">A premium overview of your lecture analytics and latest AI insights.</p>
        </div>
        <span className="rounded-full border border-cyan-400/40 bg-cyan-500/10 px-4 py-1 text-xs font-medium text-cyan-200">
          Premium analytics
        </span>
      </header>

      {statsError ? (
        <div className="rounded-2xl border border-rose-700/40 bg-rose-900/20 px-4 py-3 text-sm text-rose-300">
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

      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
        <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">Latest analysis snapshot</p>
        {analysisResult?.summary ? (
          <div className="mt-4 space-y-4 text-slate-200">
            <p className="text-sm leading-7">{analysisResult.summary}</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-2xl border border-slate-700 bg-slate-950/80 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Topics</p>
                <p className="mt-2 text-xl font-semibold text-white">{analysisResult.topics?.length || 0}</p>
              </div>
              <div className="rounded-2xl border border-slate-700 bg-slate-950/80 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Action plan items</p>
                <p className="mt-2 text-xl font-semibold text-white">{analysisResult.action_items?.length || 0}</p>
              </div>
              <div className="rounded-2xl border border-slate-700 bg-slate-950/80 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Keywords</p>
                <p className="mt-2 text-xl font-semibold text-white">{analysisResult.keywords?.length || 0}</p>
              </div>
            </div>
          </div>
        ) : (
          <p className="mt-4 text-slate-500">Run an analysis from Input Studio to see the latest insights here.</p>
        )}
      </div>
    </section>
  )
}
