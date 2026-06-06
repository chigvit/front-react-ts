import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { UserProfile } from './types'

interface AuthStore {
  user: UserProfile | null
  accessToken: string | null
  refreshToken: string | null
  _hasHydrated: boolean
  setHasHydrated: (state: boolean) => void
  setAuth: (user: UserProfile, accessToken: string, refreshToken: string) => void
  setUser: (user: UserProfile) => void
  logout: () => void
  isAuthenticated: () => boolean
  isMaster: () => boolean
  isCustomer: () => boolean
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      _hasHydrated: false,

      setHasHydrated: (state) => set({ _hasHydrated: state }),

      setAuth: (user, accessToken, refreshToken) => {
        set({ user, accessToken, refreshToken })
        localStorage.setItem('access_token', accessToken)
        localStorage.setItem('refresh_token', refreshToken)
      },

      setUser: (user) => set({ user }),

      logout: () => {
        set({ user: null, accessToken: null, refreshToken: null })
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
      },

      isAuthenticated: () => !!get().accessToken,
      isMaster: () => get().user?.role === 'USER_TYPE_MASTER',
      isCustomer: () => get().user?.role === 'USER_TYPE_CUSTOMER',
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)
