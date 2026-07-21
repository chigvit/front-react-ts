import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/client'
import { getLastRead } from '@/shared/lib/unreadMessages'
import { useUnreadStore } from '@/shared/model/unreadStore'

export function useUnreadMessages(
  orders: any[],
  myRole: 'customer' | 'master',
) {
  const setUnread = useUnreadStore((s) => s.setUnread)

  const activeIds = orders
    .filter(
      (o) =>
        o.master_id &&
        (o.status === 'PENDING' || o.status === 'IN_PROGRESS'),
    )
    .map((o) => o.id as string)

  const { data } = useQuery({
    queryKey: ['unread-check', activeIds.join(',')],
    queryFn: async () => {
      const results = await Promise.all(
        activeIds.map((id) =>
          apiClient
            .get(`/api/v1/orders/${id}/messages`)
            .then((r) => ({ id, messages: r.data.messages ?? [] }))
            .catch(() => ({ id, messages: [] as any[] })),
        ),
      )
      return results
    },
    enabled: activeIds.length > 0,
    refetchInterval: 30_000,
  })

  useEffect(() => {
    if (!data) return
    const unread = new Set<string>()
    for (const { id, messages } of data) {
      if (messages.length === 0) continue
      const last = messages[messages.length - 1]
      const msgTime = new Date(last.created_at).getTime()
      const lastRead = getLastRead(id)
      if (last.role !== myRole && msgTime > lastRead) {
        unread.add(id)
      }
    }
    setUnread(unread)
  }, [data, myRole, setUnread])
}
