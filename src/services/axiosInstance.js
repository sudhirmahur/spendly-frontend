import axios from 'axios'

const axiosInstance = axios.create({
  baseURL:
    import.meta.env.VITE_BACKEND_URL ||
    // 'https://expense-tracker-backend-kiap.onrender.com/api',
    'http://localhost:5000/api',

  headers: {
    'Content-Type': 'application/json',
  },

  timeout: 12000,
})

// ── Request: attach JWT + workspace-id ───────────────────────────────────────
axiosInstance.interceptors.request.use(
  (config) => {
    try {
      // Attach JWT token
      const auth = JSON.parse(
        localStorage.getItem('spendly-auth') || '{}'
      )

      const token = auth?.state?.token

      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }

      // Attach workspace-id
      const ws = JSON.parse(
        localStorage.getItem('spendly-workspace') || '{}'
      )

      const wsId = ws?.state?.currentWorkspace?._id

      if (wsId) {
        config.headers['workspace-id'] = wsId
      }
    } catch (_) {
      // Ignore localStorage parsing errors
    }

    if (import.meta.env.VITE_DEBUG === 'true') {
      console.log(
        `[→] ${config.method?.toUpperCase()} ${config.url}`,
        {
          baseURL: config.baseURL,
          headers: config.headers,
          data: config.data,
          params: config.params,
        }
      )
    }

    return config
  },

  (err) => Promise.reject(err)
)

// ── Response: log + handle global errors ─────────────────────────────────────
const STATUS_MESSAGES = {
  400: 'Invalid request. Please check your input and try again.',
  403: "You don't have permission to do that.",
  404: 'The requested resource could not be found.',
  409: 'This conflicts with existing data.',
  422: 'Some fields need your attention.',
  429: 'Too many requests. Please slow down and try again.',
  500: 'Something went wrong on our end. Please try again.',
  502: 'Server is temporarily unavailable. Please try again shortly.',
  503: 'Server is temporarily unavailable. Please try again shortly.',
}

axiosInstance.interceptors.response.use(
  (res) => {
    if (import.meta.env.VITE_DEBUG === 'true') {
      console.log(
        `[←] ${res.status} ${res.config?.url}`,
        res.data
      )
    }

    return res
  },

  (err) => {
    const status = err.response?.status
    const backendMessage = err.response?.data?.message

    err.friendlyMessage =
      backendMessage ||
      STATUS_MESSAGES[status] ||
      (!err.response
        ? 'Network error — please check your connection and try again.'
        : 'Something went wrong. Please try again.')

    if (import.meta.env.VITE_DEBUG === 'true') {
      console.error(
        `[✕] ${status ?? 'network'}:`,
        err.friendlyMessage,
        err.response?.data
      )
    }

    if (status === 401) {
      const url = err.config?.url || ''

      const isAuthAttempt =
        url.includes('/auth/login') ||
        url.includes('/auth/register')

      if (!isAuthAttempt) {
        localStorage.removeItem('spendly-auth')
        localStorage.removeItem('spendly-workspace')

        window.location.href = '/login'
      }
    }

    return Promise.reject(err)
  }
)

export default axiosInstance