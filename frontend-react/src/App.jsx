import React, { useEffect, useMemo, useState } from 'react'
import apiClient from './api/apiClient'
import Sidebar from './components/Sidebar'
import InputSection from './components/InputSection'
import SummarySection from './components/SummarySection'
import TopicsSection from './components/TopicsSection'
import ActionPlanSection from './components/ActionPlanSection'
import KeywordsSection from './components/KeywordsSection'
import HistorySection from './components/HistorySection'
import ReportsSection from './components/ReportsSection'
import DashboardSection from './components/DashboardSection'
import ChatSection from './components/ChatSection'
import './styles/index.css'

const topNavItems = [
  { id: 'dashboard', label: 'Overview' },
  { id: 'chat', label: 'Insights' },
  { id: 'reports', label: 'Reports' }
]

function TopBar({ activeSection, onNavigate }) {
  return (
    <header className="app-topbar sticky top-0 z-40 ml-[280px] h-20 flex items-center justify-between px-8 bg-slate-950/90 backdrop-blur-xl border-b border-white/5">
      <div className="flex items-center gap-8">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight">AI Lecture Intelligence</h1>
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500 mt-1">Intelligence Panel</p>
        </div>
        <nav className="hidden md:flex gap-6">
          {topNavItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`text-xs uppercase tracking-widest font-semibold transition-all ${
                activeSection === item.id
                  ? 'text-sky-400 border-b-2 border-sky-400 pb-1'
                  : 'text-slate-400 hover:text-white opacity-80 hover:opacity-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-3 text-slate-400">
        <button className="icon-button" type="button" aria-label="Dark mode">
          <span className="material-symbols-outlined">dark_mode</span>
        </button>
        <button className="icon-button relative" type="button" aria-label="Notifications">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-2 right-2 w-2 h-2 bg-secondary rounded-full" />
        </button>
        <button className="icon-button" type="button" aria-label="Settings">
          <span className="material-symbols-outlined">settings</span>
        </button>
        <div className="ml-4 pl-4 border-l border-white/10 flex items-center gap-3">
          <img
            alt="Administrator profile"
            className="w-8 h-8 rounded-lg object-cover border border-white/10"
            src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=96&h=96&fit=crop&crop=faces"
          />
        </div>
      </div>
    </header>
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

function normalizePayload(payload) {
  return {
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
    segmentation: Array.isArray(payload.segmentation) ? payload.segmentation : [],
    id: payload.id || payload._id || payload.document_id || payload.documentId || null
  }
}

export default function App() {
  const [activeSection, setActiveSection] = useState('dashboard')
  const [text, setText] = useState('')
  const [language, setLanguage] = useState('English')
  const [analysisResult, setAnalysisResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [stats, setStats] = useState({ total_lectures_processed: 0, total_questions_generated: 0 })
  const [statsLoading, setStatsLoading] = useState(false)
  const [statsError, setStatsError] = useState('')
  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [copiedKey, setCopiedKey] = useState('')

  const canAnalyze = useMemo(() => text.trim().length > 0 && !loading, [text, loading])
  const canDownload = useMemo(() => {
    return Boolean(
      analysisResult && (
        analysisResult.summary ||
        analysisResult.speaker_feedback ||
        (Array.isArray(analysisResult.topics) && analysisResult.topics.length) ||
        (Array.isArray(analysisResult.action_items) && analysisResult.action_items.length) ||
        (Array.isArray(analysisResult.keywords) && analysisResult.keywords.length)
      )
    )
  }, [analysisResult])

  const currentResult = analysisResult || EMPTY_RESULT

  useEffect(() => {
    loadStats()
    loadHistory()
  }, [])

  async function loadStats() {
    setStatsLoading(true)
    setStatsError('')

    try {
      const res = await apiClient.stats()
      setStats(res?.data?.data || { total_lectures_processed: 0, total_questions_generated: 0 })
    } catch (err) {
      setStatsError(err?.response?.data?.message || err?.message || 'Unable to load statistics.')
    } finally {
      setStatsLoading(false)
    }
  }

  async function loadHistory() {
    setHistoryLoading(true)
    setHistoryError('')

    try {
      const res = await apiClient.history(8)
      setHistory(Array.isArray(res?.data?.data) ? res.data.data : [])
    } catch (err) {
      setHistoryError(err?.response?.data?.message || err?.message || 'Unable to fetch history.')
    } finally {
      setHistoryLoading(false)
    }
  }

  async function handleAnalyze() {
    if (!canAnalyze) return

    setLoading(true)
    setError('')

    try {
      const res = await apiClient.analyze(text.trim(), language)
      const payload = res?.data?.data?.ai_output || res?.data?.data || res?.data || {}
      setAnalysisResult(normalizePayload(payload))
      setActiveSection('analysis-summary')
      await loadHistory()
      await loadStats()
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to analyze lecture text.')
      setAnalysisResult(null)
    } finally {
      setLoading(false)
    }
  }

  async function handleExportPdf(documentId) {
    if (!documentId) {
      setError('No document available for export.')
      return
    }

    try {
      const res = await apiClient.exportPdf(documentId)
      const blob = new Blob([res.data], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `lecture-analysis-${documentId}.pdf`
      document.body.appendChild(anchor)
      anchor.click()
      document.body.removeChild(anchor)
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Unable to export PDF.')
    }
  }

  async function handleSearch(query) {
    const q = String(query || '').trim()
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

  function handleCopy(value) {
    const payload = String(value || '').trim()
    if (!payload) return

    try {
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(payload)
      }
      setCopiedKey(payload)
      setTimeout(() => setCopiedKey(''), 1400)
    } catch {
      setError('Unable to copy text. Please copy manually.')
    }
  }

  function handleSelectHistory(entry) {
    const payload = entry.ai_output || entry.ai_output || entry
    setAnalysisResult(normalizePayload(payload))
    setText(entry.input_text || '')
    setActiveSection('analysis-summary')
  }

  function resetAnalysis() {
    setText('')
    setAnalysisResult(null)
    setError('')
    setActiveSection('analysis-input')
  }

  const exportDocumentId = analysisResult?.id || analysisResult?.document_id || analysisResult?.documentId || null

  return (
    <div className="app-root min-h-screen">
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} onNewAnalysis={resetAnalysis} />
      <TopBar activeSection={activeSection} onNavigate={setActiveSection} />
      <main className="ml-[280px] p-gutter min-h-[calc(100vh-80px)]">
        {activeSection === 'dashboard' && (
          <DashboardSection
            analysisResult={analysisResult}
            stats={stats}
            statsLoading={statsLoading}
            statsError={statsError}
          />
        )}

        {activeSection === 'chat' && <ChatSection />}

        {activeSection === 'reports' && (
          <ReportsSection
            analysisResult={analysisResult}
            onCopy={handleCopy}
            copied={copiedKey === 'full-report'}
            onExportPdf={handleExportPdf}
            exportId={exportDocumentId}
          />
        )}

        {activeSection === 'analysis-input' && (
          <InputSection
            text={text}
            language={language}
            onTextChange={setText}
            onLanguageChange={setLanguage}
            onAnalyze={handleAnalyze}
            onDownload={() => {
              const reportText = [
                'Lecture Summary',
                analysisResult?.summary || 'No summary available.',
                'Topics',
                ...(analysisResult?.topics || []),
                'Action Items',
                ...(analysisResult?.action_items || []),
                'Keywords',
                ...(analysisResult?.keywords || []),
                'Speaker Feedback',
                analysisResult?.speaker_feedback || 'No feedback available.'
              ].join('\n\n')
              const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' })
              const url = URL.createObjectURL(blob)
              const anchor = document.createElement('a')
              anchor.href = url
              anchor.download = `lecture-analysis-${new Date().toISOString().replace(/[:.]/g, '-')}.txt`
              document.body.appendChild(anchor)
              anchor.click()
              document.body.removeChild(anchor)
              URL.revokeObjectURL(url)
            }}
            loading={loading}
            error={error}
            canAnalyze={canAnalyze}
            canDownload={canDownload}
          />
        )}

        {activeSection === 'analysis-summary' && (
          <SummarySection
            analysisResult={analysisResult}
            onCopy={handleCopy}
            copied={copiedKey === analysisResult?.summary}
          />
        )}

        {activeSection === 'analysis-topics' && (
          <TopicsSection
            analysisResult={analysisResult}
            onCopy={handleCopy}
            copied={copiedKey === (analysisResult?.topics || []).join('\n')}
          />
        )}

        {activeSection === 'analysis-actions' && (
          <ActionPlanSection
            analysisResult={analysisResult}
            onCopy={handleCopy}
            copied={copiedKey === (analysisResult?.action_items || []).join('\n')}
          />
        )}

        {activeSection === 'analysis-keywords' && (
          <KeywordsSection
            analysisResult={analysisResult}
            onCopy={handleCopy}
            copied={copiedKey === (analysisResult?.keywords || []).join(', ')}
          />
        )}

        {activeSection === 'analysis-history' && (
          <HistorySection
            history={history}
            historyLoading={historyLoading}
            historyError={historyError}
            searchResults={searchResults}
            searchLoading={searchLoading}
            searchError={searchError}
            onSearch={handleSearch}
            onRefreshHistory={loadHistory}
            onSelectHistory={handleSelectHistory}
            onExportPdf={handleExportPdf}
          />
        )}
      </main>
    </div>
  )
}
