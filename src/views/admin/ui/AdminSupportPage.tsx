'use client'

import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/client'
import { Spinner } from '@/shared/ui/Spinner'
import { Button } from '@/shared/ui/Button'

interface SupportMessage {
  id: number
  user_id: string
  name: string
  email: string
  subject: string
  message: string
  created_at: string
}

const STORAGE_KEY = 'admin_key'

export const AdminSupportPage = () => {
  const [adminKey, setAdminKey] = useState<string | null>(null)
  const [keyInput, setKeyInput] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) setAdminKey(saved)
  }, [])

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-support-messages', adminKey],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/admin/support-messages', {
        headers: { 'X-Admin-Key': adminKey },
      })
      return res.data.messages as SupportMessage[]
    },
    enabled: !!adminKey,
    retry: false,
  })

  const handleUnlock = () => {
    localStorage.setItem(STORAGE_KEY, keyInput)
    setAdminKey(keyInput)
  }

  const handleLock = () => {
    localStorage.removeItem(STORAGE_KEY)
    setAdminKey(null)
    setKeyInput('')
  }

  if (!adminKey) {
    return (
      <div className="mx-auto max-w-sm px-4 py-16">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h1 className="mb-4 text-lg font-semibold text-gray-800">Admin Access</h1>
          <input
            type="password"
            placeholder="Admin key"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
            className="mb-3 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
          />
          <Button onClick={handleUnlock} disabled={!keyInput} className="w-full">
            Unlock
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Support Messages</h1>
        <button onClick={handleLock} className="text-sm text-gray-400 hover:text-gray-600">
          Lock
        </button>
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      )}

      {isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          Wrong admin key, or nothing is there.{' '}
          <button onClick={handleLock} className="underline">Try again</button>
        </div>
      )}

      {data && data.length === 0 && (
        <p className="text-center text-gray-400">No messages yet.</p>
      )}

      {data && data.length > 0 && (
        <div className="flex flex-col gap-3">
          {data.map((m) => (
            <div key={m.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <span className="font-semibold text-gray-800">{m.name}</span>{' '}
                  <a href={`mailto:${m.email}`} className="text-sm text-orange-500 hover:underline">
                    {m.email}
                  </a>
                </div>
                <span className="text-xs text-gray-400">{m.created_at}</span>
              </div>
              {m.subject && (
                <p className="mb-1 text-sm font-medium text-gray-700">{m.subject}</p>
              )}
              <p className="whitespace-pre-wrap text-sm text-gray-600">{m.message}</p>
              {m.user_id && (
                <p className="mt-2 text-xs text-gray-400">Registered user: {m.user_id}</p>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 text-center">
        <button onClick={() => refetch()} className="text-sm text-gray-400 hover:text-gray-600">
          Refresh
        </button>
      </div>
    </div>
  )
}
