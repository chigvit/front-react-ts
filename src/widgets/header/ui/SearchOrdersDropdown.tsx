'use client'

import { useRef, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { apiClient } from '@/shared/api/client'

interface Props {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  isActive: boolean
}

export const SearchOrdersDropdown = ({ isOpen, onOpenChange, isActive }: Props) => {
  const wrapperRef = useRef<HTMLDivElement>(null)

  const { data: categoriesData } = useQuery({
    queryKey: ['categories-dropdown'],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/categories')
      return res.data.categories ?? []
    },
    staleTime: 5 * 60 * 1000,
  })

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        onOpenChange(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onOpenChange])

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        onClick={() => onOpenChange(!isOpen)}
        className={`flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
          isActive
            ? 'border-orange-500 bg-orange-50 text-orange-600'
            : 'border-transparent text-gray-600 hover:text-orange-500'
        }`}
      >
        Пошук замовлень
        <span className={`text-xs transition-transform ${isOpen ? 'rotate-180' : ''}`}>▾</span>
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-2 w-64 rounded-xl border border-gray-200 bg-white shadow-xl overflow-hidden">
          <div className="max-h-[28rem] overflow-y-auto py-2">
            <Link
              href="/orders/search"
              onClick={() => onOpenChange(false)}
              className="block px-4 py-2.5 text-left text-sm font-medium text-orange-600 hover:bg-orange-50 border-b border-gray-100"
            >
              🔍 Всі замовлення
            </Link>
            {categoriesData?.map((category: any) => (
              <Link
                key={category.id}
                href={`/orders/search?category_id=${category.id}`}
                onClick={() => onOpenChange(false)}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
              >
                <span>{category.icon ?? '🔨'}</span>
                <span>{category.name_en || category.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
