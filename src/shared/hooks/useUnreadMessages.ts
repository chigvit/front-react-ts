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
  // Відстежуємо які ID цей хук додав — щоб не чіпати ID від інших джерел (нові замовлення)
  const ownUnread = useRef<Set<string>>(new Set())

  // Гілки з уже призначеним виконавцем (accepted-переписка)
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

  // Для майстра гілки до прийняття виконавця не приходять у "мої"/"вхідні"
  // списки (там order.master_id ще порожній) — тож окремо дивимось усі відкриті
  // замовлення сайту і лишаємо ті, де сам майстер вже залишив відгук.
  const { data: publicOpenOrders } = useQuery({
    queryKey: ['unread-public-open-orders'],
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
          // майстер бачить лише свою власну гілку переписки
          if (responses.some((r: any) => r.master_id === myUserId)) {
            threads.push({ orderId: id })
          }
        } else {
          // замовник бачить окрему гілку з кожним майстром-кандидатом
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

  useEffect(() => {
    if (!data) return
    const nowUnread = new Set<string>()
    for (const { orderId, messages } of data) {
      if (messages.length === 0) continue
      const last = messages[messages.length - 1]
      const msgTime = new Date(last.created_at).getTime()
      const lastRead = getLastRead(orderId)
      if (last.role !== myRole && msgTime > lastRead) {
        nowUnread.add(orderId)
      }
    }

    // Додаємо нові непрочитані повідомлення
    for (const id of nowUnread) {
      if (!ownUnread.current.has(id)) addUnread(id)
    }
    // Знімаємо підсвітку тільки для тих, які цей хук сам додав і тепер прочитані
    for (const id of ownUnread.current) {
      if (!nowUnread.has(id)) removeUnread(id)
    }

    ownUnread.current = nowUnread
  }, [data, myRole, addUnread, removeUnread])
}
