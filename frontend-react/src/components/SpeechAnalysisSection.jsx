import React, { useEffect, useRef, useState } from 'react'
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

const LANGUAGE_CODES = {
  English: 'en-IN',
  Hindi: 'hi-IN',
  Hinglish: 'en-IN',
  Bengali: 'bn-IN',
  Tamil: 'ta-IN',
  Telugu: 'te-IN',
  Marathi: 'mr-IN',
  Gujarati: 'gu-IN',
  Punjabi: 'pa-IN',
  Urdu: 'ur-PK',
  Kannada: 'kn-IN',
  Malayalam: 'ml-IN',
  Odia: 'or-IN',
  Assamese: 'as-IN',
  Sanskrit: 'sa-IN',
  Konkani: 'kok-IN',
  Maithili: 'mai-IN',
  Dogri: 'doi-IN',
  Manipuri: 'mni-IN',
  Bodo: 'brx-IN',
  Santhali: 'sat-IN',
  Kashmiri: 'ks-IN',
  Sindhi: 'sd-IN',
  Nepali: 'ne-NP'
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

function normalizeAnalysis(payload) {
  const safe = payload || {}

  return {
    summary: safe.summary || '',
    topics: Array.isArray(safe.topics) ? safe.topics : [],
    action_items: Array.isArray(safe.action_items) ? safe.action_items : [],
    keywords: Array.isArray(safe.keywords) ? safe.keywords : [],
    speaker_feedback: safe.speaker_feedback || '',
    notes: {
      headings: Array.isArray(safe.notes?.headings) ? safe.notes.headings : [],
      short_notes: Array.isArray(safe.notes?.short_notes) ? safe.notes.short_notes : [],
      detailed_notes: Array.isArray(safe.notes?.detailed_notes) ? safe.notes.detailed_notes : [],
      timestamps: Array.isArray(safe.notes?.timestamps) ? safe.notes.timestamps : []
    },
    questions: {
      mcqs: Array.isArray(safe.questions?.mcqs) ? safe.questions.mcqs : [],
      short_questions: Array.isArray(safe.questions?.short_questions) ? safe.questions.short_questions : [],
      viva_questions: Array.isArray(safe.questions?.viva_questions) ? safe.questions.viva_questions : []
    },
    segmentation: Array.isArray(safe.segmentation) ? safe.segmentation : [],
    id: safe.id || safe._id || safe.document_id || safe.documentId || null
  }
}

function getSpeechRecognition() {
  if (typeof window === 'undefined') {
    return null
  }

  return window.SpeechRecognition || window.webkitSpeechRecognition || null
}

function buildSubtitlePreview(text) {
  const value = String(text || '').trim()
  if (!value) {
    return 'Mic on karte hi yahan live subtitle dikhne lagega.'
  }

  if (value.length <= 180) {
    return value
  }

  return `...${value.slice(-180)}`
}

export default function SpeechAnalysisSection({ onAnalysisComplete }) {
  const recognitionRef = useRef(null)
  const finalTranscriptRef = useRef('')
  const isListeningRef = useRef(false)
  const stopRequestedRef = useRef(false)
  const restartTimerRef = useRef(null)

  const [language, setLanguage] = useState('English')
  const [transcript, setTranscript] = useState('')
  const [liveSubtitle, setLiveSubtitle] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState(null)
  const [error, setError] = useState('')

  const speechRecognitionSupported = Boolean(getSpeechRecognition())
  const display = analysis || EMPTY_RESULT

  useEffect(() => {
    return () => {
      stopRequestedRef.current = true
      isListeningRef.current = false

      if (restartTimerRef.current) {
        window.clearTimeout(restartTimerRef.current)
      }

      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch {
          // Ignore stop errors during teardown.
        }
      }
    }
  }, [])

  const normalizeTranscript = (value) => String(value || '').replace(/\s+/g, ' ').trim()

  const createRecognition = () => {
    const SpeechRecognition = getSpeechRecognition()
    if (!SpeechRecognition) {
      return null
    }

    const recognition = new SpeechRecognition()
    recognition.lang = LANGUAGE_CODES[language] || 'en-IN'
    recognition.continuous = true
    recognition.interimResults = true
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setError('')
      setIsListening(true)
      isListeningRef.current = true
    }

    recognition.onresult = (event) => {
      let interimTranscript = ''
      let finalChunk = ''

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index]
        const text = String(result[0]?.transcript || '').trim()

        if (!text) {
          continue
        }

        if (result.isFinal) {
          finalChunk += `${text} `
        } else {
          interimTranscript += `${text} `
        }
      }

      if (finalChunk) {
        finalTranscriptRef.current = normalizeTranscript(`${finalTranscriptRef.current} ${finalChunk}`)
      }

      const snapshot = normalizeTranscript(`${finalTranscriptRef.current} ${interimTranscript}`)
      setTranscript(snapshot)
      setLiveSubtitle(interimTranscript.trim() || buildSubtitlePreview(snapshot))
    }

    recognition.onerror = (event) => {
      const reason = String(event?.error || 'speech recognition error')

      if (reason === 'no-speech') {
        return
      }

      stopRequestedRef.current = true
      isListeningRef.current = false
      setIsListening(false)
      setError(`Mic error: ${reason}. Browser speech recognition may need permission or a supported browser.`)
    }

    recognition.onend = () => {
      isListeningRef.current = false
      setIsListening(false)

      if (stopRequestedRef.current) {
        return
      }

      if (restartTimerRef.current) {
        window.clearTimeout(restartTimerRef.current)
      }

      restartTimerRef.current = window.setTimeout(() => {
        if (!isListeningRef.current && recognitionRef.current && !stopRequestedRef.current) {
          try {
            recognitionRef.current.start()
          } catch {
            // If restart is rejected, keep the current transcript and wait for manual restart.
          }
        }
      }, 250)
    }

    return recognition
  }

  const startListening = () => {
    if (!speechRecognitionSupported) {
      setError('This browser does not support live speech recognition.')
      return
    }

    if (isListeningRef.current) {
      return
    }

    if (restartTimerRef.current) {
      window.clearTimeout(restartTimerRef.current)
    }

    stopRequestedRef.current = false
    setError('')
    setAnalysis(null)

    const recognition = createRecognition()
    if (!recognition) {
      setError('Unable to start speech recognition in this browser.')
      return
    }

    recognitionRef.current = recognition

    try {
      recognition.start()
    } catch (startError) {
      setError(startError?.message || 'Could not start microphone capture.')
    }
  }

  const stopListening = () => {
    stopRequestedRef.current = true
    isListeningRef.current = false
    setIsListening(false)

    if (restartTimerRef.current) {
      window.clearTimeout(restartTimerRef.current)
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch {
        // Ignore stop errors when the recognizer is already stopped.
      }
    }
  }

  const clearTranscript = () => {
    stopListening()
    finalTranscriptRef.current = ''
    setTranscript('')
    setLiveSubtitle('')
    setAnalysis(null)
    setError('')
  }

  const analyzeSpeech = async () => {
    const cleanedText = normalizeTranscript(transcript)

    if (cleanedText.length < 10 || isAnalyzing) {
      setError('Speak at least a little longer before analyzing.')
      return
    }

    setIsAnalyzing(true)
    setError('')

    try {
      const response = await apiClient.analyze(cleanedText, language)
      const payload = response?.data?.data?.ai_output || response?.data?.data || response?.data || {}
      const normalized = normalizeAnalysis(payload)

      setAnalysis(normalized)
      onAnalysisComplete?.(normalized)
    } catch (analysisError) {
      setError(analysisError?.response?.data?.message || analysisError?.message || 'Speech analysis failed.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleTranscriptChange = (value) => {
    const nextValue = String(value || '')
    setTranscript(nextValue)
    finalTranscriptRef.current = nextValue
  }

  return (
    <section className="rounded-2xl shadow-2xl border p-6 md:p-8 transition-all duration-400" style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
      <header className="pb-6 border-b transition-colors duration-400" style={{ borderColor: 'var(--color-border)' }}>
        <p className="text-xs tracking-[0.28em] uppercase font-bold transition-colors duration-400" style={{ color: 'var(--color-primary)' }}>🎙️ Speech Analysis</p>
        <h1 className="mt-3 text-3xl md:text-4xl font-black transition-colors duration-400" style={{ color: 'var(--color-text)' }}>Live Subtitle Studio</h1>
        <p className="mt-2 text-sm transition-colors duration-400" style={{ color: 'var(--color-textMuted)' }}>
          Mic on karo, live subtitle dekho, aur speech ko AI se clean karke structured lecture notes banao.
        </p>
      </header>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          <div className="rounded-2xl border p-5 transition-colors duration-400" style={{ backgroundColor: 'var(--color-bgSecondary)', borderColor: 'var(--color-border)' }}>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <p className="text-sm font-bold transition-colors duration-400" style={{ color: 'var(--color-text)' }}>Microphone Control</p>
                <p className="text-xs transition-colors duration-400" style={{ color: 'var(--color-textMuted)' }}>
                  {speechRecognitionSupported ? 'Supported in Chromium-based browsers and some desktop browsers.' : 'Live speech recognition is not supported in this browser.'}
                </p>
              </div>

              <select
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
                className="rounded-xl border px-4 py-2 text-sm font-semibold focus:outline-none focus:ring-2 transition-all"
                style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
              >
                {LANGUAGES.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={startListening}
                disabled={isListening || !speechRecognitionSupported}
                className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-bold text-white bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 disabled:cursor-not-allowed disabled:from-slate-600 disabled:to-slate-600 disabled:text-slate-300 transition-all shadow-lg hover:shadow-cyan-500/30"
              >
                🎤 Start Mic
              </button>
              <button
                type="button"
                onClick={stopListening}
                disabled={!isListening}
                className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition-all border"
                style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
              >
                ⏹ Stop Mic
              </button>
              <button
                type="button"
                onClick={clearTranscript}
                className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition-all border"
                style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
              >
                🧹 Clear
              </button>
              <button
                type="button"
                onClick={analyzeSpeech}
                disabled={!normalizeTranscript(transcript) || isAnalyzing}
                className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-bold text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 disabled:cursor-not-allowed disabled:from-slate-600 disabled:to-slate-600 disabled:text-slate-300 transition-all shadow-lg hover:shadow-sky-500/30"
              >
                {isAnalyzing ? '⏳ Cleaning...' : '✨ AI Filter & Analyze'}
              </button>
            </div>

            <div className="mt-5 rounded-xl border px-4 py-3 text-sm font-semibold transition-colors duration-400" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)', color: isListening ? 'var(--color-success)' : 'var(--color-textMuted)' }}>
              {isListening ? '● Listening live' : 'Mic idle'}
            </div>

            {error && (
              <div className="mt-4 rounded-xl border px-4 py-3 text-sm font-semibold transition-colors duration-400" style={{ borderColor: 'var(--color-danger)', backgroundColor: `var(--color-danger)15`, color: 'var(--color-danger)' }}>
                ⚠️ {error}
              </div>
            )}
          </div>

          <div className="rounded-2xl border p-5 transition-colors duration-400" style={{ backgroundColor: 'var(--color-bgSecondary)', borderColor: 'var(--color-border)' }}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold transition-colors duration-400" style={{ color: 'var(--color-text)' }}>Live Subtitle</p>
                <p className="text-xs transition-colors duration-400" style={{ color: 'var(--color-textMuted)' }}>Real-time speech recognition output</p>
              </div>
              <span className="rounded-full border px-3 py-1 text-xs font-bold transition-colors duration-400" style={{ borderColor: 'var(--color-border)', color: 'var(--color-primary)' }}>
                {language}
              </span>
            </div>
            <div className="mt-4 min-h-32 rounded-2xl border p-4 leading-7 transition-colors duration-400" style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}>
              {buildSubtitlePreview(liveSubtitle)}
            </div>
          </div>

          <div className="rounded-2xl border p-5 transition-colors duration-400" style={{ backgroundColor: 'var(--color-bgSecondary)', borderColor: 'var(--color-border)' }}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold transition-colors duration-400" style={{ color: 'var(--color-text)' }}>Captured Transcript</p>
                <p className="text-xs transition-colors duration-400" style={{ color: 'var(--color-textMuted)' }}>Edit the spoken text before sending it to AI</p>
              </div>
              <span className="text-xs font-semibold transition-colors duration-400" style={{ color: 'var(--color-textMuted)' }}>{transcript.length} chars</span>
            </div>
            <textarea
              value={transcript}
              onChange={(event) => handleTranscriptChange(event.target.value)}
              placeholder="Speak into the mic or type directly here..."
              className="mt-4 w-full min-h-56 rounded-2xl border p-4 text-sm focus:outline-none focus:ring-2 transition-all resize-none"
              style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
            />
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl border p-5 transition-colors duration-400" style={{ backgroundColor: 'var(--color-bgSecondary)', borderColor: 'var(--color-border)' }}>
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-bold transition-colors duration-400" style={{ color: 'var(--color-text)' }}>AI Filtered Output</h3>
              <span className="text-xs font-semibold transition-colors duration-400" style={{ color: 'var(--color-textMuted)' }}>
                {analysis ? 'Ready' : 'Pending'}
              </span>
            </div>

            {!analysis ? (
              <div className="mt-4 rounded-2xl border px-4 py-4 text-sm transition-colors duration-400" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-textMuted)' }}>
                Mic se transcript capture karo, phir AI Filter & Analyze dabao. Yahan summary, topics, action items aur feedback aayenge.
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                <div className="rounded-2xl border p-4 transition-colors duration-400" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }}>
                  <p className="text-xs uppercase tracking-[0.25em] font-bold transition-colors duration-400" style={{ color: 'var(--color-primary)' }}>Summary</p>
                  <p className="mt-2 text-sm leading-7 transition-colors duration-400" style={{ color: 'var(--color-text)' }}>
                    {display.summary || 'No summary available.'}
                  </p>
                </div>

                <div className="rounded-2xl border p-4 transition-colors duration-400" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }}>
                  <p className="text-xs uppercase tracking-[0.25em] font-bold transition-colors duration-400" style={{ color: 'var(--color-primary)' }}>Topics</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {display.topics.length ? display.topics.map((item, idx) => (
                      <span key={`${item}-${idx}`} className="rounded-full border px-3 py-1 text-xs font-semibold transition-colors duration-400" style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)', backgroundColor: `var(--color-primary)15` }}>
                        {item}
                      </span>
                    )) : <p className="text-sm transition-colors duration-400" style={{ color: 'var(--color-textMuted)' }}>No topics identified.</p>}
                  </div>
                </div>

                <div className="rounded-2xl border p-4 transition-colors duration-400" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }}>
                  <p className="text-xs uppercase tracking-[0.25em] font-bold transition-colors duration-400" style={{ color: 'var(--color-primary)' }}>Action Items</p>
                  <ul className="mt-3 space-y-2 text-sm leading-6" style={{ color: 'var(--color-text)' }}>
                    {display.action_items.length ? display.action_items.map((item, idx) => <li key={`${item}-${idx}`}>• {item}</li>) : <li style={{ color: 'var(--color-textMuted)' }}>No action items found.</li>}
                  </ul>
                </div>

                <div className="rounded-2xl border p-4 transition-colors duration-400" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }}>
                  <p className="text-xs uppercase tracking-[0.25em] font-bold transition-colors duration-400" style={{ color: 'var(--color-primary)' }}>Speaker Feedback</p>
                  <p className="mt-2 text-sm leading-7 transition-colors duration-400" style={{ color: 'var(--color-text)' }}>
                    {display.speaker_feedback || 'No speaker feedback available.'}
                  </p>
                </div>

                <div className="rounded-2xl border p-4 transition-colors duration-400" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }}>
                  <p className="text-xs uppercase tracking-[0.25em] font-bold transition-colors duration-400" style={{ color: 'var(--color-primary)' }}>Keywords</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {display.keywords.length ? display.keywords.map((item, idx) => (
                      <span key={`${item}-${idx}`} className="rounded-full border px-3 py-1 text-xs font-semibold transition-colors duration-400" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}>
                        {item}
                      </span>
                    )) : <p className="text-sm transition-colors duration-400" style={{ color: 'var(--color-textMuted)' }}>No keywords available.</p>}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-2xl border p-5 transition-colors duration-400" style={{ backgroundColor: 'var(--color-bgSecondary)', borderColor: 'var(--color-border)' }}>
            <p className="text-sm font-bold transition-colors duration-400" style={{ color: 'var(--color-text)' }}>How it works</p>
            <div className="mt-3 space-y-2 text-sm leading-6 transition-colors duration-400" style={{ color: 'var(--color-textMuted)' }}>
              <p>1. Mic start karo aur bolna shuru karo.</p>
              <p>2. Live subtitle realtime me yahan dikhega.</p>
              <p>3. AI Filter & Analyze se transcript clean hoke structured lecture insights ban jayenge.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}