'use client'

import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { userApi } from '@/entities/user/api/userApi'
import { RegisterRequest } from '@/entities/user/model/types'

export const useRegister = () => {
  const router = useRouter()

  return useMutation({
    mutationFn: (data: RegisterRequest) => userApi.register(data),
    onSuccess: () => {
      router.push('/login?registered=true')
    },
  })
}
