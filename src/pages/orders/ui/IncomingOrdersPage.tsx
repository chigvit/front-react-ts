'use client'

import { useState, useMemo, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { apiClient } from '@/shared/api/client'
import { useAuthStore } from '@/entities/user/model/userStore'
import { Spinner } from '@/shared/ui/Spinner'
import { Badge } from '@/shared/ui/Badge'
import { OrderChat } from '@/widgets/order-chat/ui/OrderChat'
import { useUnreadMessages } from '@/shared/hooks/useUnreadMessages'
import { useUnreadStore } from '@/shared/model/unreadStore'
import { markAsRead } from '@/shared/lib/unreadMessages'
import { getSeenOrderIds, markOrderSeen } from '@/shared/lib/seenOrders'

const STATUS_LABELS: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'danger' | 'info' }> = {
  PENDING:     { label: 'Очікує відповіді', variant: 'warning' },
  IN_PROGRESS: { label: 'В роботі',         variant: 'success' },
  COMPLETED:   { label: 'Виконано',          variant: 'info' },
  CANCELLED:   { label: 'Скасовано',         variant: 'danger' },
}

export const IncomingOrdersPage = () => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { isAuthenticated, _hasHydrated, user } = useAuthStore()
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['incoming-orders'],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/orders/incoming')
      return res.data.orders ?? []
    },
    enabled: _hasHydrated && isAuthenticated(),
  })

  const { data: workTypesData } = useQuery({
    queryKey: ['work-types'],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/work-types')
      return res.data.work_types ?? []
    },
    staleTime: Infinity,
  })

  const workTypeMap: Record<number, string> = {}
  for (const wt of workTypesData ?? []) {
    workTypeMap[wt.id] = wt.name
  }

  const customerIds = useMemo<string[]>(() => {
    if (!ordersData) return []
    const ids = new Set<string>()
    for (const o of ordersData) {
      if (o.customer_id) ids.add(o.customer_id)
    }
    return [...ids]
  }, [ordersData])

  const { data: customersData } = useQuery({
    queryKey: ['customer-profiles', customerIds],
    queryFn: async () => {
      const results = await Promise.all(
        customerIds.map(id =>
          apiClient.get(`/api/v1/users/${id}`).then(r => r.data).catch(() => null)
        )
      )
      const map: Record<string, any> = {}
      results.forEach((profile, i) => {
        if (profile) map[customerIds[i]] = profile
      })
      return map
    },
    enabled: customerIds.length > 0,
    staleTime: 5 * 60 * 1000,
  })

  const customerMap: Record<string, any> = customersData ?? {}

  useUnreadMessages(ordersData ?? [], 'master')
  const unreadOrderIds = useUnreadStore((s) => s.unreadOrderIds)
  const removeUnread = useUnreadStore((s) => s.removeUnread)
  const addUnread = useUnreadStore((s) => s.addUnread)

  // Нові вхідні замовлення (ще не переглянуті) → підсвічуємо як непрочитані
  useEffect(() => {
    if (!ordersData) return
    const seen = getSeenOrderIds()
    for (const order of ordersData) {
      if (!seen.has(order.id)) {
        addUnread(order.id)
      }
    }
  }, [ordersData, addUnread])

  const shareContactMutation = useMutation({
    mutationFn: (orderId: string) => apiClient.post(`/api/v1/orders/${orderId}/share-contact`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['incoming-orders'] }),
  })

  const acceptMutation = useMutation({
    mutationFn: (orderId: string) => apiClient.post(`/api/v1/orders/${orderId}/accept`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['incoming-orders'] }),
  })

  const rejectMutation = useMutation({
    mutationFn: (orderId: string) => apiClient.post(`/api/v1/orders/${orderId}/reject`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['incoming-orders'] }),
  })

  const completeMutation = useMutation({
    mutationFn: (orderId: string) => apiClient.post(`/api/v1/orders/${orderId}/complete`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['incoming-orders'] }),
  })

  if (_hasHydrated && !isAuthenticated()) {
    router.push('/login')
    return null
  }

  if (_hasHydrated && user?.role !== 'USER_TYPE_MASTER') {
    router.push('/')
    return null
  }

  if (!_hasHydrated || isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-800">Вхідні замовлення</h1>

      {ordersData?.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <div className="mb-4 text-5xl">📭</div>
          <p className="text-gray-500">Немає нових замовлень.</p>
          <Link href="/categories" className="mt-4 inline-block text-orange-500 hover:underline">
            Переглянути категорії →
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {ordersData?.map((order: any) => {
            const statusInfo = STATUS_LABELS[order.status] ?? { label: order.status, variant: 'default' as const }
            const isExpanded = expandedId === order.id
            const isPending = order.status === 'PENDING'
            const isInProgress = order.status === 'IN_PROGRESS'
            const isBusy = acceptMutation.isPending || rejectMutation.isPending
            const hasUnread = unreadOrderIds.has(order.id)

            return (
              <div
                key={order.id}
                className={`rounded-xl border bg-white shadow-sm transition-shadow hover:shadow-md ${hasUnread && !isExpanded ? 'border-orange-300 ring-1 ring-orange-200' : 'border-gray-200'}`}
              >
                {/* Заголовок картки — завжди видимий */}
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <h2 className="text-lg font-semibold text-gray-800">{order.title}</h2>
                        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                      </div>
                      <p className={`text-sm text-gray-600 ${isExpanded ? '' : 'line-clamp-2'}`}>
                        {order.description}
                      </p>

                      {/* Замовник */}
                      {(() => {
                        const customer = customerMap[order.customer_id]
                        if (!customer) return null
                        const displayName = `${customer.first_name} ${customer.last_name?.[0] ?? ''}.`
                        return (
                          <div className="mt-2 flex items-center gap-2">
                            {customer.avatar_url ? (
                              <img
                                src={`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'}${customer.avatar_url}`}
                                alt=""
                                className="h-6 w-6 rounded-full object-cover"
                              />
                            ) : (
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-500">
                                {customer.first_name?.[0]}{customer.last_name?.[0]}
                              </div>
                            )}
                            <span className="text-sm text-gray-500">
                              Замовник: <span className="font-medium text-gray-700">{displayName}</span>
                            </span>
                          </div>
                        )
                      })()}

                      <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-400">
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
                      onClick={() => {
                        if (!isExpanded) {
                          markAsRead(order.id)
                          markOrderSeen(order.id)
                          removeUnread(order.id)
                        }
                        setExpandedId(isExpanded ? null : order.id)
                      }}
                      className={`ml-4 shrink-0 rounded-lg border px-3 py-1.5 text-sm transition-colors relative ${
                        hasUnread && !isExpanded
                          ? 'border-orange-300 text-orange-500 hover:bg-orange-50'
                          : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {hasUnread && !isExpanded && (
                        <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                          !
                        </span>
                      )}
                      {isExpanded ? '▲ Згорнути' : '▼ Деталі'}
                    </button>
                  </div>
                </div>

                {/* Розгорнута секція */}
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

                      {order.final_price > 0 && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <span>✅</span>
                          <span>Погоджена ціна: <span className="font-medium text-green-600">£{order.final_price}</span></span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-gray-600">
                        <span>🕐</span>
                        <span>Отримано: <span className="font-medium text-gray-800">
                          {new Date(order.created_at).toLocaleString('uk-UA')}
                        </span></span>
                      </div>

                      {order.scheduled_at && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <span>📅</span>
                          <span>Дата виконання: <span className="font-medium text-gray-800">
                            {new Date(order.scheduled_at.slice(0, 10) + 'T12:00:00').toLocaleDateString('uk-UA')}
                            {order.scheduled_to && (
                              <> — {new Date(order.scheduled_to.slice(0, 10) + 'T12:00:00').toLocaleDateString('uk-UA')}</>
                            )}
                          </span></span>
                        </div>
                      )}

                      {order.address && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <span>📍</span>
                          <span>Адреса: <span className="font-medium text-gray-800">{order.address}</span></span>
                        </div>
                      )}
                    </div>

                    {/* Контактні дані замовника якщо він поділився */}
                    {isInProgress && (
                      <div className="mt-4 border-t border-gray-100 pt-4">
                        <p className="mb-3 text-sm font-medium text-green-600">✅ Вас прийняли до виконання</p>
                        {order.customer_phone ? (
                          <div className="mb-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
                            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-green-600">Контакти замовника</p>
                            <p className="text-sm font-medium text-gray-800">📞 {order.customer_phone}</p>
                          </div>
                        ) : (
                          !order.master_shared_contact && (
                            <button
                              onClick={() => shareContactMutation.mutate(order.id)}
                              disabled={shareContactMutation.isPending}
                              className="mb-3 w-full rounded-lg border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-medium text-orange-600 hover:bg-orange-100 transition-colors disabled:opacity-50"
                            >
                              🤝 Надати доступ до моїх контактних даних
                            </button>
                          )
                        )}
                        {order.master_shared_contact && !order.customer_phone && (
                          <p className="mb-3 text-xs text-gray-400">✅ Ви надали доступ до своїх контактів. Очікуйте відповіді замовника.</p>
                        )}
                      </div>
                    )}

                    {/* Чат доступний як тільки є пропозиція */}
                    {(isPending || isInProgress) && (
                      <div className="mt-4 border-t border-gray-100 pt-4">
                        <OrderChat orderId={order.id} myRole="master" />
                      </div>
                    )}

                    {/* Кнопки прийняти / відхилити */}
                    {isPending && (
                      <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-100 pt-4">
                        <button
                          onClick={() => acceptMutation.mutate(order.id)}
                          disabled={isBusy}
                          className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 transition-colors disabled:opacity-50"
                        >
                          {acceptMutation.isPending ? 'Приймаємо...' : 'Прийняти замовлення'}
                        </button>
                        <button
                          onClick={() => rejectMutation.mutate(order.id)}
                          disabled={isBusy}
                          className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          {rejectMutation.isPending ? 'Відхиляємо...' : 'Відхилити'}
                        </button>
                      </div>
                    )}

                    {/* Кнопка Виконано для майстра */}
                    {isInProgress && (
                      <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-100 pt-4">
                        <button
                          onClick={() => completeMutation.mutate(order.id)}
                          disabled={completeMutation.isPending}
                          className="rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600 transition-colors disabled:opacity-50"
                        >
                          {completeMutation.isPending ? 'Завершуємо...' : '✅ Виконано'}
                        </button>
                      </div>
                    )}
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
