import React from 'react'

function SectionBlock({ title, children, aside }) {
  return (
    <section
      className="rounded-3xl border p-5 md:p-6 transition-colors duration-400 shadow-sm"
      style={{
        backgroundColor: 'var(--color-bgSecondary)',
        borderColor: 'var(--color-border)'
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>{title}</h3>
        {aside ? <div className="text-xs font-semibold" style={{ color: 'var(--color-textMuted)' }}>{aside}</div> : null}
      </div>
      <div className="mt-4 space-y-3" style={{ color: 'var(--color-textSecondary)' }}>{children}</div>
    </section>
  )
}

function StatCard({ label, value, hint }) {
  return (
    <div
      className="rounded-3xl border p-5 shadow-sm transition-colors duration-400"
      style={{ backgroundColor: 'var(--color-bgSecondary)', borderColor: 'var(--color-border)' }}
    >
      <p className="text-[11px] uppercase tracking-[0.3em] font-bold" style={{ color: 'var(--color-textMuted)' }}>{label}</p>
      <p className="mt-3 text-3xl md:text-4xl font-black tracking-tight" style={{ color: 'var(--color-text)' }}>{value}</p>
      <p className="mt-2 text-sm leading-6" style={{ color: 'var(--color-textMuted)' }}>{hint}</p>
    </div>
  )
}

function BadgeList({ items }) {
  if (!items?.length) {
    return <p style={{ color: 'var(--color-textMuted)' }}>Nothing to show yet.</p>
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, idx) => (
        <span
          key={`${item}-${idx}`}
          className="rounded-full border px-3 py-1 text-xs font-semibold transition-colors duration-400"
          style={{
            borderColor: 'var(--color-primary)40',
            backgroundColor: 'var(--color-primary)15',
            color: 'var(--color-primary)'
          }}
        >
          {item}
        </span>
      ))}
    </div>
  )
}

function QuestionList({ items, emptyText }) {
  if (!items?.length) {
    return <p style={{ color: 'var(--color-textMuted)' }}>{emptyText}</p>
  }

  return (
    <ul className="space-y-2">
      {items.map((item, idx) => (
        <li
          key={`${item}-${idx}`}
          className="rounded-2xl border px-4 py-3 text-sm leading-6"
          style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
        >
          {item}
        </li>
      ))}
    </ul>
  )
}

export default function ReportsSection({ analysisResult, onCopy, copied, onExportPdf, exportId }) {
  const result = analysisResult || {}
  const summaryText = result.summary || 'No summary available.'
  const topicCount = result.topics?.length || 0
  const actionCount = result.action_items?.length || 0
  const keywordCount = result.keywords?.length || 0
  const shortQuestionCount = result.questions?.short_questions?.length || 0
  const vivaQuestionCount = result.questions?.viva_questions?.length || 0
  const mcqCount = result.questions?.mcqs?.length || 0

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
    <section
      className="space-y-6 rounded-3xl border p-6 md:p-8 shadow-2xl transition-colors duration-400"
      style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}
    >
      <header className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] font-bold" style={{ color: 'var(--color-primary)' }}>Reports</p>
          <h1 className="mt-3 text-3xl md:text-5xl font-black tracking-tight" style={{ color: 'var(--color-text)' }}>Full Lecture Report</h1>
          <p className="mt-3 max-w-3xl text-sm md:text-base leading-7" style={{ color: 'var(--color-textMuted)' }}>
            A polished final report with summary, study actions, questions, and key takeaways ready for revision or export.
          </p>
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
      </header>

      {!analysisResult ? (
        <div className="rounded-3xl border p-8 transition-colors duration-400" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bgSecondary)', color: 'var(--color-textMuted)' }}>
          <p className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>No report available yet</p>
          <p className="mt-2 text-sm leading-6">Run AI Analysis first, then this page will show the final lecture summary, topics, action plan, and questions.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard label="Summary Ready" value={summaryText ? 'Yes' : 'No'} hint="Whether a lecture summary is available." />
            <StatCard label="Topics" value={topicCount} hint="Core concepts extracted from the lecture." />
            <StatCard label="Action Items" value={actionCount} hint="Study steps and revision tasks." />
            <StatCard label="Questions" value={mcqCount + shortQuestionCount + vivaQuestionCount} hint="All generated practice questions combined." />
          </div>

          <SectionBlock title="Executive Summary" aside="Top-level lecture takeaways">
            <p className="text-base leading-7" style={{ color: 'var(--color-text)' }}>{summaryText}</p>
          </SectionBlock>

          <SectionBlock title="Topics" aside={`${topicCount} identified`}>
            {result.topics?.length ? (
              <BadgeList items={result.topics} />
            ) : (
              <p style={{ color: 'var(--color-textMuted)' }}>No topics identified.</p>
            )}
          </SectionBlock>

          <SectionBlock title="Action Plan" aside={`${actionCount} steps`}>
            <QuestionList items={result.action_items} emptyText="No action items found." />
          </SectionBlock>

          <SectionBlock title="Keywords" aside={`${keywordCount} key terms`}>
            <BadgeList items={result.keywords} />
          </SectionBlock>

          <SectionBlock title="Practice Questions" aside={`${mcqCount + shortQuestionCount + vivaQuestionCount} total`}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="rounded-2xl border p-4" style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
                <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>MCQs</p>
                <QuestionList items={(result.questions?.mcqs || []).map((item) => item.question || '')} emptyText="No MCQs available." />
              </div>
              <div className="rounded-2xl border p-4" style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
                <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>Short Questions</p>
                <QuestionList items={result.questions?.short_questions} emptyText="No short questions available." />
              </div>
              <div className="rounded-2xl border p-4" style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
                <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>Viva Questions</p>
                <QuestionList items={result.questions?.viva_questions} emptyText="No viva questions available." />
              </div>
            </div>
          </SectionBlock>

          <SectionBlock title="Speaker Feedback" aside="Improvement notes">
            <p className="text-base leading-7" style={{ color: 'var(--color-text)' }}>{result.speaker_feedback || 'No speaker feedback generated.'}</p>
          </SectionBlock>
        </div>
      )}
    </section>
  )
}
