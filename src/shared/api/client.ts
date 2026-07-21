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

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config

    // Пропускаємо interceptor для auth запитів
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
        const refreshToken = localStorage.getItem('refresh_token')
        const { data } = await axios.post(`${API_URL}/api/v1/auth/refresh`, {
          refresh_token: refreshToken,
        })

        // Оновлюємо localStorage і Zustand разом, щоб стан не розходився
        localStorage.setItem('access_token', data.access_token)
        localStorage.setItem('refresh_token', data.refresh_token)

        const store = useAuthStore.getState()
        if (store.user) {
          store.setAuth(store.user, data.access_token, data.refresh_token)
        }

        original.headers.Authorization = `Bearer ${data.access_token}`
        return apiClient(original)
      } catch {
        // Refresh не вдався — повністю виходимо (очищаємо і localStorage і Zustand)
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
