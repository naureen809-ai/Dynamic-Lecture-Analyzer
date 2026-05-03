import React, { useEffect, useMemo, useState } from 'react'
import apiClient from '../api/apiClient'

const LANGUAGES = [
  'English',
  'Hindi',
  'Hinglish',
  'Bengali',
  'Tamil',
  'Telugu',
  'Marathi',
  'Gujarati',
  'Punjabi',
  'Urdu',
  'Kannada',
  'Malayalam',
  'Odia',
  'Assamese',
  'Sanskrit',
  'Konkani',
  'Maithili',
  'Dogri',
  'Manipuri',
  'Bodo',
  'Santhali',
  'Kashmiri',
  'Sindhi',
  'Nepali'
]

function highlightText(text, query) {
  const content = String(text || '')
  const q = String(query || '').trim()
  if (!q) return content

  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${escaped})`, 'ig')
  const parts = content.split(regex)
  const lowered = q.toLowerCase()

  return parts.map((part, idx) =>
    part.toLowerCase() === lowered
      ? <mark key={`${part}-${idx}`} className="bg-cyan-300/30 text-cyan-100 px-1 rounded">{part}</mark>
      : <React.Fragment key={`${part}-${idx}`}>{part}</React.Fragment>
  )
}

function LoadingSpinner() {
  return (
    <div className="inline-flex items-center gap-3">
      <span className="h-4 w-4 rounded-full border-2 border-cyan-300 border-t-cyan-500 animate-spin" />
      <span className="inline-flex items-center gap-1">
        <span>Analyzing</span>
        <span className="animate-bounce [animation-delay:0ms]">.</span>
        <span className="animate-bounce [animation-delay:150ms]">.</span>
        <span className="animate-bounce [animation-delay:300ms]">.</span>
      </span>
    </div>
  )
}

function AnalyzingPanel() {
  return (
    <div className="mt-6 rounded-2xl shadow-xl border border-cyan-500/30 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="flex items-center gap-3 text-cyan-200 font-semibold">
        <span className="h-3 w-3 rounded-full bg-cyan-300 animate-ping" />
        <span>Analyzing your lecture content</span>
      </div>
      <div className="mt-4 space-y-3">
        <div className="h-2 rounded-full bg-slate-700 overflow-hidden">
          <div className="h-full w-1/2 bg-gradient-to-r from-cyan-400 to-blue-400 animate-pulse" />
        </div>
        <div className="h-2 rounded-full bg-slate-700 overflow-hidden">
          <div className="h-full w-2/3 bg-gradient-to-r from-cyan-400 to-blue-400 animate-pulse [animation-delay:200ms]" />
        </div>
        <div className="h-2 rounded-full bg-slate-700 overflow-hidden">
          <div className="h-full w-1/3 bg-gradient-to-r from-cyan-400 to-blue-400 animate-pulse [animation-delay:400ms]" />
        </div>
      </div>
    </div>
  )
}

function CopyButton({ value, onCopy, copied }) {
  return (
    <button
      type="button"
      onClick={() => onCopy(value)}
      className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-cyan-400 hover:text-cyan-200 transition-colors"
    >
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

function SectionCard({ title, children, copyValue, onCopy, copied }) {
  return (
    <section className="rounded-2xl shadow-xl border border-slate-800 bg-slate-900/70 backdrop-blur p-5 md:p-6">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
        {copyValue ? <CopyButton value={copyValue} onCopy={onCopy} copied={copied} /> : null}
      </div>
      <div className="mt-3 text-slate-300">{children}</div>
    </section>
  )
}

function ListSection({ items, emptyText }) {
  if (!items?.length) {
    return <p className="text-slate-500">{emptyText}</p>
  }

  return (
    <ul className="space-y-2">
      {items.map((item, idx) => (
        <li key={`${item}-${idx}`} className="rounded-xl bg-slate-800/80 border border-slate-700 px-3 py-2 text-sm text-slate-200">
          {item}
        </li>
      ))}
    </ul>
  )
}

const EMPTY_RESULT = {
  summary: '',
  topics: [],
  action_items: [],
  keywords: [],
  speaker_feedback: '',
  notes: {
    headings: [],
    short_notes: [],
    detailed_notes: [],
    timestamps: []
  },
  questions: {
    mcqs: [],
    short_questions: [],
    viva_questions: []
  },
  segmentation: []
}

export default function Dashboard() {
  const [text, setText] = useState('')
  const [language, setLanguage] = useState('English')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [copiedKey, setCopiedKey] = useState('')
  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState('')

  const canAnalyze = useMemo(() => text.trim().length > 0 && !loading, [text, loading])

  const canDownload = useMemo(() => {
    return Boolean(
      result && (
        result.summary ||
        result.speaker_feedback ||
        (Array.isArray(result.topics) && result.topics.length) ||
        (Array.isArray(result.action_items) && result.action_items.length) ||
        (Array.isArray(result.keywords) && result.keywords.length)
      )
    )
  }, [result])

  async function handleAnalyze() {
    if (!text.trim() || loading) return

    setLoading(true)
    setError('')

    try {
      const res = await apiClient.analyze(text.trim(), language)
      const payload = res?.data?.data?.ai_output || res?.data?.data || res?.data || {}

      setResult({
        summary: payload.summary || '',
        topics: Array.isArray(payload.topics) ? payload.topics : [],
        action_items: Array.isArray(payload.action_items) ? payload.action_items : [],
        keywords: Array.isArray(payload.keywords) ? payload.keywords : [],
        speaker_feedback: payload.speaker_feedback || '',
        notes: {
          headings: Array.isArray(payload.notes?.headings) ? payload.notes.headings : [],
          short_notes: Array.isArray(payload.notes?.short_notes) ? payload.notes.short_notes : [],
          detailed_notes: Array.isArray(payload.notes?.detailed_notes) ? payload.notes.detailed_notes : [],
          timestamps: Array.isArray(payload.notes?.timestamps) ? payload.notes.timestamps : []
        },
        questions: {
          mcqs: Array.isArray(payload.questions?.mcqs) ? payload.questions.mcqs : [],
          short_questions: Array.isArray(payload.questions?.short_questions) ? payload.questions.short_questions : [],
          viva_questions: Array.isArray(payload.questions?.viva_questions) ? payload.questions.viva_questions : []
        },
        segmentation: Array.isArray(payload.segmentation) ? payload.segmentation : []
      })

      await loadHistory()
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Failed to analyze lecture text.'
      setError(message)
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  async function loadHistory() {
    setHistoryLoading(true)
    setHistoryError('')

    try {
      const res = await apiClient.history(6)
      const entries = Array.isArray(res?.data?.data) ? res.data.data : []
      setHistory(entries)
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Unable to fetch history.'
      setHistoryError(message)
    } finally {
      setHistoryLoading(false)
    }
  }

  useEffect(() => {
    loadHistory()
  }, [])

  async function handleCopy(value) {
    const payload = String(value || '').trim()
    if (!payload) return

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(payload)
      } else {
        const textArea = document.createElement('textarea')
        textArea.value = payload
        textArea.style.position = 'fixed'
        textArea.style.opacity = '0'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
      }

      setCopiedKey(payload)
      setTimeout(() => setCopiedKey(''), 1400)
    } catch (_) {
      setError('Unable to copy text. Please copy manually.')
    }
  }

  function buildAnalysisText(payload) {
    const safe = payload || EMPTY_RESULT
    const lines = [
      'Lecture Analyzer Report',
      `Generated: ${new Date().toLocaleString()}`,
      '',
      'Summary',
      safe.summary || 'No summary available.',
      '',
      'Topics',
      ...(safe.topics?.length ? safe.topics.map((item, idx) => `${idx + 1}. ${item}`) : ['No topics available.']),
      '',
      'Action Items',
      ...(safe.action_items?.length ? safe.action_items.map((item, idx) => `${idx + 1}. ${item}`) : ['No action items available.']),
      '',
      'Keywords',
      safe.keywords?.length ? safe.keywords.join(', ') : 'No keywords available.',
      '',
      'Speaker Feedback',
      safe.speaker_feedback || 'No speaker feedback available.',
      '',
      'Short Notes',
      ...(safe.notes?.short_notes?.length ? safe.notes.short_notes.map((item, idx) => `${idx + 1}. ${item}`) : ['No short notes available.']),
      '',
      'Detailed Notes',
      ...(safe.notes?.detailed_notes?.length ? safe.notes.detailed_notes.map((item, idx) => `${idx + 1}. ${item}`) : ['No detailed notes available.']),
      '',
      'Short Questions',
      ...(safe.questions?.short_questions?.length ? safe.questions.short_questions.map((item, idx) => `${idx + 1}. ${item}`) : ['No short questions available.']),
      '',
      'Viva Questions',
      ...(safe.questions?.viva_questions?.length ? safe.questions.viva_questions.map((item, idx) => `${idx + 1}. ${item}`) : ['No viva questions available.'])
    ]

    return lines.join('\n')
  }

  function handleDownloadText() {
    if (!canDownload || !result) return

    const reportText = buildAnalysisText(result)
    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    const stamp = new Date().toISOString().replace(/[:.]/g, '-')

    anchor.href = url
    anchor.download = `lecture-analysis-${stamp}.txt`
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
    URL.revokeObjectURL(url)
  }

  const handleExportPdf = async (id) => {
    if (!id) return

    try {
      const res = await apiClient.exportPdf(id)
      const blob = new Blob([res.data], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `lecture-analysis-${id}.pdf`
      document.body.appendChild(anchor)
      anchor.click()
      document.body.removeChild(anchor)
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Unable to export PDF.')
    }
  }

  const handleSearch = async () => {
    const q = searchQuery.trim()
    if (q.length < 2) {
      setSearchError('Enter at least 2 characters to search.')
      setSearchResults([])
      return
    }

    setSearchLoading(true)
    setSearchError('')

    try {
      const res = await apiClient.search(q, 8)
      setSearchResults(Array.isArray(res?.data?.data) ? res.data.data : [])
    } catch (err) {
      setSearchError(err?.response?.data?.message || err?.message || 'Search failed.')
      setSearchResults([])
    } finally {
      setSearchLoading(false)
    }
  }

  const display = result || EMPTY_RESULT

  return (
    <div className="min-h-[82vh] rounded-2xl shadow-xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 md:p-8">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="mt-2 text-3xl md:text-4xl font-extrabold text-white">Dynamic</h1>
          <p className="text-lg font-semibold text-sky-400">Lecture Analyzer</p>
          <p className="mt-2 text-sm text-slate-400">Get structured insights from lecture transcripts in seconds.</p>
        </div>
        <span className="self-start rounded-full border border-cyan-400/40 bg-cyan-500/10 px-4 py-1 text-xs font-medium text-cyan-200">
          Dark Premium Mode
        </span>
      </header>

      <div id="analysis-input" className="mt-8 rounded-2xl shadow-xl border border-slate-700 bg-slate-900/70 p-5 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <label htmlFor="lecture-input" className="text-sm font-medium text-slate-200">
            Lecture Transcript / Notes
          </label>
          <select
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          >
            {LANGUAGES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
        <textarea
          id="lecture-input"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Paste your lecture text here..."
          className="mt-3 w-full min-h-48 rounded-2xl border border-slate-700 bg-slate-950/90 p-4 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400"
        />
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={!canAnalyze}
            className="inline-flex items-center justify-center rounded-2xl px-6 py-3 text-sm font-semibold text-slate-950 bg-cyan-300 hover:bg-cyan-200 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400 transition-colors"
          >
            {loading ? <LoadingSpinner /> : 'Analyze Lecture'}
          </button>
          <button
            type="button"
            onClick={handleDownloadText}
            disabled={!canDownload || loading}
            className="inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold text-cyan-200 border border-cyan-500/40 bg-slate-900 hover:bg-slate-800 disabled:cursor-not-allowed disabled:border-slate-700 disabled:text-slate-500 transition-colors"
          >
            Download as Text
          </button>
          <span className="text-xs text-slate-500">Analyze enables after text is entered.</span>
        </div>

        {error && (
          <div className="mt-4 rounded-2xl border border-rose-700/40 bg-rose-900/20 px-4 py-3 text-sm text-rose-300">
            {error}
          </div>
        )}
      </div>

      {!loading && !error && !result && (
        <div className="mt-6 rounded-2xl shadow-xl border border-slate-800 bg-slate-900/70 p-6 text-center">
          <p className="text-slate-300">No analysis yet.</p>
          <p className="mt-2 text-sm text-slate-500">Submit lecture text to view summary, topics, action items, keywords, and feedback.</p>
        </div>
      )}

      {loading && <AnalyzingPanel />}

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-5">
          <SectionCard
            title="Summary"
            copyValue={display.summary}
            onCopy={handleCopy}
            copied={copiedKey === String(display.summary || '').trim()}
          >
            <div id="analysis-summary">
              {loading ? <p className="text-slate-400">Preparing concise summary...</p> : <p className="leading-7">{display.summary || 'No summary available.'}</p>}
            </div>
          </SectionCard>

          <SectionCard
            title="Speaker Feedback"
            copyValue={display.speaker_feedback}
            onCopy={handleCopy}
            copied={copiedKey === String(display.speaker_feedback || '').trim()}
          >
            {loading ? <p className="text-slate-400">Generating feedback...</p> : <p className="leading-7">{display.speaker_feedback || 'No speaker feedback available.'}</p>}
          </SectionCard>

          <SectionCard
            title="Topics"
            copyValue={display.topics?.join('\n')}
            onCopy={handleCopy}
            copied={copiedKey === String(display.topics?.join('\n') || '').trim()}
          >
            <div id="analysis-topics">
              {loading ? <p className="text-slate-400">Extracting topics...</p> : <ListSection items={display.topics} emptyText="No topics available." />}
            </div>
          </SectionCard>

          <SectionCard
            title="Action Items"
            copyValue={display.action_items?.join('\n')}
            onCopy={handleCopy}
            copied={copiedKey === String(display.action_items?.join('\n') || '').trim()}
          >
            <div id="analysis-actions">
              {loading ? <p className="text-slate-400">Building action items...</p> : <ListSection items={display.action_items} emptyText="No action items available." />}
            </div>
          </SectionCard>

          <section id="analysis-keywords" className="lg:col-span-2 rounded-2xl shadow-xl border border-slate-800 bg-slate-900/70 backdrop-blur p-5 md:p-6">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-lg font-semibold text-slate-100">Keywords</h3>
              <CopyButton
                value={display.keywords?.join(', ')}
                onCopy={handleCopy}
                copied={copiedKey === String(display.keywords?.join(', ') || '').trim()}
              />
            </div>
            {loading ? (
              <p className="mt-3 text-slate-400">Extracting keywords...</p>
            ) : display.keywords?.length ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {display.keywords.map((keyword, idx) => (
                  <span key={`${keyword}-${idx}`} className="rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-200">
                    {keyword}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-slate-500">No keywords available.</p>
            )}
          </section>

          <SectionCard
            title="Short Notes"
            copyValue={display.notes?.short_notes?.join('\n')}
            onCopy={handleCopy}
            copied={copiedKey === String(display.notes?.short_notes?.join('\n') || '').trim()}
          >
            {loading ? <p className="text-slate-400">Preparing notes...</p> : <ListSection items={display.notes?.short_notes || []} emptyText="No short notes available." />}
          </SectionCard>

          <SectionCard
            title="Detailed Notes"
            copyValue={display.notes?.detailed_notes?.join('\n')}
            onCopy={handleCopy}
            copied={copiedKey === String(display.notes?.detailed_notes?.join('\n') || '').trim()}
          >
            {loading ? <p className="text-slate-400">Preparing detailed notes...</p> : <ListSection items={display.notes?.detailed_notes || []} emptyText="No detailed notes available." />}
          </SectionCard>

          <section className="lg:col-span-2 rounded-2xl shadow-xl border border-slate-800 bg-slate-900/70 backdrop-blur p-5 md:p-6">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-lg font-semibold text-slate-100">Questions</h3>
              <CopyButton
                value={[
                  ...(display.questions?.short_questions || []),
                  ...(display.questions?.viva_questions || []),
                  ...(display.questions?.mcqs || []).map((item) => item?.question).filter(Boolean)
                ].join('\n')}
                onCopy={handleCopy}
                copied={copiedKey === String([
                  ...(display.questions?.short_questions || []),
                  ...(display.questions?.viva_questions || []),
                  ...(display.questions?.mcqs || []).map((item) => item?.question).filter(Boolean)
                ].join('\n') || '').trim()}
              />
            </div>
            {loading ? (
              <p className="mt-3 text-slate-400">Generating questions...</p>
            ) : (
              <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-cyan-300 mb-2">MCQs</p>
                  <ListSection
                    items={(display.questions?.mcqs || []).map((item) => item.question)}
                    emptyText="No MCQs available."
                  />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-cyan-300 mb-2">Short Questions</p>
                  <ListSection
                    items={display.questions?.short_questions || []}
                    emptyText="No short questions available."
                  />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-cyan-300 mb-2">Viva Questions</p>
                  <ListSection
                    items={display.questions?.viva_questions || []}
                    emptyText="No viva questions available."
                  />
                </div>
              </div>
            )}
          </section>

          <section className="lg:col-span-2 rounded-2xl shadow-xl border border-slate-800 bg-slate-900/70 backdrop-blur p-5 md:p-6">
            <h3 className="text-lg font-semibold text-slate-100">Segmentation</h3>
            {loading ? (
              <p className="mt-3 text-slate-400">Creating lecture segments...</p>
            ) : (display.segmentation || []).length ? (
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                {(display.segmentation || []).map((item, idx) => (
                  <article key={`${item.section}-${idx}`} className="rounded-xl border border-slate-700 bg-slate-950/70 p-3">
                    <div className="text-xs text-cyan-300">{item.section || `Section ${idx + 1}`}</div>
                    <p className="mt-1 text-sm text-slate-200">{item.description || 'No description'}</p>
                    {item.timestamp ? <p className="mt-2 text-xs text-slate-400">Timestamp: {item.timestamp}</p> : null}
                  </article>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-slate-500">No segmentation data available.</p>
            )}
          </section>

          <section className="lg:col-span-2 rounded-2xl shadow-xl border border-slate-800 bg-slate-900/70 backdrop-blur p-5 md:p-6">
            <h3 className="text-lg font-semibold text-slate-100">Timestamp Notes</h3>
            {(display.notes?.timestamps || []).length ? (
              <div className="mt-3 space-y-2">
                {display.notes.timestamps.map((item, idx) => (
                  <div key={`${item.text}-${idx}`} className="rounded-xl border border-slate-700 bg-slate-950/70 p-3 text-sm text-slate-200">
                    <span className="text-cyan-300">[{item.timestamp || '--:--'}]</span> {item.text}
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-slate-500">Timestamp notes are shown only when time markers are available.</p>
            )}
          </section>
      </div>

      <section id="analysis-history" className="mt-6 rounded-2xl shadow-xl border border-slate-800 bg-slate-900/70 p-5 md:p-6">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-slate-100">Recent Analysis History</h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadHistory}
              disabled={historyLoading}
              className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-cyan-400 hover:text-cyan-200 disabled:cursor-not-allowed disabled:text-slate-500"
            >
              {historyLoading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/60 p-3">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Keyword Search</p>
          <div className="mt-2 flex flex-col md:flex-row gap-2">
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by keyword, summary text, or topic"
              className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
            <button
              type="button"
              onClick={handleSearch}
              disabled={searchLoading}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-950 bg-cyan-300 hover:bg-cyan-200 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
            >
              {searchLoading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {searchError && (
            <div className="mt-2 text-sm text-rose-300">{searchError}</div>
          )}

          {searchResults.length > 0 && (
            <div className="mt-3 space-y-2">
              {searchResults.map((item) => (
                <article key={item.id} className="rounded-xl border border-slate-700 bg-slate-900/70 p-3">
                  <p className="text-xs text-slate-500">{new Date(item.timestamp).toLocaleString()} | {item.language || 'English'}</p>
                  <p className="mt-1 text-sm text-slate-200">{highlightText(item.summary || 'No summary', searchQuery)}</p>
                  <p className="mt-1 text-xs text-slate-400">{highlightText(item.input_text || '', searchQuery)}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(item.keywords || []).map((keyword, idx) => (
                      <span key={`${keyword}-${idx}`} className="text-[11px] rounded-full border border-cyan-500/40 bg-cyan-500/10 px-2 py-0.5 text-cyan-200">
                        {highlightText(keyword, searchQuery)}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {historyError && (
          <div className="mt-3 rounded-xl border border-rose-700/40 bg-rose-900/20 px-3 py-2 text-sm text-rose-300">
            {historyError}
          </div>
        )}

        {!historyLoading && !history.length && !historyError && (
          <p className="mt-3 text-sm text-slate-500">No history yet. Run analysis to populate this section.</p>
        )}

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          {history.map((entry) => (
            <article key={entry._id || entry.id} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="text-xs text-slate-500">{new Date(entry.timestamp).toLocaleString()}</div>
                <button
                  type="button"
                  onClick={() => handleExportPdf(entry._id || entry.id)}
                  className="rounded-lg border border-slate-700 px-2 py-1 text-[11px] text-slate-200 hover:border-cyan-400 hover:text-cyan-200"
                >
                  Export PDF
                </button>
              </div>
              <h4 className="mt-2 text-sm font-semibold text-slate-200 line-clamp-2">{entry.ai_output?.summary || 'No summary available.'}</h4>
              <p className="mt-2 text-xs text-slate-400 line-clamp-2">{entry.input_text || 'No input stored.'}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
