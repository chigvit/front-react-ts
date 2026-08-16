'use client'

import { useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/client'
import { Spinner } from '@/shared/ui/Spinner'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'
const MAX_PHOTOS = 5

export const PortfolioTab = () => {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['portfolio-photos'],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/users/portfolio')
      return res.data.photos ?? []
    },
  })

  const photos: string[] = data ?? []

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('photo', file)
      const res = await apiClient.post('/api/v1/upload/portfolio', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return res.data.photos as string[]
    },
    onSuccess: (newPhotos) => {
      setError(null)
      queryClient.setQueryData(['portfolio-photos'], newPhotos)
    },
    onError: (err: any) => {
      setError(err.response?.data?.error ?? 'Failed to upload photo')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (url: string) => {
      const res = await apiClient.delete('/api/v1/upload/portfolio', { data: { url } })
      return res.data.photos as string[]
    },
    onSuccess: (newPhotos) => {
      setError(null)
      queryClient.setQueryData(['portfolio-photos'], newPhotos)
    },
    onError: (err: any) => {
      setError(err.response?.data?.error ?? 'Failed to delete photo')
    },
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    uploadMutation.mutate(file)
    e.target.value = ''
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-800">Portfolio</h2>
        <p className="text-sm text-gray-500">
          Up to {MAX_PHOTOS} photos of your completed work ({photos.length}/{MAX_PHOTOS})
        </p>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {photos.map((url) => (
          <div key={url} className="group relative z-0 aspect-square hover:z-30">
            <img
              src={`${API_URL}${url}`}
              alt="Portfolio"
              className="absolute inset-0 h-full w-full origin-center rounded-xl border border-gray-200 object-cover shadow-sm transition-transform duration-300 ease-out group-hover:scale-[2.2] group-hover:shadow-2xl"
            />
            <button
              type="button"
              onClick={() => deleteMutation.mutate(url)}
              disabled={deleteMutation.isPending}
              className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 disabled:opacity-100"
              aria-label="Remove photo"
            >
              ×
            </button>
          </div>
        ))}

        {photos.length < MAX_PHOTOS && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadMutation.isPending}
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-gray-300 text-gray-400 transition-colors hover:border-orange-400 hover:text-orange-500 disabled:opacity-50"
          >
            {uploadMutation.isPending ? (
              <Spinner size="sm" />
            ) : (
              <>
                <span className="text-2xl leading-none">+</span>
                <span className="text-xs font-medium">Add photo</span>
              </>
            )}
          </button>
        )}
      </div>

      <p className="text-xs text-gray-400">JPEG, PNG, WebP up to 5MB</p>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}
