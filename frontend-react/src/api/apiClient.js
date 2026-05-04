import axios from 'axios'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

const defaultBackend = BACKEND_URL || 'http://localhost:5001'

const client = axios.create({
  baseURL: defaultBackend,
  timeout: 60000
})

// Enhanced error handling
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      // Network error
      const message = `Network Error: Cannot connect to backend at ${defaultBackend}`
      console.error(message, error)
      error.message = message
    } else if (error.response.status === 0) {
      // CORS or connection refused
      const message = `Backend Connection Failed: Make sure backend is running on ${defaultBackend}`
      console.error(message)
      error.message = message
    }
    return Promise.reject(error)
  }
)

export default {
  analyze: (text, language = 'English') => client.post('/api/analyze', { text, language }),
  history: (limit = 10) => client.get('/api/history', { params: { limit } }),
  chat: ({ message, context_text, language = 'English', history = [] }) =>
    client.post('/api/chat', { message, context_text, language, history }),
  stats: () => client.get('/api/stats'),
  search: (q, limit = 10) => client.get('/api/search', { params: { q, limit } }),
  exportPdf: (id) => client.get(`/api/export/${id}`, { responseType: 'blob' })
}
