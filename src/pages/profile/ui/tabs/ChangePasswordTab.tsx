'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/shared/ui/Input'
import { Button } from '@/shared/ui/Button'

const schema = z.object({
  currentPassword: z.string().min(8, 'Мінімум 8 символів'),
  newPassword: z.string().min(8, 'Мінімум 8 символів'),
  confirmPassword: z.string().min(8, 'Мінімум 8 символів'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Паролі не співпадають',
  path: ['confirmPassword'],
})

type FormData = z.infer<typeof schema>

export const ChangePasswordTab = () => {
  const [saved, setSaved] = useState(false)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    console.log('change password', data)
    setSaved(true)
    reset()
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="mb-4 font-semibold text-gray-800">Зміна паролю</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 max-w-md">
        <Input
          label="Поточний пароль"
          type="password"
          placeholder="••••••••"
          error={errors.currentPassword?.message}
          {...register('currentPassword')}
        />

        <Input
          label="Новий пароль"
          type="password"
          placeholder="••••••••"
          error={errors.newPassword?.message}
          {...register('newPassword')}
        />

        <Input
          label="Підтвердження паролю"
          type="password"
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        {saved && (
          <p className="text-sm text-green-600">✅ Пароль змінено!</p>
        )}

        <Button type="submit" loading={isSubmitting}>
          Змінити пароль
        </Button>
      </form>
    </div>
  )
}
