import React, { useMemo, useState } from 'react'
import apiClient from '../api/apiClient'

const LANGUAGES = ['English', 'Hindi', 'Hinglish']

function MessageBubble({ role, content }) {
  const isUser = role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-xl border ${
          isUser
            ? 'bg-cyan-300 text-slate-950 border-cyan-200'
            : 'bg-slate-900/80 text-slate-100 border-slate-700'
        }`}
      >
        {content}
      </div>
    </div>
  )
}

export default function ChatPanel() {
  const [language, setLanguage] = useState('English')
  const [contextText, setContextText] = useState('')
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I am your lecture AI tutor. Ask anything about your topic.'
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
    <section className="rounded-2xl shadow-xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 md:p-8">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <p className="text-xs tracking-[0.28em] uppercase text-cyan-300/90">Tutor Chat</p>
          <h1 className="mt-2 text-3xl font-extrabold text-white">Lecture Q&A Assistant</h1>
        </div>
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
      </header>

      <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
        <label className="text-xs uppercase tracking-[0.18em] text-slate-400">Optional lecture context</label>
        <textarea
          value={contextText}
          onChange={(event) => setContextText(event.target.value)}
          placeholder="Paste lecture context for more accurate answers..."
          className="mt-2 w-full min-h-24 rounded-xl border border-slate-700 bg-slate-950/90 p-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400"
        />
      </div>

      <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 h-[340px] overflow-y-auto space-y-3">
        {messages.map((item, idx) => (
          <MessageBubble key={`${item.role}-${idx}`} role={item.role} content={item.content} />
        ))}
        {loading && (
          <div className="text-xs text-cyan-300 animate-pulse">Analyzing and generating response...</div>
        )}
      </div>

      {error && (
        <div className="mt-3 rounded-xl border border-rose-700/40 bg-rose-900/20 px-3 py-2 text-sm text-rose-300">
          {error}
        </div>
      )}

      <div className="mt-4 flex flex-col md:flex-row gap-3">
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask about concepts, revision, interview questions, or examples..."
          className="flex-1 min-h-24 rounded-xl border border-slate-700 bg-slate-950/90 p-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400"
        />
        <div className="flex md:flex-col gap-2">
          <button
            type="button"
            onClick={handleSend}
            disabled={!canSend}
            className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-950 bg-cyan-300 hover:bg-cyan-200 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400 transition-colors"
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
          <button
            type="button"
            onClick={() => handleCopy(messages.map((item) => `${item.role}: ${item.content}`).join('\n\n'))}
            className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-200 hover:border-cyan-400 hover:text-cyan-200"
          >
            Copy Chat
          </button>
        </div>
      </div>
    </section>
  )
}
