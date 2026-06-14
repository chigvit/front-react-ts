'use client'

import { use } from 'react'
import { CategoryPage } from '@/pages/categories/ui/CategoryPage'

export default function Category({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return <CategoryPage id={parseInt(id)} />
}
