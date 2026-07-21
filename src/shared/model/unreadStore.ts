import { create } from 'zustand'

interface UnreadStore {
  unreadOrderIds: Set<string>
  setUnread: (ids: Set<string>) => void
  removeUnread: (orderId: string) => void
  clearUnread: () => void
}

export const useUnreadStore = create<UnreadStore>((set, get) => ({
  unreadOrderIds: new Set(),
  setUnread: (ids) => set({ unreadOrderIds: new Set(ids) }),
  removeUnread: (orderId) => {
    const next = new Set(get().unreadOrderIds)
    next.delete(orderId)
    set({ unreadOrderIds: next })
  },
  clearUnread: () => set({ unreadOrderIds: new Set() }),
}))
