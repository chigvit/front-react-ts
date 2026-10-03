const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'

// Avatars are either a relative path we serve ourselves (/static/avatars/..)
// or a full external URL (e.g. a Google account picture) — only the former
// needs the API host prepended.
export const getAvatarUrl = (avatarUrl?: string | null): string | null => {
  if (!avatarUrl) return null
  if (/^https?:\/\//i.test(avatarUrl)) return avatarUrl
  return `${API_URL}${avatarUrl}`
}
