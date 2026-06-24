'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import { Card } from '@/shared/ui/Card'

function CheckEmailContent() {
  const searchParams = useSearchParams()
  const email = searchParams?.get('email') ?? ''

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md text-center">
        <div className="mb-4 text-6xl">✉️</div>
        <h1 className="mb-2 text-2xl font-bold text-gray-800">Перевірте пошту</h1>
        <p className="mb-1 text-gray-600">
          Ми надіслали листа підтвердження на
        </p>
        {email && (
          <p className="mb-4 font-semibold text-orange-500">{email}</p>
        )}
        <p className="mb-6 text-sm text-gray-500">
          Перейдіть за посиланням у листі для активації акаунту. Перевірте також папку «Спам».
        </p>
        <Link
          href="/login"
          className="text-sm text-orange-500 hover:underline"
        >
          Повернутись до входу
        </Link>
      </Card>
    </div>
  )
}

export default function CheckEmailPage() {
  return (
    <Suspense>
      <CheckEmailContent />
    </Suspense>
  )
}
