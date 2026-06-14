'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { apiClient } from '@/shared/api/client'
import { Input } from '@/shared/ui/Input'
import { Button } from '@/shared/ui/Button'

const schema = z.object({
  currentPassword: z.string().min(8, 'Minimum 8 characters'),
  newPassword: z.string().min(8, 'Minimum 8 characters'),
  confirmPassword: z.string().min(8, 'Minimum 8 characters'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type FormData = z.infer<typeof schema>

export const ChangePasswordTab = () => {
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isWrongPassword, setIsWrongPassword] = useState(false)
  const [isPending, setIsPending] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setError(null)
    setIsWrongPassword(false)
    setIsPending(true)
    try {
      await apiClient.post('/api/v1/auth/change-password', {
        current_password: data.currentPassword,
        new_password: data.newPassword,
      })
      setSaved(true)
      reset()
      setTimeout(() => setSaved(false), 3000)
    } catch (err: any) {
      const msg = err.response?.data?.error ?? ''
      if (msg.includes('incorrect')) {
        setIsWrongPassword(true)
        setError('Current password is incorrect.')
      } else {
        setError('Failed to change password. Please try again.')
      }
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="mb-4 font-semibold text-gray-800">Change Password</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 max-w-md">
        <Input
          label="Current Password"
          type="password"
          placeholder="••••••••"
          error={errors.currentPassword?.message}
          {...register('currentPassword')}
        />

        <Input
          label="New Password"
          type="password"
          placeholder="••••••••"
          error={errors.newPassword?.message}
          {...register('newPassword')}
        />

        <Input
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-600">
              {error}{' '}
              {isWrongPassword && (
                <Link
                  href="/forgot-password"
                  className="font-medium underline hover:text-red-800"
                >
                  Reset password
                </Link>
              )}
            </p>
          </div>
        )}

        {saved && (
          <p className="text-sm text-green-600">✅ Password changed successfully!</p>
        )}

        <Button type="submit" loading={isPending}>
          Change Password
        </Button>
      </form>
    </div>
  )
}
