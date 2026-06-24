'use client'

import { useState, useRef, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { apiClient } from '@/shared/api/client'

export const CreateOrderDropdown = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [hoveredCategoryId, setHoveredCategoryId] = useState<number | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const { data: categoriesData } = useQuery({
    queryKey: ['categories-with-work-types-dropdown'],
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
    staleTime: 5 * 60 * 1000,
  })

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (isOpen && categoriesData && categoriesData.length > 0 && hoveredCategoryId === null) {
      setHoveredCategoryId(categoriesData[0].id)
    }
  }, [isOpen, categoriesData, hoveredCategoryId])

  const hoveredCategory = categoriesData?.find((c: any) => c.id === hoveredCategoryId)

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 rounded-lg border border-orange-500 px-4 py-2 text-sm font-medium text-orange-500 hover:bg-orange-50 transition-colors"
      >
        Create Order
        <span className={`text-xs transition-transform ${isOpen ? 'rotate-180' : ''}`}>▾</span>
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-2 flex rounded-xl border border-gray-200 bg-white shadow-xl overflow-hidden">
          {/* Ліва колонка — категорії */}
          <div className="w-64 max-h-[28rem] overflow-y-auto border-r border-gray-100 py-2">
            {categoriesData?.map((category: any) => (
              <button
                key={category.id}
                onMouseEnter={() => setHoveredCategoryId(category.id)}
                className={`flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left text-sm transition-colors ${
                  hoveredCategoryId === category.id
                    ? 'bg-orange-50 text-orange-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>{category.icon ?? '🔨'}</span>
                  <span>{category.name_en || category.name}</span>
                </span>
                <span className="text-gray-400">›</span>
              </button>
            ))}
          </div>

          {/* Права колонка — типи робіт */}
          <div className="w-72 max-h-[28rem] overflow-y-auto py-2">
            {hoveredCategory?.workTypes.map((wt: any) => (
              <Link
                key={wt.id}
                href={`/orders/create?work_type_id=${wt.id}&category_id=${hoveredCategory.id}`}
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500 transition-colors"
              >
                {wt.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
