'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useState } from 'react'
import { apiClient } from '@/shared/api/client'
import { Spinner } from '@/shared/ui/Spinner'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'

interface Props {
  masterId: string
  // Hide the "Hero" block (avatar/name/location/rating) — when the content
  // is inserted inline under a master's card that already shows this same data,
  // so as not to duplicate it.
  showHero?: boolean
}

function StarRating({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <svg
          key={i}
          className={`h-4 w-4 ${i < Math.round(value) ? 'text-yellow-400' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-gray-100 py-6 last:border-0 last:pb-0">
      <h2 className="mb-4 text-base font-bold text-gray-900">{title}</h2>
      {children}
    </div>
  )
}

// Full master profile content — without the page header (background/"Back"), so it
// can be inserted both as a standalone page (/masters/[id]) and inline (expanding
// a master's card in the list, without navigating to another page).
export const MasterProfileContent = ({ masterId, showHero = true }: Props) => {
  const [ordersOpen, setOrdersOpen] = useState(false)

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['master-profile', masterId],
    queryFn: async () => {
      const res = await apiClient.get(`/api/v1/users/${masterId}`)
      return res.data
    },
  })

  const { data: workTypesData } = useQuery({
    queryKey: ['master-work-types', masterId],
    queryFn: async () => {
      const [wtRes, catalogRes] = await Promise.all([
        apiClient.get(`/api/v1/users/${masterId}/work-types`),
        apiClient.get('/api/v1/work-types'),
      ])
      const items: any[] = wtRes.data.items ?? []
      const catalog: any[] = catalogRes.data.work_types ?? []
      const catalogMap: Record<number, string> = {}
      for (const wt of catalog) catalogMap[wt.id] = wt.name
      return items.map((item: any) => ({
        ...item,
        name: catalogMap[item.work_type_id] ?? `#${item.work_type_id}`,
      }))
    },
    staleTime: Infinity,
  })

  const { data: ratingsData } = useQuery({
    queryKey: ['master-ratings', masterId],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/ratings', { params: { rated_id: masterId } })
      return res.data
    },
  })

  const { data: completedOrdersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['master-completed-orders', masterId],
    queryFn: async () => {
      const res = await apiClient.get(`/api/v1/masters/${masterId}/orders`)
      return res.data
    },
    enabled: ordersOpen,
  })

  if (profileLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="py-8 text-center text-gray-500">
        Profile not found.
      </div>
    )
  }

  const mp = profile.master_profile
  const workTypes: any[] = workTypesData ?? []
  const ratings: any[] = ratingsData?.ratings ?? []
  const avgRating: number = ratingsData?.average_rating ?? mp?.rating ?? 0
  const completedOrders: any[] = completedOrdersData?.orders ?? []

  return (
    <>
      {/* ── Hero ── */}
      {showHero && (
        <div className="mb-4 rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex gap-5">
            {/* Avatar */}
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-orange-100 sm:h-24 sm:w-24">
              {profile.avatar_url ? (
                <img
                  src={`${API_URL}${profile.avatar_url}`}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-orange-500">
                  {profile.first_name?.[0]}{profile.last_name?.[0]}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900">
                  {profile.first_name} {profile.last_name?.[0]}.
                </h1>
                {mp?.is_verified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700 ring-1 ring-green-200">
                    ✓ Verified
                  </span>
                )}
              </div>

              {/* Location / experience */}
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
                {profile.postcode && <span>📍 {profile.postcode}</span>}
                {mp?.experience_years > 0 && (
                  <span>🛠 {mp.experience_years} yrs experience</span>
                )}
                {mp?.radius_miles > 0 && <span>🚗 up to {mp.radius_miles} miles</span>}
              </div>

              {/* Rating row */}
              {(avgRating > 0 || ratings.length > 0) && (
                <div className="mt-2 flex items-center gap-2">
                  <StarRating value={avgRating} />
                  <span className="text-sm font-bold text-gray-800">{avgRating > 0 ? avgRating.toFixed(1) : '—'}</span>
                  {ratings.length > 0 && (
                    <span className="text-sm text-gray-400">{ratings.length} reviews</span>
                  )}
                </div>
              )}

              {/* Languages */}
              {profile.languages?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {profile.languages.map((lang: string) => (
                    <span key={lang} className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs text-gray-500">
                      {lang}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Body: left content + right sidebar ── */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">

        {/* Left column */}
        <div className="flex-1 min-w-0 rounded-2xl bg-white px-6 shadow-sm">

          {/* About */}
          {(mp?.bio || mp?.services_description) && (
            <Section title="About the Master">
              {mp?.bio && <p className="text-sm leading-relaxed text-gray-600">{mp.bio}</p>}
              {mp?.bio && mp?.services_description && <div className="mt-3" />}
              {mp?.services_description && (
                <p className="text-sm leading-relaxed text-gray-600">{mp.services_description}</p>
              )}
            </Section>
          )}

          {/* Services */}
          {workTypes.length > 0 && (
            <Section title="Services & Prices">
              <div className="divide-y divide-gray-50">
                {workTypes.map((wt: any) => (
                  <div key={wt.work_type_id} className="flex items-center justify-between py-2.5 first:pt-0">
                    <span className="text-sm text-gray-700">{wt.name}</span>
                    <span className="ml-4 shrink-0 text-sm font-semibold text-gray-800">
                      {wt.price > 0
                        ? `£${wt.price} / ${wt.unit ?? 'hr'}`
                        : <span className="font-normal text-gray-400">negotiable</span>
                      }
                    </span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Reviews */}
          <Section title={`Reviews${ratings.length > 0 ? ` (${ratings.length})` : ''}`}>
            {avgRating > 0 && (
              <div className="mb-4 flex items-center gap-3">
                <span className="text-4xl font-bold text-gray-900">{avgRating.toFixed(1)}</span>
                <div>
                  <StarRating value={avgRating} />
                  <p className="mt-1 text-xs text-gray-400">average rating</p>
                </div>
              </div>
            )}
            {ratings.length === 0 ? (
              <p className="text-sm text-gray-400">No reviews yet.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {ratings.map((r: any, i: number) => (
                  <div key={i} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-gray-800">{r.rater_name || 'Customer'}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        <StarRating value={r.rating} />
                        {r.created_at && (
                          <span className="text-xs text-gray-400">
                            {new Date(r.created_at).toLocaleDateString('en-GB')}
                          </span>
                        )}
                      </div>
                    </div>
                    {r.comment && (
                      <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{r.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* Completed orders */}
          <Section title="">
            <button
              onClick={() => setOrdersOpen(p => !p)}
              className="flex w-full items-center justify-between text-base font-bold text-gray-900 hover:text-orange-500 transition-colors"
            >
              <span>
                Completed Orders
                {ordersOpen && completedOrders.length > 0 && (
                  <span className="ml-2 font-normal text-gray-400">({completedOrders.length})</span>
                )}
              </span>
              <svg
                className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${ordersOpen ? 'rotate-180' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {ordersOpen && (
              <div className="mt-4">
                {ordersLoading ? (
                  <div className="flex justify-center py-6"><Spinner size="sm" /></div>
                ) : completedOrders.length === 0 ? (
                  <p className="text-sm text-gray-400">No completed orders yet.</p>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {completedOrders.map((order: any) => (
                      <div key={order.id} className="py-3 first:pt-0 last:pb-0">
                        <div className="flex items-start justify-between gap-3">
                          <span className="text-sm font-medium text-gray-800">{order.title}</span>
                          {order.budget > 0 && (
                            <span className="shrink-0 text-sm font-semibold text-green-600">£{order.budget}</span>
                          )}
                        </div>
                        {order.description && (
                          <p className="mt-1 text-xs leading-relaxed text-gray-500 line-clamp-2">{order.description}</p>
                        )}
                        {(order.address || order.completed_at) && (
                          <div className="mt-1 flex flex-wrap gap-3 text-xs text-gray-400">
                            {order.address && <span>📍 {order.address}</span>}
                            {order.completed_at && (
                              <span>Completed: {new Date(order.completed_at).toLocaleDateString('en-GB')}</span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </Section>
        </div>

        {/* Right sidebar */}
        <div className="w-full lg:w-72 lg:shrink-0">
          <div className="lg:sticky lg:top-6 flex flex-col gap-4">

            {/* CTA */}
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <Link
                href={`/orders/create?work_type_id=${workTypes[0]?.work_type_id ?? 0}&master_id=${masterId}`}
                className="block w-full rounded-xl bg-orange-500 px-4 py-3 text-center text-sm font-bold text-white hover:bg-orange-600 transition-colors"
              >
                Propose a Job
              </Link>
              <Link
                href={`/messages/${masterId}`}
                className="mt-2 block w-full rounded-xl border border-gray-200 px-4 py-3 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Messages
              </Link>
            </div>

            {/* Stats */}
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4">
                {mp?.is_verified && (
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-50 text-green-600">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Status</p>
                      <p className="text-sm font-semibold text-gray-800">Verified</p>
                    </div>
                  </div>
                )}

                {avgRating > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-yellow-50 text-yellow-500">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Rating</p>
                      <p className="text-sm font-semibold text-gray-800">{avgRating.toFixed(1)} / 5.0</p>
                    </div>
                  </div>
                )}

                {ratings.length > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-500">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Reviews</p>
                      <p className="text-sm font-semibold text-gray-800">{ratings.length} reviews</p>
                    </div>
                  </div>
                )}

                {mp?.experience_years > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-50 text-orange-500">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Experience</p>
                      <p className="text-sm font-semibold text-gray-800">{mp.experience_years} years</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}
