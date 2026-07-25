'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { orderApi } from '@/entities/order/api/orderApi'
import { apiClient } from '@/shared/api/client'
import { useAuthStore } from '@/entities/user/model/userStore'
import { Spinner } from '@/shared/ui/Spinner'
import type { Order } from '@/entities/order/model/types'

interface EditFormProps {
  order: Order
  orderId: string
}

function EditForm({ order, orderId }: EditFormProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const raw = order as any

  const [title, setTitle] = useState(order.title)
  const [description, setDescription] = useState(order.description ?? '')
  const [budget, setBudget] = useState(order.budget?.toString() ?? '')
  const [address, setAddress] = useState(order.address ?? '')
  const [workTypeId, setWorkTypeId] = useState<number>(raw.work_type_id ?? 0)
  const [scheduledAt, setScheduledAt] = useState(
    raw.scheduled_at ? (raw.scheduled_at as string).slice(0, 10) : ''
  )
  const [scheduledTo, setScheduledTo] = useState(
    raw.scheduled_to ? (raw.scheduled_to as string).slice(0, 10) : ''
  )
  const [error, setError] = useState('')

  const { data: categoriesData } = useQuery({
    queryKey: ['categories-with-work-types'],
    queryFn: async () => {
      const [catRes, wtRes] = await Promise.all([
        apiClient.get('/api/v1/categories'),
        apiClient.get('/api/v1/work-types'),
      ])
      const categories: any[] = catRes.data.categories ?? []
      const workTypes: any[] = wtRes.data.work_types ?? []
      return categories.map((cat: any) => ({
        ...cat,
        workTypes: workTypes.filter((wt: any) => wt.category_id === cat.id),
      }))
    },
    staleTime: Infinity,
  })

  const mutation = useMutation({
    mutationFn: () =>
      orderApi.update(orderId, {
        title,
        description,
        budget: parseFloat(budget) || 0,
        address,
        scheduled_at: scheduledAt || undefined,
        scheduled_to: scheduledTo || undefined,
        work_type_id: workTypeId || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-orders'] })
      queryClient.invalidateQueries({ queryKey: ['order', orderId] })
      router.push('/orders/my')
    },
    onError: () => {
      setError('Failed to update order. Please try again.')
    },
  })

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/orders/my" className="text-gray-400 hover:text-gray-600 transition-colors">
          ←
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Edit Order</h1>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Категорія послуги</label>
            <select
              value={workTypeId}
              onChange={(e) => setWorkTypeId(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400 bg-white"
            >
              <option value={0}>— оберіть категорію —</option>
              {categoriesData?.map((cat: any) =>
                cat.workTypes?.length > 0 ? (
                  <optgroup key={cat.id} label={cat.name}>
                    {cat.workTypes.map((wt: any) => (
                      <option key={wt.id} value={wt.id}>
                        {wt.name}
                      </option>
                    ))}
                  </optgroup>
                ) : null
              )}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
              placeholder="What do you need done?"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
              placeholder="Describe the job in detail..."
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Budget (£)</label>
            <input
              type="number"
              min="0"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
              placeholder="0"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
              placeholder="Where is the job located?"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Дата виконання</label>
            <div className="flex items-center gap-3">
              <input
                type="date"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                min={new Date().toISOString().slice(0, 10)}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
              />
              <span className="shrink-0 text-sm text-gray-400">—</span>
              <input
                type="date"
                value={scheduledTo}
                onChange={(e) => setScheduledTo(e.target.value)}
                min={scheduledAt || new Date().toISOString().slice(0, 10)}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={() => mutation.mutate()}
            disabled={!title.trim() || mutation.isPending}
            className="flex-1 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {mutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
          <Link
            href="/orders/my"
            className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </div>
    </div>
  )
}

interface Props {
  orderId: string
}

export const EditOrderPage = ({ orderId }: Props) => {
  const router = useRouter()
  const { isAuthenticated, _hasHydrated } = useAuthStore()

  const { data, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => orderApi.getByID(orderId),
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

  const order = data?.order

  if (!order) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 text-center text-gray-500">
        Order not found.
      </div>
    )
  }

  if (order.status !== 'OPEN' && order.status !== 'PENDING') {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 text-center">
        <p className="text-gray-500">Only open or pending orders can be edited.</p>
        <Link href="/orders/my" className="mt-4 inline-block text-orange-500 hover:underline">
          ← Back to My Orders
        </Link>
      </div>
    )
  }

  return <EditForm order={order} orderId={orderId} />
}
