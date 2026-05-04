/**
 * Network error detector aur helpful messages
 */
export function getErrorMessage(error) {
  if (!error) return 'Unknown error occurred'

  // Network error - backend not accessible
  if (!error.response) {
    if (error.message?.includes('Network Error')) {
      return error.message
    }
    if (error.code === 'ECONNABORTED') {
      return 'Request timeout: Backend is taking too long to respond'
    }
    return 'Network Error: Cannot reach the backend. Make sure backend server is running on http://localhost:5001'
  }

  // Server error responses
  if (error.response?.data?.message) {
    return error.response.data.message
  }

  // Status code specific errors
  switch (error.response?.status) {
    case 400:
      return 'Bad request: Invalid data sent to server'
    case 404:
      return 'Not found: API endpoint not available'
    case 500:
      return 'Server error: Backend encountered an error'
    case 503:
      return 'Service unavailable: Backend is down'
    default:
      return error.message || 'Failed to connect to server'
  }
}

/**
 * Check if backend is running
 */
export async function checkBackendHealth(backendUrl = 'http://localhost:5001') {
  try {
    const response = await fetch(`${backendUrl}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })
    return response.ok
  } catch (error) {
    console.error('Backend health check failed:', error)
    return false
  }
}
