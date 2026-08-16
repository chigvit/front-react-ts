'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { apiClient } from '@/shared/api/client'
import { useAuthStore } from '@/entities/user/model/userStore'
import { Spinner } from '@/shared/ui/Spinner'
import { Badge } from '@/shared/ui/Badge'
import { MastersSidebar } from '@/widgets/masters-sidebar/ui/MastersSidebar'
import { OrderChat } from '@/widgets/order-chat/ui/OrderChat'
import { RateUserForm } from '@/widgets/rate-user/ui/RateUserForm'
import { useUnreadMessages } from '@/shared/hooks/useUnreadMessages'
import { useUnreadStore } from '@/shared/model/unreadStore'
import { markAsRead } from '@/shared/lib/unreadMessages'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'

const STATUS_LABELS: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'danger' | 'info' }> = {
  OPEN:        { label: 'Open',              variant: 'info' },
  IN_PROGRESS: { label: 'In Progress',       variant: 'success' },
  COMPLETED:   { label: 'Completed',         variant: 'info' },
  CANCELLED:   { label: 'Cancelled',         variant: 'danger' },
  PENDING:     { label: 'Awaiting Response', variant: 'warning' },
}

export const MyOrdersPage = () => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { isAuthenticated, _hasHydrated } = useAuthStore()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [responseError, setResponseError] = useState<string | null>(null)
  const [openReplyResponseId, setOpenReplyResponseId] = useState<string | null>(null)

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/orders/my')
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

  const { data: responsesData, isLoading: responsesLoading } = useQuery({
    queryKey: ['order-responses', expandedId],
    queryFn: async () => {
      const res = await apiClient.get(`/api/v1/orders/${expandedId}/responses`)
      return res.data.responses ?? []
    },
    enabled: !!expandedId && _hasHydrated && isAuthenticated(),
  })

  const masterIds = useMemo<string[]>(() => {
    if (!ordersData) return []
    const ids = new Set<string>()
    for (const o of ordersData) {
      if (o.master_id) ids.add(o.master_id)
    }
    for (const r of responsesData ?? []) {
      if (r.master_id) ids.add(r.master_id)
    }
    return [...ids]
  }, [ordersData, responsesData])

  const { data: mastersData } = useQuery({
    queryKey: ['master-profiles', masterIds],
    queryFn: async () => {
      const results = await Promise.all(
        masterIds.map(id =>
          apiClient.get(`/api/v1/users/${id}`).then(r => r.data).catch(() => null)
        )
      )
      const map: Record<string, any> = {}
      results.forEach((profile, i) => {
        if (profile) map[masterIds[i]] = profile
      })
      return map
    },
    enabled: masterIds.length > 0,
    staleTime: 5 * 60 * 1000,
  })

  const masterMap: Record<string, any> = mastersData ?? {}

  useUnreadMessages(ordersData ?? [], 'customer')
  const unreadOrderIds = useUnreadStore((s) => s.unreadOrderIds)
  const removeUnread = useUnreadStore((s) => s.removeUnread)

  // Orders with an unread message are expanded immediately — without
  // an extra click on "Details" — and marked as read right away.
  const autoExpandedRef = useRef(false)
  useEffect(() => {
    if (autoExpandedRef.current || !ordersData || unreadOrderIds.size === 0) return
    const firstUnread = ordersData.find((o: any) => unreadOrderIds.has(o.id))
    if (firstUnread) {
      autoExpandedRef.current = true
      setExpandedId(firstUnread.id)
      markAsRead(firstUnread.id)
      removeUnread(firstUnread.id)
    }
  }, [ordersData, unreadOrderIds, removeUnread])

  const shareContactMutation = useMutation({
    mutationFn: (orderId: string) => apiClient.post(`/api/v1/orders/${orderId}/share-contact`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-orders'] }),
  })

  const cancelMutation = useMutation({
    mutationFn: (orderId: string) => apiClient.post(`/api/v1/orders/${orderId}/cancel`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-orders'] })
    },
  })

  const completeMutation = useMutation({
    mutationFn: (orderId: string) => apiClient.post(`/api/v1/orders/${orderId}/complete`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-orders'] }),
  })

  const acceptResponseMutation = useMutation({
    mutationFn: ({ orderId, responseId }: { orderId: string; responseId: string }) =>
      apiClient.post(`/api/v1/orders/${orderId}/responses/${responseId}/accept`),
    onSuccess: (_data, { orderId }) => {
      setResponseError(null)
      queryClient.invalidateQueries({ queryKey: ['my-orders'] })
      queryClient.invalidateQueries({ queryKey: ['order-responses', orderId] })
    },
    onError: (error: any) => {
      setResponseError(error?.response?.data?.error ?? 'Failed to accept response')
    },
  })

  if (_hasHydrated && !isAuthenticated()) {
    router.push('/login')
    return null
  }

  if (!_hasHydrated || isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  const expandedOrder = ordersData?.find((o: any) => o.id === expandedId) ?? null
  const firstOrder = ordersData?.[0] ?? null
  const sidebarWorkTypeId = (expandedOrder ?? firstOrder)?.work_type_id ?? 0
  const proposableOrderId = expandedOrder?.status === 'OPEN' ? expandedOrder.id : null
  // If the expanded order is not in OPEN status — hide the "Propose" button
  const hidePropose = expandedOrder != null && expandedOrder.status !== 'OPEN'

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-800">My Orders</h1>

      {ordersData?.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <div className="mb-4 text-5xl">📋</div>
          <p className="text-gray-500">You don't have any orders yet.</p>
          <Link href="/categories" className="mt-4 inline-block text-orange-500 hover:underline">
            Browse services →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
          {/* Left: order cards */}
          <div className="flex flex-col gap-4">
            {ordersData?.map((order: any) => {
              const statusInfo = STATUS_LABELS[order.status] ?? { label: order.status, variant: 'default' as const }
              const isExpanded = expandedId === order.id
              const hasUnread = unreadOrderIds.has(order.id)

              return (
                <div
                  key={order.id}
                  className={`rounded-xl border bg-white shadow-sm transition-shadow hover:shadow-md ${hasUnread && !isExpanded ? 'border-orange-300 ring-1 ring-orange-200' : 'border-gray-200'}`}
                >
                  {/* Card header — always visible */}
                  <div className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <h2 className="text-lg font-semibold text-gray-800">{order.title}</h2>
                          <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                          {order.order_type === 'DIRECT' && (
                            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">🎯 Direct</span>
                          )}
                        </div>
                        <p className={`text-sm text-gray-600 ${isExpanded ? '' : 'line-clamp-2'}`}>
                          {order.description}
                        </p>

                        {/* Master */}
                        {order.master_id && (() => {
                          const master = masterMap[order.master_id]
                          if (!master) return null
                          const displayName = `${master.first_name} ${master.last_name?.[0] ?? ''}.`
                          return (
                            <Link
                              href={`/masters/${order.master_id}`}
                              className="mt-2 flex items-center gap-2 w-fit"
                            >
                              {master.avatar_url ? (
                                <img
                                  src={`${API_URL}${master.avatar_url}`}
                                  alt=""
                                  className="h-6 w-6 rounded-full object-cover"
                                />
                              ) : (
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-500">
                                  {master.first_name?.[0]}{master.last_name?.[0]}
                                </div>
                              )}
                              <span className="text-sm text-gray-500">
                                Master: <span className="font-medium text-gray-700 hover:underline">{displayName}</span>
                              </span>
                            </Link>
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
                          <span>🕐 {new Date(order.created_at).toLocaleDateString('en-GB')}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (!isExpanded) {
                            markAsRead(order.id)
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
                        {isExpanded ? '▲ Collapse' : '▼ Details'}
                      </button>
                    </div>
                  </div>

                  {/* Expanded section — order details only, masters shown in right sidebar */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 px-5 pb-5">
                      <div className="pt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <span>📋</span>
                          <span>Type: <span className="font-medium text-gray-800">
                            {order.order_type === 'DIRECT' ? '🎯 Direct' : '🌐 Open'}
                          </span></span>
                        </div>

                        {order.work_type_id > 0 && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <span>🔧</span>
                            <span>Service: <span className="font-medium text-gray-800">
                              {workTypeMap[order.work_type_id] ?? `#${order.work_type_id}`}
                            </span></span>
                          </div>
                        )}

                        {order.final_price > 0 && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <span>✅</span>
                            <span>Agreed price: <span className="font-medium text-green-600">£{order.final_price}</span></span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-gray-600">
                          <span>🕐</span>
                          <span>Created: <span className="font-medium text-gray-800">
                            {new Date(order.created_at).toLocaleString('en-GB')}
                          </span></span>
                        </div>

                        {order.scheduled_at && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <span>📅</span>
                            <span>Scheduled date: <span className="font-medium text-gray-800">
                              {new Date(order.scheduled_at.slice(0, 10) + 'T12:00:00').toLocaleDateString('en-GB')}
                              {order.scheduled_to && (
                                <> — {new Date(order.scheduled_to.slice(0, 10) + 'T12:00:00').toLocaleDateString('en-GB')}</>
                              )}
                            </span></span>
                          </div>
                        )}

                        {order.completed_at && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <span>🏁</span>
                            <span>Completed: <span className="font-medium text-gray-800">
                              {new Date(order.completed_at).toLocaleString('en-GB')}
                            </span></span>
                          </div>
                        )}
                      </div>

                      {/* Master responses — while the order is open and a master hasn't been chosen yet */}
                      {order.status === 'OPEN' && (
                        <div className="mt-4 border-t border-gray-100 pt-4">
                          <h3 className="mb-3 text-sm font-semibold text-gray-800">
                            Master Responses
                            {responsesData?.length > 0 && (
                              <span className="ml-2 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-600">
                                {responsesData.length}
                              </span>
                            )}
                          </h3>

                          {responsesLoading ? (
                            <div className="flex justify-center py-4">
                              <Spinner size="md" />
                            </div>
                          ) : !responsesData || responsesData.length === 0 ? (
                            <p className="text-sm text-gray-400">No responses from masters yet</p>
                          ) : (
                            <div className="flex flex-col gap-2">
                              {responsesData.map((resp: any) => {
                                const master = masterMap[resp.master_id]
                                const displayName = master
                                  ? `${master.first_name} ${master.last_name?.[0] ?? ''}.`
                                  : null
                                return (
                                  <div
                                    key={resp.id}
                                    className={`rounded-lg border p-3 ${resp.is_accepted ? 'border-green-300 bg-green-50' : 'border-gray-200'}`}
                                  >
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="flex-1">
                                        <Link
                                          href={`/masters/${resp.master_id}`}
                                          className="flex items-center gap-2 w-fit"
                                        >
                                          {master?.avatar_url ? (
                                            <img
                                              src={`${API_URL}${master.avatar_url}`}
                                              alt=""
                                              className="h-6 w-6 rounded-full object-cover"
                                            />
                                          ) : (
                                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-500">
                                              {master?.first_name?.[0] ?? '?'}
                                            </div>
                                          )}
                                          <span className="text-sm font-medium text-gray-700 hover:underline">
                                            {displayName ?? 'Master'}
                                          </span>
                                          {resp.is_accepted && <Badge variant="success">✓ Accepted</Badge>}
                                        </Link>
                                        {resp.message && (
                                          <p className="mt-1 text-sm text-gray-600">{resp.message}</p>
                                        )}
                                        {resp.price > 0 && (
                                          <p className="mt-1 text-sm font-medium text-gray-700">£{resp.price}</p>
                                        )}
                                      </div>

                                      <div className="flex shrink-0 flex-col items-end gap-2">
                                        {!resp.is_accepted && (
                                          <button
                                            onClick={() => acceptResponseMutation.mutate({ orderId: order.id, responseId: resp.id })}
                                            disabled={acceptResponseMutation.isPending}
                                            className="rounded-lg bg-orange-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-orange-600 transition-colors disabled:opacity-50"
                                          >
                                            Accept
                                          </button>
                                        )}
                                        <button
                                          onClick={() => setOpenReplyResponseId(
                                            openReplyResponseId === resp.id ? null : resp.id
                                          )}
                                          className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                                        >
                                          {openReplyResponseId === resp.id ? 'Collapse' : 'Reply'}
                                        </button>
                                      </div>
                                    </div>

                                    {openReplyResponseId === resp.id && (
                                      <div className="mt-3 border-t border-gray-100 pt-3">
                                        <OrderChat orderId={order.id} myRole="customer" masterId={resp.master_id} />
                                      </div>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          )}
                          {responseError && (
                            <p className="mt-2 text-sm text-red-500">{responseError}</p>
                          )}
                        </div>
                      )}

                      {/* Master contact details if shared */}
                      {order.master_id && order.status === 'IN_PROGRESS' && (
                        <div className="mt-4 border-t border-gray-100 pt-4">
                          {order.master_phone ? (
                            <div className="mb-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
                              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-green-600">Master Contacts</p>
                              <p className="text-sm font-medium text-gray-800">📞 {order.master_phone}</p>
                            </div>
                          ) : (
                            !order.customer_shared_contact && (
                              <button
                                onClick={() => shareContactMutation.mutate(order.id)}
                                disabled={shareContactMutation.isPending}
                                className="mb-3 w-full rounded-lg border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-medium text-orange-600 hover:bg-orange-100 transition-colors disabled:opacity-50"
                              >
                                🤝 Share my contact details
                              </button>
                            )
                          )}
                          {order.customer_shared_contact && !order.master_phone && (
                            <p className="mb-3 text-xs text-gray-400">✅ You have shared access to your contacts. Waiting for the master's response.</p>
                          )}
                        </div>
                      )}

                      {/* Chat is available as soon as there's a master */}
                      {order.master_id && (order.status === 'PENDING' || order.status === 'IN_PROGRESS') && (
                        <div className="mt-4 border-t border-gray-100 pt-4">
                          <OrderChat orderId={order.id} myRole="customer" />
                        </div>
                      )}

                      <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-100 pt-4">
                        {(order.status === 'OPEN' || order.status === 'PENDING') && (
                          <Link
                            href={`/orders/${order.id}/edit`}
                            className="rounded-lg border border-orange-200 px-4 py-2 text-sm font-medium text-orange-500 hover:bg-orange-50 transition-colors"
                          >
                            Edit
                          </Link>
                        )}
                        {order.status === 'IN_PROGRESS' && (
                          <button
                            onClick={() => completeMutation.mutate(order.id)}
                            disabled={completeMutation.isPending}
                            className="rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600 transition-colors disabled:opacity-50"
                          >
                            {completeMutation.isPending ? 'Completing...' : '✅ Completed'}
                          </button>
                        )}
                        {(order.status === 'OPEN' || order.status === 'PENDING') && (
                          <button
                            onClick={() => cancelMutation.mutate(order.id)}
                            disabled={cancelMutation.isPending}
                            className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                          >
                            {cancelMutation.isPending ? 'Cancelling...' : 'Cancel'}
                          </button>
                        )}
                      </div>

                      {order.status === 'COMPLETED' && order.master_id && (
                        <div className="mt-4 border-t border-gray-100 pt-4">
                          <RateUserForm ratedId={order.master_id} label="the master" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Right: masters sidebar — always visible, updates when order is expanded */}
          <div className="lg:sticky lg:top-6 lg:self-start">
            <MastersSidebar
              workTypeId={sidebarWorkTypeId}
              proposableOrderId={proposableOrderId}
              hidePropose={hidePropose}
              onProposed={() => queryClient.invalidateQueries({ queryKey: ['my-orders'] })}
            />
          </div>
        </div>
      )}
    </div>
  )
}
