'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { apiClient } from '@/shared/api/client'
import { Spinner } from '@/shared/ui/Spinner'

interface CategoryPageProps {
  id: number
}

export const CategoryPage = ({ id }: CategoryPageProps) => {
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
      </div>

      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <span className="text-5xl">{categoryData?.icon ?? '🔨'}</span>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            {categoryData?.name_en || categoryData?.name}
          </h1>
          <p className="text-gray-500">{workTypesData?.length} service types</p>
        </div>
      </div>

      {/* Work types grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {workTypesData?.map((wt: any) => (
          <Link
            key={wt.id}
            href={`/masters?work_type=${wt.id}`}
            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:border-orange-300 hover:shadow-md transition-all"
          >
            <h3 className="font-medium text-gray-800 hover:text-orange-500">{wt.name}</h3>
            <p className="mt-1 text-sm text-gray-400">Find masters →</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
