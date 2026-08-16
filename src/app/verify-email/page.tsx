'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { apiClient } from '@/shared/api/client'
import { userApi } from '@/entities/user/api/userApi'
import { useAuthStore } from '@/entities/user/model/userStore'
import { Spinner } from '@/shared/ui/Spinner'
import Link from 'next/link'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams?.get('token')
  const { setUser } = useAuthStore()

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Token not found')
      return
    }

    apiClient.get(`/api/v1/auth/verify-email?token=${token}`)
      .then(async () => {
        // Read the current store state (not cached from render)
        const currentToken = useAuthStore.getState().accessToken

        if (currentToken) {
          try {
            const freshProfile = await userApi.getProfile()
            setUser(freshProfile)
            setIsLoggedIn(true)
          } catch {
            // silently ignore
          }
        }

        setStatus('success')
        setMessage('Email verified successfully!')

        setTimeout(() => {
          router.push(currentToken ? '/profile' : '/login?verified=true')
        }, 2000)
      })
      .catch(() => {
        setStatus('error')
        setMessage('The link is invalid or has expired')
      })
  }, [token])

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        {status === 'loading' && (
          <>
            <Spinner size="lg" className="mx-auto mb-4" />
            <p className="text-gray-600">Verifying email...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="mb-4 text-5xl">✅</div>
            <h1 className="mb-2 text-2xl font-bold text-gray-800">Done!</h1>
            <p className="mb-4 text-gray-600">{message}</p>
            <p className="text-sm text-gray-500">
              {isLoggedIn ? 'Redirecting to your profile...' : 'Redirecting to the login page...'}
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="mb-4 text-5xl">❌</div>
            <h1 className="mb-2 text-2xl font-bold text-gray-800">Error</h1>
            <p className="mb-4 text-gray-600">{message}</p>
            <Link href="/login" className="text-orange-500 hover:underline">
              Go to the login page
            </Link>
          </>
        )}
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  )
}
