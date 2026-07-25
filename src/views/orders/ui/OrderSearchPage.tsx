'use client'

import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/shared/api/client'
import { useAuthStore } from '@/entities/user/model/userStore'
import { Spinner } from '@/shared/ui/Spinner'
import { Badge } from '@/shared/ui/Badge'
import { OrderChat } from '@/widgets/order-chat/ui/OrderChat'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'

export const OrderSearchPage = () => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { isAuthenticated, _hasHydrated, user } = useAuthStore()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [selectedWorkType, setSelectedWorkType] = useState<number>(0)
  // orderId → { message, price }
  const [responseForm, setResponseForm] = useState<Record<string, { message: string; price: string }>>({})
  const [responseError, setResponseError] = useState<Record<string, string>>({})
  const [showChatForOrder, setShowChatForOrder] = useState<Record<string, boolean>>({})

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['orders-search'],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/orders')
      return res.data.orders ?? []
    },
    enabled: _hasHydrated && isAuthenticated(),
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

  const workTypeMap: Record<number, string> = {}
  for (const wt of workTypesData ?? []) {
    workTypeMap[wt.id] = wt.name
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

  const filtered = useMemo(() => {
    if (!ordersData) return []
    return ordersData.filter((o: any) => {
      const q = search.toLowerCase()
      const matchesText =
        !q ||
        o.title?.toLowerCase().includes(q) ||
        o.description?.toLowerCase().includes(q) ||
        o.address?.toLowerCase().includes(q)
      const matchesType = !selectedWorkType || o.work_type_id === selectedWorkType
      return matchesText && matchesType
    })
  }, [ordersData, search, selectedWorkType])

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
          value={selectedWorkType}
          onChange={e => setSelectedWorkType(Number(e.target.value))}
          className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
        >
          <option value={0}>Всі послуги</option>
          {(workTypesData ?? []).map((wt: any) => (
            <option key={wt.id} value={wt.id}>{wt.name}</option>
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
            const showChat = !!showChatForOrder[order.id]

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
                          <button
                            onClick={() => setShowChatForOrder(prev => ({ ...prev, [order.id]: !prev[order.id] }))}
                            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                          >
                            {showChat ? 'Згорнути переписку' : 'Переписка із замовником'}
                          </button>
                          {showChat && (
                            <div className="border-t border-gray-100 pt-3">
                              <OrderChat orderId={order.id} myRole="master" />
                            </div>
                          )}
                        </>
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
                              onClick={() => {
                                if (!form.message.trim()) return
                                respondMutation.mutate({
                                  orderId: order.id,
                                  message: form.message,
                                  price: Number(form.price) || 0,
                                })
                              }}
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
