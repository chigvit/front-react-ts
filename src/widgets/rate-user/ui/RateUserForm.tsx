'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/client'
import { Button } from '@/shared/ui/Button'

interface Props {
  ratedId: string
  // Кого оцінюємо — для тексту в формі ("майстра" / "замовника")
  label: string
  onDone?: () => void
}

function Star({ filled, onClick, onMouseEnter, onMouseLeave }: {
  filled: boolean
  onClick: () => void
  onMouseEnter: () => void
  onMouseLeave: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="p-0.5"
    >
      <svg
        className={`h-7 w-7 transition-colors ${filled ? 'text-yellow-400' : 'text-gray-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    </button>
  )
}

// Форма виставлення оцінки (1-5 зірок + коментар) будь-якому користувачу —
// однаково використовується і для "замовник оцінює майстра", і для
// "майстер оцінює замовника", різниця лише в ratedId/label з боку виклику.
export const RateUserForm = ({ ratedId, label, onDone }: Props) => {
  const queryClient = useQueryClient()
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const rateMutation = useMutation({
    mutationFn: () => apiClient.post('/api/v1/ratings', { rated_id: ratedId, rating, comment }),
    onSuccess: () => {
      setSubmitted(true)
      setError(null)
      queryClient.invalidateQueries({ queryKey: ['master-ratings', ratedId] })
      onDone?.()
    },
    onError: (err: any) => {
      const status = err?.response?.status
      setError(
        status === 409
          ? 'Ви вже залишали оцінку.'
          : err?.response?.data?.error ?? 'Не вдалося надіслати оцінку. Спробуйте ще раз.'
      )
    },
  })

  if (submitted) {
    return <p className="text-sm text-green-600">✓ Дякуємо за оцінку!</p>
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium text-gray-700">Оцініть {label}</p>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(n => (
          <Star
            key={n}
            filled={n <= (hovered || rating)}
            onClick={() => setRating(n)}
            onMouseEnter={() => setHovered(n)}
            onMouseLeave={() => setHovered(0)}
          />
        ))}
      </div>
      <textarea
        rows={2}
        placeholder="Коментар (необов'язково)..."
        value={comment}
        onChange={e => setComment(e.target.value)}
        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none"
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button
        onClick={() => rateMutation.mutate()}
        loading={rateMutation.isPending}
        disabled={rating === 0}
        size="sm"
        className="self-start"
      >
        Надіслати оцінку
      </Button>
    </div>
  )
}
