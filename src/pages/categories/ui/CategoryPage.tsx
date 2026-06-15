'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { apiClient } from '@/shared/api/client'
import { Spinner } from '@/shared/ui/Spinner'
import { useGeolocation } from '@/shared/hooks/useGeolocation'

interface CategoryPageProps {
  id: number
}

export const CategoryPage = ({ id }: CategoryPageProps) => {
  const searchParams = useSearchParams()
  const selectedWorkTypeId = searchParams.get('work_type')
  const { location } = useGeolocation()
  const [radius, setRadius] = useState(50)

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

  const { data: mastersData, isLoading: loadingMasters } = useQuery({
    queryKey: ['masters', selectedWorkTypeId, location?.latitude, location?.longitude, radius],
    queryFn: async () => {
      if (!selectedWorkTypeId) return []
      const lat = location?.latitude ?? 53.8008
      const lng = location?.longitude ?? -1.5491
      const res = await apiClient.get('/api/v1/location/masters', {
        params: {
          lat,
          lng,
          radius: radius * 1000,
          work_type_id: selectedWorkTypeId,
        },
      })
      return res.data.masters ?? []
    },
    enabled: !!selectedWorkTypeId,
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
        <span className="text-gray-800">{categoryData?.name_en || categoryData?.name}</span>
        {selectedWorkType && (
          <>
            <span>→</span>
            <span className="text-gray-800">{selectedWorkType.name}</span>
          </>
        )}
      </div>

      <div className="flex gap-8">
        {/* Sidebar — типи робіт */}
        <div className="w-64 shrink-0">
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="mb-4 flex items-center gap-2">
              <span className="text-2xl">{categoryData?.icon ?? '🔨'}</span>
              <h2 className="font-bold text-gray-800">
                {categoryData?.name_en || categoryData?.name}
              </h2>
            </div>
            <ul className="space-y-1">
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

        {/* Main content */}
        <div className="flex-1">
          {!selectedWorkTypeId ? (
            <div className="py-16 text-center text-gray-500">
              <p className="text-lg">Select a service type to see available masters</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">
                  {selectedWorkType?.name}
                </h1>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Radius:</span>
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
              </div>

              {loadingMasters ? (
                <div className="flex justify-center py-12">
                  <Spinner size="lg" />
                </div>
              ) : mastersData?.length === 0 ? (
                <div className="py-16 text-center text-gray-500">
                  <p className="text-lg">No masters found within {radius}km</p>
                  <p className="text-sm mt-2">Try increasing the radius</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {mastersData?.map((master: any) => (
                    <div
                      key={master.user_id}
                      className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex gap-4">
                        {/* Аватар */}
                        <div className="flex h-16 w-16 shrink-0 overflow-hidden rounded-full border border-gray-200 bg-orange-100">
                          {master.avatar_url ? (
                            <img
                              src={`http://localhost:8080${master.avatar_url}`}
                              alt="Avatar"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xl font-bold text-orange-500">
                              {master.first_name?.[0]}{master.last_name?.[0]}
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-800">
                                {master.first_name} {master.last_name}
                              </h3>
                              {master.postcode && (
                                <p className="text-sm text-gray-500">
                                  📍 {master.postcode}
                                  {master.distance_meters > 0 && (
                                    <span className="ml-2 text-gray-400">
                                      ({(master.distance_meters / 1000).toFixed(1)} km away)
                                    </span>
                                  )}
                                </p>
                              )}
                            </div>

                            <div className="text-right">
                              {master.rating > 0 && (
                                <div className="flex items-center gap-1">
                                  <span className="text-yellow-500">⭐</span>
                                  <span className="font-semibold">{master.rating}</span>
                                  <span className="text-sm text-gray-400">({master.reviews_count})</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {master.bio && (
                            <p className="mt-2 text-sm text-gray-600 line-clamp-2">{master.bio}</p>
                          )}

                          <div className="mt-3 flex gap-2">
                            <Link
                              href={`/masters/${master.user_id}`}
                              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              View Profile
                            </Link>
                            <Link
                              href={`/orders/create?master_id=${master.user_id}&work_type_id=${selectedWorkTypeId}`}
                              className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 transition-colors"
                            >
                              Create Order
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
