'use client'

import Link from 'next/link'
import { MasterProfileContent } from './MasterProfileContent'

interface Props {
  masterId: string
}

export const MasterProfilePage = ({ masterId }: Props) => {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="mx-auto max-w-5xl px-4 py-6">
        <Link
          href="/masters"
          className="mb-4 inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          ← Назад до майстрів
        </Link>

        <MasterProfileContent masterId={masterId} />
      </div>
    </div>
  )
}
