'use client'

import { useRef, useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/client'

interface Props {
  orderId: string
  myRole: 'customer' | 'master'
  masterId?: string
  // Initial text of the response to the order — shown as the first message
  // in the same frame, so we don't duplicate the bubble separately above the chat.
  leadingMessage?: string
}

export const OrderChat = ({ orderId, myRole, masterId, leadingMessage }: Props) => {
  const queryClient = useQueryClient()
  const [text, setText] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  const { data: messagesData } = useQuery({
    queryKey: ['order-messages', orderId, masterId ?? null],
    queryFn: async () => {
      const res = await apiClient.get(`/api/v1/orders/${orderId}/messages`, {
        params: masterId ? { master_id: masterId } : undefined,
      })
      return res.data.messages ?? []
    },
    refetchInterval: 10_000,
  })

  const messages = messagesData ?? []

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMutation = useMutation({
    mutationFn: (text: string) =>
      apiClient.post(`/api/v1/orders/${orderId}/messages`, {
        text,
        ...(masterId ? { master_id: masterId } : {}),
      }),
    onSuccess: () => {
      setText('')
      queryClient.invalidateQueries({ queryKey: ['order-messages', orderId, masterId ?? null] })
    },
  })

  const handleSend = () => {
    if (!text.trim()) return
    sendMutation.mutate(text.trim())
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Messages */}
      <div className="flex max-h-64 flex-col gap-2 overflow-y-auto rounded-lg border border-gray-100 bg-gray-50 p-3">
        {leadingMessage && (
          <div className="flex flex-col items-end gap-0.5">
            <div className="max-w-[80%] rounded-xl px-3 py-2 text-sm bg-orange-500 text-white">
              {leadingMessage}
            </div>
          </div>
        )}
        {messages.length === 0 && !leadingMessage ? (
          <p className="text-center text-xs text-gray-400">No messages yet</p>
        ) : (
          messages.map((msg: any) => {
            const isMe = msg.role === myRole
            return (
              <div
                key={msg.id}
                className={`flex flex-col gap-0.5 ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                    isMe
                      ? 'bg-orange-500 text-white'
                      : 'bg-white border border-gray-200 text-gray-800'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-xs text-gray-400">
                  {msg.role === 'master' ? 'Master' : 'Customer'} ·{' '}
                  {new Date(msg.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input field */}
      <div className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder="Write a message..."
          className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || sendMutation.isPending}
          className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 transition-colors disabled:opacity-40"
        >
          →
        </button>
      </div>
    </div>
  )
}
