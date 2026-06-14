'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { apiClient } from '@/shared/api/client'
import { Spinner } from '@/shared/ui/Spinner'

const INITIAL_SHOW = 5

export const CategoriesPage = () => {
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
          return {
            ...cat,
            workTypes: wtRes.data.work_types ?? [],
          }
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

  const filtered = categoriesData?.filter((cat: any) =>
    cat.name_en?.toLowerCase().includes(search.toLowerCase()) ||
    cat.name?.toLowerCase().includes(search.toLowerCase()) ||
    cat.workTypes.some((wt: any) => wt.name.toLowerCase().includes(search.toLowerCase()))
  ) ?? []

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-4 text-3xl font-bold text-gray-800">Service Categories</h1>

        <div className="relative max-w-xl">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            type="text"
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
        </div>
      </div>

      {/* Categories grid */}
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
              {/* Category header */}
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

              {/* Work types list */}
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

              {/* Show more button */}
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

      {filtered.length === 0 && (
        <div className="py-16 text-center text-gray-500">
          No categories found for "{search}"
        </div>
      )}
    </div>
  )
}
