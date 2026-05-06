import React, { useState } from 'react'
import apiClient from '../api/apiClient'

export default function MCQGeneratorSection() {
  const [topic, setTopic] = useState('')
  const [language, setLanguage] = useState('English')
  const [mcqs, setMcqs] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [analyzed, setAnalyzed] = useState(false)

  const LANGUAGES = ['English', 'Hindi', 'Hinglish', 'Bengali', 'Tamil', 'Telugu', 'Marathi', 'Gujarati', 'Punjabi', 'Urdu', 'Kannada', 'Malayalam', 'Odia', 'Assamese', 'Sanskrit', 'Konkani', 'Maithili', 'Dogri', 'Manipuri', 'Bodo', 'Santhali', 'Kashmiri', 'Sindhi', 'Nepali']

  const currentMcq = mcqs[currentIndex] || null

  const normalizeText = (value) => String(value || '').trim().toLowerCase().replace(/^[a-d]\.?\s*/i, '')

  const isCorrectAnswer = (option) => {
    const selected = normalizeText(option)
    const correct = normalizeText(currentMcq?.answer)
    return selected && correct && selected === correct
  }

  const getQuestionState = () => {
    if (!selectedAnswer || !currentMcq) return null
    return isCorrectAnswer(selectedAnswer)
  }

  const handleGenerate = async () => {
    if (!topic.trim() || topic.length < 5) {
      setError('Please enter a valid topic (minimum 5 characters)')
      return
    }

    setLoading(true)
    setError('')
    setMcqs([])
    setCurrentIndex(0)
    setSelectedAnswer('')
    
    try {
      const response = await apiClient.generateMcqs({
        topic: topic.trim(),
        language,
        count: 5
      })
      
      if (response?.data?.data) {
        const aiOutput = response.data.data
        
        // Extract MCQs from the response
        const generatedMcqs = aiOutput?.questions?.mcqs || aiOutput?.mcqs || []
        
        setMcqs(generatedMcqs.length > 0 ? generatedMcqs : [
          {
            question: 'MCQ generation in progress...',
            description: aiOutput?.topic || topic || 'Check the AI Analysis section for generated questions'
          }
        ])
        setAnalyzed(true)
        setCurrentIndex(0)
        setSelectedAnswer('')
      }
    } catch (err) {
      setError(`Error generating MCQs: ${err.message}`)
      console.error('MCQ Generation Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleOptionSelect = (option) => {
    if (!currentMcq || selectedAnswer) return
    setSelectedAnswer(option)
  }

  const handleNextQuestion = () => {
    if (currentIndex < mcqs.length - 1) {
      setCurrentIndex((prev) => prev + 1)
      setSelectedAnswer('')
      return
    }

    setCurrentIndex(0)
    setSelectedAnswer('')
    setAnalyzed(false)
    setMcqs([])
  }

  const topicLength = topic.length
  const canGenerate = topicLength >= 5

  return (
    <div style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }} className="min-h-[calc(100vh-120px)] p-gutter">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div style={{ borderBottomColor: 'var(--color-border)' }} className="pb-8 border-b">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p style={{ color: 'var(--color-primary)' }} className="text-sm font-semibold mb-2">📝 MCQ Generator</p>
              <h1 style={{ color: 'var(--color-text)' }} className="text-4xl font-bold mb-2">
                Generate MCQs from Topic
              </h1>
              <p style={{ color: 'var(--color-textMuted)' }} className="text-lg">
                Enter a topic and AI will generate multiple choice questions instantly
              </p>
            </div>
            <div style={{ backgroundColor: 'var(--color-primary)20', color: 'var(--color-primary)' }} className="px-4 py-2 rounded-lg text-sm font-semibold">
              ✨ AI Powered
            </div>
          </div>
        </div>

        {/* Input Section */}
        <div style={{ backgroundColor: 'var(--color-bgSecondary)', borderColor: 'var(--color-border)' }} className="mt-8 p-6 rounded-lg border">
          {/* Topic Input */}
          <div className="mb-6">
            <label style={{ color: 'var(--color-text)' }} className="block text-sm font-semibold mb-3">
              📚 Topic
            </label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter the topic you want to generate MCQs for (e.g., 'Photosynthesis in Plants', 'World War II', 'Python Functions')..."
              style={{
                backgroundColor: 'var(--color-bg)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)',
                caretColor: 'var(--color-primary)'
              }}
              className="w-full h-32 p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50"
              disabled={loading}
            />
            <div className="flex justify-between items-center mt-2">
              <span style={{ color: 'var(--color-textMuted)' }} className="text-sm">
                {topicLength} characters
              </span>
              {topicLength < 5 && (
                <span style={{ color: '#ef4444' }} className="text-sm font-medium">
                  ⏳ Need at least 5 characters
                </span>
              )}
              {topicLength >= 5 && (
                <span style={{ color: '#10b981' }} className="text-sm font-medium">
                  ✅ Ready to generate
                </span>
              )}
            </div>
          </div>

          {/* Language Selection */}
          <div className="mb-6">
            <label style={{ color: 'var(--color-text)' }} className="block text-sm font-semibold mb-3">
              🌍 Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              style={{
                backgroundColor: 'var(--color-bg)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)'
              }}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50"
              disabled={loading}
            >
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{ backgroundColor: '#fee2e2', borderColor: '#fca5a5', color: '#991b1b' }} className="p-4 rounded-lg border mb-6">
              <p className="font-semibold">⚠️ Error</p>
              <p>{error}</p>
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={!canGenerate || loading}
            style={{
              backgroundColor: canGenerate && !loading ? 'var(--color-primary)' : 'var(--color-border)',
              color: canGenerate && !loading ? '#ffffff' : 'var(--color-textMuted)',
              cursor: canGenerate && !loading ? 'pointer' : 'not-allowed'
            }}
            className="w-full py-3 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⚙️</span>
                Generating MCQs...
              </span>
            ) : (
              <span>🚀 Generate MCQs from Topic</span>
            )}
          </button>
        </div>

        {/* Results Section */}
        {analyzed && mcqs.length > 0 && (
          <div style={{ backgroundColor: 'var(--color-bgSecondary)', borderColor: 'var(--color-border)' }} className="mt-8 p-6 rounded-lg border">
            <div className="flex items-center justify-between mb-6">
              <h2 style={{ color: 'var(--color-text)' }} className="text-2xl font-bold">
                📋 Generated MCQs
              </h2>
              <div style={{ backgroundColor: 'var(--color-primary)20', color: 'var(--color-primary)' }} className="px-4 py-2 rounded-lg font-semibold">
                {mcqs.length} Question{mcqs.length !== 1 ? 's' : ''}
              </div>
            </div>

            <div
              style={{
                backgroundColor: 'var(--color-bg)',
                borderColor: 'var(--color-border)',
                borderLeftColor: 'var(--color-primary)'
              }}
              className="p-5 rounded-lg border-l-4 border"
            >
              {currentMcq ? (
                <>
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <span style={{ backgroundColor: 'var(--color-primary)20', color: 'var(--color-primary)' }} className="px-3 py-1 rounded text-sm font-semibold inline-block mb-2">
                        Q{currentIndex + 1}
                      </span>
                      <p style={{ color: 'var(--color-text)' }} className="text-lg font-semibold">
                        {currentMcq.question || currentMcq.description || 'Question text'}
                      </p>
                    </div>
                    <div style={{ color: 'var(--color-textMuted)' }} className="text-sm font-semibold">
                      {currentIndex + 1} / {mcqs.length}
                    </div>
                  </div>

                  {(currentMcq.options || currentMcq.choices) && (
                    <div className="mb-4 space-y-2">
                      {(currentMcq.options || currentMcq.choices).map((option, optIdx) => {
                        const correct = isCorrectAnswer(option)
                        const chosen = selectedAnswer && normalizeText(selectedAnswer) === normalizeText(option)
                        const showState = selectedAnswer

                        return (
                          <button
                            key={optIdx}
                            type="button"
                            onClick={() => handleOptionSelect(option)}
                            disabled={Boolean(selectedAnswer)}
                            style={{
                              backgroundColor: showState
                                ? correct
                                  ? '#dcfce7'
                                  : chosen
                                    ? '#fee2e2'
                                    : 'var(--color-bgSecondary)'
                                : 'var(--color-bgSecondary)',
                              borderColor: showState
                                ? correct
                                  ? '#86efac'
                                  : chosen
                                    ? '#fca5a5'
                                    : 'var(--color-border)'
                                : 'var(--color-border)',
                              color: 'var(--color-text)',
                              cursor: selectedAnswer ? 'default' : 'pointer'
                            }}
                            className="w-full text-left p-3 rounded-lg border transition-all duration-200 hover:shadow-md disabled:hover:shadow-none"
                          >
                            <span className="font-semibold">{String.fromCharCode(65 + optIdx)}.</span> {option}
                          </button>
                        )
                      })}
                    </div>
                  )}

                  {selectedAnswer && (
                    <div className="space-y-3">
                      <div style={{ backgroundColor: getQuestionState() ? '#dcfce7' : '#fee2e2', borderColor: getQuestionState() ? '#86efac' : '#fca5a5', color: getQuestionState() ? '#166534' : '#991b1b' }} className="p-3 rounded-lg border">
                        <p className="font-semibold">{getQuestionState() ? '✅ Correct!' : '❌ Incorrect'}</p>
                        <p>
                          {getQuestionState()
                            ? 'Great job! You selected the right answer.'
                            : `Correct Answer: ${currentMcq.answer || currentMcq.correct_answer || 'Not provided'}`}
                        </p>
                      </div>

                      {(currentMcq.explanation || currentMcq.reason) && (
                        <div style={{ backgroundColor: 'var(--color-bgSecondary)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }} className="p-3 rounded-lg border">
                          <p className="font-semibold">💡 Explanation:</p>
                          <p>{currentMcq.explanation || currentMcq.reason}</p>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={handleNextQuestion}
                        style={{
                          backgroundColor: 'var(--color-primary)',
                          color: '#ffffff'
                        }}
                        className="w-full py-3 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg"
                      >
                        {currentIndex < mcqs.length - 1 ? '➡ Next MCQ' : '✅ Finish'}
                      </button>
                    </div>
                  )}
                </>
              ) : null}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  const mcqText = mcqs
                    .map((mcq, idx) => {
                      const text = `Q${idx + 1}: ${mcq.question || mcq.description}\n`
                      const options = (mcq.options || mcq.choices || [])
                        .map((opt, optIdx) => `${String.fromCharCode(65 + optIdx)}: ${opt}`)
                        .join('\n')
                      const answer = mcq.correct_answer || mcq.answer || ''
                      const explanation = mcq.explanation || mcq.reason || ''
                      return `${text}${options}\nAnswer: ${answer}\nExplanation: ${explanation}`
                    })
                    .join('\n\n')
                  
                  const blob = new Blob([mcqText], { type: 'text/plain;charset=utf-8' })
                  const url = URL.createObjectURL(blob)
                  const anchor = document.createElement('a')
                  anchor.href = url
                  anchor.download = `mcqs-${topic.replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.txt`
                  document.body.appendChild(anchor)
                  anchor.click()
                  document.body.removeChild(anchor)
                  URL.revokeObjectURL(url)
                }}
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: '#ffffff'
                }}
                className="flex-1 py-2 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg"
              >
                📥 Download MCQs
              </button>
              <button
                onClick={() => {
                  setMcqs([])
                  setTopic('')
                  setAnalyzed(false)
                  setError('')
                }}
                style={{
                  backgroundColor: 'var(--color-bgSecondary)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)'
                }}
                className="flex-1 py-2 rounded-lg font-semibold border transition-all duration-200"
              >
                🔄 Generate New
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {analyzed && mcqs.length === 0 && !loading && (
          <div style={{ backgroundColor: 'var(--color-bgSecondary)', borderColor: 'var(--color-border)' }} className="mt-8 p-8 rounded-lg border text-center">
            <p style={{ color: 'var(--color-textMuted)' }} className="text-lg">
              ℹ️ No MCQs generated yet. Try again or check the AI Analysis section for detailed results.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
