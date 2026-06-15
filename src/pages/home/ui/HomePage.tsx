'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/shared/api/client'
import { Spinner } from '@/shared/ui/Spinner'
import { Button } from '@/shared/ui/Button'

const INITIAL_SHOW = 5

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
      <section className="bg-gradient-to-br from-orange-500 to-orange-600 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">
            Find a Master for Any Job
          </h1>
          <p className="mb-8 text-lg text-orange-100">
            Thousands of verified professionals ready to help you
          </p>
          <div className="mx-auto flex max-w-2xl gap-2">
            <input
              type="text"
              placeholder="What do you need done?"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 rounded-lg bg-white px-4 py-3 text-gray-800 focus:outline-none"
            />
            <Button size="lg" variant="secondary" onClick={handleSearch}>
              🔍 Search
            </Button>
          </div>
        </div>
      </section>

      {/* Категорії */}
      <section className="py-10 bg-white">
        <div className="mx-auto max-w-7xl px-4">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((category: any) => {
                const isExpanded = expandedCategories.includes(category.id)
                const visibleWorkTypes = isExpanded
                  ? category.workTypes
                  : category.workTypes.slice(0, INITIAL_SHOW)

                return (
                  <div
                    key={category.id}
                    className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <Link href={`/categories/${category.id}`}>
                      <div className="mb-3 flex items-center gap-3">
                        <span className="text-3xl">{category.icon ?? '🔨'}</span>
                        <div>
                          <h2 className="font-bold text-gray-800 hover:text-orange-500 transition-colors">
                            {category.name_en || category.name}
                          </h2>
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

      {/* Як це працює */}
      <section className="bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-4">
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
