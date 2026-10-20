'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/client'
import { Spinner } from '@/shared/ui/Spinner'
import { useGeolocation } from '@/shared/hooks/useGeolocation'
import { getAvatarUrl } from '@/shared/lib/avatarUrl'
import { cn } from '@/shared/lib/cn'

// Leeds city centre — used until the browser shares a location.
const DEFAULT_LAT = 53.8008
const DEFAULT_LNG = -1.5491
const RADIUS_OPTIONS = [5, 10, 20, 50, 100]

interface WorkTypePageProps {
  category: any
  workTypes: any[]
  workTypeId: number
}

// Landing page of a single work type inside a category:
// hero with CTAs, breadcrumbs, "how it works", specialists with reviews and
// a sidebar with the category's other work types.
export const WorkTypePage = ({ category, workTypes, workTypeId }: WorkTypePageProps) => {
  const { location } = useGeolocation()
  const [radius, setRadius] = useState(50)

  const workType = workTypes.find((wt) => wt.id === workTypeId)
  const categoryName = category?.name_en || category?.name || 'Services'
  const workTypeName = workType?.name ?? 'Service'
  const icon = category?.icon ?? '🔨'
  const orderHref = `/orders/create?work_type_id=${workTypeId}`

  const lat = location?.latitude ?? DEFAULT_LAT
  const lng = location?.longitude ?? DEFAULT_LNG

  const { data: masters, isLoading: loadingMasters } = useQuery({
    queryKey: ['masters', String(workTypeId), lat, lng, radius],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/location/masters', {
        params: { lat, lng, radius: radius * 1000, work_type_id: workTypeId },
      })
      return (res.data.masters ?? []) as any[]
    },
  })

  const categoryWorkTypeIds = workTypes.map((wt) => wt.id).join(',')
  const { data: categoryMastersCount } = useQuery({
    queryKey: ['masters-count', categoryWorkTypeIds, lat, lng, radius],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/location/masters', {
        params: { lat, lng, radius: radius * 1000, work_type_ids: categoryWorkTypeIds },
      })
      return (res.data.masters ?? []).length as number
    },
    enabled: categoryWorkTypeIds.length > 0,
  })

  // Sorted the way customers pick: rating first, then number of reviews.
  const sortedMasters = [...(masters ?? [])].sort(
    (a, b) => (b.rating ?? 0) - (a.rating ?? 0) || (b.reviews_count ?? 0) - (a.reviews_count ?? 0),
  )

  return (
    <div className="pb-12">
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 pt-4">
        <div className="relative overflow-hidden rounded-3xl bg-orange-500 px-6 py-10 text-center sm:py-12">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 grid select-none grid-cols-6 place-items-center gap-6 text-5xl opacity-10 sm:grid-cols-10"
          >
            {Array.from({ length: 30 }).map((_, i) => (
              <span key={i} className={i % 2 ? 'rotate-12' : '-rotate-12'}>
                {icon}
              </span>
            ))}
          </div>

          <div className="relative">
            <h1 className="text-2xl font-bold text-white sm:text-3xl">{workTypeName}</h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-orange-50 sm:text-base">
              Find a trusted {workTypeName.toLowerCase()} specialist near you. Post your job for free and
              compare offers from local pros.
            </p>
            <div className="mx-auto mt-6 flex max-w-sm flex-col gap-3">
              <Link
                href={orderHref}
                className="flex items-center justify-center gap-3 rounded-xl bg-white px-6 py-3.5 font-bold text-orange-600 shadow-md transition-colors hover:bg-orange-50"
              >
                <span className="text-xl leading-none">+</span>
                Order {workTypeName.toLowerCase()}
              </Link>
              <Link
                href="/register?role=master"
                className="rounded-xl border-2 border-white/80 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
              >
                Become a specialist
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto mt-6 grid max-w-7xl grid-cols-1 gap-6 px-4 lg:grid-cols-[1fr_340px]">
        {/* Main column */}
        <div className="flex min-w-0 flex-col gap-8">
          {/* Breadcrumbs */}
          <nav className="flex flex-wrap items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-4 text-sm">
            <Link href="/" aria-label="Home" className="text-orange-500 hover:text-orange-600">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" strokeLinejoin="round" />
              </svg>
            </Link>
            <span className="text-gray-300">›</span>
            <Link href={`/categories/${category?.id}`} className="text-orange-500 hover:underline">
              {categoryName}
            </Link>
            <span className="text-gray-300">›</span>
            <span className="text-gray-800">{workTypeName}</span>
          </nav>

          {/* How it works */}
          <section>
            <h2 className="mb-4 text-xl font-semibold text-gray-800 sm:text-2xl">
              How to order {workTypeName.toLowerCase()}
            </h2>
            <ol className="grid grid-cols-1 gap-4 rounded-xl border border-gray-200 bg-white p-5 sm:grid-cols-3">
              {[
                { emoji: '📝', text: 'Describe the job and post your order' },
                { emoji: '👷', text: 'Choose a specialist with the best offer' },
                { emoji: '⭐', text: 'Get the job done and leave a review' },
              ].map((step, i) => (
                <li key={step.text} className="flex items-center gap-3">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-50 text-2xl">
                    {step.emoji}
                  </span>
                  <span className="text-sm text-gray-600">
                    <span className="font-semibold text-orange-500">{i + 1}. </span>
                    {step.text}
                  </span>
                </li>
              ))}
            </ol>
          </section>

          {/* Specialists */}
          <section>
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <h2 className="text-xl font-semibold text-gray-800 sm:text-2xl">
                {workTypeName} specialists with reviews
              </h2>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-gray-500">Within:</span>
                {RADIUS_OPTIONS.map((r) => (
                  <button
                    key={r}
                    onClick={() => setRadius(r)}
                    className={cn(
                      'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                      radius === r ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-orange-100',
                    )}
                  >
                    {r} km
                  </button>
                ))}
              </div>
            </div>

            {loadingMasters ? (
              <div className="flex justify-center py-12">
                <Spinner size="lg" />
              </div>
            ) : sortedMasters.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center">
                <p className="text-gray-700">No {workTypeName.toLowerCase()} specialists within {radius} km yet.</p>
                <p className="mt-1 text-sm text-gray-500">
                  Post your order anyway — specialists from nearby will see it and send offers.
                </p>
                <Link
                  href={orderHref}
                  className="mt-4 inline-block rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-orange-600"
                >
                  Post an order
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {sortedMasters.map((master) => (
                  <MasterCard key={master.user_id} master={master} workTypeId={workTypeId} workTypeName={workTypeName} />
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <aside className="flex flex-col gap-4 lg:self-start">
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <Link
              href={orderHref}
              className="block rounded-lg bg-orange-500 px-4 py-3 text-center text-sm font-bold text-white transition-colors hover:bg-orange-600"
            >
              Post a job — it&apos;s free
            </Link>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-5">
              <span className="text-4xl font-bold text-orange-500">{categoryMastersCount ?? '—'}</span>
              <span className="text-sm leading-tight text-gray-600">
                specialists
                <br />
                in this category
              </span>
            </div>

            <h3 className="mb-3 mt-5 font-semibold text-gray-800">Categories</h3>
            <ul className="space-y-1 text-sm">
              <li>
                <Link href="/categories" className="flex items-center gap-1.5 py-1 text-orange-500 hover:underline">
                  <span>‹</span> All services
                </Link>
              </li>
              <li>
                <Link
                  href={`/categories/${category?.id}`}
                  className="flex items-center gap-1.5 py-1 text-orange-500 hover:underline"
                >
                  <span>‹</span> {categoryName}
                </Link>
              </li>
              {workTypes.map((wt) => (
                <li key={wt.id} className="pl-4">
                  {wt.id === workTypeId ? (
                    <span className="block py-1 font-medium text-gray-900">{wt.name}</span>
                  ) : (
                    <Link
                      href={`/categories/${category?.id}?work_type=${wt.id}`}
                      className="block py-1 text-orange-500 hover:underline"
                    >
                      {wt.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  )
}

const MasterCard = ({ master, workTypeId, workTypeName }: { master: any; workTypeId: number; workTypeName: string }) => {
  const [avatarFailed, setAvatarFailed] = useState(false)
  const avatar = avatarFailed ? null : getAvatarUrl(master.avatar_url)
  const name = `${master.first_name ?? ''} ${master.last_name?.[0] ? `${master.last_name[0]}.` : ''}`.trim()

  return (
    <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-4">
          <Link
            href={`/masters/${master.user_id}`}
            className="flex h-20 w-20 shrink-0 overflow-hidden rounded-full border border-gray-200 bg-orange-100"
          >
            {avatar ? (
              <img
                src={avatar}
                alt={name}
                onError={() => setAvatarFailed(true)}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-2xl font-bold text-orange-500">
                {master.first_name?.[0]}
                {master.last_name?.[0]}
              </span>
            )}
          </Link>
          <div className="min-w-0 space-y-1 text-sm">
            <Link href={`/masters/${master.user_id}`} className="block text-base font-semibold text-gray-900 hover:text-orange-500">
              {name}
            </Link>
            <p className="text-gray-500">🛠️ {workTypeName}</p>
            {master.postcode && (
              <p className="text-gray-500">
                📍 {master.postcode}
                {master.distance_meters > 0 && (
                  <span className="text-gray-400"> · {(master.distance_meters / 1000).toFixed(1)} km away</span>
                )}
              </p>
            )}
            {master.experience_years > 0 && (
              <p className="text-gray-500">🏅 {master.experience_years} years of experience</p>
            )}
          </div>
        </div>

        <div className="flex w-full flex-col gap-3 sm:w-64 sm:shrink-0">
          <div className="flex items-center justify-center gap-2 rounded-full bg-orange-50 px-4 py-2 text-sm">
            {master.reviews_count > 0 ? (
              <>
                <span className="text-yellow-500">★</span>
                <span className="font-semibold text-gray-900">{Number(master.rating).toFixed(1)}</span>
                <span className="text-orange-600">
                  {master.reviews_count} {master.reviews_count === 1 ? 'review' : 'reviews'}
                </span>
              </>
            ) : (
              <span className="text-gray-500">No reviews yet</span>
            )}
          </div>
          <Link
            href={`/orders/create?work_type_id=${workTypeId}&master_id=${master.user_id}`}
            className="rounded-lg bg-orange-500 px-4 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-orange-600"
          >
            Offer a job
          </Link>
        </div>
      </div>

      {(master.bio || master.services_description) && (
        <p className="mt-4 line-clamp-3 whitespace-pre-line text-sm text-gray-700">
          {master.bio || master.services_description}
        </p>
      )}
    </article>
  )
}
