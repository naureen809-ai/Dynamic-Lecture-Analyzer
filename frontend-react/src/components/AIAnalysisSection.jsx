import React, { useState } from 'react'
import apiClient from '../api/apiClient'

export default function AIAnalysisSection({ analysisResult, onAnalysisComplete }) {
  const [input, setText] = useState('')
  const [language, setLanguage] = useState('English')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const LANGUAGES = [
    'English', 'Hindi', 'Hinglish', 'Bengali', 'Tamil', 'Telugu', 'Marathi',
    'Gujarati', 'Punjabi', 'Urdu', 'Kannada', 'Malayalam', 'Odia', 'Assamese',
    'Sanskrit', 'Konkani', 'Maithili', 'Dogri', 'Manipuri', 'Bodo', 'Santhali',
    'Kashmiri', 'Sindhi', 'Nepali'
  ]

  const canAnalyze = input.trim().length > 10 && !loading

  const handleAnalyze = async () => {
    if (!canAnalyze) return

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await apiClient.analyze(input.trim(), language)
      const data = res?.data?.data?.ai_output || res?.data?.data || res?.data || {}
      setResult(data)
      onAnalysisComplete?.(data)
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Analysis failed'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="rounded-2xl shadow-2xl border p-6 md:p-8 transition-all duration-400" style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
      <header className="pb-6 border-b transition-colors duration-400" style={{ borderColor: 'var(--color-border)' }}>
        <p className="text-xs tracking-[0.28em] uppercase font-bold transition-colors duration-400" style={{ color: 'var(--color-primary)' }}>🤖 AI Analysis</p>
        <h1 className="mt-3 text-3xl md:text-4xl font-black transition-colors duration-400" style={{ color: 'var(--color-text)' }}>Advanced Lecture Analysis</h1>
        <p className="mt-2 text-sm transition-colors duration-400" style={{ color: 'var(--color-textMuted)' }}>Get AI-powered insights, summaries, and structured analysis of your lectures</p>
      </header>

      <div className="mt-6 space-y-6">
        <div className="space-y-3">
          <label className="block text-sm font-semibold transition-colors duration-400" style={{ color: 'var(--color-text)' }}>
            📋 Lecture Content
          </label>
          <textarea
            value={input}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your complete lecture transcript or notes here (minimum 10 characters)..."
            className="w-full min-h-40 rounded-xl border p-4 text-sm focus:outline-none focus:ring-2 transition-all resize-none"
            style={{
              borderColor: 'var(--color-border)',
              backgroundColor: 'var(--color-bgSecondary)',
              color: 'var(--color-text)'
            }}
          />
          <div className="flex justify-between items-center text-xs transition-colors duration-400" style={{ color: 'var(--color-textMuted)' }}>
            <span>{input.length} characters</span>
            <span>{input.length >= 10 ? '✅ Ready' : '⏳ Need more content'}</span>
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-semibold transition-colors duration-400" style={{ color: 'var(--color-text)' }}>
            🌍 Language
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full rounded-xl border px-4 py-2 text-sm font-semibold focus:outline-none focus:ring-2 transition-all"
            style={{
              borderColor: 'var(--color-border)',
              backgroundColor: 'var(--color-bgSecondary)',
              color: 'var(--color-text)'
            }}
          >
            {LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="rounded-xl border px-4 py-3 text-sm font-semibold transition-colors duration-400" style={{ borderColor: 'var(--color-danger)', backgroundColor: `var(--color-danger)15`, color: 'var(--color-danger)' }}>
            ⚠️ {error}
          </div>
        )}

        <button
          onClick={handleAnalyze}
          disabled={!canAnalyze}
          className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-cyan-500/40"
        >
          {loading ? '⏳ Analyzing...' : '🚀 Analyze with AI'}
        </button>

        {result && (
          <div className="mt-8 space-y-6">
            <div className="rounded-xl border p-6 transition-colors duration-400" style={{ backgroundColor: 'var(--color-bgSecondary)', borderColor: 'var(--color-border)' }}>
              <h3 className="text-lg font-bold mb-3 transition-colors duration-400" style={{ color: 'var(--color-primary)' }}>📊 Summary</h3>
              <p className="text-sm leading-6 transition-colors duration-400" style={{ color: 'var(--color-text)' }}>
                {result.summary || 'No summary generated'}
              </p>
            </div>

            <div className="rounded-xl border p-6 transition-colors duration-400" style={{ backgroundColor: 'var(--color-bgSecondary)', borderColor: 'var(--color-border)' }}>
              <h3 className="text-lg font-bold mb-3 transition-colors duration-400" style={{ color: 'var(--color-primary)' }}>🏷️ Key Topics</h3>
              <div className="flex flex-wrap gap-2">
                {result.topics?.length ? (
                  result.topics.map((topic, idx) => (
                    <span key={idx} className="px-3 py-1 rounded-full text-xs font-semibold transition-colors duration-400" style={{ backgroundColor: `var(--color-primary)20`, color: 'var(--color-primary)', borderColor: `var(--color-primary)40`, border: '1px solid' }}>
                      {topic}
                    </span>
                  ))
                ) : (
                  <p style={{ color: 'var(--color-textMuted)' }}>No topics identified</p>
                )}
              </div>
            </div>

            <div className="rounded-xl border p-6 transition-colors duration-400" style={{ backgroundColor: 'var(--color-bgSecondary)', borderColor: 'var(--color-border)' }}>
              <h3 className="text-lg font-bold mb-3 transition-colors duration-400" style={{ color: 'var(--color-primary)' }}>✅ Action Items</h3>
              <ol className="list-decimal pl-5 space-y-2">
                {result.action_items?.length ? (
                  result.action_items.map((item, idx) => (
                    <li key={idx} style={{ color: 'var(--color-text)' }}>{item}</li>
                  ))
                ) : (
                  <p style={{ color: 'var(--color-textMuted)' }}>No action items found</p>
                )}
              </ol>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
