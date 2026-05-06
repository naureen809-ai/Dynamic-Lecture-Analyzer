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
    <aside className="relative w-full md:fixed md:left-0 md:top-0 md:h-screen md:w-[280px] md:border-r border-b flex flex-col p-6 space-y-8 z-50 overflow-y-auto transition-colors duration-400" style={{ backgroundColor: 'var(--color-bgSecondary)', borderColor: 'var(--color-border)', backdropFilter: 'blur(12px)' }}>
      <div className="flex items-center gap-3 pb-4 border-b transition-colors duration-400" style={{ borderColor: 'var(--color-border)' }}>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-cyan-500/40">
          📊
        </div>
        <div>
          <p className="text-base font-bold tracking-tighter leading-none transition-colors duration-400" style={{ color: 'var(--color-text)' }}>Dynamic</p>
          <p className="text-sm font-semibold tracking-tighter transition-colors duration-400" style={{ color: 'var(--color-primary)' }}>Analyzer</p>
        </div>
      </div>

      <button
        className="w-full py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/40 hover:shadow-cyan-500/50"
        type="button"
        onClick={onNewAnalysis}
      >
        <span>➕</span>
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
              className="w-full flex items-center gap-4 px-4 py-3 rounded-lg border transition-all duration-400 font-['Inter'] text-sm font-semibold tracking-wide"
              style={{
                backgroundColor: isActive ? `var(--color-primary)20` : 'transparent',
                color: isActive ? 'var(--color-primary)' : 'var(--color-textMuted)',
                borderColor: isActive ? `var(--color-primary)40` : 'transparent'
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
        <p className="text-[11px] uppercase tracking-widest mb-3 font-bold transition-colors duration-400" style={{ color: 'var(--color-textMuted)' }}>📚 Sections</p>

        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveSection(item.id)}
                className="w-full text-left px-4 py-2.5 font-['Inter'] text-sm font-medium tracking-wide transition-all duration-400 flex items-center gap-3 rounded-lg border"
                style={{
                  backgroundColor: isActive ? `var(--color-primary)20` : 'transparent',
                  color: isActive ? 'var(--color-primary)' : 'var(--color-textMuted)',
                  borderColor: isActive ? `var(--color-primary)40` : 'transparent'
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
