import { useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/client'
import { getLastRead } from '@/shared/lib/unreadMessages'
import { useUnreadStore } from '@/shared/model/unreadStore'
import { useAuthStore } from '@/entities/user/model/userStore'

interface Thread {
  orderId: string
  masterId?: string
}

export function useUnreadMessages(
  orders: any[],
  myRole: 'customer' | 'master',
) {
  const addUnread = useUnreadStore((s) => s.addUnread)
  const removeUnread = useUnreadStore((s) => s.removeUnread)
  const myUserId = useAuthStore((s) => s.user?.id)
  // Track which IDs this hook added — so we don't touch IDs from other sources (new orders)
  const ownUnread = useRef<Set<string>>(new Set())

  // Threads with an already-assigned master (accepted correspondence)
  const directThreads: Thread[] = orders
    .filter(
      (o) =>
        o.master_id &&
        (o.status === 'PENDING' || o.status === 'IN_PROGRESS'),
    )
    .map((o) => ({ orderId: o.id as string }))

  const openOrderIds = orders
    .filter((o) => o.status === 'OPEN')
    .map((o) => o.id as string)

  // For a master, threads before a master is accepted don't show up in the
  // "my"/"incoming" lists (order.master_id is still empty there) — so we
  // separately look at all open orders site-wide and keep the ones where
  // this master has already left a response.
  const { data: publicOpenOrders } = useQuery({
    queryKey: ['public-open-orders'],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/orders')
      return res.data.orders ?? []
    },
    enabled: myRole === 'master' && !!myUserId,
    staleTime: 30_000,
    refetchInterval: 30_000,
  })

  const candidateOrderIds: string[] =
    myRole === 'master'
      ? (publicOpenOrders ?? []).map((o: any) => o.id as string)
      : openOrderIds

  const { data: candidateThreads } = useQuery({
    queryKey: ['unread-candidate-threads', myRole, candidateOrderIds.join(',')],
    queryFn: async () => {
      const results = await Promise.all(
        candidateOrderIds.map((id) =>
          apiClient
            .get(`/api/v1/orders/${id}/responses`)
            .then((r) => ({ id, responses: r.data.responses ?? [] }))
            .catch(() => ({ id, responses: [] as any[] })),
        ),
      )
      const threads: Thread[] = []
      for (const { id, responses } of results) {
        if (myRole === 'master') {
          // a master sees only their own correspondence thread
          if (responses.some((r: any) => r.master_id === myUserId)) {
            threads.push({ orderId: id })
          }
        } else {
          // a customer sees a separate thread with each candidate master
          for (const r of responses) {
            threads.push({ orderId: id, masterId: r.master_id })
          }
        }
      }
      return threads
    },
    enabled: candidateOrderIds.length > 0,
    refetchInterval: 30_000,
  })

  const threads: Thread[] = [...directThreads, ...(candidateThreads ?? [])]
  const threadsKey = threads.map((t) => `${t.orderId}:${t.masterId ?? ''}`).join(',')

  const { data } = useQuery({
    queryKey: ['unread-check', threadsKey],
    queryFn: async () => {
      const results = await Promise.all(
        threads.map((t) =>
          apiClient
            .get(`/api/v1/orders/${t.orderId}/messages`, {
              params: t.masterId ? { master_id: t.masterId } : undefined,
            })
            .then((r) => ({ orderId: t.orderId, messages: r.data.messages ?? [] }))
            .catch(() => ({ orderId: t.orderId, messages: [] as any[] })),
        ),
      )
      return results
    },
    enabled: threads.length > 0,
    refetchInterval: 30_000,
  })

  // If there are no more correspondence threads (e.g. the order was deleted) —
  // the query above is disabled and data stays undefined; without this the
  // stale "unread" marker would hang around forever.
  const effectiveData = threads.length === 0 ? [] : data

  useEffect(() => {
    if (!effectiveData) return
    const nowUnread = new Set<string>()
    for (const { orderId, messages } of effectiveData) {
      if (messages.length === 0) continue
      const last = messages[messages.length - 1]
      const msgTime = new Date(last.created_at).getTime()
      const lastRead = getLastRead(orderId)
      if (last.role !== myRole && msgTime > lastRead) {
        nowUnread.add(orderId)
      }
    }

    // Add newly unread messages
    for (const id of nowUnread) {
      if (!ownUnread.current.has(id)) addUnread(id)
    }
    // Clear the highlight only for the ones this hook itself added and that are now read
    for (const id of ownUnread.current) {
      if (!nowUnread.has(id)) removeUnread(id)
    }

    ownUnread.current = nowUnread
  }, [effectiveData, myRole, addUnread, removeUnread])
}
