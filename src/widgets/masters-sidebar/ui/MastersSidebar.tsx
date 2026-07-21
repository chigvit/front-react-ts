'use client'

import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import Link from 'next/link'
import { apiClient } from '@/shared/api/client'
import { useGeolocation } from '@/shared/hooks/useGeolocation'
import { Spinner } from '@/shared/ui/Spinner'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'

interface Props {
  workTypeId: number
  title?: string
  selectedMasterId?: string | null
  onSelectMaster?: (masterId: string | null) => void
  // MyOrdersPage: пропонуємо існуюче замовлення
  proposableOrderId?: string | null
  onProposed?: () => void
}

export function MastersSidebar({ workTypeId, title, selectedMasterId, onSelectMaster, proposableOrderId, onProposed }: Props) {
  const [expandedMasterId, setExpandedMasterId] = useState<string | null>(null)
  const [proposedMasterIds, setProposedMasterIds] = useState<Set<string>>(new Set())

  const proposeMutation = useMutation({
    mutationFn: (masterId: string) =>
      apiClient.post(`/api/v1/orders/${proposableOrderId}/propose`, { master_id: masterId }),
    onSuccess: (_data, masterId) => {
      setProposedMasterIds(prev => new Set(prev).add(masterId))
      onProposed?.()
    },
  })
  const { location } = useGeolocation()

  const { data: mastersData, isLoading } = useQuery({
    queryKey: ['masters-sidebar', workTypeId, location?.latitude, location?.longitude],
    queryFn: async () => {
      const lat = location?.latitude ?? 53.8008
      const lng = location?.longitude ?? -1.5491
      const res = await apiClient.get('/api/v1/location/masters', {
        params: {
          lat,
          lng,
          radius: 50000,
          work_type_id: workTypeId || undefined,
        },
      })
      return res.data.masters ?? []
    },
  })

  const masters: any[] = mastersData ?? []

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-gray-100 px-4 py-3">
        <h3 className="text-sm font-semibold text-gray-800">
          {title ?? 'Доступні майстри'}
        </h3>
        <p className="mt-0.5 text-xs text-gray-400">
          {isLoading
            ? 'Пошук майстрів...'
            : masters.length > 0
              ? `${masters.length} майстрів поруч`
              : 'Немає майстрів поруч'}
        </p>
        {proposableOrderId && (
          <p className="mt-1.5 rounded-md bg-orange-50 px-2 py-1 text-xs text-orange-600">
            🎯 Натисніть «Запропонувати» щоб надіслати замовлення майстру
          </p>
        )}
      </div>

      <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="md" />
          </div>
        ) : masters.length === 0 ? (
          <div className="px-4 py-12 text-center text-sm text-gray-400">
            <p className="mb-1 text-3xl">🔍</p>
            Майстрів не знайдено
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {masters.map((master: any) => {
              const isExpanded = expandedMasterId === master.user_id
              const isSelected = selectedMasterId === master.user_id

              return (
                <div
                  key={master.user_id}
                  className={`p-4 transition-colors ${isSelected ? 'bg-orange-50' : 'hover:bg-gray-50'}`}
                >
                  {/* Avatar + name + meta */}
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 overflow-hidden rounded-full border border-gray-200 bg-orange-100">
                      {master.avatar_url ? (
                        <img src={`${API_URL}${master.avatar_url}`} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm font-bold text-orange-500">
                          {master.first_name?.[0]}{master.last_name?.[0]}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-gray-800">
                        {master.first_name} {master.last_name?.[0]}.
                      </p>
                      <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-gray-400">
                        {master.rating > 0 && <span className="text-yellow-500">⭐ {master.rating}</span>}
                        {master.reviews_count > 0 && <span>{master.reviews_count} відг.</span>}
                        {master.distance_meters > 0 && <span>📍 {(master.distance_meters / 1000).toFixed(1)} км</span>}
                        {master.experience_years > 0 && <span>🛠 {master.experience_years} р.</span>}
                      </div>
                    </div>
                  </div>

                  {/* Toggle */}
                  <button
                    onClick={() => setExpandedMasterId(isExpanded ? null : master.user_id)}
                    className="mb-2 w-full rounded-lg border border-gray-200 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    {isExpanded ? 'Сховати ▲' : 'Детальніше ▼'}
                  </button>

                  {/* Expanded profile */}
                  {isExpanded && (
                    <div className="mb-2 space-y-2.5 rounded-lg border border-gray-100 bg-gray-50 p-3 text-xs text-gray-600">
                      {master.postcode && (
                        <div className="flex items-center gap-1.5">
                          <span>📍</span>
                          <span className="font-medium text-gray-700">{master.postcode}</span>
                        </div>
                      )}
                      {master.bio && (
                        <div>
                          <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">Про себе</p>
                          <p className="leading-relaxed text-gray-700">{master.bio}</p>
                        </div>
                      )}
                      {master.services_description && (
                        <div>
                          <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">Послуги</p>
                          <p className="leading-relaxed text-gray-700">{master.services_description}</p>
                        </div>
                      )}
                      <div className="flex flex-wrap gap-3 border-t border-gray-100 pt-2">
                        {master.experience_years > 0 && (
                          <span className="flex items-center gap-1">🛠 <span className="font-medium text-gray-700">{master.experience_years} р. досвіду</span></span>
                        )}
                        {master.rating > 0 && (
                          <span className="flex items-center gap-1">⭐ <span className="font-medium text-gray-700">{master.rating}</span></span>
                        )}
                        {master.reviews_count > 0 && (
                          <span className="text-gray-500">{master.reviews_count} відгуків</span>
                        )}
                      </div>
                      <Link
                        href={`/masters/${master.user_id}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-orange-500 hover:underline"
                      >
                        Відкрити повний профіль →
                      </Link>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    {onSelectMaster ? (
                      // CreateOrderPage: вибір майстра для форми
                      <button
                        onClick={() => onSelectMaster(isSelected ? null : master.user_id)}
                        className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                          isSelected
                            ? 'border border-orange-300 bg-orange-100 text-orange-700'
                            : 'bg-orange-500 text-white hover:bg-orange-600'
                        }`}
                      >
                        {isSelected ? '✓ Обрано' : 'Запропонувати'}
                      </button>
                    ) : proposableOrderId ? (
                      // MyOrdersPage з розгорнутим OPEN замовленням: пропонуємо його майстру
                      proposedMasterIds.has(master.user_id) ? (
                        <span className="flex-1 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-center text-xs font-semibold text-green-600">
                          ✓ Запропоновано
                        </span>
                      ) : (
                        <button
                          onClick={() => proposeMutation.mutate(master.user_id)}
                          disabled={proposeMutation.isPending}
                          className="flex-1 rounded-lg bg-orange-500 px-3 py-2 text-xs font-semibold text-white hover:bg-orange-600 transition-colors disabled:opacity-50"
                        >
                          Запропонувати
                        </button>
                      )
                    ) : (
                      // MyOrdersPage без розгорнутого замовлення: перейти до створення
                      <Link
                        href={`/orders/create?work_type_id=${workTypeId}&master_id=${master.user_id}`}
                        className="flex-1 rounded-lg bg-orange-500 px-3 py-2 text-center text-xs font-semibold text-white hover:bg-orange-600 transition-colors"
                      >
                        Запропонувати
                      </Link>
                    )}
                    <Link
                      href={`/messages/${master.user_id}`}
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-center text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      Повідомлення
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
