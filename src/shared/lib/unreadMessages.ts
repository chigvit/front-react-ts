const PREFIX = 'lastRead_'

export function getLastRead(orderId: string): number {
  if (typeof window === 'undefined') return 0
  return parseInt(localStorage.getItem(PREFIX + orderId) ?? '0', 10)
}

export function markAsRead(orderId: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(PREFIX + orderId, Date.now().toString())
}
