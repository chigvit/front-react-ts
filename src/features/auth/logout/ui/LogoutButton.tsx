'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/shared/ui/Button'
import { useAuthStore } from '@/entities/user/model/userStore'
import { userApi } from '@/entities/user/api/userApi'

export const LogoutButton = () => {
  const router = useRouter()
  const { logout, refreshToken } = useAuthStore()

  const handleLogout = async () => {
    try {
      if (refreshToken) {
        await userApi.logout(refreshToken)
      }
    } finally {
      logout()
      router.push('/login')
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleLogout}>
      Вийти
    </Button>
  )
}