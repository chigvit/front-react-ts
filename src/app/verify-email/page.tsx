'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { apiClient } from '@/shared/api/client'
import { Spinner } from '@/shared/ui/Spinner'
import Link from 'next/link'

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Токен не знайдено')
      return
    }

    apiClient.get(`/api/v1/auth/verify-email?token=${token}`)
      .then(() => {
        setStatus('success')
        setMessage('Email успішно підтверджено!')
        setTimeout(() => router.push('/login'), 3000)
      })
      .catch(() => {
        setStatus('error')
        setMessage('Посилання недійсне або прострочене')
      })
  }, [token])

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        {status === 'loading' && (
          <>
            <Spinner size="lg" className="mx-auto mb-4" />
            <p className="text-gray-600">Підтвердження email...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="mb-4 text-5xl">✅</div>
            <h1 className="mb-2 text-2xl font-bold text-gray-800">Готово!</h1>
            <p className="mb-4 text-gray-600">{message}</p>
            <p className="text-sm text-gray-500">Перенаправлення на сторінку входу...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="mb-4 text-5xl">❌</div>
            <h1 className="mb-2 text-2xl font-bold text-gray-800">Помилка</h1>
            <p className="mb-4 text-gray-600">{message}</p>
            <Link href="/login" className="text-orange-500 hover:underline">
              Перейти на сторінку входу
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
