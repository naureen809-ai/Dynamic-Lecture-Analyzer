import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import apiClient from '../api/apiClient'

export default function RegisterPage({ onRegister }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await apiClient.register(name.trim(), email.trim(), password)
      const data = response?.data?.data
      if (data?.token) {
        localStorage.setItem('AUTH_TOKEN', data.token)
        localStorage.setItem('AUTH_USER', JSON.stringify(data.user))
        onRegister({ token: data.token, user: data.user })
        navigate('/')
      } else {
        setError('Registration failed. Please try again.')
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Unable to register. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 px-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/95 p-8 shadow-2xl shadow-slate-950/60">
        <h1 className="text-3xl font-bold text-white mb-2">Register</h1>
        <p className="text-sm text-slate-400 mb-6">Create your account to save lecture analyses and history.</p>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm text-slate-300">Name</span>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
              placeholder="Your name"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm text-slate-300">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
              placeholder="you@example.com"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm text-slate-300">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
              placeholder="Choose a password"
              required
            />
          </label>
          {error && <div className="text-sm text-rose-300 bg-rose-900/30 border border-rose-700/40 rounded-2xl p-3">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p className="mt-6 text-sm text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="text-cyan-300 hover:text-cyan-200">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
