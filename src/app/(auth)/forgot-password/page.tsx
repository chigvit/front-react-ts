'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { apiClient } from '@/shared/api/client'
import { Input } from '@/shared/ui/Input'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'

const schema = z.object({
  email: z.string().email('Invalid email format'),
})

type FormData = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setError(null)
    setIsPending(true)
    try {
      await apiClient.post('/api/v1/auth/forgot-password', { email: data.email })
      setSent(true)
    } catch {
      setError('Failed to send reset email. Please try again.')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md">
        {sent ? (
          <div className="text-center">
            <div className="mb-4 text-5xl">📧</div>
            <h1 className="mb-2 text-2xl font-bold text-gray-800">Check your email</h1>
            <p className="mb-4 text-gray-600">
              We sent a password reset link to your email address.
            </p>
            <Link href="/login" className="text-orange-500 hover:underline">
              Back to login
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold text-gray-800">Forgot Password</h1>
              <p className="mt-1 text-sm text-gray-600">
                Enter your email and we'll send you a reset link
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <Input
                label="Email"
                type="email"
                placeholder="your@email.com"
                error={errors.email?.message}
                {...register('email')}
              />

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <Button type="submit" loading={isPending} className="w-full">
                Send Reset Link
              </Button>

              <div className="text-center">
                <Link href="/login" className="text-sm text-orange-500 hover:underline">
                  Back to login
                </Link>
              </div>
            </form>
          </>
        )}
      </Card>
    </div>
  )
}
