import React, { useMemo, useState } from 'react'
import apiClient from '../api/apiClient'

function MiniBarChart() {
  const bars = [34, 58, 80, 46, 68, 88, 62]
  return (
    <div className="flex items-end gap-3 h-36 mt-4">
      {bars.map((value, index) => (
        <div key={index} className="flex-1 flex flex-col items-center gap-2">
          <div
            className="w-full rounded-t-md bg-gradient-to-t from-sky-500 to-cyan-300"
            style={{ height: `${value}%` }}
          />
          <div className="text-[10px] text-slate-500">W{index + 1}</div>
        </div>
      ))}
    </div>
  )
}

function MiniLineChart() {
  return (
    <svg viewBox="0 0 320 120" className="w-full h-28 mt-4">
      <defs>
        <linearGradient id="areaGradient" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <path d="M0,92 L42,72 L84,78 L126,52 L168,60 L210,34 L252,50 L320,22 L320,120 L0,120 Z" fill="url(#areaGradient)" />
      <path d="M0,92 L42,72 L84,78 L126,52 L168,60 L210,34 L252,50 L320,22" fill="none" stroke="#0284c7" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function StatCard({ title, value, helper, tone = 'slate' }) {
  const toneClasses = {
    slate: 'bg-white',
    blue: 'bg-sky-50',
    indigo: 'bg-indigo-50',
  }

  return (
    <div className={`card p-4 ${toneClasses[tone] || toneClasses.slate}`}>
      <div className="text-sm text-slate-500">{title}</div>
      <div className="mt-2 text-3xl font-extrabold text-slate-900">{value}</div>
      <div className="mt-2 text-xs text-slate-500">{helper}</div>
    </div>
  )
}

export default function Dashboard() {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [activeSection, setActiveSection] = useState('dashboard')

  const taskItems = useMemo(
    () => [
      { title: 'Submit Report', date: 'September 29' },
      { title: 'Design Homepage', date: 'September 29' },
      { title: 'Update Profile', date: 'September 30' },
      { title: 'Team Meeting', date: 'September 30' },
      { title: 'Work Assigning', date: 'September 30' },
    ],
    []
  )

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
    <div className="soft-card p-6 md:p-8 min-h-[80vh]">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <div className="text-sm uppercase tracking-[0.25em] text-slate-500">Dynamic Lecture Analyzer</div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-2">Good morning</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-semibold">Premium UI</span>
          <span className="text-sm text-slate-500">Render + Vercel ready</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {[
          ['dashboard', 'Dashboard'],
          ['projects', 'Projects'],
          ['calendar', 'Calendar'],
          ['settings', 'Settings'],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveSection(key)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              activeSection === key ? 'bg-[#4c6ef5] text-white shadow-lg' : 'bg-white text-slate-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card p-5 md:p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">AI Suggestions</h3>
                <span className="text-xs font-medium text-[#4c6ef5]">Add Task</span>
              </div>
              <div className="mt-4 rounded-2xl bg-gradient-to-br from-white to-sky-50 border border-slate-100 p-4">
                <div className="text-sm text-slate-500">Prepare for the meeting at 2:00PM</div>
                <div className="mt-3 flex items-center gap-3 text-sky-500">
                  <div className="h-8 w-8 rounded-full bg-sky-100 flex items-center justify-center font-bold">✦</div>
                  <div className="text-sm font-medium text-slate-700">Suggested focus task</div>
                </div>
              </div>
            </div>

            <div className="card p-5 md:p-6">
              <h3 className="font-semibold text-slate-900">Your Tasks</h3>
              <div className="mt-4 space-y-3">
                {taskItems.map((task) => (
                  <div key={task.title} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3 text-slate-700">
                      <span className="h-4 w-4 rounded border border-slate-300 inline-block" />
                      <span>{task.title}</span>
                    </div>
                    <span className="text-slate-400">{task.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card p-5 md:p-6 bg-slate-900 text-white">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Pomodoro Timer</h3>
                <span className="text-xs text-slate-300">Focus Mode</span>
              </div>
              <div className="mt-4 text-5xl font-extrabold tracking-tight">25:00</div>
              <button className="mt-4 px-4 py-2 rounded-lg bg-white text-slate-900 font-semibold">Start</button>
            </div>

            <div className="card p-5 md:p-6">
              <h3 className="font-semibold text-slate-900">Productivity</h3>
              <MiniBarChart />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card p-5 md:p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">Analytics</h3>
                <span className="text-xs text-slate-400">+12% this week</span>
              </div>
              <MiniLineChart />
            </div>

            <div className="card p-5 md:p-6">
              <h3 className="font-semibold text-slate-900">Lecture Input</h3>
              <textarea
                className="mt-4 w-full min-h-40 p-4 rounded-xl border border-slate-200 bg-slate-50 resize-none outline-none focus:ring-2 focus:ring-sky-200"
                placeholder="Paste lecture transcript or text here..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <div className="mt-4 flex flex-wrap gap-3">
                <button className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700">Upload</button>
                <button
                  className="px-4 py-2 rounded-lg accent-btn shadow-lg"
                  onClick={handleAnalyze}
                  disabled={loading}
                >
                  {loading ? 'Analyzing...' : 'Analyze'}
                </button>
              </div>
            </div>
          </div>

          {result && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard title="Summary" value="Ready" helper={result.summary || 'No summary returned'} tone="blue" />
              <StatCard title="Sentiment" value={result.sentiment || '—'} helper={`Provider: ${result.analysisProvider || 'unknown'}`} tone="indigo" />
              <StatCard title="Readability" value={result.readabilityScore ?? '—'} helper="Score from analysis response" tone="slate" />
            </div>
          )}

          {result && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card p-5 md:p-6">
                <h3 className="font-semibold text-slate-900">Summary</h3>
                <p className="text-sm text-slate-600 mt-3 leading-6">{result.summary || '—'}</p>
              </div>
              <div className="card p-5 md:p-6">
                <h3 className="font-semibold text-slate-900">Explanation</h3>
                <p className="text-sm text-slate-600 mt-3 leading-6">{result.explanation || '—'}</p>
              </div>
            </div>
          )}
        </div>

        <div className="xl:col-span-4 space-y-6">
          <div className="card p-5 md:p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Projects</h3>
              <span className="text-xs font-medium text-[#4c6ef5]">Add Task</span>
            </div>
            <div className="mt-4 space-y-4">
              {['Website Redesign', 'Mobile App v2', 'Marketing Campaign'].map((item, index) => (
                <div key={item} className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-800">{item}</span>
                    <span className="text-slate-400">{[5, 8, 3][index]}/12 Tasks</span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#4c6ef5] to-sky-400"
                      style={{ width: `${[55, 68, 26][index]}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5 md:p-6">
            <h3 className="font-semibold text-slate-900">AI Suggestions</h3>
            <div className="mt-4 rounded-2xl bg-gradient-to-br from-white to-indigo-50 border border-slate-100 p-4">
              <div className="flex items-center gap-3 text-sky-500">
                <div className="h-8 w-8 rounded-full bg-sky-100 flex items-center justify-center font-bold">✦</div>
                <div>
                  <div className="text-sm font-semibold text-slate-800">Prompt reminder</div>
                  <div className="text-xs text-slate-500 mt-1">Prepare a reminder for the submitting report at 11:00 AM</div>
                </div>
              </div>
            </div>
          </div>

          <div className="card p-5 md:p-6">
            <h3 className="font-semibold text-slate-900">Analysis Metadata</h3>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="flex items-center justify-between"><span>Provider</span><span>{result?.analysisProvider || 'n/a'}</span></div>
              <div className="flex items-center justify-between"><span>Model</span><span>{result?.analysisModel || 'n/a'}</span></div>
              <div className="flex items-center justify-between"><span>Tasks</span><span>{taskItems.length}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
