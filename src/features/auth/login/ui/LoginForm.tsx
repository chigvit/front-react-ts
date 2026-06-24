'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { useRouter } from 'next/navigation'
import { userApi } from '@/entities/user/api/userApi'
import { useAuthStore } from '@/entities/user/model/userStore'

const schema = z.object({
  email: z.string().email('Невірний формат email'),
  password: z.string().min(8, 'Мінімум 8 символів'),
})

type FormData = z.infer<typeof schema>

interface LoginFormProps {
  redirectTo?: string
}

export const LoginForm = ({ redirectTo = '/' }: LoginFormProps) => {
  const router = useRouter()
  const { setAuth } = useAuthStore()
  const [loginError, setLoginError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setLoginError(null)
    setIsPending(true)
    try {
      const authData = await userApi.login(data)
      localStorage.setItem('access_token', authData.accessToken)
      localStorage.setItem('refresh_token', authData.refreshToken)
      const profile = await userApi.getProfile(authData.accessToken)
      setAuth(profile, authData.accessToken, authData.refreshToken)
      router.push(redirectTo)
    } catch (err: any) {
      const httpStatus = err?.response?.status
      if (httpStatus === 404) {
        setLoginError('not_registered')
      } else if (httpStatus === 403) {
        setLoginError('email_not_verified')
      } else {
        setLoginError('wrong_password')
      }
    } finally {
      setIsPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Input
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="your@email.com"
        error={errors.email?.message}
        {...register('email')}
      />

      <Input
        label="Пароль"
        type="password"
        autoComplete="current-password"
        placeholder="••••••••"
        error={errors.password?.message}
        {...register('password')}
      />

      {loginError === 'not_registered' && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-600">
            Користувача з таким email не знайдено.{' '}
            <Link href="/register" className="font-medium underline hover:text-red-800">
              Зареєструватись
            </Link>
          </p>
        </div>
      )}

      {loginError === 'email_not_verified' && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
          <p className="text-sm text-amber-700">
            Email не підтверджено. Перевірте пошту та перейдіть за посиланням активації.
          </p>
        </div>
      )}

      {loginError === 'wrong_password' && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-600">
            Невірний пароль.{' '}
            <Link href="/forgot-password" className="font-medium underline hover:text-red-800">
              Відновити пароль
            </Link>
          </p>
        </div>
      )}

      <Button type="submit" loading={isPending} className="w-full">
        Увійти
      </Button>
    </form>
  )
}
