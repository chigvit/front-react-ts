'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { apiClient } from '@/shared/api/client'
import { Spinner } from '@/shared/ui/Spinner'
import { useGeolocation } from '@/shared/hooks/useGeolocation'

const MastersMap = dynamic(
  () => import('./MastersMap').then(mod => mod.MastersMap),
  { ssr: false, loading: () => <div className="flex h-full items-center justify-center"><Spinner /></div> }
)

const RADIUS_OPTIONS = [1, 2, 5, 10, 20, 50]

export const MastersPage = () => {
  const { location } = useGeolocation()
  const [radius, setRadius] = useState(10)
  const [view, setView] = useState<'map' | 'list'>('map')

  const { data: mastersData, isLoading } = useQuery({
    queryKey: ['masters-nearby', location?.latitude, location?.longitude, radius],
    queryFn: async () => {
      const lat = location?.latitude ?? 53.8008
      const lng = location?.longitude ?? -1.5491
      const res = await apiClient.get('/api/v1/location/masters', {
        params: {
          lat,
          lng,
          radius: radius * 1000,
        },
      })
      return res.data.masters ?? []
    },
  })

  const masters = mastersData ?? []

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold text-gray-800">Find Masters</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Radius:</span>
            <div className="flex gap-1">
              {RADIUS_OPTIONS.map(r => (
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
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">
            {isLoading ? 'Searching...' : `${masters.length} masters found`}
          </span>
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            <button
              onClick={() => setView('map')}
              className={`px-3 py-1.5 text-sm transition-colors ${
                view === 'map' ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              🗺️ Map
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-3 py-1.5 text-sm transition-colors ${
                view === 'list' ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              📋 List
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {view === 'map' ? (
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1">
            <MastersMap
              masters={masters}
              userLocation={location}
              radius={radius}
            />
          </div>

          {masters.length > 0 && (
            <div className="w-80 overflow-y-auto border-l border-gray-200 bg-white">
              {masters.map((master: any) => (
                <Link
                  key={master.user_id}
                  href={`/masters/${master.user_id}`}
                  className="flex items-center gap-3 border-b border-gray-100 p-4 hover:bg-orange-50 transition-colors"
                >
                  <div className="flex h-12 w-12 overflow-hidden rounded-full border border-gray-200 bg-orange-100">
                    {master.avatar_url ? (
                      <img
                        src={`http://localhost:8080${master.avatar_url}`}
                        alt="Avatar"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-lg font-bold text-orange-500">
                        {master.first_name?.[0]}{master.last_name?.[0]}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">
                      {master.first_name} {master.last_name}
                    </p>
                    {master.rating > 0 && (
                      <p className="text-sm text-yellow-500">
                        ⭐ {master.rating} ({master.reviews_count})
                      </p>
                    )}
                    {master.distance_meters > 0 && (
                      <p className="text-xs text-gray-400">
                        {(master.distance_meters / 1000).toFixed(1)} km away
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {masters.map((master: any) => (
              <Link
                key={master.user_id}
                href={`/masters/${master.user_id}`}
                className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-12 w-12 overflow-hidden rounded-full border border-gray-200 bg-orange-100">
                    {master.avatar_url ? (
                      <img
                        src={`http://localhost:8080${master.avatar_url}`}
                        alt="Avatar"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-lg font-bold text-orange-500">
                        {master.first_name?.[0]}{master.last_name?.[0]}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">
                      {master.first_name} {master.last_name}
                    </p>
                    {master.rating > 0 && (
                      <p className="text-sm text-yellow-500">⭐ {master.rating}</p>
                    )}
                  </div>
                </div>
                {master.distance_meters > 0 && (
                  <p className="text-sm text-gray-400">
                    📍 {(master.distance_meters / 1000).toFixed(1)} km away
                  </p>
                )}
              </Link>
            ))}
          </div>

          {masters.length === 0 && !isLoading && (
            <div className="py-16 text-center text-gray-500">
              No masters found within {radius}km
            </div>
          )}
        </div>
      )}
    </div>
  )
}
