import axios from 'axios'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001'

const client = axios.create({ baseURL: BACKEND_URL, timeout: 60000 })

export default {
  analyze: (text) => client.post('/api/analyze', { text }),
}
