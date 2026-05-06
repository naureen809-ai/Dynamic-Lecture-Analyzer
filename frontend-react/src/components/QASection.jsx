import React, { useEffect, useMemo, useState } from 'react'
import apiClient from '../api/apiClient'

export default function QASection({ analysisResult }) {
  const [selectedQuestion, setSelectedQuestion] = useState(null)
  const [userAnswer, setUserAnswer] = useState('')
  const [aiExplanation, setAiExplanation] = useState('')
  const [language, setLanguage] = useState(analysisResult?.language || 'English')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [answerSubmitted, setAnswerSubmitted] = useState(false)

  useEffect(() => {
    if (analysisResult?.language) {
      setLanguage(analysisResult.language)
    }
  }, [analysisResult?.language])

  const LANGUAGES = [
    'English', 'Hindi', 'Hinglish', 'Bengali', 'Tamil', 'Telugu', 'Marathi', 'Gujarati',
    'Punjabi', 'Urdu', 'Kannada', 'Malayalam', 'Odia', 'Assamese', 'Sanskrit', 'Konkani',
    'Maithili', 'Dogri', 'Manipuri', 'Bodo', 'Santhali', 'Kashmiri', 'Sindhi', 'Nepali'
  ]

  const extractQuestionText = (item) => {
    if (!item) return ''
    if (typeof item === 'string') return item
    return item.question || item.text || item.prompt || ''
  }

  const extractReferenceAnswer = (item) => {
    if (!item || typeof item === 'string') return ''
    return item.answer || item.correct_answer || item.explanation || item.reason || ''
  }

  const allQuestions = [
    ...(analysisResult?.questions?.mcqs || []),
    ...(analysisResult?.questions?.short_questions || []),
    ...(analysisResult?.questions?.viva_questions || [])
  ]

  const currentQuestionData = useMemo(() => {
    const match = allQuestions.find((item) => extractQuestionText(item) === selectedQuestion)
    return match || null
  }, [allQuestions, selectedQuestion])

  const lectureContext = useMemo(() => {
    const parts = []
    if (analysisResult?.summary) parts.push(`Summary: ${analysisResult.summary}`)
    if (Array.isArray(analysisResult?.topics) && analysisResult.topics.length) parts.push(`Topics: ${analysisResult.topics.join(', ')}`)
    if (Array.isArray(analysisResult?.keywords) && analysisResult.keywords.length) parts.push(`Keywords: ${analysisResult.keywords.join(', ')}`)
    if (Array.isArray(analysisResult?.action_items) && analysisResult.action_items.length) parts.push(`Action Items: ${analysisResult.action_items.join(', ')}`)
    if (Array.isArray(analysisResult?.notes?.short_notes) && analysisResult.notes.short_notes.length) parts.push(`Short Notes: ${analysisResult.notes.short_notes.join(' | ')}`)
    if (Array.isArray(analysisResult?.notes?.detailed_notes) && analysisResult.notes.detailed_notes.length) parts.push(`Detailed Notes: ${analysisResult.notes.detailed_notes.join(' | ')}`)
    return parts.join('\n\n')
  }, [analysisResult])

  const handleSubmitAnswer = async () => {
    if (!selectedQuestion || !userAnswer.trim()) return

    setLoading(true)
    setError('')
    setAiExplanation('')
    setAnswerSubmitted(false)

    try {
      const referenceAnswer = extractReferenceAnswer(currentQuestionData)
      const res = await apiClient.chat({
        message: `Question: ${selectedQuestion}\nMy Answer: ${userAnswer}\nReference Answer: ${referenceAnswer || 'Not provided'}\n\nPlease do three things: 1) Tell me if my answer is correct or wrong. 2) Explain the correct answer in very simple and easy words for a beginner. 3) If the answer is wrong, show the correct answer first and then explain why. Keep the explanation short, clear, and in ${language}.`,
        context_text: lectureContext,
        language
      })

      const explanation = res?.data?.data?.response || 'Unable to generate explanation'
      setAiExplanation(explanation)
      setAnswerSubmitted(true)
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Failed to get explanation'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="rounded-2xl shadow-2xl border p-6 md:p-8 transition-all duration-400" style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
      <header className="pb-6 border-b transition-colors duration-400" style={{ borderColor: 'var(--color-border)' }}>
        <p className="text-xs tracking-[0.28em] uppercase font-bold transition-colors duration-400" style={{ color: 'var(--color-primary)' }}>❓ Q&A Practice</p>
        <h1 className="mt-3 text-3xl md:text-4xl font-black transition-colors duration-400" style={{ color: 'var(--color-text)' }}>Question & Answer Practice</h1>
        <p className="mt-2 text-sm transition-colors duration-400" style={{ color: 'var(--color-textMuted)' }}>Practice with AI-generated questions and get instant feedback on your answers</p>
        <div className="mt-4 max-w-xs">
          <label className="block text-sm font-semibold mb-2 transition-colors duration-400" style={{ color: 'var(--color-text)' }}>
            🌍 Answer Language
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
      </header>

      {allQuestions.length === 0 ? (
        <div className="mt-8 rounded-xl border p-8 text-center transition-colors duration-400" style={{ backgroundColor: 'var(--color-bgSecondary)', borderColor: 'var(--color-border)', color: 'var(--color-textMuted)' }}>
          <p className="text-lg font-semibold">📚 No questions available yet</p>
          <p className="text-sm mt-2">Run an AI Analysis first to generate questions for practice</p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Questions List */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-bold mb-4 transition-colors duration-400" style={{ color: 'var(--color-text)' }}>📋 Available Questions</h3>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {allQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedQuestion(extractQuestionText(q))
                    setUserAnswer('')
                    setAiExplanation('')
                    setAnswerSubmitted(false)
                  }}
                  className="w-full text-left p-3 rounded-lg border transition-all duration-400 text-sm"
                  style={{
                    backgroundColor: selectedQuestion === extractQuestionText(q) ? `var(--color-primary)20` : 'var(--color-bgSecondary)',
                    borderColor: selectedQuestion === extractQuestionText(q) ? 'var(--color-primary)' : 'var(--color-border)',
                    color: 'var(--color-text)'
                  }}
                >
                  <p className="line-clamp-2">{extractQuestionText(q)}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Question Details */}
          <div className="lg:col-span-2 space-y-6">
            {selectedQuestion ? (
              <>
                <div className="rounded-xl border p-6 transition-colors duration-400" style={{ backgroundColor: 'var(--color-bgSecondary)', borderColor: 'var(--color-border)' }}>
                  <h3 className="text-sm uppercase tracking-widest font-bold mb-3 transition-colors duration-400" style={{ color: 'var(--color-primary)' }}>Current Question</h3>
                  <p className="text-lg font-semibold leading-6 transition-colors duration-400" style={{ color: 'var(--color-text)' }}>
                    {selectedQuestion}
                  </p>
                  {currentQuestionData && extractReferenceAnswer(currentQuestionData) && (
                    <p className="mt-3 text-sm leading-6 transition-colors duration-400" style={{ color: 'var(--color-textMuted)' }}>
                      Tip: This question has a built-in reference answer. After you submit, the AI will explain it in very easy words.
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-semibold transition-colors duration-400" style={{ color: 'var(--color-text)' }}>
                    ✍️ Your Answer
                  </label>
                  <textarea
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Write your answer here..."
                    className="w-full min-h-32 rounded-xl border p-4 text-sm focus:outline-none focus:ring-2 transition-all resize-none"
                    style={{
                      borderColor: 'var(--color-border)',
                      backgroundColor: 'var(--color-bgSecondary)',
                      color: 'var(--color-text)'
                    }}
                  />
                </div>

                {error && (
                  <div className="rounded-xl border px-4 py-3 text-sm font-semibold transition-colors duration-400" style={{ borderColor: 'var(--color-danger)', backgroundColor: `var(--color-danger)15`, color: 'var(--color-danger)' }}>
                    ⚠️ {error}
                  </div>
                )}

                <button
                  onClick={handleSubmitAnswer}
                  disabled={!userAnswer.trim() || loading}
                  className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-cyan-500/40"
                >
                  {loading ? '⏳ Getting Feedback...' : '📤 Submit & Get Feedback'}
                </button>

                {answerSubmitted && aiExplanation && (
                  <div className="rounded-xl border p-6 transition-colors duration-400" style={{ backgroundColor: 'var(--color-bgSecondary)', borderColor: 'var(--color-primary)' }}>
                    <h3 className="text-sm uppercase tracking-widest font-bold mb-3 transition-colors duration-400" style={{ color: 'var(--color-primary)' }}>🤖 AI Feedback & Explanation</h3>
                    <p className="text-sm leading-6 transition-colors duration-400" style={{ color: 'var(--color-text)' }}>
                      {aiExplanation}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-xl border p-8 text-center transition-colors duration-400" style={{ backgroundColor: 'var(--color-bgSecondary)', borderColor: 'var(--color-border)', color: 'var(--color-textMuted)' }}>
                <p className="text-lg font-semibold">👈 Select a question to start practicing</p>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
