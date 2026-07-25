'use client'

import { Suspense, use } from 'react'
import { CategoryPage } from '@/views/categories/ui/CategoryPage'

export default function Category({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return (
    <Suspense fallback={null}>
      <CategoryPage id={parseInt(id)} />
    </Suspense>
  )
}
