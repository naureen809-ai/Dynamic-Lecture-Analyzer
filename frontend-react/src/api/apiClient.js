import axios from 'axios'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || (import.meta.env.DEV ? 'http://localhost:5001' : '')

const client = axios.create({
  baseURL: BACKEND_URL || undefined,
  timeout: 60000
})

export default {
  analyze: (text, language = 'English') => client.post('/api/analyze', { text, language }),
  history: (limit = 10) => client.get('/api/history', { params: { limit } }),
  chat: ({ message, context_text, language = 'English', history = [] }) =>
    client.post('/api/chat', { message, context_text, language, history }),
  stats: () => client.get('/api/stats'),
  search: (q, limit = 10) => client.get('/api/search', { params: { q, limit } }),
  exportPdf: (id) => client.get(`/api/export/${id}`, { responseType: 'blob' }),
}
