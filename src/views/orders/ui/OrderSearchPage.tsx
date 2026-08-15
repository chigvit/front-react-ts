'use client'

import { useState, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { apiClient } from '@/shared/api/client'
import { useAuthStore } from '@/entities/user/model/userStore'
import { userApi } from '@/entities/user/api/userApi'
import { Spinner } from '@/shared/ui/Spinner'
import { Badge } from '@/shared/ui/Badge'
import { Input } from '@/shared/ui/Input'
import { Button } from '@/shared/ui/Button'
import { OrderChat } from '@/widgets/order-chat/ui/OrderChat'

const guestSchema = z.object({
  firstName: z.string().min(2, 'Мінімум 2 символи'),
  lastName: z.string().min(2, 'Мінімум 2 символи'),
  email: z.string().email('Невірний email'),
  phone: z.string().min(10, 'Невірний номер телефону'),
})

const loginSchema = z.object({
  email: z.string().email('Невірний email'),
  password: z.string().min(8, 'Мінімум 8 символів'),
})

type GuestFormData = z.infer<typeof guestSchema>
type LoginFormData = z.infer<typeof loginSchema>

export const OrderSearchPage = () => {
  const queryClient = useQueryClient()
  const searchParams = useSearchParams()
  const { isAuthenticated, _hasHydrated, user, setAuth } = useAuthStore()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(
    Number(searchParams?.get('category_id')) || 0
  )
  // orderId → { message, price }
  const [responseForm, setResponseForm] = useState<Record<string, { message: string; price: string }>>({})
  const [responseError, setResponseError] = useState<Record<string, string>>({})

  // ─── Гостьовий флоу для незалогінених (відгукнутись без акаунту) ───
  const [authOrderId, setAuthOrderId] = useState<string | null>(null)
  const [authMode, setAuthMode] = useState<'guest' | 'login'>('guest')
  const [authStep, setAuthStep] = useState<'form' | 'verify'>('form')
  const [pendingResponse, setPendingResponse] = useState<{ orderId: string; message: string; price: number } | null>(null)
  const [guestUserId, setGuestUserId] = useState<string | null>(null)
  const [devCode, setDevCode] = useState<string | null>(null)
  const [smsCode, setSmsCode] = useState('')
  const [savedGuestPhone, setSavedGuestPhone] = useState<string | null>(null)
  const [authError, setAuthError] = useState<string | null>(null)
  const [isAuthPending, setIsAuthPending] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [resendMessage, setResendMessage] = useState<string | null>(null)

  const guestForm = useForm<GuestFormData>({ resolver: zodResolver(guestSchema) })
  const loginForm = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) })

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['orders-search'],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/orders')
      return res.data.orders ?? []
    },
    enabled: _hasHydrated,
    refetchInterval: 60_000,
  })

  const orderIds = useMemo<string[]>(() => (ordersData ?? []).map((o: any) => o.id), [ordersData])

  // Мій відгук на кожне замовлення (з сервера, а не лише з локального стану) —
  // потрібно, щоб побачити свій відгук і відповідь замовника після оновлення сторінки.
  const { data: myResponsesData } = useQuery({
    queryKey: ['my-responses', orderIds],
    queryFn: async () => {
      const results = await Promise.all(
        orderIds.map(id =>
          apiClient.get(`/api/v1/orders/${id}/responses`)
            .then(r => ({ id, responses: r.data.responses ?? [] }))
            .catch(() => ({ id, responses: [] as any[] }))
        )
      )
      const map: Record<string, any> = {}
      results.forEach(({ id, responses }) => {
        const mine = responses.find((r: any) => r.master_id === user?.id)
        if (mine) map[id] = mine
      })
      return map
    },
    enabled: orderIds.length > 0 && !!user?.id,
  })

  const myResponseByOrder: Record<string, any> = myResponsesData ?? {}

  const { data: workTypesData } = useQuery({
    queryKey: ['work-types'],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/work-types')
      return res.data.work_types ?? []
    },
    staleTime: Infinity,
  })

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/categories')
      return res.data.categories ?? []
    },
    staleTime: Infinity,
  })

  const workTypeMap: Record<number, string> = {}
  const workTypeCategoryMap: Record<number, number> = {}
  for (const wt of workTypesData ?? []) {
    workTypeMap[wt.id] = wt.name
    workTypeCategoryMap[wt.id] = wt.category_id
  }

  const respondMutation = useMutation({
    mutationFn: ({ orderId, message, price }: { orderId: string; message: string; price: number }) =>
      apiClient.post(`/api/v1/orders/${orderId}/responses`, { message, price }),
    onSuccess: (_data, { orderId }) => {
      setResponseForm(prev => ({ ...prev, [orderId]: { message: '', price: '' } }))
      setResponseError(prev => ({ ...prev, [orderId]: '' }))
      queryClient.invalidateQueries({ queryKey: ['my-responses', orderIds] })
    },
    onError: (error: any, { orderId }) => {
      const message = error?.response?.data?.error ?? 'Не вдалося надіслати відгук. Спробуйте ще раз.'
      setResponseError(prev => ({ ...prev, [orderId]: message }))
    },
  })

  const closeAuthFlow = () => {
    setAuthOrderId(null)
    setAuthStep('form')
    setPendingResponse(null)
    setGuestUserId(null)
    setDevCode(null)
    setSmsCode('')
    setAuthError(null)
    guestForm.reset()
    loginForm.reset()
  }

  const handleRespondClick = (order: any) => {
    const form = responseForm[order.id] ?? { message: '', price: '' }
    if (!form.message.trim()) return

    if (_hasHydrated && isAuthenticated()) {
      respondMutation.mutate({ orderId: order.id, message: form.message, price: Number(form.price) || 0 })
      return
    }

    // Незалогінений — зберігаємо чернетку відгуку і показуємо форму входу/реєстрації
    setPendingResponse({ orderId: order.id, message: form.message, price: Number(form.price) || 0 })
    setAuthOrderId(order.id)
    setAuthMode('guest')
    setAuthStep('form')
    setAuthError(null)
  }

  const handleGuestSubmit = async () => {
    const valid = await guestForm.trigger()
    if (!valid) return

    const data = guestForm.getValues()
    setIsAuthPending(true)
    setAuthError(null)
    try {
      const res = await apiClient.post('/api/v1/auth/register-guest', {
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.phone,
      })
      setGuestUserId(res.data.user_id)
      setDevCode(res.data.dev_code)
      setSavedGuestPhone(data.phone)
      setAuthStep('verify')
    } catch {
      setAuthError('Не вдалося зареєструватись. Спробуйте ще раз.')
    } finally {
      setIsAuthPending(false)
    }
  }

  const handleLoginSubmit = async () => {
    const valid = await loginForm.trigger()
    if (!valid || !pendingResponse) return

    const data = loginForm.getValues()
    setIsAuthPending(true)
    setAuthError(null)
    try {
      const authData = await userApi.login({ email: data.email, password: data.password })
      const profile = await userApi.getProfile(authData.accessToken)
      setAuth(profile, authData.accessToken, authData.refreshToken)
      respondMutation.mutate(pendingResponse)
      closeAuthFlow()
    } catch {
      setAuthError('Невірний email або пароль.')
    } finally {
      setIsAuthPending(false)
    }
  }

  const handleVerifyCode = async () => {
    if (!guestUserId || !smsCode || !pendingResponse) return

    setIsAuthPending(true)
    setAuthError(null)
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
      respondMutation.mutate(pendingResponse)
      closeAuthFlow()
    } catch (err: any) {
      const msg = err.response?.data?.error ?? ''
      setAuthError(msg.includes('expired') ? 'Код прострочено.' : 'Невірний код. Спробуйте ще раз.')
    } finally {
      setIsAuthPending(false)
    }
  }

  const handleResendCode = async () => {
    if (!guestUserId || !savedGuestPhone) return
    setIsResending(true)
    setAuthError(null)
    setResendMessage(null)
    try {
      const res = await apiClient.post('/api/v1/auth/send-phone-code', {
        user_id: guestUserId,
        phone: savedGuestPhone,
      })
      setDevCode(res.data.dev_code)
      setSmsCode('')
      setResendMessage('Новий код надіслано.')
    } catch {
      setAuthError('Не вдалося надіслати код. Спробуйте ще раз.')
    } finally {
      setIsResending(false)
    }
  }

  const filtered = useMemo(() => {
    if (!ordersData) return []
    return ordersData.filter((o: any) => {
      const q = search.toLowerCase()
      const matchesText =
        !q ||
        o.title?.toLowerCase().includes(q) ||
        o.description?.toLowerCase().includes(q) ||
        o.address?.toLowerCase().includes(q)
      const matchesType = !selectedCategoryId || workTypeCategoryMap[o.work_type_id] === selectedCategoryId
      return matchesText && matchesType
    })
  }, [ordersData, search, selectedCategoryId, workTypesData])

  if (!_hasHydrated || isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-800">Пошук замовлень</h1>

      {/* Фільтри */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          placeholder="Пошук за назвою, описом, адресою..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
        />
        <select
          value={selectedCategoryId}
          onChange={e => setSelectedCategoryId(Number(e.target.value))}
          className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
        >
          <option value={0}>Всі категорії</option>
          {(categoriesData ?? []).map((cat: any) => (
            <option key={cat.id} value={cat.id}>{cat.icon ? `${cat.icon} ` : ''}{cat.name_en || cat.name}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <div className="mb-4 text-5xl">🔍</div>
          <p className="text-gray-500">Замовлень не знайдено.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-400">{filtered.length} замовлень</p>
          {filtered.map((order: any) => {
            const isExpanded = expandedId === order.id
            const form = responseForm[order.id] ?? { message: '', price: '' }
            const myResponse = myResponseByOrder[order.id]
            const last = myResponse?.message
            const error = responseError[order.id]
            const showAuthFlow = authOrderId === order.id

            return (
              <div
                key={order.id}
                className="rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                {/* Заголовок */}
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-semibold text-gray-800">{order.title}</h2>
                        <Badge variant="info">Відкрите</Badge>
                        {last && (
                          <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-600">
                            ✓ Надіслано
                          </span>
                        )}
                      </div>
                      <p className={`text-sm text-gray-600 ${isExpanded ? '' : 'line-clamp-2'}`}>
                        {order.description}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-400">
                        {order.work_type_id > 0 && workTypeMap[order.work_type_id] && (
                          <span className="rounded-md bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-600">
                            🔧 {workTypeMap[order.work_type_id]}
                          </span>
                        )}
                        {order.address && <span>📍 {order.address}</span>}
                        {order.budget > 0 && <span>💰 £{order.budget}</span>}
                        <span>🕐 {new Date(order.created_at).toLocaleDateString('uk-UA')}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : order.id)}
                      className="ml-4 shrink-0 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-500 transition-colors hover:bg-gray-50"
                    >
                      {isExpanded ? '▲ Згорнути' : '▼ Деталі'}
                    </button>
                  </div>
                </div>

                {/* Деталі + форма відгуку */}
                {isExpanded && (
                  <div className="border-t border-gray-100 px-5 pb-5">
                    <div className="pt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 text-sm">
                      {order.work_type_id > 0 && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <span>🔧</span>
                          <span>Послуга: <span className="font-medium text-gray-800">
                            {workTypeMap[order.work_type_id] ?? `#${order.work_type_id}`}
                          </span></span>
                        </div>
                      )}
                      {order.budget > 0 && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <span>💰</span>
                          <span>Бюджет: <span className="font-medium text-gray-800">£{order.budget}</span></span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-gray-600">
                        <span>🕐</span>
                        <span>Створено: <span className="font-medium text-gray-800">
                          {new Date(order.created_at).toLocaleString('uk-UA')}
                        </span></span>
                      </div>
                      {order.scheduled_at && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <span>📅</span>
                          <span>Дата: <span className="font-medium text-gray-800">
                            {new Date(order.scheduled_at.slice(0, 10) + 'T12:00:00').toLocaleDateString('uk-UA')}
                            {order.scheduled_to && (
                              <> — {new Date(order.scheduled_to.slice(0, 10) + 'T12:00:00').toLocaleDateString('uk-UA')}</>
                            )}
                          </span></span>
                        </div>
                      )}
                      {order.address && (
                        <div className="flex items-center gap-2 text-gray-600 sm:col-span-2">
                          <span>📍</span>
                          <span>Адреса: <span className="font-medium text-gray-800">{order.address}</span></span>
                        </div>
                      )}
                    </div>

                    {/* Форма відгуку */}
                    <div className="mt-4 border-t border-gray-100 pt-4 space-y-3">
                      {last ? (
                        <>
                          <p className="text-sm text-gray-500">✓ Ви вже відгукнулись на це замовлення:</p>
                          <div className="flex justify-end">
                            <div className="max-w-xs rounded-xl rounded-tr-sm bg-orange-500 px-3 py-2 text-sm text-white">
                              {last}
                            </div>
                          </div>
                          <div className="border-t border-gray-100 pt-3">
                            <OrderChat orderId={order.id} myRole="master" />
                          </div>
                        </>
                      ) : showAuthFlow ? (
                        <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
                          {authStep === 'verify' ? (
                            <div className="flex flex-col gap-3">
                              <p className="text-sm font-medium text-gray-700">Введіть код із SMS</p>
                              <p className="text-xs text-gray-500">Ми надіслали 6-значний код на ваш телефон.</p>
                              {devCode && (
                                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-2">
                                  <p className="text-xs text-yellow-700">🧪 DEV — код: <strong>{devCode}</strong></p>
                                </div>
                              )}
                              <input
                                type="text"
                                maxLength={6}
                                placeholder="000000"
                                value={smsCode}
                                onChange={e => { setSmsCode(e.target.value.replace(/\D/g, '')); setAuthError(null) }}
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-center text-xl font-bold tracking-widest text-gray-900 focus:border-orange-500 focus:outline-none"
                              />
                              {authError && <p className="text-sm text-red-500">{authError}</p>}
                              {resendMessage && !authError && <p className="text-sm text-green-600">{resendMessage}</p>}
                              <div className="flex gap-2">
                                <Button onClick={handleVerifyCode} loading={isAuthPending} disabled={smsCode.length !== 6} className="flex-1">
                                  Підтвердити і відгукнутись
                                </Button>
                                <Button variant="outline" onClick={closeAuthFlow}>Скасувати</Button>
                              </div>
                              <button
                                onClick={handleResendCode}
                                disabled={isResending}
                                className="text-sm text-orange-600 hover:underline disabled:opacity-50"
                              >
                                {isResending ? 'Надсилаємо...' : 'Не отримали код? Надіслати ще раз'}
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-3">
                              <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                                <button
                                  type="button"
                                  onClick={() => setAuthMode('guest')}
                                  className={`flex-1 py-2 text-sm font-medium transition-colors ${authMode === 'guest' ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                                >
                                  Новий користувач
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setAuthMode('login')}
                                  className={`flex-1 py-2 text-sm font-medium transition-colors ${authMode === 'login' ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                                >
                                  Вже є акаунт
                                </button>
                              </div>

                              {authMode === 'guest' ? (
                                <div className="flex flex-col gap-3">
                                  <div className="grid grid-cols-2 gap-3">
                                    <Input label="Ім'я" error={guestForm.formState.errors.firstName?.message} {...guestForm.register('firstName')} />
                                    <Input label="Прізвище" error={guestForm.formState.errors.lastName?.message} {...guestForm.register('lastName')} />
                                  </div>
                                  <Input label="Email" type="email" placeholder="your@email.com" error={guestForm.formState.errors.email?.message} {...guestForm.register('email')} />
                                  <Input label="Телефон" placeholder="+447586983899" error={guestForm.formState.errors.phone?.message} {...guestForm.register('phone')} />
                                  {authError && <p className="text-sm text-red-500">{authError}</p>}
                                  <div className="flex gap-2">
                                    <Button onClick={handleGuestSubmit} loading={isAuthPending} className="flex-1">Далі →</Button>
                                    <Button variant="outline" onClick={closeAuthFlow}>Скасувати</Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex flex-col gap-3">
                                  <Input label="Email" type="email" placeholder="your@email.com" error={loginForm.formState.errors.email?.message} {...loginForm.register('email')} />
                                  <Input label="Пароль" type="password" placeholder="••••••••" error={loginForm.formState.errors.password?.message} {...loginForm.register('password')} />
                                  {authError && <p className="text-sm text-red-500">{authError}</p>}
                                  <div className="flex gap-2">
                                    <Button onClick={handleLoginSubmit} loading={isAuthPending} className="flex-1">Увійти і відгукнутись</Button>
                                    <Button variant="outline" onClick={closeAuthFlow}>Скасувати</Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <>
                          <textarea
                            rows={3}
                            placeholder="Напишіть повідомлення замовнику..."
                            value={form.message}
                            onChange={e => setResponseForm(prev => ({
                              ...prev,
                              [order.id]: { ...form, message: e.target.value }
                            }))}
                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none"
                          />
                          {error && (
                            <p className="text-sm text-red-500">{error}</p>
                          )}
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">£</span>
                              <input
                                type="number"
                                min="0"
                                placeholder="Ціна"
                                value={form.price}
                                onChange={e => setResponseForm(prev => ({
                                  ...prev,
                                  [order.id]: { ...form, price: e.target.value }
                                }))}
                                className="w-32 rounded-lg border border-gray-200 py-2 pl-7 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                              />
                            </div>
                            <button
                              onClick={() => handleRespondClick(order)}
                              disabled={!form.message.trim() || respondMutation.isPending}
                              className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-600 disabled:opacity-50"
                            >
                              {respondMutation.isPending ? 'Надсилаємо...' : 'Відгукнутись'}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
