import React from 'react'

const ROUTE_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'chat', label: 'Chat', icon: 'forum' },
  { id: 'reports', label: 'Reports', icon: 'bar_chart' }
]

const NAV_ITEMS = [
  { id: 'ai-analysis', label: 'AI Analysis', icon: 'smart_toy' },
  { id: 'speech-analysis', label: 'Speech Analysis', icon: 'mic' },
  { id: 'qa-practice', label: 'Q&A Practice', icon: 'help' },
  { id: 'mcq-generator', label: 'MCQ Generator', icon: 'quiz' },
  { id: 'analysis-actions', label: 'Action Plan', icon: 'checklist' },
  { id: 'analysis-history', label: 'History', icon: 'history' }
]

export default function Sidebar({ activeSection, setActiveSection, onNewAnalysis }) {
  return (
    <aside className="relative w-full md:fixed md:left-0 md:top-0 md:h-screen md:w-[280px] md:border-r border-b flex flex-col p-6 space-y-8 z-50 overflow-y-auto transition-colors duration-400" style={{ backgroundColor: 'color-mix(in srgb, var(--color-bgSecondary) 88%, #ffffff 12%)', borderColor: 'var(--color-border)', backdropFilter: 'blur(8px)' }}>
      <div className="flex items-center gap-3 pb-4 border-b transition-colors duration-400" style={{ borderColor: 'var(--color-border)' }}>
        <div className="w-10 h-10 rounded-xl border flex items-center justify-center font-bold text-sm tracking-wide" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }}>
          DA
        </div>
        <div>
          <p className="text-base font-bold leading-none transition-colors duration-400" style={{ color: 'var(--color-text)' }}>Dynamic</p>
          <p className="text-sm font-semibold transition-colors duration-400" style={{ color: 'var(--color-primary)' }}>Lecture Analyzer</p>
        </div>
      </div>

      <button
        className="w-full py-3 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all border"
        type="button"
        onClick={onNewAnalysis}
        style={{ backgroundColor: 'var(--color-primary)', borderColor: 'color-mix(in srgb, var(--color-primary) 70%, #ffffff 30%)' }}
      >
        <span>+</span>
        New Analysis
      </button>

      <div className="space-y-2">
        {ROUTE_ITEMS.map((item) => {
          const isActive = activeSection === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveSection(item.id)}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-lg border transition-all duration-400 text-sm font-semibold"
              style={{
                backgroundColor: isActive ? 'color-mix(in srgb, var(--color-primary) 18%, transparent)' : 'transparent',
                color: isActive ? 'var(--color-text)' : 'var(--color-textMuted)',
                borderColor: isActive ? 'color-mix(in srgb, var(--color-primary) 50%, transparent)' : 'transparent'
              }}
            >
              <span className="text-lg">
                {item.icon === 'dashboard' && '📈'}
                {item.icon === 'forum' && '💬'}
                {item.icon === 'bar_chart' && '📊'}
              </span>
              <span>{item.label}</span>
            </button>
          )
        })}
      </div>

      <div className="pt-4 border-t transition-colors duration-400" style={{ borderColor: 'var(--color-border)' }}>
        <p className="text-[11px] uppercase tracking-[0.18em] mb-3 font-bold transition-colors duration-400" style={{ color: 'var(--color-textMuted)' }}>Sections</p>

        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveSection(item.id)}
                className="w-full text-left px-4 py-2.5 text-sm font-medium transition-all duration-400 flex items-center gap-3 rounded-lg border"
                style={{
                  backgroundColor: isActive ? 'color-mix(in srgb, var(--color-primary) 18%, transparent)' : 'transparent',
                  color: isActive ? 'var(--color-text)' : 'var(--color-textMuted)',
                  borderColor: isActive ? 'color-mix(in srgb, var(--color-primary) 50%, transparent)' : 'transparent'
                }}
              >
                <span className="text-base">
                  {item.icon === 'smart_toy' && '🤖'}
                  {item.icon === 'mic' && '🎙️'}
                  {item.icon === 'help' && '❓'}
                  {item.icon === 'quiz' && '📝'}
                  {item.icon === 'checklist' && '✅'}
                  {item.icon === 'history' && '⏱️'}
                </span>
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

    </aside>
  )
}
