'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, Suspense } from 'react'
import { LoginForm } from '@/features/auth/login'
import Link from 'next/link'
import { Card } from '@/shared/ui/Card'
import { useAuthStore } from '@/entities/user/model/userStore'

function LoginContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const verified = searchParams?.get('verified') === 'true'

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace(verified ? '/profile' : '/')
    }
  }, [])

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-800">Вхід в акаунт</h1>
          <p className="mt-1 text-sm text-gray-600">
            Ще немає акаунту?{' '}
            <Link href="/register" className="text-orange-500 hover:underline">
              Зареєструватись
            </Link>
          </p>
        </div>

        {verified && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-center">
            <p className="text-sm font-medium text-green-700">
              ✅ Email підтверджено! Увійдіть щоб перейти до профілю.
            </p>
          </div>
        )}

        <LoginForm redirectTo={verified ? '/profile' : '/'} />
      </Card>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  )
}
