import React, { useEffect, useMemo, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import apiClient from './api/apiClient'
import { useTheme } from './context/ThemeContext'
import { getErrorMessage } from './utils/errorHandler'
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
  const { currentTheme, toggleTheme, themes } = useTheme()
  const themeNames = Object.keys(themes)
  
  return (
    <header className="sticky top-0 z-40 md:ml-[280px] ml-0 h-20 flex items-center justify-between px-8 transition-colors duration-400" style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)', borderBottom: '1px solid var(--color-border)', backdropFilter: 'blur(12px)' }}>
      <div className="flex items-center gap-8">
        <div>
          <h1 className="text-2xl font-black tracking-tight transition-colors duration-400" style={{ color: 'var(--color-text)' }}>Lecture Analytics</h1>
        </div>
        <nav className="hidden sm:flex flex-wrap gap-4">
          {topNavItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className="text-xs uppercase tracking-widest font-bold transition-all duration-300 pb-1 border-b-2"
              style={{
                color: activeSection === item.id ? 'var(--color-primary)' : 'var(--color-textMuted)',
                borderColor: activeSection === item.id ? 'var(--color-primary)' : 'transparent'
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          type="button"
          className="px-4 py-2 rounded-xl transition-all duration-300 text-xs uppercase font-bold tracking-wider border"
          title={`Theme: ${themes && themes[currentTheme] ? themes[currentTheme].name : 'Dark'}`}
          style={{
            backgroundColor: `var(--color-bgSecondary)`,
            color: `var(--color-text)`,
            borderColor: `var(--color-border)`
          }}
        >
          <span className="inline-block capitalize">{themes && themes[currentTheme] ? themes[currentTheme].name : 'Dark'}</span>
          <span className="ml-2 text-base">⚡</span>
        </button>
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

  useEffect(() => {
    if (activeSection === 'analysis-history') {
      loadHistory()
    }
  }, [activeSection])

  async function loadStats() {
    setStatsLoading(true)
    setStatsError('')

    try {
      const res = await apiClient.stats()
      setStats(res?.data?.data || { total_lectures_processed: 0, total_questions_generated: 0 })
    } catch (err) {
      setStatsError(getErrorMessage(err))
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
      setHistoryError(getErrorMessage(err))
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
      setError(getErrorMessage(err))
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
      setError(getErrorMessage(err))
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
      setSearchError(getErrorMessage(err))
      setSearchResults([])
    } finally {
      setSearchLoading(false)
    }
  }

  async function handleCopy(value) {
    const payload = String(value || '').trim()
    if (!payload) return

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(payload)
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

  const buildReportText = (analysis) => {
    const safe = analysis || EMPTY_RESULT
    return [
      'Lecture Analyzer Report',
      '',
      'Summary',
      safe.summary || 'No summary available.',
      '',
      'Topics',
      ...(safe.topics || []),
      '',
      'Action Items',
      ...(safe.action_items || []),
      '',
      'Keywords',
      (safe.keywords || []).join(', '),
      '',
      'Speaker Feedback',
      safe.speaker_feedback || 'No speaker feedback available.',
      '',
      'Short Notes',
      ...(safe.notes?.short_notes || []),
      '',
      'Detailed Notes',
      ...(safe.notes?.detailed_notes || []),
      '',
      'MCQs',
      ...(safe.questions?.mcqs || []).map((question) => question.question || ''),
      '',
      'Short Questions',
      ...(safe.questions?.short_questions || []),
      '',
      'Viva Questions',
      ...(safe.questions?.viva_questions || [])
    ]
      .filter((line) => line !== null && line !== undefined)
      .join('\n')
  }

  const fullReportText = buildReportText(analysisResult)

  return (
    <Routes>
      <Route
        path="/*"
        element={
          <div className="app-root min-h-screen transition-colors duration-400" style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}>
            <TopBar activeSection={activeSection} onNavigate={setActiveSection} />
            <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} onNewAnalysis={resetAnalysis} />
              <main className="md:ml-[280px] ml-0 p-gutter min-h-[calc(100vh-80px)]">
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
                    copied={copiedKey === fullReportText}
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
        }
      />
    </Routes>
  )
}
