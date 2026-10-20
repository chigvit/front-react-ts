'use client'

import { cn } from '@/shared/lib/cn'
import { useWorkTypeSuggestions } from '../model/useWorkTypeSuggestions'

interface Props {
  text: string
  selectedWorkTypeId: number | null
  onSelect: (workTypeId: number) => void
}

export const WorkTypeSuggestions = ({ text, selectedWorkTypeId, onSelect }: Props) => {
  const { suggestions, isLoading } = useWorkTypeSuggestions(text)

  if (suggestions.length === 0) {
    return isLoading ? <p className="text-xs text-gray-400">Finding the right service…</p> : null
  }

  // Already matches the chosen service — nothing to suggest.
  if (suggestions[0].work_type_id === selectedWorkTypeId) return null

  return (
    <div className="rounded-lg border border-orange-100 bg-orange-50/60 px-3 py-2">
      <p className="mb-2 text-xs font-medium text-gray-600">
        {selectedWorkTypeId ? 'Does this sound more like:' : 'Suggested service:'}
      </p>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((s) => (
          <button
            key={s.work_type_id}
            type="button"
            onClick={() => onSelect(s.work_type_id)}
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
              s.work_type_id === selectedWorkTypeId
                ? 'border-orange-500 bg-orange-500 text-white'
                : 'border-orange-200 bg-white text-orange-600 hover:border-orange-400',
            )}
          >
            {s.name}
            <span className="ml-1 font-normal text-gray-400">· {s.category_name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
