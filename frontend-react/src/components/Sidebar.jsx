import React from 'react'

const ROUTE_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'chat', label: 'Chat', icon: 'forum' },
  { id: 'reports', label: 'Reports', icon: 'bar_chart' }
]

const NAV_ITEMS = [
  { id: 'analysis-input', label: 'Input Studio', icon: 'edit_note' },
  { id: 'analysis-summary', label: 'Summary', icon: 'assignment' },
  { id: 'analysis-topics', label: 'Topics', icon: 'category' },
  { id: 'analysis-actions', label: 'Action Plan', icon: 'checklist' },
  { id: 'analysis-keywords', label: 'Keywords', icon: 'label' },
  { id: 'analysis-history', label: 'History', icon: 'history' }
]

export default function Sidebar({ activeSection, setActiveSection, onNewAnalysis }) {
  return (
    <aside className="relative w-full md:fixed md:left-0 md:top-0 md:h-screen md:w-[280px] md:border-r border-b border-white/10 bg-[#020617]/80 backdrop-blur-xl flex flex-col p-6 space-y-8 z-50 shadow-2xl shadow-sky-500/5 overflow-y-auto">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-container to-secondary-container flex items-center justify-center">
          <span className="material-symbols-outlined text-on-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>analytics</span>
        </div>
        <div>
          <p className="text-base font-bold text-white tracking-tighter leading-none">Dynamic</p>
          <p className="text-sm font-semibold text-sky-400 tracking-tighter">Lecture Analyzer</p>
        </div>
      </div>

      <button
        className="w-full py-3 bg-primary-container text-on-primary-container rounded-xl font-bold flex items-center justify-center gap-2 scale-95 active:scale-90 transition-transform shadow-lg shadow-primary-container/20"
        type="button"
        onClick={onNewAnalysis}
      >
        <span className="material-symbols-outlined text-[20px]">add_circle</span>
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
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl border transition-colors duration-200 font-['Inter'] text-sm font-medium tracking-wide ${
                isActive
                  ? 'bg-sky-500/10 text-sky-400 border-r-2 border-sky-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border-transparent'
              }`}
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          )
        })}
      </div>

      <div className="pt-3 border-t border-white/5">
        <p className="text-[11px] uppercase tracking-widest text-slate-500 mb-3">Analyzer Sections</p>

        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveSection(item.id)}
                className={`w-full text-left px-4 py-3 font-['Inter'] text-sm font-medium tracking-wide transition-all duration-200 flex items-center gap-4 rounded-xl ${
                  isActive
                    ? 'bg-slate-800/90 text-white border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      <div className="pt-6 border-t border-white/5 flex items-center gap-3">
        <img
          alt="User profile"
          className="w-10 h-10 rounded-full border border-sky-400/30"
          src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=96&h=96&fit=crop&crop=faces"
        />
        <div>
          <p className="text-sm font-bold text-white">Alex Chen</p>
          <p className="text-xs text-slate-500">Premium Scholar</p>
        </div>
      </div>
    </aside>
  )
}
