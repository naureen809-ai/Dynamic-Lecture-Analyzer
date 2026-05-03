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

const fakeBars = [42, 64, 51, 78, 66, 38, 58]

function Icon({ name, fill = false, className = '' }) {
  return (
    <span className={`material-symbols-outlined ${className}`} style={{ fontVariationSettings: `'FILL' ${fill ? 1 : 0}` }}>
      {name}
    </span>
  )
}

function CopyButton({ value, onCopy, copied }) {
  return (
    <button
      type="button"
      onClick={() => onCopy(value)}
      className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-200 hover:border-sky-400/60 hover:text-sky-300 transition-colors"
    >
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

function MessageBubble({ align = 'left', children, tone = 'assistant' }) {
  const left = align === 'left'
  return (
    <div className={`flex items-start gap-4 ${left ? 'mr-12' : 'ml-12 flex-row-reverse'}`}>
      <div className={`w-8 h-8 shrink-0 rounded-lg border flex items-center justify-center ${tone === 'assistant' ? 'bg-sky-500/20 border-sky-500/40' : 'bg-primary-container border-primary-container/30'}`}>
        <Icon name={tone === 'assistant' ? 'auto_awesome' : 'person'} className={`${tone === 'assistant' ? 'text-sky-400' : 'text-on-primary-container'} text-sm`} fill={tone !== 'assistant'} />
      </div>
      <div className={`p-4 rounded-2xl border text-sm leading-relaxed shadow-sm ${tone === 'assistant' ? 'bg-surface-container-high/50 border-white/5 text-on-surface rounded-tl-none' : 'bg-primary-container/20 border-primary-container/30 text-on-surface rounded-tr-none'}`}>
        {children}
      </div>
    </div>
  )
}

function StatCard({ icon, accent, label, value, delta }) {
  return (
    <div className="gradient-border-cyan rounded-xl p-5 group hover:bg-white/5 transition-all">
      <div className="flex items-center justify-between mb-2">
        <Icon name={icon} fill className={accent} />
        <span className="text-[10px] font-bold text-emerald-400">{delta}</span>
      </div>
      <p className="text-label-sm text-slate-400 uppercase">{label}</p>
      <p className="text-h2 text-white mt-1 font-bold">{value}</p>
    </div>
  )
}

export default function EliteDashboard() {
  const [text, setText] = useState('')
  const [language, setLanguage] = useState('English')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [copiedKey, setCopiedKey] = useState('')
  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [stats, setStats] = useState({ total_lectures_processed: 0, total_questions_generated: 0 })
  const [statsLoading, setStatsLoading] = useState(false)
  const [statsError, setStatsError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState('')

  const display = result || EMPTY_RESULT

  const canAnalyze = useMemo(() => text.trim().length > 0 && !loading, [text, loading])

  const summarySnippet = useMemo(() => {
    if (result?.summary) return result.summary
    return 'Hello Alex! I am ready to analyze your lecture transcript. Paste the lecture text below and I will generate structured learning content.'
  }, [result])

  const loadHistory = async () => {
    setHistoryLoading(true)
    try {
      const res = await apiClient.history(6)
      setHistory(Array.isArray(res?.data?.data) ? res.data.data : [])
    } catch (_) {
      setHistory([])
    } finally {
      setHistoryLoading(false)
    }
  }

  const loadStats = async () => {
    setStatsLoading(true)
    setStatsError('')
    try {
      const res = await apiClient.stats()
      setStats(res?.data?.data || { total_lectures_processed: 0, total_questions_generated: 0 })
    } catch (err) {
      setStatsError(err?.response?.data?.message || err?.message || 'Failed to load stats')
    } finally {
      setStatsLoading(false)
    }
  }

  useEffect(() => {
    loadHistory()
    loadStats()
  }, [])

  const handleCopy = async (value) => {
    const payload = String(value || '').trim()
    if (!payload) return

    try {
      await navigator.clipboard.writeText(payload)
      setCopiedKey(payload)
      setTimeout(() => setCopiedKey(''), 1400)
    } catch {
      setError('Unable to copy text. Please copy manually.')
    }
  }

  const buildAnalysisText = (payload) => {
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
      safe.speaker_feedback || 'No speaker feedback available.'
    ]
    return lines.join('\n')
  }

  const handleDownloadText = () => {
    const reportText = buildAnalysisText(result)
    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `lecture-analysis-${new Date().toISOString().replace(/[:.]/g, '-')}.txt`
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

  const handleAnalyze = async () => {
    if (!canAnalyze) return

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
      await loadStats()
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to analyze lecture text.')
      setResult(null)
    } finally {
      setLoading(false)
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

  return (
    <div className="space-y-gutter pb-8">
      <section className="grid grid-cols-12 gap-gutter min-h-[calc(100vh-128px)]">
        <div className="col-span-12 xl:col-span-7 flex flex-col h-[calc(100vh-128px)] glass-panel rounded-xl overflow-hidden neon-glow-cyan">
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-sky-500/10 flex items-center justify-center">
                <Icon name="smart_toy" className="text-sky-400 text-lg" fill />
              </div>
              <span className="font-h3 text-h3 text-white">Lecture AI Assistant</span>
            </div>
            <div className="flex gap-2 items-center">
              <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold text-sky-400 border border-sky-400/20 uppercase tracking-tighter">Groq AI</span>
              <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold text-slate-300 border border-white/10 uppercase tracking-tighter">Language: {language}</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto chat-scroll p-6 space-y-6 bg-gradient-to-b from-transparent to-surface-container-lowest/30">
            <div className="flex items-start gap-4 mr-12" id="analysis-summary">
              <div className="w-8 h-8 shrink-0 rounded-lg bg-sky-500/20 border border-sky-500/40 flex items-center justify-center">
                <Icon name="auto_awesome" className="text-sky-400 text-sm" />
              </div>
              <div className="bg-surface-container-high/50 p-4 rounded-2xl rounded-tl-none border border-white/5 text-on-surface leading-relaxed shadow-sm">
                {summarySnippet}
              </div>
            </div>

            {text.trim() ? (
              <div className="flex items-start gap-4 ml-12 flex-row-reverse">
                <div className="w-8 h-8 shrink-0 rounded-lg bg-primary-container flex items-center justify-center">
                  <Icon name="person" className="text-on-primary-container text-sm" />
                </div>
                <div className="bg-primary-container/20 p-4 rounded-2xl rounded-tr-none border border-primary-container/30 text-on-surface shadow-sm max-w-[90%]">
                  {text}
                </div>
              </div>
            ) : null}

            {result ? (
              <div className="flex items-start gap-4 mr-12" id="analysis-topics">
                <div className="w-8 h-8 shrink-0 rounded-lg bg-sky-500/20 border border-sky-500/40 flex items-center justify-center">
                  <Icon name="analytics" className="text-sky-400 text-sm" />
                </div>
                <div className="bg-surface-container-high/50 p-5 rounded-2xl rounded-tl-none border border-white/5 text-on-surface space-y-4 shadow-sm w-full">
                  <p>Here is the structured breakdown of the lecture:</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="rounded-xl bg-black/30 border border-white/5 p-4" id="analysis-actions">
                      <p className="text-xs uppercase tracking-widest text-slate-400 mb-2">Action Plan</p>
                      <ul className="space-y-2 text-sm text-slate-200 list-disc list-inside">
                        {display.action_items.slice(0, 4).map((item, idx) => <li key={idx}>{item}</li>)}
                      </ul>
                    </div>
                    <div className="rounded-xl bg-black/30 border border-white/5 p-4" id="analysis-keywords">
                      <p className="text-xs uppercase tracking-widest text-slate-400 mb-2">Keywords</p>
                      <div className="flex flex-wrap gap-2">
                        {display.keywords.slice(0, 8).map((item, idx) => (
                          <span key={idx} className="px-2.5 py-1 rounded-full text-[11px] bg-sky-500/10 text-sky-300 border border-sky-400/20">{item}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="rounded-xl bg-black/30 border border-white/5 p-4">
                    <p className="text-xs uppercase tracking-widest text-slate-400 mb-2">Speaker Feedback</p>
                    <p className="text-sm text-on-surface-variant">{display.speaker_feedback || 'No speaker feedback available.'}</p>
                  </div>
                </div>
              </div>
            ) : null}

            <div id="analysis-history" className="mt-2 rounded-xl border border-white/5 bg-surface-container-low/50 p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-sm font-bold text-white">Recent Extraction</h4>
                  <p className="text-xs text-slate-500">Saved lecture analyses from MongoDB</p>
                </div>
                <button type="button" onClick={loadHistory} className="text-xs text-sky-400 hover:text-sky-300">Refresh</button>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                {historyLoading ? (
                  <div className="text-sm text-slate-500">Loading history...</div>
                ) : history.slice(0, 4).map((entry) => (
                  <div key={entry._id || entry.id} className="p-4 bg-white/5 rounded-lg border-l-2 border-primary-container flex items-center gap-4 group hover:bg-white/10 transition-colors">
                    <div className="w-10 h-10 rounded bg-black/50 flex items-center justify-center shrink-0">
                      <Icon name="description" className="text-sky-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">{entry.ai_output?.summary || 'Lecture Analysis'}</p>
                      <p className="text-xs text-slate-500">{entry.language || 'English'} • {new Date(entry.timestamp).toLocaleString()}</p>
                    </div>
                    <button type="button" onClick={() => handleExportPdf(entry._id || entry.id)} className="text-slate-600 group-hover:text-sky-400 transition-colors">
                      <Icon name="arrow_forward_ios" className="text-sm" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-white/10 bg-surface-container-low/50">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <select value={language} onChange={(e) => setLanguage(e.target.value)} className="rounded-xl bg-black/40 border border-white/10 px-3 py-3 text-on-surface text-sm outline-none">
                  {LANGUAGES.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
                <button type="button" onClick={handleAnalyze} disabled={!canAnalyze} className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-container to-secondary-container flex items-center justify-center text-on-primary-container hover:shadow-lg hover:shadow-sky-500/30 active:scale-95 transition-all disabled:opacity-50">
                  {loading ? <span className="h-5 w-5 rounded-full border-2 border-on-primary-container/30 border-t-on-primary-container animate-spin" /> : <Icon name="send" fill />}
                </button>
                <button type="button" onClick={handleDownloadText} disabled={!result} className="rounded-xl px-4 py-3 bg-white/5 border border-white/10 text-sm text-slate-200 hover:border-sky-400/40 hover:text-sky-300 transition-colors disabled:opacity-50">
                  Download TXT
                </button>
              </div>
              <div className="flex items-center gap-3">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste lecture transcript here..."
                  className="flex-1 min-h-24 bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-on-surface focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400/50 transition-all placeholder:text-slate-600"
                />
                <CopyButton value={display.summary || text} onCopy={handleCopy} copied={copiedKey === String(display.summary || text).trim()} />
              </div>
            </div>
            {error ? <div className="mt-3 rounded-xl border border-error/30 bg-error/10 text-error px-4 py-3 text-sm">{error}</div> : null}
          </div>
        </div>

        <aside className="col-span-12 xl:col-span-5 space-y-gutter">
          <div className="grid grid-cols-2 gap-4">
            <StatCard icon="book" accent="text-sky-400" label="Lectures Analyzed" value={stats.total_lectures_processed} delta={statsLoading ? '...' : '+12%'} />
            <StatCard icon="quiz" accent="text-secondary" label="Questions Gen" value={stats.total_questions_generated} delta={statsLoading ? '...' : '+8%'} />
          </div>

          {statsError ? <div className="rounded-xl border border-error/30 bg-error/10 text-error px-4 py-3 text-sm">{statsError}</div> : null}

          <div className="glass-panel rounded-xl p-6 relative overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-h3 font-h3 text-white">Usage Stats</h3>
                <p className="text-sm text-slate-500">Weekly analysis activity</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-sky-400" />
                <span className="text-xs text-slate-400">Activity Level</span>
              </div>
            </div>
            <div className="h-48 w-full relative flex items-end justify-between px-2">
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                <div className="border-t border-slate-500 w-full h-px" />
                <div className="border-t border-slate-500 w-full h-px" />
                <div className="border-t border-slate-500 w-full h-px" />
              </div>
              {fakeBars.map((height, idx) => (
                <div key={idx} className="z-10 flex flex-col items-center gap-2">
                  <div className="h-32 w-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="w-full bg-sky-500/50" style={{ height: `${height}%` }} />
                  </div>
                  <span className={`text-[10px] font-bold ${idx === 3 ? 'text-sky-400' : 'text-slate-500'}`}>{['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'][idx]}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-label-sm font-label-sm text-slate-400 uppercase">Smart Insight</h4>
              <Icon name="insights" className="text-sky-400" fill />
            </div>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              {history.length > 0
                ? 'Based on your last sessions, you often need formula clarifications. The assistant will prioritize concept expansion and exam-style questions.'
                : 'Start analyzing lectures to unlock smart insights about your learning patterns.'}
            </p>
          </div>

          <div className="glass-panel rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-label-sm font-label-sm text-slate-400 uppercase">Keyword Search</h4>
              <button type="button" onClick={handleSearch} className="text-xs text-sky-400 hover:text-sky-300">Search</button>
            </div>
            <div className="flex gap-2">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search records..."
                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-on-surface outline-none focus:border-sky-400"
              />
            </div>
            {searchError ? <div className="mt-3 text-sm text-error">{searchError}</div> : null}
            <div className="mt-4 space-y-2">
              {searchLoading ? <div className="text-sm text-slate-500">Searching...</div> : searchResults.slice(0, 3).map((item) => (
                <div key={item.id} className="rounded-lg border border-white/5 bg-white/5 p-3">
                  <p className="text-sm font-semibold text-white">{item.summary || 'Match found'}</p>
                  <p className="text-xs text-slate-500">{item.language || 'English'}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </div>
  )
}