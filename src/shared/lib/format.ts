// First half of a UK postcode ("LS1 4DY" -> "LS1"): enough to show the area
// without revealing the exact address. The second half is always 3 chars
// (digit + 2 letters), so it can be cut off even when there's no space.
export const postcodeArea = (postcode?: string | null): string => {
  const pc = (postcode ?? '').trim().toUpperCase()
  if (!pc) return ''
  const [first, second] = pc.split(/\s+/)
  if (second) return first
  return pc.length > 4 ? pc.slice(0, -3) : pc
}
