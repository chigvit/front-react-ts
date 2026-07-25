'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/client'
import { Button } from '@/shared/ui/Button'
import { Spinner } from '@/shared/ui/Spinner'

export const WorkTypesTab = () => {
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [expandedCategories, setExpandedCategories] = useState<number[]>([])
  const [saved, setSaved] = useState(false)
  const queryClient = useQueryClient()

  const { data: categoriesData, isLoading: loadingCategories } = useQuery({
    queryKey: ['categories-with-work-types'],
    queryFn: async () => {
      const categoriesRes = await apiClient.get('/api/v1/categories')
      const categories = categoriesRes.data.categories ?? []

      const withWorkTypes = await Promise.all(
        categories.map(async (cat: any) => {
          const wtRes = await apiClient.get(`/api/v1/categories/${cat.id}/work-types`)
          return {
            ...cat,
            workTypes: wtRes.data.work_types ?? [],
          }
        })
      )
      return withWorkTypes
    },
  })

  const { data: selectedData, isLoading: loadingSelected } = useQuery({
    queryKey: ['worker-work-types'],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/users/work-types')
      return res.data.items ?? []
    },
  })

  useEffect(() => {
    if (selectedData) {
      setSelectedIds(selectedData.map((item: any) => item.work_type_id))
    }
  }, [selectedData])

  const { mutate: saveWorkTypes, isPending } = useMutation({
    mutationFn: async (ids: number[]) => {
      // Зберігаємо існуючі ціни
      const existingItems = selectedData ?? []

      const items = ids.map(id => {
        const existing = existingItems.find((item: any) => item.work_type_id === id)
        return {
          work_type_id: id,
          price: existing?.price ?? 0,
          unit: existing?.unit ?? 'per/hour',
          currency: existing?.currency ?? 'GBP',
        }
      })

      await apiClient.put('/api/v1/users/work-types', { items })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['worker-work-types'] })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    },
  })

  const toggleWorkType = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const toggleCategory = (id: number) => {
    setExpandedCategories(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const getSelectedCountForCategory = (workTypes: any[]) => {
    return workTypes.filter(wt => selectedIds.includes(wt.id)).length
  }

  if (loadingCategories || loadingSelected) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Типи робіт</h2>
          <p className="text-sm text-gray-500">Вибрано: {selectedIds.length} типів</p>
        </div>
        <div className="flex items-center gap-3">
          {saved && <p className="text-sm text-green-600">✅ Збережено!</p>}
          <Button onClick={() => saveWorkTypes(selectedIds)} loading={isPending}>
            Зберегти
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        {categoriesData?.map((category: any, index: number) => {
          const isExpanded = expandedCategories.includes(category.id)
          const selectedCount = getSelectedCountForCategory(category.workTypes)

          return (
            <div key={category.id}>
              {index > 0 && <div className="border-t border-gray-100" />}
              <button
                type="button"
                onClick={() => toggleCategory(category.id)}
                className="flex w-full items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-800">{category.name}</span>
                  {selectedCount > 0 && (
                    <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-600">
                      {selectedCount}
                    </span>
                  )}
                </div>
                <span className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                  ▾
                </span>
              </button>

              {isExpanded && (
                <div className="border-t border-gray-100 bg-gray-50 px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    {category.workTypes.map((wt: any) => (
                      <button
                        key={wt.id}
                        type="button"
                        onClick={() => toggleWorkType(wt.id)}
                        className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                          selectedIds.includes(wt.id)
                            ? 'border-orange-500 bg-orange-50 text-orange-600'
                            : 'border-gray-300 bg-white text-gray-600 hover:border-orange-300'
                        }`}
                      >
                        {selectedIds.includes(wt.id) && '✓ '}{wt.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
