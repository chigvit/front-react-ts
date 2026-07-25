const KEY = 'seenIncomingOrderIds'

export function getSeenOrderIds(): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch {
    return new Set()
  }
}

export function markOrderSeen(orderId: string): void {
  if (typeof window === 'undefined') return
  const seen = getSeenOrderIds()
  seen.add(orderId)
  localStorage.setItem(KEY, JSON.stringify([...seen]))
}
