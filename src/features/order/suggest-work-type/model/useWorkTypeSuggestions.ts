import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/client'
import { useDebounce } from '@/shared/hooks/useDebounce'

export interface WorkTypeSuggestion {
  work_type_id: number
  category_id: number
  name: string
  category_name: string
  score: number
}

const MIN_TEXT_LENGTH = 10

// Suggests work types for the order text (local AI on the backend). The hint
// is optional: on any error it just returns an empty list.
export function useWorkTypeSuggestions(text: string) {
  const debounced = useDebounce(text.trim(), 700)

  const { data, isFetching } = useQuery({
    queryKey: ['work-type-suggestions', debounced],
    queryFn: async (): Promise<WorkTypeSuggestion[]> => {
      const res = await apiClient.post('/api/v1/orders/suggest-work-type', { text: debounced })
      return res.data.suggestions ?? []
    },
    enabled: debounced.length >= MIN_TEXT_LENGTH,
    staleTime: Infinity,
    retry: false,
  })

  return {
    suggestions: debounced.length >= MIN_TEXT_LENGTH ? data ?? [] : [],
    isLoading: isFetching,
  }
}
