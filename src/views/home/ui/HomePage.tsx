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
          <div className="relative hidden h-60 lg:block">
            <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-orange-100 via-blue-100 to-purple-100" />
            <span className="absolute left-5 top-5 text-5xl drop-shadow-sm">🔧</span>
            <svg viewBox="0 0 200 120" className="absolute right-4 top-6 w-40 drop-shadow-sm">
              <rect x="5" y="90" width="175" height="6" rx="3" fill="#E2E8F0" />
              <rect x="10" y="20" width="110" height="70" rx="8" fill="#F97316" />
              <rect x="10" y="20" width="110" height="18" rx="8" fill="#FDBA74" />
              <path d="M120 45 H165 Q175 45 175 55 V90 H120 Z" fill="#1E293B" />
              <path d="M128 52 H158 Q164 52 164 58 V70 H128 Z" fill="#BAE6FD" />
              <rect x="118" y="88" width="62" height="8" rx="4" fill="#0F172A" />
              <circle cx="45" cy="98" r="14" fill="#1E293B" />
              <circle cx="45" cy="98" r="6" fill="#CBD5E1" />
              <circle cx="150" cy="98" r="14" fill="#1E293B" />
              <circle cx="150" cy="98" r="6" fill="#CBD5E1" />
            </svg>
            <span className="absolute bottom-8 left-12 text-6xl drop-shadow-sm">🧹</span>
            <span className="absolute bottom-5 right-5 text-5xl drop-shadow-sm">🎨</span>
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-7xl drop-shadow-sm">📚</span>
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

      {/* How it works */}
      <section className="bg-gray-50 py-12">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="mb-8 text-center text-2xl font-bold text-gray-800">
            How it works
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              { icon: '📝', title: 'Create an order', desc: 'Describe what needs to be done and set your budget' },
              { icon: '👷', title: 'Get responses', desc: 'Masters will respond and offer their price' },
              { icon: '✅', title: 'Choose a master', desc: 'Select the best one and get the result' },
            ].map((step, i) => (
              <div key={i} className="text-center">
                <div className="mb-4 text-5xl">{step.icon}</div>
                <h3 className="mb-2 text-lg font-semibold text-gray-800">{step.title}</h3>
                <p className="text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/orders/create">
              <Button size="lg">Create Order</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
