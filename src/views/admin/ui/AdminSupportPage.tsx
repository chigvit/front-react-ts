'use client'

import { useEffect, useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/client'
import { Spinner } from '@/shared/ui/Spinner'
import { Button } from '@/shared/ui/Button'

interface Thread {
  id: string
  user_id: string
  name: string
  email: string
  subject: string
  status: string
  created_at: string
  updated_at: string
}

interface ThreadMessage {
  id: number
  sender: 'user' | 'admin'
  message: string
  created_at: string
}

const STORAGE_KEY = 'admin_key'

export const AdminSupportPage = () => {
  const [adminKey, setAdminKey] = useState<string | null>(null)
  const [keyInput, setKeyInput] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) setAdminKey(saved)
  }, [])

  const handleUnlock = () => {
    localStorage.setItem(STORAGE_KEY, keyInput)
    setAdminKey(keyInput)
  }

  const handleLock = () => {
    localStorage.removeItem(STORAGE_KEY)
    setAdminKey(null)
    setKeyInput('')
  }

  const { data: threads, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-support-threads', adminKey],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/admin/support/threads', {
        headers: { 'X-Admin-Key': adminKey },
      })
      return (res.data.threads ?? []) as Thread[]
    },
    enabled: !!adminKey,
    retry: false,
    refetchInterval: 20_000,
  })

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

  const selected = threads?.find((t) => t.id === selectedId) ?? null

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Support Threads</h1>
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

      {threads && threads.length === 0 && (
        <p className="text-center text-gray-400">No conversations yet.</p>
      )}

      {threads && threads.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[280px_1fr]">
          {/* List — hidden on mobile once a thread is selected */}
          <div className={`flex flex-col gap-2 ${selected ? 'hidden sm:flex' : ''}`}>
            {threads.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedId(t.id)}
                className={`rounded-xl border p-3 text-left transition-colors ${
                  t.id === selectedId
                    ? 'border-orange-400 bg-orange-50'
                    : 'border-gray-200 bg-white hover:border-orange-200'
                }`}
              >
                <p className="truncate text-sm font-semibold text-gray-800">{t.name}</p>
                <p className="truncate text-xs text-gray-500">{t.subject || t.email}</p>
                <p className="mt-1 text-[11px] text-gray-400">{t.updated_at}</p>
              </button>
            ))}
          </div>

          {/* Detail */}
          <div className={selected ? '' : 'hidden sm:block'}>
            {selected ? (
              <ThreadDetail thread={selected} adminKey={adminKey} onBack={() => setSelectedId(null)} onSent={refetch} />
            ) : (
              <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-gray-200 text-sm text-gray-400">
                Select a conversation
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function ThreadDetail({
  thread,
  adminKey,
  onBack,
  onSent,
}: {
  thread: Thread
  adminKey: string
  onBack: () => void
  onSent: () => void
}) {
  const queryClient = useQueryClient()
  const [reply, setReply] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  const { data } = useQuery({
    queryKey: ['admin-support-thread', thread.id, adminKey],
    queryFn: async () => {
      const res = await apiClient.get(`/api/v1/admin/support/threads/${thread.id}`, {
        headers: { 'X-Admin-Key': adminKey },
      })
      return res.data.messages as ThreadMessage[]
    },
    refetchInterval: 15_000,
  })

  const messages = data ?? []

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const replyMutation = useMutation({
    mutationFn: (text: string) =>
      apiClient.post(
        `/api/v1/admin/support/threads/${thread.id}/messages`,
        { message: text },
        { headers: { 'X-Admin-Key': adminKey } }
      ),
    onSuccess: () => {
      setReply('')
      queryClient.invalidateQueries({ queryKey: ['admin-support-thread', thread.id, adminKey] })
      onSent()
    },
  })

  const handleSend = () => {
    if (!reply.trim()) return
    replyMutation.mutate(reply.trim())
  }

  return (
    <div className="flex h-[32rem] flex-col overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3">
        <button onClick={onBack} className="text-gray-400 hover:text-gray-600 sm:hidden">
          ← Back
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-gray-800">
            {thread.name}{' '}
            <a href={`mailto:${thread.email}`} className="font-normal text-orange-500 hover:underline">
              {thread.email}
            </a>
          </p>
          {thread.subject && <p className="truncate text-xs text-gray-500">{thread.subject}</p>}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 overflow-y-auto bg-gray-50 p-3">
        {messages.length === 0 ? (
          <p className="text-center text-xs text-gray-400">No messages yet</p>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={`flex flex-col gap-0.5 ${m.sender === 'admin' ? 'items-end' : 'items-start'}`}>
              <div
                className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                  m.sender === 'admin'
                    ? 'bg-orange-500 text-white'
                    : 'border border-gray-200 bg-white text-gray-800'
                }`}
              >
                {m.message}
              </div>
              <span className="text-xs text-gray-400">
                {m.sender === 'admin' ? 'You' : thread.name} ·{' '}
                {new Date(m.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2 border-t border-gray-100 p-3">
        <input
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder="Reply..."
          className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
        />
        <button
          onClick={handleSend}
          disabled={!reply.trim() || replyMutation.isPending}
          className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600 disabled:opacity-40"
        >
          →
        </button>
      </div>
    </div>
  )
}
