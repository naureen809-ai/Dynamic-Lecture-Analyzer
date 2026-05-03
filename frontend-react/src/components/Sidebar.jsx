import React from 'react'

export default function Sidebar(){
  return (
    <aside className="sidebar text-white rounded-xl p-6 shadow-lg h-[80vh]">
      <div className="text-2xl font-bold mb-8">AI Alzén</div>
      <nav className="space-y-3">
        <div className="px-3 py-2 rounded-md bg-[#1f2937]">Dashboard</div>
        <div className="px-3 py-2 rounded-md hover:bg-[#1f2937]">Projects</div>
        <div className="px-3 py-2 rounded-md hover:bg-[#1f2937]">Calendar</div>
        <div className="px-3 py-2 rounded-md hover:bg-[#1f2937]">Settings</div>
      </nav>
    </aside>
  )
}
