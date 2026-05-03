import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Sidebar from './components/Sidebar'
import './styles/index.css'

export default function App() {
  return (
    <div className="app-root min-h-screen">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex gap-6">
          <div className="w-72">
            <Sidebar />
          </div>

          <div className="flex-1">
            <Routes>
              <Route path="/" element={<Dashboard />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  )
}
