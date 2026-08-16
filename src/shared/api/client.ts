import axios from 'axios'
import { useAuthStore } from '@/entities/user/model/userStore'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// The backend issues a one-time (rotating) refresh token: each refresh
// invalidates the previous one. If several requests hit a 401 at the same
// time (a normal situation — React Query often fires parallel requests),
// none of them should independently hit /auth/refresh with the old token —
// only the first would succeed, the rest would get "token already used" and
// log the user out despite a live session. So all parallel 401s wait on one
// shared refresh request.
let refreshPromise: Promise<{ access_token: string; refresh_token: string }> | null = null

function refreshTokens() {
  if (!refreshPromise) {
    const refreshToken = localStorage.getItem('refresh_token')
    refreshPromise = axios
      .post(`${API_URL}/api/v1/auth/refresh`, { refresh_token: refreshToken })
      .then((res) => res.data)
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config

    // Skip the interceptor for auth requests
    if (
      original.url?.includes('/auth/login') ||
      original.url?.includes('/auth/register') ||
      original.url?.includes('/auth/refresh')
    ) {
      return Promise.reject(error)
    }

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const data = await refreshTokens()

        // Update localStorage and Zustand together so the state doesn't diverge
        localStorage.setItem('access_token', data.access_token)
        localStorage.setItem('refresh_token', data.refresh_token)

        const store = useAuthStore.getState()
        if (store.user) {
          store.setAuth(store.user, data.access_token, data.refresh_token)
        }

        original.headers.Authorization = `Bearer ${data.access_token}`
        return apiClient(original)
      } catch {
        // Refresh failed — log out completely (clear both localStorage and Zustand)
        useAuthStore.getState().logout()

        const authPages = ['/login', '/register', '/forgot-password', '/reset-password', '/check-email', '/verify-email']
        const isAuthPage = authPages.some((p) => window.location.pathname.startsWith(p))
        if (!isAuthPage) {
          window.location.href = '/login'
        }
      }
    }

    return Promise.reject(error)
  }
)
