'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { apiClient } from '@/shared/api/client'
import { useAuthStore } from '@/entities/user/model/userStore'
import { Spinner } from '@/shared/ui/Spinner'
import { Badge } from '@/shared/ui/Badge'

const STATUS_LABELS: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'danger' | 'info' }> = {
  OPEN:        { label: 'Open',        variant: 'info' },
  IN_PROGRESS: { label: 'In Progress', variant: 'warning' },
  COMPLETED:   { label: 'Completed',   variant: 'success' },
  CANCELLED:   { label: 'Cancelled',   variant: 'danger' },
  PENDING:     { label: 'Pending',     variant: 'default' },
}

interface Props {
  orderId: string
}

export const OrderDetailPage = ({ orderId }: Props) => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { user, isAuthenticated, _hasHydrated } = useAuthStore()
  const [actionError, setActionError] = useState<string | null>(null)

  const { data: orderData, isLoading: orderLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const res = await apiClient.get(`/api/v1/orders/${orderId}`)
      return res.data.order ?? res.data
    },
    enabled: _hasHydrated && isAuthenticated(),
  })

  const { data: responsesData, isLoading: responsesLoading } = useQuery({
    queryKey: ['order-responses', orderId],
    queryFn: async () => {
      const res = await apiClient.get(`/api/v1/orders/${orderId}/responses`)
      return res.data.responses ?? []
    },
    enabled: _hasHydrated && isAuthenticated(),
  })

  const cancelMutation = useMutation({
    mutationFn: () => apiClient.post(`/api/v1/orders/${orderId}/cancel`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', orderId] })
      queryClient.invalidateQueries({ queryKey: ['my-orders'] })
    },
    onError: () => setActionError('Failed to cancel order'),
  })

  const completeMutation = useMutation({
    mutationFn: () => apiClient.post(`/api/v1/orders/${orderId}/complete`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', orderId] })
      queryClient.invalidateQueries({ queryKey: ['my-orders'] })
    },
    onError: () => setActionError('Failed to complete order'),
  })

  const acceptResponseMutation = useMutation({
    mutationFn: (responseId: string) =>
      apiClient.post(`/api/v1/orders/${orderId}/responses/${responseId}/accept`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', orderId] })
      queryClient.invalidateQueries({ queryKey: ['order-responses', orderId] })
    },
    onError: () => setActionError('Failed to accept response'),
  })

  if (_hasHydrated && !isAuthenticated()) {
    router.push('/login')
    return null
  }

  if (!_hasHydrated || orderLoading) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!orderData) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 text-center">
        <p className="text-gray-500">Order not found.</p>
        <Link href="/orders/my" className="mt-4 inline-block text-orange-500 hover:underline">
          ← My Orders
        </Link>
      </div>
    )
  }

  const order = orderData
  const statusInfo = STATUS_LABELS[order.status] ?? { label: order.status, variant: 'default' as const }
  const responses: any[] = responsesData ?? []
  const isOwner = order.customer_id === user?.id
  const canCancel = isOwner && (order.status === 'OPEN' || order.status === 'PENDING')
  const canComplete = isOwner && order.status === 'IN_PROGRESS'

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/orders/my"
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          ← Back
        </Link>
        <h1 className="text-xl font-bold text-gray-800">Order Details</h1>
      </div>

      {/* Order card */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="text-xl font-semibold text-gray-800">{order.title}</h2>
          <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
        </div>

        <p className="mb-6 text-gray-600 leading-relaxed">{order.description}</p>

        {/* Details grid */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-sm">
          {order.address && (
            <div className="flex items-start gap-2 text-gray-600">
              <span className="mt-0.5 text-base">📍</span>
              <span>{order.address}</span>
            </div>
          )}
          {order.budget > 0 && (
            <div className="flex items-center gap-2 text-gray-600">
              <span>💰</span>
              <span>Budget: <span className="font-medium text-gray-800">£{order.budget}</span></span>
            </div>
          )}
          {order.final_price > 0 && (
            <div className="flex items-center gap-2 text-gray-600">
              <span>✅</span>
              <span>Final price: <span className="font-medium text-green-600">£{order.final_price}</span></span>
            </div>
          )}
          <div className="flex items-center gap-2 text-gray-600">
            <span>📋</span>
            <span>Type: <span className="font-medium text-gray-800">{order.order_type === 'DIRECT' ? '🎯 Direct' : '🌐 Open'}</span></span>
          </div>
          {order.work_type_id > 0 && (
            <div className="flex items-center gap-2 text-gray-600">
              <span>🔧</span>
              <span>Service ID: <span className="font-medium text-gray-800">#{order.work_type_id}</span></span>
            </div>
          )}
          <div className="flex items-center gap-2 text-gray-600">
            <span>🕐</span>
            <span>Created: <span className="font-medium text-gray-800">{new Date(order.created_at).toLocaleString('en-GB')}</span></span>
          </div>
          {order.scheduled_at && (
            <div className="flex items-center gap-2 text-gray-600">
              <span>📅</span>
              <span>Scheduled: <span className="font-medium text-gray-800">{new Date(order.scheduled_at).toLocaleString('en-GB')}</span></span>
            </div>
          )}
          {order.completed_at && (
            <div className="flex items-center gap-2 text-gray-600">
              <span>🏁</span>
              <span>Completed: <span className="font-medium text-gray-800">{new Date(order.completed_at).toLocaleString('en-GB')}</span></span>
            </div>
          )}
        </div>

        {/* Actions */}
        {(canCancel || canComplete) && (
          <div className="mt-6 flex gap-3 border-t border-gray-100 pt-5">
            {canCancel && (
              <button
                onClick={() => { setActionError(null); cancelMutation.mutate() }}
                disabled={cancelMutation.isPending}
                className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                {cancelMutation.isPending ? 'Cancelling...' : 'Cancel Order'}
              </button>
            )}
            {canComplete && (
              <button
                onClick={() => { setActionError(null); completeMutation.mutate() }}
                disabled={completeMutation.isPending}
                className="rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600 transition-colors disabled:opacity-50"
              >
                {completeMutation.isPending ? 'Completing...' : 'Complete Order'}
              </button>
            )}
          </div>
        )}

        {actionError && (
          <p className="mt-3 text-sm text-red-500">{actionError}</p>
        )}
      </div>

      {/* Responses */}
      <div className="mt-6">
        <h3 className="mb-3 text-lg font-semibold text-gray-800">
          Master Responses
          {responses.length > 0 && (
            <span className="ml-2 rounded-full bg-orange-100 px-2 py-0.5 text-sm font-medium text-orange-600">
              {responses.length}
            </span>
          )}
        </h3>

        {responsesLoading ? (
          <div className="flex justify-center py-6">
            <Spinner size="md" />
          </div>
        ) : responses.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-400">
            <div className="mb-2 text-3xl">💬</div>
            <p>No responses from masters yet</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {responses.map((resp: any) => (
              <div
                key={resp.id}
                className={`rounded-xl border bg-white p-4 shadow-sm transition-all ${
                  resp.is_accepted ? 'border-green-300 bg-green-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <Link
                        href={`/masters/${resp.master_id}`}
                        className="text-sm font-medium text-orange-500 hover:underline"
                        target="_blank"
                      >
                        View master profile →
                      </Link>
                      {resp.is_accepted && (
                        <Badge variant="success">✓ Accepted</Badge>
                      )}
                    </div>
                    {resp.message && (
                      <p className="text-sm text-gray-600">{resp.message}</p>
                    )}
                    <div className="mt-2 flex items-center gap-4 text-sm text-gray-400">
                      {resp.price > 0 && (
                        <span className="font-medium text-gray-700">£{resp.price}</span>
                      )}
                      <span>{new Date(resp.created_at).toLocaleString('en-GB')}</span>
                    </div>
                  </div>

                  {isOwner && !resp.is_accepted && order.status === 'OPEN' && (
                    <button
                      onClick={() => { setActionError(null); acceptResponseMutation.mutate(resp.id) }}
                      disabled={acceptResponseMutation.isPending}
                      className="shrink-0 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 transition-colors disabled:opacity-50"
                    >
                      Accept
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
