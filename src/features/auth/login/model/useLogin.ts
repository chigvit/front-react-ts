'use client'

import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { userApi } from '@/entities/user/api/userApi'
import { useAuthStore } from '@/entities/user/model/userStore'
import { LoginRequest } from '@/entities/user/model/types'

export const useLogin = () => {
  const router = useRouter()
  const { setAuth } = useAuthStore()

  return useMutation({
    mutationFn: (data: LoginRequest) => userApi.login(data),
    onSuccess: async (data) => {
      localStorage.setItem('access_token', data.accessToken)
      localStorage.setItem('refresh_token', data.refreshToken)

      // Передаємо токен напряму в запит
      const profile = await userApi.getProfile(data.accessToken)
      setAuth(profile, data.accessToken, data.refreshToken)

      router.push('/')
    },
  })
}
