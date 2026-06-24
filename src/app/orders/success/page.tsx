'use client'

import Link from 'next/link'
import { Button } from '@/shared/ui/Button'

export default function OrderSuccessPage() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-4 text-6xl">🎉</div>
        <h1 className="mb-2 text-3xl font-bold text-gray-800">Order Published!</h1>
        <p className="mb-2 text-gray-500">Masters will contact you soon.</p>
        <p className="mb-8 text-sm text-gray-400">
          Check your email to verify your account and track your order.
        </p>
        <div className="flex justify-center gap-3">
          <Link href="/">
            <Button variant="outline">Go Home</Button>
          </Link>
          <Link href="/orders/my">
            <Button>My Orders</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
