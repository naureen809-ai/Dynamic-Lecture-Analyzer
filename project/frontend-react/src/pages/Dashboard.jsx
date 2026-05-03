import React, { useState } from 'react'
import apiClient from '../api/apiClient'

export default function Dashboard() {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  async function handleAnalyze() {
    if (!text.trim()) return
    setLoading(true)
    try {
      const res = await apiClient.analyze(text)
      setResult(res.data)
    } catch (err) {
      setResult({ error: err.message || 'Request failed' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="soft-card p-8 min-h-[80vh]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-extrabold">Good morning</h1>
          <div className="text-sm text-gray-600 mt-1">Here's your lecture analysis dashboard</div>
        </div>
        <div className="text-sm text-gray-600">Premium</div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <div className="card p-4">
            <textarea
              className="w-full h-48 p-4 rounded-lg border-0 bg-white/0 resize-none"
              placeholder="Paste lecture transcript or text here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <div className="mt-3 flex gap-3">
              <button
                className="px-4 py-2 accent-btn rounded-md"
                onClick={handleAnalyze}
                disabled={loading}
              >
                {loading ? 'Analyzing...' : 'Analyze'}
              </button>
              <button className="px-4 py-2 border rounded-md">Upload</button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 mt-6">
            <div className="card p-4">
              <h4 className="font-semibold">Pomodoro Timer</h4>
              <div className="text-3xl font-bold mt-4">25:00</div>
            </div>
            <div className="card p-4">
              <h4 className="font-semibold">Analytics</h4>
              <div className="mt-3 text-sm text-gray-600">Tasks completed</div>
            </div>
            <div className="card p-4">
              <h4 className="font-semibold">Productivity</h4>
              <div className="mt-3 text-sm text-gray-600">Chart placeholder</div>
            </div>
          </div>
        </div>

        <div className="col-span-1">
          <div className="card p-4 mb-4">
            <h3 className="font-medium">AI Suggestions</h3>
            <p className="text-sm text-gray-600 mt-2">Prepare a reminder for the meeting at 2:00PM</p>
          </div>
          <div className="card p-4">
            <h3 className="font-medium">Your Tasks</h3>
            <ul className="mt-2 text-sm text-gray-700">
              <li>Submit Report</li>
              <li>Design Homepage</li>
              <li>Team Meeting</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-8">
        {result && (
          <div className="grid grid-cols-3 gap-6">
            <div className="card p-4">
              <h4 className="font-semibold">Summary</h4>
              <p className="text-sm text-gray-700 mt-2">{result.summary || '—'}</p>
            </div>
            <div className="card p-4">
              <h4 className="font-semibold">Key Points</h4>
              <ul className="mt-2 list-disc list-inside text-sm text-gray-700">
                {(result.keyPoints || []).map((k, i) => (
                  <li key={i}>{k}</li>
                ))}
              </ul>
            </div>
            <div className="card p-4">
              <h4 className="font-semibold">Explanation</h4>
              <p className="text-sm text-gray-700 mt-2">{result.explanation || '—'}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
