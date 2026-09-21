'use client'

import { useEffect, useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/client'
import { useAuthStore } from '@/entities/user/model/userStore'
import { Spinner } from '@/shared/ui/Spinner'

interface ThreadMessage {
  id: number
  sender: 'user' | 'admin'
  message: string
  created_at: string
}

interface Thread {
  id: string
  user_id: string
  guest_token: string
  name: string
  email: string
  subject: string
  status: string
}

const THREAD_ID_KEY = 'support_thread_id'
const GUEST_TOKEN_KEY = 'support_guest_token'
const lastSeenKey = (threadId: string) => `support_last_seen_${threadId}`

export const SupportChatWidget = () => {
  const { user, isAuthenticated, _hasHydrated } = useAuthStore()
  const queryClient = useQueryClient()

  const [isOpen, setIsOpen] = useState(false)
  const [threadId, setThreadId] = useState<string | null>(null)
  const [guestToken, setGuestToken] = useState<string | null>(null)
  const [resolvedInitial, setResolvedInitial] = useState(false)
  const [text, setText] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  // Form fields for starting a new conversation
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')

  // Resolve which thread (if any) this browser/user already has — checked
  // once _hasHydrated so we know whether the user is logged in yet.
  useEffect(() => {
    if (!_hasHydrated) return

    const params = new URLSearchParams(window.location.search)
    const linkThreadId = params.get('support_thread')
    const linkToken = params.get('token')
    if (linkThreadId) {
      setThreadId(linkThreadId)
      if (linkToken) {
        setGuestToken(linkToken)
        localStorage.setItem(GUEST_TOKEN_KEY, linkToken)
      }
      localStorage.setItem(THREAD_ID_KEY, linkThreadId)
      setIsOpen(true)
      setResolvedInitial(true)
      return
    }

    if (isAuthenticated()) {
      apiClient.get('/api/v1/support/threads/me').then((res) => {
        if (res.data.found) setThreadId(res.data.thread.id)
        setResolvedInitial(true)
      }).catch(() => setResolvedInitial(true))
      return
    }

    const savedId = localStorage.getItem(THREAD_ID_KEY)
    const savedToken = localStorage.getItem(GUEST_TOKEN_KEY)
    if (savedId) {
      setThreadId(savedId)
      setGuestToken(savedToken)
    }
    setResolvedInitial(true)
  }, [_hasHydrated])

  useEffect(() => {
    if (user) {
      setName(`${user.firstName} ${user.lastName}`.trim())
      setEmail(user.email)
    }
  }, [user])

  const { data } = useQuery({
    queryKey: ['support-thread', threadId, guestToken],
    queryFn: async () => {
      const res = await apiClient.get(`/api/v1/support/threads/${threadId}`, {
        params: guestToken ? { token: guestToken } : undefined,
      })
      return res.data as { thread: Thread; messages: ThreadMessage[] }
    },
    enabled: !!threadId,
    refetchInterval: 20_000,
  })

  const messages = data?.messages ?? []
  const hasUnread = (() => {
    if (isOpen || messages.length === 0 || !threadId) return false
    const last = messages[messages.length - 1]
    if (last.sender !== 'admin') return false
    const lastSeen = parseInt(localStorage.getItem(lastSeenKey(threadId)) ?? '0', 10)
    return new Date(last.created_at).getTime() > lastSeen
  })()

  useEffect(() => {
    if (isOpen && threadId && messages.length > 0) {
      localStorage.setItem(lastSeenKey(threadId), Date.now().toString())
    }
    if (isOpen) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [isOpen, threadId, messages.length])

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post('/api/v1/support/threads', { name, email, subject, message })
      return res.data as Thread
    },
    onSuccess: (thread) => {
      setThreadId(thread.id)
      localStorage.setItem(THREAD_ID_KEY, thread.id)
      if (thread.guest_token) {
        setGuestToken(thread.guest_token)
        localStorage.setItem(GUEST_TOKEN_KEY, thread.guest_token)
      }
      setMessage('')
    },
  })

  const replyMutation = useMutation({
    mutationFn: (text: string) =>
      apiClient.post(`/api/v1/support/threads/${threadId}/messages`, {
        message: text,
        guest_token: guestToken ?? undefined,
      }),
    onSuccess: () => {
      setText('')
      queryClient.invalidateQueries({ queryKey: ['support-thread', threadId, guestToken] })
    },
  })

  const handleSend = () => {
    if (!text.trim()) return
    replyMutation.mutate(text.trim())
  }

  const handleStart = () => {
    if (!message.trim()) return
    if (!isAuthenticated() && (!name.trim() || !email.trim())) return
    createMutation.mutate()
  }

  const toggleOpen = () => setIsOpen((v) => !v)

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {isOpen && (
        <div className="flex h-[28rem] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between bg-orange-500 px-4 py-3">
            <span className="text-sm font-semibold text-white">Support</span>
            <button onClick={() => setIsOpen(false)} className="text-white/90 hover:text-white">
              ✕
            </button>
          </div>

          {!resolvedInitial ? (
            <div className="flex flex-1 items-center justify-center">
              <Spinner size="md" />
            </div>
          ) : !threadId ? (
            <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto p-4">
              <p className="text-sm text-gray-500">
                Have a question? Send us a message and we&apos;ll reply here.
              </p>
              {!isAuthenticated() && (
                <>
                  <input
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
                  />
                </>
              )}
              <input
                placeholder="Subject — optional"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
              />
              <textarea
                placeholder="Your message"
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
              />
              <button
                onClick={handleStart}
                disabled={
                  !message.trim() ||
                  (!isAuthenticated() && (!name.trim() || !email.trim())) ||
                  createMutation.isPending
                }
                className="rounded-lg bg-orange-500 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600 disabled:opacity-40"
              >
                {createMutation.isPending ? 'Sending...' : 'Send'}
              </button>
            </div>
          ) : (
            <>
              <div className="flex flex-1 flex-col gap-2 overflow-y-auto bg-gray-50 p-3">
                {messages.length === 0 ? (
                  <p className="text-center text-xs text-gray-400">No messages yet</p>
                ) : (
                  messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex flex-col gap-0.5 ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                          m.sender === 'user'
                            ? 'bg-orange-500 text-white'
                            : 'border border-gray-200 bg-white text-gray-800'
                        }`}
                      >
                        {m.message}
                      </div>
                      <span className="text-xs text-gray-400">
                        {m.sender === 'user' ? 'You' : 'Support'} ·{' '}
                        {new Date(m.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
                <div ref={bottomRef} />
              </div>
              <div className="flex gap-2 border-t border-gray-100 p-3">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  placeholder="Write a message..."
                  className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
                />
                <button
                  onClick={handleSend}
                  disabled={!text.trim() || replyMutation.isPending}
                  className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600 disabled:opacity-40"
                >
                  →
                </button>
              </div>
            </>
          )}
        </div>
      )}

      <button
        onClick={toggleOpen}
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-orange-500 text-2xl text-white shadow-lg transition-transform hover:scale-105 hover:bg-orange-600"
        aria-label="Support chat"
      >
        {isOpen ? '✕' : '💬'}
        {hasUnread && (
          <span className="absolute right-0 top-0 h-3.5 w-3.5 rounded-full bg-red-500 ring-2 ring-white" />
        )}
      </button>
    </div>
  )
}
