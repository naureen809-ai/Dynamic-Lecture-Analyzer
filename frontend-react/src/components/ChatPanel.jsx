import React, { useMemo, useState } from 'react'
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

function MessageBubble({ role, content }) {
  const isUser = role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className="max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-xl border transition-colors duration-400"
        style={{
          backgroundColor: isUser ? 'var(--color-primary)' : 'var(--color-bgSecondary)',
          color: isUser ? 'var(--color-bg)' : 'var(--color-text)',
          borderColor: isUser ? `var(--color-primary)40` : 'var(--color-border)'
        }}
      >
        {content}
      </div>
    </div>
  )
}

export default function ChatPanel({ analysisResult }) {
  const [language, setLanguage] = useState('English')
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: analysisResult && analysisResult.summary 
        ? `🎓 Welcome to Educational Tutor! I've analyzed your lecture: "${analysisResult.summary.substring(0, 80)}...". Ask me any questions about this lecture content. I'll only answer questions related to this lecture.`
        : '🎓 Welcome to Educational Tutor! I\'m here to help you understand your lecture topics. First, analyze a lecture in the AI Analysis section, then ask me questions about it. I focus exclusively on educational content from the lecture.'
    }
  ])

  const canSend = useMemo(() => input.trim().length > 0 && !loading, [input, loading])

  const handleCopy = async (text) => {
    const value = String(text || '').trim()
    if (!value) return

    try {
      await navigator.clipboard.writeText(value)
    } catch {
      setError('Unable to copy. Please try again.')
    }
  }

  const handleSend = async () => {
    if (!canSend) return

    const userMessage = input.trim()
    const nextMessages = [...messages, { role: 'user', content: userMessage }]

    setMessages(nextMessages)
    setInput('')
    setError('')
    setLoading(true)

    try {
      // Build context from analysis result
      let contextText = ''
      if (analysisResult && analysisResult.summary) {
        contextText = `Lecture Summary: ${analysisResult.summary}\n\n`
        if (analysisResult.topics && analysisResult.topics.length) {
          contextText += `Topics: ${analysisResult.topics.join(', ')}\n\n`
        }
        if (analysisResult.keywords && analysisResult.keywords.length) {
          contextText += `Keywords: ${analysisResult.keywords.join(', ')}\n\n`
        }
        if (analysisResult.action_items && analysisResult.action_items.length) {
          contextText += `Action Items: ${analysisResult.action_items.join(', ')}\n\n`
        }
        if (analysisResult.notes && analysisResult.notes.short_notes && analysisResult.notes.short_notes.length) {
          contextText += `Notes: ${analysisResult.notes.short_notes.join(', ')}`
        }
      }

      const res = await apiClient.chat({
        message: userMessage,
        context_text: contextText,
        language,
        history: nextMessages.slice(-8)
      })

      const reply =
        res?.data?.data?.response ||
        'I could not generate a response right now. Please try again.'

      setMessages((prev) => [...prev, { role: 'assistant', content: reply }])
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Chat request failed.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="rounded-2xl shadow-2xl border p-6 md:p-8 transition-all duration-400" style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b transition-colors duration-400" style={{ borderColor: 'var(--color-border)' }}>
        <div>
          <p className="text-xs tracking-[0.28em] uppercase font-bold transition-colors duration-400" style={{ color: 'var(--color-primary)' }}>📚 Educational Tutor</p>
          <h1 className="mt-3 text-3xl md:text-4xl font-black transition-colors duration-400" style={{ color: 'var(--color-text)' }}>Study Assistant</h1>
        </div>
        <select
          value={language}
          onChange={(event) => setLanguage(event.target.value)}
          className="rounded-xl border px-4 py-2 text-sm font-semibold focus:outline-none focus:ring-2 transition-all"
          style={{
            borderColor: 'var(--color-border)',
            backgroundColor: 'var(--color-bgSecondary)',
            color: 'var(--color-text)'
          }}
        >
          {LANGUAGES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </header>

      <div className="mt-6 rounded-2xl border p-5 h-[340px] overflow-y-auto space-y-3 transition-colors duration-400" style={{ backgroundColor: 'var(--color-bgSecondary)', borderColor: 'var(--color-border)' }}>
        {messages.map((item, idx) => (
          <MessageBubble key={`${item.role}-${idx}`} role={item.role} content={item.content} />
        ))}
        {loading && (
          <div className="text-xs animate-pulse font-semibold transition-colors duration-400" style={{ color: 'var(--color-primary)' }}>✨ Analyzing and generating response...</div>
        )}
      </div>

      {error && (
        <div className="mt-4 rounded-xl border px-4 py-3 text-sm font-semibold transition-colors duration-400" style={{ borderColor: 'var(--color-danger)', backgroundColor: `var(--color-danger)15`, color: 'var(--color-danger)' }}>
          ⚠️ {error}
        </div>
      )}

      <div className="mt-6 flex flex-col md:flex-row gap-3">
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask about lecture concepts, definitions, examples, formulas, or exam prep..."
          className="flex-1 min-h-24 rounded-xl border p-4 text-sm focus:outline-none focus:ring-2 transition-all resize-none"
          style={{
            borderColor: 'var(--color-border)',
            backgroundColor: 'var(--color-bgSecondary)',
            color: 'var(--color-text)',
            focusRingColor: 'var(--color-primary)'
          }}
        />
        <div className="flex md:flex-col gap-2">
          <button
            type="button"
            onClick={handleSend}
            disabled={!canSend}
            className="rounded-xl px-4 py-3 text-sm font-bold bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-white disabled:cursor-not-allowed disabled:from-slate-600 disabled:to-slate-600 disabled:text-slate-400 transition-all shadow-lg hover:shadow-cyan-500/40 disabled:shadow-none"
          >
            {loading ? '⏳ Sending...' : '📤 Send'}
          </button>
          <button
            type="button"
            onClick={() => handleCopy(messages.map((item) => `${item.role}: ${item.content}`).join('\n\n'))}
            className="rounded-xl border px-4 py-3 text-sm font-semibold transition-all shadow-md"
            style={{
              borderColor: 'var(--color-border)',
              backgroundColor: 'var(--color-bgSecondary)',
              color: 'var(--color-text)'
            }}
          >
            Copy Chat
          </button>
        </div>
      </div>
    </section>
  )
}
