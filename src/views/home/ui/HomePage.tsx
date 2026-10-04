'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/shared/api/client'
import { Spinner } from '@/shared/ui/Spinner'
import { Button } from '@/shared/ui/Button'

const INITIAL_SHOW = 3

const CATEGORY_COLORS = [
  { bg: 'bg-blue-100', text: 'text-blue-600' },
  { bg: 'bg-green-100', text: 'text-green-600' },
  { bg: 'bg-purple-100', text: 'text-purple-600' },
  { bg: 'bg-orange-100', text: 'text-orange-600' },
  { bg: 'bg-slate-100', text: 'text-slate-600' },
  { bg: 'bg-teal-100', text: 'text-teal-600' },
  { bg: 'bg-pink-100', text: 'text-pink-600' },
  { bg: 'bg-amber-100', text: 'text-amber-600' },
  { bg: 'bg-cyan-100', text: 'text-cyan-600' },
  { bg: 'bg-rose-100', text: 'text-rose-600' },
  { bg: 'bg-indigo-100', text: 'text-indigo-600' },
  { bg: 'bg-lime-100', text: 'text-lime-700' },
  { bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { bg: 'bg-sky-100', text: 'text-sky-600' },
  { bg: 'bg-violet-100', text: 'text-violet-600' },
  { bg: 'bg-fuchsia-100', text: 'text-fuchsia-600' },
  { bg: 'bg-red-100', text: 'text-red-600' },
  { bg: 'bg-yellow-100', text: 'text-yellow-700' },
]

export const HomePage = () => {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [expandedCategories, setExpandedCategories] = useState<number[]>([])

  const { data: categoriesData, isLoading } = useQuery({
    queryKey: ['categories-with-work-types'],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/categories')
      const categories = res.data.categories ?? []
      const withWorkTypes = await Promise.all(
        categories.map(async (cat: any) => {
          const wtRes = await apiClient.get(`/api/v1/categories/${cat.id}/work-types`)
          return { ...cat, workTypes: wtRes.data.work_types ?? [] }
        })
      )
      return withWorkTypes
    },
  })

  const toggleExpand = (id: number) => {
    setExpandedCategories(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const handleSearch = () => {
    if (search.trim()) {
      router.push(`/categories?search=${encodeURIComponent(search)}`)
    }
  }

  const filtered = categoriesData?.filter((cat: any) =>
    !search ||
    cat.name_en?.toLowerCase().includes(search.toLowerCase()) ||
    cat.name?.toLowerCase().includes(search.toLowerCase()) ||
    cat.workTypes.some((wt: any) => wt.name.toLowerCase().includes(search.toLowerCase()))
  ) ?? []

  return (
    <div>
      {/* Hero */}
      <section className="overflow-hidden bg-blue-50/60 py-14 sm:py-16">
        <div className="mx-auto grid max-w-5xl grid-cols-1 items-center gap-10 px-4 lg:grid-cols-2">
          <div>
            <h1 className="text-3xl font-bold leading-tight text-gray-900 sm:text-4xl">
              Every service you need<br />— in one place
            </h1>
            <p className="mt-4 max-w-xl text-lg text-gray-500">
              Home repair &bull; Cleaning &bull; Design &bull; Tutoring &bull; Moving
              and 20+ more categories for your home, business and everyday life.
            </p>

            <div className="mt-8 flex max-w-xl gap-2">
              <input
                type="text"
                placeholder="What do you need done?"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-3 text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              <Button size="lg" onClick={handleSearch}>
                🔍 Search
              </Button>
            </div>

            <div className="mt-4">
              <Link href="/orders/create">
                <Button size="lg" variant="outline">
                  Create Order →
                </Button>
              </Link>
            </div>
          </div>

          {/* Decorative illustration */}
          <div className="relative hidden h-64 overflow-hidden rounded-[2.5rem] lg:block">
            <svg viewBox="0 0 400 220" className="h-full w-full">
              <rect width="400" height="220" fill="#EEF2FF" />

              {/* soft background blobs */}
              <circle cx="310" cy="65" r="75" fill="#DBEAFE" opacity="0.7" />
              <circle cx="95" cy="155" r="65" fill="#E0E7FF" opacity="0.6" />

              {/* dot clusters */}
              {[0, 1, 2, 3].map(row => (
                [0, 1, 2, 3].map(col => (
                  <circle key={`d1-${row}-${col}`} cx={18 + col * 12} cy={18 + row * 12} r="2" fill="#C7D2FE" />
                ))
              ))}
              {[0, 1, 2, 3].map(row => (
                [0, 1, 2, 3].map(col => (
                  <circle key={`d2-${row}-${col}`} cx={352 + col * 12} cy={168 + row * 12} r="2" fill="#C7D2FE" />
                ))
              ))}

              {/* spray bottle */}
              <g transform="translate(40,30)">
                <rect x="10" y="38" width="30" height="48" rx="7" fill="#60A5FA" />
                <rect x="18" y="20" width="14" height="20" rx="3" fill="#60A5FA" />
                <path d="M30 18 L48 8 L52 16 L34 26 Z" fill="#818CF8" />
                <rect x="46" y="4" width="10" height="7" rx="2" fill="#818CF8" />
                <path d="M58 2 L66 -4" stroke="#A5B4FC" strokeWidth="3" strokeLinecap="round" />
                <path d="M60 10 L70 7" stroke="#A5B4FC" strokeWidth="3" strokeLinecap="round" />
                <circle cx="25" cy="58" r="6" fill="#BFDBFE" />
              </g>

              {/* truck */}
              <g transform="translate(225,35)">
                <path d="M-18 55 H-4" stroke="#A5B4FC" strokeWidth="3" strokeLinecap="round" />
                <path d="M-14 45 H-2" stroke="#A5B4FC" strokeWidth="3" strokeLinecap="round" />
                <rect x="2" y="90" width="150" height="6" rx="3" fill="#C7D2FE" />
                <rect x="6" y="18" width="95" height="65" rx="8" fill="#60A5FA" />
                <rect x="6" y="18" width="95" height="16" rx="8" fill="#93C5FD" />
                <path d="M101 40 H142 Q151 40 151 49 V83 H101 Z" fill="#1E293B" />
                <path d="M108 46 H134 Q139 46 139 51 V62 H108 Z" fill="#BAE6FD" />
                <rect x="100" y="81" width="54" height="7" rx="3" fill="#0F172A" />
                <circle cx="38" cy="90" r="12" fill="#1E293B" />
                <circle cx="38" cy="90" r="5" fill="#CBD5E1" />
                <circle cx="130" cy="90" r="12" fill="#1E293B" />
                <circle cx="130" cy="90" r="5" fill="#CBD5E1" />
              </g>

              {/* open book */}
              <g transform="translate(95,135)">
                <path d="M0 10 L48 0 V55 L0 62 Z" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
                <path d="M96 10 L48 0 V55 L96 62 Z" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
                <path d="M8 16 L40 9" stroke="#E2E8F0" strokeWidth="2" />
                <path d="M8 26 L40 19" stroke="#E2E8F0" strokeWidth="2" />
                <path d="M8 36 L40 29" stroke="#E2E8F0" strokeWidth="2" />
                <path d="M56 9 L88 16" stroke="#E2E8F0" strokeWidth="2" />
                <path d="M56 19 L88 26" stroke="#E2E8F0" strokeWidth="2" />
                <path d="M56 29 L88 36" stroke="#E2E8F0" strokeWidth="2" />
                <rect x="44" y="0" width="8" height="58" fill="#60A5FA" />
              </g>

              {/* wrench + gear */}
              <g transform="translate(255,120)">
                <g fill="#94A3B8">
                  <circle cx="45" cy="45" r="30" />
                  {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => (
                    <rect
                      key={angle}
                      x="41"
                      y="4"
                      width="8"
                      height="12"
                      rx="2"
                      transform={`rotate(${angle} 45 45)`}
                    />
                  ))}
                </g>
                <circle cx="45" cy="45" r="13" fill="#EEF2FF" />
                <path
                  d="M4 70 L34 40 A10 10 0 1 1 42 48 L12 78 A6 6 0 0 1 4 70 Z"
                  fill="#475569"
                />
                <circle cx="38" cy="44" r="4" fill="#EEF2FF" />
              </g>
            </svg>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-white py-14">
        <div className="mx-auto max-w-5xl px-4">
          <p className="text-center text-sm font-semibold uppercase tracking-wide text-orange-500">
            Services
          </p>
          <h2 className="mt-1 text-center text-3xl font-bold text-gray-900">
            Choose the service you need
          </h2>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : (
            <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((category: any, index: number) => {
                const name = category.name_en || category.name
                const color = CATEGORY_COLORS[index % CATEGORY_COLORS.length]
                const isExpanded = expandedCategories.includes(category.id)
                const visibleWorkTypes = isExpanded
                  ? category.workTypes
                  : category.workTypes.slice(0, INITIAL_SHOW)

                return (
                  <div
                    key={category.id}
                    className="rounded-xl border border-gray-100 p-5 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <Link href={`/categories/${category.id}`}>
                      <div className="mb-3 flex items-center gap-3">
                        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${color.bg} text-lg`}>
                          <span className={color.text}>{category.icon ?? '🔨'}</span>
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 hover:text-orange-500 transition-colors">
                            {name}
                          </h3>
                          <p className="text-xs text-gray-400">
                            {category.workTypes.length} service types
                          </p>
                        </div>
                      </div>
                    </Link>

                    <ul className="space-y-1">
                      {visibleWorkTypes.map((wt: any) => (
                        <li key={wt.id}>
                          <Link
                            href={`/categories/${category.id}?work_type=${wt.id}`}
                            className="flex items-center text-sm text-gray-600 hover:text-orange-500 transition-colors py-0.5"
                          >
                            <span className="mr-2 text-gray-300">—</span>
                            {wt.name}
                          </Link>
                        </li>
                      ))}
                    </ul>

                    {category.workTypes.length > INITIAL_SHOW && (
                      <button
                        onClick={() => toggleExpand(category.id)}
                        className="mt-3 flex items-center gap-1 text-sm text-orange-500 hover:text-orange-600 font-medium"
                      >
                        {isExpanded
                          ? 'Show less ▲'
                          : `Show more (${category.workTypes.length - INITIAL_SHOW}) ▼`
                        }
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
