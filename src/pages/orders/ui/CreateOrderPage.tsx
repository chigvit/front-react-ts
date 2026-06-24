'use client'

import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { apiClient } from '@/shared/api/client'
import { useAuthStore } from '@/entities/user/model/userStore'
import { userApi } from '@/entities/user/api/userApi'
import { useGeolocation } from '@/shared/hooks/useGeolocation'
import { Input } from '@/shared/ui/Input'
import { Button } from '@/shared/ui/Button'
import { Spinner } from '@/shared/ui/Spinner'

const orderSchema = z.object({
  title: z.string().min(5, 'Minimum 5 characters'),
  description: z.string().min(10, 'Minimum 10 characters'),
  address: z.string().min(3, 'Address is required'),
  budget: z.number().min(0).optional(),
})

const guestSchema = z.object({
  firstName: z.string().min(2, 'Minimum 2 characters'),
  lastName: z.string().min(2, 'Minimum 2 characters'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(10, 'Invalid phone number'),
})

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Minimum 8 characters'),
})

type OrderFormData = z.infer<typeof orderSchema>
type GuestFormData = z.infer<typeof guestSchema>
type LoginFormData = z.infer<typeof loginSchema>

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'

export const CreateOrderPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated, _hasHydrated, setAuth } = useAuthStore()
  const { location } = useGeolocation()

  const workTypeId = searchParams?.get('work_type_id') ?? null

  const [selectedMasterId, setSelectedMasterId] = useState<string | null>(
    searchParams?.get('master_id') ?? null
  )
  const [contactMode, setContactMode] = useState<'guest' | 'login'>('guest')
  const [step, setStep] = useState<'form' | 'verify'>('form')
  const [guestUserId, setGuestUserId] = useState<string | null>(null)
  const [devCode, setDevCode] = useState<string | null>(null)
  const [smsCode, setSmsCode] = useState('')
  const [savedOrderData, setSavedOrderData] = useState<OrderFormData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [resendMessage, setResendMessage] = useState<string | null>(null)
  const [savedGuestPhone, setSavedGuestPhone] = useState<string | null>(null)

  const { data: workTypeData } = useQuery({
    queryKey: ['work-type', workTypeId],
    queryFn: async () => {
      if (!workTypeId) return null
      const res = await apiClient.get('/api/v1/work-types')
      const all = res.data.work_types ?? []
      return all.find((wt: any) => wt.id === parseInt(workTypeId))
    },
    enabled: !!workTypeId,
  })

  const { data: mastersData, isLoading: mastersLoading } = useQuery({
    queryKey: ['masters-for-order', workTypeId, location?.latitude, location?.longitude],
    queryFn: async () => {
      const lat = location?.latitude ?? 53.8008
      const lng = location?.longitude ?? -1.5491
      const res = await apiClient.get('/api/v1/location/masters', {
        params: {
          lat,
          lng,
          radius: 50000,
          work_type_id: workTypeId ? parseInt(workTypeId) : undefined,
        },
      })
      return res.data.masters ?? []
    },
  })

  const masters: any[] = mastersData ?? []

  const orderForm = useForm<OrderFormData>({ resolver: zodResolver(orderSchema) })
  const guestForm = useForm<GuestFormData>({ resolver: zodResolver(guestSchema) })
  const loginForm = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) })

  const createOrder = async (orderData: OrderFormData) => {
    const res = await apiClient.post('/api/v1/orders', {
      order_type: selectedMasterId ? 'DIRECT' : 'OPEN',
      master_id: selectedMasterId ?? '',
      work_type_id: workTypeId ? parseInt(workTypeId) : 0,
      title: orderData.title,
      description: orderData.description,
      budget: orderData.budget ?? 0,
      address: orderData.address,
    })
    return res.data
  }

  const handleSubmit = async () => {
    const orderValid = await orderForm.trigger()
    if (!orderValid) return

    const orderData = orderForm.getValues()

    if (_hasHydrated && isAuthenticated()) {
      setIsPending(true)
      setError(null)
      try {
        await createOrder(orderData)
        router.push('/orders/my')
      } catch {
        setError('Failed to create order. Please try again.')
      } finally {
        setIsPending(false)
      }
      return
    }

    if (contactMode === 'login') {
      const loginValid = await loginForm.trigger()
      if (!loginValid) return

      setIsPending(true)
      setError(null)
      try {
        const loginData = loginForm.getValues()
        const authData = await userApi.login({ email: loginData.email, password: loginData.password })
        const profile = await userApi.getProfile(authData.accessToken)
        setAuth(profile, authData.accessToken, authData.refreshToken)
        await createOrder(orderData)
        router.push('/orders/my')
      } catch {
        setError('Invalid email or password.')
      } finally {
        setIsPending(false)
      }
      return
    }

    const guestValid = await guestForm.trigger()
    if (!guestValid) return

    const guestData = guestForm.getValues()
    setIsPending(true)
    setError(null)

    try {
      const res = await apiClient.post('/api/v1/auth/register-guest', {
        first_name: guestData.firstName,
        last_name: guestData.lastName,
        email: guestData.email,
        phone: guestData.phone,
      })

      setGuestUserId(res.data.user_id)
      setDevCode(res.data.dev_code)
      setSavedOrderData(orderData)
      setSavedGuestPhone(guestData.phone)
      setStep('verify')
    } catch {
      setError('Failed to register. Please try again.')
    } finally {
      setIsPending(false)
    }
  }

  const handleVerify = async () => {
    if (!guestUserId || !smsCode || !savedOrderData) return

    setIsPending(true)
    setError(null)

    try {
      const verifyRes = await apiClient.post('/api/v1/auth/verify-phone-code', {
        user_id: guestUserId,
        code: smsCode,
      })

      const { access_token, refresh_token } = verifyRes.data

      if (access_token) {
        localStorage.setItem('access_token', access_token)
        localStorage.setItem('refresh_token', refresh_token)
        const profile = await userApi.getProfile(access_token)
        setAuth(profile, access_token, refresh_token)
      }

      await createOrder(savedOrderData)
      router.push('/orders/success')
    } catch (err: any) {
      const msg = err.response?.data?.error ?? ''
      if (msg.includes('expired')) {
        setError('Code expired.')
      } else {
        setError('Incorrect code. Please try again.')
      }
    } finally {
      setIsPending(false)
    }
  }

  const handleResendCode = async () => {
    if (!guestUserId || !savedGuestPhone) return

    setIsResending(true)
    setError(null)
    setResendMessage(null)

    try {
      const res = await apiClient.post('/api/v1/auth/send-phone-code', {
        user_id: guestUserId,
        phone: savedGuestPhone,
      })
      setDevCode(res.data.dev_code)
      setSmsCode('')
      setResendMessage('A new code has been sent.')
    } catch {
      setError('Failed to resend code. Please try again.')
    } finally {
      setIsResending(false)
    }
  }

  if (step === 'verify') {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm text-center">
          <div className="mb-4 text-5xl">📱</div>
          <h1 className="mb-2 text-2xl font-bold text-gray-800">Enter SMS Code</h1>
          <p className="mb-6 text-gray-500">We sent a 6-digit code to your phone number.</p>

          {devCode && (
            <div className="mb-4 rounded-lg bg-yellow-50 border border-yellow-200 p-3">
              <p className="text-xs text-yellow-700">
                🧪 DEV MODE — Code: <strong>{devCode}</strong>
              </p>
            </div>
          )}

          <input
            type="text"
            maxLength={6}
            placeholder="000000"
            value={smsCode}
            onChange={(e) => { setSmsCode(e.target.value.replace(/\D/g, '')); setError(null) }}
            className={`mb-2 w-full rounded-xl border px-4 py-3 text-center text-2xl font-bold tracking-widest focus:outline-none ${
              error ? 'border-red-400 focus:border-red-500' : 'border-gray-300 focus:border-orange-500'
            }`}
          />

          {error && (
            <p className="mb-4 text-sm text-red-600">
              {error}{' '}
              <button
                type="button"
                onClick={handleResendCode}
                disabled={isResending}
                className="font-medium underline hover:text-red-800 disabled:opacity-50"
              >
                {isResending ? 'Sending...' : 'Resend code'}
              </button>
            </p>
          )}

          {resendMessage && !error && (
            <p className="mb-4 text-sm text-green-600">{resendMessage}</p>
          )}

          <Button onClick={handleVerify} loading={isPending} className="w-full" disabled={smsCode.length !== 6}>
            Verify & Publish Order
          </Button>

          <div className="mt-3 flex items-center justify-center gap-3 text-sm">
            <button onClick={() => setStep('form')} className="text-gray-400 hover:text-gray-600">
              ← Go back
            </button>
            {!error && (
              <>
                <span className="text-gray-300">|</span>
                <button
                  onClick={handleResendCode}
                  disabled={isResending}
                  className="text-orange-500 hover:underline disabled:opacity-50"
                >
                  {isResending ? 'Sending...' : "Didn't get a code? Resend"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold text-gray-800">Створити замовлення</h1>
      {workTypeData && (
        <p className="mb-6 text-gray-500">
          Послуга: <span className="font-medium text-orange-500">{workTypeData.name}</span>
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        {/* Ліва колонка — форма */}
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-semibold text-gray-800">Деталі замовлення</h2>

            {selectedMasterId && (
              <div className="mb-4 flex items-center justify-between rounded-lg border border-orange-200 bg-orange-50 px-4 py-3">
                <p className="text-sm font-medium text-orange-700">
                  🎯 Пряме замовлення обраному майстру
                </p>
                <button
                  onClick={() => setSelectedMasterId(null)}
                  className="text-xs text-orange-500 hover:underline"
                >
                  Скасувати вибір
                </button>
              </div>
            )}

            <div className="flex flex-col gap-4">
              <Input
                label="Назва"
                placeholder="Напр. Полагодити кран на кухні"
                error={orderForm.formState.errors.title?.message}
                {...orderForm.register('title')}
              />
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Опис</label>
                <textarea
                  rows={4}
                  placeholder="Опишіть що потрібно зробити..."
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  {...orderForm.register('description')}
                />
                {orderForm.formState.errors.description && (
                  <p className="mt-1 text-xs text-red-500">{orderForm.formState.errors.description.message}</p>
                )}
              </div>
              <Input
                label="Адреса / Поштовий індекс"
                placeholder="Напр. LS1 4DY"
                error={orderForm.formState.errors.address?.message}
                {...orderForm.register('address')}
              />
              <Input
                label="Бюджет (£) — необов'язково"
                type="number"
                placeholder="0"
                {...orderForm.register('budget', { valueAsNumber: true })}
              />
            </div>
          </div>

          {/* Контактні дані — тільки для незалогінених */}
          {_hasHydrated && !isAuthenticated() && (
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex rounded-lg border border-gray-200 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setContactMode('guest')}
                  className={`flex-1 py-2 text-sm font-medium transition-colors ${
                    contactMode === 'guest' ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Новий замовник
                </button>
                <button
                  type="button"
                  onClick={() => setContactMode('login')}
                  className={`flex-1 py-2 text-sm font-medium transition-colors ${
                    contactMode === 'login' ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Вже є акаунт
                </button>
              </div>

              {contactMode === 'guest' ? (
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Ім'я"
                      error={guestForm.formState.errors.firstName?.message}
                      {...guestForm.register('firstName')}
                    />
                    <Input
                      label="Прізвище"
                      error={guestForm.formState.errors.lastName?.message}
                      {...guestForm.register('lastName')}
                    />
                  </div>
                  <Input
                    label="Email"
                    type="email"
                    placeholder="your@email.com"
                    error={guestForm.formState.errors.email?.message}
                    {...guestForm.register('email')}
                  />
                  <Input
                    label="Телефон"
                    placeholder="+447586983899"
                    error={guestForm.formState.errors.phone?.message}
                    {...guestForm.register('phone')}
                  />
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <Input
                    label="Email"
                    type="email"
                    placeholder="your@email.com"
                    error={loginForm.formState.errors.email?.message}
                    {...loginForm.register('email')}
                  />
                  <Input
                    label="Пароль"
                    type="password"
                    placeholder="••••••••"
                    error={loginForm.formState.errors.password?.message}
                    {...loginForm.register('password')}
                  />
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <Button onClick={handleSubmit} loading={isPending} className="w-full">
            {selectedMasterId
              ? 'Надіслати замовлення майстру →'
              : contactMode === 'guest' && !isAuthenticated()
              ? 'Опублікувати замовлення →'
              : 'Підтвердити замовлення'}
          </Button>
        </div>

        {/* Права колонка — список майстрів */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-100 px-4 py-3">
            <h2 className="font-semibold text-gray-800">
              {workTypeData ? `Майстри — ${workTypeData.name}` : 'Доступні майстри'}
            </h2>
            <p className="mt-0.5 text-xs text-gray-400">
              {masters.length > 0 ? `${masters.length} майстрів поруч` : 'Пошук майстрів...'}
            </p>
          </div>

          <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
            {mastersLoading ? (
              <div className="flex items-center justify-center py-12">
                <Spinner size="md" />
              </div>
            ) : masters.length === 0 ? (
              <div className="px-4 py-12 text-center text-sm text-gray-400">
                <p className="mb-1 text-3xl">🔍</p>
                Майстрів не знайдено поруч
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {masters.map((master: any) => {
                  const isSelected = selectedMasterId === master.user_id
                  return (
                    <div
                      key={master.user_id}
                      className={`p-4 transition-colors ${isSelected ? 'bg-orange-50' : 'hover:bg-gray-50'}`}
                    >
                      {/* Аватар + ім'я */}
                      <div className="mb-3 flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 overflow-hidden rounded-full border border-gray-200 bg-orange-100">
                          {master.avatar_url ? (
                            <img
                              src={`${API_URL}${master.avatar_url}`}
                              alt="Avatar"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-sm font-bold text-orange-500">
                              {master.first_name?.[0]}{master.last_name?.[0]}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-gray-800">
                            {master.first_name} {master.last_name}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            {master.rating > 0 && (
                              <span className="text-yellow-500">⭐ {master.rating}</span>
                            )}
                            {master.distance_meters > 0 && (
                              <span>📍 {(master.distance_meters / 1000).toFixed(1)} км</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Кнопки */}
                      <div className="flex gap-2">
                        <Link
                          href={`/masters/${master.user_id}`}
                          target="_blank"
                          className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-center text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100"
                        >
                          Переглянути профіль
                        </Link>
                        <button
                          onClick={() =>
                            setSelectedMasterId(isSelected ? null : master.user_id)
                          }
                          className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                            isSelected
                              ? 'border border-orange-300 bg-orange-100 text-orange-700'
                              : 'bg-orange-500 text-white hover:bg-orange-600'
                          }`}
                        >
                          {isSelected ? '✓ Обрано' : 'Запропонувати роботу'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
