'use client'

import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { apiClient } from '@/shared/api/client'
import { useAuthStore } from '@/entities/user/model/userStore'
import { Spinner } from '@/shared/ui/Spinner'
import { Badge } from '@/shared/ui/Badge'

const STATUS_LABELS: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'danger' | 'info' }> = {
  OPEN: { label: 'Open', variant: 'info' },
  IN_PROGRESS: { label: 'In Progress', variant: 'warning' },
  COMPLETED: { label: 'Completed', variant: 'success' },
  CANCELLED: { label: 'Cancelled', variant: 'danger' },
}

export const MyOrdersPage = () => {
  const router = useRouter()
  const { isAuthenticated, _hasHydrated } = useAuthStore()

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/orders/my')
      return res.data.orders ?? []
    },
    enabled: _hasHydrated && isAuthenticated(),
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

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-800">My Orders</h1>

      {ordersData?.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <div className="mb-4 text-5xl">📋</div>
          <p className="text-gray-500">You haven't created any orders yet.</p>
          <Link href="/categories" className="mt-4 inline-block text-orange-500 hover:underline">
            Browse services →
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {ordersData?.map((order: any) => {
            const statusInfo = STATUS_LABELS[order.status] ?? { label: order.status, variant: 'default' as const }

            return (
              <div
                key={order.id}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <h2 className="text-lg font-semibold text-gray-800">{order.title}</h2>
                      <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{order.description}</p>

                    <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-400">
                      {order.address && <span>📍 {order.address}</span>}
                      {order.budget > 0 && <span>💰 £{order.budget}</span>}
                      <span>🕐 {new Date(order.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex gap-2 border-t border-gray-100 pt-4">
                  <Link
                    href={`/orders/${order.id}`}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    View Details
                  </Link>
                  {order.status === 'OPEN' && (
                    <button className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors">
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
