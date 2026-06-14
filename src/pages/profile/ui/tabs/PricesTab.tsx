'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/client'
import { Button } from '@/shared/ui/Button'
import { Spinner } from '@/shared/ui/Spinner'

const UNITS = [
  'per/hour',
  'per/day',
  'per/m²',
  'per/m³',
  'per/km',
  'per/item',
  'per/room',
  'per/job',
]

interface PriceItem {
  workTypeId: number
  name: string
  price: number
  unit: string
  currency: string
}

export const PricesTab = () => {
  const [items, setItems] = useState<PriceItem[]>([])
  const [saved, setSaved] = useState(false)

  // Завантажуємо вибрані типи робіт з цінами
  const { data: workTypesData, isLoading: loadingWorkTypes } = useQuery({
    queryKey: ['worker-work-types'],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/users/work-types')
      return res.data.items ?? []
    },
  })

  // Завантажуємо всі типи робіт щоб отримати назви
  const { data: allWorkTypes, isLoading: loadingAll } = useQuery({
    queryKey: ['all-work-types'],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/work-types')
      return res.data.work_types ?? []
    },
  })

  useEffect(() => {
    if (workTypesData && allWorkTypes) {
      const merged = workTypesData.map((wt: any) => {
        const found = allWorkTypes.find((a: any) => a.id === wt.work_type_id)
        return {
          workTypeId: wt.work_type_id,
          name: found?.name ?? `Work type #${wt.work_type_id}`,
          price: wt.price ?? 0,
          unit: wt.unit ?? 'per/hour',
          currency: wt.currency ?? 'GBP',
        }
      })
      setItems(merged)
    }
  }, [workTypesData, allWorkTypes])

  const { mutate: savePrices, isPending } = useMutation({
    mutationFn: async () => {
      await apiClient.put('/api/v1/users/work-types', {
        items: items.map(item => ({
          work_type_id: item.workTypeId,
          price: item.price,
          unit: item.unit,
          currency: item.currency,
        })),
      })
    },
    onSuccess: () => {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    },
  })

  const updateItem = (workTypeId: number, field: keyof PriceItem, value: any) => {
    setItems(prev =>
      prev.map(item =>
        item.workTypeId === workTypeId ? { ...item, [field]: value } : item
      )
    )
  }

  if (loadingWorkTypes || loadingAll) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
        <p className="text-gray-500">
          Спочатку виберіть типи робіт у вкладці{' '}
          <span className="font-medium text-orange-500">Типи робіт</span>
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Вартість послуг</h2>
        <div className="flex items-center gap-3">
          {saved && <p className="text-sm text-green-600">✅ Збережено!</p>}
          <Button onClick={() => savePrices()} loading={isPending}>
            Зберегти
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-12 gap-4 border-b border-gray-100 bg-gray-50 px-4 py-2 text-xs font-medium text-gray-500">
          <div className="col-span-5">Service</div>
          <div className="col-span-3">Price</div>
          <div className="col-span-3">Unit</div>
          <div className="col-span-1">Currency</div>
        </div>

        {/* Rows */}
        {items.map((item, index) => (
          <div key={item.workTypeId}>
            {index > 0 && <div className="border-t border-gray-100" />}
            <div className="grid grid-cols-12 items-center gap-4 px-4 py-3">
              <div className="col-span-5 text-sm font-medium text-gray-800">
                {item.name}
              </div>

              <div className="col-span-3">
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={item.price}
                  onChange={(e) => updateItem(item.workTypeId, 'price', parseFloat(e.target.value) || 0)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>

              <div className="col-span-3">
                <select
                  value={item.unit}
                  onChange={(e) => updateItem(item.workTypeId, 'unit', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                >
                  {UNITS.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>

              <div className="col-span-1 text-sm font-medium text-gray-500">
                {item.currency}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
