'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { apiClient } from '@/shared/api/client'
import { Spinner } from '@/shared/ui/Spinner'
import { useGeolocation } from '@/shared/hooks/useGeolocation'
import { MasterProfileContent } from '@/views/masters/ui/MasterProfileContent'

interface CategoryPageProps {
  id: number
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'

export const CategoryPage = ({ id }: CategoryPageProps) => {
  const searchParams = useSearchParams()
  const selectedWorkTypeId = searchParams.get('work_type')
  const { location } = useGeolocation()
  const [radius, setRadius] = useState(50)
  const [expandedMasterId, setExpandedMasterId] = useState<string | null>(null)

  const { data: categoryData, isLoading: loadingCategory } = useQuery({
    queryKey: ['category', id],
    queryFn: async () => {
      const res = await apiClient.get(`/api/v1/categories/${id}`)
      return res.data.category
    },
  })

  const { data: workTypesData, isLoading: loadingWorkTypes } = useQuery({
    queryKey: ['work-types', id],
    queryFn: async () => {
      const res = await apiClient.get(`/api/v1/categories/${id}/work-types`)
      return res.data.work_types ?? []
    },
  })

  const categoryWorkTypeIds: number[] = workTypesData?.map((wt: any) => wt.id) ?? []

  const { data: mastersData, isLoading: loadingMasters } = useQuery({
    queryKey: [
      'masters',
      selectedWorkTypeId ?? categoryWorkTypeIds.join(','),
      location?.latitude,
      location?.longitude,
      radius,
    ],
    queryFn: async () => {
      const lat = location?.latitude ?? 53.8008
      const lng = location?.longitude ?? -1.5491
      const res = await apiClient.get('/api/v1/location/masters', {
        params: selectedWorkTypeId
          ? {
              lat,
              lng,
              radius: radius * 1000,
              work_type_id: selectedWorkTypeId,
            }
          : {
              lat,
              lng,
              radius: radius * 1000,
              work_type_ids: categoryWorkTypeIds.join(','),
            },
      })
      return res.data.masters ?? []
    },
    enabled: selectedWorkTypeId ? true : categoryWorkTypeIds.length > 0,
  })

  const selectedWorkType = workTypesData?.find((wt: any) => wt.id === parseInt(selectedWorkTypeId ?? '0'))

  if (loadingCategory || loadingWorkTypes) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm text-gray-500">
        <Link href="/" className="hover:text-orange-500">Home</Link>
        <span>→</span>
        <Link href="/categories" className="hover:text-orange-500">Categories</Link>
        <span>→</span>
        {selectedWorkType ? (
          <Link href={`/categories/${id}`} className="hover:text-orange-500">
            {categoryData?.name_en || categoryData?.name}
          </Link>
        ) : (
          <span className="text-gray-800">{categoryData?.name_en || categoryData?.name}</span>
        )}
        {selectedWorkType && (
          <>
            <span>→</span>
            <span className="text-gray-800">{selectedWorkType.name}</span>
          </>
        )}
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
        {/* Masters (executors) — left */}
        <div className="w-full lg:w-80 lg:shrink-0 lg:order-1">
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
              <h2 className="font-bold text-gray-800">
                Masters{selectedWorkType ? ` — ${selectedWorkType.name}` : ''}
              </h2>
            </div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="text-xs text-gray-500">Radius:</span>
              {[5, 10, 20, 50, 100].map(r => (
                <button
                  key={r}
                  onClick={() => setRadius(r)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    radius === r
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-orange-100'
                  }`}
                >
                  {r}km
                </button>
              ))}
            </div>

            {loadingMasters ? (
              <div className="flex justify-center py-12">
                <Spinner size="lg" />
              </div>
            ) : mastersData?.length === 0 ? (
              <div className="py-10 text-center text-gray-500">
                <p className="text-sm">No masters found within {radius}km</p>
                <p className="text-xs mt-1">Try increasing the radius</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {mastersData?.map((master: any) => {
                  const isExpanded = expandedMasterId === master.user_id
                  return (
                  <div
                    key={master.user_id}
                    className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex gap-3">
                      {/* Avatar */}
                      <div className="flex h-12 w-12 shrink-0 overflow-hidden rounded-full border border-gray-200 bg-orange-100">
                        {master.avatar_url ? (
                          <img
                            src={`${API_URL}${master.avatar_url}`}
                            alt="Avatar"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-lg font-bold text-orange-500">
                            {master.first_name?.[0]}{master.last_name?.[0]}
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-semibold text-gray-800">
                              {master.first_name} {master.last_name?.[0]}.
                            </h3>
                            {master.postcode && (
                              <p className="truncate text-xs text-gray-500">
                                📍 {master.postcode}
                                {master.distance_meters > 0 && (
                                  <span className="ml-1 text-gray-400">
                                    ({(master.distance_meters / 1000).toFixed(1)} km)
                                  </span>
                                )}
                              </p>
                            )}
                          </div>

                          {master.rating > 0 && (
                            <div className="flex shrink-0 items-center gap-1">
                              <span className="text-yellow-500">⭐</span>
                              <span className="text-sm font-semibold">{master.rating}</span>
                            </div>
                          )}
                        </div>

                        {master.bio && !isExpanded && (
                          <p className="mt-1.5 text-xs text-gray-600 line-clamp-2">{master.bio}</p>
                        )}

                        <div className="mt-2.5 flex flex-wrap gap-2">
                          <button
                            onClick={() => setExpandedMasterId(isExpanded ? null : master.user_id)}
                            className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            {isExpanded ? 'Hide Profile' : 'View Profile'}
                          </button>
                          <Link
                            href={`/orders/create?master_id=${master.user_id}${selectedWorkTypeId ? `&work_type_id=${selectedWorkTypeId}` : ''}`}
                            className="rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-orange-600 transition-colors"
                          >
                            Create Order
                          </Link>
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-4 border-t border-gray-100 pt-4">
                        <MasterProfileContent masterId={master.user_id} showHero={false} />
                      </div>
                    )}
                  </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Services — center */}
        <div className="flex-1 lg:order-2">
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="mb-4 flex items-center gap-2">
              <span className="text-2xl">{categoryData?.icon ?? '🔨'}</span>
              <h2 className="font-bold text-gray-800">
                {categoryData?.name_en || categoryData?.name}
              </h2>
            </div>
            <ul className="space-y-1">
              <li>
                <Link
                  href={`/categories/${id}`}
                  className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                    !selectedWorkTypeId
                      ? 'bg-orange-50 font-medium text-orange-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-orange-500'
                  }`}
                >
                  All services
                </Link>
              </li>
              {workTypesData?.map((wt: any) => (
                <li key={wt.id}>
                  <Link
                    href={`/categories/${id}?work_type=${wt.id}`}
                    className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                      selectedWorkTypeId === String(wt.id)
                        ? 'bg-orange-50 font-medium text-orange-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-orange-500'
                    }`}
                  >
                    {wt.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
