import axios from 'axios'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

const defaultBackend = BACKEND_URL || 'https://dynamic-lecture-analyzer.onrender.com'

const client = axios.create({
  baseURL: defaultBackend,
  timeout: 60000
})

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('AUTH_TOKEN')
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`
    }
  }
  return config
})

export default {
  register: (name, email, password) => client.post('/api/auth/register', { name, email, password }),
  login: (email, password) => client.post('/api/auth/login', { email, password }),
  analyze: (text, language = 'English') => client.post('/api/analyze', { text, language }),
  history: (limit = 10) => client.get('/api/history', { params: { limit } }),
  chat: ({ message, context_text, language = 'English', history = [] }) =>
    client.post('/api/chat', { message, context_text, language, history }),
  stats: () => client.get('/api/stats'),
  search: (q, limit = 10) => client.get('/api/search', { params: { q, limit } }),
  exportPdf: (id) => client.get(`/api/export/${id}`, { responseType: 'blob' })
}
