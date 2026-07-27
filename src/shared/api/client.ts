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

// Бекенд видає одноразовий (ротаційний) refresh-токен: кожне оновлення анулює
// попередній. Якщо кілька запитів одночасно ловлять 401 (звичайна ситуація —
// React Query часто робить паралельні запити), кожен з них НЕ повинен окремо
// смикати /auth/refresh старим токеном — лише перший встигне, решта отримають
// "token already used" і розлогінять користувача попри жива сесію. Тому всі
// паралельні 401 чекають один спільний запит на оновлення.
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
        const data = await refreshTokens()

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
